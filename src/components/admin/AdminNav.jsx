import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  LayoutDashboard, Users, Home, CreditCard, Database, Settings, 
  FileText, Menu, X, Shield, MessageSquare, BarChart3, Building2, Inbox, ShieldCheck, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminNav({ admin }) {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: LayoutDashboard, href: '/admin' },
    { label: lang === 'ar' ? 'المستخدمون' : 'Users', icon: Users, href: '/admin/users' },
    { label: lang === 'ar' ? 'العقارات' : 'Properties', icon: Home, href: '/admin/properties' },
    { label: lang === 'ar' ? 'الاشتراكات' : 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
    { label: lang === 'ar' ? 'البيانات' : 'Data', icon: Database, href: '/admin/data' },
    { label: lang === 'ar' ? 'المحتوى' : 'Content', icon: FileText, href: '/admin/content' },
    { label: lang === 'ar' ? 'الدعم' : 'Support', icon: MessageSquare, href: '/admin/support' },
    { label: lang === 'ar' ? 'الفرص العقارية' : 'Opportunities', icon: Building2, href: '/admin/opportunities' },
    { label: lang === 'ar' ? 'طلبات الفرص' : 'Opportunity Requests', icon: Inbox, href: '/admin/opportunity-requests' },
    { label: lang === 'ar' ? 'التحقق من العقار' : 'Property Verification', icon: ShieldCheck, href: '/admin/property-verification' },
    { label: lang === 'ar' ? 'تحديثات المنصة' : 'Site Updates', icon: Megaphone, href: '/admin/site-updates' },
    { label: lang === 'ar' ? 'السجلات' : 'Audit Logs', icon: BarChart3, href: '/admin/logs' },
    { label: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const isActive = (href) => location.pathname === href || (href === '/admin/opportunities' && location.pathname.startsWith('/admin/opportunities/'));

  const NavLink = ({ item }) => (
    <Link
      to={item.href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive(item.href)
          ? 'bg-primary/20 text-primary'
          : theme === 'dark'
            ? 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
            : 'text-[#0A0B10]/60 hover:text-[#0A0B10] hover:bg-black/5'
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-6 ${isRTL ? 'left-6' : 'right-6'} z-50 lg:hidden p-2 rounded-lg ${
          theme === 'dark'
            ? 'bg-card border border-foreground/[0.06]'
            : 'bg-white border border-[#0A0B10]/[0.06]'
        }`}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/50"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.nav
        initial={false}
        animate={{ x: open ? 0 : isRTL ? 280 : -280 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-64 z-40 lg:static lg:translate-x-0 lg:w-64 border-r overflow-y-auto ${
          theme === 'dark'
            ? 'bg-background border-foreground/[0.06]'
            : 'bg-white border-[#0A0B10]/[0.06]'
        }`}
      >
        <div className="p-6">
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className={`font-heading font-bold ${
              theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
            }`}>
              {lang === 'ar' ? 'مسؤول' : 'Admin'}
            </span>
          </Link>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Divider */}
          <div className={`my-6 h-px ${
            theme === 'dark' ? 'bg-foreground/[0.06]' : 'bg-background/[0.06]'
          }`} />

          {/* Admin Info */}
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-foreground/[0.04]' : 'bg-background/[0.04]'
          }`}>
            <p className={`text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-foreground/60' : 'text-[#0A0B10]/60'
            }`}>
              {lang === 'ar' ? 'دورك' : 'Your Role'}
            </p>
            <p className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
            }`}>
              {admin?.role || 'Admin'}
            </p>
          </div>
        </div>
      </motion.nav>
    </>
  );
}