// Deno backend function: Market Heatmap data, plan-gated and privacy-safe.
//
// Access is resolved HERE from the subscription row (never trusted from the
// client): Growth → own-portfolio heatmap; Pro → full anonymized market view
// with comparisons + type segmentation; Business → advanced (+ historical
// date-range + deeper segmentation). Lower plans get a 403 upsell.
//
// The market scope aggregates ALL UserProperty rows via the service role but
// returns ONLY averages/counts, and only for cells backed by at least
// MIN_MARKET_SAMPLE properties (k-anonymity) — no row-level data ever leaves
// this function, so no RLS rule is relaxed. The own scope is filtered to the
// caller's own userId.
import { createClientFromRequest } from "npm:@base44/sdk";
import { resolveHeatmapAccess, buildHeatmap } from "./marketHeatmap.js";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rawFilters = body.filters && typeof body.filters === "object" ? body.filters : {};
    const sr = base44.asServiceRole;
    const now = new Date();

    const subs = await sr.entities.UserSubscription.filter({ userId: user.id });
    const sub = subs && subs.length > 0 ? subs[0] : null;

    const access = resolveHeatmapAccess(sub || {}, now);
    if (!access.allowed) {
      return Response.json(
        { error: access.error.ar, error_en: access.error.en, upgrade: access.upgrade, plan: access.plan },
        { status: 403 }
      );
    }

    // Only honor tier-appropriate filters; strip anything the plan can't use.
    const filters = {
      city: typeof rawFilters.city === "string" ? rawFilters.city : "all",
      propertyType: typeof rawFilters.propertyType === "string" ? rawFilters.propertyType : "all",
      platform: typeof rawFilters.platform === "string" ? rawFilters.platform : "all",
      segmentByType: access.segmentation ? rawFilters.segmentByType === true : false,
      // Date range is a Business-only control (last-activity scoping).
      dateFrom: access.dateRange && rawFilters.dateFrom ? String(rawFilters.dateFrom) : null,
      dateTo: access.dateRange && rawFilters.dateTo ? String(rawFilters.dateTo) : null,
    };

    // Own scope → the caller's own rows; market scope → the whole (anonymized)
    // pool. Both fetched via the service role; the market pool never leaves as
    // rows — buildHeatmap emits aggregates only, k-anonymized downstream.
    const properties = access.scope === "market"
      ? await sr.entities.UserProperty.list()
      : await sr.entities.UserProperty.filter({ userId: user.id });

    const heatmap = buildHeatmap(properties || [], access, filters);

    return Response.json({
      ok: true,
      access: {
        plan: access.plan,
        tier: access.tier,
        scope: access.scope,
        comparisons: access.comparisons,
        segmentation: access.segmentation,
        historical: access.historical,
        dateRange: access.dateRange,
      },
      ...heatmap,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("market-heatmap error", error);
    return Response.json(
      { error: "تعذر تحميل بيانات الخريطة الحرارية — حاول مرة أخرى.", error_en: "Could not load heatmap data — please try again." },
      { status: 500 }
    );
  }
});
