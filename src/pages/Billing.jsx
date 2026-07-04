import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { base44 } from '@/api/base44Client';
import { selectCurrentPlanKey } from '@/lib/subscriptionProvisioning';
import PlanBadge from '@/components/madar/PlanBadge';
import { FileText, Sparkles, Lock } from 'lucide-react';
import { CreditCard, ArrowUpRight, X, Power, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const plans = [
  {
    key: 'free', price: 0, yearlyPrice: 0,
    features: [
      { en: '1 property', ar: 'عقار واحد' },
      { en: 'Basic analytics', ar: 'تحليلات أساسية' },
      { en: 'Community support', ar: 'دعم المجتمع' },
    ],
  },
  {
    key: 'basic', price: 99, yearlyPrice: 950,
    features: [
      { en: 'Up to 5 properties', ar: 'حتى 5 عقارات' },
      { en: 'Full analytics', ar: 'تحليلات كاملة' },
      { en: 'Report downloads', ar: 'تنزيل التقارير' },
      { en: 'Email support', ar: 'دعم بالبريد' },
    ],
  },
  {
    key: 'growth', price: 199, yearlyPrice: 1910,
    features: [
      { en: 'Up to 25 properties', ar: 'حتى 25 عقارًا' },
      { en: 'AI price recommendations', ar: 'توصيات الأسعار بالذكاء الاصطناعي' },
      { en: 'Market & competitor data', ar: 'بيانات السوق والمنافسين' },
      { en: 'Priority support', ar: 'دعم ذو أولوية' },
    ],
  },
  {
    key: 'pro', price: 349, yearlyPrice: 3350,
    features: [
      { en: 'Up to 100 properties', ar: 'حتى 100 عقار' },
      { en: 'Everything in Growth', ar: 'كل ما في خطة النمو' },
      { en: 'Demand forecasting', ar: 'التنبؤ بالطلب' },
      { en: 'Dedicated support', ar: 'دعم مخصص' },
    ],
  },
];

export default function Billing() {
  const { t, lang } = useLang();
  const { subscription, trial, refresh } = useSubscription();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [autoRenew, setAutoRenew] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [upgradeState, setUpgradeState] = useState({ loading: false, message: null });
  const [trialState, setTrialState] = useState({ loading: false, error: null });
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Self-service trial activation — the server re-checks every rule
  // (no duplicate trial, no overwrite of paid plans, one trial per account).
  const activateTrial = async () => {
    setTrialState({ loading: true, error: null });
    try {
      const res = await base44.functions.invoke('manage-subscription', { action: 'activate_trial' });
      if (res?.data?.report) setReport(res.data.report);
      await refresh();
      setTrialState({ loading: false, error: null });
    } catch (err) {
      const data = err?.response?.data || err?.data || {};
      setTrialState({
        loading: false,
        error: (lang === 'ar' ? data.error : data.error_en) || data.error ||
          (lang === 'ar' ? 'تعذر تفعيل التجربة' : 'Could not activate the trial'),
      });
    }
  };

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const res = await base44.functions.invoke('manage-subscription', { action: 'get_report' });
      setReport(res?.data?.report || null);
    } catch {
      setReport(null);
    } finally {
      setReportLoading(false);
    }
  };

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
                <h2 className={`font-heading text-2xl font-bold text-foreground`}>
                  {lang === 'ar' ? 'ترقية الخطة' : 'Upgrade Plan'}
                </h2>
                <button onClick={closeUpgrade} className={`p-1.5 hover:bg-foreground/5 rounded-lg transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]`}>
                  <p className={`text-sm font-medium mb-2 text-foreground/70`}>
                    {lang === 'ar' ? 'الخطة المختارة' : 'Selected Plan'}
                  </p>
                  <p className={`text-2xl font-bold font-heading mb-2 text-foreground`}>
                    {t(upgradeModal)}
                  </p>
                  <p className={`text-foreground/50`}>
                    {billingPeriod === 'monthly'
                      ? `${getPrice(plans.find(p => p.key === upgradeModal))} ${sar}/${lang === 'ar' ? 'شهر' : 'month'}`
                      : `${plans.find(p => p.key === upgradeModal)?.yearlyPrice} ${sar}/${lang === 'ar' ? 'سنة' : 'year'}`}
                  </p>
                </div>

                {upgradeState.message ? (
                  <div className={`p-4 rounded-xl border-l-4 border-[#C8972A] bg-[#C8972A]/5`}>
                    <p className={`text-sm text-foreground/80`}>{upgradeState.message}</p>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border-l-4 border-[#D95F3B] bg-[#D95F3B]/5`}>
                    <p className={`text-sm text-foreground/60`}>
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
                    className={`w-full py-3 font-medium rounded-lg transition-all bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]`}
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
          <h1 className="font-heading text-3xl font-bold text-foreground">{t('billingPayments')}</h1>
          {/* Monthly / Annual segmented control */}
          <div className="relative flex items-center p-1 rounded-xl glass" role="group" aria-label={lang === 'ar' ? 'دورة الفوترة' : 'Billing cycle'}>
            {[
              { key: 'monthly', en: 'Monthly', ar: 'شهري' },
              { key: 'yearly', en: 'Annual −20%', ar: 'سنوي −20٪' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setBillingPeriod(opt.key)}
                aria-pressed={billingPeriod === opt.key}
                className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  billingPeriod === opt.key
                    ? 'text-white'
                    : 'text-foreground/55 hover:text-foreground'
                }`}
              >
                {billingPeriod === opt.key && (
                  <motion.span
                    layoutId="billing-cycle-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#D95F3B] to-[#C8972A] shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{lang === 'ar' ? opt.ar : opt.en}</span>
              </button>
            ))}
          </div>
        </div>
       </FadeIn>

      <FadeIn delay={0.1}>
        {/* Current plan: clean themed surface with a quiet accent edge — no
            heavy gradient panel, works identically in dark and light. */}
        <div className="relative rounded-2xl p-6 overflow-hidden glass border-s-4 border-s-[#D95F3B]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-foreground/40 text-sm mb-1">{t('currentSubscription')}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-heading text-2xl font-bold text-foreground">{t(currentPlan.key)}</h2>
                  <PlanBadge subscription={subscription} />
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10">
                <CreditCard className="w-6 h-6 text-[#C8972A]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
               <span className="text-4xl font-bold text-foreground font-heading">{getPrice(currentPlan)}</span>
               <span className="text-foreground/40 text-sm">{sar} {billingPeriod === 'monthly' ? t('mo') : `/${lang === 'ar' ? 'سنة' : 'year'}`}</span>
             </div>
             {trial?.state === 'trial_active' ? (
               <div className="flex items-center gap-2 text-sm text-foreground/70">
                 <Sparkles className="w-4 h-4 text-[#C8972A]" />
                 <span className="nums">
                   {lang === 'ar'
                     ? `تجربة النمو نشطة — متبقٍ ${trial.daysRemaining} ${trial.daysRemaining === 1 ? 'يوم' : 'أيام'}. فعّل اشتراكًا مدفوعًا للاستمرار بعدها.`
                     : `Growth trial active — ${trial.daysRemaining} ${trial.daysRemaining === 1 ? 'day' : 'days'} left. Activate a paid plan to keep access afterwards.`}
                 </span>
               </div>
             ) : trial?.state === 'trial_expired' ? (
               <div className="flex items-center gap-2 text-sm text-danger">
                 <Lock className="w-4 h-4" />
                 <span>{lang === 'ar' ? 'انتهت تجربتك — عدت إلى الخطة المجانية حتى يتم تأكيد الدفع.' : 'Your trial has ended — you are back on Free until payment is verified.'}</span>
               </div>
             ) : currentPlan.key === 'free' ? (
               <div className="space-y-3">
                 <div className="flex items-center gap-2 text-sm text-foreground/60">
                   <Info className="w-4 h-4 text-[#C8972A]" />
                   <span>{lang === 'ar' ? 'أنت على الخطة المجانية — لا يوجد دفع مطلوب.' : 'You are on the Free plan — no payment required.'}</span>
                 </div>
                 {!subscription?.trialUsedAt && (
                   <div>
                     <button
                       onClick={activateTrial}
                       disabled={trialState.loading}
                       className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all disabled:opacity-60"
                     >
                       <Sparkles className="w-4 h-4" />
                       {trialState.loading
                         ? (lang === 'ar' ? 'جارٍ التفعيل…' : 'Activating…')
                         : (lang === 'ar' ? 'تفعيل تجربة النمو 14 يومًا' : 'Activate 14-day Growth Trial')}
                     </button>
                     {trialState.error && <p className="text-xs text-danger mt-2">{trialState.error}</p>}
                   </div>
                 )}
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
                   <span className="text-sm text-foreground/70">
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
            <StaggerItem key={plan.key} className="h-full">
              <div className={`glass rounded-2xl border p-5 h-full flex flex-col ${isCurrent ? 'border-[#D95F3B]/40' : 'border-foreground/[0.06]'}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-heading font-semibold text-foreground">{t(plan.key)}</h3>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D95F3B]/15 text-[#D95F3B]">
                      {t('currentPlan')}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-foreground font-heading nums">{getPrice(plan)}</span>
                  <span className="text-xs text-foreground/40">
                    {sar}{billingPeriod === 'monthly' ? `/${lang === 'ar' ? 'شهر' : 'mo'}` : `/${lang === 'ar' ? 'سنة' : 'yr'}`}
                  </span>
                </div>
                {/* Compact feature comparison */}
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/65">
                      <Check className="w-3.5 h-3.5 mt-[1px] shrink-0 text-success" />
                      <span>{lang === 'ar' ? f.ar : f.en}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="h-9 flex items-center justify-center bg-[#D95F3B]/10 text-[#D95F3B] text-xs font-medium rounded-lg">{t('currentPlan')}</div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => openUpgrade(plan.key)}
                    className="h-9 w-full bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowUpRight className="w-3 h-3" />{t('upgrade')}
                  </button>
                ) : (
                  <button disabled className="h-9 w-full bg-foreground/[0.05] text-foreground/40 text-xs font-medium rounded-lg cursor-not-allowed">{t('downgrade')}</button>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Madar Quick Report — top 3 fixes on trial/free, full list when paid */}
      <FadeIn delay={0.25}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D95F3B]/15 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/15">
                <FileText className="w-4 h-4 text-[#D95F3B]" />
              </div>
              <h2 className="font-heading font-semibold text-foreground">
                {lang === 'ar' ? 'تقرير مدار السريع' : 'Madar Quick Report'}
              </h2>
            </div>
            <button
              onClick={loadReport}
              disabled={reportLoading}
              className="px-4 h-9 rounded-lg bg-foreground/[0.05] border border-foreground/[0.1] text-xs font-medium text-foreground/70 hover:text-foreground transition-all disabled:opacity-60"
            >
              {reportLoading
                ? (lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…')
                : (lang === 'ar' ? (report ? 'تحديث التقرير' : 'عرض التقرير') : (report ? 'Refresh report' : 'View report'))}
            </button>
          </div>

          {report ? (
            <div className="space-y-4">
              <p className="text-sm text-foreground/60">{lang === 'ar' ? report.summary.ar : report.summary.en}</p>
              <ol className="space-y-3">
                {report.issues.map((issue, i) => (
                  <li key={issue.id} className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
                    <p className="text-sm font-semibold text-foreground mb-1 nums">
                      {i + 1}. {lang === 'ar' ? issue.title.ar : issue.title.en}
                    </p>
                    <p className="text-xs text-foreground/65 mb-1.5">{lang === 'ar' ? issue.fix.ar : issue.fix.en}</p>
                    <p className="text-xs text-success flex items-center gap-1">
                      <Check className="w-3 h-3" />{lang === 'ar' ? issue.benefit.ar : issue.benefit.en}
                    </p>
                  </li>
                ))}
              </ol>
              {report.lockedCount > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#C8972A]/10 border border-[#C8972A]/25 text-xs text-foreground/70">
                  <Lock className="w-3.5 h-3.5 text-[#C8972A] shrink-0" />
                  {lang === 'ar'
                    ? `${report.lockedCount} ملاحظات إضافية تُفتح مع الاشتراك المدفوع.`
                    : `${report.lockedCount} more finding${report.lockedCount === 1 ? '' : 's'} unlock with a paid plan.`}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-foreground/45">
              {lang === 'ar'
                ? 'أهم 3 إصلاحات لعقاراتك بلغة بسيطة — يُنشأ تلقائيًا عند تفعيل التجربة أو عند الطلب.'
                : 'Your top 3 property fixes in plain language — generated automatically on trial activation, or on demand.'}
            </p>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-foreground mb-6">{t('paymentHistory')}</h2>
          <div className="flex flex-col items-center justify-center py-10 text-center text-foreground">
            <CreditCard className="w-8 h-8 text-foreground/30 mb-3" />
            <p className="text-sm text-foreground/50">
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
