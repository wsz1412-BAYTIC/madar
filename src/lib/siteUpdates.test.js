import { describe, it, expect } from 'vitest';
import {
  UPDATE_TYPES, PUBLIC_UPDATE_FIELDS, label,
  isPublished, publishedUpdates, sortByDateDesc, toPublicUpdate, publicFeed,
  localizedUpdate, validateSiteUpdate,
} from './siteUpdates.js';

const rows = [
  { id: 'a', title_ar: 'ميزة', title_en: 'Feature A', date: '2026-06-01', type: 'feature', is_published: true, created_by: 'admin@x' },
  { id: 'b', title_ar: 'مسودة', title_en: 'Draft B', date: '2026-07-01', type: 'fix', is_published: false },
  { id: 'c', title_ar: 'إعلان', title_en: 'Announcement C', date: '2026-07-05', type: 'announcement', is_published: true },
];

describe('publishedUpdates — drafts excluded', () => {
  it('keeps only explicitly published entries', () => {
    expect(publishedUpdates(rows).map((r) => r.id)).toEqual(['a', 'c']);
  });
  it('treats missing/false is_published as a draft', () => {
    expect(isPublished({ is_published: false })).toBe(false);
    expect(isPublished({})).toBe(false);
    expect(isPublished({ is_published: true })).toBe(true);
  });
  it('is safe on empty/invalid input', () => {
    expect(publishedUpdates(null)).toEqual([]);
    expect(publishedUpdates(undefined)).toEqual([]);
  });
});

describe('sortByDateDesc — newest first', () => {
  it('sorts by date descending without mutating input', () => {
    const input = [...rows];
    const sorted = sortByDateDesc(rows);
    expect(sorted.map((r) => r.id)).toEqual(['c', 'b', 'a']);
    expect(rows).toEqual(input); // not mutated
  });
});

describe('toPublicUpdate — no internal/admin fields exposed', () => {
  it('returns exactly the public allow-list fields', () => {
    const pub = toPublicUpdate(rows[0]);
    expect(Object.keys(pub).sort()).toEqual([...PUBLIC_UPDATE_FIELDS].sort());
  });
  it('never leaks is_published or bookkeeping fields', () => {
    const pub = toPublicUpdate(rows[0]);
    expect(pub).not.toHaveProperty('is_published');
    expect(pub).not.toHaveProperty('created_by');
  });
});

describe('publicFeed — published + sorted + sanitized', () => {
  it('excludes drafts, sorts newest first, and strips internal fields', () => {
    const feed = publicFeed(rows);
    expect(feed.map((r) => r.id)).toEqual(['c', 'a']); // no draft 'b', newest first
    for (const item of feed) {
      expect(item).not.toHaveProperty('is_published');
      expect(item).not.toHaveProperty('created_by');
    }
  });
  it('cannot emit a draft even if one sneaks past the filter', () => {
    // Every output id must correspond to a published row.
    const feed = publicFeed([...rows, { id: 'd', title_ar: 'x', title_en: 'x', date: '2026-08-01', type: 'feature', is_published: false }]);
    expect(feed.some((r) => r.id === 'd')).toBe(false);
  });
});

describe('label / localizedUpdate', () => {
  it('labels types bilingually', () => {
    expect(label('feature', 'ar')).toBe('ميزة');
    expect(label('feature', 'en')).toBe('Feature');
    expect(UPDATE_TYPES).toContain('announcement');
  });
  it('resolves language with fallback', () => {
    expect(localizedUpdate(rows[0], 'en').title).toBe('Feature A');
    expect(localizedUpdate(rows[0], 'ar').title).toBe('ميزة');
    expect(localizedUpdate({ title_en: 'only-en' }, 'ar').title).toBe('only-en'); // fallback
  });
});

describe('validateSiteUpdate', () => {
  it('requires both titles, a date, and a valid type', () => {
    expect(validateSiteUpdate({}).valid).toBe(false);
    expect(validateSiteUpdate({ title_ar: 'ع', title_en: 'E', date: '2026-07-06', type: 'feature' }).valid).toBe(true);
    expect(validateSiteUpdate({ title_ar: 'ع', title_en: 'E', date: '2026-07-06', type: 'bogus' }).errors.type).toBeTruthy();
    expect(validateSiteUpdate({ title_en: 'E', date: '2026-07-06', type: 'fix' }).errors.title_ar).toBeTruthy();
  });
});
