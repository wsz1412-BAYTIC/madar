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
        {/* Cross-page transition: outgoing view fades up slightly while the
            incoming one rises and unblurs — fast enough to feel instant. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
