import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertTriangle, AlertCircle, TrendingDown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const mockAlerts = [
  { id: 1, type: 'warning', title: 'Low Occupancy', property: 'Villa A', severity: 'high' },
  { id: 2, type: 'info', title: 'Price Adjustment', property: 'Apartment B', severity: 'medium' },
  { id: 3, type: 'opportunity', title: 'High Demand', property: 'Chalet C', severity: 'low' },
];

export default function RecentAlerts({ properties }) {
  const { lang } = useLang();
  const { theme } = useTheme();

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return AlertTriangle;
      case 'opportunity': return Zap;
      default: return AlertCircle;
    }
  };

  const getColor = (severity) => {
    switch(severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`p-6 rounded-2xl border ${
        theme === 'dark'
          ? 'bg-card border-foreground/[0.06]'
          : 'bg-white border-[#0A0B10]/[0.06]'
      }`}
    >
      <h2 className={`text-lg font-heading font-bold mb-4 ${
        theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
      }`}>
        {lang === 'ar' ? 'التنبيهات الأخيرة' : 'Recent Alerts'}
      </h2>

      <div className="space-y-3">
        {mockAlerts.map((alert) => {
          const IconComponent = getIcon(alert.type);
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                theme === 'dark'
                  ? 'bg-foreground/[0.04]'
                  : 'bg-background/[0.04]'
              }`}
            >
              <IconComponent className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getColor(alert.severity)}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
                }`}>
                  {alert.title}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-foreground/40' : 'text-[#0A0B10]/40'
                }`}>
                  {alert.property}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}