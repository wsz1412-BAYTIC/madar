/**
 * Pure, deterministic pricing calculations for short-term-rental properties.
 *
 * No AI, no network calls, no side effects. Every function here takes plain
 * numbers/objects and returns plain numbers/objects so it can run unmodified
 * in the browser and in the Deno runtime used by Base44 backend functions.
 */

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const safeDivide = (numerator, denominator) => {
  if (!denominator || !Number.isFinite(denominator) || denominator === 0) return null;
  if (!Number.isFinite(numerator)) return null;
  return numerator / denominator;
};

export function calculateOccupancyRate({ bookedNights, availableNights }) {
  const rate = safeDivide(bookedNights, availableNights);
  if (rate === null) return null;
  return round2(Math.min(Math.max(rate, 0), 1));
}

export function calculateADR({ roomRevenue, bookedNights }) {
  const adr = safeDivide(roomRevenue, bookedNights);
  if (adr === null) return null;
  return round2(Math.max(adr, 0));
}

export function calculateRevPAR({ adr, occupancyRate, roomRevenue, availableNights }) {
  if (Number.isFinite(adr) && Number.isFinite(occupancyRate)) {
    return round2(Math.max(adr * occupancyRate, 0));
  }
  const revpar = safeDivide(roomRevenue, availableNights);
  if (revpar === null) return null;
  return round2(Math.max(revpar, 0));
}

export function calculateNetRevenue({ grossRevenue, operatingCosts = 0, platformFeeRate = 0 }) {
  if (!Number.isFinite(grossRevenue)) return null;
  const costs = Math.max(operatingCosts || 0, 0);
  const fees = grossRevenue * Math.min(Math.max(platformFeeRate, 0), 1);
  return round2(grossRevenue - costs - fees);
}

export function calculateBookingPace({ bookingsOnBooksNow, bookingsOnBooksSamePointLastPeriod }) {
  if (!Number.isFinite(bookingsOnBooksNow) || bookingsOnBooksNow < 0) return null;
  if (!bookingsOnBooksSamePointLastPeriod || bookingsOnBooksSamePointLastPeriod <= 0) return null;
  return round2(bookingsOnBooksNow / bookingsOnBooksSamePointLastPeriod);
}

export function calculateBreakEvenPrice({ operatingCosts, availableNights, targetOccupancyRate }) {
  if (!Number.isFinite(operatingCosts) || operatingCosts < 0) return null;
  if (!Number.isFinite(availableNights) || availableNights <= 0) return null;
  if (!Number.isFinite(targetOccupancyRate) || targetOccupancyRate <= 0) return null;
  const expectedBookedNights = availableNights * Math.min(targetOccupancyRate, 1);
  const breakEven = safeDivide(operatingCosts, expectedBookedNights);
  if (breakEven === null) return null;
  return round2(breakEven);
}

export function calculatePricingBoundaries({ breakEvenPrice, currentAdr, marketAdr, dataQualityScore = 50 }) {
  if (!Number.isFinite(breakEvenPrice) || breakEvenPrice <= 0) return null;

  const safetyMargin = 1.05;
  const floor = round2(breakEvenPrice * safetyMargin);

  const referenceAdr = [currentAdr, marketAdr].filter((v) => Number.isFinite(v) && v > 0);
  const reference = referenceAdr.length > 0 ? Math.max(...referenceAdr) : floor;

  const quality = Math.min(Math.max(dataQualityScore, 0), 100) / 100;
  const maxUpliftCap = 1.10 + quality * 0.25;
  const ceiling = round2(Math.max(reference * maxUpliftCap, floor));

  return { min: floor, max: Math.max(ceiling, floor) };
}

export function calculateDataQualityScore(inputs) {
  const checks = [
    { key: 'occupancy', present: Number.isFinite(inputs.occupancyRate), weight: 25, flag: 'missing_occupancy_data' },
    { key: 'adr', present: Number.isFinite(inputs.adr), weight: 25, flag: 'missing_adr_data' },
    { key: 'operatingCosts', present: Number.isFinite(inputs.operatingCosts) && inputs.operatingCosts > 0, weight: 20, flag: 'missing_operating_costs' },
    { key: 'bookingPace', present: Number.isFinite(inputs.bookingPace), weight: 15, flag: 'missing_booking_pace_data' },
    { key: 'marketAdr', present: Number.isFinite(inputs.marketAdr) && inputs.marketAdr > 0, weight: 15, flag: 'missing_market_comparison' },
  ];

  const score = checks.reduce((sum, c) => sum + (c.present ? c.weight : 0), 0);
  const flags = checks.filter((c) => !c.present).map((c) => c.flag);

  return { score, flags };
}

/**
 * Assemble the full metrics snapshot for a property from whatever real data
 * is available. Adapts to the Base44 UserProperty entity field names:
 * price (nightly), rating, city, platform, bedrooms, etc.
 */
export function buildMetricsSnapshot(property, options = {}) {
  const {
    availableNights = 30,
    targetOccupancyRate = 0.6,
    marketAdr,
    platformFeeRate = 0.03,
    bookingPaceInput,
  } = options;

  const nightlyPrice = Number.isFinite(property?.price) ? property.price : null;
  const occupancyRate = null; // not stored on the entity
  const adr = nightlyPrice; // use nightly price as ADR when no better data
  const grossRevenue = Number.isFinite(nightlyPrice) ? nightlyPrice * availableNights : null;
  const operatingCosts = null; // not stored on the entity

  const revpar = Number.isFinite(adr) && Number.isFinite(occupancyRate)
    ? calculateRevPAR({ adr, occupancyRate })
    : null;

  const netRevenue = Number.isFinite(grossRevenue)
    ? calculateNetRevenue({ grossRevenue, operatingCosts: operatingCosts || 0, platformFeeRate })
    : null;

  const bookingPace = bookingPaceInput ? calculateBookingPace(bookingPaceInput) : null;

  const breakEvenPrice = Number.isFinite(operatingCosts)
    ? calculateBreakEvenPrice({ operatingCosts, availableNights, targetOccupancyRate })
    : null;

  const { score: dataQualityScore, flags: dataQualityFlags } = calculateDataQualityScore({
    occupancyRate,
    adr,
    operatingCosts,
    bookingPace,
    marketAdr,
  });

  const boundaries = Number.isFinite(breakEvenPrice)
    ? calculatePricingBoundaries({ breakEvenPrice, currentAdr: adr, marketAdr, dataQualityScore })
    : null;

  const evidence = [
    { key: 'occupancyRate', label: 'Occupancy rate', labelAr: 'نسبة الإشغال', value: occupancyRate },
    { key: 'adr', label: 'Average Daily Rate', labelAr: 'متوسط سعر الليلة', value: adr },
    { key: 'revpar', label: 'Revenue per available night', labelAr: 'الإيراد لكل ليلة متاحة', value: revpar },
    { key: 'grossRevenue', label: 'Gross monthly revenue', labelAr: 'إجمالي الإيراد الشهري', value: grossRevenue },
    { key: 'netRevenue', label: 'Net monthly revenue', labelAr: 'صافي الإيراد الشهري', value: netRevenue },
    { key: 'operatingCosts', label: 'Operating costs', labelAr: 'التكاليف التشغيلية', value: operatingCosts },
    { key: 'bookingPace', label: 'Booking pace index', labelAr: 'مؤشر وتيرة الحجز', value: bookingPace },
    { key: 'breakEvenPrice', label: 'Break-even nightly price', labelAr: 'سعر التعادل لليلة', value: breakEvenPrice },
    { key: 'priceFloor', label: 'Recommended price floor', labelAr: 'الحد الأدنى للسعر الموصى به', value: boundaries?.min ?? null },
    { key: 'priceCeiling', label: 'Recommended price ceiling', labelAr: 'الحد الأعلى للسعر الموصى به', value: boundaries?.max ?? null },
    { key: 'marketAdr', label: 'Market comparison ADR', labelAr: 'متوسط سعر السوق', value: Number.isFinite(marketAdr) ? marketAdr : null },
    { key: 'dataQualityScore', label: 'Data quality score', labelAr: 'درجة جودة البيانات', value: dataQualityScore },
  ].filter((e) => e.value !== null && e.value !== undefined);

  return {
    occupancyRate,
    adr,
    revpar,
    grossRevenue,
    netRevenue,
    operatingCosts,
    bookingPace,
    breakEvenPrice,
    priceFloor: boundaries?.min ?? null,
    priceCeiling: boundaries?.max ?? null,
    marketAdr: Number.isFinite(marketAdr) ? marketAdr : null,
    dataQualityScore,
    dataQualityFlags,
    evidence,
    currency: 'SAR',
  };
}