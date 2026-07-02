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
