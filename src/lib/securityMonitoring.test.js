import { describe, it, expect } from 'vitest';
import {
  ALERT_TYPES, SEVERITIES, SUMMARY_FIELDS, AI_FAILURE_STATUSES, label,
  severityForCount, maskUserRef,
  detectRapidAiUsage, detectRepeatedFailures, detectUsageConcentration, detectSuspiciousAdminActions,
  runDetections, buildDedupeKey, isDuplicate, dedupeCandidates,
  buildAlertPayload, toAlertSummary, canTransition, applyStatusTransition,
} from './securityMonitoring.js';

const now = new Date('2026-07-06T12:00:00Z');
const ago = (mins) => new Date(now.getTime() - mins * 60 * 1000).toISOString();

describe('severity + labels', () => {
  it('steps severity by count thresholds', () => {
    expect(severityForCount(4, 5, 15)).toBeNull();
    expect(severityForCount(5, 5, 15)).toBe('warning');
    expect(severityForCount(15, 5, 15)).toBe('critical');
  });
  it('labels types/severity/status in Arabic', () => {
    expect(label('rapid_ai_usage')).toBe('استخدام مكثف للذكاء الاصطناعي');
    expect(label('critical')).toBe('حرج');
    expect(label('resolved')).toBe('تمت المعالجة');
  });
});

describe('maskUserRef — never leaks the full id or an email', () => {
  it('masks to a short prefix', () => {
    expect(maskUserRef('abcdef1234567890')).toBe('user_abcdef');
    expect(maskUserRef(null)).toBe('unknown');
    expect(maskUserRef('user@example.com')).not.toContain('@'); // truncated before the @
  });
});

describe('detectRapidAiUsage', () => {
  it('flags a user over the warn threshold within the window', () => {
    const events = [
      ...Array.from({ length: 12 }, () => ({ userId: 'u1', status: 'success', at: ago(10) })),
      ...Array.from({ length: 3 }, () => ({ userId: 'u2', status: 'success', at: ago(10) })),
      { userId: 'u1', status: 'success', at: ago(120) }, // outside 1h window — ignored
    ];
    const out = detectRapidAiUsage(events, now);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ alert_type: 'rapid_ai_usage', severity: 'warning', subject_user_id: 'u1' });
    expect(out[0].metadata.count).toBe(12);
  });
  it('escalates to critical past the crit threshold', () => {
    const events = Array.from({ length: 26 }, () => ({ userId: 'u1', status: 'success', at: ago(5) }));
    expect(detectRapidAiUsage(events, now)[0].severity).toBe('critical');
  });
});

describe('detectRepeatedFailures — only error/blocked count', () => {
  it('counts failed/blocked statuses, ignoring success/fallback', () => {
    const events = [
      ...Array.from({ length: 5 }, () => ({ userId: 'u1', status: 'error', at: ago(60) })),
      { userId: 'u1', status: 'success', at: ago(60) },
      { userId: 'u1', status: 'fallback', at: ago(60) },
    ];
    const out = detectRepeatedFailures(events, now);
    expect(out).toHaveLength(1);
    expect(out[0].metadata.count).toBe(5);
    expect(AI_FAILURE_STATUSES).toEqual(['error', 'blocked']);
  });
});

describe('detectUsageConcentration', () => {
  it('flags a dominant user only when total is meaningful', () => {
    const events = [
      ...Array.from({ length: 18 }, () => ({ userId: 'u1', status: 'success', at: ago(60) })),
      ...Array.from({ length: 4 }, () => ({ userId: 'u2', status: 'success', at: ago(60) })),
    ];
    const out = detectUsageConcentration(events, now); // total 22 ≥ minTotal 20; u1 ≈ 82%, u2 ≈ 18%
    expect(out).toHaveLength(1);
    expect(out[0].subject_user_id).toBe('u1');
    expect(out[0].severity).toBe('critical'); // ≥ 50%
  });
  it('stays silent below the minimum total', () => {
    const events = Array.from({ length: 5 }, () => ({ userId: 'u1', status: 'success', at: ago(60) }));
    expect(detectUsageConcentration(events, now)).toEqual([]);
  });
});

describe('detectSuspiciousAdminActions', () => {
  it('flags an admin with a burst of actions in the short window', () => {
    const events = Array.from({ length: 8 }, () => ({ userId: 'admin1', at: ago(2) }));
    const out = detectSuspiciousAdminActions(events, now);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ alert_type: 'suspicious_admin_actions', subject_user_id: 'admin1' });
  });
});

describe('dedupe', () => {
  it('collapses same-type/subject candidates within a scan, keeping highest severity', () => {
    const deduped = dedupeCandidates([
      { alert_type: 'rapid_ai_usage', subject_user_id: 'u1', severity: 'warning' },
      { alert_type: 'rapid_ai_usage', subject_user_id: 'u1', severity: 'critical' },
    ]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].severity).toBe('critical');
  });
  it('suppresses a candidate matching an open alert within the window', () => {
    const candidate = { alert_type: 'rapid_ai_usage', subject_user_id: 'u1', severity: 'warning' };
    const existingOpen = [{ alert_type: 'rapid_ai_usage', subject_user_id: 'u1', status: 'new', detected_at: ago(30) }];
    expect(isDuplicate(existingOpen, candidate, now)).toBe(true);
  });
  it('does NOT suppress when the prior alert is resolved or outside the window', () => {
    const candidate = { alert_type: 'rapid_ai_usage', subject_user_id: 'u1', severity: 'warning' };
    expect(isDuplicate([{ alert_type: 'rapid_ai_usage', subject_user_id: 'u1', status: 'resolved', detected_at: ago(30) }], candidate, now)).toBe(false);
    expect(isDuplicate([{ alert_type: 'rapid_ai_usage', subject_user_id: 'u1', status: 'new', detected_at: ago(60 * 25) }], candidate, now)).toBe(false);
    expect(buildDedupeKey(candidate)).toBe('rapid_ai_usage:u1');
  });
});

describe('runDetections', () => {
  it('aggregates all detections over normalized events', () => {
    const aiEvents = Array.from({ length: 12 }, () => ({ userId: 'u1', status: 'success', at: ago(5) }));
    const auditEvents = Array.from({ length: 8 }, () => ({ userId: 'admin1', at: ago(1) }));
    const types = runDetections({ aiEvents, auditEvents }, now).map((c) => c.alert_type);
    expect(types).toContain('rapid_ai_usage');
    expect(types).toContain('suspicious_admin_actions');
  });
});

describe('buildAlertPayload + toAlertSummary — no PII leaks', () => {
  const candidate = { alert_type: 'rapid_ai_usage', severity: 'warning', subject_user_id: 'abcdef123456', metadata: { count: 12, threshold: 10, window: '1h' } };

  it('stores masked ref + raw id, PII-free title/summary, status new', () => {
    const p = buildAlertPayload(candidate, { now });
    expect(p.subject_ref).toBe('user_abcdef');
    expect(p.subject_user_id).toBe('abcdef123456');
    expect(p.status).toBe('new');
    expect(p.detected_at).toBe(now.toISOString());
    expect(p.title).not.toContain('abcdef123456'); // full id never in text
    expect(p.summary).toContain('user_abcdef'); // masked ref only
    expect(ALERT_TYPES).toContain(p.alert_type);
    expect(SEVERITIES).toContain(p.severity);
  });

  it('the admin-list summary omits the raw subject_user_id and actor fields', () => {
    const alert = { ...buildAlertPayload(candidate, { now }), id: 'a1', acknowledged_by: 'admin_x', resolved_by: 'admin_y' };
    const summary = toAlertSummary(alert);
    expect(Object.keys(summary).sort()).toEqual([...SUMMARY_FIELDS].sort());
    expect(summary).not.toHaveProperty('subject_user_id');
    expect(summary).not.toHaveProperty('acknowledged_by');
    expect(summary).not.toHaveProperty('resolved_by');
  });
});

describe('status transitions — new → acknowledged → resolved only', () => {
  it('allows forward transitions and rejects backward/invalid ones', () => {
    expect(canTransition('new', 'acknowledged')).toBe(true);
    expect(canTransition('new', 'resolved')).toBe(true);
    expect(canTransition('acknowledged', 'resolved')).toBe(true);
    expect(canTransition('resolved', 'new')).toBe(false);
    expect(canTransition('acknowledged', 'new')).toBe(false);
  });
  it('builds a stamped patch for a valid transition and null for invalid', () => {
    const ack = applyStatusTransition({ status: 'new' }, 'acknowledged', { now, adminRef: 'user_admin1' });
    expect(ack).toMatchObject({ status: 'acknowledged', acknowledged_by: 'user_admin1' });
    expect(ack.acknowledged_at).toBe(now.toISOString());
    expect(applyStatusTransition({ status: 'resolved' }, 'new', { now })).toBeNull();
  });
});
