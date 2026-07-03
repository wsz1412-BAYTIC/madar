// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

let authState;
vi.mock('@/lib/AuthContext', () => ({ useAuth: () => authState }));

import AdminRoute from '@/components/AdminRoute';

beforeEach(() => {
  authState = {
    user: { id: 'u1', role: 'user' },
    isAuthenticated: true,
    isLoadingAuth: false,
    authChecked: true,
    checkUserAuth: vi.fn(),
  };
});
afterEach(() => cleanup());

function renderAdmin() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>ADMIN AREA</div>} />
        </Route>
        <Route path="/dashboard" element={<div>USER DASHBOARD</div>} />
        <Route path="/login" element={<div>LOGIN</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute gates on User.role === "admin"', () => {
  it('an admin sees the admin area', () => {
    authState.user = { id: 'a1', role: 'admin' };
    renderAdmin();
    expect(screen.getByText('ADMIN AREA')).toBeTruthy();
  });

  it('a normal authenticated user is redirected to /dashboard (not the admin area)', () => {
    authState.user = { id: 'u1', role: 'user' };
    renderAdmin();
    expect(screen.queryByText('ADMIN AREA')).toBeNull();
    expect(screen.getByText('USER DASHBOARD')).toBeTruthy();
  });

  it('a user with no role is treated as non-admin', () => {
    authState.user = { id: 'u2' };
    renderAdmin();
    expect(screen.queryByText('ADMIN AREA')).toBeNull();
    expect(screen.getByText('USER DASHBOARD')).toBeTruthy();
  });

  it('an unauthenticated caller is redirected to /login', () => {
    authState.isAuthenticated = false;
    authState.user = null;
    renderAdmin();
    expect(screen.queryByText('ADMIN AREA')).toBeNull();
    expect(screen.getByText('LOGIN')).toBeTruthy();
  });

  it('shows a loading fallback while the session is still being checked (does not flash the admin area)', () => {
    authState.isLoadingAuth = true;
    authState.authChecked = false;
    renderAdmin();
    expect(screen.queryByText('ADMIN AREA')).toBeNull();
    expect(screen.queryByText('USER DASHBOARD')).toBeNull();
  });

  it('does NOT use the AdminUser table for access control', async () => {
    // AdminRoute must not reference the AdminUser entity at all.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'src', 'components', 'AdminRoute.jsx'),
      'utf8'
    );
    expect(src).not.toMatch(/entities\.AdminUser/);
    expect(src).not.toMatch(/base44Client|from ['"]@\/api/);
    expect(src).toMatch(/role !== 'admin'/);
  });
});
