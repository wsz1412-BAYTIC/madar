import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Users, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

function formatPrice(price) {
  if (!price && price !== 0) return "—";
  return new Intl.NumberFormat("en-US").format(price);
}

export default function FeaturedCard({ property }) {
  const { t } = useLanguage();

  if (!property) return null;

  const image =
    property.featured_image ||
    property.image ||
    property.thumbnail ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop";

  const platforms = property.platforms || property.platform_urls || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Link
        to={`/property/${property.id}`}
        className="group grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden border border-border/50"
      >
        <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[260px]">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-700" />
        </div>

        <div className="flex flex-col justify-center px-[4%] md:px-10 py-12 bg-background">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-3">
            {property.city}
            {platforms.length > 0 && ` · ${platforms.length} ${t("properties.platforms")}`}
          </p>
          <h2 className="font-display text-display-md font-light leading-tight mb-4">
            {property.title}
          </h2>
          {property.short_description && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm">
              {property.short_description}
            </p>
          )}
          <div className="flex items-center gap-6 font-body text-sm text-muted-foreground mb-8">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed size={14} /> {property.bedrooms}
              </span>
            )}
            {property.guests != null && (
              <span className="flex items-center gap-1">
                <Users size={14} /> {property.guests}
              </span>
            )}
            {property.rating != null && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-accent" /> {property.rating}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display text-display-sm font-light">
              {formatPrice(property.price)} {t("common.sar")}
            </span>
            <span className="ghost-btn text-xs">{t("property.back")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}