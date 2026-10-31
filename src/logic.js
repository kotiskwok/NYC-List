const C={blue:'#1B3DB8',navy:'#10183F',orange:'#FF6B1A',yellow:'#FFC425',red:'#E8242C',pink:'#F45FA0',green:'#1F9D6B',purple:'#7A4FD6'};
const SWATCHES=[C.orange,C.blue,C.red,C.green,C.pink,C.yellow,C.purple];
const fgFor=c=>c===C.yellow?C.navy:'#fff';
const CATS0=[{id:'coffee',name:'Coffee Shop',color:C.orange,emoji:'☕'},{id:'work',name:'Coffee Shop To Work At',color:C.blue,emoji:'💻'},{id:'food',name:'Restaurant',color:C.red,emoji:'🍽️'},{id:'bakery',name:'Bakery',color:C.yellow,emoji:'🥐'},{id:'grocery',name:'Gourmet Grocery',color:C.green,emoji:'🧀'},{id:'shop',name:'Cute Shop',color:C.pink,emoji:'🛍️'}];
const EMO_DEF=Object.fromEntries(CATS0.map(c=>[c.id,c.emoji]));
const emo=c=>(c&&(c.emoji||EMO_DEF[c.id]))||'📍';
// Line icons drawn for each category emoji (24px grid, stroked). Emojis without one fall back to the emoji itself.
const CAT_ICON={'☕':'M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M16 9h2a2 2 0 0 1 0 4h-2','💻':'M5 6h14v9H5z M3 18h18','🍽️':'M7 3v18 M5 3v5a2 2 0 0 0 4 0V3 M17 3c-2.5 2-2.5 7 0 9v9',
  '🥐':'M4 15c0-5 4-8 8-8s8 3 8 8c-2.5 2.5-13.5 2.5-16 0z M9 9l1 6 M15 9l-1 6','🧀':'M3 10h18l-2 9H5z M8 10l3-6 M16 10l-3-6','🛍️':'M5 8h14l-1 12H6z M9 8V6a3 3 0 0 1 6 0v2',
  '⭐':'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z','🍵':'M5 10h12v3a6 6 0 0 1-12 0z M17 11h1.5a2 2 0 0 1 0 4H16 M9 3v3 M13 3v3',
  '🧋':'M7 7h10l-1.5 13h-7z M6 7h12 M12 7l2-4 M10 16h.01 M13 17h.01 M11.5 13.5h.01','🍜':'M3 11h18a9 9 0 0 1-18 0z M8 11V4 M12 11V4 M16 4l-2 7',
  '🍣':'M3 14c0-3 4-5 9-5s9 2 9 5-4 5-9 5-9-2-9-5z M8 11c1 1.5 7 1.5 8 0','🍕':'M12 21L3 6c6-3 12-3 18 0z M9 10h.01 M14 12h.01 M12 15h.01',
  '🌮':'M3 17a9 9 0 0 1 18 0z M7 13c1-1 2-1 3 0s2 1 3 0 2-1 3 0','🥯':'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4z',
  '🍦':'M7.5 10a4.5 4.5 0 0 1 9 0 M7 10h10l-5 11z','🍷':'M8 3h8l-.5 5a3.5 3.5 0 0 1-7 0z M12 12v8 M8 21h8','🍸':'M4 4h16l-8 9z M12 13v7 M8 21h8',
  '📚':'M5 4h4v16H5z M10 4h4v16h-4z M15 5l3.5-1 3 15-3.5 1z','🌿':'M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z M5 19l8-8',
  '🎨':'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z M7.5 11h.01 M10 7h.01 M15 7h.01',
  '🧘':'M12 4a2 2 0 1 0 0 4a2 2 0 1 0 0-4z M12 9v5 M6 12l6 2 6-2 M7 19l5-3 5 3','🖼️':'M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4',
  '📍':'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z M12 7a3 3 0 1 0 0 6a3 3 0 1 0 0-6z','🗽':'M4 5h16M4 12h16M4 19h16'};
const iconSvg=(em,px,col)=>CAT_ICON[em]?`<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${CAT_ICON[em]}"/></svg>`:`<span style="font-size:${Math.round(px*.95)}px;line-height:1">${em}</span>`;
const EMOJIS=['⭐','🍵','🧋','🍜','🍣','🍕','🌮','🥯','🍦','🍷','🍸','📚','🌿','🎨','🧘','🖼️'];
const BOROUGHS=['Manhattan','Brooklyn','Queens','Bronx','Staten Island'];
// Cities. Each spot carries its city (none = NYC); the picker on the map header switches the whole app: map, neighborhoods,
// transit for travel times, search area, AI and photo lookups, plus that city's home and Route plan.
// box = [south, west, north, east] for searches; bounds = how far the map can pan. Data for the others is in data/city-data.js.
const CITIES={
  nyc:{id:'nyc',name:'New York City',short:'NYC',emoji:'🗽',q:'New York',qc:'New York City',center:[40.722,-73.97],box:[40.49,-74.27,40.93,-73.68],bounds:[[40.42,-74.35],[40.98,-73.6]],regions:BOROUGHS,transit:'Subway',layerSub:'Stations & Lines',layers:['bus','bike'],busSub:'Local, Select Bus & Express',bike:{name:'Citi Bike',url:'https://gbfs.lyft.com/gbfs/2.3/bkn/en/',ext:'.json'}},
  sg:{id:'sg',name:'Singapore',short:'SG',emoji:'🦁',q:'Singapore',qc:'Singapore',center:[1.3,103.84],box:[1.2,103.6,1.48,104.05],bounds:[[1.12,103.55],[1.52,104.12]],regions:['Central','East','North-East','North','West'],transit:'MRT',layerSub:'MRT & LRT Stations',layers:['bus'],busSub:'SBS, SMRT, Tower Transit & Go-Ahead'},
  hk:{id:'hk',name:'Hong Kong',short:'HKG',emoji:'🌃',q:'Hong Kong',qc:'Hong Kong',center:[22.3,114.17],box:[22.15,113.82,22.57,114.45],bounds:[[22.08,113.75],[22.62,114.5]],regions:['Hong Kong Island','Kowloon','New Territories','Lantau & Islands'],transit:'MTR',layerSub:'MTR Stations',layers:['bus','tram','ferry'],busSub:'KMB, Citybus, NLB & Minibus',tram:{label:'Trams',sub:'Ding Ding Lines On The Island',col:'#007F3D'},ferry:{label:'Ferries',sub:'Star Ferry & Outlying Islands',col:'#0B7BC1'}},
  to:{id:'to',name:'Toronto',short:'TO',emoji:'🍁',q:'Toronto',qc:'Toronto, Ontario, Canada',center:[43.66,-79.39],box:[43.58,-79.64,43.86,-79.11],bounds:[[43.5,-79.78],[43.92,-79.0]],regions:['Downtown','Midtown','East End','West End & York','North York','Scarborough','Etobicoke'],transit:'TTC',layerSub:'Subway & LRT Stations',layers:['tram','bus','bike'],busSub:'TTC Bus Routes',tram:{label:'Streetcars',sub:'TTC Streetcar Routes',col:'#DA251D'},bike:{name:'Bike Share Toronto',url:'https://toronto.publicbikesystem.net/customer/gbfs/v2/en/',ext:''}}};
const CITY_ORDER=['nyc','sg','hk','to'];
let CUR=CITIES[(()=>{try{return localStorage.getItem('nycList.city')||'';}catch(e){return '';}})()]||CITIES.nyc;
const cityOf=p=>(p&&p.city&&CITIES[p.city])?p.city:'nyc';
const CDATA=()=>(window.CITY_DATA||{})[CUR.id]||{};
const inBox=(ll,c)=>{const b=(c||CUR).box;return ll[0]>b[0]&&ll[0]<b[2]&&ll[1]>b[1]&&ll[1]<b[3];};
function setCityData(id){CUR=CITIES[id]||CITIES.nyc;_A=null;_RC.clear();for(const k in _LP)delete _LP[k];}
// Apple Maps (MapKit JS). Each map draws its own Apple-colored map first. Once /api/mapkit-token answers and MapKit loads,
// the map swaps its base for Apple's map, drawn underneath Leaflet: pins, subway, routes and taps stay on Leaflet
// and Apple's map follows every move and pinch. If Apple Maps isn't set up or fails, that Apple-colored map stays.
const APPLE={state:'',cbs:[],fail:null};
function appleMaps(cb){if(APPLE.state==='ok')return cb(true);if(APPLE.state==='off')return cb(false);APPLE.cbs.push(cb);if(APPLE.state)return;APPLE.state='loading';
  const done=ok=>{if(APPLE.state!=='loading')return;APPLE.state=ok?'ok':'off';const c=APPLE.cbs;APPLE.cbs=[];c.forEach(f=>{try{f(ok);}catch(e){console.error(e);}});};
  const tok=()=>fetch(API('/api/mapkit-token'),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
  tok().then(j=>{if(!j||!j.token)return done(false);let first=j.token;
    const sc=document.createElement('script');sc.src='https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';sc.crossOrigin='anonymous';sc.onerror=()=>done(false);
    sc.onload=()=>{try{
      mapkit.addEventListener('configuration-change',ev=>{if(ev.status==='Initialized'||ev.status==='Refreshed')done(true);});
      mapkit.addEventListener('error',ev=>{console.warn('Apple Maps error',ev&&ev.status);if(APPLE.state==='loading')done(false);else if(APPLE.fail)APPLE.fail();});
      mapkit.init({authorizationCallback:d=>{if(first){d(first);first=null;}else tok().then(t=>t&&t.token&&d(t.token));},language:'en'});
      setTimeout(()=>done(false),9000);}catch(e){console.warn('Apple Maps',e);done(false);}};
    document.head.appendChild(sc);});}
const APPLE_PAD=96;
// Photos: crop the middle to w×h and shrink it on the phone before uploading (JPEG).
const shrinkImage=(file,w,h)=>new Promise((res,rej)=>{if(!file)return rej(new Error('none'));
  if(!/^image\//.test(file.type||'')&&!/\.(jpe?g|png|heic|heif|webp|gif)$/i.test(file.name||''))return rej(new Error('Pick A Photo.'));
  const url=URL.createObjectURL(file),img=new Image();img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('That Photo Couldn\u2019t Be Opened. Try A JPEG Or PNG.'));};
  img.onload=()=>{const W=img.naturalWidth,H=img.naturalHeight,r=w/h;let sw=W,sh=W/r;if(sh>H){sh=H;sw=H*r;}const c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh,0,0,w,h);URL.revokeObjectURL(url);c.toBlob(b=>b?res(b):rej(new Error('That Photo Couldn\u2019t Be Read.')),'image/jpeg',.86);};
  img.src=url;});
const photoErr=e=>e==='setup'?'Photos Need One Setup Step: Run supabase/avatars.sql In Supabase.':(e||'Couldn\u2019t Save The Photo.');
// A spot's picture: the photo you added, else (once GOOGLE_MAPS_API_KEY is set) its first Google Maps photo via /api/photo.
const GPHOTO={on:false};
const placeImg=p=>!p?null:p.photo?p.photo:(GPHOTO.on&&p.name&&isFinite(p.lat)&&isFinite(p.lng)?API('/api/photo?q='+encodeURIComponent([p.name,p.address||p.area,CITIES[cityOf(p)].q].filter(Boolean).join(', '))+'&ll='+(+p.lat).toFixed(5)+','+(+p.lng).toFixed(5)):null);
// Map layers you turned on (subway, bus routes, Citi Bike) are remembered on this device.
const LAYERS=(()=>{try{return JSON.parse(localStorage.getItem('nycList.layers'))||{};}catch(e){return {};}})();
const saveLayers=o=>{try{localStorage.setItem('nycList.layers',JSON.stringify(o));}catch(e){}};
// Route lines for the map layers, per city and kind: NYC buses from MTA data (/api/bus); the rest are OpenStreetMap files
// built by a GitHub Action (scripts/build-routes.js) into data/routes/<city>-<kind>.json.
const RT={};const loadRoutes=(city,kind)=>{const k=city+':'+kind;return RT[k]||(RT[k]=fetch(city==='nyc'?API('/api/bus'):API('/data/routes/'+city+'-'+kind+'.json')).then(r=>r.ok?r.json():null).then(d=>Array.isArray(d)&&d.length?d:(delete RT[k],null)).catch(()=>(delete RT[k],null)));};
// Bike share GBFS feeds (public, open to browsers): Citi Bike in NYC, Bike Share Toronto. Where the docks are (fetched once) and live counts.
const BIKES={};const bikeOf=()=>BIKES[CUR.id]||(BIKES[CUR.id]={info:null,status:{},at:0,p:null});
const loadBikes=fresh=>{const BIKE=bikeOf(),cfg=CUR.bike;if(!cfg)return Promise.resolve(false);if(BIKE.p)return BIKE.p;if(BIKE.info&&!fresh&&Date.now()-BIKE.at<60000)return Promise.resolve(true);
  const j=u=>fetch(cfg.url+u+cfg.ext,{cache:'no-store'}).then(r=>r.ok?r.json():null);
  BIKE.p=Promise.all([BIKE.info?null:j('station_information'),j('station_status')]).then(([inf,st])=>{
    if(inf&&inf.data)BIKE.info=inf.data.stations.filter(x=>isFinite(x.lat)&&isFinite(x.lon)).map(x=>({station_id:x.station_id,name:x.name,lat:x.lat,lon:x.lon}));
    if(st&&st.data){BIKE.status={};st.data.stations.forEach(x=>BIKE.status[x.station_id]=x);BIKE.at=Date.now();}
    return !!BIKE.info;}).catch(()=>!!BIKE.info).finally(()=>{BIKE.p=null;});return BIKE.p;};
const PAL={Colorful:{water:'#86C8EE',park:'#7FCB8F',air:'#D8D3C8',line:'rgba(255,255,255,.95)',boro:{Manhattan:'#FFE38F',Brooklyn:'#FFC09A',Queens:'#C4D0FF',Bronx:'#FFB5C9','Staten Island':'#D6C6F4'}},
 Minimal:{water:'#D3E4F0',park:'#CDE5C6',air:'#E6E2DA',line:'#E4DCCD',boro:{}},
 // Apple: the app's own map drawn in Apple Maps colors. It shows while Apple's real map loads and if Apple Maps is ever unavailable.
 Apple:{water:'#A6D1F0',park:'#C3E5B8',air:'#E4E1DA',line:'rgba(255,255,255,.9)',land:'#F4F2EE',boroLine:'rgba(120,118,112,.45)',boroW:1.2,label:'#6E6D69',boroLabel:'#5B5A57',boro:{}}};
const RC={'1':'#EE352E','2':'#EE352E','3':'#EE352E','4':'#00933C','5':'#00933C','6':'#00933C','7':'#B933AD','A':'#0039A6','C':'#0039A6','E':'#0039A6','B':'#FF6319','D':'#FF6319','F':'#FF6319','M':'#FF6319','G':'#6CBE45','J':'#996633','Z':'#996633','L':'#A7A9AC','N':'#FCCC0A','Q':'#FCCC0A','R':'#FCCC0A','W':'#FCCC0A','S':'#808183','SIR':'#0039A6'};
const bullet=r=>{if(CUR.id!=='nyc'){const x=(CDATA().lines||{})[r];return x?{t:x.t,bg:x.bg,fg:x.fg}:{t:r,bg:'#808183',fg:'#fff'};}return {t:r==='SIR'?'SI':r,bg:RC[r]||'#808183',fg:['N','Q','R','W'].includes(r)?C.navy:'#fff'};};
const r5=n=>Math.round(n*1e5)/1e5;
const km=(a,b)=>Math.hypot((a[0]-b[0])*111,(a[1]-b[1])*84);
const mi=k=>(k*0.621).toFixed(1)+' Mi';
const fmtShort=m=>{m=Math.max(1,Math.round(m));return m<60?m+' min':Math.floor(m/60)+' hr'+(m%60?' '+m%60+' min':'');};
const fmtMin=m=>{m=Math.max(1,Math.round(m));return m<60?m+' Min':Math.floor(m/60)+' Hr'+(m%60?' '+m%60+' Min':'');};
const walkMin=(a,b)=>km(a,b)*1.25/0.08;
const rideMin=(a,b,v)=>km(a,b)*1.25/(v||0.45)+1;
// Speed (km per minute) and wait for a set of lines: other cities' streetcars, trams and ferries are slower than rail.
const lineSp=rs=>{if(CUR.id==='nyc')return {v:0.45,w:4};const L=CDATA().lines||{};let v=0,w=99;rs.forEach(r=>{const x=L[r]||{};v=Math.max(v,x.v||0.45);w=Math.min(w,x.w||4);});return {v:v||0.45,w:w===99?4:w};};
const ST=()=>CUR.id==='nyc'?(window.NYC_SUBWAY||[]):(CDATA().st||[]);
const nearSt=(p,n=CUR.id==='nyc'?6:10,max=1.2,rail)=>ST().filter(s=>!rail||!s.k).map(s=>({s,d:km(p,s.c)})).filter(x=>x.d<=max).sort((a,b)=>a.d-b.d).slice(0,n);
const _RC=new Map();
function estimate(a,b){const key=a.join()+'|'+b.join();if(_RC.has(key))return _RC.get(key);
 const walk={min:walkMin(a,b),km:km(a,b)*1.3};let best=null;const NA=nearSt(a),NB=nearSt(b);
 for(const x of NA)for(const y of NB){if(x.s.id===y.s.id)continue;const wa=walkMin(a,x.s.c),wb=walkMin(y.s.c,b);
  const sh=x.s.r.filter(r=>y.s.r.includes(r));
  if(sh.length){const sp=lineSp(sh),rm=rideMin(x.s.c,y.s.c,sp.v)+sp.w,t=wa+rm+wb;if(!best||t<best.min)best={min:t,legs:[{k:'walk',to:x.s,min:wa},{k:'ride',from:x.s,to:y.s,r:sh,min:rm},{k:'walk',min:wb}]};}
  else for(const z of ST()){if(z.id===x.s.id||z.id===y.s.id)continue;const r1=x.s.r.filter(r=>z.r.includes(r));if(!r1.length)continue;const r2=z.r.filter(r=>y.s.r.includes(r));if(!r2.length)continue;
   const s1=lineSp(r1),s2=lineSp(r2),m1=rideMin(x.s.c,z.c,s1.v),m2=rideMin(z.c,y.s.c,s2.v),t=wa+s1.w+m1+Math.max(5,s2.w)+m2+wb;
   if(!best||t<best.min)best={min:t,legs:[{k:'walk',to:x.s,min:wa},{k:'ride',from:x.s,to:z,r:r1,min:m1+s1.w},{k:'xfer',at:z,min:5},{k:'ride',from:z,to:y.s,r:r2,min:m2},{k:'walk',min:wb}]};}}
 const out={walk,subway:best&&best.min<walk.min-2?best:null};_RC.set(key,out);return out;}
let _A=null;
const areas=()=>{if(_A)return _A;if(CUR.id!=='nyc'){_A=(CDATA().hoods||[]).map(h=>({name:h.n,b:h.b,c:h.c}));return _A;}const d=window.NYC_MAP;if(!d)return [];_A=d.hoods.filter(h=>h.t!=='air').map(h=>({name:h.n,b:h.b,c:h.c})).sort((a,b)=>a.name.localeCompare(b.name));return _A;};
const inRing=(pt,r)=>{let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const yi=r[i][0],xi=r[i][1],yj=r[j][0],xj=r[j][1];if(((yi>pt[0])!==(yj>pt[0]))&&(pt[1]<(xj-xi)*(pt[0]-yi)/(yj-yi)+xi))ins=!ins;}return ins;};
const hoodAt=ll=>{if(CUR.id!=='nyc'){const A=areas();if(!A.length)return null;const n=A.reduce((m,a)=>km(ll,a.c)<km(ll,m.c)?a:m);return km(ll,n.c)<6?n.name:null;}const d=window.NYC_MAP;if(!d)return null;for(const h of d.hoods){if(h.t==='air')continue;for(const poly of h.p){if(inRing(ll,poly[0])&&!poly.slice(1).some(r=>inRing(ll,r)))return h.n;}}
 const A=areas();return A.length?A.reduce((m,a)=>km(ll,a.c)<km(ll,m.c)?a:m).name:null;};
let _SI=null;
const streetIndex=()=>{if(_SI)return _SI;const D=window.NYC_STREETS;if(!D||!D.lines)return null;const G=0.01,cells=new Map(),lines=[];
 D.lines.forEach(a=>{const pts=new Float64Array(a.length-2);let x=0,y=0,mnA=1e9,mxA=-1e9,mnB=1e9,mxB=-1e9;
  for(let i=2;i<a.length;i+=2){x+=a[i];y+=a[i+1];const la=x/1e5,ln=y/1e5;pts[i-2]=la;pts[i-1]=ln;if(la<mnA)mnA=la;if(la>mxA)mxA=la;if(ln<mnB)mnB=ln;if(ln>mxB)mxB=ln;}
  let an=null;if(D.names[a[1]]){let best=0;const n=pts.length/2;for(let i=0;i<n-1;i++){const a0=Math.atan2(pts[2*i+2]-pts[2*i],(pts[2*i+3]-pts[2*i+1])*.76);let j=i+1;
    while(j<n-1){const a1=Math.atan2(pts[2*j+2]-pts[2*j],(pts[2*j+3]-pts[2*j+1])*.76);let d=Math.abs(a1-a0);if(d>Math.PI)d=2*Math.PI-d;if(d>0.12)break;j++;}
    const L=Math.hypot(pts[2*j]-pts[2*i],(pts[2*j+1]-pts[2*i+1])*.76);if(L>best){best=L;an=[pts[2*i],pts[2*i+1],pts[2*j],pts[2*j+1]];}i=j-1;}}
  const idx=lines.length;lines.push({c:a[0],n:D.names[a[1]]||'',pts,an});
  for(let i=Math.floor(mnA/G);i<=Math.floor(mxA/G);i++)for(let j=Math.floor(mnB/G);j<=Math.floor(mxB/G);j++){const k=i+','+j;let v=cells.get(k);if(!v)cells.set(k,v=[]);v.push(idx);}});
 _SI={G,cells,lines};return _SI;};
let STON=true;const _LP={};
const labelPlan=(z,map)=>{const key=z+(STON?'s':'');if(_LP[key])return _LP[key];const SI=streetIndex(),font=(z>=16?'700 11.5px':'700 10px')+' Archivo, sans-serif';
 const mc=document.createElement('canvas').getContext('2d');mc.font=font;const tw={},W=n=>tw[n]??(tw[n]=mc.measureText(n).width);
 const G=48,grid=new Map(),R=8;const circ=(x,y,ang,w)=>{const o=[],n=Math.max(1,Math.ceil(w/14));for(let i=0;i<=n;i++){const t=-w/2+w*i/n;o.push([x+Math.cos(ang)*t,y+Math.sin(ang)*t]);}return o;};
 const hit=cs=>cs.some(([x,y])=>{const gx=Math.floor(x/G),gy=Math.floor(y/G);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const v=grid.get((gx+i)+','+(gy+j));if(v&&v.some(([u,w])=>Math.hypot(u-x,w-y)<R*2))return true;}return false;});
 const put=cs=>cs.forEach(c=>{const k=Math.floor(c[0]/G)+','+Math.floor(c[1]/G);let v=grid.get(k);if(!v)grid.set(k,v=[]);v.push(c);});
 if(STON&&z>=15)ST().forEach(s=>{if(s.k)return;const p=map.project(s.c,z);const w=mc.measureText(s.n).width+s.r.length*15+10;put(circ(p.x+8+w/2,p.y,0,w));put([[p.x,p.y]]);});
 if(z<15&&CUR.id==='nyc')(window.NYC_MAP?.hoods||[]).forEach(hd=>{if(hd.t==='air')return;if(z<14&&hd.a<=0.0005)return;const p=map.project(hd.c,z);put(circ(p.x,p.y,0,Math.min(110,hd.n.length*6)));});
 const cand=[];SI.lines.forEach(ln=>{if(!ln.n||!ln.an||ln.c>(z>=15?2:1))return;const an=ln.an,p=map.project([an[0],an[1]],z),q=map.project([an[2],an[3]],z),L2=Math.hypot(q.x-p.x,q.y-p.y),w=W(ln.n);
  if(L2<w+16)return;let ang=Math.atan2(q.y-p.y,q.x-p.x);if(ang>Math.PI/2)ang-=Math.PI;if(ang<-Math.PI/2)ang+=Math.PI;cand.push({n:ln.n,mx:(p.x+q.x)/2,my:(p.y+q.y)/2,ang,w,pr:ln.c,L2});});
 cand.sort((a,b)=>a.pr-b.pr||b.L2-a.L2);const byName=new Map(),tiles=new Map(),norm=n=>n.toLowerCase().replace(/(\d+)(st|nd|rd|th)\b/g,'$1').replace(/\s+/g,' ');
 for(const c of cand){const nk=norm(c.n),prev=byName.get(nk)||[];if(prev.some(([x,y])=>Math.hypot(x-c.mx,y-c.my)<260))continue;const cs=circ(c.mx,c.my,c.ang,c.w+6);if(hit(cs))continue;put(cs);prev.push([c.mx,c.my]);byName.set(nk,prev);
  const e=c.w/2+6;for(let tx=Math.floor((c.mx-e)/256);tx<=Math.floor((c.mx+e)/256);tx++)for(let ty=Math.floor((c.my-e)/256);ty<=Math.floor((c.my+e)/256);ty++){const k=tx+','+ty;let v=tiles.get(k);if(!v)tiles.set(k,v=[]);v.push(c);}}
 return _LP[key]={font,tiles};};
const SRC={gmaps:{label:'Google Maps',bg:C.green},tiktok:{label:'TikTok',bg:'#10183F'},instagram:{label:'Instagram',bg:'#D9367F'},threads:{label:'Threads',bg:'#2B2B2B'},link:{label:'Website',bg:C.blue},manual:{label:'Added By Name',bg:'#7A809C'}};
const GMAPS_RE=/(^|\/\/|\.)(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i;
const detect=u=>!u?null:GMAPS_RE.test(u)?'gmaps':/tiktok\.com/i.test(u)?'tiktok':/instagram\.com|instagr\.am/i.test(u)?'instagram':/threads\.(net|com)/i.test(u)?'threads':/^https?:\/\//i.test(u)?'link':null;
const P=(id,name,cat,area,lat,lng,source,url,note,visited)=>({id,name,cat,area,lat,lng,source,url,note,visited:!!visited,address:''});
const SEED=[
 P('s1','Devoción','work','Williamsburg',40.7163,-73.9645,'tiktok','https://www.tiktok.com/@nyc.cafes/video/1','Skylight Room In The Back, Big Shared Tables'),
 P('s2','Sey Coffee','coffee','Bushwick',40.7066,-73.9229,'instagram','https://www.instagram.com/reel/sey'),
 P('s3','Café Integral','coffee','Nolita',40.7213,-73.9963,'threads','https://www.threads.net/@nyc/post/1','Nicaraguan Beans — Get The Cortado'),
 {...P('s4','Lucali','food','Carroll Gardens',40.6818,-74.0004,'tiktok','https://www.tiktok.com/@nyc.eats/video/2','Cash Only, Line Up Before 5'),price:2},
 {...P('s5','Thai Diner','food','Nolita',40.7225,-73.9955,'instagram','https://www.instagram.com/p/thaidiner','Thai Tea Babka French Toast'),price:2},
 {...P('s6','Dhamaka','food','Lower East Side',40.7186,-73.9880,'manual',''),price:3},
 P('s7','Eataly Flatiron','grocery','Flatiron',40.7421,-73.9897,'manual',''),
 P('s8',"Zabar's",'grocery','Upper West Side',40.7849,-73.9797,'tiktok','https://www.tiktok.com/@nyc/video/3','Smoked Fish Counter',true),
 P('s9',"Kalustyan's",'grocery','Murray Hill',40.7433,-73.9826,'instagram','https://www.instagram.com/p/kalustyans','Spices For Days'),
 P('s10','McNally Jackson','shop','SoHo',40.7235,-73.9961,'threads','https://www.threads.net/@nyc/post/2'),
 P('s11','Coming Soon','shop','Lower East Side',40.7144,-73.9905,'instagram','https://www.instagram.com/p/comingsoon','Colorful Homeware'),
 P('s12','Librae Bakery','bakery','East Village',40.7279,-73.9910,'tiktok','https://www.tiktok.com/@nyc/video/4'),
 P('s13','Win Son Bakery','bakery','Williamsburg',40.7092,-73.9440,'manual','','Mochi Donuts On Weekends'),
 P('s14','Kinship Coffee','work','Astoria',40.7647,-73.9204,'instagram','https://www.instagram.com/p/kinship')];
const LS='nycList.v1';
const _x=0;const toTitle=s=>s.replace(/\S+/g,w=>w[0].toUpperCase()+w.slice(1));
const PRICES=['$','$$','$$$','$$$$'],PRICE_HINT=['Under $20 A Person','$20–40 A Person','$40–80 A Person','$80+ A Person'];
const blank=()=>({id:null,price:0,url:'',name:'',cat:null,area:'auto',address:'',note:'',lat:null,lng:null,newCatOpen:false,newCatName:'',newCatColor:C.purple,newCatEmoji:'⭐'});
const gmaps=(a,b,mode)=>'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(a)+'&destination='+encodeURIComponent(b)+'&travelmode='+mode;
// A link shared into the app: ?add=<link> (iPhone Shortcut) or ?url= / ?text= / ?title= (Android share menu).
const SHARED_LINK=(()=>{try{const q=new URLSearchParams(location.search);const raw=['add','url','text','title'].map(k=>q.get(k)||'').join(' ');
  const m=raw.match(/https?:\/\/[^\s"'<>]+/i);if(!m&&!q.has('add'))return '';
  ['add','url','text','title'].forEach(k=>q.delete(k));const rest=q.toString();history.replaceState(null,'',location.pathname+(rest?'?'+rest:'')+location.hash);
  return m?m[0].replace(/[.,!?)\]]+$/,''):'';}catch(e){return '';}})();
const withCity=q=>{const re=CUR.id==='nyc'?/new york|nyc|brooklyn|queens|bronx|staten/i:new RegExp(CUR.q,'i');return re.test(q)?q:q+', '+CUR.qc;};
const placeQ=p=>p.address?`${p.name}, ${p.address}, ${CITIES[cityOf(p)].q}`:`${p.name}, ${p.area}, ${CITIES[cityOf(p)].q}`;

class Component extends DCLogic {
  mainMapRef=React.createRef(); exMapRef=React.createRef(); planMapRef=React.createRef(); tripMapRef=React.createRef();
  state=(()=>{let s=null;try{s=JSON.parse(localStorage.getItem(LS))}catch(e){}
    const all=s?.places||SEED,cur=CUR.id,cm={nyc:{home:s?.home||null,plan:s?.plan||{ids:['s3','s10','s5','s11'],start:'first'}},...(s?.cities||{})},m0=cm[cur]||{};
    return {places:all.filter(p=>cityOf(p)===cur),otherPlaces:all.filter(p=>cityOf(p)!==cur),cityMeta:cm,city:cur,cityOpen:false,cats:s?.cats||CATS0,home:m0.home||null,plan:m0.plan||{ids:[],start:'first'},
      tab:(this.props?.startTab==='Explore')?'explore':(this.props?.startTab==='Plan')?'plan':'map',mapCats:[],selId:null,confirmDel:false,
      exCats:[],exAreas:[],exPrices:[],exQuery:'',exFilters:false,deck:{key:'',pos:0},deckSeed:1,deckDx:0,deckFly:'',planSheet:'half',exStage:'pick',exView:'list',hideVisited:false,addOpen:false,placing:false,placingReturn:null,form:blank(),saving:false,toast:null,
      showSubway:LAYERS.sub!==false,showBus:!!LAYERS.bus,showBike:!!LAYERS.bike,showTram:!!LAYERS.tram,showFerry:!!LAYERS.ferry,layersOpen:false,busState:'',bikeState:'',tramState:'',ferryState:'',avatarBusy:false,avatarMsg:'',avatarV:0,spotPhotoBusy:false,gphoto:false,obNeed:false,obStep:0,obName:'',obAddr:'',obRes:[],obBusy:false,obMsg:'',obHome:null,showPass:false,here:null,locating:false,hereFailed:false,routeFor:null,routeMode:'home',routeSpot:null,routePick:0,pickerOpen:false,
      auth:window.NYCSync&&NYCSync.enabled?'loading':'local',syncState:'',syncEmail:'',acctOpen:false,authMode:'in',authEmail:'',authPass:'',authMsg:'',authBusy:false,aiBusy:false,aiStage:'',aiMsg:'',aiPlaces:[],aiSkip:[],addMode:'link',aiFor:'',aiAdding:false,sugg:[],suggBusy:false,suggPicked:'',suggNone:'',webBusy:false,webMsg:'',webFor:'',
      trips:[],tripsState:'',tripsSync:'',tripHere:[],tripStopMap:false,tripId:null,tripView:'list',tripSel:null,sharedMaps:{},tripShareOpen:false,tripPickOpen:false,tripPickQ:'',listChoose:null,
      newTripOpen:false,newTripName:'',newTripDays:0,newTripStart:'',newTripMe:'',newTripAddPid:null,newTripBusy:false,confirmTripDel:false,confirmStopDel:false,confirmNewLink:false,tripEditOpen:false,tripEditName:'',tripEditDays:0,tripEditStart:'',joinInfo:null,addTarget:null,authName:'',acctDel:0};})();

  // ---- cloud sync hooks (used by sync.js) ----
  // Synced data keeps every city's spots in one list (each tagged with its city); home and plan are NYC's for older
  // versions, and the other cities' home/plan live under cities.{sg,hk,to}.
  snapshot(){const s=this.state,cur=CUR.id,meta={...(s.cityMeta||{}),[cur]:{home:s.home,plan:s.plan}},cities={};
    CITY_ORDER.forEach(k=>{if(k!=='nyc'&&meta[k])cities[k]=meta[k];});const ny=meta.nyc||{};
    return {places:[...s.places.map(p=>p.city?p:{...p,city:cur}),...(s.otherPlaces||[])],cats:s.cats,home:ny.home||null,plan:ny.plan||{ids:[],start:'first'},cities,city:cur};}
  emptyData(){return {places:[],cats:CATS0,home:null,plan:{ids:[],start:'first'},cities:{}};}
  isExampleOnly(){const ids=new Set(SEED.map(p=>p.id)),s=this.state;return !(s.otherPlaces||[]).length&&s.places.length===SEED.length&&s.places.every(p=>ids.has(p.id))&&s.cats.length===CATS0.length;}
  // The picked city syncs too: when another device switched, this one follows.
  applyRemote(d){const moved=!!(d.city&&CITIES[d.city]&&d.city!==CUR.id);if(moved){setCityData(d.city);try{localStorage.setItem('nycList.city',d.city);}catch(e){}}
    const names=new Set(areas().map(a=>a.name)),cur=CUR.id,all=d.places||[],cm={nyc:{home:d.home||null,plan:d.plan||{ids:[],start:'first'}},...(d.cities||{})},m0=cm[cur]||{};
    const places=all.filter(p=>cityOf(p)===cur).map(p=>names.size&&!names.has(p.area)?{...p,area:hoodAt([p.lat,p.lng])||p.area}:p);
    this.setState(st=>({places,otherPlaces:all.filter(p=>cityOf(p)!==cur),cityMeta:cm,cats:d.cats&&d.cats.length?d.cats:CATS0,home:m0.home||null,plan:m0.plan||{ids:[],start:'first'},
      selId:places.some(p=>p.id===st.selId)?st.selId:null,routeFor:places.some(p=>p.id===st.routeFor)?st.routeFor:null,
      ...(moved?{city:cur,mapCats:[],exCats:[],exAreas:[],exPrices:[],exQuery:'',exStage:'pick',busState:'',tramState:'',ferryState:'',bikeState:''}:{})}),()=>{if(moved)this.cityMoved();});}
  setCity(id){if(!CITIES[id])return;const s=this.state,prev=CUR.id;if(id===prev){this.setState({cityOpen:false});return;}
    const all=[...s.places.map(p=>p.city?p:{...p,city:prev}),...(s.otherPlaces||[])],cm={...(s.cityMeta||{}),[prev]:{home:s.home,plan:s.plan}};
    setCityData(id);try{localStorage.setItem('nycList.city',id);}catch(e){}const m0=cm[id]||{};
    this.setState({places:all.filter(p=>cityOf(p)===id),otherPlaces:all.filter(p=>cityOf(p)!==id),cityMeta:cm,home:m0.home||null,plan:m0.plan||{ids:[],start:'first'},city:id,cityOpen:false,
      selId:null,routeFor:null,mapCats:[],exCats:[],exAreas:[],exPrices:[],exQuery:'',exStage:'pick',placing:false,layersOpen:false,obRes:[],obHome:null,obMsg:'',busState:'',tramState:'',ferryState:'',bikeState:''},()=>this.cityMoved());
    this.toast('Welcome To '+CUR.name+' '+CUR.emoji);}
  cityMoved(){if(!this.maps)return;this.allMaps().forEach(m=>{try{if(m.kind!=='trip')m.map.setMaxBounds(CUR.bounds);m.map.setView(CUR.center,12,{animate:false});}catch(e){}
      if(m.subway){const on=m.map.hasLayer(m.subway);m.subway.remove();this.buildSubway(m);if(on)m.subway.addTo(m.map);}
      if(!m.apple)this.drawBase(m);if(m.streets)try{m.streets.redraw();}catch(e){}m.sig='';m.ids='';m.psig=null;});
    this.allMaps().forEach(m=>this.fillLayers(m));this.syncMaps();setTimeout(()=>this.refreshVisible(),60);}
  resetLocal(){try{localStorage.removeItem(LS)}catch(e){}this.applyRemote(this.emptyData());this.setState({acctOpen:false,authEmail:'',authPass:''});}

  // Open Add A Spot with a shared link once sign-in has settled, and let AI read it.
  takeShared(){const s=this.state;if(!this._share||!(s.auth==='signedIn'||s.auth==='local'))return;const u=this._share;this._share=null;if(this._shareQ&&this._shareQ.length)setTimeout(()=>this.toast(this._shareQ.length+' More Shared '+(this._shareQ.length===1?'Link':'Links')+' Waiting'),900);
    this.setState({addOpen:true,tab:'map',placing:false,form:{...blank(),url:u},selId:null,routeFor:null,acctOpen:false,lookQ:'',lookResults:[],lookMsg:'',aiMsg:'',aiPlaces:[],aiSkip:[],addMode:'link',aiFor:'',sugg:[],suggBusy:false,suggPicked:'',suggNone:'',webBusy:false,webMsg:'',webFor:''});
    setTimeout(()=>{if(this.state.form.url===u){if(detect(u)==='link')this.setState({aiMsg:'Link Added — Tap ✨ Fill From Link To Read It.'});else this.aiAuto(u,true);}},400);}
  componentDidMount(){this._on=true;fetch(API('/api/photo?probe=1'),{cache:'no-store'}).then(r=>{if(r.status===204&&this._on){GPHOTO.on=true;this.setState({gphoto:true});}}).catch(()=>{});APPLE.fail=()=>{APPLE.state='off';this.allMaps().forEach(m=>this.dropApple(m));};this._share=SHARED_LINK;this._shareQ=[];setTimeout(()=>this.takeShared(),0);
    window.addEventListener('nyc-shared',e=>{const links=(e.detail||[]).filter(Boolean);if(!links.length)return;this._shareQ.push(...links);if(!this._share&&!this.state.addOpen)this._share=this._shareQ.shift();this.takeShared();});window.NYCSync&&NYCSync.attach(this);window.NYCLists&&NYCLists.attach(this);const go=()=>{if(!this._on)return;
    if(window.L&&window.NYC_MAP&&this.mainMapRef.current){
      this.maps={main:this.makeMap(this.mainMapRef.current,'main'),ex:null,plan:null};window.__nycMaps=this.maps;
      const names=new Set(areas().map(a=>a.name));
      this.setState(st=>({places:st.places.map(p=>names.has(p.area)?p:{...p,area:hoodAt([p.lat,p.lng])||p.area})}));
      this.syncMaps();setTimeout(()=>this.refreshVisible(),80);}
    else setTimeout(go,100);};go();}
  componentDidUpdate(){const s=this.state;if(this.watchPresence)this.watchPresence();if(!this._share&&!s.addOpen&&this._shareQ&&this._shareQ.length&&(s.auth==='signedIn'||s.auth==='local'))this._share=this._shareQ.shift();if(this._share)this.takeShared();
    if(this._pl!==s.places||this._ct!==s.cats||this._hm!==s.home||this._pn!==s.plan||this._op!==s.otherPlaces||this._cm!==s.cityMeta){this._pl=s.places;this._ct=s.cats;this._hm=s.home;this._pn=s.plan;this._op=s.otherPlaces;this._cm=s.cityMeta;
      try{localStorage.setItem(LS,JSON.stringify(this.snapshot()))}catch(e){}
      window.NYCSync&&NYCSync.queue(this.snapshot());
      clearTimeout(this._tpt);this._tpt=setTimeout(()=>window.NYCLists&&NYCLists.touchPlaces(this.state.places),1500);}
    if(this.maps&&this._ms!==this.props.mapStyle){const first=this._ms===undefined;this._ms=this.props.mapStyle;if(!first)this.allMaps().forEach(m=>this.drawBase(m));}
    if(this.maps&&this._ss!==s.showSubway){const first=this._ss===undefined;this._ss=s.showSubway;STON=s.showSubway;this.allMaps().forEach(m=>{s.showSubway?m.subway.addTo(m.map):m.subway.remove();if(!first&&m.streets)m.streets.redraw();});}
    const lk=[s.showBus,s.showBike,s.showTram,s.showFerry,s.city].join();
    if(this.maps&&this._lk!==lk){this._lk=lk;saveLayers({sub:s.showSubway,bus:s.showBus,bike:s.showBike,tram:s.showTram,ferry:s.showFerry});
      this.allMaps().forEach(m=>this.fillLayers(m));clearInterval(this._bikeT);if(s.showBike&&CUR.bike)this._bikeT=setInterval(()=>this.refreshBikes(),60000);}
    if(this._ssv!==s.showSubway){this._ssv=s.showSubway;saveLayers({sub:s.showSubway,bus:s.showBus,bike:s.showBike,tram:s.showTram,ferry:s.showFerry});}
    this.syncMaps();
    const vk=s.tab+s.exView+s.exStage+s.placing+(s.routeFor||'')+(s.tripId||'')+this.tripViewEff(this.tripCur());
    if(this.maps&&vk!==this._vk){this._vk=vk;setTimeout(()=>this.refreshVisible(),60);setTimeout(()=>this.refreshVisible(),300);}}
  allMaps(){return this.maps?[this.maps.main,this.maps.ex,this.maps.plan,this.maps.trip].filter(Boolean):[];}
  refreshVisible(){if(!this.maps)return;const s=this.state;
    const kick=m=>{const sz=m.map.getSize();m.map.invalidateSize({pan:false});const n=m.map.getSize();if(sz.x!==n.x||sz.y!==n.y||!m._drawn){m._drawn=true;m.map.fire('moveend');}};
    if(s.tab==='map'){kick(this.maps.main);this.maps.main.rsig=null;this.syncRoute();}
    if(s.tab==='explore'&&s.exStage==='results'&&s.exView==='map'){
      if(!this.maps.ex){this.maps.ex=this.makeMap(this.exMapRef.current,'ex');this.syncMaps();}else kick(this.maps.ex);
      const l=this.lists().ex;if(l.length)this.fit(this.maps.ex,l);}
    if(s.tab==='plan'){if(!this.maps.plan){this.maps.plan=this.makeMap(this.planMapRef.current,'plan');}else kick(this.maps.plan);this.maps.plan.psig=null;this.syncPlan(true);}
    if(s.tab==='lists'&&s.tripId&&this.tripMapRef.current){if(!this.maps.trip){this.maps.trip=this.makeMap(this.tripMapRef.current,'trip');}else kick(this.maps.trip);this.syncTrip(true);}}
  makeMap(el,kind){const L=window.L;
    const map=L.map(el,{zoomControl:false,attributionControl:false,minZoom:kind==='trip'?3:10,maxZoom:18,zoomSnap:.5,...(kind==='trip'?{}:{maxBounds:CUR.bounds,maxBoundsViscosity:.8}),preferCanvas:true}).setView(CUR.center,12);
    [['streets',410],['boroLab',450],['hoodBig',450],['hoodSmall',450],['bus',452],['subway',455],['stBul',456],['stLab',457],['bike',458],['route',470]].forEach(([n,z])=>{const p=map.createPane(n);p.style.zIndex=z;if(n!=='subway'&&n!=='route'&&n!=='bus'&&n!=='bike')p.style.pointerEvents='none';p.style.transition='opacity .35s';});
    const m={map,el,kind,base:L.layerGroup().addTo(map),labels:L.layerGroup().addTo(map),sig:'',ids:'',route:L.layerGroup().addTo(map),me:L.layerGroup().addTo(map)};
    this.drawBase(m);this.addStreets(m);this.buildSubway(m);if(this.state.showSubway)m.subway.addTo(map);m.bus=L.layerGroup();m.tram=L.layerGroup();m.ferry=L.layerGroup();m.bike=L.layerGroup();this.fillLayers(m);
    m.layer=L.layerGroup().addTo(map);
    const fade=()=>{const z=map.getZoom();const P=n=>map.getPane(n).style;P('boroLab').opacity=z<12.5?1:0;P('hoodBig').opacity=z>=12.5&&z<15?1:0;P('hoodSmall').opacity=z>=14&&z<15?1:0;P('subway').opacity=z>=12.5?1:0;P('stBul').opacity=z>=13.5&&z<15?1:0;P('stLab').opacity=z>=15?1:0;P('bus').opacity=z>=12?1:0;P('bike').opacity=z>=13.5?1:0;};
    map.on('zoomend',fade);fade();map.on('click',e=>this.onMapClick(e,kind));appleMaps(ok=>{if(ok&&this._on)this.attachApple(m);});return m;}
  // Put Apple's map under this Leaflet map and keep it in step. Leaflet's own base (borough colors, labels,
  // streets) is cleared; Leaflet stops snapping zoom so pinches stay smooth and lined up.
  // On the main map the bottom APPLE_PAD pixels sit under the tab bar, so Apple's logo and Legal link are
  // padded up above it (MapKit fits the rect we give it inside its padding).
  attachApple(m){if(m.apple||!window.mapkit)return;const map=m.map,pad=m.kind==='main'?APPLE_PAD:0;
    const div=document.createElement('div');div.className='apple-base';div.style.cssText='position:absolute;inset:0;z-index:100;pointer-events:none';
    let ak;try{ak=new mapkit.Map(div,{isScrollEnabled:false,isZoomEnabled:false,isRotationEnabled:false,showsCompass:mapkit.FeatureVisibility.Hidden,
      showsScale:mapkit.FeatureVisibility.Hidden,showsZoomControl:false,showsMapTypeControl:false,showsUserLocationControl:false,showsPointsOfInterest:true,
      colorScheme:mapkit.Map.ColorSchemes.Light,padding:new mapkit.Padding(0,0,pad,0)});}catch(e){console.warn('Apple Maps map',e);return;}
    m.el.insertBefore(div,m.el.firstChild);m.apple=ak;m.appleDiv=div;m.appleOpt={snap:map.options.zoomSnap,anim:map.options.zoomAnimation,za:map._zoomAnimated};
    m.base.clearLayers();m.labels.clearLayers();if(m.streets){map.removeLayer(m.streets);m.streets=null;}m.el.style.background='#F2EFE9';
    map.options.zoomSnap=0;map.options.zoomAnimation=false;map._zoomAnimated=false;
    m.appleSync=()=>{const sz=map.getSize();if(!sz.x||!sz.y||!m.apple)return;const b=map.getPixelBounds(),sc=map.options.crs.scale(map.getZoom());
      try{m.apple.setVisibleMapRectAnimated(new mapkit.MapRect(b.min.x/sc,b.min.y/sc,(b.max.x-b.min.x)/sc,Math.max(1,b.max.y-b.min.y-pad)/sc),false);}catch(e){}};
    map.on('move zoom resize viewreset',m.appleSync);m.appleSync();setTimeout(m.appleSync,50);}
  dropApple(m){if(!m.apple)return;const map=m.map;map.off('move zoom resize viewreset',m.appleSync);try{m.apple.destroy();}catch(e){}
    m.appleDiv&&m.appleDiv.remove();m.apple=null;m.appleDiv=null;const o=m.appleOpt;map.options.zoomSnap=o.snap;map.options.zoomAnimation=o.anim;map._zoomAnimated=o.za;
    this.drawBase(m);this.addStreets(m);}

  drawBase(m){const L=window.L,d=window.NYC_MAP,pal=PAL[this.props.mapStyle]||PAL.Apple;if(m.apple)return;
    m.el.style.background=CUR.id==='nyc'?pal.water:(pal.land||'#F4F2EE');m.base.clearLayers();m.labels.clearLayers();
    // Other cities: no outline data, so the backup map is plain land with neighborhood names (Apple Maps draws the real map).
    if(CUR.id!=='nyc'){areas().forEach(a=>L.marker(a.c,{pane:'hoodBig',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="transform:translate(-50%,-50%);white-space:nowrap;font:800 10px Archivo,sans-serif;color:${pal.label||'#6E6D69'};letter-spacing:.3px;text-transform:uppercase">${a.name}</div>`})}).addTo(m.labels));return;}
    d.hoods.forEach(h=>{L.polygon(h.p,{fillColor:h.t==='park'?pal.park:h.t==='air'?pal.air:(pal.boro[h.b]||pal.land||'#FBF6EC'),fillOpacity:1,color:pal.line,weight:.8,interactive:false}).addTo(m.base);
      if(h.t==='air')return;const park=h.t==='park';
      L.marker(h.c,{pane:h.a>0.0005||park?'hoodBig':'hoodSmall',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],
        html:`<div style="transform:translate(-50%,-50%);width:max-content;max-width:110px;text-align:center;font-family:Archivo,sans-serif;font-weight:800;font-size:10.5px;line-height:1.1;color:${park?'#14532D':(pal.label||'#10183F')};text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 2px #fff">${h.n}</div>`})}).addTo(m.labels);});
    d.boros.forEach(b=>{L.polygon(b.p,{fill:false,color:pal.boroLine||C.navy,weight:pal.boroW||2.2,opacity:.9,interactive:false}).addTo(m.base);
      L.marker(b.c,{pane:'boroLab',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],
        html:`<div style="transform:translate(-50%,-50%);white-space:nowrap;font-family:Archivo,sans-serif;font-weight:900;font-style:italic;font-stretch:100%;font-size:16px;color:${pal.boroLabel||'#10183F'};text-shadow:0 0 4px #fff,0 0 4px #fff">${b.b}</div>`})}).addTo(m.labels);});}
  addStreets(m){const L=window.L;if(m.apple||m.streets)return;if(!streetIndex()){setTimeout(()=>this.addStreets(m),400);return;}
    const Layer=L.GridLayer.extend({createTile(co){const t=document.createElement('canvas'),sz=this.getTileSize(),dpr=Math.min(2,window.devicePixelRatio||1);
      t.width=sz.x*dpr;t.height=sz.y*dpr;t.style.width=sz.x+'px';t.style.height=sz.y+'px';const ctx=t.getContext('2d');ctx.scale(dpr,dpr);
      const z=co.z,SI=streetIndex(),b=this._tileCoordsToBounds(co),nw=co.scaleBy(sz),G=SI.G,map=this._map;
      const maxC=z>=15?3:z>=14?2:1;const seen=new Set(),groups=[[],[],[],[]];
      const pad=0.002;for(let i=Math.floor((b.getSouth()-pad)/G);i<=Math.floor((b.getNorth()+pad)/G);i++)for(let j=Math.floor((b.getWest()-pad)/G);j<=Math.floor((b.getEast()+pad)/G);j++){
        const v=SI.cells.get(i+','+j);if(!v)continue;for(const k of v){if(seen.has(k))continue;seen.add(k);const ln=SI.lines[k];if(ln.c<=maxC)groups[ln.c].push(ln);}}
      const W=[[z>=16?9:z>=15?6:z>=14?4.5:z>=13?3:2],[z>=16?8:z>=15?5.5:z>=14?3.6:z>=13?2.2:1.3],[z>=17?7:z>=16?5:z>=15?3:1.4],[z>=16?3:1.5]];
      const path=ln=>{ctx.beginPath();for(let i=0;i<ln.pts.length;i+=2){const p=map.project([ln.pts[i],ln.pts[i+1]],z);const x=p.x-nw.x,y=p.y-nw.y;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();};
      ctx.lineCap='round';ctx.lineJoin='round';
      [3,2,1,0].forEach(c=>{const g=groups[c];if(!g.length)return;const w=W[c][0];
        if(c<=1){ctx.strokeStyle='rgba(16,24,63,.22)';ctx.lineWidth=w+1.6;g.forEach(path);}
        ctx.strokeStyle=c===0?'#FFF6D6':'#fff';ctx.globalAlpha=c===3?.7:1;ctx.lineWidth=w;g.forEach(path);ctx.globalAlpha=1;});
      if(z>=14){const LP=labelPlan(z,map),tx=co.x,ty=co.y,list=LP.tiles.get(tx+','+ty);
        if(list){ctx.font=LP.font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
          list.forEach(lb=>{ctx.save();ctx.translate(lb.mx-nw.x,lb.my-nw.y);ctx.rotate(lb.ang);ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=3.2;ctx.strokeText(lb.n,0,0);ctx.fillStyle='#3A4266';ctx.fillText(lb.n,0,0);ctx.restore();});}}
      return t;}});
    m.streets=new Layer({pane:'streets',minZoom:12,maxZoom:18,updateWhenZooming:false,keepBuffer:3}).addTo(m.map);}
  buildSubway(m){const L=window.L;m.subway=L.layerGroup();const rend=L.canvas({pane:'subway'});
    ST().forEach(s=>{if(s.k)return;const cm=L.circleMarker(s.c,{renderer:rend,radius:5.5,color:'#fff',weight:2,fillColor:bullet(s.r[0]).bg||C.navy,fillOpacity:1});
      const c0=bullet(s.r[0]).bg,c1=s.r.map(r=>bullet(r).bg).find(c=>c!==c0);if(c1)L.circleMarker(s.c,{renderer:rend,radius:2.4,stroke:false,fillColor:c1,fillOpacity:1,interactive:false}).addTo(m.subway);
      cm.on('click',e=>{window.L.DomEvent.stopPropagation(e);this.toast(s.n+' · '+s.r.map(r=>CUR.id==='nyc'?r:bullet(r).t).join(' '));});cm.addTo(m.subway);
      if(m.kind==='main'){const bl=s.r.slice(0,6).map(r=>{const b=bullet(r);return `<span style="width:14px;height:14px;border-radius:50%;background:${b.bg};color:${b.fg};font-size:8px;font-weight:800;display:inline-flex;align-items:center;justify-content:center">${b.t}</span>`;}).join('');
        L.marker(s.c,{pane:'stBul',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="position:absolute;left:8px;top:-7px;display:flex;gap:1px">${bl}</div>`})}).addTo(m.subway);
        L.marker(s.c,{pane:'stLab',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="position:absolute;left:8px;top:-8px;display:flex;align-items:center;gap:4px;white-space:nowrap;font-family:Archivo,sans-serif;font-weight:800;font-size:10px;color:#10183F;text-shadow:0 0 3px #fff,0 0 3px #fff"><span>${s.n}</span><span style="display:inline-flex;gap:1px">${bl}</span></div>`})}).addTo(m.subway);}});}
  // Bus routes (from /api/bus) as thin lines in each route's MTA color; tap one for its name.
  // Show or hide each map's route and bike layers for the current city and switches.
  fillLayers(m){const s=this.state,has=k=>CUR.layers.includes(k);
    [['bus','showBus'],['tram','showTram'],['ferry','showFerry']].forEach(([k,f])=>{if(s[f]&&has(k))this.fillRoutes(m,k);else if(m[k])m[k].remove();});
    if(s.showBike&&has('bike'))this.fillBike(m);else m.bike.remove();}
  // Route lines (tap one for its number and name). Redrawn when the city changes.
  fillRoutes(m,kind){const L=window.L,city=CUR.id,g=m[kind],flag=kind+'On',st=kind+'State',show={bus:'showBus',tram:'showTram',ferry:'showFerry'}[kind];
    if(m[flag]===city){g.addTo(m.map);return;}
    if(!this.state[st])this.setState({[st]:'loading'});
    loadRoutes(city,kind).then(routes=>{if(!this._on||!this.state[show]||CUR.id!==city)return;
      const what=kind==='bus'?'Bus Routes':((CUR[kind]||{}).label||'Routes');
      if(!routes){this.setState({[st]:'error'});this.toast(what+' Aren\u2019t Available Right Now');return;}
      if(m[flag]!==city){g.clearLayers();m[flag]=city;const rend=L.canvas({pane:'bus',tolerance:6});const T={L:'Local',LTD:'Limited',SBS:'Select Bus',X:'Express'};
        routes.forEach(r=>r.s.forEach(enc=>{const pts=[];let la=enc[0],ln=enc[1];pts.push([la/1e5,ln/1e5]);for(let i=2;i<enc.length;i+=2){la+=enc[i];ln+=enc[i+1];pts.push([la/1e5,ln/1e5]);}
          const ny=city==='nyc';
          L.polyline(pts,{renderer:rend,color:r.c,weight:kind==='tram'?3.6:kind==='ferry'?2.8:r.t==='SBS'?3.5:ny?2.6:2.2,opacity:r.t==='X'?.55:ny||kind!=='bus'?.85:.6,dashArray:r.t==='X'||kind==='ferry'?'6 5':null,lineCap:'round',lineJoin:'round'})
            .on('click',e=>{L.DomEvent.stopPropagation(e);this.toast(ny?r.n+' · '+T[r.t]+(r.l?' · '+r.l:''):[r.n,r.l].filter(Boolean).join(' · ')||what);}).addTo(g);}));}
      if(this.state[show])g.addTo(m.map);if(this.state[st]!=='ok')this.setState({[st]:'ok'});});}
  // Citi Bike docks from Citi Bike's public live feed; tap one for bikes and open docks. Counts refresh every minute.
  fillBike(m){m.bike.addTo(m.map);if(m.bikeCity!==CUR.id){m.bike.clearLayers();m.bikeCity=CUR.id;}if(!this.state.bikeState)this.setState({bikeState:'loading'});const city=CUR.id;
    loadBikes().then(ok=>{if(!this._on||CUR.id!==city)return;if(!ok){this.setState({bikeState:'error'});this.toast((CUR.bike||{}).name+' Isn\u2019t Available Right Now');return;}this.drawBikes(m);if(this.state.bikeState!=='ok')this.setState({bikeState:'ok'});});}
  drawBikes(m){const L=window.L,BIKE=bikeOf();if(!BIKE.info)return;m.bike.clearLayers();const rend=m.bikeRend||(m.bikeRend=L.canvas({pane:'bike',tolerance:4}));
    BIKE.info.forEach(st=>{const q=BIKE.status[st.station_id]||{},bikes=q.num_bikes_available||0,open=q.is_renting!==0&&q.is_installed!==0;
      L.circleMarker([st.lat,st.lon],{renderer:rend,radius:5,color:'#fff',weight:1.6,fillColor:!open?'#A0A3B1':bikes?'#0A6FD6':'#7FA9DA',fillOpacity:1})
        .on('click',e=>{L.DomEvent.stopPropagation(e);const eb=q.num_ebikes_available||0,docks=q.num_docks_available||0;
          this.toast(!open?st.name+' · Closed':st.name+' · '+bikes+(bikes===1?' Bike':' Bikes')+(eb?' ('+eb+' E-Bike'+(eb===1?'':'s')+')':'')+' · '+docks+(docks===1?' Dock':' Docks'));}).addTo(m.bike);});}
  refreshBikes(){if(!this.state.showBike||!CUR.bike)return;loadBikes(true).then(ok=>{if(ok&&this._on)this.allMaps().forEach(m=>this.drawBikes(m));});}
  // Profile photo: crop the middle square, shrink it to 320×320 JPEG on the phone, then upload.
  pickAvatar(file){if(!file||!window.NYCSync)return;this.setState({avatarBusy:true,avatarMsg:''});
    shrinkImage(file,320,320).then(b=>NYCSync.setAvatar(b)).then(r=>{this.setState({avatarBusy:false,avatarMsg:r.ok?'':photoErr(r.error)});if(r.ok)this.toast('Photo Saved');})
      .catch(e=>this.setState({avatarBusy:false,avatarMsg:(e&&e.message)||'Couldn\u2019t Upload It. Check Your Connection.'}));}
  // A saved spot's own photo (overrides the Google one).
  pickSpotPhoto(id,file){if(!file||!id)return;if(!window.NYCSync||this.state.auth!=='signedIn'){this.toast('Sign In To Add Photos');return;}
    this.setState({spotPhotoBusy:true});
    shrinkImage(file,800,600).then(b=>NYCSync.uploadImage('spot-'+id,b)).then(r=>{this.setState({spotPhotoBusy:false});if(r.error){this.toast(photoErr(r.error));return;}
      this.setState(st=>({places:st.places.map(p=>p.id===id?{...p,photo:r.url}:p)}));this.toast('Photo Added');})
      .catch(e=>{this.setState({spotPhotoBusy:false});this.toast((e&&e.message)||'Couldn\u2019t Upload It');});}
  removeSpotPhoto(id){this.setState(st=>({places:st.places.map(p=>p.id===id?{...p,photo:''}:p)}));window.NYCSync&&NYCSync.removeImage('spot-'+id);}
  removeAvatar(){if(!window.NYCSync)return;this.setState({avatarBusy:true,avatarMsg:''});NYCSync.removeAvatar().then(r=>this.setState({avatarBusy:false,avatarMsg:r.ok?'':r.error})).catch(()=>this.setState({avatarBusy:false}));}
  onMapClick(e,kind){const s=this.state;
    if(kind==='main'&&s.placing){const ll=[r5(e.latlng.lat),r5(e.latlng.lng)],a=hoodAt(ll);
      if(s.placing==='here'){const ret=s.placingReturn;this.setState({placing:false,here:ll,hereAcc:0,hereManual:true,hereFailed:false,locFail:null,...(ret==='plan'?{tab:'plan'}:{}),...(ret&&ret.startsWith('route:')?{routeFor:ret.slice(6),routeMode:'here'}:{})});this.toast('Got It — You\u2019re In '+(a||'NYC'));return;}
      if(s.placing==='home'){const ret=s.placingReturn;this.setState({placing:false,home:{lat:ll[0],lng:ll[1],area:a},routeMode:'home',...(ret==='plan'?{tab:'plan'}:{}),...(ret&&ret.startsWith('route:')?{routeFor:ret.slice(6)}:{})});this.toast('Home Saved In '+(a||'NYC'));return;}
      this.setState(st=>({placing:false,addOpen:true,form:{...st.form,lat:ll[0],lng:ll[1],area:a||st.form.area}}));return;}
    if(kind==='trip'){if(s.tripSel)this.setState({tripSel:null,confirmStopDel:false});return;}
    if(kind!=='plan')this.setState({selId:null,confirmDel:false});}
  fit(m,l,opt){const pts=l.map(p=>Array.isArray(p)?p:[p.lat,p.lng]).filter(p=>p&&isFinite(p[0])&&isFinite(p[1]));if(!pts.length)return;
    try{m.map.fitBounds(window.L.latLngBounds(pts),opt||{padding:[60,60],maxZoom:15});}catch(e){console.log('fit fail',m.kind,JSON.stringify(l).slice(0,200));}}
  priced(catId){const c=this.state.cats.find(x=>x.id===catId);return catId==='food'||!!(c&&/restaurant|bar\b|food|brunch|dinner|eats/i.test(c.name));}
  lists(){const s=this.state;
    return {main:s.places.filter(p=>!s.mapCats.length||s.mapCats.includes(p.cat)),
      ex:s.places.filter(p=>(!s.exCats.length||s.exCats.includes(p.cat))&&(!s.exAreas.length||s.exAreas.includes(p.area))&&!(s.hideVisited&&p.visited)&&(!s.exPrices.length||!this.priced(p.cat)||s.exPrices.includes(p.price||0))&&this.exMatchQ(p))};}
  // Explore search: every word typed must appear in the spot's name, area, address or note.
  exMatchQ(p){const q=this.state.exQuery.trim().toLowerCase();if(!q)return true;const t=(p.name+' '+p.area+' '+(p.address||'')+' '+(p.note||'')).toLowerCase();return q.split(/\s+/).every(w=>t.includes(w));}
  // Explore deck: the matches in a shuffled order (the seed changes with Shuffle Again). The position resets when the filters change.
  deckList(){const s=this.state,seed=s.deckSeed;const h=id=>{let x=Math.imul(seed,2654435761)>>>0;for(const ch of String(id))x=Math.imul(x^ch.charCodeAt(0),16777619)>>>0;return x;};
    return [...this.lists().ex].sort((a,b)=>h(a.id)-h(b.id));}
  deckKeyNow(){const s=this.state;return [s.exCats,s.exAreas,s.exPrices,s.hideVisited,s.exQuery.trim().toLowerCase(),s.deckSeed].map(String).join('|');}
  deckPos(){const s=this.state;return s.deck.key===this.deckKeyNow()?s.deck.pos:0;}
  deckAct(kind){if(this.state.deckFly)return;const pos=this.deckPos(),p=this.deckList()[pos];if(!p)return;
    if(kind==='plan'){if(!this.state.plan.ids.includes(p.id))this.togglePlan(p.id);else this.toast('Already In Your Plan');}
    this.setState({deckFly:kind==='plan'?'right':'left'});
    setTimeout(()=>this.setState({deckFly:'',deckDx:0,deck:{key:this.deckKeyNow(),pos:pos+1}}),240);}
  deckDown(e){if(this.state.deckFly)return;this._dg={x:e.clientX,dx:0,moved:false};try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}}
  deckMove(e){const g=this._dg;if(!g)return;g.dx=e.clientX-g.x;if(Math.abs(g.dx)>6)g.moved=true;if(g.moved)this.setState({deckDx:g.dx});}
  deckUp(id){const g=this._dg;this._dg=null;if(!g)return;
    if(!g.moved){this.setState({deckDx:0,selId:id,confirmDel:false});return;}
    if(g.dx>90)this.deckAct('plan');else if(g.dx<-90)this.deckAct('skip');else this.setState({deckDx:0});}
  syncMaps(){if(!this.maps)return;const l=this.lists(),s=this.state,f=s.form;let main=l.main;
    if(s.placing==='spot'&&f.lat!=null)main=[...main,{id:'_draft',cat:f.cat,lat:f.lat,lng:f.lng,draft:true}];
    if(s.routeFor){const d=s.places.find(p=>p.id===s.routeFor);main=d?[d]:main;}
    this.syncOne(this.maps.main,main,false);if(this.maps.ex)this.syncOne(this.maps.ex,l.ex,true);
    this.syncMe();this.syncRoute();if(this.maps.plan)this.syncPlan(false);if(this.maps.trip)this.syncTrip(false);}
  // Glass pin (mockup): a frosted ring around a colored core with the category's line icon or the stop number,
  // centered on the spot. Selected pins grow and get a yellow halo.
  // num: a stop's place in a plan or day, shown as a small badge so the pin can still show the category icon.
  pinHtml(col,z,sel,faded,label,em,num){const pad=sel?7:Math.max(4,Math.round(z*.11)),core=z-pad*2,fg=fgFor(col);
    return `<div style="position:relative;width:${z}px;height:${z}px;opacity:${faded?.55:1}">${sel?`<div style="position:absolute;inset:-${Math.round(z*.28)}px;border-radius:50%;border:2px solid rgba(255,196,37,.9);background:rgba(255,196,37,.18)"></div>`:''}<div style="position:absolute;inset:0;border-radius:50%;background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(10px) saturate(180%);backdrop-filter:blur(10px) saturate(180%);border:1px solid rgba(255,255,255,.85);box-shadow:0 8px 20px rgba(16,24,63,.22),inset 0 1px 0 rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center"><div style="width:${core}px;height:${core}px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center">${label?`<span style="color:${fg};font:italic 900 ${Math.round(core*.5)}px Archivo,sans-serif">${label}</span>`:em?iconSvg(em,Math.round(core*.53),fg):`<span style="width:${Math.round(core*.32)}px;height:${Math.round(core*.32)}px;border-radius:50%;background:${fg}"></span>`}</div></div>${num?`<div style="position:absolute;top:-5px;right:-6px;min-width:19px;height:19px;padding:0 4px;box-sizing:border-box;border-radius:999px;background:#10183F;color:#fff;border:2px solid #fff;font:800 10.5px Archivo,sans-serif;display:flex;align-items:center;justify-content:center">${num}</div>`:''}</div>`;}
  syncOne(m,list,fit){const L=window.L,s=this.state,cat=Object.fromEntries(s.cats.map(c=>[c.id,c]));
    const sig=list.map(p=>p.id+p.cat+(p.visited?'v':'')+(p.id===s.selId||p.id===s.routeFor?'s':'')+p.lat+p.lng).join()+s.cats.map(c=>c.color+emo(c)).join();
    if(sig===m.sig)return;const ids=list.map(p=>p.id).join();const refit=fit&&ids!==m.ids;m.sig=sig;m.ids=ids;m.layer.clearLayers();
    list.forEach(p=>{const sel=p.id===s.selId||p.id===s.routeFor||p.draft,z=sel?64:44,col=(cat[p.cat]||{}).color||C.orange;
      const mk=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:this.pinHtml(col,z,sel,p.visited&&!sel,null,cat[p.cat]?emo(cat[p.cat]):null),iconSize:[z,z],iconAnchor:[z/2,z/2]}),zIndexOffset:sel?1000:0,interactive:!p.draft});
      if(!p.draft)mk.on('click',e=>{L.DomEvent.stopPropagation(e);if(this.state.placing||this.state.routeFor)return;this.setState({selId:p.id,confirmDel:false});});mk.addTo(m.layer);});
    if(refit&&list.length)this.fit(m,list);}
  syncMe(){const m=this.maps.main,L=window.L,s=this.state;const sig=JSON.stringify([s.home,s.here,s.hereAcc]);if(sig===m.mesig)return;m.mesig=sig;m.me.clearLayers();
    if(s.home)L.marker([s.home.lat,s.home.lng],{interactive:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="transform:translate(-50%,-50%);background:#10183F;color:#FFC425;font:italic 900 12px Archivo,sans-serif;font-stretch:100%;padding:5px 10px;border-radius:999px;border:2px solid #fff;box-shadow:0 3px 8px rgba(16,24,63,.4);white-space:nowrap">Home</div>`})}).addTo(m.me);
    if(s.here&&s.hereAcc>25&&s.hereAcc<2000)L.circle(s.here,{radius:s.hereAcc,renderer:L.svg({pane:'route'}),color:C.blue,weight:1.5,opacity:.5,fillColor:C.blue,fillOpacity:.12,interactive:false}).addTo(m.me);
    if(s.here)L.marker(s.here,{interactive:false,zIndexOffset:2000,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#1B3DB8;border:3px solid #fff;box-shadow:0 0 0 6px rgba(27,61,184,.25)"></div>`})}).addTo(m.me);}
  originPt(){const s=this.state;if(s.routeMode==='here')return s.here;if(s.routeMode==='home')return s.home?[s.home.lat,s.home.lng]:null;
    const p=s.places.find(x=>x.id===s.routeSpot);return p?[p.lat,p.lng]:null;}
  routeData(){const s=this.state;if(!s.routeFor)return null;const d=s.places.find(p=>p.id===s.routeFor);if(!d)return null;const a=this.originPt(),b=[d.lat,d.lng];
    if(!a)return {d,a:null,b};if(km(a,b)>60)return {d,a,b,far:true};const e=estimate(a,b);
    const opts=[];if(e.subway)opts.push({mode:'subway',min:e.subway.min,legs:e.subway.legs});opts.push({mode:'walk',min:e.walk.min,km:e.walk.km});
    opts.sort((x,y)=>x.min-y.min);return {d,a,b,opts};}
  syncRoute(){const m=this.maps&&this.maps.main;if(!m)return;const L=window.L,r=this.routeData(),s=this.state;
    const o=r&&r.opts?r.opts[Math.min(s.routePick,r.opts.length-1)]:null;const sig=r&&o?JSON.stringify([r.a,r.b,o.mode,o.min]):'';if(sig===m.rsig)return;m.rsig=sig;m.route.clearLayers();if(!o)return;
    const rend=L.svg({pane:'route'});const dash=(p,q)=>L.polyline([p,q],{renderer:rend,color:C.navy,weight:4,dashArray:'1 9',lineCap:'round',interactive:false}).addTo(m.route);
    const pts=[r.a,r.b];
    if(o.mode==='walk')dash(r.a,r.b);
    else{let cur=r.a;o.legs.forEach(l=>{if(l.k==='walk'){const to=l.to?l.to.c:r.b;dash(cur,to);cur=to;}
      else if(l.k==='ride'){L.polyline([l.from.c,l.to.c],{renderer:rend,color:'#fff',weight:10,lineCap:'round',interactive:false}).addTo(m.route);
        L.polyline([l.from.c,l.to.c],{renderer:rend,color:RC[l.r[0]]||C.navy,weight:6,lineCap:'round',interactive:false}).addTo(m.route);
        [l.from,l.to].forEach(st=>{L.circleMarker(st.c,{renderer:rend,radius:6,color:C.navy,weight:3,fillColor:'#fff',fillOpacity:1,interactive:false}).addTo(m.route);pts.push(st.c);});cur=l.to.c;}});}
    L.circleMarker(r.a,{renderer:rend,radius:8,color:'#fff',weight:3,fillColor:C.navy,fillOpacity:1,interactive:false}).addTo(m.route);
    setTimeout(()=>{try{const map=m.map,b=L.latLngBounds(pts),sz=map.getSize();if(!sz.y)return;const top=150,bot=Math.min(sz.y*.6,500)+10,aH=Math.max(120,sz.y-top-bot),aW=sz.x-70;
      const z=Math.min(16,map.getBoundsZoom(b,false,L.point(sz.x-aW,sz.y-aH)));const c=map.project(b.getCenter(),z).add(L.point(0,(bot-top)/2));
      map.setView(map.unproject(c,z),z,{animate:true});}catch(e){console.log('route fit',e.message);}},30);}
  planStops(){const s=this.state;return s.plan.ids.map(id=>s.places.find(p=>p.id===id)).filter(Boolean);}
  planStartPt(){const s=this.state;if(s.plan.start==='home')return s.home?[s.home.lat,s.home.lng]:null;if(s.plan.start==='here')return s.here;return null;}
  syncPlan(force){const m=this.maps.plan;if(!m)return;const L=window.L,s=this.state,stops=this.planStops(),start=this.planStartPt(),cat=Object.fromEntries(s.cats.map(c=>[c.id,c]));
    const sig=JSON.stringify([stops.map(p=>p.id+p.lat),start,s.cats.map(c=>c.color)]);if(!force&&sig===m.psig)return;m.psig=sig;
    if(!m.planL)m.planL=L.layerGroup().addTo(m.map);m.planL.clearLayers();m.layer.clearLayers();m.sig='';
    const pts=[...(start?[start]:[]),...stops.map(p=>[p.lat,p.lng])];
    if(pts.length>1){const rend=L.svg({pane:'route'});L.polyline(pts,{renderer:rend,color:'#fff',weight:8,lineCap:'round',lineJoin:'round',interactive:false}).addTo(m.planL);L.polyline(pts,{renderer:rend,color:C.orange,weight:4,dashArray:'2 8',lineCap:'round',interactive:false}).addTo(m.planL);}
    if(start)L.marker(start,{interactive:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="transform:translate(-50%,-50%);background:#10183F;color:#FFC425;font:italic 900 11px Archivo,sans-serif;padding:4px 9px;border-radius:999px;border:2px solid #fff;white-space:nowrap">Start</div>`})}).addTo(m.planL);
    stops.forEach((p,i)=>{const c=cat[p.cat],col=(c||{}).color||C.orange;L.marker([p.lat,p.lng],{zIndexOffset:500,icon:L.divIcon({className:'',html:this.pinHtml(col,40,false,false,null,c?emo(c):'📍',String(i+1)),iconSize:[40,40],iconAnchor:[20,20]})})
      .on('click',e=>{L.DomEvent.stopPropagation(e);this.toast((i+1)+'. '+p.name);}).addTo(m.planL);});
    const H=window.innerHeight||800,full=s.planSheet==='full';
    if(pts.length)setTimeout(()=>this.fit(m,pts,full?{paddingTopLeft:[40,90],paddingBottomRight:[40,Math.round(H*.72)],maxZoom:15}:{paddingTopLeft:[40,250],paddingBottomRight:[40,Math.round(H*.5)],maxZoom:15.5}),30);}
  setPlanSheet(v){if(v===this.state.planSheet)return;this.setState({planSheet:v},()=>{if(this.maps&&this.maps.plan){this.maps.plan.psig=null;this.syncPlan(true);}});}
  locate(after){if(!navigator.geolocation){this.setState({hereFailed:true,locFail:'This Browser Doesn\u2019t Share Location. Tap The Map Where You Are Instead.'});return;}
    this.setState({locating:true,locFail:null});let first=true;if(this._wid!=null)navigator.geolocation.clearWatch(this._wid);
    const ok=pos=>{const ll=[r5(pos.coords.latitude),r5(pos.coords.longitude)];this.setState({here:ll,hereAcc:Math.round(pos.coords.accuracy||0),hereManual:false,locating:false,hereFailed:false,locFail:null});
      if(first){first=false;clearTimeout(this._lt);if(km(ll,CUR.center)>60)this.toast('You Seem To Be Outside '+CUR.short+' Right Now');after&&after(ll);}};
    const bad=err=>{if(!first)return;first=false;clearTimeout(this._lt);if(this._wid!=null){navigator.geolocation.clearWatch(this._wid);this._wid=null;}
      const msg=err&&err.code===1?'Location Access Is Turned Off For This Page. Allow It In Your Browser Settings, Or Tap The Map Where You Are.':'Your Location Didn\u2019t Come Through. Try Again, Or Tap The Map Where You Are.';
      this.setState({locating:false,hereFailed:true,locFail:msg});};
    try{this._wid=navigator.geolocation.watchPosition(ok,bad,{enableHighAccuracy:true,timeout:12000,maximumAge:30000});}catch(e){bad();}
    this._lt=setTimeout(()=>bad({code:3}),14000);}
  componentWillUnmount(){this._on=false;if(this._wid!=null&&navigator.geolocation)navigator.geolocation.clearWatch(this._wid);}

  async lookup(q,limit){try{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),7000);
    const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit='+(limit||5)+'&viewbox='+[CUR.box[1],CUR.box[2],CUR.box[3],CUR.box[0]].join()+'&bounded=1&q='+encodeURIComponent(q),{signal:ac.signal,headers:{'Accept-Language':'en'}});clearTimeout(t);
    if(!r.ok)return null;return await r.json();}catch(e){return null;}}
  async runLookup(){const q=(this.state.lookQ||'').trim()||[this.state.form.name,this.state.form.address].filter(Boolean).join(', ');if(!q){this.setState({lookMsg:'Type An Address Or Place Name First'});return;}
    this.setState({lookBusy:true,lookMsg:'',lookResults:[]});const res=await this.lookup(withCity(q));
    if(res===null){this.setState({lookBusy:false,lookMsg:'Address Lookup Isn’t Reachable Right Now — Drop A Pin Instead'});return;}
    if(!res.length){this.setState({lookBusy:false,lookMsg:'No Matches In '+CUR.short+' — Try Adding Cross Streets Or Drop A Pin'});return;}
    this.setState({lookBusy:false,lookResults:res.slice(0,5)});}
  pickLookup(r){const ll=[r5(+r.lat),r5(+r.lon)],a=r.address||{},area=hoodAt(ll);const street=[a.house_number,a.road].filter(Boolean).join(' ');
    this.setState(st=>({lookResults:[],lookMsg:'',form:{...st.form,lat:ll[0],lng:ll[1],area:area||st.form.area,address:st.form.address||street,name:st.form.name||(r.name&&r.name!==street?r.name:'')}}));this.toast('Found It'+(area?' In '+area:'')+'!');}
  toast(t){this.setState({toast:t});window.NYCNative&&NYCNative.tap();clearTimeout(this._tt);this._tt=setTimeout(()=>this.setState({toast:null}),2400);}
  toggle(k,id){this.setState(st=>({[k]:st[k].includes(id)?st[k].filter(x=>x!==id):[...st[k],id]}));}
  togglePlan(id){const inP=this.state.plan.ids.includes(id);this.setState(st=>({plan:{...st.plan,ids:inP?st.plan.ids.filter(x=>x!==id):[...st.plan.ids,id]}}));this.toast(inP?'Removed From Plan':'Added To Your Plan');}
  setForm(p){this.setState(st=>({form:{...st.form,...p}}));}
  startPlacing(kind,ret){const f=this.state.form;this.setState({placing:kind,placingReturn:ret||null,addOpen:false,tab:'map',selId:null,routeFor:null});
    setTimeout(()=>{if(!this.maps)return;const mp=this.maps.main.map;mp.invalidateSize();
      if(kind==='spot'&&f.lat!=null)mp.flyTo([f.lat,f.lng],16,{duration:.6});else{const a=areas().find(x=>x.name===f.area);if(kind==='spot'&&a)mp.flyTo(a.c,15,{duration:.6});}},60);}
  autoOrder(){const s=this.state,pts=this.planStops();if(pts.length<2){this.toast('Add At Least 2 Stops');return;}const start=this.planStartPt();
    const P=p=>[p.lat,p.lng];const len=o=>{let t=0,c=start;o.forEach(p=>{if(c)t+=km(c,P(p));c=P(p);});return t;};let best=null;
    (start?[null]:pts.map((_,i)=>i)).forEach(si=>{let rem=[...pts],order=[],cur=start;if(si!=null){order.push(rem.splice(si,1)[0]);cur=P(order[0]);}
      while(rem.length){let bi=0,bd=1e9;rem.forEach((p,i)=>{const d=km(cur,P(p));if(d<bd){bd=d;bi=i;}});const p=rem.splice(bi,1)[0];order.push(p);cur=P(p);}
      let imp=true;while(imp){imp=false;for(let i=0;i<order.length-1;i++)for(let k=i+1;k<order.length;k++){const n=[...order.slice(0,i),...order.slice(i,k+1).reverse(),...order.slice(k+1)];if(len(n)<len(order)-1e-9){order=n;imp=true;}}}
      if(!best||len(order)<best.l)best={o:order,l:len(order)};});
    this.setState(st=>({plan:{...st.plan,ids:best.o.map(p=>p.id)}}));this.toast('Ordered For The Shortest Trip');}
  move(i,d){this.setState(st=>{const ids=[...st.plan.ids],j=i+d;if(j<0||j>=ids.length)return null;[ids[i],ids[j]]=[ids[j],ids[i]];return {plan:{...st.plan,ids}};});}
  async save(){const s=this.state,f=s.form;if(!f.name.trim()||!f.cat||s.saving)return;const orig=f.id?s.places.find(p=>p.id===f.id):null;
    let ll=f.lat!=null?[f.lat,f.lng]:null;
    if(!ll){this.setState({saving:true});const ao=areas().find(a=>a.name===f.area);
      const q=f.address.trim()?withCity(f.address):f.name+(ao?', '+ao.name:'')+', '+CUR.qc;const res=await this.lookup(q,1);
      if(res&&res[0]){ll=[r5(+res[0].lat),r5(+res[0].lon)];if(ao&&!f.address.trim()&&km(ll,ao.c)>3)ll=null;}
      if(!ll&&ao)ll=[r5(ao.c[0]+(Math.random()-.5)*.004),r5(ao.c[1]+(Math.random()-.5)*.004)];
      this.setState({saving:false});if(!ll){this.toast('Couldn’t Find It — Drop A Pin Or Pick A Neighborhood');return;}}
    const area=f.area==='auto'?(hoodAt(ll)||'Midtown'):f.area;
    const p={id:f.id||('p'+Date.now()),name:f.name.trim(),cat:f.cat,area,lat:ll[0],lng:ll[1],url:f.url.trim(),source:detect(f.url.trim())||'manual',address:f.address.trim(),note:f.note.trim(),price:this.priced(f.cat)?(f.price||0):0,visited:orig?orig.visited:false};
    if(s.addTarget&&!orig){const tid=s.addTarget;this.addStopsTo(tid,[p],false);this.setState({addOpen:false,addTarget:null,tab:'lists',tripId:tid,tripView:'list',tripSel:null});this.toast('Added To The List!');return;}
    this.setState(st=>({addOpen:false,tab:'map',selId:p.id,mapCats:[],places:orig?st.places.map(x=>x.id===p.id?p:x):[p,...st.places]}),
      ()=>setTimeout(()=>{if(this.maps){this.maps.main.map.invalidateSize();this.maps.main.map.flyTo(ll,15,{duration:.8});}},80));
    this.toast(orig?'Changes Saved':'Pinned To Your Map!');}
  // Apple requires in-app account deletion. Server: /api/delete-account (needs SUPABASE_SERVICE_ROLE_KEY in Vercel).
  async deleteAccount(){const s=this.state;if(s.acctDel===2)return;if(s.acctDel!==1){this.setState({acctDel:1});clearTimeout(this._adt);this._adt=setTimeout(()=>this.setState({acctDel:0}),6000);return;}
    this.setState({acctDel:2});const token=await NYCSync.getToken();
    try{const r=await fetch(API('/api/delete-account'),{method:'POST',headers:{authorization:'Bearer '+token}});const j=await r.json().catch(()=>null);
      if(!r.ok){this.setState({acctDel:0});this.toast((j&&j.error)||'Couldn’t Delete The Account Right Now');return;}}
    catch(e){this.setState({acctDel:0});this.toast('Couldn’t Reach The Server. Check Your Connection.');return;}
    try{Object.keys(localStorage).filter(k=>k.startsWith('nycList.')).forEach(k=>localStorage.removeItem(k));}catch(e){}
    await NYCSync.signOut(true);this.setState({acctDel:0});this.toast('Your Account Was Deleted');}
  openRouteFor(id){const s=this.state;let mode=s.routeMode;if(mode==='home'&&!s.home)mode=s.here?'here':'home';
    const other=s.places.find(p=>p.id!==id);this.setState({routeFor:id,selId:null,tab:'map',routeMode:mode,routePick:0,routeSpot:s.routeSpot&&s.routeSpot!==id?s.routeSpot:(other&&other.id)});}

  // ---- Place-name suggestions while typing ----
  // Google's place search (server: /api/places, needs GOOGLE_MAPS_API_KEY in Vercel) when it's set up;
  // otherwise Photon (OpenStreetMap search built for type-ahead).
  suggest(q){clearTimeout(this._sgt);const s=this.state,v=(q||'').trim();
    if(s.form.id||v.length<3||v===s.suggPicked){if(s.sugg.length||s.suggBusy)this.setState({sugg:[],suggBusy:false});return;}
    this._sgt=setTimeout(()=>this.runSuggest(v),350);}
  async googleCall(body){if(this._gOff)return null;const token=window.NYCSync&&NYCSync.getToken?await NYCSync.getToken():null;if(!token)return null;
    if(!this._gs)this._gs=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2));
    try{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),8000);
      const r=await fetch(API('/api/places'),{method:'POST',signal:ac.signal,headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify({...body,session:this._gs})});clearTimeout(t);
      if(r.status===503||r.status===404){this._gOff=true;return null;}if(!r.ok)return null;return await r.json();}catch(e){return null;}}
  gCat(types){const t=types||[],has=id=>this.state.cats.some(c=>c.id===id)?id:null,any=re=>t.some(x=>re.test(x));
    if(any(/^(cafe|coffee_shop|tea_house|cat_cafe|dog_cafe)$/))return has('coffee');
    if(any(/^(bakery|dessert_shop|pastry_shop|confectionery|donut_shop|bagel_shop)$/))return has('bakery');
    if(any(/restaurant$|^(bar|pub|wine_bar|meal_takeaway|food_court|ice_cream_shop|diner|bistro|brunch|sandwich_shop|pizzeria)/))return has('food');
    if(any(/^(grocery_store|supermarket|food_store|market|butcher_shop|liquor_store|deli|asian_grocery_store|convenience_store)$/))return has('grocery');
    if(any(/(_store|_shop)$|^(store|shopping_mall|florist)$/))return has('shop');return null;}
  async runSuggest(q){const s=this.state,c=s.here&&inBox(s.here)?s.here:(s.home?[s.home.lat,s.home.lng]:CUR.center);this.setState({suggBusy:true});
    const g=await this.googleCall({action:'auto',q,near:c,city:CUR.id});
    if(g&&Array.isArray(g.suggestions)){if(this.state.form.name.trim()!==q)return;
      const out=g.suggestions.map(x=>({name:x.name,street:x.sub,hood:'',cat:this.gCat(x.types),gid:x.id}));
      this.setState({suggBusy:false,sugg:out,suggNone:out.length?'':q,suggGoogle:true});return;}
    let feats=null;try{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),6000);
      const r=await fetch('https://photon.komoot.io/api/?limit=10&lang=en&bbox='+[CUR.box[1],CUR.box[0],CUR.box[3],CUR.box[2]].join()+'&lat='+c[0]+'&lon='+c[1]+'&q='+encodeURIComponent(q),{signal:ac.signal});clearTimeout(t);
      if(r.ok)feats=((await r.json()).features)||[];}catch(e){}
    if(this.state.form.name.trim()!==q)return;
    if(!feats){this.setState({suggBusy:false,sugg:[],suggNone:q});return;}
    const POI=/^(amenity|shop|tourism|leisure|craft|office|club|historic)$/;
    const seen=new Set(),out=[];
    feats.filter(f=>f.properties&&f.properties.name&&f.geometry&&f.properties.osm_key!=='highway').sort((a,b)=>(POI.test(b.properties.osm_key)?1:0)-(POI.test(a.properties.osm_key)?1:0)).forEach(f=>{
      const p=f.properties,ll=[r5(f.geometry.coordinates[1]),r5(f.geometry.coordinates[0])],k=p.name+'|'+Math.round(ll[0]*1e3)+'|'+Math.round(ll[1]*1e3);
      if(seen.has(k)||out.length>=5)return;seen.add(k);
      out.push({name:p.name,ll,street:[p.housenumber,p.street].filter(Boolean).join(' '),hood:hoodAt(ll)||p.district||p.locality||p.city||'',cat:this.osmCat(p)});});
    this.setState({suggBusy:false,sugg:out,suggNone:out.length?'':q,suggGoogle:false});}
  async webFind(){const s=this.state,q=s.form.name.trim();if(s.webBusy||q.length<2)return;
    const token=window.NYCSync&&NYCSync.getToken?await NYCSync.getToken():null;
    if(!token){this.setState({webMsg:'Sign In To Search The Web.'});return;}
    clearTimeout(this._sgt);this.setState({webBusy:true,webMsg:'',sugg:[],suggNone:''});
    let j=null;try{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),65000);
      const r=await fetch(API('/api/find'),{method:'POST',signal:ac.signal,headers:{'content-type':'application/json',authorization:'Bearer '+token},
        body:JSON.stringify({q,categories:s.cats.map(c=>({id:c.id,name:c.name})),neighborhoods:areas().map(a=>a.name),city:CUR.id})});
      clearTimeout(t);j=await r.json().catch(()=>null);if(!r.ok){this.setState({webBusy:false,webMsg:(j&&j.error)||'Web Search Isn’t Available Right Now.'});return;}}
    catch(e){this.setState({webBusy:false,webMsg:'Couldn’t Reach Web Search. Check Your Connection.'});return;}
    if(this.state.form.name.trim()!==q){this.setState({webBusy:false});return;}
    const places=(j&&j.places)||[];
    if(!places.length){this.setState({webBusy:false,webMsg:(j&&j.message)||'Couldn’t Find It On The Web.',suggPicked:q});return;}
    this.setState({webBusy:false,webFor:q,sugg:places.map(p=>({name:p.name,street:p.address||'',hood:this.aiArea(p.neighborhood)||p.neighborhood||'',cat:s.cats.some(c=>c.id===p.category_id)?p.category_id:null,web:p}))});}
  osmCat(p){const k=p.osm_key,v=p.osm_value||'',has=id=>this.state.cats.some(c=>c.id===id)?id:null;
    if(v==='cafe'||(k==='shop'&&(v==='coffee'||v==='tea')))return has('coffee');
    if(v==='bakery'||v==='pastry'||v==='confectionery')return has('bakery');
    if(k==='amenity'&&/^(restaurant|fast_food|food_court|bar|pub|ice_cream|biergarten)$/.test(v))return has('food');
    if(k==='shop'&&/^(deli|cheese|greengrocer|supermarket|butcher|seafood|wine|alcohol|chocolate|spices|health_food|farm|convenience|food|frozen_food|pasta|dairy)$/.test(v))return has('grocery');
    if(k==='shop')return has('shop');return null;}
  async pickSugg(g){if(g.web){this.setState({sugg:[],suggPicked:g.name,suggNone:'',lookResults:[],lookMsg:''});
      await this.aiApply(g.web,true);const f=this.state.form;if(f.name!==g.name)return;
      this.toast(f.lat!=null?'Found It'+(f.area&&f.area!=='auto'?' In '+f.area:'')+'!':'Filled In — Drop A Pin To Place It');return;}
    if(g.gid){this.setState({sugg:[],suggPicked:g.name,suggNone:'',lookResults:[],lookMsg:'',suggBusy:true});this.setForm({name:g.name});
      const d=await this.googleCall({action:'detail',id:g.gid});this._gs=null;this.setState({suggBusy:false});
      const p=d&&d.place;if(this.state.form.name!==g.name)return;
      if(!p||p.lat==null){this.toast('Couldn’t Get Its Location — Drop A Pin');return;}
      const ll=[r5(p.lat),r5(p.lng)],area=hoodAt(ll)||this.aiArea(p.hood),f=this.state.form,cat=f.cat||this.gCat(p.types)||g.cat;
      this.setForm({name:p.name||g.name,lat:ll[0],lng:ll[1],area:area||'auto',address:p.address||f.address,cat,price:f.price||(cat&&this.priced(cat)?p.price||0:0)});
      this.setState({suggPicked:p.name||g.name});this.toast('Found It'+(area?' In '+area:'')+'!');return;}
    const f=this.state.form,area=hoodAt(g.ll);
    this.setState({sugg:[],suggPicked:g.name,lookResults:[],lookMsg:''});
    this.setForm({name:g.name,lat:g.ll[0],lng:g.ll[1],area:area||'auto',address:g.street||f.address,cat:f.cat||g.cat});
    this.toast('Found It'+(area?' In '+area:'')+'!');}

  // ---- AI fill from a TikTok / Instagram / Threads link (server: /api/extract) ----
  aiAuto(url,now){clearTimeout(this._ait);const u=(url||'').trim(),src=detect(u);
    if(this.state.form.id||!src||src==='link'||u===this.state.aiFor||this.state.aiBusy)return;
    this._ait=setTimeout(()=>{if(this.state.form.url.trim()===u)this.aiFill();},now?50:700);}
  async aiFill(){const s=this.state,f=s.form,url=f.url.trim();if(s.aiBusy)return;
    if(!url&&!f.note.trim()){this.setState({aiMsg:'Paste A Link First.'});return;}
    const token=window.NYCSync&&NYCSync.getToken?await NYCSync.getToken():null;
    if(!token){this.setState({aiMsg:'Sign In To Use AI Fill.'});return;}
    this.setState({aiBusy:true,aiMsg:'',aiPlaces:[],aiSkip:[],aiFor:url});
    let j=null;try{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),45000);
      const r=await fetch(API('/api/extract'),{method:'POST',signal:ac.signal,headers:{'content-type':'application/json',authorization:'Bearer '+token},
        body:JSON.stringify({url,notes:f.note.trim(),categories:this.state.cats.map(c=>({id:c.id,name:c.name})),neighborhoods:areas().map(a=>a.name),city:CUR.id})});
      clearTimeout(t);j=await r.json().catch(()=>null);if(!r.ok){this.setState({aiBusy:false,aiMsg:(j&&j.error)||'AI Fill Isn’t Available Right Now.'});return;}}
    catch(e){this.setState({aiBusy:false,aiMsg:'Couldn’t Reach AI Fill. Check Your Connection.'});return;}
    const places=(j&&j.places)||[];
    if(this.state.form.url.trim()!==url&&url){this.setState({aiBusy:false});return;}
    if(!places.length){this.setState({aiBusy:false,aiMsg:(j&&j.message)||'No Places Found In This Post.'});return;}
    this.setState({aiBusy:false,aiPlaces:places,aiSkip:[],aiMsg:places.length>1?'':'Filled In From '+(detect(url)==='gmaps'?'Google Maps':'The Post')+' — Check It Looks Right.'});
    await this.aiApply(places[0],places.length>1);}
  // ---- AI fill from a video saved to the phone: speech-to-text + on-screen text ----
  async aiVideo(file){if(!file||this.state.aiBusy)return;
    if(!/^video\//.test(file.type||'')&&!/\.(mp4|mov|m4v|webm|3gp)$/i.test(file.name||'')){this.setState({aiMsg:'That Isn’t A Video — Pick A Video From Your Photos.'});return;}
    if(file.size>400*1024*1024){this.setState({aiMsg:'That Video Is Too Big. Try A Shorter Clip (Under 10 Minutes).'});return;}
    const token=window.NYCSync&&NYCSync.getToken?await NYCSync.getToken():null;
    if(!token){this.setState({aiMsg:'Sign In To Use AI Fill.'});return;}
    const f=this.state.form,url=f.url.trim();
    this.setState({aiBusy:true,aiStage:'🎬 Watching The Video…',aiMsg:'',aiPlaces:[],aiSkip:[],aiFor:url});
    const frames=await NYCVideo.frames(file,3).catch(()=>[]);
    let transcript='',heardNote='';
    this.setState({aiStage:'🎧 Listening To The Video…'});
    try{const {chunks,trimmed}=await NYCVideo.audioChunks(file);
      for(let i=0;i<chunks.length;i++){
        if(chunks.length>1)this.setState({aiStage:`🎧 Listening… ${i+1} Of ${chunks.length}`});
        const r=await fetch(API('/api/transcribe?city='+CUR.id),{method:'POST',headers:{'content-type':'audio/wav',authorization:'Bearer '+token},body:chunks[i]});
        const j=await r.json().catch(()=>null);
        if(!r.ok){heardNote=(j&&j.error)||'Couldn’t Listen To The Video.';break;}
        transcript+=(transcript?' ':'')+((j&&j.text)||'');}
      if(trimmed)heardNote='Only The First 10 Minutes Were Listened To.';}
    catch(e){heardNote=e&&e.message==='silent'?'No Speech In This Video — Used What’s On Screen.':'Couldn’t Get The Sound From This Video — Used What’s On Screen.';}
    if(!transcript.trim()&&!frames.length){this.setState({aiBusy:false,aiStage:'',aiMsg:heardNote||'Couldn’t Read This Video.'});return;}
    this.setState({aiStage:'✨ Finding The Places…'});
    let j=null;try{const r=await fetch(API('/api/extract'),{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},
        body:JSON.stringify({url,notes:f.note.trim(),transcript:transcript.trim(),frames,categories:this.state.cats.map(c=>({id:c.id,name:c.name})),neighborhoods:areas().map(a=>a.name),city:CUR.id})});
      j=await r.json().catch(()=>null);if(!r.ok){this.setState({aiBusy:false,aiStage:'',aiMsg:(j&&j.error)||'AI Fill Isn’t Available Right Now.'});return;}}
    catch(e){this.setState({aiBusy:false,aiStage:'',aiMsg:'Couldn’t Reach AI Fill. Check Your Connection.'});return;}
    const places=(j&&j.places)||[];
    if(!places.length){this.setState({aiBusy:false,aiStage:'',aiMsg:'No Specific Places Found In This Video.'+(heardNote?' '+heardNote:'')});return;}
    this.setState({aiBusy:false,aiStage:'',aiPlaces:places,aiSkip:[],aiMsg:places.length>1?(heardNote||''):'Filled In From The Video — Check It Looks Right.'+(heardNote?' '+heardNote:'')});
    await this.aiApply(places[0],true);}
  aiArea(name){if(!name)return null;const n=name.toLowerCase().trim(),A=areas();return (A.find(a=>a.name.toLowerCase()===n)||A.find(a=>n.includes(a.name.toLowerCase())||a.name.toLowerCase().includes(n))||{}).name||null;}
  async aiLocate(p,areaName){if(p.lat!=null&&p.lng!=null&&inBox([+p.lat,+p.lng]))return [r5(+p.lat),r5(+p.lng)];
    const ao=areas().find(a=>a.name===areaName);
    const q=[p.name,p.address,areaName||p.neighborhood].filter(Boolean).join(', ')+', '+CUR.qc;
    let res=await this.lookup(q,1);if((!res||!res[0])&&p.address)res=await this.lookup(withCity(p.address),1);
    if(res&&res[0]){const ll=[r5(+res[0].lat),r5(+res[0].lon)];if(!ao||km(ll,ao.c)<=3)return ll;}return null;}
  async aiApply(p,multi){const s=this.state,catOk=p.category_id&&s.cats.some(c=>c.id===p.category_id),area=this.aiArea(p.neighborhood);
    this.setForm({name:p.name||s.form.name,cat:catOk?p.category_id:s.form.cat,area:area||'auto',address:p.address||'',
      note:s.form.note.trim()&&s.form.note.trim()!==(this._aiNote||'')?s.form.note:(p.note||''),price:p.price&&p.price>=1&&p.price<=4?p.price:0,lat:null,lng:null});
    this._aiNote=p.note||'';
    const ll=await this.aiLocate(p,area);
    if(this.state.form.name!==p.name)return;
    const exact=p.lat!=null&&!!ll;
    if(ll)this.setForm({lat:ll[0],lng:ll[1],area:(exact&&hoodAt(ll))||area||hoodAt(ll)||'auto'});
    if(!multi&&exact&&detect(this.state.form.url.trim())==='gmaps'){this.setState({aiMsg:'Filled In And Pinned From Google Maps — Check It Looks Right.'});return;}
    const from=detect(this.state.form.url.trim())==='gmaps'?'Google Maps':'The Post';
    if(!multi)this.setState({aiMsg:ll?'Filled In And Pinned From '+from+' — Check It Looks Right.':area?'Filled In From '+from+' — It’ll Go In '+area+'. Drop A Pin To Be Exact.':'Filled In From '+from+' — Drop A Pin Or Pick A Neighborhood.'});}
  async aiAddAll(){const s=this.state;if(s.aiAdding||!s.aiPlaces.length)return;this.setState({aiAdding:true});
    const url=s.form.url.trim(),made=[];let skipped=0;
    for(const p of s.aiPlaces.filter((_,i)=>!(s.aiSkip||[]).includes(i))){const area=this.aiArea(p.neighborhood);let ll=await this.aiLocate(p,area);
      if(!ll&&area){const ao=areas().find(a=>a.name===area);ll=[r5(ao.c[0]+(Math.random()-.5)*.004),r5(ao.c[1]+(Math.random()-.5)*.004)];}
      if(!ll){skipped++;continue;}
      const cat=p.category_id&&this.state.cats.some(c=>c.id===p.category_id)?p.category_id:(this.state.cats[0]||{}).id;
      made.push({id:'p'+Date.now()+made.length,name:p.name,cat,area:area||hoodAt(ll)||'Midtown',lat:ll[0],lng:ll[1],url,source:detect(url)||'manual',address:p.address||'',note:p.note||'',price:this.priced(cat)&&p.price?p.price:0,visited:false});}
    if(s.addTarget&&made.length){const tid=s.addTarget;this.addStopsTo(tid,made,false);this.setState({aiAdding:false,addOpen:false,addTarget:null,tab:'lists',tripId:tid,tripView:'list',tripSel:null});
      this.toast(`Added ${made.length} ${made.length===1?'Spot':'Spots'} To The List`+(skipped?` · ${skipped} Couldn’t Be Found`:''));return;}
    this.setState(st=>({aiAdding:false,addOpen:!made.length,tab:made.length?'map':st.tab,mapCats:[],selId:null,places:[...made,...st.places]}),
      ()=>setTimeout(()=>{if(this.maps&&made.length){this.maps.main.map.invalidateSize();this.fit(this.maps.main,made,{padding:[70,70],maxZoom:15});}},120));
    this.toast(made.length?`Added ${made.length} ${made.length===1?'Spot':'Spots'}`+(skipped?` · ${skipped} Couldn’t Be Found`:''):'Couldn’t Find These On The Map — Add Them One By One');}

  renderVals(){const s=this.state,f=s.form,cat=Object.fromEntries(s.cats.map(c=>[c.id,c])),l=this.lists(),A=areas();
    const catOf=id=>cat[id]||{name:'Uncategorized',color:'#888'};const vis=s.places.filter(p=>p.visited).length;
    const chip=(on,label,onClick,col)=>({label,onClick,bg:on?(col||C.navy):'#fff',fg:on?'#fff':C.navy,border:on?(col||C.navy):'rgba(16,24,63,.14)'});
    const mapChips=[{label:'All',emoji:'🗽',count:s.places.length,dot:s.mapCats.length?C.navy:C.yellow,bg:s.mapCats.length?'#fff':C.navy,fg:s.mapCats.length?C.navy:'#fff',border:s.mapCats.length?'#fff':C.navy,onClick:()=>this.setState({mapCats:[]})},
      ...s.cats.map(c=>{const on=s.mapCats.includes(c.id);return {label:c.name,emoji:emo(c),count:s.places.filter(p=>p.cat===c.id).length,dot:on?fgFor(c.color):c.color,bg:on?c.color:'#fff',fg:on?fgFor(c.color):C.navy,border:on?c.color:'#fff',onClick:()=>this.toggle('mapCats',c.id)};})];
    const exTiles=s.cats.map(c=>{const on=s.exCats.includes(c.id),n=s.places.filter(p=>p.cat===c.id).length;
      return {on,n,col:c.color,name:c.name,emoji:emo(c),countLabel:n+(n===1?' Spot Saved':' Spots Saved'),check:on?'✓':'',bg:on?c.color:'#fff',fg:on?fgFor(c.color):C.navy,border:on?c.color:'rgba(16,24,63,.1)',dot:on?fgFor(c.color):c.color,onClick:()=>this.toggle('exCats',c.id)};});
    const exBoroughs=CUR.regions.map(b=>({name:b,areas:A.filter(a=>a.b===b&&s.places.some(p=>p.area===a.name)).map(a=>{const on=s.exAreas.includes(a.name);
      const n=s.places.filter(p=>p.area===a.name&&(!s.exCats.length||s.exCats.includes(p.cat))).length;
      return {on,name:a.name,count:n,bg:on?C.blue:'#fff',fg:on?'#fff':C.navy,border:on?C.blue:'rgba(16,24,63,.12)',op:(n||on)?1:.45,onClick:()=>this.toggle('exAreas',a.name)};})})).filter(b=>b.areas.length);
    const n=l.ex.length,catNames=s.exCats.map(id=>cat[id]?.name).filter(Boolean);
    const exTitle=(!catNames.length?'Every Kind Of Place':catNames.length>2?catNames.length+' Categories':catNames.join(' + '))+(s.exPrices.length?' · '+[...s.exPrices].sort().map(i=>PRICES[i-1]).join('/'):'');
    const areaTxt=!s.exAreas.length?'Anywhere In '+CUR.short:s.exAreas.length>2?s.exAreas.length+' Areas':s.exAreas.join(' & ');
    const inPlan=id=>s.plan.ids.includes(id);
    const resultCards=l.ex.map(p=>{const c=catOf(p.cat),src=SRC[p.source]||SRC.manual,ip=inPlan(p.id);
      return {name:p.name,catName:c.name,catBg:c.color,catFg:fgFor(c.color),initial:p.name.replace(/^the\s+/i,'')[0],img:placeImg(p),area:p.area,note:p.note,hasNote:!!p.note,visited:p.visited,
        srcLabel:p.source==='manual'?src.label:'From '+src.label,srcBg:src.bg,ring:p.id===s.selId?C.navy:'transparent',onClick:()=>this.setState({selId:p.id,confirmDel:false}),
        hasPrice:!!p.price,price:PRICES[(p.price||1)-1],planLabel:ip?'In Plan ✓':'+ Plan',planBg:ip?C.navy:'#fff',planFg:ip?C.yellow:C.navy,onPlan:e=>{e.stopPropagation();this.togglePlan(p.id);}};});
    // Explore deck (hybrid Command Center + Spot Deck)
    const deck=this.deckList(),dpos=this.deckPos(),dref=s.here||(s.home?[s.home.lat,s.home.lng]:null);
    const tripMin=p=>{if(!dref||km(dref,[p.lat,p.lng])>60)return null;const e=estimate(dref,[p.lat,p.lng]);return e.subway?e.subway.min:e.walk.min;};
    const deckCards=deck.slice(dpos,dpos+3).map((p,i)=>{const c=catOf(p.cat),w=p.name.trim().split(/\s+/),m=i===0?tripMin(p):null;
      return {id:p.id,bold:w[0],light:w.slice(1).join(' '),img:placeImg(p),col:c.color,fg:fgFor(c.color),emoji:emo(c),visited:p.visited,inPlan:inPlan(p.id),
        idx:String(dpos+i+1).padStart(2,'0'),meta:[p.area,p.price&&this.priced(p.cat)?PRICES[p.price-1]:'',m!=null?Math.max(1,Math.round(m))+' MIN '+(s.here?'AWAY':'FROM HOME'):c.name].filter(Boolean).join(' · ').toUpperCase(),
        onDown:e=>this.deckDown(e),onMove:e=>this.deckMove(e),onUp:()=>this.deckUp(p.id),onCancel:()=>{this._dg=null;this.setState({deckDx:0});}};});
    const catCount={};l.ex.forEach(p=>{catCount[p.cat]=(catCount[p.cat]||0)+1;});
    const exBar=Object.entries(catCount).map(([id,k])=>({col:catOf(id).color,n:k}));
    const exFilterN=s.exAreas.length+s.exPrices.length+(s.hideVisited?1:0);
    const sp=s.places.find(p=>p.id===s.selId);let sel={};
    if(sp){const c=catOf(sp.cat),src=SRC[sp.source]||SRC.manual,hasUrl=!!sp.url,ns=nearSt([sp.lat,sp.lng],1,2,true)[0],ip=inPlan(sp.id);
      sel={name:sp.name,catName:c.name,catBg:c.color,catFg:fgFor(c.color),area:sp.area,note:sp.note,hasNote:!!sp.note,hasUrl,srcBg:src.bg,openLabel:'Open '+src.label,
        hasStation:!!ns,stName:ns?ns.s.n:'',stRoutes:ns?ns.s.r.slice(0,6).map(bullet):[],stWalk:ns?fmtMin(walkMin([sp.lat,sp.lng],ns.s.c))+' Walk':'',
        cols:hasUrl?'1fr 1fr 1fr':'1fr 1fr',visBg:sp.visited?C.green:'#fff',visFg:sp.visited?'#fff':C.green,visLabel:sp.visited?'Been Here ✓':'Mark Visited',
        planBg:ip?C.blue:'#fff',planFg:ip?'#fff':C.blue,planLabel:ip?'In Plan ✓':'+ Plan',hasPrice:!!sp.price,price:PRICES[(sp.price||1)-1],
        srcBadge:hasUrl?'Saved From '+src.label:'',catEmoji:emo(c),catColor:c.color,img:placeImg(sp),ownPhoto:!!sp.photo,photoBusy:s.spotPhotoBusy,
        onPhoto:e=>{const f=e.target.files&&e.target.files[0];e.target.value='';this.pickSpotPhoto(sp.id,f);},removePhoto:()=>this.removeSpotPhoto(sp.id)};
      if(s.home&&km([s.home.lat,s.home.lng],[sp.lat,sp.lng])<60){const e=estimate([s.home.lat,s.home.lng],[sp.lat,sp.lng]),sub=e.subway;
        const xf=sub?sub.legs.filter(x=>x.k==='xfer').length:0;
        sel.homeMin=Math.max(1,Math.round(sub?sub.min:e.walk.min));sel.homeHow=sub?(xf?xf+(xf>1?' Transfers':' Transfer'):'No Transfers'):'Walk';}}
    // route
    const rd=this.routeData();let routeOpts=[],routeMsg='',routeNeedsHome=false;
    if(rd){if(!rd.a){if(s.routeMode==='home'){routeMsg='Save Your Home Once And Every Route Can Start There.';routeNeedsHome=true;}
        else if(s.routeMode==='here')routeMsg=s.locating?'Finding You…':s.hereFailed?'Location Isn\u2019t Coming Through — Tap Where I Am On The Map, Or Start From Home.':'Tap My Location To Share Where You Are.';
        else routeMsg='Pick A Saved Spot To Start From.';}
      else if(rd.far)routeMsg='That Start Point Is Outside '+CUR.short+' — Try Home Or A Saved Spot.';
      else{const aStr=rd.a.join(','),bStr=placeQ(rd.d),pick=Math.min(s.routePick,rd.opts.length-1);
        routeOpts=rd.opts.map((o,i)=>{const on=i===pick;
          const steps=o.mode==='walk'?[{text:'Walk '+mi(o.km)+' To '+rd.d.name,min:fmtMin(o.min),walkDisp:'block',xferDisp:'none',bullets:[]}]:
            o.legs.map(lg=>lg.k==='walk'?{text:lg.to?'Walk To '+lg.to.n:'Walk To '+rd.d.name,min:fmtMin(lg.min),walkDisp:'block',xferDisp:'none',bullets:[]}:
              lg.k==='xfer'?{text:'Transfer At '+lg.at.n,min:fmtMin(lg.min),walkDisp:'none',xferDisp:'block',bullets:[]}:
              {text:'Ride To '+lg.to.n,min:fmtMin(lg.min),walkDisp:'none',xferDisp:'none',bullets:lg.r.slice(0,4).map(bullet)});
          return {title:o.mode==='walk'?'Walk':CUR.id==='nyc'?'Subway':'Transit',mins:'~'+fmtMin(o.min),color:o.mode==='walk'?C.navy:C.blue,best:i===0&&rd.opts.length>1,border:on?C.navy:'transparent',steps,
            onPick:()=>this.setState({routePick:i}),gLabel:o.mode==='walk'?'Walking Route In Google Maps ↗':'Exact Transit Times In Google Maps ↗',
            onGoogle:e=>{e.stopPropagation();window.open(gmaps(aStr,bStr,o.mode==='walk'?'walking':'transit'),'_blank');}};});}}
    const originChips=[chip(s.routeMode==='here',s.locating?'Finding You…':'My Location',()=>{this.setState({routeMode:'here',routePick:0});if(!s.here)this.locate();}),
      chip(s.routeMode==='home',s.home?'Home':'Home (Set It)',()=>this.setState({routeMode:'home',routePick:0})),
      chip(s.routeMode==='spot','A Saved Spot',()=>this.setState({routeMode:'spot',routePick:0}))];
    // plan
    const stops=this.planStops(),pStart=this.planStartPt();let total=0,walkTot=0,subTot=0;
    const planRows=stops.map((p,i)=>{const c=catOf(p.cat),from=i===0?pStart:[stops[i-1].lat,stops[i-1].lng];let hasLeg=false,legText='',legBullets=[],legOpen=null,legMin=0,legWalk=false;
      if(from&&km(from,[p.lat,p.lng])<60){hasLeg=true;const e=estimate(from,[p.lat,p.lng]);
        if(e.subway){legMin=e.subway.min;total+=e.subway.min;subTot+=e.subway.min;legText='Subway · ~'+fmtMin(e.subway.min);legBullets=[...new Set(e.subway.legs.filter(x=>x.k==='ride').flatMap(x=>x.r.slice(0,2)))].slice(0,4).map(bullet);}
        else{legMin=e.walk.min;legWalk=true;total+=e.walk.min;walkTot+=e.walk.min;legText='Walk · ~'+fmtMin(e.walk.min)+' · '+mi(e.walk.km);}
        legOpen=()=>window.open(gmaps(from.join(','),placeQ(p),e.subway?'transit':'walking'),'_blank');}
      return {id:p.id,catEmoji:emo(c),legMin,legWalk,num:i+1,img:placeImg(p),name:p.name,catName:c.name,catBg:c.color,catFg:fgFor(c.color),area:p.area,hasLeg,legText,legBullets,legOpen,
        onClick:()=>{this.setState({tab:'map',selId:p.id});setTimeout(()=>this.maps&&this.maps.main.map.flyTo([p.lat,p.lng],15.5,{duration:.6}),120);},
        up:e=>{e.stopPropagation();this.move(i,-1);},down:e=>{e.stopPropagation();this.move(i,1);},remove:e=>{e.stopPropagation();this.togglePlan(p.id);},
        upOp:i===0?.3:1,downOp:i===stops.length-1?.3:1};});
    // Timeline clock: leave at plan.leave, stay plan.stay[id] minutes (45 by default) at each stop.
    const STAYS=[15,30,45,60,90,120,180],toMin=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?+m[1]*60+ +m[2]:600;};
    const clock=m=>{m=Math.round(m)%1440;const h=Math.floor(m/60),mm=m%60;return (h%12||12)+':'+String(mm).padStart(2,'0')+(h<12?' AM':' PM');};
    let tNow=toMin(s.plan.leave||'10:00');const leaveClock=clock(tNow);
    planRows.forEach(r=>{tNow+=r.hasLeg?r.legMin:0;r.time=clock(tNow);const st=(s.plan.stay||{})[r.id]||45;r.stay=st;r.stayLbl=st<60?st+' MIN':(st/60)+(st===60?' HR':' HRS');
      r.cycleStay=e=>{e.stopPropagation();const nx=STAYS[(STAYS.indexOf(st)+1)%STAYS.length];this.setState(x=>({plan:{...x.plan,stay:{...(x.plan.stay||{}),[r.id]:nx}}}));};tNow+=st;});
    let backMin=0,backBul=[],backWalk=false;
    if(s.plan.start==='home'&&s.home&&stops.length){const last=stops[stops.length-1],a=[last.lat,last.lng],h=[s.home.lat,s.home.lng];
      if(km(a,h)<60){const e=estimate(a,h);backMin=e.subway?e.subway.min:e.walk.min;backWalk=!e.subway;backBul=e.subway?[...new Set(e.subway.legs.filter(x=>x.k==='ride').flatMap(x=>x.r.slice(0,2)))].slice(0,4).map(bullet):[];}}
    const endClock=clock(tNow+backMin);
    const ps=s.plan.start;const planStartMsg=(ps==='home'&&!s.home)||(ps==='here'&&!s.here);
    const placingTitle=s.placing==='home'?'Tap Where You Live':s.placing==='here'?'Tap Where You Are Now':'Tap To Drop Your Pin';
    let locTitle='',locSub='';if(s.here&&s.tab==='map'&&!s.placing&&!s.routeFor&&!s.selId){const hd=hoodAt(s.here);let nb=null;s.places.forEach(p=>{const d=km(s.here,[p.lat,p.lng]);if(!nb||d<nb.d)nb={p,d};});
      locTitle=(s.hereManual?'You Set Your Spot':'You\u2019re Here')+(hd?' · '+hd:'')+(s.hereAcc>60?' · ±'+Math.round(s.hereAcc*3.28)+' Ft':'');
      locSub=nb?(nb.d<60?'Closest Saved: '+nb.p.name+' · '+fmtMin(walkMin(s.here,[nb.p.lat,nb.p.lng]))+' Walk':'Your Saved Spots Are Back In NYC'):'';}
    const fsrc=detect(f.url.trim()),hasPin=f.lat!=null,tabC=t=>s.tab===t?C.blue:'#3A4470',tabD=t=>s.tab===t?C.yellow:'transparent';
    return {
      mapDisplay:s.tab==='map'?'block':'none',exDisplay:s.tab==='explore'?'block':'none',planDisplay:s.tab==='plan'?'block':'none',
      exPickDisplay:s.exStage==='pick'?'block':'none',exResDisplay:s.exStage==='results'?'flex':'none',exListDisplay:s.exView==='list'?'flex':'none',exMapVis:s.exView==='map'?'visible':'hidden',
      mainMapRef:this.mainMapRef,exMapRef:this.exMapRef,planMapRef:this.planMapRef,
      statsText:`${s.places.length} ${s.places.length===1?'Spot':'Spots'} · ${vis} Visited`,mapChips,exTiles,exBoroughs,
      subBtnBg:s.showSubway?C.navy:'#fff',subBtnFg:s.showSubway?'#fff':C.navy,toggleSubway:()=>this.setState({showSubway:!s.showSubway}),
      layersOpen:s.layersOpen,layersOn:s.showSubway||(s.showBus&&CUR.layers.includes('bus'))||(s.showBike&&!!CUR.bike)||(s.showTram&&!!CUR.tram)||(s.showFerry&&!!CUR.ferry),toggleLayers:()=>this.setState({layersOpen:!s.layersOpen}),closeLayers:()=>this.setState({layersOpen:false}),
      cityShort:CUR.short,cityName:CUR.name,cityEmoji:CUR.emoji,isNyc:CUR.id==='nyc',cityOpen:s.cityOpen,openCity:()=>this.setState({cityOpen:true,layersOpen:false}),closeCity:()=>this.setState({cityOpen:false}),
      cityRows:CITY_ORDER.map(k=>{const c=CITIES[k],n=k===CUR.id?s.places.length:(s.otherPlaces||[]).filter(p=>cityOf(p)===k).length;
        return {id:k,name:c.name,short:c.short,emoji:c.emoji,transit:c.transit,count:n,on:k===CUR.id,onClick:()=>this.setCity(k)};}),
      layerRows:(()=>{const lr=(key,label,sub,on,stv,col,onClick)=>({key,label,sub:on&&stv==='loading'?'Loading…':on&&stv==='error'?'Not Available Right Now':sub,on,col,onClick});
        const rows=[{key:'sub',label:CUR.id==='nyc'?'Subway':CUR.transit,sub:CUR.layerSub,on:s.showSubway,col:CUR.id==='nyc'?'#EE352E':CUR.id==='sg'?'#D42E12':CUR.id==='hk'?'#ED1D24':'#DA251D',onClick:()=>this.setState({showSubway:!s.showSubway})}];
        CUR.layers.forEach(k=>{
          if(k==='bus')rows.push(lr('bus','Bus Routes',CUR.busSub,s.showBus,s.busState,'#006CB7',()=>this.setState({showBus:!s.showBus,busState:s.busState==='error'?'':s.busState})));
          if(k==='tram')rows.push(lr('tram',CUR.tram.label,CUR.tram.sub,s.showTram,s.tramState,CUR.tram.col,()=>this.setState({showTram:!s.showTram,tramState:s.tramState==='error'?'':s.tramState})));
          if(k==='ferry')rows.push(lr('ferry',CUR.ferry.label,CUR.ferry.sub,s.showFerry,s.ferryState,CUR.ferry.col,()=>this.setState({showFerry:!s.showFerry,ferryState:s.ferryState==='error'?'':s.ferryState})));
          if(k==='bike')rows.push(lr('bike',CUR.bike.name,'Docks With Live Bike Counts',s.showBike,s.bikeState,'#0A6FD6',()=>this.setState({showBike:!s.showBike,bikeState:s.bikeState==='error'?'':s.bikeState})));});
        return rows;})(),
      layersNote:{nyc:'Bus routes: MTA via data.ny.gov · Citi Bike live data',sg:'Routes & stations: OpenStreetMap contributors',hk:'Routes & stations: OpenStreetMap contributors',to:'Routes: OpenStreetMap · Bike Share Toronto live data'}[CUR.id],
      avatarSrc:s.auth==='signedIn'&&s.avatarV&&window.NYCSync&&NYCSync.currentUser()?NYCSync.avatarUrl(NYCSync.currentUser().id,s.avatarV):null,
      avatarInitial:((window.NYCSync&&NYCSync.displayName())||s.syncEmail||'?').trim().charAt(0).toUpperCase()||'?',
      avatarBusy:s.avatarBusy,avatarMsg:s.avatarMsg,hasAvatar:!!s.avatarV,
      onAvatarFile:e=>{const f=e.target.files&&e.target.files[0];e.target.value='';this.pickAvatar(f);},removeAvatar:()=>this.removeAvatar(),
      locateMe:()=>{this.setState({tab:'map',selId:null,routeFor:null});if(s.here&&!s.locating&&this.maps&&!s.locFail){this.maps.main.map.flyTo(s.here,16,{duration:.6});}this.locate(ll=>this.maps&&this.maps.main.map.flyTo(ll,16,{duration:.7}));},
      locBg:s.locating?C.yellow:s.here?C.blue:'#fff',locFg:s.here&&!s.locating?'#fff':C.navy,
      locLine:!!locTitle,locTitle,locSub,locFailOpen:!!s.locFail&&s.tab==='map'&&!s.placing,locFailMsg:s.locFail||'',closeLocFail:()=>this.setState({locFail:null}),
      setHereOnMap:()=>{this.setState({locFail:null});this.startPlacing('here');},
      placing:!!s.placing,placingTitle,cancelPlacing:()=>{const ret=s.placingReturn;this.setState({placing:false,...(s.placing==='spot'?{addOpen:true}:{}),...(ret==='plan'?{tab:'plan'}:{}),...(ret&&ret.startsWith('route:')?{routeFor:ret.slice(6)}:{})});},
      clearCats:()=>this.setState({exCats:[]}),clearAreas:()=>this.setState({exAreas:[]}),clearCatsLabel:s.exCats.length?'Clear':'',clearAreasLabel:s.exAreas.length?'Clear':'',
      hvTrack:s.hideVisited?C.green:'#CFCBDA',hvKnob:s.hideVisited?'20px':'0px',toggleHideVisited:()=>this.setState({hideVisited:!s.hideVisited}),
      showBtnLabel:n?`Show ${n} ${n===1?'Place':'Places'} →`:'No Matches Yet',showBtnBg:n?C.orange:'#A9ADC2',
      showResults:()=>n&&this.setState({exStage:'results',selId:null}),backToPick:()=>this.setState({exStage:'pick',selId:null}),
      addAllToPlan:()=>{this.setState(st=>({plan:{...st.plan,ids:[...st.plan.ids,...l.ex.map(p=>p.id).filter(id=>!st.plan.ids.includes(id))]}}));this.toast(n+' Spots In Your Plan');},
      exTitle,exSub:`${areaTxt} · ${n} ${n===1?'Place':'Places'}`,
      exView:s.exView,exCount:n,exSaved:s.places.length,exHoods:new Set(l.ex.map(p=>p.area)).size,exBar,exFilterN,exFiltersOpen:s.exFilters,hideVisited:s.hideVisited,
      exPriceLbl:s.exPrices.length?[...s.exPrices].sort().map(i=>PRICES[i-1]).join(' · '):'ANY $',
      exQuery:s.exQuery,onExQuery:e=>this.setState({exQuery:e.target.value}),clearExQuery:()=>this.setState({exQuery:''}),
      toggleExFilters:()=>this.setState({exFilters:!s.exFilters}),closeExFilters:()=>this.setState({exFilters:false}),
      clearExAll:()=>this.setState({exCats:[],exAreas:[],exPrices:[],hideVisited:false,exQuery:''}),
      deckCards,deckDx:s.deckDx,deckFly:s.deckFly,deckDone:!!n&&dpos>=n,deckEmpty:!n,deckTotal:String(n).padStart(2,'0'),
      deckSkip:()=>this.deckAct('skip'),deckPlan:()=>this.deckAct('plan'),deckShuffle:()=>this.setState({deckSeed:s.deckSeed+1,deckDx:0,deckFly:''}),
      listTabBg:s.exView==='list'?'#FFFFFF':'transparent',listTabFg:s.exView==='list'?C.blue:'#fff',mapTabBg:s.exView==='map'?'#FFFFFF':'transparent',mapTabFg:s.exView==='map'?C.blue:'#fff',
      viewList:()=>this.setState({exView:'list'}),viewMap:()=>this.setState({exView:'map'}),resultCards,noResults:!n,
      hasSel:!!sp&&!s.placing&&!s.routeFor,sel,spotCount:s.places.length,visitedCount:s.places.filter(p=>p.visited).length,
      // Nearest saved spot to where you are (only once your location is known), for the card at the bottom of the map.
      nearest:(()=>{if(!s.here||s.tab!=='map'||s.placing||s.routeFor||s.selId)return null;let best=null,bd=1e9;s.places.forEach(p=>{if(p.visited)return;const d=km(s.here,[p.lat,p.lng]);if(d<bd){bd=d;best=p;}});if(!best||bd>8)return null;
        const c=catOf(best.cat),walk=Math.max(1,Math.round(bd*1.25/4.8*60));return {name:best.name,img:placeImg(best),catName:c.name,col:c.color,fg:fgFor(c.color),em:emo(c),big:walk>99?Math.round(walk/60):walk,unit:walk>99?'hr':'min',
          onClick:()=>{this.setState({selId:best.id});setTimeout(()=>this.maps&&this.maps.main.map.flyTo([best.lat,best.lng],15.5,{duration:.6}),60);}};})(),onMapTab:s.tab==='map',delLabel:s.confirmDel?'Tap Again To Delete':'Delete',closeSel:()=>this.setState({selId:null,confirmDel:false}),
      openSource:()=>sp&&window.open(sp.url,'_blank'),openRoute:()=>sp&&this.openRouteFor(sp.id),togglePlanSel:()=>sp&&this.togglePlan(sp.id),
      toggleVisited:()=>{if(!sp)return;this.setState(st=>({places:st.places.map(p=>p.id===sp.id?{...p,visited:!p.visited}:p)}));if(!sp.visited)this.toast('Nice! Marked As Visited');},
      editSel:()=>sp&&this.setState({addOpen:true,addMode:'name',form:{...blank(),id:sp.id,price:sp.price||0,url:sp.url||'',name:sp.name,cat:sp.cat,area:sp.area,address:sp.address||'',note:sp.note||'',lat:sp.lat,lng:sp.lng}}),
      deleteSel:()=>{if(!sp)return;if(!s.confirmDel)return this.setState({confirmDel:true});this.setState(st=>({places:st.places.filter(p=>p.id!==sp.id),plan:{...st.plan,ids:st.plan.ids.filter(x=>x!==sp.id)},selId:null,confirmDel:false}));this.toast('Spot Deleted');},
      routeOpen:!!rd&&!s.placing,routeDest:rd?rd.d.name:'',closeRoute:()=>{const id=s.routeFor;this.setState({routeFor:null,selId:id});},
      originChips,originIsSpot:s.routeMode==='spot',routeSpotVal:s.routeSpot||'',onRouteSpot:e=>this.setState({routeSpot:e.target.value,routePick:0}),
      spotOptions:s.places.filter(p=>p.id!==s.routeFor).map(p=>({id:p.id,name:p.name+' · '+p.area})),
      routeHasMsg:!!routeMsg,routeMsg,routeNeedsHome,routeNeedsHere:!!rd&&!rd.a&&s.routeMode==='here'&&s.hereFailed,setHereRoute:()=>this.startPlacing('here','route:'+s.routeFor),setHome:()=>this.startPlacing('home','route:'+s.routeFor),routeOpts,
      planSummary:stops.length?`${stops.length} ${stops.length===1?'Stop':'Stops'} · ~${fmtMin(total)} Of Travel`:'Line Up A Few Spots For One Great Day.',
      planStartChips:[chip(ps==='first','First Stop',()=>this.setState(st=>({plan:{...st.plan,start:'first'}}))),
        chip(ps==='home',s.home?'Home':'Home (Set It)',()=>{this.setState(st=>({plan:{...st.plan,start:'home'}}));if(!s.home)this.startPlacing('home','plan');}),
        chip(ps==='here','My Location',()=>{this.setState(st=>({plan:{...st.plan,start:'here'}}));if(!s.here)this.locate();})],
      planStartMsg,planStartMsgText:ps==='home'?'Set Your Home To Start There.':'Waiting For Your Location…',
      autoOrder:()=>this.autoOrder(),openPicker:()=>this.setState({pickerOpen:true}),closePicker:()=>this.setState({pickerOpen:false}),
      planEmpty:!stops.length,planHas:!!stops.length,planRows,planStopsN:stops.length,
      planSheetFull:s.planSheet==='full',togglePlanSheet:()=>this.setPlanSheet(s.planSheet==='full'?'half':'full'),
      planSheetDown:e=>{this._ps={y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}},
      planSheetUp:e=>{const g=this._ps;this._ps=null;if(!g)return;const dy=e.clientY-g.y;if(dy<-30)this.setPlanSheet('full');else if(dy>30)this.setPlanSheet('half');else this.setPlanSheet(s.planSheet==='full'?'half':'full');},
      planLeave:s.plan.leave||'10:00',onPlanLeave:e=>{const v=e.target.value;if(v)this.setState(x=>({plan:{...x.plan,leave:v}}));},leaveClock,endClock,
      planStartLabel:ps==='home'?(s.home?'Leave Home':'Home (Set It)'):ps==='here'?'Leave From Here':'Start At The First Stop',planFromFirst:ps==='first',
      planEndLabel:backMin?'Back Home':'Done For The Day',planBack:backMin?{min:fmtShort(backMin),walk:backWalk,bullets:backBul}:null,
      planHr:Math.floor(Math.round(total)/60),planMin:Math.round(total)%60,planRide:Math.round(subTot),planWalkMin:Math.round(walkTot),
      startRoute:()=>{const pts=[...(pStart?[pStart.join(',')]:[]),...stops.map(placeQ)];if(pts.length>1)window.open('https://www.google.com/maps/dir/'+pts.map(encodeURIComponent).join('/'),'_blank');},
      planBig:total?(total<60?String(Math.round(total)):Math.floor(total/60)+':'+String(Math.round(total%60)).padStart(2,'0')):'0',planBigUnit:total<60?'min':'hr',
      planWalk:walkTot?fmtShort(walkTot):'—',planSub:subTot?fmtShort(subTot):'—',clearPlan:()=>this.setState(st=>({plan:{...st.plan,ids:[]}})),planCount:s.plan.ids.length,
      pickerOpen:s.pickerOpen,pickerRows:s.places.map(p=>{const c=catOf(p.cat),ip=inPlan(p.id);return {name:p.name,catName:c.name,catBg:c.color,emoji:emo(c),area:p.area,chk:ip?'✓':'',chkBg:ip?C.orange:'#fff',ring:ip?C.orange:'transparent',
        onClick:()=>this.setState(st=>({plan:{...st.plan,ids:ip?st.plan.ids.filter(x=>x!==p.id):[...st.plan.ids,p.id]}}))};}),
      goMap:()=>this.setState({tab:'map',selId:null,placing:false,routeFor:null,tripSel:null}),goExplore:()=>this.setState({tab:'explore',selId:null,placing:false,routeFor:null,tripSel:null}),goPlan:()=>this.setState({tab:'plan',selId:null,placing:false,routeFor:null,tripSel:null}),
      tabMapFg:tabC('map'),tabMapDot:tabD('map'),tabExFg:tabC('explore'),tabExDot:tabD('explore'),tabPlanFg:tabC('plan'),tabPlanDot:tabD('plan'),
      openAdd:()=>this.setState({addOpen:true,addTarget:null,tripSel:null,placing:false,form:blank(),selId:null,routeFor:null,lookQ:'',lookResults:[],lookMsg:'',aiMsg:'',aiPlaces:[],aiSkip:[],addMode:'link',aiFor:'',sugg:[],suggBusy:false,suggPicked:'',suggNone:'',webBusy:false,webMsg:'',webFor:''}),closeAdd:()=>this.setState({addOpen:false,sugg:[],...(s.addTarget?{addTarget:null,tab:'lists'}:{})}),
      hasSugg:!!s.sugg.length&&!f.id,suggRows:s.sugg.map(g=>{const c=s.cats.find(x=>x.id===g.cat);return {name:g.name,sub:[g.street,g.hood].filter(Boolean).join(' · ')||'NYC',emoji:c?emo(c):'📍',bg:c?c.color:'#E9E4DA',onPick:()=>this.pickSugg(g)};}),
      suggBusy:s.suggBusy&&!s.sugg.length&&!f.id,closeSugg:()=>this.setState({sugg:[],suggPicked:f.name.trim()}),
      suggWeb:!!s.sugg.length&&s.sugg[0].web,suggGoogle:!!s.sugg.length&&!!s.sugg[0].gid,suggTitle:s.sugg.length&&s.sugg[0].web?'Found On The Web':'Is It One Of These?',
      webShow:!f.id&&!s.webBusy&&f.name.trim().length>=3&&(!!s.sugg.length&&!s.sugg[0].web||s.suggNone===f.name.trim()),
      webLabel:s.sugg.length?'✨ Not Here? Search The Web':'✨ Not Found? Search The Web',webFind:()=>this.webFind(),
      webBusy:s.webBusy,webHasMsg:!!s.webMsg&&!s.webBusy,webMsg:s.webMsg,
      aiShow:!f.id&&!!f.url.trim(),aiVidShow:!f.id,onVideo:e=>{const fl=e.target.files&&e.target.files[0];e.target.value='';this.aiVideo(fl);},aiBtn:s.aiBusy?(s.aiStage||'✨ Reading The Post…'):s.aiFor&&s.aiFor===f.url.trim()?'✨ Read It Again':'✨ Fill From Link',aiBusy:s.aiBusy,
      aiRun:()=>this.aiFill(),aiHasMsg:!!s.aiMsg&&!s.aiBusy,aiMsg:s.aiMsg,aiMulti:s.aiPlaces.length>1&&!s.aiBusy,aiCount:s.aiPlaces.length,
      aiPickCount:s.aiPlaces.length-(s.aiSkip||[]).length,aiAddAllLabel:s.aiAdding?'Adding…':`Add ${s.aiPlaces.length-(s.aiSkip||[]).length} To ${s.addTarget?'The List':'My Map'}`,aiAddAll:()=>this.aiAddAll(),
      aiRows:s.aiPlaces.map((p,i)=>{const c=cat[p.category_id];return {name:p.name,emoji:c?emo(c):'📍',bg:c?c.color:'#A9ADC2',sub:[c&&c.name,p.neighborhood].filter(Boolean).join(' · ')||'NYC',on:p.name===f.name,onPick:()=>this.aiApply(p),checked:!(s.aiSkip||[]).includes(i),onCheck:e=>{e.stopPropagation();const k=s.aiSkip||[];this.setState({aiSkip:k.includes(i)?k.filter(x=>x!==i):[...k,i]});}};}),
      aiConfHigh:s.aiPlaces.length>0&&s.aiPlaces.every(p=>p.confidence==='high'),
      addMode:f.id?'name':(s.addMode||'link'),setAddMode:m=>this.setState({addMode:m}),aiReads:({tiktok:'CAPTION · COVER · SPOKEN WORDS',instagram:'CAPTION · COVER IMAGE',threads:'POST TEXT · IMAGE',gmaps:'NAME · ADDRESS · PIN',link:'PAGE TITLE · DESCRIPTION'})[fsrc]||'AUDIO · ON-SCREEN TEXT',srcShort:fsrc?(fsrc==='link'?'WEBSITE':fsrc==='gmaps'?'MAPS':SRC[fsrc].label.toUpperCase()):'',formId:f.id||null,
      addY:s.addOpen?'0%':'105%',formTitle:f.id?'Edit Spot':s.addTarget?'Add To The List':'Add A Spot',formFor:s.addTarget?((s.trips.find(t=>t.id===s.addTarget)||{}).name||''):'',form:f,
      hasPin,noPin:!hasPin,pinLine:hasPin?(f.area!=='auto'?f.area:(hoodAt([f.lat,f.lng])||'On The Map')):'',startPlacing:()=>this.startPlacing('spot'),
      onUrl:e=>{const v=e.target.value;this.setForm({url:v});this.aiAuto(v);},onName:e=>{const v=e.target.value;this.setForm({name:v});if(s.webMsg)this.setState({webMsg:''});this.suggest(v);},onArea:e=>this.setForm({area:e.target.value}),
      onAddress:e=>this.setForm({address:e.target.value}),onNote:e=>this.setForm({note:e.target.value}),
      pasteUrl:()=>navigator.clipboard?.readText().then(t=>{this.setForm({url:t.trim()});this.aiAuto(t.trim(),true);}).catch(()=>this.toast('Long-Press The Field To Paste')),
      hasSrcBadge:!!fsrc,srcBadge:fsrc?(fsrc==='link'?'Website Link':SRC[fsrc].label+' Link Detected'):'',srcBadgeBg:fsrc?SRC[fsrc].bg:C.navy,
      formCats:s.cats.map(c=>{const on=f.cat===c.id;return {name:c.name,emoji:emo(c),bg:on?c.color:'#fff',fg:on?fgFor(c.color):C.navy,border:on?c.color:'rgba(16,24,63,.12)',dot:on?fgFor(c.color):c.color,onClick:()=>this.setForm({cat:c.id})};}),
      toggleNewCat:()=>this.setForm({newCatOpen:!f.newCatOpen}),onNewCatName:e=>this.setForm({newCatName:e.target.value}),
      swatches:SWATCHES.map(w=>({color:w,ring:f.newCatColor===w?C.navy:'#fff',onClick:()=>this.setForm({newCatColor:w})})),
      emojiChoices:EMOJIS.map(e=>({e,bg:f.newCatEmoji===e?'#FFF3DF':'#fff',ring:f.newCatEmoji===e?C.navy:'rgba(16,24,63,.12)',onClick:()=>this.setForm({newCatEmoji:e})})),
      addCat:()=>{const nm=toTitle(f.newCatName.trim());if(!nm)return;const id='c'+Date.now();this.setState(st=>({cats:[...st.cats,{id,name:nm,color:st.form.newCatColor,emoji:st.form.newCatEmoji||'⭐'}],form:{...st.form,cat:id,newCatOpen:false,newCatName:''}}));},
      areaGroups:CUR.regions.map(b=>({b,areas:A.filter(a=>a.b===b)})),
      save:()=>this.save(),saveBg:(f.name.trim()&&f.cat)?C.orange:'#A9ADC2',saveLabel:s.saving?'Looking It Up…':f.id?'Save Changes':s.addTarget?'Add It To The List':'Pin It To My Map',
      lookQ:s.lookQ||'',onLookQ:e=>this.setState({lookQ:e.target.value}),onLookKey:e=>{if(e.key==='Enter')this.runLookup();},runLookup:()=>this.runLookup(),lookBtn:s.lookBusy?'…':'Find',
      lookHasMsg:!!s.lookMsg,lookMsg:s.lookMsg||'',lookHasResults:!!(s.lookResults&&s.lookResults.length),
      lookResults:(s.lookResults||[]).map(r=>{const a=r.address||{};const title=r.name||[a.house_number,a.road].filter(Boolean).join(' ')||r.display_name.split(',')[0];
        const sub=[a.house_number&&r.name?[a.house_number,a.road].join(' '):a.road,hoodAt([+r.lat,+r.lon])].filter(Boolean).filter(v=>v!==title).join(' · ');return {title,sub,onPick:()=>this.pickLookup(r)};}),
      hasToast:!!s.toast,toast:s.toast,
      // Welcome pages after signing in for the first time: what to call you, then home (optional).
      obOpen:s.auth==='signedIn'&&s.obNeed,obStep:s.obStep,obName:s.obName,obAddr:s.obAddr,obRes:s.obRes,obBusy:s.obBusy,obMsg:s.obMsg,obHome:s.obHome,
      obFirst:(s.obName||'').trim().split(/\s+/)[0]||'Friend',
      obStart:()=>this.setState({obStep:1,obName:s.obName||((window.NYCSync&&NYCSync.displayName())||'').trim().split(/\s+/)[0]||'',obMsg:''}),
      obBack:()=>this.setState({obStep:Math.max(0,s.obStep-1),obMsg:''}),
      onObName:e=>this.setState({obName:e.target.value,obMsg:''}),
      obNameNext:e=>{e&&e.preventDefault&&e.preventDefault();if(!(s.obName||'').trim()){this.setState({obMsg:'Even A Nickname Works!'});return;}this.setState({obStep:2,obMsg:''});},
      onObAddr:e=>this.setState({obAddr:e.target.value,obMsg:''}),
      obFind:async e=>{e&&e.preventDefault&&e.preventDefault();const q=(this.state.obAddr||'').trim();if(!q){this.setState({obMsg:'Type An Address Or Cross Streets First.'});return;}
        this.setState({obBusy:true,obMsg:'',obRes:[]});const res=await this.lookup(withCity(q),4);
        if(res===null){this.setState({obBusy:false,obMsg:'Address Search Isn\u2019t Reachable Right Now. You Can Skip And Add Home Later.'});return;}
        const rows=res.map(r=>{const ll=[r5(+r.lat),r5(+r.lon)],a=r.address||{};return {label:[a.house_number&&a.road?a.house_number+' '+a.road:(a.road||r.name||String(r.display_name).split(',')[0]),a.suburb||a.neighbourhood||a.city_district].filter(Boolean).join(', '),lat:ll[0],lng:ll[1],area:hoodAt(ll)||a.suburb||a.city_district||''};});
        this.setState({obBusy:false,obRes:rows,obMsg:rows.length?'':'No Match In NYC Yet — Try Adding The Borough Or A Cross Street.'});},
      obPick:r=>this.setState({obHome:r,obRes:[],obAddr:r.label}),
      obHomeNext:()=>this.setState({obStep:3,obMsg:''}),obSkipHome:()=>this.setState({obStep:3,obHome:null,obMsg:''}),
      obDone:()=>{const name=(this.state.obName||'').trim(),h=this.state.obHome;if(h)this.setState({home:{lat:h.lat,lng:h.lng,area:h.area}});
        this.setState({obNeed:false,obStep:0});if(window.NYCSync)NYCSync.finishOnboarding(name);this.toast('Welcome To The City, '+(name.split(/\s+/)[0]||'Friend')+'!');},
      showPass:s.showPass,toggleShowPass:()=>this.setState({showPass:!s.showPass}),
      authOpen:s.auth==='signedOut',authUp:s.authMode==='up',authEmail:s.authEmail,authPass:s.authPass,authMsg:s.authMsg,hasAuthMsg:!!s.authMsg,
      authBtn:s.authBusy?'One Sec…':s.authMode==='up'?'Create My Account':'Sign In',authTitle:s.authMode==='up'?'Make Your Account':'Welcome Back',
      authSwitch:s.authMode==='up'?'Already Have An Account? Sign In':'New Here? Create An Account',
      onAuthEmail:e=>this.setState({authEmail:e.target.value}),onAuthPass:e=>this.setState({authPass:e.target.value}),
      authSubmit:e=>{e&&e.preventDefault&&e.preventDefault();NYCSync.submit();},authToggle:()=>this.setState({authMode:s.authMode==='up'?'in':'up',authMsg:''}),
      syncOn:s.auth==='signedIn',syncDot:({saved:C.green,saving:C.yellow,syncing:C.yellow,offline:'#A9ADC2'})[s.syncState]||'#A9ADC2',
      syncLabel:({saved:'All Changes Saved',saving:'Saving…',syncing:'Syncing…',offline:'Offline — Saves When You’re Back Online'})[s.syncState]||'Connecting…',
      openAcct:()=>s.auth==='signedIn'&&this.setState({acctOpen:true}),closeAcct:()=>this.setState({acctOpen:false}),acctOpen:s.acctOpen&&s.auth==='signedIn',
      syncEmail:s.syncEmail,signOut:()=>NYCSync.signOut(),
      delAcctLabel:s.acctDel===2?'Deleting…':s.acctDel===1?'Tap Again To Delete Everything — This Can’t Be Undone':'Delete My Account',deleteAccount:()=>this.deleteAccount(),privacyUrl:SITE()+'/privacy.html',syncNow:()=>{NYCSync.syncNow();this.toast('Syncing…');},
      showPrice:!!f.cat&&this.priced(f.cat),priceHint:f.price?PRICE_HINT[f.price-1]+' · Tap Again To Clear':'How Pricey Is It? Optional.',
      priceChips:PRICES.map((lb,i)=>{const on=f.price===i+1;return {label:lb,bg:on?C.green:'#fff',fg:on?'#fff':C.navy,border:on?C.green:'rgba(16,24,63,.14)',onClick:()=>this.setForm({price:on?0:i+1})};}),
      exShowPrice:!s.exCats.length||s.exCats.some(id=>this.priced(id)),clearPrices:()=>this.setState({exPrices:[]}),clearPricesLabel:s.exPrices.length?'Clear':'',
      exPriceChips:PRICES.map((lb,i)=>{const on=s.exPrices.includes(i+1),n=s.places.filter(p=>this.priced(p.cat)&&p.price===i+1).length;return {on,label:lb,count:n+(n===1?' Spot':' Spots'),bg:on?C.green:'#fff',fg:on?'#fff':C.navy,border:on?C.green:'rgba(16,24,63,.12)',onClick:()=>this.toggle('exPrices',i+1)};}),
      ...this.listVals()};
  }
}
