import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import PricingPlans from '@/components/madar/PricingPlans';
import { FadeIn } from '@/components/madar/Motion';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const { lang } = useLang();
  const { theme } = useTheme();

  const faqs = [
    {
      question: lang === 'ar' ? 'هل هناك رسوم إضافية؟' : 'Are there any hidden fees?',
      answer: lang === 'ar'
        ? 'لا، جميع الرسوم واضحة ومعلنة. لا توجد رسوم خفية أو تكاليف إضافية.'
        : 'No, all fees are transparent and upfront. No hidden charges or additional costs.',
    },
    {
      question: lang === 'ar' ? 'كيف تعمل التجربة المجانية؟' : 'How does the free trial work?',
      answer: lang === 'ar'
        ? 'جميع الباقات تشمل 14 يوم تجربة مجانية. لا تحتاج لبطاقة ائتمان. يمكنك الإلغاء قبل انتهاء التجربة.'
        : 'All plans include 14 days free. No credit card required. You can cancel anytime before the trial ends.',
    },
    {
      question: lang === 'ar' ? 'هل يمكنني تغيير الباقة؟' : 'Can I change my plan?',
      answer: lang === 'ar'
        ? 'نعم، يمكنك الترقية أو التنزيل في أي وقت. سيتم حساب الفرق في الفاتورة التالية.'
        : 'Yes, you can upgrade or downgrade anytime. Price differences will be adjusted in your next bill.',
    },
    {
      question: lang === 'ar' ? 'ماذا لو احتجت مساعدة؟' : 'What if I need help?',
      answer: lang === 'ar'
        ? 'لدينا فريق دعم على مدار الساعة. جميع الباقات تشمل البريد الإلكتروني والدعم الهاتفي.'
        : 'Our support team is available 24/7. All plans include email and phone support.',
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
        ? 'bg-background'
        : 'bg-white'
    }`}>
      <PublicNavbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pricing Plans */}
          <FadeIn>
            <PricingPlans />
          </FadeIn>

          {/* FAQ Section */}
          <div className="mt-28">
            <FadeIn delay={0.2}>
              <div className="text-center mb-12">
                <h2 className={`font-heading text-3xl font-bold mb-4 ${textColor}`}>
                  {lang === 'ar' ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
                </h2>
                <p className={`text-lg ${textMuted}`}>
                  {lang === 'ar'
                    ? 'إجابات سريعة على الأسئلة الشائعة'
                    : 'Quick answers to common questions'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-xl ${bgCard}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <HelpCircle className="w-5 h-5 text-[#D95F3B] flex-shrink-0 mt-0.5" />
                      <h3 className={`font-bold ${textColor}`}>
                        {faq.question}
                      </h3>
                    </div>
                    <p className={`text-sm ${textMuted}`}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* CTA Section */}
          <FadeIn delay={0.3} className="mt-20">
            <div className={`p-12 rounded-2xl text-center ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#D95F3B]/10 to-[#C8972A]/5 border border-[#D95F3B]/30'
                : 'bg-gradient-to-br from-[#D95F3B]/5 to-[#C8972A]/3 border border-[#D95F3B]/20'
            }`}>
              <h3 className={`font-heading text-2xl font-bold mb-4 ${textColor}`}>
                {lang === 'ar' ? 'هل لديك أسئلة؟' : 'Have Questions?'}
              </h3>
              <p className={`mb-6 max-w-2xl mx-auto ${textMuted}`}>
                {lang === 'ar'
                  ? 'فريقنا هنا لمساعدتك. تواصل معنا مباشرة للحصول على إجابات شاملة.'
                  : 'Our team is here to help. Contact us directly for comprehensive answers.'}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all"
              >
                {lang === 'ar' ? 'اتصل بنا' : 'Get in Touch'}
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>

      <ComprehensiveFooter />
    </div>
  );
}