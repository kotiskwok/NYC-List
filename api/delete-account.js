// POST /api/delete-account — permanently deletes the signed-in person's account.
// Apple requires apps with sign-up to offer this inside the app.
//
// Works with the person's own sign-in, no secret key needed:
//   1. Removes their photos (profile photo, spot, list and review photos) from the `avatars` bucket.
//      Storage only lets people remove their own files (supabase/avatars.sql).
//   2. Calls nyc_delete_me() (supabase/delete-account.sql), which deletes their auth user. Every app table
//      cascades from it: their map, the lists they own, their list memberships, reviews, blocks and public map.
// If SUPABASE_SERVICE_ROLE_KEY happens to be set in Vercel and the function is missing, it falls back to the admin API.
const { cors, send, requireUser } = require('./_shared');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://octgaltlmqwcqewbxocb.supabase.co';
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg';
const FAIL = 'Couldn’t delete the account right now. Try again in a minute?';

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  const user = await requireUser(req, res);
  if (!user) return;
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const as = (extra) => ({ apikey: ANON, authorization: 'Bearer ' + token, ...(extra || {}) });
  try {
    // 1. Their photos: everything under <user id>/ in the avatars bucket. A missing photo is fine.
    try {
      const l = await fetch(SUPABASE_URL + '/storage/v1/object/list/avatars', { method: 'POST', headers: as({ 'content-type': 'application/json' }),
        body: JSON.stringify({ prefix: user.id + '/', limit: 1000, offset: 0 }) });
      const files = l.ok ? await l.json() : [];
      const names = (Array.isArray(files) ? files : []).filter(f => f && f.name && f.id).map(f => user.id + '/' + f.name);
      if (names.length) await fetch(SUPABASE_URL + '/storage/v1/object/avatars', { method: 'DELETE', headers: as({ 'content-type': 'application/json' }), body: JSON.stringify({ prefixes: names }) });
    } catch (e) {}

    // 2. The account itself, which takes everything else with it.
    const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/nyc_delete_me', { method: 'POST', headers: as({ 'content-type': 'application/json' }), body: '{}' });
    if (r.ok) return send(res, 200, { ok: true });

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (key) {
      const a = await fetch(SUPABASE_URL + '/auth/v1/admin/users/' + encodeURIComponent(user.id), { method: 'DELETE', headers: { apikey: key, authorization: 'Bearer ' + key } });
      if (a.ok) return send(res, 200, { ok: true });
    }
    if (r.status === 404) return send(res, 503, { error: 'Account deletion needs one setup step. Email kwokshulum@gmail.com and it’ll be done by hand.' });
    return send(res, 502, { error: FAIL });
  } catch (e) {
    return send(res, 502, { error: FAIL });
  }
};
