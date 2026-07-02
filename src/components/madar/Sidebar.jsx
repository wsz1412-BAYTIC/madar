import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, BarChart3, DollarSign, Bell, Globe2,
  CalendarDays, Settings, CreditCard, Calculator, Link2, Gift,
  ShieldCheck, LogOut, ChevronLeft, ChevronRight, Menu, X, Globe, TrendingUp
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'properties', path: '/properties', icon: Building2 },
  { key: 'analytics', path: '/analytics', icon: BarChart3 },
  { key: 'aiRecommendations', path: '/pricing-recommendations', icon: TrendingUp },
  { key: 'revenue', path: '/revenue', icon: DollarSign },
  { key: 'alerts', path: '/alerts', icon: Bell },
  { key: 'market', path: '/market', icon: Globe2 },
  { key: 'calendar', path: '/calendar', icon: CalendarDays },
  { key: 'connect', path: '/connect', icon: Link2 },
  { key: 'referral', path: '/referral', icon: Gift },
  { key: 'calculator', path: '/calculator', icon: Calculator },
];

const bottomItems = [
  { key: 'settings', path: '/settings', icon: Settings },
  { key: 'billing', path: '/billing', icon: CreditCard },
  { key: 'admin', path: '/admin', icon: ShieldCheck },
];

export default function Sidebar() {
  const { t, toggleLang, isRTL } = useLang();
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '72px' : '250px');
  }, [collapsed]);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item }) => (
    <Link to={item.path} onClick={() => setMobileOpen(false)} className="group relative">
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
        isActive(item.path)
          ? 'text-[#F7F5F0] bg-white/[0.06]'
          : 'text-[#F7F5F0]/50 hover:text-[#F7F5F0] hover:bg-white/[0.03]'
      }`}>
        {isActive(item.path) && (
          <motion.div
            layoutId="activePill"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D95F3B]/15 to-[#C8972A]/5 border border-[#D95F3B]/20"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 relative z-10 transition-colors ${isActive(item.path) ? 'text-[#D95F3B]' : 'text-[#F7F5F0]/40 group-hover:text-[#F7F5F0]/70'}`} />
        {!collapsed && <span className="truncate relative z-10">{t(item.key)}</span>}
      </div>
    </Link>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-20 border-b border-white/[0.06]">
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D95F3B] to-[#C8972A] rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
              <span className="text-white font-bold text-sm font-heading">م</span>
            </div>
          </div>
          {!collapsed && <span className="font-heading font-bold text-xl text-[#F7F5F0] tracking-tight">Madar</span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-2 rounded-lg hover:bg-white/[0.04] text-[#F7F5F0]/30 hover:text-[#F7F5F0]/60 transition-all duration-500">
          {collapsed ? (isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : (isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(item => <NavLink key={item.key} item={item} />)}
      </div>

      <div className="px-3 py-4 border-t border-white/[0.04] space-y-1">
        {bottomItems.map(item => <NavLink key={item.key} item={item} />)}
        <button onClick={toggleLang} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#F7F5F0]/50 hover:bg-white/[0.03] hover:text-[#F7F5F0] transition-all w-full">
          <Globe className="w-[18px] h-[18px] text-[#F7F5F0]/40" />
          {!collapsed && <span>{t('language')}</span>}
        </button>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all w-full">
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 cinematic-blur bg-[#0A0B10]/80 border-b border-white/[0.06] h-16 flex items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D95F3B] to-[#C8972A] rounded-lg blur-sm opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <span className="text-white font-bold text-xs font-heading">م</span>
            </div>
          </div>
          <span className="font-heading font-bold text-lg text-[#F7F5F0] tracking-tight">Madar</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors duration-500">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-16 w-72 h-[calc(100%-64px)] bg-[#0F1117] shadow-2xl"
              style={{ [isRTL ? 'right' : 'left']: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 h-screen bg-[#0F1117] transition-all duration-300 z-40"
        style={{
          [isRTL ? 'right' : 'left']: 0,
          width: collapsed ? 72 : 250,
          [isRTL ? 'borderLeft' : 'borderRight']: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}