// POST /api/find  { q, categories:[{id,name}], neighborhoods?:[string] }
// Looks a place name up on the web (Claude + web search) when the free map search has no match,
// and returns matching NYC places in the same shape as /api/extract.
// Only signed-in users of this app can call it. Costs a few cents per call, so the app only calls it on a tap.

const { cors, send, requireUser, readJson } = require('./_shared');
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

const TOOL = {
  name: 'save_places',
  description: 'Record the NYC places that match the name the user typed.',
  input_schema: {
    type: 'object',
    properties: {
      places: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The place’s proper business name. No emojis.' },
            category_id: { type: ['string', 'null'], description: 'Best-matching id from the provided category list, or null if none fits.' },
            neighborhood: { type: ['string', 'null'], description: 'NYC neighborhood, e.g. "Midtown East".' },
            address: { type: ['string', 'null'], description: 'Street address, street part only, e.g. "4 E 43rd St".' },
            price: { type: ['integer', 'null'], description: 'Restaurants/bars only: 1=$ (under $20), 2=$$ ($20-40), 3=$$$ ($40-80), 4=$$$$ ($80+) per person. Null if unknown.' },
            note: { type: 'string', description: 'One short line on what it is known for. Title Case Each Word. Empty if unknown.' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
          },
          required: ['name', 'category_id', 'neighborhood', 'address', 'price', 'note', 'confidence']
        }
      }
    },
    required: ['places']
  }
};

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  if (!process.env.ANTHROPIC_API_KEY) return send(res, 503, { error: 'AI Isn’t Set Up Yet — Add ANTHROPIC_API_KEY In Vercel.' });
  if (!(await requireUser(req, res))) return;
  let body; try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
  const q = String(body.q || '').trim().slice(0, 120);
  if (q.length < 2) return send(res, 400, { error: 'Type A Place Name First.' });
  const cats = (body.categories || []).map(c => `- ${c.id}: ${c.name}`).join('\n');
  const hoods = (body.neighborhoods || []).slice(0, 400).join(', ');

  const prompt = `Someone is saving a place to their personal New York City "places to visit" map and typed this name: "${q}"

Search the web to find the real NYC place(s) with this name (restaurants, cafes, bakeries, bars, shops, markets and similar). The name may be partial or slightly misspelled.

Category list (use these ids for category_id):
${cats}

Neighborhood names the app knows (prefer one of these spellings): ${hoods}

Rules:
- Only places in the five boroughs of New York City that are open (or not known to be closed).
- Give the street address you found (street part only). Don't guess an address you didn't find.
- At most 5 places, best match first. If nothing in NYC matches, return an empty list.
When you are done, call save_places.`;

  try {
    const messages = [{ role: 'user', content: prompt }];
    let out = null;
    for (let turn = 0; turn < 3 && !out; turn++) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 2000, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }, TOOL], messages })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return send(res, 502, { error: 'Web Search Didn’t Work Right Now — ' + ((j.error && j.error.message) || 'Try Again') });
      const use = (j.content || []).find(b => b.type === 'tool_use' && b.name === 'save_places');
      if (use) { out = use.input; break; }
      if (j.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: j.content }); continue; }
      // Finished with text only: ask it to record what it found.
      messages.push({ role: 'assistant', content: j.content }, { role: 'user', content: 'Now call save_places with what you found (an empty list if nothing).' });
    }
    const places = ((out && out.places) || []).filter(p => p && p.name).slice(0, 5);
    return send(res, 200, { places, message: places.length ? '' : 'Couldn’t Find "' + q + '" In NYC. Try Pasting Its Google Maps Link.' });
  } catch (e) {
    return send(res, 502, { error: 'Web Search Didn’t Work Right Now — Try Again.' });
  }
};
