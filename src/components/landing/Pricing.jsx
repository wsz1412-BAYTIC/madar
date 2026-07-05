import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { landingT } from "@/lib/landing-i18n";

export default function Pricing() {
  const { lang } = useLanguage();
  const t = landingT[lang];
  const currency = t["pricing.currency"];
  const { isAuthenticated, authChecked } = useAuth();

  const showGuest = authChecked && !isAuthenticated;
  const showUser = authChecked && isAuthenticated;

  const tiers = [
    {
      name: lang === "ar" ? "مجاني" : "Free",
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
    <section id="pricing" className="bg-[#EEEAE1] py-28 md:py-36">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 md:mb-24"
        >
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#1C1C20]">
            {t["pricing.title"]}
          </h2>
          <p className="mt-4 text-[#1C1C20]/50 font-body text-base md:text-lg max-w-xl mx-auto">
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
                  ? "bg-white border-2 border-[#FF6B4A]/40 shadow-2xl shadow-[#FF6B4A]/10 lg:scale-105"
                  : "bg-white border border-[#1C1C20]/8 hover:border-[#1C1C20]/15"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-body font-bold px-4 py-1.5 rounded-full bg-[#FF6B4A] text-white whitespace-nowrap shadow-lg shadow-[#FF6B4A]/30">
                    {t["pricing.popular"]}
                  </span>
                </div>
              )}

              <h3 className="font-display text-2xl font-light text-[#1C1C20] mb-1">
                {tier.name}
              </h3>
              <p className="text-xs text-[#1C1C20]/35 font-body uppercase tracking-wider mb-6">
                {tier.nameEn}
              </p>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl md:text-5xl font-light text-[#1C1C20]">
                    {tier.price}
                  </span>
                  <span className="text-sm text-[#1C1C20]/50 font-body">
                    {currency}
                  </span>
                </div>
                {tier.price > 0 && (
                  <span className="text-xs text-[#1C1C20]/35 font-body">
                    {t["pricing.month"]}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#FF6B4A] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#1C1C20]/65 font-body">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Three-state CTA */}
              {!authChecked ? (
                <div className="h-12 rounded-full bg-[#1C1C20]/5 animate-pulse" />
              ) : showUser ? (
                <Link
                  to="/billing"
                  className={`block text-center text-sm font-body font-medium px-6 py-3.5 rounded-full transition-all duration-300 ${
                    tier.popular
                      ? "bg-[#FF6B4A] text-white hover:bg-[#FF7D5C]"
                      : "border border-[#1C1C20]/15 text-[#1C1C20] hover:bg-[#1C1C20]/5"
                  }`}
                >
                  {t["pricing.managePlan"]}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={`block text-center text-sm font-body font-medium px-6 py-3.5 rounded-full transition-all duration-300 ${
                    tier.popular
                      ? "bg-[#FF6B4A] text-white hover:bg-[#FF7D5C]"
                      : "border border-[#1C1C20]/15 text-[#1C1C20] hover:bg-[#1C1C20]/5"
                  }`}
                >
                  {t["pricing.cta"]}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}