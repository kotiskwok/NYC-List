# Spotted In: Project Handoff

Everything a new chat needs to keep working on **Spotted In**: what the app does, how it looks, where everything lives, how it's built, and how to work on it with Claude.

---

## 1. What Spotted In is

**Spotted In** is Kotis's map of places she's been meaning to try (restaurants, cafes, bakeries, gourmet groceries, cute shops), saved straight from TikTok, Instagram, Threads and Google Maps. Share or paste a post and AI reads the caption, photos, on-screen text and what's said in the video, finds the places, and pins them on the map with the nearest station and the travel time. It also plans a day out, keeps shared trip lists with friends, and works in four cities: **New York, Singapore, Hong Kong and Toronto**. The New York map also stretches over **all of New York State** (plus nearby New Jersey and Connecticut) for day trips and weekends away.

- **Website (also installs to the home screen):** https://nyc-lovat.vercel.app
- **iPhone app:** the same site wrapped with Capacitor, on TestFlight as **"Spotted in: Places To Go"**.
- **Accounts:** email and password; everything syncs between devices.

---

## 2. Working on it with Claude

### Apps and connections to set up in Claude
Set these up once. Then Claude can make changes directly, from code to the live site to the iPhone project.

| What | Why Claude needs it | How to set it up |
|---|---|---|
| **The Claude Project "NYC List"** | Holds this handoff (`claude/HANDOFF.md`). Every new chat in the project can read it. | Start new chats inside the project. |
| **GitHub** (repo `kotiskwok/NYC-List`, branch `main`) | Claude reads and edits the code and pushes. **Every push to `main` deploys the website automatically** (Vercel). | Connect GitHub in Claude (Settings → Connectors), then ask Claude to work in `kotiskwok/NYC-List` with **push** access. |
| **Claude desktop app on the Mac, linked to the chat** | Lets Claude update the Xcode project on the Mac (pull the code, copy the website in, `cap sync`). | Open the chat in the Claude desktop app and choose **Link to this computer**. Approve folder access to **Documents › Spotted In App** and the delete permission when asked. Keep the Mac awake with the app open while Claude works. |
| **Built-in browser** (the browser pane in the Claude desktop app) | Claude uses it to check the live site, read Vercel logs, manage TestFlight in App Store Connect, and look at Instagram and TikTok posts. | Stay signed in to these sites in the browser pane, and approve them when Claude asks: `nyc-lovat.vercel.app`, `vercel.com`, `appstoreconnect.apple.com`, `developer.apple.com`, `supabase.com`, `console.cloud.google.com`, `platform.openai.com`, `console.anthropic.com`, `instagram.com`, `tiktok.com`. |
| **Computer use: Xcode** (optional) | Claude can see Xcode, but Xcode is a "click-only" app for Claude, so it can't use Xcode's menus or archive. | Approve Xcode when Claude asks. **You** do Product → Archive → Upload. |
| **Design canvas "Spotted In Icon Options"** (a claude.ai artifact) | Where Claude lays out visual options to pick from (icons, the share card). Find it in your artifacts. | Ask Claude to add new options to it, or to start a new canvas. |

**What Claude won't do (do these yourself):** type or paste passwords or API keys, accept Apple agreements, and press Archive or Upload in Xcode. Claude opens the right pages and tells you exactly what to click.

### Starter message for a new chat
> I'm working on my app **Spotted In** (GitHub repo **kotiskwok/NYC-List**, live at https://nyc-lovat.vercel.app, iPhone app via Capacitor in `native/`). Please read `HANDOFF.md` in the project first. Then help me with: [your request].

---

## 3. Screens and features

### Map tab
- **Apple Maps** as the base map (MapKit JS). If it's ever unavailable, the app draws its own city map in Apple Maps colours.
- **Header card:** "Spotted In" with the yellow **city button** (NYC ▾ / SG / HKG / TO) to switch city, a big count of **Spots To Try**, your profile photo with a sync dot (tap for **Your Account**), and Visited / In Plan counts.
- **Category chips** filter the pins. Each pin is a frosted ring with the category's line icon, or the spot's photo.
- **Nearest To You** card, once your location is known.
- **Map Layers** (per city): NYC: Subway, Bus routes, Citi Bike · Singapore: MRT/LRT, Buses · Hong Kong: MTR, Buses, Trams, Ferries · Toronto: Subway/LRT, Streetcars, Buses, Bike Share Toronto. Bike docks show live bike and dock counts.
- **New York State:** the NYC map zooms out to the whole state. Spots outside the city get a town as their neighborhood (Hudson, Beacon, Montauk…), grouped into regions (Long Island, Westchester, Hudson Valley, Catskills, Capital Region, Adirondacks & North Country, Finger Lakes & Central NY, Western NY, New Jersey, Connecticut) for the Explore filter.
- **My Location** button. If location fails, you can tap where you are.
- While a spot or directions are open, the header, chips and side buttons hide so the map is clear.

### Place card (tap a pin)
- Photo banner (your own photo, or the spot's first Google Maps photo), the category, neighborhood and source, the name in two weights, and a glass row with From Home / Price / Nearest station with its lines and walking time. The note shows one sentence per line.
- Round glass buttons: open the source post (TikTok / Instagram / Threads / Google Maps), **Plan**, **Visited**, **To List**, **Photo**, **Edit**. Then a **Get There** pill.
- **Swipe the card down to close it.** From Explore, that returns you to the deck.

### Get There
- An estimated route by subway/MRT/streetcar/tram/ferry with the lines, transfers and walking legs, compared with walking.
- **Outside the five boroughs:** a **Drive** estimate and a **Train** option (subway to Grand Central or Penn Station, then Metro-North, LIRR or Amtrak to the nearest station, then a walk or short drive). The place card's station cell shows that nearest regional station. Day plans use the drive for long legs. Start from My Location, Home or another saved spot. Buttons open Google Maps for live times.
- **Drag the sheet down** to shrink it to a small bar above the tab bar (destination plus fastest option) and see the map. Tap it or drag up to open it again.

### Explore tab ("Where To Today?")
- Search (name, area, address, note), category chips, a glass **matches** card (count, neighborhoods, a colour bar by category, price), and a filter button (price for restaurants, neighborhoods by region, Hide Visited).
- **Shuffle The Deck:** swipeable cards. Swipe right (or the orange **+**) adds to the plan; swipe left (or **✕**) skips; tap opens the spot. While you drag, the card **floods green (Plan) or red (Skip)** from that side, a big "Plan"/"Skip" slides in, and a light bar fills until it says LET GO ✓. **See All** shows the matches as a list or map, with Add All To Plan.

### Route tab (Plan A Day)
- Full-screen map with the dotted route and numbered pins. A glass panel shows total travel, a ride-vs-walk bar, when you're done or home, and **Start From** (First Stop / Home / My Location).
- A pull-up timeline: **Leave At** time, a **STAY** chip on each stop (15 min–3 hrs), and arrival times. Each leg shows line bullets or walking minutes. **Auto-Order**, reorder, remove, Add Spots, Clear, and **Start Route In Google Maps**.

### Lists tab (shared trip lists, e.g. "Sonia's Visit")
- **Wallet:** lists are stacked coloured cards like Apple Wallet. The front card shows dates, a countdown ("In 14 days", "Day 2 of 3"), the people on it and how it's shared; **Up Next** shows its first stop. **Hold a card and drag it up or down to reorder** (with haptics on iPhone). The order syncs with your account.
- **+ New List:** a name, optional number of days and an optional first date. Add spots **From My Map** or as **New Spot** (on the list only). Day chips with dates, a day colour per pin, and a **Route ↗** per day. **Edit** changes the name, days and date, and sets a list photo.
- **Share & Invite** (owner): share **Just This List** (friends can add, sort, remove), **Just My Map** (view-only, never your home) or **Both**, by invite link `/?join=<code>`. Friends sign up with a name and land on the list. A live **"Sonia Is Here"** tag shows when someone else has the list open. Edits sync within about a second.

### Add A Spot (+)
- **Paste A Link** (TikTok, Instagram, Threads, Google Maps, any website). AI fills in the spot on its own:
  - **TikTok:** caption, location tag, auto-captions, **watches the video** (frames for on-screen text plus speech-to-text), or every photo of a photo post.
  - **Instagram:** caption, **every photo of a carousel**, and **watches reels** (frames plus speech-to-text).
  - **Threads:** post text and image. **Google Maps:** the exact place and pin.
  - Posts with several places show a checklist with **Add All N To My Map**. Every found place comes back already pinned (Google's place search; for chains, the branch at the post's street address).
  - If the spots are in **another of the app's cities**, it asks: "These Spots Are In Hong Kong. **Switch To HKG** / Stay In NYC".
- **From A Video:** pick a video saved on the phone. The app pulls the audio and stills on the phone, and AI finds the places.
- **By Name:** suggestions from Google as you type, or **Search The Web** (AI with web search).
- Location by address search, a pin you drop, or just a neighborhood. Then Category (or **+ New Category** with an emoji and colour), Price, Neighborhood and Notes.

### Sharing into the app
- **iPhone app:** **Share → Spotted In** from any app. A dark glass **ticket** drops in at the top. A blue stub shows a yellow pin with ✓ and SAVED, then a tear line, "Saved To Spotted In", **FROM** (TikTok / Instagram / Threads / Google Maps / site) and **TO** (My Map · current city), with **Undo** and **Done**. It closes by itself after about 3 seconds. The app fills the spot in the next time it opens.
- **Website:** `https://nyc-lovat.vercel.app/?add=<link>` opens Add A Spot with the link. Android's share menu works through the web manifest, and an iPhone Shortcut can open that link.

### Account, sign-in and welcome
- **Sign-in screen** with the Spotted In logo, email/password, and a show-password eye. Invite links show "Kotis Invited You".
- **Welcome pages** on first sign-in: name, city, Home (optional).
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
- **Map palette:** Apple-style (land `#F4F2EE`, water `#A6D1F0`, parks `#C3E5B8`). The colourful palette is still there with `?style=Colorful`.

---

## 5. Services and keys

| Service | What it does | Where |
|---|---|---|
| **GitHub** | The code | Private repo `kotiskwok/NYC-List`, branch `main` |
| **Vercel** | Hosts the site and runs `/api`. Every push to `main` redeploys. | vercel.com → team **kotis1** → project **nyc** → https://nyc-lovat.vercel.app |
| **Supabase** | Sign-in, database, realtime, photo storage | Project `https://octgaltlmqwcqewbxocb.supabase.co` |
| **Anthropic** | AI that reads posts and finds places (`claude-haiku-5-5`) | console.anthropic.com |
| **Google Cloud** | Places API (New): name suggestions, pinning found places, spot photos | console.cloud.google.com (kwokshulum@gmail.com) |
| **OpenAI** | Speech-to-text for videos and reels (`gpt-4o-mini-transcribe`, fallback `whisper-1`) | platform.openai.com |
| **Apple** | Apple Maps (MapKit JS), the developer account, App Store Connect / TestFlight | developer.apple.com, appstoreconnect.apple.com (team `KQ79GMTSY2`) |
| **OpenStreetMap** | Address search (Nominatim; the iPhone app goes through `/api/geocode`), Photon suggestions fallback, the non-NYC transit lines (Overpass) | No key |
| **Transit feeds** | NYC buses (data.ny.gov), Citi Bike and Bike Share Toronto (public GBFS feeds) | No key |

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
- A **static site with no build step.** `index.html` loads React 18.3.1, htm 3.1.1 (JSX-like templates), Leaflet 1.9.4 and supabase-js 2.117.2 from `vendor/`, then `src/*.js`.
- **Structure:**
  - `src/logic.js`: `class Component extends DCLogic` (state, behaviour, and `renderVals()`, which returns every value and handler the view uses).
  - `src/view.js`: htm templates for every screen.
  - `src/lists.js`: mixes the Lists tab into `Component`; its values come from `listVals()`.
  - `src/runtime.js`: the base class.
- **New UI state** goes in the `state` initializer, and **new values and handlers** in `renderVals()`.
- **Offline:** `sw.js` caches the app. **Bump `CACHE` in `sw.js` whenever `src/` changes.**

### Data and sync
- **Local copy:** `localStorage['nycList.v1']`. **Cloud:** one JSON row per user in `nyc_list` (row-level security).
- **Synced snapshot:** `{places (every city, each tagged city), cats, home, plan (NYC), cities:{sg,hk,to}:{home, plan}, city, listOrder}`.
- `src/sync.js` does a three-way merge against the last synced base about a second after any change, and on resume or coming back online. City, home and plan merge per city.
- **Place:** `{id, name, cat, area, lat, lng, url, source, address, note, price 0-4, visited, city?, photo?}`. Category `{id, name, color, emoji}`. Plan `{ids, start, leave, stay}`. Home `{lat, lng, area}`.
- **Shared lists** (`supabase/lists.sql`):
  - `nyc_trips`: owner, name, sharing flags, invite code, `rev`, and `data {stops, days, start, cats, photo}`.
  - `nyc_trip_members`, plus the functions `nyc_join_trip`, `nyc_trip_preview` and `nyc_shared_map`.
  - Same merge as the main list, plus an optimistic `rev` check. Presence uses Supabase Realtime (`nyc-list-<id>`).
- **Photos:** Storage bucket `avatars`: `<user>/avatar.jpg`, `<user>/spot-<id>.jpg`, `<user>/list-<id>.jpg`.

### Cities
- `CITIES` in `logic.js`: center, bounds, search box, regions, transit name, layers. NYC also has `core` (the five boroughs, where subway estimates apply) and `minZ` (zoom out to the state).
- **New York State** (`data/nys-data.js`, `window.NYS`): the map's outline (`area`, which keeps Toronto out of the NYC map), towns by region, the regional rail stations with rough minutes from the hub, and line badges. `inBox`, `inCore` and `reach` in `logic.js` use it; `estimate()` adds `drive` and `rail` beyond the city and `bestOf()` picks the quickest. The server has the same outline (`poly` in `api/_shared.js`), and `localize()` widens the NYC prompts to New York State. `setCity()` switches city; `cityMoved()` re-centers and redraws.
- `state.places` holds the current city's spots and `state.otherPlaces` the rest.
- **Station and neighborhood data:**
  - NYC: `data/nyc-*.js`.
  - Other cities: `data/city-data.js`: neighborhoods, rail stations, plus streetcar, tram and ferry stops (`k:1`) with line speeds and waits for travel estimates.
- **Bus, tram, streetcar and ferry route lines:**
  - Other cities: static files `data/routes/<city>-<kind>.json`, built monthly from OpenStreetMap by the GitHub Action **Build transit routes** (`scripts/build-routes.js` → `api/_osmroutes.js`). The Action can also be run by hand.
  - NYC buses: `/api/bus`.
- Server prompts are localized per city (`CITIES` / `localize()` in `api/_shared.js`).

### Server functions (`/api`, Vercel Node, CommonJS)
Endpoints check the caller's Supabase token, except `photo`, `geocode`, `bus` and `mapkit-token`.

| Endpoint | What it does |
|---|---|
| `POST /api/extract` | Reads a link and asks Claude (forced `save_places` tool, with `post_city`) for the places. See "How links are read" below. |
| `POST /api/find` | Search The Web: Claude with web search finds places by name. |
| `POST /api/places` | Google Places (New): `auto` (suggestions), `detail`, `find` (best match). |
| `GET /api/photo?q=&ll=` | A spot's first Google photo as a JPEG. It only answers the app's own pages; the iPhone app is recognised by `&app=ios` or its web view. |
| `GET /api/geocode` | OpenStreetMap address search for the iPhone app (Nominatim refuses requests without a Referer). |
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
- **Every result:** places are pinned with Google (`pinPlace`; for chains, the match has to be at the post's street number) and the response says which city they're in.
- **Limits:** `extract` and `find` may take up to 60 s. The root `package.json` exists only for `ffmpeg-static`.

---

## 7. iPhone app

- **Capacitor 8** project in `native/`. Bundle IDs: `com.kotiskwok.nyclist` (app) and `com.kotiskwok.nyclist.share` (Share extension). Team `KQ79GMTSY2`. iOS 15+, iPhone, portrait. App group `group.com.kotiskwok.nyclist`, URL scheme `nyclist://`.
- In the app `NATIVE` is true: use `API('/api/...')` for server calls and `SITE()` for shareable links.
- **`src/native.js`** handles native location, the share sheet, status bar, haptics (`NYCNative.tap()`), the share inbox (`AppGroup.takeLinks`), and telling the share card the current city (`NYCNative.setCity`).
- **Share extension:** `native/ios/App/ShareExtension/ShareViewController.swift`, the SwiftUI ticket card (iOS 15 APIs only). Links wait in the app group under `pendingLinks`; the city is under `currentCity` (`AppGroupPlugin.swift`).
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
1. **On the Mac** (the project lives in **Documents › Spotted In App**, a clone of the repo): pull, copy the website in, and sync. In Terminal: `cd ~/Documents/"Spotted In App" && git pull && cd native && npm run sync`. If Claude does it through the linked Mac, it copies `src`, `icons`, `index.html` and `manifest.webmanifest` into `native/www` by hand, then runs `npx cap sync ios`.
2. **Bump the build number:** `CURRENT_PROJECT_VERSION` in `native/ios/App/App.xcodeproj/project.pbxproj`, for both the App and ShareExtension targets. Claude does this in the repo.
3. **In Xcode** (you): open `native/ios/App/App.xcodeproj`, choose **Any iOS Device (arm64)**, then **Product → Archive → Distribute App → App Store Connect → Upload**.
4. **In App Store Connect** (Claude can do this in the built-in browser): add the What to Test notes and the groups, and submit to Friends Beta.

Changes that only touch `api/` (how links are read, keys) go live on the server right away and **don't need a new build**. Anything in `src/`, `index.html`, `icons/` or `native/` does.

---

## 8. File map

| File | What's in it |
|---|---|
| `index.html` | Page shell, global CSS, fonts, script order |
| `src/logic.js` | All behaviour: cities, categories, maps and layers, routing estimates, Explore deck, plan, Add A Spot and AI fill, sync hooks, `renderVals()` |
| `src/view.js` | All screens and the logo; glass styles; drag helpers (`dragDown`, `dragHandle`); deck swipe stamps (`DeckStamp`) |
| `src/lists.js` | Shared lists (`NYCLists`), the Wallet (including long-press reorder), invites, presence |
| `src/sync.js` | Supabase client, sign-in, three-way merge sync |
| `src/native.js` | iPhone-only bridges |
| `src/video.js` | On-phone video audio and frame extraction |
| `src/runtime.js` | Base class, `NATIVE`, `API()`, `SITE()` |
| `api/*.js` | Server functions (above). `_shared.js` (CORS, auth, cities), `_gmaps.js`, `_osmroutes.js` are helpers. |
| `data/` | Map, street, station and city data; `nys-data.js` New York State towns, rail stations and outline; `routes/` transit lines (generated, don't hand-edit) |
| `scripts/build-routes.js`, `.github/workflows/routes.yml` | Monthly transit-line builder |
| `supabase/*.sql` | Database tables, security rules, functions, storage bucket |
| `sw.js` | Offline cache (bump `CACHE` when `src/` changes) |
| `manifest.webmanifest`, `icons/` | Home-screen name and icons, Android share target |
| `vercel.json` | Function limits, `includeFiles` for ffmpeg, cache headers (use `/path/:path*` patterns) |
| `config.js` | Supabase URL and publishable key, `siteUrl` for the iPhone app |
| `privacy.html`, `support.html` | App Store privacy and support pages |
| `native/` | iPhone app: Xcode project, Share extension, `design/app-icon.html`, `APP_STORE.md`, `README.md` |
| `CLAUDE.md` | Short rules for Claude in the repo |

---

## 9. Rules for working on it

- **No build step.** Edit `src/*.js` and `api/*.js` directly; views stay as htm templates in `view.js`.
- **Bump `CACHE` in `sw.js`** whenever `src/` changes, so installed phones update.
- **Secrets only in Vercel.** Never in code, chat or files.
- **`vercel.json` header sources** must use `/path/:path*` patterns (grouped regex patterns fail to deploy).
- **Test locally** with `python3 -m http.server` from the repo root and `window.NYC_CONFIG={}` served for `config.js` (local mode, no sign-in). Stub `/api/*` and `NYCSync.getToken` when testing AI flows. Playwright and Chromium work for screenshots.
- **Swift changes** can't be compiled in Claude's Linux workspace. Typecheck them on a GitHub macOS runner (`xcrun swiftc -typecheck -sdk <iphoneos> -target arm64-apple-ios15.0`) through a temporary workflow, then remove it.
- **Fetching from social sites on the server:** Google Maps links as a phone; TikTok as desktop Chrome; Instagram through the embed page.
- **Design work:** lay options out on a Design canvas artifact first, then build the chosen one.

## 10. Not built yet
- **Delete My Account** needs `SUPABASE_SERVICE_ROLE_KEY` in Vercel before full App Store review.
- Saving a shared link in the background, without opening the app.
- Per-person notes or votes on list spots.
