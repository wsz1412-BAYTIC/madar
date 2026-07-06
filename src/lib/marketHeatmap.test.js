import { describe, it, expect } from 'vitest';
import {
  resolveHeatmapAccess,
  filterProperties,
  aggregateCells,
  applyScopePrivacy,
  intensityBucket,
  summarizeByCity,
  cellDemandTrend,
  buildCellInsight,
  buildHeatmap,
  MIN_MARKET_SAMPLE,
} from './marketHeatmap.js';

const NOW = new Date('2026-07-05T08:00:00Z');
const paid = (planName) => ({ planName, paymentStatus: 'paid' });
const prop = (o = {}) => ({ id: 'p', city: 'Riyadh', district: 'Al Olaya', type: 'apartment', platform: 'Airbnb', currentOccupancy: 70, averageAdr: 400, monthlyRevenue: 8000, ...o });

describe('resolveHeatmapAccess — server-side plan matrix', () => {
  it('Growth → limited, own-portfolio scope only', () => {
    const a = resolveHeatmapAccess(paid('growth'), NOW);
    expect(a).toMatchObject({ allowed: true, plan: 'growth', tier: 'limited', scope: 'own', market: false, comparisons: false });
  });

  it('Pro → full market scope with comparisons + segmentation', () => {
    const a = resolveHeatmapAccess(paid('pro'), NOW);
    expect(a).toMatchObject({ allowed: true, tier: 'full', scope: 'market', market: true, comparisons: true, segmentation: true, historical: false });
  });

  it('Business → advanced market scope with historical + date range', () => {
    const a = resolveHeatmapAccess(paid('business'), NOW);
    expect(a).toMatchObject({ allowed: true, tier: 'advanced', scope: 'market', historical: true, dateRange: true });
  });

  it('a Growth TRIAL unlocks the limited heatmap (trial resolves to growth)', () => {
    const trial = { planName: 'growth', paymentStatus: 'trial', trialStatus: 'active', trialStartedAt: '2026-07-01T00:00:00Z', trialEndsAt: '2026-07-15T00:00:00Z' };
    expect(resolveHeatmapAccess(trial, NOW)).toMatchObject({ allowed: true, tier: 'limited', scope: 'own' });
  });

  it('free and basic are blocked with a Growth upsell', () => {
    for (const sub of [paid('free'), paid('basic'), {}, null]) {
      const a = resolveHeatmapAccess(sub, NOW);
      expect(a.allowed).toBe(false);
      expect(a.upgrade).toBe('growth');
      expect(a.error.en).toMatch(/Growth plan/);
      expect(a.error.ar).toBeTruthy();
    }
  });

  it('business requires a VERIFIED paid subscription — cannot self-grant', () => {
    expect(resolveHeatmapAccess({ planName: 'business', paymentStatus: 'trial' }, NOW).plan).not.toBe('business');
    expect(resolveHeatmapAccess({ planName: 'business', paymentStatus: 'pending' }, NOW).plan).not.toBe('business');
  });
});

describe('aggregateCells — real metrics only, never fabricated', () => {
  it('averages occupancy/ADR per city+district and counts the sample', () => {
    const cells = aggregateCells([
      prop({ currentOccupancy: 80, averageAdr: 400 }),
      prop({ currentOccupancy: 60, averageAdr: 500 }),
      prop({ city: 'Jeddah', district: 'Al Hamra', currentOccupancy: 90, averageAdr: 300 }),
    ]);
    const olaya = cells.find((c) => c.district === 'Al Olaya');
    expect(olaya.occupancy).toBe(70); // (80+60)/2
    expect(olaya.adr).toBe(450);
    expect(olaya.sampleCount).toBe(2);
    expect(olaya.intensity).toBe(3); // 70 → bucket 3
  });

  it('excludes properties with no usable metric (no zeros invented)', () => {
    const cells = aggregateCells([
      prop({ currentOccupancy: 0, averageAdr: 0, monthlyRevenue: 0 }),
      prop({ currentOccupancy: undefined, averageAdr: null }),
    ]);
    expect(cells).toHaveLength(0);
  });

  it('keeps occupancy null when only ADR is present (no fabricated occupancy)', () => {
    const cells = aggregateCells([prop({ currentOccupancy: 0, averageAdr: 350 })]);
    expect(cells[0].occupancy).toBeNull();
    expect(cells[0].adr).toBe(350);
    expect(cells[0].intensity).toBe(-1); // no occupancy → no intensity
  });

  it('segments by property type when requested', () => {
    const cells = aggregateCells([
      prop({ type: 'apartment', currentOccupancy: 70 }),
      prop({ type: 'villa', currentOccupancy: 50 }),
    ], { segmentByType: true });
    expect(cells).toHaveLength(2);
    expect(cells.map((c) => c.propertyType).sort()).toEqual(['apartment', 'villa']);
  });
});

describe('applyScopePrivacy — k-anonymity on the market scope', () => {
  const cells = [
    { city: 'Riyadh', district: 'A', sampleCount: 5, occupancy: 80 },
    { city: 'Riyadh', district: 'B', sampleCount: 2, occupancy: 60 },
  ];
  it('drops market cells below the sample threshold', () => {
    const kept = applyScopePrivacy(cells, 'market');
    expect(kept.map((c) => c.district)).toEqual(['A']);
    expect(MIN_MARKET_SAMPLE).toBe(3);
  });
  it('keeps every cell for the own scope (user owns their data)', () => {
    expect(applyScopePrivacy(cells, 'own')).toHaveLength(2);
  });
});

describe('intensityBucket', () => {
  it.each([[90, 4], [78, 3], [60, 2], [45, 1], [30, 0]])('%i%% → bucket %i', (occ, b) => {
    expect(intensityBucket(occ)).toBe(b);
  });
  it('non-finite occupancy → -1 (no data)', () => {
    expect(intensityBucket(null)).toBe(-1);
    expect(intensityBucket(undefined)).toBe(-1);
  });
});

describe('cellDemandTrend — relative to city median (real, not time series)', () => {
  it('flags above/below/at the city median', () => {
    expect(cellDemandTrend({ occupancy: 85 }, 70).direction).toBe('up');
    expect(cellDemandTrend({ occupancy: 55 }, 70).direction).toBe('down');
    expect(cellDemandTrend({ occupancy: 72 }, 70).direction).toBe('flat');
  });
  it('unknown when occupancy is missing', () => {
    expect(cellDemandTrend({ occupancy: null }, 70).direction).toBe('unknown');
  });
});

describe('buildCellInsight — bilingual, grounded, honest fallback', () => {
  it('describes a high-demand area in both languages', () => {
    const cell = { city: 'Riyadh', district: 'Al Olaya', occupancy: 88 };
    const trend = cellDemandTrend(cell, 72);
    expect(buildCellInsight(cell, trend, 'en')).toMatch(/above the Riyadh average/);
    expect(buildCellInsight(cell, trend, 'ar')).toContain('أعلى من متوسط');
  });
  it('falls back honestly when occupancy is missing', () => {
    expect(buildCellInsight({ city: 'X', occupancy: null }, null, 'en')).toMatch(/Not enough occupancy data/);
    expect(buildCellInsight({ city: 'X', occupancy: null }, null, 'ar')).toContain('لا توجد بيانات');
  });
});

describe('buildHeatmap — end to end', () => {
  it('own scope returns every cell with trend attached', () => {
    const access = resolveHeatmapAccess(paid('growth'), NOW);
    const out = buildHeatmap([prop(), prop({ district: 'Al Malqa', currentOccupancy: 50 })], access);
    expect(out.hasData).toBe(true);
    expect(out.scope).toBe('own');
    expect(out.cells.every((c) => c.trend)).toBe(true);
    expect(out.meta.minSample).toBe(1);
  });

  it('market scope hides thin cells (k-anonymity) and can end up empty → honest empty state', () => {
    const access = resolveHeatmapAccess(paid('pro'), NOW);
    const out = buildHeatmap([prop(), prop({ district: 'Al Malqa' })], access); // each district has 1 sample
    expect(out.scope).toBe('market');
    expect(out.hasData).toBe(false);
    expect(out.cells).toHaveLength(0);
    expect(out.meta.minSample).toBe(MIN_MARKET_SAMPLE);
  });

  it('market scope keeps a district once it clears the sample bar', () => {
    const access = resolveHeatmapAccess(paid('pro'), NOW);
    const props = [prop(), prop({ currentOccupancy: 75 }), prop({ currentOccupancy: 65 })]; // 3 in Al Olaya
    const out = buildHeatmap(props, access);
    expect(out.hasData).toBe(true);
    expect(out.cells[0].sampleCount).toBe(3);
  });

  it('empty portfolio → hasData false, no fabricated cells', () => {
    const access = resolveHeatmapAccess(paid('growth'), NOW);
    expect(buildHeatmap([], access).hasData).toBe(false);
  });
});

describe('filterProperties', () => {
  const props = [
    prop({ city: 'Riyadh', type: 'apartment', platform: 'Airbnb' }),
    prop({ city: 'Jeddah', type: 'villa', platform: 'Gathern' }),
  ];
  it('filters by city, type, and platform', () => {
    expect(filterProperties(props, { city: 'Jeddah' })).toHaveLength(1);
    expect(filterProperties(props, { propertyType: 'villa' })[0].city).toBe('Jeddah');
    expect(filterProperties(props, { platform: 'Airbnb' })[0].city).toBe('Riyadh');
    expect(filterProperties(props, { city: 'all', propertyType: 'all', platform: 'all' })).toHaveLength(2);
  });
  it('scopes by last-activity date range when provided', () => {
    const dated = [
      prop({ updated_date: '2026-06-01T00:00:00Z' }),
      prop({ district: 'B', updated_date: '2026-07-04T00:00:00Z' }),
    ];
    const out = filterProperties(dated, { dateFrom: '2026-07-01', dateTo: '2026-07-31' });
    expect(out).toHaveLength(1);
    expect(out[0].district).toBe('B');
  });
});

describe('summarizeByCity', () => {
  it('computes per-city median occupancy + ADR and sample totals', () => {
    const cells = aggregateCells([
      prop({ district: 'A', currentOccupancy: 80, averageAdr: 400 }),
      prop({ district: 'B', currentOccupancy: 60, averageAdr: 500 }),
      prop({ city: 'Jeddah', district: 'C', currentOccupancy: 90, averageAdr: 300 }),
    ]);
    const cities = summarizeByCity(cells);
    const riyadh = cities.find((c) => c.city === 'Riyadh');
    expect(riyadh.medianOccupancy).toBe(70); // median(80,60)
    expect(riyadh.areaCount).toBe(2);
    expect(riyadh.sampleCount).toBe(2);
  });
});
