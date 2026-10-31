// GET /api/photo?q=<name, address>&ll=<lat,lng>  → the spot's first Google Maps photo (JPEG), or 404 if it has none.
// GET /api/photo?probe=1                          → 204 when Google photos are switched on, 503 when not.
//
// Used as the <img> source for saved spots that have no photo of their own. It finds the place with
// Google Places API (New) Text Search (biased to the saved pin) and streams back its first photo at ~600 px.
// Needs GOOGLE_MAPS_API_KEY in Vercel with "Places API (New)" enabled (the same key as /api/places).
// Images can't send a sign-in token, so requests are only answered for the app's own pages (by Referer/Origin).
// Browsers keep a photo for a day and Vercel's CDN for a week, so each spot costs a lookup only now and then.

const { cors, send } = require('./_shared');

const okHost = h => h === 'nyc-lovat.vercel.app' || /^nyc-[a-z0-9-]+-kotis1\.vercel\.app$/.test(h) || h === 'localhost' || h === '127.0.0.1';
const fromApp = req => {
  const o = String(req.headers.origin || ''), ref = String(req.headers.referer || '');
  if (/^(capacitor|ionic):\/\/localhost/.test(o) || /^(capacitor|ionic):\/\/localhost/.test(ref)) return true;
  try { return okHost(new URL(o && o !== 'null' ? o : ref).hostname); } catch (e) { return false; }
};

async function g(path, opts, key) {
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), 9000);
  try {
    return await fetch('https://places.googleapis.com/v1/' + path, { ...opts, signal: ac.signal, headers: { 'X-Goog-Api-Key': key, ...(opts.headers || {}) } });
  } finally { clearTimeout(t); }
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const url = new URL(req.url, 'http://x'), q = (url.searchParams.get('q') || '').trim().slice(0, 200);
  if (url.searchParams.get('probe')) { res.statusCode = key ? 204 : 503; res.setHeader('cache-control', 'no-store'); return res.end(); }
  if (!key) return send(res, 503, { error: 'Google photos aren’t set up (add GOOGLE_MAPS_API_KEY in Vercel).' });
  if (!fromApp(req)) return send(res, 403, { error: 'Not Allowed.' });
  if (!q) return send(res, 400, { error: 'Missing q.' });
  const [lat, lng] = (url.searchParams.get('ll') || '').split(',').map(Number);
  try {
    const body = { textQuery: q, maxResultCount: 1 };
    if (isFinite(lat) && isFinite(lng) && lat && lng) body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 400 } };
    const r = await g('places:searchText', { method: 'POST', headers: { 'content-type': 'application/json', 'X-Goog-FieldMask': 'places.photos' }, body: JSON.stringify(body) }, key);
    const d = r.ok ? await r.json() : null, photo = d && d.places && d.places[0] && d.places[0].photos && d.places[0].photos[0];
    // No photo: cache the 404 too, so a spot without photos isn't looked up again on every view.
    if (!photo) { res.statusCode = 404; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'public, max-age=86400, s-maxage=604800'); return res.end('{"error":"No Photo."}'); }
    const img = await g(photo.name + '/media?maxWidthPx=600&maxHeightPx=600', { method: 'GET' }, key);
    if (!img.ok) return send(res, 502, { error: 'Photo Unavailable.' });
    const buf = Buffer.from(await img.arrayBuffer());
    res.statusCode = 200;
    res.setHeader('content-type', img.headers.get('content-type') || 'image/jpeg');
    res.setHeader('cache-control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.end(buf);
  } catch (e) {
    send(res, 502, { error: 'Photo Unavailable.' });
  }
};
