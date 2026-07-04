import { describe, it, expect } from 'vitest';
import {
  TRIAL_PLAN, TRIAL_DAYS, REMINDER_OFFSETS_DAYS,
  canActivateTrial, buildTrialActivation, buildTrialExpiryDowngrade,
  assessTrialState, resolveEntitlementPlan, planBadge,
  dueTrialReminders, contactChannels,
} from './trialManagement.js';
import { hasFeatureAccess } from './subscriptionEntitlements.js';

const NOW = new Date('2026-07-04T12:00:00.000Z');
const daysFromNow = (d) => new Date(NOW.getTime() + d * 86400000).toISOString();

const freeSub = { planName: 'free', paymentStatus: 'not_required', trialStatus: null };
const paidGrowth = { planName: 'growth', paymentStatus: 'paid' };
const activeTrial = {
  planName: 'growth', paymentStatus: 'trial', trialStatus: 'active',
  trialStartedAt: daysFromNow(-2), trialEndsAt: daysFromNow(12), trialUsedAt: daysFromNow(-2),
};

describe('trial activation rules', () => {
  it('allows a fresh free account to activate', () => {
    expect(canActivateTrial(freeSub, NOW)).toEqual({ allowed: true });
  });

  it('never overwrites an existing paid subscription', () => {
    const r = canActivateTrial(paidGrowth, NOW);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('already_paid');
    expect(r.error.ar).toBeTruthy();
  });

  it('blocks a duplicate trial while one is active', () => {
    const r = canActivateTrial(activeTrial, NOW);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('already_on_trial');
  });

  it('blocks re-activation once the trial was used (admin approval required)', () => {
    const used = { ...freeSub, trialUsedAt: daysFromNow(-30), trialStatus: 'expired' };
    const r = canActivateTrial(used, NOW);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('trial_already_used');
  });

  it('activation payload marks the trial clearly — never paid', () => {
    const a = buildTrialActivation(NOW);
    expect(a.planName).toBe(TRIAL_PLAN);
    expect(a.paymentStatus).toBe('trial');
    expect(a.trialStatus).toBe('active');
    expect(a.price).toBe(0);
    expect(a.trialStartedAt).toBe(NOW.toISOString());
    expect(new Date(a.trialEndsAt).getTime() - NOW.getTime()).toBe(TRIAL_DAYS * 86400000);
    expect(a.trialUsedAt).toBe(NOW.toISOString()); // one-trial gate set at activation
  });
});

describe('entitlements during and after trial', () => {
  it('active trial resolves to Growth entitlements exactly', () => {
    expect(resolveEntitlementPlan(activeTrial, NOW)).toBe('growth');
    // Growth feature unlocked:
    expect(hasFeatureAccess('growth', 'pricing.recommendations')).toBe(true);
  });

  it('Pro-only features stay locked during a Growth trial', () => {
    const plan = resolveEntitlementPlan(activeTrial, NOW);
    expect(hasFeatureAccess(plan, 'pricing.automaticPricing')).toBe(false);
    expect(hasFeatureAccess('pro', 'pricing.automaticPricing')).toBe(true); // sanity
  });

  it('expiry locks back to Free until payment is verified', () => {
    const expired = { ...activeTrial, trialEndsAt: daysFromNow(-1) };
    expect(assessTrialState(expired, NOW).state).toBe('trial_expired');
    expect(resolveEntitlementPlan(expired, NOW)).toBe('free');
    const downgrade = buildTrialExpiryDowngrade();
    expect(downgrade.planName).toBe('free');
    expect(downgrade.trialStatus).toBe('expired');
    expect(downgrade.paymentStatus).toBe('none');
  });

  it('verified payment resolves to the paid plan; unpaid growth label does not', () => {
    expect(resolveEntitlementPlan(paidGrowth, NOW)).toBe('growth');
    expect(resolveEntitlementPlan({ planName: 'pro', paymentStatus: 'paid' }, NOW)).toBe('pro');
    // A growth *label* without verified payment or active trial gets Free —
    // a customer cannot grant themselves paid access by label alone.
    expect(resolveEntitlementPlan({ planName: 'growth', paymentStatus: 'none' }, NOW)).toBe('free');
  });
});

describe('plan badge', () => {
  it('shows Growth Trial with remaining days', () => {
    const b = planBadge(activeTrial, NOW, 'en');
    expect(b.key).toBe('growth_trial');
    expect(b.daysRemaining).toBe(12);
    expect(b.label).toBe('Growth Trial · 12 days');
    expect(planBadge(activeTrial, NOW, 'ar').label).toContain('تجربة النمو');
  });

  it('shows Paid, Free and Trial Expired states', () => {
    expect(planBadge(paidGrowth, NOW, 'en').label).toBe('Growth · Paid');
    expect(planBadge(freeSub, NOW, 'en').label).toBe('Free');
    expect(planBadge({ ...activeTrial, trialEndsAt: daysFromNow(-1) }, NOW, 'en').label).toBe('Trial Expired');
    expect(planBadge({ ...activeTrial, trialEndsAt: daysFromNow(-1) }, NOW, 'ar').label).toBe('انتهت التجربة');
  });
});

describe('reminder scheduling + dedupe', () => {
  it('uses the 7/3/1/0-day schedule', () => {
    expect(REMINDER_OFFSETS_DAYS).toEqual([7, 3, 1, 0]);
  });

  it('fires the 7d reminder once inside the window and never twice', () => {
    const sub = { ...activeTrial, trialEndsAt: daysFromNow(6.5) }; // inside 7d window
    expect(dueTrialReminders(sub, NOW)).toEqual(['7d']);
    expect(dueTrialReminders({ ...sub, trialRemindersSent: ['7d'] }, NOW)).toEqual([]);
  });

  it('catches up multiple due offsets but only unsent ones', () => {
    const sub = { ...activeTrial, trialEndsAt: daysFromNow(0.5), trialRemindersSent: ['7d'] };
    expect(dueTrialReminders(sub, NOW)).toEqual(['3d', '1d']);
  });

  it('fires the expiry-day notice after expiry, and nothing else', () => {
    const sub = { ...activeTrial, trialStatus: 'expired', trialEndsAt: daysFromNow(-0.5), trialRemindersSent: ['7d', '3d', '1d'] };
    expect(dueTrialReminders(sub, NOW)).toEqual(['0d']);
    expect(dueTrialReminders({ ...sub, trialRemindersSent: ['7d', '3d', '1d', '0d'] }, NOW)).toEqual([]);
  });

  it('does nothing without a trial', () => {
    expect(dueTrialReminders(freeSub, NOW)).toEqual([]);
  });
});

describe('contact channel preference', () => {
  it('email first, then Telegram when configured', () => {
    expect(contactChannels({ email: 'a@b.c', telegram_username: '@sara' })).toEqual([
      { channel: 'email', to: 'a@b.c' },
      { channel: 'telegram', to: '@sara' },
    ]);
    expect(contactChannels({ email: 'a@b.c' })).toEqual([{ channel: 'email', to: 'a@b.c' }]);
    expect(contactChannels({})).toEqual([]);
  });
});
