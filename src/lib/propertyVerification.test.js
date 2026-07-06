import { describe, it, expect } from 'vitest';
import {
  hasOfficialSource,
  compareWithOpportunity,
  guardOfficialStatus,
  suggestClassification,
  normalizeSource,
  validateVerificationForm,
  buildVerificationPayload,
  investmentReadiness,
  COMPARABLE_FIELDS,
} from './propertyVerification.js';

const officialSource = { name: 'REGA deed lookup', type: 'official', reference: 'REGA-123', confidence: 'high' };
const manualSource = { name: 'Owner statement', type: 'user_provided', confidence: 'low' };

describe('honesty guard — never claim official verification without an official source', () => {
  it('downgrades "verified" to requires_authorization when no official source exists', () => {
    expect(guardOfficialStatus('verified', [])).toBe('requires_authorization');
    expect(guardOfficialStatus('verified', [manualSource])).toBe('requires_authorization');
    expect(guardOfficialStatus('partially_verified', [manualSource])).toBe('requires_authorization');
  });

  it('allows official claims only with an official source', () => {
    expect(guardOfficialStatus('verified', [officialSource])).toBe('verified');
    expect(guardOfficialStatus('partially_verified', [manualSource, officialSource])).toBe('partially_verified');
  });

  it('preserves non-claim statuses (conflict / unavailable / not_checked)', () => {
    expect(guardOfficialStatus('conflict', [])).toBe('conflict');
    expect(guardOfficialStatus('unavailable', [])).toBe('unavailable');
    expect(guardOfficialStatus('not_checked', [])).toBe('not_checked');
    expect(guardOfficialStatus('garbage', [])).toBe('not_checked');
  });

  it('hasOfficialSource only counts named official rows', () => {
    expect(hasOfficialSource([officialSource])).toBe(true);
    expect(hasOfficialSource([{ type: 'official' }])).toBe(false); // no name
    expect(hasOfficialSource([manualSource])).toBe(false);
    expect(hasOfficialSource(null)).toBe(false);
  });
});

describe('compareWithOpportunity', () => {
  const verification = { city: 'Riyadh', district: 'Al Olaya', property_type: 'villa', area_declared: 500, location_declared: 'Center' };
  const opportunity = { id: 'opp1', city: 'Riyadh', district_internal: 'Al Olaya', property_type: 'villa', area: 500, location_internal: 'Center' };

  it('matches equal declared fields against the mapped opportunity fields', () => {
    const r = compareWithOpportunity(verification, opportunity);
    expect(r.matched.sort()).toEqual([...COMPARABLE_FIELDS].sort());
    expect(r.missing).toEqual([]);
    expect(r.conflicting).toEqual([]);
  });

  it('flags conflicts and missing fields honestly', () => {
    const r = compareWithOpportunity(
      { city: 'Jeddah', district: 'Al Olaya', property_type: '', area_declared: 500 },
      opportunity
    );
    expect(r.conflicting).toContain('city'); // Jeddah vs Riyadh
    expect(r.matched).toContain('district');
    expect(r.missing).toContain('property_type'); // empty on verification
    expect(r.missing).toContain('location_declared'); // absent on verification
  });

  it('with NO linked opportunity, every field is missing (never a fabricated match)', () => {
    const r = compareWithOpportunity(verification, null);
    expect(r.matched).toEqual([]);
    expect(r.conflicting).toEqual([]);
    expect(r.missing.sort()).toEqual([...COMPARABLE_FIELDS].sort());
  });
});

describe('suggestClassification', () => {
  it('a full official match → verified_property/high', () => {
    const s = suggestClassification({ comparison: { matched: COMPARABLE_FIELDS, missing: [], conflicting: [] }, guardedStatus: 'verified' });
    expect(s).toEqual({ verification_result: 'verified_property', verification_confidence: 'high' });
  });
  it('any conflict → data_conflict/low regardless of status', () => {
    const s = suggestClassification({ comparison: { matched: ['city'], missing: [], conflicting: ['district'] }, guardedStatus: 'verified' });
    expect(s.verification_result).toBe('data_conflict');
  });
  it('no official backing never yields verified_property', () => {
    const s = suggestClassification({ comparison: { matched: COMPARABLE_FIELDS, missing: [], conflicting: [] }, guardedStatus: 'requires_authorization' });
    expect(s.verification_result).not.toBe('verified_property');
  });
  it('sparse data without official backing → needs_documents', () => {
    const s = suggestClassification({ comparison: { matched: [], missing: COMPARABLE_FIELDS, conflicting: [] }, guardedStatus: 'requires_authorization' });
    expect(s.verification_result).toBe('needs_documents');
  });
});

describe('normalizeSource', () => {
  it('normalizes a valid source and defaults unknown type/confidence', () => {
    expect(normalizeSource({ name: 'Balady', type: 'weird', confidence: 'x', reference: ' r ' }))
      .toEqual({ name: 'Balady', type: 'manual_review', reference: 'r', retrieved_date: null, confidence: 'low' });
  });
  it('drops nameless sources', () => {
    expect(normalizeSource({ type: 'official' })).toBeNull();
    expect(normalizeSource({})).toBeNull();
  });
});

describe('validateVerificationForm', () => {
  it('requires search type + city + the type-specific number', () => {
    expect(validateVerificationForm({}).valid).toBe(false);
    expect(validateVerificationForm({ search_type: 'deed_number', city: 'Riyadh' }).errors.deed_number).toBeTruthy();
    expect(validateVerificationForm({ search_type: 'municipal_license', city: 'Riyadh' }).errors.municipal_license_number).toBeTruthy();
    expect(validateVerificationForm({ search_type: 'building_permit', city: 'Riyadh', building_permit_number: 'BP1' }).valid).toBe(true);
    expect(validateVerificationForm({ search_type: 'deed_number', deed_number: 'D1' }).errors.city).toBeTruthy();
  });
});

describe('buildVerificationPayload', () => {
  const now = new Date('2026-07-06T09:00:00Z');
  const form = {
    search_type: 'deed_number', deed_number: 'D-1', city: 'Riyadh', district: 'Al Olaya',
    property_type: 'villa', area_declared: 500, location_declared: 'Center',
    official_data_status: 'verified', source_list: [manualSource], // no official source
  };
  const opp = { id: 'opp1', city: 'Riyadh', district_internal: 'Al Olaya', property_type: 'villa', area: 500, location_internal: 'Center' };

  it('applies the honesty guard: verified→requires_authorization without an official source', () => {
    const p = buildVerificationPayload(form, opp, { now });
    expect(p.official_data_status).toBe('requires_authorization');
    expect(p.verification_result).not.toBe('verified_property');
    expect(p.matched_fields.length).toBe(5); // all fields match the opportunity
    expect(p.related_opportunity_id).toBe('opp1');
    expect(p.created_at).toBe(now.toISOString());
    expect(p.updated_at).toBeNull();
  });

  it('with an official source, a full match becomes verified_property/high', () => {
    const p = buildVerificationPayload({ ...form, source_list: [officialSource] }, opp, { now });
    expect(p.official_data_status).toBe('verified');
    expect(p.verification_result).toBe('verified_property');
    expect(p.verification_confidence).toBe('high');
    expect(p.source_list[0].type).toBe('official');
  });

  it('an explicit admin result/confidence overrides the suggestion', () => {
    const p = buildVerificationPayload({ ...form, source_list: [officialSource], verification_result: 'verified_with_notes', verification_confidence: 'medium' }, opp, { now });
    expect(p.verification_result).toBe('verified_with_notes');
    expect(p.verification_confidence).toBe('medium');
  });

  it('clamps an explicit "verified_property" override when there is no official source', () => {
    // Admin tries to force verified_property but the guard already downgraded the status.
    const p = buildVerificationPayload({ ...form, source_list: [manualSource], verification_result: 'verified_property' }, opp, { now });
    expect(p.official_data_status).toBe('requires_authorization');
    expect(p.verification_result).not.toBe('verified_property'); // honesty guard wins over the override
  });

  it('honors an explicit "verified_property" override only with an official source', () => {
    const p = buildVerificationPayload({ ...form, source_list: [officialSource], verification_result: 'verified_property' }, opp, { now });
    expect(p.official_data_status).toBe('verified');
    expect(p.verification_result).toBe('verified_property');
  });

  it('uses the suggested confidence when the form leaves it blank (no forced override)', () => {
    const p = buildVerificationPayload({ ...form, source_list: [officialSource], verification_confidence: '' }, opp, { now });
    expect(p.verification_confidence).toBe('high'); // full official match → high, not defaulted to low
  });

  it('sets updated_at when editing an existing record (created_at present)', () => {
    const p = buildVerificationPayload({ ...form, created_at: '2026-07-01T00:00:00Z' }, opp, { now });
    expect(p.created_at).toBe('2026-07-01T00:00:00Z');
    expect(p.updated_at).toBe(now.toISOString());
  });
});

describe('investmentReadiness — honest, never a guarantee', () => {
  it('maps results to ok/conditional/not-yet in AR + EN', () => {
    expect(investmentReadiness('verified_property', 'ar').ok).toBe(true);
    expect(investmentReadiness('verified_with_notes', 'ar').ok).toBeNull();
    expect(investmentReadiness('needs_documents', 'ar').ok).toBe(false);
    expect(investmentReadiness('data_conflict', 'en').ok).toBe(false);
    expect(investmentReadiness('verified_property', 'en').text).toMatch(/ready for investment/i);
  });
});
