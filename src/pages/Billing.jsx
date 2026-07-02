import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const tierOrder = ["free", "starter", "growth", "pro"];

const tierFeatures = {
  free: [
    "Up to 3 properties",
    "Daily pricing briefs",
    "Basic price comparison",
  ],
  starter: [
    "Up to 5 properties",
    "Market insights by city",
    "30-day price history",
    "Competitor comparison",
  ],
  growth: [
    "Up to 50 properties",
    "Advanced analytics",
    "Multi-platform sync",
    "Custom pricing rules",
  ],
  pro: [
    "Unlimited properties",
    "AI pricing assistant",
    "API access",
    "Priority support",
    "Custom reports",
  ],
};

function TierCard({ tier, isCurrent, isUserTier, t }) {
  const tierLabel = t(`billing.tiers.${tier}`);
  const features = tierFeatures[tier] || [];
  const userTierIndex = tierOrder.indexOf(isUserTier);
  const cardTierIndex = tierOrder.indexOf(tier);
  const canUpgradeTo = cardTierIndex > userTierIndex;

  return (
    <div
      className={`border p-8 transition-all duration-300 ${
        isCurrent
          ? "border-accent bg-accent/5"
          : "border-border/50 hover:border-foreground/30"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-light capitalize">{tierLabel}</h3>
        {isCurrent && (
          <span className="font-body text-xs tracking-label uppercase text-accent px-3 py-1 border border-accent/30 rounded-full">
            {t("billing.currentTier")}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <Check size={16} className="text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <span className="font-body text-sm text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {canUpgradeTo && !isCurrent && (
        <div>
          <button
            disabled
            className="ghost-btn w-full text-center text-xs opacity-50 cursor-not-allowed"
          >
            {t("billing.upgrade")}
          </button>
          <p className="font-body text-xs text-muted-foreground text-center mt-3 leading-relaxed">
            {t("billing.paidUpgradeUnavailable")}
          </p>
        </div>
      )}

      {isCurrent && (
        <div className="font-body text-xs tracking-label uppercase text-muted-foreground text-center py-3 border border-border/50">
          {t("billing.currentTier")}
        </div>
      )}
    </div>
  );
}

export default function Billing() {
  const { t, lang } = useLanguage();
  const { subscription, tier } = useSubscription();

  const usageStats = [
    { label: t("billing.propertiesUsed"), used: subscription?.usage_count ?? 0, limit: subscription?.usage_limit ?? 0 },
  ];

  if (!subscription) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-[2%] md:px-[4%] max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
          {lang === "ar" ? "الحساب" : "Account"}
        </p>
        <h1 className="font-display text-display-lg font-light mb-12">
          {t("billing.title")}
        </h1>
      </motion.div>

      {/* Current tier + usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
              {t("billing.currentTier")}
            </p>
            <div className="flex items-center gap-4">
              <Sparkles size={24} className="text-accent" strokeWidth={1} />
              <span className="font-display text-display-md font-light">
                {tier === "free" ? t("billing.freePlanLabel") : t(`billing.tiers.${tier}`)}
              </span>
            </div>
          </div>

          <div>
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
              {t("billing.usage")}
            </p>
            <div className="space-y-4">
              {usageStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm text-muted-foreground">{stat.label}</span>
                    <span className="font-body text-sm">
                      {stat.used ?? 0}
                      {stat.limit ? ` / ${stat.limit}` : ""}
                    </span>
                  </div>
                  {stat.limit && (
                    <div className="h-px bg-border/50 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-accent transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((stat.used || 0) / stat.limit) * 100)}%`,
                          height: "2px",
                          top: "-0.5px",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="hairline mb-16" />

      {/* Tier comparison */}
      <div>
        <h2 className="font-display text-display-md font-light mb-12">
          {t("billing.upgrade")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tierOrder.map((tierName) => (
            <TierCard
              key={tierName}
              tier={tierName}
              isCurrent={tier === tierName}
              isUserTier={tier}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}