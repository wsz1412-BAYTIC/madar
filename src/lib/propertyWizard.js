// Pure logic for the step-by-step Add Property wizard.
// No React, no SDK — validation and payload-building are unit-tested here and
// consumed by components/madar/AddPropertyWizard.jsx.

export const WIZARD_STEPS = ['basics', 'details', 'extras'];

export const CITIES = [
  { value: 'Riyadh', en: 'Riyadh', ar: 'الرياض' },
  { value: 'Jeddah', en: 'Jeddah', ar: 'جدة' },
  { value: 'Makkah', en: 'Makkah', ar: 'مكة المكرمة' },
  { value: 'Madinah', en: 'Madinah', ar: 'المدينة المنورة' },
  { value: 'Dammam', en: 'Dammam', ar: 'الدمام' },
  { value: 'Khobar', en: 'Khobar', ar: 'الخبر' },
  { value: 'Abha', en: 'Abha', ar: 'أبها' },
  { value: 'Other', en: 'Other', ar: 'أخرى' },
];

export const PLATFORMS = [
  { value: 'Airbnb', en: 'Airbnb', ar: 'إير بي إن بي' },
  { value: 'Gathern', en: 'Gathern', ar: 'جاذرن' },
  { value: 'Booking.com', en: 'Booking.com', ar: 'بوكينج' },
  { value: 'Other', en: 'Other', ar: 'أخرى' },
];

// Matches the UserProperty entity's `type` enum.
export const UNIT_TYPES = [
  { value: 'apartment', en: 'Apartment', ar: 'شقة' },
  { value: 'villa', en: 'Villa', ar: 'فيلا' },
  { value: 'townhouse', en: 'Townhouse', ar: 'تاون هاوس' },
  { value: 'chalet', en: 'Chalet', ar: 'شاليه' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
];

// Matches the UserProperty entity's `status` enum ('inactive' shown as Paused).
export const AVAILABILITY = [
  { value: 'active', en: 'Available', ar: 'متاح' },
  { value: 'inactive', en: 'Paused', ar: 'متوقف' },
];

export const AMENITIES = [
  { value: 'wifi', en: 'Wi-Fi', ar: 'واي فاي' },
  { value: 'parking', en: 'Parking', ar: 'موقف سيارات' },
  { value: 'pool', en: 'Pool', ar: 'مسبح' },
  { value: 'kitchen', en: 'Kitchen', ar: 'مطبخ' },
  { value: 'ac', en: 'A/C', ar: 'تكييف' },
  { value: 'washer', en: 'Washer', ar: 'غسالة' },
];

export const EMPTY_FORM = Object.freeze({
  name: '',
  city: '',
  district: '',
  platform: '',
  type: '',
  bedrooms: 1,
  bathrooms: 1,
  guests: 2,
  nightlyPrice: '',
  status: 'active',
  amenities: [],
  photoUrl: '',
  platformUrl: '',
  notes: '',
});

const inRange = (n, min, max) => Number.isFinite(n) && n >= min && n <= max;

/**
 * Validate one wizard step. Returns { valid, errors } where errors maps field
 * name → bilingual message { en, ar }. Only the failing fields are present.
 */
export function validateStep(step, form) {
  const errors = {};
  const need = (field, en, ar) => { errors[field] = { en, ar }; };

  if (step === 'basics') {
    if (!form.name || form.name.trim().length < 2) {
      need('name', 'Enter a property name (at least 2 characters)', 'أدخل اسم العقار (حرفان على الأقل)');
    }
    if (!form.city) need('city', 'Choose a city', 'اختر المدينة');
    if (!form.district || form.district.trim().length < 2) {
      need('district', 'Enter the district', 'أدخل اسم الحي');
    }
    if (!form.platform) need('platform', 'Choose the listing platform', 'اختر منصة الإعلان');
  }

  if (step === 'details') {
    if (!form.type) need('type', 'Choose the unit type', 'اختر نوع الوحدة');
    if (!inRange(Number(form.bedrooms), 0, 20)) {
      need('bedrooms', 'Bedrooms must be between 0 and 20', 'عدد الغرف يجب أن يكون بين 0 و20');
    }
    if (!inRange(Number(form.bathrooms), 1, 20)) {
      need('bathrooms', 'Bathrooms must be between 1 and 20', 'عدد الحمامات يجب أن يكون بين 1 و20');
    }
    if (!inRange(Number(form.guests), 1, 50)) {
      need('guests', 'Max guests must be between 1 and 50', 'عدد الضيوف يجب أن يكون بين 1 و50');
    }
    const price = Number(form.nightlyPrice);
    if (!Number.isFinite(price) || price <= 0 || price > 100000 || form.nightlyPrice === '') {
      need('nightlyPrice', 'Enter a nightly price in SAR (1–100,000)', 'أدخل السعر لليلة بالريال (1–100,000)');
    }
    if (!form.status) need('status', 'Choose the availability status', 'اختر حالة التوفر');
  }

  if (step === 'extras') {
    // Everything optional; only validate format when provided.
    const urlish = (v) => /^https?:\/\/\S+\.\S+/.test(v);
    if (form.platformUrl && !urlish(form.platformUrl.trim())) {
      need('platformUrl', 'Enter a valid link (https://…)', 'أدخل رابطًا صحيحًا (https://…)');
    }
    if (form.photoUrl && !urlish(form.photoUrl.trim())) {
      need('photoUrl', 'Enter a valid image link (https://…)', 'أدخل رابط صورة صحيحًا (https://…)');
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** True when every step of the form validates. */
export function validateAll(form) {
  return WIZARD_STEPS.every((s) => validateStep(s, form).valid);
}

/**
 * Build the UserProperty create payload from a validated form. `userId` comes
 * from the authenticated session — never from the form.
 */
export function buildPropertyPayload(userId, form) {
  if (!userId) throw new Error('buildPropertyPayload requires the authenticated userId');
  return {
    userId,
    name: form.name.trim(),
    city: form.city,
    district: form.district.trim(),
    platform: form.platform,
    type: form.type,
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    guests: Number(form.guests),
    nightlyPrice: Number(form.nightlyPrice),
    status: form.status,
    amenities: form.amenities || [],
    images: form.photoUrl ? [form.photoUrl.trim()] : [],
    platformUrl: form.platformUrl ? form.platformUrl.trim() : null,
    notes: form.notes ? form.notes.trim() : null,
  };
}
