# Customer Dashboard Inspection

Scope: the authenticated customer-facing surface — property, analytics,
recommendations, profile, and subscription/billing pages — covering routes,
permissions, loading/error/empty states, real-vs-mock data, and Arabic RTL /
mobile usability. Inspected on `main` @ `2d5d4a3`.

Verification note: this is static inspection plus the automated test suite. No
live backend was available (Base44 CLI/login and the app's network calls could
not run here), so anything requiring a running app is marked **[UNVERIFIED]**.
No claim is made that these pages are production-ready.

## Sequencing with the open PRs

Two critical fixes for this surface already live in open PRs and are **not**
duplicated here:
- **PR #5** (RLS) — makes `UserProperty`/`UserSubscription` reads owner-scoped
  server-side (this page's `filter({ userId })` calls are otherwise not a
  boundary).
- **PR #6** (auth) — routes login/registration, gates these routes behind
  `ProtectedRoute`, and migrates `MadarSettings`/`Calculator`/`Dashboard` off
  the legacy auth hook.

Where a fix below touches a file also edited by PR #6 (e.g. `MadarSettings`),
it is flagged **"apply after PR #6"** to avoid a merge conflict.

## Findings (ranked)

### C1 [HIGH] Profile "Save" silently discards everything except language
- **File:** `src/pages/MadarSettings.jsx:22-24` — `handleSave` only calls
  `setLang(form.language)`. Name, email, phone, and the three notification
  toggles are collected into `form` but **never persisted** (no
  `base44.auth.updateMe(...)`, no entity write).
- **Impact:** A user edits their profile, clicks Save, sees a success-styled
  button, and loses every change on reload. Classic false affordance / data
  loss.
- **Fix:** make `handleSave` async and call
  `base44.auth.updateMe({ full_name: form.name, phone: form.phone })` (the SDK's
  documented profile-update method), keep the language change, and show a
  success/error toast. Notification preferences have **no backing field
  anywhere** (not in `User` or any entity) — either add a `UserProfile`/prefs
  field and persist them, or remove the toggles until they're backed; do not
  keep pretending to save them.
- **Effort:** Small (name/phone/language) + Small–Medium (notification prefs
  need a schema field). **Auto-fixable:** name/phone/language yes; prefs no
  (needs an entity field decision). **Apply after PR #6** (that PR also edits
  this file's auth import). **Test:** render, change name, Save →
  `updateMe` called with the new value; assert an error toast on rejection.

### C2 [HIGH] Analytics, Revenue, and Properties render mock/static data as real
- **Files:** `src/pages/Analytics.jsx:9-23` (static `revenueData`/
  `occupancyData`/`competitorData`), `src/pages/Revenue.jsx:7-16` (static
  breakdown/projection), `src/pages/Properties.jsx:13` (`mockProperties`),
  `src/components/dashboard/RevenueChart.jsx:12` (`Math.random()`).
- **Impact:** Paid analytics screens show fabricated revenue, occupancy,
  competitor, and property numbers as if they were the user's own data. Trust /
  accuracy / potential-misrepresentation risk. Also duplicated from the main
  production audit (finding #6) — restated here at page granularity.
- **Fix:** wire to real `base44.entities.*` (as `UserDashboard.jsx` already
  does) or clearly label as sample data until backed. **Effort:** Large (real
  data + likely a booking/history data source that doesn't exist yet).
  **Auto-fixable:** No — needs real data sources and product decisions.
  **Test:** each view renders values derived from injected entity data, not
  constants/`Math.random`.

### C3 [HIGH] Billing/subscription page is entirely mock
- **File:** `src/pages/Billing.jsx:8` (`plans`), `:15` (`paymentHistory`),
  `:27-28` (`billingPeriod`/`autoRenew` local state).
- **Impact:** Shows hardcoded plans and fake payment history instead of the
  user's real `UserSubscription`; the auto-renew toggle persists nothing. A user
  cannot see or trust their actual billing state.
- **Status:** Belongs to the **subscriptions** work-stream (separate PR per the
  task). Deferred there; flagged here for completeness. See also requirement #6
  (plan limits must reflect real backend state).
- **Effort:** Medium–Large. **Auto-fixable:** No.

### C4 [MEDIUM] Property import depends on a legacy, likely-dead backend
- **File:** `src/pages/Properties.jsx:79` — `api.post('/properties/import', …)`
  hits `https://aimadar.com/api`, the legacy backend the app no longer
  authenticates against (see PR #6, which strips auth from `lib/api.js`).
- **Impact:** The "Import listing" feature likely fails in production
  **[UNVERIFIED]** — the endpoint's status could not be checked. The rest of the
  Properties page is mock data (C2), so import is the only "real" action and
  it's pointed at a retired backend.
- **Fix:** migrate `/properties/import` to a Base44 backend function; until
  then, disable the import affordance with a clear "coming soon" state rather
  than letting it throw. **Effort:** Medium. **Auto-fixable:** No (needs a
  backend function). **Test:** import button disabled / shows the placeholder
  state when the feature flag is off.

### C5 [MEDIUM] Missing loading/error/empty states on data-less pages
- **Files:** `Revenue.jsx`, `Billing.jsx`, `MadarSettings.jsx` have **no**
  loading/error/empty handling (0 markers); `Analytics.jsx` minimal. They get
  away with it today only because they render static data (C2/C3) — once wired
  to real fetches they will need these states. `UserDashboard.jsx` and
  `PriceRecommendations.jsx` **do** handle loading/empty/error correctly
  (verified), and `UserDashboard` guards divide-by-zero on empty property lists
  (`userProps.length > 0`, line 44) — good patterns to copy.
- **Impact:** Future real-data wiring will crash or show blank/janky UI on
  slow networks, errors, or new users with no data.
- **Fix:** add loading skeletons, error, and empty states as each page is wired
  to real data (do it together with C2/C3). **Effort:** Small per page.
  **Auto-fixable:** Partly.

### C6 [LOW] RTL/mobile
- **Verified (grep):** RTL handling (`isRTL` / `lang === 'ar'` / `dir=`) is
  present on all inspected pages (UserDashboard 11, Properties 16, Analytics 10,
  Billing 12, PriceRecommendations 12) except **MadarSettings (1)** which leans
  entirely on the global `dir` and `t()` — acceptable but the phone field
  correctly forces `dir="ltr"`. Responsive `sm:`/`lg:` classes are present on
  UserDashboard/Properties/Analytics/Billing; **Revenue** only uses `lg:`
  (likely cramped on small phones — **[UNVERIFIED]**, not tested at real
  breakpoints).
- **Fix:** add `sm:` breakpoints to Revenue; real-device pass once data is live.
  **Effort:** Small. **Auto-fixable:** Partly.

## Permissions on this surface

- Route protection: **none on `main`** — fixed by PR #6 (`ProtectedRoute` wraps
  the group). Until PR #6 merges, these pages render for anyone.
- Data scoping: these pages call `base44.entities.UserProperty.filter({ userId })`
  / `useSubscription()`. **The `userId` filter is a client query, not a
  boundary** — real isolation depends on RLS (PR #5). Verified: the enforcement
  gap is server-side, addressed by PR #5; the UI filter alone is not sufficient.

## What is real vs mock (summary)

| Page | Data source | State handling |
|---|---|---|
| UserDashboard | **Real** (`UserProperty.filter`) | loading/empty/error ✓, div-by-zero guarded ✓ |
| PriceRecommendations | **Real** (entity + functions) | loading/empty/error ✓ |
| Properties | **Mock** list + one real (legacy) import call | partial |
| Analytics | **Mock/static** | minimal |
| Revenue | **Mock/static** | none |
| Billing | **Mock/static** | none |
| MadarSettings (profile) | reads real `user`; **save is a no-op** (C1) | none |

## Recommended fix order (critical/high first, conflict-aware)

1. Merge **PR #5** (RLS) and **PR #6** (auth + route protection) — they remove
   the two structural gaps this surface depends on.
2. **C1** profile-save persistence — apply right after PR #6 (same file).
3. **C3** real subscription state — in the subscriptions PR.
4. **C2 / C5** real analytics/revenue/properties data + states — largest effort,
   needs a real bookings/history data source; do together.
5. **C4** migrate property import to a Base44 function (or disable it safely).

No customer-dashboard code is changed in this PR — it is inspection only,
deliberately, to avoid conflicts with the open auth/RLS PRs that already touch
these files. The concrete C1 fix will be raised as its own change once PR #6 is
merged.
