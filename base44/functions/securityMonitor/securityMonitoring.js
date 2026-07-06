// PR D — Security monitoring logic (pure, unit-tested).
//
// Shared by the admin Security Alerts page (src/pages/AdminSecurityAlerts.jsx)
// and the securityMonitor backend function (byte-mirrored copy). No React, no
// SDK, no import.meta — so the mirror runs unmodified on Deno.
//
// Privacy stance (stricter than the madar2 snapshot): alerts store only a
// masked subject reference for display and, admin-only, the raw subject user
// id for investigation. We deliberately do NOT fetch or store user emails,
// tokens, IPs, request headers, or private notes. Detection consumes
// pre-normalized { userId, status, at } events, so this module never touches
// raw entity rows.
//
// SecurityAlert records are ADMIN-ONLY (RLS: create/read/update admin-only,
// delete disabled) and never exposed to subscribers or any public API.

export const ALERT_TYPES = [
  'rapid_ai_usage',
  'repeated_ai_failures',
  'ai_usage_concentration',
  'suspicious_admin_actions',
];
export const SEVERITIES = ['info', 'warning', 'critical'];
export const SEVERITY_RANK = { info: 0, warning: 1, critical: 2 };
export const ALERT_STATUSES = ['new', 'acknowledged', 'resolved'];

// AiUsageLog.status values that count as a failed/blocked attempt (madar schema
// enum is success / fallback / blocked / error — there is no "failed").
export const AI_FAILURE_STATUSES = ['error', 'blocked'];

export const DEFAULT_THRESHOLDS = {
  rapid_ai_usage: { window: '1h', windowMs: 60 * 60 * 1000, warnAt: 10, critAt: 25 },
  repeated_ai_failures: { window: '24h', windowMs: 24 * 60 * 60 * 1000, warnAt: 5, critAt: 15 },
  ai_usage_concentration: { window: '24h', windowMs: 24 * 60 * 60 * 1000, minTotal: 20, warnPct: 0.3, critPct: 0.5 },
  suspicious_admin_actions: { window: '5m', windowMs: 5 * 60 * 1000, warnAt: 8, critAt: 15 },
};

// Fields safe to surface in the admin list UI — deliberately excludes
// subject_user_id (raw id) and the *_by actor fields.
export const SUMMARY_FIELDS = [
  'id', 'alert_type', 'severity', 'status', 'title', 'summary',
  'subject_ref', 'detected_at', 'metadata',
];

export const AR_LABELS = {
  // alert types
  rapid_ai_usage: 'استخدام مكثف للذكاء الاصطناعي',
  repeated_ai_failures: 'محاولات فاشلة متكررة',
  ai_usage_concentration: 'تركّز غير طبيعي في الاستخدام',
  suspicious_admin_actions: 'نشاط إداري مريب',
  // severity
  info: 'معلومة', warning: 'تحذير', critical: 'حرج',
  // status
  new: 'جديد', acknowledged: 'تمت المراجعة', resolved: 'تمت المعالجة',
};

export function label(value) {
  return AR_LABELS[value] || value || '—';
}

const asTime = (at) => {
  const t = new Date(at).getTime();
  return Number.isNaN(t) ? null : t;
};

/** True when `at` falls within [now - windowMs, now]. */
export function withinWindow(at, now, windowMs) {
  const t = asTime(at);
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  return t !== null && t <= nowMs && t >= nowMs - windowMs;
}

/** Count events per userId (ignoring events with no userId). */
export function countByUser(events) {
  const counts = new Map();
  for (const e of Array.isArray(events) ? events : []) {
    const uid = e && e.userId;
    if (!uid) continue;
    counts.set(uid, (counts.get(uid) || 0) + 1);
  }
  return counts;
}

/** Step severity from a count: critical ≥ critAt, warning ≥ warnAt, else null. */
export function severityForCount(count, warnAt, critAt) {
  if (count >= critAt) return 'critical';
  if (count >= warnAt) return 'warning';
  return null;
}

/** Mask a user id for display — first 6 id chars only, never the full id or an
 *  email. If an email-shaped value slips in, everything from '@' on is dropped
 *  so no domain can leak. */
export function maskUserRef(userId) {
  if (!userId) return 'unknown';
  const s = String(userId).replace(/@.*/, '');
  if (!s) return 'unknown';
  return s.length <= 6 ? `user_${s}` : `user_${s.slice(0, 6)}`;
}

// ── Detections. Each takes normalized events and returns candidate alerts.
// Candidate shape: { alert_type, severity, subject_user_id, metadata }.

/** Rapid AI usage: a user with > warnAt AI calls inside the window. */
export function detectRapidAiUsage(aiEvents, now, cfg = DEFAULT_THRESHOLDS.rapid_ai_usage) {
  const recent = (aiEvents || []).filter((e) => withinWindow(e.at, now, cfg.windowMs));
  const out = [];
  for (const [uid, count] of countByUser(recent)) {
    const severity = severityForCount(count, cfg.warnAt, cfg.critAt);
    if (!severity) continue;
    out.push({
      alert_type: 'rapid_ai_usage',
      severity,
      subject_user_id: uid,
      metadata: { count, threshold: cfg.warnAt, window: cfg.window },
    });
  }
  return out;
}

/** Repeated AI failures: a user with ≥ warnAt error/blocked AI calls in window. */
export function detectRepeatedFailures(aiEvents, now, cfg = DEFAULT_THRESHOLDS.repeated_ai_failures) {
  const recent = (aiEvents || []).filter(
    (e) => withinWindow(e.at, now, cfg.windowMs) && AI_FAILURE_STATUSES.includes(e.status)
  );
  const out = [];
  for (const [uid, count] of countByUser(recent)) {
    const severity = severityForCount(count, cfg.warnAt, cfg.critAt);
    if (!severity) continue;
    out.push({
      alert_type: 'repeated_ai_failures',
      severity,
      subject_user_id: uid,
      metadata: { count, threshold: cfg.warnAt, window: cfg.window },
    });
  }
  return out;
}

/** Usage concentration: one user driving > warnPct of all AI calls in window
 *  (only when there is a meaningful total). */
export function detectUsageConcentration(aiEvents, now, cfg = DEFAULT_THRESHOLDS.ai_usage_concentration) {
  const recent = (aiEvents || []).filter((e) => withinWindow(e.at, now, cfg.windowMs));
  const total = recent.length;
  const out = [];
  if (total < cfg.minTotal) return out;
  for (const [uid, count] of countByUser(recent)) {
    const pct = count / total;
    if (pct <= cfg.warnPct) continue;
    out.push({
      alert_type: 'ai_usage_concentration',
      severity: pct >= cfg.critPct ? 'critical' : 'warning',
      subject_user_id: uid,
      metadata: { count, total, percent: Math.round(pct * 100), threshold: Math.round(cfg.warnPct * 100), window: cfg.window },
    });
  }
  return out;
}

/** Suspicious admin actions: an admin with ≥ warnAt actions in a short window. */
export function detectSuspiciousAdminActions(auditEvents, now, cfg = DEFAULT_THRESHOLDS.suspicious_admin_actions) {
  const recent = (auditEvents || []).filter((e) => withinWindow(e.at, now, cfg.windowMs));
  const out = [];
  for (const [uid, count] of countByUser(recent)) {
    const severity = severityForCount(count, cfg.warnAt, cfg.critAt);
    if (!severity) continue;
    out.push({
      alert_type: 'suspicious_admin_actions',
      severity,
      subject_user_id: uid,
      metadata: { count, threshold: cfg.warnAt, window: cfg.window },
    });
  }
  return out;
}

/** Run every detection over normalized events; returns candidate alerts. */
export function runDetections({ aiEvents = [], auditEvents = [] } = {}, now = new Date(), thresholds = DEFAULT_THRESHOLDS) {
  return [
    ...detectRapidAiUsage(aiEvents, now, thresholds.rapid_ai_usage),
    ...detectRepeatedFailures(aiEvents, now, thresholds.repeated_ai_failures),
    ...detectUsageConcentration(aiEvents, now, thresholds.ai_usage_concentration),
    ...detectSuspiciousAdminActions(auditEvents, now, thresholds.suspicious_admin_actions),
  ];
}

/** Stable dedupe key for a candidate/alert: type + subject. */
export function buildDedupeKey(candidate = {}) {
  return `${candidate.alert_type || '-'}:${candidate.subject_user_id || '-'}`;
}

/**
 * True when an equivalent, still-open alert of EQUAL OR HIGHER severity already
 * exists within the dedupe window (default 24h). Suppression is severity-aware:
 * a strict escalation (e.g. a critical candidate while only an open warning
 * exists) is NOT suppressed, so the higher-severity alert still surfaces.
 * Resolved alerts never suppress a fresh one, so a recurring issue can re-alert
 * after it was handled.
 */
export function isDuplicate(existingAlerts, candidate, now = new Date(), windowMs = 24 * 60 * 60 * 1000) {
  const key = buildDedupeKey(candidate);
  const candRank = SEVERITY_RANK[candidate.severity] ?? 0;
  return (Array.isArray(existingAlerts) ? existingAlerts : []).some(
    (a) =>
      a &&
      a.status !== 'resolved' &&
      buildDedupeKey(a) === key &&
      withinWindow(a.detected_at, now, windowMs) &&
      (SEVERITY_RANK[a.severity] ?? 0) >= candRank
  );
}

/** Drop duplicate candidates within one scan, keeping the highest severity. */
export function dedupeCandidates(candidates) {
  const best = new Map();
  for (const c of Array.isArray(candidates) ? candidates : []) {
    const key = buildDedupeKey(c);
    const prev = best.get(key);
    if (!prev || (SEVERITY_RANK[c.severity] || 0) > (SEVERITY_RANK[prev.severity] || 0)) best.set(key, c);
  }
  return [...best.values()];
}

/** Neutral English fallback text for a candidate — never contains PII. */
export function describeCandidate(candidate = {}) {
  const ref = maskUserRef(candidate.subject_user_id);
  const m = candidate.metadata || {};
  switch (candidate.alert_type) {
    case 'rapid_ai_usage':
      return { title: `Rapid AI usage: ${m.count} calls in ${m.window}`, summary: `${ref} made ${m.count} AI calls in ${m.window} (threshold ${m.threshold}).` };
    case 'repeated_ai_failures':
      return { title: `Repeated AI failures: ${m.count} in ${m.window}`, summary: `${ref} had ${m.count} failed/blocked AI calls in ${m.window} (threshold ${m.threshold}).` };
    case 'ai_usage_concentration':
      return { title: `AI usage concentration: ${m.percent}% of traffic`, summary: `${ref} accounted for ${m.percent}% of ${m.total} AI calls in ${m.window}.` };
    case 'suspicious_admin_actions':
      return { title: `Suspicious admin activity: ${m.count} actions in ${m.window}`, summary: `${ref} performed ${m.count} admin actions in ${m.window} (threshold ${m.threshold}).` };
    default:
      return { title: 'Security alert', summary: `${ref} triggered a security check.` };
  }
}

/** Build the SecurityAlert entity payload from a candidate. */
export function buildAlertPayload(candidate = {}, { now = new Date() } = {}) {
  const text = describeCandidate(candidate);
  return {
    alert_type: ALERT_TYPES.includes(candidate.alert_type) ? candidate.alert_type : 'rapid_ai_usage',
    severity: SEVERITIES.includes(candidate.severity) ? candidate.severity : 'info',
    subject_user_id: candidate.subject_user_id || null,
    subject_ref: maskUserRef(candidate.subject_user_id),
    title: text.title,
    summary: text.summary,
    metadata: candidate.metadata || {},
    dedupe_key: buildDedupeKey(candidate),
    status: 'new',
    detected_at: now.toISOString(),
    acknowledged_at: null,
    acknowledged_by: null,
    resolved_at: null,
    resolved_by: null,
  };
}

/**
 * Paging stop-decision for the scan's time-windowed reads. Rows come back
 * newest-first, so paging can stop once a page is short (no more rows) or the
 * oldest row on the page is already past the window cutoff. Pure so the loop's
 * termination is unit-testable.
 */
export function pageCompletesWindow(pageLength, pageSize, oldestAt, now, windowMs) {
  if (pageLength < pageSize) return true;
  const t = asTime(oldestAt);
  if (t === null) return true;
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  return t < nowMs - windowMs;
}

/** Admin-list-safe projection — omits raw subject_user_id and actor fields. */
export function toAlertSummary(alert = {}) {
  return SUMMARY_FIELDS.reduce((safe, field) => {
    safe[field] = alert[field] ?? null;
    return safe;
  }, {});
}

/**
 * PII-free error body for a failed scan source read. Only the source label and
 * a plain message string are exposed — never a stack, headers, tokens, IPs, or
 * any other property that might ride along on the error object.
 */
export function scanErrorResponse(source, error) {
  const message = String((error && error.message) || error || 'unknown error');
  return { error: 'Security scan failed', source: source || 'unknown', detail: message };
}

// ── Status workflow: new → acknowledged → resolved (no going backwards).
const TRANSITIONS = { new: ['acknowledged', 'resolved'], acknowledged: ['resolved'], resolved: [] };

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

/**
 * Build the update patch for a status transition, or null if not allowed.
 * Stamps acknowledged/resolved timestamps + a (masked) admin reference.
 */
export function applyStatusTransition(alert = {}, to, { now = new Date(), adminRef = null } = {}) {
  if (!canTransition(alert.status, to)) return null;
  const patch = { status: to };
  if (to === 'acknowledged') {
    patch.acknowledged_at = now.toISOString();
    patch.acknowledged_by = adminRef;
  }
  if (to === 'resolved') {
    patch.resolved_at = now.toISOString();
    patch.resolved_by = adminRef;
  }
  return patch;
}
