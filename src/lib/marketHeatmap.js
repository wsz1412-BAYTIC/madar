// Market Heatmap — plan-gated demand/occupancy intensity by city + neighborhood.
//
// DATA SOURCE (real, never fabricated): the only market signal Madar stores is
// the occupancy/ADR/revenue on real UserProperty rows. This module aggregates
// those by city + district (+ optional property-type segmentation). Two scopes:
//   • own    (Growth): the signed-in user's OWN properties only.
//   • market (Pro/Business): an anonymized cross-portfolio benchmark — a cell is
//     emitted ONLY when it is backed by at least MIN_MARKET_SAMPLE properties
//     (k-anonymity), and only averages/counts are ever returned, never rows.
// When nothing clears the bar, callers must show an honest empty state — this
// module never invents numbers.
//
// Pure: no network, no SDK, no DOM. Mirrored into base44/functions/market-heatmap/
// (enforced by functionMirrors.test.js). The backend does the service-role
// fetching and calls these functions; the frontend renders the result.

import { resolveEntitlementPlan } from './trialManagement.js';

// A market cell is never shown unless this many distinct properties back it.
export const MIN_MARKET_SAMPLE = 3;

const round1 = (v) => Math.round((v + Number.EPSILON) * 10) / 10;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const NO_DISTRICT = '—';

/**
 * Resolve the heatmap access tier from the subscription. Server-enforced;
 * the client mirrors it only for nicer UX. Business is the admin-managed paid
 * tier (planName 'business' + verified payment); everything else falls through
 * to the standard entitlement plan (free|basic|growth|pro), where a Growth
 * trial resolves to 'growth'.
 * Returns { allowed, plan, tier, scope, market, comparisons, segmentation,
 * historical, dateRange } or { allowed:false, plan, upgrade, error:{en,ar} }.
 */
export function resolveHeatmapAccess(subscription, now = new Date()) {
  const planName = String(subscription?.planName || '').toLowerCase();
  const plan = planName === 'business' && subscription?.paymentStatus === 'paid'
    ? 'business'
    : resolveEntitlementPlan(subscription || {}, now);

  const TIERS = {
    growth: { tier: 'limited', scope: 'own', market: false, comparisons: false, segmentation: false, historical: false, dateRange: false },
    pro: { tier: 'full', scope: 'market', market: true, comparisons: true, segmentation: true, historical: false, dateRange: false },
    business: { tier: 'advanced', scope: 'market', market: true, comparisons: true, segmentation: true, historical: true, dateRange: true },
  };
  if (TIERS[plan]) return { allowed: true, plan, ...TIERS[plan] };

  return {
    allowed: false,
    plan,
    upgrade: 'growth',
    error: {
      en: 'The Market Heatmap is available on the Growth plan (your portfolio), and Pro/Business (full anonymized market view). Upgrade to unlock it.',
      ar: 'الخريطة الحرارية للسوق متاحة في باقة النمو (محفظتك)، وباقتي برو والأعمال (رؤية السوق الكاملة والمجهّلة). قم بالترقية لتفعيلها.',
    },
  };
}

const hasOccupancy = (p) => Number.isFinite(p?.currentOccupancy) && p.currentOccupancy > 0;
const hasAdr = (p) => Number.isFinite(p?.averageAdr) && p.averageAdr > 0;
// A property contributes to a cell only if it carries at least one real metric.
const hasSignal = (p) => hasOccupancy(p) || hasAdr(p);

/**
 * Property-level filters applied BEFORE aggregation (so platform/type/date
 * narrow the underlying sample honestly). `dateRange` (Business) scopes to the
 * last-activity timestamp Base44 stamps on each row.
 */
export function filterProperties(properties, filters = {}) {
  const { propertyType, platform, city, dateFrom, dateTo } = filters;
  const from = dateFrom ? new Date(dateFrom).getTime() : null;
  const to = dateTo ? new Date(dateTo).getTime() : null;
  return (properties || []).filter((p) => {
    if (!p) return false;
    if (city && city !== 'all' && p.city !== city) return false;
    if (propertyType && propertyType !== 'all' && p.type !== propertyType) return false;
    if (platform && platform !== 'all' && p.platform !== platform) return false;
    if (from || to) {
      const ts = new Date(p.updated_date || p.created_date || 0).getTime();
      if (from && ts < from) return false;
      if (to && ts > to) return false;
    }
    return true;
  });
}

/**
 * Aggregate properties into heatmap cells keyed by city + district
 * (+ property type when segmenting). Only real metrics are averaged.
 * Returns cells sorted by occupancy desc.
 */
export function aggregateCells(properties, { segmentByType = false } = {}) {
  const groups = new Map();
  for (const p of properties || []) {
    if (!hasSignal(p)) continue;
    const city = p.city || 'Other';
    const district = (p.district && String(p.district).trim()) || NO_DISTRICT;
    const type = segmentByType ? (p.type || 'other') : null;
    const key = `${city}||${district}||${type ?? '*'}`;
    if (!groups.has(key)) {
      groups.set(key, { city, district, propertyType: type, count: 0, occSum: 0, occN: 0, adrSum: 0, adrN: 0, revSum: 0 });
    }
    const g = groups.get(key);
    g.count += 1;
    if (hasOccupancy(p)) { g.occSum += p.currentOccupancy; g.occN += 1; }
    if (hasAdr(p)) { g.adrSum += p.averageAdr; g.adrN += 1; }
    if (Number.isFinite(p.monthlyRevenue) && p.monthlyRevenue > 0) g.revSum += p.monthlyRevenue;
  }

  const cells = [];
  for (const g of groups.values()) {
    const occupancy = g.occN > 0 ? round1(g.occSum / g.occN) : null;
    const adr = g.adrN > 0 ? round1(g.adrSum / g.adrN) : null;
    cells.push({
      id: `${g.city}||${g.district}||${g.propertyType ?? '*'}`,
      city: g.city,
      district: g.district,
      propertyType: g.propertyType,
      sampleCount: g.count,
      occupancy,
      adr,
      revenue: g.revSum > 0 ? Math.round(g.revSum) : null,
      intensity: intensityBucket(occupancy),
    });
  }
  cells.sort((a, b) => (b.occupancy ?? -1) - (a.occupancy ?? -1));
  return cells;
}

/**
 * Enforce k-anonymity for the market scope: drop any cell backed by fewer than
 * MIN_MARKET_SAMPLE properties so no individual listing can be reverse-derived.
 * Own scope keeps every cell (the user owns the data).
 */
export function applyScopePrivacy(cells, scope, minSample = MIN_MARKET_SAMPLE) {
  if (scope !== 'market') return cells;
  return cells.filter((c) => c.sampleCount >= minSample);
}

/** 5-level occupancy intensity bucket; -1 means "no occupancy data". */
export function intensityBucket(occupancy) {
  if (!Number.isFinite(occupancy)) return -1;
  if (occupancy >= 85) return 4;
  if (occupancy >= 70) return 3;
  if (occupancy >= 55) return 2;
  if (occupancy >= 40) return 1;
  return 0;
}

const median = (nums) => {
  const arr = nums.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (arr.length === 0) return null;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : round1((arr[mid - 1] + arr[mid]) / 2);
};

/**
 * Per-city summary (median occupancy/ADR, cell + sample counts) used for the
 * comparison view and for each cell's demand trend relative to its city.
 */
export function summarizeByCity(cells) {
  const byCity = new Map();
  for (const c of cells) {
    if (!byCity.has(c.city)) byCity.set(c.city, { city: c.city, occ: [], adr: [], cells: 0, samples: 0 });
    const s = byCity.get(c.city);
    if (Number.isFinite(c.occupancy)) s.occ.push(c.occupancy);
    if (Number.isFinite(c.adr)) s.adr.push(c.adr);
    s.cells += 1;
    s.samples += c.sampleCount;
  }
  return [...byCity.values()]
    .map((s) => ({
      city: s.city,
      medianOccupancy: median(s.occ),
      medianAdr: median(s.adr),
      areaCount: s.cells,
      sampleCount: s.samples,
    }))
    .sort((a, b) => (b.medianOccupancy ?? -1) - (a.medianOccupancy ?? -1));
}

/**
 * Demand trend for a cell RELATIVE TO ITS CITY (real, comparative — not a time
 * series; Madar does not yet store per-period occupancy snapshots). Returns
 * { direction: 'up'|'flat'|'down', deltaVsCity } where delta is occupancy
 * points above/below the city median.
 */
export function cellDemandTrend(cell, cityMedianOccupancy) {
  if (!Number.isFinite(cell?.occupancy) || !Number.isFinite(cityMedianOccupancy)) {
    return { direction: 'unknown', deltaVsCity: null };
  }
  const delta = round1(cell.occupancy - cityMedianOccupancy);
  const direction = delta > 5 ? 'up' : delta < -5 ? 'down' : 'flat';
  return { direction, deltaVsCity: delta };
}

/** Short bilingual insight for the clicked area, grounded only in its metrics. */
export function buildCellInsight(cell, trend, lang = 'en') {
  if (!cell || !Number.isFinite(cell.occupancy)) {
    return lang === 'ar'
      ? 'لا توجد بيانات إشغال كافية لهذه المنطقة بعد.'
      : 'Not enough occupancy data for this area yet.';
  }
  const area = cell.district === NO_DISTRICT ? cell.city : `${cell.district}`;
  const pts = trend?.deltaVsCity;
  if (lang === 'ar') {
    if (trend?.direction === 'up') return `إشغال ${area} أعلى من متوسط ${cell.city} بـ ${Math.abs(pts)} نقطة — طلب قوي؛ يمكن رفع أسعار أيام الأسبوع بحذر.`;
    if (trend?.direction === 'down') return `إشغال ${area} أقل من متوسط ${cell.city} بـ ${Math.abs(pts)} نقطة — راجع السعر والصور لجذب حجوزات أكثر.`;
    return `إشغال ${area} قريب من متوسط ${cell.city} — أداء متوازن؛ راقب الموسمية.`;
  }
  if (trend?.direction === 'up') return `${area} runs ${Math.abs(pts)} pts above the ${cell.city} average — strong demand; consider careful weekday premiums.`;
  if (trend?.direction === 'down') return `${area} runs ${Math.abs(pts)} pts below the ${cell.city} average — review pricing and photos to win more bookings.`;
  return `${area} tracks close to the ${cell.city} average — balanced performance; watch for seasonality.`;
}

/**
 * Assemble the full heatmap payload from already-fetched properties, honoring
 * the resolved access tier. Returns { hasData, scope, tier, cells, cities,
 * meta } — cells carry intensity + per-cell trend for the click summary.
 */
export function buildHeatmap(properties, access, filters = {}) {
  const filtered = filterProperties(properties, filters);
  const segment = Boolean(access.segmentation) && filters.propertyType && filters.propertyType !== 'all'
    ? false // a single type is already selected; no need to split further
    : Boolean(access.segmentation) && filters.segmentByType === true;
  let cells = aggregateCells(filtered, { segmentByType: segment });
  cells = applyScopePrivacy(cells, access.scope, MIN_MARKET_SAMPLE);

  const cities = summarizeByCity(cells);
  const cityMedian = new Map(cities.map((c) => [c.city, c.medianOccupancy]));
  cells = cells.map((c) => {
    const trend = cellDemandTrend(c, cityMedian.get(c.city));
    return { ...c, trend };
  });

  return {
    hasData: cells.length > 0,
    scope: access.scope,
    tier: access.tier,
    cells,
    cities,
    meta: {
      minSample: access.scope === 'market' ? MIN_MARKET_SAMPLE : 1,
      segmented: segment,
      trendBasis: 'relative_to_city_median',
      currency: 'SAR',
    },
  };
}

export const HEATMAP_LEGEND = [
  { bucket: 0, en: 'Very low', ar: 'منخفض جدًا', range: '<40%' },
  { bucket: 1, en: 'Low', ar: 'منخفض', range: '40–55%' },
  { bucket: 2, en: 'Medium', ar: 'متوسط', range: '55–70%' },
  { bucket: 3, en: 'High', ar: 'مرتفع', range: '70–85%' },
  { bucket: 4, en: 'Very high', ar: 'مرتفع جدًا', range: '85%+' },
];
