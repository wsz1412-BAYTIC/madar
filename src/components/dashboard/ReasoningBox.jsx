import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function ReasoningBox({ brief }) {
  const { t, pickLangField } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const reasoning = pickLangField(brief, "reasoning") || brief?.reasoning || "";

  if (!reasoning) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          size={13}
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
        {expanded ? t("dashboard.hideWhy") : t("dashboard.why")}
      </button>
      {expanded && (
        <p className="mt-2 font-body text-xs text-muted-foreground leading-relaxed pl-5 border-s border-border/40">
          {reasoning}
        </p>
      )}
    </div>
  );
}