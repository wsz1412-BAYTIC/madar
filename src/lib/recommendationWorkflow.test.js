import { describe, it, expect } from 'vitest';
import { applyTransition, isExpired, RecommendationWorkflowError } from './recommendationWorkflow.js';

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
