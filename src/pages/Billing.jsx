import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Check, ArrowRight, Sparkles, Gift, Clock, Loader2, Zap } from "lucide-react";

const tierOrder = ["free", "starter", "growth", "pro"];

const tierFeatures = {
  free: ["Up to 3 properties", "Daily pricing briefs", "Basic price comparison"],
  starter: ["Up to 5 properties", "Market insights by city", "30-day price history", "Competitor comparison"],
  growth: ["Up to 50 properties", "Advanced analytics", "Multi-platform sync", "Custom pricing rules"],
  pro: ["Unlimited properties", "AI pricing assistant", "API access", "Priority support", "Custom reports"],
};

function daysRemaining(isoDate) {
  if (!isoDate) return 0;
  const ms = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function TierCard({ tier, isCurrent, isUserTier, t }) {
  const tierLabel = t(`billing.tiers.${tier}`);
  const features = tierFeatures[tier] || [];
  const userTierIndex = tierOrder.indexOf(isUserTier);
  const cardTierIndex = tierOrder.indexOf(tier);
  const canUpgradeTo = cardTierIndex > userTierIndex;

  return (
    <div
      className={`border p-8 transition-all duration-300 ${
        isCurrent ? "border-accent bg-accent/5" : "border-border/50 hover:border-foreground/30"
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
          <button disabled className="ghost-btn w-full text-center text-xs opacity-50 cursor-not-allowed">
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
  const { subscription, tier, refresh } = useSubscription();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);

  const usageStats = [
    { label: t("billing.propertiesUsed"), used: subscription?.usage_count ?? 0, limit: subscription?.usage_limit ?? 0 },
  ];

  const trialStatus = subscription?.trial_status || "none";
  const trialEndsAt = subscription?.trial_ends_at;
  const trialUsedAt = subscription?.trial_used_at;
  const isTrialActive = trialStatus === "active" && trialEndsAt && new Date(trialEndsAt).getTime() > Date.now();
  const trialDaysLeft = daysRemaining(trialEndsAt);
  const canActivateTrial = tier === "free" && !trialUsedAt && !isTrialActive;

  const handleActivateTrial = async () => {
    setActivating(true);
    try {
      const res = await base44.functions.invoke("manageSubscription", { action: "activate_trial" });
      if (res.data?.error) {
        toast({ title: res.data.error, variant: "destructive" });
      } else {
        toast({ title: t("trial.activated") });
        await refresh();
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || t("common.error");
      toast({ title: msg, variant: "destructive" });
    } finally {
      setActivating(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

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
            <div className="flex items-center gap-4 flex-wrap">
              <Sparkles size={24} className="text-accent" strokeWidth={1} />
              <span className="font-display text-display-md font-light">
                {tier === "free" ? t("billing.freePlanLabel") : t(`billing.tiers.${tier}`)}
              </span>
              {isTrialActive && (
                <span className="inline-flex items-center gap-1.5 font-body text-xs tracking-label uppercase text-accent px-3 py-1 border border-accent/30 rounded-full">
                  <Zap size={12} strokeWidth={2} />
                  {t("trial.badge")}
                </span>
              )}
            </div>
            {isTrialActive && (
              <p className="font-body text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <Clock size={12} className="text-accent" strokeWidth={1.5} />
                {trialDaysLeft} {t("trial.daysLeft")} · {t("trial.endsOn")} {formatDate(trialEndsAt)}
              </p>
            )}
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

      {/* Trial section */}
      {canActivateTrial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-16"
        >
          <div className="border border-accent/30 bg-accent/5 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Gift size={24} className="text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-xl font-light mb-1">
                  {t("trial.activate")}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {t("trial.activateDesc")}
                </p>
              </div>
            </div>
            <button
              onClick={handleActivateTrial}
              disabled={activating}
              className="flex items-center gap-2 px-6 h-10 rounded-full bg-accent text-accent-foreground font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex-shrink-0"
            >
              {activating ? (
                <>
                  <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                  {t("trial.activating")}
                </>
              ) : (
                <>
                  <Zap size={16} strokeWidth={1.5} />
                  {t("trial.activate")}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {trialUsedAt && !isTrialActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-16"
        >
          <div className="border border-border/50 rounded-2xl p-8 flex items-start gap-4">
            <Clock size={20} className="text-muted-foreground flex-shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-lg font-light mb-1">
                {t("trial.used")}
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                {t("trial.usedDesc")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

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