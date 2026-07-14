import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import { Search, ArrowRight, ArrowLeft, BookOpen, MessageCircle } from 'lucide-react';

export default function HelpCenter() {
  const { t, lang, isRTL } = useLang();
  const { theme } = useTheme();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'getting-started', label: lang === 'ar' ? 'البدء السريع' : 'Getting Started' },
    { id: 'account', label: lang === 'ar' ? 'إدارة الحساب' : 'Account Management' },
    { id: 'properties', label: lang === 'ar' ? 'إدارة العقارات' : 'Managing Properties' },
    { id: 'pricing', label: lang === 'ar' ? 'التسعير الذكي' : 'Smart Pricing' },
    { id: 'analytics', label: lang === 'ar' ? 'التحليلات' : 'Analytics & Reports' },
    { id: 'integrations', label: lang === 'ar' ? 'التكاملات' : 'Integrations' },
    { id: 'billing', label: lang === 'ar' ? 'الفواتير' : 'Billing' },
    { id: 'security', label: lang === 'ar' ? 'الأمان' : 'Security & Privacy' },
    { id: 'troubleshooting', label: lang === 'ar' ? 'استكشاف الأخطاء' : 'Troubleshooting' },
    { id: 'faq', label: lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ' },
  ];

  const articles = [
    {
      id: 1,
      category: 'getting-started',
      title: lang === 'ar' ? 'البدء مع مدار' : 'Getting Started with Madar',
      excerpt: lang === 'ar' ? 'دليل شامل للخطوات الأولى' : 'A comprehensive guide to your first steps',
      updated: '2025-12-20',
      popular: true,
    },
    {
      id: 2,
      category: 'getting-started',
      title: lang === 'ar' ? 'إعداد حسابك' : 'Setting Up Your Account',
      excerpt: lang === 'ar' ? 'تعرف على كيفية إنشاء وتأكيد حسابك' : 'Learn how to create and verify your account',
      updated: '2025-12-19',
    },
    {
      id: 3,
      category: 'account',
      title: lang === 'ar' ? 'تغيير كلمة المرور' : 'Changing Your Password',
      excerpt: lang === 'ar' ? 'خطوات آمنة لتحديث كلمة المرور' : 'Secure steps to update your password',
      updated: '2025-12-18',
    },
    {
      id: 4,
      category: 'properties',
      title: lang === 'ar' ? 'إضافة عقار جديد' : 'Adding a New Property',
      excerpt: lang === 'ar' ? 'دليل كامل لإضافة عقارك الأول' : 'Complete guide to adding your property',
      updated: '2025-12-20',
      popular: true,
    },
    {
      id: 5,
      category: 'properties',
      title: lang === 'ar' ? 'ربط منصات الحجز' : 'Connecting Booking Platforms',
      excerpt: lang === 'ar' ? 'اربط Airbnb و Booking.com وغيرها' : 'Connect Airbnb, Booking.com and more',
      updated: '2025-12-17',
    },
    {
      id: 6,
      category: 'pricing',
      title: lang === 'ar' ? 'فهم التسعير الديناميكي' : 'Understanding Dynamic Pricing',
      excerpt: lang === 'ar' ? 'كيف يعمل نظام التسعير الذكي' : 'How smart pricing recommendations work',
      updated: '2025-12-19',
    },
    {
      id: 7,
      category: 'analytics',
      title: lang === 'ar' ? 'قراءة تقارير الأداء' : 'Reading Performance Reports',
      excerpt: lang === 'ar' ? 'تحليل مقاييس مهمة' : 'Analyze important metrics',
      updated: '2025-12-20',
      popular: true,
    },
    {
      id: 8,
      category: 'integrations',
      title: lang === 'ar' ? 'تكامل Airbnb' : 'Airbnb Integration Guide',
      excerpt: lang === 'ar' ? 'ربط حسابك على Airbnb خطوة بخطوة' : 'Connect your Airbnb account step by step',
      updated: '2025-12-16',
    },
    {
      id: 9,
      category: 'billing',
      title: lang === 'ar' ? 'الفواتير والدفع' : 'Billing and Payments',
      excerpt: lang === 'ar' ? 'معلومات عن الفواتير وطرق الدفع' : 'Information about billing and payment methods',
      updated: '2025-12-15',
    },
    {
      id: 10,
      category: 'faq',
      title: lang === 'ar' ? 'هل تحتاج إلى مساعدة؟' : 'How can I get help?',
      excerpt: lang === 'ar' ? 'طرق التواصل مع الدعم' : 'Ways to contact our support team',
      updated: '2025-12-20',
    },
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const popularArticles = articles.filter(a => a.popular);

  const bgCard = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-[#EFF6FA] border border-[#06131F]/10';

  const textColor = theme === 'dark' ? 'text-[#F2F8FC]' : 'text-[#06131F]';
  const textMuted = theme === 'dark' ? 'text-[#F2F8FC]/60' : 'text-[#06131F]/60';

  return (
    <div className={`min-h-screen ${
      theme === 'dark'
        ? 'bg-background text-foreground'
        : 'bg-white text-[#06131F]'
    }`}>
      <PublicNavbar />

      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeIn className="text-center mb-12">
            <h1 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${textColor}`}>
              {lang === 'ar' ? 'مركز المساعدة' : 'Help Center'}
            </h1>
            <p className={`text-lg max-w-2xl mx-auto mb-8 ${textMuted}`}>
              {lang === 'ar'
                ? 'ابحث عن إجابات وحلول لأسئلتك'
                : 'Find answers and solutions to your questions'}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن مقالات...' : 'Search articles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} px-4 py-3 rounded-lg text-sm transition-all ${
                  theme === 'dark'
                    ? 'bg-white/[0.04] border border-white/[0.08] text-[#F2F8FC] placeholder-[#F2F8FC]/40 focus:ring-2 focus:ring-[#1B84C4]/20 focus:border-[#1B84C4]/50'
                    : 'bg-[#06131F]/5 border border-[#06131F]/10 text-[#06131F] placeholder-[#06131F]/40 focus:ring-2 focus:ring-[#1B84C4]/20 focus:border-[#1B84C4]/50'
                }`}
              />
            </div>
          </FadeIn>

          {/* Popular Articles */}
          {searchQuery === '' && (
            <FadeIn delay={0.1} className="mb-16">
              <h2 className={`font-heading font-bold text-2xl mb-6 ${textColor}`}>
                {lang === 'ar' ? 'المقالات الشهيرة' : 'Popular Articles'}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularArticles.map((article, idx) => (
                  <StaggerItem key={article.id}>
                    <button
                      onClick={() => alert(`Article: ${article.title}`)}
                      className={`p-6 rounded-lg text-left transition-all hover:border-[#1B84C4]/50 ${bgCard}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <BookOpen className="w-5 h-5 text-[#1B84C4] flex-shrink-0 mt-0.5" />
                        <h3 className={`font-bold ${textColor}`}>
                          {article.title}
                        </h3>
                      </div>
                      <p className={`text-sm mb-3 ${textMuted}`}>
                        {article.excerpt}
                      </p>
                      <p className={`text-xs ${textMuted}`}>
                        {lang === 'ar' ? 'محدّث:' : 'Updated:'} {new Date(article.updated).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </button>
                  </StaggerItem>
                ))}
              </div>
            </FadeIn>
          )}

          {/* Categories */}
          <FadeIn delay={0.2} className="mb-12">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white'
                    : theme === 'dark'
                      ? 'bg-white/[0.04] text-[#F2F8FC]/70 hover:bg-white/[0.08]'
                      : 'bg-[#06131F]/5 text-[#06131F]/70 hover:bg-[#06131F]/10'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white'
                      : theme === 'dark'
                        ? 'bg-white/[0.04] text-[#F2F8FC]/70 hover:bg-white/[0.08]'
                        : 'bg-[#06131F]/5 text-[#06131F]/70 hover:bg-[#06131F]/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Articles List */}
          <StaggerContainer>
            {filteredArticles.length > 0 ? (
              <div className="space-y-4">
                {filteredArticles.map(article => (
                  <StaggerItem key={article.id}>
                    <button
                      onClick={() => alert(`Article: ${article.title}`)}
                      className={`w-full p-6 rounded-lg text-left transition-all hover:border-[#1B84C4]/50 ${bgCard}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-bold mb-2 ${textColor}`}>
                            {article.title}
                          </h3>
                          <p className={`text-sm mb-3 ${textMuted}`}>
                            {article.excerpt}
                          </p>
                          <p className={`text-xs ${textMuted}`}>
                            {lang === 'ar' ? 'محدّث:' : 'Updated:'} {new Date(article.updated).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <Arrow className={`w-5 h-5 text-[#1B84C4] flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                  </StaggerItem>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-lg ${bgCard}`}>
                <p className={`text-sm mb-4 ${textMuted}`}>
                  {lang === 'ar' ? 'لم نجد مقالات مطابقة' : 'No articles found'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-sm text-[#1B84C4] hover:text-[#0F6BA8] transition-colors"
                >
                  {lang === 'ar' ? 'إعادة تعيين البحث' : 'Reset search'}
                </button>
              </div>
            )}
          </StaggerContainer>

          {/* Contact Support CTA */}
          <FadeIn delay={0.3} className="mt-16">
            <div className={`p-8 rounded-xl text-center ${bgCard}`}>
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[#1B84C4]" />
              <h3 className={`font-heading font-bold text-lg mb-2 ${textColor}`}>
                {lang === 'ar' ? 'هل لم تجد إجابتك؟' : "Didn't find your answer?"}
              </h3>
              <p className={`text-sm mb-6 ${textMuted}`}>
                {lang === 'ar'
                  ? 'يسعدنا مساعدتك. تواصل مع فريق الدعم لدينا'
                  : "We're here to help. Contact our support team"}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00548C] to-[#003152] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
              >
                {lang === 'ar' ? 'اتصل بنا' : 'Contact Support'}
                <Arrow className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>

      <ComprehensiveFooter />
    </div>
  );
}