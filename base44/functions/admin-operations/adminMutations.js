// Canonical guard/validation logic for privileged admin mutations in Madar.
//
// Ported (behaviour, not verbatim) from the Base44 live export's
// `adminOperations` function, adapted to Madar's entity field convention
// (User.role, UserSubscription.planName, AuditLog.adminId/targetType/...).
// Pure — no Base44 SDK, no I/O — so it is unit-tested here and mirrored into the
// Deno backend function (see base44/functions/admin-operations/).
//
// The Deno function re-checks `user.role === 'admin'` on every request before
// calling any of these helpers; these helpers add the per-operation guards
// (valid role values, no self-privilege changes, field whitelisting) and build
// the AuditLog entry recorded for every sensitive action.

export const ASSIGNABLE_ROLES = Object.freeze(['admin', 'user']);

// Only these UserSubscription fields may be changed through admin operations.
// Owner/identity fields (userId) and immutable history are intentionally excluded.
export const ALLOWED_SUBSCRIPTION_FIELDS = Object.freeze([
  'planName',
  'planId',
  'status',
  'renewalDate',
  'usageLimit',
  'paymentStatus',
]);

/**
 * Validate an admin role change. Guards against invalid role values and an admin
 * changing their own role (which could remove the last admin or be used to
 * self-escalate/mis-configure). Returns { ok, error }.
 */
export function validateRoleChange({ actingUserId, targetUserId, newRole }) {
  if (!targetUserId) return { ok: false, error: 'target_user_id required' };
  if (!ASSIGNABLE_ROLES.includes(newRole)) {
    return { ok: false, error: 'Invalid role. Allowed: admin, user' };
  }
  if (actingUserId && targetUserId === actingUserId) {
    return { ok: false, error: 'Cannot change your own role' };
  }
  return { ok: true };
}

/**
 * Validate a destructive self-targeted operation (e.g. delete). Admins may not
 * delete their own account through this path.
 */
export function validateSelfMutation({ actingUserId, targetUserId, operation }) {
  if (!targetUserId) return { ok: false, error: 'target_user_id required' };
  if (actingUserId && targetUserId === actingUserId) {
    return { ok: false, error: `Cannot ${operation || 'modify'} your own account` };
  }
  return { ok: true };
}

/**
 * Reduce an arbitrary update payload to only the whitelisted subscription fields
 * that were actually provided. Prevents mass-assignment of unexpected fields.
 */
export function pickSubscriptionUpdates(payload) {
  const updates = {};
  if (!payload || typeof payload !== 'object') return updates;
  for (const field of ALLOWED_SUBSCRIPTION_FIELDS) {
    if (payload[field] !== undefined) updates[field] = payload[field];
  }
  return updates;
}

/**
 * Build a Madar AuditLog entry for a sensitive admin action. Matches the
 * AuditLog schema (adminId, adminRole, action, targetType, targetId, targetName,
 * previousValue, newValue, timestamp, details). Structured before/after values
 * are JSON-stringified into previousValue/newValue (string|null) and also kept
 * verbatim under `details` for machine inspection.
 */
export function buildAuditEntry(actingUser, entry, nowIso) {
  const asString = (v) =>
    v === undefined || v === null
      ? null
      : typeof v === 'string'
        ? v
        : JSON.stringify(v);

  return {
    adminId: actingUser && actingUser.id ? actingUser.id : 'unknown',
    adminRole: (actingUser && actingUser.role) || 'user',
    action: entry.action,
    targetType: entry.targetType,
    // AuditLog requires targetId; collection-wide actions (e.g. list access) have
    // no single record, so fall back to a stable "collection:<Entity>" marker.
    targetId: entry.targetId || `collection:${entry.targetType}`,
    targetName: entry.targetName || null,
    previousValue: asString(entry.previousValue),
    newValue: asString(entry.newValue),
    timestamp: nowIso || new Date().toISOString(),
    details: entry.details || {},
  };
}
