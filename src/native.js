// iPhone app only (Capacitor). Swaps a few browser features for native ones and picks up links
// saved from the share sheet. Does nothing on the website.
"use strict";
const NYCNative = (() => {
  if (!NATIVE) return { tap() {} };
  const C = window.Capacitor;
  const plug = name => (C.Plugins && C.Plugins[name]) || (C.registerPlugin && C.registerPlugin(name));
  const Geo = plug('Geolocation'), Share = plug('Share'), App = plug('App'), Haptics = plug('Haptics'), StatusBar = plug('StatusBar'), Inbox = plug('AppGroup');

  // Location through iOS's own permission prompt ("Allow NYC List to use your location?").
  if (Geo) {
    const ids = new Map(); let n = 0;
    const err = e => { const m = String((e && e.message) || ''); return { code: /denied|permission|not authorized|disabled/i.test(m) ? 1 : /timeout/i.test(m) ? 3 : 2, message: m }; };
    const geo = {
      watchPosition(ok, bad, opts) {
        const id = ++n;
        Promise.resolve(Geo.watchPosition({ enableHighAccuracy: !!(opts && opts.enableHighAccuracy), timeout: (opts && opts.timeout) || 12000, maximumAge: (opts && opts.maximumAge) || 0 }, (pos, e) => {
          if (e || !pos) { bad && bad(err(e)); return; }
          ok && ok({ coords: pos.coords, timestamp: pos.timestamp });
        })).then(cid => { if (ids.has(id)) ids.set(id, cid); else Geo.clearWatch({ id: cid }); }).catch(e => bad && bad(err(e)));
        ids.set(id, null); return id;
      },
      clearWatch(id) { const cid = ids.get(id); ids.delete(id); if (cid) Geo.clearWatch({ id: cid }); },
      getCurrentPosition(ok, bad, opts) { Geo.getCurrentPosition({ enableHighAccuracy: !!(opts && opts.enableHighAccuracy), timeout: (opts && opts.timeout) || 12000 })
        .then(p => ok && ok({ coords: p.coords, timestamp: p.timestamp })).catch(e => bad && bad(err(e))); }
    };
    try { Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true }); } catch (e) {}
  }

  // The iOS share sheet for invite links.
  if (Share) {
    try { Object.defineProperty(navigator, 'share', { configurable: true, value: d => Share.share({ title: d.title, text: d.text, url: d.url, dialogTitle: d.title })
      .catch(e => { if (/cancel/i.test(String(e && e.message))) { const a = new Error('Share canceled'); a.name = 'AbortError'; throw a; } throw e; }) }); } catch (e) {}
  }

  // Dark status-bar text on the cream background.
  try { StatusBar && StatusBar.setStyle({ style: 'LIGHT' }); } catch (e) {}

  // Links saved from the share sheet ("Share → NYC List") wait in a shared app-group inbox.
  async function takeInbox() {
    if (!Inbox) return;
    try { const r = await Inbox.takeLinks(); const links = (r && r.links) || []; if (links.length) window.dispatchEvent(new CustomEvent('nyc-shared', { detail: links })); } catch (e) {}
  }
  function fromUrl(u) {
    // nyclist://add?url=<link>  or an invite: nyclist://join?code=<code> / https://…/?join=<code>
    try {
      const q = new URL(u).searchParams, join = q.get('join') || q.get('code');
      if (join && /join/.test(u)) { localStorage.setItem('nycList.join', join); location.reload(); return; }
      const add = q.get('add') || q.get('url'); if (add) window.dispatchEvent(new CustomEvent('nyc-shared', { detail: [add] }));
    } catch (e) {}
    takeInbox();
  }
  if (App) {
    App.addListener('resume', takeInbox);
    App.addListener('appUrlOpen', e => fromUrl(e && e.url));
  }
  window.addEventListener('load', () => setTimeout(takeInbox, 600));

  return { tap() { try { Haptics && Haptics.impact({ style: 'LIGHT' }); } catch (e) {} } };
})();
window.NYCNative = NYCNative;
