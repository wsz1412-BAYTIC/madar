import React, { useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Share2 } from 'lucide-react';

export default function WeeklyHealthReport({ property, weekData }) {
  const { lang } = useLang();
  const { theme } = useTheme();

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!weekData || !weekData.days) return null;

    const occupiedDays = weekData.days.filter(d => d.occupied).length;
    const totalRevenue = weekData.days.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const avgDailyRevenue = totalRevenue / weekData.days.length;
    const avgOccupancy = (occupiedDays / weekData.days.length) * 100;

    // Top performing days
    const topDays = [...weekData.days]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 3);

    // Calculate trend
    const firstHalf = weekData.days.slice(0, 3).reduce((sum, d) => sum + (d.revenue || 0), 0);
    const secondHalf = weekData.days.slice(4).reduce((sum, d) => sum + (d.revenue || 0), 0);
    const trend = ((secondHalf - firstHalf) / (firstHalf || 1)) * 100;

    return {
      occupiedDays,
      totalRevenue,
      avgDailyRevenue,
      avgOccupancy,
      topDays,
      trend,
    };
  }, [weekData]);

  if (!metrics || !weekData) {
    return null;
  }

  const bgCard = theme === 'dark'
    ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
    : 'bg-[#EFF6FA] border border-[#06131F]/10';

  const textColor = theme === 'dark' ? 'text-foreground' : 'text-[#06131F]';
  const textMuted = theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60';

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getDayLabel = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl ${bgCard} space-y-6`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-heading font-bold text-lg mb-1 ${textColor}`}>
            {property.name}
          </h3>
          <p className={`text-xs ${textMuted}`}>
            {lang === 'ar' ? 'تقرير الأسبوع الصحي' : 'Weekly Health Report'} • {weekData.week}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-foreground/[0.08]'
                : 'hover:bg-background/5'
            }`}
            title={lang === 'ar' ? 'تحميل' : 'Download'}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-foreground/[0.08]'
                : 'hover:bg-background/5'
            }`}
            title={lang === 'ar' ? 'مشاركة' : 'Share'}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
            : 'bg-background/3 border border-[#06131F]/10'
        }`}>
          <p className={`text-xs font-medium mb-1 ${textMuted}`}>
            {lang === 'ar' ? 'الاشغال' : 'Occupancy'}
          </p>
          <p className="font-heading font-bold text-lg text-[#1B84C4]">
            {Math.round(metrics.avgOccupancy)}%
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
            : 'bg-background/3 border border-[#06131F]/10'
        }`}>
          <p className={`text-xs font-medium mb-1 ${textMuted}`}>
            {lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
          </p>
          <p className="font-heading font-bold text-lg text-[#0F6BA8]">
            {metrics.totalRevenue.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
            : 'bg-background/3 border border-[#06131F]/10'
        }`}>
          <p className={`text-xs font-medium mb-1 ${textMuted}`}>
            {lang === 'ar' ? 'متوسط اليومي' : 'Daily Avg'}
          </p>
          <p className="font-heading font-bold text-lg text-[#6B7280]">
            {Math.round(metrics.avgDailyRevenue)} SAR
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
            : 'bg-background/3 border border-[#06131F]/10'
        }`}>
          <p className={`text-xs font-medium mb-1 ${textMuted}`}>
            {lang === 'ar' ? 'الاتجاه' : 'Trend'}
          </p>
          <p className={`font-heading font-bold text-lg ${getTrendColor(metrics.trend)}`}>
            {metrics.trend > 0 ? '+' : ''}{Math.round(metrics.trend)}%
          </p>
        </div>
      </div>

      {/* Daily Breakdown Chart */}
      <div>
        <h4 className={`text-sm font-bold mb-4 ${textColor}`}>
          {lang === 'ar' ? 'توزيع يومي' : 'Daily Breakdown'}
        </h4>
        <div className="space-y-2">
          {weekData.days.map((day, idx) => {
            const maxRevenue = Math.max(...weekData.days.map(d => d.revenue || 0));
            const percentage = ((day.revenue || 0) / (maxRevenue || 1)) * 100;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${textColor}`}>
                    {day.date.split('-')[2]}/{day.date.split('-')[1]}
                  </span>
                  <span className={`${day.occupied ? 'text-green-500' : textMuted}`}>
                    {day.occupied ? '✓' : '○'} {day.revenue || 0} SAR
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-foreground/[0.05]'
                    : 'bg-background/5'
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    className="h-full bg-gradient-to-r from-[#00548C] to-[#003152]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Days */}
      <div>
        <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${textColor}`}>
          <TrendingUp className="w-4 h-4 text-[#1B84C4]" />
          {lang === 'ar' ? 'أفضل الأيام' : 'Top Performing Days'}
        </h4>
        <div className="space-y-2">
          {metrics.topDays.map((day, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
                  : 'bg-background/3 border border-[#06131F]/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00548C] to-[#003152] flex items-center justify-center text-white text-xs font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>
                    {getDayLabel(day.date)}
                  </p>
                  <p className={`text-xs ${textMuted}`}>
                    {day.occupied ? (lang === 'ar' ? 'محجوز' : 'Booked') : (lang === 'ar' ? 'متاح' : 'Available')}
                  </p>
                </div>
              </div>
              <p className="font-heading font-bold text-[#0F6BA8]">
                {day.revenue || 0} SAR
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className={`p-4 rounded-lg border-l-4 border-[#1B84C4] ${
        theme === 'dark'
          ? 'bg-[#1B84C4]/5'
          : 'bg-[#1B84C4]/5'
      }`}>
        <h4 className={`text-sm font-bold mb-2 ${textColor}`}>
          {lang === 'ar' ? 'الملاحظات' : 'Key Insights'}
        </h4>
        <ul className={`text-xs space-y-1 ${textMuted}`}>
          {metrics.trend > 0 && (
            <li>
              {lang === 'ar'
                ? `✓ إيرادات متزايدة بنسبة ${Math.round(metrics.trend)}% مقارنة بأول الأسبوع`
                : `✓ Revenue trending up ${Math.round(metrics.trend)}% compared to early week`}
            </li>
          )}
          {metrics.avgOccupancy > 75 && (
            <li>
              {lang === 'ar'
                ? '✓ معدل اشغال ممتاز - استمر بالاستراتيجية الحالية'
                : '✓ Excellent occupancy rate - maintain current strategy'}
            </li>
          )}
          {metrics.avgOccupancy < 40 && (
            <li>
              {lang === 'ar'
                ? '⚠ معدل اشغال منخفض - فكر في تعديل الأسعار'
                : '⚠ Low occupancy - consider price adjustments'}
            </li>
          )}
          <li>
            {lang === 'ar'
              ? `• متوسط الإيرادات اليومية: ${Math.round(metrics.avgDailyRevenue)} ريال سعودي`
              : `• Average daily revenue: ${Math.round(metrics.avgDailyRevenue)} SAR`}
          </li>
        </ul>
      </div>
    </motion.div>
  );
}