// Helpers for Google Maps links (share links like maps.app.goo.gl/…, full google.com/maps/place/… links,
// and ?q= / ?query= search links). Pulls out the place name and its exact coordinates when the link has them.
// Files starting with "_" in /api are helpers, not Vercel endpoints.

const isGmaps = u => /(^|\/\/|\.)(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(String(u || ''));

// Rough box around the five boroughs (a little generous), used to sanity-check coordinates.
const inNyc = (lat, lng) => lat > 40.45 && lat < 40.95 && lng > -74.3 && lng < -73.65;

const num = s => { const n = parseFloat(s); return Number.isFinite(n) ? n : null; };
const pair = (a, b) => { const lat = num(a), lng = num(b); return lat != null && lng != null ? { lat, lng } : null; };
const clean = s => { try { s = decodeURIComponent(String(s).replace(/\+/g, ' ')); } catch (e) { s = String(s).replace(/\+/g, ' '); } return s.replace(/\s+/g, ' ').trim(); };

// Parse what we can straight from the URL.
function parseUrl(url) {
  const out = { name: '', query: '', ll: null, exact: false };
  const u = String(url || '');
  const place = u.match(/\/maps\/place\/([^/@?#]+)/i);
  if (place) out.name = clean(place[1]);
  // !3d<lat>!4d<lng> is the place's own pin (most exact); use the last one in the link.
  const pins = [...u.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g)];
  if (pins.length) { const m = pins[pins.length - 1]; out.ll = pair(m[1], m[2]); out.exact = true; }
  let q = '';
  try { const p = new URL(u).searchParams; q = p.get('q') || p.get('query') || p.get('destination') || ''; } catch (e) {}
  if (q) {
    const c = q.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
    if (c) { if (!out.ll) { out.ll = pair(c[1], c[2]); out.exact = true; } }
    else out.query = clean(q);
  }
  // @lat,lng is where the map was centered; for a place link that's the place, otherwise only a hint.
  if (!out.ll) { const at = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/); if (at) { out.ll = pair(at[1], at[2]); out.exact = !!out.name; } }
  if (out.name && /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(out.name)) out.name = '';
  return out;
}

// Coordinates hidden in the page itself (the preview image, or the app's start-up data).
function coordsFromHtml(html, ogImage) {
  const img = String(ogImage || '');
  const mk = img.match(/markers=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i) || img.match(/center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i);
  if (mk) return pair(mk[1], mk[2]);
  const s = String(html || '').match(/APP_INITIALIZATION_STATE=\[\[\[[-\d.e]+,(-?\d+\.\d+),(-?\d+\.\d+)\]/);
  if (s) return pair(s[2], s[1]);
  return null;
}

// Google listing titles look like "Devoción · 69 Grand St, Brooklyn, NY 11249".
function splitTitle(t) {
  const s = String(t || '').replace(/\s*-\s*Google Maps\s*$/i, '').trim();
  if (!s || /^google maps$/i.test(s)) return { name: '', address: '' };
  const parts = s.split(/\s+·\s+/);
  return { name: parts[0] || '', address: parts.slice(1).join(', ') };
}

module.exports = { isGmaps, inNyc, parseUrl, coordsFromHtml, splitTitle };
