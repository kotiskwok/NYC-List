// POST /api/hours  { spots: [{ id, q: "name, address", ll: [lat, lng] }] }  (up to 25 per call)
//   → { hours: { <id>: { p: [[openDay, openMin, closeDay, closeMin], …], s: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' } | null } }
// Opening hours from Google Places (New) Text Search, biased to each saved pin. Days are 0 = Sunday, minutes are
// minutes after midnight in the place's local time. A spot open around the clock comes back as [[0, 0, null, null]].
// null means Google has no hours for it. The app stores the result on the spot and refreshes it about once a month.
//
// Vercel environment variable: GOOGLE_MAPS_API_KEY (without it this returns 503 and the Open Now filter stays off).

const { cors, send, requireUser, readJson } = require('./_shared');

async function lookup(spot, key) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 8000);
  try {
    const body = { textQuery: spot.q, pageSize: 1, languageCode: 'en' };
    if (spot.ll) body.locationBias = { circle: { center: { latitude: spot.ll[0], longitude: spot.ll[1] }, radius: 400 } };
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST', signal: ac.signal,
      headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.regularOpeningHours,places.businessStatus,places.location' },
      body: JSON.stringify(body) });
    if (!r.ok) return undefined;
    const p = ((await r.json()).places || [])[0];
    if (!p) return null;
    // A match far from the saved pin is probably a different branch: don't trust its hours.
    if (spot.ll && p.location) {
      const dLat = (p.location.latitude - spot.ll[0]) * 111, dLng = (p.location.longitude - spot.ll[1]) * 111 * Math.cos(spot.ll[0] * Math.PI / 180);
      if (Math.hypot(dLat, dLng) > 1.5) return null;
    }
    const periods = (p.regularOpeningHours && p.regularOpeningHours.periods) || [];
    if (!periods.length) return p.businessStatus && p.businessStatus !== 'OPERATIONAL' ? { p: [], s: p.businessStatus } : null;
    const m = x => (x.hour || 0) * 60 + (x.minute || 0);
    return { p: periods.filter(x => x.open).map(x => [x.open.day, m(x.open), x.close ? x.close.day : null, x.close ? m(x.close) : null]), s: p.businessStatus || 'OPERATIONAL' };
  } catch (e) { return undefined; } finally { clearTimeout(t); }
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return send(res, 503, { error: 'Opening hours aren’t set up (add GOOGLE_MAPS_API_KEY in Vercel).' });
  if (!(await requireUser(req, res))) return;
  let body; try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
  const spots = (Array.isArray(body.spots) ? body.spots : []).slice(0, 25).map(s => ({
    id: String(s.id || '').slice(0, 64), q: String(s.q || '').trim().slice(0, 200),
    ll: Array.isArray(s.ll) && s.ll.length === 2 && s.ll.every(Number.isFinite) ? s.ll : null
  })).filter(s => s.id && s.q.length > 1);
  const hours = {};
  // A few at a time keeps it quick without tripping Google's per-second limits.
  for (let i = 0; i < spots.length; i += 5) {
    const got = await Promise.all(spots.slice(i, i + 5).map(s => lookup(s, key)));
    got.forEach((h, j) => { if (h !== undefined) hours[spots[i + j].id] = h; });
  }
  return send(res, 200, { hours });
};
