// Cloud sync with Supabase: email + password sign-in, one row of data per user.
//
// Local storage stays the fast, offline-friendly copy. Each sync round reads the cloud copy,
// merges in whatever changed on this device since the last successful sync (the "base"),
// writes the result back, and remembers it as the new base. That way a spot added with no
// signal on the subway is kept, and edits made on another device in the meantime are kept too.
"use strict";
const NYCSync = (() => {
  const cfg = window.NYC_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const TABLE = 'nyc_list';
  let sb = null, app = null, user = null, base = null, busy = false, again = false, timer = null;

  // Key-order-independent JSON, so Postgres jsonb key reordering doesn't look like a change.
  const stable = v => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']'
    : v && typeof v === 'object' ? '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}'
    : JSON.stringify(v === undefined ? null : v);
  const same = (a, b) => stable(a) === stable(b);

  const baseKey = () => 'nycList.base.' + (user ? user.id : '');
  const loadBase = () => { try { return JSON.parse(localStorage.getItem(baseKey())); } catch (e) { return null; } };
  const saveBase = d => { base = d; try { localStorage.setItem(baseKey(), JSON.stringify(d)); } catch (e) {} };

  const set = patch => app && app.setState(patch);
  const norm = d => ({ places: (d && d.places) || [], cats: (d && d.cats) || [], home: (d && d.home) || null, plan: (d && d.plan) || { ids: [], start: 'first' } });

  // Three-way merge of lists keyed by id: start from the cloud copy, then replay this device's
  // additions, edits and deletions relative to the base.
  function mergeList(b, l, r) {
    const byId = a => new Map((a || []).map(x => [x.id, x]));
    const B = byId(b), L = byId(l), out = byId(r);
    for (const [id, x] of L) { const bx = B.get(id); if (!bx || !same(bx, x)) out.set(id, x); }
    for (const id of B.keys()) if (!L.has(id)) out.delete(id);
    const order = [...(l || []).map(x => x.id).filter(id => out.has(id)), ...[...out.keys()].filter(id => !L.has(id))];
    return order.map(id => out.get(id));
  }
  function merge(b, l, r) {
    b = norm(b); l = norm(l); r = norm(r);
    const pick = k => same(l[k], b[k]) ? r[k] : l[k];
    const places = mergeList(b.places, l.places, r.places);
    const cats = mergeList(b.cats, l.cats, r.cats);
    const plan = pick('plan'), ids = new Set(places.map(p => p.id));
    return { places, cats: cats.length ? cats : l.cats, home: pick('home'), plan: { ...plan, ids: (plan.ids || []).filter(id => ids.has(id)) } };
  }

  function attach(a) {
    app = a;
    if (!enabled) { set({ auth: 'local' }); return; }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    sb.auth.getSession().then(({ data }) => handle(data.session)).catch(() => set({ auth: user ? 'signedIn' : 'signedOut' }));
    sb.auth.onAuthStateChange((ev, session) => {
      if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || ev === 'INITIAL_SESSION') handle(session);
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(); });
    window.addEventListener('online', () => sync());
  }

  async function handle(session) {
    const u = (session && session.user) || null;
    if (u && user && u.id === user.id) return;
    user = u;
    if (!user) { base = null; set({ auth: 'signedOut', syncEmail: '', syncState: '', avatarV: 0, obNeed: false, obStep: 0 }); window.NYCLists && NYCLists.onUser(null); return; }
    base = loadBase();
    set({ auth: 'signedIn', syncEmail: user.email || '', syncState: 'syncing', authPass: '', authMsg: '', avatarV: (user.user_metadata && user.user_metadata.avatar_v) || 0, obNeed: !(user.user_metadata && user.user_metadata.onboarded) });
    await sync();
    window.NYCLists && NYCLists.onUser(user);
  }

  async function sync() {
    if (!user || !sb) return;
    if (busy) { again = true; return; }
    busy = true; clearTimeout(timer);
    try {
      const local = app.snapshot();
      const { data, error } = await sb.from(TABLE).select('data').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      if (!same(app.snapshot(), local)) { again = true; return; } // edited mid-round; go again

      let target;
      if (!data) target = app.isExampleOnly() ? app.emptyData() : local;           // brand-new account
      else {
        const remote = norm(data.data);
        if (!base && app.isExampleOnly()) target = remote;                         // fresh device
        else if (base && same(local, base)) target = remote;                       // nothing changed here
        else target = merge(base || { places: [], cats: [] }, local, remote);      // combine both sides
      }
      if (!same(target, local)) app.applyRemote(target);
      if (!data || !same(target, data.data)) {
        const { error: e2 } = await sb.from(TABLE).upsert({ user_id: user.id, data: target, updated_at: new Date().toISOString() });
        if (e2) throw e2;
      }
      saveBase(target);
      set({ syncState: 'saved' });
    } catch (e) {
      set({ syncState: 'offline' });
    } finally {
      busy = false;
      if (again) { again = false; timer = setTimeout(sync, 300); }
    }
  }

  // Called by the app after every change to places, categories, home or plan.
  function queue(snap) {
    if (!enabled || !user) return;
    if (base && same(snap, base)) { if (!busy) set({ syncState: 'saved' }); return; }
    set({ syncState: 'saving' });
    clearTimeout(timer);
    timer = setTimeout(sync, 900);
  }

  const friendly = m => {
    m = String(m || '');
    if (/invalid login/i.test(m)) return 'That Email And Password Don’t Match. Try Again.';
    if (/not confirmed/i.test(m)) return 'Confirm Your Email First — Check Your Inbox For The Link.';
    if (/already registered|already exists/i.test(m)) return 'You Already Have An Account. Sign In Instead.';
    if (/signups not allowed|signup is disabled/i.test(m)) return 'New Accounts Are Turned Off For This App Right Now. Ask The Person Who Invited You To Turn Them On.';
    if (/fetch|network/i.test(m)) return 'Can’t Reach The Server. Check Your Connection.';
    return m;
  };

  async function submit() {
    if (!sb) return;
    const s = app.state, email = (s.authEmail || '').trim(), password = s.authPass || '';
    if (!email || !password) { set({ authMsg: 'Enter Your Email And Password.' }); return; }
    if (s.authMode === 'up' && password.length < 6) { set({ authMsg: 'Use At Least 6 Characters For Your Password.' }); return; }
    set({ authBusy: true, authMsg: '' });
    try {
      const join = window.NYCLists ? NYCLists.pendingCode() : '', name = (s.authName || '').trim();
      const r = s.authMode === 'up'
        ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: SITE() + (join ? '/?join=' + encodeURIComponent(join) : ''), data: name ? { name } : undefined } })
        : await sb.auth.signInWithPassword({ email, password });
      if (r.error) { set({ authBusy: false, authMsg: friendly(r.error.message) }); return; }
      if (s.authMode === 'up' && !r.data.session) {
        set({ authBusy: false, authMode: 'in', authPass: '', authMsg: 'Almost There — Tap The Link We Emailed You, Then Sign In Here.' });
        return;
      }
      set({ authBusy: false });
    } catch (e) { set({ authBusy: false, authMsg: friendly(e && e.message) }); }
  }

  async function signOut(skipSync) {
    if (!sb) return;
    if (!skipSync) await sync();
    try { localStorage.removeItem(baseKey()); } catch (e) {}
    try { await sb.auth.signOut(); } catch (e) {}
    app.resetLocal();
  }

  async function getToken() {
    if (!sb || !user) return null;
    try { const { data } = await sb.auth.getSession(); return (data.session && data.session.access_token) || null; } catch (e) { return null; }
  }

  // Used by lists.js (shared lists live in their own tables).
  const displayName = () => (user && user.user_metadata && user.user_metadata.name) || '';
  async function setName(name) {
    if (!sb || !user) return false;
    try { const r = await sb.auth.updateUser({ data: { name } }); if (r.error) return false; if (r.data && r.data.user) user = r.data.user; return true; } catch (e) { return false; }
  }

  // Profile photos live in the public Supabase Storage bucket "avatars" at <user id>/avatar.jpg (supabase/avatars.sql),
  // so anyone on a shared list can show a friend's photo from their user id alone. user_metadata.avatar_v
  // (a timestamp) marks that you have one and busts the cache after a change.
  const AVATAR = 'avatars';
  const avatarUrl = (uid, v) => uid && cfg.supabaseUrl ? cfg.supabaseUrl.replace(/\/$/, '') + '/storage/v1/object/public/' + AVATAR + '/' + encodeURIComponent(uid) + '/avatar.jpg' + (v ? '?v=' + v : '') : null;
  // Any photo you add (a spot's or a list's) goes in your own folder of the same bucket: <user id>/<name>.jpg.
  // Answers { url } with a cache-busting version, or { error } ('setup' when avatars.sql hasn't been run).
  async function uploadImage(name, blob) {
    if (!sb || !user) return { error: 'Sign In To Add Photos.' };
    const path = user.id + '/' + name + '.jpg';
    const up = await sb.storage.from(AVATAR).upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '300' });
    if (up.error) return { error: /bucket|not found/i.test(up.error.message || '') ? 'setup' : (up.error.message || 'Upload Failed.') };
    return { url: cfg.supabaseUrl.replace(/\/$/, '') + '/storage/v1/object/public/' + AVATAR + '/' + path.split('/').map(encodeURIComponent).join('/') + '?v=' + Date.now() };
  }
  async function removeImage(name) { if (!sb || !user) return; try { await sb.storage.from(AVATAR).remove([user.id + '/' + name + '.jpg']); } catch (e) {} }
  async function setAvatar(blob) {
    if (!sb || !user) return { error: 'Sign In First.' };
    const up = await sb.storage.from(AVATAR).upload(user.id + '/avatar.jpg', blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '300' });
    if (up.error) return { error: /bucket|not found/i.test(up.error.message || '') ? 'setup' : (up.error.message || 'Upload Failed.') };
    const v = Date.now();
    try { const r = await sb.auth.updateUser({ data: { avatar_v: v } }); if (r.data && r.data.user) user = r.data.user; } catch (e) {}
    set({ avatarV: v }); return { ok: true };
  }
  async function removeAvatar() {
    if (!sb || !user) return { error: 'Sign In First.' };
    const r = await sb.storage.from(AVATAR).remove([user.id + '/avatar.jpg']);
    if (r.error) return { error: r.error.message || 'Couldn’t Remove It.' };
    try { const u = await sb.auth.updateUser({ data: { avatar_v: null } }); if (u.data && u.data.user) user = u.data.user; } catch (e) {}
    set({ avatarV: 0 }); return { ok: true };
  }

  // The welcome pages: save the name you want to be called and remember you've seen them (user_metadata.onboarded).
  async function finishOnboarding(name) {
    if (!sb || !user) return false;
    try { const r = await sb.auth.updateUser({ data: { ...(name ? { name } : {}), onboarded: true } }); if (r.data && r.data.user) user = r.data.user; return !r.error; } catch (e) { return false; }
  }

  return { finishOnboarding, enabled, attach, queue, submit, signOut, getToken, syncNow: () => sync(),
    client: () => sb, currentUser: () => user, displayName, setName, mergeList, same, avatarUrl, setAvatar, removeAvatar, uploadImage, removeImage };
})();
window.NYCSync = NYCSync;
