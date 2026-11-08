# Spotted In: Project Handoff

Everything a new chat needs to keep working on **Spotted In**: what the app does, how it looks and sounds, where everything lives, how it's built, and how Claude makes changes to it directly.

---

## 1. What Spotted In is

**Spotted In** is Kotis's map of the places she's been meaning to try (restaurants, cafés, bakeries, gourmet groceries, cute shops), saved straight from TikTok, Instagram, Threads and Google Maps. Share or paste a post and AI reads the caption, photos, on-screen text and what's said in the video, finds the places, and pins them on the map with the nearest station, travel time and opening hours. It also plans a day out, keeps shared trip lists with friends, and lets people rate and review the spots they've saved.

It has seven maps, each with its own spots, home and day plan:

| Map | Button | Transit used for travel times |
|---|---|---|
| New York City | NYC 🗽 | Subway |
| Singapore | SG 🦁 | MRT & LRT |
| Hong Kong | HKG 🌃 | MTR, trams, ferries |
| Toronto | TO 🍁 | TTC subway, LRT, streetcars |
| Boston | BOS 🦞 | The T (Red, Orange, Blue, Green B/C/D/E, Mattapan, Silver Line) |
| New York State | NYS 🏞️ | Driving, and Metro-North / LIRR / Amtrak from NYC |
| New Jersey | NJ 🍅 | Driving, and NJ Transit / PATH / Hudson-Bergen Light Rail from NYC |

The app is built around major cities. New York State and New Jersey are the last two maps (state maps), for day trips and weekends outside the city.

- **Website (also installs to the home screen):** https://nyc-lovat.vercel.app
- **iPhone app:** the same site wrapped with Capacitor, on TestFlight as **"Spotted in: Places To Go"**.
- **Accounts:** email and password; everything syncs between devices.

---

## 2. Working on it with Claude

### Apps to download (so Claude can make changes directly)

| Download | On | Why |
|---|---|---|
| **Claude desktop app** (claude.ai/download) | Mac | The main place to work. It links the chat to the Mac (Claude can update the Xcode project), has the built-in browser pane (Vercel, Supabase, App Store Connect, Play Console), and allows computer use for Xcode. Keep it open and the Mac awake while Claude works. |
| **Claude app** (App Store) | iPhone | Start or check on work from the phone. Changes to the code and the website work from here; anything on the Mac needs the desktop app open. |
| **Xcode** (Mac App Store) | Mac | Builds the iPhone app. You press Archive and Upload here. After installing, open it once to accept the license and install the iOS platform. |
| **Node.js LTS** (nodejs.org) | Mac | Runs `npx cap sync ios` / `npm run sync`, which copies the website into the iPhone app. |
| **Git** (comes with Xcode's Command Line Tools: run `xcode-select --install` in Terminal) | Mac | `git pull` keeps **Documents › Spotted In App** up to date with GitHub. |
| **TestFlight** (App Store) | iPhone | Installs and tests the beta builds. |
| **Spotted In** (via the TestFlight invite) | iPhone | The app itself, to check each new build. |
| **Google Chrome + Claude in Chrome extension** (optional) | Mac | Only if you'd rather Claude used your own Chrome instead of the built-in browser pane. |
| Android phone with **Google Play** (later, for Android) | Android | To test the Android build. No Android Studio is needed; GitHub builds it. |

Nothing else is needed: GitHub, Vercel, Supabase, App Store Connect, Google Cloud and Play Console are all websites.

### Apps and connections Claude needs
Set these up once. With all of them, Claude can change the code, put it live, update the iPhone project on the Mac, run database setup and manage TestFlight.

| App / connection | What Claude uses it for | How to set it up |
|---|---|---|
| **Claude Project "Spotted On:"** | Holds this handoff (`claude/HANDOFF.md`) so every new chat in the project can read it, plus project memory. | Start new chats inside the project. |
| **GitHub** (private repo `kotiskwok/NYC-List`, branch `main`) | Reading and editing the code, pushing changes, running GitHub Actions. **Every push to `main` deploys the website** (Vercel). Pushing any other branch makes a private Vercel preview. | claude.ai → Settings → Connectors → GitHub (with access to `kotiskwok/NYC-List`). In the chat, ask Claude to attach the repo with **push** access. |
| **Claude desktop app on the Mac, linked to the chat** | Updating the Xcode project on the Mac: `git pull`, copying the website into the app, `npx cap sync ios`. | Keep the Claude desktop app open on the Mac. When asked, Claude requests access to **Documents › Spotted In App** and the **delete permission** itself (git needs it to replace files): approve both prompts. (You can also add the folder with **+ → Add folder** next to the message box.) Keep the Mac awake with the app open while Claude works. |
| **Built-in browser** (the browser pane in the Claude desktop app) | Checking the live site, Vercel deploys and logs, running SQL in Supabase, App Store Connect / TestFlight, Google Cloud, and reading Instagram / TikTok posts. | Stay signed in to these sites in the browser pane and approve them when Claude asks: `nyc-lovat.vercel.app`, `vercel.com`, `github.com`, `supabase.com`, `appstoreconnect.apple.com`, `developer.apple.com`, `console.cloud.google.com`, `platform.openai.com`, `console.anthropic.com`, `instagram.com`, `tiktok.com`. |
| **Computer use: Xcode** (optional) | Looking at Xcode. Xcode is click-only for Claude, so it can't use Xcode's menus or archive. | Approve Xcode when Claude asks. **You** do Product → Archive → Upload. |
| **Google Play Console** (for the Android app, §8b) | Creating the Play listing, uploading Android builds, managing the closed test and testers. | Kotis makes the developer account at play.google.com/console ($25 one-time, ID verification). Then approve `play.google.com` in the built-in browser so Claude can fill in the listing. |
| **Claude settings: memory and past chats** | Remembering decisions and preferences between chats in the project, and finding earlier chats about the app. | claude.ai → Settings: turn on **Generate memory from chat history** and **Search and reference chats**. |
| **Network access for Claude's workspace** (optional) | Opening the live site and Vercel previews straight from Claude's own workspace (otherwise it checks them through the built-in browser). | claude.ai → Settings → Capabilities: add `nyc-lovat.vercel.app` and `vercel.app` to the allowed domains. |
| **Design canvas "Spotted In Icon Options"** (claude.ai artifact) | Laying out visual options to compare before building: icons, share card, wallet, buttons, reviews, personality. | https://claude.ai/artifact/7mWakGhfPe7dfWubzZyqbW. Ask Claude to add a new row of options to it. |

### Before each working session
1. On the Mac, open the **Claude desktop app** and open the chat there (keep the Mac awake).
2. If Claude needs the Mac's project, approve its folder access and delete permission prompts for **Documents › Spotted In App** (or add the folder yourself with **+ → Add folder**).
3. Stay signed in to Vercel, Supabase and App Store Connect in the built-in browser pane.
From the iPhone Claude app you can still change the code and the website; only the Xcode steps need the Mac.

**What Claude won't do (you do these):** type or paste passwords or API keys, accept Apple agreements, and press Archive or Upload in Xcode. Claude opens the right page and tells you exactly what to click.

### How Kotis likes to work
- **Design first:** new looks are laid out as options on the design canvas, Kotis picks or mixes, then Claude builds the chosen one.
- **Preview before shipping:** for bigger changes Claude builds on a separate branch, shows screenshots from the real app (and the Vercel preview link), and only merges to `main` after "ship it".
- **After shipping:** bump the iPhone build number, update the Mac's Xcode project, and keep this handoff (repo `HANDOFF.md` and project `claude/HANDOFF.md`) current.

### Starter message for a new chat
> I'm working on my app **Spotted In** (GitHub repo **kotiskwok/NYC-List**, live at https://nyc-lovat.vercel.app, iPhone app via Capacitor in `native/`). Please read `HANDOFF.md` in the project first, then attach the repo with push access. Then help me with: [your request].

---

## 3. Voice and copy rules (follow these for every word in the app)

- **Voice:** friendly group-chat energy, playful and a little extra. Examples: "Stuck it on the map!!", "Been there, ate that.", "Your map is empty, bestie.", "Gone. Spot deleted.", "Invite link copied. Go send it!", closed spots show "Asleep · Back Tue 8 AM". Errors stay calm and helpful: "Couldn't reach the server. Check your connection?"
- **"!!" sparingly:** only for big moments (the save toast and the welcome toast). A single "!" now and then. Mostly plain periods.
- **Capitalization:** Title Case for titles, headings, buttons, chips, labels and tags ("Where We Going Tonight?", "Something Cozy", "Add Their Link"). **Full sentences use normal sentence case.**
- **One sentence per line:** messages, toasts, empty states, hints, tips and onboarding show each sentence on its own line (`Lines()` / `noteLines()` in `view.js`). Write separate sentences rather than joining them with dashes.
- **TestFlight "What to Test":** always an introduction to the whole app, written from Kotis's point of view, because she keeps inviting new people to beta test. Use the standing notes in §8 for every build (update them only when a feature is added or removed). Never write them as a changelog.

---

## 4. Screens and features

### Map tab
- **Apple Maps** base map (MapKit JS), dark scheme in dark mode. If it's unavailable, the app draws its own map in Apple Maps colours.
- **Header card:** "Spotted In" with the yellow **city button** (NYC ▾) that opens **Pick A City**, a big count of **Spots To Try**, your profile photo with a sync dot (tap for **Your Account**), and Visited / In Plan counts.
- **Chips:** All Spots, **Open Now** (only spots open right now, in that map's local time), then the categories.
- **Pins:** a frosted ring with the category's line icon (34 px, 54 px when selected; `pinHtml` / `syncOne` in `logic.js`).
- **Nearest To You** card, once your location is known. **My Location** button (if location fails, tap where you are).
- **Map Layers** (per map; bike docks show live counts). Everything starts **off**, transit lines and stations too, so the map stays clean and fast (`LAYERS.sub2` in `logic.js`):

| Map | Layers |
|---|---|
| NYC | Subway, Bus routes, Citi Bike |
| Singapore | MRT/LRT, Buses |
| Hong Kong | MTR, Buses, Trams, Ferries |
| Toronto | Subway/LRT, Streetcars, Buses, Bike Share Toronto |
| Boston | The T stations, MBTA Buses & Silver Line, Ferries, Bluebikes |
| New York State | Metro-North, LIRR & Amtrak stations |
| New Jersey | NJ Transit, PATH & light rail stations (names from zoom 12) |

- **New Jersey map:** works like the New York State map. Opens on the whole state; towns and Jersey City neighborhoods are grouped into Jersey City & Hoboken, Bergen & Passaic, Essex, Union & Morris, Central Jersey, Jersey Shore, South Jersey and Skylands. Train estimates go from your NYC home by subway to Penn Station (NJ Transit, with changes at Secaucus, Newark or Trenton noted in the line name), World Trade Center or 33rd St (PATH, and PATH + light rail). It uses your NYC home until you set one there. NYC subway stations never show as a New Jersey spot's nearest station.
- **New York State map:** opens on the whole state. Spots get a town as their neighborhood, grouped into regions (Long Island, Westchester, Hudson Valley, Catskills, Capital Region, Adirondacks & North Country, Finger Lakes & Central NY, Western NY). It uses your NYC home until you set one there.
- While a spot or directions are open, the header, chips and side buttons hide.

### Place card (tap a pin)
- Photo banner (your own photo, or the spot's first Google Maps photo), category, neighborhood and source, the name in two weights, and **hours** ("Open · Closes 10 PM", "Closes Soon · 10 PM" in orange, "Asleep · Back Tue 8 AM").
- A glass row: **From Home** (minutes, or hours) / **Price** / **Nearest station** with line badges and walk time (Metro-North, LIRR or Amtrak on the NYS map). Notes show one sentence per line.
- Round buttons: open the source post, **Plan**, **Visited**, **To List**, **Photo**, **Edit**. Then **Get There**.
- **Reserve A Table** (restaurants, or any spot with a booking link): only ever the restaurant's **one real booking page**. A saved link (from the post, or the Edit sheet's **Booking Link**) opens directly ("Book On Resy"). Otherwise **Find Their Booking Page** asks `/api/booking` (Google Places says whether it takes reservations; Claude web search must cite the page, on a booking site or the restaurant's own site) and saves the link on the spot. If there isn't one: "Walk-In Only" / "No Online Booking Found" (remembered 30 days), with **Check Again** and **Add Their Link**.
- **Reviews:** at the bottom of the card. Stars, a comment and a photo. Everyone who saved the same place (matched by Google place id, `gid` on the spot) reads them. Edit or delete your own; **Report** (hidden for you, hidden for everyone at 3 reports) or **Block** someone. Needs `supabase/reviews.sql` run once in Supabase.
- **Swipe the card down to close it.** From Explore, that returns to the deck.

### Get There
- Start from **My Location**, **Home** or **A Saved Spot**.
- In the cities: an estimated route by subway/MRT/T/streetcar/tram/ferry with line badges, transfers and walking legs, compared with walking, drawn on the map in each line's colour.
- On the NYS and NJ maps: **Drive**, and **Train** (subway to Grand Central, Penn or the PATH, regional train, then a walk or short drive; a station you can walk from wins over a slightly quicker one that needs a taxi). The fastest is marked.
- Each option opens Google Maps for live times. Drag the sheet down to shrink it to a small bar above the tab bar.

### Explore tab ("Swipe + Peek Strip", design EX1b)
- Follows light and dark mode like the rest of the app (cream backdrop with colour glows and white glass cards in light, navy in dark), titled "Where We Going Tonight?" (or "Today?" before 5 PM).
- **Search bar** (✨ icon) for a name or a vibe; typing a phrase shows the purple **✨ Vibe Search** pill. Its **filter button** (orange badge = filters on) opens **Filter Your Spots**: **When** (Open Now, Haven't Been), **Category** (multi-select, with counts), price for restaurants, neighborhoods by region, **Clear All**, **See All As A List** and **Show N Spots**.
- **Count line:** "12 Matches · Open Now · Bakery" (2+ categories or areas collapse to "2 Categories"), with **See All** (list or map, Add All To Plan).
- **Swipe deck:** a big card with the photo, "4 / 12", name in two weights, category · area · price · minutes, hours or the ✨ reason. Swipe right = **Plan**, left = **Skip**, tap = place card; Skip and Plan buttons sit on the card too.
- **Peek strip** under the deck: a thumbnail of every match (first 60, then "+N" opens See All). The current one has an orange ring, passed ones fade, ones in your plan get a blue check; tap one to jump to it.
- The deck ends with "That's All" (**See All** / **Shuffle Again**). Code: `FeedScreen`, `FeedCard`, `FeedStrip`, `FeedSearch` in `view.js`; `feedItems` (with `cur`, `seen`, `onJump`), `feedCount`, `feedWhenChips`, `feedCatChips`, `feedFilterN`, `deckGrab` in `renderVals()`; deck logic in `deckList`/`deckAct`/`deckDown`/`deckMove`/`deckUp`.

### Route tab (Plan A Day)
- Full-screen map with the dotted route and numbered pins. A glass panel shows total travel, a ride-vs-walk bar, when you're done, and **Start From** (First Stop / Home / My Location).
- Pull-up timeline: **Leave At**, a **STAY** chip per stop (15 min–3 hrs), arrival times, line badges per leg. **Auto-Order**, reorder, remove, Add Spots, Clear, **Start Route In Google Maps**.

### Lists tab (shared trip lists, e.g. "Sonia's Visit")
- **Title:** "<First Name>'s Lists" ("Kotis' Lists" when the name ends in s), with a navy **+ New** pill.
- **Tabs:** **Upcoming** (dated, not over), **Anytime** (no dates, or done), **Shared** (with or from friends).
- **Boarding-pass wallet:** the front list is a pass with its photo on top (and a **Photo** button), a three-letter code (SON), name and countdown; then arrive/depart dates, Spots / Days / Travel, a torn perforation, and a stub with the people, "Sonia Is Here · Editing" when someone has it open, and a barcode. Lists behind show as colour tabs with their code and countdown. **Hold a pass and drag to reorder** (haptics on iPhone); the order syncs.
- **Live line** below the wallet: the latest spot a friend added in the last 3 days ("Sonia added Lucali to Day 1 · 2 MIN"), or Up Next.
- **Inside a list ("Day Timeline", design LS4):** a slim header (back, the list name and dates (tap to **Edit** name, days, start date, photo), a map button, the people (tap to **Share & Invite**)). The days run down a timeline, each with its date, **Route ↗**, its stops (photo, area, who added it, "2 IN" tallies) with travel time between them, and a dashed **Add To Day N** slot. Spots on no day sit under **Whenever**; **Add Day N** / **Sort Into Days** ends the timeline. Tap a stop to move it between days (day chips) or reorder it (↑ ↓). The **From My Map** picker adds straight to the chosen day and has **Paste A Link Or Search** for a new spot.
- **Per stop:** **I'm In / Skip It** votes with counts and who's in, and one **note per person** for the group ("Add Your Note For The Group").
- **Share & Invite** (owner): **Just This List** (friends can add, sort, remove), **Just My Map** (view-only, never your home) or **Both**, by invite link `/?join=<code>`. Friends sign up with a name and land on the list. Edits sync within about a second.

### Add A Spot (+)
- **Paste A Link** (TikTok, Instagram, Threads, Google Maps, any site). AI fills in the spot:
  - **TikTok:** caption, location tag, auto-captions, watches the video (frames plus speech-to-text), or every photo of a photo post.
  - **Instagram:** caption, every carousel photo, and watches reels.
  - **Threads:** text and image. **Google Maps:** the exact place and pin.
  - **Booking links** (Resy, OpenTable, Tock, SevenRooms, Chope) in the post or notes are matched to their place and saved. Only links really in the post are kept.
- Posts with several places show a checklist with **Add All To My Map**; every place comes back pinned (Google place search; for chains, the branch at the post's street address). If the spots are on another of the app's maps it asks ("These Spots Are In Boston. **Switch To BOS** / Stay In NYC").
- **From A Video:** pick a video on the phone; audio and stills are pulled on the phone and AI finds the places.
- **By Name:** Google suggestions as you type (current map's area), or **Search The Web** (AI with web search).
- Then location (address, dropped pin or neighborhood), Category (or **+ New Category**), Price, Neighborhood, Notes and, for restaurants, **Booking Link**.

### Sharing into the app
- **iPhone app:** **Share → Spotted In** from any app shows a dark glass ticket ("Saved To Spotted In", FROM / TO, Undo / Done) that closes after about 3 seconds. The app fills the spot in the next time it opens.
- **Website:** `https://nyc-lovat.vercel.app/?add=<link>` opens Add A Spot with the link (Android share menu via the web manifest; works with an iPhone Shortcut).

### Account, welcome and tour
- **Sign-in screen** (design SI1 · Frosted Over Your Map): a blurred, drawn map with colored pins (`AuthBackdrop`, night map in dark mode) behind a frosted glass card with the logo, email/password and a show-password eye, plus a glass **New Here? Create An Account** pill. Invite links show "Kotis Invited You".
- **Welcome steps:** name, home city (NYC, SG, HKG, TO or BOS) and optional home address, then **Show Me Around**.
- **How-to tour:** five cards (**Save A Spot, Your Map, Where To Today?, Plan Your Day, Lists With Friends**), with icon tabs, swipe or Next/Back, and Skip. The welcome toast shows when it closes. Reopen from **Your Account → How To Use Spotted In**. Copy lives in `TOUR` in `view.js`.
- **Your Account:** profile photo, sync status, **How To Use Spotted In**, **Appearance** (Automatic / Light / Dark), Sync Now, Sign Out, **Delete My Account** (needs `SUPABASE_SERVICE_ROLE_KEY`, see §6).

### Default categories
☕ Coffee Shop (orange) · 💻 Coffee Shop To Work At (blue) · 🍽️ Restaurant (red) · 🥐 Bakery (yellow) · 🧀 Gourmet Grocery (green) · 🛍️ Cute Shop (pink). New accounts start empty; example spots only show when no one is signed in.

---

## 5. Look and brand

- **Colours:** the palette follows the Zohran Mamdani NYC mayoral campaign's colours. Blue `#1B3DB8`, navy `#10183F`, yellow `#FFC425`, orange `#FF6B1A`, red-orange shadow `#E5402B`, cream `#FFF3DF`, plus red `#E8242C`, pink `#F45FA0`, green `#1F9D6B`, purple `#7A4FD6` for categories and states. New designs stick to blue, orange, yellow, navy and cream.
- **Type:** **Archivo** (variable; weight 900 and width 72% for the SPOTTED wordmark). Headings are bold italic with a thin second word. Small data labels use **JetBrains Mono**.
- **Liquid glass:** floating controls, cards, sheets and the tab bar are frosted glass (`GL`, `GL2`, `GLX`, `TILE`, `ROW` in `view.js`) over the map or a cream backdrop with colour glows (`--bgfx`). Plain `background:#fff` in a style turns frosted; write `#FFFFFF` for solid white.
- **Round buttons (flat solid):** main actions (Get There arrow, deck Plan, tab-bar +, Start Route) are solid orange with a white icon and one small shadow. Secondary round actions are a soft tint of their colour with a deeper icon (`tintOf` / `inkOf` in `view.js`, brighter in dark mode). Skip is a soft red tint.
- **Light and dark mode:** views are written in light colours; in dark mode `S()` in `view.js` swaps navy text, white/cream glass, navy fills and shadows for dark versions (`darkVal`) and keeps text on coloured fills. `index.html` holds the dark `--bgfx`. Apple Maps and the iPhone status bar follow. For new styles, keep using `#10183F` text, `#fff`/`#FFFFFF` fills and `rgba(16,24,63,…)` tints and they flip automatically. Preference is saved per device in `localStorage['nycList.theme']`.
- **Logo:** **SPOTTED** in chunky yellow with a stacked red-orange shadow, the **O drawn as a yellow map pin** with a blue dot, over a **navy "in" pill** with a red you-are-here dot. Used for the app icon (source `native/design/app-icon.html`), the sign-in screen (`Logo()`, `Wordmark()`, `InPill()` in `view.js`) and the iPhone launch screen.
- **Source badge colours:** TikTok navy, Instagram `#D9367F`, Threads `#2B2B2B`, Google Maps green, Website blue, Added By Name grey.
- **Line badges:** each city's official line colours (NYC subway bullets, MTR, MRT, TTC, MBTA; MN/LI/AM for Metro-North, LIRR and Amtrak).

---

## 6. Services and keys

| Service | What it does | Where |
|---|---|---|
| **GitHub** | The code; the Action that builds transit route lines | Private repo `kotiskwok/NYC-List`, branch `main` |
| **Vercel** | Hosts the site and runs `/api`. Pushes to `main` deploy live; other branches get private previews. | vercel.com → team **kotis1** → project **nyc** → https://nyc-lovat.vercel.app |
| **Supabase** | Sign-in, database, realtime presence, photo storage | Project `https://octgaltlmqwcqewbxocb.supabase.co` (dashboard: supabase.com) |
| **Anthropic** | AI that reads posts, vibe search, web search, booking lookup (`claude-haiku-5-5`) | console.anthropic.com |
| **Google Cloud** | Places API (New): suggestions, pinning, place ids, photos, opening hours, reservations flag | console.cloud.google.com (kwokshulum@gmail.com) |
| **OpenAI** | Speech-to-text for videos (`gpt-4o-mini-transcribe`, fallback `whisper-1`) | platform.openai.com |
| **Apple** | Apple Maps (MapKit JS), developer account, App Store Connect / TestFlight | developer.apple.com, appstoreconnect.apple.com (team `KQ79GMTSY2`) |
| **OpenStreetMap** | Address search (Nominatim; the iPhone app goes through `/api/geocode`), Photon fallback suggestions, station/neighborhood data and non-NYC transit lines (Overpass) | No key |
| **Transit feeds** | NYC buses (data.ny.gov); live bike docks for Citi Bike, Bike Share Toronto, Bluebikes (GBFS) | No key |

**Secret keys live only in Vercel** → project nyc → Settings → Environment Variables. Never in code or chat. After adding one, redeploy. Keys are switched on for both **Production** and **Preview**, so branch previews get Google photos, AI and Apple Maps too.

| Variable | Status | Turns on |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ set | AI reading of links and videos, web search, vibe search, booking lookup |
| `GOOGLE_MAPS_API_KEY` | ✅ set | Suggestions, pinning, photos, opening hours, place ids for reviews |
| `OPENAI_API_KEY` | ✅ set | Hearing what's said in videos and reels |
| `MAPKIT_TEAM_ID`, `MAPKIT_KEY_ID`, `MAPKIT_PRIVATE_KEY` | ✅ set | Apple Maps base map |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ not set | **Delete My Account** (Apple requires it before full App Store review). Supabase → Project Settings → API Keys → secret key. |

- **Public values** (safe, in `config.js` and as fallbacks in `api/_shared.js`): the Supabase URL and the publishable key `sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg`.
- **Supabase setup:** Authentication → Site URL is the Vercel address; "Allow new users to sign up" stays on (friends join lists).
- **SQL files** (run once each in Supabase → SQL Editor → New query → Run; safe to re-run): `supabase/schema.sql` (spots), `supabase/lists.sql` (shared lists), `supabase/avatars.sql` (photo storage), `supabase/reviews.sql` (reviews, reports, blocks). If the editor shows "syntax error at end of input", make sure nothing is highlighted and the paste is complete.
- **Quick checks:** `GET /api/extract?probe=1` → `{"ffmpeg":true,"speech":true}`. `GET /api/photo?probe=1` → 204 when Google photos work.

---

## 7. How it's built

### Front end
- A **static site with no build step.** `index.html` loads React 18.3.1, htm 3.1.1, Leaflet 1.9.4 and supabase-js 2.117.2 from `vendor/`, then `data/`, then `src/*.js`.
- `src/logic.js`: `class Component extends DCLogic` with state, behaviour and `renderVals()` (every value and handler the view uses). `src/view.js`: htm templates for every screen. `src/lists.js`: the Lists tab, mixed into `Component`, values from `listVals()`. `src/runtime.js`: the base class.
- New UI state goes in the `state` initializer; new values and handlers in `renderVals()` (or `listVals()` for Lists).
- **Offline:** `sw.js` caches the app and data. **Bump `CACHE` in `sw.js` whenever `src/` or `data/` changes**, and add new data files to `CORE`.

### Data and sync
- **Local copy:** `localStorage['nycList.v1']`; current map in `localStorage['nycList.city']`. **Cloud:** one JSON row per user in `nyc_list` (row-level security).
- **Synced snapshot:** `{places (every map's spots, each tagged city), cats, home, plan (NYC's), cities:{sg,hk,to,bos,nys}:{home, plan}, city, listOrder}`. `src/sync.js` does a three-way merge against the last synced base about a second after any change, and on resume or reconnect.
- **Place:** `{id, name, cat, area, lat, lng, url, source, address, note, price 0-4, visited, city?, photo?, hours?, reserve?, reserveChk?, gid?}` (no `city` means NYC).
  - `hours` = `{p:[[openDay, openMin, closeDay, closeMin]…], s: businessStatus, t: checkedAt}` or `{none:1, t}` (days 0 = Sunday, local minutes), refreshed monthly.
  - `reserve` = booking link; `reserveChk` = `{t, r:'walkin'|'notfound'}`; `gid` = Google place id (the key for reviews).
- **Category** `{id, name, color, emoji}`. **Plan** `{ids, start, leave, stay}`. **Home** `{lat, lng, area}`.
- **Shared lists** (`supabase/lists.sql`): `nyc_trips` (owner, name, sharing flags, invite code, `rev`, `data {stops, days, start, cats, photo, votes, notes}`), `nyc_trip_members`, and functions `nyc_join_trip`, `nyc_trip_preview`, `nyc_shared_map`. Same merge plus an optimistic `rev` check. Presence: Supabase Realtime channel `nyc-list-<id>` (the wallet only watches, without announcing you).
  - Stop: `{id, pid, by, byName, at, day, p:{…place}}`.
  - `votes`: `[{id: stopId:userId, s, u, v: 1|-1}]`; `notes`: `[{id: stopId:userId, s, u, n, t, at}]` (one per person per stop, so simultaneous edits merge cleanly).
- **Reviews** (`supabase/reviews.sql`): `nyc_reviews` (one per person per place: `place_key` = `g:<Google place id>`, name, stars 1–5, body, photo), `nyc_review_reports`, `nyc_blocks`, function `nyc_review_report_count`. Read by any signed-in user unless reported 3+ times, reported by you, or blocked either way.
- **Photos:** Storage bucket `avatars`: `<user>/avatar.jpg`, `<user>/spot-<id>.jpg`, `<user>/list-<id>.jpg`, `<user>/review-<place>.jpg`.

### Maps (cities)
- **`CITIES` in `logic.js`**: per map `id`, `name`, `short`, `emoji`, `center`, `box` ([south, west, north, east]), `bounds`, `regions`, `transit`, `layerSub`, `layers`, bike GBFS feed. State maps (NYS, NJ) also have `state:1`, `data` (the window global holding their data: `NYS`, `NJS`; read with `SD()`), `z`, `minZ`, and optionally `hoodKm` and `labZ`. **`CITY_ORDER`** = `nyc, sg, hk, to, bos, nys, nj`. Each map's clock for Open Now is in `TZ`.
- `setCity()` switches map; `cityMoved()` re-centers and redraws. `state.places` = current map's spots, `state.otherPlaces` = the rest.
- **Data files:** NYC `data/nyc-map-data.js`, `data/nyc-subway-data.js`, `data/nyc-streets-data.js`; Singapore, Hong Kong, Toronto, Boston `data/city-data.js` (`window.CITY_DATA[city]` = `{hoods, st, lines}`; stops with `k:1` count for travel but aren't drawn); New York State `data/nys-data.js` (`window.NYS` = regions, outline, towns, hubs, lines, rail stations); New Jersey `data/nj-data.js` (`window.NJS`, same shape).
- **Travel estimates:** `estimate(a, b)` finds the best ride between stations near each end (one transfer), using each line's speed and wait, compared with walking; on state maps also `drive` and `rail`. `inCore` (inside the five boroughs) cuts New Jersey out of the NYC box. `bestOf()` picks the quickest. Helpers: `inBox`, `inCore`, `reach`, `NYCISH()`, `homeFor()`, `hoodAt`.
- **Bus, tram, streetcar and ferry lines:** other cities use `data/routes/<city>-<kind>.json`, built from OpenStreetMap by the GitHub Action **Build transit routes** (`.github/workflows/routes.yml` → `scripts/build-routes.js` → `api/_osmroutes.js`). It runs weekly; run it by hand from GitHub → Actions (tick **force** to rebuild all). NYC buses come from `/api/bus`. Route files load from the live site, so they don't need a new iPhone build.
- **Server side:** `CITIES` in `api/_shared.js` mirrors the maps; `localize()` adapts the NYC-written AI prompts to each map. The AI also answers `post_city`, which drives the "Switch To…" question.

### Server functions (`/api`, Vercel Node, CommonJS)
Endpoints check the caller's Supabase token, except `photo`, `geocode`, `bus` and `mapkit-token`.

| Endpoint | What it does |
|---|---|
| `POST /api/extract` | Reads a link and asks Claude (forced `save_places` tool with `post_city` and `booking_url`) for the places. |
| `POST /api/find` | Search The Web: Claude with web search finds places by name. |
| `POST /api/places` | Google Places (New): `auto` (suggestions), `detail`, `find` (best match, returns `gid`), limited to the map's area. |
| `POST /api/hours` | Opening hours for up to 25 spots (Google Places). Powers Open Now and the hours line. |
| `POST /api/vibe` | Vibe search: Claude ranks the user's own saved spots against a plain-language request. |
| `POST /api/booking` | A restaurant's one verified booking page (Google Places + Claude web search with citations). |
| `GET /api/photo?q=&ll=` | A spot's first Google photo as a JPEG (only for the app's own pages). |
| `GET /api/geocode` | OpenStreetMap address search for the iPhone app. |
| `POST /api/transcribe` | OpenAI speech-to-text for phone videos. |
| `GET /api/bus` | NYC bus route lines. |
| `GET /api/mapkit-token` | Apple Maps token for the live site, previews and the iPhone app. |
| `POST /api/delete-account` | Deletes the signed-in account (needs the service-role key). |

**How links are read (`api/extract.js`):** TikTok via the desktop page (caption, location tag, photo-mode images, video with that page's cookies, TikTok captions); Instagram via `/embed/captioned/` (caption, every carousel photo, reel video); videos via `watchVideo` (a frame about every 5 seconds with `ffmpeg-static`, plus speech-to-text); Google Maps via `api/_gmaps.js` (follows share links as a phone); Threads and other sites via `og:` tags. Every place is pinned with Google (`pinPlace`), and booking links are kept only if they appear in the post. `extract`, `find`, `booking` and `bus` may take up to 60 s (`vercel.json`). The root `package.json` exists only for `ffmpeg-static`.

---

## 8. iPhone app

- **Capacitor 8** project in `native/`. Bundle IDs `com.kotiskwok.nyclist` (app) and `com.kotiskwok.nyclist.share` (Share extension). Team `KQ79GMTSY2`. iOS 15+, iPhone, portrait. App group `group.com.kotiskwok.nyclist`, URL scheme `nyclist://`.
- The app bundles its own copy of the website (`native/www` → `native/ios/App/App/public`). In the app `NATIVE` is true: use `API('/api/...')` for server calls and `SITE()` for shareable links.
- **`src/native.js`:** native location, share sheet, status bar style (`NYCNative.statusBar(dark)`), haptics (`NYCNative.tap()`), the share inbox (`AppGroup.takeLinks`), and telling the share card the current map (`NYCNative.setCity`).
- **Share extension:** `native/ios/App/ShareExtension/ShareViewController.swift` (SwiftUI ticket card, iOS 15 APIs only). Links wait in the app group under `pendingLinks`; the current map's short name under `currentCity` (`AppGroupPlugin.swift`).
- **Icon and launch screen:** `AppIcon.appiconset/AppIcon-512@2x.png` (1024², no transparency), `Splash.imageset` (2732²); website icons in `icons/`.

### App Store Connect / TestFlight
- App **"Spotted in: Places To Go"** (Apple ID `6828702049`), version 1.0. Listing text, privacy answers and review notes: `native/APP_STORE.md`. Screenshots: `native/screenshots/`.
- **TestFlight groups:** **Kotis' Inner Circle** (internal, builds arrive right away) and **Friends Beta** (external; Beta App Review for the first build, then a public invite link once "Ready to Test").
- **What to Test** uses the same standing notes for every build (see §3). TestFlight allows 4,000 characters; these are about 3,500.

```
Hiii! Thank you so much for testing my app ♡
Spotted In is my map of all the places I keep saving from TikTok, Instagram and Threads and never actually going to.
It turns those posts into a map you'll actually use, then helps you plan the day and go with friends.

GETTING STARTED
Make an account with your email and a password.
Pick your home city and add your home address if you want travel times from home.
The quick tour shows you around (you can reopen it anytime from Your Account).

SAVE A SPOT
On any TikTok, Instagram, Threads or Google Maps post, tap Share → Spotted In.
A little ticket pops up and the spot fills itself in next time you open the app.
You can also tap the orange + and paste a link.
The AI reads the caption, every photo, the text on screen and what's said in the video, then pins the place on your map.
Posts with lots of places give you a checklist, so you can add them all at once.
No link? Search By Name, or pick a video from your camera roll.

YOUR MAP
Every spot gets a pin with its category icon or photo.
Filter by category, or tap Open Now to see only what's open right now.
Tap a pin for the place card: photo, hours, price, the nearest station and how long it takes from home.
From there you can mark it Visited, add it to your plan or a list, add your own photo, or edit it.
Restaurants get Reserve A Table, which finds their real booking page.
Get There shows the subway or train route next to walking, and opens Google Maps for live times.
Map Layers turns on subway lines, buses and bike docks if you want them.

SEVEN MAPS
Tap the yellow city button to switch maps: NYC, Singapore, Hong Kong, Toronto, Boston, New York State and New Jersey.
Each one uses its own transit for travel times.
New York State and New Jersey are for day trips and weekends, with driving and Metro-North, LIRR, Amtrak, NJ Transit and PATH.

EXPLORE
Swipe through your saved spots like a deck of cards: right to add it to your plan, left to skip, tap to open it.
The strip underneath shows every match, so you can see all your options and jump straight to one.
The filter button narrows it down to Open Now, Haven't Been, categories, price or neighborhoods.
Search by name, or type a vibe like "somewhere cozy for a rainy day" and Vibe Search picks the best matches from your own spots.

PLAN YOUR DAY
The route tab lines up your plan on the map with numbered stops.
Set when you're leaving and how long you'll stay at each place.
It shows your arrival times, the train lines between stops and when you'll be done.
Auto-Order sorts the stops for you, and Start Route opens it all in Google Maps.

LISTS WITH FRIENDS
Make a list for a trip or a visit, like "Sonia's Visit".
Each list is a boarding pass in your wallet, with a countdown to the trip.
Inside, the days run down a timeline, so you can add spots straight to Day 1 or Day 2.
Invite friends with a link, and everyone can add spots, vote I'm In or Skip It, and leave notes for the group.
You'll see when a friend is looking at the list, and changes show up for everyone within a second.

REVIEWS
Rate the spots you've been to with stars, a comment and a photo.
Everyone who saved the same place can read them.
You can report or block anyone, anytime.

LIGHT AND DARK
Spotted In follows your phone's light or dark mode, or pick one in Your Account → Appearance.

WHAT I'D LOVE YOU TO TRY
Save a few spots from posts you've actually been meaning to go to.
Switch cities, plan a day and make a list with a friend.
Tell me anything that's confusing, broken, slow or missing.
Screenshots are the best!
```
- Apps with posts from other people (reviews) need report/block (built) and, for full App Store review, terms of use that forbid abusive content.

- **Current build number:** 18 (`CURRENT_PROJECT_VERSION`). The Mac's Xcode project is synced to it; if TestFlight doesn't show build 18 yet, it still needs Archive and Upload.

### Shipping a new build
1. **Bump the build number** (Claude, in the repo): `CURRENT_PROJECT_VERSION` in `native/ios/App/App.xcodeproj/project.pbxproj`, all four lines. Push it.
2. **Update the Mac's project** (Claude through the linked Mac, or you). The project is **Documents › Spotted In App**, a clone of the repo.
   - Yourself, in Terminal: `cd ~/Documents/"Spotted In App" && git pull && cd native && npm run sync`.
   - Claude through the Mac (`device_bash`): after folder access and delete permission are granted, the folder is mounted at `$HOME/mnt/Spotted In App` in a Linux sandbox on the Mac that has git, Node and npx and can reach GitHub. If git complains about a `.lock` file, remove the stale lock (e.g. `.git/objects/maintenance.lock`) first. Claude runs `git pull --ff-only`, then removes `native/www`, copies `index.html`, `config.js`, `manifest.webmanifest`, `privacy.html`, `support.html` and the `src`, `vendor`, `data`, `icons` folders in with `cp -R`, checks them with `diff -rq`, then runs `npx cap sync ios` in `native/` and checks the new files reached `native/ios/App/App/public`.
3. **In Xcode** (you): open `native/ios/App/App.xcodeproj` (reopen it if it was open), choose **Any iOS Device (arm64)**, then **Product → Archive → Distribute App → App Store Connect → Upload**.
4. **In App Store Connect** (Claude can do this in the built-in browser once the build has processed, about 5–30 minutes; it appears under TestFlight): add the What to Test notes, add the build to both groups, and submit to Beta App Review if asked.

Changes only in `api/` or `data/routes/` go live right away without a new build. Anything in `src/`, `index.html`, `data/` (other than routes), `icons/` or `native/` needs one.

---

## 8b. Android app (Google Play), planned, not built yet

The plan is to publish Spotted In on Google Play from the same code, using Capacitor's Android platform next to the iPhone one.

### What Claude builds (in the repo)
- **`native/android/`**: `npx cap add android`, package id `com.kotiskwok.nyclist`, same app name, icon and launch screen, portrait.
- **Share → Spotted In on Android:** an intent filter for shared text/links in `AndroidManifest.xml` plus a small plugin that hands the link to the app (the Android version of the iPhone share inbox). The ticket card is iPhone-only; Android shows a short "Saved To Spotted In" toast instead.
- **`src/native.js`:** make location, haptics, status bar and the share inbox work on Android too (`Capacitor.getPlatform()` checks).
- **A GitHub Action** that builds the signed `.aab` (the file Google Play wants), so no Android Studio is needed. It reads the signing key from GitHub secrets.
- Version code in `native/android/app/build.gradle` (`versionCode`), bumped for each upload, like `CURRENT_PROJECT_VERSION` on iPhone.

### What Kotis does
- Make the Google Play developer account ($25 one-time, ID verification).
- Create the upload signing key and add it and its password to GitHub → Settings → Secrets (Claude gives the exact commands but never handles the key or password).
- Upload the first `.aab` in Play Console (Claude can then fill in the listing, privacy form and content rating in the built-in browser).

### Google Play's testing rule
New personal developer accounts must run a **closed test with at least 12 testers for 14 days in a row** before the app can go to production. Testers need an Android phone and must opt in through the Play test link. Android friends act as the Friends Beta for Android.

### Listing
Reuse `native/APP_STORE.md` text and `privacy.html` / `support.html`. Play also needs a 512² icon, a 1024×500 feature graphic and phone screenshots (Claude can make these). Data safety answers match the App Store privacy answers.

---

## 9. File map

| File | What's in it |
|---|---|
| `index.html` | Page shell, global CSS (light and dark tokens), fonts, script order |
| `src/logic.js` | Behaviour: maps (`CITIES`, `TZ`), categories, Leaflet/Apple maps and layers, travel estimates, opening hours (`openInfo`), Explore (greeting, vibe chips, vibe search, deck), plan, Add A Spot and AI fill, reservations (`findBooking`), reviews, theme switching, `renderVals()` |
| `src/view.js` | All screens; theme engine (`THEME`, `darkVal`, `S()`); glass styles; `Lines()`; flat-button helpers (`tintOf`, `inkOf`); `PlaceCard`, `Reviews`, `ReviewSheet`, `Tour` (`TOUR` copy), `RouteSheet`, `DeckCard`, the logo |
| `src/lists.js` | Shared lists (`NYCLists`), boarding-pass wallet and reorder, tabs, list codes and barcodes, votes and notes, invites, presence |
| `src/sync.js` | Supabase client, sign-in, three-way merge sync |
| `src/native.js` | iPhone-only bridges |
| `src/video.js` | On-phone video audio and frame extraction |
| `src/runtime.js` | Base class, `NATIVE`, `API()`, `SITE()` |
| `api/*.js` | Server functions (above). `_shared.js` (CORS, auth, maps, prompt localizing), `_gmaps.js`, `_osmroutes.js` are helpers. |
| `data/nyc-*.js`, `data/city-data.js`, `data/nys-data.js`, `data/nj-data.js` | Neighborhoods, stations, lines, streets, NYS and NJ towns and rail |
| `data/routes/` | Transit route lines (generated by the Action; don't hand-edit) |
| `scripts/build-routes.js`, `.github/workflows/routes.yml` | Weekly transit-line builder |
| `supabase/*.sql` | `schema.sql`, `lists.sql`, `avatars.sql`, `reviews.sql` |
| `sw.js` | Offline cache (bump `CACHE` when `src/` or `data/` changes) |
| `manifest.webmanifest`, `icons/` | Home-screen name and icons, Android share target |
| `vercel.json` | Function limits, `includeFiles` for ffmpeg, cache headers (`/path/:path*` patterns) |
| `config.js` | Supabase URL and publishable key, `siteUrl` for the iPhone app |
| `privacy.html`, `support.html` | App Store privacy and support pages |
| `native/` | iPhone app (and, once built, `native/android/` for Android): Xcode project, Share extension, `scripts/copy-web.mjs`, `design/app-icon.html`, `APP_STORE.md`, `README.md` |
| `CLAUDE.md` | Short rules for Claude in the repo |
| `HANDOFF.md` | This document (also in the project as `claude/HANDOFF.md`) |

---

## 10. Rules for working on it

- **No build step.** Edit `src/*.js` and `api/*.js` directly; views stay as htm templates in `view.js`.
- **Bump `CACHE` in `sw.js`** whenever `src/` or `data/` changes. **Bump the iPhone build** for any change that needs one.
- **Secrets only in Vercel.**
- **`vercel.json` header sources** use `/path/:path*` patterns.
- **Copy:** follow §3 for every new string.
- **Styles:** use the palette and glass tokens in §5 so dark mode keeps working.
- **Adding a state map:** copy `data/nj-data.js`, add it to `index.html` and `CORE` in `sw.js`, add a `CITIES` entry with `state:1` and `data`, add to `CITY_ORDER`, `TZ`, the welcome-step filter in `view.js`, `api/_shared.js` (with `poly` and `state: true`) and `post_city` in `api/extract.js`.
- **Adding a map (city):** `CITIES`, `CITY_ORDER` and `TZ` in `logic.js`; neighborhoods/stations/lines in `data/city-data.js`; `box` and prompt names in `api/_shared.js`; its code in `post_city` in `api/extract.js`; bus/tram/ferry layers in `BOX`/`FILTER` in `api/_osmroutes.js`; bike GBFS feed. Claude's shell can't reach OpenStreetMap or most of the web, but GitHub Actions can: fetch data with a temporary workflow that commits a raw file, process it, then delete the workflow.
- **Test locally:** `python3 -m http.server` from the repo root with `window.NYC_CONFIG={}` served for `config.js` (local mode). The app instance is `window.__nycApp` and the maps `window.__nycMaps`; stub `/api/*`, `NYCSync.getToken` and `NYCSync.client` to test AI, lists and reviews. Playwright and Chromium are available for screenshots (`color_scheme='dark'` for dark mode).
- **Swift changes** can't compile in Claude's Linux workspace. Typecheck on a GitHub macOS runner through a temporary workflow, then remove it.
- **GitHub from Claude's workspace:** use `gh api` (REST); GraphQL isn't available.
- **Design work:** options on the design canvas first, then build the chosen one; preview bigger changes on a branch before merging to `main`.

---

## 11. Decided, not built yet

- **Reviews redesign "Y1 · Photo Fades Into Blue Glass"** (on the design canvas): the spot's photo across the top fading into campaign-blue liquid glass, a glass **Must Go / It's Fine / Skip It** vote slider with percentages, glass photo tiles, reviewers' comments as speech bubbles tagged with their vote, and a floating **"Say something about [spot]…"** bar with a photo button. The vote becomes the rating for spots on everyone's own map (votes = ratings on map spots).
- **Take the I'm In / Skip It votes off spots in shared lists** once Y1's map-spot votes are built (keep the per-person notes on lists unless Kotis says otherwise).
- **Delete My Account** needs `SUPABASE_SERVICE_ROLE_KEY` in Vercel before full App Store review.
- **Terms of use** for reviews (Apple asks for this with user posts).
- Saving a shared link in the background, without opening the app.
- **Android app on Google Play** (plan in §8b).
