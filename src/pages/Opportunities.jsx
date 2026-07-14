import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import { TrendingUp, Zap, AlertCircle, BookmarkPlus, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Opportunities() {
  const { t, lang, isRTL } = useLang();
  const { theme } = useTheme();
  const [filter, setFilter] = useState('all');

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const opportunities = [
    {
      id: 1,
      type: lang === 'ar' ? 'زيادة السعر' : 'Price Increase',
      property: 'Luxury Villa - Riyadh',
      reason: lang === 'ar' ? 'السعر أقل من متوسط السوق بنسبة 12%' : 'Price is 12% below market average',
      revenue: '+8,500 SAR',
      period: lang === 'ar' ? 'شهرياً' : '/month',
      action: lang === 'ar' ? 'رفع السعر بمقدار 15%' : 'Increase price by 15%',
      priority: 'high',
      icon: TrendingUp,
    },
    {
      id: 2,
      type: lang === 'ar' ? 'أيام الطلب المرتفع' : 'High Demand Days',
      property: 'Modern Studio - Jeddah',
      reason: lang === 'ar' ? 'الطلب على نهايات الأسبوع أعلى بـ 40%' : 'Weekend demand is 40% higher',
      revenue: '+5,200 SAR',
      period: lang === 'ar' ? 'أسبوعياً' : '/week',
      action: lang === 'ar' ? 'طبق تسعير ديناميكي' : 'Apply dynamic pricing',
      priority: 'high',
      icon: Zap,
    },
    {
      id: 3,
      type: lang === 'ar' ? 'فجوات الحجز' : 'Booking Gaps',
      property: 'Beachfront Chalet - Khobar',
      reason: lang === 'ar' ? 'هناك فجوات 3-4 أيام بين الحجوزات' : 'There are 3-4 day gaps between bookings',
      revenue: '+3,800 SAR',
      period: lang === 'ar' ? 'شهرياً' : '/month',
      action: lang === 'ar' ? 'اخفض السعر للأيام المتبقية' : 'Discount remaining days',
      priority: 'medium',
      icon: AlertCircle,
    },
    {
      id: 4,
      type: lang === 'ar' ? 'الموسم القادم' : 'Upcoming Season',
      property: 'Luxury Villa - Riyadh',
      reason: lang === 'ar' ? 'الصيف الحالي سيشهد ارتفاع طلب 60%' : 'Upcoming summer will see 60% demand increase',
      revenue: '+12,000 SAR',
      period: lang === 'ar' ? 'موسم' : '/season',
      action: lang === 'ar' ? 'احجز مسبقاً برسوم أعلى' : 'Pre-book at premium rates',
      priority: 'high',
      icon: TrendingUp,
    },
    {
      id: 5,
      type: lang === 'ar' ? 'تحسين الوصف' : 'Listing Optimization',
      property: 'Modern Studio - Jeddah',
      reason: lang === 'ar' ? 'الوصف ناقص ويحتاج تحديث' : 'Description needs update and details',
      revenue: '+4,500 SAR',
      period: lang === 'ar' ? 'شهرياً' : '/month',
      action: lang === 'ar' ? 'حدّث الصور والوصف' : 'Update photos and description',
      priority: 'medium',
      icon: Eye,
    },
    {
      id: 6,
      type: lang === 'ar' ? 'مرافق مميزة' : 'Premium Amenities',
      property: 'Beachfront Chalet - Khobar',
      reason: lang === 'ar' ? 'إضافة مرافق ستزيد الحجوزات 25%' : 'Adding amenities increases bookings by 25%',
      revenue: '+6,200 SAR',
      period: lang === 'ar' ? 'شهرياً' : '/month',
      action: lang === 'ar' ? 'أضف Wi-Fi و قهوة مجانية' : 'Add Wi-Fi and free coffee',
      priority: 'low',
      icon: Zap,
    },
  ];

  const filteredOpportunities = filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.priority === filter);

  const bgCard = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-[#EFF6FA] border border-[#06131F]/10';

  const textColor = theme === 'dark' ? 'text-[#F2F8FC]' : 'text-[#06131F]';
  const textMuted = theme === 'dark' ? 'text-[#F2F8FC]/60' : 'text-[#06131F]/60';

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
      <PublicNavbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <FadeIn>
            <div>
              <h1 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${textColor}`}>
                {lang === 'ar' ? 'فرص زيادة الإيرادات' : 'Revenue Opportunities'}
              </h1>
              <p className={`text-lg ${textMuted}`}>
                {lang === 'ar'
                  ? 'اكتشف الفرص المتاحة لزيادة إيراد عقاراتك وتحسين الأداء'
                  : 'Discover available opportunities to boost your property revenue and improve performance'}
              </p>
            </div>
          </FadeIn>

          {/* Filters */}
          <FadeIn delay={0.1}>
            <div className={`p-6 rounded-xl ${bgCard} flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between`}>
              <span className={`font-medium ${textColor}`}>
                {lang === 'ar' ? 'الأولوية' : 'Priority'}
              </span>
              <div className="flex flex-wrap gap-2">
                {['all', 'high', 'medium', 'low'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === p
                        ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white'
                        : theme === 'dark'
                          ? 'bg-white/[0.04] text-[#F2F8FC]/70 hover:bg-white/[0.08]'
                          : 'bg-[#06131F]/5 text-[#06131F]/70 hover:bg-[#06131F]/10'
                    }`}
                  >
                    {p === 'all' && (lang === 'ar' ? 'الكل' : 'All')}
                    {p === 'high' && (lang === 'ar' ? 'عالية' : 'High')}
                    {p === 'medium' && (lang === 'ar' ? 'متوسطة' : 'Medium')}
                    {p === 'low' && (lang === 'ar' ? 'منخفضة' : 'Low')}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Opportunities Grid */}
          <StaggerContainer stagger={0.05}>
            {filteredOpportunities.map((opp) => {
              const Icon = opp.icon;
              return (
                <StaggerItem key={opp.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className={`p-6 rounded-xl ${bgCard} transition-all`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1B84C4]/20 to-[#ADDFF1]/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#1B84C4]" />
                        </div>
                        <div>
                          <h3 className={`font-bold ${textColor}`}>{opp.type}</h3>
                          <p className={`text-sm ${textMuted}`}>{opp.property}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(opp.priority)}`}>
                        {opp.priority === 'high' && (lang === 'ar' ? 'أولوية عالية' : 'High Priority')}
                        {opp.priority === 'medium' && (lang === 'ar' ? 'أولوية متوسطة' : 'Medium')}
                        {opp.priority === 'low' && (lang === 'ar' ? 'أولوية منخفضة' : 'Low')}
                      </span>
                    </div>

                    <p className={`text-sm mb-6 ${textMuted}`}>{opp.reason}</p>

                    <div className="flex items-baseline gap-2 mb-6 p-4 rounded-lg bg-[#1B84C4]/10">
                      <span className="font-heading font-bold text-2xl text-[#1B84C4]">{opp.revenue}</span>
                      <span className={`text-sm ${textMuted}`}>{opp.period}</span>
                    </div>

                    <div className={`p-4 rounded-lg border-l-4 border-[#0F6BA8] mb-6 ${
                      theme === 'dark'
                        ? 'bg-white/[0.02]'
                        : 'bg-[#06131F]/3'
                    }`}>
                      <p className={`text-sm font-medium ${textColor}`}>{lang === 'ar' ? 'الإجراء المقترح' : 'Recommended Action'}</p>
                      <p className={`text-sm ${textMuted} mt-1`}>{opp.action}</p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-4 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all flex items-center justify-center gap-2">
                        {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        <Arrow className="w-4 h-4" />
                      </button>
                      <button className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        theme === 'dark'
                          ? 'bg-white/[0.04] text-[#F2F8FC] hover:bg-white/[0.08]'
                          : 'bg-[#06131F]/5 text-[#06131F] hover:bg-[#06131F]/10'
                      } flex items-center justify-center gap-2`}>
                        {lang === 'ar' ? 'حفظ' : 'Save'}
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* CTA */}
          <FadeIn delay={0.3}>
            <div className={`p-12 rounded-2xl text-center ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#1B84C4]/10 to-[#ADDFF1]/5 border border-[#1B84C4]/30'
                : 'bg-gradient-to-br from-[#1B84C4]/5 to-[#ADDFF1]/3 border border-[#1B84C4]/20'
            }`}>
              <h3 className={`font-heading text-2xl font-bold mb-4 ${textColor}`}>
                {lang === 'ar' ? 'هل تريد زيادة إيرادك بشكل أسرع؟' : 'Want to boost revenue faster?'}
              </h3>
              <p className={`mb-6 max-w-2xl mx-auto ${textMuted}`}>
                {lang === 'ar'
                  ? 'انضم إلى مدار واحصل على تحليلات متقدمة وتوصيات شخصية لكل عقار'
                  : 'Join Madar to get advanced analytics and personalized recommendations for each property'}
              </p>
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all"
              >
                {lang === 'ar' ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
                <Arrow className="w-4 h-4" />
              </a>
            </div>
          </FadeIn>
        </div>
      </main>

      <ComprehensiveFooter />
    </div>
  );
}