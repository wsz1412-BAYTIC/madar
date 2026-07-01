import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/madar/Sidebar';
import { useLang } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function AppLayout() {
  const { isRTL } = useLang();
  const [isLg, setIsLg] = React.useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsLg(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const marginStyle = isLg
    ? { [isRTL ? 'marginRight' : 'marginLeft']: 'var(--sidebar-width, 250px)' }
    : {};

  return (
    <div className="min-h-screen bg-[#0A0B10]">
      <Sidebar />
      <main className="pt-14 lg:pt-0 min-h-screen transition-all duration-300" style={marginStyle}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}