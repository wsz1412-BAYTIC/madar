import { describe, it, expect } from 'vitest';
import {
  isValidTelegramUsername,
  normalizeTelegramUsername,
  canNotify,
  DEFAULT_NOTIFICATION_PREFS,
} from './telegramNotifications.js';

describe('telegram username validation', () => {
  it('accepts valid handles with or without @', () => {
    expect(isValidTelegramUsername('@sara_riyadh')).toBe(true);
    expect(isValidTelegramUsername('sara_riyadh')).toBe(true);
    expect(isValidTelegramUsername('abcde')).toBe(true); // exactly 5
    expect(isValidTelegramUsername('@' + 'a'.repeat(32))).toBe(true);
  });

  it('rejects too short, too long, and illegal characters', () => {
    expect(isValidTelegramUsername('@abcd')).toBe(false); // 4 chars
    expect(isValidTelegramUsername('a'.repeat(33))).toBe(false);
    expect(isValidTelegramUsername('@user name')).toBe(false);
    expect(isValidTelegramUsername('@user-name')).toBe(false);
    expect(isValidTelegramUsername('سارة')).toBe(false);
    expect(isValidTelegramUsername('')).toBe(false);
    expect(isValidTelegramUsername(null)).toBe(false);
  });

  it('normalizes to a canonical @handle', () => {
    expect(normalizeTelegramUsername('sara_riyadh')).toBe('@sara_riyadh');
    expect(normalizeTelegramUsername('@sara_riyadh')).toBe('@sara_riyadh');
    expect(normalizeTelegramUsername('  sara  ')).toBe('@sara');
    expect(normalizeTelegramUsername('')).toBeNull();
  });
});

describe('canNotify gate (future sender must pass through this)', () => {
  const user = { telegram_username: '@sara', notification_prefs: { aiRecommendations: true, marketNews: false } };

  it('requires a stored username', () => {
    expect(canNotify({ notification_prefs: { aiRecommendations: true } }, 'aiRecommendations')).toBe(false);
    expect(canNotify(null, 'aiRecommendations')).toBe(false);
  });

  it('honors per-kind preferences with safe defaults', () => {
    expect(canNotify(user, 'aiRecommendations')).toBe(true);
    expect(canNotify(user, 'marketNews')).toBe(false);
    // unset pref falls back to defaults (billingAlerts default true)
    expect(canNotify(user, 'billingAlerts')).toBe(true);
    // unknown kind is never sendable
    expect(canNotify(user, 'promotions')).toBe(false);
  });

  it('defaults are all-on but only apply when a username exists', () => {
    expect(DEFAULT_NOTIFICATION_PREFS).toEqual({ aiRecommendations: true, marketNews: true, billingAlerts: true });
  });
});
