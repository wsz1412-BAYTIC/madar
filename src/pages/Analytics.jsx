import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

const revenueData = [
  { month: 'Jan', value: 32000 }, { month: 'Feb', value: 28000 }, { month: 'Mar', value: 35000 },
  { month: 'Apr', value: 40000 }, { month: 'May', value: 38000 }, { month: 'Jun', value: 45000 },
  { month: 'Jul', value: 52000 }, { month: 'Aug', value: 48000 }, { month: 'Sep', value: 42000 },
  { month: 'Oct', value: 46000 }, { month: 'Nov', value: 50000 }, { month: 'Dec', value: 55000 },
];

const occupancyData = [
  { month: 'Jan', value: 65 }, { month: 'Feb', value: 58 }, { month: 'Mar', value: 72 },
  { month: 'Apr', value: 80 }, { month: 'May', value: 75 }, { month: 'Jun', value: 82 },
  { month: 'Jul', value: 90 }, { month: 'Aug', value: 85 }, { month: 'Sep', value: 78 },
  { month: 'Oct', value: 82 }, { month: 'Nov', value: 88 }, { month: 'Dec', value: 92 },
];

const competitorData = [
  { name: 'Studio', you: 320, competitor: 350, market: 310 },
  { name: '1BR', you: 480, competitor: 520, market: 460 },
  { name: '2BR', you: 650, competitor: 700, market: 620 },
  { name: '3BR', you: 850, competitor: 900, market: 800 },
  { name: 'Villa', you: 1200, competitor: 1350, market: 1100 },
];

const periods = ['last30Days', 'last90Days', 'lastYear'];

export default function Analytics() {
  const { t, lang } = useLang();
  const [period, setPeriod] = useState('lastYear');

  const chartTooltip = {
    contentStyle: { background: '#1C1F2E', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 },
    labelStyle: { color: '#ffffff80' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('analytics')}</h1>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-[#1C1F2E]/5 p-1">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-[#1C1F2E] text-white' : 'text-[#1C1F2E]/50 hover:text-[#1C1F2E]'}`}>
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <h2 className="font-heading font-semibold text-[#1C1F2E] mb-1">{t('revenueOverTime')}</h2>
        <p className="text-xs text-[#1C1F2E]/40 mb-6">{lang === 'ar' ? 'ر.س' : 'SAR'}</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D95F3B" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D95F3B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <Tooltip {...chartTooltip} formatter={(v) => [`${v.toLocaleString()} ${lang === 'ar' ? 'ر.س' : 'SAR'}`, lang === 'ar' ? 'الإيرادات' : 'Revenue']} />
            <Area type="monotone" dataKey="value" stroke="#D95F3B" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
          <h2 className="font-heading font-semibold text-[#1C1F2E] mb-6">{t('occupancyOverTime')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={occupancyData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip {...chartTooltip} formatter={(v) => [`${v}%`, lang === 'ar' ? 'الإشغال' : 'Occupancy']} />
              <Line type="monotone" dataKey="value" stroke="#C8972A" strokeWidth={2} dot={{ fill: '#C8972A', strokeWidth: 0, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor Comparison */}
        <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
          <h2 className="font-heading font-semibold text-[#1C1F2E] mb-6">{t('competitorComparison')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={competitorData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
              <Tooltip {...chartTooltip} />
              <Bar dataKey="you" fill="#D95F3B" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'أنت' : 'You'} />
              <Bar dataKey="competitor" fill="#C8972A" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'المنافس' : 'Competitor'} />
              <Bar dataKey="market" fill="#1C1F2E20" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'السوق' : 'Market'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}