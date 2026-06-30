import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bookings = {
  '2025-07-04': 'booked', '2025-07-05': 'booked', '2025-07-06': 'booked',
  '2025-07-10': 'booked', '2025-07-11': 'booked', '2025-07-12': 'booked', '2025-07-13': 'booked',
  '2025-07-15': 'blocked', '2025-07-16': 'blocked',
  '2025-07-20': 'booked', '2025-07-21': 'booked', '2025-07-22': 'booked',
  '2025-07-25': 'booked', '2025-07-26': 'booked', '2025-07-27': 'booked',
  '2025-07-28': 'booked', '2025-07-29': 'booked',
};

const monthNames = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

const dayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
};

export default function BookingCalendar() {
  const { t, lang, isRTL } = useLang();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));
  const [selectedProperty, setSelectedProperty] = useState('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getStatus = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings[dateStr] || 'available';
  };

  const statusStyles = {
    booked: 'bg-[#D95F3B] text-white',
    blocked: 'bg-[#1C1F2E]/10 text-[#1C1F2E]/40 line-through',
    available: 'bg-white hover:bg-[#D95F3B]/5 text-[#1C1F2E]',
  };

  const properties = [
    { value: 'all', label: lang === 'ar' ? 'جميع العقارات' : 'All Properties' },
    { value: '1', label: lang === 'ar' ? 'فيلا فاخرة - الرياض' : 'Luxury Villa - Riyadh' },
    { value: '2', label: lang === 'ar' ? 'استوديو عصري - جدة' : 'Modern Studio - Jeddah' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('bookingCalendar')}</h1>
        <select
          value={selectedProperty}
          onChange={e => setSelectedProperty(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#1C1F2E]/10 text-sm text-[#1C1F2E] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20"
        >
          {properties.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[#1C1F2E]/5">
            {isRTL ? <ChevronRight className="w-5 h-5 text-[#1C1F2E]/60" /> : <ChevronLeft className="w-5 h-5 text-[#1C1F2E]/60" />}
          </button>
          <h2 className="font-heading font-semibold text-[#1C1F2E]">
            {monthNames[lang][month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[#1C1F2E]/5">
            {isRTL ? <ChevronLeft className="w-5 h-5 text-[#1C1F2E]/60" /> : <ChevronRight className="w-5 h-5 text-[#1C1F2E]/60" />}
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames[lang].map(d => (
            <div key={d} className="text-center text-xs font-medium text-[#1C1F2E]/40 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getStatus(day);
            return (
              <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all ${statusStyles[status]}`}>
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#1C1F2E]/5">
          {[
            { key: 'booked', color: 'bg-[#D95F3B]' },
            { key: 'blocked', color: 'bg-[#1C1F2E]/20' },
            { key: 'available', color: 'bg-white border border-[#1C1F2E]/10' },
          ].map(item => (
            <div key={item.key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${item.color}`} />
              <span className="text-xs text-[#1C1F2E]/50">{t(item.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}