// Phase 3 — Opportunity request workflow logic (pure, unit-tested).
//
// Shared by the admin follow-up page (src/pages/AdminOpportunityRequests.jsx)
// and the real-estate-opportunities backend function (duplicate-request guard).
// No React, no SDK, no import.meta — so the byte-identical copy in
// base44/functions/real-estate-opportunities/ can run under Deno.
//
// Request records are ADMIN-ONLY (OpportunityRequest RLS: create:false,
// read/update/delete admin-only). Nothing here is ever returned to a
// subscriber except buildDuplicateResponse(), which is deliberately free of
// any internal request detail.

// Full brokerage workflow (Phase 3). The pre-Phase-3 enum was
// ['new','contacted','qualified','closed','rejected']; 'closed' is preserved
// as a legacy terminal status for backward compatibility with old records.
export const REQUEST_STATUSES = [
  'new', 'contacted', 'qualified', 'agreement_pending', 'agreement_signed',
  'negotiating', 'closed_won', 'closed_lost', 'rejected',
];
export const LEGACY_REQUEST_STATUSES = ['closed'];

// A request is "active" (open) unless it has reached a terminal outcome.
// A record with no status is treated as active (a freshly-created 'new').
export const TERMINAL_REQUEST_STATUSES = ['closed_won', 'closed_lost', 'rejected', 'closed'];

export const AGREEMENT_STATUSES = ['none', 'pending', 'sent', 'signed', 'declined'];
export const BROKERAGE_STAGES = ['none', 'initial_contact', 'site_visit', 'negotiation', 'documentation', 'completed'];

export const AR_LABELS = {
  // request status
  new: 'جديد', contacted: 'تم التواصل', qualified: 'مؤهل',
  agreement_pending: 'بانتظار الاتفاقية', agreement_signed: 'تم توقيع الاتفاقية',
  negotiating: 'قيد التفاوض', closed_won: 'صفقة ناجحة', closed_lost: 'صفقة خاسرة',
  rejected: 'مرفوض', closed: 'مغلق',
  // agreement status
  none: 'لا يوجد', pending: 'قيد الانتظار', sent: 'مُرسلة', signed: 'موقّعة', declined: 'مرفوضة',
  // brokerage stage
  initial_contact: 'تواصل مبدئي', site_visit: 'معاينة', negotiation: 'تفاوض',
  documentation: 'توثيق', completed: 'مكتملة',
  // contact methods
  phone: 'اتصال', whatsapp: 'واتساب', email: 'بريد إلكتروني',
};

export function label(value) {
  return AR_LABELS[value] || value || '—';
}

/** True when the status is a terminal outcome (won/lost/rejected/legacy closed). */
export function isTerminalStatus(status) {
  return TERMINAL_REQUEST_STATUSES.includes(status);
}

/** True when a request is still open. A missing status counts as active. */
export function isActiveRequest(request) {
  return !isTerminalStatus(request?.status);
}

/**
 * Find an existing OPEN request by the same user for the same opportunity.
 * Used to block duplicate active submissions. Closed/lost/rejected requests
 * never block a fresh submission. Returns the matching record or null.
 */
export function findActiveDuplicate(requests, userId, opportunityId) {
  if (!Array.isArray(requests) || !userId || !opportunityId) return null;
  return requests.find(
    (r) => r && r.userId === userId && r.opportunityId === opportunityId && isActiveRequest(r)
  ) || null;
}

/**
 * Safe, subscriber-facing response when a duplicate active request is blocked.
 * Contains NO internal request detail (no id, status, notes, mobile, etc.) —
 * just a friendly Arabic acknowledgement.
 */
export function buildDuplicateResponse() {
  return {
    success: true,
    duplicate: true,
    message: 'لديك طلب قائم على هذه الفرصة بالفعل، وسيتواصل معك فريقنا قريبًا.',
  };
}

const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

/**
 * True when a request has a follow-up that is due (next_follow_up_at <= now)
 * and the request is still open. Terminal requests are never "due".
 */
export function isFollowUpDue(request, now = new Date()) {
  if (!request || !isActiveRequest(request) || !hasValue(request.next_follow_up_at)) return false;
  const due = new Date(request.next_follow_up_at);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() <= (now instanceof Date ? now.getTime() : new Date(now).getTime());
}

/**
 * Filter admin request rows. `cityOf` maps an opportunityId → city (optional,
 * since OpportunityRequest doesn't store the city itself). All filters are
 * optional; an empty/"all" value means "don't filter on this".
 */
export function filterRequests(requests, filters = {}, { cityOf, now = new Date() } = {}) {
  const { status, city, agreementStatus, followUpDue } = filters;
  return (Array.isArray(requests) ? requests : []).filter((r) => {
    if (!r) return false;
    if (status && status !== 'all' && (r.status || 'new') !== status) return false;
    if (agreementStatus && agreementStatus !== 'all' && (r.agreement_status || 'none') !== agreementStatus) return false;
    if (city && city !== 'all') {
      const rowCity = typeof cityOf === 'function' ? cityOf(r.opportunityId) : undefined;
      if (rowCity !== city) return false;
    }
    if (followUpDue && !isFollowUpDue(r, now)) return false;
    return true;
  });
}
