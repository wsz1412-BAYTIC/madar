# Admin & Permissions Inspection

Scope: the admin surface (customer/property/recommendation management, roles &
permissions, subscriptions/billing, audit logs & sensitive actions) and the
central question of **requirement #5 — are permissions enforced server-side, or
only hidden in the UI?** Inspected on `main` @ `2d5d4a3`.

Verification note: static inspection + test suite only. No live backend, so
runtime authorization behavior is **[UNVERIFIED]** except where the code makes
it certain. **No claim is made that the admin surface is secure.** The headline
finding is the opposite.

## Headline: permissions are enforced in the UI, not server-side

The only server-side authorization mechanism in this app is **Base44 entity
RLS**. Everything else — admin-dashboard access, the granular
`hasAdminPermission(role, permission)` system, plan/feature gating — is
**client-side JavaScript that a user can bypass** by calling the SDK directly
(e.g. from the browser console) or by editing the bundle. Specific evidence
below.

## Findings (ranked)

### A1 [HIGH] `/admin/*` routes have NO authorization gate at all
- **File:** `src/pages/Admin.jsx` — serves `/admin/users`, `/admin/properties`,
  `/admin/subscriptions`, `/admin/data`, `/admin/content`, `/admin/support`,
  `/admin/logs`, `/admin/settings` (`src/App.jsx:98-105`). It contains **no
  auth or admin check whatsoever** (verified: no `useAuth`, no `AdminUser`
  lookup, no redirect).
- **Impact:** On `main`, anyone can open these admin URLs. After PR #6 wraps the
  route group in `ProtectedRoute`, they still only require being **logged in** —
  `ProtectedRoute` checks authentication, **not admin role**. So any registered
  customer can reach the admin pages.
- **Mitigating:** `Admin.jsx` is currently a **mock placeholder** (see A4), so
  today it leaks only fake data — but the missing gate is a real authorization
  hole the moment it shows anything real.
- **Fix:** add an `AdminRoute` guard (checks the `AdminUser` record /
  `canAccessAdminDashboard`, or `User.role === 'admin'`) and wrap the `/admin/*`
  routes with it. **Effort:** Small. **Auto-fixable:** Yes, but **touches
  `App.jsx` which PR #6 rewrites — apply after PR #6** to avoid conflict.
  **Test:** a non-admin authenticated user hitting `/admin/users` is redirected;
  an admin is allowed.

### A2 [HIGH] Admin-dashboard gate is client-side only and bypassable
- **File:** `src/pages/AdminDashboard.jsx:34-42` — checks
  `AdminUser.filter({ userId })` + `canAccessAdminDashboard` and sets an
  `unauthorized` error for non-admins. This is a **UI redirect**, not
  enforcement: the very next lines call `base44.entities.User.list()`,
  `UserSubscription.list()`, `UserProperty.list()` (lines 45-47). A non-admin
  can call those same SDK methods directly; the only thing that stops them is
  server-side RLS.
- **Impact / requirement #5:** admin data access is not gated server-side by
  anything in this file — it depends entirely on RLS.
- **Server-side status:**
  - `UserSubscription` / `UserProperty` — **fixed by PR #5** (owner-or-admin
    RLS; `.list()` returns all only to admins).
  - **`User.list()` — still a gap.** PR #5 deliberately did **not** add RLS to
    the `User` identity entity (documented in `docs/RLS_DATA_ISOLATION.md` as
    needing dashboard review, because restricting the identity table blind can
    break auth). So `User.list()` may remain **world-readable** even after PR #5
    — a non-admin could enumerate all users. **[UNVERIFIED]** — depends on
    Base44's default for the `User` entity; must be checked in the dashboard.
- **Fix:** restrict the `User` entity's `list`/`read` to admins **in the Base44
  dashboard** (not via a blind schema push). See the manual steps below.
  **Effort:** Small (dashboard). **Auto-fixable:** No (identity table; must be
  verified live). **Test:** the live cross-user suite extended to assert a
  non-admin `User.list()` does not return other users.

### A3 [HIGH] Granular admin permissions are never enforced server-side
- **File:** `src/lib/permissions.js` — `ADMIN_ROLES`, `hasAdminPermission(role,
  permission)`, `canAccessAdminDashboard(...)` are pure client-side helpers.
- **Impact:** The six admin roles (`super_admin`, `finance_manager`, etc.) and
  their permission strings gate only UI rendering. There is **no backend
  function** that checks these before performing a sensitive action — because
  there are no real sensitive admin actions implemented (A4). If admin actions
  are added later wired only to these helpers, they will be bypassable.
- **Fix:** any real admin mutation must go through a Base44 backend function
  that re-checks the caller's `AdminUser` role/permissions with
  `asServiceRole`, mirroring the pattern used by the price-recommendation
  functions. **Effort:** Medium per action. **Auto-fixable:** No.

### A4 [HIGH] The admin management screens are mock / not implemented
- **File:** `src/pages/Admin.jsx:7,12` — `usageData` and `subscribers` are
  hardcoded arrays. There is **no real customer management, property
  management, recommendation management, subscription/billing management, or
  role management.** `AdminDashboard.jsx` is a read-only stats overview (real
  counts via `.list()`), with **no mutation actions** anywhere
  (verified: no `.update`/`.create`/`.delete` in any admin page/component).
- **Impact / requirement #4:** the admin side described in the requirements does
  not exist yet — it's a placeholder. Documented here as **missing/incomplete**,
  not silently treated as working.
- **Fix:** build the admin actions as authorized Base44 backend functions
  (A3). **Effort:** Large. **Auto-fixable:** No.

### A5 [MEDIUM] Audit log is defined but never written
- **Files:** `base44/entities/AuditLog.jsonc` exists (and PR #5 makes it
  admin-only + append-only), but **no code anywhere writes an AuditLog record**
  (verified: `AuditLog` is referenced in zero source files).
- **Impact / requirement #4:** sensitive actions are not audited — there is no
  trail because there are no implemented admin actions and no logging hook.
- **Fix:** when admin mutations are built (A4), each must write an `AuditLog`
  entry from its backend function (actor, action, target, before/after,
  timestamp). **Effort:** Small per action, once actions exist.
  **Auto-fixable:** No (nothing to audit yet).

## Manual Base44 actions required from you

These cannot be done from the repo (identity-table RLS is dashboard-owned and
was intentionally not pushed blind):

1. Open the Base44 dashboard for app `6a43dd3026ba0773af35c603`
   (`https://base44.cloud/apps/6a43dd3026ba0773af35c603`).
2. **Entities → User → Security / Access Rules.** Confirm whether `list`/`read`
   is currently open. If it is, restrict read to admins:
   `{ "user_condition": { "role": "admin" } }` (plus a self-read clause if the
   app needs a user to read their own `User` row —
   `{ "$or": [ { "id": "{{user.id}}" }, { "user_condition": { "role": "admin" } } ] }`).
   Test that normal login (`base44.auth.me()`) still works after — the identity
   table is sensitive, so verify before relying on it.
3. **Users →** confirm every real admin has `role = admin` (the RLS admin
   clauses across the app key on `{{user.role}}`, not the `AdminUser` table).
4. Decide how admin-ness is authoritative: the `User.role` field **or** the
   `AdminUser` table. Right now the app uses **both inconsistently**
   (`AdminDashboard` checks `AdminUser`; RLS checks `User.role`). Pick one and
   make them consistent, or admins will pass one check and fail the other.

## Answer to requirement #5

**No — permissions are not currently enforced server-side except via entity
RLS, and even that has a `User`-entity gap.** The admin-dashboard gate, the
granular role/permission system, and (separately) the plan/feature gating are
all client-side and bypassable. The path to real enforcement is: (a) merge
PR #5, (b) close the `User`-entity RLS gap in the dashboard, (c) add an
admin-role route guard after PR #6, and (d) implement every real admin action as
an authorization-checking Base44 backend function that also writes an AuditLog.

No admin code is changed in this PR (inspection only) — the one surgical fix
(admin-role route guard, A1) touches `App.jsx`, which PR #6 rewrites, so it is
sequenced to land after PR #6 to avoid a conflict.
