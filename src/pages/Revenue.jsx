import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const monthlyBreakdown = [
  { month: 'Jan', gross: 32000, fees: 4800, cleaning: 2400, net: 24800 },
  { month: 'Feb', gross: 28000, fees: 4200, cleaning: 2100, net: 21700 },
  { month: 'Mar', gross: 35000, fees: 5250, cleaning: 2600, net: 27150 },
  { month: 'Apr', gross: 40000, fees: 6000, cleaning: 3000, net: 31000 },
  { month: 'May', gross: 38000, fees: 5700, cleaning: 2850, net: 29450 },
  { month: 'Jun', gross: 45000, fees: 6750, cleaning: 3375, net: 34875 },
];

const projectionData = [
  { month: 'Jul', actual: null, projected: 48000 },
  { month: 'Aug', actual: null, projected: 52000 },
  { month: 'Sep', actual: null, projected: 46000 },
  { month: 'Oct', actual: null, projected: 50000 },
  { month: 'Nov', actual: null, projected: 54000 },
  { month: 'Dec', actual: null, projected: 58000 },
];

const allProjection = [
  ...monthlyBreakdown.map(m => ({ month: m.month, actual: m.gross, projected: null })),
  ...projectionData,
];

const summaryCards = [
  { key: 'totalEarnings', value: '218,000', icon: DollarSign, trend: '+18%', up: true },
  { key: 'platformFees', value: '32,700', icon: TrendingDown, trend: '15%', up: false },
  { key: 'cleaningFees', value: '16,325', icon: Minus, trend: '7.5%', up: false },
  { key: 'netRevenue', value: '168,975', icon: TrendingUp, trend: '+22%', up: true },
];

export default function Revenue() {
  const { t, lang } = useLang();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  const chartTooltip = {
    contentStyle: { background: '#1C1F2E', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 },
    labelStyle: { color: '#ffffff80' },
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('revenue')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.key} className="bg-white rounded-2xl p-5 border border-[#1C1F2E]/5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#D95F3B]/10 flex items-center justify-center">
                <card.icon className="w-4 h-4 text-[#D95F3B]" />
              </div>
              <span className={`text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-[#1C1F2E]/40'}`}>{card.trend}</span>
            </div>
            <div className="text-xl font-bold text-[#1C1F2E] font-heading">{card.value} <span className="text-xs font-normal text-[#1C1F2E]/40">{sar}</span></div>
            <div className="text-xs text-[#1C1F2E]/50 mt-1">{t(card.key)}</div>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <h2 className="font-heading font-semibold text-[#1C1F2E] mb-6">{t('revenueBreakdown')}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyBreakdown}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <Tooltip {...chartTooltip} formatter={(v) => [`${v.toLocaleString()} ${sar}`]} />
            <Bar dataKey="net" fill="#D95F3B" radius={[4, 4, 0, 0]} name={t('netRevenue')} />
            <Bar dataKey="fees" fill="#C8972A" radius={[4, 4, 0, 0]} name={t('platformFees')} />
            <Bar dataKey="cleaning" fill="#1C1F2E20" radius={[4, 4, 0, 0]} name={t('cleaningFees')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Projections */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <h2 className="font-heading font-semibold text-[#1C1F2E] mb-6">{t('projections')}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={allProjection}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8972A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#C8972A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <Tooltip {...chartTooltip} formatter={(v) => v ? [`${v.toLocaleString()} ${sar}`] : ['-']} />
            <Area type="monotone" dataKey="actual" stroke="#D95F3B" strokeWidth={2} fill="none" name={lang === 'ar' ? 'فعلي' : 'Actual'} />
            <Area type="monotone" dataKey="projected" stroke="#C8972A" strokeWidth={2} strokeDasharray="6 4" fill="url(#projGrad)" name={lang === 'ar' ? 'متوقع' : 'Projected'} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}