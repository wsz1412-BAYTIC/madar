import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { madarApi, MadarError } from "@/api/madarApi";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useToast } from "@/components/ui/use-toast";
import OpportunityWallet from "@/components/dashboard/OpportunityWallet";
import WhatWouldMadarDo from "@/components/dashboard/WhatWouldMadarDo";
import ActionCenter from "@/components/dashboard/ActionCenter";
import MarketStatus from "@/components/dashboard/MarketStatus";
import { Building2, BarChart3, MapPin } from "lucide-react";

function DashboardLink({ to, icon: Icon, label }) {
  return (
    <div className="border-b border-border/30">
      <Link
        to={to}
        className="flex items-center gap-3 py-5 font-display text-lg font-light hover:text-accent transition-colors"
      >
        <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
        {label}
      </Link>
    </div>
  );
}

export default function UserDashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();

  const [opportunities, setOpportunities] = useState(null);
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);

  const userCity = subscription?.city || user?.city || null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propsResult, oppsResult, marketResult] = await Promise.allSettled([
          madarApi.getProperties(),
          madarApi.getOpportunities(),
          userCity ? madarApi.getMarket(userCity) : Promise.resolve(null),
        ]);

        // Build property lookup map for client-side join
        const propertyMap = {};
        if (propsResult.status === "fulfilled") {
          const props = Array.isArray(propsResult.value)
            ? propsResult.value
            : propsResult.value?.properties || [];
          props.forEach((p) => {
            propertyMap[p.id] = p;
          });
        }

        // Enrich opportunities with joined property data
        let enriched = [];
        if (oppsResult.status === "fulfilled") {
          const opps = Array.isArray(oppsResult.value)
            ? oppsResult.value
            : oppsResult.value?.opportunities || [];
          enriched = opps.map((opp) => ({
            ...opp,
            property: propertyMap[opp.property_id] || null,
          }));
        }
        setOpportunities(enriched);

        if (marketResult.status === "fulfilled") {
          setMarket(marketResult.value);
        }
      } catch (err) {
        if (!(err instanceof MadarError && err.type === "tier")) {
          toast({ title: err.message || t("common.error"), variant: "destructive" });
        }
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userCity]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.full_name || (lang === "ar" ? "ضيف" : "Guest");
  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Top opportunity = highest revenue_impact
  const topOpportunity = opportunities && opportunities.length > 0
    ? [...opportunities].sort(
        (a, b) => (b.revenue_impact ?? 0) - (a.revenue_impact ?? 0)
      )[0]
    : null;

  return (
    <div className="pt-32 pb-24 px-[4%] md:px-[4%] max-w-[1400px] mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 md:mb-14"
      >
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-3">
          {today}
        </p>
        <h1 className="font-display text-display-lg font-light">
          {t("dashboard.greeting")}, {userName}
        </h1>
      </motion.div>

      {opportunities && opportunities.length > 0 ? (
        <div className="space-y-8 md:space-y-12">
          {/* 1. Opportunity Wallet */}
          <OpportunityWallet opportunities={opportunities} />

          {/* 2. What Would Madar Do */}
          <WhatWouldMadarDo opportunity={topOpportunity} />

          {/* 3. Action Center */}
          <ActionCenter opportunities={opportunities} />

          {/* 4. Market Status */}
          <MarketStatus market={market} city={userCity} />

          {/* 5. Links to other pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <div className="hairline mb-2" />
            <DashboardLink to="/properties" icon={Building2} label={t("properties.title")} />
            <DashboardLink to="/market" icon={MapPin} label={t("market.title")} />
            <DashboardLink to="/properties" icon={BarChart3} label={t("analytics.title")} />
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-display text-display-md font-light text-muted-foreground mb-4">
              {t("dashboard.noRecommendations")}
            </p>
            <p className="font-body text-sm text-muted-foreground/60 max-w-md mx-auto mb-8">
              {t("dashboard.noRecommendationsHint")}
            </p>
            <Link to="/properties" className="ghost-btn inline-block">
              {t("nav.addProperty")}
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}