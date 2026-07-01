import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import PageFooter from '@/components/madar/PageFooter';
import { FadeIn } from '@/components/madar/Motion';
import { Shield, Lock, Database, Share2, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  const { lang } = useLang();

  const sections = [
    {
      iconEn: '1',
      iconAr: '١',
      titleEn: 'Data We Collect',
      titleAr: 'البيانات التي نجمعها',
      contentEn: [
        'Account Information: Full name, email address, phone number, password, business name, property count.',
        'Property Data: Property addresses, descriptions, images, rental rates, booking history, occupancy data, platform credentials (for Airbnb, Gatherin, Booking.com connections).',
        'Payment Information: Billing address, payment method (credit/debit card), transaction history, subscription plan details.',
        'Device & Usage Data: IP address, browser type, device type, pages visited, time spent on features, interaction patterns, error logs.',
        'Communication Data: Support tickets, email inquiries, chat messages, feedback, survey responses.',
      ],
      contentAr: [
        'معلومات الحساب: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، كلمة المرور، اسم العمل، عدد العقارات.',
        'بيانات العقارات: عناوين العقارات، الأوصاف، الصور، معدلات الإيجار، سجل الحجوزات، بيانات الإشغال، بيانات اعتماد المنصة (لاتصالات Airbnb و Gatherin و Booking.com).',
        'معلومات الدفع: عنوان الفاتورة، طريقة الدفع (بطاقة ائتمان/خصم)، سجل المعاملات، تفاصيل خطة الاشتراك.',
        'بيانات الجهاز والاستخدام: عنوان IP، نوع المتصفح، نوع الجهاز، الصفحات التي تمت زيارتها، الوقت المستغرق في الميزات، أنماط التفاعل، سجلات الأخطاء.',
        'بيانات الاتصال: تذاكر الدعم، استفسارات البريد الإلكتروني، رسائل الدردشة، التعليقات، ردود المسح.',
      ],
    },
    {
      iconEn: '2',
      iconAr: '٢',
      titleEn: 'Why We Collect Data',
      titleAr: 'لماذا نجمع البيانات',
      contentEn: [
        'Service Delivery: To provide AI pricing recommendations, occupancy forecasting, market intelligence, and analytics.',
        'Account Management: To create accounts, manage subscriptions, authenticate users, process payments.',
        'Platform Integration: To connect your rental platform accounts (Airbnb, Gatherin, Booking.com) and sync data.',
        'Analytics & Improvement: To understand user behavior, improve features, enhance performance, and fix bugs.',
        'Customer Support: To respond to inquiries, provide technical support, and resolve disputes.',
        'Security & Compliance: To detect fraud, prevent abuse, maintain legal compliance, and protect user data.',
        'Marketing (with consent): To send newsletters, feature updates, and promotional content.',
      ],
      contentAr: [
        'تقديم الخدمات: لتقديم توصيات التسعير الذكية والتنبؤ بالإشغال وذكاء السوق والتحليلات.',
        'إدارة الحساب: لإنشاء الحسابات وإدارة الاشتراكات والتحقق من المستخدمين ومعالجة المدفوعات.',
        'تكامل المنصة: لربط حسابات منصات الإيجار الخاصة بك (Airbnb و Gatherin و Booking.com) ومزامنة البيانات.',
        'التحليلات والتحسين: لفهم سلوك المستخدم وتحسين الميزات وتحسين الأداء وإصلاح الأخطاء.',
        'خدمة العملاء: للرد على الاستفسارات وتقديم الدعم الفني وحل النزاعات.',
        'الأمان والامتثال: لاكتشاف الاحتيال ومنع الإساءة والحفاظ على الامتثال القانوني وحماية بيانات المستخدم.',
        'التسويق (مع الموافقة): لإرسال رسائل إخبارية وتحديثات الميزات والمحتوى الترويجي.',
      ],
    },
    {
      iconEn: '3',
      iconAr: '٣',
      titleEn: 'Lawful Basis for Processing',
      titleAr: 'الأساس القانوني للمعالجة',
      contentEn: [
        'Contract Performance: Processing data necessary to fulfill your subscription agreement and provide services.',
        'User Consent: Explicit consent for cookies, marketing emails, and non-essential processing.',
        'Legal Obligation: Compliance with Saudi Personal Data Protection Law, tax regulations, and anti-money laundering requirements.',
        'Legitimate Interests: Analytics, security, fraud prevention, and service optimization.',
      ],
      contentAr: [
        'تنفيذ العقد: معالجة البيانات الضرورية لتنفيذ اتفاق الاشتراك الخاص بك وتقديم الخدمات.',
        'موافقة المستخدم: موافقة صريحة لملفات تعريف الارتباط والبريد الإلكتروني التسويقي والمعالجة غير الضرورية.',
        'الالتزام القانوني: الامتثال لقانون حماية البيانات الشخصية السعودي واللوائح الضريبية ومتطلبات مكافحة غسل الأموال.',
        'المصالح المشروعة: التحليلات والأمان والوقاية من الاحتيال وتحسين الخدمة.',
      ],
    },
    {
      iconEn: '4',
      iconAr: '٤',
      titleEn: 'Data from Third Parties',
      titleAr: 'البيانات من الجهات الخارجية',
      contentEn: [
        'Platform APIs: We retrieve your listing data, booking history, ratings, and reviews from Airbnb, Gatherin, and Booking.com only when you authorize the connection.',
        'Payment Processors: Stripe and other payment providers process payment data; we do not store full credit card numbers.',
        'Analytics Providers: Google Analytics and similar services collect usage data for performance insights.',
      ],
      contentAr: [
        'واجهات برمجة المنصات: نسترجع بيانات الإعلانات وسجل الحجوزات والتقييمات والتعليقات من Airbnb و Gatherin و Booking.com فقط عندما تصرح بالاتصال.',
        'معالجات الدفع: تقوم Stripe ومزودو الدفع الآخرون بمعالجة بيانات الدفع؛ لا نخزن أرقام بطاقات الائتمان الكاملة.',
        'مزودو التحليلات: يجمع Google Analytics والخدمات المشابهة بيانات الاستخدام للحصول على رؤى الأداء.',
      ],
    },
    {
      iconEn: '5',
      iconAr: '٥',
      titleEn: 'Cookies & Tracking',
      titleAr: 'ملفات تعريف الارتباط والتتبع',
      contentEn: [
        'Essential Cookies: Required for login, authentication, and security.',
        'Performance Cookies: Google Analytics to measure user engagement and feature usage.',
        'Marketing Cookies: For remarketing and personalized advertising (only with explicit consent).',
        'You can disable non-essential cookies in your browser settings or opt out of tracking.',
      ],
      contentAr: [
        'ملفات تعريف الارتباط الضرورية: مطلوبة لتسجيل الدخول والمصادقة والأمان.',
        'ملفات تعريف الارتباط الخاصة بالأداء: Google Analytics لقياس تفاعل المستخدم واستخدام الميزات.',
        'ملفات تعريف الارتباط التسويقية: لإعادة التسويق والإعلانات المخصصة (فقط مع موافقة صريحة).',
        'يمكنك تعطيل ملفات تعريف الارتباط غير الضرورية في إعدادات متصفحك أو الامتناع عن التتبع.',
      ],
    },
    {
      iconEn: '6',
      iconAr: '٦',
      titleEn: 'Data Sharing',
      titleAr: 'مشاركة البيانات',
      contentEn: [
        'Service Providers: We share data with payment processors (Stripe), cloud hosts (AWS), analytics providers (Google), and support tools only to the extent necessary.',
        'Legal Requirements: We may disclose data when required by Saudi law, court orders, or regulatory authorities.',
        'No Sale of Data: We never sell your personal data to third parties.',
        'Mergers & Acquisitions: If Madar is acquired, your data will be transferred under the same privacy commitments.',
      ],
      contentAr: [
        'مزودو الخدمات: نشارك البيانات مع معالجات الدفع (Stripe) والمضيفات السحابية (AWS) ومزودي التحليلات (Google) وأدوات الدعم فقط بقدر الضرورة.',
        'المتطلبات القانونية: قد نكشف البيانات عند الطلب بموجب القانون السعودي أو أوامر المحكمة أو السلطات التنظيمية.',
        'عدم بيع البيانات: لا نبيع بيانات المستخدم الشخصية للجهات الخارجية.',
        'الدمج والاستحواذ: في حالة استحواذ شركة على مدار، سيتم نقل بيانات المستخدم تحت نفس التزامات الخصوصية.',
      ],
    },
    {
      iconEn: '7',
      iconAr: '٧',
      titleEn: 'International Data Transfers',
      titleAr: 'نقل البيانات الدولي',
      contentEn: [
        'Cloud Storage: Your data may be stored on servers in different countries. We use encryption and contractual safeguards to protect your data.',
        'Compliance: We ensure transfers comply with Saudi data protection laws.',
      ],
      contentAr: [
        'التخزين السحابي: قد يتم تخزين بيانات المستخدم على خوادم في دول مختلفة. نستخدم التشفير والضمانات التعاقدية لحماية بيانات المستخدم.',
        'الامتثال: نضمن امتثال النقل لقوانين حماية البيانات السعودية.',
      ],
    },
    {
      iconEn: '8',
      iconAr: '٨',
      titleEn: 'Data Retention',
      titleAr: 'احتفاظنا بالبيانات',
      contentEn: [
        'Active Accounts: Data retained as long as your account is active.',
        'Closed Accounts: Data deleted within 90 days of account closure, except where legally required.',
        'Backups: Automatic backups retained for up to 30 days for disaster recovery.',
        'Legal Holds: We may retain data longer if required by law.',
      ],
      contentAr: [
        'الحسابات النشطة: البيانات المحتفظ بها طالما كان حسابك نشطاً.',
        'الحسابات المغلقة: البيانات المحذوفة في غضون 90 يوماً من إغلاق الحساب، إلا إذا كان مطلوباً بموجب القانون.',
        'النسخ الاحتياطية: النسخ الاحتياطية التلقائية المحتفظ بها لمدة تصل إلى 30 يوماً لاسترجاع الكوارث.',
        'الحجوزات القانونية: قد نحتفظ بالبيانات لفترة أطول إذا كان مطلوباً بموجب القانون.',
      ],
    },
    {
      iconEn: '9',
      iconAr: '٩',
      titleEn: 'Security Measures',
      titleAr: 'إجراءات الأمان',
      contentEn: [
        'Encryption: All data transmitted and stored using industry-standard encryption (TLS, AES-256).',
        'Access Controls: Only authorized employees access sensitive data; access is logged and monitored.',
        'Firewalls & Intrusion Detection: Systems protected against unauthorized access.',
        'Regular Audits: Security assessments conducted annually.',
        'No Guarantee: While we implement strong protections, no system is 100% secure.',
      ],
      contentAr: [
        'التشفير: جميع البيانات المرسلة والمخزنة باستخدام التشفير القياسي في الصناعة (TLS و AES-256).',
        'ضوابط الوصول: يمكن للموظفين المصرح لهم فقط الوصول إلى البيانات الحساسة؛ يتم تسجيل المراقبة والمراقبة.',
        'جدران الحماية والكشف عن الاختراق: الأنظمة محمية من الوصول غير المصرح به.',
        'التدقيقات المنتظمة: تقييمات الأمان التي تجرى سنوياً.',
        'بدون ضمان: بينما نطبق حماية قوية، لا يوجد نظام آمن بنسبة 100%.',
      ],
    },
    {
      iconEn: '10',
      iconAr: '١٠',
      titleEn: 'Your Rights',
      titleAr: 'حقوقك',
      contentEn: [
        'Right to Access: Request a copy of your personal data.',
        'Right to Correction: Correct inaccurate or incomplete data.',
        'Right to Deletion: Request deletion of your data (subject to legal retention requirements).',
        'Right to Restrict Processing: Limit how we process your data.',
        'Right to Withdraw Consent: Unsubscribe from marketing or disable cookies.',
        'Right to Complain: File a complaint with relevant data protection authorities.',
      ],
      contentAr: [
        'الحق في الوصول: طلب نسخة من بيانات المستخدم الشخصية.',
        'الحق في التصحيح: تصحيح البيانات غير الدقيقة أو غير المكتملة.',
        'الحق في الحذف: طلب حذف البيانات الخاصة بك (مع مراعاة متطلبات الاحتفاظ القانونية).',
        'الحق في تقييد المعالجة: تقييد كيفية معالجة بيانات المستخدم.',
        'الحق في الامتناع عن الموافقة: إلغاء الاشتراك من رسائل التسويق أو تعطيل ملفات تعريف الارتباط.',
        'الحق في تقديم شكوى: تقديم شكوى إلى سلطات حماية البيانات ذات الصلة.',
      ],
    },
    {
      iconEn: '11',
      iconAr: '١١',
      titleEn: 'Contact for Privacy Requests',
      titleAr: 'جهة الاتصال لطلبات الخصوصية',
      contentEn: [
        'Email: privacy@madar.ai',
        'Address: Riyadh, Saudi Arabia',
        'Response Time: We respond to all privacy requests within 30 days.',
      ],
      contentAr: [
        'البريد الإلكتروني: privacy@madar.ai',
        'العنوان: الرياض، المملكة العربية السعودية',
        'وقت الرد: نرد على جميع طلبات الخصوصية في غضون 30 يوماً.',
      ],
    },
    {
      iconEn: '12',
      iconAr: '١٢',
      titleEn: 'Policy Updates',
      titleAr: 'تحديثات السياسة',
      contentEn: [
        'Last Updated: July 1, 2025',
        'We may update this policy as needed. Significant changes will be communicated via email or prominent notice on our website.',
        'Continued use of Madar after updates constitutes acceptance of the new policy.',
      ],
      contentAr: [
        'آخر تحديث: 1 يوليو 2025',
        'قد نقوم بتحديث هذه السياسة حسب الحاجة. سيتم إبلاغ التغييرات المهمة عبر البريد الإلكتروني أو إشعار بارز على موقعنا.',
        'الاستمرار في استخدام مدار بعد التحديثات يشكل قبول السياسة الجديدة.',
      ],
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
              <Shield className="w-16 h-16 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60 mb-4">
              {lang === 'ar'
                ? 'نحن نقدر خصوصيتك. تشرح هذه السياسة بالتفصيل كيف نجمع وندير بيانات المستخدم.'
                : 'We respect your privacy. This policy explains how we collect and manage your data.'}
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {lang === 'ar' ? section.iconAr : section.iconEn}
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#0A0B10] pt-1">
                    {lang === 'ar' ? section.titleAr : section.titleEn}
                  </h2>
                </div>
                <ul className="space-y-4 ml-14">
                  {(lang === 'ar' ? section.contentAr : section.contentEn).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#0A0B10]/70 leading-relaxed">
                      <span className="text-[#D95F3B] font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
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
              {lang === 'ar' ? 'لديك أسئلة حول خصوصيتك؟' : 'Questions about your privacy?'}
            </h2>
            <p className="text-[#0A0B10]/60 mb-8">
              {lang === 'ar'
                ? 'تواصل معنا في privacy@madar.ai أو اتصل بنا على صفحة "اتصل بنا".'
                : 'Contact us at privacy@madar.ai or visit our Contact page.'}
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