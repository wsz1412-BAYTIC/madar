import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

function SearchDropdown({ label, options, value, onChange, dark = true }) {
  const [open, setOpen] = useState(false);
  const textColor = dark ? "text-white/90 hover:text-white" : "text-foreground/90 hover:text-foreground";
  const borderColor = dark ? "border-white/30" : "border-border";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 transition-colors border-b ${borderColor} pb-1 ${textColor}`}
      >
        <span className="font-display text-lg md:text-xl italic">{value || label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white backdrop-blur-xl border border-white/20 shadow-lg min-w-[200px] z-10 rounded">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-3 font-body text-sm text-foreground hover:bg-accent/10 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroSection({ heroImage }) {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroImage} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

      <div className="relative z-10 h-full flex flex-col justify-center md:justify-start md:pt-[30vh] px-[4%] md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={20} className="text-[#facca3]" strokeWidth={1} />
            <span className="font-body text-xs tracking-label uppercase text-white/70">
              {t("brand.tagline")}
            </span>
          </div>

          <h1 className="font-display text-display-xl text-white font-light mb-8 max-w-4xl leading-[0.9]">
            {t("hero.title1")}
            <br />
            <span className="italic">
              {t("hero.title2")}
            </span>
          </h1>

          <p className="font-body text-sm text-white/60 leading-relaxed max-w-md mb-8">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2 text-white font-body text-sm bg-black/20 backdrop-blur-md px-6 py-4 md:py-3 rounded-2xl md:rounded-full w-full md:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("hero.searchPlaceholder")}
                className="bg-transparent text-white placeholder:text-white/40 focus:outline-none font-body text-sm flex-1 min-w-[200px]"
              />
            </div>

            <button onClick={handleSearch} className="ghost-btn-light">
              {t("hero.cta")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}