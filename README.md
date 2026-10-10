# My NYC List

A personal map of NYC restaurants, cafes, bakeries and cute shops saved from TikTok, Instagram and Threads, with an Explore filter, a day-route planner and subway-aware "Get There" estimates. It installs on a phone like an app, and your list syncs between devices through Supabase.

It's a plain static site with no build step. Vercel serves the files as they are.

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | Page shell, styles, and script loading order |
| `src/runtime.js` | Small base class the app logic is written against, plus link handling |
| `src/logic.js` | All app behavior: maps, filters, routing estimates, plan ordering, forms |
| `src/view.js` | Every screen, written with React + htm (no JSX build) |
| `src/sync.js` | Supabase sign-in and cloud sync, with offline merge |
| `config.js` | Your Supabase URL and anon key |
| `data/` | NYC neighborhoods, streets and subway stations |
| `vendor/` | React, htm, Leaflet and supabase-js, kept locally so the app works offline |
| `supabase/schema.sql` | The database table and its security rules |
| `sw.js`, `manifest.webmanifest`, `icons/` | Home-screen install and offline support |

## One-time setup

### 1. Supabase (the database)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**.
3. Go to **Project Settings → API** (or click **Connect**). Copy the **Project URL** and the **anon / publishable** key into `config.js`. This key is safe to commit, because the security rules only let each signed-in person see their own list.
4. After the Vercel site is live, go to **Authentication → URL Configuration**. Set **Site URL** to your Vercel address so the confirmation email links back to the app.

### 2. Vercel (the website)
1. Go to [vercel.com/new](https://vercel.com/new) and import the `nyc-list` repo.
2. Leave **Framework Preset** as **Other**, with no build command, and click **Deploy**.
3. From now on, every push to `main` redeploys automatically.

### 3. Your account
1. Open the site and tap **New Here? Create An Account**.
2. Confirm your email from the link Supabase sends, then sign in.
3. To make it a private app, turn off **Authentication → Sign In / Providers → Allow new users to sign up** in Supabase once your account exists.

### 4. Put it on your phone
- **iPhone:** open the site in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** open it in Chrome, tap **⋮**, then **Add to Home screen** (or **Install app**).

## How sync works
- Every change saves on the phone right away, then reaches Supabase about a second later. The dot next to the spot count turns green when everything is saved.
- When the app comes back to the foreground, it pulls changes made on your other devices.
- Edits made with no signal (on the subway, say) are kept and merged with the cloud copy when you reconnect. A spot added on one device and a different spot added on another both survive.
- If `config.js` is left empty, the app skips sign-in and stores everything on that one device.

## Running it locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000.
