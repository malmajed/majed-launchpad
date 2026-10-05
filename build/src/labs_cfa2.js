/* ================= CFA Level II labs (original exercises; all figures illustrative) ================= */
const stat=(l,v,s)=>`<div class="stat"><small>${l}</small><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
const zinv=p=>{let lo=-8,hi=8;for(let i=0;i<80;i++){const mi=(lo+hi)/2;if(ncdf(mi)<p)lo=mi;else hi=mi}return(lo+hi)/2};

/* b01 — ethics vignettes: violation or not */
LABS.eth2=(el,m,done)=>classifyLab(el,done,{intro:'Level II ethics is about judgement in context. Violation or not? (Original scenarios.)',cats:['Violation','No violation'],
 items:[['A buy-side analyst overhears, in a lift, a CFO saying that quarterly sales "collapsed". The firm has not announced results. She tells her PM, who sells the stock.','Violation','II(A): material nonpublic information, however it was obtained'],
 ['A portfolio manager receives a gift basket worth about USD 80 from a broker at year end and tells his supervisor.','No violation','I(B): modest gifts are acceptable; disclosure is good practice'],
 ['A research head asks an analyst to keep a "buy" rating because the bank is underwriting the company\'s bond. The analyst keeps the rating although her model says "sell".','Violation','I(B) Independence and Objectivity'],
 ['A manager builds a block order, then allocates the fills pro rata to all participating accounts at the average price.','No violation','III(B) Fair Dealing: pro rata at average price is the recommended procedure'],
 ['A fund markets a five-year composite but omits two terminated accounts that performed badly.','Violation','III(D) Performance Presentation: survivorship bias'],
 ['An analyst who left Firm A uses her memory of public contacts and her general skills at Firm B, but takes no files.','No violation','IV(A): skills and memory of public information are hers'],
 ['A wealth adviser invests a client\'s whole portfolio in a high-fee house fund without considering the client\'s IPS, and does not disclose the fees.','Violation','III(C) Suitability and V(B): disclose services and costs (2024 Standards)'],
 ['A candidate states on her CV: "Passed Level II of the CFA Program in 2026" after receiving her result.','No violation','VII(B): factual statements about passed levels are allowed']],
 why:'At Level II, the facts are richer and the question is usually "which action, if any, violates the Standards?" Read every sentence for who knew what, when.'});

/* b02 — multiple regression output */
LABS.regr=(el,m,done)=>calcLab(el,m,done,{inputs:[['n','Observations n',60],['k','Independent variables k',3],['r2','R²',.42,.01],['b','Slope coefficient on X₁',.85,.01],['se','Standard error of that slope',.30,.01],['al','Significance level (%)',5]],
 compute:v=>{const df=v.n-v.k-1,adj=1-(1-v.r2)*(v.n-1)/df,F=(v.r2/v.k)/((1-v.r2)/df),t=v.b/v.se,p=2*(1-tcdf(Math.abs(t),df));let lo=0,hi=20;for(let i=0;i<60;i++){const mi=(lo+hi)/2;if(2*(1-tcdf(mi,df))>v.al/100)lo=mi;else hi=mi}const crit=(lo+hi)/2;
  return{out:{adj,F,t},html:`<div class="grid g4 g2m">${stat('Adjusted R²',fmt(adj,3),'penalises extra variables')}${stat('F-statistic',fmt(F,2),`df ${v.k}, ${df}`)}${stat('t on X₁',fmt(t,3),`critical ±${fmt(crit,3)}`)}${stat('p-value',fmt(p,4),p<v.al/100?'significant':'not significant')}</div><div class="formula">Adj R² = 1 − (1 − R²)(n − 1) ÷ (n − k − 1) · F = (RSS ÷ k) ÷ (SSE ÷ (n − k − 1)) = (R² ÷ k) ÷ ((1 − R²) ÷ (n − k − 1))</div><p class="note">Add a useless variable (k + 1, same R²) and adjusted R² falls. Check the classic violations next: heteroskedasticity (Breusch–Pagan), serial correlation (Breusch–Godfrey) and multicollinearity (VIF above 5–10).</p>`}},
 challenge:{text:'What is the <b>adjusted R²</b> at the current inputs (3 decimals)?',ask:{ans:(v,o)=>o.adj,tol:.002,dp:3,why:()=>'Adjusted R² can fall when you add a variable; R² never can. That is why model-selection questions use adjusted R², AIC or BIC.'}}});

/* b03 — machine learning: match technique to problem */
LABS.mlpick=(el,m,done)=>classifyLab(el,done,{intro:'Pick the most suitable machine-learning approach for each problem.',cats:['Penalised regression (LASSO)','Classification (logistic, SVM, CART)','Clustering (k-means, hierarchical)','Dimension reduction (PCA)','Neural network / deep learning','Reinforcement learning'],
 items:[['Predict whether each of 50,000 SME loans defaults next year (yes/no) from 40 labelled features.','Classification (logistic, SVM, CART)','supervised, categorical target'],
 ['Forecast monthly stock returns from 300 candidate predictors, most of them probably irrelevant, keeping only the useful ones.','Penalised regression (LASSO)','supervised, continuous target, shrinks weak coefficients to zero'],
 ['Group 2,000 retail-bank customers into segments when no labels exist.','Clustering (k-means, hierarchical)','unsupervised grouping'],
 ['Summarise 30 highly correlated yield-curve points into a few uncorrelated factors.','Dimension reduction (PCA)','unsupervised; level, slope and curvature'],
 ['An agent learns an order-execution policy by trial and error, rewarded for lower slippage.','Reinforcement learning','actions, states and rewards'],
 ['Score sentiment in millions of earnings-call sentences where the patterns are highly non-linear.','Neural network / deep learning','complex non-linear relationships, large data'],
 ['An auditor wants a flagging rule for fraudulent expense claims that she can read and explain.','Classification (logistic, SVM, CART)','a classification tree (CART) is interpretable'],
 ['Find stocks that behave alike to build diversified buckets, with no target variable.','Clustering (k-means, hierarchical)','unsupervised; similarity, not prediction']],
 why:'First ask: is there a labelled target (supervised) or not (unsupervised)? Then: is the target continuous (regression) or categorical (classification)? Overfitting is controlled by regularisation and cross-validation.'});

/* b04 — FX forward mark-to-market and growth accounting */
LABS.fxmtm=(el,m,done)=>calcLab(el,m,done,{inputs:[['nt','Notional (USD m) bought forward',10],['f0','Contract forward rate (SAR/USD)',3.76,.0001],['s','Spot now (SAR/USD)',3.77,.0001],['days','Days remaining',90],['ip','SAR rate (%/yr)',5.5,.05],['ib','USD rate (%/yr)',5,.05],['al','Capital share α',.4,.01],['gk','Capital growth (%)',4,.1],['gl','Labour growth (%)',2,.1],['ga','TFP growth (%)',1,.1]],
 compute:v=>{const t=v.days/360,ft=v.s*(1+v.ip/100*t)/(1+v.ib/100*t),mtm=v.nt*1e6*(ft-v.f0)/(1+v.ip/100*t),gy=v.ga+v.al*v.gk+(1-v.al)*v.gl;
  return{out:{mtm:mtm/1000},html:`<div class="grid g3">${stat('Forward for the remaining term',fmt(ft,4))}${stat('Mark-to-market',`SAR ${fmt(mtm/1000,1)}k`,mtm>=0?'gain to the USD buyer':'loss to the USD buyer')}${stat('Potential GDP growth',fmt(gy,2)+'%',`per-capita ≈ ${fmt(gy-v.gl,2)}%`)}</div><div class="formula">MTM = Notional × (F<sub>t</sub> − F<sub>0</sub>) ÷ (1 + i<sub>price</sub> × days ÷ 360) · g<sub>Y</sub> = g<sub>A</sub> + α·g<sub>K</sub> + (1 − α)·g<sub>L</sub></div><p class="note">Value the forward by entering an offsetting contract today and discounting the difference at the price-currency rate. For growth, only TFP raises per-capita growth permanently in the neoclassical model.</p>`}},
 challenge:{text:'What is the <b>mark-to-market value</b> to the party that bought USD forward, in SAR thousands?',ask:{ans:(v,o)=>o.mtm,tol:.2,dp:1,unit:'SAR k'}}});

/* b05 — equity method with excess purchase price */
LABS.equitym=(el,m,done)=>calcLab(el,m,done,{inputs:[['pp','Price paid for the stake',400],['sh','Stake (%)',30],['bv','Investee book value at purchase',1000],['fv','Fair value above book of PP&E (whole investee)',200],['life','Remaining life of that PP&E (years)',10],['ni','Investee net income (year 1)',150],['dv','Investee dividends (year 1)',60]],
 compute:v=>{const s=v.sh/100,excess=v.pp-s*v.bv,ppe=s*v.fv,gw=excess-ppe,amort=ppe/v.life,inc=s*v.ni-amort,end=v.pp+inc-s*v.dv;
  return{out:{end},html:`<div class="grid g4 g2m">${stat('Excess purchase price',fmt(excess,1))}${stat('of which goodwill',fmt(gw,1),'not amortised')}${stat('Equity income',fmt(inc,1),`share of NI less ${fmt(amort,1)} amortisation`)}${stat('Investment, end of year 1',fmt(end,1))}</div><div class="formula">Ending = cost + share of NI − amortisation of excess − share of dividends</div><p class="note">Dividends reduce the investment balance; they are not income under the equity method. With control (usually above 50%) you would consolidate instead, and full goodwill is allowed under IFRS.</p>`}},
 challenge:{text:'What is the <b>investment balance</b> at the end of year 1?',ask:{ans:(v,o)=>o.end,tol:.5,dp:1}}});

/* b06 — defined-benefit pension */
LABS.pension=(el,m,done)=>calcLab(el,m,done,{inputs:[['pbo','DBO at start',1000],['pa','Plan assets at start',900],['r','Discount rate (%)',5,.1],['sc','Current service cost',40],['bp','Benefits paid',50],['al','Actuarial loss (gain if negative)',20],['ar','Actual return on assets',70],['ct','Employer contributions',60]],
 compute:v=>{const ic=v.pbo*v.r/100,pboE=v.pbo+v.sc+ic-v.bp+v.al,paE=v.pa+v.ar+v.ct-v.bp,fs=paE-pboE,ni=v.r/100*(v.pbo-v.pa),pl=v.sc+ni,tppc=v.sc+ic-v.ar+v.al,remeas=v.al-(v.ar-v.r/100*v.pa);
  return{out:{tppc,pboE},html:`<div class="grid g4 g2m">${stat('DBO at end',fmt(pboE,1))}${stat('Plan assets at end',fmt(paE,1))}${stat('Funded status',fmt(fs,1),fs<0?'net liability':'net asset')}${stat('Total periodic pension cost',fmt(tppc,1))}</div><div class="grid g2">${stat('IFRS: profit or loss',fmt(pl,1),'service cost + net interest')}${stat('IFRS: OCI remeasurements',fmt(remeas,1),'actuarial loss − (actual − interest-rate return)')}</div><div class="formula">DBO<sub>end</sub> = DBO + service cost + interest cost − benefits + actuarial loss · TPPC = contributions − change in funded status</div><p class="note">Check: TPPC = ${fmt(v.ct,1)} − (${fmt(fs,1)} − ${fmt(v.pa-v.pbo,1)}) = ${fmt(v.ct-(fs-(v.pa-v.pbo)),1)}. Analysts often reclassify interest cost to financing and the return on assets to investing.</p>`}},
 challenge:{text:'What is the <b>total periodic pension cost</b>?',ask:{ans:(v,o)=>o.tppc,tol:.5,dp:1,why:()=>'TPPC is economic and independent of IFRS or US GAAP presentation: only where it appears (P&L or OCI) differs.'}}});

/* b07 — Modigliani–Miller with taxes */
LABS.mm=(el,m,done)=>calcLab(el,m,done,{inputs:[['r0','Unlevered cost of capital r₀ (%)',10,.1],['rd','Cost of debt (%)',6,.1],['t','Tax rate (%)',20],['de','Debt-to-equity D/E',.5,.05],['ebit','EBIT (perpetual)',100]],
 compute:v=>{const t=v.t/100,re=v.r0+(v.r0-v.rd)*(1-t)*v.de,wD=v.de/(1+v.de),wacc=(1-wD)*re+wD*v.rd*(1-t),vu=v.ebit*(1-t)/(v.r0/100),vl=v.ebit*(1-t)/(wacc/100);
  return{out:{re},html:`<div class="grid g4 g2m">${stat('Cost of equity',fmt(re,2)+'%')}${stat('WACC',fmt(wacc,2)+'%')}${stat('Unlevered value',fmt(vu,1))}${stat('Levered value',fmt(vl,1),`tax shield value ${fmt(vl-vu,1)}`)}</div><div class="formula">MM II with taxes: r<sub>e</sub> = r<sub>0</sub> + (r<sub>0</sub> − r<sub>d</sub>)(1 − t)(D/E) · MM I with taxes: V<sub>L</sub> = V<sub>U</sub> + tD</div><p class="note">With taxes and no distress costs, WACC falls forever as D/E rises. Static trade-off theory adds expected costs of financial distress, giving an optimal (not 100%) debt level. Set tax to 0 and WACC stays at r₀ for any D/E.</p>`}},
 challenge:{text:'What is the <b>cost of equity</b> at the current inputs (%)?',ask:{ans:(v,o)=>o.re,tol:.02,dp:2,unit:'%'}}});

/* b08 — FCFF and FCFE */
LABS.fcf=(el,m,done)=>calcLab(el,m,done,{inputs:[['ni','Net income',200],['da','Depreciation (non-cash charge)',60],['int','Interest expense',40],['t','Tax rate (%)',25],['fci','Fixed capital investment',90],['wci','Working capital investment',20],['nb','Net borrowing',30],['wacc','WACC (%)',9,.1],['re','Cost of equity (%)',11,.1],['g','Stable growth (%)',4,.1],['debt','Market value of debt',600],['sh','Shares (m)',50]],
 compute:v=>{const t=v.t/100,ff=v.ni+v.da+v.int*(1-t)-v.fci-v.wci,fe=ff-v.int*(1-t)+v.nb,firm=ff*(1+v.g/100)/((v.wacc-v.g)/100),eqF=firm-v.debt,eqE=fe*(1+v.g/100)/((v.re-v.g)/100);
  return{out:{ff,fe},html:`<div class="grid g4 g2m">${stat('FCFF',fmt(ff,1))}${stat('FCFE',fmt(fe,1))}${stat('Value per share via FCFF',fmt(eqF/v.sh,2),`firm ${fmt(firm,0)} − debt`)}${stat('Value per share via FCFE',fmt(eqE/v.sh,2))}</div><div class="formula">FCFF = NI + NCC + Int(1 − t) − FCInv − WCInv · FCFE = FCFF − Int(1 − t) + net borrowing</div><p class="note">The two values agree only when assumptions are consistent: here net borrowing, growth and leverage are set independently, so they differ. Use FCFF when leverage is high or changing, FCFE when it is stable. Never subtract interest twice: FCFF is before payments to debt holders.</p>`}},
 challenge:{text:'What is <b>FCFF</b> at the current inputs?',ask:{ans:(v,o)=>o.ff,tol:.5,dp:1}}});

/* b09 — residual income and private-company discounts */
LABS.resinc=(el,m,done)=>calcLab(el,m,done,{inputs:[['b0','Book value per share B₀',20,.1],['roe','Expected ROE (%)',15,.1],['r','Cost of equity (%)',10,.1],['g','Long-run growth (%)',5,.1],['dloc','Discount for lack of control (%)',15],['dlom','Discount for lack of marketability (%)',20]],
 compute:v=>{const ri=(v.roe-v.r)/100*v.b0,val=v.b0+ri/((v.r-v.g)/100),pb=(v.roe-v.g)/(v.r-v.g),tot=1-(1-v.dloc/100)*(1-v.dlom/100);
  return{out:{val},html:`<div class="grid g4 g2m">${stat('Residual income, year 1',fmt(ri,2))}${stat('Single-stage RI value',fmt(val,2))}${stat('Justified P/B',fmt(pb,2)+'×')}${stat('Combined private-company discount',pct(tot,1),'multiplicative, not additive')}</div><div class="formula">RI = NI − r × B<sub>t−1</sub> = (ROE − r) × B<sub>t−1</sub> · V<sub>0</sub> = B<sub>0</sub> + (ROE − r)B<sub>0</sub> ÷ (r − g) · combined discount = 1 − (1 − DLOC)(1 − DLOM)</div><p class="note">Set ROE equal to r and value equals book: a company earning only its cost of equity adds no value. RI suits firms with no dividends or negative FCF but reliable, clean-surplus accounting.</p>`}},
 challenge:{text:'What is the <b>single-stage residual income value</b> per share?',ask:{ans:(v,o)=>o.val,tol:.05,dp:2}}});

/* b10 — binomial interest-rate tree: straight, callable and putable bonds */
function treeBond(c,r0,r1,r2,sg,K,kind){const rates=[[r0],[r1,r1*Math.exp(2*sg)],[r2,r2*Math.exp(2*sg),r2*Math.exp(4*sg)]];let V=[100,100,100,100];
  for(let t=2;t>=0;t--){V=rates[t].map((r,j)=>{let x=(.5*(V[j]+c)+.5*(V[j+1]+c))/(1+r/100);if(t>=1&&kind==='call')x=Math.min(x,K);if(t>=1&&kind==='put')x=Math.max(x,K);return x})}return{v:V[0],rates}}
LABS.ratetree=(el,m,done)=>calcLab(el,m,done,{inputs:[['c','Annual coupon (% of par), 3-year bond',5,.05],['r0','Year-0 one-year rate (%)',3,.01],['r1','Year-1 lower node rate (%)',3.8,.01],['r2','Year-2 lowest node rate (%)',4.2,.01],['sg','Volatility σ (%)',15,.5],['k','Call / put price (from year 1)',100,.5]],
 compute:v=>{const sg=v.sg/100,s=treeBond(v.c,v.r0,v.r1,v.r2,sg,v.k,''),cl=treeBond(v.c,v.r0,v.r1,v.r2,sg,v.k,'call'),pu=treeBond(v.c,v.r0,v.r1,v.r2,sg,v.k,'put');
  return{out:{cl:cl.v,s:s.v},html:`<div class="grid g4 g2m">${stat('Straight bond',fmt(s.v,3))}${stat('Callable bond',fmt(cl.v,3),`call option ${fmt(s.v-cl.v,3)}`)}${stat('Putable bond',fmt(pu.v,3),`put option ${fmt(pu.v-s.v,3)}`)}${stat('Upper nodes',`${fmt(s.rates[1][1],2)}% · ${fmt(s.rates[2][2],2)}%`,'r × e<sup>2σ</sup> per step')}</div><div class="formula">Node value = [½(V<sub>up</sub> + C) + ½(V<sub>down</sub> + C)] ÷ (1 + r<sub>node</sub>) · callable: min(node value, call price) · putable: max(node value, put price)</div><p class="note">V<sub>callable</sub> = V<sub>straight</sub> − V<sub>call</sub>; V<sub>putable</sub> = V<sub>straight</sub> + V<sub>put</sub>. Raise σ: both option values rise, so the callable falls and the putable rises.</p>`}},
 challenge:{text:'What is the value of the <b>callable bond</b> (3 decimals)?',ask:{ans:(v,o)=>o.cl,tol:.01,dp:3}}});

/* b11 — credit valuation adjustment */
LABS.cva=(el,m,done)=>calcLab(el,m,done,{inputs:[['c','Annual coupon (%)',5,.05],['n','Years to maturity',3],['rf','Risk-free rate, flat (%)',3,.05],['h','Hazard rate (%/yr)',2,.1],['rr','Recovery rate (%)',40]],
 compute:v=>{const n=Math.round(v.n),rf=v.rf/100,h=v.h/100;let vnd=0;for(let t=1;t<=n;t++)vnd+=(v.c+(t===n?100:0))/Math.pow(1+rf,t);let cva=0,pos=1,rows='';
  for(let t=1;t<=n;t++){let ex=0;for(let s=t;s<=n;s++)ex+=(v.c+(s===n?100:0))/Math.pow(1+rf,s-t);const lgd=ex*(1-v.rr/100),pod=pos*h;pos*=1-h;const df=1/Math.pow(1+rf,t),pv=lgd*pod*df;cva+=pv;rows+=`<tr><td>${t}</td><td>${fmt(ex,3)}</td><td>${fmt(lgd,3)}</td><td>${pct(pod,3)}</td><td>${fmt(df,4)}</td><td>${fmt(pv,4)}</td></tr>`}
  const fv=vnd-cva;let lo=0,hi=.5;for(let i=0;i<80;i++){const y=(lo+hi)/2;let p=0;for(let t=1;t<=n;t++)p+=(v.c+(t===n?100:0))/Math.pow(1+y,t);if(p>fv)lo=y;else hi=y}const ytm=(lo+hi)/2;
  return{out:{cva},html:`<div class="grid g4 g2m">${stat('Value if default-free',fmt(vnd,3))}${stat('CVA',fmt(cva,3))}${stat('Fair value',fmt(fv,3))}${stat('Credit spread',fmt((ytm-rf)*1e4,0)+' bp')}</div><div class="tablewrap"><table class="t"><tr><th>Date</th><th>Exposure</th><th>LGD</th><th>POD</th><th>DF</th><th>PV of EL</th></tr>${rows}</table></div><div class="formula">POD<sub>t</sub> = hazard × POS<sub>t−1</sub> · CVA = Σ LGD<sub>t</sub> × POD<sub>t</sub> × DF<sub>t</sub></div>`}},
 challenge:{text:'What is the <b>CVA</b> (3 decimals)?',ask:{ans:(v,o)=>o.cva,tol:.01,dp:3,why:()=>'A CDS buyer is paid LGD on default; the CDS spread is roughly hazard × (1 − recovery). The same logic prices both.'}}});

/* b12 — Black–Scholes–Merton and Greeks */
LABS.bsm=(el,m,done)=>calcLab(el,m,done,{inputs:[['s','Underlying price S',100],['k','Strike K',100],['T','Time to expiry (years)',.5,.05],['r','Risk-free rate, continuous (%)',4,.1],['sg','Volatility σ (%)',25,.5],['q','Dividend yield, continuous (%)',0,.1]],
 compute:v=>{const r=v.r/100,sg=v.sg/100,q=v.q/100,sq=sg*Math.sqrt(v.T),d1=(Math.log(v.s/v.k)+(r-q+sg*sg/2)*v.T)/sq,d2=d1-sq,eq=Math.exp(-q*v.T),er=Math.exp(-r*v.T);const c=v.s*eq*ncdf(d1)-v.k*er*ncdf(d2),p=v.k*er*ncdf(-d2)-v.s*eq*ncdf(-d1),nd=Math.exp(-d1*d1/2)/Math.sqrt(2*Math.PI),dc=eq*ncdf(d1),gm=eq*nd/(v.s*sq),vega=v.s*eq*nd*Math.sqrt(v.T)/100;
  return{out:{c},html:`<div class="grid g4 g2m">${stat('Call',fmt(c,3))}${stat('Put',fmt(p,3),'via BSM')}${stat('Call delta',fmt(dc,3),`put delta ${fmt(dc-eq,3)}`)}${stat('Gamma · vega',`${fmt(gm,4)} · ${fmt(vega,3)}`,'vega per 1 vol point')}</div><div class="formula">c = S e<sup>−qT</sup>N(d₁) − K e<sup>−rT</sup>N(d₂) · d₁ = [ln(S/K) + (r − q + σ²/2)T] ÷ σ√T · d₂ = d₁ − σ√T</div><p class="note">d₁ = ${fmt(d1,4)}, d₂ = ${fmt(d2,4)}. Delta hedge: short ${fmt(dc,3)} shares per long call. Gamma is highest near the money close to expiry, where delta hedges need the most rebalancing.</p>`}},
 challenge:{text:'What is the <b>BSM call value</b> (3 decimals)?',ask:{ans:(v,o)=>o.c,tol:.02,dp:3}}});

/* b13 — venture capital method */
LABS.vcm=(el,m,done)=>calcLab(el,m,done,{inputs:[['exit','Expected exit value (USD m)',400],['n','Years to exit',5],['r','Required (target) return (%)',40],['inv','Investment now (USD m)',20],['sh','Founders\' shares (m)',10]],
 compute:v=>{const post=v.exit/Math.pow(1+v.r/100,v.n),pre=post-v.inv,f=v.inv/post,ns=v.sh*f/(1-f),px=v.inv/ns;
  return{out:{f:f*100},html:`<div class="grid g4 g2m">${stat('Post-money value',fmt(post,2))}${stat('Pre-money value',fmt(pre,2))}${stat('Required ownership',pct(f,2))}${stat('New shares · price',`${fmt(ns,3)}m · ${fmt(px,3)}`)}</div><div class="formula">POST = exit value ÷ (1 + r)<sup>N</sup> · f = investment ÷ POST · new shares = founders' shares × f ÷ (1 − f)</div><p class="note">VC target returns are high because they embed the probability of failure. A cleaner approach adjusts the exit value for failure risk and uses a lower discount rate. Dilution from later rounds raises the ownership needed today.</p>`}},
 challenge:{text:'What <b>ownership percentage</b> must the investor receive?',ask:{ans:(v,o)=>o.f,tol:.05,dp:2,unit:'%'}}});

/* b14 — parametric VaR and the fundamental law */
LABS.varlab=(el,m,done)=>calcLab(el,m,done,{inputs:[['pv','Portfolio value (USD m)',50],['mu','Expected annual return (%)',8,.1],['sg','Annual volatility (%)',18,.1],['cl','Confidence level (%)',95,.5],['d','Horizon (trading days)',1],['ic','Information coefficient IC',.05,.01],['br','Breadth BR (independent bets/yr)',100],['tc','Transfer coefficient TC',.9,.05]],
 compute:v=>{const T=v.d/250,z=zinv(v.cl/100),vr=Math.max(0,(z*v.sg/100*Math.sqrt(T)-v.mu/100*T))*v.pv,ir=v.tc*v.ic*Math.sqrt(v.br);
  return{out:{vr},html:`<div class="grid g4 g2m">${stat('z for confidence',fmt(z,3))}${stat(`${v.d}-day VaR`,`USD ${fmt(vr,3)}m`,pct(vr/v.pv,2)+' of value')}${stat('Expected IR',fmt(ir,3),'TC × IC × √BR')}${stat('IR if TC = 1',fmt(v.ic*Math.sqrt(v.br),3))}</div><div class="formula">VaR = [z σ √T − μT] × V · fundamental law: E(R<sub>A</sub>) ≈ TC × IC × √BR × σ<sub>A</sub></div><p class="note">VaR is a minimum loss in the tail, not the worst case; conditional VaR (expected shortfall) averages the tail. Backtest by counting exceedances: at 95% you expect about 5 in 100 days.</p>`}},
 challenge:{text:'What is the parametric <b>VaR</b> in USD millions (3 decimals)?',ask:{ans:(v,o)=>o.vr,tol:.005,dp:3,unit:'USD m'}}});

/* b15 — item-set technique */
LABS.itemset=(el,m,done)=>classifyLab(el,done,{intro:'Good exam practice or a trap?',cats:['Good practice','Trap'],
 items:[['Reading the four questions before the vignette, then reading the vignette with them in mind.','Good practice','you know what data to look for'],
 ['Spending 12 minutes on one hard calculation in the first set.','Trap','each set is worth the same; budget about 18 minutes per set of 4 questions'],
 ['Treating every number in the vignette as needed for an answer.','Trap','vignettes include distractors'],
 ['Checking whether the vignette says "IFRS" or "US GAAP" before answering accounting questions.','Good practice','treatments differ (e.g. interest paid classification)'],
 ['Picking the answer that matches your rough estimate when two choices are close, without checking signs.','Trap','sign and timing errors are the commonest distractors'],
 ['Flagging a question, guessing, and returning if time allows.','Good practice','there is no penalty for wrong answers'],
 ['Re-reading the analyst\'s statement in the vignette before judging whether it is "correct".','Good practice','questions often test one word in the statement'],
 ['Assuming an ethics vignette has a violation in every paragraph.','Trap','several actions are usually fine']],
 why:'Item sets reward reading discipline as much as knowledge: questions first, mark the data, watch IFRS vs US GAAP, and keep moving.'});

/* b16 — Level II mock: which valuation model fits? */
LABS.modelpick=(el,m,done)=>classifyLab(el,done,{intro:'Choose the most appropriate valuation approach for each situation.',cats:['Dividend discount model','Free cash flow to equity','Free cash flow to the firm','Residual income','Market multiples'],
 items:[['A mature utility with stable dividends linked to earnings, valued for a minority investor.','Dividend discount model','dividends reflect the value a minority holder receives'],
 ['A company that pays no dividends, has stable leverage, valued from a control perspective.','Free cash flow to equity','control perspective; leverage stable'],
 ['A highly leveraged company whose capital structure is expected to change; FCFE is negative.','Free cash flow to the firm','value the firm, then subtract debt'],
 ['A fast-growing company with negative free cash flow for years but clean, reliable accounting and book value.','Residual income','value comes mostly from book value'],
 ['A quick check of an IPO price against listed peers.','Market multiples','relative valuation'],
 ['A bank whose cash flows are hard to define but whose book value is marked close to market.','Residual income','book value is meaningful for financial firms'],
 ['A stable company paying out roughly all FCFE as dividends to minority holders.','Dividend discount model','dividends ≈ FCFE, simplest model']],
 why:'Model choice is an exam favourite: match the model to what the investor receives (dividends, FCFE, control) and to what is measurable (cash flow vs book value).'});
