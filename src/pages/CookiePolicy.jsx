import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import PageFooter from '@/components/madar/PageFooter';
import { FadeIn } from '@/components/madar/Motion';
import { Cookie, Settings, Info } from 'lucide-react';

export default function CookiePolicy() {
  const { lang } = useLang();

  const cookieTypes = [
    {
      titleEn: 'Essential Cookies',
      titleAr: 'ملفات تعريف الارتباط الأساسية',
      descEn: 'Required for login, authentication, and security. These cannot be disabled.',
      descAr: 'مطلوبة لتسجيل الدخول والمصادقة والأمان. لا يمكن تعطيلها.',
      durationEn: 'Duration: Session or 1 year',
      durationAr: 'المدة: جلسة أو سنة واحدة',
      examples: ['session_id', 'auth_token', 'csrf_token', 'security_preferences'],
    },
    {
      titleEn: 'Performance Cookies',
      titleAr: 'ملفات تعريف الارتباط الخاصة بالأداء',
      descEn: 'Measure how users interact with features. Used for analytics and improvement.',
      descAr: 'قياس كيفية تفاعل المستخدمين مع الميزات. تستخدم للتحليلات والتحسين.',
      durationEn: 'Duration: 1-2 years',
      durationAr: 'المدة: 1-2 سنة',
      examples: ['_ga', '_gid', 'pageviews', 'feature_usage', 'error_logs'],
    },
    {
      titleEn: 'Preference Cookies',
      titleAr: 'ملفات تعريف الارتباط الخاصة بالتفضيلات',
      descEn: 'Remember your settings like language, theme, and layout preferences.',
      descAr: 'تذكر إعداداتك مثل اللغة والمظهر وتفضيلات التخطيط.',
      durationEn: 'Duration: 1 year',
      durationAr: 'المدة: سنة واحدة',
      examples: ['language', 'theme_preference', 'sidebar_state', 'layout_mode'],
    },
    {
      titleEn: 'Marketing Cookies',
      titleAr: 'ملفات تعريف الارتباط التسويقية',
      descEn: 'Track user behavior across platforms for targeted advertising and retargeting.',
      descAr: 'تتبع سلوك المستخدم عبر المنصات للإعلانات المستهدفة وإعادة الاستهداف.',
      durationEn: 'Duration: 1-2 years',
      durationAr: 'المدة: 1-2 سنة',
      examples: ['facebook_pixel', 'google_ads', 'conversion_tracking', 'user_journey'],
    },
  ];

  const thirdPartyTechs = [
    { name: 'Google Analytics', purpose: lang === 'ar' ? 'تحليلات المستخدم' : 'User analytics', link: 'https://policies.google.com/privacy' },
    { name: 'Stripe', purpose: lang === 'ar' ? 'معالجة الدفع' : 'Payment processing', link: 'https://stripe.com/privacy' },
    { name: 'Facebook Pixel', purpose: lang === 'ar' ? 'الإعلانات المستهدفة' : 'Targeted ads', link: 'https://facebook.com/privacy' },
    { name: 'Google Ads', purpose: lang === 'ar' ? 'الإعلانات المستهدفة' : 'Targeted ads', link: 'https://policies.google.com/privacy' },
  ];

  return (
    <div className="min-h-screen bg-[#F2EFE8] text-[#0A0B10]">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F2EFE8] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="flex justify-center mb-6">
              <Cookie className="w-16 h-16 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60">
              {lang === 'ar'
                ? 'تعرف على كيفية استخدام ملفات تعريف الارتباط وتحكم في تفضيلاتك.'
                : 'Learn how we use cookies and control your preferences.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <FadeIn className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'ما هي ملفات تعريف الارتباط؟' : 'What Are Cookies?'}
            </h2>
            <p className="text-[#0A0B10]/70 leading-relaxed">
              {lang === 'ar'
                ? 'ملفات تعريف الارتباط هي ملفات صغيرة يتم تخزينها على جهازك. تساعدنا على تذكر تفضيلاتك وفهم كيفية استخدام موقعنا.'
                : 'Cookies are small files stored on your device. They help us remember your preferences and understand how you use our site.'}
            </p>
          </FadeIn>

          {/* Cookie Types */}
          <FadeIn className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-8">
              {lang === 'ar' ? 'أنواع ملفات تعريف الارتباط' : 'Types of Cookies'}
            </h2>
            <div className="space-y-6">
              {cookieTypes.map((cookie, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="p-6 rounded-2xl border border-[#0A0B10]/[0.06] hover:border-[#D95F3B]/30 transition-colors">
                    <div className="flex items-start gap-4 mb-4">
                      <Cookie className="w-5 h-5 text-[#D95F3B] flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-[#0A0B10] text-lg">
                          {lang === 'ar' ? cookie.titleAr : cookie.titleEn}
                        </h3>
                        <p className="text-sm text-[#0A0B10]/60 mt-1">
                          {lang === 'ar' ? cookie.durationAr : cookie.durationEn}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#0A0B10]/70 leading-relaxed mb-4">
                      {lang === 'ar' ? cookie.descAr : cookie.descEn}
                    </p>
                    <div className="text-xs text-[#0A0B10]/50">
                      <span className="font-semibold">{lang === 'ar' ? 'أمثلة:' : 'Examples:'}</span>
                      {' '}
                      {cookie.examples.join(', ')}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          {/* Third-Party */}
          <FadeIn className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-8">
              {lang === 'ar' ? 'تقنيات الجهات الخارجية' : 'Third-Party Technologies'}
            </h2>
            <div className="space-y-3">
              {thirdPartyTechs.map((tech, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <a href={tech.link} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-[#F2EFE8] hover:bg-[#0A0B10]/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[#0A0B10]">{tech.name}</h4>
                        <p className="text-sm text-[#0A0B10]/60">{tech.purpose}</p>
                      </div>
                      <Info className="w-4 h-4 text-[#0A0B10]/40" />
                    </div>
                  </a>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          {/* Control & Withdrawal */}
          <FadeIn className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'التحكم في ملفات تعريف الارتباط' : 'Control Your Cookies'}
            </h2>
            <div className="space-y-4 text-[#0A0B10]/70 leading-relaxed">
              <p>
                {lang === 'ar'
                  ? 'يمكنك إدارة تفضيلات ملفات تعريف الارتباط في أي وقت:'
                  : 'You can manage cookie preferences anytime:'}
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <span className="text-[#D95F3B] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'استخدم "مركز تفضيلات ملفات تعريف الارتباط" في أسفل الصفحة'
                      : 'Use the "Cookie Preferences Center" at the bottom of the page'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D95F3B] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'غير إعدادات المتصفح لحظر جميع ملفات تعريف الارتباط'
                      : 'Change browser settings to block all cookies'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D95F3B] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'استخدم وضع التصفح الخاص (لا يتم حفظ ملفات تعريف الارتباط)'
                      : 'Use private/incognito browsing mode'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D95F3B] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'اختر من قائمة خيارات عدم التتبع في المتصفح'
                      : 'Opt out via "Do Not Track" browser option'}
                  </span>
                </li>
              </ul>
            </div>
          </FadeIn>

          {/* Policy Update */}
          <FadeIn>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200">
              <h3 className="font-heading font-bold text-blue-900 mb-2">
                {lang === 'ar' ? 'آخر تحديث' : 'Last Updated'}
              </h3>
              <p className="text-blue-800 text-sm">July 1, 2025</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}