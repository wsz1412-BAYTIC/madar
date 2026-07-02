/**
 * Pure state-machine for the human-approval workflow around a price
 * recommendation. No price is ever changed anywhere in this app except
 * through the explicit "apply" transition below, which can only be reached
 * after an explicit "approve" transition by a human. Nothing auto-applies.
 *
 * Dependency-free so this file can be mirrored byte-for-byte into
 * base44/functions/*\/recommendationWorkflow.js and run on Deno. Keep both
 * copies identical.
 */

export const STATUSES = ['pending_review', 'approved', 'rejected', 'applied', 'expired'];

export const ACTIONS = ['approve', 'reject', 'apply', 'record_outcome'];

const TRANSITIONS = {
  approve: { from: 'pending_review', to: 'approved' },
  reject: { from: 'pending_review', to: 'rejected' },
  apply: { from: 'approved', to: 'applied' },
};

export class RecommendationWorkflowError extends Error {
  constructor(code, message) {
    super(message || code);
    this.name = 'RecommendationWorkflowError';
    this.code = code;
  }
}

export function isExpired(validUntil, now = new Date()) {
  if (!validUntil) return false;
  const expiry = new Date(validUntil);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() < new Date(now).getTime();
}

/**
 * Validates and computes the entity patch + history entry for a requested
 * action on a recommendation record. Throws RecommendationWorkflowError on
 * any invalid transition; never mutates the input record.
 *
 * @param {object} record - current PriceRecommendation record (status, validUntil, ...)
 * @param {'approve'|'reject'|'apply'|'record_outcome'} action
 * @param {object} payload - action-specific fields (rejectionReason, appliedPrice, actual*)
 * @param {string} actorUserId
 * @param {Date} [now]
 */
export function applyTransition(record, action, payload = {}, actorUserId, now = new Date()) {
  if (!ACTIONS.includes(action)) {
    throw new RecommendationWorkflowError('unknown_action', `Unknown action: ${action}`);
  }
  if (!actorUserId) {
    throw new RecommendationWorkflowError('missing_actor', 'actorUserId is required');
  }

  const nowIso = new Date(now).toISOString();
  const historyEntry = { status: null, byUserId: actorUserId, at: nowIso, note: null };

  if (action === 'record_outcome') {
    if (record.status !== 'applied') {
      throw new RecommendationWorkflowError(
        'invalid_transition',
        `Cannot record outcome for a recommendation in status "${record.status}"; must be "applied"`
      );
    }
    const patch = {};
    if (Number.isFinite(payload.actualOccupancy)) patch.actualOccupancy = payload.actualOccupancy;
    if (Number.isFinite(payload.actualAdr)) patch.actualAdr = payload.actualAdr;
    if (Number.isFinite(payload.actualRevenue)) patch.actualRevenue = payload.actualRevenue;
    patch.actualResultsRecordedAt = nowIso;
    return {
      patch,
      historyEntry: { ...historyEntry, status: record.status, note: 'outcome_recorded' },
    };
  }

  const transition = TRANSITIONS[action];
  if (record.status === 'expired' || (record.status !== transition.to && isExpired(record.validUntil, now))) {
    throw new RecommendationWorkflowError('expired', 'This recommendation is no longer valid (past validUntil)');
  }
  if (record.status !== transition.from) {
    throw new RecommendationWorkflowError(
      'invalid_transition',
      `Cannot "${action}" a recommendation in status "${record.status}"; expected "${transition.from}"`
    );
  }

  const patch = { status: transition.to };

  if (action === 'approve') {
    patch.reviewedBy = actorUserId;
    patch.reviewedAt = nowIso;
  }

  if (action === 'reject') {
    if (typeof payload.rejectionReason !== 'string' || payload.rejectionReason.trim().length === 0) {
      throw new RecommendationWorkflowError('missing_field', 'rejectionReason is required to reject a recommendation');
    }
    patch.reviewedBy = actorUserId;
    patch.reviewedAt = nowIso;
    patch.rejectionReason = payload.rejectionReason.trim();
  }

  if (action === 'apply') {
    if (!Number.isFinite(payload.appliedPrice) || payload.appliedPrice <= 0) {
      throw new RecommendationWorkflowError('missing_field', 'appliedPrice (a positive number) is required to apply a recommendation');
    }
    patch.appliedPrice = payload.appliedPrice;
    patch.appliedAt = nowIso;
    patch.appliedBy = actorUserId;
  }

  return {
    patch,
    historyEntry: { ...historyEntry, status: transition.to, note: action },
  };
}
