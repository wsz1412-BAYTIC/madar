import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn } from '@/components/madar/Motion';
import { motion } from 'framer-motion';
import { Link2, Brain, TrendingUp, Zap } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    titleEn: 'Connect Your Platforms',
    titleAr: 'اربط منصاتك',
    descEn: 'Link Airbnb, Gathern, or Booking.com in seconds. No manual data entry.',
    descAr: 'اربط Airbnb أو Gathern أو Booking.com في ثوانٍ. بدون إدخال بيانات يدوي.',
  },
  {
    icon: Brain,
    titleEn: 'AI Analyzes Your Data',
    titleAr: 'الذكاء الاصطناعي يحلل بياناتك',
    descEn: 'We compare your listings against 50+ market data sources in real time.',
    descAr: 'نقارن إعلاناتك مع أكثر من 50 مصدر بيانات سوقية في الوقت الفعلي.',
  },
  {
    icon: TrendingUp,
    titleEn: 'Get Smart Recommendations',
    titleAr: 'احصل على توصيات ذكية',
    descEn: 'Receive clear, actionable steps to increase revenue and occupancy.',
    descAr: 'استلم خطوات واضحة وقابلة للتنفيذ لزيادة الإيرادات والإشغال.',
  },
  {
    icon: Zap,
    titleEn: 'Apply & Watch Revenue Grow',
    titleAr: 'طبّق وشاهد الإيرادات تنمو',
    descEn: 'Apply recommendations with one click and track results over time.',
    descAr: 'طبّق التوصيات بنقرة واحدة وتابع النتائج عبر الزمن.',
  },
];

export default function HowItWorks() {
  const { lang, isRTL } = useLang();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#0A0B10] overflow-hidden border-t border-white/[0.04]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D95F3B]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#C8972A] text-xs font-medium mb-6">
            {lang === 'ar' ? 'كيف يعمل' : 'How It Works'}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F7F5F0] leading-[1.15] max-w-3xl mx-auto mb-4">
            {lang === 'ar' ? (
              <>أربعة خطوات بسيطة <span className="text-gradient-gold">نحو إيرادات أعلى</span></>
            ) : (
              <>Four simple steps to <span className="text-gradient-gold">higher revenue</span></>
            )}
          </h2>
          <p className="text-[#F7F5F0]/40 text-base max-w-xl mx-auto">
            {lang === 'ar'
              ? 'من الربط إلى النتائج في دقائق'
              : 'From connection to results in minutes'}
          </p>
        </FadeIn>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[44px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative text-center"
              >
                {/* Icon */}
                <div className="relative mx-auto w-[88px] h-[88px] mb-6">
                  <div className="absolute inset-0 rounded-full glass-strong border border-white/[0.08] flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-[#C8972A]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#D95F3B] to-[#C8972A] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>

                <h3 className="font-heading text-lg font-bold text-[#F7F5F0] mb-2 leading-snug">
                  {lang === 'ar' ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-sm text-[#F7F5F0]/40 leading-relaxed">
                  {lang === 'ar' ? step.descAr : step.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}