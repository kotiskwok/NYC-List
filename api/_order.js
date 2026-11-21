// POST /api/booking  { kind: 'order', name, address?, area?, city, cat?, note? }   (shares booking.js: Vercel's plan allows 12 functions)
//   → { items: ['Vodka Pizza', 'Calzone'] }   (empty when nothing reliable was found)
// What to order at a spot: Claude searches the web (reviews, food guides, the place's own menu) for the dishes,
// drinks or products people single out, and returns up to 4 short names. Used by the place card's
// "Find What To Order" button for spots saved before the AI started noting dishes from posts.
// Only signed-in users of this app can call it. Costs a few cents, so the app calls it on a tap and saves the answer.

const { send, cityFor } = require('./_shared');
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

const TOOL = {
  name: 'what_to_order',
  description: 'Record what people say you should order or get at this place.',
  input_schema: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { type: 'string' }, description: 'Up to 4 specific dishes, drinks or products this exact place is known for, most recommended first. Short names in Title Case (e.g. "Vodka Pizza", "Pistachio Croissant"). Empty if you found nothing specific.' }
    },
    required: ['items']
  }
};

// Called from booking.js after it has checked the sign-in and read the body.
module.exports = async (res, body) => {
  const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  body = { name: clip(body.name, 100), address: clip(body.address, 120), area: clip(body.area, 60), cat: clip(body.cat, 40), note: clip(body.note, 400), city: body.city };
  if (body.name.length < 2) return send(res, 400, { error: 'Missing the spot’s name.' });
  const city = cityFor(body.city);

  const prompt = `What should someone order or get at this place?
${body.name}${body.address ? ', ' + body.address : ''}${body.area ? ' (' + body.area + ')' : ''}, ${city.name}${body.cat ? '\nKind of place: ' + body.cat : ''}${body.note ? '\nThe saver’s own notes: ' + body.note : ''}

Search the web (reviews, food guides, its menu or website) for the specific dishes, drinks or products people single out at THIS place and location.
Rules:
- Only items you actually found recommended for this place. Never guess from the kind of place.
- Specific items ("Vodka Pizza", "Ube Croissant"), not general praise ("the pastries").
- If you can't find anything specific, return an empty list.
Call what_to_order with the result.`;

  try {
    const messages = [{ role: 'user', content: prompt }];
    let out = null;
    for (let turn = 0; turn < 3 && !out; turn++) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 1000, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }, TOOL], messages })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return send(res, 502, { error: 'Couldn’t look it up right now. Try again?' });
      const use = (j.content || []).find(b => b.type === 'tool_use' && b.name === 'what_to_order');
      if (use) { out = use.input; break; }
      if (j.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: j.content }); continue; }
      messages.push({ role: 'assistant', content: j.content }, { role: 'user', content: 'Now call what_to_order (an empty list if you found nothing specific).' });
    }
    const items = (out && Array.isArray(out.items) ? out.items : []).map(x => clip(x, 40)).filter(x => x.length > 1).slice(0, 4);
    return send(res, 200, { items });
  } catch (e) {
    return send(res, 502, { error: 'Couldn’t look it up right now. Try again?' });
  }
};
