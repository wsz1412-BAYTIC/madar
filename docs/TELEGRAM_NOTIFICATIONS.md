# Telegram Notifications — Pending Integration

## Status: NOT live

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
