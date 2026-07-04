// Legal/compliance configuration for Madar — single source of truth for
// policy versions, last-updated dates, routes, and the consents required at
// signup and trial/paid activation. Bump a version here whenever the matching
// content file changes materially; consent records store the version the user
// actually accepted.

export const POLICY_VERSIONS = Object.freeze({
  privacy: '1.0',
  terms: '1.0',
  subscription: '1.0',
  dataAi: '1.0',
  cookies: '1.0',
  contact: '1.0',
});

export const POLICY_UPDATED = Object.freeze({
  privacy: '2026-07-04',
  terms: '2026-07-04',
  subscription: '2026-07-04',
  dataAi: '2026-07-04',
  cookies: '2026-07-04',
  contact: '2026-07-04',
});

export const POLICY_ROUTES = Object.freeze({
  privacy: '/privacy',
  terms: '/terms',
  subscription: '/subscription',
  dataAi: '/data-ai-policy',
  cookies: '/cookies',
  contact: '/contact',
});

// Consents REQUIRED to create an account. Signup is blocked without all of
// these; each acceptance is stored as a ConsentRecord with its version.
export const REQUIRED_SIGNUP_CONSENTS = Object.freeze(['terms', 'privacy']);

// Consent REQUIRED to activate a trial or paid plan.
export const REQUIRED_SUBSCRIPTION_CONSENTS = Object.freeze(['subscription']);

// Optional, opt-in consents offered at signup (never block anything).
export const OPTIONAL_SIGNUP_CONSENTS = Object.freeze(['service_notifications']);

// Draft-status banner shown on every legal page until counsel sign-off.
export const LAWYER_REVIEW_NOTICE = Object.freeze({
  en: 'Draft for review by qualified Saudi legal counsel — this document is not final and does not constitute legal advice.',
  ar: 'مسودة خاضعة لمراجعة مستشار قانوني سعودي مؤهل — هذه الوثيقة غير نهائية ولا تُعد استشارة قانونية.',
});
