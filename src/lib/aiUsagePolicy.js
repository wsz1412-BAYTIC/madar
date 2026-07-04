// Cost-safe AI usage policy for the Madar assistant. DAILY limits.
//
// Pure — mirrored into base44/functions/ai-assistant/ and enforced THERE
// (the client widget only renders remaining quota). Limits reset daily on
// the Asia/Riyadh calendar day (UTC+3, no DST). The Growth trial gets a
// TOTAL budget for the whole trial instead of a daily one.

import { assessTrialState, resolveEntitlementPlan } from './trialManagement.js';

export const AI_LIMITS = Object.freeze({
  free: { questionsPerDay: 5, maxWords: 200, memory: false },
  basic: { questionsPerDay: 25, maxWords: 350, memory: false },
  growth: { questionsPerDay: 75, maxWords: 500, memory: true },
  pro: { questionsPerDay: 250, maxWords: 700, memory: true },
  // Business/custom limits are set by admin approval — default to pro's until then.
  business: { questionsPerDay: 250, maxWords: 700, memory: true },
});

// The 14-day Growth trial gets 35 questions TOTAL (not per day), 350 words.
export const TRIAL_AI_BUDGET = Object.freeze({ questionsTotal: 35, maxWords: 350, memory: false });

// Asia/Riyadh is fixed UTC+3 (no DST) — a plain offset is exact.
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Calendar-day key in Riyadh time, e.g. "2026-07-04". Daily quotas key on this. */
export function riyadhDayKey(now = new Date()) {
  return new Date(now.getTime() + RIYADH_OFFSET_MS).toISOString().slice(0, 10);
}

/** Next midnight in Riyadh (as a real instant) — when the daily quota resets. */
export function nextRiyadhMidnight(now = new Date()) {
  const shifted = new Date(now.getTime() + RIYADH_OFFSET_MS);
  const next = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + 1);
  return new Date(next - RIYADH_OFFSET_MS);
}

/**
 * Resolve the AI policy that applies to this subscription right now.
 * Trial accounts get the trial budget; everyone else gets their effective
 * entitlement plan's daily limits (expired trial → free).
 */
export function resolveAiPolicy(subscription, now = new Date()) {
  const { state } = assessTrialState(subscription, now);
  if (state === 'trial_active') {
    return { plan: 'growth_trial', window: 'trial', questionsLimit: TRIAL_AI_BUDGET.questionsTotal, maxWords: TRIAL_AI_BUDGET.maxWords, memory: TRIAL_AI_BUDGET.memory };
  }
  const plan = resolveEntitlementPlan(subscription, now);
  const limits = AI_LIMITS[plan] || AI_LIMITS.free;
  return { plan, window: 'day', questionsLimit: limits.questionsPerDay, maxWords: limits.maxWords, memory: limits.memory };
}

/**
 * May this subscription ask one more AI question right now?
 * `usage` comes from the subscription record: { aiUsageDayKey,
 * aiUsageCountToday, aiTrialQuestionsUsed }. Stale day keys count as zero —
 * that IS the daily reset (no cron needed).
 * Returns { allowed, remaining, policy, resetAt?, error?{en,ar} }.
 */
export function assessAiQuota(subscription, usage = {}, now = new Date()) {
  const policy = resolveAiPolicy(subscription, now);

  if (policy.window === 'trial') {
    const used = Number(usage.aiTrialQuestionsUsed) || 0;
    const remaining = Math.max(0, policy.questionsLimit - used);
    if (remaining <= 0) {
      return { allowed: false, remaining: 0, policy, error: upgradeMessage('trial_exhausted') };
    }
    return { allowed: true, remaining: remaining - 1, policy };
  }

  const today = riyadhDayKey(now);
  const usedToday = usage.aiUsageDayKey === today ? Number(usage.aiUsageCountToday) || 0 : 0;
  const remaining = Math.max(0, policy.questionsLimit - usedToday);
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, policy, resetAt: nextRiyadhMidnight(now).toISOString(), error: upgradeMessage('daily_exhausted', policy.plan) };
  }
  return { allowed: true, remaining: remaining - 1, policy };
}

/** Fields to write back after a successful question. */
export function buildUsageIncrement(subscription, usage = {}, now = new Date()) {
  const policy = resolveAiPolicy(subscription, now);
  if (policy.window === 'trial') {
    return { aiTrialQuestionsUsed: (Number(usage.aiTrialQuestionsUsed) || 0) + 1 };
  }
  const today = riyadhDayKey(now);
  const usedToday = usage.aiUsageDayKey === today ? Number(usage.aiUsageCountToday) || 0 : 0;
  return { aiUsageDayKey: today, aiUsageCountToday: usedToday + 1 };
}

/** Professional, bilingual upgrade prompts shown when a limit is reached. */
export function upgradeMessage(kind, plan = 'free') {
  if (kind === 'trial_exhausted') {
    return {
      en: 'You have used all 35 trial questions. Upgrade to Growth for 75 questions every day, or Pro for 250 — your data and history stay exactly where they are.',
      ar: 'استخدمت جميع أسئلة التجربة (35). قم بالترقية إلى «نمو» لتحصل على 75 سؤالًا يوميًا، أو «احترافية» لـ250 — تبقى بياناتك وسجلّك كما هي تمامًا.',
    };
  }
  const next = plan === 'free' ? { en: 'Basic (25/day)', ar: '«الأساسية» (25/يوم)' }
    : plan === 'basic' ? { en: 'Growth (75/day)', ar: '«نمو» (75/يوم)' }
    : { en: 'Pro (250/day)', ar: '«احترافية» (250/يوم)' };
  return {
    en: `You've reached today's question limit. It resets at midnight (Riyadh). For more room, upgrade to ${next.en}.`,
    ar: `وصلت إلى حد الأسئلة اليومي. يتجدد عند منتصف الليل (بتوقيت الرياض). لمساحة أكبر، قم بالترقية إلى ${next.ar}.`,
  };
}

/** Hard word cap applied to model output server-side (cost + policy). */
export function capWords(text, maxWords) {
  const words = String(text || '').trim().split(/\s+/);
  if (words.length <= maxWords) return String(text || '').trim();
  return words.slice(0, maxWords).join(' ') + ' …';
}
