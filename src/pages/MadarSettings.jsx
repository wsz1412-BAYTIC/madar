import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useMadarAuth } from '@/contexts/AuthContext';
import { User, Bell, Globe, Save } from 'lucide-react';

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

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('settings')}</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#D95F3B]/10 flex items-center justify-center">
            <User className="w-4 h-4 text-[#D95F3B]" />
          </div>
          <h2 className="font-heading font-semibold text-[#1C1F2E]">{t('profileSettings')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('fullName')}</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#F7F5F0] border border-[#1C1F2E]/5 text-sm text-[#1C1F2E] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('email')}</label>
            <input value={form.email} onChange={e => update('email', e.target.value)} type="email" className="w-full px-4 py-3 rounded-xl bg-[#F7F5F0] border border-[#1C1F2E]/5 text-sm text-[#1C1F2E] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1F2E]/70 mb-1.5">{t('phone')}</label>
            <input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" dir="ltr" className="w-full px-4 py-3 rounded-xl bg-[#F7F5F0] border border-[#1C1F2E]/5 text-sm text-[#1C1F2E] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]" />
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#C8972A]/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#C8972A]" />
          </div>
          <h2 className="font-heading font-semibold text-[#1C1F2E]">{t('languagePref')}</h2>
        </div>
        <div className="flex gap-3">
          {[{ val: 'en', label: 'English' }, { val: 'ar', label: 'العربية' }].map(opt => (
            <button key={opt.val} onClick={() => update('language', opt.val)} className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${form.language === opt.val ? 'bg-[#D95F3B] text-white border-[#D95F3B]' : 'bg-[#F7F5F0] text-[#1C1F2E]/60 border-[#1C1F2E]/5 hover:border-[#D95F3B]/30'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#1C1F2E]/5 flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#1C1F2E]" />
          </div>
          <h2 className="font-heading font-semibold text-[#1C1F2E]">{t('notifications')}</h2>
        </div>
        <div className="space-y-4">
          {['emailNotif', 'smsNotif', 'pushNotif'].map(key => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-[#1C1F2E]/70">{t(key)}</span>
              <button onClick={() => update(key, !form[key])} className={`w-11 h-6 rounded-full relative transition-all ${form[key] ? 'bg-[#D95F3B]' : 'bg-[#1C1F2E]/10'}`}>
                <div className={`w-4.5 h-4.5 absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${form[key] ? 'left-[22px]' : 'left-[3px]'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-[#D95F3B] text-white font-medium rounded-xl hover:bg-[#D95F3B]/90 transition-all text-sm">
        <Save className="w-4 h-4" />{t('saveChanges')}
      </button>
    </div>
  );
}