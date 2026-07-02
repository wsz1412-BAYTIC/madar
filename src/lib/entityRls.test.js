import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Static enforcement tests for Row-Level Security on every Base44 entity.
//
// These assert the *policy declared in the repo* (base44/entities/*.jsonc),
// which is what `base44 entities push` deploys. They CANNOT prove the policy
// is actually enforced by the running Base44 platform — that requires a live,
// multi-user backend and is covered by src/lib/entityRls.integration.test.js
// (skipped unless BASE44 credentials are provided). See
// docs/RLS_DATA_ISOLATION.md for the manual verification steps.

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const entitiesDir = path.join(root, 'base44', 'entities');

const loadEntity = (file) => JSON.parse(readFileSync(path.join(entitiesDir, file), 'utf8'));
const entityFiles = readdirSync(entitiesDir).filter((f) => f.endsWith('.jsonc'));

const OWNER = { 'data.userId': '{{user.id}}' };
const ADMIN = { user_condition: { role: 'admin' } };
const ownerOrAdmin = (rule) =>
  rule && Array.isArray(rule.$or) &&
  rule.$or.some((c) => JSON.stringify(c) === JSON.stringify(OWNER)) &&
  rule.$or.some((c) => JSON.stringify(c) === JSON.stringify(ADMIN));
const adminOnly = (rule) => JSON.stringify(rule) === JSON.stringify(ADMIN);

// Entities that carry a per-user `userId` field are "user-owned" and must be
// isolated. User.jsonc is the Base44-managed identity table and is handled
// separately (see the dedicated test below).
const USER_OWNED = ['UserProperty', 'UserSubscription', 'SupportTicket', 'PriceRecommendation'];

describe('every entity declares an RLS block (except the identity table)', () => {
  it.each(entityFiles)('%s', (file) => {
    const entity = loadEntity(file);
    if (entity.name === 'User') {
      // Intentionally not RLS-managed from the repo (identity table). Documented.
      expect(entity.rls).toBeUndefined();
      return;
    }
    expect(entity.rls, `${entity.name} must declare an rls block`).toBeDefined();
    expect(entity.rls.read).toBeDefined();
    expect(entity.rls.create).toBeDefined();
    expect(entity.rls.update).toBeDefined();
    expect(entity.rls.delete).toBeDefined();
  });
});

describe('no user-owned entity is world-readable or world-writable', () => {
  it.each(USER_OWNED)('%s does not use unrestricted true/absent rules', (name) => {
    const entity = loadEntity(`${name}.jsonc`);
    for (const op of ['read', 'update', 'delete']) {
      expect(entity.rls[op], `${name}.rls.${op} must not be world-open (true)`).not.toBe(true);
    }
  });
});

describe('authorization is keyed on the server-substituted session identity, never a client field alone', () => {
  it.each(USER_OWNED)('%s read rule references {{user.id}}, not a bare client userId', (name) => {
    const entity = loadEntity(`${name}.jsonc`);
    // The owner clause compares the record's stored userId to the session's
    // {{user.id}} (substituted server-side), so a client cannot forge it.
    expect(JSON.stringify(entity.rls.read)).toContain('{{user.id}}');
  });
});

describe('UserProperty (core user data) isolation', () => {
  const rls = loadEntity('UserProperty.jsonc').rls;
  it('read/update/delete are owner-or-admin', () => {
    expect(ownerOrAdmin(rls.read)).toBe(true);
    expect(ownerOrAdmin(rls.update)).toBe(true);
    expect(ownerOrAdmin(rls.delete)).toBe(true);
  });
  it('create is constrained to records the caller owns (cannot create for another user)', () => {
    expect(JSON.stringify(rls.create)).toBe(JSON.stringify(OWNER));
  });
});

describe('UserSubscription (billing) is admin-managed, owner-readable', () => {
  const rls = loadEntity('UserSubscription.jsonc').rls;
  it('a user can read only their own subscription', () => {
    expect(ownerOrAdmin(rls.read)).toBe(true);
  });
  it('a user cannot create/update/delete billing records (admin only)', () => {
    expect(adminOnly(rls.create)).toBe(true);
    expect(adminOnly(rls.update)).toBe(true);
    expect(adminOnly(rls.delete)).toBe(true);
  });
});

describe('PriceRecommendation (recommendation history + performance data) isolation', () => {
  const rls = loadEntity('PriceRecommendation.jsonc').rls;
  it('owner-or-admin read; writes admin/service-role only; never deletable', () => {
    expect(ownerOrAdmin(rls.read)).toBe(true);
    expect(adminOnly(rls.create)).toBe(true);
    expect(adminOnly(rls.update)).toBe(true);
    expect(rls.delete).toBe(false);
  });
});

describe('SupportTicket isolation', () => {
  const rls = loadEntity('SupportTicket.jsonc').rls;
  it('a user reads only their own tickets; only the owner can file one; staff manage', () => {
    expect(ownerOrAdmin(rls.read)).toBe(true);
    expect(JSON.stringify(rls.create)).toBe(JSON.stringify(OWNER));
    expect(adminOnly(rls.update)).toBe(true);
    expect(adminOnly(rls.delete)).toBe(true);
  });
});

describe('AdminUser (privilege table) blocks self-granted escalation', () => {
  const rls = loadEntity('AdminUser.jsonc').rls;
  it('create/update/delete are admin-only — a non-admin cannot grant themselves admin', () => {
    expect(adminOnly(rls.create)).toBe(true);
    expect(adminOnly(rls.update)).toBe(true);
    expect(adminOnly(rls.delete)).toBe(true);
  });
  it('create is NOT owner-keyed (owner-keyed create would BE the escalation hole)', () => {
    expect(JSON.stringify(rls.create)).not.toContain('{{user.id}}');
  });
  it('a user may read only their own admin record; admins read all', () => {
    expect(ownerOrAdmin(rls.read)).toBe(true);
  });
});

describe('AuditLog is admin-only and immutable', () => {
  const rls = loadEntity('AuditLog.jsonc').rls;
  it('admin-only read/create, and no updates or deletes (append-only trail)', () => {
    expect(adminOnly(rls.read)).toBe(true);
    expect(adminOnly(rls.create)).toBe(true);
    expect(rls.update).toBe(false);
    expect(rls.delete).toBe(false);
  });
});

describe('SubscriptionPlan is a public catalog, admin-writable', () => {
  const rls = loadEntity('SubscriptionPlan.jsonc').rls;
  it('read is public (pricing page, incl. unauthenticated) but writes are admin-only', () => {
    expect(rls.read).toBe(true);
    expect(adminOnly(rls.create)).toBe(true);
    expect(adminOnly(rls.update)).toBe(true);
    expect(adminOnly(rls.delete)).toBe(true);
  });
});
