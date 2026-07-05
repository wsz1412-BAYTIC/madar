import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Activity, Zap, Bug, Building2, AlertTriangle,
  Brain, RefreshCw, Check, X, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const ALERT_META = {
  rapid_api_calls: {
    Icon: Zap,
    ar: "نشاط API مكثّف", en: "Rapid API Activity",
    color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",
  },
  repeated_failures: {
    Icon: Bug,
    ar: "محاولات فاشلة متكررة", en: "Repeated Failures",
    color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
  },
  burst_property_creation: {
    Icon: Building2,
    ar: "إنشاء عقارات مفرط", en: "Burst Property Creation",
    color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
  },
  suspicious_admin_actions: {
    Icon: ShieldAlert,
    ar: "نشاط إداري مشبوه", en: "Suspicious Admin Actions",
    color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200",
  },
  abnormal_ai_usage: {
    Icon: Brain,
    ar: "استهلاك ذكاء غير طبيعي", en: "Abnormal AI Usage",
    color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200",
  },
  multiple_account_access: {
    Icon: AlertTriangle,
    ar: "وصول متعدد", en: "Multiple Account Access",
    color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200",
  },
};

const SEVERITY_META = {
  info: { ar: "معلومة", en: "Info", ring: "ring-blue-200", label: "bg-blue-100 text-blue-700" },
  warning: { ar: "تحذير", en: "Warning", ring: "ring-amber-200", label: "bg-amber-100 text-amber-700" },
  critical: { ar: "حرج", en: "Critical", ring: "ring-red-200", label: "bg-red-100 text-red-700" },
};

const STATUS_META = {
  new: { ar: "جديد", en: "New", label: "bg-red-100 text-red-700" },
  acknowledged: { ar: "تم الاطّلاع", en: "Acknowledged", label: "bg-amber-100 text-amber-700" },
  resolved: { ar: "تم الحل", en: "Resolved", label: "bg-emerald-100 text-emerald-700" },
};

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminSecurityAlerts() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);
  const { toast } = useToast();

  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState("all"); // all, new, acknowledged, resolved

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statusArg = filter === "all" ? undefined : filter;
      const res = await base44.functions.invoke("securityMonitor", {
        action: "list_alerts",
        status: statusArg,
      });
      setAlerts(res.data?.alerts || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await base44.functions.invoke("securityMonitor", { action: "scan" });
      const stats = res.data?.stats;
      const count = stats?.alertsCreated ?? 0;
      toast({
        title: t("اكتمل الفحص الأمني", "Security scan complete"),
        description: count > 0
          ? t(`تم اكتشاف ${count} تنبيه جديد`, `${count} new alert(s) detected`)
          : t("لم يتم اكتشاف تهديدات جديدة", "No new threats detected"),
      });
      load();
    } catch {
      toast({ title: t("فشل الفحص", "Scan failed"), variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await base44.functions.invoke("securityMonitor", { action: "acknowledge", alert_id: alertId });
      toast({ title: t("تم الاطّلاع على التنبيه", "Alert acknowledged") });
      load();
    } catch {
      toast({ title: t("فشل التحديث", "Update failed"), variant: "destructive" });
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await base44.functions.invoke("securityMonitor", { action: "resolve", alert_id: alertId });
      toast({ title: t("تم حل التنبيه", "Alert resolved") });
      load();
    } catch {
      toast({ title: t("فشل التحديث", "Update failed"), variant: "destructive" });
    }
  };

  const handleDelete = async (alertId) => {
    try {
      await base44.functions.invoke("securityMonitor", { action: "delete_alert", alert_id: alertId });
      toast({ title: t("تم حذف التنبيه", "Alert deleted") });
      load();
    } catch {
      toast({ title: t("فشل الحذف", "Delete failed"), variant: "destructive" });
    }
  };

  const newCount = alerts?.filter((a) => a.status === "new").length || 0;
  const criticalCount = alerts?.filter((a) => a.severity === "critical" && a.status !== "resolved").length || 0;

  const FILTERS = [
    { key: "all", ar: "الكل", en: "All" },
    { key: "new", ar: "جديد", en: "New" },
    { key: "acknowledged", ar: "تم الاطّلاع", en: "Acknowledged" },
    { key: "resolved", ar: "تم الحل", en: "Resolved" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-light mb-1 flex items-center gap-2">
            <ShieldAlert size={22} strokeWidth={1.5} className="text-destructive" />
            {t("تنبيهات الأمان", "Security Alerts")}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {t("رصد النشاط غير المعتاد ومحاولات الدخول المتكررة لتعزيز أمان المنصة", "Monitor unusual activity and repeated access attempts to enhance platform security")}
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} strokeWidth={1.5} />}
          {t("فحص النشاط", "Scan Activity")}
        </button>
      </div>

      {/* Summary badges */}
      {alerts && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-body text-xs text-muted-foreground">{t("جديد", "New")}</span>
            <span className="font-display text-sm font-medium">{newCount}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-body text-xs text-muted-foreground">{t("حرج", "Critical")}</span>
            <span className="font-display text-sm font-medium">{criticalCount}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="font-body text-xs text-muted-foreground">{t("الإجمالي", "Total")}</span>
            <span className="font-display text-sm font-medium">{alerts.length}</span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === f.key
                ? "bg-accent text-accent-foreground border-transparent"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            {isRTL ? f.ar : f.en}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const meta = ALERT_META[alert.alert_type] || ALERT_META.suspicious_admin_actions;
            const sev = SEVERITY_META[alert.severity] || SEVERITY_META.warning;
            const statusMeta = STATUS_META[alert.status] || STATUS_META.new;
            const AlertIcon = meta.Icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
                className={`p-4 rounded-xl border ${meta.border} ${meta.bg} ring-1 ${sev.ring}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center`}>
                    <AlertIcon size={18} className={meta.color} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sev.label}`}>
                        {isRTL ? sev.ar : sev.en}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMeta.label}`}>
                        {isRTL ? statusMeta.ar : statusMeta.en}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.bg} ${meta.color} border ${meta.border}`}>
                        {isRTL ? meta.ar : meta.en}
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground ml-auto">
                        {fmtDate(alert.detected_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="font-body text-sm font-medium text-foreground mb-1">
                      {alert.title}
                    </p>

                    {/* Description */}
                    <p className="font-body text-xs text-muted-foreground leading-relaxed mb-2">
                      {alert.description}
                    </p>

                    {/* User info */}
                    {alert.user_email && (
                      <p className="font-body text-[11px] text-muted-foreground/70 mb-2" dir="ltr">
                        {alert.user_email}
                      </p>
                    )}

                    {/* Actions */}
                    {alert.status !== "resolved" && (
                      <div className="flex gap-2 mt-2">
                        {alert.status === "new" && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border border-border hover:bg-accent hover:text-accent-foreground transition-all"
                          >
                            <Check size={11} />
                            {t("إقرار", "Acknowledge")}
                          </button>
                        )}
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <Check size={11} />
                          {t("حل", "Resolve")}
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border border-border text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
                        >
                          <X size={11} />
                          {t("حذف", "Delete")}
                        </button>
                      </div>
                    )}

                    {/* Resolution info */}
                    {alert.status === "resolved" && alert.resolution_notes && (
                      <p className="font-body text-[11px] text-emerald-600 mt-2">
                        ✓ {alert.resolution_notes}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
            <ShieldAlert size={28} strokeWidth={1} className="text-emerald-600" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            {t("لا توجد تنبيهات أمنية", "No security alerts")}
          </p>
          <p className="font-body text-xs text-muted-foreground/60 mt-1">
            {t("اضغط على \"فحص النشاط\" لرصد أي نشاط غير معتاد", "Click \"Scan Activity\" to detect unusual behavior")}
          </p>
        </div>
      )}
    </div>
  );
}