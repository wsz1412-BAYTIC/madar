import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import { useAuth } from '@/lib/AuthContext';
import { Calculator as CalcIcon, TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react';
import { FadeIn } from '@/components/madar/Motion';

export default function Calculator() {
  const { t, lang } = useLang();
  const { isAuthenticated } = useAuth();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  const [form, setForm] = useState({ propertyValue: 800000, monthlyRent: 8000, occupancy: 75, expenses: 2500 });
  const [result, setResult] = useState(null);
  const [dynForm, setDynForm] = useState({ city: 'riyadh', type: 'apartment', bedrooms: 2 });
  const [dynResult, setDynResult] = useState(null);

  // Market data: monthly rent estimates by city, property type, and bedrooms
  const marketData = {
    riyadh: { apartment: { 1: 2500, 2: 4000, 3: 6500, 4: 8500 }, villa: { 2: 5000, 3: 8000, 4: 10000, 5: 13000 } },
    jeddah: { apartment: { 1: 2200, 2: 3500, 3: 5500, 4: 7500 }, villa: { 2: 4500, 3: 7000, 4: 9000, 5: 11500 } },
    dammam: { apartment: { 1: 1800, 2: 3000, 3: 4800, 4: 6500 }, villa: { 2: 3800, 3: 6000, 4: 8000, 5: 10000 } },
  };

  const estimateRent = (city, type, bedrooms) => marketData[city]?.[type]?.[bedrooms] || 4000;

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: Number(val) }));
  const updateDyn = (key, val) => setDynForm(prev => ({ ...prev, [key]: val }));

  const calculate = () => {
    const annualRevenue = form.monthlyRent * 12 * (form.occupancy / 100);
    const annualExpenses = form.expenses * 12;
    const annualProfit = annualRevenue - annualExpenses;
    const roi = ((annualProfit / form.propertyValue) * 100).toFixed(1);
    const payback = (form.propertyValue / annualProfit).toFixed(1);
    setResult({ annualRevenue, annualExpenses, annualProfit, roi, payback });
  };

  const calculateDynamic = () => {
    const estimatedRent = estimateRent(dynForm.city, dynForm.type, dynForm.bedrooms);
    const propertyValue = dynForm.type === 'apartment' ? 500000 : 800000;
    const expenses = 2500;
    const occupancy = 80;
    const annualRevenue = estimatedRent * 12 * (occupancy / 100);
    const annualExpenses = expenses * 12;
    const annualProfit = annualRevenue - annualExpenses;
    const roi = ((annualProfit / propertyValue) * 100).toFixed(1);
    setDynResult({ estimatedRent, annualRevenue, annualExpenses, annualProfit, roi, propertyValue });
  };

  const content = (
    <div className="space-y-8 max-w-2xl mx-auto">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ADDFF1]/20 to-[#1B84C4]/10 flex items-center justify-center border border-[#ADDFF1]/20">
            <CalcIcon className="w-5 h-5 text-[#0F6BA8]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{t('investmentCalculator')}</h1>
            <p className="text-sm text-foreground/40">{t('calcDesc')}</p>
          </div>
        </div>
      </FadeIn>

      {/* Dynamic Revenue Estimator */}
      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">{lang === 'ar' ? 'مقدّر الإيرادات الديناميكي' : 'Dynamic Revenue Estimator'}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-1.5">{lang === 'ar' ? 'المدينة' : 'City'}</label>
              <select value={dynForm.city} onChange={e => updateDyn('city', e.target.value)} className="w-full px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20">
                <option value="riyadh">{lang === 'ar' ? 'الرياض' : 'Riyadh'}</option>
                <option value="jeddah">{lang === 'ar' ? 'جدة' : 'Jeddah'}</option>
                <option value="dammam">{lang === 'ar' ? 'الدمام' : 'Dammam'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-1.5">{lang === 'ar' ? 'النوع' : 'Type'}</label>
              <select value={dynForm.type} onChange={e => updateDyn('type', e.target.value)} className="w-full px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20">
                <option value="apartment">{lang === 'ar' ? 'شقة' : 'Apartment'}</option>
                <option value="villa">{lang === 'ar' ? 'فيلا' : 'Villa'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-1.5">{lang === 'ar' ? 'غرف النوم' : 'Bedrooms'}</label>
              <select value={dynForm.bedrooms} onChange={e => updateDyn('bedrooms', Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <button onClick={calculateDynamic} className="group relative w-full py-2.5 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-xl text-sm hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all overflow-hidden">
            <span className="relative z-10">{t('calculate')}</span>
            <div className="absolute inset-0 bg-foreground/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>
      </FadeIn>

      {dynResult && (
        <FadeIn delay={0.2}>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">{lang === 'ar' ? 'المقارنة المتوقعة' : 'Projected Returns Comparison'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                <div className="text-xs text-foreground/40 mb-1">{lang === 'ar' ? 'الإيجار الشهري المقدّر' : 'Estimated Monthly Rent'}</div>
                <div className="text-2xl font-bold text-[#1B84C4] font-heading">{dynResult.estimatedRent.toLocaleString()} {sar}</div>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                <div className="text-xs text-foreground/40 mb-1">{lang === 'ar' ? 'الإيرادات السنوية' : 'Annual Revenue'}</div>
                <div className="text-2xl font-bold text-[#0F6BA8] font-heading">{dynResult.annualRevenue.toLocaleString()} {sar}</div>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                <div className="text-xs text-foreground/40 mb-1">{lang === 'ar' ? 'الربح السنوي' : 'Annual Profit'}</div>
                <div className="text-2xl font-bold text-[#1B84C4] font-heading">{dynResult.annualProfit.toLocaleString()} {sar}</div>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                <div className="text-xs text-foreground/40 mb-1">{lang === 'ar' ? 'العائد على الاستثمار' : 'ROI'}</div>
                <div className="text-2xl font-bold text-[#0F6BA8] font-heading">{dynResult.roi}%</div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-heading text-lg font-semibold text-foreground">{lang === 'ar' ? 'حاسبة الاستثمار' : 'Investment Calculator'}</h2>
          {[
             { key: 'propertyValue', val: form.propertyValue },
             { key: 'monthlyRent', val: form.monthlyRent },
             { key: 'occupancyEst', val: form.occupancy },
             { key: 'monthlyExpenses', val: form.expenses },
           ].map(field => (
             <div key={field.key}>
               <label className="block text-sm font-medium text-foreground/60 mb-1.5">{t(field.key)}</label>
               <input
                 type="number"
                 value={field.val}
                 onChange={e => update(field.key === 'propertyValue' ? 'propertyValue' : field.key === 'monthlyRent' ? 'monthlyRent' : field.key === 'occupancyEst' ? 'occupancy' : 'expenses', e.target.value)}
                 className="w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20 focus:border-[#1B84C4]/50"
                 dir="ltr"
               />
             </div>
           ))}
           <button onClick={calculate} className="group relative w-full py-3 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-xl text-sm hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all overflow-hidden">
             <span className="relative z-10">{t('calculate')}</span>
             <div className="absolute inset-0 bg-foreground/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
           </button>
         </div>
       </FadeIn>

      {result && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'annualRevenue', value: result.annualRevenue.toLocaleString(), icon: DollarSign, color: '#1B84C4' },
            { key: 'annualExpenses', value: result.annualExpenses.toLocaleString(), icon: BarChart3, color: '#0F6BA8' },
            { key: 'annualProfit', value: result.annualProfit.toLocaleString(), icon: TrendingUp, color: '#1B84C4' },
            { key: 'roi', value: `${result.roi}%`, icon: TrendingUp, color: '#0F6BA8' },
          ].map(card => (
            <div key={card.key} className="glass rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div className="text-xl font-bold text-foreground font-heading">
                {card.value} {card.key !== 'roi' && <span className="text-xs font-normal text-foreground/30">{sar}</span>}
              </div>
              <div className="text-xs text-foreground/40 mt-1">{t(card.key)}</div>
            </div>
          ))}
          <div className="col-span-2 relative rounded-2xl p-6 overflow-hidden border border-foreground/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00548C] to-[#003152]" />
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
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="pt-24 pb-16 px-4">{content}</div>
      </div>
    );
  }

  return content;
}