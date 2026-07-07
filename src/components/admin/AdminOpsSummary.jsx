import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Inbox, Bell, ShieldAlert, Megaphone, ShieldCheck, Building2, ArrowLeft, ArrowRight } from 'lucide-react';
import { label as requestLabel } from '@/lib/opportunityRequests';
import { label as alertLabel } from '@/lib/securityMonitoring';
import { summarizeRequests, summarizeAlerts, summarizeSiteUpdates } from '@/lib/adminDashboardSummary';

// Operational admin summary: counts only (no PII) + quick links. Additive to
// the existing AdminDashboard — does not replace it. Each data source loads
// independently and degrades gracefully; a source that fails is simply skipped.
// Security alerts come from the list_alerts backend action (safe summaries),
// never a direct SecurityAlert read. "Recent admin activity" is intentionally
// NOT included: AuditLog carries ipAddress/details, which cannot be counted
// from the frontend without pulling sensitive fields into the browser.
export default function AdminOpsSummary() {
  const { lang } = useLang();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const ar = lang === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const [requests, setRequests] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [updates, setUpdates] = useState(null);

  useEffect(() => {
    base44.entities.OpportunityRequest.list('-createdAt').then((r) => setRequests(r || [])).catch(() => setRequests([]));
    base44.entities.SiteUpdate.list('-date', 200).then((r) => setUpdates(r || [])).catch(() => setUpdates([]));
    base44.functions.invoke('securityMonitor', { action: 'list_alerts' })
      .then((res) => setAlerts((res?.data || res || {}).alerts || []))
      .catch(() => setAlerts([]));
  }, []);

  const reqSummary = useMemo(() => summarizeRequests(requests || []), [requests]);
  const alertSummary = useMemo(() => summarizeAlerts(alerts || []), [alerts]);
  const updSummary = useMemo(() => summarizeSiteUpdates(updates || []), [updates]);

  const card = `p-5 rounded-xl border ${dark ? 'bg-card border-foreground/[0.06]' : 'bg-white border-[#0A0B10]/[0.06]'}`;
  const muted = dark ? 'text-foreground/60' : 'text-[#0A0B10]/60';
  const strong = dark ? 'text-foreground' : 'text-[#0A0B10]';

  const StatCard = ({ icon: Icon, label, value, tone = 'primary' }) => (
    <div className={card}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${muted}`}>{label}</p>
          <p className={`mt-2 text-3xl font-bold ${strong}`}>{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${tone === 'danger' ? (dark ? 'bg-red-500/20' : 'bg-red-100') : dark ? 'bg-primary/20' : 'bg-primary/10'}`}>
          <Icon className={`h-6 w-6 ${tone === 'danger' ? 'text-red-600' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  );

  const Chip = ({ children }) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${dark ? 'bg-foreground/10 text-foreground/80' : 'bg-[#0A0B10]/5 text-[#0A0B10]/80'}`}>{children}</span>
  );

  const quickLinks = [
    { to: '/admin/opportunity-requests', ar: 'طلبات الفرص', en: 'Opportunity Requests', icon: Inbox },
    { to: '/admin/security-alerts', ar: 'تنبيهات الأمان', en: 'Security Alerts', icon: ShieldAlert },
    { to: '/admin/site-updates', ar: 'تحديثات المنصة', en: 'Site Updates', icon: Megaphone },
    { to: '/admin/property-verification', ar: 'التحقق من العقار', en: 'Property Verification', icon: ShieldCheck },
    { to: '/admin/opportunities', ar: 'الفرص العقارية', en: 'Opportunities', icon: Building2 },
  ];

  const t = (a, e) => (ar ? a : e);

  return (
    <section className="mb-8 space-y-6">
      <h2 className={`font-heading text-xl font-bold ${strong}`}>{t('نظرة تشغيلية', 'Operations Overview')}</h2>

      {/* Headline stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label={t('إجمالي طلبات الفرص', 'Opportunity Requests')} value={reqSummary.total} />
        <StatCard icon={Bell} label={t('متابعات مستحقة', 'Follow-ups Due')} value={reqSummary.followUpsDue} tone={reqSummary.followUpsDue > 0 ? 'danger' : 'primary'} />
        <StatCard icon={ShieldAlert} label={t('تنبيهات أمان مفتوحة', 'Open Security Alerts')} value={alertSummary.openTotal} tone={alertSummary.open.critical > 0 ? 'danger' : 'primary'} />
        <StatCard icon={Megaphone} label={t('تحديثات منشورة', 'Published Updates')} value={updSummary.published} />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Requests by status */}
        <div className={card}>
          <p className={`mb-3 text-sm font-medium ${strong}`}>{t('الطلبات حسب الحالة', 'Requests by Status')}</p>
          {Object.keys(reqSummary.byStatus).length === 0 ? (
            <p className={`text-xs ${muted}`}>{t('لا توجد طلبات.', 'No requests.')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(reqSummary.byStatus).map(([s, n]) => <Chip key={s}>{requestLabel(s)}: <b>{n}</b></Chip>)}
            </div>
          )}
        </div>

        {/* Open alerts by severity */}
        <div className={card}>
          <p className={`mb-3 text-sm font-medium ${strong}`}>{t('التنبيهات المفتوحة حسب الخطورة', 'Open Alerts by Severity')}</p>
          <div className="flex flex-wrap gap-2">
            <Chip>{alertLabel('critical')}: <b className="text-red-600">{alertSummary.open.critical}</b></Chip>
            <Chip>{alertLabel('warning')}: <b>{alertSummary.open.warning}</b></Chip>
            <Chip>{alertLabel('info')}: <b>{alertSummary.open.info}</b></Chip>
          </div>
        </div>

        {/* Site updates published/draft */}
        <div className={card}>
          <p className={`mb-3 text-sm font-medium ${strong}`}>{t('تحديثات المنصة', 'Site Updates')}</p>
          <div className="flex flex-wrap gap-2">
            <Chip>{t('منشور', 'Published')}: <b>{updSummary.published}</b></Chip>
            <Chip>{t('مسودة', 'Draft')}: <b>{updSummary.draft}</b></Chip>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className={`mb-3 text-sm font-medium ${strong}`}>{t('روابط سريعة', 'Quick Links')}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickLinks.map((l) => (
            <Link key={l.to} to={l.to} className={`flex items-center justify-between gap-2 rounded-xl border p-4 transition-colors ${dark ? 'border-foreground/[0.06] bg-card hover:bg-foreground/5' : 'border-[#0A0B10]/[0.06] bg-white hover:bg-black/[0.03]'}`}>
              <span className="flex items-center gap-2">
                <l.icon className="h-5 w-5 text-primary" />
                <span className={`text-sm font-medium ${strong}`}>{ar ? l.ar : l.en}</span>
              </span>
              <Arrow className={`h-4 w-4 ${muted}`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
