import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { madarApi, MadarError } from "@/api/madarApi";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import TierGate from "@/components/TierGate";
import { TrendingUp, Building2, Activity, ArrowRight, MapPin } from "lucide-react";

const cities = [
  { id: "Riyadh", ar: "الرياض", en: "Riyadh" },
  { id: "Jeddah", ar: "جدة", en: "Jeddah" },
  { id: "Dammam", ar: "الدمام", en: "Dammam" },
  { id: "Mecca", ar: "مكة", en: "Mecca" },
  { id: "Medina", ar: "المدينة", en: "Medina" },
  { id: "Khobar", ar: "الخبر", en: "Khobar" },
];

function MarketData({ city, cityLabel }) {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await madarApi.getMarket(city);
        setData(result);
      } catch (err) {
        if (err instanceof MadarError && err.type === "tier") {
          setError("tier");
        } else {
          setError("error");
          toast({ title: t("market.error"), variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [city]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error === "tier") {
    return <TierGate required="basic" title={t("market.upgrade")} description={t("market.upgradeDesc")} />;
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-display-sm font-light text-muted-foreground">{t("market.error")}</p>
      </div>
    );
  }

  const stats = [
    { icon: TrendingUp, label: t("market.avgPrice"), value: data?.avg_price ? `${data.avg_price} ${t("common.sar")}` : "—" },
    { icon: Activity, label: t("market.occupancy"), value: data?.occupancy_rate ? `${data.occupancy_rate}%` : "—" },
    { icon: Building2, label: t("market.demand"), value: data?.demand_level || "—" },
    { icon: TrendingUp, label: t("market.trend"), value: data?.trend || "—" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* City header */}
      <div className="flex items-center gap-3 mb-12">
        <MapPin size={20} className="text-accent" />
        <h2 className="font-display text-display-md font-light">
          {lang === "ar" ? cityLabel.ar : cityLabel.en}
        </h2>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center py-8 border border-border/50"
          >
            <stat.icon size={20} className="mx-auto text-accent mb-4" strokeWidth={1} />
            <p className="font-display text-2xl font-light mb-2">{stat.value}</p>
            <p className="font-body text-xs text-muted-foreground tracking-label uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Insights text */}
      {data?.insights && (
        <div className="max-w-2xl">
          <div className="hairline mb-8" />
          <h3 className="font-display text-display-sm font-light mb-4">
            {lang === "ar" ? "تحليل السوق" : "Market Analysis"}
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-[1.8]">
            {lang === "ar" ? data.insights_ar || data.insights : data.insights_en || data.insights}
          </p>
        </div>
      )}

      {/* Neighborhood breakdown */}
      {data?.neighborhoods && Array.isArray(data.neighborhoods) && data.neighborhoods.length > 0 && (
        <div className="mt-16">
          <div className="hairline mb-8" />
          <h3 className="font-display text-display-sm font-light mb-8">
            {lang === "ar" ? "الأحياء" : "Neighborhoods"}
          </h3>
          <div className="space-y-4">
            {data.neighborhoods.map((nb, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border/30">
                <span className="font-body text-sm">{lang === "ar" ? nb.name_ar || nb.name : nb.name_en || nb.name}</span>
                <div className="flex items-center gap-6">
                  <span className="font-body text-sm text-muted-foreground">
                    {nb.avg_price ? `${nb.avg_price} ${t("common.sar")}` : "—"}
                  </span>
                  <span className="font-body text-sm text-accent">
                    {nb.occupancy ? `${nb.occupancy}%` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function MarketInsights() {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCity = searchParams.get("city") || "Riyadh";
  const selectedCityObj = cities.find((c) => c.id === selectedCity) || cities[0];

  const handleCityChange = (cityId) => {
    setSearchParams({ city: cityId });
  };

  return (
    <div className="pt-32 pb-24 px-[2%] md:px-[4%] max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
          {lang === "ar" ? "رؤى" : "Insights"}
        </p>
        <h1 className="font-display text-display-lg font-light mb-12">
          {t("market.title")}
        </h1>
      </motion.div>

      {/* City selector */}
      <div className="flex flex-wrap gap-3 mb-16">
        {cities.map((city) => (
          <button
            key={city.id}
            onClick={() => handleCityChange(city.id)}
            className={`px-6 py-3 font-body text-xs tracking-label uppercase rounded-full border transition-all duration-300 ${
              selectedCity === city.id
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
            }`}
          >
            {lang === "ar" ? city.ar : city.en}
          </button>
        ))}
      </div>

      {/* Market data (tier-gated) */}
      <TierGate required="basic">
        <MarketData city={selectedCity} cityLabel={selectedCityObj} />
      </TierGate>
    </div>
  );
}