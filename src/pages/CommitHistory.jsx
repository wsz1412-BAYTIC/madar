import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, Bug, Megaphone, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";

const TYPE_META = {
  feature: { Icon: Sparkles, ar: "ميزة جديدة", en: "New Feature", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  improvement: { Icon: Wrench, ar: "تحسين", en: "Improvement", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  fix: { Icon: Bug, ar: "إصلاح", en: "Bug Fix", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  announcement: { Icon: Megaphone, ar: "إعلان", en: "Announcement", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
};

export default function CommitHistory() {
  const { lang } = useLanguage();
  const [updates, setUpdates] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await base44.entities.SiteUpdate.filter({ is_published: true }, "-date", 50);
      setUpdates(rows || []);
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isRTL = lang === "ar";

  if (loading) {
    return (
      <div className="pt-32 flex justify-center" style={{ background: "#fcfcfc", minHeight: "100vh" }}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 px-[5%] max-w-[800px] mx-auto" style={{ background: "#fcfcfc", minHeight: "100vh" }}>
      {/* Header row — refresh left, label right */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-black text-xs font-medium text-black hover:bg-black hover:text-white transition-all duration-300"
        >
          <RefreshCw size={13} strokeWidth={1.5} />
          {isRTL ? "تحديث" : "Refresh"}
        </button>

        <p className="font-body text-xs text-gray-400 tracking-wide">
          {isRTL ? "تحديثات المنصة" : "Product Updates"}
        </p>
      </div>

      {/* Centered title */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          {isRTL ? "سجل التحديثات" : "Changelog"}
        </h1>
        <p className="font-body text-sm text-gray-500">
          {isRTL ? "آخر التحديثات والميزات في منصة مدار" : "Latest updates and features on Madar"}
        </p>
      </motion.div>

      {/* Divider */}
      <div className="w-full h-px mb-8" style={{ background: "#eeeeee" }} />

      {/* Updates list */}
      {updates && updates.length > 0 ? (
        <div className="space-y-1">
          {updates.map((item, i) => {
            const meta = TYPE_META[item.type] || TYPE_META.feature;
            const Icon = meta.Icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
                className="py-5 border-b px-2 -mx-2 rounded-lg"
                style={{ borderColor: "#eeeeee" }}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full ${meta.bg} ${meta.border} border flex items-center justify-center`}>
                    <Icon size={16} strokeWidth={1.5} className={meta.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-body text-[10px] tracking-label uppercase px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                        {isRTL ? meta.ar : meta.en}
                      </span>
                      <span className="font-body text-xs text-gray-400">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <p className="font-body text-sm font-medium text-gray-800 mb-1">
                      {isRTL ? item.title_ar : item.title_en}
                    </p>
                    {(isRTL ? item.description_ar : item.description_en) && (
                      <p className="font-body text-sm text-gray-500 leading-relaxed">
                        {isRTL ? item.description_ar : item.description_en}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center py-12"
        >
          <p className="font-body text-sm text-gray-400">
            {isRTL ? "لا توجد تحديثات" : "No updates"}
          </p>
        </motion.div>
      )}
    </div>
  );
}