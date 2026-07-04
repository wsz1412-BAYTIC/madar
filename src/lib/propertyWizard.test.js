import { describe, it, expect } from 'vitest';
import {
  WIZARD_STEPS, UNIT_TYPES, AVAILABILITY, EMPTY_FORM,
  validateStep, validateAll, buildPropertyPayload,
} from './propertyWizard.js';

const validForm = {
  ...EMPTY_FORM,
  name: 'Olaya Loft',
  city: 'Riyadh',
  district: 'Al Olaya',
  platform: 'Airbnb',
  type: 'apartment',
  bedrooms: 2,
  bathrooms: 1,
  guests: 4,
  nightlyPrice: '450',
  status: 'active',
};

describe('property wizard validation', () => {
  it('has three ordered steps', () => {
    expect(WIZARD_STEPS).toEqual(['basics', 'details', 'extras']);
  });

  it('accepts a fully valid form on every step', () => {
    expect(validateAll(validForm)).toBe(true);
  });

  it('requires name, city, district and platform on basics', () => {
    const { valid, errors } = validateStep('basics', { ...validForm, name: '', city: '', district: '', platform: '' });
    expect(valid).toBe(false);
    expect(Object.keys(errors).sort()).toEqual(['city', 'district', 'name', 'platform']);
    // bilingual messages
    expect(errors.name.en).toBeTruthy();
    expect(errors.name.ar).toBeTruthy();
  });

  it('rejects a one-character name', () => {
    expect(validateStep('basics', { ...validForm, name: 'x' }).valid).toBe(false);
  });

  it('requires unit type, sane counts, price and status on details', () => {
    const { valid, errors } = validateStep('details', { ...validForm, type: '', bedrooms: 99, nightlyPrice: '' });
    expect(valid).toBe(false);
    expect(errors.type).toBeTruthy();
    expect(errors.bedrooms).toBeTruthy();
    expect(errors.nightlyPrice).toBeTruthy();
  });

  it('rejects zero/negative/absurd nightly prices', () => {
    for (const bad of ['0', '-5', '999999']) {
      expect(validateStep('details', { ...validForm, nightlyPrice: bad }).valid).toBe(false);
    }
  });

  it('extras are optional but validate URL formats when provided', () => {
    expect(validateStep('extras', validForm).valid).toBe(true);
    expect(validateStep('extras', { ...validForm, platformUrl: 'not-a-url' }).valid).toBe(false);
    expect(validateStep('extras', { ...validForm, photoUrl: 'https://img.example.com/a.jpg' }).valid).toBe(true);
  });

  it('unit types and availability match the UserProperty entity enums', () => {
    expect(UNIT_TYPES.map((u) => u.value)).toEqual(['apartment', 'villa', 'townhouse', 'chalet', 'other']);
    expect(AVAILABILITY.map((a) => a.value)).toEqual(['active', 'inactive']);
  });
});

describe('buildPropertyPayload', () => {
  it('builds the entity payload with the session userId, never from the form', () => {
    const payload = buildPropertyPayload('user-1', validForm);
    expect(payload.userId).toBe('user-1');
    expect(payload.name).toBe('Olaya Loft');
    expect(payload.district).toBe('Al Olaya');
    expect(payload.nightlyPrice).toBe(450);
    expect(payload.bedrooms).toBe(2);
    expect(payload.status).toBe('active');
    expect(payload.images).toEqual([]);
    expect(payload.platformUrl).toBeNull();
  });

  it('trims strings and wraps the photo URL into images[]', () => {
    const payload = buildPropertyPayload('u', { ...validForm, name: '  Padded  ', photoUrl: ' https://x.com/p.jpg ' });
    expect(payload.name).toBe('Padded');
    expect(payload.images).toEqual(['https://x.com/p.jpg']);
  });

  it('throws without a userId', () => {
    expect(() => buildPropertyPayload(undefined, validForm)).toThrow();
  });
});
