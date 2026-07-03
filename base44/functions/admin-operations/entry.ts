// Deno backend function: privileged admin operations for Madar.
//
// Ported from the Base44 live export's `adminOperations`, adapted to Madar's
// entity/field convention. Every request re-checks `user.role === 'admin'`
// server-side (frontend AdminRoute is UX-only and must never be trusted). Every
// sensitive mutation is recorded to AuditLog with actor, target, before/after,
// and timestamp. Mutations run through asServiceRole so they succeed under the
// admin-only RLS write policies.
import { createClientFromRequest } from "npm:@base44/sdk";
import {
  validateRoleChange,
  validateSelfMutation,
  pickSubscriptionUpdates,
  buildAuditEntry,
} from "./adminMutations.js";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    // Canonical server-side admin gate — single source of truth for access.
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const sr = base44.asServiceRole;

    const audit = (entry) =>
      sr.entities.AuditLog.create(buildAuditEntry(user, entry, new Date().toISOString()));

    switch (action) {
      // ── User management ──
      case "list_users": {
        const users = await sr.entities.User.list();
        await audit({
          action: "admin_data_access",
          targetType: "User",
          details: { note: "Listed all users", count: users.length },
        });
        return Response.json({ users });
      }

      case "manage_user": {
        const { target_user_id, operation, new_role, reason } = body;

        if (operation === "change_role") {
          const check = validateRoleChange({
            actingUserId: user.id,
            targetUserId: target_user_id,
            newRole: new_role,
          });
          if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

          const targetUser = await sr.entities.User.get(target_user_id);
          if (!targetUser) return Response.json({ error: "User not found" }, { status: 404 });

          const updated = await sr.entities.User.update(target_user_id, { role: new_role });
          await audit({
            action: "role_change",
            targetType: "User",
            targetId: target_user_id,
            targetName: targetUser.email || null,
            previousValue: { role: targetUser.role },
            newValue: { role: new_role },
            details: { reason: reason || null },
          });
          return Response.json({ user: updated });
        }

        if (operation === "delete_user") {
          const check = validateSelfMutation({
            actingUserId: user.id,
            targetUserId: target_user_id,
            operation: "delete",
          });
          if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

          const targetUser = await sr.entities.User.get(target_user_id);
          if (!targetUser) return Response.json({ error: "User not found" }, { status: 404 });

          await sr.entities.User.delete(target_user_id);
          await audit({
            action: "user_deletion",
            targetType: "User",
            targetId: target_user_id,
            targetName: targetUser.email || null,
            previousValue: { role: targetUser.role, email: targetUser.email },
            details: { reason: reason || "User deleted by admin" },
          });
          return Response.json({ success: true });
        }

        return Response.json({ error: "Unknown operation" }, { status: 400 });
      }

      // ── Subscription management ──
      case "list_subscriptions": {
        const subscriptions = await sr.entities.UserSubscription.list();
        return Response.json({ subscriptions });
      }

      case "update_subscription": {
        const { target_user_id, reason } = body;
        if (!target_user_id) {
          return Response.json({ error: "target_user_id required" }, { status: 400 });
        }
        const subs = await sr.entities.UserSubscription.filter({ userId: target_user_id });
        if (!subs || subs.length === 0) {
          return Response.json({ error: "Subscription not found for this user" }, { status: 404 });
        }
        const sub = subs[0];
        const updates = pickSubscriptionUpdates(body);
        if (Object.keys(updates).length === 0) {
          return Response.json({ error: "No valid fields to update" }, { status: 400 });
        }
        const prev = {
          planName: sub.planName,
          status: sub.status,
          renewalDate: sub.renewalDate,
          usageLimit: sub.usageLimit,
          paymentStatus: sub.paymentStatus,
        };
        const updated = await sr.entities.UserSubscription.update(sub.id, updates);
        await audit({
          action: "subscription_change",
          targetType: "UserSubscription",
          targetId: sub.id,
          targetName: target_user_id,
          previousValue: prev,
          newValue: updates,
          details: { reason: reason || "Subscription updated by admin" },
        });
        return Response.json({ subscription: updated });
      }

      // ── Read-only customer data inspection ──
      case "get_customer_properties": {
        const { target_user_id } = body;
        if (!target_user_id) {
          return Response.json({ error: "target_user_id required" }, { status: 400 });
        }
        const properties = await sr.entities.UserProperty.filter({ userId: target_user_id });
        return Response.json({ properties });
      }

      case "get_customer_recommendations": {
        const { target_user_id } = body;
        if (!target_user_id) {
          return Response.json({ error: "target_user_id required" }, { status: 400 });
        }
        const recommendations = await sr.entities.PriceRecommendation.filter({ userId: target_user_id });
        return Response.json({ recommendations });
      }

      // ── Audit logs ──
      case "list_audit_logs": {
        const limit = body.limit || 100;
        const logs = await sr.entities.AuditLog.list("-timestamp", limit);
        return Response.json({ audit_logs: logs });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
