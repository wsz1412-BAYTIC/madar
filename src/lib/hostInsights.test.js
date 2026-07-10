import { describe, it, expect } from 'vitest';
import { deriveHostSignals, WEAK_OCCUPANCY_THRESHOLD } from './hostInsights.js';

describe('deriveHostSignals — safe own-data flags only', () => {
  it('computes average occupancy from the host\'s own rows', () => {
    const s = deriveHostSignals([{ currentOccupancy: 40 }, { currentOccupancy: 60 }]);
    expect(s.hasProperties).toBe(true);
    expect(s.hasOccupancyData).toBe(true);
    expect(s.avgOccupancy).toBe(50);
    expect(s.weakOccupancy).toBe(true); // 50 < 55
  });

  it('flags weak occupancy only when below the threshold', () => {
    expect(deriveHostSignals([{ currentOccupancy: 80 }]).weakOccupancy).toBe(false);
    expect(deriveHostSignals([{ currentOccupancy: WEAK_OCCUPANCY_THRESHOLD }]).weakOccupancy).toBe(false); // exactly at threshold
    expect(deriveHostSignals([{ currentOccupancy: 54 }]).weakOccupancy).toBe(true);
  });

  it('never treats missing occupancy data as weak (no invented signal)', () => {
    const s = deriveHostSignals([{ name: 'A' }, { monthlyRevenue: 1000 }]);
    expect(s.hasOccupancyData).toBe(false);
    expect(s.avgOccupancy).toBeNull();
    expect(s.weakOccupancy).toBe(false);
  });

  it('is safe on empty / invalid input', () => {
    expect(deriveHostSignals([])).toEqual({ hasProperties: false, hasOccupancyData: false, avgOccupancy: null, weakOccupancy: false });
    expect(deriveHostSignals(null)).toEqual({ hasProperties: false, hasOccupancyData: false, avgOccupancy: null, weakOccupancy: false });
  });

  it('ignores non-finite occupancy values', () => {
    const s = deriveHostSignals([{ currentOccupancy: 70 }, { currentOccupancy: null }, { currentOccupancy: 'x' }]);
    expect(s.avgOccupancy).toBe(70);
    expect(s.hasOccupancyData).toBe(true);
  });
});
