// POST /api/booking  { name, address?, area?, city, ll?: [lat, lng] }
//   → { url, platform } | { url: null, reason }
// Finds the ONE real reservation page for a restaurant (its Resy, OpenTable, Tock, SevenRooms, Chope… page, or the
// booking page on its own website), so the place card never offers a guess. Steps:
//   1. Google Places (if GOOGLE_MAPS_API_KEY is set): its website, and whether Google says it takes reservations.
//   2. Claude with web search looks for the booking page and must cite it: the link is kept only if it appeared in
//      the search results (or is on the restaurant's own website) and is on a booking site or that website.
// Only signed-in users of this app can call it. Costs a few cents, so the app calls it on a tap and saves the answer.

const { cors, send, requireUser, readJson, cityFor } = require('./_shared');
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

const BOOK_HOSTS = /(^|\.)(resy\.com|opentable\.[a-z.]{2,6}|exploretock\.com|tock\.com|sevenrooms\.com|chope\.co|tablecheck\.com|resdiary\.com|thefork\.[a-z.]{2,6}|quandoo\.[a-z.]{2,6}|yelp\.com|inline\.app|eatigo\.com|bookatable\.[a-z.]{2,6}|toasttab\.com|bentobox\.com|getbento\.com)$/i;
const PLATFORM = h => /resy\.com$/.test(h) ? 'Resy' : /opentable\./.test(h) ? 'OpenTable' : /tock\.com$/.test(h) ? 'Tock' : /sevenrooms\.com$/.test(h) ? 'SevenRooms'
  : /chope\.co$/.test(h) ? 'Chope' : /tablecheck\.com$/.test(h) ? 'TableCheck' : /yelp\./.test(h) ? 'Yelp' : /thefork\./.test(h) ? 'TheFork' : /resdiary\.com$/.test(h) ? 'ResDiary' : 'Website';
const host = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; } };
const root = h => h.split('.').slice(-2).join('.');
const norm = u => String(u || '').replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/^https?:\/\/(www\.)?/i, '').toLowerCase();

const TOOL = {
  name: 'booking_link',
  description: 'Record the restaurant’s own online reservation page, or null if it has none.',
  input_schema: {
    type: 'object',
    properties: {
      url: { type: ['string', 'null'], description: 'The exact reservation page URL for THIS restaurant (this location), copied from a search result. Null if it doesn’t take online reservations or you couldn’t find its page.' },
      takes_reservations: { type: 'string', enum: ['yes', 'no', 'unknown'], description: 'Whether the restaurant takes reservations at all (no = walk-in only).' }
    },
    required: ['url', 'takes_reservations']
  }
};

async function googleInfo(body, city) {
  const key = process.env.GOOGLE_MAPS_API_KEY; if (!key) return null;
  const q = [body.name, body.address || body.area, city.name].filter(Boolean).join(', ');
  const req = { textQuery: q, pageSize: 1, languageCode: 'en' };
  if (body.ll) req.locationBias = { circle: { center: { latitude: body.ll[0], longitude: body.ll[1] }, radius: 500 } };
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 7000);
  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST', signal: ac.signal,
      headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.websiteUri,places.reservable,places.businessStatus' }, body: JSON.stringify(req) });
    if (!r.ok) return null; const p = ((await r.json()).places || [])[0]; return p || null;
  } catch (e) { return null; } finally { clearTimeout(t); }
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  if (!process.env.ANTHROPIC_API_KEY) return send(res, 503, { error: 'AI Isn’t Set Up Yet — Add ANTHROPIC_API_KEY In Vercel.' });
  if (!(await requireUser(req, res))) return;
  let body; try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
  const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  body = { name: clip(body.name, 100), address: clip(body.address, 120), area: clip(body.area, 60), city: body.city,
    ll: Array.isArray(body.ll) && body.ll.length === 2 && body.ll.every(Number.isFinite) ? body.ll : null };
  if (body.name.length < 2) return send(res, 400, { error: 'Missing The Restaurant’s Name.' });
  const city = cityFor(body.city);

  const g = await googleInfo(body, city);
  if (g && g.reservable === false) return send(res, 200, { url: null, reason: 'walkin' });
  const site = g && g.websiteUri ? g.websiteUri : '', siteRoot = site ? root(host(site)) : '';

  const prompt = `Find the online reservation page for this restaurant:
${body.name}${body.address ? ', ' + body.address : ''}${body.area ? ' (' + body.area + ')' : ''}, ${city.name}
${site ? 'Its website: ' + site : ''}

Search the web for the page where people book a table at THIS restaurant, at this location: usually its Resy, OpenTable, Tock, SevenRooms${/sg|hk/.test(city.id || '') ? ', Chope, TableCheck' : ''} page, or the reservations page on its own website (the booking button there often links to one of those).
Rules:
- Only a page you actually found in the search results. Never build or guess a URL.
- It must be for this exact restaurant and location, not a sister restaurant, another branch or a list article.
- If it is walk-in only, or you can't find its booking page, return null.
Call booking_link with the result.`;

  try {
    const messages = [{ role: 'user', content: prompt }], seen = new Set();
    let out = null;
    for (let turn = 0; turn < 3 && !out; turn++) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 1200, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }, TOOL], messages })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return send(res, 502, { error: 'Couldn’t Look It Up Right Now — Try Again.' });
      (j.content || []).forEach(b => { if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) b.content.forEach(x => x && x.url && seen.add(norm(x.url))); });
      const use = (j.content || []).find(b => b.type === 'tool_use' && b.name === 'booking_link');
      if (use) { out = use.input; break; }
      if (j.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: j.content }); continue; }
      messages.push({ role: 'assistant', content: j.content }, { role: 'user', content: 'Now call booking_link (url null if you found no booking page).' });
    }
    const url = out && typeof out.url === 'string' && /^https:\/\//i.test(out.url.trim()) ? out.url.trim() : '';
    const h = host(url);
    // Keep it only if it's a booking site or the restaurant's own site, and it really came from the search (or its own site).
    const okHost = h && (BOOK_HOSTS.test(h) || (siteRoot && root(h) === siteRoot));
    const found = url && ([...seen].some(s => s === norm(url) || norm(url).startsWith(s + '/') || s.startsWith(norm(url) + '/')) || (siteRoot && root(h) === siteRoot));
    if (okHost && found) return send(res, 200, { url, platform: PLATFORM(h) });
    return send(res, 200, { url: null, reason: out && out.takes_reservations === 'no' ? 'walkin' : 'notfound' });
  } catch (e) {
    return send(res, 502, { error: 'Couldn’t Look It Up Right Now — Try Again.' });
  }
};
