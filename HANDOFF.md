# My NYC List: Project Handoff

Attach this file (and `nyc-list.zip`, or point Claude at the GitHub repo) to a new chat to keep working on the app.

---

## 1. What the app is

**My NYC List** is Kotis's personal map of New York City places to visit: restaurants, cafes, bakeries, gourmet groceries and cute shops, mostly saved from TikTok, Instagram, Threads and Google Maps. It runs in a phone browser and installs to the iPhone home screen like an app (a PWA). The list syncs across devices through Supabase.

- **Live address:** https://nyc-lovat.vercel.app
- **Design source:** Claude Design project "NYC Exploration Spot Mapper", file `NYC List v2.dc.html`. The look (colors, type, layout) follows that file.

### Screens and features

**Map tab**
- A custom illustrated NYC map: color-coded boroughs, neighborhood labels, street names when zoomed in, and an optional subway layer (station dots and route bullets).
- Each saved spot is a pin showing its category emoji. Category filter chips sit along the top.
- A spot counter with a green "saved" sync dot. Tapping it opens **Your Account** (sync status, Sync Now, Sign Out).
- A **My Location** button at the bottom right. If location fails, you can tap the map where you are.

**Place card** (tap a pin)
- Shows the category, neighborhood, price, note, and nearest subway station with its lines and walking time.
- Buttons: **Get There**, **Open TikTok / Instagram / Threads / Google Maps**, **+ Plan**, **Mark Visited**, **Edit Spot**, **Delete** (tap twice).

**Get There sheet**
- An estimated subway route (lines, transfers, walking legs) compared with walking time.
- Starts from My Location, Home or another saved spot.
- Buttons open Google Maps for live directions.

**Explore tab ("Where To Today?")**
- Filter by category, price ($–$$$$, for restaurants) and neighborhoods grouped by borough, with an option to hide visited places.
- Results show as a list or a map, with **+ Add All To Plan**.

**Route tab (Plan A Day)**
- An ordered list of stops, shown on a map with a dotted route.
- Start from the first stop, Home or My Location. Each leg shows an estimated travel time; tap a leg to open it in Google Maps.
- **Auto-Order Route** (shortest-trip order), up/down reordering, removing stops, and **+ Add Spots**.

**Lists tab (shared lists, e.g. "Sonia's Visit")**
- A list is a collection of spots for a visit or a big day out, separate from the Route plan. **+ New List** takes a name, optional number of days and an optional first date.
- **+ From My Map** picks spots from your map. **+ New Spot** opens Add A Spot for the list only: the spot goes on the list and not on your map. A place card on the Map tab also has **+ Add To A List**.
- Optional days: spots start under "Not On A Day Yet" and move with the Day dropdown. Each day gets its own pin color, a dotted path on the map and a **Route ↗** link that opens all of that day's stops in Google Maps. Add a day with **+ Add Day N**; remove the last day with ✕.
- **Share & Invite** (owner only): pick what invitees get: **Just This List** (they can add, sort and remove spots), **Just My Map** (a view-only look at all your saved spots, without your home) or **Both**. The invite link is `/?join=<code>`. **Make A New Link** retires the old one. The sheet also lists who has joined (with Remove) and renames the list.
- Invitees open the link, see "Kotis Invited You" on the sign-in screen, make an account (with a name) and land on the list. With the map shared they get a **This List / Kotis's Map** toggle; tapping a pin there offers **+ Add To This List** and **Save To My Map**. Any spot on a list can be saved to your own map.
- Changes sync between everyone about a second after each edit, and the open list refreshes every 20 seconds and when the app comes back to the front.

**Add A Spot (the + button)**
- **Paste A Link:** TikTok, Instagram, Threads or Google Maps. A badge shows which kind of link was detected.
  - **✨ Fill From Link** runs on its own after a social or Google Maps link is pasted.
    - TikTok: reads the caption, the cover image and TikTok's automatic captions of what's said.
    - Instagram: reads the caption and cover image.
    - Threads: reads the post text and image.
    - Google Maps: reads the place's name and address (or its exact pin when the link has one), then AI adds the category, neighborhood, price and a note.
  - If a post mentions several places, a picker appears with **Add All N To My Map**.
- **🎬 From A Video:** pick a video saved to the phone. The app pulls out the audio and three still frames *on the phone*, sends the audio to speech-to-text, and AI finds the places from the spoken words and on-screen text. Needs `OPENAI_API_KEY` (see section 2).
- **Place Name with suggestions:** typing 3+ letters shows "Is It One Of These?" with up to 5 matching NYC places. Tapping one fills the name, address, pin, neighborhood and a guessed category.
  - With `GOOGLE_MAPS_API_KEY` set, the suggestions come from Google's place search (labeled "Suggestions From Google") and also fill the price.
  - Without it, they come from OpenStreetMap (Photon), which misses some newer and smaller spots.
  - **None Of These** hides the list.
- **✨ Search The Web:** shows when the suggestions have no match, or as "Not Here? Search The Web" under them. AI with web search looks the name up and shows results as "Found On The Web"; tapping one fills the form. It costs a few cents per tap, so it only runs on a tap.
- **Location:** search an address (OpenStreetMap Nominatim), drop or move a pin on the map, or just pick a neighborhood.
- **Category** (+ New Category: a name, one of 16 emojis and a pin color), **Price Range** (restaurants), **Neighborhood** and **Notes**.

**Sharing into the app**
- Opening `https://nyc-lovat.vercel.app/?add=<link>` opens Add A Spot with that link filled in and AI reading it.
- **Android:** the installed app appears in the share menu (`share_target` in the manifest sends `?url=` / `?text=` / `?title=`).
- **iPhone:** an **"Add To NYC List"** Shortcut sits in the share sheet. It is set up in the Shortcuts app with Show in Share Sheet turned on and Receive set to URLs and Text. Its actions are **URL Encode** (Shortcut Input), then **Open URLs** `https://nyc-lovat.vercel.app/?add=` followed by the URL Encoded Text variable.
  - iPhone opens these links in Safari, not the home-screen app, so the app needs signing in once in Safari as well. Spots added there sync to the home-screen app.

**Sign-in screen:** email and password (Supabase).

### Default categories
☕ Coffee Shop (orange) · 💻 Coffee Shop To Work At (blue) · 🍽️ Restaurant (red) · 🥐 Bakery (yellow) · 🧀 Gourmet Grocery (green) · 🛍️ Cute Shop (pink).

New accounts start with an empty list. The 14 example spots only appear when no one is signed in.

### Design tokens
- **Colors:** blue `#1B3DB8`, navy `#10183F`, orange `#FF6B1A`, yellow `#FFC425`, red `#E8242C`, pink `#F45FA0`, green `#1F9D6B`, purple `#7A4FD6`, cream background `#FFF3DF`.
- **Font:** **Archivo** (Google Fonts). Headings are 900 weight and italic. All UI text uses Title Case On Every Word.
- **Map palette "Colorful":** Manhattan `#FFE38F`, Brooklyn `#FFC09A`, Queens `#C4D0FF`, Bronx `#FFB5C9`, Staten Island `#D6C6F4`, water `#86C8EE`, parks `#7FCB8F`.
- **Source badge colors:** TikTok navy, Instagram `#D9367F`, Threads `#2B2B2B`, Google Maps green, Website blue, Added By Name grey.

---

## 2. Where everything lives

| Service | What it does | Where |
|---|---|---|
| **GitHub** | The code | Private repo **`kotiskwok/NYC-List`**, branch `main` |
| **Vercel** | Hosts the site and runs the server functions in `/api`. Every push to `main` redeploys automatically. | vercel.com → team "kotis1" → project **nyc** → https://nyc-lovat.vercel.app |
| **Supabase** | Database and sign-in (email/password) | Project URL `https://octgaltlmqwcqewbxocb.supabase.co`, table `public.nyc_list` |
| **Anthropic** | AI that reads posts and links and finds places by name (model `claude-haiku-5-5`) | console.anthropic.com. Key is in Vercel as `ANTHROPIC_API_KEY`. |
| **Google Cloud** | Google place search for the Place Name suggestions (Places API (New)) | console.cloud.google.com, account kwokshulum@gmail.com. Key goes in Vercel as `GOOGLE_MAPS_API_KEY`. |
| **OpenAI** | Speech-to-text for 🎬 uploaded videos (`gpt-4o-mini-transcribe`, falling back to `whisper-1`) | platform.openai.com. Key goes in Vercel as `OPENAI_API_KEY`. |
| **Photon / Nominatim** | Free OpenStreetMap search: fallback name suggestions, address search and pinning places from an address | Called from the browser. No key. |

### Keys and settings
- **Public values (already in `config.js`, safe to share):**
  - Supabase URL (above)
  - Publishable key `sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg`
  - Both are also hard-coded as fallbacks in `api/_shared.js`.
- **Secret values** live only in Vercel → project nyc → Settings → Environment Variables, never in code or chat. After adding or changing one, redeploy.

| Variable | Status | Turns on |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Set | Fill From Link, Google Maps links, Search The Web, video place-finding |
| `GOOGLE_MAPS_API_KEY` | ☐ Not set yet | Google name suggestions (otherwise OpenStreetMap). Create in Google Cloud → enable **Places API (New)** → APIs & Services → Credentials → API key, restricted to Places API (New). A daily quota cap is a good idea. |
| `OPENAI_API_KEY` | ☐ Not set yet | 🎬 From A Video |

- **Optional overrides:** `ANTHROPIC_MODEL`, `OPENAI_TRANSCRIBE_MODEL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`.
- **Supabase:** Authentication → URL Configuration → **Site URL** is the Vercel address. "Allow new users to sign up" (Authentication → Sign In / Providers) must stay **on** for friends to join shared lists. A new account only sees its own empty map plus the lists it was invited to; the AI features cost a little per use for any signed-in account.
- **Quick check of which keys are live:** a `POST` with no sign-in to `/api/extract`, `/api/places` or `/api/transcribe` answers **401** when that service's key is set and **503** when it isn't.

---

## 3. How it's built

### Front end
- A **static site with no build step.** Plain `<script>` tags load React 18.3.1, htm 3.1.1 (JSX-like templates without a compiler), Leaflet 1.9.4 and supabase-js 2.117.2 from the local `vendor/` folder.
- **App structure (from the Claude Design runtime):**
  - `src/logic.js` defines `class Component extends DCLogic`, with `state`, lifecycle methods and a big `renderVals()` that returns every value and handler the view uses.
  - `src/view.js` turns those values into the screens.
  - `src/runtime.js` supplies the `DCLogic` base class (setState applies immediately to `this.state`, then React re-renders).

### Data and sync
- **Local storage:** `localStorage['nycList.v1']` holds `{places, cats, home, plan}`.
- **Cloud:** one JSON row per user in Supabase (`nyc_list.data`), with row-level security so each user can only read and write their own row.
- **Sync** (`src/sync.js`): about a second after any change, it reads the cloud copy, does a three-way merge against the last synced "base" (`localStorage['nycList.base.<userId>']`), writes the result and saves it as the new base. It also syncs when the app comes back to the foreground or back online.
- **Record shapes:**
  - **Place:** `{id, name, cat, area, lat, lng, url, source: tiktok|instagram|threads|gmaps|link|manual, address, note, price: 0-4, visited}`
  - **Category:** `{id, name, color, emoji}`
  - **Plan:** `{ids: [...], start: 'first'|'home'|'here'}`
  - **Home:** `{lat, lng, area}`
- **Shared lists** (`src/lists.js`, tables from `supabase/lists.sql`):
  - `nyc_trips`: one row per list: `owner`, `owner_name`, `name`, `share_list`, `share_map`, `invite_code`, `rev`, and `data` = `{stops, days, start, cats}`.
  - **Stop:** `{id, pid, by, byName, day, p: {name, cat, area, lat, lng, url, source, address, note, price}}`. `pid` is the adder's own map place id (null for spots added straight to the list); `day` 0 means no day yet. When you edit a place on your map, its copy on your lists updates.
  - `nyc_trip_members`: who joined through the invite link. Joining goes through the `nyc_join_trip(code, name)` function; `nyc_trip_preview(code)` shows the invite on the sign-in screen; `nyc_shared_map(trip)` returns the owner's places and categories (never home) when the map is shared.
  - Row-level security: owner and members can read; the owner and members of a list-shared list can edit `data`; a trigger keeps the name, sharing settings and invite code owner-only.
  - **Sync:** same three-way merge as the main list, with an optimistic `rev` check (update `where rev = <read rev>`, retry on a clash) so two people editing at once don't overwrite each other. A local copy sits in `localStorage['nycList.trips.<userId>']`; an invite code waiting for sign-up sits in `localStorage['nycList.join']`.
- **Neighborhoods:** worked out from the app's own polygons (`hoodAt` in `logic.js`, data in `data/nyc-map-data.js`).

### Maps, routing and offline
- **Subway routing:** an *estimate* from station coordinates and shared lines, not live. Live times come from the Google Maps links.
- **Offline:** `sw.js` caches the app. Map data and libraries are served from the cache first; the page and code come from the network first. **Whenever files in `src/` change, bump `CACHE` in `sw.js`** (currently `nyc-list-v9`).

### Server functions (`/api`)
Vercel Node.js functions, CommonJS `module.exports = async (req, res)`. Files starting with `_` are helpers, not endpoints.

- Every endpoint first checks the caller's Supabase access token (`Authorization: Bearer …`) with Supabase, so only signed-in users can use the paid services.
- `extract.js` and `find.js` are allowed up to 60 seconds (`vercel.json`).

| Endpoint | Input | What it does |
|---|---|---|
| `POST /api/extract` | `{url?, notes?, transcript?, frames?, categories, neighborhoods}` | Reads the link, then calls Claude with a forced `save_places` tool. Returns `{places:[{name, category_id, neighborhood, address, price, note, confidence, lat?, lng?}], message}`. |
| `POST /api/find` | `{q, categories, neighborhoods}` | Claude with the `web_search` tool (up to 3 searches) finds NYC places by name. Same `places` shape. |
| `POST /api/places` | `{action:'auto', q, near, session}` or `{action:'detail', id, session}` | Google Places API (New) autocomplete limited to the five boroughs, then details (name, street address, neighborhood, location, types, price level). The same session id is used from typing through the pick, so Google bills it as one session. Answers 503 without the key; the app then uses Photon. |
| `POST /api/transcribe` | audio/wav body | OpenAI speech-to-text. |

How `extract.js` reads each kind of link:
- **TikTok:** oEmbed (caption and thumbnail), plus TikTok's subtitle tracks from the video page (`__UNIVERSAL_DATA_FOR_REHYDRATION__` / `SIGI_STATE` → `subtitleInfos`, `claInfo.captionInfos`).
- **Instagram:** `/p|reel/<id>/embed/captioned/`.
- **Google Maps** (`api/_gmaps.js`):
  - Follows `maps.app.goo.gl` share links one redirect at a time, **asking as a phone**. A desktop-Chrome user agent gets an "open in app" page instead of a redirect.
  - Share links usually land on `maps.google.com?q=Name, Street, New York, NY zip`, which gives the name and address.
  - Full `/maps/place/<name>/…!3d<lat>!4d<lng>` links also give the exact pin, which the app uses instead of geocoding.
  - The result is limited to one place.
- **Threads and other sites:** `og:` meta tags.

### In the app
- `aiApply` fills the form, matches the neighborhood to the app's list, and pins the place: from the exact `lat/lng` if given, otherwise by geocoding the name and address with Nominatim.
- `aiAddAll` saves every found place at once.
- **Video** (`src/video.js`): decodes the video on the phone into 16 kHz mono WAV pieces of about 2 minutes each (under Vercel's 4.5 MB request limit, up to 10 minutes total) plus 3 JPEG frames. Each piece goes to `/api/transcribe`; the combined transcript and frames go to `/api/extract`.
- **Name suggestions** (`logic.js`):
  - `suggest` waits 350 ms after typing, then `runSuggest` tries Google through `googleCall`, falling back to Photon.
  - `gCat` / `osmCat` guess the category from the place type.
  - `pickSugg` fills the form.
  - `webFind` runs Search The Web.
- **Shared links:** `SHARED_LINK` (read once at load from `?add=` / `?url=` / `?text=` / `?title=`, then removed from the address bar). `takeShared` opens Add A Spot once sign-in has settled.

---

## 4. File map

| File | What's in it | Edit it to… |
|---|---|---|
| `index.html` | Page shell: meta and PWA tags, all CSS (phone frame on desktop, full screen on phones), script load order | change global styles or add a script |
| `src/logic.js` | **All behavior**: colors `C`, categories `CATS0`, emojis, example `SEED` spots, link detection `detect` / `SRC` badges, map drawing (Leaflet panes, streets, subway, labels), filters, routing estimate, plan auto-order, add/edit/save, AI fill (`aiAuto`, `aiFill`, `aiVideo`, `aiApply`, `aiAddAll`), name suggestions and web search, shared links, sync hooks (`snapshot`, `applyRemote`, `resetLocal`), and `renderVals()` | change how anything works, or add new state/values for the view |
| `src/view.js` | **All screens**: `MapScreen`, `ExploreScreen`, `PlanScreen`, `PlaceCard`, `RouteSheet`, `Picker`, `TabBar`, `AddSheet`, `AccountSheet`, `AuthScreen`, `App`. Uses the helper `S('css string')` for inline styles; `T(n)` / `B(n)` offset for the status bar and safe areas. | change layout, text or look |
| `src/runtime.js` | `DCLogic` base class, `window.open` fallback, `APP_PROPS` (`?style=Minimal`, `?tab=Explore`) | rarely |
| `src/lists.js` | Shared lists: Supabase reads/writes, merge and invite joining (`NYCLists`), plus the Lists tab behaviour mixed into `Component` (`listVals()` feeds the view) | change how lists, sharing or invites work |
| `src/sync.js` | Supabase client, sign-in/up/out, three-way merge sync, `getToken()` | sync or sign-in behavior |
| `src/video.js` | On-device audio extraction (WAV pieces) and frame capture | video upload limits or quality |
| `api/extract.js` | Server: reads posts and links, calls Claude, returns places | AI prompt, platforms, model |
| `api/_gmaps.js` | Server helper: Google Maps link detection and parsing (name, query, pin) | Google Maps link formats |
| `api/find.js` | Server: Search The Web (Claude and web search) | web search prompt |
| `api/places.js` | Server: Google place search for name suggestions | Google fields, search area |
| `api/transcribe.js` | Server: OpenAI speech-to-text | transcription model or prompt |
| `api/_shared.js` | Server helpers: `send`, `requireUser` (Supabase token check), body readers | — |
| `config.js` | Supabase URL and publishable key | switching Supabase projects |
| `supabase/schema.sql` | Table `nyc_list` and row-level security | database changes |
| `supabase/lists.sql` | Shared-list tables, security rules and the join / preview / shared-map functions. Run once (safe to re-run). | shared-list database changes |
| `sw.js` | Offline cache (bump `CACHE` whenever `src/` changes) | — |
| `manifest.webmanifest`, `icons/` | Home-screen name and icon (yellow "NYC" pill on blue), Android `share_target` | app name, icon, sharing |
| `vercel.json` | Function time limits and cache headers (use `/path/:path*` patterns; grouped regex patterns fail to deploy) | — |
| `data/` | NYC neighborhoods (`NYC_MAP`), streets (`NYC_STREETS`), subway stations (`NYC_SUBWAY`). Generated data, don't hand-edit. | — |
| `vendor/` | Third-party libraries (pinned copies) | upgrading a library |
| `CLAUDE.md` | Short rules for Claude working in the repo | — |
| `README.md` | Setup guide | — |

---

## 5. Working on it in a new chat

**Best option: Claude with the GitHub repo attached.** Ask it to work in `kotiskwok/NYC-List`. It can read every file, make changes, test, and push, and Vercel redeploys automatically.

**Alternative:** attach `nyc-list.zip` (or just the files to change) to a chat and ask for edits. Then upload the changed files to GitHub yourself (github.com → repo → **Add file → Upload files**), which also redeploys.

### Starter message for the new chat
> I have a personal web app called **My NYC List** in my private GitHub repo **kotiskwok/NYC-List**, deployed on **Vercel** (https://nyc-lovat.vercel.app) with **Supabase** for sign-in and sync. Please read `HANDOFF.md` first; it explains the whole app, the services and the file layout. Then help me with: [your request].

### Tips for the next Claude
- **Keep the no-build setup.** Edit `src/*.js` directly, keep htm templates in `view.js`, add new state to the `state` initializer and new values to `renderVals()` in `logic.js`.
- **After changing `src/`, bump `CACHE` in `sw.js`** so installed phones pick up the update.
- **Test locally** with `python3 -m http.server` from the repo root. Sign-in, AI and Google search won't work locally without keys, so mock them:
  - Serve `window.NYC_CONFIG={}` for `config.js` to run in local (no sign-in) mode.
  - Stub `NYCSync.getToken` and the `/api/*` routes.
- **Never put secrets in the code:** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`, or the Supabase **secret/service_role** key. The Supabase **publishable** key is fine.
- **Server-side fetches to Google:** request as a phone or a plain client, not desktop Chrome (see Google Maps above).

### Ideas not built yet
- Saving a shared link **in the background** from the iPhone share sheet without opening the app. This would need a server endpoint that writes to Supabase with the service-role key plus a personal token for the Shortcut.
- Directly downloading audio from Instagram or TikTok links (blocked by the platforms; 🎬 upload is used instead).
- Live updates without the 20-second refresh (Supabase Realtime), and per-person notes or votes on a list's spots.
