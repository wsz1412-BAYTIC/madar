// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const base44Mock = vi.hoisted(() => ({ functions: { invoke: vi.fn() } }));
vi.mock('@/api/base44Client', () => ({ base44: base44Mock }));

let langState;
vi.mock('@/contexts/LanguageContext', () => ({ useLang: () => langState }));
let themeState;
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => themeState }));
let authState;
vi.mock('@/lib/AuthContext', () => ({ useAuth: () => authState }));

import MarketHeatmap from '@/components/madar/MarketHeatmap';

const OWN_PAYLOAD = {
  ok: true,
  hasData: true,
  scope: 'own',
  tier: 'limited',
  access: { plan: 'growth', tier: 'limited', scope: 'own', comparisons: false, segmentation: false, historical: false, dateRange: false },
  cities: [{ city: 'Riyadh', medianOccupancy: 70, medianAdr: 420, areaCount: 2, sampleCount: 3 }],
  cells: [
    { id: 'Riyadh||Al Olaya||*', city: 'Riyadh', district: 'Al Olaya', sampleCount: 2, occupancy: 88, adr: 450, revenue: 16000, intensity: 4, trend: { direction: 'up', deltaVsCity: 18 } },
    { id: 'Riyadh||Al Malqa||*', city: 'Riyadh', district: 'Al Malqa', sampleCount: 1, occupancy: 52, adr: 300, revenue: 6000, intensity: 1, trend: { direction: 'down', deltaVsCity: -18 } },
  ],
  meta: { minSample: 1, segmented: false, trendBasis: 'relative_to_city_median', currency: 'SAR' },
  generatedAt: '2026-07-05T08:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'en', isRTL: false, t: (k) => k };
  themeState = { theme: 'dark', toggleTheme: vi.fn() };
  authState = { isAuthenticated: true, authChecked: true, user: { id: 'u1' } };
});
afterEach(() => cleanup());

const renderMap = () => render(<MemoryRouter><MarketHeatmap /></MemoryRouter>);

describe('guest gate — never fetches, never fakes data', () => {
  it('unauthenticated visitors see a sign-up gate and no backend call', () => {
    authState = { isAuthenticated: false, authChecked: true, user: null };
    renderMap();
    expect(screen.getByText(/Market Heatmap/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /start free/i }).getAttribute('href')).toBe('/signup');
    expect(base44Mock.functions.invoke).not.toHaveBeenCalled();
  });
});

describe('own-portfolio heatmap (Growth) renders real cells', () => {
  it('shows cells, legend, and reveals occupancy/ADR/trend/insight on click', async () => {
    base44Mock.functions.invoke.mockResolvedValueOnce({ data: OWN_PAYLOAD });
    renderMap();
    expect(base44Mock.functions.invoke).toHaveBeenCalledWith('market-heatmap', expect.objectContaining({ filters: expect.any(Object) }));

    // Cells render with occupancy labels.
    const olaya = await screen.findByRole('button', { name: /Al Olaya, Riyadh, 88% occupancy/i });
    expect(screen.getByText('Occupancy intensity:')).toBeTruthy(); // legend

    fireEvent.click(olaya);
    // Detail panel: ADR + insight are unique to the detail (occupancy 88% also
    // appears on the cell, so assert the detail-only content).
    expect(await screen.findByText(/450 SAR/)).toBeTruthy();
    expect(screen.getByText(/above the Riyadh average/i)).toBeTruthy();
    expect(screen.getAllByText('88%').length).toBeGreaterThanOrEqual(2); // cell + detail
  });

  it('has a table view for accessibility', async () => {
    base44Mock.functions.invoke.mockResolvedValueOnce({ data: OWN_PAYLOAD });
    renderMap();
    await screen.findByRole('button', { name: /Al Olaya, Riyadh/i });
    fireEvent.click(screen.getByRole('button', { name: /table/i }));
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getAllByText('Al Olaya').length).toBeGreaterThan(0);
  });
});

describe('plan gate — 403 upgrade', () => {
  it('renders an upgrade card linking to billing, not a raw error', async () => {
    base44Mock.functions.invoke.mockRejectedValueOnce({
      response: { data: { error: 'الترقية مطلوبة', error_en: 'The Market Heatmap is available on the Growth plan.', upgrade: 'growth' } },
    });
    renderMap();
    expect(await screen.findByText(/available on the Growth plan/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /view plans/i }).getAttribute('href')).toBe('/billing');
  });
});

describe('empty state — honest, no fabricated data', () => {
  it('market scope with no qualifying areas shows the sample-threshold message', async () => {
    base44Mock.functions.invoke.mockResolvedValueOnce({
      data: { ok: true, hasData: false, scope: 'market', tier: 'full', access: { scope: 'market', comparisons: true }, cells: [], cities: [], meta: { minSample: 3 } },
    });
    renderMap();
    expect(await screen.findByText(/No heatmap data yet/i)).toBeTruthy();
    expect(screen.getByText(/minimum sample size \(3 properties\)/i)).toBeTruthy();
  });
});

describe('error state', () => {
  it('shows a retry on a generic failure', async () => {
    base44Mock.functions.invoke.mockRejectedValueOnce(new Error('network'));
    renderMap();
    expect(await screen.findByRole('button', { name: /retry/i })).toBeTruthy();
    base44Mock.functions.invoke.mockResolvedValueOnce({ data: OWN_PAYLOAD });
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(screen.getByText('Occupancy intensity:')).toBeTruthy());
  });
});

describe('Arabic / RTL', () => {
  it('renders Arabic heading, market label, and comparison strip', async () => {
    langState = { lang: 'ar', isRTL: true, t: (k) => k };
    base44Mock.functions.invoke.mockResolvedValueOnce({
      data: { ...OWN_PAYLOAD, scope: 'market', access: { ...OWN_PAYLOAD.access, plan: 'pro', tier: 'full', scope: 'market', comparisons: true }, cities: [{ city: 'Riyadh', medianOccupancy: 70, medianAdr: 420, areaCount: 2, sampleCount: 3 }, { city: 'Jeddah', medianOccupancy: 64, medianAdr: 330, areaCount: 1, sampleCount: 3 }] },
    });
    renderMap();
    expect(await screen.findByText('الخريطة الحرارية للسوق')).toBeTruthy();
    expect(screen.getByText(/رؤية سوق مجهّلة/)).toBeTruthy();
  });
});
