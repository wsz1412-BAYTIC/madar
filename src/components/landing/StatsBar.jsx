import { motion } from "framer-motion";
import { TrendingUp, Layers, MapPin, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";

export default function StatsBar() {
  const { lang } = useLanguage();
  const t = landingT[lang];

  const stats = [
    { icon: TrendingUp, value: "+20%", label: t["stats.revenue"] },
    { icon: Layers, value: "3", label: t["stats.platforms"] },
    { icon: MapPin, value: "4", label: t["stats.cities"], sub: t["stats.citiesList"] },
    { icon: RefreshCw, value: null, label: t["stats.update"] },
  ];

  return (
    <section id="cities" className="bg-[#0A0E1A] border-y border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%] py-16 md:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#FF6B4A]" />
                </div>
                {stat.value !== null && (
                  <div className="font-display text-3xl md:text-4xl font-light text-white">
                    {stat.value}
                  </div>
                )}
                <div className="mt-1 text-sm text-white/60 font-body">
                  {stat.label}
                </div>
                {stat.sub && (
                  <div className="mt-1 text-xs text-white/35 font-body">
                    {stat.sub}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}