// Consent capture logic. Pure — validation and record-building are
// unit-tested here; the UI persists rows to the ConsentRecord entity
// (immutable: RLS forbids update/delete).

import {
  POLICY_VERSIONS,
  REQUIRED_SIGNUP_CONSENTS,
  REQUIRED_SUBSCRIPTION_CONSENTS,
} from '@/config/legal.js';

/**
 * Are all required consents present for the given flow?
 * `accepted` is an array of policy keys the user ticked.
 * Returns { valid, missing } — missing lists the unticked required keys.
 */
export function validateRequiredConsents(accepted, flow = 'signup') {
  const required =
    flow === 'subscription' ? REQUIRED_SUBSCRIPTION_CONSENTS : REQUIRED_SIGNUP_CONSENTS;
  const got = new Set(accepted || []);
  const missing = required.filter((k) => !got.has(k));
  return { valid: missing.length === 0, missing };
}

/**
 * Build immutable ConsentRecord rows for everything the user accepted.
 * userId comes from the authenticated session — never from a form. IP address
 * is only stored when the caller has it (server-side); user agent is captured
 * from the browser when available.
 */
export function buildConsentRecords(userId, accepted, meta = {}) {
  if (!userId) throw new Error('buildConsentRecords requires the authenticated userId');
  const at = meta.now instanceof Date ? meta.now.toISOString() : new Date().toISOString();
  return (accepted || []).map((policyKey) => ({
    userId,
    policyKey,
    policyVersion: POLICY_VERSIONS[policyKey] || '1.0',
    consentedAt: at,
    source: meta.source || 'signup',
    userAgent: meta.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null) || null,
    ipAddress: meta.ipAddress || null,
    withdrawn: false,
  }));
}

/** Bilingual error shown when required consents are missing. */
export function missingConsentError(missing, lang = 'en') {
  const names = {
    terms: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
    privacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    subscription: { en: 'Subscription Terms', ar: 'شروط الاشتراك' },
  };
  const list = (missing || []).map((k) => (lang === 'ar' ? names[k]?.ar : names[k]?.en) || k).join(lang === 'ar' ? ' و' : ', ');
  return lang === 'ar'
    ? `يجب الموافقة على: ${list} للمتابعة.`
    : `You must accept: ${list} to continue.`;
}
