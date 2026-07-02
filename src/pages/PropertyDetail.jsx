import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { mapUserProperty, mapRecommendation } from "@/lib/entityMappers";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Bed,
  Users,
  Star,
  MapPin,
  BarChart3,
  Globe,
  TrendingUp,
} from "lucide-react";

function formatPrice(price) {
  if (!price && price !== 0) return "—";
  return new Intl.NumberFormat("en-US").format(price);
}

function PlatformComparison({ platforms, t }) {
  if (!platforms || platforms.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="font-display text-display-sm font-light mb-6">
        {t("property.platformComparison")}
      </h2>
      <div className="space-y-4">
        {platforms.map((p, i) => {
          const platformName = p.platform || p.name || p.source || "—";
          const price = p.price ?? p.listing_price ?? p.current_price;
          const recommendedPrice = p.recommended_price;
          const diff = recommendedPrice && price ? recommendedPrice - price : null;
          const url = p.url || p.listing_url;

          return (
            <div key={i} className="border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-accent" strokeWidth={1} />
                  <span className="font-display text-lg font-light capitalize">{platformName}</span>
                </div>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs tracking-label uppercase text-muted-foreground hover:text-accent transition-colors"
                  >
                    {t("property.back")} ↗
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
                    {t("property.listingPrice")}
                  </p>
                  <p className="font-display text-xl font-light">
                    {formatPrice(price)} {t("common.sar")}
                  </p>
                </div>
                {recommendedPrice != null && (
                  <div>
                    <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
                      {t("property.recommendedPrice")}
                    </p>
                    <p className="font-display text-xl font-light text-accent">
                      {formatPrice(recommendedPrice)} {t("common.sar")}
                    </p>
                  </div>
                )}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propResult, recsResult] = await Promise.allSettled([
          base44.entities.UserProperty.get(id),
          base44.entities.PriceRecommendation.filter({ user_property_id: id }),
        ]);

        if (propResult.status === "fulfilled" && propResult.value) {
          setProperty(mapUserProperty(propResult.value));
        }
        if (recsResult.status === "fulfilled") {
          const recs = (recsResult.value || []).map((r) => mapRecommendation(r));
          // Latest brief = most recently created recommendation
          const latest = recs.length > 0 ? recs[0] : null;
          setBrief(latest);
        }
      } catch (err) {
        toast({ title: err.message || t("common.error"), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center py-24">
        <p className="font-display text-display-md">{t("property.notFound")}</p>
        <Link to="/properties" className="ghost-btn inline-block mt-8">
          {t("property.back")}
        </Link>
      </div>
    );
  }

  const images = property.images?.length > 0 ? property.images : [property.featured_image || property.image].filter(Boolean);
  const platforms = property.platforms || property.platform_urls || [];
  const stats = [
    { icon: Bed, label: t("properties.bedrooms"), value: property.bedrooms },
    { icon: Users, label: t("properties.guests"), value: property.guests },
    { icon: Star, label: t("properties.rating"), value: property.rating },
  ].filter((s) => s.value != null);

  const reasoning = lang === "ar"
    ? brief?.reasoning_ar || brief?.reasoning_en
    : brief?.reasoning_en || brief?.reasoning_ar;

  return (
    <div className="pt-24">
      {/* Back navigation */}
      <div className="px-[2%] max-w-[1600px] mx-auto mb-8">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> {t("property.back")}
        </Link>
      </div>

      <div className="px-[2%] max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 3xl:gap-20">
          {/* Left: Content */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {images.length > 0 && (
                <PropertyGallery images={images} title={property.title} />
              )}
            </motion.div>

            {/* Title & Price */}
            <div className="mt-10 mb-8">
              <h1 className="font-display text-display-md font-light mt-2">{property.title}</h1>
              <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                <MapPin size={14} />
                <span className="font-body text-sm">
                  {property.city}
                  {property.neighborhood && `, ${property.neighborhood}`}
                </span>
              </div>
              <p className="font-display text-display-sm text-accent mt-4">
                {formatPrice(property.price)} {t("common.sar")} {t("common.perNight")}
              </p>
            </div>

            <div className="hairline mb-8" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center py-4 border border-border/50">
                  <stat.icon size={18} className="mx-auto text-accent mb-2" strokeWidth={1} />
                  <p className="font-display text-lg">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground tracking-label uppercase">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-10">
                <h2 className="font-display text-display-sm font-light mb-4">{t("property.about")}</h2>
                <p className="font-body text-sm text-muted-foreground leading-[1.8] whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            <div className="hairline mb-10" />

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-display-sm font-light mb-6">{t("property.features")}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span className="font-body text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="hairline mb-10" />

            {/* Platform comparison */}
            <PlatformComparison platforms={platforms} t={t} />

            {/* Map */}
            {property.city && (
              <div className="mb-10">
                <h2 className="font-display text-display-sm font-light mb-6">{t("property.location")}</h2>
                <div className="aspect-[16/9] overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps?q=${encodeURIComponent(property.city + ", Saudi Arabia")}&z=12&output=embed`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky pricing brief + analytics */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* AI Pricing Brief */}
              {brief && (
                <div className="border border-border/50 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-accent" strokeWidth={1} />
                    <h3 className="font-display text-2xl font-light">
                      {t("dashboard.recommendedPrice")}
                    </h3>
                  </div>

                  <p className="font-display text-display-sm text-accent mb-6">
                    {formatPrice(brief.recommended_price)} {t("common.sar")} {t("common.perNight")}
                  </p>

                  {brief.confidence_score != null && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-xs tracking-label uppercase text-muted-foreground">
                          {t("dashboard.confidence")}
                        </span>
                        <span className="font-body text-sm font-medium">
                          {Math.round(brief.confidence_score * 100)}%
                        </span>
                      </div>
                      <div className="h-px bg-border/50 relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-accent transition-all duration-500"
                          style={{
                            width: `${brief.confidence_score * 100}%`,
                            height: "2px",
                            top: "-0.5px",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {reasoning && (
                    <div className="mb-6">
                      <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-3">
                        {t("dashboard.reasoning")}
                      </p>
                      <p className="font-body text-sm text-muted-foreground leading-[1.8]">
                        {reasoning}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics CTA */}
              <Link
                to={`/analytics/${id}`}
                className="block border border-foreground bg-foreground text-background p-8 hover:bg-foreground/90 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 size={20} strokeWidth={1} />
                  <h3 className="font-display text-xl font-light">{t("analytics.title")}</h3>
                </div>
                <p className="font-body text-sm text-background/60 mb-4">
                  {t("analytics.priceHistory")} & {t("analytics.competitors")}
                </p>
                <span className="font-body text-xs tracking-label uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
                  {t("property.viewAnalytics")} <ArrowLeft size={12} className="rotate-180" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-24" />
    </div>
  );
}

function PropertyGallery({ images, title }) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={images[activeImage]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`flex-shrink-0 w-20 h-20 overflow-hidden transition-opacity ${
                i === activeImage ? "opacity-100 ring-1 ring-accent" : "opacity-50 hover:opacity-75"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}