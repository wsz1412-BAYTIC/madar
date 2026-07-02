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

    // ── Idempotent: creates free subscription if none exists, returns existing if present ──
    const ensureSubscription = async () => {
      const subs = await sr.entities.UserSubscription.filter({ owner_id: user.id });
      if (subs && subs.length > 0) return subs[0];

      const newSub = await sr.entities.UserSubscription.create({
        owner_id: user.id,
        plan: 'free',
        status: 'active',
        usage_count: 0,
        usage_limit: PLAN_LIMITS.free.properties,
        payment_status: 'not_required',
        started_at: new Date().toISOString(),
        renewal_date: null
      });
      await logAction(newSub.id, 'UserSubscription', 'subscription_change', null, {
        plan: 'free', status: 'active', note: 'Auto-provisioned free plan'
      });
      return newSub;
    };

    switch (action) {
      case 'get_current': {
        // Auto-provisions free subscription on first call — serves as login/dashboard fallback
        const sub = await ensureSubscription();
        return Response.json({ subscription: sub });
      }

      case 'check_property_limit': {
        const sub = await ensureSubscription();
        const limit = PLAN_LIMITS[sub.plan] ? PLAN_LIMITS[sub.plan].properties : 1;

        const properties = await base44.entities.UserProperty.list();
        const count = properties.length;

        if (count >= limit) {
          return Response.json({ allowed: false, plan: sub.plan, limit, count, message: 'Property limit reached for your plan' });
        }
        return Response.json({ allowed: true, plan: sub.plan, limit, count });
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

      case 'upgrade': {
        // Paid checkout is not implemented yet.
        // Plan changes must go through a trusted backend function with payment verification.
        // Direct self-upgrade is disabled for security.
        return Response.json({
          error: 'الترقية المدفوعة غير متاحة حاليًا',
          error_en: 'Paid upgrades are currently unavailable'
        }, { status: 501 });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});