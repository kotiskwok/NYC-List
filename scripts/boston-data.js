// One-off: pulls Boston's T stations (by line) and neighborhoods (by city) from OpenStreetMap into data/boston-raw.json.
const fs = require('fs');
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const B = '42.18,-71.27,42.47,-70.92';
const Q = {
  lines: `[out:json][timeout:240];(relation["route"~"^(subway|light_rail|tram)$"]["network"~"MBTA"](${B});relation["route"="bus"]["network"~"MBTA"]["ref"~"^SL"](${B}););foreach->.x(.x out tags;node(r.x);out;);`,
  hoods: `[out:json][timeout:240];rel["boundary"="administrative"]["admin_level"="8"](${B});map_to_area->.cs;foreach.cs->.c(.c out tags;node(area.c)["place"~"^(suburb|neighbourhood|quarter|city|town)$"];out;);`
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
  fs.writeFileSync('data/boston-raw.json', JSON.stringify(out));
})();
