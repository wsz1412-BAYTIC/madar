import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import { POLICY_VERSIONS, POLICY_UPDATED } from "@/config/legal";
import { AlertTriangle } from "lucide-react";

/**
 * Shared layout for all legal/policy pages.
 * Renders version stamp, last-updated date, and the mandatory draft banner.
 */
export default function LegalPageLayout({ policyKey, sections, children }) {
  const { lang } = useLanguage();
  const version = POLICY_VERSIONS[policyKey] || "1.0";
  const updated = POLICY_UPDATED[policyKey] || "";
  const isRTL = lang === "ar";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <section className="pt-40 pb-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[760px]"
        >
          {/* Version stamp */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
              {isRTL ? "قانوني" : "Legal"}
            </p>
            <span className="font-body text-xs text-muted-foreground/60">
              {isRTL ? "الإصدار" : "Version"} {version}
            </span>
            {updated && (
              <span className="font-body text-xs text-muted-foreground/60">
                · {isRTL ? "آخر تحديث" : "Updated"} {formatDate(updated)}
              </span>
            )}
          </div>

          {/* Draft banner */}
          <div className="mb-8 p-4 border border-accent/30 bg-accent/5 rounded-xl flex items-start gap-3">
            <AlertTriangle size={16} className="text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              {isRTL
                ? "هذه مسودة لمراجعة من قبل مستشار قانوني سعودي مؤهل — وهي ليست نهائية ولا تُعد نصيحة قانونية."
                : "Draft for review by qualified Saudi legal counsel — not final and not legal advice."}
            </p>
          </div>

          {children}

          {/* Sections */}
          <div className="space-y-14">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="hairline mb-8" />
                <h2 className="font-display text-display-sm font-light mb-4">{section.title}</h2>
                {section.text.split("\n\n").map((para, j) => (
                  <p key={j} className="font-body text-sm text-muted-foreground leading-relaxed mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
                {section.items && (
                  <ul className="space-y-2 mt-4">
                    {section.items.map((item, k) => (
                      <li key={k} className="font-body text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="text-accent flex-shrink-0 mt-0.5">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-16">
            <Link
              to="/"
              onClick={() => window.scrollTo(0, 0)}
              className="font-body text-xs tracking-label uppercase text-muted-foreground hover:text-accent transition-colors"
            >
              {isRTL ? "← العودة للرئيسية" : "← Back to Home"}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}