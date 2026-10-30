// POST /api/places  — Google's place search for the Place Name suggestions.
//   { action: 'auto', q, near?: [lat, lng], session }  → { suggestions: [{ id, name, sub, types }] }
//   { action: 'detail', id, session }                  → { place: { name, address, lat, lng, types, price } }
// Uses Places API (New). The key stays on the server; only signed-in users of this app can call it.
// Pass the same `session` (a random id) to every 'auto' call and the final 'detail' call for one place:
// Google then bills the typing as one session.
//
// Vercel environment variable:
//   GOOGLE_MAPS_API_KEY  (optional) — without it this returns 503 and the app falls back to OpenStreetMap search.

const { cors, send, requireUser, readJson } = require('./_shared');

// The five boroughs (a little generous).
const NYC = { low: { latitude: 40.49, longitude: -74.27 }, high: { latitude: 40.93, longitude: -73.68 } };
const PRICE = { PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 };

// Checking the sign-in on every keystroke would be slow, so remember good tokens for a few minutes.
const okTokens = new Map();
async function signedIn(req, res) {
  const t = String(req.headers.authorization || '');
  const hit = okTokens.get(t); if (t && hit && hit > Date.now()) return true;
  const u = await requireUser(req, res); if (!u) return false;
  if (okTokens.size > 200) okTokens.clear();
  okTokens.set(t, Date.now() + 5 * 60 * 1000); return true;
}

async function google(path, opts) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 8000);
  try {
    const r = await fetch('https://places.googleapis.com/v1/' + path, { ...opts, signal: ac.signal,
      headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY, ...(opts.headers || {}) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error((j.error && j.error.message) || ('Google error ' + r.status)); e.status = r.status; throw e; }
    return j;
  } finally { clearTimeout(t); }
}

const tidy = s => String(s || '').replace(/,?\s*(New York|NY)(,\s*NY)?(\s*\d{5})?,\s*(USA|United States)$/i, '').replace(/,\s*(USA|United States)$/i, '').trim();

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  if (!process.env.GOOGLE_MAPS_API_KEY) return send(res, 503, { error: 'Google place search isn’t set up (add GOOGLE_MAPS_API_KEY in Vercel).' });
  if (!(await signedIn(req, res))) return;
  let body; try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
  const session = String(body.session || '').replace(/[^\w-]/g, '').slice(0, 64) || undefined;

  try {
    if (body.action === 'detail') {
      const id = String(body.id || '').replace(/[^\w-]/g, '');
      if (!id) return send(res, 400, { error: 'Missing place.' });
      const p = await google('places/' + id + (session ? '?sessionToken=' + session : ''), {
        method: 'GET', headers: { 'X-Goog-FieldMask': 'id,displayName,formattedAddress,shortFormattedAddress,location,types,primaryType,priceLevel,addressComponents' }
      });
      const comp = type => ((p.addressComponents || []).find(c => (c.types || []).includes(type)) || {}).shortText || '';
      const street = [comp('street_number'), comp('route')].filter(Boolean).join(' ');
      return send(res, 200, { place: {
        name: (p.displayName && p.displayName.text) || '',
        address: street || tidy(p.shortFormattedAddress || p.formattedAddress).split(',')[0] || '',
        hood: comp('neighborhood') || comp('sublocality_level_1') || '',
        lat: p.location && p.location.latitude, lng: p.location && p.location.longitude,
        types: [p.primaryType, ...(p.types || [])].filter(Boolean),
        price: PRICE[p.priceLevel] || 0
      } });
    }

    const q = String(body.q || '').trim().slice(0, 120);
    if (q.length < 2) return send(res, 200, { suggestions: [] });
    const near = Array.isArray(body.near) && body.near.length === 2 && body.near.every(Number.isFinite) ? body.near : null;
    const j = await google('places:autocomplete', { method: 'POST', body: JSON.stringify({
      input: q, sessionToken: session, languageCode: 'en', regionCode: 'us',
      locationRestriction: { rectangle: NYC },
      ...(near ? { origin: { latitude: near[0], longitude: near[1] } } : {})
    }) });
    const suggestions = (j.suggestions || []).map(s => s.placePrediction).filter(Boolean).map(p => ({
      id: p.placeId,
      name: (p.structuredFormat && p.structuredFormat.mainText && p.structuredFormat.mainText.text) || (p.text && p.text.text) || '',
      sub: tidy(p.structuredFormat && p.structuredFormat.secondaryText && p.structuredFormat.secondaryText.text),
      types: p.types || []
    })).filter(s => s.id && s.name).slice(0, 5);
    return send(res, 200, { suggestions });
  } catch (e) {
    return send(res, e.status === 403 || e.status === 400 ? 502 : 502, { error: 'Google Search: ' + (e.message || 'didn’t work') });
  }
};
