import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Building2, BarChart3, DollarSign, Bell, Globe2,
  CalendarDays, Settings, CreditCard, Calculator, Link2, Gift,
  ShieldCheck, LogOut, ChevronLeft, ChevronRight, Menu, X, Globe
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'properties', path: '/properties', icon: Building2 },
  { key: 'analytics', path: '/analytics', icon: BarChart3 },
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
  const { logout } = useMadarAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '64px' : '240px');
  }, [collapsed]);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
        ${isActive(item.path)
          ? 'bg-[#D95F3B]/10 text-[#D95F3B] font-medium'
          : 'text-[#1C1F2E]/60 hover:bg-[#1C1F2E]/5 hover:text-[#1C1F2E]'
        }`}
    >
      <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive(item.path) ? 'text-[#D95F3B]' : 'text-[#1C1F2E]/40 group-hover:text-[#1C1F2E]/60'}`} />
      {!collapsed && <span className="truncate">{t(item.key)}</span>}
    </Link>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#1C1F2E]/5">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">م</span>
          </div>
          {!collapsed && <span className="font-heading font-bold text-[#1C1F2E]">Madar</span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1.5 rounded-md hover:bg-[#1C1F2E]/5 text-[#1C1F2E]/40">
          {collapsed ? (isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : (isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(item => <NavLink key={item.key} item={item} />)}
      </div>

      <div className="px-3 py-4 border-t border-[#1C1F2E]/5 space-y-1">
        {bottomItems.map(item => <NavLink key={item.key} item={item} />)}
        <button onClick={toggleLang} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#1C1F2E]/60 hover:bg-[#1C1F2E]/5 hover:text-[#1C1F2E] transition-all w-full">
          <Globe className="w-[18px] h-[18px] text-[#1C1F2E]/40" />
          {!collapsed && <span>{t('language')}</span>}
        </button>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500/70 hover:bg-red-50 hover:text-red-600 transition-all w-full">
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#F7F5F0]/80 backdrop-blur-xl border-b border-[#1C1F2E]/5 h-14 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
            <span className="text-white font-bold text-xs">م</span>
          </div>
          <span className="font-heading font-bold text-sm text-[#1C1F2E]">Madar</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-5 h-5 text-[#1C1F2E]" /> : <Menu className="w-5 h-5 text-[#1C1F2E]" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 w-64 h-[calc(100%-56px)] bg-[#F7F5F0] shadow-xl" style={{ [isRTL ? 'right' : 'left']: 0 }} onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 h-screen bg-[#F7F5F0] transition-all duration-300 z-40"
        style={{
          [isRTL ? 'right' : 'left']: 0,
          width: collapsed ? 64 : 240,
          [isRTL ? 'borderLeft' : 'borderRight']: '1px solid rgba(28,31,46,0.05)',
          '--sidebar-push': collapsed ? '64px' : '240px',
        }}
        ref={(el) => {
          if (el) {
            const root = document.documentElement;
            root.style.setProperty('--sidebar-width', collapsed ? '64px' : '240px');
          }
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}