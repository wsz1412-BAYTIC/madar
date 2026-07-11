// Deno backend function: Telegram webhook (INBOUND ONLY).
//
// This function does exactly one thing in PR 1A: consume a `/start <token>`
// deep-link tap and complete a secure, single-use account link. It has NO
// outbound messaging, NO menu, NO notifications, NO AI — those are later phases.
//
// Trust model:
//   • Requests are unauthenticated (Telegram, not a Madar user), so EVERY request
//     must carry the shared secret header X-Telegram-Bot-Api-Secret-Token equal to
//     TELEGRAM_WEBHOOK_SECRET. Missing/mismatched ⇒ 401, nothing else runs.
//   • Only PRIVATE chats may link. Groups/supergroups/channels are ignored.
//   • The incoming token is hashed and matched against a PENDING, unexpired
//     TelegramLink. Linking is an atomic compare-and-set (updateMany scoped to
//     { id, status: 'pending' }) so a replayed /start can consume a token at most
//     once. Expired tokens are retired, never linked.
//   • One Telegram chat / one Telegram user may link to at most one Madar account.
//
// Privacy: raw tokens, chat ids and telegram user ids are NEVER logged. Replies
// to the chat are generic. Audit entries carry PII-minimized details only.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  hashToken,
  isExpired,
  isPrivateChat,
  parseStartToken,
  extractChatContext,
  hasConflictingLink,
  isLinkedToChat,
  resolveIdentityConflict,
  buildLinkAuditEntry,
} from "./telegramLinking.js";

const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || "";
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

// Always ack Telegram with 200 so it does not retry; the link outcome is internal.
const ack = () => Response.json({ ok: true });

async function writeAudit(sr, entry) {
  try {
    await sr.entities.AuditLog.create(entry);
  } catch {
    // Never let auditing failure change the webhook outcome.
  }
}

// Best-effort generic reply to the chat. No account data, no enumeration.
async function reply(chatId, text) {
  if (!BOT_TOKEN || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {
    // Delivery is best-effort in PR 1A; linking state is already persisted.
  }
}

Deno.serve(async (req) => {
  try {
    // 1) Shared-secret gate. Constant work regardless of outcome; generic 401.
    const provided = req.headers.get("X-Telegram-Bot-Api-Secret-Token") || "";
    if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await req.json().catch(() => null);
    if (!update) return ack();

    // 2) Only /start with a payload in a PRIVATE chat can link.
    const token = parseStartToken(update);
    if (!token) return ack();
    if (!isPrivateChat(update)) {
      // Group/supergroup/channel — refuse to link, say so generically.
      const ctx = extractChatContext(update);
      await reply(ctx && ctx.chatId, "الرجاء ربط الحساب من محادثة خاصة مع البوت. / Please link from a private chat with the bot.");
      return ack();
    }

    const ctx = extractChatContext(update);
    if (!ctx || !ctx.chatId) return ack();

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();
    const nowIso = now.toISOString();

    // 3) Match the token by HASH against a pending link. Raw token never stored.
    const link_token_hash = await hashToken(token);
    const matches = await sr.entities.TelegramLink.filter(
      { link_token_hash, status: "pending" },
      "-created_at",
      5
    );
    const candidate = Array.isArray(matches) ? matches[0] : null;

    if (!candidate) {
      // No pending row. Telegram may RETRY an already-successful /start delivery,
      // by which point the row is `linked`. Look the same token hash up among
      // linked rows and, ONLY when it is the SAME successful link (same chat AND
      // telegram user), re-send the success confirmation idempotently WITHOUT
      // mutating anything. Every other case — a token linked to a different
      // chat/user, or a revoked/expired token — keeps the generic reply. This
      // path never links, so single-use protection is unaffected.
      let priorByHash = null;
      try {
        const linkedMatches = await sr.entities.TelegramLink.filter(
          { link_token_hash, status: "linked" },
          "-linked_at",
          5,
          0,
          ["userId", "status", "chat_id", "telegram_user_id", "linked_at"]
        );
        priorByHash = Array.isArray(linkedMatches) ? linkedMatches[0] : null;
      } catch {
        priorByHash = null;
      }
      if (isLinkedToChat(priorByHash, { chatId: ctx.chatId, telegramUserId: ctx.telegramUserId })) {
        await reply(ctx.chatId, "تم ربط الحساب. / Your account is linked.");
      } else {
        await reply(ctx.chatId, "انتهت صلاحية رابط الربط أو أنه غير صالح. / This link is invalid or has expired.");
      }
      return ack();
    }

    // 4) Expired token — retire it, never link.
    if (isExpired(candidate, now)) {
      await sr.entities.TelegramLink.updateMany(
        { id: candidate.id, status: "pending" },
        { $set: { status: "expired" } }
      );
      await reply(ctx.chatId, "انتهت صلاحية رابط الربط. أنشئ رابطًا جديدًا من الإعدادات. / Link expired. Generate a new one from settings.");
      return ack();
    }

    // 5) Uniqueness: one chat / one telegram user ⇒ at most one Madar account.
    const [byChat, byTgUser] = await Promise.all([
      sr.entities.TelegramLink.filter({ chat_id: ctx.chatId, status: "linked" }, "-linked_at", 5),
      ctx.telegramUserId
        ? sr.entities.TelegramLink.filter({ telegram_user_id: ctx.telegramUserId, status: "linked" }, "-linked_at", 5)
        : Promise.resolve([]),
    ]);
    const conflict = hasConflictingLink(
      [...(byChat || []), ...(byTgUser || [])],
      { chatId: ctx.chatId, telegramUserId: ctx.telegramUserId, forUserId: candidate.userId }
    );
    if (conflict) {
      await writeAudit(
        sr,
        buildLinkAuditEntry({
          action: "telegram_link_conflict",
          targetUserId: candidate.userId,
          nowIso,
          details: { outcome: "rejected", reason: "identity_already_linked" },
        })
      );
      await reply(ctx.chatId, "هذا الحساب في تيليجرام مرتبط بحساب آخر. / This Telegram account is already linked to another account.");
      return ack();
    }

    // 6) Atomic single-use consumption: link ONLY if still pending. A replay or a
    // racing request finds 0 rows and cannot link twice.
    const result = await sr.entities.TelegramLink.updateMany(
      { id: candidate.id, status: "pending" },
      {
        $set: {
          status: "linked",
          chat_id: ctx.chatId,
          telegram_user_id: ctx.telegramUserId || null,
          linked_at: nowIso,
        },
      }
    );
    const linked = Number(result?.updated ?? 0) > 0;

    if (!linked) {
      // Zero rows updated is NOT necessarily an idempotent replay — the token may
      // have been revoked/replaced or consumed from another chat between the
      // filter and this CAS. Re-read and only report success if THIS chat is now
      // genuinely linked; otherwise send the generic invalid/expired response.
      let fresh = null;
      try {
        fresh = await sr.entities.TelegramLink.get(candidate.id);
      } catch {
        fresh = null;
      }
      if (isLinkedToChat(fresh, { chatId: ctx.chatId, telegramUserId: ctx.telegramUserId })) {
        await reply(ctx.chatId, "تم ربط الحساب. / Your account is linked.");
      } else {
        await reply(ctx.chatId, "انتهت صلاحية رابط الربط أو أنه غير صالح. / This link is invalid or has expired.");
      }
      return ack();
    }

    // 7) Post-link reconciliation. The preflight check above is not atomic across
    // concurrent DIFFERENT-token webhooks, so re-assert the invariants now that
    // the row is written:
    const linkedCandidate = {
      id: candidate.id,
      userId: candidate.userId,
      status: "linked",
      chat_id: ctx.chatId,
      telegram_user_id: ctx.telegramUserId || null,
      linked_at: nowIso,
    };

    // 7a) One chat per Madar account: revoke this user's OTHER linked chats (a
    // deliberate re-link from a new chat supersedes the old one).
    try {
      const mine = await sr.entities.TelegramLink.filter(
        { userId: candidate.userId, status: "linked" },
        "-linked_at",
        20,
        0,
        ["id"]
      );
      for (const row of mine || []) {
        if (row && row.id && row.id !== candidate.id) {
          await sr.entities.TelegramLink.updateMany(
            { id: row.id, status: "linked" },
            { $set: { status: "revoked", revoked_at: nowIso } }
          );
        }
      }
    } catch {
      // best-effort
    }

    // 7b) One identity → one account: if a DIFFERENT account linked the same
    // chat/telegram user in the race window, resolve deterministically (earliest
    // linked_at wins) and revoke the loser — which may be this very link.
    const [byChat2, byTg2] = await Promise.all([
      sr.entities.TelegramLink.filter({ chat_id: ctx.chatId, status: "linked" }, "-linked_at", 10, 0, ["id", "userId", "status", "linked_at"]),
      ctx.telegramUserId
        ? sr.entities.TelegramLink.filter({ telegram_user_id: ctx.telegramUserId, status: "linked" }, "-linked_at", 10, 0, ["id", "userId", "status", "linked_at"])
        : Promise.resolve([]),
    ]);
    const { keepCandidate, revokeIds } = resolveIdentityConflict(linkedCandidate, [
      ...(byChat2 || []),
      ...(byTg2 || []),
    ]);
    for (const id of revokeIds) {
      await sr.entities.TelegramLink.updateMany(
        { id, status: "linked" },
        { $set: { status: "revoked", revoked_at: nowIso } }
      );
    }

    if (!keepCandidate) {
      await writeAudit(
        sr,
        buildLinkAuditEntry({
          action: "telegram_link_conflict",
          targetUserId: candidate.userId,
          nowIso,
          details: { outcome: "rejected", reason: "identity_already_linked" },
        })
      );
      await reply(ctx.chatId, "هذا الحساب في تيليجرام مرتبط بحساب آخر. / This Telegram account is already linked to another account.");
      return ack();
    }

    await writeAudit(
      sr,
      buildLinkAuditEntry({
        action: "telegram_linked",
        targetUserId: candidate.userId,
        nowIso,
        details: { outcome: "linked" },
      })
    );
    await reply(ctx.chatId, "تم ربط حسابك بنجاح ✅ / Your Madar account is now linked ✅");
    return ack();
  } catch (_error) {
    // Never leak internals to Telegram; ack so it does not hammer retries.
    return ack();
  }
});
