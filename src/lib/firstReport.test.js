import { describe, it, expect } from 'vitest';
import { buildFirstReport, FIRST_REPORT_ACTION_LIMIT } from './firstReport.js';

const property = (over = {}) => ({
  id: 'p1',
  name: 'Olaya Apt',
  platform: 'Airbnb',
  images: ['x.jpg'],
  amenities: ['wifi'],
  platformUrl: 'https://airbnb.com/rooms/1',
  nightlyPrice: 400,
  currentOccupancy: 65,
  monthlyRevenue: 8000,
  status: 'active',
  ...over,
});

describe('buildFirstReport', () => {
  it('covers ALL properties together with 3 actions TOTAL — never 3 per property', () => {
    // 5 problematic properties would each produce multiple issues; the
    // report must still cap at 3 portfolio-wide actions.
    const properties = [
      property({ id: 'a', name: 'A', images: [], platformUrl: null, amenities: [] }),
      property({ id: 'b', name: 'B', images: [], currentOccupancy: 20 }),
      property({ id: 'c', name: 'C', nightlyPrice: null, status: 'inactive' }),
      property({ id: 'd', name: 'D', images: [], amenities: [] }),
      property({ id: 'e', name: 'E', platformUrl: null }),
    ];
    const report = buildFirstReport(properties);
    expect(report.actions.length).toBeLessThanOrEqual(FIRST_REPORT_ACTION_LIMIT);
    expect(report.actions.length).toBe(3);
    expect(report.portfolio.propertiesCount).toBe(5);
    // Bilingual actions with fix + benefit.
    for (const action of report.actions) {
      expect(action.title.en).toBeTruthy();
      expect(action.title.ar).toBeTruthy();
      expect(action.fix.ar).toBeTruthy();
      expect(action.benefit.ar).toBeTruthy();
    }
  });

  it('portfolio revenue is net of platform fees, split per platform', () => {
    const report = buildFirstReport([
      property({ id: 'a', platform: 'Airbnb', monthlyRevenue: 10000 }),
      property({ id: 'b', platform: 'Booking.com', monthlyRevenue: 10000 }),
    ]);
    expect(report.portfolio.grossMonthly).toBe(20000);
    const airbnb = report.portfolio.feeBreakdown.find((r) => r.platform === 'Airbnb');
    const booking = report.portfolio.feeBreakdown.find((r) => r.platform === 'Booking.com');
    expect(airbnb.net).toBe(10000 - 10000 * airbnb.rate);
    expect(booking.net).toBe(8500);
    expect(booking.estimated).toBe(true); // bundled rate = labeled estimate
    expect(report.portfolio.netMonthlyAfterFees).toBe(airbnb.net + booking.net);
  });

  it('confirmed fee overrides flow through and clear the estimate flag', () => {
    const report = buildFirstReport(
      [property({ platform: 'Airbnb', monthlyRevenue: 10000 })],
      { feeOverrides: { Airbnb: 0.1 } }
    );
    const row = report.portfolio.feeBreakdown[0];
    expect(row.rate).toBe(0.1);
    expect(row.estimated).toBe(false);
    expect(row.net).toBe(9000);
  });

  it('uplift is an ESTIMATE range with an explicit no-guarantee note', () => {
    const report = buildFirstReport([
      property({ images: [], currentOccupancy: 25, monthlyRevenue: 10000 }),
    ]);
    const uplift = report.portfolio.upliftEstimate;
    expect(uplift.sarMax).toBeGreaterThan(uplift.sarMin);
    expect(uplift.percentMax).toBeGreaterThan(0);
    expect(uplift.note.en).toMatch(/not a guarantee/i);
    expect(uplift.note.ar).toContain('ليس ضمانًا');
  });

  it('handles an empty portfolio with the add-your-first-property action', () => {
    const report = buildFirstReport([]);
    expect(report.portfolio.propertiesCount).toBe(0);
    expect(report.actions.length).toBe(1);
    expect(report.actions[0].id).toBe('no_properties');
    expect(report.portfolio.grossMonthly).toBe(0);
  });

  it('stamps generatedAt deterministically', () => {
    const now = new Date('2026-07-05T08:00:00Z');
    expect(buildFirstReport([], { now }).generatedAt).toBe(now.toISOString());
  });
});
