import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

// Small, non-blocking notice that replaces the old full-width red error
// blocks: fixed near the top of the viewport (never displaces content,
// filters, or buttons), auto-dismisses, and always closable. Theme-token
// styling, RTL-safe, AR/EN message objects.
export default function TransientAlert({
  message, // string | {en, ar}
  tone = 'warning', // 'warning' | 'danger' | 'info'
  autoDismissMs = 8000,
  onClose,
}) {
  const { lang } = useLang();
  const text = typeof message === 'string' ? message : (lang === 'ar' ? message?.ar : message?.en);

  useEffect(() => {
    if (!autoDismissMs || !onClose) return undefined;
    const id = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(id);
  }, [autoDismissMs, onClose]);

  if (!text) return null;

  const tones = {
    warning: 'bg-warning/15 border-warning/30 text-foreground',
    danger: 'bg-danger/15 border-danger/30 text-foreground',
    info: 'bg-foreground/[0.06] border-foreground/[0.12] text-foreground',
  };
  const Icon = tone === 'info' ? Info : AlertTriangle;
  const iconColor = tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-foreground/60';

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[45] max-w-[calc(100vw-2rem)] sm:max-w-md w-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${tones[tone] || tones.warning}`}
      >
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
        <p className="text-sm leading-snug">{text}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'ar' ? 'إغلاق التنبيه' : 'Dismiss alert'}
          className="p-1 -m-1 ms-1 rounded-lg hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
