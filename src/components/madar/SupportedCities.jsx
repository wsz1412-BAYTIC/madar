import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn, AnimatedCounter } from '@/components/madar/Motion';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const cities = [
  { name: 'Riyadh', nameAr: 'الرياض', demand: 92, properties: '1,240', avgRate: 'SAR 380' },
  { name: 'Jeddah', nameAr: 'جدة', demand: 87, properties: '980', avgRate: 'SAR 320' },
  { name: 'Mecca', nameAr: 'مكة', demand: 95, properties: '1,560', avgRate: 'SAR 450' },
  { name: 'Medina', nameAr: 'المدينة', demand: 84, properties: '720', avgRate: 'SAR 290' },
  { name: 'Dammam', nameAr: 'الدمام', demand: 71, properties: '430', avgRate: 'SAR 240' },
  { name: 'Khobar', nameAr: 'الخبر', demand: 68, properties: '380', avgRate: 'SAR 260' },
];

export default function SupportedCities() {
  const { lang } = useLang();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8] overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C8972A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0B10] border border-white/[0.08] text-[#C8972A] text-xs font-medium mb-6">
            <MapPin className="w-3 h-3" />
            {lang === 'ar' ? 'المدن' : 'Coverage'}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0B10] leading-[1.15] max-w-3xl mx-auto mb-4">
            {lang === 'ar' ? (
              <>ندعم <span className="text-gradient-gold">كل المملكة</span></>
            ) : (
              <>Covering the <span className="text-gradient-gold">entire Kingdom</span></>
            )}
          </h2>
          <p className="text-[#0A0B10]/50 text-base max-w-xl mx-auto">
            {lang === 'ar'
              ? 'بيانات السوق من أكثر من 24 مدينة في المملكة العربية السعودية'
              : 'Market data from 24+ cities across Saudi Arabia'}
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cities.map((city, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl bg-[#0A0B10] border border-white/[0.06] hover:border-white/15 p-6 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#F7F5F0]">
                    {lang === 'ar' ? city.nameAr : city.name}
                  </h3>
                  <span className="text-xs text-[#F7F5F0]/30">
                    {city.properties} {lang === 'ar' ? 'عقار' : 'properties'}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg glass flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#C8972A]" />
                </div>
              </div>

              {/* Demand bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#F7F5F0]/40">{lang === 'ar' ? 'مؤشر الطلب' : 'Demand Index'}</span>
                  <span className="text-sm font-bold text-[#C8972A]">{city.demand}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${city.demand}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#D95F3B] to-[#C8972A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-[11px] text-[#F7F5F0]/40">{lang === 'ar' ? 'متوسط السعر' : 'Avg Rate'}</span>
                <span className="text-sm font-medium text-[#F7F5F0]/70">{city.avgRate}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}