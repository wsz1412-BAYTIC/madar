import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn } from '@/components/madar/Motion';
import { motion } from 'framer-motion';

// Airbnb "Bélo" logo
const AirbnbLogo = ({ className = '', monochrome }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 18.25c-1.2 1.5-2.6 2.25-4.05 2.25-1.8 0-3.2-1.35-3.2-3.1 0-1.05.5-2 1.35-2.95.2-.25.55-.55.95-.9.75-.65 1.95-1.5 2.55-2.1.5-.5.85-1.05.85-1.7 0-.85-.65-1.55-1.5-1.55-.6 0-1.15.35-1.5 1-.15.25-.3.45-.6.45-.35 0-.65-.3-.65-.65 0-.1.05-.2.1-.3.5-1 1.65-1.75 2.95-1.75 1.6 0 2.8 1.1 2.8 2.6 0 .95-.4 1.75-1.15 2.55-.6.65-1.8 1.55-2.6 2.2-.35.25-.6.5-.75.7-.25.3-.4.6-.4.9 0 .75.6 1.3 1.4 1.3.65 0 1.25-.3 1.85-1 .35-.4.65-.6.95-.6.35 0 .65.25.65.6 0 .15-.05.3-.15.45zm5.25-.8c0-.3-.15-.6-.4-.9-.15-.2-.4-.45-.75-.7-.8-.65-2-1.55-2.6-2.2-.75-.8-1.15-1.6-1.15-2.55 0-1.5 1.2-2.6 2.8-2.6 1.3 0 2.45.75 2.95 1.75.05.1.1.2.1.3 0 .35-.3.65-.65.65-.3 0-.45-.2-.6-.45-.35-.65-.9-1-1.5-1-.85 0-1.5.7-1.5 1.55 0 .65.35 1.2.85 1.7.6.6 1.8 1.45 2.55 2.1.4.35.75.65.95.9.85.95 1.35 1.9 1.35 2.95 0 1.75-1.4 3.1-3.2 3.1-1.45 0-2.85-.75-4.05-2.25-.1-.15-.15-.3-.15-.45 0-.35.3-.6.65-.6.3 0 .6.2.95.6.6.7 1.2 1 1.85 1 .8 0 1.4-.55 1.4-1.3z"
      fill="currentColor"
      style={{ color: monochrome ? 'rgba(247,245,240,0.5)' : '#FF5A5F', transition: 'color 0.4s ease' }}
    />
  </svg>
);

// Gathern text logo
const GathernLogo = ({ className = '', monochrome }) => (
  <span
    className={className}
    style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.02em',
      color: monochrome ? 'rgba(247,245,240,0.5)' : '#00A67D',
      transition: 'color 0.4s ease',
    }}
  >
    Gathern
  </span>
);

// Booking.com text logo
const BookingLogo = ({ className = '', monochrome }) => (
  <span
    className={className}
    style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
      color: monochrome ? 'rgba(247,245,240,0.5)' : '#003B95',
      transition: 'color 0.4s ease',
    }}
  >
    Booking.com
  </span>
);

const platforms = [
  { id: 'airbnb', Logo: AirbnbLogo, logoClass: 'h-8 w-auto' },
  { id: 'gathern', Logo: GathernLogo, logoClass: '' },
  { id: 'booking', Logo: BookingLogo, logoClass: '' },
];

export default function PlatformLogos() {
  const { t, lang } = useLang();

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0B10] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D95F3B]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[#C8972A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[#C8972A] text-xs font-medium mb-6">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#C8972A]"
            />
            {lang === 'ar' ? 'تكامل سلس' : 'Seamless Integration'}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F7F5F0] mb-4 leading-tight max-w-3xl mx-auto">
            {lang === 'ar'
              ? 'حلّل عقاراتك عبر المنصات التي تستخدمها بالفعل'
              : 'Analyze Your Property Across the Platforms You Already Use'}
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-[#F7F5F0]/40 text-sm sm:text-base mb-14 max-w-xl mx-auto">
            {lang === 'ar'
              ? 'اربط حساباتك الموجودة واحصل على رؤى موحّدة في مكان واحد'
              : 'Connect your existing accounts and get unified insights in one place'}
          </p>
        </FadeIn>

        {/* Logos */}
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-center gap-12 sm:gap-20 flex-wrap">
            {platforms.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.08, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="group relative cursor-pointer"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -m-8" />
                <div className="relative flex items-center justify-center h-16 min-w-[140px]">
                  <p.Logo className={p.logoClass} monochrome={true} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <p.Logo className={p.logoClass} monochrome={false} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}