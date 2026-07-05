// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

// Regression coverage for the "navbar placeholder forever" bug: when the app
// public-settings request FAILS, the auth check must still complete
// (authChecked=true) so consumers can settle into a definite state instead
// of waiting on the session check indefinitely.

const appClientGet = vi.hoisted(() => vi.fn());
vi.mock('@base44/sdk/dist/utils/axios-client', () => ({
  createAxiosClient: () => ({ get: appClientGet }),
}));

const authMock = vi.hoisted(() => ({ me: vi.fn(), logout: vi.fn(), redirectToLogin: vi.fn() }));
vi.mock('@/api/base44Client', () => ({ base44: { auth: authMock } }));

const appParamsMock = vi.hoisted(() => ({ appId: 'app1', token: null }));
vi.mock('@/lib/app-params', () => ({ appParams: appParamsMock }));

import { AuthProvider, useAuth } from '@/lib/AuthContext';

function Probe() {
  const { authChecked, isAuthenticated, authError } = useAuth();
  return (
    <div>
      <span data-testid="checked">{String(authChecked)}</span>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <span data-testid="error">{authError?.type || 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  appParamsMock.token = null;
});
afterEach(() => cleanup());

const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

describe('authChecked always settles', () => {
  it('healthy app + no token → checked, unauthenticated', async () => {
    appClientGet.mockResolvedValueOnce({ id: 'app1', public_settings: {} });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('checked').textContent).toBe('true'));
    expect(screen.getByTestId('authed').textContent).toBe('false');
  });

  it('healthy app + valid token → checked, authenticated', async () => {
    appParamsMock.token = 'tok';
    appClientGet.mockResolvedValueOnce({ id: 'app1', public_settings: {} });
    authMock.me.mockResolvedValueOnce({ id: 'u1', email: 'x@y.com' });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('checked').textContent).toBe('true'));
    expect(screen.getByTestId('authed').textContent).toBe('true');
  });

  it('public-settings failure STILL completes the check (the regression)', async () => {
    appParamsMock.token = 'tok';
    appClientGet.mockRejectedValueOnce(Object.assign(new Error('boom'), { status: 500 }));
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('checked').textContent).toBe('true'));
    expect(screen.getByTestId('authed').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('unknown');
  });

  it('me() failure with 401 clears the dead token and completes the check', async () => {
    appParamsMock.token = 'tok';
    window.localStorage.setItem('base44_access_token', 'tok');
    appClientGet.mockResolvedValueOnce({ id: 'app1', public_settings: {} });
    authMock.me.mockRejectedValueOnce(Object.assign(new Error('unauthorized'), { status: 401 }));
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('checked').textContent).toBe('true'));
    expect(screen.getByTestId('authed').textContent).toBe('false');
    expect(window.localStorage.getItem('base44_access_token')).toBeNull();
  });
});
