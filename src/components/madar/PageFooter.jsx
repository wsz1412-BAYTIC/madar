import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';

const LOGO_URL = 'https://media.base44.com/images/public/6a43dd3026ba0773af35c603/907c431e5_madar-removebg-preview.png';

export default function PageFooter() {
  const { lang } = useLang();

  return (
    <footer className="py-16 px-4 border-t border-[#0A0B10]/[0.06] bg-[#F2EFE8]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-12 mb-12">
          {/* Logo & Description */}
          <div className="flex-shrink-0">
            <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <img
                src={LOGO_URL}
                alt="Madar"
                className="h-24 w-auto"
              />
            </Link>
            <p className="text-sm text-[#0A0B10]/60 max-w-xs leading-relaxed">
              {lang === 'ar'
                ? 'مدار هي منصة ذكاء السوق المدعومة بالذكاء الاصطناعي تساعد مشغلي الإيجار قصير الأجل على اتخاذ قرارات تسعير وإيرادات أفضل عبر المملكة العربية السعودية.'
                : 'Madar is an AI-powered market intelligence platform helping short-term rental operators make better pricing and revenue decisions across Saudi Arabia.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-[#0A0B10] text-sm mb-4">
              {lang === 'ar' ? 'الروابط السريعة' : 'Quick Links'}
            </h3>
            <div className="space-y-2">
              <Link to="/" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <Link to="/calculator" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'الحاسبة' : 'Calculator'}
              </Link>
              <Link to="/login" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Link>
              <Link to="/signup" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'التسجيل' : 'Sign Up'}
              </Link>
            </div>
          </div>

          {/* Legal & Policy */}
          <div>
            <h3 className="font-heading font-bold text-[#0A0B10] text-sm mb-4">
              {lang === 'ar' ? 'السياسات والقانون' : 'Legal & Policy'}
            </h3>
            <div className="space-y-2">
              <Link to="/privacy" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <Link to="/terms" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'الشروط' : 'Terms'}
              </Link>
              <Link to="/aup" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'سياسة الاستخدام' : 'Acceptable Use'}
              </Link>
              <Link to="/ip-trademark" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'الملكية الفكرية' : 'IP & Trademark'}
              </Link>
            </div>
          </div>

          {/* Support & Company */}
          <div>
            <h3 className="font-heading font-bold text-[#0A0B10] text-sm mb-4">
              {lang === 'ar' ? 'الدعم والشركة' : 'Support & Company'}
            </h3>
            <div className="space-y-2">
              <Link to="/contact" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
              </Link>
              <Link to="/cookies" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'سياسة الكوكيز' : 'Cookie Policy'}
              </Link>
              <Link to="/third-party" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'جهات خارجية' : 'Third-Party'}
              </Link>
              <Link to="/ai-disclaimer" className="text-sm text-[#0A0B10]/60 hover:text-[#D95F3B] transition-colors block">
                {lang === 'ar' ? 'إخلاء المسؤولية AI' : 'AI Disclaimer'}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#0A0B10]/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#0A0B10]/40">
          <span>© 2025 Madar. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'الخصوصية' : 'Privacy'}
            </a>
            <a href="/terms" className="hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'الشروط' : 'Terms'}
            </a>
            <a href="/cookies" className="hover:text-[#D95F3B] transition-colors">
              {lang === 'ar' ? 'الكوكيز' : 'Cookies'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}