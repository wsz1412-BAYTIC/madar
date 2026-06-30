import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { api, setToken, setUser } from '@/lib/api';
import { Eye, EyeOff, Globe, Loader2, Check } from 'lucide-react';

export default function MadarSignup() {
  const { t, lang, toggleLang, isRTL } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError(t('passwordsMatch'));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      setToken(res.access_token || res.token);
      setUser(res.user || { full_name: form.full_name, email: form.email });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
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
            {lang === 'ar' ? 'انضم لمئات المضيفين\nالذين يثقون بمدار' : 'Join hundreds of hosts\nwho trust Madar'}
          </h2>
          <ul className="space-y-3">
            {(lang === 'ar'
              ? ['تسعير ذكي بالذكاء الاصطناعي', 'مزامنة متعددة المنصات', 'توقعات الإيرادات', 'ذكاء السوق المحلي']
              : ['AI-powered dynamic pricing', 'Multi-platform sync', 'Revenue forecasting', 'Local market intelligence']
            ).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#D95F3B]" />{f}
              </li>
            ))}
          </ul>
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

          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E] mb-2">{t('createAccount')}</h1>
          <p className="text-sm text-[#1C1F2E]/50 mb-8">{t('signupDesc')}</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('fullName')}</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#1C1F2E]/10 text-[#1C1F2E] placeholder-[#1C1F2E]/30 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B] transition-all text-sm"
                placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('email')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
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
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#1C1F2E]/10 text-[#1C1F2E] placeholder-[#1C1F2E]/30 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B] transition-all text-sm"
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-[#1C1F2E]/30`}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('confirmPassword')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#1C1F2E]/10 text-[#1C1F2E] placeholder-[#1C1F2E]/30 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B] transition-all text-sm"
                placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D95F3B] text-white font-medium rounded-xl hover:bg-[#D95F3B]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('createAccount')}
            </button>
          </form>

          <p className="text-center text-sm text-[#1C1F2E]/50 mt-6">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-[#D95F3B] font-medium hover:text-[#D95F3B]/80">{t('login')}</Link>
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