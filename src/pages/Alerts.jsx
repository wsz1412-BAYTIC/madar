import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { AlertTriangle, Info, Sparkles, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';

const mockAlerts = [
  { id: 1, severity: 'critical', property: 'Luxury Villa - Riyadh', message: 'Price is 35% below market average for this weekend. Raise to 1,100 SAR.', messageAr: 'السعر أقل بـ 35% من متوسط السوق لنهاية هذا الأسبوع. ارفع إلى 1,100 ر.س.', time: '2 min ago', timeAr: 'قبل دقيقتين' },
  { id: 2, severity: 'opportunity', property: 'Modern Studio - Jeddah', message: 'Major conference in Jeddah next week. Competitors raising prices by 40%.', messageAr: 'مؤتمر كبير في جدة الأسبوع القادم. المنافسون يرفعون الأسعار بنسبة 40%.', time: '15 min ago', timeAr: 'قبل 15 دقيقة' },
  { id: 3, severity: 'warning', property: 'Family Home - KAEC', message: 'Occupancy expected to drop 20% next month. Consider lowering prices.', messageAr: 'متوقع انخفاض الإشغال بنسبة 20% الشهر القادم. فكر في خفض الأسعار.', time: '1 hour ago', timeAr: 'قبل ساعة' },
  { id: 4, severity: 'info', property: 'Penthouse Suite - Dammam', message: 'Your listing was viewed 45 times today, 30% above average.', messageAr: 'تم عرض إعلانك 45 مرة اليوم، أعلى بـ 30% من المتوسط.', time: '3 hours ago', timeAr: 'قبل 3 ساعات' },
  { id: 5, severity: 'opportunity', property: 'Luxury Villa - Riyadh', message: 'Riyadh Season starts in 2 weeks. Historical data shows 60% price increase.', messageAr: 'موسم الرياض يبدأ بعد أسبوعين. البيانات التاريخية تظهر زيادة 60% في الأسعار.', time: '5 hours ago', timeAr: 'قبل 5 ساعات' },
];

const severityConfig = {
  critical: { icon: AlertTriangle, border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/15 text-red-400', glow: 'shadow-[0_0_30px_-12px_rgba(239,68,68,0.3)]' },
  warning: { icon: AlertTriangle, border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400', glow: '' },
  info: { icon: Info, border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-400', glow: '' },
  opportunity: { icon: Sparkles, border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400', glow: 'shadow-[0_0_30px_-12px_rgba(16,185,129,0.3)]' },
};

export default function Alerts() {
  const { t, lang } = useLang();
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/20">
            <Bell className="w-5 h-5 text-[#D95F3B]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('smartAlerts')}</h1>
            <p className="text-sm text-[#F7F5F0]/40">{t('alertsDesc')}</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'critical', 'warning', 'opportunity', 'info'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white' : 'glass text-[#F7F5F0]/50 hover:text-[#F7F5F0]'}`}>
              {f === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t(f)}
            </button>
          ))}
        </div>
      </FadeIn>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((alert, i) => {
            const cfg = severityConfig[alert.severity];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, height: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`glass ${cfg.border} ${cfg.glow} rounded-2xl p-5`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.text}`}>{t(alert.severity)}</span>
                      <span className="text-[10px] text-[#F7F5F0]/20">•</span>
                      <span className="text-xs text-[#F7F5F0]/40">{alert.property}</span>
                    </div>
                    <p className="text-sm text-[#F7F5F0]/70 leading-relaxed">{lang === 'ar' ? alert.messageAr : alert.message}</p>
                    <p className="text-[10px] text-[#F7F5F0]/20 mt-2">{lang === 'ar' ? alert.timeAr : alert.time}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(alert.severity === 'critical' || alert.severity === 'opportunity') && (
                      <button className="px-3 py-1.5 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all">{t('applyNow')}</button>
                    )}
                    <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="p-1.5 hover:bg-white/5 rounded-lg">
                      <X className="w-3.5 h-3.5 text-[#F7F5F0]/20" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#F7F5F0]/30 text-sm">{t('noData')}</div>
        )}
      </div>
    </div>
  );
}