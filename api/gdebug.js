// TEMPORARY diagnostic: shows what the server sees when following a maps.app.goo.gl link. Will be removed.
module.exports = async (req, res) => {
  const u = String((req.query && req.query.u) || '');
  if (!/^https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+(\?[\w=&]*)?$/.test(u)) { res.statusCode = 400; return res.end('only maps.app.goo.gl'); }
  const bare = u.split('?')[0];
  const uas = { none: null, curl: 'curl/8.5.0', fb: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', bot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' };
  const out = [];
  for (const [k, ua] of Object.entries(uas)) for (const url of [u, bare]) {
    try {
      const r = await fetch(url, { redirect: 'manual', headers: ua ? { 'user-agent': ua } : {} });
      const loc = r.headers.get('location'); let hits = null;
      if (!loc) { const t = await r.text(); hits = [...new Set((t.match(/https?:(?:\\\/|\/){2}(?:www\.)?google\.[a-z.]+(?:\\\/|\/)maps[^"'\s<]{0,300}/g) || []))].slice(0, 3); }
      out.push({ ua: k, url, status: r.status, loc: loc && loc.slice(0, 250), hits });
    } catch (e) { out.push({ ua: k, url, error: String(e) }); }
  }
  res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(out, null, 1));
};
