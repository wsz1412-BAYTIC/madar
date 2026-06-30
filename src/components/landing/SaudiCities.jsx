import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";

const CITIES = [
  {
    key: "jeddah",
    nameAr: "جدة",
    nameEn: "Jeddah",
    image: "https://media.base44.com/images/public/6a440c5bd1288d40c2b699ce/21d75628b_IMG_7742.jpeg",
  },
  {
    key: "riyadh",
    nameAr: "الرياض",
    nameEn: "Riyadh",
    image: "https://media.base44.com/images/public/6a440c5bd1288d40c2b699ce/1aaba2894_IMG_7743.jpeg",
  },
  {
    key: "mecca",
    nameAr: "مكة المكرمة",
    nameEn: "Mecca",
    image: "https://media.base44.com/images/public/6a440c5bd1288d40c2b699ce/0a86ff558_IMG_7744.jpeg",
  },
  {
    key: "medina",
    nameAr: "المدينة المنورة",
    nameEn: "Medina",
    image: "https://media.base44.com/images/public/6a440c5bd1288d40c2b699ce/3a69a7e3d_IMG_7745.jpeg",
  },
];

export default function SaudiCities() {
  const { lang } = useLanguage();
  const t = landingT[lang];

  return (
    <section id="cities-anchor" className="bg-[#EEEAE1] py-28 md:py-36">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 md:mb-24"
        >
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#1C1C20]">
            {t["cities.title"]}
          </h2>
          <p className="mt-4 text-[#1C1C20]/50 font-body text-base md:text-lg">
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
              className="group relative h-[400px] rounded-2xl overflow-hidden shadow-sm"
            >
              <img
                src={city.image}
                alt={lang === "ar" ? city.nameAr : city.nameEn}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C20] via-[#1C1C20]/40 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-[#FF6B4A]" />
                  <h3 className="font-display text-xl md:text-2xl font-light text-white">
                    {lang === "ar" ? city.nameAr : city.nameEn}
                  </h3>
                </div>
                <p className="text-sm text-white/70 font-body leading-relaxed">
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