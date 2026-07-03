import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/madar/Sidebar';
import { useLang } from '@/contexts/LanguageContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function AppLayout() {
  const { isRTL } = useLang();
  const location = useLocation();
  const reduce = useReducedMotion();
  const [isLg, setIsLg] = React.useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsLg(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Each page starts at the top; global smooth-scroll CSS would animate this,
  // so jump instantly instead.
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const marginStyle = isLg
    ? { [isRTL ? 'marginRight' : 'marginLeft']: 'var(--sidebar-width, 250px)' }
    : {};

  return (
    <div className="min-h-screen bg-[#0A0B10]">
      <Sidebar />
      <main className="pt-16 lg:pt-0 min-h-screen transition-all duration-300" style={marginStyle}>
        {/* Cross-page transition: opacity-only cross-fade. Deliberately NOT
            using transform/filter/perspective here — per the CSS spec, any of
            those on an ancestor creates a new containing block for
            `position: fixed` descendants, which would trap every in-page
            fixed-positioned overlay (modals, etc.) inside this padded,
            max-width column instead of the true viewport. Opacity is the one
            visual property that doesn't have that side effect. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
