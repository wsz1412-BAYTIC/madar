import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn } from '@/components/madar/Motion';
import { motion } from 'framer-motion';

// Official Airbnb logo — Bélo icon + "airbnb" wordmark
const AirbnbLogo = ({ className = '', monochrome }) => {
  const color = monochrome ? 'rgba(247,245,240,0.5)' : '#FF385C';
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 3.2c-3.7 0-6.8 3-6.8 6.7 0 2.3 1.1 4.4 2.8 6.4.5.6 1 1.1 1.5 1.7.9 1 1.7 1.9 2.2 2.9.2.4.3.8.3 1.1 0 .8-.6 1.4-1.4 1.4-.7 0-1.3-.4-1.8-1.1-.2-.3-.4-.5-.7-.5-.4 0-.7.3-.7.7 0 .2.1.4.2.5.7 1.1 1.8 1.8 3 1.8 1.6 0 2.8-1.2 2.8-2.8 0-.6-.2-1.2-.5-1.8-.4-.8-1-1.6-1.7-2.4-.4-.5-.9-1-1.4-1.5-1.3-1.4-2.2-2.6-2.2-4 0-1.9 1.5-3.4 3.4-3.4 1.4 0 2.6.8 3.1 2 .1.3.3.5.6.5.4 0 .7-.3.7-.7 0-.1 0-.2-.1-.3-.7-1.6-2.3-2.7-4.1-2.7-2.4 0-4.1 1.7-4.1 4 0 1.5.7 2.8 1.7 4 .5.6 1 1.1 1.5 1.7.7.8 1.2 1.5 1.5 2.2.2.4.3.8.3 1.1 0 .8-.6 1.4-1.4 1.4-.7 0-1.3-.4-1.8-1.1-.2-.3-.4-.5-.7-.5-.4 0-.7.3-.7.7 0 .2.1.4.2.5.7 1.1 1.8 1.8 3 1.8 1.6 0 2.8-1.2 2.8-2.8 0-.6-.2-1.2-.5-1.8-.4-.8-1-1.6-1.7-2.4-.4-.5-.9-1-1.4-1.5-1.3-1.4-2.2-2.6-2.2-4 0-1.9 1.5-3.4 3.4-3.4z"
          fill={color}
          style={{ transition: 'fill 0.4s ease' }}
        />
      </svg>
      <span
        style={{
          fontFamily: "'Airbnb Cereal App', 'Inter', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
          color,
          transition: 'color 0.4s ease',
          lineHeight: 1,
        }}
      >
        airbnb
      </span>
    </div>
  );
};

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
  { id: 'airbnb', Logo: AirbnbLogo, logoClass: '' },
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
                <div className="relative flex items-center justify-center h-20 min-w-[140px]">
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