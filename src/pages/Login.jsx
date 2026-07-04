import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import {
  isValidTelegramUsername,
  normalizeTelegramUsername,
} from "@/lib/telegramNotifications";
import {
  validateRequiredConsents,
  buildConsentRecords,
} from "@/lib/consentManagement";
import { MadarFullLogo } from "@/components/Logo";
import { Send, ArrowRight, Check, Sparkles } from "lucide-react";

const STORAGE_KEY = "madar_pending_telegram";
const CONSENT_STORAGE_KEY = "madar_pending_consents";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL, lang } = useLanguage();
  const params = new URLSearchParams(location.search);
  const isSignup = params.get("mode") === "signup";
  const nextUrl = params.get("next") || "/dashboard";

  const [telegramInput, setTelegramInput] = useState("");
  const [touched, setTouched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    service_notifications: false,
  });

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        const storedConsents = sessionStorage.getItem(CONSENT_STORAGE_KEY);
        if (stored || storedConsents) {
          setPersisting(true);
          try {
            if (stored && isValidTelegramUsername(stored)) {
              await base44.auth.updateMe({
                telegram_username: normalizeTelegramUsername(stored),
              });
            }
          } catch {
            /* user can set it later in Settings */
          }
          try {
            if (storedConsents) {
              const parsed = JSON.parse(storedConsents);
              const user = await base44.auth.me();
              if (user?.id) {
                const records = buildConsentRecords(user.id, parsed, {
                  source: "signup",
                  userAgent: navigator.userAgent,
                });
                if (records.length > 0) {
                  await base44.entities.ConsentRecord.bulkCreate(records);
                }
              }
            }
          } catch {
            /* consent persistence failure should never block signup */
          }
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(CONSENT_STORAGE_KEY);
          setPersisting(false);
        }
        navigate(nextUrl, { replace: true });
      } else {
        if (isSignup) {
          setShowForm(true);
        } else {
          base44.auth.redirectToLogin(nextUrl);
        }
      }
    });
  }, [navigate, nextUrl, isSignup]);

  const telegramValid =
    !telegramInput.trim() || isValidTelegramUsername(telegramInput);
  const normalized = telegramInput.trim()
    ? normalizeTelegramUsername(telegramInput)
    : null;

  const consentValidation = validateRequiredConsents(consents, "signup");

  const handleContinue = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidTelegramUsername(telegramInput)) return;
    if (!consentValidation.valid) return;
    sessionStorage.setItem(STORAGE_KEY, normalizeTelegramUsername(telegramInput));
    sessionStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consents));
    base44.auth.redirectToLogin(
      window.location.pathname + window.location.search
    );
  };

  if (persisting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        <p className="font-body text-xs text-muted-foreground">
          {t("signup.preparing")}
        </p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-[4%] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-10">
          <MadarFullLogo variant="dark" className="w-[140px] h-auto" />
        </div>

        <h1 className="font-display text-display-md font-light text-center mb-3">
          {t("signup.title")}
        </h1>
        <p className="font-body text-sm text-muted-foreground text-center mb-10 leading-relaxed">
          {t("signup.subtitle")}
        </p>

        <form onSubmit={handleContinue} className="space-y-6">
          <div>
            <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
              {t("signup.telegramLabel")}
            </label>
            <div className="relative">
              <Send
                size={16}
                className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={telegramInput}
                onChange={(e) => setTelegramInput(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={t("signup.telegramPlaceholder")}
                dir="ltr"
                autoFocus
                className={`w-full bg-transparent border-b py-3 ps-9 pe-3 font-body text-sm focus:outline-none transition-colors ${
                  touched && !telegramValid
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-accent"
                }`}
              />
            </div>
            {touched && !telegramValid && (
              <p className="font-body text-xs text-destructive mt-2">
                {t("signup.telegramInvalid")}
              </p>
            )}
            {normalized && telegramValid && (
              <p className="font-body text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Check size={12} className="text-accent" strokeWidth={2} />
                {t("signup.verifiedAs")}{" "}
                <span dir="ltr" className="font-medium text-foreground">
                  {normalized}
                </span>
              </p>
            )}
          </div>

          <div className="p-4 border border-border/50 rounded-2xl bg-muted/30">
            <p className="font-body text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
              <Sparkles
                size={14}
                className="text-accent flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              {t("signup.verificationNote")}
            </p>
          </div>

          {/* Required consents */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-terms"
                checked={consents.terms}
                onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
                className="mt-0.5 accent-accent"
              />
              <label htmlFor="consent-terms" className="font-body text-xs text-muted-foreground leading-relaxed cursor-pointer">
                {t("consent.acceptTerms")} <span className="text-destructive">{t("consent.required")}</span>{" "}
                <Link to="/terms" target="_blank" className="text-accent hover:underline">↗</Link>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-privacy"
                checked={consents.privacy}
                onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
                className="mt-0.5 accent-accent"
              />
              <label htmlFor="consent-privacy" className="font-body text-xs text-muted-foreground leading-relaxed cursor-pointer">
                {t("consent.acceptPrivacy")} <span className="text-destructive">{t("consent.required")}</span>{" "}
                <Link to="/privacy" target="_blank" className="text-accent hover:underline">↗</Link>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-service"
                checked={consents.service_notifications}
                onChange={(e) => setConsents({ ...consents, service_notifications: e.target.checked })}
                className="mt-0.5 accent-accent"
              />
              <label htmlFor="consent-service" className="font-body text-xs text-muted-foreground leading-relaxed cursor-pointer">
                {t("consent.acceptServiceNotifications")} <span className="text-muted-foreground/60">{t("consent.optional")}</span>
              </label>
            </div>
          </div>

          {touched && !consentValidation.valid && consentValidation.error && (
            <div className="p-3 border border-destructive/30 bg-destructive/5 rounded-xl">
              <p className="font-body text-xs text-destructive">
                {lang === "ar" ? consentValidation.error.ar : consentValidation.error.en}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValidTelegramUsername(telegramInput) || !consentValidation.valid}
            className="ghost-btn w-full text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {t("signup.continue")}
            <ArrowRight
              size={14}
              className={isRTL ? "rotate-180" : ""}
              strokeWidth={1.5}
            />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => base44.auth.redirectToLogin(nextUrl)}
            className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("signup.haveAccount")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}