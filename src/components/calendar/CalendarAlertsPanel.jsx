import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertTriangle, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalendarAlertsPanel({ alerts }) {
  const { lang } = useLang();
  const { theme } = useTheme();

  if (!alerts || alerts.length === 0) {
    return (
      <div className={`p-6 rounded-xl text-center ${
        theme === 'dark'
          ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
          : 'bg-[#EFF6FA] border border-[#06131F]/10'
      }`}>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
        }`}>{lang === 'ar' ? 'لا توجد تنبيهات' : 'No alerts'}</p>
      </div>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'underpriced': return <TrendingUp className="w-5 h-5 text-[#1B84C4]" />;
      case 'overpriced': return <TrendingUp className="w-5 h-5 text-[#FF6B6B]" />;
      case 'gap': return <Calendar className="w-5 h-5 text-[#6B7280]" />;
      default: return <AlertCircle className="w-5 h-5 text-[#0F6BA8]" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'underpriced': return 'border-[#1B84C4]/30 bg-[#1B84C4]/5';
      case 'overpriced': return 'border-[#FF6B6B]/30 bg-[#FF6B6B]/5';
      case 'gap': return 'border-[#6B7280]/30 bg-[#6B7280]/5';
      default: return 'border-[#ADDFF1]/30 bg-[#ADDFF1]/5';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className={`font-medium text-sm flex items-center gap-2 mb-4 ${
        theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
      }`}>
        <AlertTriangle className="w-4 h-4" />
        {lang === 'ar' ? 'التنبيهات والفرص' : 'Alerts & Opportunities'} ({alerts.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.map((alert, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className={`font-medium text-sm mb-1 ${
                  theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
                }`}>{alert.title}</p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60'
                }`}>{alert.description}</p>
                {alert.impact && (
                  <p className={`text-xs mt-2 font-medium ${
                    theme === 'dark' ? 'text-[#0F6BA8]' : 'text-[#1B84C4]'
                  }`}>{lang === 'ar' ? 'التأثير:' : 'Impact:'} {alert.impact}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}