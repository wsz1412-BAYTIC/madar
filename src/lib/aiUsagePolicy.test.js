import { describe, it, expect } from 'vitest';
import {
  AI_LIMITS, TRIAL_AI_BUDGET,
  riyadhDayKey, nextRiyadhMidnight,
  resolveAiPolicy, assessAiQuota, buildUsageIncrement, upgradeMessage, capWords,
} from './aiUsagePolicy.js';

const NOW = new Date('2026-07-04T10:00:00.000Z'); // 13:00 Riyadh
const paid = (plan) => ({ planName: plan, paymentStatus: 'paid' });
const freeSub = { planName: 'free', paymentStatus: 'not_required' };
const trialSub = {
  planName: 'growth', paymentStatus: 'trial', trialStatus: 'active',
  trialStartedAt: '2026-07-01T00:00:00.000Z', trialEndsAt: '2026-07-15T00:00:00.000Z',
};

describe('AI limits per plan (DAILY, cost-safe)', () => {
  it('matches the pricing model: 5/25/75/250 per day, 200/350/500/700 words', () => {
    expect(AI_LIMITS.free).toMatchObject({ questionsPerDay: 5, maxWords: 200, memory: false });
    expect(AI_LIMITS.basic).toMatchObject({ questionsPerDay: 25, maxWords: 350, memory: false });
    expect(AI_LIMITS.growth).toMatchObject({ questionsPerDay: 75, maxWords: 500, memory: true });
    expect(AI_LIMITS.pro).toMatchObject({ questionsPerDay: 250, maxWords: 700, memory: true });
    expect(TRIAL_AI_BUDGET).toMatchObject({ questionsTotal: 35, maxWords: 350, memory: false });
  });

  it('resolves policies from the EFFECTIVE plan (unpaid growth label → free limits)', () => {
    expect(resolveAiPolicy(paid('pro'), NOW)).toMatchObject({ plan: 'pro', questionsLimit: 250, memory: true });
    expect(resolveAiPolicy(freeSub, NOW)).toMatchObject({ plan: 'free', questionsLimit: 5 });
    // A user cannot self-grant limits by writing a plan label without payment.
    expect(resolveAiPolicy({ planName: 'pro', paymentStatus: 'none' }, NOW)).toMatchObject({ plan: 'free', questionsLimit: 5 });
    expect(resolveAiPolicy(trialSub, NOW)).toMatchObject({ plan: 'growth_trial', window: 'trial', questionsLimit: 35, maxWords: 350, memory: false });
  });
});

describe('daily quota with Riyadh reset', () => {
  it('allows under the limit and counts down', () => {
    const q = assessAiQuota(freeSub, { aiUsageDayKey: riyadhDayKey(NOW), aiUsageCountToday: 3 }, NOW);
    expect(q.allowed).toBe(true);
    expect(q.remaining).toBe(1); // 5 - 3 - this one
  });

  it('blocks at the limit with a professional bilingual upgrade message + reset time', () => {
    const q = assessAiQuota(freeSub, { aiUsageDayKey: riyadhDayKey(NOW), aiUsageCountToday: 5 }, NOW);
    expect(q.allowed).toBe(false);
    expect(q.error.en).toMatch(/upgrade/i);
    expect(q.error.ar).toContain('الترقية');
    expect(new Date(q.resetAt) > NOW).toBe(true);
  });

  it("a STALE day key counts as zero — that is the daily reset", () => {
    const q = assessAiQuota(freeSub, { aiUsageDayKey: '2026-07-03', aiUsageCountToday: 999 }, NOW);
    expect(q.allowed).toBe(true);
    expect(q.remaining).toBe(4);
  });

  it('the Riyadh day flips at 21:00 UTC (midnight UTC+3)', () => {
    expect(riyadhDayKey(new Date('2026-07-04T20:59:00.000Z'))).toBe('2026-07-04');
    expect(riyadhDayKey(new Date('2026-07-04T21:01:00.000Z'))).toBe('2026-07-05');
    const reset = nextRiyadhMidnight(new Date('2026-07-04T10:00:00.000Z'));
    expect(reset.toISOString()).toBe('2026-07-04T21:00:00.000Z');
  });

  it('increment writes the day key + count; trial increments the total', () => {
    expect(buildUsageIncrement(freeSub, { aiUsageDayKey: riyadhDayKey(NOW), aiUsageCountToday: 2 }, NOW))
      .toEqual({ aiUsageDayKey: riyadhDayKey(NOW), aiUsageCountToday: 3 });
    expect(buildUsageIncrement(freeSub, { aiUsageDayKey: 'stale', aiUsageCountToday: 9 }, NOW))
      .toEqual({ aiUsageDayKey: riyadhDayKey(NOW), aiUsageCountToday: 1 });
    expect(buildUsageIncrement(trialSub, { aiTrialQuestionsUsed: 10 }, NOW))
      .toEqual({ aiTrialQuestionsUsed: 11 });
  });
});

describe('trial TOTAL budget (35 for the whole trial)', () => {
  it('allows while under 35 and shows remaining', () => {
    const q = assessAiQuota(trialSub, { aiTrialQuestionsUsed: 34 }, NOW);
    expect(q.allowed).toBe(true);
    expect(q.remaining).toBe(0);
  });

  it('blocks at 35 with the trial upgrade prompt', () => {
    const q = assessAiQuota(trialSub, { aiTrialQuestionsUsed: 35 }, NOW);
    expect(q.allowed).toBe(false);
    expect(q.error.en).toContain('35');
    expect(q.error.ar).toContain('35');
  });

  it('an EXPIRED trial falls back to free daily limits', () => {
    const expired = { ...trialSub, trialEndsAt: '2026-07-02T00:00:00.000Z' };
    expect(resolveAiPolicy(expired, NOW)).toMatchObject({ plan: 'free', questionsLimit: 5 });
  });
});

describe('word caps + upgrade copy', () => {
  it('capWords hard-truncates long answers', () => {
    const long = Array.from({ length: 300 }, (_, i) => `w${i}`).join(' ');
    const capped = capWords(long, 200);
    expect(capped.split(/\s+/).length).toBe(201); // 200 words + ellipsis
    expect(capped.endsWith('…')).toBe(true);
    expect(capWords('short answer', 200)).toBe('short answer');
  });

  it('upgrade messages name the next tier per plan', () => {
    expect(upgradeMessage('daily_exhausted', 'free').en).toContain('Basic');
    expect(upgradeMessage('daily_exhausted', 'basic').en).toContain('Growth');
    expect(upgradeMessage('daily_exhausted', 'growth').en).toContain('Pro');
  });
});
