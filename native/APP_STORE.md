# App Store listing: My NYC List

Everything to paste into App Store Connect (appstoreconnect.apple.com → Apps → +).

## New App form
| Field | Value |
|---|---|
| Platform | iOS |
| Name | **My NYC List** (if taken: *My NYC List: Spot Saver*) |
| Primary language | English (U.S.) |
| Bundle ID | `com.kotiskwok.nyclist` (appears after Xcode registers it on the first build) |
| SKU | `nyclist-001` |
| User access | Full Access |

## App Information
- **Subtitle** (30 max): `Save NYC spots from TikTok`
- **Category:** Primary **Travel**, Secondary **Food & Drink**
- **Content rights:** No, it doesn't contain, show or access third-party content. (It stores links people save; it doesn't display other apps' content.)
- **Age rating:** answer **None / No** to everything → **4+**. The app has no public user-generated content: lists are shared only with people you invite.

## Pricing and Availability
Free · all countries (or just the United States if you'd rather start small).

## Version 1.0
**Promotional text** (170 max)
> Saw a cute café on TikTok? Share it to My NYC List and it lands on your map, with the neighborhood, nearest subway and what to order.

**Description**
> My NYC List is your map of every New York place you've been meaning to try: restaurants, coffee shops, bakeries, gourmet groceries and cute shops, saved from TikTok, Instagram, Threads and Google Maps.
>
> SAVE IT IN ONE TAP
> Share a post to NYC List, or paste a link. AI reads the caption, what's said in the video and what's on screen, then fills in the name, address, neighborhood, category, price and a note for you to check. Posts that mention several places can be added all at once.
>
> SEE IT ON A MAP MADE FOR NYC
> A colorful illustrated map with every borough and neighborhood, street names and an optional subway layer. Each spot shows its nearest station, lines and walking time.
>
> FIGURE OUT WHERE TO GO TODAY
> Filter by vibe, price and neighborhood, and hide places you've already been.
>
> PLAN A DAY
> Line up stops, auto-order them into the shortest trip, and see estimated subway and walking times, with Google Maps one tap away for live directions.
>
> PLAN TOGETHER
> Make a list for a friend's visit or a weekend, sort spots into days, and invite friends with a link so they can add their own finds. Share your whole map too, if you like.
>
> Your spots sync across your devices. No ads, no tracking.

**Keywords** (100 max)
`nyc,new york,map,restaurants,cafe,coffee,bakery,brunch,places,tiktok,saved,itinerary,trip,planner`

**Support URL:** https://nyc-lovat.vercel.app/support.html
**Marketing URL** (optional): https://nyc-lovat.vercel.app
**Privacy Policy URL:** https://nyc-lovat.vercel.app/privacy.html
**Copyright:** `2026 Kotis Kwok`

**Screenshots:** iPhone 6.9" Display → upload `screenshots/1-map.png` … `7-route.png` (1320 × 2868) in that order. Apple scales them for the smaller iPhone sizes.

## App Privacy (Data types)
Tracking: **No** (the app doesn't track people across other companies' apps or websites).

Data collected. For every type: used for **App Functionality** only, **linked to the user**, **not used for tracking**.
| Category | Type | Why |
|---|---|---|
| Contact Info | Email Address | Sign-in |
| Contact Info | Name | Shown to people on shared lists |
| User Content | Other User Content | Saved places, notes, lists |
| Location | Precise Location | Home spot (optional); location sent to improve place suggestions |
| User Content | Audio Data | Speech-to-text when adding from a video |
| User Content | Photos or Videos | Still frames read when adding from a video |
| Identifiers | User ID | The account behind your data |

## App Review Information
- **Sign-in required:** Yes. Create a demo account in the app first (e.g. `appreview.nyclist@gmail.com` with a password you choose), save a few spots and make one list, then enter it here.
- **Contact:** Kotis Kwok · your phone · kwokshulum@gmail.com
- **Notes:**
> My NYC List is a personal map of New York places to visit. Sign in with the demo account above.
> • Map tab: saved spots with nearest subway; tap a pin, then Get There.
> • + button: paste a TikTok, Instagram, Threads or Google Maps link; AI fills in the spot.
> • Share extension: in Safari or TikTok tap Share → NYC List; open the app and the link opens in Add A Spot.
> • Lists tab: make a list, sort spots into days, Share & Invite to plan with friends (private, invite-only).
> • Account deletion: tap the spot counter on the Map tab → Delete My Account.
> Location is used only while the app is open, to show where you are and estimate travel times.

## Encryption
Already declared in Info.plist (`ITSAppUsesNonExemptEncryption = NO`), so no export-compliance question.
