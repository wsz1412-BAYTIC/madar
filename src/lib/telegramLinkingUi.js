// PR 1B — pure presentation helpers for the Telegram linking Settings card.
//
// These are the deterministic, framework-free pieces of the linking UI so they
// can be unit-tested in isolation and reused by TelegramLinkCard.jsx. They never
// touch sensitive fields — the backend `status` projection only ever contains
// { status, linked, linked_at, expires_at }, and nothing here reads or surfaces
// chat_id, telegram_user_id, or the token hash.

export const LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes (matches the backend)

// Unwrap a base44.functions.invoke result: the SDK returns { data } but tests and
// some paths hand back the payload directly.
export function unwrap(res) {
  return (res && res.data) || res || {};
}

/**
 * Whitelisted status projection for rendering. Reads ONLY the four safe fields
 * the backend returns — never chat/telegram identifiers or the token hash.
 */
export function readLinkStatus(res) {
  const link = unwrap(res).link || {};
  const status = link.status || 'none';
  return {
    status,
    linked: link.linked === true || status === 'linked',
    linkedAt: link.linked_at || null,
    expiresAt: link.expires_at || null,
  };
}

/** Read a create_link response into the deep link + expiry we hold in memory. */
export function readCreateLink(res) {
  const data = unwrap(res);
  return { deepLink: data.deep_link || null, expiresAt: data.expires_at || null };
}

/**
 * True ONLY for `https://t.me/...` deep links. Any other scheme (http, tg,
 * javascript, data) or host is rejected before we ever render it as a link.
 */
export function isSafeDeepLink(url) {
  if (typeof url !== 'string' || !url) return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === 'https:' && parsed.hostname === 't.me';
}

/**
 * Classify an invoke failure into a UI phase. A 503 / integration_unavailable
 * (bot secrets not configured) is a distinct, calm "unavailable" state; anything
 * else is a generic error. Never surfaces the raw backend message.
 */
export function classifyLinkError(err) {
  const data = (err && (err.response?.data || err.data)) || {};
  const httpStatus = err?.response?.status || err?.status;
  if (httpStatus === 503 || data.reason === 'integration_unavailable') return 'unavailable';
  return 'error';
}

function toMillis(value, fallback) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : fallback;
}

/** Whole seconds remaining until expiry, clamped at 0. */
export function secondsUntil(expiresAt, now = Date.now()) {
  if (!expiresAt) return 0;
  const exp = new Date(expiresAt).getTime();
  if (!Number.isFinite(exp)) return 0;
  return Math.max(0, Math.floor((exp - toMillis(now, Date.now())) / 1000));
}

/** True once a pending link's expiry has been reached. Missing/invalid ⇒ expired. */
export function isLinkExpired(expiresAt, now = Date.now()) {
  return secondsUntil(expiresAt, now) <= 0;
}

/** Format a seconds count as MM:SS for the countdown. */
export function formatCountdown(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/** Localized linked date (or null when absent/invalid — never throws). */
export function formatLinkedDate(iso, lang = 'ar') {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
