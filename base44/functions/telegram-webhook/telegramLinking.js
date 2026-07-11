// Secure Telegram account-linking primitives (pure, unit-tested).
//
// PR 1A — Secure Telegram Linking Backend. This module holds ONLY the
// deterministic, environment-agnostic parts of the linking flow so they can be
// unit-tested and mirrored byte-for-byte into the Deno backend functions
// (telegram-linking, telegram-webhook). It relies only on Web-standard globals
// (crypto, TextEncoder, btoa) that exist in the browser, Node (test), and Deno.
//
// Security invariants enforced here:
//   • A cryptographically-random URL-safe token is generated; only its SHA-256
//     hash is ever persisted (hashToken). The raw token is returned to the user
//     exactly once (in the deep link) and never stored or logged.
//   • Tokens are single-use and expire after LINK_TTL_MS (15 minutes).
//   • Only PRIVATE Telegram chats may link — groups/supergroups/channels are
//     rejected (isPrivateChat / extractChatContext).
//   • Status projections and audit details never carry the raw token, chatId,
//     or telegramUserId (buildLinkStatus / buildLinkAuditEntry).

export const LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const LINK_TOKEN_BYTES = 32;
export const GENERIC_LINK_ERROR = 'Unable to complete the request.';

// ── Token generation & hashing ──────────────────────────────────────────────

function bytesToBase64Url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function bytesToHex(bytes) {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

/**
 * Generate a cryptographically-random, URL-safe one-time link token.
 * Uses the Web Crypto CSPRNG (crypto.getRandomValues) — never Math.random.
 */
export function generateLinkToken(byteLength = LINK_TOKEN_BYTES) {
  const n = Number.isInteger(byteLength) && byteLength >= 16 ? byteLength : LINK_TOKEN_BYTES;
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

/**
 * SHA-256 hash (hex) of a link token. This is the ONLY representation of the
 * token that is ever persisted or looked up. Async because Web Crypto's
 * subtle.digest is async in every runtime.
 */
export async function hashToken(token) {
  const data = new TextEncoder().encode(String(token == null ? '' : token));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

// ── Expiry ──────────────────────────────────────────────────────────────────

function toMillis(value) {
  if (value instanceof Date) return value.getTime();
  const t = new Date(value).getTime();
  return t;
}

/** True when a pending link has no valid, future expiry. Missing/invalid ⇒ expired. */
export function isExpired(link, now = new Date()) {
  if (!link || !link.expires_at) return true;
  const exp = toMillis(link.expires_at);
  if (!Number.isFinite(exp)) return true;
  return toMillis(now) >= exp;
}

/** Compute the expiry ISO string for a token minted at `now`. */
export function computeExpiry(now = new Date()) {
  return new Date(toMillis(now) + LINK_TTL_MS).toISOString();
}

// ── Telegram update parsing ─────────────────────────────────────────────────

/** The message payload from a Telegram update (message or edited_message), or null. */
export function extractMessage(update) {
  return (update && (update.message || update.edited_message)) || null;
}

/**
 * True only for PRIVATE 1:1 chats. Groups, supergroups and channels are
 * rejected so a bot added to a group can never link an account.
 */
export function isPrivateChat(update) {
  const msg = extractMessage(update);
  return !!(msg && msg.chat && msg.chat.type === 'private');
}

/**
 * Pull the one-time token out of a `/start <token>` command.
 * Returns the token string, or null if the message is not a /start with a payload.
 */
export function parseStartToken(update) {
  const msg = extractMessage(update);
  const text = msg && typeof msg.text === 'string' ? msg.text.trim() : '';
  const m = /^\/start(?:@[A-Za-z0-9_]+)?\s+(\S+)$/.exec(text);
  return m ? m[1] : null;
}

/**
 * Extract the (server-only) chat context. Returns { chatId, telegramUserId,
 * chatType } as strings, or null when unparseable. Callers must never log these.
 */
export function extractChatContext(update) {
  const msg = extractMessage(update);
  if (!msg) return null;
  const chatId = msg.chat && msg.chat.id != null ? String(msg.chat.id) : null;
  const telegramUserId = msg.from && msg.from.id != null ? String(msg.from.id) : null;
  const chatType = msg.chat ? msg.chat.type || null : null;
  return { chatId, telegramUserId, chatType };
}

// ── Status projection (browser-safe) ────────────────────────────────────────

/**
 * Sanitized link status for returning to an authenticated user. NEVER includes
 * the token hash, chatId or telegramUserId.
 */
export function buildLinkStatus(link) {
  if (!link) return { status: 'none', linked: false };
  return {
    status: link.status || 'none',
    linked: link.status === 'linked',
    linked_at: link.status === 'linked' ? link.linked_at || null : null,
    expires_at: link.status === 'pending' ? link.expires_at || null : null,
  };
}

// ── Uniqueness / conflict detection ─────────────────────────────────────────

/**
 * True when linking `forUserId` to this chat/telegram user would attach a
 * Telegram identity that is already actively linked to a DIFFERENT Madar
 * account. Prevents one chat or one Telegram user linking to multiple accounts.
 */
export function hasConflictingLink(existingLinks, { chatId, telegramUserId, forUserId }) {
  return (existingLinks || []).some(
    (l) =>
      l &&
      l.status === 'linked' &&
      l.userId !== forUserId &&
      ((chatId && l.chat_id === chatId) || (telegramUserId && l.telegram_user_id === telegramUserId))
  );
}

/** True when `link` is an active link to exactly this chat/telegram user. */
export function isLinkedToChat(link, { chatId, telegramUserId } = {}) {
  if (!link || link.status !== 'linked') return false;
  if (chatId && link.chat_id !== chatId) return false;
  if (telegramUserId && link.telegram_user_id !== telegramUserId) return false;
  return true;
}

/**
 * Deterministically resolve a residual cross-account race: after a link is
 * written, `others` are the currently-linked rows (for a DIFFERENT Madar user)
 * that share this chat_id or telegram_user_id. The EARLIEST linked_at wins
 * (tiebreak: lowest id) so an identity already linked to one account can never
 * be hijacked by a second. Returns which rows to revoke and whether the just-
 * written candidate survives.
 */
export function resolveIdentityConflict(candidate, others) {
  const list = (others || []).filter(
    (r) => r && r.status === 'linked' && r.id && candidate && r.userId !== candidate.userId
  );
  if (list.length === 0) return { keepCandidate: true, revokeIds: [] };
  const rank = (r) => `${String(r.linked_at || '')}|${String(r.id)}`;
  let winner = candidate;
  for (const r of list) {
    if (rank(r) < rank(winner)) winner = r;
  }
  if (winner === candidate || winner.id === candidate.id) {
    return { keepCandidate: true, revokeIds: list.map((r) => r.id) };
  }
  return { keepCandidate: false, revokeIds: [candidate.id] };
}

// ── PII-minimized audit entry ───────────────────────────────────────────────

/**
 * Build an AuditLog entry for a link/unlink action. `details` MUST already be
 * PII-free — raw tokens, chatIds and telegramUserIds must never be passed in.
 * targetId carries the internal Madar userId (admin-only AuditLog convention);
 * no Telegram identifiers ever enter the audit record.
 */
export function buildLinkAuditEntry({ action, actorId, actorRole, targetUserId, nowIso, details } = {}) {
  return {
    adminId: actorId || 'system:telegram',
    adminRole: actorRole || 'system',
    action,
    targetType: 'TelegramLink',
    targetId: targetUserId || 'unknown',
    targetName: null,
    previousValue: null,
    newValue: null,
    timestamp: nowIso || new Date().toISOString(),
    details: details || {},
  };
}
