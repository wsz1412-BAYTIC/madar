# Madar — Production Readiness Audit

**Auditor:** Claude Fable 5
**Date:** 2026-07-02
**Branch/commit audited:** `main` @ `2d5d4a3` (merge of PR #1, the AI recommendation engine)
**Scope:** Full repository — frontend/backend architecture, auth, RLS, API/server functions, AI engine, pricing, secrets, dependencies, RTL UX, responsiveness, states, a11y, performance, logging, deployment.

## How to read this report

- Every finding cites an exact file/line **verified against the code on `main` at the commit above**.
- Claims that could **not** be verified from the repository alone (e.g. runtime behavior of the external `aimadar.com` backend, or how Base44 enforces RLS server-side) are explicitly marked **[UNVERIFIED]** with what evidence *is* available.
- **This report does not certify the application as secure or production-ready.** It documents defects found in a time-boxed static inspection plus the existing automated tests. Absence of a finding is not evidence of correctness. Several areas (real backend auth, deployed RLS enforcement, live AI output) require a running environment to verify and were not exercised.

### Important scope note on already-open work

Three PRs are open but **not merged into `main`**, so the issues they address are still present on the audited commit:

- **PR #2** (`feature/price-override-safety-check`) — adds a bounds check to the price-apply flow.
- **PR #3** (`chore/dependency-security-audit`) — resolves the 20 `npm audit` vulnerabilities.
- The AI-engine review fixes (RLS on `PriceRecommendation`, hallucination-guard hardening) *are* merged (part of PR #1).

Where a finding below is already addressed by an open PR, it is noted so it is not double-counted as new work.

---

## Top 10 highest-impact issues (ranked)

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | **Critical** | `UserProperty` (and 6 of 7 entities) have **no RLS** — any authenticated user can read/write any other user's property & billing data | `base44/entities/UserProperty.jsonc` |
| 2 | **Critical** | The wired `/login` route uses a legacy auth client that serializes the login request incorrectly — production email/password login appears non-functional | `src/lib/api.js:52`, `src/contexts/AuthContext.jsx:14` |
| 3 | **High** | No route-level authorization — `ProtectedRoute` exists but is never used; every dashboard/admin route renders for anyone | `src/App.jsx:79-103` |
| 4 | **High** | Two parallel, inconsistent auth systems (Base44 vs legacy `aimadar.com`) with a token-key mismatch | `src/lib/api.js` vs `src/lib/AuthContext.jsx` |
| 5 | **High** | 20 known dependency vulnerabilities (9 high) on `main` | `package-lock.json` |
| 6 | **High** | Core dashboards render **mock / `Math.random()` data** presented as real revenue/occupancy | `src/components/dashboard/RevenueChart.jsx:12`, `src/pages/{Analytics,Revenue,Properties,Alerts}.jsx` |
| 7 | **High** | No React error boundary anywhere — any render error white-screens the entire SPA | (absent repo-wide) |
| 8 | **Medium** | Auth tokens stored in `localStorage` (both systems) — readable by any XSS | `src/lib/api.js:3-11`, `src/lib/app-params.js` |
| 9 | **Medium** | SmartCoach AI plan-gating & usage limits enforced only via prompt text, not code | `src/components/widgets/SmartCoachWidget.jsx:74` |
| 10 | **Medium** | No code-splitting → single 1.53 MB JS bundle (423 KB gzip) blocks first paint | `src/App.jsx` (all static imports), build output |

---

## Detailed findings

### 1. [CRITICAL] Missing Row-Level Security on `UserProperty` and most entities

- **Location:** `base44/entities/UserProperty.jsonc` (no `rls` block); same for `User.jsonc`, `UserSubscription.jsonc`, `AuditLog.jsonc`, `AdminUser.jsonc`, `SupportTicket.jsonc`, `SubscriptionPlan.jsonc`. Only `base44/entities/PriceRecommendation.jsonc` defines `rls`.
- **User/business impact:** A tenant can read or modify **any other tenant's** properties, pricing inputs, operating costs, revenue figures, subscription/billing records, and support tickets. For a multi-tenant SaaS this is a full cross-tenant data-isolation break.
- **Security impact:** Confidentiality and integrity breach across all tenants. The frontend calls `base44.entities.UserProperty.filter({ userId })` (e.g. `src/pages/UserDashboard.jsx`, `src/contexts/SubscriptionContext.jsx`) but the `userId` filter is a **client-supplied query**, not an enforced boundary — a user can pass any `userId`.
- **Evidence / verification:** Entity files contain no `rls` key (grep: only `PriceRecommendation.jsonc` matches). Base44's own docs (bundled at `.agents/skills/base44-cli/references/entities-create.md`) state: *"If no RLS is defined, all records are accessible to all users."* **[PARTIALLY UNVERIFIED]** — the actual deployed enforcement depends on Base44 dashboard-side rules that may exist independently of these files; that could not be checked without dashboard access. If the dashboard has no compensating rules, this is exploitable.
- **Recommended fix:** Add owner-scoped `rls` to `UserProperty`, `UserSubscription`, `SupportTicket` (`read/update/delete: { "data.userId": "{{user.id}}" }` or `created_by`-based, plus admin `$or`), and admin-only rules to `AdminUser`/`AuditLog`, mirroring the pattern already used in `PriceRecommendation.jsonc`. Verify each in the Base44 dashboard after `entities push`.
- **Effort:** Medium (entity edits are small; careful per-entity review + redeploy + verification needed).
- **Auto-fixable safely?** No — security-critical; each rule must be reviewed and verified against real multi-user access, not applied blindly.
- **Test to verify:** Integration test with two users: user A creates a property; assert user B's client cannot `get`/`filter`/`update` it (expect empty/deny). Static test asserting every entity file has an `rls` block (extend `src/lib/security.test.js`).

### 2. [CRITICAL] Production login path appears broken (legacy auth client)

- **Location:** `src/App.jsx:59` routes `/login` → `MadarLogin` → `useMadarAuth().login` (`src/contexts/AuthContext.jsx:14`) → `api.post('/auth/login', form, {headers})` (`src/lib/api.js:52`).
- **The bug (verifiable from code):**
  - `api.post` is defined as `(endpoint, data) => request(endpoint, { method:'POST', body: JSON.stringify(data) })` — it **ignores the third `headers` argument**, and it **`JSON.stringify`s a `URLSearchParams`**, which produces `"{}"`. Verified: `JSON.stringify(new URLSearchParams([['username','a'],['password','b']]))` === `"{}"`.
  - Net effect: the login request is sent as `Content-Type: application/json` with body `{}` — no credentials reach the server as intended.
- **User/business impact:** If `MadarLogin` is the real production login, **users cannot log in** via email/password. This is a launch blocker for that path.
- **Security impact:** Indirect — a broken auth client can mask other issues; also there is a Google OAuth path via `base44.auth.loginWithProvider` that may still work, creating inconsistent session state between the two auth systems (see #4).
- **Evidence / [UNVERIFIED] portion:** The client-side serialization bug is verified. Whether the `https://aimadar.com/api` backend is even the intended production backend (vs. Base44's own `base44.auth`) **could not be verified** — the two systems coexist (see #4). If Base44 auth is the intended path, `MadarLogin` is wired to the wrong system.
- **Recommended fix:** Decide on one auth system. If Base44 is canonical, route `/login` to a component using `base44.auth.loginViaEmailPassword` (already used in `src/pages/Login.jsx:22`). If the legacy API is canonical, fix `api.post` to pass headers and send `form` (a `URLSearchParams`) directly as the body.
- **Effort:** Small (routing/serialization) to Medium (if consolidating auth systems).
- **Auto-fixable safely?** No — requires a product decision on which auth system is authoritative.
- **Test to verify:** E2E login test against the chosen backend asserting a session is established; unit test asserting the login request carries the credentials in the expected content type.

### 3. [HIGH] No route-level authorization

- **Location:** `src/App.jsx:79-103` — dashboard routes (`/dashboard`, `/properties`, `/analytics`, `/revenue`, `/billing`, `/admin`, …) are rendered directly under `<AppLayout />` with no guard. `src/components/ProtectedRoute.jsx` exists but is **not imported or used** in `App.jsx` (verified by grep).
- **User/business impact:** Unauthenticated users reach dashboard/admin UI shells directly by URL. Data fetches may fail without a token, but the app structure, and any client-rendered mock data (see #6), is exposed.
- **Security impact:** Defense-in-depth gap. The real data boundary is supposed to be backend RLS — which is itself largely missing (#1). Two missing layers compound.
- **Mitigating detail (verified):** `AdminDashboard.jsx:34-36` *does* self-check `AdminUser` membership and redirects; `Admin.jsx` similarly. So the admin dashboards are individually gated, but the generic dashboard routes are not.
- **Recommended fix:** Wrap the authenticated route group in `ProtectedRoute` (or a Base44-auth equivalent) that redirects unauthenticated users to `/login`.
- **Effort:** Small.
- **Auto-fixable safely?** Partly — wrapping routes is mechanical, but must be validated so it doesn't lock out the OAuth/session bootstrap flow.
- **Test to verify:** E2E: visit `/dashboard` unauthenticated → expect redirect to `/login`.

### 4. [HIGH] Two parallel auth systems with a token-key mismatch

- **Location:** Base44 auth (`src/lib/AuthContext.jsx`, `base44.auth.*`, token in `base44_access_token`) vs legacy Madar auth (`src/contexts/AuthContext.jsx` + `src/lib/api.js`, token in `madar_token`/`madar_access_token`).
- **Verifiable inconsistency:** In `src/lib/api.js`, `setToken` **writes** to `madar_token` (line 7) but on the else-branch **removes** `madar_access_token` (line 8), and `getToken` **reads** `madar_access_token` (line 11). So a token saved by `setToken` is never returned by `getToken` — they use different keys.
- **User/business impact:** Session state can desync — a user "logged in" under one system is "logged out" under the other; tokens written aren't read back. Unpredictable auth behavior.
- **Security impact:** Ambiguous session ownership; harder to reason about logout/expiry (a token may persist in one store after "logout" clears the other).
- **Recommended fix:** Consolidate to one auth system and one token key; delete the unused one.
- **Effort:** Medium.
- **Auto-fixable safely?** No — product decision.
- **Test to verify:** Unit test: `setToken(x); expect(getToken()).toBe(x)`. E2E: login → refresh → still authenticated; logout → token cleared everywhere.

### 5. [HIGH] 20 known dependency vulnerabilities on `main`

- **Location:** `package-lock.json` (verified: `npm audit` on `main` reports **20 vulnerabilities — 1 low, 10 moderate, 9 high**).
- **Impact:** Includes prod-reachable transitive issues in the bundled `@base44/sdk` socket.io chain (`socket.io-parser`, `engine.io-client`) and `react-router` (open-redirect), plus many dev-only tooling CVEs.
- **Status:** **Already fixed in open PR #3** (`chore/dependency-security-audit`), which takes audit to 0 without `--force`. Not yet merged, so still present on `main`.
- **Recommended fix:** Merge PR #3.
- **Effort:** Trivial (merge).
- **Auto-fixable safely?** Yes — the safe subset already applied in PR #3; verified lint/typecheck/tests/build all pass there.
- **Test to verify:** `npm audit` reports 0; full check suite green (already demonstrated in PR #3).

### 6. [HIGH] Core dashboards display mock / random data as if real

- **Location:** `src/components/dashboard/RevenueChart.jsx:12` (`Math.random()` revenue); `src/pages/Analytics.jsx:9-23` (static `revenueData`/`occupancyData`/`competitorData`); `src/pages/Revenue.jsx:7-16` (static breakdown); `src/pages/Properties.jsx:13` (`mockProperties`); `src/pages/Alerts.jsx:8,91` (`mockAlerts`).
- **User/business impact:** Users see fabricated revenue, occupancy, competitor, and property numbers presented as their own data. For a paid analytics product this is a serious trust/accuracy defect and potential misrepresentation.
- **Security impact:** None directly; business-integrity and compliance risk.
- **Evidence:** Verified by grep; `RevenueChart.jsx` ignores its `properties` prop and generates random values.
- **Recommended fix:** Wire these views to real `base44.entities.*` data (as `UserDashboard.jsx` partially does), or clearly label as demo/sample until backed by real data. Do not ship fabricated numbers as live analytics.
- **Effort:** Large (real data wiring across multiple pages).
- **Auto-fixable safely?** No — requires real data sources and product decisions.
- **Test to verify:** Assert each chart/page renders values derived from injected entity data, not constants/`Math.random`.

### 7. [HIGH] No React error boundary

- **Location:** None exists (verified: no `ErrorBoundary`/`componentDidCatch`/`getDerivedStateFromError` anywhere; `src/App.jsx` has no boundary wrapping routes).
- **User/business impact:** Any uncaught render error in any component blanks the entire app (white screen) with no recovery UI — a single bad API shape or null field can take down the whole session.
- **Security impact:** None directly; availability risk.
- **Recommended fix:** Add a top-level error boundary around the router with an Arabic/English fallback UI and a reload action; optionally per-route boundaries.
- **Effort:** Small.
- **Auto-fixable safely?** Yes (additive, low risk).
- **Test to verify:** Render a child that throws; assert the fallback UI appears instead of a crash.

### 8. [MEDIUM] Auth tokens in `localStorage`

- **Location:** `src/lib/api.js:3,7` (`madar_token`), `src/lib/app-params.js` (`base44_access_token` via storage), `src/lib/AuthContext.jsx`.
- **User/business impact:** None in normal use.
- **Security impact:** Any XSS (and the app renders user/AI-generated Arabic content, `react-markdown`, and formerly `react-quill`) can exfiltrate the token from `localStorage`, enabling session hijack. `httpOnly` cookies are not used.
- **Evidence:** Verified token reads/writes to `localStorage`. **[UNVERIFIED]** whether Base44's SDK offers a cookie-based option — not confirmed from the repo.
- **Recommended fix:** Prefer `httpOnly`, `Secure`, `SameSite` cookies if the backend supports it; otherwise minimize token lifetime and ensure strict output escaping everywhere user/AI content is rendered.
- **Effort:** Medium (depends on backend support).
- **Auto-fixable safely?** No.
- **Test to verify:** Confirm token is not readable via `localStorage`/JS after login; XSS-injection test on AI/markdown render surfaces.

### 9. [MEDIUM] SmartCoach AI: plan-gating and usage limits not enforced in code

- **Location:** `src/components/widgets/SmartCoachWidget.jsx:74` — calls `base44.integrations.Core.InvokeLLM` with a prompt that *instructs the model* "Only explain features included in their subscription plan." No code checks `getFeatureLimit(plan, 'aiAssistant.monthlyUsage')` or counts usage (verified: no `monthlyUsage`/`usageCount` reference in the widget).
- **User/business impact:** Entitlement (`aiAssistant.monthlyUsage`: 10/50/200/∞ in `subscriptionEntitlements.js`) is defined but unenforced — free users can call the AI unlimited times; paid-tier boundaries are advisory only.
- **Security impact:** Prompt-based gating is bypassable (prompt injection / jailbreak) and can leak higher-tier feature descriptions; unbounded calls are a cost-abuse vector.
- **Recommended fix:** Enforce the monthly usage limit and plan gating server-side (a Base44 function that checks entitlement + a counter before invoking the LLM), not via prompt instructions.
- **Effort:** Medium.
- **Auto-fixable safely?** No — needs a server-side counter/entitlement check.
- **Test to verify:** Integration test: free user exceeding the monthly cap is refused; a lower tier cannot elicit higher-tier feature content.

### 10. [MEDIUM] No code-splitting; single large bundle

- **Location:** `src/App.jsx` imports all ~40 pages statically (verified: no `React.lazy`/dynamic import). Build output: `dist/assets/index-*.js` = **1.53 MB (423 KB gzip)**, single chunk; Vite emits the >500 KB chunk warning.
- **User/business impact:** Slow first load, especially on mobile networks common to the target market — the entire app (Three.js, jspdf, recharts, framer-motion, leaflet) downloads before first paint.
- **Security impact:** None.
- **Recommended fix:** Route-level `React.lazy` + `Suspense`; `manualChunks` to split heavy libs (`three`, `jspdf`, `recharts`, `leaflet`). Also remove unused heavy deps (`three`, `jspdf`, `lodash`, `@stripe/*` appear unimported in `src/` — verified by grep).
- **Effort:** Medium.
- **Auto-fixable safely?** Partly — lazy-loading routes is mechanical and testable; dependency removal needs confirmation each is truly unused.
- **Test to verify:** Build shows multiple chunks; the initial chunk shrinks materially; app still routes/renders (smoke test).

---

## Additional findings (below top 10)

### 11. [MEDIUM] `/manifest.json` referenced but missing
- **Location:** `index.html:8` links `/manifest.json`; `public/` contains only `madar-logo.png` (verified — no `manifest.json` anywhere).
- **Impact:** 404 on every load; broken PWA/installability and some mobile "add to home screen" behavior.
- **Fix:** Add a valid `public/manifest.json` or remove the link. **Effort:** Trivial. **Auto-fixable:** Yes. **Test:** Load app; no 404 for manifest; Lighthouse PWA check.

### 12. [MEDIUM] Initial HTML is `lang="en"`/LTR; RTL applied only after JS runs
- **Location:** `index.html:2` (`<html lang="en">`); direction set at runtime in `src/contexts/LanguageContext.jsx:446` (`document.documentElement.dir = ...`).
- **Impact:** Arabic users get a flash of LTR/English layout before hydration; SSR/crawlers/no-JS see LTR. For an Arabic-first product this is a UX and SEO issue.
- **[UNVERIFIED]:** Severity of FOUC depends on device speed; not measured.
- **Fix:** Persist last language and set `dir`/`lang` on the server-rendered/`index.html` shell (or an inline pre-hydration script). **Effort:** Small. **Auto-fixable:** Partly. **Test:** First paint in Arabic renders RTL.

### 13. [MEDIUM] Accessibility gaps
- **Location:** Across `src/pages` and `src/components`: only 8 `aria-*` usages in page/nav/pricing components; 11 `<img>` tags but only 4 with `alt` (verified by grep).
- **Impact:** Screen-reader and keyboard users poorly served; images lack alt text; likely WCAG failures. Not a full audit — **[UNVERIFIED]** contrast, focus order, and form-label completeness were not exhaustively checked.
- **Fix:** Add `alt` to all images, `aria-label`s to icon-only buttons, ensure form inputs have associated labels, verify focus management in dialogs. **Effort:** Medium. **Auto-fixable:** Partly (alt/aria additions). **Test:** axe-core automated pass + manual keyboard/screen-reader walkthrough.

### 14. [MEDIUM] Applied price not bounds-checked (pre-PR #2)
- **Location:** `src/lib/recommendationWorkflow.js` `apply` branch on `main` accepts any positive `appliedPrice` with no relation to `recommendedPriceMin/Max`.
- **Impact:** A fat-fingered price (extra digit, wrong currency) is accepted silently.
- **Status:** **Already addressed in open PR #2** (adds `assessAppliedPrice` + confirmation + rejection of unrealistic values). Merge to resolve. **Effort:** Trivial (merge). **Test:** covered by PR #2's suite.

### 15. [LOW] No offline handling
- **Location:** No `navigator.onLine`/offline UI anywhere (verified).
- **Impact:** On connectivity loss, fetches fail with generic toasts; no offline indicator or retry affordance.
- **Fix:** Add an online/offline indicator and retry UX for key mutations. **Effort:** Small–Medium. **Auto-fixable:** Yes (additive). **Test:** simulate offline; assert indicator + graceful failure.

### 16. [LOW] No CI pipeline
- **Location:** No `.github/workflows/` (verified). `npm test` exists but nothing runs it automatically; the mirror-drift guard (`functionMirrors.test.js`) and security tests only run if someone runs them locally.
- **Impact:** Regressions (including the Deno-function mirror drift the tests are meant to catch) can merge unnoticed.
- **Fix:** Add a CI workflow running `lint`, `typecheck`, `test`, `build` on PRs. **Effort:** Small. **Auto-fixable:** Yes. **Test:** workflow runs green on a PR.

### 17. [LOW] Error logging may capture response objects
- **Location:** `src/lib/AuthContext.jsx:51,82,102`, `src/pages/UserDashboard.jsx:63` — `console.error('...', error)` logs full error objects to the browser console.
- **Impact:** Potential leakage of backend error details/PII into the console; minor. No token logging was found (verified — no `console.*` referencing token/password).
- **Fix:** Log sanitized messages; strip response bodies. **Effort:** Trivial. **Auto-fixable:** Yes. **Test:** assert logs contain no sensitive fields.

### 18. [LOW] `language`-dependent property refetch
- **Location:** `src/pages/PriceRecommendations.jsx:37` — the property-loading `useEffect` lists `lang` in its deps, so toggling UI language re-fires the network fetch.
- **Impact:** Minor wasted request on language toggle.
- **Fix:** Remove `lang` from deps (only used for the error toast string). **Effort:** Trivial. **Auto-fixable:** Yes. **Test:** toggling language issues no new properties request.

---

## Areas inspected but **not** verifiable without a running environment

The following are explicitly **[UNVERIFIED]** — do not treat their absence from the findings as a pass:

- **Real backend auth behavior** (`https://aimadar.com/api`) — not reachable/tested here.
- **Deployed RLS enforcement** — Base44 dashboard rules may differ from the repo's `.jsonc` files; only the repo files were checked.
- **Live OpenAI call** — `api.openai.com` is blocked by this environment's egress policy; the AI path was exercised only against a local stand-in and the existing tests, never the real model.
- **Real Arabic RTL rendering across all pages** — only `RecommendationCard` was rendered/screenshotted; other pages were read, not visually verified.
- **Mobile responsiveness on real devices** — Tailwind responsive classes are present on key pages (verified by grep) but layouts were not tested at real breakpoints.
- **Performance under load, Lighthouse scores, contrast ratios** — not measured.

## Overall assessment

**The application is not demonstrated to be production-ready.** Two Critical findings (cross-tenant data exposure via missing RLS #1; apparently broken production login #2) are, on the evidence available, launch blockers and must be resolved and verified in a live environment before deployment. The AI recommendation engine and its guardrails are comparatively well-covered by tests, and the dependency and price-bounds issues already have fixes staged in open PRs (#2, #3) awaiting merge. No claim of security or readiness should be made until at least findings #1–#4 are fixed **and verified against a running multi-user environment**.
