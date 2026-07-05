import { Users, CreditCard, Sparkles, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useLanguage } from "@/lib/LanguageContext";

const PLAN_COLORS = { free: "#94a3b8", starter: "#f59e0b", growth: "#3b82f6", pro: "#8b5cf6" };

function StatCard({ Icon, label, value, sub, color }) {
  return (
    <div className="p-5 rounded-xl border border-border/50 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={18} strokeWidth={1.5} className="text-white" />
        </div>
      </div>
      <p className="font-display text-2xl font-light mb-1">{value}</p>
      <p className="font-body text-xs text-muted-foreground">{label}</p>
      {sub && <p className="font-body text-[10px] text-muted-foreground/60 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminOverview({ data }) {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const totalUsers = data.users.length;
  const totalSubs = data.subscriptions.length;
  const activeTrials = data.subscriptions.filter((s) => s.trial_status === "active").length;
  const paidSubs = data.subscriptions.filter((s) => s.payment_status === "paid" || s.payment_status === "trial").length;

  const planDistribution = ["free", "starter", "growth", "pro"].map((plan) => ({
    name: plan,
    value: data.subscriptions.filter((s) => s.plan === plan).length,
  })).filter((d) => d.value > 0);

  const usageByFunction = ["generate-price-recommendation", "ai-investment-consultant", "first-report", "ai-assistant"].map((fn) => ({
    name: fn.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 12),
    success: data.aiUsage.filter((a) => a.functionName === fn && a.status === "success").length,
    fallback: data.aiUsage.filter((a) => a.functionName === fn && a.status === "fallback").length,
    error: data.aiUsage.filter((a) => a.functionName === fn && (a.status === "error" || a.status === "blocked")).length,
  }));

  const totalAiCalls = data.aiUsage.length;
  const successRate = totalAiCalls > 0
    ? Math.round((data.aiUsage.filter((a) => a.status === "success").length / totalAiCalls) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-light mb-1">{t("نظرة عامة", "Overview")}</h1>
        <p className="font-body text-sm text-muted-foreground">{t("ملخص شامل لأداء المنصة", "Platform performance summary")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard Icon={Users} label={t("إجمالي المستخدمين", "Total Users")} value={totalUsers} color="bg-blue-500" />
        <StatCard Icon={CreditCard} label={t("الاشتراكات", "Subscriptions")} value={totalSubs} sub={`${paidSubs} ${t("مدفوع", "paid")}`} color="bg-emerald-500" />
        <StatCard Icon={Sparkles} label={t("تجارب نشطة", "Active Trials")} value={activeTrials} color="bg-amber-500" />
        <StatCard Icon={Activity} label={t("استدعاءات الذكاء", "AI Calls")} value={totalAiCalls} sub={`${successRate}% ${t("نجاح", "success")}`} color="bg-purple-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan distribution pie */}
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <h3 className="font-body text-sm font-medium mb-4">{t("توزيع الباقات", "Plan Distribution")}</h3>
          {planDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {planDistribution.map((entry) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">{t("لا توجد بيانات", "No data")}</div>
          )}
          <div className="flex flex-wrap gap-3 mt-3">
            {planDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: PLAN_COLORS[d.name] }} />
                <span className="font-body text-xs text-muted-foreground capitalize">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI usage bar chart */}
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <h3 className="font-body text-sm font-medium mb-4">{t("استخدام الذكاء الاصطناعي", "AI Usage by Function")}</h3>
          {usageByFunction.some((d) => d.success + d.fallback + d.error > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={usageByFunction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="success" stackId="a" fill="#10b981" name={t("نجاح", "Success")} />
                <Bar dataKey="fallback" stackId="a" fill="#f59e0b" name={t("بديل", "Fallback")} />
                <Bar dataKey="error" stackId="a" fill="#ef4444" name={t("خطأ", "Error")} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">{t("لا توجد بيانات", "No data")}</div>
          )}
        </div>
      </div>

      {/* Recent audit activity */}
      <div className="p-6 rounded-xl border border-border/50 bg-card">
        <h3 className="font-body text-sm font-medium mb-4">{t("آخر العمليات", "Recent Activity")}</h3>
        <div className="space-y-2">
          {data.auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
              {log.action?.includes("deletion") ? <XCircle size={14} className="text-destructive" /> : log.action?.includes("access") ? <AlertCircle size={14} className="text-amber-500" /> : <CheckCircle size={14} className="text-emerald-500" />}
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs text-foreground truncate">{log.notes || log.action}</p>
                <p className="font-body text-[10px] text-muted-foreground">{log.acting_user_email} · {log.target_entity}</p>
              </div>
              <span className="font-body text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(log.created_date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
          {data.auditLogs.length === 0 && <p className="font-body text-sm text-muted-foreground py-4 text-center">{t("لا توجد سجلات", "No logs")}</p>}
        </div>
      </div>
    </div>
  );
}