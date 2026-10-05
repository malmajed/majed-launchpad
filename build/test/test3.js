const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message));
const base='http://localhost:8765/';const link=Buffer.from(JSON.stringify({u:'http://localhost:8767/',k:'test'})).toString('base64');
await P.goto(base+'index.html#sync='+link);await P.waitForTimeout(600);await P.screenshot({path:'shots/picker.png'});
console.log('picker:',(await P.innerText('main')).slice(0,60).replace(/\n/g,' '));
await P.click('[data-u="majed"]');await P.waitForTimeout(1200);console.log('home:',(await P.innerText('main h1')));
// earn XP as Majed
await P.goto(base+'index.html#/m/c01/learn');for(let k=0;k<6;k++){const n=await P.$('#nxt');if(n)await n.click();else break}await P.click('#fin');await P.waitForTimeout(2500);
const mx=await P.evaluate(()=>state.xp);
// switch to Mohammed
await P.goto(base+'index.html#/more');await P.click('#swp');await P.waitForTimeout(600);await P.click('[data-u="mohammed"]');await P.waitForTimeout(1200);
console.log('now:',await P.innerText('main h1'),'| xp',await P.evaluate(()=>state.xp),'| brand',await P.innerText('.brand'));
// set PIN as Mohammed and earn XP
await P.goto(base+'index.html#/settings');await P.fill('#pinN','1234');await P.click('#pinS');await P.waitForTimeout(300);
await P.goto(base+'index.html#/m/c02/learn');for(let k=0;k<6;k++){const n=await P.$('#nxt');if(n)await n.click();else break}await P.click('#fin');await P.waitForTimeout(2500);
// fresh device: Mohammed locked
const c2=await b.newContext({viewport:{width:1200,height:850}});const Q=await c2.newPage();Q.on('pageerror',e=>errs.push(e.message));
await Q.goto(base+'index.html#sync='+link);await Q.waitForTimeout(500);await Q.click('[data-u="mohammed"]');await Q.waitForTimeout(2000);
console.log('device2 mohammed:',(await Q.innerText('main')).slice(0,50).replace(/\n/g,' '));
await Q.fill('#pin','1234');await Q.click('#ok');await Q.waitForTimeout(400);console.log('unlocked:',await Q.innerText('main h1'),'xp',await Q.evaluate(()=>state.xp));
await Q.goto(base+'index.html#/family');await Q.waitForTimeout(1500);console.log('family:',(await Q.innerText('#fam')).replace(/\s+/g,' ').slice(0,260));await Q.screenshot({path:'shots/family.png'});
// follow
const F=await c2.newPage();F.on('pageerror',e=>errs.push(e.message));await F.goto(base+'follow.html#sync='+link);await F.waitForTimeout(1500);
console.log('follow:',(await F.innerText('main h1')),'| chips',(await F.$$('[data-fu]')).length);
await F.click('[data-fu="mohammed"]');await F.waitForTimeout(1800);console.log('follow2:',await F.innerText('main h1'));await F.screenshot({path:'shots/follow2.png',fullPage:true});
console.log('majed xp',mx,'ERRORS',errs.length,errs.slice(0,5));await b.close()})();
