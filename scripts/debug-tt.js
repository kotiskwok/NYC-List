const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const UAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const out = []; const log = (...a) => out.push(a.join(' '));
(async () => {
  const short = 'https://www.tiktok.com/t/ZPLfvvD44/';
  for (const ua of [UA, UAD]) { const r = await fetch(short, { headers: { 'user-agent': ua }, redirect: 'follow' }); log('short', ua === UA ? 'iphone' : 'desktop', r.status, r.url.slice(0, 120)); }
  const full = 'https://www.tiktok.com/@allihollinger/video/7702567666904583438';
  const o = await fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(full), { headers: { 'user-agent': UA } }); const ot = await o.text(); log('oembed', o.status, ot.slice(0, 300));
  for (const ua of [UA, UAD]) {
    const p = await fetch(full, { headers: { 'user-agent': ua, 'accept-language': 'en-US' } }); const h = await p.text();
    const cookies = (p.headers.getSetCookie ? p.headers.getSetCookie() : []).map(c => c.split(';')[0]).join('; ');
    log('page', ua === UA ? 'iphone' : 'desktop', p.status, 'len', h.length, 'rehydration', h.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__'), 'cookies', cookies.length);
    const m = h.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) continue;
    let it; try { it = JSON.parse(m[1]).__DEFAULT_SCOPE__['webapp.video-detail'].itemInfo.itemStruct; } catch (e) { log('parse fail', e.message); continue; }
    const v = it.video || {}; log('desc', it.desc, 'dur', v.duration, 'play', !!v.playAddr, 'dl', !!v.downloadAddr, 'bitrates', (v.bitrateInfo || []).length);
    for (const u of [v.playAddr, v.downloadAddr, ((v.bitrateInfo || [])[0] || {}).PlayAddr && v.bitrateInfo[0].PlayAddr.UrlList[0]].filter(Boolean)) {
      const vr = await fetch(u, { headers: { 'user-agent': ua, referer: 'https://www.tiktok.com/', cookie: cookies, range: 'bytes=0-' } });
      const b = await vr.arrayBuffer(); log('  video', vr.status, vr.headers.get('content-type'), b.byteLength, u.slice(0, 60));
    }
  }
})().catch(e => log('ERR', e.stack)).finally(() => require('fs').writeFileSync('/tmp/out.txt', out.join('\n')));
