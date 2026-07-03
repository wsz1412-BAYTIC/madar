import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useCookieConsent } from '@/contexts/CookieContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings } from 'lucide-react';

export default function CookieConsentBanner() {
  const { lang, isRTL } = useLang();
  const { showBanner, acceptAll, rejectNonEssential, updateConsent } = useCookieConsent();
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    performance: false,
    preferences: false,
    marketing: false,
  });

  const handleCustom = () => {
    updateConsent(preferences);
    setShowCustomize(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Banner Container */}
        <div className="relative mx-auto max-w-6xl m-4">
          {/* Main Banner */}
          {!showCustomize && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-foreground/[0.08] rounded-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    <Cookie className="w-6 h-6 text-[#C8972A] flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="font-heading font-bold text-white text-lg mb-2">
                        {lang === 'ar' ? 'إعدادات ملفات تعريف الارتباط' : 'Cookie Preferences'}
                      </h2>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {lang === 'ar'
                          ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك إدارة تفضيلاتك أدناه.'
                          : 'We use cookies to improve your experience. Manage your preferences below.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="/cookies"
                    className="text-white/40 hover:text-white/60 transition-colors flex-shrink-0 text-xs font-medium underline whitespace-nowrap"
                  >
                    {lang === 'ar' ? 'اقرأ المزيد' : 'Learn More'}
                  </a>
                </div>

                {/* Quick Buttons */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <button
                    onClick={acceptAll}
                    className="px-4 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all text-sm"
                  >
                    {lang === 'ar' ? 'قبول الكل' : 'Accept All'}
                  </button>
                  <button
                    onClick={rejectNonEssential}
                    className="px-4 py-3 bg-foreground/[0.04] text-white font-medium rounded-xl border border-foreground/[0.08] hover:bg-foreground/10 transition-all text-sm"
                  >
                    {lang === 'ar' ? 'رفض غير الأساسي' : 'Reject Non-Essential'}
                  </button>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="px-4 py-3 bg-foreground/[0.04] text-white font-medium rounded-xl border border-foreground/[0.08] hover:bg-foreground/10 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {lang === 'ar' ? 'تخصيص' : 'Customize'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customize Panel */}
          {showCustomize && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-foreground/[0.08] rounded-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-white text-lg">
                    {lang === 'ar' ? 'تخصيص تفضيلات ملفات تعريف الارتباط' : 'Customize Cookie Preferences'}
                  </h2>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="text-white/40 hover:text-white/60 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cookie Options */}
                <div className="space-y-4 mb-8">
                  {/* Essential */}
                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {lang === 'ar' ? 'ملفات تعريف الارتباط الأساسية' : 'Essential Cookies'}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                          {lang === 'ar' ? 'مطلوبة للأمان وتسجيل الدخول' : 'Required for security and login'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-5 h-5 accent-[#D95F3B]"
                      />
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {lang === 'ar' ? 'ملفات تعريف الارتباط الخاصة بالأداء' : 'Performance Cookies'}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                          {lang === 'ar' ? 'تحسين الأداء والتحليلات' : 'Analytics and performance improvement'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.performance}
                        onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                        className="w-5 h-5 accent-[#D95F3B]"
                      />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {lang === 'ar' ? 'ملفات تعريف الارتباط الخاصة بالتفضيلات' : 'Preference Cookies'}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                          {lang === 'ar' ? 'تذكر اختياراتك وإعداداتك' : 'Remember your choices and settings'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.preferences}
                        onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                        className="w-5 h-5 accent-[#D95F3B]"
                      />
                    </div>
                  </div>

                  {/* Marketing */}
                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {lang === 'ar' ? 'ملفات تعريف الارتباط التسويقية' : 'Marketing Cookies'}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                          {lang === 'ar' ? 'إعلانات مستهدفة ومحتوى شخصي' : 'Targeted ads and personalized content'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="w-5 h-5 accent-[#D95F3B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="px-4 py-3 bg-foreground/[0.04] text-white font-medium rounded-xl border border-foreground/[0.08] hover:bg-foreground/10 transition-all"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleCustom}
                    className="px-4 py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all"
                  >
                    {lang === 'ar' ? 'حفظ التفضيلات' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}