import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { FadeIn } from '@/components/madar/Motion';
import { CITIES, UNIT_TYPES, PLATFORMS } from '@/lib/propertyWizard';
import {
  Briefcase, Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle,
  Crown, History, Info, KeyRound, Home,
} from 'lucide-react';

// The AI Investment Consultant: Pro can analyze annual-lease deals, Business
// can also analyze purchase deals. Plan gating is enforced server-side — the
// UI only renders the friendly upgrade panel when the backend says so.

const VERDICT_META = {
  proceed: {
    en: 'Proceed with the deal', ar: 'امضِ في الصفقة',
    Icon: CheckCircle2, wrap: 'bg-success/10 border-success/30', text: 'text-success',
  },
  renegotiate: {
    en: 'Renegotiate the terms', ar: 'أعد التفاوض على الشروط',
    Icon: AlertTriangle, wrap: 'bg-warning/10 border-warning/30', text: 'text-warning',
  },
  avoid: {
    en: 'Avoid this deal', ar: 'تجنّب هذه الصفقة',
    Icon: XCircle, wrap: 'bg-danger/10 border-danger/30', text: 'text-danger',
  },
};

const EMPTY_FORM = {
  city: '', district: '', unitType: '', platform: '', bedrooms: 1,
  askingRent: '', askingPrice: '', expectedNightlyRate: '', expectedOccupancy: '',
  monthlyOperatingCosts: '',
};

const fmt = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-US') : '—');

function Chip({ selected, onClick, children, invalid = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
        selected
          ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white border-transparent shadow-sm'
          : `bg-foreground/[0.03] text-foreground/65 hover:text-foreground hover:border-foreground/25 ${invalid ? 'border-danger/40' : 'border-foreground/[0.08]'}`
      }`}
    >
      {children}
    </button>
  );
}

function StatTile({ label, value, sub = null, chip = null }) {
  return (
    <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] text-foreground/45">{label}</p>
        {chip && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning">{chip}</span>
        )}
      </div>
      <p className="text-lg font-bold text-foreground nums mt-1" dir="ltr">{value}</p>
      {sub && <p className="text-[11px] text-foreground/40 nums mt-0.5" dir="ltr">{sub}</p>}
    </div>
  );
}

function BilingualList({ items, lang, tone }) {
  return (
    <ol className="space-y-2">
      {(items || []).slice(0, 3).map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold nums shrink-0 mt-0.5 ${
            tone === 'risk' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
          }`}>
            {i + 1}
          </span>
          <p className="text-sm text-foreground/75">{lang === 'ar' ? item.ar : item.en}</p>
        </li>
      ))}
    </ol>
  );
}

function AnalysisResult({ analysis, lang }) {
  if (!analysis) return null;
  const verdict = VERDICT_META[analysis.verdict] || VERDICT_META.renegotiate;
  const VerdictIcon = verdict.Icon;
  const score = Math.max(0, Math.min(100, Number(analysis.dealStrength?.score) || 0));
  const net = analysis.expectedNetRevenue || {};
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';
  const estChip = net.feeEstimated ? (lang === 'ar' ? 'تقديري' : 'estimate') : null;

  return (
    <div className="space-y-5">
      {/* Verdict banner */}
      <div className={`flex items-center gap-3 p-5 rounded-2xl border ${verdict.wrap}`}>
        <VerdictIcon className={`w-8 h-8 shrink-0 ${verdict.text}`} />
        <div>
          <p className={`font-heading font-bold text-lg ${verdict.text}`}>
            {lang === 'ar' ? verdict.ar : verdict.en}
          </p>
          {analysis.source === 'fallback' && (
            <p className="text-[11px] text-foreground/45 mt-0.5">
              {lang === 'ar' ? 'تحليل مبسّط — تعذر الوصول لمحرك الذكاء الاصطناعي.' : 'Simplified analysis — the AI engine was unavailable.'}
            </p>
          )}
        </div>
      </div>

      {/* Deal strength */}
      <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground/70">
            {lang === 'ar' ? 'قوة الصفقة' : 'Deal strength'}
            {analysis.dealStrength?.label && (
              <span className="text-foreground/45 font-normal ms-2">
                — {lang === 'ar' ? analysis.dealStrength.label.ar : analysis.dealStrength.label.en}
              </span>
            )}
          </p>
          <p className="text-sm font-bold text-foreground nums" dir="ltr">{score}/100</p>
        </div>
        <div className="h-2 rounded-full bg-foreground/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00548C] to-[#003152] transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatTile
          label={lang === 'ar' ? 'صافي الإيراد الشهري' : 'Net revenue / month'}
          value={`${fmt(net.monthly)} ${sar}`}
          sub={`${fmt(net.annual)} ${sar} ${lang === 'ar' ? 'سنويًا' : '/ year'}`}
          chip={estChip}
        />
        {analysis.roiEstimate != null && (
          <StatTile label={lang === 'ar' ? 'العائد على الاستثمار' : 'ROI estimate'} value={`${fmt(analysis.roiEstimate)}%`} />
        )}
        {analysis.rentPriceGap != null && (
          <StatTile
            label={lang === 'ar' ? 'فجوة السعر عن السوق' : 'Rent/price gap vs market'}
            value={`${fmt(analysis.rentPriceGap)}%`}
          />
        )}
        <StatTile
          label={lang === 'ar' ? 'احتمالية نجاح التفاوض' : 'Negotiation probability'}
          value={`${fmt(analysis.negotiationProbability)}%`}
        />
        {analysis.counterOffer != null && (
          <StatTile label={lang === 'ar' ? 'العرض المضاد المقترح' : 'Suggested counter-offer'} value={`${fmt(analysis.counterOffer)} ${sar}`} />
        )}
      </div>

      {/* Risks + actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
          <p className="text-sm font-semibold text-foreground mb-3">
            {lang === 'ar' ? 'أهم المخاطر' : 'Top risks'}
          </p>
          <BilingualList items={analysis.risks} lang={lang} tone="risk" />
        </div>
        <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
          <p className="text-sm font-semibold text-foreground mb-3">
            {lang === 'ar' ? 'الخطوات المقترحة' : 'Recommended actions'}
          </p>
          <BilingualList items={analysis.actions} lang={lang} tone="action" />
        </div>
      </div>

      {/* Arabic narrative */}
      {analysis.strNarrativeAr && (
        <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
          <p className="text-sm text-foreground/75 leading-relaxed" dir="rtl">{analysis.strNarrativeAr}</p>
        </div>
      )}

      {/* Disclaimer — always shown */}
      {analysis.disclaimer && (
        <p className="text-[11px] text-foreground/40 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-px shrink-0" />
          <span>{lang === 'ar' ? analysis.disclaimer.ar : analysis.disclaimer.en}</span>
        </p>
      )}
    </div>
  );
}

export default function InvestmentConsultant() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [analysisType, setAnalysisType] = useState('lease');
  // Widened so numeric fields can hold the input's string values.
  const [form, setForm] = useState(/** @type {Record<string, any>} */ ({ ...EMPTY_FORM }));
  const [errors, setErrors] = useState(
    /** @type {Partial<Record<string, {en: string, ar: string}>>} */ ({})
  );
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const [errorPanel, setErrorPanel] = useState(null); // { type: 'upgrade', data } | { type: 'generic' }
  const [history, setHistory] = useState([]);
  const [openHistoryId, setOpenHistoryId] = useState(null);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const L = (opt) => (lang === 'ar' ? opt.ar : opt.en);
  const msg = (field) => (errors[field] ? (lang === 'ar' ? errors[field].ar : errors[field].en) : null);
  const fieldError = (field) => msg(field) && <p className="text-xs text-danger mt-1">{msg(field)}</p>;

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20 focus:border-[#1B84C4]/50 transition-all ${
      errors[field] ? 'border-danger/60' : 'border-foreground/[0.08]'
    }`;
  const sectionLabel = 'block text-sm font-medium text-foreground/60 mb-1.5';

  // Saved analyses — hidden entirely if the entity isn't deployed yet.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.InvestmentAnalysis.filter({ userId: user.id });
        if (!cancelled && Array.isArray(rows)) setHistory(rows);
      } catch {
        /* entity not available yet — hide the history section */
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const validate = () => {
    const errs = {};
    const need = (field, en, ar) => { errs[field] = { en, ar }; };
    if (!form.city) need('city', 'Choose a city', 'اختر المدينة');
    if (!form.unitType) need('unitType', 'Choose the unit type', 'اختر نوع الوحدة');
    if (!form.platform) need('platform', 'Choose the platform', 'اختر المنصة');
    const bedrooms = Number(form.bedrooms);
    if (!Number.isFinite(bedrooms) || bedrooms < 0 || bedrooms > 20 || form.bedrooms === '') {
      need('bedrooms', 'Bedrooms must be between 0 and 20', 'عدد الغرف يجب أن يكون بين 0 و20');
    }
    if (analysisType === 'lease') {
      const rent = Number(form.askingRent);
      if (!Number.isFinite(rent) || rent <= 0 || form.askingRent === '') {
        need('askingRent', 'Enter the annual asking rent in SAR', 'أدخل الإيجار السنوي المطلوب بالريال');
      }
    } else {
      const price = Number(form.askingPrice);
      if (!Number.isFinite(price) || price <= 0 || form.askingPrice === '') {
        need('askingPrice', 'Enter the asking price in SAR', 'أدخل سعر الشراء المطلوب بالريال');
      }
    }
    const nightly = Number(form.expectedNightlyRate);
    if (!Number.isFinite(nightly) || nightly <= 0 || form.expectedNightlyRate === '') {
      need('expectedNightlyRate', 'Enter the expected nightly rate in SAR', 'أدخل السعر المتوقع لليلة بالريال');
    }
    const occ = Number(form.expectedOccupancy);
    if (!Number.isFinite(occ) || occ < 0 || occ > 100 || form.expectedOccupancy === '') {
      need('expectedOccupancy', 'Expected occupancy must be between 0 and 100', 'نسبة الإشغال المتوقعة يجب أن تكون بين 0 و100');
    }
    if (form.monthlyOperatingCosts !== '' && (!Number.isFinite(Number(form.monthlyOperatingCosts)) || Number(form.monthlyOperatingCosts) < 0)) {
      need('monthlyOperatingCosts', 'Operating costs must be a positive number', 'التكاليف التشغيلية يجب أن تكون رقمًا موجبًا');
    }
    return errs;
  };

  const analyze = async () => {
    if (pending) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setPending(true);
    setErrorPanel(null);
    setResult(null);
    setOpenHistoryId(null);
    try {
      const input = {
        city: form.city,
        district: form.district.trim() || null,
        unitType: form.unitType,
        bedrooms: Number(form.bedrooms),
        platform: form.platform,
        expectedNightlyRate: Number(form.expectedNightlyRate),
        expectedOccupancy: Number(form.expectedOccupancy),
        monthlyOperatingCosts: form.monthlyOperatingCosts === '' ? null : Number(form.monthlyOperatingCosts),
      };
      if (analysisType === 'lease') input.askingRent = Number(form.askingRent);
      else input.askingPrice = Number(form.askingPrice);

      const res = await base44.functions.invoke('ai-investment-consultant', {
        action: 'analyze',
        analysisType,
        input,
      });
      const analysis = res?.data?.analysis;
      if (!analysis) throw new Error('empty_analysis');
      setResult(analysis);
      // Refresh history quietly — ignore failures.
      if (user?.id) {
        try {
          const rows = await base44.entities.InvestmentAnalysis.filter({ userId: user.id });
          if (Array.isArray(rows)) setHistory(rows);
        } catch { /* ignore */ }
      }
    } catch (err) {
      // Friendly errors only — raw exception strings never reach the UI.
      const data = err?.response?.data || err?.data || {};
      if (data.upgrade) setErrorPanel({ type: 'upgrade', data });
      else setErrorPanel({ type: 'generic' });
    } finally {
      setPending(false);
    }
  };

  // Saved records may hold the analysis nested or flat — normalize both.
  const recordAnalysis = (rec) => (rec?.analysis && typeof rec.analysis === 'object' ? rec.analysis : rec);
  const recordDate = (rec) => {
    const d = rec?.createdAt || rec?.created_date || recordAnalysis(rec)?.createdAt;
    const parsed = d ? new Date(d) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : '—';
  };

  const typeLabel = (type) =>
    type === 'purchase' ? (lang === 'ar' ? 'شراء' : 'Purchase') : (lang === 'ar' ? 'إيجار سنوي' : 'Annual lease');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#1B84C4]" />
            {lang === 'ar' ? 'المستشار الاستثماري الذكي' : 'AI Investment Consultant'}
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            {lang === 'ar'
              ? 'حلّل صفقات الإيجار السنوي والشراء قبل الالتزام بها — تحليل استشاري فقط ولا يُعد نصيحة مالية.'
              : 'Analyze annual-lease and purchase deals before you commit — advisory only, not financial advice.'}
          </p>
        </div>
      </FadeIn>

      {/* Analysis type toggle */}
      <FadeIn delay={0.05}>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setAnalysisType('lease')}
            aria-pressed={analysisType === 'lease'}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              analysisType === 'lease'
                ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white border-transparent shadow-sm'
                : 'bg-foreground/[0.03] text-foreground/65 border-foreground/[0.08] hover:text-foreground'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            {lang === 'ar' ? 'تحليل إيجار سنوي' : 'Annual lease'}
          </button>
          <button
            type="button"
            onClick={() => setAnalysisType('purchase')}
            aria-pressed={analysisType === 'purchase'}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              analysisType === 'purchase'
                ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white border-transparent shadow-sm'
                : 'bg-foreground/[0.03] text-foreground/65 border-foreground/[0.08] hover:text-foreground'
            }`}
          >
            <Home className="w-4 h-4" />
            {lang === 'ar' ? 'تحليل شراء' : 'Purchase'}
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#ADDFF1]/20 text-[#0F6BA8]">Business</span>
          </button>
        </div>
      </FadeIn>

      {/* Form */}
      <FadeIn delay={0.1}>
        <div className="p-5 md:p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.08] space-y-5">
          <div>
            <span className={sectionLabel}>{lang === 'ar' ? 'المدينة *' : 'City *'}</span>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Chip key={c.value} selected={form.city === c.value} invalid={!!errors.city} onClick={() => set('city', c.value)}>{L(c)}</Chip>
              ))}
            </div>
            {fieldError('city')}
          </div>

          <div>
            <label htmlFor="ic-district" className={sectionLabel}>{lang === 'ar' ? 'الحي' : 'District'}</label>
            <input
              id="ic-district" value={form.district} onChange={(e) => set('district', e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: حي العليا' : 'e.g. Al Olaya'} className={inputClass('district')}
            />
          </div>

          <div>
            <span className={sectionLabel}>{lang === 'ar' ? 'نوع الوحدة *' : 'Unit type *'}</span>
            <div className="flex flex-wrap gap-2">
              {UNIT_TYPES.map((u) => (
                <Chip key={u.value} selected={form.unitType === u.value} invalid={!!errors.unitType} onClick={() => set('unitType', u.value)}>{L(u)}</Chip>
              ))}
            </div>
            {fieldError('unitType')}
          </div>

          <div>
            <span className={sectionLabel}>{lang === 'ar' ? 'المنصة *' : 'Platform *'}</span>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <Chip key={p.value} selected={form.platform === p.value} invalid={!!errors.platform} onClick={() => set('platform', p.value)}>{L(p)}</Chip>
              ))}
            </div>
            {fieldError('platform')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ic-bedrooms" className={sectionLabel}>{lang === 'ar' ? 'غرف النوم' : 'Bedrooms'}</label>
              <input
                id="ic-bedrooms" type="number" min="0" max="20" inputMode="numeric" dir="ltr"
                value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}
                className={inputClass('bedrooms') + ' nums'}
              />
              {fieldError('bedrooms')}
            </div>

            {analysisType === 'lease' ? (
              <div>
                <label htmlFor="ic-rent" className={sectionLabel}>
                  {lang === 'ar' ? 'الإيجار السنوي المطلوب (ر.س) *' : 'Annual asking rent (SAR) *'}
                </label>
                <input
                  id="ic-rent" type="number" min="1" inputMode="numeric" dir="ltr"
                  value={form.askingRent} onChange={(e) => set('askingRent', e.target.value)}
                  placeholder="80000" className={inputClass('askingRent') + ' nums'}
                />
                {fieldError('askingRent')}
              </div>
            ) : (
              <div>
                <label htmlFor="ic-price" className={sectionLabel}>
                  {lang === 'ar' ? 'سعر الشراء المطلوب (ر.س) *' : 'Asking price (SAR) *'}
                </label>
                <input
                  id="ic-price" type="number" min="1" inputMode="numeric" dir="ltr"
                  value={form.askingPrice} onChange={(e) => set('askingPrice', e.target.value)}
                  placeholder="850000" className={inputClass('askingPrice') + ' nums'}
                />
                {fieldError('askingPrice')}
              </div>
            )}

            <div>
              <label htmlFor="ic-nightly" className={sectionLabel}>
                {lang === 'ar' ? 'السعر المتوقع لليلة (ر.س) *' : 'Expected nightly rate (SAR) *'}
              </label>
              <input
                id="ic-nightly" type="number" min="1" inputMode="numeric" dir="ltr"
                value={form.expectedNightlyRate} onChange={(e) => set('expectedNightlyRate', e.target.value)}
                placeholder="450" className={inputClass('expectedNightlyRate') + ' nums'}
              />
              {fieldError('expectedNightlyRate')}
            </div>

            <div>
              <label htmlFor="ic-occupancy" className={sectionLabel}>
                {lang === 'ar' ? 'نسبة الإشغال المتوقعة (٪) *' : 'Expected occupancy (%) *'}
              </label>
              <input
                id="ic-occupancy" type="number" min="0" max="100" inputMode="numeric" dir="ltr"
                value={form.expectedOccupancy} onChange={(e) => set('expectedOccupancy', e.target.value)}
                placeholder="65" className={inputClass('expectedOccupancy') + ' nums'}
              />
              {fieldError('expectedOccupancy')}
            </div>

            <div>
              <label htmlFor="ic-costs" className={sectionLabel}>
                {lang === 'ar' ? 'التكاليف التشغيلية الشهرية (ر.س)' : 'Monthly operating costs (SAR)'}
              </label>
              <input
                id="ic-costs" type="number" min="0" inputMode="numeric" dir="ltr"
                value={form.monthlyOperatingCosts} onChange={(e) => set('monthlyOperatingCosts', e.target.value)}
                placeholder="1500" className={inputClass('monthlyOperatingCosts') + ' nums'}
              />
              {fieldError('monthlyOperatingCosts')}
            </div>
          </div>

          <button
            type="button" onClick={analyze} disabled={pending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-[#00548C] to-[#003152] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all disabled:opacity-60"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {lang === 'ar' ? 'تحليل الصفقة' : 'Analyze deal'}
          </button>
        </div>
      </FadeIn>

      {/* Upgrade panel */}
      {errorPanel?.type === 'upgrade' && (
        <FadeIn>
          <div className="p-6 rounded-2xl border border-[#ADDFF1]/30 bg-gradient-to-br from-[#1B84C4]/10 to-[#ADDFF1]/10 text-center space-y-3">
            <Crown className="w-9 h-9 mx-auto text-[#0F6BA8]" />
            <h2 className="font-heading font-bold text-foreground">
              {lang === 'ar' ? 'هذه الميزة تتطلب ترقية باقتك' : 'This feature requires a plan upgrade'}
            </h2>
            <p className="text-sm text-foreground/60 max-w-md mx-auto">
              {lang === 'ar'
                ? (errorPanel.data.error || 'هذه الميزة غير متاحة في باقتك الحالية.')
                : (errorPanel.data.error_en || 'This feature is not available on your current plan.')}
            </p>
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-[#00548C] to-[#003152] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all"
            >
              <Crown className="w-4 h-4" />
              {lang === 'ar' ? 'ترقية الباقة' : 'Upgrade plan'}
            </Link>
          </div>
        </FadeIn>
      )}

      {/* Generic error */}
      {errorPanel?.type === 'generic' && (
        <FadeIn>
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-danger/10 border border-danger/25">
            <AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/75">
              {lang === 'ar'
                ? 'تعذر تحليل الصفقة حاليًا — يرجى المحاولة مرة أخرى بعد قليل.'
                : 'We could not analyze this deal right now — please try again in a moment.'}
            </p>
          </div>
        </FadeIn>
      )}

      {/* Result */}
      {result && (
        <FadeIn>
          <AnalysisResult analysis={result} lang={lang} />
        </FadeIn>
      )}

      {/* Past analyses */}
      {history.length > 0 && (
        <FadeIn>
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-foreground/40" />
              {lang === 'ar' ? 'تحليلات سابقة' : 'Past analyses'}
            </h2>
            <ul className="space-y-2">
              {history.map((rec, i) => {
                const a = recordAnalysis(rec);
                const id = rec.id || `h-${i}`;
                const verdict = VERDICT_META[a?.verdict];
                const open = openHistoryId === id;
                return (
                  <li key={id} className="rounded-xl bg-foreground/[0.02] border border-foreground/[0.08] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenHistoryId(open ? null : id)}
                      className="w-full flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 px-4 py-3 text-start hover:bg-foreground/[0.03] transition-colors"
                    >
                      <span className="text-xs text-foreground/45 nums" dir="ltr">{recordDate(rec)}</span>
                      <span className="text-xs font-medium text-foreground/70">{typeLabel(a?.analysisType)}</span>
                      {verdict && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${verdict.wrap} ${verdict.text} w-fit`}>
                          {lang === 'ar' ? verdict.ar : verdict.en}
                        </span>
                      )}
                      <span className="text-xs text-foreground/50 nums sm:ms-auto" dir="ltr">
                        {fmt(a?.expectedNetRevenue?.monthly)} {lang === 'ar' ? 'ر.س/شهر' : 'SAR/mo'}
                      </span>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-1 border-t border-foreground/[0.06]">
                        <AnalysisResult analysis={a} lang={lang} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
