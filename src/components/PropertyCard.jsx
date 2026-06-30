import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Users, Star, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

function formatPrice(price) {
  if (!price && price !== 0) return "—";
  return new Intl.NumberFormat("en-US").format(price);
}

export default function PropertyCard({ property, size = "default" }) {
  const { t } = useLanguage();
  const isLarge = size === "large";

  if (!property) return null;

  const image =
    property.featured_image ||
    property.image ||
    property.thumbnail ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=640&fit=crop";

  const platforms = property.platforms || property.platform_urls || [];
  const platformCount = platforms.length;

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className={`relative overflow-hidden ${isLarge ? "aspect-[16/9]" : "aspect-[5/4]"}`}>
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-out"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-700 ease-out">
            <div className="flex items-end justify-between text-white">
              <span className="font-display text-2xl font-light">
                {formatPrice(property.price)} {t("common.sar")}
              </span>
              {platformCount > 0 && (
                <span className="font-body text-xs tracking-label uppercase">
                  {platformCount} {t("properties.platforms")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 px-[2%]">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
            {property.city}
            {property.neighborhood && ` · ${property.neighborhood}`}
          </p>
          <h3 className="font-display font-light text-display-sm">
            {property.title}
          </h3>
          <div className="flex items-center gap-4 mt-2 font-body text-sm text-muted-foreground">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed size={14} /> {property.bedrooms} {t("properties.bedrooms")}
              </span>
            )}
            {property.guests != null && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1">
                  <Users size={14} /> {property.guests} {t("properties.guests")}
                </span>
              </>
            )}
            {property.rating != null && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-accent" /> {property.rating}
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}