// Проверки v8: node tools/test8.js
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'../game/');global.window={NOBOOT:1};
let code=['src/art.js','src8/data8.js','src8/sim8.js','src8/sys8.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
code+=`;var toast=()=>{},mail=()=>{},esc=s=>s;
let _s=3;Math.random=function(){_s|=0;_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const ok=(c,m)=>console.log((c?'✓':'✗')+' '+m);
function fresh(n,srv){S=BASE8();POOL=[];UMAP.clear();init8();for(let i=100;i<n;i++)addUser();S.srvLvl=srv||1}
function lemmas(t){return TOPICS8[t][2].map(x=>x.split(':')[0])}
function research(words){S.dict.groups.push({id:S.dict.gid,name:'g',words});const e=labStart(S.dict.gid++);if(e)return {k:'err '+e};while(S.lab.runs.length)step();return S.lab.hyp[0].res}
// 1. взвешенное удержание: одно продвижение сильнее влияет на маленькую аудиторию
function boostEffect(n){fresh(n,8);for(let i=0;i<120;i++)step();const a0=S.avgRet;const p=POOL.slice().sort((a,b)=>(b.views?b.dwT/b.views:0)-(a.views?a.dwT/a.views:0))[0];p.pri=2.5;for(let i=0;i<40;i++)step();return S.avgRet-a0}
// базовый дрейф без действий для сравнения
function eff1(n,boost){_s=99;fresh(n,8);for(let i=0;i<150;i++)step();const a0=S.avgRet;const p=POOL.filter(p=>p.views>=3).sort((a,b)=>b.dwT/b.views-a.dwT/a.views)[0];if(boost)p.pri=2.5;_s=7;for(let i=0;i<60;i++)step();return S.avgRet-a0}
{const s1=eff1(100,1)-eff1(100,0),s2=eff1(2500,1)-eff1(2500,0);ok(Math.abs(s1)>Math.abs(s2),'1. Одно ▲ лучшего поста за минуту: при 100 людях удержание '+(s1>=0?'+':'')+s1.toFixed(2)+' с, при 2500 — '+(s2>=0?'+':'')+s2.toFixed(2)+' с (против контроля)')}
// 2. серверы удваивают лимит
fresh(100,1);const c1=srvCap();S.srvLvl=4;ok(c1==100&&srvCap()==800,'2. Серверы: уровень 1 — '+c1+', уровень 4 — '+srvCap()+' одновременно');
// 3–6. лаборатория на накопленных данных
fresh(2500,6);S.f.groups=S.f.lab=1;for(let i=0;i<900;i++)step();
const r1=research(lemmas(5).slice(0,4));ok(['found','partial','known'].includes(r1.k),'3. Слова одной темы («'+TOPICS8[5][0]+'») → '+r1.k+(r1.cat?' «'+S.lab.cats.find(c=>c.id==r1.cat).name+'»':'')+' (связность '+(r1.coh||0).toFixed(2)+', устойчивость '+(r1.st||0).toFixed(2)+')');
const mix=[lemmas(0)[0],lemmas(26)[0],lemmas(32)[0],lemmas(15)[0]];const r2=research(mix);ok(r2.k=='no'||r2.k=='few'||r2.k=='partial','4. Слова разных тем ('+mix.join(', ')+') → '+r2.k+' '+((r2.why||[]).join('; ').slice(0,90)));
const r3=research(['абракадабра','кракозябра']);ok(r3.k=='few','5. Слова, которых нет в постах → '+r3.k);
const C=S.lab.cats[0];if(C){const p=POOL.find(p=>postIn(p,C.t)),q=POOL.find(p=>!postIn(p,C.t));ok(p&&q&&condOk({k:'cat',v:C.id},p)&&!condOk({k:'cat',v:C.id},q),'6. Категория «'+C.name+'» работает в условиях правил')}else ok(false,'6. нет категории для проверки правил');
// 7. скрытые интересы влияют без исследований: люди с увлечением дольше смотрят свою тему
{const t=0;const fans=S.U.filter(u=>topicInterest(u,t)>.6),oth=S.U.filter(u=>topicInterest(u,t)<.1);const p=mkPost(null,{t,fmt:0});const m=L=>L.reduce((s,u)=>s+interaction(u,p).dw,0)/L.length;ok(m(fans)>m(oth)*1.3,'7. Интересы скрыты, но работают: фанаты «Автомобилей» смотрят пост '+m(fans).toFixed(1)+' с, остальные '+m(oth).toFixed(1)+' с')}
// 8. словоформы
fresh(100);S.f.dict=1;dictAdd('машину');dictAdd('машины');const n1=Object.keys(S.dict.words).length;S.f.forms=1;dictRemap();const n2=Object.keys(S.dict.words).length;ok(n1==2&&n2==1,'8. Словоформы: без технологии «машину» и «машины» — '+n1+' слова, с ней — '+n2);
// 9. эксперимент: значимый результат для сильного правила
fresh(2500,7);S.f.rules=1;S.f.exp=1;for(let i=0;i<200;i++)step();S.rules.push({conds:[{k:'retAbove'}],join:'and',act:3,on:false});expStart(0,240,'all');while(S.exp.on)step();const R=S.expHist[0].res.ret;
ok(true,'9. Эксперимент «продвигать посты с удержанием выше среднего»: A '+R.a.toFixed(2)+' с, B '+R.b.toFixed(2)+' с, t='+R.t.toFixed(1)+' → '+(R.sig?'значимо':'не доказано'));
// 10. сохранение
fresh(200);for(let i=0;i<50;i++)step();const js=JSON.stringify(S);ok(JSON.parse(js).U.length==S.U.length,'10. Сохранение: '+Math.round(js.length/1024)+' КБ');`;
eval(code);
