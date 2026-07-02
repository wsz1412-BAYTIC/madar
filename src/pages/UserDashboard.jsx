import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { madarApi, MadarError } from "@/api/madarApi";
import { useLanguage } from "@/lib/LanguageContext";
import { useMadarAuth } from "@/lib/MadarAuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useToast } from "@/components/ui/use-toast";
import OpportunityWallet from "@/components/dashboard/OpportunityWallet";
import WhatWouldMadarDo from "@/components/dashboard/WhatWouldMadarDo";
import ActionCenter from "@/components/dashboard/ActionCenter";
import MarketStatus from "@/components/dashboard/MarketStatus";
import { ChevronDown, Building2, BarChart3, MapPin } from "lucide-react";

function ExpandableLink({ to, icon: Icon, label, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/30">
      <div className="flex items-center justify-between py-5">
        <Link
          to={to}
          className="flex items-center gap-3 font-display text-lg font-light hover:text-accent transition-colors"
        >
          <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
          {label}
        </Link>
        {children && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { t, lang } = useLanguage();
  const { user } = useMadarAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();

  const [briefs, setBriefs] = useState(null);
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userCity = subscription?.city || user?.city || null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [briefsData, marketData] = await Promise.all([
          madarApi.getLatestBriefs().catch(() => []),
          userCity
            ? madarApi.getMarket(userCity).catch(() => null)
            : Promise.resolve(null),
        ]);
        setBriefs(Array.isArray(briefsData) ? briefsData : []);
        setMarket(marketData);
      } catch (err) {
        if (err instanceof MadarError && err.type === "tier") {
          setError("tier");
        } else {
          setError("error");
          toast({ title: t("common.error"), variant: "destructive" });
        }
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

  const userName = user?.name || (lang === "ar" ? "مرحباً" : "Welcome");
  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Top recommendation = highest confidence or highest opportunity
  const topBrief = briefs && briefs.length > 0
    ? [...briefs].sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0))[0]
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

      {briefs && briefs.length > 0 ? (
        <div className="space-y-8 md:space-y-12">
          {/* 1. Opportunity Wallet */}
          <OpportunityWallet briefs={briefs} />

          {/* 2. What Would Madar Do */}
          <WhatWouldMadarDo brief={topBrief} />

          {/* 3. Action Center */}
          <ActionCenter briefs={briefs} />

          {/* 4. Market Status */}
          <MarketStatus market={market} city={userCity} />

          {/* 5. Expandable links to other pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <div className="hairline mb-2" />
            <ExpandableLink
              to="/properties"
              icon={Building2}
              label={t("dashboard.viewProperties")}
            />
            <ExpandableLink
              to="/market"
              icon={MapPin}
              label={t("dashboard.viewMarketInsights")}
            />
            <ExpandableLink
              to="/properties"
              icon={BarChart3}
              label={t("analytics.title")}
            />
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
            <Link
              to="/properties"
              className="ghost-btn inline-block"
            >
              {t("nav.addProperty")}
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}