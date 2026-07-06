import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { FadeIn } from '@/components/madar/Motion';
import { Accessibility as AccessibilityIcon, Keyboard, Contrast, Smartphone, LifeBuoy, RefreshCw } from 'lucide-react';

// Standalone bilingual accessibility statement, modeled on madar's existing
// public legal/content pages (e.g. ThirdPartyDisclaimer). Not part of the
// versioned POLICY_ROUTES consent system — this is an informational statement,
// not a policy requiring version stamps or acceptance.
export default function Accessibility() {
  const { lang, isRTL } = useLang();
  const ar = lang === 'ar';

  const commitments = [
    {
      Icon: Keyboard,
      titleEn: 'Keyboard Navigation',
      titleAr: 'التنقل عبر لوحة المفاتيح',
      contentEn: 'Interactive elements are reachable and operable with a keyboard, with a visible focus indicator, so you can navigate Madar without a mouse.',
      contentAr: 'يمكن الوصول إلى العناصر التفاعلية وتشغيلها باستخدام لوحة المفاتيح، مع مؤشر تركيز واضح، حتى تتمكن من التنقل في مدار دون الحاجة إلى الفأرة.',
    },
    {
      Icon: Contrast,
      titleEn: 'Readable Contrast & Text',
      titleAr: 'تباين ونص قابلان للقراءة',
      contentEn: 'We aim for sufficient color contrast and legible text sizing across light and dark themes, and support your browser or device text-scaling settings.',
      contentAr: 'نسعى لتوفير تباين ألوان كافٍ وأحجام نص واضحة عبر الوضعين الفاتح والداكن، مع دعم إعدادات تكبير النص في متصفحك أو جهازك.',
    },
    {
      Icon: Smartphone,
      titleEn: 'Responsive Design',
      titleAr: 'تصميم متجاوب',
      contentEn: 'Madar adapts to phones, tablets, and desktops, and fully supports right-to-left (Arabic) layouts so the experience reads naturally in your language.',
      contentAr: 'يتكيف مدار مع الهواتف والأجهزة اللوحية وأجهزة سطح المكتب، ويدعم بالكامل التخطيطات من اليمين إلى اليسار (العربية) لتكون التجربة طبيعية بلغتك.',
    },
    {
      Icon: AccessibilityIcon,
      titleEn: 'Assistive Technology',
      titleAr: 'التقنيات المساعدة',
      contentEn: 'We use semantic structure and descriptive labels to improve compatibility with screen readers and other assistive technologies, guided by recognized standards such as WCAG.',
      contentAr: 'نستخدم بنية دلالية وتسميات وصفية لتحسين التوافق مع قارئات الشاشة والتقنيات المساعدة الأخرى، مسترشدين بمعايير معترف بها مثل WCAG.',
    },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F2EFE8] text-[#0A0B10]">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F2EFE8] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="flex justify-center mb-6">
              <AccessibilityIcon className="w-16 h-16 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {ar ? 'إمكانية الوصول' : 'Accessibility'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60">
              {ar
                ? 'التزامنا بتوفير تجربة يمكن للجميع استخدامها والوصول إليها.'
                : 'Our commitment to an experience everyone can use and access.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Commitment intro */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="font-heading text-3xl font-bold text-[#0A0B10] mb-4">
              {ar ? 'التزامنا' : 'Our Commitment'}
            </h2>
            <p className="text-[#0A0B10]/70 leading-relaxed">
              {ar
                ? 'في مدار، نؤمن بأن أدوات إدارة العقارات يجب أن تكون في متناول الجميع. نعمل باستمرار على تحسين إمكانية الوصول إلى منصتنا لتكون قابلة للاستخدام من قِبل أكبر عدد ممكن من الأشخاص، بمختلف قدراتهم والأجهزة التي يستخدمونها.'
                : 'At Madar, we believe property-management tools should be usable by everyone. We continuously work to improve the accessibility of our platform so it can be used by as many people as possible, across a wide range of abilities and devices.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Commitment cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-5 sm:grid-cols-2">
            {commitments.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="h-full p-6 rounded-2xl border border-[#0A0B10]/[0.06] hover:border-[#D95F3B]/30 transition-all">
                  <item.Icon className="w-6 h-6 text-[#D95F3B] mb-3" />
                  <h3 className="font-heading font-bold text-[#0A0B10] text-lg mb-2">
                    {ar ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-[#0A0B10]/70 text-sm leading-relaxed">
                    {ar ? item.contentAr : item.contentEn}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Ongoing improvement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="p-8 rounded-2xl bg-white border border-[#0A0B10]/[0.06]">
              <div className="flex items-start gap-4">
                <RefreshCw className="w-6 h-6 text-[#D95F3B] flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-heading font-bold text-[#0A0B10] text-lg mb-3">
                    {ar ? 'تحسينات مستمرة' : 'Ongoing Improvements'}
                  </h2>
                  <p className="text-[#0A0B10]/70 text-sm leading-relaxed">
                    {ar
                      ? 'إمكانية الوصول رحلة مستمرة وليست وجهة نهائية. نراجع منصتنا ونحسّنها باستمرار، وقد لا تكون بعض أجزائها متوافقة تمامًا بعد. نرحّب بملاحظاتك لمساعدتنا على التحسين.'
                      : 'Accessibility is an ongoing journey, not a final destination. We regularly review and improve the platform, and some parts may not yet be fully conformant. We welcome your feedback to help us improve.'}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Support / contact path */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-[#D95F3B]/10 to-[#C8972A]/10 border border-[#D95F3B]/20 text-center">
              <LifeBuoy className="w-8 h-8 text-[#D95F3B] mx-auto mb-4" />
              <h2 className="font-heading font-bold text-[#0A0B10] text-xl mb-3">
                {ar ? 'تحتاج مساعدة أو واجهت عائقًا؟' : 'Need help or hit a barrier?'}
              </h2>
              <p className="text-[#0A0B10]/70 text-sm leading-relaxed mb-6 max-w-xl mx-auto">
                {ar
                  ? 'إذا واجهت أي صعوبة في الوصول إلى أي جزء من مدار، أو كان لديك اقتراح لتحسين إمكانية الوصول، يسعدنا سماعك.'
                  : 'If you experience any difficulty accessing any part of Madar, or have a suggestion to improve accessibility, we would love to hear from you.'}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium hover:opacity-90 transition-opacity"
              >
                {ar ? 'تواصل معنا' : 'Contact Us'}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <ComprehensiveFooter />
    </div>
  );
}
