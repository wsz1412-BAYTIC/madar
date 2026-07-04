/**
 * Madar legal & compliance configuration.
 * Single source of truth for policy versions, routes, and consent requirements.
 * Bump a version when a policy changes materially — future acceptances will record
 * the reviewed version in ConsentRecord.
 */

export const POLICY_VERSIONS = {
  terms: "1.0",
  privacy: "1.0",
  subscription: "1.0",
  data_ai_policy: "1.0",
  cookies: "1.0",
  contact: "1.0",
};

export const POLICY_UPDATED = {
  terms: "2025-07-04",
  privacy: "2025-07-04",
  subscription: "2025-07-04",
  data_ai_policy: "2025-07-04",
  cookies: "2025-07-04",
  contact: "2025-07-04",
};

export const POLICY_ROUTES = {
  terms: "/terms",
  privacy: "/privacy",
  subscription: "/subscription",
  data_ai_policy: "/data-ai-policy",
  cookies: "/cookies",
  contact: "/contact",
};

export const POLICY_TITLES = {
  ar: {
    terms: "شروط الاستخدام",
    privacy: "سياسة الخصوصية",
    subscription: "شروط الاشتراك",
    data_ai_policy: "سياسة استخدام البيانات والذكاء الاصطناعي",
    cookies: "سياسة ملفات تعريف الارتباط",
    contact: "تواصل وشكاوى وطلبات بيانات",
  },
  en: {
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    subscription: "Subscription Terms",
    data_ai_policy: "Data & AI Usage Policy",
    cookies: "Cookie Policy",
    contact: "Contact, Complaints & Data Requests",
  },
};

export const REQUIRED_SIGNUP_CONSENTS = ["terms", "privacy"];
export const REQUIRED_SUBSCRIPTION_CONSENTS = ["subscription"];
export const OPTIONAL_SIGNUP_CONSENTS = ["service_notifications"];