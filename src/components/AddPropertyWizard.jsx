import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  WIZARD_STEPS, CITIES, PLATFORMS, UNIT_TYPES, AVAILABILITY, AMENITIES,
  EMPTY_FORM, validateStep, buildPropertyPayload,
} from "@/lib/propertyWizard";
import { X, ChevronLeft, ChevronRight, Check, Loader2, Minus, Plus, Building2, Home, ListChecks } from "lucide-react";

const STEP_META = {
  basics: { icon: Building2, en: "Basics", ar: "الأساسيات" },
  details: { icon: Home, en: "Unit details", ar: "تفاصيل الوحدة" },
  extras: { icon: ListChecks, en: "Optional", ar: "اختياري" },
};

function Chip({ selected, onClick, children, invalid = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-3.5 py-2 rounded-full text-xs font-body font-medium border transition-all ${
        selected
          ? "bg-accent text-accent-foreground border-transparent"
          : `bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30 ${invalid ? "border-destructive/40" : "border-border/50"}`
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({ value, onChange, min, max, label }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-body text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="decrease" onClick={() => onChange(Math.max(min, Number(value) - 1))}
          className="w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
          <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
        <span className="w-8 text-center font-body text-sm font-semibold text-foreground">{value}</span>
        <button type="button" aria-label="increase" onClick={() => onChange(Math.min(max, Number(value) + 1))}
          className="w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default function AddPropertyWizard({ open, onClose, onCreated }) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const step = WIZARD_STEPS[stepIndex];
  const isRTL = lang === "ar";
  const set = (key, val) => { setForm((p) => ({ ...p, [key]: val })); setErrors((e) => ({ ...e, [key]: undefined })); };
  const msg = (field) => errors[field] ? (lang === "ar" ? errors[field].ar : errors[field].en) : null;
  const L = (opt) => (lang === "ar" ? opt.ar : opt.en);

  const reset = () => { setStepIndex(0); setForm({ ...EMPTY_FORM }); setErrors({}); };
  const close = () => { reset(); onClose(); };

  const next = () => {
    const { valid, errors: errs } = validateStep(step, form);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
  };
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const submit = async () => {
    const { valid, errors: errs } = validateStep("extras", form);
    if (!valid) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = buildPropertyPayload(form);
      const created = await base44.entities.UserProperty.create(payload);
      toast({ title: lang === "ar" ? "تمت إضافة العقار بنجاح" : "Property added successfully" });
      onCreated?.(created || payload);
      close();
    } catch (err) {
      toast({
        variant: "destructive",
        title: (lang === "ar" ? "تعذّر إضافة العقار" : "Could not add the property") + (err?.message ? `: ${err.message}` : ""),
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-full bg-transparent border text-sm font-body text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-accent transition-colors ${
      errors[field] ? "border-destructive/50" : "border-border/50"
    }`;

  const sectionLabel = "block font-body text-xs tracking-label uppercase text-muted-foreground mb-2";
  const fieldError = (field) => {
    const m = msg(field);
    return m ? <p className="font-body text-xs text-destructive mt-1">{m}</p> : null;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background border border-border/50 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={lang === "ar" ? "إضافة عقار" : "Add property"}
          >
            {/* Header + progress */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md px-6 pt-5 pb-4 border-b border-border/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-light">
                  {lang === "ar" ? "إضافة عقار جديد" : "Add a New Property"}
                </h2>
                <button onClick={close} aria-label={lang === "ar" ? "إغلاق" : "Close"} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {WIZARD_STEPS.map((s, i) => {
                  const Meta = STEP_META[s];
                  const done = i < stepIndex;
                  const current = i === stepIndex;
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex items-center gap-1.5 text-[11px] font-body font-medium ${current ? "text-accent" : done ? "text-foreground" : "text-muted-foreground/50"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                          current ? "border-accent bg-accent/10" : done ? "border-foreground bg-foreground/5" : "border-border"
                        }`}>
                          {done ? <Check className="w-3 h-3" strokeWidth={2} /> : i + 1}
                        </span>
                        <span className="hidden sm:inline">{lang === "ar" ? Meta.ar : Meta.en}</span>
                      </div>
                      {i < WIZARD_STEPS.length - 1 && <div className={`flex-1 h-px ${done ? "bg-foreground/30" : "bg-border/50"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {step === "basics" && (
                <>
                  <div>
                    <label htmlFor="wiz-name" className={sectionLabel}>
                      {lang === "ar" ? "اسم العقار *" : "Property name *"}
                    </label>
                    <input id="wiz-name" value={form.name} onChange={(e) => set("name", e.target.value)}
                      placeholder={lang === "ar" ? "مثال: شقة العليا الفاخرة" : "e.g. Olaya Luxury Apartment"} className={inputClass("name")} />
                    {fieldError("name")}
                  </div>
                  <div>
                    <span className={sectionLabel}>{lang === "ar" ? "المدينة *" : "City *"}</span>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map((c) => (
                        <Chip key={c.value} selected={form.city === c.value} invalid={!!errors.city} onClick={() => set("city", c.value)}>{L(c)}</Chip>
                      ))}
                    </div>
                    {fieldError("city")}
                  </div>
                  <div>
                    <label htmlFor="wiz-district" className={sectionLabel}>{lang === "ar" ? "الحي *" : "District *"}</label>
                    <input id="wiz-district" value={form.district} onChange={(e) => set("district", e.target.value)}
                      placeholder={lang === "ar" ? "مثال: حي العليا" : "e.g. Al Olaya"} className={inputClass("district")} />
                    {fieldError("district")}
                  </div>
                  <div>
                    <span className={sectionLabel}>{lang === "ar" ? "المنصة *" : "Platform *"}</span>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((p) => (
                        <Chip key={p.value} selected={form.platform === p.value} invalid={!!errors.platform} onClick={() => set("platform", p.value)}>{L(p)}</Chip>
                      ))}
                    </div>
                    {fieldError("platform")}
                  </div>
                  <div>
                    <label htmlFor="wiz-url" className={sectionLabel}>{lang === "ar" ? "رابط الإعلان *" : "Listing URL *"}</label>
                    <input id="wiz-url" value={form.platformUrl} onChange={(e) => set("platformUrl", e.target.value)} dir="ltr"
                      placeholder="https://airbnb.com/rooms/…" className={inputClass("platformUrl")} />
                    {fieldError("platformUrl")}
                  </div>
                </>
              )}

              {step === "details" && (
                <>
                  <div>
                    <span className={sectionLabel}>{lang === "ar" ? "نوع الوحدة *" : "Unit type *"}</span>
                    <div className="flex flex-wrap gap-2">
                      {UNIT_TYPES.map((u) => (
                        <Chip key={u.value} selected={form.type === u.value} invalid={!!errors.type} onClick={() => set("type", u.value)}>{L(u)}</Chip>
                      ))}
                    </div>
                    {fieldError("type")}
                  </div>
                  <div className="rounded-2xl border border-border/50 px-4 py-2 divide-y divide-border/30">
                    <Stepper label={lang === "ar" ? "غرف النوم" : "Bedrooms"} value={form.bedrooms} min={0} max={20} onChange={(v) => set("bedrooms", v)} />
                    <Stepper label={lang === "ar" ? "الحمامات" : "Bathrooms"} value={form.bathrooms} min={1} max={20} onChange={(v) => set("bathrooms", v)} />
                    <Stepper label={lang === "ar" ? "أقصى عدد ضيوف" : "Max guests"} value={form.guests} min={1} max={50} onChange={(v) => set("guests", v)} />
                  </div>
                  {fieldError("bedrooms")}{fieldError("bathrooms")}{fieldError("guests")}
                  <div>
                    <label htmlFor="wiz-price" className={sectionLabel}>{lang === "ar" ? "السعر لليلة (ر.س) *" : "Nightly price (SAR) *"}</label>
                    <input id="wiz-price" type="number" min="1" inputMode="numeric" dir="ltr" value={form.nightlyPrice}
                      onChange={(e) => set("nightlyPrice", e.target.value)} placeholder="450" className={inputClass("nightlyPrice")} />
                    {fieldError("nightlyPrice")}
                  </div>
                  <div>
                    <span className={sectionLabel}>{lang === "ar" ? "حالة التوفر *" : "Availability *"}</span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABILITY.map((a) => (
                        <Chip key={a.value} selected={form.status === a.value} onClick={() => set("status", a.value)}>{L(a)}</Chip>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === "extras" && (
                <>
                  <p className="font-body text-xs text-muted-foreground/60">
                    {lang === "ar" ? "كل الحقول هنا اختيارية — يمكنك التخطي والإضافة لاحقاً." : "Everything here is optional — you can skip and add later."}
                  </p>
                  <div>
                    <span className={sectionLabel}>{lang === "ar" ? "المرافق" : "Amenities"}</span>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((a) => (
                        <Chip key={a.value} selected={form.amenities.includes(a.value)}
                          onClick={() => set("amenities", form.amenities.includes(a.value) ? form.amenities.filter((x) => x !== a.value) : [...form.amenities, a.value])}>
                          {L(a)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wiz-photo" className={sectionLabel}>{lang === "ar" ? "رابط صورة" : "Photo link"}</label>
                    <input id="wiz-photo" value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} dir="ltr"
                      placeholder="https://…" className={inputClass("photoUrl")} />
                    {fieldError("photoUrl")}
                  </div>
                  <div>
                    <label htmlFor="wiz-notes" className={sectionLabel}>{lang === "ar" ? "ملاحظات" : "Notes"}</label>
                    <textarea id="wiz-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
                      placeholder={lang === "ar" ? "أي تفاصيل إضافية" : "Any additional details"}
                      className={inputClass("notes") + " rounded-2xl resize-none"} />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-md px-6 py-4 border-t border-border/30 flex items-center justify-between">
              <button type="button" onClick={stepIndex === 0 ? close : back}
                className="ghost-btn flex items-center gap-1.5 text-xs">
                {isRTL ? <ChevronRight className="w-4 h-4" strokeWidth={1.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
                {stepIndex === 0 ? (lang === "ar" ? "إلغاء" : "Cancel") : (lang === "ar" ? "السابق" : "Back")}
              </button>

              {stepIndex < WIZARD_STEPS.length - 1 ? (
                <button type="button" onClick={next}
                  className="flex items-center gap-1.5 px-6 h-10 rounded-full bg-accent text-accent-foreground font-body text-sm font-medium hover:opacity-90 transition-opacity">
                  {lang === "ar" ? "التالي" : "Next"}
                  {isRTL ? <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> : <ChevronRight className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={saving}
                  className="flex items-center gap-1.5 px-6 h-10 rounded-full bg-accent text-accent-foreground font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Check className="w-4 h-4" strokeWidth={1.5} />}
                  {lang === "ar" ? "إضافة العقار" : "Add property"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}