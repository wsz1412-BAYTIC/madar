// Deno backend function: the once-only First (Starting) Report.
//
// Rules enforced here, server-side:
//   • ONE report per account — regeneration returns the SAVED copy
//     (alreadyGenerated: true) unless an admin has reset it.
//   • The report covers ALL of the user's properties together, with 3
//     recommended actions TOTAL across the portfolio (never 3 per property).
//   • Revenue figures are net of platform fees (configurable via the
//     PLATFORM_FEES_JSON secret; bundled rates are labeled estimates).
//   • Reports are scoped to the owning user (RLS read own-or-admin).
// Every generate call is logged to AiUsageLog (this report is deterministic —
// no LLM tokens — but the audit trail stays uniform).
import { createClientFromRequest } from "npm:@base44/sdk";
import { buildFirstReport } from "./firstReport.js";
import { parseFeeOverrides, PLATFORM_FEES_CONFIG_KEY } from "./platformFees.js";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "get";
    const sr = base44.asServiceRole;
    const now = new Date();

    const activeReportFor = async (userId) => {
      const rows = await sr.entities.StarterReport.filter({ userId });
      return (rows || []).find((r) => !r.resetAt) || null;
    };

    if (action === "get") {
      const existing = await activeReportFor(user.id);
      return Response.json({ success: true, report: existing?.report ?? null, generatedAt: existing?.generatedAt ?? null });
    }

    if (action === "generate") {
      const existing = await activeReportFor(user.id);
      if (existing) {
        // Once-only: hand back the saved copy, never a fresh one.
        return Response.json({ success: true, report: existing.report, alreadyGenerated: true, generatedAt: existing.generatedAt });
      }

      const properties = await sr.entities.UserProperty.filter({ userId: user.id });
      const feeOverrides = parseFeeOverrides(Deno.env.get(PLATFORM_FEES_CONFIG_KEY));
      const report = buildFirstReport(properties || [], { feeOverrides, now });

      await sr.entities.StarterReport.create({
        userId: user.id,
        report,
        generatedAt: now.toISOString(),
        resetAt: null,
        resetByUserId: null,
      });

      const subs = await sr.entities.UserSubscription.filter({ userId: user.id });
      const plan = subs?.[0]?.planName || "free";
      try {
        await sr.entities.AiUsageLog.create({
          userId: user.id,
          functionName: "first-report",
          plan: String(plan).toLowerCase(),
          status: "success",
          model: null,
          promptTokens: null,
          completionTokens: null,
          detail: "deterministic_report",
          createdAt: now.toISOString(),
        });
      } catch (e) {
        console.error("AiUsageLog write failed", e?.message);
      }

      return Response.json({ success: true, report, alreadyGenerated: false, generatedAt: report.generatedAt });
    }

    if (action === "reset") {
      // Admin-only escape hatch: marks the active report as reset so the
      // account can generate a fresh one. Logged to AuditLog.
      if (user.role !== "admin") {
        return Response.json(
          { error: "صلاحيات المشرف مطلوبة", error_en: "Admin role required" },
          { status: 403 }
        );
      }
      const targetUserId = String(body.targetUserId || "");
      if (!targetUserId) {
        return Response.json(
          { error: "معرّف المستخدم مطلوب", error_en: "targetUserId is required" },
          { status: 400 }
        );
      }
      const existing = await activeReportFor(targetUserId);
      if (!existing) {
        return Response.json({ success: true, reset: false, note: "no active report" });
      }
      await sr.entities.StarterReport.update(existing.id, {
        resetAt: now.toISOString(),
        resetByUserId: user.id,
      });
      try {
        await sr.entities.AuditLog.create({
          adminId: user.id,
          adminRole: user.role,
          action: "first_report_reset",
          targetType: "StarterReport",
          targetId: existing.id,
          details: `reset first report for user ${targetUserId}`,
          timestamp: now.toISOString(),
        });
      } catch (e) {
        console.error("AuditLog write failed", e?.message);
      }
      return Response.json({ success: true, reset: true });
    }

    return Response.json(
      { error: "إجراء غير معروف", error_en: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("first-report error", error);
    return Response.json(
      { error: "حدث خطأ غير متوقع — حاول مرة أخرى.", error_en: "Unexpected error — please try again." },
      { status: 500 }
    );
  }
});
