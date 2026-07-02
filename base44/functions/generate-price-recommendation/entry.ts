// Deno backend function. Reads OPENAI_API_KEY from Base44 Secrets — never
// hard-coded, never logged, never returned to the client.
import { createClientFromRequest } from "npm:@base44/sdk";
import { buildMetricsSnapshot } from "./pricingEngine.js";
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildFallbackRecommendation,
  validateAiResponse,
  RESPONSE_JSON_SCHEMA,
} from "./aiRecommendationValidation.js";

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = 20000;
const RECOMMENDATION_VALIDITY_DAYS = 7;

async function callOpenAI(snapshot, propertyContext, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(snapshot, propertyContext) },
        ],
        response_format: { type: "json_schema", json_schema: RESPONSE_JSON_SCHEMA },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, reason: `openai_http_${response.status}` };
    }

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return { ok: false, reason: "openai_empty_response" };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, reason: "openai_invalid_json" };
    }

    const validation = validateAiResponse(parsed, snapshot);
    if (!validation.valid) {
      return { ok: false, reason: `validation_failed:${validation.reason}` };
    }

    return { ok: true, data: validation.data };
  } catch (error) {
    const reason = error?.name === "AbortError" ? "openai_timeout" : "openai_network_error";
    return { ok: false, reason };
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const [user, body] = await Promise.all([base44.auth.me(), req.json()]);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId } = body;
    if (!propertyId || typeof propertyId !== "string") {
      return Response.json({ error: "propertyId is required" }, { status: 400 });
    }

    // Always re-fetch server-side; never trust metrics sent by the client.
    // .get() may resolve null/undefined OR throw on a missing id depending
    // on SDK version, so normalize both to a clean 404 rather than leaking
    // a raw SDK error through the outer catch below.
    const property = await base44.asServiceRole.entities.UserProperty.get(propertyId).catch(() => null);
    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.userId === user.id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const snapshot = buildMetricsSnapshot(property, {});

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    let recommendation;
    let source = "fallback";
    let aiModel = null;
    let fallbackReason = apiKey ? null : "missing_api_key";

    if (apiKey) {
      const result = await callOpenAI(snapshot, property, apiKey);
      if (result.ok) {
        recommendation = result.data;
        source = "ai";
        aiModel = OPENAI_MODEL;
      } else {
        fallbackReason = result.reason;
      }
    }

    if (!recommendation) {
      recommendation = buildFallbackRecommendation(snapshot);
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + RECOMMENDATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

    const record = await base44.asServiceRole.entities.PriceRecommendation.create({
      userId: property.userId,
      propertyId,
      status: "pending_review",
      source,
      aiModel,
      confidence: recommendation.confidence,
      inputMetrics: snapshot,
      dataQualityScore: snapshot.dataQualityScore,
      dataQualityFlags: snapshot.dataQualityFlags,
      recommendedPriceMin: snapshot.priceFloor,
      recommendedPriceMax: snapshot.priceCeiling,
      currency: snapshot.currency,
      summaryAr: recommendation.summaryAr,
      actionsAr: recommendation.actionsAr,
      caveatsAr: recommendation.caveatsAr,
      citedMetricKeys: recommendation.citedMetricKeys,
      generatedAt: now.toISOString(),
      validUntil: validUntil.toISOString(),
      statusHistory: [
        { status: "pending_review", byUserId: "system", at: now.toISOString(), note: fallbackReason ? `generated:${source}:${fallbackReason}` : `generated:${source}` },
      ],
    });

    return Response.json({ success: true, recommendation: record });
  } catch (error) {
    return Response.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
});
