import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Target, TrendingDown, CalendarDays, Gauge } from 'lucide-react';

const features = [
  {
    icon: Target,
    titleEn: 'Know Your Market Position',
    titleAr: 'اعرف موقعك في السوق',
    descEn: 'Compare with city averages and direct competitors.',
    descAr: 'قارن بمتوسط المدينة والمنافسين المباشرين.',
  },
  {
    icon: TrendingDown,
    titleEn: 'Discover Lost Revenue',
    titleAr: 'اكتشف الإيرادات المفقودة',
    descEn: 'Spot pricing and booking opportunities you miss.',
    descAr: 'حدد فرص التسعير والحجوزات التي تفوتك.',
  },
  {
    icon: CalendarDays,
    titleEn: 'Price Every Day Smarter',
    titleAr: 'سعّر كل يوم بذكاء',
    descEn: 'Daily tips based on demand, season, and competition.',
    descAr: 'توصيات يومية بناءً على الطلب والموسمية والمنافسة.',
  },
  {
    icon: Gauge,
    titleEn: 'Make Decisions Faster',
    titleAr: 'اتخذ القرارات أسرع',
    descEn: 'Direct actions instead of long complicated reports.',
    descAr: 'إجراءات مباشرة بدلاً من تقارير طويلة ومعقدة.',
  },
];

export default function PremiumFeatures() {
  const { lang } = useLang();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#06131F] overflow-hidden">
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#0F6BA8] text-xs font-medium mb-6">
            {lang === 'ar' ? 'ميزات مدار' : 'Madar Features'}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2F8FC] leading-[1.15] max-w-3xl mx-auto">
            {lang === 'ar' ? (
              <>كل ما تحتاجه <span className="text-gradient-gold">للتفوق على السوق</span></>
            ) : (
              <>Everything you need to <span className="text-gradient-gold">outperform the market</span></>
            )}
          </h2>
        </motion.div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl border border-white/[0.06] hover:border-white/15 bg-white/[0.02] p-8 transition-colors duration-500"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl border border-white/[0.08] flex items-center justify-center mb-5 group-hover:border-[#ADDFF1]/30 transition-colors duration-500">
                <f.icon className="w-[18px] h-[18px] text-[#F2F8FC]/50 group-hover:text-[#0F6BA8] transition-colors duration-500" />
              </div>

              {/* Content */}
              <h3 className="font-heading text-base font-bold text-[#F2F8FC] leading-snug mb-2">
                {lang === 'ar' ? f.titleAr : f.titleEn}
              </h3>
              <p className="text-sm text-[#F2F8FC]/40 leading-relaxed">
                {lang === 'ar' ? f.descAr : f.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}