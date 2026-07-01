import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import { FadeIn } from '@/components/madar/Motion';
import { AlertCircle, Building2, ShieldAlert } from 'lucide-react';

export default function ThirdPartyDisclaimer() {
  const { lang } = useLang();

  const points = [
    {
      titleEn: 'Independent Platform',
      titleAr: 'منصة مستقلة',
      contentEn: 'Madar is a completely independent software platform. We are not owned, operated, or managed by Airbnb, Gathern, Booking.com, or any other property management platform.',
      contentAr: 'مدار هي منصة برامج مستقلة تماماً. لا نملكها أو ندارها أو نديرها Airbnb أو Gathern أو Booking.com أو أي منصة إدارة عقارات أخرى.',
    },
    {
      titleEn: 'No Official Affiliation',
      titleAr: 'لا توجد انتماءات رسمية',
      contentEn: 'Unless explicitly stated in a formal written agreement, Madar is not officially affiliated, endorsed, or sponsored by any third-party platform. Using their APIs does not constitute partnership.',
      contentAr: 'ما لم يتم التصريح به بشكل صريح في اتفاق مكتوب رسمي، فإن مدار ليست معتمدة أو مدعومة أو برعاية أي منصة تابعة لجهات خارجية. استخدام واجهات برمجة التطبيقات الخاصة بهم لا يشكل شراكة.',
    },
    {
      titleEn: 'Third-Party Control',
      titleAr: 'السيطرة من جهات خارجية',
      contentEn: 'We cannot control third-party platform policies, features, availability, or performance. Changes made by Airbnb, Gathern, or Booking.com are beyond our responsibility.',
      contentAr: 'لا يمكننا التحكم في سياسات منصات الجهات الخارجية أو ميزاتها أو توفرها أو أدائها. التغييرات التي تجريها Airbnb أو Gathern أو Booking.com تقع خارج مسؤوليتنا.',
    },
    {
      titleEn: 'Service Outages & Issues',
      titleAr: 'انقطاعات الخدمة والمشاكل',
      contentEn: 'Madar is not responsible for outages, downtime, API changes, feature removals, or account restrictions imposed by third-party platforms. Contact their support directly for platform-specific issues.',
      contentAr: 'مدار ليست مسؤولة عن الانقطاعات أو الخمول أو تغييرات API أو إزالة الميزات أو قيود الحساب المفروضة من قبل منصات الجهات الخارجية. اتصل بالدعم الخاص بهم مباشرة للمشاكل الخاصة بالمنصة.',
    },
    {
      titleEn: 'Ranking & Algorithm Changes',
      titleAr: 'تغييرات التصنيف والخوارزميات',
      contentEn: 'Third-party platforms control search algorithms, pricing rankings, and listing visibility. Madar recommendations do not guarantee higher rankings or visibility on external platforms.',
      contentAr: 'تتحكم منصات الجهات الخارجية في خوارزميات البحث وتصنيفات الأسعار وظهور القائمات. لا تضمن توصيات مدار تصنيفات أعلى أو ظهوراً على منصات خارجية.',
    },
    {
      titleEn: 'Fees & Payment',
      titleAr: 'الرسوم والدفع',
      contentEn: 'Madar does not control or receive payment from third-party platforms\' booking fees, commission rates, or payment processing. These are managed directly by each platform.',
      contentAr: 'لا تتحكم مدار أو تستقبل الدفع من رسوم الحجز أو معدلات العمولة أو معالجة الدفع من منصات الجهات الخارجية. يتم إدارة هذه مباشرة من قبل كل منصة.',
    },
    {
      titleEn: 'User Compliance',
      titleAr: 'امتثال المستخدم',
      contentEn: 'You are responsible for complying with each third-party platform\'s Terms of Service, pricing policies, and rules. Madar does not monitor or enforce third-party compliance.',
      contentAr: 'أنت مسؤول عن الامتثال لشروط الخدمة والسياسات التسعيرية والقواعس الخاصة بكل منصة تابعة لجهات خارجية. لا تراقب مدار أو تفرض امتثال الجهات الخارجية.',
    },
    {
      titleEn: 'Data & Integration',
      titleAr: 'البيانات والتكامل',
      contentEn: 'Madar integrates with third-party APIs using your authorized credentials. We are not responsible for their data handling, security breaches, or privacy practices.',
      contentAr: 'تتكامل مدار مع واجهات برمجة التطبيقات التابعة لجهات خارجية باستخدام بيانات اعتمادك المصرح بها. لا نتحمل المسؤولية عن معالجتهم للبيانات أو الخروقات الأمنية أو ممارسات الخصوصية.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2EFE8] text-[#0A0B10]">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F2EFE8] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'إخلاء مسؤولية المنصات الخارجية' : 'Third-Party Platform Disclaimer'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60">
              {lang === 'ar'
                ? 'فهم استقلالية مدار والمسؤوليات فيما يتعلق بالمنصات الأخرى.'
                : 'Understanding Madar independence and responsibilities regarding other platforms.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'ما تحتاج لمعرفته' : 'What You Need to Know'}
            </h2>
            <p className="text-[#0A0B10]/60 leading-relaxed">
              {lang === 'ar'
                ? 'مدار تتكامل مع منصات الجهات الخارجية لتوفير قيمة إضافية. ومع ذلك، نحن مستقلون تماماً ولا ننطق باسم هذه المنصات.'
                : 'Madar integrates with third-party platforms to provide additional value. However, we are completely independent and do not speak on their behalf.'}
            </p>
          </FadeIn>

          <div className="space-y-5">
            {points.map((point, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="p-6 rounded-2xl border border-[#0A0B10]/[0.06] hover:border-[#D95F3B]/30 hover:bg-red-50/10 transition-all">
                  <div className="flex items-start gap-4">
                    <Building2 className="w-5 h-5 text-[#D95F3B] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-[#0A0B10] text-lg mb-2">
                        {lang === 'ar' ? point.titleAr : point.titleEn}
                      </h3>
                      <p className="text-[#0A0B10]/70 text-sm leading-relaxed">
                        {lang === 'ar' ? point.contentAr : point.contentEn}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Critical Notice */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300">
              <div className="flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-heading font-bold text-red-900 text-lg mb-4">
                    {lang === 'ar' ? 'إشعار حاسم' : 'Critical Notice'}
                  </h2>
                  <ul className="space-y-3 text-red-800 text-sm leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="font-bold">•</span>
                      <span>
                        {lang === 'ar'
                          ? 'مدار ليست مسؤولة عن أي خسائر في الإيرادات أو الحجوزات بسبب تغييرات في سياسات الجهات الخارجية.'
                          : 'Madar is not responsible for revenue or booking losses due to third-party policy changes.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold">•</span>
                      <span>
                        {lang === 'ar'
                          ? 'قد تحظر المنصات الخارجية الحسابات أو تفرض قيوداً بسبب انتهاك سياساتهم. لا علينا.'
                          : 'Third-party platforms may restrict or terminate accounts for policy violations. This is not our responsibility.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold">•</span>
                      <span>
                        {lang === 'ar'
                          ? 'لا تعتمد على توصيات مدار وحدها لأي قرار عمل حاسم.'
                          : 'Do not rely solely on Madar recommendations for critical business decisions.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold">•</span>
                      <span>
                        {lang === 'ar'
                          ? 'تابع سياسات وشروط الخدمة الخاصة بكل منصة خارجية بشكل منفصل.'
                          : 'Monitor each third-party platform\'s policies and Terms of Service separately.'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'هل لديك أسئلة حول التكاملات؟' : 'Questions about third-party integrations?'}
            </h2>
            <p className="text-[#0A0B10]/60 mb-8">
              {lang === 'ar'
                ? 'اتصل بنا لتوضيح العلاقة بيننا والمنصات الأخرى.'
                : 'Contact us to clarify our relationship with other platforms.'}
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all"
            >
              {lang === 'ar' ? 'اتصل بالدعم' : 'Contact Support'}
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-[#0A0B10]/[0.06] bg-[#F2EFE8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <span className="font-heading font-bold text-[#0A0B10]">Madar © 2025</span>
          </div>
          <div className="flex gap-8">
            <a href="/privacy" className="text-sm text-[#0A0B10]/40 hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'الخصوصية' : 'Privacy'}
            </a>
            <a href="/third-party" className="text-sm text-[#0A0B10]/40 hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'الجهات الخارجية' : 'Third-Party'}
            </a>
            <a href="/contact" className="text-sm text-[#0A0B10]/40 hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'اتصل بنا' : 'Contact'}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}