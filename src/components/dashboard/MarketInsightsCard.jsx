import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Map as MapIcon, MapPin, Activity, LineChart, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

// Discovery card that surfaces the existing Market Heatmap (/market). It is
// purely explanatory + a link — it does NOT fetch or display any occupancy /
// ADR numbers, so it can never show fake or unofficial data. Actual figures,
// plan gating, and empty states all live in the real heatmap on /market.
export default function MarketInsightsCard({ plan }) {
  const { lang } = useLang();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const ar = lang === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const isFree = plan === 'free';

  const points = [
    { Icon: MapPin, ar: 'مستوى الطلب حسب المدينة والحي', en: 'Demand level by city & district' },
    { Icon: Activity, ar: 'إشارة الإشغال', en: 'Occupancy signal' },
    { Icon: LineChart, ar: 'إشارة السعر اليومي والإيراد', en: 'ADR & revenue signal' },
    { Icon: Lock, ar: 'اتساع رؤية السوق حسب خطتك', en: 'Market visibility scales with your plan' },
  ];

  return (
    <div className={`mt-8 p-6 rounded-2xl border ${dark ? 'bg-card border-foreground/[0.06]' : 'bg-white border-[#06131F]/[0.06]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
            <MapIcon className="h-5 w-5 text-[#1B84C4]" />
            {ar ? 'رؤى السوق والخريطة الحرارية' : 'Market Insights & Heatmap'}
          </h2>
          <p className={`mt-1 text-sm ${dark ? 'text-foreground/60' : 'text-[#06131F]/60'}`}>
            {ar
              ? 'اكتشف مناطق الطلب المرتفع وإشارات الإشغال المبنية على بيانات المنصة.'
              : 'Discover high-demand areas and occupancy signals built from platform data.'}
          </p>
        </div>
        <Link
          to="/market"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00548C] to-[#003152] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {ar ? 'افتح الخريطة الحرارية' : 'Open the Heatmap'}
          <Arrow className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {points.map((p) => (
          <li key={p.en} className={`flex items-center gap-2 text-sm ${dark ? 'text-foreground/75' : 'text-[#06131F]/75'}`}>
            <p.Icon className="h-4 w-4 shrink-0 text-[#0F6BA8]" />
            {ar ? p.ar : p.en}
          </li>
        ))}
      </ul>

      {/* Honesty disclaimer — mirrors the note on the heatmap itself. */}
      <p className={`mt-4 text-[11px] leading-relaxed ${dark ? 'text-foreground/45' : 'text-[#06131F]/45'}`}>
        {ar
          ? 'يعتمد هذا المؤشر على البيانات المتاحة داخل المنصة وقد لا يمثل السوق بالكامل.'
          : 'This indicator is based on data available within the platform and may not represent the entire market.'}
      </p>

      {/* Plan-gated upgrade nudge (free plan only). Actual gating is enforced
          on /market; this is just a discovery hint. */}
      {isFree && (
        <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${dark ? 'border-primary/30 bg-primary/10' : 'border-primary/30 bg-primary/5'}`}>
          <span className="flex items-center gap-2 text-sm text-primary">
            <Lock className="h-4 w-4" />
            {ar ? 'رؤية السوق الكاملة متاحة في الخطط الأعلى.' : 'Full market visibility is available on higher plans.'}
          </span>
          <Link to="/plans" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90">
            {ar ? 'عرض الخطط' : 'View Plans'}
          </Link>
        </div>
      )}
    </div>
  );
}
