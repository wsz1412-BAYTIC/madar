import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { mapRecommendation, mapUserProperty } from "@/lib/entityMappers";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import {
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Building2,
  AlertCircle,
} from "lucide-react";

function formatPrice(price) {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-US").format(price);
}

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS = {
  ar: { pending: "قيد الانتظار", accepted: "مقبول", rejected: "مرفوض", expired: "منتهي" },
  en: { pending: "Pending", accepted: "Accepted", rejected: "Rejected", expired: "Expired" },
};

function RecommendationCard({ rec, lang, t }) {
  const reasoning = lang === "ar"
    ? rec.reasoning_ar || rec.reasoning_en
    : rec.reasoning_en || rec.reasoning_ar;

  const action = lang === "ar" ? rec.action_ar : rec.action_en;
  const statusLabel = STATUS_LABELS[lang][rec.status] || rec.status;
  const diff =
    rec.recommended_price != null && rec.current_price != null
      ? rec.recommended_price - rec.current_price
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-border/50 p-6 md:p-8 hover:border-border transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Building2 size={18} className="text-accent flex-shrink-0" strokeWidth={1} />
          <div className="min-w-0">
            <Link
              to={`/property/${rec.property_id}`}
              className="font-display text-lg font-light hover:text-accent transition-colors truncate block"
            >
              {rec.property?.title || "—"}
            </Link>
            {rec.property?.city && (
              <p className="font-body text-xs text-muted-foreground mt-1">
                {rec.property.city}
                {rec.property.neighborhood && `, ${rec.property.neighborhood}`}
              </p>
            )}
          </div>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-body flex-shrink-0 ${
            STATUS_STYLES[rec.status] || STATUS_STYLES.pending
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
            {t("property.listingPrice")}
          </p>
          <p className="font-display text-xl font-light">
            {formatPrice(rec.current_price)} {t("common.sar")}
          </p>
        </div>
        <div>
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
            {t("property.recommendedPrice")}
          </p>
          <p className="font-display text-xl font-light text-accent">
            {formatPrice(rec.recommended_price)} {t("common.sar")}
          </p>
        </div>
        {diff != null && (
          <div>
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
              {t("analytics.trend")}
            </p>
            <p
              className={`font-display text-xl font-light ${
                diff > 0 ? "text-green-600" : diff < 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {diff > 0 ? "+" : ""}
              {formatPrice(diff)} {t("common.sar")}
            </p>
          </div>
        )}
        {rec.revenue_impact != null && (
          <div>
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
              {t("dashboard.potentialMonthlyRevenue")}
            </p>
            <p className="font-display text-xl font-light">
              {formatPrice(rec.revenue_impact)} {t("common.sar")}
            </p>
          </div>
        )}
      </div>

      {rec.confidence_score != null && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-xs tracking-label uppercase text-muted-foreground">
              {t("dashboard.confidence")}
            </span>
            <span className="font-body text-sm font-medium">
              {Math.round(rec.confidence_score * 100)}%
            </span>
          </div>
          <div className="h-px bg-border/50 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-accent"
              style={{
                width: `${rec.confidence_score * 100}%`,
                height: "2px",
                top: "-0.5px",
              }}
            />
          </div>
        </div>
      )}

      {reasoning && (
        <div className="mb-6">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
            {t("dashboard.reasoning")}
          </p>
          <p className="font-body text-sm text-muted-foreground leading-[1.8]">{reasoning}</p>
        </div>
      )}

      {action && (
        <div className="mb-6 p-4 bg-secondary/50">
          <p className="font-body text-sm flex items-start gap-2">
            <Sparkles size={14} className="text-accent flex-shrink-0 mt-0.5" strokeWidth={1} />
            {action}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-6 pt-4 border-t border-border/30">
        <Link
          to={`/property/${rec.property_id}`}
          className="font-body text-xs tracking-label uppercase text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-2"
        >
          {t("property.back")}
          <ArrowLeft size={12} className="rtl:rotate-180" />
        </Link>
        <Link
          to={`/analytics/${rec.property_id}`}
          className="font-body text-xs tracking-label uppercase text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-2"
        >
          {t("analytics.title")}
          <ArrowLeft size={12} className="rtl:rotate-180" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function PricingRecommendations() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError(false);
      try {
        const [recs, props] = await Promise.all([
          base44.entities.PriceRecommendation.list("-created_date"),
          base44.entities.UserProperty.list(),
        ]);
        const propMap = {};
        for (const p of props || []) {
          propMap[p.id] = mapUserProperty(p);
        }
        const mapped = (recs || []).map((r) => {
          const m = mapRecommendation(r);
          m.property = propMap[r.user_property_id] || null;
          return m;
        });
        setRecommendations(mapped);
      } catch (err) {
        setError(true);
        toast({ title: err.message || t("common.error"), variant: "destructive" });
      }
    };
    load();
  }, []);

  if (recommendations === null && !error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-24 px-[4%] md:px-[6%] max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center text-center py-24 border border-border/50">
          <AlertCircle size={36} className="text-destructive mb-8" strokeWidth={1} />
          <p className="font-display text-display-sm font-light mb-4">{t("common.error")}</p>
          <button onClick={() => window.location.reload()} className="ghost-btn">
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="pt-32 pb-24 px-[4%] md:px-[6%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center py-24 border border-border/50"
        >
          <TrendingUp size={36} className="text-muted-foreground mb-8" strokeWidth={1} />
          <p className="font-display text-display-sm font-light mb-4">
            {t("dashboard.noRecommendations")}
          </p>
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md mb-8">
            {t("dashboard.noRecommendationsHint")}
          </p>
          <Link to="/properties" className="ghost-btn inline-flex items-center gap-2 text-xs">
            {t("properties.add")}
            <ArrowLeft size={14} className="rtl:rotate-180" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 px-[4%] md:px-[6%] max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
          {lang === "ar" ? "ذكاء التسعير" : "Pricing Intelligence"}
        </p>
        <h1 className="font-display text-display-md font-light flex items-center gap-3">
          {t("dashboard.featured")}
          <Sparkles size={20} className="text-accent" strokeWidth={1} />
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} lang={lang} t={t} />
        ))}
      </div>
    </div>
  );
}