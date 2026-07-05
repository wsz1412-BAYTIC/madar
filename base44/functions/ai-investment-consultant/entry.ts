// Deno backend function: AI Investment Consultant.
// Access is enforced HERE, server-side, from the subscription row.
//   - Pro plan      -> annual lease analysis only (purchase -> Business upsell)
//   - Business plan -> lease + purchase/new-investment analysis
//   - lower plans   -> blocked with a Pro upsell
//
// All dependencies inlined (Base44 functions deploy independently).
// Adapted to the existing UserSubscription entity schema (snake_case).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_TIMEOUT_MS = 15000;

// ── platformFees (inlined) ──────────────────────────────────────────────────
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

const DEFAULT_PLATFORM_FEES = Object.freeze({
  'Airbnb': 0.14,
  'Gathern': 0.125,
  'Booking.com': 0.15,
  'Other': 0.10,
});

const PLATFORM_MAP = {
  'airbnb': 'Airbnb',
  'booking': 'Booking.com',
  'gatherin': 'Gathern',
  'gathern': 'Gathern',
  'other': 'Other',
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
  } catch {
    return {};
  }
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
    platform: fee.platform,
    gross: round2(grossRevenue),
    feeRate: fee.rate,
    feeAmount,
    net: round2(grossRevenue - feeAmount),
    estimated: fee.estimated,
    source: fee.source,
  };
}

// ── trialManagement (inlined, adapted to snake_case entity) ─────────────────
const DAY_MS = 24 * 60 * 60 * 1000;

function isPaid(sub) {
  return Boolean(sub) && sub.payment_status === 'paid';
}

function assessTrialState(subscription, now = new Date()) {
  if (isPaid(subscription)) return { state: 'paid' };
  if (subscription?.trial_status === 'active') {
    const ends = new Date(subscription.trial_ends_at);
    if (ends > now) {
      return {
        state: 'trial_active',
        daysRemaining: Math.max(0, Math.ceil((ends.getTime() - now.getTime()) / DAY_MS)),
      };
    }
    return { state: 'trial_expired' };
  }
  if (subscription?.trial_status === 'expired') return { state: 'trial_expired' };
  return { state: 'free' };
}

function resolveEntitlementPlan(subscription, now = new Date()) {
  const { state } = assessTrialState(subscription, now);
  if (state === 'paid') {
    const plan = String(subscription.plan || 'free').toLowerCase();
    return plan === 'growth' || plan === 'pro' || plan === 'starter' || plan === 'basic' ? plan : 'free';
  }
  if (state === 'trial_active') return 'growth';
  return 'free';
}

// ── investmentAnalysis (inlined) ────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const INVESTMENT_DISCLAIMER = Object.freeze({
  en: 'Advisory analysis only — this is not legal, financial, tax, or brokerage advice, and no outcome, booking level, or return is guaranteed. Verify every deal independently before committing.',
  ar: 'تحليل استشاري فقط — لا يُعد استشارة قانونية أو مالية أو ضريبية أو وساطة عقارية، ولا يضمن أي نتيجة أو مستوى حجوزات أو عائد. تحقّق من كل صفقة بشكل مستقل قبل الالتزام.',
});

function resolveInvestmentPlan(subscription, now = new Date()) {
  const plan = String(subscription?.plan || '').toLowerCase();
  if (plan === 'business' && subscription?.payment_status === 'paid') return 'business';
  return resolveEntitlementPlan(subscription || {}, now);
}

function resolveInvestmentAccess(subscription, analysisType, now = new Date()) {
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

function validateDealInput(analysisType, raw = {}) {
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

function analyzeDeal(input, { feeOverrides = {} } = {}) {
  const occ = input.expectedOccupancy / 100;
  const grossAnnual = round2(input.expectedNightlyRate * 365 * occ);
  const feeNet = netRevenueAfterFees(grossAnnual, input.platform, feeOverrides);
  const annualOperatingCosts = round2(input.monthlyOperatingCosts * 12);
  const strNetAnnual = round2((feeNet?.net ?? grossAnnual) - annualOperatingCosts);

  let roiEstimate = null;
  let rentPriceGap = null;
  let profitAnnual = null;
  let counterOffer = null;

  if (input.analysisType === 'lease') {
    profitAnnual = round2(strNetAnnual - input.askingRent);
    rentPriceGap = input.askingRent > 0 ? round2((profitAnnual / input.askingRent) * 100) : null;
    roiEstimate = rentPriceGap;
    const target = round2(strNetAnnual / 1.3);
    counterOffer = target < input.askingRent ? target : null;
  } else {
    profitAnnual = strNetAnnual;
    roiEstimate = input.askingPrice > 0 ? round2((profitAnnual / input.askingPrice) * 100) : null;
    rentPriceGap = null;
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

// ── Narrative AI (inlined) ───────────────────────────────────────────────────
const NARRATIVE_JSON_SCHEMA = {
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

function buildNarrativeSystemPrompt() {
  return [
    'You are the Madar AI short-term-rental analyst for Saudi Arabia.',
    'You will receive an already-computed deal analysis. Those numbers are the ONLY facts you know.',
    'Write a short Arabic paragraph (3-5 sentences) explaining the STR potential of this deal in plain language.',
    'Rules: never invent numbers, market data, competitor claims, or events; never promise bookings, revenue, or returns; frame everything as an estimate needing the reader\'s own verification.',
    'Respond ONLY with JSON matching the schema.',
  ].join('\n');
}

function buildNarrativeUserPrompt(input, analysis) {
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

function buildFallbackNarrative(analysis) {
  const v = analysis.verdict === 'proceed'
    ? 'الأرقام المُدخلة تشير إلى صفقة مجدية وفق افتراضاتك'
    : analysis.verdict === 'renegotiate'
      ? 'الأرقام المُدخلة تشير إلى أن الصفقة تحتاج إعادة تفاوض قبل قبولها'
      : 'الأرقام المُدخلة لا تدعم هذه الصفقة بوضعها الحالي';
  return `${v}. صافي الإيراد السنوي المتوقع بعد عمولة المنصة والتكاليف يقارب ${Math.round(analysis.expectedNetRevenue.annual).toLocaleString('en-US')} ريال، وقوة الصفقة ${analysis.dealStrength.score}/100. هذه تقديرات مبنية على مدخلاتك فقط وليست ضمانًا لأي نتيجة.`;
}

function validateNarrative(parsed, analysis) {
  const text = parsed?.strNarrativeAr;
  if (typeof text !== 'string' || text.trim().length < 20 || text.length > 1200) return null;
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
  const normalized = text.replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660));
  const numbers = normalized.replace(/[.,\u060c]/g, '').match(/\d+/g) || [];
  for (const num of numbers) {
    if (!allowed.has(num) && !allowed.has(String(Number(num)))) return null;
  }
  return text.trim();
}

// ── Main handler ────────────────────────────────────────────────────────────
async function callNarrative(input, analysis, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.3,
        messages: [
          { role: 'system', content: buildNarrativeSystemPrompt() },
          { role: 'user', content: buildNarrativeUserPrompt(input, analysis) },
        ],
        response_format: { type: 'json_schema', json_schema: NARRATIVE_JSON_SCHEMA },
      }),
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, reason: `openai_http_${response.status}` };
    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return { ok: false, reason: 'openai_empty_response' };
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, reason: 'openai_invalid_json' };
    }
    const narrative = validateNarrative(parsed, analysis);
    if (!narrative) return { ok: false, reason: 'narrative_validation_failed' };
    return {
      ok: true,
      narrative,
      usage: {
        promptTokens: body?.usage?.prompt_tokens ?? null,
        completionTokens: body?.usage?.completion_tokens ?? null,
      },
    };
  } catch (error) {
    return { ok: false, reason: error?.name === 'AbortError' ? 'openai_timeout' : 'openai_network_error' };
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'analyze';
    const sr = base44.asServiceRole;
    const now = new Date();

    // UserSubscription uses owner_id + snake_case fields
    const subs = await sr.entities.UserSubscription.filter({ owner_id: user.id });
    const sub = subs && subs.length > 0 ? subs[0] : null;

    const logUsage = async (plan, status, detail, usage = {}) => {
      try {
        await sr.entities.AiUsageLog.create({
          userId: user.id,
          functionName: 'ai-investment-consultant',
          plan,
          status,
          model: status === 'success' ? OPENAI_MODEL : null,
          promptTokens: usage.promptTokens ?? null,
          completionTokens: usage.completionTokens ?? null,
          detail: detail || null,
          createdAt: now.toISOString(),
        });
      } catch (e) {
        console.error('AiUsageLog write failed', e?.message);
      }
    };

    if (action === 'list') {
      const rows = await sr.entities.InvestmentAnalysis.filter({ userId: user.id });
      return Response.json({ success: true, analyses: rows || [] });
    }

    if (action !== 'analyze') {
      return Response.json(
        { error: 'إجراء غير معروف', error_en: 'Unknown action' },
        { status: 400 }
      );
    }

    const analysisType = body.analysisType;
    const access = resolveInvestmentAccess(sub || {}, analysisType, now);
    if (!access.allowed) {
      await logUsage(access.plan, 'blocked', `plan_gate:${analysisType}`);
      return Response.json(
        { error: access.error.ar, error_en: access.error.en, upgrade: access.upgrade },
        { status: 403 }
      );
    }

    const validated = validateDealInput(analysisType, body.input || {});
    if (!validated.ok) {
      return Response.json(
        { error: validated.error.ar, error_en: validated.error.en },
        { status: 400 }
      );
    }

    const feeOverrides = parseFeeOverrides(Deno.env.get('PLATFORM_FEES_JSON'));
    const analysis = analyzeDeal(validated.input, { feeOverrides });

    const apiKey = Deno.env.get('OpenAI_API_KEY');
    let strNarrativeAr = null;
    let source = 'fallback';
    let usage = {};
    let fallbackReason = apiKey ? null : 'missing_api_key';
    if (apiKey) {
      const result = await callNarrative(validated.input, analysis, apiKey);
      if (result.ok) {
        strNarrativeAr = result.narrative;
        source = 'ai';
        usage = result.usage;
      } else {
        fallbackReason = result.reason;
      }
    }
    if (!strNarrativeAr) strNarrativeAr = buildFallbackNarrative(analysis);

    const record = await sr.entities.InvestmentAnalysis.create({
      userId: user.id,
      analysisType,
      input: validated.input,
      analysis: { ...analysis, strNarrativeAr, source, createdAt: now.toISOString() },
      source,
      plan: access.plan,
      createdAt: now.toISOString(),
    });

    await logUsage(access.plan, source === 'ai' ? 'success' : 'fallback', fallbackReason, usage);

    return Response.json({
      success: true,
      analysis: { ...analysis, strNarrativeAr, source, createdAt: now.toISOString(), id: record?.id ?? null },
    });
  } catch (error) {
    console.error('ai-investment-consultant error', error);
    return Response.json(
      { error: 'حدث خطأ غير متوقع — حاول مرة أخرى.', error_en: 'Unexpected error — please try again.' },
      { status: 500 }
    );
  }
});