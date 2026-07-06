import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import { ArrowRight, ArrowLeft, Check, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowToUseMadar() {
  const { t, lang, isRTL } = useLang();
  const { theme } = useTheme();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    {
      number: 1,
      title: lang === 'ar' ? 'إنشاء حساب' : 'Create an Account',
      description: lang === 'ar'
        ? 'قم بالتسجيل باستخدام بريدك الإلكتروني والتحقق من حسابك لبدء الرحلة'
        : 'Sign up with your email and verify your account to get started',
      action: 'Sign Up',
    },
    {
      number: 2,
      title: lang === 'ar' ? 'اختر خطة الاشتراك' : 'Select Subscription Plan',
      description: lang === 'ar'
        ? 'اختر من الخطط (مجاني، أساسي، احترافي، برو) مع تجربة مجانية لمدة 14 يوماً'
        : 'Choose a plan (Free, Basic, Pro) with 14-day free trial included',
      action: 'View Plans',
    },
    {
      number: 3,
      title: lang === 'ar' ? 'أضف عقارك الأول' : 'Add Your First Property',
      description: lang === 'ar'
        ? 'أدخل تفاصيل عقارك (الموقع، عدد الغرف، الأسعار، والصور)'
        : 'Enter property details including location, amenities, pricing, and photos',
      action: 'Learn More',
    },
    {
      number: 4,
      title: lang === 'ar' ? 'ربط منصات الحجز' : 'Connect Booking Platforms',
      description: lang === 'ar'
        ? 'اربط Airbnb و Booking.com و Gatherin وغيرها لمزامنة البيانات تلقائياً'
        : 'Connect Airbnb, Booking.com, and other platforms for automatic data sync',
      action: 'Connect',
    },
    {
      number: 5,
      title: lang === 'ar' ? 'راجع الأداء' : 'Review Performance',
      description: lang === 'ar'
        ? 'شاهد الاشغال و ADR و RevPAR والمقارنات مع المنافسين'
        : 'View occupancy, ADR, RevPAR metrics and competitor comparisons',
      action: 'Dashboard',
    },
    {
      number: 6,
      title: lang === 'ar' ? 'احصل على توصيات التسعير' : 'Get Pricing Recommendations',
      description: lang === 'ar'
        ? 'استخدم توصيات التسعير الذكية لتحسين الإيرادات'
        : 'Use AI-powered pricing recommendations to maximize revenue',
      action: 'Smart Pricing',
    },
    {
      number: 7,
      title: lang === 'ar' ? 'راقب الفرص' : 'Monitor Opportunities',
      description: lang === 'ar'
        ? 'تابع التنبيهات و الفرص للإيرادات وتحسينات الأداء'
        : 'Track alerts, opportunities, and performance improvements',
      action: 'Alerts',
    },
    {
      number: 8,
      title: lang === 'ar' ? 'حمّل التقارير' : 'Download Reports',
      description: lang === 'ar'
        ? 'قم بتصدير التقارير والبيانات للتحليل والمشاركة'
        : 'Export reports and data for analysis and sharing',
      action: 'Analytics',
    },
  ];

  const features = [
    {
      title: lang === 'ar' ? 'لوحة معلومات شاملة' : 'Comprehensive Dashboard',
      description: lang === 'ar'
        ? 'عرض جميع عقاراتك وأداؤها في لمحة واحدة'
        : 'View all your properties and performance at a glance',
    },
    {
      title: lang === 'ar' ? 'تحليلات السوق' : 'Market Analytics',
      description: lang === 'ar'
        ? 'ادرس اتجاهات السوق والتنافسية والفرص'
        : 'Study market trends, competition, and opportunities',
    },
    {
      title: lang === 'ar' ? 'التسعير الذكي' : 'Smart Pricing',
      description: lang === 'ar'
        ? 'احصل على توصيات تسعير مدعومة بالذكاء الاصطناعي'
        : 'Get AI-powered pricing recommendations',
    },
    {
      title: lang === 'ar' ? 'المراقب الذكي' : 'Smart Coach',
      description: lang === 'ar'
        ? 'تلقّ مساعدة من مدرب ذكي مدعوم بالذكاء الاصطناعي'
        : 'Get assistance from an AI-powered smart coach',
    },
    {
      title: lang === 'ar' ? 'التنبيهات' : 'Smart Alerts',
      description: lang === 'ar'
        ? 'تنبيهات تلقائية عن فرص الإيرادات والمشاكل'
        : 'Automatic alerts for revenue opportunities and issues',
    },
    {
      title: lang === 'ar' ? 'تقارير مفصلة' : 'Detailed Reports',
      description: lang === 'ar'
        ? 'تقارير شاملة قابلة للتصدير والمشاركة'
        : 'Comprehensive reports ready to export and share',
    },
  ];

  const bgCard = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-[#F2EFE8] border border-[#0A0B10]/10';

  const textColor = theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]';
  const textMuted = theme === 'dark' ? 'text-[#F7F5F0]/60' : 'text-[#0A0B10]/60';

  return (
    <div className={`min-h-screen ${
      theme === 'dark'
        ? 'bg-background text-foreground'
        : 'bg-white text-[#0A0B10]'
    }`}>
      <PublicNavbar />

      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeIn className="text-center mb-16">
            <h1 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${textColor}`}>
              {lang === 'ar' ? 'طريقة استخدام مدار' : 'How to Use Madar'}
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${textMuted}`}>
              {lang === 'ar'
                ? 'دليل شامل خطوة بخطوة لتحقيق أقصى استفادة من منصة مدار'
                : 'A comprehensive step-by-step guide to get the most out of Madar'}
            </p>
          </FadeIn>

          {/* Steps */}
          <StaggerContainer className="space-y-6 mb-20">
            {steps.map((step, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ x: isRTL ? -8 : 8 }}
                  className={`p-6 rounded-xl ${bgCard} transition-all hover:border-[#D95F3B]/50`}
                >
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center text-white font-heading font-bold text-lg">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-heading font-bold text-lg mb-2 ${textColor}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm mb-4 ${textMuted}`}>
                        {step.description}
                      </p>
                      <Link
                        to={step.number === 1 ? '/signup' : step.number === 2 ? '/plans' : step.number === 4 ? '/connect' : step.number === 5 ? '/dashboard' : step.number === 6 ? '/market' : step.number === 7 ? '/alerts' : '/analytics'}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#D95F3B] hover:text-[#C8972A] transition-colors"
                      >
                        {step.action}
                        <Arrow className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Features */}
          <FadeIn delay={0.3} className="mb-20">
            <div className="mb-12">
              <h2 className={`font-heading text-3xl font-bold mb-4 ${textColor}`}>
                {lang === 'ar' ? 'المزايا الرئيسية' : 'Key Features'}
              </h2>
              <p className={textMuted}>
                {lang === 'ar'
                  ? 'استكشف أدوات قوية لتحسين عقاراتك'
                  : 'Discover powerful tools to optimize your properties'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className={`p-6 rounded-xl ${bgCard}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Check className="w-5 h-5 text-[#D95F3B] flex-shrink-0 mt-0.5" />
                    <h3 className={`font-bold ${textColor}`}>
                      {feature.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${textMuted}`}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.4} className="text-center">
            <div className={`p-8 rounded-xl ${bgCard}`}>
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-[#D95F3B]" />
              <h3 className={`font-heading font-bold text-lg mb-2 ${textColor}`}>
                {lang === 'ar' ? 'هل لديك أسئلة؟' : 'Have Questions?'}
              </h3>
              <p className={`text-sm mb-6 ${textMuted}`}>
                {lang === 'ar'
                  ? 'زيارة مركز المساعدة أو التواصل معنا'
                  : 'Visit our Help Center or contact our support team'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/help"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
                >
                  {lang === 'ar' ? 'مركز المساعدة' : 'Help Center'}
                  <Arrow className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-white/[0.04] text-[#F7F5F0] hover:bg-white/[0.08]'
                      : 'bg-[#0A0B10]/5 text-[#0A0B10] hover:bg-[#0A0B10]/10'
                  }`}
                >
                  {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                  <Arrow className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>

      <ComprehensiveFooter />
    </div>
  );
}