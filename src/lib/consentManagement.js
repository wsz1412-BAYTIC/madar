/**
 * Madar consent management utilities.
 * Pure functions for validating and building consent records.
 * No PII (IP) is ever collected client-side.
 */
import { POLICY_VERSIONS, REQUIRED_SIGNUP_CONSENTS, REQUIRED_SUBSCRIPTION_CONSENTS } from "@/config/legal";

const REQUIRED_BY_FLOW = {
  signup: REQUIRED_SIGNUP_CONSENTS,
  subscription: REQUIRED_SUBSCRIPTION_CONSENTS,
};

/**
 * Validate that all required consents for a given flow are accepted.
 * @param {Object} accepted — { policyKey: true } map
 * @param {"signup"|"subscription"} flow
 * @returns {{ valid: boolean, missing: string[], error: { ar: string, en: string } | null }}
 */
export function validateRequiredConsents(accepted, flow) {
  const required = REQUIRED_BY_FLOW[flow] || [];
  const missing = required.filter((key) => !accepted[key]);

  if (missing.length === 0) {
    return { valid: true, missing: [], error: null };
  }

  return {
    valid: false,
    missing,
    error: missingConsentError(missing),
  };
}

/**
 * Build consent record payloads for persistence.
 * Stamps the CURRENT policy version — refuses to run without an authenticated userId.
 * @param {string} userId
 * @param {Object} accepted — { policyKey: true } map
 * @param {{ source: string, userAgent?: string }} meta
 * @returns {Array<{ userId, policyKey, policyVersion, consentedAt, source, userAgent }>}
 */
export function buildConsentRecords(userId, accepted, meta) {
  if (!userId) {
    throw new Error("buildConsentRecords requires an authenticated userId");
  }

  const records = [];
  for (const [key, value] of Object.entries(accepted)) {
    if (!value) continue;
    if (!POLICY_VERSIONS[key]) continue;
    records.push({
      userId,
      policyKey: key,
      policyVersion: POLICY_VERSIONS[key],
      consentedAt: new Date().toISOString(),
      source: meta.source || "settings",
      userAgent: meta.userAgent || null,
    });
  }
  return records;
}

export function missingConsentError(missingKeys) {
  const arMap = {
    terms: "شروط الاستخدام",
    privacy: "سياسة الخصوصية",
    subscription: "شروط الاشتراك",
  };
  const enMap = {
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    subscription: "Subscription Terms",
  };

  const arNames = missingKeys.map((k) => arMap[k] || k).join("، ");
  const enNames = missingKeys.map((k) => enMap[k] || k).join(", ");

  return {
    ar: `يجب الموافقة على: ${arNames} للمتابعة`,
    en: `You must accept: ${enNames} to continue`,
  };
}