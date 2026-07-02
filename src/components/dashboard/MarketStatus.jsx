import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

const CITY_LABELS = {
  Riyadh: { ar: "الرياض", en: "Riyadh" },
  Jeddah: { ar: "جدة", en: "Jeddah" },
  Mecca: { ar: "مكة", en: "Mecca" },
  Medina: { ar: "المدينة", en: "Medina" },
  Dammam: { ar: "الدمام", en: "Dammam" },
  Khobar: { ar: "الخبر", en: "Khobar" },
};

export default function MarketStatus({ market, city }) {
  const { t, lang } = useLanguage();

  const cityLabel = city
    ? (CITY_LABELS[city]?.[lang] || city)
    : "";

  // Build a human-readable summary from market data
  let summary = "";
  if (market) {
    const trend = market.trend?.toLowerCase() || "";
    const demand = market.demand_level?.toLowerCase() || "";

    if (trend.includes("ris") || trend.includes("up") || trend.includes("نمو") || trend.includes("ارتف")) {
      summary = lang === "ar"
        ? `الطلب في ارتفاع${cityLabel ? ` في ${cityLabel}` : ""} هذا الأسبوع`
        : `Demand is rising${cityLabel ? ` in ${cityLabel}` : ""} this week`;
    } else if (trend.includes("fall") || trend.includes("down") || trend.includes("decl") || trend.includes("انخف")) {
      summary = lang === "ar"
        ? `الطلب في انخفاض${cityLabel ? ` في ${cityLabel}` : ""} هذا الأسبوع`
        : `Demand is cooling${cityLabel ? ` in ${cityLabel}` : ""} this week`;
    } else if (demand.includes("high") || demand.includes("مرتفع")) {
      summary = lang === "ar"
        ? `الطلب مرتفع${cityLabel ? ` في ${cityLabel}` : ""} حالياً`
        : `Demand is high${cityLabel ? ` in ${cityLabel}` : ""} right now`;
    } else if (demand.includes("low") || demand.includes("منخفض")) {
      summary = lang === "ar"
        ? `الطلب منخفض${cityLabel ? ` في ${cityLabel}` : ""} حالياً`
        : `Demand is low${cityLabel ? ` in ${cityLabel}` : ""} right now`;
    } else {
      const insight = lang === "ar"
        ? (market.insights_ar || market.insights)
        : (market.insights_en || market.insights);
      summary = insight || (lang === "ar"
        ? `السوق مستقر${cityLabel ? ` في ${cityLabel}` : ""}`
        : `Market is stable${cityLabel ? ` in ${cityLabel}` : ""}`);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card p-6 md:p-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={15} className="text-accent" strokeWidth={1.5} />
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
          {t("dashboard.marketStatus")}
        </p>
      </div>

      {summary ? (
        <p className="font-display text-xl md:text-2xl font-light leading-snug">
          {summary}
        </p>
      ) : (
        <p className="font-body text-sm text-muted-foreground">
          {t("market.loading")}
        </p>
      )}

      {city && (
        <Link
          to={`/market?city=${city}`}
          className="inline-flex items-center gap-1 mt-4 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("dashboard.viewMarketInsights")}
          <ArrowRight size={13} className="rtl:rotate-180" />
        </Link>
      )}
    </motion.section>
  );
}