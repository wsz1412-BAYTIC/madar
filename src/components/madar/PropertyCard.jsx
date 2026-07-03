import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Bed, Bath, Users, MapPin, ExternalLink, Star, Building2, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';

// Platform badges: solid, high-contrast chips that read clearly on both the
// photo (dark scrim behind) and in light mode. Dot + wordmark color per brand.
const platformStyles = {
  Airbnb: { badge: 'bg-rose-600/90 text-white', dot: 'bg-white' },
  Gatherin: { badge: 'bg-emerald-600/90 text-white', dot: 'bg-white' },
  Gathern: { badge: 'bg-emerald-600/90 text-white', dot: 'bg-white' },
  'Booking.com': { badge: 'bg-blue-600/90 text-white', dot: 'bg-white' },
};

// Branded fallback when a property has no image or the image fails to load —
// a quiet surface with the brand mark instead of a broken/black box.
function ImageFallback({ name }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#D95F3B]/10 via-surface to-[#C8972A]/10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/15 border border-[#D95F3B]/20 flex items-center justify-center">
        <Building2 className="w-6 h-6 text-[#D95F3B]" />
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-foreground/40">
        <ImageOff className="w-3 h-3" />
        <span className="max-w-[180px] truncate">{name}</span>
      </div>
    </div>
  );
}

export default function PropertyCard({ prop, index }) {
  const { t, lang } = useLang();
  const isRTL = lang === 'ar';
  const pStyle = platformStyles[prop.platform] || platformStyles.Airbnb;
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = isRTL ? prop.nameAr : prop.name;
  const showImage = Boolean(prop.image) && !imgFailed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative glass rounded-3xl overflow-hidden hover:border-foreground/20 transition-all duration-700 hover:shadow-2xl hover:shadow-[#D95F3B]/10 h-full flex flex-col"
    >
      {/* Glow border on hover */}
      <div className="absolute -inset-px bg-gradient-to-br from-[#D95F3B]/20 via-transparent to-[#C8972A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl pointer-events-none" />

      {/* Image */}
      <div className="relative h-56 overflow-hidden shrink-0">
        {showImage ? (
          <>
            <img
              src={prop.image}
              alt={displayName}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
            />
            {/* Bottom scrim: blends the photo into the card surface and keeps
                the rating chip readable in both themes. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
          </>
        ) : (
          <ImageFallback name={displayName} />
        )}

        {/* Top badges */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between">
          <span className={`text-[10px] font-semibold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-sm ${pStyle.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
            {prop.platform}
          </span>
          {(prop.status === 'paused' || prop.status === 'inactive') && (
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-warning/90 text-white backdrop-blur-md shadow-sm">
              {isRTL ? 'متوقف' : 'Paused'}
            </span>
          )}
        </div>

        {/* Rating chip */}
        {showImage && (
          <div className="absolute bottom-4 start-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md">
            <Star className="w-3 h-3 text-[#C8972A] fill-[#C8972A]" />
            <span className="text-[11px] font-medium text-white nums">4.{8 + (prop.id % 2)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-bold text-foreground text-lg leading-tight group-hover:text-gradient-gold transition-all duration-500">
            {displayName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-foreground/50 mb-4">
          <MapPin className="w-3 h-3 text-[#D95F3B]/60" />
          {isRTL ? prop.cityAr : prop.city}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-5 text-xs text-foreground/60 mb-5">
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-foreground/35" />
            <span className="font-medium text-foreground/75 nums">{prop.bedrooms}</span>
            <span className="text-foreground/35">{isRTL ? 'غرف' : 'bd'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-foreground/35" />
            <span className="font-medium text-foreground/75 nums">{prop.bathrooms}</span>
            <span className="text-foreground/35">{isRTL ? 'حمام' : 'ba'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-foreground/35" />
            <span className="font-medium text-foreground/75 nums">{prop.guests}</span>
            <span className="text-foreground/35">{isRTL ? 'ضيف' : 'gst'}</span>
          </span>
        </div>

        {/* Price + action — pinned to the bottom so all cards align */}
        <div className="flex items-center justify-between pt-4 border-t border-foreground/[0.06] mt-auto">
          <div>
            <span className="text-2xl font-bold font-heading text-foreground nums">{prop.price.toLocaleString()}</span>
            <span className="text-xs text-foreground/40 ms-1.5">{isRTL ? 'ر.س' : 'SAR'}{t('perNight')}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-foreground/60 group-hover:bg-gradient-to-r group-hover:from-[#D95F3B] group-hover:to-[#C8972A] group-hover:text-white group-hover:border-transparent transition-all duration-500"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{isRTL ? 'عرض' : 'View'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
