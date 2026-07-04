import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Sun, Moon, Send, Check, Loader2, Bell } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  isValidTelegramUsername,
  normalizeTelegramUsername,
  DEFAULT_NOTIFICATION_PREFS,
} from "@/lib/telegramNotifications";
import { base44 } from "@/api/base44Client";

const APPEARANCE_OPTIONS = [
  {
    value: "system",
    icon: Monitor,
    labelKey: "settings.system",
    descKey: "settings.systemDesc",
  },
  {
    value: "light",
    icon: Sun,
    labelKey: "settings.light",
    descKey: "settings.lightDesc",
  },
  {
    value: "dark",
    icon: Moon,
    labelKey: "settings.dark",
    descKey: "settings.darkDesc",
  },
];

const NOTIFICATION_KEYS = [
  { key: "aiRecommendations", labelKey: "settings.aiRecommendations" },
  { key: "marketNews", labelKey: "settings.marketNews" },
  { key: "billingAlerts", labelKey: "settings.billingAlerts" },
];

export default function Settings() {
  const { t, lang } = useLanguage();
  const { preference, setPreference } = useTheme();
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();

  const [telegramInput, setTelegramInput] = useState("");
  const [telegramTouched, setTelegramTouched] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setTelegramInput(user.telegram_username || "");
      setPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...(user.notification_prefs || {}) });
    }
  }, [user]);

  const telegramValid = !telegramInput.trim() || isValidTelegramUsername(telegramInput);
  const telegramChanged =
    normalizeTelegramUsername(telegramInput) !== (user?.telegram_username || null);

  const handleSaveTelegram = async () => {
    setTelegramTouched(true);
    if (telegramInput.trim() && !telegramValid) return;
    setSaving(true);
    try {
      const normalized = normalizeTelegramUsername(telegramInput);
      await base44.auth.updateMe({
        telegram_username: normalized || null,
        notification_prefs: prefs,
      });
      await checkAuth();
      toast({ title: t("settings.saved") });
    } catch (err) {
      toast({ title: err.message || t("common.error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="pt-32 pb-24 px-[2%] md:px-[4%] max-w-[900px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
          {lang === "ar" ? "الحساب" : "Account"}
        </p>
        <h1 className="font-display text-display-lg font-light mb-16">
          {t("settings.title")}
        </h1>
      </motion.div>

      {/* Appearance */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-20"
      >
        <h2 className="font-display text-display-md font-light mb-3">
          {t("settings.appearance")}
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {t("settings.appearanceDesc")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {APPEARANCE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = preference === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPreference(opt.value)}
                role="radio"
                aria-checked={selected}
                className={`border p-6 text-start transition-all duration-300 rounded-2xl ${
                  selected
                    ? "border-accent bg-accent/5"
                    : "border-border/50 hover:border-foreground/30"
                }`}
              >
                <Icon
                  size={24}
                  className={selected ? "text-accent" : "text-muted-foreground"}
                  strokeWidth={1.5}
                />
                <p className="font-display text-lg font-light mt-4">
                  {t(opt.labelKey)}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {t(opt.descKey)}
                </p>
              </button>
            );
          })}
        </div>
      </motion.section>

      <div className="hairline mb-16" />

      {/* Telegram + Notifications */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Send size={20} className="text-accent" strokeWidth={1.5} />
          <h2 className="font-display text-display-md font-light">
            {t("settings.telegram")}
          </h2>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {t("settings.telegramDesc")}
        </p>

        <div className="max-w-md mb-10">
          <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
            {t("settings.telegramLabel")}
          </label>
          <input
            type="text"
            value={telegramInput}
            onChange={(e) => setTelegramInput(e.target.value)}
            onBlur={() => setTelegramTouched(true)}
            placeholder={t("settings.telegramPlaceholder")}
            dir="ltr"
            className={`w-full bg-transparent border-b py-3 font-body text-sm focus:outline-none transition-colors ${
              telegramTouched && !telegramValid
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-accent"
            }`}
          />
          {telegramTouched && !telegramValid && (
            <p className="font-body text-xs text-destructive mt-2">
              {t("settings.telegramInvalid")}
            </p>
          )}
        </div>

        {/* Notification prefs */}
        <div className="flex items-center gap-3 mb-6">
          <Bell size={20} className="text-accent" strokeWidth={1.5} />
          <h3 className="font-display text-xl font-light">
            {t("settings.notifications")}
          </h3>
        </div>
        <div className="space-y-3 max-w-md">
          {NOTIFICATION_KEYS.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => togglePref(key)}
              className="w-full flex items-center justify-between border border-border/50 px-5 py-4 rounded-xl hover:border-foreground/30 transition-colors"
            >
              <span className="font-body text-sm">{t(labelKey)}</span>
              <span
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  prefs[key] ? "bg-accent" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                    prefs[key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <button
            onClick={handleSaveTelegram}
            disabled={saving || (telegramTouched && !telegramValid)}
            className="ghost-btn text-xs flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t("settings.saving")}
              </>
            ) : (
              <>
                <Check size={14} />
                {t("settings.save")}
              </>
            )}
          </button>
        </div>
      </motion.section>
    </div>
  );
}