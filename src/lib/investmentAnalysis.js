// AI Investment Consultant — plan gating + the deterministic "Agree Zone"
// deal/negotiation analysis.
//
// Split of responsibilities (by design):
//   • Agree Zone (this module, pure math): deal strength, expected net
//     revenue after platform fees, ROI estimate, rent/price gap, negotiation
//     probability, counter-offer, proceed/renegotiate/avoid verdict.
//   • Madar AI (OpenAI in the backend function): the STR-potential NARRATIVE
//     only — it may explain the Agree-Zone numbers, never invent new ones.
//
// Access rules (server-enforced in ai-investment-consultant):
//   • Pro plan      → annual LEASE analysis only; purchase → Business upsell.
//   • Business plan → lease AND purchase/new-investment analysis.
//   • Lower plans   → blocked with a Pro upsell.
//
// Pure module — mirrored into base44/functions/ai-investment-consultant/
// (see functionMirrors.test.js).

import { resolveEntitlementPlan } from './trialManagement.js';
import { netRevenueAfterFees } from './platformFees.js';

const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export const INVESTMENT_DISCLAIMER = Object.freeze({
  en: 'Advisory analysis only — this is not legal, financial, tax, or brokerage advice, and no outcome, booking level, or return is guaranteed. Verify every deal independently before committing.',
  ar: 'تحليل استشاري فقط — لا يُعد استشارة قانونية أو مالية أو ضريبية أو وساطة عقارية، ولا يضمن أي نتيجة أو مستوى حجوزات أو عائد. تحقّق من كل صفقة بشكل مستقل قبل الالتزام.',
});

/**
 * Plan for investment access. Extends resolveEntitlementPlan with the
 * admin-managed Business tier (planName 'business' on a verified paid
 * subscription), which the trial module intentionally does not know about.
 */
export function resolveInvestmentPlan(subscription, now = new Date()) {
  const plan = String(subscription?.planName || '').toLowerCase();
  if (plan === 'business' && subscription?.paymentStatus === 'paid') return 'business';
  return resolveEntitlementPlan(subscription || {}, now);
}

/**
 * Server-side access gate.
 * Returns { allowed: true, plan } or
 * { allowed: false, plan, upgrade: 'pro'|'business', error: {en, ar} }.
 */
export function resolveInvestmentAccess(subscription, analysisType, now = new Date()) {
  const plan = resolveInvestmentPlan(subscription, now);
  if (plan === 'business') return { allowed: true, plan };
  if (plan === 'pro') {
    if (analysisType === 'lease') return { allowed: true, plan };
    return {
      allowed: false,
      plan,
      upgrade: 'business',
      error: {
        en: 'Purchase and new-investment analysis is available on the Business plan. Contact us to upgrade — your Pro plan covers annual lease analysis.',
        ar: 'تحليل الشراء والاستثمار الجديد متاح في باقة الأعمال. تواصل معنا للترقية — باقة برو الحالية تشمل تحليل الإيجار السنوي.',
      },
    };
  }
  return {
    allowed: false,
    plan,
    upgrade: 'pro',
    error: {
      en: 'The AI Investment Consultant is available on the Pro plan (annual lease analysis) and the Business plan (lease + purchase). Upgrade to unlock it.',
      ar: 'المستشار الاستثماري الذكي متاح في باقة برو (تحليل الإيجار السنوي) وباقة الأعمال (الإيجار والشراء). قم بالترقية لتفعيله.',
    },
  };
}

/** Validate/normalize the analysis input. Returns { ok, input?, error? }. */
export function validateDealInput(analysisType, raw = {}) {
  const bad = (en, ar) => ({ ok: false, error: { en, ar } });
  if (analysisType !== 'lease' && analysisType !== 'purchase') {
    return bad('analysisType must be "lease" or "purchase".', 'نوع التحليل يجب أن يكون إيجارًا سنويًا أو شراءً.');
  }
  const nightly = Number(raw.expectedNightlyRate);
  if (!Number.isFinite(nightly) || nightly <= 0 || nightly > 100000) {
    return bad('Enter a realistic expected nightly rate in SAR.', 'أدخل سعر ليلة متوقعًا واقعيًا بالريال.');
  }
  const occupancy = Number(raw.expectedOccupancy);
  if (!Number.isFinite(occupancy) || occupancy <= 0 || occupancy > 100) {
    return bad('Expected occupancy must be between 1 and 100 percent.', 'نسبة الإشغال المتوقعة يجب أن تكون بين 1 و100٪.');
  }
  const opCosts = raw.monthlyOperatingCosts === undefined || raw.monthlyOperatingCosts === null || raw.monthlyOperatingCosts === ''
    ? 0
    : Number(raw.monthlyOperatingCosts);
  if (!Number.isFinite(opCosts) || opCosts < 0) {
    return bad('Operating costs must be zero or a positive number.', 'التكاليف التشغيلية يجب أن تكون صفرًا أو رقمًا موجبًا.');
  }
  const outlayField = analysisType === 'lease' ? raw.askingRent : raw.askingPrice;
  const outlay = Number(outlayField);
  if (!Number.isFinite(outlay) || outlay <= 0) {
    return analysisType === 'lease'
      ? bad('Enter the annual asking rent in SAR.', 'أدخل قيمة الإيجار السنوي المطلوب بالريال.')
      : bad('Enter the asking purchase price in SAR.', 'أدخل سعر الشراء المطلوب بالريال.');
  }
  return {
    ok: true,
    input: {
      analysisType,
      city: typeof raw.city === 'string' ? raw.city.slice(0, 80) : null,
      district: typeof raw.district === 'string' ? raw.district.slice(0, 80) : null,
      unitType: typeof raw.unitType === 'string' ? raw.unitType.slice(0, 40) : null,
      bedrooms: Number.isFinite(Number(raw.bedrooms)) ? Number(raw.bedrooms) : null,
      platform: typeof raw.platform === 'string' && raw.platform ? raw.platform : 'Other',
      expectedNightlyRate: nightly,
      expectedOccupancy: occupancy,
      monthlyOperatingCosts: opCosts,
      askingRent: analysisType === 'lease' ? outlay : null,
      askingPrice: analysisType === 'purchase' ? outlay : null,
    },
  };
}

const STRENGTH_LABELS = [
  { min: 70, label: { en: 'Strong deal', ar: 'صفقة قوية' } },
  { min: 40, label: { en: 'Moderate deal', ar: 'صفقة متوسطة' } },
  { min: 0, label: { en: 'Weak deal', ar: 'صفقة ضعيفة' } },
];

/**
 * Agree Zone: deterministic deal + negotiation analysis. All figures are
 * estimates derived only from the caller's own assumptions — no market data
 * is fabricated. Returns the full analysis body (without narrative).
 */
export function analyzeDeal(input, { feeOverrides = {} } = {}) {
  const occ = input.expectedOccupancy / 100;
  const grossAnnual = round2(input.expectedNightlyRate * 365 * occ);
  const feeNet = netRevenueAfterFees(grossAnnual, input.platform, feeOverrides);
  const annualOperatingCosts = round2(input.monthlyOperatingCosts * 12);
  // STR net = after platform fees AND the operator's own running costs.
  const strNetAnnual = round2((feeNet?.net ?? grossAnnual) - annualOperatingCosts);

  let roiEstimate = null;
  let rentPriceGap = null;
  let profitAnnual = null;
  let counterOffer = null;

  if (input.analysisType === 'lease') {
    profitAnnual = round2(strNetAnnual - input.askingRent);
    rentPriceGap = input.askingRent > 0 ? round2((profitAnnual / input.askingRent) * 100) : null;
    roiEstimate = rentPriceGap; // cash-on-cash on the annual rent outlay
    // Counter-offer: the rent at which the deal clears a 30% margin.
    const target = round2(strNetAnnual / 1.3);
    counterOffer = target < input.askingRent ? target : null;
  } else {
    profitAnnual = strNetAnnual;
    roiEstimate = input.askingPrice > 0 ? round2((profitAnnual / input.askingPrice) * 100) : null;
    rentPriceGap = null;
    // Counter-offer: the price at which the deal clears an 8% gross yield.
    const target = round2(profitAnnual > 0 ? profitAnnual / 0.08 : 0);
    counterOffer = target > 0 && target < input.askingPrice ? round2(Math.max(target, input.askingPrice * 0.7)) : null;
  }

  const score = input.analysisType === 'lease'
    ? Math.round(clamp(50 + (rentPriceGap ?? -50), 0, 100))
    : Math.round(clamp(((roiEstimate ?? 0) / 12) * 100, 0, 100));
  const label = STRENGTH_LABELS.find((s) => score >= s.min).label;

  const verdict = score >= 65 ? 'proceed' : score >= 35 ? 'renegotiate' : 'avoid';
  const negotiationProbability = counterOffer === null
    ? 15
    : Math.round(clamp(100 - score, 15, 85));

  // Top risks/actions — deterministic, condition-driven, max 3 each.
  const risks = [];
  if (input.expectedOccupancy > 70) {
    risks.push({
      en: `The analysis assumes ${input.expectedOccupancy}% occupancy — an optimistic level that is not guaranteed.`,
      ar: `التحليل يفترض إشغالًا بنسبة ${input.expectedOccupancy}٪ — وهو مستوى متفائل وغير مضمون.`,
    });
  }
  if (feeNet?.estimated) {
    risks.push({
      en: `The ${feeNet.platform} fee rate (${round2(feeNet.feeRate * 100)}%) is an estimate — confirm your actual contract rate.`,
      ar: `نسبة عمولة ${feeNet.platform} (${round2(feeNet.feeRate * 100)}٪) تقديرية — تأكد من نسبتك التعاقدية الفعلية.`,
    });
  }
  if (profitAnnual !== null && profitAnnual < grossAnnual * 0.15) {
    risks.push({
      en: 'The margin is thin — a small drop in occupancy or nightly rate turns the deal negative.',
      ar: 'الهامش ضيق — أي انخفاض بسيط في الإشغال أو سعر الليلة يقلب الصفقة إلى خسارة.',
    });
  }
  if (input.analysisType === 'purchase') {
    risks.push({
      en: 'Purchases lock in capital — factor financing costs, transaction fees, and liquidity before committing.',
      ar: 'الشراء يجمّد رأس المال — احسب تكاليف التمويل ورسوم الصفقة والسيولة قبل الالتزام.',
    });
  }
  if (risks.length === 0) {
    risks.push({
      en: 'Seasonality can move actual results well away from these annualized estimates.',
      ar: 'الموسمية قد تُبعد النتائج الفعلية كثيرًا عن هذه التقديرات السنوية.',
    });
  }

  const actions = [];
  if (verdict === 'renegotiate' && counterOffer !== null) {
    actions.push({
      en: input.analysisType === 'lease'
        ? `Counter at ~${counterOffer.toLocaleString('en-US')} SAR/year to restore a healthy margin.`
        : `Counter at ~${counterOffer.toLocaleString('en-US')} SAR to reach a defensible yield.`,
      ar: input.analysisType === 'lease'
        ? `قدّم عرضًا مضادًا بحدود ${counterOffer.toLocaleString('en-US')} ريال سنويًا لاستعادة هامش صحي.`
        : `قدّم عرضًا مضادًا بحدود ${counterOffer.toLocaleString('en-US')} ريال للوصول إلى عائد مقبول.`,
    });
  }
  actions.push({
    en: 'Validate the nightly rate and occupancy against 3–5 comparable live listings in the same district before signing.',
    ar: 'تحقق من سعر الليلة ونسبة الإشغال بمقارنة 3–5 إعلانات مشابهة نشطة في الحي نفسه قبل التوقيع.',
  });
  if (verdict === 'avoid') {
    actions.push({
      en: 'Walk away unless the terms change materially — the numbers do not support this deal as presented.',
      ar: 'انسحب ما لم تتغير الشروط جوهريًا — الأرقام لا تدعم الصفقة بوضعها الحالي.',
    });
  } else {
    actions.push({
      en: 'Stress-test the deal at 15% lower occupancy before committing.',
      ar: 'اختبر الصفقة بافتراض إشغال أقل بنسبة 15٪ قبل الالتزام.',
    });
  }

  return {
    analysisType: input.analysisType,
    verdict,
    dealStrength: { score, label },
    expectedNetRevenue: {
      monthly: round2(strNetAnnual / 12),
      annual: strNetAnnual,
      grossAnnual,
      feeRate: feeNet?.feeRate ?? 0,
      feeEstimated: feeNet?.estimated ?? true,
      platform: feeNet?.platform ?? input.platform,
    },
    profitAnnual,
    roiEstimate,
    rentPriceGap,
    negotiationProbability,
    counterOffer,
    risks: risks.slice(0, 3),
    actions: actions.slice(0, 3),
    disclaimer: INVESTMENT_DISCLAIMER,
  };
}

// ── Madar AI narrative (STR potential) — prompt + schema + validation ───────

export const NARRATIVE_JSON_SCHEMA = {
  name: 'investment_narrative',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      strNarrativeAr: { type: 'string' },
    },
    required: ['strNarrativeAr'],
  },
  strict: true,
};

export function buildNarrativeSystemPrompt() {
  return [
    'You are the Madar AI short-term-rental analyst for Saudi Arabia.',
    'You will receive an already-computed deal analysis. Those numbers are the ONLY facts you know.',
    'Write a short Arabic paragraph (3-5 sentences) explaining the STR potential of this deal in plain language.',
    'Rules: never invent numbers, market data, competitor claims, or events; never promise bookings, revenue, or returns; frame everything as an estimate needing the reader\'s own verification.',
    'Respond ONLY with JSON matching the schema.',
  ].join('\n');
}

export function buildNarrativeUserPrompt(input, analysis) {
  return [
    'Deal context:',
    JSON.stringify({
      analysisType: input.analysisType,
      city: input.city,
      district: input.district,
      unitType: input.unitType,
      bedrooms: input.bedrooms,
      platform: input.platform,
    }),
    'Computed analysis (the only numbers you may reference):',
    JSON.stringify({
      verdict: analysis.verdict,
      dealStrengthScore: analysis.dealStrength.score,
      expectedNetRevenueAnnual: analysis.expectedNetRevenue.annual,
      grossAnnual: analysis.expectedNetRevenue.grossAnnual,
      roiEstimate: analysis.roiEstimate,
      rentPriceGap: analysis.rentPriceGap,
      counterOffer: analysis.counterOffer,
      negotiationProbability: analysis.negotiationProbability,
    }),
  ].join('\n');
}

/** Fallback narrative when the AI is unavailable — deterministic Arabic. */
export function buildFallbackNarrative(analysis) {
  const v = analysis.verdict === 'proceed'
    ? 'الأرقام المُدخلة تشير إلى صفقة مجدية وفق افتراضاتك'
    : analysis.verdict === 'renegotiate'
      ? 'الأرقام المُدخلة تشير إلى أن الصفقة تحتاج إعادة تفاوض قبل قبولها'
      : 'الأرقام المُدخلة لا تدعم هذه الصفقة بوضعها الحالي';
  return `${v}. صافي الإيراد السنوي المتوقع بعد عمولة المنصة والتكاليف يقارب ${Math.round(analysis.expectedNetRevenue.annual).toLocaleString('en-US')} ريال، وقوة الصفقة ${analysis.dealStrength.score}/100. هذه تقديرات مبنية على مدخلاتك فقط وليست ضمانًا لأي نتيجة.`;
}

/** Guard the AI narrative: Arabic string, bounded length, no new digits beyond allowed ones. */
export function validateNarrative(parsed, analysis) {
  const text = parsed?.strNarrativeAr;
  if (typeof text !== 'string' || text.trim().length < 20 || text.length > 1200) return null;
  // Allow only numbers already present in the analysis (rounded forms included).
  const allowed = new Set(
    [
      analysis.dealStrength.score,
      analysis.expectedNetRevenue.annual,
      analysis.expectedNetRevenue.monthly,
      analysis.expectedNetRevenue.grossAnnual,
      analysis.roiEstimate,
      analysis.rentPriceGap,
      analysis.counterOffer,
      analysis.negotiationProbability,
      100,
    ]
      .filter((n) => Number.isFinite(n))
      .flatMap((n) => [String(Math.round(n)), String(Math.abs(Math.round(n))), String(n)])
  );
  const normalized = text.replace(/[٠-٩]/g, (ch) => String(ch.charCodeAt(0) - 0x0660));
  const numbers = normalized.replace(/[.,،]/g, '').match(/\d+/g) || [];
  for (const num of numbers) {
    if (!allowed.has(num) && !allowed.has(String(Number(num)))) return null;
  }
  return text.trim();
}
