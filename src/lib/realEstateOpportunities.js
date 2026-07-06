export const REAL_ESTATE_OPPORTUNITIES_FLAG = 'REAL_ESTATE_OPPORTUNITIES_ENABLED';
export const REAL_ESTATE_OPPORTUNITIES_FRONTEND_FLAG = 'VITE_REAL_ESTATE_OPPORTUNITIES_ENABLED';

export function isRealEstateOpportunitiesEnabled() {
  const value = import.meta.env[REAL_ESTATE_OPPORTUNITIES_FRONTEND_FLAG];
  return ['true', '1', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

export const CITIES = ['Jeddah', 'Riyadh', 'Makkah'];
export const BUDGET_RANGES = ['Less than 1M SAR', '1M–2M SAR', '2M–5M SAR', '5M–10M SAR', 'More than 10M SAR'];
export const RETURN_RANGES = ['5%–8%', '8%–12%', '12%–20%', 'More than 20%', 'Capital growth over 3–5 years'];
export const OPPORTUNITY_TYPES = ['rental_income', 'capital_growth', 'future_upside', 'mixed_use', 'land', 'residential', 'commercial'];
export const CONFIDENCE_LABELS = ['low', 'medium', 'high'];
export const RISK_LEVELS = ['low', 'medium', 'high'];
export const STATUSES = ['draft', 'under_analysis', 'approved', 'rejected', 'archived'];
export const VISIBILITIES = ['hidden', 'subscriber_teaser', 'internal_only'];
export const AUDIT_STATUSES = ['not_started', 'pending', 'approved', 'approved_with_notes', 'needs_review', 'rejected'];
export const GROWTH_CATALYSTS = ['government_project', 'commercial_development', 'infrastructure', 'tourism_entertainment', 'urban_development'];

export const AR_LABELS = {
  Jeddah: 'جدة', Riyadh: 'الرياض', Makkah: 'مكة',
  'Less than 1M SAR': 'أقل من 1 مليون ريال', '1M–2M SAR': '1–2 مليون ريال', '2M–5M SAR': '2–5 مليون ريال', '5M–10M SAR': '5–10 مليون ريال', 'More than 10M SAR': 'أكثر من 10 مليون ريال',
  '5%–8%': '5%–8%', '8%–12%': '8%–12%', '12%–20%': '12%–20%', 'More than 20%': 'أكثر من 20%', 'Capital growth over 3–5 years': 'نمو رأس المال خلال 3–5 سنوات',
  rental_income: 'دخل إيجاري', capital_growth: 'نمو رأسمالي', future_upside: 'صعود مستقبلي', mixed_use: 'متعدد الاستخدام', land: 'أرض', residential: 'سكني', commercial: 'تجاري',
  low: 'منخفض', medium: 'متوسط', high: 'مرتفع',
  draft: 'مسودة', under_analysis: 'تحت التحليل', approved: 'معتمدة', rejected: 'مرفوضة', archived: 'مؤرشفة', hidden: 'مخفية', subscriber_teaser: 'ظاهرة للمشتركين', internal_only: 'داخلي فقط',
  not_started: 'لم يبدأ', pending: 'قيد الانتظار', approved_with_notes: 'معتمد بملاحظات', needs_review: 'يحتاج مراجعة',
  government_project: 'مشروع حكومي', commercial_development: 'تطوير تجاري', infrastructure: 'بنية تحتية', tourism_entertainment: 'سياحة وترفيه', urban_development: 'تطوير حضري',
  whatsapp: 'واتساب', phone: 'اتصال', email: 'بريد إلكتروني', new: 'جديد', contacted: 'تم التواصل', qualified: 'مؤهل', closed: 'مغلق'
};

export function label(value) {
  return AR_LABELS[value] || value || '—';
}

export const SUBSCRIBER_TEASER_FIELDS = [
  'id', 'public_teaser_title', 'city', 'required_capital_range_public',
  'expected_return_range_public', 'expected_holding_period', 'opportunity_type',
  'confidence_label_public', 'growth_catalyst_type', 'teaser_image_public'
];

export function sanitizeTeaserOpportunity(opportunity = {}) {
  return SUBSCRIBER_TEASER_FIELDS.reduce((safe, field) => {
    safe[field] = opportunity[field] ?? null;
    return safe;
  }, {});
}

export const EMPTY_OPPORTUNITY = {
  title_internal: '', public_teaser_title: '', city: 'Riyadh', district_internal: '', location_internal: '', property_type: '', opportunity_type: 'residential', asking_price_exact: '', required_capital_range_public: '1M–2M SAR', expected_return_internal: '', expected_return_range_public: '8%–12%', expected_holding_period: '', confidence_score_internal: '', confidence_label_public: 'medium', risk_level: 'medium', status: 'draft', visibility: 'hidden', area: '', units_count: '', building_age: '', property_condition: '', listing_source: '', listing_url_internal: '', broker_or_owner_contact_internal: '', images_internal: [], teaser_image_public: '', fair_value_range_internal: '', expected_rent_internal: '', net_yield_internal: '', conservative_scenario: '', realistic_scenario: '', optimistic_scenario: '', five_year_projected_value_range: '', negotiation_start_price: '', max_acceptable_price: '', future_growth_thesis: '', growth_catalyst_type: 'urban_development', nearby_project_name_internal: '', project_status: '', estimated_project_impact: '', distance_to_project_internal: '', source_list: [], source_confidence: '', official_data_status: '', missing_data: '', data_conflicts: '', ai_audit_status: 'not_started', ai_audit_notes: '', brokerage_status: '', agreement_required: false, commission_estimate: '', client_request_count: 0, last_client_request_at: null,
};
