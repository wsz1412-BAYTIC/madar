import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicNavbar() {
  const { t, toggleLang, isRTL } = useLang();
  const { isAuthenticated } = useMadarAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'cinematic-blur bg-[#0A0B10]/70 border-b border-white/[0.04]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <span className="font-heading font-bold text-lg text-[#F7F5F0]">Madar</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-[#F7F5F0]/60 hover:text-[#F7F5F0] transition-colors">{t('home')}</Link>
            <Link to="/calculator" className="text-sm text-[#F7F5F0]/60 hover:text-[#F7F5F0] transition-colors">{t('calculator')}</Link>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm text-[#F7F5F0]/60 hover:text-[#F7F5F0] transition-colors">
              <Globe className="w-4 h-4" />{t('language')}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-[#F7F5F0]/80 hover:text-[#F7F5F0] transition-colors">
                  {t('login')}
                </Link>
                <Link to="/signup" className="relative px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all overflow-hidden group">
                  <span className="relative z-10">{t('getStarted')}</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-[#F7F5F0]">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden cinematic-blur bg-[#0A0B10]/90 border-t border-white/[0.04] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setOpen(false)} className="block text-sm text-[#F7F5F0]/70 py-2">{t('home')}</Link>
              <Link to="/calculator" onClick={() => setOpen(false)} className="block text-sm text-[#F7F5F0]/70 py-2">{t('calculator')}</Link>
              <button onClick={() => { toggleLang(); setOpen(false); }} className="flex items-center gap-1.5 text-sm text-[#F7F5F0]/70 py-2">
                <Globe className="w-4 h-4" />{t('language')}
              </button>
              <div className="pt-2 border-t border-white/[0.04] space-y-2">
                {isAuthenticated ? (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-white/5 rounded-lg">{t('dashboard')}</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center px-4 py-2 text-sm text-[#F7F5F0]/80">{t('login')}</Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-lg">{t('getStarted')}</Link>
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