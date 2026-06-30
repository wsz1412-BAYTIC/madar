import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Bed, Users, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

function formatPrice(price) {
  if (!price && price !== 0) return "—";
  return new Intl.NumberFormat("en-US").format(price);
}

function confidenceColor(score) {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-accent";
  return "text-muted-foreground";
}

export default function BriefCard({ brief, size = "default" }) {
  const { t, lang, pickLangField } = useLanguage();
  const isLarge = size === "large";

  if (!brief) return null;

  const propertyId = brief.property_id || brief.property?.id || brief.id;
  const title = brief.property_title || brief.property?.title || "—";
  const city = brief.property_city || brief.property?.city || brief.city || "";
  const image =
    brief.property_image ||
    brief.property?.featured_image ||
    brief.property?.image ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop";
  const bedrooms = brief.property_bedrooms ?? brief.property?.bedrooms;
  const guests = brief.property_guests ?? brief.property?.guests;
  const rating = brief.property_rating ?? brief.property?.rating;
  const recommendedPrice = brief.recommended_price;
  const confidence = brief.confidence_score;
  const platformCount = brief.platform_count || brief.platforms?.length || 0;

  return (
    <Link to={`/property/${propertyId}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className={`relative overflow-hidden ${isLarge ? "aspect-[16/9]" : "aspect-[5/4]"}`}>
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-out"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)" }} />

          {/* Recommended price overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-700 ease-out">
            <div className="flex items-end justify-between text-white">
              <div>
                <p className="font-body text-xs tracking-label uppercase text-white/60 mb-1">
                  {t("dashboard.recommendedPrice")}
                </p>
                <span className="font-display text-2xl font-light">
                  {formatPrice(recommendedPrice)} {t("common.sar")}
                </span>
              </div>
              {confidence != null && (
                <div className="text-right">
                  <p className="font-body text-xs tracking-label uppercase text-white/60 mb-1">
                    {t("dashboard.confidence")}
                  </p>
                  <span className="font-display text-lg">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 px-[2%]">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
            {city}
            {platformCount > 0 && ` · ${platformCount} ${t("properties.platforms")}`}
          </p>
          <h3 className="font-display font-light text-display-sm">
            {title}
          </h3>
          <div className="flex items-center gap-4 mt-2 font-body text-sm text-muted-foreground">
            {bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed size={14} /> {bedrooms}
              </span>
            )}
            {guests != null && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1">
                  <Users size={14} /> {guests}
                </span>
              </>
            )}
            {rating != null && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-accent" /> {rating}
                </span>
              </>
            )}
          </div>

          {/* Always-visible price bar on mobile */}
          <div className="md:hidden mt-3 flex items-center justify-between">
            <span className="font-display text-lg font-light text-accent">
              {formatPrice(recommendedPrice)} {t("common.sar")}
            </span>
            {confidence != null && (
              <span className={`font-body text-xs ${confidenceColor(confidence)}`}>
                {Math.round(confidence * 100)}% {t("dashboard.confidence")}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}