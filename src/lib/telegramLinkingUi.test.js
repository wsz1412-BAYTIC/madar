import { describe, it, expect } from 'vitest';
import {
  LINK_TTL_MS,
  unwrap,
  readLinkStatus,
  readCreateLink,
  isSafeDeepLink,
  classifyLinkError,
  secondsUntil,
  isLinkExpired,
  formatCountdown,
  formatLinkedDate,
} from './telegramLinkingUi.js';

describe('response unwrapping & projection', () => {
  it('unwraps { data } and raw payloads', () => {
    expect(unwrap({ data: { a: 1 } })).toEqual({ a: 1 });
    expect(unwrap({ a: 1 })).toEqual({ a: 1 });
    expect(unwrap(null)).toEqual({});
  });

  it('reads only the four safe status fields', () => {
    const res = { data: { link: { status: 'linked', linked: true, linked_at: '2026-07-11T12:00:00Z', expires_at: null } } };
    expect(readLinkStatus(res)).toEqual({ status: 'linked', linked: true, linkedAt: '2026-07-11T12:00:00Z', expiresAt: null });
    expect(readLinkStatus({ data: {} })).toEqual({ status: 'none', linked: false, linkedAt: null, expiresAt: null });
  });

  it('reads the create_link deep link + expiry', () => {
    expect(readCreateLink({ data: { deep_link: 'https://t.me/MadarBot?start=x', expires_at: '2026-07-11T12:15:00Z' } }))
      .toEqual({ deepLink: 'https://t.me/MadarBot?start=x', expiresAt: '2026-07-11T12:15:00Z' });
    expect(readCreateLink({ data: {} })).toEqual({ deepLink: null, expiresAt: null });
  });
});

describe('isSafeDeepLink — only https://t.me', () => {
  it('accepts a real Telegram deep link', () => {
    expect(isSafeDeepLink('https://t.me/MadarBot?start=abc123')).toBe(true);
  });

  it('rejects unsafe schemes and hosts', () => {
    expect(isSafeDeepLink('http://t.me/MadarBot?start=x')).toBe(false); // not https
    expect(isSafeDeepLink('tg://resolve?domain=MadarBot')).toBe(false);
    expect(isSafeDeepLink('javascript:alert(1)')).toBe(false); // eslint-disable-line no-script-url
    expect(isSafeDeepLink('https://evil.com/t.me?start=x')).toBe(false);
    expect(isSafeDeepLink('https://t.me.evil.com/x')).toBe(false);
    expect(isSafeDeepLink('https://sub.t.me/x')).toBe(false); // host must be exactly t.me
    expect(isSafeDeepLink('not a url')).toBe(false);
    expect(isSafeDeepLink('')).toBe(false);
    expect(isSafeDeepLink(null)).toBe(false);
  });
});

describe('classifyLinkError', () => {
  it('maps 503 / integration_unavailable to unavailable', () => {
    expect(classifyLinkError({ response: { status: 503 } })).toBe('unavailable');
    expect(classifyLinkError({ status: 503 })).toBe('unavailable');
    expect(classifyLinkError({ response: { data: { reason: 'integration_unavailable' } } })).toBe('unavailable');
  });

  it('maps everything else to a generic error', () => {
    expect(classifyLinkError(new Error('network'))).toBe('error');
    expect(classifyLinkError({ response: { status: 500 } })).toBe('error');
    expect(classifyLinkError(null)).toBe('error');
  });
});

describe('countdown & expiry', () => {
  const now = new Date('2026-07-11T12:00:00Z');

  it('computes whole seconds remaining, clamped at 0', () => {
    expect(secondsUntil('2026-07-11T12:05:00Z', now)).toBe(300);
    expect(secondsUntil('2026-07-11T11:59:00Z', now)).toBe(0);
    expect(secondsUntil(null, now)).toBe(0);
    expect(secondsUntil('bad-date', now)).toBe(0);
  });

  it('flags expiry at or after expires_at', () => {
    expect(isLinkExpired('2026-07-11T12:00:00Z', now)).toBe(true);
    expect(isLinkExpired('2026-07-11T12:00:01Z', now)).toBe(false);
    expect(isLinkExpired(null, now)).toBe(true);
  });

  it('formats MM:SS', () => {
    expect(formatCountdown(900)).toBe('15:00');
    expect(formatCountdown(65)).toBe('01:05');
    expect(formatCountdown(0)).toBe('00:00');
    expect(formatCountdown(-5)).toBe('00:00');
  });

  it('LINK_TTL_MS is 15 minutes', () => {
    expect(LINK_TTL_MS).toBe(15 * 60 * 1000);
  });
});

describe('formatLinkedDate', () => {
  it('formats a valid ISO date and tolerates missing/invalid input', () => {
    expect(typeof formatLinkedDate('2026-07-11T12:00:00Z', 'en')).toBe('string');
    expect(formatLinkedDate('2026-07-11T12:00:00Z', 'en')).toMatch(/2026/);
    expect(formatLinkedDate(null)).toBeNull();
    expect(formatLinkedDate('not-a-date')).toBeNull();
  });
});
