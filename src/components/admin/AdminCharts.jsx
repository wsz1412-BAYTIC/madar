import { useState, useEffect, useCallback } from "react";
import { Users, Building2, CreditCard, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";

const PLAN_COLORS = { free: "#94a3b8", starter: "#f59e0b", growth: "#3b82f6", pro: "#8b5cf6" };

function weekKey(d) {
  const date = new Date(d);
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekLabel(key, isRTL) {
  const [year, wk] = key.split("-W");
  return isRTL ? `أ${wk}` : `W${wk}`;
}

function buildLastNWeeks(n) {
  const weeks = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(weekKey(d));
  }
  return weeks;
}

function summarizeByWeek(items, dateField, weeks) {
  const counts = {};
  weeks.forEach((w) => { counts[w] = 0; });
  items.forEach((item) => {
    const raw = item[dateField] || item.created_date;
    if (!raw) return;
    const k = weekKey(raw);
    if (counts[k] !== undefined) counts[k]++;
  });
  return weeks.map((w) => ({ week: w, count: counts[w] }));
}

function cumulativeByWeek(items, dateField, weeks) {
  const sorted = [...items].filter((i) => i[dateField] || i.created_date)
    .sort((a, b) => new Date(a[dateField] || a.created_date) - new Date(b[dateField] || b.created_date));
  const result = weeks.map((w) => {
    const cutoff = endOfWeek(w);
    const total = sorted.filter((i) => new Date(i[dateField] || i.created_date) <= cutoff).length;
    return { week: w, total };
  });
  return result;
}

function endOfWeek(weekKeyStr) {
  const [year, wk] = weekKeyStr.split("-W");
  const onejan = new Date(parseInt(year), 0, 1);
  const dayOffset = (parseInt(wk) - 1) * 7 + (1 - onejan.getDay());
  const weekStart = new Date(parseInt(year), 0, 1 + dayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

function subscriptionByPlanWeek(subs, weeks) {
  const byPlan = { free: {}, starter: {}, growth: {}, pro: {} };
  weeks.forEach((w) => { Object.keys(byPlan).forEach((p) => { byPlan[p][w] = 0; }); });
  subs.forEach((s) => {
    const raw = s.started_at || s.created_date;
    if (!raw) return;
    const k = weekKey(raw);
    if (byPlan[s.plan] && byPlan[s.plan][k] !== undefined) byPlan[s.plan][k]++;
  });
  return weeks.map((w) => ({
    week: w,
    free: byPlan.free[w],
    starter: byPlan.starter[w],
    growth: byPlan.growth[w],
    pro: byPlan.pro[w],
  }));
}

const tooltipStyle = { fontSize: 11, borderRadius: 8, border: "1px solid #eee" };

function ChartCard({ Icon, color, title, children }) {
  return (
    <div className="p-5 rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={15} className="text-white" />
        </div>
        <h3 className="font-body text-sm font-medium">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminCharts() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, subsRes, propsRes] = await Promise.allSettled([
        base44.functions.invoke("adminOperations", { action: "list_users" }),
        base44.functions.invoke("adminOperations", { action: "list_subscriptions" }),
        base44.functions.invoke("adminOperations", { action: "list_all_properties", limit: 500 }),
      ]);
      setData({
        users: usersRes.status === "fulfilled" ? usersRes.value.data?.users || [] : [],
        subscriptions: subsRes.status === "fulfilled" ? subsRes.value.data?.subscriptions || [] : [],
        properties: propsRes.status === "fulfilled" ? propsRes.value.data?.properties || [] : [],
      });
    } catch {
      setData({ users: [], subscriptions: [], properties: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const weeks = buildLastNWeeks(12);
  const weekLabels = weeks.map((w) => ({ week: w, label: weekLabel(w, isRTL) }));

  const usersData = summarizeByWeek(data.users, "created_date", weeks)
    .map((d) => ({ ...d, label: weekLabel(d.week, isRTL) }));
  const propsData = summarizeByWeek(data.properties, "created_date", weeks)
    .map((d) => ({ ...d, label: weekLabel(d.week, isRTL) }));
  const subsCumulative = cumulativeByWeek(data.subscriptions, "started_at", weeks)
    .map((d) => ({ ...d, label: weekLabel(d.week, isRTL) }));
  const subsByPlan = subscriptionByPlanWeek(data.subscriptions, weeks)
    .map((d) => ({ ...d, label: weekLabel(d.week, isRTL) }));

  const totalUsers = data.users.length;
  const totalProps = data.properties.length;
  const totalSubs = data.subscriptions.length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display text-xl font-light">{totalUsers}</p>
            <p className="font-body text-[10px] text-muted-foreground">{t("مستخدم", "Users")}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display text-xl font-light">{totalProps}</p>
            <p className="font-body text-[10px] text-muted-foreground">{t("عقار", "Properties")}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <CreditCard size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display text-xl font-light">{totalSubs}</p>
            <p className="font-body text-[10px] text-muted-foreground">{t("اشتراك", "Subscriptions")}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active users trend */}
        <ChartCard Icon={Users} color="bg-blue-500" title={t("المستخدمون الجدد (أسبوعياً)", "New Users (Weekly)")}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={usersData}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#usersGrad)" name={t("مستخدمون", "Users")} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Property imports */}
        <ChartCard Icon={Building2} color="bg-emerald-500" title={t("استيراد العقارات (أسبوعياً)", "Property Imports (Weekly)")}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={propsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name={t("عقارات", "Properties")} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Subscription growth — cumulative */}
        <ChartCard Icon={TrendingUp} color="bg-amber-500" title={t("نمو الاشتراكات (تراكمي)", "Subscription Growth (Cumulative)")}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={subsCumulative}>
              <defs>
                <linearGradient id="subsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} fill="url(#subsGrad)" name={t("إجمالي", "Total")} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Subscriptions by plan */}
        <ChartCard Icon={CreditCard} color="bg-purple-500" title={t("الاشتراكات حسب الباقة (أسبوعياً)", "Subscriptions by Plan (Weekly)")}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={subsByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {Object.keys(PLAN_COLORS).map((plan) => (
                <Line key={plan} type="monotone" dataKey={plan} stroke={PLAN_COLORS[plan]} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}