// POST /api/delete-account — permanently deletes the signed-in person's account.
// Apple requires apps with sign-up to offer this inside the app.
// Deleting the auth user removes their map (nyc_list), the lists they own (nyc_trips) and their
// list memberships (nyc_trip_members) through the tables' "on delete cascade" links.
//
// Vercel environment variable (required for this endpoint):
//   SUPABASE_SERVICE_ROLE_KEY — Supabase → Project Settings → API Keys → secret / service_role key.
//   Keep it only in Vercel; never put it in the app's code.

const { cors, send, requireUser } = require('./_shared');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://octgaltlmqwcqewbxocb.supabase.co';

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return send(res, 503, { error: 'Account Deletion Isn’t Set Up Yet. Email kwokshulum@gmail.com And It’ll Be Done By Hand.' });
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    // Remove their profile photo first (supabase/avatars.sql); a missing photo is fine.
    await fetch(SUPABASE_URL + '/storage/v1/object/avatars/' + encodeURIComponent(user.id) + '/avatar.jpg', {
      method: 'DELETE', headers: { apikey: key, authorization: 'Bearer ' + key }
    }).catch(() => {});
    const r = await fetch(SUPABASE_URL + '/auth/v1/admin/users/' + encodeURIComponent(user.id), {
      method: 'DELETE', headers: { apikey: key, authorization: 'Bearer ' + key }
    });
    if (!r.ok) return send(res, 502, { error: 'Couldn’t Delete The Account Right Now. Try Again In A Minute.' });
    send(res, 200, { ok: true });
  } catch (e) {
    send(res, 502, { error: 'Couldn’t Delete The Account Right Now. Try Again In A Minute.' });
  }
};
