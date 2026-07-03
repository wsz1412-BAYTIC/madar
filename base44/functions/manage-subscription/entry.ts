// Deno backend function: subscription onboarding & self-service reads for Madar.
//
// Ported from the Base44 live export's `manageSubscription`, adapted to Madar's
// UserSubscription schema (userId/planId/planName/startDate/status) and AuditLog
// schema. Writes go through asServiceRole (role=admin) because UserSubscription
// create/update RLS is admin-only — a normal user can never self-provision or
// self-upgrade from the client, which is the whole point of routing this through
// a trusted backend function.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  buildFreeSubscription,
  assessPropertyLimit,
  UPGRADE_UNAVAILABLE,
} from "./subscriptionProvisioning.js";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const sr = base44.asServiceRole;
    const now = new Date().toISOString();

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
        timestamp: now,
        details: details || {},
      });
    };

    // ── Idempotent: return the user's subscription, auto-provisioning Free once. ──
    const ensureSubscription = async () => {
      const subs = await sr.entities.UserSubscription.filter({ userId: user.id });
      if (subs && subs.length > 0) return subs[0];

      const payload = buildFreeSubscription(user.id, now);
      const created = await sr.entities.UserSubscription.create(payload);
      await logAction(created.id, "subscription_change", null, {
        planName: "free",
        status: "active",
        note: "Auto-provisioned free plan",
      });
      return created;
    };

    switch (action) {
      case "get_current": {
        // Auto-provisions Free on first call — safe login/dashboard fallback.
        const sub = await ensureSubscription();
        return Response.json({ subscription: sub });
      }

      case "check_property_limit": {
        const sub = await ensureSubscription();
        const properties = await sr.entities.UserProperty.filter({ userId: user.id });
        const result = assessPropertyLimit(sub.planName, properties.length);
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
