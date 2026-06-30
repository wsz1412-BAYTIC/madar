import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT, HERO_IMAGE_URL } from "@/lib/landing-i18n";

const PLATFORMS = [
  { name: "Airbnb", color: "#FF5A5F" },
  { name: "Gatherin", color: "#00C39A" },
  { name: "Booking.com", color: "#5BA7F5" },
];

export default function Hero() {
  const { lang } = useLanguage();
  const t = landingT[lang];
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const gradientDir = lang === "ar" ? "bg-gradient-to-l" : "bg-gradient-to-r";

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE_URL}
          alt="Saudi Arabia cityscape"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay — dark on text side */}
        <div className={`absolute inset-0 ${gradientDir} from-[#080B14] via-[#080B14]/85 to-[#080B14]/30`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-transparent to-[#080B14]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-[5%] md:px-[4%] pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] text-white">
            {t["hero.title"]}
          </h1>

          <p className="mt-6 text-base md:text-lg text-white/65 max-w-xl leading-relaxed font-body">
            {t["hero.subtitle"]}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF6B4A] text-white font-body font-medium text-sm md:text-base hover:bg-[#FF8264] transition-all duration-300 shadow-xl shadow-[#FF6B4A]/30"
            >
              {t["hero.ctaPrimary"]}
              <Arrow size={18} />
            </Link>
            <button
              onClick={scrollToFeatures}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/25 text-white font-body font-medium text-sm md:text-base hover:bg-white/10 transition-all duration-300"
            >
              {t["hero.ctaSecondary"]}
            </button>
          </div>

          {/* Trust line */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="text-xs text-white/40 uppercase tracking-wider font-body">
              {t["hero.trust"]}
            </span>
            {PLATFORMS.map((p) => (
              <span
                key={p.name}
                className="text-sm font-body font-semibold"
                style={{ color: p.color }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
}