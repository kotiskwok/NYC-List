// Helpers shared by the API functions. Files starting with "_" are not deployed as routes.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://octgaltlmqwcqewbxocb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg';

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

// Only people signed in to this app (checked with Supabase) may use the paid AI services.
async function requireUser(req, res) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) { send(res, 401, { error: 'Sign In To Use AI Fill.' }); return null; }
  try {
    const u = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: SUPABASE_KEY, authorization: 'Bearer ' + token } });
    if (!u.ok) { send(res, 401, { error: 'Your Sign-In Expired — Sign In Again.' }); return null; }
    return await u.json();
  } catch (e) { send(res, 502, { error: 'Couldn’t Check Your Sign-In. Try Again.' }); return null; }
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

module.exports = { send, requireUser, readRaw, readJson };
