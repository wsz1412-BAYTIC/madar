import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AUDIT_STATUSES, BUDGET_RANGES, CITIES, CONFIDENCE_LABELS, EMPTY_OPPORTUNITY, GROWTH_CATALYSTS, OPPORTUNITY_TYPES, RETURN_RANGES, RISK_LEVELS, STATUSES, VISIBILITIES, label } from '@/lib/realEstateOpportunities';

const FIELD_GROUPS = [
  ['البيانات الأساسية', ['title_internal', 'public_teaser_title', 'city', 'district_internal', 'location_internal', 'property_type', 'opportunity_type', 'asking_price_exact', 'required_capital_range_public', 'expected_return_internal', 'expected_return_range_public', 'expected_holding_period', 'confidence_score_internal', 'confidence_label_public', 'risk_level', 'status', 'visibility']],
  ['العقار', ['area', 'units_count', 'building_age', 'property_condition', 'listing_source', 'listing_url_internal', 'broker_or_owner_contact_internal', 'teaser_image_public']],
  ['البيانات المالية', ['fair_value_range_internal', 'expected_rent_internal', 'net_yield_internal', 'conservative_scenario', 'realistic_scenario', 'optimistic_scenario', 'five_year_projected_value_range', 'negotiation_start_price', 'max_acceptable_price']],
  ['النمو', ['future_growth_thesis', 'growth_catalyst_type', 'nearby_project_name_internal', 'project_status', 'estimated_project_impact', 'distance_to_project_internal']],
  ['التحقق والتدقيق', ['source_confidence', 'official_data_status', 'missing_data', 'data_conflicts', 'ai_audit_status', 'ai_audit_notes']],
  ['الوساطة', ['brokerage_status', 'agreement_required', 'commission_estimate', 'client_request_count', 'last_client_request_at']],
];

const SELECT_OPTIONS = {
  city: CITIES,
  opportunity_type: OPPORTUNITY_TYPES,
  required_capital_range_public: BUDGET_RANGES,
  expected_return_range_public: RETURN_RANGES,
  confidence_label_public: CONFIDENCE_LABELS,
  risk_level: RISK_LEVELS,
  status: STATUSES,
  visibility: VISIBILITIES,
  growth_catalyst_type: GROWTH_CATALYSTS,
  ai_audit_status: AUDIT_STATUSES,
};

const FIELD_LABELS = {
  title_internal: 'العنوان الداخلي', public_teaser_title: 'عنوان البطاقة العام', city: 'المدينة', district_internal: 'الحي الداخلي', location_internal: 'الموقع الداخلي', property_type: 'نوع العقار', opportunity_type: 'نوع الفرصة', asking_price_exact: 'السعر المطلوب الدقيق', required_capital_range_public: 'نطاق رأس المال العام', expected_return_internal: 'العائد الداخلي', expected_return_range_public: 'نطاق العائد العام', expected_holding_period: 'مدة الاحتفاظ', confidence_score_internal: 'درجة الثقة الداخلية', confidence_label_public: 'تصنيف الثقة العام', risk_level: 'مستوى المخاطر', status: 'الحالة', visibility: 'الظهور', area: 'المساحة', units_count: 'عدد الوحدات', building_age: 'عمر المبنى', property_condition: 'حالة العقار', listing_source: 'مصدر الإعلان', listing_url_internal: 'رابط الإعلان الداخلي', broker_or_owner_contact_internal: 'تواصل المالك/الوسيط', teaser_image_public: 'صورة عامة', fair_value_range_internal: 'نطاق القيمة العادلة الداخلي', expected_rent_internal: 'الإيجار المتوقع', net_yield_internal: 'صافي العائد', conservative_scenario: 'سيناريو متحفظ', realistic_scenario: 'سيناريو واقعي', optimistic_scenario: 'سيناريو متفائل', five_year_projected_value_range: 'قيمة 5 سنوات', negotiation_start_price: 'سعر بدء التفاوض', max_acceptable_price: 'أعلى سعر مقبول', future_growth_thesis: 'فرضية النمو', growth_catalyst_type: 'محفز النمو', nearby_project_name_internal: 'اسم المشروع القريب', project_status: 'حالة المشروع', estimated_project_impact: 'الأثر المتوقع', distance_to_project_internal: 'المسافة للمشروع', source_confidence: 'ثقة المصادر', official_data_status: 'حالة البيانات الرسمية', missing_data: 'بيانات ناقصة', data_conflicts: 'تعارضات البيانات', ai_audit_status: 'حالة تدقيق AI', ai_audit_notes: 'ملاحظات تدقيق AI', brokerage_status: 'حالة الوساطة', agreement_required: 'يتطلب اتفاقية', commission_estimate: 'تقدير العمولة', client_request_count: 'عدد الطلبات', last_client_request_at: 'آخر طلب'
};

const TEXTAREA_FIELDS = new Set(['location_internal', 'broker_or_owner_contact_internal', 'conservative_scenario', 'realistic_scenario', 'optimistic_scenario', 'future_growth_thesis', 'estimated_project_impact', 'missing_data', 'data_conflicts', 'ai_audit_notes']);

export default function AdminOpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(EMPTY_OPPORTUNITY);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    base44.entities.RealEstateOpportunity.get(id)
      .then((opportunity) => setForm({ ...EMPTY_OPPORTUNITY, ...opportunity }))
      .catch((err) => setError(err.message || 'تعذر تحميل الفرصة.'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    if (!form.title_internal || !form.public_teaser_title || !form.city) {
      setError('العنوان الداخلي، عنوان البطاقة العام، والمدينة حقول مطلوبة.');
      return;
    }
    try {
      const saved = isNew
        ? await base44.entities.RealEstateOpportunity.create(form)
        : await base44.entities.RealEstateOpportunity.update(id, form);
      navigate(`/admin/opportunities/${saved.id || id}`);
    } catch (err) {
      setError(err.message || 'تعذر حفظ الفرصة.');
    }
  }

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#F2EFE8]">
      <AdminNav admin={{ role: 'admin' }} />
      <main className="flex-1 p-6 lg:p-8">
        <form onSubmit={save} className="max-w-6xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold">{isNew ? 'إنشاء فرصة عقارية' : 'تفاصيل فرصة عقارية'}</h1>
              <p className="opacity-60">جميع الحقول الحساسة داخلية ولا تظهر للمشتركين.</p>
            </div>
            <Button className="bg-gradient-to-r from-[#D95F3B] to-[#C8972A]">حفظ</Button>
          </div>
          {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}
          {loading ? <div className="rounded-2xl bg-white p-8">جاري التحميل...</div> : FIELD_GROUPS.map(([title, fields]) => (
            <section key={title} className="rounded-2xl border bg-white p-5">
              <h2 className="mb-4 text-xl font-bold">{title}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fields.map((field) => <Field key={field} field={field} value={form[field]} onChange={updateField} />)}
              </div>
            </section>
          ))}
        </form>
      </main>
    </div>
  );
}

function Field({ field, value, onChange }) {
  if (field === 'agreement_required') {
    return <label className="mt-6 flex items-center gap-2 rounded-xl border p-3"><Checkbox checked={value === true} onCheckedChange={(checked) => onChange(field, checked === true)} />{FIELD_LABELS[field]}</label>;
  }
  if (SELECT_OPTIONS[field]) {
    return <div><label className="text-sm font-medium">{FIELD_LABELS[field]}</label><Select value={String(value || '')} onValueChange={(next) => onChange(field, next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SELECT_OPTIONS[field].map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select></div>;
  }
  const Component = TEXTAREA_FIELDS.has(field) ? Textarea : Input;
  return <div><label className="text-sm font-medium">{FIELD_LABELS[field] || field}</label><Component value={value ?? ''} onChange={(event) => onChange(field, event.target.value)} /></div>;
}
