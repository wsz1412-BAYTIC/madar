/**
 * Guardrails around the OpenAI call for pricing recommendations.
 *
 * This module never talks to the network itself — it only builds the prompt
 * from an already-computed, trusted metrics snapshot (see pricingEngine.js)
 * and validates/rejects whatever the model returns. The goal is that the AI
 * can only *interpret* numbers we already calculated; it cannot introduce
 * new prices, competitors, events, or market claims.
 *
 * Deliberately dependency-free (no zod) so this file can be mirrored
 * byte-for-byte into base44/functions/*\/aiRecommendationValidation.js and
 * run unmodified on Deno. Keep both copies identical.
 */

export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'];

const MAX_SUMMARY_LENGTH = 1200;
const MAX_ACTIONS = 6;
const MAX_ACTION_LENGTH = 300;
const MAX_CAVEATS = 5;
const MAX_CAVEAT_LENGTH = 300;

export const RESPONSE_JSON_SCHEMA = {
  name: 'pricing_recommendation',
  schema: {
    type: 'object',
    additionalProperties: false,
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

export function buildSystemPrompt() {
  return [
    'You are a pricing analyst assistant for short-term rental hosts in Saudi Arabia.',
    'You will be given a fixed set of already-calculated metrics for one property. Treat these numbers as the ONLY facts you know.',
    'Rules you must follow exactly:',
    '1. Never invent, estimate, or guess any number, price, percentage, competitor name, event, or market claim that is not present in the provided metrics.',
    '2. Only reference metrics by the exact keys given to you, listed in "citedMetricKeys".',
    '3. If a metric needed to answer confidently is missing, say so explicitly in Arabic rather than filling the gap with an assumption.',
    '4. Write all user-facing text (summaryAr, actionsAr, caveatsAr) in Modern Standard Arabic.',
    '5. Never claim a specific future revenue outcome as guaranteed; frame recommendations as suggestions requiring human review.',
    '6. Respond ONLY with JSON matching the provided schema. No prose outside the JSON.',
  ].join('\n');
}

export function buildUserPrompt(snapshot, propertyContext = {}) {
  const metrics = Object.fromEntries(snapshot.evidence.map((e) => [e.key, e.value]));
  const context = {
    city: propertyContext.city ?? null,
    type: propertyContext.type ?? null,
    bedrooms: propertyContext.bedrooms ?? null,
    currency: snapshot.currency,
  };
  return [
    'Property context (non-numeric, for tone only, do not treat as additional facts to cite):',
    JSON.stringify(context),
    '',
    'Calculated metrics (the only numbers you may reference; cite their keys in citedMetricKeys):',
    JSON.stringify(metrics),
    '',
    'Data quality flags (things we do NOT have reliable data for):',
    JSON.stringify(snapshot.dataQualityFlags),
    '',
    'Produce a short Arabic summary and 2-5 concrete pricing actions grounded strictly in the metrics above.',
  ].join('\n');
}

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isStringArray = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string');

/**
 * Pulls numeric tokens (integers/decimals) out of Arabic/English text so we
 * can check the model didn't fabricate a number that isn't one of our
 * allowed values.
 */
export function extractNumericTokens(text) {
  if (typeof text !== 'string') return [];
  const matches = text.match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

function buildAllowedNumbers(snapshot) {
  const numbers = new Set();
  for (const entry of snapshot.evidence) {
    if (typeof entry.value === 'number' && Number.isFinite(entry.value)) {
      numbers.add(Math.round(entry.value));
      numbers.add(Math.round(entry.value * 100)); // percentages expressed as e.g. 65 for 0.65
    }
  }
  // Small integers are allowed as generic language (counts, "2-3 nights", list numbering, etc.)
  for (let i = 0; i <= 31; i++) numbers.add(i);
  return numbers;
}

function numbersAreAllowed(text, allowedNumbers, tolerance = 1) {
  const tokens = extractNumericTokens(text);
  for (const token of tokens) {
    const rounded = Math.round(token);
    let ok = false;
    for (const allowed of allowedNumbers) {
      if (Math.abs(allowed - rounded) <= tolerance) {
        ok = true;
        break;
      }
    }
    if (!ok) return false;
  }
  return true;
}

/**
 * Validates a parsed AI response against the trusted snapshot it was built
 * from. Returns { valid: true, data } or { valid: false, reason }.
 */
export function validateAiResponse(raw, snapshot) {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, reason: 'not_an_object' };
  }

  const { summaryAr, actionsAr, caveatsAr, confidence, citedMetricKeys } = raw;

  if (!isNonEmptyString(summaryAr) || summaryAr.length > MAX_SUMMARY_LENGTH) {
    return { valid: false, reason: 'invalid_summary' };
  }
  if (!isStringArray(actionsAr) || actionsAr.length === 0 || actionsAr.length > MAX_ACTIONS) {
    return { valid: false, reason: 'invalid_actions' };
  }
  if (actionsAr.some((a) => a.length === 0 || a.length > MAX_ACTION_LENGTH)) {
    return { valid: false, reason: 'action_length' };
  }
  if (!isStringArray(caveatsAr) || caveatsAr.length > MAX_CAVEATS) {
    return { valid: false, reason: 'invalid_caveats' };
  }
  if (caveatsAr.some((c) => c.length > MAX_CAVEAT_LENGTH)) {
    return { valid: false, reason: 'caveat_length' };
  }
  if (!CONFIDENCE_LEVELS.includes(confidence)) {
    return { valid: false, reason: 'invalid_confidence' };
  }
  if (!isStringArray(citedMetricKeys) || citedMetricKeys.length === 0) {
    return { valid: false, reason: 'missing_citations' };
  }

  const allowedKeys = new Set(snapshot.evidence.map((e) => e.key));
  const unknownKeys = citedMetricKeys.filter((k) => !allowedKeys.has(k));
  if (unknownKeys.length > 0) {
    return { valid: false, reason: 'unknown_metric_citation', details: unknownKeys };
  }

  const allowedNumbers = buildAllowedNumbers(snapshot);
  const fullText = [summaryAr, ...actionsAr, ...caveatsAr].join(' \n ');
  if (!numbersAreAllowed(fullText, allowedNumbers)) {
    return { valid: false, reason: 'hallucinated_number' };
  }

  return {
    valid: true,
    data: {
      summaryAr: summaryAr.trim(),
      actionsAr: actionsAr.map((a) => a.trim()),
      caveatsAr: caveatsAr.map((c) => c.trim()),
      confidence,
      citedMetricKeys,
    },
  };
}

/**
 * Deterministic, non-AI fallback used whenever OpenAI is unavailable, times
 * out, or returns a response that fails validation. Built only from the
 * snapshot numbers, using simple fixed Arabic phrasing.
 */
export function buildFallbackRecommendation(snapshot) {
  const actions = [];

  if (Number.isFinite(snapshot.priceFloor) && Number.isFinite(snapshot.priceCeiling)) {
    actions.push(
      `يوصى بضبط السعر ضمن نطاق ${snapshot.priceFloor} - ${snapshot.priceCeiling} ${snapshot.currency} لليلة بناءً على سعر التعادل الحالي.`
    );
  }
  if (Number.isFinite(snapshot.occupancyRate)) {
    const occPct = Math.round(snapshot.occupancyRate * 100);
    if (snapshot.occupancyRate < 0.5) {
      actions.push(`نسبة الإشغال الحالية ${occPct}% منخفضة نسبياً، قد يساعد خفض السعر تدريجياً على زيادة الحجوزات.`);
    } else if (snapshot.occupancyRate > 0.8) {
      actions.push(`نسبة الإشغال الحالية ${occPct}% مرتفعة، يمكن اختبار زيادة السعر تدريجياً دون التأثير الكبير على الطلب.`);
    } else {
      actions.push(`نسبة الإشغال الحالية ${occPct}% ضمن نطاق معتدل، راقب الأداء قبل تعديل السعر.`);
    }
  }
  if (Number.isFinite(snapshot.bookingPace)) {
    const paceLabel = snapshot.bookingPace >= 1 ? 'أعلى من' : 'أقل من';
    actions.push(`وتيرة الحجز الحالية ${paceLabel} نفس الفترة من الموسم السابق.`);
  }
  if (actions.length === 0) {
    actions.push('البيانات المتوفرة غير كافية لتوليد توصية دقيقة، يرجى تحديث بيانات العقار.');
  }

  const caveats = ['هذه توصية أساسية مبنية على حسابات ثابتة فقط دون تحليل ذكاء اصطناعي، لأن خدمة الذكاء الاصطناعي لم تكن متاحة.'];
  if (snapshot.dataQualityFlags?.length > 0) {
    caveats.push('تفتقر هذه التوصية إلى بعض البيانات (مثل بيانات السوق أو وتيرة الحجز)، يرجى مراجعتها يدوياً.');
  }

  const confidence = snapshot.dataQualityScore >= 70 ? 'medium' : 'low';

  return {
    summaryAr: 'توصية تسعير أساسية مبنية على الحسابات الثابتة لعقارك دون تدخل الذكاء الاصطناعي.',
    actionsAr: actions,
    caveatsAr: caveats,
    confidence,
    citedMetricKeys: snapshot.evidence.map((e) => e.key),
  };
}
