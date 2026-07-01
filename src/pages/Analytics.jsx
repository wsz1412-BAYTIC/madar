import React, { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3 } from 'lucide-react';
import DailyRateComparisonTable from '@/components/madar/DailyRateComparisonTable';

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

const kpiCards = [
  { key: 'totalRevenue', value: '487,000', icon: DollarSign, change: '+18%', up: true, gradient: 'from-[#D95F3B]/20 to-[#D95F3B]/5', iconColor: 'text-[#D95F3B]', border: 'border-[#D95F3B]/20' },
  { key: 'occupancyRate', value: '79%', icon: Percent, change: '+5%', up: true, gradient: 'from-[#C8972A]/20 to-[#C8972A]/5', iconColor: 'text-[#C8972A]', border: 'border-[#C8972A]/20' },
  { key: 'avgNightlyRate', value: '892', icon: BarChart3, change: '+12%', up: true, gradient: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
];

function ChartSkeleton({ height = 280 }) {
  return (
    <div className="flex items-end gap-2 px-2" style={{ height }}>
      {[40, 65, 50, 80, 60, 90, 70, 85, 55, 75, 95, 68].map((h, i) => (
        <div key={i} className="flex-1 relative overflow-hidden rounded-t-lg bg-white/[0.04]" style={{ height: `${h}%` }}>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8972A]/15 to-transparent"
          />
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { t, lang } = useLang();
  const [period, setPeriod] = useState('lastYear');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, [period]);

  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  const chartTooltip = {
    contentStyle: {
      background: 'rgba(10,11,16,0.95)',
      border: '1px solid rgba(217,95,59,0.15)',
      borderRadius: 14,
      color: '#F7F5F0',
      fontSize: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
    },
    labelStyle: { color: 'rgba(247,245,240,0.4)', marginBottom: 4 },
    cursor: { fill: 'rgba(217,95,59,0.04)', stroke: 'rgba(217,95,59,0.1)' },
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/20">
              <BarChart3 className="w-5 h-5 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('analytics')}</h1>
          </div>
          <div className="flex items-center gap-1 glass rounded-full p-1">
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`relative px-5 py-2 rounded-full text-xs font-medium transition-all duration-500 ${period === p ? 'text-white' : 'text-[#F7F5F0]/40 hover:text-[#F7F5F0]'}`}>
                {period === p && <motion.div layoutId="periodPill" className="absolute inset-0 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <span className="relative z-10">{t(p)}</span>
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* KPI Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4" stagger={0.1}>
        {kpiCards.map(card => (
          <StaggerItem key={card.key}>
            <div className={`relative glass rounded-2xl p-6 overflow-hidden border ${card.border} hover:border-white/20 transition-all duration-500 group`}>
              <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${card.gradient} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center border ${card.border}`}>
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#F7F5F0] font-heading">
                  {card.value}{card.key === 'avgNightlyRate' && <span className="text-sm font-normal text-[#F7F5F0]/30 ml-1">{sar}</span>}
                </div>
                <div className="text-xs text-[#F7F5F0]/40 mt-1">{t(card.key)}</div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Revenue Chart */}
      <FadeIn delay={0.2}>
        <div className="relative glass rounded-3xl p-8 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#D95F3B]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading font-semibold text-[#F7F5F0] text-lg">{t('revenueOverTime')}</h2>
                <p className="text-xs text-[#F7F5F0]/30 mt-1">{sar}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D95F3B] shadow-[0_0_8px_rgba(217,95,59,0.6)]" />
                <span className="text-xs text-[#F7F5F0]/40">{lang === 'ar' ? 'الإيرادات' : 'Revenue'}</span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="rev-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <ChartSkeleton height={300} />
                </motion.div>
              ) : (
                <motion.div key="rev-chart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D95F3B" stopOpacity={0.4} />
                          <stop offset="50%" stopColor="#D95F3B" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#D95F3B" stopOpacity={0} />
                        </linearGradient>
                        <filter id="revGlow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.25)', fontSize: 11 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.25)', fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip {...chartTooltip} formatter={(v) => [`${v.toLocaleString()} ${sar}`, lang === 'ar' ? 'الإيرادات' : 'Revenue']} />
                      <Area type="monotone" dataKey="value" stroke="#D95F3B" strokeWidth={2.5} fill="url(#revGrad)" filter="url(#revGlow)" animationDuration={1500} animationEasing="ease-out" dot={{ fill: '#D95F3B', strokeWidth: 0, r: 0 }} activeDot={{ fill: '#D95F3B', strokeWidth: 2, stroke: '#0A0B10', r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </FadeIn>

      {/* Two-column charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Occupancy */}
        <FadeIn delay={0.3}>
          <div className="relative glass rounded-3xl p-8 overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8972A]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading font-semibold text-[#F7F5F0] text-lg">{t('occupancyOverTime')}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C8972A] shadow-[0_0_8px_rgba(200,151,42,0.6)]" />
                  <span className="text-xs text-[#F7F5F0]/40">%</span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="occ-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <ChartSkeleton height={260} />
                  </motion.div>
                ) : (
                  <motion.div key="occ-chart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={occupancyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <filter id="occGlow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.25)', fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.25)', fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip {...chartTooltip} formatter={(v) => [`${v}%`, lang === 'ar' ? 'الإشغال' : 'Occupancy']} />
                        <Line type="monotone" dataKey="value" stroke="#C8972A" strokeWidth={2.5} fill="none" filter="url(#occGlow)" animationDuration={1500} animationEasing="ease-out" dot={{ fill: '#0A0B10', stroke: '#C8972A', strokeWidth: 2, r: 3 }} activeDot={{ fill: '#C8972A', strokeWidth: 2, stroke: '#0A0B10', r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>

        {/* Competitor */}
        <FadeIn delay={0.4}>
          <div className="relative glass rounded-3xl p-8 overflow-hidden h-full">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D95F3B]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                <h2 className="font-heading font-semibold text-[#F7F5F0] text-lg">{t('competitorComparison')}</h2>
                <div className="flex items-center gap-4">
                  {[
                    { color: '#D95F3B', label: lang === 'ar' ? 'أنت' : 'You' },
                    { color: '#C8972A', label: lang === 'ar' ? 'المنافس' : 'Competitor' },
                    { color: 'rgba(247,245,240,0.15)', label: lang === 'ar' ? 'السوق' : 'Market' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs text-[#F7F5F0]/40">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="comp-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <ChartSkeleton height={260} />
                  </motion.div>
                ) : (
                  <motion.div key="comp-chart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={competitorData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
                        <defs>
                          <linearGradient id="youGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#D95F3B" />
                            <stop offset="100%" stopColor="#D95F3B" stopOpacity={0.6} />
                          </linearGradient>
                          <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C8972A" />
                            <stop offset="100%" stopColor="#C8972A" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.25)', fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.25)', fontSize: 11 }} />
                        <Tooltip {...chartTooltip} formatter={(v) => [`${v.toLocaleString()} ${sar}`]} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Bar dataKey="you" fill="url(#youGrad)" radius={[6, 6, 0, 0]} name={lang === 'ar' ? 'أنت' : 'You'} animationDuration={1500} animationEasing="ease-out" barSize={18} />
                        <Bar dataKey="competitor" fill="url(#compGrad)" radius={[6, 6, 0, 0]} name={lang === 'ar' ? 'المنافس' : 'Competitor'} animationDuration={1500} animationDelay={200} animationEasing="ease-out" barSize={18} />
                        <Bar dataKey="market" fill="rgba(247,245,240,0.1)" radius={[6, 6, 0, 0]} name={lang === 'ar' ? 'السوق' : 'Market'} animationDuration={1500} animationDelay={400} animationEasing="ease-out" barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Daily Rate Comparison Table */}
      <DailyRateComparisonTable />
      </div>
      );
      }