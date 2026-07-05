// Madar First (Starting) Report — generated ONCE per account, covering ALL
// of the user's properties together, with exactly 3 recommended actions
// TOTAL across the whole portfolio (never 3 per property), plus portfolio
// revenue after platform fees and a clearly-labeled uplift ESTIMATE.
//
// Pure module: composition over buildQuickReport (issue detection/ranking)
// and platformFees (fee-only net revenue). Persistence + once-only dedupe
// live in the first-report backend function. Mirrored into
// base44/functions/first-report/ (see functionMirrors.test.js).

import { buildQuickReport } from './madarReport.js';
import { netRevenueAfterFees } from './platformFees.js';

export const FIRST_REPORT_ACTION_LIMIT = 3;

// Conservative per-issue uplift ranges (fractions of current gross revenue).
// These drive the portfolio uplift ESTIMATE — they are heuristics, not
// promises, and the report says so explicitly.
const ISSUE_UPLIFT = {
  no_photos: [0.05, 0.20],
  low_occupancy: [0.05, 0.15],
  no_price: [0.02, 0.10],
  paused: [0.05, 0.25],
  not_linked: [0.01, 0.05],
  no_amenities: [0.01, 0.05],
  no_properties: [0, 0],
};

const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

/**
 * Build the once-only first report across ALL properties.
 * @param properties  the user's UserProperty rows
 * @param opts.feeOverrides  parsed PLATFORM_FEES_JSON overrides
 * @param opts.now  Date for the generatedAt stamp
 */
export function buildFirstReport(properties, { feeOverrides = {}, now = new Date() } = {}) {
  const list = Array.isArray(properties) ? properties : [];

  // 3 actions TOTAL across the portfolio — buildQuickReport already ranks
  // portfolio-wide issues by weight; take its top 3 regardless of plan.
  const quick = buildQuickReport(list, { fullAccess: false });
  const actions = quick.issues.slice(0, FIRST_REPORT_ACTION_LIMIT).map((issue) => ({
    id: issue.id,
    title: issue.title,
    fix: issue.fix,
    benefit: issue.benefit,
  }));

  // Portfolio revenue, per platform, after platform fees ONLY.
  const byPlatform = new Map();
  let grossMonthly = 0;
  for (const p of list) {
    const gross = Number.isFinite(p.monthlyRevenue) ? p.monthlyRevenue : 0;
    grossMonthly += gross;
    const platform = p.platform || 'Other';
    byPlatform.set(platform, (byPlatform.get(platform) || 0) + gross);
  }
  const feeBreakdown = [...byPlatform.entries()].map(([platform, gross]) => {
    const net = netRevenueAfterFees(gross, platform, feeOverrides);
    return {
      platform,
      rate: net?.feeRate ?? 0,
      estimated: net?.estimated ?? true,
      gross: round2(gross),
      fee: net?.feeAmount ?? 0,
      net: net?.net ?? round2(gross),
    };
  });
  const netMonthlyAfterFees = round2(feeBreakdown.reduce((sum, row) => sum + row.net, 0));

  // Uplift ESTIMATE: sum the ranges of the top-3 issues over current gross.
  let pctMin = 0;
  let pctMax = 0;
  for (const action of actions) {
    const [lo, hi] = ISSUE_UPLIFT[action.id] || [0.01, 0.05];
    pctMin += lo;
    pctMax += hi;
  }
  pctMin = Math.min(pctMin, 0.3);
  pctMax = Math.min(pctMax, 0.5);
  const upliftEstimate = {
    sarMin: round2(grossMonthly * pctMin),
    sarMax: round2(grossMonthly * pctMax),
    percentMin: round2(pctMin * 100),
    percentMax: round2(pctMax * 100),
    note: {
      en: 'Estimated range based on typical outcomes for these fixes — not a guarantee of bookings or revenue.',
      ar: 'نطاق تقديري مبني على نتائج معتادة لهذه الإصلاحات — وليس ضمانًا للحجوزات أو الإيراد.',
    },
  };

  return {
    version: 1,
    summary: {
      en: `Your starting report: ${list.length} propert${list.length === 1 ? 'y' : 'ies'}, ${actions.length} priority action${actions.length === 1 ? '' : 's'} for the whole portfolio.`,
      ar: `تقريرك التأسيسي: ${list.length} عقار، و${actions.length} إجراءات ذات أولوية للمحفظة كاملة.`,
    },
    actions,
    portfolio: {
      propertiesCount: list.length,
      grossMonthly: round2(grossMonthly),
      netMonthlyAfterFees,
      feeBreakdown,
      upliftEstimate,
    },
    generatedAt: now.toISOString(),
  };
}
