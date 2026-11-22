// Бот баланса v9: node tools/bot9.js [минут]
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'../game/');global.window={NOBOOT:1};
let code=['src/art.js','src8/data8.js','src8/sim8.js','src8/sys8.js','src8/loop9.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
code+=`;var toast=()=>{},mail=()=>{},esc=s=>s,floatTxt=()=>{};
const MIN=${+process.argv[2]||60};init8();const gl={},buys=[];
function play(s){if(s%2==0&&S.inbox.length){const p=S.inbox.slice().sort((a,b)=>b.pred-a.pred)[0];clickPost(p.id)}
 if(has('split')&&S.feeds.length<feedCap()&&s%20==0){const p=S.recent.filter(p=>!p.usedF&&p.clickRet>(S.avgRet||8))[0];if(p){p.usedF=1;const ids=lookalike(p);if(ids.length>=5){const A={id:S.audN++,name:TOPICS8[p.t][0],m:ids,st:[0,0],t:p.t};S.aud.push(A);const F=addFeed(A.name,A.id);F.t=p.t}}}
 if(has('dict')&&s%10==0)for(const p of S.recent)for(const x of p.words)if(x.l&&Math.random()<.3)dictAdd(x.w);
 if(has('filter')&&s%15==0)for(const F of S.feeds){if(F.aud==null||F.filter.length||F.t==null)continue;const ws=Object.keys(S.dict.words).filter(w=>(LEMMA_TOPIC[lemmaOf(w)||w]||[]).includes(F.t));if(ws.length)F.filter=ws.slice(0,4)}
 if(has('groups')&&s%30==0&&S.dict.groups.length<groupCap()){const by={};for(const w of Object.keys(S.dict.words)){const t=(LEMMA_TOPIC[lemmaOf(w)||w]||[])[0];if(t!=null)(by[t]||(by[t]=[])).push(w)}const kn=new Set(S.dict.groups.map(g=>g.t));const c=Object.entries(by).filter(([t,w])=>w.length>=3&&!kn.has(+t))[0];if(c)S.dict.groups.push({id:S.dict.gid++,name:TOPICS8[c[0]][0],words:c[1].slice(0,5),t:+c[0]})}
 if(has('lab')&&s%10==0)for(const g of S.dict.groups){const h=S.lab.hyp.find(h=>h.name==g.name&&h.res);if(h&&(['found','partial','known'].includes(h.res.k)||S.t-h.t<300))continue;if(S.lab.runs.some(r=>r.words.join()==g.words.join()))continue;if(labStart(g.id))break}
 if(s%20==0)for(const C of S.lab.cats)if(S.feeds.length<feedCap())catFeed(C)}
function shop(){for(let k=0;k<6;k++){const L=TECH8.filter(t=>!has(t.id)&&techOk8(t)).sort((a,b)=>a.p-b.p);const F=S.feeds.slice().sort((a,b)=>lvlPrice(a)/feedRate(a)-lvlPrice(b)/feedRate(b))[0];
 const opts=[];if(L[0])opts.push(['t',L[0].p,L[0]]);if(F)opts.push(['f',lvlPrice(F),F]);if(S.regTotal>srvCap()*.9)opts.push(['s',srvPrice()]);opts.sort((a,b)=>a[1]-b[1]);const o=opts[0];if(!o||S.m<o[1])break;
 if(o[0]=='t'){buy9(o[2].id);buys.push(Math.round(S.t/60)+'m '+o[2].id)}else if(o[0]=='f')lvlUp(o[2],1);else buy9('srv')}}
const t0=Date.now();
for(let s=0;s<MIN*60;s++){play(s);step();if(s%2==0)shop();for(const[id,n]of GOALS)if(S.goals[id]&&!gl[id])gl[id]=+(S.t/60).toFixed(1);
 if(s%300==0)console.log(Math.round(S.t/60)+'m $'+f(S.m)+' $/s='+f(perSec())+' ret='+(S.avgRet||0).toFixed(1)+' users='+S.regTotal+'/'+srvCap()+' feeds='+S.feeds.map(F=>F.name+':'+F.lvl).join(',')+' nb='+S.nb+' ms='+(Date.now()-t0))}
console.log('GOALS',JSON.stringify(gl));console.log('BUYS',buys.join(', '));`;eval(code);
