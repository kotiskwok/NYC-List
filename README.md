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
| `api/extract.js` | Server function that reads a TikTok / Instagram / Threads post (caption, cover, TikTok's spoken captions) and asks Claude which places it mentions |
| `api/transcribe.js` | Server function that turns a video's audio into text (OpenAI speech-to-text) |
| `src/video.js` | Pulls the audio and a few frames out of a video on the phone, so only small pieces are uploaded |
| `config.js` | Your Supabase URL and anon key |
| `data/` | NYC neighborhoods, streets and subway stations |
| `vendor/` | React, htm, Leaflet and supabase-js, kept locally so the app works offline |
| `supabase/schema.sql` | The database table and its security rules |
| `supabase/lists.sql` | Tables and rules for shared lists (the Lists tab) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Home-screen install and offline support |

## One-time setup

### 1. Supabase (the database)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**. Do the same with `supabase/lists.sql` for the Lists tab.
   - To let friends join a shared list, **Authentication → Sign In / Providers → Allow new users to sign up** must be on.
3. Go to **Project Settings → API** (or click **Connect**). Copy the **Project URL** and the **publishable** key into `config.js` (already done for this project). This key is safe to commit, because the security rules only let each signed-in person see their own list.
4. After the Vercel site is live, go to **Authentication → URL Configuration**. Set **Site URL** to your Vercel address so the confirmation email links back to the app.

### 2. Vercel (the website)
1. Go to [vercel.com/new](https://vercel.com/new) and import the `nyc-list` repo.
2. Leave **Framework Preset** as **Other**, with no build command, and click **Deploy**.
3. From now on, every push to `main` redeploys automatically.

### 3. AI fill from links
1. Create an API key at [console.anthropic.com](https://console.anthropic.com) (**Settings → API Keys**) and add a little credit under **Billing**. Each link costs a fraction of a cent.
2. In Vercel, open the project and go to **Settings → Environment Variables**. Add `ANTHROPIC_API_KEY` with that key, then **Redeploy**.
3. In the app, paste a TikTok, Instagram or Threads link into **Add A Spot**. The app reads the caption and cover image, then fills in the name, category, neighborhood, address, price and notes, and pins the place. If a post lists several places, pick one or tap **Add All**.
- **What's said out loud:** for TikTok links, the app uses TikTok's own automatic captions when the video has them, with no extra setup.
- **🎬 From A Video:** for any platform, save the video to your phone and pick it. The app pulls out the soundtrack and three still frames on the phone itself, so the full video is never uploaded. A speech-to-text service turns the audio into words, and the AI reads those plus any place names shown on screen. This needs a second key: create one at [platform.openai.com](https://platform.openai.com/api-keys), add a little credit, and add `OPENAI_API_KEY` in Vercel's Environment Variables, then redeploy. A 1-minute video costs well under a cent. Videos are listened to up to 10 minutes.
- Only signed-in users can use it, so nobody else can spend your API credit.

### 4. Your account
1. Open the site and tap **New Here? Create An Account**.
2. Confirm your email from the link Supabase sends, then sign in.
3. To make it a private app, turn off **Authentication → Sign In / Providers → Allow new users to sign up** in Supabase once your account exists.

### 5. Put it on your phone
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
