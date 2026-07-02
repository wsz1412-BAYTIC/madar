import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

export default function WhatWouldMadarDo({ brief }) {
  const { t, pickLangField, lang } = useLanguage();

  if (!brief) return null;

  const title = brief.property_title || brief.property?.title || "—";
  const city = brief.property_city || brief.property?.city || "";
  const recommended = brief.recommended_price;
  const current = brief.current_price ?? brief.listing_price ?? brief.property_current_price;
  const reasoning = pickLangField(brief, "reasoning") || brief.reasoning || "";
  const propertyId = brief.property_id || brief.property?.id || brief.id;

  const delta = recommended && current ? recommended - current : 0;
  const deltaPct = current > 0 ? Math.round((delta / current) * 100) : 0;

  const direction = delta >= 0
    ? (lang === "ar" ? "ارفع" : "Raise")
    : (lang === "ar" ? "خفّض" : "Lower");

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
        {direction}{" "}
        <span className="text-accent">{title}</span>{" "}
        {cityLabel}
        {deltaPct !== 0 && (
          <>
            {lang === "ar" ? "بنسبة" : "by"}{" "}
            <span className="text-accent">{Math.abs(deltaPct)}%</span>
          </>
        )}
      </p>

      {reasoning && (
        <p className="mt-6 font-body text-sm text-background/60 leading-relaxed max-w-2xl">
          {reasoning}
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