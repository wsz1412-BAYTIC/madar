import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Lock, Send, Sparkles } from 'lucide-react';
import {
  BUDGET_RANGES,
  CITIES,
  RETURN_RANGES,
  isRealEstateOpportunitiesEnabled,
  label,
} from '@/lib/realEstateOpportunities';

const INITIAL_FILTERS = {
  city: 'Riyadh',
  budgetRange: '1M–2M SAR',
  districts: '',
  targetReturnRange: '8%–12%',
};

const INITIAL_REQUEST = {
  name: '',
  mobile: '',
  preferredContactMethod: 'whatsapp',
  budgetRange: '1M–2M SAR',
  message: '',
  agreementAccepted: false,
};

export default function Opportunities() {
  const { theme } = useTheme();
  const enabled = isRealEstateOpportunitiesEnabled();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(enabled);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [requestForm, setRequestForm] = useState(INITIAL_REQUEST);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pageClass = theme === 'dark' ? 'bg-background text-foreground' : 'bg-[#F7F5F0] text-[#0A0B10]';
  const cardClass = theme === 'dark' ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white border-[#0A0B10]/10';

  async function loadOpportunities(nextFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('real-estate-opportunities', {
        action: 'list_teasers',
        filters: nextFilters,
      });
      setOpportunities(response.data?.opportunities || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'تعذر تحميل الفرص حالياً.');
    } finally {
      setLoading(false);
    }
  }

  function submitFilters(event) {
    event.preventDefault();
    setShowFilters(false);
    loadOpportunities(filters);
  }

  function openRequest(opportunity) {
    setSelectedOpportunity(opportunity);
    setRequestSent(false);
    setRequestForm({ ...INITIAL_REQUEST, budgetRange: opportunity.required_capital_range_public });
  }

  async function submitRequest(event) {
    event.preventDefault();
    setError('');
    if (!requestForm.name || !requestForm.mobile || !requestForm.agreementAccepted) {
      setError('يرجى تعبئة الاسم والجوال وقبول الإقرار.');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('real-estate-opportunities', {
        action: 'create_request',
        opportunityId: selectedOpportunity.id,
        form: requestForm,
      });
      setRequestSent(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'تعذر إرسال الطلب.');
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <div dir="rtl" className={`min-h-screen ${pageClass}`}>
        <PublicNavbar />
        <main className="px-4 pt-32 pb-20">
          <section className={`mx-auto max-w-3xl rounded-3xl border p-10 text-center ${cardClass}`}>
            <Lock className="mx-auto mb-4 h-12 w-12 text-[#D95F3B]" />
            <h1 className="mb-4 font-heading text-4xl font-bold">فرص مادار العقارية قريباً</h1>
            <p className="text-lg opacity-70">
              نجهز تجربة آمنة تعرض مؤشرات عامة للمستثمرين دون كشف بيانات الصفقات الحساسة.
            </p>
          </section>
        </main>
        <ComprehensiveFooter />
      </div>
    );
  }

  return (
    <div dir="rtl" className={`min-h-screen ${pageClass}`}>
      <PublicNavbar />
      <main className="px-4 pt-28 pb-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className={`rounded-3xl border p-8 ${cardClass}`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 font-semibold text-[#D95F3B]">منصة الفرص العقارية</p>
                <h1 className="mb-3 font-heading text-4xl font-bold">فرص منتقاة بمعلومات تمهيدية آمنة</h1>
                <p className="max-w-3xl opacity-70">
                  تظهر للمشترك المدينة ونطاق رأس المال والعائد ومدة الاحتفاظ فقط. تفاصيل الموقع والسعر والمصادر محفوظة للإدارة العليا.
                </p>
              </div>
              <Button onClick={() => setShowFilters(true)} className="bg-gradient-to-r from-[#D95F3B] to-[#C8972A]">
                تعديل التفضيلات
              </Button>
            </div>
          </section>

          {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}
          {loading && <div className={`rounded-xl border p-6 ${cardClass}`}>جاري التحميل...</div>}
          {!loading && opportunities.length === 0 && <EmptyState cardClass={cardClass} />}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opportunity) => (
              <TeaserCard key={opportunity.id} opportunity={opportunity} cardClass={cardClass} onRequest={openRequest} />
            ))}
          </div>
        </div>
      </main>
      <ComprehensiveFooter />

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>حدّد تفضيلات الاستثمار</DialogTitle></DialogHeader>
          <form onSubmit={submitFilters} className="space-y-4">
            <SelectField labelText="المدينة" value={filters.city} values={CITIES} onChange={(city) => setFilters({ ...filters, city })} />
            <SelectField labelText="الحد الأعلى للشراء" value={filters.budgetRange} values={BUDGET_RANGES} onChange={(budgetRange) => setFilters({ ...filters, budgetRange })} />
            <Input placeholder="الأحياء المفضلة (اختياري)" value={filters.districts} onChange={(event) => setFilters({ ...filters, districts: event.target.value })} />
            <SelectField labelText="نطاق العائد المستهدف (اختياري)" value={filters.targetReturnRange} values={RETURN_RANGES} onChange={(targetReturnRange) => setFilters({ ...filters, targetReturnRange })} />
            <Button type="submit" className="w-full bg-gradient-to-r from-[#D95F3B] to-[#C8972A]">عرض الفرص</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedOpportunity)} onOpenChange={(open) => !open && setSelectedOpportunity(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{requestSent ? 'تم إرسال الطلب' : 'طلب دراسة الفرصة'}</DialogTitle></DialogHeader>
          {requestSent ? (
            <div className="space-y-4">
              <p className="font-semibold text-green-700">تم استلام طلبك. سيتواصل فريق مادار معك دون كشف بيانات حساسة داخل هذه الشاشة.</p>
              <Button onClick={() => setSelectedOpportunity(null)} className="w-full">إغلاق</Button>
            </div>
          ) : (
            <form onSubmit={submitRequest} className="space-y-3">
              <Input placeholder="الاسم *" value={requestForm.name} onChange={(event) => setRequestForm({ ...requestForm, name: event.target.value })} />
              <Input placeholder="رقم الجوال *" value={requestForm.mobile} onChange={(event) => setRequestForm({ ...requestForm, mobile: event.target.value })} />
              <SelectField labelText="طريقة التواصل" value={requestForm.preferredContactMethod} values={['whatsapp', 'phone', 'email']} onChange={(preferredContactMethod) => setRequestForm({ ...requestForm, preferredContactMethod })} />
              <SelectField labelText="نطاق الميزانية" value={requestForm.budgetRange} values={BUDGET_RANGES} onChange={(budgetRange) => setRequestForm({ ...requestForm, budgetRange })} />
              <Textarea placeholder="رسالة اختيارية" value={requestForm.message} onChange={(event) => setRequestForm({ ...requestForm, message: event.target.value })} />
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={requestForm.agreementAccepted} onCheckedChange={(checked) => setRequestForm({ ...requestForm, agreementAccepted: checked === true })} />
                <span>أوافق مبدئياً على متطلبات اتفاقية دراسة الفرصة عند التواصل.</span>
              </label>
              <Button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-[#D95F3B] to-[#C8972A]">إرسال الطلب</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ cardClass }) {
  return (
    <div className={`rounded-2xl border p-10 text-center ${cardClass}`}>
      <Sparkles className="mx-auto mb-3 h-10 w-10 text-[#C8972A]" />
      <h2 className="mb-2 text-2xl font-bold">لا توجد فرص مطابقة حالياً</h2>
      <p className="opacity-70">غيّر المدينة أو نطاق الميزانية، أو عد لاحقاً عند اعتماد فرص جديدة.</p>
    </div>
  );
}

function TeaserCard({ opportunity, cardClass, onRequest }) {
  return (
    <article className={`overflow-hidden rounded-2xl border ${cardClass}`}>
      {opportunity.teaser_image_public ? (
        <img src={opportunity.teaser_image_public} alt="" className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#D95F3B]/20 to-[#C8972A]/20">
          <Building2 className="h-12 w-12 text-[#D95F3B]" />
        </div>
      )}
      <div className="space-y-4 p-6">
        <div>
          <p className="text-sm font-semibold text-[#D95F3B]">{label(opportunity.city)}</p>
          <h3 className="text-xl font-bold">{opportunity.public_teaser_title || 'فرصة عقارية مختارة'}</h3>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Info labelText="رأس المال" value={label(opportunity.required_capital_range_public)} />
          <Info labelText="العائد المتوقع" value={label(opportunity.expected_return_range_public)} />
          <Info labelText="مدة الاحتفاظ" value={opportunity.expected_holding_period || '—'} />
          <Info labelText="نوع الفرصة" value={label(opportunity.opportunity_type)} />
          <Info labelText="الثقة" value={label(opportunity.confidence_label_public)} />
          <Info labelText="محفز النمو" value={label(opportunity.growth_catalyst_type)} />
        </dl>
        <Button onClick={() => onRequest(opportunity)} className="w-full bg-[#0A0B10] text-white hover:bg-[#0A0B10]/90">
          <Send className="ml-2 h-4 w-4" /> طلب دراسة الفرصة
        </Button>
      </div>
    </article>
  );
}

function Info({ labelText, value }) {
  return (
    <div className="rounded-xl bg-black/5 p-3">
      <dt className="mb-1 opacity-60">{labelText}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function SelectField({ labelText, value, values, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{labelText}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{values.map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
