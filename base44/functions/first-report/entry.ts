// Deno backend function: the once-only First (Starting) Report.
// ONE report per account. Covers ALL properties with 3 total actions.
// Revenue figures are net of platform fees. All dependencies inlined.
// Adapted to existing Base44 entity schemas (snake_case).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

// ── madarReport (inlined, adapted to UserProperty snake_case) ───────────────
const QUICK_REPORT_LIMIT = 3;

const DETECTORS = [
  {
    id: 'no_photos', weight: 90,
    test: (p) => !p.images || p.images.length === 0,
    issue: (names) => ({
      title: { en: 'Listings without photos', ar: 'إعلانات بدون صور' },
      fix: { en: `Add at least 5 bright photos to: ${names}.`, ar: `أضف 5 صور واضحة على الأقل إلى: ${names}.` },
      benefit: { en: 'Up to +40% more views and bookings.', ar: 'زيادة تصل إلى 40٪ في المشاهدات والحجوزات.' },
    }),
  },
  {
    id: 'not_linked', weight: 60,
    test: (p) => !p.property_url,
    issue: (names) => ({
      title: { en: 'Listings not linked to a platform', ar: 'إعلانات غير مرتبطة بمنصة' },
      fix: { en: `Add the live listing link for: ${names}.`, ar: `أضف رابط الإعلان المباشر لـ: ${names}.` },
      benefit: { en: 'Accurate tracking and better price recommendations.', ar: 'متابعة دقيقة وتوصيات أسعار أفضل.' },
    }),
  },
  {
    id: 'no_price', weight: 70,
    test: (p) => !(Number(p.price) > 0),
    issue: (names) => ({
      title: { en: 'Missing nightly price', ar: 'سعر الليلة غير محدد' },
      fix: { en: `Set a nightly price for: ${names}.`, ar: `حدد سعر الليلة لـ: ${names}.` },
      benefit: { en: 'Enables market comparison and revenue tracking.', ar: 'يتيح مقارنة السوق وتتبع الإيرادات.' },
    }),
  },
  {
    id: 'paused', weight: 50,
    test: (p) => p.is_active === false,
    issue: (names) => ({
      title: { en: 'Paused listings', ar: 'إعلانات متوقفة' },
      fix: { en: `${names} is paused.`, ar: `${names} متوقف.` },
      benefit: { en: 'Recover revenue you are currently losing.', ar: 'استرداد إيراد تخسره حاليًا.' },
    }),
  },
  {
    id: 'no_amenities', weight: 40,
    test: (p) => !p.amenities || p.amenities.length === 0,
    issue: (names) => ({
      title: { en: 'No amenities listed', ar: 'لا توجد مرافق مذكورة' },
      fix: { en: `List amenities for: ${names}.`, ar: `أضف المرافق لـ: ${names}.` },
      benefit: { en: 'Appear in more guest searches.', ar: 'الظهور في نتائج بحث أكثر.' },
    }),
  },
  {
    id: 'no_properties', weight: 100, global: true,
    test: (all) => all.length === 0,
    issue: () => ({
      title: { en: 'No properties added yet', ar: 'لم تتم إضافة عقارات بعد' },
      fix: { en: 'Add your first property so Madar can start analyzing it.', ar: 'أضف عقارك الأول ليبدأ مدار في تحليله.' },
      benefit: { en: 'Everything else starts here.', ar: 'كل شيء يبدأ من هنا.' },
    }),
  },
];

const displayName = (p) => p.property_name || 'property';

function buildQuickReport(properties, { fullAccess = false } = {}) {
  const list = Array.isArray(properties) ? properties : [];
  const found = [];
  for (const det of DETECTORS) {
    if (det.global) {
      if (det.test(list)) found.push({ id: det.id, weight: det.weight, ...det.issue() });
      continue;
    }
    const hits = list.filter((p) => det.test(p));
    if (hits.length > 0) {
      const names = hits.slice(0, 3).map(displayName).join(', ') + (hits.length > 3 ? '…' : '');
      found.push({ id: det.id, weight: det.weight, count: hits.length, ...det.issue(names) });
    }
  }
  found.sort((a, b) => b.weight - a.weight);
  const issues = fullAccess ? found : found.slice(0, QUICK_REPORT_LIMIT);
  const lockedCount = fullAccess ? 0 : Math.max(0, found.length - QUICK_REPORT_LIMIT);
  return { issues, totalIssues: found.length, lockedCount, fullAccess };
}

// ── firstReport (inlined) ───────────────────────────────────────────────────
const FIRST_REPORT_ACTION_LIMIT = 3;

const ISSUE_UPLIFT = {
  no_photos: [0.05, 0.20], low_occupancy: [0.05, 0.15], no_price: [0.02, 0.10],
  paused: [0.05, 0.25], not_linked: [0.01, 0.05], no_amenities: [0.01, 0.05], no_properties: [0, 0],
};

function buildFirstReport(properties, { feeOverrides = {}, now = new Date() } = {}) {
  const list = Array.isArray(properties) ? properties : [];
  const quick = buildQuickReport(list, { fullAccess: false });
  const actions = quick.issues.slice(0, FIRST_REPORT_ACTION_LIMIT).map((issue) => ({
    id: issue.id, title: issue.title, fix: issue.fix, benefit: issue.benefit,
  }));

  const byPlatform = new Map();
  let grossMonthly = 0;
  for (const p of list) {
    const nightly = Number.isFinite(p.price) ? p.price : 0;
    const gross = nightly * 30;
    grossMonthly += gross;
    const platform = p.platform || 'Other';
    byPlatform.set(platform, (byPlatform.get(platform) || 0) + gross);
  }
  const feeBreakdown = [...byPlatform.entries()].map(([platform, gross]) => {
    const net = netRevenueAfterFees(gross, platform, feeOverrides);
    return {
      platform, rate: net?.feeRate ?? 0, estimated: net?.estimated ?? true,
      gross: round2(gross), fee: net?.feeAmount ?? 0, net: net?.net ?? round2(gross),
    };
  });
  const netMonthlyAfterFees = round2(feeBreakdown.reduce((sum, row) => sum + row.net, 0));

  let pctMin = 0, pctMax = 0;
  for (const action of actions) {
    const [lo, hi] = ISSUE_UPLIFT[action.id] || [0.01, 0.05];
    pctMin += lo; pctMax += hi;
  }
  pctMin = Math.min(pctMin, 0.3); pctMax = Math.min(pctMax, 0.5);
  const upliftEstimate = {
    sarMin: round2(grossMonthly * pctMin), sarMax: round2(grossMonthly * pctMax),
    percentMin: round2(pctMin * 100), percentMax: round2(pctMax * 100),
    note: {
      en: 'Estimated range based on typical outcomes — not a guarantee.',
      ar: 'نطاق تقديري مبني على نتائج معتادة — وليس ضمانًا.',
    },
  };

  return {
    version: 1,
    summary: {
      en: `Your starting report: ${list.length} propert${list.length === 1 ? 'y' : 'ies'}, ${actions.length} priority action${actions.length === 1 ? '' : 's'} for the whole portfolio.`,
      ar: `تقريرك التأسيسي: ${list.length} عقار، و${actions.length} إجراءات ذات أولوية للمحفظة كاملة.`,
    },
    actions,
    portfolio: { propertiesCount: list.length, grossMonthly: round2(grossMonthly), netMonthlyAfterFees, feeBreakdown, upliftEstimate },
    generatedAt: now.toISOString(),
  };
}

// ── Main handler ────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'get';
    const sr = base44.asServiceRole;
    const now = new Date();

    const activeReportFor = async (userId) => {
      const rows = await sr.entities.StarterReport.filter({ userId });
      return (rows || []).find((r) => !r.resetAt) || null;
    };

    if (action === 'get') {
      const existing = await activeReportFor(user.id);
      return Response.json({ success: true, report: existing?.report ?? null, generatedAt: existing?.generatedAt ?? null });
    }

    if (action === 'generate') {
      const existing = await activeReportFor(user.id);
      if (existing) {
        return Response.json({ success: true, report: existing.report, alreadyGenerated: true, generatedAt: existing.generatedAt });
      }

      // UserProperty uses created_by_id for ownership
      const properties = await sr.entities.UserProperty.filter({ created_by_id: user.id });
      const feeOverrides = parseFeeOverrides(Deno.env.get('PLATFORM_FEES_JSON'));
      const report = buildFirstReport(properties || [], { feeOverrides, now });

      await sr.entities.StarterReport.create({
        userId: user.id, report, generatedAt: now.toISOString(), resetAt: null, resetByUserId: null,
      });

      const subs = await sr.entities.UserSubscription.filter({ owner_id: user.id });
      const plan = subs?.[0]?.plan || 'free';
      try {
        await sr.entities.AiUsageLog.create({
          userId: user.id, functionName: 'first-report', plan: String(plan).toLowerCase(),
          status: 'success', model: null, promptTokens: null, completionTokens: null,
          detail: 'deterministic_report', createdAt: now.toISOString(),
        });
      } catch (e) { console.error('AiUsageLog write failed', e?.message); }

      return Response.json({ success: true, report, alreadyGenerated: false, generatedAt: report.generatedAt });
    }

    if (action === 'reset') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'صلاحيات المشرف مطلوبة', error_en: 'Admin role required' }, { status: 403 });
      }
      const targetUserId = String(body.targetUserId || '');
      if (!targetUserId) {
        return Response.json({ error: 'معرّف المستخدم مطلوب', error_en: 'targetUserId is required' }, { status: 400 });
      }
      const existing = await activeReportFor(targetUserId);
      if (!existing) return Response.json({ success: true, reset: false, note: 'no active report' });
      await sr.entities.StarterReport.update(existing.id, { resetAt: now.toISOString(), resetByUserId: user.id });
      try {
        await sr.entities.AuditLog.create({
          acting_user_id: user.id, acting_user_email: user.email || '',
          target_record_id: existing.id, target_entity: 'StarterReport',
          action: 'admin_data_modification',
          new_value: { resetAt: now.toISOString(), resetByUserId: user.id },
          notes: `reset first report for user ${targetUserId}`,
        });
      } catch (e) { console.error('AuditLog write failed', e?.message); }
      return Response.json({ success: true, reset: true });
    }

    return Response.json({ error: 'إجراء غير معروف', error_en: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('first-report error', error);
    return Response.json(
      { error: 'حدث خطأ غير متوقع — حاول مرة أخرى.', error_en: 'Unexpected error — please try again.' },
      { status: 500 }
    );
  }
});