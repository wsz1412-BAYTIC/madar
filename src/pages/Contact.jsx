import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import { FadeIn } from '@/components/madar/Motion';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const { t, lang, isRTL } = useLang();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', category: '', subject: '', message: '', consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = [
    { en: 'General Inquiry', ar: 'استفسار عام' },
    { en: 'Technical Support', ar: 'الدعم الفني' },
    { en: 'Billing Question', ar: 'سؤال حول الفواتير' },
    { en: 'Partnership', ar: 'شراكة' },
    { en: 'Feedback', ar: 'ردود الفعل' },
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = lang === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = lang === 'ar' ? 'بريد إلكتروني صحيح مطلوب' : 'Valid email required';
    if (!formData.phone.trim()) newErrors.phone = lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    if (!formData.category) newErrors.category = lang === 'ar' ? 'الفئة مطلوبة' : 'Category is required';
    if (!formData.subject.trim()) newErrors.subject = lang === 'ar' ? 'الموضوع مطلوب' : 'Subject is required';
    if (!formData.message.trim()) newErrors.message = lang === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';
    if (!formData.consent) newErrors.consent = lang === 'ar' ? 'يجب قبول الشروط' : 'Consent is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: '', email: '', phone: '', category: '', subject: '', message: '', consent: false });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      titleEn: 'Email',
      titleAr: 'البريد الإلكتروني',
      value: 'support@madar.ai',
      href: 'mailto:support@madar.ai',
    },
    {
      icon: Phone,
      titleEn: 'Phone',
      titleAr: 'الهاتف',
      value: '+966 (0) 11 XXXX XXXX',
      href: 'tel:+966',
    },
    {
      icon: MapPin,
      titleEn: 'Address',
      titleAr: 'العنوان',
      value: lang === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia',
      href: '#',
    },
  ];

  const faqs = [
    {
      qEn: 'How long does it take to respond?',
      qAr: 'كم من الوقت يستغرق الرد؟',
      aEn: 'We respond to all inquiries within 24 business hours.',
      aAr: 'نرد على جميع الاستفسارات خلال 24 ساعة عمل.',
    },
    {
      qEn: 'What are your support hours?',
      qAr: 'ما هي ساعات الدعم؟',
      aEn: 'Support is available 24/7 via email. Phone support: Sunday-Thursday, 9am-6pm (Riyadh time).',
      aAr: 'الدعم متاح على مدار الساعة عبر البريد الإلكتروني. الدعم الهاتفي: الأحد-الخميس، 9 صباحاً-6 مساءً (بتوقيت الرياض).',
    },
    {
      qEn: 'How is my data handled?',
      qAr: 'كيف يتم التعامل مع بيانات الحساب الخاصة بي؟',
      aEn: 'All data is encrypted and stored securely. See our Privacy Policy for details.',
      aAr: 'يتم تشفير جميع البيانات وتخزينها بأمان. راجع سياسة الخصوصية الخاصة بنا للمزيد من التفاصيل.',
    },
    {
      qEn: 'How do I change my subscription?',
      qAr: 'كيف أقوم بتغيير الاشتراك الخاص بي؟',
      aEn: 'You can upgrade, downgrade, or cancel anytime in your Account Settings.',
      aAr: 'يمكنك ترقية أو تخفيض أو إلغاء الاشتراك في أي وقت من إعدادات حسابك.',
    },
    {
      qEn: 'Do you offer refunds?',
      qAr: 'هل تقدمون استرجاعاً للأموال؟',
      aEn: 'Yes, refunds available within 14 days of subscription start.',
      aAr: 'نعم، استرجاع الأموال متاح خلال 14 يوماً من بدء الاشتراك.',
    },
    {
      qEn: 'Is there a free trial?',
      qAr: 'هل هناك نسخة تجريبية مجانية؟',
      aEn: 'Yes, the Free plan includes 1 property with basic features.',
      aAr: 'نعم، تتضمن الخطة المجانية عقار واحد مع ميزات أساسية.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2EFE8] text-[#0A0B10]">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F2EFE8] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0B10] mb-6">
              {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </h1>
            <p className="text-lg text-[#0A0B10]/60">
              {lang === 'ar'
                ? 'لدينا فريق متخصص هنا للمساعدة. أرسل لنا رسالة وسنرد عليك في أقرب وقت.'
                : 'We are here to help. Send us a message and we will respond promptly.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <a href={info.href} className="group">
                <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-[#F2EFE8] hover:bg-[#0A0B10] transition-all duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/20 group-hover:from-[#D95F3B] group-hover:to-[#C8972A] flex items-center justify-center mb-4 transition-all">
                    <info.icon className="w-6 h-6 text-[#D95F3B] group-hover:text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-[#0A0B10] group-hover:text-white mb-2 transition-colors">{lang === 'ar' ? info.titleAr : info.titleEn}</h3>
                  <p className="text-[#0A0B10]/60 group-hover:text-white/70 transition-colors">{info.value}</p>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        {/* Support Hours */}
        <FadeIn className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F1117] text-[#C8972A] text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            {lang === 'ar' ? 'ساعات العمل' : 'Working Hours'}
          </div>
          <p className="text-[#0A0B10]/60">
            {lang === 'ar'
              ? 'السبت - الخميس: 9 صباحاً - 6 مساءً (بتوقيت الرياض) | البريد الإلكتروني: 24/7'
              : 'Sat - Thu: 9am - 6pm (Riyadh Time) | Email: 24/7'}
          </p>
        </FadeIn>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8]">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'أرسل لنا رسالة' : 'Send us a Message'}
            </h2>
            <p className="text-[#0A0B10]/60">
              {lang === 'ar'
                ? 'ملء النموذج أدناه وسنرد عليك في أقرب وقت ممكن.'
                : 'Fill out the form below and we will respond as soon as possible.'}
            </p>
          </FadeIn>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-900">
                  {lang === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!'}
                </p>
                <p className="text-sm text-emerald-700">
                  {lang === 'ar'
                    ? 'شكراً على تواصلك معنا. سنرد عليك قريباً.'
                    : 'Thank you for reaching out. We will be in touch soon.'}
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-[#0A0B10]/[0.06]">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#0A0B10] mb-2">
                  {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Your name'}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-400' : 'border-[#0A0B10]/[0.06]'
                  } bg-white text-[#0A0B10] placeholder-[#0A0B10]/40 focus:outline-none focus:border-[#D95F3B]`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0A0B10] mb-2">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-400' : 'border-[#0A0B10]/[0.06]'
                  } bg-white text-[#0A0B10] placeholder-[#0A0B10]/40 focus:outline-none focus:border-[#D95F3B]`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#0A0B10] mb-2">
                  {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? 'border-red-400' : 'border-[#0A0B10]/[0.06]'
                  } bg-white text-[#0A0B10] placeholder-[#0A0B10]/40 focus:outline-none focus:border-[#D95F3B]`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#0A0B10] mb-2">
                  {lang === 'ar' ? 'فئة الاستفسار' : 'Inquiry Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.category ? 'border-red-400' : 'border-[#0A0B10]/[0.06]'
                  } bg-white text-[#0A0B10] focus:outline-none focus:border-[#D95F3B]`}
                >
                  <option value="">
                    {lang === 'ar' ? 'اختر فئة' : 'Select category'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.en} value={cat.en}>
                      {lang === 'ar' ? cat.ar : cat.en}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-[#0A0B10] mb-2">
                {lang === 'ar' ? 'الموضوع' : 'Subject'}
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={lang === 'ar' ? 'ملخص موجز' : 'Brief summary'}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.subject ? 'border-red-400' : 'border-[#0A0B10]/[0.06]'
                } bg-white text-[#0A0B10] placeholder-[#0A0B10]/40 focus:outline-none focus:border-[#D95F3B]`}
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-[#0A0B10] mb-2">
                {lang === 'ar' ? 'الرسالة' : 'Message'}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={lang === 'ar' ? 'تفاصيل الرسالة...' : 'Your message...'}
                rows="6"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.message ? 'border-red-400' : 'border-[#0A0B10]/[0.06]'
                } bg-white text-[#0A0B10] placeholder-[#0A0B10]/40 focus:outline-none focus:border-[#D95F3B] resize-none`}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                className="w-4 h-4 mt-1 accent-[#D95F3B]"
              />
              <label className="text-sm text-[#0A0B10]/60">
                {lang === 'ar' ? (
                  <>
                    أوافق على معالجة بيانات الاتصال الخاصة بي وفقاً
                    {' '}
                    <a href="/privacy" className="text-[#D95F3B] hover:underline">
                      لسياسة الخصوصية
                    </a>
                  </>
                ) : (
                  <>
                    I agree to have my contact data processed according to the
                    {' '}
                    <a href="/privacy" className="text-[#D95F3B] hover:underline">
                      Privacy Policy
                    </a>
                  </>
                )}
              </label>
              {errors.consent && <p className="text-red-500 text-xs mt-1">{errors.consent}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {lang === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A0B10] mb-4">
              {lang === 'ar' ? 'أسئلة متكررة' : 'Frequently Asked Questions'}
            </h2>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <details className="group border border-[#0A0B10]/[0.06] rounded-2xl p-6 hover:border-[#D95F3B]/30 transition-colors">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-[#0A0B10]">
                    <span>{lang === 'ar' ? faq.qAr : faq.qEn}</span>
                    <span className="text-[#D95F3B] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-[#0A0B10]/60 leading-relaxed">{lang === 'ar' ? faq.aAr : faq.aEn}</p>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-[#0A0B10]/[0.06] bg-white">
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
            <a href="/terms" className="text-sm text-[#0A0B10]/40 hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'الشروط' : 'Terms'}
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