// Friends (supabase/friends.sql): add people by link, see what they add and where they go, open their profile.
//
// Each person keeps one row in nyc_friend_profiles: their link code, first name, what friends see
// (mode 'all' | 'been' | 'none', plus which lists) and a snapshot of the spots and lists they share.
// The snapshot is rebuilt here a few seconds after your spots or lists change. Spots marked
// "Keep This One From Friends" (place.fpriv) never go in it, and neither do home, notes or plans.
// The activity feed is worked out from friends' snapshots: a spot's added time comes from its id
// (p<timestamp>) and its visit time from place.vat, set when you mark it Been There.
"use strict";
const FR_LINK = 'nycList.friend';
// A friend link: /?friend=<code>. Kept in storage so it survives making an account.
(() => { try {
  const q = new URLSearchParams(location.search), c = (q.get('friend') || '').trim().toLowerCase(); if (!c) return;
  localStorage.setItem(FR_LINK, c); q.delete('friend'); const rest = q.toString();
  history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
} catch (e) {} })();
const frPending = () => { try { return localStorage.getItem(FR_LINK) || ''; } catch (e) { return ''; } };
const frClear = () => { try { localStorage.removeItem(FR_LINK); } catch (e) {} };
const FR_COLS = ['#F45FA0', '#1B3DB8', '#1F9D6B', '#7A4FD6', '#FF6B1A', '#0E9AA7', '#E5402B'];
const frCol = id => { let h = 0; String(id || '').split('').forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) | 0; }); return FR_COLS[Math.abs(h) % FR_COLS.length]; };
const frFirst = n => (String(n || '').trim().split(/\s+/)[0]) || 'A Friend';
const addedAt = p => p.at || ((/^p(\d{13})/.exec(p.id || '') || [])[1] ? +(/^p(\d{13})/.exec(p.id)[1]) : 0);
const ago = t => { const m = Math.max(1, Math.round((Date.now() - t) / 6e4)); if (m < 60) return m + 'm'; const h = Math.round(m / 60); if (h < 24) return h + 'h';
  const d = Math.round(h / 24); return d < 7 ? new Date(t).toLocaleDateString('en-US', { weekday: 'short' }) : new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
const sinceTxt = t => { const d = new Date(t); return isNaN(d) ? '' : 'FRIENDS SINCE ' + d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(); };

Object.assign(Component.prototype, {
  frClient() { const c = window.NYCSync && NYCSync.client && NYCSync.client(), u = window.NYCSync && NYCSync.currentUser && NYCSync.currentUser(); return c && u ? { c, u } : null; },
  frLink() { const m = this.state.frMe; return m && m.code ? SITE() + '/?friend=' + m.code : ''; },
  // Signed in: get your link code, load friends, then use a friend link you opened before signing in.
  async frInit() { const k = this.frClient(); if (!k) return;
    try { const { data, error } = await k.c.rpc('nyc_friend_me', { p_name: frFirst(window.NYCLists ? NYCLists.myName() : '') });
      if (error) { if (this.pubMissing(error)) this.setState({ frSetup: 'missing' }); return; }
      this.setState({ frMe: data, frSetup: '' }); } catch (e) { return; }
    await this.frRefresh();
    const code = frPending(); if (code) this.frAddCode(code);
    this._frPubSig = null; this.frPublish(); },
  async frRefresh() { const k = this.frClient(); if (!k) return;
    try { const { data, error } = await k.c.rpc('nyc_friends_state'); if (error || !data) return;
      this.setState({ frState: data });
      const ids = (data.friends || []).map(f => f.id); if (!ids.length) { this.setState({ frData: {} }); return; }
      const r = await k.c.from('nyc_friend_profiles').select('owner,name,mode,data,updated_at').in('owner', ids.slice(0, 300));
      if (r.error || !r.data) return; const m = {}; r.data.forEach(x => { m[x.owner] = x; }); this.setState({ frData: m, frAt: Date.now() }); } catch (e) {} },
  async frAddCode(code) { const k = this.frClient(); if (!k) return; frClear();
    try { const { data, error } = await k.c.rpc('nyc_friend_add', { code }); await this.frAddResult(data, error); } catch (e) {} },
  async frAddUser(u) { const k = this.frClient(); if (!k) return;
    try { const { data, error } = await k.c.rpc('nyc_friend_add_user', { p_username: u }); await this.frAddResult(data, error); } catch (e) {}
    if (this.state.frQ) this.frSearch(this.state.frQ, true); },
  async frAddResult(data, error) { try {
      if (error) { this.toast(/too many/i.test(error.message || '') ? 'That’s a lot of friend requests. Try again later.' : 'Couldn’t send that friend request. Check your connection?'); return; }
      const st = data && data.status, n = frFirst(data && data.name);
      if (st === 'self') this.toast('That’s your own friend link. Send it to a friend!');
      else if (st === 'bad') this.toast('Couldn’t find them. Ask for their link or username.');
      else if (st === 'friends') { this.toast('You and ' + n + ' are friends!!'); await this.frRefresh(); this.setState({ frOpen: true, frAddOpen: false, frProfile: data.id, frProfTab: 'lists', acctOpen: false }); return; }
      else this.toast('Friend request sent to ' + n + '.\nYou’ll see their spots once they say yes.');
      this.frRefresh(); } catch (e) {} },
  // Find people by username (as you type, after 2 characters).
  frSearch(q, now) { this.setState({ frQ: q }); clearTimeout(this._frQT); const u = String(q || '').trim().replace(/^@/, '').toLowerCase();
    if (u.length < 2) { this.setState({ frRes: null, frSearching: false }); return; }
    this.setState({ frSearching: true });
    this._frQT = setTimeout(async () => { const k = this.frClient(); if (!k) return;
      try { const { data, error } = await k.c.rpc('nyc_friend_find', { q: u }); if (this.state.frQ !== q) return;
        this.setState({ frRes: error ? [] : (data || []), frSearching: false }); } catch (e) { this.setState({ frSearching: false }); } }, now ? 0 : 300); },
  async frSetUsername() { const k = this.frClient(), raw = String(this.state.frUDraft || '').trim().replace(/^@/, '').toLowerCase(); if (!k || this.state.frUBusy) return;
    if (raw && !/^[a-z0-9_.]{3,20}$/.test(raw)) { this.setState({ frUMsg: 'Use 3–20 letters, numbers, _ or .' }); return; }
    this.setState({ frUBusy: true, frUMsg: '' });
    try { const { data, error } = await k.c.rpc('nyc_friend_set_username', { p_username: raw });
      if (error) { this.setState({ frUBusy: false, frUMsg: this.pubMissing(error) ? 'Usernames need one setup step first.' : 'Couldn’t save that. Check your connection?' }); return; }
      if (data === 'taken') { this.setState({ frUBusy: false, frUMsg: '@' + raw + ' is taken. Try another?' }); return; }
      if (data === 'bad') { this.setState({ frUBusy: false, frUMsg: 'Use 3–20 letters, numbers, _ or .' }); return; }
      this.setState({ frUBusy: false, frUEdit: false, frMe: { ...(this.state.frMe || {}), username: raw || null } });
      this.toast(raw ? 'You’re @' + raw + ' now.\nFriends can find you by it.' : 'Username removed.'); }
    catch (e) { this.setState({ frUBusy: false, frUMsg: 'Couldn’t save that. Check your connection?' }); } },
  frUserVals() { const s = this.state, m = s.frMe || {};
    return { name: m.username || '', has: !!m.username, editing: !!s.frUEdit || !m.username, draft: s.frUDraft == null ? (m.username || '') : s.frUDraft, msg: s.frUMsg || '', busy: !!s.frUBusy, ready: !!s.frMe,
      onInput: e => this.setState({ frUDraft: e.target.value.replace(/\s/g, '').toLowerCase().slice(0, 21), frUMsg: '' }),
      save: e => { e && e.preventDefault && e.preventDefault(); this.frSetUsername(); },
      edit: () => this.setState({ frUEdit: true, frUDraft: m.username || '', frUMsg: '' }), cancel: () => this.setState({ frUEdit: false, frUDraft: null, frUMsg: '' }) }; },
  async frAccept(id) { const k = this.frClient(); if (!k) return; const r = (this.state.frState.incoming || []).find(x => x.id === id);
    const { data, error } = await k.c.rpc('nyc_friend_accept', { other: id });
    if (error || !data) { this.toast('Couldn’t accept that. Try again?'); return; }
    this.toast('You and ' + frFirst(r && r.name) + ' are friends!!'); this.frRefresh(); },
  async frDecline(id, mine) { const k = this.frClient(); if (!k) return;
    const q = k.c.from('nyc_friend_requests').delete(); await (mine ? q.eq('from_id', k.u.id).eq('to_id', id) : q.eq('from_id', id).eq('to_id', k.u.id)); this.frRefresh(); },
  async frRemove(id) { const k = this.frClient(); if (!k) return; const f = (this.state.frState.friends || []).find(x => x.id === id);
    const { error } = await k.c.rpc('nyc_friend_remove', { other: id }); if (error) { this.toast('Couldn’t remove them. Try again?'); return; }
    this.setState({ frProfile: null, frConfirm: null }); this.toast(frFirst(f && f.name) + ' is off your friends list.'); this.frRefresh(); },
  async frShare() { const url = this.frLink(); if (!url) { this.toast('Friends need one setup step first.'); return; }
    const un = this.state.frMe && this.state.frMe.username, text = 'Be my friend on Spotted In 🗽 ' + (un ? 'I’m @' + un + '. ' : '') + 'You’ll see my spots and I’ll see yours.';
    if (navigator.share) { try { await navigator.share({ title: 'Spotted In', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => this.toast('Link copied. Go send it!')).catch(() => this.toast('Press and hold the link to copy it.')); },
  frCopy() { const url = this.frLink(); if (!url) return; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => this.toast('Link copied.')).catch(() => this.toast('Press and hold the link to copy it.')); },
  // Who sees what. mode: 'all' | 'been' | 'none'; lists: ids of lists friends can open.
  async frSetSee(ch) { const k = this.frClient(), m = this.state.frMe; if (!k || !m) return;
    const next = { ...m, ...ch }; this.setState({ frMe: next });
    const { error } = await k.c.from('nyc_friend_profiles').update({ mode: next.mode, lists: next.lists || [], data: this.frSnapshot(next), updated_at: new Date().toISOString() }).eq('owner', k.u.id);
    if (error) { this.setState({ frMe: m }); this.toast('Couldn’t save that. Check your connection?'); return; }
    this._frPubSig = null; },
  frSnapshot(m) { const s = this.state; m = m || s.frMe || {}; const spotsOn = m.mode === 'all' || m.mode === 'been'; if (!spotsOn && !(m.lists || []).length) return {};
    const all = [...s.places.map(p => p.city ? p : { ...p, city: CUR.id }), ...(s.otherPlaces || [])].filter(p => !GONE_MAPS.has(p.city) && !p.draft && !p.fpriv && isFinite(p.lat) && !evOver(p));
    const pick = !spotsOn ? [] : all.filter(p => m.mode === 'been' ? p.visited : true).slice(0, 1500), used = new Set(pick.map(p => p.cat));
    const spots = pick.map(p => ({ id: p.id, name: p.name, cat: p.cat, area: p.area || '', lat: +p.lat, lng: +p.lng, city: p.city || 'nyc', been: !!p.visited,
      ...(addedAt(p) ? { at: addedAt(p) } : {}), ...(p.vat ? { vat: p.vat } : {}), ...(/^https:\/\//.test(p.photo || '') ? { photo: p.photo } : {}),
      ...(p.gid ? { gid: p.gid } : {}), ...((p.order || []).length ? { order: p.order.slice(0, 3) } : {}), ...(p.price ? { price: p.price } : {}) }));
    const want = new Set(m.lists || []), me = window.NYCLists && NYCLists.uid();
    const lists = (s.trips || []).filter(t => want.has(t.id) && t.owner === me).slice(0, 20).map(t => {
      const st = (t.data.stops || []).map(x => this.stopPlace(x)).filter(p => p && isFinite(p.lat)).slice(0, 80);
      st.forEach(p => used.add(p.cat)); return { id: t.id, name: t.name, stops: st.map(p => ({ name: p.name, cat: p.cat, area: p.area || '', lat: +p.lat, lng: +p.lng, city: p.city || CUR.id, ...(/^https:\/\//.test(p.photo || '') ? { photo: p.photo } : {}) })) }; });
    const cats = s.cats.filter(c => used.has(c.id)).map(c => ({ id: c.id, name: c.name, color: c.color, emoji: emo(c) }));
    return { spots, cats, lists }; },
  // Keep what friends see current, a few seconds after your spots or lists change.
  async frPublish() { const k = this.frClient(), m = this.state.frMe; if (!k || !m) return;
    const data = this.frSnapshot(m), sig = JSON.stringify(data); if (sig === this._frPubSig) return; this._frPubSig = sig;
    await k.c.from('nyc_friend_profiles').update({ data, updated_at: new Date().toISOString() }).eq('owner', k.u.id); },
  frSpots(id) { const d = (this.state.frData || {})[id]; return (d && d.data && d.data.spots) || []; },
  frCats(id) { const d = (this.state.frData || {})[id], m = {}; ((d && d.data && d.data.cats) || []).forEach(c => { m[c.id] = c; }); return m; },
  // What friends did lately: spots they added (when they share everything) and places they went.
  frFeed() { const s = this.state, out = [], since = Date.now() - 45 * 864e5;
    (s.frState.friends || []).forEach(f => { const d = (s.frData || {})[f.id]; if (!d || !d.data) return;
      (d.data.spots || []).forEach(p => {
        if (d.mode === 'all' && p.at > since) out.push({ f, p, t: p.at, verb: 'added' });
        if (p.vat > since) out.push({ f, p, t: p.vat, verb: 'went to' }); }); });
    return out.sort((a, b) => b.t - a.t).slice(0, 60); },
  frSave(fid, p) { if (this.onMyMap(p)) { this.toast('Already on your map.'); return; }
    this.saveToMyMap({ ...p, source: 'friend' }, this.frCats(fid)); },
  friendVals() { const s = this.state, k = s.auth === 'signedIn', st = s.frState || {}, me = window.NYCLists && NYCLists.uid();
    const photo = id => window.NYCSync && NYCSync.avatarUrl ? NYCSync.avatarUrl(id, 0) : null;
    const person = f => ({ id: f.id, name: f.name ? frFirst(f.name) : f.username ? '@' + f.username : 'Someone', handle: f.username ? '@' + f.username : '', initial: ((f.name || f.username || '?').trim()[0] || '?').toUpperCase(), bg: frCol(f.id), src: photo(f.id) });
    const incoming = (st.incoming || []).length;
    const base = { frUser: k ? this.frUserVals() : null, frAvail: k,
      // Everyone picks a username once: after the welcome steps, or the next time an older account opens the app.
      frNeedUser: k && !!s.frMe && !s.frMe.username && s.frSetup !== 'missing' && !s.obNeed && !s.tourOpen, frBadge: k && incoming ? incoming : 0, frOpen: k && s.frOpen,
      openFriends: () => { if (!k) return; this.setState({ frOpen: true, acctOpen: false, frProfile: null }); if (Date.now() - (s.frAt || 0) > 30000) this.frRefresh(); } };
    if (!base.frOpen) return base;
    const fmtSpot = (fid, p) => { const c = this.frCats(fid)[p.cat] || { name: 'Spot', color: '#888' };
      return { key: fid + (p.id || p.name), name: p.name, sub: [p.area, c.name].filter(Boolean).join(' · '), img: placeImg(p), col: c.color, emoji: emo(c), dish: (p.order || [])[0] || '',
        mine: this.onMyMap(p), save: e => { e && e.stopPropagation(); this.frSave(fid, p); } }; };
    const feed = this.frFeed(), dayMs = 864e5, today = new Date(); today.setHours(0, 0, 0, 0);
    const groups = []; feed.forEach(x => { const g = x.t >= +today ? 'TODAY' : x.t >= +today - 6 * dayMs ? 'THIS WEEK' : 'EARLIER';
      let G = groups.find(y => y.label === g); if (!G) groups.push(G = { label: g, items: [] });
      G.items.push({ ...fmtSpot(x.f.id, x.p), key: x.f.id + x.verb + (x.p.id || x.p.name), who: person(x.f), verb: x.verb, when: ago(x.t), open: () => this.setState({ frProfile: x.f.id, frProfTab: 'saved' }) }); });
    const friends = (st.friends || []).map(f => { const d = (s.frData || {})[f.id], sp = this.frSpots(f.id);
      return { ...person(f), sub: !d || d.mode === 'none' || !d.data || !d.data.spots ? 'Not sharing spots yet' : sp.length + (sp.length === 1 ? ' spot' : ' spots') + ' · ' + sp.filter(p => p.been).length + ' been',
        open: () => this.setState({ frProfile: f.id, frProfTab: 'lists', frListOpen: null }) }; });
    let prof = null; const pf = s.frProfile && (st.friends || []).find(f => f.id === s.frProfile);
    if (pf) { const d = (s.frData || {})[pf.id] || {}, sp = this.frSpots(pf.id), lists = (d.data && d.data.lists) || [], cats = this.frCats(pf.id);
      const tab = s.frProfTab || 'lists', been = sp.filter(p => p.been);
      prof = { ...person(pf), since: sinceTxt(pf.since), counts: [[sp.length, 'SPOTS'], [been.length, 'BEEN THERE'], [lists.length, 'LISTS']],
        sharing: d.mode && d.mode !== 'none', onlyBeen: d.mode === 'been',
        tabs: [['lists', 'Lists'], ['saved', 'Saved'], ['been', 'Been There']].map(([key, label]) => ({ key, label, on: tab === key, pick: () => this.setState({ frProfTab: key }) })),
        tab, lists: lists.map((l, i) => { const w = WALLET[i % WALLET.length], open = s.frListOpen === l.id;
          return { key: l.id, name: l.name, code: listCode(l.name), n: l.stops.length, bg: w[1], fg: w[3], open, toggle: () => this.setState({ frListOpen: open ? null : l.id }),
            stops: open ? l.stops.map((p, j) => ({ ...fmtSpot(pf.id, p), key: l.id + j })) : [] }; }),
        spots: (tab === 'been' ? been : sp.filter(p => !p.been || d.mode === 'all')).slice().sort((a, b) => (b.vat || b.at || 0) - (a.vat || a.at || 0)).slice(0, 300).map(p => fmtSpot(pf.id, p)),
        back: () => this.setState({ frProfile: null, frConfirm: null }), confirm: s.frConfirm === pf.id,
        askRemove: () => this.setState({ frConfirm: pf.id }), cancelRemove: () => this.setState({ frConfirm: null }), remove: () => this.frRemove(pf.id) };
      prof.empty = tab === 'lists' ? (!lists.length ? frFirst(pf.name) + ' hasn’t shared any lists yet.' : '') : !prof.spots.length ? (!prof.sharing ? frFirst(pf.name) + ' isn’t sharing spots yet.' : tab === 'been' ? 'No Been There spots yet.' : 'Nothing saved to show yet.') : ''; }
    const m = s.frMe || {}, mine = (s.trips || []).filter(t => t.owner === me);
    return { ...base,
      frClose: () => this.setState({ frOpen: false, frProfile: null, frAddOpen: false, frSeeOpen: false, frConfirm: null }),
      frSetup: s.frSetup === 'missing', frTab: s.frTab || 'feed', frSetTab: t => this.setState({ frTab: t }),
      frMeName: (window.NYCSync && NYCSync.displayName && NYCSync.displayName()) || 'You', frOpenAcct: () => this.setState({ frOpen: false, acctOpen: true }),
      frPeople: friends, frCount: friends.length, frGroups: groups, frIncoming: incoming,
      frFeedEmpty: !groups.length ? (friends.length ? 'Nothing new from your friends yet.\nWhen they add spots or go somewhere, it shows up here.' : 'Add your friends to see where they’re going and what they’re saving.') : '',
      frProf: prof,
      frAdd: s.frAddOpen ? { q: s.frQ || '', onQ: e => this.frSearch(e.target.value), clearQ: () => this.frSearch(''), searching: !!s.frSearching,
        results: (s.frRes || []).map(r => ({ ...person(r), status: r.status, add: () => this.frAddUser(r.username), accept: () => this.frAccept(r.id).then(() => this.frSearch(s.frQ, true)),
          open: r.status === 'friends' ? () => this.setState({ frAddOpen: false, frProfile: r.id, frProfTab: 'lists' }) : null })),
        none: s.frRes && !s.frRes.length && !s.frSearching ? 'No one with that username yet.' : '',
        link: this.frLink().replace(/^https?:\/\//, ''), share: () => this.frShare(), copy: () => this.frCopy(), close: () => this.setState({ frAddOpen: false }),
        incoming: (st.incoming || []).map(r => ({ ...person(r), when: ago(new Date(r.at).getTime()), accept: () => this.frAccept(r.id), decline: () => this.frDecline(r.id) })),
        outgoing: (st.outgoing || []).map(r => ({ ...person(r), name: r.name ? frFirst(r.name) : 'Someone', when: ago(new Date(r.at).getTime()), cancel: () => this.frDecline(r.id, true) })),
        friends: friends.map(f => ({ ...f, remove: () => this.setState({ frConfirm: f.id }), confirm: s.frConfirm === f.id, sure: () => this.frRemove(f.id), notSure: () => this.setState({ frConfirm: null }) })) } : null,
      frOpenAdd: () => this.setState({ frAddOpen: true, frConfirm: null, frQ: '', frRes: null }),
      frSee: s.frSeeOpen ? { modes: [['all', 'Everything', 'Spots you add and places you’ve been'], ['been', 'Only Places I’ve Been', 'Not your to-try list'], ['none', 'Nobody', 'Friends see nothing new from you']]
          .map(([key, label, sub]) => ({ key, label, sub, on: (m.mode || 'none') === key, pick: () => this.frSetSee({ mode: key }) })),
        lists: mine.map((t, i) => { const on = (m.lists || []).includes(t.id); return { key: t.id, name: t.name, col: WALLET[i % WALLET.length][1], on,
          toggle: () => this.frSetSee({ lists: on ? (m.lists || []).filter(x => x !== t.id) : [...(m.lists || []), t.id] }) }; }),
        noLists: !mine.length, kept: [...s.places, ...(s.otherPlaces || [])].filter(p => p.fpriv).length, close: () => this.setState({ frSeeOpen: false }) } : null,
      frOpenSee: () => this.setState({ frSeeOpen: true }),
      frSeeLabel: { all: 'Friends see everything', been: 'Friends see places you’ve been', none: 'Friends see nothing yet' }[m.mode || 'none'] };
  }
});
