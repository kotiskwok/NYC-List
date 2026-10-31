// GET /api/bus → [{n, t, c, l, s}]  NYC bus routes for the map's Bus layer.
//
// Source: MTA Bus Routes on data.ny.gov (dataset bzwk-3hb4), the current GTFS shapes. The raw data is ~15 MB of
// tiny line pieces, so this keeps one shape per route (the longest), joins the pieces back into whole lines,
// simplifies them (~15 m) and packs each line as [lat0, lng0, dLat, dLng, …] in 1e-5 degrees (~150 KB total).
// School routes are left out. Vercel's CDN caches the answer for a week, so data.ny.gov is rarely asked.
//   n = route name (M15), t = L | LTD | SBS | X (local, limited, Select Bus, express), c = MTA color, l = long name.
// Public data, no sign-in needed.

const { cors, send } = require('./_shared');

const SRC = 'https://data.ny.gov/resource/bzwk-3hb4.geojson?$limit=5000&$where=' + encodeURIComponent("in_effect='true'");
const TYPE = { Local: 'L', Limited: 'LTD', SBS: 'SBS', Express: 'X' };
let memo = null, memoAt = 0;

// Douglas-Peucker line simplification on [lng, lat] points (eps in degrees).
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(), [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy;
    let mi = -1, md = 0;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = pts[i]; let t = L ? ((x - x1) * dx + (y - y1) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const ex = x1 + t * dx - x, ey = y1 + t * dy - y, d = ex * ex + ey * ey;
      if (d > md) { md = d; mi = i; }
    }
    if (md > eps * eps) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const near = (a, b) => Math.abs(a[0] - b[0]) < 2e-6 && Math.abs(a[1] - b[1]) < 2e-6;
// The shapes arrive as thousands of 2-3 point pieces in order; join each piece onto the last when they touch.
function stitch(lines) {
  const out = []; let cur = null;
  for (const l of lines) {
    if (cur && near(cur[cur.length - 1], l[0])) for (let i = 1; i < l.length; i++) cur.push(l[i]);
    else { if (cur) out.push(cur); cur = l.slice(); }
  }
  if (cur) out.push(cur);
  return out;
}

async function build() {
  const r = await fetch(SRC, { headers: { accept: 'application/geo+json, application/json' } });
  if (!r.ok) throw new Error('data.ny.gov ' + r.status);
  const feats = (await r.json()).features || [];
  const best = new Map();
  for (const f of feats) {
    const p = f.properties || {};
    if (!TYPE[p.route_type] || !f.geometry) continue;
    const cur = best.get(p.route_id);
    if (!cur || +p.shape_length > +cur.properties.shape_length) best.set(p.route_id, f);
  }
  const routes = [...best.values()].sort((a, b) => a.properties.route_id.localeCompare(b.properties.route_id, 'en', { numeric: true }));
  return routes.map(f => {
    const p = f.properties, g = f.geometry, lines = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
    const s = [];
    for (const line of stitch(lines)) {
      const pts = simplify(line, 0.00015).map(([x, y]) => [Math.round(y * 1e5), Math.round(x * 1e5)]);
      if (pts.length < 2) continue;
      const enc = [pts[0][0], pts[0][1]];
      for (let i = 1; i < pts.length; i++) enc.push(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      s.push(enc);
    }
    return { n: p.route_short_name || p.route_id, t: TYPE[p.route_type], c: '#' + (p.route_color || '006CB7'), l: p.route_long_name || '', s };
  }).filter(r => r.s.length);
}


module.exports = async (req, res) => {
  if (cors(req, res)) return;
  try {
    if (!memo || Date.now() - memoAt > 864e5) { memo = await build(); memoAt = Date.now(); }
    // send() marks answers no-store, so this one is written by hand to let the CDN cache it.
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800');
    res.end(JSON.stringify(memo));
  } catch (e) {
    send(res, 502, { error: 'Bus Routes Aren’t Available Right Now.' });
  }
};
