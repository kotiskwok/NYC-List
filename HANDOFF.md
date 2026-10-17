# My NYC List: Project Handoff

Paste this whole file into a new Claude chat (or attach it with the project zip) to pick up where we left off.

---

## 1. What the app is

**My NYC List** is Kotis's personal map of New York City places to visit, such as restaurants, cafes, bakeries, gourmet groceries and cute shops, saved from TikTok, Instagram and Threads. It runs in a phone browser and installs to the home screen like an app (a PWA). The list syncs across devices through a database.

It was designed in **Claude Design** (project "NYC Exploration Spot Mapper", file `NYC List v2.dc.html`) and then rebuilt as a real web app. The visual design (colors, type, layout) follows that file exactly.

### Screens and features
- **Map tab:** a custom illustrated NYC map with color-coded boroughs, neighborhood labels, streets with names when zoomed in, and an optional subway layer with station dots and route bullets. Each saved spot is a pin showing its category emoji. A row of category filter chips sits at the top, a spot counter shows the green "saved" sync dot, and a "My Location" button sits at the bottom right.
- **Place card** (tap a pin): category, neighborhood, price, note, nearest subway station with lines and walking time. Buttons: **Get There**, **Open TikTok/Instagram/Threads**, **+ Plan**, **Mark Visited**, **Edit Spot**, **Delete** (tap twice).
- **Get There sheet:** estimated subway route (lines, transfers, walking legs) vs. walking time, from My Location, Home or another saved spot, with buttons that open Google Maps for live directions.
- **Explore tab:** "Where To Today?" Pick categories, a price range ($–$$$$, for restaurants) and neighborhoods grouped by borough, with an option to hide visited places. Results show as a list or a map, with "+ Add All To Plan".
- **Route tab (Plan A Day):** an ordered list of stops shown on a map with a dotted route. Start from the first stop, Home or My Location, with estimated travel time per leg (tap a leg to open Google Maps). Includes **Auto-Order Route** (shortest-trip ordering), reordering with up/down, removing stops and **+ Add Spots**.
- **Add A Spot (+ button):** paste a link, set name, location (address search, or drop a pin), category, price, neighborhood, address and notes.
  - **✨ Fill From Link:** pasting a TikTok, Instagram or Threads link fills the form automatically. It reads the caption, the cover image and, for TikTok, TikTok's automatic captions of what's said. If a post mentions several places, it shows a picker plus **Add All N To My Map**.
  - **Google Maps links:** paste a Google Maps share link (`maps.app.goo.gl/…`) or a `google.com/maps/place/…` link and Fill From Link reads the place's name, address and **exact pin** from Google, then AI adds the category, neighborhood, price and a note.
  - **Name suggestions:** typing 3+ letters in Place Name shows "Is It One Of These?" with up to 5 matching NYC places (name, street, neighborhood). Tapping one fills the name, address, pin, neighborhood and a guessed category. Uses **Google's place search** (Places API (New): Autocomplete + Place Details, through `POST /api/places` so the key stays on the server, with a session token per lookup) when `GOOGLE_MAPS_API_KEY` is set in Vercel; picking a Google suggestion also fills the price level. Without the key it falls back to Photon (photon.komoot.io, OpenStreetMap search made for type-ahead), called from the browser. Both are biased toward My Location or Home.
  - **✨ Search The Web:** when the map search has no match (OpenStreetMap misses some newer/smaller spots), or none of its matches are right, a button asks AI with web search (`POST /api/find`, Claude + `web_search` tool, ~a few cents per tap) to find the place; results show as "Found On The Web" and fill the form like an AI link fill.
  - **🎬 From A Video:** pick a video saved to the phone. The app pulls out the audio and three still frames *on the phone itself*, sends the audio to speech-to-text, and AI finds the places from the spoken words and on-screen text.
  - **+ New Category:** a name, an emoji (16 choices) and a pin color.
- **Sign-in screen:** email + password (Supabase). Tap the spot counter on the map to open **Your Account** (sync status, Sync Now, Sign Out).

### Default categories
☕ Coffee Shop (orange) · 💻 Coffee Shop To Work At (blue) · 🍽️ Restaurant (red) · 🥐 Bakery (yellow) · 🧀 Gourmet Grocery (green) · 🛍️ Cute Shop (pink). New accounts start with an empty list. The 14 example spots only appear when no one is signed in.

### Design tokens
- Colors: blue `#1B3DB8`, navy `#10183F`, orange `#FF6B1A`, yellow `#FFC425`, red `#E8242C`, pink `#F45FA0`, green `#1F9D6B`, purple `#7A4FD6`, cream background `#FFF3DF`.
- Font: **Archivo** (Google Fonts). Headings are 900 weight and italic; UI text uses Title Case on every word.
- Map palette "Colorful": Manhattan `#FFE38F`, Brooklyn `#FFC09A`, Queens `#C4D0FF`, Bronx `#FFB5C9`, Staten Island `#D6C6F4`, water `#86C8EE`, parks `#7FCB8F`.

---

## 2. Where everything lives

| Service | What it does | Where |
|---|---|---|
| **GitHub** | The code | Private repo **`kotiskwok/NYC-List`** (created as `nyc-list`; the old name redirects) → github.com/kotiskwok/NYC-List, branch `main` |
| **Vercel** | Hosts the website and runs the AI server functions in `/api` | vercel.com → project imported from the GitHub repo. Every push to `main` redeploys automatically. The live address is the project's `*.vercel.app` domain (see the Vercel dashboard). |
| **Supabase** | Database + sign-in (email/password) | supabase.com → project URL `https://octgaltlmqwcqewbxocb.supabase.co`. Table `public.nyc_list`. |
| **Anthropic** | AI that reads posts and finds places (model `claude-haiku-5-5`) | console.anthropic.com → API key stored in Vercel as `ANTHROPIC_API_KEY` |
| **OpenAI** | Speech-to-text for uploaded videos (`gpt-4o-mini-transcribe`, falls back to `whisper-1`) | platform.openai.com → API key stored in Vercel as `OPENAI_API_KEY` |

**Note on Upstash:** we discussed Upstash as a database option but did **not** use it. The app uses **Supabase**, and nothing is set up on Upstash.

### Keys and settings
- **Public values (safe, already in `config.js`):** Supabase URL above and publishable key `sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg`. These are also hard-coded as fallbacks in `api/_shared.js`.
- **Secret values (only in Vercel → Settings → Environment Variables, never in code or chat):** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`. Optional: `GOOGLE_MAPS_API_KEY` (Google Cloud key with Places API (New) enabled; turns on Google name suggestions). Optional overrides: `ANTHROPIC_MODEL`, `OPENAI_TRANSCRIBE_MODEL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. After changing a variable, redeploy.
- **Supabase settings:** Authentication → URL Configuration → **Site URL** = the Vercel address. After Kotis's own account exists, turn **off** "Allow new users to sign up" so the app stays private.

### Setup checklist
1. ☐ Supabase: run `supabase/schema.sql` in SQL Editor
2. ☐ Vercel: import the repo (Framework Preset **Other**, no build command)
3. ☐ Supabase: set Site URL to the Vercel address
4. ☐ Vercel: add `ANTHROPIC_API_KEY`, redeploy
5. ☐ Vercel: add `OPENAI_API_KEY`, redeploy (needed for 🎬 video upload only)
6. ☐ Create an account in the app and confirm the email
7. ☐ Supabase: turn off new sign-ups
8. ☐ iPhone: Safari → Share → **Add to Home Screen**

As of this handoff, steps 1–2 were in progress. The Vercel deploy error ("invalid `source` pattern") was fixed in commit `73a69e2`. The AI features (links and video) were tested only with simulated services, so the first real link and video are the live test.

---

## 3. How it's built

- A **static site with no build step.** Plain `<script>` tags load React 18.3.1, htm 3.1.1 (JSX-like templates without a compiler), Leaflet 1.9.4 and supabase-js 2.117.2 from the local `vendor/` folder.
- **Three Vercel server functions** in `api/` (Node.js, CommonJS `module.exports = async (req, res)`).
- **The app's structure comes from the Claude Design runtime:** `src/logic.js` defines `class Component extends DCLogic` with `state`, lifecycle methods and a big `renderVals()` that returns every value and handler the view uses. `src/view.js` turns those values into the screens. `src/runtime.js` supplies the `DCLogic` base class (setState applies immediately to `this.state`, then React re-renders).
- **Data:** stored locally in `localStorage['nycList.v1']` (`{places, cats, home, plan}`), and synced as **one JSON row per user** in Supabase (`nyc_list.data`).
- **Sync** (`src/sync.js`): about a second after any change, it reads the cloud copy, does a three-way merge against the last synced "base" (stored at `localStorage['nycList.base.<userId>']`), writes the result and saves it as the new base. It also syncs when the app returns to the foreground or comes back online. A spot added offline and a spot added on another device both survive.
- **Place record:** `{id, name, cat, area, lat, lng, url, source: tiktok|instagram|threads|gmaps|link|manual, address, note, price: 0-4, visited}`. **Category:** `{id, name, color, emoji}`. **Plan:** `{ids: [...], start: 'first'|'home'|'here'}`. **Home:** `{lat, lng, area}`.
- **Geocoding:** OpenStreetMap Nominatim, from the browser (address search and pinning AI results). Name suggestions use Photon (`suggest`, `runSuggest`, `osmCat`, `pickSugg` in `logic.js`).
- **Subway routing:** an *estimate* from station coordinates and shared lines (not live). Live times come from the Google Maps links.
- **Offline:** `sw.js` caches the app. Map data and libraries are served from the cache first; the page and code are fetched from the network first. **When you change files in `src/`, bump `CACHE` in `sw.js`** (currently `nyc-list-v7`).

### AI pipeline
1. **Link:** the app calls `POST /api/extract` with `{url, notes, categories, neighborhoods}` and the Supabase access token as `Authorization: Bearer …`. The server checks the token with Supabase, then reads the post:
   - TikTok: oEmbed (caption + thumbnail), plus TikTok's subtitle tracks from the video page (`__UNIVERSAL_DATA_FOR_REHYDRATION__` / `SIGI_STATE` → `subtitleInfos`, `claInfo.captionInfos`).
   - Instagram: `/p|reel/<id>/embed/captioned/`.
   - Google Maps (`api/_gmaps.js`): follows the share link (asking as a phone: a desktop-Chrome user agent gets an "open in app" page instead of a redirect; share links usually land on `?q=Name, Street, New York, NY zip`), takes the name from `/maps/place/<name>/` or the page title, the exact pin from `!3d<lat>!4d<lng>` (or the preview image / page data), and the address from the page title. The result is limited to one place and carries `lat`/`lng`, which the app uses instead of geocoding. Saved spots get `source: 'gmaps'`.
   - Threads and other sites: `og:` meta tags.

   It then calls Claude Haiku with a forced tool `save_places` and returns `{places:[{name, category_id, neighborhood, address, price, note, confidence}]}`.
2. **Video:** `src/video.js` decodes the video on the phone into 16 kHz mono WAV pieces of about 2 minutes (under Vercel's 4.5 MB request limit, up to 10 minutes total) plus 3 JPEG frames. Each piece goes to `POST /api/transcribe` (OpenAI). The combined transcript and frames go to `/api/extract`.
3. **Back in the app**, `aiApply` fills the form, matches the neighborhood to the app's list and geocodes the place to drop the pin. `aiAddAll` saves every found place at once.

---

## 4. File map

| File | What's in it | Edit it to… |
|---|---|---|
| `index.html` | Page shell: meta and PWA tags, all CSS (phone frame on desktop, full screen on phones), script load order | change global styles or add a script |
| `src/logic.js` | **All behavior**: colors `C`, categories `CATS0`, emojis, example `SEED` spots, map drawing (Leaflet panes, streets, subway, labels), filters, routing estimate, plan auto-order, add/edit/save, AI fill (`aiAuto`, `aiFill`, `aiVideo`, `aiApply`, `aiAddAll`), sync hooks (`snapshot`, `applyRemote`, `resetLocal`), and `renderVals()` | change how anything works, or add new state/values for the view |
| `src/view.js` | **All screens**: `MapScreen`, `ExploreScreen`, `PlanScreen`, `PlaceCard`, `RouteSheet`, `Picker`, `TabBar`, `AddSheet`, `AccountSheet`, `AuthScreen`, `App`. Uses the helper `S('css string')` for inline styles; `T(n)`/`B(n)` offset for status bar and safe areas | change layout, text or look |
| `src/runtime.js` | `DCLogic` base class, `window.open` fallback, `APP_PROPS` (`?style=Minimal`, `?tab=Explore`) | rarely |
| `src/sync.js` | Supabase client, sign-in/up/out, three-way merge sync, `getToken()` | sync or sign-in behavior |
| `src/video.js` | On-device audio extraction (WAV pieces) and frame capture | video upload limits/quality |
| `api/extract.js` | Server: reads posts, calls Claude, returns places | AI prompt, platforms, model |
| `api/places.js` | Server: Google place search for Place Name suggestions (autocomplete + details) | Google fields |
| `api/find.js` | Server: finds a place by name with Claude + web search (for names the map search doesn't know) | search prompt |
| `api/transcribe.js` | Server: OpenAI speech-to-text | transcription model/prompt |
| `api/_shared.js` | Server helpers: `send`, `requireUser` (Supabase token check), body readers | — |
| `config.js` | Supabase URL + publishable key | switching Supabase projects |
| `supabase/schema.sql` | Table `nyc_list` + row-level security (each user can only read and write their own row) | database changes |
| `sw.js` | Offline cache (bump `CACHE` on releases) | — |
| `manifest.webmanifest`, `icons/` | Home-screen name/icon (yellow "NYC" pill on blue) | app name/icon |
| `vercel.json` | Cache headers (use `/path/:path*` patterns; grouped regex patterns fail to deploy) | — |
| `data/` | NYC neighborhoods (`NYC_MAP`), streets (`NYC_STREETS`), subway stations (`NYC_SUBWAY`). Generated data: don't hand-edit | — |
| `vendor/` | Third-party libraries (pinned copies) | upgrading a library |
| `README.md` | Setup guide | — |

---

## 5. Working on it in a new chat

**Best option: Claude Code on the web or desktop with the GitHub repo attached.** Ask it to work in `kotiskwok/NYC-List`. It can read every file, make changes, test, and push, and Vercel redeploys automatically.

**Alternative:** attach `nyc-list.zip` (or the specific files) to a regular chat and ask for edits. You'd then need to upload the changed files to GitHub yourself (github.com → repo → **Add file → Upload files**), which also redeploys.

### Starter message for the new chat
> I have a personal web app called **My NYC List** in my private GitHub repo **kotiskwok/NYC-List**, deployed on **Vercel** with **Supabase** for sign-in and sync. Please read `HANDOFF.md` in the repo first; it explains the whole app, the services and the file layout. Then help me with: [your request].

### Tips for the next Claude
- Keep the no-build setup: edit `src/*.js` directly, keep htm templates in `view.js`, and add new state to the `state` initializer and new values to `renderVals()` in `logic.js`.
- Test locally with `python3 -m http.server` from the repo root. Without keys, sign-in and AI won't work locally unless they're mocked.
- After changing `src/`, bump `CACHE` in `sw.js` so installed phones pick up the update.
- Never put `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` or the Supabase **secret/service_role** key in the code. The Supabase **publishable** key is fine.
- Commits so far: `1eb1515` initial app → `73a69e2` Vercel fix + Supabase keys → `16b047d` AI link fill → `86be258` video/audio AI fill.

### Ideas not built yet
- Upstash as an alternative database (discussed, not used)
- Directly downloading audio from Instagram/TikTok links (blocked by the platforms; the 🎬 upload is used instead)
- Sharing a list with someone else, or separate lists per person
