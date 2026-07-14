import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Plus, Trash2, Link2, AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import {
  SEARCH_TYPES, OFFICIAL_DATA_STATUSES, VERIFICATION_CONFIDENCES, VERIFICATION_RESULTS, SOURCE_TYPES,
  label, validateVerificationForm, buildVerificationPayload, hasOfficialSource, investmentReadiness,
} from '@/lib/propertyVerification';

const EMPTY_FORM = {
  search_type: 'deed_number', deed_number: '', deed_date: '', municipal_license_number: '', building_permit_number: '',
  city: '', district: '', property_type: '', area_declared: '', location_declared: '',
  related_opportunity_id: '', official_data_status: 'not_checked', verification_confidence: '',
  notes_internal: '', verification_result: '', source_list: [],
};
const EMPTY_SOURCE = { name: '', type: 'manual_review', reference: '', retrieved_date: '', confidence: 'low' };

const CARD = 'rounded-2xl border border-[#06131F]/10 bg-white p-5';
const FieldLabel = ({ children }) => <label className="mb-1 block text-xs font-medium opacity-60">{children}</label>;

// Admin-only page (route is wrapped in AdminRoute; the PropertyVerification
// entity is admin-only RLS). No subscriber path; nothing here is ever exposed
// publicly. Official registry integrations (REGA/Ejar/Balady/MOJ) are deferred,
// so sources are entered manually and any un-backed "verified" claim is
// downgraded to "requires_authorization" by buildVerificationPayload.
export default function AdminPropertyVerification() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [records, setRecords] = useState([]);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    base44.entities.RealEstateOpportunity.list('-created_date').then((r) => setOpportunities(r || [])).catch(() => setOpportunities([]));
    loadRecords();
  }, []);

  function loadRecords() {
    base44.entities.PropertyVerification.list('-created_at').then((r) => setRecords(r || [])).catch(() => setRecords([]));
  }

  // Any edit invalidates a computed preview so we never save stale results —
  // the admin must re-run verification, keeping what's shown == what's saved.
  const invalidatePreview = () => { setPreview((p) => (p ? null : p)); setNotice(null); };
  const set = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: undefined })); invalidatePreview(); };
  const linkedOpportunity = useMemo(
    () => opportunities.find((o) => o.id === form.related_opportunity_id) || null,
    [opportunities, form.related_opportunity_id]
  );

  const addSource = () => { setForm((f) => ({ ...f, source_list: [...f.source_list, { ...EMPTY_SOURCE }] })); invalidatePreview(); };
  const updateSource = (i, key, value) => { setForm((f) => ({ ...f, source_list: f.source_list.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)) })); invalidatePreview(); };
  const removeSource = (i) => { setForm((f) => ({ ...f, source_list: f.source_list.filter((_, idx) => idx !== i) })); invalidatePreview(); };

  const runVerification = () => {
    const { valid, errors: errs } = validateVerificationForm(form);
    if (!valid) { setErrors(errs); setPreview(null); return; }
    setErrors({});
    // Deterministic, honest classification — no live official lookup exists.
    setPreview(buildVerificationPayload(form, linkedOpportunity));
  };

  const save = async () => {
    if (!preview) return;
    setSaving(true);
    setNotice(null);
    try {
      await base44.entities.PropertyVerification.create(preview);
      setNotice({ ok: true, text: 'تم حفظ سجل التحقق.' });
      setForm(EMPTY_FORM);
      setPreview(null);
      loadRecords();
    } catch (err) {
      setNotice({ ok: false, text: err?.message || 'تعذر حفظ السجل.' });
    } finally {
      setSaving(false);
    }
  };

  const needsLicense = form.search_type === 'municipal_license';
  const needsPermit = form.search_type === 'building_permit';

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#EFF6FA]">
      <AdminNav admin={{ role: 'admin' }} />
      <main className="flex-1 space-y-6 p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-[#1B84C4]" />
          <div>
            <h1 className="font-heading text-3xl font-bold">التحقق من العقار</h1>
            <p className="text-sm opacity-60">تحقق من العقار عبر رقم الصك أو رخصة البلدية أو رخصة البناء، وقارنه ببيانات الفرصة الداخلية.</p>
          </div>
        </div>

        {/* Honest disclaimer — no official integration yet */}
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>لا يوجد ربط رسمي مباشر بعد (REGA / إيجار / بلدي / وزارة العدل). تُدخَل المصادر يدويًا، وأي نتيجة غير مدعومة بمصدر رسمي تُصنَّف «يتطلب تفويضًا» أو «غير متاح».</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Search form */}
          <section className={CARD}>
            <h2 className="mb-4 font-heading text-lg font-bold">بيانات البحث</h2>
            <div className="space-y-3">
              <div>
                <FieldLabel>نوع البحث *</FieldLabel>
                <Select value={form.search_type} onValueChange={(v) => set('search_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEARCH_TYPES.map((t) => <SelectItem key={t} value={t}>{label(t)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><FieldLabel>رقم الصك {form.search_type === 'deed_number' ? '*' : ''}</FieldLabel>
                  <Input value={form.deed_number} onChange={(e) => set('deed_number', e.target.value)} dir="ltr" />
                  {errors.deed_number && <p className="mt-1 text-xs text-red-600">{errors.deed_number}</p>}</div>
                <div><FieldLabel>تاريخ الصك (اختياري)</FieldLabel>
                  <Input type="date" value={form.deed_date} onChange={(e) => set('deed_date', e.target.value)} dir="ltr" /></div>
              </div>
              {(needsLicense || form.search_type === 'deed_number') && (
                <div><FieldLabel>رقم رخصة البلدية {needsLicense ? '*' : '(اختياري)'}</FieldLabel>
                  <Input value={form.municipal_license_number} onChange={(e) => set('municipal_license_number', e.target.value)} dir="ltr" />
                  {errors.municipal_license_number && <p className="mt-1 text-xs text-red-600">{errors.municipal_license_number}</p>}</div>
              )}
              {(needsPermit || form.search_type === 'deed_number') && (
                <div><FieldLabel>رقم رخصة البناء {needsPermit ? '*' : '(اختياري)'}</FieldLabel>
                  <Input value={form.building_permit_number} onChange={(e) => set('building_permit_number', e.target.value)} dir="ltr" />
                  {errors.building_permit_number && <p className="mt-1 text-xs text-red-600">{errors.building_permit_number}</p>}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><FieldLabel>المدينة *</FieldLabel>
                  <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}</div>
                <div><FieldLabel>الحي (اختياري)</FieldLabel>
                  <Input value={form.district} onChange={(e) => set('district', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><FieldLabel>نوع العقار (اختياري)</FieldLabel>
                  <Input value={form.property_type} onChange={(e) => set('property_type', e.target.value)} /></div>
                <div><FieldLabel>المساحة المعلنة (اختياري)</FieldLabel>
                  <Input value={form.area_declared} onChange={(e) => set('area_declared', e.target.value)} dir="ltr" /></div>
              </div>
              <div><FieldLabel>الموقع المعلن (اختياري)</FieldLabel>
                <Input value={form.location_declared} onChange={(e) => set('location_declared', e.target.value)} /></div>
              <div>
                <FieldLabel>ربط بفرصة عقارية موجودة (اختياري)</FieldLabel>
                <Select value={form.related_opportunity_id || 'none'} onValueChange={(v) => set('related_opportunity_id', v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="بدون ربط" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون ربط</SelectItem>
                    {opportunities.map((o) => <SelectItem key={o.id} value={o.id}>{o.title_internal || o.public_teaser_title || o.id}</SelectItem>)}
                  </SelectContent>
                </Select>
                {linkedOpportunity && <p className="mt-1 flex items-center gap-1 text-xs text-[#1B84C4]"><Link2 className="h-3 w-3" />سيُقارن العقار ببيانات هذه الفرصة.</p>}
              </div>
            </div>
          </section>

          {/* Manual sources + admin classification */}
          <section className={CARD}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">المصادر (إدخال يدوي)</h2>
              <Button size="sm" variant="outline" onClick={addSource}><Plus className="ml-1 h-4 w-4" />إضافة مصدر</Button>
            </div>
            {form.source_list.length === 0 && <p className="text-sm opacity-50">لا توجد مصادر بعد. أضف مصدرًا واحدًا على الأقل لدعم التحقق.</p>}
            <div className="space-y-3">
              {form.source_list.map((s, i) => (
                <div key={i} className="rounded-xl border border-[#06131F]/10 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div><FieldLabel>اسم المصدر</FieldLabel><Input value={s.name} onChange={(e) => updateSource(i, 'name', e.target.value)} /></div>
                    <div><FieldLabel>نوع المصدر</FieldLabel>
                      <Select value={s.type} onValueChange={(v) => updateSource(i, 'type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{SOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{label(t)}</SelectItem>)}</SelectContent>
                      </Select></div>
                    <div><FieldLabel>الرابط / المرجع</FieldLabel><Input value={s.reference} onChange={(e) => updateSource(i, 'reference', e.target.value)} dir="ltr" /></div>
                    <div><FieldLabel>تاريخ الاسترجاع</FieldLabel><Input type="date" value={s.retrieved_date} onChange={(e) => updateSource(i, 'retrieved_date', e.target.value)} dir="ltr" /></div>
                    <div><FieldLabel>درجة الثقة</FieldLabel>
                      <Select value={s.confidence} onValueChange={(v) => updateSource(i, 'confidence', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{VERIFICATION_CONFIDENCES.map((c) => <SelectItem key={c} value={c}>{label(c)}</SelectItem>)}</SelectContent>
                      </Select></div>
                    <div className="flex items-end justify-end"><Button size="sm" variant="ghost" onClick={() => removeSource(i)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-[#06131F]/10 pt-4">
              <div><FieldLabel>حالة البيانات الرسمية</FieldLabel>
                <Select value={form.official_data_status} onValueChange={(v) => set('official_data_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{OFFICIAL_DATA_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
                </Select>
                {['verified', 'partially_verified'].includes(form.official_data_status) && !hasOfficialSource(form.source_list) && (
                  <p className="mt-1 text-xs text-amber-700">لا يوجد مصدر رسمي — ستُحفظ الحالة كـ «يتطلب تفويضًا».</p>
                )}
              </div>
              <div><FieldLabel>النتيجة النهائية (اختياري — تُقترح تلقائيًا)</FieldLabel>
                <Select value={form.verification_result || 'auto'} onValueChange={(v) => set('verification_result', v === 'auto' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="اقتراح تلقائي" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">اقتراح تلقائي</SelectItem>
                    {VERIFICATION_RESULTS.map((r) => <SelectItem key={r} value={r}>{label(r)}</SelectItem>)}
                  </SelectContent>
                </Select></div>
              <div><FieldLabel>ملاحظات داخلية</FieldLabel><Textarea value={form.notes_internal} onChange={(e) => set('notes_internal', e.target.value)} rows={2} /></div>
            </div>

            <Button className="mt-4 w-full bg-gradient-to-r from-[#00548C] to-[#003152]" onClick={runVerification}>تشغيل التحقق</Button>
          </section>
        </div>

        {/* Result card */}
        {preview && <ResultCard preview={preview} onSave={save} saving={saving} notice={notice} />}

        {/* Saved records */}
        <section className={CARD}>
          <h2 className="mb-3 font-heading text-lg font-bold">سجلات التحقق ({records.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#06131F]/5"><tr>{['التاريخ', 'نوع البحث', 'المدينة', 'حالة البيانات', 'الثقة', 'النتيجة'].map((h) => <th key={h} className="p-2 text-right">{h}</th>)}</tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-[#06131F]/10">
                    <td className="p-2">{r.created_at ? new Date(r.created_at).toLocaleDateString('ar-SA') : '—'}</td>
                    <td className="p-2">{label(r.search_type)}</td>
                    <td className="p-2">{r.city || '—'}</td>
                    <td className="p-2">{label(r.official_data_status)}</td>
                    <td className="p-2">{label(r.verification_confidence)}</td>
                    <td className="p-2">{label(r.verification_result)}</td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan="6" className="p-6 text-center opacity-50">لا توجد سجلات بعد.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function ResultCard({ preview, onSave, saving, notice }) {
  const readiness = investmentReadiness(preview.verification_result, 'ar');
  const ReadinessIcon = readiness.ok === true ? CheckCircle2 : readiness.ok === false ? XCircle : HelpCircle;
  const readinessColor = readiness.ok === true ? 'text-green-700' : readiness.ok === false ? 'text-red-700' : 'text-amber-700';
  const stat = (labelText, value) => (
    <div><div className="text-xs opacity-50">{labelText}</div><div className="font-semibold">{value}</div></div>
  );
  const fieldList = (title, arr, color) => (
    <div>
      <div className="mb-1 text-xs opacity-50">{title}</div>
      {arr.length === 0 ? <span className="text-xs opacity-40">—</span> : (
        <div className="flex flex-wrap gap-1">{arr.map((f) => <span key={f} className={`rounded-full px-2 py-0.5 text-xs ${color}`}>{label(f)}</span>)}</div>
      )}
    </div>
  );
  return (
    <section className={CARD}>
      <h2 className="mb-4 font-heading text-lg font-bold">نتيجة التحقق</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stat('حالة التحقق', label(preview.official_data_status))}
        {stat('درجة الثقة', label(preview.verification_confidence))}
        {stat('النتيجة', label(preview.verification_result))}
        {stat('المصادر', preview.source_list.length)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {fieldList('البيانات المطابقة', preview.matched_fields, 'bg-green-100 text-green-800')}
        {fieldList('البيانات الناقصة', preview.missing_fields, 'bg-gray-100 text-gray-700')}
        {fieldList('التعارضات', preview.conflicting_fields, 'bg-red-100 text-red-800')}
      </div>
      <div className={`mt-4 flex items-center gap-2 rounded-xl border p-3 ${readinessColor}`}>
        <ReadinessIcon className="h-5 w-5 shrink-0" />
        <div><div className="text-xs opacity-70">هل يصلح العقار للتحليل الاستثماري؟</div><div className="font-semibold">{readiness.text}</div></div>
      </div>
      {notice && <p className={`mt-3 text-sm ${notice.ok ? 'text-green-700' : 'text-red-700'}`}>{notice.text}</p>}
      <Button className="mt-4 bg-gradient-to-r from-[#00548C] to-[#003152]" onClick={onSave} disabled={saving}>
        {saving ? 'جارٍ الحفظ...' : 'حفظ سجل التحقق'}
      </Button>
    </section>
  );
}
