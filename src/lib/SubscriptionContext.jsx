import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { madarApi } from "@/api/madarApi";
import { useMadarAuth } from "@/lib/MadarAuthContext";

/**
 * SubscriptionContext — fetches the user's subscription tier once after login
 * and exposes it so any component can tier-gate features.
 *
 * Tier hierarchy: free < basic < growth < pro
 */
const SubscriptionContext = createContext();

const TIER_RANK = { free: 0, basic: 1, growth: 2, pro: 3 };

export function SubscriptionProvider({ children }) {
  const { isAuthenticated } = useMadarAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const data = await madarApi.getSubscription();
      setSubscription(data);
    } catch {
      // If subscription fetch fails, default to free tier
      setSubscription({ tier: "free" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchSubscription]);

  const tier = subscription?.tier || "free";
  const tierRank = TIER_RANK[tier] ?? 0;

  const hasTier = useCallback(
    (required) => {
      const requiredRank = TIER_RANK[required] ?? 0;
      return tierRank >= requiredRank;
    },
    [tierRank]
  );

  const refresh = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{ subscription, tier, loading, hasTier, refresh }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}

export default SubscriptionContext;