import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_ENTITLEMENTS, AVAILABLE_ADDONS } from '@/lib/subscriptionEntitlements';
import AppLayout from '@/components/madar/AppLayout';
import { Check, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlansAndUpgrade() {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const { subscription, getPlanName, hasAddOn } = useSubscription();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const currentPlan = getPlanName();
  const plans = Object.entries(SUBSCRIPTION_ENTITLEMENTS).map(([key, plan]) => ({
    id: key,
    ...plan,
  }));

  const handleUpgrade = (planId) => {
    // TODO: Redirect to checkout with plan
    console.log('Upgrade to:', planId);
  };

  const handleAddOn = (addOnId) => {
    // TODO: Add to cart or subscribe
    console.log('Add:', addOnId);
  };

  return (
    <AppLayout>
      <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
        theme === 'dark' ? 'bg-background' : 'bg-[#F2EFE8]'
      }`}>
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl sm:text-5xl font-heading font-bold mb-4 ${
            theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
          }`}>
            {lang === 'ar' ? 'خطط وترقيات' : 'Plans & Upgrades'}
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
          }`}>
            {lang === 'ar' 
              ? 'اختر الخطة المناسبة لاحتياجات عملك'
              : 'Choose the perfect plan for your business'}
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-primary text-white'
                : theme === 'dark'
                  ? 'text-[#F7F5F0]/60 hover:text-[#F7F5F0]'
                  : 'text-[#0A0B10]/60 hover:text-[#0A0B10]'
            }`}
          >
            {lang === 'ar' ? 'شهري' : 'Monthly'}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-primary text-white'
                : theme === 'dark'
                  ? 'text-[#F7F5F0]/60 hover:text-[#F7F5F0]'
                  : 'text-[#0A0B10]/60 hover:text-[#0A0B10]'
            }`}
          >
            {lang === 'ar' ? 'سنوي' : 'Yearly'}
            <span className="ml-2 text-xs text-amber-500">-20%</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col h-full transition-all ${
                plan.id === currentPlan
                  ? theme === 'dark'
                    ? 'bg-card border-primary/50 ring-2 ring-primary/20'
                    : 'bg-white border-primary/50 ring-2 ring-primary/20'
                  : theme === 'dark'
                    ? 'bg-card border-white/[0.06] hover:border-white/[0.12]'
                    : 'bg-white border-[#0A0B10]/[0.06] hover:border-[#0A0B10]/[0.12]'
              }`}
            >
              {plan.id === currentPlan && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-amber-500 rounded-t-2xl" />
              )}

              {/* Plan Name */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-xl font-heading font-bold ${
                    theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                  }`}>
                    {lang === 'ar' ? plan.nameAr : plan.name}
                  </h3>
                  {plan.id === currentPlan && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {lang === 'ar' ? 'حالي' : 'Current'}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
                }`}>
                  {plan.id === 'free' 
                    ? (lang === 'ar' ? 'مجاني للأبد' : 'Forever free')
                    : (lang === 'ar' ? 'ابدأ الآن' : 'Get started')}
                </p>
              </div>

              {/* Price */}
              {plan.id !== 'free' && (
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${
                      theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                    }`}>
                      SAR {Math.round(plan.price || 0)}
                    </span>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
                    }`}>
                      /{lang === 'ar' ? 'شهر' : 'month'}
                    </span>
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div className="mb-8 flex-1">
                <p className={`text-xs font-semibold mb-3 ${
                  theme === 'dark' ? 'text-[#F7F5F0]/40' : 'text-[#0A0B10]/40'
                }`}>
                  {lang === 'ar' ? 'الميزات الرئيسية' : 'Key Features'}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className={theme === 'dark' ? 'text-[#F7F5F0]/80' : 'text-[#0A0B10]/80'}>
                      {plan.features.properties.maxCount === Infinity 
                        ? (lang === 'ar' ? 'عقارات غير محدودة' : 'Unlimited properties')
                        : `${plan.features.properties.maxCount} ${lang === 'ar' ? 'عقار' : 'properties'}`}
                    </span>
                  </li>
                  {plan.features.pricing.recommendations && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className={theme === 'dark' ? 'text-[#F7F5F0]/80' : 'text-[#0A0B10]/80'}>
                        {lang === 'ar' ? 'توصيات التسعير' : 'Pricing recommendations'}
                      </span>
                    </li>
                  )}
                  {plan.features.pricing.automaticPricing && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className={theme === 'dark' ? 'text-[#F7F5F0]/80' : 'text-[#0A0B10]/80'}>
                        {lang === 'ar' ? 'التسعير التلقائي' : 'Automatic pricing'}
                      </span>
                    </li>
                  )}
                  {plan.features.analyticsCenter && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className={theme === 'dark' ? 'text-[#F7F5F0]/80' : 'text-[#0A0B10]/80'}>
                        {lang === 'ar' ? 'تحليلات متقدمة' : 'Advanced analytics'}
                      </span>
                    </li>
                  )}
                  {plan.features.support.level === 'priority' && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className={theme === 'dark' ? 'text-[#F7F5F0]/80' : 'text-[#0A0B10]/80'}>
                        {lang === 'ar' ? 'دعم ذو أولوية' : 'Priority support'}
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.id === currentPlan}
                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  plan.id === currentPlan
                    ? theme === 'dark'
                      ? 'bg-white/[0.04] text-[#F7F5F0]/40 cursor-default'
                      : 'bg-[#0A0B10]/[0.04] text-[#0A0B10]/40 cursor-default'
                    : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30'
                }`}
              >
                {plan.id === currentPlan 
                  ? (lang === 'ar' ? 'خطتك الحالية' : 'Your current plan')
                  : (lang === 'ar' ? 'الترقية' : 'Upgrade')}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-heading font-bold mb-6 ${
            theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
          }`}>
            {lang === 'ar' ? 'إضافات اختيارية' : 'Optional Add-ons'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(AVAILABLE_ADDONS).map(([key, addon]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`rounded-xl border p-6 ${
                  hasAddOn(key)
                    ? theme === 'dark'
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-primary/5 border-primary/50'
                    : theme === 'dark'
                      ? 'bg-card border-white/[0.06]'
                      : 'bg-white border-[#0A0B10]/[0.06]'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`font-heading font-bold ${
                      theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                    }`}>
                      {lang === 'ar' ? addon.nameAr : addon.name}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
                    }`}>
                      SAR {addon.price}/month
                    </p>
                  </div>
                  {hasAddOn(key) && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500">
                      {lang === 'ar' ? 'فعال' : 'Active'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddOn(key)}
                  disabled={hasAddOn(key)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    hasAddOn(key)
                      ? theme === 'dark'
                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                        : 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-primary/20 text-primary hover:bg-primary/30'
                  }`}
                >
                  {hasAddOn(key) 
                    ? (lang === 'ar' ? 'مضافة' : 'Added')
                    : (lang === 'ar' ? 'إضافة' : 'Add')}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-12">
          <h2 className={`text-2xl font-heading font-bold mb-6 ${
            theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
          }`}>
            {lang === 'ar' ? 'مقارنة الميزات' : 'Feature Comparison'}
          </h2>
          <div className={`rounded-xl border overflow-x-auto ${
            theme === 'dark' ? 'border-white/[0.06]' : 'border-[#0A0B10]/[0.06]'
          }`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${
                  theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-[#0A0B10]/[0.06] bg-[#0A0B10]/[0.02]'
                }`}>
                  <th className="px-6 py-3 text-left font-semibold">{lang === 'ar' ? 'الميزة' : 'Feature'}</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="px-6 py-3 text-center font-semibold">
                      {lang === 'ar' ? plan.nameAr : plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'properties.maxCount', label: lang === 'ar' ? 'الحد الأقصى للعقارات' : 'Max Properties' },
                  { key: 'pricing.recommendations', label: lang === 'ar' ? 'توصيات التسعير' : 'Pricing Recommendations' },
                  { key: 'analytics.advancedCharts', label: lang === 'ar' ? 'الرسوم البيانية المتقدمة' : 'Advanced Charts' },
                  { key: 'pricing.automaticPricing', label: lang === 'ar' ? 'التسعير التلقائي' : 'Automatic Pricing' },
                  { key: 'support.level', label: lang === 'ar' ? 'مستوى الدعم' : 'Support Level' },
                ].map((feature, idx) => (
                  <tr key={idx} className={`border-b ${
                    theme === 'dark' ? 'border-white/[0.06]' : 'border-[#0A0B10]/[0.06]'
                  }`}>
                    <td className={`px-6 py-3 font-medium ${
                      theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                    }`}>
                      {feature.label}
                    </td>
                    {plans.map(plan => {
                      const hasFeature = feature.key.split('.').reduce((obj, key) => obj?.[key], plan.features);
                      return (
                        <td key={plan.id} className="px-6 py-3 text-center">
                          {hasFeature === true ? (
                            <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : hasFeature === false ? (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          ) : (
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
                            }`}>
                              {hasFeature}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}