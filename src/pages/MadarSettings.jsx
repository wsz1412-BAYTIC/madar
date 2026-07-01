import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { User, Bell, Globe, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';

export default function MadarSettings() {
  const { t, lang, setLang } = useLang();
  const { user } = useMadarAuth();
  const [form, setForm] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '+966',
    language: lang,
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setLang(form.language);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F7F5F0] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all";

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeIn>
        <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('settings')}</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D95F3B]/15 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/15">
              <User className="w-4 h-4 text-[#D95F3B]" />
            </div>
            <h2 className="font-heading font-semibold text-[#F7F5F0]">{t('profileSettings')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F7F5F0]/60 mb-1.5">{t('fullName')}</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F7F5F0]/60 mb-1.5">{t('email')}</label>
              <input value={form.email} onChange={e => update('email', e.target.value)} type="email" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F7F5F0]/60 mb-1.5">{t('phone')}</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" dir="ltr" className={inputClass} />
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8972A]/15 to-[#D95F3B]/10 flex items-center justify-center border border-[#C8972A]/15">
              <Globe className="w-4 h-4 text-[#C8972A]" />
            </div>
            <h2 className="font-heading font-semibold text-[#F7F5F0]">{t('languagePref')}</h2>
          </div>
          <div className="flex gap-3">
            {[{ val: 'en', label: 'English' }, { val: 'ar', label: 'العربية' }].map(opt => (
              <button key={opt.val} onClick={() => update('language', opt.val)} className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${form.language === opt.val ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white border-transparent' : 'bg-white/[0.04] text-[#F7F5F0]/50 border-white/[0.08] hover:border-white/20'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.06]">
              <Bell className="w-4 h-4 text-[#F7F5F0]/70" />
            </div>
            <h2 className="font-heading font-semibold text-[#F7F5F0]">{t('notifications')}</h2>
          </div>
          <div className="space-y-4">
            {['emailNotif', 'smsNotif', 'pushNotif'].map(key => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm text-[#F7F5F0]/60">{t(key)}</span>
                <button onClick={() => update(key, !form[key])} className={`w-11 h-6 rounded-full relative transition-all ${form[key] ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A]' : 'bg-white/[0.08]'}`}>
                  <motion.div animate={{ x: form[key] ? 22 : 3 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.4}>
        <button onClick={handleSave} className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all text-sm overflow-hidden">
          <Save className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{t('saveChanges')}</span>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
      </FadeIn>
    </div>
  );
}