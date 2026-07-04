import { describe, it, expect } from 'vitest';
import {
  weeklyDedupeKey, isWeeklySendWindow, weeklyDigestEligible,
  instantAlertAllowed, instantDedupeKey, buildTelegramMessage,
  reportDueToday, reportDedupeKey, INSTANT_ALERT_KINDS,
} from './notificationScheduler.js';

// 2026-07-08 is a Wednesday. 15:00 Riyadh = 12:00 UTC.
const WED_3PM_RIYADH = new Date('2026-07-08T12:30:00.000Z');
const WED_MORNING = new Date('2026-07-08T06:00:00.000Z');
const THURSDAY = new Date('2026-07-09T12:30:00.000Z');

const optedIn = { id: 'u1', telegram_username: '@sara', notification_prefs: { marketNews: true, aiRecommendations: true, billingAlerts: true } };
const paidGrowth = { planName: 'growth', paymentStatus: 'paid' };
const paidPro = { planName: 'pro', paymentStatus: 'paid' };
const trialSub = { planName: 'growth', paymentStatus: 'trial', trialStatus: 'active', trialStartedAt: '2026-07-01T00:00:00Z', trialEndsAt: '2026-07-15T00:00:00Z' };

describe('weekly digest: Wednesday 15:00 Riyadh, opt-in, deduped per ISO week', () => {
  it('send window matches only Wednesday 15:00–15:59 Riyadh', () => {
    expect(isWeeklySendWindow(WED_3PM_RIYADH)).toBe(true);
    expect(isWeeklySendWindow(WED_MORNING)).toBe(false);
    expect(isWeeklySendWindow(THURSDAY)).toBe(false);
  });

  it('one dedupe key per ISO week — same week same key, next week different', () => {
    const k1 = weeklyDedupeKey(WED_3PM_RIYADH);
    expect(k1).toMatch(/^weekly-2026-W\d{2}$/);
    expect(weeklyDedupeKey(new Date('2026-07-06T00:00:00Z'))).toBe(k1); // Monday same week
    expect(weeklyDedupeKey(new Date('2026-07-15T12:00:00Z'))).not.toBe(k1); // next week
  });

  it('eligibility requires Telegram opt-in (username + marketNews pref)', () => {
    expect(weeklyDigestEligible(optedIn)).toBe(true);
    expect(weeklyDigestEligible({ ...optedIn, telegram_username: null })).toBe(false);
    expect(weeklyDigestEligible({ ...optedIn, notification_prefs: { marketNews: false } })).toBe(false);
  });
});

describe('instant alerts: paid Growth/Pro only', () => {
  it('allows paid growth/pro with the matching opt-in', () => {
    expect(instantAlertAllowed(optedIn, paidGrowth, 'ai_recommendation')).toBe(true);
    expect(instantAlertAllowed(optedIn, paidPro, 'billing_issue')).toBe(true);
  });

  it('blocks free, trial, unknown kinds, unpaid labels and opted-out users', () => {
    expect(instantAlertAllowed(optedIn, { planName: 'free', paymentStatus: 'not_required' }, 'ai_recommendation')).toBe(false);
    expect(instantAlertAllowed(optedIn, trialSub, 'ai_recommendation')).toBe(false); // trial ≠ paid
    expect(instantAlertAllowed(optedIn, { planName: 'pro', paymentStatus: 'none' }, 'ai_recommendation')).toBe(false);
    expect(instantAlertAllowed(optedIn, paidPro, 'promotions')).toBe(false);
    expect(instantAlertAllowed({ ...optedIn, notification_prefs: { aiRecommendations: false } }, paidPro, 'ai_recommendation')).toBe(false);
    expect(instantAlertAllowed({ ...optedIn, telegram_username: null }, paidPro, 'ai_recommendation')).toBe(false);
  });

  it('dedupe key is unique per user/kind/event', () => {
    const k = instantDedupeKey('u1', 'ai_recommendation', 'rec-42');
    expect(k).toBe('instant-ai_recommendation-u1-rec-42');
    expect(instantDedupeKey('u2', 'ai_recommendation', 'rec-42')).not.toBe(k);
  });

  it('exposes exactly the four allowed kinds', () => {
    expect(INSTANT_ALERT_KINDS).toEqual(['ai_recommendation', 'urgent_action', 'market_update', 'billing_issue']);
  });
});

describe('telegram message content policy', () => {
  it('is Arabic-first, summary + dashboard link only, no sensitive data', () => {
    const msg = buildTelegramMessage('ai_recommendation', 'ar', 'https://madar.sa/dashboard');
    const [first] = msg.split('\n');
    expect(/[؀-ۿ]/.test(first)).toBe(true); // Arabic line first
    expect(msg).toContain('https://madar.sa/dashboard');
    // no digits that could be prices/revenue, no emails
    expect(/\d{3,}/.test(msg.replace('https://madar.sa/dashboard', ''))).toBe(false);
    expect(msg).not.toMatch(/@.+\..+/);
  });
});

describe('scheduled email reports', () => {
  it('Growth gets basic reports Monday and Wednesday; Pro daily; others none', () => {
    const monday = new Date('2026-07-06T10:00:00Z');
    const tuesday = new Date('2026-07-07T10:00:00Z');
    const wednesday = new Date('2026-07-08T10:00:00Z');
    expect(reportDueToday('growth', monday)).toBe('basic_report');
    expect(reportDueToday('growth', tuesday)).toBeNull();
    expect(reportDueToday('growth', wednesday)).toBe('basic_report');
    expect(reportDueToday('pro', tuesday)).toBe('daily_pro_report');
    expect(reportDueToday('free', monday)).toBeNull();
    expect(reportDueToday('basic', monday)).toBeNull();
  });

  it('report dedupe key is per kind per Riyadh day', () => {
    expect(reportDedupeKey('basic_report', new Date('2026-07-06T10:00:00Z'))).toBe('report-basic_report-2026-07-06');
  });
});
