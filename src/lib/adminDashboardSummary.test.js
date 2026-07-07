import { describe, it, expect } from 'vitest';
import { summarizeRequests, summarizeAlerts, summarizeSiteUpdates } from './adminDashboardSummary.js';

const now = new Date('2026-07-07T12:00:00Z');
const ago = (mins) => new Date(now.getTime() - mins * 60 * 1000).toISOString();

describe('summarizeRequests', () => {
  it('counts total, per-status, and follow-ups due', () => {
    const rows = [
      { status: 'new', next_follow_up_at: ago(60) },          // active + past due
      { status: 'contacted', next_follow_up_at: '2026-08-01T00:00:00Z' }, // future
      { status: 'new' },
      { status: 'closed_won', next_follow_up_at: ago(60) },    // terminal → not due
    ];
    const s = summarizeRequests(rows, now);
    expect(s.total).toBe(4);
    expect(s.byStatus).toEqual({ new: 2, contacted: 1, closed_won: 1 });
    expect(s.followUpsDue).toBe(1); // only the active past-due one
  });
  it('is safe on empty/invalid input', () => {
    expect(summarizeRequests(null)).toEqual({ total: 0, byStatus: {}, followUpsDue: 0 });
  });
});

describe('summarizeAlerts — open by severity, no PII', () => {
  it('counts only non-resolved alerts by severity', () => {
    const rows = [
      { severity: 'critical', status: 'new' },
      { severity: 'warning', status: 'acknowledged' },
      { severity: 'critical', status: 'resolved' }, // excluded
      { severity: 'info', status: 'new' },
    ];
    const s = summarizeAlerts(rows);
    expect(s.open).toEqual({ info: 1, warning: 1, critical: 1 });
    expect(s.openTotal).toBe(3);
    expect(s.total).toBe(4);
  });
  it('handles empty input', () => {
    expect(summarizeAlerts([])).toEqual({ open: { info: 0, warning: 0, critical: 0 }, openTotal: 0, total: 0 });
  });
});

describe('summarizeSiteUpdates', () => {
  it('splits published vs draft', () => {
    const s = summarizeSiteUpdates([{ is_published: true }, { is_published: false }, { is_published: true }, {}]);
    expect(s).toEqual({ published: 2, draft: 2, total: 4 });
  });
});
