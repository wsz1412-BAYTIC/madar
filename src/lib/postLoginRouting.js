// Post-login destination rules. Pure — unit-tested, no React, no SDK.
//
// Root cause of the "logged in but the homepage still greets me like a
// guest" report: Login always redirected to "/" (the public landing page),
// whose header renders the guest CTAs until the async auth check finishes.
// Login now sends users where they actually belong:
//   • admin            → /admin
//   • unverified email → the verification screen (Register's OTP step)
//   • everyone else    → /dashboard

/** Route to Register's OTP/verification screen for an unverified account. */
export function verifyEmailRoute(email) {
  const query = email ? `&email=${encodeURIComponent(email)}` : '';
  return `/register?verify=1${query}`;
}

/** True when the user object carries an explicit "email not verified" flag. */
export function isUnverifiedUser(user) {
  if (!user) return false;
  return (
    user.email_verified === false ||
    user.is_verified === false ||
    user.verified === false
  );
}

/**
 * Where to land after a successful login.
 * `user` is whatever base44.auth.loginViaEmailPassword returned (may be
 * undefined — default to the dashboard and let ProtectedRoute re-check).
 */
export function resolvePostLoginRoute(user) {
  if (isUnverifiedUser(user)) return verifyEmailRoute(user.email);
  // Canonical admin signal — same check as AdminRoute / entity RLS.
  if (user?.role === 'admin') return '/admin';
  return '/dashboard';
}

/**
 * True when a login failure means "account exists but the email was never
 * verified" — the user should be sent to the verification screen, not shown
 * a generic error.
 */
export function isUnverifiedLoginError(err) {
  const text = [err?.message, err?.response?.data?.detail, err?.data?.detail]
    .filter(Boolean)
    .join(' ');
  return /verif|confirm your email|not confirmed/i.test(text);
}
