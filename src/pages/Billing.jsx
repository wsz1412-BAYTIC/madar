import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { CreditCard, Check, ArrowUpRight } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const plans = [
  { key: 'free', price: 0, features: 3 },
  { key: 'basic', price: 99, features: 4 },
  { key: 'growth', price: 199, features: 6, current: true },
  { key: 'pro', price: 349, features: 7 },
];

const paymentHistory = [
  { date: '2025-06-01', amount: 199, status: 'paid' },
  { date: '2025-05-01', amount: 199, status: 'paid' },
  { date: '2025-04-01', amount: 199, status: 'paid' },
  { date: '2025-03-01', amount: 99, status: 'paid' },
  { date: '2025-02-01', amount: 99, status: 'paid' },
];

export default function Billing() {
  const { t, lang } = useLang();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  return (
    <div className="space-y-8 max-w-3xl">
      <FadeIn>
        <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('billingPayments')}</h1>
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
                <h2 className="font-heading text-2xl font-bold text-[#F7F5F0]">{t('growth')}</h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <CreditCard className="w-6 h-6 text-[#C8972A]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#F7F5F0] font-heading">199</span>
              <span className="text-[#F7F5F0]/40 text-sm">{sar} {t('mo')}</span>
            </div>
          </div>
        </div>
      </FadeIn>

      <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
        {plans.map(plan => (
          <StaggerItem key={plan.key}>
            <div className={`glass rounded-2xl border p-5 h-full ${plan.current ? 'border-[#D95F3B]/30 shadow-[0_0_30px_-12px_rgba(217,95,59,0.3)]' : 'border-white/[0.06]'}`}>
              <h3 className="font-heading font-semibold text-[#F7F5F0] mb-1">{t(plan.key)}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-[#F7F5F0] font-heading">{plan.price}</span>
                <span className="text-xs text-[#F7F5F0]/30">{sar}{t('mo')}</span>
              </div>
              {plan.current ? (
                <div className="px-3 py-2 bg-[#D95F3B]/10 text-[#D95F3B] text-xs font-medium rounded-lg text-center">{t('currentPlan')}</div>
              ) : plan.price > 199 ? (
                <button className="w-full px-3 py-2 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 flex items-center justify-center gap-1 transition-all">
                  <ArrowUpRight className="w-3 h-3" />{t('upgrade')}
                </button>
              ) : (
                <button className="w-full px-3 py-2 bg-white/[0.04] text-[#F7F5F0]/40 text-xs font-medium rounded-lg hover:bg-white/[0.08] transition-all">{t('downgrade')}</button>
              )}
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('paymentHistory')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium">{t('date')}</th>
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium">{t('amount')}</th>
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p, i) => (
                  <tr key={i} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-3 text-[#F7F5F0]/60">{p.date}</td>
                    <td className="py-3 font-medium text-[#F7F5F0]">{p.amount} {sar}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" />{t(p.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}