// GET /api/photo?q=<name, address>&ll=<lat,lng>[&c=<category>]  → the spot's best Google Maps photo (JPEG), or 404 if it has none.
// GET /api/photo?probe=1                          → 204 when Google photos are switched on, 503 when not.
//
// Used as the <img> source for saved spots that have no photo of their own. It finds the place with
// Google Places API (New) Text Search (biased to the saved pin), looks at small copies of its first few photos,
// and asks Claude which one best shows the food, drinks, goods or the inside (not the storefront, a menu or a selfie).
// That photo comes back sharp, up to 1600 px. Without ANTHROPIC_API_KEY (or if the AI fails) it uses the first photo.
// Needs GOOGLE_MAPS_API_KEY in Vercel with "Places API (New)" enabled (the same key as /api/places).
// Images can't send a sign-in token, so requests are only answered for the app's own pages (by Referer/Origin).
// Browsers keep a photo for a week and Vercel's CDN for a month, so each spot costs a lookup only now and then.

const { cors, send } = require('./_shared');

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const CANDIDATES = 6, BIG = 1600;

// Which photo shows the spot best? Returns an index into thumbs, or 0 when unsure.
async function pickBest(thumbs, name, kind) {
  if (thumbs.length < 2 || !process.env.ANTHROPIC_API_KEY) return 0;
  const content = [];
  thumbs.forEach((t, i) => { content.push({ type: 'text', text: 'Photo ' + (i + 1) + ':' }); content.push({ type: 'image', source: { type: 'base64', media_type: t.type, data: t.data } }); });
  content.push({ type: 'text', text: `These are Google Maps photos of "${name}"${kind ? ' (' + kind + ')' : ''}. Pick the one photo that would make someone want to go: its best-looking food, drinks or signature dish, the products it sells, or a nice shot of the inside.
Avoid outside or storefront shots, street views, menus, signs, receipts, logos, selfies or photos mostly of people, and dark, blurry or cluttered photos.
Reply with the photo number only.` });
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), 12000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: ac.signal,
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 10, messages: [{ role: 'user', content }] })
    });
    if (!r.ok) return 0;
    const j = await r.json(), txt = ((j.content || []).find(b => b.type === 'text') || {}).text || '', n = parseInt((txt.match(/\d+/) || [])[0], 10);
    return n >= 1 && n <= thumbs.length ? n - 1 : 0;
  } catch (e) { return 0; } finally { clearTimeout(t); }
}

async function media(name, w, key) {
  const r = await g(name + '/media?maxWidthPx=' + w + '&maxHeightPx=' + w, { method: 'GET' }, key);
  if (!r.ok) return null;
  return { type: (r.headers.get('content-type') || 'image/jpeg').split(';')[0], buf: Buffer.from(await r.arrayBuffer()) };
}

const okHost = h => h === 'nyc-lovat.vercel.app' || /^nyc-[a-z0-9-]+-kotis1\.vercel\.app$/.test(h) || h === 'localhost' || h === '127.0.0.1';
// The iPhone app's pages live at capacitor://localhost, and WebKit sends no Referer or Origin from there for <img>,
// so it's recognized by the app's own image links (&app=ios, from build 5) or, for older builds, by the in-app
// web view's user agent (iPhone WebKit without "Safari", which Safari itself always includes).
const inAppView = ua => /\b(iPhone|iPad|iPod)\b/.test(ua) && /AppleWebKit/.test(ua) && !/Safari\//.test(ua);
const fromApp = req => {
  const o = String(req.headers.origin || ''), ref = String(req.headers.referer || ''), ua = String(req.headers['user-agent'] || '');
  if (/^(capacitor|ionic):\/\/localhost/.test(o) || /^(capacitor|ionic):\/\/localhost/.test(ref)) return true;
  if (!o && !ref && (/[?&]app=ios(&|$)/.test(req.url || '') || inAppView(ua))) return true;
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
    const r = await g('places:searchText', { method: 'POST', headers: { 'content-type': 'application/json', 'X-Goog-FieldMask': 'places.photos,places.displayName,places.primaryTypeDisplayName' }, body: JSON.stringify(body) }, key);
    const d = r.ok ? await r.json() : null, place = d && d.places && d.places[0], photos = ((place && place.photos) || []).slice(0, CANDIDATES);
    // No photo: cache the 404 too, so a spot without photos isn't looked up again on every view.
    if (!photos.length) { res.statusCode = 404; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'public, max-age=86400, s-maxage=604800'); return res.end('{"error":"No Photo."}'); }
    let pick = 0;
    if (photos.length > 1 && process.env.ANTHROPIC_API_KEY) {
      const thumbs = await Promise.all(photos.map(p => media(p.name, 400, key).catch(() => null)));
      const ok = thumbs.map((t, i) => t && /^image\/(jpeg|png|webp|gif)$/.test(t.type) ? { i, type: t.type, data: t.buf.toString('base64') } : null).filter(Boolean);
      const name = (place.displayName && place.displayName.text) || q.split(',')[0];
      const kind = url.searchParams.get('c') || (place.primaryTypeDisplayName && place.primaryTypeDisplayName.text) || '';
      const k = await pickBest(ok, name, kind.slice(0, 60));
      pick = ok[k] ? ok[k].i : 0;
    }
    const img = (await media(photos[pick].name, BIG, key)) || (pick ? await media(photos[0].name, BIG, key) : null);
    if (!img) return send(res, 502, { error: 'Photo unavailable.' });
    res.statusCode = 200;
    res.setHeader('content-type', img.type);
    res.setHeader('cache-control', 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=604800');
    res.end(img.buf);
  } catch (e) {
    send(res, 502, { error: 'Photo unavailable.' });
  }
};
