import { describe, it, expect } from 'vitest';
import {
  REQUEST_STATUSES,
  TERMINAL_REQUEST_STATUSES,
  isTerminalStatus,
  isActiveRequest,
  findActiveDuplicate,
  buildDuplicateResponse,
  isFollowUpDue,
  filterRequests,
} from './opportunityRequests.js';

describe('status helpers', () => {
  it('classifies terminal vs active statuses (incl. legacy "closed")', () => {
    for (const s of ['closed_won', 'closed_lost', 'rejected', 'closed']) {
      expect(isTerminalStatus(s)).toBe(true);
      expect(isActiveRequest({ status: s })).toBe(false);
    }
    for (const s of ['new', 'contacted', 'qualified', 'agreement_pending', 'agreement_signed', 'negotiating']) {
      expect(isTerminalStatus(s)).toBe(false);
      expect(isActiveRequest({ status: s })).toBe(true);
    }
  });

  it('treats a missing status as active (freshly created request)', () => {
    expect(isActiveRequest({})).toBe(true);
    expect(isActiveRequest(undefined)).toBe(true);
  });

  it('keeps the workflow enum backward-compatible with the legacy statuses', () => {
    // The new dropdown enum must not have dropped the pre-Phase-3 open statuses.
    for (const s of ['new', 'contacted', 'qualified', 'rejected']) {
      expect(REQUEST_STATUSES).toContain(s);
    }
    // 'closed' is legacy-only and still recognised as terminal.
    expect(TERMINAL_REQUEST_STATUSES).toContain('closed');
  });
});

describe('findActiveDuplicate — duplicate request prevention', () => {
  const rows = [
    { id: 'r1', userId: 'u1', opportunityId: 'o1', status: 'contacted' }, // active
    { id: 'r2', userId: 'u1', opportunityId: 'o2', status: 'closed_lost' }, // terminal
    { id: 'r3', userId: 'u2', opportunityId: 'o1', status: 'new' },
  ];

  it('blocks a second active request for the same user + opportunity', () => {
    expect(findActiveDuplicate(rows, 'u1', 'o1')?.id).toBe('r1');
  });

  it('does NOT block when the only prior request is terminal', () => {
    expect(findActiveDuplicate(rows, 'u1', 'o2')).toBeNull();
  });

  it('does NOT block a different user or a different opportunity', () => {
    expect(findActiveDuplicate(rows, 'u1', 'o3')).toBeNull();
    expect(findActiveDuplicate(rows, 'u3', 'o1')).toBeNull();
  });

  it('is safe with empty/invalid input', () => {
    expect(findActiveDuplicate(null, 'u1', 'o1')).toBeNull();
    expect(findActiveDuplicate([], 'u1', 'o1')).toBeNull();
    expect(findActiveDuplicate(rows, '', 'o1')).toBeNull();
  });
});

describe('buildDuplicateResponse — safe subscriber response', () => {
  it('returns success without leaking any internal request detail', () => {
    const res = buildDuplicateResponse();
    expect(res.success).toBe(true);
    expect(res.duplicate).toBe(true);
    expect(typeof res.message).toBe('string');
    // No internal fields must ever be present.
    for (const leak of ['id', 'status', 'internal_notes', 'mobile', 'userId', 'assigned_admin', 'agreement_status']) {
      expect(res).not.toHaveProperty(leak);
    }
    expect(Object.keys(res).sort()).toEqual(['duplicate', 'message', 'success']);
  });
});

describe('isFollowUpDue', () => {
  const now = new Date('2026-07-06T12:00:00Z');
  it('is due when an active request has a past/now follow-up date', () => {
    expect(isFollowUpDue({ status: 'contacted', next_follow_up_at: '2026-07-06T09:00:00Z' }, now)).toBe(true);
    expect(isFollowUpDue({ status: 'contacted', next_follow_up_at: '2026-07-10T09:00:00Z' }, now)).toBe(false);
  });
  it('is never due for terminal requests or when no date is set', () => {
    expect(isFollowUpDue({ status: 'closed_won', next_follow_up_at: '2026-07-01T00:00:00Z' }, now)).toBe(false);
    expect(isFollowUpDue({ status: 'contacted' }, now)).toBe(false);
    expect(isFollowUpDue({ status: 'contacted', next_follow_up_at: 'not-a-date' }, now)).toBe(false);
  });
});

describe('filterRequests', () => {
  const now = new Date('2026-07-06T12:00:00Z');
  const rows = [
    { id: 'r1', opportunityId: 'o1', status: 'new', agreement_status: 'none', next_follow_up_at: '2026-07-05T00:00:00Z' },
    { id: 'r2', opportunityId: 'o2', status: 'negotiating', agreement_status: 'sent', next_follow_up_at: '2026-08-01T00:00:00Z' },
    { id: 'r3', opportunityId: 'o1', status: 'closed_won', agreement_status: 'signed' },
  ];
  const cityOf = (id) => ({ o1: 'Riyadh', o2: 'Jeddah' }[id]);

  it('filters by status, agreement status, city, and follow-up due', () => {
    expect(filterRequests(rows, { status: 'new' }, { cityOf, now }).map((r) => r.id)).toEqual(['r1']);
    expect(filterRequests(rows, { agreementStatus: 'sent' }, { cityOf, now }).map((r) => r.id)).toEqual(['r2']);
    expect(filterRequests(rows, { city: 'Jeddah' }, { cityOf, now }).map((r) => r.id)).toEqual(['r2']);
    expect(filterRequests(rows, { followUpDue: true }, { cityOf, now }).map((r) => r.id)).toEqual(['r1']);
  });

  it('returns everything when filters are empty/"all"', () => {
    expect(filterRequests(rows, { status: 'all', city: 'all', agreementStatus: 'all' }, { cityOf, now })).toHaveLength(3);
    expect(filterRequests(rows, {}, { cityOf, now })).toHaveLength(3);
  });
});
