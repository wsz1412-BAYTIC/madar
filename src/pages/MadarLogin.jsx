import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MadarLogin() {
  const { t, lang, toggleLang, isRTL } = useLang();
  const { login, loading } = useMadarAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] flex">
      {/* Left - cinematic branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=1400&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
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
              {lang === 'ar' ? 'حسّن إيرادات إيجاراتك' : 'Optimize your rental'}<br />
              <span className="text-gradient-gold">{lang === 'ar' ? 'بالذكاء الاصطناعي' : 'revenue with AI'}</span>
            </motion.h2>
            <p className="text-[#F7F5F0]/50 text-sm max-w-sm leading-relaxed">
              {lang === 'ar' ? 'انضم لأكثر من 500 مضيف في المملكة العربية السعودية يستخدمون مدار لتعظيم إيراداتهم.' : 'Join 500+ hosts across Saudi Arabia using Madar to maximize their earnings.'}
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

          <h1 className="font-heading text-3xl font-bold text-[#F7F5F0] mb-2">{t('login')}</h1>
          <p className="text-sm text-[#F7F5F0]/50 mb-8">
            {lang === 'ar' ? 'أدخل بياناتك للوصول إلى لوحة التحكم' : 'Enter your credentials to access your dashboard'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

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
            <div>
              <label className="block text-sm font-medium text-[#F7F5F0]/70 mb-1.5">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] placeholder-[#F7F5F0]/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all text-sm"
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-[#F7F5F0]/30`}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#F7F5F0]/60 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#D95F3B] focus:ring-[#D95F3B]/20" />
                {t('rememberMe')}
              </label>
              <Link to="/forgot-password" className="text-sm text-[#C8972A] hover:text-[#D95F3B]">{t('forgotPassword')}</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm overflow-hidden"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
              <span className="relative z-10">{t('login')}</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </form>

          <p className="text-center text-sm text-[#F7F5F0]/50 mt-6">
            {t('dontHaveAccount')}{' '}
            <Link to="/signup" className="text-[#C8972A] font-medium hover:text-[#D95F3B]">{t('signup')}</Link>
          </p>

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