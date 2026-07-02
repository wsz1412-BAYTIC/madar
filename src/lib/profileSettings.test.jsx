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
});
afterEach(() => cleanup());

describe('Profile settings persistence', () => {
  it('persists full_name + phone via base44.auth.updateMe on Save', async () => {
    authMock.updateMe.mockResolvedValueOnce({});
    render(<MadarSettings />);

    fireEvent.change(screen.getByLabelText('fullName'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('phone'), { target: { value: '+966511112222' } });
    fireEvent.click(screen.getByText('saveChanges'));

    await waitFor(() => expect(authMock.updateMe).toHaveBeenCalledTimes(1));
    expect(authMock.updateMe).toHaveBeenCalledWith({ full_name: 'New Name', phone: '+966511112222' });
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

  it('no longer renders the non-functional notification toggles', () => {
    render(<MadarSettings />);
    expect(screen.queryByText('notifications')).toBeNull();
    expect(screen.queryByText('emailNotif')).toBeNull();
    expect(screen.queryByText('smsNotif')).toBeNull();
    expect(screen.queryByText('pushNotif')).toBeNull();
  });
});
