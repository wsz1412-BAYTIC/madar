// Deno backend function: AI Investment Consultant.
//
// Access is enforced HERE, server-side, from the subscription row — never
// from anything the client sends:
//   • Pro plan      → annual lease analysis only (purchase → Business upsell)
//   • Business plan → lease + purchase/new-investment analysis
//   • lower plans   → blocked with a Pro upsell
//
// Numbers come from the deterministic Agree Zone module (deal strength, net
// revenue after platform fees, ROI, rent/price gap, negotiation probability,
// counter-offer, verdict). Madar AI (OpenAI) writes ONLY the Arabic
// STR-potential narrative, validated so it cannot introduce numbers that are
// not in the computed analysis; when the AI is unavailable a deterministic
// fallback narrative is used. Every call is logged to AiUsageLog.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  resolveInvestmentAccess,
  validateDealInput,
  analyzeDeal,
  buildNarrativeSystemPrompt,
  buildNarrativeUserPrompt,
  buildFallbackNarrative,
  validateNarrative,
  NARRATIVE_JSON_SCHEMA,
} from "./investmentAnalysis.js";
import { parseFeeOverrides, PLATFORM_FEES_CONFIG_KEY } from "./platformFees.js";

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = 15000;

async function callNarrative(input, analysis, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.3,
        messages: [
          { role: "system", content: buildNarrativeSystemPrompt() },
          { role: "user", content: buildNarrativeUserPrompt(input, analysis) },
        ],
        response_format: { type: "json_schema", json_schema: NARRATIVE_JSON_SCHEMA },
      }),
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, reason: `openai_http_${response.status}` };
    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return { ok: false, reason: "openai_empty_response" };
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, reason: "openai_invalid_json" };
    }
    const narrative = validateNarrative(parsed, analysis);
    if (!narrative) return { ok: false, reason: "narrative_validation_failed" };
    return {
      ok: true,
      narrative,
      usage: {
        promptTokens: body?.usage?.prompt_tokens ?? null,
        completionTokens: body?.usage?.completion_tokens ?? null,
      },
    };
  } catch (error) {
    return { ok: false, reason: error?.name === "AbortError" ? "openai_timeout" : "openai_network_error" };
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "analyze";
    const sr = base44.asServiceRole;
    const now = new Date();

    const subs = await sr.entities.UserSubscription.filter({ userId: user.id });
    const sub = subs && subs.length > 0 ? subs[0] : null;

    const logUsage = async (plan, status, detail, usage = {}) => {
      try {
        await sr.entities.AiUsageLog.create({
          userId: user.id,
          functionName: "ai-investment-consultant",
          plan,
          status,
          model: status === "success" ? OPENAI_MODEL : null,
          promptTokens: usage.promptTokens ?? null,
          completionTokens: usage.completionTokens ?? null,
          detail: detail || null,
          createdAt: now.toISOString(),
        });
      } catch (e) {
        console.error("AiUsageLog write failed", e?.message);
      }
    };

    if (action === "list") {
      const rows = await sr.entities.InvestmentAnalysis.filter({ userId: user.id });
      return Response.json({ success: true, analyses: rows || [] });
    }

    if (action !== "analyze") {
      return Response.json(
        { error: "إجراء غير معروف", error_en: "Unknown action" },
        { status: 400 }
      );
    }

    const analysisType = body.analysisType;
    const access = resolveInvestmentAccess(sub || {}, analysisType, now);
    if (!access.allowed) {
      await logUsage(access.plan, "blocked", `plan_gate:${analysisType}`);
      return Response.json(
        { error: access.error.ar, error_en: access.error.en, upgrade: access.upgrade },
        { status: 403 }
      );
    }

    const validated = validateDealInput(analysisType, body.input || {});
    if (!validated.ok) {
      return Response.json(
        { error: validated.error.ar, error_en: validated.error.en },
        { status: 400 }
      );
    }

    const feeOverrides = parseFeeOverrides(Deno.env.get(PLATFORM_FEES_CONFIG_KEY));
    const analysis = analyzeDeal(validated.input, { feeOverrides });

    // Madar AI narrative — optional, never blocking, never inventing numbers.
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    let strNarrativeAr = null;
    let source = "fallback";
    let usage = {};
    let fallbackReason = apiKey ? null : "missing_api_key";
    if (apiKey) {
      const result = await callNarrative(validated.input, analysis, apiKey);
      if (result.ok) {
        strNarrativeAr = result.narrative;
        source = "ai";
        usage = result.usage;
      } else {
        fallbackReason = result.reason;
      }
    }
    if (!strNarrativeAr) strNarrativeAr = buildFallbackNarrative(analysis);

    const record = await sr.entities.InvestmentAnalysis.create({
      userId: user.id,
      analysisType,
      input: validated.input,
      analysis: { ...analysis, strNarrativeAr, source, createdAt: now.toISOString() },
      source,
      plan: access.plan,
      createdAt: now.toISOString(),
    });

    await logUsage(access.plan, source === "ai" ? "success" : "fallback", fallbackReason, usage);

    return Response.json({
      success: true,
      analysis: { ...analysis, strNarrativeAr, source, createdAt: now.toISOString(), id: record?.id ?? null },
    });
  } catch (error) {
    console.error("ai-investment-consultant error", error);
    return Response.json(
      { error: "حدث خطأ غير متوقع — حاول مرة أخرى.", error_en: "Unexpected error — please try again." },
      { status: 500 }
    );
  }
});
