import { describe, it, expect } from 'vitest';
import { buildQuickReport, QUICK_REPORT_LIMIT } from './madarReport.js';

// A portfolio designed to trip many detectors at once.
const messyProperties = [
  { id: 1, name: 'A', images: [], currentOccupancy: 20, platformUrl: null, nightlyPrice: 0, status: 'inactive', amenities: [] },
  { id: 2, name: 'B', images: [], currentOccupancy: 30, platformUrl: null, nightlyPrice: null, status: 'active', amenities: [] },
  { id: 3, name: 'C', images: ['x.jpg'], currentOccupancy: 90, platformUrl: 'https://airbnb.com/rooms/1', nightlyPrice: 400, status: 'active', amenities: ['wifi'] },
];

describe('Madar quick report', () => {
  it('returns ONLY the top 3 fixes for trial/free customers', () => {
    const r = buildQuickReport(messyProperties, { fullAccess: false });
    expect(r.fullAccess).toBe(false);
    expect(r.issues.length).toBe(QUICK_REPORT_LIMIT);
    expect(r.totalIssues).toBeGreaterThan(QUICK_REPORT_LIMIT);
    expect(r.lockedCount).toBe(r.totalIssues - QUICK_REPORT_LIMIT);
  });

  it('ranks by impact — photos and pricing come before amenities', () => {
    const r = buildQuickReport(messyProperties, { fullAccess: false });
    const ids = r.issues.map((i) => i.id);
    expect(ids[0]).toBe('no_photos');
    expect(ids).not.toContain('no_amenities'); // low weight → locked behind paid
  });

  it('a paid subscription unlocks the full issue list', () => {
    const r = buildQuickReport(messyProperties, { fullAccess: true });
    expect(r.fullAccess).toBe(true);
    expect(r.issues.length).toBe(r.totalIssues);
    expect(r.lockedCount).toBe(0);
    expect(r.issues.map((i) => i.id)).toContain('no_amenities');
  });

  it('every issue speaks simply, in both languages, with an expected benefit', () => {
    const r = buildQuickReport(messyProperties, { fullAccess: false });
    for (const issue of r.issues) {
      expect(issue.title.en).toBeTruthy();
      expect(issue.title.ar).toBeTruthy();
      expect(issue.fix.en.length).toBeGreaterThan(10);
      expect(issue.fix.ar.length).toBeGreaterThan(10);
      expect(issue.benefit.en).toBeTruthy();
      expect(issue.benefit.ar).toBeTruthy();
    }
  });

  it('an empty portfolio yields the "add your first property" report', () => {
    const r = buildQuickReport([], { fullAccess: false });
    expect(r.issues.length).toBe(1);
    expect(r.issues[0].id).toBe('no_properties');
  });

  it('a healthy portfolio yields few or no findings', () => {
    const healthy = [{ id: 1, name: 'Good', images: ['a.jpg'], currentOccupancy: 85, platformUrl: 'https://airbnb.com/rooms/9', nightlyPrice: 500, status: 'active', amenities: ['wifi', 'ac'] }];
    const r = buildQuickReport(healthy, { fullAccess: false });
    expect(r.totalIssues).toBe(0);
    expect(r.issues.length).toBe(0);
  });
});
