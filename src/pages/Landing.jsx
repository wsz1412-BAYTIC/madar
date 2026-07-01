import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ToolsSection from '@/components/madar/ToolsSection';
import PlatformLogos from '@/components/madar/PlatformLogos';
import ProblemSolution from '@/components/madar/ProblemSolution';
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem, ParallaxImage } from '@/components/madar/Motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, RefreshCw, TrendingUp, BarChart3, ArrowRight, ArrowLeft, Check, Star, Sparkles, Globe2, Shield } from 'lucide-react';

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

      {/* ===== HERO ===== */}
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
            className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-6"
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

      {/* ===== PROBLEM / SOLUTION ===== */}
      <ProblemSolution />

      {/* ===== PLATFORM LOGOS ===== */}
      <PlatformLogos />

      {/* ===== TOOLS ===== */}
      <ToolsSection />

      {/* ===== STATS ===== */}
      <section className="py-20 px-4 border-y border-[#0A0B10]/[0.06]">
        <StaggerContainer className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: lang === 'ar' ? 'مضيف نشط' : 'Active Hosts' },
            { value: '2,400+', label: lang === 'ar' ? 'عقار مُدار' : 'Properties Managed' },
            { value: '23%', label: lang === 'ar' ? 'زيادة متوسط الإيرادات' : 'Avg Revenue Increase' },
            { value: '98%', label: lang === 'ar' ? 'رضا العملاء' : 'Client Satisfaction' },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <div className="text-4xl sm:text-5xl font-bold font-heading text-gradient-gold">{s.value}</div>
              <div className="text-sm text-[#0A0B10]/50 mt-2">{s.label}</div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#C8972A] text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" />{lang === 'ar' ? 'الميزات' : 'Features'}
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#0A0B10] mb-4 leading-tight">{t('featuresTitle')}</h2>
            <p className="text-[#0A0B10]/50 text-lg max-w-xl mx-auto">{t('featuresSubtitle')}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Zap, titleKey: 'feat1Title', descKey: 'feat1Desc', color: '#D95F3B', img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop' },
              { icon: RefreshCw, titleKey: 'feat2Title', descKey: 'feat2Desc', color: '#C8972A', img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop' },
              { icon: BarChart3, titleKey: 'feat3Title', descKey: 'feat3Desc', color: '#D95F3B', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop' },
              { icon: TrendingUp, titleKey: 'feat4Title', descKey: 'feat4Desc', color: '#C8972A', img: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&h=400&fit=crop' },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group relative h-[420px] rounded-3xl overflow-hidden bg-[#0F1117] border border-white/[0.06] hover:border-white/15 transition-all duration-500">
                  <div className="absolute inset-0 overflow-hidden">
                    <img src={f.img} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-[#0F1117]/80 to-[#0F1117]/40" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-end p-8">
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <h3 className="font-heading font-bold text-[#F7F5F0] text-2xl mb-3">{t(f.titleKey)}</h3>
                    <p className="text-[#F7F5F0]/60 text-sm leading-relaxed">{t(f.descKey)}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CINEMATIC BANNER ===== */}
      <section className="relative py-32 overflow-hidden">
        <ParallaxImage src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&h=800&fit=crop" alt="" className="absolute inset-0" speed={0.15} />
        <div className="absolute inset-0 bg-[#0A0B10]/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F7F5F0] mb-6 leading-tight">
              {lang === 'ar' ? 'عقاراتك تستحق' : 'Your properties deserve'}{' '}
              <span className="text-gradient-gold">{lang === 'ar' ? 'الأفضل' : 'the best'}</span>
            </h2>
            <p className="text-lg text-[#F7F5F0]/60 mb-10 max-w-xl mx-auto">
              {lang === 'ar' ? 'انضم إلى نخبة المضيفين الذين يحققون أقصى عائد من إيجاراتهم في المملكة.' : 'Join an elite group of hosts maximizing returns across the Kingdom.'}
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl glow-coral hover:scale-105 transition-transform">
              {t('startFree')} <Arrow className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[#C8972A] text-xs font-medium mb-6">
              <Shield className="w-3 h-3" />{lang === 'ar' ? 'الأسعار' : 'Pricing'}
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#0A0B10] mb-4">{t('pricingTitle')}</h2>
            <p className="text-[#0A0B10]/50 text-lg">{t('pricingSubtitle')}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, i) => (
              <ScaleIn key={plan.key} delay={i * 0.08}>
                <div className={`relative h-full p-6 rounded-3xl transition-all duration-500 ${
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

      {/* ===== FOOTER ===== */}
      <footer className="py-16 px-4 border-t border-[#0A0B10]/[0.06]">
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