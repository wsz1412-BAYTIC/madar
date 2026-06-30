import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { AlertTriangle, Info, Sparkles, X, Check, Bell } from 'lucide-react';

const mockAlerts = [
  {
    id: 1, severity: 'critical', property: 'Luxury Villa - Riyadh',
    message: 'Price is 35% below market average for this weekend. Raise to 1,100 SAR.',
    messageAr: 'السعر أقل بـ 35% من متوسط السوق لنهاية هذا الأسبوع. ارفع إلى 1,100 ر.س.',
    time: '2 min ago', timeAr: 'قبل دقيقتين',
  },
  {
    id: 2, severity: 'opportunity', property: 'Modern Studio - Jeddah',
    message: 'Major conference in Jeddah next week. Competitors raising prices by 40%.',
    messageAr: 'مؤتمر كبير في جدة الأسبوع القادم. المنافسون يرفعون الأسعار بنسبة 40%.',
    time: '15 min ago', timeAr: 'قبل 15 دقيقة',
  },
  {
    id: 3, severity: 'warning', property: 'Family Home - KAEC',
    message: 'Occupancy expected to drop 20% next month. Consider lowering prices.',
    messageAr: 'متوقع انخفاض الإشغال بنسبة 20% الشهر القادم. فكر في خفض الأسعار.',
    time: '1 hour ago', timeAr: 'قبل ساعة',
  },
  {
    id: 4, severity: 'info', property: 'Penthouse Suite - Dammam',
    message: 'Your listing was viewed 45 times today, 30% above average.',
    messageAr: 'تم عرض إعلانك 45 مرة اليوم، أعلى بـ 30% من المتوسط.',
    time: '3 hours ago', timeAr: 'قبل 3 ساعات',
  },
  {
    id: 5, severity: 'opportunity', property: 'Luxury Villa - Riyadh',
    message: 'Riyadh Season starts in 2 weeks. Historical data shows 60% price increase.',
    messageAr: 'موسم الرياض يبدأ بعد أسبوعين. البيانات التاريخية تظهر زيادة 60% في الأسعار.',
    time: '5 hours ago', timeAr: 'قبل 5 ساعات',
  },
];

const severityConfig = {
  critical: { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  opportunity: { icon: Sparkles, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
};

export default function Alerts() {
  const { t, lang } = useLang();
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D95F3B]/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#D95F3B]" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('smartAlerts')}</h1>
          <p className="text-sm text-[#1C1F2E]/50">{t('alertsDesc')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'critical', 'warning', 'opportunity', 'info'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[#1C1F2E] text-white' : 'bg-white border border-[#1C1F2E]/5 text-[#1C1F2E]/60 hover:text-[#1C1F2E]'}`}>
            {f === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t(f)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(alert => {
          const cfg = severityConfig[alert.severity];
          const Icon = cfg.icon;
          return (
            <div key={alert.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-5 transition-all`}>
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.badge}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.text}`}>{t(alert.severity)}</span>
                    <span className="text-[10px] text-[#1C1F2E]/30">•</span>
                    <span className="text-xs text-[#1C1F2E]/50">{alert.property}</span>
                  </div>
                  <p className="text-sm text-[#1C1F2E]/80 leading-relaxed">{lang === 'ar' ? alert.messageAr : alert.message}</p>
                  <p className="text-[10px] text-[#1C1F2E]/30 mt-2">{lang === 'ar' ? alert.timeAr : alert.time}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(alert.severity === 'critical' || alert.severity === 'opportunity') && (
                    <button className="px-3 py-1.5 bg-[#D95F3B] text-white text-xs font-medium rounded-lg hover:bg-[#D95F3B]/90">{t('applyNow')}</button>
                  )}
                  <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="p-1.5 hover:bg-white/50 rounded-lg">
                    <X className="w-3.5 h-3.5 text-[#1C1F2E]/30" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#1C1F2E]/40 text-sm">{t('noData')}</div>
        )}
      </div>
    </div>
  );
}