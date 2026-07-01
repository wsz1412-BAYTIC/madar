import React, { useEffect, useRef, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Building2, MapPin } from 'lucide-react';

function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, target, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

const metrics = [
  {
    icon: TrendingUp,
    target: 74,
    suffix: '%',
    labelEn: 'Average Occupancy',
    labelAr: 'متوسط الإشغال',
    gradient: 'from-[#D95F3B]/20 to-transparent',
    iconColor: 'text-[#D95F3B]',
    border: 'border-[#D95F3B]/20',
  },
  {
    icon: ArrowUpRight,
    target: 12,
    prefix: '+',
    suffix: '%',
    labelEn: 'Potential Price Increase',
    labelAr: 'زيادة السعر المحتملة',
    gradient: 'from-[#C8972A]/20 to-transparent',
    iconColor: 'text-[#C8972A]',
    border: 'border-[#C8972A]/20',
  },
  {
    icon: Building2,
    target: 8420,
    suffix: '+',
    labelEn: 'Properties Analyzed',
    labelAr: 'عقارات تم تحليلها',
    gradient: 'from-[#D95F3B]/15 to-transparent',
    iconColor: 'text-[#D95F3B]',
    border: 'border-white/10',
  },
  {
    icon: MapPin,
    target: 24,
    labelEn: 'Cities Covered',
    labelAr: 'مدن مغطاة',
    gradient: 'from-[#C8972A]/15 to-transparent',
    iconColor: 'text-[#C8972A]',
    border: 'border-white/10',
  },
];

export default function PlatformMetrics() {
  const { lang } = useLang();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative glass rounded-2xl p-5 sm:p-6 border ${m.border} hover:border-white/20 transition-all duration-500 overflow-hidden`}
          >
            {/* Glow accent */}
            <div className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${m.gradient} rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`w-4 h-4 ${m.iconColor}`} />
              </div>
              <div className="font-heading text-3xl sm:text-4xl font-bold text-[#F7F5F0] leading-none mb-2">
                <AnimatedCounter
                  target={m.target}
                  prefix={m.prefix || ''}
                  suffix={m.suffix || ''}
                />
              </div>
              <div className="text-xs sm:text-sm text-[#F7F5F0]/40 font-medium">
                {lang === 'ar' ? m.labelAr : m.labelEn}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}