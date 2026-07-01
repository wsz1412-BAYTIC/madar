import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Crosshair, Search, CalendarClock, Zap } from 'lucide-react';

const features = [
  {
    icon: Crosshair,
    titleEn: 'Know Your Market Position',
    titleAr: 'اعرف موقعك في السوق',
    descEn: 'Compare your property with city averages and direct competitors.',
    descAr: 'قارن عقارك بمتوسط المدينة والمنافسين المباشرين.',
    accent: '#D95F3B',
    num: '01',
  },
  {
    icon: Search,
    titleEn: 'Discover Lost Revenue',
    titleAr: 'اكتشف الإيرادات المفقودة',
    descEn: 'Identify pricing and booking opportunities you may be missing.',
    descAr: 'حدد فرص التسعير والحجوزات التي قد تفوتك.',
    accent: '#C8972A',
    num: '02',
  },
  {
    icon: CalendarClock,
    titleEn: 'Price Every Day Smarter',
    titleAr: 'سعّر كل يوم بذكاء',
    descEn: 'Receive daily recommendations based on demand, seasonality, and competition.',
    descAr: 'استلم توصيات يومية بناءً على الطلب والموسمية والمنافسة.',
    accent: '#D95F3B',
    num: '03',
  },
  {
    icon: Zap,
    titleEn: 'Make Decisions Faster',
    titleAr: 'اتخذ القرارات أسرع',
    descEn: 'Get direct actions instead of long and complicated reports.',
    descAr: 'احصل على إجراءات مباشرة بدلاً من تقارير طويلة ومعقدة.',
    accent: '#C8972A',
    num: '04',
  },
];

export default function PremiumFeatures() {
  const { lang } = useLang();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#0A0B10] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#D95F3B]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#C8972A] text-xs font-medium mb-6">
            {lang === 'ar' ? 'ميزات مدار' : 'Madar Features'}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F7F5F0] leading-[1.15] max-w-3xl mx-auto">
            {lang === 'ar' ? (
              <>كل ما تحتاجه <span className="text-gradient-gold">للتفوق على السوق</span></>
            ) : (
              <>Everything you need to <span className="text-gradient-gold">outperform the market</span></>
            )}
          </h2>
        </motion.div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl glass-strong border border-white/[0.06] hover:border-white/15 p-7 overflow-hidden transition-all duration-500"
            >
              {/* Hover glow */}
              <div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{ background: f.accent }}
              />

              {/* Number */}
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div
                  className="w-12 h-12 rounded-2xl glass flex items-center justify-center border border-white/[0.08] group-hover:scale-110 transition-transform duration-500"
                >
                  <f.icon className="w-5 h-5" style={{ color: f.accent }} />
                </div>
                <span className="font-heading text-3xl font-bold text-white/[0.04] group-hover:text-white/[0.08] transition-colors duration-500">
                  {f.num}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-heading text-lg font-bold text-[#F7F5F0] leading-snug mb-3">
                  {lang === 'ar' ? f.titleAr : f.titleEn}
                </h3>
                <p className="text-sm text-[#F7F5F0]/45 leading-relaxed">
                  {lang === 'ar' ? f.descAr : f.descEn}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-700"
                style={{ background: f.accent }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}