// Spotted In (formerly My NYC List) — standalone runtime.
// The app logic (logic.js) is carried over verbatim from the Claude Design prototype
// "NYC List v2". This file supplies the small base class it was written against:
// setState applies immediately to this.state, then the React host re-renders.
"use strict";
class DCLogic {
  constructor(props){ this.props = props || {}; this.state = {}; this.__host = null; }
  setState(update, cb){ this.__host && this.__host.__setLogicState(update, cb); }
  forceUpdate(){ this.__host && this.__host.forceUpdate(); }
  componentDidMount(){} componentDidUpdate(){} componentWillUnmount(){}
  renderVals(){ return {}; }
}

// Links: window.open is refused in some embedded viewers; fall back to a real link click.
(() => {
  const orig = window.open ? window.open.bind(window) : null;
  window.open = (url, target, feat) => {
    let w = null;
    try { w = orig ? orig(url, target, feat) : null; } catch (e) {}
    if (!w && url) {
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    }
    return w;
  };
})();

// Running inside the iPhone app (Capacitor)? Then /api calls and shareable links go to the live website.
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const SITE = () => (NATIVE && window.NYC_CONFIG && NYC_CONFIG.siteUrl) || location.origin;
const API = p => (NATIVE ? SITE() : '') + p;

// Options that were editable props in the design tool. Defaults match the design;
// override with ?style=Minimal or ?tab=Explore|Plan (or #explore / #plan).
const APP_PROPS = (() => {
  let q = null; try { q = new URLSearchParams(location.search); } catch (e) {}
  const h = (location.hash || '').slice(1).toLowerCase();
  const style = q && /^minimal$/i.test(q.get('style') || '') ? 'Minimal' : 'Colorful';
  const t = ((q && q.get('tab')) || h || '').toLowerCase();
  const startTab = t === 'explore' ? 'Explore' : t === 'plan' ? 'Plan' : 'Map';
  return { mapStyle: style, startTab };
})();
