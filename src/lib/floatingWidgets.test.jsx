// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Floating support/assistant UX + the market-data alert replacement.

let langState;
vi.mock('@/contexts/LanguageContext', () => ({
  useLang: () => langState,
}));
let themeState;
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => themeState,
}));
let authState;
vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => authState,
}));
let subState;
vi.mock('@/contexts/SubscriptionContext', () => ({
  useSubscription: () => subState,
}));
const base44Mock = vi.hoisted(() => ({ functions: { invoke: vi.fn() } }));
vi.mock('@/api/base44Client', () => ({ base44: base44Mock }));

// jsdom has no scrollIntoView (chat widgets auto-scroll to the last message).
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

import CommunicationWidgets from '@/components/widgets/CommunicationWidgets';
import WhatsAppWidget, { resolveWhatsAppPhone } from '@/components/widgets/WhatsAppWidget';
import TransientAlert from '@/components/madar/TransientAlert';

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'en', isRTL: false, t: (k) => k };
  themeState = { theme: 'dark', toggleTheme: vi.fn() };
  authState = { isAuthenticated: false, authChecked: true, user: null };
  subState = { subscription: null };
});
afterEach(() => cleanup());

const renderAt = (path, ui) =>
  render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

describe('widget stack chooses the right assistant', () => {
  it('guests on the homepage get the PUBLIC guide (no backend assistant)', () => {
    renderAt('/', <CommunicationWidgets />);
    expect(screen.getByRole('button', { name: 'Madar assistant' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'AI assistant' })).toBeNull();
  });

  it('signed-in users on internal pages get the private Smart Coach', () => {
    authState = { isAuthenticated: true, authChecked: true, user: { id: 'u1' } };
    renderAt('/dashboard', <CommunicationWidgets />);
    expect(screen.getByRole('button', { name: 'AI assistant' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Madar assistant' })).toBeNull();
  });

  it('renders nothing until the session check settles, and never on auth/payment pages', () => {
    authState = { isAuthenticated: false, authChecked: false, user: null };
    const { unmount } = renderAt('/', <CommunicationWidgets />);
    expect(screen.queryByRole('button')).toBeNull();
    unmount();
    authState = { isAuthenticated: true, authChecked: true, user: { id: 'u1' } };
    for (const path of ['/billing', '/login', '/signup']) {
      const r = renderAt(path, <CommunicationWidgets />);
      expect(screen.queryByRole('button')).toBeNull();
      r.unmount();
    }
  });
});

describe('guest assistant stays inside public scope', () => {
  it('answers a general pricing question instantly with links, no network call', () => {
    renderAt('/', <CommunicationWidgets />);
    fireEvent.click(screen.getByRole('button', { name: 'Madar assistant' }));
    fireEvent.change(screen.getByLabelText('Type your question'), { target: { value: 'How much does it cost?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText(/free plan to start/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /view pricing/i })).toBeTruthy();
    expect(base44Mock.functions.invoke).not.toHaveBeenCalled();
  });

  it('refuses a private-data question and guides to signup/support', () => {
    renderAt('/', <CommunicationWidgets />);
    fireEvent.click(screen.getByRole('button', { name: 'Madar assistant' }));
    fireEvent.change(screen.getByLabelText('Type your question'), { target: { value: 'Show me my property revenue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText(/can't see or discuss any account/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /create a free account/i }).getAttribute('href')).toBe('/signup');
    // Note: the WhatsApp button also matches /contact support/, so target the chat link by href.
    const supportLinks = screen.getAllByRole('link', { name: /contact support/i });
    expect(supportLinks.some((l) => l.getAttribute('href') === '/contact')).toBe(true);
    expect(base44Mock.functions.invoke).not.toHaveBeenCalled();
  });
});

describe('signed-in assistant uses only the private server scope', () => {
  it('every question goes through the quota-enforced ai-assistant function', async () => {
    authState = { isAuthenticated: true, authChecked: true, user: { id: 'u1' } };
    base44Mock.functions.invoke.mockResolvedValueOnce({ data: { answer: 'Your answer', remaining: 4 } });
    renderAt('/dashboard', <CommunicationWidgets />);
    fireEvent.click(screen.getByRole('button', { name: 'AI assistant' }));
    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), { target: { value: 'How is my occupancy?' } });
    fireEvent.keyPress(screen.getByPlaceholderText('Ask a question...'), { key: 'Enter', charCode: 13 });
    expect(await screen.findByText(/Your answer/)).toBeTruthy();
    expect(base44Mock.functions.invoke).toHaveBeenCalledWith('ai-assistant', { question: 'How is my occupancy?', lang: 'en' });
  });
});

describe('WhatsApp support button', () => {
  it('renders a wa.me link with the encoded AR/EN support message', () => {
    renderAt('/', <WhatsAppWidget phone="966500000000" />);
    const link = screen.getByRole('link', { name: /contact support on whatsapp/i });
    expect(link.getAttribute('href')).toContain('https://wa.me/966500000000?text=');
    expect(decodeURIComponent(link.getAttribute('href'))).toContain('Hello Madar Support');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('uses the Arabic message in Arabic mode', () => {
    langState = { lang: 'ar', isRTL: true, t: (k) => k };
    renderAt('/', <WhatsAppWidget phone="966500000000" />);
    const link = screen.getByRole('link', { name: 'تواصل مع الدعم عبر واتساب' });
    expect(decodeURIComponent(link.getAttribute('href'))).toContain('مرحبًا فريق دعم مدار');
  });

  it('hides entirely when the phone number is missing or disabled', () => {
    renderAt('/', <WhatsAppWidget phone="" />);
    expect(screen.queryByRole('link')).toBeNull();
    cleanup();
    renderAt('/', <WhatsAppWidget phone="off" />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('resolveWhatsAppPhone sanitizes formatting and rejects junk', () => {
    expect(resolveWhatsAppPhone('+966 53 810-0119')).toBe('966538100119');
    expect(resolveWhatsAppPhone(undefined)).toBe('966538100119'); // official default
    expect(resolveWhatsAppPhone('')).toBeNull();
    expect(resolveWhatsAppPhone('off')).toBeNull();
    expect(resolveWhatsAppPhone('123')).toBeNull();
  });
});

describe('TransientAlert (replaces the blocking red market-data alert)', () => {
  it('renders as a fixed floating notice with the bilingual message and a close button', () => {
    const onClose = vi.fn();
    render(<TransientAlert message={{ en: 'Some data could not be refreshed', ar: 'تعذر تحديث بعض البيانات' }} onClose={onClose} />);
    const note = screen.getByRole('status');
    expect(note.className).toContain('fixed'); // floats — never displaces content
    expect(screen.getByText('Some data could not be refreshed')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /dismiss alert/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the configured delay', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<TransientAlert message="Heads up" autoDismissMs={8000} onClose={onClose} />);
    act(() => { vi.advanceTimersByTime(7999); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('shows the Arabic message in Arabic mode', () => {
    langState = { lang: 'ar', isRTL: true, t: (k) => k };
    render(<TransientAlert message={{ en: 'x', ar: 'تعذر تحديث بعض البيانات' }} onClose={() => {}} />);
    expect(screen.getByText('تعذر تحديث بعض البيانات')).toBeTruthy();
  });
});
