import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCommit, ExternalLink, RefreshCw, Github, GitPullRequest, ArrowDown } from "lucide-react";
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
      <div className="pt-32 flex justify-center" style={{ background: "#fcfcfc", minHeight: "100vh" }}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-24 px-[4%] max-w-[1000px] mx-auto text-center" style={{ background: "#fcfcfc", minHeight: "100vh" }}>
        <p className="font-body text-sm text-gray-500 mb-4">{error}</p>
        <button onClick={load} className="px-6 py-2 rounded-full border border-black text-xs font-medium hover:bg-black hover:text-white transition-all">
          {t("common.retry")}
        </button>
      </div>
    );
  }

  const { repo, branch, commits, marker_commit, since_pr } = data || {};
  const isRTL = lang === "ar";

  return (
    <div className="pt-20 pb-24 px-[5%] max-w-[900px] mx-auto" style={{ background: "#fcfcfc", minHeight: "100vh" }}>
      {/* Header row — refresh left, label right */}
      <div className="flex items-center justify-between mb-8">
        {/* Refresh button — oval, black outline */}
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-black text-xs font-medium text-black hover:bg-black hover:text-white transition-all duration-300"
        >
          <RefreshCw size={13} strokeWidth={1.5} />
          {isRTL ? "تحديث" : "Refresh"}
        </button>

        {/* Label — top right */}
        <p className="font-body text-xs text-gray-400 tracking-wide">
          {isRTL ? "GITHUB مستودع" : "GitHub Repository"}
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
          {isRTL ? "سجل التحديثات" : "Commit History"}
        </h1>

        {/* Repo link centered with GitHub icon */}
        <a
          href={`https://github.com/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-body text-sm text-gray-500 hover:text-black transition-colors"
        >
          {repo} · {branch}
          <Github size={14} strokeWidth={1.5} />
        </a>
      </motion.div>

      {/* Divider */}
      <div className="w-full h-px mb-8" style={{ background: "#eeeeee" }} />

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
            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            className="group flex items-start gap-3 py-4 border-b hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg"
            style={{ borderColor: "#eeeeee" }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <GitCommit size={16} strokeWidth={1.5} className="text-gray-400 group-hover:text-black transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-gray-700 leading-relaxed mb-2">
                {commit.message}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {commit.author_avatar && (
                  <img
                    src={commit.author_avatar}
                    alt={commit.author_name}
                    className="w-5 h-5 rounded"
                  />
                )}
                <span className="font-body text-xs text-gray-500">
                  {commit.author_name}
                </span>
                <span className="font-mono text-xs text-gray-400">
                  {commit.short_sha}
                </span>
                <span className="font-body text-xs text-gray-400">
                  {formatDate(commit.date)}
                </span>
              </div>
            </div>

            <ExternalLink
              size={13}
              strokeWidth={1.5}
              className="text-gray-300 group-hover:text-black transition-colors flex-shrink-0 mt-1"
            />
          </motion.a>
        ))}
      </div>

      {/* No updates message — centered when no commits */}
      {commits?.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center py-8"
        >
          <p className="font-body text-sm text-gray-400">
            {isRTL ? "لا توجد تحديثات" : "No updates"}
          </p>
        </motion.div>
      )}

      {/* PR divider — "Before PR #X" with down arrow */}
      {marker_commit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4"
        >
          <div className="flex items-center gap-3 py-4">
            <ArrowDown size={15} strokeWidth={1.5} className="text-gray-400" />
            <p className="font-body text-xs tracking-wide text-gray-400">
              {isRTL ? `قبل PR #${since_pr}` : `Before PR #${since_pr}`}
            </p>
            <div className="flex-1 h-px" style={{ background: "#eeeeee" }} />
          </div>

          {/* Marker commit — the PR merge */}
          <motion.a
            href={marker_commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 py-4 px-2 -mx-2 rounded-lg opacity-60 hover:opacity-100 transition-opacity border-b"
            style={{ borderColor: "#eeeeee" }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <GitPullRequest size={16} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-gray-700 leading-relaxed mb-2">
                {marker_commit.message}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {marker_commit.author_avatar && (
                  <img
                    src={marker_commit.author_avatar}
                    alt={marker_commit.author_name}
                    className="w-5 h-5 rounded"
                  />
                )}
                <span className="font-body text-xs text-gray-500">
                  {marker_commit.author_name}
                </span>
                <span className="font-mono text-xs text-gray-400">
                  {marker_commit.short_sha}
                </span>
                <span className="font-body text-xs text-gray-400">
                  {formatDate(marker_commit.date)}
                </span>
              </div>
            </div>
          </motion.a>
        </motion.div>
      )}
    </div>
  );
}