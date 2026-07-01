import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, Home, PercentSquare, DollarSign, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, suffix, color, trend }) => {
  const { theme } = useTheme();
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-5 rounded-xl border ${
        theme === 'dark'
          ? 'bg-card border-white/[0.06]'
          : 'bg-white border-[#0A0B10]/[0.06]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${
          color === 'primary'
            ? theme === 'dark' 
              ? 'bg-primary/20'
              : 'bg-primary/10'
            : theme === 'dark'
              ? 'bg-amber-500/20'
              : 'bg-amber-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            color === 'primary' ? 'text-primary' : 'text-amber-600'
          }`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${
            isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className={`text-sm ${
        theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60'
      }`}>
        {label}
      </p>
      <p className={`text-2xl font-bold mt-2 ${
        theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
      }`}>
        {value}{suffix}
      </p>
    </motion.div>
  );
};

export default function DashboardStats({ stats, subscription }) {
  const { lang } = useLang();
  const { theme } = useTheme();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <StatCard
        icon={Home}
        label={lang === 'ar' ? 'إجمالي العقارات' : 'Total Properties'}
        value={stats.totalProperties}
        suffix=""
        color="primary"
      />
      <StatCard
        icon={TrendingUp}
        label={lang === 'ar' ? 'الحجوزات النشطة' : 'Active Listings'}
        value={stats.activeListings}
        suffix=""
        color="primary"
      />
      <StatCard
        icon={PercentSquare}
        label={lang === 'ar' ? 'متوسط الإشغال' : 'Avg Occupancy'}
        value={stats.avgOccupancy}
        suffix="%"
        color="primary"
      />
      <StatCard
        icon={DollarSign}
        label={lang === 'ar' ? 'متوسط السعر اليومي' : 'Avg Daily Rate'}
        value={`SAR ${stats.avgAdr}`}
        suffix=""
        color="primary"
      />
      <StatCard
        icon={AlertCircle}
        label={lang === 'ar' ? 'الإيرادات المفقودة' : 'Lost Revenue'}
        value={`SAR ${stats.lostOpportunities}`}
        suffix=""
        color="amber"
        trend={-15}
      />
      <StatCard
        icon={Zap}
        label={lang === 'ar' ? 'إيرادات الشهر' : 'Month Revenue'}
        value={`SAR ${Math.round(stats.monthRevenue)}`}
        suffix=""
        color="primary"
        trend={12}
      />
    </div>
  );
}