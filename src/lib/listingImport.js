// Listing-URL parsing for the "Add property by link" flow.
//
// Root cause of the old "Method Not Allowed": the Preview button POSTed to a
// legacy endpoint (https://aimadar.com/api/properties/import) that has no such
// route, and the raw 405 was surfaced to the user. There is no scraping
// backend yet, so the flow now validates the link locally, tells the user
// honestly that automatic import is not available, and hands off to the
// manual wizard with platform + URL prefilled.
//
// Pure module — unit-tested, no network.

const PATTERNS = [
  {
    platform: 'Airbnb',
    // Any Airbnb locale/subdomain: airbnb.com, ar.airbnb.com, www.airbnb.ae,
    // airbnb.co.uk … listing path is always /rooms/<id> (id may be numeric or
    // a plus/luxe slug).
    re: /^https?:\/\/(?:[\w-]+\.)*airbnb\.[a-z.]{2,6}\/rooms\/(?:plus\/|luxury\/)?\d+/i,
  },
  {
    platform: 'Gathern',
    // gathern.co listing links: /unit/<id> or /chalet/... variants.
    re: /^https?:\/\/(?:[\w-]+\.)*gathern\.co(?:m)?\/(?:unit|chalet|property)\/\S+/i,
  },
  {
    platform: 'Booking.com',
    // booking.com/hotel/<cc>/<slug>
    re: /^https?:\/\/(?:[\w-]+\.)*booking\.com\/hotel\/[a-z]{2}\/\S+/i,
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
 * Returns { valid: true, platform, url } for a recognized listing link, or
 * { valid: false, error: { en, ar } } otherwise. Never throws.
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

  for (const { platform, re } of PATTERNS) {
    if (re.test(raw)) {
      // Strip query/tracking params for the stored canonical link.
      return { valid: true, platform, url: `${url.origin}${url.pathname}` };
    }
  }
  return { valid: false, error: ERRORS.unsupported };
}

export const IMPORT_UNAVAILABLE = Object.freeze({
  en: 'Automatic import is not available yet — you can continue manually and we will prefill what we know.',
  ar: 'الاستيراد التلقائي غير متاح حاليًا — يمكنك المتابعة يدويًا وسنعبّئ ما نعرفه مسبقًا.',
});
