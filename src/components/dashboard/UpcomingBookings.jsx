import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

const mockBookings = [
  { id: 1, property: 'Villa A', guest: 'Ahmed', date: '2025-07-15', nights: 3 },
  { id: 2, property: 'Apartment B', guest: 'Fatima', date: '2025-07-18', nights: 5 },
  { id: 3, property: 'Chalet C', guest: 'Mohammed', date: '2025-07-22', nights: 2 },
];

export default function UpcomingBookings({ properties }) {
  const { lang } = useLang();
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`p-6 rounded-2xl border ${
        theme === 'dark'
          ? 'bg-card border-white/[0.06]'
          : 'bg-white border-[#0A0B10]/[0.06]'
      }`}
    >
      <h2 className={`text-lg font-heading font-bold mb-4 ${
        theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
      }`}>
        {lang === 'ar' ? 'الحجوزات القادمة' : 'Upcoming Bookings'}
      </h2>

      <div className="space-y-3">
        {mockBookings.map((booking) => (
          <div
            key={booking.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              theme === 'dark'
                ? 'bg-white/[0.04]'
                : 'bg-[#0A0B10]/[0.04]'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
              }`}>
                {booking.property}
              </p>
              <div className="flex gap-3 mt-1">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  {booking.guest}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {booking.nights} {lang === 'ar' ? 'ليلة' : 'nights'}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-primary">
              {booking.date}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}