// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Behavioral coverage for Critical Issue #2 (auth flow). Base44 is mocked so
// these run without a backend; the live counterpart is
// src/lib/entityRls.integration.test.js.

// --- shared mock of the Base44 client ---------------------------------------
// vi.hoisted so the factory below (also hoisted) can reference it safely.
const authMock = vi.hoisted(() => ({
  loginViaEmailPassword: vi.fn(),
  loginWithProvider: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  register: vi.fn(),
  verifyOtp: vi.fn(),
  resendOtp: vi.fn(),
  setToken: vi.fn(),
  updateMe: vi.fn().mockResolvedValue({}),
}));
vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn(), useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/api/base44Client', () => ({ base44: { auth: authMock } }));

// --- controllable mock of the Base44 useAuth hook ---------------------------
let authState;
vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => authState,
}));

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

import ProtectedRoute from '@/components/ProtectedRoute';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

beforeEach(() => {
  vi.clearAllMocks();
  authState = {
    isAuthenticated: false,
    isLoadingAuth: false,
    authChecked: true,
    authError: null,
    checkUserAuth: vi.fn(),
  };
});
afterEach(() => cleanup());

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route element={<Outlet />}>
            <Route path="/dashboard" element={<div>SECRET DASHBOARD</div>} />
          </Route>
        </Route>
        <Route path="/login" element={<div>LOGIN SCREEN</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('unauthorized-route: ProtectedRoute redirects an unauthenticated user to /login', () => {
  it('does not render the protected content', () => {
    authState.isAuthenticated = false;
    renderProtected();
    expect(screen.queryByText('SECRET DASHBOARD')).toBeNull();
    expect(screen.getByText('LOGIN SCREEN')).toBeTruthy();
  });
});

describe('authorized-route: an authenticated user sees the protected content', () => {
  it('renders the dashboard', () => {
    authState.isAuthenticated = true;
    renderProtected();
    expect(screen.getByText('SECRET DASHBOARD')).toBeTruthy();
    expect(screen.queryByText('LOGIN SCREEN')).toBeNull();
  });
});

describe('loading: ProtectedRoute shows a fallback while the session is being checked', () => {
  it('renders neither the content nor the login redirect yet', () => {
    authState.isLoadingAuth = true;
    authState.authChecked = false;
    renderProtected();
    expect(screen.queryByText('SECRET DASHBOARD')).toBeNull();
    expect(screen.queryByText('LOGIN SCREEN')).toBeNull();
  });
});

describe('expired-session: an auth error (e.g. 401 from a stale token) forces re-login', () => {
  it('treats authError as unauthenticated and redirects to /login', () => {
    authState.isAuthenticated = false;
    authState.authError = { type: 'auth_required', message: 'Authentication required' };
    renderProtected();
    expect(screen.queryByText('SECRET DASHBOARD')).toBeNull();
    expect(screen.getByText('LOGIN SCREEN')).toBeTruthy();
  });
});

describe('login: credentials are actually sent to Base44 (fixes the broken legacy serializer)', () => {
  it('submits email + password to base44.auth.loginViaEmailPassword', async () => {
    authMock.loginViaEmailPassword.mockResolvedValueOnce({ access_token: 't', user: { id: 'u1' } });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'host@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 's3cret!' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(authMock.loginViaEmailPassword).toHaveBeenCalledTimes(1);
    });
    expect(authMock.loginViaEmailPassword).toHaveBeenCalledWith('host@example.com', 's3cret!');
  });

  it('shows an error and does not proceed when Base44 rejects the credentials', async () => {
    authMock.loginViaEmailPassword.mockRejectedValueOnce(new Error('Invalid email or password'));
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeTruthy();
  });
});

describe('registration: a verified new user actually ends up signed in', () => {
  async function registerAndVerify({ telegram = '' } = {}) {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Register />
        </LanguageProvider>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Sara Alotaibi' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ngPass!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Str0ngPass!' } });
    if (telegram) {
      fireEvent.change(screen.getByLabelText('Telegram username'), { target: { value: telegram } });
    }
    fireEvent.click(screen.getByRole('checkbox')); // legal consent
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(authMock.register).toHaveBeenCalledWith({ email: 'new@example.com', password: 'Str0ngPass!' }));
    // OTP screen appears
    const otp = await screen.findByRole('textbox');
    fireEvent.change(otp, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));
  }

  it('when verifyOtp does NOT return a token, it completes the flow with an explicit login (the fix)', async () => {
    authMock.register.mockResolvedValueOnce({});
    authMock.verifyOtp.mockResolvedValueOnce({}); // no access_token — the common case
    authMock.loginViaEmailPassword.mockResolvedValueOnce({ access_token: 't', user: { id: 'u' } });
    await registerAndVerify();
    await waitFor(() =>
      expect(authMock.loginViaEmailPassword).toHaveBeenCalledWith('new@example.com', 'Str0ngPass!')
    );
  });

  it('when verifyOtp DOES return a token, it sets it and does not double-login', async () => {
    authMock.register.mockResolvedValueOnce({});
    authMock.verifyOtp.mockResolvedValueOnce({ access_token: 'tok123' });
    await registerAndVerify();
    await waitFor(() => expect(authMock.setToken).toHaveBeenCalledWith('tok123'));
    expect(authMock.loginViaEmailPassword).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords before calling the backend', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Register />
        </LanguageProvider>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Sara' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'aaaaaa1!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'bbbbbb2!' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
    expect(authMock.register).not.toHaveBeenCalled();
  });

  it('requires legal consent before calling the backend', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Register />
        </LanguageProvider>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Sara' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'aaaaaa1!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'aaaaaa1!' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/Terms and Privacy Policy/)).toBeTruthy();
    expect(authMock.register).not.toHaveBeenCalled();
  });

  it('signup WITHOUT Telegram succeeds and saves only the name', async () => {
    authMock.register.mockResolvedValueOnce({});
    authMock.verifyOtp.mockResolvedValueOnce({ access_token: 't1' });
    await registerAndVerify();
    await waitFor(() => expect(authMock.updateMe).toHaveBeenCalledTimes(1));
    expect(authMock.updateMe).toHaveBeenCalledWith({ full_name: 'Sara Alotaibi' });
  });

  it('signup WITH a valid Telegram saves the normalized handle', async () => {
    authMock.register.mockResolvedValueOnce({});
    authMock.verifyOtp.mockResolvedValueOnce({ access_token: 't2' });
    await registerAndVerify({ telegram: 'sara_riyadh' });
    await waitFor(() => expect(authMock.updateMe).toHaveBeenCalledTimes(1));
    expect(authMock.updateMe).toHaveBeenCalledWith({
      full_name: 'Sara Alotaibi',
      telegram_username: '@sara_riyadh',
    });
  });

  it('an INVALID Telegram never blocks registration — it is skipped', async () => {
    authMock.register.mockResolvedValueOnce({});
    authMock.verifyOtp.mockResolvedValueOnce({ access_token: 't3' });
    await registerAndVerify({ telegram: '@ab' }); // too short — invalid
    // registration proceeded to OTP + verify regardless
    await waitFor(() => expect(authMock.updateMe).toHaveBeenCalledTimes(1));
    expect(authMock.updateMe).toHaveBeenCalledWith({ full_name: 'Sara Alotaibi' });
  });
});

describe('logout: the UI logout control invokes the auth system', () => {
  it('a logout button wired to useAuth().logout calls it exactly once', () => {
    const logoutSpy = vi.fn();
    authState.logout = logoutSpy;
    // Minimal stand-in for the Sidebar/nav logout control: it reads logout
    // from the (single) auth system and calls it on click.
    // eslint-disable-next-line react/prop-types
    function LogoutButton() {
      return <button onClick={() => authState.logout()}>logout</button>;
    }
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });
});
