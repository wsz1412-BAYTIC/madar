import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Inbox } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import ReasoningBox from "./ReasoningBox";

function formatPrice(price) {
  if (!price && price !== 0) return "—";
  return new Intl.NumberFormat("en-US").format(price);
}

function ActionCard({ brief, index }) {
  const { t, lang } = useLanguage();

  const title = brief.property_title || brief.property?.title || "—";
  const city = brief.property_city || brief.property?.city || "";
  const recommended = brief.recommended_price;
  const current = brief.current_price ?? brief.listing_price ?? brief.property_current_price;
  const propertyId = brief.property_id || brief.property?.id || brief.id;

  const delta = recommended && current ? recommended - current : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col"
    >
      <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
        {city}
      </p>
      <h3 className="font-display text-lg font-light mb-3 line-clamp-1">{title}</h3>

      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="font-body text-[10px] tracking-label uppercase text-muted-foreground mb-0.5">
            {lang === "ar" ? "الحالي" : "Current"}
          </p>
          <span className="font-display text-base font-light text-muted-foreground">
            {formatPrice(current)} {t("common.sar")}
          </span>
        </div>
        <ArrowRight size={14} className="text-muted-foreground/40 shrink-0" />
        <div>
          <p className="font-body text-[10px] tracking-label uppercase text-muted-foreground mb-0.5">
            {t("dashboard.recommendedPrice")}
          </p>
          <span className="font-display text-base font-light text-accent">
            {formatPrice(recommended)} {t("common.sar")}
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <Link
          to={`/property/${propertyId}`}
          className="block text-center w-full py-2.5 rounded-full bg-foreground text-background font-body text-xs tracking-label uppercase hover:bg-foreground/90 transition-colors"
        >
          {t("dashboard.applyPriceChange")}
        </Link>
        <ReasoningBox brief={brief} />
      </div>
    </motion.div>
  );
}

export default function ActionCenter({ briefs }) {
  const { t, lang } = useLanguage();

  const actions = (briefs || []).filter(
    (b) => b.recommended_price != null
  );
  const top3 = actions.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-display-sm font-light">
          {t("dashboard.actionCenter")}
        </h2>
        {actions.length > 3 && (
          <Link
            to="/properties"
            className="flex items-center gap-1 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("dashboard.viewAllActions")}
            <ArrowRight size={13} className="rtl:rotate-180" />
          </Link>
        )}
      </div>

      {top3.length === 0 ? (
        <div className="rounded-2xl border border-border/40 py-16 text-center">
          <Inbox size={24} className="mx-auto text-muted-foreground/40 mb-3" strokeWidth={1} />
          <p className="font-display text-lg font-light text-muted-foreground">
            {t("dashboard.noActions")}
          </p>
          <p className="font-body text-xs text-muted-foreground/60 mt-1">
            {t("dashboard.noActionsHint")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3.map((brief, i) => (
            <ActionCard key={brief.id || i} brief={brief} index={i} />
          ))}
        </div>
      )}
    </motion.section>
  );
}