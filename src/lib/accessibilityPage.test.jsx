// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Small render coverage for the standalone Accessibility statement page and
// its footer link — mirrors the approach in legalPages.test.jsx.

let langState;
vi.mock('@/contexts/LanguageContext', () => ({ useLang: () => langState }));

let themeState;
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => themeState }));

let authState;
vi.mock('@/lib/AuthContext', () => ({ useAuth: () => authState }));

// framer-motion needs layout APIs jsdom lacks.
vi.mock('@/components/madar/Motion', () => ({
  // eslint-disable-next-line react/prop-types
  FadeIn: ({ children }) => <div>{children}</div>,
}));

import Accessibility from '@/pages/Accessibility';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';

beforeEach(() => {
  vi.clearAllMocks();
  langState = { t: (k) => k, lang: 'en', isRTL: false, toggleLang: vi.fn(), setLang: vi.fn() };
  themeState = { theme: 'light', toggleTheme: vi.fn(), preference: 'system', setPreference: vi.fn() };
  authState = { isAuthenticated: false };
});
afterEach(() => cleanup());

const renderPage = () => render(<MemoryRouter><Accessibility /></MemoryRouter>);

describe('Accessibility page', () => {
  it('renders the English statement with the required commitments and a support path', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Accessibility' })).toBeTruthy();
    expect(screen.getByText(/Keyboard Navigation/i)).toBeTruthy();
    expect(screen.getByText(/Readable Contrast/i)).toBeTruthy();
    expect(screen.getByText(/Responsive Design/i)).toBeTruthy();
    expect(screen.getByText(/Ongoing Improvements/i)).toBeTruthy();
    // Support/contact path present and pointing at /contact (the page CTA;
    // the footer also links to /contact, so allow multiple matches).
    const contacts = screen.getAllByRole('link', { name: /Contact Us/i });
    expect(contacts.some((a) => a.getAttribute('href') === '/contact')).toBe(true);
  });

  it('renders cleanly in Arabic (RTL) with the localized title', () => {
    langState = { ...langState, lang: 'ar', isRTL: true };
    const { container } = renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'إمكانية الوصول' })).toBeTruthy();
    expect(container.querySelector('[dir="rtl"]')).toBeTruthy();
  });
});

describe('footer links to the Accessibility page', () => {
  it('contains a link to /accessibility', () => {
    render(<MemoryRouter><ComprehensiveFooter /></MemoryRouter>);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/accessibility');
  });
});
