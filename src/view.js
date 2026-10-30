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
  if (_css.size > 4000) _css.clear(); _css.set(str, o); return o;
};
// Offsets: the design was drawn under a 46px status bar with no home indicator.
// --st is the top inset (46px in the desktop frame), --sb the bottom inset.
const T = n => `calc(var(--st) + ${n - 46}px)`;
const B = n => `calc(var(--sb) + ${n}px)`;

// The Spotted In wordmark: a yellow "Spotted" pill with an orange "in NYC" tag, like the app icon.
const Logo = (big) => html`
  <div aria-label="Spotted In NYC" role="img" style=${S(`display:flex;align-items:flex-end;flex:none;pointer-events:auto;transform:rotate(${big ? -3 : -2}deg)`)}>
    <span style=${S(`background:#FFC425;color:#10183F;padding:${big ? '9px 20px 11px' : '6px 15px 8px'};border-radius:999px;font-weight:900;font-stretch:100%;font-style:italic;font-size:${big ? 30 : 20}px;letter-spacing:-.02em;line-height:1;white-space:nowrap;box-shadow:0 ${big ? 5 : 4}px 0 #10183F`)}>Spotted</span>
    <span style=${S(`margin:0 0 ${big ? -10 : -8}px ${big ? -12 : -9}px;background:#FF6B1A;color:#fff;padding:${big ? '5px 11px 6px' : '4px 8px 5px'};border-radius:999px;font-weight:900;font-style:italic;font-size:${big ? 15 : 11.5}px;line-height:1;white-space:nowrap;box-shadow:0 3px 0 #10183F;transform:rotate(6deg)`)}>in NYC</span>
  </div>`;

const Bul = (b, i) => html`<span key=${i} style=${S(`width:20px;height:20px;border-radius:50%;background:${b.bg};color:${b.fg};font-size:10.5px;font-weight:800;display:flex;align-items:center;justify-content:center`)}>${b.t}</span>`;
const H3 = (title, onClear, clearLabel, mt) => html`
  <div style=${S(`display:flex;align-items:baseline;justify-content:space-between;margin:${mt}`)}>
    <h3 style=${S('margin:0;font-size:19px;font-weight:800')}>${title}</h3>
    <button onClick=${onClear} style=${S('border:0;background:none;color:#1B3DB8;font-weight:700;font-size:13px;cursor:pointer;padding:0')}>${clearLabel}</button>
  </div>`;

function MapScreen(v) {
  return html`
  <div data-screen-label="Map" style=${S(`position:absolute;inset:0;display:${v.mapDisplay}`)}>
    <div ref=${v.mainMapRef} style=${S('position:absolute;inset:0')}></div>
    <div style=${S(`position:absolute;top:${T(52)};left:14px;right:14px;z-index:500;display:flex;flex-direction:column;gap:10px;pointer-events:none`)}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        ${Logo(false)}
        <button onClick=${v.openAcct} aria-label=${v.syncOn ? 'Account and sync: ' + v.syncLabel : 'Your spots'} style=${S(`display:flex;align-items:center;gap:7px;border:0;background:#fff;color:#10183F;border-radius:999px;padding:8px 12px;font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 4px 14px rgba(16,24,63,.18);pointer-events:auto;cursor:${v.syncOn ? 'pointer' : 'default'}`)}>${v.statsText}${v.syncOn && html`<span style=${S(`width:8px;height:8px;border-radius:50%;background:${v.syncDot};flex:none`)}></span>`}</button>
      </div>
      <div class="noscroll" style=${S('display:flex;gap:8px;overflow-x:auto;margin:0 -14px;padding:2px 14px 6px;pointer-events:auto')}>
        ${v.mapChips.map((c, i) => html`
        <button key=${i} onClick=${c.onClick} style=${S(`flex:none;display:flex;align-items:center;gap:7px;height:36px;padding:0 14px;border-radius:999px;border:2px solid ${c.border};background:${c.bg};color:${c.fg};font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 3px 10px rgba(16,24,63,.14);white-space:nowrap`)}><span class="emo" style=${S('font-size:15px')} aria-hidden="true">${c.emoji}</span>${c.label}<span style=${S('font-weight:600;opacity:.7')}>${c.count}</span></button>`)}
      </div>
      <div style=${S('display:flex;justify-content:flex-end;gap:8px;pointer-events:auto')}>
        <button onClick=${v.toggleSubway} style=${S(`display:flex;align-items:center;gap:7px;height:36px;padding:0 13px;border-radius:999px;border:2px solid #10183F;background:${v.subBtnBg};color:${v.subBtnFg};font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 3px 10px rgba(16,24,63,.16)`)}><span style=${S('width:11px;height:11px;border-radius:50%;background:#fff;border:2.5px solid #10183F')}></span>Subway</button>
      </div>
    </div>
    <button onClick=${v.locateMe} aria-label="Show My Location" style=${S(`position:absolute;right:14px;bottom:${B(92)};z-index:600;width:48px;height:48px;border-radius:50%;border:2px solid #10183F;background:${v.locBg};color:${v.locFg};display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 0 #10183F`)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="6.5"></circle><circle cx="12" cy="12" r="2.4" fill="currentColor"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></svg>
    </button>
    ${v.locLine && html`
    <div style=${S(`position:absolute;left:14px;right:72px;bottom:${B(96)};z-index:600;background:#fff;border:2px solid #10183F;border-radius:18px;padding:8px 12px;display:flex;flex-direction:column;gap:1px;box-shadow:0 4px 0 #10183F`)}>
      <span style=${S('font-size:12px;font-weight:800;color:#1B3DB8')}>${v.locTitle}</span><span style=${S('font-size:12px;font-weight:600;color:#3C4466;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>${v.locSub}</span>
    </div>`}
    ${v.locFailOpen && html`
    <div style=${S(`position:absolute;left:12px;right:12px;bottom:${B(92)};z-index:960;background:#fff;border-radius:26px;padding:16px;box-shadow:0 14px 40px rgba(16,24,63,.3);display:flex;flex-direction:column;gap:10px`)}>
      <div style=${S('display:flex;justify-content:space-between;align-items:flex-start;gap:10px')}><div style=${S('font-weight:900;font-style:italic;font-size:20px;color:#1B3DB8;line-height:1.1')}>Can't Find You Yet</div>
        <button onClick=${v.closeLocFail} aria-label="Close" style=${S('flex:none;width:30px;height:30px;border-radius:50%;border:0;background:#F1ECE3;color:#10183F;font-weight:800;cursor:pointer')}>✕</button></div>
      <div style=${S('font-size:13px;line-height:1.4;color:#3C4466')}>${v.locFailMsg}</div>
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:8px')}>
        <button onClick=${v.locateMe} style=${S('height:42px;border-radius:14px;border:2px solid #10183F;background:#fff;color:#10183F;font-weight:800;font-size:13px;cursor:pointer')}>Try Again</button>
        <button onClick=${v.setHereOnMap} style=${S('height:42px;border-radius:14px;border:0;background:#FF6B1A;color:#fff;font-weight:800;font-size:13px;cursor:pointer')}>Tap Where I Am</button>
      </div>
    </div>`}
    ${v.placing && html`
    <div style=${S(`position:absolute;top:${T(52)};left:12px;right:12px;z-index:700;background:#FF6B1A;color:#fff;border-radius:24px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 5px 0 #10183F`)}>
      <div style=${S('display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:18px')}>${v.placingTitle}</span><span style=${S('font-size:12px;font-weight:600')}>Zoom In To See Every Street</span></div>
      <button onClick=${v.cancelPlacing} style=${S('flex:none;height:36px;padding:0 14px;border:0;border-radius:999px;background:#10183F;color:#fff;font-weight:800;font-size:13px;cursor:pointer')}>Back</button>
    </div>`}
  </div>`;
}

function ExploreScreen(v) {
  return html`
  <div data-screen-label="Explore" style=${S(`position:absolute;inset:0;display:${v.exDisplay};background:#FFF3DF`)}>
    <div class="noscroll" style=${S(`position:absolute;inset:0;overflow-y:auto;padding:${T(62)} 20px ${B(200)};display:${v.exPickDisplay}`)}>
      <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:42px;line-height:.92;letter-spacing:-.02em;color:#1B3DB8')}>Where To<br/><span style=${S('color:#FF6B1A')}>Today?</span></div>
      <p style=${S('margin:10px 0 0;font-size:15px;font-weight:500;color:#3C4466')}>Pick A Vibe, Pick A Neighborhood, Go.</p>
      ${H3('What Kind Of Place?', v.clearCats, v.clearCatsLabel, '28px 0 12px')}
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
        ${v.exTiles.map((t, i) => html`
        <button key=${i} class="press" onClick=${t.onClick} style=${S(`position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:16px;min-height:100px;padding:14px;border-radius:22px;border:2.5px solid ${t.border};background:${t.bg};color:${t.fg};text-align:left;cursor:pointer`)}>
          <span style=${S('display:flex;justify-content:space-between;align-items:center')}><span class="emo" style=${S('font-size:24px')} aria-hidden="true">${t.emoji}</span><span style=${S('font-weight:900;font-size:15px')}>${t.check}</span></span>
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
        <span style=${S(`width:48px;height:28px;border-radius:999px;background:${v.hvTrack};padding:3px;display:flex;transition:background .2s`)}><span style=${S(`width:22px;height:22px;border-radius:50%;background:#fff;transform:translateX(${v.hvKnob});transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)`)}></span></span>
      </button>
    </div>
    <div style=${S(`position:absolute;left:16px;right:16px;bottom:${B(92)};z-index:20;display:${v.exPickDisplay}`)}>
      <button onClick=${v.showResults} style=${S(`width:100%;height:46px;border-radius:999px;border:0;background:${v.showBtnBg};color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;cursor:pointer;box-shadow:0 5px 0 #10183F`)}>${v.showBtnLabel}</button>
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
        <div class="noscroll" style=${S(`position:absolute;inset:0;overflow-y:auto;padding:44px 16px ${B(110)};display:${v.exListDisplay};flex-direction:column;gap:10px`)}>
          ${v.resultCards.map((r, i) => html`
          <div key=${i} onClick=${r.onClick} style=${S(`flex:none;display:flex;gap:14px;align-items:stretch;width:100%;background:#fff;border:2px solid ${r.ring};border-radius:24px;padding:12px;cursor:pointer;box-shadow:0 2px 8px rgba(16,24,63,.06)`)}>
            <div style=${S(`width:62px;flex:none;border-radius:16px;background:${r.catBg};color:${r.catFg};display:flex;align-items:center;justify-content:center;font-weight:900;font-stretch:100%;font-style:italic;font-size:30px`)}>${r.initial}</div>
            <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding:2px 0')}>
              <div style=${S('display:flex;justify-content:space-between;align-items:flex-start;gap:8px')}><span style=${S('font-weight:800;font-size:17px;line-height:1.2')}>${r.name}</span>
                ${r.visited && html`<span style=${S('flex:none;font-size:11px;font-weight:800;background:#1F9D6B;color:#fff;padding:3px 8px;border-radius:999px')}>Been Here</span>`}</div>
              <div style=${S('display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;font-weight:600;color:#4A5275')}><span>${r.catName} · ${r.area}</span>${r.hasPrice && html`<span style=${S('font-weight:900;color:#1F9D6B')}>${r.price}</span>`}</div>
              ${r.hasNote && html`<div style=${S('font-size:13px;color:#3C4466;line-height:1.35')}>${r.note}</div>`}
              <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px')}>
                <span style=${S(`font-size:11px;font-weight:700;background:${r.srcBg};color:#fff;padding:3px 8px;border-radius:6px`)}>${r.srcLabel}</span>
                <button onClick=${r.onPlan} style=${S(`height:30px;padding:0 12px;border-radius:999px;border:2px solid #10183F;background:${r.planBg};color:${r.planFg};font-weight:800;font-size:12px;cursor:pointer`)}>${r.planLabel}</button>
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
  return html`
  <div data-screen-label="Plan" class="noscroll" style=${S(`position:absolute;inset:0;display:${v.planDisplay};background:#FFF3DF;overflow-y:auto`)}>
    <div style=${S('position:relative;height:300px;flex:none')}>
      <div ref=${v.planMapRef} style=${S('position:absolute;inset:0')}></div>
      <div style=${S('position:absolute;left:0;right:0;bottom:0;height:40px;background:linear-gradient(rgba(255,243,223,0),#FFF3DF);z-index:500;pointer-events:none')}></div>
    </div>
    <div style=${S(`padding:4px 18px ${B(120)};display:flex;flex-direction:column;gap:16px`)}>
      <div>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:38px;line-height:.95;letter-spacing:-.02em;color:#1B3DB8')}>Plan A <span style=${S('color:#FF6B1A')}>Day</span></div>
        <div style=${S('margin-top:6px;font-size:14px;font-weight:600;color:#3C4466')}>${v.planSummary}</div>
      </div>
      <div style=${S('display:flex;flex-direction:column;gap:8px')}>
        <div style=${S('font-weight:800;font-size:14px')}>Start From</div>
        <div style=${S('display:flex;gap:8px;flex-wrap:wrap')}>
          ${v.planStartChips.map((c, i) => html`
          <button key=${i} onClick=${c.onClick} style=${S(`height:38px;padding:0 14px;border-radius:999px;border:2px solid ${c.border};background:${c.bg};color:${c.fg};font-weight:700;font-size:13px;cursor:pointer`)}>${c.label}</button>`)}
        </div>
        ${v.planStartMsg && html`<div style=${S('font-size:12px;font-weight:600;color:#E8242C')}>${v.planStartMsgText}</div>`}
      </div>
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:8px')}>
        <button onClick=${v.autoOrder} style=${S('height:48px;border-radius:16px;border:0;background:#10183F;color:#FFC425;font-weight:800;font-size:14px;cursor:pointer')}>Auto-Order Route</button>
        <button onClick=${v.openPicker} style=${S('height:48px;border-radius:16px;border:2px solid #10183F;background:#fff;color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>+ Add Spots</button>
      </div>
      ${v.planEmpty && html`
      <div style=${S('background:#fff;border-radius:22px;padding:22px;text-align:center;display:flex;flex-direction:column;gap:6px')}>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:20px;color:#1B3DB8')}>No Stops Yet</div>
        <div style=${S('font-size:13px;color:#4A5275')}>Add Spots Here, Or Tap "+ Plan" On Any Place.</div>
      </div>`}
      <div style=${S('display:flex;flex-direction:column')}>
        ${v.planRows.map((p, i) => html`
        <div key=${i} style=${S('display:flex;flex-direction:column')}>
          ${p.hasLeg && html`
          <button onClick=${p.legOpen} style=${S('align-self:flex-start;margin:0 0 0 22px;padding:10px 0 10px 24px;border:0;border-left:3px dashed #10183F;background:none;display:flex;align-items:center;gap:8px;cursor:pointer;color:#10183F')}>
            <span style=${S('display:flex;gap:3px')}>${p.legBullets.map(Bul)}</span>
            <span style=${S('font-size:13px;font-weight:700')}>${p.legText}</span><span style=${S('font-size:12px;font-weight:700;color:#1B3DB8')}>Google Maps ↗</span>
          </button>`}
          <div onClick=${p.onClick} style=${S('display:flex;align-items:center;gap:12px;background:#fff;border-radius:22px;padding:10px;cursor:pointer;box-shadow:0 2px 8px rgba(16,24,63,.06)')}>
            <div style=${S(`width:44px;height:44px;flex:none;border-radius:50%;background:${p.catBg};color:${p.catFg};display:flex;align-items:center;justify-content:center;font-weight:900;font-stretch:100%;font-style:italic;font-size:20px;border:3px solid #10183F`)}>${p.num}</div>
            <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:800;font-size:16px;line-height:1.2')}>${p.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${p.catName} · ${p.area}</span></div>
            <div style=${S('display:flex;gap:4px;flex:none')}>
              <button onClick=${p.up} aria-label="Move up" style=${S(`width:32px;height:32px;border-radius:10px;border:0;background:#F1ECE3;color:#10183F;font-weight:900;font-size:14px;cursor:pointer;opacity:${p.upOp}`)}>↑</button>
              <button onClick=${p.down} aria-label="Move down" style=${S(`width:32px;height:32px;border-radius:10px;border:0;background:#F1ECE3;color:#10183F;font-weight:900;font-size:14px;cursor:pointer;opacity:${p.downOp}`)}>↓</button>
              <button onClick=${p.remove} aria-label="Remove" style=${S('width:32px;height:32px;border-radius:10px;border:0;background:#FFE2DF;color:#E8242C;font-weight:900;font-size:13px;cursor:pointer')}>✕</button>
            </div>
          </div>
        </div>`)}
      </div>
      ${v.planHas && html`<div style=${S('display:flex;justify-content:center')}><button onClick=${v.clearPlan} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:13px;cursor:pointer;padding:6px')}>Clear Plan</button></div>`}
      <div style=${S('font-size:11px;color:#6A7090;text-align:center')}>Travel Times Are Estimates — Tap A Leg For Live Times.</div>
    </div>
  </div>`;
}

function PlaceCard(v) {
  const sel = v.sel;
  return html`
  <div style=${S(`position:absolute;left:12px;right:12px;bottom:${B(90)};z-index:900;background:#fff;border-radius:30px;padding:18px 18px 12px;box-shadow:0 14px 40px rgba(16,24,63,.3);display:flex;flex-direction:column;gap:10px`)}>
    <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
      <div style=${S('display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0')}>
        <span style=${S(`font-size:12px;font-weight:800;background:${sel.catBg};color:${sel.catFg};padding:5px 10px;border-radius:999px`)}>${sel.catName}</span>
        <span style=${S('font-size:13px;font-weight:700;color:#4A5275')}>${sel.area}</span>
        ${sel.hasPrice && html`<span style=${S('font-size:12px;font-weight:900;color:#1F9D6B;background:#E3F5EA;padding:4px 8px;border-radius:999px')}>${sel.price}</span>`}
      </div>
      <button onClick=${v.closeSel} aria-label="Close" style=${S('flex:none;width:32px;height:32px;border-radius:50%;border:0;background:#F1ECE3;color:#10183F;font-weight:800;font-size:15px;cursor:pointer')}>✕</button>
    </div>
    <div style=${S('font-weight:900;font-stretch:100%;font-size:26px;line-height:1.05;letter-spacing:-.01em')}>${sel.name}</div>
    ${sel.hasNote && html`<div style=${S('font-size:14px;line-height:1.4;color:#3C4466')}>${sel.note}</div>`}
    ${sel.hasStation && html`
    <div style=${S('display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#F6F1E7;border-radius:14px;padding:9px 12px')}>
      <span style=${S('font-size:12px;font-weight:700;color:#4A5275')}>Nearest Subway</span>
      <span style=${S('font-size:13px;font-weight:800')}>${sel.stName}</span>
      <span style=${S('display:flex;gap:3px')}>${sel.stRoutes.map(Bul)}</span>
      <span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${sel.stWalk}</span>
    </div>`}
    <button onClick=${v.openRoute} style=${S('height:42px;border-radius:16px;border:0;background:#FF6B1A;color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:17px;cursor:pointer;box-shadow:0 4px 0 #10183F')}>Get There</button>
    <div style=${S(`display:grid;grid-template-columns:${sel.cols};gap:8px`)}>
      ${sel.hasUrl && html`<button onClick=${v.openSource} style=${S(`height:44px;border-radius:14px;border:0;background:${sel.srcBg};color:#fff;font-weight:800;font-size:12.5px;cursor:pointer`)}>${sel.openLabel}</button>`}
      <button onClick=${v.togglePlanSel} style=${S(`height:44px;border-radius:14px;border:2px solid #1B3DB8;background:${sel.planBg};color:${sel.planFg};font-weight:800;font-size:12.5px;cursor:pointer`)}>${sel.planLabel}</button>
      <button onClick=${v.toggleVisited} style=${S(`height:44px;border-radius:14px;border:2px solid #1F9D6B;background:${sel.visBg};color:${sel.visFg};font-weight:800;font-size:12.5px;cursor:pointer`)}>${sel.visLabel}</button>
    </div>
    <div style=${S('display:flex;justify-content:center;gap:14px;flex-wrap:wrap')}>
      <button onClick=${v.addToListSel} style=${S('border:0;background:none;color:#F45FA0;font-weight:800;font-size:13px;cursor:pointer;padding:6px')}>+ Add To A List</button>
      <button onClick=${v.editSel} style=${S('border:0;background:none;color:#1B3DB8;font-weight:700;font-size:13px;cursor:pointer;padding:6px')}>Edit Spot</button>
      <button onClick=${v.deleteSel} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:13px;cursor:pointer;padding:6px')}>${v.delLabel}</button>
    </div>
  </div>`;
}

function RouteSheet(v) {
  return html`
  <div data-screen-label="Get There" style=${S('position:absolute;left:0;right:0;bottom:0;z-index:980;max-height:60%;background:#FFF3DF;border-radius:30px 30px 0 0;box-shadow:0 -10px 40px rgba(16,24,63,.3);display:flex;flex-direction:column')}>
    <div style=${S('flex:none;padding:18px 18px 10px;display:flex;flex-direction:column;gap:10px')}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        <div style=${S('min-width:0')}><div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:#1B3DB8;line-height:1')}>Get There</div><div style=${S('font-size:13px;font-weight:700;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>To ${v.routeDest}</div></div>
        <button onClick=${v.closeRoute} aria-label="Close" style=${S('flex:none;width:34px;height:34px;border-radius:50%;border:0;background:#fff;color:#10183F;font-weight:800;font-size:15px;cursor:pointer')}>✕</button>
      </div>
      <div style=${S('display:flex;gap:6px;flex-wrap:wrap')}>
        ${v.originChips.map((c, i) => html`
        <button key=${i} onClick=${c.onClick} style=${S(`height:34px;padding:0 12px;border-radius:999px;border:2px solid ${c.border};background:${c.bg};color:${c.fg};font-weight:700;font-size:12.5px;cursor:pointer`)}>${c.label}</button>`)}
      </div>
      ${v.originIsSpot && html`
      <select id="route-spot" value=${v.routeSpotVal} onChange=${v.onRouteSpot} style=${S('height:42px;border-radius:12px;border:2px solid #10183F;background:#fff;padding:0 10px;font-family:inherit;font-size:14px;font-weight:600;color:#10183F')}>
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
  <div style=${S('position:absolute;inset:0;z-index:1050;background:rgba(16,24,63,.4);display:flex;flex-direction:column;justify-content:flex-end')}>
    <div style=${S('max-height:78%;background:#FFF3DF;border-radius:30px 30px 0 0;display:flex;flex-direction:column')}>
      <div style=${S('flex:none;padding:18px 18px 10px;display:flex;align-items:center;justify-content:space-between')}>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:#1B3DB8')}>Add To Plan</div>
        <button onClick=${v.closePicker} style=${S('height:38px;padding:0 16px;border-radius:999px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Done</button>
      </div>
      <div class="noscroll" style=${S(`flex:1;min-height:0;overflow-y:auto;padding:0 16px ${B(30)};display:flex;flex-direction:column;gap:8px`)}>
        ${v.pickerRows.map((r, i) => html`
        <button key=${i} onClick=${r.onClick} style=${S(`display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:2px solid ${r.ring};border-radius:18px;padding:10px 12px;cursor:pointer;color:#10183F`)}>
          <span class="emo" style=${S(`width:34px;height:34px;border-radius:12px;background:${r.catBg};flex:none;display:flex;align-items:center;justify-content:center;font-size:18px`)} aria-hidden="true">${r.emoji}</span>
          <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:800;font-size:15px')}>${r.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.catName} · ${r.area}</span></span>
          <span style=${S(`width:28px;height:28px;border-radius:50%;flex:none;background:${r.chkBg};color:#fff;border:2px solid #10183F;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px`)}>${r.chk}</span>
        </button>`)}
      </div>
    </div>
  </div>`;
}


const PEN = 'height:44px;border-radius:14px;font-weight:800;font-size:13.5px;cursor:pointer';
const Sheet = (title, close, body, closeLabel, z) => html`
  <div onClick=${close} style=${S(`position:absolute;inset:0;z-index:${z || 1050};background:rgba(16,24,63,.4);display:flex;flex-direction:column;justify-content:flex-end`)}>
    <div onClick=${e => e.stopPropagation()} style=${S('max-height:86%;background:#FFF3DF;border-radius:30px 30px 0 0;display:flex;flex-direction:column')}>
      <div style=${S('flex:none;padding:18px 18px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px')}>
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
  <div data-screen-label="Lists" style=${S(`position:absolute;inset:0;display:${v.listsDisplay};background:#FFF3DF`)}>
    <div ref=${v.tripMapRef} style=${S(`position:absolute;top:0;left:0;right:0;height:${v.tripMapH};visibility:${t ? 'visible' : 'hidden'}`)}></div>
    ${v.listsIndex ? html`
    <div class="noscroll" style=${S(`position:absolute;inset:0;z-index:5;background:#FFF3DF;overflow-y:auto;padding:${T(62)} 18px ${B(120)};display:flex;flex-direction:column;gap:14px`)}>
      <div>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:42px;line-height:.92;letter-spacing:-.02em;color:#1B3DB8')}>My <span style=${S('color:#FF6B1A')}>Lists</span></div>
        <p style=${S('margin:10px 0 0;font-size:15px;font-weight:500;color:#3C4466')}>Gather Spots For A Visit Or A Big Day Out, Then Plan It Together.</p>
      </div>
      ${v.listsSignedIn && !v.listsMissing && html`<button onClick=${v.openNewTrip} style=${S('height:48px;border-radius:999px;border:0;background:#FF6B1A;color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;cursor:pointer;box-shadow:0 5px 0 #10183F')}>+ New List</button>`}
      ${v.listsLocal && Msg('Sign In To Use Lists', 'Lists Live In Your Account So You Can Share Them With Friends.')}
      ${v.listsMissing && Msg('One Quick Setup Step', 'Lists Need Their Database Tables. Run supabase/lists.sql Once In Supabase → SQL Editor, Then Come Back.', 'Check Again', v.retryLists)}
      ${v.listsLoading && html`<div role="status" style=${S('text-align:center;font-weight:700;color:#4A5275;padding:20px')}>Loading Your Lists…</div>`}
      ${v.listsError && Msg('Can’t Load Lists Right Now', 'Check Your Connection And Try Again.', 'Try Again', v.retryLists)}
      ${v.listsEmpty && Msg('No Lists Yet', 'Make One For A Friend’s Visit, A Birthday Or A Weekend — Then Invite Them To Add Spots Too.')}
      ${v.listCards.map((c, i) => html`
      <button key=${i} class="press" onClick=${c.onClick} style=${S('display:flex;gap:14px;align-items:stretch;width:100%;text-align:left;background:#fff;border:0;border-radius:24px;padding:12px;cursor:pointer;color:#10183F;box-shadow:0 2px 8px rgba(16,24,63,.06)')}>
        <span style=${S(`width:62px;flex:none;border-radius:16px;background:${c.bg};color:${c.fg};display:flex;align-items:center;justify-content:center;font-weight:900;font-stretch:100%;font-style:italic;font-size:30px;border:2.5px solid #10183F`)}>${c.initial}</span>
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
    <div style=${S(`position:absolute;top:${T(52)};left:14px;right:14px;z-index:600;display:flex;flex-direction:column;gap:8px;pointer-events:none`)}>
      <div style=${S('display:flex;justify-content:space-between;gap:8px')}>
        <button onClick=${t.back} style=${S('pointer-events:auto;height:38px;padding:0 15px;border-radius:999px;border:2px solid #10183F;background:#fff;color:#10183F;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 3px 0 #10183F')}>← All Lists</button>
        ${t.isOwner && html`<button onClick=${t.openShare} style=${S('pointer-events:auto;height:38px;padding:0 16px;border-radius:999px;border:2px solid #10183F;background:#FFC425;color:#10183F;font-weight:900;font-style:italic;font-size:14px;cursor:pointer;box-shadow:0 3px 0 #10183F')}>Share & Invite</button>`}
      </div>
      ${t.hasToggle && html`
      <div style=${S('pointer-events:auto;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;background:#1B3DB8;border-radius:999px;box-shadow:0 4px 14px rgba(16,24,63,.25)')}>
        <button onClick=${t.viewList} style=${S(`height:34px;border:0;border-radius:999px;background:${t.listTabBg};color:${t.listTabFg};font-weight:800;font-size:13.5px;cursor:pointer`)}>This List</button>
        <button onClick=${t.viewMap} style=${S(`height:34px;border:0;border-radius:999px;background:${t.mapTabBg};color:${t.mapTabFg};font-weight:800;font-size:13.5px;cursor:pointer`)}>${t.mapTabLabel}</button>
      </div>`}
      ${t.showMap && html`
      <div style=${S('align-self:flex-start;pointer-events:auto;background:#fff;border:2px solid #10183F;border-radius:18px;padding:8px 12px;display:flex;flex-direction:column;gap:1px;box-shadow:0 4px 0 #10183F;max-width:100%')}>
        <span style=${S('font-weight:900;font-style:italic;font-size:16px;color:#1B3DB8')}>${t.name}</span>
        <span style=${S('font-size:12px;font-weight:600;color:#3C4466')}>${t.mapNote}</span>
      </div>`}
    </div>
    ${t.showList && html`
    <div class="noscroll" style=${S(`position:absolute;top:240px;left:0;right:0;bottom:0;z-index:5;overflow-y:auto;background:#FFF3DF;border-radius:28px 28px 0 0;box-shadow:0 -8px 24px rgba(16,24,63,.12);padding:20px 18px ${B(120)};display:flex;flex-direction:column;gap:16px`)}>
      <div>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:34px;line-height:.98;letter-spacing:-.02em;color:#1B3DB8;text-wrap:pretty')}>${t.name}</div>
        <div style=${S('margin-top:6px;font-size:14px;font-weight:600;color:#3C4466')}>${t.sub}</div>
        ${t.syncNote && html`<div role="status" style=${S('margin-top:4px;font-size:12px;font-weight:700;color:#7A809C')}>${t.syncNote}</div>`}
      </div>
      ${t.canEdit && html`
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:8px')}>
        <button onClick=${t.openPick} style=${S('height:48px;border-radius:16px;border:0;background:#10183F;color:#FFC425;font-weight:800;font-size:14px;cursor:pointer')}>+ From My Map</button>
        <button onClick=${t.openAddNew} style=${S('height:48px;border-radius:16px;border:2px solid #10183F;background:#fff;color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>+ New Spot</button>
      </div>
      <div style=${S('display:flex;gap:8px;align-items:center;flex-wrap:wrap')}>
        <button onClick=${t.addDay} style=${S('height:38px;padding:0 14px;border-radius:999px;border:2px dashed #10183F;background:transparent;color:#10183F;font-weight:800;font-size:13px;cursor:pointer')}>${t.dayBtn}</button>
        ${t.hasDays && html`
        <label style=${S('display:flex;align-items:center;gap:8px;height:38px;padding:0 6px 0 14px;border-radius:999px;background:#fff;font-weight:700;font-size:13px;color:#10183F')}>Starts
          <input type="date" value=${t.dateVal} onChange=${t.onDate} aria-label="First day's date" style=${S('height:30px;border:0;border-radius:999px;background:#F6F1E7;padding:0 8px;font-family:inherit;font-size:13px;font-weight:700;color:#10183F')} /></label>`}
      </div>`}
      ${t.empty && Msg('Nothing On The List Yet', t.canEdit ? 'Pull Spots From Your Map, Or Add A Brand-New One You Saw Online.' : 'Spots Will Show Up Here As They’re Added.')}
      ${t.sections.map(sec => html`
      <div key=${sec.key} style=${S('display:flex;flex-direction:column;gap:8px')}>
        ${sec.hasTitle && html`
        <div style=${S('display:flex;align-items:center;gap:8px;margin-top:4px')}>
          <span style=${S(`width:12px;height:12px;border-radius:50%;background:${sec.col};border:2px solid #10183F;flex:none`)}></span>
          <span style=${S(`font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;color:${sec.col === '#7A809C' ? '#4A5275' : sec.col}`)}>${sec.title}</span>
          <span style=${S('font-size:12px;font-weight:700;color:#7A809C')}>${sec.count}</span>
          <span style=${S('flex:1')}></span>
          ${sec.hasDirs && html`<button onClick=${sec.onDirs} style=${S('border:0;background:none;color:#1B3DB8;font-weight:800;font-size:12px;cursor:pointer;padding:4px')}>Route ↗</button>`}
          ${sec.canRemove && html`<button onClick=${sec.onRemove} aria-label="Remove this day" style=${S('width:28px;height:28px;border-radius:9px;border:0;background:#FFE2DF;color:#E8242C;font-weight:900;font-size:12px;cursor:pointer')}>✕</button>`}
        </div>`}
        ${sec.empty && html`<div style=${S('border:2px dashed rgba(16,24,63,.18);border-radius:18px;padding:14px;text-align:center;font-size:12.5px;font-weight:600;color:#7A809C')}>Pick This Day On A Spot To Move It Here</div>`}
        ${sec.rows.map(r => html`
        <div key=${r.key} onClick=${r.onClick} style=${S(`display:flex;gap:12px;align-items:center;background:#fff;border:2px solid ${r.ring};border-radius:22px;padding:10px;cursor:pointer;box-shadow:0 2px 8px rgba(16,24,63,.06)`)}>
          <div class="emo" style=${S(`width:42px;height:42px;flex:none;border-radius:50%;background:${r.badge};color:${r.badgeFg};display:flex;align-items:center;justify-content:center;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;border:3px solid #10183F`)}>${r.num || r.emoji}</div>
          <div style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}>
            <span style=${S('font-weight:800;font-size:16px;line-height:1.2')}>${r.name}</span>
            <span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub}</span>
            ${r.hasBy && html`<span style=${S('font-size:11.5px;font-weight:800;color:#F45FA0')}>${r.by}</span>`}
            ${r.canEdit && r.hasDays && html`
            <select value=${r.dayVal} onClick=${e => e.stopPropagation()} onChange=${r.onDay} aria-label="Move to day" style=${S('align-self:flex-start;margin-top:4px;height:28px;border-radius:999px;border:2px solid #10183F;background:#FFF3DF;padding:0 8px;font-family:inherit;font-size:12px;font-weight:800;color:#10183F')}>
              ${r.dayOpts.map(o => html`<option key=${o.v} value=${String(o.v)}>${o.label}</option>`)}
            </select>`}
          </div>
          ${r.canEdit && html`
          <div style=${S('display:flex;flex-direction:column;gap:4px;flex:none')}>
            <button onClick=${r.up} aria-label="Move up" style=${S(`width:30px;height:28px;border-radius:9px;border:0;background:#F1ECE3;color:#10183F;font-weight:900;font-size:13px;cursor:pointer;opacity:${r.upOp}`)}>↑</button>
            <button onClick=${r.down} aria-label="Move down" style=${S(`width:30px;height:28px;border-radius:9px;border:0;background:#F1ECE3;color:#10183F;font-weight:900;font-size:13px;cursor:pointer;opacity:${r.downOp}`)}>↓</button>
          </div>`}
        </div>`)}
      </div>`)}
      <div style=${S('display:flex;flex-direction:column;gap:8px;margin-top:6px')}>
        <div style=${S('font-weight:800;font-size:15px')}>On This List</div>
        <div style=${S('background:#fff;border-radius:20px;padding:6px 14px')}>
          ${t.people.map((p, i) => html`
          <div key=${p.key} style=${S(`display:flex;align-items:center;gap:10px;padding:8px 0;${i ? 'border-top:1px solid #EFE8DB' : ''}`)}>
            <span style=${S(`width:32px;height:32px;border-radius:50%;flex:none;background:${i ? '#F45FA0' : '#FFC425'};color:${i ? '#fff' : '#10183F'};display:flex;align-items:center;justify-content:center;font-weight:900;font-style:italic;font-size:15px;border:2px solid #10183F`)}>${(p.name || '?')[0]}</span>
            <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column')}><span style=${S('font-weight:800;font-size:14px')}>${p.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${p.role}</span></span>
          </div>`)}
        </div>
        ${t.isOwner && html`<button onClick=${t.openShare} style=${S('height:46px;border-radius:14px;border:2px solid #1B3DB8;background:#fff;color:#1B3DB8;font-weight:800;font-size:14px;cursor:pointer')}>+ Invite Someone</button>`}
      </div>
      <div style=${S('display:flex;justify-content:center')}><button onClick=${t.onDel} style=${S('border:0;background:none;color:#E8242C;font-weight:700;font-size:13px;cursor:pointer;padding:6px')}>${t.delLabel}</button></div>
    </div>`}`}
  </div>`;
}

function TripSelCard(v) {
  const p = v.tsel;
  return html`
  <div style=${S(`position:absolute;left:12px;right:12px;bottom:${B(90)};z-index:900;background:#fff;border-radius:30px;padding:18px 18px 12px;box-shadow:0 14px 40px rgba(16,24,63,.3);display:flex;flex-direction:column;gap:10px`)}>
    <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
      <div style=${S('display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0')}>
        <span style=${S(`font-size:12px;font-weight:800;background:${p.catBg};color:${p.catFg};padding:5px 10px;border-radius:999px`)}>${p.catName}</span>
        <span style=${S('font-size:13px;font-weight:700;color:#4A5275')}>${p.area}</span>
        ${p.hasPrice && html`<span style=${S('font-size:12px;font-weight:900;color:#1F9D6B;background:#E3F5EA;padding:4px 8px;border-radius:999px')}>${p.price}</span>`}
      </div>
      <button onClick=${p.close} aria-label="Close" style=${S('flex:none;width:32px;height:32px;border-radius:50%;border:0;background:#F1ECE3;color:#10183F;font-weight:800;font-size:15px;cursor:pointer')}>✕</button>
    </div>
    <div style=${S('font-weight:900;font-stretch:100%;font-size:26px;line-height:1.05;letter-spacing:-.01em')}>${p.name}</div>
    <div style=${S('font-size:12px;font-weight:800;color:#F45FA0;margin-top:-4px')}>${p.by}</div>
    ${p.hasNote && html`<div style=${S('font-size:14px;line-height:1.4;color:#3C4466')}>${p.note}</div>`}
    ${p.canAdd && html`<button onClick=${p.onAdd} style=${S(`height:42px;border-radius:16px;border:0;background:${p.addBg};color:${p.addFg};font-weight:900;font-stretch:100%;font-style:italic;font-size:17px;cursor:pointer;box-shadow:0 4px 0 #10183F`)}>${p.addLabel}</button>`}
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
      <div style=${S('font-size:13px;font-weight:700;color:#1B3DB8;background:#F6F1E7;border-radius:12px;padding:10px 12px;word-break:break-all;user-select:all;-webkit-user-select:all')}>${sh.link}</div>
      <div style=${S(`display:grid;grid-template-columns:${sh.canNativeShare ? '1fr 1fr' : '1fr'};gap:8px`)}>
        ${sh.canNativeShare && html`<button onClick=${sh.share} style=${S(`${PEN};border:0;background:#FF6B1A;color:#fff;font-size:14px`)}>Send Invite…</button>`}
        <button onClick=${sh.copy} style=${S(`${PEN};border:2px solid #10183F;background:#fff;color:#10183F;font-size:14px`)}>Copy Link</button>
      </div>
      <div style=${S('font-size:12px;line-height:1.4;color:#4A5275')}>They Open The Link, Make An Account (Or Sign In), And Join. Anyone With The Link Can Join, So Send It Just To Your People.</div>
      <button onClick=${sh.newLink} style=${S('align-self:flex-start;border:0;background:none;color:#E8242C;font-weight:700;font-size:12.5px;cursor:pointer;padding:2px 0')}>${sh.newLinkLabel}</button>
    </div>
    ${sh.hasPeople && html`
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <div style=${S('font-weight:800;font-size:15px')}>Already Joined</div>
      <div style=${S('background:#fff;border-radius:20px;padding:4px 14px')}>
        ${sh.people.map((p, i) => html`
        <div key=${p.key} style=${S(`display:flex;align-items:center;gap:10px;padding:9px 0;${i ? 'border-top:1px solid #EFE8DB' : ''}`)}>
          <span style=${S('flex:1;font-weight:800;font-size:14px')}>${p.name}</span>
          <button onClick=${p.onRemove} style=${S('height:30px;padding:0 12px;border-radius:999px;border:0;background:#FFE2DF;color:#E8242C;font-weight:800;font-size:12px;cursor:pointer')}>Remove</button>
        </div>`)}
      </div>
    </div>`}
    <div style=${S('display:flex;flex-direction:column;gap:8px')}>
      <label for="trip-name" style=${S('font-weight:800;font-size:15px')}>List Name</label>
      <input id="trip-name" value=${sh.nameVal} onChange=${sh.onName} onBlur=${sh.saveName} onKeyDown=${e => e.key === 'Enter' && e.target.blur()} style=${S('height:48px;border-radius:16px;border:2px solid #10183F;background:#fff;padding:0 14px;font-family:inherit;font-size:15px;font-weight:600;color:#10183F;outline:none')} />
    </div>`);
}

const CheckRow = r => html`
  <button key=${r.key} onClick=${r.onClick} style=${S(`display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:2px solid ${r.ring};border-radius:18px;padding:10px 12px;cursor:pointer;color:#10183F`)}>
    ${r.emoji != null && html`<span class="emo" style=${S(`width:34px;height:34px;border-radius:12px;background:${r.catBg};flex:none;display:flex;align-items:center;justify-content:center;font-size:18px`)} aria-hidden="true">${r.emoji}</span>`}
    <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style=${S('font-weight:800;font-size:15px')}>${r.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub || (r.catName + ' · ' + r.area)}</span></span>
    <span style=${S(`width:28px;height:28px;border-radius:50%;flex:none;background:${r.chkBg};color:#fff;border:2px solid #10183F;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px`)}>${r.chk}</span>
  </button>`;

function TripPicker(v) {
  const pk = v.tripPick;
  return Sheet(pk.title, pk.close, html`
    <input value=${pk.q} onChange=${pk.onQ} placeholder="Search Your Spots" aria-label="Search your spots" style=${S('flex:none;height:46px;border-radius:14px;border:2px solid #10183F;background:#fff;padding:0 14px;font-family:inherit;font-size:15px;color:#10183F;outline:none')} />
    ${pk.empty && html`<div style=${S('text-align:center;padding:20px;font-size:13px;font-weight:600;color:#4A5275')}>${pk.emptyMsg}</div>`}
    ${pk.rows.map(CheckRow)}`);
}

function ListChooser(v) {
  const c = v.listChoose;
  return Sheet('Add “' + c.name + '” To A List', c.close, html`
    ${c.setupMsg && html`<div style=${S('font-size:13px;font-weight:700;color:#E8242C')}>${c.setupMsg}</div>`}
    ${c.rows.map(CheckRow)}
    ${c.empty && c.ready && html`<div style=${S('text-align:center;padding:6px;font-size:13px;font-weight:600;color:#4A5275')}>No Lists Yet — Make Your First One.</div>`}
    ${!c.setupMsg && html`<button onClick=${c.newList} style=${S('height:46px;border-radius:14px;border:2px dashed #10183F;background:transparent;color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>+ New List</button>`}`);
}

function NewTripSheet(v) {
  const n = v.newTrip;
  const inp = S('height:50px;border-radius:16px;border:2px solid #10183F;background:#fff;padding:0 14px;font-family:inherit;font-size:16px;font-weight:600;color:#10183F;outline:none');
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
    <button onClick=${n.create} style=${S(`flex:none;margin-top:4px;height:50px;border-radius:999px;border:0;background:${n.btnBg};color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:19px;cursor:pointer;box-shadow:0 5px 0 #10183F`)}>${n.btn}</button>`, 'Cancel', 1080);
}

function TabBar(v) {
  const tab = (on, fg, label, icon, extra) => html`
    <button onClick=${on} style=${S(`height:100%;min-width:0;border:0;background:none;color:${fg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;font-weight:800;font-size:13px;padding:0`)}>${icon}<span>${label}</span></button>`;
  return html`
  <nav style=${S(`position:absolute;left:16px;right:16px;bottom:${B(16)};height:62px;z-index:950;background:#10183F;border-radius:999px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr 58px;align-items:center;padding:0 4px 0 6px;box-shadow:0 10px 30px rgba(16,24,63,.35)`)}>
    ${tab(v.goMap, v.tabMapFg, 'Map', html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"></path><path d="M9 4v14M15 6v14"></path></svg>`)}
    ${tab(v.goExplore, v.tabExFg, 'Explore', html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"></path></svg>`)}
    ${tab(v.goPlan, v.tabPlanFg, 'Route', html`<span style=${S('position:relative;display:flex')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="6" cy="18" r="2.5"></circle><circle cx="18" cy="6" r="2.5"></circle><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" stroke-dasharray="2 3"></path></svg><span style=${S('position:absolute;top:-5px;right:-11px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#FF6B1A;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #10183F')}>${v.planCount}</span></span>`)}
    ${tab(v.goLists, v.tabListFg, 'Lists', html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"></path><path d="M4 5.5l.9.9L6.6 4.6M4 11.5l.9.9 1.7-1.8M4 17.5l.9.9 1.7-1.8"></path></svg>`)}
    <div style=${S('display:flex;justify-content:center')}><button onClick=${v.openAdd} aria-label="Add A Spot" class="press94" style=${S('width:42px;height:42px;border-radius:50%;border:0;background:#FF6B1A;color:#fff;font-size:28px;font-weight:500;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding-bottom:3px')}>+</button></div>
  </nav>`;
}

function AddSheet(v) {
  const f = v.form;
  const inp = 'border-radius:16px;border:2px solid #10183F;background:#fff;padding:0 14px;font-family:inherit;font-size:15px;color:#10183F;outline:none';
  const lab = S('font-weight:800;font-size:15px');
  const col8 = S('display:flex;flex-direction:column;gap:8px');
  return html`
  <div data-screen-label="Add Spot" aria-hidden=${v.addY !== '0%'} style=${S(`position:absolute;inset:0;z-index:1100;background:#FFF3DF;transform:translateY(${v.addY});transition:transform .38s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column`)}>
    <div style=${S(`flex:none;padding:${T(56)} 20px 14px;display:flex;align-items:center;justify-content:space-between`)}>
      <div style=${S('min-width:0')}><div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:32px;letter-spacing:-.02em;color:#1B3DB8')}>${v.formTitle}</div>
        ${v.formFor && html`<div style=${S('font-size:13px;font-weight:700;color:#F45FA0;margin-top:2px')}>Just For “${v.formFor}”</div>`}</div>
      <button onClick=${v.closeAdd} style=${S('border:0;background:#fff;color:#10183F;font-weight:700;font-size:14px;height:38px;padding:0 16px;border-radius:999px;cursor:pointer')}>Cancel</button>
    </div>
    <div class="noscroll" style=${S(`flex:1;min-height:0;overflow-y:auto;padding:4px 20px ${B(120)};display:flex;flex-direction:column;gap:20px`)}>
      <div style=${col8}>
        <label for="f-url" style=${lab}>Paste A Link</label>
        <div style=${S('display:flex;gap:8px')}>
          <input id="f-url" value=${f.url} onChange=${v.onUrl} placeholder="TikTok, IG, Threads Or Maps Link" style=${S(`flex:1;min-width:0;height:52px;${inp}`)} />
          <button onClick=${v.pasteUrl} style=${S('flex:none;height:52px;padding:0 16px;border-radius:16px;border:0;background:#FFC425;color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>Paste</button>
        </div>
        ${v.hasSrcBadge && html`<div style=${S('display:flex')}><span style=${S(`font-size:12px;font-weight:800;background:${v.srcBadgeBg};color:#fff;padding:5px 10px;border-radius:999px`)}>${v.srcBadge}</span></div>`}
        ${v.aiBusy ? html`
        <div role="status" class="ai-busy" style=${S('height:48px;border-radius:16px;border:2px solid #10183F;background:#FFF3DF;color:#10183F;font-weight:900;font-style:italic;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 #FFC425')}>${v.aiBtn}</div>`
        : v.aiVidShow && html`
        <div style=${S(`display:grid;grid-template-columns:${v.aiShow ? '1fr 1fr' : '1fr'};gap:8px`)}>
          ${v.aiShow && html`<button onClick=${v.aiRun} style=${S('height:48px;border-radius:16px;border:2px solid #10183F;background:#10183F;color:#FFC425;font-weight:900;font-style:italic;font-size:15px;cursor:pointer;box-shadow:0 4px 0 #FFC425;padding:0 8px')}>${v.aiBtn}</button>`}
          <label for="f-video" style=${S('height:48px;border-radius:16px;border:2px solid #10183F;background:#fff;color:#10183F;font-weight:900;font-style:italic;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 0 #10183F;padding:0 8px;text-align:center')}>🎬 ${v.aiShow ? 'From A Video' : 'Add From A Saved Video'}</label>
          <input id="f-video" type="file" accept="video/*" onChange=${v.onVideo} style=${S('position:absolute;width:1px;height:1px;opacity:0;pointer-events:none')} />
        </div>`}
        ${v.aiHasMsg && html`<div role="status" style=${S('font-size:13px;font-weight:700;color:#1B3DB8;line-height:1.35')}>${v.aiMsg}</div>`}
        ${v.aiMulti && html`
        <div style=${S('background:#fff;border:2px solid #10183F;border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:8px')}>
          <div style=${S('font-weight:900;font-style:italic;font-size:17px;color:#1B3DB8')}>This Post Mentions ${v.aiCount} Places</div>
          <div style=${S('font-size:12px;font-weight:600;color:#4A5275;margin-top:-4px')}>Tap One To Fill The Form, Or Add Them All At Once.</div>
          ${v.aiRows.map((r, i) => html`
          <button key=${i} onClick=${r.onPick} style=${S(`display:flex;align-items:center;gap:10px;text-align:left;padding:8px 10px;border-radius:14px;border:2px solid ${r.on ? '#FF6B1A' : 'rgba(16,24,63,.1)'};background:${r.on ? '#FFF3DF' : '#fff'};cursor:pointer;color:#10183F`)}>
            <span class="emo" aria-hidden="true" style=${S(`width:32px;height:32px;border-radius:10px;background:${r.bg};flex:none;display:flex;align-items:center;justify-content:center;font-size:17px`)}>${r.emoji}</span>
            <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px')}><span style=${S('font-weight:800;font-size:14px')}>${r.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub}</span></span>
            ${r.on && html`<span style=${S('font-weight:900;color:#FF6B1A')}>✓</span>`}
          </button>`)}
          <button onClick=${v.aiAddAll} style=${S('height:44px;margin-top:2px;border-radius:14px;border:0;background:#FF6B1A;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>${v.aiAddAllLabel}</button>
        </div>`}
        <div style=${S('font-size:12px;color:#5A6080')}>Paste A Post Or A Google Maps Link, Or Pick A Video Saved To Your Phone, And AI Fills In The Rest — Including What's Said Out Loud. Optional.</div>
      </div>
      <div style=${col8}>
        <label for="f-name" style=${lab}>Place Name</label>
        <input id="f-name" value=${f.name} onChange=${v.onName} autocomplete="off" placeholder="Start Typing, E.g. Devoción" style=${S(`height:52px;${inp};font-size:16px;font-weight:600`)} />
        ${v.suggBusy && html`<div role="status" style=${S('font-size:12px;font-weight:700;color:#4A5275')}>Looking It Up…</div>`}
        ${v.hasSugg && html`
        <div style=${S('display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;border:2px solid #10183F')}>
          <div style=${S('display:flex;align-items:center;justify-content:space-between;padding:8px 14px 6px;font-size:12px;font-weight:800;color:#4A5275')}>
            <span>${v.suggTitle}</span>
            <button onClick=${v.closeSugg} style=${S('border:0;background:transparent;color:#1B3DB8;font-weight:800;font-size:12px;cursor:pointer;padding:0')}>None Of These</button>
          </div>
          ${v.suggRows.map((r, i) => html`
          <button key=${i} class="hov" onClick=${r.onPick} style=${S('display:flex;align-items:center;gap:10px;text-align:left;padding:9px 14px;border:0;border-top:1px solid #EFE8DB;background:#fff;cursor:pointer;color:#10183F')}>
            <span class="emo" aria-hidden="true" style=${S(`width:30px;height:30px;border-radius:10px;background:${r.bg};flex:none;display:flex;align-items:center;justify-content:center;font-size:16px`)}>${r.emoji}</span>
            <span style=${S('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px')}><span style=${S('font-weight:800;font-size:14px')}>${r.name}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub}</span></span>
          </button>`)}
          ${v.suggGoogle && html`<div style=${S('padding:6px 14px 8px;border-top:1px solid #EFE8DB;font-size:11px;font-weight:700;color:#7A809C;text-align:right')}>Suggestions From Google</div>`}
        </div>`}
        ${v.webShow && html`<button onClick=${v.webFind} style=${S('height:44px;border-radius:14px;border:2px solid #10183F;background:#10183F;color:#FFC425;font-weight:900;font-style:italic;font-size:14px;cursor:pointer;padding:0 12px')}>${v.webLabel}</button>`}
        ${v.webBusy && html`<div role="status" class="ai-busy" style=${S('height:44px;border-radius:14px;border:2px solid #10183F;background:#FFF3DF;color:#10183F;font-weight:900;font-style:italic;font-size:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 #FFC425')}>✨ Searching The Web…</div>`}
        ${v.webHasMsg && html`<div role="status" style=${S('font-size:13px;font-weight:700;color:#1B3DB8;line-height:1.35')}>${v.webMsg}</div>`}
      </div>
      <div style=${col8}>
        <label for="f-look" style=${lab}>Location</label>
        <div style=${S('display:flex;gap:8px')}>
          <input id="f-look" value=${v.lookQ} onChange=${v.onLookQ} onKeyDown=${v.onLookKey} placeholder="Search An Address Or Place" style=${S(`flex:1;min-width:0;height:52px;${inp}`)} />
          <button onClick=${v.runLookup} style=${S('flex:none;height:52px;padding:0 16px;border-radius:16px;border:0;background:#1B3DB8;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>${v.lookBtn}</button>
        </div>
        ${v.lookHasMsg && html`<div style=${S('font-size:12px;font-weight:600;color:#E8242C')}>${v.lookMsg}</div>`}
        ${v.lookHasResults && html`
        <div style=${S('display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;border:2px solid #10183F')}>
          ${v.lookResults.map((r, i) => html`
          <button key=${i} class="hov" onClick=${r.onPick} style=${S('display:flex;flex-direction:column;gap:2px;text-align:left;padding:10px 14px;border:0;border-bottom:1px solid #EFE8DB;background:#fff;cursor:pointer;color:#10183F')}>
            <span style=${S('font-weight:800;font-size:14px')}>${r.title}</span><span style=${S('font-size:12px;font-weight:600;color:#4A5275')}>${r.sub}</span>
          </button>`)}
        </div>`}
        ${v.hasPin && html`
        <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px;background:#1F9D6B;color:#fff;border-radius:16px;padding:12px 14px')}>
          <div style=${S('display:flex;flex-direction:column;gap:2px;min-width:0')}><span style=${S('font-weight:800;font-size:15px')}>Pin Dropped ✓</span><span style=${S('font-size:13px;font-weight:600')}>${v.pinLine}</span></div>
          <button onClick=${v.startPlacing} style=${S('flex:none;height:36px;padding:0 14px;border:0;border-radius:999px;background:#fff;color:#1F9D6B;font-weight:800;font-size:13px;cursor:pointer')}>Move Pin</button>
        </div>`}
        ${v.noPin && html`
          <button onClick=${v.startPlacing} style=${S('height:52px;border-radius:16px;border:2px dashed #1B3DB8;background:#fff;color:#1B3DB8;font-weight:800;font-size:15px;cursor:pointer')}>Drop A Pin On The Map</button>
          <div style=${S('font-size:12px;color:#5A6080')}>Or Just Pick A Neighborhood Below And We'll Place It There.</div>`}
      </div>
      <div style=${S('display:flex;flex-direction:column;gap:10px')}>
        <span style=${lab}>Category</span>
        <div style=${S('display:flex;flex-wrap:wrap;gap:8px')}>
          ${v.formCats.map((c, i) => html`
          <button key=${i} onClick=${c.onClick} style=${S(`display:flex;align-items:center;gap:7px;height:40px;padding:0 14px;border-radius:999px;border:2px solid ${c.border};background:${c.bg};color:${c.fg};font-weight:700;font-size:13px;cursor:pointer`)}><span class="emo" style=${S('font-size:16px')} aria-hidden="true">${c.emoji}</span>${c.name}</button>`)}
          <button onClick=${v.toggleNewCat} style=${S('height:40px;padding:0 14px;border-radius:999px;border:2px dashed #10183F;background:transparent;color:#10183F;font-weight:700;font-size:13px;cursor:pointer')}>+ New Category</button>
        </div>
        ${f.newCatOpen && html`
        <div style=${S('background:#fff;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:12px')}>
          <input id="f-newcat" value=${f.newCatName} onChange=${v.onNewCatName} placeholder="E.g. Matcha Spots" style=${S('height:46px;border-radius:14px;border:2px solid #10183F;padding:0 12px;font-family:inherit;font-size:15px;color:#10183F;outline:none')} />
          <div style=${S('display:flex;flex-direction:column;gap:8px')}>
            <span style=${S('font-size:12px;font-weight:700;color:#4A5275')}>Pick An Emoji</span>
            <div style=${S('display:flex;flex-wrap:wrap;gap:6px')}>
              ${v.emojiChoices.map((m, i) => html`<button key=${i} onClick=${m.onClick} aria-label=${'Emoji ' + m.e} class="emo" style=${S(`width:38px;height:38px;border-radius:12px;background:${m.bg};border:2px solid ${m.ring};cursor:pointer;padding:0;font-size:19px;display:flex;align-items:center;justify-content:center`)}>${m.e}</button>`)}
            </div>
          </div>
          <span style=${S('font-size:12px;font-weight:700;color:#4A5275;margin-bottom:-4px')}>Pin Color</span>
          <div style=${S('display:flex;gap:10px;align-items:center')}>
            ${v.swatches.map((w, i) => html`<button key=${i} onClick=${w.onClick} aria-label=${'Color ' + (i + 1)} style=${S(`width:30px;height:30px;border-radius:50%;background:${w.color};border:3px solid ${w.ring};cursor:pointer;padding:0`)}></button>`)}
          </div>
          <button onClick=${v.addCat} style=${S('height:44px;border-radius:14px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Create Category</button>
        </div>`}
      </div>
      ${v.showPrice && html`
      <div style=${col8}>
        <span style=${lab}>Price Range</span>
        <div style=${S('display:grid;grid-template-columns:repeat(4,1fr);gap:8px')}>
          ${v.priceChips.map((p, i) => html`
          <button key=${i} onClick=${p.onClick} style=${S(`height:48px;border-radius:14px;border:2px solid ${p.border};background:${p.bg};color:${p.fg};font-weight:900;font-size:16px;letter-spacing:.02em;cursor:pointer`)}>${p.label}</button>`)}
        </div>
        <div style=${S('font-size:12px;color:#5A6080')}>${v.priceHint}</div>
      </div>`}
      <div style=${col8}>
        <label for="f-area" style=${lab}>Neighborhood</label>
        <select id="f-area" value=${f.area} onChange=${v.onArea} style=${S('height:52px;border-radius:16px;border:2px solid #10183F;background:#fff;padding:0 12px;font-family:inherit;font-size:15px;font-weight:600;color:#10183F;outline:none')}>
          <option value="auto">Auto-Detect From Pin</option>
          ${v.areaGroups.map(g => html`<optgroup key=${g.b} label=${g.b}>${g.areas.map(a => html`<option key=${a.name} value=${a.name}>${a.name}</option>`)}</optgroup>`)}
        </select>
      </div>
      <div style=${col8}>
        <label for="f-addr" style=${lab}>Address Or Cross Streets</label>
        <input id="f-addr" value=${f.address} onChange=${v.onAddress} placeholder="Optional — Helps Google Maps Find It" style=${S(`height:52px;${inp}`)} />
      </div>
      <div style=${col8}>
        <label for="f-note" style=${lab}>Notes</label>
        <textarea id="f-note" value=${f.note} onChange=${v.onNote} placeholder="What To Order, When To Go…" rows="3" style=${S('border-radius:16px;border:2px solid #10183F;background:#fff;padding:12px 14px;font-family:inherit;font-size:15px;color:#10183F;outline:none;resize:none')}></textarea>
      </div>
    </div>
    <div style=${S(`position:absolute;left:16px;right:16px;bottom:${B(22)}`)}>
      <button onClick=${v.save} style=${S(`width:100%;height:48px;border-radius:999px;border:0;background:${v.saveBg};color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:20px;cursor:pointer;box-shadow:0 5px 0 #10183F`)}>${v.saveLabel}</button>
    </div>
  </div>`;
}

function AccountSheet(v) {
  return html`
  <div onClick=${v.closeAcct} style=${S('position:absolute;inset:0;z-index:1050;background:rgba(16,24,63,.4);display:flex;flex-direction:column;justify-content:flex-end')}>
    <div onClick=${e => e.stopPropagation()} style=${S(`background:#FFF3DF;border-radius:30px 30px 0 0;padding:20px 18px ${B(28)};display:flex;flex-direction:column;gap:14px`)}>
      <div style=${S('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:24px;color:#1B3DB8')}>Your Account</div>
        <button onClick=${v.closeAcct} style=${S('height:38px;padding:0 16px;border-radius:999px;border:0;background:#10183F;color:#fff;font-weight:800;font-size:14px;cursor:pointer')}>Done</button>
      </div>
      <div style=${S('background:#fff;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:6px')}>
        <span style=${S('font-size:12px;font-weight:700;color:#4A5275')}>Signed In As</span>
        <span style=${S('font-weight:800;font-size:15px;word-break:break-all')}>${v.syncEmail}</span>
        <span style=${S('display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#3C4466')}><span style=${S(`width:9px;height:9px;border-radius:50%;background:${v.syncDot}`)}></span>${v.syncLabel}</span>
      </div>
      <div style=${S('font-size:13px;line-height:1.4;color:#3C4466')}>Your spots, categories, home and day plan sync to every device you sign in on.</div>
      <div style=${S('display:grid;grid-template-columns:1fr 1fr;gap:8px')}>
        <button onClick=${v.syncNow} style=${S('height:46px;border-radius:14px;border:2px solid #10183F;background:#fff;color:#10183F;font-weight:800;font-size:14px;cursor:pointer')}>Sync Now</button>
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
  const inp = S('height:52px;border-radius:16px;border:2px solid #10183F;background:#fff;padding:0 14px;font-family:inherit;font-size:16px;font-weight:600;color:#10183F;outline:none');
  return html`
  <div data-screen-label="Sign In" class="noscroll" style=${S(`position:absolute;inset:0;z-index:1250;background:#1B3DB8;overflow-y:auto;padding:${T(90)} 22px ${B(30)};display:flex;flex-direction:column;gap:22px`)}>
    <div style=${S('align-self:flex-start')}>${Logo(true)}</div>
    <div style=${S('display:flex;flex-direction:column;gap:8px;color:#fff')}>
      <div style=${S('font-weight:900;font-stretch:100%;font-style:italic;font-size:40px;line-height:.95;letter-spacing:-.02em;color:#fff')}>${v.authTitle}</div>
      <div style=${S('font-size:15px;font-weight:600;color:#C9D0F0')}>Sign In To Keep Your Spots In Sync On Every Device.</div>
    </div>
    ${v.hasJoin && html`
    <div style=${S('background:#F45FA0;color:#fff;border:2.5px solid #10183F;border-radius:22px;padding:14px 16px;display:flex;flex-direction:column;gap:3px;box-shadow:0 5px 0 #10183F')}>
      <span style=${S('font-weight:900;font-style:italic;font-size:20px;line-height:1.1')}>${v.joinTitle} 💌</span>
      <span style=${S('font-size:13.5px;font-weight:700')}>${v.joinSub}</span>
    </div>`}
    <form onSubmit=${v.authSubmit} style=${S('background:#FFF3DF;border-radius:28px;padding:20px 18px;display:flex;flex-direction:column;gap:14px;box-shadow:0 8px 0 #10183F')}>
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
      <button type="submit" style=${S('height:52px;border-radius:999px;border:0;background:#FF6B1A;color:#fff;font-weight:900;font-stretch:100%;font-style:italic;font-size:20px;cursor:pointer;box-shadow:0 5px 0 #10183F')}>${v.authBtn}</button>
    </form>
    <button onClick=${v.authToggle} style=${S('align-self:center;border:0;background:none;color:#FFC425;font-weight:800;font-size:14px;cursor:pointer;padding:8px')}>${v.authSwitch}</button>
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
