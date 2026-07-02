import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Regression guard for /pricing-recommendations: it must be a real protected
// route that redirects unauthenticated users to /login (never silently to
// Home "/"), and must not be admin-gated.

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const appSrc = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8');
const pageSrc = readFileSync(path.join(root, 'src', 'pages', 'PriceRecommendations.jsx'), 'utf8');

describe('/pricing-recommendations routing', () => {
  it('is registered as a route rendering PriceRecommendations', () => {
    expect(appSrc).toMatch(/path="\/pricing-recommendations" element=\{<PriceRecommendations \/>\}/);
  });

  it('lives inside the ProtectedRoute group (unauthenticated -> /login)', () => {
    const idxProtected = appSrc.indexOf('<ProtectedRoute');
    const idxRoute = appSrc.indexOf('path="/pricing-recommendations"');
    const idxCloseProtected = appSrc.indexOf('<Route path="*"'); // catch-all sits after the protected group
    expect(idxProtected).toBeGreaterThan(-1);
    expect(idxRoute).toBeGreaterThan(idxProtected);
    expect(idxRoute).toBeLessThan(idxCloseProtected);
    // ProtectedRoute redirects unauthenticated users to /login, never "/".
    expect(appSrc).toMatch(/unauthenticatedElement=\{<Navigate to="\/login" replace \/>\}/);
  });

  it('is NOT admin-gated (regular authenticated users can reach it)', () => {
    // The route line must not be wrapped by an AdminRoute element. Cheap check:
    // there is no AdminRoute between the AppLayout open and this route.
    const idxRoute = appSrc.indexOf('path="/pricing-recommendations"');
    const before = appSrc.slice(0, idxRoute);
    const lastAdminRoute = before.lastIndexOf('<AdminRoute');
    const lastAppLayout = before.lastIndexOf('<AppLayout');
    // AppLayout must be opened more recently than any AdminRoute before this route.
    expect(lastAppLayout).toBeGreaterThan(lastAdminRoute);
  });

  it('the page never silently redirects to Home ("/")', () => {
    expect(pageSrc).not.toMatch(/Navigate to="\/"/);
    expect(pageSrc).not.toMatch(/(navigate|location\.href|location\.assign)\(\s*["'`]\/["'`]\s*\)/);
  });

  it('gates its content behind a visible FeatureGuard fallback, not a blank/null one', () => {
    // A non-entitled but authenticated user must see an explanatory message,
    // not an empty page.
    expect(pageSrc).toMatch(/<FeatureGuard[\s\S]*?fallback=\{/);
    expect(pageSrc).toMatch(/feature="pricing\.recommendations"/);
  });
});
