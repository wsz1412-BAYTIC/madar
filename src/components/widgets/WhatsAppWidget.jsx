import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

// Configurable via env (VITE_WHATSAPP_NUMBER, digits only with country code);
// falls back to the official Madar support number.
const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || '966538100119';
const WHATSAPP_MESSAGE_EN = 'Hello Madar Support, I need assistance with my account or the platform.';
const WHATSAPP_MESSAGE_AR = 'مرحبًا فريق دعم مدار، أحتاج إلى مساعدة بخصوص حسابي أو استخدام المنصة.';

const VISIBILITY_INTERVAL = 30000; // 30 seconds
const VISIBILITY_DURATION = 5000; // Show for 5 seconds

export default function WhatsAppWidget() {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const message = lang === 'ar' ? WHATSAPP_MESSAGE_AR : WHATSAPP_MESSAGE_EN;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  // Handle scroll to hide and restart timer
  useEffect(() => {
    let hideTimer;
    let showTimer;

    const handleScroll = () => {
      setIsScrolling(true);
      setIsVisible(false);
      clearTimeout(hideTimer);
      clearTimeout(showTimer);

      // Restart the cycle 2 seconds after scroll ends
      hideTimer = setTimeout(() => {
        setIsScrolling(false);
        scheduleVisibility();
      }, 2000);
    };

    const scheduleVisibility = () => {
      showTimer = setTimeout(() => {
        setIsVisible(true);
        hideTimer = setTimeout(() => {
          setIsVisible(false);
          scheduleVisibility();
        }, VISIBILITY_DURATION);
      }, VISIBILITY_INTERVAL);
    };

    scheduleVisibility();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-39 w-11 h-11 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group ${
            theme === 'dark'
              ? 'bg-[#25D366] text-white hover:bg-[#20BA5A]'
              : 'bg-[#25D366] text-white hover:bg-[#20BA5A]'
          }`}
          style={{
            [isRTL ? 'left' : 'right']: '1.5rem',
            bottom: '5.5rem'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={lang === 'ar' ? 'تواصل مع الدعم' : 'Contact Support'}
        >
          {/* Official WhatsApp Icon */}
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.124 7.738L.929 23.5l8.272-2.737c2.194 1.194 4.664 1.82 7.297 1.82h.009a9.871 9.871 0 009.745-9.804c0-2.633-.731-5.408-2.124-7.738l2.124-8.287-8.271 2.738C15.712 1.465 13.243.84 10.51.84" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}