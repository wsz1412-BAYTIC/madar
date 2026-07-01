import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, MapPin, Calendar, Globe2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const cities = [
  { name: 'Riyadh', nameAr: 'الرياض', index: 87, change: '+12%', up: true, avgPrice: 680, supply: 1240 },
  { name: 'Jeddah', nameAr: 'جدة', index: 76, change: '+5%', up: true, avgPrice: 520, supply: 890 },
  { name: 'Makkah', nameAr: 'مكة المكرمة', index: 92, change: '+18%', up: true, avgPrice: 750, supply: 650 },
  { name: 'Madinah', nameAr: 'المدينة المنورة', index: 84, change: '+8%', up: true, avgPrice: 580, supply: 420 },
  { name: 'Dammam', nameAr: 'الدمام', index: 62, change: '-3%', up: false, avgPrice: 410, supply: 380 },
  { name: 'AlUla', nameAr: 'العلا', index: 71, change: '+15%', up: true, avgPrice: 890, supply: 95 },
];

const events = [
  { name: 'Riyadh Season 2025', nameAr: 'موسم الرياض 2025', city: 'Riyadh', cityAr: 'الرياض', date: 'Oct - Mar', impact: 'high', priceImpact: '+45%' },
  { name: 'Hajj Season', nameAr: 'موسم الحج', city: 'Makkah', cityAr: 'مكة المكرمة', date: 'Jun', impact: 'high', priceImpact: '+120%' },
  { name: 'Jeddah Art Week', nameAr: 'أسبوع فن جدة', city: 'Jeddah', cityAr: 'جدة', date: 'Feb', impact: 'medium', priceImpact: '+25%' },
  { name: 'AlUla Arts Festival', nameAr: 'مهرجان العلا للفنون', city: 'AlUla', cityAr: 'العلا', date: 'Jan - Mar', impact: 'high', priceImpact: '+60%' },
  { name: 'Formula E Diriyah', nameAr: 'فورمولا إي الدرعية', city: 'Riyadh', cityAr: 'الرياض', date: 'Feb', impact: 'medium', priceImpact: '+35%' },
];

const impactBadge = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function Market() {
  const { t, lang } = useLang();
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';
  const chartData = cities.map(c => ({ name: lang === 'ar' ? c.nameAr : c.name, index: c.index, up: c.up }));

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8972A]/20 to-[#D95F3B]/10 flex items-center justify-center border border-[#C8972A]/20">
            <Globe2 className="w-5 h-5 text-[#C8972A]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('marketIntelligence')}</h1>
            <p className="text-sm text-[#F7F5F0]/40">{lang === 'ar' ? 'بيانات السوق في الوقت الفعلي عبر المملكة' : 'Real-time market data across Saudi Arabia'}</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('demandIndex')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.5)', fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ background: '#14161D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F7F5F0', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="index" radius={[0, 6, 6, 0]} barSize={20}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.up ? '#D95F3B' : 'rgba(247,245,240,0.2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08}>
        {cities.map(city => (
          <StaggerItem key={city.name}>
            <div className="glass rounded-2xl p-5 hover:border-white/15 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D95F3B]" />
                  <span className="font-heading font-semibold text-[#F7F5F0]">{lang === 'ar' ? city.nameAr : city.name}</span>
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${city.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {city.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{city.change}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#F7F5F0]/40">{lang === 'ar' ? 'مؤشر الطلب' : 'Demand Index'}</span>
                  <span className="font-semibold text-[#F7F5F0]">{city.index}/100</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#D95F3B] to-[#C8972A] rounded-full" style={{ width: `${city.index}%` }} />
                </div>
                <div className="flex justify-between text-xs text-[#F7F5F0]/30 pt-1">
                  <span>{lang === 'ar' ? 'متوسط السعر' : 'Avg Price'}: {city.avgPrice} {sar}</span>
                  <span>{lang === 'ar' ? 'العرض' : 'Supply'}: {city.supply}</span>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('localEvents')}</h2>
          <div className="space-y-3">
            {events.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/10 transition-all flex-wrap gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Calendar className="w-4 h-4 text-[#C8972A] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-[#F7F5F0] truncate">{lang === 'ar' ? event.nameAr : event.name}</div>
                    <div className="text-xs text-[#F7F5F0]/30">{lang === 'ar' ? event.cityAr : event.city} • {event.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${impactBadge[event.impact]}`}>
                    {t(event.impact)}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">{event.priceImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}