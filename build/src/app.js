/* ================= Majed's Launchpad — app shell ================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=0)=>(n==null||!isFinite(n))?'—':Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(n,d=1)=>(n==null||!isFinite(n))?'—':(n*100).toFixed(d)+'%';
const DAY=864e5;
const perm=n=>{const p=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]]}return p};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dkey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function weekStart(t){const d=new Date(t||Date.now());d.setHours(0,0,0,0);const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow);return d.getTime()} // Monday
const weekKey=t=>dkey(weekStart(t));
const FOLLOW=!!window.FOLLOW;
/* reading-link helpers shared by all track files */
const HBRS=t=>'https://hbr.org/search?term='+encodeURIComponent(t);
const INV=t=>'https://www.investopedia.com/terms/'+t;
const OCW=q=>'https://ocw.mit.edu/search/?q='+encodeURIComponent(q);
const DAMO='https://pages.stern.nyu.edu/~adamodar/';
const WIKI=t=>'https://en.wikipedia.org/wiki/'+t;

/* ---------- registry (filled by track data files) ---------- */
const TRACKS=[
 {id:'consult',ico:'❖',name:'Consulting',sub:'The case method, Harvard-style',batch:1,titles:['How engagements work','Structured thinking and MECE','Issue trees','Hypothesis-driven problem solving','Profitability cases','Market sizing and estimation','Market-entry cases','Growth and M&A cases','Operations and cost-reduction cases','Pricing and new-product cases','Reading exhibits fast','Pyramid principle and storylining','Slide-writing','Client communication','Case-interview mastery']},
 {id:'mba',ico:'◆',name:'MBA Core',sub:'Accounting, finance, marketing, strategy, economics, data',batch:2,titles:['Reading the three statements','Working capital and the cash cycle','Ratio analysis and DuPont','Cost behaviour and break-even','Time value of money','Cost of capital','DCF valuation','Microeconomics for managers','Macroeconomics and the Saudi economy','Pricing strategy','Marketing: STP and the 4Ps','Competitive strategy: Five Forces','Growth strategy: BCG and Ansoff','Operations strategy and process analysis','Organisational behaviour','Data analysis for decisions']},
 {id:'eng',ico:'⚙',name:'Engineering Refresher',sub:'Manufacturing, lean, quality, OR, supply chain',batch:3,titles:['Manufacturing systems and process types','Capacity, utilisation and bottlenecks','Line balancing','Lean: 8 wastes and VSM','Lean tools: 5S, SMED, kanban','OEE and TPM','Six Sigma and process capability','Statistical process control','Quality systems: FMEA and root cause','Demand forecasting','Inventory: EOQ and safety stock','Supply-chain design and bullwhip','Operations research I: linear programming','Operations research II: queuing and scheduling','Industry 4.0','Project management: CPM and EVM']},
 {id:'startup',ico:'▲',name:'Entrepreneurship',sub:'From problem to pitch, in the Saudi ecosystem',batch:4,titles:['Opportunity recognition','Customer discovery','Jobs-to-be-done and value proposition','Lean canvas','Market sizing: TAM/SAM/SOM','Business and revenue models','Unit economics','MVP and experiments','Go-to-market','Financial model and runway','Fundraising stages and instruments','Cap tables and dilution','Term sheets','The Saudi ecosystem','The pitch']}
];
const PFX={consult:'c',mba:'m',eng:'e',startup:'s'};
const M={};          // mission id -> mission object
const LABS={};       // lab key -> fn(el, mission, done)
const CASES=[];      // case-of-the-week list
const SIMS={};       // case simulations by id
function addMissions(list){list.forEach(m=>{M[m.id]=m})}
const mid=(t,i)=>PFX[t]+String(i+1).padStart(2,'0');

/* ---------- state defaults ---------- */
function ensure(){const d={progress:{},custom:{},time:{},log:[],xp:0,srs:{},goals:{},days:{},mins:{},conf:{},cow:{},settings:{shareRefl:false},refl:{},badges:{},reviews:0,name:profName(USER)};for(const k in d)if(state[k]==null)state[k]=d[k];if(USER)state.name=profName(USER);if(!state.settings)state.settings={shareRefl:false}}
const profName=u=>(USERS.find(x=>x.id===u)||{}).name||'Majed';
ensure();
const P=id=>state.progress[id]||(state.progress[id]={status:'new',steps:{},best:0,attempts:0,xp:0});

/* ---------- reflections: private (device) or shared (synced) ---------- */
const RKEY=USER==='majed'?'launchpad-refl':'launchpad-refl-'+USER;
function reflStore(){if(state.settings.shareRefl)return state.refl;try{return JSON.parse(localStorage.getItem(RKEY)||'{}')}catch(e){return{}}}
function reflSave(id,obj){if(state.settings.shareRefl){state.refl[id]=obj}else{const r=reflStore();r[id]=obj;try{localStorage.setItem(RKEY,JSON.stringify(r))}catch(e){}}save()}
function setShareRefl(on){const cur=reflStore();state.settings.shareRefl=on;if(on){state.refl=Object.assign({},cur,state.refl)}else{try{localStorage.setItem(RKEY,JSON.stringify(Object.assign({},state.refl,cur)))}catch(e){}state.refl={}}save()}

/* ---------- XP, levels, streak ---------- */
const LEVELS=[[0,'Associate'],[600,'Senior Associate'],[1500,'Manager'],[3000,'Senior Manager'],[5000,'Director'],[7500,'Partner']];
function level(x){let i=0;while(i<LEVELS.length-1&&x>=LEVELS[i+1][0])i++;const nx=LEVELS[i+1];return{name:LEVELS[i][1],i,frac:nx?(x-LEVELS[i][0])/(nx[0]-LEVELS[i][0]):1,next:nx}}
function addXP(n,id){if(FOLLOW)return;state.xp=(state.xp||0)+n;if(id){P(id).xp=(P(id).xp||0)+n}state.days[today()]=true;const before=level(state.xp-n).i;save();renderTop();if(level(state.xp).i>before){confetti();toast(`🎖️ Promoted to <b>${level(state.xp).name}</b>`)}checkBadges()}
function streak(){let s=0;const d=new Date();if(!state.days[today()])d.setDate(d.getDate()-1);while(state.days[dkey(d)]){s++;d.setDate(d.getDate()-1)}return s}

/* ---------- toast & confetti ---------- */
let toastT;function toast(h){const t=$('#toast');t.innerHTML=h;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}
function confetti(){const c=$('#confetti');if(!c)return;const x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cols=['#C9A227','#E2C25A','#0B1F3A','#5B7DB1','#ffffff'];const ps=Array.from({length:110},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.4,vx:(Math.random()-.5)*3,vy:2+Math.random()*3,r:3+Math.random()*4,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*6}));let f=0;(function tick(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=.1;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()});if(++f<150)requestAnimationFrame(tick);else x.clearRect(0,0,c.width,c.height)})()}

/* ---------- badges ---------- */
const BADGES=[
 ['first','🚀','First mission',s=>done().length>=1],
 ['five','🎯','Five missions',s=>done().length>=5],
 ['consult','❖','Consulting track complete',s=>trackDone('consult')],
 ['mba','◆','MBA Core complete',s=>trackDone('mba')],
 ['eng','⚙','Engineering complete',s=>trackDone('eng')],
 ['startup','▲','Entrepreneurship complete',s=>trackDone('startup')],
 ['perfect','💯','Perfect test score',s=>Object.values(s.progress).some(p=>p.best>=1)],
 ['streak7','🔥','7-day streak',s=>streak()>=7],
 ['streak30','🌋','30-day streak',s=>streak()>=30],
 ['review50','🧠','50 reviews',s=>(s.reviews||0)>=50],
 ['review250','🏛️','250 reviews',s=>(s.reviews||0)>=250],
 ['cow1','📘','First case of the week',s=>Object.values(s.cow).filter(c=>c.done).length>=1],
 ['cow4','📚','Four cases of the week',s=>Object.values(s.cow).filter(c=>c.done).length>=4],
 ['room','🌐','Played an online room',s=>(s.log||[]).some(l=>l.type==='duel'||l.type==='room')||s.badges.room],
 ['photo','📷','First notebook photo',s=>(s.photos||[]).length>0],
 ['goals','✅','Hit all weekly targets',s=>!!s.badges.goals],
 ['mock','🎤','Mock interview scored 80%+',s=>(P('c15').mock||0)>=.8]
];
const done=()=>Object.keys(state.progress).filter(id=>state.progress[id].status==='completed'&&M[id]);
const trackDone=t=>{const tr=TRACKS.find(x=>x.id===t);return tr.titles.every((_,i)=>(state.progress[mid(t,i)]||{}).status==='completed')};
function checkBadges(){if(FOLLOW)return;let got=[];BADGES.forEach(([k,e,n,f])=>{if(!state.badges[k]){try{if(f(state)){state.badges[k]=Date.now();got.push(e+' '+n)}}catch(err){}}});if(got.length){save();setTimeout(()=>{confetti();toast('🏅 Badge: <b>'+got.join(', ')+'</b>')},700)}}

/* ---------- theme ---------- */
function applyTheme(){const t=localStorage.getItem('launchpad-theme');if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme')}
function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');const n=cur==='dark'?'light':'dark';try{localStorage.setItem('launchpad-theme',n)}catch(e){}applyTheme()}

/* ---------- time tracking ---------- */
let current=null;
setInterval(()=>{if(FOLLOW||!USER||document.hidden)return;const id=current&&current.id;const k=today();state.mins[k]=(state.mins[k]||0)+15;if(id)state.time[id]=(state.time[id]||0)+15;if(Object.keys(state.mins).length>120){const ks=Object.keys(state.mins).sort();ks.slice(0,ks.length-120).forEach(x=>delete state.mins[x])}save()},15000);

/* ---------- header ---------- */
function renderTop(){ensure();const br=$('.brand');if(br&&!FOLLOW&&!USER)br.innerHTML='<b>Launchpad</b>';if(br&&!FOLLOW&&USER)br.innerHTML=`${esc(profName(USER))}'s <b>Launchpad</b>`;const ab=$('#meBtn');if(ab&&USER&&!FOLLOW){ab.innerHTML=avatar(USER,30);ab.classList.remove('hide')}const L=level(state.xp||0);$('#lvlTxt').innerHTML=`${L.name} · ${fmt(state.xp||0)} XP${L.next?` <span class="nxtlvl" style="opacity:.7">→ ${L.next[1]} at ${fmt(L.next[0])}</span>`:''}`;$('#xpBar').style.width=Math.min(100,L.frac*100)+'%';const due=dueCards().length;const b=$('#dueBadge');if(b){b.textContent=due;b.classList.toggle('hide',!due||FOLLOW)}}

/* ---------- profiles: picker, lock, family ---------- */
const PCOL={majed:'#C9A227',mohammed:'#5B7DB1',lamess:'#B5657A',lena:'#4E9A7C'};
const pinHash=p=>btoa(unescape(encodeURIComponent(USER+'|'+p)));
const locked=()=>!FOLLOW&&state.pin&&(()=>{try{return localStorage.getItem('launchpad-unlocked-'+USER)!==state.pin}catch(e){return true}})();
function localOf(u){try{return JSON.parse(localStorage.getItem(u==='majed'?'launchpad-state':'launchpad-state-'+u)||'null')}catch(e){return null}}
function avatar(u,sz){sz=sz||44;return`<span style="display:inline-grid;place-items:center;width:${sz}px;height:${sz}px;border-radius:50%;background:${PCOL[u]};color:#0B1F3A;font:600 ${sz*.42}px var(--serif);flex:none">${profName(u)[0]}</span>`}
function setUser(u){try{localStorage.setItem('launchpad-user',u)}catch(e){}location.hash='#/home';location.reload()}
function vPicker(){$('#tabs').classList.add('hide');$('#lvlBox').style.visibility='hidden';
  view().innerHTML=`<div style="max-width:560px;margin:6vh auto 0"><div class="eyebrow">Launchpad</div><h1>Who is learning today?</h1><p class="note">Each person has their own missions, XP, review deck, goals and reflections. Progress syncs per person.</p><div class="grid g2" style="margin-top:16px">${USERS.map(u=>{const s=localOf(u.id);return`<button class="card tcard" style="text-align:left;font:inherit;color:inherit;cursor:pointer" data-u="${u.id}"><div class="row">${avatar(u.id)}<div><h3 style="margin:0">${u.name}</h3><small class="muted">${s&&s.xp?level(s.xp).name+' · '+fmt(s.xp)+' XP':'Tap to enter'}${s&&s.pin?' · 🔒':''}</small></div></div></button>`}).join('')}</div></div>`;
  $$('[data-u]').forEach(b=>b.onclick=()=>setUser(b.dataset.u))}
function vLock(){$('#tabs').classList.add('hide');view().innerHTML=`<div style="max-width:360px;margin:8vh auto 0;text-align:center">${avatar(USER,64)}<h2 style="margin-top:12px">${esc(profName(USER))}</h2><p class="note">Enter your PIN</p><input class="tin" id="pin" type="password" inputmode="numeric" maxlength="8" style="text-align:center;font-size:1.4rem;letter-spacing:6px"><div class="ctl" style="justify-content:center"><button class="sbtn" id="ok">Unlock</button><button class="sbtn alt" id="sw">Switch profile</button></div><p class="note" id="pm"></p></div>`;
  const go2=()=>{if(pinHash($('#pin').value)===state.pin){try{localStorage.setItem('launchpad-unlocked-'+USER,state.pin)}catch(e){}$('#tabs').classList.remove('hide');route()}else{$('#pm').textContent='Wrong PIN.';$('#pin').value=''}};
  $('#ok').onclick=go2;$('#pin').onkeydown=e=>{if(e.key==='Enter')go2()};$('#sw').onclick=()=>{try{localStorage.removeItem('launchpad-user')}catch(e){}location.reload()};$('#pin').focus()}
async function familyStates(){const out={};await Promise.all(USERS.map(async u=>{if(!FOLLOW&&u.id===USER){out[u.id]=state;return}try{const r=await fetch(SYNC.url+'?key='+encodeURIComponent(SYNC.key)+'&user='+u.id+'&t='+Date.now());const j=await r.json();out[u.id]=j.state||null}catch(e){out[u.id]=localOf(u.id)}}));return out}
function famStreak(s){if(!s||!s.days)return 0;let n=0;const d=new Date();if(!s.days[today()])d.setDate(d.getDate()-1);while(s.days[dkey(d)]){n++;d.setDate(d.getDate()-1)}return n}
function famDone(s){return s&&s.progress?Object.keys(s.progress).filter(id=>s.progress[id].status==='completed').length:0}
async function familyTable(box){if(window._fam&&Date.now()-window._fam.t<300000){box.innerHTML=window._fam.h;return}if(!SYNC.url){box.innerHTML='<p class="note">Family standings need cloud sync.</p>';return}box.innerHTML='<p class="note">Loading family…</p>';const F=await familyStates();const ws=weekStart();
  const rows=USERS.map(u=>{const s=F[u.id];const last=s&&s.log&&s.log.length?s.log[s.log.length-1].t:0;return{u,s,xp:(s&&s.xp)||0,done:famDone(s),st:famStreak(s),wk:s&&s.log?s.log.filter(l=>l.t>=ws&&l.type==='complete').length:0,last}}).sort((x,y)=>y.xp-x.xp);
  box.innerHTML=`<div class="tablewrap"><table class="t"><tr><th>Person</th><th>Level</th><th>XP</th><th>Missions</th><th>This week</th><th>Streak</th><th>Last active</th></tr>${rows.map(r=>`<tr><td><span class="row" style="gap:8px">${avatar(r.u.id,26)}${r.u.name}</span></td><td>${r.s?level(r.xp).name:'—'}</td><td>${fmt(r.xp)}</td><td>${r.done}/62</td><td>${r.wk}</td><td>${r.st}</td><td>${r.last?new Date(r.last).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'—'}</td></tr>`).join('')}</table></div>`;window._fam={t:Date.now(),h:box.innerHTML}}
function vFamily(){view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Family</h1><p class="note">Everyone's standing. Each person's missions, tests and reflections stay in their own profile.</p><div class="card" id="fam"></div><p class="note">Challenge each other in <a href="#/rooms">Online rooms</a>: Case Sprint duel or a partner case.</p>`;familyTable($('#fam'))}

/* ---------- router ---------- */
function go(h){location.hash=h}
function route(){const h=location.hash.replace(/^#\/?/,'')||'home';const [v,a,b]=h.split('/');current=null;window.scrollTo(0,0);
  if(FOLLOW){renderParent();return}
  if(!USER){vPicker();return}
  if(locked()){vLock();return}
  $$('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.v===v||(v==='track'&&x.dataset.v==='tracks')||(v==='m'&&x.dataset.v==='tracks')||(['goals','badges','rooms','settings','journal','family'].includes(v)&&x.dataset.v==='more')));
  const V={family:vFamily,home:vHome,tracks:vTracks,track:()=>vTrack(a),m:()=>vMission(a,b),review:vReview,case:()=>vCase(a),more:vMore,goals:vGoals,badges:vBadges,rooms:vRooms,settings:vSettings,journal:vJournal}[v]||vHome;
  if(roomStop){roomStop();roomStop=null}
  V();renderTop()}
function renderMap(){route()}
let roomStop=null;

/* ---------- views ---------- */
const view=()=>$('#view');
function trackStats(t){const tr=TRACKS.find(x=>x.id===t);const ids=tr.titles.map((_,i)=>mid(t,i));const d=ids.filter(id=>(state.progress[id]||{}).status==='completed').length;return{d,n:ids.length,ids}}
function nextMission(){for(const tr of TRACKS){for(let i=0;i<tr.titles.length;i++){const id=mid(tr.id,i);if(M[id]&&(state.progress[id]||{}).status!=='completed')return id}}return null}
function inProgress(){return Object.keys(state.progress).filter(id=>M[id]&&state.progress[id].status==='started').sort((a,b)=>(state.progress[b].updated||0)-(state.progress[a].updated||0))[0]}

function vHome(){const L=level(state.xp||0);const ip=inProgress()||nextMission();const m=ip&&M[ip];const due=dueCards().length;const w=weekProgress();const c=currentCase();const cs=c&&state.cow[c.id];
  const hr=new Date().getHours();const greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  view().innerHTML=`
  <div class="eyebrow">${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</div>
  <h1>${greet}, ${esc(profName(USER))}</h1>
  <div class="grid g4 g2m" style="margin:12px 0 14px">
    <div class="stat"><small>Level</small><b>${L.name}</b><small>${fmt(state.xp)} XP</small></div>
    <div class="stat"><small>Streak</small><b>${streak()} 🔥</b><small>days in a row</small></div>
    <div class="stat"><small>Missions</small><b>${done().length}<span class="muted" style="font-size:1rem">/62</span></b><small>completed</small></div>
    <div class="stat"><small>Review due</small><b>${due}</b><small>concept cards</small></div>
  </div>
  ${m?`<div class="card gold"><div class="eyebrow">${(state.progress[ip]||{}).status==='started'?'Continue':'Up next'} · ${TRACKS.find(t=>t.id===m.track).name}</div><h2 style="margin-top:4px">${esc(m.title)}</h2><p class="note">${esc(m.blurb)}</p><div class="row"><button class="sbtn" onclick="go('#/m/${ip}')">Open mission</button><span class="note">~${m.mins||35} min</span></div></div>`:''}
  <div class="grid g2">
    <div class="card"><div class="row"><h3 style="margin:0">This week</h3><span class="spacer"></span><a href="#/goals" class="note">Edit goals</a></div>${goalBars(w)}</div>
    <div class="card">${c?`<div class="eyebrow">Case of the week</div><h3 style="margin-top:4px">${esc(c.title)}</h3><p class="note">${esc(c.teaser)}</p><div class="row"><button class="sbtn ${cs&&cs.done?'alt':''}" onclick="go('#/case')">${cs&&cs.done?'Review your answers':cs?'Continue the case':'Read the case'}</button>${cs&&cs.done?`<span class="pill done">Done · ${Math.round(cs.score*100)}%</span>`:''}</div>`:''}</div>
  </div>
  ${due?`<div class="card"><div class="row"><div><h3 style="margin:0">Spaced review</h3><p class="note" style="margin:0">${due} card${due===1?'':'s'} due. Five minutes keeps the concepts fresh.</p></div><span class="spacer"></span><button class="sbtn" onclick="go('#/review')">Review now</button></div></div>`:''}
  <h2 style="margin-top:18px">Tracks</h2>
  <div class="grid g2">${TRACKS.map(trackCard).join('')}</div>`}
function trackCard(t){const s=trackStats(t.id);const avail=t.titles.some((_,i)=>M[mid(t.id,i)]);return`<div class="card tcard" onclick="go('#/track/${t.id}')"><div class="row"><span class="ico">${t.ico}</span><div style="flex:1"><h3 style="margin:0">${t.name}</h3><small class="muted">${t.sub}</small></div>${avail?'':`<span class="pill">Coming in batch ${t.batch}</span>`}</div><div class="prog"><i style="width:${s.d/s.n*100}%"></i></div><small class="muted">${s.d} of ${s.n} missions</small></div>`}
function vTracks(){view().innerHTML=`<h1>Tracks</h1><p class="note">Each mission: concept cards → a working lab → a self-test → a reflection. Concepts then join your spaced-review deck.</p><div class="grid g2">${TRACKS.map(trackCard).join('')}</div>`}
function vTrack(t){const tr=TRACKS.find(x=>x.id===t);if(!tr)return vTracks();const s=trackStats(t);
  view().innerHTML=`<div class="trackhead"><div class="eyebrow" style="color:var(--gold2)">Track</div><h1>${tr.ico} ${tr.name}</h1><p>${tr.sub}</p><div class="prog" style="background:rgba(255,255,255,.15)"><i style="width:${s.d/s.n*100}%"></i></div><small style="color:#C9D2E3">${s.d} of ${s.n} complete</small></div>
  <div class="mlist">${tr.titles.map((ti,i)=>{const id=mid(t,i),m=M[id],p=state.progress[id]||{};const dn=p.status==='completed';
    return`<button class="mitem ${dn?'done':''} ${m?'':'lock'}" ${m?`onclick="go('#/m/${id}')"`:'disabled'}><span class="n">${dn?'✓':i+1}</span><span class="t"><b>${esc(m?m.title:ti)}</b><small class="muted">${m?esc(m.lab.name):'Coming in batch '+tr.batch}</small></span>${dn?`<span class="pill done">${Math.round((p.best||0)*100)}%</span>`:p.status==='started'?'<span class="pill gold">In progress</span>':''}</button>`}).join('')}</div>`}

/* ---------- mission ---------- */
const STEPS=[['learn','Learn'],['lab','Lab'],['test','Test'],['reflect','Reflect'],['read','Read']];
function vMission(id,step){const m=M[id];if(!m)return vTracks();current=m;const p=P(id);if(p.status==='new'){p.status='started';p.updated=Date.now();logEvent('start',id,m.title);save()}
  step=step||(p.steps.learn?(p.steps.lab?(p.steps.test?'reflect':'test'):'lab'):'learn');
  const tr=TRACKS.find(t=>t.id===m.track);const idx=tr.titles.findIndex((_,i)=>mid(m.track,i)===id);
  view().innerHTML=`<div class="row" style="margin-bottom:4px"><a href="#/track/${m.track}" class="note">← ${tr.name}</a><span class="spacer"></span>${p.status==='completed'?'<span class="pill done">Completed</span>':''}</div>
  <div class="eyebrow">Mission ${idx+1} of ${tr.titles.length}</div><h1>${esc(m.title)}</h1><p class="note" style="margin-top:0">${esc(m.blurb)}</p>
  <div class="steps">${STEPS.map(([k,n])=>`<button class="${k===step?'on':''} ${p.steps[k]?'ok':''}" onclick="go('#/m/${id}/${k}')">${n}</button>`).join('')}</div>
  <div id="stepBox"></div>`;
  const box=$('#stepBox');({learn:stepLearn,lab:stepLab,test:stepTest,reflect:stepReflect,read:stepRead}[step]||stepLearn)(box,m)}
function markStep(m,k,xp){const p=P(m.id);if(p.steps[k])return false;p.steps[k]=Date.now();p.updated=Date.now();addXP(xp,m.id);logEvent(k,m.id,m.title);maybeComplete(m);save();$$('.steps button').forEach(b=>{if(b.textContent.trim()===STEPS.find(s=>s[0]===k)[1])b.classList.add('ok')});return true}
function maybeComplete(m){const p=P(m.id);if(p.status!=='completed'&&p.steps.learn&&p.steps.lab&&p.steps.test){p.status='completed';p.updated=Date.now();logEvent('complete',m.id,m.title+' ('+Math.round((p.best||0)*100)+'%)');save();setTimeout(()=>{confetti();toast(`✅ <b>Mission complete:</b> ${esc(m.title)}`)},300)}}
function stepLearn(box,m){let i=0;const n=m.cards.length;
  const draw=()=>{const c=m.cards[i];box.innerHTML=`<div class="card concept"><div class="eyebrow">Concept ${i+1} of ${n}</div><h3 style="margin-top:4px">${c.h}</h3><div>${c.b}</div></div><div class="dots">${m.cards.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join('')}</div><div class="ctl"><button class="sbtn alt" id="prv" ${i?'':'disabled'}>← Back</button><span class="spacer"></span>${i<n-1?'<button class="sbtn" id="nxt">Next →</button>':'<button class="sbtn gold" id="fin">Add to review deck & go to the lab →</button>'}</div>`;
    $('#prv',box).onclick=()=>{i--;draw()};const nx=$('#nxt',box);if(nx)nx.onclick=()=>{i++;draw();box.scrollIntoView({block:'start'})};const f=$('#fin',box);if(f)f.onclick=()=>{addCards(m);markStep(m,'learn',10);go('#/m/'+m.id+'/lab')}};draw()}
function stepLab(box,m){box.innerHTML=`<div class="card"><div class="eyebrow">Lab</div><h3 style="margin-top:4px">${esc(m.lab.name)}</h3><p class="note">${m.lab.intro||''}</p><div id="labBox"></div></div><div class="ctl"><span class="spacer"></span><button class="sbtn alt" onclick="go('#/m/${m.id}/test')">Go to the test →</button></div>`;
  const fn=LABS[m.lab.key];const lb=$('#labBox',box);if(!fn){lb.innerHTML='<p class="note">Lab not found.</p>';return}
  fn(lb,m,()=>{if(markStep(m,'lab',20))toast('🧪 Lab complete +20 XP')})}
function stepTest(box,m){const qs=m.quiz;let i=0,ok=0;const ans=[];
  const draw=()=>{if(i>=qs.length){const sc=ok/qs.length;const p=P(m.id);p.attempts=(p.attempts||0)+1;const first=!p.steps.test;const gain=Math.round(40*sc)-(first?0:Math.round(40*(p.best||0)));if(sc>(p.best||0))p.best=sc;
      box.innerHTML=`<div class="card" style="text-align:center"><div class="eyebrow">Result</div><div class="big" style="font-size:2.6rem">${ok}/${qs.length}</div><p>${sc>=.85?'Excellent. You own this.':sc>=.67?'Solid. Review the explanations you missed.':'Worth another pass. Revisit the concept cards, then retry.'}</p><div class="ctl" style="justify-content:center"><button class="sbtn alt" id="again">Retry</button><button class="sbtn" onclick="go('#/m/${m.id}/reflect')">Reflect →</button></div></div>`;
      $('#again',box).onclick=()=>{i=0;ok=0;draw()};
      if(first){markStep(m,'test',Math.round(40*sc))}else{if(gain>0)addXP(gain,m.id);logEvent('retest',m.id,Math.round(sc*100)+'%');save()}if(sc>=1)checkBadges();return}
    const q0=qs[i],pm=perm(q0.o.length),q={q:q0.q,w:q0.w,o:pm.map(k=>q0.o[k]),a:pm.indexOf(q0.a)};box.innerHTML=`<div class="card"><div class="row"><div class="eyebrow">Question ${i+1} of ${qs.length}</div><span class="spacer"></span><small class="muted">${ok} correct</small></div><h3 style="margin-top:6px;font-family:var(--sans);font-size:1.02rem">${q.q}</h3><div id="opts">${q.o.map((o,j)=>`<button class="qopt" data-j="${j}">${o}</button>`).join('')}</div><div id="why"></div></div>`;
    $$('.qopt',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.j;const r=j===q.a;if(r)ok++;logEvent('quiz',m.id,(r?'✓ ':'✗ ')+String(q.q).replace(/<[^>]+>/g,'').slice(0,60));$$('.qopt',box).forEach(x=>{x.disabled=true;if(+x.dataset.j===q.a)x.classList.add('right');else if(x===b)x.classList.add('wrong')});
      $('#why',box).innerHTML=`<div class="readout ${r?'ok':'bad'}"><b>${r?'Correct.':'Not quite.'}</b> ${q.w}</div><div class="ctl"><span class="spacer"></span><button class="sbtn" id="nq">${i<qs.length-1?'Next question →':'See result'}</button></div>`;$('#nq',box).onclick=()=>{i++;draw()}})};draw()}
function stepReflect(box,m){const r=reflStore()[m.id]||{};const conf=state.conf[m.id]||0;const prompts=m.reflect||['What is the single most useful idea from this mission?','Where could you apply it in your current work at Strategy& this month?','What is still unclear, and how will you close the gap?'];
  box.innerHTML=`<div class="card"><h3>Self-assessment</h3><p class="note">How confidently could you explain and apply this in front of a client or manager?</p><div class="conf" id="conf">${[1,2,3,4,5].map(n=>`<button data-n="${n}" class="${conf===n?'on':''}">${n}</button>`).join('')}</div><div class="row note" style="justify-content:space-between;margin-top:4px"><span>Not yet</span><span>Could teach it</span></div></div>
  <div class="card"><div class="row"><h3 style="margin:0">Reflection</h3><span class="spacer"></span><span class="pill">${state.settings.shareRefl?'Shared with your Follow page':'Private to this device'}</span></div>${prompts.map((q,j)=>`<label class="f">${esc(q)}</label><textarea data-j="${j}" placeholder="Write a few honest sentences…">${esc((r.a||[])[j]||'')}</textarea>`).join('')}<div class="ctl"><button class="sbtn" id="sv">Save reflection</button><span class="note" id="svm">${r.t?'Last saved '+new Date(r.t).toLocaleString('en-GB'):''}</span></div></div>
  <div class="card"><h3>Notebook</h3><p class="note">Photograph a whiteboard issue tree, handwritten case notes or a sketch. Saved to Drive, linked to this mission.</p>${SYNC.url?`<input type="file" id="photoIn" accept="image/*" capture="environment" hidden><button class="sbtn alt" id="photoBtn">📷 Add a photo</button> <span class="note" id="photoMsg"></span><div id="thumbs"></div>`:'<p class="note">Turn on cloud sync in Settings to use the notebook.</p>'}</div>`;
  $$('#conf button',box).forEach(b=>b.onclick=()=>{state.conf[m.id]=+b.dataset.n;logEvent('confidence',m.id,'Confidence '+b.dataset.n+'/5');save();$$('#conf button',box).forEach(x=>x.classList.toggle('on',x===b))});
  $('#sv',box).onclick=()=>{const a=$$('textarea',box).map(t=>t.value.trim());if(a.join('').length<20){$('#svm',box).textContent='Write a little more first.';return}reflSave(m.id,{a,t:Date.now()});logEvent('reflect',m.id,'Reflection saved');if(markStep(m,'reflect',15))toast('📝 Reflection saved +15 XP');else toast('📝 Reflection saved');$('#svm',box).textContent='Saved '+new Date().toLocaleTimeString('en-GB')};
  if(SYNC.url)setupNotebook(m)}
function stepRead(box,m){box.innerHTML=`<div class="card reading"><h3>Reading list</h3><p class="note">Short, high-yield sources. Some HBR articles need a subscription; the library or a free monthly article usually covers it.</p>${m.read.map(r=>`<a href="${r.u}" target="_blank" rel="noopener"><b>${esc(r.t)}</b><small class="muted">${esc(r.s)}${r.n?' · '+esc(r.n):''}</small></a>`).join('')}</div>`}

/* ---------- spaced repetition (Leitner, 7 boxes) ---------- */
const IVL=[0,1,3,7,14,30,60];
function addCards(m){(m.srs||[]).forEach((c,i)=>{const k=m.id+'-'+i;if(!state.srs[k])state.srs[k]={b:0,due:Date.now()}});save()}
function cardOf(k){const [id,i]=k.split('-');const m=M[id];return m&&m.srs&&m.srs[+i]?{m,c:m.srs[+i]}:null}
function dueCards(){const now=Date.now();return Object.keys(state.srs||{}).filter(k=>state.srs[k].due<=now&&cardOf(k))}
function vReview(){const q=dueCards().sort(()=>Math.random()-.5);const total=Object.keys(state.srs).length;let i=0,n=0;
  const draw=()=>{if(i>=q.length){view().innerHTML=`<h1>Review</h1><div class="card" style="text-align:center"><div class="big">${n?'Done for now ✓':'Nothing due'}</div><p class="note">${n?`You reviewed ${n} card${n===1?'':'s'}. `:''}${total} cards in your deck. ${total?'Next due: '+nextDue():'Finish a mission’s concept cards to add some.'}</p></div>${deckTable()}`;renderTop();return}
    const {m,c}=cardOf(q[i]);view().innerHTML=`<h1>Review</h1><p class="note">${q.length-i} left · Leitner spacing: 1, 3, 7, 14, 30, 60 days</p><div class="card flash"><div class="eyebrow">${esc(m.title)}</div><div class="q" style="margin-top:8px">${c.q}</div><div class="a hide" id="ans">${c.a}</div></div><div class="ctl" id="rc"><button class="sbtn" id="show" style="flex:1">Show answer</button></div>`;
    $('#show').onclick=()=>{$('#ans').classList.remove('hide');$('#rc').innerHTML=[['Again',0],['Hard',1],['Good',2],['Easy',3]].map(([t,g])=>`<button class="sbtn ${g===2?'':'alt'}" style="flex:1" data-g="${g}">${t}</button>`).join('');$$('#rc button').forEach(b=>b.onclick=()=>{grade(q[i],+b.dataset.g);n++;i++;draw()})}};draw()}
function grade(k,g){const s=state.srs[k];if(g===0){s.b=0;s.due=Date.now()+10*60e3}else{s.b=Math.max(1,Math.min(6,s.b+(g===1?0:g===2?1:2)));s.due=Date.now()+IVL[s.b]*DAY*(g===1?.6:1)}state.reviews=(state.reviews||0)+1;logEvent('review',k.split('-')[0],['Again','Hard','Good','Easy'][g]);addXP(2)}
function nextDue(){const ds=Object.values(state.srs).map(s=>s.due).filter(d=>d>Date.now()).sort((a,b)=>a-b);return ds.length?new Date(ds[0]).toLocaleString('en-GB',{weekday:'short',hour:'2-digit',minute:'2-digit'}):'—'}
function deckTable(){const by={};Object.entries(state.srs).forEach(([k,s])=>{by[s.b]=(by[s.b]||0)+1});if(!Object.keys(by).length)return'';return`<div class="card"><h3>Your deck by box</h3><div class="grid g4 g2m">${IVL.map((d,b)=>`<div class="stat"><small>Box ${b} · ${d?d+' d':'new'}</small><b>${by[b]||0}</b></div>`).join('')}</div></div>`}

/* ---------- weekly goals ---------- */
const GDEF={missions:3,reviews:40,minutes:180,cases:1};
function goalsOf(wk){wk=wk||weekKey();if(!state.goals[wk]){const prev=Object.keys(state.goals).sort().pop();state.goals[wk]={t:Object.assign({},GDEF,prev?state.goals[prev].t:{}),items:[]}}return state.goals[wk]}
function weekProgress(){const ws=weekStart(),g=goalsOf();const L=(state.log||[]).filter(l=>l.t>=ws);let mins=0;Object.entries(state.mins||{}).forEach(([d,s])=>{if(new Date(d+'T12:00').getTime()>=ws)mins+=s/60});
  return{g,v:{missions:L.filter(l=>l.type==='complete').length,reviews:L.filter(l=>l.type==='review').length,minutes:Math.round(mins),cases:Object.values(state.cow).filter(c=>c.done&&c.t>=ws).length}}}
const GN={missions:'Missions completed',reviews:'Cards reviewed',minutes:'Minutes of focused study',cases:'Case of the week'};
function goalBars(w){const keys=Object.keys(GN);const all=keys.every(k=>w.v[k]>=w.g.t[k]);if(all&&!FOLLOW&&!state.badges.goals){state.badges.goals=Date.now();setTimeout(()=>{confetti();toast('✅ All weekly targets hit!')},500);save()}
  return keys.map(k=>`<div style="margin:8px 0"><div class="row" style="font-size:.88rem"><span>${GN[k]}</span><span class="spacer"></span><b>${w.v[k]} / ${w.g.t[k]}</b></div><div class="prog"><i style="width:${Math.min(100,w.v[k]/Math.max(1,w.g.t[k])*100)}%"></i></div></div>`).join('')+(w.g.items.length?`<small class="muted">${w.g.items.filter(x=>x.done).length}/${w.g.items.length} personal goals done</small>`:'')}
function vGoals(){const w=weekProgress(),g=w.g;
  view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Weekly goals</h1><p class="note">Week of ${new Date(weekStart()).toLocaleDateString('en-GB',{day:'numeric',month:'long'})}. Targets carry forward to next week.</p>
  <div class="card"><h3>Progress</h3>${goalBars(w)}</div>
  <div class="card"><h3>Targets</h3><div class="grid g2">${Object.keys(GN).map(k=>`<div><label class="f">${GN[k]}</label><input class="tin" type="number" min="0" inputmode="numeric" data-k="${k}" value="${g.t[k]}"></div>`).join('')}</div></div>
  <div class="card"><h3>Personal goals this week</h3><p class="note">E.g. "Rebuild Monday's storyline using the pyramid", "Ask my manager for feedback on one slide".</p><div id="gl">${g.items.map((x,i)=>`<div class="goal ${x.done?'done':''}"><input type="checkbox" data-i="${i}" ${x.done?'checked':''}><span>${esc(x.t)}</span><button class="sbtn alt sm" data-d="${i}">✕</button></div>`).join('')||'<p class="note">No personal goals yet.</p>'}</div><div class="ctl"><input class="tin" id="ng" placeholder="Add a goal" style="flex:1"><button class="sbtn" id="ag">Add</button></div></div>`;
  $$('input[data-k]').forEach(x=>x.onchange=()=>{g.t[x.dataset.k]=Math.max(0,+x.value||0);save();vGoals()});
  $$('#gl input[type=checkbox]').forEach(x=>x.onchange=()=>{g.items[+x.dataset.i].done=x.checked;if(x.checked){addXP(10);logEvent('goal','week',g.items[+x.dataset.i].t)}save();vGoals()});
  $$('#gl [data-d]').forEach(x=>x.onclick=()=>{g.items.splice(+x.dataset.d,1);save();vGoals()});
  const add=()=>{const v=$('#ng').value.trim();if(!v)return;g.items.push({t:v,done:false});save();vGoals()};$('#ag').onclick=add;$('#ng').onkeydown=e=>{if(e.key==='Enter')add()}}

/* ---------- case of the week ---------- */
function currentCase(){if(!CASES.length)return null;const w=Math.floor((weekStart()-weekStart(Date.UTC(2026,9,5)))/(7*DAY));return CASES[((w%CASES.length)+CASES.length)%CASES.length]}
function vCase(id){const cur=currentCase();const c=id?CASES.find(x=>x.id===id):cur;if(!c){view().innerHTML='<h1>Case of the week</h1><p>No cases yet.</p>';return}const st=state.cow[c.id]||{};
  view().innerHTML=`<div class="row"><div class="eyebrow">${c===cur?'Case of the week':'Case archive'}</div><span class="spacer"></span><select id="arch" class="tin" style="width:auto;padding:6px 8px;font-size:.85rem">${CASES.map(x=>`<option value="${x.id}" ${x===c?'selected':''}>${esc(x.title)}${x===cur?' (this week)':''}${(state.cow[x.id]||{}).done?' ✓':''}</option>`).join('')}</select></div>
  <h1 style="margin-top:8px">${esc(c.title)}</h1><p class="note" style="margin-top:0">${esc(c.byline)}</p>
  <div class="card casebody">${c.body}</div>
  ${c.exhibits.map((e,i)=>`<div class="card"><div class="eyebrow">Exhibit ${i+1}</div><h3 style="margin-top:4px">${e.t}</h3><div class="tablewrap">${e.h}</div>${e.s?`<small class="muted">${e.s}</small>`:''}</div>`).join('')}
  <div class="card"><h2>Discussion questions</h2><p class="note">Write your answer to each, as if preparing for class. Then reveal the teaching note and tick the points you covered.</p><div id="dq"></div></div>`;
  $('#arch').onchange=e=>go('#/case/'+e.target.value);
  const dq=$('#dq');const answers=st.answers||[];const ticks=st.ticks||{};
  dq.innerHTML=c.questions.map((q,i)=>`<div style="margin:14px 0" data-i="${i}"><h3 style="font-family:var(--sans);font-size:1rem">${i+1}. ${q.q}</h3><textarea data-a="${i}" placeholder="Your answer…">${esc(answers[i]||'')}</textarea><div class="ctl"><button class="sbtn alt sm" data-r="${i}">${st.revealed&&st.revealed[i]?'Hide':'Reveal'} teaching note</button></div><div class="model ${st.revealed&&st.revealed[i]?'':'hide'}" id="tn${i}"><b>Teaching note.</b> ${q.note}<div class="rubric" style="margin-top:6px">${q.pts.map((p,j)=>`<label><input type="checkbox" data-t="${i}-${j}" ${ticks[i+'-'+j]?'checked':''}><span>${p}</span></label>`).join('')}</div></div></div>`).join('')+`<div class="ctl"><button class="sbtn gold" id="cfin">${st.done?'Update my score':'Finish the case'}</button><span class="note" id="cmsg">${st.done?'Scored '+Math.round(st.score*100)+'% · '+new Date(st.t).toLocaleDateString('en-GB'):''}</span></div>`;
  const persist=()=>{const s=state.cow[c.id]=state.cow[c.id]||{};s.answers=$$('textarea[data-a]',dq).map(t=>t.value);s.ticks={};$$('input[data-t]',dq).forEach(x=>{if(x.checked)s.ticks[x.dataset.t]=1});save()};
  $$('textarea[data-a]',dq).forEach(t=>t.onchange=persist);$$('input[data-t]',dq).forEach(x=>x.onchange=persist);
  $$('[data-r]',dq).forEach(b=>b.onclick=()=>{const i=+b.dataset.r;const s=state.cow[c.id]=state.cow[c.id]||{};s.revealed=s.revealed||{};if(!(s.answers||[])[i]&&!$(`textarea[data-a="${i}"]`,dq).value.trim()&&!s.revealed[i]){toast('Write your answer first — that is the point of the case method.');return}s.revealed[i]=!s.revealed[i];persist();$('#tn'+i).classList.toggle('hide',!s.revealed[i]);b.textContent=(s.revealed[i]?'Hide':'Reveal')+' teaching note'});
  $('#cfin').onclick=()=>{persist();const s=state.cow[c.id];const tot=c.questions.reduce((a,q)=>a+q.pts.length,0);const got=Object.keys(s.ticks||{}).length;const allAns=c.questions.every((_,i)=>(s.answers[i]||'').trim().length>15);if(!allAns){toast('Answer every question first.');return}const first=!s.done;s.score=got/tot;s.done=true;s.t=Date.now();logEvent('case',c.id,'Case of the week: '+c.title+' ('+Math.round(s.score*100)+'%)');save();if(first){addXP(60);confetti();toast('📘 Case complete +60 XP')}$('#cmsg').textContent='Scored '+Math.round(s.score*100)+'%';checkBadges()}}

/* ---------- more, badges, journal ---------- */
function vMore(){view().innerHTML=`<h1>More</h1><div class="grid g2">
  ${[['family','👥','Family','Standings for Majed, Mohammed, Lamess and Lena'],['goals','✅','Weekly goals','Targets and personal goals for this week'],['badges','🏅','Badges','What you have earned so far'],['rooms','🌐','Online rooms','Case Sprint duel and partner case practice'],['journal','📝','Reflections','Everything you have written, by mission'],['settings','⚙︎','Settings','Sync, theme, privacy, backup']].map(([h,e,t,s])=>`<div class="card tcard" onclick="go('#/${h}')"><div class="row"><span class="ico">${e}</span><div><h3 style="margin:0">${t}</h3><small class="muted">${s}</small></div></div></div>`).join('')}</div>
  <div class="card"><div class="row">${avatar(USER,36)}<div><b>${esc(profName(USER))}</b><br><small class="muted">Signed in on this device</small></div><span class="spacer"></span><button class="sbtn alt" id="swp">Switch profile</button></div></div><div class="card"><h3>Sync status</h3><p class="note" id="syncStat">${SYNC.url?'Cloud sync on':'Cloud sync is off'}</p></div>`;$('#swp').onclick=()=>{try{localStorage.removeItem('launchpad-user')}catch(e){}location.hash='';location.reload()};if(SYNC.url)pullState()}
function vBadges(){view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Badges</h1><div class="badgegrid">${BADGES.map(([k,e,n])=>`<div class="bdg ${state.badges[k]?'on':''}"><div class="e">${e}</div><small>${n}${state.badges[k]?'<br><span class="muted">'+new Date(state.badges[k]).toLocaleDateString('en-GB')+'</span>':''}</small></div>`).join('')}</div>`}
function vJournal(){const r=reflStore();const ids=Object.keys(r).filter(id=>M[id]).sort((a,b)=>r[b].t-r[a].t);
  view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Reflections</h1><p class="note">${state.settings.shareRefl?'Shared: these sync to your Follow page.':'Private: stored only on this device. Change in Settings.'}</p>${ids.map(id=>{const m=M[id];const p=m.reflect||['Most useful idea','Where I will apply it','Still unclear'];return`<div class="card"><div class="row"><h3 style="margin:0">${esc(m.title)}</h3><span class="spacer"></span><small class="muted">${new Date(r[id].t).toLocaleDateString('en-GB')}</small></div>${r[id].a.map((a,j)=>a?`<p><b class="muted" style="font-size:.85rem">${esc(p[j]||'')}</b><br>${esc(a)}</p>`:'').join('')}</div>`}).join('')||'<p class="note">No reflections yet.</p>'}`}

/* ---------- settings ---------- */
function linkFor(page){const b=btoa(unescape(encodeURIComponent(JSON.stringify({u:SYNC.url,k:SYNC.key}))));return location.origin+location.pathname.replace(/[^/]*$/,'')+page+'#sync='+b}
function vSettings(){view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Settings</h1>
  <div class="card"><h3>Profile</h3><div class="row">${avatar(USER,40)}<b>${esc(profName(USER))}</b></div><label class="f">PIN lock (optional, 4–8 digits). A light family lock, not real security.</label><div class="ctl"><input class="tin" id="pinN" type="password" inputmode="numeric" maxlength="8" placeholder="${state.pin?'PIN is set — type a new one to change':'No PIN'}" style="flex:1"><button class="sbtn alt" id="pinS">${state.pin?'Change PIN':'Set PIN'}</button>${state.pin?'<button class="sbtn alt" id="pinR">Remove</button>':''}</div><div class="ctl"><button class="sbtn alt" id="thm">Switch light / dark</button></div></div>
  <div class="card"><h3>Cloud sync</h3><p class="note">Progress saves to a Google Sheet so it follows you across Mac, iPhone and iPad.</p><label class="f">Apps Script web-app URL</label><input class="tin" id="syncUrl" value="${esc(SYNC.url)}" placeholder="https://script.google.com/macros/s/…/exec"><label class="f">Secret key</label><input class="tin" id="syncKey" value="${esc(SYNC.key)}"><div class="ctl"><button class="sbtn" id="ssv">Save & sync</button><span class="note" id="syncStat">${SYNC.url?'Cloud sync on':'Cloud sync is off'}</span></div>
  ${SYNC.url?`<label class="f">Link for your other devices (opens the app already connected)</label><div class="ctl"><input class="tin" readonly id="dl" value="${linkFor('index.html')}" style="flex:1"><button class="sbtn alt sm" data-c="dl">Copy</button></div><label class="f">Read-only Follow link (view anyone's progress without signing in)</label><div class="ctl"><input class="tin" readonly id="fl" value="${linkFor('follow.html')}" style="flex:1"><button class="sbtn alt sm" data-c="fl">Copy</button></div>`:''}</div>
  <div class="card"><h3>Privacy</h3><p class="note">The Follow page shows XP, mission scores, confidence ratings, weekly goals, time and activity. Reflections are your choice.</p><label class="goal"><input type="checkbox" id="shr" ${state.settings.shareRefl?'checked':''}><span>Share my written reflections on the Follow page</span></label></div>
  <div class="card"><h3>Backup</h3><div class="ctl"><button class="sbtn alt" id="exp">Download backup (.json)</button><button class="sbtn alt" id="imp">Restore from backup</button><input type="file" id="impf" accept="application/json" hidden></div></div>
  <p class="note">Majed's Launchpad · build ${BUILD}</p>`;
  $('#pinS').onclick=()=>{const p=$('#pinN').value.trim();if(!/^\d{4,8}$/.test(p)){toast('Use 4 to 8 digits');return}state.pin=pinHash(p);try{localStorage.setItem('launchpad-unlocked-'+USER,state.pin)}catch(e){}save();toast('PIN set');vSettings()};const pr=$('#pinR');if(pr)pr.onclick=()=>{delete state.pin;save();toast('PIN removed');vSettings()};$('#thm').onclick=toggleTheme;$('#ssv').onclick=()=>{saveSyncSettings();setTimeout(vSettings,1200)};
  $$('[data-c]').forEach(b=>b.onclick=()=>{const i=$('#'+b.dataset.c);i.select();try{navigator.clipboard.writeText(i.value)}catch(e){document.execCommand('copy')}toast('Link copied')});
  $('#shr').onchange=e=>{setShareRefl(e.target.checked);toast(e.target.checked?'Reflections will sync':'Reflections are private to this device')};
  $('#exp').onclick=()=>{const blob=new Blob([JSON.stringify({state,refl:reflStore()},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='launchpad-backup-'+today()+'.json';a.click()};
  $('#imp').onclick=()=>$('#impf').click();$('#impf').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(!j.state)throw 0;state=j.state;ensure();if(j.refl&&!state.settings.shareRefl)localStorage.setItem(RKEY,JSON.stringify(j.refl));save();toast('Backup restored');route()}catch(err){toast('That file is not a Launchpad backup')}}}

/* ---------- follow (read-only parent view) ---------- */
function renderParent(){const L=level(state.xp||0);const w=weekProgress();const last=(state.log||[]).slice(-1)[0];const r=state.settings.shareRefl?state.refl:{};
  view().innerHTML=`<div class="chips" style="margin-bottom:10px">${USERS.map(u=>`<button class="chip ${u.id===USER?'on':''}" data-fu="${u.id}">${u.name}</button>`).join('')}</div><div class="followbar">Read-only view of ${esc(profName(USER))}'s progress · ${state.savedAt?'last synced '+new Date(state.savedAt).toLocaleString('en-GB'):'waiting for data'} · <span id="syncStat"></span></div>
  <h1>${esc(profName(USER))}'s Launchpad</h1>
  <div class="grid g4 g2m" style="margin:12px 0"><div class="stat"><small>Level</small><b>${L.name}</b><small>${fmt(state.xp)} XP</small></div><div class="stat"><small>Streak</small><b>${streak()}</b><small>days</small></div><div class="stat"><small>Missions</small><b>${done().length}/62</b><small>completed</small></div><div class="stat"><small>Last active</small><b style="font-size:1.05rem">${last?new Date(last.t).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'—'}</b><small>${last?new Date(last.t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):''}</small></div></div>
  <div class="grid g2"><div class="card"><h3>This week</h3>${goalBars(w)}${w.g.items.length?'<ul>'+w.g.items.map(x=>`<li>${x.done?'✅':'⬜'} ${esc(x.t)}</li>`).join('')+'</ul>':''}</div>
  <div class="card"><h3>Tracks</h3>${TRACKS.map(t=>{const s=trackStats(t.id);return`<div style="margin:8px 0"><div class="row" style="font-size:.9rem"><span>${t.ico} ${t.name}</span><span class="spacer"></span><b>${s.d}/${s.n}</b></div><div class="prog"><i style="width:${s.d/s.n*100}%"></i></div></div>`}).join('')}</div></div>
  <div class="card"><h3>Missions</h3><div class="tablewrap"><table class="t"><tr><th>Mission</th><th>Status</th><th>Test</th><th>Confidence</th><th>Minutes</th></tr>${Object.keys(state.progress).filter(id=>M[id]).sort().map(id=>{const p=state.progress[id];return`<tr><td>${esc(M[id].title)}</td><td>${p.status==='completed'?'✅':'…'}</td><td>${p.steps&&p.steps.test?Math.round((p.best||0)*100)+'%':'—'}</td><td>${state.conf[id]?state.conf[id]+'/5':'—'}</td><td>${Math.round((state.time[id]||0)/60)}</td></tr>`}).join('')||'<tr><td colspan=5>No missions started yet.</td></tr>'}</table></div></div>
  <div class="card"><h3>Cases of the week</h3>${Object.entries(state.cow).filter(([k,v])=>v.done).map(([k,v])=>`<div>${esc((CASES.find(c=>c.id===k)||{}).title||k)} · ${Math.round(v.score*100)}%</div>`).join('')||'<p class="note">None finished yet.</p>'}</div>
  ${Object.keys(r).length?`<div class="card"><h3>Reflections (shared)</h3>${Object.keys(r).filter(id=>M[id]).map(id=>`<p><b>${esc(M[id].title)}</b><br>${r[id].a.filter(Boolean).map(esc).join('<br>')}</p>`).join('')}</div>`:''}
  <div class="card"><h3>Family standings</h3><div id="famF"></div></div><div class="card"><h3>Recent activity</h3>${(state.log||[]).filter(l=>!['quiz','learn','lab','test','start'].includes(l.type)).slice(-25).reverse().map(l=>`<div class="note">${new Date(l.t).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · ${esc(l.type)} · ${esc(l.detail||'')}</div>`).join('')||'<p class="note">No activity yet.</p>'}</div>`;
  $('#tabs').classList.add('hide');renderTop();$$('[data-fu]').forEach(b=>b.onclick=()=>{try{localStorage.setItem('launchpad-follow-user',b.dataset.fu)}catch(e){}location.reload()});const fb=$('#famF');if(fb&&!fb.dataset.done){fb.dataset.done=1;familyTable(fb)}}

/* ---------- small widgets used by labs ---------- */
function numIn(id,label,val,o={}){return`<div><label class="f" for="${id}">${label}</label><input class="tin" type="number" inputmode="decimal" id="${id}" value="${val}" ${o.step?`step="${o.step}"`:'step="any"'} ${o.min!=null?`min="${o.min}"`:''}></div>`}
const V=(id,r=document)=>{const x=$('#'+id,r);return x?parseFloat(x.value)||0:0};
function bars(data,o={}){/* data:[{l,v,c}] */const W=560,H=o.h||220,pad=34,bw=(W-pad*2)/data.length;const mx=Math.max(...data.map(d=>Math.abs(d.v)),1e-9)*1.15;const mn=Math.min(0,...data.map(d=>d.v))*1.15;const y=v=>H-24-(v-mn)/(mx-mn)*(H-40);
  return`<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img"><line x1="${pad}" x2="${W-pad}" y1="${y(0)}" y2="${y(0)}" stroke="var(--line)"/>${data.map((d,i)=>{const x=pad+i*bw+bw*.15,h=Math.abs(y(d.v)-y(0));return`<rect x="${x}" y="${Math.min(y(d.v),y(0))}" width="${bw*.7}" height="${Math.max(1,h)}" rx="3" fill="${d.c||'var(--gold2)'}"/><text x="${x+bw*.35}" y="${Math.min(y(d.v),y(0))-5}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${o.f?o.f(d.v):fmt(d.v)}</text><text x="${x+bw*.35}" y="${H-8}" text-anchor="middle">${esc(d.l)}</text>`}).join('')}</svg></div>`}

/* ---------- boot ---------- */
function boot(){applyTheme();
  if(location.hash.startsWith('#sync=')){try{const o=JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(6)))));if(o.u){SYNC={url:o.u,key:o.k||''};localStorage.setItem('launchpad-sync',JSON.stringify(SYNC))}}catch(e){}history.replaceState(null,'',location.pathname+(FOLLOW?'':'#/home'))}
  if(FOLLOW){parentMode=true;window.save=()=>{};window.schedulePush=()=>{};window.pushState=async()=>{};window.addXP=()=>{};$('#themeBtn').onclick=toggleTheme;route();if(SYNC.url){pullState().then(route);setInterval(()=>pullState().then(route),60000)}else view().innerHTML='<div class="card"><h2>Follow link needed</h2><p>Open the Follow link Majed shares from Settings → Cloud sync.</p></div>';return}
  const mb=$('#meBtn');if(mb)mb.onclick=()=>go('#/more');$('#themeBtn').onclick=toggleTheme;$$('#tabs button').forEach(b=>b.onclick=()=>go('#/'+b.dataset.v));
  addEventListener('hashchange',route);route();renderTop();
  if(SYNC.url){setSyncStatus('busy','');pullState()}else setSyncStatus('off','Cloud sync is off');
  addEventListener('visibilitychange',()=>{if(!document.hidden&&SYNC.url)pullState()})}
