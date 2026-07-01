import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import { FadeIn } from '@/components/madar/Motion';
import { CreditCard, Clock, RotateCcw, Trash2 } from 'lucide-react';

export default function SubscriptionPolicy() {
  const { lang } = useLang();

  const sections = [
    {
      titleEn: 'Subscription Plans',
      titleAr: 'خطط الاشتراك',
      contentEn: 'Madar offers four subscription tiers: Free (1 property, basic features), Basic ($99/month, 3 properties), Growth ($199/month, 10 properties, popular), and Pro ($349/month, unlimited properties). All plans include core features; higher tiers unlock advanced capabilities.',
      contentAr: 'تقدم مدار أربع مستويات اشتراك: مجانية (عقار واحد وميزات أساسية)، أساسية (99 دولار/شهر، 3 عقارات)، نمو (199 دولار/شهر، 10 عقارات، الشهيرة)، واحترافية (349 دولار/شهر، عقارات غير محدودة).',
    },
    {
      titleEn: 'Billing Cycle',
      titleAr: 'دورة الفواتير',
      contentEn: 'Subscriptions are billed monthly on your subscription date. Your payment method is charged automatically each billing cycle. For annual plans (if available), billing occurs once per year.',
      contentAr: 'تتم فواتير الاشتراكات شهرياً في تاريخ اشتراكك. يتم فرض رسوم على طريقة الدفع الخاصة بك تلقائياً في كل دورة فواتير. بالنسبة للخطط السنوية (إن توفرت)، تحدث الفواتير مرة واحدة في السنة.',
    },
    {
      titleEn: 'Automatic Renewal',
      titleAr: 'التجديد التلقائي',
      contentEn: 'Your subscription auto-renews unless canceled. Renewal occurs 5 days before your billing date. An invoice is sent to your email after renewal. Renewal can be disabled anytime in Account Settings.',
      contentAr: 'يتم تجديد اشتراكك تلقائياً ما لم يتم إلغاؤه. يحدث التجديد قبل 5 أيام من تاريخ الفاتورة. يتم إرسال فاتورة إلى بريدك الإلكتروني بعد التجديد. يمكن تعطيل التجديد في أي وقت من إعدادات الحساب.',
    },
    {
      titleEn: 'Taxes',
      titleAr: 'الضرائب',
      contentEn: 'All prices exclude applicable taxes (VAT, GST). Tax is calculated and added at checkout based on your location. Business users may provide tax IDs for exemptions.',
      contentAr: 'جميع الأسعار لا تشمل الضرائب المعمول بها (الضريبة على القيمة المضافة). يتم حساب الضريبة وإضافتها في الدفع بناءً على موقعك. قد يقدم مستخدمو الأعمال معرفات ضريبية للإعفاءات.',
    },
    {
      titleEn: 'Upgrades & Downgrades',
      titleAr: 'الترقيات والتخفيضات',
      contentEn: 'Upgrade or downgrade anytime. Upgrades are prorated from your current billing date. Downgrades take effect at the next billing cycle. No penalties for plan changes.',
      contentAr: 'قم بالترقية أو التخفيض في أي وقت. يتم احتساب الترقيات بشكل تناسبي من تاريخ الفاتورة الحالي. تسري التخفيضات اعتباراً من دورة الفاتورة التالية. لا عقوبات على تغييرات الخطة.',
    },
    {
      titleEn: 'Cancellation',
      titleAr: 'الإلغاء',
      contentEn: 'Cancel anytime in Account Settings > Billing > Cancel Subscription. Your access continues until the end of the current billing period. Data remains available for 90 days after cancellation.',
      contentAr: 'قم بالإلغاء في أي وقت في إعدادات الحساب > الفواتير > إلغاء الاشتراك. يستمر الوصول الخاص بك حتى نهاية فترة الفاتورة الحالية. تبقى البيانات متاحة لمدة 90 يوماً بعد الإلغاء.',
    },
    {
      titleEn: 'Service Access After Cancellation',
      titleAr: 'وصول الخدمة بعد الإلغاء',
      contentEn: 'Paid features become unavailable after your billing period ends. Free tier (1 property, basic features) automatically activates. All data is retained; you can reactivate your subscription anytime.',
      contentAr: 'تصبح الميزات المدفوعة غير متاحة بعد انتهاء فترة الفاتورة الخاصة بك. يتم تفعيل الطبقة المجانية (عقار واحد وميزات أساسية) تلقائياً. يتم الاحتفاظ بجميع البيانات؛ يمكنك إعادة تفعيل الاشتراك في أي وقت.',
    },
    {
      titleEn: 'Refund Eligibility',
      titleAr: 'أهلية استرجاع الأموال',
      contentEn: 'Refunds available within 14 days of subscription start. Prorated refunds offered for service outages exceeding 24 hours. No refunds after 14 days or for voluntary cancellations.',
      contentAr: 'استرجاع الأموال متاح في غضون 14 يوماً من بدء الاشتراك. يتم عرض استرجاعات تناسبية لانقطاعات الخدمة التي تتجاوز 24 ساعة. لا استرجاع بعد 14 يوماً أو للإلغاءات الطوعية.',
    },
    {
      titleEn: 'Failed Payments',
      titleAr: 'المدفوعات الفاشلة',
      contentEn: 'If payment fails, you receive a notification. We retry payment 3 times over 7 days. If all attempts fail, your subscription is suspended until payment succeeds. Data remains safe.',
      contentAr: 'إذا فشلت الدفع، فسوف تتلقى إشعاراً. نحاول إعادة الدفع 3 مرات على مدى 7 أيام. إذا فشلت جميع المحاولات، يتم تعليق الاشتراك حتى ينجح الدفع. البيانات تبقى آمنة.',
    },
    {
      titleEn: 'Promotional Offers',
      titleAr: 'العروض الترويجية',
      contentEn: 'Promotional codes apply as discounts at checkout. Promotions are non-transferable and expire on stated dates. Multiple promotions cannot be combined. Abuse of promo codes may result in account suspension.',
      contentAr: 'تطبق أكواد ترويجية كخصومات عند الدفع. العروض الترويجية غير قابلة للتحويل وتنتهي في التواريخ المحددة. لا يمكن دمج عروض ترويجية متعددة. قد يؤدي إساءة استخدام أكواد العروض الترويجية إلى تعليق الحساب.',
    },
    {
      titleEn: 'Add-On Services',
      titleAr: 'خدمات إضافية',
      contentEn: 'Optional add-ons (e.g., white-label support, API access) are billed separately. Add-ons follow the same renewal and cancellation terms as subscriptions.',
      contentAr: 'يتم فرض رسوم على الخدمات الإضافية الاختيارية (على سبيل المثال، دعم العلامة البيضاء، وصول API) بشكل منفصل. تتبع الإضافات نفس شروط التجديد والإلغاء للاشتراكات.',
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
              <CreditCard className="w-16 h-16 text-[#D95F3B]" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'سياسة الاشتراك والإلغاء والاسترجاع' : 'Subscription & Refund Policy'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60">
              {lang === 'ar'
                ? 'فهم خطط الاشتراك والفواتير والإلغاء والاسترجاع.'
                : 'Understand subscriptions, billing, cancellation, and refunds.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Plans Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'خطط مدار' : 'Madar Plans'}
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Free', price: '0', monthly: lang === 'ar' ? 'مجاني' : 'Free', features: lang === 'ar' ? ['1 عقار', 'ميزات أساسية'] : ['1 property', 'Basic features'] },
              { name: 'Basic', price: '$99', monthly: lang === 'ar' ? '/شهر' : '/mo', features: lang === 'ar' ? ['3 عقارات', 'توصيات ذكية', 'دعم البريد الإلكتروني'] : ['3 properties', 'Smart recommendations', 'Email support'] },
              { name: 'Growth', price: '$199', monthly: lang === 'ar' ? '/شهر' : '/mo', popular: true, features: lang === 'ar' ? ['10 عقارات', 'ذكاء اصطناعي متقدم', 'دعم ذو أولوية'] : ['10 properties', 'Advanced AI', 'Priority support'] },
              { name: 'Pro', price: '$349', monthly: lang === 'ar' ? '/شهر' : '/mo', features: lang === 'ar' ? ['عقارات غير محدودة', 'مجموعة كاملة', 'دعم مخصص'] : ['Unlimited properties', 'Full suite', 'Dedicated support'] },
            ].map((plan, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className={`relative p-6 rounded-2xl h-full transition-all ${
                  plan.popular
                    ? 'bg-[#0A0B10] text-white border-2 border-[#D95F3B] transform scale-105'
                    : 'bg-white border border-[#0A0B10]/[0.06] hover:border-[#D95F3B]/30'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-bold rounded-full">
                      {lang === 'ar' ? 'الشهيرة' : 'Popular'}
                    </div>
                  )}
                  <h3 className={`font-heading font-bold text-lg mb-2 ${plan.popular ? 'text-white' : 'text-[#0A0B10]'}`}>
                    {plan.name}
                  </h3>
                  <div className={`text-3xl font-bold mb-1 ${plan.popular ? 'text-[#C8972A]' : 'text-[#D95F3B]'}`}>
                    {plan.price}
                  </div>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-white/60' : 'text-[#0A0B10]/60'}`}>
                    {plan.monthly}
                  </p>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className={plan.popular ? 'text-[#C8972A]' : 'text-[#D95F3B]'}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="pb-8 border-b border-[#0A0B10]/[0.06] last:border-b-0">
                <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-4">
                  {lang === 'ar' ? section.titleAr : section.titleEn}
                </h2>
                <p className="text-[#0A0B10]/70 leading-relaxed">
                  {lang === 'ar' ? section.contentAr : section.contentEn}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Billing Info Box */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="p-8 rounded-2xl bg-gradient-to-r from-[#D95F3B]/5 to-[#C8972A]/5 border border-[#D95F3B]/20">
            <h2 className="font-heading text-2xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'معلومات الفاتورة والتجديد' : 'Billing & Renewal Info'}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#D95F3B]" />
                  <h3 className="font-heading font-bold text-[#0A0B10]">
                    {lang === 'ar' ? 'دورة التجديد' : 'Renewal Cycle'}
                  </h3>
                </div>
                <ul className="space-y-2 text-[#0A0B10]/70 text-sm">
                  <li>
                    {lang === 'ar' ? 'الفاتورة: شهرية بناءً على تاريخ اشتراكك' : 'Billing: Monthly from subscription date'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'التجديد التلقائي: تفعيل افتراضياً' : 'Auto-renewal: Enabled by default'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'إشعار التجديد: 5 أيام قبل الفاتورة التالية' : 'Renewal notice: 5 days before next billing'}
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <RotateCcw className="w-5 h-5 text-[#C8972A]" />
                  <h3 className="font-heading font-bold text-[#0A0B10]">
                    {lang === 'ar' ? 'الإلغاء والاسترجاع' : 'Cancellation & Refunds'}
                  </h3>
                </div>
                <ul className="space-y-2 text-[#0A0B10]/70 text-sm">
                  <li>
                    {lang === 'ar' ? 'الإلغاء: في أي وقت بدون عقوبة' : 'Cancel: Anytime without penalty'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'استرجاع الأموال: خلال 14 يوماً من البداية' : 'Refunds: Within 14 days of start'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'البيانات: محفوظة لمدة 90 يوماً' : 'Data: Saved for 90 days'}
                  </li>
                </ul>
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
              {lang === 'ar' ? 'أسئلة حول الفواتير؟' : 'Questions about billing?'}
            </h2>
            <p className="text-[#0A0B10]/60 mb-8">
              {lang === 'ar'
                ? 'اتصل بفريق الدعم في billing@madar.ai'
                : 'Contact support at billing@madar.ai'}
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
            <a href="/subscription" className="text-sm text-[#0A0B10]/40 hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'الاشتراك' : 'Subscription'}
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