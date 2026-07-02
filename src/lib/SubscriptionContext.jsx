import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const SubscriptionContext = createContext();

const TIER_RANK = { free: 0, starter: 1, growth: 2, pro: 3 };

export function SubscriptionProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("manageSubscription", {
        action: "get_current",
      });
      const sub = response.data?.subscription || { plan: "free", status: "active", usage_limit: 1, usage_count: 0 };
      setSubscription({ tier: sub.plan || "free", ...sub });
    } catch {
      setSubscription({ tier: "free", status: "active", usage_limit: 1, usage_count: 0 });
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