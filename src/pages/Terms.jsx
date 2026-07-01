import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import PageFooter from '@/components/madar/PageFooter';
import { FadeIn } from '@/components/madar/Motion';
import { FileText } from 'lucide-react';

export default function Terms() {
  const { lang } = useLang();

  const sections = [
    {
      num: '1',
      titleEn: 'Acceptance of Terms',
      titleAr: 'قبول الشروط',
      contentEn: 'By accessing and using Madar, you agree to be bound by these Terms of Service. If you do not agree with any part, you must discontinue use immediately.',
      contentAr: 'بالوصول واستخدام مدار، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي جزء، يجب عليك إيقاف الاستخدام فوراً.',
    },
    {
      num: '2',
      titleEn: 'User Responsibilities',
      titleAr: 'مسؤوليات المستخدم',
      contentEn: 'You are responsible for maintaining the confidentiality of your account credentials, for all activities under your account, and for notifying us of any unauthorized access. You agree to provide accurate information and not to use the service for illegal purposes.',
      contentAr: 'أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك، وعن جميع الأنشطة تحت حسابك، وعن إخطارنا بأي وصول غير مصرح به. توافق على تقديم معلومات دقيقة وعدم استخدام الخدمة لأغراض غير قانونية.',
    },
    {
      num: '3',
      titleEn: 'Subscription Terms',
      titleAr: 'شروط الاشتراك',
      contentEn: 'Subscriptions auto-renew at the end of each billing cycle unless canceled. All paid subscription plans include a 14-day free trial with full access to plan features. No charges occur during the trial period. Charges begin only after the trial ends if you have not canceled. Customers may cancel before the trial ends to avoid being charged. Once the paid subscription begins, payments are non-refundable, subject to applicable laws. Prices may change with 30 days notice. You can upgrade, downgrade, or cancel anytime.',
      contentAr: 'يتم تجديد الاشتراكات تلقائياً في نهاية كل دورة فواتير ما لم يتم إلغاؤها. تتضمن جميع خطط الاشتراك المدفوعة فترة تجريبية مجانية لمدة 14 يوماً مع الوصول الكامل إلى ميزات الخطة. لا يتم فرض أي رسوم خلال فترة المحاكمة. تبدأ الرسوم فقط بعد انتهاء الفترة التجريبية إذا لم تقم بالإلغاء. يمكن للعملاء الإلغاء قبل انتهاء الفترة التجريبية لتجنب الخصم. بعد بدء الاشتراك المدفوع، تكون المبالغ غير قابلة للاسترداد، مع مراعاة الأنظمة المعمول بها. قد تتغير الأسعار مع إشعار قدره 30 يوماً. يمكنك الترقية أو التخفيض أو الإلغاء في أي وقت.',
    },
    {
      num: '4',
      titleEn: 'Intellectual Property',
      titleAr: 'الملكية الفكرية',
      contentEn: 'All content, features, and software are owned by Madar. You may not copy, modify, distribute, or reverse-engineer any part of the service. You retain ownership of your data, but grant Madar the right to use it for service delivery and improvement.',
      contentAr: 'جميع المحتوى والميزات والبرامج مملوكة لمدار. لا يجوز نسخ أو تعديل أو توزيع أو محاولة عكس هندسة أي جزء من الخدمة. أنت تحتفظ بملكية البيانات الخاصة بك، لكنك تمنح مدار الحق في استخدامها لتقديم الخدمة والتحسين.',
    },
    {
      num: '5',
      titleEn: 'Third-Party Integrations',
      titleAr: 'التكاملات من جهات خارجية',
      contentEn: 'Madar integrates with Airbnb, Gatherin, Booking.com, and payment processors. You are responsible for complying with their terms. We are not liable for their performance, data breaches, or policy changes.',
      contentAr: 'تتكامل مدار مع Airbnb و Gatherin و Booking.com ومعالجات الدفع. أنت مسؤول عن الامتثال لشروطهم. لا نتحمل المسؤولية عن أدائهم أو اختراقات البيانات أو تغييرات السياسة.',
    },
    {
      num: '6',
      titleEn: 'Limitation of Liability',
      titleAr: 'تحديد المسؤولية',
      contentEn: 'Madar provides the service "as-is" without warranties of accuracy or completeness. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages. Our liability is limited to the amount paid in the last 12 months.',
      contentAr: 'تقدم مدار الخدمة "كما هي" بدون ضمانات الدقة أو الاكتمال. وإلى أقصى حد يسمح به القانون، لا نتحمل المسؤولية عن الأضرار غير المباشرة أو العرضية أو الناشئة. تقتصر مسؤوليتنا على المبلغ المدفوع في آخر 12 شهراً.',
    },
    {
      num: '7',
      titleEn: 'Disclaimers',
      titleAr: 'إخلاءات المسؤولية',
      contentEn: 'AI Recommendations: Madar provides pricing recommendations based on AI analysis, market data, and historical trends. These are predictions and not guarantees. Your actual revenue may differ. You are responsible for your final pricing decisions. Market Data: Aggregated data is provided for informational purposes; we do not guarantee accuracy or completeness. Technical Issues: We are not liable for service interruptions, data loss, or performance issues beyond our reasonable control.',
      contentAr: 'توصيات الذكاء الاصطناعي: توفر مدار توصيات التسعير بناءً على تحليل الذكاء الاصطناعي وبيانات السوق والاتجاهات التاريخية. هذه تنبؤات وليست ضمانات. قد تختلف إيراداتك الفعلية. أنت مسؤول عن قرارات التسعير النهائية. بيانات السوق: يتم توفير البيانات المجمعة لأغراض إعلامية؛ لا نضمن الدقة أو الاكتمال. المشاكل التقنية: لا نتحمل المسؤولية عن انقطاعات الخدمة أو فقدان البيانات أو مشاكل الأداء التي تخرج عن السيطرة المعقولة.',
    },
    {
      num: '8',
      titleEn: 'Prohibited Activities',
      titleAr: 'الأنشطة المحظورة',
      contentEn: 'You must not: Engage in fraud, hacking, or unauthorized access. Use the service for illegal activities. Interfere with security or attempt to bypass restrictions. Scrape data or use bots. Harass, abuse, or threaten other users. Violate intellectual property rights. Spam or send malicious content.',
      contentAr: 'لا يجوز لك: الانخراط في الاحتيال أو الاختراق أو الوصول غير المصرح به. استخدام الخدمة لأنشطة غير قانونية. التدخل في الأمان أو محاولة تجاوز القيود. خردة البيانات أو استخدام الروبوتات. مضايقة أو إساءة أو تهديد المستخدمين الآخرين. انتهاك حقوق الملكية الفكرية. الرسائل غير المرغوب فيها أو إرسال محتوى ضار.',
    },
    {
      num: '9',
      titleEn: 'Termination',
      titleAr: 'الإنهاء',
      contentEn: 'We may suspend or terminate your account for: Violation of these terms. Illegal activity. Fraud or abuse. Non-payment. Extended inactivity (180+ days). You may delete your account anytime from settings. Termination does not relieve you of payment obligations for active subscriptions.',
      contentAr: 'قد نعلق أو نحذف حسابك بسبب: انتهاك هذه الشروط. النشاط غير القانوني. الاحتيال أو الإساءة. عدم الدفع. الخمول الممتد (180+ يوماً). يمكنك حذف حسابك في أي وقت من الإعدادات. الإنهاء لا يحررك من التزامات الدفع للاشتراكات النشطة.',
    },
    {
      num: '10',
      titleEn: 'Indemnification',
      titleAr: 'التعويض',
      contentEn: 'You agree to indemnify, defend, and hold harmless Madar and its officers, employees, and agents from any claims, damages, or losses arising from your use of the service, your content, or violation of these terms.',
      contentAr: 'توافق على تعويض ودفاع وحماية مدار وموظفيها والعملاء من أي مطالبات أو أضرار أو خسائر ناشئة عن استخدامك للخدمة أو المحتوى الخاص بك أو انتهاك هذه الشروط.',
    },
    {
      num: '11',
      titleEn: 'Governing Law',
      titleAr: 'القانون الحاكم',
      contentEn: 'These Terms are governed by the laws of Saudi Arabia. Any disputes are subject to the exclusive jurisdiction of Saudi courts.',
      contentAr: 'تحكم هذه الشروط قوانين المملكة العربية السعودية. تخضع أي نزاعات للاختصاص الحصري للمحاكم السعودية.',
    },
    {
      num: '12',
      titleEn: 'Changes to Terms',
      titleAr: 'التغييرات على الشروط',
      contentEn: 'We may update these Terms at any time. Material changes will be communicated via email or prominent notice. Continued use after updates constitutes acceptance. Last Updated: July 1, 2025.',
      contentAr: 'قد نحدث هذه الشروط في أي وقت. سيتم إبلاغ التغييرات المهمة عبر البريد الإلكتروني أو إشعار بارز. الاستمرار في الاستخدام بعد التحديثات يشكل قبول. آخر تحديث: 1 يوليو 2025.',
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
              <FileText className="w-16 h-16 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60 mb-4">
              {lang === 'ar'
                ? 'يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا.'
                : 'Please read these terms carefully before using our services.'}
            </p>
            <p className="text-sm text-[#0A0B10]/40">
              {lang === 'ar'
                ? 'آخر تحديث: 1 يوليو 2025'
                : 'Last Updated: July 1, 2025'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="pb-12 border-b border-[#0A0B10]/[0.06] last:border-b-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {section.num}
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#0A0B10] pt-1">
                    {lang === 'ar' ? section.titleAr : section.titleEn}
                  </h2>
                </div>
                <div className="ml-14 text-[#0A0B10]/70 leading-relaxed">
                  {lang === 'ar' ? section.contentAr : section.contentEn}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F2EFE8]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'لديك أسئلة حول شروطنا؟' : 'Questions about our Terms?'}
            </h2>
            <p className="text-[#0A0B10]/60 mb-8">
              {lang === 'ar'
                ? 'تواصل معنا على صفحة اتصل بنا أو أرسل بريداً إلكترونياً إلى Admin@baytic.app أو اتصل بـ +966 53 810 0119.'
                : 'Contact us on our Contact page or email Admin@baytic.app or call +966 53 810 0119.'}
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all"
            >
              {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </a>
          </FadeIn>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}