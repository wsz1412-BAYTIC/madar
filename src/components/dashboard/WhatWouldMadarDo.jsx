import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

export default function WhatWouldMadarDo({ opportunity }) {
  const { t, pickLangField, lang } = useLanguage();

  if (!opportunity) return null;

  const propertyName = opportunity.property?.title || "—";
  const city = opportunity.property?.city || "";
  const action = pickLangField(opportunity, "action") || "";
  const reason = pickLangField(opportunity, "reason") || "";
  const propertyId = opportunity.property_id || opportunity.property?.id;

  const cityLabel = city ? (lang === "ar" ? `في ${city}` : `in ${city}`) : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-3xl bg-foreground text-background p-8 md:p-12"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={16} className="text-background/60" strokeWidth={1.5} />
        <p className="font-body text-xs tracking-label uppercase text-background/50">
          {t("dashboard.whatWouldMadarDo")}
        </p>
      </div>

      <p className="font-display text-2xl md:text-4xl font-light leading-snug max-w-3xl">
        {action || (lang === "ar" ? "تابع تحليل عقاراتك" : "Keep optimizing your properties")}
      </p>

      {(propertyName !== "—" || cityLabel) && (
        <p className="mt-4 font-body text-sm text-background/50">
          {propertyName !== "—" ? propertyName : ""}
          {propertyName !== "—" && cityLabel ? " " : ""}
          {cityLabel}
        </p>
      )}

      {reason && (
        <p className="mt-6 font-body text-sm text-background/60 leading-relaxed max-w-2xl">
          {reason}
        </p>
      )}

      {propertyId && (
        <Link
          to={`/property/${propertyId}`}
          className="inline-block mt-8 font-body text-xs tracking-label uppercase text-background/50 hover:text-background transition-colors border-b border-background/20 hover:border-background/50 pb-0.5"
        >
          {lang === "ar" ? "عرض التفاصيل" : "View Details"}
        </Link>
      )}
    </motion.section>
  );
}