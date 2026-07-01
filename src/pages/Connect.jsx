import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Link2, Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { FadeIn } from '@/components/madar/Motion';

const platforms = [
  { id: 'airbnb', name: 'Airbnb', logo: '🏠', desc: { en: 'Sync your Airbnb listings, bookings, and pricing', ar: 'مزامنة إعلانات ومواعيد وأسعار Airbnb' }, color: '#FF5A5F', connected: true },
  { id: 'gatherin', name: 'Gatherin', logo: '🏡', desc: { en: 'Connect your Gatherin properties for Saudi market data', ar: 'اربط عقاراتك على Gatherin لبيانات السوق السعودي' }, color: '#00B67A', connected: false },
  { id: 'booking', name: 'Booking.com', logo: '🌐', desc: { en: 'Import listings and reviews from Booking.com', ar: 'استيراد الإعلانات والتقييمات من Booking.com' }, color: '#003580', connected: false },
];

export default function Connect() {
  const { t, lang } = useLang();
  const [connecting, setConnecting] = useState(null);
  const [statuses, setStatuses] = useState(platforms.reduce((acc, p) => ({ ...acc, [p.id]: p.connected }), {}));

  const handleConnect = async (id) => {
    setConnecting(id);
    setTimeout(() => {
      setStatuses(prev => ({ ...prev, [id]: true }));
      setConnecting(null);
    }, 2000);
  };

  const handleDisconnect = (id) => {
    setStatuses(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/10 flex items-center justify-center border border-[#D95F3B]/20">
            <Link2 className="w-5 h-5 text-[#D95F3B]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('connectPlatforms')}</h1>
            <p className="text-sm text-[#F7F5F0]/40">{t('connectDesc')}</p>
          </div>
        </div>
      </FadeIn>

      <div className="space-y-4">
        {platforms.map((platform, i) => {
          const isConnected = statuses[platform.id];
          const isLoading = connecting === platform.id;
          return (
            <FadeIn key={platform.id} delay={i * 0.1}>
              <div className="glass rounded-2xl p-6 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/[0.06]" style={{ backgroundColor: `${platform.color}15` }}>
                      {platform.logo}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-[#F7F5F0]">{platform.name}</h3>
                      <p className="text-sm text-[#F7F5F0]/40">{platform.desc[lang]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <Check className="w-3 h-3" />{t('connected')}
                      </span>
                    )}
                    {isConnected ? (
                      <button onClick={() => handleDisconnect(platform.id)} className="px-4 py-2 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all">
                        {t('disconnect')}
                      </button>
                    ) : (
                      <button onClick={() => handleConnect(platform.id)} disabled={isLoading} className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-lg hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all disabled:opacity-50 flex items-center gap-1.5">
                        {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" />{lang === 'ar' ? 'جاري الربط...' : 'Connecting...'}</> : <>{t('connectNow')}<ExternalLink className="w-3 h-3" /></>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading font-semibold text-[#F7F5F0] mb-4">{lang === 'ar' ? 'كيف يعمل الربط' : 'How it works'}</h3>
          <div className="space-y-3">
            {(lang === 'ar'
              ? ['انقر على "اربط الآن" للمنصة المطلوبة', 'سجل الدخول وامنح مدار الأذونات المطلوبة', 'ستتم مزامنة إعلاناتك وحجوزاتك تلقائياً']
              : ['Click "Connect Now" for your platform', 'Log in and authorize Madar access', 'Your listings and bookings sync automatically']
            ).map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D95F3B] to-[#C8972A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-sm text-[#F7F5F0]/60">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}