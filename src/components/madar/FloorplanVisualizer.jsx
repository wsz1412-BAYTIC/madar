import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';
import { Building2, X, Users, BedDouble, Bath, DollarSign, Calendar } from 'lucide-react';

const statusConfig = {
  booked: {
    labelEn: 'Booked',
    labelAr: 'محجوز',
    color: '#D95F3B',
    bg: 'bg-[#D95F3B]/15',
    border: 'border-[#D95F3B]/40',
    glow: 'shadow-[0_0_30px_-8px_rgba(217,95,59,0.5)]',
    dot: 'bg-[#D95F3B]',
    accent: 'text-[#D95F3B]',
  },
  available: {
    labelEn: 'Available',
    labelAr: 'متاح',
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_30px_-8px_rgba(16,185,129,0.4)]',
    dot: 'bg-emerald-400',
    accent: 'text-emerald-400',
  },
  blocked: {
    labelEn: 'Blocked',
    labelAr: 'محظور',
    color: '#F59E0B',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_30px_-8px_rgba(245,158,11,0.3)]',
    dot: 'bg-amber-400',
    accent: 'text-amber-400',
  },
  maintenance: {
    labelEn: 'Maintenance',
    labelAr: 'صيانة',
    color: '#6B7280',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/25',
    glow: '',
    dot: 'bg-gray-400',
    accent: 'text-gray-400',
  },
};

const units = [
  { id: 'A-101', floor: 1, name: 'Deluxe Studio', nameAr: 'استوديو ديلوكس', status: 'booked', guest: 'Ahmed K.', nights: 4, price: 320, bedrooms: 1, bathrooms: 1, capacity: 2, platform: 'Airbnb' },
  { id: 'A-102', floor: 1, name: 'Standard Room', nameAr: 'غرفة عادية', status: 'available', guest: null, nights: 0, price: 280, bedrooms: 1, bathrooms: 1, capacity: 2, platform: 'Gathern' },
  { id: 'A-103', floor: 1, name: 'Corner Suite', nameAr: 'جناح زاوية', status: 'booked', guest: 'Sara M.', nights: 7, price: 450, bedrooms: 2, bathrooms: 1, capacity: 4, platform: 'Booking.com' },
  { id: 'B-201', floor: 2, name: 'Family Suite', nameAr: 'جناح عائلي', status: 'available', guest: null, nights: 0, price: 520, bedrooms: 2, bathrooms: 2, capacity: 5, platform: 'Airbnb' },
  { id: 'B-202', floor: 2, name: 'Executive Room', nameAr: 'غرفة تنفيذية', status: 'maintenance', guest: null, nights: 0, price: 380, bedrooms: 1, bathrooms: 1, capacity: 2, platform: 'Gathern' },
  { id: 'B-203', floor: 2, name: 'Penthouse', nameAr: 'بنتهاوس', status: 'booked', guest: 'Khalid A.', nights: 3, price: 890, bedrooms: 3, bathrooms: 2, capacity: 6, platform: 'Booking.com' },
  { id: 'C-301', floor: 3, name: 'Loft Apartment', nameAr: 'شقة لوفت', status: 'available', guest: null, nights: 0, price: 410, bedrooms: 1, bathrooms: 1, capacity: 3, platform: 'Airbnb' },
  { id: 'C-302', floor: 3, name: 'Garden View', nameAr: 'إطلالة حديقة', status: 'blocked', guest: null, nights: 0, price: 350, bedrooms: 1, bathrooms: 1, capacity: 2, platform: 'Gathern' },
];

const floors = [3, 2, 1];

export default function FloorplanVisualizer() {
  const { lang } = useLang();
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? units : units.filter(u => u.status === filter);

  const counts = {
    booked: units.filter(u => u.status === 'booked').length,
    available: units.filter(u => u.status === 'available').length,
    blocked: units.filter(u => u.status === 'blocked').length,
    maintenance: units.filter(u => u.status === 'maintenance').length,
  };

  return (
    <div className="relative glass-strong rounded-3xl border border-foreground/[0.08] overflow-hidden">
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-foreground/[0.06]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D95F3B] to-[#C8972A] rounded-2xl blur-lg opacity-20" />
              <div className="relative w-12 h-12 rounded-2xl glass flex items-center justify-center border border-foreground/10">
                <Building2 className="w-5 h-5 text-[#D95F3B]" />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {lang === 'ar' ? 'مخطط العقار التفاعلي' : 'Interactive Floorplan'}
              </h2>
              <p className="text-xs text-foreground/40">
                {lang === 'ar' ? 'نظرة شاملة على حالة الحجوزات لكل وحدة' : 'Booking status at a glance for every unit'}
              </p>
            </div>
          </div>

          {/* Legend / Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? 'all' : key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                  filter === key
                    ? `${cfg.bg} ${cfg.border} ${cfg.accent}`
                    : 'border-foreground/[0.06] text-foreground/30 hover:text-foreground/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {lang === 'ar' ? cfg.labelAr : cfg.labelEn}
                <span className="text-[10px] opacity-60">{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Building visualization */}
      <div className="relative p-6 lg:p-8">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D95F3B]/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {floors.map((floor, fi) => {
            const floorUnits = units.filter(u => u.floor === floor);
            const isDimmed = filter !== 'all';
            return (
              <motion.div
                key={floor}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: fi * 0.1 }}
                className="relative"
              >
                {/* Floor label */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-foreground/10">
                    <span className="text-xs font-bold text-foreground/50">{floor}F</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[10px] text-foreground/20 uppercase tracking-wider font-medium">
                    {floorUnits.length} {lang === 'ar' ? 'وحدات' : 'units'}
                  </span>
                </div>

                {/* Units row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {floorUnits.map((unit, ui) => {
                    const cfg = statusConfig[unit.status];
                    const isHighlighted = filter === 'all' || filter === unit.status;
                    return (
                      <motion.button
                        key={unit.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: fi * 0.1 + ui * 0.05 }}
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedUnit(unit)}
                        className={`group relative text-left p-4 rounded-2xl border transition-all duration-500 overflow-hidden ${
                          isHighlighted
                            ? `${cfg.bg} ${cfg.border} hover:${cfg.glow}`
                            : 'opacity-30 border-foreground/[0.04] bg-foreground/[0.01]'
                        }`}
                      >
                        {/* Hover glow */}
                        <div
                          className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                          style={{ background: cfg.color }}
                        />

                        <div className="relative z-10 flex items-start justify-between mb-3">
                          <div>
                            <div className="text-[10px] font-mono text-foreground/30 mb-0.5">{unit.id}</div>
                            <div className="text-sm font-semibold text-foreground leading-tight">
                              {lang === 'ar' ? unit.nameAr : unit.name}
                            </div>
                          </div>
                          <motion.span
                            animate={unit.status === 'booked' ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`}
                          />
                        </div>

                        <div className="relative z-10 flex items-center justify-between">
                          <span className={`text-[10px] font-medium ${cfg.accent} flex items-center gap-1`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {lang === 'ar' ? cfg.labelAr : cfg.labelEn}
                          </span>
                          <span className="text-xs font-bold text-foreground/60">
                            {unit.price} <span className="text-[9px] font-normal text-foreground/30">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                          </span>
                        </div>

                        {/* Mini room icons */}
                        <div className="relative z-10 flex items-center gap-2 mt-3 pt-3 border-t border-foreground/[0.04]">
                          <span className="flex items-center gap-1 text-[9px] text-foreground/25">
                            <BedDouble className="w-3 h-3" />{unit.bedrooms}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-foreground/25">
                            <Bath className="w-3 h-3" />{unit.bathrooms}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-foreground/25">
                            <Users className="w-3 h-3" />{unit.capacity}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ground / foundation bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      </div>

      {/* Unit detail panel */}
      <AnimatePresence>
        {selectedUnit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedUnit(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-3xl border border-foreground/10 w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`relative p-6 border-b border-foreground/[0.06] ${statusConfig[selectedUnit.status].bg}`}>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-foreground/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-foreground/40" />
                </button>
                <div className="text-xs font-mono text-foreground/30 mb-1">{selectedUnit.id}</div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  {lang === 'ar' ? selectedUnit.nameAr : selectedUnit.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedUnit.status].bg} border ${statusConfig[selectedUnit.status].border} ${statusConfig[selectedUnit.status].accent}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedUnit.status].dot}`} />
                    {lang === 'ar' ? statusConfig[selectedUnit.status].labelAr : statusConfig[selectedUnit.status].labelEn}
                  </span>
                  <span className="text-xs text-foreground/30">•</span>
                  <span className="text-xs text-foreground/40">{selectedUnit.platform}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-3 text-center border border-foreground/[0.06]">
                    <BedDouble className="w-4 h-4 text-foreground/30 mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-foreground">{selectedUnit.bedrooms}</div>
                    <div className="text-[9px] text-foreground/30 uppercase">{lang === 'ar' ? 'غرف' : 'Beds'}</div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center border border-foreground/[0.06]">
                    <Bath className="w-4 h-4 text-foreground/30 mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-foreground">{selectedUnit.bathrooms}</div>
                    <div className="text-[9px] text-foreground/30 uppercase">{lang === 'ar' ? 'حمامات' : 'Baths'}</div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center border border-foreground/[0.06]">
                    <Users className="w-4 h-4 text-foreground/30 mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-foreground">{selectedUnit.capacity}</div>
                    <div className="text-[9px] text-foreground/30 uppercase">{lang === 'ar' ? 'ضيوف' : 'Guests'}</div>
                  </div>
                </div>

                {selectedUnit.guest ? (
                  <div className="glass rounded-xl p-4 border border-foreground/[0.06]">
                    <div className="flex items-center gap-2 text-xs text-foreground/40 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'الضيف الحالي' : 'Current Guest'}
                    </div>
                    <div className="text-sm font-semibold text-foreground">{selectedUnit.guest}</div>
                    <div className="text-xs text-foreground/40 mt-1">
                      {selectedUnit.nights} {lang === 'ar' ? 'ليالٍ' : 'nights'}
                    </div>
                  </div>
                ) : null}

                <div className="glass rounded-xl p-4 border border-foreground/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-foreground/40">
                    <DollarSign className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'سعر الليلة' : 'Nightly Rate'}
                  </div>
                  <div className="text-lg font-bold text-gradient-gold">
                    {selectedUnit.price} {lang === 'ar' ? 'ر.س' : 'SAR'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}