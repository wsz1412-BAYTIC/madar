// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Header auth-state coverage: while the session check runs the navbar shows
// NEITHER guest CTAs nor the user menu; once checked it shows exactly one of
// them. Covers desktop dropdown, mobile menu, logout, and Arabic labels.

const T = {
  en: { login: 'Sign In', getStarted: 'Get Started', dashboard: 'Dashboard', account: 'Account', logout: 'Logout', language: 'العربية' },
  ar: { login: 'تسجيل الدخول', getStarted: 'ابدأ الآن', dashboard: 'لوحة التحكم', account: 'الحساب', logout: 'تسجيل الخروج', language: 'English' },
};

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

import PublicNavbar, { userInitials } from '@/components/madar/PublicNavbar';

const makeLang = (lang) => ({
  lang,
  isRTL: lang === 'ar',
  t: (k) => T[lang][k] || k,
  toggleLang: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  langState = makeLang('en');
  themeState = { theme: 'dark', toggleTheme: vi.fn() };
  authState = { isAuthenticated: false, authChecked: true, user: null, logout: vi.fn() };
});
afterEach(() => cleanup());

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <PublicNavbar />
    </MemoryRouter>
  );

describe('while the auth check is still running', () => {
  it('shows neither the guest CTAs nor the user menu (no guest flash)', () => {
    authState = { ...authState, authChecked: false };
    renderNavbar();
    expect(screen.queryByText('Sign In')).toBeNull();
    expect(screen.queryByText('Get Started')).toBeNull();
    expect(screen.queryByRole('button', { name: 'User menu' })).toBeNull();
  });
});

describe('guest state', () => {
  it('shows Sign In + Get Started and no user menu', () => {
    renderNavbar();
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByText('Get Started')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'User menu' })).toBeNull();
  });
});

describe('authenticated state (desktop)', () => {
  beforeEach(() => {
    authState = {
      isAuthenticated: true,
      authChecked: true,
      user: { id: 'u1', full_name: 'Sara Alotaibi', email: 'sara@example.com' },
      logout: vi.fn(),
    };
  });

  it('replaces the CTAs with the user identity: no Sign In / Get Started anywhere', () => {
    renderNavbar();
    expect(screen.queryByText('Sign In')).toBeNull();
    expect(screen.queryByText('Get Started')).toBeNull();
    expect(screen.getAllByText('Sara Alotaibi').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SA').length).toBeGreaterThanOrEqual(1); // avatar initials
    expect(screen.getAllByRole('link', { name: /dashboard/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('opens the user menu with Dashboard, Account and Logout; logout calls the auth context', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.map((m) => m.textContent)).toEqual(['Dashboard', 'Account', 'Logout']);
    // Account points at settings, Dashboard at the app.
    expect(screen.getAllByRole('menuitem').find((m) => m.textContent === 'Account').getAttribute('href')).toBe('/settings');
    expect(screen.getAllByRole('menuitem').find((m) => m.textContent === 'Dashboard').getAttribute('href')).toBe('/dashboard');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Logout' }));
    expect(authState.logout).toHaveBeenCalledTimes(1);
  });

  it('mobile menu shows the user identity + Dashboard/Account/Logout instead of guest CTAs', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.queryByText('Sign In')).toBeNull();
    expect(screen.queryByText('Get Started')).toBeNull();
    expect(screen.getAllByText('Sara Alotaibi').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /account/i }).length).toBeGreaterThanOrEqual(1);
    const logoutButtons = screen.getAllByRole('button', { name: /logout/i });
    fireEvent.click(logoutButtons[logoutButtons.length - 1]);
    expect(authState.logout).toHaveBeenCalled();
  });

  it('falls back to the email when no name is set', () => {
    authState.user = { id: 'u1', email: 'host@example.com' };
    renderNavbar();
    expect(screen.getAllByText('host@example.com').length).toBeGreaterThanOrEqual(1);
  });
});

describe('Arabic RTL', () => {
  it('renders the Arabic menu labels', () => {
    langState = makeLang('ar');
    authState = {
      isAuthenticated: true,
      authChecked: true,
      user: { id: 'u1', full_name: 'سارة العتيبي', email: 'sara@example.com' },
      logout: vi.fn(),
    };
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'قائمة المستخدم' }));
    expect(screen.getAllByText('لوحة التحكم').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('الحساب')).toBeTruthy();
    expect(screen.getByText('تسجيل الخروج')).toBeTruthy();
    expect(screen.queryByText('تسجيل الدخول')).toBeNull();
    expect(screen.queryByText('ابدأ الآن')).toBeNull();
  });
});

describe('userInitials', () => {
  it('derives initials from the name, else the email', () => {
    expect(userInitials({ full_name: 'Sara Alotaibi' })).toBe('SA');
    expect(userInitials({ full_name: 'Sara' })).toBe('S');
    expect(userInitials({ email: 'host@example.com' })).toBe('H');
    expect(userInitials(null)).toBe('?');
  });
});
