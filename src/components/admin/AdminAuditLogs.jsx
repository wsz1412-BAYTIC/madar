import { ScrollText, Shield, UserCog, CreditCard, Database, Ban } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const ACTION_META = {
  role_change: { Icon: UserCog, color: "text-blue-500", ar: "تغيير دور", en: "Role Change" },
  account_suspension: { Icon: Ban, color: "text-red-500", ar: "تعليق حساب", en: "Suspension" },
  account_activation: { Icon: Shield, color: "text-emerald-500", ar: "تفعيل حساب", en: "Activation" },
  subscription_change: { Icon: CreditCard, color: "text-amber-500", ar: "تغيير اشتراك", en: "Subscription" },
  manual_pricing_override: { Icon: Database, color: "text-purple-500", ar: "تعديل سعر", en: "Pricing Override" },
  admin_data_access: { Icon: ScrollText, color: "text-gray-500", ar: "وصول للبيانات", en: "Data Access" },
  admin_data_modification: { Icon: Database, color: "text-indigo-500", ar: "تعديل بيانات", en: "Data Modification" },
  user_deletion: { Icon: Ban, color: "text-red-500", ar: "حذف مستخدم", en: "User Deletion" },
};

export default function AdminAuditLogs({ logs }) {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const formatValue = (val) => {
    if (!val) return "—";
    if (typeof val === "string") return val;
    return JSON.stringify(val).slice(0, 80) + (JSON.stringify(val).length > 80 ? "…" : "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-light mb-1">{t("سجل العمليات", "Audit Logs")}</h1>
        <p className="font-body text-sm text-muted-foreground">{logs.length} {t("عملية", "entries")}</p>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {logs.map((log) => {
          const meta = ACTION_META[log.action] || { Icon: ScrollText, color: "text-gray-500", ar: log.action, en: log.action };
          const Icon = meta.Icon;
          return (
            <div key={log.id} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/20 transition-colors">
              <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                <Icon size={15} className={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`font-body text-xs font-medium ${meta.color}`}>{isRTL ? meta.ar : meta.en}</span>
                  <span className="font-body text-xs text-muted-foreground">· {log.target_entity}</span>
                </div>
                <p className="font-body text-xs text-foreground mb-1">{log.notes || log.action}</p>
                {log.previous_value && (
                  <div className="flex gap-2 text-[10px] font-mono text-muted-foreground mt-1">
                    <span className="text-red-400/70 line-through">{formatValue(log.previous_value)}</span>
                    <span>→</span>
                    <span className="text-emerald-600/70">{formatValue(log.new_value)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-body text-[10px] text-muted-foreground">{log.acting_user_email}</span>
                  <span className="font-body text-[10px] text-muted-foreground/60">
                    {new Date(log.created_date).toLocaleString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("لا توجد سجلات", "No logs")}</p>}
      </div>
    </div>
  );
}