import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Users, CreditCard, Home, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-xl border ${
        theme === 'dark'
          ? 'bg-card border-foreground/[0.06]'
          : 'bg-white border-[#06131F]/[0.06]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60'
          }`}>
            {label}
          </p>
          <p className={`text-3xl font-bold mt-2 ${
            theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
          }`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'primary'
            ? theme === 'dark'
              ? 'bg-primary/20'
              : 'bg-primary/10'
            : theme === 'dark'
              ? 'bg-amber-500/20'
              : 'bg-amber-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'primary' ? 'text-primary' : 'text-amber-600'
          }`} />
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminStats({ stats }) {
  const { lang } = useLang();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={Users}
        label={lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
        value={stats.totalUsers}
        color="primary"
      />
      <StatCard
        icon={CreditCard}
        label={lang === 'ar' ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
        value={stats.activeSubscriptions}
        color="primary"
      />
      <StatCard
        icon={Home}
        label={lang === 'ar' ? 'إجمالي العقارات' : 'Total Properties'}
        value={stats.totalProperties}
        color="primary"
      />
      <StatCard
        icon={TrendingUp}
        label={lang === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
        value={`SAR ${Math.round(stats.monthlyRevenue)}`}
        color="amber"
      />
    </div>
  );
}