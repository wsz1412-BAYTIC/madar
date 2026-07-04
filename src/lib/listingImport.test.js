import { describe, it, expect } from 'vitest';
import {
  parseListingUrl,
  canonicalListingUrl,
  findDuplicateLink,
  buildLinkEntry,
  extractListingData,
  mapImportToForm,
  DUPLICATE_LINK,
  IMPORT_FAILED,
  IMPORT_PLATFORM_PENDING,
} from './listingImport.js';

describe('parseListingUrl', () => {
  it('accepts the reported Arabic-locale Airbnb URL', () => {
    const r = parseListingUrl('https://ar.airbnb.com/rooms/1573422907379');
    expect(r.valid).toBe(true);
    expect(r.platform).toBe('Airbnb');
    expect(r.url).toBe('https://ar.airbnb.com/rooms/1573422907379');
  });

  it('accepts common Airbnb variants and strips tracking params', () => {
    for (const u of [
      'https://www.airbnb.com/rooms/12345',
      'https://airbnb.com/rooms/12345?source_impression_id=p3_123&guests=2',
      'https://airbnb.ae/rooms/999',
      'https://www.airbnb.co.uk/rooms/plus/777',
    ]) {
      const r = parseListingUrl(u);
      expect(r.valid, u).toBe(true);
      expect(r.platform).toBe('Airbnb');
      expect(r.url.includes('?')).toBe(false);
    }
  });

  it('accepts Gathern and Booking.com listing links', () => {
    expect(parseListingUrl('https://gathern.co/unit/98765')).toMatchObject({ valid: true, platform: 'Gathern' });
    expect(parseListingUrl('https://www.booking.com/hotel/sa/olaya-suites.html')).toMatchObject({ valid: true, platform: 'Booking.com' });
  });

  it('rejects empty input with a bilingual message', () => {
    const r = parseListingUrl('   ');
    expect(r.valid).toBe(false);
    expect(r.error.en).toBeTruthy();
    expect(r.error.ar).toBeTruthy();
  });

  it('rejects non-URLs and non-http protocols', () => {
    expect(parseListingUrl('airbnb rooms 123').valid).toBe(false);
    expect(parseListingUrl('ftp://airbnb.com/rooms/1').valid).toBe(false);
    expect(parseListingUrl('javascript:alert(1)').valid).toBe(false);
  });

  it('rejects unsupported hosts and non-listing pages with a helpful message', () => {
    const r1 = parseListingUrl('https://example.com/rooms/123');
    expect(r1.valid).toBe(false);
    expect(r1.error.en).toMatch(/Airbnb, Gathern and Booking\.com/);
    // Airbnb host but not a listing path
    expect(parseListingUrl('https://www.airbnb.com/help/article/123').valid).toBe(false);
  });

  it('never throws on garbage input', () => {
    for (const bad of [null, undefined, 42, {}, 'https://', '://x']) {
      expect(() => parseListingUrl(bad)).not.toThrow();
    }
  });
});

describe('canonicalListingUrl', () => {
  it('lowercases the host, strips query/hash and trailing slashes', () => {
    expect(canonicalListingUrl('https://WWW.Airbnb.com/rooms/123/?a=1#x')).toBe('https://www.airbnb.com/rooms/123');
    expect(canonicalListingUrl('not a url')).toBeNull();
  });
});

describe('multi-platform links + duplicate blocking', () => {
  const links = [
    buildLinkEntry('Airbnb', 'https://airbnb.com/rooms/123', new Date('2026-07-04T10:00:00Z')),
    buildLinkEntry('Gathern', 'https://gathern.co/unit/55', new Date('2026-07-04T10:00:00Z')),
  ];

  it('allows one link each for Airbnb + Gathern + Booking.com', () => {
    expect(findDuplicateLink(links, 'https://booking.com/hotel/sa/olaya.html', 'Booking.com')).toBeNull();
  });

  it('blocks the same URL again, even with tracking params or different case', () => {
    expect(findDuplicateLink(links, 'https://AIRBNB.com/rooms/123?src=share', 'Airbnb')).toBeTruthy();
  });

  it('blocks a second link for a platform the property already has', () => {
    expect(findDuplicateLink(links, 'https://airbnb.com/rooms/999', 'Airbnb')).toBeTruthy();
  });

  it('the duplicate message matches the required copy in both languages', () => {
    expect(DUPLICATE_LINK.en).toBe('This property link is already added');
    expect(DUPLICATE_LINK.ar).toBe('رابط هذا العقار مضاف مسبقًا');
  });

  it('buildLinkEntry stores the canonical URL and a timestamp', () => {
    const entry = buildLinkEntry('Airbnb', 'https://Airbnb.com/rooms/42/?q=1', new Date('2026-07-04T10:00:00Z'));
    expect(entry).toEqual({ platform: 'Airbnb', url: 'https://airbnb.com/rooms/42', addedAt: '2026-07-04T10:00:00.000Z' });
  });
});

describe('extractListingData (safe public fields only)', () => {
  const airbnbHtml = `
    <html><head>
      <meta property="og:title" content="Olaya Luxury Villa &amp; Pool - Villas for Rent in Riyadh" />
      <meta property="og:description" content="Entire villa in Riyadh, Saudi Arabia. 8 guests &middot; 4 bedrooms &middot; 5 beds &middot; 3 baths." />
      <meta property="og:image" content="https://a0.muscache.com/im/pictures/12345.jpg" />
    </head><body></body></html>`;

  it('extracts title, city, type, counts and image from Airbnb OpenGraph tags', () => {
    const d = extractListingData(airbnbHtml, 'Airbnb');
    expect(d.title).toBe('Olaya Luxury Villa & Pool - Villas for Rent in Riyadh');
    expect(d.city).toBe('Riyadh');
    expect(d.type).toBe('villa');
    expect(d.guests).toBe(8);
    expect(d.bedrooms).toBe(4);
    expect(d.bathrooms).toBe(3);
    expect(d.images).toEqual(['https://a0.muscache.com/im/pictures/12345.jpg']);
  });

  it('reads Arabic-locale pages too', () => {
    const ar = `
      <meta property="og:title" content="شقة فاخرة في جدة" />
      <meta property="og:description" content="شقة في جدة · 4 ضيوف · 2 غرف نوم · 2 حمامات" />
      <meta property="og:image" content="https://a0.muscache.com/im/ar.jpg" />`;
    const d = extractListingData(ar, 'Airbnb');
    expect(d.city).toBe('Jeddah');
    expect(d.type).toBe('apartment');
    expect(d.guests).toBe(4);
    expect(d.bedrooms).toBe(2);
    expect(d.bathrooms).toBe(2);
  });

  it('returns null for pages with nothing recognizable (bot wall / error page)', () => {
    expect(extractListingData('<html><body>Access denied</body></html>', 'Airbnb')).toBeNull();
    expect(extractListingData('', 'Airbnb')).toBeNull();
  });
});

describe('mapImportToForm', () => {
  it('maps extracted data onto wizard fields and seeds the links list', () => {
    const form = mapImportToForm(
      { title: 'Villa X', city: 'Riyadh', type: 'villa', bedrooms: 4, bathrooms: 3, guests: 8, nightlyPrice: 450, images: ['https://img/x.jpg'] },
      'Airbnb',
      'https://airbnb.com/rooms/123?src=share'
    );
    expect(form.name).toBe('Villa X');
    expect(form.city).toBe('Riyadh');
    expect(form.type).toBe('villa');
    expect(form.bedrooms).toBe(4);
    expect(form.nightlyPrice).toBe('450');
    expect(form.photoUrl).toBe('https://img/x.jpg');
    expect(form.platform).toBe('Airbnb');
    expect(form.platformUrl).toBe('https://airbnb.com/rooms/123');
    expect(form.links).toHaveLength(1);
    expect(form.links[0]).toMatchObject({ platform: 'Airbnb', url: 'https://airbnb.com/rooms/123' });
  });

  it('with no extracted data still prefills platform + link for manual entry', () => {
    const form = mapImportToForm(null, 'Gathern', 'https://gathern.co/unit/55');
    expect(form).toMatchObject({ platform: 'Gathern', platformUrl: 'https://gathern.co/unit/55' });
    expect(form.name).toBeUndefined();
  });
});

describe('friendly fallback copy (raw errors must never surface)', () => {
  it('is bilingual and mentions manual continuation', () => {
    for (const msg of [IMPORT_FAILED, IMPORT_PLATFORM_PENDING]) {
      expect(msg.en).toMatch(/manually/i);
      expect(msg.ar.length).toBeGreaterThan(10);
      expect(msg.en).not.toMatch(/method not allowed|405/i);
    }
  });
});
