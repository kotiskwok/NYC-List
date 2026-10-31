// Shared lists ("Sonia's Visit"): collections of spots, optionally sorted into days,
// that can be shared by invite link. Tables: nyc_trips, nyc_trip_members (supabase/lists.sql).
//
// Each list keeps {stops, days, start, cats} in one JSON column. Edits are applied locally right
// away, then pushed with the same three-way merge as the main list, guarded by a `rev` counter so
// two people editing at once never overwrite each other.
//
// A stop: {id, pid, by, byName, day, p:{name,cat,area,lat,lng,url,source,address,note,price}}
//   pid  = the adder's own master-map place id (null for spots added straight to the list)
//   day  = 0 for "not on a day yet", 1..days otherwise
"use strict";
const NYCLists = (() => {
  const T = 'nyc_trips', M = 'nyc_trip_members', JOIN = 'nycList.join';
  const COLS = 'id,owner,owner_name,name,share_list,share_map,invite_code,rev,data,created_at';
  let app = null, uid = null, bases = {}, dirty = new Set(), busy = {}, again = {}, timers = {}, pollT = null, loading = false;
  const sb = () => NYCSync.client && NYCSync.client();
  const same = (a, b) => NYCSync.same(a, b);
  const set = p => app && app.setState(p);
  const trips = () => (app && app.state.trips) || [];
  const normD = d => ({ stops: (d && d.stops) || [], days: (d && d.days) || 0, start: (d && d.start) || '', cats: (d && d.cats) || [], photo: (d && d.photo) || '' });
  const toTrip = r => ({ id: r.id, owner: r.owner, owner_name: r.owner_name || '', name: r.name || 'New List', share_list: !!r.share_list, share_map: !!r.share_map,
    invite_code: r.invite_code, rev: r.rev || 0, created_at: r.created_at, data: normD(r.data), members: (r.nyc_trip_members || []).map(m => ({ user_id: m.user_id, name: m.name || '' })) });
  function merge(b, l, r) {
    b = normD(b); l = normD(l); r = normD(r);
    const pick = k => same(l[k], b[k]) ? r[k] : l[k];
    return { stops: NYCSync.mergeList(b.stops, l.stops, r.stops), cats: NYCSync.mergeList(b.cats, l.cats, r.cats), days: pick('days'), start: pick('start'), photo: pick('photo') };
  }
  const missing = e => /does not exist|could not find the (table|function)|PGRST20[25]|42P01|42883/i.test(String((e && (e.message + ' ' + e.code)) || ''));
  const key = () => 'nycList.trips.' + uid;
  function persist() { if (!uid) return; try { localStorage.setItem(key(), JSON.stringify({ trips: trips(), bases, dirty: [...dirty] })); } catch (e) {} }

  // An invite link: /?join=<code>. Kept in storage so it survives making an account and confirming the email.
  (() => { try {
    const q = new URLSearchParams(location.search), c = (q.get('join') || '').trim(); if (!c) return;
    localStorage.setItem(JOIN, c); q.delete('join'); const rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) {} })();
  const pendingCode = () => { try { return localStorage.getItem(JOIN) || ''; } catch (e) { return ''; } };
  const clearCode = () => { try { localStorage.removeItem(JOIN); } catch (e) {} set({ joinInfo: null }); };

  function myName() {
    const n = NYCSync.displayName && NYCSync.displayName(); if (n) return n;
    const u = NYCSync.currentUser && NYCSync.currentUser(), e = (u && u.email) || '';
    const p = e.split('@')[0].replace(/[._\d]+/g, ' ').trim(); return p ? p.replace(/\S+/g, w => w[0].toUpperCase() + w.slice(1)) : 'Me';
  }

  function attach(a) {
    app = a;
    const code = pendingCode();
    if (code && sb()) {
      if (app.state.auth !== 'signedIn') set({ authMode: 'up' });
      sb().rpc('nyc_trip_preview', { code }).then(({ data }) => { if (data && pendingCode() === code) set({ joinInfo: data }); }).catch(() => {});
    }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && uid) { dirty.forEach(id => schedule(id, 50)); if (app.state.tab === 'lists') refresh(); } });
    window.addEventListener('online', () => { if (uid) { dirty.forEach(id => schedule(id, 50)); refresh(); } });
  }

  async function onUser(u) {
    const prev = uid; uid = u ? u.id : null; clearInterval(pollT);
    Object.values(timers).forEach(clearTimeout); timers = {}; bases = {}; dirty = new Set();
    if (!uid) { if (prev) try { localStorage.removeItem('nycList.trips.' + prev); } catch (e) {} set({ trips: [], tripsState: '', tripId: null, tripSel: null, sharedMaps: {} }); return; }
    let c = null; try { c = JSON.parse(localStorage.getItem(key())); } catch (e) {}
    if (c && Array.isArray(c.trips)) { bases = c.bases || {}; dirty = new Set(c.dirty || []); set({ trips: c.trips, tripsState: 'ready' }); }
    else set({ tripsState: 'loading' });
    const code = pendingCode();
    if (code) await join(code); else await refresh();
    pollT = setInterval(() => { if (document.visibilityState === 'visible' && app.state.tab === 'lists') refresh(); }, 20000);
  }

  async function refresh() {
    if (!uid || !sb() || loading) return; loading = true;
    try {
      const { data, error } = await sb().from(T).select(COLS + ',nyc_trip_members(user_id,name)').order('created_at', { ascending: false });
      if (error) throw error;
      const cur = new Map(trips().map(t => [t.id, t]));
      const next = (data || []).map(r => {
        const t = toTrip(r), c = cur.get(t.id);
        if (c && dirty.has(t.id)) return { ...t, data: c.data, rev: c.rev };   // keep local edits; push merges them
        bases[t.id] = t.data; return t;
      });
      const ids = new Set(next.map(t => t.id));
      Object.keys(bases).forEach(id => { if (!ids.has(id)) { delete bases[id]; dirty.delete(id); } });
      const s = app.state;
      set({ trips: next, tripsState: 'ready', tripsSync: dirty.size ? 'saving' : 'saved', tripId: s.tripId && ids.has(s.tripId) ? s.tripId : null });
      persist(); dirty.forEach(id => schedule(id, 50));
      const open = next.find(t => t.id === app.state.tripId); if (open && open.share_map && open.owner !== uid) loadSharedMap(open.id);
    } catch (e) {
      set({ tripsState: missing(e) ? 'missing' : trips().length ? 'ready' : 'error', tripsSync: missing(e) ? '' : 'offline' });
    } finally { loading = false; }
  }

  async function join(code) {
    try {
      const { data, error } = await sb().rpc('nyc_join_trip', { code, p_name: myName() });
      if (error) { if (missing(error)) { clearCode(); await refresh(); return; } throw error; }
      clearCode();
      await refresh();
      if (!data) { app.toast('That Invite Link Was Replaced — Ask For A New One'); return; }
      const t = trips().find(x => x.id === data);
      set({ tab: 'lists', tripId: data, tripView: t && !t.share_list && t.owner !== uid ? 'map' : 'list', tripSel: null, selId: null, routeFor: null, addOpen: false });
      if (t && t.owner !== uid) { app.toast('You Joined “' + t.name + '”!'); if (t.share_map) loadSharedMap(t.id); }
    } catch (e) { await refresh(); app.toast('Couldn’t Join The List Yet — Check Your Connection'); }
  }

  async function create(fields) {
    const row = { owner: uid, owner_name: myName(), name: fields.name, data: normD(fields.data) };
    const { data, error } = await sb().from(T).insert(row).select(COLS).single();
    if (error) throw error;
    const t = toTrip({ ...data, nyc_trip_members: [] }); bases[t.id] = t.data;
    set({ trips: [t, ...trips()] }); persist(); return t;
  }

  // Change a list's contents. fn gets a copy of {stops, days, start, cats} and returns the new one.
  function edit(id, fn) {
    const t = trips().find(x => x.id === id); if (!t) return;
    const d = fn(normD(t.data)); if (!d || same(d, t.data)) return;
    set({ trips: trips().map(x => x.id === id ? { ...x, data: d } : x) });
    dirty.add(id); persist(); schedule(id, 700);
  }
  function schedule(id, ms) { clearTimeout(timers[id]); timers[id] = setTimeout(() => push(id), ms); set({ tripsSync: 'saving' }); }
  async function push(id) {
    if (!uid || !sb()) return;
    if (busy[id]) { again[id] = true; return; }
    busy[id] = true;
    try {
      for (let i = 0; i < 4; i++) {
        const t0 = trips().find(t => t.id === id); if (!t0) { dirty.delete(id); break; }
        const local = t0.data;
        const { data: row, error } = await sb().from(T).select('data,rev').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!row) {   // deleted, or you were taken off it
          dirty.delete(id); delete bases[id];
          set({ trips: trips().filter(t => t.id !== id), tripId: app.state.tripId === id ? null : app.state.tripId, tripSel: app.state.tripId === id ? null : app.state.tripSel });
          app.toast('That List Isn’t Shared With You Anymore'); break;
        }
        const remote = normD(row.data), target = merge(bases[id] || remote, local, remote);
        let rev = row.rev;
        if (!same(target, remote)) {
          const { data: up, error: e2 } = await sb().from(T).update({ data: target, rev: row.rev + 1, updated_at: new Date().toISOString() }).eq('id', id).eq('rev', row.rev).select('rev');
          if (e2) throw e2;
          if (!up || !up.length) continue;   // someone else saved in between: merge again
          rev = up[0].rev;
        }
        bases[id] = target;
        const now = (trips().find(t => t.id === id) || {}).data;
        if (now && !same(now, local)) {      // edited while saving: replay those edits on top
          set({ trips: trips().map(t => t.id === id ? { ...t, data: merge(local, now, target), rev } : t) }); again[id] = true;
        } else {
          dirty.delete(id); set({ trips: trips().map(t => t.id === id ? { ...t, data: target, rev } : t) });
        }
        break;
      }
      set({ tripsSync: dirty.size ? 'saving' : 'saved' });
    } catch (e) { set({ tripsSync: 'offline' }); }
    finally { busy[id] = false; persist(); if (again[id]) { again[id] = false; schedule(id, 300); } }
  }

  // Owner-only fields: name, share_list, share_map, invite_code.
  async function meta(id, patch) {
    set({ trips: trips().map(t => t.id === id ? { ...t, ...patch } : t) }); persist();
    try { const { error } = await sb().from(T).update(patch).eq('id', id); if (error) throw error; return true; }
    catch (e) { app.toast('Couldn’t Save That — Check Your Connection'); refresh(); return false; }
  }
  const newCode = id => meta(id, { invite_code: (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, '').slice(0, 14) });
  async function removeMember(id, userId) {
    set({ trips: trips().map(t => t.id === id ? { ...t, members: t.members.filter(m => m.user_id !== userId) } : t) });
    const { error } = await sb().from(M).delete().eq('trip_id', id).eq('user_id', userId);
    if (error) app.toast('Couldn’t Remove Them — Check Your Connection'); refresh();
  }
  async function leave(id) {
    const { error } = await sb().from(M).delete().eq('trip_id', id).eq('user_id', uid);
    if (error) { app.toast('Couldn’t Leave — Check Your Connection'); return; }
    dropLocal(id); app.toast('You Left The List');
  }
  async function remove(id) {
    const { error } = await sb().from(T).delete().eq('id', id);
    if (error) { app.toast('Couldn’t Delete It — Check Your Connection'); return; }
    dropLocal(id); app.toast('List Deleted');
  }
  function dropLocal(id) { delete bases[id]; dirty.delete(id); set({ trips: trips().filter(t => t.id !== id), tripId: null, tripSel: null }); persist(); }

  async function loadSharedMap(id) {
    try {
      const { data, error } = await sb().rpc('nyc_shared_map', { t: id });
      if (error) throw error;
      set({ sharedMaps: { ...(app.state.sharedMaps || {}), [id]: data ? { places: data.places || [], cats: data.cats || [] } : { places: [], cats: [], off: true } } });
    } catch (e) {}
  }

  // When you edit a spot on your own map, refresh its copy on your lists so friends see the change.
  function touchPlaces(places) {
    if (!uid) return; const byId = new Map(places.map(p => [p.id, p]));
    trips().forEach(t => {
      if (!(t.owner === uid || t.share_list)) return;
      const stale = t.data.stops.some(st => st.by === uid && st.pid && byId.has(st.pid) && !same(st.p, snap(byId.get(st.pid))));
      if (stale) edit(t.id, d => ({ ...d, stops: d.stops.map(st => st.by === uid && st.pid && byId.has(st.pid) ? { ...st, p: snap(byId.get(st.pid)) } : st) }));
    });
  }
  const snap = p => ({ name: p.name, cat: p.cat, area: p.area, lat: p.lat, lng: p.lng, url: p.url || '', source: p.source || 'manual', address: p.address || '', note: p.note || '', price: p.price || 0, photo: p.photo || '', city: p.city || CUR.id });

  return { attach, onUser, refresh, create, edit, meta, newCode, removeMember, leave, remove, loadSharedMap, touchPlaces, pendingCode, myName, snap,
    uid: () => uid, setName: n => NYCSync.setName(n) };
})();
window.NYCLists = NYCLists;

// ---------------------------------------------------------------------------------------------
// App behaviour for the Lists tab (mixed into the Component class from logic.js).
const DAYC = ['#FF6B1A', '#1B3DB8', '#F45FA0', '#1F9D6B', '#7A4FD6', '#E8242C', '#0E9AA7'];
const dayCol = d => d ? DAYC[(d - 1) % DAYC.length] : '#7A809C';
const dayDate = (start, d) => { if (!start || !d) return ''; const t = new Date(start + 'T12:00:00'); if (isNaN(t)) return ''; t.setDate(t.getDate() + d - 1);
  return t.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
const dayName = (start, d) => d ? 'Day ' + d + (dayDate(start, d) ? ' · ' + dayDate(start, d) : '') : 'Not On A Day Yet';
// Wallet cards: each list gets a palette color (in list order), a date range and a countdown.
const WALLET = [['#F98DBE', '#F45FA0', '#D93F86', '#fff'], ['#FFE38F', '#FFC425', '#F5AE10', '#10183F'], ['#5C78E6', '#1B3DB8', '#142E92', '#fff'], ['#52C496', '#1F9D6B', '#16805A', '#fff'], ['#FFA26A', '#FF6B1A', '#E8561A', '#fff']];
const WSTEP = 64; // how much of each stacked card shows (196px card, -132px overlap)
const walletOf = i => { const w = WALLET[Math.max(0, i) % WALLET.length]; return { bg: `linear-gradient(135deg,${w[0]},${w[1]} 55%,${w[2]})`, fg: w[3], solid: w[1] }; };
const shortD = (start, d) => { const x = dayDate(start, d); return x ? (x.split(', ')[1] || x) : ''; };
const dayTag = (start, d) => { const x = dayDate(start, d); if (!x) return ''; const [wd, md] = x.split(', '); return (wd + ' ' + (md || '').split(' ')[1]).toUpperCase(); };
const dateRange = (start, days) => { const a = shortD(start, 1); if (!a) return ''; if (!days || days < 2) return a; const b = shortD(start, days);
  return a.split(' ')[0] === b.split(' ')[0] ? a + ' – ' + b.split(' ')[1] : a + ' – ' + b; };
const countdown = (start, days) => { if (!start) return null; const t0 = new Date(start + 'T00:00:00'); if (isNaN(t0)) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0); const diff = Math.round((t0 - now) / 864e5), n = Math.max(1, days || 1);
  if (diff > 1) return { top: 'IN', big: diff + ' days' }; if (diff === 1) return { top: 'STARTS', big: 'Tomorrow' };
  if (diff <= 0 && -diff < n) return { top: 'TODAY', big: n > 1 ? 'Day ' + (1 - diff) + ' of ' + n : 'Today' }; return { top: 'WENT', big: 'Done ✓' }; };
const sid = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const gSearch = p => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(placeQ(p));

Object.assign(Component.prototype, {
  tripCur() { const s = this.state; return s.trips.find(t => t.id === s.tripId) || null; },
  // A list's own picture (instead of its initial), saved in the uploader's photo folder and shared through the list's data.
  pickTripPhoto(id, file) { if (!file) return; if (!window.NYCSync || this.state.auth !== 'signedIn') { this.toast('Sign In To Add Photos'); return; }
    this.setState({ tripPhotoBusy: true });
    shrinkImage(file, 480, 480).then(b => NYCSync.uploadImage('list-' + id, b)).then(r => { this.setState({ tripPhotoBusy: false });
      if (r.error) { this.toast(photoErr(r.error)); return; } NYCLists.edit(id, d => ({ ...d, photo: r.url })); this.toast('List Photo Saved'); })
      .catch(e => { this.setState({ tripPhotoBusy: false }); this.toast((e && e.message) || 'Couldn’t Upload It'); }); },
  tripPerm(t) { const me = NYCLists.uid(), own = !!t && t.owner === me;
    return { own, edit: !!t && (own || t.share_list), list: !!t && (own || t.share_list), map: !!t && !own && t.share_map }; },
  tripViewEff(t) { const p = this.tripPerm(t); if (!t) return 'list'; if (!p.list) return 'map'; return this.state.tripView === 'map' && p.map ? 'map' : 'list'; },
  tripCatMap(t, extra) { const m = {}; (extra || []).forEach(c => m[c.id] = c); (t ? t.data.cats : []).forEach(c => m[c.id] = c); this.state.cats.forEach(c => { if (!m[c.id]) m[c.id] = c; }); return m; },
  // A stop's place: your own map's live copy when it came from your map, otherwise the saved copy.
  stopPlace(st) { if (st.by === NYCLists.uid() && st.pid) { const p = this.state.places.find(x => x.id === st.pid); if (p) return { ...st.p, ...NYCLists.snap(p) }; } return st.p; },
  onMyMap(p) { return this.state.places.some(x => x.name.trim().toLowerCase() === (p.name || '').trim().toLowerCase() && km([x.lat, x.lng], [p.lat, p.lng]) < 0.4); },
  // Stops grouped for display: "not on a day yet" first, then Day 1..n (or one plain list when there are no days).
  tripSections(t) {
    const d = t.data, n = d.days || 0, day = st => (st.day >= 1 && st.day <= n) ? st.day : 0;
    if (!n) return [{ day: 0, flat: true, stops: d.stops }];
    const out = [];
    for (let k = 0; k <= n; k++) { const stops = d.stops.filter(st => day(st) === k); if (k > 0 || stops.length) out.push({ day: k, stops }); }
    return out;
  },
  addStopsTo(tripId, places, fromMap) {
    const me = NYCLists.uid(), name = NYCLists.myName(), cats = this.state.cats;
    NYCLists.edit(tripId, d => {
      const have = new Set(d.stops.filter(st => st.by === me && st.pid).map(st => st.pid));
      const add = places.filter(p => !(fromMap && have.has(p.id))).map(p => ({ id: sid(), pid: fromMap ? p.id : null, by: me, byName: name, day: 0, p: NYCLists.snap(p) }));
      if (!add.length) return null;
      const catIds = new Set(d.cats.map(c => c.id)), newCats = [];
      add.forEach(st => { const c = cats.find(x => x.id === st.p.cat); if (c && !catIds.has(c.id)) { catIds.add(c.id); newCats.push({ ...c, emoji: emo(c) }); } });
      return { ...d, stops: [...d.stops, ...add], cats: [...d.cats, ...newCats] };
    });
  },
  removeStop(tripId, stopId) { NYCLists.edit(tripId, d => ({ ...d, stops: d.stops.filter(st => st.id !== stopId) })); },
  toggleMapStop(tripId, p) { const t = this.state.trips.find(x => x.id === tripId); if (!t) return; const me = NYCLists.uid();
    const st = t.data.stops.find(x => x.by === me && x.pid === p.id);
    if (st) this.removeStop(tripId, st.id); else this.addStopsTo(tripId, [p], true); },
  setStopDay(tripId, stopId, day) { NYCLists.edit(tripId, d => {
      // Move it to the end of its new day so the order inside each day stays meaningful.
      const st = d.stops.find(x => x.id === stopId); if (!st) return null;
      return { ...d, stops: [...d.stops.filter(x => x.id !== stopId), { ...st, day }] }; }); },
  moveStop(tripId, stopId, dir) { NYCLists.edit(tripId, d => {
      const n = d.days || 0, day = st => (st.day >= 1 && st.day <= n) ? st.day : 0, stops = [...d.stops], i = stops.findIndex(x => x.id === stopId); if (i < 0) return null;
      let j = i + dir; while (j >= 0 && j < stops.length && n && day(stops[j]) !== day(stops[i])) j += dir;
      if (j < 0 || j >= stops.length) return null; [stops[i], stops[j]] = [stops[j], stops[i]]; return { ...d, stops }; }); },
  addDay(tripId) { NYCLists.edit(tripId, d => ({ ...d, days: Math.min(14, (d.days || 0) + 1) })); },
  removeDay(tripId, k) { NYCLists.edit(tripId, d => ({ ...d, days: Math.max(0, (d.days || 0) - 1),
    stops: d.stops.map(st => st.day === k ? { ...st, day: 0 } : st.day > k ? { ...st, day: st.day - 1 } : st) })); },
  // Copy a place from a list (or a friend's map) onto your own map.
  saveToMyMap(p, cats) {
    const s = this.state; let cat = p.cat, newCats = null;
    if (!s.cats.some(c => c.id === cat)) { const c = (cats || {})[cat]; if (c) newCats = [...s.cats, { id: c.id, name: c.name, color: c.color, emoji: emo(c) }]; else cat = (s.cats[0] || {}).id; }
    const np = { id: 'p' + Date.now(), name: p.name, cat, area: p.area, lat: p.lat, lng: p.lng, url: p.url || '', source: p.source || 'manual', address: p.address || '', note: p.note || '', price: p.price || 0, visited: false };
    // A spot in another city goes to that city's map.
    const home = CITY_ORDER.find(k => inBox([np.lat, np.lng], CITIES[k])) || CUR.id; np.city = home;
    if (home === CUR.id) this.setState(st => ({ places: [np, ...st.places], ...(newCats ? { cats: newCats } : {}) }));
    else this.setState(st => ({ otherPlaces: [np, ...(st.otherPlaces || [])], ...(newCats ? { cats: newCats } : {}) }));
    this.toast(home === CUR.id ? 'Saved To Your Map!' : 'Saved To Your ' + CITIES[home].name + ' Map!');
  },
  openTrip(id) { const t = this.state.trips.find(x => x.id === id); const p = this.tripPerm(t);
    this.setState({ tab: 'lists', tripId: id, tripStopMap: false, tripDay: 'all', tripView: p.list ? 'list' : 'map', tripSel: null, selId: null, routeFor: null, tripShareOpen: false, tripEditOpen: false, confirmTripDel: false });
    if (p.map) NYCLists.loadSharedMap(id); NYCLists.refresh(); },
  async createTrip() {
    const s = this.state, name = toTitle((s.newTripName || '').trim()); if (!name || s.newTripBusy) return;
    this.setState({ newTripBusy: true });
    try {
      const myName = (s.newTripMe || '').trim(); if (myName && !NYCSync.displayName()) await NYCLists.setName(toTitle(myName));
      const t = await NYCLists.create({ name, data: { stops: [], days: s.newTripDays || 0, start: s.newTripStart || '', cats: [] } });
      const pid = s.newTripAddPid; const p = pid && this.state.places.find(x => x.id === pid);
      this.setState({ newTripOpen: false, newTripBusy: false, newTripName: '', newTripDays: 0, newTripStart: '', newTripAddPid: null, listChoose: null });
      if (p) { this.addStopsTo(t.id, [p], true); this.toast('Added To “' + t.name + '”'); }
      else { this.openTrip(t.id); this.toast('List Made — Now Add Some Spots'); }
    } catch (e) {
      const m = String(e && e.message || ''); this.setState({ newTripBusy: false });
      this.toast(/does not exist|could not find/i.test(m) ? 'Lists Need The One-Time Database Setup First' : 'Couldn’t Make The List — Check Your Connection');
    }
  },
  inviteLink(t) { return SITE() + '/?join=' + encodeURIComponent(t.invite_code); },
  inviteText(t) { const what = t.share_list && t.share_map ? 'plan “' + t.name + '” and see my map' : t.share_list ? 'plan “' + t.name + '”' : 'see my map';
    return `${t.owner_name || NYCLists.myName()} invited you to ${what} on Spotted In 🗽`; },
  async shareInvite(t) { const url = this.inviteLink(t), text = this.inviteText(t);
    if (navigator.share) { try { await navigator.share({ title: t.name, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    this.copyInvite(t); },
  copyInvite(t) { const v = this.inviteText(t) + '\n' + this.inviteLink(t);
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => this.toast('Invite Link Copied!')).catch(() => this.toast('Press And Hold The Link To Copy It')); },
  setShare(t, mode) { NYCLists.meta(t.id, { share_list: mode !== 'map', share_map: mode !== 'list' }); },

  // ---- map on a list's page ----
  syncTrip(force) {
    const m = this.maps && this.maps.trip; if (!m) return; const L = window.L, s = this.state, t = this.tripCur();
    if (!m.tl) m.tl = L.layerGroup().addTo(m.map);
    if (!t) { if (m.tsig) { m.tl.clearLayers(); m.tsig = ''; } return; }
    const view = this.tripViewEff(t), sel = s.tripSel ? s.tripSel.id : '';
    let pins = [], lines = [];
    if (view === 'map') {
      const sm = s.sharedMaps[t.id] || { places: [], cats: [] }, cats = this.tripCatMap(t, sm.cats);
      pins = sm.places.map(p => { const c = cats[p.cat] || {}; return { id: p.id, ll: [p.lat, p.lng], col: c.color || C.orange, em: c.id ? emo(c) : '📍', sel: p.id === sel, faded: p.visited, kind: 'shared' }; });
    } else {
      const cats = this.tripCatMap(t);
      this.tripSections(t).forEach(sec => { const pts = [];
        sec.stops.forEach((st, i) => { const p = this.stopPlace(st), c = cats[p.cat] || {}, numbered = sec.flat || sec.day > 0;
          pins.push({ id: st.id, ll: [p.lat, p.lng], col: sec.flat ? (c.color || C.orange) : dayCol(sec.day), label: numbered ? String(i + 1) : null, em: c.id ? emo(c) : '📍', sel: st.id === sel, kind: 'stop' });
          pts.push([p.lat, p.lng]); });
        if (sec.day > 0 && pts.length > 1) lines.push({ pts, col: dayCol(sec.day) }); });
    }
    const sig = view + JSON.stringify(pins) + JSON.stringify(lines), ids = view + t.id + pins.map(p => p.id).join();
    if (!force && sig === m.tsig) return; m.tsig = sig; m.tl.clearLayers();
    const rend = L.svg({ pane: 'route' });
    lines.forEach(l => { L.polyline(l.pts, { renderer: rend, color: '#fff', weight: 7, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(m.tl);
      L.polyline(l.pts, { renderer: rend, color: l.col, weight: 3.5, dashArray: '2 8', lineCap: 'round', interactive: false }).addTo(m.tl); });
    pins.forEach(p => { const z = p.sel ? 56 : 40;
      L.marker(p.ll, { zIndexOffset: p.sel ? 1000 : p.label ? 500 : 0, icon: L.divIcon({ className: '', html: this.pinHtml(p.col, z, p.sel, p.faded && !p.sel, null, p.em, p.label), iconSize: [z, z], iconAnchor: [z / 2, z / 2] }) })
        .on('click', e => { L.DomEvent.stopPropagation(e); this.setState({ tripSel: { kind: p.kind, id: p.id }, confirmStopDel: false }); }).addTo(m.tl); });
    if (force || ids !== m.tids) { m.tids = ids; const pts = pins.map(p => p.ll);
      if (pts.length) setTimeout(() => this.fit(m, pts, view === 'map' ? { paddingTopLeft: [40, 210], paddingBottomRight: [40, 120], maxZoom: 15 } : { paddingTopLeft: [40, 110], paddingBottomRight: [40, 150], maxZoom: 15 }), 30);
      else m.map.setView(CUR.center, 12); }
  },

  // ---- who else has this list open right now (Supabase Realtime presence) ----
  watchPresence() {
    const s = this.state, key = s.auth === 'signedIn' && s.tab === 'lists' && s.tripId ? s.tripId : '';
    if (key === this._presKey) return; this._presKey = key;
    const c = NYCSync.client && NYCSync.client();
    if (this._pres) { try { c && c.removeChannel(this._pres); } catch (e) {} this._pres = null; }
    if ((s.tripHere || []).length) this.setState({ tripHere: [] });
    if (!key || !c || !c.channel) return;
    const me = NYCLists.uid(), ch = c.channel('nyc-list-' + key, { config: { presence: { key: me } } }); this._pres = ch;
    ch.on('presence', { event: 'sync' }, () => { if (this._pres !== ch) return; const st = ch.presenceState();
      this.setState({ tripHere: Object.keys(st).filter(k => k !== me).map(k => ((st[k] || [])[0] || {}).name || 'Someone') }); })
      .subscribe(status => { if (status === 'SUBSCRIBED') Promise.resolve(ch.track({ name: (NYCSync.displayName && NYCSync.displayName()) || 'Someone' })).catch(() => {}); });
  },
  setTripStopMap(on) { this.setState({ tripStopMap: on, tripSel: null }, () => setTimeout(() => { this.refreshVisible && this.refreshVisible(); }, 60)); },

  // ---- values for the view ----
  // ---- Wallet: long-press a card, then drag it up or down to reorder (like Apple Wallet). ----
  // state.listOrder holds list ids front-first (the front card is the big one at the bottom); it syncs with the account.
  // Lists not in it yet (new or just joined) go in front.
  walletDown(e, id, vis, n) {
    if (e.button) return; const y0 = e.clientY, x0 = e.clientX; clearTimeout(this._wdT);
    const done = () => { clearTimeout(this._wdT); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel); };
    const mv = ev => { const dy = ev.clientY - y0;
      if (!this._wd) { if (Math.abs(dy) > 8 || Math.abs(ev.clientX - x0) > 8) done(); return; }
      const over = Math.max(0, Math.min(n - 1, vis + Math.round(dy / WSTEP))); if (over !== this._wd.over && window.NYCNative) NYCNative.tap(); this._wd = { ...this._wd, dy, over }; this.setState({ walletDrag: this._wd }); };
    const up = () => { const wd = this._wd; done(); if (wd) { this._wd = null; this._wdJust = Date.now(); this.walletDrop(wd); } };
    const cancel = () => { done(); if (this._wd) { this._wd = null; this.setState({ walletDrag: null }); } };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel);
    this._wdT = setTimeout(() => { this._wd = { id, from: vis, over: vis, dy: 0 }; try { window.NYCNative ? NYCNative.tap('MEDIUM') : navigator.vibrate && navigator.vibrate(12); } catch (_) {} this.setState({ walletDrag: this._wd }); }, 380);
  },
  walletDrop(wd) {
    const front = this._walletIds || [], vis = [...front].reverse(), [m] = vis.splice(wd.from, 1); vis.splice(wd.over, 0, m);
    this.setState({ walletDrag: null, ...(wd.over !== wd.from ? { listOrder: vis.reverse() } : {}) });
    if (wd.over !== wd.from) this.toast('List Order Saved');
  },
  // Stops the page scrolling while a card is lifted (iOS needs a non-passive touchmove listener).
  walletRef(el) { if (!el || el._wl) return; el._wl = 1; el.addEventListener('touchmove', e => { if (this._wd && e.cancelable) e.preventDefault(); }, { passive: false }); },

  listVals() {
    const s = this.state, me = NYCLists.uid(), signedIn = s.auth === 'signedIn', t = this.tripCur(), perm = this.tripPerm(t);
    const chip = (on, label, onClick, col) => ({ label, onClick, bg: on ? (col || C.navy) : '#fff', fg: on ? '#fff' : C.navy, border: on ? (col || C.navy) : 'rgba(16,24,63,.14)' });
    const who = tr => { const own = tr.owner === me, names = tr.members.map(m => m.name || 'Someone');
      if (own) return names.length ? 'With ' + (names.length > 2 ? names.slice(0, 2).join(', ') + ' + ' + (names.length - 2) : names.join(' & ')) : 'Just You So Far';
      return 'From ' + (tr.owner_name || 'A Friend'); };
    const cards = s.trips.map(tr => { const n = tr.data.stops.length, d = tr.data.days || 0, own = tr.owner === me, pm = this.tripPerm(tr);
      const tags = []; if (own) { if (tr.members.length) { if (tr.share_list) tags.push({ t: 'Shared List', bg: C.blue }); if (tr.share_map) tags.push({ t: 'Shared Map', bg: C.green }); } }
      else { tags.push({ t: pm.list ? 'You Can Add Spots' : 'Map Only', bg: pm.list ? C.pink : C.green }); }
      const firstDate = dayDate(tr.data.start, 1);
      const ci = s.trips.indexOf(tr), w = walletOf(ci), ppl = [{ n: tr.owner_name || (own ? 'You' : 'Owner'), id: tr.owner }, ...tr.members.map(m => ({ n: m.name || 'Someone', id: m.user_id }))].slice(0, 3);
      let next = null; if (pm.list && n) { const st = [...tr.data.stops].sort((a, b) => (a.day || 99) - (b.day || 99))[0], pl = this.stopPlace(st);
        next = { name: pl.name, sub: [st.day ? 'DAY ' + st.day : '', dayTag(tr.data.start, st.day), (pl.area || '').toUpperCase()].filter(Boolean).join(' · '), img: placeImg(pl) }; }
      return { id: tr.id, wbg: w.bg, wfg: w.fg, spots: pm.list ? n : null, days: d, range: dateRange(tr.data.start, d), cd: countdown(tr.data.start, d), next,
        ppl: ppl.map((a, i) => ({ key: i, initial: (a.n || '?')[0].toUpperCase(), bg: [C.blue, C.orange, C.purple][i] })), tagMono: tags.map(g => g.t.toUpperCase()).join(' · '),
        name: tr.name, who: who(tr), meta: (pm.list ? n + (n === 1 ? ' Spot' : ' Spots') : 'View-Only Map') + (d ? ' · ' + d + (d === 1 ? ' Day' : ' Days') : '') + (firstDate ? ' · From ' + firstDate : ''),
        tags, img: tr.data.photo || null, initial: tr.name.replace(/^the\s+/i, '')[0] || '★', bg: own ? C.yellow : C.pink, fg: own ? C.navy : '#fff', onClick: () => this.openTrip(tr.id) }; });

    { const ord = s.listOrder || [], rk = id => ord.indexOf(id); cards.sort((a, b) => rk(a.id) - rk(b.id)); }
    this._walletIds = cards.map(c => c.id);
    { const wd = s.walletDrag, n = cards.length;
      cards.forEach((c, k) => { const j = n - 1 - k; let sh = 0;
        if (wd && c.id !== wd.id) { if (wd.from < wd.over && j > wd.from && j <= wd.over) sh = -WSTEP; else if (wd.from > wd.over && j >= wd.over && j < wd.from) sh = WSTEP; }
        const lifted = !!wd && c.id === wd.id, click = c.onClick;
        Object.assign(c, { lifted, dragging: !!wd, wTf: lifted ? `translateY(${wd.dy}px) scale(1.035)` : sh ? `translateY(${sh}px)` : '',
          onDown: e => this.walletDown(e, c.id, j, n), onClick: () => { if (Date.now() - (this._wdJust || 0) < 450) return; click(); } }); }); }

    let detail = null;
    if (t) {
      const cats = this.tripCatMap(t), view = this.tripViewEff(t), d = t.data, ownerName = t.owner === me ? 'You' : (t.owner_name || 'Owner');
      const sections = perm.list ? this.tripSections(t).map(sec => {
        const dayOpts = [{ v: 0, label: 'No Day' }, ...Array.from({ length: d.days || 0 }, (_, i) => ({ v: i + 1, label: 'Day ' + (i + 1) }))];
        const rows = sec.stops.map((st, i) => { const p = this.stopPlace(st), c = cats[p.cat] || { name: 'Spot', color: '#888' }, numbered = sec.flat || sec.day > 0;
          let leg = null;
          if (numbered && i > 0) { const q = this.stopPlace(sec.stops[i - 1]), a = [q.lat, q.lng], b = [p.lat, p.lng];
            if (km(a, b) < 60) { const e = estimate(a, b), sub = e.subway;
              leg = sub ? { min: Math.max(1, Math.round(sub.min)), walk: false, bullets: [...new Set(sub.legs.filter(x => x.k === 'ride').flatMap(x => x.r.slice(0, 1)))].slice(0, 2).map(bullet) }
                : { min: Math.max(1, Math.round(e.walk.min)), walk: true, bullets: [] }; } }
          return { key: st.id, leg, catEmoji: emo(c), catColor: c.color, num: numbered ? String(i + 1) : '', emoji: numbered ? '' : emo(c), name: p.name, sub: [c.name, p.area].filter(Boolean).join(' · '), note: p.note, hasNote: !!p.note,
            img: placeImg(p), badge: numbered ? (sec.flat ? c.color : dayCol(sec.day)) : c.color, badgeFg: numbered && !sec.flat ? '#fff' : fgFor(c.color),
            by: st.by === me ? '' : 'Added By ' + (st.byName || 'A Friend'), hasBy: st.by !== me, ring: s.tripSel && s.tripSel.id === st.id ? C.navy : 'transparent',
            canEdit: perm.edit, hasDays: !!(d.days), dayVal: String(sec.day), dayOpts, onDay: e => this.setStopDay(t.id, st.id, +e.target.value),
            up: e => { e.stopPropagation(); this.moveStop(t.id, st.id, -1); }, down: e => { e.stopPropagation(); this.moveStop(t.id, st.id, 1); },
            upOp: i === 0 ? .3 : 1, downOp: i === sec.stops.length - 1 ? .3 : 1,
            onClick: () => { this.setState({ tripSel: { kind: 'stop', id: st.id }, confirmStopDel: false }); const m = this.maps && this.maps.trip; if (m) m.map.flyTo([p.lat, p.lng], 15, { duration: .6 }); } }; });
        const pl = sec.stops.map(st => this.stopPlace(st));
        return { key: 'd' + sec.day, day: sec.day, chip: sec.day ? 'Day ' + sec.day : 'Not On A Day', title: sec.flat ? '' : dayName(d.start, sec.day), hasTitle: !sec.flat, col: dayCol(sec.day), rows, empty: !rows.length,
          count: rows.length ? rows.length + (rows.length === 1 ? ' Spot' : ' Spots') : '',
          canRemove: perm.edit && sec.day > 0 && sec.day === d.days, onRemove: () => this.removeDay(t.id, sec.day),
          hasDirs: sec.day > 0 && pl.length > 1, onDirs: () => window.open('https://www.google.com/maps/dir/' + pl.slice(0, 10).map(p => encodeURIComponent(placeQ(p))).join('/'), '_blank') }; }) : [];
      const people = [{ name: ownerName, role: 'Made This List', isMe: t.owner === me, key: t.owner }, ...t.members.map(m => ({ name: m.user_id === me ? 'You' : (m.name || 'Someone'), role: perm.own ? (t.share_list ? 'Can Add & Sort' : 'Can See Your Map') : 'Invited', isMe: m.user_id === me, key: m.user_id,
        canRemove: perm.own, onRemove: () => NYCLists.removeMember(t.id, m.user_id) }))];
      const sm = s.sharedMaps[t.id];
      // Day tabs: show every day, or just one.
      const dayKey = sections.some(x => x.key === s.tripDay) ? s.tripDay : 'all';
      const dayChips = sections.length > 1 && sections.some(x => x.hasTitle) ? [{ key: 'all', label: 'All', on: dayKey === 'all', col: C.navy },
        ...[...sections].sort((x, y) => (x.day || 99) - (y.day || 99)).map(x => ({ key: x.key, label: x.chip, on: dayKey === x.key, col: x.col, dashed: !x.day }))].map(c => ({ ...c, onClick: () => this.setState({ tripDay: c.key }) })) : [];
      const shown = dayKey === 'all' ? sections : sections.filter(x => x.key === dayKey);
      const firstDate = dayDate(d.start, 1), nSp = d.stops.length;
      const metaMono = (perm.list ? [d.days ? d.days + (d.days === 1 ? ' DAY' : ' DAYS') : '', nSp + (nSp === 1 ? ' SPOT' : ' SPOTS'), firstDate ? 'STARTS ' + (firstDate.split(', ')[1] || firstDate).toUpperCase() : '', perm.own ? '' : 'FROM ' + (t.owner_name || 'A FRIEND').toUpperCase()] : ['VIEW-ONLY MAP']).filter(Boolean).join(' · ');
      const photo = uid => window.NYCSync && NYCSync.avatarUrl ? NYCSync.avatarUrl(uid, uid === me ? this.state.avatarV : 0) : null;
      const avatars = [{ n: t.owner_name || ownerName, id: t.owner }, ...t.members.map(m => ({ n: m.name || 'Someone', id: m.user_id }))].slice(0, 3).map((a, i) => ({ key: i, initial: (a.n || '?')[0].toUpperCase(), bg: [C.blue, C.pink, C.purple][i], src: a.id === me && !this.state.avatarV ? null : photo(a.id) }));
      const routeSec = shown.length === 1 && shown[0].hasDirs ? shown[0] : null;
      const ti = s.trips.indexOf(t), w = walletOf(ti), shownRows = shown.flatMap(x => x.rows), travel = shownRows.reduce((a, r) => a + (r.leg ? r.leg.min : 0), 0);
      const oneDay = dayKey !== 'all' ? sections.find(x => x.key === dayKey) : null;
      const here = (s.tripHere || []).filter((x, i, a) => a.indexOf(x) === i);
      const others = s.trips.filter(x => x.id !== t.id).slice(0, 3).map(x => { const ww = walletOf(s.trips.indexOf(x)); return { key: x.id, name: x.name, bg: ww.bg, fg: ww.fg, onClick: () => this.openTrip(x.id) }; });
      dayChips.forEach(c => { const sec = sections.find(x => x.key === c.key); c.date = c.key === 'all' ? 'ALL' : sec && sec.day ? (dayTag(d.start, sec.day) || 'DAY ' + sec.day) : 'UNSET';
        c.short = c.key === 'all' ? 'All' : sec && sec.day ? 'Day ' + sec.day : String(sec ? sec.rows.length : 0).padStart(2, '0'); c.pink = !!sec && !sec.day; });
      detail = { name: t.name, isOwner: perm.own, canEdit: perm.edit, showList: view === 'list', showMap: view === 'map',
        sub: perm.list ? `${d.stops.length} ${d.stops.length === 1 ? 'Spot' : 'Spots'}` + (d.days ? ` · ${d.days} ${d.days === 1 ? 'Day' : 'Days'}` : '') + (perm.own ? '' : ' · From ' + (t.owner_name || 'A Friend')) : 'A View-Only Look At ' + (t.owner_name || 'Their') + '’s Map',
        hasToggle: perm.list && perm.map, listTabBg: view === 'list' ? '#FFFFFF' : 'transparent', listTabFg: view === 'list' ? C.blue : '#fff', mapTabBg: view === 'map' ? '#FFFFFF' : 'transparent', mapTabFg: view === 'map' ? C.blue : '#fff',
        mapTabLabel: (t.owner_name ? t.owner_name.split(' ')[0] + '’s' : 'Their') + ' Map',
        viewList: () => this.setState({ tripView: 'list', tripSel: null }), viewMap: () => { this.setState({ tripView: 'map', tripSel: null }); NYCLists.loadSharedMap(t.id); },
        mapNote: !sm ? 'Loading The Map…' : sm.off ? 'This Map Isn’t Shared Anymore.' : sm.places.length ? `${sm.places.length} Spots · Tap A Pin To Add It${perm.list ? ' To The List' : ''} Or Save It` : 'No Spots On This Map Yet.',
        wbg: w.bg, wfg: w.fg, range: dateRange(d.start, d.days), cd: countdown(d.start, d.days), bigN: shownRows.length,
        bigLbl: oneDay ? (shownRows.length === 1 ? 'stop' : 'stops') + (oneDay.day ? ' · Day ' + oneDay.day : ' · Not On A Day') : (shownRows.length === 1 ? 'spot' : 'spots'),
        travel: travel ? fmtShort(travel).toUpperCase() + ' TRAVEL' : '', spotsTop: perm.list ? nSp + (nSp === 1 ? ' SPOT' : ' SPOTS') : 'VIEW ONLY', spotsBot: d.days ? d.days + (d.days === 1 ? ' DAY' : ' DAYS') : '',
        here: here.length ? (here.length === 1 ? here[0].split(' ')[0].toUpperCase() + ' IS HERE' : here.length + ' OTHERS HERE') : '', others, img: d.photo || null,
        stopMap: !!s.tripStopMap && view === 'list', openStopMap: () => this.setTripStopMap(true), closeStopMap: () => this.setTripStopMap(false), routeLabel: routeSec ? (routeSec.day ? 'Route Day ' + routeSec.day : 'Route') : '',
        sections: shown, dayChips, metaMono, avatars, routeDirs: routeSec ? routeSec.onDirs : null, empty: perm.list && !d.stops.length, dateVal: d.start || '', onDate: e => NYCLists.edit(t.id, x => ({ ...x, start: e.target.value || '' })), hasDays: !!d.days,
        addDay: () => this.addDay(t.id), dayBtn: d.days ? '+ Add Day ' + (d.days + 1) : '+ Sort Into Days',
        openPick: () => this.setState({ tripPickOpen: true, tripPickQ: '' }), openAddNew: () => this.setState({ addOpen: true, addMode: 'link', addTarget: t.id, placing: false, form: blank(), selId: null, routeFor: null, tripSel: null, lookQ: '', lookResults: [], lookMsg: '', aiMsg: '', aiPlaces: [], aiFor: '', sugg: [], suggBusy: false, suggPicked: '', suggNone: '', webBusy: false, webMsg: '', webFor: '' }),
        openEdit: () => this.setState({ tripEditOpen: true, tripEditName: t.name, tripEditDays: d.days || 0, tripEditStart: d.start || '', tripSel: null }),
        people, openShare: () => this.setState({ tripShareOpen: true, tripSel: null }), back: () => this.setState({ tripId: null, tripSel: null, tripStopMap: false }),
        delLabel: perm.own ? (s.confirmTripDel ? 'Tap Again To Delete This List' : 'Delete List') : (s.confirmTripDel ? 'Tap Again To Leave' : 'Leave This List'),
        onDel: () => { if (!s.confirmTripDel) return this.setState({ confirmTripDel: true }); this.setState({ confirmTripDel: false }); perm.own ? NYCLists.remove(t.id) : NYCLists.leave(t.id); },
        syncNote: ({ saving: 'Saving…', offline: 'Offline — Saves When You’re Back Online' })[s.tripsSync] || '' };
    }

    // The card for a tapped stop or a tapped pin on a friend's map.
    let tsel = null;
    if (t && s.tripSel) {
      const cats = this.tripCatMap(t, (s.sharedMaps[t.id] || {}).cats);
      let p = null, st = null;
      if (s.tripSel.kind === 'stop') { st = t.data.stops.find(x => x.id === s.tripSel.id); p = st && this.stopPlace(st); }
      else { const sm = s.sharedMaps[t.id]; p = sm && sm.places.find(x => x.id === s.tripSel.id); }
      if (p) { const c = cats[p.cat] || { name: 'Spot', color: '#888' }, src = SRC[p.source] || SRC.manual, mine = !!st && st.by === me && !!st.pid && s.places.some(x => x.id === st.pid);
        const onList = s.tripSel.kind === 'shared' ? t.data.stops.find(x => x.p && x.p.name === p.name && km([x.p.lat, x.p.lng], [p.lat, p.lng]) < 0.05) : null;
        const saved = mine || this.onMyMap(p);
        tsel = { name: p.name, catName: c.name, catBg: c.color, catFg: fgFor(c.color), area: p.area, note: p.note, hasNote: !!p.note, hasPrice: !!p.price, price: PRICES[(p.price || 1) - 1],
          by: st ? (st.by === me ? 'You Added This' : 'Added By ' + (st.byName || 'A Friend')) : 'On ' + (t.owner_name || 'Their') + '’s Map',
          hasUrl: !!p.url, srcBg: src.bg, openLabel: 'Open ' + src.label, openSource: () => window.open(p.url, '_blank'), openDirs: () => window.open(gSearch(p), '_blank'),
          saveLabel: saved ? 'On Your Map ✓' : 'Save To My Map', saveBg: saved ? C.green : '#fff', saveFg: saved ? '#fff' : C.green, onSave: () => { if (!saved) this.saveToMyMap(p, cats); },
          isStop: !!st, canRemove: !!st && perm.edit, delLabel: s.confirmStopDel ? 'Tap Again To Remove' : 'Remove From List',
          onRemove: () => { if (!s.confirmStopDel) return this.setState({ confirmStopDel: true }); this.removeStop(t.id, st.id); this.setState({ tripSel: null, confirmStopDel: false }); this.toast('Removed From The List'); },
          canAdd: s.tripSel.kind === 'shared' && perm.list, addLabel: onList ? 'On The List ✓' : '+ Add To This List', addBg: onList ? C.navy : C.orange, addFg: onList ? C.yellow : '#fff',
          onAdd: () => { if (onList) { this.removeStop(t.id, onList.id); this.toast('Taken Off The List'); return; } this.addStopsTo(t.id, [p], false);
            NYCLists.edit(t.id, x => { const c2 = cats[p.cat]; return c2 && !x.cats.some(y => y.id === c2.id) ? { ...x, cats: [...x.cats, { ...c2, emoji: emo(c2) }] } : null; }); this.toast('Added To “' + t.name + '”'); },
          close: () => this.setState({ tripSel: null, confirmStopDel: false }) }; }
    }

    // Share sheet (owner).
    let share = null;
    if (t && perm.own && s.tripShareOpen) {
      const mode = t.share_list && t.share_map ? 'both' : t.share_map ? 'map' : 'list';
      const opt = (m, title, sub) => ({ title, sub, on: mode === m, bg: mode === m ? C.blue : '#fff', fg: mode === m ? '#fff' : C.navy, subFg: mode === m ? '#DDE3FF' : '#4A5275', border: mode === m ? C.blue : 'rgba(16,24,63,.12)', onClick: () => this.setShare(t, m) });
      share = { name: t.name,
        opts: [opt('list', 'Just This List', 'They Can Add, Sort And Remove Spots On It'), opt('map', 'Just My Map', 'They Can Look Around All Your Saved Spots — View Only'), opt('both', 'Both', 'The List To Plan Together, Plus A Look At Your Map')],
        link: this.inviteLink(t), share: () => this.shareInvite(t), copy: () => this.copyInvite(t), canNativeShare: !!navigator.share,
        newLink: () => { if (!s.confirmNewLink) return this.setState({ confirmNewLink: true }); this.setState({ confirmNewLink: false }); NYCLists.newCode(t.id).then(ok => ok && this.toast('New Link Made — The Old One No Longer Works')); },
        newLinkLabel: s.confirmNewLink ? 'Tap Again — The Old Link Will Stop Working' : 'Make A New Link',
        people: t.members.map(m => ({ key: m.user_id, name: m.name || 'Someone', onRemove: () => NYCLists.removeMember(t.id, m.user_id) })), hasPeople: !!t.members.length,
        close: () => this.setState({ tripShareOpen: false, confirmNewLink: false }) };
    }

    // Edit a list's name, number of days and first date.
    let editSheet = null;
    if (t && s.tripEditOpen) {
      const days = s.tripEditDays || 0, start = s.tripEditStart || '';
      const dropped = t.data.stops.filter(st => st.day > days).length;
      const last = days && start ? dayDate(start, days) : '';
      editSheet = { photo: t.data.photo || null, canPhoto: perm.edit, photoBusy: !!s.tripPhotoBusy, initial: t.name.replace(/^the\s+/i, '')[0] || '★',
        onPhoto: e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; this.pickTripPhoto(t.id, f); },
        removePhoto: () => NYCLists.edit(t.id, d => ({ ...d, photo: '' })),
        name: s.tripEditName || '', canRename: perm.own, ownerName: t.owner_name || 'The Owner', onName: e => this.setState({ tripEditName: e.target.value }),
        days, daysLabel: days ? days + (days === 1 ? ' Day' : ' Days') : 'No Days',
        less: () => this.setState({ tripEditDays: Math.max(0, days - 1) }), more: () => this.setState({ tripEditDays: Math.min(14, days + 1) }),
        dropNote: dropped ? dropped + (dropped === 1 ? ' Spot Moves' : ' Spots Move') + ' Back To “Not On A Day Yet”.' : '',
        start, onStart: e => this.setState({ tripEditStart: e.target.value }),
        range: start ? dayDate(start, 1) + (days > 1 ? ' – ' + last : '') : 'Optional — Adds Dates To Each Day.',
        saveBg: (!perm.own || (s.tripEditName || '').trim()) ? C.orange : '#A9ADC2',
        save: () => {
          const nm = toTitle((s.tripEditName || '').trim());
          if (perm.own && !nm) { this.toast('Give The List A Name'); return; }
          if (perm.own && nm !== t.name) NYCLists.meta(t.id, { name: nm });
          NYCLists.edit(t.id, x => ({ ...x, days, start: days ? start : x.start, stops: x.stops.map(st => st.day > days ? { ...st, day: 0 } : st) }));
          this.setState({ tripEditOpen: false }); this.toast('List Updated');
        },
        close: () => this.setState({ tripEditOpen: false }) };
    }

    // "+ From My Map" picker.
    let pick = null;
    if (t && s.tripPickOpen) {
      const q = (s.tripPickQ || '').trim().toLowerCase(), have = new Set(t.data.stops.filter(st => st.by === me && st.pid).map(st => st.pid)), catOf = id => s.cats.find(c => c.id === id) || { name: 'Spot', color: '#888' };
      const list = s.places.filter(p => !q || (p.name + ' ' + p.area + ' ' + catOf(p.cat).name).toLowerCase().includes(q));
      pick = { title: 'Add To “' + t.name + '”', q: s.tripPickQ || '', onQ: e => this.setState({ tripPickQ: e.target.value }), close: () => this.setState({ tripPickOpen: false }),
        count: t.data.stops.length, empty: !list.length, emptyMsg: s.places.length ? 'No Spots Match That' : 'Your Map Is Empty — Use “+ New Spot” To Add One Straight To The List.',
        rows: list.map(p => { const c = catOf(p.cat), on = have.has(p.id); return { key: p.id, name: p.name, catName: c.name, catBg: c.color, emoji: emo(c), area: p.area, chk: on ? '✓' : '', chkBg: on ? C.orange : '#fff', ring: on ? C.orange : 'transparent', onClick: () => this.toggleMapStop(t.id, p) }; }) };
    }

    // "Add To A List" from a place card on your map.
    let choose = null;
    if (s.listChoose) {
      const p = s.places.find(x => x.id === s.listChoose);
      if (p) choose = { name: p.name, close: () => this.setState({ listChoose: null }), empty: !s.trips.some(tr => this.tripPerm(tr).edit), ready: s.tripsState === 'ready', setupMsg: s.tripsState === 'missing' ? 'Lists Need The One-Time Database Setup First.' : '',
        rows: s.trips.filter(tr => this.tripPerm(tr).edit).map(tr => { const on = tr.data.stops.some(st => st.by === me && st.pid === p.id);
          return { key: tr.id, name: tr.name, sub: who(tr), chk: on ? '✓' : '', chkBg: on ? C.orange : '#fff', ring: on ? C.orange : 'transparent', onClick: () => { this.toggleMapStop(tr.id, p); this.toast(on ? 'Taken Off “' + tr.name + '”' : 'Added To “' + tr.name + '”'); } }; }),
        newList: () => this.setState({ newTripOpen: true, newTripName: '', newTripDays: 0, newTripStart: '', newTripAddPid: p.id }) };
    }

    const newTrip = s.newTripOpen ? { name: s.newTripName || '', onName: e => this.setState({ newTripName: e.target.value }), needMe: !NYCSync.displayName(), me: s.newTripMe || '', onMe: e => this.setState({ newTripMe: e.target.value }),
      dayChips: [0, 1, 2, 3, 4, 5].map(n => chip((s.newTripDays || 0) === n, n ? String(n) : 'No Days', () => this.setState({ newTripDays: n }))), start: s.newTripStart || '', onStart: e => this.setState({ newTripStart: e.target.value }),
      showStart: !!s.newTripDays, btn: s.newTripBusy ? 'Making It…' : s.newTripAddPid ? 'Make List & Add Spot' : 'Make The List', btnBg: (s.newTripName || '').trim() ? C.orange : '#A9ADC2', create: () => this.createTrip(),
      close: () => this.setState({ newTripOpen: false, newTripAddPid: null }) } : null;

    const ji = s.joinInfo;
    return {
      listsDisplay: s.tab === 'lists' ? 'block' : 'none', listsIndex: !t, listsSignedIn: signedIn, listsLocal: s.auth === 'local',
      listsState: s.tripsState, listsMissing: s.tripsState === 'missing', listsLoading: s.tripsState === 'loading' && !s.trips.length, listsError: s.tripsState === 'error' && !s.trips.length,
      listCards: cards, walletRef: el => this.walletRef(el), walletDragging: !!s.walletDrag, listsEmpty: s.tripsState === 'ready' && !s.trips.length, retryLists: () => NYCLists.refresh(),
      openNewTrip: () => this.setState({ newTripOpen: true, newTripName: '', newTripDays: 0, newTripStart: '', newTripAddPid: null }),
      trip: detail, tripMapRef: this.tripMapRef, tripMapH: '100%', tripMapOn: !!detail && (detail.showMap || detail.stopMap), tripEdit: editSheet,
      hasTripSel: !!tsel && s.tab === 'lists' && !s.addOpen, tsel, tripShare: share, tripPick: pick, listChoose: choose, newTrip,
      goLists: () => { this.setState({ tab: 'lists', selId: null, placing: false, routeFor: null, tripSel: null }); NYCLists.refresh(); },
      tabListFg: s.tab === 'lists' ? C.blue : '#3A4470', addToListSel: () => s.selId && this.setState({ listChoose: s.selId }),
      hasJoin: !!ji && s.auth === 'signedOut', joinTitle: ji ? (ji.owner_name || 'A Friend') + ' Invited You' : '', joinSub: ji ? (ji.share_list ? 'To Plan “' + ji.name + '” Together' : 'To See Their NYC Map') + ' — Make An Account To Join.' : '',
      authName: s.authName || '', onAuthName: e => this.setState({ authName: e.target.value })
    };
  }
});
