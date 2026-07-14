import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import PageFooter from '@/components/madar/PageFooter';
import { FadeIn } from '@/components/madar/Motion';
import { Copyright, Award, Shield } from 'lucide-react';

export default function IPTrademark() {
  const { lang } = useLang();

  const madarOwned = [
    { item: 'Madar name, logo, and branding', itemAr: 'اسم مدار والشعار والعلامة التجارية' },
    { item: 'Website design and layout', itemAr: 'تصميم وتخطيط الموقع' },
    { item: 'Software, algorithms, and source code', itemAr: 'البرامج والخوارزميات والكود المصدري' },
    { item: 'Reports, dashboards, and analytics tools', itemAr: 'التقارير والقوائس المعلومات وأدوات التحليلات' },
    { item: 'Databases and data compilations', itemAr: 'قواعد البيانات وتجميع البيانات' },
    { item: 'Text, graphics, and multimedia content', itemAr: 'النصوص والرسومات والمحتوى الوسائط المتعددة' },
    { item: 'Original research and methodologies', itemAr: 'البحث الأصلي والمنهجيات الخاصة' },
    { item: 'Pricing models and market intelligence', itemAr: 'نماذج التسعير وذكاء السوق' },
  ];

  const thirdParty = [
    { name: 'Airbnb', symbol: '®' },
    { name: 'Gathern', symbol: '™' },
    { name: 'Booking.com', symbol: '®' },
    { name: 'Google', symbol: '®' },
    { name: 'Stripe', symbol: '®' },
  ];

  return (
    <div className="min-h-screen bg-[#EFF6FA] text-[#06131F]">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EFF6FA] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="flex justify-center gap-4 mb-6">
              <Copyright className="w-12 h-12 text-[#1B84C4]" />
              <Award className="w-12 h-12 text-[#0F6BA8]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06131F] mb-6">
              {lang === 'ar' ? 'ملكية فكرية وعلامة تجارية' : 'IP & Trademark Notice'}
            </h1>
            <p className="text-lg text-[#06131F]/60">
              {lang === 'ar'
                ? 'فهم ملكيتنا للمحتوى والحقوق في المنصة.'
                : 'Understanding ownership of content and rights on the platform.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Madar Ownership */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-[#06131F] mb-4">
              {lang === 'ar' ? 'ملكية مدار' : 'Madar Ownership'}
            </h2>
            <p className="text-[#06131F]/60 leading-relaxed mb-8">
              {lang === 'ar'
                ? 'تمتلك مدار وتحافظ على حقوق الملكية الفكرية الكاملة في جميع الأصول التالية:'
                : 'Madar owns and maintains full intellectual property rights in all of the following:'}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {madarOwned.map((item, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="p-5 rounded-xl bg-[#EFF6FA] border border-[#1B84C4]/20 flex items-start gap-3">
                    <Copyright className="w-4 h-4 text-[#1B84C4] flex-shrink-0 mt-1" />
                    <span className="text-[#06131F]/70 text-sm">{lang === 'ar' ? item.itemAr : item.item}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          {/* Restrictions */}
          <FadeIn>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <h3 className="font-heading font-bold text-[#06131F] text-lg mb-4">
                {lang === 'ar' ? 'تقييدات الاستخدام' : 'Usage Restrictions'}
              </h3>
              <ul className="space-y-3 text-[#06131F]/70 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#1B84C4] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'لا يمكنك نسخ أو تعديل أو توزيع أي محتوى مملوك لمدار.'
                      : 'You may not copy, modify, or distribute any Madar-owned content.'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1B84C4] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'لا يمكنك محاولة عكس هندسة البرامج أو الخوارزميات.'
                      : 'You may not attempt to reverse-engineer our software or algorithms.'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1B84C4] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'لا يمكنك استخدام الشعار أو الأصول الرسومية بدون إذن صريح.'
                      : 'You may not use our logos or graphics without explicit permission.'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1B84C4] font-bold">•</span>
                  <span>
                    {lang === 'ar'
                      ? 'لا يمكنك استخدام اسم مدار بطريقة قد تسبب ارتباكاً أو تضليلاً.'
                      : 'You may not use the Madar name in ways that cause confusion.'}
                  </span>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Third-Party Clarification */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EFF6FA]">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-[#06131F] mb-4">
              {lang === 'ar' ? 'العلامات التجارية للجهات الخارجية' : 'Third-Party Trademarks'}
            </h2>
            <p className="text-[#06131F]/60 leading-relaxed">
              {lang === 'ar'
                ? 'الأسماء والشعارات والعلامات التجارية للشركات الأخرى مملوكة لأصحابها. تُستخدم هذه العلامات في مدار للمراجع فقط.'
                : 'Names, logos, and trademarks of other companies belong to their respective owners. We use these marks for reference only.'}
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {thirdParty.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-white border border-[#06131F]/[0.06] text-center">
                  <p className="font-heading font-bold text-[#06131F] text-lg">
                    {item.name}
                    <span className="text-[#1B84C4] ml-1">{item.symbol}</span>
                  </p>
                  <p className="text-xs text-[#06131F]/50 mt-2">
                    {lang === 'ar' ? 'علامة تجارية مملوكة' : 'Registered Trademark'}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Disclaimer */}
          <FadeIn>
            <div className="p-8 rounded-2xl bg-white border border-orange-200 bg-orange-50/30">
              <h3 className="font-heading font-bold text-[#06131F] text-lg mb-4">
                {lang === 'ar' ? 'إخلاء المسؤولية عن الرعاية والشراكة' : 'Sponsorship & Partnership Disclaimer'}
              </h3>
              <p className="text-[#06131F]/70 leading-relaxed mb-4">
                {lang === 'ar'
                  ? 'عرض شعارات أو أسماء الشركات الأخرى على مدار لا يعني الموافقة أو الرعاية أو الشراكة الرسمية. لا نمثل أي علاقة رسمية ما لم يوجد اتفاق مكتوب صريح.'
                  : 'Displaying other companies\' logos or names on Madar does not imply endorsement, sponsorship, or official partnership. We do not represent any formal relationship unless an explicit written agreement exists.'}
              </p>
              <p className="text-[#06131F]/70 leading-relaxed">
                {lang === 'ar'
                  ? 'مدار هي خدمة تابعة لجهات خارجية. لا نملكها أو نديرها أو نتابع لأي منصة أخرى.'
                  : 'Madar is an independent third-party service. We are not owned by, operated by, or affiliated with any other platform.'}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Fair Use */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold text-[#06131F] text-lg mb-3">
                    {lang === 'ar' ? 'الاستخدام العادل' : 'Fair Use'}
                  </h3>
                  <p className="text-[#06131F]/70 leading-relaxed">
                    {lang === 'ar'
                      ? 'أنت مسموح لك باستخدام محتوى مدار بشكل محدود للأغراض الشخصية أو غير الربحية. لا يُسمح بإعادة النشر أو التوزيع أو الاستخدام التجاري بدون إذن صريح.'
                      : 'You are allowed limited use of Madar content for personal or non-commercial purposes. Republication, distribution, or commercial use without permission is prohibited.'}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}