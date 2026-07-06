// Deno backend function: Madar security monitoring (manual admin-triggered scan).
//
// Access model: EVERY request requires an authenticated user whose role is
// 'admin' — checked server-side here (the frontend AdminRoute is UX-only and
// must never be trusted). There is no unauthenticated scan and no
// subscriber/public path. Reads/writes run through asServiceRole, which
// resolves as admin for RLS — the same proven pattern admin-operations uses to
// write AuditLog under an admin-only create policy (so SecurityAlert uses
// create: { role: admin }, NOT the snapshot's create: { role: system }).
//
// Privacy: we normalize logs to { userId, status, at } and never fetch user
// emails or store IPs/tokens/headers. Alerts carry a masked subject reference;
// the raw subject_user_id is admin-only for investigation.
//
// Detections implemented (backed by current-main schema): rapid_ai_usage,
// repeated_ai_failures, ai_usage_concentration (AiUsageLog), and
// suspicious_admin_actions (AuditLog). Deferred: burst property creation
// (UserProperty has no explicit app-level creation-time field) and auth/login
// failure checks (no auth-attempt log entity exists in main).
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  runDetections,
  dedupeCandidates,
  isDuplicate,
  buildAlertPayload,
} from "./securityMonitoring.js";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    // Canonical server-side admin gate — the only way to reach any scan.
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "scan";
    const sr = base44.asServiceRole;

    if (action !== "scan") {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    const now = new Date();

    // Pull recent logs (service role) and normalize to PII-free events.
    const [aiLogs, auditLogs, existingAlerts] = await Promise.all([
      sr.entities.AiUsageLog.list("-createdAt", 1000).catch(() => []),
      sr.entities.AuditLog.list("-timestamp", 500).catch(() => []),
      sr.entities.SecurityAlert.list("-detected_at", 500).catch(() => []),
    ]);

    const aiEvents = (aiLogs || []).map((l) => ({
      userId: l.userId,
      status: l.status,
      at: l.createdAt || l.created_date,
    }));
    const auditEvents = (auditLogs || []).map((l) => ({
      userId: l.adminId,
      at: l.timestamp || l.created_date,
    }));

    const candidates = dedupeCandidates(runDetections({ aiEvents, auditEvents }, now));

    const created = [];
    for (const candidate of candidates) {
      if (isDuplicate(existingAlerts, candidate, now)) continue;
      try {
        const alert = await sr.entities.SecurityAlert.create(buildAlertPayload(candidate, { now }));
        created.push(alert);
      } catch (err) {
        // Surface a create failure loudly rather than silently — this is the
        // exact RLS/service-role risk flagged in the audit.
        return Response.json(
          { error: "Failed to persist SecurityAlert", detail: String(err?.message || err) },
          { status: 500 }
        );
      }
    }

    return Response.json({
      success: true,
      scanned: { aiUsageLogs: (aiLogs || []).length, auditLogs: (auditLogs || []).length },
      candidates: candidates.length,
      alertsCreated: created.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
