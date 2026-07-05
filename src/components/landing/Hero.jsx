import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { landingT, HERO_IMAGE_URL } from "@/lib/landing-i18n";

const TRUST_STATS = ["hero.trustPlatforms", "hero.trustCities", "hero.trustMinutes"];

export default function Hero() {
  const { lang } = useLanguage();
  const t = landingT[lang];
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const { isAuthenticated, authChecked, user } = useAuth();

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const showGuest = authChecked && !isAuthenticated;
  const showUser = authChecked && isAuthenticated;
  const firstName = user?.full_name?.split(" ")[0] || "";

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image — Riyadh skyline */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE_URL}
          alt="Riyadh skyline at night"
          className="w-full h-full object-cover"
        />
        {/* Cinematic layered overlay — tuned for dark/light */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 via-[#0a1628]/55 to-[#0a1628]/90 dark:from-black/85 dark:via-black/60 dark:to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/60 via-transparent to-transparent" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 w-full px-[5%] md:px-[4%] pt-20 pb-16 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.15] text-white max-w-4xl"
        >
          {t["hero.title"]}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="mt-5 text-base md:text-xl text-[#FFE8E0]/90 max-w-2xl leading-relaxed font-body"
        >
          {t["hero.subtitle"]}
        </motion.p>

        {/* Auth-aware CTA block — three-state */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 min-h-[60px]"
        >
          {/* While checking: neutral placeholder (no CTAs) */}
          {!authChecked && (
            <div className="w-64 h-14 rounded-full bg-white/10 animate-pulse" />
          )}

          {/* Guest: Start Free + Discover More */}
          {showGuest && (
            <>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center px-8 py-4 rounded-full border border-white/30 text-white font-body font-medium text-sm md:text-base hover:bg-white/10 transition-all duration-300"
              >
                {t["hero.ctaSecondary"]}
              </button>
              <Link
                to="/login?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#F76C54] text-white font-body font-medium text-sm md:text-base hover:bg-[#FF8264] transition-all duration-300 shadow-xl shadow-[#F76C54]/30"
              >
                {t["hero.ctaPrimary"]}
                <Arrow size={18} />
              </Link>
            </>
          )}

          {/* Signed-in: Welcome back + Dashboard / My properties */}
          {showUser && (
            <>
              <Link
                to="/properties"
                className="inline-flex items-center px-8 py-4 rounded-full border border-white/30 text-white font-body font-medium text-sm md:text-base hover:bg-white/10 transition-all duration-300"
              >
                {t["hero.myProperties"]}
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#F76C54] text-white font-body font-medium text-sm md:text-base hover:bg-[#FF8264] transition-all duration-300 shadow-xl shadow-[#F76C54]/30"
              >
                {lang === "ar"
                  ? t["hero.welcomeBack"].replace("{name}", firstName)
                  : t["hero.welcomeBack"].replace("{name}", firstName)}
                <Arrow size={18} />
              </Link>
            </>
          )}
        </motion.div>

        {/* Trust strip — stars + neutral coverage stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: authChecked ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={14} className="text-[#FFB84D] fill-[#FFB84D]" />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-white/60 font-body text-xs md:text-sm">
            {TRUST_STATS.map((key, i) => (
              <span key={key} className="flex items-center gap-3 md:gap-6">
                <span>{t[key]}</span>
                {i < TRUST_STATS.length - 1 && <span className="text-white/20">·</span>}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom separator with diamond */}
      <div className="absolute bottom-0 inset-x-0 z-10 flex items-center px-[5%] md:px-[4%] pb-5">
        <div className="flex-1 h-px bg-white/15" />
        <div className="mx-3 w-2 h-2 rotate-45 bg-white/30" />
      </div>
    </section>
  );
}