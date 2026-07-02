import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Guards that the app runs exactly ONE auth system (Base44) — the legacy
// aimadar.com "Madar" auth flow, its provider, its broken login serializer,
// and its parallel localStorage token keys must all be gone. This is the
// static half of Critical Issue #2; behavioral coverage is in authFlow.test.jsx.

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const srcDir = path.join(root, 'src');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}
const sourceFiles = walk(srcDir).filter((f) => /\.(jsx?|tsx?)$/.test(f) && !/\.test\./.test(f));
const readAll = (f) => readFileSync(f, 'utf8');

describe('legacy auth system is fully removed', () => {
  it('the MadarAuthProvider / useMadarAuth context file no longer exists', () => {
    expect(existsSync(path.join(srcDir, 'contexts', 'AuthContext.jsx'))).toBe(false);
  });

  it('the legacy Madar auth pages no longer exist', () => {
    for (const p of ['pages/MadarLogin.jsx', 'pages/MadarSignup.jsx', 'pages/MadarForgotPassword.jsx']) {
      expect(existsSync(path.join(srcDir, p)), `${p} should be deleted`).toBe(false);
    }
  });

  it('no source file references useMadarAuth or MadarAuthProvider', () => {
    const offenders = sourceFiles.filter((f) => /useMadarAuth|MadarAuthProvider/.test(readAll(f)));
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });

  it('no parallel legacy token/session keys remain (madar_token / madar_access_token / madar_user)', () => {
    const offenders = sourceFiles.filter((f) => /madar_token|madar_access_token|madar_user/.test(readAll(f)));
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});

describe('Base44 is the single auth authority', () => {
  it('App.jsx wires Base44 AuthProvider and no legacy provider', () => {
    const app = readAll(path.join(srcDir, 'App.jsx'));
    expect(app).toMatch(/AuthProvider/);
    expect(app).not.toMatch(/MadarAuthProvider/);
  });

  it('App.jsx routes /login to the Base44 Login page, not a legacy page', () => {
    const app = readAll(path.join(srcDir, 'App.jsx'));
    expect(app).toMatch(/path="\/login" element=\{<Login \/>\}/);
    expect(app).not.toMatch(/MadarLogin/);
  });

  it('the Base44 provider logout delegates to the SDK (base44.auth.logout)', () => {
    const ctx = readAll(path.join(srcDir, 'lib', 'AuthContext.jsx'));
    expect(ctx).toMatch(/base44\.auth\.logout/);
  });

  it('the legacy REST helper no longer manages auth (no token/login/logout exports)', () => {
    const api = readAll(path.join(srcDir, 'lib', 'api.js'));
    for (const sym of ['setToken', 'getToken', 'logoutUser', 'isLoggedIn', 'setUser', 'getUser']) {
      expect(api, `api.js must not export ${sym}`).not.toMatch(new RegExp(`export function ${sym}`));
    }
  });

  it('the previously-broken login serializer (JSON.stringify of URLSearchParams) is gone', () => {
    // The legacy bug: api.post(..., new URLSearchParams(...)) -> JSON.stringify -> "{}".
    const offenders = sourceFiles.filter((f) => /URLSearchParams[\s\S]{0,120}api\.post/.test(readAll(f)));
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});

describe('authenticated routes are gated', () => {
  const app = readAll(path.join(srcDir, 'App.jsx'));
  it('App.jsx wraps the app route group in ProtectedRoute redirecting to /login', () => {
    expect(app).toMatch(/<ProtectedRoute\s+unauthenticatedElement=\{<Navigate to="\/login" replace \/>\}/);
  });
  it('the protected group contains the dashboard and admin routes', () => {
    // crude structural check: ProtectedRoute appears before the dashboard route
    const idxGuard = app.indexOf('<ProtectedRoute');
    const idxDash = app.indexOf('path="/dashboard"');
    const idxAdmin = app.indexOf('path="/admin"');
    expect(idxGuard).toBeGreaterThan(-1);
    expect(idxDash).toBeGreaterThan(idxGuard);
    expect(idxAdmin).toBeGreaterThan(idxGuard);
  });
});
