import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowDown, TrendingDown, EyeOff, BarChart3, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const problems = [
  {
    icon: TrendingDown,
    en: 'Your price is below market value',
    ar: 'سعرك أقل من قيمة السوق',
    enDesc: 'You could be leaving money on the table every single night.',
    arDesc: 'قد تفقد إيرادات كل ليلة دون أن تدرك ذلك.',
  },
  {
    icon: EyeOff,
    en: 'Your property is not visible enough',
    ar: 'عقارك لا يحظى بظهور كافٍ',
    enDesc: 'Low ranking means fewer clicks and fewer bookings.',
    arDesc: 'ترتيب منخفض يعني نقرات أقل وحجوزات أقل.',
  },
  {
    icon: BarChart3,
    en: 'Competitors are achieving higher occupancy',
    ar: 'المنافسون يحققون إشغالاً أعلى',
    enDesc: 'Similar properties nearby are booked more often than yours.',
    arDesc: 'عقارات مشابهة قريبة تُحجز أكثر من عقارك.',
  },
];

export default function ProblemSolution() {
  const { lang, isRTL } = useLang();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8] overflow-hidden">
      {/* Ambient accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D95F3B]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C8972A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Main question */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0A0B10] mb-8"
          >
            <ArrowDown className="w-5 h-5 text-[#D95F3B]" />
          </motion.div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0B10] leading-[1.15] max-w-3xl mx-auto">
            {lang === 'ar' ? (
              <>هل يصل عقارك إلى <span className="text-gradient-gold">أقصى إيراد ممكن؟</span></>
            ) : (
              <>Is Your Property Reaching Its <span className="text-gradient-gold">Full Revenue Potential?</span></>
            )}
          </h2>
        </motion.div>

        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Problems side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0A0B10]/30">
                {lang === 'ar' ? 'المشاكل الشائعة' : 'Common Problems'}
              </span>
              <div className="flex-1 h-px bg-[#0A0B10]/10" />
            </div>

            {problems.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-white/60 border border-[#0A0B10]/[0.06] hover:border-[#D95F3B]/30 hover:bg-white transition-all duration-500"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-[#0A0B10]/[0.04] border border-[#0A0B10]/[0.06] flex items-center justify-center group-hover:bg-[#D95F3B]/10 group-hover:border-[#D95F3B]/20 transition-all duration-500">
                    <p.icon className="w-5 h-5 text-[#0A0B10]/40 group-hover:text-[#D95F3B] transition-colors duration-500" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0A0B10] text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="font-semibold text-[#0A0B10] text-base leading-snug mb-1">
                    {lang === 'ar' ? p.ar : p.en}
                  </h3>
                  <p className="text-sm text-[#0A0B10]/45 leading-relaxed">
                    {lang === 'ar' ? p.arDesc : p.enDesc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Solution side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative h-full rounded-3xl bg-[#0A0B10] border border-white/[0.08] overflow-hidden p-8 lg:p-10 flex flex-col">
              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#D95F3B]/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#C8972A]/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex items-center gap-2 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#F7F5F0]/30">
                  {lang === 'ar' ? 'حل مدار' : 'The Madar Solution'}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#C8972A] text-xs font-medium mb-6 self-start"
                >
                  <Sparkles className="w-3 h-3" />
                  {lang === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
                </motion.div>

                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#F7F5F0] leading-[1.3] mb-4">
                  {lang === 'ar' ? (
                    <>يحدد مدار الفرص المفقودة ويعطيك <span className="text-gradient-gold">الإجراء المطلوب</span> بدقة.</>
                  ) : (
                    <>Madar identifies missed opportunities and gives you the <span className="text-gradient-gold">exact action</span> to take.</>
                  )}
                </h3>

                <p className="text-[#F7F5F0]/50 text-sm leading-relaxed mb-8">
                  {lang === 'ar'
                    ? 'نحلل بياناتك ونقارنها بالسوق في الوقت الفعلي، ثم نخبرك بالخطوة التالية التي تزيد إيراداتك.'
                    : 'We analyze your data against the market in real time, then tell you the exact next step to grow your revenue.'}
                </p>

                {/* Highlight stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { value: '23%', label: lang === 'ar' ? 'زيادة الإيراد' : 'Revenue Lift' },
                    { value: '50+', label: lang === 'ar' ? 'مصدر بيانات' : 'Data Sources' },
                    { value: '24/7', label: lang === 'ar' ? 'مراقبة' : 'Monitoring' },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="text-center glass rounded-xl py-3 border border-white/[0.06]"
                    >
                      <div className="text-xl font-bold font-heading text-gradient-gold">{s.value}</div>
                      <div className="text-[9px] text-[#F7F5F0]/30 uppercase tracking-wide mt-1">{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.a
                href="/signup"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative z-10 group flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium rounded-xl overflow-hidden glow-coral"
              >
                <span className="relative z-10">{lang === 'ar' ? 'اكتشف الفرص المفقودة' : 'Find Your Missed Revenue'}</span>
                <Arrow className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}