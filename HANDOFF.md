# Spotted In: Project Handoff

Everything a new chat needs to keep working on **Spotted In**: what the app does, how it looks, where everything lives, how it's built, and how to work on it with Claude.

---

## 1. What Spotted In is

**Spotted In** is Kotis's map of places she's been meaning to try (restaurants, cafes, bakeries, gourmet groceries, cute shops), saved straight from TikTok, Instagram, Threads and Google Maps. Share or paste a post and AI reads the caption, photos, on-screen text and what's said in the video, finds the places, and pins them on the map with the nearest station and the travel time. It also plans a day out and keeps shared trip lists with friends.

It has six maps, each with its own spots, home and day plan:

| Map | Button | Transit used for travel times |
|---|---|---|
| New York City | NYC 🗽 | Subway |
| Singapore | SG 🦁 | MRT & LRT |
| Hong Kong | HKG 🌃 | MTR, trams, ferries |
| Toronto | TO 🍁 | TTC subway, LRT, streetcars |
| Boston | BOS 🦞 | The T (Red, Orange, Blue, Green B/C/D/E, Mattapan, Silver Line) |
| New York State | NYS 🏞️ | Driving, and Metro-North / LIRR / Amtrak from NYC |

The app is built around the major cities. New York State is the last map in the list, for day trips and weekends away outside the city.

- **Website (also installs to the home screen):** https://nyc-lovat.vercel.app
- **iPhone app:** the same site wrapped with Capacitor, on TestFlight as **"Spotted in: Places To Go"**.
- **Accounts:** email and password; everything syncs between devices.

---

## 2. Working on it with Claude

### Apps and connections to set up in Claude
Set these up once. Then Claude can make changes directly, from code to the live site to the iPhone project.

| What | Why Claude needs it | How to set it up |
|---|---|---|
| **The Claude Project "Spotted On:"** | Holds this handoff (`claude/HANDOFF.md`). Every new chat in the project can read it. | Start new chats inside the project. |
| **GitHub** (repo `kotiskwok/NYC-List`, branch `main`) | Claude reads and edits the code and pushes. **Every push to `main` deploys the website automatically** (Vercel). The repo also has a copy of this handoff (`HANDOFF.md`) and short rules (`CLAUDE.md`). | Connect GitHub in Claude (Settings → Connectors), then ask Claude to work in `kotiskwok/NYC-List` with **push** access. |
| **Claude desktop app on the Mac, linked to the chat** | Lets Claude update the Xcode project on the Mac (pull the code, copy the website in, `cap sync`). | Open the chat in the Claude desktop app and choose **Link to this computer**. Approve folder access to **Documents › Spotted In App** and the **delete permission** (git needs it to replace files) when asked. Keep the Mac awake with the app open while Claude works. |
| **Built-in browser** (the browser pane in the Claude desktop app) | Claude uses it to check the live site, read Vercel logs, manage TestFlight in App Store Connect, and look at Instagram and TikTok posts. | Stay signed in to these sites in the browser pane, and approve them when Claude asks: `nyc-lovat.vercel.app`, `vercel.com`, `github.com`, `appstoreconnect.apple.com`, `developer.apple.com`, `supabase.com`, `console.cloud.google.com`, `platform.openai.com`, `console.anthropic.com`, `instagram.com`, `tiktok.com`. |
| **Computer use: Xcode** (optional) | Claude can see Xcode, but Xcode is a "click-only" app for Claude, so it can't use Xcode's menus or archive. | Approve Xcode when Claude asks. **You** do Product → Archive → Upload. |
| **Design canvas "Spotted In Icon Options"** (a claude.ai artifact) | Where Claude lays out visual options to pick from (icons, the share card). Find it in your artifacts. | Ask Claude to add new options to it, or to start a new canvas. |

**What Claude won't do (do these yourself):** type or paste passwords or API keys, accept Apple agreements, and press Archive or Upload in Xcode. Claude opens the right pages and tells you exactly what to click.

### Starter message for a new chat
> I'm working on my app **Spotted In** (GitHub repo **kotiskwok/NYC-List**, live at https://nyc-lovat.vercel.app, iPhone app via Capacitor in `native/`). Please read `HANDOFF.md` in the project first, then attach the repo with push access. Then help me with: [your request].

---

## 3. Screens and features

### Map tab
- **Apple Maps** as the base map (MapKit JS). If it's ever unavailable, the app draws its own map in Apple Maps colours.
- **Header card:** "Spotted In" with the yellow **city button** (NYC ▾) that opens **Pick A City** (each map with its spot count and transit name), a big count of **Spots To Try**, your profile photo with a sync dot (tap for **Your Account**), and Visited / In Plan counts.
- **Category chips** filter the pins. Each pin is a frosted ring with the category's line icon, or the spot's photo.
- **Open Now** chip (after All Spots) shows only spots open right now, in that map's local time. Hours are looked up the first time a spot is opened, or for every spot when the chip is turned on.
- **Nearest To You** card, once your location is known.
- **Map Layers** (per map; bike docks show live bike and dock counts):

| Map | Layers |
|---|---|
| NYC | Subway, Bus routes, Citi Bike |
| Singapore | MRT/LRT, Buses |
| Hong Kong | MTR, Buses, Trams, Ferries |
| Toronto | Subway/LRT, Streetcars, Buses, Bike Share Toronto |
| Boston | The T stations, MBTA Buses & Silver Line, Ferries, Bluebikes |
| New York State | Metro-North, LIRR & Amtrak stations |

- **New York State map:** opens zoomed out on the whole state. Spots get a town as their neighborhood (Hudson, Beacon, Montauk…), grouped into regions (Long Island, Westchester, Hudson Valley, Catskills, Capital Region, Adirondacks & North Country, Finger Lakes & Central NY, Western NY). It uses your NYC home until you set one there, since trips upstate usually start in the city.
- **My Location** button. If location fails, you can tap where you are.
- While a spot or directions are open, the header, chips and side buttons hide so the map is clear.

### Place card (tap a pin)
- Photo banner (your own photo, or the spot's first Google Maps photo), the category, neighborhood and source, the name in two weights, and a glass row with **From Home** (minutes, or hours for long trips) / **Price** / **Nearest station** with its line badges and walking time. On the New York State map the station cell shows the nearest Metro-North, LIRR or Amtrak station. The note shows one sentence per line.
- Round glass buttons: open the source post (TikTok / Instagram / Threads / Google Maps), **Plan**, **Visited**, **To List**, **Photo**, **Edit**. Then a **Get There** pill.
- **Swipe the card down to close it.** From Explore, that returns you to the deck.

### Get There
- Start from **My Location**, **Home** or **A Saved Spot**.
- In the cities: an estimated route by subway/MRT/T/streetcar/tram/ferry with the line badges, transfers and walking legs, compared with walking. The route is drawn on the map in each line's colour.
- On the New York State map: a **Drive** estimate, and a **Train** option (subway to Grand Central or Penn Station, then Metro-North, LIRR or Amtrak to the nearest station, then a walk or short drive). The fastest is marked.
- Each option has a button that opens Google Maps (transit, walking or driving) for live times.
- **Drag the sheet down** to shrink it to a small bar above the tab bar (destination plus fastest option) and see the map. Tap it or drag up to open it again.

### Explore tab ("Where To Today?")
- Search (name, area, address, note), category chips, a glass **matches** card (count, neighborhoods, a colour bar by category, price), and a filter button (price for restaurants, neighborhoods by region, Hide Visited).
- **Open Now** toggle next to Hide Visited. Each place card shows "Open · Closes 10 PM" / "Closed · Opens Tue 8 AM".
- **Vibe Search:** type a few words ("cozy cafe to work near home") and tap the purple ✨ Vibe Search pill. AI picks the best-fitting saved spots, best first, with a short reason on each deck card. **Back To Keywords** returns to the normal search.
- **Shuffle The Deck:** swipeable cards showing minutes away (or from home). Swipe right (or the orange **+**) adds to the plan; swipe left (or **✕**) skips; tap opens the spot. While you drag, the card **floods green (Plan) or red (Skip)** from that side, a big "Plan"/"Skip" slides in, and a light bar fills until it says LET GO ✓. **See All** shows the matches as a list or map, with Add All To Plan.

### Route tab (Plan A Day)
- Full-screen map with the dotted route and numbered pins. A glass panel shows total travel, a ride-vs-walk bar, when you're done or home, and **Start From** (First Stop / Home / My Location).
- A pull-up timeline: **Leave At** time, a **STAY** chip on each stop (15 min–3 hrs), and arrival times. Each leg shows line badges, walking minutes, or a car for long drives on the New York State map. **Auto-Order**, reorder, remove, Add Spots, Clear, and **Start Route In Google Maps**.

### Lists tab (shared trip lists, e.g. "Sonia's Visit")
- **Wallet:** lists are stacked coloured cards like Apple Wallet. The front card shows dates, a countdown ("In 14 days", "Day 2 of 3"), the people on it and how it's shared; **Up Next** shows its first stop. **Hold a card and drag it up or down to reorder** (with haptics on iPhone). The order syncs with your account.
- **+ New List:** a name, optional number of days and an optional first date. Add spots **From My Map** or as **New Spot** (on the list only). Day chips with dates, a day colour per pin, travel time between stops, and a **Route ↗** per day. **Edit** changes the name, days and date, and sets a list photo.
- **Share & Invite** (owner): share **Just This List** (friends can add, sort, remove), **Just My Map** (view-only, never your home) or **Both**, by invite link `/?join=<code>`. Friends sign up with a name and land on the list. A live **"Sonia Is Here"** tag shows when someone else has the list open. Edits sync within about a second.

### Add A Spot (+)
- **Paste A Link** (TikTok, Instagram, Threads, Google Maps, any website). AI fills in the spot on its own:
  - **TikTok:** caption, location tag, auto-captions, **watches the video** (frames for on-screen text plus speech-to-text), or every photo of a photo post.
  - **Instagram:** caption, **every photo of a carousel**, and **watches reels** (frames plus speech-to-text).
  - **Threads:** post text and image. **Google Maps:** the exact place and pin.
  - Posts with several places show a checklist with **Add All N To My Map**. Every found place comes back already pinned (Google's place search; for chains, the branch at the post's street address).
  - If the spots are on **another of the app's maps** (another city, or upstate New York), it asks, e.g. "These Spots Are In Boston. **Switch To BOS** / Stay In NYC".
- **From A Video:** pick a video saved on the phone. The app pulls the audio and stills on the phone, and AI finds the places.
- **By Name:** suggestions from Google as you type (limited to the current map's area), or **Search The Web** (AI with web search).
- Location by address search, a pin you drop, or just a neighborhood. Then Category (or **+ New Category** with an emoji and colour), Price, Neighborhood and Notes.

### Sharing into the app
- **iPhone app:** **Share → Spotted In** from any app. A dark glass **ticket** drops in at the top. A blue stub shows a yellow pin with ✓ and SAVED, then a tear line, "Saved To Spotted In", **FROM** (TikTok / Instagram / Threads / Google Maps / site) and **TO** (My Map · current map), with **Undo** and **Done**. It closes by itself after about 3 seconds. The app fills the spot in the next time it opens.
- **Website:** `https://nyc-lovat.vercel.app/?add=<link>` opens Add A Spot with the link. Android's share menu works through the web manifest, and an iPhone Shortcut can open that link.

### Account, sign-in and welcome
- **Sign-in screen** with the Spotted In logo, email/password, and a show-password eye. Invite links show "Kotis Invited You".
- **Welcome pages** on first sign-in: name, home city (NYC, SG, HKG, TO or BOS), Home address (optional).
- **Your Account:** sync status, profile photo, sign out, **Delete My Account** (needs `SUPABASE_SERVICE_ROLE_KEY`, see §5).

### Default categories
☕ Coffee Shop (orange) · 💻 Coffee Shop To Work At (blue) · 🍽️ Restaurant (red) · 🥐 Bakery (yellow) · 🧀 Gourmet Grocery (green) · 🛍️ Cute Shop (pink). New accounts start empty. Example spots only show when no one is signed in.

---

## 4. Look and brand

- **Colours:** blue `#1B3DB8`, navy `#10183F`, yellow `#FFC425`, red-orange shadow `#E5402B`, orange `#FF6B1A`, red `#E8242C`, pink `#F45FA0`, green `#1F9D6B`, purple `#7A4FD6`, cream `#FFF3DF`.
- **Type:** **Archivo** (variable: weight 900, width 72% for the SPOTTED wordmark). Headings are bold italic, with a thin second word. Small data labels use **JetBrains Mono**. All UI text is Title Case On Every Word.
- **Liquid glass:** floating controls, cards, sheets and the tab bar are frosted glass (`GL`, `GL2`, `GLX`, `TILE`, `ROW` in `view.js`) over the map or a soft cream backdrop with colour glows (`--bgfx`). Plain `background:#fff` in a style turns frosted automatically. Write `#FFFFFF` for solid white.
- **Logo (design "E2a"):** **SPOTTED** in chunky yellow with a stacked red-orange shadow, the **O drawn as a yellow map pin** (with a blue dot), over a **navy "in" pill** with a red you-are-here dot and an upright yellow "in". Used for:
  - **App icon:** on the app blue. Source `native/design/app-icon.html` (open it in a browser to re-export).
  - **Sign-in screen:** `Logo()`, `Wordmark()`, `InPill()` in `view.js`.
  - **iPhone launch screen.**
- **Source badge colours:** TikTok navy, Instagram `#D9367F`, Threads `#2B2B2B`, Google Maps green, Website blue, Added By Name grey.
- **Line badges:** each city's official line colours (NYC subway bullets, MTR, MRT, TTC, MBTA: RL red, OL orange, BL blue, B/C/D/E green, M red, SL silver; MN/LI/AM for Metro-North, LIRR and Amtrak).
- **Map palette:** Apple-style (land `#F4F2EE`, water `#A6D1F0`, parks `#C3E5B8`). The colourful palette is still there with `?style=Colorful`.

---

## 5. Services and keys

| Service | What it does | Where |
|---|---|---|
| **GitHub** | The code, and the Action that builds transit route lines | Private repo `kotiskwok/NYC-List`, branch `main` |
| **Vercel** | Hosts the site and runs `/api`. Every push to `main` redeploys. | vercel.com → team **kotis1** → project **nyc** → https://nyc-lovat.vercel.app |
| **Supabase** | Sign-in, database, realtime, photo storage | Project `https://octgaltlmqwcqewbxocb.supabase.co` |
| **Anthropic** | AI that reads posts and finds places (`claude-haiku-5-5`) | console.anthropic.com |
| **Google Cloud** | Places API (New): name suggestions, pinning found places, spot photos | console.cloud.google.com (kwokshulum@gmail.com) |
| **OpenAI** | Speech-to-text for videos and reels (`gpt-4o-mini-transcribe`, fallback `whisper-1`) | platform.openai.com |
| **Apple** | Apple Maps (MapKit JS), the developer account, App Store Connect / TestFlight | developer.apple.com, appstoreconnect.apple.com (team `KQ79GMTSY2`) |
| **OpenStreetMap** | Address search (Nominatim; the iPhone app goes through `/api/geocode`), Photon suggestions fallback, station/neighborhood data and the non-NYC transit lines (Overpass) | No key |
| **Transit feeds** | NYC buses (data.ny.gov); live bike docks for Citi Bike, Bike Share Toronto and Bluebikes (public GBFS feeds) | No key |

**Secret keys live only in Vercel** → project nyc → Settings → Environment Variables. Never put them in code or chat. After adding one, redeploy (any push, or Redeploy in Vercel).

| Variable | Status | Turns on |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ set | All AI reading of links, videos and web search |
| `GOOGLE_MAPS_API_KEY` | ✅ set | Google suggestions, pinning, spot photos |
| `OPENAI_API_KEY` | ✅ set | Hearing what's said in videos and reels |
| `MAPKIT_TEAM_ID`, `MAPKIT_KEY_ID`, `MAPKIT_PRIVATE_KEY` | ✅ set | Apple Maps base map |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **not set** | **Delete My Account.** Apple requires this before full App Store review. Supabase → Project Settings → API Keys → secret key. |

- **Public values** (safe, already in `config.js` and as fallbacks in `api/_shared.js`): the Supabase URL and the publishable key `sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg`.
- **Supabase setup:** Authentication → Site URL is the Vercel address; "Allow new users to sign up" stays **on** (friends join lists). SQL files run once (safe to re-run): `supabase/schema.sql`, `supabase/lists.sql`, `supabase/avatars.sql`.
- **Quick checks:** `GET /api/extract?probe=1` → `{"ffmpeg":true,"speech":true}`. `GET /api/photo?probe=1` → 204 when Google photos work.

---

## 6. How it's built

### Front end
- A **static site with no build step.** `index.html` loads React 18.3.1, htm 3.1.1 (JSX-like templates), Leaflet 1.9.4 and supabase-js 2.117.2 from `vendor/`, then the data files in `data/`, then `src/*.js`.
- **Structure:**
  - `src/logic.js`: `class Component extends DCLogic` (state, behaviour, and `renderVals()`, which returns every value and handler the view uses).
  - `src/view.js`: htm templates for every screen.
  - `src/lists.js`: mixes the Lists tab into `Component`; its values come from `listVals()`.
  - `src/runtime.js`: the base class.
- **New UI state** goes in the `state` initializer, and **new values and handlers** in `renderVals()`.
- **Offline:** `sw.js` caches the app and the data files. **Bump `CACHE` in `sw.js` whenever `src/` or `data/` changes**, and add any new data file to its `CORE` list.

### Data and sync
- **Local copy:** `localStorage['nycList.v1']`; the current map in `localStorage['nycList.city']`. **Cloud:** one JSON row per user in `nyc_list` (row-level security).
- **Synced snapshot:** `{places (every map's spots, each tagged city), cats, home, plan (NYC's), cities:{sg,hk,to,bos,nys}:{home, plan}, city, listOrder}`.
- `src/sync.js` does a three-way merge against the last synced base about a second after any change, and on resume or coming back online. City, home and plan merge per map.
- **Place:** `{id, name, cat, area, lat, lng, url, source, address, note, price 0-4, visited, city?, photo?, hours?}`. `hours` = `{p:[[openDay, openMin, closeDay, closeMin]…], s: businessStatus, t: checkedAt}` or `{none:1, t}` (days 0 = Sunday, local minutes). (no `city` means NYC). Category `{id, name, color, emoji}`. Plan `{ids, start, leave, stay}`. Home `{lat, lng, area}`.
- **Shared lists** (`supabase/lists.sql`):
  - `nyc_trips`: owner, name, sharing flags, invite code, `rev`, and `data {stops, days, start, cats, photo}`.
  - `nyc_trip_members`, plus the functions `nyc_join_trip`, `nyc_trip_preview` and `nyc_shared_map`.
  - Same merge as the main list, plus an optimistic `rev` check. Presence uses Supabase Realtime (`nyc-list-<id>`).
- **Photos:** Storage bucket `avatars`: `<user>/avatar.jpg`, `<user>/spot-<id>.jpg`, `<user>/list-<id>.jpg`.

### Maps (cities)
- **`CITIES` in `logic.js`**: per map `id`, `name`, `short`, `emoji`, `center`, `box` (search area, [south, west, north, east]), `bounds` (how far the map pans), `regions` (Explore filter groups), `transit`, `layerSub`, `layers` (`bus`, `tram`, `ferry`, `bike`) with their labels, and the bike-share GBFS feed. New York State also has `z` (opening zoom) and `minZ`. **`CITY_ORDER`** = `nyc, sg, hk, to, bos, nys` sets the order in Pick A City (the welcome pages leave NYS out).
- `setCity()` switches map (spots, home, plan, filters); `cityMoved()` re-centers and redraws. `state.places` holds the current map's spots and `state.otherPlaces` the rest.
- **Station and neighborhood data:**
  - NYC: `data/nyc-map-data.js` (neighborhood shapes), `data/nyc-subway-data.js`, `data/nyc-streets-data.js`.
  - Singapore, Hong Kong, Toronto, Boston: `data/city-data.js` → `window.CITY_DATA[city]` = `{hoods:[{n, b region, c}], st:[{id, n, r lines, c, k?}], lines:{code:{t, bg, fg, v speed km/min, w wait min, m mode}}}`. Stops with `k:1` (Toronto streetcars, Hong Kong trams and ferries, Boston's Silver Line) count for travel times but aren't drawn as stations. Boston's neighborhoods are grouped Boston / Cambridge / Somerville / Brookline / Nearby.
  - New York State: `data/nys-data.js` → `window.NYS` = `{regions, area (state outline), towns:[name, region, lat, lng], hubs (Grand Central, Penn Station), lines (MN/LI/AM badges, hub), rail:[name, line, lat, lng, minutes from hub]}`.
- **Travel estimates (`logic.js`):** `estimate(a, b)` finds the best ride between the stations near each end (with one transfer), using each line's speed and wait, compared with walking. On the New York State map it also gives `drive` and `rail` (subway to the hub, regional train, then walk or drive); `bestOf()` picks the quickest. Helpers: `inBox` (inside a map's area; NYS uses its outline), `inCore` (inside the five boroughs), `reach` (whether a trip can be estimated), `NYCISH()` (NYS uses NYC's subway to reach the hubs), `homeFor()` (NYS falls back to the NYC home), `hoodAt` (neighborhood or town for a point).
- **Bus, tram, streetcar and ferry route lines:**
  - Other cities: static files `data/routes/<city>-<kind>.json` (`sg-bus`, `hk-bus`, `hk-tram`, `hk-ferry`, `to-bus`, `to-tram`, `bos-bus`, `bos-ferry`), built from OpenStreetMap by the GitHub Action **Build transit routes** (`.github/workflows/routes.yml` → `scripts/build-routes.js` → `api/_osmroutes.js`, where `BOX` and `FILTER` set each layer). It runs weekly and whenever the builder changes. The shared Overpass servers are slow, so each run commits whatever layers finished (even if it stops early), and skips layers built in the last 20 days. Run it by hand from GitHub → Actions → Build transit routes → **Run workflow** (tick **force** to rebuild everything). A layer whose file isn't there yet shows "Not Available Right Now".
  - NYC buses: `/api/bus` (MTA data).
  - The app (website and iPhone) loads route files from the live site, so they don't need a new iPhone build.
- **Server side:** `CITIES` in `api/_shared.js` mirrors the maps (`box`, plus `poly` = the New York State outline). AI prompts are written for NYC and `localize()` swaps in each map's area, names and examples. The AI also answers `post_city` (`nyc`, `sg`, `hk`, `to`, `bos`, `nys`), which drives the "Switch To…" question.

### Server functions (`/api`, Vercel Node, CommonJS)
Endpoints check the caller's Supabase token, except `photo`, `geocode`, `bus` and `mapkit-token`.

| Endpoint | What it does |
|---|---|
| `POST /api/extract` | Reads a link and asks Claude (forced `save_places` tool, with `post_city`) for the places. See "How links are read" below. |
| `POST /api/find` | Search The Web: Claude with web search finds places by name. |
| `POST /api/places` | Google Places (New): `auto` (suggestions), `detail`, `find` (best match), limited to the current map's area. |
| `GET /api/photo?q=&ll=` | A spot's first Google photo as a JPEG. It only answers the app's own pages; the iPhone app is recognised by `&app=ios` or its web view. |
| `GET /api/geocode` | OpenStreetMap address search for the iPhone app (Nominatim refuses requests without a Referer). |
| `POST /api/hours` | Opening hours for up to 25 spots (Google Places), stored on each spot as `hours` and refreshed monthly. Powers **Open Now**. |
| `POST /api/vibe` | **Vibe search**: Claude ranks the user's own saved spots against a plain-language request (no web search). |
| `POST /api/transcribe` | OpenAI speech-to-text for phone videos. |
| `GET /api/bus` | NYC bus route lines. |
| `GET /api/mapkit-token` | Apple Maps token, only for the live site, previews and the iPhone app. |
| `POST /api/delete-account` | Deletes the signed-in account (needs the service-role key). |

**How links are read (`api/extract.js`):**
- **TikTok:** the **desktop** page (`tiktokPage`) gives the caption, location tag, photo-mode images and the video file. The video downloads with that page's cookies. TikTok's own captions are used too.
- **Instagram:** the `/embed/captioned/` page gives the caption, every carousel photo (`edge_sidecar_to_children`), or the reel's `video_url`.
- **Videos:** `watchVideo` grabs about one frame every 5 seconds (6–12, using `ffmpeg-static`, bundled through `includeFiles` in `vercel.json`) plus speech-to-text.
- **Google Maps** (`api/_gmaps.js`): follows share links **asking as a phone** and reads the name, address and exact pin.
- **Threads and other sites:** `og:` tags.
- **Every result:** places are pinned with Google (`pinPlace`, inside the post's map area; for chains, the match has to be at the post's street number) and the response says which map they belong to.
- **Limits:** `extract` and `find` may take up to 60 s. The root `package.json` exists only for `ffmpeg-static`.

---

## 7. iPhone app

- **Capacitor 8** project in `native/`. Bundle IDs: `com.kotiskwok.nyclist` (app) and `com.kotiskwok.nyclist.share` (Share extension). Team `KQ79GMTSY2`. iOS 15+, iPhone, portrait. App group `group.com.kotiskwok.nyclist`, URL scheme `nyclist://`.
- The app bundles its own copy of the website (`native/www` → `native/ios/App/App/public`). In the app `NATIVE` is true: use `API('/api/...')` for server calls and `SITE()` for shareable links.
- **`src/native.js`** handles native location, the share sheet, status bar, haptics (`NYCNative.tap()`), the share inbox (`AppGroup.takeLinks`), and telling the share card the current map (`NYCNative.setCity`).
- **Share extension:** `native/ios/App/ShareExtension/ShareViewController.swift`, the SwiftUI ticket card (iOS 15 APIs only). Links wait in the app group under `pendingLinks`; the map's short name is under `currentCity` (`AppGroupPlugin.swift`).
- **Icon and launch screen:**
  - App icon: `native/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024², no transparency).
  - Launch screen: `Splash.imageset` (2732²).
  - Website icons: `icons/`.

### App Store Connect / TestFlight
- App **"Spotted in: Places To Go"** (Apple ID `6828702049`), version 1.0. Listing text, privacy answers and review notes: `native/APP_STORE.md`. Screenshots: `native/screenshots/`.
- **TestFlight groups:**
  - **Kotis' Inner Circle** (internal): no review, so builds arrive right away.
  - **Friends Beta** (external): needs Beta App Review for the first build; a **public invite link** works once a build there is approved ("Ready to Test").
  - The Test Information (beta description, feedback email, privacy URL, review notes, demo sign-in) is filled in.
- **What to Test** is set per build. The introduction for first-time testers is in the latest build's notes.

### Shipping a new build
1. **Bump the build number** (Claude, in the repo): `CURRENT_PROJECT_VERSION` in `native/ios/App/App.xcodeproj/project.pbxproj`, all four lines (App and ShareExtension, Debug and Release). Push it.
2. **Update the Mac's project** (Claude through the linked Mac, or you): the project lives in **Documents › Spotted In App**, a clone of the repo.
   - Yourself, in Terminal: `cd ~/Documents/"Spotted In App" && git pull && cd native && npm run sync`.
   - Claude through the linked Mac: its shell is a Linux sandbox where the folder is mounted under `/sessions/<id>/mnt/Spotted In App` (not `/Users/...`). It needs the folder's **delete permission** for `git pull`. `npm run sync`'s copy step fails there, so it removes `native/www`, copies `index.html`, `config.js`, `manifest.webmanifest`, `privacy.html`, `support.html` and the `src`, `vendor`, `data`, `icons` folders in with `cp -R`, checks them with `diff -rq`, then runs `npx cap sync ios`.
3. **In Xcode** (you): open `native/ios/App/App.xcodeproj` (reopen it if it was already open), choose **Any iOS Device (arm64)**, then **Product → Archive → Distribute App → App Store Connect → Upload**.
4. **In App Store Connect** (Claude can do this in the built-in browser, once the upload has processed, about 10–30 minutes): add the What to Test notes, add the build to Kotis' Inner Circle and Friends Beta, and submit to Beta App Review if asked.

Changes that only touch `api/` (how links are read, prompts, keys) or `data/routes/` go live right away and **don't need a new build**. Anything in `src/`, `index.html`, `data/` (other than routes), `icons/` or `native/` does.

---

## 8. File map

| File | What's in it |
|---|---|
| `index.html` | Page shell, global CSS, fonts, script order |
| `src/logic.js` | All behaviour: maps (`CITIES`), categories, Leaflet maps and layers, travel estimates, Explore deck, plan, Add A Spot and AI fill, sync hooks, `renderVals()` |
| `src/view.js` | All screens and the logo; glass styles; drag helpers (`dragDown`, `dragHandle`); deck swipe stamps (`DeckStamp`); Get There sheet (`RouteSheet`) |
| `src/lists.js` | Shared lists (`NYCLists`), the Wallet (including long-press reorder), invites, presence |
| `src/sync.js` | Supabase client, sign-in, three-way merge sync |
| `src/native.js` | iPhone-only bridges |
| `src/video.js` | On-phone video audio and frame extraction |
| `src/runtime.js` | Base class, `NATIVE`, `API()`, `SITE()` |
| `api/*.js` | Server functions (above). `_shared.js` (CORS, auth, maps, prompt localizing), `_gmaps.js`, `_osmroutes.js` are helpers. |
| `data/nyc-*.js` | NYC neighborhoods, subway, streets |
| `data/city-data.js` | Singapore, Hong Kong, Toronto and Boston neighborhoods, stations and lines |
| `data/nys-data.js` | New York State outline, towns, regional rail stations |
| `data/routes/` | Transit route lines (generated by the Action, don't hand-edit) |
| `scripts/build-routes.js`, `.github/workflows/routes.yml` | Weekly transit-line builder |
| `supabase/*.sql` | Database tables, security rules, functions, storage bucket |
| `sw.js` | Offline cache (bump `CACHE` when `src/` or `data/` changes) |
| `manifest.webmanifest`, `icons/` | Home-screen name and icons, Android share target |
| `vercel.json` | Function limits, `includeFiles` for ffmpeg, cache headers (use `/path/:path*` patterns) |
| `config.js` | Supabase URL and publishable key, `siteUrl` for the iPhone app |
| `privacy.html`, `support.html` | App Store privacy and support pages |
| `native/` | iPhone app: Xcode project, Share extension, `scripts/copy-web.mjs`, `design/app-icon.html`, `APP_STORE.md`, `README.md` |
| `CLAUDE.md` | Short rules for Claude in the repo |
| `HANDOFF.md` | This document |

---

## 9. Rules for working on it

- **No build step.** Edit `src/*.js` and `api/*.js` directly; views stay as htm templates in `view.js`.
- **Bump `CACHE` in `sw.js`** whenever `src/` or `data/` changes, so installed phones update.
- **Secrets only in Vercel.** Never in code, chat or files.
- **`vercel.json` header sources** must use `/path/:path*` patterns (grouped regex patterns fail to deploy).
- **Adding a map (city):** add it to `CITIES` and `CITY_ORDER` in `logic.js`, its neighborhoods/stations/lines to `data/city-data.js`, its `box` (and prompt names) to `CITIES` in `api/_shared.js`, its code to `post_city` in `api/extract.js`, its bus/tram/ferry layers to `BOX`/`FILTER` in `api/_osmroutes.js`, and its bike-share GBFS feed to its `bike` entry. Claude's workspace can't reach OpenStreetMap, MBTA-style transit sites or most of the web from its shell, but GitHub Actions can: fetch station data with a temporary workflow that commits a raw file, process it, then delete the workflow.
- **Test locally** with `python3 -m http.server` from the repo root and `window.NYC_CONFIG={}` served for `config.js` (local mode, no sign-in). Seed `localStorage['nycList.v1']` and `nycList.city` with test spots, stub `/api/*` and `NYCSync.getToken` when testing AI flows. Playwright and Chromium work for screenshots; `window.__nycMaps` exposes the Leaflet maps.
- **Swift changes** can't be compiled in Claude's Linux workspace. Typecheck them on a GitHub macOS runner (`xcrun swiftc -typecheck -sdk <iphoneos> -target arm64-apple-ios15.0`) through a temporary workflow, then remove it.
- **GitHub from Claude's workspace:** use `gh api` (REST) for Actions runs and logs; GraphQL isn't available.
- **Fetching from social sites on the server:** Google Maps links as a phone; TikTok as desktop Chrome; Instagram through the embed page.
- **Design work:** lay options out on a Design canvas artifact first, then build the chosen one.

## 10. Not built yet
- **Delete My Account** needs `SUPABASE_SERVICE_ROLE_KEY` in Vercel before full App Store review.
- Saving a shared link in the background, without opening the app.
- Per-person notes or votes on list spots.
