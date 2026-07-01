import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn } from '@/components/madar/Motion';
import PlatformMetrics from '@/components/madar/PlatformMetrics';

export default function MarketMetrics() {
  const { lang } = useLang();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0A0B10] overflow-hidden border-t border-white/[0.04]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C8972A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#C8972A] text-xs font-medium mb-6">
            {lang === 'ar' ? 'بيانات السوق' : 'Market Data'}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F7F5F0] leading-[1.15] max-w-3xl mx-auto mb-4">
            {lang === 'ar' ? (
              <>أرقام حقيقية <span className="text-gradient-gold">تُحدث الفرق</span></>
            ) : (
              <>Real numbers that <span className="text-gradient-gold">make a difference</span></>
            )}
          </h2>
          <p className="text-[#F7F5F0]/40 text-sm sm:text-base max-w-xl mx-auto">
            {lang === 'ar'
              ? 'بيانات محدثة من السوق السعودي لاتخاذ قرارات مبنية على الأرقام'
              : 'Up-to-date data from the Saudi market for data-driven decisions'}
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PlatformMetrics />
        </FadeIn>
      </div>
    </section>
  );
}