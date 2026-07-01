import React, { useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const monthNames = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

const dayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
};

export default function MasterCalendarView({
  currentDate,
  onPrevMonth,
  onNextMonth,
  view,
  calendarData,
  onDateClick,
}) {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // RTL adjustment for first day
  const adjustedFirstDay = isRTL ? (7 - firstDay) % 7 : firstDay;

  const getDemandColor = (demandLevel) => {
    switch (demandLevel) {
      case 'high':
        return 'bg-[#D95F3B]/80 text-white shadow-lg shadow-[#D95F3B]/20';
      case 'medium':
        return 'bg-[#C8972A]/60 text-white';
      case 'low':
        return 'bg-[#6B7280]/40 text-white';
      case 'gap':
        return 'bg-transparent border-2 border-dashed border-[#F7F5F0]/20 text-[#F7F5F0]/40';
      default:
        return theme === 'dark'
          ? 'bg-white/[0.02] text-[#F7F5F0]/70 hover:bg-white/[0.06]'
          : 'bg-[#0A0B10]/5 text-[#0A0B10]/70 hover:bg-[#0A0B10]/10';
    }
  };

  const getDayData = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData[dateStr] || null;
  };

  return (
    <div className={`rounded-2xl p-6 ${
      theme === 'dark'
        ? 'glass'
        : 'bg-white border border-[#0A0B10]/10'
    }`}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onPrevMonth}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-white/5'
              : 'hover:bg-[#0A0B10]/5'
          }`}
        >
          {isRTL ? (
            <ChevronRight className={`w-5 h-5 ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`} />
          ) : (
            <ChevronLeft className={`w-5 h-5 ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`} />
          )}
        </button>
        <h2 className={`font-heading font-semibold text-lg ${
          theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
        }`}>
          {monthNames[lang][month]} {year}
        </h2>
        <button
          onClick={onNextMonth}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-white/5'
              : 'hover:bg-[#0A0B10]/5'
          }`}
        >
          {isRTL ? (
            <ChevronLeft className={`w-5 h-5 ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`} />
          ) : (
            <ChevronRight className={`w-5 h-5 ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`} />
          )}
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {dayNames[lang].map(d => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-2 ${
              theme === 'dark' ? 'text-[#F7F5F0]/30' : 'text-[#0A0B10]/30'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cells for first day alignment */}
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayData = getDayData(day);
          const demandColor = dayData ? getDemandColor(dayData.demand) : '';

          return (
            <motion.button
              key={day}
              onClick={() => onDateClick(dayData)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-medium cursor-pointer transition-all relative overflow-hidden ${demandColor}`}
            >
              {/* Alert indicator */}
              {dayData?.hasAlert && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}

              {/* Day number */}
              <span className="font-bold text-sm mb-0.5">{day}</span>

              {/* Mini stats for calendar view */}
              {dayData && (
                <div className="text-[10px] opacity-70">
                  {dayData.occupancy > 0 && <div>{dayData.occupancy}%</div>}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}