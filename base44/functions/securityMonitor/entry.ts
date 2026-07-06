// Deno backend function: Madar security monitoring (manual admin-triggered).
//
// Access model: EVERY action requires an authenticated user whose role is
// 'admin' — checked server-side here (the frontend AdminRoute is UX-only and
// must never be trusted). No unauthenticated path, no subscriber/public path.
// Reads/writes run through asServiceRole, which resolves as admin for RLS —
// the same proven pattern admin-operations uses to write AuditLog under an
// admin-only create policy (so SecurityAlert uses create: { role: admin }).
//
// Actions:
//   scan             — page AiUsageLog + AuditLog to the 24h cutoff, run
//                      detections, persist deduped alerts. Reports scanCoverage
//                      so a truncated (capped) scan is never mistaken for a
//                      complete one.
//   list_alerts      — return admin-list-safe SUMMARIES only (never the raw
//                      subject_user_id or actor fields). The browser never
//                      reads SecurityAlert directly.
//   transition_alert — re-read the alert's CURRENT status server-side, then
//                      apply a forward-only transition. Backend is the single
//                      source of truth, so two racing admins can't revert a
//                      resolved alert on stale client state.
//
// Privacy: logs are normalized to PII-free { userId, status, at }; no user
// emails/tokens/IPs/headers are read or stored. Alerts carry a masked
// subject_ref; the raw subject_user_id stays server-side / admin-only.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  runDetections,
  dedupeCandidates,
  isDuplicate,
  buildAlertPayload,
  scanErrorResponse,
  pageCompletesWindow,
  toAlertSummary,
  applyStatusTransition,
  maskUserRef,
} from "./securityMonitoring.js";

const WINDOW_24H_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 1000;
const MAX_PAGES = 10; // safety cap: at most 10k rows/source per scan

// Read a required source, tagging any failure with its source name so the scan
// can surface WHICH entity could not be read (instead of silently returning an
// empty array and a false "successful" scan).
async function readSource(source, promise) {
  try {
    return await promise;
  } catch (err) {
    const tagged = new Error(String(err?.message || err));
    tagged.source = source;
    throw tagged;
  }
}

// Page a time-sorted entity (newest first) back to the window cutoff, bounded
// by MAX_PAGES. Returns { rows, complete } — complete:false means the cap was
// hit before reaching the cutoff (the window is only partially covered).
async function fetchWindow(source, entity, sortField, atOf, now, windowMs, fields) {
  const rows = [];
  let skip = 0;
  let complete = false;
  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await readSource(source, entity.list(sortField, PAGE_SIZE, skip, fields));
    const list = batch || [];
    rows.push(...list);
    const oldestAt = list.length ? atOf(list[list.length - 1]) : null;
    if (pageCompletesWindow(list.length, PAGE_SIZE, oldestAt, now, windowMs)) {
      complete = true;
      break;
    }
    skip += PAGE_SIZE;
  }
  return { rows, complete };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    // Canonical server-side admin gate — the only way to reach any action.
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "scan";
    const sr = base44.asServiceRole;

    // ── Admin-list-safe alert listing (browser never touches the entity). ──
    if (action === "list_alerts") {
      let rows;
      try {
        rows = await readSource("SecurityAlert", sr.entities.SecurityAlert.list("-detected_at", 300));
      } catch (failure) {
        return Response.json(scanErrorResponse(failure?.source, failure), { status: 500 });
      }
      return Response.json({ success: true, alerts: (rows || []).map(toAlertSummary) });
    }

    // ── Forward-only status transition, validated against FRESH state. ──
    if (action === "transition_alert") {
      const { id, to } = body;
      if (!id || !to) return Response.json({ error: "id and to are required" }, { status: 400 });

      let current;
      try {
        current = await readSource("SecurityAlert", sr.entities.SecurityAlert.get(id));
      } catch (failure) {
        return Response.json(scanErrorResponse(failure?.source, failure), { status: 500 });
      }
      if (!current) return Response.json({ error: "Alert not found" }, { status: 404 });

      const fromStatus = current.status;
      const patch = applyStatusTransition(current, to, { now: new Date(), adminRef: maskUserRef(user.id) });
      if (!patch) {
        // Stale/backward transition — reject against the current server state.
        return Response.json(
          { error: "Invalid transition", from: fromStatus, to },
          { status: 409 }
        );
      }
      // Atomic compare-and-set: the update is scoped to { id, status: fromStatus },
      // so it applies ONLY if the status is still what we just read. If a
      // concurrent admin already transitioned it, zero rows match and we reject
      // with 409 instead of clobbering their forward transition. The id in the
      // query uniquely scopes it — at most one row can ever match.
      const result = await sr.entities.SecurityAlert.updateMany({ id, status: fromStatus }, patch);
      const changed = Number(result?.updated ?? 0);
      if (!changed) {
        return Response.json(
          { error: "Alert changed concurrently", from: fromStatus, to },
          { status: 409 }
        );
      }
      return Response.json({ success: true, alert: toAlertSummary({ ...current, ...patch }) });
    }

    if (action !== "scan") {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    // ── Scan: page each source to the 24h cutoff, then run detections. ──
    const now = new Date();
    let ai, audit, existingAlerts;
    try {
      [ai, audit, existingAlerts] = await Promise.all([
        // Field projections: fetch ONLY what the detectors need, so sensitive
        // columns (AuditLog.ipAddress/details, AiUsageLog.detail, etc.) never
        // enter this function or its payload.
        fetchWindow("AiUsageLog", sr.entities.AiUsageLog, "-createdAt", (l) => l.createdAt || l.created_date, now, WINDOW_24H_MS, ["userId", "status", "createdAt", "created_date"]),
        fetchWindow("AuditLog", sr.entities.AuditLog, "-timestamp", (l) => l.timestamp || l.created_date, now, WINDOW_24H_MS, ["adminId", "timestamp", "created_date"]),
        readSource("SecurityAlert", sr.entities.SecurityAlert.list("-detected_at", 500)),
      ]);
    } catch (failure) {
      return Response.json(scanErrorResponse(failure?.source, failure), { status: 500 });
    }

    const aiEvents = (ai.rows || []).map((l) => ({ userId: l.userId, status: l.status, at: l.createdAt || l.created_date }));
    const auditEvents = (audit.rows || []).map((l) => ({ userId: l.adminId, at: l.timestamp || l.created_date }));

    const candidates = dedupeCandidates(runDetections({ aiEvents, auditEvents }, now));

    const created = [];
    for (const candidate of candidates) {
      if (isDuplicate(existingAlerts, candidate, now)) continue;
      try {
        const alert = await sr.entities.SecurityAlert.create(buildAlertPayload(candidate, { now }));
        created.push(alert);
      } catch (err) {
        return Response.json(
          { error: "Failed to persist SecurityAlert", detail: String(err?.message || err) },
          { status: 500 }
        );
      }
    }

    return Response.json({
      success: true,
      scanned: { aiUsageLogs: (ai.rows || []).length, auditLogs: (audit.rows || []).length },
      // complete:false ⇒ MAX_PAGES cap hit before the 24h cutoff — the window
      // is only partially covered and some in-window rows may be unscanned.
      scanCoverage: {
        aiUsageLogs: { complete: ai.complete },
        auditLogs: { complete: audit.complete },
        complete: ai.complete && audit.complete,
      },
      candidates: candidates.length,
      alertsCreated: created.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
