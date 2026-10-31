// One-off: what does Instagram's embed page give us for a post? (run by .github/workflows/debug-ig.yml)
const code = process.argv[2], kind = process.argv[3] || 'reel';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async () => {
  for (const k of [kind, 'p']) {
    const r = await fetch(`https://www.instagram.com/${k}/${code}/embed/captioned/`, { headers: { 'user-agent': UA, 'accept-language': 'en-US' } });
    const h = await r.text();
    console.log('==', k, r.status, 'len', h.length);
    const cap = (h.match(/<div class="Caption"[^>]*>([\s\S]*?)<div class="CaptionComments"/i) || h.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i) || [])[1];
    console.log('caption:', cap ? cap.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1500) : '(none)');
    const un = x => x.replace(/\\+\//g, '/').replace(/\\+u([0-9a-fA-F]{4})/g, (_, x) => String.fromCharCode(parseInt(x, 16))).replace(/&amp;/g, '&');
    console.log('is_video', (h.match(/is_video\\*"\s*:\s*(true|false)/) || [])[1], 'video_url', /video_url/.test(h), 'sidecar', h.includes('edge_sidecar_to_children'));
    const vu = (h.match(/video_url\\*"\s*:\s*\\*"(https:.*?)\\*"/) || [])[1]; if (vu) { const v = un(vu); console.log('video:', v.slice(0, 120)); const vr = await fetch(v, { headers: { 'user-agent': UA } }); console.log('video fetch', vr.status, vr.headers.get('content-type'), vr.headers.get('content-length')); }
    console.log('EmbeddedMediaImage', /EmbeddedMediaImage/.test(h), 'login wall', /loginForm|Log in to Instagram/i.test(h));
    const og = await fetch(`https://www.instagram.com/${k}/${code}/`, { headers: { 'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' } });
    const ot = await og.text(); console.log('og', og.status, ((ot.match(/property="og:description" content="([^"]*)"/) || [])[1] || '').slice(0, 600));
  }
})();
