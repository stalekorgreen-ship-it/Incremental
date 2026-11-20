// Бот для баланса v8: играет как разумный игрок. node tools/bot8.js [минут]
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'../game/');global.window={NOBOOT:1};
let code=['src/art.js','src8/data8.js','src8/sim8.js','src8/sys8.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
code+=`;var toast=()=>{},mail=()=>{},esc=s=>s;
const MIN=${+process.argv[2]||180};init8();const log=[],gl={};let lastN=0;
function act(){const top=POOL.filter(p=>p.views>=3).sort((a,b)=>b.dwT/b.views-a.dwT/a.views);if(S.t%5==0){top.slice(0,2).forEach(p=>{if(!p.pri)p.pri=2.5});top.slice(-2).forEach(p=>{if(!p.pri)p.pri=-4});S.didUp=1}}
function think(){// правила
 if(has('rules')&&S.rules.length==0)S.rules.push({conds:[{k:'retAbove'}],join:'and',act:1,on:true});
 if(has('slot1')&&S.rules.length==1)S.rules.push({conds:[{k:'retBelow'}],join:'and',act:-1,on:true});
 // словарь: слова из самых удерживающих постов
 if(has('dict')&&S.t%15==0){const p=POOL.filter(p=>p.views>=4).sort((a,b)=>b.dwT/b.views-a.dwT/a.views)[0];if(p)for(const x of p.words)if(x.l)dictAdd(x.w)}
 // группы: компетентный игрок группирует слова одной темы
 if(has('groups')&&S.t%20==0&&S.dict.groups.length<groupCap()){const by={};for(const w of Object.keys(S.dict.words)){const l=lemmaOf(w)||w;const t=(LEMMA_TOPIC[l]||[])[0];if(t==null)continue;(by[t]||(by[t]=[])).push(w)}
  const known=new Set(S.dict.groups.map(g=>g.t));const c=Object.entries(by).filter(([t,ws])=>ws.length>=3&&!known.has(+t)).sort((a,b)=>b[1].length-a[1].length)[0];if(c)S.dict.groups.push({id:S.dict.gid++,name:TOPICS8[c[0]][0],words:c[1].slice(0,5),t:+c[0]})}
 if(has('groups')&&S.rules.length<ruleSlots()+1&&S.dict.groups.length&&!S.rules.some(r=>r.conds[0].k=='groupAny'))S.rules.push({conds:[{k:'groupAny',v:S.dict.groups[0].id}],join:'and',act:1,on:S.rules.filter(r=>r.on).length<ruleSlots()});
 if(has('lab')&&S.t%10==0)for(const g of S.dict.groups){const lastH=S.lab.hyp.find(h=>h.name==g.name&&h.res);const done=lastH&&(['found','partial','known'].includes(lastH.res.k)||S.t-lastH.t<300);const run=S.lab.runs.some(r=>r.words.join()==g.words.join());if(!done&&!run&&!labStart(g.id))break}
 if(S.lab.cats.length&&!S.rules.some(r=>r.conds[0].k=='cat')){const r=S.rules.find(r=>r.conds[0].k=='groupAny');if(r)r.conds=[{k:'cat',v:S.lab.cats[0].id}]}
 if(has('exp')&&!(S.exp&&S.exp.on)&&S.expHist.length<3&&S.rules.length)expStart(0,120,'all');
 if(has('users')&&!S.sel)S.sel=S.U[0].id;if(has('adload')&&S.adLoad<.4)S.adLoad=.4}
function shop(){for(let k=0;k<4;k++){const on=S.online,cap=srvCap();const L=TECH8.filter(t=>t.id!='srv'&&!has(t.id)&&techOk8(t)).sort((a,b)=>a.p-b.p);
 if(on>cap*.85&&S.m>=srvPrice()&&srvPrice()<(L[0]?L[0].p*3:1e18)){buy8('srv');continue}if(L[0]&&S.m>=L[0].p){buy8(L[0].id);log.push(Math.round(S.t/60)+'m '+L[0].id)}else break}}
const t0=Date.now();
for(let s=0;s<MIN*60;s++){act();step();think();if(s%3==0)shop();for(const[id,n]of GOALS)if(S.goals[id]&&!gl[id])gl[id]=Math.round(S.t/60);
 if(s%1200==0)console.log(Math.round(S.t/60)+'m ret='+(S.avgRet||0).toFixed(1)+' reg='+f(S.regTotal)+' on='+f(S.online)+'/'+f(srvCap())+' $'+f(S.m)+' inc/min='+f(S.statH.slice(-6).reduce((a,x)=>a+(x.inc||0),0))+' nb='+S.nb+' cats='+S.lab.cats.length+' simU='+S.U.length+' ms='+(Date.now()-t0))}
console.log('AUTO',JSON.stringify(S.auto),S.lab.hyp.filter(h=>h.auto).slice(0,6).map(h=>h.name+':'+(h.res?h.res.k+' '+(h.res.why||[]).join(';').slice(0,60):'run')).join(' | '));console.log('GOALS',JSON.stringify(gl));console.log('BUYS',log.join(', '));console.log('cats',S.lab.cats.map(c=>c.name+(c.auto?'*':'')).join(', '),'hyp',S.lab.hyp.map(h=>h.res&&(h.name+':'+h.res.k+' coh '+(h.res.coh||0).toFixed(2)+' st '+(h.res.st||0).toFixed(2)+' m '+(h.res.match||0).toFixed(2)+' obs '+h.res.obs+' ag '+h.res.ag+' core '+(h.res.core||[]).join('/'))).join(' | '));`;
eval(code);
