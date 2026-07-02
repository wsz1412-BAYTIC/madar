# Subscriptions & Plan-Limit Enforcement Inspection

Scope: requirement #6 — do subscriptions and plan limits reflect the **real
backend state**, and can they be **changed by normal users**? Inspected on
`main` @ `2d5d4a3`.

Verification note: static inspection + tests only; no live backend. Runtime RLS
behavior is **[UNVERIFIED]** except where the code makes it certain. No claim
that billing/subscriptions are production-ready.

## Summary answer to requirement #6

- **Does subscription state reflect the real backend?** Partly. The *plan a user
  is on* is read from the real `UserSubscription` entity (good). But the
  **billing page and upgrade flow are mock/unimplemented**, and **plan limits
  are enforced only in the UI**, not server-side.
- **Can a normal user change their subscription?** On `main`, **yes — a critical
  hole**: `UserSubscription` had no RLS, so a user could call
  `base44.entities.UserSubscription.update(id, { planName: 'premium' })`
  directly and self-upgrade. **Fixed by PR #5** (create/update restricted to
  admin). Until PR #5 is deployed, self-upgrade is possible.

## Findings (ranked)

### S1 [CRITICAL] Normal users can change their own subscription (pre-PR #5)
- **Evidence:** `UserSubscription.jsonc` on `main` has no `rls` block, and
  Base44's default is "all records accessible to all users." The client never
  writes subscriptions (verified: no `UserSubscription.update/create` in `src`),
  but a user can call the SDK directly (console) to set `planName`/`status` on
  their own row and unlock paid features.
- **Impact:** Revenue loss / entitlement bypass — a free user grants themselves
  premium.
- **Status:** **Fixed by PR #5** — `UserSubscription` `create`/`update`/`delete`
  are now `{ user_condition: { role: "admin" } }`, `read` is owner-or-admin. So
  only an admin/backend can change a subscription; users may read only their
  own.
- **Action:** merge and deploy PR #5. **Test:** the RLS live suite
  (`entityRls.integration.test.js`) — extend it to assert a non-admin
  `UserSubscription.update` on their own row is rejected. **[UNVERIFIED]** until
  run against the backend.

### S2 [HIGH] Plan limits are enforced only in the UI, not server-side
- **Files:** `src/lib/subscriptionEntitlements.js` — `maxCount` (properties: 1 /
  3 / 10 / ∞), `aiAssistant.monthlyUsage`, `reports.maxDownloads`, etc., plus
  `getFeatureLimit()` / `hasFeatureAccess()`. `FeatureGuard` and the pages use
  these to **hide UI**. Nothing enforces them server-side.
- **Impact / requirement #6:** the limits do **not** reflect an enforced backend
  rule. A free user (limit 1 property) can create unlimited `UserProperty`
  records by calling `base44.entities.UserProperty.create(...)` directly — the
  cap is cosmetic. Same for AI-assistant monthly usage (already flagged in the
  production audit: SmartCoach has no server-side counter).
- **Fix:** enforce quota-bearing writes through Base44 backend functions that
  check the caller's real `UserSubscription` plan + a server-side count before
  creating (e.g. a `create-property` function rejecting when
  `count >= getFeatureLimit(plan,'properties.maxCount')`). RLS alone cannot do
  numeric/count limits (Base44 RLS has no `$gt`/count operators — confirmed in
  `rls-examples.md`), so this must be a function. **Effort:** Medium.
  **Auto-fixable:** No (needs backend functions).

### S3 [HIGH] Billing page and payment history are entirely mock
- **File:** `src/pages/Billing.jsx:8` (`plans`), `:15` (`paymentHistory`),
  `:27-28` (local `billingPeriod`/`autoRenew`). None of it reads the real
  `UserSubscription` or any payment record; the auto-renew toggle persists
  nothing.
- **Impact:** Users cannot see or trust their real billing state, invoices, or
  renewal date. (Cross-referenced from the customer-dashboard inspection C3.)
- **Fix:** read `UserSubscription` via the existing `useSubscription()` context
  and render the real plan/status/renewal; back payment history with a real
  source (Stripe or an entity). **Effort:** Medium. **Auto-fixable:** No.

### S4 [HIGH] The upgrade / checkout flow is not implemented
- **File:** `src/pages/PlansAndUpgrade.jsx:23` — `// TODO: Redirect to checkout
  with plan`. Selecting a plan does nothing; there is no Stripe checkout wiring
  despite `@stripe/*` being dependencies.
- **Impact:** Users cannot actually subscribe/upgrade — the monetization path is
  missing. Combined with S1, the only *working* way state changed was the
  insecure self-update RLS hole.
- **Fix:** implement checkout via a Base44 backend function that creates the
  Stripe session and, on webhook confirmation, writes the `UserSubscription`
  server-side (never from the client). **Effort:** Large. **Auto-fixable:** No.

### S5 [MEDIUM] Subscription status → access is client-side only
- **File:** `src/contexts/SubscriptionContext.jsx` — `canAccessFeature()` checks
  `SUBSCRIPTION_STATUS[status].canAccess` and `hasFeatureAccess(plan, path)`
  client-side. A `past_due`/`cancelled` user is blocked only in the UI; the
  underlying entity reads still succeed if RLS allows (owner reads do).
- **Impact:** Access revocation on non-payment is not enforced at the data
  layer. Lower severity because the sensitive *writes* are admin-only after
  PR #5; but feature access tied to billing status is not server-enforced.
- **Fix:** gate quota/feature-bearing backend functions (S2) on both plan and
  status. **Effort:** Medium. **Auto-fixable:** No.

## What already works (verified)

- The **current plan** is read from the real backend
  (`UserSubscription.filter({ userId })`, `SubscriptionContext.jsx:20`), with a
  safe default to `free` when absent — this part correctly reflects backend
  state.
- After PR #5, users **cannot write** their subscription (S1 closed).
- `SubscriptionPlan` catalog (pricing) is public-read/admin-write after PR #5 —
  appropriate.

## Manual Base44 actions required from you

1. Merge + deploy **PR #5** so `UserSubscription` writes are admin-only (closes
   S1). Verify in the dashboard that the pushed RLS is present (steps in
   `docs/RLS_DATA_ISOLATION.md`).
2. For real enforcement of quotas/upgrades (S2/S4), backend functions + Stripe
   are required — decide whether to build these now; they can't be simulated
   client-side safely.

## Fix order (critical/high first)

1. **S1** — merge/deploy PR #5 (already done in code; needs your push + verify).
2. **S2** — server-side quota enforcement for property creation and AI usage
   (backend functions).
3. **S3** — wire Billing to real `UserSubscription`.
4. **S4** — implement Stripe checkout + webhook-driven subscription writes.

No subscription code is changed in this PR (inspection only). S1 is already
fixed in PR #5; the remaining items (S2–S5) require Base44 backend functions and
Stripe wiring that need a live backend to build and verify, so they are
documented and sequenced rather than stubbed.
