import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, RefreshCw, ChevronDown, ChevronUp, Check, CheckCheck, AlertTriangle } from 'lucide-react';
import {
  ALERT_TYPES, SEVERITIES, ALERT_STATUSES, label, canTransition,
} from '@/lib/securityMonitoring';

const CARD = 'rounded-2xl border border-[#0A0B10]/10 bg-white';
const FieldLabel = ({ children }) => <label className="mb-1 block text-xs font-medium opacity-60">{children}</label>;

const SEVERITY_STYLE = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
};
const STATUS_STYLE = {
  new: 'bg-red-100 text-red-800',
  acknowledged: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
};

// Admin-only page (route wrapped in AdminRoute; SecurityAlert RLS is admin-only,
// delete disabled). The list never renders the raw subject_user_id — only the
// masked subject_ref. Alerts are raised by the securityMonitor backend scan.
export default function AdminSecurityAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [coverageWarning, setCoverageWarning] = useState(false);
  const [filters, setFilters] = useState({ severity: 'all', status: 'all', type: 'all' });

  // Listing goes through the backend (list_alerts), which returns admin-safe
  // SUMMARIES only — the raw subject_user_id and actor fields never reach the
  // browser. The page never calls SecurityAlert.list directly.
  const load = () => {
    setLoading(true);
    setError('');
    base44.functions.invoke('securityMonitor', { action: 'list_alerts' })
      .then((res) => setAlerts((res?.data || res || {}).alerts || []))
      .catch((err) => setError(err?.message || 'تعذر تحميل التنبيهات.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const runScan = async () => {
    setScanning(true);
    setScanNote(null);
    try {
      const res = await base44.functions.invoke('securityMonitor', { action: 'scan' });
      const data = res?.data || res || {};
      setCoverageWarning(data.scanCoverage && data.scanCoverage.complete === false);
      setScanNote({ ok: true, text: `اكتمل الفحص — تنبيهات جديدة: ${data.alertsCreated ?? 0}` });
      load();
    } catch (err) {
      setScanNote({ ok: false, text: err?.message || 'تعذر تشغيل الفحص.' });
    } finally {
      setScanning(false);
    }
  };

  // Transitions go through the backend (transition_alert), which re-reads the
  // current status and rejects stale/backward changes — the page never calls
  // SecurityAlert.update directly, so two admins can't race a stale patch.
  const transition = async (alert, to) => {
    try {
      const res = await base44.functions.invoke('securityMonitor', { action: 'transition_alert', id: alert.id, to });
      const updated = (res?.data || res || {}).alert;
      if (updated) setAlerts((rows) => rows.map((a) => (a.id === alert.id ? { ...a, ...updated } : a)));
      else load();
    } catch (err) {
      setError(err?.message || 'تعذر تحديث حالة التنبيه (قد تكون الحالة تغيّرت). يُعاد التحميل.');
      load();
    }
  };

  const filtered = useMemo(() => alerts.filter((a) => {
    if (filters.severity !== 'all' && a.severity !== filters.severity) return false;
    if (filters.status !== 'all' && (a.status || 'new') !== filters.status) return false;
    if (filters.type !== 'all' && a.alert_type !== filters.type) return false;
    return true;
  }), [alerts, filters]);

  const openCount = useMemo(() => alerts.filter((a) => (a.status || 'new') !== 'resolved').length, [alerts]);
  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#F2EFE8]">
      <AdminNav admin={{ role: 'admin' }} />
      <main className="flex-1 space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-[#D95F3B]" />
            <div>
              <h1 className="font-heading text-3xl font-bold">تنبيهات الأمان</h1>
              <p className="text-sm opacity-60">مراقبة النشاط غير الطبيعي (فحص يدوي). البيانات داخلية وخاصة بالمشرفين فقط.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {openCount > 0 && <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">{openCount} تنبيه مفتوح</span>}
            <Button className="bg-gradient-to-r from-[#D95F3B] to-[#C8972A]" onClick={runScan} disabled={scanning}>
              <RefreshCw className={`ml-1 h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />{scanning ? 'جارٍ الفحص...' : 'تشغيل فحص'}
            </Button>
          </div>
        </div>

        {scanNote && <div className={`rounded-xl border p-3 text-sm ${scanNote.ok ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'}`}>{scanNote.text}</div>}

        {coverageWarning && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>تنبيه: حجم السجلات تجاوز الحد الأقصى للفحص، وقد لا يغطي هذا الفحص كامل فترة الـ24 ساعة. قد تكون بعض الأحداث ضمن الفترة غير مشمولة (سيتم دعم التصفّح الكامل لاحقًا).</p>
          </div>
        )}

        {/* Filters */}
        <section className={`${CARD} p-4`}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel>الخطورة</FieldLabel>
              <Select value={filters.severity} onValueChange={(v) => setFilter('severity', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المستويات</SelectItem>
                  {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>الحالة</FieldLabel>
              <Select value={filters.status} onValueChange={(v) => setFilter('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  {ALERT_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>النوع</FieldLabel>
              <Select value={filters.type} onValueChange={(v) => setFilter('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  {ALERT_TYPES.map((t) => <SelectItem key={t} value={t}>{label(t)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

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
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center opacity-60">{alerts.length === 0 ? 'لا توجد تنبيهات. شغّل فحصًا لاكتشاف النشاط غير الطبيعي.' : 'لا توجد تنبيهات مطابقة للتصفية.'}</div>
          ) : (
            <ul className="divide-y divide-[#0A0B10]/10">
              {filtered.map((a) => {
                const isOpen = expanded === a.id;
                const status = a.status || 'new';
                return (
                  <li key={a.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] ${SEVERITY_STYLE[a.severity] || 'bg-gray-100 text-gray-700'}`}>{label(a.severity)}</span>
                          <span className="rounded-full bg-[#0A0B10]/5 px-2 py-0.5 text-[11px]">{label(a.alert_type)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_STYLE[status]}`}>{label(status)}</span>
                          <span className="text-xs opacity-50">{a.detected_at ? new Date(a.detected_at).toLocaleString('ar-SA') : ''}</span>
                        </div>
                        <p className="mt-1 font-semibold">{a.title}</p>
                        <button className="mt-1 flex items-center gap-1 text-xs text-[#D95F3B]" onClick={() => setExpanded(isOpen ? null : a.id)}>
                          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {isOpen ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                        </button>
                        {isOpen && (
                          <div className="mt-2 rounded-xl bg-[#F2EFE8] p-3 text-sm">
                            {a.summary && <p className="mb-2 opacity-80">{a.summary}</p>}
                            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                              <div><span className="opacity-50">المرجع: </span><span dir="ltr">{a.subject_ref || '—'}</span></div>
                              {a.metadata?.count != null && <div><span className="opacity-50">العدد: </span>{a.metadata.count}</div>}
                              {a.metadata?.window && <div><span className="opacity-50">النافذة: </span><span dir="ltr">{a.metadata.window}</span></div>}
                              {a.metadata?.percent != null && <div><span className="opacity-50">النسبة: </span>{a.metadata.percent}%</div>}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        {canTransition(status, 'acknowledged') && (
                          <Button size="sm" variant="outline" onClick={() => transition(a, 'acknowledged')}><Check className="ml-1 h-3.5 w-3.5" />مراجعة</Button>
                        )}
                        {canTransition(status, 'resolved') && (
                          <Button size="sm" variant="outline" onClick={() => transition(a, 'resolved')}><CheckCheck className="ml-1 h-3.5 w-3.5" />معالجة</Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
