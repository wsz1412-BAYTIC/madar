import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn, AnimatedCounter } from '@/components/madar/Motion';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Khalid Al-Rashid',
    nameAr: 'خالد الراشد',
    role: 'Host, Riyadh',
    roleAr: 'مضيف، الرياض',
    text: 'Madar increased my revenue by 28% in three months. The AI pricing recommendations are spot on.',
    textAr: 'زاد مدار إيراداتي بنسبة 28% خلال ثلاثة أشهر. توصيات التسعير الذكية دقيقة جداً.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  },
  {
    name: 'Noura Al-Otaibi',
    nameAr: 'نورة العتيبي',
    role: 'Property Manager, Jeddah',
    roleAr: 'مديرة عقارات، جدة',
    text: 'Managing 12 listings used to take hours. Now I check Madar for 5 minutes and I know exactly what to do.',
    textAr: 'إدارة 12 إعلاناً كانت تستغرق ساعات. الآن أتحقق من مدار لمدة 5 دقائق وأعرف بالضبط ماذا أفعل.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  },
  {
    name: 'Abdulaziz Al-Qahtani',
    nameAr: 'عبدالعزيز القحطاني',
    role: 'Investor, Dammam',
    roleAr: 'مستثمر، الدمام',
    text: 'The market intelligence helped me pick the right neighborhoods. My occupancy jumped to 89%.',
    textAr: 'ساعدني ذكاء السوق على اختيار الأحياء المناسبة. قفز إشغالي إلى 89%.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  },
];

const results = [
  { value: '28%', labelEn: 'Avg Revenue Increase', labelAr: 'متوسط زيادة الإيرادات' },
  { value: '8,400+', labelEn: 'Properties Managed', labelAr: 'عقار مُدار' },
];

export default function Testimonials() {
  const { lang } = useLang();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#06131F] overflow-hidden border-t border-white/[0.04]">
      <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-[#1B84C4]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#ADDFF1]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#0F6BA8] text-xs font-medium mb-6">
            {lang === 'ar' ? 'قصص النجاح' : 'Customer Stories'}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2F8FC] leading-[1.15] max-w-3xl mx-auto mb-4">
            {lang === 'ar' ? (
              <>مضيفون يثقون <span className="text-gradient-gold">بمدار</span></>
            ) : (
              <>Hosts who trust <span className="text-gradient-gold">Madar</span></>
            )}
          </h2>
        </FadeIn>

        {/* Results counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <AnimatedCounter value={r.value} className="block text-3xl sm:text-4xl font-bold font-heading text-gradient-gold" />
              <div className="text-xs sm:text-sm text-[#F2F8FC]/40 mt-2">
                {lang === 'ar' ? r.labelAr : r.labelEn}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl glass-strong border border-white/[0.06] hover:border-white/15 p-7 transition-all duration-500"
            >
              <Quote className="w-7 h-7 text-[#ADDFF1]/30 mb-4" />

              <p className="text-sm text-[#F2F8FC]/70 leading-relaxed mb-6">
                "{lang === 'ar' ? t.textAr : t.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-medium text-[#F2F8FC]">
                    {lang === 'ar' ? t.nameAr : t.name}
                  </div>
                  <div className="text-xs text-[#F2F8FC]/40">
                    {lang === 'ar' ? t.roleAr : t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}