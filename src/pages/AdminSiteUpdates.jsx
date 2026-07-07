import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminNav from '@/components/admin/AdminNav';
import ExportButtons from '@/components/admin/ExportButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Plus, Trash2, Pencil, Eye, EyeOff, Sparkles, Wrench, Bug, X } from 'lucide-react';
import { UPDATE_TYPES, label, validateSiteUpdate, sortByDateDesc } from '@/lib/siteUpdates';

const CARD = 'rounded-2xl border border-[#0A0B10]/10 bg-white';
const FieldLabel = ({ children }) => <label className="mb-1 block text-xs font-medium opacity-60">{children}</label>;
const TYPE_ICON = { feature: Sparkles, improvement: Wrench, fix: Bug, announcement: Megaphone };

const EMPTY = {
  title_ar: '', title_en: '', description_ar: '', description_en: '',
  date: new Date().toISOString().slice(0, 10), type: 'feature', is_published: true,
};

// Admin-only page (route wrapped in AdminRoute; SiteUpdate create/update/delete
// are admin-only RLS). Drafts (is_published:false) are visible only to admins
// via the entity's conditional read.
export default function AdminSiteUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    base44.entities.SiteUpdate.list('-date', 200)
      .then((rows) => setUpdates(sortByDateDesc(rows || [])))
      .catch((err) => setError(err?.message || 'تعذر تحميل التحديثات.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: undefined })); };

  const openNew = () => { setForm(EMPTY); setEditingId(null); setErrors({}); setShowForm(true); };
  const openEdit = (item) => {
    setForm({
      title_ar: item.title_ar || '', title_en: item.title_en || '',
      description_ar: item.description_ar || '', description_en: item.description_en || '',
      date: (item.date || '').slice(0, 10), type: item.type || 'feature',
      is_published: item.is_published === true,
    });
    setEditingId(item.id); setErrors({}); setShowForm(true);
  };

  const save = async () => {
    const { valid, errors: errs } = validateSiteUpdate(form);
    if (!valid) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        title_ar: form.title_ar.trim(), title_en: form.title_en.trim(),
        description_ar: form.description_ar.trim() || null, description_en: form.description_en.trim() || null,
        date: form.date, type: form.type, is_published: form.is_published === true,
      };
      if (editingId) await base44.entities.SiteUpdate.update(editingId, payload);
      else await base44.entities.SiteUpdate.create(payload);
      setShowForm(false); setForm(EMPTY); setEditingId(null);
      load();
    } catch (err) {
      setErrors({ _form: err?.message || 'تعذر حفظ التحديث.' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item) => {
    try { await base44.entities.SiteUpdate.update(item.id, { is_published: !item.is_published }); load(); }
    catch (err) { setError(err?.message || 'تعذر تغيير حالة النشر.'); }
  };

  const remove = async (item) => {
    const title = item.title_ar || item.title_en || '';
    if (!window.confirm(`سيتم حذف التحديث «${title}» نهائيًا. هل أنت متأكد؟`)) return;
    try { await base44.entities.SiteUpdate.delete(item.id); load(); }
    catch (err) { setError(err?.message || 'تعذر حذف التحديث.'); }
  };

  // Export projection: changelog fields only (no PII / no internal-only fields).
  const exportRows = useMemo(() => updates.map((u) => ({
    'التاريخ': u.date || '',
    'النوع': label(u.type, 'ar'),
    'العنوان (عربي)': u.title_ar || '',
    'العنوان (إنجليزي)': u.title_en || '',
    'الوصف (عربي)': u.description_ar || '',
    'الوصف (إنجليزي)': u.description_en || '',
    'الحالة': u.is_published ? 'منشور' : 'مسودة',
  })), [updates]);

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#F2EFE8]">
      <AdminNav admin={{ role: 'admin' }} />
      <main className="flex-1 space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Megaphone className="h-7 w-7 text-[#D95F3B]" />
            <div>
              <h1 className="font-heading text-3xl font-bold">تحديثات المنصة</h1>
              <p className="text-sm opacity-60">إدارة سجل التغييرات والإعلانات الظاهرة للمستخدمين. المسودات تظهر للمشرفين فقط.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExportButtons baseName="site-updates" rows={exportRows} />
            <Button className="bg-gradient-to-r from-[#D95F3B] to-[#C8972A]" onClick={openNew}><Plus className="ml-1 h-4 w-4" />إضافة تحديث</Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={load}>إعادة المحاولة</Button>
          </div>
        )}

        {/* List / states */}
        <section className={`${CARD} overflow-hidden`}>
          {loading ? (
            <div className="space-y-2 p-6">{[...Array(4)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded bg-[#0A0B10]/5" />)}</div>
          ) : updates.length === 0 ? (
            <div className="p-10 text-center opacity-60">لا توجد تحديثات بعد. أضف أول تحديث للمنصة.</div>
          ) : (
            <ul className="divide-y divide-[#0A0B10]/10">
              {updates.map((item) => {
                const Icon = TYPE_ICON[item.type] || Sparkles;
                return (
                  <li key={item.id} className="flex items-start gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0A0B10]/5"><Icon className="h-4 w-4 text-[#D95F3B]" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#0A0B10]/5 px-2 py-0.5 text-[11px]">{label(item.type, 'ar')}</span>
                        <span className="text-xs opacity-60">{item.date ? new Date(item.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{item.is_published ? 'منشور' : 'مسودة'}</span>
                      </div>
                      <p className="mt-1 font-semibold">{item.title_ar || item.title_en}</p>
                      {(item.description_ar || item.description_en) && <p className="mt-0.5 text-sm opacity-70">{item.description_ar || item.description_en}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="ghost" title={item.is_published ? 'إلغاء النشر' : 'نشر'} onClick={() => togglePublished(item)}>
                        {item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" title="تعديل" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" title="حذف" onClick={() => remove(item)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {showForm && (
        <div dir="rtl" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">{editingId ? 'تعديل تحديث' : 'تحديث جديد'}</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>العنوان (عربي) *</FieldLabel>
                <Input dir="rtl" value={form.title_ar} onChange={(e) => set('title_ar', e.target.value)} />
                {errors.title_ar && <p className="mt-1 text-xs text-red-600">{errors.title_ar}</p>}
              </div>
              <div>
                <FieldLabel>العنوان (إنجليزي) *</FieldLabel>
                <Input dir="ltr" value={form.title_en} onChange={(e) => set('title_en', e.target.value)} />
                {errors.title_en && <p className="mt-1 text-xs text-red-600">{errors.title_en}</p>}
              </div>
              <div>
                <FieldLabel>الوصف (عربي)</FieldLabel>
                <Textarea dir="rtl" rows={3} value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} />
              </div>
              <div>
                <FieldLabel>الوصف (إنجليزي)</FieldLabel>
                <Textarea dir="ltr" rows={3} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} />
              </div>
              <div>
                <FieldLabel>التاريخ *</FieldLabel>
                <Input type="date" dir="ltr" value={form.date} onChange={(e) => set('date', e.target.value)} />
                {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
              </div>
              <div>
                <FieldLabel>نوع التحديث *</FieldLabel>
                <Select value={form.type} onValueChange={(v) => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UPDATE_TYPES.map((t) => <SelectItem key={t} value={t}>{label(t, 'ar')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
              نشر مباشرة (إن تركته فارغًا يُحفظ كمسودة للمشرفين فقط)
            </label>
            {errors._form && <p className="mt-3 text-sm text-red-600">{errors._form}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>إلغاء</Button>
              <Button className="bg-gradient-to-r from-[#D95F3B] to-[#C8972A]" onClick={save} disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
