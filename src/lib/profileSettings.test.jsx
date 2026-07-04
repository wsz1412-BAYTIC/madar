// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// Base44 + hooks are mocked so this runs without a backend.
const authMock = vi.hoisted(() => ({ updateMe: vi.fn() }));
vi.mock('@/api/base44Client', () => ({ base44: { auth: authMock } }));

const toastSpy = vi.hoisted(() => vi.fn());
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: toastSpy }) }));

let authState;
vi.mock('@/lib/AuthContext', () => ({ useAuth: () => authState }));

let langState;
vi.mock('@/contexts/LanguageContext', () => ({
  useLang: () => langState,
}));

let themeState;
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => themeState,
}));

// FadeIn wraps children in framer-motion, which needs layout APIs jsdom lacks.
vi.mock('@/components/madar/Motion', () => ({
  // eslint-disable-next-line react/prop-types
  FadeIn: ({ children }) => <div>{children}</div>,
}));

import MadarSettings from '@/pages/MadarSettings';

beforeEach(() => {
  vi.clearAllMocks();
  authState = {
    user: { full_name: 'Old Name', email: 'host@example.com', phone: '+966500000000' },
    checkUserAuth: vi.fn().mockResolvedValue(undefined),
  };
  langState = { t: (k) => k, lang: 'en', setLang: vi.fn() };
  themeState = { preference: 'system', setPreference: vi.fn() };
});
afterEach(() => cleanup());

describe('Profile settings persistence', () => {
  it('persists profile fields + notification prefs via base44.auth.updateMe on Save', async () => {
    authMock.updateMe.mockResolvedValueOnce({});
    render(<MadarSettings />);

    fireEvent.change(screen.getByLabelText('fullName'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('phone'), { target: { value: '+966511112222' } });
    fireEvent.click(screen.getByText('saveChanges'));

    await waitFor(() => expect(authMock.updateMe).toHaveBeenCalledTimes(1));
    expect(authMock.updateMe).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'New Name',
      phone: '+966511112222',
      notification_prefs: expect.objectContaining({
        aiRecommendations: expect.any(Boolean),
        marketNews: expect.any(Boolean),
        billingAlerts: expect.any(Boolean),
      }),
    }));
  });

  it('refreshes the session user and shows a success toast after saving', async () => {
    authMock.updateMe.mockResolvedValueOnce({});
    render(<MadarSettings />);
    fireEvent.click(screen.getByText('saveChanges'));

    await waitFor(() => expect(authState.checkUserAuth).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ description: expect.any(String) }));
    // success toast has no destructive variant
    expect(toastSpy).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
  });

  it('shows an error toast and does not throw when updateMe rejects', async () => {
    authMock.updateMe.mockRejectedValueOnce(new Error('network'));
    render(<MadarSettings />);
    fireEvent.click(screen.getByText('saveChanges'));

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
    );
  });

  it('renders email as read-only (identity is not editable here)', () => {
    render(<MadarSettings />);
    const email = screen.getByLabelText('email');
    expect(email.hasAttribute('readonly') || email.hasAttribute('disabled')).toBe(true);
    expect(email.value).toBe('host@example.com');
  });

  it('Appearance section persists the preference through ThemeContext', () => {
    render(<MadarSettings />);
    const lightBtn = screen.getByRole('radio', { name: 'Light' });
    fireEvent.click(lightBtn);
    expect(themeState.setPreference).toHaveBeenCalledWith('light');
    // System is the currently selected preference
    expect(screen.getByRole('radio', { name: 'System' }).getAttribute('aria-checked')).toBe('true');
  });

  it('rejects an invalid Telegram username before calling updateMe', async () => {
    render(<MadarSettings />);
    fireEvent.change(screen.getByLabelText(/Telegram username/), { target: { value: '@ab' } });
    fireEvent.click(screen.getByText('saveChanges'));
    await waitFor(() => expect(screen.getByText(/Invalid Telegram username/)).toBeTruthy());
    expect(authMock.updateMe).not.toHaveBeenCalled();
  });

  it('normalizes a valid Telegram username on save', async () => {
    authMock.updateMe.mockResolvedValueOnce({});
    render(<MadarSettings />);
    fireEvent.change(screen.getByLabelText(/Telegram username/), { target: { value: 'sara_riyadh' } });
    fireEvent.click(screen.getByText('saveChanges'));
    await waitFor(() => expect(authMock.updateMe).toHaveBeenCalledTimes(1));
    expect(authMock.updateMe).toHaveBeenCalledWith(
      expect.objectContaining({ telegram_username: '@sara_riyadh' })
    );
  });

  it('renders the three real notification preference switches', () => {
    render(<MadarSettings />);
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
    // default on; clicking flips local state without crashing
    fireEvent.click(switches[1]);
    expect(switches[1].getAttribute('aria-checked')).toBe('false');
  });
});
