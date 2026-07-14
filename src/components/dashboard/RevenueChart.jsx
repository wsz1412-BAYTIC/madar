import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

// Mock data
const generateRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, i) => ({
    name: month,
    revenue: Math.floor(Math.random() * 20000) + 10000,
    target: 20000 + i * 500,
  }));
};

export default function RevenueChart({ properties }) {
  const { lang } = useLang();
  const { theme } = useTheme();
  const data = generateRevenueData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`p-6 rounded-2xl border ${
        theme === 'dark'
          ? 'bg-card border-foreground/[0.06]'
          : 'bg-white border-[#06131F]/[0.06]'
      }`}
    >
      <div className="mb-6">
        <h2 className={`text-lg font-heading font-bold ${
          theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
        }`}>
          {lang === 'ar' ? 'اتجاه الإيرادات' : 'Revenue Trend'}
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60'
        }`}>
          {lang === 'ar' ? 'آخر 6 أشهر' : 'Last 6 months'}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B84C4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#1B84C4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(10,11,16,0.1)'}
            vertical={false}
          />
          <XAxis 
            dataKey="name"
            stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(10,11,16,0.5)'}
          />
          <YAxis
            stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(10,11,16,0.5)'}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#0B1B2A' : '#EFF6FA',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,11,16,0.1)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: theme === 'dark' ? '#F2F8FC' : '#06131F' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#1B84C4"
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#0F6BA8"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}