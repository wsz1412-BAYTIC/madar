import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Bell, Mail, MessageCircle, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationPreferences({ onSave }) {
  const { lang } = useLang();
  const { theme } = useTheme();

  const [prefs, setPrefs] = useState({
    dashboard: true,
    email: true,
    whatsapp: false,
    alertThreshold: 0.6,
    groupAlerts: true,
    alertFrequency: 'daily', // daily, weekly, immediately
  });

  const [saved, setSaved] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);

  const handleSave = () => {
    onSave?.(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const bgCard = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-[#F2EFE8] border border-[#0A0B10]/10';

  const bgToggle = theme === 'dark'
    ? 'bg-white/[0.04]'
    : 'bg-[#0A0B10]/5';

  return (
    <div className={`${bgCard} rounded-xl p-6 space-y-6`}>
      <h3 className={`font-heading font-bold text-lg ${
        theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
      }`}>
        {lang === 'ar' ? 'تفضيلات الإخطارات' : 'Notification Preferences'}
      </h3>

      {/* Alert Threshold */}
      <div>
        <label className={`text-sm font-medium mb-3 block ${
          theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
        }`}>
          {lang === 'ar' ? 'حد التنبيه' : 'Alert Threshold'}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0.2"
            max="0.9"
            step="0.1"
            value={prefs.alertThreshold}
            onChange={(e) => setPrefs({ ...prefs, alertThreshold: parseFloat(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm font-bold text-[#D95F3B] min-w-fit">
            {Math.round(prefs.alertThreshold * 100)}%
          </span>
        </div>
        <p className={`text-xs mt-2 ${
          theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
        }`}>
          {lang === 'ar'
            ? 'سيتم إرسال التنبيهات إذا كان الاشغال المتوقع أقل من هذه النسبة'
            : 'Alerts triggered when forecast falls below this percentage'}
        </p>
      </div>

      {/* Notification Channels */}
      <div>
        <label className={`text-sm font-medium mb-4 block ${
          theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
        }`}>
          {lang === 'ar' ? 'قنوات الإخطار' : 'Notification Channels'}
        </label>
        <div className="space-y-3">
          {/* Dashboard */}
          <div className={`p-4 rounded-lg ${bgToggle} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#D95F3B]" />
              <div>
                <p className={`font-medium text-sm ${
                  theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                }`}>{lang === 'ar' ? 'لوحة المعلومات' : 'Dashboard'}</p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
                }`}>{lang === 'ar' ? 'إخطارات مدمجة' : 'In-app notifications'}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.dashboard}
                onChange={(e) => setPrefs({ ...prefs, dashboard: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D95F3B]/20 rounded-full peer ${
                prefs.dashboard
                  ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A]'
                  : theme === 'dark'
                    ? 'bg-white/[0.1]'
                    : 'bg-[#0A0B10]/10'
              }`} />
              <span className={`ml-3 text-xs font-medium ${
                prefs.dashboard
                  ? 'text-[#D95F3B]'
                  : theme === 'dark'
                    ? 'text-[#F7F5F0]/50'
                    : 'text-[#0A0B10]/50'
              }`}>
                {prefs.dashboard ? 'On' : 'Off'}
              </span>
            </label>
          </div>

          {/* Email */}
          <div className={`p-4 rounded-lg ${bgToggle} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#C8972A]" />
              <div>
                <p className={`font-medium text-sm ${
                  theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                }`}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
                }`}>admin@baytic.app</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.email}
                onChange={(e) => setPrefs({ ...prefs, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#C8972A]/20 rounded-full peer ${
                prefs.email
                  ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A]'
                  : theme === 'dark'
                    ? 'bg-white/[0.1]'
                    : 'bg-[#0A0B10]/10'
              }`} />
              <span className={`ml-3 text-xs font-medium ${
                prefs.email
                  ? 'text-[#D95F3B]'
                  : theme === 'dark'
                    ? 'text-[#F7F5F0]/50'
                    : 'text-[#0A0B10]/50'
              }`}>
                {prefs.email ? 'On' : 'Off'}
              </span>
            </label>
          </div>

          {/* WhatsApp - Requires Explicit Consent */}
          <div className={`p-4 rounded-lg border-l-4 border-[#FFB800] ${bgToggle}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#FFB800]" />
                <div>
                  <p className={`font-medium text-sm ${
                    theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
                  }`}>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
                  }`}>{lang === 'ar' ? 'يتطلب موافقة صريحة' : 'Requires explicit consent'}</p>
                </div>
              </div>
            </div>

            {!whatsappConsent ? (
              <button
                onClick={() => setWhatsappConsent(true)}
                className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20c359] transition-colors"
              >
                {lang === 'ar' ? 'تفعيل إخطارات واتساب' : 'Enable WhatsApp Notifications'}
              </button>
            ) : (
              <div className="space-y-2">
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-[#F7F5F0]/70' : 'text-[#0A0B10]/70'
                }`}>
                  {lang === 'ar'
                    ? 'أنت موافق على استقبال إخطارات على +966 53 810 0119'
                    : 'You\'ve consented to receive WhatsApp messages on +966 53 810 0119'}
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.whatsapp}
                    onChange={(e) => setPrefs({ ...prefs, whatsapp: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#25D366]/20 rounded-full peer ${
                    prefs.whatsapp
                      ? 'bg-[#25D366]'
                      : theme === 'dark'
                        ? 'bg-white/[0.1]'
                        : 'bg-[#0A0B10]/10'
                  }`} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Frequency */}
      <div>
        <label className={`text-sm font-medium mb-3 block ${
          theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
        }`}>
          {lang === 'ar' ? 'تكرار الإخطارات' : 'Alert Frequency'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['immediately', 'daily', 'weekly'].map(freq => (
            <button
              key={freq}
              onClick={() => setPrefs({ ...prefs, alertFrequency: freq })}
              className={`py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                prefs.alertFrequency === freq
                  ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white'
                  : theme === 'dark'
                    ? 'bg-white/[0.04] text-[#F7F5F0]/70 hover:bg-white/10'
                    : 'bg-[#0A0B10]/5 text-[#0A0B10]/70 hover:bg-[#0A0B10]/10'
              }`}
            >
              {freq === 'immediately' ? (lang === 'ar' ? 'فوري' : 'Immediately') :
                freq === 'daily' ? (lang === 'ar' ? 'يومي' : 'Daily') : (lang === 'ar' ? 'أسبوعي' : 'Weekly')}
            </button>
          ))}
        </div>
      </div>

      {/* Group Alerts */}
      <div className={`p-4 rounded-lg ${bgToggle} flex items-center justify-between`}>
        <div>
          <p className={`font-medium text-sm ${
            theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
          }`}>{lang === 'ar' ? 'تجميع التنبيهات' : 'Group Related Alerts'}</p>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
          }`}>{lang === 'ar' ? 'دمج التنبيهات ذات الصلة لتقليل الضوضاء' : 'Combine related alerts to reduce noise'}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.groupAlerts}
            onChange={(e) => setPrefs({ ...prefs, groupAlerts: e.target.checked })}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D95F3B]/20 rounded-full peer ${
            prefs.groupAlerts
              ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A]'
              : theme === 'dark'
                ? 'bg-white/[0.1]'
                : 'bg-[#0A0B10]/10'
          }`} />
        </label>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
      >
        <Save className="w-4 h-4" />
        {saved ? (lang === 'ar' ? 'تم الحفظ' : 'Saved!') : (lang === 'ar' ? 'حفظ' : 'Save Preferences')}
      </motion.button>
    </div>
  );
}