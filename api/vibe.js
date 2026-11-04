// POST /api/vibe  { q: "cozy cafe to work in on a rainy day", city, spots: [{ id, n, c, a, s?, note?, price?, v? }] }
//   → { matches: [{ id, why }] }  (best first, at most 20)
// Vibe search: Claude reads the user's OWN saved spots (name, category, neighborhood, street, note, price,
// visited) and picks the ones that fit a plain-language request. No web search: it only ranks what's saved.
// Only signed-in users of this app can call it.

const { cors, send, requireUser, readJson, cityFor } = require('./_shared');
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const PRICES = ['', '$', '$$', '$$$', '$$$$'];

const TOOL = {
  name: 'pick_spots',
  description: 'Record which of the saved spots fit the request, best match first.',
  input_schema: {
    type: 'object',
    properties: {
      matches: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            n: { type: 'integer', description: 'The spot’s number from the list.' },
            why: { type: 'string', description: 'Why it fits, in at most 8 words, Title Case Each Word. Base it on what the list says or what the place is widely known for.' }
          },
          required: ['n', 'why']
        }
      }
    },
    required: ['matches']
  }
};

const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  if (!process.env.ANTHROPIC_API_KEY) return send(res, 503, { error: 'AI Isn’t Set Up Yet — Add ANTHROPIC_API_KEY In Vercel.' });
  if (!(await requireUser(req, res))) return;
  let body; try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
  const q = clip(body.q, 160);
  if (q.length < 2) return send(res, 400, { error: 'Type What You’re In The Mood For.' });
  const spots = (Array.isArray(body.spots) ? body.spots : []).slice(0, 500).filter(s => s && s.id && s.n);
  if (!spots.length) return send(res, 200, { matches: [] });
  const city = cityFor(body.city);

  const list = spots.map((s, i) => [i + 1 + '. ' + clip(s.n, 80), clip(s.c, 40), clip(s.a, 40), clip(s.s, 60), PRICES[s.price] || '', s.v ? 'visited' : '', clip(s.note, 220)].filter(Boolean).join(' | ')).join('\n');
  const prompt = `Someone is choosing where to go in ${city.name} from their own list of saved places. They asked for:
"${q}"

Their saved places (number. name | category | neighborhood | street | price | visited | their note):
${list}

Pick the saved places that genuinely fit the request. Read it as a vibe, not keywords: "cozy", "date night", "good for working", "non touristy", "open late", "cheap eats", a cuisine, a neighborhood or an occasion all count. Use the category, neighborhood, note and what you know about the real place.
- Only pick from the list, by number. Never invent places.
- Best match first, at most 20. Leave out weak matches; an empty list is fine if nothing fits.
- If they name a neighborhood or area, only pick places in or right next to it.
Call pick_spots with your picks.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, tools: [TOOL], tool_choice: { type: 'tool', name: 'pick_spots' }, messages: [{ role: 'user', content: prompt }] })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return send(res, 502, { error: 'Vibe Search Didn’t Work Right Now — ' + ((j.error && j.error.message) || 'Try Again') });
    const use = (j.content || []).find(b => b.type === 'tool_use' && b.name === 'pick_spots');
    const seen = new Set(), matches = [];
    for (const m of ((use && use.input && use.input.matches) || [])) {
      const s = spots[(m.n | 0) - 1];
      if (!s || seen.has(s.id)) continue; seen.add(s.id);
      matches.push({ id: String(s.id), why: clip(m.why, 60) });
      if (matches.length >= 20) break;
    }
    return send(res, 200, { matches });
  } catch (e) {
    return send(res, 502, { error: 'Vibe Search Didn’t Work Right Now — Try Again.' });
  }
};
