// PR A — Site Updates / changelog logic (pure, unit-tested).
//
// Consumed by the admin manager (src/pages/AdminSiteUpdates.jsx) and the
// public page (src/pages/PlatformUpdates.jsx). No React, no SDK.
//
// SiteUpdate has no sensitive/PII fields, but `is_published` is an internal
// flag: drafts must never reach the public page. The entity RLS already
// filters drafts for non-admins; publishedUpdates() + toPublicUpdate() add
// defense-in-depth on the client and strip the internal flag from public output.

export const UPDATE_TYPES = ['feature', 'improvement', 'fix', 'announcement'];

export const AR_LABELS = {
  feature: 'ميزة', improvement: 'تحسين', fix: 'إصلاح', announcement: 'إعلان',
};
export const EN_LABELS = {
  feature: 'Feature', improvement: 'Improvement', fix: 'Fix', announcement: 'Announcement',
};

export function label(value, lang = 'ar') {
  const map = lang === 'ar' ? AR_LABELS : EN_LABELS;
  return map[value] || value || '—';
}

// Fields safe to expose on the public page — deliberately excludes is_published
// and any Base44 bookkeeping fields (created_by, etc.).
export const PUBLIC_UPDATE_FIELDS = ['id', 'title_ar', 'title_en', 'description_ar', 'description_en', 'date', 'type'];

/** True only when the update is explicitly published. */
export function isPublished(update) {
  return update?.is_published === true;
}

/** Keep only published updates (drafts excluded). */
export function publishedUpdates(list) {
  return (Array.isArray(list) ? list : []).filter(isPublished);
}

/** Newest-first by `date` (falls back to created_date). Returns a new array. */
export function sortByDateDesc(list) {
  const time = (u) => {
    const d = new Date(u?.date || u?.created_date || 0).getTime();
    return Number.isNaN(d) ? 0 : d;
  };
  return [...(Array.isArray(list) ? list : [])].sort((a, b) => time(b) - time(a));
}

/**
 * Whitelist an update down to the public-safe shape (no is_published, no
 * bookkeeping). Never invents fields; missing values become null.
 */
export function toPublicUpdate(update = {}) {
  return PUBLIC_UPDATE_FIELDS.reduce((safe, field) => {
    safe[field] = update[field] ?? null;
    return safe;
  }, {});
}

/**
 * The full public feed: published only, newest first, sanitized. Whatever the
 * caller passes in (even if it accidentally includes drafts), the output can
 * never contain a draft or the internal is_published flag.
 */
export function publicFeed(list) {
  return sortByDateDesc(publishedUpdates(list)).map(toPublicUpdate);
}

/** Resolve the display title/description for a language, with graceful fallback. */
export function localizedUpdate(update = {}, lang = 'ar') {
  const pick = (ar, en) => (lang === 'ar' ? (update[ar] || update[en]) : (update[en] || update[ar])) || '';
  return {
    id: update.id,
    title: pick('title_ar', 'title_en'),
    description: pick('description_ar', 'description_en'),
    date: update.date || null,
    type: update.type || 'feature',
  };
}

/** Validate the admin form. title_ar, title_en, date, and a valid type required. */
export function validateSiteUpdate(form = {}) {
  const errors = {};
  if (!String(form.title_ar || '').trim()) errors.title_ar = 'أدخل العنوان بالعربية';
  if (!String(form.title_en || '').trim()) errors.title_en = 'أدخل العنوان بالإنجليزية';
  if (!String(form.date || '').trim()) errors.date = 'أدخل التاريخ';
  if (!UPDATE_TYPES.includes(form.type)) errors.type = 'اختر نوع التحديث';
  return { valid: Object.keys(errors).length === 0, errors };
}
