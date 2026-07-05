// Deno backend function: Price recommendation engine (extended).
// Reads OPENAI_API_KEY from Base44 Secrets. Re-fetches the property server-side;
// only propertyId is trusted from the client. All dependencies inlined.
// Adapted to existing Base44 entity schemas (snake_case).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_TIMEOUT_MS = 20000;
const RECOMMENDATION_VALIDITY_DAYS = 7;

// ── platformFees (inlined) ──────────────────────────────────────────────────
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

const DEFAULT_PLATFORM_FEES = Object.freeze({
  'Airbnb': 0.14, 'Gathern': 0.125, 'Booking.com': 0.15, 'Other': 0.10,
});

const PLATFORM_MAP = {
  'airbnb': 'Airbnb', 'booking': 'Booking.com', 'gatherin': 'Gathern',
  'gathern': 'Gathern', 'other': 'Other',
};

function normalizePlatformKey(platform) {
  const key = typeof platform === 'string' && platform.trim() ? platform.trim() : 'Other';
  return PLATFORM_MAP[key.toLowerCase()] || key;
}

function parseFeeOverrides(configJson) {
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
  } catch { return {}; }
}

function resolvePlatformFee(platform, overrides = {}) {
  const key = normalizePlatformKey(platform);
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return { platform: key, rate: overrides[key], estimated: false, source: 'config' };
  }
  if (Object.prototype.hasOwnProperty.call(DEFAULT_PLATFORM_FEES, key)) {
    return { platform: key, rate: DEFAULT_PLATFORM_FEES[key], estimated: true, source: 'default' };
  }
  return { platform: key, rate: DEFAULT_PLATFORM_FEES.Other, estimated: true, source: 'default_other' };
}

function netRevenueAfterFees(grossRevenue, platform, overrides = {}) {
  if (!Number.isFinite(grossRevenue) || grossRevenue < 0) return null;
  const fee = resolvePlatformFee(platform, overrides);
  const feeAmount = round2(grossRevenue * fee.rate);
  return {
    platform: fee.platform, gross: round2(grossRevenue), feeRate: fee.rate,
    feeAmount, net: round2(grossRevenue - feeAmount), estimated: fee.estimated, source: fee.source,
  };
}

function projectRevenueImpact({ currentPrice, recommendedPrice, occupancyRate, availableNights = 30, platform, overrides = {} }) {
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
    currentGross, projectedGross, impactSar, impactPercent,
    currentNet: netRevenueAfterFees(currentGross, platform, overrides),
    projectedNet: netRevenueAfterFees(projectedGross, platform, overrides),
    assumption: {
      en: 'Straight-line estimate at unchanged occupancy — actual demand response is not guaranteed.',
      ar: 'تقدير خطي بافتراض ثبات الإشغال — استجابة الطلب الفعلية غير مضمونة.',
    },
  };
}

// ── pricingEngine (inlined, adapted to UserProperty snake_case fields) ─────
function calculateNetRevenue({ grossRevenue, operatingCosts = 0, platformFeeRate = 0 }) {
  if (!Number.isFinite(grossRevenue)) return null;
  const costs = Math.max(operatingCosts || 0, 0);
  const fees = grossRevenue * Math.min(Math.max(platformFeeRate, 0), 1);
  return round2(grossRevenue - costs - fees);
}

function calculateBreakEvenPrice({ operatingCosts, availableNights, targetOccupancyRate }) {
  if (!Number.isFinite(operatingCosts) || operatingCosts < 0) return null;
  if (!Number.isFinite(availableNights) || availableNights <= 0) return null;
  if (!Number.isFinite(targetOccupancyRate) || targetOccupancyRate <= 0) return null;
  const expectedBookedNights = availableNights * Math.min(targetOccupancyRate, 1);
  if (!expectedBookedNights) return null;
  return round2(operatingCosts / expectedBookedNights);
}

function calculateDataQualityScore(inputs) {
  const checks = [
    { present: Number.isFinite(inputs.occupancyRate), weight: 25, flag: 'missing_occupancy_data' },
    { present: Number.isFinite(inputs.adr), weight: 25, flag: 'missing_adr_data' },
    { present: Number.isFinite(inputs.operatingCosts) && inputs.operatingCosts > 0, weight: 20, flag: 'missing_operating_costs' },
    { present: Number.isFinite(inputs.bookingPace), weight: 15, flag: 'missing_booking_pace_data' },
    { present: Number.isFinite(inputs.marketAdr) && inputs.marketAdr > 0, weight: 15, flag: 'missing_market_comparison' },
  ];
  const score = checks.reduce((sum, c) => sum + (c.present ? c.weight : 0), 0);
  const flags = checks.filter((c) => !c.present).map((c) => c.flag);
  return { score, flags };
}

function calculatePricingBoundaries({ breakEvenPrice, currentAdr, marketAdr, dataQualityScore = 50 }) {
  if (!Number.isFinite(breakEvenPrice) || breakEvenPrice <= 0) return null;
  const floor = round2(breakEvenPrice * 1.05);
  const referenceAdr = [currentAdr, marketAdr].filter((v) => Number.isFinite(v) && v > 0);
  const reference = referenceAdr.length > 0 ? Math.max(...referenceAdr) : floor;
  const quality = Math.min(Math.max(dataQualityScore, 0), 100) / 100;
  const maxUpliftCap = 1.10 + quality * 0.25;
  const ceiling = round2(Math.max(reference * maxUpliftCap, floor));
  return { min: floor, max: Math.max(ceiling, floor) };
}

function buildMetricsSnapshot(property, options = {}) {
  const { availableNights = 30, targetOccupancyRate = 0.6, marketAdr, platformFeeRate = 0.03 } = options;
  const nightlyPrice = Number.isFinite(property?.price) ? property.price : null;
  const occupancyRate = null;
  const adr = nightlyPrice;
  const grossRevenue = Number.isFinite(nightlyPrice) ? nightlyPrice * availableNights : null;
  const operatingCosts = null;
  const netRevenue = Number.isFinite(grossRevenue)
    ? calculateNetRevenue({ grossRevenue, operatingCosts: 0, platformFeeRate }) : null;
  const breakEvenPrice = null;
  const { score: dataQualityScore, flags: dataQualityFlags } = calculateDataQualityScore({
    occupancyRate, adr, operatingCosts, bookingPace: null, marketAdr,
  });
  const boundaries = Number.isFinite(breakEvenPrice)
    ? calculatePricingBoundaries({ breakEvenPrice, currentAdr: adr, marketAdr, dataQualityScore }) : null;
  const evidence = [
    { key: 'occupancyRate', label: 'Occupancy rate', labelAr: 'نسبة الإشغال', value: occupancyRate },
    { key: 'adr', label: 'Average Daily Rate', labelAr: 'متوسط سعر الليلة', value: adr },
    { key: 'grossRevenue', label: 'Gross monthly revenue', labelAr: 'إجمالي الإيراد الشهري', value: grossRevenue },
    { key: 'netRevenue', label: 'Net monthly revenue', labelAr: 'صافي الإيراد الشهري', value: netRevenue },
    { key: 'breakEvenPrice', label: 'Break-even nightly price', labelAr: 'سعر التعادل لليلة', value: breakEvenPrice },
    { key: 'priceFloor', label: 'Recommended price floor', labelAr: 'الحد الأدنى للسعر الموصى به', value: boundaries?.min ?? null },
    { key: 'priceCeiling', label: 'Recommended price ceiling', labelAr: 'الحد الأعلى للسعر الموصى به', value: boundaries?.max ?? null },
    { key: 'dataQualityScore', label: 'Data quality score', labelAr: 'درجة جودة البيانات', value: dataQualityScore },
  ].filter((e) => e.value !== null && e.value !== undefined);
  return {
    occupancyRate, adr, grossRevenue, netRevenue, operatingCosts, breakEvenPrice,
    priceFloor: boundaries?.min ?? null, priceCeiling: boundaries?.max ?? null,
    marketAdr: Number.isFinite(marketAdr) ? marketAdr : null,
    dataQualityScore, dataQualityFlags, evidence, currency: 'SAR',
  };
}

// ── aiRecommendationValidation (inlined) ──────────────────────────────────
const CONFIDENCE_LEVELS = ['low', 'medium', 'high'];

const RESPONSE_JSON_SCHEMA = {
  name: 'pricing_recommendation',
  schema: {
    type: 'object', additionalProperties: false,
    properties: {
      summaryAr: { type: 'string' },
      actionsAr: { type: 'array', items: { type: 'string' } },
      caveatsAr: { type: 'array', items: { type: 'string' } },
      confidence: { type: 'string', enum: CONFIDENCE_LEVELS },
      citedMetricKeys: { type: 'array', items: { type: 'string' } },
    },
    required: ['summaryAr', 'actionsAr', 'caveatsAr', 'confidence', 'citedMetricKeys'],
  },
  strict: true,
};

function buildSystemPrompt() {
  return [
    'You are a pricing analyst assistant for short-term rental hosts in Saudi Arabia.',
    'You will be given a fixed set of already-calculated metrics for one property. Treat these numbers as the ONLY facts you know.',
    'Rules: 1. Never invent numbers. 2. Only reference metrics by their keys. 3. Say so in Arabic if data is missing.',
    '4. Write all text in Modern Standard Arabic. 5. Never guarantee outcomes. 6. Respond ONLY with JSON.',
  ].join('\n');
}

function buildUserPrompt(snapshot, propertyContext = {}) {
  const metrics = Object.fromEntries(snapshot.evidence.map((e) => [e.key, e.value]));
  return [
    'Property context:', JSON.stringify({ city: propertyContext.city ?? null, type: propertyContext.property_type ?? null, bedrooms: propertyContext.bedrooms ?? null, currency: snapshot.currency }),
    'Calculated metrics:', JSON.stringify(metrics),
    'Data quality flags:', JSON.stringify(snapshot.dataQualityFlags),
    'Produce a short Arabic summary and 2-5 concrete pricing actions grounded strictly in the metrics above.',
  ].join('\n');
}

function normalizeDigits(text) {
  return text.replace(/[٠-٩۰-۹]/g, (ch) => {
    const code = ch.codePointAt(0);
    const offset = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - offset);
  });
}

function buildAllowedNumbers(snapshot) {
  const numbers = new Set();
  for (const entry of snapshot.evidence) {
    if (typeof entry.value === 'number' && Number.isFinite(entry.value)) {
      numbers.add(Math.round(entry.value));
      numbers.add(Math.round(entry.value * 100));
    }
  }
  return numbers;
}

function validateAiResponse(raw, snapshot) {
  if (!raw || typeof raw !== 'object') return { valid: false, reason: 'not_an_object' };
  const { summaryAr, actionsAr, caveatsAr, confidence, citedMetricKeys } = raw;
  if (typeof summaryAr !== 'string' || !summaryAr.trim() || summaryAr.length > 1200) return { valid: false, reason: 'invalid_summary' };
  if (!Array.isArray(actionsAr) || actionsAr.length === 0 || actionsAr.length > 6) return { valid: false, reason: 'invalid_actions' };
  if (!Array.isArray(caveatsAr) || caveatsAr.length > 5) return { valid: false, reason: 'invalid_caveats' };
  if (!CONFIDENCE_LEVELS.includes(confidence)) return { valid: false, reason: 'invalid_confidence' };
  if (!Array.isArray(citedMetricKeys) || citedMetricKeys.length === 0) return { valid: false, reason: 'missing_citations' };
  const allowedKeys = new Set(snapshot.evidence.map((e) => e.key));
  if (citedMetricKeys.some((k) => !allowedKeys.has(k))) return { valid: false, reason: 'unknown_metric_citation' };
  const allowedNumbers = buildAllowedNumbers(snapshot);
  const fullText = [summaryAr, ...actionsAr, ...caveatsAr].join(' \n ');
  const tokens = normalizeDigits(fullText).match(/\d+(?:\.\d+)?/g) || [];
  for (const tok of tokens.map(Number)) {
    const rounded = Math.round(tok);
    let ok = false;
    for (let delta = -1; delta <= 1; delta++) { if (allowedNumbers.has(rounded + delta)) { ok = true; break; } }
    if (!ok) return { valid: false, reason: 'hallucinated_number' };
  }
  return { valid: true, data: { summaryAr: summaryAr.trim(), actionsAr: actionsAr.map((a) => a.trim()), caveatsAr: caveatsAr.map((c) => c.trim()), confidence, citedMetricKeys } };
}

function buildFallbackRecommendation(snapshot) {
  const actions = [];
  if (Number.isFinite(snapshot.priceFloor) && Number.isFinite(snapshot.priceCeiling)) {
    actions.push(`يوصى بضبط السعر ضمن نطاق ${snapshot.priceFloor} - ${snapshot.priceCeiling} ${snapshot.currency} لليلة.`);
  }
  if (actions.length === 0) actions.push('البيانات المتوفرة غير كافية لتوليد توصية دقيقة، يرجى تحديث بيانات العقار.');
  const caveats = ['هذه توصية أساسية مبنية على حسابات ثابتة فقط دون تحليل ذكاء اصطناعي.'];
  if (snapshot.dataQualityFlags?.length > 0) caveats.push('تفتقر هذه التوصية إلى بعض البيانات، يرجى مراجعتها يدوياً.');
  return {
    summaryAr: 'توصية تسعير أساسية مبنية على الحسابات الثابتة لعقارك دون تدخل الذكاء الاصطناعي.',
    actionsAr: actions, caveatsAr: caveats,
    confidence: snapshot.dataQualityScore >= 70 ? 'medium' : 'low',
    citedMetricKeys: snapshot.evidence.map((e) => e.key),
  };
}

// ── OpenAI call ─────────────────────────────────────────────────────────────
async function callOpenAI(snapshot, propertyContext, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL, temperature: 0.2,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(snapshot, propertyContext) },
        ],
        response_format: { type: 'json_schema', json_schema: RESPONSE_JSON_SCHEMA },
      }),
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, reason: `openai_http_${response.status}` };
    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return { ok: false, reason: 'openai_empty_response' };
    let parsed;
    try { parsed = JSON.parse(content); } catch { return { ok: false, reason: 'openai_invalid_json' }; }
    const validation = validateAiResponse(parsed, snapshot);
    if (!validation.valid) return { ok: false, reason: `validation_failed:${validation.reason}` };
    return { ok: true, data: validation.data };
  } catch (error) {
    return { ok: false, reason: error?.name === 'AbortError' ? 'openai_timeout' : 'openai_network_error' };
  } finally { clearTimeout(timeout); }
}

// ── Main handler ────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const [user, body] = await Promise.all([base44.auth.me(), req.json()]);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { propertyId } = body;
    if (!propertyId || typeof propertyId !== 'string') return Response.json({ error: 'propertyId is required' }, { status: 400 });

    const property = await base44.asServiceRole.entities.UserProperty.get(propertyId).catch(() => null);
    if (!property) return Response.json({ error: 'Property not found' }, { status: 404 });

    const isOwner = property.created_by_id === user.id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const feeOverrides = parseFeeOverrides(Deno.env.get('PLATFORM_FEES_JSON'));
    const fee = resolvePlatformFee(property.platform, feeOverrides);
    const snapshot = buildMetricsSnapshot(property, { platformFeeRate: fee.rate });

    const apiKey = Deno.env.get('OpenAI_API_KEY');
    let recommendation;
    let source = 'fallback';
    let aiModel = null;
    let fallbackReason = apiKey ? null : 'missing_api_key';

    if (apiKey) {
      const result = await callOpenAI(snapshot, property, apiKey);
      if (result.ok) { recommendation = result.data; source = 'ai'; aiModel = OPENAI_MODEL; }
      else { fallbackReason = result.reason; }
    }
    if (!recommendation) recommendation = buildFallbackRecommendation(snapshot);

    const now = new Date();
    const validUntil = new Date(now.getTime() + RECOMMENDATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

    const recommendedPrice = Number.isFinite(snapshot.adr) ? snapshot.adr : null;
    const currentPrice = Number.isFinite(property.price) ? property.price : snapshot.adr;
    const monthlyNetAfterFees = netRevenueAfterFees(snapshot.grossRevenue, property.platform, feeOverrides);
    const revenueProjection = projectRevenueImpact({
      currentPrice, recommendedPrice, occupancyRate: snapshot.occupancyRate,
      availableNights: 30, platform: property.platform, overrides: feeOverrides,
    });

    const record = await base44.asServiceRole.entities.PriceRecommendation.create({
      user_property_id: propertyId,
      recommended_price: recommendedPrice,
      current_price: currentPrice,
      min_price: snapshot.priceFloor,
      max_price: snapshot.priceCeiling,
      confidence_score: source === 'ai' ? (recommendation.confidence === 'high' ? 0.9 : recommendation.confidence === 'medium' ? 0.7 : 0.4) : 0.3,
      reasoning_ar: recommendation.summaryAr,
      reasoning_en: recommendation.summaryAr,
      action_ar: recommendation.actionsAr.join(' | '),
      action_en: recommendation.actionsAr.join(' | '),
      revenue_impact: revenueProjection?.impactSar ?? null,
      status: 'pending',
      period: '30d',
      expires_at: validUntil.toISOString(),
      platform_fee_rate: fee.rate,
      platform_fee_estimated: fee.estimated,
      net_revenue_after_fees: monthlyNetAfterFees?.net ?? null,
      revenue_projection: revenueProjection || null,
    });

    try {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ owner_id: property.created_by_id });
      await base44.asServiceRole.entities.AiUsageLog.create({
        userId: property.created_by_id,
        functionName: 'generate-price-recommendation',
        plan: String(subs?.[0]?.plan || 'free').toLowerCase(),
        status: source === 'ai' ? 'success' : 'fallback',
        model: aiModel,
        promptTokens: null, completionTokens: null,
        detail: fallbackReason || null,
        createdAt: now.toISOString(),
      });
    } catch (e) { console.error('AiUsageLog write failed', e?.message); }

    return Response.json({ success: true, recommendation: record });
  } catch (error) {
    console.error('generate-price-recommendation error', error);
    return Response.json(
      { error: 'حدث خطأ غير متوقع — حاول مرة أخرى.', error_en: error?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
});