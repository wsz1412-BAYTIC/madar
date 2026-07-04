import { describe, it, expect } from 'vitest';
import {
  validateRequiredConsents,
  buildConsentRecords,
  missingConsentError,
} from '@/lib/consentManagement';
import {
  POLICY_VERSIONS,
  POLICY_ROUTES,
  POLICY_UPDATED,
  REQUIRED_SIGNUP_CONSENTS,
  REQUIRED_SUBSCRIPTION_CONSENTS,
} from '@/config/legal';

describe('legal config invariants', () => {
  it('every policy has a version, an updated date, and a route', () => {
    for (const key of Object.keys(POLICY_ROUTES)) {
      expect(POLICY_VERSIONS[key], `version for ${key}`).toMatch(/^\d+\.\d+$/);
      expect(POLICY_UPDATED[key], `updated date for ${key}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(POLICY_ROUTES[key], `route for ${key}`).toMatch(/^\//);
    }
  });

  it('required consent sets reference known policies', () => {
    expect(REQUIRED_SIGNUP_CONSENTS).toEqual(['terms', 'privacy']);
    expect(REQUIRED_SUBSCRIPTION_CONSENTS).toEqual(['subscription']);
    for (const key of [...REQUIRED_SIGNUP_CONSENTS, ...REQUIRED_SUBSCRIPTION_CONSENTS]) {
      expect(POLICY_VERSIONS[key]).toBeTruthy();
    }
  });
});

describe('validateRequiredConsents', () => {
  it('signup: valid only when terms AND privacy are accepted', () => {
    expect(validateRequiredConsents(['terms', 'privacy']).valid).toBe(true);
    expect(validateRequiredConsents(['terms', 'privacy', 'service_notifications']).valid).toBe(true);
  });

  it('signup: reports every missing required consent', () => {
    expect(validateRequiredConsents([])).toEqual({ valid: false, missing: ['terms', 'privacy'] });
    expect(validateRequiredConsents(['terms'])).toEqual({ valid: false, missing: ['privacy'] });
    expect(validateRequiredConsents(['privacy'])).toEqual({ valid: false, missing: ['terms'] });
  });

  it('signup: optional consents alone never satisfy the gate', () => {
    expect(validateRequiredConsents(['service_notifications']).valid).toBe(false);
  });

  it('subscription flow: requires the subscription terms only', () => {
    expect(validateRequiredConsents([], 'subscription')).toEqual({ valid: false, missing: ['subscription'] });
    expect(validateRequiredConsents(['subscription'], 'subscription').valid).toBe(true);
    // Signup consents do not carry over to subscription activation.
    expect(validateRequiredConsents(['terms', 'privacy'], 'subscription').valid).toBe(false);
  });

  it('tolerates null/undefined accepted lists', () => {
    expect(validateRequiredConsents(null).valid).toBe(false);
    expect(validateRequiredConsents(undefined, 'subscription').valid).toBe(false);
  });
});

describe('buildConsentRecords', () => {
  const now = new Date('2026-07-04T12:00:00.000Z');

  it('stamps each record with the CURRENT policy version, timestamp, and source', () => {
    const rows = buildConsentRecords('u1', ['terms', 'privacy'], { source: 'signup', now, userAgent: 'UA' });
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.userId).toBe('u1');
      expect(row.policyVersion).toBe(POLICY_VERSIONS[row.policyKey]);
      expect(row.consentedAt).toBe('2026-07-04T12:00:00.000Z');
      expect(row.source).toBe('signup');
      expect(row.userAgent).toBe('UA');
      expect(row.withdrawn).toBe(false);
    }
    expect(rows.map((r) => r.policyKey)).toEqual(['terms', 'privacy']);
  });

  it('refuses to build records without an authenticated userId', () => {
    expect(() => buildConsentRecords('', ['terms'])).toThrow(/userId/);
    expect(() => buildConsentRecords(null, ['terms'])).toThrow(/userId/);
  });

  it('never sets ipAddress unless the (server-side) caller provides it', () => {
    const [row] = buildConsentRecords('u1', ['subscription'], { source: 'subscription', now });
    expect(row.ipAddress).toBeNull();
    const [withIp] = buildConsentRecords('u1', ['subscription'], { source: 'subscription', now, ipAddress: '10.0.0.1' });
    expect(withIp.ipAddress).toBe('10.0.0.1');
  });

  it('returns an empty list for an empty acceptance', () => {
    expect(buildConsentRecords('u1', [])).toEqual([]);
    expect(buildConsentRecords('u1', null)).toEqual([]);
  });
});

describe('missingConsentError', () => {
  it('names the missing policies in English', () => {
    expect(missingConsentError(['terms', 'privacy'], 'en')).toBe(
      'You must accept: Terms of Use, Privacy Policy to continue.'
    );
    expect(missingConsentError(['subscription'], 'en')).toBe(
      'You must accept: Subscription Terms to continue.'
    );
  });

  it('names the missing policies in Arabic', () => {
    expect(missingConsentError(['terms'], 'ar')).toContain('شروط الاستخدام');
    expect(missingConsentError(['privacy'], 'ar')).toContain('سياسة الخصوصية');
    expect(missingConsentError(['subscription'], 'ar')).toContain('شروط الاشتراك');
  });
});
