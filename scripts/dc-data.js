// One-off: pulls DC Metro stations (by line) and neighborhoods (with their county/city) from OpenStreetMap into data/dc-raw.json.
const fs = require('fs');
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const B = '38.70,-77.55,39.15,-76.80';
const Q = {
  lines: `[out:json][timeout:240];relation["route"~"^(subway|light_rail|tram)$"](${B});foreach->.x(.x out tags;node(r.x);out;);`,
  hoods: `[out:json][timeout:240];rel["boundary"="administrative"]["admin_level"~"^(4|6)$"](${B});map_to_area->.cs;foreach.cs->.c(.c out tags;node(area.c)["place"~"^(suburb|neighbourhood|quarter|town|city|village)$"](${B});out;);`
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(q) {
  for (let i = 0; i < 9; i++) {
    const u = MIRRORS[i % MIRRORS.length];
    try { const r = await fetch(u, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'spotted-in-builder' } });
      if (r.ok) return (await r.json()).elements; console.log(u, r.status); } catch (e) { console.log(u, e.message); }
    await sleep(15000);
  }
  throw new Error('overpass failed');
}
(async () => {
  const out = {};
  for (const k of Object.keys(Q)) { out[k] = await run(Q[k]); console.log(k, out[k].length); await sleep(5000); }
  try { const g = await fetch('https://gbfs.lyft.com/gbfs/2.3/dca-cabi/en/station_information.json'); out.bike = g.status + ' ' + (await g.text()).slice(0, 300); } catch (e) { out.bike = 'err ' + e.message; }
  fs.writeFileSync('data/dc-raw.json', JSON.stringify(out));
})();
