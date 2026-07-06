import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminNav from '@/components/admin/AdminNav';
import { label } from '@/lib/realEstateOpportunities';

export default function AdminOpportunityRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.OpportunityRequest.list('-createdAt')
      .then((rows) => setRequests(rows || []))
      .catch((err) => setError(err.message || 'تعذر تحميل الطلبات.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#F2EFE8]">
      <AdminNav admin={{ role: 'admin' }} />
      <main className="flex-1 space-y-6 p-6 lg:p-8">
        <div><h1 className="font-heading text-3xl font-bold">طلبات دراسات الفرص</h1><p className="opacity-60">طلبات المشتركين المرتبطة ببطاقات الفرص العامة.</p></div>
        {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}
        {loading ? <div className="rounded-2xl bg-white p-8">جاري التحميل...</div> : <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-sm"><thead className="bg-[#0A0B10]/5"><tr>{['التاريخ', 'الفرصة', 'الاسم', 'الجوال', 'التواصل', 'الميزانية', 'الرسالة', 'الحالة'].map((head) => <th key={head} className="p-3 text-right">{head}</th>)}</tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-t"><td className="p-3">{request.createdAt ? new Date(request.createdAt).toLocaleString('ar-SA') : '—'}</td><td className="p-3">{request.opportunityTeaserTitle || request.opportunityId}</td><td className="p-3 font-semibold">{request.name}</td><td className="p-3">{request.mobile}</td><td className="p-3">{label(request.preferredContactMethod)}</td><td className="p-3">{label(request.budgetRange)}</td><td className="max-w-sm whitespace-pre-wrap p-3">{request.message || '—'}</td><td className="p-3">{label(request.status || 'new')}</td></tr>)}{requests.length === 0 && <tr><td colSpan="8" className="p-8 text-center opacity-60">لا توجد طلبات حتى الآن.</td></tr>}</tbody></table></div>}
      </main>
    </div>
  );
}
