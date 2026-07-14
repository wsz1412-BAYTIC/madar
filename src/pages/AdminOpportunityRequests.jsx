import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminNav from '@/components/admin/AdminNav';
import ExportButtons from '@/components/admin/ExportButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Bell, ShieldCheck, Phone, MessageCircle, Mail, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { label as oppLabel } from '@/lib/realEstateOpportunities';
import { label as pvLabel } from '@/lib/propertyVerification';
import {
  REQUEST_STATUSES, AGREEMENT_STATUSES, BROKERAGE_STAGES,
  label, filterRequests, isFollowUpDue,
} from '@/lib/opportunityRequests';

const CARD = 'rounded-2xl border border-[#06131F]/10 bg-white';
const FieldLabel = ({ children }) => <label className="mb-1 block text-xs font-medium opacity-60">{children}</label>;
const CONTACT_ICON = { phone: Phone, whatsapp: MessageCircle, email: Mail };

const STATUS_STYLE = {
  new: 'bg-blue-100 text-blue-800', contacted: 'bg-indigo-100 text-indigo-800',
  qualified: 'bg-cyan-100 text-cyan-800', agreement_pending: 'bg-amber-100 text-amber-800',
  agreement_signed: 'bg-teal-100 text-teal-800', negotiating: 'bg-purple-100 text-purple-800',
  closed_won: 'bg-green-100 text-green-800', closed_lost: 'bg-gray-200 text-gray-700',
  rejected: 'bg-red-100 text-red-800', closed: 'bg-gray-200 text-gray-700',
};

const StatusChip = ({ status }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-700'}`}>{label(status || 'new')}</span>
);

// Admin-only page (route wrapped in AdminRoute; OpportunityRequest RLS is
// admin-only with create:false). Client mobile, internal notes, agreement
// state and linked verification records are never exposed to subscribers —
// this whole surface lives behind the admin gate.
export default function AdminOpportunityRequests() {
  const [requests, setRequests] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'all', city: 'all', agreementStatus: 'all', followUpDue: false });
  const [active, setActive] = useState(null); // request open in the detail modal
  const [me, setMe] = useState(null);
  const { toast } = useToast();

  useEffect(() => { base44.auth.me().then((u) => setMe(u)).catch(() => setMe(null)); }, []);

  // Shared quick-action writer: confirm → update (admin-only RLS) → toast +
  // optimistic local state. Every data-changing quick action routes through
  // here so each one is confirmed and gives feedback. Only workflow fields are
  // ever written — never client mobile/email or free-text notes.
  const quickUpdate = async (request, patch, confirmMsg, successMsg) => {
    if (!window.confirm(confirmMsg)) return false;
    try {
      const full = { ...patch, updated_at: new Date().toISOString() };
      await base44.entities.OpportunityRequest.update(request.id, full);
      setRequests((rows) => rows.map((r) => (r.id === request.id ? { ...r, ...full } : r)));
      toast({ description: successMsg });
      return true;
    } catch (err) {
      toast({ variant: 'destructive', description: err?.message || 'تعذر تنفيذ الإجراء.' });
      return false;
    }
  };

  const quickStatus = (request, to) =>
    quickUpdate(request, { status: to }, `تأكيد: تغيير حالة طلب «${request.name}» إلى «${label(to)}»؟`, 'تم تحديث الحالة.');
  const quickFollowUp = (request, date) =>
    quickUpdate(request, { next_follow_up_at: date ? new Date(date).toISOString() : null },
      date ? `تعيين تاريخ المتابعة القادمة لـ«${request.name}» إلى ${date}؟` : `مسح تاريخ المتابعة لـ«${request.name}»؟`,
      'تم تحديث تاريخ المتابعة.');
  const quickAssignToMe = (request) => {
    const ref = me?.email || me?.full_name;
    if (!ref) { toast({ variant: 'destructive', description: 'تعذر تحديد المشرف الحالي.' }); return; }
    quickUpdate(request, { assigned_admin: ref }, `إسناد طلب «${request.name}» إليك (${ref})؟`, 'تم الإسناد إليك.');
  };

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      base44.entities.OpportunityRequest.list('-createdAt'),
      base44.entities.RealEstateOpportunity.list('-created_date').catch(() => []),
      base44.entities.PropertyVerification.list('-created_at').catch(() => []),
    ])
      .then(([reqs, opps, pvs]) => { setRequests(reqs || []); setOpportunities(opps || []); setVerifications(pvs || []); })
      .catch((err) => setError(err?.message || 'تعذر تحميل الطلبات.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cityOf = useMemo(() => {
    const map = new Map(opportunities.map((o) => [o.id, o.city]));
    return (id) => map.get(id);
  }, [opportunities]);

  // verificationsByOpportunity: opportunityId → related PropertyVerification rows
  const verificationsByOpportunity = useMemo(() => {
    const map = new Map();
    for (const v of verifications) {
      if (!v?.related_opportunity_id) continue;
      if (!map.has(v.related_opportunity_id)) map.set(v.related_opportunity_id, []);
      map.get(v.related_opportunity_id).push(v);
    }
    return map;
  }, [verifications]);

  const cityOptions = useMemo(
    () => [...new Set(opportunities.map((o) => o.city).filter(Boolean))],
    [opportunities]
  );

  const filtered = useMemo(() => filterRequests(requests, filters, { cityOf }), [requests, filters, cityOf]);
  const dueCount = useMemo(() => requests.filter((r) => isFollowUpDue(r)).length, [requests]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  // Export projection: WORKFLOW/pipeline columns only. Deliberately EXCLUDES
  // the client's mobile, email, and internal_notes — even though the admin can
  // see them on screen, they are direct-contact PII / free-text notes and must
  // not be spread into downloadable files.
  const exportRows = useMemo(() => filtered.map((r) => ({
    'التاريخ': r.createdAt ? new Date(r.createdAt).toISOString() : '',
    'الفرصة': r.opportunityTeaserTitle || r.opportunityId || '',
    'المدينة': oppLabel(cityOf(r.opportunityId)) || '',
    'العميل': r.name || '',
    'الحالة': label(r.status || 'new'),
    'الاتفاقية': label(r.agreement_status || 'none'),
    'مرحلة الوساطة': label(r.brokerage_stage || 'none'),
    'المتابعة القادمة': r.next_follow_up_at ? new Date(r.next_follow_up_at).toISOString().slice(0, 10) : '',
    'المسؤول': r.assigned_admin || '',
  })), [filtered, cityOf]);

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#EFF6FA]">
      <AdminNav admin={{ role: 'admin' }} />
      <main className="flex-1 space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold">طلبات دراسات الفرص</h1>
            <p className="text-sm opacity-60">متابعة طلبات المشتركين وإدارة مراحل الوساطة العقارية. جميع البيانات داخلية وخاصة بالمشرفين.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {dueCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                <Bell className="h-4 w-4" />{dueCount} متابعة مستحقة
              </span>
            )}
            <ExportButtons baseName="opportunity-requests" rows={exportRows} />
          </div>
        </div>

        {/* Filters */}
        <section className={`${CARD} p-4`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <FieldLabel>الحالة</FieldLabel>
              <Select value={filters.status} onValueChange={(v) => setFilter('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  {REQUEST_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>المدينة</FieldLabel>
              <Select value={filters.city} onValueChange={(v) => setFilter('city', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المدن</SelectItem>
                  {cityOptions.map((c) => <SelectItem key={c} value={c}>{oppLabel(c)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>حالة الاتفاقية</FieldLabel>
              <Select value={filters.agreementStatus} onValueChange={(v) => setFilter('agreementStatus', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {AGREEMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={filters.followUpDue ? 'default' : 'outline'}
                className={filters.followUpDue ? 'w-full bg-[#0F6BA8]' : 'w-full'}
                onClick={() => setFilter('followUpDue', !filters.followUpDue)}
              >
                <Bell className="ml-1 h-4 w-4" />المتابعات المستحقة فقط
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={load}>إعادة المحاولة</Button>
          </div>
        )}

        {/* Table / states */}
        <section className={`${CARD} overflow-hidden`}>
          {loading ? (
            <div className="space-y-2 p-6">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-[#06131F]/5" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center opacity-60">{requests.length === 0 ? 'لا توجد طلبات حتى الآن.' : 'لا توجد طلبات مطابقة للتصفية.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#06131F]/5">
                  <tr>{['التاريخ', 'الفرصة', 'العميل', 'الجوال', 'الحالة', 'الاتفاقية', 'المتابعة', 'تحقق العقار', ''].map((h) => <th key={h} className="p-3 text-right font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const due = isFollowUpDue(r);
                    const pvCount = (verificationsByOpportunity.get(r.opportunityId) || []).length;
                    const rowStatus = r.status || 'new';
                    // Always keep the row's CURRENT status selectable/visible —
                    // including a legacy value like 'closed' that REQUEST_STATUSES
                    // omits — so old requests still show their status and can be
                    // moved to a current one.
                    const statusItems = REQUEST_STATUSES.includes(rowStatus) ? REQUEST_STATUSES : [...REQUEST_STATUSES, rowStatus];
                    return (
                      <tr key={r.id} className="border-t border-[#06131F]/10 hover:bg-[#06131F]/[0.03]">
                        <td className="p-3 whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : '—'}</td>
                        <td className="p-3">{r.opportunityTeaserTitle || r.opportunityId}</td>
                        <td className="p-3 font-semibold">{r.name}</td>
                        <td className="p-3" dir="ltr">{r.mobile}</td>
                        <td className="p-3">
                          {/* Quick status change (covers contacted / qualified / agreement_pending / closed …). Cancel in the confirm reverts (controlled by r.status). */}
                          <Select value={rowStatus} onValueChange={(v) => { if (v !== rowStatus) quickStatus(r, v); }}>
                            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>{statusItems.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">{label(r.agreement_status || 'none')}</td>
                        <td className="p-3">
                          {/* Quick set next follow-up date */}
                          <Input
                            type="date"
                            dir="ltr"
                            className={`h-8 w-36 ${due ? 'border-amber-400 text-amber-700' : ''}`}
                            value={r.next_follow_up_at ? new Date(r.next_follow_up_at).toISOString().slice(0, 10) : ''}
                            onChange={(e) => quickFollowUp(r, e.target.value)}
                          />
                        </td>
                        <td className="p-3">{pvCount > 0 ? <span className="flex items-center gap-1 text-xs text-green-700"><ShieldCheck className="h-3.5 w-3.5" />{pvCount}</span> : <span className="text-xs opacity-40">—</span>}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" title="أسنِد إليّ" onClick={() => quickAssignToMe(r)}><UserPlus className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => setActive(r)}>تفاصيل</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {active && (
        <RequestDetail
          request={active}
          verifications={verificationsByOpportunity.get(active.opportunityId) || []}
          onClose={() => setActive(null)}
          onSaved={(updated) => {
            setRequests((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
            setActive(null);
          }}
        />
      )}
    </div>
  );
}

function RequestDetail({ request, verifications, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: request.status || 'new',
    agreement_status: request.agreement_status || 'none',
    brokerage_stage: request.brokerage_stage || 'none',
    assigned_admin: request.assigned_admin || '',
    last_contact_at: toDateInput(request.last_contact_at),
    next_follow_up_at: toDateInput(request.next_follow_up_at),
    internal_notes: request.internal_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const set = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setNotice(null); };

  const ContactIcon = CONTACT_ICON[request.preferredContactMethod];

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const patch = {
        status: form.status,
        agreement_status: form.agreement_status,
        brokerage_stage: form.brokerage_stage,
        assigned_admin: form.assigned_admin.trim() || null,
        last_contact_at: form.last_contact_at ? new Date(form.last_contact_at).toISOString() : null,
        next_follow_up_at: form.next_follow_up_at ? new Date(form.next_follow_up_at).toISOString() : null,
        internal_notes: form.internal_notes.trim() || null,
        updated_at: new Date().toISOString(),
      };
      await base44.entities.OpportunityRequest.update(request.id, patch);
      onSaved({ ...request, ...patch });
    } catch (err) {
      setNotice({ ok: false, text: err?.message || 'تعذر حفظ التحديثات.' });
      setSaving(false);
    }
  };

  const info = (title, value) => (
    <div><div className="text-xs opacity-50">{title}</div><div className="font-medium">{value ?? '—'}</div></div>
  );

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold">{request.name}</h2>
            <div className="mt-1"><StatusChip status={request.status} /></div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        {/* Read-only client + request info */}
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#EFF6FA] p-4 sm:grid-cols-3">
          {info('الفرصة', request.opportunityTeaserTitle || request.opportunityId)}
          {info('الجوال', <span dir="ltr">{request.mobile}</span>)}
          {info('طريقة التواصل المفضلة', <span className="inline-flex items-center gap-1">{ContactIcon && <ContactIcon className="h-3.5 w-3.5" />}{label(request.preferredContactMethod)}</span>)}
          {info('نطاق الميزانية', oppLabel(request.budgetRange))}
          {info('البريد الإلكتروني', request.userEmail)}
          {info('تاريخ الطلب', request.createdAt ? new Date(request.createdAt).toLocaleString('ar-SA') : '—')}
        </div>
        {request.message && (
          <div className="mt-3 rounded-xl border border-[#06131F]/10 p-3">
            <div className="mb-1 text-xs opacity-50">رسالة العميل</div>
            <p className="whitespace-pre-wrap text-sm">{request.message}</p>
          </div>
        )}

        {/* Linked property verification (Phase 2). Informational only — never blocks. */}
        <div className="mt-3 rounded-xl border border-[#06131F]/10 p-3">
          <div className="mb-2 flex items-center gap-1 text-xs opacity-50"><ShieldCheck className="h-3.5 w-3.5" />سجلات التحقق من العقار المرتبطة</div>
          {verifications.length === 0 ? (
            <p className="text-xs opacity-50">لا توجد سجلات تحقق مرتبطة بهذه الفرصة. (غير مطلوب لإكمال المتابعة)</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {verifications.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#06131F]/5 px-2 py-0.5 text-xs">{pvLabel(v.official_data_status)}</span>
                  <span className="text-xs opacity-60">{pvLabel(v.verification_result)}</span>
                  <span className="text-xs opacity-40">{v.created_at ? new Date(v.created_at).toLocaleDateString('ar-SA') : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Editable workflow */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>حالة الطلب</FieldLabel>
            <Select value={form.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{REQUEST_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>حالة الاتفاقية</FieldLabel>
            <Select value={form.agreement_status} onValueChange={(v) => set('agreement_status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{AGREEMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>مرحلة الوساطة</FieldLabel>
            <Select value={form.brokerage_stage} onValueChange={(v) => set('brokerage_stage', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BROKERAGE_STAGES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>المسؤول المكلّف</FieldLabel>
            <Input value={form.assigned_admin} onChange={(e) => set('assigned_admin', e.target.value)} placeholder="اسم المشرف" />
          </div>
          <div>
            <FieldLabel>تاريخ آخر تواصل</FieldLabel>
            <Input type="date" dir="ltr" value={form.last_contact_at} onChange={(e) => set('last_contact_at', e.target.value)} />
          </div>
          <div>
            <FieldLabel>تاريخ المتابعة القادمة</FieldLabel>
            <Input type="date" dir="ltr" value={form.next_follow_up_at} onChange={(e) => set('next_follow_up_at', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>ملاحظات داخلية (خاصة بالمشرفين)</FieldLabel>
            <Textarea rows={3} value={form.internal_notes} onChange={(e) => set('internal_notes', e.target.value)} />
          </div>
        </div>

        {notice && <p className={`mt-3 text-sm ${notice.ok ? 'text-green-700' : 'text-red-700'}`}>{notice.text}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button className="bg-gradient-to-r from-[#00548C] to-[#003152]" onClick={save} disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ التحديثات'}</Button>
        </div>
      </div>
    </div>
  );
}

// ISO datetime → yyyy-mm-dd for <input type="date">; safe on null/invalid.
function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
