// Deno backend function: subscription onboarding, 14-day Growth trial, and
// self-service reads for Madar.
//
// Writes go through asServiceRole (role=admin) because UserSubscription
// create/update RLS is admin-only — a normal user can never self-provision,
// self-upgrade, mark themselves paid, or extend a trial from the client. All
// trial rules live in the mirrored pure module trialManagement.js so the
// server and UI apply identical logic; the server is the authority.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  buildFreeSubscription,
  assessPropertyLimit,
  UPGRADE_UNAVAILABLE,
} from "./subscriptionProvisioning.js";
import {
  canActivateTrial,
  buildTrialActivation,
  buildTrialExpiryDowngrade,
  assessTrialState,
  resolveEntitlementPlan,
  dueTrialReminders,
  contactChannels,
} from "./trialManagement.js";
import { buildQuickReport } from "./madarReport.js";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const sr = base44.asServiceRole;
    const now = new Date();

    // ── Audit helper (Madar AuditLog schema) ──
    const logAction = async (targetId, action, previousValue, newValue, details) => {
      await sr.entities.AuditLog.create({
        adminId: user.id,
        adminRole: user.role || "user",
        action,
        targetType: "UserSubscription",
        targetId: targetId || "collection:UserSubscription",
        targetName: user.email || null,
        previousValue: previousValue == null ? null : JSON.stringify(previousValue),
        newValue: newValue == null ? null : JSON.stringify(newValue),
        timestamp: now.toISOString(),
        details: details || {},
      });
    };

    // ── Idempotent: return the user's subscription, auto-provisioning Free once. ──
    const ensureSubscription = async () => {
      const subs = await sr.entities.UserSubscription.filter({ userId: user.id });
      if (subs && subs.length > 0) return subs[0];

      const payload = buildFreeSubscription(user.id, now.toISOString());
      const created = await sr.entities.UserSubscription.create(payload);
      await logAction(created.id, "subscription_change", null, {
        planName: "free",
        status: "active",
        note: "Auto-provisioned free plan",
      });
      return created;
    };

    // ── Lazy trial enforcement: expire + lock back to Free when overdue, and
    //    process any due reminders. Runs on every read so no scheduler is
    //    required for correctness (a scheduler only makes reminders timelier).
    const enforceTrialState = async (sub) => {
      let current = sub;

      if (current.trialStatus === "active" && new Date(current.trialEndsAt) <= now) {
        const prev = { planName: current.planName, paymentStatus: current.paymentStatus, trialStatus: current.trialStatus };
        const downgrade = buildTrialExpiryDowngrade();
        current = await sr.entities.UserSubscription.update(current.id, downgrade);
        await logAction(current.id, "subscription_change", prev, downgrade, {
          note: "Growth trial expired — locked back to Free until payment is verified",
        });
      }

      const due = dueTrialReminders(current, now);
      if (due.length > 0) {
        const channels = contactChannels(user);
        const results = [];
        for (const key of due) {
          // Email first; Telegram delivery is a pending integration (see
          // docs/TELEGRAM_NOTIFICATIONS.md) and is logged as such — never
          // silently dropped, never sent twice (offset recorded below).
          let delivered = false;
          for (const ch of channels) {
            if (ch.channel === "email") {
              try {
                await sr.integrations.Core.SendEmail({
                  to: ch.to,
                  subject: key === "0d" ? "Your Madar Growth trial ends today" : `Your Madar Growth trial ends in ${key.replace("d", "")} days`,
                  body: "سينتهي اشتراكك التجريبي في خطة النمو قريبًا. فعّل اشتراكك المدفوع للاحتفاظ بالتوصيات والتقارير.\n\nYour Growth trial is ending soon. Activate a paid plan to keep your recommendations and reports.",
                });
                delivered = true;
                results.push({ key, channel: "email", status: "sent" });
                break;
              } catch (_e) {
                results.push({ key, channel: "email", status: "failed" });
              }
            } else if (ch.channel === "telegram") {
              results.push({ key, channel: "telegram", status: "pending_integration" });
            }
          }
          if (!delivered) results.push({ key, channel: "in_app", status: "recorded" });
        }
        const sent = [...(current.trialRemindersSent || []), ...due];
        current = await sr.entities.UserSubscription.update(current.id, { trialRemindersSent: sent });
        await logAction(current.id, "subscription_change", null, { remindersSent: due }, { note: "Trial expiry reminders processed", results });
      }

      return current;
    };

    switch (action) {
      case "get_current": {
        // Auto-provisions Free on first call; enforces trial expiry lazily.
        let sub = await ensureSubscription();
        sub = await enforceTrialState(sub);
        return Response.json({
          subscription: sub,
          trial: assessTrialState(sub, now),
          entitlementPlan: resolveEntitlementPlan(sub, now),
        });
      }

      case "activate_trial": {
        let sub = await ensureSubscription();
        sub = await enforceTrialState(sub);

        const check = canActivateTrial(sub, now);
        if (!check.allowed) {
          return Response.json(
            { error: check.error.ar, error_en: check.error.en, reason: check.reason },
            { status: check.reason === "trial_already_used" ? 403 : 409 }
          );
        }

        const prev = { planName: sub.planName, paymentStatus: sub.paymentStatus, trialStatus: sub.trialStatus || "none" };
        const activation = buildTrialActivation(now);
        const updated = await sr.entities.UserSubscription.update(sub.id, activation);
        await logAction(updated.id, "subscription_change", prev, activation, {
          note: "14-day Growth trial activated (self-service; paymentStatus=trial, never paid)",
        });

        // Quick report: computed immediately so the customer gets value on
        // day one. Returned in-app; email is attempted best-effort.
        const properties = await sr.entities.UserProperty.filter({ userId: user.id });
        const report = buildQuickReport(properties, { fullAccess: false });
        try {
          if (user.email) {
            await sr.integrations.Core.SendEmail({
              to: user.email,
              subject: "Your Madar Quick Report — top 3 fixes | تقرير مدار السريع",
              body: report.issues
                .map((i, n) => `${n + 1}. ${i.title.en} — ${i.fix.en} (${i.benefit.en})\n${n + 1}. ${i.title.ar} — ${i.fix.ar} (${i.benefit.ar})`)
                .join("\n\n"),
            });
          }
        } catch (_e) {
          /* report remains available in-app; delivery failure is non-fatal */
        }

        return Response.json({
          subscription: updated,
          trial: assessTrialState(updated, now),
          entitlementPlan: resolveEntitlementPlan(updated, now),
          report,
        });
      }

      case "get_report": {
        let sub = await ensureSubscription();
        sub = await enforceTrialState(sub);
        // Full list only with VERIFIED payment — an active trial still sees
        // the top 3 (upgrade unlocks the rest).
        const fullAccess = sub.paymentStatus === "paid";
        const properties = await sr.entities.UserProperty.filter({ userId: user.id });
        return Response.json({ report: buildQuickReport(properties, { fullAccess }) });
      }

      case "check_property_limit": {
        let sub = await ensureSubscription();
        sub = await enforceTrialState(sub);
        const properties = await sr.entities.UserProperty.filter({ userId: user.id });
        // Limits follow the EFFECTIVE entitlement plan (trial=growth, expired=free).
        const result = assessPropertyLimit(resolveEntitlementPlan(sub, now), properties.length);
        return Response.json(
          result.allowed
            ? result
            : { ...result, message: "Property limit reached for your plan" }
        );
      }

      case "upgrade": {
        // Paid checkout is intentionally not implemented. Plan changes must go
        // through a trusted, payment-verified path. Direct self-upgrade is
        // disabled so a normal user can never grant themselves a paid plan.
        return Response.json(
          { error: UPGRADE_UNAVAILABLE.ar, error_en: UPGRADE_UNAVAILABLE.en },
          { status: 501 }
        );
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
