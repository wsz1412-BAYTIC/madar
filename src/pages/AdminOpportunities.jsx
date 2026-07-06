import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ShieldAlert } from 'lucide-react';
import { AUDIT_STATUSES, OPPORTUNITY_TYPES, RISK_LEVELS, STATUSES, VISIBILITIES, isRealEstateOpportunitiesEnabled, label } from '@/lib/realEstateOpportunities';

const ALL = 'all';

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ city: ALL, status: ALL, opportunity_type: ALL, risk_level: ALL, ai_audit_status: ALL, visibility: ALL });
  const enabled = isRealEstateOpportunitiesEnabled();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [opps, reqs] = await Promise.all([
        base44.entities.RealEstateOpportunity.list('-created_date'),
        base44.entities.OpportunityRequest.list('-createdAt'),
      ]);
      setOpportunities(opps || []);
      setRequests(reqs || []);
    } catch (err) {
      setError(err.message || 'تعذر تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => opportunities.filter((opportunity) => (
    Object.entries(filters).every(([key, value]) => value === ALL || opportunity[key] === value)
  )), [opportunities, filters]);

  const metrics = [
    ['إجمالي الفرص', opportunities.length],
    ['المعتمدة', opportunities.filter((item) => item.status === 'approved').length],
    ['تحت التحليل', opportunities.filter((item) => item.status === 'under_analysis').length],
    ['ظاهرة للمشتركين', opportunities.filter((item) => item.status === 'approved' && item.visibility === 'subscriber_teaser').length],
    ['طلبات واردة', requests.length],
  ];

  async function quickUpdate(id, patch) {
    await base44.entities.RealEstateOpportunity.update(id, patch);
    load();
  }

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#F2EFE8]">
      <AdminNav admin={{ role: 'admin' }} />
      <main className="flex-1 space-y-6 p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <h1 className="font-heading text-3xl font-bold">إدارة الفرص العقارية</h1>
            <p className="text-[#0A0B10]/60">لوحة داخلية كاملة للمدير الأعلى فقط.</p>
          </div>
          <Button asChild className="bg-gradient-to-r from-[#D95F3B] to-[#C8972A]"><Link to="/admin/opportunities/new"><Plus className="ml-2 h-4 w-4" /> إنشاء فرصة</Link></Button>
        </div>

        {!enabled && <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800"><ShieldAlert /> العلم REAL_ESTATE_OPPORTUNITIES_ENABLED معطل؛ المشترك يرى حالة قريباً والإدارة متاحة للاختبار.</div>}
        {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map(([name, value]) => <div key={name} className="rounded-2xl border bg-white p-5"><p className="text-sm opacity-60">{name}</p><p className="text-3xl font-bold">{value}</p></div>)}
        </div>

        <div className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3 xl:grid-cols-6">
          <Filter labelText="المدينة" value={filters.city} values={[ALL, 'Jeddah', 'Riyadh', 'Makkah']} onChange={(city) => setFilters({ ...filters, city })} />
          <Filter labelText="الحالة" value={filters.status} values={[ALL, ...STATUSES]} onChange={(status) => setFilters({ ...filters, status })} />
          <Filter labelText="النوع" value={filters.opportunity_type} values={[ALL, ...OPPORTUNITY_TYPES]} onChange={(opportunity_type) => setFilters({ ...filters, opportunity_type })} />
          <Filter labelText="المخاطر" value={filters.risk_level} values={[ALL, ...RISK_LEVELS]} onChange={(risk_level) => setFilters({ ...filters, risk_level })} />
          <Filter labelText="التدقيق" value={filters.ai_audit_status} values={[ALL, ...AUDIT_STATUSES]} onChange={(ai_audit_status) => setFilters({ ...filters, ai_audit_status })} />
          <Filter labelText="الظهور" value={filters.visibility} values={[ALL, ...VISIBILITIES]} onChange={(visibility) => setFilters({ ...filters, visibility })} />
        </div>

        {loading ? <div className="rounded-2xl bg-white p-8">جاري التحميل...</div> : <OpportunityTable opportunities={filtered} onQuickUpdate={quickUpdate} />}
      </main>
    </div>
  );
}

function OpportunityTable({ opportunities, onQuickUpdate }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-[#0A0B10]/5"><tr>{['العنوان الداخلي', 'المدينة', 'الحالة', 'الظهور', 'المخاطر', 'طلبات', 'إجراءات'].map((head) => <th key={head} className="p-3 text-right font-semibold">{head}</th>)}</tr></thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id} className="border-t">
              <td className="p-3"><Link className="font-semibold text-[#D95F3B]" to={`/admin/opportunities/${opportunity.id}`}>{opportunity.title_internal}</Link><p className="opacity-60">{opportunity.public_teaser_title}</p></td>
              <td className="p-3">{label(opportunity.city)}</td>
              <td className="p-3">{label(opportunity.status)}</td>
              <td className="p-3">{label(opportunity.visibility)}</td>
              <td className="p-3">{label(opportunity.risk_level)}</td>
              <td className="p-3">{opportunity.client_request_count || 0}</td>
              <td className="p-3"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => onQuickUpdate(opportunity.id, { status: 'approved' })}>اعتماد</Button><Button size="sm" variant="outline" onClick={() => onQuickUpdate(opportunity.id, { visibility: 'hidden' })}>إخفاء</Button><Button size="sm" variant="outline" onClick={() => onQuickUpdate(opportunity.id, { status: 'archived' })}>أرشفة</Button><Button size="sm" variant="outline" onClick={() => onQuickUpdate(opportunity.id, { status: 'rejected' })}>رفض</Button></div></td>
            </tr>
          ))}
          {opportunities.length === 0 && <tr><td colSpan="7" className="p-8 text-center opacity-60">لا توجد فرص مطابقة.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Filter({ labelText, value, values, onChange }) {
  return <div><label className="text-xs opacity-60">{labelText}</label><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{values.map((item) => <SelectItem key={item} value={item}>{item === ALL ? 'الكل' : label(item)}</SelectItem>)}</SelectContent></Select></div>;
}
