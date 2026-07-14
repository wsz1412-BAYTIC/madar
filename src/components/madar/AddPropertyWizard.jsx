import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  WIZARD_STEPS, CITIES, PLATFORMS, UNIT_TYPES, AVAILABILITY, AMENITIES,
  EMPTY_FORM, validateStep, buildPropertyPayload,
} from '@/lib/propertyWizard';
import {
  parseListingUrl, findDuplicateLink, buildLinkEntry, DUPLICATE_LINK, IMPORT_SUCCESS,
} from '@/lib/listingImport';
import { scanListing } from '@/lib/listingScan';
import {
  X, ChevronLeft, ChevronRight, Check, Loader2, Minus, Plus, Building2, Home, ListChecks,
  Link2, Sparkles, Info, Trash2,
} from 'lucide-react';

const STEP_META = {
  basics: { icon: Building2, en: 'Basics', ar: 'الأساسيات' },
  details: { icon: Home, en: 'Unit details', ar: 'تفاصيل الوحدة' },
  extras: { icon: ListChecks, en: 'Optional', ar: 'اختياري' },
};

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

function Stepper({ value, onChange, min, max, label }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-foreground/70">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="decrease" onClick={() => onChange(Math.max(min, Number(value) - 1))}
          className="w-8 h-8 rounded-lg bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 hover:text-foreground flex items-center justify-center">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-foreground nums">{value}</span>
        <button type="button" aria-label="increase" onClick={() => onChange(Math.min(max, Number(value) + 1))}
          className="w-8 h-8 rounded-lg bg-foreground/[0.05] border border-foreground/[0.1] text-foreground/70 hover:text-foreground flex items-center justify-center">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AddPropertyWizard({ open, onClose, onCreated, initial = null }) {
  const { lang, isRTL } = useLang();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  // Widened so scan autofill can merge string patches over the frozen
  // EMPTY_FORM literals.
  const [form, setForm] = useState(/** @type {Record<string, any>} */ ({ ...EMPTY_FORM }));
  const [errors, setErrors] = useState(
    /** @type {Partial<Record<string, {en: string, ar: string}>>} */ ({})
  );
  const [saving, setSaving] = useState(false);
  // Listing-URL scan state (basics step): the URL box content, the in-flight
  // flag, and a bilingual note about the last scan outcome.
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState(
    /** @type {{tone: 'success'|'warn'|'error', text: {en: string, ar: string}} | null} */ (null)
  );
  // Extras step: the "add another platform link" box.
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [linkError, setLinkError] = useState(/** @type {{en: string, ar: string} | null} */ (null));

  // Seed prefilled values (e.g. platform + listing URL handed over from the
  // import-by-link flow) every time the wizard opens.
  React.useEffect(() => {
    if (open) {
      setStepIndex(0);
      setErrors({});
      setForm({ ...EMPTY_FORM, ...(initial || {}) });
      setScanUrl(initial?.platformUrl || '');
      setScanning(false);
      setScanNote(null);
      setNewLinkUrl('');
      setLinkError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const step = WIZARD_STEPS[stepIndex];
  const set = (key, val) => { setForm((p) => ({ ...p, [key]: val })); setErrors((e) => ({ ...e, [key]: undefined })); };
  const msg = (field) => errors[field] ? (lang === 'ar' ? errors[field].ar : errors[field].en) : null;
  const L = (opt) => (lang === 'ar' ? opt.ar : opt.en);

  const reset = () => {
    setStepIndex(0); setForm({ ...EMPTY_FORM }); setErrors({});
    setScanUrl(''); setScanning(false); setScanNote(null); setNewLinkUrl(''); setLinkError(null);
  };
  const close = () => { reset(); onClose(); };

  // ── Listing-URL scan (basics step) ──
  // Local validation → backend extraction → auto-fill (still editable).
  // Every failure shows a friendly bilingual note; raw errors never surface.
  const handleScan = async () => {
    if (scanning) return;
    const parsed = parseListingUrl(scanUrl);
    if (!parsed.valid) { setScanNote({ tone: 'error', text: parsed.error }); return; }
    const dup = findDuplicateLink(form.links, parsed.url, parsed.platform);
    if (dup) { setScanNote({ tone: 'error', text: DUPLICATE_LINK }); return; }
    setScanning(true);
    setScanNote(null);
    const result = await scanListing(scanUrl);
    setScanning(false);
    if (!result.form) { setScanNote({ tone: 'error', text: result.error }); return; }
    // Merge the scanned link into the existing list instead of replacing it.
    const mergedLinks = [...(form.links || [])];
    for (const link of result.form.links || []) {
      if (!findDuplicateLink(mergedLinks, link.url, link.platform)) mergedLinks.push(link);
    }
    setForm((p) => ({ ...p, ...result.form, links: mergedLinks }));
    setErrors({});
    setScanNote(result.ok ? { tone: 'success', text: IMPORT_SUCCESS } : { tone: 'warn', text: result.message });
  };

  // ── Multi-platform links (extras step) ──
  const addLink = () => {
    const parsed = parseListingUrl(newLinkUrl);
    if (!parsed.valid) { setLinkError(parsed.error); return; }
    if (findDuplicateLink(form.links, parsed.url, parsed.platform)) {
      setLinkError(DUPLICATE_LINK);
      return;
    }
    setForm((p) => ({ ...p, links: [...(p.links || []), buildLinkEntry(parsed.platform, parsed.url)] }));
    setNewLinkUrl('');
    setLinkError(null);
  };
  const removeLink = (url) => {
    setForm((p) => ({ ...p, links: (p.links || []).filter((l) => l.url !== url) }));
  };

  const next = () => {
    const { valid, errors: errs } = validateStep(step, form);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
  };
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const submit = async () => {
    const { valid, errors: errs } = validateStep('extras', form);
    if (!valid) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = buildPropertyPayload(user?.id, form);
      const created = await base44.entities.UserProperty.create(payload);
      toast({ description: lang === 'ar' ? 'تمت إضافة العقار بنجاح' : 'Property added successfully' });
      onCreated?.(created || payload);
      close();
    } catch (err) {
      toast({
        variant: 'destructive',
        description: (lang === 'ar' ? 'تعذر إضافة العقار' : 'Could not add the property') + (err?.message ? `: ${err.message}` : ''),
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20 focus:border-[#1B84C4]/50 transition-all ${
      errors[field] ? 'border-danger/60' : 'border-foreground/[0.08]'
    }`;
  const fieldError = (field) => msg(field) && <p className="text-xs text-danger mt-1">{msg(field)}</p>;
  const sectionLabel = 'block text-sm font-medium text-foreground/60 mb-1.5';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong bg-surface/95 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label={lang === 'ar' ? 'إضافة عقار' : 'Add property'}
          >
            {/* Header + progress */}
            <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md px-6 pt-5 pb-4 border-b border-foreground/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg text-foreground">
                  {lang === 'ar' ? 'إضافة عقار جديد' : 'Add a new property'}
                </h2>
                <button onClick={close} aria-label={lang === 'ar' ? 'إغلاق' : 'Close'} className="p-1.5 hover:bg-foreground/5 rounded-lg">
                  <X className="w-4 h-4 text-foreground/50" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {WIZARD_STEPS.map((s, i) => {
                  const Meta = STEP_META[s];
                  const done = i < stepIndex;
                  const current = i === stepIndex;
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex items-center gap-1.5 text-[11px] font-medium ${current ? 'text-[#1B84C4]' : done ? 'text-success' : 'text-foreground/35'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] nums ${
                          current ? 'border-[#1B84C4] bg-[#1B84C4]/10' : done ? 'border-success bg-success/10' : 'border-foreground/20'
                        }`}>
                          {done ? <Check className="w-3 h-3" /> : i + 1}
                        </span>
                        <span className="hidden sm:inline">{lang === 'ar' ? Meta.ar : Meta.en}</span>
                      </div>
                      {i < WIZARD_STEPS.length - 1 && <div className={`flex-1 h-px ${done ? 'bg-success/40' : 'bg-foreground/[0.08]'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {step === 'basics' && (
                <>
                  {/* Property URL — FIRST field, with Scan beside it. */}
                  <div>
                    <label htmlFor="wiz-scan-url" className={sectionLabel}>
                      {lang === 'ar' ? 'رابط الإعلان' : 'Property URL'}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Link2 className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-foreground/25" />
                        <input
                          id="wiz-scan-url" value={scanUrl} dir="ltr"
                          onChange={(e) => { setScanUrl(e.target.value); setScanNote(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
                          placeholder="https://airbnb.com/rooms/…"
                          className={`w-full ps-10 pe-3 py-3 rounded-xl bg-foreground/[0.04] border text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20 focus:border-[#1B84C4]/50 transition-all ${
                            scanNote?.tone === 'error' ? 'border-danger/60' : 'border-foreground/[0.08]'
                          }`}
                        />
                      </div>
                      <button
                        type="button" onClick={handleScan} disabled={scanning}
                        aria-label={lang === 'ar' ? 'معاينة' : 'Scan'}
                        className="shrink-0 flex items-center gap-1.5 px-4 h-[46px] rounded-xl bg-gradient-to-r from-[#00548C] to-[#003152] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all disabled:opacity-60"
                      >
                        {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span className="hidden sm:inline">{lang === 'ar' ? 'معاينة' : 'Scan'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-foreground/40 mt-1.5">
                      {lang === 'ar'
                        ? 'الصق رابط Airbnb أو Gathern أو Booking.com وسنعبّئ البيانات المتاحة — أو تابع يدويًا.'
                        : 'Paste an Airbnb, Gathern or Booking.com link and we will prefill what we can — or continue manually.'}
                    </p>
                    {scanNote && (
                      <div className={`flex items-start gap-2 p-3 rounded-xl border mt-2 ${
                        scanNote.tone === 'success' ? 'bg-success/10 border-success/25'
                          : scanNote.tone === 'warn' ? 'bg-warning/10 border-warning/25'
                            : 'bg-danger/10 border-danger/25'
                      }`}>
                        {scanNote.tone === 'success'
                          ? <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          : <Info className={`w-4 h-4 mt-0.5 shrink-0 ${scanNote.tone === 'warn' ? 'text-warning' : 'text-danger'}`} />}
                        <p className="text-xs text-foreground/75">{lang === 'ar' ? scanNote.text.ar : scanNote.text.en}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="wiz-name" className={sectionLabel}>{lang === 'ar' ? 'اسم العقار *' : 'Property name *'}</label>
                    <input id="wiz-name" value={form.name} onChange={(e) => set('name', e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: شقة العليا الفاخرة' : 'e.g. Olaya Luxury Apartment'} className={inputClass('name')} />
                    {fieldError('name')}
                  </div>
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
                    <label htmlFor="wiz-district" className={sectionLabel}>{lang === 'ar' ? 'الحي *' : 'District *'}</label>
                    <input id="wiz-district" value={form.district} onChange={(e) => set('district', e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: حي العليا' : 'e.g. Al Olaya'} className={inputClass('district')} />
                    {fieldError('district')}
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
                </>
              )}

              {step === 'details' && (
                <>
                  <div>
                    <span className={sectionLabel}>{lang === 'ar' ? 'نوع الوحدة *' : 'Unit type *'}</span>
                    <div className="flex flex-wrap gap-2">
                      {UNIT_TYPES.map((u) => (
                        <Chip key={u.value} selected={form.type === u.value} invalid={!!errors.type} onClick={() => set('type', u.value)}>{L(u)}</Chip>
                      ))}
                    </div>
                    {fieldError('type')}
                  </div>
                  <div className="rounded-xl border border-foreground/[0.08] px-4 py-2 divide-y divide-foreground/[0.06]">
                    <Stepper label={lang === 'ar' ? 'غرف النوم' : 'Bedrooms'} value={form.bedrooms} min={0} max={20} onChange={(v) => set('bedrooms', v)} />
                    <Stepper label={lang === 'ar' ? 'الحمامات' : 'Bathrooms'} value={form.bathrooms} min={1} max={20} onChange={(v) => set('bathrooms', v)} />
                    <Stepper label={lang === 'ar' ? 'أقصى عدد ضيوف' : 'Max guests'} value={form.guests} min={1} max={50} onChange={(v) => set('guests', v)} />
                  </div>
                  {fieldError('bedrooms')}{fieldError('bathrooms')}{fieldError('guests')}
                  <div>
                    <label htmlFor="wiz-price" className={sectionLabel}>{lang === 'ar' ? 'السعر لليلة (ر.س) *' : 'Nightly price (SAR) *'}</label>
                    <input id="wiz-price" type="number" min="1" inputMode="numeric" dir="ltr" value={form.nightlyPrice}
                      onChange={(e) => set('nightlyPrice', e.target.value)} placeholder="450" className={inputClass('nightlyPrice') + ' nums'} />
                    {fieldError('nightlyPrice')}
                  </div>
                  <div>
                    <span className={sectionLabel}>{lang === 'ar' ? 'حالة التوفر *' : 'Availability *'}</span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABILITY.map((a) => (
                        <Chip key={a.value} selected={form.status === a.value} onClick={() => set('status', a.value)}>{L(a)}</Chip>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 'extras' && (
                <>
                  <p className="text-xs text-foreground/45">
                    {lang === 'ar' ? 'كل الحقول هنا اختيارية — يمكنك التخطي والإضافة لاحقًا.' : 'Everything here is optional — you can skip and add later.'}
                  </p>
                  <div>
                    <span className={sectionLabel}>{lang === 'ar' ? 'المرافق' : 'Amenities'}</span>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((a) => (
                        <Chip key={a.value} selected={form.amenities.includes(a.value)}
                          onClick={() => set('amenities', form.amenities.includes(a.value) ? form.amenities.filter((x) => x !== a.value) : [...form.amenities, a.value])}>
                          {L(a)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wiz-photo" className={sectionLabel}>{lang === 'ar' ? 'رابط صورة' : 'Photo link'}</label>
                    <input id="wiz-photo" value={form.photoUrl} onChange={(e) => set('photoUrl', e.target.value)} dir="ltr"
                      placeholder="https://…" className={inputClass('photoUrl')} />
                    {fieldError('photoUrl')}
                  </div>
                  <div>
                    <span className={sectionLabel}>{lang === 'ar' ? 'روابط المنصات' : 'Platform links'}</span>
                    <p className="text-[11px] text-foreground/40 mb-2">
                      {lang === 'ar'
                        ? 'يمكن ربط العقار بأكثر من منصة: Airbnb وGathern وBooking.com — رابط واحد لكل منصة.'
                        : 'A property can be linked on several platforms: Airbnb, Gathern and Booking.com — one link per platform.'}
                    </p>
                    {(form.links || []).length > 0 && (
                      <ul className="space-y-1.5 mb-2">
                        {form.links.map((link) => (
                          <li key={link.url} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success shrink-0">{link.platform}</span>
                            <span className="text-xs text-foreground/50 truncate flex-1" dir="ltr">{link.url}</span>
                            <button type="button" onClick={() => removeLink(link.url)}
                              aria-label={lang === 'ar' ? `حذف رابط ${link.platform}` : `Remove ${link.platform} link`}
                              className="p-1 rounded-lg hover:bg-danger/10 text-foreground/35 hover:text-danger transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <input
                        id="wiz-link" value={newLinkUrl} dir="ltr"
                        onChange={(e) => { setNewLinkUrl(e.target.value); setLinkError(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                        aria-label={lang === 'ar' ? 'إضافة رابط منصة' : 'Add a platform link'}
                        placeholder="https://gathern.co/unit/…"
                        className={`flex-1 min-w-0 px-4 py-3 rounded-xl bg-foreground/[0.04] border text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B84C4]/20 focus:border-[#1B84C4]/50 transition-all ${
                          linkError ? 'border-danger/60' : 'border-foreground/[0.08]'
                        }`}
                      />
                      <button type="button" onClick={addLink}
                        className="shrink-0 px-4 h-[46px] rounded-xl bg-foreground/[0.05] border border-foreground/[0.1] text-sm text-foreground/70 hover:text-foreground transition-all">
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </button>
                    </div>
                    {linkError && <p className="text-xs text-danger mt-1">{lang === 'ar' ? linkError.ar : linkError.en}</p>}
                  </div>
                  <div>
                    <label htmlFor="wiz-notes" className={sectionLabel}>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
                    <textarea id="wiz-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3}
                      placeholder={lang === 'ar' ? 'أي تفاصيل إضافية…' : 'Any extra details…'} className={inputClass('notes') + ' resize-none'} />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md px-6 py-4 border-t border-foreground/[0.06] flex items-center justify-between gap-3">
              <button type="button" onClick={stepIndex === 0 ? close : back}
                className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-foreground/[0.05] border border-foreground/[0.1] text-sm text-foreground/70 hover:text-foreground transition-all">
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {stepIndex === 0 ? (lang === 'ar' ? 'إلغاء' : 'Cancel') : (lang === 'ar' ? 'السابق' : 'Back')}
              </button>
              {stepIndex < WIZARD_STEPS.length - 1 ? (
                <button type="button" onClick={next}
                  className="flex items-center gap-1.5 px-5 h-10 rounded-xl bg-gradient-to-r from-[#00548C] to-[#003152] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all">
                  {lang === 'ar' ? 'التالي' : 'Next'}
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={saving}
                  className="flex items-center gap-1.5 px-5 h-10 rounded-xl bg-gradient-to-r from-[#00548C] to-[#003152] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {lang === 'ar' ? 'إضافة العقار' : 'Add property'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
