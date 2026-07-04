import { describe, it, expect } from 'vitest';
import {
  resolvePostLoginRoute,
  isUnverifiedUser,
  isUnverifiedLoginError,
  verifyEmailRoute,
} from './postLoginRouting.js';

describe('resolvePostLoginRoute', () => {
  it('sends a verified regular user to the dashboard', () => {
    expect(resolvePostLoginRoute({ id: 'u1', email: 'a@b.c', role: 'user' })).toBe('/dashboard');
    expect(resolvePostLoginRoute({ id: 'u1', email: 'a@b.c' })).toBe('/dashboard');
  });

  it('sends an admin to the admin dashboard', () => {
    expect(resolvePostLoginRoute({ id: 'u1', role: 'admin' })).toBe('/admin');
  });

  it('sends an unverified user to the verification screen with their email', () => {
    expect(resolvePostLoginRoute({ email: 'x@y.com', email_verified: false })).toBe(
      '/register?verify=1&email=x%40y.com'
    );
    expect(resolvePostLoginRoute({ email: 'x@y.com', is_verified: false })).toContain('verify=1');
  });

  it('an unverified admin still verifies first', () => {
    expect(resolvePostLoginRoute({ email: 'a@d.min', role: 'admin', email_verified: false })).toContain('/register?verify=1');
  });

  it('defaults to the dashboard when the login response has no user object', () => {
    expect(resolvePostLoginRoute(undefined)).toBe('/dashboard');
    expect(resolvePostLoginRoute(null)).toBe('/dashboard');
  });
});

describe('isUnverifiedUser', () => {
  it('only explicit false flags count — absent flags mean verified', () => {
    expect(isUnverifiedUser({ email_verified: false })).toBe(true);
    expect(isUnverifiedUser({ verified: false })).toBe(true);
    expect(isUnverifiedUser({ email_verified: true })).toBe(false);
    expect(isUnverifiedUser({})).toBe(false);
    expect(isUnverifiedUser(null)).toBe(false);
  });
});

describe('isUnverifiedLoginError', () => {
  it('recognizes verification-related login failures', () => {
    expect(isUnverifiedLoginError(new Error('Email not verified'))).toBe(true);
    expect(isUnverifiedLoginError({ message: 'Please verify your email first' })).toBe(true);
    expect(isUnverifiedLoginError({ response: { data: { detail: 'Account not confirmed' } } })).toBe(true);
  });

  it('does not misclassify ordinary credential errors', () => {
    expect(isUnverifiedLoginError(new Error('Invalid email or password'))).toBe(false);
    expect(isUnverifiedLoginError(undefined)).toBe(false);
  });
});

describe('verifyEmailRoute', () => {
  it('encodes the email and works without one', () => {
    expect(verifyEmailRoute('a+b@c.com')).toBe('/register?verify=1&email=a%2Bb%40c.com');
    expect(verifyEmailRoute()).toBe('/register?verify=1');
  });
});
