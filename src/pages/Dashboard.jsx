import React, { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { TrendingUp, Home, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockStats = [
  { key: 'totalRevenue', value: '45,230', unit: 'SAR', change: '+12%', up: true, icon: DollarSign, color: '#D95F3B' },
  { key: 'occupancyRate', value: '78%', change: '+5%', up: true, icon: BarChart3, color: '#C8972A' },
  { key: 'avgNightlyRate', value: '580', unit: 'SAR', change: '-2%', up: false, icon: TrendingUp, color: '#1C1F2E' },
  { key: 'activeListings', value: '6', change: '+1', up: true, icon: Home, color: '#D95F3B' },
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
  const { user } = useMadarAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">
          {t('welcomeBack')}, {user?.full_name || user?.email?.split('@')[0] || 'Host'} 👋
        </h1>
        <p className="text-sm text-[#1C1F2E]/50 mt-1">{t('todayOverview')}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <div key={stat.key} className="bg-white rounded-2xl p-5 border border-[#1C1F2E]/5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1C1F2E] font-heading">
              {stat.value} <span className="text-xs font-normal text-[#1C1F2E]/40">{stat.unit}</span>
            </div>
            <div className="text-xs text-[#1C1F2E]/50 mt-1">{t(stat.key)}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
          <h2 className="font-heading font-semibold text-[#1C1F2E] mb-4">{t('aiRecommendations')}</h2>
          <div className="space-y-4">
            {mockRecommendations.map((rec, i) => {
              const isUp = rec.recommended > rec.current;
              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#F7F5F0] border border-[#1C1F2E]/5">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-[#1C1F2E] truncate">{rec.property}</div>
                    <div className="text-xs text-[#1C1F2E]/50 mt-0.5">{lang === 'ar' ? rec.reasonAr : rec.reason}</div>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                    <span className="text-sm text-[#1C1F2E]/50 line-through">{rec.current}</span>
                    <span className={`text-sm font-semibold ${isUp ? 'text-emerald-600' : 'text-amber-600'}`}>{rec.recommended} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy Forecast */}
        <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
          <h2 className="font-heading font-semibold text-[#1C1F2E] mb-4">{t('occupancyForecast')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockForecast}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1C1F2E', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
                labelStyle={{ color: '#ffffff80' }}
                formatter={(v) => [`${v}%`, lang === 'ar' ? 'الإشغال' : 'Occupancy']}
              />
              <Bar dataKey="value" fill="#D95F3B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}