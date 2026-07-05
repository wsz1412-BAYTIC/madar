import { describe, it, expect } from 'vitest';
import {
  resolveInvestmentPlan,
  resolveInvestmentAccess,
  validateDealInput,
  analyzeDeal,
  buildFallbackNarrative,
  validateNarrative,
  INVESTMENT_DISCLAIMER,
} from './investmentAnalysis.js';

const NOW = new Date('2026-07-05T08:00:00Z');
const paid = (planName) => ({ planName, paymentStatus: 'paid' });

describe('plan access matrix (server-side gate)', () => {
  it('Pro: annual lease analysis only — purchase gets the Business upsell', () => {
    expect(resolveInvestmentAccess(paid('pro'), 'lease', NOW)).toEqual({ allowed: true, plan: 'pro' });
    const blocked = resolveInvestmentAccess(paid('pro'), 'purchase', NOW);
    expect(blocked.allowed).toBe(false);
    expect(blocked.upgrade).toBe('business');
    expect(blocked.error.ar).toContain('باقة الأعمال');
    expect(blocked.error.en).toMatch(/Business plan/);
  });

  it('Business: lease AND purchase are both allowed', () => {
    expect(resolveInvestmentAccess(paid('business'), 'lease', NOW).allowed).toBe(true);
    expect(resolveInvestmentAccess(paid('business'), 'purchase', NOW).allowed).toBe(true);
  });

  it('lower plans are blocked entirely with a Pro upsell', () => {
    for (const sub of [paid('free'), paid('basic'), paid('growth'), {}, null]) {
      const res = resolveInvestmentAccess(sub, 'lease', NOW);
      expect(res.allowed).toBe(false);
      expect(res.upgrade).toBe('pro');
      expect(res.error.ar).toBeTruthy();
      expect(res.error.en).toBeTruthy();
    }
  });

  it('a Growth TRIAL does not unlock the consultant (trial maps to growth, not pro)', () => {
    const trialing = {
      planName: 'growth',
      paymentStatus: 'trial',
      trialStatus: 'active',
      trialStartedAt: '2026-07-01T00:00:00Z',
      trialEndsAt: '2026-07-15T00:00:00Z',
    };
    expect(resolveInvestmentAccess(trialing, 'lease', NOW).allowed).toBe(false);
  });

  it('business requires a VERIFIED paid subscription — users cannot self-grant it', () => {
    expect(resolveInvestmentPlan({ planName: 'business', paymentStatus: 'trial' }, NOW)).not.toBe('business');
    expect(resolveInvestmentPlan({ planName: 'business', paymentStatus: 'pending' }, NOW)).not.toBe('business');
    expect(resolveInvestmentPlan(paid('business'), NOW)).toBe('business');
  });
});

describe('validateDealInput', () => {
  const base = { expectedNightlyRate: 400, expectedOccupancy: 60, askingRent: 60000, askingPrice: 900000, platform: 'Airbnb' };

  it('accepts a sane lease deal and normalizes fields', () => {
    const res = validateDealInput('lease', base);
    expect(res.ok).toBe(true);
    expect(res.input.askingRent).toBe(60000);
    expect(res.input.askingPrice).toBeNull();
    expect(res.input.monthlyOperatingCosts).toBe(0);
  });

  it('rejects bad inputs with bilingual errors', () => {
    expect(validateDealInput('flip', base).ok).toBe(false);
    expect(validateDealInput('lease', { ...base, expectedNightlyRate: -5 }).error.ar).toBeTruthy();
    expect(validateDealInput('lease', { ...base, expectedOccupancy: 150 }).ok).toBe(false);
    expect(validateDealInput('lease', { ...base, askingRent: 0 }).ok).toBe(false);
    expect(validateDealInput('purchase', { ...base, askingPrice: null }).ok).toBe(false);
    expect(validateDealInput('lease', { ...base, monthlyOperatingCosts: -100 }).ok).toBe(false);
  });
});

describe('analyzeDeal — Agree Zone deterministic math', () => {
  const leaseInput = validateDealInput('lease', {
    expectedNightlyRate: 400,
    expectedOccupancy: 60,
    askingRent: 60000,
    monthlyOperatingCosts: 1000,
    platform: 'Airbnb',
  }).input;

  it('a profitable lease produces proceed with all required outputs', () => {
    const a = analyzeDeal(leaseInput);
    // gross = 400*365*0.6 = 87,600; fees 14% → 75,336; costs 12,000 → 63,336 net
    expect(a.expectedNetRevenue.grossAnnual).toBe(87600);
    expect(a.expectedNetRevenue.annual).toBe(63336);
    expect(a.expectedNetRevenue.monthly).toBe(5278);
    expect(a.profitAnnual).toBe(3336);
    expect(a.rentPriceGap).toBeCloseTo(5.56, 1);
    expect(a.verdict).toBe('renegotiate'); // thin margin → renegotiate
    expect(a.counterOffer).toBeLessThan(60000);
    expect(a.negotiationProbability).toBeGreaterThanOrEqual(15);
    expect(a.risks.length).toBeGreaterThan(0);
    expect(a.risks.length).toBeLessThanOrEqual(3);
    expect(a.actions.length).toBeLessThanOrEqual(3);
    expect(a.disclaimer).toBe(INVESTMENT_DISCLAIMER);
  });

  it('a deeply unprofitable lease is an avoid verdict', () => {
    const bad = validateDealInput('lease', {
      expectedNightlyRate: 150,
      expectedOccupancy: 40,
      askingRent: 100000,
      platform: 'Booking.com',
    }).input;
    const a = analyzeDeal(bad);
    expect(a.profitAnnual).toBeLessThan(0);
    expect(a.verdict).toBe('avoid');
    expect(a.dealStrength.score).toBeLessThan(35);
  });

  it('purchase deals use ROI on the asking price and can counter below asking', () => {
    const buy = validateDealInput('purchase', {
      expectedNightlyRate: 500,
      expectedOccupancy: 70,
      askingPrice: 2000000,
      monthlyOperatingCosts: 2000,
      platform: 'Airbnb',
    }).input;
    const a = analyzeDeal(buy);
    expect(a.rentPriceGap).toBeNull();
    expect(a.roiEstimate).toBeGreaterThan(0);
    expect(a.roiEstimate).toBe(Math.round((a.profitAnnual / 2000000) * 10000) / 100);
    if (a.counterOffer !== null) expect(a.counterOffer).toBeLessThan(2000000);
  });

  it('estimated fee rates surface as a risk; confirmed overrides do not', () => {
    const withDefault = analyzeDeal(leaseInput);
    expect(withDefault.risks.some((r) => r.en.includes('estimate'))).toBe(true);
    const withOverride = analyzeDeal(leaseInput, { feeOverrides: { Airbnb: 0.14 } });
    expect(withOverride.risks.some((r) => r.en.includes('fee rate'))).toBe(false);
  });
});

describe('AI narrative guardrails', () => {
  const analysis = analyzeDeal(
    validateDealInput('lease', {
      expectedNightlyRate: 400,
      expectedOccupancy: 60,
      askingRent: 60000,
      platform: 'Airbnb',
    }).input
  );

  it('accepts a narrative that only cites computed numbers', () => {
    const text = `الصفقة قوتها ${analysis.dealStrength.score} من 100 وتحتاج مراجعة قبل الالتزام، وهذه تقديرات وليست ضمانًا.`;
    expect(validateNarrative({ strNarrativeAr: text }, analysis)).toBe(text);
  });

  it('rejects narratives that invent new numbers or are malformed', () => {
    expect(validateNarrative({ strNarrativeAr: 'العائد المضمون 999999 ريال وهذه فرصة لن تتكرر أبدًا في السوق' }, analysis)).toBeNull();
    expect(validateNarrative({ strNarrativeAr: 'قصير' }, analysis)).toBeNull();
    expect(validateNarrative({}, analysis)).toBeNull();
  });

  it('the fallback narrative is Arabic, cites the computed net, and never guarantees', () => {
    const text = buildFallbackNarrative(analysis);
    expect(text).toContain('ريال');
    expect(text).toContain('ليست ضمانًا');
    expect(text).toContain(String(analysis.dealStrength.score));
  });
});
