import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, CreditCard, FileText, ScrollText, Shield, Building2, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminSiteUpdates from "@/components/admin/AdminSiteUpdates";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminProperties from "@/components/admin/AdminProperties";
import AdminUserHistory from "@/components/admin/AdminUserHistory";

const TABS = [
  { key: "overview", ar: "نظرة عامة", en: "Overview", Icon: LayoutDashboard },
  { key: "users", ar: "المستخدمون", en: "Users", Icon: Users },
  { key: "properties", ar: "العقارات", en: "Properties", Icon: Building2 },
  { key: "subscriptions", ar: "الاشتراكات", en: "Subscriptions", Icon: CreditCard },
  { key: "history", ar: "سجل المستخدم", en: "User History", Icon: History },
  { key: "updates", ar: "التحديثات", en: "Site Updates", Icon: FileText },
  { key: "audit", ar: "سجل العمليات", en: "Audit Logs", Icon: ScrollText },
];

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({ users: [], subscriptions: [], auditLogs: [], aiUsage: [] });
  const [loading, setLoading] = useState(true);
  const isRTL = lang === "ar";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, subsRes, auditRes, aiRes] = await Promise.allSettled([
        base44.functions.invoke("adminOperations", { action: "list_users" }),
        base44.functions.invoke("adminOperations", { action: "list_subscriptions" }),
        base44.functions.invoke("adminOperations", { action: "list_audit_logs", limit: 100 }),
        base44.entities.AiUsageLog.list("-created_date", 200),
      ]);

      setData({
        users: usersRes.status === "fulfilled" ? usersRes.value.data?.users || [] : [],
        subscriptions: subsRes.status === "fulfilled" ? subsRes.value.data?.subscriptions || [] : [],
        auditLogs: auditRes.status === "fulfilled" ? auditRes.value.data?.audit_logs || [] : [],
        aiUsage: aiRes.status === "fulfilled" ? aiRes.value || [] : [],
      });
    } catch {
      // errors handled by empty arrays
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <aside className="lg:w-64 lg:min-h-[calc(100vh-4rem)] border-r border-border/40 lg:sticky lg:top-16 lg:self-start">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={18} strokeWidth={1.5} className="text-accent" />
              <h2 className="font-display text-lg font-light">
                {isRTL ? "لوحة الإدارة" : "Admin Panel"}
              </h2>
            </div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {TABS.map((tab) => {
                const Icon = tab.Icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    {isRTL ? tab.ar : tab.en}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && <AdminOverview data={data} />}
              {activeTab === "users" && <AdminUsers users={data.users} onRefresh={fetchAll} />}
              {activeTab === "properties" && <AdminProperties />}
              {activeTab === "subscriptions" && <AdminSubscriptions subscriptions={data.subscriptions} users={data.users} onRefresh={fetchAll} />}
              {activeTab === "history" && <AdminUserHistory users={data.users} />}
              {activeTab === "updates" && <AdminSiteUpdates />}
              {activeTab === "audit" && <AdminAuditLogs logs={data.auditLogs} />}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}