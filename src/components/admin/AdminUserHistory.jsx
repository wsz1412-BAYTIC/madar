import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Building2, TrendingUp, Shield, Sparkles, FileText, ScrollText, X,
  ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";

const TYPE_META = {
  property: { Icon: Building2, color: "text-blue-500", bg: "bg-blue-50", ar: "عقار", en: "Property" },
  recommendation: { Icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", ar: "توصية سعر", en: "Recommendation" },
  performance: { Icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50", ar: "أداء", en: "Performance" },
  consent: { Icon: Shield, color: "text-amber-500", bg: "bg-amber-50", ar: "موافقة", en: "Consent" },
  ai_usage: { Icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50", ar: "استدعاء ذكاء", en: "AI Usage" },
  audit: { Icon: FileText, color: "text-gray-500", bg: "bg-gray-50", ar: "عملية إدارية", en: "Admin Action" },
};

function StatPill({ Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card">
      <Icon size={14} className={color} />
      <div>
        <p className="font-display text-sm font-light">{value}</p>
        <p className="font-body text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function EventRow({ event, lang, isRTL }) {
  const meta = TYPE_META[event.type] || TYPE_META.audit;
  const Icon = meta.Icon;
  const [expanded, setExpanded] = useState(false);
  const hasDetails = event.details && Object.keys(event.details).length > 0;

  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`w-full flex items-start gap-3 py-3 px-2 text-left ${hasDetails ? "hover:bg-muted/30 cursor-pointer" : "cursor-default"}`}
      >
        <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} className={meta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-foreground truncate">{event.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`font-body text-[10px] px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
              {isRTL ? meta.ar : meta.en}
            </span>
            <span className="font-body text-[10px] text-muted-foreground">
              {event.date ? new Date(event.date).toLocaleString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
            </span>
          </div>
        </div>
        {hasDetails && (
          <ChevronRight size={14} className={`text-muted-foreground mt-2 transition-transform ${expanded ? "rotate-90" : ""}`} />
        )}
      </button>
      {expanded && hasDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden"
        >
          <div className="px-2 pb-3 pl-13 ml-11">
            <pre className="font-mono text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(event.details, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AdminUserHistory({ users }) {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const filteredUsers = users.filter((u) =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50);

  const loadHistory = useCallback(async (userId) => {
    setSelectedUser(userId);
    setLoading(true);
    setHistory(null);
    try {
      const res = await base44.functions.invoke("adminOperations", { action: "get_user_history", target_user_id: userId });
      setHistory(res.data);
    } catch (err) {
      setHistory({ error: err.response?.data?.error || "Failed to load" });
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedUserObj = users.find((u) => u.id === selectedUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-light mb-1 flex items-center gap-2">
          <ScrollText size={22} strokeWidth={1.5} className="text-accent" />
          {t("سجل المستخدم", "User History")}
        </h1>
        <p className="font-body text-sm text-muted-foreground">{t("اختر مستخدماً لعرض جميع أحداثه", "Select a user to view their full activity timeline")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User picker */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("بحث عن مستخدم...", "Search users...")}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto rounded-xl border border-border/50 bg-card p-1">
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => loadHistory(u.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                  selectedUser === u.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {u.full_name?.[0] || u.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-xs font-medium truncate">{u.full_name || t("بدون اسم", "No name")}</p>
                  <p className="font-body text-[10px] opacity-70 truncate">{u.email}</p>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">{t("لا نتائج", "No results")}</p>}
          </div>
        </div>

        {/* History panel */}
        <div className="lg:col-span-2">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-[400px] rounded-xl border border-border/50 bg-card">
              <div className="text-center">
                <ScrollText size={32} strokeWidth={1} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">{t("اختر مستخدماً للبدء", "Select a user to begin")}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center h-[400px] items-center rounded-xl border border-border/50 bg-card">
              <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
            </div>
          ) : history?.error ? (
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">{history.error}</div>
          ) : history ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
              {/* User header */}
              <div className="p-5 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-lg font-medium text-accent">
                    {history.user?.full_name?.[0] || history.user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-display text-lg font-light">{history.user?.full_name || t("بدون اسم", "No name")}</p>
                    <p className="font-body text-xs text-muted-foreground">{history.user?.email}</p>
                  </div>
                  <div className="mr-auto">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${history.user?.role === "admin" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {history.user?.role || "user"}
                    </span>
                  </div>
                </div>
                {history.user?.created_date && (
                  <p className="font-body text-xs text-muted-foreground">
                    {t("انضم في", "Joined")}: {new Date(history.user.created_date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-2">
                <StatPill Icon={Building2} label={t("عقارات", "Properties")} value={history.counts?.properties ?? 0} color="text-blue-500" />
                <StatPill Icon={TrendingUp} label={t("توصيات", "Recs")} value={history.counts?.recommendations ?? 0} color="text-emerald-500" />
                <StatPill Icon={Sparkles} label={t("استدعاءات ذكاء", "AI Calls")} value={history.counts?.ai_calls ?? 0} color="text-purple-500" />
                <StatPill Icon={Shield} label={t("موافقات", "Consents")} value={history.counts?.consents ?? 0} color="text-amber-500" />
                <StatPill Icon={FileText} label={t("عمليات إدارية", "Admin Actions")} value={history.counts?.admin_actions ?? 0} color="text-gray-500" />
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-border/50 bg-card p-3">
                <p className="font-body text-xs font-medium text-muted-foreground px-2 pb-2 pt-1">{t("السجل الزمني", "Timeline")} · {history.events?.length || 0} {t("حدث", "events")}</p>
                {history.events?.length > 0 ? (
                  <div>
                    {history.events.map((event, i) => (
                      <EventRow key={`${event.id}-${i}`} event={event} lang={lang} isRTL={isRTL} />
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">{t("لا توجد أحداث", "No events")}</p>
                )}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}