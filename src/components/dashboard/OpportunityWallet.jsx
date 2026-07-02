import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function OpportunityWallet({ opportunities }) {
  const { t } = useLanguage();

  const total = (opportunities || []).reduce(
    (sum, opp) => sum + (opp.revenue_impact ?? 0),
    0
  );

  const formatted = new Intl.NumberFormat("en-US").format(Math.round(total));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-accent/5 to-transparent p-8 md:p-12"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={16} className="text-accent" strokeWidth={1.5} />
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
          {t("dashboard.opportunityWallet")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl md:text-7xl font-light text-accent">
            {formatted}
          </span>
          <span className="font-body text-lg text-muted-foreground">
            {t("common.sar")}
          </span>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          {t("dashboard.potentialMonthlyRevenue")}
        </p>
        <p className="font-body text-xs text-muted-foreground/60 mt-1">
          {t("dashboard.opportunityHint")}
        </p>
      </div>
    </motion.section>
  );
}