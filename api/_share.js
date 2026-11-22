// POST /api/extract { share_key, url } from the iPhone's share sheet ("Share → Spotted In"), with no sign-in:
//   1. nyc_share_start() (supabase/share.sql) checks the phone's share key and returns the person's map, homes,
//      categories and phones, and starts a job.
//   2. The post is read exactly like Add A Spot does (extractCore in extract.js).
//   3. Their phones get "Spotted Lucali On The Map!!" · "Carroll Gardens · 18 min." · "Get the vodka pizza." with the
//      spot's photo (the Notification Service extension downloads it) and Plan It / Undo when pressed and held.
//   4. nyc_share_finish() saves the places on the job; the app adds them to the map the next time it opens.
// If anything fails, the job is marked failed and the app falls back to opening Add A Spot with the link, as before.
const { send, CITIES } = require('./_shared');
const { apnsSendAll } = require('./_apns');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://octgaltlmqwcqewbxocb.supabase.co';
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg';
const SITE = 'https://nyc-lovat.vercel.app';

const rpc = (name, args) => fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, { method: 'POST',
  headers: { apikey: ANON, authorization: 'Bearer ' + ANON, 'content-type': 'application/json' }, body: JSON.stringify(args) });

const km = (a, b) => { const R = 6371, t = x => x * Math.PI / 180, dLa = t(b[0] - a[0]), dLo = t(b[1] - a[1]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(t(a[0])) * Math.cos(t(b[0])) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
// A rough door-to-door time from home: walking when close, transit in the cities, driving on the state maps.
// The app shows its own station-by-station estimate on the place card; this is only for the notification.
function travel(home, p, city) {
  if (!home || !isFinite(home.lat) || !isFinite(p.lat)) return '';
  const d = km([+home.lat, +home.lng], [+p.lat, +p.lng]);
  const m = d < 1.1 ? d * 1.25 / 4.8 * 60 : (CITIES[city] && CITIES[city].state) ? 6 + d * 1.25 / 50 * 60 : 9 + d * 1.3 / 24 * 60;
  const r = Math.max(1, Math.round(m));
  return r < 60 ? r + ' min' : Math.floor(r / 60) + ' hr' + (r % 60 >= 5 ? ' ' + (r % 60) + ' min' : '');
}
const photoUrl = (p, city) => SITE + '/api/photo?q=' + encodeURIComponent([p.name, p.address || p.neighborhood, (CITIES[city] || CITIES.nyc).name].filter(Boolean).join(', '))
  + '&ll=' + (+p.lat).toFixed(5) + ',' + (+p.lng).toFixed(5) + '&v=2&app=ios';

module.exports = async (req, res, body, extractCore) => {
  const key = String(body.share_key || ''), url = String(body.url || '').trim();
  if (!/^[a-f0-9]{48,128}$/.test(key) || !/^https?:\/\//i.test(url) || url.length > 2000) return send(res, 400, { error: 'Bad request.' });
  const st = await rpc('nyc_share_start', { k: key, link: url }).catch(() => null);
  const rows = st && st.ok ? await st.json().catch(() => null) : null, info = Array.isArray(rows) ? rows[0] : rows;
  if (!info || !info.job) return send(res, 403, { error: 'Not allowed.' });
  const tokens = Array.isArray(info.tokens) ? info.tokens.filter(Boolean) : [];
  const cats = (Array.isArray(info.cats) ? info.cats : []).filter(c => c && c.id && c.name).map(c => ({ id: c.id, name: c.name }));
  const finish = (status, result) => rpc('nyc_share_finish', { k: key, job: info.job, st: status, res: result }).catch(() => {});

  let status = 500, json = null;
  try { [status, json] = await extractCore({ url, categories: cats, city: CITIES[info.city] ? info.city : 'nyc' }); } catch (e) {}
  const places = (json && Array.isArray(json.places) ? json.places : []).filter(p => p && p.name && isFinite(p.lat) && isFinite(p.lng));
  if (status !== 200 || !places.length) {
    await finish('failed', { message: (json && (json.message || json.error)) || '' });
    // The app still has the link and opens Add A Spot with it; just say so.
    await apnsSendAll(tokens, { aps: { alert: { title: 'Couldn’t Spot A Place In That', body: 'Open Spotted In to add it yourself.' }, sound: 'default', 'thread-id': 'share' }, job: info.job }, 'share-' + info.job).catch(() => {});
    return send(res, 200, { ok: false, job: info.job });
  }

  const city = json.city || info.city || 'nyc';
  const home = city === 'nyc' ? info.home : (info.cities && info.cities[city] && info.cities[city].home) || null;
  const p = places[0];
  let title, text;
  if (places.length === 1) {
    title = 'Spotted ' + p.name + ' On The Map!!';
    const where = [p.neighborhood || '', travel(home, p, city)].filter(Boolean).join(' · ');
    const dish = Array.isArray(p.must_order) && p.must_order[0] ? 'Get the ' + String(p.must_order[0]).toLowerCase() + '.' : '';
    text = [where ? where + '.' : 'From ' + (json.source === 'tiktok' ? 'TikTok' : json.source === 'instagram' ? 'Instagram' : 'the post') + '.', dish].filter(Boolean).join('\n');
  } else {
    title = 'Spotted ' + places.length + ' Spots On The Map!!';
    text = places.length === 2 ? places[0].name + ' and ' + places[1].name + '.' : places[0].name + ', ' + places[1].name + ' and ' + (places.length - 2) + ' more.';
  }
  await finish('done', { places, city, source: json.source || '', title, text });
  const payload = { aps: { alert: { title, body: text }, sound: 'default', 'thread-id': 'share', category: places.length === 1 ? 'SPOTTED' : 'SPOTTED_MANY', 'mutable-content': 1 },
    job: info.job, ...(places.length === 1 ? { photo: photoUrl(p, city) } : {}) };
  await apnsSendAll(tokens, payload, 'share-' + info.job).catch(() => {});
  send(res, 200, { ok: true, job: info.job, places: places.length });
};
