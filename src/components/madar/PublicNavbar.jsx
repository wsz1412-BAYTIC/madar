import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinkClass = "relative text-sm font-light tracking-wide text-[#F7F5F0]/55 hover:text-[#F7F5F0] transition-colors duration-500 after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-px after:bg-gradient-to-r after:from-[#D95F3B] after:to-[#C8972A] hover:after:w-full after:transition-all after:duration-500";

export default function PublicNavbar() {
  const { t, toggleLang, isRTL } = useLang();
  const { isAuthenticated } = useMadarAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'cinematic-blur bg-[#0A0B10]/80 border-b border-white/[0.06] py-3'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D95F3B] to-[#C8972A] rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <span className="text-white font-bold text-sm font-heading">م</span>
              </div>
            </div>
            <span className="font-heading font-bold text-xl text-[#F7F5F0] tracking-tight">Madar</span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-12">
            <Link to="/" className={navLinkClass}>{t('home')}</Link>
            <Link to="/calculator" className={navLinkClass}>{t('calculator')}</Link>
            <button onClick={toggleLang} className={`${navLinkClass} flex items-center gap-2`}>
              <Globe className="w-3.5 h-3.5" />{t('language')}
            </button>
          </div>

          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-5 py-2.5 text-sm font-light tracking-wide text-[#F7F5F0] glass rounded-full hover:bg-white/10 transition-all duration-500">
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-light tracking-wide text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors duration-500">
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
          <button onClick={() => setOpen(!open)} className="md:hidden relative w-10 h-10 flex items-center justify-center text-[#F7F5F0]">
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
            className="md:hidden cinematic-blur bg-[#0A0B10]/95 border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <Link to="/" onClick={() => setOpen(false)} className="block text-base font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">{t('home')}</Link>
              <Link to="/calculator" onClick={() => setOpen(false)} className="block text-base font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">{t('calculator')}</Link>
              <button onClick={() => { toggleLang(); setOpen(false); }} className="flex items-center gap-2 text-base font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">
                <Globe className="w-4 h-4" />{t('language')}
              </button>
              <div className="pt-6 border-t border-white/[0.06] space-y-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block w-full text-center px-5 py-3 text-sm font-light text-white glass rounded-full">{t('dashboard')}</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center px-5 py-3 text-sm font-light text-[#F7F5F0]/80 rounded-full">{t('login')}</Link>
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