import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, X, Globe, Moon, Sun, LayoutDashboard, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/6a43dd3026ba0773af35c603/907c431e5_madar-removebg-preview.png';

/** Initials for the avatar chip — from the name when set, else the email. */
export function userInitials(user) {
  const name = (user?.full_name || '').trim();
  if (name) {
    const parts = name.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }
  return (user?.email || '?')[0].toUpperCase();
}

export default function PublicNavbar() {
  const { t, toggleLang, isRTL, lang } = useLang();
  // authChecked matters: until the session check finishes we render NEITHER
  // the guest CTAs nor the user menu — the old guest-first render is exactly
  // why a freshly logged-in user saw "Login / Start Free" on the homepage.
  const { isAuthenticated, user, authChecked, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close the user dropdown on any outside click.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const displayName = (user?.full_name || '').trim() || user?.email || '';

  const navItems = [
    { label: lang === 'ar' ? 'أرقام السوق' : 'Market Numbers', href: '/market-insights' },
    { label: t('navAnalysis'), href: '/property-analysis' },
    { label: t('navOpportunities'), href: '/opportunities' },
    { label: t('navHowItWorks'), href: '/how-to-use' },
    { label: t('navPricing'), href: '/pricing' },
  ];

  const getNavLinkClass = () => {
    const isDark = theme === 'dark';
    const textColor = scrolled
      ? (isDark ? 'text-[#F7F5F0]/70 hover:text-[#F7F5F0]' : 'text-[#0A0B10]/60 hover:text-[#0A0B10]')
      : (isDark ? 'text-[#F7F5F0]/60 hover:text-[#F7F5F0]' : 'text-[#0A0B10]/70 hover:text-[#0A0B10]');
    return `relative text-sm font-light tracking-wide ${textColor} transition-colors duration-500 after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-px after:bg-gradient-to-r after:from-[#D95F3B] after:to-[#C8972A] hover:after:w-full after:transition-all after:duration-500`;
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? `cinematic-blur py-3 shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#0A0B10]/95 border-b border-white/[0.06] shadow-black/40'
                : 'bg-white/95 border-b border-black/[0.08]'
            }`
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D95F3B]/30 to-[#C8972A]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={LOGO_URL}
                alt="Madar"
                className="relative h-20 w-auto group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* Center nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} className={getNavLinkClass()}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Theme & Language Toggles */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-500 ${
                theme === 'dark'
                  ? 'text-[#F7F5F0]/50 hover:text-[#F7F5F0] hover:bg-white/5'
                  : 'text-[#0A0B10]/50 hover:text-[#0A0B10] hover:bg-black/5'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggleLang} className={`text-sm font-light tracking-wide transition-colors duration-500 flex items-center gap-1.5 ${
              theme === 'dark'
                ? `${scrolled ? 'text-[#F7F5F0]/50 hover:text-[#F7F5F0]' : 'text-[#F7F5F0]/60 hover:text-[#F7F5F0]'}`
                : `${scrolled ? 'text-[#0A0B10]/50 hover:text-[#0A0B10]' : 'text-[#0A0B10]/60 hover:text-[#0A0B10]'}`
            }`}>
              <Globe className="w-3.5 h-3.5" />
              {t('language')}
            </button>
            {!authChecked ? (
              /* Session check in flight — neutral placeholder, never guest CTAs */
              <div aria-hidden="true" className={`w-24 h-9 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.05]'}`} />
            ) : isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`px-5 py-2.5 text-sm font-light tracking-wide glass rounded-full transition-all duration-500 ${
                  theme === 'dark'
                    ? 'text-[#F7F5F0] hover:bg-white/10'
                    : 'text-[#0A0B10] hover:bg-black/5'
                }`}>
                  {t('dashboard')}
                </Link>
                {/* User menu: avatar + name → Dashboard / Account / Logout */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label={lang === 'ar' ? 'قائمة المستخدم' : 'User menu'}
                    className={`flex items-center gap-2 ps-1.5 pe-3 py-1.5 rounded-full glass transition-all duration-300 ${
                      theme === 'dark' ? 'text-[#F7F5F0] hover:bg-white/10' : 'text-[#0A0B10] hover:bg-black/5'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D95F3B] to-[#C8972A] text-white text-[11px] font-semibold flex items-center justify-center">
                      {userInitials(user)}
                    </span>
                    <span className="text-sm font-light max-w-[140px] truncate">{displayName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        role="menu"
                        className={`absolute top-full mt-2 end-0 min-w-[200px] rounded-xl p-1.5 shadow-2xl border ${
                          theme === 'dark'
                            ? 'bg-[#12141C] border-white/[0.08] shadow-black/50'
                            : 'bg-white border-black/[0.08] shadow-black/10'
                        }`}
                      >
                        <Link to="/dashboard" role="menuitem" onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-light transition-colors ${
                            theme === 'dark' ? 'text-[#F7F5F0]/80 hover:text-[#F7F5F0] hover:bg-white/5' : 'text-[#0A0B10]/80 hover:text-[#0A0B10] hover:bg-black/5'
                          }`}>
                          <LayoutDashboard className="w-4 h-4 opacity-60" />{t('dashboard')}
                        </Link>
                        <Link to="/settings" role="menuitem" onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-light transition-colors ${
                            theme === 'dark' ? 'text-[#F7F5F0]/80 hover:text-[#F7F5F0] hover:bg-white/5' : 'text-[#0A0B10]/80 hover:text-[#0A0B10] hover:bg-black/5'
                          }`}>
                          <UserCircle className="w-4 h-4 opacity-60" />{t('account')}
                        </Link>
                        <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-light text-danger hover:bg-danger/10 transition-colors">
                          <LogOut className="w-4 h-4 opacity-70" />{t('logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`text-sm font-light tracking-wide transition-colors duration-500 ${
                  theme === 'dark'
                    ? 'text-[#F7F5F0]/70 hover:text-[#F7F5F0]'
                    : 'text-[#0A0B10]/70 hover:text-[#0A0B10]'
                }`}>
                  {t('login')}
                </Link>
                <Link to="/signup" className="group relative px-6 py-2.5 text-sm font-light tracking-wide text-white bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-full hover:shadow-xl hover:shadow-[#D95F3B]/30 transition-all duration-500 overflow-hidden">
                  <span className="relative z-10">{t('getStarted')}</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} aria-label={lang === 'ar' ? 'القائمة' : 'Menu'} className={`lg:hidden relative w-10 h-10 flex items-center justify-center ${theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'}`}>
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`lg:hidden cinematic-blur overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#0A0B10]/95 border-t border-white/[0.06]'
                : 'bg-white/95 border-t border-black/[0.08]'
            }`}
          >
            <div className="px-6 py-8 space-y-5">
              {navItems.map((item) => (
                <Link key={item.label} to={item.href} onClick={() => setOpen(false)} className={`block text-base font-light transition-colors ${
                  theme === 'dark'
                    ? 'text-[#F7F5F0]/70 hover:text-[#F7F5F0]'
                    : 'text-[#0A0B10]/70 hover:text-[#0A0B10]'
                }`}>
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => { toggleTheme(); setOpen(false); }}
                  className={`p-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'text-[#F7F5F0]/50 hover:text-[#F7F5F0] hover:bg-white/5'
                      : 'text-[#0A0B10]/50 hover:text-[#0A0B10] hover:bg-black/5'
                  }`}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={() => { toggleLang(); setOpen(false); }} className={`flex items-center gap-2 text-base font-light transition-colors ${
                  theme === 'dark'
                    ? 'text-[#F7F5F0]/70 hover:text-[#F7F5F0]'
                    : 'text-[#0A0B10]/70 hover:text-[#0A0B10]'
                }`}>
                  <Globe className="w-4 h-4" />{t('language')}
                </button>
              </div>
              <div className={`pt-5 space-y-4 ${
                theme === 'dark'
                  ? 'border-t border-white/[0.06]'
                  : 'border-t border-black/[0.08]'
              }`}>
                {!authChecked ? (
                  <div aria-hidden="true" className={`w-full h-11 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.05]'}`} />
                ) : isAuthenticated ? (
                  <>
                    <div className={`flex items-center gap-3 px-2 pb-1 ${theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'}`}>
                      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D95F3B] to-[#C8972A] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {userInitials(user)}
                      </span>
                      <span className="text-sm font-light truncate">{displayName}</span>
                    </div>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className={`flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-light glass rounded-full ${
                      theme === 'dark' ? 'text-white' : 'text-[#0A0B10]'
                    }`}><LayoutDashboard className="w-4 h-4 opacity-60" />{t('dashboard')}</Link>
                    <Link to="/settings" onClick={() => setOpen(false)} className={`flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-light glass rounded-full ${
                      theme === 'dark' ? 'text-white' : 'text-[#0A0B10]'
                    }`}><UserCircle className="w-4 h-4 opacity-60" />{t('account')}</Link>
                    <button type="button" onClick={() => { setOpen(false); logout(); }}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-light text-danger bg-danger/10 rounded-full">
                      <LogOut className="w-4 h-4 opacity-70" />{t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className={`block w-full text-center px-5 py-3 text-sm font-light rounded-full ${
                      theme === 'dark'
                        ? 'text-[#F7F5F0]/80'
                        : 'text-[#0A0B10]/80'
                    }`}>{t('login')}</Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="block w-full text-center px-5 py-3 text-sm font-light text-white bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-full">{t('getStarted')}</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}