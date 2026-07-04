// Client-side wrapper around the import-listing backend function.
// Validates the link locally first (instant feedback, no round-trip for junk
// input), then asks the server to fetch the public listing page and extract
// safe fields. EVERY outcome is a friendly bilingual object — raw transport
// errors (405s, timeouts, stack traces) never reach the UI.

import { base44 } from '@/api/base44Client';
import {
  parseListingUrl,
  mapImportToForm,
  IMPORT_FAILED,
  IMPORT_PLATFORM_PENDING,
} from '@/lib/listingImport';

/**
 * Scan a pasted listing URL.
 * Resolves to one of (never rejects):
 *   { ok: true,  platform, url, form }                    — extracted + mapped
 *   { ok: false, platform, url, form, message: {en,ar} }  — recognized link,
 *       extraction unavailable/failed; form still prefills platform + link
 *   { ok: false, error: {en,ar} }                         — not a usable link
 */
export async function scanListing(input) {
  const parsed = parseListingUrl(input);
  if (!parsed.valid) return { ok: false, error: parsed.error };
  const { platform, url } = parsed;
  const fallbackForm = mapImportToForm(null, platform, url);

  try {
    const res = await base44.functions.invoke('import-listing', { url });
    const data = res?.data;
    if (data?.ok && data.data) {
      return { ok: true, platform, url, form: mapImportToForm(data.data, platform, url) };
    }
    const message =
      data?.reason === 'platform_not_supported'
        ? IMPORT_PLATFORM_PENDING
        : data?.error?.en && data?.error?.ar
          ? data.error
          : IMPORT_FAILED;
    return { ok: false, platform, url, form: fallbackForm, message };
  } catch {
    // Function unreachable/not deployed — same graceful manual fallback.
    return { ok: false, platform, url, form: fallbackForm, message: IMPORT_FAILED };
  }
}
