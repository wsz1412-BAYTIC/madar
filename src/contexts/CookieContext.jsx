import React, { createContext, useContext, useState, useEffect } from 'react';

const CookieContext = createContext();

export function CookieProvider({ children }) {
  const [cookieConsent, setCookieConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('madar_cookie_consent');
    if (stored) {
      setCookieConsent(JSON.parse(stored));
    } else {
      setShowBanner(true);
    }
  }, []);

  const updateConsent = (preferences) => {
    const consentData = {
      essential: true, // Always true
      performance: preferences.performance || false,
      preferences: preferences.preferences || false,
      marketing: preferences.marketing || false,
      timestamp: new Date().toISOString(),
    };
    setCookieConsent(consentData);
    localStorage.setItem('madar_cookie_consent', JSON.stringify(consentData));
    setShowBanner(false);

    // Activate analytics/marketing only if consented
    if (consentData.performance && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': consentData.performance ? 'granted' : 'denied',
        'ad_storage': consentData.marketing ? 'granted' : 'denied',
      });
    }
  };

  const acceptAll = () => {
    updateConsent({ performance: true, preferences: true, marketing: true });
  };

  const rejectNonEssential = () => {
    updateConsent({ performance: false, preferences: false, marketing: false });
  };

  return (
    <CookieContext.Provider value={{ cookieConsent, showBanner, setShowBanner, updateConsent, acceptAll, rejectNonEssential }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieProvider');
  }
  return context;
}