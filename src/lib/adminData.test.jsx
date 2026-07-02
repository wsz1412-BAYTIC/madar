// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

const entitiesMock = vi.hoisted(() => ({
  User: { list: vi.fn() },
  UserSubscription: { list: vi.fn() },
  UserProperty: { list: vi.fn() },
  PriceRecommendation: { list: vi.fn() },
}));
vi.mock('@/api/base44Client', () => ({ base44: { entities: entitiesMock } }));
vi.mock('@/contexts/LanguageContext', () => ({ useLang: () => ({ t: (k) => k, lang: 'en' }) }));
// framer-motion wrappers need layout APIs jsdom lacks — stub to passthroughs.
vi.mock('@/components/madar/Motion', () => ({
  FadeIn: ({ children }) => <div>{children}</div>,
  StaggerContainer: ({ children }) => <div>{children}</div>,
  StaggerItem: ({ children }) => <div>{children}</div>,
}));

import Admin from '@/pages/Admin';

beforeEach(() => {
  vi.clearAllMocks();
  entitiesMock.PriceRecommendation.list.mockResolvedValue([]);
});
afterEach(() => cleanup());

describe('Admin page renders REAL data (not mock)', () => {
  it('joins users + subscriptions + property counts into a real customers table', async () => {
    entitiesMock.User.list.mockResolvedValue([
      { id: 'u1', full_name: 'Real Customer', email: 'real@x.com', role: 'user' },
    ]);
    entitiesMock.UserSubscription.list.mockResolvedValue([
      { userId: 'u1', planName: 'professional', status: 'active', price: 349 },
    ]);
    entitiesMock.UserProperty.list.mockResolvedValue([
      { userId: 'u1' }, { userId: 'u1' }, { userId: 'other' },
    ]);
    entitiesMock.PriceRecommendation.list.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }, { id: 'r5' }]);

    render(<Admin />);

    expect(await screen.findByText('Real Customer')).toBeTruthy();
    expect(screen.getByText('real@x.com')).toBeTruthy();
    expect(screen.getByText('professional')).toBeTruthy();
    // property count for u1 is 2 (the "other"-owned property is excluded);
    // unique on the page (stat tiles are 1/3/1/5).
    expect(screen.getByText('2')).toBeTruthy();
    // no leftover mock names from the old page
    expect(screen.queryByText('Ahmed Al-Salem')).toBeNull();
  });

  it('does not fabricate infra metrics (no fake latency/uptime tiles)', async () => {
    entitiesMock.User.list.mockResolvedValue([]);
    entitiesMock.UserSubscription.list.mockResolvedValue([]);
    entitiesMock.UserProperty.list.mockResolvedValue([]);
    render(<Admin />);
    await waitFor(() => expect(entitiesMock.User.list).toHaveBeenCalled());
    expect(screen.queryByText('42ms')).toBeNull();
    expect(screen.queryByText('99.97%')).toBeNull();
  });

  it('shows an empty state when there are no customers', async () => {
    entitiesMock.User.list.mockResolvedValue([]);
    entitiesMock.UserSubscription.list.mockResolvedValue([]);
    entitiesMock.UserProperty.list.mockResolvedValue([]);
    render(<Admin />);
    expect(await screen.findByText(/No customers yet/i)).toBeTruthy();
  });

  it('shows an error state when a query fails', async () => {
    entitiesMock.User.list.mockRejectedValue(new Error('boom'));
    entitiesMock.UserSubscription.list.mockResolvedValue([]);
    entitiesMock.UserProperty.list.mockResolvedValue([]);
    render(<Admin />);
    expect(await screen.findByText(/Failed to load admin data/i)).toBeTruthy();
  });
});
