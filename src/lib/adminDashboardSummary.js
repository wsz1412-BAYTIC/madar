// PR I — Admin dashboard operational summaries (pure, unit-tested).
//
// Counts only — NO PII. These helpers never read client mobile/email, internal
// notes, deed/license numbers, or raw ids; they derive plain counts from
// already-admin-accessible records for the dashboard summary cards.

import { isFollowUpDue } from './opportunityRequests';

/** Opportunity requests: total, count per status, and follow-ups currently due. */
export function summarizeRequests(requests = [], now = new Date()) {
  const list = Array.isArray(requests) ? requests : [];
  const byStatus = {};
  let followUpsDue = 0;
  for (const r of list) {
    if (!r) continue;
    const s = r.status || 'new';
    byStatus[s] = (byStatus[s] || 0) + 1;
    if (isFollowUpDue(r, now)) followUpsDue += 1;
  }
  return { total: list.length, byStatus, followUpsDue };
}

/**
 * Security alerts (already safe summaries from the list_alerts backend action):
 * count OPEN (non-resolved) alerts by severity. Input carries no PII.
 */
export function summarizeAlerts(alerts = []) {
  const list = Array.isArray(alerts) ? alerts : [];
  const open = { info: 0, warning: 0, critical: 0 };
  let openTotal = 0;
  for (const a of list) {
    if (!a || (a.status || 'new') === 'resolved') continue;
    if (a.severity in open) open[a.severity] += 1;
    openTotal += 1;
  }
  return { open, openTotal, total: list.length };
}

/** Site updates: published vs draft counts. */
export function summarizeSiteUpdates(updates = []) {
  const list = Array.isArray(updates) ? updates : [];
  let published = 0;
  let draft = 0;
  for (const u of list) {
    if (!u) continue;
    if (u.is_published === true) published += 1;
    else draft += 1;
  }
  return { published, draft, total: list.length };
}
