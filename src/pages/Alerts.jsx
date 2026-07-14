import React, { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertTriangle, Info, Sparkles, X, Bell, Clock, Zap, BellRing, Pause, CheckCircle, Mail, Smartphone, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const mockAlerts = [
  { id: 1, severity: 'critical', property: 'Luxury Villa - Riyadh', message: 'Price is 35% below market average for this weekend. Raise to 1,100 SAR.', messageAr: 'السعر أقل بـ 35% من متوسط السوق لنهاية هذا الأسبوع. ارفع إلى 1,100 ر.س.', time: '2 min ago', timeAr: 'قبل دقيقتين' },
  { id: 2, severity: 'opportunity', property: 'Modern Studio - Jeddah', message: 'Major conference in Jeddah next week. Competitors raising prices by 40%.', messageAr: 'مؤتمر كبير في جدة الأسبوع القادم. المنافسون يرفعون الأسعار بنسبة 40%.', time: '15 min ago', timeAr: 'قبل 15 دقيقة' },
  { id: 3, severity: 'warning', property: 'Family Home - KAEC', message: 'Occupancy expected to drop 20% next month. Consider lowering prices.', messageAr: 'متوقع انخفاض الإشغال بنسبة 20% الشهر القادم. فكر في خفض الأسعار.', time: '1 hour ago', timeAr: 'قبل ساعة' },
  { id: 4, severity: 'info', property: 'Penthouse Suite - Dammam', message: 'Your listing was viewed 45 times today, 30% above average.', messageAr: 'تم عرض إعلانك 45 مرة اليوم، أعلى بـ 30% من المتوسط.', time: '3 hours ago', timeAr: 'قبل 3 ساعات' },
  { id: 5, severity: 'opportunity', property: 'Luxury Villa - Riyadh', message: 'Riyadh Season starts in 2 weeks. Historical data shows 60% price increase.', messageAr: 'موسم الرياض يبدأ بعد أسبوعين. البيانات التاريخية تظهر زيادة 60% في الأسعار.', time: '5 hours ago', timeAr: 'قبل 5 ساعات' },
];

const newAlert = {
  id: 6,
  severity: 'critical',
  property: 'Beachfront Condo - Khobar',
  message: 'Sudden demand spike detected — 15 bookings in the last hour. Recommended price: 1,400 SAR.',
  messageAr: 'ارتفاع مفاجئ في الطلب — 15 حجزاً في الساعة الأخيرة. السعر الموصى به: 1,400 ر.س.',
  time: 'Just now',
  timeAr: 'الآن',
};

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/15 text-red-400',
    badgeBorder: 'border-red-500/25',
    glow: 'shadow-[0_0_40px_-12px_rgba(239,68,68,0.4)]',
    accent: 'from-red-500/20 to-transparent',
    dot: 'bg-red-400',
    pulse: 'bg-red-500/20',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400',
    badgeBorder: 'border-amber-500/25',
    glow: 'shadow-[0_0_40px_-12px_rgba(245,158,11,0.3)]',
    accent: 'from-amber-500/20 to-transparent',
    dot: 'bg-amber-400',
    pulse: 'bg-amber-500/20',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/25',
    text: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-400',
    badgeBorder: 'border-blue-500/25',
    glow: '',
    accent: 'from-blue-500/15 to-transparent',
    dot: 'bg-blue-400',
    pulse: 'bg-blue-500/20',
  },
  opportunity: {
    icon: Sparkles,
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400',
    badgeBorder: 'border-emerald-500/25',
    glow: 'shadow-[0_0_40px_-12px_rgba(16,185,129,0.35)]',
    accent: 'from-emerald-500/20 to-transparent',
    dot: 'bg-emerald-400',
    pulse: 'bg-emerald-500/20',
  },
};

const filterConfig = {
  all: { icon: BellRing, color: 'text-foreground' },
  critical: { icon: AlertTriangle, color: 'text-red-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  opportunity: { icon: Sparkles, color: 'text-emerald-400' },
  info: { icon: Info, color: 'text-blue-400' },
};

const summaryCards = [
  { key: 'critical', labelKey: 'critical', count: 1, icon: AlertTriangle, gradient: 'from-red-500/20 to-red-500/5', iconColor: 'text-red-400', border: 'border-red-500/20' },
  { key: 'opportunity', labelKey: 'opportunity', count: 2, icon: Sparkles, gradient: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
  { key: 'warning', labelKey: 'warning', count: 1, icon: AlertTriangle, gradient: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400', border: 'border-amber-500/20' },
  { key: 'info', labelKey: 'info', count: 1, icon: Info, gradient: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
];

export default function Alerts() {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState('all');
  const [newId, setNewId] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [thresholds, setThresholds] = useState({
    occupancyRisk: 65,
    priceDeviation: 20,
    demandSpike: 50,
  });
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    inApp: true,
  });
  const [snoozedAlerts, setSnoozedAlerts] = useState({});
  const [resolvedAlerts, setResolvedAlerts] = useState({});

  // Simulate a new alert arriving after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(prev => [newAlert, ...prev]);
      setNewId(newAlert.id);
      setTimeout(() => setNewId(null), 6000);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  const snoozeAlert = (id) => {
    setSnoozedAlerts(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSnoozedAlerts(prev => ({ ...prev, [id]: false }));
    }, 3600000);
  };

  const resolveAlert = (id) => {
    setResolvedAlerts(prev => ({ ...prev, [id]: true }));
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const bgCard = theme === 'dark'
    ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
    : 'bg-[#EFF6FA] border border-[#06131F]/10';

  const textColor = theme === 'dark' ? 'text-foreground' : 'text-[#06131F]';
  const textMuted = theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60';

  return (
    <div className="space-y-8">
      {/* Settings Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-2xl glass ${bgCard} space-y-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-heading font-bold text-lg ${textColor}`}>
                {lang === 'ar' ? 'إعدادات التنبيهات' : 'Alert Settings'}
              </h2>
              <button onClick={() => setShowConfig(false)} className={`p-1 hover:bg-foreground/5 rounded-lg transition-colors`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Confidence Thresholds */}
            <div className="space-y-4">
              <h3 className={`font-medium ${textColor}`}>
                {lang === 'ar' ? 'عتبات الثقة' : 'Confidence Thresholds'}
              </h3>
              {[
                { key: 'occupancyRisk', label: lang === 'ar' ? 'خطر الإشغال' : 'Occupancy Risk', min: 30, max: 90 },
                { key: 'priceDeviation', label: lang === 'ar' ? 'انحراف الأسعار' : 'Price Deviation', min: 5, max: 50 },
                { key: 'demandSpike', label: lang === 'ar' ? 'قمة الطلب' : 'Demand Spike', min: 20, max: 100 },
              ].map(item => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${textColor}`}>{item.label}</label>
                    <span className="text-sm font-bold text-[#1B84C4]">{thresholds[item.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    value={thresholds[item.key]}
                    onChange={(e) => setThresholds(prev => ({ ...prev, [item.key]: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-[#1B84C4]"
                  />
                </div>
              ))}
            </div>

            {/* Notification Channels */}
            <div className="space-y-4 pt-4 border-t border-foreground/10">
              <h3 className={`font-medium ${textColor}`}>
                {lang === 'ar' ? 'قنوات الإشعارات' : 'Notification Channels'}
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'email', label: lang === 'ar' ? 'بريد إلكتروني' : 'Email', icon: Mail },
                  { key: 'sms', label: lang === 'ar' ? 'رسائل SMS' : 'SMS', icon: Smartphone },
                  { key: 'inApp', label: lang === 'ar' ? 'في التطبيق' : 'In-App', icon: Bell },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <label key={item.key} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      channels[item.key] ? 'bg-foreground/5' : 'hover:bg-foreground/3'
                    }`}>
                      <input
                        type="checkbox"
                        checked={channels[item.key]}
                        onChange={(e) => setChannels(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[#1B84C4] cursor-pointer"
                      />
                      <Icon className="w-4 h-4 text-[#1B84C4]" />
                      <span className={`text-sm font-medium ${textColor}`}>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowConfig(false)}
              className="w-full py-2 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all"
            >
              {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00548C] to-[#003152] rounded-2xl blur-lg opacity-30 animate-glow-pulse" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B84C4]/20 to-[#ADDFF1]/10 flex items-center justify-center border border-[#1B84C4]/20">
                <Bell className="w-5 h-5 text-[#1B84C4]" />
              </div>
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">{t('smartAlerts')}</h1>
              <p className="text-sm text-foreground/40">{t('alertsDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-foreground/5 transition-colors"
              title={lang === 'ar' ? 'إعدادات التنبيهات' : 'Alert Settings'}
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <span className="text-xs text-foreground/50">{lang === 'ar' ? 'مراقبة نشطة' : 'Live monitoring'}</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
        {summaryCards.map(card => {
          const cfg = severityConfig[card.key];
          return (
            <StaggerItem key={card.key}>
              <button
                onClick={() => setFilter(filter === card.key ? 'all' : card.key)}
                className={`relative w-full text-left p-5 rounded-2xl overflow-hidden transition-all duration-500 group ${
                  filter === card.key
                    ? `glass-strong border ${cfg.border} ${cfg.glow}`
                    : `glass border ${cfg.border} hover:border-foreground/15`
                }`}
              >
                <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${cfg.accent} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold font-heading text-foreground">{card.count}</div>
                    <div className="text-xs text-foreground/40 mt-1">{t(card.labelKey)}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} border ${card.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Filter Pills */}
      <FadeIn delay={0.15}>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'critical', 'warning', 'opportunity', 'info'].map(f => {
            const fcfg = filterConfig[f];
            const FilterIcon = fcfg.icon;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-500 ${
                  isActive ? 'text-white' : 'text-foreground/40 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="alertFilterPill"
                    className="absolute inset-0 bg-gradient-to-r from-[#00548C] to-[#003152] rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <FilterIcon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-white' : fcfg.color}`} />
                <span className="relative z-10">{f === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t(f)}</span>
                {f !== 'all' && (
                  <span className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-foreground/20' : 'bg-foreground/5'}`}>
                    {alerts.filter(a => a.severity === f).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert) => {
            const cfg = severityConfig[alert.severity];
            const Icon = cfg.icon;
            const isNew = alert.id === newId;
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`relative glass ${cfg.border} ${cfg.glow} rounded-2xl p-5 overflow-hidden ${isNew ? 'ring-1 ring-[#1B84C4]/40' : ''}`}
              >
                {/* New alert pulse overlay */}
                {isNew && (
                  <motion.div
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: 2 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1B84C4]/10 to-transparent pointer-events-none"
                  />
                )}

                {/* Accent bar */}
                <div className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b ${cfg.accent} ${cfg.dot}`} style={{ [lang === 'ar' ? 'right' : 'left']: 0 }} />

                {/* Glow */}
                <div className={`absolute -top-12 ${lang === 'ar' ? '-left-12' : '-right-12'} w-32 h-32 bg-gradient-to-br ${cfg.accent} rounded-full blur-3xl opacity-50 pointer-events-none`} />

                <div className="relative z-10 flex items-start gap-4">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    {isNew && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`absolute inset-0 rounded-xl ${cfg.pulse}`}
                      />
                    )}
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.badge} border ${cfg.badgeBorder} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>{t(alert.severity)}</span>
                      {isNew && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#00548C] to-[#003152] text-white"
                        >
                          {lang === 'ar' ? 'جديد' : 'New'}
                        </motion.span>
                      )}
                      <span className="text-[10px] text-foreground/20">•</span>
                      <span className="text-xs text-foreground/40 font-medium">{alert.property}</span>
                    </div>
                    <p className="text-sm text-foreground/75 leading-relaxed">{lang === 'ar' ? alert.messageAr : alert.message}</p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <Clock className="w-3 h-3 text-foreground/20" />
                      <p className="text-[10px] text-foreground/20">{lang === 'ar' ? alert.timeAr : alert.time}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(alert.severity === 'critical' || alert.severity === 'opportunity') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#00548C] to-[#003152] text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all"
                      >
                        <Zap className="w-3 h-3" />
                        {t('applyNow')}
                      </motion.button>
                    )}
                    {!snoozedAlerts[alert.id] && (
                      <button
                        onClick={() => snoozeAlert(alert.id)}
                        className="p-1.5 hover:bg-foreground/5 rounded-lg transition-colors"
                        title={lang === 'ar' ? 'إرجاء' : 'Snooze'}
                      >
                        <Pause className="w-3.5 h-3.5 text-foreground/40 hover:text-foreground/60" />
                      </button>
                    )}
                    {!resolvedAlerts[alert.id] && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="p-1.5 hover:bg-foreground/5 rounded-lg transition-colors"
                        title={lang === 'ar' ? 'تم التعامل معها' : 'Resolve'}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-foreground/40 hover:text-emerald-400" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1.5 hover:bg-foreground/5 rounded-lg transition-colors"
                      title={lang === 'ar' ? 'رفض' : 'Dismiss'}
                    >
                      <X className="w-3.5 h-3.5 text-foreground/20" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4">
              <Bell className="w-7 h-7 text-foreground/20" />
            </div>
            <p className="text-foreground/30 text-sm">{t('noData')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}