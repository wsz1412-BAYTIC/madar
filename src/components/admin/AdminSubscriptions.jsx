import { useState } from "react";
import { Crown, RefreshCcw, Edit3, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const PLAN_LABELS = { ar: { free: "مجاني", starter: "ستارتر", growth: "نمو", pro: "برو" }, en: { free: "Free", starter: "Starter", growth: "Growth", pro: "Pro" } };
const STATUS_LABELS = { ar: { active: "نشط", suspended: "معلق", cancelled: "ملغي", past_due: "متأخر", trialing: "تجريبي" }, en: { active: "Active", suspended: "Suspended", cancelled: "Cancelled", past_due: "Past Due", trialing: "Trialing" } };

export default function AdminSubscriptions({ subscriptions, users, onRefresh }) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const userMap = {};
  users.forEach((u) => { userMap[u.id] = u; });

  const startEdit = (sub) => {
    setEditing(sub.id);
    setForm({ plan: sub.plan, status: sub.status, usage_limit: sub.usage_limit, payment_status: sub.payment_status });
  };

  const saveEdit = async (subId) => {
    setLoading(true);
    try {
      await base44.functions.invoke("adminOperations", { action: "update_subscription", target_user_id: subscriptions.find(s => s.id === subId)?.owner_id, ...form });
      toast({ title: t("تم التحديث", "Updated") });
      setEditing(null);
      onRefresh();
    } catch (err) {
      toast({ title: err.response?.data?.error || t("حدث خطأ", "Error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const approveTrial = async (userId) => {
    setLoading(true);
    try {
      await base44.functions.invoke("adminOperations", { action: "approve_trial_reactivation", target_user_id: userId });
      toast({ title: t("تم تفعيل التجربة", "Trial reactivated") });
      onRefresh();
    } catch (err) {
      toast({ title: err.response?.data?.error || t("حدث خطأ", "Error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-light mb-1">{t("الاشتراكات", "Subscriptions")}</h1>
        <p className="font-body text-sm text-muted-foreground">{subscriptions.length} {t("اشتراك", "subscriptions")}</p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subscriptions.map((sub) => {
          const user = userMap[sub.owner_id];
          const isEditing = editing === sub.id;
          return (
            <div key={sub.id} className="p-5 rounded-xl border border-border/50 bg-card space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{user?.full_name || user?.email || sub.owner_id.slice(0, 8)}</p>
                  <p className="font-body text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.plan === "pro" ? "bg-purple-100 text-purple-700" : sub.plan === "growth" ? "bg-blue-100 text-blue-700" : sub.plan === "starter" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                  {isRTL ? PLAN_LABELS.ar[sub.plan] : PLAN_LABELS.en[sub.plan]}
                </span>
              </div>

              {/* Details */}
              {isEditing ? (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <div className="grid grid-cols-2 gap-2">
                    <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="px-2 py-1.5 text-xs rounded-lg border border-border bg-background">
                      {["free", "starter", "growth", "pro"].map((p) => <option key={p} value={p}>{isRTL ? PLAN_LABELS.ar[p] : PLAN_LABELS.en[p]}</option>)}
                    </select>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-2 py-1.5 text-xs rounded-lg border border-border bg-background">
                      {["active", "suspended", "cancelled", "past_due", "trialing"].map((s) => <option key={s} value={s}>{isRTL ? STATUS_LABELS.ar[s] : STATUS_LABELS.en[s]}</option>)}
                    </select>
                    <input type="number" value={form.usage_limit || ""} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} placeholder={t("حد الاستخدام", "Usage limit")} className="px-2 py-1.5 text-xs rounded-lg border border-border bg-background" />
                    <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })} className="px-2 py-1.5 text-xs rounded-lg border border-border bg-background">
                      {["none", "paid", "pending", "failed", "not_required", "trial"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit(sub.id)} disabled={loading} className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50">{t("حفظ", "Save")}</button>
                    <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted"><X size={12} className="inline" /></button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pt-2 border-t border-border/30">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("الحالة", "Status")}</span><span>{isRTL ? STATUS_LABELS.ar[sub.status] : STATUS_LABELS.en[sub.status]}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("الاستخدام", "Usage")}</span><span>{sub.usage_count || 0} / {sub.usage_limit || "—"}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("الدفع", "Payment")}</span><span>{sub.payment_status || "—"}</span></div>
                  {sub.trial_status === "active" && (
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("انتهاء التجربة", "Trial ends")}</span><span>{sub.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short" }) : "—"}</span></div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => startEdit(sub)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted transition-all"><Edit3 size={11} /> {t("تعديل", "Edit")}</button>
                    {sub.trial_used_at && (
                      <button onClick={() => approveTrial(sub.owner_id)} disabled={loading} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-amber-300 text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50"><RefreshCcw size={11} /> {t("تفعيل تجربة", "Reactivate")}</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {subscriptions.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("لا توجد اشتراكات", "No subscriptions")}</p>}
    </div>
  );
}