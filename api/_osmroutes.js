// Transit route lines from OpenStreetMap (Overpass API) for the non-NYC cities' map layers:
// buses (Singapore, Hong Kong, Toronto), trams (Hong Kong), streetcars (Toronto) and ferries (Hong Kong).
// OSM keeps each route as a relation of road pieces ("ways"). This keeps one relation per route number,
// joins its pieces into whole lines, simplifies them and packs each as [lat0, lng0, dLat, dLng, …] in 1e-5 degrees,
// the same shape as /api/bus for NYC: [{ n: route number, t: kind, c: color, l: name, s: [lines] }].

const BOX = { sg: [1.2, 103.6, 1.48, 104.05], hk: [22.15, 113.82, 22.57, 114.45], to: [43.58, -79.64, 43.86, -79.11] };
// Which relations make up each layer.
const FILTER = {
  'sg:bus': '["route"="bus"]',
  'hk:bus': '["route"="bus"]',
  'hk:tram': '["route"="tram"]',
  'hk:ferry': '["route"="ferry"]',
  'to:bus': '["route"="bus"]["network"="TTC"]',
  'to:tram': '["route"="tram"]["network"="TTC"]'
};
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

const hex = c => /^#?[0-9a-f]{6}$/i.test(String(c || '').trim()) ? '#' + String(c).trim().replace('#', '').toUpperCase() : null;
function colorFor(city, kind, tags) {
  const own = hex(tags.colour);
  if (kind === 'tram') return city === 'hk' ? '#007F3D' : '#DA251D';
  if (kind === 'ferry') return '#0B7BC1';
  const op = (tags.operator || '') + ' ' + (tags.network || '');
  if (city === 'hk') {
    if (/KMB|Kowloon Motor|九巴/i.test(op)) return '#E2231A';
    if (/Citybus|CTB|城巴/i.test(op)) return '#E5A800';
    if (/NLB|New Lantao|新大嶼山/i.test(op)) return '#0091D5';
    if (/Long Win|LWB|龍運/i.test(op)) return '#F07F1B';
    if (/minibus|GMB|小巴/i.test(op)) return '#00984A';
    return own || '#7A809C';
  }
  if (city === 'sg') {
    if (/SBS/i.test(op)) return '#7B2E8C';
    if (/SMRT/i.test(op)) return '#E3141D';
    if (/Tower Transit/i.test(op)) return '#1C8B3C';
    if (/Go-?Ahead/i.test(op)) return '#F28B00';
    return own || '#7A809C';
  }
  return '#DA251D'; // TTC red
}

// Douglas-Peucker on [lat, lng] points.
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(), [y1, x1] = pts[a], [y2, x2] = pts[b], dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy;
    let mi = -1, md = 0;
    for (let i = a + 1; i < b; i++) {
      const [y, x] = pts[i]; let t = L ? ((x - x1) * dx + (y - y1) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const ex = x1 + t * dx - x, ey = y1 + t * dy - y, d = ex * ex + ey * ey;
      if (d > md) { md = d; mi = i; }
    }
    if (md > eps * eps) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const near = (a, b) => Math.abs(a[0] - b[0]) < 3e-5 && Math.abs(a[1] - b[1]) < 3e-5;

// Join a relation's ways (in member order) into as few lines as possible.
function joinWays(list) {
  const out = []; let cur = null;
  for (const w of list) {
    let c = w.slice();
    if (!cur) { cur = c; continue; }
    const ce = cur[cur.length - 1], cs = cur[0];
    if (near(ce, c[0])) cur.push(...c.slice(1));
    else if (near(ce, c[c.length - 1])) cur.push(...c.reverse().slice(1));
    else if (cur.length === w.length && near(cs, c[0])) { cur.reverse(); cur.push(...c.slice(1)); }
    else if (cur.length === w.length && near(cs, c[c.length - 1])) { cur.reverse(); cur.push(...c.reverse().slice(1)); }
    else { out.push(cur); cur = c; }
  }
  if (cur) out.push(cur);
  return out;
}
function encode(pts) {
  const q = pts.map(([a, b]) => [Math.round(a * 1e5), Math.round(b * 1e5)]);
  const enc = [q[0][0], q[0][1]];
  for (let i = 1; i < q.length; i++) enc.push(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
  return enc;
}

// Turn an Overpass answer (relations with members, then their ways with geometry) into route lines.
function process(d, city, kind) {
  const ways = new Map();
  for (const e of d.elements || []) if (e.type === 'way' && e.geometry) ways.set(e.id, e.geometry.map(g => [g.lat, g.lon]));
  const best = new Map();
  for (const e of d.elements || []) {
    if (e.type !== 'relation') continue;
    const t = e.tags || {}, key = (t.ref || t.name || String(e.id)).trim();
    const wm = (e.members || []).filter(m => m.type === 'way' && !/platform|stop/.test(m.role || '') && ways.has(m.ref));
    if (!wm.length) continue;
    const cur = best.get(key);
    if (!cur || wm.length > cur.wm.length) best.set(key, { t, wm });
  }
  const eps = kind === 'bus' && city === 'hk' ? 0.00035 : 0.0002;
  const routes = [];
  for (const [key, { t, wm }] of best) {
    const s = joinWays(wm.map(m => ways.get(m.ref))).map(l => simplify(l, eps)).filter(l => l.length > 1).map(encode);
    if (!s.length) continue;
    routes.push({ n: String(t.ref || (kind === 'bus' ? key : '')).slice(0, 24), t: kind, c: colorFor(city, kind, t), l: String(t['name:en'] || t.name || '').slice(0, 80), s });
  }
  return routes.sort((a, b) => a.n.localeCompare(b.n, 'en', { numeric: true }));
}

async function build(city, kind) {
  const f = FILTER[city + ':' + kind], b = BOX[city];
  if (!f || !b) return null;
  const q = `[out:json][timeout:50];rel${f}(${b.join(',')});out body;way(r);out skel geom qt;`;
  let last = null;
  for (const url of MIRRORS) {
    try {
      const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 52000);
      const r = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'SpottedIn/1.0 (nyc-lovat.vercel.app)' }, signal: ac.signal });
      const txt = await r.text(); clearTimeout(timer);
      if (txt[0] !== '{') { last = new Error('overpass ' + r.status); continue; }
      const out = process(JSON.parse(txt), city, kind);
      if (out.length) return out;
      last = new Error('no routes');
    } catch (e) { last = e; }
  }
  throw last || new Error('overpass');
}

module.exports = { build, process, FILTER };
