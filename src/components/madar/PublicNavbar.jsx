import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { Menu, X, Globe } from 'lucide-react';

export default function PublicNavbar() {
  const { t, toggleLang, isRTL } = useLang();
  const { isAuthenticated } = useMadarAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F5F0]/80 backdrop-blur-xl border-b border-[#1C1F2E]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <span className="font-heading font-bold text-lg text-[#1C1F2E]">Madar</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-[#1C1F2E]/70 hover:text-[#D95F3B] transition-colors">{t('home')}</Link>
            <Link to="/calculator" className="text-sm text-[#1C1F2E]/70 hover:text-[#D95F3B] transition-colors">{t('calculator')}</Link>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm text-[#1C1F2E]/70 hover:text-[#D95F3B] transition-colors">
              <Globe className="w-4 h-4" />
              {t('language')}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-[#1C1F2E] rounded-lg hover:bg-[#1C1F2E]/90 transition-colors">
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-[#1C1F2E] hover:text-[#D95F3B] transition-colors">
                  {t('login')}
                </Link>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-[#D95F3B] rounded-lg hover:bg-[#D95F3B]/90 transition-colors">
                  {t('getStarted')}
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            {open ? <X className="w-5 h-5 text-[#1C1F2E]" /> : <Menu className="w-5 h-5 text-[#1C1F2E]" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#F7F5F0] border-t border-[#1C1F2E]/5 px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setOpen(false)} className="block text-sm text-[#1C1F2E]/70 py-2">{t('home')}</Link>
          <Link to="/calculator" onClick={() => setOpen(false)} className="block text-sm text-[#1C1F2E]/70 py-2">{t('calculator')}</Link>
          <button onClick={() => { toggleLang(); setOpen(false); }} className="flex items-center gap-1.5 text-sm text-[#1C1F2E]/70 py-2">
            <Globe className="w-4 h-4" />{t('language')}
          </button>
          <div className="pt-2 border-t border-[#1C1F2E]/5 space-y-2">
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-[#1C1F2E] rounded-lg">{t('dashboard')}</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center px-4 py-2 text-sm font-medium text-[#1C1F2E]">{t('login')}</Link>
                <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-[#D95F3B] rounded-lg">{t('getStarted')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}