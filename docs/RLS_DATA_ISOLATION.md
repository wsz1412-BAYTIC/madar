# Row-Level Security & Data Isolation

Addresses Critical Issue #1 from `docs/FABLE5_PRODUCTION_AUDIT.md`: before this
change only `PriceRecommendation` had row-level security (RLS), so any
authenticated user could read or modify **any** other user's properties,
billing, support tickets, and — worst of all — could create an `AdminUser`
record granting themselves admin.

## What changed in this repo

RLS blocks were added to every entity that needed one
(`base44/entities/*.jsonc`):

| Entity | create | read | update | delete | Rationale |
|---|---|---|---|---|---|
| **UserProperty** | own only | owner or admin | owner or admin | owner or admin | Core user-owned data + performance/market signals (`currentOccupancy`, `averageAdr`, `monthlyRevenue`, `performance`) |
| **UserSubscription** | admin | owner or admin | admin | admin | Billing — user may read own, only admin/backend writes |
| **PriceRecommendation** | admin (service role) | owner or admin | admin (service role) | ✗ never | Recommendation history (unchanged — already correct) |
| **SupportTicket** | own only | owner or admin | admin | admin | User files/reads own; staff manage status & internal notes |
| **AdminUser** | admin only | own or admin | admin | admin | Privilege table — **owner-keyed create would be the escalation hole**, so create is admin-only |
| **AuditLog** | admin | admin | ✗ never | ✗ never | Admin-only, append-only trail |
| **SubscriptionPlan** | admin | **public** | admin | admin | Public pricing catalog; admin-writable |
| **User** | — | — | — | — | **Not modified** — see caveat below |

Ownership is enforced against the **server-substituted session identity**
(`{{user.id}}`), compared to the record's stored `userId`. A client cannot
forge `{{user.id}}`, and the `create` rule on owner-keyed entities only allows
records whose `userId` equals the caller's own id — so a client-supplied
`userId` is never the authorization boundary (audit requirement #3).

This mirrors the pattern already used by `PriceRecommendation` and follows the
Base44 RLS reference bundled at
`.agents/skills/base44-cli/references/rls-examples.md`.

## ⚠️ This is NOT live until you deploy it — action required from you

Editing the `.jsonc` files only changes the **repo's** declared policy. Base44
enforces RLS from what has been **pushed to the backend**. **I cannot push or
verify this** from the build environment (the Base44 CLI requires an
interactive device-code login that this environment's network policy blocks —
`403 Forbidden` on the auth host). So until you do the steps below, the
production data is still exposed.

### Step 1 — Deploy the RLS (from a machine where you can log in)

From the project root, on your own laptop/desktop:

```bash
npx base44 login          # opens a browser / device-code login
npx base44 entities push  # pushes all base44/entities/*.jsonc, incl. the new RLS
```

The output lists which entities were `Updated`. Confirm all 7 changed entities
(AdminUser, AuditLog, SubscriptionPlan, SupportTicket, UserProperty,
UserSubscription — PriceRecommendation was already correct) appear.

> There is no separate "publish" for entities; `entities push` is the deploy.

### Step 2 — Check whether Base44 dashboard rules already exist (audit req #6)

**I could not verify this** — it requires dashboard access I don't have. Base44
lets RLS be configured in the dashboard UI *in addition to* the schema files,
and dashboard-defined rules can coexist with (or override) pushed ones. Please
confirm there are no stale/conflicting rules:

**On mobile (Base44 dashboard app or mobile browser):**

1. Open the Base44 dashboard for app id `6a43dd3026ba0773af35c603`
   (equivalent of `npx base44 dashboard open` →
   `https://base44.cloud/apps/6a43dd3026ba0773af35c603`).
2. Go to **Entities** (or **Data** → **Entities**).
3. For each of **UserProperty, UserSubscription, SupportTicket, AdminUser,
   AuditLog, SubscriptionPlan**, open the entity → **Security / Access Rules**
   (sometimes labelled **RLS** or **Permissions**).
4. Verify the rules match the table above. If the dashboard shows **no** rules
   for an entity after Step 1, the push didn't take — re-run it. If it shows
   **different** rules than the table, they will fight the pushed schema —
   delete the stale dashboard rule so the schema is the single source of truth.

### Step 3 — Exact rules to set if you must configure any entity by hand

If a given entity has to be set in the dashboard UI instead of via push, use
exactly these (they are the same JSON that's now in the `.jsonc` files):

- **Owner-or-admin** (for `read` on all user-owned entities; also
  `update`/`delete` on UserProperty):
  ```json
  { "$or": [ { "data.userId": "{{user.id}}" }, { "user_condition": { "role": "admin" } } ] }
  ```
- **Own-only** (UserProperty/SupportTicket `create`):
  ```json
  { "data.userId": "{{user.id}}" }
  ```
- **Admin-only** (UserSubscription/AdminUser/AuditLog/SubscriptionPlan writes;
  AuditLog read):
  ```json
  { "user_condition": { "role": "admin" } }
  ```
- **Blocked** (AuditLog update/delete, PriceRecommendation delete): `false`
- **Public** (SubscriptionPlan read): `true`

### Step 4 — Critical prerequisite: admins must have `User.role === "admin"`

Every `admin` rule keys on `{{user.role}}` (the Base44 `User` entity's `role`
field), **not** on the separate `AdminUser` table the app's
`canAccessAdminDashboard` uses. If your admins are only in the `AdminUser`
table but their `User.role` is still `"user"`, the admin branches of these
rules will not match and admins will lose access (e.g. the AdminDashboard's
`User.list()` / `UserSubscription.list()` / `UserProperty.list()` calls will
return empty).

**Verify in the dashboard:** for each real admin, set **Users → \<that user\>
→ role = admin**. This coupling is a pre-existing assumption in the app that I
could not verify — please confirm it.

### Step 5 — Prove isolation actually holds (audit req #5)

The static tests in `src/lib/entityRls.test.js` (27 tests, run in CI) prove the
**policy is declared** correctly, but they cannot prove the **platform enforces
it**. To verify enforcement, run the live suite against the deployed backend:

```bash
BASE44_APP_ID=6a43dd3026ba0773af35c603 \
BASE44_APP_BASE_URL=<your app base url> \
BASE44_TEST_USER_A_TOKEN=<token for a normal user A> \
BASE44_TEST_USER_B_TOKEN=<token for a different normal user B> \
BASE44_TEST_ADMIN_TOKEN=<optional: token for a User.role=admin user> \
npx vitest run src/lib/entityRls.integration.test.js
```

It asserts: User A reads their own property; **User B cannot read, update, or
delete it**; an unauthenticated client cannot read it; an admin can; User B
cannot read User A's subscription; and a non-admin cannot self-grant admin.
Until this passes, **cross-user isolation is unverified**.

## The `User` entity was intentionally left alone

`base44/entities/User.jsonc` is Base44's managed identity table (it backs
`base44.auth.me()` and login). Adding restrictive RLS to it from the repo risks
breaking authentication, and its correct policy depends on Base44-internal
behavior I could not verify. `AdminDashboard.jsx` calls
`base44.entities.User.list()` (admin-only page). **Please review the `User`
entity's access rules directly in the dashboard** and restrict `list`/`read` to
admins there if it is currently world-readable — do not do this blind via a
schema push. This is deliberately out of scope for this automated change.

## Status

- ✅ RLS policy added to 7 entities + static tests (run in CI now).
- ✅ Live cross-user test suite written (skips without backend credentials).
- ⛔ **Not deployed / not verified live** — requires Steps 1–5 above, which need
  your Base44 login and dashboard access. Do not treat data isolation as fixed
  in production until Step 5 passes.
