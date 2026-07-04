// Deno backend function: fetch a PUBLIC listing page and extract safe fields
// for the Add Property flow. Security posture:
//   • auth required — anonymous callers get 401
//   • the URL is re-validated server-side against the platform allowlist
//     (Airbnb/Gathern/Booking patterns); nothing else is ever fetched (SSRF)
//   • after redirects, the final host must still match the allowlist
//   • plain GET of the public HTML only — no login, no captcha bypass, no
//     private endpoints; if the platform doesn't answer, we fail politely
//   • expected failures are HTTP 200 with { ok:false, reason, error:{en,ar} }
//     so the client never has to interpret raw transport errors
import { createClientFromRequest } from "npm:@base44/sdk";
import { parseListingUrl, extractListingData, canonicalListingUrl } from "./listingImport.js";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 2_000_000; // 2 MB of HTML is more than any listing shell

const FRIENDLY = {
  fetch_failed: {
    en: "We could not reach this listing right now — you can continue manually.",
    ar: "تعذّر الوصول إلى هذا الإعلان حاليًا — يمكنك المتابعة يدويًا.",
  },
  parse_failed: {
    en: "We could not read this listing automatically — you can continue manually.",
    ar: "تعذّرت قراءة هذا الإعلان تلقائيًا — يمكنك المتابعة يدويًا.",
  },
};

const fail = (reason: string, extra: Record<string, unknown> = {}) =>
  Response.json({ ok: false, reason, error: FRIENDLY[reason as keyof typeof FRIENDLY] ?? FRIENDLY.parse_failed, ...extra });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const parsed = parseListingUrl(String(body.url || ""));
    if (!parsed.valid) {
      return Response.json({ ok: false, reason: "invalid_url", error: parsed.error });
    }
    const { platform, url, extraction } = parsed;

    // Gathern / Booking.com: URL patterns are recognized so the client can
    // prefill platform + link, but no extractor exists yet.
    if (!extraction) {
      return fail("platform_not_supported", { platform, url });
    }

    let html = "";
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          "Accept-Language": "ar,en;q=0.8",
        },
      });
      clearTimeout(timer);
      // Redirect landed off-platform → refuse to read it (SSRF guard).
      if (res.url && !parseListingUrl(res.url).valid) {
        await res.body?.cancel();
        return fail("fetch_failed", { platform, url });
      }
      if (!res.ok) {
        await res.body?.cancel();
        return fail("fetch_failed", { platform, url });
      }
      html = (await res.text()).slice(0, MAX_BODY_BYTES);
    } catch (err) {
      console.error("import-listing fetch failed", url, err?.message || err);
      return fail("fetch_failed", { platform, url });
    }

    const data = extractListingData(html, platform);
    if (!data) return fail("parse_failed", { platform, url });

    return Response.json({
      ok: true,
      platform,
      url: canonicalListingUrl(url),
      data,
    });
  } catch (err) {
    console.error("import-listing error", err);
    // Even unexpected errors come back friendly — never a raw 405/500 body.
    return fail("parse_failed");
  }
});
