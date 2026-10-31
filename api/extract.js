// POST /api/extract  { url?, notes?, transcript?, frames?:[base64 jpeg], categories:[{id,name}], neighborhoods?:[string] }
// Reads a TikTok / Instagram / Threads / Google Maps / website link (caption, cover image, and for TikTok the
// auto-generated captions of what's said in the video), plus anything the app sends from an
// uploaded video (spoken-word transcript and a few still frames),
// asks Claude which NYC places it mentions, and returns them as structured form data.
//
// Only signed-in users of this app can call it: the request must carry the Supabase
// access token, which is checked against Supabase before any AI call is made.
//
// Vercel environment variables:
//   ANTHROPIC_API_KEY   (required)  from console.anthropic.com
//   ANTHROPIC_MODEL     (optional)  defaults to claude-haiku-5-5
//   SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (optional) default to the values in config.js

const { cors, send, requireUser, readJson, CITIES, cityFor, inCityBox, localize, localizeObj } = require('./_shared');
const G = require('./_gmaps');
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const UA_BOT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const UA_DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const UA_BROWSER = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

async function fetchText(url, ua, ms = 8000, extra) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'user-agent': ua, 'accept-language': 'en-US,en;q=0.9', accept: 'text/html,application/json;q=0.9,*/*;q=0.8', ...(extra || {}) }, redirect: 'follow', signal: ac.signal });
    return { ok: r.ok, status: r.status, url: r.url, text: r.ok ? await r.text() : '' };
  } catch (e) { return { ok: false, status: 0, url, text: '' }; }
  finally { clearTimeout(t); }
}

// Follow one redirect step without downloading the page: returns the Location it points to, or ''.
async function nextHop(url) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 6000);
  try {
    // Note: a desktop-Chrome user agent gets a "open in app" holding page instead of a redirect, so ask as a phone.
    const r = await fetch(url, { method: 'GET', redirect: 'manual', signal: ac.signal, headers: { 'user-agent': UA_BROWSER, 'accept-language': 'en-US,en;q=0.9' } });
    const loc = r.headers.get('location');
    try { r.body && r.body.cancel && r.body.cancel(); } catch (e) {}
    return loc ? new URL(loc, url).toString() : '';
  } catch (e) { return ''; }
  finally { clearTimeout(t); }
}

const decode = s => String(s || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

function meta(html, key) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i');
  const tag = (html.match(re) || [])[0]; if (!tag) return '';
  const m = tag.match(/content=["']([^"']*)["']/i) || tag.match(/content="([^"]*)"/i);
  return m ? decode(m[1]).trim() : '';
}

// TikTok makes automatic captions (speech-to-text) for many videos. They're listed in the
// video page's embedded data; fetch the best English track and flatten it to plain text.
function findSubtitles(html) {
  const grab = id => { const m = html.match(new RegExp('<script[^>]+id="' + id + '"[^>]*>([\\s\\S]*?)</script>')); try { return m ? JSON.parse(m[1]) : null; } catch (e) { return null; } };
  let item = null;
  const u = grab('__UNIVERSAL_DATA_FOR_REHYDRATION__');
  if (u) { const d = (u.__DEFAULT_SCOPE__ || {})['webapp.video-detail']; item = d && d.itemInfo && d.itemInfo.itemStruct; }
  if (!item) { const g = grab('SIGI_STATE'); if (g && g.ItemModule) item = Object.values(g.ItemModule)[0]; }
  if (!item) return { subs: [], desc: '' };
  const v = item.video || {};
  const subs = [...(v.subtitleInfos || []), ...((v.claInfo || {}).captionInfos || []).map(c => ({ LanguageCodeName: c.language, Url: c.url, Source: 'CLA' }))]
    .filter(x => x && (x.Url || x.url));
  return { subs, desc: item.desc || '' };
}
function vttToText(vtt) {
  const seen = new Set();
  return String(vtt || '').split(/\r?\n/)
    .filter(l => l && !/^WEBVTT|^NOTE|^\d+$|-->/.test(l.trim()))
    .map(l => l.replace(/<[^>]+>/g, '').trim()).filter(l => l && !seen.has(l) && seen.add(l)).join(' ');
}
async function tiktokSpoken(videoUrl) {
  const p = await fetchText(videoUrl, UA_BROWSER, 9000);
  if (!p.ok || !p.text) return { text: '', desc: '' };
  const { subs, desc } = findSubtitles(p.text);
  const rank = s => { const l = String(s.LanguageCodeName || s.language || '').toLowerCase(); return (l.startsWith('en') ? 0 : 2) + (s.Source === 'ASR' || s.Source === 'CLA' ? 0 : 1); };
  for (const sub of subs.sort((a, b) => rank(a) - rank(b)).slice(0, 2)) {
    const r = await fetchText(sub.Url || sub.url, UA_BROWSER, 7000, { referer: 'https://www.tiktok.com/' });
    const text = r.ok ? vttToText(r.text) : '';
    if (text) return { text: text.slice(0, 8000), desc };
  }
  return { text: '', desc };
}

// Pull whatever text and cover image we can from the post.
async function readPost(url) {
  const out = { source: 'link', text: [], image: '', author: '', finalUrl: url, spoken: '', pin: null };
  const host = (() => { try { return new URL(url).hostname; } catch (e) { return ''; } })();

  if (G.isGmaps(url)) {
    // Google Maps: one specific place. Follow the share link, then read the name, address and exact pin.
    out.source = 'gmaps';
    // Share links (maps.app.goo.gl/…) redirect to the full place link, which already has the name and exact pin.
    // Read the redirect itself rather than loading Google's (very heavy) map page.
    let final = url;
    for (let i = 0; i < 4 && !/\/maps\/(place|search)|[?&](q|query)=/i.test(final); i++) { const next = await nextHop(final); if (!next) break; final = next; }
    let g = G.parseUrl(final), qAddr = '';
    // Share links usually land on ?q=Name,+Street,+New+York,+NY+zip — the name and full address in one.
    if (!g.name && g.query && g.query.includes(',')) { const parts = g.query.split(','); g.name = parts[0].trim(); qAddr = parts.slice(1).join(',').trim(); }
    const enough = g.name && ((g.ll && g.exact) || qAddr);
    const r = enough ? { text: '', url: final } : await fetchText(final, UA_DESKTOP, 8000);
    if (r.url && r.url !== final && !g.name) { final = r.url; g = G.parseUrl(final); }
    if (!g.name && !g.query) {
      const m = r.text.match(/https:\/\/www\.google\.[a-z.]+\/maps\/place\/[^"'\s<\\]+/i);
      if (m) { final = decode(m[0]); const g2 = G.parseUrl(final); g = { ...g2, ll: g2.ll || g.ll, exact: g2.ll ? g2.exact : g.exact }; }
    }
    out.finalUrl = final;
    const title = G.splitTitle(meta(r.text, 'og:title') || decode((r.text.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || ''));
    const desc = meta(r.text, 'og:description');
    if (!g.ll && (g.name || title.name)) { const c = G.coordsFromHtml(r.text, meta(r.text, 'og:image')); if (c) { g.ll = c; g.exact = true; } }
    const name = title.name || g.name;
    if (name) out.text.push('Place name on Google Maps: ' + name);
    if (title.address || qAddr) out.text.push('Address on Google Maps: ' + (title.address || qAddr));
    if (g.query && !qAddr && g.query !== name) out.text.push('Google Maps search: ' + g.query);
    if (desc && !/^find local businesses/i.test(desc)) out.text.push('Google Maps listing: ' + desc);
    if (g.ll && Object.values(CITIES).some(c => inCityBox(g.ll.lat, g.ll.lng, c))) { out.pin = { ...g.ll, exact: g.exact }; out.text.push(`Pinned at: ${g.ll.lat.toFixed(5)}, ${g.ll.lng.toFixed(5)}`); }
    out.image = '';
  } else if (/tiktok\.com$/i.test(host) || /\.tiktok\.com$/i.test(host)) {
    out.source = 'tiktok';
    let u = url;
    if (/^(vm|vt)\./i.test(host) || /\/t\//.test(url)) { const r = await fetchText(url, UA_BROWSER); if (r.url) u = r.url; }
    out.finalUrl = u;
    const o = await fetchText('https://www.tiktok.com/oembed?url=' + encodeURIComponent(u), UA_BROWSER);
    if (o.ok) { try { const j = JSON.parse(o.text); if (j.title) out.text.push(j.title); out.author = j.author_name || j.author_unique_id || ''; out.image = j.thumbnail_url || ''; } catch (e) {} }
    try { const sp = await tiktokSpoken(u); out.spoken = sp.text; if (!out.text.length && sp.desc) out.text.push(sp.desc); } catch (e) {}
    if (!out.text.length) { const p = await fetchText(u, UA_BOT); const d = meta(p.text, 'og:description') || meta(p.text, 'description'); if (d) out.text.push(d); out.image = out.image || meta(p.text, 'og:image'); }
  } else if (/instagram\.com$|instagr\.am$/i.test(host)) {
    out.source = 'instagram';
    const m = url.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
    if (m) {
      const e = await fetchText(`https://www.instagram.com/${m[1] === 'reels' ? 'reel' : m[1]}/${m[2]}/embed/captioned/`, UA_BROWSER);
      const cap = (e.text.match(/<div class="Caption"[^>]*>([\s\S]*?)<div class="CaptionComments"/i) || e.text.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i) || [])[1];
      if (cap) out.text.push(decode(cap.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ').trim());
      const img = (e.text.match(/<img[^>]+class="EmbeddedMediaImage"[^>]+src="([^"]+)"/i) || [])[1]; if (img) out.image = decode(img);
    }
    if (!out.text.length) { const p = await fetchText(url, UA_BOT); const d = meta(p.text, 'og:description') || meta(p.text, 'og:title'); if (d) out.text.push(d); out.image = out.image || meta(p.text, 'og:image'); }
  } else if (/threads\.(net|com)$/i.test(host)) {
    out.source = 'threads';
    const p = await fetchText(url, UA_BOT);
    const d = meta(p.text, 'og:description') || meta(p.text, 'description'); if (d) out.text.push(d);
    const t = meta(p.text, 'og:title'); if (t) out.author = t;
    out.image = meta(p.text, 'og:image');
  } else {
    const p = await fetchText(url, UA_BROWSER);
    const t = meta(p.text, 'og:title') || decode((p.text.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '');
    const d = meta(p.text, 'og:description') || meta(p.text, 'description');
    [t, d].filter(Boolean).forEach(x => out.text.push(x));
    out.image = meta(p.text, 'og:image');
  }
  out.text = out.text.map(s => s.slice(0, 4000));
  if (out.image && !/^https:\/\//i.test(out.image)) out.image = '';
  return out;
}

// Pin a found place with Google's place search (when GOOGLE_MAPS_API_KEY is set), so the app doesn't have to
// geocode it: Google knows businesses by name (stalls in food halls too), where an address search often doesn't.
async function pinPlace(p, city) {
  const key = process.env.GOOGLE_MAPS_API_KEY; if (!key || !p || !p.name) return;
  const c = city.box ? city : CITIES.nyc, b = c.box;
  const search = async q => {
    try {
      const ac = new AbortController(), t = setTimeout(() => ac.abort(), 6000);
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST', signal: ac.signal,
        headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress' },
        body: JSON.stringify({ textQuery: q, pageSize: 1, languageCode: 'en', locationRestriction: { rectangle: { low: { latitude: b[0], longitude: b[1] }, high: { latitude: b[2], longitude: b[3] } } } }) });
      clearTimeout(t);
      const g = r.ok ? ((await r.json()).places || [])[0] : null;
      return g && g.location && inCityBox(g.location.latitude, g.location.longitude, c) ? g : null;
    } catch (e) { return null; }
  };
  // Chains have several branches: when the post gives a street address, the match must be at that street number,
  // otherwise pin the address itself.
  const num = (String(p.address || '').match(/^\s*(\d+[A-Za-z]?)\b/) || [])[1];
  let g = await search([p.name, p.address || p.neighborhood, c.name].filter(Boolean).join(', '));
  if (g && num && !new RegExp('(^|[\\s,])' + num + '\\b').test(g.formattedAddress || '')) g = await search(p.address + ', ' + c.name);
  if (g) { p.lat = +g.location.latitude.toFixed(6); p.lng = +g.location.longitude.toFixed(6); }
}

const TOOL = {
  name: 'save_places',
  description: 'Record every specific, visitable place in New York City that the post mentions or shows.',
  input_schema: {
    type: 'object',
    properties: {
      places: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The place’s proper business name, as it is known (e.g. "Devoción", "Thai Diner"). No emojis.' },
            category_id: { type: ['string', 'null'], description: 'Best-matching id from the provided category list, or null if none fits.' },
            neighborhood: { type: ['string', 'null'], description: 'NYC neighborhood (e.g. "Williamsburg", "Nolita"), if stated or well known.' },
            address: { type: ['string', 'null'], description: 'Street address or cross streets if stated or well known; otherwise null.' },
            price: { type: ['integer', 'null'], description: 'For restaurants/bars only: 1=$ (under $20), 2=$$ ($20-40), 3=$$$ ($40-80), 4=$$$$ ($80+) per person. Null if unknown.' },
            note: { type: 'string', description: 'One short line on what to order or why to go, taken from the post. Title Case Each Word, like the app’s style. Empty string if nothing useful.' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
          },
          required: ['name', 'category_id', 'neighborhood', 'address', 'price', 'note', 'confidence']
        }
      },
      summary: { type: 'string', description: 'A few words on what the post is about.' }
    },
    required: ['places', 'summary']
  }
};

async function askClaude({ post, notes, transcript, frames, categories, neighborhoods, withImage, city }) {
  const cats = (categories || []).map(c => `- ${c.id}: ${c.name}`).join('\n');
  const hoods = (neighborhoods || []).slice(0, 400).join(', ');
  const isMap = post.source === 'gmaps';
  const lines = [
    `Platform: ${post.source}`, post.author ? `Posted by: ${post.author}` : '', `Link: ${post.finalUrl}`,
    post.text.length ? `Post text:\n${post.text.join('\n---\n')}` : (post.source === 'video' ? '' : 'Post text: (could not be read)'),
    post.spoken ? `What is said in the video (TikTok auto-captions, may have spelling mistakes):\n${post.spoken}` : '',
    transcript ? `What is said in the video (speech-to-text; place names may be misspelled, so correct them to the real business name when you recognize it):\n${transcript}` : '',
    notes ? `Extra notes the user typed:\n${notes}` : ''
  ].filter(Boolean).join('\n\n');
  const content = [];
  if (withImage && post.image) content.push({ type: 'image', source: { type: 'url', url: post.image } });
  (frames || []).forEach(b64 => content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }));
  content.push({ type: 'text', text: localize(isMap ?
`This is a Google Maps link to one specific NYC place. Identify it so it can be saved to a personal "places to visit" map.

${lines}

Category list (use these ids for category_id):
${cats}

Neighborhood names the app knows (prefer one of these spellings): ${hoods}

Rules:
- Return exactly one place: the one this link points to, with its proper business name.
- Use the Google Maps address as the address (street part only, e.g. "69 Grand St"), if given.
- Work out the neighborhood from the address or the pinned coordinates.
- Pick the category, price and a short note (what it's known for or what to order) from your own knowledge of the place; leave price null and note empty if you don't know it.
Call save_places with the result.` :
`Find the NYC places (restaurants, cafes, bakeries, bars, shops, markets and similar) mentioned in this social media post, so they can be saved to a personal "places to visit" map.

${lines}

Category list (use these ids for category_id):
${cats}

Neighborhood names the app knows (prefer one of these spellings): ${hoods}

Rules:
- Only include real, specific places a person could walk into. Skip general areas, dishes, brands without a storefront, and the creator's own name.
- Use text visible in the images too (cover image and video frames): creators often put the place name on screen.
- Spoken words are often the main source; listen for "this is", "go to", "called", and street names.
- If the post names a place but not where it is, fill neighborhood and address from your own knowledge only when you are confident; otherwise null.
- If nothing identifiable is mentioned, return an empty places list.
Call save_places with the result.`, city) });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 1500, tools: [localizeObj(TOOL, city)], tool_choice: { type: 'tool', name: 'save_places' }, messages: [{ role: 'user', content }] })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const err = new Error((j.error && j.error.message) || ('AI request failed (' + r.status + ')')); err.status = r.status; throw err; }
  const use = (j.content || []).find(b => b.type === 'tool_use');
  return use ? use.input : { places: [], summary: '' };
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  if (!process.env.ANTHROPIC_API_KEY) return send(res, 503, { error: 'AI Isn’t Set Up Yet — Add ANTHROPIC_API_KEY In Vercel.' });

  if (!(await requireUser(req, res))) return;

  let body; try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
  const url = String(body.url || '').trim(), notes = String(body.notes || '').slice(0, 3000);
  const transcript = String(body.transcript || '').slice(0, 20000);
  const frames = (Array.isArray(body.frames) ? body.frames : []).filter(f => typeof f === 'string' && /^[A-Za-z0-9+/=]+$/.test(f) && f.length < 900000).slice(0, 4);
  const hasLink = /^https?:\/\//i.test(url);
  if (!hasLink && !notes && !transcript && !frames.length) return send(res, 400, { error: 'Paste A Link Or Pick A Video First.' });

  const post = hasLink ? await readPost(url) : { source: transcript || frames.length ? 'video' : 'notes', text: [], image: '', author: '', finalUrl: '', spoken: '' };
  if (!post.text.length && !post.spoken && !post.image && !notes && !transcript && !frames.length) {
    return send(res, 200, { places: [], readable: false, source: post.source, message: 'Couldn’t Read This Post. Paste The Caption Into Notes And Tap Fill Again.' });
  }
  try {
    let out;
    const args = { post, notes, transcript, frames, categories: body.categories, neighborhoods: body.neighborhoods, city: cityFor(body.city) };
    try { out = await askClaude({ ...args, withImage: true }); }
    catch (e) { if (post.image && e.status === 400) out = await askClaude({ ...args, withImage: false }); else throw e; }
    let places = (out.places || []).filter(p => p && p.name).slice(0, 12);
    if (post.source === 'gmaps') {
      places = places.slice(0, 1);
      if (places[0] && post.pin) Object.assign(places[0], { lat: post.pin.lat, lng: post.pin.lng });
    }
    await Promise.all(places.filter(p => p.lat == null).map(p => pinPlace(p, CITIES[body.city] || CITIES.nyc)));
    return send(res, 200, { places, summary: out.summary || '', readable: post.text.length > 0, heard: !!(post.spoken || transcript), source: post.source,
      message: places.length ? '' : 'No Specific Places Found In This Post. Add It By Name Instead.' });
  } catch (e) {
    return send(res, 502, { error: 'AI Couldn’t Read It Right Now — ' + (e.message || 'Try Again') });
  }
};
