import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PLATFORM_FEES,
  parseFeeOverrides,
  resolvePlatformFee,
  netRevenueAfterFees,
  projectRevenueImpact,
} from './platformFees.js';

describe('resolvePlatformFee', () => {
  it('bundled rates are clearly flagged as estimates', () => {
    for (const platform of ['Airbnb', 'Gathern', 'Booking.com']) {
      const fee = resolvePlatformFee(platform);
      expect(fee.rate).toBe(DEFAULT_PLATFORM_FEES[platform]);
      expect(fee.estimated).toBe(true);
      expect(fee.source).toBe('default');
    }
  });

  it('a config override wins and is treated as confirmed', () => {
    const overrides = parseFeeOverrides('{"Airbnb":0.145,"Gathern":0.1}');
    expect(resolvePlatformFee('Airbnb', overrides)).toEqual({ platform: 'Airbnb', rate: 0.145, estimated: false, source: 'config' });
    expect(resolvePlatformFee('Gathern', overrides).estimated).toBe(false);
    // Platforms not overridden stay estimates.
    expect(resolvePlatformFee('Booking.com', overrides).estimated).toBe(true);
  });

  it('unknown platforms fall back to the Other estimate', () => {
    const fee = resolvePlatformFee('SomeNewPlatform');
    expect(fee.rate).toBe(DEFAULT_PLATFORM_FEES.Other);
    expect(fee.estimated).toBe(true);
    expect(fee.source).toBe('default_other');
    // Missing platform maps to the literal 'Other' bucket (a known default).
    expect(resolvePlatformFee(null).rate).toBe(DEFAULT_PLATFORM_FEES.Other);
    expect(resolvePlatformFee(null).estimated).toBe(true);
  });
});

describe('parseFeeOverrides (PLATFORM_FEES_JSON)', () => {
  it('accepts a valid rates object', () => {
    expect(parseFeeOverrides('{"Airbnb":0.14}')).toEqual({ Airbnb: 0.14 });
  });

  it('bad config never breaks pricing: malformed JSON, wrong shapes, out-of-range rates are dropped', () => {
    expect(parseFeeOverrides('not json')).toEqual({});
    expect(parseFeeOverrides('[0.1]')).toEqual({});
    expect(parseFeeOverrides(null)).toEqual({});
    expect(parseFeeOverrides('{"Airbnb":"lots","Gathern":-0.2,"Booking.com":1.5,"Other":0.09}')).toEqual({ Other: 0.09 });
  });
});

describe('netRevenueAfterFees — rent value minus platform fee ONLY', () => {
  it('deducts exactly the platform commission from gross', () => {
    const result = netRevenueAfterFees(10000, 'Booking.com');
    expect(result.feeRate).toBe(0.15);
    expect(result.feeAmount).toBe(1500);
    expect(result.net).toBe(8500);
    expect(result.estimated).toBe(true);
  });

  it('uses the confirmed override when configured', () => {
    const result = netRevenueAfterFees(10000, 'Airbnb', parseFeeOverrides('{"Airbnb":0.1}'));
    expect(result.net).toBe(9000);
    expect(result.estimated).toBe(false);
  });

  it('returns null for unusable gross values', () => {
    expect(netRevenueAfterFees(NaN, 'Airbnb')).toBeNull();
    expect(netRevenueAfterFees(-5, 'Airbnb')).toBeNull();
  });
});

describe('projectRevenueImpact', () => {
  it('computes SAR + % impact and both net scenarios at unchanged occupancy', () => {
    const p = projectRevenueImpact({
      currentPrice: 400,
      recommendedPrice: 440,
      occupancyRate: 0.5,
      availableNights: 30,
      platform: 'Airbnb',
    });
    expect(p.currentGross).toBe(6000);
    expect(p.projectedGross).toBe(6600);
    expect(p.impactSar).toBe(600);
    expect(p.impactPercent).toBe(10);
    expect(p.projectedNet.net).toBeLessThan(p.projectedGross);
    expect(p.assumption.ar).toContain('غير مضمونة'); // never a guarantee
  });

  it('returns null when occupancy or prices are missing (no fabricated market data)', () => {
    expect(projectRevenueImpact({ currentPrice: 400, recommendedPrice: 440, occupancyRate: null, platform: 'Airbnb' })).toBeNull();
    expect(projectRevenueImpact({ currentPrice: 0, recommendedPrice: 440, occupancyRate: 0.5, platform: 'Airbnb' })).toBeNull();
  });
});
