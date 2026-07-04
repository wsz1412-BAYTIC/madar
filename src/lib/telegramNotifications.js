// Telegram notification plumbing for Madar.
// Pure validation logic — shared between signup form and settings.

const TELEGRAM_USERNAME_RE = /^@?[a-zA-Z0-9_]{5,32}$/;

export function isValidTelegramUsername(value) {
  return typeof value === "string" && TELEGRAM_USERNAME_RE.test(value.trim());
}

export function normalizeTelegramUsername(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export const DEFAULT_NOTIFICATION_PREFS = Object.freeze({
  aiRecommendations: true,
  marketNews: true,
  billingAlerts: true,
});

export function canNotify(user, kind) {
  if (!user || !user.telegram_username) return false;
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, ...(user.notification_prefs || {}) };
  return prefs[kind] === true;
}