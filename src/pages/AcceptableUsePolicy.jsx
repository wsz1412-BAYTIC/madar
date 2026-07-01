import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import PageFooter from '@/components/madar/PageFooter';
import { FadeIn } from '@/components/madar/Motion';
import { AlertTriangle, Ban, Lock } from 'lucide-react';

export default function AcceptableUsePolicy() {
  const { lang } = useLang();

  const prohibitions = [
    {
      titleEn: 'Unauthorized Data Collection',
      titleAr: 'جمع البيانات غير المصرح به',
      descEn: 'Do not collect, scrape, or extract data from Madar without authorization. This includes automated crawling, bot access, or using tools to harvest user information.',
      descAr: 'لا تجمع أو تستخرج أو تستخلص البيانات من مدار بدون إذن. يتضمن هذا الزحف التلقائي أو الوصول بالروبوت أو استخدام الأدوات لجمع معلومات المستخدم.',
    },
    {
      titleEn: 'Scraping Without Permission',
      titleAr: 'الخردة بدون إذن',
      descEn: 'Web scraping, API abuse, or automated data harvesting is prohibited. Violators may face legal action and permanent account termination.',
      descAr: 'يحظر خردة الويب وإساءة استخدام API وجمع البيانات الآلي. قد يواجه المنتهكون إجراءات قانونية وإنهاء حساب دائم.',
    },
    {
      titleEn: 'Fraudulent Activity',
      titleAr: 'النشاط الاحتيالي',
      descEn: 'Do not engage in fraud, deception, or misrepresentation. This includes false payment information, fake accounts, or using Madar to scam others.',
      descAr: 'لا تنخرط في الاحتيال أو الخداع أو التمثيل الخاطئ. يتضمن هذا معلومات الدفع الكاذبة أو الحسابات المزيفة أو استخدام مدار للنصب على الآخرين.',
    },
    {
      titleEn: 'Account Sharing & Resale',
      titleAr: 'مشاركة الحساب وإعادة البيع',
      descEn: 'Accounts are personal and non-transferable. Do not share login credentials, resell access, or permit others to use your subscription.',
      descAr: 'الحسابات شخصية وغير قابلة للتحويل. لا تشارك بيانات اعتماد تسجيل الدخول أو إعادة بيع الوصول أو السماح للآخرين باستخدام الاشتراك الخاص بك.',
    },
    {
      titleEn: 'Bypassing Security',
      titleAr: 'تجاوز الأمان',
      descEn: 'Do not attempt to bypass authentication, exploit vulnerabilities, perform SQL injection, or use hacking techniques to gain unauthorized access.',
      descAr: 'لا تحاول تجاوز المصادقة أو استغلال الثغرات أو إجراء حقن SQL أو استخدام تقنيات الاختراق للوصول غير المصرح به.',
    },
    {
      titleEn: 'Malicious Code Upload',
      titleAr: 'تحميل رمز ضار',
      descEn: 'Do not upload, distribute, or execute viruses, malware, spyware, or any malicious code that could harm the platform or other users.',
      descAr: 'لا تحمل أو توزع أو تنفذ الفيروسات أو البرامج الضارة أو برامج التجسس أو أي رمز ضار قد يضر بالمنصة أو المستخدمين الآخرين.',
    },
    {
      titleEn: 'Misusing Competitor Data',
      titleAr: 'إساءة استخدام بيانات المنافسين',
      descEn: 'Do not use Madar to unlawfully obtain, process, or redistribute competitors\' proprietary data or business intelligence.',
      descAr: 'لا تستخدم مدار للحصول على أو معالجة أو إعادة توزيع بيانات المنافسين الملكية أو ذكاء الأعمال بشكل غير قانوني.',
    },
    {
      titleEn: 'Intellectual Property Infringement',
      titleAr: 'انتهاك الملكية الفكرية',
      descEn: 'Do not upload, share, or promote content that infringes copyrights, trademarks, patents, or trade secrets of others.',
      descAr: 'لا تحمل أو تشارك أو تروج للمحتوى الذي ينتهك حقوق الطبع والنشر أو العلامات التجارية أو براءات الاختراع أو أسرار التجارة للآخرين.',
    },
    {
      titleEn: 'Unlawful or Misleading Activity',
      titleAr: 'النشاط غير القانوني أو المضلل',
      descEn: 'Do not use Madar to engage in illegal activities, money laundering, terrorist financing, or misleading marketing practices.',
      descAr: 'لا تستخدم مدار للانخراط في أنشطة غير قانونية أو غسل أموال أو تمويل الإرهاب أو ممارسات تسويق مضللة.',
    },
  ];

  const consequences = [
    {
      titleEn: 'Account Restriction',
      titleAr: 'قيد الحساب',
      descEn: 'Limited access to features, reduced functionality, or temporary suspension of services.',
    },
    {
      titleEn: 'Account Termination',
      titleAr: 'إنهاء الحساب',
      descEn: 'Permanent deletion of your account and all associated data after 30-day notice period.',
    },
    {
      titleEn: 'Legal Action',
      titleAr: 'إجراء قانوني',
      descEn: 'Civil or criminal proceedings for serious violations (fraud, hacking, data theft).',
    },
    {
      titleEn: 'Financial Penalties',
      titleAr: 'عقوبات مالية',
      descEn: 'Liability for damages, losses, and Madar\'s legal costs in enforcement cases.',
    },
    {
      titleEn: 'IP Blocking',
      titleAr: 'حظر الـ IP',
      descEn: 'Permanent blocking of your IP address and devices from accessing Madar.',
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
              <Ban className="w-16 h-16 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'سياسة الاستخدام المقبول' : 'Acceptable Use Policy'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60">
              {lang === 'ar'
                ? 'المحظورات والعواقب للحفاظ على سلامة النظام الأساسي.'
                : 'Prohibited activities and consequences to maintain platform integrity.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Prohibitions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="mb-16">
            <h2 className="font-heading text-3xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'الأنشطة المحظورة' : 'Prohibited Activities'}
            </h2>
            <p className="text-[#0A0B10]/60 leading-relaxed">
              {lang === 'ar'
                ? 'يجب عليك الامتثال لهذه القيود عند استخدام مدار. الانتهاك قد يؤدي إلى عواقب خطيرة.'
                : 'You must comply with these restrictions when using Madar. Violations may result in serious consequences.'}
            </p>
          </FadeIn>

          <div className="space-y-5">
            {prohibitions.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="p-6 rounded-2xl border border-[#0A0B10]/[0.06] hover:border-[#D95F3B]/30 hover:bg-red-50/20 transition-all">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-[#D95F3B] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-[#0A0B10] text-lg mb-2">
                        {lang === 'ar' ? item.titleAr : item.titleEn}
                      </h3>
                      <p className="text-[#0A0B10]/70 text-sm leading-relaxed">
                        {lang === 'ar' ? item.descAr : item.descEn}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Consequences */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'العواقب' : 'Consequences of Violations'}
            </h2>
            <p className="text-[#0A0B10]/60">
              {lang === 'ar'
                ? 'قد يؤدي انتهاك هذه السياسة إلى إجراءات تأديبية متنوعة.'
                : 'Violations of this policy may result in various disciplinary actions.'}
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {consequences.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-white border border-[#D95F3B]/20">
                  <h3 className="font-heading font-bold text-[#0A0B10] text-lg mb-3">
                    {lang === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-[#0A0B10]/70 text-sm leading-relaxed">{item.descEn}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Enforcement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-red-200">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-[#D95F3B] flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-heading font-bold text-[#0A0B10] text-lg mb-3">
                    {lang === 'ar' ? 'الإنفاذ والمراقبة' : 'Enforcement & Monitoring'}
                  </h2>
                  <p className="text-[#0A0B10]/70 leading-relaxed mb-4">
                    {lang === 'ar'
                      ? 'نراقب الامتثال بنشاط من خلال الأنظمة المتقدمة والمراجعة اليدوية. قد نفحص الحسابات المريبة ونتحقق من الامتثال في أي وقت.'
                      : 'We actively monitor compliance through advanced systems and manual review. We may investigate suspicious accounts and verify compliance anytime.'}
                  </p>
                  <p className="text-[#0A0B10]/70 leading-relaxed">
                    {lang === 'ar'
                      ? 'يحتفظ مدار بالحق في تطبيق هذه السياسة على حسابات محددة أو فئات من المستخدمين متى رأينا ذلك مناسباً.'
                      : 'Madar reserves the right to enforce this policy selectively or for specific accounts at our discretion.'}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F2EFE8]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'أسئلة حول السياسة؟' : 'Questions about this policy?'}
            </h2>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all"
            >
              {lang === 'ar' ? 'اتصل بالدعم' : 'Contact Support'}
            </a>
          </FadeIn>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}