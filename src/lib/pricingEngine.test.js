import { describe, it, expect } from 'vitest';
import {
  calculateOccupancyRate,
  calculateADR,
  calculateRevPAR,
  calculateNetRevenue,
  calculateBookingPace,
  calculateBreakEvenPrice,
  calculatePricingBoundaries,
  calculateDataQualityScore,
  buildMetricsSnapshot,
} from './pricingEngine.js';

describe('calculateOccupancyRate', () => {
  it('computes a simple rate', () => {
    expect(calculateOccupancyRate({ bookedNights: 15, availableNights: 30 })).toBe(0.5);
  });

  it('clamps above 1', () => {
    expect(calculateOccupancyRate({ bookedNights: 40, availableNights: 30 })).toBe(1);
  });

  it('clamps below 0', () => {
    expect(calculateOccupancyRate({ bookedNights: -5, availableNights: 30 })).toBe(0);
  });

  it('returns null when availableNights is zero', () => {
    expect(calculateOccupancyRate({ bookedNights: 5, availableNights: 0 })).toBeNull();
  });

  it('returns null when inputs are missing', () => {
    expect(calculateOccupancyRate({})).toBeNull();
  });
});

describe('calculateADR', () => {
  it('computes average daily rate', () => {
    expect(calculateADR({ roomRevenue: 4500, bookedNights: 15 })).toBe(300);
  });

  it('never returns negative', () => {
    expect(calculateADR({ roomRevenue: -100, bookedNights: 10 })).toBe(0);
  });

  it('returns null on zero nights', () => {
    expect(calculateADR({ roomRevenue: 100, bookedNights: 0 })).toBeNull();
  });
});

describe('calculateRevPAR', () => {
  it('derives from ADR and occupancy', () => {
    expect(calculateRevPAR({ adr: 300, occupancyRate: 0.5 })).toBe(150);
  });

  it('falls back to totals when adr/occupancy missing', () => {
    expect(calculateRevPAR({ roomRevenue: 4500, availableNights: 30 })).toBe(150);
  });

  it('returns null when nothing usable is provided', () => {
    expect(calculateRevPAR({})).toBeNull();
  });
});

describe('calculateNetRevenue', () => {
  it('subtracts costs and platform fees', () => {
    expect(calculateNetRevenue({ grossRevenue: 10000, operatingCosts: 2000, platformFeeRate: 0.03 })).toBe(7700);
  });

  it('defaults costs and fees to zero', () => {
    expect(calculateNetRevenue({ grossRevenue: 5000 })).toBe(5000);
  });

  it('treats a negative operatingCosts as invalid input, not as a revenue boost', () => {
    expect(calculateNetRevenue({ grossRevenue: 5000, operatingCosts: -500 })).toBe(5000);
  });

  it('returns null when grossRevenue is not finite', () => {
    expect(calculateNetRevenue({ grossRevenue: undefined })).toBeNull();
  });
});

describe('calculateBookingPace', () => {
  it('computes a pace index ahead of last period', () => {
    expect(calculateBookingPace({ bookingsOnBooksNow: 12, bookingsOnBooksSamePointLastPeriod: 10 })).toBe(1.2);
  });

  it('returns null with no prior baseline', () => {
    expect(calculateBookingPace({ bookingsOnBooksNow: 12, bookingsOnBooksSamePointLastPeriod: 0 })).toBeNull();
  });

  it('returns null with negative current bookings', () => {
    expect(calculateBookingPace({ bookingsOnBooksNow: -1, bookingsOnBooksSamePointLastPeriod: 10 })).toBeNull();
  });
});

describe('calculateBreakEvenPrice', () => {
  it('computes break-even nightly price', () => {
    // 3000 costs / (30 nights * 0.5 target occupancy) = 200
    expect(calculateBreakEvenPrice({ operatingCosts: 3000, availableNights: 30, targetOccupancyRate: 0.5 })).toBe(200);
  });

  it('returns null on non-positive inputs', () => {
    expect(calculateBreakEvenPrice({ operatingCosts: -1, availableNights: 30, targetOccupancyRate: 0.5 })).toBeNull();
    expect(calculateBreakEvenPrice({ operatingCosts: 100, availableNights: 0, targetOccupancyRate: 0.5 })).toBeNull();
    expect(calculateBreakEvenPrice({ operatingCosts: 100, availableNights: 30, targetOccupancyRate: 0 })).toBeNull();
  });
});

describe('calculatePricingBoundaries', () => {
  it('sets a floor above break-even and a data-quality-scaled ceiling', () => {
    const boundaries = calculatePricingBoundaries({ breakEvenPrice: 200, currentAdr: 300, marketAdr: 320, dataQualityScore: 100 });
    expect(boundaries.min).toBe(210); // 200 * 1.05
    expect(boundaries.max).toBeCloseTo(320 * 1.35, 2);
  });

  it('narrows the ceiling for low data quality', () => {
    const low = calculatePricingBoundaries({ breakEvenPrice: 200, currentAdr: 300, dataQualityScore: 0 });
    const high = calculatePricingBoundaries({ breakEvenPrice: 200, currentAdr: 300, dataQualityScore: 100 });
    expect(low.max).toBeLessThan(high.max);
  });

  it('returns null without a break-even price', () => {
    expect(calculatePricingBoundaries({ breakEvenPrice: null, currentAdr: 300 })).toBeNull();
  });

  it('never lets ceiling fall below floor', () => {
    const boundaries = calculatePricingBoundaries({ breakEvenPrice: 500, currentAdr: 10, dataQualityScore: 0 });
    expect(boundaries.max).toBeGreaterThanOrEqual(boundaries.min);
  });
});

describe('calculateDataQualityScore', () => {
  it('scores 100 with everything present', () => {
    const { score, flags } = calculateDataQualityScore({
      occupancyRate: 0.5,
      adr: 300,
      operatingCosts: 1000,
      bookingPace: 1.1,
      marketAdr: 310,
    });
    expect(score).toBe(100);
    expect(flags).toEqual([]);
  });

  it('scores 0 and flags everything when nothing is present', () => {
    const { score, flags } = calculateDataQualityScore({});
    expect(score).toBe(0);
    expect(flags).toContain('missing_occupancy_data');
    expect(flags).toContain('missing_adr_data');
    expect(flags).toContain('missing_operating_costs');
    expect(flags).toContain('missing_booking_pace_data');
    expect(flags).toContain('missing_market_comparison');
  });
});

describe('buildMetricsSnapshot', () => {
  const property = {
    currentOccupancy: 60,
    averageAdr: 300,
    monthlyRevenue: 9000,
    operatingCosts: 2000,
  };

  it('derives a full snapshot from a UserProperty-shaped record', () => {
    const snapshot = buildMetricsSnapshot(property);
    expect(snapshot.occupancyRate).toBe(0.6);
    expect(snapshot.adr).toBe(300);
    expect(snapshot.revpar).toBe(180);
    expect(snapshot.netRevenue).toBeCloseTo(9000 - 2000 - 9000 * 0.03, 2);
    expect(snapshot.breakEvenPrice).toBeGreaterThan(0);
    expect(snapshot.priceFloor).toBeLessThanOrEqual(snapshot.priceCeiling);
    expect(snapshot.currency).toBe('SAR');
  });

  it('every evidence entry has a finite numeric value', () => {
    const snapshot = buildMetricsSnapshot(property);
    for (const entry of snapshot.evidence) {
      expect(Number.isFinite(entry.value)).toBe(true);
      expect(typeof entry.key).toBe('string');
    }
  });

  it('degrades gracefully with a mostly-empty property and flags missing data', () => {
    const snapshot = buildMetricsSnapshot({});
    expect(snapshot.occupancyRate).toBeNull();
    expect(snapshot.dataQualityScore).toBeLessThan(50);
    expect(snapshot.dataQualityFlags.length).toBeGreaterThan(0);
    expect(snapshot.evidence.every((e) => Number.isFinite(e.value))).toBe(true);
  });

  it('incorporates booking pace input when provided', () => {
    const snapshot = buildMetricsSnapshot(property, {
      bookingPaceInput: { bookingsOnBooksNow: 8, bookingsOnBooksSamePointLastPeriod: 10 },
    });
    expect(snapshot.bookingPace).toBe(0.8);
  });
});
