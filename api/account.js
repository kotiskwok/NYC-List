// POST /api/account  Account things that need the server, in one function (Vercel's plan allows 12).
//   ?do=delete (also reached at /api/delete-account by a vercel.json rewrite) → Delete My Account, see _delete.js.
//   { action: 'notify', trip, names: ['Lucali', …], day? } → tells everyone else on a shared list, with an iPhone
//      notification, that you added spots: "Sonia added Lucali to Day 1". Uses only the caller's own sign-in:
//      nyc_push_targets() (supabase/push.sql) hands back the other members' phones, and only for a list the caller is on.
//
// Vercel environment variables for notifications (from developer.apple.com → Keys → + → Apple Push Notifications service):
//   APNS_KEY_ID        the key's 10-character Key ID
//   APNS_PRIVATE_KEY   the whole text of the downloaded AuthKey_XXXXXXXXXX.p8 file
//   APNS_TEAM_ID       optional; defaults to MAPKIT_TEAM_ID (the same Apple team)
// Without them, notify answers { sent: 0, reason: 'setup' } and nothing else changes.
const crypto = require('crypto');
const http2 = require('http2');
const { cors, send, requireUser, readJson } = require('./_shared');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://octgaltlmqwcqewbxocb.supabase.co';
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg';
const TOPIC = process.env.APNS_TOPIC || 'com.kotiskwok.nyclist';

const b64 = x => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url');
// Rebuild the .p8 text whatever happened to it on the way into Vercel (same as mapkit-token.js).
function pem(raw) {
  const body = String(raw || '').replace(/\\n/g, '\n').replace(/^["']|["']$/g, '')
    .replace(/-----(BEGIN|END)[A-Z ]*-----/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
  return '-----BEGIN PRIVATE KEY-----\n' + body.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n';
}
// Apple accepts the same token for up to an hour; keep one while the function stays warm.
let jwtCache = null;
function apnsJwt() {
  const kid = (process.env.APNS_KEY_ID || '').trim(), team = (process.env.APNS_TEAM_ID || process.env.MAPKIT_TEAM_ID || '').trim(), raw = process.env.APNS_PRIVATE_KEY;
  if (!kid || !team || !raw) return null;
  const now = Math.floor(Date.now() / 1000);
  if (jwtCache && now - jwtCache.at < 2400) return jwtCache.jwt;
  const data = b64({ alg: 'ES256', kid }) + '.' + b64({ iss: team, iat: now });
  const sig = crypto.sign('sha256', Buffer.from(data), { key: pem(raw), dsaEncoding: 'ieee-p1363' }).toString('base64url');
  jwtCache = { at: now, jwt: data + '.' + sig };
  return jwtCache.jwt;
}

// Send one notification to each token over a single HTTP/2 connection. Resolves [{ token, status, reason }].
function apnsSend(host, jwt, tokens, payload, collapse) {
  return new Promise(resolve => {
    const out = []; let left = tokens.length, done = false;
    const finish = () => { if (done) return; done = true; try { c.close(); } catch (e) {} resolve(out); };
    const c = http2.connect('https://' + host);
    c.on('error', () => finish());
    const timer = setTimeout(finish, 9000);
    tokens.forEach(token => {
      const r = c.request({ ':method': 'POST', ':path': '/3/device/' + token, authorization: 'bearer ' + jwt, 'apns-topic': TOPIC,
        'apns-push-type': 'alert', 'apns-priority': '10', 'apns-collapse-id': collapse, 'content-type': 'application/json' });
      let status = 0, body = '';
      r.on('response', h => { status = h[':status']; });
      r.on('data', d => { body += d; });
      const end = () => { let reason = ''; try { reason = JSON.parse(body).reason || ''; } catch (e) {}
        out.push({ token, status, reason }); if (--left === 0) { clearTimeout(timer); finish(); } };
      r.on('end', end); r.on('error', end);
      r.end(JSON.stringify(payload));
    });
  });
}

const rpc = (name, args, token) => fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, { method: 'POST',
  headers: { apikey: ANON, authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: JSON.stringify(args) });

async function notify(req, res, user, body) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const trip = String(body.trip || '');
  if (!/^[0-9a-f-]{36}$/i.test(trip)) return send(res, 400, { error: 'Missing the list.' });
  const names = (Array.isArray(body.names) ? body.names : []).map(n => String(n || '').replace(/\s+/g, ' ').trim().slice(0, 60)).filter(Boolean).slice(0, 20);
  if (!names.length) return send(res, 200, { sent: 0 });
  const jwt = apnsJwt();
  if (!jwt) return send(res, 200, { sent: 0, reason: 'setup' });

  const t = await rpc('nyc_push_targets', { trip }, token);
  const rows = t.ok ? await t.json() : [];
  const phones = (Array.isArray(rows) ? rows : []).filter(r => r && r.token && (r.platform || 'ios') === 'ios');
  if (!phones.length) return send(res, 200, { sent: 0 });

  const who = String((user.user_metadata && user.user_metadata.name) || 'A friend').trim().split(/\s+/)[0] || 'A friend';
  const list = String(phones[0].trip_name || 'your list');
  const day = Number(body.day) > 0 ? 'Day ' + Math.floor(Number(body.day)) : '';
  const what = names.length === 1 ? names[0] : names.length === 2 ? names[0] + ' and ' + names[1] : names[0] + ', ' + names[1] + ' and ' + (names.length - 2) + ' more';
  const payload = { aps: { alert: { title: list, body: who + ' added ' + what + (day ? ' to ' + day : '') + '.' }, sound: 'default', 'thread-id': 'list-' + trip }, trip };

  const tokens = [...new Set(phones.map(p => p.token))];
  let results = await apnsSend('api.push.apple.com', jwt, tokens, payload, ('list-' + trip).slice(0, 64));
  // Phones running a build from Xcode use Apple's sandbox; try those there.
  const sandbox = results.filter(r => r.reason === 'BadDeviceToken').map(r => r.token);
  if (sandbox.length) {
    const again = await apnsSend('api.sandbox.push.apple.com', jwt, sandbox, payload, ('list-' + trip).slice(0, 64));
    results = results.filter(r => r.reason !== 'BadDeviceToken').concat(again);
  }
  // Forget phones Apple says are gone (app deleted or notifications reset).
  await Promise.all(results.filter(r => r.status === 410 || r.reason === 'BadDeviceToken' || r.reason === 'Unregistered')
    .map(r => rpc('nyc_drop_push_token', { t: r.token, trip }, token).catch(() => {})));
  send(res, 200, { sent: results.filter(r => r.status === 200).length });
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  const user = await requireUser(req, res);
  if (!user) return;
  const url = new URL(req.url, 'http://x');
  if (url.searchParams.get('do') === 'delete') return require('./_delete')(req, res, user);
  let body; try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
  if (body && body.action === 'delete') return require('./_delete')(req, res, user);
  if (body && body.action === 'notify') {
    try { return await notify(req, res, user, body); } catch (e) { return send(res, 200, { sent: 0, reason: 'error' }); }
  }
  send(res, 400, { error: 'Unknown action.' });
};
