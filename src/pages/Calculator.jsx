import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import { useMadarAuth } from '@/contexts/AuthContext';
import { Calculator as CalcIcon, TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react';
import { FadeIn } from '@/components/madar/Motion';

export default function Calculator() {
  const { t, lang } = useLang();
  const { isAuthenticated } = useMadarAuth();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  const [form, setForm] = useState({ propertyValue: 800000, monthlyRent: 8000, occupancy: 75, expenses: 2500 });
  const [result, setResult] = useState(null);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: Number(val) }));

  const calculate = () => {
    const annualRevenue = form.monthlyRent * 12 * (form.occupancy / 100);
    const annualExpenses = form.expenses * 12;
    const annualProfit = annualRevenue - annualExpenses;
    const roi = ((annualProfit / form.propertyValue) * 100).toFixed(1);
    const payback = (form.propertyValue / annualProfit).toFixed(1);
    setResult({ annualRevenue, annualExpenses, annualProfit, roi, payback });
  };

  const content = (
    <div className="space-y-8 max-w-2xl mx-auto">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8972A]/20 to-[#D95F3B]/10 flex items-center justify-center border border-[#C8972A]/20">
            <CalcIcon className="w-5 h-5 text-[#C8972A]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('investmentCalculator')}</h1>
            <p className="text-sm text-[#F7F5F0]/40">{t('calcDesc')}</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-6 space-y-5">
          {[
            { key: 'propertyValue', val: form.propertyValue },
            { key: 'monthlyRent', val: form.monthlyRent },
            { key: 'occupancyEst', val: form.occupancy },
            { key: 'monthlyExpenses', val: form.expenses },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[#F7F5F0]/60 mb-1.5">{t(field.key)}</label>
              <input
                type="number"
                value={field.val}
                onChange={e => update(field.key === 'propertyValue' ? 'propertyValue' : field.key === 'monthlyRent' ? 'monthlyRent' : field.key === 'occupancyEst' ? 'occupancy' : 'expenses', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F7F5F0] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50"
                dir="ltr"
              />
            </div>
          ))}
          <button onClick={calculate} className="group relative w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl text-sm hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all overflow-hidden">
            <span className="relative z-10">{t('calculate')}</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>
      </FadeIn>

      {result && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'annualRevenue', value: result.annualRevenue.toLocaleString(), icon: DollarSign, color: '#D95F3B' },
            { key: 'annualExpenses', value: result.annualExpenses.toLocaleString(), icon: BarChart3, color: '#C8972A' },
            { key: 'annualProfit', value: result.annualProfit.toLocaleString(), icon: TrendingUp, color: '#D95F3B' },
            { key: 'roi', value: `${result.roi}%`, icon: TrendingUp, color: '#C8972A' },
          ].map(card => (
            <div key={card.key} className="glass rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div className="text-xl font-bold text-[#F7F5F0] font-heading">
                {card.value} {card.key !== 'roi' && <span className="text-xs font-normal text-[#F7F5F0]/30">{sar}</span>}
              </div>
              <div className="text-xs text-[#F7F5F0]/40 mt-1">{t(card.key)}</div>
            </div>
          ))}
          <div className="col-span-2 relative rounded-2xl p-6 overflow-hidden border border-white/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D95F3B] to-[#C8972A]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">{t('paybackPeriod')}</span>
              </div>
              <div className="text-4xl font-bold font-heading text-white">{result.payback} <span className="text-lg font-normal text-white/70">{t('years')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0B10]">
        <PublicNavbar />
        <div className="pt-24 pb-16 px-4">{content}</div>
      </div>
    );
  }

  return content;
}