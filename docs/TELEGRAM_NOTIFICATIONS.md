# Telegram Notifications — Pending Integration

## Status: NOT live (secure account-linking backend landed — PR 1A)

**Delivery is still not live.** No user-facing menu, notifications, preferences,
or AI replies exist yet. What PR 1A adds is the *secure linking backend only*:

- **`TelegramLink` entity** — the single source of truth for a Madar account ↔
  Telegram chat link. Admin-only RLS; backend-only writes. Stores the one-time
  link token **hash** (never the raw token), the private-chat `chat_id` and
  `telegram_user_id` (server-only, never returned to the browser), and lifecycle
  status (`pending`/`linked`/`revoked`/`expired`). **`telegram_chat_id` is NOT
  written onto `User` in this phase** — TelegramLink is the only home for it.
- **`telegram-linking` function** (authenticated) — `create_link` mints a
  cryptographically random, URL-safe, single-use token (15-minute expiry, only
  the hash persisted) and returns a `t.me/<bot>?start=<token>` deep link;
  `status` returns a sanitized projection; `unlink` revokes the caller's link.
- **`telegram-webhook` function** (inbound-only) — requires the shared secret
  header `X-Telegram-Bot-Api-Secret-Token` == `TELEGRAM_WEBHOOK_SECRET`, accepts
  **private chats only**, hashes the incoming `/start` token, and completes the
  link with an **atomic compare-and-set** so a token is single-use. Enforces one
  Telegram chat / one Telegram user → at most one Madar account.

Security guarantees: raw tokens, chat ids and telegram user ids are never logged;
errors are generic (no account enumeration); link/unlink actions are audited with
PII-minimized details.

Secrets required to operate the linking backend (Base44 → Secrets, never `VITE_`):
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` (set as
the Telegram `setWebhook` secret_token).

The legacy activation notes below describe the *older* single-User-field plan and
remain for reference; the linking flow above supersedes step 2's chat-id capture.

## Status: legacy activation notes (reference)

The app now **collects and stores** everything needed on the user profile:

- `telegram_username` (optional, validated as `@username`, 5–32 chars) — set at
  signup or in Settings → Notifications.
- `notification_prefs` — `{ aiRecommendations, marketNews, billingAlerts }`
  booleans, editable in Settings.

**No Telegram message is sent anywhere in the codebase.** The shared gate
`canNotify(user, kind)` in `src/lib/telegramNotifications.js` returns false
unless a username is stored *and* the matching preference is on — the future
sender must go through it.

## What is required to activate delivery

1. **Create a Telegram bot** via @BotFather; store the token as a Base44
   secret (Dashboard → Secrets), e.g. `TELEGRAM_BOT_TOKEN`. Never expose it
   to the frontend (no `VITE_` prefix).
2. **Chat-ID capture**: Telegram bots cannot message a user by username alone.
   The user must start the bot once (`/start`); a backend function receives
   the webhook update and stores `telegram_chat_id` on the matching user
   (match by the username they saved). Add a "Connect Telegram" button in
   Settings that deep-links to `https://t.me/<bot>?start=<signed-user-token>`.
3. **Backend sender function** (`base44/functions/send-telegram-alert/`):
   - Service-role only; re-checks `canNotify(user, kind)`.
   - Calls `https://api.telegram.org/bot<token>/sendMessage` with the stored
     `telegram_chat_id`.
   - Called from: recommendation generation (aiRecommendations), market-signal
     ingestion (marketNews), and admin billing mutations (billingAlerts).
4. **Rate limiting + failure handling**: dedupe per user/day, back off on 429,
   clear `telegram_chat_id` on 403 (user blocked the bot) and surface a
   "reconnect" state in Settings.
5. **Audit**: log sends (kind, user, timestamp) — no message bodies with
   pricing data beyond what the user already sees in-app.
