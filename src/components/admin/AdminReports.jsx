import { useState } from "react";
import { Download, FileSpreadsheet, FileJson, Printer, Loader2, TrendingUp, Briefcase, CreditCard, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { downloadCSV, downloadJSON, printReport } from "@/lib/reportExport";
import AdminCharts from "@/components/admin/AdminCharts";

const REPORTS = [
  {
    key: "financial",
    ar: "تقرير الأداء المالي",
    en: "Financial Performance Report",
    desc_ar: "توصيات الأسعار، الإيرادات، صافي الربح بعد الرسوم، الأداء التشغيلي",
    desc_en: "Price recommendations, revenue, net profit after fees, operational performance",
    Icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    types: ["financial"],
  },
  {
    key: "investment",
    ar: "تقرير التحليلات الاستثمارية",
    en: "Investment Analysis Report",
    desc_ar: "تحليلات الإيجار والشراء، العائد المتوقع، قوة الصفقة، المخاطر",
    desc_en: "Lease & purchase analyses, ROI, deal strength, risks",
    Icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    types: ["investment"],
  },
  {
    key: "subscriptions",
    ar: "تقرير الاشتراكات",
    en: "Subscriptions Report",
    desc_ar: "الباقات، الحالات، الاستخدام، المدفوعات، التجارب",
    desc_en: "Plans, statuses, usage, payments, trials",
    Icon: CreditCard,
    color: "text-amber-600",
    bg: "bg-amber-50",
    types: ["subscriptions"],
  },
  {
    key: "ai_usage",
    ar: "تقرير استخدام الذكاء الاصطناعي",
    en: "AI Usage Report",
    desc_ar: "استدعاءات الذكاء، معدلات النجاح، النماذج، الاستهلاك",
    desc_en: "AI invocations, success rates, models, consumption",
    Icon: Sparkles,
    color: "text-purple-600",
    bg: "bg-purple-50",
    types: ["ai_usage"],
  },
];

function fmtDate(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function AdminReports() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const fetchReport = async (reportKey, types) => {
    setLoading(reportKey);
    try {
      const res = await base44.functions.invoke("adminOperations", {
        action: "export_reports",
        report_types: types,
      });
      return res.data;
    } catch (err) {
      toast({ title: err.response?.data?.error || t("فشل تحميل التقرير", "Failed to load report"), variant: "destructive" });
      return null;
    } finally {
      setLoading(null);
    }
  };

  const ownerName = (userMap, id) => {
    if (!id) return "—";
    const u = userMap?.[id];
    return u ? `${u.full_name || ""} (${u.email || ""})`.trim() : id.slice(0, 8);
  };

  const exportFinancial = async (format) => {
    const data = await fetchReport("financial", ["financial"]);
    if (!data) return;
    const { recommendations = [], performance = [], userMap = {} } = data.data || data;

    const recRows = recommendations.map((r) => ({
      owner: ownerName(userMap, r.created_by_id),
      property_id: r.user_property_id,
      recommended_price: r.recommended_price,
      current_price: r.current_price,
      min_price: r.min_price,
      max_price: r.max_price,
      confidence_score: r.confidence_score,
      revenue_impact: r.revenue_impact,
      net_revenue_after_fees: r.net_revenue_after_fees,
      platform_fee_rate: r.platform_fee_rate,
      status: r.status,
      period: r.period,
      created_date: fmtDate(r.created_date),
    }));

    const perfRows = performance.map((p) => ({
      owner: ownerName(userMap, p.created_by_id),
      property_id: p.user_property_id,
      period_start: p.period_start,
      period_end: p.period_end,
      occupancy_rate: p.occupancy_rate,
      adr: p.adr,
      revpar: p.revpar,
      total_revenue: p.total_revenue,
      total_bookings: p.total_bookings,
      avg_stay_nights: p.average_length_of_stay,
      created_date: fmtDate(p.created_date),
    }));

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      downloadCSV(`madar-financial-recommendations-${stamp}`, recRows);
      downloadCSV(`madar-financial-performance-${stamp}`, perfRows);
      toast({ title: t("تم تصدير ملفات CSV", "CSV files exported") });
    } else if (format === "json") {
      downloadJSON(`madar-financial-report-${stamp}`, { recommendations: recRows, performance: perfRows });
      toast({ title: t("تم تصدير ملف JSON", "JSON file exported") });
    } else if (format === "print") {
      printReport("Madar — Financial Performance Report", [
        { heading: "Price Recommendations", rows: recRows },
        { heading: "Property Performance", rows: perfRows },
      ]);
    }
  };

  const exportInvestment = async (format) => {
    const data = await fetchReport("investment", ["investment"]);
    if (!data) return;
    const { investments = [], userMap = {} } = data.data || data;

    const rows = investments.map((a) => {
      const analysis = a.analysis || {};
      const input = a.input || {};
      return {
        owner: ownerName(userMap, a.userId),
        analysis_type: a.analysisType,
        city: input.city,
        platform: input.platform,
        unit_type: input.unitType,
        asking_amount: a.analysisType === "lease" ? input.askingRent : input.askingPrice,
        expected_nightly_rate: input.expectedNightlyRate,
        expected_occupancy: input.expectedOccupancy,
        verdict: analysis.verdict,
        deal_strength_score: analysis.dealStrength?.score,
        annual_net_revenue: analysis.expectedNetRevenue?.annual,
        monthly_net_revenue: analysis.expectedNetRevenue?.monthly,
        roi_estimate: analysis.roiEstimate,
        counter_offer: analysis.counterOffer,
        negotiation_probability: analysis.negotiationProbability,
        source: a.source,
        plan: a.plan,
        created_date: fmtDate(a.createdAt || a.created_date),
      };
    });

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      downloadCSV(`madar-investment-analysis-${stamp}`, rows);
      toast({ title: t("تم تصدير ملف CSV", "CSV file exported") });
    } else if (format === "json") {
      downloadJSON(`madar-investment-analysis-${stamp}`, rows);
      toast({ title: t("تم تصدير ملف JSON", "JSON file exported") });
    } else if (format === "print") {
      printReport("Madar — Investment Analysis Report", [{ heading: "Investment Analyses", rows }]);
    }
  };

  const exportSubscriptions = async (format) => {
    const data = await fetchReport("subscriptions", ["subscriptions"]);
    if (!data) return;
    const { subscriptions = [], userMap = {} } = data.data || data;

    const rows = subscriptions.map((s) => ({
      owner: ownerName(userMap, s.owner_id),
      plan: s.plan,
      status: s.status,
      usage_count: s.usage_count,
      usage_limit: s.usage_limit,
      payment_status: s.payment_status,
      trial_status: s.trial_status,
      trial_ends_at: fmtDate(s.trial_ends_at),
      started_at: fmtDate(s.started_at),
      renewal_date: fmtDate(s.renewal_date),
    }));

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      downloadCSV(`madar-subscriptions-${stamp}`, rows);
      toast({ title: t("تم تصدير ملف CSV", "CSV file exported") });
    } else if (format === "json") {
      downloadJSON(`madar-subscriptions-${stamp}`, rows);
      toast({ title: t("تم تصدير ملف JSON", "JSON file exported") });
    } else if (format === "print") {
      printReport("Madar — Subscriptions Report", [{ heading: "Subscriptions", rows }]);
    }
  };

  const exportAiUsage = async (format) => {
    const data = await fetchReport("ai_usage", ["ai_usage"]);
    if (!data) return;
    const { aiUsage = [], userMap = {} } = data.data || data;

    const rows = aiUsage.map((a) => ({
      owner: ownerName(userMap, a.userId),
      function: a.functionName,
      plan: a.plan,
      status: a.status,
      model: a.model,
      prompt_tokens: a.promptTokens,
      completion_tokens: a.completionTokens,
      detail: a.detail,
      created_date: fmtDate(a.createdAt || a.created_date),
    }));

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      downloadCSV(`madar-ai-usage-${stamp}`, rows);
      toast({ title: t("تم تصدير ملف CSV", "CSV file exported") });
    } else if (format === "json") {
      downloadJSON(`madar-ai-usage-${stamp}`, rows);
      toast({ title: t("تم تصدير ملف JSON", "JSON file exported") });
    } else if (format === "print") {
      printReport("Madar — AI Usage Report", [{ heading: "AI Usage Log", rows }]);
    }
  };

  const handlers = {
    financial: exportFinancial,
    investment: exportInvestment,
    subscriptions: exportSubscriptions,
    ai_usage: exportAiUsage,
  };

  const EXPORT_BTNS = [
    { format: "csv", label: isRTL ? "CSV" : "CSV", Icon: FileSpreadsheet },
    { format: "json", label: "JSON", Icon: FileJson },
    { format: "print", label: isRTL ? "طباعة" : "Print", Icon: Printer },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-light mb-1 flex items-center gap-2">
          <Download size={22} strokeWidth={1.5} className="text-accent" />
          {t("تصدير التقارير", "Export Reports")}
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          {t("صدّر تقارير الأداء المالي والاستثمار إلى ملفات جاهزة للمشاركة مع فريق العمل", "Export financial & investment reports to shareable files for your team")}
        </p>
      </div>

      {/* Charts section */}
      <AdminCharts />

      <div className="hairline my-2" />

      {/* Section heading for exports */}
      <div>
        <h2 className="font-body text-sm font-medium text-foreground mb-1">
          {t("تصدير الملفات", "File Exports")}
        </h2>
        <p className="font-body text-xs text-muted-foreground">
          {t("صدّر البيانات الخام بصيغ CSV و JSON و PDF", "Export raw data as CSV, JSON, and PDF")}
        </p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map((report) => {
          const Icon = report.Icon;
          const isLoading = loading === report.key;
          return (
            <div key={report.key} className="p-5 rounded-xl border border-border/50 bg-card">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-11 h-11 rounded-lg ${report.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={report.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body text-sm font-medium text-foreground mb-1">
                    {isRTL ? report.ar : report.en}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {isRTL ? report.desc_ar : report.desc_en}
                  </p>
                </div>
              </div>

              {/* Export buttons */}
              <div className="flex gap-2">
                {EXPORT_BTNS.map((btn) => {
                  const BtnIcon = btn.Icon;
                  return (
                    <button
                      key={btn.format}
                      onClick={() => handlers[report.key](btn.format)}
                      disabled={isLoading}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <BtnIcon size={13} />
                      )}
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          {t(
            "الملفات تُنشأ مباشرة في متصفحك وتُحفظ بجهازك — لا تُرفع إلى خادم خارجي. تنسيق CSV يفتح في Excel و Google Sheets، و JSON للمعالجة البرمجية، وخاصية الطباعة تنتج تقريراً منسقاً قابلاً للطباعة أو الحفظ كـ PDF.",
            "Files are generated in your browser and saved locally — nothing is uploaded externally. CSV opens in Excel & Google Sheets, JSON is for programmatic use, and Print produces a formatted printable / save-as-PDF report."
          )}
        </p>
      </div>
    </div>
  );
}