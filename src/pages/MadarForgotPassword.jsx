import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Globe, Loader2, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-[#0A0B10] flex">
      {/* Left - cinematic branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600596542815-ffed4dedcabe?w=1200&h=1400&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0B10]/80 via-[#0A0B10]/60 to-[#0A0B10]/90" />
        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <span className="font-heading font-bold text-xl text-[#F7F5F0]">Madar</span>
          </Link>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-heading text-4xl font-bold text-[#F7F5F0] mb-4 leading-tight"
            >
              {lang === 'ar' ? 'استعد الوصول' : 'Regain access'}<br />
              <span className="text-gradient-gold">{lang === 'ar' ? 'إلى حسابك' : 'to your account'}</span>
            </motion.h2>
            <p className="text-[#F7F5F0]/50 text-sm max-w-sm leading-relaxed">
              {lang === 'ar' ? 'سنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.' : "We'll send you a link to reset your password."}
            </p>
          </div>
          <div className="text-[#F7F5F0]/30 text-xs">© 2025 Madar</div>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D95F3B] to-[#C8972A] flex items-center justify-center">
                <span className="text-white font-bold text-sm">م</span>
              </div>
              <span className="font-heading font-bold text-[#F7F5F0]">Madar</span>
            </Link>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm text-[#F7F5F0]/50">
              <Globe className="w-4 h-4" />{t('language')}
            </button>
          </div>

          <Link to="/login" className="flex items-center gap-1.5 text-sm text-[#F7F5F0]/50 hover:text-[#C8972A] transition-colors mb-6">
            <BackArrow className="w-4 h-4" />{t('backToLogin')}
          </Link>

          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/10 flex items-center justify-center mb-5 border border-[#D95F3B]/20">
            <Mail className="w-6 h-6 text-[#D95F3B]" />
          </div>

          <h1 className="font-heading text-3xl font-bold text-[#F7F5F0] mb-2">{t('forgotPassword')}</h1>
          <p className="text-sm text-[#F7F5F0]/50 mb-8">{t('forgotDesc')}</p>

          {sent ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm leading-relaxed">
                {t('resetEmailSent')}
              </div>
              <Link to="/login" className="block text-center w-full py-3 bg-white/5 border border-white/10 text-[#F7F5F0] font-medium rounded-xl hover:bg-white/10 transition-all text-sm">
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#F7F5F0]/70 mb-1.5">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] placeholder-[#F7F5F0]/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all text-sm"
                  placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm overflow-hidden"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
                <span className="relative z-10">{t('sendResetLink')}</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </form>
          )}

          <div className="hidden lg:flex items-center justify-center mt-8">
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm text-[#F7F5F0]/40 hover:text-[#C8972A]">
              <Globe className="w-4 h-4" />{t('language')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}