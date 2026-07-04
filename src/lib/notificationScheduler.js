// Telegram/email notification scheduling rules for Madar. Pure — mirrored
// into base44/functions/telegram-alerts/ where sending (or honest
// pending-integration logging) happens. Every send is recorded in the
// NotificationLog entity with a dedupeKey; a key that already exists is
// never sent again — that is the duplicate guarantee.

import { assessTrialState } from './trialManagement.js';
import { canNotify } from './telegramNotifications.js';

// Asia/Riyadh is fixed UTC+3.
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

// ── Weekly digest: Wednesday 15:00 Riyadh, opt-in, Arabic first. ──

/** ISO-week dedupe key, e.g. "weekly-2026-W27". One digest per user per week. */
export function weeklyDedupeKey(now = new Date()) {
  const d = new Date(now.getTime() + RIYADH_OFFSET_MS);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // ISO week: Thursday determines the week-year.
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `weekly-${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** True inside the Wednesday 15:00–15:59 Riyadh send window. */
export function isWeeklySendWindow(now = new Date()) {
  const d = new Date(now.getTime() + RIYADH_OFFSET_MS);
  return d.getUTCDay() === 3 && d.getUTCHours() === 15;
}

/** Weekly digest eligibility: opted-in (username + marketNews pref). */
export function weeklyDigestEligible(user) {
  return canNotify(user, 'marketNews');
}

// ── Instant alerts: paid Growth/Pro only. ──

export const INSTANT_ALERT_KINDS = Object.freeze([
  'ai_recommendation',
  'urgent_action',
  'market_update',
  'billing_issue',
]);

const KIND_TO_PREF = {
  ai_recommendation: 'aiRecommendations',
  urgent_action: 'marketNews',
  market_update: 'marketNews',
  billing_issue: 'billingAlerts',
};

/**
 * May an INSTANT Telegram alert of this kind go to this user right now?
 * Requires: a known kind, a PAID Growth/Pro subscription (trials and free
 * accounts never get instant alerts), and the matching opt-in preference.
 */
export function instantAlertAllowed(user, subscription, kind, now = new Date()) {
  if (!INSTANT_ALERT_KINDS.includes(kind)) return false;
  const { state } = assessTrialState(subscription, now);
  if (state !== 'paid') return false;
  const plan = String(subscription.planName || '').toLowerCase();
  if (plan !== 'growth' && plan !== 'pro') return false;
  return canNotify(user, KIND_TO_PREF[kind]);
}

/** Per-event dedupe key: one send per user/kind/event. */
export function instantDedupeKey(userId, kind, eventId) {
  return `instant-${kind}-${userId}-${eventId}`;
}

/**
 * Telegram message bodies are SUMMARY + DASHBOARD LINK ONLY — never prices,
 * revenue figures, emails, or any account data. Arabic first, then English.
 */
export function buildTelegramMessage(kind, lang = 'ar', dashboardUrl = 'https://madar.sa/dashboard') {
  const bodies = {
    weekly_digest: {
      ar: 'ملخص مدار الأسبوعي: تحديثات سوق الإيجار قصير المدى في السعودية وأهم المستجدات.',
      en: 'Madar weekly digest: Saudi short-term rental market updates and highlights.',
    },
    ai_recommendation: {
      ar: 'لديك توصية تسعير جديدة من مدار بانتظار مراجعتك.',
      en: 'A new Madar pricing recommendation is waiting for your review.',
    },
    urgent_action: {
      ar: 'إجراء عاجل مقترح لأحد عقاراتك — راجع لوحة التحكم.',
      en: 'An urgent action is suggested for one of your properties — check your dashboard.',
    },
    market_update: {
      ar: 'تحديث مهم في السوق قد يؤثر على أسعارك.',
      en: 'An important market update may affect your pricing.',
    },
    billing_issue: {
      ar: 'يوجد تنبيه يخص حسابك أو اشتراكك — يرجى مراجعة صفحة الفوترة.',
      en: 'There is an account or subscription notice — please review your billing page.',
    },
  };
  const body = bodies[kind] || bodies.market_update;
  // Arabic first always; append the other language beneath.
  const primary = body.ar;
  const secondary = body.en;
  return `${primary}\n${secondary}\n${dashboardUrl}`;
}

// ── Scheduled email reports: Growth = Mon+Wed basic, Pro = daily. ──

/** Which scheduled report (if any) is due today for this effective plan. */
export function reportDueToday(entitlementPlan, now = new Date()) {
  const day = new Date(now.getTime() + RIYADH_OFFSET_MS).getUTCDay(); // 0=Sun
  if (entitlementPlan === 'pro') return 'daily_pro_report';
  if (entitlementPlan === 'growth' && (day === 1 || day === 3)) return 'basic_report';
  return null;
}

/** Daily-report dedupe key, e.g. "report-basic_report-2026-07-04". */
export function reportDedupeKey(kind, now = new Date()) {
  const day = new Date(now.getTime() + RIYADH_OFFSET_MS).toISOString().slice(0, 10);
  return `report-${kind}-${day}`;
}
