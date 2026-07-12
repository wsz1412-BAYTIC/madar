import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { isValidTelegramUsername, normalizeTelegramUsername } from '@/lib/telegramNotifications';
import { User, Globe, Save, Loader2, Sun, Moon, Monitor, Send, Bell } from 'lucide-react';
import { FadeIn } from '@/components/madar/Motion';
import TelegramLinkCard from '@/components/settings/TelegramLinkCard';

const APPEARANCE_OPTIONS = [
  { val: 'system', icon: Monitor, en: 'System', ar: 'النظام' },
  { val: 'light', icon: Sun, en: 'Light', ar: 'فاتح' },
  { val: 'dark', icon: Moon, en: 'Dark', ar: 'داكن' },
];

const NOTIFICATION_PREFS = [
  { key: 'aiRecommendations', en: 'New AI price recommendations', ar: 'توصيات الأسعار الجديدة بالذكاء الاصطناعي' },
  { key: 'marketNews', en: 'Important market updates', ar: 'تحديثات السوق المهمة' },
  { key: 'billingAlerts', en: 'Billing & account alerts', ar: 'تنبيهات الفوترة والحساب' },
];

export default function MadarSettings() {
  const { t, lang, setLang } = useLang();
  const { user, checkUserAuth } = useAuth();
  const { preference, setPreference } = useTheme();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '+966',
    language: lang,
    telegram: user?.telegram_username || '',
    prefs: {
      aiRecommendations: user?.notification_prefs?.aiRecommendations ?? true,
      marketNews: user?.notification_prefs?.marketNews ?? true,
      billingAlerts: user?.notification_prefs?.billingAlerts ?? true,
    },
  });
  const [saving, setSaving] = useState(false);
  const [telegramError, setTelegramError] = useState('');

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const updatePref = (key) => setForm(prev => ({ ...prev, prefs: { ...prev.prefs, [key]: !prev.prefs[key] } }));

  const handleSave = async () => {
    setTelegramError('');
    if (form.telegram && !isValidTelegramUsername(form.telegram)) {
      setTelegramError(lang === 'ar'
        ? 'اسم مستخدم تيليجرام غير صالح — مثال: @username (5–32 حرفًا أو رقمًا أو _)'
        : 'Invalid Telegram username — e.g. @username (5–32 letters, digits or _)');
      return;
    }
    setSaving(true);
    try {
      // Persist the editable profile fields to the Base44 user. Language and
      // appearance are local UI preferences and apply immediately.
      await base44.auth.updateMe({
        full_name: form.name,
        phone: form.phone,
        telegram_username: form.telegram ? normalizeTelegramUsername(form.telegram) : null,
        notification_prefs: form.prefs,
      });
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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 transition-all";
  const readonlyInputClass = inputClass + " opacity-60 cursor-not-allowed";

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeIn>
        <h1 className="font-heading text-3xl font-bold text-foreground">{t('settings')}</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D95F3B]/15 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/15">
              <User className="w-4 h-4 text-[#D95F3B]" />
            </div>
            <h2 className="font-heading font-semibold text-foreground">{t('profileSettings')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-foreground/60 mb-1.5">{t('fullName')}</label>
              <input id="profile-name" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-foreground/60 mb-1.5">{t('email')}</label>
              {/* Email is the account identity and is not editable here. */}
              <input id="profile-email" value={user?.email || ''} type="email" className={readonlyInputClass} readOnly disabled />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-foreground/60 mb-1.5">{t('phone')}</label>
              <input id="profile-phone" value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" dir="ltr" className={inputClass} />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Appearance */}
      <FadeIn delay={0.15}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D95F3B]/15 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/15">
              <Sun className="w-4 h-4 text-[#D95F3B]" />
            </div>
            <h2 className="font-heading font-semibold text-foreground">{lang === 'ar' ? 'المظهر' : 'Appearance'}</h2>
          </div>
          <p className="text-xs text-foreground/45 mb-5">
            {lang === 'ar'
              ? 'يُطبق فورًا على جميع الصفحات ويُحفظ لهذا المتصفح.'
              : 'Applies instantly across all pages and is remembered on this browser.'}
          </p>
          <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={lang === 'ar' ? 'المظهر' : 'Appearance'}>
            {APPEARANCE_OPTIONS.map(opt => (
              <button
                key={opt.val}
                role="radio"
                aria-checked={preference === opt.val}
                onClick={() => setPreference(opt.val)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl text-sm font-medium border transition-all ${
                  preference === opt.val
                    ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white border-transparent shadow-md'
                    : 'bg-foreground/[0.04] text-foreground/60 border-foreground/[0.08] hover:border-foreground/20 hover:text-foreground'
                }`}
              >
                <opt.icon className="w-5 h-5" />
                {lang === 'ar' ? opt.ar : opt.en}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8972A]/15 to-[#D95F3B]/10 flex items-center justify-center border border-[#C8972A]/15">
              <Globe className="w-4 h-4 text-[#C8972A]" />
            </div>
            <h2 className="font-heading font-semibold text-foreground">{t('languagePref')}</h2>
          </div>
          <div className="flex gap-3">
            {[{ val: 'en', label: 'English' }, { val: 'ar', label: 'العربية' }].map(opt => (
              <button key={opt.val} onClick={() => update('language', opt.val)} className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${form.language === opt.val ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white border-transparent' : 'bg-foreground/[0.04] text-foreground/50 border-foreground/[0.08] hover:border-foreground/20'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Secure Telegram account linking (PR 1B). Placed directly above the
          Notifications card; the optional username field there is unchanged. */}
      <FadeIn delay={0.22}>
        <TelegramLinkCard />
      </FadeIn>

      {/* Telegram + notification preferences. Preferences are stored on the
          user profile now; actual Telegram delivery is a pending integration
          (see docs/TELEGRAM_NOTIFICATIONS.md). */}
      <FadeIn delay={0.25}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8972A]/15 to-[#D95F3B]/10 flex items-center justify-center border border-[#C8972A]/15">
              <Bell className="w-4 h-4 text-[#C8972A]" />
            </div>
            <h2 className="font-heading font-semibold text-foreground">{lang === 'ar' ? 'التنبيهات' : 'Notifications'}</h2>
          </div>
          <p className="text-xs text-foreground/45 mb-5">
            {lang === 'ar'
              ? 'تنبيهات مهمة فقط — لا رسائل ترويجية. إرسال تيليجرام قيد التجهيز وسيتم تفعيله قريبًا.'
              : 'Important alerts only — no promotions. Telegram delivery is being set up and will activate soon.'}
          </p>

          <div className="mb-6">
            <label htmlFor="telegram" className="flex items-center gap-1.5 text-sm font-medium text-foreground/60 mb-1.5">
              <Send className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'اسم المستخدم في تيليجرام (اختياري)' : 'Telegram username (optional)'}
            </label>
            <input
              id="telegram"
              value={form.telegram}
              onChange={e => { update('telegram', e.target.value); setTelegramError(''); }}
              placeholder="@username"
              dir="ltr"
              className={inputClass + (telegramError ? ' border-danger/60 ring-2 ring-danger/15' : '')}
            />
            {telegramError ? (
              <p className="text-xs text-danger mt-1.5">{telegramError}</p>
            ) : (
              <p className="text-xs text-foreground/40 mt-1.5">
                {lang === 'ar'
                  ? 'يُستخدم فقط للتنبيهات المهمة مثل توصيات الأسعار الجديدة وتحديثات السوق الكبيرة.'
                  : 'Used only for important alerts like new AI recommendations and major market updates.'}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {NOTIFICATION_PREFS.map(pref => (
              <label key={pref.key} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-foreground/70">{lang === 'ar' ? pref.ar : pref.en}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.prefs[pref.key]}
                  onClick={() => updatePref(pref.key)}
                  className={`w-11 h-6 rounded-full relative transition-all ${form.prefs[pref.key] ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A]' : 'bg-foreground/[0.12]'}`}
                >
                  <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${form.prefs[pref.key] ? 'start-[22px]' : 'start-[3px]'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <button onClick={handleSave} disabled={saving} className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all text-sm overflow-hidden disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 relative z-10 animate-spin" /> : <Save className="w-4 h-4 relative z-10" />}
          <span className="relative z-10">{t('saveChanges')}</span>
          <div className="absolute inset-0 bg-foreground/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
      </FadeIn>
    </div>
  );
}
