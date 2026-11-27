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
  to: { name: 'Toronto', short: 'Toronto', area: 'the City of Toronto', eg: '"Kensington Market", "Leslieville"', eg1: '"Queen West"', addr: '"100 Queen St W"', box: [43.58, -79.64, 43.86, -79.11] },
  // Coming Soon cities (status 'soon' in src/logic.js): spots there are saved on a simple map of the city.
  jc: { soon: 1, name: 'Jersey City & Hoboken', short: 'Jersey City', area: 'Jersey City, Hoboken, Fort Lee and the nearby Hudson and Bergen County towns along the Hudson in New Jersey', eg: '"Downtown Jersey City", "Hoboken"', eg1: '"Journal Square"', addr: '"150 Newark Ave"', box: [40.64, -74.13, 40.9, -73.9] },
  nwk: { soon: 1, name: 'Newark & Montclair', short: 'Newark', area: 'Newark, Montclair and the nearby Essex and Union County towns in New Jersey', eg: '"Ironbound", "Montclair"', eg1: '"Ironbound"', addr: '"100 Ferry St"', box: [40.6, -74.42, 40.92, -74.13] },
  phl: { soon: 1, name: 'Philadelphia', short: 'Philly', area: 'Philadelphia', eg: '"Fishtown", "Rittenhouse"', eg1: '"Old City"', addr: '"1200 Frankford Ave"', box: [39.85, -75.35, 40.15, -74.95] },
  chi: { soon: 1, name: 'Chicago', short: 'Chicago', area: 'Chicago and its close neighbors (Evanston, Oak Park)', eg: '"Wicker Park", "West Loop"', eg1: '"Logan Square"', addr: '"1500 N Milwaukee Ave"', box: [41.64, -87.95, 42.08, -87.52] },
  la: { soon: 1, name: 'Los Angeles', short: 'LA', area: 'Los Angeles and its close neighbors (Santa Monica, Pasadena, Glendale, Culver City)', eg: '"Silver Lake", "Koreatown"', eg1: '"Arts District"', addr: '"3300 Sunset Blvd"', box: [33.7, -118.7, 34.35, -117.9] },
  sf: { soon: 1, name: 'San Francisco Bay', short: 'SF', area: 'San Francisco, Oakland and Berkeley', eg: '"Mission District", "Hayes Valley"', eg1: '"North Beach"', addr: '"500 Valencia St"', box: [37.6, -122.55, 37.92, -122.15] },
  mia: { soon: 1, name: 'Miami', short: 'Miami', area: 'Miami and Miami Beach', eg: '"Wynwood", "Little Havana"', eg1: '"Brickell"', addr: '"2500 NW 2nd Ave"', box: [25.55, -80.45, 25.98, -80.11] },
  atx: { soon: 1, name: 'Austin', short: 'Austin', area: 'Austin, Texas', eg: '"South Congress", "East Austin"', eg1: '"Zilker"', addr: '"1500 S Congress Ave"', box: [30.1, -97.95, 30.52, -97.55] },
  sea: { soon: 1, name: 'Seattle', short: 'Seattle', area: 'Seattle', eg: '"Capitol Hill", "Ballard"', eg1: '"Fremont"', addr: '"1500 Pike Pl"', box: [47.48, -122.45, 47.75, -122.22] },
  // Somewhere Else: spots outside every listed city. No search box.
  else: { soon: 1, any: 1, name: 'any city', short: 'any city', area: 'any city in the world', eg: '"Downtown", "Old Town"', eg1: '"Downtown"', addr: '"123 Main St"', box: [-85, -180, 85, 180] }
};
// New Jersey's shore along the Hudson and the Arthur Kill: the NYC box also covers Jersey City, Hoboken and Newark.
const NJ_EDGE = [[41.357, -74.694], [40.995, -73.902], [40.90, -73.925], [40.80, -73.972], [40.75, -74.012], [40.70, -74.035], [40.652, -74.07], [40.642, -74.18], [40.56, -74.248], [40.49, -74.262], [40.3, -74.4], [40.3, -75], [41.357, -75]];
const cityFor = id => CITIES[id] || CITIES.nyc;
const inRing = (lat, lng, r) => { let ins = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const yi = r[i][0], xi = r[i][1], yj = r[j][0], xj = r[j][1]; if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) ins = !ins; } return ins; };
const inCityBox = (lat, lng, c) => !!c && lat > c.box[0] && lat < c.box[2] && lng > c.box[1] && lng < c.box[3] && (!c.poly || inRing(lat, lng, c.poly));
// Which map a point is on (same order as cityAt in src/logic.js): the five boroughs, other open maps, the nearest
// Coming Soon city, else Somewhere Else.
const cityAt = (lat, lng) => {
  if (!isFinite(lat) || !isFinite(lng)) return null;
  if (inCityBox(lat, lng, CITIES.nyc) && !inRing(lat, lng, NJ_EDGE)) return 'nyc';
  const ks = Object.keys(CITIES).filter(k => k !== 'nyc' && k !== 'else' && inCityBox(lat, lng, CITIES[k]));
  const open = ks.find(k => !CITIES[k].soon); if (open) return open;
  const mid = b => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2], d = k => { const m = mid(CITIES[k].box); return Math.hypot(lat - m[0], lng - m[1]); };
  return ks.sort((a, b) => d(a) - d(b))[0] || 'else';
};
function localize(s, c) {
  if (!c || c === CITIES.nyc) return s;
  if (c.state) s = String(s).replace(/NYC neighborhood/g, 'Town or neighborhood');
  return String(s).replace(/the five boroughs of New York City/g, c.area).replace(/New York City/g, c.name).replace(/\bNYC\b/g, c.short)
    .replace(/"Williamsburg", "Nolita"/g, c.eg).replace(/"Midtown East"/g, c.eg1).replace(/"4 E 43rd St"/g, c.addr).replace(/"69 Grand St"/g, c.addr);
}
// The same for every string inside an object (tool schemas).
const localizeObj = (o, c) => JSON.parse(JSON.stringify(o), (k, v) => typeof v === 'string' ? localize(v, c) : v);

module.exports = { cors, send, requireUser, readRaw, readJson, CITIES, cityFor, inCityBox, cityAt, localize, localizeObj };
