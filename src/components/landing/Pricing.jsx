import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";

export default function Pricing() {
  const { lang } = useLanguage();
  const t = landingT[lang];
  const currency = t["pricing.currency"];

  const tiers = [
    {
      name: t["pricing.free"] === "Free" ? "مجاني" : "مجاني",
      nameEn: "Free",
      price: 0,
      features: lang === "ar"
        ? ["3 أسئلة/يوم", "عقار واحد", "تقرير أسبوعي"]
        : ["3 questions/day", "1 property", "Weekly report"],
      popular: false,
    },
    {
      name: lang === "ar" ? "أساسي" : "Basic",
      nameEn: "Basic",
      price: 99,
      features: lang === "ar"
        ? ["تقرير يومي", "5 عقارات", "تاريخ 30 يوم", "Telegram"]
        : ["Daily report", "5 properties", "30-day history", "Telegram"],
      popular: false,
    },
    {
      name: lang === "ar" ? "نمو" : "Growth",
      nameEn: "Growth",
      price: 199,
      features: lang === "ar"
        ? ["3 مستخدمين", "15 عقار", "رادار المنافسين", "تنبيهات مخصصة"]
        : ["3 users", "15 properties", "Competitor radar", "Custom alerts"],
      popular: true,
    },
    {
      name: lang === "ar" ? "احترافي" : "Pro",
      nameEn: "Pro",
      price: 349,
      features: lang === "ar"
        ? ["مستخدمون غير محدودين", "عقارات غير محدودة", "API التسعير", "مساعد AI"]
        : ["Unlimited users", "Unlimited properties", "Pricing API", "AI assistant"],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="bg-[#080B14] py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-display text-3xl md:text-5xl font-light text-white">
            {t["pricing.title"]}
          </h2>
          <p className="mt-4 text-white/50 font-body text-base md:text-lg max-w-xl mx-auto">
            {t["pricing.subtitle"]}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-500 ${
                tier.popular
                  ? "bg-[#0E1422] border-2 border-[#FF6B4A]/40 shadow-2xl shadow-[#FF6B4A]/10 lg:scale-105"
                  : "bg-[#0E1422] border border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-body font-bold px-4 py-1.5 rounded-full bg-[#FF6B4A] text-white whitespace-nowrap">
                    {t["pricing.popular"]}
                  </span>
                </div>
              )}

              <h3 className="font-display text-2xl font-light text-white mb-1">
                {tier.name}
              </h3>
              <p className="text-xs text-white/35 font-body uppercase tracking-wider mb-6">
                {tier.nameEn}
              </p>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl md:text-5xl font-light text-white">
                    {tier.price}
                  </span>
                  <span className="text-sm text-white/50 font-body">
                    {currency}
                  </span>
                </div>
                {tier.price > 0 && (
                  <span className="text-xs text-white/35 font-body">
                    {t["pricing.month"]}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#FF6B4A] shrink-0 mt-0.5" />
                    <span className="text-sm text-white/65 font-body">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/login"
                className={`block text-center text-sm font-body font-medium px-6 py-3.5 rounded-full transition-all duration-300 ${
                  tier.popular
                    ? "bg-[#FF6B4A] text-white hover:bg-[#FF8264]"
                    : "border border-white/15 text-white hover:bg-white/10"
                }`}
              >
                {t["pricing.cta"]}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}