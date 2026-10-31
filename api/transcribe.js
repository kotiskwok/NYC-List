// POST /api/transcribe   body: a WAV audio clip (the app cuts videos into ~2 minute pieces)
// Returns { text } — the spoken words, via OpenAI speech-to-text.
//
// Vercel environment variables:
//   OPENAI_API_KEY             (required) from platform.openai.com
//   OPENAI_TRANSCRIBE_MODEL    (optional) defaults to gpt-4o-mini-transcribe, falls back to whisper-1

const { cors, send, requireUser, readRaw, cityFor, localize } = require('./_shared');

const MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe';
const HINT = 'A short New York City food and shopping video. Expect names of restaurants, cafes, bakeries, bars, shops, streets and neighborhoods.';

async function transcribe(buf, model, hint) {
  const form = new FormData();
  form.append('file', new Blob([buf], { type: 'audio/wav' }), 'clip.wav');
  form.append('model', model);
  form.append('prompt', hint || HINT);
  form.append('response_format', 'json');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { authorization: 'Bearer ' + process.env.OPENAI_API_KEY }, body: form
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error((j.error && j.error.message) || ('Transcription failed (' + r.status + ')')); e.status = r.status; throw e; }
  return String(j.text || '').trim();
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  if (!process.env.OPENAI_API_KEY) return send(res, 503, { error: 'Listening To Videos Isn’t Set Up Yet — Add OPENAI_API_KEY In Vercel.' });
  if (!(await requireUser(req, res))) return;

  let buf;
  try { buf = await readRaw(req); } catch (e) { return send(res, 400, { error: 'Couldn’t Read The Audio.' }); }
  if (!buf || buf.length < 1000) return send(res, 400, { error: 'That Clip Has No Audio.' });

  try {
    let text;
    const hint = localize(HINT, cityFor(new URL(req.url, 'http://x').searchParams.get('city')));
    try { text = await transcribe(buf, MODEL, hint); }
    catch (e) { if (MODEL !== 'whisper-1' && (e.status === 400 || e.status === 404)) text = await transcribe(buf, 'whisper-1', hint); else throw e; }
    return send(res, 200, { text });
  } catch (e) {
    return send(res, 502, { error: 'Couldn’t Listen To The Video Right Now — ' + (e.message || 'Try Again') });
  }
};
