import React, { useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import WeeklyHealthReport from '@/components/reporting/WeeklyHealthReport';
import { Calendar, Download, Mail, Bell, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock properties
const mockProperties = [
  { id: '1', name: 'Luxury Villa - Riyadh', city: 'Riyadh' },
  { id: '2', name: 'Modern Studio - Jeddah', city: 'Jeddah' },
  { id: '3', name: 'Beachfront Chalet - Khobar', city: 'Khobar' },
];

// Mock weekly data
const generateWeekData = (propertyId) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      occupied: Math.random() > 0.4,
      revenue: Math.random() > 0.3 ? Math.floor(Math.random() * 1500 + 300) : 0,
    });
  }

  return {
    week: `${weekStart.toLocaleDateString()} - ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
    days,
  };
};

export default function Reports() {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const { entitlements, userPlan } = useSubscription();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Check feature access
  const hasAccess = useMemo(() => {
    return entitlements?.weeklyReports === true || userPlan?.slug === 'pro' || userPlan?.slug === 'growth';
  }, [entitlements, userPlan]);

  const reports = useMemo(() => {
    if (!hasAccess) return [];
    return mockProperties.map(prop => ({
      ...prop,
      weekData: generateWeekData(prop.id),
    }));
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className={`p-8 rounded-xl text-center ${
        theme === 'dark'
          ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
          : 'bg-[#F2EFE8] border border-[#0A0B10]/10'
      }`}>
        <AlertTriangle className={`w-12 h-12 mx-auto mb-4 ${
          theme === 'dark' ? 'text-[#D95F3B]' : 'text-[#D95F3B]'
        }`} />
        <h2 className={`font-heading font-bold text-lg mb-2 ${
          theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
        }`}>
          {lang === 'ar' ? 'ميزة غير متاحة' : 'Feature Not Available'}
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-foreground/50' : 'text-[#0A0B10]/50'
        }`}>
          {lang === 'ar'
            ? 'التقارير الأسبوعية متاحة فقط في خطط Growth و Pro'
            : 'Weekly reports are available in Growth and Pro plans'}
        </p>
      </div>
    );
  }

  const bgCard = theme === 'dark'
    ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
    : 'bg-[#F2EFE8] border border-[#0A0B10]/10';

  const textColor = theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]';
  const textMuted = theme === 'dark' ? 'text-foreground/60' : 'text-[#0A0B10]/60';

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className={`font-heading text-3xl font-bold ${textColor}`}>
            {lang === 'ar' ? 'التقارير الأسبوعية' : 'Weekly Reports'}
          </h1>
          <p className={`text-sm mt-1 ${textMuted}`}>
            {lang === 'ar'
              ? 'تقارير صحية شاملة لعقاراتك كل أسبوع'
              : 'Comprehensive health reports for your properties each week'}
          </p>
        </div>
      </FadeIn>

      {/* Controls */}
      <FadeIn delay={0.1}>
        <div className={`p-6 rounded-xl ${bgCard} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-[#D95F3B]" />
            <div>
              <p className={`text-sm font-medium ${textColor}`}>
                {lang === 'ar' ? 'الفترة الزمنية' : 'Period'}
              </p>
              <div className="flex gap-2 mt-2">
                {['current', 'last4weeks', 'last3months'].map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white'
                        : theme === 'dark'
                          ? 'bg-foreground/[0.04] text-foreground/70 hover:bg-foreground/[0.08]'
                          : 'bg-background/5 text-[#0A0B10]/70 hover:bg-background/10'
                    }`}
                  >
                    {period === 'current' && (lang === 'ar' ? 'الأسبوع الحالي' : 'This Week')}
                    {period === 'last4weeks' && (lang === 'ar' ? 'آخر 4 أسابيع' : 'Last 4 Weeks')}
                    {period === 'last3months' && (lang === 'ar' ? 'آخر 3 أشهر' : 'Last 3 Months')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              title={lang === 'ar' ? 'تحميل' : 'Download'}
              className={`p-2.5 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-foreground/[0.08]'
                  : 'hover:bg-background/5'
              }`}
            >
              <Download className="w-4 h-4" />
            </button>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'hover:bg-foreground/[0.08]'
                : 'hover:bg-background/5'
            }`}>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded accent-[#D95F3B]"
              />
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">
                {lang === 'ar' ? 'البريد الأسبوعي' : 'Weekly Email'}
              </span>
            </label>
          </div>
        </div>
      </FadeIn>

      {/* Reports */}
      <StaggerContainer>
        {reports.map((report, idx) => (
          <StaggerItem key={report.id}>
            <WeeklyHealthReport property={report} weekData={report.weekData} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Empty State */}
      {reports.length === 0 && (
        <FadeIn>
          <div className={`p-12 rounded-xl text-center ${bgCard}`}>
            <Calendar className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
            <p className={`text-sm ${textMuted}`}>
              {lang === 'ar' ? 'لا توجد تقارير متاحة حالياً' : 'No reports available'}
            </p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}