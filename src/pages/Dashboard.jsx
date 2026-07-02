import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { TrendingUp, Home, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const mockStats = [
  { key: 'totalRevenue', value: '45,230', unit: 'SAR', change: '+12%', up: true, icon: DollarSign, color: '#D95F3B' },
  { key: 'occupancyRate', value: '78%', change: '+5%', up: true, icon: BarChart3, color: '#C8972A' },
  { key: 'avgNightlyRate', value: '580', unit: 'SAR', change: '-2%', up: false, icon: TrendingUp, color: '#D95F3B' },
  { key: 'activeListings', value: '6', change: '+1', up: true, icon: Home, color: '#C8972A' },
];

const mockForecast = [
  { day: 'Mon', value: 72 }, { day: 'Tue', value: 68 }, { day: 'Wed', value: 80 },
  { day: 'Thu', value: 85 }, { day: 'Fri', value: 92 }, { day: 'Sat', value: 95 }, { day: 'Sun', value: 88 },
];

const mockRecommendations = [
  { property: 'Luxury Villa - Riyadh', current: 850, recommended: 1020, reason: 'High demand weekend', reasonAr: 'طلب عالي في نهاية الأسبوع' },
  { property: 'Studio Apartment - Jeddah', current: 320, recommended: 280, reason: 'Low season midweek', reasonAr: 'موسم منخفض في منتصف الأسبوع' },
  { property: 'Family Home - KAEC', current: 600, recommended: 750, reason: 'Local event nearby', reasonAr: 'فعالية محلية قريبة' },
];

export default function Dashboard() {
  const { t, lang, isRTL } = useLang();
  const { user } = useAuth();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">
            {t('welcomeBack')}, {user?.full_name || user?.email?.split('@')[0] || 'Host'}
          </h1>
          <p className="text-sm text-[#F7F5F0]/40 mt-1">{t('todayOverview')}</p>
        </div>
      </FadeIn>

      {/* Stats grid */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
        {mockStats.map((stat) => (
          <StaggerItem key={stat.key}>
            <div className="glass rounded-2xl p-5 hover:border-white/15 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#F7F5F0] font-heading">
                {stat.value} {stat.unit && <span className="text-xs font-normal text-[#F7F5F0]/30">{stat.unit}</span>}
              </div>
              <div className="text-xs text-[#F7F5F0]/40 mt-1">{t(stat.key)}</div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <FadeIn delay={0.2}>
          <div className="glass rounded-2xl p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/20">
                <Sparkles className="w-4 h-4 text-[#D95F3B]" />
              </div>
              <h2 className="font-heading font-semibold text-[#F7F5F0]">{t('aiRecommendations')}</h2>
            </div>
            <div className="space-y-3">
              {mockRecommendations.map((rec, i) => {
                const isUp = rec.recommended > rec.current;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/10 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-[#F7F5F0] truncate">{rec.property}</div>
                      <div className="text-xs text-[#F7F5F0]/40 mt-0.5">{lang === 'ar' ? rec.reasonAr : rec.reason}</div>
                    </div>
                    <div className={`flex items-center gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                      <span className="text-sm text-[#F7F5F0]/30 line-through">{rec.current}</span>
                      <span className={`text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-amber-400'}`}>{rec.recommended} {sar}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Occupancy Forecast */}
        <FadeIn delay={0.3}>
          <div className="glass rounded-2xl p-6 h-full">
            <h2 className="font-heading font-semibold text-[#F7F5F0] mb-5">{t('occupancyForecast')}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockForecast}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#14161D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F7F5F0', fontSize: 12 }}
                  labelStyle={{ color: 'rgba(247,245,240,0.5)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(v) => [`${v}%`, lang === 'ar' ? 'الإشغال' : 'Occupancy']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                  {mockForecast.map((_, i) => (
                    <Cell key={i} fill={i >= 4 ? '#D95F3B' : 'rgba(217,95,59,0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}