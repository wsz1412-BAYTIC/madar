// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

const base44Mock = vi.hoisted(() => ({ functions: { invoke: vi.fn() } }));
vi.mock('@/api/base44Client', () => ({ base44: base44Mock }));

let langState;
vi.mock('@/contexts/LanguageContext', () => ({ useLang: () => langState }));

const toastMock = vi.hoisted(() => vi.fn());
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: toastMock }) }));

import TelegramLinkCard from '@/components/settings/TelegramLinkCard';

// Route invoke by action so a test can script each backend call.
function routeInvoke(map) {
  base44Mock.functions.invoke.mockImplementation((fn, body) => {
    const handler = map[body?.action];
    if (typeof handler === 'function') return handler(body);
    return Promise.resolve(handler ?? { data: {} });
  });
}

const statusNone = { data: { link: { status: 'none', linked: false } } };
const statusLinked = { data: { link: { status: 'linked', linked: true, linked_at: '2026-07-11T12:00:00Z' } } };
const createOk = { data: { deep_link: 'https://t.me/MadarBot?start=abc123', expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() } };

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'ar', isRTL: true };
});
afterEach(() => cleanup());

describe('TelegramLinkCard', () => {
  it('explains that secure linking differs from the optional username field', async () => {
    routeInvoke({ status: statusNone });
    render(<TelegramLinkCard />);
    await screen.findByText('ربط تيليجرام');
    expect(screen.getByText(/مختلف عن حقل/)).toBeTruthy();
  });

  it('none → create link → pending with a SAFE open-Telegram link', async () => {
    routeInvoke({ status: statusNone, create_link: () => Promise.resolve(createOk) });
    render(<TelegramLinkCard />);

    const linkBtn = await screen.findByText('ربط تيليجرام');
    fireEvent.click(linkBtn);

    const openLink = await screen.findByText('افتح تيليجرام');
    const anchor = openLink.closest('a');
    expect(anchor.getAttribute('href')).toBe('https://t.me/MadarBot?start=abc123');
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
    // 15-minute expiry note + countdown present.
    expect(screen.getByText(/صالح لمدة 15 دقيقة/)).toBeTruthy();
    expect(screen.getByText(/ينتهي الرابط خلال/)).toBeTruthy();
    expect(base44Mock.functions.invoke).toHaveBeenCalledWith('telegram-linking', { action: 'create_link' });
  });

  it('does NOT render a link when the backend returns an unsafe URL', async () => {
    routeInvoke({ status: statusNone, create_link: () => Promise.resolve({ data: { deep_link: 'javascript:alert(1)' } }) }); // eslint-disable-line no-script-url
    render(<TelegramLinkCard />);
    fireEvent.click(await screen.findByText('ربط تيليجرام'));
    await waitFor(() => expect(screen.queryByText('افتح تيليجرام')).toBeNull());
  });

  it('does not fire duplicate create calls while busy', async () => {
    let resolveCreate;
    routeInvoke({ status: statusNone, create_link: () => new Promise((r) => { resolveCreate = r; }) });
    render(<TelegramLinkCard />);
    const linkBtn = await screen.findByText('ربط تيليجرام');
    fireEvent.click(linkBtn);
    fireEvent.click(linkBtn); // second click while the first is in flight
    resolveCreate(createOk);
    await screen.findByText('افتح تيليجرام');
    const createCalls = base44Mock.functions.invoke.mock.calls.filter((c) => c[1]?.action === 'create_link');
    expect(createCalls.length).toBe(1);
  });

  it('refreshes status once when the user returns to the tab while pending', async () => {
    routeInvoke({ status: statusNone, create_link: () => Promise.resolve(createOk) });
    render(<TelegramLinkCard />);
    fireEvent.click(await screen.findByText('ربط تيليجرام'));
    await screen.findByText('افتح تيليجرام');
    const before = base44Mock.functions.invoke.mock.calls.filter((c) => c[1]?.action === 'status').length;
    fireEvent(window, new Event('focus'));
    await waitFor(() => {
      const after = base44Mock.functions.invoke.mock.calls.filter((c) => c[1]?.action === 'status').length;
      expect(after).toBe(before + 1);
    });
  });

  it('shows متصل + linked date and NEVER renders sensitive fields', async () => {
    // Even if the backend leaked identifiers, the card must not render them.
    routeInvoke({
      status: { data: { link: { status: 'linked', linked: true, linked_at: '2026-07-11T12:00:00Z', chat_id: '555444333', telegram_user_id: '999888777', link_token_hash: 'deadbeefcafe' } } },
    });
    const { container } = render(<TelegramLinkCard />);
    await screen.findByText('متصل');
    expect(screen.getByText(/تاريخ الربط/)).toBeTruthy();
    expect(container.textContent).not.toContain('555444333');
    expect(container.textContent).not.toContain('999888777');
    expect(container.textContent).not.toContain('deadbeefcafe');
  });

  it('unlink requires confirmation then succeeds', async () => {
    routeInvoke({ status: statusLinked, unlink: () => Promise.resolve({ data: { link: { status: 'none', linked: false } } }) });
    render(<TelegramLinkCard />);

    fireEvent.click(await screen.findByText('إلغاء الربط')); // opens the confirm dialog
    const dialogTitle = await screen.findByText('إلغاء ربط تيليجرام؟');
    expect(dialogTitle).toBeTruthy();
    // No unlink call is made until confirmed.
    expect(base44Mock.functions.invoke.mock.calls.some((c) => c[1]?.action === 'unlink')).toBe(false);

    // Confirm via the dialog's action button.
    const confirmBtns = screen.getAllByText('إلغاء الربط');
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() => expect(base44Mock.functions.invoke).toHaveBeenCalledWith('telegram-linking', { action: 'unlink' }));
    await screen.findByText('ربط تيليجرام'); // returned to the unlinked state
  });

  it('renders the unavailable state on a 503', async () => {
    routeInvoke({ status: () => Promise.reject({ response: { status: 503, data: { reason: 'integration_unavailable' } } }) });
    render(<TelegramLinkCard />);
    expect(await screen.findByText(/غير متاح حاليًا/)).toBeTruthy();
  });

  it('renders a generic error (no raw backend detail) on failure', async () => {
    routeInvoke({ status: () => Promise.reject(new Error('secret backend detail')) });
    const { container } = render(<TelegramLinkCard />);
    expect(await screen.findByText('تعذّر تحميل حالة الربط.')).toBeTruthy();
    expect(container.textContent).not.toContain('secret backend detail');
  });
});
