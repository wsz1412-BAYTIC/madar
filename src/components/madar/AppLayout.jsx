import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/madar/Sidebar';
import { useLang } from '@/contexts/LanguageContext';

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
    ? { [isRTL ? 'marginRight' : 'marginLeft']: 'var(--sidebar-width, 240px)' }
    : {};

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <Sidebar />
      <main className="pt-14 lg:pt-0 min-h-screen transition-all duration-300" style={marginStyle}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}