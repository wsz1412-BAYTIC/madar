/**
 * Configurable platform fee rates and fee-only net revenue.
 *
 * netRevenueAfterFees = gross rent revenue - platform commission ONLY
 * (operating costs are handled separately by pricingEngine.calculateNetRevenue).
 *
 * The bundled defaults are ESTIMATES of typical host-side commission in the
 * Saudi market. Every consumer must surface the `estimated` flag until ops
 * confirms real contract rates via the PLATFORM_FEES_JSON config override
 * (Base44 secret / env var), e.g. {"Airbnb":0.14,"Gathern":0.10}. Overridden
 * rates are treated as confirmed (estimated: false).
 *
 * Pure module - no network, no env reads here (callers pass the raw config
 * string). Mirrored into backend function folders.
 */

const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

export const DEFAULT_PLATFORM_FEES = Object.freeze({
  'Airbnb': 0.14,
  'Gathern': 0.125,
  'Booking.com': 0.15,
  'Other': 0.10,
});

export const PLATFORM_FEES_CONFIG_KEY = 'PLATFORM_FEES_JSON';

/**
 * Map internal platform enum (lowercase) to fee-config platform name.
 */
const PLATFORM_MAP = {
  'airbnb': 'Airbnb',
  'booking': 'Booking.com',
  'gatherin': 'Gathern',
  'gathern': 'Gathern',
  'other': 'Other',
};

export function normalizePlatformKey(platform) {
  const key = typeof platform === 'string' && platform.trim() ? platform.trim() : 'Other';
  return PLATFORM_MAP[key.toLowerCase()] || key;
}

/**
 * Parse the PLATFORM_FEES_JSON override string. Unknown platforms are kept
 * (future-proof); invalid entries and malformed JSON are ignored entirely.
 */
export function parseFeeOverrides(configJson) {
  if (!configJson || typeof configJson !== 'string') return {};
  try {
    const parsed = JSON.parse(configJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean = {};
    for (const [platform, rate] of Object.entries(parsed)) {
      const n = Number(rate);
      if (Number.isFinite(n) && n >= 0 && n < 1) clean[platform] = n;
    }
    return clean;
  } catch {
    return {};
  }
}

/**
 * Resolve the fee rate for a platform.
 * Returns { platform, rate, estimated, source }.
 */
export function resolvePlatformFee(platform, overrides = {}) {
  const key = normalizePlatformKey(platform);
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return { platform: key, rate: overrides[key], estimated: false, source: 'config' };
  }
  if (Object.prototype.hasOwnProperty.call(DEFAULT_PLATFORM_FEES, key)) {
    return { platform: key, rate: DEFAULT_PLATFORM_FEES[key], estimated: true, source: 'default' };
  }
  return { platform: key, rate: DEFAULT_PLATFORM_FEES.Other, estimated: true, source: 'default_other' };
}

/**
 * Net revenue from rent value after deducting the platform fee ONLY.
 */
export function netRevenueAfterFees(grossRevenue, platform, overrides = {}) {
  if (!Number.isFinite(grossRevenue) || grossRevenue < 0) return null;
  const fee = resolvePlatformFee(platform, overrides);
  const feeAmount = round2(grossRevenue * fee.rate);
  return {
    platform: fee.platform,
    gross: round2(grossRevenue),
    feeRate: fee.rate,
    feeAmount,
    net: round2(grossRevenue - feeAmount),
    estimated: fee.estimated,
    source: fee.source,
  };
}

/**
 * Deterministic revenue projection for a nightly-price change.
 * Returns null when inputs are unusable.
 */
export function projectRevenueImpact({
  currentPrice,
  recommendedPrice,
  occupancyRate,
  availableNights = 30,
  platform,
  overrides = {},
}) {
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) return null;
  if (!Number.isFinite(recommendedPrice) || recommendedPrice <= 0) return null;
  const occ = Number.isFinite(occupancyRate) ? Math.min(Math.max(occupancyRate, 0), 1) : null;
  if (occ === null || !Number.isFinite(availableNights) || availableNights <= 0) return null;

  const bookedNights = availableNights * occ;
  const currentGross = round2(currentPrice * bookedNights);
  const projectedGross = round2(recommendedPrice * bookedNights);
  const impactSar = round2(projectedGross - currentGross);
  const impactPercent = currentGross > 0 ? round2((impactSar / currentGross) * 100) : null;

  return {
    currentGross,
    projectedGross,
    impactSar,
    impactPercent,
    currentNet: netRevenueAfterFees(currentGross, platform, overrides),
    projectedNet: netRevenueAfterFees(projectedGross, platform, overrides),
    assumption: {
      en: 'Straight-line estimate at unchanged occupancy — actual demand response is not guaranteed.',
      ar: 'تقدير خطي بافتراض ثبات الإشغال — استجابة الطلب الفعلية غير مضمونة.',
    },
  };
}