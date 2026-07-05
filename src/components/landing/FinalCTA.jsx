import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { landingT } from "@/lib/landing-i18n";

export default function FinalCTA() {
  const { lang } = useLanguage();
  const t = landingT[lang];
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const { isAuthenticated, authChecked } = useAuth();

  const showGuest = authChecked && !isAuthenticated;
  const showUser = authChecked && isAuthenticated;

  return (
    <section className="relative overflow-hidden">
      {/* Coral gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B4A] via-[#FF7A3D] to-[#E8542E]" />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-[5%] md:px-[4%] py-24 md:py-32 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight"
        >
          {t["finalCta.title"]}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-base md:text-lg text-white/80 font-body"
        >
          {t["finalCta.subtitle"]}
        </motion.p>

        {/* Three-state CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 min-h-[56px] flex items-center justify-center"
        >
          {!authChecked ? (
            <div className="w-48 h-14 rounded-full bg-white/20 animate-pulse" />
          ) : showUser ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-[#FF6B4A] font-body font-bold text-sm md:text-base hover:bg-white/90 transition-all duration-300 shadow-2xl shadow-black/20"
            >
              {lang === "ar" ? "لوحة التحكم" : "Go to Dashboard"}
              <Arrow size={20} />
            </Link>
          ) : showGuest ? (
            <Link
              to="/login?mode=signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-[#FF6B4A] font-body font-bold text-sm md:text-base hover:bg-white/90 transition-all duration-300 shadow-2xl shadow-black/20"
            >
              {t["finalCta.button"]}
              <Arrow size={20} />
            </Link>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}