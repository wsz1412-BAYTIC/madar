// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Homepage auth-state coverage (the body, not just the navbar): while the
// session check runs the hero/pricing/final CTAs show neutral placeholders;
// once checked, a guest sees "Start Free" paths and a signed-in user sees
// dashboard/account paths — never the guest pitch.

let langState;
vi.mock('@/contexts/LanguageContext', () => ({
  useLang: () => langState,
}));
let themeState;
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => themeState,
}));
let authState;
vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => authState,
}));

// Landing's below-the-fold sections are standalone components with their own
// coverage; stub them so this test exercises Landing's OWN auth logic fast.
// (vi.hoisted so the hoisted vi.mock factories below can reference it.)
const stub = vi.hoisted(() => () => ({ default: () => null }));
vi.mock('@/components/madar/PublicNavbar', () => stub('navbar'));
vi.mock('@/components/madar/ComprehensiveFooter', () => stub('footer'));
vi.mock('@/components/madar/PlatformLogos', () => stub('logos'));
vi.mock('@/components/madar/MarketMetrics', () => stub('metrics'));
vi.mock('@/components/madar/ProblemSolution', () => stub('problem'));
vi.mock('@/components/madar/DashboardShowcase', () => stub('showcase'));
vi.mock('@/components/madar/PremiumFeatures', () => stub('features'));
vi.mock('@/components/madar/ToolsSection', () => stub('tools'));
vi.mock('@/components/madar/HowItWorks', () => stub('how'));
vi.mock('@/components/madar/SupportedCities', () => stub('cities'));
vi.mock('@/components/madar/Testimonials', () => stub('testimonials'));
vi.mock('@/components/madar/FinalCTA', () => stub('finalcta'));
vi.mock('@/components/madar/Motion', () => ({
  // eslint-disable-next-line react/prop-types
  FadeIn: ({ children }) => <div>{children}</div>,
  // eslint-disable-next-line react/prop-types
  ScaleIn: ({ children }) => <div>{children}</div>,
  // eslint-disable-next-line react/prop-types
  StaggerContainer: ({ children }) => <div>{children}</div>,
  // eslint-disable-next-line react/prop-types
  StaggerItem: ({ children }) => <div>{children}</div>,
  // eslint-disable-next-line react/prop-types
  ParallaxImage: ({ children }) => <div>{children}</div>,
}));

import Landing from '@/pages/Landing';

const T = {
  startFree: 'Start Free',
  viewPricing: 'View pricing',
  getStarted: 'Get Started',
  trustedBy: 'Trusted by 500+ hosts',
  heroTitle: 'Your AI Revenue Co-Pilot',
  heroSubtitle: 'for Short-Term Rentals',
  heroDesc: 'Madar optimizes your pricing.',
  pricingSubtitle: 'Start free, upgrade as you grow',
};

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'en', isRTL: false, t: (k) => T[k] || k };
  themeState = { theme: 'dark', toggleTheme: vi.fn() };
  authState = { isAuthenticated: false, authChecked: true, user: null };
});
afterEach(() => cleanup());

const renderLanding = () =>
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );

describe('guest state', () => {
  it('hero shows Start Free → /signup and the pricing subtitle pitches starting free', () => {
    renderLanding();
    const cta = screen.getByRole('link', { name: /start free/i });
    expect(cta.getAttribute('href')).toBe('/signup');
    expect(screen.getByText('Start free, upgrade as you grow')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /get started/i }).length).toBeGreaterThan(0);
  });
});

describe('signed-in state', () => {
  beforeEach(() => {
    authState = {
      isAuthenticated: true,
      authChecked: true,
      user: { id: 'u1', full_name: 'Sara Alotaibi', email: 'sara@example.com' },
    };
  });

  it('hero welcomes the user by name and routes to the dashboard — zero Start Free anywhere', () => {
    renderLanding();
    const cta = screen.getByRole('link', { name: /welcome back, sara/i });
    expect(cta.getAttribute('href')).toBe('/dashboard');
    expect(screen.getByRole('link', { name: /my properties/i }).getAttribute('href')).toBe('/properties');
    expect(screen.queryByText(/start free/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /get started/i })).toBeNull();
  });

  it('pricing cards flip to Manage plan → /billing', () => {
    renderLanding();
    const manage = screen.getAllByRole('link', { name: /manage plan/i });
    expect(manage.length).toBeGreaterThan(0);
    expect(manage[0].getAttribute('href')).toBe('/billing');
  });
});

describe('while the session check is still running', () => {
  it('shows neither guest nor user CTAs (placeholders only)', () => {
    authState = { isAuthenticated: false, authChecked: false, user: null };
    renderLanding();
    expect(screen.queryByRole('link', { name: /start free/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /welcome back/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /get started/i })).toBeNull();
  });
});

describe('Arabic', () => {
  it('signed-in Arabic hero shows the Arabic dashboard CTA and no ابدأ pitch', () => {
    langState = { lang: 'ar', isRTL: true, t: (k) => ({ startFree: 'ابدأ مجانًا', getStarted: 'ابدأ الآن' }[k] || k) };
    authState = { isAuthenticated: true, authChecked: true, user: { id: 'u1', full_name: 'سارة العتيبي' } };
    renderLanding();
    expect(screen.getByText(/أهلًا بعودتك سارة/)).toBeTruthy();
    expect(screen.getByText('عقاراتي')).toBeTruthy();
    expect(screen.queryByText(/ابدأ مجانًا|ابدأ الآن/)).toBeNull();
  });
});
