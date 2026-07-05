import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { CITIES, UNIT_TYPES, PLATFORMS } from "@/lib/propertyWizard";
import {
  Briefcase, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Crown, Home, KeyRound, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const VERDICT_META = {
  proceed: {
    en: "Proceed with the deal", ar: "امضِ في الصفقة",
    Icon: CheckCircle2, border: "border-accent/30", bg: "bg-accent/5", text: "text-accent",
  },
  renegotiate: {
    en: "Renegotiate the terms", ar: "أعد التفاوض على الشروط",
    Icon: AlertTriangle, border: "border-muted-foreground/30", bg: "bg-muted/30", text: "text-muted-foreground",
  },
  avoid: {
    en: "Avoid this deal", ar: "تجنّب هذه الصفقة",
    Icon: XCircle, border: "border-destructive/30", bg: "bg-destructive/5", text: "text-destructive",
  },
};

const EMPTY_FORM = {
  city: "", district: "", unitType: "", platform: "", bedrooms: 1,
  askingRent: "", askingPrice: "", expectedNightlyRate: "", expectedOccupancy: "", monthlyOperatingCosts: "",
};

function fmt(n) {
  return Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-US") : "—";
}

export default function InvestmentConsultant() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [analysisType, setAnalysisType] = useState("lease");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [upgradeNeeded, setUpgradeNeeded] = useState(null);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setUpgradeNeeded(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("ai-investment-consultant", {
        action: "analyze",
        analysisType,
        input: {
          ...form,
          bedrooms: Number(form.bedrooms) || null,
          expectedNightlyRate: Number(form.expectedNightlyRate),
          expectedOccupancy: Number(form.expectedOccupancy),
          monthlyOperatingCosts: form.monthlyOperatingCosts ? Number(form.monthlyOperatingCosts) : 0,
          askingRent: analysisType === "lease" ? Number(form.askingRent) : undefined,
          askingPrice: analysisType === "purchase" ? Number(form.askingPrice) : undefined,
        },
      });
      if (res.data?.error && res.status === 403) {
        setUpgradeNeeded(res.data.upgrade || "pro");
      } else if (res.data?.error) {
        setError(lang === "ar" ? res.data.error : (res.data.error_en || res.data.error));
      } else if (res.data?.analysis) {
        setResult(res.data.analysis);
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data?.upgrade) {
        setUpgradeNeeded(data.upgrade);
      } else {
        setError(lang === "ar" ? data?.error : (data?.error_en || data?.error || err.message || t("common.error")));
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!form.city || !form.unitType || !form.platform) return false;
    if (!form.expectedNightlyRate || Number(form.expectedNightlyRate) <= 0) return false;
    if (!form.expectedOccupancy || Number(form.expectedOccupancy) <= 0 || Number(form.expectedOccupancy) > 100) return false;
    if (analysisType === "lease" && (!form.askingRent || Number(form.askingRent) <= 0)) return false;
    if (analysisType === "purchase" && (!form.askingPrice || Number(form.askingPrice) <= 0)) return false;
    return true;
  };

  const inputClass = "w-full px-4 py-2.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all";
  const labelClass = "font-body text-xs tracking-label uppercase text-muted-foreground mb-2 block";
  const chipClass = (selected) => `px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${selected ? "bg-accent text-accent-foreground border-transparent" : "bg-background text-muted-foreground border-border hover:border-foreground/30"}`;

  return (
    <div className="pt-32 pb-24 px-[4%] max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-3">
          {lang === "ar" ? "أداة استثمارية" : "Investment Tool"}
        </p>
        <h1 className="font-display text-display-lg font-light mb-3 flex items-center gap-3">
          <Briefcase size={32} strokeWidth={1} className="text-accent" />
          {lang === "ar" ? "المستشار الاستثماري الذكي" : "AI Investment Consultant"}
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          {lang === "ar"
            ? "حلّل صفقات الإيجار السنوي والشراء قبل الالتزام بها — تحليل استشاري فقط وليس نصيحة مالية."
            : "Analyze annual-lease and purchase deals before you commit — advisory only, not financial advice."}
        </p>
      </motion.div>

      {/* Analysis type toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAnalysisType("lease")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${analysisType === "lease" ? "bg-accent text-accent-foreground border-transparent" : "bg-background text-muted-foreground border-border hover:border-foreground/30"}`}
          >
            <KeyRound size={16} strokeWidth={1.5} />
            {lang === "ar" ? "تحليل إيجار سنوي" : "Annual lease"}
          </button>
          <button
            type="button"
            onClick={() => setAnalysisType("purchase")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${analysisType === "purchase" ? "bg-accent text-accent-foreground border-transparent" : "bg-background text-muted-foreground border-border hover:border-foreground/30"}`}
          >
            <Home size={16} strokeWidth={1.5} />
            {lang === "ar" ? "تحليل شراء" : "Purchase"}
          </button>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mb-8">
        <div className="space-y-5">
          {/* City */}
          <div>
            <label className={labelClass}>{lang === "ar" ? "المدينة" : "City"} *</label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button key={c.value} type="button" onClick={() => set("city", c.value)} className={chipClass(form.city === c.value)}>
                  {lang === "ar" ? c.ar : c.en}
                </button>
              ))}
            </div>
          </div>

          {/* District */}
          <div>
            <label className={labelClass}>{lang === "ar" ? "الحي" : "District"}</label>
            <input
              value={form.district}
              onChange={(e) => set("district", e.target.value)}
              placeholder={lang === "ar" ? "مثال: حي العليا" : "e.g. Al Olaya"}
              className={inputClass}
            />
          </div>

          {/* Unit type */}
          <div>
            <label className={labelClass}>{lang === "ar" ? "نوع الوحدة" : "Unit type"} *</label>
            <div className="flex flex-wrap gap-2">
              {UNIT_TYPES.map((u) => (
                <button key={u.value} type="button" onClick={() => set("unitType", u.value)} className={chipClass(form.unitType === u.value)}>
                  {lang === "ar" ? u.ar : u.en}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className={labelClass}>{lang === "ar" ? "المنصة" : "Platform"} *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.value} type="button" onClick={() => set("platform", p.value)} className={chipClass(form.platform === p.value)}>
                  {lang === "ar" ? p.ar : p.en}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{lang === "ar" ? "سعر الليلة المتوقع (ر.س)" : "Expected nightly rate (SAR)"} *</label>
              <input type="number" value={form.expectedNightlyRate} onChange={(e) => set("expectedNightlyRate", e.target.value)} className={inputClass} dir="ltr" />
            </div>
            <div>
              <label className={labelClass}>{lang === "ar" ? "الإشغال المتوقع (٪)" : "Expected occupancy (%)"} *</label>
              <input type="number" value={form.expectedOccupancy} onChange={(e) => set("expectedOccupancy", e.target.value)} className={inputClass} dir="ltr" />
            </div>
            <div>
              <label className={labelClass}>{lang === "ar" ? "التكاليف التشغيلية الشهرية (ر.س)" : "Monthly operating costs (SAR)"}</label>
              <input type="number" value={form.monthlyOperatingCosts} onChange={(e) => set("monthlyOperatingCosts", e.target.value)} className={inputClass} dir="ltr" />
            </div>
            {analysisType === "lease" ? (
              <div>
                <label className={labelClass}>{lang === "ar" ? "الإيجار السنوي المطلوب (ر.س)" : "Annual asking rent (SAR)"} *</label>
                <input type="number" value={form.askingRent} onChange={(e) => set("askingRent", e.target.value)} className={inputClass} dir="ltr" />
              </div>
            ) : (
              <div>
                <label className={labelClass}>{lang === "ar" ? "سعر الشراء المطلوب (ر.س)" : "Asking purchase price (SAR)"} *</label>
                <input type="number" value={form.askingPrice} onChange={(e) => set("askingPrice", e.target.value)} className={inputClass} dir="ltr" />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className="ghost-btn flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                {lang === "ar" ? "جاري التحليل..." : "Analyzing..."}
              </>
            ) : (
              <>
                <Sparkles size={16} strokeWidth={1.5} />
                {lang === "ar" ? "تحليل الصفقة" : "Analyze Deal"}
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 border border-destructive/30 bg-destructive/5 rounded-2xl">
          <p className="font-body text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Upgrade panel */}
      {upgradeNeeded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-8 border border-accent/30 bg-accent/5 rounded-2xl text-center">
          <Crown size={32} strokeWidth={1} className="text-accent mx-auto mb-4" />
          <h3 className="font-display text-xl font-light mb-2">
            {lang === "ar" ? "ترقية مطلوبة" : "Upgrade Required"}
          </h3>
          <p className="font-body text-sm text-muted-foreground mb-6">
            {lang === "ar"
              ? "المستشار الاستثماري الذكي متاح في باقة برو (تحليل الإيجار السنوي) وباقة الأعمال (الإيجار والشراء)."
              : "The AI Investment Consultant is available on the Pro plan (lease analysis) and the Business plan (lease + purchase)."}
          </p>
          <Link to="/billing" className="ghost-btn inline-block text-xs">
            {lang === "ar" ? "ترقية الاشتراك" : "Upgrade Subscription"}
          </Link>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
          {/* Verdict banner */}
          {(() => {
            const verdict = VERDICT_META[result.verdict] || VERDICT_META.renegotiate;
            const VerdictIcon = verdict.Icon;
            return (
              <div className={`flex items-center gap-4 p-5 sm:p-6 rounded-2xl border ${verdict.border} ${verdict.bg}`}>
                <VerdictIcon size={28} strokeWidth={1.5} className={`${verdict.text} flex-shrink-0`} />
                <div>
                  <p className={`font-display text-base sm:text-lg font-light ${verdict.text}`}>
                    {lang === "ar" ? verdict.ar : verdict.en}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    {lang === "ar" ? "قوة الصفقة" : "Deal strength"}: {result.dealStrength?.score}/100
                    {result.dealStrength?.label && ` — ${lang === "ar" ? result.dealStrength.label.ar : result.dealStrength.label.en}`}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Investment data — clean professional grid, mobile-first */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Annual net revenue */}
            <div className="p-4 sm:p-5 border border-border/50 rounded-xl bg-card flex flex-col justify-between min-h-[100px]">
              <p className="font-body text-[11px] sm:text-xs tracking-label uppercase text-muted-foreground mb-2">{lang === "ar" ? "صافي الإيراد السنوي" : "Annual net revenue"}</p>
              <div>
                <p className="font-display text-lg sm:text-xl font-light" dir="ltr">{fmt(result.expectedNetRevenue?.annual)} <span className="text-sm text-muted-foreground">{lang === "ar" ? "ر.س" : "SAR"}</span></p>
                {result.expectedNetRevenue?.feeEstimated && (
                  <span className="font-body text-[10px] text-muted-foreground/60">{lang === "ar" ? "تقديري" : "estimated"}</span>
                )}
              </div>
            </div>

            {/* Monthly net */}
            <div className="p-4 sm:p-5 border border-border/50 rounded-xl bg-card flex flex-col justify-between min-h-[100px]">
              <p className="font-body text-[11px] sm:text-xs tracking-label uppercase text-muted-foreground mb-2">{lang === "ar" ? "صافي الإيراد الشهري" : "Monthly net"}</p>
              <p className="font-display text-lg sm:text-xl font-light" dir="ltr">{fmt(result.expectedNetRevenue?.monthly)} <span className="text-sm text-muted-foreground">{lang === "ar" ? "ر.س" : "SAR"}</span></p>
            </div>

            {/* ROI */}
            {result.roiEstimate !== null && (
              <div className="p-4 sm:p-5 border border-border/50 rounded-xl bg-card flex flex-col justify-between min-h-[100px]">
                <p className="font-body text-[11px] sm:text-xs tracking-label uppercase text-muted-foreground mb-2">{lang === "ar" ? "العائد المتوقع" : "ROI estimate"}</p>
                <p className="font-display text-lg sm:text-xl font-light" dir="ltr">{fmt(result.roiEstimate)}%</p>
              </div>
            )}

            {/* Counter-offer */}
            {result.counterOffer !== null && (
              <div className="p-4 sm:p-5 border border-border/50 rounded-xl bg-card flex flex-col justify-between min-h-[100px]">
                <p className="font-body text-[11px] sm:text-xs tracking-label uppercase text-muted-foreground mb-2">{lang === "ar" ? "عرض مضاد مقترح" : "Suggested counter-offer"}</p>
                <p className="font-display text-lg sm:text-xl font-light" dir="ltr">{fmt(result.counterOffer)} <span className="text-sm text-muted-foreground">{lang === "ar" ? "ر.س" : "SAR"}</span></p>
              </div>
            )}

            {/* Negotiation probability */}
            <div className="p-4 sm:p-5 border border-border/50 rounded-xl bg-card flex flex-col justify-between min-h-[100px]">
              <p className="font-body text-[11px] sm:text-xs tracking-label uppercase text-muted-foreground mb-2">{lang === "ar" ? "احتمالية التفاوض" : "Negotiation probability"}</p>
              <p className="font-display text-lg sm:text-xl font-light" dir="ltr">{fmt(result.negotiationProbability)}%</p>
            </div>
          </div>

          {/* Narrative */}
          {result.strNarrativeAr && (
            <div className="p-5 sm:p-6 border border-border/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} strokeWidth={1.5} className="text-accent" />
                <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
                  {lang === "ar" ? "تحليل مدار الذكي" : "Madar AI Analysis"}
                </p>
              </div>
              <p className="font-body text-sm text-foreground leading-relaxed">{result.strNarrativeAr}</p>
            </div>
          )}

          {/* Risks */}
          {result.risks?.length > 0 && (
            <div className="p-5 sm:p-6 border border-border/50 rounded-xl">
              <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
                {lang === "ar" ? "أبرز المخاطر" : "Top Risks"}
              </p>
              <ol className="space-y-3">
                {result.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="font-body text-sm text-foreground/80 leading-relaxed">{lang === "ar" ? risk.ar : risk.en}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          {result.actions?.length > 0 && (
            <div className="p-5 sm:p-6 border border-border/50 rounded-xl">
              <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
                {lang === "ar" ? "إجراءات مقترحة" : "Recommended Actions"}
              </p>
              <ol className="space-y-3">
                {result.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="font-body text-sm text-foreground/80 leading-relaxed">{lang === "ar" ? action.ar : action.en}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Disclaimer */}
          {result.disclaimer && (
            <p className="font-body text-xs text-muted-foreground/60 leading-relaxed text-center px-4">
              {lang === "ar" ? result.disclaimer.ar : result.disclaimer.en}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}