// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Coverage for the legal/compliance layer: every policy route renders its
// page in BOTH languages with the version stamp and lawyer-draft banner, the
// content files satisfy the bilingual schema, and the footer links to every
// policy route.

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

// framer-motion needs layout APIs jsdom lacks.
vi.mock('@/components/madar/Motion', () => ({
  // eslint-disable-next-line react/prop-types
  FadeIn: ({ children }) => <div>{children}</div>,
}));

import { POLICY_ROUTES, POLICY_VERSIONS, LAWYER_REVIEW_NOTICE } from '@/config/legal';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import SubscriptionPolicy from '@/pages/SubscriptionPolicy';
import DataAiPolicy from '@/pages/DataAiPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import Contact from '@/pages/Contact';

import privacyContent from '@/content/legal/privacy';
import termsContent from '@/content/legal/terms';
import subscriptionContent from '@/content/legal/subscription';
import dataAiContent from '@/content/legal/dataAi';
import cookiesContent from '@/content/legal/cookies';
import contactContent from '@/content/legal/contact';

const PAGES = [
  { key: 'privacy', Component: PrivacyPolicy, content: privacyContent },
  { key: 'terms', Component: Terms, content: termsContent },
  { key: 'subscription', Component: SubscriptionPolicy, content: subscriptionContent },
  { key: 'dataAi', Component: DataAiPolicy, content: dataAiContent },
  { key: 'cookies', Component: CookiePolicy, content: cookiesContent },
  { key: 'contact', Component: Contact, content: contactContent },
];

beforeEach(() => {
  vi.clearAllMocks();
  langState = { t: (k) => k, lang: 'en', isRTL: false, toggleLang: vi.fn(), setLang: vi.fn() };
  themeState = { theme: 'dark', toggleTheme: vi.fn(), preference: 'system', setPreference: vi.fn() };
  authState = { isAuthenticated: false };
});
afterEach(() => cleanup());

function renderAt(route, element) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={route} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe('legal content files', () => {
  it.each(PAGES)('$key content matches the bilingual schema', ({ key, content }) => {
    expect(content.key).toBe(key);
    expect(content.title.en).toBeTruthy();
    expect(content.title.ar).toBeTruthy();
    expect(content.sections.length).toBeGreaterThanOrEqual(5);
    for (const section of content.sections) {
      expect(section.heading.en, `${key}/${section.id} heading.en`).toBeTruthy();
      expect(section.heading.ar, `${key}/${section.id} heading.ar`).toBeTruthy();
      expect(section.body.en, `${key}/${section.id} body.en`).toBeTruthy();
      expect(section.body.ar, `${key}/${section.id} body.ar`).toBeTruthy();
    }
  });

  it('terms disclaim guarantees and platform affiliation; subscription keeps the refund placeholder', () => {
    const termsText = termsContent.sections.map((s) => s.body.en).join(' ');
    expect(termsText).toMatch(/does not guarantee/i);
    expect(termsText).toMatch(/advisory/i);
    const subText = subscriptionContent.sections.map((s) => s.body.en).join(' ');
    expect(subText).toMatch(/\[Refund policy — to be finalized/);
    expect(subText).toMatch(/one \(1\) free trial/i);
  });
});

describe('legal pages render on their routes (English)', () => {
  it.each(PAGES)('$key page shows title, version stamp, and lawyer-draft banner', ({ key, Component, content }) => {
    renderAt(POLICY_ROUTES[key], <Component />);
    expect(screen.getByRole('heading', { level: 1, name: content.title.en })).toBeTruthy();
    expect(screen.getByText(new RegExp(`Version ${POLICY_VERSIONS[key]}`))).toBeTruthy();
    expect(screen.getByText(LAWYER_REVIEW_NOTICE.en)).toBeTruthy();
    // Every numbered section heading is on the page.
    for (const [i, section] of content.sections.entries()) {
      expect(screen.getByText(`${i + 1}. ${section.heading.en}`)).toBeTruthy();
    }
    cleanup();
  });
});

describe('legal pages render in Arabic', () => {
  it.each(PAGES)('$key page shows the Arabic title and banner', ({ key, Component, content }) => {
    langState = { ...langState, lang: 'ar', isRTL: true };
    renderAt(POLICY_ROUTES[key], <Component />);
    expect(screen.getByRole('heading', { level: 1, name: content.title.ar })).toBeTruthy();
    expect(screen.getByText(LAWYER_REVIEW_NOTICE.ar)).toBeTruthy();
    cleanup();
  });
});

describe('footer links to every legal page', () => {
  it('contains a link to each policy route', () => {
    render(
      <MemoryRouter>
        <ComprehensiveFooter />
      </MemoryRouter>
    );
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    for (const route of Object.values(POLICY_ROUTES)) {
      expect(hrefs, `footer link to ${route}`).toContain(route);
    }
  });
});
