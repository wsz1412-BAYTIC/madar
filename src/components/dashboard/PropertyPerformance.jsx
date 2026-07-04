import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function PropertyPerformance({ properties }) {
  const { lang } = useLang();
  const { theme } = useTheme();

  const sortedProps = [...properties]
    .sort((a, b) => (b.performance?.score || 0) - (a.performance?.score || 0))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`p-6 rounded-2xl border h-full ${
        theme === 'dark'
          ? 'bg-card border-foreground/[0.06]'
          : 'bg-white border-[#0A0B10]/[0.06]'
      }`}
    >
      <h2 className={`text-lg font-heading font-bold mb-4 ${
        theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
      }`}>
        {lang === 'ar' ? 'أداء العقار' : 'Property Performance'}
      </h2>

      <div className="space-y-4">
        {sortedProps.length > 0 ? (
          sortedProps.map((prop, idx) => (
            <div key={prop.id} className={`p-3 rounded-lg ${
              theme === 'dark'
                ? 'bg-foreground/[0.04]'
                : 'bg-background/[0.04]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
                }`}>
                  {prop.name}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {prop.performance?.score || 0}%
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${
                theme === 'dark'
                  ? 'bg-foreground/[0.08]'
                  : 'bg-background/[0.08]'
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all"
                  style={{ width: `${prop.performance?.score || 0}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className={`text-sm text-center py-6 ${
            theme === 'dark' ? 'text-foreground/40' : 'text-[#0A0B10]/40'
          }`}>
            {lang === 'ar' ? 'لا توجد عقارات' : 'No properties yet'}
          </p>
        )}
      </div>
    </motion.div>
  );
}