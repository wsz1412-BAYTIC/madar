import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { base44 } from '@/api/base44Client';
import { selectCurrentPlanKey } from '@/lib/subscriptionProvisioning';
import { CreditCard, ArrowUpRight, X, Power, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const plans = [
  { key: 'free', price: 0, yearlyPrice: 0, features: 3 },
  { key: 'basic', price: 99, yearlyPrice: 950, features: 4 },
  { key: 'growth', price: 199, yearlyPrice: 1910, features: 6 },
  { key: 'pro', price: 349, yearlyPrice: 3350, features: 7 },
];

export default function Billing() {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const { subscription } = useSubscription();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [autoRenew, setAutoRenew] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [upgradeState, setUpgradeState] = useState({ loading: false, message: null });

  // Real current plan from the (auto-provisioned) subscription — defaults to Free.
  const currentPlanKey = selectCurrentPlanKey(subscription);
  const currentPlan = plans.find(p => p.key === currentPlanKey) || plans[0];

  const getPrice = (plan) => billingPeriod === 'monthly' ? plan.price : Math.round(plan.yearlyPrice / 12);

  const openUpgrade = (planKey) => {
    setUpgradeState({ loading: false, message: null });
    setUpgradeModal(planKey);
  };
  const closeUpgrade = () => {
    setUpgradeState({ loading: false, message: null });
    setUpgradeModal(null);
  };

  // Paid upgrades are blocked server-side (HTTP 501) until a payment-verified
  // path exists. Surface the backend's bilingual message rather than pretending
  // to check out.
  const handleUpgrade = async () => {
    setUpgradeState({ loading: true, message: null });
    const fallback = lang === 'ar'
      ? 'الترقية المدفوعة غير متاحة حاليًا'
      : 'Paid upgrades are currently unavailable';
    const pick = (data) => (lang === 'ar' ? (data.error || fallback) : (data.error_en || data.error || fallback));
    try {
      const res = await base44.functions.invoke('manage-subscription', { action: 'upgrade' });
      setUpgradeState({ loading: false, message: pick(res?.data || {}) });
    } catch (err) {
      const data = err?.response?.data || err?.data || {};
      setUpgradeState({ loading: false, message: pick(data) });
    }
  };

  const textColor = theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]';

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Upgrade Modal */}
      <AnimatePresence>
        {upgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeUpgrade}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl p-8 w-full max-w-md glass`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-heading text-2xl font-bold text-[#F7F5F0]`}>
                  {lang === 'ar' ? 'ترقية الخطة' : 'Upgrade Plan'}
                </h2>
                <button onClick={closeUpgrade} className={`p-1.5 hover:bg-white/5 rounded-lg transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]`}>
                  <p className={`text-sm font-medium mb-2 text-[#F7F5F0]/70`}>
                    {lang === 'ar' ? 'الخطة المختارة' : 'Selected Plan'}
                  </p>
                  <p className={`text-2xl font-bold font-heading mb-2 text-[#F7F5F0]`}>
                    {t(upgradeModal)}
                  </p>
                  <p className={`text-[#F7F5F0]/50`}>
                    {billingPeriod === 'monthly'
                      ? `${getPrice(plans.find(p => p.key === upgradeModal))} ${sar}/${lang === 'ar' ? 'شهر' : 'month'}`
                      : `${plans.find(p => p.key === upgradeModal)?.yearlyPrice} ${sar}/${lang === 'ar' ? 'سنة' : 'year'}`}
                  </p>
                </div>

                {upgradeState.message ? (
                  <div className={`p-4 rounded-xl border-l-4 border-[#C8972A] bg-[#C8972A]/5`}>
                    <p className={`text-sm text-[#F7F5F0]/80`}>{upgradeState.message}</p>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border-l-4 border-[#D95F3B] bg-[#D95F3B]/5`}>
                    <p className={`text-sm text-[#F7F5F0]/60`}>
                      {lang === 'ar'
                        ? 'الترقية المدفوعة قيد الإعداد. سيتم تفعيل الدفع قريبًا.'
                        : 'Paid upgrades are being set up. Checkout will be enabled soon.'}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleUpgrade}
                    disabled={upgradeState.loading}
                    className="w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all disabled:opacity-60"
                  >
                    {upgradeState.loading
                      ? (lang === 'ar' ? 'جارٍ التحقق...' : 'Checking...')
                      : (lang === 'ar' ? 'متابعة الدفع' : 'Proceed to Checkout')}
                  </button>
                  <button
                    onClick={closeUpgrade}
                    className={`w-full py-3 font-medium rounded-lg transition-all bg-white/[0.04] text-[#F7F5F0] hover:bg-white/[0.08]`}
                  >
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('billingPayments')}</h1>
          <label className="flex items-center gap-3 px-4 py-2 rounded-lg glass hover:bg-white/5 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={billingPeriod === 'yearly'}
              onChange={(e) => setBillingPeriod(e.target.checked ? 'yearly' : 'monthly')}
              className="w-4 h-4 rounded accent-[#D95F3B] cursor-pointer"
            />
            <span className="text-sm font-medium text-[#F7F5F0]">
              {lang === 'ar' ? 'دفع سنوي (20% خصم)' : 'Annual (20% off)'}
            </span>
          </label>
        </div>
       </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative rounded-2xl p-6 overflow-hidden border border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1F2E] via-[#0F1117] to-[#1C1F2E]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D95F3B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C8972A]/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#F7F5F0]/40 text-sm mb-1">{t('currentSubscription')}</p>
                <h2 className="font-heading text-2xl font-bold text-[#F7F5F0]">{t(currentPlan.key)}</h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <CreditCard className="w-6 h-6 text-[#C8972A]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
               <span className="text-4xl font-bold text-[#F7F5F0] font-heading">{getPrice(currentPlan)}</span>
               <span className="text-[#F7F5F0]/40 text-sm">{sar} {billingPeriod === 'monthly' ? t('mo') : `/${lang === 'ar' ? 'سنة' : 'year'}`}</span>
             </div>
             {currentPlan.key === 'free' ? (
               <div className="flex items-center gap-2 text-sm text-[#F7F5F0]/60">
                 <Info className="w-4 h-4 text-[#C8972A]" />
                 <span>{lang === 'ar' ? 'أنت على الخطة المجانية — لا يوجد دفع مطلوب.' : 'You are on the Free plan — no payment required.'}</span>
               </div>
             ) : (
               <div className="flex items-center gap-3">
                 <Power className="w-4 h-4 text-[#C8972A]" />
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={autoRenew}
                     onChange={(e) => setAutoRenew(e.target.checked)}
                     className="w-4 h-4 rounded accent-[#D95F3B] cursor-pointer"
                   />
                   <span className="text-sm text-[#F7F5F0]/70">
                     {lang === 'ar' ? 'تجديد تلقائي عند الانتهاء' : 'Auto-renew when subscription ends'}
                   </span>
                 </label>
               </div>
             )}
          </div>
        </div>
      </FadeIn>

      <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
        {plans.map(plan => {
          const isCurrent = plan.key === currentPlanKey;
          const isUpgrade = plan.price > currentPlan.price;
          return (
            <StaggerItem key={plan.key}>
              <div className={`glass rounded-2xl border p-5 h-full ${isCurrent ? 'border-[#D95F3B]/30 shadow-[0_0_30px_-12px_rgba(217,95,59,0.3)]' : 'border-white/[0.06]'}`}>
                <h3 className="font-heading font-semibold text-[#F7F5F0] mb-1">{t(plan.key)}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-[#F7F5F0] font-heading">{getPrice(plan)}</span>
                  <span className="text-xs text-[#F7F5F0]/30">
                    {sar}{billingPeriod === 'monthly' ? `/${lang === 'ar' ? 'شهر' : 'mo'}` : `/${lang === 'ar' ? 'سنة' : 'yr'}`}
                  </span>
                </div>
                {isCurrent ? (
                  <div className="px-3 py-2 bg-[#D95F3B]/10 text-[#D95F3B] text-xs font-medium rounded-lg text-center">{t('currentPlan')}</div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => openUpgrade(plan.key)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowUpRight className="w-3 h-3" />{t('upgrade')}
                  </button>
                ) : (
                  <button disabled className="w-full px-3 py-2 bg-white/[0.04] text-[#F7F5F0]/40 text-xs font-medium rounded-lg cursor-not-allowed">{t('downgrade')}</button>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('paymentHistory')}</h2>
          <div className={`flex flex-col items-center justify-center py-10 text-center ${textColor}`}>
            <CreditCard className="w-8 h-8 text-[#F7F5F0]/30 mb-3" />
            <p className="text-sm text-[#F7F5F0]/50">
              {lang === 'ar'
                ? 'لا توجد فواتير بعد. ستظهر سجلات الدفع هنا بعد أول اشتراك مدفوع.'
                : 'No invoices yet. Payment records will appear here after your first paid subscription.'}
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
