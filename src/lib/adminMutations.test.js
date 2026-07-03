import { describe, it, expect } from 'vitest';
import {
  ASSIGNABLE_ROLES,
  ALLOWED_SUBSCRIPTION_FIELDS,
  validateRoleChange,
  validateSelfMutation,
  pickSubscriptionUpdates,
  buildAuditEntry,
} from './adminMutations.js';

describe('admin mutation guards', () => {
  describe('validateRoleChange', () => {
    it('accepts a valid role change to another user', () => {
      expect(validateRoleChange({ actingUserId: 'admin-1', targetUserId: 'u-2', newRole: 'admin' })).toEqual({ ok: true });
      expect(validateRoleChange({ actingUserId: 'admin-1', targetUserId: 'u-2', newRole: 'user' })).toEqual({ ok: true });
    });
    it('rejects invalid role values', () => {
      const r = validateRoleChange({ actingUserId: 'admin-1', targetUserId: 'u-2', newRole: 'superadmin' });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/invalid role/i);
    });
    it('rejects changing your own role', () => {
      const r = validateRoleChange({ actingUserId: 'admin-1', targetUserId: 'admin-1', newRole: 'user' });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/own role/i);
    });
    it('requires a target', () => {
      expect(validateRoleChange({ actingUserId: 'a', targetUserId: '', newRole: 'user' }).ok).toBe(false);
    });
    it('only admin and user are assignable', () => {
      expect(ASSIGNABLE_ROLES).toEqual(['admin', 'user']);
    });
  });

  describe('validateSelfMutation', () => {
    it('allows deleting another account', () => {
      expect(validateSelfMutation({ actingUserId: 'a', targetUserId: 'b', operation: 'delete' })).toEqual({ ok: true });
    });
    it('blocks deleting your own account', () => {
      const r = validateSelfMutation({ actingUserId: 'a', targetUserId: 'a', operation: 'delete' });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/your own account/i);
    });
  });

  describe('pickSubscriptionUpdates', () => {
    it('keeps only whitelisted fields that are present', () => {
      const updates = pickSubscriptionUpdates({
        planName: 'growth',
        status: 'active',
        userId: 'hacker-owns-this', // not whitelisted — must be dropped
        price: 9999,                // not whitelisted — must be dropped
        paymentStatus: 'paid',
      });
      expect(updates).toEqual({ planName: 'growth', status: 'active', paymentStatus: 'paid' });
    });
    it('ignores undefined values and non-objects', () => {
      expect(pickSubscriptionUpdates({ planName: undefined })).toEqual({});
      expect(pickSubscriptionUpdates(null)).toEqual({});
      expect(pickSubscriptionUpdates('nope')).toEqual({});
    });
    it('does not allow owner reassignment', () => {
      expect(ALLOWED_SUBSCRIPTION_FIELDS).not.toContain('userId');
    });
  });

  describe('buildAuditEntry', () => {
    const actor = { id: 'admin-1', role: 'admin', email: 'admin@madar.sa' };
    const now = '2026-07-03T00:00:00.000Z';

    it('maps to the Madar AuditLog schema and stringifies structured values', () => {
      const entry = buildAuditEntry(actor, {
        action: 'role_change',
        targetType: 'User',
        targetId: 'u-2',
        targetName: 'user@x.com',
        previousValue: { role: 'user' },
        newValue: { role: 'admin' },
        details: { reason: 'promotion' },
      }, now);
      expect(entry.adminId).toBe('admin-1');
      expect(entry.adminRole).toBe('admin');
      expect(entry.action).toBe('role_change');
      expect(entry.targetType).toBe('User');
      expect(entry.targetId).toBe('u-2');
      expect(entry.previousValue).toBe(JSON.stringify({ role: 'user' }));
      expect(entry.newValue).toBe(JSON.stringify({ role: 'admin' }));
      expect(entry.timestamp).toBe(now);
      expect(entry.details).toEqual({ reason: 'promotion' });
    });

    it('falls back to a collection marker for target-less actions and nulls empty values', () => {
      const entry = buildAuditEntry(actor, { action: 'admin_data_access', targetType: 'User' }, now);
      expect(entry.targetId).toBe('collection:User');
      expect(entry.previousValue).toBeNull();
      expect(entry.newValue).toBeNull();
    });

    it('defaults adminRole to user when actor lacks a role', () => {
      const entry = buildAuditEntry({ id: 'x' }, { action: 'a', targetType: 'T', targetId: '1' }, now);
      expect(entry.adminRole).toBe('user');
    });
  });
});
