import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCommit, ExternalLink, RefreshCw, Github } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";

export default function CommitHistory() {
  const { t, lang } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("githubCommits", {});
      setData(res.data);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString(lang === "ar" ? "ar-SA" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-24 px-[4%] max-w-[1000px] mx-auto text-center">
        <p className="font-body text-sm text-muted-foreground mb-4">{error}</p>
        <button onClick={load} className="ghost-btn">
          {t("common.retry")}
        </button>
      </div>
    );
  }

  const { repo, branch, commits } = data || {};

  return (
    <div className="pt-32 pb-24 px-[4%] md:px-[4%] max-w-[1000px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-3">
          {lang === "ar" ? "مستودع GitHub" : "GitHub Repository"}
        </p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-display-lg font-light mb-3">
              {lang === "ar" ? "سجل التحديثات" : "Commit History"}
            </h1>
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Github size={16} strokeWidth={1.5} />
              {repo} · {branch}
            </a>
          </div>
          <button
            onClick={load}
            className="ghost-btn flex items-center gap-2 text-xs"
          >
            <RefreshCw size={14} strokeWidth={1.5} />
            {lang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </motion.div>

      <div className="hairline mb-8" />

      {/* Commit list */}
      <div className="space-y-1">
        {commits?.map((commit, i) => (
          <motion.a
            key={commit.sha}
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.6) }}
            className="group flex items-start gap-4 py-5 border-b border-border/30 hover:border-accent/30 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              <GitCommit size={18} strokeWidth={1.5} className="text-muted-foreground group-hover:text-accent transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-foreground leading-relaxed mb-2 line-clamp-2">
                {commit.message}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {commit.author_avatar && (
                  <img
                    src={commit.author_avatar}
                    alt={commit.author_name}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="font-body text-xs text-muted-foreground">
                  {commit.author_name}
                </span>
                <span className="font-mono text-xs text-muted-foreground/60">
                  {commit.short_sha}
                </span>
                <span className="font-body text-xs text-muted-foreground/60">
                  {formatDate(commit.date)}
                </span>
              </div>
            </div>

            <ExternalLink
              size={14}
              strokeWidth={1.5}
              className="text-muted-foreground/40 group-hover:text-accent transition-colors flex-shrink-0 mt-1"
            />
          </motion.a>
        ))}
      </div>

      {commits?.length === 0 && (
        <p className="font-body text-sm text-muted-foreground text-center py-12">
          {lang === "ar" ? "لا توجد تحديثات" : "No commits found"}
        </p>
      )}
    </div>
  );
}