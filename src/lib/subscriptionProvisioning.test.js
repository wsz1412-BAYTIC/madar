import { describe, it, expect } from 'vitest';
import {
  PLAN_LIMITS,
  FREE_PLAN,
  UPGRADE_UNAVAILABLE,
  isPaidPlan,
  resolvePlanLimit,
  buildFreeSubscription,
  assessPropertyLimit,
  selectCurrentPlanKey,
} from './subscriptionProvisioning.js';

describe('subscription provisioning', () => {
  describe('resolvePlanLimit', () => {
    it('resolves known plans', () => {
      expect(resolvePlanLimit('free')).toBe(PLAN_LIMITS.free);
      expect(resolvePlanLimit('basic')).toBe(PLAN_LIMITS.basic);
      expect(resolvePlanLimit('growth')).toBe(PLAN_LIMITS.growth);
      expect(resolvePlanLimit('pro')).toBe(PLAN_LIMITS.pro);
    });
    it('is case-insensitive', () => {
      expect(resolvePlanLimit('PRO')).toBe(PLAN_LIMITS.pro);
    });
    it('defaults unknown/empty plans to the Free cap', () => {
      expect(resolvePlanLimit('enterprise')).toBe(PLAN_LIMITS.free);
      expect(resolvePlanLimit(undefined)).toBe(PLAN_LIMITS.free);
      expect(resolvePlanLimit(null)).toBe(PLAN_LIMITS.free);
    });
  });

  describe('isPaidPlan', () => {
    it('treats free as not paid and everything else as paid', () => {
      expect(isPaidPlan('free')).toBe(false);
      expect(isPaidPlan('FREE')).toBe(false);
      expect(isPaidPlan('basic')).toBe(true);
      expect(isPaidPlan('pro')).toBe(true);
      expect(isPaidPlan(undefined)).toBe(false);
    });
  });

  describe('buildFreeSubscription', () => {
    it('builds a Free payload satisfying required fields + onboarding fields', () => {
      const now = '2026-07-03T00:00:00.000Z';
      const sub = buildFreeSubscription('user-123', now);
      // required UserSubscription fields
      expect(sub.userId).toBe('user-123');
      expect(sub.planId).toBe(FREE_PLAN);
      expect(sub.planName).toBe(FREE_PLAN);
      expect(sub.startDate).toBe(now);
      // onboarding invariants the task verifies
      expect(sub.status).toBe('active');
      expect(sub.paymentStatus).toBe('not_required');
      expect(sub.usageLimit).toBe(PLAN_LIMITS.free);
      expect(sub.usageCount).toBe(0);
      expect(sub.price).toBe(0);
      expect(sub.autoRenew).toBe(false);
      expect(sub.renewalDate).toBeNull();
    });
    it('defaults startDate to now when omitted', () => {
      const sub = buildFreeSubscription('u');
      expect(typeof sub.startDate).toBe('string');
      expect(Number.isNaN(Date.parse(sub.startDate))).toBe(false);
    });
    it('requires a userId', () => {
      expect(() => buildFreeSubscription()).toThrow();
      expect(() => buildFreeSubscription('')).toThrow();
    });
  });

  describe('assessPropertyLimit', () => {
    it('allows when under the limit', () => {
      expect(assessPropertyLimit('free', 0)).toEqual({ allowed: true, plan: 'free', limit: 1, count: 0 });
    });
    it('blocks when at or over the limit', () => {
      expect(assessPropertyLimit('free', 1).allowed).toBe(false);
      expect(assessPropertyLimit('basic', 5).allowed).toBe(false);
      expect(assessPropertyLimit('basic', 4).allowed).toBe(true);
    });
    it('treats non-finite counts as 0', () => {
      expect(assessPropertyLimit('free', NaN).count).toBe(0);
    });
  });

  describe('selectCurrentPlanKey', () => {
    it('defaults to free when no subscription/plan', () => {
      expect(selectCurrentPlanKey(null)).toBe('free');
      expect(selectCurrentPlanKey({})).toBe('free');
      expect(selectCurrentPlanKey({ planName: '' })).toBe('free');
    });
    it('lower-cases the plan name', () => {
      expect(selectCurrentPlanKey({ planName: 'Growth' })).toBe('growth');
    });
  });

  describe('UPGRADE_UNAVAILABLE', () => {
    it('provides both Arabic and English messages', () => {
      expect(typeof UPGRADE_UNAVAILABLE.ar).toBe('string');
      expect(UPGRADE_UNAVAILABLE.ar.length).toBeGreaterThan(0);
      expect(typeof UPGRADE_UNAVAILABLE.en).toBe('string');
      expect(UPGRADE_UNAVAILABLE.en.toLowerCase()).toContain('unavailable');
    });
  });
});
