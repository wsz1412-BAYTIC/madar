import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Plus, Bed, Bath, Users, MapPin, ExternalLink, Loader2, X, Link2 } from 'lucide-react';

const mockProperties = [
  { id: 1, name: 'Luxury Villa', nameAr: 'فيلا فاخرة', city: 'Riyadh', cityAr: 'الرياض', bedrooms: 4, bathrooms: 3, guests: 8, price: 850, status: 'active', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop' },
  { id: 2, name: 'Modern Studio', nameAr: 'استوديو عصري', city: 'Jeddah', cityAr: 'جدة', bedrooms: 1, bathrooms: 1, guests: 2, price: 320, status: 'active', platform: 'Gatherin', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop' },
  { id: 3, name: 'Family Home', nameAr: 'منزل عائلي', city: 'KAEC', cityAr: 'كاوست', bedrooms: 3, bathrooms: 2, guests: 6, price: 600, status: 'active', platform: 'Booking.com', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop' },
  { id: 4, name: 'Penthouse Suite', nameAr: 'جناح بنتهاوس', city: 'Dammam', cityAr: 'الدمام', bedrooms: 2, bathrooms: 2, guests: 4, price: 720, status: 'paused', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop' },
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

  const platformColor = (p) => {
    if (p === 'Airbnb') return 'bg-rose-50 text-rose-600';
    if (p === 'Gatherin') return 'bg-emerald-50 text-emerald-600';
    return 'bg-blue-50 text-blue-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('myProperties')}</h1>
          <p className="text-sm text-[#1C1F2E]/50 mt-1">{mockProperties.length} {lang === 'ar' ? 'عقار' : 'properties'}</p>
        </div>
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#D95F3B] text-white text-sm font-medium rounded-xl hover:bg-[#D95F3B]/90 transition-all">
          <Plus className="w-4 h-4" />{t('addProperty')}
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-[#1C1F2E]">{t('importListing')}</h2>
              <button onClick={() => setShowImport(false)} className="p-1 hover:bg-[#1C1F2E]/5 rounded-lg"><X className="w-4 h-4 text-[#1C1F2E]/40" /></button>
            </div>
            <p className="text-sm text-[#1C1F2E]/50 mb-4">{t('pasteUrl')}</p>
            <form onSubmit={handleImport} className="space-y-4">
              <div className="relative">
                <Link2 className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-[#1C1F2E]/30" />
                <input
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  placeholder="https://airbnb.com/rooms/..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F5F0] border border-[#1C1F2E]/10 text-sm text-[#1C1F2E] placeholder-[#1C1F2E]/30 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]"
                  required
                />
              </div>
              <button type="submit" disabled={importing} className="w-full py-3 bg-[#D95F3B] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {importing ? <><Loader2 className="w-4 h-4 animate-spin" />{t('importing')}</> : t('import')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockProperties.map(prop => (
          <div key={prop.id} className="bg-white rounded-2xl border border-[#1C1F2E]/5 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="relative h-44 overflow-hidden">
              <img src={prop.image} alt={lang === 'ar' ? prop.nameAr : prop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${platformColor(prop.platform)}`}>{prop.platform}</span>
                {prop.status === 'paused' && <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">{lang === 'ar' ? 'متوقف' : 'Paused'}</span>}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-heading font-semibold text-[#1C1F2E] mb-1">{lang === 'ar' ? prop.nameAr : prop.name}</h3>
              <div className="flex items-center gap-1 text-xs text-[#1C1F2E]/50 mb-3">
                <MapPin className="w-3 h-3" />{lang === 'ar' ? prop.cityAr : prop.city}
              </div>
              <div className="flex items-center gap-4 text-xs text-[#1C1F2E]/50 mb-4">
                <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{prop.bedrooms}</span>
                <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{prop.bathrooms}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{prop.guests}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#1C1F2E]/5">
                <div>
                  <span className="text-lg font-bold text-[#1C1F2E]">{prop.price}</span>
                  <span className="text-xs text-[#1C1F2E]/40 ml-1">{lang === 'ar' ? 'ر.س' : 'SAR'}{t('perNight')}</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-[#1C1F2E]/5 text-[#1C1F2E]/40">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}