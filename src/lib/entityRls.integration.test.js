import { describe, it, expect, beforeAll } from 'vitest';

/**
 * LIVE cross-user RLS enforcement tests.
 *
 * These prove the security properties the task requires:
 *   - User A cannot READ User B's data
 *   - User A cannot UPDATE or DELETE User B's data
 *   - An unauthenticated client cannot access protected records
 *   - Admin access works where explicitly intended
 *
 * They can only run against a real Base44 backend with the RLS from
 * base44/entities/*.jsonc actually deployed (`base44 entities push`), so the
 * whole suite is SKIPPED unless the required credentials are provided via env:
 *
 *   BASE44_APP_ID
 *   BASE44_APP_BASE_URL
 *   BASE44_TEST_USER_A_TOKEN   (a normal, non-admin user)
 *   BASE44_TEST_USER_B_TOKEN   (a different normal, non-admin user)
 *   BASE44_TEST_ADMIN_TOKEN    (optional: a user whose User.role === "admin")
 *
 * ⚠️ Until these run green against the deployed backend, cross-user isolation
 * is NOT verified — the static schema tests only prove the policy is declared,
 * not that the platform enforces it. See docs/RLS_DATA_ISOLATION.md.
 */

const {
  BASE44_APP_ID,
  BASE44_APP_BASE_URL,
  BASE44_TEST_USER_A_TOKEN,
  BASE44_TEST_USER_B_TOKEN,
  BASE44_TEST_ADMIN_TOKEN,
} = process.env;

const haveCreds = Boolean(
  BASE44_APP_ID && BASE44_APP_BASE_URL && BASE44_TEST_USER_A_TOKEN && BASE44_TEST_USER_B_TOKEN
);

const makeClient = async (token) => {
  const { createClient } = await import('@base44/sdk');
  return createClient({ appId: BASE44_APP_ID, appBaseUrl: BASE44_APP_BASE_URL, token, requiresAuth: true });
};

// Returns true if the read genuinely returned nothing / was denied.
const cannotSee = (result) => !result || (Array.isArray(result) && result.length === 0);

describe.skipIf(!haveCreds)('LIVE: UserProperty cross-user isolation', () => {
  let userA, userB, unauth, admin;
  let aId, aUserId;
  let createdPropertyId;

  beforeAll(async () => {
    userA = await makeClient(BASE44_TEST_USER_A_TOKEN);
    userB = await makeClient(BASE44_TEST_USER_B_TOKEN);
    unauth = await makeClient(undefined);
    if (BASE44_TEST_ADMIN_TOKEN) admin = await makeClient(BASE44_TEST_ADMIN_TOKEN);

    const meA = await userA.auth.me();
    aUserId = meA.id;
    const prop = await userA.entities.UserProperty.create({
      userId: aUserId,
      name: `rls-test-${Date.now()}`,
      type: 'apartment',
    });
    createdPropertyId = prop.id;
    aId = prop.id;
  });

  it('User A can read their own property', async () => {
    const own = await userA.entities.UserProperty.filter({ userId: aUserId });
    expect(own.some((p) => p.id === aId)).toBe(true);
  });

  it('User B CANNOT read User A\'s property by direct get', async () => {
    let record = null;
    try {
      record = await userB.entities.UserProperty.get(createdPropertyId);
    } catch {
      record = null; // a thrown 403/404 is an acceptable "denied"
    }
    expect(cannotSee(record)).toBe(true);
  });

  it('User B CANNOT enumerate User A\'s property, even filtering by A\'s userId', async () => {
    const leaked = await userB.entities.UserProperty.filter({ userId: aUserId }).catch(() => []);
    expect(leaked.some((p) => p.id === createdPropertyId)).toBe(false);
  });

  it('User B CANNOT update User A\'s property', async () => {
    let threwOrNoOp = false;
    try {
      await userB.entities.UserProperty.update(createdPropertyId, { name: 'hijacked' });
      // If it did not throw, prove the write did not actually take effect.
      const afterA = await userA.entities.UserProperty.get(createdPropertyId);
      threwOrNoOp = afterA.name !== 'hijacked';
    } catch {
      threwOrNoOp = true;
    }
    expect(threwOrNoOp).toBe(true);
  });

  it('User B CANNOT delete User A\'s property', async () => {
    let stillExists = false;
    try {
      await userB.entities.UserProperty.delete(createdPropertyId);
    } catch {
      /* denied — expected */
    }
    const afterA = await userA.entities.UserProperty.get(createdPropertyId).catch(() => null);
    stillExists = Boolean(afterA);
    expect(stillExists).toBe(true);
  });

  it('an unauthenticated client CANNOT read the property', async () => {
    let record = null;
    try {
      record = await unauth.entities.UserProperty.get(createdPropertyId);
    } catch {
      record = null;
    }
    expect(cannotSee(record)).toBe(true);
  });

  it.skipIf(!BASE44_TEST_ADMIN_TOKEN)('an admin CAN read the property (explicitly intended)', async () => {
    const record = await admin.entities.UserProperty.get(createdPropertyId);
    expect(record?.id).toBe(createdPropertyId);
  });
});

describe.skipIf(!haveCreds)('LIVE: UserSubscription billing isolation', () => {
  it('User B cannot read User A\'s subscription records', async () => {
    const userA = await makeClient(BASE44_TEST_USER_A_TOKEN);
    const userB = await makeClient(BASE44_TEST_USER_B_TOKEN);
    const aUserId = (await userA.auth.me()).id;
    const leaked = await userB.entities.UserSubscription.filter({ userId: aUserId }).catch(() => []);
    expect(leaked.length).toBe(0);
  });
});

describe.skipIf(!haveCreds)('LIVE: AdminUser privilege escalation is blocked', () => {
  it('a non-admin CANNOT create an AdminUser record granting themselves admin', async () => {
    const userA = await makeClient(BASE44_TEST_USER_A_TOKEN);
    const aUserId = (await userA.auth.me()).id;
    let denied = false;
    try {
      await userA.entities.AdminUser.create({ userId: aUserId, role: 'super_admin' });
    } catch {
      denied = true;
    }
    // If the platform did not throw, confirm the row is not readable/effective.
    if (!denied) {
      const check = await userA.entities.AdminUser.filter({ userId: aUserId }).catch(() => []);
      denied = check.every((r) => r.role !== 'super_admin');
    }
    expect(denied).toBe(true);
  });
});
