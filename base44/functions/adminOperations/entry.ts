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

      // ── Trial reactivation approval ──
      case 'approve_trial_reactivation': {
        const { target_user_id, reason } = body;
        if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });

        const subs = await sr.entities.UserSubscription.filter({ owner_id: target_user_id });
        if (!subs || subs.length === 0) {
          return Response.json({ error: 'Subscription not found for this user' }, { status: 404 });
        }
        const sub = subs[0];
        const prev = { trial_used_at: sub.trial_used_at, trial_status: sub.trial_status };

        const updated = await sr.entities.UserSubscription.update(sub.id, {
          trial_used_at: null,
          trial_status: 'none'
        });
        await logAction(sub.id, 'UserSubscription', 'subscription_change', prev, {
          trial_used_at: null, trial_status: 'none', note: reason || 'Trial reactivation approved by admin'
        });
        return Response.json({ subscription: updated });
      }

      // ── Audit logs ──
      case 'list_audit_logs': {
        const limit = body.limit || 100;
        const logs = await sr.entities.AuditLog.list('-created_date', limit);
        return Response.json({ audit_logs: logs });
      }

      // ── All user properties (platform-wide) ──
      case 'list_all_properties': {
        const limit = body.limit || 500;
        const props = await sr.entities.UserProperty.list('-created_date', limit);
        const userIds = [...new Set(props.map(p => p.created_by_id).filter(Boolean))];
        const userMap = {};
        for (const uid of userIds) {
          try {
            const u = await sr.entities.User.get(uid);
            if (u) userMap[uid] = { full_name: u.full_name, email: u.email };
          } catch { /* skip missing */ }
        }
        await logAction(null, 'UserProperty', 'admin_data_access', null, null, 'Listed all user properties');
        return Response.json({ properties: props, userMap });
      }

      // ── Toggle property active state ──
      case 'toggle_property_active': {
        const { property_id, is_active } = body;
        if (!property_id) return Response.json({ error: 'property_id required' }, { status: 400 });
        const prop = await sr.entities.UserProperty.get(property_id);
        if (!prop) return Response.json({ error: 'Property not found' }, { status: 404 });
        const prev = { is_active: prop.is_active };
        const updated = await sr.entities.UserProperty.update(property_id, { is_active });
        await logAction(property_id, 'UserProperty', 'admin_data_modification', prev, { is_active }, `Property ${is_active ? 'activated' : 'deactivated'} by admin`);
        return Response.json({ property: updated });
      }

      // ── Delete a property ──
      case 'delete_property': {
        const { property_id, reason } = body;
        if (!property_id) return Response.json({ error: 'property_id required' }, { status: 400 });
        const prop = await sr.entities.UserProperty.get(property_id);
        if (!prop) return Response.json({ error: 'Property not found' }, { status: 404 });
        const prev = { property_name: prop.property_name, city: prop.city };
        await sr.entities.UserProperty.delete(property_id);
        await logAction(property_id, 'UserProperty', 'admin_data_modification', prev, null, reason || 'Property deleted by admin');
        return Response.json({ success: true });
      }

      // ── Full user history / activity timeline ──
      case 'get_user_history': {
        const { target_user_id } = body;
        if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });

        const [props, recs, perfs, consents, aiLogs, auditLogs] = await Promise.allSettled([
          sr.entities.UserProperty.filter({ created_by_id: target_user_id }),
          sr.entities.PriceRecommendation.filter({ created_by_id: target_user_id }),
          sr.entities.PropertyPerformance.filter({ created_by_id: target_user_id }),
          sr.entities.ConsentRecord.filter({ userId: target_user_id }),
          sr.entities.AiUsageLog.filter({ userId: target_user_id }),
          sr.entities.AuditLog.filter({ acting_user_id: target_user_id }),
        ]);

        const safe = (r, fallback = []) => r.status === 'fulfilled' ? (r.value || fallback) : fallback;

        const events = [];

        // Properties
        safe(props).forEach((p) => {
          events.push({
            type: 'property',
            date: p.created_date,
            title: `Property added: ${p.property_name || p.city}`,
            details: { city: p.city, platform: p.platform, price: p.price, is_active: p.is_active },
            id: p.id,
          });
        });

        // Recommendations
        safe(recs).forEach((r) => {
          events.push({
            type: 'recommendation',
            date: r.created_date,
            title: `Price recommendation: ${r.recommended_price} SAR`,
            details: { status: r.status, confidence: r.confidence_score, current: r.current_price },
            id: r.id,
          });
        });

        // Performance
        safe(perfs).forEach((p) => {
          events.push({
            type: 'performance',
            date: p.created_date,
            title: `Performance recorded: ${p.period_start} → ${p.period_end}`,
            details: { occupancy: p.occupancy_rate, adr: p.adr, revenue: p.total_revenue },
            id: p.id,
          });
        });

        // Consents
        safe(consents).forEach((c) => {
          events.push({
            type: 'consent',
            date: c.consentedAt || c.created_date,
            title: c.withdrawn ? `Consent withdrawn: ${c.policyKey}` : `Consent given: ${c.policyKey}`,
            details: { version: c.policyVersion, source: c.source },
            id: c.id,
          });
        });

        // AI usage
        safe(aiLogs).forEach((a) => {
          events.push({
            type: 'ai_usage',
            date: a.createdAt || a.created_date,
            title: `AI call: ${a.functionName}`,
            details: { status: a.status, plan: a.plan, model: a.model, detail: a.detail },
            id: a.id,
          });
        });

        // Audit actions
        safe(auditLogs).forEach((l) => {
          events.push({
            type: 'audit',
            date: l.created_date,
            title: `Admin action: ${l.action}`,
            details: { entity: l.target_entity, notes: l.notes },
            id: l.id,
          });
        });

        // Sort newest first
        events.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        const targetUser = await sr.entities.User.get(target_user_id).catch(() => null);

        return Response.json({
          user: targetUser ? { id: targetUser.id, full_name: targetUser.full_name, email: targetUser.email, role: targetUser.role, created_date: targetUser.created_date } : null,
          events,
          counts: {
            properties: safe(props).length,
            recommendations: safe(recs).length,
            performance: safe(perfs).length,
            consents: safe(consents).length,
            ai_calls: safe(aiLogs).length,
            admin_actions: safe(auditLogs).length,
          },
        });
      }

      // ── Export financial & investment reports ──
      case 'export_reports': {
        const reportTypes = body.report_types || ['financial', 'investment', 'subscriptions', 'ai_usage'];

        const fetchers = {};
        if (reportTypes.includes('financial')) {
          fetchers.recommendations = sr.entities.PriceRecommendation.list('-created_date', 500);
          fetchers.performance = sr.entities.PropertyPerformance.list('-created_date', 500);
        }
        if (reportTypes.includes('investment')) {
          fetchers.investments = sr.entities.InvestmentAnalysis.list('-created_date', 500);
        }
        if (reportTypes.includes('subscriptions')) {
          fetchers.subscriptions = sr.entities.UserSubscription.list();
        }
        if (reportTypes.includes('ai_usage')) {
          fetchers.aiUsage = sr.entities.AiUsageLog.list('-created_date', 1000);
        }

        const entries = Object.entries(fetchers);
        const results = await Promise.allSettled(entries.map(([, p]) => p));
        const data = {};
        entries.forEach(([key], i) => {
          data[key] = results[i].status === 'fulfilled' ? (results[i].value || []) : [];
        });

        // Resolve owner names
        const ownerIds = new Set();
        (data.recommendations || []).forEach((r) => { if (r.created_by_id) ownerIds.add(r.created_by_id); });
        (data.performance || []).forEach((p) => { if (p.created_by_id) ownerIds.add(p.created_by_id); });
        (data.investments || []).forEach((a) => { if (a.userId) ownerIds.add(a.userId); });
        (data.aiUsage || []).forEach((a) => { if (a.userId) ownerIds.add(a.userId); });

        const userMap = {};
        for (const uid of ownerIds) {
          try {
            const u = await sr.entities.User.get(uid);
            if (u) userMap[uid] = { full_name: u.full_name, email: u.email };
          } catch { /* skip */ }
        }

        await logAction(null, 'Report', 'admin_data_access', null, null, `Exported reports: ${reportTypes.join(', ')}`);
        return Response.json({ data, userMap, generated_at: new Date().toISOString() });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});