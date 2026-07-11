import { describe, it, expect } from 'vitest';
import {
  LINK_TTL_MS,
  generateLinkToken,
  hashToken,
  isExpired,
  computeExpiry,
  extractMessage,
  isPrivateChat,
  parseStartToken,
  extractChatContext,
  buildLinkStatus,
  hasConflictingLink,
  buildLinkAuditEntry,
} from './telegramLinking.js';

describe('token generation & hashing', () => {
  it('generates URL-safe tokens with no padding or non-URL chars', () => {
    const t = generateLinkToken();
    expect(typeof t).toBe('string');
    expect(t.length).toBeGreaterThan(20);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/); // base64url, no + / =
  });

  it('generates distinct tokens each call (CSPRNG)', () => {
    const seen = new Set();
    for (let i = 0; i < 50; i++) seen.add(generateLinkToken());
    expect(seen.size).toBe(50);
  });

  it('hashes a token to a stable 64-char hex digest', async () => {
    const h1 = await hashToken('abc');
    const h2 = await hashToken('abc');
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces different hashes for different tokens and hides the raw token', async () => {
    const token = generateLinkToken();
    const h = await hashToken(token);
    expect(h).not.toContain(token);
    expect(await hashToken(token + 'x')).not.toBe(h);
  });
});

describe('expiry', () => {
  it('treats a token as expired at or after expires_at', () => {
    const now = new Date('2026-07-11T12:00:00Z');
    expect(isExpired({ expires_at: '2026-07-11T12:00:00Z' }, now)).toBe(true);
    expect(isExpired({ expires_at: '2026-07-11T11:59:59Z' }, now)).toBe(true);
    expect(isExpired({ expires_at: '2026-07-11T12:00:01Z' }, now)).toBe(false);
  });

  it('treats missing/invalid expiry as expired (fail-closed)', () => {
    expect(isExpired(null)).toBe(true);
    expect(isExpired({})).toBe(true);
    expect(isExpired({ expires_at: 'not-a-date' }, new Date())).toBe(true);
  });

  it('computeExpiry is exactly 15 minutes after now', () => {
    const now = new Date('2026-07-11T12:00:00Z');
    expect(computeExpiry(now)).toBe(new Date(now.getTime() + LINK_TTL_MS).toISOString());
    expect(LINK_TTL_MS).toBe(15 * 60 * 1000);
  });
});

describe('Telegram update parsing', () => {
  const privateStart = {
    message: { text: '/start tok_123', chat: { id: 555, type: 'private' }, from: { id: 999 } },
  };

  it('accepts only private chats', () => {
    expect(isPrivateChat(privateStart)).toBe(true);
    expect(isPrivateChat({ message: { chat: { type: 'group' } } })).toBe(false);
    expect(isPrivateChat({ message: { chat: { type: 'supergroup' } } })).toBe(false);
    expect(isPrivateChat({ message: { chat: { type: 'channel' } } })).toBe(false);
    expect(isPrivateChat({})).toBe(false);
  });

  it('parses the /start token payload', () => {
    expect(parseStartToken(privateStart)).toBe('tok_123');
    expect(parseStartToken({ message: { text: '/start@MadarBot tok_abc', chat: {} } })).toBe('tok_abc');
    expect(parseStartToken({ message: { text: '/start', chat: {} } })).toBeNull();
    expect(parseStartToken({ message: { text: 'hello', chat: {} } })).toBeNull();
    expect(parseStartToken({})).toBeNull();
  });

  it('extracts chat context as strings', () => {
    expect(extractChatContext(privateStart)).toEqual({ chatId: '555', telegramUserId: '999', chatType: 'private' });
    expect(extractChatContext({})).toBeNull();
  });

  it('reads message or edited_message', () => {
    expect(extractMessage({ edited_message: { text: 'x' } })).toEqual({ text: 'x' });
    expect(extractMessage({})).toBeNull();
  });
});

describe('buildLinkStatus — never leaks secrets', () => {
  it('projects a linked row without chat/token', () => {
    const s = buildLinkStatus({
      status: 'linked',
      linked_at: '2026-07-11T12:00:00Z',
      chat_id: '555',
      telegram_user_id: '999',
      link_token_hash: 'deadbeef',
    });
    expect(s).toEqual({ status: 'linked', linked: true, linked_at: '2026-07-11T12:00:00Z', expires_at: null });
    expect(JSON.stringify(s)).not.toContain('555');
    expect(JSON.stringify(s)).not.toContain('999');
    expect(JSON.stringify(s)).not.toContain('deadbeef');
  });

  it('projects pending and none states', () => {
    expect(buildLinkStatus({ status: 'pending', expires_at: '2026-07-11T12:15:00Z' })).toEqual({
      status: 'pending',
      linked: false,
      linked_at: null,
      expires_at: '2026-07-11T12:15:00Z',
    });
    expect(buildLinkStatus(null)).toEqual({ status: 'none', linked: false });
  });
});

describe('hasConflictingLink — one identity, one account', () => {
  const linked = [{ status: 'linked', userId: 'userA', chat_id: '555', telegram_user_id: '999' }];

  it('flags a chat already linked to a different account', () => {
    expect(hasConflictingLink(linked, { chatId: '555', telegramUserId: '111', forUserId: 'userB' })).toBe(true);
  });

  it('flags a telegram user already linked to a different account', () => {
    expect(hasConflictingLink(linked, { chatId: '777', telegramUserId: '999', forUserId: 'userB' })).toBe(true);
  });

  it('does not flag the same account re-linking its own identity', () => {
    expect(hasConflictingLink(linked, { chatId: '555', telegramUserId: '999', forUserId: 'userA' })).toBe(false);
  });

  it('ignores non-linked rows and empty input', () => {
    const stale = [{ status: 'revoked', userId: 'userA', chat_id: '555' }];
    expect(hasConflictingLink(stale, { chatId: '555', forUserId: 'userB' })).toBe(false);
    expect(hasConflictingLink([], { chatId: '555', forUserId: 'userB' })).toBe(false);
    expect(hasConflictingLink(null, { chatId: '555', forUserId: 'userB' })).toBe(false);
  });
});

describe('buildLinkAuditEntry — PII-minimized', () => {
  it('builds an AuditLog-shaped entry with no telegram identifiers', () => {
    const e = buildLinkAuditEntry({
      action: 'telegram_link_created',
      actorId: 'user_1',
      actorRole: 'user',
      targetUserId: 'user_1',
      nowIso: '2026-07-11T12:00:00Z',
      details: { outcome: 'pending' },
    });
    expect(e.action).toBe('telegram_link_created');
    expect(e.targetType).toBe('TelegramLink');
    expect(e.targetId).toBe('user_1');
    expect(e.timestamp).toBe('2026-07-11T12:00:00Z');
    expect(e.previousValue).toBeNull();
    expect(e.newValue).toBeNull();
    expect(e.details).toEqual({ outcome: 'pending' });
  });

  it('falls back to system actor for webhook-originated audits', () => {
    const e = buildLinkAuditEntry({ action: 'telegram_linked', targetUserId: 'user_2' });
    expect(e.adminId).toBe('system:telegram');
    expect(e.adminRole).toBe('system');
  });
});
