/* ================= CFA study tracker: coverage of the official 2027 outline, per-module progress, hours, mocks, readiness ================= */
const SLV=['cfa1','cfa2','cfa3'],SLN={cfa1:'Level I',cfa2:'Level II',cfa3:'Level III'},HOURS=300;
function cst(){if(!state.cfa)state.cfa={};const c=state.cfa;c.lv=c.lv||'cfa1';c.pw=c.pw||state.cfaPath||'pm';c.m=c.m||{};c.hrs=c.hrs||[];c.mk=c.mk||[];c.date=c.date||{};return c}
const wmid=w=>(w[0]+w[1])/2;
function modList(lv,pw){const O=CFAO[lv],out=[];O.topics.forEach(t=>t.m.forEach((m,i)=>out.push({id:`${lv}:${t.k}:${i}`,tk:t.k,tn:t.n,w:t.w,t:m[0],n:m[1]})));
  if(lv==='cfa3'){const P=O.paths[pw];P.m.forEach((m,i)=>out.push({id:`cfa3:${pw}:${i}`,tk:'path',tn:'Pathway: '+P.n,w:O.pathW,t:m[0],n:m[1]}))}return out}
function topicsOf(lv,pw){const O=CFAO[lv],T=O.topics.map(t=>({k:t.k,n:t.n,w:t.w}));if(lv==='cfa3')T.push({k:'path',n:'Pathway: '+O.paths[pw].n,w:O.pathW});return T}

function modScore(e){if(!e)return 0;const acc=e.q?e.c/e.q:0,vol=Math.min(1,(e.q||0)/20),s=.35*(e.r?1:0)+.45*acc*vol+.2*((e.cf||0)/5);return e.t&&Date.now()-e.t>45*DAY?s*.85:s}
function studyStats(lv,pw){const c=cst(),L=modList(lv,pw),T=topicsOf(lv,pw);const by={};T.forEach(t=>by[t.k]={...t,mods:[],read:0,q:0,c:0,sc:0});
  L.forEach(m=>{const e=c.m[m.id]||{},b=by[m.tk];b.mods.push(m);if(e.r)b.read++;b.q+=e.q||0;b.c+=e.c||0;b.sc+=modScore(e)});
  T.forEach(t=>{const b=by[t.k];b.mastery=b.mods.length?b.sc/b.mods.length:0});
  const tw=T.reduce((s,t)=>s+wmid(t.w),0),ready=T.reduce((s,t)=>s+wmid(t.w)*by[t.k].mastery,0)/tw;
  const read=L.filter(m=>(c.m[m.id]||{}).r).length,loT=L.reduce((s,m)=>s+m.n,0),loR=L.filter(m=>(c.m[m.id]||{}).r).reduce((s,m)=>s+m.n,0);
  const q=L.reduce((s,m)=>s+((c.m[m.id]||{}).q||0),0),cc=L.reduce((s,m)=>s+((c.m[m.id]||{}).c||0),0);
  const hrs=c.hrs.filter(h=>h[2]===lv).reduce((s,h)=>s+h[1],0);const mk=c.mk.filter(x=>x[1]===lv).sort((a,b)=>a[0]-b[0]);
  const mkAvg=mk.length?mk.slice(-2).reduce((s,x)=>s+x[2],0)/Math.min(2,mk.length)/100:null;
  const combined=mkAvg==null?ready:.6*ready+.4*mkAvg;
  return{L,T,by,ready,combined,mkAvg,mk,read,total:L.length,loT,loR,q,c:cc,hrs}}
function weeksLeft(lv){const d=cst().date[lv];if(!d)return null;const ms=new Date(d+'T09:00:00')-Date.now();return ms/(7*DAY)}
function vStudy(lvArg){const c=cst();if(lvArg&&CFAO[lvArg]&&c.lv!==lvArg){c.lv=lvArg;save()}const lv=c.lv,pw=c.pw,S=studyStats(lv,pw),col=tcol(lv);
  const wl=weeksLeft(lv),need=wl&&wl>0?Math.max(0,(HOURS-S.hrs)/wl):null;
  const band=x=>x>=.7?'var(--ok)':x>=.5?'var(--gold2)':'var(--bad)';
  const focus=S.L.map(m=>{const e=c.m[m.id]||{},b=S.by[m.tk];return{m,e,pri:wmid(m.w)/b.mods.length*(1-modScore(e))}}).sort((a,b)=>b.pri-a.pri).slice(0,6);
  const due=S.L.map(m=>({m,e:c.m[m.id]||{}})).filter(x=>x.e.r&&x.e.t&&Date.now()-x.e.t>30*DAY).sort((a,b)=>a.e.t-b.e.t).slice(0,6);
  const appM=k=>Object.values(M).filter(m=>m.track===lv&&(m.topic===k)).map(m=>`<a href="#/m/${m.id}">${m.id}</a>`).join(' ');
  const wk=[...Array(8)].map((_,i)=>{const end=Date.now()-(7-i)*7*DAY+7*DAY,start=end-7*DAY;return c.hrs.filter(h=>h[2]===lv&&h[0]>=start&&h[0]<end).reduce((s,h)=>s+h[1],0)}),wmx=Math.max(10,...wk);
  view().innerHTML=`<div style="--tc:${col.c}"><a href="#/tracks" class="note">← Tracks</a><div class="mhead"><span class="tile">${ico('target',28)}</span><div><div class="eyebrow">CFA study tracker · 2027 curriculum</div><h1 style="margin:2px 0">${SLN[lv]}</h1><p class="note" style="margin:0">${CFAO[lv].fmt}. Coverage is measured against every learning module in CFA Institute's published 2027 outline.</p></div></div>
  <div class="chips" style="margin:8px 0">${SLV.map(k=>`<button class="chip ${k===lv?'on':''}" data-lv="${k}">${SLN[k]}</button>`).join('')}${lv==='cfa3'?`<select class="tin" id="spw" style="max-width:220px;margin-left:6px">${Object.entries(CFAO.cfa3.paths).map(([k,p])=>`<option value="${k}" ${k===pw?'selected':''}>${p.n} pathway</option>`).join('')}</select>`:''}</div>
  <div class="grid g4 g2m" style="margin:10px 0">
   <div class="stat"><small>Readiness</small><b style="color:${band(S.combined)}">${Math.round(S.combined*100)}%</b><small>${S.mkAvg==null?'from module progress':'60% modules + 40% recent mocks'}</small></div>
   <div class="stat"><small>Coverage</small><b>${S.read}/${S.total}</b><small>modules read · ${Math.round(S.loR/S.loT*100)}% of outcomes</small></div>
   <div class="stat"><small>Practice accuracy</small><b>${S.q?Math.round(S.c/S.q*100)+'%':'—'}</b><small>${fmt(S.q)} questions logged</small></div>
   <div class="stat"><small>Study hours</small><b>${fmt(S.hrs,1)}/${HOURS}</b><small>${need!=null?fmt(need,1)+' h/week to exam':'set your exam date'}</small></div></div>
  <div class="grid g2">
  <div class="card"><h3>Log a study session</h3><div class="grid g2">
    <div><label class="f">Date</label><input class="tin" type="date" id="sd" value="${new Date().toISOString().slice(0,10)}"></div>
    <div><label class="f">Hours</label><input class="tin" type="number" step="0.25" min="0" id="sh" value="1.5"></div></div>
   <label class="f">Learning module (optional)</label><select class="tin" id="sm"><option value="">— general study —</option>${S.T.map(t=>`<optgroup label="${esc(t.n)}">${S.L.filter(m=>m.tk===t.k).map(m=>`<option value="${m.id}">${esc(m.t)}</option>`).join('')}</optgroup>`).join('')}</select>
   <div class="grid g3"><div><label class="f">Questions done</label><input class="tin" type="number" min="0" id="sq" value="0"></div><div><label class="f">Correct</label><input class="tin" type="number" min="0" id="sc" value="0"></div><div><label class="f">Read in curriculum?</label><select class="tin" id="sr"><option value="">no change</option><option value="1">Yes, finished</option></select></div></div>
   <div class="ctl"><button class="sbtn" id="slog">Save session</button><span class="note" id="smsg"></span></div>
   <p class="note">Log practice from the CFA Institute Learning Ecosystem or your prep provider, by module, so accuracy and coverage reflect real exam preparation.</p></div>
  <div class="card"><h3>Exam date and mocks</h3><label class="f">Planned ${SLN[lv]} exam date</label><input class="tin" type="date" id="sxd" value="${c.date[lv]||''}">
   <p class="note">${wl!=null?(wl>0?`${Math.ceil(wl*7)} days left.`:'Exam date has passed.'):'Set the date to see the weekly pace you need.'}</p>
   <label class="f">Log a full mock exam (score %)</label><div class="row"><input class="tin" type="number" min="0" max="100" id="mks" placeholder="e.g. 68" style="max-width:110px"><select class="tin" id="mksrc" style="max-width:220px"><option>CFA Institute mock</option><option>CFA Institute practice pack</option><option>Prep provider mock</option><option>Launchpad simulator</option></select><button class="sbtn" id="mkb">Add</button></div>
   ${S.mk.length?`<div class="tablewrap" style="margin-top:8px"><table class="t"><tr><th>Date</th><th>Source</th><th>Score</th></tr>${S.mk.slice(-6).reverse().map(x=>`<tr><td>${new Date(x[0]).toLocaleDateString('en-GB')}</td><td>${esc(x[3])}</td><td><b style="color:${band(x[2]/100)}">${x[2]}%</b></td></tr>`).join('')}</table></div>`:'<p class="note">No mocks logged yet. Full timed mocks are the best single readiness signal; most candidates aim for 70%+ on quality mocks in the final weeks.</p>'}</div></div>
  <div class="grid g2">
  <div class="card"><h3>Focus next</h3><p class="note">Highest exam weight per module, least mastered.</p>${focus.map(x=>`<div class="row" style="padding:6px 0;border-bottom:1px dashed var(--line);flex-wrap:nowrap"><span style="font-size:.92rem;flex:1;min-width:0">${esc(x.m.t)}<br><small class="muted">${esc(x.m.tn)} · ${x.m.n} outcomes</small></span><span class="spacer"></span><small>${Math.round(modScore(x.e)*100)}%</small></div>`).join('')}</div>
  <div class="card"><h3>Due for review</h3><p class="note">Read modules not revisited for 30+ days. Mastery decays after 45 days.</p>${due.length?due.map(x=>`<div class="row" style="padding:6px 0;border-bottom:1px dashed var(--line);flex-wrap:nowrap"><span style="font-size:.92rem;flex:1;min-width:0">${esc(x.m.t)}<br><small class="muted">last ${new Date(x.e.t).toLocaleDateString('en-GB')}</small></span><span class="spacer"></span><button class="sbtn sm alt" data-rv="${x.m.id}">Reviewed</button></div>`).join(''):'<p class="note">Nothing due.</p>'}</div></div>
  <div class="card"><h3>Weekly hours (last 8 weeks)</h3><div style="display:flex;gap:6px;align-items:flex-end;height:110px">${wk.map((h,i)=>`<div style="flex:1;text-align:center"><div style="height:${h/wmx*90}px;background:var(--tc);border-radius:4px 4px 0 0;min-height:2px" title="${fmt(h,1)} h"></div><small class="muted">${fmt(h,0)}</small></div>`).join('')}</div><p class="note">${HOURS} hours per level is CFA Institute's average guidance: about 15 hours a week over 20 weeks.</p></div>
  <div class="card"><h3>Coverage by topic</h3><p class="note">Tap a topic to update each learning module. Mastery = 35% read + 45% practice accuracy (full credit from 20 questions) + 20% confidence.</p>
  ${S.T.map(t=>{const b=S.by[t.k];return`<details class="exhibit" style="margin:8px 0"><summary><div class="row" style="display:inline-flex;width:calc(100% - 20px)"><b style="font-size:.95rem">${esc(t.n)}</b><span class="spacer"></span><small class="muted">${t.w[0]}–${t.w[1]}%</small></div><div class="row note" style="margin-top:4px"><span>read ${b.read}/${b.mods.length}</span><span>·</span><span>accuracy ${b.q?Math.round(b.c/b.q*100)+'% ('+b.q+')':'—'}</span><span class="spacer"></span><b style="color:${band(b.mastery)}">${Math.round(b.mastery*100)}%</b></div><div class="prog" style="margin:4px 0 0"><i style="width:${b.mastery*100}%;background:${band(b.mastery)}"></i></div></summary>
   ${appM(t.k)?`<p class="note">Launchpad reinforcement: ${appM(t.k)}</p>`:''}
   <div class="tablewrap"><table class="t"><tr><th>Learning module</th><th>Read</th><th>Practice</th><th>Confidence</th></tr>${b.mods.map(m=>{const e=c.m[m.id]||{};return`<tr><td style="min-width:180px">${esc(m.t)}<br><small class="muted">${m.n} outcomes${e.t?' · '+new Date(e.t).toLocaleDateString('en-GB'):''}</small></td><td><input type="checkbox" data-rd="${m.id}" ${e.r?'checked':''} style="width:20px;height:20px"></td><td>${e.q?`${e.c}/${e.q}`:'—'}</td><td><select class="tin" data-cf="${m.id}" style="padding:4px;min-width:58px">${['–',1,2,3,4,5].map((v,j)=>`<option value="${j}" ${(e.cf||0)===j?'selected':''}>${v}</option>`).join('')}</select></td></tr>`}).join('')}</table></div></details>`}).join('')}</div>
  <div class="card"><h3>How to use this honestly</h3><p class="note">Launchpad's Investment Foundations missions reinforce concepts; they are not a substitute for the official curriculum. Read each module in the CFA Institute Learning Ecosystem, do its practice questions, then log them here. Treat readiness as a guide: CFA Institute does not publish a minimum passing score. <a href="${CFAO_SRC[lv]}" target="_blank" rel="noopener">Official ${SLN[lv]} outline and weights</a>.</p></div></div>`;
  const touch=id=>{c.m[id]=c.m[id]||{};return c.m[id]};
  $$('[data-lv]').forEach(b=>b.onclick=()=>{c.lv=b.dataset.lv;save();vStudy()});
  const sp=$('#spw');if(sp)sp.onchange=()=>{c.pw=sp.value;state.cfaPath=sp.value;save();vStudy()};
  $$('[data-rd]').forEach(x=>x.onchange=()=>{const e=touch(x.dataset.rd);e.r=x.checked?1:0;e.t=Date.now();save();logEvent('study','',(x.checked?'Read: ':'Unread: ')+modName(x.dataset.rd));keepOpen()});
  $$('[data-cf]').forEach(x=>x.onchange=()=>{const e=touch(x.dataset.cf);e.cf=+x.value;e.t=Date.now();save();keepOpen()});
  $$('[data-rv]').forEach(x=>x.onclick=()=>{touch(x.dataset.rv).t=Date.now();save();logEvent('study','','Reviewed: '+modName(x.dataset.rv));vStudy()});
  $('#sxd').onchange=e=>{c.date[lv]=e.target.value;save();vStudy()};
  $('#mkb').onclick=()=>{const s=parseFloat($('#mks').value);if(!(s>=0&&s<=100)){toast('Enter a score from 0 to 100');return}c.mk.push([Date.now(),lv,Math.round(s),$('#mksrc').value]);save();logEvent('mock','',`${SLN[lv]} mock (${$('#mksrc').value}): ${Math.round(s)}%`);addXP(25);vStudy()};
  $('#slog').onclick=()=>{const h=parseFloat($('#sh').value)||0,q=parseInt($('#sq').value)||0,k=parseInt($('#sc').value)||0,mid_=$('#sm').value,rd=$('#sr').value;
    if(k>q){$('#smsg').textContent='Correct cannot exceed questions done.';return}if(!h&&!q&&!rd){$('#smsg').textContent='Nothing to save yet.';return}
    if(q&&!mid_){$('#smsg').textContent='Choose the module the questions belong to.';return}
    const ts=new Date($('#sd').value+'T12:00:00').getTime()||Date.now();if(h)c.hrs.push([ts,h,lv,mid_]);
    if(mid_){const e=touch(mid_);if(q){e.q=(e.q||0)+q;e.c=(e.c||0)+k}if(rd)e.r=1;e.t=Date.now()}
    if(c.hrs.length>1500)c.hrs=c.hrs.slice(-1500);save();logEvent('study','',`${SLN[lv]}: ${h} h${mid_?' · '+modName(mid_):''}${q?` · ${k}/${q} correct`:''}`);if(h)addXP(Math.round(10*h));toast('Session saved');vStudy()};
  function keepOpen(){const open=$$('details.exhibit').map((d,i)=>d.open?i:-1).filter(i=>i>=0),y=scrollY;vStudy();$$('details.exhibit').forEach((d,i)=>{if(open.includes(i))d.open=true});scrollTo(0,y)}}
function modName(id){const [lv,tk,i]=id.split(':');if(tk==='pm'||tk==='pmk'||tk==='pw'){if(lv==='cfa3'&&CFAO.cfa3.paths[tk])return CFAO.cfa3.paths[tk].m[+i][0]}const t=CFAO[lv].topics.find(t=>t.k===tk);return t?t.m[+i][0]:id}
/* compact summary for the Follow page and home */
function studySummaryHTML(st){const c=st.cfa;if(!c||!(Object.keys(c.m||{}).length||(c.hrs||[]).length||(c.mk||[]).length))return'';const save0=state;let html='';
  try{state=st;const lv=c.lv||'cfa1',S=studyStats(lv,c.pw||'pm'),wk=(c.hrs||[]).filter(h=>h[0]>Date.now()-7*DAY).reduce((s,h)=>s+h[1],0),wl=weeksLeft(lv);
   html=`<div class="card"><h3>CFA study (${SLN[lv]}, 2027 outline)</h3><div class="grid g4 g2m"><div class="stat"><small>Readiness</small><b>${Math.round(S.combined*100)}%</b></div><div class="stat"><small>Modules read</small><b>${S.read}/${S.total}</b></div><div class="stat"><small>Accuracy</small><b>${S.q?Math.round(S.c/S.q*100)+'%':'—'}</b><small>${fmt(S.q)} questions</small></div><div class="stat"><small>Hours</small><b>${fmt(S.hrs,1)}</b><small>${fmt(wk,1)} this week${wl!=null&&wl>0?' · '+Math.ceil(wl*7)+' days to exam':''}</small></div></div>
   ${S.mk.length?`<p class="note">Latest mock: <b>${S.mk[S.mk.length-1][2]}%</b> (${esc(S.mk[S.mk.length-1][3])}, ${new Date(S.mk[S.mk.length-1][0]).toLocaleDateString('en-GB')})</p>`:''}
   <div class="tablewrap"><table class="t"><tr><th>Topic</th><th>Weight</th><th>Read</th><th>Mastery</th></tr>${S.T.map(t=>{const b=S.by[t.k];return`<tr><td>${esc(t.n)}</td><td>${t.w[0]}–${t.w[1]}%</td><td>${b.read}/${b.mods.length}</td><td><b>${Math.round(b.mastery*100)}%</b></td></tr>`}).join('')}</table></div></div>`}catch(e){html=''}finally{state=save0}return html}
