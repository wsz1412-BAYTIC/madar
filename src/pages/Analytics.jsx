import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { madarApi } from "@/api/madarApi";
import { useLanguage } from "@/lib/LanguageContext";
import { ArrowLeft, TrendingUp } from "lucide-react";

function PriceHistoryChart({ data, t }) {
  const chartData = (data || []).map((d) => ({
    date: d.date || d.day,
    price: d.price || d.recommended_price,
    listed: d.listed_price || d.current_price,
  }));

  return (
    <div>
      <h2 className="font-display text-display-sm font-light mb-8">
        {t("analytics.priceHistory")}
      </h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={false}
              name={t("analytics.yourPrice")}
            />
            <Line
              type="monotone"
              dataKey="listed"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              name={t("property.listingPrice")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CompetitorChart({ data, t }) {
  const chartData = (data || []).map((c) => ({
    name: c.name || c.property_name || "—",
    price: c.price || c.avg_price || 0,
  }));

  return (
    <div>
      <h2 className="font-display text-display-sm font-light mb-8">
        {t("analytics.competitors")}
      </h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="price"
              fill="hsl(var(--accent))"
              radius={[4, 4, 0, 0]}
              name={t("analytics.price")}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { propertyId } = useParams();
  const { t, lang } = useLanguage();
  const [briefs, setBriefs] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const [briefData, compData, propData] = await Promise.allSettled([
          madarApi.getPropertyBriefs(propertyId),
          madarApi.getCompetitors(propertyId),
          madarApi.getProperty(propertyId),
        ]);

        if (briefData.status === "fulfilled") setBriefs(briefData.value);
        if (compData.status === "fulfilled") setCompetitors(compData.value);
        if (propData.status === "fulfilled") setProperty(propData.value);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const briefHistory = Array.isArray(briefs) ? briefs : briefs?.history || [];
  const competitorList = Array.isArray(competitors) ? competitors : competitors?.competitors || [];
  const latestBrief = Array.isArray(briefs) ? briefs[0] : briefs?.latest || null;

  return (
    <div className="pt-24 pb-24 px-[2%] md:px-[4%] max-w-[1400px] mx-auto">
      {/* Back navigation */}
      <div className="mb-8">
        <Link
          to={`/property/${propertyId}`}
          className="inline-flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> {t("analytics.back")}
        </Link>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
          {lang === "ar" ? "تحليلات" : "Analytics"}
        </p>
        <h1 className="font-display text-display-lg font-light">
          {property?.title || t("analytics.title")}
        </h1>
        {property?.city && (
          <p className="font-body text-sm text-muted-foreground mt-3">{property.city}</p>
        )}
      </motion.div>

      {/* Latest brief summary */}
      {latestBrief && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="border border-border/50 p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <TrendingUp size={28} className="text-accent" strokeWidth={1} />
              </div>
              <div className="flex-1">
                <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
                  {t("dashboard.recommendedPrice")}
                </p>
                <p className="font-display text-display-md font-light text-accent mb-4">
                  {latestBrief.recommended_price} {t("common.sar")} {t("common.perNight")}
                </p>
                {latestBrief.confidence_score != null && (
                  <p className="font-body text-sm text-muted-foreground">
                    {t("dashboard.confidence")}:{" "}
                    <span className="text-foreground">
                      {Math.round(latestBrief.confidence_score * 100)}%
                    </span>
                  </p>
                )}
                {(latestBrief.reasoning_ar || latestBrief.reasoning_en) && (
                  <p className="font-body text-sm text-muted-foreground leading-[1.8] mt-4 max-w-2xl">
                    {lang === "ar"
                      ? latestBrief.reasoning_ar || latestBrief.reasoning_en
                      : latestBrief.reasoning_en || latestBrief.reasoning_ar}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="space-y-20">
        <PriceHistoryChart data={briefHistory} t={t} />
        <div className="hairline" />
        <CompetitorChart data={competitorList} t={t} />
      </div>

      {error && (
        <div className="text-center py-24">
          <p className="font-display text-display-sm font-light text-muted-foreground">
            {t("common.error")}
          </p>
        </div>
      )}
    </div>
  );
}