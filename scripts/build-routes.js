// Builds the non-NYC transit route layers from OpenStreetMap and saves them to data/routes/<city>-<kind>.json.
// Run by .github/workflows/routes.yml (monthly, on demand, and when this file changes): node scripts/build-routes.js
// Each layer takes ~30-60 s from the Overpass API, so layers run one after another with retries.
const fs = require('fs'), path = require('path');
const OSM = require('../api/_osmroutes');
const OUT = path.join(__dirname, '..', 'data', 'routes');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let failed = 0;
  for (const key of Object.keys(OSM.FILTER)) {
    const [city, kind] = key.split(':');
    let ok = false;
    for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
      const t0 = Date.now();
      try {
        const routes = await OSM.build(city, kind, { timeout: 180000 });
        const file = path.join(OUT, `${city}-${kind}.json`);
        fs.writeFileSync(file, JSON.stringify(routes));
        console.log(`${key}: ${routes.length} routes, ${Math.round(fs.statSync(file).size / 1024)} KB, ${Math.round((Date.now() - t0) / 1000)} s`);
        ok = true;
      } catch (e) {
        console.log(`${key}: attempt ${attempt} failed (${e.message})`);
        await sleep(30000 * attempt);
      }
    }
    if (!ok) failed++;
    await sleep(10000); // be gentle with the shared Overpass servers
  }
  if (failed) console.log(`${failed} layer(s) failed; existing files were kept.`);
})();
