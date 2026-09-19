/**
 * Google Maps "share" links (the short maps.app.goo.gl/xxxx link the Maps
 * app gives you when you tap Share, or a goo.gl redirect) can't be turned
 * into an embeddable map on their own — the real coordinates only show up
 * once the link is followed to wherever it actually redirects to. A browser
 * can't do that itself (a cross-origin redirect like this is opaque to
 * client-side JS), so we resolve it here on the server, once, when the
 * admin saves it — not on every visitor's page load.
 *
 * Whatever goes wrong (no internet on the server, Google changed their URL
 * shape, the pasted text isn't a Maps link at all) this simply resolves to
 * null. The caller already falls back to the shop's text address in that
 * case, so a bad or unreachable link can never break a save.
 */

const COORD_PATTERNS = [
  /@(-?\d+\.\d+),(-?\d+\.\d+)/, // .../place/Name/@27.7052,68.8574,17z/...
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Google's internal data=...!3d..!4d.. param
  /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ...?q=27.7052,68.8574
];

const extractCoords = (url) => {
  for (const pattern of COORD_PATTERNS) {
    const match = url.match(pattern);
    if (match) return { lat: Number(match[1]), lng: Number(match[2]) };
  }
  return null;
};

const GOOGLE_MAPS_HOST = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl|www\.google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)/i;

const resolveMapLink = async (url) => {
  const value = (url || '').trim();
  if (!value || typeof fetch !== 'function') return null;

  // Coordinates already sitting in the pasted text — no network needed.
  const direct = extractCoords(value);
  if (direct) return direct;

  // Only ever follow links that actually belong to Google Maps.
  if (!GOOGLE_MAPS_HOST.test(value)) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(value, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MNCoutureBot/1.0)' },
    });
    clearTimeout(timeout);
    return extractCoords(res.url || '');
  } catch {
    return null;
  }
};

module.exports = resolveMapLink;
