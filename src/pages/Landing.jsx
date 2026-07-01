import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import PlatformLogos from '@/components/madar/PlatformLogos';
import MarketMetrics from '@/components/madar/MarketMetrics';
import ProblemSolution from '@/components/madar/ProblemSolution';
import DashboardShowcase from '@/components/madar/DashboardShowcase';
import PremiumFeatures from '@/components/madar/PremiumFeatures';
import ToolsSection from '@/components/madar/ToolsSection';
import HowItWorks from '@/components/madar/HowItWorks';
import SupportedCities from '@/components/madar/SupportedCities';
import Testimonials from '@/components/madar/Testimonials';
import FinalCTA from '@/components/madar/FinalCTA';
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem, ParallaxImage } from '@/components/madar/Motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, RefreshCw, TrendingUp, BarChart3, ArrowRight, ArrowLeft, Check, Star, Sparkles, Shield } from 'lucide-react';

const plans = [
  { key: 'free', price: 0, features: { en: ['1 property', 'Basic pricing insights', 'Community support'], ar: ['عقار واحد', 'تحليلات تسعير أساسية', 'دعم المجتمع'] } },
  { key: 'basic', price: 99, features: { en: ['Up to 3 properties', 'AI pricing recommendations', 'Email support', 'Basic analytics'], ar: ['حتى 3 عقارات', 'توصيات تسعير ذكية', 'دعم البريد الإلكتروني', 'تحليلات أساسية'] } },
  { key: 'growth', price: 199, popular: true, features: { en: ['Up to 10 properties', 'Advanced AI pricing', 'Multi-platform sync', 'Priority support', 'Revenue forecasting', 'Market intelligence'], ar: ['حتى 10 عقارات', 'تسعير ذكي متقدم', 'مزامنة متعددة المنصات', 'دعم ذو أولوية', 'توقعات الإيرادات', 'ذكاء السوق'] } },
  { key: 'pro', price: 349, features: { en: ['Unlimited properties', 'Full AI suite', 'All integrations', 'Dedicated account manager', 'Custom reports', 'API access', 'White-label options'], ar: ['عقارات غير محدودة', 'مجموعة ذكاء اصطناعي كاملة', 'جميع التكاملات', 'مدير حساب مخصص', 'تقارير مخصصة', 'وصول API', 'خيارات العلامة البيضاء'] } }
];

export default function Landing() {
  const { t, lang, isRTL } = useLang();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.15]);

  return (
    <div className="min-h-screen bg-[#F2EFE8] text-[#0A0B10]">
      <PublicNavbar />

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
          <img
            src="https://media.base44.com/images/public/6a43dd3026ba0773af35c603/b61ceee51_.png"
            alt="Riyadh skyline at night"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/80 via-[#0A0B10]/50 to-[#F2EFE8]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#000b1e]/70 via-transparent to-transparent" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[#C8972A] text-xs font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05]! mb-6"
          >
            <span className="block text-[#F7F5F0]">{t('heroTitle')}</span>
            <span className="block text-gradient-gold mt-2">{t('heroSubtitle')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl text-[#F7F5F0]/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {t('heroDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl transition-all overflow-hidden glow-coral">
              <span className="relative z-10">{t('startFree')}</span>
              <Arrow className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
            <a href="#pricing" className="px-8 py-4 text-[#F7F5F0] font-medium rounded-xl glass hover:bg-white/10 transition-all">
              {t('viewPricing')}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-10 flex items-center justify-center gap-2 text-sm text-[#F7F5F0]/40"
          >
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-[#C8972A] fill-[#C8972A]" />)}
            </div>
            {t('trustedBy')}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#F7F5F0]/20 flex items-start justify-center p-1.5">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="w-1 h-2 bg-[#C8972A] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== 2. PLATFORM LOGOS ===== */}
      <PlatformLogos />

      {/* ===== 3. MARKET METRICS ===== */}
      <MarketMetrics />

      {/* ===== 4. PROBLEM & SOLUTION ===== */}
      <ProblemSolution />

      {/* ===== 5. PRODUCT DASHBOARD SHOWCASE ===== */}
      <DashboardShowcase />

      {/* ===== 6. CORE FEATURES ===== */}
      <PremiumFeatures />
      <ToolsSection />

      {/* ===== 7. HOW MADAR WORKS ===== */}
      <HowItWorks />

      {/* ===== 8. SUPPORTED CITIES ===== */}
      <SupportedCities />

      {/* ===== 9. CUSTOMER RESULTS / TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== 10. PRICING PLANS ===== */}
      <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0B10] border border-white/[0.08] text-[#C8972A] text-xs font-medium mb-6">
              <Shield className="w-3 h-3" />{lang === 'ar' ? 'الأسعار' : 'Pricing'}
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#0A0B10] mb-4">{t('pricingTitle')}</h2>
            <p className="text-[#0A0B10]/50 text-lg">{t('pricingSubtitle')}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, i) => (
              <ScaleIn key={plan.key} delay={i * 0.08}>
                <div className={`relative h-full p-6 rounded-3xl hover:-translate-y-1 transition-all duration-500 ${
                  plan.popular
                    ? 'bg-[#0F1117] border border-[#D95F3B]/30 glow-coral'
                    : 'bg-[#0F1117] border border-white/[0.06] hover:border-white/15'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-medium rounded-full">
                      {t('popular')}
                    </div>
                  )}
                  <div className="mb-8">
                    <h3 className="font-heading font-bold text-[#F7F5F0] mb-3 text-lg">{t(plan.key)}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-heading text-[#F7F5F0]">{plan.price}</span>
                      <span className="text-sm text-[#F7F5F0]/40">{t('sar')} {t('mo')}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 min-h-[200px]">
                    {plan.features[lang].map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#F7F5F0]/70">
                        <Check className="w-4 h-4 text-[#D95F3B] mt-0.5 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className={`block text-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white hover:shadow-lg hover:shadow-[#D95F3B]/30'
                      : 'bg-white/[0.04] text-[#F7F5F0] border border-white/[0.06] hover:bg-white/10'
                  }`}>
                    {t('getStarted')}
                  </Link>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 11. FINAL CALL TO ACTION ===== */}
      <FinalCTA />

      {/* ===== FOOTER ===== */}
      <footer className="py-16 px-4 border-t border-[#0A0B10]/[0.06] bg-[#F2EFE8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <div>
              <span className="font-heading font-bold text-[#0A0B10]">Madar</span>
              <span className="text-sm text-[#0A0B10]/40 ml-2">© 2025</span>
            </div>
          </div>
          <div className="flex gap-8">
            <Link to="/calculator" className="text-sm text-[#0A0B10]/40 hover:text-[#C8972A] transition-colors">{t('calculator')}</Link>
            <Link to="/login" className="text-sm text-[#0A0B10]/40 hover:text-[#C8972A] transition-colors">{t('login')}</Link>
            <Link to="/signup" className="text-sm text-[#0A0B10]/40 hover:text-[#C8972A] transition-colors">{t('signup')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}