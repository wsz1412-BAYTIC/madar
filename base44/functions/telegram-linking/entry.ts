// Deno backend function: secure Telegram account linking (authenticated).
//
// This is the ONLY authenticated surface for the linking lifecycle. It is
// deliberately separate from telegram-webhook (inbound-only) so an unauthenticated
// Telegram callback can never reach these actions and vice-versa.
//
// Every action requires an authenticated Madar user (base44.auth.me()). Reads and
// writes go through asServiceRole because TelegramLink is admin-only under RLS —
// the function itself scopes every query to the caller's own userId, so a user
// only ever sees/changes their own link.
//
// Actions:
//   create_link — revoke any prior pending token, mint a fresh cryptographically
//                 random one-time token (15-min expiry), persist ONLY its hash,
//                 and return a t.me deep link containing the raw token. The raw
//                 token is returned exactly once and is never stored or logged.
//   status      — return a sanitized link status (never chatId/telegramUserId/hash).
//   unlink      — revoke the caller's active (pending/linked) link.
//
// Privacy: raw tokens, chat ids and telegram user ids are NEVER logged. Audit
// entries carry PII-minimized details only. Errors are generic.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  generateLinkToken,
  hashToken,
  computeExpiry,
  buildLinkStatus,
  buildLinkAuditEntry,
  GENERIC_LINK_ERROR,
} from "./telegramLinking.js";

const BOT_USERNAME = Deno.env.get("TELEGRAM_BOT_USERNAME") || "";

async function writeAudit(sr, entry) {
  try {
    await sr.entities.AuditLog.create(entry);
  } catch {
    // Auditing must never break the user-facing action; swallow silently.
  }
}

// The caller's most relevant link row: prefer a linked one, else the newest
// pending, else the newest of anything. Scoped to the caller's userId only.
function pickCurrent(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const linked = list.find((r) => r.status === "linked");
  if (linked) return linked;
  const byNewest = [...list].sort((a, b) =>
    String(b.created_at || "").localeCompare(String(a.created_at || ""))
  );
  return byNewest.find((r) => r.status === "pending") || byNewest[0] || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "status";
    const sr = base44.asServiceRole;
    const now = new Date();
    const nowIso = now.toISOString();

    // ── status: sanitized projection of the caller's own link ──
    if (action === "status") {
      const rows = await sr.entities.TelegramLink.filter(
        { userId: user.id },
        "-created_at",
        20,
        ["userId", "status", "linked_at", "expires_at", "created_at"]
      );
      return Response.json({ success: true, link: buildLinkStatus(pickCurrent(rows)) });
    }

    // ── create_link: mint a fresh single-use token, store only its hash ──
    if (action === "create_link") {
      if (!BOT_USERNAME) {
        // No bot configured yet — do not mint a token that can never be used.
        return Response.json({ error: GENERIC_LINK_ERROR, reason: "integration_unavailable" }, { status: 503 });
      }

      // Invalidate any outstanding pending tokens for this user so at most one
      // token is ever live (atomic; idempotent if none exist).
      await sr.entities.TelegramLink.updateMany(
        { userId: user.id, status: "pending" },
        { status: "revoked", revoked_at: nowIso }
      );

      const token = generateLinkToken();
      const link_token_hash = await hashToken(token);
      const expires_at = computeExpiry(now);

      await sr.entities.TelegramLink.create({
        userId: user.id,
        link_token_hash,
        status: "pending",
        chat_id: null,
        telegram_user_id: null,
        created_at: nowIso,
        expires_at,
        linked_at: null,
        revoked_at: null,
      });

      await writeAudit(
        sr,
        buildLinkAuditEntry({
          action: "telegram_link_created",
          actorId: user.id,
          actorRole: user.role || "user",
          targetUserId: user.id,
          nowIso,
          details: { outcome: "pending", ttl_minutes: 15 },
        })
      );

      // The raw token appears ONLY here, in the deep link handed to the user.
      const deepLink = `https://t.me/${BOT_USERNAME}?start=${token}`;
      return Response.json({ success: true, deep_link: deepLink, expires_at });
    }

    // ── unlink: revoke the caller's active link(s) ──
    if (action === "unlink") {
      const pendingRes = await sr.entities.TelegramLink.updateMany(
        { userId: user.id, status: "pending" },
        { status: "revoked", revoked_at: nowIso }
      );
      const linkedRes = await sr.entities.TelegramLink.updateMany(
        { userId: user.id, status: "linked" },
        { status: "revoked", revoked_at: nowIso }
      );
      const revoked = Number(pendingRes?.updated ?? 0) + Number(linkedRes?.updated ?? 0);

      if (revoked > 0) {
        await writeAudit(
          sr,
          buildLinkAuditEntry({
            action: "telegram_unlinked",
            actorId: user.id,
            actorRole: user.role || "user",
            targetUserId: user.id,
            nowIso,
            details: { outcome: "revoked" },
          })
        );
      }
      return Response.json({ success: true, link: { status: "none", linked: false } });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (_error) {
    // Generic error — no account enumeration, no internal detail leakage.
    return Response.json({ error: GENERIC_LINK_ERROR }, { status: 500 });
  }
});
