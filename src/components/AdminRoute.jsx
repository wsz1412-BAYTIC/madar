import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

/**
 * Route guard for admin-only sections. Access is gated solely on
 * `user.role === "admin"` (the canonical admin signal, matching the entity
 * RLS `user_condition: { role: "admin" }`). The AdminUser table is NOT used
 * for access control.
 *
 * This is a UX guard only — the real boundary is server-side (entity RLS for
 * reads, and admin backend functions re-checking the role for any mutation).
 * A non-admin who bypasses this still cannot read/write admin data.
 *
 * Intended to be nested inside ProtectedRoute (which handles authentication),
 * but it defends against the unauthenticated case too.
 */
export default function AdminRoute({
  fallback = <DefaultFallback />,
  unauthenticatedElement = <Navigate to="/login" replace />,
  unauthorizedElement = <Navigate to="/dashboard" replace />,
}) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, checkUserAuth } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  if (user?.role !== 'admin') {
    return unauthorizedElement;
  }

  return <Outlet />;
}
