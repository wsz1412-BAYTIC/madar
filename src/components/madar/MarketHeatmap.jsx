import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { HEATMAP_LEGEND, buildCellInsight } from '@/lib/marketHeatmap';
import {
  Map as MapIcon, Table2, Lock, MapPinOff, TrendingUp, TrendingDown, Minus, Info, RefreshCw,
} from 'lucide-react';

// Sequential single-hue (coral) intensity ramp — light→dark, validated as a
// sequential ramp (CVD-separated; in-cell labels + a table view provide the
// contrast relief the low steps need). Per theme so each is legible on its
// own surface. Index = intensity bucket 0..4; -1 (no data) → neutral.
const RAMP = {
  light: ['#FBE9E1', '#F4C3AE', '#E8926B', '#D95F3B', '#A83F22'],
  dark: ['#3A2A24', '#6E4433', '#A6543A', '#D95F3B', '#F0805C'],
};
const cellText = (bucket, theme) => {
  if (bucket < 0) return theme === 'dark' ? 'rgba(247,245,240,0.35)' : 'rgba(10,11,16,0.35)';
  if (bucket >= 2) return '#ffffff';
  return theme === 'dark' ? 'rgba(247,245,240,0.85)' : '#0A0B10';
};
const cellBg = (bucket, theme) =>
  bucket < 0 ? (theme === 'dark' ? 'rgba(247,245,240,0.05)' : 'rgba(10,11,16,0.04)') : RAMP[theme][bucket];

const L = (v, lang) => (typeof v === 'string' ? v : lang === 'ar' ? v?.ar : v?.en);

export default function MarketHeatmap() {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const { isAuthenticated, authChecked } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // {en,ar,upgrade?}
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('map');
  const [filters, setFilters] = useState({ city: 'all', propertyType: 'all', platform: 'all', segmentByType: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('market-heatmap', { filters });
      setData(res?.data || null);
    } catch (err) {
      const d = err?.response?.data || err?.data || {};
      if (d.upgrade) setError({ en: d.error_en, ar: d.error, upgrade: d.upgrade });
      else setError({ en: 'Could not load the heatmap. Please try again.', ar: 'تعذر تحميل الخريطة الحرارية. حاول مرة أخرى.' });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (authChecked && isAuthenticated) fetchData();
    else if (authChecked) setLoading(false);
  }, [authChecked, isAuthenticated, fetchData]);

  const cells = data?.cells || [];
  const cities = data?.cities || [];
  const access = data?.access || {};
  const cityOptions = useMemo(() => [...new Set(cells.map((c) => c.city))].sort(), [cells]);
  const selected = cells.find((c) => c.id === selectedId) || null;
  const grouped = useMemo(() => {
    const m = new Map();
    for (const c of cells) {
      if (!m.has(c.city)) m.set(c.city, []);
      m.get(c.city).push(c);
    }
    return [...m.entries()];
  }, [cells]);

  const card = theme === 'dark' ? 'bg-foreground/[0.03] border-foreground/[0.08]' : 'bg-white border-[#0A0B10]/10';

  // ── Guest / not-signed-in: honest gate, never fake data ──
  if (authChecked && !isAuthenticated) {
    return (
      <GateCard theme={theme} lang={lang}
        title={lang === 'ar' ? 'الخريطة الحرارية للسوق' : 'Market Heatmap'}
        body={lang === 'ar'
          ? 'شاهد شدة الطلب والإشغال حسب المدينة والحي. سجّل الدخول واشترك في باقة النمو أو أعلى لعرض بياناتك والسوق.'
          : 'See demand and occupancy intensity by city and neighborhood. Sign in and subscribe to Growth or higher to view your data and the market.'}
        cta={{ to: '/signup', label: lang === 'ar' ? 'ابدأ مجانًا' : 'Start free' }}
      />
    );
  }

  return (
    <section className={`rounded-2xl border ${card} p-4 sm:p-6`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-[#D95F3B]" />
            {lang === 'ar' ? 'الخريطة الحرارية للسوق' : 'Market Heatmap'}
          </h2>
          <p className="text-xs text-foreground/50 mt-1">
            {access.scope === 'market'
              ? (lang === 'ar' ? 'رؤية سوق مجهّلة حسب المدينة والحي' : 'Anonymized market view by city & neighborhood')
              : (lang === 'ar' ? 'خريطة محفظتك حسب المدينة والحي' : 'Your portfolio by city & neighborhood')}
            {access.tier && (
              <span className="ms-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#C8972A]/15 text-[#C8972A] uppercase">
                {access.tier}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <ViewToggle view={view} setView={setView} lang={lang} />
          <button type="button" onClick={fetchData} aria-label={lang === 'ar' ? 'تحديث' : 'Refresh'}
            className="p-2 rounded-lg bg-foreground/[0.05] border border-foreground/[0.08] text-foreground/60 hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterSelect value={filters.city} onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
          label={lang === 'ar' ? 'المدينة' : 'City'} theme={theme}
          options={[{ value: 'all', label: lang === 'ar' ? 'كل المدن' : 'All cities' }, ...cityOptions.map((c) => ({ value: c, label: c }))]} />
        <FilterSelect value={filters.propertyType} onChange={(v) => setFilters((f) => ({ ...f, propertyType: v }))}
          label={lang === 'ar' ? 'النوع' : 'Type'} theme={theme}
          options={[
            { value: 'all', label: lang === 'ar' ? 'كل الأنواع' : 'All types' },
            { value: 'apartment', label: lang === 'ar' ? 'شقة' : 'Apartment' },
            { value: 'villa', label: lang === 'ar' ? 'فيلا' : 'Villa' },
            { value: 'chalet', label: lang === 'ar' ? 'شاليه' : 'Chalet' },
            { value: 'townhouse', label: lang === 'ar' ? 'تاون هاوس' : 'Townhouse' },
          ]} />
        <FilterSelect value={filters.platform} onChange={(v) => setFilters((f) => ({ ...f, platform: v }))}
          label={lang === 'ar' ? 'المنصة' : 'Platform'} theme={theme}
          options={[
            { value: 'all', label: lang === 'ar' ? 'كل المنصات' : 'All platforms' },
            { value: 'Airbnb', label: 'Airbnb' }, { value: 'Gathern', label: 'Gathern' }, { value: 'Booking.com', label: 'Booking.com' },
          ]} />
        {access.dateRange && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground/[0.05] border border-foreground/[0.08] text-xs text-foreground/60">
            <span>{lang === 'ar' ? 'الفترة' : 'Range'}</span>
            <input type="date" dir="ltr" onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="bg-transparent text-foreground/80 outline-none nums" aria-label={lang === 'ar' ? 'من تاريخ' : 'From date'} />
            <span>—</span>
            <input type="date" dir="ltr" onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="bg-transparent text-foreground/80 outline-none nums" aria-label={lang === 'ar' ? 'إلى تاريخ' : 'To date'} />
          </div>
        )}
      </div>

      {/* States */}
      {loading ? (
        <HeatmapSkeleton />
      ) : error ? (
        error.upgrade ? (
          <GateCard inline theme={theme} lang={lang}
            title={lang === 'ar' ? 'الترقية مطلوبة' : 'Upgrade required'}
            body={L(error, lang)}
            cta={{ to: '/billing', label: lang === 'ar' ? 'عرض الباقات' : 'View plans' }} />
        ) : (
          <ErrorState lang={lang} onRetry={fetchData} message={L(error, lang)} />
        )
      ) : !data?.hasData ? (
        <EmptyState lang={lang} scope={access.scope} minSample={data?.meta?.minSample} />
      ) : view === 'table' ? (
        <HeatmapTable cells={cells} lang={lang} theme={theme} />
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-[11px] text-foreground/60">
            <span className="font-medium text-foreground/70">{lang === 'ar' ? 'شدة الإشغال:' : 'Occupancy intensity:'}</span>
            {HEATMAP_LEGEND.map((lg) => (
              <span key={lg.bucket} className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm border border-black/5" style={{ background: cellBg(lg.bucket, theme) }} />
                {L(lg, lang)} <span className="text-foreground/40 nums" dir="ltr">{lg.range}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm border border-black/5" style={{ background: cellBg(-1, theme) }} />
              {lang === 'ar' ? 'لا بيانات' : 'No data'}
            </span>
          </div>

          {/* City comparison strip (Pro/Business) */}
          {access.comparisons && cities.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {cities.slice(0, 8).map((c) => (
                <div key={c.city} className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] text-xs">
                  <span className="font-medium text-foreground/80">{c.city}</span>
                  <span className="text-foreground/45 nums ms-1.5" dir="ltr">
                    {c.medianOccupancy != null ? `${c.medianOccupancy}%` : '—'}
                    {c.medianAdr != null ? ` · ${c.medianAdr} SAR` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Heatmap grid: cities as bands, districts as colored cells */}
          <div className="space-y-4">
            {grouped.map(([city, cityCells]) => (
              <div key={city}>
                <div className="text-xs font-semibold text-foreground/50 mb-1.5">{city}</div>
                <div className="flex flex-wrap gap-1.5">
                  {cityCells.map((c) => (
                    <button key={c.id} type="button" onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                      title={`${c.district} · ${c.occupancy != null ? c.occupancy + '%' : (lang === 'ar' ? 'لا بيانات' : 'no data')}`}
                      aria-label={`${c.district}, ${c.city}${c.occupancy != null ? `, ${c.occupancy}% ${lang === 'ar' ? 'إشغال' : 'occupancy'}` : ''}`}
                      className={`relative min-w-[92px] px-3 py-2.5 rounded-lg text-start transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/40 ${c.id === selectedId ? 'ring-2 ring-[#D95F3B]' : ''}`}
                      style={{ background: cellBg(c.intensity, theme), color: cellText(c.intensity, theme) }}>
                      <div className="text-[11px] font-medium leading-tight truncate max-w-[120px]">{c.district}</div>
                      <div className="text-sm font-bold nums" dir="ltr">{c.occupancy != null ? `${c.occupancy}%` : '—'}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected-area detail */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden">
                <CellDetail cell={selected} lang={lang} theme={theme} />
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-4 text-[10px] text-foreground/40 leading-relaxed">
            {lang === 'ar'
              ? `المصدر: بيانات عقارات مدار الحقيقية${access.scope === 'market' ? ` (مجهّلة، لا تُعرض منطقة بأقل من ${data?.meta?.minSample} عقارات)` : ''}. «الاتجاه» نسبي مقارنةً بمتوسط المدينة وليس سلسلة زمنية.`
              : `Source: real Madar property data${access.scope === 'market' ? ` (anonymized; areas backed by fewer than ${data?.meta?.minSample} properties are hidden)` : ''}. "Trend" is relative to the city median, not a time series.`}
          </p>
        </>
      )}
    </section>
  );
}

function ViewToggle({ view, setView, lang }) {
  return (
    <div className="flex items-center rounded-lg bg-foreground/[0.05] border border-foreground/[0.08] p-0.5">
      {[{ k: 'map', Icon: MapIcon, l: lang === 'ar' ? 'خريطة' : 'Map' }, { k: 'table', Icon: Table2, l: lang === 'ar' ? 'جدول' : 'Table' }].map(({ k, Icon, l }) => (
        <button key={k} type="button" onClick={() => setView(k)} aria-pressed={view === k}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors ${view === k ? 'bg-[#D95F3B] text-white' : 'text-foreground/60 hover:text-foreground'}`}>
          <Icon className="w-3.5 h-3.5" />{l}
        </button>
      ))}
    </div>
  );
}

function FilterSelect({ value, onChange, label, options, theme }) {
  return (
    <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground/[0.05] border border-foreground/[0.08] text-xs text-foreground/60">
      <span className="text-foreground/45">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`bg-transparent text-foreground/80 outline-none cursor-pointer ${theme === 'dark' ? '[&>option]:bg-[#12141c]' : '[&>option]:bg-white'}`}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus, unknown: Minus };
function CellDetail({ cell, lang, theme }) {
  const Tr = TREND_ICON[cell.trend?.direction] || Minus;
  const trendColor = cell.trend?.direction === 'up' ? 'text-success' : cell.trend?.direction === 'down' ? 'text-danger' : 'text-foreground/50';
  // Grounded, bilingual, tested — same helper the backend logic uses.
  const insight = buildCellInsight(cell, cell.trend, lang);
  const stat = (label, value) => (
    <div className="flex-1 min-w-[110px]">
      <div className="text-[10px] uppercase tracking-wide text-foreground/40">{label}</div>
      <div className="text-lg font-bold text-foreground nums" dir="ltr">{value}</div>
    </div>
  );
  return (
    <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'bg-foreground/[0.04] border-foreground/[0.08]' : 'bg-[#F2EFE8] border-[#0A0B10]/10'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-foreground">{cell.district} <span className="text-foreground/40 font-normal">· {cell.city}</span></h3>
        <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <Tr className="w-3.5 h-3.5" />
          {cell.trend?.direction === 'up' ? (lang === 'ar' ? 'طلب أعلى' : 'Above avg')
            : cell.trend?.direction === 'down' ? (lang === 'ar' ? 'طلب أقل' : 'Below avg')
            : (lang === 'ar' ? 'متوسط' : 'On par')}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 mb-3">
        {stat(lang === 'ar' ? 'الإشغال' : 'Occupancy', cell.occupancy != null ? `${cell.occupancy}%` : '—')}
        {stat(lang === 'ar' ? 'متوسط السعر' : 'ADR', cell.adr != null ? `${cell.adr} SAR` : '—')}
        {stat(lang === 'ar' ? 'عدد العينة' : 'Sample', cell.sampleCount)}
      </div>
      <div className="flex items-start gap-2 text-xs text-foreground/70 leading-relaxed">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C8972A]" />
        <p>{insight}</p>
      </div>
    </div>
  );
}

function HeatmapTable({ cells, lang, theme }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-foreground/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className={`text-start ${theme === 'dark' ? 'bg-foreground/[0.04]' : 'bg-[#0A0B10]/[0.03]'}`}>
            {[lang === 'ar' ? 'المدينة' : 'City', lang === 'ar' ? 'الحي' : 'District', lang === 'ar' ? 'الإشغال' : 'Occupancy', lang === 'ar' ? 'السعر' : 'ADR', lang === 'ar' ? 'العينة' : 'Sample'].map((h) => (
              <th key={h} className="text-start font-medium text-foreground/60 px-3 py-2 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.map((c) => (
            <tr key={c.id} className="border-t border-foreground/[0.06]">
              <td className="px-3 py-2 text-foreground/70 whitespace-nowrap">{c.city}</td>
              <td className="px-3 py-2 text-foreground/90 whitespace-nowrap">{c.district}</td>
              <td className="px-3 py-2 text-foreground nums" dir="ltr">{c.occupancy != null ? `${c.occupancy}%` : '—'}</td>
              <td className="px-3 py-2 text-foreground/80 nums" dir="ltr">{c.adr != null ? `${c.adr}` : '—'}</td>
              <td className="px-3 py-2 text-foreground/60 nums" dir="ltr">{c.sampleCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[0, 1].map((r) => (
        <div key={r}>
          <div className="h-3 w-24 bg-foreground/[0.08] rounded mb-2" />
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-[92px] h-[52px] bg-foreground/[0.06] rounded-lg" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ lang, scope, minSample }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <MapPinOff className="w-10 h-10 text-foreground/25 mb-3" />
      <p className="text-sm font-medium text-foreground/70 mb-1">
        {lang === 'ar' ? 'لا توجد بيانات خريطة حرارية بعد' : 'No heatmap data yet'}
      </p>
      <p className="text-xs text-foreground/45 max-w-sm">
        {scope === 'market'
          ? (lang === 'ar'
            ? `لا توجد مناطق تحقق الحد الأدنى للعينة (${minSample} عقارات) حتى الآن. ستظهر البيانات مع نمو التغطية.`
            : `No areas meet the minimum sample size (${minSample} properties) yet. Coverage grows as more data accrues.`)
          : (lang === 'ar'
            ? 'أضف عقاراتك مع بيانات الإشغال لعرض خريطتك الحرارية. لا نعرض بيانات وهمية.'
            : 'Add properties with occupancy data to see your heatmap. We never show fabricated data.')}
      </p>
    </div>
  );
}

function ErrorState({ lang, message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <p className="text-sm text-foreground/70 mb-3">{message}</p>
      <button type="button" onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D95F3B] text-white text-sm font-medium hover:shadow-lg transition-all">
        <RefreshCw className="w-3.5 h-3.5" />{lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>
  );
}

function GateCard({ theme, lang, title, body, cta, inline = false }) {
  return (
    <div className={`${inline ? '' : 'rounded-2xl border'} ${theme === 'dark' ? 'bg-primary/[0.06] border-primary/20' : 'bg-primary/5 border-primary/20'} p-6 text-center`}>
      <Lock className="w-8 h-8 text-[#D95F3B] mx-auto mb-3" />
      <h3 className="font-heading font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground/60 max-w-md mx-auto mb-4">{body}</p>
      <Link to={cta.to} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium hover:shadow-lg transition-all">
        {cta.label}
      </Link>
    </div>
  );
}
