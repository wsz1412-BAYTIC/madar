# Base44 Real-Export Integration Report

Branch: `import/base44-real-export`
Source: `real-estate-agency-copy-c2b699ce-main.zip` (the real Base44 live export;
the earlier "New-changes-rest" upload had produced only two empty placeholder
files, since removed in PR #16).

## 1. What the export actually is

The ZIP is a **genuine, complete Base44 project** (has `package.json`, `src/`,
`base44/entities`, `base44/functions`). However, it is a **different, smaller
application** than this repository:

| | Export (`real-estate-agency-copy`) | This repo (`madar`) |
|---|---|---|
| Product | Lean real-estate agency site (Home, PropertySearch, Blog, Assistant) — 15 pages | STR analytics SaaS — 100+ pages/components |
| Tests | none | full Vitest suite (RLS, pricing, auth, security) |
| Pricing engine | none (simple `PriceRecommendation`) | deterministic engine + AI validation + human approval |
| Auth | Login only | Login/Register/Forgot/Reset + unified Base44 auth |
| Admin | none in UI | AdminDashboard + AdminRoute + real data |

Because of this, a wholesale import would **destroy** the security/pricing/RLS/
auth/test work this repo is explicitly required to preserve. Per the chosen
strategy (**port behaviour into madar, non-destructive**), only the genuinely
newer Base44 *subscription-onboarding and admin backend* was integrated, adapted
to madar's schema and conventions.

## 2. Schema conflict (the reason a verbatim import is impossible)

The export and madar share entity **names** but not **shapes**:

| Entity | Export fields | madar fields |
|---|---|---|
| `UserSubscription` | `owner_id`, `plan` (free/**starter**/growth/pro), `usage_count`, `usage_limit`, `payment_status`, `started_at` | `userId`, `planName` (free/**basic**/growth/pro), `price`, `billingCycle`, `startDate` |
| `AuditLog` | `acting_user_id`, `target_entity`, `previous_value` (object) | `adminId`, `targetType`, `previousValue` (string\|null) |
| write lock | `role: "system"` | `role: "admin"` (service-role) |

Base44 allows **one** schema per entity name. Adopting the export's schema would
break madar's subscription frontend and could strand existing paid records.
Resolution: keep madar's schema, **add only new nullable fields**, and port the
export's *behaviour* into madar-idiom functions.

## 3. What was integrated

### Backend functions (new)
- **`base44/functions/manage-subscription/`** — ported from the export's
  `manageSubscription`. Actions:
  - `get_current` → idempotent `ensureSubscription`: auto-provisions a **Free**
    subscription (`paymentStatus: not_required`, `startDate` set, `usageLimit`
    from plan) if none exists, else returns the existing one. Never duplicates.
  - `check_property_limit` → server-side plan cap enforcement.
  - `upgrade` → **blocked (HTTP 501)** with bilingual message; direct
    self-upgrade to a paid plan is impossible from the client.
  - Writes run through `asServiceRole` (admin) because create/update RLS is
    admin-only — a normal user cannot self-provision or self-upgrade.
- **`base44/functions/admin-operations/`** — ported from the export's
  `adminOperations`. Re-checks `user.role === 'admin'` on every request (403
  otherwise). Actions: `list_users`, `manage_user` (change_role / delete_user,
  both with self-mutation guards), `list_subscriptions`, `update_subscription`
  (whitelisted fields only), `get_customer_properties`,
  `get_customer_recommendations`, `list_audit_logs`. Every sensitive mutation
  writes an `AuditLog` entry (actor, target, before/after, timestamp, reason).
  This completes the previously-deferred "backend admin mutations + AuditLog"
  work.

### Pure, tested logic (canonical + mirrored)
- `src/lib/subscriptionProvisioning.js` (+ mirror in the function dir)
- `src/lib/adminMutations.js` (+ mirror in the function dir)
- Mirror-sync enforced by `src/lib/functionMirrors.test.js`.

### Entity (additive only)
- `UserSubscription.jsonc`: added nullable `paymentStatus`
  (`paid|pending|failed|none|not_required`, default `none`), `usageCount`
  (default 0), `usageLimit`. **No existing field changed; `required` unchanged.**

### Frontend
- `SubscriptionContext.jsx`: loads/refreshes via `manage-subscription`
  `get_current` (real auto-provisioning), with a graceful in-memory Free
  fallback if the function is unreachable.
- `Billing.jsx`: shows the **real current plan** (Free by default) with a "no
  payment required" note; upgrade buttons call the blocked backend action and
  surface the bilingual "unavailable" message instead of a fake checkout or a
  broken route; fabricated payment-history rows replaced with an honest empty
  state.

## 4. Verification of the requested items

| # | Item | Status |
|---|---|---|
| a | Free-plan auto-provisioning | ✅ `ensureSubscription` in `get_current` |
| b | Idempotent subscription creation | ✅ returns existing before creating |
| c | `payment_status = not_required` for Free | ✅ `buildFreeSubscription` |
| d | `started_at` | ✅ `startDate` set at provisioning |
| e | Paid upgrade protection | ✅ `upgrade` → 501; write RLS admin-only |
| f | Billing shows Free as current | ✅ `selectCurrentPlanKey` drives the UI |
| g | Arabic + English labels | ✅ bilingual in function + Billing |
| h | Admin & route protection | ✅ `admin-operations` 403 gate + existing AdminRoute |

## 5. Not integrated (and why)
- Export's public real-estate site (Home/Blog/PropertySearch/…), its
  `Agent`/`Property`/`Inquiry`/`BlogPost`/`Testimonial` entities, and its simpler
  `PriceRecommendation`/`RecommendationHistory` — these belong to a different
  product and would replace/duplicate madar's app. Excluded.
- The export's `accept_recommendation` action — collides with madar's pricing
  engine (`generate-price-recommendation` / `review-price-recommendation`).
  madar's human-approval flow is authoritative; not overwritten.

## 6. Required manual Base44 actions (cannot be done from this repo)
These are external Base44 CLI/dashboard actions the maintainer must run to make
the ported behaviour live:
1. Push the updated entity: `npx base44 entities push` (adds the three new
   nullable `UserSubscription` fields — additive, safe for existing records).
2. Deploy the two new functions: `manage-subscription` and `admin-operations`.
3. Confirm the Base44 role model exposes `asServiceRole` as admin (already relied
   upon by the existing pricing functions).

No secrets, payment credentials, or destructive migrations are required. Existing
paid subscriptions are untouched (no field removed/renamed; provisioning only
creates a record when none exists).

## 7. Checks (this branch vs `main`)
- Tests: **194 passed, 9 skipped** (was 166; +28 new subscription/admin/mirror tests).
- Lint: 39 errors — identical to `main` (0 new).
- Typecheck: 137 errors — byte-identical set to `main` (0 new, 0 removed).
- Build: succeeds. npm audit: 0 vulnerabilities.
