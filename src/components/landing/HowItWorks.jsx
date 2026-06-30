import { motion } from "framer-motion";
import { Link2, Radar, Bell } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";

export default function HowItWorks() {
  const { lang } = useLanguage();
  const t = landingT[lang];

  const steps = [
    { num: "01", icon: Link2, title: t["how.step1.title"], desc: t["how.step1.desc"] },
    { num: "02", icon: Radar, title: t["how.step2.title"], desc: t["how.step2.desc"] },
    { num: "03", icon: Bell, title: t["how.step3.title"], desc: t["how.step3.desc"] },
  ];

  return (
    <section className="bg-[#080B14] py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-display text-3xl md:text-5xl font-light text-white">
            {t["how.title"]}
          </h2>
          <p className="mt-4 text-white/50 font-body text-base md:text-lg">
            {t["how.subtitle"]}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[55%] right-[-55%] h-px bg-gradient-to-r from-[#FF6B4A]/30 to-transparent" />
                )}

                <div className="relative flex flex-col items-center text-center md:items-start md:text-start">
                  <div className="relative w-20 h-20 rounded-full bg-[#0E1422] border border-white/[0.08] flex items-center justify-center mb-6">
                    <Icon size={28} className="text-[#FF6B4A]" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#FF6B4A] text-white text-xs font-bold flex items-center justify-center font-body">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-light text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-white/55 font-body leading-relaxed max-w-xs">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}