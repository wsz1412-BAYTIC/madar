import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;
    const sr = base44.asServiceRole;

    // ── Audit log helper ──
    const logAction = async (targetId, targetEntity, actionType, prevVal, newVal) => {
      await sr.entities.AuditLog.create({
        acting_user_id: user.id,
        acting_user_email: user.email,
        target_record_id: targetId || null,
        target_entity: targetEntity,
        action: actionType,
        previous_value: prevVal || null,
        new_value: newVal || null
      });
    };

    // ── Plan limits (enforced server-side) ──
    const PLAN_LIMITS = {
      free: { properties: 1 },
      starter: { properties: 5 },
      growth: { properties: 25 },
      pro: { properties: 100 }
    };

    switch (action) {
      case 'get_current': {
        const subs = await sr.entities.UserSubscription.filter({ owner_id: user.id });
        if (!subs || subs.length === 0) {
          return Response.json({ subscription: { plan: 'free', status: 'active', usage_limit: PLAN_LIMITS.free.properties, usage_count: 0 } });
        }
        return Response.json({ subscription: subs[0] });
      }

      case 'upgrade': {
        const { new_plan } = body;
        if (!['starter', 'growth', 'pro'].includes(new_plan)) {
          return Response.json({ error: 'Invalid plan. Allowed: starter, growth, pro' }, { status: 400 });
        }

        // Find existing subscription
        const subs = await sr.entities.UserSubscription.filter({ owner_id: user.id });
        let sub = subs && subs.length > 0 ? subs[0] : null;

        if (!sub) {
          // Create new subscription (service role bypasses RLS create rule)
          sub = await sr.entities.UserSubscription.create({
            owner_id: user.id,
            plan: new_plan,
            status: 'active',
            payment_status: 'pending',
            usage_limit: PLAN_LIMITS[new_plan].properties,
            usage_count: 0
          });
          await logAction(sub.id, 'UserSubscription', 'subscription_change', null, { plan: new_plan, status: 'active' });
        } else {
          const prev = { plan: sub.plan, status: sub.status, usage_limit: sub.usage_limit };
          sub = await sr.entities.UserSubscription.update(sub.id, {
            plan: new_plan,
            status: 'active',
            usage_limit: PLAN_LIMITS[new_plan].properties
          });
          await logAction(sub.id, 'UserSubscription', 'subscription_change', prev, { plan: new_plan, usage_limit: PLAN_LIMITS[new_plan].properties });
        }

        return Response.json({ subscription: sub });
      }

      case 'check_property_limit': {
        // Enforce plan limits on property creation
        const subs = await sr.entities.UserSubscription.filter({ owner_id: user.id });
        const plan = subs && subs.length > 0 ? subs[0].plan : 'free';
        const limit = PLAN_LIMITS[plan] ? PLAN_LIMITS[plan].properties : 1;

        const properties = await base44.entities.UserProperty.list();
        const count = properties.length;

        if (count >= limit) {
          return Response.json({ allowed: false, plan, limit, count, message: 'Property limit reached for your plan' });
        }
        return Response.json({ allowed: true, plan, limit, count });
      }

      case 'accept_recommendation': {
        const { recommendation_id, accepted_price } = body;
        if (!recommendation_id) return Response.json({ error: 'recommendation_id required' }, { status: 400 });

        // User-scoped read — RLS ensures user can only access their own
        const recs = await base44.entities.PriceRecommendation.filter({ id: recommendation_id });
        if (!recs || recs.length === 0) {
          return Response.json({ error: 'Recommendation not found' }, { status: 404 });
        }
        const rec = recs[0];

        const prev = { status: rec.status, current_price: rec.current_price };
        const updated = await base44.entities.PriceRecommendation.update(recommendation_id, {
          status: 'accepted',
          current_price: accepted_price || rec.recommended_price
        });

        // Create history record (user-scoped, RLS allows)
        await base44.entities.RecommendationHistory.create({
          recommendation_id: recommendation_id,
          user_property_id: rec.user_property_id,
          action: 'accepted',
          previous_price: rec.current_price,
          new_price: accepted_price || rec.recommended_price
        });

        await logAction(recommendation_id, 'PriceRecommendation', 'manual_pricing_override', prev, { status: 'accepted', current_price: accepted_price || rec.recommended_price });
        return Response.json({ recommendation: updated });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});