// Helpers shared by the API functions. Files starting with "_" are not deployed as routes.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://octgaltlmqwcqewbxocb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg';

// The iPhone app runs its pages from capacitor://localhost and calls these functions across origins.
const ORIGINS = new Set(['capacitor://localhost', 'ionic://localhost', 'http://localhost', 'https://localhost']);
function cors(req, res) {
  const o = req.headers.origin;
  if (o && ORIGINS.has(o)) {
    res.setHeader('access-control-allow-origin', o);
    res.setHeader('vary', 'origin');
    res.setHeader('access-control-allow-headers', 'authorization, content-type');
    res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
    res.setHeader('access-control-max-age', '86400');
  }
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return true; }
  return false;
}

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

// Only people signed in to this app (checked with Supabase) may use the paid AI services.
async function requireUser(req, res) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) { send(res, 401, { error: 'Sign in to use AI fill.' }); return null; }
  try {
    const u = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: SUPABASE_KEY, authorization: 'Bearer ' + token } });
    if (!u.ok) { send(res, 401, { error: 'Your sign-in expired. Sign in again?' }); return null; }
    return await u.json();
  } catch (e) { send(res, 502, { error: 'Couldn’t check your sign-in. Try again?' }); return null; }
}

async function readRaw(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks = []; for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const raw = await readRaw(req);
  return JSON.parse(raw.toString('utf8') || '{}');
}

// Cities the app supports. Prompts are written for NYC; localize() swaps in the chosen city's names and examples.
const CITIES = {
  nyc: { name: 'New York City', short: 'NYC', area: 'the five boroughs of New York City', eg: '"Williamsburg", "Nolita"', eg1: '"Midtown East"', addr: '"4 E 43rd St"', box: [40.49, -74.27, 40.93, -73.68] },
  sg: { name: 'Singapore', short: 'Singapore', area: 'Singapore', eg: '"Tiong Bahru", "Tanjong Pagar"', eg1: '"Tiong Bahru"', addr: '"78 Yong Siak St"', box: [1.2, 103.6, 1.48, 104.05] },
  hk: { name: 'Hong Kong', short: 'Hong Kong', area: 'Hong Kong (Hong Kong Island, Kowloon, the New Territories and the outlying islands)', eg: '"Sheung Wan", "Mong Kok"', eg1: '"Sheung Wan"', addr: '"18 Hollywood Rd"', box: [22.15, 113.82, 22.57, 114.45] },
  bos: { name: 'Boston', short: 'Boston', area: 'Boston and its close neighbors (Cambridge, Somerville, Brookline and nearby towns)', eg: '"Back Bay", "North End"', eg1: '"South End"', addr: '"100 Hanover St"', box: [42.22, -71.2, 42.43, -70.95] },
  dc: { name: 'Washington, DC', short: 'DC', area: 'Washington, DC and its close neighbors (Arlington, Alexandria, Bethesda, Silver Spring and nearby)', eg: '"Dupont Circle", "Navy Yard"', eg1: '"Shaw"', addr: '"1309 5th St NE"', box: [38.76, -77.25, 39.04, -76.88] },
  to: { name: 'Toronto', short: 'Toronto', area: 'the City of Toronto', eg: '"Kensington Market", "Leslieville"', eg1: '"Queen West"', addr: '"100 Queen St W"', box: [43.58, -79.64, 43.86, -79.11] }
};
const cityFor = id => CITIES[id] || CITIES.nyc;
const inRing = (lat, lng, r) => { let ins = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const yi = r[i][0], xi = r[i][1], yj = r[j][0], xj = r[j][1]; if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) ins = !ins; } return ins; };
const inCityBox = (lat, lng, c) => !!c && lat > c.box[0] && lat < c.box[2] && lng > c.box[1] && lng < c.box[3] && (!c.poly || inRing(lat, lng, c.poly));
function localize(s, c) {
  if (!c || c === CITIES.nyc) return s;
  if (c.state) s = String(s).replace(/NYC neighborhood/g, 'Town or neighborhood');
  return String(s).replace(/the five boroughs of New York City/g, c.area).replace(/New York City/g, c.name).replace(/\bNYC\b/g, c.short)
    .replace(/"Williamsburg", "Nolita"/g, c.eg).replace(/"Midtown East"/g, c.eg1).replace(/"4 E 43rd St"/g, c.addr).replace(/"69 Grand St"/g, c.addr);
}
// The same for every string inside an object (tool schemas).
const localizeObj = (o, c) => JSON.parse(JSON.stringify(o), (k, v) => typeof v === 'string' ? localize(v, c) : v);

module.exports = { cors, send, requireUser, readRaw, readJson, CITIES, cityFor, inCityBox, localize, localizeObj };
