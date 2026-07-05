import { useState } from "react";
import { Search, Shield, Trash2, Crown, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

export default function AdminUsers({ users, onRefresh }) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const filtered = users.filter((u) =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      await base44.functions.invoke("adminOperations", { action: "manage_user", target_user_id: userId, operation: "change_role", new_role: newRole });
      toast({ title: t("تم تحديث الدور", "Role updated") });
      onRefresh();
    } catch (err) {
      toast({ title: err.response?.data?.error || t("حدث خطأ", "Error"), variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId, email) => {
    if (!confirm(t(`هل أنت متأكد من حذف ${email}؟`, `Delete ${email}?`))) return;
    setActionLoading(userId);
    try {
      await base44.functions.invoke("adminOperations", { action: "manage_user", target_user_id: userId, operation: "delete_user" });
      toast({ title: t("تم حذف المستخدم", "User deleted") });
      onRefresh();
    } catch (err) {
      toast({ title: err.response?.data?.error || t("حدث خطأ", "Error"), variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-light mb-1">{t("المستخدمون", "Users")}</h1>
          <p className="font-body text-sm text-muted-foreground">{users.length} {t("مستخدم", "users")}</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("بحث...", "Search...")}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left">
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("المستخدم", "User")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("الدور", "Role")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("تاريخ التسجيل", "Joined")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("إجراءات", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {u.full_name?.[0] || u.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-body text-sm text-foreground">{u.full_name || t("بدون اسم", "No name")}</p>
                      <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                        <Mail size={10} /> {u.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {u.role === "admin" && <Crown size={10} />}
                    {u.role || "user"}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                  {new Date(u.created_date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.role !== "admin" ? (
                      <button
                        onClick={() => changeRole(u.id, "admin")}
                        disabled={actionLoading === u.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
                      >
                        <Shield size={12} /> {t("ترقية", "Promote")}
                      </button>
                    ) : (
                      <button
                        onClick={() => changeRole(u.id, "user")}
                        disabled={actionLoading === u.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted transition-all disabled:opacity-50"
                      >
                        {t("خفض", "Demote")}
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(u.id, u.email)}
                      disabled={actionLoading === u.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("لا توجد نتائج", "No results")}</p>}
      </div>
    </div>
  );
}