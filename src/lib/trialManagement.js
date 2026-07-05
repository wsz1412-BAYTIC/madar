/**
 * Canonical trial rules for Madar's 14-day Growth trial.
 *
 * Pure — no SDK, no I/O. Unit-tested here and mirrored byte-for-byte into
 * base44/functions/manage-subscription/ (enforced by functionMirrors.test.js),
 * so the server and the UI apply exactly the same rules. The server is the
 * authority: the client copy only renders state.
 *
 * Trial rules in one place:
 * • Default activation = Growth plan for 14 days, clearly marked as a trial
 *   (paymentStatus: 'trial', trialStatus: 'active'), never as paid.
 * • One trial per account: once trialUsedAt is set, re-activation is blocked
 *   until an admin approves (admin-operations: approve_trial_reactivation).
 * • A live paid subscription is never overwritten by a trial.
 * • Entitlements during trial = Growth exactly; Pro-only features stay
 *   locked. On expiry the account locks back to Free until payment is
 *   verified (paymentStatus === 'paid').
 */

export const TRIAL_PLAN = 'growth';
export const TRIAL_DAYS = 14;
export const REMINDER_OFFSETS_DAYS = [7, 3, 1, 0];

const DAY_MS = 24 * 60 * 60 * 1000;
const GROWTH_PROPERTY_LIMIT = 5;
const FREE_PROPERTY_LIMIT = 1;

const isPaid = (sub) => Boolean(sub) && sub.paymentStatus === 'paid';

/**
 * May this subscription start the 14-day Growth trial?
 * Returns { allowed: true } or { allowed: false, reason, error: {en, ar} }.
 */
export function canActivateTrial(subscription, now = new Date()) {
  if (isPaid(subscription)) {
    return {
      allowed: false,
      reason: 'already_paid',
      error: {
        en: 'You already have an active paid subscription — the trial would not add anything.',
        ar: 'لديك اشتراك مدفوع نشط بالفعل — لن تضيف التجربة شيئًا.',
      },
    };
  }
  if (subscription?.trialStatus === 'active' && new Date(subscription.trialEndsAt) > now) {
    return {
      allowed: false,
      reason: 'already_on_trial',
      error: {
        en: 'Your Growth trial is already active.',
        ar: 'تجربتك لخطة النمو مفعّلة بالفعل.',
      },
    };
  }
  if (subscription?.trialUsedAt) {
    return {
      allowed: false,
      reason: 'trial_already_used',
      error: {
        en: 'This account has already used its free trial. Contact support for an exception.',
        ar: 'استخدم هذا الحساب تجربته المجانية من قبل. تواصل مع الدعم لطلب استثناء.',
      },
    };
  }
  return { allowed: true };
}

/**
 * Fields to SET on the subscription when the trial starts. Applied server-side
 * only (service role) — nothing here is client-writable under RLS.
 */
export function buildTrialActivation(now = new Date()) {
  const start = now.toISOString();
  const ends = new Date(now.getTime() + TRIAL_DAYS * DAY_MS).toISOString();
  return {
    planId: TRIAL_PLAN,
    planName: TRIAL_PLAN,
    status: 'active',
    paymentStatus: 'trial',
    trialStatus: 'active',
    trialStartedAt: start,
    trialEndsAt: ends,
    trialUsedAt: start,
    usageLimit: GROWTH_PROPERTY_LIMIT,
    price: 0,
  };
}

/**
 * Fields to SET when an expired trial is locked back to Free. Idempotent.
 */
export function buildTrialExpiryDowngrade() {
  return {
    planId: 'free',
    planName: 'free',
    paymentStatus: 'none',
    trialStatus: 'expired',
    usageLimit: FREE_PROPERTY_LIMIT,
    price: 0,
  };
}

/**
 * Evaluate the subscription's effective state at `now`.
 * One of: 'paid' | 'trial_active' | 'trial_expired' | 'free'.
 * daysRemaining is present only for trial_active (ceil, min 0).
 */
export function assessTrialState(subscription, now = new Date()) {
  if (isPaid(subscription)) return { state: 'paid' };
  if (subscription?.trialStatus === 'active') {
    const ends = new Date(subscription.trialEndsAt);
    if (ends > now) {
      return {
        state: 'trial_active',
        daysRemaining: Math.max(0, Math.ceil((ends.getTime() - now.getTime()) / DAY_MS)),
      };
    }
    return { state: 'trial_expired' };
  }
  if (subscription?.trialStatus === 'expired') return { state: 'trial_expired' };
  return { state: 'free' };
}

/**
 * THE permission gate: which plan's entitlements apply right now.
 * — verified payment → the paid plan (growth/pro/basic)
 * — active trial → exactly 'growth' (Pro stays locked)
 * — expired trial / anything else → 'free'
 * Feeds hasFeatureAccess(); the backend uses the same resolution.
 */
export function resolveEntitlementPlan(subscription, now = new Date()) {
  const { state } = assessTrialState(subscription, now);
  if (state === 'paid') {
    const plan = String(subscription.planName || 'free').toLowerCase();
    return plan === 'growth' || plan === 'pro' || plan === 'basic' ? plan : 'free';
  }
  if (state === 'trial_active') return TRIAL_PLAN;
  return 'free';
}

/**
 * Badge descriptor for showing the plan next to a customer's name.
 * key: 'growth_trial' | 'paid' | 'trial_expired' | 'free'
 */
export function planBadge(subscription, now = new Date(), lang = 'en') {
  const assessed = assessTrialState(subscription, now);
  const ar = lang === 'ar';
  if (assessed.state === 'trial_active') {
    const d = assessed.daysRemaining;
    return {
      key: 'growth_trial',
      daysRemaining: d,
      label: ar ? `تجربة النمو · ${d} ${d === 1 ? 'يوم' : 'أيام'}` : `Growth Trial · ${d} ${d === 1 ? 'day' : 'days'}`,
    };
  }
  if (assessed.state === 'paid') {
    const plan = String(subscription.planName || '').toLowerCase();
    const names = { growth: ar ? 'النمو' : 'Growth', pro: ar ? 'برو' : 'Pro', basic: ar ? 'الأساسية' : 'Basic' };
    return { key: 'paid', label: `${names[plan] || plan} · ${ar ? 'مدفوع' : 'Paid'}` };
  }
  if (assessed.state === 'trial_expired') {
    return { key: 'trial_expired', label: ar ? 'انتهت التجربة' : 'Trial Expired' };
  }
  return { key: 'free', label: ar ? 'مجاني' : 'Free' };
}

/**
 * Which reminder offsets are due now and not yet sent.
 */
export function dueTrialReminders(subscription, now = new Date(), sentLog = null) {
  if (!subscription?.trialEndsAt || !subscription?.trialStartedAt) return [];
  if (subscription.trialStatus !== 'active' && subscription.trialStatus !== 'expired') return [];
  const ends = new Date(subscription.trialEndsAt).getTime();
  const sent = new Set(sentLog || subscription.trialRemindersSent || []);
  const due = [];
  for (const offset of REMINDER_OFFSETS_DAYS) {
    const key = `${offset}d`;
    if (sent.has(key)) continue;
    const fireAt = ends - offset * DAY_MS;
    if (now.getTime() >= fireAt) {
      if (offset === 0 || now.getTime() < ends) due.push(key);
    }
  }
  return due;
}

/**
 * Preferred contact channel for reminders/reports: email first, Telegram only
 * when a username is stored. Returns an ordered list of channels to attempt.
 */
export function contactChannels(user) {
  const channels = [];
  if (user?.email) channels.push({ channel: 'email', to: user.email });
  if (user?.telegram_username) channels.push({ channel: 'telegram', to: user.telegram_username });
  return channels;
}