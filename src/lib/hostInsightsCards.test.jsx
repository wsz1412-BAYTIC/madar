// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let langState;
vi.mock('@/contexts/LanguageContext', () => ({ useLang: () => langState }));
let themeState;
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => themeState }));

import HostInsightsCards from '@/components/dashboard/HostInsightsCards';

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'ar', isRTL: true };
  themeState = { theme: 'light' };
});
afterEach(() => cleanup());

const renderCards = (properties = []) => render(<MemoryRouter><HostInsightsCards properties={properties} /></MemoryRouter>);

describe('HostInsightsCards', () => {
  it('renders the four insight cards with host-tool CTAs (market + pricing + performance)', () => {
    renderCards([{ currentOccupancy: 70 }]);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/market');
    expect(hrefs).toContain('/pricing-recommendations');
    expect(hrefs).toContain('/analytics');
    // The required Arabic CTAs are present.
    expect(screen.getByText('فتح صفحة السوق')).toBeTruthy();
    expect(screen.getByText('مراجعة التسعير')).toBeTruthy();
    expect(screen.getAllByText('مراجعة أداء الوحدة').length).toBeGreaterThan(0);
  });

  it('shows the market disclaimer on the market-related card', () => {
    renderCards([]);
    expect(screen.getByText(/يعتمد هذا المؤشر على البيانات المتاحة داخل المنصة/)).toBeTruthy();
  });

  it('references NO opportunity or admin routes', () => {
    renderCards([{ currentOccupancy: 30 }]);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    for (const h of hrefs) {
      expect(h).not.toMatch(/opportunit/i);
      expect(h).not.toMatch(/\/admin/i);
      expect(h).not.toMatch(/real-estate/i);
    }
  });

  it('adapts the occupancy card wording when own occupancy is weak', () => {
    renderCards([{ currentOccupancy: 30 }]); // weak (< 55)
    expect(screen.getByText(/قد يشير ضعف الإشغال/)).toBeTruthy();
  });
});
