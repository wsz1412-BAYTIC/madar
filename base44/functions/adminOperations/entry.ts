import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: admin access required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;
    const sr = base44.asServiceRole;

    // ── Audit log helper ──
    const logAction = async (targetId, targetEntity, actionType, prevVal, newVal, notes) => {
      await sr.entities.AuditLog.create({
        acting_user_id: user.id,
        acting_user_email: user.email,
        target_record_id: targetId || null,
        target_entity: targetEntity,
        action: actionType,
        previous_value: prevVal || null,
        new_value: newVal || null,
        notes: notes || null
      });
    };

    switch (action) {
      // ── User management ──
      case 'list_users': {
        const users = await sr.entities.User.list();
        await logAction(null, 'User', 'admin_data_access', null, null, 'Listed all users');
        return Response.json({ users });
      }

      case 'manage_user': {
        const { target_user_id, operation, new_role, reason } = body;
        if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });

        const targetUser = await sr.entities.User.get(target_user_id);
        if (!targetUser) return Response.json({ error: 'User not found' }, { status: 404 });

        const prev = { role: targetUser.role, full_name: targetUser.full_name, email: targetUser.email };
        let updates = {};

        if (operation === 'change_role') {
          if (!['admin', 'user'].includes(new_role)) {
            return Response.json({ error: 'Invalid role. Allowed: admin, user' }, { status: 400 });
          }
          if (target_user_id === user.id) {
            return Response.json({ error: 'Cannot change your own role' }, { status: 400 });
          }
          updates.role = new_role;
          const updated = await sr.entities.User.update(target_user_id, updates);
          await logAction(target_user_id, 'User', 'role_change', prev, updates, reason || `Role changed to ${new_role}`);
          return Response.json({ user: updated });
        }

        if (operation === 'delete_user') {
          if (target_user_id === user.id) {
            return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
          }
          await sr.entities.User.delete(target_user_id);
          await logAction(target_user_id, 'User', 'user_deletion', prev, null, reason || 'User deleted by admin');
          return Response.json({ success: true });
        }

        return Response.json({ error: 'Unknown operation' }, { status: 400 });
      }

      // ── Subscription management ──
      case 'list_subscriptions': {
        const subs = await sr.entities.UserSubscription.list();
        return Response.json({ subscriptions: subs });
      }

      case 'update_subscription': {
        const { target_user_id, plan, status, renewal_date, usage_limit, payment_status, reason } = body;
        if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });

        const subs = await sr.entities.UserSubscription.filter({ owner_id: target_user_id });
        if (!subs || subs.length === 0) {
          return Response.json({ error: 'Subscription not found for this user' }, { status: 404 });
        }

        const sub = subs[0];
        const prev = { plan: sub.plan, status: sub.status, renewal_date: sub.renewal_date, usage_limit: sub.usage_limit, payment_status: sub.payment_status };

        const updates = {};
        if (plan !== undefined) updates.plan = plan;
        if (status !== undefined) updates.status = status;
        if (renewal_date !== undefined) updates.renewal_date = renewal_date;
        if (usage_limit !== undefined) updates.usage_limit = usage_limit;
        if (payment_status !== undefined) updates.payment_status = payment_status;

        const updated = await sr.entities.UserSubscription.update(sub.id, updates);
        await logAction(sub.id, 'UserSubscription', 'subscription_change', prev, updates, reason || 'Subscription updated by admin');
        return Response.json({ subscription: updated });
      }

      // ── Customer data inspection ──
      case 'get_customer_properties': {
        const { target_user_id } = body;
        if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });
        const props = await sr.entities.UserProperty.filter({ created_by_id: target_user_id });
        return Response.json({ properties: props });
      }

      case 'get_customer_recommendations': {
        const { target_user_id } = body;
        if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });
        const recs = await sr.entities.PriceRecommendation.filter({ created_by_id: target_user_id });
        return Response.json({ recommendations: recs });
      }

      case 'get_customer_performance': {
        const { target_user_id } = body;
        if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });
        const perfs = await sr.entities.PropertyPerformance.filter({ created_by_id: target_user_id });
        return Response.json({ performance: perfs });
      }

      // ── Audit logs ──
      case 'list_audit_logs': {
        const limit = body.limit || 100;
        const logs = await sr.entities.AuditLog.list('-created_date', limit);
        return Response.json({ audit_logs: logs });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});