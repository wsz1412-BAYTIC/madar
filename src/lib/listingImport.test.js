import { describe, it, expect } from 'vitest';
import { parseListingUrl, IMPORT_UNAVAILABLE } from './listingImport.js';

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

describe('IMPORT_UNAVAILABLE copy', () => {
  it('is bilingual and mentions manual continuation', () => {
    expect(IMPORT_UNAVAILABLE.en).toMatch(/not available yet/i);
    expect(IMPORT_UNAVAILABLE.en).toMatch(/manually/i);
    expect(IMPORT_UNAVAILABLE.ar.length).toBeGreaterThan(10);
  });
});
