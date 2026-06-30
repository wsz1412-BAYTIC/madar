import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

const neighborhoods = [
  {
    name: "Riyadh",
    nameAr: "الرياض",
    tagline: "Capital city, premium demand",
    taglineAr: "العاصمة، طلب عالي",
    image: "https://images.unsplash.com/photo-1586724237569-f3d0c34bb83e?w=800&h=1000&fit=crop",
  },
  {
    name: "Jeddah",
    nameAr: "جدة",
    tagline: "Waterfront gems on the Red Sea",
    taglineAr: "لآلئ البحر الأحمر",
    image: "https://images.unsplash.com/photo-1564506249664-6eb7d28c3c81?w=800&h=1000&fit=crop",
  },
  {
    name: "Dammam",
    nameAr: "الدمام",
    tagline: "Eastern Province hub",
    taglineAr: "مركز المنطقة الشرقية",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=1000&fit=crop",
  },
];

export default function NeighborhoodExpertise() {
  const { t, lang } = useLanguage();

  return (
    <section className="py-24 md:py-40 bg-secondary/30">
      <div className="px-[2%] max-w-[1400px] mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="font-display text-display-lg font-light mt-3">
            {t("dashboard.neighborhoods")}
          </h2>
          <p className="font-body text-muted-foreground text-base mt-4 max-w-lg mx-auto leading-relaxed">
            {t("dashboard.neighborhoodsDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {neighborhoods.map((n, i) => (
            <motion.div
              key={n.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link
                to={`/market?city=${encodeURIComponent(n.name)}`}
                className="group block"
              >
                <div className="relative h-[450px] md:aspect-auto md:min-h-[480px] overflow-hidden">
                  <img
                    src={n.image}
                    alt={lang === "ar" ? n.nameAr : n.name}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-foreground to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h3 className="font-display text-2xl md:text-3xl text-white font-light">
                      {lang === "ar" ? n.nameAr : n.name}
                    </h3>
                    <p className="font-body text-sm text-white/70 mt-1">
                      {lang === "ar" ? n.taglineAr : n.tagline}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}