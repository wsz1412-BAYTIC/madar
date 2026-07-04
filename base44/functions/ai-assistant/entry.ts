// Deno backend function: the Madar AI assistant with COST-SAFE, server-side
// quota enforcement. The floating widget previously called Core.InvokeLLM
// straight from the browser with no limits at all — every question now goes
// through here instead:
//   • daily question limits per plan (5/25/75/250), reset on the Riyadh day
//   • the Growth trial gets 35 questions TOTAL
//   • hard word caps on answers (200/350/500/700)
//   • memory (rolling window, private per user/property via AiConversation
//     RLS) only for Growth/Pro
//   • professional bilingual upgrade message + 429 when a limit is reached
// A user can never lift their own limits: quota fields live on
// UserSubscription (admin-only writes) and are updated only here.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  resolveAiPolicy,
  assessAiQuota,
  buildUsageIncrement,
  capWords,
} from "./aiUsagePolicy.js";

const MEMORY_TURNS = 10; // rolling window kept per conversation

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const question = String(body.question || "").trim();
    const propertyId = body.propertyId ? String(body.propertyId) : null;
    if (!question) {
      return Response.json({ error: "question required" }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const now = new Date();

    const subs = await sr.entities.UserSubscription.filter({ userId: user.id });
    const sub = subs && subs.length > 0 ? subs[0] : null;

    // ── Quota gate (server-side, the only authority) ──
    const quota = assessAiQuota(sub || {}, sub || {}, now);
    if (!quota.allowed) {
      return Response.json(
        {
          error: quota.error.ar,
          error_en: quota.error.en,
          upgrade: true,
          remaining: 0,
          resetAt: quota.resetAt || null,
          plan: quota.policy.plan,
        },
        { status: 429 }
      );
    }

    // ── Private memory (Growth/Pro only), scoped per user + property ──
    let conversation = null;
    let history = [];
    if (quota.policy.memory) {
      const rows = await sr.entities.AiConversation.filter({
        userId: user.id,
        ...(propertyId ? { propertyId } : {}),
      });
      conversation = rows && rows.length > 0 ? rows[0] : null;
      history = conversation?.messages || [];
    }

    // ── Model call with an explicit word budget ──
    const langHint = body.lang === "ar" ? "Answer in Arabic." : "Answer in the user's language.";
    const prompt = [
      `You are Madar's short-term-rental assistant for hosts in Saudi Arabia.`,
      `Hard limit: answer in at most ${quota.policy.maxWords} words. Be practical and specific. ${langHint}`,
      ...history.slice(-MEMORY_TURNS).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`),
      `User: ${question}`,
    ].join("\n");

    let answer;
    try {
      const res = await sr.integrations.Core.InvokeLLM({ prompt });
      answer = typeof res === "string" ? res : res?.response || res?.text || JSON.stringify(res);
    } catch (e) {
      return Response.json(
        {
          error: "تعذر الوصول إلى المساعد حاليًا — حاول مرة أخرى.",
          error_en: "The assistant is unreachable right now — please try again.",
          detail: e.message,
        },
        { status: 502 }
      );
    }
    answer = capWords(answer, quota.policy.maxWords);

    // ── Persist usage AFTER a successful answer (failed calls don't consume) ──
    const increment = buildUsageIncrement(sub || {}, sub || {}, now);
    if (sub) await sr.entities.UserSubscription.update(sub.id, increment);

    // ── Update memory window ──
    if (quota.policy.memory) {
      const messages = [
        ...history,
        { role: "user", content: question, at: now.toISOString() },
        { role: "assistant", content: answer, at: now.toISOString() },
      ].slice(-MEMORY_TURNS * 2);
      if (conversation) {
        await sr.entities.AiConversation.update(conversation.id, { messages });
      } else {
        await sr.entities.AiConversation.create({ userId: user.id, propertyId, messages });
      }
    }

    return Response.json({
      answer,
      remaining: quota.remaining,
      limit: quota.policy.questionsLimit,
      window: quota.policy.window,
      maxWords: quota.policy.maxWords,
      memory: quota.policy.memory,
      plan: quota.policy.plan,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
