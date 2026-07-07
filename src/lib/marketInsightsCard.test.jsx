// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let langState;
vi.mock('@/contexts/LanguageContext', () => ({ useLang: () => langState }));
let themeState;
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => themeState }));

import MarketInsightsCard from '@/components/dashboard/MarketInsightsCard';

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'ar', isRTL: true };
  themeState = { theme: 'light' };
});
afterEach(() => cleanup());

const renderCard = (plan) => render(<MemoryRouter><MarketInsightsCard plan={plan} /></MemoryRouter>);

describe('MarketInsightsCard', () => {
  it('links to /market and shows the honesty disclaimer (no fake data)', () => {
    renderCard('pro');
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/market');
    expect(screen.getByText(/يعتمد هذا المؤشر على البيانات المتاحة داخل المنصة/)).toBeTruthy();
  });

  it('shows the upgrade CTA (link to /plans) only on the free plan', () => {
    const { unmount } = renderCard('free');
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toContain('/plans');
    unmount();
    renderCard('pro');
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).not.toContain('/plans');
  });
});
