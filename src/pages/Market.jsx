import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Zap, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const marketData = [
  { month: 'Jan', occupancy: 62, price: 285, revpar: 177 },
  { month: 'Feb', occupancy: 68, price: 310, revpar: 211 },
  { month: 'Mar', occupancy: 75, price: 340, revpar: 255 },
  { month: 'Apr', occupancy: 82, price: 390, revpar: 320 },
  { month: 'May', occupancy: 85, price: 420, revpar: 357 },
  { month: 'Jun', occupancy: 88, price: 450, revpar: 396 },
];

const citiesData = [
  { name: 'Riyadh', occupancy: 78, avgPrice: 385, growth: 12, properties: 2450 },
  { name: 'Jeddah', occupancy: 72, avgPrice: 320, growth: 8, properties: 1820 },
  { name: 'Khobar', occupancy: 68, avgPrice: 280, growth: 15, properties: 890 },
  { name: 'Dammam', occupancy: 65, avgPrice: 260, growth: 10, properties: 620 },
  { name: 'Abha', occupancy: 82, avgPrice: 240, growth: 22, properties: 440 },
];

const seasonalData = [
  { season: 'Summer', value: 35, fill: '#D95F3B' },
  { season: 'Winter', value: 28, fill: '#C8972A' },
  { season: 'Spring', value: 22, fill: '#6B7280' },
  { season: 'Fall', value: 15, fill: '#9CA3AF' },
];

export default function Market() {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const bgCard = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-[#F2EFE8] border border-[#0A0B10]/10';

  const textColor = theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]';
  const textMuted = theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60';

  const metrics = [
    {
      label: lang === 'ar' ? 'متوسط الإشغال' : 'Avg Occupancy',
      value: '76%',
      change: '+2.3%',
      icon: Users,
    },
    {
      label: lang === 'ar' ? 'متوسط السعر اليومي' : 'Avg Daily Rate',
      value: '385 SAR',
      change: '+4.5%',
      icon: DollarSign,
    },
    {
      label: lang === 'ar' ? 'RevPAR' : 'RevPAR',
      value: '292 SAR',
      change: '+6.8%',
      icon: TrendingUp,
    },
    {
      label: lang === 'ar' ? 'المشاركات النشطة' : 'Active Properties',
      value: '6,220',
      change: '+8.2%',
      icon: Zap,
    },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
      <PublicNavbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <FadeIn>
            <div>
              <h1 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${textColor}`}>
                {lang === 'ar' ? 'أرقام السوق' : 'Market Numbers'}
              </h1>
              <p className={`text-lg ${textMuted}`}>
                {lang === 'ar'
                  ? 'نظرة شاملة على أداء السوق والاتجاهات الحالية في السعودية'
                  : 'Comprehensive overview of market performance and current trends across Saudi Arabia'}
              </p>
            </div>
          </FadeIn>

          {/* Key Metrics */}
          <FadeIn delay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-6 rounded-xl ${bgCard}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="w-5 h-5 text-[#D95F3B]" />
                      <span className="text-xs font-medium text-green-500">{metric.change}</span>
                    </div>
                    <p className={`text-sm font-medium mb-2 ${textMuted}`}>{metric.label}</p>
                    <p className={`font-heading font-bold text-2xl ${textColor}`}>{metric.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </FadeIn>

          {/* Filters */}
          <FadeIn delay={0.2}>
            <div className={`p-6 rounded-xl ${bgCard} flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#D95F3B]" />
                <span className={`font-medium ${textColor}`}>
                  {lang === 'ar' ? 'الفلاتر' : 'Filters'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'riyadh', 'jeddah', 'khobar'].map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCity === city
                        ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white'
                        : theme === 'dark'
                          ? 'bg-white/[0.04] text-[#F7F5F0]/70 hover:bg-white/[0.08]'
                          : 'bg-[#0A0B10]/5 text-[#0A0B10]/70 hover:bg-[#0A0B10]/10'
                    }`}
                  >
                    {city === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : city}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Trends Chart */}
          <FadeIn delay={0.3}>
            <div className={`p-6 rounded-xl ${bgCard}`}>
              <h2 className={`font-heading font-bold text-xl mb-6 ${textColor}`}>
                {lang === 'ar' ? 'اتجاهات السوق' : 'Market Trends'}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                  <YAxis stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="occupancy" stroke="#D95F3B" strokeWidth={2} />
                  <Line type="monotone" dataKey="price" stroke="#C8972A" strokeWidth={2} />
                  <Line type="monotone" dataKey="revpar" stroke="#6B7280" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>

          {/* Cities Comparison */}
          <FadeIn delay={0.4}>
            <div className={`p-6 rounded-xl ${bgCard}`}>
              <h2 className={`font-heading font-bold text-xl mb-6 ${textColor}`}>
                {lang === 'ar' ? 'أداء المدن' : 'Cities Performance'}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={citiesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="name" stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                  <YAxis stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="occupancy" fill="#D95F3B" />
                  <Bar dataKey="growth" fill="#C8972A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>

          {/* Seasonal Distribution */}
          <FadeIn delay={0.5}>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className={`p-6 rounded-xl ${bgCard}`}>
                <h2 className={`font-heading font-bold text-xl mb-6 ${textColor}`}>
                  {lang === 'ar' ? 'توزيع الطلب الموسمي' : 'Seasonal Demand'}
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={seasonalData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {seasonalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h2 className={`font-heading font-bold text-xl ${textColor}`}>
                  {lang === 'ar' ? 'المواسم والفعاليات' : 'Seasons & Events'}
                </h2>
                {[
                  { season: lang === 'ar' ? 'الصيف' : 'Summer', period: 'Jun-Aug', demand: lang === 'ar' ? 'عالي جداً' : 'Very High' },
                  { season: lang === 'ar' ? 'الشتاء' : 'Winter', period: 'Dec-Feb', demand: lang === 'ar' ? 'عالي' : 'High' },
                  { season: lang === 'ar' ? 'الربيع' : 'Spring', period: 'Mar-May', demand: lang === 'ar' ? 'متوسط' : 'Medium' },
                  { season: lang === 'ar' ? 'الخريف' : 'Fall', period: 'Sep-Nov', demand: lang === 'ar' ? 'منخفض' : 'Low' },
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/[0.02] border border-white/[0.06]' : 'bg-[#0A0B10]/3 border border-[#0A0B10]/10'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${textColor}`}>{item.season}</p>
                        <p className={`text-sm ${textMuted}`}>{item.period}</p>
                      </div>
                      <span className="px-3 py-1 bg-[#D95F3B]/10 text-[#D95F3B] text-xs font-medium rounded-full">
                        {item.demand}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.6}>
            <div className={`p-12 rounded-2xl text-center ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#D95F3B]/10 to-[#C8972A]/5 border border-[#D95F3B]/30'
                : 'bg-gradient-to-br from-[#D95F3B]/5 to-[#C8972A]/3 border border-[#D95F3B]/20'
            }`}>
              <h3 className={`font-heading text-2xl font-bold mb-4 ${textColor}`}>
                {lang === 'ar' ? 'استكشف بيانات السوق' : 'Explore Market Data'}
              </h3>
              <p className={`mb-6 max-w-2xl mx-auto ${textMuted}`}>
                {lang === 'ar'
                  ? 'احصل على رؤية عميقة حول أداء السوق وقارن عقارك بالمنافسين'
                  : 'Get deeper insights into market performance and compare your properties with competitors'}
              </p>
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all"
              >
                {lang === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </a>
            </div>
          </FadeIn>
        </div>
      </main>

      <ComprehensiveFooter />
    </div>
  );
}