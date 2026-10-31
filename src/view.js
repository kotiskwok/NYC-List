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
        <div style=${S('display:flex;align-items:flex-start;justify-content:space-between;gap:10px')}>
          <div style=${S('min-width:0')}>
            <div style=${S('display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#4A5275')}>Spotted In<span style=${S('display:inline-flex;align-items:center;height:18px;padding:0 7px;border-radius:999px;background:#FFC425;color:#10183F;font-size:10.5px;font-weight:900;font-style:italic;letter-spacing:.4px')}>NYC</span></div>
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
      <button class="lg" onClick=${v.toggleLayers} aria-label="Map Layers: Subway, Bus Routes, Citi Bike" aria-expanded=${v.layersOpen} style=${S(`${sideBtn};${v.layersOn ? 'border:1px solid rgba(255,255,255,.5);background:#10183F;box-shadow:0 10px 26px rgba(16,24,63,.3)' : GL};color:${v.layersOn ? '#FFC425' : '#10183F'}`)}>${Ico('M12 3l9 5-9 5-9-5z M3 13l9 5 9-5', 22)}</button>
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
        <span style=${S(`width:30px;height:30px;flex:none;border-radius:10px;background:${r.col};color:#fff;display:flex;align-items:center;justify-content:center`)}>${r.key === 'sub' ? Ico('M8 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z M5 10h14 M8 21l2-4 M16 21l-2-4', 17, '#fff', 2) : r.key === 'bus' ? Ico('M6 3h12a2 2 0 0 1 2 2v11H4V5a2 2 0 0 1 2-2z M4 10h16 M7 19v2 M17 19v2 M4 16v3h16v-3', 17, '#fff', 2) : Ico('M5.5 17.5a3.5 3.5 0 1 0 0-.01z M18.5 17.5a3.5 3.5 0 1 0 0-.01z M5.5 17.5L9 9h6l3.5 8.5 M9 9l3 8.5 M8 6h3', 17, '#fff', 2)}</span>
        <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px')}><span style=${S('font-weight:800;font-size:14px')}>${r.label}</span><span style=${S('font-size:11.5px;font-weight:600;color:#4A5275')}>${r.sub}</span></span>
        <span aria-hidden="true" style=${S(`width:40px;height:24px;flex:none;border-radius:999px;background:${r.on ? '#1B3DB8' : 'rgba(16,24,63,.15)'};position:relative;transition:background .2s`)}><span style=${S(`position:absolute;top:2px;left:${r.on ? 18 : 2}px;width:20px;height:20px;border-radius:50%;background:#FFFFFF;box-shadow:0 1px 3px rgba(16,24,63,.3);transition:left .2s`)}></span></span>
      </button>`)}
      <div style=${S('padding:4px 10px 4px;font-size:10.5px;color:#6A7090')}>Bus routes: MTA via data.ny.gov · Citi Bike live data</div>
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

function ExploreScreen(v) {
  return html`
  <div data-screen-label="Explore" style=${S(`position:absolute;inset:0;display:${v.exDisplay}`)}>
    <div class="noscroll" style=${S(`position:absolute;inset:0;overflow-y:auto;padding:${T(62)} 20px ${B(200)};display:${v.exPickDisplay}`)}>
      <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:46px;line-height:.9;letter-spacing:-.03em;color:#10183F')}>Where To<br/><span style=${S('font-weight:200;font-style:normal;letter-spacing:-.03em')}>Today?</span></div>
      <p style=${S('margin:10px 0 0;font-size:15px;font-weight:500;color:#3C4466')}>Pick A Vibe, Pick A Neighborhood, Go.</p>
      ${H3('What Kind Of Place?', v.clearCats, v.clearCatsLabel, '28px 0 12px')}
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
        ${v.exTiles.map((t, i) => html`
        <button key=${i} class="press" onClick=${t.onClick} style=${S(`position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:16px;min-height:100px;padding:14px;border-radius:22px;border:2.5px solid ${t.border};background:${t.bg};color:${t.fg};text-align:left;cursor:pointer`)}>
          <span style=${S('display:flex;justify-content:space-between;align-items:center')}><span style=${S(`width:38px;height:38px;border-radius:13px;background:${t.check ? 'rgba(255,255,255,.25)' : t.dot};display:flex;align-items:center;justify-content:center`)}>${CatIcon(t.emoji, 20, t.check ? t.fg : (t.dot === '#FFC425' ? '#10183F' : '#fff'))}</span><span style=${S('font-weight:900;font-size:15px')}>${t.check}</span></span>
          <span style=${S('display:flex;flex-direction:column;gap:3px')}><span style=${S('font-weight:800;font-size:15px;line-height:1.15;text-wrap:pretty')}>${t.name}</span><span style=${S('font-size:12px;font-weight:600;opacity:.8')}>${t.countLabel}</span></span>
        </button>`)}
      </div>
      ${v.exShowPrice && html`
        ${H3('Price Range', v.clearPrices, v.clearPricesLabel, '30px 0 4px')}
        <p style=${S('margin:0 0 12px;font-size:13px;color:#5A6080')}>For Restaurants · Leave Empty For Any Price</p>
        <div style=${S('display:grid;grid-template-columns:repeat(4,1fr);gap:8px')}>
          ${v.exPriceChips.map((p, i) => html`
          <button key=${i} onClick=${p.onClick} style=${S(`height:46px;border-radius:14px;border:2px solid ${p.border};background:${p.bg};color:${p.fg};font-weight:900;font-size:15px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px`)}>${p.label}<span style=${S('font-size:10px;font-weight:700;opacity:.75')}>${p.count}</span></button>`)}
        </div>`}
      ${H3('Which Area?', v.clearAreas, v.clearAreasLabel, '30px 0 4px')}
      <p style=${S('margin:0 0 12px;font-size:13px;color:#5A6080')}>Leave Empty For Anywhere</p>
      <div style=${S('display:flex;flex-direction:column;gap:14px')}>
        ${v.exBoroughs.map((b, i) => html`
        <div key=${i} style=${S('display:flex;flex-direction:column;gap:8px')}>
          <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:13px;color:#E8242C')}>${b.name}</div>
          <div style=${S('display:flex;flex-wrap:wrap;gap:8px')}>
            ${b.areas.map((a, j) => html`
            <button key=${j} onClick=${a.onClick} style=${S(`display:flex;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:999px;border:2px solid ${a.border};background:${a.bg};color:${a.fg};opacity:${a.op};font-weight:700;font-size:13px;cursor:pointer`)}>${a.name}<span style=${S('opacity:.7;font-weight:600')}>${a.count}</span></button>`)}
          </div>
        </div>`)}
      </div>
      <button onClick=${v.toggleHideVisited} role="switch" aria-checked=${v.hvKnob !== '0px'} style=${S('margin-top:26px;width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:18px;border:0;background:#fff;cursor:pointer;color:#10183F')}>
        <span style=${S('font-weight:700;font-size:15px')}>Hide Places I've Been</span>
        <span style=${S(`width:48px;height:28px;border-radius:999px;background:${v.hvTrack};padding:3px;display:flex;transition:background .2s`)}><span style=${S(`width:22px;height:22px;border-radius:50%;background:#FFFFFF;transform:translateX(${v.hvKnob});transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)`)}></span></span>
      </button>
    </div>
    <div style=${S(`position:absolute;left:16px;right:16px;bottom:${B(104)};z-index:20;display:${v.exPickDisplay}`)}>
      <button onClick=${v.showResults} style=${S(`width:100%;height:46px;border-radius:999px;border:0;background:${v.showBtnBg};color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)`)}>${v.showBtnLabel}</button>
    </div>
    <div style=${S(`position:absolute;inset:0;display:${v.exResDisplay};flex-direction:column`)}>
      <div style=${S(`flex:none;padding:${T(54)} 20px 16px;background:#1B3DB8;color:#fff;border-radius:0 0 30px 30px;display:flex;flex-direction:column;gap:10px;z-index:5;box-shadow:0 6px 20px rgba(16,24,63,.2)`)}>
        <div style=${S('display:flex;justify-content:space-between;gap:8px')}>
          <button onClick=${v.backToPick} style=${S('border:0;background:rgba(255,255,255,.16);color:#fff;font-weight:700;font-size:13px;height:32px;padding:0 14px;border-radius:999px;cursor:pointer')}>← Change Filters</button>
          <button onClick=${v.addAllToPlan} style=${S('border:0;background:#FFC425;color:#10183F;font-weight:800;font-size:13px;height:32px;padding:0 14px;border-radius:999px;cursor:pointer')}>+ Add All To Plan</button>
        </div>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:26px;line-height:1;color:#FFC425;text-wrap:pretty')}>${v.exTitle}</div>
        <div style=${S('font-size:14px;font-weight:600')}>${v.exSub}</div>
        <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;background:rgba(0,0,0,.22);border-radius:999px')}>
          <button onClick=${v.viewList} style=${S(`height:36px;border:0;border-radius:999px;background:${v.listTabBg};color:${v.listTabFg};font-weight:800;font-size:14px;cursor:pointer`)}>List</button>
          <button onClick=${v.viewMap} style=${S(`height:36px;border:0;border-radius:999px;background:${v.mapTabBg};color:${v.mapTabFg};font-weight:800;font-size:14px;cursor:pointer`)}>Map</button>
        </div>
      </div>
      <div style=${S('position:relative;flex:1;min-height:0;margin-top:-30px')}>
        <div class="noscroll" style=${S(`position:absolute;inset:0;overflow-y:auto;padding:44px 16px ${B(124)};display:${v.exListDisplay};flex-direction:column;gap:10px`)}>
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

function PlanScreen(v) {
  // V5 mockup: the map on top, then a two-weight heading, a big glass "Total Trip" card, glass stop rows joined
  // by dotted travel legs, and an Auto-Order pill with a round + button.
  const small = (n, label) => html`<div style=${S('min-width:0')}><div style=${S('font-size:22px;font-weight:200;letter-spacing:-1px;line-height:1.1')}>${n}</div><div style=${S('font-size:11px;font-weight:700;color:#4A5275')}>${label}</div></div>`;
  return html`
  <div data-screen-label="Plan" class="noscroll" style=${S(`position:absolute;inset:0;display:${v.planDisplay};overflow-y:auto`)}>
    <div style=${S('position:relative;height:260px;flex:none')}>
      <div ref=${v.planMapRef} style=${S('position:absolute;inset:0')}></div>
      <div style=${S('position:absolute;left:0;right:0;bottom:0;height:60px;background:linear-gradient(rgba(255,243,223,0),rgba(255,243,223,.92));z-index:500;pointer-events:none')}></div>
    </div>
    <div style=${S(`position:relative;z-index:501;margin-top:-6px;padding:0 14px ${B(130)};display:flex;flex-direction:column;gap:12px`)}>
      <div style=${S('padding:0 6px')}>
        <div style=${S('font-size:13px;font-weight:700;color:#4A5275')}>${v.planSummary}</div>
        <div style=${S('margin-top:4px;font-weight:900;font-stretch:100%;font-style:italic;font-size:46px;line-height:.95;letter-spacing:-.03em;color:#10183F;white-space:nowrap')}>Plan A <span style=${S('font-weight:200;font-style:normal;letter-spacing:-.03em')}>Day</span></div>
      </div>
      ${v.planHas && html`
      <div class="lg" style=${S(`${GL};border-radius:32px;padding:16px 18px`)}>
        <div style=${S('display:flex;justify-content:space-between;font-size:11.5px;font-weight:700;color:#4A5275')}><span>Total Travel · Estimate</span><span>${v.planStopsN} ${v.planStopsN === 1 ? 'Stop' : 'Stops'}</span></div>
        <div style=${S('display:flex;align-items:baseline;gap:6px;margin-top:4px')}><span style=${S('font-size:84px;font-weight:200;letter-spacing:-6px;line-height:.9')}>${v.planBig}</span><span style=${S('font-size:16px;font-weight:900;font-style:italic')}>${v.planBigUnit}</span></div>
        <div style=${S('display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(16,24,63,.08)')}>
          ${small(v.planWalk, 'Walking')}${small(v.planSub, 'Subway')}${small(v.planStopsN, v.planStopsN === 1 ? 'Stop' : 'Stops')}
        </div>
      </div>`}
      <div style=${S('display:flex;flex-direction:column;gap:8px;padding:2px 2px 0')}>
        <div style=${S('font-weight:800;font-size:13px;color:#4A5275;padding:0 4px')}>Start From</div>
        <div class="lg" style=${S(`${GL};display:flex;gap:4px;padding:4px;border-radius:999px;flex-wrap:wrap`)}>
          ${v.planStartChips.map((c, i) => html`
          <button key=${i} onClick=${c.onClick} aria-pressed=${c.bg !== '#fff'} style=${S(`flex:1;min-width:0;height:42px;padding:0 10px;border-radius:999px;border:0;background:${c.bg !== '#fff' ? '#10183F' : 'transparent'};color:${c.bg !== '#fff' ? '#fff' : '#10183F'};font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap`)}>${c.label}</button>`)}
        </div>
        ${v.planStartMsg && html`<div style=${S('font-size:12px;font-weight:600;color:#E8242C;padding:0 4px')}>${v.planStartMsgText}</div>`}
      </div>
      ${v.planEmpty && html`
      <div class="lg" style=${S(`${GL};border-radius:28px;padding:22px;text-align:center;display:flex;flex-direction:column;gap:6px`)}>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:22px;color:#10183F')}>No Stops Yet</div>
        <div style=${S('font-size:13px;color:#4A5275')}>Add Spots Here, Or Tap "+ Plan" On Any Place.</div>
      </div>`}
      <div style=${S('display:flex;flex-direction:column')}>
        ${v.planRows.map((p, i) => html`
        <div key=${i} style=${S('display:flex;flex-direction:column')}>
          ${p.hasLeg && html`
          <button onClick=${p.legOpen} style=${S('align-self:flex-start;margin:0 0 0 34px;padding:9px 0 9px 22px;border:0;border-left:2px dotted rgba(16,24,63,.35);background:none;display:flex;align-items:center;gap:8px;cursor:pointer;color:#10183F')}>
            <span style=${S('display:flex;gap:3px')}>${p.legBullets.map(Bul)}</span>
            <span style=${S('font-size:12px;font-weight:700;color:#4A5275')}>${p.legText}</span><span style=${S('font-size:12px;font-weight:800;color:#1B3DB8')}>Google Maps ↗</span>
          </button>`}
          <div class="lg" onClick=${p.onClick} style=${S(`${GL};display:flex;align-items:center;gap:12px;border-radius:28px;padding:10px;cursor:pointer`)}>
            <div style=${S('position:relative;flex:none')}><div style=${S(`position:relative;overflow:hidden;width:54px;height:54px;border-radius:18px;background:${p.catBg};color:${p.catFg};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:200;box-shadow:inset 0 2px 1px rgba(255,255,255,.35)`)}>${p.num}${Photo(p.img)}</div>${p.img && html`<span style=${S('position:absolute;top:-5px;left:-5px;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:#10183F;color:#fff;border:2px solid #FFFFFF;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center')}>${p.num}</span>`}</div>
            <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:800;font-size:16px;line-height:1.2')}>${p.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${p.catName} · ${p.area}</span></div>
            <div style=${S('display:flex;gap:4px;flex:none')}>
              <button onClick=${p.up} aria-label="Move up" style=${S(`width:32px;height:32px;border-radius:50%;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:900;font-size:14px;cursor:pointer;opacity:${p.upOp}`)}>↑</button>
              <button onClick=${p.down} aria-label="Move down" style=${S(`width:32px;height:32px;border-radius:50%;border:0;background:rgba(16,24,63,.07);color:#10183F;font-weight:900;font-size:14px;cursor:pointer;opacity:${p.downOp}`)}>↓</button>
              <button onClick=${p.remove} aria-label="Remove" style=${S('width:32px;height:32px;border-radius:50%;border:0;background:#FFE2DF;color:#E8242C;font-weight:900;font-size:13px;cursor:pointer')}>✕</button>
            </div>
          </div>
        </div>`)}
      </div>
      <div style=${S('display:flex;align-items:center;gap:8px;margin-top:2px')}>
        <div style=${S('flex:1;display:flex;align-items:center;min-width:0')}>
          <button class="lg" onClick=${v.autoOrder} style=${S(`flex:1;min-width:0;height:54px;border-radius:999px;${GL};color:#10183F;display:flex;align-items:center;padding-left:22px;font-size:15px;font-weight:800;cursor:pointer`)}>Auto-Order Route</button>
          <button onClick=${v.autoOrder} aria-label="Auto-Order Route" style=${S('margin-left:8px;width:54px;height:54px;flex:none;border-radius:50%;border:0;background:#10183F;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.3),0 10px 22px rgba(16,24,63,.25)')}>${Ico('M5 12h14M13 6l6 6-6 6', 18, 'currentColor', 2.4)}</button>
        </div>
        <button onClick=${v.openPicker} aria-label="Add Spots" style=${S('width:54px;height:54px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.7);background:linear-gradient(150deg,rgba(255,220,120,.95),rgba(255,196,37,.75));color:#10183F;font-size:26px;font-weight:400;cursor:pointer;box-shadow:inset 0 2px 1px rgba(255,255,255,.85),0 10px 22px rgba(255,170,0,.25)')}>+</button>
      </div>
      ${v.planHas && html`<div style=${S('display:flex;justify-content:center')}><button onClick=${v.clearPlan} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:13px;cursor:pointer;padding:6px')}>Clear Plan</button></div>`}
      <div style=${S('font-size:11px;color:#6A7090;text-align:center')}>Travel Times Are Estimates — Tap A Leg For Live Times.</div>
    </div>
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

function ListsScreen(v) {
  const t = v.trip;
  return html`
  <div data-screen-label="Lists" style=${S(`position:absolute;inset:0;display:${v.listsDisplay}`)}>
    <div ref=${v.tripMapRef} style=${S(`position:absolute;top:0;left:0;right:0;height:${v.tripMapH};z-index:0;isolation:isolate;visibility:${t ? 'visible' : 'hidden'}`)}></div>
    ${v.listsIndex ? html`
    <div class="noscroll" style=${S(`position:absolute;inset:0;z-index:5;background:var(--bgfx);overflow-y:auto;padding:${T(62)} 18px ${B(130)};display:flex;flex-direction:column;gap:14px`)}>
      <div>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:46px;line-height:.95;letter-spacing:-.03em;color:#10183F;white-space:nowrap')}>My <span style=${S('font-weight:200;font-style:normal;letter-spacing:-.03em')}>Lists</span></div>
        <p style=${S('margin:10px 0 0;font-size:15px;font-weight:500;color:#3C4466')}>Gather Spots For A Visit Or A Big Day Out, Then Plan It Together.</p>
      </div>
      ${v.listsSignedIn && !v.listsMissing && html`<button onClick=${v.openNewTrip} style=${S('height:48px;border-radius:999px;border:0;background:#FF6B1A;color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,63,.2),inset 0 1px 0 rgba(255,255,255,.4)')}>+ New List</button>`}
      ${v.listsLocal && Msg('Sign In To Use Lists', 'Lists Live In Your Account So You Can Share Them With Friends.')}
      ${v.listsMissing && Msg('One Quick Setup Step', 'Lists Need Their Database Tables. Run supabase/lists.sql Once In Supabase → SQL Editor, Then Come Back.', 'Check Again', v.retryLists)}
      ${v.listsLoading && html`<div role="status" style=${S('text-align:center;font-weight:700;color:#4A5275;padding:20px')}>Loading Your Lists…</div>`}
      ${v.listsError && Msg('Can’t Load Lists Right Now', 'Check Your Connection And Try Again.', 'Try Again', v.retryLists)}
      ${v.listsEmpty && Msg('No Lists Yet', 'Make One For A Friend’s Visit, A Birthday Or A Weekend — Then Invite Them To Add Spots Too.')}
      ${v.listCards.map((c, i) => html`
      <button key=${i} class="press" onClick=${c.onClick} style=${S('display:flex;gap:14px;align-items:stretch;width:100%;text-align:left;background:#fff;border:0;border-radius:24px;padding:12px;cursor:pointer;color:#10183F;box-shadow:0 2px 8px rgba(16,24,63,.06)')}>
        <span style=${S(`position:relative;overflow:hidden;width:62px;min-height:62px;flex:none;border-radius:16px;background:${c.bg};color:${c.fg};display:flex;align-items:center;justify-content:center;font-weight:900;font-stretch:100%;font-style:italic;font-size:30px;border:1.5px solid rgba(16,24,63,.14)`)}>${c.initial}${Photo(c.img)}</span>
        <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding:2px 0')}>
          <span style=${S('font-weight:800;font-size:17px;line-height:1.2')}>${c.name}</span>
          <span style=${S('font-size:13px;font-weight:600;color:#4A5275')}>${c.meta}</span>
          <span style=${S('display:flex;align-items:center;gap:6px;flex-wrap:wrap')}>
            <span style=${S('font-size:12px;font-weight:700;color:#1B3DB8')}>${c.who}</span>
            ${c.tags.map((g, j) => html`<span key=${j} style=${S(`font-size:11px;font-weight:800;background:${g.bg};color:#fff;padding:3px 8px;border-radius:999px`)}>${g.t}</span>`)}
          </span>
        </span>
      </button>`)}
    </div>` : html`
    <div style=${S(`position:absolute;top:${T(56)};left:16px;right:16px;z-index:600;display:flex;flex-direction:column;gap:10px;pointer-events:none`)}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
        <button class="lg" onClick=${t.back} aria-label="All Lists" style=${S(`pointer-events:auto;width:46px;height:46px;border-radius:50%;${GL};color:#10183F;display:flex;align-items:center;justify-content:center;cursor:pointer`)}>${Ico(BACK, 20, 'currentColor', 2.4)}</button>
        ${(() => { const av = html`<span style=${S('display:flex')}>${t.avatars.map((a, i) => html`<span key=${a.key} style=${S('display:flex')}>${Avatar(a.src, a.initial, 32, a.bg, `${i ? 'margin-left:-10px;' : ''}border:2px solid #FFFFFF`)}</span>`)}</span>`;
          return t.isOwner ? html`<button class="lg" onClick=${t.openShare} style=${S(`pointer-events:auto;display:flex;align-items:center;gap:8px;height:46px;padding:0 6px 0 14px;border-radius:999px;${GL};color:#10183F;font-size:13px;font-weight:800;cursor:pointer`)}>Share & Invite${av}</button>`
            : html`<div style=${S(`pointer-events:auto;display:flex;align-items:center;height:46px;padding:0 6px;border-radius:999px;${GL}`)}>${av}</div>`; })()}
      </div>
      ${t.hasToggle && html`
      <div role="tablist" style=${S(`pointer-events:auto;display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:16px;${GL}`)}>
        <button role="tab" aria-selected=${t.showList} onClick=${t.viewList} style=${S(`height:36px;border:0;border-radius:12px;background:${t.showList ? '#FFFFFF' : 'transparent'};color:${t.showList ? '#10183F' : '#3A4470'};font-weight:${t.showList ? 800 : 700};font-size:13px;cursor:pointer;${t.showList ? 'box-shadow:0 2px 8px rgba(16,24,63,.12)' : ''}`)}>This List</button>
        <button role="tab" aria-selected=${t.showMap} onClick=${t.viewMap} style=${S(`height:36px;border:0;border-radius:12px;background:${t.showMap ? '#FFFFFF' : 'transparent'};color:${t.showMap ? '#10183F' : '#3A4470'};font-weight:${t.showMap ? 800 : 700};font-size:13px;cursor:pointer;${t.showMap ? 'box-shadow:0 2px 8px rgba(16,24,63,.12)' : ''}`)}>${t.mapTabLabel}</button>
      </div>`}
      ${t.showMap && html`
      <div class="lg" style=${S(`align-self:flex-start;pointer-events:auto;${GL};border-radius:18px;padding:9px 13px;display:flex;flex-direction:column;gap:2px;max-width:100%`)}>
        <span style=${S('font-weight:900;font-style:italic;font-size:16px')}>${t.name}</span>
        <span style=${S('font-family:var(--mono);font-size:10.5px;font-weight:700;color:#3A4470;text-transform:uppercase')}>${t.mapNote}</span>
      </div>`}
    </div>
    ${t.showList && html`
    <section aria-label=${t.name} class="noscroll" style=${S(`position:absolute;left:8px;right:8px;top:calc(var(--st) + ${t.hasToggle ? 318 : 272}px);bottom:${B(96)};z-index:5;${GL2};border-radius:36px;overflow-y:auto;padding:18px 14px 20px`)}><div style=${S('display:flex;flex-direction:column;gap:12px')}>
      <div style=${S('display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:0 4px')}>
        <div style=${S('display:flex;flex-direction:column;gap:5px;min-width:0')}>
          <span style=${S('font-size:11px;font-weight:800;letter-spacing:.6px;color:#4A5275')}>${t.metaMono}</span>
          <h1 style=${S('margin:0;font-size:34px;line-height:1;font-weight:900;font-style:italic;font-stretch:100%;letter-spacing:-1.2px;overflow-wrap:anywhere')}>${t.name}</h1>
          ${t.syncNote && html`<span role="status" style=${S('font-size:11px;font-weight:700;color:#5A6080')}>${t.syncNote}</span>`}
        </div>
        <div style=${S('flex:none;display:flex;align-items:center;gap:6px')}>
          ${t.routeDirs && !t.sections.some(x => x.hasTitle && x.hasDirs) && html`<button onClick=${t.routeDirs} aria-label="Open This Day's Route" style=${S('height:40px;padding:0 14px;border-radius:999px;border:none;background:#10183F;color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;gap:6px;cursor:pointer')}>Route${Ico(ARROW_NE, 14, 'currentColor', 2.6)}</button>`}
          ${t.canEdit && html`<button class="lg" onClick=${t.openEdit} aria-label="Edit list details" style=${S(`width:40px;height:40px;border-radius:50%;${GL};color:#10183F;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0`)}>${Ico('M4 20h4L19 9l-4-4L4 16z', 16, 'currentColor', 2.3)}</button>`}
        </div>
      </div>
      ${t.dayChips.length > 0 && html`
      <div role="tablist" aria-label="Days" class="noscroll lg" style=${S(`${GL};display:flex;gap:4px;padding:4px;border-radius:999px;overflow-x:auto`)}>
        ${t.dayChips.map(c => html`<button key=${c.key} role="tab" aria-selected=${c.on} onClick=${c.onClick} style=${S(`flex:1 0 auto;display:flex;align-items:center;justify-content:center;gap:6px;height:42px;padding:0 14px;border-radius:999px;border:0;font-size:13px;cursor:pointer;white-space:nowrap;${c.on ? 'background:#10183F;color:#fff;font-weight:800;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.25)' : 'background:transparent;color:#10183F;font-weight:700'}`)}>${c.key !== 'all' && html`<span style=${S(`width:8px;height:8px;border-radius:50%;background:${c.dashed ? 'transparent' : c.col};${c.dashed ? 'border:1.5px dashed currentColor;box-sizing:border-box' : ''}`)}></span>`}${c.label}</button>`)}
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
    </div></section>`}`}
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
      ${v.authUp && html`
      <div style=${S('display:flex;flex-direction:column;gap:8px')}>
        <label for="auth-name" style=${S('font-weight:800;font-size:15px')}>Your Name</label>
        <input id="auth-name" autocomplete="given-name" value=${v.authName} onChange=${v.onAuthName} placeholder="So Friends Know It’s You" style=${inp} />
      </div>`}
      <div style=${S('display:flex;flex-direction:column;gap:8px')}>
        <label for="auth-email" style=${S('font-weight:800;font-size:15px')}>Email</label>
        <input id="auth-email" type="email" autocomplete="email" inputmode="email" value=${v.authEmail} onChange=${v.onAuthEmail} placeholder="you@example.com" style=${inp} />
      </div>
      <div style=${S('display:flex;flex-direction:column;gap:8px')}>
        <label for="auth-pass" style=${S('font-weight:800;font-size:15px')}>Password</label>
        <input id="auth-pass" type="password" autocomplete=${v.authUp ? 'new-password' : 'current-password'} value=${v.authPass} onChange=${v.onAuthPass} placeholder=${v.authUp ? 'At Least 6 Characters' : 'Your Password'} style=${inp} />
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
