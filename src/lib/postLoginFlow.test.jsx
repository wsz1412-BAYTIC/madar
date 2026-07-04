// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Login redirect coverage: verified user → /dashboard, admin → /admin,
// unverified → the Register verification screen; plus the ?verify deep link.

const authMock = vi.hoisted(() => ({
  loginViaEmailPassword: vi.fn(),
  loginWithProvider: vi.fn(),
  register: vi.fn(),
  verifyOtp: vi.fn(),
  resendOtp: vi.fn(),
  setToken: vi.fn(),
  me: vi.fn(),
  updateMe: vi.fn().mockResolvedValue({}),
  logout: vi.fn(),
}));
vi.mock('@/api/base44Client', () => ({ base44: { auth: authMock } }));
vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn(), useToast: () => ({ toast: vi.fn() }) }));

// jsdom lacks a couple of DOM APIs the OTP input (input-otp) touches.
globalThis.ResizeObserver =
  globalThis.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Capture window.location.href assignments without navigating jsdom.
let navigatedTo;
const realLocation = window.location;
beforeEach(() => {
  vi.clearAllMocks();
  navigatedTo = null;
  delete window.location;
  window.location = {
    ...realLocation,
    assign: vi.fn(),
    replace: vi.fn(),
  };
  Object.defineProperty(window.location, 'href', {
    get: () => 'http://localhost/',
    set: (v) => { navigatedTo = v; },
    configurable: true,
  });
});
afterEach(() => {
  window.location = realLocation;
  cleanup();
});

async function submitLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'sara@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 's3cret!' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));
}

describe('post-login redirect', () => {
  it('verified regular user lands on /dashboard (not the public homepage)', async () => {
    authMock.loginViaEmailPassword.mockResolvedValueOnce({
      access_token: 't',
      user: { id: 'u1', email: 'sara@example.com', role: 'user' },
    });
    await submitLogin();
    await waitFor(() => expect(navigatedTo).toBe('/dashboard'));
  });

  it('admin lands on /admin', async () => {
    authMock.loginViaEmailPassword.mockResolvedValueOnce({
      access_token: 't',
      user: { id: 'u1', email: 'admin@example.com', role: 'admin' },
    });
    await submitLogin();
    await waitFor(() => expect(navigatedTo).toBe('/admin'));
  });

  it('unverified user (flagged on the user object) is sent to the verification screen', async () => {
    authMock.loginViaEmailPassword.mockResolvedValueOnce({
      access_token: 't',
      user: { id: 'u1', email: 'sara@example.com', email_verified: false },
    });
    await submitLogin();
    await waitFor(() => expect(navigatedTo).toBe('/register?verify=1&email=sara%40example.com'));
  });

  it('login rejected with a verification error also routes to the verification screen', async () => {
    authMock.loginViaEmailPassword.mockRejectedValueOnce(new Error('Please verify your email first'));
    await submitLogin();
    await waitFor(() => expect(navigatedTo).toBe('/register?verify=1&email=sara%40example.com'));
  });

  it('a plain bad-credentials error stays on the login page with the message', async () => {
    authMock.loginViaEmailPassword.mockRejectedValueOnce(new Error('Invalid email or password'));
    await submitLogin();
    expect(await screen.findByText('Invalid email or password')).toBeTruthy();
    expect(navigatedTo).toBeNull();
  });
});

describe('the ?verify deep link on Register', () => {
  it('jumps straight to the OTP screen with the email prefilled', async () => {
    render(
      <MemoryRouter initialEntries={['/register?verify=1&email=sara%40example.com']}>
        <LanguageProvider>
          <Register />
        </LanguageProvider>
      </MemoryRouter>
    );
    // OTP screen, not the signup form.
    expect(await screen.findByRole('button', { name: /^verify$/i })).toBeTruthy();
    expect(screen.queryByLabelText('Full Name')).toBeNull();
    expect(screen.getByText(/sara@example\.com/)).toBeTruthy();
  });

  it('after verifying via the deep link (no password in memory) it hands off to /login', async () => {
    authMock.verifyOtp.mockResolvedValueOnce({}); // no token returned
    render(
      <MemoryRouter initialEntries={['/register?verify=1&email=sara%40example.com']}>
        <LanguageProvider>
          <Register />
        </LanguageProvider>
      </MemoryRouter>
    );
    const otp = await screen.findByRole('textbox');
    fireEvent.change(otp, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));
    await waitFor(() => expect(navigatedTo).toBe('/login'));
    expect(authMock.loginViaEmailPassword).not.toHaveBeenCalled();
  });
});
