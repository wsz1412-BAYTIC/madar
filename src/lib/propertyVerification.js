// Phase 2 — Admin Property Verification logic (pure, unit-tested).
//
// This module does NOT talk to any official registry (REGA / Ejar / Balady /
// MOJ are deferred). It structures a manual/declared verification record,
// compares declared data against a linked RealEstateOpportunity, and — most
// importantly — ENFORCES HONESTY: a record can only be marked "verified" /
// "partially_verified" when it carries at least one source of type "official".
// Otherwise the status is downgraded to requires_authorization / unavailable,
// so Madar never claims live official verification it cannot back up.
//
// No React, no SDK — consumed by src/pages/AdminPropertyVerification.jsx.

export const SEARCH_TYPES = ['deed_number', 'municipal_license', 'building_permit'];
export const OFFICIAL_DATA_STATUSES = ['not_checked', 'verified', 'partially_verified', 'unavailable', 'conflict', 'requires_authorization'];
export const VERIFICATION_CONFIDENCES = ['low', 'medium', 'high'];
export const VERIFICATION_RESULTS = ['verified_property', 'verified_with_notes', 'needs_documents', 'data_conflict', 'rejected'];
export const SOURCE_TYPES = ['official', 'user_provided', 'third_party', 'manual_review'];

// Statuses that assert official confirmation — only reachable WITH an official source.
const OFFICIAL_CLAIM_STATUSES = new Set(['verified', 'partially_verified']);

// Declared fields compared against a linked opportunity.
export const COMPARABLE_FIELDS = ['city', 'district', 'property_type', 'area_declared', 'location_declared'];

export const AR_LABELS = {
  // search types
  deed_number: 'رقم الصك', municipal_license: 'رخصة البلدية', building_permit: 'رخصة البناء',
  // official_data_status
  not_checked: 'لم يتم التحقق', verified: 'موثّق', partially_verified: 'موثّق جزئيًا', unavailable: 'غير متاح', conflict: 'تعارض', requires_authorization: 'يتطلب تفويضًا',
  // confidence
  low: 'منخفضة', medium: 'متوسطة', high: 'عالية',
  // verification_result
  verified_property: 'عقار موثّق', verified_with_notes: 'موثّق مع ملاحظات', needs_documents: 'يحتاج مستندات', data_conflict: 'تعارض بيانات', rejected: 'مرفوض',
  // source types
  official: 'رسمي', user_provided: 'من المستخدم', third_party: 'طرف ثالث', manual_review: 'مراجعة يدوية',
  // comparable fields
  city: 'المدينة', district: 'الحي', property_type: 'نوع العقار', area_declared: 'المساحة المعلنة', location_declared: 'الموقع المعلن',
};

export function label(value) {
  return AR_LABELS[value] || value || '—';
}

const norm = (v) => String(v ?? '').trim().toLowerCase();
const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

/** True when at least one source is an official registry entry. */
export function hasOfficialSource(sources) {
  return Array.isArray(sources) && sources.some((s) => s && s.type === 'official' && hasValue(s.name));
}

/**
 * Compare the declared verification fields against a linked opportunity.
 * Returns { matched, missing, conflicting } arrays of field keys.
 *  - matched: both present AND equal
 *  - conflicting: both present AND different
 *  - missing: absent on the verification OR on the opportunity
 * When no opportunity is linked, every declared field is "missing" (nothing to
 * compare against) — we never fabricate a match.
 */
export function compareWithOpportunity(verification = {}, opportunity = null) {
  const matched = [];
  const missing = [];
  const conflicting = [];
  // Map opportunity fields onto the verification's declared vocabulary.
  const oppView = opportunity
    ? {
        city: opportunity.city,
        district: opportunity.district_internal,
        property_type: opportunity.property_type,
        area_declared: opportunity.area,
        location_declared: opportunity.location_internal,
      }
    : null;

  for (const field of COMPARABLE_FIELDS) {
    const v = verification[field];
    const o = oppView ? oppView[field] : undefined;
    if (!oppView) { missing.push(field); continue; }
    if (!hasValue(v) || !hasValue(o)) { missing.push(field); continue; }
    if (norm(v) === norm(o)) matched.push(field);
    else conflicting.push(field);
  }
  return { matched, missing, conflicting };
}

/**
 * Honesty guard: given the admin's intended official_data_status and the
 * source list, return the status Madar is ALLOWED to store. Any official
 * claim without an official source is downgraded to 'requires_authorization'.
 * A 'conflict' claim is preserved (it's a negative finding, not a claim).
 */
export function guardOfficialStatus(intendedStatus, sources) {
  const status = OFFICIAL_DATA_STATUSES.includes(intendedStatus) ? intendedStatus : 'not_checked';
  if (OFFICIAL_CLAIM_STATUSES.has(status) && !hasOfficialSource(sources)) {
    return 'requires_authorization';
  }
  return status;
}

/**
 * Suggest a verification_result + confidence from the comparison + status.
 * Purely advisory — the admin can override in the form. Never returns a
 * "verified_property" result unless the guarded status is an official claim.
 */
export function suggestClassification({ comparison, guardedStatus }) {
  const { matched = [], missing = [], conflicting = [] } = comparison || {};
  const officialClaim = OFFICIAL_CLAIM_STATUSES.has(guardedStatus);

  if (conflicting.length > 0 || guardedStatus === 'conflict') {
    return { verification_result: 'data_conflict', verification_confidence: 'low' };
  }
  if (!officialClaim) {
    // No official backing → cannot assert a verified property.
    return {
      verification_result: missing.length > matched.length ? 'needs_documents' : 'verified_with_notes',
      verification_confidence: 'low',
    };
  }
  if (missing.length === 0 && matched.length >= 3) {
    return { verification_result: 'verified_property', verification_confidence: 'high' };
  }
  return {
    verification_result: 'verified_with_notes',
    verification_confidence: matched.length >= 2 ? 'medium' : 'low',
  };
}

/** Sanitize/normalize one manually-entered source row. Returns null if unusable. */
export function normalizeSource(raw = {}) {
  const name = String(raw.name ?? '').trim();
  if (!name) return null;
  return {
    name,
    type: SOURCE_TYPES.includes(raw.type) ? raw.type : 'manual_review',
    reference: String(raw.reference ?? '').trim(),
    retrieved_date: hasValue(raw.retrieved_date) ? String(raw.retrieved_date) : null,
    confidence: VERIFICATION_CONFIDENCES.includes(raw.confidence) ? raw.confidence : 'low',
  };
}

/**
 * Validate the search form. Deed number required for deed_number searches;
 * the matching license/permit number required for those types; city required.
 * Returns { valid, errors } where errors maps field → Arabic message.
 */
export function validateVerificationForm(form = {}) {
  const errors = {};
  if (!SEARCH_TYPES.includes(form.search_type)) errors.search_type = 'اختر نوع البحث';
  if (!hasValue(form.city)) errors.city = 'أدخل المدينة';
  if (form.search_type === 'deed_number' && !hasValue(form.deed_number)) errors.deed_number = 'أدخل رقم الصك';
  if (form.search_type === 'municipal_license' && !hasValue(form.municipal_license_number)) errors.municipal_license_number = 'أدخل رقم رخصة البلدية';
  if (form.search_type === 'building_permit' && !hasValue(form.building_permit_number)) errors.building_permit_number = 'أدخل رقم رخصة البناء';
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Build the PropertyVerification create/update payload from a validated form,
 * the (optional) linked opportunity, and the source list. Applies the honesty
 * guard and computes the field comparison + a suggested classification.
 * The admin's explicit result/confidence (when provided) win over suggestions.
 */
export function buildVerificationPayload(form = {}, opportunity = null, { now = new Date() } = {}) {
  const sources = (form.source_list || []).map(normalizeSource).filter(Boolean);
  const comparison = compareWithOpportunity(form, opportunity);
  const guardedStatus = guardOfficialStatus(form.official_data_status, sources);
  const suggestion = suggestClassification({ comparison, guardedStatus });

  return {
    search_type: form.search_type,
    deed_number: hasValue(form.deed_number) ? String(form.deed_number).trim() : null,
    deed_date: hasValue(form.deed_date) ? String(form.deed_date) : null,
    municipal_license_number: hasValue(form.municipal_license_number) ? String(form.municipal_license_number).trim() : null,
    building_permit_number: hasValue(form.building_permit_number) ? String(form.building_permit_number).trim() : null,
    city: hasValue(form.city) ? String(form.city).trim() : null,
    district: hasValue(form.district) ? String(form.district).trim() : null,
    property_type: hasValue(form.property_type) ? String(form.property_type).trim() : null,
    area_declared: hasValue(form.area_declared) ? form.area_declared : null,
    location_declared: hasValue(form.location_declared) ? String(form.location_declared).trim() : null,
    related_opportunity_id: opportunity?.id || (hasValue(form.related_opportunity_id) ? String(form.related_opportunity_id) : null),
    official_data_status: guardedStatus,
    verification_confidence: VERIFICATION_CONFIDENCES.includes(form.verification_confidence) ? form.verification_confidence : suggestion.verification_confidence,
    matched_fields: comparison.matched,
    missing_fields: comparison.missing,
    conflicting_fields: comparison.conflicting,
    source_list: sources,
    notes_internal: hasValue(form.notes_internal) ? String(form.notes_internal).trim() : null,
    verification_result: VERIFICATION_RESULTS.includes(form.verification_result) ? form.verification_result : suggestion.verification_result,
    created_at: form.created_at || now.toISOString(),
    updated_at: form.created_at ? now.toISOString() : null,
  };
}

/** Is the property fit for investor analysis? Honest, never a guarantee. */
export function investmentReadiness(result, lang = 'ar') {
  const ready = result === 'verified_property';
  const caution = result === 'verified_with_notes';
  if (lang === 'ar') {
    if (ready) return { ok: true, text: 'نعم — العقار موثّق ويصلح للانتقال إلى التحليل الاستثماري.' };
    if (caution) return { ok: null, text: 'بشروط — موثّق مع ملاحظات؛ راجع البيانات الناقصة قبل التحليل.' };
    return { ok: false, text: 'ليس بعد — يلزم مستندات أو حل التعارضات قبل التحليل الاستثماري.' };
  }
  if (ready) return { ok: true, text: 'Yes — verified and ready for investment analysis.' };
  if (caution) return { ok: null, text: 'Conditional — verified with notes; review missing data first.' };
  return { ok: false, text: 'Not yet — documents or conflict resolution needed before analysis.' };
}
