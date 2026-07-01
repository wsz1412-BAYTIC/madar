import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Bed, Bath, Users, MapPin, ExternalLink, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const platformStyles = {
  Airbnb: { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
  Gatherin: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  'Booking.com': { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
};

export default function PropertyCard({ prop, index }) {
  const { t, lang } = useLang();
  const isRTL = lang === 'ar';
  const pStyle = platformStyles[prop.platform] || platformStyles.Airbnb;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative glass rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-700 hover:shadow-2xl hover:shadow-[#D95F3B]/10"
    >
      {/* Glow border on hover */}
      <div className="absolute -inset-px bg-gradient-to-br from-[#D95F3B]/20 via-transparent to-[#C8972A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl pointer-events-none" />

      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={prop.image}
          alt={isRTL ? prop.nameAr : prop.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-[#0A0B10]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070d]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className={`text-[10px] font-semibold px-3 py-1 rounded-full backdrop-blur-md border flex items-center gap-1.5 ${pStyle.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
            {prop.platform}
          </span>
          {prop.status === 'paused' && (
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 backdrop-blur-md border border-amber-500/20">
              {isRTL ? 'متوقف' : 'Paused'}
            </span>
          )}
        </div>

        {/* Rating chip */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-strong">
          <Star className="w-3 h-3 text-[#C8972A] fill-[#C8972A]" />
          <span className="text-[11px] font-medium text-[#F7F5F0]">4.{8 + (prop.id % 2)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-bold text-[#F7F5F0] text-lg leading-tight group-hover:text-gradient-gold transition-all duration-500">
            {isRTL ? prop.nameAr : prop.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#F7F5F0]/40 mb-4">
          <MapPin className="w-3 h-3 text-[#D95F3B]/50" />
          {isRTL ? prop.cityAr : prop.city}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-5 text-xs text-[#F7F5F0]/50 mb-5">
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-[#F7F5F0]/30" />
            <span className="font-medium text-[#F7F5F0]/70">{prop.bedrooms}</span>
            <span className="text-[#F7F5F0]/25">{isRTL ? 'غرف' : 'bd'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-[#F7F5F0]/30" />
            <span className="font-medium text-[#F7F5F0]/70">{prop.bathrooms}</span>
            <span className="text-[#F7F5F0]/25">{isRTL ? 'حمام' : 'ba'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#F7F5F0]/30" />
            <span className="font-medium text-[#F7F5F0]/70">{prop.guests}</span>
            <span className="text-[#F7F5F0]/25">{isRTL ? 'ضيف' : 'gst'}</span>
          </span>
        </div>

        {/* Price + action */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
          <div>
            <span className="text-2xl font-bold font-heading text-[#F7F5F0]">{prop.price.toLocaleString()}</span>
            <span className="text-xs text-[#F7F5F0]/30 ml-1.5">{isRTL ? 'ر.س' : 'SAR'}{t('perNight')}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#F7F5F0]/50 group-hover:bg-gradient-to-r group-hover:from-[#D95F3B] group-hover:to-[#C8972A] group-hover:text-white group-hover:border-transparent transition-all duration-500"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{isRTL ? 'عرض' : 'View'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}