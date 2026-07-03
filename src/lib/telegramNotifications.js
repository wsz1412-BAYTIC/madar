// Telegram notification plumbing for Madar.
//
// What exists today: the user profile stores an optional `telegram_username`
// and a `notification_prefs` object ({ aiRecommendations, marketNews,
// billingAlerts }). Nothing is sent yet — delivery is a pending integration
// (see docs/TELEGRAM_NOTIFICATIONS.md for exactly what is required).
// This module is pure so the validation is unit-testable and shared between
// the signup form and the settings page.

// Telegram usernames: 5–32 chars, letters/digits/underscore, optional leading @.
const TELEGRAM_USERNAME_RE = /^@?[a-zA-Z0-9_]{5,32}$/;

export function isValidTelegramUsername(value) {
  return typeof value === 'string' && TELEGRAM_USERNAME_RE.test(value.trim());
}

/** Store canonically with the leading @ (matches how users share handles). */
export function normalizeTelegramUsername(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export const DEFAULT_NOTIFICATION_PREFS = Object.freeze({
  aiRecommendations: true,
  marketNews: true,
  billingAlerts: true,
});

/**
 * Whether a Telegram alert of the given kind may be sent to this user.
 * Requires a stored username AND the matching preference. Used by the future
 * backend sender; returning false is always the safe default.
 */
export function canNotify(user, kind) {
  if (!user || !user.telegram_username) return false;
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, ...(user.notification_prefs || {}) };
  return prefs[kind] === true;
}
