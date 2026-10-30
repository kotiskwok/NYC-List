// Copies the website (the folder above) into www/, which Capacitor bundles into the iPhone app.
// The /api server functions stay on Vercel; the app calls them at NYC_CONFIG.siteUrl.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), site = join(here, '..', '..'), out = join(here, '..', 'www');
rmSync(out, { recursive: true, force: true }); mkdirSync(out);
for (const f of ['index.html', 'config.js', 'manifest.webmanifest', 'privacy.html', 'support.html', 'src', 'vendor', 'data', 'icons']) cpSync(join(site, f), join(out, f), { recursive: true });
console.log('Copied the website into native/www');
