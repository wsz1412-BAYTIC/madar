import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function CalendarLegend() {
  const { lang } = useLang();
  const { theme } = useTheme();

  const legends = [
    {
      key: 'high',
      color: 'bg-[#1B84C4]/80',
      label: lang === 'ar' ? 'طلب عالي' : 'High Demand',
      icon: TrendingUp,
    },
    {
      key: 'medium',
      color: 'bg-[#ADDFF1]/60',
      label: lang === 'ar' ? 'طلب متوسط' : 'Medium Demand',
      icon: null,
    },
    {
      key: 'low',
      color: 'bg-[#6B7280]/40',
      label: lang === 'ar' ? 'طلب منخفض' : 'Low Demand',
      icon: TrendingDown,
    },
    {
      key: 'empty',
      color: 'bg-transparent border-2 border-dashed border-foreground/20',
      label: lang === 'ar' ? 'فارغ' : 'Empty Gap',
      icon: null,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-6 mb-6">
      {legends.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${item.color}`} />
            <span className={`text-xs font-medium ${
              theme === 'dark' ? 'text-foreground/70' : 'text-[#06131F]/70'
            }`}>
              {Icon ? <Icon className="w-3 h-3 inline mr-1" /> : null}
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}