import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT, HERO_IMAGE_URL } from "@/lib/landing-i18n";

const PARTNERS = ["Airbnb", "Booking.com", "Gatherin"];

export default function Hero() {
  const { lang } = useLanguage();
  const t = landingT[lang];
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE_URL}
          alt="Jeddah corniche at night"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/70 via-[#0a1628]/50 to-[#0a1628]/85" />
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
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
        </motion.div>

        {/* Partners */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <span className="text-xs text-white/50 uppercase tracking-wider font-body">
            {t["hero.partners"]}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10">
            {PARTNERS.map((name) => (
              <span
                key={name}
                className="text-base md:text-lg font-body font-semibold text-white/80"
              >
                {name}
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