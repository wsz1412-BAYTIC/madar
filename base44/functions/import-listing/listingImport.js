// Listing-URL parsing + safe public-data extraction for the
// "Add property by link" flow.
//
// Root cause of the old "Method Not Allowed": the Preview button POSTed to a
// legacy endpoint (https://aimadar.com/api/properties/import) that has no such
// route, and the raw 405 was surfaced to the user. The flow now validates the
// link locally, then asks the import-listing backend function to fetch the
// PUBLIC listing page server-side and extract safe, public fields (title,
// unit type, bedrooms, images…). Every failure maps to a friendly bilingual
// message and a manual-entry fallback — raw upstream errors are never shown.
//
// Pure module — unit-tested, no network, no DOM. Mirrored byte-for-byte into
// base44/functions/import-listing/ (enforced by functionMirrors.test.js), so
// the browser and the Deno function always agree on what a valid link is.

const PATTERNS = [
  {
    platform: 'Airbnb',
    // Any Airbnb locale/subdomain: airbnb.com, ar.airbnb.com, www.airbnb.ae,
    // airbnb.co.uk … listing path is always /rooms/<id> (id may be numeric or
    // a plus/luxe slug).
    re: /^https?:\/\/(?:[\w-]+\.)*airbnb\.[a-z.]{2,6}\/rooms\/(?:plus\/|luxury\/)?\d+/i,
    extraction: true,
  },
  {
    platform: 'Gathern',
    // gathern.co listing links: /unit/<id> or /chalet/... variants.
    re: /^https?:\/\/(?:[\w-]+\.)*gathern\.co(?:m)?\/(?:unit|chalet|property)\/\S+/i,
    extraction: false, // URL pattern ready; extractor not built yet
  },
  {
    platform: 'Booking.com',
    // booking.com/hotel/<cc>/<slug>
    re: /^https?:\/\/(?:[\w-]+\.)*booking\.com\/hotel\/[a-z]{2}\/\S+/i,
    extraction: false, // URL pattern ready; extractor not built yet
  },
];

const ERRORS = {
  empty: {
    en: 'Paste a listing link first.',
    ar: 'الصق رابط الإعلان أولًا.',
  },
  notUrl: {
    en: 'This does not look like a valid link — it should start with https://',
    ar: 'هذا لا يبدو رابطًا صحيحًا — يجب أن يبدأ بـ https://',
  },
  unsupported: {
    en: 'Only Airbnb, Gathern and Booking.com listing links are supported (e.g. airbnb.com/rooms/…).',
    ar: 'الروابط المدعومة هي إعلانات Airbnb وGathern وBooking.com فقط (مثال: airbnb.com/rooms/…).',
  },
};

/**
 * Parse a pasted listing URL.
 * Returns { valid: true, platform, url, extraction } for a recognized listing
 * link (url is canonical: origin + path, no query/tracking, lowercase host),
 * or { valid: false, error: { en, ar } } otherwise. Never throws.
 */
export function parseListingUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return { valid: false, error: ERRORS.empty };

  let url;
  try {
    url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { valid: false, error: ERRORS.notUrl };
    }
  } catch {
    return { valid: false, error: ERRORS.notUrl };
  }

  for (const { platform, re, extraction } of PATTERNS) {
    if (re.test(raw)) {
      return { valid: true, platform, url: canonicalListingUrl(raw), extraction };
    }
  }
  return { valid: false, error: ERRORS.unsupported };
}

/**
 * Canonical form of a listing URL used for storage and duplicate detection:
 * lowercase host, no query/tracking params, no hash, no trailing slash.
 * Returns null for unparseable input.
 */
export function canonicalListingUrl(input) {
  try {
    const url = new URL(String(input || '').trim());
    const path = url.pathname.replace(/\/+$/, '');
    return `${url.protocol}//${url.host.toLowerCase()}${path}`;
  } catch {
    return null;
  }
}

// ── Multi-platform links per property ───────────────────────────────────────

export const DUPLICATE_LINK = Object.freeze({
  en: 'This property link is already added',
  ar: 'رابط هذا العقار مضاف مسبقًا',
});

/**
 * Duplicate check for a property's links list: the same canonical URL, or a
 * second link for a platform the property already has, is a duplicate.
 * Returns the offending existing entry, or null when the link is new.
 */
export function findDuplicateLink(links, candidateUrl, platform) {
  const canonical = canonicalListingUrl(candidateUrl);
  for (const link of links || []) {
    if (canonical && canonicalListingUrl(link.url) === canonical) return link;
    if (platform && link.platform === platform) return link;
  }
  return null;
}

/** Build one entry of UserProperty.links. */
export function buildLinkEntry(platform, url, now = new Date()) {
  return {
    platform,
    url: canonicalListingUrl(url),
    addedAt: now.toISOString(),
  };
}

// ── Friendly outcomes (never raw errors) ────────────────────────────────────

export const IMPORT_FAILED = Object.freeze({
  en: 'We could not read this listing automatically — you can continue manually and edit everything below.',
  ar: 'تعذّرت قراءة هذا الإعلان تلقائيًا — يمكنك المتابعة يدويًا وتعديل جميع الحقول أدناه.',
});

export const IMPORT_PLATFORM_PENDING = Object.freeze({
  en: 'Automatic import for this platform is coming soon — continue manually and we will prefill the platform and link.',
  ar: 'الاستيراد التلقائي لهذه المنصة قادم قريبًا — تابع يدويًا وسنعبّئ المنصة والرابط مسبقًا.',
});

export const IMPORT_SUCCESS = Object.freeze({
  en: 'Listing details filled in — review and edit any field before saving.',
  ar: 'تم تعبئة بيانات الإعلان — راجع الحقول وعدّل ما تشاء قبل الحفظ.',
});

// ── Safe public-data extraction (server-side; parser kept pure) ─────────────

// Cities the wizard knows, with the names each platform shows publicly.
const CITY_MATCHERS = [
  { value: 'Riyadh', names: ['riyadh', 'الرياض'] },
  { value: 'Jeddah', names: ['jeddah', 'jiddah', 'جدة', 'جده'] },
  { value: 'Makkah', names: ['makkah', 'mecca', 'مكة'] },
  { value: 'Madinah', names: ['madinah', 'medina', 'المدينة المنورة'] },
  { value: 'Dammam', names: ['dammam', 'الدمام'] },
  { value: 'Khobar', names: ['khobar', 'الخبر'] },
  { value: 'Abha', names: ['abha', 'أبها', 'ابها'] },
];

const TYPE_MATCHERS = [
  { value: 'villa', re: /\bvillas?\b|فيلا|فلة/i },
  { value: 'chalet', re: /\bchalets?\b|شاليه/i },
  { value: 'townhouse', re: /\btown\s?house\b|تاون هاوس/i },
  { value: 'apartment', re: /\bapartments?\b|\bflat\b|\bstudio\b|\bcondo\b|شقة|استوديو/i },
];

const decodeEntities = (s) =>
  String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&middot;|&#183;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .trim();

const metaContent = (html, property) => {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  const m = re.exec(html);
  return m ? decodeEntities(m[1] || m[2]) : null;
};

const firstNumber = (text, re) => {
  const m = re.exec(text);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
};

/**
 * Extract SAFE PUBLIC fields from a listing page's HTML. Only what the page
 * announces publicly (OpenGraph/meta + human-readable counts) — no private
 * data, no login-gated content. Best-effort: any field may be null.
 * Returns null when the page has nothing recognizable (bot wall, error page).
 */
export function extractListingData(html, platform = 'Airbnb') {
  const source = String(html || '');
  if (!source) return null;

  const title = metaContent(source, 'og:title');
  const description = metaContent(source, 'og:description') || '';
  const image = metaContent(source, 'og:image');
  if (!title && !description && !image) return null;

  // Airbnb og:description reads like:
  //   "Entire villa in Riyadh, Saudi Arabia. 4 guests · 2 bedrooms · 3 beds · 2 baths."
  // (or the Arabic equivalent on ar.airbnb.com pages).
  const haystack = `${title || ''} · ${description}`;
  const bedrooms =
    firstNumber(haystack, /(\d+)\s*(?:bed\s?rooms?\b)/i) ??
    firstNumber(haystack, /(\d+)\s*(?:غرف(?:ة)?\s*نوم)/);
  const bathrooms =
    firstNumber(haystack, /(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?\b)/i) ??
    firstNumber(haystack, /(\d+)\s*(?:حمام(?:ات)?)/);
  const guests =
    firstNumber(haystack, /(\d+)\s*(?:guests?\b)/i) ??
    firstNumber(haystack, /(\d+)\s*(?:ضيف|ضيوف)/);

  const lower = haystack.toLowerCase();
  const cityMatch = CITY_MATCHERS.find((c) => c.names.some((n) => lower.includes(n)));
  const typeMatch = TYPE_MATCHERS.find((t) => t.re.test(haystack));

  // Nightly price is rarely present in the public HTML shell; only accept an
  // unambiguous "SAR 450 / ر.س per night"-style match near a currency marker.
  const priceMatch = /(?:SAR|ر\.س|﷼)\s?([\d,]{1,7})(?:\s?(?:\/|per\s|في\s)?\s?(?:night|ليلة))/i.exec(haystack);
  const nightlyPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, '')) || null : null;

  return {
    platform,
    title: title || null,
    city: cityMatch ? cityMatch.value : null,
    district: null, // platforms do not expose district publicly
    type: typeMatch ? typeMatch.value : null,
    bedrooms,
    bathrooms,
    guests,
    nightlyPrice,
    images: image ? [image] : [],
  };
}

/**
 * Map the backend's extracted data onto Add-Property-wizard form fields.
 * Everything stays editable in the UI; missing fields are simply not set.
 */
export function mapImportToForm(data, platform, url) {
  const canonical = canonicalListingUrl(url);
  const form = {
    platform,
    platformUrl: canonical,
    links: [buildLinkEntry(platform, canonical)],
  };
  if (!data) return form;
  if (data.title) form.name = data.title;
  if (data.city) form.city = data.city;
  if (data.district) form.district = data.district;
  if (data.type) form.type = data.type;
  if (Number.isFinite(data.bedrooms)) form.bedrooms = data.bedrooms;
  if (Number.isFinite(data.bathrooms)) form.bathrooms = Math.max(1, Math.round(data.bathrooms));
  if (Number.isFinite(data.guests)) form.guests = data.guests;
  if (Number.isFinite(data.nightlyPrice) && data.nightlyPrice > 0) form.nightlyPrice = String(data.nightlyPrice);
  if (Array.isArray(data.images) && data.images[0]) form.photoUrl = data.images[0];
  return form;
}
