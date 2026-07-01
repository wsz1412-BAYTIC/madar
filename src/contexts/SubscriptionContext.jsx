import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { SUBSCRIPTION_STATUS, hasFeatureAccess } from '@/lib/subscriptionEntitlements';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);
        const user = await base44.auth.me();
        
        // Get user subscription
        const subs = await base44.entities.UserSubscription.filter({ userId: user.id });
        
        if (subs && subs.length > 0) {
          const sub = subs[0];
          setSubscription(sub);
          
          // Parse add-ons (stored as JSON string or array)
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

    // Check feature access
    return hasFeatureAccess(getPlanName(), featurePath);
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
      const user = await base44.auth.me();
      const subs = await base44.entities.UserSubscription.filter({ userId: user.id });
      
      if (subs && subs.length > 0) {
        setSubscription(subs[0]);
        setAddOns(subs[0].addOns || []);
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