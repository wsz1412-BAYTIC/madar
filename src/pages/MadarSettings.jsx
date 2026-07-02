import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { User, Globe, Save, Loader2 } from 'lucide-react';
import { FadeIn } from '@/components/madar/Motion';

export default function MadarSettings() {
  const { t, lang, setLang } = useLang();
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '+966',
    language: lang,
  });
  const [saving, setSaving] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist the editable profile fields to the Base44 user. Language is a
      // local UI preference and is applied immediately.
      await base44.auth.updateMe({ full_name: form.name, phone: form.phone });
      setLang(form.language);
      // Refresh the session user so the rest of the app reflects the change.
      if (checkUserAuth) await checkUserAuth();
      toast({ description: lang === 'ar' ? 'تم حفظ التغييرات' : 'Changes saved' });
    } catch (err) {
      toast({
        variant: 'destructive',
        description: (lang === 'ar' ? 'تعذر حفظ التغييرات' : 'Failed to save changes') + (err?.message ? `: ${err.message}` : ''),
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F7F5F0] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all";
  const readonlyInputClass = inputClass + " opacity-60 cursor-not-allowed";

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
              <label htmlFor="profile-name" className="block text-sm font-medium text-[#F7F5F0]/60 mb-1.5">{t('fullName')}</label>
              <input id="profile-name" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-[#F7F5F0]/60 mb-1.5">{t('email')}</label>
              {/* Email is the account identity and is not editable here. */}
              <input id="profile-email" value={user?.email || ''} type="email" className={readonlyInputClass} readOnly disabled />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-[#F7F5F0]/60 mb-1.5">{t('phone')}</label>
              <input id="profile-phone" value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" dir="ltr" className={inputClass} />
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

      {/* Notification preferences intentionally removed until they have a real
          persistence layer — do not display non-functional settings. */}

      <FadeIn delay={0.3}>
        <button onClick={handleSave} disabled={saving} className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all text-sm overflow-hidden disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 relative z-10 animate-spin" /> : <Save className="w-4 h-4 relative z-10" />}
          <span className="relative z-10">{t('saveChanges')}</span>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
      </FadeIn>
    </div>
  );
}
