import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOverview({ admin }) {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const Arrow = isRTL ? ArrowRight : ArrowRight;

  const sections = [
    {
      title: lang === 'ar' ? 'إدارة المستخدمين' : 'User Management',
      description: lang === 'ar' ? 'عرض وإدارة حسابات المستخدمين' : 'View and manage user accounts',
      href: '/admin/users',
    },
    {
      title: lang === 'ar' ? 'إدارة العقارات' : 'Property Management',
      description: lang === 'ar' ? 'عرض وإدارة جميع العقارات' : 'View and manage all properties',
      href: '/admin/properties',
    },
    {
      title: lang === 'ar' ? 'الاشتراكات والدفع' : 'Subscriptions & Payments',
      description: lang === 'ar' ? 'إدارة الخطط والفواتير' : 'Manage plans and billing',
      href: '/admin/subscriptions',
    },
    {
      title: lang === 'ar' ? 'إدارة المحتوى' : 'Content Management',
      description: lang === 'ar' ? 'تحديث موارد الموقع' : 'Update website resources',
      href: '/admin/content',
    },
    {
      title: lang === 'ar' ? 'السجلات' : 'Audit Logs',
      description: lang === 'ar' ? 'عرض سجل النشاط' : 'View activity history',
      href: '/admin/logs',
    },
    {
      title: lang === 'ar' ? 'الدعم الفني' : 'Support',
      description: lang === 'ar' ? 'إدارة تذاكر الدعم' : 'Manage support tickets',
      href: '/admin/support',
    },
  ];

  return (
    <div>
      <h2 className={`text-2xl font-heading font-bold mb-6 ${
        theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
      }`}>
        {lang === 'ar' ? 'المقاطع الرئيسية' : 'Main Sections'}
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Link
              to={section.href}
              className={`block p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-card border-foreground/[0.06] hover:border-primary/30'
                  : 'bg-white border-[#0A0B10]/[0.06] hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'
                }`}>
                  <Arrow className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className={`text-lg font-heading font-bold mb-2 ${
                theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
              }`}>
                {section.title}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-foreground/60' : 'text-[#0A0B10]/60'
              }`}>
                {section.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}