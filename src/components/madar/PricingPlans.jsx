import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PricingPlans() {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const plans = [
    {
      id: 'startup',
      name: lang === 'ar' ? 'الانطلاقة' : 'Startup',
      description: lang === 'ar' ? 'مناسبة للمضيف الفردي' : 'Perfect for individual hosts',
      monthlyPrice: 99,
      yearlyPrice: 950,
      popular: false,
      features: [
        { ar: 'إدارة وحدة واحدة', en: 'Manage 1 property', included: true },
        { ar: 'مؤشرات الإشغال والإيراد', en: 'Occupancy & Revenue metrics', included: true },
        { ar: 'تحليل أساسي للسوق', en: 'Basic market analysis', included: true },
        { ar: 'تقارير محدودة', en: 'Limited reports', included: true },
        { ar: 'استخدام محدود للمدرب الذكي', en: 'Limited Smart Coach usage', included: true },
        { ar: 'دعم عبر البريد', en: 'Email support', included: true },
        { ar: 'توصيات التسعير الذكي', en: 'Smart pricing recommendations', included: false },
        { ar: 'تنبيهات الإشغال', en: 'Occupancy alerts', included: false },
      ],
    },
    {
      id: 'growth',
      name: lang === 'ar' ? 'النمو' : 'Growth',
      description: lang === 'ar' ? 'الباقة الموصى بها للمضيفين النشطين' : 'Recommended for active hosts',
      monthlyPrice: 249,
      yearlyPrice: 2391,
      popular: true,
      features: [
        { ar: 'إدارة حتى 5 وحدات', en: 'Manage up to 5 properties', included: true },
        { ar: 'مقارنة العقار بالسوق والمنافسين', en: 'Competitor & market comparison', included: true },
        { ar: 'توصيات التسعير الذكي', en: 'Smart pricing recommendations', included: true },
        { ar: 'اكتشاف الإيرادات المفقودة', en: 'Revenue opportunity discovery', included: true },
        { ar: 'تقارير قابلة للتنزيل', en: 'Downloadable reports', included: true },
        { ar: 'تنبيهات الإشغال والطلب', en: 'Occupancy & demand alerts', included: true },
        { ar: 'استخدام أكبر للمدرب الذكي', en: 'Enhanced Smart Coach usage', included: true },
        { ar: 'دعم أولوية', en: 'Priority support', included: true },
      ],
    },
    {
      id: 'professional',
      name: lang === 'ar' ? 'الاحتراف' : 'Professional',
      description: lang === 'ar' ? 'مناسبة للمشغلين المحترفين' : 'For professional operators',
      monthlyPrice: 499,
      yearlyPrice: 4791,
      popular: false,
      features: [
        { ar: 'إدارة حتى 20 وحدة', en: 'Manage up to 20 properties', included: true },
        { ar: 'تحليلات متقدمة', en: 'Advanced analytics', included: true },
        { ar: 'بيانات تاريخية كاملة', en: 'Complete historical data', included: true },
        { ar: 'تقويم موحد للإشغال والتسعير', en: 'Unified occupancy & pricing calendar', included: true },
        { ar: 'تنبيهات متقدمة', en: 'Advanced alerts', included: true },
        { ar: 'تصدير Excel و CSV', en: 'Excel & CSV export', included: true },
        { ar: 'صلاحيات فريق العمل', en: 'Team permissions', included: true },
        { ar: 'دعم مميز 24/7', en: 'Premium 24/7 support', included: true },
      ],
    },
  ];

  const currentPrice = (plan) => {
    if (billingPeriod === 'monthly') {
      return plan.monthlyPrice;
    }
    return Math.round(plan.yearlyPrice / 12);
  };

  const savingsPercent = 20;

  const bgCard = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-[#F2EFE8] border border-[#0A0B10]/10';

  const bgCardHovered = theme === 'dark'
    ? 'bg-white/[0.05] border-white/[0.12]'
    : 'bg-white border-[#0A0B10]/20';

  const textColor = theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]';
  const textMuted = theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60';

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${textColor}`}>
          {lang === 'ar' ? 'تسعير شفاف وبسيط' : 'Simple, Transparent Pricing'}
        </h2>
        <p className={`text-lg mb-8 ${textMuted}`}>
          {lang === 'ar'
            ? 'اختر الباقة المناسبة لاحتياجاتك. ابدأ مجاناً، وقم بالترقية في أي وقت.'
            : 'Choose the plan that fits your needs. Start free, upgrade anytime.'}
        </p>

        {/* Billing Toggle */}
        <div className={`inline-flex items-center rounded-full p-1 ${
          theme === 'dark'
            ? 'bg-white/[0.05] border border-white/[0.08]'
            : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10'
        }`}>
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white'
                : theme === 'dark'
                  ? 'text-[#F7F5F0]/60'
                  : 'text-[#0A0B10]/60'
            }`}
          >
            {lang === 'ar' ? 'شهري' : 'Monthly'}
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
              billingPeriod === 'yearly'
                ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white'
                : theme === 'dark'
                  ? 'text-[#F7F5F0]/60'
                  : 'text-[#0A0B10]/60'
            }`}
          >
            {lang === 'ar' ? 'سنوي' : 'Yearly'}
            {billingPeriod === 'yearly' && (
              <span className="absolute -top-2.5 -right-2 px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-full">
                {savingsPercent}% {lang === 'ar' ? 'خصم' : 'off'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: plan.popular ? -12 : -4 }}
            className={`relative rounded-2xl transition-all duration-300 ${
              plan.popular
                ? 'md:scale-105 ring-2 ring-[#D95F3B]'
                : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="px-4 py-1.5 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-bold rounded-full">
                  {lang === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                </div>
              </div>
            )}

            <div className={`p-8 h-full rounded-2xl flex flex-col ${
              plan.popular
                ? 'bg-gradient-to-br from-[#D95F3B]/10 to-[#C8972A]/5 border border-[#D95F3B]/30'
                : bgCard
            }`}>
              {/* Title */}
              <div className="mb-6">
                <h3 className={`font-heading text-2xl font-bold mb-2 ${textColor}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${textMuted}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-heading font-bold text-4xl text-[#D95F3B]">
                    {currentPrice(plan)}
                  </span>
                  <span className={textMuted}>
                    {lang === 'ar' ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <p className={`text-xs ${textMuted}`}>
                  {billingPeriod === 'monthly'
                    ? (lang === 'ar' ? 'لكل شهر' : 'per month')
                    : (lang === 'ar' ? 'لكل شهر (شهري)' : 'per month (billed yearly)')}
                </p>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-green-500 font-medium mt-1">
                    {lang === 'ar'
                      ? `وفّر ${Math.round(plan.monthlyPrice * 12 * (savingsPercent / 100))} ريال سنوياً`
                      : `Save ${Math.round(plan.monthlyPrice * 12 * (savingsPercent / 100))} SAR/year`}
                  </p>
                )}
              </div>

              {/* Trial Info */}
              <div className={`p-3 rounded-lg mb-8 text-center text-sm ${
                theme === 'dark'
                  ? 'bg-white/[0.05] border border-white/[0.08]'
                  : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10'
              }`}>
                <p className={`${textMuted}`}>
                  {lang === 'ar'
                    ? '14 يوم تجربة مجانية — بدون بطاقة ائتمان'
                    : '14-day free trial — No credit card required'}
                </p>
              </div>

              {/* CTA Button */}
              <Link
                to="/signup"
                className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all mb-8 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white hover:shadow-lg hover:shadow-[#D95F3B]/30'
                    : theme === 'dark'
                      ? 'bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] hover:bg-white/[0.08]'
                      : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10 text-[#0A0B10] hover:bg-[#0A0B10]/10'
                }`}
              >
                {lang === 'ar' ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
                <Arrow className="w-4 h-4" />
              </Link>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, featureIdx) => (
                  <div
                    key={featureIdx}
                    className={`flex items-start gap-3 text-sm ${
                      feature.included ? textColor : textMuted
                    } ${!feature.included ? 'opacity-50' : ''}`}
                  >
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        feature.included ? 'text-[#D95F3B]' : textMuted
                      }`}
                    />
                    <span>
                      {lang === 'ar' ? feature.ar : feature.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`text-center max-w-3xl mx-auto p-6 rounded-xl ${
          theme === 'dark'
            ? 'bg-white/[0.02] border border-white/[0.06]'
            : 'bg-[#0A0B10]/3 border border-[#0A0B10]/10'
        }`}
      >
        <p className={`text-sm ${textMuted}`}>
          {lang === 'ar'
            ? '✓ تجربة مجانية لمدة 14 يومًا لجميع الباقات — بدون رسوم مخفية — يمكنك الإلغاء قبل بدء الاشتراك المدفوع.'
            : '✓ 14-day free trial on all plans — no hidden fees — cancel anytime before your paid subscription begins.'}
        </p>
      </motion.div>
    </div>
  );
}