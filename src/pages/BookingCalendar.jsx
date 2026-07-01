import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';

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
    booked: 'bg-gradient-to-br from-[#D95F3B] to-[#C8972A] text-white shadow-lg shadow-[#D95F3B]/20',
    blocked: 'bg-white/[0.05] text-[#F7F5F0]/20 line-through',
    available: 'bg-white/[0.02] hover:bg-white/[0.06] text-[#F7F5F0]/70 hover:text-[#F7F5F0]',
  };

  const properties = [
    { value: 'all', label: lang === 'ar' ? 'جميع العقارات' : 'All Properties' },
    { value: '1', label: lang === 'ar' ? 'فيلا فاخرة - الرياض' : 'Luxury Villa - Riyadh' },
    { value: '2', label: lang === 'ar' ? 'استوديو عصري - جدة' : 'Modern Studio - Jeddah' },
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('bookingCalendar')}</h1>
          <select
            value={selectedProperty}
            onChange={e => setSelectedProperty(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F7F5F0] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20"
          >
            {properties.map(p => <option key={p.value} value={p.value} className="bg-[#14161D]">{p.label}</option>)}
          </select>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              {isRTL ? <ChevronRight className="w-5 h-5 text-[#F7F5F0]/50" /> : <ChevronLeft className="w-5 h-5 text-[#F7F5F0]/50" />}
            </button>
            <h2 className="font-heading font-semibold text-[#F7F5F0] text-lg">
              {monthNames[lang][month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              {isRTL ? <ChevronLeft className="w-5 h-5 text-[#F7F5F0]/50" /> : <ChevronRight className="w-5 h-5 text-[#F7F5F0]/50" />}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {dayNames[lang].map(d => (
              <div key={d} className="text-center text-xs font-medium text-[#F7F5F0]/30 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = getStatus(day);
              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium cursor-pointer transition-all ${statusStyles[status]}`}
                >
                  {day}
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-6 mt-8 pt-4 border-t border-white/[0.04]">
            {[
              { key: 'booked', color: 'bg-gradient-to-br from-[#D95F3B] to-[#C8972A]' },
              { key: 'blocked', color: 'bg-white/[0.05]' },
              { key: 'available', color: 'bg-white/[0.02] border border-white/[0.08]' },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-xs text-[#F7F5F0]/40">{t(item.key)}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}