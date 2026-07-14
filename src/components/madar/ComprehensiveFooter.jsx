import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Globe, Moon, Sun, ChevronDown, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/6a43dd3026ba0773af35c603/907c431e5_madar-removebg-preview.png';

export default function ComprehensiveFooter() {
  const { lang, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [expandedMobile, setExpandedMobile] = useState(null);

  const isRTL = lang === 'ar';

  const columns = [
    {
      title: lang === 'ar' ? 'المنتج' : 'Product',
      links: [
        { label: lang === 'ar' ? 'كيف يعمل مدار' : 'How Madar Works', to: '/how-to-use' },
        { label: lang === 'ar' ? 'تحليل العقارات' : 'Property Analysis', to: '/analytics' },
        { label: lang === 'ar' ? 'بيانات السوق' : 'Market Data', to: '/market' },
        { label: lang === 'ar' ? 'التسعير الذكي' : 'Smart Pricing', to: '/pricing-guide' },
        { label: lang === 'ar' ? 'فرص الإيرادات' : 'Revenue Opportunities', to: '/revenue' },
        { label: lang === 'ar' ? 'المدن المدعومة' : 'Supported Cities', to: '/#supported-cities' },
        { label: lang === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans', to: '/plans' },
        { label: lang === 'ar' ? 'التكاملات' : 'Platform Integrations', to: '/connect' },
      ],
    },
    {
      title: lang === 'ar' ? 'الدعم والمساعدة' : 'Help & Support',
      links: [
        { label: lang === 'ar' ? 'مركز المساعدة' : 'Help Center', to: '/help' },
        { label: lang === 'ar' ? 'دليل الاستخدام' : 'How to Use Madar', to: '/how-to-use' },
        { label: lang === 'ar' ? 'البدء السريع' : 'Getting Started', to: '/help?category=getting-started' },
        { label: lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ', to: '/help?category=faq' },
        { label: lang === 'ar' ? 'اتصل بنا' : 'Contact Us', to: '/contact' },
        { label: lang === 'ar' ? 'الدعم الفني' : 'Technical Support', to: '/contact' },
        { label: lang === 'ar' ? 'حالة الخدمة' : 'Service Status', to: '/status' },
      ],
    },
    {
      title: lang === 'ar' ? 'القانونية والمسؤوليات' : 'Legal & Responsibilities',
      links: [
        { label: lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions', to: '/terms' },
        { label: lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', to: '/privacy' },
        { label: lang === 'ar' ? 'إخلاء مسؤولية البيانات' : 'Data Analytics Disclaimer', to: '/ai-disclaimer' },
        { label: lang === 'ar' ? 'إخلاء مسؤولية AI' : 'AI Disclaimer', to: '/ai-disclaimer' },
        { label: lang === 'ar' ? 'سياسة الاشتراك والإلغاء' : 'Subscription & Refund Policy', to: '/subscription' },
        { label: lang === 'ar' ? 'سياسة الكوكيز' : 'Cookie Policy', to: '/cookies' },
        { label: lang === 'ar' ? 'سياسة الاستخدام' : 'Acceptable Use Policy', to: '/aup' },
        { label: lang === 'ar' ? 'حقوق الملكية الفكرية' : 'IP & Trademark Notice', to: '/ip-trademark' },
        { label: lang === 'ar' ? 'تنصل من منصات الطرف الثالث' : 'Third-Party Platforms Disclaimer', to: '/third-party' },
        { label: lang === 'ar' ? 'إمكانية الوصول' : 'Accessibility', to: '/accessibility' },
      ],
    },
    {
      title: lang === 'ar' ? 'الشركة' : 'Company',
      links: [
        { label: lang === 'ar' ? 'عن مدار' : 'About Madar', to: '/#about' },
        { label: lang === 'ar' ? 'معلومات التواصل' : 'Contact Information', to: '/contact' },
        { label: lang === 'ar' ? 'الوظائف' : 'Careers', to: '/careers', external: true },
        { label: lang === 'ar' ? 'الأخبار والمقالات' : 'News & Insights', to: '/blog', external: true },
        { label: lang === 'ar' ? 'الشركاء' : 'Partners', to: '/partners', external: true },
        { label: lang === 'ar' ? 'المنصات المدعومة' : 'Supported Platforms', to: '/#platforms' },
      ],
    },
    {
      title: lang === 'ar' ? 'الحساب' : 'Account',
      links: [
        { label: lang === 'ar' ? 'تسجيل الدخول' : 'Sign In', to: '/login' },
        { label: lang === 'ar' ? 'إنشاء حساب' : 'Create Account', to: '/signup' },
        { label: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard', to: '/dashboard' },
        { label: lang === 'ar' ? 'إدارة الاشتراك' : 'Manage Subscription', to: '/billing' },
        { label: lang === 'ar' ? 'سجل الفواتير' : 'Billing History', to: '/billing' },
        { label: lang === 'ar' ? 'طلبات الخصوصية' : 'Privacy Requests', to: '/contact' },
      ],
    },
  ];

  const MobileSection = ({ column }) => (
    <div className="border-b border-[#06131F]/10">
      <button
        onClick={() => setExpandedMobile(expandedMobile === column.title ? null : column.title)}
        className="w-full py-4 px-4 flex items-center justify-between hover:bg-[#06131F]/5 transition-colors"
      >
        <span className={`font-bold text-sm ${
          theme === 'dark' ? 'text-[#F2F8FC]' : 'text-[#06131F]'
        }`}>
          {column.title}
        </span>
        <motion.div animate={{ rotate: expandedMobile === column.title ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: expandedMobile === column.title ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="px-4 py-2 space-y-2 bg-[#06131F]/3">
          {column.links.map((link, idx) => (
            <div key={idx}>
              {link.external ? (
                <a
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-xs transition-colors ${
                    theme === 'dark'
                      ? 'text-[#F2F8FC]/60 hover:text-[#1B84C4]'
                      : 'text-[#06131F]/60 hover:text-[#1B84C4]'
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.to}
                  className={`block text-xs transition-colors ${
                    theme === 'dark'
                      ? 'text-[#F2F8FC]/60 hover:text-[#1B84C4]'
                      : 'text-[#06131F]/60 hover:text-[#1B84C4]'
                  }`}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (
    <footer className={`border-t ${
      theme === 'dark'
        ? 'border-white/[0.06] bg-background'
        : 'border-[#06131F]/[0.06] bg-[#F9F8F6]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {columns.map((column, idx) => (
            <div key={idx}>
              <h3 className={`font-bold text-sm mb-6 ${
                theme === 'dark' ? 'text-[#F2F8FC]' : 'text-[#06131F]'
              }`}>
                {column.title}
              </h3>
              <div className="space-y-3">
                {column.links.map((link, linkIdx) => (
                  <div key={linkIdx}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs transition-colors ${
                          theme === 'dark'
                            ? 'text-[#F2F8FC]/60 hover:text-[#1B84C4]'
                            : 'text-[#06131F]/60 hover:text-[#1B84C4]'
                        }`}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className={`text-xs transition-colors ${
                          theme === 'dark'
                            ? 'text-[#F2F8FC]/60 hover:text-[#1B84C4]'
                            : 'text-[#06131F]/60 hover:text-[#1B84C4]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden mb-8">
          {columns.map((column, idx) => (
            <MobileSection key={idx} column={column} />
          ))}
        </div>

        {/* Brand Section */}
        <div className={`py-8 mb-8 border-t ${
          theme === 'dark' ? 'border-white/[0.06]' : 'border-[#06131F]/[0.06]'
        }`}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Logo & Description */}
            <div>
              <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
                <img
                  src={LOGO_URL}
                  alt="Madar"
                  className={`${isRTL ? 'h-16' : 'h-16'} w-auto`}
                />
              </Link>
              <p className={`text-xs leading-relaxed max-w-xs ${
                theme === 'dark' ? 'text-[#F2F8FC]/60' : 'text-[#06131F]/60'
              }`}>
                {lang === 'ar'
                  ? 'مدار منصة ذكاء سوقي مدعومة بالذكاء الاصطناعي تساعد مشغلي الإيجارات قصيرة المدى على تحسين التسعير والإشغال والإيرادات في المملكة العربية السعودية.'
                  : 'Madar is an AI-powered market intelligence platform that helps short-term rental operators improve pricing, occupancy, and revenue across Saudi Arabia.'}
              </p>
            </div>

            {/* Contact & Utilities */}
            <div className={`space-y-4 ${isRTL ? 'md:text-right' : ''}`}>
              {/* Contact Info */}
              <div className="space-y-2">
                <a
                  href="tel:+966538100119"
                  className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-3 text-xs transition-colors ${
                    theme === 'dark'
                      ? 'text-[#F2F8FC]/60 hover:text-[#1B84C4]'
                      : 'text-[#06131F]/60 hover:text-[#1B84C4]'
                  }`}
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+966 53 810 0119</span>
                </a>
                <a
                  href="https://wa.me/966538100119"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-3 text-xs transition-colors ${
                    theme === 'dark'
                      ? 'text-[#F2F8FC]/60 hover:text-[#25D366]'
                      : 'text-[#06131F]/60 hover:text-[#25D366]'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                </a>
                <a
                  href="mailto:Admin@baytic.app"
                  className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-3 text-xs transition-colors ${
                    theme === 'dark'
                      ? 'text-[#F2F8FC]/60 hover:text-[#1B84C4]'
                      : 'text-[#06131F]/60 hover:text-[#1B84C4]'
                  }`}
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>Admin@baytic.app</span>
                </a>
                <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-start gap-3 text-xs ${
                  theme === 'dark' ? 'text-[#F2F8FC]/60' : 'text-[#06131F]/60'
                }`}>
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{lang === 'ar' ? 'حي النهضة، جدة، المملكة العربية السعودية' : 'Al Nahdah District, Jeddah, Kingdom of Saudi Arabia'}</span>
                </div>
              </div>

              {/* Theme & Language Toggles */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'bg-white/[0.04] text-[#F2F8FC]/60 hover:bg-white/[0.08] hover:text-[#F2F8FC]'
                      : 'bg-[#06131F]/5 text-[#06131F]/60 hover:bg-[#06131F]/10 hover:text-[#06131F]'
                  }`}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleLang}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    theme === 'dark'
                      ? 'bg-white/[0.04] text-[#F2F8FC]/60 hover:bg-white/[0.08] hover:text-[#F2F8FC]'
                      : 'bg-[#06131F]/5 text-[#06131F]/60 hover:bg-[#06131F]/10 hover:text-[#06131F]'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  {lang === 'ar' ? 'EN' : 'AR'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`py-6 border-t ${
          theme === 'dark' ? 'border-white/[0.06]' : 'border-[#06131F]/[0.06]'
        } flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          theme === 'dark' ? 'text-[#F2F8FC]/40' : 'text-[#06131F]/40'
        }`}>
          <span>© 2025 Madar. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</span>
          <div className="flex gap-4">
            <Link to="/privacy" className={`transition-colors hover:${
              theme === 'dark' ? 'text-[#1B84C4]' : 'text-[#1B84C4]'
            }`}>
              {lang === 'ar' ? 'الخصوصية' : 'Privacy'}
            </Link>
            <Link to="/terms" className={`transition-colors hover:${
              theme === 'dark' ? 'text-[#1B84C4]' : 'text-[#1B84C4]'
            }`}>
              {lang === 'ar' ? 'الشروط' : 'Terms'}
            </Link>
            <Link to="/cookies" className={`transition-colors hover:${
              theme === 'dark' ? 'text-[#1B84C4]' : 'text-[#1B84C4]'
            }`}>
              {lang === 'ar' ? 'الكوكيز' : 'Cookies'}
            </Link>
            <Link to="/subscription" className="transition-colors hover:text-[#1B84C4]">
              {lang === 'ar' ? 'شروط الاشتراك' : 'Subscription Terms'}
            </Link>
            <Link to="/data-ai-policy" className="transition-colors hover:text-[#1B84C4]">
              {lang === 'ar' ? 'البيانات والذكاء الاصطناعي' : 'Data & AI Policy'}
            </Link>
            <Link to="/contact" className="transition-colors hover:text-[#1B84C4]">
              {lang === 'ar' ? 'الشكاوى وطلبات البيانات' : 'Complaints & Data Requests'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}