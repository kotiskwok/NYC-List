// spottedinapp.com shows the intro page (home.html) at its root. Every other address, including
// nyc-lovat.vercel.app and the iPhone app's server calls, keeps serving the app at "/".
// The web app itself lives at /app on every host (vercel.json rewrites /app to index.html).
import { rewrite } from '@vercel/functions';

export const config = { matcher: '/' };

const SITE_HOSTS = new Set(['spottedinapp.com', 'www.spottedinapp.com']);

export default function middleware(request: Request) {
  const url = new URL(request.url);
  if (!SITE_HOSTS.has(url.hostname)) return;
  // Invite, friend and share links (?join=, ?friend=, ?add=) go to the app.
  if (/[?&](join|friend|add|url|code|text)=/.test(url.search)) return rewrite(new URL('/index.html' + url.search, request.url));
  return rewrite(new URL('/home.html', request.url));
}
