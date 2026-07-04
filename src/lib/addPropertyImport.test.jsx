// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// Behavioral coverage for the Add-Property URL import flow: scan success
// autofill, friendly failure fallback (no raw "Method Not Allowed"),
// duplicate-link blocking, multi-platform links, and RTL.

const base44Mock = vi.hoisted(() => ({
  functions: { invoke: vi.fn() },
  entities: { UserProperty: { create: vi.fn() } },
}));
vi.mock('@/api/base44Client', () => ({ base44: base44Mock }));
vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn(), useToast: () => ({ toast: vi.fn() }) }));

let langState;
vi.mock('@/contexts/LanguageContext', () => ({
  useLang: () => langState,
}));

let authState;
vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => authState,
}));

import AddPropertyWizard from '@/components/madar/AddPropertyWizard';
import { IMPORT_SUCCESS, IMPORT_FAILED, DUPLICATE_LINK } from '@/lib/listingImport';

const AIRBNB_URL = 'https://ar.airbnb.com/rooms/1573422907379';
const SCAN_OK = {
  data: {
    ok: true,
    platform: 'Airbnb',
    url: AIRBNB_URL,
    data: {
      platform: 'Airbnb',
      title: 'Olaya Luxury Villa',
      city: 'Riyadh',
      district: null,
      type: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      guests: 8,
      nightlyPrice: null,
      images: ['https://a0.muscache.com/im/x.jpg'],
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'en', isRTL: false, t: (k) => k };
  authState = { user: { id: 'u1' } };
});
afterEach(() => cleanup());

function renderWizard(props = {}) {
  return render(<AddPropertyWizard open onClose={() => {}} onCreated={() => {}} {...props} />);
}

const urlInput = () => screen.getByLabelText('Property URL');
const scanButton = () => screen.getByRole('button', { name: 'Scan' });

async function scan(url) {
  fireEvent.change(urlInput(), { target: { value: url } });
  fireEvent.click(scanButton());
}

describe('Airbnb preview → success autofill', () => {
  it('fills the wizard fields from the backend extraction and keeps them editable', async () => {
    base44Mock.functions.invoke.mockResolvedValueOnce(SCAN_OK);
    renderWizard();

    // The URL box is the FIRST field on the first step.
    expect(urlInput()).toBeTruthy();
    await scan(AIRBNB_URL);

    expect(await screen.findByText(IMPORT_SUCCESS.en)).toBeTruthy();
    expect(base44Mock.functions.invoke).toHaveBeenCalledWith('import-listing', { url: AIRBNB_URL });

    // Auto-filled…
    const nameInput = screen.getByLabelText('Property name *');
    expect(nameInput.value).toBe('Olaya Luxury Villa');
    expect(screen.getByRole('button', { name: 'Riyadh' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Airbnb' }).getAttribute('aria-pressed')).toBe('true');
    // …but still editable.
    fireEvent.change(nameInput, { target: { value: 'My Villa' } });
    expect(nameInput.value).toBe('My Villa');
  });
});

describe('failure → friendly manual fallback', () => {
  it('shows the bilingual fallback and NEVER the raw transport error', async () => {
    base44Mock.functions.invoke.mockRejectedValueOnce(new Error('Method Not Allowed'));
    renderWizard();
    await scan(AIRBNB_URL);

    expect(await screen.findByText(IMPORT_FAILED.en)).toBeTruthy();
    expect(screen.queryByText(/Method Not Allowed/i)).toBeNull();
    expect(screen.queryByText(/405/)).toBeNull();

    // Platform + link were still prefilled, and manual entry stays open.
    expect(screen.getByRole('button', { name: 'Airbnb' }).getAttribute('aria-pressed')).toBe('true');
    const nameInput = screen.getByLabelText('Property name *');
    fireEvent.change(nameInput, { target: { value: 'Manual Villa' } });
    expect(nameInput.value).toBe('Manual Villa');
  });

  it('rejects junk input locally with a bilingual message (no backend call)', async () => {
    renderWizard();
    await scan('not a url');
    expect(await screen.findByText(/does not look like a valid link/)).toBeTruthy();
    expect(base44Mock.functions.invoke).not.toHaveBeenCalled();
  });
});

describe('duplicate links are blocked', () => {
  it('scanning the same URL twice shows the exact required message', async () => {
    base44Mock.functions.invoke.mockResolvedValue(SCAN_OK);
    renderWizard();
    await scan(AIRBNB_URL);
    await screen.findByText(IMPORT_SUCCESS.en);

    await scan(AIRBNB_URL); // same link again
    expect(await screen.findByText(DUPLICATE_LINK.en)).toBeTruthy();
    expect(base44Mock.functions.invoke).toHaveBeenCalledTimes(1); // blocked locally
  });
});

describe('multi-platform links per property', () => {
  async function completeRequiredSteps() {
    base44Mock.functions.invoke.mockResolvedValueOnce(SCAN_OK);
    renderWizard();
    await scan(AIRBNB_URL);
    await screen.findByText(IMPORT_SUCCESS.en);
    // District is never extractable — fill it, then move through the steps.
    fireEvent.change(screen.getByLabelText('District *'), { target: { value: 'Al Olaya' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.change(screen.getByLabelText('Nightly price (SAR) *'), { target: { value: '450' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  }

  it('accepts Airbnb + Gathern + Booking.com, blocks duplicates, saves all links', async () => {
    await completeRequiredSteps();

    const linkInput = screen.getByLabelText('Add a platform link');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(linkInput, { target: { value: 'https://gathern.co/unit/55' } });
    fireEvent.click(addButton);
    fireEvent.change(linkInput, { target: { value: 'https://www.booking.com/hotel/sa/olaya-suites.html' } });
    fireEvent.click(addButton);

    // A second Gathern link for the same property is a duplicate.
    fireEvent.change(linkInput, { target: { value: 'https://gathern.co/unit/99' } });
    fireEvent.click(addButton);
    expect(await screen.findByText(DUPLICATE_LINK.en)).toBeTruthy();

    base44Mock.entities.UserProperty.create.mockResolvedValueOnce({ id: 'p1' });
    fireEvent.click(screen.getByRole('button', { name: 'Add property' }));

    await waitFor(() => expect(base44Mock.entities.UserProperty.create).toHaveBeenCalledTimes(1));
    const payload = base44Mock.entities.UserProperty.create.mock.calls[0][0];
    expect(payload.userId).toBe('u1');
    expect(payload.links.map((l) => l.platform)).toEqual(['Airbnb', 'Gathern', 'Booking.com']);
    expect(payload.platformUrl).toBe('https://ar.airbnb.com/rooms/1573422907379');
    expect(payload.city).toBe('Riyadh');
    expect(payload.type).toBe('villa');
  });

  it('a removed link can be re-added (dedupe is against the live list)', async () => {
    await completeRequiredSteps();
    const linkInput = screen.getByLabelText('Add a platform link');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(linkInput, { target: { value: 'https://gathern.co/unit/55' } });
    fireEvent.click(addButton);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Gathern link' }));

    fireEvent.change(linkInput, { target: { value: 'https://gathern.co/unit/55' } });
    fireEvent.click(addButton);
    expect(screen.queryByText(DUPLICATE_LINK.en)).toBeNull();
  });
});

describe('RTL / Arabic', () => {
  it('shows Arabic labels with an LTR url box and Arabic duplicate copy', async () => {
    langState = { lang: 'ar', isRTL: true, t: (k) => k };
    base44Mock.functions.invoke.mockResolvedValue(SCAN_OK);
    renderWizard();

    const input = screen.getByLabelText('رابط الإعلان');
    expect(input.getAttribute('dir')).toBe('ltr'); // URLs always read LTR
    fireEvent.change(input, { target: { value: AIRBNB_URL } });
    fireEvent.click(screen.getByRole('button', { name: 'معاينة' }));
    expect(await screen.findByText(IMPORT_SUCCESS.ar)).toBeTruthy();

    fireEvent.change(input, { target: { value: AIRBNB_URL } });
    fireEvent.click(screen.getByRole('button', { name: 'معاينة' }));
    expect(await screen.findByText(DUPLICATE_LINK.ar)).toBeTruthy();
  });
});
