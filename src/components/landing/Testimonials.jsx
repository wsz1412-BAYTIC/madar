import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";

const TESTIMONIALS = [
  { key: "t1" },
  { key: "t2" },
  { key: "t3" },
];

export default function Testimonials() {
  const { lang } = useLanguage();
  const t = landingT[lang];

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
            {t["testimonials.title"]}
          </h2>
          <p className="mt-4 text-white/50 font-body text-base md:text-lg">
            {t["testimonials.subtitle"]}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((tm, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative bg-[#0E1422] border border-white/[0.06] rounded-2xl p-8 flex flex-col"
            >
              <Quote
                size={40}
                className="text-[#FF6B4A] mb-5"
                fill="currentColor"
                strokeWidth={0}
              />

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    size={16}
                    className="text-[#FF6B4A]"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ))}
              </div>

              <p className="text-base text-white/75 font-body leading-relaxed flex-1">
                {t[`testimonials.${tm.key}.quote`]}
              </p>

              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <div className="font-display text-lg font-light text-white">
                  {t[`testimonials.${tm.key}.name`]}
                </div>
                <div className="text-sm text-[#FF6B4A] font-body mt-0.5">
                  {t[`testimonials.${tm.key}.city`]}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}