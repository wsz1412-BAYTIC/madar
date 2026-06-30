import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import { useMadarAuth } from '@/contexts/AuthContext';
import { Calculator as CalcIcon, TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react';

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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C8972A]/10 flex items-center justify-center">
          <CalcIcon className="w-5 h-5 text-[#C8972A]" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('investmentCalculator')}</h1>
          <p className="text-sm text-[#1C1F2E]/50">{t('calcDesc')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6 space-y-5">
        {[
          { key: 'propertyValue', val: form.propertyValue },
          { key: 'monthlyRent', val: form.monthlyRent },
          { key: 'occupancyEst', val: form.occupancy },
          { key: 'monthlyExpenses', val: form.expenses },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t(field.key)}</label>
            <input
              type="number"
              value={field.val}
              onChange={e => update(field.key === 'propertyValue' ? 'propertyValue' : field.key === 'monthlyRent' ? 'monthlyRent' : field.key === 'occupancyEst' ? 'occupancy' : 'expenses', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F7F5F0] border border-[#1C1F2E]/5 text-sm text-[#1C1F2E] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]"
              dir="ltr"
            />
          </div>
        ))}
        <button onClick={calculate} className="w-full py-3 bg-[#D95F3B] text-white font-medium rounded-xl text-sm hover:bg-[#D95F3B]/90 transition-all">
          {t('calculate')}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'annualRevenue', value: result.annualRevenue.toLocaleString(), icon: DollarSign, color: '#D95F3B' },
            { key: 'annualExpenses', value: result.annualExpenses.toLocaleString(), icon: BarChart3, color: '#1C1F2E' },
            { key: 'annualProfit', value: result.annualProfit.toLocaleString(), icon: TrendingUp, color: '#C8972A' },
            { key: 'roi', value: `${result.roi}%`, icon: TrendingUp, color: '#D95F3B' },
          ].map(card => (
            <div key={card.key} className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${card.color}10` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div className="text-xl font-bold text-[#1C1F2E] font-heading">
                {card.value} {card.key !== 'roi' && <span className="text-xs font-normal text-[#1C1F2E]/40">{sar}</span>}
              </div>
              <div className="text-xs text-[#1C1F2E]/50 mt-1">{t(card.key)}</div>
            </div>
          ))}
          <div className="col-span-2 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/70">{t('paybackPeriod')}</span>
            </div>
            <div className="text-3xl font-bold font-heading">{result.payback} <span className="text-lg font-normal text-white/70">{t('years')}</span></div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F5F0]">
        <PublicNavbar />
        <div className="pt-24 pb-16 px-4">{content}</div>
      </div>
    );
  }

  return content;
}