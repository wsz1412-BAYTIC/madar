import { describe, it, expect } from 'vitest';
import { buildMetricsSnapshot } from './pricingEngine.js';
import { validateAiResponse, buildFallbackRecommendation } from './aiRecommendationValidation.js';
import { applyTransition } from './recommendationWorkflow.js';

// Integration tests: exercise the same sequence base44/functions/generate-price-recommendation/entry.ts
// and base44/functions/review-price-recommendation/entry.ts run in production, end to end, across module
// boundaries (pricingEngine -> aiRecommendationValidation -> recommendationWorkflow).

const property = {
  userId: 'user-1',
  currentOccupancy: 55,
  averageAdr: 280,
  monthlyRevenue: 8000,
  operatingCosts: 2200,
};

function buildRecordFromAiOutcome(snapshot, recommendation, source) {
  return {
    userId: property.userId,
    status: 'pending_review',
    source,
    confidence: recommendation.confidence,
    inputMetrics: snapshot,
    recommendedPriceMin: snapshot.priceFloor,
    recommendedPriceMax: snapshot.priceCeiling,
    summaryAr: recommendation.summaryAr,
    actionsAr: recommendation.actionsAr,
    caveatsAr: recommendation.caveatsAr,
    citedMetricKeys: recommendation.citedMetricKeys,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    statusHistory: [],
  };
}

describe('generate-price-recommendation flow', () => {
  it('AI success path: a well-formed, grounded AI response is persisted as source=ai', () => {
    const snapshot = buildMetricsSnapshot(property);
    const aiRaw = {
      summaryAr: 'الأداء الحالي مستقر بناءً على البيانات المتاحة.',
      actionsAr: ['راقب نسبة الإشغال قبل أي تعديل كبير على السعر.'],
      caveatsAr: [],
      confidence: 'medium',
      citedMetricKeys: ['occupancyRate', 'adr', 'breakEvenPrice'],
    };

    const validation = validateAiResponse(aiRaw, snapshot);
    expect(validation.valid).toBe(true);

    const record = buildRecordFromAiOutcome(snapshot, validation.data, 'ai');
    expect(record.source).toBe('ai');
    expect(record.status).toBe('pending_review');
  });

  it('AI unavailable path (no API key / network failure): falls back deterministically, never blocking the user', () => {
    const snapshot = buildMetricsSnapshot(property);
    const fallback = buildFallbackRecommendation(snapshot);
    const record = buildRecordFromAiOutcome(snapshot, fallback, 'fallback');

    expect(record.source).toBe('fallback');
    expect(record.summaryAr).toBeTruthy();
    expect(record.actionsAr.length).toBeGreaterThan(0);
  });

  it('AI hallucination path: an invalid AI response is rejected and the system falls back instead of persisting bad data', () => {
    const snapshot = buildMetricsSnapshot(property);
    const badAiRaw = {
      summaryAr: 'ينصح بمنافسة الفندق المجاور بسعر 777 ريال بناءً على تحليل السوق.',
      actionsAr: ['اخفض السعر إلى 777 ريال فوراً.'],
      caveatsAr: [],
      confidence: 'high',
      citedMetricKeys: ['occupancyRate', 'competitorHotelPrice'],
    };

    const validation = validateAiResponse(badAiRaw, snapshot);
    expect(validation.valid).toBe(false);

    // Production code path: on invalid AI output, fall back rather than persisting badAiRaw.
    const fallback = buildFallbackRecommendation(snapshot);
    const record = buildRecordFromAiOutcome(snapshot, fallback, 'fallback');
    expect(record.source).toBe('fallback');
    expect(record.summaryAr).not.toContain('777');
  });
});

describe('review-price-recommendation flow (human approval gate)', () => {
  it('a full happy-path lifecycle: generated -> approved -> applied -> outcome recorded', () => {
    const snapshot = buildMetricsSnapshot(property);
    const fallback = buildFallbackRecommendation(snapshot);
    let record = buildRecordFromAiOutcome(snapshot, fallback, 'fallback');

    // Nothing is applied yet.
    expect(record.status).toBe('pending_review');
    expect(record.appliedPrice).toBeUndefined();

    const approveResult = applyTransition(record, 'approve', {}, 'user-1');
    record = { ...record, ...approveResult.patch, statusHistory: [...record.statusHistory, approveResult.historyEntry] };
    expect(record.status).toBe('approved');
    expect(record.appliedPrice).toBeUndefined();

    const applyResult = applyTransition(record, 'apply', { appliedPrice: 295 }, 'user-1');
    record = { ...record, ...applyResult.patch, statusHistory: [...record.statusHistory, applyResult.historyEntry] };
    expect(record.status).toBe('applied');
    expect(record.appliedPrice).toBe(295);

    const outcomeResult = applyTransition(record, 'record_outcome', { actualOccupancy: 0.62, actualAdr: 290, actualRevenue: 8200 }, 'user-1');
    record = { ...record, ...outcomeResult.patch };
    expect(record.actualOccupancy).toBe(0.62);
    expect(record.status).toBe('applied');
  });

  it('a rejected recommendation can never reach applied', () => {
    const snapshot = buildMetricsSnapshot(property);
    const fallback = buildFallbackRecommendation(snapshot);
    let record = buildRecordFromAiOutcome(snapshot, fallback, 'fallback');

    const rejectResult = applyTransition(record, 'reject', { rejectionReason: 'price too high for the area' }, 'user-1');
    record = { ...record, ...rejectResult.patch };
    expect(record.status).toBe('rejected');

    expect(() => applyTransition(record, 'apply', { appliedPrice: 300 }, 'user-1')).toThrow();
  });
});

describe('apply-price safety check (end to end from generation through apply)', () => {
  function approvedRecord() {
    const snapshot = buildMetricsSnapshot(property);
    const fallback = buildFallbackRecommendation(snapshot);
    let record = buildRecordFromAiOutcome(snapshot, fallback, 'fallback');
    // A real recommendedPriceMin/Max, computed the same way generate-price-recommendation would.
    expect(record.recommendedPriceMin).toBeGreaterThan(0);
    expect(record.recommendedPriceMax).toBeGreaterThan(record.recommendedPriceMin);
    const approveResult = applyTransition(record, 'approve', {}, 'user-1');
    record = { ...record, ...approveResult.patch };
    expect(record.status).toBe('approved');
    return record;
  }

  it('price inside the recommended range: applies in one step, not flagged as an override', () => {
    const record = approvedRecord();
    const midpoint = (record.recommendedPriceMin + record.recommendedPriceMax) / 2;
    const { patch } = applyTransition(record, 'apply', { appliedPrice: midpoint }, 'user-1');
    expect(patch.status).toBe('applied');
    expect(patch.isManualOverride).toBe(false);
  });

  it('price below the recommended range: first attempt is blocked pending confirmation, human override still allowed', () => {
    const record = approvedRecord();
    const belowRange = record.recommendedPriceMin * 0.7;

    let firstAttemptError = null;
    try {
      applyTransition(record, 'apply', { appliedPrice: belowRange }, 'user-1');
    } catch (err) {
      firstAttemptError = err;
    }
    expect(firstAttemptError?.code).toBe('override_confirmation_required');
    expect(record.status).toBe('approved'); // unchanged — nothing was applied by the blocked attempt

    // Human explicitly confirms the override.
    const { patch } = applyTransition(record, 'apply', { appliedPrice: belowRange, confirmOverride: true }, 'user-1');
    expect(patch.status).toBe('applied');
    expect(patch.appliedPrice).toBe(belowRange);
    expect(patch.isManualOverride).toBe(true);
    expect(patch.appliedPriceRangeMin).toBe(record.recommendedPriceMin);
    expect(patch.appliedPriceRangeMax).toBe(record.recommendedPriceMax);
  });

  it('price above the recommended range: first attempt is blocked pending confirmation, human override still allowed', () => {
    const record = approvedRecord();
    const aboveRange = record.recommendedPriceMax * 1.3;

    expect(() => applyTransition(record, 'apply', { appliedPrice: aboveRange }, 'user-1')).toThrow();

    const { patch } = applyTransition(record, 'apply', { appliedPrice: aboveRange, confirmOverride: true }, 'user-1');
    expect(patch.status).toBe('applied');
    expect(patch.isManualOverride).toBe(true);
  });

  it('rejects a clearly invalid appliedPrice (zero, negative, non-numeric) without ever reaching "applied"', () => {
    const record = approvedRecord();
    for (const bad of [0, -100, NaN, 'not-a-price']) {
      expect(() => applyTransition(record, 'apply', { appliedPrice: bad }, 'user-1')).toThrow();
    }
    expect(record.status).toBe('approved');
  });

  it('rejects an unrealistic accidental value (e.g. an extra digit) even with confirmOverride, unlike a genuine override', () => {
    const record = approvedRecord();
    const accidentalExtraDigit = record.recommendedPriceMax * 10;
    try {
      applyTransition(record, 'apply', { appliedPrice: accidentalExtraDigit, confirmOverride: true }, 'user-1');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.code).toBe('unrealistic_price');
    }
  });
});
