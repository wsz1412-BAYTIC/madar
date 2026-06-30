import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import { Zap, RefreshCw, TrendingUp, BarChart3, ArrowRight, ArrowLeft, Check, Star } from 'lucide-react';

const plans = [
  {
    key: 'free', price: 0,
    features: { en: ['1 property', 'Basic pricing insights', 'Community support'], ar: ['عقار واحد', 'تحليلات تسعير أساسية', 'دعم المجتمع'] }
  },
  {
    key: 'basic', price: 99,
    features: { en: ['Up to 3 properties', 'AI pricing recommendations', 'Email support', 'Basic analytics'], ar: ['حتى 3 عقارات', 'توصيات تسعير ذكية', 'دعم البريد الإلكتروني', 'تحليلات أساسية'] }
  },
  {
    key: 'growth', price: 199, popular: true,
    features: { en: ['Up to 10 properties', 'Advanced AI pricing', 'Multi-platform sync', 'Priority support', 'Revenue forecasting', 'Market intelligence'], ar: ['حتى 10 عقارات', 'تسعير ذكي متقدم', 'مزامنة متعددة المنصات', 'دعم ذو أولوية', 'توقعات الإيرادات', 'ذكاء السوق'] }
  },
  {
    key: 'pro', price: 349,
    features: { en: ['Unlimited properties', 'Full AI suite', 'All integrations', 'Dedicated account manager', 'Custom reports', 'API access', 'White-label options'], ar: ['عقارات غير محدودة', 'مجموعة ذكاء اصطناعي كاملة', 'جميع التكاملات', 'مدير حساب مخصص', 'تقارير مخصصة', 'وصول API', 'خيارات العلامة البيضاء'] }
  }
];

export default function Landing() {
  const { t, lang, isRTL } = useLang();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D95F3B]/10 text-[#D95F3B] text-xs font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C1F2E] leading-tight mb-4">
            {t('heroTitle')}
            <br />
            <span className="bg-gradient-to-r from-[#D95F3B] to-[#C8972A] bg-clip-text text-transparent">
              {t('heroSubtitle')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#1C1F2E]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('heroDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="flex items-center gap-2 px-6 py-3.5 bg-[#D95F3B] text-white font-medium rounded-xl hover:bg-[#D95F3B]/90 transition-all shadow-lg shadow-[#D95F3B]/20">
              {t('startFree')}
              <Arrow className="w-4 h-4" />
            </Link>
            <a href="#pricing" className="px-6 py-3.5 text-[#1C1F2E] font-medium rounded-xl border border-[#1C1F2E]/10 hover:bg-white transition-all">
              {t('viewPricing')}
            </a>
          </div>
          <p className="mt-8 text-sm text-[#1C1F2E]/40 flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#C8972A] fill-[#C8972A]" />
            {t('trustedBy')}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-[#1C1F2E]/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: lang === 'ar' ? 'مضيف نشط' : 'Active Hosts' },
            { value: '2,400+', label: lang === 'ar' ? 'عقار مُدار' : 'Properties Managed' },
            { value: '23%', label: lang === 'ar' ? 'زيادة متوسط الإيرادات' : 'Avg Revenue Increase' },
            { value: '98%', label: lang === 'ar' ? 'رضا العملاء' : 'Client Satisfaction' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-2xl sm:text-3xl font-bold text-[#1C1F2E] font-heading">{s.value}</div>
              <div className="text-sm text-[#1C1F2E]/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1F2E] mb-4">{t('featuresTitle')}</h2>
            <p className="text-[#1C1F2E]/60 text-lg max-w-xl mx-auto">{t('featuresSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Zap, titleKey: 'feat1Title', descKey: 'feat1Desc', color: '#D95F3B' },
              { icon: RefreshCw, titleKey: 'feat2Title', descKey: 'feat2Desc', color: '#C8972A' },
              { icon: BarChart3, titleKey: 'feat3Title', descKey: 'feat3Desc', color: '#1C1F2E' },
              { icon: TrendingUp, titleKey: 'feat4Title', descKey: 'feat4Desc', color: '#D95F3B' },
            ].map((f, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-white border border-[#1C1F2E]/5 hover:shadow-lg hover:shadow-[#1C1F2E]/5 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${f.color}10` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-heading font-semibold text-[#1C1F2E] text-lg mb-2">{t(f.titleKey)}</h3>
                <p className="text-[#1C1F2E]/60 text-sm leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1F2E] mb-4">{t('pricingTitle')}</h2>
            <p className="text-[#1C1F2E]/60 text-lg">{t('pricingSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div key={plan.key} className={`relative p-6 rounded-2xl border transition-all ${plan.popular ? 'border-[#D95F3B] shadow-lg shadow-[#D95F3B]/10 scale-[1.02]' : 'border-[#1C1F2E]/10'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D95F3B] text-white text-xs font-medium rounded-full">
                    {t('popular')}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-[#1C1F2E] mb-2">{t(plan.key)}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#1C1F2E]">{plan.price}</span>
                    <span className="text-sm text-[#1C1F2E]/50">{t('sar')} {t('mo')}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features[lang].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1C1F2E]/70">
                      <Check className="w-4 h-4 text-[#D95F3B] mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`block text-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${plan.popular ? 'bg-[#D95F3B] text-white hover:bg-[#D95F3B]/90' : 'bg-[#1C1F2E]/5 text-[#1C1F2E] hover:bg-[#1C1F2E]/10'}`}>
                  {t('getStarted')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#1C1F2E]/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">م</span>
            </div>
            <span className="text-sm text-[#1C1F2E]/60">© 2025 Madar. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}</span>
          </div>
          <div className="flex gap-6">
            <Link to="/calculator" className="text-sm text-[#1C1F2E]/40 hover:text-[#D95F3B]">{t('calculator')}</Link>
            <Link to="/login" className="text-sm text-[#1C1F2E]/40 hover:text-[#D95F3B]">{t('login')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}