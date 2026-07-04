import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { SUBSCRIPTION_STATUS, hasFeatureAccess } from '@/lib/subscriptionEntitlements';
import { assessTrialState, resolveEntitlementPlan } from '@/lib/trialManagement';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  // Server-computed trial state + effective entitlement plan (trial→growth,
  // expired→free, paid→paid plan). Falls back to local resolution.
  const [trial, setTrial] = useState(null);
  const [entitlementPlan, setEntitlementPlan] = useState('free');
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);

        // Auto-provisions a Free subscription on first call (idempotent) and
        // returns the user's real subscription. Normal users cannot create a
        // subscription directly (admin-only RLS), so this must go through the
        // trusted backend function rather than a client-side entity write.
        const res = await base44.functions.invoke('manage-subscription', { action: 'get_current' });
        const sub = res?.data?.subscription;

        if (sub) {
          setSubscription(sub);
          setTrial(res?.data?.trial || assessTrialState(sub));
          setEntitlementPlan(res?.data?.entitlementPlan || resolveEntitlementPlan(sub));
          const addOnsData = sub.addOns || [];
          setAddOns(Array.isArray(addOnsData) ? addOnsData : []);
        } else {
          // Default to free plan
          setSubscription({
            planName: 'free',
            status: 'active',
            addOns: [],
          });
          setAddOns([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError(err);
        // Fallback to free plan
        setSubscription({
          planName: 'free',
          status: 'active',
          addOns: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const getPlanName = () => {
    return subscription?.planName || 'free';
  };

  const getStatus = () => {
    return subscription?.status || 'active';
  };

  const canAccessFeature = (featurePath) => {
    if (!subscription) return false;

    const statusInfo = SUBSCRIPTION_STATUS[getStatus()];
    if (!statusInfo?.canAccess) return false;

    // Effective plan, not the stored label: an active trial gets exactly
    // Growth entitlements (Pro stays locked); an expired trial gets Free.
    // The backend enforces the same via resolveEntitlementPlan on every call.
    return hasFeatureAccess(entitlementPlan || resolveEntitlementPlan(subscription), featurePath);
  };

  const hasAddOn = (addOnId) => {
    return addOns.includes(addOnId);
  };

  const isActive = () => {
    return subscription?.status === 'active' || subscription?.status === 'trial';
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await base44.functions.invoke('manage-subscription', { action: 'get_current' });
      const sub = res?.data?.subscription;

      if (sub) {
        setSubscription(sub);
        setTrial(res?.data?.trial || assessTrialState(sub));
        setEntitlementPlan(res?.data?.entitlementPlan || resolveEntitlementPlan(sub));
        setAddOns(sub.addOns || []);
      }
    } catch (err) {
      console.error('Error refreshing subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        trial,
        entitlementPlan,
        addOns,
        loading,
        error,
        getPlanName,
        getStatus,
        canAccessFeature,
        hasAddOn,
        isActive,
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}