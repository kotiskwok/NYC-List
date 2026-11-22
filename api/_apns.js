// Apple push notifications (APNs) over HTTP/2, shared by account.js (list notifications) and extract.js (share banners).
// Vercel: APNS_KEY_ID, APNS_PRIVATE_KEY, and APNS_TEAM_ID or MAPKIT_TEAM_ID.
const crypto = require('crypto');
const http2 = require('http2');
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


// Send to production first, then retry tokens Apple calls bad on the sandbox (builds run from Xcode).
async function apnsSendAll(tokens, payload, collapse) {
  const jwt = apnsJwt(); if (!jwt || !tokens.length) return [];
  let results = await apnsSend('api.push.apple.com', jwt, tokens, payload, collapse);
  const sandbox = results.filter(r => r.reason === 'BadDeviceToken').map(r => r.token);
  if (sandbox.length) results = results.filter(r => r.reason !== 'BadDeviceToken').concat(await apnsSend('api.sandbox.push.apple.com', jwt, sandbox, payload, collapse));
  return results;
}

module.exports = { apnsJwt, apnsSend, apnsSendAll };
