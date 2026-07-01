import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { api, setToken, setUser } from '@/lib/api';
import { Eye, EyeOff, Globe, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-[#0A0B10] flex">
      {/* Left - cinematic branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=1400&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
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
              className="font-heading text-4xl font-bold text-[#F7F5F0] mb-6 leading-tight"
            >
              {lang === 'ar' ? 'انضم لمئات المضيفين' : 'Join hundreds of hosts'}<br />
              <span className="text-gradient-gold">{lang === 'ar' ? 'الذين يثقون بمدار' : 'who trust Madar'}</span>
            </motion.h2>
            <ul className="space-y-3">
              {(lang === 'ar'
                ? ['تسعير ذكي بالذكاء الاصطناعي', 'مزامنة متعددة المنصات', 'توقعات الإيرادات', 'ذكاء السوق المحلي']
                : ['AI-powered dynamic pricing', 'Multi-platform sync', 'Revenue forecasting', 'Local market intelligence']
              ).map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-[#F7F5F0]/60 text-sm"
                >
                  <Check className="w-4 h-4 text-[#D95F3B]" />{f}
                </motion.li>
              ))}
            </ul>
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

          <h1 className="font-heading text-3xl font-bold text-[#F7F5F0] mb-2">{t('createAccount')}</h1>
          <p className="text-sm text-[#F7F5F0]/50 mb-8">{t('signupDesc')}</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#F7F5F0]/70 mb-1.5">{t('fullName')}</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] placeholder-[#F7F5F0]/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all text-sm"
                placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F7F5F0]/70 mb-1.5">{t('email')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
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
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] placeholder-[#F7F5F0]/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all text-sm"
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-[#F7F5F0]/30`}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F7F5F0]/70 mb-1.5">{t('confirmPassword')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] placeholder-[#F7F5F0]/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all text-sm"
                placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm overflow-hidden"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
              <span className="relative z-10">{t('createAccount')}</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </form>

          <p className="text-center text-sm text-[#F7F5F0]/50 mt-6">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-[#C8972A] font-medium hover:text-[#D95F3B]">{t('login')}</Link>
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