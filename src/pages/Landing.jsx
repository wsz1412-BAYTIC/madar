import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
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
import { Zap, RefreshCw, TrendingUp, BarChart3, ArrowRight, ArrowLeft, Check, Star, Sparkles, Shield, DollarSign } from 'lucide-react';

const plans = [
  { key: 'free', price: 0, features: { en: ['1 property', 'Basic pricing insights', 'Community support'], ar: ['عقار واحد', 'تحليلات تسعير أساسية', 'دعم المجتمع'] } },
  { key: 'basic', price: 99, features: { en: ['Up to 3 properties', 'AI pricing recommendations', 'Email support', 'Basic analytics'], ar: ['حتى 3 عقارات', 'توصيات تسعير ذكية', 'دعم البريد الإلكتروني', 'تحليلات أساسية'] } },
  { key: 'growth', price: 199, popular: true, features: { en: ['Up to 10 properties', 'Advanced AI pricing', 'Multi-platform sync', 'Priority support', 'Revenue forecasting', 'Market intelligence'], ar: ['حتى 10 عقارات', 'تسعير ذكي متقدم', 'مزامنة متعددة المنصات', 'دعم ذو أولوية', 'توقعات الإيرادات', 'ذكاء السوق'] } },
  { key: 'pro', price: 349, features: { en: ['Unlimited properties', 'Full AI suite', 'All integrations', 'Dedicated account manager', 'Custom reports', 'API access', 'White-label options'], ar: ['عقارات غير محدودة', 'مجموعة ذكاء اصطناعي كاملة', 'جميع التكاملات', 'مدير حساب مخصص', 'تقارير مخصصة', 'وصول API', 'خيارات العلامة البيضاء'] } }
];

const marketData = {
  riyadh: { apartment: { 1: 2500, 2: 4000, 3: 6500, 4: 8500 }, villa: { 2: 5000, 3: 8000, 4: 10000, 5: 13000 } },
  jeddah: { apartment: { 1: 2200, 2: 3500, 3: 5500, 4: 7500 }, villa: { 2: 4500, 3: 7000, 4: 9000, 5: 11500 } },
  dammam: { apartment: { 1: 1800, 2: 3000, 3: 4800, 4: 6500 }, villa: { 2: 3800, 3: 6000, 4: 8000, 5: 10000 } },
};

const estimateRent = (city, type, bedrooms) => marketData[city]?.[type]?.[bedrooms] || 4000;

export default function Landing() {
  const { t, lang, isRTL } = useLang();
  const { theme } = useTheme();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.15]);

  const [calcCity, setCalcCity] = useState('riyadh');
  const [calcType, setCalcType] = useState('apartment');
  const [calcBedrooms, setCalcBedrooms] = useState(2);
  const [calcResult, setCalcResult] = useState(null);

  const handleCalculate = () => {
    const estRent = estimateRent(calcCity, calcType, calcBedrooms);
    const propVal = calcType === 'apartment' ? 500000 : 800000;
    const occupancy = 80;
    const annualRev = estRent * 12 * (occupancy / 100);
    const expenses = 2500 * 12;
    const profit = annualRev - expenses;
    const roi = ((profit / propVal) * 100).toFixed(1);
    setCalcResult({ estRent, annualRev, expenses, profit, roi, propVal });
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark'
        ? 'bg-background text-foreground'
        : 'bg-white text-[#0A0B10]'
    }`}>
      <PublicNavbar />

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1920&h=1080&fit=crop&q=80"
            alt="Jeddah corniche at night"
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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 ${
              theme === 'dark'
                ? 'glass text-[#C8972A]'
                : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10 text-[#C8972A]'
            }`}
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
            <span className={`block ${theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'}`}>{t('heroTitle')}</span>
            <span className="block text-gradient-gold mt-2">{t('heroSubtitle')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed ${
              theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
            }`}
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
            <a href="#pricing" className={`px-8 py-4 font-medium rounded-xl transition-all ${
              theme === 'dark'
                ? 'text-[#F7F5F0] glass hover:bg-white/10'
                : 'text-[#0A0B10] bg-[#0A0B10]/5 border border-[#0A0B10]/10 hover:bg-[#0A0B10]/10'
            }`}>
              {t('viewPricing')}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className={`mt-10 flex items-center justify-center gap-2 text-sm ${
              theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
            }`}
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
          <div className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5 ${
            theme === 'dark' ? 'border-[#F7F5F0]/20' : 'border-[#0A0B10]/20'
          }`}>
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

      {/* ===== 10. RENTAL ROI CALCULATOR SECTION ===== */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[#C8972A] text-xs font-medium mb-6 ${
              theme === 'dark'
                ? 'bg-[#0A0B10] border border-white/[0.08]'
                : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10'
            }`}>
              <Zap className="w-3 h-3" />{lang === 'ar' ? 'أداة سريعة' : 'Quick Tool'}
            </div>
            <h2 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${
              theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
            }`}>{lang === 'ar' ? 'حاسبة الإيجار القصير المدى' : 'Rental ROI Calculator'}</h2>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`}>{lang === 'ar' ? 'قدّر إيراداتك الديناميكية حسب المدينة ونوع العقار وعدد الغرف' : 'Estimate your dynamic monthly revenue by city, property type, and bedroom count'}</p>
          </FadeIn>

          <ScaleIn className={`p-8 rounded-3xl mb-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#1C1F2E] via-[#0F1117] to-[#1C1F2E] border border-white/[0.08]'
              : 'bg-gradient-to-br from-white via-[#F2EFE8] to-white border border-[#0A0B10]/5'
          }`}>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
                  }`}>{lang === 'ar' ? 'المدينة' : 'City'}</label>
                  <select value={calcCity} onChange={(e) => setCalcCity(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] focus:ring-2 focus:ring-[#D95F3B]/20'
                      : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10 text-[#0A0B10] focus:ring-2 focus:ring-[#D95F3B]/20'
                  }`}>
                    <option value="riyadh">{lang === 'ar' ? 'الرياض' : 'Riyadh'}</option>
                    <option value="jeddah">{lang === 'ar' ? 'جدة' : 'Jeddah'}</option>
                    <option value="dammam">{lang === 'ar' ? 'الدمام' : 'Dammam'}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
                  }`}>{lang === 'ar' ? 'نوع العقار' : 'Property Type'}</label>
                  <select value={calcType} onChange={(e) => setCalcType(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] focus:ring-2 focus:ring-[#D95F3B]/20'
                      : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10 text-[#0A0B10] focus:ring-2 focus:ring-[#D95F3B]/20'
                  }`}>
                    <option value="apartment">{lang === 'ar' ? 'شقة' : 'Apartment'}</option>
                    <option value="villa">{lang === 'ar' ? 'فيلا' : 'Villa'}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
                  }`}>{lang === 'ar' ? 'عدد الغرف' : 'Bedrooms'}</label>
                  <select value={calcBedrooms} onChange={(e) => setCalcBedrooms(Number(e.target.value))} className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] focus:ring-2 focus:ring-[#D95F3B]/20'
                      : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10 text-[#0A0B10] focus:ring-2 focus:ring-[#D95F3B]/20'
                  }`}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
              </div>
              <button onClick={handleCalculate} className="group relative flex items-center justify-center gap-2 w-full px-8 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-[#D95F3B]/30 overflow-hidden">
                <span className="relative z-10">{lang === 'ar' ? 'قدّر إيراداتك' : 'Estimate Revenue'}</span>
                <Arrow className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
              <p className={`text-xs text-center ${
                theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
              }`}>{lang === 'ar' ? '✨ استخدم بيانات السوق الفعلية للحصول على تقديرات دقيقة' : '✨ Based on real market data for accurate estimates'}</p>
            </div>
          </ScaleIn>

          {calcResult && (
            <FadeIn delay={0.1}>
              <div className={`p-6 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-white/[0.03] border border-white/[0.06]'
                  : 'bg-[#F2EFE8] border border-[#0A0B10]/10'
              }`}>
                <h3 className={`font-heading text-lg font-bold mb-6 ${
                  theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                }`}>{lang === 'ar' ? 'مقارنة العوائد المتوقعة' : 'Projected Returns Comparison'}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-white/[0.02] border border-white/[0.06]'
                      : 'bg-[#0A0B10]/3 border border-[#0A0B10]/10'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
                    }`}>{lang === 'ar' ? 'الإيجار الشهري المقدّر' : 'Est. Monthly Rent'}</p>
                    <p className={`font-heading font-bold text-2xl ${
                      theme === 'dark' ? 'text-[#D95F3B]' : 'text-[#D95F3B]'
                    }`}>{calcResult.estRent.toLocaleString()} {sar}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-white/[0.02] border border-white/[0.06]'
                      : 'bg-[#0A0B10]/3 border border-[#0A0B10]/10'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
                    }`}>{lang === 'ar' ? 'الإيرادات السنوية' : 'Annual Revenue'}</p>
                    <p className={`font-heading font-bold text-2xl ${
                      theme === 'dark' ? 'text-[#C8972A]' : 'text-[#C8972A]'
                    }`}>{calcResult.annualRev.toLocaleString()} {sar}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-white/[0.02] border border-white/[0.06]'
                      : 'bg-[#0A0B10]/3 border border-[#0A0B10]/10'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
                    }`}>{lang === 'ar' ? 'الربح السنوي' : 'Annual Profit'}</p>
                    <p className={`font-heading font-bold text-2xl ${
                      theme === 'dark' ? 'text-[#D95F3B]' : 'text-[#D95F3B]'
                    }`}>{calcResult.profit.toLocaleString()} {sar}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-white/[0.02] border border-white/[0.06]'
                      : 'bg-[#0A0B10]/3 border border-[#0A0B10]/10'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
                    }`}>{lang === 'ar' ? 'العائد على الاستثمار' : 'ROI'}</p>
                    <p className={`font-heading font-bold text-2xl ${
                      theme === 'dark' ? 'text-[#C8972A]' : 'text-[#C8972A]'
                    }`}>{calcResult.roi}%</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          <StaggerContainer stagger={0.1} className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, label: lang === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue', value: lang === 'ar' ? 'حسب السوق' : 'Market-based' },
              { icon: BarChart3, label: lang === 'ar' ? 'العائد على الاستثمار' : 'ROI Projection', value: lang === 'ar' ? 'دقيق ومفصل' : 'Detailed' },
              { icon: TrendingUp, label: lang === 'ar' ? 'مقارنة المنافسين' : 'Competitor Compare', value: lang === 'ar' ? 'في الوقت الفعلي' : 'Real-time' }
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className={`p-6 rounded-2xl text-center ${
                  theme === 'dark'
                    ? 'bg-white/[0.03] border border-white/[0.06]'
                    : 'bg-[#F2EFE8] border border-[#0A0B10]/10'
                }`}>
                  <item.icon className="w-8 h-8 text-[#D95F3B] mx-auto mb-4" />
                  <h3 className={`font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                  }`}>{item.label}</h3>
                  <p className={theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'}>{item.value}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 11. PRICING PLANS ===== */}
      <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[#C8972A] text-xs font-medium mb-6 ${
              theme === 'dark'
                ? 'bg-[#0A0B10] border border-white/[0.08]'
                : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10'
            }`}>
              <Shield className="w-3 h-3" />{lang === 'ar' ? 'الأسعار' : 'Pricing'}
            </div>
            <h2 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${
              theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
            }`}>{t('pricingTitle')}</h2>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`}>{t('pricingSubtitle')}</p>
            <p className={`text-base mt-4 ${
              theme === 'dark' ? 'text-[#D95F3B]' : 'text-[#D95F3B]'
            }`}>{lang === 'ar' ? '✨ تجربة مجانية لمدة 14 يوماً متضمنة في جميع الخطط' : '✨ 14-Day Free Trial Included in All Plans'}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, i) => (
              <ScaleIn key={plan.key} delay={i * 0.08}>
                <div className={`relative h-full p-6 rounded-3xl hover:-translate-y-1 transition-all duration-500 ${
                  plan.popular
                    ? theme === 'dark'
                      ? 'bg-[#0F1117] border border-[#D95F3B]/30 glow-coral'
                      : 'bg-white border border-[#D95F3B]/30 glow-coral'
                    : theme === 'dark'
                      ? 'bg-[#0F1117] border border-white/[0.06] hover:border-white/15'
                      : 'bg-[#F2EFE8] border border-[#0A0B10]/10 hover:border-[#0A0B10]/20'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-medium rounded-full">
                      {t('popular')}
                    </div>
                  )}
                  {plan.key !== 'free' && (
                    <div className="absolute top-6 right-6 px-2.5 py-1 bg-[#D95F3B]/10 border border-[#D95F3B]/30 text-[#D95F3B] text-xs font-medium rounded-full">
                      {lang === 'ar' ? '14 يوم مجاني' : '14 Days Free'}
                    </div>
                  )}
                  <div className="mb-8">
                    <h3 className={`font-heading font-bold mb-3 text-lg ${
                      theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                    }`}>{t(plan.key)}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold font-heading ${
                        theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                      }`}>{plan.price}</span>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
                      }`}>{t('sar')} {t('mo')}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 min-h-[200px]">
                    {plan.features[lang].map((f, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-sm ${
                        theme === 'dark' ? 'text-[#F7F5F0]/70' : 'text-[#0A0B10]/70'
                      }`}>
                        <Check className="w-4 h-4 text-[#D95F3B] mt-0.5 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className={`block text-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white hover:shadow-lg hover:shadow-[#D95F3B]/30'
                      : theme === 'dark'
                        ? 'bg-white/[0.04] text-[#F7F5F0] border border-white/[0.06] hover:bg-white/10'
                        : 'bg-[#0A0B10]/5 text-[#0A0B10] border border-[#0A0B10]/10 hover:bg-[#0A0B10]/10'
                  }`}>
                    {t('getStarted')}
                  </Link>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 12. FINAL CALL TO ACTION ===== */}
      <FinalCTA />

      {/* ===== FOOTER ===== */}
      <ComprehensiveFooter />
    </div>
  );
}