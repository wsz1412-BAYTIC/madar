import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

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
    contentStyle: { background: '#14161D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F7F5F0', fontSize: 12 },
    labelStyle: { color: 'rgba(247,245,240,0.5)' },
    cursor: { fill: 'rgba(255,255,255,0.03)' },
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('revenue')}</h1>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
        {summaryCards.map(card => (
          <StaggerItem key={card.key}>
            <div className="glass rounded-2xl p-5 hover:border-white/15 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D95F3B]/15 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/15">
                  <card.icon className="w-4 h-4 text-[#D95F3B]" />
                </div>
                <span className={`text-xs font-medium ${card.up ? 'text-emerald-400' : 'text-[#F7F5F0]/30'}`}>{card.trend}</span>
              </div>
              <div className="text-xl font-bold text-[#F7F5F0] font-heading">{card.value} <span className="text-xs font-normal text-[#F7F5F0]/30">{sar}</span></div>
              <div className="text-xs text-[#F7F5F0]/40 mt-1">{t(card.key)}</div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('revenueBreakdown')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBreakdown}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <Tooltip {...chartTooltip} formatter={(v) => [`${v.toLocaleString()} ${sar}`]} />
              <Bar dataKey="net" fill="#D95F3B" radius={[4, 4, 0, 0]} name={t('netRevenue')} />
              <Bar dataKey="fees" fill="#C8972A" radius={[4, 4, 0, 0]} name={t('platformFees')} />
              <Bar dataKey="cleaning" fill="rgba(247,245,240,0.1)" radius={[4, 4, 0, 0]} name={t('cleaningFees')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('projections')}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={allProjection}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8972A" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#C8972A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <Tooltip {...chartTooltip} formatter={(v) => v ? [`${v.toLocaleString()} ${sar}`] : ['-']} />
              <Area type="monotone" dataKey="actual" stroke="#D95F3B" strokeWidth={2} fill="none" name={lang === 'ar' ? 'فعلي' : 'Actual'} />
              <Area type="monotone" dataKey="projected" stroke="#C8972A" strokeWidth={2} strokeDasharray="6 4" fill="url(#projGrad)" name={lang === 'ar' ? 'متوقع' : 'Projected'} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>
    </div>
  );
}