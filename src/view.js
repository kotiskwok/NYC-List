// View: a faithful translation of the prototype's template into React (via htm).
const html = htm.bind(React.createElement);

// Inline CSS strings -> React style objects (cached).
const _css = new Map();
const S = str => {
  let o = _css.get(str); if (o) return o; o = {};
  str.split(';').forEach(d => {
    const i = d.indexOf(':'); if (i < 0) return;
    const k = d.slice(0, i).trim(), v = d.slice(i + 1).trim(); if (!k) return;
    o[k.startsWith('--') ? k : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  });
  // Glass look: plain white surfaces turn frosted. Use #FFFFFF where solid white is needed (e.g. on a colored button).
  if (o.background === '#fff') o.background = 'rgba(255,255,255,.66)';
  if (_css.size > 4000) _css.clear(); _css.set(str, o); return o;
};
// Offsets: the design was drawn under a 46px status bar with no home indicator.
// --st is the top inset (46px in the desktop frame), --sb the bottom inset.
const T = n => `calc(var(--st) + ${n - 46}px)`;
const B = n => `calc(var(--sb) + ${n}px)`;

// Glass: frosted panels over the map. GL for floating controls, GL2 for cards and sheets.
const GL = 'background:linear-gradient(150deg,rgba(255,255,255,.78),rgba(255,255,255,.36) 50%,rgba(255,255,255,.58));-webkit-backdrop-filter:blur(32px) saturate(210%) brightness(1.04);backdrop-filter:blur(32px) saturate(210%) brightness(1.04);border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 2px 1px rgba(255,255,255,1),inset 0 -1px 1px rgba(255,255,255,.5),0 16px 36px rgba(16,24,63,.14),0 2px 6px rgba(16,24,63,.06)';
const GL2 = 'background:linear-gradient(170deg,rgba(255,255,255,.86),rgba(255,243,223,.66));-webkit-backdrop-filter:blur(36px) saturate(210%);backdrop-filter:blur(36px) saturate(210%);border:1px solid rgba(255,255,255,.95);box-shadow:0 -10px 40px rgba(16,24,63,.16),inset 0 2px 1px #fff';
// Tab bar: the clear deep glass from the design's Round 2, and its light glass + button.
const GLX = 'background:linear-gradient(150deg,rgba(255,255,255,.42),rgba(255,255,255,.12) 55%,rgba(255,255,255,.26));-webkit-backdrop-filter:blur(30px) saturate(220%) brightness(1.08);backdrop-filter:blur(30px) saturate(220%) brightness(1.08);border:1px solid rgba(255,255,255,.55);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.8),inset 0 -1px 1px rgba(255,255,255,.2),inset 1px 0 0 rgba(255,255,255,.3),0 18px 40px rgba(16,24,63,.22)';
const GLX_LIGHT = 'background:linear-gradient(150deg,rgba(255,255,255,.95),rgba(255,255,255,.7));-webkit-backdrop-filter:blur(30px) saturate(200%);backdrop-filter:blur(30px) saturate(200%);border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 1.5px 0 #fff,0 18px 40px rgba(16,24,63,.25)';
const TILE = 'background:linear-gradient(150deg,rgba(255,255,255,.78),rgba(255,255,255,.4) 55%,rgba(255,255,255,.6));border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 2px 1px #fff,0 8px 20px rgba(16,24,63,.08)';
const ROW = 'background:linear-gradient(150deg,rgba(255,255,255,.84),rgba(255,255,255,.5) 55%,rgba(255,255,255,.7));border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 2px 1px #fff,0 10px 24px rgba(16,24,63,.08)';
// A category's line icon (see CAT_ICON in logic.js), or its emoji when it has none.
const CatIcon = (em, px, col) => CAT_ICON[em]
  ? html`<svg width=${px} height=${px} viewBox="0 0 24 24" fill="none" stroke=${col} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${CAT_ICON[em]}></path></svg>`
  : html`<span class="emo" aria-hidden="true" style=${S(`font-size:${Math.round(px * .95)}px`)}>${em}</span>`;
const Ico = (d, px, col, sw) => html`<svg width=${px || 20} height=${px || 20} viewBox="0 0 24 24" fill="none" stroke=${col || 'currentColor'} stroke-width=${sw || 2.2} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${d}></path></svg>`;
const BACK = 'M15 5l-7 7 7 7', ARROW_NE = 'M7 17L17 7M9 7h8v8';
const MONO = 'font-family:var(--mono)';
const Grab = () => html`<div aria-hidden="true" style=${S('align-self:center;width:40px;height:5px;border-radius:3px;background:rgba(16,24,63,.2);flex:none')}></div>`;

// Notes: every sentence starts on its own line. A full stop after a common abbreviation
// (Ave., St., Dr., a.m., e.g. …) or a single initial doesn't end the sentence.
const ABBR = /(?:^|[\s(])(?:ave|st|dr|blvd|rd|pl|sq|pkwy|ln|hwy|mt|ft|bldg|apt|ste|no|nos|mr|mrs|ms|jr|sr|vs|etc|e\.g|i\.e|approx|min|mins|hr|hrs|sec|oz|lb|lbs|a\.m|p\.m|[a-z])\.$/i;
const noteLines = txt => {
  const out = [];
  String(txt || '').split(/\n+/).forEach(par => {
    let cur = '';
    par.split(/(?<=[.!?…])\s+/).forEach(bit => {
      cur = cur ? cur + ' ' + bit : bit;
      if (!ABBR.test(cur)) { if (cur.trim()) out.push(cur.trim()); cur = ''; }
    });
    if (cur.trim()) out.push(cur.trim());
  });
  return out;
};
const Note = (txt, extra) => html`<div style=${S(`display:flex;flex-direction:column;gap:3px;${extra || ''}`)}>${noteLines(txt).map((l, i) => html`<span key=${i}>${l}</span>`)}</div>`;

// The Spotted In wordmark, poster style like the app icon: chunky yellow SPOTTED with a stacked
// red-orange shadow and a yellow "in NYC" label. On the map it sits on a blue sign so it stays readable.
const stackShadow = (n, step) => Array.from({ length: n }, (_, i) => `${(i + 1) * step}px ${(i + 1) * step}px 0 #E5402B`).join(',');
const Logo = (big) => big ? html`
  <div aria-label="Spotted In NYC" role="img" style=${S('display:flex;flex-direction:column;align-items:center;flex:none;pointer-events:auto')}>
    <span style=${S(`color:#FFC425;font-weight:900;font-stretch:72%;font-size:54px;line-height:.9;letter-spacing:-.005em;white-space:nowrap;text-shadow:${stackShadow(5, 1.2)}`)}>SPOTTED</span>
    <span style=${S('margin-top:8px;background:#FFC425;color:#1B3DB8;border-radius:7px;padding:3px 12px 4px;font-weight:900;font-style:italic;font-stretch:90%;font-size:20px;line-height:1.05;white-space:nowrap')}>in NYC</span>
  </div>` : html`
  <div class="lg" aria-label="Spotted In NYC" role="img" style=${S(`${GL};display:flex;align-items:center;flex:none;pointer-events:auto;border-radius:999px;padding:7px 7px 7px 14px`)}>
    <span style=${S('display:flex;align-items:center;gap:6px;font-size:19.5px;line-height:1;font-weight:900;font-style:italic;letter-spacing:-.4px;color:#10183F;white-space:nowrap')}>Spotted In<span style=${S('display:inline-flex;align-items:center;height:26px;padding:0 9px;border-radius:999px;background:#FFC425;color:#10183F;font-size:15px;letter-spacing:.5px')}>NYC</span></span>
  </div>`;

// A round profile photo, or the person's initial when they have none (or it fails to load).
const Avatar = (src, initial, px, bg, extra) => html`
  <span style=${S(`position:relative;flex:none;width:${px}px;height:${px}px;border-radius:50%;overflow:hidden;background:${bg || '#1B3DB8'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:${Math.round(px * .42)}px;font-weight:900;${extra || ''}`)}>
    <span aria-hidden="true">${initial}</span>
    ${src && html`<img key=${src} src=${src} alt="" onError=${e => { e.currentTarget.style.display = 'none'; }} style=${S('position:absolute;inset:0;width:100%;height:100%;object-fit:cover')}/>`}
  </span>`;
// A photo filling its box, over a fallback (initial, icon or number) that shows if there's no photo or it fails to load.
const Photo = (src, alt) => src && html`<img key=${src} src=${src} alt=${alt || ''} loading="lazy" onError=${e => { e.currentTarget.style.display = 'none'; }} style=${S('position:absolute;inset:0;width:100%;height:100%;object-fit:cover')}/>`;
const Bul = (b, i) => html`<span key=${i} style=${S(`width:20px;height:20px;border-radius:50%;background:${b.bg};color:${b.fg};font-size:10.5px;font-weight:800;display:flex;align-items:center;justify-content:center`)}>${b.t}</span>`;
const H3 = (title, onClear, clearLabel, mt) => html`
  <div style=${S(`display:flex;align-items:baseline;justify-content:space-between;margin:${mt}`)}>
    <h3 style=${S('margin:0;font-size:19px;font-weight:800')}>${title}</h3>
    <button onClick=${onClear} style=${S('border:0;background:none;color:#1B3DB8;font-weight:700;font-size:13px;cursor:pointer;padding:0')}>${clearLabel}</button>
  </div>`;

function MapScreen(v) {
  const sideBtn = 'width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer';
  const hide = v.hasSel ? 'none' : 'flex';
  return html`
  <div data-screen-label="Map" style=${S(`position:absolute;inset:0;display:${v.mapDisplay}`)}>
    <div ref=${v.mainMapRef} style=${S('position:absolute;inset:0')}></div>
    <div style=${S(`position:absolute;top:${T(56)};left:16px;right:16px;z-index:500;display:${hide};flex-direction:column;gap:16px;pointer-events:none`)}>
      <div class="lg" style=${S(`${GL};pointer-events:auto;border-radius:32px;padding:16px 16px 13px`)}>
        <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:12px')}>
          <div style=${S('min-width:0')}>
            <div style=${S('display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#4A5275')}>Spotted In<button onClick=${v.openCity} aria-label=${'Change City — Now ' + v.cityName} aria-haspopup="dialog" style=${S('display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 6px 0 8px;border-radius:999px;border:0;background:#FFC425;color:#10183F;font-family:inherit;font-size:10.5px;font-weight:900;font-style:italic;letter-spacing:.4px;cursor:pointer;box-shadow:0 2px 6px rgba(255,170,0,.35)')}>${v.cityShort}${Ico('M6 9l6 6 6-6', 11, 'currentColor', 3)}</button></div>
            <div role="img" aria-label=${v.spotCount + (v.spotCount === 1 ? ' Spot To Try' : ' Spots To Try')} style=${S('display:flex;align-items:center;gap:10px;margin-top:6px')}>
              <span style=${S('font-size:58px;font-weight:200;line-height:.78;letter-spacing:-3.5px')}>${v.spotCount}</span>
              <span style=${S('display:flex;flex-direction:column;font-size:21px;line-height:.98;font-weight:900;font-style:italic;letter-spacing:-.4px')}><span>${v.spotCount === 1 ? 'Spot' : 'Spots'}</span><span>To Try</span></span>
            </div>
          </div>
          ${v.syncOn && html`<button class="lg" onClick=${v.openAcct} aria-label=${'Your Account: ' + v.syncLabel} style=${S('position:relative;flex:none;border:0;padding:0;background:none;border-radius:50%;cursor:pointer')}>${Avatar(v.avatarSrc, v.avatarInitial, 52, '#1B3DB8', 'border:2px solid #FFFFFF;box-shadow:0 6px 16px rgba(16,24,63,.18)')}<span style=${S(`position:absolute;right:0;bottom:0;width:13px;height:13px;border-radius:50%;background:${v.syncDot};border:2px solid #FFFFFF`)}></span></button>`}
        </div>
        <div style=${S('display:flex;align-items:baseline;gap:16px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(16,24,63,.08);font-size:11.5px;font-weight:700;color:#4A5275;white-space:nowrap')}>
          <span><span style=${S('font-size:21px;font-weight:200;letter-spacing:-.8px;color:#10183F')}>${v.visitedCount}</span> Visited</span>
          <span><span style=${S('font-size:21px;font-weight:200;letter-spacing:-.8px;color:#10183F')}>${v.planCount}</span> In Plan</span>
          <span style=${S('flex:1')}></span>
          ${v.syncOn && html`<span style=${S('display:flex;align-items:center;gap:6px;align-self:center')}><span style=${S(`width:7px;height:7px;border-radius:50%;background:${v.syncDot};box-shadow:0 0 0 3px ${v.syncDot}33`)}></span>${v.syncLabel}</span>`}
        </div>
      </div>
      <nav aria-label="Categories" class="noscroll" style=${S('display:flex;gap:8px;overflow-x:auto;margin:0 -16px;padding:2px 16px 6px;pointer-events:auto')}>
        ${v.mapChips.map((c, i) => c.bg === '#fff' ? html`
        <button key=${i} class="lg" onClick=${c.onClick} style=${S(`${GL};flex:none;display:flex;align-items:center;gap:7px;height:36px;padding:0 13px;border-radius:999px;color:#10183F;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap`)}>${i > 0 && html`<span style=${S(`width:9px;height:9px;border-radius:50%;background:${c.dot}`)}></span>`}${i ? c.label : 'All Spots'}</button>` : html`
        <button key=${i} onClick=${c.onClick} style=${S(`flex:none;display:flex;align-items:center;gap:7px;height:36px;padding:0 14px;border-radius:999px;border:none;background:${c.bg};color:${c.fg};font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap;box-shadow:0 6px 16px rgba(16,24,63,.2)`)}>${i > 0 && html`<span style=${S(`width:9px;height:9px;border-radius:50%;background:${c.dot}`)}></span>`}${i ? c.label : 'All Spots'}</button>`)}
      </nav>
    </div>
    <div style=${S(`position:absolute;right:16px;bottom:${B(v.nearest ? 196 : 112)};z-index:600;display:${hide};flex-direction:column;gap:10px`)}>
      <button class="lg" onClick=${v.toggleLayers} aria-label="Map Layers" aria-expanded=${v.layersOpen} style=${S(`${sideBtn};${v.layersOn ? 'border:1px solid rgba(255,255,255,.5);background:#10183F;box-shadow:0 10px 26px rgba(16,24,63,.3)' : GL};color:${v.layersOn ? '#FFC425' : '#10183F'}`)}>${Ico('M12 3l9 5-9 5-9-5z M3 13l9 5 9-5', 22)}</button>
      <button class="lg" onClick=${v.locateMe} aria-label="My Location" style=${S(`${sideBtn};${v.locBg === '#fff' ? GL : 'border:1px solid rgba(255,255,255,.5);background:' + v.locBg + ';box-shadow:0 10px 26px rgba(16,24,63,.3)'};color:${v.locBg === '#fff' ? '#1B3DB8' : v.locFg}`)}><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 3L3 10.5l7.5 2.9L13.4 21z"></path></svg></button>
    </div>
    ${v.layersOpen && !v.hasSel && html`
    <div role="dialog" aria-label="Map Layers" class="lg" style=${S(`position:absolute;right:76px;bottom:${B(v.nearest ? 196 : 112)};z-index:700;width:236px;${GL};border-radius:26px;padding:8px;display:flex;flex-direction:column;gap:4px`)}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;padding:6px 8px 4px')}>
        <span style=${S('font-weight:900;font-style:italic;font-size:17px')}>Map Layers</span>
        <button onClick=${v.closeLayers} aria-label="Close" style=${S('width:30px;height:30px;border-radius:50%;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:800;cursor:pointer')}>✕</button>
      </div>
      ${v.layerRows.map(r => html`
      <button key=${r.key} onClick=${r.onClick} role="switch" aria-checked=${r.on} style=${S(`display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 10px;border-radius:18px;border:0;background:${r.on ? 'rgba(255,255,255,.85)' : 'transparent'};color:#10183F;text-align:left;cursor:pointer;box-shadow:${r.on ? '0 4px 12px rgba(16,24,63,.1)' : 'none'}`)}>
        <span style=${S(`width:30px;height:30px;flex:none;border-radius:10px;background:${r.col};color:#fff;display:flex;align-items:center;justify-content:center`)}>${r.key === 'sub' ? Ico('M8 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z M5 10h14 M8 21l2-4 M16 21l-2-4', 17, '#fff', 2) : r.key === 'bus' ? Ico('M6 3h12a2 2 0 0 1 2 2v11H4V5a2 2 0 0 1 2-2z M4 10h16 M7 19v2 M17 19v2 M4 16v3h16v-3', 17, '#fff', 2) : r.key === 'tram' ? Ico('M8 2h8 M12 2v3 M7 5h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M5 11h14 M9 18l-2 4 M15 18l2 4', 17, '#fff', 2) : r.key === 'ferry' ? Ico('M3 17c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0 M4 14l1.5-5h13L20 14 M8 9V6h8v3 M12 3v3', 17, '#fff', 2) : Ico('M5.5 17.5a3.5 3.5 0 1 0 0-.01z M18.5 17.5a3.5 3.5 0 1 0 0-.01z M5.5 17.5L9 9h6l3.5 8.5 M9 9l3 8.5 M8 6h3', 17, '#fff', 2)}</span>
        <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px')}><span style=${S('font-weight:800;font-size:14px')}>${r.label}</span><span style=${S('font-size:11.5px;font-weight:600;color:#4A5275')}>${r.sub}</span></span>
        <span aria-hidden="true" style=${S(`width:40px;height:24px;flex:none;border-radius:999px;background:${r.on ? '#1B3DB8' : 'rgba(16,24,63,.15)'};position:relative;transition:background .2s`)}><span style=${S(`position:absolute;top:2px;left:${r.on ? 18 : 2}px;width:20px;height:20px;border-radius:50%;background:#FFFFFF;box-shadow:0 1px 3px rgba(16,24,63,.3);transition:left .2s`)}></span></span>
      </button>`)}
      <div style=${S('padding:4px 10px 4px;font-size:10.5px;color:#6A7090')}>${v.layersNote}</div>
    </div>`}
    ${v.nearest && !v.hasSel && !v.layersOpen && html`
    <button class="lg" onClick=${v.nearest.onClick} style=${S(`position:absolute;left:16px;right:16px;bottom:${B(104)};z-index:600;${GL};border-radius:28px;padding:11px;display:flex;align-items:center;gap:12px;text-align:left;color:#10183F;cursor:pointer`)}>
      <span style=${S('width:54px;height:54px;flex:none;border-radius:19px;background:linear-gradient(150deg,rgba(255,220,120,.95),rgba(255,196,37,.75));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 2px 1px rgba(255,255,255,.85);display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1')}><span style=${S('font-size:23px;font-weight:200')}>${v.nearest.big}</span><span style=${S('font-size:10px;font-weight:800')}>${v.nearest.unit} walk</span></span>
      <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-size:11.5px;font-weight:700;color:#4A5275')}>Nearest To You · ${v.nearest.catName}</span><span style=${S('font-size:18px;font-weight:900;font-style:italic;letter-spacing:-.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${v.nearest.name}</span></span>
      <span style=${S('width:44px;height:44px;flex:none;border-radius:50%;background:#10183F;color:#fff;display:flex;align-items:center;justify-content:center')}>${Ico(ARROW_NE, 18, 'currentColor', 2.4)}</span>
    </button>`}
    ${v.locLine && !v.nearest && html`
    <div class="lg" style=${S(`position:absolute;left:16px;right:76px;bottom:${B(116)};z-index:600;${GL};border-radius:18px;padding:8px 12px;display:flex;flex-direction:column;gap:1px;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)`)}>
      <span style=${S('font-size:12px;font-weight:800;color:#1B3DB8')}>${v.locTitle}</span><span style=${S('font-size:12px;font-weight:600;color:#3C4466;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${v.locSub}</span>
    </div>`}
    ${v.locFailOpen && html`
    <div class="lg" style=${S(`position:absolute;left:8px;right:8px;bottom:${B(108)};z-index:960;${GL2};border-radius:28px;padding:16px;display:flex;flex-direction:column;gap:10px`)}>
      <div style=${S('display:flex;justify-content:space-between;align-items:flex-start;gap:10px')}><div style=${S('font-weight:900;font-style:italic;font-size:20px;color:#1B3DB8;line-height:1.1')}>Can't Find You Yet</div>
        <button onClick=${v.closeLocFail} aria-label="Close" style=${S('flex:none;width:30px;height:30px;border-radius:50%;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:800;cursor:pointer')}>✕</button></div>
      <div style=${S('font-size:13px;line-height:1.4;color:#3C4466')}>${v.locFailMsg}</div>
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:8px')}>
        <button onClick=${v.locateMe} style=${S('height:42px;border-radius:14px;border:1.5px solid rgba(16,24,63,.14);background:#fff;color:#10183F;font-weight:800;font-size:13px;cursor:pointer')}>Try Again</button>
        <button onClick=${v.setHereOnMap} style=${S('height:42px;border-radius:14px;border:0;background:#FF6B1A;color:#fff;font-weight:800;font-size:13px;cursor:pointer')}>Tap Where I Am</button>
      </div>
    </div>`}
    ${v.placing && html`
    <div style=${S(`position:absolute;top:${T(52)};left:12px;right:12px;z-index:700;background:#FF6B1A;color:#fff;border-radius:24px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)`)}>
      <div style=${S('display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:18px')}>${v.placingTitle}</span><span style=${S('font-size:12px;font-weight:600')}>Zoom In To See Every Street</span></div>
      <button onClick=${v.cancelPlacing} style=${S('flex:none;height:36px;padding:0 14px;border:0;border-radius:999px;background:#10183F;color:#fff;font-weight:800;font-size:13px;cursor:pointer')}>Back</button>
    </div>`}
  </div>`;
}

// Explore: the hybrid "Command Center + Deck" design. Search, category chips and a glass matches card on top
// (filters live behind the navy button), then the matches as a swipeable deck: right adds to the plan, left skips,
// a tap opens the spot. "See All" still opens the full results list and map.
function DeckCard(c, i, v) {
  const front = i === 0, dx = front ? v.deckDx : 0;
  const fly = front && v.deckFly ? (v.deckFly === 'right' ? 'translateX(130%) rotate(22deg)' : 'translateX(-130%) rotate(-22deg)') : '';
  const tf = front ? (fly || `translateX(${dx}px) rotate(${dx / 16}deg)`) : i === 1 ? 'rotate(-3deg) translateY(8px) scale(.97)' : 'rotate(4deg) translateY(16px) scale(.94)';
  const still = front && dx !== 0 && !v.deckFly;
  const grad = `linear-gradient(150deg,${c.col}88,${c.col})`;
  return html`
  <div key=${c.id} class="lg" onPointerDown=${front ? c.onDown : null} onPointerMove=${front ? c.onMove : null} onPointerUp=${front ? c.onUp : null} onPointerCancel=${front ? c.onCancel : null}
    style=${S(`position:absolute;left:0;right:0;top:0;z-index:${3 - i};${GL};background:linear-gradient(150deg,rgba(255,255,255,.94),rgba(255,247,234,.8));border-radius:32px;padding:8px;display:flex;flex-direction:column;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:${front ? 'grab' : 'default'};transform:${tf};transform-origin:50% 110%;opacity:${i === 2 ? .7 : 1};transition:${still ? 'none' : 'transform .24s ease, opacity .24s'}`)}>
    <div style=${S(`position:relative;height:230px;border-radius:25px;overflow:hidden;background:${grad};display:flex;align-items:center;justify-content:center`)}>
      <div aria-hidden="true" style=${S('position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px);background-size:24px 24px')}></div>
      <span style=${S('position:relative;opacity:.85')}>${CatIcon(c.emoji, 58, c.fg)}</span>
      ${Photo(c.img, c.bold + ' ' + c.light)}
      ${front && html`
      <span class="lg" style=${S(`position:absolute;left:10px;top:10px;${GLX};height:26px;padding:0 9px;border-radius:999px;display:flex;align-items:center;${MONO};font-size:10.5px;font-weight:700;color:#10183F;background:rgba(255,255,255,.55)`)}>${c.idx} / ${v.deckTotal}</span>
      ${(c.inPlan || c.visited) && html`<span style=${S(`position:absolute;right:10px;top:10px;height:26px;padding:0 9px;border-radius:999px;display:flex;align-items:center;gap:4px;${MONO};font-size:10.5px;font-weight:700;background:rgba(255,255,255,.85);color:${c.inPlan ? '#1B3DB8' : '#1F9D6B'}`)}>${c.inPlan ? 'IN PLAN ✓' : 'BEEN HERE ✓'}</span>`}
      <span aria-hidden="true" style=${S(`position:absolute;left:16px;top:44px;transform:rotate(-14deg);padding:4px 12px;border-radius:12px;border:3px solid #1F9D6B;background:rgba(255,255,255,.9);color:#1F9D6B;font-size:24px;font-weight:900;font-style:italic;opacity:${Math.max(0, Math.min(1, (dx - 20) / 70)) + (v.deckFly === 'right' ? 1 : 0)}`)}>PLAN +</span>
      <span aria-hidden="true" style=${S(`position:absolute;right:16px;top:44px;transform:rotate(14deg);padding:4px 12px;border-radius:12px;border:3px solid #E8242C;background:rgba(255,255,255,.9);color:#E8242C;font-size:24px;font-weight:900;font-style:italic;opacity:${Math.max(0, Math.min(1, (-dx - 20) / 70)) + (v.deckFly === 'left' ? 1 : 0)}`)}>SKIP</span>`}
    </div>
    <div style=${S(`display:flex;align-items:center;gap:8px;padding:10px 4px 2px 8px;min-height:52px;visibility:${front ? 'visible' : 'hidden'}`)}>
      <div style=${S('flex:1;min-width:0')}>
        <div style=${S('font-size:21px;letter-spacing:-.6px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}><span style=${S('font-weight:900')}>${c.bold}</span> <span style=${S('font-weight:200')}>${c.light}</span></div>
        <div style=${S(`${MONO};font-size:10px;font-weight:700;color:#4A5275;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>${c.meta}</div>
      </div>
      ${front && html`
      <button onPointerDown=${e => e.stopPropagation()} onClick=${v.deckSkip} aria-label="Skip" class="lg" style=${S(`${GL};width:46px;height:46px;flex:none;border-radius:50%;color:#E8242C;display:flex;align-items:center;justify-content:center;cursor:pointer`)}>${Ico('M6 6l12 12M18 6L6 18', 18, 'currentColor', 2.8)}</button>
      <button onPointerDown=${e => e.stopPropagation()} onClick=${v.deckPlan} aria-label="Add To Plan" style=${S('width:50px;height:50px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.55);background:radial-gradient(circle at 35% 28%,#FFB27F,#FF6B1A 58%,#E8561A);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 2px 1px rgba(255,255,255,.55),0 10px 22px rgba(255,107,26,.38)')}>${Ico('M12 5v14M5 12h14', 20, 'currentColor', 2.8)}</button>`}
    </div>
  </div>`;
}

function ExploreScreen(v) {
  const mono = (t, col, extra) => html`<span style=${S(`${MONO};font-size:10.5px;font-weight:700;letter-spacing:1.1px;color:${col || '#4A5275'};${extra || ''}`)}>${t}</span>`;
  const endCard = (title, light, body, btns) => html`
    <div class="lg" style=${S(`position:absolute;left:0;right:0;top:0;${GL};border-radius:32px;padding:26px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center`)}>
      <div style=${S('font-size:26px;letter-spacing:-.8px;line-height:1.1')}><span style=${S('font-weight:900;font-style:italic')}>${title}</span> <span style=${S('font-weight:200')}>${light}</span></div>
      <div style=${S('font-size:14px;font-weight:500;color:#4A5275;line-height:1.4')}>${body}</div>
      <div style=${S('display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;justify-content:center')}>${btns}</div>
    </div>`;
  const pill = (label, onClick, dark) => html`<button onClick=${onClick} style=${S(`height:44px;padding:0 18px;border-radius:999px;border:${dark ? '0' : '1.5px solid rgba(16,24,63,.14)'};background:${dark ? '#10183F' : 'rgba(255,255,255,.7)'};color:${dark ? '#fff' : '#10183F'};font-weight:800;font-size:14px;cursor:pointer`)}>${label}</button>`;
  return html`
  <div data-screen-label="Explore" style=${S(`position:absolute;inset:0;display:${v.exDisplay}`)}>
    <div class="noscroll" style=${S(`position:absolute;inset:0;overflow-y:auto;padding:${T(56)} 16px ${B(118)};display:${v.exPickDisplay}`)}>
      <div aria-hidden="true" style=${S('position:absolute;left:-90px;top:-70px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,107,26,.28),rgba(255,107,26,0) 68%);pointer-events:none')}></div>
      <div style=${S('position:relative;display:flex;flex-direction:column;gap:10px')}>
        <div style=${S('display:flex;justify-content:space-between;align-items:center;padding:0 4px')}>
          ${mono(`EXPLORE · ${v.exSaved} SAVED · ${v.cityShort}`)}
          <button onClick=${v.toggleHideVisited} role="switch" aria-checked=${v.hideVisited} style=${S(`height:26px;padding:0 10px;border-radius:999px;border:0;cursor:pointer;display:flex;align-items:center;gap:5px;${MONO};font-size:10px;font-weight:700;background:${v.hideVisited ? '#1F9D6B' : 'rgba(16,24,63,.07)'};color:${v.hideVisited ? '#fff' : '#4A5275'}`)}>${v.hideVisited ? '✓ ' : ''}HIDE VISITED</button>
        </div>
        <h1 style=${S('margin:0 4px;font-size:38px;line-height:1;font-weight:900;font-style:italic;letter-spacing:-1.6px;white-space:nowrap;color:#10183F')}>Where To <span style=${S('font-weight:200;font-style:normal')}>Today?</span></h1>
        <div style=${S('display:flex;gap:8px')}>
          <label class="lg" style=${S(`${GL};flex:1;min-width:0;height:50px;border-radius:999px;display:flex;align-items:center;gap:10px;padding:0 8px 0 16px`)}>
            ${Ico('M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14 M20 20l-3.5-3.5', 18, '#4A5275')}
            <input value=${v.exQuery} onInput=${v.onExQuery} placeholder="Search spots, vibes, streets" aria-label="Search Your Spots" enterkeyhint="search" style=${S('flex:1;min-width:0;border:0;background:transparent;font-family:inherit;font-size:16px;font-weight:600;color:#10183F;outline:none')}/>
            ${v.exQuery && html`<button onClick=${v.clearExQuery} aria-label="Clear Search" style=${S('width:32px;height:32px;flex:none;border-radius:50%;border:0;background:rgba(16,24,63,.08);color:#10183F;font-weight:800;cursor:pointer')}>✕</button>`}
          </label>
          <button onClick=${v.toggleExFilters} aria-label="More Filters" aria-expanded=${v.exFiltersOpen} style=${S('position:relative;width:50px;height:50px;flex:none;border-radius:50%;border:0;background:#10183F;color:#FFC425;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25),0 10px 22px rgba(16,24,63,.25)')}>
            ${v.exFiltersOpen ? Ico('M6 6l12 12M18 6L6 18', 18, 'currentColor', 2.6) : Ico('M4 7h10M18 7h2M4 17h4M12 17h8 M16 5v4 M10 15v4', 20)}
            ${v.exFilterN > 0 && !v.exFiltersOpen && html`<span style=${S('position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:#FF6B1A;color:#fff;border:2px solid #FFF3DF;font-size:10.5px;font-weight:900;display:flex;align-items:center;justify-content:center')}>${v.exFilterN}</span>`}
          </button>
        </div>
        ${v.exFiltersOpen && html`
        <div class="lg" style=${S(`${GL};border-radius:26px;padding:14px;display:flex;flex-direction:column;gap:12px`)}>
          ${v.exShowPrice && html`
          <div style=${S('display:flex;flex-direction:column;gap:7px')}>
            <div style=${S('display:flex;justify-content:space-between')}>${mono('PRICE · RESTAURANTS')}${v.clearPricesLabel && html`<button onClick=${v.clearPrices} style=${S(`border:0;background:none;padding:0;cursor:pointer;${MONO};font-size:10.5px;font-weight:700;color:#1B3DB8`)}>CLEAR</button>`}</div>
            <div style=${S('display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:4px;border-radius:999px;background:rgba(16,24,63,.06)')}>
              ${v.exPriceChips.map((p, i) => html`<button key=${i} onClick=${p.onClick} aria-pressed=${p.on} style=${S(`height:38px;border-radius:999px;border:0;cursor:pointer;font-weight:800;font-size:14px;background:${p.on ? '#10183F' : 'transparent'};color:${p.on ? '#FFC425' : '#10183F'};box-shadow:${p.on ? 'inset 0 1.5px 0 rgba(255,255,255,.25)' : 'none'}`)}>${p.label}</button>`)}
            </div>
          </div>`}
          ${v.exBoroughs.length > 0 && html`
          <div style=${S('display:flex;flex-direction:column;gap:7px')}>
            <div style=${S('display:flex;justify-content:space-between')}>${mono('NEIGHBORHOODS')}${v.clearAreasLabel && html`<button onClick=${v.clearAreas} style=${S(`border:0;background:none;padding:0;cursor:pointer;${MONO};font-size:10.5px;font-weight:700;color:#1B3DB8`)}>CLEAR</button>`}</div>
            ${v.exBoroughs.map((b, i) => html`
            <div key=${i} style=${S('display:flex;flex-wrap:wrap;gap:6px;align-items:center')}>
              ${mono(b.name.toUpperCase(), '#E8242C', 'font-size:9.5px;margin-right:2px')}
              ${b.areas.map((a, j) => html`<button key=${j} onClick=${a.onClick} aria-pressed=${a.on} style=${S(`height:32px;padding:0 11px;border-radius:999px;cursor:pointer;display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;opacity:${a.op};border:${a.on ? '0' : '1px solid rgba(255,255,255,.9)'};background:${a.on ? '#1B3DB8' : 'rgba(255,255,255,.6)'};color:${a.on ? '#fff' : '#10183F'}`)}>${a.name}<span style=${S(`${MONO};font-size:10px;opacity:.7`)}>${a.count}</span></button>`)}
            </div>`)}
          </div>`}
          <div style=${S('display:flex;gap:8px')}>
            <button onClick=${v.clearExAll} style=${S('flex:1;height:42px;border-radius:999px;border:1.5px solid rgba(16,24,63,.14);background:rgba(255,255,255,.6);color:#10183F;font-weight:800;font-size:13.5px;cursor:pointer')}>Clear All</button>
            <button onClick=${v.closeExFilters} style=${S('flex:1;height:42px;border-radius:999px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:13.5px;cursor:pointer')}>Show ${v.exCount}</button>
          </div>
        </div>`}
        <nav aria-label="Categories" class="noscroll" style=${S('display:flex;gap:6px;overflow-x:auto;margin:0 -16px;padding:2px 16px 4px')}>
          ${v.exTiles.map((t, i) => html`
          <button key=${i} class="lg" onClick=${t.onClick} aria-pressed=${t.on} style=${S(`${GL};flex:none;height:44px;padding:0 12px 0 6px;border-radius:999px;display:flex;align-items:center;gap:8px;color:#10183F;cursor:pointer;white-space:nowrap;${t.on ? 'box-shadow:0 0 0 2px #10183F,inset 0 2px 1px #fff' : ''}`)}>
            <span style=${S(`width:32px;height:32px;border-radius:50%;background:${t.on ? t.col : t.col + '24'};display:flex;align-items:center;justify-content:center`)}>${CatIcon(t.emoji, 15, t.on ? (t.col === '#FFC425' ? '#10183F' : '#fff') : t.col)}</span>
            <span style=${S('font-size:13px;font-weight:800')}>${t.name}</span>
            <span style=${S(`${MONO};font-size:10.5px;font-weight:700;color:#4A5275`)}>${String(t.n).padStart(2, '0')}</span>
          </button>`)}
        </nav>
        <button class="lg" onClick=${v.toggleExFilters} style=${S(`${GL};border-radius:22px;padding:10px 12px 10px 14px;display:flex;align-items:center;gap:12px;color:#10183F;text-align:left;cursor:pointer`)}>
          <span style=${S('font-size:40px;font-weight:200;letter-spacing:-2px;line-height:.9')}>${v.exCount}</span>
          <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:6px')}>
            ${mono(`${v.exCount === 1 ? 'MATCH' : 'MATCHES'} · ${v.exHoods} ${v.exHoods === 1 ? 'HOOD' : 'HOODS'}`)}
            <span aria-hidden="true" style=${S('display:flex;gap:3px;height:8px')}>${v.exBar.length ? v.exBar.map((b, i) => html`<span key=${i} style=${S(`flex:${b.n};border-radius:4px;background:${b.col}`)}></span>`) : html`<span style=${S('flex:1;border-radius:4px;background:rgba(16,24,63,.12)')}></span>`}</span>
          </span>
          <span style=${S(`flex:none;height:30px;padding:0 10px;border-radius:999px;background:#10183F;color:#FFC425;${MONO};font-size:10.5px;font-weight:700;display:flex;align-items:center`)}>${v.exPriceLbl}</span>
        </button>
        <div style=${S('display:flex;justify-content:space-between;align-items:center;padding:12px 4px 0')}>
          <div style=${S('font-size:20px;font-weight:900;font-style:italic;letter-spacing:-.6px;white-space:nowrap')}>Shuffle <span style=${S('font-weight:200;font-style:normal')}>The Deck</span></div>
          ${v.exCount > 0 && html`<button onClick=${v.showResults} style=${S(`border:0;background:none;padding:6px 0;cursor:pointer;${MONO};font-size:11px;font-weight:700;color:#1B3DB8`)}>SEE ALL ${v.exCount} →</button>`}
        </div>
        <div style=${S('position:relative;height:340px;margin:2px 8px 0')}>
          ${v.deckEmpty ? endCard('Nothing', 'Matches Yet', 'Try fewer filters, or save a spot you spotted online.', [pill('Clear Filters', v.clearExAll), pill('Add A Spot', v.openAdd, true)])
            : v.deckDone ? endCard('That’s All', v.deckTotal, 'You went through every match. Shuffle for a new order, or see them all at once.', [pill('See All', v.showResults), pill('Shuffle Again', v.deckShuffle, true)])
            : v.deckCards.map((c, i) => DeckCard(c, i, v)).reverse()}
        </div>
        ${!v.deckEmpty && !v.deckDone && html`<div style=${S('display:flex;justify-content:center;gap:22px;padding-top:6px')}>${mono('← SKIP', '#E8242C')}${mono('TAP TO OPEN', '#1B3DB8')}${mono('PLAN →', '#1F9D6B')}</div>`}
      </div>
    </div>
    <div style=${S(`position:absolute;inset:0;display:${v.exResDisplay};flex-direction:column`)}>
      <div class="lg" style=${S(`flex:none;margin:${T(52)} 16px 0;${GL};border-radius:28px;padding:12px;display:flex;flex-direction:column;gap:10px;z-index:5`)}>
        <div style=${S('display:flex;justify-content:space-between;gap:8px')}>
          <button onClick=${v.backToPick} style=${S('border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:800;font-size:13px;height:34px;padding:0 14px;border-radius:999px;cursor:pointer')}>← Deck</button>
          <button onClick=${v.addAllToPlan} style=${S('border:0;background:#10183F;color:#FFC425;font-weight:800;font-size:13px;height:34px;padding:0 14px;border-radius:999px;cursor:pointer')}>+ Add All To Plan</button>
        </div>
        <div style=${S('padding:0 4px')}>
          <div style=${S('font-weight:900;font-style:italic;font-size:24px;letter-spacing:-.6px;line-height:1.05;color:#10183F;text-wrap:pretty')}>${v.exTitle}</div>
          <div style=${S('font-family:var(--mono);font-size:10.5px;font-weight:700;letter-spacing:.8px;color:#4A5275;margin-top:5px;text-transform:uppercase')}>${v.exSub}</div>
        </div>
        <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;background:rgba(16,24,63,.07);border-radius:999px')}>
          <button onClick=${v.viewList} style=${S(`height:36px;border:0;border-radius:999px;background:${v.exView === 'list' ? '#10183F' : 'transparent'};color:${v.exView === 'list' ? '#FFC425' : '#10183F'};font-weight:800;font-size:14px;cursor:pointer`)}>List</button>
          <button onClick=${v.viewMap} style=${S(`height:36px;border:0;border-radius:999px;background:${v.exView === 'map' ? '#10183F' : 'transparent'};color:${v.exView === 'map' ? '#FFC425' : '#10183F'};font-weight:800;font-size:14px;cursor:pointer`)}>Map</button>
        </div>
      </div>
      <div style=${S('position:relative;flex:1;min-height:0;margin-top:8px')}>
        <div class="noscroll" style=${S(`position:absolute;inset:0;overflow-y:auto;padding:4px 16px ${B(124)};display:${v.exListDisplay};flex-direction:column;gap:10px`)}>
          ${v.resultCards.map((r, i) => html`
          <div key=${i} onClick=${r.onClick} style=${S(`flex:none;display:flex;gap:14px;align-items:stretch;width:100%;background:#fff;border:2px solid ${r.ring};border-radius:24px;padding:12px;cursor:pointer;box-shadow:0 2px 8px rgba(16,24,63,.06)`)}>
            <div style=${S(`position:relative;overflow:hidden;width:62px;flex:none;border-radius:16px;background:${r.catBg};color:${r.catFg};display:flex;align-items:center;justify-content:center;font-weight:900;font-stretch:100%;font-style:italic;font-size:30px`)}>${r.initial}${Photo(r.img)}</div>
            <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding:2px 0')}>
              <div style=${S('display:flex;justify-content:space-between;align-items:flex-start;gap:8px')}><span style=${S('font-weight:800;font-size:17px;line-height:1.2')}>${r.name}</span>
                ${r.visited && html`<span style=${S('flex:none;font-size:11px;font-weight:800;background:#1F9D6B;color:#fff;padding:3px 8px;border-radius:999px')}>Been Here</span>`}</div>
              <div style=${S('display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;font-weight:600;color:#4A5275')}><span>${r.catName} · ${r.area}</span>${r.hasPrice && html`<span style=${S('font-weight:900;color:#1F9D6B')}>${r.price}</span>`}</div>
              ${r.hasNote && Note(r.note, 'font-size:13px;color:#3C4466;line-height:1.35')}
              <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px')}>
                <span style=${S(`font-size:11px;font-weight:700;background:${r.srcBg};color:#fff;padding:3px 8px;border-radius:6px`)}>${r.srcLabel}</span>
                <button onClick=${r.onPlan} style=${S(`height:30px;padding:0 12px;border-radius:999px;border:1.5px solid rgba(16,24,63,.14);background:${r.planBg};color:${r.planFg};font-weight:800;font-size:12px;cursor:pointer`)}>${r.planLabel}</button>
              </div>
            </div>
          </div>`)}
          ${v.noResults && html`
          <div style=${S('text-align:center;padding:40px 20px;display:flex;flex-direction:column;gap:12px;align-items:center')}>
            <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:#1B3DB8')}>Nothing Here Yet</div>
            <div style=${S('font-size:14px;color:#4A5275')}>Try Another Area, Or Save A Spot You Spotted Online.</div>
            <button onClick=${v.openAdd} style=${S('height:46px;padding:0 20px;border:0;border-radius:999px;background:#FF6B1A;color:#fff;font-weight:800;font-size:15px;cursor:pointer')}>Add A Spot</button>
          </div>`}
        </div>
        <div ref=${v.exMapRef} style=${S(`position:absolute;inset:0;visibility:${v.exMapVis}`)}></div>
      </div>
    </div>
  </div>`;
}

// Route: the map fills the screen under a glass panel (total time, ride vs walk, start point) and a timeline
// sheet. The sheet sits halfway up; drag or tap its handle to pull it up (the panel shrinks to two pills).
// Each stop gets a clock time from the "Leave At" time, the travel legs and how long you stay (tap STAY to change it).
function PlanScreen(v) {
  const full = v.planSheetFull, mono = (t, col, extra) => html`<span style=${S(`${MONO};font-size:10.5px;font-weight:700;letter-spacing:.9px;color:${col || '#4A5275'};${extra || ''}`)}>${t}</span>`;
  const big = (n, u) => html`<span style=${S('font-size:44px;font-weight:200;letter-spacing:-2.5px;line-height:.85')}>${n}</span><span style=${S('font-size:14px;font-weight:300;margin:0 8px 0 3px')}>${u}</span>`;
  const TC = 'width:62px;flex:none;text-align:right', LC = 'width:30px;flex:none;display:flex;justify-content:center';
  const dot = (bg, fg, t) => html`<span style=${S(`width:24px;height:24px;border-radius:50%;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900`)}>${t}</span>`;
  const leg = (key, content, onClick) => html`
    <button key=${key} onClick=${onClick} disabled=${!onClick} style=${S(`display:flex;gap:8px;align-items:stretch;min-height:40px;border:0;background:none;padding:0;text-align:left;color:#10183F;cursor:${onClick ? 'pointer' : 'default'}`)}>
      <span style=${S(TC)}></span>
      <span style=${S(LC)}><span style=${S('width:3px;border-radius:2px;background:repeating-linear-gradient(#1B3DB8 0 5px,transparent 5px 9px)')}></span></span>
      <span style=${S('display:flex;align-items:center;gap:6px;flex:1;min-width:0;flex-wrap:wrap')}>${content}</span>
    </button>`;
  const legBody = (bullets, walk, txt, link) => html`${walk ? html`<span aria-hidden="true" style=${S('font-size:14px')}>🚶</span>` : html`<span style=${S('display:flex;gap:3px')}>${bullets.map(Bul)}</span>`}${mono(txt)}${link && mono('MAPS ↗', '#1B3DB8')}`;
  return html`
  <div data-screen-label="Plan" style=${S(`position:absolute;inset:0;display:${v.planDisplay}`)}>
    <div ref=${v.planMapRef} style=${S('position:absolute;inset:0')}></div>
    ${full ? html`
    <div style=${S(`position:absolute;top:${T(54)};left:16px;right:16px;z-index:600;display:flex;justify-content:space-between;gap:8px;pointer-events:none`)}>
      <div class="lg" style=${S(`${GL};pointer-events:auto;height:40px;padding:0 14px;border-radius:999px;display:flex;align-items:center;gap:8px`)}><span style=${S('font-size:19px;font-weight:200;letter-spacing:-.8px;white-space:nowrap')}>${v.planHas ? (v.planHr ? v.planHr + ' hr ' : '') + v.planMin + ' min' : 'No Stops'}</span>${v.planHas && mono('TRAVEL')}</div>
      <button class="lg" onClick=${v.togglePlanSheet} style=${S(`${GL};pointer-events:auto;height:40px;padding:0 14px;border-radius:999px;display:flex;align-items:center;gap:6px;color:#10183F;font-size:12.5px;font-weight:800;cursor:pointer`)}><span style=${S('width:8px;height:8px;border-radius:50%;background:#10183F')}></span>${(v.planStartChips.find(c => c.bg !== '#fff') || {}).label || 'Start'}</button>
    </div>` : html`
    <div class="lg" style=${S(`position:absolute;top:${T(54)};left:16px;right:16px;z-index:600;${GL};border-radius:26px;padding:12px 14px;display:flex;flex-direction:column;gap:10px`)}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        <div style=${S('min-width:0')}>
          ${mono(v.planHas ? `${v.planStopsN} ${v.planStopsN === 1 ? 'STOP' : 'STOPS'} · ${v.planEndLabel === 'Back Home' ? 'HOME' : 'DONE'} ${v.endClock}` : 'ROUTE · PLAN A DAY', '#4A5275', 'display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}
          <div style=${S('display:flex;align-items:baseline;margin-top:6px;white-space:nowrap')}>${v.planHas ? html`${v.planHr > 0 && big(v.planHr, 'hr')}${big(v.planMin, 'min')}` : html`<span style=${S('font-size:26px;font-weight:900;font-style:italic;letter-spacing:-.6px')}>Plan <span style=${S('font-weight:200;font-style:normal')}>A Day</span></span>`}</div>
        </div>
        ${v.planHas && html`
        <div style=${S('display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex:none')}>
          <div aria-hidden="true" style=${S('display:flex;gap:2px;width:96px;height:6px')}>${v.planRide > 0 && html`<span style=${S(`flex:${v.planRide};border-radius:3px;background:#1B3DB8`)}></span>`}${v.planWalkMin > 0 && html`<span style=${S(`flex:${v.planWalkMin};border-radius:3px;background:#FFC425`)}></span>`}</div>
          ${mono(`${v.planRide} RIDE · ${v.planWalkMin} WALK`, '#4A5275', 'font-size:9.5px')}
        </div>`}
      </div>
      <div style=${S('display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px;border-radius:999px;background:rgba(16,24,63,.06)')}>
        ${v.planStartChips.map((c, i) => html`<button key=${i} onClick=${c.onClick} aria-pressed=${c.bg !== '#fff'} style=${S(`height:32px;padding:0 6px;border-radius:999px;border:0;background:${c.bg !== '#fff' ? '#10183F' : 'transparent'};color:${c.bg !== '#fff' ? '#FFC425' : '#10183F'};font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>${c.label}</button>`)}
      </div>
      ${v.planStartMsg && html`<div style=${S('font-size:12px;font-weight:700;color:#E8242C;padding:0 4px')}>${v.planStartMsgText}</div>`}
    </div>`}
    <section aria-label="Plan A Day Timeline" class="lg" style=${S(`position:absolute;left:0;right:0;top:${full ? T(108) : '47%'};bottom:0;z-index:650;${GL2};border-radius:34px 34px 0 0;display:flex;flex-direction:column;transition:top .32s cubic-bezier(.2,.8,.2,1)`)}>
      <button onPointerDown=${v.planSheetDown} onPointerUp=${v.planSheetUp} aria-label=${full ? 'Show More Map' : 'Pull Up The Timeline'} aria-expanded=${full} style=${S('flex:none;border:0;background:none;padding:10px 0 6px;cursor:grab;touch-action:none;display:flex;justify-content:center')}><span style=${S('width:40px;height:5px;border-radius:3px;background:rgba(16,24,63,.22)')}></span></button>
      <div style=${S('flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 18px 6px')}>
        <div style=${S('font-size:21px;font-weight:900;font-style:italic;letter-spacing:-.5px;white-space:nowrap')}>Plan <span style=${S('font-weight:200;font-style:normal')}>A Day</span></div>
        <div style=${S('display:flex;align-items:center;gap:12px')}>
          ${v.planHas && v.planStopsN > 1 && html`<button onClick=${v.autoOrder} style=${S(`border:0;background:none;padding:6px 0;cursor:pointer;${MONO};font-size:10.5px;font-weight:700;color:#1B3DB8`)}>AUTO-ORDER ⟳</button>`}
          <button onClick=${v.openPicker} aria-label="Add Spots" style=${S('width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.7);background:linear-gradient(150deg,rgba(255,220,120,.95),rgba(255,196,37,.8));color:#10183F;font-size:20px;line-height:1;cursor:pointer;box-shadow:inset 0 2px 1px rgba(255,255,255,.85)')}>+</button>
        </div>
      </div>
      <div class="noscroll" style=${S(`flex:1;min-height:0;overflow-y:auto;padding:4px 16px ${B(v.planHas ? 190 : 120)};display:flex;flex-direction:column`)}>
        ${v.planEmpty ? html`
        <div style=${S('padding:22px 10px;text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center')}>
          <div style=${S('font-weight:900;font-style:italic;font-size:22px')}>No Stops <span style=${S('font-weight:200;font-style:normal')}>Yet</span></div>
          <div style=${S('font-size:13.5px;color:#4A5275;line-height:1.4')}>Tap + to add spots, or “+ Plan” on any place.</div>
          <button onClick=${v.openPicker} style=${S('margin-top:4px;height:44px;padding:0 18px;border-radius:999px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>+ Add Spots</button>
        </div>` : html`
        <label style=${S('display:flex;gap:8px;align-items:center;min-height:34px')}>
          <span style=${S(`${TC};position:relative;display:flex;justify-content:flex-end`)}><span style=${S(`height:26px;padding:0 7px;border-radius:999px;background:#10183F;color:#FFC425;${MONO};font-size:10px;font-weight:700;display:flex;align-items:center;white-space:nowrap`)}>${v.leaveClock}</span><input type="time" value=${v.planLeave} onChange=${v.onPlanLeave} aria-label="Leave At" style=${S('position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer')}/></span>
          <span style=${S(LC)}>${v.planFromFirst ? dot('#FF6B1A', '#fff', '▸') : dot('#10183F', '#FFC425', '⌂')}</span>
          <span style=${S('font-size:13.5px;font-weight:800')}>${v.planStartLabel}</span>
        </label>
        ${v.planRows.map((p, i) => html`
        <div key=${p.id} style=${S('display:flex;flex-direction:column')}>
          ${p.hasLeg ? leg('l', legBody(p.legBullets, p.legWalk, p.legText.replace(/^(Subway|Walk) · ~/, '').replace(/ · .*$/, '').toUpperCase() + (p.legWalk ? ' WALK' : ''), true), p.legOpen) : i > 0 && html`<div style=${S('height:8px')}></div>`}
          <div style=${S('display:flex;gap:8px;align-items:center')}>
            <span style=${S(`${TC};${MONO};font-size:10.5px;font-weight:700;color:#10183F`)}>${p.time}</span>
            <div class="lg" onClick=${p.onClick} style=${S(`${GL};flex:1;min-width:0;border-radius:22px;padding:8px 8px 8px 8px;display:flex;align-items:center;gap:10px;cursor:pointer`)}>
              <span style=${S('position:relative;flex:none')}><span style=${S(`position:relative;overflow:hidden;width:46px;height:46px;border-radius:15px;background:${p.catBg};color:${p.catFg};display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 1px rgba(255,255,255,.35)`)}>${CatIcon(p.catEmoji, 20, p.catFg)}${Photo(p.img)}</span><span style=${S(`position:absolute;top:-5px;left:-5px;width:21px;height:21px;border-radius:50%;background:#10183F;color:#FFC425;border:2px solid #FFFFFF;${MONO};font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center`)}>${p.num}</span></span>
              <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}>
                <span style=${S('font-size:15px;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${p.name}</span>
                <span style=${S('display:flex;align-items:center;gap:6px;min-width:0')}>${mono(p.area.toUpperCase(), '#4A5275', 'font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0')}<button onClick=${p.cycleStay} aria-label=${'Stay ' + p.stayLbl.toLowerCase() + ', tap to change'} style=${S(`flex:none;height:22px;padding:0 7px;border-radius:999px;border:0;background:rgba(255,196,37,.3);color:#10183F;${MONO};font-size:9.5px;font-weight:700;cursor:pointer`)}>STAY ${p.stayLbl}</button></span>
              </span>
              <span style=${S('display:flex;flex-direction:column;gap:3px;flex:none')}>
                <span style=${S('display:flex;gap:3px')}>
                  <button onClick=${p.up} aria-label="Move up" style=${S(`width:26px;height:24px;border-radius:999px;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:900;font-size:11px;cursor:pointer;opacity:${p.upOp}`)}>↑</button>
                  <button onClick=${p.down} aria-label="Move down" style=${S(`width:26px;height:24px;border-radius:999px;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:900;font-size:11px;cursor:pointer;opacity:${p.downOp}`)}>↓</button>
                </span>
                <button onClick=${p.remove} aria-label="Remove" style=${S('height:22px;border-radius:999px;border:0;background:#FFE2DF;color:#E8242C;font-weight:900;font-size:10.5px;cursor:pointer')}>✕</button>
              </span>
            </div>
          </div>
        </div>`)}
        ${v.planBack && leg('back', legBody(v.planBack.bullets, v.planBack.walk, v.planBack.min.toUpperCase() + (v.planBack.walk ? ' WALK' : ''), false), null)}
        <div style=${S('display:flex;gap:8px;align-items:center;min-height:34px;margin-top:4px')}>
          <span style=${S(`${TC};${MONO};font-size:10.5px;font-weight:700;color:#4A5275`)}>${v.endClock}</span>
          <span style=${S(LC)}>${dot('rgba(16,24,63,.12)', '#10183F', v.planBack ? '⌂' : '✓')}</span>
          <span style=${S('font-size:13.5px;font-weight:700;color:#4A5275')}>${v.planEndLabel}</span>
        </div>
        <div style=${S('display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:0 4px')}>
          ${mono('TIMES ARE ESTIMATES · TAP A LEG FOR LIVE TIMES', '#6A7090', 'font-size:9px;letter-spacing:.4px')}
          <button onClick=${v.clearPlan} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:12.5px;cursor:pointer;padding:4px')}>Clear</button>
        </div>`}
      </div>
    </section>
    <div aria-hidden="true" style=${S(`position:absolute;left:0;right:0;bottom:0;height:${B(v.planHas ? 170 : 110)};z-index:660;pointer-events:none;background:linear-gradient(rgba(255,245,228,0),rgba(255,245,228,.95) 40%)`)}></div>
    ${v.planHas && html`
    <div style=${S(`position:absolute;left:16px;right:16px;bottom:${B(104)};z-index:700;display:flex`)}>
      <button onClick=${v.startRoute} disabled=${v.planStopsN < 2 && v.planFromFirst} style=${S(`flex:1;height:56px;border-radius:999px;border:0;background:#10183F;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 22px;font-size:16px;font-weight:900;font-style:italic;cursor:pointer;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25),0 12px 26px rgba(16,24,63,.25);opacity:${v.planStopsN < 2 && v.planFromFirst ? .5 : 1}`)}>Start Route In Google Maps
        <span style=${S('width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#FFB27F,#FF6B1A 58%,#E8561A);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 1px rgba(255,255,255,.55)')}>${Ico('M5 12h14M13 6l6 6-6 6', 18, '#fff', 2.6)}</span></button>
    </div>`}
  </div>`;
}

function PlaceCard(v) {
  // V5 mockup: a big frosted sheet with a two-weight name, a glass row of quick numbers, round glass action
  // bubbles and a Get There pill with an orange arrow button.
  const sel = v.sel, onMap = v.onMapTab;
  const words = String(sel.name || '').trim().split(/\s+/), split = words.length > 1 && sel.name.length > 8;
  const lab = t => html`<span style=${S('font-size:11px;font-weight:700;color:#4A5275;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${t}</span>`;
  const big = (n, unit) => html`<span style=${S('font-size:30px;font-weight:200;letter-spacing:-1.4px;line-height:1;white-space:nowrap')}>${n}${unit && html`<span style=${S('font-size:12px;font-weight:800;letter-spacing:0;margin-left:4px')}>${unit}</span>`}</span>`;
  const cell = 'min-width:0;display:flex;flex-direction:column;gap:5px;padding:0 12px';
  const bubble = (go, label, d, col, on) => html`
    <button onClick=${go} aria-label=${label} aria-pressed=${on ? 'true' : null} style=${S('flex:1;min-width:0;border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;color:#10183F')}>
      <span class="lg" style=${S(`width:54px;height:54px;border-radius:50%;${on ? `background:${on.bg};color:${on.fg};border:1px solid rgba(255,255,255,.6);box-shadow:inset 0 2px 1px rgba(255,255,255,.45),0 10px 22px rgba(16,24,63,.18)` : GL + ';color:' + col};display:flex;align-items:center;justify-content:center`)}>${Ico(d, 21, 'currentColor', 2.4)}</span>
      <span style=${S('max-width:100%;font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${label}</span>
    </button>`;
  const inPlan = sel.planBg !== '#fff', visited = sel.visBg !== '#fff';
  return html`
  ${onMap && html`<button class="lg" onClick=${v.closeSel} aria-label="Back To Map" style=${S(`position:absolute;top:${T(56)};left:16px;z-index:900;width:46px;height:46px;border-radius:50%;${GL};color:#10183F;display:flex;align-items:center;justify-content:center;cursor:pointer`)}>${Ico(BACK, 20, 'currentColor', 2.4)}</button>`}
  ${onMap && html`<button class="lg" onClick=${v.editSel} aria-label="Edit Spot" style=${S(`position:absolute;top:${T(56)};right:16px;z-index:900;width:46px;height:46px;border-radius:50%;${GL};color:#10183F;display:flex;align-items:center;justify-content:center;cursor:pointer`)}>${Ico('M4 20h4L19 9l-4-4L4 16z', 18, 'currentColor', 2.2)}</button>`}
  <section aria-label=${sel.name} class="noscroll" style=${S(`position:absolute;left:0;right:0;bottom:${onMap ? '0px' : B(96)};z-index:900;${GL2};border-radius:${onMap ? '42px 42px 0 0' : '40px'};${onMap ? 'border-bottom:0;' : 'margin:0 8px;'}padding:12px 20px ${onMap ? B(24) : '20px'};display:flex;flex-direction:column;gap:15px;max-height:calc(100% - var(--st) - ${onMap ? 70 : 150}px);overflow-y:auto`)}>
    ${Grab()}
    ${sel.img && html`
    <div style=${S(`position:relative;flex:none;height:170px;border-radius:26px;overflow:hidden;background:${sel.catBg};box-shadow:0 10px 26px rgba(16,24,63,.16)`)}>
      <span aria-hidden="true" style=${S('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.5')}>${CatIcon(sel.catEmoji, 44, sel.catFg)}</span>
      ${Photo(sel.img, sel.name)}
      <div style=${S('position:absolute;left:10px;right:10px;bottom:10px;display:flex;align-items:center;gap:6px')}>
        ${!sel.ownPhoto && html`<span style=${S('font-size:10.5px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)')}>Photo From Google Maps</span>`}
        <span style=${S('flex:1')}></span>
        <label class=${sel.photoBusy ? 'ai-busy lg' : 'lg'} style=${S(`position:relative;display:inline-flex;align-items:center;height:32px;padding:0 12px;border-radius:999px;${GL};color:#10183F;font-size:12px;font-weight:800;cursor:pointer`)}>${sel.photoBusy ? 'Saving…' : sel.ownPhoto ? 'Change Photo' : 'Use My Photo'}<input type="file" accept="image/*" onChange=${sel.onPhoto} disabled=${sel.photoBusy} style=${S('position:absolute;width:1px;height:1px;opacity:0;pointer-events:none')}/></label>
        ${sel.ownPhoto && !sel.photoBusy && html`<button class="lg" onClick=${sel.removePhoto} aria-label="Remove Photo" style=${S(`width:32px;height:32px;border-radius:50%;${GL};color:#E8242C;font-weight:800;font-size:13px;cursor:pointer`)}>✕</button>`}
      </div>
    </div>`}
    <div style=${S('display:flex;flex-direction:column;gap:10px')}>
      <div style=${S('display:flex;align-items:center;gap:8px;min-width:0')}>
        <span style=${S(`flex:none;display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:999px;background:${sel.catBg};color:${sel.catFg};font-size:12px;font-weight:800`)}>${sel.catName}</span>
        <span style=${S('flex:1;min-width:0;font-size:12px;font-weight:700;color:#4A5275;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${sel.area}${sel.srcBadge ? ' · ' + sel.srcBadge : ''}</span>
        ${!onMap && html`<button onClick=${v.closeSel} aria-label="Close" style=${S('flex:none;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.95);background:rgba(255,255,255,.6);color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>✕</button>`}
      </div>
      <h1 style=${S('margin:0;font-size:48px;line-height:.9;font-weight:900;font-style:italic;font-stretch:100%;letter-spacing:-2px;text-wrap:balance;overflow-wrap:anywhere')}>${split ? html`${words.slice(0, -1).join(' ')}<br/><span style=${S('font-weight:200;font-style:normal;letter-spacing:-1.6px')}>${words[words.length - 1]}</span>` : sel.name}</h1>
    </div>
    <div class="lg" style=${S(`${GL};border-radius:26px;padding:14px 4px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))`)}>
      ${sel.homeMin ? html`<div style=${S(cell)}>${big(sel.homeMin > 99 ? Math.round(sel.homeMin / 60) : sel.homeMin, sel.homeMin > 99 ? 'hr' : 'min')}${lab('From Home')}</div>`
        : html`<button onClick=${v.openRoute} style=${S(`${cell};border:0;background:none;text-align:left;cursor:pointer;color:#10183F;font-family:inherit`)}><span style=${S('font-size:15px;font-weight:900;font-style:italic;line-height:1.05')}>Set<br/>Home</span>${lab('Travel Times')}</button>`}
      <div style=${S(`${cell};border-left:1px solid rgba(16,24,63,.1)`)}>${big(sel.hasPrice ? sel.price : '—')}${lab('Price')}</div>
      <div style=${S(`${cell};border-left:1px solid rgba(16,24,63,.1)`)}>
        ${sel.hasStation ? html`<span style=${S('display:flex;align-items:center;gap:5px;min-width:0')}><span style=${S('display:flex;gap:2px;flex:none')}>${sel.stRoutes.slice(0, 2).map(Bul)}</span><span style=${S('font-size:19px;font-weight:200;white-space:nowrap')}>${String(sel.stWalk || '').replace(/[^0-9]/g, '') || '—'}<span style=${S('font-size:11px;font-weight:800;margin-left:3px')}>min</span></span></span>${lab(sel.stName)}` : html`${big('—')}${lab('No Subway Near')}`}
      </div>
    </div>
    ${sel.hasNote && Note(sel.note, 'padding:2px 2px 0;font-size:14px;line-height:1.45;font-weight:500;color:#3C4466')}
    <div style=${S('display:flex;gap:4px')}>
      ${sel.hasUrl && bubble(v.openSource, String(sel.openLabel || 'Open').replace(/^Open\s+/, ''), ARROW_NE, sel.srcBg && sel.srcBg !== '#fff' ? sel.srcBg : '#10183F')}
      ${bubble(v.togglePlanSel, inPlan ? 'In Plan' : 'Plan', 'M12 5v14M5 12h14', '#FF6B1A', inPlan && { bg: sel.planBg, fg: sel.planFg })}
      ${bubble(v.toggleVisited, 'Visited', 'M5 12l5 5 9-10', '#1F9D6B', visited && { bg: sel.visBg, fg: sel.visFg })}
      ${bubble(v.addToListSel, 'To List', 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01', '#7A4FD6')}
      ${!sel.img && html`
      <label style=${S('position:relative;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;color:#10183F')}>
        <span class=${sel.photoBusy ? 'lg ai-busy' : 'lg'} style=${S(`width:54px;height:54px;border-radius:50%;${GL};color:#F45FA0;display:flex;align-items:center;justify-content:center`)}>${Ico('M4 8h3l2-3h6l2 3h3v11H4z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 21, 'currentColor', 2.2)}</span>
        <span style=${S('font-size:11px;font-weight:800;white-space:nowrap')}>${sel.photoBusy ? 'Saving…' : 'Photo'}</span>
        <input type="file" accept="image/*" aria-label="Add A Photo Of This Spot" onChange=${sel.onPhoto} disabled=${sel.photoBusy} style=${S('position:absolute;width:1px;height:1px;opacity:0;pointer-events:none')}/>
      </label>`}
      ${!onMap && bubble(v.editSel, 'Edit', 'M4 20h4L19 9l-4-4L4 16z', '#1B3DB8')}
    </div>
    <div style=${S('display:flex;align-items:center')}>
      <button class="lg" onClick=${v.openRoute} style=${S('flex:1;height:58px;border-radius:999px;border:0;background:#10183F;color:#ffffff;display:flex;align-items:center;padding-left:24px;font-size:16px;font-weight:800;cursor:pointer;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25),0 12px 26px rgba(16,24,63,.25)')}>Get There</button>
      <button onClick=${v.openRoute} aria-label="Get There" style=${S('margin-left:8px;width:58px;height:58px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.55);background:radial-gradient(circle at 35% 28%,#FFB27F,#FF6B1A 58%,#E8561A);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 3px 1px rgba(255,255,255,.55),0 12px 26px rgba(255,107,26,.42)')}>${Ico('M5 12h14M13 6l6 6-6 6', 20, 'currentColor', 2.4)}</button>
    </div>
  </section>`;
}

function RouteSheet(v) {
  return html`
  <div class="lg" data-screen-label="Get There" style=${S(`position:absolute;left:0;right:0;bottom:0;z-index:980;max-height:60%;${GL2};border-bottom:0;border-radius:34px 34px 0 0;display:flex;flex-direction:column;padding-top:10px`)}>
    ${Grab()}
    <div style=${S('flex:none;padding:10px 18px 10px;display:flex;flex-direction:column;gap:10px')}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        <div style=${S('min-width:0')}><div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:#1B3DB8;line-height:1')}>Get There</div><div style=${S('font-size:13px;font-weight:700;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>To ${v.routeDest}</div></div>
        <button onClick=${v.closeRoute} aria-label="Close" style=${S('flex:none;width:34px;height:34px;border-radius:50%;border:0;background:#fff;color:#10183F;font-weight:800;font-size:15px;cursor:pointer')}>✕</button>
      </div>
      <div style=${S('display:flex;gap:6px;flex-wrap:wrap')}>
        ${v.originChips.map((c, i) => html`
        <button key=${i} onClick=${c.onClick} style=${S(`height:34px;padding:0 12px;border-radius:999px;border:2px solid ${c.border};background:${c.bg};color:${c.fg};font-weight:700;font-size:12.5px;cursor:pointer`)}>${c.label}</button>`)}
      </div>
      ${v.originIsSpot && html`
      <select id="route-spot" value=${v.routeSpotVal} onChange=${v.onRouteSpot} style=${S('height:42px;border-radius:12px;border:1.5px solid rgba(16,24,63,.14);background:#fff;padding:0 10px;font-family:inherit;font-size:14px;font-weight:600;color:#10183F')}>
        ${v.spotOptions.map(o => html`<option key=${o.id} value=${o.id}>${o.name}</option>`)}
      </select>`}
    </div>
    <div class="noscroll" style=${S(`flex:1;min-height:0;overflow-y:auto;padding:0 18px ${B(22)};display:flex;flex-direction:column;gap:10px`)}>
      ${v.routeHasMsg && html`
      <div style=${S('background:#fff;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px')}>
        <div style=${S('font-size:14px;font-weight:700')}>${v.routeMsg}</div>
        ${v.routeNeedsHere && html`<button onClick=${v.setHereRoute} style=${S('height:42px;border-radius:12px;border:0;background:#FF6B1A;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Tap Where I Am On The Map</button>`}
        ${v.routeNeedsHome && html`<button onClick=${v.setHome} style=${S('height:42px;border-radius:12px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Set Home On The Map</button>`}
      </div>`}
      ${v.routeOpts.map((o, i) => html`
      <div key=${i} onClick=${o.onPick} style=${S(`background:#fff;border:2.5px solid ${o.border};border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:10px;cursor:pointer`)}>
        <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
          <div style=${S('display:flex;align-items:baseline;gap:8px')}><span style=${S(`font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:${o.color}`)}>${o.mins}</span><span style=${S('font-size:14px;font-weight:800')}>${o.title}</span></div>
          ${o.best && html`<span style=${S('font-size:11px;font-weight:800;background:#FFC425;color:#10183F;padding:4px 9px;border-radius:999px')}>Fastest</span>`}
        </div>
        <div style=${S('display:flex;flex-direction:column;gap:8px')}>
          ${o.steps.map((st, j) => html`
          <div key=${j} style=${S('display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600')}>
            <span style=${S('min-width:22px;display:flex;gap:3px;justify-content:center;flex:none')}>
              <span style=${S(`width:12px;height:12px;border-radius:50%;border:2.5px dotted #10183F;display:${st.walkDisp}`)}></span>
              <span style=${S(`width:12px;height:12px;transform:rotate(45deg);background:#10183F;display:${st.xferDisp}`)}></span>
              ${st.bullets.map(Bul)}
            </span>
            <span style=${S('flex:1;min-width:0')}>${st.text}</span><span style=${S('font-weight:800;flex:none')}>${st.min}</span>
          </div>`)}
        </div>
        <button onClick=${o.onGoogle} style=${S('height:40px;border-radius:12px;border:2px solid #1B3DB8;background:#fff;color:#1B3DB8;font-weight:800;font-size:13px;cursor:pointer')}>${o.gLabel}</button>
      </div>`)}
      <div style=${S('font-size:11px;color:#6A7090;text-align:center')}>Estimates From Distance & Nearby Lines — Google Maps Has Live Times.</div>
    </div>
  </div>`;
}

function Picker(v) {
  return html`
  <div style=${S('position:absolute;inset:0;z-index:1050;background:rgba(16,24,63,.26);display:flex;flex-direction:column;justify-content:flex-end')}>
    <div class="lg" style=${S(`max-height:78%;${GL2};border-bottom:0;border-radius:34px 34px 0 0;display:flex;flex-direction:column;padding-top:10px`)}>
      ${Grab()}
      <div style=${S('flex:none;padding:10px 18px 10px;display:flex;align-items:center;justify-content:space-between')}>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:#1B3DB8')}>Add To Plan</div>
        <button onClick=${v.closePicker} style=${S('height:38px;padding:0 16px;border-radius:999px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Done</button>
      </div>
      <div class="noscroll" style=${S(`flex:1;min-height:0;overflow-y:auto;padding:0 16px ${B(30)};display:flex;flex-direction:column;gap:8px`)}>
        ${v.pickerRows.map((r, i) => html`
        <button key=${i} onClick=${r.onClick} style=${S(`display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:2px solid ${r.ring};border-radius:18px;padding:10px 12px;cursor:pointer;color:#10183F`)}>
          <span style=${S(`width:34px;height:34px;border-radius:12px;background:${r.catBg};flex:none;display:flex;align-items:center;justify-content:center`)}>${CatIcon(r.emoji, 17, r.catBg === '#FFC425' ? '#10183F' : '#fff')}</span>
          <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:800;font-size:15px')}>${r.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.catName} · ${r.area}</span></span>
          <span style=${S(`width:28px;height:28px;border-radius:50%;flex:none;background:${r.chkBg};color:#fff;border:1.5px solid rgba(16,24,63,.14);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px`)}>${r.chk}</span>
        </button>`)}
      </div>
    </div>
  </div>`;
}


const PEN = 'height:44px;border-radius:14px;font-weight:800;font-size:13.5px;cursor:pointer';
const Sheet = (title, close, body, closeLabel, z) => html`
  <div onClick=${close} style=${S(`position:absolute;inset:0;z-index:${z || 1050};background:rgba(16,24,63,.26);display:flex;flex-direction:column;justify-content:flex-end`)}>
    <div class="lg" onClick=${e => e.stopPropagation()} style=${S(`max-height:86%;${GL2};border-bottom:0;border-radius:34px 34px 0 0;display:flex;flex-direction:column;padding-top:10px`)}>
      ${Grab()}
      <div style=${S('flex:none;padding:10px 18px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        <div style=${S('min-width:0;font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;line-height:1.05;color:#1B3DB8')}>${title}</div>
        <button onClick=${close} style=${S('flex:none;height:38px;padding:0 16px;border-radius:999px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>${closeLabel || 'Done'}</button>
      </div>
      <div class="noscroll" style=${S(`flex:1;min-height:0;overflow-y:auto;padding:0 16px ${B(30)};display:flex;flex-direction:column;gap:12px`)}>${body}</div>
    </div>
  </div>`;
const Msg = (title, text, btn, onBtn) => html`
  <div style=${S('background:#fff;border-radius:22px;padding:22px;text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center')}>
    <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:20px;color:#1B3DB8')}>${title}</div>
    <div style=${S('font-size:13px;line-height:1.4;color:#4A5275')}>${text}</div>
    ${btn && html`<button onClick=${onBtn} style=${S('margin-top:4px;height:42px;padding:0 18px;border:0;border-radius:999px;background:#FF6B1A;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>${btn}</button>`}
  </div>`;

// Lists: an Apple Wallet–style stack of colored list cards (the newest is the full card in front; tap any card).
// Opening a list lifts its card to the top as the header (stops, travel time, dates, countdown, who's here now),
// then the day switcher and the stops; the other lists tuck away as card edges at the bottom.
const SHEEN = 'background-image:linear-gradient(115deg,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 32%,rgba(255,255,255,0) 62%,rgba(255,255,255,.2) 100%),linear-gradient(rgba(255,255,255,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.13) 1px,transparent 1px);background-size:auto,22px 22px,22px 22px';
const WCARD = (bg, extra) => `position:relative;border-radius:26px;background:${bg};box-shadow:inset 0 1.5px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,0,0,.08),0 -6px 18px rgba(16,24,63,.12),0 16px 34px rgba(16,24,63,.18);overflow:hidden;${extra || ''}`;
const wMono = (t, fg, extra) => html`<span style=${S(`${MONO};font-size:10px;font-weight:700;letter-spacing:.8px;color:${fg === '#fff' ? 'rgba(255,255,255,.85)' : 'rgba(16,24,63,.7)'};${extra || ''}`)}>${t}</span>`;
const wIcon = (fg, img, initial) => html`<span style=${S(`position:relative;overflow:hidden;width:34px;height:34px;flex:none;border-radius:11px;background:${fg === '#fff' ? 'rgba(255,255,255,.22)' : 'rgba(16,24,63,.1)'};border:1px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;font-weight:900;font-style:italic;font-size:16px;color:${fg}`)}>${initial}${Photo(img)}</span>`;
const wName = (name, size) => { const w = String(name).trim().split(/\s+/); return html`<span style=${S(`flex:1;min-width:0;font-size:${size || 20}px;letter-spacing:-.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}><span style=${S('font-weight:900;font-style:italic')}>${w[0]}</span> <span style=${S('font-weight:200')}>${w.slice(1).join(' ')}</span></span>`; };
const wPeople = (list, fg) => html`<span style=${S('display:flex;padding-left:8px')}>${list.map(a => html`<span key=${a.key} style=${S('display:flex;margin-left:-8px')}>${Avatar(a.src, a.initial, 28, a.bg, `border:2px solid ${fg === '#fff' ? 'rgba(255,255,255,.9)' : '#FFFFFF'}`)}</span>`)}</span>`;

function ListsScreen(v) {
  const t = v.trip, mapOn = v.tripMapOn;
  const glassBtn = (label, onClick, icon, aria) => html`<button class="lg" onClick=${onClick} aria-label=${aria || label} style=${S(`pointer-events:auto;height:40px;padding:0 14px 0 ${icon ? 10 : 14}px;border-radius:999px;${GL};color:#10183F;display:flex;align-items:center;gap:5px;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap`)}>${icon}${label}</button>`;
  return html`
  <div data-screen-label="Lists" style=${S(`position:absolute;inset:0;display:${v.listsDisplay}`)}>
    <div ref=${v.tripMapRef} style=${S(`position:absolute;inset:0;z-index:0;isolation:isolate;visibility:${mapOn ? 'visible' : 'hidden'}`)}></div>
    ${v.listsIndex ? html`
    <div class="noscroll" style=${S(`position:absolute;inset:0;z-index:5;background:var(--bgfx);overflow-y:auto;padding:${T(56)} 16px ${B(130)};display:flex;flex-direction:column;gap:12px`)}>
      <div style=${S('display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:0 4px')}>
        <div style=${S('min-width:0')}>
          <span style=${S(`${MONO};font-size:10.5px;font-weight:700;letter-spacing:1.1px;color:#4A5275`)}>WALLET · ${v.listCards.length} ${v.listCards.length === 1 ? 'LIST' : 'LISTS'}</span>
          <div style=${S('font-weight:900;font-style:italic;font-size:38px;line-height:1.02;letter-spacing:-1.5px;color:#10183F;white-space:nowrap')}>My <span style=${S('font-weight:200;font-style:normal')}>Lists</span></div>
        </div>
        ${v.listsSignedIn && !v.listsMissing && html`<button class="lg" onClick=${v.openNewTrip} aria-label="New List" style=${S(`${GL};width:48px;height:48px;flex:none;border-radius:50%;color:#FF6B1A;display:flex;align-items:center;justify-content:center;cursor:pointer`)}>${Ico('M12 5v14M5 12h14', 22, 'currentColor', 2.8)}</button>`}
      </div>
      ${v.listsLocal && Msg('Sign In To Use Lists', 'Lists Live In Your Account So You Can Share Them With Friends.')}
      ${v.listsMissing && Msg('One Quick Setup Step', 'Lists Need Their Database Tables. Run supabase/lists.sql Once In Supabase → SQL Editor, Then Come Back.', 'Check Again', v.retryLists)}
      ${v.listsLoading && html`<div role="status" style=${S('text-align:center;font-weight:700;color:#4A5275;padding:20px')}>Loading Your Lists…</div>`}
      ${v.listsError && Msg('Can’t Load Lists Right Now', 'Check Your Connection And Try Again.', 'Try Again', v.retryLists)}
      ${v.listsEmpty && Msg('No Lists Yet', 'Make One For A Friend’s Visit, A Birthday Or A Weekend — Then Invite Them To Add Spots Too.')}
      ${v.listCards.length > 0 && html`
      <div style=${S('display:flex;flex-direction:column;padding-top:4px')}>
        ${[...v.listCards].reverse().map((c, i, arr) => { const front = i === arr.length - 1;
          return html`
        <button key=${c.id} class="press" onClick=${c.onClick} aria-label=${'Open ' + c.name} style=${S(`${WCARD(c.wbg, `z-index:${i + 1};margin-bottom:${front ? 0 : -132}px;height:${front ? 'auto' : '196px'};min-height:196px`)};border:0;padding:0;text-align:left;color:${c.wfg};cursor:pointer;display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;width:100%`)}>
          <span aria-hidden="true" style=${S(`position:absolute;inset:0;${SHEEN}`)}></span>
          <span style=${S('position:relative;display:flex;flex-direction:column;gap:12px;padding:14px 16px 16px')}>
            <span style=${S('display:flex;align-items:center;gap:10px;min-height:36px')}>${wIcon(c.wfg, c.img, c.initial)}${wName(c.name)}<span style=${S('display:flex;flex-direction:column;align-items:flex-end;flex:none')}>${c.spots != null ? wMono(c.spots + (c.spots === 1 ? ' SPOT' : ' SPOTS'), c.wfg) : wMono('MAP ONLY', c.wfg)}${c.days > 0 && wMono(c.days + (c.days === 1 ? ' DAY' : ' DAYS'), c.wfg)}</span></span>
            ${front && html`
            <span style=${S('display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:18px')}>
              <span style=${S('display:flex;flex-direction:column;min-width:0')}>${wMono(c.range ? 'DATES' : 'MADE BY', c.wfg)}<span style=${S('font-size:24px;font-weight:200;letter-spacing:-1px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${c.range || c.who}</span></span>
              ${c.cd && html`<span style=${S('display:flex;flex-direction:column;align-items:flex-end;flex:none')}>${wMono(c.cd.top, c.wfg)}<span style=${S('font-size:24px;font-weight:200;letter-spacing:-1px;line-height:1.15;white-space:nowrap')}>${c.cd.big}</span></span>`}
            </span>
            <span style=${S(`display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:10px;border-top:1px dashed ${c.wfg === '#fff' ? 'rgba(255,255,255,.5)' : 'rgba(16,24,63,.25)'}`)}>
              ${wPeople(c.ppl, c.wfg)}${c.tagMono && wMono(c.tagMono, c.wfg, 'text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0')}
            </span>`}
          </span>
        </button>`; })}
      </div>`}
      ${v.listCards[0] && v.listCards[0].next && html`
      <div style=${S('display:flex;flex-direction:column;gap:8px;margin-top:6px')}>
        <div style=${S('display:flex;justify-content:space-between;padding:0 4px')}><span style=${S(`${MONO};font-size:10.5px;font-weight:700;letter-spacing:1px;color:#4A5275;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>UP NEXT · ${v.listCards[0].name.toUpperCase()}</span><button onClick=${v.listCards[0].onClick} style=${S(`border:0;background:none;padding:0;cursor:pointer;${MONO};font-size:10.5px;font-weight:700;color:#1B3DB8;flex:none`)}>OPEN →</button></div>
        <button class="lg" onClick=${v.listCards[0].onClick} style=${S(`${GL};border-radius:22px;padding:8px 12px 8px 8px;display:flex;align-items:center;gap:10px;color:#10183F;text-align:left;cursor:pointer`)}>
          <span style=${S('position:relative;overflow:hidden;width:44px;height:44px;flex:none;border-radius:14px;background:linear-gradient(140deg,#FFE38F,#FFC425)')}>${Photo(v.listCards[0].next.img)}</span>
          <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${v.listCards[0].next.name}</span><span style=${S(`${MONO};font-size:9.5px;font-weight:700;color:#4A5275`)}>${v.listCards[0].next.sub}</span></span>
          ${Ico(ARROW_NE, 16, '#1B3DB8', 2.4)}
        </button>
      </div>`}
    </div>` : mapOn ? html`
    <div style=${S(`position:absolute;top:${T(56)};left:16px;right:16px;z-index:600;display:flex;flex-direction:column;gap:10px;pointer-events:none`)}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
        ${t.stopMap ? glassBtn('List', t.closeStopMap, Ico(BACK, 16, 'currentColor', 2.6), 'Back To The List') : glassBtn('Wallet', t.back, Ico(BACK, 16, 'currentColor', 2.6), 'All Lists')}
        ${t.hasToggle && !t.stopMap && html`
        <div role="tablist" class="lg" style=${S(`pointer-events:auto;display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:999px;${GL}`)}>
          <button role="tab" aria-selected=${t.showList} onClick=${t.viewList} style=${S('height:32px;padding:0 12px;border:0;border-radius:999px;background:transparent;color:#10183F;font-weight:700;font-size:12.5px;cursor:pointer')}>This List</button>
          <button role="tab" aria-selected=${t.showMap} onClick=${t.viewMap} style=${S('height:32px;padding:0 12px;border:0;border-radius:999px;background:#10183F;color:#fff;font-weight:800;font-size:12.5px;cursor:pointer;white-space:nowrap')}>${t.mapTabLabel}</button>
        </div>`}
      </div>
      <div class="lg" style=${S(`align-self:flex-start;pointer-events:auto;${GL};border-radius:18px;padding:9px 13px;display:flex;flex-direction:column;gap:2px;max-width:100%`)}>
        <span style=${S('font-weight:900;font-style:italic;font-size:16px')}>${t.name}</span>
        <span style=${S('font-family:var(--mono);font-size:10.5px;font-weight:700;color:#3A4470;text-transform:uppercase')}>${t.stopMap ? t.metaMono : t.mapNote}</span>
      </div>
    </div>` : html`
    <section aria-label=${t.name} class="noscroll" style=${S(`position:absolute;inset:0;z-index:5;background:var(--bgfx);overflow-y:auto;padding:${T(56)} 16px ${B(t.others.length ? 170 : 130)}`)}><div style=${S('display:flex;flex-direction:column;gap:12px')}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
        ${glassBtn('Wallet', t.back, Ico(BACK, 16, 'currentColor', 2.6), 'All Lists')}
        <div style=${S('display:flex;gap:6px')}>
          ${glassBtn('Map', t.openStopMap, Ico('M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z M9 4v14 M15 6v14', 15, 'currentColor', 2.2), 'Show The List On A Map')}
          ${t.isOwner && glassBtn('Invite', t.openShare, Ico('M4 12v7h16v-7 M12 3v12 M7 8l5-5 5 5', 15, 'currentColor', 2.4), 'Share And Invite')}
        </div>
      </div>
      ${t.hasToggle && html`
      <div role="tablist" class="lg" style=${S(`display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:999px;${GL}`)}>
        <button role="tab" aria-selected=${true} onClick=${t.viewList} style=${S('height:34px;border:0;border-radius:999px;background:#10183F;color:#fff;font-weight:800;font-size:13px;cursor:pointer')}>This List</button>
        <button role="tab" aria-selected=${false} onClick=${t.viewMap} style=${S('height:34px;border:0;border-radius:999px;background:transparent;color:#10183F;font-weight:700;font-size:13px;cursor:pointer')}>${t.mapTabLabel}</button>
      </div>`}
      <div style=${S(WCARD(t.wbg, `color:${t.wfg}`))}>
        <span aria-hidden="true" style=${S(`position:absolute;inset:0;${SHEEN}`)}></span>
        <div style=${S('position:relative;padding:14px 16px 14px;display:flex;flex-direction:column;gap:12px')}>
          <div style=${S('display:flex;align-items:center;gap:10px')}>${wIcon(t.wfg, t.img, (t.name.replace(/^the\s+/i, '')[0] || '★'))}${wName(t.name)}
            <span style=${S('display:flex;flex-direction:column;align-items:flex-end;flex:none')}>${wMono(t.spotsTop, t.wfg)}${t.spotsBot && wMono(t.spotsBot, t.wfg)}</span>
            ${t.canEdit && html`<button onClick=${t.openEdit} aria-label="Edit list details" style=${S(`width:32px;height:32px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:${t.wfg === '#fff' ? 'rgba(255,255,255,.2)' : 'rgba(16,24,63,.08)'};color:${t.wfg};display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0`)}>${Ico('M4 20h4L19 9l-4-4L4 16z', 14, 'currentColor', 2.3)}</button>`}
          </div>
          <div style=${S('display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:6px')}>
            <div style=${S('display:flex;align-items:baseline;min-width:0')}><span style=${S('font-size:52px;font-weight:200;letter-spacing:-2.5px;line-height:.85')}>${t.bigN}</span><span style=${S('font-size:15px;font-weight:300;margin-left:5px;white-space:nowrap')}>${t.bigLbl}</span></div>
            ${t.travel && wMono(t.travel, t.wfg, 'flex:none')}
          </div>
          <div style=${S(`display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:10px;border-top:1px dashed ${t.wfg === '#fff' ? 'rgba(255,255,255,.5)' : 'rgba(16,24,63,.25)'}`)}>
            ${wPeople(t.avatars, t.wfg)}
            ${t.here && html`<span role="status" style=${S(`height:22px;padding:0 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#1F9D6B;${MONO};font-size:9.5px;font-weight:700;display:flex;align-items:center;gap:5px;white-space:nowrap`)}><span style=${S('width:6px;height:6px;border-radius:50%;background:#1F9D6B;box-shadow:0 0 0 3px rgba(31,157,107,.2)')}></span>${t.here}</span>`}
            ${(t.range || t.cd) && wMono([t.range, t.cd ? t.cd.big.toUpperCase() : ''].filter(Boolean).join(' · '), t.wfg, 'text-align:right;white-space:nowrap')}
          </div>
        </div>
      </div>
      ${t.syncNote && html`<span role="status" style=${S('font-size:11px;font-weight:700;color:#5A6080;padding:0 6px;margin-top:-4px')}>${t.syncNote}</span>`}
      ${t.dayChips.length > 0 && html`
      <div role="tablist" aria-label="Days" class="noscroll lg" style=${S(`${GL};display:flex;gap:4px;padding:4px;border-radius:999px;overflow-x:auto`)}>
        ${t.dayChips.map(c => html`<button key=${c.key} role="tab" aria-selected=${c.on} onClick=${c.onClick} style=${S(`flex:1 0 auto;min-width:64px;height:46px;padding:0 10px;border-radius:999px;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;${c.on ? 'background:#10183F;color:#fff;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25)' : `background:transparent;color:${c.pink ? '#F45FA0' : '#10183F'}`}`)}><span style=${S(`${MONO};font-size:9px;font-weight:700;color:${c.on ? '#FFC425' : c.pink ? '#F45FA0' : '#4A5275'}`)}>${c.date}</span><span style=${S('font-size:13px;font-weight:800')}>${c.short}</span></button>`)}
      </div>`}
      ${t.empty && Msg('Nothing On The List Yet', t.canEdit ? 'Pull Spots From Your Map, Or Add A Brand-New One You Saw Online.' : 'Spots Will Show Up Here As They’re Added.')}
      ${t.sections.map(sec => { const waiting = /^Not On/.test(sec.title || ''), n = (sec.rows || []).length;
        return html`
      <div key=${sec.key} style=${S('display:flex;flex-direction:column;gap:0')}>
        ${sec.hasTitle && html`
        <div style=${S(`position:relative;z-index:1;border-radius:28px;padding:14px 16px;margin-bottom:-14px;padding-bottom:28px;${waiting ? 'background:linear-gradient(150deg,rgba(248,140,186,.55),rgba(244,95,160,.3));color:#10183F;border:1px solid rgba(255,255,255,.7);box-shadow:inset 0 2px 1px rgba(255,255,255,.6)' : `background:linear-gradient(150deg,${sec.col}F2,${sec.col}C7 55%,${sec.col}E6);color:#fff;border:1px solid rgba(255,255,255,.3);box-shadow:inset 0 2px 1px rgba(255,255,255,.4),0 14px 30px rgba(16,24,63,.18)`}`)}>
          <div style=${S('display:flex;align-items:flex-start;justify-content:space-between;gap:10px')}>
            <div style=${S('min-width:0')}>
              <div style=${S('font-size:20px;font-weight:900;font-style:italic;letter-spacing:-.4px;line-height:1.05')}>${sec.title}</div>
              <div style=${S('display:flex;gap:6px;margin-top:8px;flex-wrap:wrap')}>
                ${sec.hasDirs && html`<button onClick=${sec.onDirs} style=${S(`height:32px;padding:0 12px;border-radius:999px;border:1px solid ${waiting ? 'rgba(16,24,63,.15)' : 'rgba(255,255,255,.45)'};background:${waiting ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.2)'};color:inherit;font-weight:800;font-size:12px;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.4)`)}>Route In Google Maps ↗</button>`}
                ${sec.canRemove && html`<button onClick=${sec.onRemove} aria-label="Remove this day" style=${S(`height:32px;padding:0 12px;border-radius:999px;border:0;background:${waiting ? 'rgba(255,255,255,.6)' : 'rgba(16,24,63,.25)'};color:inherit;font-weight:800;font-size:12px;cursor:pointer`)}>Remove Day</button>`}
              </div>
            </div>
            <div style=${S('text-align:right;flex:none')}><div style=${S('font-size:50px;font-weight:200;letter-spacing:-3px;line-height:.85')}>${n}</div><div style=${S('font-size:11px;font-weight:800;opacity:.9')}>${n === 1 ? 'Stop' : 'Stops'}</div></div>
          </div>
        </div>`}
        <div class="lg" style=${S(`position:relative;z-index:2;${GL};border-radius:28px;padding:6px`)}>
          ${!sec.hasTitle && sec.canRemove && html`<div style=${S('display:flex;justify-content:flex-end;padding:4px 6px 0')}><button onClick=${sec.onRemove} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:12px;cursor:pointer;padding:2px')}>Remove This Day</button></div>`}
          ${sec.empty && html`<div style=${S('padding:14px;text-align:center;font-size:12.5px;font-weight:600;color:#5A6080')}>Pick This Day On A Spot To Move It Here</div>`}
          ${sec.rows.map((r, ri) => html`
          <div key=${r.key} style=${S('display:flex;flex-direction:column')}>
            ${r.leg && html`
            <div style=${S(`display:flex;align-items:center;gap:8px;margin-left:29px;padding:4px 0 4px 20px;border-left:2px dotted ${r.leg.walk ? 'rgba(31,157,107,.6)' : 'rgba(27,61,184,.5)'};font-size:11px;font-weight:700;color:${r.leg.walk ? '#1F9D6B' : '#1B3DB8'}`)}>
              ${r.leg.min} min${r.leg.walk ? ' walk' : html` · <span style=${S('display:inline-flex;gap:2px')}>${r.leg.bullets.map((b, i) => html`<span key=${i} style=${S(`width:18px;height:18px;border-radius:50%;background:${b.bg};color:${b.fg};font-size:10px;display:inline-flex;align-items:center;justify-content:center`)}>${b.t}</span>`)}</span> train`}
            </div>`}
            ${!r.leg && ri > 0 && html`<div style=${S('height:1px;background:rgba(16,24,63,.08);margin:2px 10px')}></div>`}
            <div onClick=${r.onClick} style=${S(`display:flex;align-items:center;gap:12px;padding:6px;border-radius:22px;cursor:pointer;${r.ring !== 'transparent' ? 'box-shadow:0 0 0 2px #10183F;background:rgba(255,255,255,.6)' : ''}`)}>
              <span style=${S('position:relative;flex:none;display:flex')}><span style=${S(`position:relative;overflow:hidden;width:50px;height:50px;border-radius:17px;background:${r.badge};color:${r.badgeFg};font-size:22px;font-weight:200;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 1px rgba(255,255,255,.35)`)}>${r.num || CatIcon(r.catEmoji, 20, r.badgeFg)}${Photo(r.img)}</span>${r.img && r.num && html`<span style=${S(`position:absolute;top:-5px;left:-5px;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:${r.badge};color:${r.badgeFg};border:2px solid #FFFFFF;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center`)}>${r.num}</span>`}</span>
              <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}>
                <span style=${S('font-size:15.5px;font-weight:800;line-height:1.2')}>${r.name}</span>
                <span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub}${r.hasBy ? ' · ' + r.by : ''}</span>
              </div>
              ${r.canEdit && html`
              <div style=${S('display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex:none')}>
                ${r.hasDays && html`<select value=${r.dayVal} onClick=${e => e.stopPropagation()} onChange=${r.onDay} aria-label="Move to day" style=${S('height:28px;border-radius:999px;border:1px solid rgba(16,24,63,.14);background:rgba(255,255,255,.75);padding:0 8px;font-family:inherit;font-size:11.5px;font-weight:700;color:#10183F')}>${r.dayOpts.map(o => html`<option key=${o.v} value=${String(o.v)}>${o.label}</option>`)}</select>`}
                <div style=${S('display:flex;gap:4px')}>
                  <button onClick=${r.up} aria-label="Move up" style=${S(`width:30px;height:28px;border-radius:999px;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:900;font-size:12px;cursor:pointer;opacity:${r.upOp}`)}>↑</button>
                  <button onClick=${r.down} aria-label="Move down" style=${S(`width:30px;height:28px;border-radius:999px;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:900;font-size:12px;cursor:pointer;opacity:${r.downOp}`)}>↓</button>
                </div>
              </div>`}
            </div>
          </div>`)}
        </div>
      </div>`; })}
      ${t.routeDirs && html`
      <button onClick=${t.routeDirs} style=${S('height:56px;border-radius:999px;border:0;background:#10183F;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 22px;font-size:16px;font-weight:900;font-style:italic;cursor:pointer;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25),0 12px 26px rgba(16,24,63,.25)')}>${t.routeLabel} In Google Maps<span style=${S('width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#FFB27F,#FF6B1A 58%,#E8561A);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 1px rgba(255,255,255,.55)')}>${Ico('M5 12h14M13 6l6 6-6 6', 18, '#fff', 2.6)}</span></button>`}
      ${t.canEdit && html`
      <div style=${S('display:flex;align-items:center;gap:8px;margin-top:2px')}>
        <div style=${S('flex:1;display:flex;align-items:center;min-width:0')}>
          <button onClick=${t.openPick} style=${S('flex:1;min-width:0;height:52px;border-radius:999px;border:0;background:#10183F;color:#fff;display:flex;align-items:center;padding-left:20px;font-size:14.5px;font-weight:800;cursor:pointer;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25),0 10px 22px rgba(16,24,63,.22)')}>+ From My Map</button>
          <button onClick=${t.openPick} aria-label="Add From My Map" style=${S('margin-left:8px;width:52px;height:52px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.55);background:radial-gradient(circle at 35% 28%,#FFB27F,#FF6B1A 58%,#E8561A);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 3px 1px rgba(255,255,255,.55)')}>${Ico('M5 12h14M13 6l6 6-6 6', 18, 'currentColor', 2.4)}</button>
        </div>
        <button class="lg" onClick=${t.openAddNew} style=${S(`height:52px;padding:0 16px;flex:none;border-radius:999px;${GL};color:#10183F;font-weight:800;font-size:14px;cursor:pointer`)}>+ New Spot</button>
      </div>
      <div style=${S('display:flex;gap:8px;align-items:center;flex-wrap:wrap')}>
        <button class="lg" onClick=${t.addDay} style=${S(`height:40px;padding:0 16px;border-radius:999px;${GL};color:#10183F;font-weight:800;font-size:13px;cursor:pointer`)}>${t.dayBtn}</button>
        ${t.hasDays && html`
        <label class="lg" style=${S(`display:flex;align-items:center;gap:8px;height:40px;padding:0 5px 0 16px;border-radius:999px;${GL};font-weight:700;font-size:13px;color:#10183F`)}>Starts
          <input type="date" value=${t.dateVal} onChange=${t.onDate} aria-label="First day's date" style=${S('height:30px;border:0;border-radius:999px;background:rgba(16,24,63,.06);padding:0 8px;font-family:inherit;font-size:13px;font-weight:700;color:#10183F')} /></label>`}
      </div>`}
      <div style=${S('display:flex;flex-direction:column;gap:8px;margin-top:6px')}>
        <span style=${S('font-size:13px;font-weight:800;color:#4A5275;padding:0 6px')}>On This List</span>
        <div class="lg" style=${S(`border-radius:26px;padding:4px 14px;${GL}`)}>
          ${t.people.map((p, i) => html`
          <div key=${p.key} style=${S(`display:flex;align-items:center;gap:10px;padding:9px 0;${i ? 'border-top:1px solid rgba(16,24,63,.08)' : ''}`)}>
            ${Avatar(p.isMe ? v.avatarSrc : (window.NYCSync && NYCSync.avatarUrl ? NYCSync.avatarUrl(p.key) : null), ((p.isMe ? v.avatarInitial : p.name) || '?')[0], 34, ['#1B3DB8', '#F45FA0', '#7A4FD6'][i % 3], 'border:2px solid #FFFFFF')}
            <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column')}><span style=${S('font-weight:800;font-size:14px')}>${p.name}</span><span style=${S('font-size:11.5px;font-weight:600;color:#4A5275')}>${p.role}</span></span>
          </div>`)}
        </div>
        ${t.isOwner && html`
        <div style=${S('display:flex;align-items:center')}>
          <button class="lg" onClick=${t.openShare} style=${S(`flex:1;min-width:0;height:52px;border-radius:999px;${GL};color:#10183F;display:flex;align-items:center;padding-left:20px;font-size:14.5px;font-weight:800;cursor:pointer`)}>Share & Invite</button>
          <button onClick=${t.openShare} aria-label="Share And Invite" style=${S('margin-left:8px;width:52px;height:52px;flex:none;border-radius:50%;border:0;background:#10183F;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.3),0 10px 22px rgba(16,24,63,.25)')}>${Ico(ARROW_NE, 18, 'currentColor', 2.4)}</button>
        </div>`}
      </div>
      <div style=${S('display:flex;justify-content:center')}><button onClick=${t.onDel} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:13px;cursor:pointer;padding:6px')}>${t.delLabel}</button></div>
    </div></section>`}
    ${t && !mapOn && html`<div aria-hidden="true" style=${S(`position:absolute;left:0;right:0;bottom:0;height:${B(t.others.length ? 170 : 120)};z-index:5;pointer-events:none;background:linear-gradient(rgba(255,243,223,0),rgba(255,243,223,.94) 38%)`)}></div>`}
    ${t && !mapOn && t.others.length > 0 && html`
    <div style=${S(`position:absolute;left:16px;right:16px;bottom:${B(96)};height:50px;z-index:6;pointer-events:none`)}>
      ${t.others.map((o, i, arr) => { const k = arr.length - 1 - i; return html`
      <button key=${o.key} onClick=${o.onClick} aria-label=${'Open ' + o.name} style=${S(`pointer-events:auto;position:absolute;left:${k * 10}px;right:${k * 10}px;bottom:${k * 8}px;height:42px;border:0;border-radius:18px 18px 0 0;background:${o.bg};color:${o.fg};z-index:${i + 1};box-shadow:inset 0 1.5px 0 rgba(255,255,255,.5),0 -4px 12px rgba(16,24,63,.12);display:flex;align-items:flex-start;justify-content:space-between;padding:9px 14px 0;cursor:pointer;text-align:left`)}>${k === 0 && html`${wName(o.name, 13.5)}${arr.length > 1 && wMono('+' + (arr.length - 1) + ' MORE', o.fg, 'flex:none')}`}</button>`; })}
    </div>`}
  </div>`;
}

function TripSelCard(v) {
  const p = v.tsel;
  return html`
  <div class="lg" style=${S(`position:absolute;left:12px;right:12px;bottom:${B(102)};z-index:900;${GL2};border-radius:34px;padding:16px 16px 12px;display:flex;flex-direction:column;gap:10px`)}>
    <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
      <div style=${S('display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0')}>
        <span style=${S(`font-size:12px;font-weight:800;background:${p.catBg};color:${p.catFg};padding:5px 10px;border-radius:999px`)}>${p.catName}</span>
        <span style=${S('font-size:13px;font-weight:700;color:#4A5275')}>${p.area}</span>
        ${p.hasPrice && html`<span style=${S('font-size:12px;font-weight:900;color:#1F9D6B;background:#E3F5EA;padding:4px 8px;border-radius:999px')}>${p.price}</span>`}
      </div>
      <button onClick=${p.close} aria-label="Close" style=${S('flex:none;width:32px;height:32px;border-radius:50%;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:800;font-size:15px;cursor:pointer')}>✕</button>
    </div>
    <div style=${S('font-weight:900;font-style:italic;font-stretch:100%;font-size:30px;line-height:1;letter-spacing:-.02em')}>${p.name}</div>
    <div style=${S('font-size:12px;font-weight:800;color:#F45FA0;margin-top:-4px')}>${p.by}</div>
    ${p.hasNote && Note(p.note, 'padding:12px 14px;border-radius:18px;background:rgba(255,196,37,.22);border:1px dashed rgba(16,24,63,.25);font-size:14px;line-height:1.4;font-weight:500;color:#10183F')}
    ${p.canAdd && html`<button onClick=${p.onAdd} style=${S(`height:42px;border-radius:16px;border:0;background:${p.addBg};color:${p.addFg};font-weight:900;font-stretch:100%;font-style:italic;font-size:17px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)`)}>${p.addLabel}</button>`}
    <div style=${S(`display:grid;grid-template-columns:${p.hasUrl ? '1fr 1fr 1fr' : '1fr 1fr'};gap:8px`)}>
      ${p.hasUrl && html`<button onClick=${p.openSource} style=${S(`${PEN};border:0;background:${p.srcBg};color:#fff;font-size:12.5px`)}>${p.openLabel}</button>`}
      <button onClick=${p.openDirs} style=${S(`${PEN};border:2px solid #1B3DB8;background:#fff;color:#1B3DB8;font-size:12.5px`)}>Google Maps ↗</button>
      <button onClick=${p.onSave} style=${S(`${PEN};border:2px solid #1F9D6B;background:${p.saveBg};color:${p.saveFg};font-size:12.5px`)}>${p.saveLabel}</button>
    </div>
    ${p.canRemove && html`<div style=${S('display:flex;justify-content:center')}><button onClick=${p.onRemove} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:13px;cursor:pointer;padding:6px')}>${p.delLabel}</button></div>`}
  </div>`;
}

function TripShareSheet(v) {
  const sh = v.tripShare;
  return Sheet('Share “' + sh.name + '”', sh.close, html`
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <div style=${S('font-weight:800;font-size:15px')}>What Do They Get?</div>
      ${sh.opts.map((o, i) => html`
      <button key=${i} onClick=${o.onClick} style=${S(`display:flex;align-items:center;gap:12px;text-align:left;padding:12px 14px;border-radius:18px;border:2.5px solid ${o.border};background:${o.bg};color:${o.fg};cursor:pointer`)}>
        <span style=${S(`width:22px;height:22px;border-radius:50%;flex:none;border:2.5px solid ${o.on ? '#fff' : '#10183F'};background:${o.on ? '#FFC425' : '#fff'}`)}></span>
        <span style=${S('display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:800;font-size:15px')}>${o.title}</span><span style=${S(`font-size:12px;font-weight:600;color:${o.subFg}`)}>${o.sub}</span></span>
      </button>`)}
    </div>
    <div style=${S('background:#fff;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:10px')}>
      <div style=${S('font-weight:800;font-size:15px')}>Invite Link</div>
      <div style=${S('font-size:13px;font-weight:700;color:#1B3DB8;background:rgba(255,255,255,.6);border-radius:12px;padding:10px 12px;word-break:break-all;user-select:all;-webkit-user-select:all')}>${sh.link}</div>
      <div style=${S(`display:grid;grid-template-columns:${sh.canNativeShare ? '1fr 1fr' : '1fr'};gap:8px`)}>
        ${sh.canNativeShare && html`<button onClick=${sh.share} style=${S(`${PEN};border:0;background:#FF6B1A;color:#fff;font-size:14px`)}>Send Invite…</button>`}
        <button onClick=${sh.copy} style=${S(`${PEN};border:1.5px solid rgba(16,24,63,.14);background:#fff;color:#10183F;font-size:14px`)}>Copy Link</button>
      </div>
      <div style=${S('font-size:12px;line-height:1.4;color:#4A5275')}>They Open The Link, Make An Account (Or Sign In), And Join. Anyone With The Link Can Join, So Send It Just To Your People.</div>
      <button onClick=${sh.newLink} style=${S('align-self:flex-start;border:0;background:none;color:#E8242C;font-weight:700;font-size:12.5px;cursor:pointer;padding:2px 0')}>${sh.newLinkLabel}</button>
    </div>
    ${sh.hasPeople && html`
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <div style=${S('font-weight:800;font-size:15px')}>Already Joined</div>
      <div style=${S('background:#fff;border-radius:20px;padding:4px 14px')}>
        ${sh.people.map((p, i) => html`
        <div key=${p.key} style=${S(`display:flex;align-items:center;gap:10px;padding:9px 0;${i ? 'border-top:1px solid rgba(16,24,63,.08)' : ''}`)}>
          <span style=${S('flex:1;font-weight:800;font-size:14px')}>${p.name}</span>
          <button onClick=${p.onRemove} style=${S('height:30px;padding:0 12px;border-radius:999px;border:0;background:#FFE2DF;color:#E8242C;font-weight:800;font-size:12px;cursor:pointer')}>Remove</button>
        </div>`)}
      </div>
    </div>`}`);
}

function EditTripSheet(v) {
  const e = v.tripEdit;
  const inp = S('height:50px;border-radius:16px;border:1.5px solid rgba(16,24,63,.14);background:#fff;padding:0 14px;font-family:inherit;font-size:16px;font-weight:600;color:#10183F;outline:none');
  const step = S('width:46px;height:46px;border-radius:14px;border:1.5px solid rgba(16,24,63,.14);background:#fff;color:#10183F;font-weight:900;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center');
  return Sheet('Edit List', e.close, html`
    ${e.canPhoto && html`
    <div style=${S('display:flex;align-items:center;gap:14px')}>
      <span style=${S('position:relative;overflow:hidden;width:72px;height:72px;flex:none;border-radius:20px;background:#FFC425;color:#10183F;display:flex;align-items:center;justify-content:center;font-weight:900;font-style:italic;font-size:32px;box-shadow:0 6px 16px rgba(16,24,63,.15)')}>${e.initial}${Photo(e.photo)}</span>
      <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:8px')}>
        <span style=${S('font-weight:800;font-size:15px')}>List Photo</span>
        <div style=${S('display:flex;gap:8px;flex-wrap:wrap')}>
          <label class=${e.photoBusy ? 'ai-busy' : ''} style=${S('position:relative;display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:999px;background:#10183F;color:#fff;font-weight:800;font-size:13px;cursor:pointer')}>${e.photoBusy ? 'Saving…' : e.photo ? 'Change Photo' : 'Add Photo'}<input type="file" accept="image/*" onChange=${e.onPhoto} disabled=${e.photoBusy} style=${S('position:absolute;width:1px;height:1px;opacity:0;pointer-events:none')}/></label>
          ${e.photo && !e.photoBusy && html`<button onClick=${e.removePhoto} style=${S('height:36px;padding:0 12px;border-radius:999px;border:1.5px solid rgba(16,24,63,.14);background:transparent;color:#10183F;font-weight:700;font-size:13px;cursor:pointer')}>Use Initial</button>`}
        </div>
      </div>
    </div>`}
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <label for="te-name" style=${S('font-weight:800;font-size:15px')}>List Name</label>
      ${e.canRename ? html`<input id="te-name" value=${e.name} onChange=${e.onName} placeholder="E.g. Sonia’s Visit" style=${inp} />`
        : html`<div style=${S('font-weight:800;font-size:16px')}>${e.name}</div><div style=${S('font-size:12px;color:#5A6080')}>Only ${e.ownerName} Can Rename This List.</div>`}
    </div>
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <span style=${S('font-weight:800;font-size:15px')}>Days</span>
      <div style=${S('display:flex;align-items:center;gap:12px')}>
        <button onClick=${e.less} aria-label="One less day" style=${step}>−</button>
        <span style=${S('min-width:90px;text-align:center;font-weight:900;font-style:italic;font-size:22px;color:#1B3DB8')}>${e.daysLabel}</span>
        <button onClick=${e.more} aria-label="One more day" style=${step}>+</button>
      </div>
      ${e.dropNote && html`<div style=${S('font-size:12px;font-weight:700;color:#E8242C')}>${e.dropNote}</div>`}
    </div>
    ${e.days > 0 && html`
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <label for="te-start" style=${S('font-weight:800;font-size:15px')}>First Day</label>
      <input id="te-start" type="date" value=${e.start} onChange=${e.onStart} style=${inp} />
      <div style=${S('font-size:12px;color:#5A6080')}>${e.range}</div>
    </div>`}
    <button onClick=${e.save} style=${S(`flex:none;margin-top:4px;height:50px;border-radius:999px;border:0;background:${e.saveBg};color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)`)}>Save Changes</button>`, 'Cancel', 1080);
}

const CheckRow = r => html`
  <button key=${r.key} onClick=${r.onClick} style=${S(`display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:2px solid ${r.ring};border-radius:18px;padding:10px 12px;cursor:pointer;color:#10183F`)}>
    ${r.emoji != null && html`<span style=${S(`width:34px;height:34px;border-radius:12px;background:${r.catBg};flex:none;display:flex;align-items:center;justify-content:center`)}>${CatIcon(r.emoji, 17, r.catBg === '#FFC425' ? '#10183F' : '#fff')}</span>`}
    <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:800;font-size:15px')}>${r.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub || (r.catName + ' · ' + r.area)}</span></span>
    <span style=${S(`width:28px;height:28px;border-radius:50%;flex:none;background:${r.chkBg};color:#fff;border:1.5px solid rgba(16,24,63,.14);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px`)}>${r.chk}</span>
  </button>`;

function TripPicker(v) {
  const pk = v.tripPick;
  return Sheet(pk.title, pk.close, html`
    <input value=${pk.q} onChange=${pk.onQ} placeholder="Search Your Spots" aria-label="Search your spots" style=${S('flex:none;height:46px;border-radius:14px;border:1.5px solid rgba(16,24,63,.14);background:#fff;padding:0 14px;font-family:inherit;font-size:15px;color:#10183F;outline:none')} />
    ${pk.empty && html`<div style=${S('text-align:center;padding:20px;font-size:13px;font-weight:600;color:#4A5275')}>${pk.emptyMsg}</div>`}
    ${pk.rows.map(CheckRow)}`);
}

function ListChooser(v) {
  const c = v.listChoose;
  return Sheet('Add “' + c.name + '” To A List', c.close, html`
    ${c.setupMsg && html`<div style=${S('font-size:13px;font-weight:700;color:#E8242C')}>${c.setupMsg}</div>`}
    ${c.rows.map(CheckRow)}
    ${c.empty && c.ready && html`<div style=${S('text-align:center;padding:6px;font-size:13px;font-weight:600;color:#4A5275')}>No Lists Yet — Make Your First One.</div>`}
    ${!c.setupMsg && html`<button onClick=${c.newList} style=${S('height:46px;border-radius:14px;border:1.5px dashed rgba(16,24,63,.32);background:transparent;color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>+ New List</button>`}`);
}

function NewTripSheet(v) {
  const n = v.newTrip;
  const inp = S('height:50px;border-radius:16px;border:1.5px solid rgba(16,24,63,.14);background:#fff;padding:0 14px;font-family:inherit;font-size:16px;font-weight:600;color:#10183F;outline:none');
  return Sheet('New List', n.close, html`
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <label for="nt-name" style=${S('font-weight:800;font-size:15px')}>What’s It For?</label>
      <input id="nt-name" value=${n.name} onChange=${n.onName} placeholder="E.g. Sonia’s Visit" style=${inp} />
    </div>
    ${n.needMe && html`
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <label for="nt-me" style=${S('font-weight:800;font-size:15px')}>Your Name</label>
      <input id="nt-me" value=${n.me} onChange=${n.onMe} placeholder="Shown To People You Invite" style=${inp} />
    </div>`}
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <span style=${S('font-weight:800;font-size:15px')}>How Many Days?</span>
      <div style=${S('display:flex;gap:6px;flex-wrap:wrap')}>
        ${n.dayChips.map((c, i) => html`<button key=${i} onClick=${c.onClick} style=${S(`height:38px;min-width:42px;padding:0 13px;border-radius:999px;border:2px solid ${c.border};background:${c.bg};color:${c.fg};font-weight:800;font-size:13px;cursor:pointer`)}>${c.label}</button>`)}
      </div>
      <div style=${S('font-size:12px;color:#5A6080')}>Optional — You Can Add Or Remove Days Any Time.</div>
    </div>
    ${n.showStart && html`
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <label for="nt-start" style=${S('font-weight:800;font-size:15px')}>First Day</label>
      <input id="nt-start" type="date" value=${n.start} onChange=${n.onStart} style=${inp} />
    </div>`}
    <button onClick=${n.create} style=${S(`flex:none;margin-top:4px;height:50px;border-radius:999px;border:0;background:${n.btnBg};color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)`)}>${n.btn}</button>`, 'Cancel', 1080);
}

function TabBar(v) {
  // Round 2 deep glass: a clear frosted pill with the tabs, and a separate light glass + button.
  const on = fg => fg === '#1B3DB8';
  const tab = (go, fg, label, icon) => on(fg) ? html`
    <button onClick=${go} aria-current="page" aria-label=${label} style=${S('height:48px;min-width:0;padding:0 16px;border:none;border-radius:999px;background:#FFFFFF;color:#10183F;display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(16,24,63,.14),inset 0 1px 0 #fff;flex:none')}>${icon}<span>${label}</span></button>` : html`
    <button onClick=${go} aria-label=${label} style=${S('width:48px;height:48px;flex:none;border:none;border-radius:50%;background:transparent;color:#10183F;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0')}>${icon}</button>`;
  const show = v.hasSel && v.onMapTab ? 'none' : 'flex';
  return html`
  <nav aria-label="Tabs" class="lg" style=${S(`position:absolute;left:16px;right:92px;bottom:${B(22)};height:64px;z-index:950;${GLX};border-radius:999px;display:${show};align-items:center;justify-content:space-between;padding:0 8px`)}>
    ${tab(v.goMap, v.tabMapFg, 'Map', Ico('M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z M12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5', 20))}
    ${tab(v.goExplore, v.tabExFg, 'Explore', html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M15.5 8.5l-2 5-5 2 2-5z"></path></svg>`)}
    ${tab(v.goPlan, v.tabPlanFg, 'Route', html`<span style=${S(`position:relative;display:flex;margin-right:${v.planCount > 0 && on(v.tabPlanFg) ? 8 : 0}px`)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2.5"></circle><circle cx="18" cy="6" r="2.5"></circle><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"></path></svg>${v.planCount > 0 && html`<span style=${S('position:absolute;top:-7px;right:-11px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#FF6B1A;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #FFFFFF')}>${v.planCount}</span>`}</span>`)}
    ${tab(v.goLists, v.tabListFg, 'Lists', html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><rect x="13" y="13" width="7" height="7" rx="2"></rect></svg>`)}
  </nav>
  <button onClick=${v.openAdd} aria-label="Add A Spot" class="lg" style=${S(`position:absolute;right:16px;bottom:${B(22)};z-index:950;width:64px;height:64px;border-radius:50%;${GLX_LIGHT};color:#FF6B1A;display:${show};align-items:center;justify-content:center;cursor:pointer;padding:0`)}>${Ico('M12 5v14M5 12h14', 26, 'currentColor', 2.8)}</button>`;
}

function AddSheet(v) {
  const f = v.form, mode = v.addMode, open = v.addY === '0%';
  const lab = S('font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:1.2px;color:#3A4470');
  const inp = 'border-radius:16px;border:1.5px solid rgba(16,24,63,.12);background:rgba(255,255,255,.75);padding:0 14px;font-family:inherit;font-size:15px;color:#10183F;outline:none';
  const col6 = S('display:flex;flex-direction:column;gap:6px');
  const hint = t => html`<div style=${S('font-size:12px;line-height:1.4;color:#4A5275')}>${t}</div>`;
  const status = t => html`<div role="status" style=${S('font-size:13px;font-weight:700;color:#1B3DB8;line-height:1.35')}>${t}</div>`;
  const plain = t => String(t || '').replace(/^[^A-Za-z0-9]+/, '').replace(/…$/, '');
  const sparkle = html`<span style=${S('width:34px;height:34px;flex:none;border-radius:12px;background:#FFC425;color:#10183F;display:flex;align-items:center;justify-content:center')}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"></path></svg></span>`;
  const darkCard = 'border-radius:22px;padding:14px;background:#10183F;color:#fff;display:flex;flex-direction:column;gap:10px;box-shadow:0 10px 30px rgba(16,24,63,.3)';
  const busyCard = reads => html`
    <div role="status" style=${S(darkCard)}>
      <div style=${S('display:flex;align-items:center;gap:10px')}>${sparkle}
        <div style=${S('display:flex;flex-direction:column;gap:2px;min-width:0')}><span style=${S('font-size:15px;font-weight:900;font-style:italic')}>${plain(v.aiBtn)}</span><span style=${S('font-family:var(--mono);font-size:10.5px;font-weight:500;color:#C4D0FF')}>${reads}</span></div>
      </div>
      <div class="ai-bar" style=${S('height:6px;border-radius:3px;background:rgba(255,255,255,.15)')}></div>
    </div>`;
  const found = v.aiMulti && html`
    <div style=${S('display:flex;align-items:baseline;justify-content:space-between;gap:8px')}>
      <h2 style=${S('margin:0;font-size:18px;font-weight:900;font-style:italic')}>Found ${v.aiCount} Places</h2>
      <span style=${S(`font-family:var(--mono);font-size:10.5px;font-weight:700;color:${v.aiConfHigh ? '#1F9D6B' : '#B4570B'}`)}>${v.aiConfHigh ? 'HIGH CONFIDENCE' : 'CHECK THE DETAILS'}</span>
    </div>
    <ul style=${S('list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px')}>
      ${v.aiRows.map((r, i) => html`
      <li key=${i} style=${S(`display:flex;align-items:center;gap:6px;padding:4px 12px 4px 4px;border-radius:18px;${ROW};${r.on ? 'box-shadow:0 0 0 2px #FF6B1A' : ''}`)}>
        <button onClick=${r.onPick} style=${S('flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:6px 8px;border:none;background:none;text-align:left;cursor:pointer;color:#10183F')}>
          <span style=${S(`width:36px;height:36px;flex:none;border-radius:12px;background:${r.bg};display:flex;align-items:center;justify-content:center`)}>${CatIcon(r.emoji, 18, r.bg === '#FFC425' ? '#10183F' : '#fff')}</span>
          <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-size:15px;font-weight:800')}>${r.name}</span><span style=${S('font-family:var(--mono);font-size:10.5px;color:#3A4470;text-transform:uppercase')}>${r.sub}</span></span>
        </button>
        <button onClick=${r.onCheck} role="checkbox" aria-checked=${r.checked} aria-label=${'Include ' + r.name} style=${S(`flex:none;width:26px;height:26px;border-radius:9px;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;${r.checked ? 'border:none;background:#1B3DB8;color:#fff' : 'border:2px solid rgba(16,24,63,.3);background:transparent'}`)}>${r.checked && Ico('M5 12l5 5 9-10', 14, 'currentColor', 3)}</button>
      </li>`)}
    </ul>`;

  const linkBlock = html`
    <div style=${col6}>
      <label for="f-url" style=${lab}>LINK</label>
      <div class="fld" style=${S('display:flex;align-items:center;gap:8px;height:52px;padding:0 8px 0 14px;border-radius:16px;background:rgba(255,255,255,.75);border:1.5px solid rgba(16,24,63,.12)')}>
        <input id="f-url" value=${f.url} onChange=${v.onUrl} placeholder="TikTok, IG, Threads Or Maps Link" style=${S('flex:1;min-width:0;border:none;background:transparent;font-family:var(--mono);font-size:13px;font-weight:500;color:#10183F;outline:none')} />
        ${v.hasSrcBadge ? html`<span style=${S(`flex:none;height:28px;padding:0 10px;border-radius:10px;background:${v.srcBadgeBg};color:#fff;font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:1px;display:flex;align-items:center`)}>${v.srcShort}</span>`
          : html`<button onClick=${v.pasteUrl} style=${S('flex:none;height:34px;padding:0 12px;border-radius:10px;border:none;background:#FFC425;color:#10183F;font-weight:800;font-size:13px;cursor:pointer')}>Paste</button>`}
      </div>
    </div>
    ${v.aiBusy ? busyCard(v.aiReads) : v.aiShow && !v.aiMulti && html`
    <button onClick=${v.aiRun} style=${S(`${darkCard};flex-direction:row;align-items:center;border:none;cursor:pointer;text-align:left`)}>${sparkle}<span style=${S('display:flex;flex-direction:column;gap:2px')}><span style=${S('font-size:15px;font-weight:900;font-style:italic')}>${plain(v.aiBtn)}</span><span style=${S('font-family:var(--mono);font-size:10.5px;font-weight:500;color:#C4D0FF')}>${v.aiReads}</span></span></button>`}
    ${v.aiHasMsg && status(v.aiMsg)}
    ${found}
    ${!f.url && hint('Paste A Post Or A Google Maps Link And AI Fills In The Rest — Including What’s Said Out Loud.')}`;

  const videoBlock = html`
    <div style=${col6}>
      <span style=${lab}>VIDEO</span>
      <label for="f-video" style=${S('min-height:120px;border-radius:20px;border:1.5px dashed rgba(16,24,63,.3);background:rgba(255,255,255,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:#10183F;padding:16px;text-align:center')}>
        <span style=${S('width:44px;height:44px;border-radius:14px;background:#10183F;color:#FFC425;display:flex;align-items:center;justify-content:center')}>${Ico('M4 6h12v12H4z M16 10l4-2v8l-4-2', 22)}</span>
        <span style=${S('font-size:15px;font-weight:900;font-style:italic')}>Pick A Video From Your Phone</span>
        <span style=${S('font-family:var(--mono);font-size:10.5px;font-weight:700;color:#3A4470')}>AUDIO + 3 FRAMES · UP TO 10 MIN</span>
      </label>
      <input id="f-video" type="file" accept="video/*" onChange=${v.onVideo} style=${S('position:absolute;width:1px;height:1px;opacity:0;pointer-events:none')} />
    </div>
    ${v.aiBusy && busyCard('AUDIO · ON-SCREEN TEXT')}
    ${v.aiHasMsg && status(v.aiMsg)}
    ${found}
    ${hint('The Video Stays On Your Phone — Only The Sound And Three Stills Are Sent So AI Can Find The Places.')}`;

  const nameField = html`
    <div style=${col6}>
      <label for="f-name" style=${lab}>PLACE NAME</label>
      <input id="f-name" value=${f.name} onChange=${v.onName} autocomplete="off" placeholder="Start Typing, E.g. Devoción" style=${S(`height:52px;${inp};font-size:16px;font-weight:600`)} />
      ${v.suggBusy && html`<div role="status" style=${S('font-family:var(--mono);font-size:11px;font-weight:700;color:#3A4470')}>LOOKING IT UP…</div>`}
      ${v.hasSugg && html`
      <div style=${S(`display:flex;flex-direction:column;border-radius:18px;overflow:hidden;${ROW}`)}>
        <div style=${S('display:flex;align-items:center;justify-content:space-between;padding:9px 14px 6px')}>
          <span style=${S('font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:1px;color:#3A4470;text-transform:uppercase')}>${v.suggTitle}</span>
          <button onClick=${v.closeSugg} style=${S('border:0;background:transparent;color:#1B3DB8;font-weight:800;font-size:12px;cursor:pointer;padding:0')}>None Of These</button>
        </div>
        ${v.suggRows.map((r, i) => html`
        <button key=${i} onClick=${r.onPick} style=${S('display:flex;align-items:center;gap:10px;text-align:left;padding:9px 14px;border:0;border-top:1px solid rgba(16,24,63,.07);background:transparent;cursor:pointer;color:#10183F')}>
          <span style=${S(`width:32px;height:32px;border-radius:11px;background:${r.bg};flex:none;display:flex;align-items:center;justify-content:center`)}>${CatIcon(r.emoji, 16, r.bg === '#FFC425' ? '#10183F' : '#fff')}</span>
          <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px')}><span style=${S('font-weight:800;font-size:14px')}>${r.name}</span><span style=${S('font-family:var(--mono);font-size:10.5px;color:#3A4470')}>${r.sub}</span></span>
        </button>`)}
        ${v.suggGoogle && html`<div style=${S('padding:6px 14px 8px;border-top:1px solid rgba(16,24,63,.07);font-family:var(--mono);font-size:10px;font-weight:700;color:#5A6080;text-align:right')}>SUGGESTIONS FROM GOOGLE</div>`}
      </div>`}
      ${v.webShow && html`<button onClick=${v.webFind} style=${S(`${darkCard};flex-direction:row;align-items:center;padding:10px 12px;border:none;cursor:pointer;text-align:left`)}>${sparkle}<span style=${S('font-size:14px;font-weight:900;font-style:italic')}>${plain(v.webLabel)}</span></button>`}
      ${v.webBusy && html`<div role="status" style=${S(darkCard)}><div style=${S('display:flex;align-items:center;gap:10px')}>${sparkle}<span style=${S('font-size:15px;font-weight:900;font-style:italic')}>Searching The Web</span></div><div class="ai-bar" style=${S('height:6px;border-radius:3px;background:rgba(255,255,255,.15)')}></div></div>`}
      ${v.webHasMsg && status(v.webMsg)}
    </div>`;

  const details = html`
    <h2 style=${S('margin:6px 0 0;font-size:18px;font-weight:900;font-style:italic')}>${f.id ? 'Details' : mode === 'name' ? 'The Rest' : 'Details'}</h2>
    ${mode !== 'name' && nameField}
    <div style=${col6}>
      <label for="f-look" style=${lab}>LOCATION</label>
      <div style=${S('display:flex;gap:8px')}>
        <input id="f-look" value=${v.lookQ} onChange=${v.onLookQ} onKeyDown=${v.onLookKey} placeholder="Search An Address Or Place" style=${S(`flex:1;min-width:0;height:52px;${inp}`)} />
        <button onClick=${v.runLookup} style=${S('flex:none;height:52px;padding:0 16px;border-radius:16px;border:0;background:#1B3DB8;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>${v.lookBtn}</button>
      </div>
      ${v.lookHasMsg && html`<div style=${S('font-size:12px;font-weight:600;color:#E8242C')}>${v.lookMsg}</div>`}
      ${v.lookHasResults && html`
      <div style=${S(`display:flex;flex-direction:column;border-radius:18px;overflow:hidden;${ROW}`)}>
        ${v.lookResults.map((r, i) => html`
        <button key=${i} onClick=${r.onPick} style=${S(`display:flex;flex-direction:column;gap:2px;text-align:left;padding:10px 14px;border:0;${i ? 'border-top:1px solid rgba(16,24,63,.07);' : ''}background:transparent;cursor:pointer;color:#10183F`)}>
          <span style=${S('font-weight:800;font-size:14px')}>${r.title}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub}</span>
        </button>`)}
      </div>`}
      ${v.hasPin && html`
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px;background:#1F9D6B;color:#fff;border-radius:18px;padding:12px 14px')}>
        <div style=${S('display:flex;flex-direction:column;gap:2px;min-width:0')}><span style=${S('font-weight:800;font-size:15px')}>Pin Dropped ✓</span><span style=${S('font-family:var(--mono);font-size:11px;font-weight:500')}>${v.pinLine}</span></div>
        <button onClick=${v.startPlacing} style=${S('flex:none;height:36px;padding:0 14px;border:0;border-radius:999px;background:#FFFFFF;color:#1F9D6B;font-weight:800;font-size:13px;cursor:pointer')}>Move Pin</button>
      </div>`}
      ${v.noPin && html`
        <button onClick=${v.startPlacing} style=${S('height:52px;border-radius:16px;border:1.5px dashed #1B3DB8;background:rgba(255,255,255,.5);color:#1B3DB8;font-weight:800;font-size:15px;cursor:pointer')}>Drop A Pin On The Map</button>
        ${hint('Or Just Pick A Neighborhood Below And We’ll Place It There.')}`}
    </div>
    <div style=${col6}>
      <span style=${lab}>CATEGORY</span>
      <div style=${S('display:flex;flex-wrap:wrap;gap:8px')}>
        ${v.formCats.map((c, i) => html`
        <button key=${i} onClick=${c.onClick} style=${S(`display:flex;align-items:center;gap:7px;height:38px;padding:0 13px;border-radius:999px;${c.bg === '#fff' ? ROW : `border:none;background:${c.bg};box-shadow:0 6px 16px rgba(16,24,63,.18)`};color:${c.fg};font-weight:${c.bg === '#fff' ? 700 : 800};font-size:13px;cursor:pointer`)}><span style=${S(`width:9px;height:9px;border-radius:50%;background:${c.dot}`)}></span>${c.name}</button>`)}
        <button onClick=${v.toggleNewCat} style=${S('height:38px;padding:0 13px;border-radius:999px;border:1.5px dashed rgba(16,24,63,.32);background:transparent;color:#10183F;font-weight:700;font-size:13px;cursor:pointer')}>+ New Category</button>
      </div>
      ${f.newCatOpen && html`
      <div style=${S(`border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:12px;${ROW}`)}>
        <input id="f-newcat" value=${f.newCatName} onChange=${v.onNewCatName} placeholder="E.g. Matcha Spots" aria-label="New category name" style=${S(`height:46px;${inp}`)} />
        <span style=${lab}>ICON</span>
        <div style=${S('display:flex;flex-wrap:wrap;gap:6px')}>
          ${v.emojiChoices.map((m, i) => html`<button key=${i} onClick=${m.onClick} aria-label=${'Icon ' + m.e} aria-pressed=${m.ring === '#10183F'} style=${S(`width:40px;height:40px;border-radius:12px;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;${m.ring === '#10183F' ? 'border:none;background:#10183F;color:#FFC425' : 'border:1px solid rgba(255,255,255,.95);background:rgba(255,255,255,.6);color:#10183F'}`)}>${CatIcon(m.e, 19, 'currentColor')}</button>`)}
        </div>
        <span style=${lab}>PIN COLOR</span>
        <div style=${S('display:flex;gap:10px;align-items:center')}>
          ${v.swatches.map((w, i) => html`<button key=${i} onClick=${w.onClick} aria-label=${'Color ' + (i + 1)} style=${S(`width:30px;height:30px;border-radius:50%;background:${w.color};border:3px solid ${w.ring === '#fff' ? '#FFFFFF' : w.ring};cursor:pointer;padding:0;box-shadow:0 2px 6px rgba(16,24,63,.2)`)}></button>`)}
        </div>
        <button onClick=${v.addCat} style=${S('height:44px;border-radius:14px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Create Category</button>
      </div>`}
    </div>
    ${v.showPrice && html`
    <div style=${col6}>
      <span style=${lab}>PRICE RANGE</span>
      <div style=${S('display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px')}>
        ${v.priceChips.map((p, i) => html`
        <button key=${i} onClick=${p.onClick} style=${S(`height:46px;border-radius:14px;${p.bg === '#fff' ? ROW : `border:none;background:${p.bg}`};color:${p.fg};font-family:var(--mono);font-weight:700;font-size:15px;cursor:pointer`)}>${p.label}</button>`)}
      </div>
      ${hint(v.priceHint)}
    </div>`}
    <div style=${col6}>
      <label for="f-area" style=${lab}>NEIGHBORHOOD</label>
      <select id="f-area" value=${f.area} onChange=${v.onArea} style=${S(`height:52px;${inp};padding:0 12px;font-weight:600`)}>
        <option value="auto">Auto-Detect From Pin</option>
        ${v.areaGroups.map(g => html`<optgroup key=${g.b} label=${g.b}>${g.areas.map(a => html`<option key=${a.name} value=${a.name}>${a.name}</option>`)}</optgroup>`)}
      </select>
    </div>
    <div style=${col6}>
      <label for="f-addr" style=${lab}>ADDRESS OR CROSS STREETS</label>
      <input id="f-addr" value=${f.address} onChange=${v.onAddress} placeholder="Optional — Helps Google Maps Find It" style=${S(`height:52px;${inp}`)} />
    </div>
    <div style=${col6}>
      <label for="f-note" style=${lab}>NOTES</label>
      <textarea id="f-note" value=${f.note} onChange=${v.onNote} placeholder="What To Order, When To Go…" rows="3" style=${S(`${inp};padding:12px 14px;resize:none;line-height:1.45`)}></textarea>
      ${hint('Each Sentence Shows On Its Own Line.')}
    </div>
    ${f.id && html`<div style=${S('display:flex;justify-content:center')}><button onClick=${() => { const sure = v.delLabel !== 'Delete'; v.deleteSel(); if (sure) v.closeAdd(); }} style=${S('border:0;background:none;color:#E8242C;font-weight:800;font-size:14px;cursor:pointer;padding:8px')}>${v.delLabel === 'Delete' ? 'Delete This Spot' : v.delLabel}</button></div>`}`;

  const seg = (m, label) => html`<button role="tab" aria-selected=${mode === m} onClick=${() => v.setAddMode(m)} style=${S(`height:38px;border:none;border-radius:12px;background:${mode === m ? '#FFFFFF' : 'transparent'};color:${mode === m ? '#10183F' : '#3A4470'};font-size:13px;font-weight:${mode === m ? 800 : 700};cursor:pointer;${mode === m ? 'box-shadow:0 2px 8px rgba(16,24,63,.12)' : ''}`)}>${label}</button>`;
  const multiBtn = v.aiMulti && !f.id;
  return html`
  <div data-screen-label="Add Spot" aria-hidden=${!open} style=${S(`position:absolute;inset:0;z-index:1100;pointer-events:${open ? 'auto' : 'none'}`)}>
    <div onClick=${v.closeAdd} style=${S(`position:absolute;inset:0;background:rgba(16,24,63,.18);opacity:${open ? 1 : 0};transition:opacity .3s`)}></div>
    <section style=${S(`position:absolute;left:8px;right:8px;top:${T(54)};bottom:${B(8)};${GL2};border-radius:38px;display:flex;flex-direction:column;transform:translateY(${open ? '0' : 'calc(100% + 80px)'});transition:transform .38s cubic-bezier(.2,.8,.2,1)`)}>
      <div style=${S('flex:none;padding:12px 18px 0;display:flex;flex-direction:column;gap:16px')}>
        ${Grab()}
        <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
          <div style=${S('min-width:0')}>
            <h1 style=${S('margin:0;font-size:30px;font-weight:900;font-style:italic;font-stretch:100%;letter-spacing:-.6px')}>${v.formTitle}</h1>
            ${v.formFor && html`<div style=${S('font-size:13px;font-weight:700;color:#F45FA0;margin-top:2px')}>Just For “${v.formFor}”</div>`}
          </div>
          <button onClick=${v.closeAdd} aria-label="Close" style=${S('flex:none;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.9);background:rgba(255,255,255,.6);color:#10183F;display:flex;align-items:center;justify-content:center;cursor:pointer')}>${Ico('M6 6l12 12M18 6L6 18', 16, 'currentColor', 2.8)}</button>
        </div>
        ${!f.id && html`
        <div role="tablist" aria-label="How To Add" style=${S('display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:4px;border-radius:16px;background:rgba(16,24,63,.08)')}>
          ${seg('link', 'Paste A Link')}${seg('video', 'From A Video')}${seg('name', 'By Name')}
        </div>`}
      </div>
      <div class="noscroll" style=${S('flex:1;min-height:0;overflow-y:auto;padding:16px 18px 16px;display:flex;flex-direction:column;gap:16px')}>
        ${!f.id && (mode === 'link' ? linkBlock : mode === 'video' ? videoBlock : nameField)}
        ${f.id && nameField}
        ${details}
      </div>
      <div style=${S('flex:none;padding:0 18px 20px')}>
        ${multiBtn ? html`<button onClick=${v.aiAddAll} disabled=${!v.aiPickCount} style=${S(`width:100%;height:58px;border-radius:20px;border:none;background:${v.aiPickCount ? '#FF6B1A' : '#A9ADC2'};color:#fff;font-size:17px;font-weight:900;font-style:italic;font-stretch:100%;cursor:pointer;box-shadow:${v.aiPickCount ? '0 10px 26px rgba(255,107,26,.5),inset 0 1px 0 rgba(255,255,255,.45)' : 'none'}`)}>${v.aiAddAllLabel}</button>`
          : html`<button onClick=${v.save} style=${S(`width:100%;height:58px;border-radius:20px;border:none;background:${v.saveBg};color:#fff;font-size:17px;font-weight:900;font-style:italic;font-stretch:100%;cursor:pointer;box-shadow:${v.saveBg === '#FF6B1A' ? '0 10px 26px rgba(255,107,26,.5),' : ''}inset 0 1px 0 rgba(255,255,255,.45)`)}>${v.saveLabel}</button>`}
      </div>
    </section>
  </div>`;
}

function AccountSheet(v) {
  return html`
  <div onClick=${v.closeAcct} style=${S('position:absolute;inset:0;z-index:1050;background:rgba(16,24,63,.26);display:flex;flex-direction:column;justify-content:flex-end')}>
    <div class="lg" onClick=${e => e.stopPropagation()} style=${S(`${GL2};border-bottom:0;border-radius:34px 34px 0 0;padding:20px 18px ${B(28)};display:flex;flex-direction:column;gap:14px`)}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:#1B3DB8')}>Your Account</div>
        <button onClick=${v.closeAcct} style=${S('height:38px;padding:0 16px;border-radius:999px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Done</button>
      </div>
      <div style=${S(`${ROW};border-radius:18px;padding:12px 14px;display:flex;align-items:center;gap:14px`)}>
        ${Avatar(v.avatarSrc, v.avatarInitial, 64, '#1B3DB8', 'box-shadow:0 6px 16px rgba(16,24,63,.18)')}
        <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:8px')}>
          <span style=${S('font-weight:800;font-size:15px')}>Profile Photo</span>
          <div style=${S('display:flex;gap:8px;flex-wrap:wrap')}>
            <label class=${v.avatarBusy ? 'ai-busy' : ''} style=${S('display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:999px;background:#10183F;color:#fff;font-weight:800;font-size:13px;cursor:pointer')}>
              ${v.avatarBusy ? 'Saving…' : v.hasAvatar ? 'Change Photo' : 'Add Photo'}
              <input type="file" accept="image/*" onChange=${v.onAvatarFile} disabled=${v.avatarBusy} style=${S('position:absolute;width:1px;height:1px;opacity:0;pointer-events:none')}/>
            </label>
            ${v.hasAvatar && !v.avatarBusy && html`<button onClick=${v.removeAvatar} style=${S('height:36px;padding:0 12px;border-radius:999px;border:1.5px solid rgba(16,24,63,.14);background:transparent;color:#10183F;font-weight:700;font-size:13px;cursor:pointer')}>Remove</button>`}
          </div>
        </div>
      </div>
      ${v.avatarMsg && html`<div role="status" style=${S('font-size:12.5px;font-weight:700;color:#E8242C;margin-top:-6px')}>${v.avatarMsg}</div>`}
      <div style=${S('background:#fff;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:6px')}>
        <span style=${S('font-size:12px;font-weight:700;color:#4A5275')}>Signed In As</span>
        <span style=${S('font-weight:800;font-size:15px;word-break:break-all')}>${v.syncEmail}</span>
        <span style=${S('display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#3C4466')}><span style=${S(`width:9px;height:9px;border-radius:50%;background:${v.syncDot}`)}></span>${v.syncLabel}</span>
      </div>
      <div style=${S('font-size:13px;line-height:1.4;color:#3C4466')}>Your spots, categories, home and day plan sync to every device you sign in on.</div>
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:8px')}>
        <button onClick=${v.syncNow} style=${S('height:46px;border-radius:14px;border:1.5px solid rgba(16,24,63,.14);background:#fff;color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>Sync Now</button>
        <button onClick=${v.signOut} style=${S('height:46px;border-radius:14px;border:0;background:#FFE2DF;color:#E8242C;font-weight:800;font-size:14px;cursor:pointer')}>Sign Out</button>
      </div>
      <div style=${S('display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center')}>
        <button onClick=${v.deleteAccount} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:12.5px;cursor:pointer;padding:6px')}>${v.delAcctLabel}</button>
        <span style=${S('font-size:11px;color:#6A7090')}>Deletes Your Account, Your Map And The Lists You Made. <a href=${v.privacyUrl} target="_blank" rel="noopener">Privacy Policy</a></span>
      </div>
    </div>
  </div>`;
}

// Welcome pages after a first sign-in, styled like a subway ride: a station sign per stop, route bullets for progress.
// City picker: opened from the yellow city button on the map header.
function CityPicker(v) {
  return html`
  <div style=${S('position:absolute;inset:0;z-index:1150;display:flex;flex-direction:column;justify-content:flex-end')}>
    <div onClick=${v.closeCity} aria-hidden="true" style=${S('position:absolute;inset:0;background:rgba(16,24,63,.28)')}></div>
    <div role="dialog" aria-label="Choose A City" class="lg" style=${S(`position:relative;margin:0 8px ${B(8)};${GL2};border-radius:34px;padding:12px 14px 16px;display:flex;flex-direction:column;gap:10px`)}>
      ${Grab()}
      <div style=${S('display:flex;align-items:center;justify-content:space-between;padding:0 4px')}>
        <div><div style=${S(`${MONO};font-size:10.5px;font-weight:700;letter-spacing:1.1px;color:#4A5275`)}>SPOTTED IN · BETA</div><div style=${S('font-size:26px;font-weight:900;font-style:italic;letter-spacing:-.8px;line-height:1.05')}>Pick <span style=${S('font-weight:200;font-style:normal')}>A City</span></div></div>
        <button onClick=${v.closeCity} aria-label="Close" style=${S('width:34px;height:34px;border-radius:50%;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:800;cursor:pointer')}>✕</button>
      </div>
      ${v.cityRows.map(c => html`
      <button key=${c.id} onClick=${c.onClick} aria-pressed=${c.on} style=${S(`display:flex;align-items:center;gap:12px;padding:10px 12px 10px 10px;border-radius:24px;cursor:pointer;text-align:left;color:#10183F;border:${c.on ? '0' : '1px solid rgba(255,255,255,.95)'};background:${c.on ? '#10183F' : 'rgba(255,255,255,.7)'};${c.on ? 'color:#fff;box-shadow:0 10px 24px rgba(16,24,63,.25)' : 'box-shadow:inset 0 2px 1px #fff'}`)}>
        <span class="emo" aria-hidden="true" style=${S(`width:46px;height:46px;flex:none;border-radius:16px;background:${c.on ? 'rgba(255,255,255,.14)' : '#FFF3DF'};display:flex;align-items:center;justify-content:center;font-size:24px`)}>${c.emoji}</span>
        <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-size:17px;font-weight:900;font-style:italic;letter-spacing:-.3px')}>${c.name}</span><span style=${S(`${MONO};font-size:10px;font-weight:700;color:${c.on ? '#FFC425' : '#4A5275'}`)}>${c.count} ${c.count === 1 ? 'SPOT' : 'SPOTS'} · ${c.transit.toUpperCase()}</span></span>
        ${c.on ? html`<span style=${S('width:28px;height:28px;border-radius:50%;background:#FFC425;color:#10183F;display:flex;align-items:center;justify-content:center;flex:none')}>${Ico('M5 12l5 5 9-10', 14, 'currentColor', 3)}</span>` : Ico('M9 6l6 6-6 6', 16, '#4A5275', 2.4)}
      </button>`)}
      <div style=${S('font-size:11.5px;font-weight:600;color:#5A6080;padding:0 6px;line-height:1.4')}>Each city keeps its own spots, home and day plan. Your lists stay the same everywhere.</div>
    </div>
  </div>`;
}

function Onboarding(v) {
  const step = v.obStep, bullets = [['S', '#808183'], ['1', '#EE352E'], ['2', '#FCCC0A'], ['3', '#00933C']];
  const sign = (txt) => html`
    <div style=${S('align-self:stretch;display:flex;align-items:center;gap:10px;background:#111111;color:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 10px 24px rgba(16,24,63,.25),inset 0 1px 0 rgba(255,255,255,.12)')}>
      <span style=${S('flex:1;min-width:0;font-size:15px;font-weight:800;letter-spacing:.2px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${txt}</span>
      <span style=${S('display:flex;gap:5px;flex:none')}>${bullets.map(([t, c], i) => html`<span key=${i} aria-hidden="true" style=${S(`width:24px;height:24px;border-radius:50%;background:${i <= step ? c : 'transparent'};border:2px solid ${c};color:${i <= step ? (c === '#FCCC0A' ? '#111' : '#fff') : c};font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;box-sizing:border-box`)}>${t}</span>`)}</span>
    </div>`;
  const art = (em, bg) => html`<div aria-hidden="true" class="lg" style=${S(`width:118px;height:118px;border-radius:50%;${GL};display:flex;align-items:center;justify-content:center;font-size:58px;position:relative`)}><span class="emo">${em}</span><span style=${S(`position:absolute;right:-4px;bottom:6px;width:34px;height:34px;border-radius:50%;background:${bg};border:3px solid #FFFFFF`)}></span></div>`;
  const title = (t, sub) => html`<div style=${S('display:flex;flex-direction:column;gap:10px;align-items:center')}><h1 style=${S('margin:0;font-size:38px;line-height:1;font-weight:900;font-style:italic;letter-spacing:-1.4px;text-wrap:balance')}>${t}</h1>${sub && html`<p style=${S('margin:0;font-size:15px;line-height:1.45;font-weight:500;color:#3C4466;text-wrap:pretty;display:flex;flex-direction:column;gap:6px')}>${noteLines(sub).map((l, i) => html`<span key=${i}>${l}</span>`)}</p>`}</div>`;
  const go = (label, onClick, type) => html`
    <div style=${S('align-self:stretch;display:flex;align-items:center')}>
      <button type=${type || 'button'} onClick=${onClick} style=${S('flex:1;min-width:0;height:58px;border-radius:999px;border:0;background:#10183F;color:#fff;font-size:17px;font-weight:900;font-style:italic;cursor:pointer;text-align:left;padding-left:24px;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25),0 12px 26px rgba(16,24,63,.25)')}>${label}</button>
      <button type=${type || 'button'} onClick=${onClick} aria-label=${label} style=${S('margin-left:8px;width:58px;height:58px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.55);background:radial-gradient(circle at 35% 28%,#FFB27F,#FF6B1A 58%,#E8561A);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 3px 1px rgba(255,255,255,.55),0 12px 26px rgba(255,107,26,.4)')}>${Ico('M5 12h14M13 6l6 6-6 6', 20, 'currentColor', 2.4)}</button>
    </div>`;
  const back = step > 0 && step < 3 && html`<button onClick=${v.obBack} style=${S('align-self:flex-start;border:0;background:none;color:#1B3DB8;font-weight:800;font-size:14px;cursor:pointer;padding:4px 0')}>← Back</button>`;
  const field = 'width:100%;height:56px;border-radius:999px;border:1px solid rgba(255,255,255,.95);background:rgba(255,255,255,.85);box-shadow:inset 0 2px 1px #fff,0 8px 20px rgba(16,24,63,.08);padding:0 20px;font-family:inherit;font-size:17px;font-weight:700;color:#10183F;outline:none;box-sizing:border-box';
  const msg = v.obMsg && html`<div role="status" style=${S('font-size:13px;font-weight:700;color:#E8242C')}>${v.obMsg}</div>`;
  return html`
  <div data-screen-label="Welcome" class="noscroll" style=${S(`position:absolute;inset:0;z-index:1260;background:var(--bgfx);overflow-y:auto;padding:${T(58)} 22px ${B(30)};display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center;color:#10183F`)}>
    <div aria-hidden="true" style=${S('position:absolute;left:0;right:0;top:0;height:10px;background:repeating-linear-gradient(90deg,#111 0 10px,#FFC425 10px 20px);opacity:.9')}></div>
    ${step === 0 && html`
      ${sign('The Spotted In Express')}
      <div style=${S('margin-top:auto')}>${art('🗽', '#FFC425')}</div>
      ${title('Welcome Aboard!', 'Your Map Of Every Café, Bakery, Restaurant And Cute Shop You Spot Online. Stand Clear Of The Closing Doors — We’ll Set You Up In Two Quick Stops.')}
      <div style=${S('margin-top:auto;align-self:stretch;display:flex;flex-direction:column;gap:10px')}>${go('Let’s Ride', v.obStart)}</div>`}
    ${step === 1 && html`
      ${sign('Next Stop: You')}
      ${back}
      ${art('🥯', '#EE352E')}
      ${title('How Do You Want Us To Call You?', 'Your Bodega Guy Knows You By Name. So Should We. Friends On Your Shared Lists See It Too.')}
      <form onSubmit=${v.obNameNext} style=${S('align-self:stretch;display:flex;flex-direction:column;gap:12px;margin-top:auto')}>
        <label for="ob-name" style=${S('position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)')}>First Name</label>
        <input id="ob-name" autocomplete="given-name" autocapitalize="words" value=${v.obName} onChange=${v.onObName} placeholder="First Name Or Nickname" maxlength="40" style=${S(field + ';text-align:center')}/>
        ${msg}
        ${go('That’s Me', null, 'submit')}
      </form>`}
    ${step === 2 && html`
      ${sign('Next Stop: Home Base')}
      ${back}
      ${art('🏠', '#FCCC0A')}
      ${title('Where’s Home, ' + v.obFirst + '?', 'Pick Your City, Then Your Address If You Like. We’ll Use It To Show How Far Each Spot Is From Your Couch. It Stays Private To Your Account.')}
      <div role="radiogroup" aria-label="Your City" style=${S('align-self:stretch;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px')}>
        ${v.cityRows.map(c => html`<button key=${c.id} type="button" role="radio" aria-checked=${c.on} onClick=${c.onClick} style=${S(`height:62px;border-radius:20px;border:${c.on ? '0' : '1px solid rgba(255,255,255,.95)'};background:${c.on ? '#10183F' : 'rgba(255,255,255,.75)'};color:${c.on ? '#fff' : '#10183F'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;box-shadow:${c.on ? '0 8px 18px rgba(16,24,63,.25)' : 'inset 0 2px 1px #fff'}`)}><span class="emo" aria-hidden="true" style=${S('font-size:20px')}>${c.emoji}</span><span style=${S('font-size:12px;font-weight:900;font-style:italic')}>${c.short}</span></button>`)}
      </div>
      <form onSubmit=${v.obFind} style=${S('align-self:stretch;display:flex;flex-direction:column;gap:10px;margin-top:auto;text-align:left')}>
        <label for="ob-addr" style=${S('position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)')}>Home Address</label>
        <div style=${S('display:flex;gap:8px')}>
          <input id="ob-addr" autocomplete="street-address" value=${v.obAddr} onChange=${v.onObAddr} placeholder="Address Or Cross Streets" style=${S(field + ';flex:1;min-width:0')}/>
          <button type="submit" class=${v.obBusy ? 'ai-busy' : ''} style=${S('flex:none;height:56px;padding:0 18px;border-radius:999px;border:0;background:#FFC425;color:#10183F;font-weight:900;font-size:15px;cursor:pointer;box-shadow:inset 0 2px 1px rgba(255,255,255,.7)')}>${v.obBusy ? '…' : 'Find'}</button>
        </div>
        ${msg}
        ${v.obRes.length > 0 && html`<div class="lg" style=${S(`${GL};border-radius:24px;padding:6px`)}>${v.obRes.map((r, i) => html`
          <button key=${i} type="button" onClick=${() => v.obPick(r)} style=${S(`display:flex;flex-direction:column;gap:2px;width:100%;text-align:left;border:0;background:transparent;padding:10px 12px;border-radius:18px;cursor:pointer;color:#10183F;${i ? 'border-top:1px solid rgba(16,24,63,.08)' : ''}`)}><span style=${S('font-weight:800;font-size:15px')}>${r.label}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.area || v.cityName}</span></button>`)}</div>`}
        ${v.obHome && html`<div class="lg" style=${S(`${GL};border-radius:24px;padding:12px 16px;display:flex;align-items:center;gap:10px`)}><span style=${S('width:32px;height:32px;border-radius:50%;background:#1F9D6B;color:#fff;display:flex;align-items:center;justify-content:center;flex:none')}>${Ico('M5 12l5 5 9-10', 16, 'currentColor', 3)}</span><span style=${S('display:flex;flex-direction:column;min-width:0')}><span style=${S('font-weight:800;font-size:15px')}>Home Base Set</span><span style=${S('font-size:12.5px;font-weight:600;color:#4A5275;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${v.obHome.label}${v.obHome.area ? ' · ' + v.obHome.area : ''}</span></span></div>`}
      </form>
      <div style=${S('align-self:stretch;display:flex;flex-direction:column;gap:6px')}>
        ${v.obHome ? go('Save Home', v.obHomeNext) : ''}
        <button onClick=${v.obSkipHome} style=${S('align-self:center;border:0;background:none;color:#1B3DB8;font-weight:800;font-size:14px;cursor:pointer;padding:10px')}>${v.obHome ? 'Skip Instead' : 'Skip For Now — I’ll Add It Later'}</button>
      </div>`}
    ${step === 3 && html`
      ${sign('Last Stop: The Whole City')}
      <div style=${S('margin-top:auto')}>${art('🚕', '#00933C')}</div>
      ${title('You’re All Set, ' + v.obFirst + '!', 'Tap + To Save A Spot From TikTok, Instagram, Threads Or Google Maps. We’ll Pin It On Your Map So You Never Forget Where That Cute Bakery Was.')}
      <div style=${S('margin-top:auto;align-self:stretch')}>${go('Start Spotting', v.obDone)}</div>`}
  </div>`;
}

function AuthScreen(v) {
  const inp = S('height:52px;border-radius:16px;border:1.5px solid rgba(16,24,63,.14);background:#fff;padding:0 14px;font-family:inherit;font-size:16px;font-weight:600;color:#10183F;outline:none');
  return html`
  <div data-screen-label="Sign In" class="noscroll" style=${S(`position:absolute;inset:0;z-index:1250;background:#1B3DB8;overflow-y:auto;padding:${T(60)} 22px ${B(30)};display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center`)}>
    <div style=${S('margin-top:auto')}>${Logo(true)}</div>
    <div style=${S('display:flex;flex-direction:column;align-items:center;gap:8px;color:#fff')}>
      <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:40px;line-height:.95;letter-spacing:-.02em;color:#fff')}>${v.authTitle}</div>
      <div style=${S('font-size:15px;font-weight:600;color:#C9D0F0')}>Sign In To Keep Your Spots In Sync On Every Device.</div>
    </div>
    ${v.hasJoin && html`
    <div style=${S('align-self:stretch;width:100%;max-width:420px;margin:0 auto;background:#F45FA0;color:#fff;border:1.5px solid rgba(16,24,63,.14);border-radius:22px;padding:14px 16px;display:flex;flex-direction:column;gap:3px;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)')}>
      <span style=${S('font-weight:900;font-style:italic;font-size:20px;line-height:1.1')}>${v.joinTitle} 💌</span>
      <span style=${S('font-size:13.5px;font-weight:700')}>${v.joinSub}</span>
    </div>`}
    <form onSubmit=${v.authSubmit} style=${S('align-self:stretch;width:100%;max-width:420px;margin:0 auto;text-align:left;background:#FFF3DF;border-radius:28px;padding:20px 18px;display:flex;flex-direction:column;gap:14px;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)')}>
      ${v.authUp && v.hasJoin && html`
      <div style=${S('display:flex;flex-direction:column;gap:8px')}>
        <label for="auth-name" style=${S('font-weight:800;font-size:15px')}>Your Name</label>
        <input id="auth-name" autocomplete="given-name" value=${v.authName} onChange=${v.onAuthName} placeholder="So Friends Know It’s You" style=${inp} />
      </div>`}
      <div style=${S('display:flex;flex-direction:column;gap:8px')}>
        <label for="auth-email" style=${S('font-weight:800;font-size:15px')}>Email</label>
        <input id="auth-email" name="email" type="email" autocomplete="username email" inputmode="email" value=${v.authEmail} onChange=${v.onAuthEmail} placeholder="you@example.com" style=${inp} />
      </div>
      <div style=${S('display:flex;flex-direction:column;gap:8px')}>
        <label for="auth-pass" style=${S('font-weight:800;font-size:15px')}>Password</label>
        <div style=${S('position:relative;display:flex')}>
          <input id="auth-pass" name="password" type=${v.showPass ? 'text' : 'password'} autocomplete=${v.authUp ? 'new-password' : 'current-password'} autocapitalize="off" autocorrect="off" spellcheck="false" value=${v.authPass} onChange=${v.onAuthPass} placeholder=${v.authUp ? 'At Least 6 Characters' : 'Your Password'} style=${S('flex:1;min-width:0;height:52px;border-radius:16px;border:1.5px solid rgba(16,24,63,.14);background:#fff;padding:0 54px 0 14px;font-family:inherit;font-size:16px;font-weight:600;color:#10183F;outline:none')} />
          <button type="button" onClick=${v.toggleShowPass} aria-label=${v.showPass ? 'Hide Password' : 'Show Password'} aria-pressed=${v.showPass} style=${S('position:absolute;right:6px;top:6px;width:40px;height:40px;border-radius:12px;border:0;background:rgba(16,24,63,.06);color:#10183F;display:flex;align-items:center;justify-content:center;cursor:pointer')}>${v.showPass ? Ico('M3 3l18 18 M10.6 10.6a2 2 0 0 0 2.8 2.8 M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 5 10 7a13 13 0 0 1-3 3.8 M6.1 6.1A13 13 0 0 0 2 12c1 2 5 7 10 7a9.7 9.7 0 0 0 4-.9', 20, 'currentColor', 2) : Ico('M2 12c1-2 5-7 10-7s9 5 10 7c-1 2-5 7-10 7S3 14 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 20, 'currentColor', 2)}</button>
        </div>
        ${!v.authUp && html`<span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>You Stay Signed In On This Phone. Your iPhone Can Also Save This Password For Next Time.</span>`}
      </div>
      ${v.hasAuthMsg && html`<div role="status" style=${S('font-size:13px;font-weight:700;color:#E8242C;line-height:1.35')}>${v.authMsg}</div>`}
      <button type="submit" style=${S('height:52px;border-radius:999px;border:0;background:#FF6B1A;color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:20px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)')}>${v.authBtn}</button>
    </form>
    <button onClick=${v.authToggle} style=${S('align-self:center;margin-bottom:auto;border:0;background:none;color:#FFC425;font-weight:800;font-size:14px;cursor:pointer;padding:8px')}>${v.authSwitch}</button>
  </div>`;
}

function App(v) {
  return html`
  <div class="stage">
    <div class="device">
      <div class="screen">
        <div class="statusbar" aria-hidden="true">
          <span>9:41</span>
          <span style=${S('width:120px;height:30px;border-radius:20px;background:#10183F;margin-top:2px')}></span>
          <span style=${S('display:flex;align-items:center;gap:3px')}><span style=${S('width:24px;height:12px;border-radius:4px;border:1.5px solid #10183F;padding:1.5px;display:flex')}><span style=${S('flex:1;background:#10183F;border-radius:2px')}></span></span></span>
        </div>
        ${MapScreen(v)}
        ${ExploreScreen(v)}
        ${PlanScreen(v)}
        ${ListsScreen(v)}
        ${v.hasSel && PlaceCard(v)}
        ${v.hasTripSel && TripSelCard(v)}
        ${v.routeOpen && RouteSheet(v)}
        ${v.pickerOpen && Picker(v)}
        ${TabBar(v)}
        ${v.acctOpen && AccountSheet(v)}
        ${v.tripShare && TripShareSheet(v)}
        ${v.tripEdit && EditTripSheet(v)}
        ${v.tripPick && TripPicker(v)}
        ${v.listChoose && ListChooser(v)}
        ${v.newTrip && NewTripSheet(v)}
        ${AddSheet(v)}
        ${v.authOpen && AuthScreen(v)}
        ${v.cityOpen && CityPicker(v)}
        ${v.obOpen && Onboarding(v)}
        ${v.hasToast && html`
        <div role="status" style=${S(`position:absolute;top:${T(54)};left:0;right:0;z-index:1300;display:flex;justify-content:center;pointer-events:none`)}><div style=${S('max-width:90%;text-align:center;background:#10183F;color:#FFC425;font-weight:800;font-size:14px;padding:12px 20px;border-radius:999px;box-shadow:0 8px 24px rgba(16,24,63,.35)')}>${v.toast}</div></div>`}
      </div>
    </div>
  </div>`;
}

// Host: mirrors the design runtime (synchronous logic state, renderVals -> view).
class Host extends React.Component {
  constructor(props) {
    super(props);
    this.state = { v: 0 };
    this.logic = new Component(props);
    this.logic.__host = this;
  }
  __setLogicState(update, cb) {
    const prev = this.logic.state;
    const patch = typeof update === 'function' ? update(prev) : update;
    this.logic.state = { ...prev, ...patch };
    this.setState(s => ({ v: s.v + 1 }), cb);
  }
  componentDidMount() { try { this.logic.componentDidMount(); } catch (e) { console.error(e); } }
  componentDidUpdate(prev) { this.logic.props = this.props; try { this.logic.componentDidUpdate(prev); } catch (e) { console.error(e); } }
  componentWillUnmount() { try { this.logic.componentWillUnmount(); } catch (e) { console.error(e); } }
  render() { return App({ ...this.props, ...this.logic.renderVals() }); }
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Host, APP_PROPS));
