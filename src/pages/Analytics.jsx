import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';

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
    contentStyle: { background: '#14161D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F7F5F0', fontSize: 12 },
    labelStyle: { color: 'rgba(247,245,240,0.5)' },
    cursor: { fill: 'rgba(255,255,255,0.03)' },
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('analytics')}</h1>
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'text-white' : 'text-[#F7F5F0]/40 hover:text-[#F7F5F0]'}`}>
                {period === p && <motion.div layoutId="periodPill" className="absolute inset-0 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-lg" />}
                <span className="relative z-10">{t(p)}</span>
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-1">{t('revenueOverTime')}</h2>
          <p className="text-xs text-[#F7F5F0]/30 mb-6">{lang === 'ar' ? 'ر.س' : 'SAR'}</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D95F3B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D95F3B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <Tooltip {...chartTooltip} formatter={(v) => [`${v.toLocaleString()} ${lang === 'ar' ? 'ر.س' : 'SAR'}`, lang === 'ar' ? 'الإيرادات' : 'Revenue']} />
              <Area type="monotone" dataKey="value" stroke="#D95F3B" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-6">
        <FadeIn delay={0.2}>
          <div className="glass rounded-2xl p-6 h-full">
            <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('occupancyOverTime')}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={occupancyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip {...chartTooltip} formatter={(v) => [`${v}%`, lang === 'ar' ? 'الإشغال' : 'Occupancy']} />
                <Line type="monotone" dataKey="value" stroke="#C8972A" strokeWidth={2} dot={{ fill: '#C8972A', strokeWidth: 0, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="glass rounded-2xl p-6 h-full">
            <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('competitorComparison')}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={competitorData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="you" fill="#D95F3B" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'أنت' : 'You'} />
                <Bar dataKey="competitor" fill="#C8972A" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'المنافس' : 'Competitor'} />
                <Bar dataKey="market" fill="rgba(247,245,240,0.1)" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'السوق' : 'Market'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}