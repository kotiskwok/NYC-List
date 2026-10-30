# NYC List for iPhone

The iPhone app is the website wrapped with [Capacitor](https://capacitorjs.com) 8. The web code lives in the folder above; `npm run sync` copies it into `www/` and then into the Xcode project. The `/api` functions stay on Vercel; the app calls them at `NYC_CONFIG.siteUrl`.

- **Bundle ID:** `com.kotiskwok.nyclist` (app) and `com.kotiskwok.nyclist.share` (Share extension)
- **App group:** `group.com.kotiskwok.nyclist`. The Share extension saves links there; the app picks them up through its `AppGroup` plugin (`ios/App/App/AppGroupPlugin.swift`) and `src/native.js`.
- **URL scheme:** `nyclist://` (`nyclist://add?url=<link>`, `nyclist://join?code=<code>`)
- **Native plugins:** App, Geolocation, Share, Haptics, Status Bar, Splash Screen
- iPhone only, portrait only, minimum iOS 15

## On the Mac

You need Xcode, plus Node 22 or newer (`node -v`; install from nodejs.org if needed).

```bash
git clone https://github.com/kotiskwok/NYC-List.git   # or: git pull
cd NYC-List/native
npm install
npm run sync      # copy the website in and update the iOS project
npm run open      # opens Xcode
```

In Xcode:
1. Click **App** (blue icon, top of the left sidebar) → **Signing & Capabilities**. For both the **App** and **ShareExtension** targets, tick **Automatically manage signing** and choose your **Team**. Xcode registers the IDs and the app group for you.
2. Pick your iPhone (plugged in, Developer Mode on) or a simulator at the top and press ▶︎ to try it.
3. To ship: choose **Any iOS Device (arm64)**, then **Product → Archive**. When the Organizer opens, **Distribute App → App Store Connect → Upload**.

**After every web change:** `npm run sync`, then in Xcode bump **Build** (General tab; App and ShareExtension) before the next archive.

## Before the first App Store submission
- Run `supabase/lists.sql` in Supabase (Lists tab).
- Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel (needed for **Delete My Account**), then redeploy.
- Keep "Allow new users to sign up" on in Supabase.
- Listing text, privacy answers and review notes: `APP_STORE.md`. Screenshots: `screenshots/`.
