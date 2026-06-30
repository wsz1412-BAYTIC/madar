import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { CreditCard, Check, ArrowUpRight } from 'lucide-react';

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
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('billingPayments')}</h1>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-[#1C1F2E] to-[#2a2d3e] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/50 text-sm mb-1">{t('currentSubscription')}</p>
            <h2 className="font-heading text-2xl font-bold">{t('growth')}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-[#C8972A]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">199</span>
          <span className="text-white/50 text-sm">{sar} {t('mo')}</span>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.key} className={`bg-white rounded-2xl border p-5 ${plan.current ? 'border-[#D95F3B] ring-1 ring-[#D95F3B]/20' : 'border-[#1C1F2E]/5'}`}>
            <h3 className="font-heading font-semibold text-[#1C1F2E] mb-1">{t(plan.key)}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xl font-bold text-[#1C1F2E]">{plan.price}</span>
              <span className="text-xs text-[#1C1F2E]/40">{sar}{t('mo')}</span>
            </div>
            {plan.current ? (
              <div className="px-3 py-2 bg-[#D95F3B]/10 text-[#D95F3B] text-xs font-medium rounded-lg text-center">{t('currentPlan')}</div>
            ) : plan.price > 199 ? (
              <button className="w-full px-3 py-2 bg-[#D95F3B] text-white text-xs font-medium rounded-lg hover:bg-[#D95F3B]/90 flex items-center justify-center gap-1">
                <ArrowUpRight className="w-3 h-3" />{t('upgrade')}
              </button>
            ) : (
              <button className="w-full px-3 py-2 bg-[#1C1F2E]/5 text-[#1C1F2E]/50 text-xs font-medium rounded-lg">{t('downgrade')}</button>
            )}
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <h2 className="font-heading font-semibold text-[#1C1F2E] mb-6">{t('paymentHistory')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1C1F2E]/5">
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium">{t('date')}</th>
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium">{t('amount')}</th>
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((p, i) => (
                <tr key={i} className="border-b border-[#1C1F2E]/5 last:border-0">
                  <td className="py-3 text-[#1C1F2E]/70">{p.date}</td>
                  <td className="py-3 font-medium text-[#1C1F2E]">{p.amount} {sar}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" />{t(p.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}