import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { FadeIn } from '@/components/madar/Motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  const { lang, isRTL } = useLang();
  const { isAuthenticated, authChecked } = useAuth();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <section ref={ref} className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F2EFE8]">
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <img
          src="https://media.base44.com/images/public/6a43dd3026ba0773af35c603/b61ceee51_.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0A0B10]/85" />
      </motion.div>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#F2EFE8] via-transparent to-[#F2EFE8]" />

      <FadeIn className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[#C8972A] text-xs font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey'}
        </motion.div>

        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F7F5F0] leading-[1.1] mb-6">
          {lang === 'ar' ? (
            <>عقاراتك تستحق <span className="text-gradient-gold">الأفضل</span></>
          ) : (
            <>Your properties deserve <span className="text-gradient-gold">the best</span></>
          )}
        </h2>

        <p className="text-lg text-[#F7F5F0]/60 mb-10 max-w-xl mx-auto">
          {lang === 'ar'
            ? 'انضم إلى نخبة المضيفين الذين يحققون أقصى عائد من إيجاراتهم في المملكة.'
            : 'Join an elite group of hosts maximizing returns across the Kingdom.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!authChecked ? (
            <div aria-hidden="true" className="w-56 h-[56px] rounded-xl bg-white/10 animate-pulse" />
          ) : (
          <Link
            to={isAuthenticated ? '/dashboard' : '/signup'}
            className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl transition-all overflow-hidden glow-coral"
          >
            <span className="relative z-10">
              {isAuthenticated
                ? (lang === 'ar' ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard')
                : (lang === 'ar' ? 'ابدأ تجربة مجانية' : 'Start Free Trial')}
            </span>
            <Arrow className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
          )}
          <Link
            to="/calculator"
            className="px-8 py-4 text-[#F7F5F0] font-medium rounded-xl glass hover:bg-white/10 transition-all"
          >
            {lang === 'ar' ? 'جرّب الحاسبة' : 'Try Calculator'}
          </Link>
        </div>

        <p className="text-sm text-[#F7F5F0]/30 mt-8">
          {lang === 'ar' ? 'لا حاجة لبطاقة ائتمان · إلغاء في أي وقت' : 'No credit card required · Cancel anytime'}
        </p>
      </FadeIn>
    </section>
  );
}