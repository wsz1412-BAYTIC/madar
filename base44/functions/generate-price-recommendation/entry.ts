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
import {
  parseFeeOverrides,
  resolvePlatformFee,
  netRevenueAfterFees,
  projectRevenueImpact,
  PLATFORM_FEES_CONFIG_KEY,
} from "./platformFees.js";

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

    // Platform-specific fee rate (configurable via the PLATFORM_FEES_JSON
    // secret; bundled defaults are labeled estimates) drives both the
    // metrics snapshot and the fee-only net revenue figures below.
    const feeOverrides = parseFeeOverrides(Deno.env.get(PLATFORM_FEES_CONFIG_KEY));
    const fee = resolvePlatformFee(property.platform, feeOverrides);
    const snapshot = buildMetricsSnapshot(property, { platformFeeRate: fee.rate });

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

    // Deterministic price point + fee-only net revenue + straight-line
    // revenue projection. Never AI-invented: pure math over the snapshot.
    const recommendedPrice =
      Number.isFinite(snapshot.priceFloor) && Number.isFinite(snapshot.priceCeiling)
        ? Math.round(((snapshot.priceFloor + snapshot.priceCeiling) / 2) * 100) / 100
        : (Number.isFinite(property.nightlyPrice) ? property.nightlyPrice : snapshot.adr);
    const currentPrice = Number.isFinite(property.nightlyPrice) ? property.nightlyPrice : snapshot.adr;
    const monthlyNetAfterFees = netRevenueAfterFees(snapshot.grossRevenue, property.platform, feeOverrides);
    const revenueProjection = projectRevenueImpact({
      currentPrice,
      recommendedPrice,
      occupancyRate: snapshot.occupancyRate,
      availableNights: snapshot.availableNights,
      platform: property.platform,
      overrides: feeOverrides,
    });

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
      recommendedPrice: Number.isFinite(recommendedPrice) ? recommendedPrice : null,
      platformFeeRate: fee.rate,
      platformFeeEstimated: fee.estimated,
      netRevenueAfterFees: monthlyNetAfterFees?.net ?? null,
      revenueProjection: revenueProjection || null,
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

    // Uniform AI usage audit trail (userId, function, plan, status, tokens
    // when the provider reports them).
    try {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ userId: property.userId });
      await base44.asServiceRole.entities.AiUsageLog.create({
        userId: property.userId,
        functionName: "generate-price-recommendation",
        plan: String(subs?.[0]?.planName || "free").toLowerCase(),
        status: source === "ai" ? "success" : "fallback",
        model: aiModel,
        promptTokens: null,
        completionTokens: null,
        detail: fallbackReason || null,
        createdAt: now.toISOString(),
      });
    } catch (e) {
      console.error("AiUsageLog write failed", e?.message);
    }

    return Response.json({ success: true, recommendation: record });
  } catch (error) {
    console.error("generate-price-recommendation error", error);
    return Response.json(
      { error: "حدث خطأ غير متوقع — حاول مرة أخرى.", error_en: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
});
