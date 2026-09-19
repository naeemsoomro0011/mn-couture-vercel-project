/**
 * Everything link-related is driven by whatever the admin saves in
 * Dashboard → Basic Info. The admin can paste a link in any shape
 * ("facebook.com/x", "@handle", a full https URL, a phone number with or
 * without the country code) and these helpers turn it into something a
 * browser can actually open.
 */

/** Adds https:// when the admin pasted a bare domain, leaves real URLs alone. */
export const normalizeUrl = (url) => {
  const value = (url || '').trim();
  if (!value) return '';
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return `https://${value.replace(/^\/+/, '')}`;
};

/** Accepts a full profile URL OR a bare @handle / username. */
export const socialUrl = (value, baseForHandle) => {
  const raw = (value || '').trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || raw.includes('.')) return normalizeUrl(raw);
  return `${baseForHandle}${raw.replace(/^@/, '')}`;
};

/**
 * Pakistani numbers are usually saved as 03159833357 — wa.me needs 923159833357.
 * Any already-international number is left untouched.
 */
export const toInternationalNumber = (number, countryCode = '92') => {
  const digits = (number || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith(countryCode) && digits.length > 10) return digits;
  if (digits.startsWith('0')) return `${countryCode}${digits.slice(1)}`;
  if (digits.length === 10) return `${countryCode}${digits}`;
  return digits;
};

export const whatsappUrl = (number, text) => {
  const intl = toInternationalNumber(number);
  if (!intl) return '';
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export const telUrl = (number) => (number ? `tel:${number.replace(/\s/g, '')}` : '');
export const mailUrl = (email) => (email ? `mailto:${email.trim()}` : '');

/** The four social buttons, built from the live shop info document. */
export const buildSocialLinks = (info = {}) => [
  { key: 'facebook', label: 'Facebook', url: socialUrl(info.facebook, 'https://www.facebook.com/') },
  { key: 'instagram', label: 'Instagram', url: socialUrl(info.instagram, 'https://www.instagram.com/') },
  { key: 'tiktok', label: 'TikTok', url: socialUrl(info.tiktok, 'https://www.tiktok.com/@') },
  { key: 'whatsapp', label: 'WhatsApp', url: whatsappUrl(info.whatsapp) },
];

const DEFAULT_PLACE = 'Sukkur, Sindh, Pakistan';

/** The place text used for the map when no embed link was pasted. */
export const mapQuery = (info = {}) =>
  (info.address || '').trim() || (info.shopName ? `${info.shopName}, ${DEFAULT_PLACE}` : DEFAULT_PLACE);

/**
 * Builds a src the <iframe> can actually render. The admin may paste:
 *  - the whole <iframe ...> snippet from Google Maps → we pull the src out
 *  - a .../maps/embed?... URL → used as-is
 *  - a normal maps link with coordinates in it → embedded by those coords
 *  - a short "share" link (maps.app.goo.gl/…) → these can't be embedded
 *    directly, but the backend resolves them to lat/lng the moment the
 *    admin saves (see resolveMapLink on the server), so info.mapLat /
 *    info.mapLng carry the real pin here
 *  - nothing usable at all → falls back to the saved address, which always
 *    renders something reasonable
 */
export const mapEmbedSrc = (info = {}) => {
  const raw = (info.mapLink || '').trim();

  if (raw) {
    const fromIframe = raw.match(/src\s*=\s*["']([^"']+)["']/i);
    const candidate = (fromIframe ? fromIframe[1] : raw).trim();

    if (/\/maps\/embed/i.test(candidate) || /output=embed/i.test(candidate)) return candidate;

    // A plain maps URL with coordinates in it can still be embedded by query.
    const coords = candidate.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coords) return `https://maps.google.com/maps?q=${coords[1]},${coords[2]}&z=16&output=embed`;
  }

  // Server-resolved pin from a short/share link — the exact spot the admin
  // meant, not just a text search for the address.
  if (info.mapLat != null && info.mapLng != null) {
    return `https://maps.google.com/maps?q=${info.mapLat},${info.mapLng}&z=16&output=embed`;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery(info))}&z=15&output=embed`;
};

/** What the "Open in Google Maps" button uses — the admin's link wins. */
export const mapOpenUrl = (info = {}) => {
  const raw = (info.mapLink || '').trim();
  if (raw && !/<iframe/i.test(raw) && !/\/maps\/embed/i.test(raw)) return normalizeUrl(raw);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(info))}`;
};
