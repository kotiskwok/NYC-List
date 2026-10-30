# My NYC List

Read `HANDOFF.md` first: it covers the app, the services (GitHub, Vercel, Supabase, Anthropic, OpenAI), the data model and every file.

Rules of thumb:
- No build step. Edit `src/*.js` and `api/*.js` directly; views use htm templates in `src/view.js`.
- New UI state goes in the `state` initializer and new values/handlers in `renderVals()` in `src/logic.js`.
- Shared lists live in `src/lists.js` (it mixes Lists-tab methods into `Component`; its values come from `listVals()`).
- Bump `CACHE` in `sw.js` whenever `src/` changes.
- Secrets (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) live only in Vercel environment variables.
- `vercel.json` header sources must use `/path/:path*` style patterns.
- Pushing to `main` deploys to Vercel automatically.
