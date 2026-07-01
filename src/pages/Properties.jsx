import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Plus, Loader2, X, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';
import PropertyCard from '@/components/madar/PropertyCard';
import FloorplanVisualizer from '@/components/madar/FloorplanVisualizer';

const mockProperties = [
  { id: 1, name: 'Luxury Villa', nameAr: 'فيلا فاخرة', city: 'Riyadh', cityAr: 'الرياض', bedrooms: 4, bathrooms: 3, guests: 8, price: 850, status: 'active', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop' },
  { id: 2, name: 'Modern Studio', nameAr: 'استوديو عصري', city: 'Jeddah', cityAr: 'جدة', bedrooms: 1, bathrooms: 1, guests: 2, price: 320, status: 'active', platform: 'Gatherin', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop' },
  { id: 3, name: 'Family Home', nameAr: 'منزل عائلي', city: 'KAEC', cityAr: 'كاوست', bedrooms: 3, bathrooms: 2, guests: 6, price: 600, status: 'active', platform: 'Booking.com', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop' },
  { id: 4, name: 'Penthouse Suite', nameAr: 'جناح بنتهاوس', city: 'Dammam', cityAr: 'الدمام', bedrooms: 2, bathrooms: 2, guests: 4, price: 720, status: 'paused', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop' },
];

export default function Properties() {
  const { t, lang } = useLang();
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    setImporting(true);
    try {
      await api.post('/properties/import', { url: importUrl });
      setShowImport(false);
      setImportUrl('');
    } catch { }
    setImporting(false);
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('myProperties')}</h1>
            <p className="text-sm text-[#F7F5F0]/40 mt-1">{mockProperties.length} {lang === 'ar' ? 'عقار' : 'properties'}</p>
          </div>
          <button onClick={() => setShowImport(true)} className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all overflow-hidden">
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{t('addProperty')}</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>
      </FadeIn>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowImport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-[#F7F5F0]">{t('importListing')}</h2>
                <button onClick={() => setShowImport(false)} className="p-1 hover:bg-white/5 rounded-lg"><X className="w-4 h-4 text-[#F7F5F0]/40" /></button>
              </div>
              <p className="text-sm text-[#F7F5F0]/40 mb-4">{t('pasteUrl')}</p>
              <form onSubmit={handleImport} className="space-y-4">
                <div className="relative">
                  <Link2 className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-[#F7F5F0]/25" />
                  <input
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    placeholder="https://airbnb.com/rooms/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F7F5F0] placeholder-[#F7F5F0]/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50"
                    required
                  />
                </div>
                <button type="submit" disabled={importing} className="w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {importing ? <><Loader2 className="w-4 h-4 animate-spin" />{t('importing')}</> : t('import')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floorplan Visualizer */}
      <FadeIn delay={0.1}>
        <FloorplanVisualizer />
      </FadeIn>

      {/* Properties Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((prop, i) => (
          <PropertyCard key={prop.id} prop={prop} index={i} />
        ))}
      </div>
    </div>
  );
}