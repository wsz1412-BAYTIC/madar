// Canonical subscription-provisioning logic for Madar.
//
// Ported (behaviour, not verbatim) from the Base44 live export's
// `manageSubscription` function, adapted to Madar's UserSubscription field
// convention (userId / planId / planName / startDate / status). This module is
// pure — no Base44 SDK, no I/O — so it can be unit-tested and mirrored into the
// Deno backend function (see base44/functions/manage-subscription/).
//
// Design guarantees enforced here:
//   • Every user is entitled to exactly one Free subscription, auto-provisioned.
//   • Free never requires payment (paymentStatus: "not_required").
//   • Property/usage limits are resolved server-side from the plan, never trusted
//     from the client.
//   • Paid upgrades are blocked until a trusted, payment-verified path exists.

// Property caps per plan, enforced server-side. Mirrors the entitlement caps in
// src/lib/subscriptionEntitlements.js (free:1, basic:2, growth:5, pro:15).
export const PLAN_LIMITS = Object.freeze({
  free: 1,
  basic: 2,
  growth: 5,
  pro: 15,
  // Business/custom: 15+ by agreement — enforced per-account by admin.
});

export const FREE_PLAN = 'free';

// Bilingual message returned when a user attempts a direct self-upgrade. Paid
// checkout is intentionally not implemented — plan changes must go through a
// trusted backend path with verified payment. Direct self-upgrade stays disabled.
export const UPGRADE_UNAVAILABLE = Object.freeze({
  ar: 'الترقية المدفوعة غير متاحة حاليًا. سيتم تفعيلها بعد ربط بوابة الدفع.',
  en: 'Paid upgrades are currently unavailable. They will be enabled once payment is connected.',
});

/** True when the plan is a paid tier (anything other than Free). */
export function isPaidPlan(planName) {
  return typeof planName === 'string' && planName.toLowerCase() !== FREE_PLAN;
}

/** Resolve the property cap for a plan, defaulting to the Free cap for unknown plans. */
export function resolvePlanLimit(planName) {
  const key = typeof planName === 'string' ? planName.toLowerCase() : FREE_PLAN;
  return Object.prototype.hasOwnProperty.call(PLAN_LIMITS, key)
    ? PLAN_LIMITS[key]
    : PLAN_LIMITS[FREE_PLAN];
}

/**
 * Build the payload for auto-provisioning a Free subscription for a user.
 * Satisfies UserSubscription's required fields (userId, planId, planName,
 * startDate) plus the additive onboarding fields (paymentStatus, usageCount,
 * usageLimit). Callers persist this only when the user has no subscription yet.
 */
export function buildFreeSubscription(userId, nowIso) {
  if (!userId) throw new Error('buildFreeSubscription requires a userId');
  const startDate = nowIso || new Date().toISOString();
  return {
    userId,
    planId: FREE_PLAN,
    planName: FREE_PLAN,
    status: 'active',
    startDate,
    renewalDate: null,
    price: 0,
    autoRenew: false,
    paymentStatus: 'not_required',
    usageCount: 0,
    usageLimit: PLAN_LIMITS[FREE_PLAN],
  };
}

/**
 * Decide whether adding another property is allowed for a plan given the current
 * count. Pure — the caller supplies the live count. Returns a structured result.
 */
export function assessPropertyLimit(planName, currentCount) {
  const limit = resolvePlanLimit(planName);
  const count = Number.isFinite(currentCount) ? currentCount : 0;
  return {
    allowed: count < limit,
    plan: typeof planName === 'string' ? planName.toLowerCase() : FREE_PLAN,
    limit,
    count,
  };
}

/**
 * Pick the current plan key for the Billing UI from a subscription record.
 * Defaults to Free when no subscription/plan is present, so Billing shows Free
 * as the current plan rather than an upgrade prompt.
 */
export function selectCurrentPlanKey(subscription) {
  const name = subscription && subscription.planName;
  if (typeof name !== 'string' || name.length === 0) return FREE_PLAN;
  return name.toLowerCase();
}
