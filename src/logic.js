const C={blue:'#1B3DB8',navy:'#10183F',orange:'#FF6B1A',yellow:'#FFC425',red:'#E8242C',pink:'#F45FA0',green:'#1F9D6B',purple:'#7A4FD6'};
const SWATCHES=[C.orange,C.blue,C.red,C.green,C.pink,C.yellow,C.purple];
const fgFor=c=>c===C.yellow?C.navy:'#fff';
const CATS0=[{id:'coffee',name:'Coffee Shop',color:C.orange,emoji:'☕'},{id:'work',name:'Coffee Shop To Work At',color:C.blue,emoji:'💻'},{id:'food',name:'Restaurant',color:C.red,emoji:'🍽️'},{id:'bakery',name:'Bakery',color:C.yellow,emoji:'🥐'},{id:'grocery',name:'Gourmet Grocery',color:C.green,emoji:'🧀'},{id:'shop',name:'Cute Shop',color:C.pink,emoji:'🛍️'}];
const EMO_DEF=Object.fromEntries(CATS0.map(c=>[c.id,c.emoji]));
const emo=c=>(c&&(c.emoji||EMO_DEF[c.id]))||'📍';
const EMOJIS=['⭐','🍵','🧋','🍜','🍣','🍕','🌮','🥯','🍦','🍷','🍸','📚','🌿','🎨','🧘','🖼️'];
const BOROUGHS=['Manhattan','Brooklyn','Queens','Bronx','Staten Island'];
const PAL={Colorful:{water:'#86C8EE',park:'#7FCB8F',air:'#D8D3C8',line:'rgba(255,255,255,.95)',boro:{Manhattan:'#FFE38F',Brooklyn:'#FFC09A',Queens:'#C4D0FF',Bronx:'#FFB5C9','Staten Island':'#D6C6F4'}},
 Minimal:{water:'#D3E4F0',park:'#CDE5C6',air:'#E6E2DA',line:'#E4DCCD',boro:{}}};
const RC={'1':'#EE352E','2':'#EE352E','3':'#EE352E','4':'#00933C','5':'#00933C','6':'#00933C','7':'#B933AD','A':'#0039A6','C':'#0039A6','E':'#0039A6','B':'#FF6319','D':'#FF6319','F':'#FF6319','M':'#FF6319','G':'#6CBE45','J':'#996633','Z':'#996633','L':'#A7A9AC','N':'#FCCC0A','Q':'#FCCC0A','R':'#FCCC0A','W':'#FCCC0A','S':'#808183','SIR':'#0039A6'};
const bullet=r=>({t:r==='SIR'?'SI':r,bg:RC[r]||'#808183',fg:['N','Q','R','W'].includes(r)?C.navy:'#fff'});
const r5=n=>Math.round(n*1e5)/1e5;
const km=(a,b)=>Math.hypot((a[0]-b[0])*111,(a[1]-b[1])*84);
const mi=k=>(k*0.621).toFixed(1)+' Mi';
const fmtMin=m=>{m=Math.max(1,Math.round(m));return m<60?m+' Min':Math.floor(m/60)+' Hr'+(m%60?' '+m%60+' Min':'');};
const walkMin=(a,b)=>km(a,b)*1.25/0.08;
const rideMin=(a,b)=>km(a,b)*1.25/0.45+1;
const ST=()=>window.NYC_SUBWAY||[];
const nearSt=(p,n=6,max=1.2)=>ST().map(s=>({s,d:km(p,s.c)})).filter(x=>x.d<=max).sort((a,b)=>a.d-b.d).slice(0,n);
const _RC=new Map();
function estimate(a,b){const key=a.join()+'|'+b.join();if(_RC.has(key))return _RC.get(key);
 const walk={min:walkMin(a,b),km:km(a,b)*1.3};let best=null;const NA=nearSt(a),NB=nearSt(b);
 for(const x of NA)for(const y of NB){if(x.s.id===y.s.id)continue;const wa=walkMin(a,x.s.c),wb=walkMin(y.s.c,b);
  const sh=x.s.r.filter(r=>y.s.r.includes(r));
  if(sh.length){const rm=rideMin(x.s.c,y.s.c)+4,t=wa+rm+wb;if(!best||t<best.min)best={min:t,legs:[{k:'walk',to:x.s,min:wa},{k:'ride',from:x.s,to:y.s,r:sh,min:rm},{k:'walk',min:wb}]};}
  else for(const z of ST()){if(z.id===x.s.id||z.id===y.s.id)continue;const r1=x.s.r.filter(r=>z.r.includes(r));if(!r1.length)continue;const r2=z.r.filter(r=>y.s.r.includes(r));if(!r2.length)continue;
   const m1=rideMin(x.s.c,z.c),m2=rideMin(z.c,y.s.c),t=wa+4+m1+5+m2+wb;
   if(!best||t<best.min)best={min:t,legs:[{k:'walk',to:x.s,min:wa},{k:'ride',from:x.s,to:z,r:r1,min:m1+4},{k:'xfer',at:z,min:5},{k:'ride',from:z,to:y.s,r:r2,min:m2},{k:'walk',min:wb}]};}}
 const out={walk,subway:best&&best.min<walk.min-2?best:null};_RC.set(key,out);return out;}
let _A=null;
const areas=()=>{if(_A)return _A;const d=window.NYC_MAP;if(!d)return [];_A=d.hoods.filter(h=>h.t!=='air').map(h=>({name:h.n,b:h.b,c:h.c})).sort((a,b)=>a.name.localeCompare(b.name));return _A;};
const inRing=(pt,r)=>{let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const yi=r[i][0],xi=r[i][1],yj=r[j][0],xj=r[j][1];if(((yi>pt[0])!==(yj>pt[0]))&&(pt[1]<(xj-xi)*(pt[0]-yi)/(yj-yi)+xi))ins=!ins;}return ins;};
const hoodAt=ll=>{const d=window.NYC_MAP;if(!d)return null;for(const h of d.hoods){if(h.t==='air')continue;for(const poly of h.p){if(inRing(ll,poly[0])&&!poly.slice(1).some(r=>inRing(ll,r)))return h.n;}}
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
 if(STON&&z>=15)ST().forEach(s=>{const p=map.project(s.c,z);const w=mc.measureText(s.n).width+s.r.length*15+10;put(circ(p.x+8+w/2,p.y,0,w));put([[p.x,p.y]]);});
 if(z<15)(window.NYC_MAP?.hoods||[]).forEach(hd=>{if(hd.t==='air')return;if(z<14&&hd.a<=0.0005)return;const p=map.project(hd.c,z);put(circ(p.x,p.y,0,Math.min(110,hd.n.length*6)));});
 const cand=[];SI.lines.forEach(ln=>{if(!ln.n||!ln.an||ln.c>(z>=15?2:1))return;const an=ln.an,p=map.project([an[0],an[1]],z),q=map.project([an[2],an[3]],z),L2=Math.hypot(q.x-p.x,q.y-p.y),w=W(ln.n);
  if(L2<w+16)return;let ang=Math.atan2(q.y-p.y,q.x-p.x);if(ang>Math.PI/2)ang-=Math.PI;if(ang<-Math.PI/2)ang+=Math.PI;cand.push({n:ln.n,mx:(p.x+q.x)/2,my:(p.y+q.y)/2,ang,w,pr:ln.c,L2});});
 cand.sort((a,b)=>a.pr-b.pr||b.L2-a.L2);const byName=new Map(),tiles=new Map(),norm=n=>n.toLowerCase().replace(/(\d+)(st|nd|rd|th)\b/g,'$1').replace(/\s+/g,' ');
 for(const c of cand){const nk=norm(c.n),prev=byName.get(nk)||[];if(prev.some(([x,y])=>Math.hypot(x-c.mx,y-c.my)<260))continue;const cs=circ(c.mx,c.my,c.ang,c.w+6);if(hit(cs))continue;put(cs);prev.push([c.mx,c.my]);byName.set(nk,prev);
  const e=c.w/2+6;for(let tx=Math.floor((c.mx-e)/256);tx<=Math.floor((c.mx+e)/256);tx++)for(let ty=Math.floor((c.my-e)/256);ty<=Math.floor((c.my+e)/256);ty++){const k=tx+','+ty;let v=tiles.get(k);if(!v)tiles.set(k,v=[]);v.push(c);}}
 return _LP[key]={font,tiles};};
const SRC={tiktok:{label:'TikTok',bg:'#10183F'},instagram:{label:'Instagram',bg:'#D9367F'},threads:{label:'Threads',bg:'#2B2B2B'},link:{label:'Website',bg:C.blue},manual:{label:'Added By Name',bg:'#7A809C'}};
const detect=u=>!u?null:/tiktok\.com/i.test(u)?'tiktok':/instagram\.com|instagr\.am/i.test(u)?'instagram':/threads\.(net|com)/i.test(u)?'threads':/^https?:\/\//i.test(u)?'link':null;
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
const placeQ=p=>p.address?`${p.name}, ${p.address}, New York`:`${p.name}, ${p.area}, New York`;

class Component extends DCLogic {
  mainMapRef=React.createRef(); exMapRef=React.createRef(); planMapRef=React.createRef();
  state=(()=>{let s=null;try{s=JSON.parse(localStorage.getItem(LS))}catch(e){}
    return {places:s?.places||SEED,cats:s?.cats||CATS0,home:s?.home||null,plan:s?.plan||{ids:['s3','s10','s5','s11'],start:'first'},
      tab:(this.props?.startTab==='Explore')?'explore':(this.props?.startTab==='Plan')?'plan':'map',mapCats:[],selId:null,confirmDel:false,
      exCats:[],exAreas:[],exPrices:[],exStage:'pick',exView:'list',hideVisited:false,addOpen:false,placing:false,placingReturn:null,form:blank(),saving:false,toast:null,
      showSubway:true,here:null,locating:false,hereFailed:false,routeFor:null,routeMode:'home',routeSpot:null,routePick:0,pickerOpen:false,
      auth:window.NYCSync&&NYCSync.enabled?'loading':'local',syncState:'',syncEmail:'',acctOpen:false,authMode:'in',authEmail:'',authPass:'',authMsg:'',authBusy:false};})();

  // ---- cloud sync hooks (used by sync.js) ----
  snapshot(){const s=this.state;return {places:s.places,cats:s.cats,home:s.home,plan:s.plan};}
  emptyData(){return {places:[],cats:CATS0,home:null,plan:{ids:[],start:'first'}};}
  isExampleOnly(){const ids=new Set(SEED.map(p=>p.id)),s=this.state;return s.places.length===SEED.length&&s.places.every(p=>ids.has(p.id))&&s.cats.length===CATS0.length;}
  applyRemote(d){const names=new Set(areas().map(a=>a.name));const places=(d.places||[]).map(p=>names.size&&!names.has(p.area)?{...p,area:hoodAt([p.lat,p.lng])||p.area}:p);
    this.setState(st=>({places,cats:d.cats&&d.cats.length?d.cats:CATS0,home:d.home||null,plan:d.plan||{ids:[],start:'first'},
      selId:places.some(p=>p.id===st.selId)?st.selId:null,routeFor:places.some(p=>p.id===st.routeFor)?st.routeFor:null}));}
  resetLocal(){try{localStorage.removeItem(LS)}catch(e){}this.applyRemote(this.emptyData());this.setState({acctOpen:false,authEmail:'',authPass:''});}

  componentDidMount(){this._on=true;window.NYCSync&&NYCSync.attach(this);const go=()=>{if(!this._on)return;
    if(window.L&&window.NYC_MAP&&this.mainMapRef.current){
      this.maps={main:this.makeMap(this.mainMapRef.current,'main'),ex:null,plan:null};window.__nycMaps=this.maps;
      const names=new Set(areas().map(a=>a.name));
      this.setState(st=>({places:st.places.map(p=>names.has(p.area)?p:{...p,area:hoodAt([p.lat,p.lng])||p.area})}));
      this.syncMaps();setTimeout(()=>this.refreshVisible(),80);}
    else setTimeout(go,100);};go();}
  componentDidUpdate(){const s=this.state;
    if(this._pl!==s.places||this._ct!==s.cats||this._hm!==s.home||this._pn!==s.plan){this._pl=s.places;this._ct=s.cats;this._hm=s.home;this._pn=s.plan;
      try{localStorage.setItem(LS,JSON.stringify({places:s.places,cats:s.cats,home:s.home,plan:s.plan}))}catch(e){}
      window.NYCSync&&NYCSync.queue(this.snapshot());}
    if(this.maps&&this._ms!==this.props.mapStyle){const first=this._ms===undefined;this._ms=this.props.mapStyle;if(!first)this.allMaps().forEach(m=>this.drawBase(m));}
    if(this.maps&&this._ss!==s.showSubway){const first=this._ss===undefined;this._ss=s.showSubway;STON=s.showSubway;this.allMaps().forEach(m=>{s.showSubway?m.subway.addTo(m.map):m.subway.remove();if(!first&&m.streets)m.streets.redraw();});}
    this.syncMaps();
    const vk=s.tab+s.exView+s.exStage+s.placing+(s.routeFor||'');
    if(this.maps&&vk!==this._vk){this._vk=vk;setTimeout(()=>this.refreshVisible(),60);setTimeout(()=>this.refreshVisible(),300);}}
  allMaps(){return this.maps?[this.maps.main,this.maps.ex,this.maps.plan].filter(Boolean):[];}
  refreshVisible(){if(!this.maps)return;const s=this.state;
    const kick=m=>{const sz=m.map.getSize();m.map.invalidateSize({pan:false});const n=m.map.getSize();if(sz.x!==n.x||sz.y!==n.y||!m._drawn){m._drawn=true;m.map.fire('moveend');}};
    if(s.tab==='map'){kick(this.maps.main);this.maps.main.rsig=null;this.syncRoute();}
    if(s.tab==='explore'&&s.exStage==='results'&&s.exView==='map'){
      if(!this.maps.ex){this.maps.ex=this.makeMap(this.exMapRef.current,'ex');this.syncMaps();}else kick(this.maps.ex);
      const l=this.lists().ex;if(l.length)this.fit(this.maps.ex,l);}
    if(s.tab==='plan'){if(!this.maps.plan){this.maps.plan=this.makeMap(this.planMapRef.current,'plan');}else kick(this.maps.plan);this.maps.plan.psig=null;this.syncPlan(true);}}
  makeMap(el,kind){const L=window.L;
    const map=L.map(el,{zoomControl:false,attributionControl:false,minZoom:10,maxZoom:18,zoomSnap:.5,maxBounds:[[40.42,-74.35],[40.98,-73.6]],maxBoundsViscosity:.8,preferCanvas:true}).setView([40.722,-73.97],12);
    [['streets',410],['boroLab',450],['hoodBig',450],['hoodSmall',450],['subway',455],['stBul',456],['stLab',457],['route',470]].forEach(([n,z])=>{const p=map.createPane(n);p.style.zIndex=z;if(n!=='subway'&&n!=='route')p.style.pointerEvents='none';p.style.transition='opacity .35s';});
    const m={map,el,kind,base:L.layerGroup().addTo(map),labels:L.layerGroup().addTo(map),sig:'',ids:'',route:L.layerGroup().addTo(map),me:L.layerGroup().addTo(map)};
    this.drawBase(m);this.addStreets(m);this.buildSubway(m);if(this.state.showSubway)m.subway.addTo(map);
    m.layer=L.layerGroup().addTo(map);
    const fade=()=>{const z=map.getZoom();const P=n=>map.getPane(n).style;P('boroLab').opacity=z<12.5?1:0;P('hoodBig').opacity=z>=12.5&&z<15?1:0;P('hoodSmall').opacity=z>=14&&z<15?1:0;P('subway').opacity=z>=12.5?1:0;P('stBul').opacity=z>=13.5&&z<15?1:0;P('stLab').opacity=z>=15?1:0;};
    map.on('zoomend',fade);fade();map.on('click',e=>this.onMapClick(e,kind));return m;}
  drawBase(m){const L=window.L,d=window.NYC_MAP,pal=PAL[this.props.mapStyle]||PAL.Colorful;
    m.el.style.background=pal.water;m.base.clearLayers();m.labels.clearLayers();
    d.hoods.forEach(h=>{L.polygon(h.p,{fillColor:h.t==='park'?pal.park:h.t==='air'?pal.air:(pal.boro[h.b]||'#FBF6EC'),fillOpacity:1,color:pal.line,weight:.8,interactive:false}).addTo(m.base);
      if(h.t==='air')return;const park=h.t==='park';
      L.marker(h.c,{pane:h.a>0.0005||park?'hoodBig':'hoodSmall',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],
        html:`<div style="transform:translate(-50%,-50%);width:max-content;max-width:110px;text-align:center;font-family:Archivo,sans-serif;font-weight:800;font-size:10.5px;line-height:1.1;color:${park?'#14532D':'#10183F'};text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 2px #fff">${h.n}</div>`})}).addTo(m.labels);});
    d.boros.forEach(b=>{L.polygon(b.p,{fill:false,color:C.navy,weight:2.2,opacity:.9,interactive:false}).addTo(m.base);
      L.marker(b.c,{pane:'boroLab',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],
        html:`<div style="transform:translate(-50%,-50%);white-space:nowrap;font-family:Archivo,sans-serif;font-weight:900;font-style:italic;font-stretch:100%;font-size:16px;color:#10183F;text-shadow:0 0 4px #fff,0 0 4px #fff">${b.b}</div>`})}).addTo(m.labels);});}
  addStreets(m){const L=window.L;if(!streetIndex()){setTimeout(()=>this.addStreets(m),400);return;}
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
    ST().forEach(s=>{const cm=L.circleMarker(s.c,{renderer:rend,radius:5.5,color:'#fff',weight:2,fillColor:RC[s.r[0]]||C.navy,fillOpacity:1});
      if(s.r.length>1&&RC[s.r[1]]&&RC[s.r[1]]!==RC[s.r[0]])L.circleMarker(s.c,{renderer:rend,radius:2.4,stroke:false,fillColor:RC[s.r.find(r=>RC[r]!==RC[s.r[0]])],fillOpacity:1,interactive:false}).addTo(m.subway);
      cm.on('click',e=>{window.L.DomEvent.stopPropagation(e);this.toast(s.n+' · '+s.r.map(r=>r==='SIR'?'SIR':r).join(' '));});cm.addTo(m.subway);
      if(m.kind==='main'){const bl=s.r.slice(0,6).map(r=>{const b=bullet(r);return `<span style="width:14px;height:14px;border-radius:50%;background:${b.bg};color:${b.fg};font-size:8px;font-weight:800;display:inline-flex;align-items:center;justify-content:center">${b.t}</span>`;}).join('');
        L.marker(s.c,{pane:'stBul',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="position:absolute;left:8px;top:-7px;display:flex;gap:1px">${bl}</div>`})}).addTo(m.subway);
        L.marker(s.c,{pane:'stLab',interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div style="position:absolute;left:8px;top:-8px;display:flex;align-items:center;gap:4px;white-space:nowrap;font-family:Archivo,sans-serif;font-weight:800;font-size:10px;color:#10183F;text-shadow:0 0 3px #fff,0 0 3px #fff"><span>${s.n}</span><span style="display:inline-flex;gap:1px">${bl}</span></div>`})}).addTo(m.subway);}});}
  onMapClick(e,kind){const s=this.state;
    if(kind==='main'&&s.placing){const ll=[r5(e.latlng.lat),r5(e.latlng.lng)],a=hoodAt(ll);
      if(s.placing==='here'){const ret=s.placingReturn;this.setState({placing:false,here:ll,hereAcc:0,hereManual:true,hereFailed:false,locFail:null,...(ret==='plan'?{tab:'plan'}:{}),...(ret&&ret.startsWith('route:')?{routeFor:ret.slice(6),routeMode:'here'}:{})});this.toast('Got It — You\u2019re In '+(a||'NYC'));return;}
      if(s.placing==='home'){const ret=s.placingReturn;this.setState({placing:false,home:{lat:ll[0],lng:ll[1],area:a},routeMode:'home',...(ret==='plan'?{tab:'plan'}:{}),...(ret&&ret.startsWith('route:')?{routeFor:ret.slice(6)}:{})});this.toast('Home Saved In '+(a||'NYC'));return;}
      this.setState(st=>({placing:false,addOpen:true,form:{...st.form,lat:ll[0],lng:ll[1],area:a||st.form.area}}));return;}
    if(kind!=='plan')this.setState({selId:null,confirmDel:false});}
  fit(m,l,opt){const pts=l.map(p=>Array.isArray(p)?p:[p.lat,p.lng]).filter(p=>p&&isFinite(p[0])&&isFinite(p[1]));if(!pts.length)return;
    try{m.map.fitBounds(window.L.latLngBounds(pts),opt||{padding:[60,60],maxZoom:15});}catch(e){console.log('fit fail',m.kind,JSON.stringify(l).slice(0,200));}}
  priced(catId){const c=this.state.cats.find(x=>x.id===catId);return catId==='food'||!!(c&&/restaurant|bar\b|food|brunch|dinner|eats/i.test(c.name));}
  lists(){const s=this.state;
    return {main:s.places.filter(p=>!s.mapCats.length||s.mapCats.includes(p.cat)),
      ex:s.places.filter(p=>(!s.exCats.length||s.exCats.includes(p.cat))&&(!s.exAreas.length||s.exAreas.includes(p.area))&&!(s.hideVisited&&p.visited)&&(!s.exPrices.length||!this.priced(p.cat)||s.exPrices.includes(p.price||0)))};}
  syncMaps(){if(!this.maps)return;const l=this.lists(),s=this.state,f=s.form;let main=l.main;
    if(s.placing==='spot'&&f.lat!=null)main=[...main,{id:'_draft',cat:f.cat,lat:f.lat,lng:f.lng,draft:true}];
    if(s.routeFor){const d=s.places.find(p=>p.id===s.routeFor);main=d?[d]:main;}
    this.syncOne(this.maps.main,main,false);if(this.maps.ex)this.syncOne(this.maps.ex,l.ex,true);
    this.syncMe();this.syncRoute();if(this.maps.plan)this.syncPlan(false);}
  pinHtml(col,z,sel,faded,label,em){return `<div style="width:${z}px;height:${z}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${col};border:3px solid ${sel?C.navy:'#fff'};box-shadow:0 4px 10px rgba(16,24,63,.35);display:flex;align-items:center;justify-content:center;opacity:${faded?.55:1}">${label?`<div style="transform:rotate(45deg);color:#fff;font:italic 900 15px Archivo,sans-serif">${label}</div>`:em?`<div style="transform:rotate(45deg);font-size:${Math.round(z*.48)}px;line-height:1">${em}</div>`:`<div style="width:${Math.round(z*.3)}px;height:${Math.round(z*.3)}px;border-radius:50%;background:${sel?C.navy:'#fff'}"></div>`}</div>`;}
  syncOne(m,list,fit){const L=window.L,s=this.state,cat=Object.fromEntries(s.cats.map(c=>[c.id,c]));
    const sig=list.map(p=>p.id+p.cat+(p.visited?'v':'')+(p.id===s.selId||p.id===s.routeFor?'s':'')+p.lat+p.lng).join()+s.cats.map(c=>c.color+emo(c)).join();
    if(sig===m.sig)return;const ids=list.map(p=>p.id).join();const refit=fit&&ids!==m.ids;m.sig=sig;m.ids=ids;m.layer.clearLayers();
    list.forEach(p=>{const sel=p.id===s.selId||p.id===s.routeFor||p.draft,z=sel?42:30,col=(cat[p.cat]||{}).color||C.orange;
      const mk=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:this.pinHtml(col,z,sel,p.visited&&!sel,null,cat[p.cat]?emo(cat[p.cat]):null),iconSize:[z,z],iconAnchor:[z/2,z*1.2]}),zIndexOffset:sel?1000:0,interactive:!p.draft});
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
    stops.forEach((p,i)=>{const col=(cat[p.cat]||{}).color||C.orange;L.marker([p.lat,p.lng],{zIndexOffset:500,icon:L.divIcon({className:'',html:this.pinHtml(col,36,true,false,String(i+1)),iconSize:[36,36],iconAnchor:[18,43]})})
      .on('click',e=>{L.DomEvent.stopPropagation(e);this.toast((i+1)+'. '+p.name);}).addTo(m.planL);});
    if(pts.length)setTimeout(()=>this.fit(m,pts,{paddingTopLeft:[40,70],paddingBottomRight:[40,50],maxZoom:15.5}),30);}
  locate(after){if(!navigator.geolocation){this.setState({hereFailed:true,locFail:'This Browser Doesn\u2019t Share Location. Tap The Map Where You Are Instead.'});return;}
    this.setState({locating:true,locFail:null});let first=true;if(this._wid!=null)navigator.geolocation.clearWatch(this._wid);
    const ok=pos=>{const ll=[r5(pos.coords.latitude),r5(pos.coords.longitude)];this.setState({here:ll,hereAcc:Math.round(pos.coords.accuracy||0),hereManual:false,locating:false,hereFailed:false,locFail:null});
      if(first){first=false;clearTimeout(this._lt);if(km(ll,[40.72,-73.96])>60)this.toast('You Seem To Be Outside NYC Right Now');after&&after(ll);}};
    const bad=err=>{if(!first)return;first=false;clearTimeout(this._lt);if(this._wid!=null){navigator.geolocation.clearWatch(this._wid);this._wid=null;}
      const msg=err&&err.code===1?'Location Access Is Turned Off For This Page. Allow It In Your Browser Settings, Or Tap The Map Where You Are.':'Your Location Didn\u2019t Come Through. Try Again, Or Tap The Map Where You Are.';
      this.setState({locating:false,hereFailed:true,locFail:msg});};
    try{this._wid=navigator.geolocation.watchPosition(ok,bad,{enableHighAccuracy:true,timeout:12000,maximumAge:30000});}catch(e){bad();}
    this._lt=setTimeout(()=>bad({code:3}),14000);}
  componentWillUnmount(){this._on=false;if(this._wid!=null&&navigator.geolocation)navigator.geolocation.clearWatch(this._wid);}

  async lookup(q,limit){try{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),7000);
    const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit='+(limit||5)+'&viewbox=-74.27,40.93,-73.68,40.49&bounded=1&q='+encodeURIComponent(q),{signal:ac.signal,headers:{'Accept-Language':'en'}});clearTimeout(t);
    if(!r.ok)return null;return await r.json();}catch(e){return null;}}
  async runLookup(){const q=(this.state.lookQ||'').trim()||[this.state.form.name,this.state.form.address].filter(Boolean).join(', ');if(!q){this.setState({lookMsg:'Type An Address Or Place Name First'});return;}
    this.setState({lookBusy:true,lookMsg:'',lookResults:[]});const res=await this.lookup(q.match(/new york|nyc|brooklyn|queens|bronx|staten/i)?q:q+', New York City');
    if(res===null){this.setState({lookBusy:false,lookMsg:'Address Lookup Isn’t Reachable Right Now — Drop A Pin Instead'});return;}
    if(!res.length){this.setState({lookBusy:false,lookMsg:'No Matches In NYC — Try Adding Cross Streets Or Drop A Pin'});return;}
    this.setState({lookBusy:false,lookResults:res.slice(0,5)});}
  pickLookup(r){const ll=[r5(+r.lat),r5(+r.lon)],a=r.address||{},area=hoodAt(ll);const street=[a.house_number,a.road].filter(Boolean).join(' ');
    this.setState(st=>({lookResults:[],lookMsg:'',form:{...st.form,lat:ll[0],lng:ll[1],area:area||st.form.area,address:st.form.address||street,name:st.form.name||(r.name&&r.name!==street?r.name:'')}}));this.toast('Found It'+(area?' In '+area:'')+'!');}
  toast(t){this.setState({toast:t});clearTimeout(this._tt);this._tt=setTimeout(()=>this.setState({toast:null}),2400);}
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
      const q=f.address.trim()?f.address+', New York City':f.name+(ao?', '+ao.name:'')+', New York City';const res=await this.lookup(q,1);
      if(res&&res[0]){ll=[r5(+res[0].lat),r5(+res[0].lon)];if(ao&&!f.address.trim()&&km(ll,ao.c)>3)ll=null;}
      if(!ll&&ao)ll=[r5(ao.c[0]+(Math.random()-.5)*.004),r5(ao.c[1]+(Math.random()-.5)*.004)];
      this.setState({saving:false});if(!ll){this.toast('Couldn’t Find It — Drop A Pin Or Pick A Neighborhood');return;}}
    const area=f.area==='auto'?(hoodAt(ll)||'Midtown'):f.area;
    const p={id:f.id||('p'+Date.now()),name:f.name.trim(),cat:f.cat,area,lat:ll[0],lng:ll[1],url:f.url.trim(),source:detect(f.url.trim())||'manual',address:f.address.trim(),note:f.note.trim(),price:this.priced(f.cat)?(f.price||0):0,visited:orig?orig.visited:false};
    this.setState(st=>({addOpen:false,tab:'map',selId:p.id,mapCats:[],places:orig?st.places.map(x=>x.id===p.id?p:x):[p,...st.places]}),
      ()=>setTimeout(()=>{if(this.maps){this.maps.main.map.invalidateSize();this.maps.main.map.flyTo(ll,15,{duration:.8});}},80));
    this.toast(orig?'Changes Saved':'Pinned To Your Map!');}
  openRouteFor(id){const s=this.state;let mode=s.routeMode;if(mode==='home'&&!s.home)mode=s.here?'here':'home';
    const other=s.places.find(p=>p.id!==id);this.setState({routeFor:id,selId:null,tab:'map',routeMode:mode,routePick:0,routeSpot:s.routeSpot&&s.routeSpot!==id?s.routeSpot:(other&&other.id)});}

  renderVals(){const s=this.state,f=s.form,cat=Object.fromEntries(s.cats.map(c=>[c.id,c])),l=this.lists(),A=areas();
    const catOf=id=>cat[id]||{name:'Uncategorized',color:'#888'};const vis=s.places.filter(p=>p.visited).length;
    const chip=(on,label,onClick,col)=>({label,onClick,bg:on?(col||C.navy):'#fff',fg:on?'#fff':C.navy,border:on?(col||C.navy):'rgba(16,24,63,.14)'});
    const mapChips=[{label:'All',emoji:'🗽',count:s.places.length,dot:s.mapCats.length?C.navy:C.yellow,bg:s.mapCats.length?'#fff':C.navy,fg:s.mapCats.length?C.navy:'#fff',border:s.mapCats.length?'#fff':C.navy,onClick:()=>this.setState({mapCats:[]})},
      ...s.cats.map(c=>{const on=s.mapCats.includes(c.id);return {label:c.name,emoji:emo(c),count:s.places.filter(p=>p.cat===c.id).length,dot:on?fgFor(c.color):c.color,bg:on?c.color:'#fff',fg:on?fgFor(c.color):C.navy,border:on?c.color:'#fff',onClick:()=>this.toggle('mapCats',c.id)};})];
    const exTiles=s.cats.map(c=>{const on=s.exCats.includes(c.id),n=s.places.filter(p=>p.cat===c.id).length;
      return {name:c.name,emoji:emo(c),countLabel:n+(n===1?' Spot Saved':' Spots Saved'),check:on?'✓':'',bg:on?c.color:'#fff',fg:on?fgFor(c.color):C.navy,border:on?c.color:'rgba(16,24,63,.1)',dot:on?fgFor(c.color):c.color,onClick:()=>this.toggle('exCats',c.id)};});
    const exBoroughs=BOROUGHS.map(b=>({name:b,areas:A.filter(a=>a.b===b&&s.places.some(p=>p.area===a.name)).map(a=>{const on=s.exAreas.includes(a.name);
      const n=s.places.filter(p=>p.area===a.name&&(!s.exCats.length||s.exCats.includes(p.cat))).length;
      return {name:a.name,count:n,bg:on?C.blue:'#fff',fg:on?'#fff':C.navy,border:on?C.blue:'rgba(16,24,63,.12)',op:(n||on)?1:.45,onClick:()=>this.toggle('exAreas',a.name)};})})).filter(b=>b.areas.length);
    const n=l.ex.length,catNames=s.exCats.map(id=>cat[id]?.name).filter(Boolean);
    const exTitle=(!catNames.length?'Every Kind Of Place':catNames.length>2?catNames.length+' Categories':catNames.join(' + '))+(s.exPrices.length?' · '+[...s.exPrices].sort().map(i=>PRICES[i-1]).join('/'):'');
    const areaTxt=!s.exAreas.length?'Anywhere In NYC':s.exAreas.length>2?s.exAreas.length+' Areas':s.exAreas.join(' & ');
    const inPlan=id=>s.plan.ids.includes(id);
    const resultCards=l.ex.map(p=>{const c=catOf(p.cat),src=SRC[p.source]||SRC.manual,ip=inPlan(p.id);
      return {name:p.name,catName:c.name,catBg:c.color,catFg:fgFor(c.color),initial:p.name.replace(/^the\s+/i,'')[0],area:p.area,note:p.note,hasNote:!!p.note,visited:p.visited,
        srcLabel:p.source==='manual'?src.label:'From '+src.label,srcBg:src.bg,ring:p.id===s.selId?C.navy:'transparent',onClick:()=>this.setState({selId:p.id,confirmDel:false}),
        hasPrice:!!p.price,price:PRICES[(p.price||1)-1],planLabel:ip?'In Plan ✓':'+ Plan',planBg:ip?C.navy:'#fff',planFg:ip?C.yellow:C.navy,onPlan:e=>{e.stopPropagation();this.togglePlan(p.id);}};});
    const sp=s.places.find(p=>p.id===s.selId);let sel={};
    if(sp){const c=catOf(sp.cat),src=SRC[sp.source]||SRC.manual,hasUrl=!!sp.url,ns=nearSt([sp.lat,sp.lng],1,2)[0],ip=inPlan(sp.id);
      sel={name:sp.name,catName:c.name,catBg:c.color,catFg:fgFor(c.color),area:sp.area,note:sp.note,hasNote:!!sp.note,hasUrl,srcBg:src.bg,openLabel:'Open '+src.label,
        hasStation:!!ns,stName:ns?ns.s.n:'',stRoutes:ns?ns.s.r.slice(0,6).map(bullet):[],stWalk:ns?fmtMin(walkMin([sp.lat,sp.lng],ns.s.c))+' Walk':'',
        cols:hasUrl?'1fr 1fr 1fr':'1fr 1fr',visBg:sp.visited?C.green:'#fff',visFg:sp.visited?'#fff':C.green,visLabel:sp.visited?'Been Here ✓':'Mark Visited',
        planBg:ip?C.blue:'#fff',planFg:ip?'#fff':C.blue,planLabel:ip?'In Plan ✓':'+ Plan',hasPrice:!!sp.price,price:PRICES[(sp.price||1)-1]};}
    // route
    const rd=this.routeData();let routeOpts=[],routeMsg='',routeNeedsHome=false;
    if(rd){if(!rd.a){if(s.routeMode==='home'){routeMsg='Save Your Home Once And Every Route Can Start There.';routeNeedsHome=true;}
        else if(s.routeMode==='here')routeMsg=s.locating?'Finding You…':s.hereFailed?'Location Isn\u2019t Coming Through — Tap Where I Am On The Map, Or Start From Home.':'Tap My Location To Share Where You Are.';
        else routeMsg='Pick A Saved Spot To Start From.';}
      else if(rd.far)routeMsg='That Start Point Is Outside NYC — Try Home Or A Saved Spot.';
      else{const aStr=rd.a.join(','),bStr=placeQ(rd.d),pick=Math.min(s.routePick,rd.opts.length-1);
        routeOpts=rd.opts.map((o,i)=>{const on=i===pick;
          const steps=o.mode==='walk'?[{text:'Walk '+mi(o.km)+' To '+rd.d.name,min:fmtMin(o.min),walkDisp:'block',xferDisp:'none',bullets:[]}]:
            o.legs.map(lg=>lg.k==='walk'?{text:lg.to?'Walk To '+lg.to.n:'Walk To '+rd.d.name,min:fmtMin(lg.min),walkDisp:'block',xferDisp:'none',bullets:[]}:
              lg.k==='xfer'?{text:'Transfer At '+lg.at.n,min:fmtMin(lg.min),walkDisp:'none',xferDisp:'block',bullets:[]}:
              {text:'Ride To '+lg.to.n,min:fmtMin(lg.min),walkDisp:'none',xferDisp:'none',bullets:lg.r.slice(0,4).map(bullet)});
          return {title:o.mode==='walk'?'Walk':'Subway',mins:'~'+fmtMin(o.min),color:o.mode==='walk'?C.navy:C.blue,best:i===0&&rd.opts.length>1,border:on?C.navy:'transparent',steps,
            onPick:()=>this.setState({routePick:i}),gLabel:o.mode==='walk'?'Walking Route In Google Maps ↗':'Exact Transit Times In Google Maps ↗',
            onGoogle:e=>{e.stopPropagation();window.open(gmaps(aStr,bStr,o.mode==='walk'?'walking':'transit'),'_blank');}};});}}
    const originChips=[chip(s.routeMode==='here',s.locating?'Finding You…':'My Location',()=>{this.setState({routeMode:'here',routePick:0});if(!s.here)this.locate();}),
      chip(s.routeMode==='home',s.home?'Home':'Home (Set It)',()=>this.setState({routeMode:'home',routePick:0})),
      chip(s.routeMode==='spot','A Saved Spot',()=>this.setState({routeMode:'spot',routePick:0}))];
    // plan
    const stops=this.planStops(),pStart=this.planStartPt();let total=0;
    const planRows=stops.map((p,i)=>{const c=catOf(p.cat),from=i===0?pStart:[stops[i-1].lat,stops[i-1].lng];let hasLeg=false,legText='',legBullets=[],legOpen=null;
      if(from&&km(from,[p.lat,p.lng])<60){hasLeg=true;const e=estimate(from,[p.lat,p.lng]);
        if(e.subway){total+=e.subway.min;legText='Subway · ~'+fmtMin(e.subway.min);legBullets=[...new Set(e.subway.legs.filter(x=>x.k==='ride').flatMap(x=>x.r.slice(0,2)))].slice(0,4).map(bullet);}
        else{total+=e.walk.min;legText='Walk · ~'+fmtMin(e.walk.min)+' · '+mi(e.walk.km);}
        legOpen=()=>window.open(gmaps(from.join(','),placeQ(p),e.subway?'transit':'walking'),'_blank');}
      return {num:i+1,name:p.name,catName:c.name,catBg:c.color,catFg:fgFor(c.color),area:p.area,hasLeg,legText,legBullets,legOpen,
        onClick:()=>{this.setState({tab:'map',selId:p.id});setTimeout(()=>this.maps&&this.maps.main.map.flyTo([p.lat,p.lng],15.5,{duration:.6}),120);},
        up:e=>{e.stopPropagation();this.move(i,-1);},down:e=>{e.stopPropagation();this.move(i,1);},remove:e=>{e.stopPropagation();this.togglePlan(p.id);},
        upOp:i===0?.3:1,downOp:i===stops.length-1?.3:1};});
    const ps=s.plan.start;const planStartMsg=(ps==='home'&&!s.home)||(ps==='here'&&!s.here);
    const placingTitle=s.placing==='home'?'Tap Where You Live':s.placing==='here'?'Tap Where You Are Now':'Tap To Drop Your Pin';
    let locTitle='',locSub='';if(s.here&&s.tab==='map'&&!s.placing&&!s.routeFor&&!s.selId){const hd=hoodAt(s.here);let nb=null;s.places.forEach(p=>{const d=km(s.here,[p.lat,p.lng]);if(!nb||d<nb.d)nb={p,d};});
      locTitle=(s.hereManual?'You Set Your Spot':'You\u2019re Here')+(hd?' · '+hd:'')+(s.hereAcc>60?' · ±'+Math.round(s.hereAcc*3.28)+' Ft':'');
      locSub=nb?(nb.d<60?'Closest Saved: '+nb.p.name+' · '+fmtMin(walkMin(s.here,[nb.p.lat,nb.p.lng]))+' Walk':'Your Saved Spots Are Back In NYC'):'';}
    const fsrc=detect(f.url.trim()),hasPin=f.lat!=null,tabC=t=>s.tab===t?C.yellow:'#C9D0F0',tabD=t=>s.tab===t?C.yellow:'transparent';
    return {
      mapDisplay:s.tab==='map'?'block':'none',exDisplay:s.tab==='explore'?'block':'none',planDisplay:s.tab==='plan'?'block':'none',
      exPickDisplay:s.exStage==='pick'?'block':'none',exResDisplay:s.exStage==='results'?'flex':'none',exListDisplay:s.exView==='list'?'flex':'none',exMapVis:s.exView==='map'?'visible':'hidden',
      mainMapRef:this.mainMapRef,exMapRef:this.exMapRef,planMapRef:this.planMapRef,
      statsText:`${s.places.length} Spots · ${vis} Visited`,mapChips,exTiles,exBoroughs,
      subBtnBg:s.showSubway?C.navy:'#fff',subBtnFg:s.showSubway?'#fff':C.navy,toggleSubway:()=>this.setState({showSubway:!s.showSubway}),
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
      listTabBg:s.exView==='list'?'#fff':'transparent',listTabFg:s.exView==='list'?C.blue:'#fff',mapTabBg:s.exView==='map'?'#fff':'transparent',mapTabFg:s.exView==='map'?C.blue:'#fff',
      viewList:()=>this.setState({exView:'list'}),viewMap:()=>this.setState({exView:'map'}),resultCards,noResults:!n,
      hasSel:!!sp&&!s.placing&&!s.routeFor,sel,delLabel:s.confirmDel?'Tap Again To Delete':'Delete',closeSel:()=>this.setState({selId:null,confirmDel:false}),
      openSource:()=>sp&&window.open(sp.url,'_blank'),openRoute:()=>sp&&this.openRouteFor(sp.id),togglePlanSel:()=>sp&&this.togglePlan(sp.id),
      toggleVisited:()=>{if(!sp)return;this.setState(st=>({places:st.places.map(p=>p.id===sp.id?{...p,visited:!p.visited}:p)}));if(!sp.visited)this.toast('Nice! Marked As Visited');},
      editSel:()=>sp&&this.setState({addOpen:true,form:{...blank(),id:sp.id,price:sp.price||0,url:sp.url||'',name:sp.name,cat:sp.cat,area:sp.area,address:sp.address||'',note:sp.note||'',lat:sp.lat,lng:sp.lng}}),
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
      planEmpty:!stops.length,planHas:!!stops.length,planRows,clearPlan:()=>this.setState(st=>({plan:{...st.plan,ids:[]}})),planCount:s.plan.ids.length,
      pickerOpen:s.pickerOpen,pickerRows:s.places.map(p=>{const c=catOf(p.cat),ip=inPlan(p.id);return {name:p.name,catName:c.name,catBg:c.color,emoji:emo(c),area:p.area,chk:ip?'✓':'',chkBg:ip?C.orange:'#fff',ring:ip?C.orange:'transparent',
        onClick:()=>this.setState(st=>({plan:{...st.plan,ids:ip?st.plan.ids.filter(x=>x!==p.id):[...st.plan.ids,p.id]}}))};}),
      goMap:()=>this.setState({tab:'map',selId:null,placing:false,routeFor:null}),goExplore:()=>this.setState({tab:'explore',selId:null,placing:false,routeFor:null}),goPlan:()=>this.setState({tab:'plan',selId:null,placing:false,routeFor:null}),
      tabMapFg:tabC('map'),tabMapDot:tabD('map'),tabExFg:tabC('explore'),tabExDot:tabD('explore'),tabPlanFg:tabC('plan'),tabPlanDot:tabD('plan'),
      openAdd:()=>this.setState({addOpen:true,placing:false,form:blank(),selId:null,routeFor:null,lookQ:'',lookResults:[],lookMsg:''}),closeAdd:()=>this.setState({addOpen:false}),
      addY:s.addOpen?'0%':'105%',formTitle:f.id?'Edit Spot':'Add A Spot',form:f,
      hasPin,noPin:!hasPin,pinLine:hasPin?(f.area!=='auto'?f.area:(hoodAt([f.lat,f.lng])||'On The Map')):'',startPlacing:()=>this.startPlacing('spot'),
      onUrl:e=>this.setForm({url:e.target.value}),onName:e=>this.setForm({name:e.target.value}),onArea:e=>this.setForm({area:e.target.value}),
      onAddress:e=>this.setForm({address:e.target.value}),onNote:e=>this.setForm({note:e.target.value}),
      pasteUrl:()=>navigator.clipboard?.readText().then(t=>this.setForm({url:t.trim()})).catch(()=>this.toast('Long-Press The Field To Paste')),
      hasSrcBadge:!!fsrc,srcBadge:fsrc?(fsrc==='link'?'Website Link':SRC[fsrc].label+' Link Detected'):'',srcBadgeBg:fsrc?SRC[fsrc].bg:C.navy,
      formCats:s.cats.map(c=>{const on=f.cat===c.id;return {name:c.name,emoji:emo(c),bg:on?c.color:'#fff',fg:on?fgFor(c.color):C.navy,border:on?c.color:'rgba(16,24,63,.12)',dot:on?fgFor(c.color):c.color,onClick:()=>this.setForm({cat:c.id})};}),
      toggleNewCat:()=>this.setForm({newCatOpen:!f.newCatOpen}),onNewCatName:e=>this.setForm({newCatName:e.target.value}),
      swatches:SWATCHES.map(w=>({color:w,ring:f.newCatColor===w?C.navy:'#fff',onClick:()=>this.setForm({newCatColor:w})})),
      emojiChoices:EMOJIS.map(e=>({e,bg:f.newCatEmoji===e?'#FFF3DF':'#fff',ring:f.newCatEmoji===e?C.navy:'rgba(16,24,63,.12)',onClick:()=>this.setForm({newCatEmoji:e})})),
      addCat:()=>{const nm=toTitle(f.newCatName.trim());if(!nm)return;const id='c'+Date.now();this.setState(st=>({cats:[...st.cats,{id,name:nm,color:st.form.newCatColor,emoji:st.form.newCatEmoji||'⭐'}],form:{...st.form,cat:id,newCatOpen:false,newCatName:''}}));},
      areaGroups:BOROUGHS.map(b=>({b,areas:A.filter(a=>a.b===b)})),
      save:()=>this.save(),saveBg:(f.name.trim()&&f.cat)?C.orange:'#A9ADC2',saveLabel:s.saving?'Looking It Up…':f.id?'Save Changes':'Pin It To My Map',
      lookQ:s.lookQ||'',onLookQ:e=>this.setState({lookQ:e.target.value}),onLookKey:e=>{if(e.key==='Enter')this.runLookup();},runLookup:()=>this.runLookup(),lookBtn:s.lookBusy?'…':'Find',
      lookHasMsg:!!s.lookMsg,lookMsg:s.lookMsg||'',lookHasResults:!!(s.lookResults&&s.lookResults.length),
      lookResults:(s.lookResults||[]).map(r=>{const a=r.address||{};const title=r.name||[a.house_number,a.road].filter(Boolean).join(' ')||r.display_name.split(',')[0];
        const sub=[a.house_number&&r.name?[a.house_number,a.road].join(' '):a.road,hoodAt([+r.lat,+r.lon])].filter(Boolean).filter(v=>v!==title).join(' · ');return {title,sub,onPick:()=>this.pickLookup(r)};}),
      hasToast:!!s.toast,toast:s.toast,
      authOpen:s.auth==='signedOut',authUp:s.authMode==='up',authEmail:s.authEmail,authPass:s.authPass,authMsg:s.authMsg,hasAuthMsg:!!s.authMsg,
      authBtn:s.authBusy?'One Sec…':s.authMode==='up'?'Create My Account':'Sign In',authTitle:s.authMode==='up'?'Make Your Account':'Welcome Back',
      authSwitch:s.authMode==='up'?'Already Have An Account? Sign In':'New Here? Create An Account',
      onAuthEmail:e=>this.setState({authEmail:e.target.value}),onAuthPass:e=>this.setState({authPass:e.target.value}),
      authSubmit:e=>{e&&e.preventDefault&&e.preventDefault();NYCSync.submit();},authToggle:()=>this.setState({authMode:s.authMode==='up'?'in':'up',authMsg:''}),
      syncOn:s.auth==='signedIn',syncDot:({saved:C.green,saving:C.yellow,syncing:C.yellow,offline:'#A9ADC2'})[s.syncState]||'#A9ADC2',
      syncLabel:({saved:'All Changes Saved',saving:'Saving…',syncing:'Syncing…',offline:'Offline — Saves When You’re Back Online'})[s.syncState]||'Connecting…',
      openAcct:()=>s.auth==='signedIn'&&this.setState({acctOpen:true}),closeAcct:()=>this.setState({acctOpen:false}),acctOpen:s.acctOpen&&s.auth==='signedIn',
      syncEmail:s.syncEmail,signOut:()=>NYCSync.signOut(),syncNow:()=>{NYCSync.syncNow();this.toast('Syncing…');},
      showPrice:!!f.cat&&this.priced(f.cat),priceHint:f.price?PRICE_HINT[f.price-1]+' · Tap Again To Clear':'How Pricey Is It? Optional.',
      priceChips:PRICES.map((lb,i)=>{const on=f.price===i+1;return {label:lb,bg:on?C.green:'#fff',fg:on?'#fff':C.navy,border:on?C.green:'rgba(16,24,63,.14)',onClick:()=>this.setForm({price:on?0:i+1})};}),
      exShowPrice:!s.exCats.length||s.exCats.some(id=>this.priced(id)),clearPrices:()=>this.setState({exPrices:[]}),clearPricesLabel:s.exPrices.length?'Clear':'',
      exPriceChips:PRICES.map((lb,i)=>{const on=s.exPrices.includes(i+1),n=s.places.filter(p=>this.priced(p.cat)&&p.price===i+1).length;return {label:lb,count:n+(n===1?' Spot':' Spots'),bg:on?C.green:'#fff',fg:on?'#fff':C.navy,border:on?C.green:'rgba(16,24,63,.12)',onClick:()=>this.toggle('exPrices',i+1)};})};
  }
}
