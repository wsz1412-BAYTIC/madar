import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";

const CITIES = [
  {
    key: "jeddah",
    nameAr: "جدة",
    nameEn: "Jeddah",
    image: "https://images.unsplash.com/photo-1564506249664-6eb7d28c3c81?w=800&h=1000&fit=crop&auto=format",
  },
  {
    key: "riyadh",
    nameAr: "الرياض",
    nameEn: "Riyadh",
    image: "https://images.unsplash.com/photo-1586724237569-f3d0c34bb83e?w=800&h=1000&fit=crop&auto=format",
  },
  {
    key: "mecca",
    nameAr: "مكة المكرمة",
    nameEn: "Mecca",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d97f7d?w=800&h=1000&fit=crop&auto=format",
  },
  {
    key: "medina",
    nameAr: "المدينة المنورة",
    nameEn: "Medina",
    image: "https://images.unsplash.com/photo-1591456983933-0c7723e93ddd?w=800&h=1000&fit=crop&auto=format",
  },
];

export default function SaudiCities() {
  const { lang } = useLanguage();
  const t = landingT[lang];

  return (
    <section id="cities-anchor" className="bg-[#0A0E1A] py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-display text-3xl md:text-5xl font-light text-white">
            {t["cities.title"]}
          </h2>
          <p className="mt-4 text-white/50 font-body text-base md:text-lg">
            {t["cities.subtitle"]}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CITIES.map((city, i) => (
            <motion.div
              key={city.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative h-[380px] rounded-2xl overflow-hidden"
            >
              <img
                src={city.image}
                alt={lang === "ar" ? city.nameAr : city.nameEn}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-[#080B14]/40 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-[#FF6B4A]" />
                  <h3 className="font-display text-xl md:text-2xl font-light text-white">
                    {lang === "ar" ? city.nameAr : city.nameEn}
                  </h3>
                </div>
                <p className="text-sm text-white/65 font-body leading-relaxed">
                  {t[`cities.${city.key}`]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}