import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Globe, Loader2 } from 'lucide-react';

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
            {lang === 'ar' ? 'حسّن إيرادات إيجاراتك\nبالذكاء الاصطناعي' : 'Optimize your rental\nrevenue with AI'}
          </h2>
          <p className="text-white/50 text-sm max-w-sm leading-relaxed">
            {lang === 'ar' ? 'انضم لأكثر من 500 مضيف في المملكة العربية السعودية يستخدمون مدار لتعظيم إيراداتهم.' : 'Join 500+ hosts across Saudi Arabia using Madar to maximize their earnings.'}
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

          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E] mb-2">{t('login')}</h1>
          <p className="text-sm text-[#1C1F2E]/50 mb-8">
            {lang === 'ar' ? 'أدخل بياناتك للوصول إلى لوحة التحكم' : 'Enter your credentials to access your dashboard'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

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
            <div>
              <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#1C1F2E]/10 text-[#1C1F2E] placeholder-[#1C1F2E]/30 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B] transition-all text-sm"
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-[#1C1F2E]/30`}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#1C1F2E]/60 cursor-pointer">
                <input type="checkbox" className="rounded border-[#1C1F2E]/20 text-[#D95F3B] focus:ring-[#D95F3B]/20" />
                {t('rememberMe')}
              </label>
              <button type="button" className="text-sm text-[#D95F3B] hover:text-[#D95F3B]/80">{t('forgotPassword')}</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D95F3B] text-white font-medium rounded-xl hover:bg-[#D95F3B]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('login')}
            </button>
          </form>

          <p className="text-center text-sm text-[#1C1F2E]/50 mt-6">
            {t('dontHaveAccount')}{' '}
            <Link to="/login" className="text-[#D95F3B] font-medium hover:text-[#D95F3B]/80">{t('signup')}</Link>
          </p>

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