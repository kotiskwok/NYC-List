// GET /api/mapkit-token → { token }  A short-lived token that lets the app show Apple Maps (MapKit JS).
//
// Vercel environment variables (from developer.apple.com → Certificates, IDs & Profiles → Keys,
// a key with "MapKit JS" turned on):
//   MAPKIT_TEAM_ID      your 10-character Team ID (top right of the developer site)
//   MAPKIT_KEY_ID       the key's 10-character Key ID
//   MAPKIT_PRIVATE_KEY  the whole text of the downloaded AuthKey_XXXXXXXXXX.p8 file
// Without them this answers 503 and the app keeps its own map, drawn in Apple Maps colors.

const crypto = require('crypto');
const { cors, send } = require('./_shared');

const b64 = x => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url');
// Only hand out tokens to the app's own pages: the live site, its Vercel previews and the iPhone app.
const okHost = h => h === 'nyc-lovat.vercel.app' || /^nyc-[a-z0-9-]+-kotis1\.vercel\.app$/.test(h) || h === 'localhost' || h === '127.0.0.1';

// Rebuild the .p8 text whatever happened to it on the way into Vercel: line breaks turned into spaces or "\n",
// quotes around it, or only the middle part pasted.
function pem(raw) {
  const body = String(raw || '').replace(/\\n/g, '\n').replace(/^["']|["']$/g, '')
    .replace(/-----(BEGIN|END)[A-Z ]*-----/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
  return '-----BEGIN PRIVATE KEY-----\n' + body.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n';
}
// Safe hints about what's wrong with the key (never the key itself).
function keyHint(raw) {
  const t = String(raw || '');
  return { length: t.length, hasBegin: /BEGIN/.test(t), hasEnd: /END/.test(t), bodyChars: pem(t).replace(/-----[^-]+-----|\s/g, '').length };
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  const team = process.env.MAPKIT_TEAM_ID, kid = process.env.MAPKIT_KEY_ID, raw = process.env.MAPKIT_PRIVATE_KEY;
  if (!team || !kid || !raw) return send(res, 503, { error: 'Apple Maps Isn’t Set Up Yet.' });

  const origin = String(req.headers.origin || ''), ref = String(req.headers.referer || '');
  let host = '';
  try { host = new URL(origin && origin !== 'null' ? origin : ref).hostname; } catch (e) {}
  const app = /^(capacitor|ionic):\/\/localhost$/.test(origin);
  if (!app && !okHost(host)) return send(res, 403, { error: 'Not Allowed.' });

  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: team.trim(), iat: now, exp: now + 3600 };
  // Lock web tokens to the page that asked, so a copied token is useless elsewhere.
  if (!app && host && host !== 'localhost' && host !== '127.0.0.1') claims.origin = 'https://' + host;
  try {
    const data = b64({ alg: 'ES256', kid: kid.trim(), typ: 'JWT' }) + '.' + b64(claims);
    const sig = crypto.sign('sha256', Buffer.from(data), { key: pem(raw), dsaEncoding: 'ieee-p1363' }).toString('base64url');
    send(res, 200, { token: data + '.' + sig });
  } catch (e) {
    send(res, 500, { error: 'The Apple Maps Key Couldn’t Be Read. Check MAPKIT_PRIVATE_KEY.', hint: keyHint(raw), why: String(e && e.message || '').slice(0, 80) });
  }
};
