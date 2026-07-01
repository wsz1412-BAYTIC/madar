import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/subscriptionEntitlements';

/**
 * Component that conditionally renders content based on subscription entitlements
 * Does NOT render anything if feature is not accessible (clean dashboard)
 * 
 * Usage:
 * <FeatureGuard feature="analytics.advancedCharts">
 *   <AnalyticsWidget />
 * </FeatureGuard>
 */
export default function FeatureGuard({ feature, children, fallback = null }) {
  const { subscription } = useSubscription();

  if (!subscription) return fallback;

  const planName = subscription.planName || 'free';
  const hasAccess = hasFeatureAccess(planName, feature);

  if (!hasAccess) return fallback;

  return <>{children}</>;
}

/**
 * Hook version for checking feature access
 */
export function useFeatureAccess(featurePath) {
  const { subscription } = useSubscription();
  
  if (!subscription) return false;
  
  const planName = subscription.planName || 'free';
  return hasFeatureAccess(planName, featurePath);
}