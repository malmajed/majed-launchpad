/* ================= CFA Level III labs (original exercises; all figures illustrative) ================= */
const irr=cfs=>{let lo=-.99,hi=2;const npv=r=>cfs.reduce((s,c,t)=>s+c/Math.pow(1+r,t),0);if(npv(lo)*npv(hi)>0)return NaN;for(let i=0;i<200;i++){const mi=(lo+hi)/2;if(npv(lo)*npv(mi)<=0)hi=mi;else lo=mi}return(lo+hi)/2};

/* x01 — Grinold–Kroner */
LABS.gk=(el,m,done)=>calcLab(el,m,done,{inputs:[['dy','Dividend yield (%)',3,.1],['inf','Expected inflation (%)',2,.1],['g','Real earnings growth (%)',3,.1],['ds','Change in shares outstanding (%/yr; buybacks negative)',-.5,.1],['dpe','Repricing: change in P/E (%/yr)',.5,.1]],
 compute:v=>{const inc=v.dy-v.ds,ng=v.inf+v.g,er=inc+ng+v.dpe;
  return{out:{er},html:`<div class="grid g4 g2m">${stat('Expected equity return',fmt(er,2)+'%')}${stat('Income return',fmt(inc,2)+'%','D/P − %ΔS')}${stat('Nominal earnings growth',fmt(ng,2)+'%','inflation + real growth')}${stat('Repricing return',fmt(v.dpe,2)+'%','%ΔP/E')}</div><div class="formula">E(R) ≈ D/P + (%ΔE − %ΔS) + %ΔP/E</div><p class="note">Repricing is the most judgemental part: assuming P/E expansion forever is a common error. Net buybacks (negative %ΔS) add to the income return.</p>`}},
 challenge:{text:'What is the <b>expected equity return</b> (%)?',ask:{ans:(v,o)=>o.er,tol:.02,dp:2,unit:'%'}}});

/* x02 — mean–variance utility and the optimal equity weight */
LABS.saa=(el,m,done)=>calcLab(el,m,done,{inputs:[['me','Equity expected return (%)',8,.1],['mb','Bond expected return (%)',4,.1],['se','Equity volatility (%)',18,.1],['sb','Bond volatility (%)',6,.1],['rho','Correlation',.2,.05],['lam','Risk aversion λ',4,.5]],
 compute:v=>{const me=v.me/100,mb=v.mb/100,se=v.se/100,sb=v.sb/100,c=v.rho*se*sb;const U=w=>{const mu=w*me+(1-w)*mb,va=w*w*se*se+(1-w)*(1-w)*sb*sb+2*w*(1-w)*c;return mu-.5*v.lam*va};let ws=(me-mb+v.lam*(sb*sb-c))/(v.lam*(se*se+sb*sb-2*c));const wc=Math.min(1,Math.max(0,ws));
  const pts=Array.from({length:21},(_,k)=>[k*5,U(k/20)*100]);const um=Math.max(...pts.map(p=>p[1])),un=Math.min(...pts.map(p=>p[1]));
  return{out:{w:wc*100},html:`<div class="grid g3">${stat('Optimal equity weight',pct(wc,1),ws!==wc?'constrained to 0–100%':'')}${stat('Expected return',pct(wc*me+(1-wc)*mb,2))}${stat('Risk-adjusted utility',fmt(U(wc)*100,2)+'%','U = E(R) − ½λσ²')}</div>${plotXY({x0:0,x1:100,y0:un-.2,y1:um+.2,h:190,fx:t=>fmt(t)+'%',fy:t=>fmt(t,1)+'%',series:[{pts,l:'utility'}],vlines:[[wc*100,'var(--tc)','optimum']],xl:'equity weight'})}<p class="note">Raise λ and the optimum shifts to bonds. In practice, asset-only optimisation is extended to <b>surplus</b> (assets minus liabilities) for pension plans and to goals-based buckets for individuals.</p>`}},
 challenge:{text:'What <b>equity weight</b> maximises utility (%)?',ask:{ans:(v,o)=>o.w,tol:.5,dp:1,unit:'%'}}});

/* x03 — corridor rebalancing */
LABS.rebal=(el,m,done)=>calcLab(el,m,done,{inputs:[['pv','Portfolio value at start (SAR m)',100],['tw','Target equity weight (%)',60],['cw','Corridor ± (percentage points)',5,.5],['re','Equity return this period (%)',25,.5],['rb','Bond return this period (%)',-2,.5]],
 compute:v=>{const e=v.pv*v.tw/100*(1+v.re/100),b=v.pv*(1-v.tw/100)*(1+v.rb/100),tot=e+b,w=e/tot*100,out=Math.abs(w-v.tw)>v.cw,toT=e-v.tw/100*tot,edge=e-(v.tw+Math.sign(w-v.tw)*v.cw)/100*tot;
  return{out:{toT},html:`<div class="grid g4 g2m">${stat('Equity weight now',fmt(w,2)+'%',`corridor ${fmt(v.tw-v.cw,1)}–${fmt(v.tw+v.cw,1)}%`)}${stat('Rebalance?',out?'Yes: outside corridor':'No: inside corridor')}${stat(toT>=0?'Sell equity to target':'Buy equity to target','SAR '+fmt(Math.abs(toT),2)+'m')}${stat('Trade to corridor edge only','SAR '+fmt(out?Math.abs(edge):0,2)+'m')}</div><p class="note">Wider corridors suit higher transaction costs, higher risk tolerance and assets that are highly correlated with the rest of the portfolio. Narrower corridors suit more volatile assets. Rebalancing is a mild contrarian strategy: it earns most in mean-reverting markets.</p>`}},
 challenge:{text:'How much equity must be sold (SAR m) to <b>restore the target weight</b>?',ask:{ans:(v,o)=>o.toT,tol:.02,dp:2,unit:'SAR m'}}});

/* x04 — core–satellite active risk */
LABS.coresat=(el,m,done)=>calcLab(el,m,done,{inputs:[['w1','Index fund weight (%)',50],['w2','Enhanced index weight (%)',30],['a2','Enhanced: expected alpha (%)',1,.1],['t2','Enhanced: tracking error (%)',2,.1],['a3','Active manager: expected alpha (%)',3,.1],['t3','Active manager: tracking error (%)',6,.1],['fee','Active manager fee above index (%)',.6,.05]],
 compute:v=>{const w2=v.w2/100,w3=Math.max(0,1-v.w1/100-w2),al=w2*v.a2+w3*(v.a3-v.fee),te=Math.sqrt(Math.pow(w2*v.t2,2)+Math.pow(w3*v.t3,2)),ir=te?al/te:0;
  return{out:{te},html:`<div class="grid g4 g2m">${stat('Active manager weight',pct(w3,0),'the remainder')}${stat('Portfolio alpha (after fees)',fmt(al,2)+'%')}${stat('Portfolio active risk',fmt(te,3)+'%','managers\' active returns uncorrelated')}${stat('Information ratio',fmt(ir,2))}</div><div class="formula">Active risk = √(Σ w<sub>i</sub>² × TE<sub>i</sub>²) · alpha = Σ w<sub>i</sub> × α<sub>i</sub></div><p class="note">The passive core costs little and adds no active risk; satellites add alpha at the cost of active risk and fees. Choose active managers when the expected alpha after fees justifies the risk budget.</p>`}},
 challenge:{text:'What is the portfolio\'s <b>total active risk</b> (%)?',ask:{ans:(v,o)=>o.te,tol:.01,dp:3,unit:'%'}}});

/* x05 — closing a duration gap with futures */
LABS.ldi=(el,m,done)=>calcLab(el,m,done,{inputs:[['lpv','Liability PV (SAR m)',500],['ld','Liability duration',12,.1],['amv','Asset market value (SAR m)',450],['ad','Asset duration',8,.1],['fb','Futures BPV per contract (SAR)',95,1],['hr','Hedge ratio (%)',100]],
 compute:v=>{const bl=v.lpv*1e6*v.ld*1e-4,ba=v.amv*1e6*v.ad*1e-4,gap=bl-ba,n=gap*v.hr/100/v.fb;
  return{out:{n},html:`<div class="grid g4 g2m">${stat('Liability BPV','SAR '+fmt(bl,0))}${stat('Asset BPV','SAR '+fmt(ba,0))}${stat('BPV gap','SAR '+fmt(gap,0),gap>0?'assets too short':'assets too long')}${stat(n>=0?'Futures to buy':'Futures to sell',fmt(Math.abs(n),1)+' contracts')}</div><div class="formula">N = (BPV<sub>liabilities</sub> − BPV<sub>assets</sub>) × hedge ratio ÷ BPV<sub>futures</sub></div><p class="note">A hedge ratio below 100% leaves deliberate rate exposure. Immunisation also needs the asset convexity to exceed the liability\'s (with matched duration and PV) and periodic rebalancing. Contingent immunisation allows active management while the surplus stays above a floor.</p>`}},
 challenge:{text:'How many futures contracts close the gap at a 100% hedge ratio?',ask:{ans:(v,o)=>o.n,tol:1,dp:0}}});

/* x06 — implementation shortfall */
LABS.isf=(el,m,done)=>calcLab(el,m,done,{inputs:[['dp','Decision price',50,.01],['ap','Arrival price',50.2,.01],['q','Shares ordered',10000],['fq','Shares filled',8000],['ep','Average execution price',50.4,.01],['cm','Commissions (total)',400],['cp','Closing price when order cancelled',51,.01]],
 compute:v=>{const paper=v.q*v.dp,d=v.fq*(v.ap-v.dp),ex=v.fq*(v.ep-v.ap),op=(v.q-v.fq)*(v.cp-v.dp),tot=d+ex+op+v.cm,bp=x=>x/paper*1e4;
  return{out:{bp:bp(tot)},html:`<div class="tablewrap"><table class="t"><tr><th>Component</th><th>SAR</th><th>bp</th></tr><tr><td>Delay cost</td><td>${fmt(d,0)}</td><td>${fmt(bp(d),1)}</td></tr><tr><td>Execution (trading) cost</td><td>${fmt(ex,0)}</td><td>${fmt(bp(ex),1)}</td></tr><tr><td>Opportunity cost</td><td>${fmt(op,0)}</td><td>${fmt(bp(op),1)}</td></tr><tr><td>Fees</td><td>${fmt(v.cm,0)}</td><td>${fmt(bp(v.cm),1)}</td></tr><tr><th>Implementation shortfall</th><th>${fmt(tot,0)}</th><th>${fmt(bp(tot),1)}</th></tr></table></div><p class="note">IS compares the real portfolio with a paper portfolio traded instantly at the decision price. Delay reflects slowness to reach the market; execution reflects market impact; opportunity cost reflects shares never filled. Urgent, small orders suit aggressive algorithms; large orders in illiquid names suit patient (VWAP, IS-minimising) algorithms or dark pools.</p>`}},
 challenge:{text:'What is the total <b>implementation shortfall</b> in basis points?',ask:{ans:(v,o)=>o.bp,tol:.5,dp:1,unit:'bp'}}});

/* x07 — beta adjustment with futures and currency returns */
LABS.betafut=(el,m,done)=>calcLab(el,m,done,{inputs:[['pv','Portfolio value (SAR m)',200],['b0','Current beta',1.1,.05],['bt','Target beta',.6,.05],['f','Futures price (index points)',2000],['mult','Contract multiplier (SAR per point)',250],['rfc','Foreign asset return in local currency (%)',6,.1],['rfx','Foreign currency return vs SAR (%)',-3,.1]],
 compute:v=>{const n=(v.bt-v.b0)*v.pv*1e6/(v.f*v.mult),rdc=((1+v.rfc/100)*(1+v.rfx/100)-1)*100;
  return{out:{n},html:`<div class="grid g3">${stat(n<0?'Futures to sell':'Futures to buy',fmt(Math.abs(n),1)+' contracts')}${stat('Contract value','SAR '+fmt(v.f*v.mult,0))}${stat('Domestic-currency return',fmt(rdc,2)+'%','(1 + R<sub>FC</sub>)(1 + R<sub>FX</sub>) − 1')}</div><div class="formula">N = (β<sub>target</sub> − β<sub>portfolio</sub>) ÷ β<sub>futures</sub> × portfolio value ÷ (futures price × multiplier)</div><p class="note">Overlays change risk without selling the underlying assets. For currency, a passive hedge locks the forward rate; discretionary and active hedging allow views. Hedging is costlier when the forward points work against you, and SAR-based investors face little USD risk because of the peg.</p>`}},
 challenge:{text:'How many futures contracts must be <b>sold</b> to reach the target beta?',ask:{ans:(v,o)=>-o.n,tol:.5,dp:1}}});

/* x08 — Brinson–Fachler attribution */
LABS.brinson=(el,m,done)=>calcLab(el,m,done,{inputs:[['wpa','Portfolio weight, sector A (%)',70],['wba','Benchmark weight, sector A (%)',50],['rpa','Portfolio return, sector A (%)',10,.1],['rba','Benchmark return, sector A (%)',8,.1],['rpb','Portfolio return, sector B (%)',4,.1],['rbb','Benchmark return, sector B (%)',5,.1]],
 compute:v=>{const wp=[v.wpa/100,1-v.wpa/100],wb=[v.wba/100,1-v.wba/100],rp=[v.rpa,v.rpb],rb=[v.rba,v.rbb],RB=wb[0]*rb[0]+wb[1]*rb[1],RP=wp[0]*rp[0]+wp[1]*rp[1];const al=[0,1].map(i=>(wp[i]-wb[i])*(rb[i]-RB)),se=[0,1].map(i=>wb[i]*(rp[i]-rb[i])),it=[0,1].map(i=>(wp[i]-wb[i])*(rp[i]-rb[i]));const S=a=>a[0]+a[1];
  return{out:{al:S(al)},html:`<div class="tablewrap"><table class="t"><tr><th></th><th>Allocation</th><th>Selection</th><th>Interaction</th></tr><tr><td>Sector A</td><td>${fmt(al[0],2)}</td><td>${fmt(se[0],2)}</td><td>${fmt(it[0],2)}</td></tr><tr><td>Sector B</td><td>${fmt(al[1],2)}</td><td>${fmt(se[1],2)}</td><td>${fmt(it[1],2)}</td></tr><tr><th>Total</th><th>${fmt(S(al),2)}</th><th>${fmt(S(se),2)}</th><th>${fmt(S(it),2)}</th></tr></table></div><div class="grid g3">${stat('Portfolio return',fmt(RP,2)+'%')}${stat('Benchmark return',fmt(RB,2)+'%')}${stat('Active return',fmt(RP-RB,2)+'%','= allocation + selection + interaction')}</div><div class="formula">Allocation = (w<sub>p</sub> − w<sub>b</sub>)(R<sub>b,i</sub> − R<sub>B</sub>) · Selection = w<sub>b</sub>(R<sub>p,i</sub> − R<sub>b,i</sub>) · Interaction = (w<sub>p</sub> − w<sub>b</sub>)(R<sub>p,i</sub> − R<sub>b,i</sub>)</div>`}},
 challenge:{text:'What is the <b>total allocation effect</b> (%)?',ask:{ans:(v,o)=>o.al,tol:.01,dp:2,unit:'%'}}});

/* x09 — GIPS */
LABS.gips=(el,m,done)=>classifyLab(el,done,{intro:'Under the 2020 GIPS standards for firms, is each practice required, recommended or optional, or not permitted?',cats:['Required','Recommended or optional','Not permitted'],
 items:[['Including all actual, fee-paying, discretionary segregated portfolios in at least one composite.','Required','composites must be complete'],
 ['Claiming compliance "except for" one strategy\'s composites.','Not permitted','compliance is all or nothing, firm-wide'],
 ['Having the firm verified by an independent verifier.','Recommended or optional','verification is recommended, not required'],
 ['Moving a portfolio into a better-performing composite after the fact.','Not permitted','composite switches cannot be applied retroactively to improve results'],
 ['Presenting at least five years of compliant performance (or since inception) when first claiming compliance, then building to ten.','Required','minimum track record'],
 ['Linking simulated or model results with actual performance.','Not permitted','hypothetical results must never be linked to actual'],
 ['Obtaining a performance examination of a specific composite.','Recommended or optional','optional, in addition to verification'],
 ['Defining the firm as the entity held out to clients as a distinct business.','Required','the definition sets the scope of compliance']],
 why:'GIPS rests on fair representation and full disclosure. "Must" items are requirements; verification is recommended. Partial claims and cherry-picking are never allowed.'});

/* x10 — constructed-response technique */
LABS.crtech=(el,m,done)=>classifyLab(el,done,{intro:'Strong or weak constructed-response habit?',cats:['Strong answer','Weak answer'],
 items:[['Asked to "determine and justify", states the choice first, then two specific reasons from the case.','Strong answer','command word answered directly'],
 ['Restates the case facts at length before reaching a conclusion.','Weak answer','graders award points for conclusions and reasons, not repetition'],
 ['Shows the formula, the inputs and the result for a calculation.','Strong answer','partial credit is possible when working is shown'],
 ['Gives a conclusion with no justification when the question says "justify".','Weak answer','usually earns at most half the points'],
 ['Uses short bullet points rather than long paragraphs.','Strong answer','clear and fast to grade'],
 ['Writes "it could be either" instead of choosing.','Weak answer','a decision is required'],
 ['Links the recommendation to the client\'s constraints (liquidity, horizon, taxes).','Strong answer','Level III rewards client-specific reasoning'],
 ['Spends far more time on a small-point question than its points justify.','Weak answer','budget time in proportion to points']],
 why:'Constructed responses are graded against a key: answer the command word, be specific to the case, show working, and move on.'});

/* x11 — active share */
LABS.activeshare=(el,m,done)=>calcLab(el,m,done,{inputs:[['p1','Portfolio weight: stock 1 (%)',40],['p2','Portfolio: stock 2 (%)',30],['p3','Portfolio: stock 3 (%)',20],['p4','Portfolio: stock 4 (%)',10],['b1','Benchmark: stock 1 (%)',25],['b2','Benchmark: stock 2 (%)',25],['b3','Benchmark: stock 3 (%)',25],['b4','Benchmark: stock 4 (%)',25]],
 compute:v=>{const P=[v.p1,v.p2,v.p3,v.p4],B=[v.b1,v.b2,v.b3,v.b4],sp=P.reduce((a,b)=>a+b,0),sb=B.reduce((a,b)=>a+b,0),as=.5*P.reduce((a,p,i)=>a+Math.abs(p/sp-B[i]/sb),0)*100;
  return{out:{as},html:`<div class="grid g3">${stat('Active share',fmt(as,1)+'%')}${stat('Weights sum',`${fmt(sp,0)}% · ${fmt(sb,0)}%`,'normalised to 100%')}${stat('Style',as<20?'index-like':as<60?'closet indexer if tracking error is low':'truly active')}</div><div class="formula">Active share = ½ Σ |w<sub>p,i</sub> − w<sub>b,i</sub>|</div><p class="note">Active share measures how different the holdings are; tracking error measures how different the returns are. High active share with low tracking error: diversified stock-picker. Low active share with high tracking error: concentrated factor bets.</p>`}},
 challenge:{text:'What is the <b>active share</b> (%)?',ask:{ans:(v,o)=>o.as,tol:.1,dp:1,unit:'%'}}});

/* x12 — fixed income expected return decomposition */
LABS.fiexp=(el,m,done)=>calcLab(el,m,done,{inputs:[['yi','Yield income / rolling yield component (%)',4.5,.05],['rd','Rolldown return (%)',.4,.05],['dur','Modified duration',6,.1],['dy','Expected yield change (bp)',25],['cx','Convexity',50],['cl','Expected credit losses (%)',.3,.05],['fx','Currency gain or loss (%)',0,.1]],
 compute:v=>{const dy=v.dy/1e4,pc=(-v.dur*dy+.5*v.cx*dy*dy)*100,tot=v.yi+v.rd+pc-v.cl+v.fx;
  return{out:{tot},html:`<div class="grid g4 g2m">${stat('Rolling yield',fmt(v.yi+v.rd,2)+'%','income + rolldown')}${stat('From yield change',fmt(pc,3)+'%','−D·Δy + ½C·Δy²')}${stat('Credit losses',fmt(-v.cl,2)+'%')}${stat('Expected return',fmt(tot,3)+'%')}</div><p class="note">Rolling yield is earned if the curve stays where it is. The yield-change term expresses a view. A barbell has more convexity than a bullet of the same duration, so it gains relatively when rates move a lot or the curve flattens.</p>`}},
 challenge:{text:'What is the bond portfolio\'s <b>expected total return</b> (%)?',ask:{ans:(v,o)=>o.tot,tol:.01,dp:3,unit:'%'}}});

/* x13 — merger arbitrage */
LABS.mergerarb=(el,m,done)=>calcLab(el,m,done,{inputs:[['tp','Target price now',36,.1],['ap','Acquirer price',50,.1],['er','Exchange ratio (acquirer shares per target share)',.8,.01],['mo','Months to completion',6],['p','Probability of completion (%)',85],['fb','Target price if the deal fails',28,.5]],
 compute:v=>{const off=v.ap*v.er,spr=off-v.tp,g=spr/v.tp,ann=Math.pow(1+g,12/v.mo)-1,ev=v.p/100*off+(1-v.p/100)*v.fb,er=ev/v.tp-1;
  return{out:{er:er*100},html:`<div class="grid g4 g2m">${stat('Offer value',fmt(off,2))}${stat('Deal spread',fmt(spr,2),pct(g,2)+' gross')}${stat('Annualised if completed',pct(ann,2))}${stat('Probability-weighted return',pct(er,2))}</div><p class="note">In a stock deal the arbitrageur buys the target and shorts ${fmt(v.er,2)} acquirer shares per target share, locking the spread. The payoff resembles <b>selling a put</b>: small, steady gains, with a large loss if the deal breaks. Event-driven returns rise with deal activity and fall in risk-off markets.</p>`}},
 challenge:{text:'What is the <b>probability-weighted expected return</b> on the target shares (%)?',ask:{ans:(v,o)=>o.er,tol:.05,dp:2,unit:'%'}}});

/* x14 — fixed income strategy views */
LABS.curveview=(el,m,done)=>classifyLab(el,done,{intro:'Pick the positioning that best expresses each view, relative to a benchmark of the same duration where relevant.',cats:['Extend duration','Shorten duration','Barbell','Bullet'],
 items:[['Rates will fall in a parallel shift.','Extend duration','gain more from the rally'],['Rates will rise in a parallel shift.','Shorten duration','lose less'],['The curve will flatten (long rates fall relative to short).','Barbell','long end benefits; more convexity'],['The curve will steepen around the 5-year point while the ends stay put.','Bullet','concentrate where the gain is'],['Interest-rate volatility will rise sharply, direction unknown.','Barbell','long convexity benefits from big moves'],['Volatility will stay low and the curve stable: you want to sell convexity for extra yield.','Bullet','less convexity, more yield']],
 why:'Duration expresses level views; barbells versus bullets express shape and volatility views. Always state the view first, then the trade.'});

/* x15 — private equity fund metrics */
LABS.pefund=(el,m,done)=>calcLab(el,m,done,{inputs:[['cc','Committed capital (USD m)',100],['pi','Paid-in capital',80],['di','Cumulative distributions',60],['nav','Residual NAV',70],['mf','Management fee (% of committed, per year)',2,.1],['yrs','Years since first close',6]],
 compute:v=>{const dpi=v.di/v.pi,rvpi=v.nav/v.pi,tvpi=dpi+rvpi,fees=v.mf/100*v.cc*v.yrs;
  return{out:{tvpi},html:`<div class="grid g4 g2m">${stat('DPI',fmt(dpi,3)+'×','realised')}${stat('RVPI',fmt(rvpi,3)+'×','unrealised')}${stat('TVPI',fmt(tvpi,3)+'×')}${stat('Unfunded commitment','USD '+fmt(v.cc-v.pi,0)+'m',`fees paid ≈ ${fmt(fees,0)}m`)}</div><p class="note">Early in a fund's life, fees and unrealised losses create the <b>J-curve</b>. TVPI depends on appraised NAV, so DPI is the harder test. Compare with public market equivalents and remember unfunded commitments must be kept liquid.</p>`}},
 challenge:{text:'What is the fund\'s <b>TVPI</b>?',ask:{ans:(v,o)=>o.tvpi,tol:.005,dp:3}}});

/* x16 — property DCF */
LABS.redcf=(el,m,done)=>calcLab(el,m,done,{inputs:[['noi','NOI year 1 (SAR m)',10,.1],['g','NOI growth (%)',2,.1],['n','Holding period (years)',5],['ec','Exit cap rate on next year\'s NOI (%)',7,.1],['r','Discount rate (%)',8.5,.1]],
 compute:v=>{const n=Math.round(v.n),r=v.r/100,g=v.g/100;let pv=0;for(let t=1;t<=n;t++)pv+=v.noi*Math.pow(1+g,t-1)/Math.pow(1+r,t);const exit=v.noi*Math.pow(1+g,n)/(v.ec/100),val=pv+exit/Math.pow(1+r,n);
  return{out:{val},html:`<div class="grid g4 g2m">${stat('Value today','SAR '+fmt(val,2)+'m')}${stat('PV of NOI','SAR '+fmt(pv,2)+'m')}${stat('Exit value','SAR '+fmt(exit,2)+'m','in year '+n)}${stat('Going-in cap rate',pct(v.noi/val,2))}</div><p class="note">Value is very sensitive to the exit cap rate. Infrastructure is valued the same way, but with long concession cash flows that are often inflation-linked; brownfield assets have lower risk than greenfield projects.</p>`}},
 challenge:{text:'What is the <b>value of the property</b> today (SAR m)?',ask:{ans:(v,o)=>o.val,tol:.05,dp:2,unit:'SAR m'}}});

/* x17 — fund cash flows: IRR and multiple */
LABS.fundirr=(el,m,done)=>calcLab(el,m,done,{inputs:[['c0','Capital call year 0',40],['c1','Capital call year 1',30],['c2','Capital call year 2',20],['d3','Distribution year 3',10],['d4','Distribution year 4',30],['d5','Distribution year 5',50],['d6','Distribution year 6',60]],
 compute:v=>{const cf=[-v.c0,-v.c1,-v.c2,v.d3,v.d4,v.d5,v.d6],r=irr(cf),paid=v.c0+v.c1+v.c2,dist=v.d3+v.d4+v.d5+v.d6;let cum=0;const pts=cf.map((c,t)=>{cum+=c;return[t,cum]});
  return{out:{r:r*100},html:`<div class="grid g3">${stat('IRR',pct(r,2))}${stat('Multiple (DPI at end)',fmt(dist/paid,2)+'×')}${stat('Peak cash out',fmt(Math.min(...pts.map(p=>p[1])),0))}</div>${plotXY({x0:0,x1:6,y0:Math.min(...pts.map(p=>p[1]))*1.1,y1:Math.max(10,pts[6][1]*1.1),h:180,fx:t=>'Y'+fmt(t),fy:t=>fmt(t),series:[{pts,l:'cumulative net cash flow'}],xl:'year'})}<p class="note">The cumulative curve is the J-curve. IRR rewards early distributions; the multiple ignores timing. Use both, and compare with a public market equivalent.</p>`}},
 challenge:{text:'What is the fund\'s <b>IRR</b> (%)?',ask:{ans:(v,o)=>o.r,tol:.05,dp:2,unit:'%'}}});

/* x18 — choosing a private-markets vehicle */
LABS.pmvehicle=(el,m,done)=>classifyLab(el,done,{intro:'Which route into private markets fits each investor\'s need best?',cats:['Primary fund commitment','Secondary purchase','Co-investment','Evergreen / semi-liquid fund'],
 items:[['A new endowment wants exposure now and to reduce the J-curve.','Secondary purchase','buys mature interests at a discount; earlier distributions'],
 ['A large family office wants to back a manager\'s next 10-year buyout fund.','Primary fund commitment','classic route; full J-curve'],
 ['A sovereign fund wants to invest alongside a GP in one deal with low or no fees.','Co-investment','lower fees, more concentration'],
 ['A wealthy individual wants periodic liquidity and no capital calls.','Evergreen / semi-liquid fund','fully invested; limited redemptions'],
 ['A pension fund wants to diversify across vintages it missed.','Secondary purchase','buys older vintages'],
 ['An investor with a strong deal team wants to build concentrated positions with selected GPs.','Co-investment','needs fast due diligence']],
 why:'Primaries give access but a long J-curve; secondaries shorten it; co-investments cut fees but add concentration; semi-liquid funds trade liquidity promises against cash drag and gating risk.'});

/* x19 — after-tax accumulation */
LABS.taxacc=(el,m,done)=>calcLab(el,m,done,{inputs:[['pv','Initial investment (SAR)',1000000],['r','Pre-tax return (%)',7,.1],['n','Years',20],['t','Tax rate (%)',25]],
 compute:v=>{const r=v.r/100,t=v.t/100,acc=v.pv*Math.pow(1+r*(1-t),v.n),def=v.pv*(Math.pow(1+r,v.n)*(1-t)+t),ex=v.pv*Math.pow(1+r,v.n);
  return{out:{def},html:`<div class="grid g3">${stat('Taxed every year','SAR '+fmt(acc,0))}${stat('Tax deferred to the end','SAR '+fmt(def,0),'gain taxed at sale')}${stat('Tax-exempt','SAR '+fmt(ex,0))}</div><div class="formula">Accrual: (1 + r(1 − t))<sup>n</sup> · Deferred: (1 + r)<sup>n</sup>(1 − t) + t · Exempt: (1 + r)<sup>n</sup></div><p class="note">Deferral is worth more the longer the horizon and the higher the return. <b>Asset location</b>: hold tax-inefficient assets in tax-advantaged accounts. Saudi residents pay no personal income tax on most investments, but Zakat and foreign withholding taxes can apply, and many clients hold assets in taxed jurisdictions.</p>`}},
 challenge:{text:'What is the ending value with <b>tax deferred</b> to the end (SAR)?',ask:{ans:(v,o)=>o.def,tol:50,dp:0,unit:'SAR'}}});

/* x20 — gift vs bequest */
LABS.giftbeq=(el,m,done)=>calcLab(el,m,done,{inputs:[['rg','Return in recipient\'s hands (%)',6,.1],['tig','Recipient\'s tax on investment returns (%)',20],['re','Return in donor\'s hands (%)',6,.1],['tie','Donor\'s tax on investment returns (%)',30],['n','Years until the bequest',15],['tg','Gift tax (%)',0],['te','Estate tax (%)',40]],
 compute:v=>{const fg=Math.pow(1+v.rg/100*(1-v.tig/100),v.n)*(1-v.tg/100),fe=Math.pow(1+v.re/100*(1-v.tie/100),v.n)*(1-v.te/100),rv=fg/fe;
  return{out:{rv},html:`<div class="grid g3">${stat('FV of gift now (per 1)',fmt(fg,3))}${stat('FV of bequest later (per 1)',fmt(fe,3))}${stat('Relative value',fmt(rv,3),rv>1?'gift now is better':'bequest is better')}</div><div class="formula">RV = [1 + r<sub>g</sub>(1 − t<sub>ig</sub>)]<sup>n</sup>(1 − T<sub>g</sub>) ÷ [1 + r<sub>e</sub>(1 − t<sub>ie</sub>)]<sup>n</sup>(1 − T<sub>e</sub>)</div><p class="note">Illustrative of jurisdictions with gift and estate taxes. Saudi Arabia has no estate tax; succession follows Islamic inheritance rules (fixed shares for heirs), with up to one-third bequeathable by will to non-heirs, so planning often focuses on family governance, waqf and holding structures.</p>`}},
 challenge:{text:'What is the <b>relative value</b> of a gift now versus a bequest?',ask:{ans:(v,o)=>o.rv,tol:.005,dp:3}}});

/* x21 — human capital */
LABS.humancap=(el,m,done)=>calcLab(el,m,done,{inputs:[['inc','Expected income next year (SAR)',300000],['g','Income growth (%)',3,.1],['n','Working years left',30],['r','Risk-adjusted discount rate (%)',6,.1],['fin','Financial capital (SAR)',1500000]],
 compute:v=>{const g=v.g/100,r=v.r/100,hc=Math.abs(r-g)<1e-9?v.inc*v.n/(1+r):v.inc/(r-g)*(1-Math.pow((1+g)/(1+r),v.n)),tot=hc+v.fin;
  return{out:{hc},html:`<div class="grid g3">${stat('Human capital','SAR '+fmt(hc,0))}${stat('Financial capital','SAR '+fmt(v.fin,0))}${stat('Human capital share of total wealth',pct(hc/tot,1))}</div><div class="formula">HC = PV of future earnings = I₁ ÷ (r − g) × [1 − ((1 + g) ÷ (1 + r))<sup>n</sup>]</div><p class="note">Bond-like human capital (stable salary) allows more equity in financial capital; equity-like human capital (bonuses, own business, oil-linked sectors) argues for less. Life insurance protects human capital against premature death; annuities protect against longevity risk.</p>`}},
 challenge:{text:'What is the present value of <b>human capital</b> (SAR)?',ask:{ans:(v,o)=>o.hc,tol:50,dp:0,unit:'SAR'}}});

/* x22 — risk identification for a private client */
LABS.pwrisk=(el,m,done)=>classifyLab(el,done,{intro:'Which risk is each fact pattern mainly about?',cats:['Earnings risk','Premature death risk','Longevity risk','Property risk','Liability risk','Health risk'],
 items:[['A surgeon\'s income stops if a hand injury prevents her from operating.','Earnings risk','disability insurance'],['A sole breadwinner with three young children has no life cover.','Premature death risk','term life insurance'],['A retired couple, both 65, fear running out of money in their 90s.','Longevity risk','annuities, longevity pooling'],['A villa in a flood-prone area is uninsured.','Property risk','property insurance'],['A family member drives the family car and could injure someone.','Liability risk','liability cover'],['Long-term care costs could consume savings late in life.','Health risk','health and long-term care cover']],
 why:'Private wealth risk management starts with the balance sheet, including human capital: identify each risk, then decide to avoid, reduce, transfer (insure) or retain it.'});
