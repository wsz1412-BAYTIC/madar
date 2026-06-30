import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";

const FEATURES = [
  { emoji: "🧭", titleKey: "features.f1.title", descKey: "features.f1.desc" },
  { emoji: "📊", titleKey: "features.f2.title", descKey: "features.f2.desc" },
  { emoji: "🏙️", titleKey: "features.f3.title", descKey: "features.f3.desc" },
  { emoji: "📱", titleKey: "features.f4.title", descKey: "features.f4.desc" },
  { emoji: "🔗", titleKey: "features.f5.title", descKey: "features.f5.desc" },
  { emoji: "🤖", titleKey: "features.f6.title", descKey: "features.f6.desc", badge: true },
];

export default function Features() {
  const { lang } = useLanguage();
  const t = landingT[lang];

  return (
    <section id="features" className="bg-[#0A0E1A] py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-display text-3xl md:text-5xl font-light text-white">
            {t["features.title"]}
          </h2>
          <p className="mt-4 text-white/50 font-body text-base md:text-lg max-w-xl mx-auto">
            {t["features.subtitle"]}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group relative bg-[#0E1422] border border-white/[0.06] rounded-2xl p-8 hover:border-[#FF6B4A]/30 transition-all duration-500"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-[#FF6B4A]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[#FF6B4A]/10 flex items-center justify-center text-2xl mb-5">
                  {feature.emoji}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-xl font-light text-white">
                    {t[feature.titleKey]}
                  </h3>
                  {feature.badge && (
                    <span className="text-[10px] font-body font-bold px-2 py-0.5 rounded-full bg-[#FF6B4A] text-white">
                      {t["features.f6.badge"]}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/55 font-body leading-relaxed">
                  {t[feature.descKey]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}