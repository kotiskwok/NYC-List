// TEMPORARY diagnostic: shows what the server sees when following a maps.app.goo.gl link. Will be removed.
module.exports = async (req, res) => {
  const u = String((req.query && req.query.u) || '');
  if (!/^https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+(\?[\w=&]*)?$/.test(u)) { res.statusCode = 400; return res.end('only maps.app.goo.gl'); }
  const out = []; let url = u;
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', 'accept-language': 'en-US,en;q=0.9' } });
      const loc = r.headers.get('location'); let body = '';
      if (!loc) body = (await r.text()).slice(0, 1500);
      out.push({ url: url.slice(0, 300), status: r.status, loc: loc && loc.slice(0, 300), body });
      if (!loc) break; url = new URL(loc, url).toString();
    } catch (e) { out.push({ url, error: String(e) }); break; }
  }
  res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ region: process.env.VERCEL_REGION, out }, null, 1));
};
