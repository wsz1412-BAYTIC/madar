import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TRIAL_DAYS = 14;

const PLAN_LIMITS = {
  free: { properties: 1 },
  starter: { properties: 5 },
  growth: { properties: 25 },
  pro: { properties: 100 }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;
    const sr = base44.asServiceRole;

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

    // ── Entitlement resolution: paid > active trial > free ──
    const resolveEntitlementPlan = (sub) => {
      if (!sub) return 'free';
      if (sub.payment_status === 'paid') return sub.plan;
      if (sub.trial_status === 'active' && sub.trial_ends_at) {
        if (new Date(sub.trial_ends_at).getTime() > Date.now()) return 'growth';
      }
      return 'free';
    };

    // ── Auto-expire stale trials ──
    const expireTrialIfNeeded = async (sub) => {
      if (sub.trial_status === 'active' && sub.trial_ends_at &&
          new Date(sub.trial_ends_at).getTime() <= Date.now()) {
        return await sr.entities.UserSubscription.update(sub.id, { trial_status: 'expired' });
      }
      return sub;
    };

    // ── Idempotent: creates free subscription if none exists ──
    const ensureSubscription = async () => {
      const subs = await sr.entities.UserSubscription.filter({ owner_id: user.id });
      if (subs && subs.length > 0) {
        return await expireTrialIfNeeded(subs[0]);
      }
      const newSub = await sr.entities.UserSubscription.create({
        owner_id: user.id,
        plan: 'free',
        status: 'active',
        usage_count: 0,
        usage_limit: PLAN_LIMITS.free.properties,
        payment_status: 'not_required',
        trial_status: 'none',
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
        const sub = await ensureSubscription();
        return Response.json({
          subscription: sub,
          effective_plan: resolveEntitlementPlan(sub)
        });
      }

      case 'activate_trial': {
        const sub = await ensureSubscription();

        if (sub.payment_status === 'paid') {
          return Response.json({ error: 'Paid subscribers cannot activate a trial' }, { status: 400 });
        }
        if (sub.trial_used_at) {
          return Response.json({ error: 'Trial already used on this account' }, { status: 403 });
        }
        if (sub.trial_status === 'active' && sub.trial_ends_at &&
            new Date(sub.trial_ends_at).getTime() > Date.now()) {
          return Response.json({ error: 'Trial is already active' }, { status: 400 });
        }

        const now = new Date();
        const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        const prev = {
          plan: sub.plan, payment_status: sub.payment_status,
          trial_status: sub.trial_status, trial_ends_at: sub.trial_ends_at
        };

        const updated = await sr.entities.UserSubscription.update(sub.id, {
          plan: 'growth',
          payment_status: 'trial',
          trial_status: 'active',
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
          trial_used_at: now.toISOString(),
          usage_limit: PLAN_LIMITS.growth.properties
        });

        await logAction(sub.id, 'UserSubscription', 'subscription_change', prev, {
          plan: 'growth', payment_status: 'trial', trial_status: 'active',
          trial_ends_at: trialEndsAt.toISOString(), note: `${TRIAL_DAYS}-day Growth trial activated`
        });

        return Response.json({
          subscription: updated,
          effective_plan: 'growth',
          trial_ends_at: trialEndsAt.toISOString()
        });
      }

      case 'check_property_limit': {
        const sub = await ensureSubscription();
        const effectivePlan = resolveEntitlementPlan(sub);
        const limit = PLAN_LIMITS[effectivePlan] ? PLAN_LIMITS[effectivePlan].properties : 1;
        const properties = await base44.entities.UserProperty.list();
        const count = properties.length;
        if (count >= limit) {
          return Response.json({ allowed: false, plan: effectivePlan, limit, count, message: 'Property limit reached for your plan' });
        }
        return Response.json({ allowed: true, plan: effectivePlan, limit, count });
      }

      case 'accept_recommendation': {
        const { recommendation_id, accepted_price } = body;
        if (!recommendation_id) return Response.json({ error: 'recommendation_id required' }, { status: 400 });
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
          recommendation_id, user_property_id: rec.user_property_id,
          action: 'accepted', previous_price: rec.current_price,
          new_price: accepted_price || rec.recommended_price
        });
        await logAction(recommendation_id, 'PriceRecommendation', 'manual_pricing_override', prev,
          { status: 'accepted', current_price: accepted_price || rec.recommended_price });
        return Response.json({ recommendation: updated });
      }

      case 'upgrade': {
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