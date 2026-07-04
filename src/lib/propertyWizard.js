// Pure logic for the step-by-step Add Property wizard.
// Adapted for the Base44 UserProperty entity schema.

export const WIZARD_STEPS = ["basics", "details", "extras"];

export const CITIES = [
  { value: "Riyadh", en: "Riyadh", ar: "الرياض" },
  { value: "Jeddah", en: "Jeddah", ar: "جدة" },
  { value: "Makkah", en: "Makkah", ar: "مكة المكرمة" },
  { value: "Madinah", en: "Madinah", ar: "المدينة المنورة" },
  { value: "Dammam", en: "Dammam", ar: "الدمام" },
  { value: "Khobar", en: "Khobar", ar: "الخبر" },
  { value: "Abha", en: "Abha", ar: "أبها" },
  { value: "Other", en: "Other", ar: "أخرى" },
];

// Values match the UserProperty entity platform enum (lowercase).
export const PLATFORMS = [
  { value: "airbnb", en: "Airbnb", ar: "إير بي إن بي" },
  { value: "gatherin", en: "Gatherin", ar: "جاترن" },
  { value: "booking", en: "Booking.com", ar: "بوكينج" },
  { value: "other", en: "Other", ar: "أخرى" },
];

export const UNIT_TYPES = [
  { value: "apartment", en: "Apartment", ar: "شقة" },
  { value: "villa", en: "Villa", ar: "فيلا" },
  { value: "townhouse", en: "Townhouse", ar: "تاون هاوس" },
  { value: "chalet", en: "Chalet", ar: "شاليه" },
  { value: "other", en: "Other", ar: "أخرى" },
];

export const AVAILABILITY = [
  { value: "active", en: "Available", ar: "متاح" },
  { value: "inactive", en: "Paused", ar: "متوقف" },
];

export const AMENITIES = [
  { value: "wifi", en: "Wi-Fi", ar: "واي فاي" },
  { value: "pool", en: "Pool", ar: "مسبح" },
  { value: "parking", en: "Parking", ar: "موقف سيارات" },
  { value: "ac", en: "AC", ar: "مكيف" },
  { value: "kitchen", en: "Kitchen", ar: "مطبخ" },
  { value: "tv", en: "TV", ar: "تلفاز" },
  { value: "washer", en: "Washer", ar: "غسالة" },
  { value: "gym", en: "Gym", ar: "جيم" },
  { value: "elevator", en: "Elevator", ar: "مصعد" },
  { value: "garden", en: "Garden", ar: "حديقة" },
];

export const EMPTY_FORM = Object.freeze({
  name: "",
  city: "",
  district: "",
  platform: "",
  type: "",
  bedrooms: 1,
  bathrooms: 1,
  guests: 2,
  nightlyPrice: "",
  status: "active",
  amenities: [],
  photoUrl: "",
  platformUrl: "",
  notes: "",
});

const inRange = (n, min, max) => Number.isFinite(n) && n >= min && n <= max;

export function validateStep(step, form) {
  const errors = {};
  const need = (field, en, ar) => { errors[field] = { en, ar }; };

  if (step === "basics") {
    if (!form.name || form.name.trim().length < 2) {
      need("name", "Enter a property name (at least 2 characters)", "أدخل اسم العقار (حرفان على الأقل)");
    }
    if (!form.city) need("city", "Choose a city", "اختر المدينة");
    if (!form.district || form.district.trim().length < 2) {
      need("district", "Enter the district", "أدخل اسم الحي");
    }
    if (!form.platform) need("platform", "Choose the listing platform", "اختر منصة الإعلان");
    if (!form.platformUrl || form.platformUrl.trim().length < 5) {
      need("platformUrl", "Enter the listing URL", "أدخل رابط الإعلان");
    }
  }

  if (step === "details") {
    if (!form.type) need("type", "Choose the unit type", "اختر نوع الوحدة");
    if (!inRange(Number(form.bedrooms), 0, 20)) {
      need("bedrooms", "Bedrooms must be between 0 and 20", "عدد الغرف يجب أن يكون بين 0 و20");
    }
    if (!inRange(Number(form.bathrooms), 1, 20)) {
      need("bathrooms", "Bathrooms must be between 1 and 20", "عدد الحمامات يجب أن يكون بين 1 و20");
    }
    if (!inRange(Number(form.guests), 1, 50)) {
      need("guests", "Max guests must be between 1 and 50", "عدد الضيوف يجب أن يكون بين 1 و50");
    }
    const price = Number(form.nightlyPrice);
    if (!Number.isFinite(price) || price <= 0 || price > 100000 || form.nightlyPrice === "") {
      need("nightlyPrice", "Enter a nightly price in SAR (1–100,000)", "أدخل السعر لليلة بالريال (1–100,000)");
    }
    if (!form.status) need("status", "Choose the availability status", "اختر حالة التوفر");
  }

  if (step === "extras") {
    const urlish = (v) => /^https?:\/\/\S+\.\S+/.test(v);
    if (form.photoUrl && !urlish(form.photoUrl.trim())) {
      need("photoUrl", "Enter a valid image link (https://…)", "أدخل رابط صورة صحيحاً (https://…)");
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAll(form) {
  return WIZARD_STEPS.every((s) => validateStep(s, form).valid);
}

/**
 * Build the UserProperty create payload from a validated form.
 * Maps wizard fields to the Base44 UserProperty entity schema.
 */
export function buildPropertyPayload(form) {
  return {
    property_name: form.name.trim(),
    property_url: form.platformUrl.trim(),
    city: form.city,
    neighborhood: form.district.trim(),
    platform: form.platform,
    property_type: form.type,
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    max_guests: Number(form.guests),
    price: Number(form.nightlyPrice),
    is_active: form.status === "active",
    amenities: form.amenities || [],
    images: form.photoUrl ? [form.photoUrl.trim()] : [],
    featured_image: form.photoUrl ? form.photoUrl.trim() : null,
    notes: form.notes ? form.notes.trim() : null,
  };
}