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

// A human is always allowed to override the recommended range, but a price
// this far outside it (5x) is almost certainly a data-entry mistake (an
// extra digit, wrong currency, etc.) rather than a deliberate decision, so
// it's rejected outright instead of offered as a confirmable override.
const OVERRIDE_HARD_LIMIT_MULTIPLIER = 5;

/**
 * Assesses a human-entered appliedPrice against the deterministic
 * recommended range. Single source of truth for "clearly invalid" vs
 * "needs an explicit override confirmation" vs "fine" — used both
 * server-side (to actually enforce it) and client-side (for instant
 * feedback without a round trip).
 *
 * @param {number} appliedPrice
 * @param {number|null|undefined} recommendedPriceMin
 * @param {number|null|undefined} recommendedPriceMax
 * @returns {{status: 'invalid', reason: 'not_a_number'|'non_positive'|'unrealistic'} | {status: 'needs_confirmation'} | {status: 'ok'}}
 */
export function assessAppliedPrice(appliedPrice, recommendedPriceMin, recommendedPriceMax) {
  if (!Number.isFinite(appliedPrice)) {
    return { status: 'invalid', reason: 'not_a_number' };
  }
  if (appliedPrice <= 0) {
    return { status: 'invalid', reason: 'non_positive' };
  }
  const hasRange = Number.isFinite(recommendedPriceMin) && Number.isFinite(recommendedPriceMax);
  if (!hasRange) {
    return { status: 'ok' };
  }
  const hardMin = recommendedPriceMin / OVERRIDE_HARD_LIMIT_MULTIPLIER;
  const hardMax = recommendedPriceMax * OVERRIDE_HARD_LIMIT_MULTIPLIER;
  if (appliedPrice < hardMin || appliedPrice > hardMax) {
    return { status: 'invalid', reason: 'unrealistic' };
  }
  if (appliedPrice < recommendedPriceMin || appliedPrice > recommendedPriceMax) {
    return { status: 'needs_confirmation' };
  }
  return { status: 'ok' };
}

const APPLY_INVALID_MESSAGES = {
  not_a_number: 'appliedPrice must be a number',
  non_positive: 'appliedPrice must be a positive number',
  unrealistic: 'appliedPrice is far outside the recommended range and was rejected as a likely data-entry error',
};

/**
 * Validates and computes the entity patch + history entry for a requested
 * action on a recommendation record. Throws RecommendationWorkflowError on
 * any invalid transition; never mutates the input record.
 *
 * @param {object} record - current PriceRecommendation record (status, validUntil, recommendedPriceMin/Max, ...)
 * @param {'approve'|'reject'|'apply'|'record_outcome'} action
 * @param {object} payload - action-specific fields (rejectionReason, appliedPrice,
 *   confirmOverride - required to be `true` when appliedPrice is outside the
 *   recommended range, actual*)
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

  /** @type {string} */
  let historyNote = action;

  if (action === 'apply') {
    const assessment = assessAppliedPrice(payload.appliedPrice, record.recommendedPriceMin, record.recommendedPriceMax);
    if (assessment.status === 'invalid') {
      throw new RecommendationWorkflowError(
        assessment.reason === 'unrealistic' ? 'unrealistic_price' : 'invalid_price',
        APPLY_INVALID_MESSAGES[assessment.reason]
      );
    }

    const isOverride = assessment.status === 'needs_confirmation';
    if (isOverride && payload.confirmOverride !== true) {
      throw new RecommendationWorkflowError(
        'override_confirmation_required',
        'appliedPrice is outside the recommended range; resubmit with confirmOverride: true to proceed'
      );
    }

    patch.appliedPrice = payload.appliedPrice;
    patch.appliedAt = nowIso;
    patch.appliedBy = actorUserId;
    patch.isManualOverride = isOverride;
    // Snapshot the range that was in effect at apply time, independent of
    // the top-level recommendedPriceMin/Max fields, so the override record
    // is self-contained even if those fields are ever touched elsewhere.
    patch.appliedPriceRangeMin = Number.isFinite(record.recommendedPriceMin) ? record.recommendedPriceMin : null;
    patch.appliedPriceRangeMax = Number.isFinite(record.recommendedPriceMax) ? record.recommendedPriceMax : null;
    historyNote = isOverride ? 'apply:manual_override' : 'apply';
  }

  return {
    patch,
    historyEntry: { ...historyEntry, status: transition.to, note: historyNote },
  };
}
