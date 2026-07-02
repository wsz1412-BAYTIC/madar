import { describe, it, expect } from 'vitest';
import { applyTransition, isExpired, assessAppliedPrice, RecommendationWorkflowError } from './recommendationWorkflow.js';

const baseRecord = (overrides = {}) => ({
  status: 'pending_review',
  validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  statusHistory: [],
  ...overrides,
});

describe('isExpired', () => {
  it('is false for a future date', () => {
    expect(isExpired(new Date(Date.now() + 10000).toISOString())).toBe(false);
  });

  it('is true for a past date', () => {
    expect(isExpired(new Date(Date.now() - 10000).toISOString())).toBe(true);
  });

  it('is false when validUntil is missing', () => {
    expect(isExpired(undefined)).toBe(false);
  });
});

describe('assessAppliedPrice', () => {
  const min = 116.67;
  const max = 382.5;

  it('accepts a price inside the recommended range', () => {
    expect(assessAppliedPrice(250, min, max)).toEqual({ status: 'ok' });
  });

  it('accepts a price exactly at the range boundaries', () => {
    expect(assessAppliedPrice(min, min, max)).toEqual({ status: 'ok' });
    expect(assessAppliedPrice(max, min, max)).toEqual({ status: 'ok' });
  });

  it('flags a price below the range as needing confirmation (human override allowed)', () => {
    expect(assessAppliedPrice(80, min, max)).toEqual({ status: 'needs_confirmation' });
  });

  it('flags a price above the range as needing confirmation (human override allowed)', () => {
    expect(assessAppliedPrice(450, min, max)).toEqual({ status: 'needs_confirmation' });
  });

  it('rejects a price far enough below the range to be a likely data-entry error', () => {
    expect(assessAppliedPrice(min / 10, min, max)).toEqual({ status: 'invalid', reason: 'unrealistic' });
  });

  it('rejects a price far enough above the range to be a likely data-entry error', () => {
    expect(assessAppliedPrice(max * 10, min, max)).toEqual({ status: 'invalid', reason: 'unrealistic' });
  });

  it('rejects non-numeric values', () => {
    expect(assessAppliedPrice(NaN, min, max)).toEqual({ status: 'invalid', reason: 'not_a_number' });
    expect(assessAppliedPrice(undefined, min, max)).toEqual({ status: 'invalid', reason: 'not_a_number' });
  });

  it('rejects zero and negative values', () => {
    expect(assessAppliedPrice(0, min, max)).toEqual({ status: 'invalid', reason: 'non_positive' });
    expect(assessAppliedPrice(-50, min, max)).toEqual({ status: 'invalid', reason: 'non_positive' });
  });

  it('accepts any positive number when no recommended range is available', () => {
    expect(assessAppliedPrice(999999, null, null)).toEqual({ status: 'ok' });
    expect(assessAppliedPrice(1, undefined, undefined)).toEqual({ status: 'ok' });
  });

  it('still rejects non-positive/non-numeric values even with no range available', () => {
    expect(assessAppliedPrice(0, null, null)).toEqual({ status: 'invalid', reason: 'non_positive' });
    expect(assessAppliedPrice(NaN, null, null)).toEqual({ status: 'invalid', reason: 'not_a_number' });
  });
});

describe('applyTransition - approve', () => {
  it('moves pending_review to approved and records the reviewer', () => {
    const { patch, historyEntry } = applyTransition(baseRecord(), 'approve', {}, 'user-1');
    expect(patch.status).toBe('approved');
    expect(patch.reviewedBy).toBe('user-1');
    expect(historyEntry.status).toBe('approved');
  });

  it('rejects approving a record that is not pending_review', () => {
    expect(() => applyTransition(baseRecord({ status: 'approved' }), 'approve', {}, 'user-1')).toThrow(RecommendationWorkflowError);
  });

  it('rejects approving an expired recommendation', () => {
    const record = baseRecord({ validUntil: new Date(Date.now() - 1000).toISOString() });
    try {
      applyTransition(record, 'approve', {}, 'user-1');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RecommendationWorkflowError);
      expect(err.code).toBe('expired');
    }
  });
});

describe('applyTransition - reject', () => {
  it('requires a rejection reason', () => {
    expect(() => applyTransition(baseRecord(), 'reject', {}, 'user-1')).toThrow(RecommendationWorkflowError);
  });

  it('moves pending_review to rejected with a reason', () => {
    const { patch } = applyTransition(baseRecord(), 'reject', { rejectionReason: 'too aggressive' }, 'user-1');
    expect(patch.status).toBe('rejected');
    expect(patch.rejectionReason).toBe('too aggressive');
  });
});

describe('applyTransition - apply (the only place a price can change)', () => {
  const approvedWithRange = (overrides = {}) =>
    baseRecord({ status: 'approved', recommendedPriceMin: 116.67, recommendedPriceMax: 382.5, ...overrides });

  it('refuses to apply a recommendation that was never approved', () => {
    expect(() => applyTransition(baseRecord({ status: 'pending_review' }), 'apply', { appliedPrice: 350 }, 'user-1'))
      .toThrow(RecommendationWorkflowError);
  });

  it('requires a positive appliedPrice', () => {
    expect(() => applyTransition(baseRecord({ status: 'approved' }), 'apply', {}, 'user-1')).toThrow(RecommendationWorkflowError);
    expect(() => applyTransition(baseRecord({ status: 'approved' }), 'apply', { appliedPrice: -10 }, 'user-1')).toThrow(RecommendationWorkflowError);
  });

  it('moves approved to applied and records who/when/what price', () => {
    const { patch } = applyTransition(baseRecord({ status: 'approved' }), 'apply', { appliedPrice: 350 }, 'user-1');
    expect(patch.status).toBe('applied');
    expect(patch.appliedPrice).toBe(350);
    expect(patch.appliedBy).toBe('user-1');
    expect(patch.appliedAt).toBeTruthy();
  });

  it('cannot be applied twice', () => {
    expect(() => applyTransition(baseRecord({ status: 'applied' }), 'apply', { appliedPrice: 350 }, 'user-1'))
      .toThrow(RecommendationWorkflowError);
  });

  // --- Safety check on the applied price ---

  it('price inside range: applies immediately, not flagged as an override', () => {
    const { patch, historyEntry } = applyTransition(approvedWithRange(), 'apply', { appliedPrice: 250 }, 'user-1');
    expect(patch.appliedPrice).toBe(250);
    expect(patch.isManualOverride).toBe(false);
    expect(patch.appliedPriceRangeMin).toBe(116.67);
    expect(patch.appliedPriceRangeMax).toBe(382.5);
    expect(historyEntry.note).toBe('apply');
  });

  it('price below range: requires explicit confirmOverride before applying', () => {
    expect(() => applyTransition(approvedWithRange(), 'apply', { appliedPrice: 80 }, 'user-1'))
      .toThrow(RecommendationWorkflowError);
    try {
      applyTransition(approvedWithRange(), 'apply', { appliedPrice: 80 }, 'user-1');
    } catch (err) {
      expect(err.code).toBe('override_confirmation_required');
    }
  });

  it('price above range: requires explicit confirmOverride before applying', () => {
    try {
      applyTransition(approvedWithRange(), 'apply', { appliedPrice: 450 }, 'user-1');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RecommendationWorkflowError);
      expect(err.code).toBe('override_confirmation_required');
    }
  });

  it('confirmed manual override: applies out-of-range price and records the override + original range', () => {
    const { patch, historyEntry } = applyTransition(
      approvedWithRange(),
      'apply',
      { appliedPrice: 450, confirmOverride: true },
      'user-1'
    );
    expect(patch.appliedPrice).toBe(450);
    expect(patch.isManualOverride).toBe(true);
    expect(patch.appliedPriceRangeMin).toBe(116.67);
    expect(patch.appliedPriceRangeMax).toBe(382.5);
    expect(historyEntry.note).toBe('apply:manual_override');
  });

  it('confirmOverride alone does not bypass validity checks for a clearly invalid price', () => {
    try {
      applyTransition(approvedWithRange(), 'apply', { appliedPrice: -50, confirmOverride: true }, 'user-1');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RecommendationWorkflowError);
      expect(err.code).toBe('invalid_price');
    }
  });

  it('rejects a non-numeric appliedPrice with a clear error code', () => {
    try {
      applyTransition(approvedWithRange(), 'apply', { appliedPrice: 'a lot' }, 'user-1');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.code).toBe('invalid_price');
    }
  });

  it('rejects zero/negative appliedPrice with a clear error code', () => {
    for (const bad of [0, -10]) {
      try {
        applyTransition(approvedWithRange(), 'apply', { appliedPrice: bad }, 'user-1');
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.code).toBe('invalid_price');
      }
    }
  });

  it('rejects an unrealistic accidental value far outside the range, even with confirmOverride', () => {
    try {
      applyTransition(approvedWithRange(), 'apply', { appliedPrice: 38250, confirmOverride: true }, 'user-1');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RecommendationWorkflowError);
      expect(err.code).toBe('unrealistic_price');
    }
  });

  it('applies any positive price without an override flag when no recommended range exists', () => {
    const { patch } = applyTransition(baseRecord({ status: 'approved' }), 'apply', { appliedPrice: 99999 }, 'user-1');
    expect(patch.isManualOverride).toBe(false);
    expect(patch.appliedPriceRangeMin).toBeNull();
    expect(patch.appliedPriceRangeMax).toBeNull();
  });
});

describe('applyTransition - record_outcome', () => {
  it('only allowed once a recommendation has been applied', () => {
    expect(() => applyTransition(baseRecord({ status: 'approved' }), 'record_outcome', { actualOccupancy: 0.7 }, 'user-1'))
      .toThrow(RecommendationWorkflowError);
  });

  it('records actual results without changing status', () => {
    const record = baseRecord({ status: 'applied' });
    const { patch, historyEntry } = applyTransition(record, 'record_outcome', {
      actualOccupancy: 0.72,
      actualAdr: 310,
      actualRevenue: 9500,
    }, 'user-1');
    expect(patch.actualOccupancy).toBe(0.72);
    expect(patch.actualAdr).toBe(310);
    expect(patch.actualRevenue).toBe(9500);
    expect(historyEntry.status).toBe('applied');
  });
});

describe('applyTransition - misuse', () => {
  it('rejects an unknown action', () => {
    expect(() => applyTransition(baseRecord(), 'delete_everything', {}, 'user-1')).toThrow(RecommendationWorkflowError);
  });

  it('requires an actor', () => {
    expect(() => applyTransition(baseRecord(), 'approve', {}, undefined)).toThrow(RecommendationWorkflowError);
  });

  it('does not mutate the input record', () => {
    const record = baseRecord();
    const snapshot = JSON.stringify(record);
    applyTransition(record, 'approve', {}, 'user-1');
    expect(JSON.stringify(record)).toBe(snapshot);
  });
});
