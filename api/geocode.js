// GET /api/geocode?<Nominatim search params>  → the same JSON as nominatim.openstreetmap.org/search.
// For the iPhone app: its web view sends no Referer, and OpenStreetMap's Nominatim refuses such requests,
// so the app asks here and this forwards the search with the site's name, as Nominatim's usage policy asks.
// Only the app's own pages may use it; answers are cached for a day.
const { cors, send } = require('./_shared');
const KEEP = ['format', 'addressdetails', 'limit', 'viewbox', 'bounded', 'q'];
module.exports = async (req, res) => {
  if (cors(req, res)) return;
  const url = new URL(req.url, 'http://x'), q = (url.searchParams.get('q') || '').trim();
  if (!q || q.length > 300) return send(res, 400, { error: 'Missing q.' });
  const p = new URLSearchParams(); KEEP.forEach(k => { const v = url.searchParams.get(k); if (v != null) p.set(k, v.slice(0, 300)); });
  p.set('format', 'jsonv2'); p.set('limit', String(Math.min(10, +p.get('limit') || 5)));
  try {
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 8000);
    const r = await fetch('https://nominatim.openstreetmap.org/search?' + p, { signal: ac.signal, headers: { 'user-agent': 'SpottedIn/1.0 (https://nyc-lovat.vercel.app)', referer: 'https://nyc-lovat.vercel.app/', 'accept-language': 'en' } });
    clearTimeout(t);
    const txt = await r.text();
    if (!r.ok || txt[0] !== '[') return send(res, 502, { error: 'Address Search Unavailable.' });
    res.statusCode = 200; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'public, max-age=3600, s-maxage=86400');
    res.end(txt);
  } catch (e) { send(res, 502, { error: 'Address Search Unavailable.' }); }
};
