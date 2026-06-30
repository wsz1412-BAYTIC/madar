import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Globe, Loader2, Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export default function MadarForgotPassword() {
  const { t, lang, toggleLang, isRTL } = useLang();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch {
      // Always show success to avoid leaking whether email exists
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1C1F2E] to-[#2a2d3e] p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
            <span className="text-white font-bold text-lg">م</span>
          </div>
          <span className="font-heading font-bold text-xl text-white">Madar</span>
        </Link>
        <div>
          <h2 className="font-heading text-3xl font-bold text-white mb-4 leading-tight">
            {lang === 'ar' ? 'استعد الوصول\nإلى حسابك' : 'Regain access\nto your account'}
          </h2>
          <p className="text-white/50 text-sm max-w-sm leading-relaxed">
            {lang === 'ar' ? 'سنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.' : 'We\'ll send you a link to reset your password.'}
          </p>
        </div>
        <div className="text-white/30 text-xs">© 2025 Madar</div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
                <span className="text-white font-bold text-sm">م</span>
              </div>
              <span className="font-heading font-bold text-[#1C1F2E]">Madar</span>
            </Link>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm text-[#1C1F2E]/50">
              <Globe className="w-4 h-4" />{t('language')}
            </button>
          </div>

          <Link to="/login" className="flex items-center gap-1.5 text-sm text-[#1C1F2E]/50 hover:text-[#D95F3B] transition-colors mb-6">
            <BackArrow className="w-4 h-4" />{t('backToLogin')}
          </Link>

          <div className="w-12 h-12 rounded-xl bg-[#D95F3B]/10 flex items-center justify-center mb-5">
            <Mail className="w-6 h-6 text-[#D95F3B]" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E] mb-2">{t('forgotPassword')}</h1>
          <p className="text-sm text-[#1C1F2E]/50 mb-8">{t('forgotDesc')}</p>

          {sent ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm leading-relaxed">
                {t('resetEmailSent')}
              </div>
              <Link to="/login" className="block text-center w-full py-3 bg-[#1C1F2E] text-white font-medium rounded-xl hover:bg-[#1C1F2E]/90 transition-all text-sm">
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#1C1F2E]/10 text-[#1C1F2E] placeholder-[#1C1F2E]/30 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B] transition-all text-sm"
                  placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D95F3B] text-white font-medium rounded-xl hover:bg-[#D95F3B]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('sendResetLink')}
              </button>
            </form>
          )}

          <div className="hidden lg:flex items-center justify-center mt-8">
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm text-[#1C1F2E]/40 hover:text-[#D95F3B]">
              <Globe className="w-4 h-4" />{t('language')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}