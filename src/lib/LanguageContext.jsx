import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { i18n } from "@/lib/i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "ar" ? "en" : "ar";
      localStorage.setItem("madar_lang", next);
      return next;
    });
  }, []);

  const changeLang = useCallback((newLang) => {
    if (newLang === "ar" || newLang === "en") {
      setLang(newLang);
      localStorage.setItem("madar_lang", newLang);
    }
  }, []);

  // Translation function: t('nav.properties') → Arabic or English string
  const t = useCallback(
    (key) => {
      return i18n[lang]?.[key] ?? i18n.en[key] ?? key;
    },
    [lang]
  );

  // Pick the correct language field from an API response object.
  // Usage: pickLang(brief.reasoning_ar, brief.reasoning_en)
  // When lang === 'ar', returns the Arabic value; when 'en', returns the English value.
  const pickLang = useCallback(
    (arValue, enValue) => {
      return lang === "ar" ? arValue ?? enValue ?? "" : enValue ?? arValue ?? "";
    },
    [lang]
  );

  // Pick a field from an object that has _ar and _en suffixes
  // Usage: pickLangField(brief, 'reasoning') → brief.reasoning_ar or brief.reasoning_en
  const pickLangField = useCallback(
    (obj, fieldBase) => {
      if (!obj) return "";
      const arVal = obj[`${fieldBase}_ar`];
      const enVal = obj[`${fieldBase}_en`];
      return lang === "ar" ? arVal ?? enVal ?? "" : enVal ?? arVal ?? "";
    },
    [lang]
  );

  const isRTL = lang === "ar";

  // Set document direction and language for RTL support
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider
      value={{ lang, toggleLang, changeLang, t, pickLang, pickLangField, isRTL }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageContext;