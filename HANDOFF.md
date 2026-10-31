# Spotted In (formerly My NYC List): Project Handoff

Attach this file (and `nyc-list.zip`, or point Claude at the GitHub repo) to a new chat to keep working on the app.

---

## 1. What the app is

**Spotted In** (formerly My NYC List) is Kotis's personal map of New York City places to visit: restaurants, cafes, bakeries, gourmet groceries and cute shops, mostly saved from TikTok, Instagram, Threads and Google Maps. It runs in a phone browser and installs to the iPhone home screen like an app (a PWA). The list syncs across devices through Supabase.

- **Live address:** https://nyc-lovat.vercel.app
- **Design source:** Claude Design project "NYC Exploration Spot Mapper", file `NYC List v2.dc.html`. The look (colors, type, layout) follows that file.

### Screens and features

**Map tab**
- Apple Maps as the base map, with an optional subway layer (station dots and route bullets). While Apple's map loads, or if it's ever unavailable, the app draws its own NYC map in Apple Maps colors (neighborhood labels, street names when zoomed in).
- Each saved spot is a pin showing its category emoji. Category filter chips sit along the top.
- A spot counter with a green "saved" sync dot. Tapping it opens **Your Account** (sync status, Sync Now, Sign Out).
- A **My Location** button at the bottom right. If location fails, you can tap the map where you are.
- A **Map Layers** button above it: switches for **Subway**, **Bus Routes** (every local, Select Bus and express route in its MTA color; tap a line for its name) and **Citi Bike** (docks with live bike, e-bike and dock counts, refreshed every minute; tap a dock). The choice is remembered on the device and applies to every map.
- Every pin shows its category's icon. On a day plan or a list's days, a small navy badge on the pin shows the stop number.
- The spot counter reads "N Spots To Try" (the number as tall as the two-line label) and shows your profile photo with the sync dot on it.
- **Profile photo:** Your Account → **Add Photo / Change Photo / Remove**. The phone crops it square and shrinks it to 320×320 before uploading. Friends' photos show on shared lists.

**Place card** (tap a pin)
- Shows the category, neighborhood, price, note, and nearest subway station with its lines and walking time.
- Buttons: **Get There**, **Open TikTok / Instagram / Threads / Google Maps**, **+ Plan**, **Mark Visited**, **Edit Spot**, **Delete** (tap twice).

**Get There sheet**
- An estimated subway route (lines, transfers, walking legs) compared with walking time.
- Starts from My Location, Home or another saved spot.
- Buttons open Google Maps for live directions.

**Cities (beta): New York, Singapore, Hong Kong, Toronto**
- Tap the yellow city button ("NYC ▾") in the map header to pick a city; the welcome pages also ask for it on the Home Base step. The choice is per device (`localStorage nycList.city`).
- Each spot has a `city` (no city = NYC). The app shows one city at a time: `state.places` is the current city, `state.otherPlaces` the rest; `cityMeta` holds each city's home and Route plan. In the synced data, `home`/`plan` stay NYC's (older versions keep working) and `cities.{sg,hk,to}` hold the others. `sync.js` merges each city on its own.
- `CITIES` in `logic.js` sets each city's map center, pan limits, search box, regions and transit name. `setCity()` switches; `cityMoved()` re-centers the maps and redraws stations.
- `data/city-data.js` (`window.CITY_DATA`): neighborhoods (OpenStreetMap place names grouped into regions; the nearest one is used for a spot) and rail stations with line colors: Singapore MRT/LRT (cheeaun/sgraildata), Hong Kong MTR and Toronto TTC lines 1/2/4/5/6 (OpenStreetMap, Oct 2026). Travel times use these like the NYC subway. Toronto streetcars and buses aren't included, so some trips show as walks.
- Searches (Nominatim, Photon, Google), AI link reading, web search and video transcription all use the current city (`city` in the request; `CITIES`/`localize()` in `api/_shared.js`). Bus routes and Citi Bike are NYC only.
- Saving a friend's spot that's in another city puts it on that city's map.
- The picked city syncs with the account (`city` in the synced data); other devices follow when they sync.
- Map layers per city (`CITIES[..].layers`): NYC subway, buses, Citi Bike · Singapore MRT, buses · Hong Kong MTR, buses, trams, ferries · Toronto subway/LRT, streetcars, buses, Bike Share Toronto. Route lines for the non-NYC layers are files in `data/routes/<city>-<kind>.json`, built from OpenStreetMap by the GitHub Action **Build transit routes** (`.github/workflows/routes.yml` → `scripts/build-routes.js` → `api/_osmroutes.js`: one line per route number, joined and simplified). It runs monthly, on demand (Actions tab → Run workflow) and when the builder changes, and commits the files, which redeploys the site. Building on demand in a Vercel function timed out (Overpass takes 30-60 s). Bike Share Toronto uses its public GBFS feed straight from the app.
- Travel times also use Toronto streetcar stops and Hong Kong tram stops and ferry piers (`k:1` stops in `city-data.js`, with slower speeds `v` and longer waits `w` per line). Buses aren't used for travel times.

**Explore tab ("Where To Today?")**
- "Command Center + Deck" layout: a search bar (matches name, area, address and note), category chips, and a glass matches card (count, neighborhoods, a color bar by category, the price filter).
- The navy filter button opens price ($–$$$$, for restaurants) and neighborhoods by borough; **Hide Visited** is the small switch at the top. A badge on the button counts active filters.
- **Shuffle The Deck**: the matches as a stack of swipeable cards. Swipe right or tap the orange + to add a spot to the plan; swipe left or ✕ to skip; tap to open the place card. At the end you can Shuffle Again (new order) or See All. The deck resets when filters change (`deckList()`, `deckPos()`, `deckAct()` in `logic.js`; `DeckCard()` in `view.js`).
- **See All** shows the results as a list or a map, with **+ Add All To Plan**.

**Route tab (Plan A Day)**
- "Timeline + Map HUD" layout: the map fills the screen with the dotted route and numbered pins. A glass panel on top shows total travel, a ride-vs-walk bar, when you're home/done, and the Start From switch (First Stop / Home / My Location).
- A glass timeline sheet sits halfway up; drag or tap its handle to pull it up (the panel shrinks to two pills). `planSheet` state, `setPlanSheet()` refits the map.
- Clock times: tap the navy time to set **Leave At** (`plan.leave`, default 10:00). Each stop has a **STAY** chip (tap to cycle 15 min–3 hrs, `plan.stay[id]`, default 45 min). Arrival times add the travel legs and stays; starting from Home adds the trip back and a "Back Home" time.
- Each leg shows subway bullets or walking minutes; tap it for live times in Google Maps. **Start Route In Google Maps** opens all stops in order. **Auto-Order**, up/down, ✕, **+** (Add Spots) and Clear are in the sheet.

**Lists tab (shared lists, e.g. "Sonia's Visit")**
- A list is a collection of spots for a visit or a big day out, separate from the Route plan. **+ New List** takes a name, optional number of days and an optional first date.
- **+ From My Map** picks spots from your map. **+ New Spot** opens Add A Spot for the list only: the spot goes on the list and not on your map. A place card on the Map tab also has **+ Add To A List**.
- Optional days: spots start under "Not On A Day Yet" and move with the Day dropdown. Each day gets its own pin color, a dotted path on the map and a **Route ↗** link that opens all of that day's stops in Google Maps. Add a day with **+ Add Day N**; remove the last day with ✕.
- **Edit** (next to the list's title): name (owner only), number of days and first date. Lowering the days moves spots from removed days back to "Not On A Day Yet".
- **Share & Invite** (owner only): pick what invitees get: **Just This List** (they can add, sort and remove spots), **Just My Map** (a view-only look at all your saved spots, without your home) or **Both**. The invite link is `/?join=<code>`. **Make A New Link** retires the old one. The sheet also lists who has joined (with Remove) and renames the list.
- Invitees open the link, see "Kotis Invited You" on the sign-in screen, make an account (with a name) and land on the list. With the map shared they get a **This List / Kotis's Map** toggle; tapping a pin there offers **+ Add To This List** and **Save To My Map**. Any spot on a list can be saved to your own map.
- **Wallet look:** the Lists tab is an Apple Wallet–style stack of colored cards (palette color by list order, `walletOf()` in `lists.js`). The newest list is the full card in front with its dates, a countdown ("In 14 days", "Day 2 of 3"), people and sharing; below it, **Up Next** shows the list's first stop.
- Opening a list lifts its card to the top as the header: stops (for the chosen day), travel time, people, dates/countdown and a live **"Sonia Is Here"** tag when someone else has the list open (Supabase Realtime presence on channel `nyc-list-<id>`, `watchPresence()`; nothing to set up). Below are the day switcher (with dates), the stops and the edit tools; **Map** shows the list's pins full screen; the other lists peek as card edges at the bottom (tap to switch).
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

**Sign-in screen:** email and password (Supabase), with a show/hide eye on the password. Fields carry `autocomplete` names so iPhone offers to save and fill the password; sessions already persist, so you stay signed in. The name field only shows on sign-up from a list invite.

**Welcome pages** (first sign-in, until `user_metadata.onboarded` is set): a subway-ride flow — "Welcome Aboard!", "How Do You Want Us To Call You?" (saved as your name), "Where's Home?" (optional address search that sets Home), "You're All Set". `Onboarding()` in `view.js`, `ob*` values in `logic.js`, `NYCSync.finishOnboarding()`.

### Default categories
☕ Coffee Shop (orange) · 💻 Coffee Shop To Work At (blue) · 🍽️ Restaurant (red) · 🥐 Bakery (yellow) · 🧀 Gourmet Grocery (green) · 🛍️ Cute Shop (pink).

New accounts start with an empty list. The 14 example spots only appear when no one is signed in.

### Design tokens
- **Colors:** blue `#1B3DB8`, navy `#10183F`, orange `#FF6B1A`, yellow `#FFC425`, red `#E8242C`, pink `#F45FA0`, green `#1F9D6B`, purple `#7A4FD6`, cream background `#FFF3DF`.
- **Look: glass.** Floating controls, the tab bar, place cards and sheets are frosted glass (`GL` / `GL2` / `TILE` in `view.js`) over the colorful map; the other screens sit on a soft borough-colored backdrop (`--bgfx` in `index.html`). Small data labels (counts, walk times, legs) use **JetBrains Mono** (`var(--mono)`). Plain `background:#fff` in a style turns frosted automatically (in `S()`); write `#FFFFFF` when solid white is needed.
- **Notes** show one sentence per line (`noteLines` in `view.js`; abbreviations like Ave., St., a.m. don't break a line).
- **Layout follows the Claude Design canvas "NYC List Glass Redesign"** (Map, Place Card, Add A Spot, Shared List). Categories show line icons (`CAT_ICON` in `logic.js`, one per default category and per New Category emoji; others fall back to the emoji). Pins are frosted rings centered on the spot. Add A Spot has three modes (`addMode`: link, video, name) and found places are checkable (`aiSkip`). Lists have day tabs (`tripDay`) and estimated travel legs between stops. Delete Spot lives in Edit Spot.
- **Font:** **Archivo** (Google Fonts). Headings are 900 weight and italic. All UI text uses Title Case On Every Word.
- **Map palette "Apple" (default):** land `#F4F2EE`, water `#A6D1F0`, parks `#C3E5B8`, thin grey borough lines. The old "Colorful" palette (Manhattan `#FFE38F`, Brooklyn `#FFC09A`, Queens `#C4D0FF`, Bronx `#FFB5C9`, Staten Island `#D6C6F4`, water `#86C8EE`, parks `#7FCB8F`) is still available with `?style=Colorful`.
- **Photos:** a spot can have its own photo (place card → Photo / Change Photo; stored as `place.photo`, uploaded to `<user id>/spot-<id>.jpg`), else its first Google Maps photo via `/api/photo` once `GOOGLE_MAPS_API_KEY` is set (`placeImg()` in `logic.js`). Photos show on the place card banner, Explore results, Plan A Day stops (with a number badge) and list stops. A list can have its own photo (Edit List → List Photo; `data.photo`, `<user id>/list-<id>.jpg`). All photos use the `avatars` bucket from `supabase/avatars.sql`.
- **V5 mockup layouts (Oct 2026):** Map: one glass header card ("Spotted In NYC", big thin count + "Spots To Try", your photo, Visited / In Plan / sync row) and, once your location is known, a "Nearest To You" card that opens that spot. Place card: two-weight name (last word thin), a glass row of From Home / Price / nearest subway, round glass action bubbles (source, Plan, Visited, To List) and a Get There pill with an orange arrow button; Edit sits top right on the map. Plan A Day: map on top, big "Total Travel" glass card (total, walking, subway, stops), glass Start From switch, glass stop rows with dotted legs, Auto-Order pill and a yellow + for Add Spots. Shared list: two-weight list name, glass day switcher, a colored card per day (pink for Not On A Day Yet) with the stop count and Route In Google Maps, glass stop rows, From My Map / Share & Invite pills and photos in On This List.
- **V5 glass look (Oct 2026):** deep frosted panels (`GL`, `GL2`, `TILE`, `ROW` in `view.js`), cream backdrop with soft orange/pink/blue/yellow glows (`--bgfx`), headings with a bold italic first line and a thin second line, and a clear deep-glass tab bar (`GLX`) with a separate light glass + button (`GLX_LIGHT`).
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
| `SUPABASE_SERVICE_ROLE_KEY` | ☐ Not set yet | Delete My Account (required by Apple). Supabase → Project Settings → API Keys → secret key. |

- **Optional overrides:** `ANTHROPIC_MODEL`, `OPENAI_TRANSCRIBE_MODEL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`.
- **Supabase Storage:** profile photos need `supabase/avatars.sql` run once in Supabase → SQL Editor. Until then **Add Photo** says so. The app keeps `user_metadata.avatar_v` (a timestamp) to know you have a photo and to refresh it after a change; Delete My Account also deletes the photo.
- **Citi Bike:** read straight from Citi Bike's public GBFS feed (`gbfs.lyft.com/gbfs/2.3/bkn/en/`), no key.
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
- **Offline:** `sw.js` caches the app. Map data and libraries are served from the cache first; the page and code come from the network first. **Whenever files in `src/` change, bump `CACHE` in `sw.js`** (currently `nyc-list-v19`).

### Server functions (`/api`)
Vercel Node.js functions, CommonJS `module.exports = async (req, res)`. Files starting with `_` are helpers, not endpoints.

- Every endpoint first checks the caller's Supabase access token (`Authorization: Bearer …`) with Supabase, so only signed-in users can use the paid services.
- `extract.js` and `find.js` are allowed up to 60 seconds (`vercel.json`).

| Endpoint | Input | What it does |
|---|---|---|
| `POST /api/extract` | `{url?, notes?, transcript?, frames?, categories, neighborhoods}` | Reads the link, then calls Claude with a forced `save_places` tool. Returns `{places:[{name, category_id, neighborhood, address, price, note, confidence, lat?, lng?}], message}`. Each found place (except Google Maps links) is pinned server-side with Google Text Search (`pinPlace`); when the post gives a street address the match must be at that street number, else the address itself is pinned (chains have several branches). |
| `POST /api/find` | `{q, categories, neighborhoods}` | Claude with the `web_search` tool (up to 3 searches) finds NYC places by name. Same `places` shape. |
| `POST /api/places` | `{action:'auto', q, near, session}` or `{action:'detail', id, session}` or `{action:'find', q, city}` (best Text Search match, used first by `aiLocate`) | Google Places API (New) autocomplete limited to the five boroughs, then details (name, street address, neighborhood, location, types, price level). The same session id is used from typing through the pick, so Google bills it as one session. Answers 503 without the key; the app then uses Photon. |
| `POST /api/transcribe` | audio/wav body | OpenAI speech-to-text. |
| `GET /api/photo?q=&ll=` | name, address, pin | A spot's first Google Maps photo (Places API (New) Text Search biased to the pin, then the photo at ~600 px), streamed back as JPEG for `<img>`; answers only the app's own pages. `?probe=1` → 204 when `GOOGLE_MAPS_API_KEY` is set, 503 when not. Browser cache 1 day, CDN 1 week. The iPhone app's web view sends no Referer from capacitor://, so it's also accepted with `&app=ios` (build 5+) or the in-app WebKit user agent (iPhone, no "Safari/"). |
| `GET /api/geocode?q=…` | Nominatim search params | Forwards an OpenStreetMap address search with the site's name. The iPhone app uses it for `lookup()` because Nominatim refuses requests with no Referer. Cached a day. |
| `GET /api/bus` | — | NYC bus routes for the Bus layer from data.ny.gov (dataset `bzwk-3hb4`, current GTFS shapes): one simplified line per route, packed as deltas (~150 KB). No sign-in; the CDN caches it for a week. |

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

## 3b. iPhone app

The App Store version is the same website wrapped with Capacitor 8 in `native/`. See `native/README.md` for the Mac steps and `native/APP_STORE.md` for the listing.

- `native/scripts/copy-web.mjs` copies the site into `native/www`; `npm run sync` then copies it into the Xcode project (`native/ios/App`). Vercel ignores `native/` (`.vercelignore`).
- In the app, `NATIVE` is true (`src/runtime.js`). `API(path)` sends `/api` calls to `NYC_CONFIG.siteUrl` (`config.js`), and `SITE()` is used for invite and email links. The API functions answer CORS requests from `capacitor://localhost` (`cors()` in `api/_shared.js`).
- `src/native.js` (app only): native location permission, the iOS share sheet for invites, dark status-bar text, haptics on toasts, and the share inbox. The **Share extension** (`native/ios/App/ShareExtension`) saves a shared link into the app group `group.com.kotiskwok.nyclist`. The app reads it on open/resume (`AppGroup.takeLinks`) and opens Add A Spot with AI fill, one link after another.
- **Delete My Account** (Account sheet) calls `POST /api/delete-account`, which needs `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Apple requires in-app deletion.
- `privacy.html` and `support.html` are the App Store privacy-policy and support URLs.

## 4. File map

| File | What's in it | Edit it to… |
|---|---|---|
| `index.html` | Page shell: meta and PWA tags, all CSS (phone frame on desktop, full screen on phones), script load order | change global styles or add a script |
| `src/logic.js` | **All behavior**: colors `C`, categories `CATS0`, emojis, example `SEED` spots, link detection `detect` / `SRC` badges, map drawing (Leaflet panes, streets, subway, labels), filters, routing estimate, plan auto-order, add/edit/save, AI fill (`aiAuto`, `aiFill`, `aiVideo`, `aiApply`, `aiAddAll`), name suggestions and web search, shared links, sync hooks (`snapshot`, `applyRemote`, `resetLocal`), and `renderVals()` | change how anything works, or add new state/values for the view |
| `src/view.js` | **All screens**: `MapScreen`, `ExploreScreen`, `PlanScreen`, `PlaceCard`, `RouteSheet`, `Picker`, `TabBar`, `AddSheet`, `AccountSheet`, `AuthScreen`, `App`. Uses the helper `S('css string')` for inline styles; `T(n)` / `B(n)` offset for the status bar and safe areas. | change layout, text or look |
| `src/runtime.js` | `DCLogic` base class, `window.open` fallback, `APP_PROPS` (`?style=Minimal`, `?tab=Explore`) | rarely |
| `src/lists.js` | Shared lists: Supabase reads/writes, merge and invite joining (`NYCLists`), plus the Lists tab behaviour mixed into `Component` (`listVals()` feeds the view) | change how lists, sharing or invites work |
| `src/native.js` | iPhone-app-only bridges: location, share sheet, status bar, haptics, share-extension inbox | native behaviour |
| `api/delete-account.js` | Server: deletes the signed-in account (needs `SUPABASE_SERVICE_ROLE_KEY`) | — |
| `privacy.html`, `support.html` | Privacy policy and support pages for the App Store | policy text |
| `native/` | The iPhone app (Capacitor project, Share extension, icon) | iPhone-specific changes |
| `src/sync.js` | Supabase client, sign-in/up/out, three-way merge sync, `getToken()` | sync or sign-in behavior |
| `src/video.js` | On-device audio extraction (WAV pieces) and frame capture | video upload limits or quality |
| `api/extract.js` | Server: reads posts and links, calls Claude, returns places | AI prompt, platforms, model |
| `api/_gmaps.js` | Server helper: Google Maps link detection and parsing (name, query, pin) | Google Maps link formats |
| `api/find.js` | Server: Search The Web (Claude and web search) | web search prompt |
| `api/places.js` | Server: Google place search for name suggestions | Google fields, search area |
| `api/transcribe.js` | Server: OpenAI speech-to-text | transcription model or prompt |
| `api/_shared.js` | Server helpers: `send`, `requireUser` (Supabase token check), body readers | — |
| `config.js` | Supabase URL and publishable key, plus `siteUrl` (the live site the iPhone app calls) | switching Supabase projects or domains |
| `supabase/schema.sql` | Table `nyc_list` and row-level security | database changes |
| `supabase/lists.sql` | Shared-list tables, security rules and the join / preview / shared-map functions. Run once (safe to re-run). | shared-list database changes |
| `supabase/avatars.sql` | Public Storage bucket `avatars` for profile photos (`<user id>/avatar.jpg`, JPEG, 1 MB max), where each person can only write their own folder. Run once (safe to re-run). | photo storage rules |
| `api/bus.js` | Server: bus routes for the Bus layer | bus data source or simplification |
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

### Build 5 additions
- **Swipe stamps** (`DeckStamp(p, kind)` in `view.js`): while a deck card is dragged, a tinted glow on that side plus a liquid-glass readout (lens icon, ADD TO PLAN / SKIP, a bar that fills to the 90 px threshold, then LET GO). The card's own Skip and + buttons are unchanged. (Build 6.)
- **Swipe down to close a spot** (`dragDown(onClose)` ref helper in `view.js`, used on the `PlaceCard` section): starts when the sheet is scrolled to the top; closes past ~110 px or on a flick. Works from the map and from the Explore deck (closing returns to the deck).
- **Get There sheet shrinks**: drag its header down and it becomes a small bar above the tab bar (destination + fastest option); tap it or drag up to open it again. `state.routeMini`, `dragHandle(onDown, onUp)` in `view.js` (moves the nearest `[data-sheet]`). While a spot or Get There is open the map's Spots To Try banner, category chips and side buttons hide (`mapChrome`).
- **Reorder Wallet lists**: long-press a card (380 ms), drag up or down, let go. `walletDown`/`walletDrop`/`walletRef` in `lists.js`; the order is `state.listOrder` (list ids, front card first). It's per person and syncs in the main snapshot (`listOrder`, merged in `sync.js`). Lists not in it yet go in front. Card colors stay tied to creation order.

### Ideas not built yet
- Saving a shared link **in the background** from the iPhone share sheet without opening the app. This would need a server endpoint that writes to Supabase with the service-role key plus a personal token for the Shortcut.
- Directly downloading audio from Instagram or TikTok links (blocked by the platforms; 🎬 upload is used instead).
- Live updates without the 20-second refresh (Supabase Realtime), and per-person notes or votes on a list's spots.

### Apple Maps
- The maps use **Apple Maps (MapKit JS)** as their base when it's set up. `appleMaps()` in `logic.js` fetches a token from `/api/mapkit-token`, loads MapKit from Apple's CDN and calls `attachApple(m)` for each map. Apple's map is drawn underneath Leaflet and follows every move (`m.appleSync`). Pins, subway, routes and taps all stay on Leaflet. On the main map MapKit is padded `APPLE_PAD` px at the bottom, so Apple's logo and Legal link sit above the tab bar.
- Vercel env: `MAPKIT_TEAM_ID`, `MAPKIT_KEY_ID`, `MAPKIT_PRIVATE_KEY` (the .p8 text). Without them, or if MapKit fails, the app keeps the colorful map. Tokens only go to the live site, `nyc-*-kotis1.vercel.app` previews and the iPhone app.
