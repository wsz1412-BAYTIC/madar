import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import PageFooter from '@/components/madar/PageFooter';
import { FadeIn } from '@/components/madar/Motion';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AIDisclaimer() {
  const { lang } = useLang();

  const sections = [
    {
      titleEn: 'AI-Generated Content',
      titleAr: 'المحتوى المولد بالذكاء الاصطناعي',
      contentEn: 'Madar uses advanced artificial intelligence to generate pricing recommendations, occupancy forecasts, and market intelligence. While our AI models are continuously trained on historical data and market trends, they are tools designed to assist, not replace, human judgment.',
      contentAr: 'تستخدم مدار الذكاء الاصطناعي المتقدم لتوليد توصيات التسعير والتنبؤات الاحتلال وذكاء السوق. على الرغم من أن نماذج الذكاء الاصطناعي الخاصة بنا يتم تدريبها بشكل مستمر على البيانات التاريخية واتجاهات السوق، إلا أنها أدوات مصممة للمساعدة وليس لاستبدال الحكم البشري.',
    },
    {
      titleEn: 'Potential Limitations',
      titleAr: 'القيود المحتملة',
      contentEn: 'AI systems may: Contain errors or inaccuracies in predictions. Miss important context or market nuances. Provide outdated information if not recently retrained. Produce inconsistent results in edge cases. Fail to account for unprecedented market conditions.',
      contentAr: 'قد تحتوي أنظمة الذكاء الاصطناعي على: أخطاء أو عدم دقة في التنبؤات. تفويت السياق المهم أو الفروق الدقيقة في السوق. تقديم معلومات قديمة إذا لم تتم إعادة تدريبها مؤخراً. إنتاج نتائج غير متسقة في الحالات الحدية. الفشل في حساب ظروف السوق غير المسبوقة.',
    },
    {
      titleEn: 'User Responsibility',
      titleAr: 'مسؤولية المستخدم',
      contentEn: 'You are responsible for: Reviewing all AI recommendations before implementation. Validating predictions against your own market knowledge. Conducting due diligence on suggested pricing strategies. Making final business decisions based on multiple sources. Monitoring performance and adjusting if results differ from projections.',
      contentAr: 'أنت مسؤول عن: مراجعة جميع توصيات الذكاء الاصطناعي قبل التنفيذ. التحقق من التنبؤات مقابل معرفتك بالسوق. إجراء العناية الواجبة على استراتيجيات التسعير المقترحة. اتخاذ قرارات العمل النهائية بناءً على مصادر متعددة. مراقبة الأداء والتعديل إذا كانت النتائج تختلف عن التوقعات.',
    },
    {
      titleEn: 'No Guarantee of Accuracy',
      titleAr: 'بدون ضمان الدقة',
      contentEn: 'Madar does not guarantee the accuracy, completeness, or suitability of AI-generated recommendations. Past performance or historical accuracy does not guarantee future results. Market conditions can change rapidly, and AI models may not adapt instantly.',
      contentAr: 'لا تضمن مدار دقة أو اكتمال أو ملاءمة التوصيات المولدة بالذكاء الاصطناعي. الأداء السابقة أو الدقة التاريخية لا تضمن النتائج المستقبلية. يمكن أن تتغير ظروف السوق بسرعة، وقد لا تتكيف نماذج الذكاء الاصطناعي على الفور.',
    },
    {
      titleEn: 'Data Security & Privacy',
      titleAr: 'أمان البيانات والخصوصية',
      contentEn: 'Do not enter sensitive personal information (national ID, passport, banking details) unless absolutely necessary. While we encrypt all data, no system is 100% secure. Treat AI interactions like business communications that could be reviewed.',
      contentAr: 'لا تدخل معلومات شخصية حساسة (الهوية الوطنية وجواز السفر وتفاصيل البنك) إلا إذا لزم الأمر. على الرغم من تشفير جميع البيانات، لا يوجد نظام آمن بنسبة 100%. تعامل مع تفاعلات الذكاء الاصطناعي مثل الاتصالات التجارية التي قد يتم مراجعتها.',
    },
    {
      titleEn: 'Updates & Improvements',
      titleAr: 'التحديثات والتحسينات',
      contentEn: 'We continuously improve our AI models. This may change recommendations or outputs over time. You will be notified of significant changes. We use your aggregated, anonymized data (with your consent) to improve AI accuracy.',
      contentAr: 'نحن نحسن نماذج الذكاء الاصطناعي الخاصة بنا بشكل مستمر. قد يؤدي هذا إلى تغيير التوصيات أو النتائج بمرور الوقت. سيتم إخطارك بالتغييرات المهمة. نستخدم بيانات المستخدم المجمعة والمجهولة (مع موافقتك) لتحسين دقة الذكاء الاصطناعي.',
    },
    {
      titleEn: 'Compliance & Legal',
      titleAr: 'الامتثال والقانوني',
      contentEn: 'AI recommendations are not professional financial, legal, or tax advice. Consult with qualified professionals before making material business decisions. Madar is not liable for losses resulting from reliance on AI-generated content.',
      contentAr: 'توصيات الذكاء الاصطناعي ليست نصيحة مالية أو قانونية أو ضريبية احترافية. استشير الخبراء المؤهلين قبل اتخاذ قرارات عمل جوهرية. مدار ليست مسؤولة عن الخسائر الناجمة عن الاعتماد على المحتوى المولد بالذكاء الاصطناعي.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#EFF6FA] text-[#06131F]">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EFF6FA] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Zap className="w-16 h-16 text-[#1B84C4]" />
                <AlertTriangle className="w-8 h-8 text-[#0F6BA8] absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06131F] mb-6">
              {lang === 'ar' ? 'إخلاء مسؤولية الذكاء الاصطناعي' : 'AI Disclaimer'}
            </h1>
            <p className="text-lg text-[#06131F]/60">
              {lang === 'ar'
                ? 'فهم قدرات ومحدودية خدمات الذكاء الاصطناعي في مدار.'
                : 'Understanding the capabilities and limitations of Madar AI services.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Important Notice */}
          <FadeIn className="mb-12 p-6 rounded-2xl bg-orange-50 border border-orange-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-heading font-bold text-orange-900 mb-2">
                  {lang === 'ar' ? 'ملاحظة مهمة' : 'Important Notice'}
                </h2>
                <p className="text-orange-800 text-sm leading-relaxed">
                  {lang === 'ar'
                    ? 'توصيات الذكاء الاصطناعي هي أدوات مساعدة فقط. تحتفظ دائماً بالمسؤولية الكاملة عن جميع قرارات العمل. استشر متخصصين مؤهلين قبل اتخاذ قرارات مالية أو قانونية أو ضريبية هامة.'
                    : 'AI recommendations are assistance tools only. You retain full responsibility for all business decisions. Consult qualified professionals before making material financial, legal, or tax decisions.'}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="pb-8 border-b border-[#06131F]/[0.06] last:border-b-0">
                  <h2 className="font-heading text-2xl font-bold text-[#06131F] mb-4">
                    {lang === 'ar' ? section.titleAr : section.titleEn}
                  </h2>
                  <p className="text-[#06131F]/70 leading-relaxed">
                    {lang === 'ar' ? section.contentAr : section.contentEn}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How We Label AI */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EFF6FA]">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#06131F] mb-4">
              {lang === 'ar' ? 'كيف نسمي المحتوى المولد بالذكاء الاصطناعي' : 'How We Label AI-Generated Content'}
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <div className="p-6 rounded-2xl bg-white border-2 border-[#1B84C4]">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-[#1B84C4]" />
                  <h3 className="font-heading font-bold text-[#06131F]">
                    {lang === 'ar' ? 'شارة AI' : 'AI Badge'}
                  </h3>
                </div>
                <p className="text-[#06131F]/60 text-sm leading-relaxed">
                  {lang === 'ar'
                    ? 'يتم وضع شارة برتقالية في الزاوية العلوية لكل توصية أو تنبؤ مولد بواسطة الذكاء الاصطناعي.'
                    : 'An orange badge appears in the top corner of every AI-generated recommendation or forecast.'}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="p-6 rounded-2xl bg-white border-2 border-[#0F6BA8]">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-[#0F6BA8]" />
                  <h3 className="font-heading font-bold text-[#06131F]">
                    {lang === 'ar' ? 'ملخص المقدار' : 'Confidence Score'}
                  </h3>
                </div>
                <p className="text-[#06131F]/60 text-sm leading-relaxed">
                  {lang === 'ar'
                    ? 'تعرض مستوى ثقة النموذج (منخفض / متوسط / عالي) لمساعدتك في تقييم موثوقية الناتج.'
                    : 'Model confidence level (Low / Medium / High) is shown to help you assess reliability.'}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-heading text-2xl font-bold text-[#06131F] mb-4">
              {lang === 'ar' ? 'هل لديك أسئلة أخرى؟' : 'Have more questions?'}
            </h2>
            <p className="text-[#06131F]/60 mb-8">
              {lang === 'ar'
                ? 'اتصل بفريق الدعم للحصول على توضيح بشأن المحتوى المولد بالذكاء الاصطناعي.'
                : 'Contact support for clarification on AI-generated content.'}
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all"
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