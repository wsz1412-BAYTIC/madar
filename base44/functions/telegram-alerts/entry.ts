// Deno backend function: Telegram alert dispatch for Madar.
//
// Two modes:
//   • weekly_run  — admin/scheduler-invoked. Sends the Wednesday 15:00
//     (Asia/Riyadh) weekly digest to every opted-in user, once per ISO week.
//   • instant     — service-invoked for a single user/kind/event. Paid
//     Growth/Pro subscribers only.
//
// Duplicate prevention: every attempt writes a NotificationLog row keyed by
// dedupeKey; an existing key is never sent again. Messages are SUMMARY +
// DASHBOARD LINK ONLY — no prices, revenue, emails, or account data.
//
// Honest delivery status: no Telegram bot is configured yet (see
// docs/TELEGRAM_NOTIFICATIONS.md). Until TELEGRAM_BOT_TOKEN exists and chat
// IDs are captured, every send is logged as 'pending_integration' — visible,
// deduplicated, never silently dropped, and the sender flips to real
// delivery with no schema change once the bot goes live.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  weeklyDedupeKey,
  isWeeklySendWindow,
  weeklyDigestEligible,
  instantAlertAllowed,
  instantDedupeKey,
  buildTelegramMessage,
  INSTANT_ALERT_KINDS,
} from "./notificationScheduler.js";

const DASHBOARD_URL = "https://madar.sa/dashboard";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const sr = base44.asServiceRole;
    const now = new Date();
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || null;

    const alreadySent = async (dedupeKey) => {
      const rows = await sr.entities.NotificationLog.filter({ dedupeKey });
      return rows && rows.length > 0;
    };

    // Attempt delivery; without a bot token this records pending_integration.
    const deliver = async (targetUser, kind, dedupeKey) => {
      if (await alreadySent(dedupeKey)) return { status: "skipped", reason: "duplicate" };
      let status = "pending_integration";
      if (botToken && targetUser.telegram_chat_id) {
        try {
          const message = buildTelegramMessage(kind, "ar", DASHBOARD_URL);
          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: targetUser.telegram_chat_id, text: message }),
          });
          status = res.ok ? "sent" : "failed";
        } catch {
          status = "failed";
        }
      }
      await sr.entities.NotificationLog.create({
        userId: targetUser.id,
        channel: "telegram",
        kind,
        dedupeKey,
        status,
        sentAt: now.toISOString(),
        details: { username: targetUser.telegram_username || null },
      });
      return { status };
    };

    switch (action) {
      case "weekly_run": {
        // Scheduler/admin only — a normal user cannot trigger fan-out.
        if (user.role !== "admin") {
          return Response.json({ error: "Forbidden: admin access required" }, { status: 403 });
        }
        if (!body.force && !isWeeklySendWindow(now)) {
          return Response.json({ skipped: true, reason: "outside Wednesday 15:00 Riyadh window" });
        }
        const users = await sr.entities.User.list();
        const weekKey = weeklyDedupeKey(now);
        const results = [];
        for (const u of users) {
          if (!weeklyDigestEligible(u)) continue;
          const r = await deliver(u, "weekly_digest", `${weekKey}-${u.id}`);
          results.push({ userId: u.id, ...r });
        }
        return Response.json({ week: weekKey, attempted: results.length, results });
      }

      case "instant": {
        // Service/admin path for a single event. Paid Growth/Pro + opt-in only.
        if (user.role !== "admin") {
          return Response.json({ error: "Forbidden: admin access required" }, { status: 403 });
        }
        const { target_user_id, kind, event_id } = body;
        if (!target_user_id || !kind || !event_id) {
          return Response.json({ error: "target_user_id, kind and event_id required" }, { status: 400 });
        }
        if (!INSTANT_ALERT_KINDS.includes(kind)) {
          return Response.json({ error: "Unknown alert kind" }, { status: 400 });
        }
        const targetUser = await sr.entities.User.get(target_user_id);
        if (!targetUser) return Response.json({ error: "User not found" }, { status: 404 });
        const subs = await sr.entities.UserSubscription.filter({ userId: target_user_id });
        const sub = subs && subs.length > 0 ? subs[0] : null;
        if (!instantAlertAllowed(targetUser, sub || {}, kind, now)) {
          return Response.json({ skipped: true, reason: "not eligible (paid Growth/Pro + opt-in required)" });
        }
        const r = await deliver(targetUser, kind, instantDedupeKey(target_user_id, kind, event_id));
        return Response.json(r);
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
