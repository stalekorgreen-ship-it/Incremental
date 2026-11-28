// ——— испытания: каждое проверяет саму ленту, а не то, какими блоками она собрана
const NEGS=['history','skip','nope','blocks','ip','geo','device','clock','visit','net','season','breaks'];
const TAGS=['new','hit','watch','rewatch','likes','cookies','profile','reposts','ads','search','week','subs','close','saves','comments','comm','friends','similar','trip','ip','home','geo','!nope','!skip','!blocks','!history','!ip','!device','!clock','!visit','!net','!season','!breaks'];
const pc=v=>(v*100).toFixed(v<.1?1:0).replace('.',',')+'%';
const QUESTS=[];
const chk=(label,ok,k)=>({label,ok:!!ok,k});
const wired=(S,G,id)=>{const f=G.nodes.find(n=>n.type==='feed');return!!f&&G.nodes.some(n=>n.type==='signal'&&n.p.src===id&&reaches(G,n.id,f.id));};
const ownAll=S=>S.people.filter(p=>p.own>=12).length;
const schemeCheck=S=>chk(`твоя схема собирает ленту (хотя бы 12 постов) у ${ownAll(S)} из ${NP} людей, нужно ${NP-8}`,ownAll(S)>=NP-8);
const secCheck=(S,need)=>chk(`люди сидят ${fmt(S.sec)}, нужно ${fmt(need)}`,S.sec>=need,Math.min(1,S.sec/need));
const fmt=s=>s<90?Math.round(s)+' с':s<3600?Math.floor(s/60)+' мин '+Math.floor(s%60)+' с':Math.floor(s/3600)+' ч '+Math.floor(s%3600/60)+' мин';
const wiredAll=(S,G,ids)=>ids.filter(i=>wired(S,G,i)).length;
const used=(S,G,ids,k)=>chk(`из новых источников в ленте участвуют ${wiredAll(S,G,ids)}, нужно хотя бы ${k}`,wiredAll(S,G,ids)>=k);
const band=(label,v,lo,hi)=>chk(`${label}: ${pc(v)}, нужно ${lo===null?'не больше '+pc(hi):hi===null?'не меньше '+pc(lo):'от '+pc(lo)+' до '+pc(hi)}`,(lo===null||v>=lo)&&(hi===null||v<=hi));
const L=n=>TG[n];
QUESTS.push({id:'first',kind:'старт',title:'Первый эфир',goal:'Пусть каждый человек получает ленту из всех постов. Это ещё не рекомендации, а просто эфир.',reward:250,hold:3,checks:(S,G)=>[schemeCheck(S)]});
QUESTS.push({id:'funnel',kind:'пачка',title:'Удержи их',srcs:['history','blocks','nope','watch'],reward:700,hold:8,goal:'Четыре новых источника. На все мощностей может не хватить. Что отсеивать, что поднимать и без чего обойтись, решаешь ты.',checks:(S,G)=>[secCheck(S,420),schemeCheck(S),chk(`мощности: нужно ${powerLoad(S,G)}, есть ${powerCap(S)}`,powerLoad(S,G)<=powerCap(S))]});
const QUOTA=p=>p.top&&p.top.n>=10&&p.top.subs>=3&&p.top.subs<=6&&p.top.comm>=2&&p.top.comm<=5&&p.top.new>=3;
const AWAY=p=>p.top&&(p.top.gone?p.top.here>=5:p.top.here>=2&&p.top.here<=6);
const many=(S,f,label,need)=>{const k=S.people.filter(f).length;return chk(`${label}: ${k} из ${NP}, нужно ${need}`,k>=need,Math.min(1,k/need));};
QUESTS.push({id:'quota',kind:'пачка',title:'Три хозяина',srcs:['subs','comm','search'],reward:1200,hold:12,goal:'Первые десять постов у человека: из подписок от 3 до 6, из его сообществ от 2 до 5, и хотя бы 3 не из подписок и не из сообществ.',checks:(S,G)=>[used(S,G,['subs','comm'],2),many(S,QUOTA,'людей, у кого первые десять такие',23),secCheck(S,600),schemeCheck(S)]});
QUESTS.push({id:'fallback',kind:'пачка',title:'Кто уехал',srcs:['ip','trip'],reward:2000,hold:12,goal:'Кто сегодня в другом городе: в первых десяти хотя бы 5 постов оттуда. Кто дома: из своего города от 2 до 6, не меньше и не больше. У тех, кто никуда не уехал, «Поездки» пустые.',checks:(S,G)=>[used(S,G,['ip','trip'],2),many(S,AWAY,'людей, у кого с городом всё в порядке',31),secCheck(S,600),schemeCheck(S)]});
// восемь пачек с правилами на первые посты: у каждой своя форма схемы, пороги подобраны автотестером
const PACKS=(typeof require!=='undefined'?require('./packs.js'):root.makePacks)(API_H.M,API_H);
const NEED={near:[18,1800],thin:[15,2200],hours:[17,2600],back:[40,3000],circle:[28,3500],mouth:[14,4000],love:[14,4600],trace:[11,5200]};
// у «Вернулся» две группы считаются порознь, иначе постоянные люди закрывают порог сами
const groups=(S)=>{const a=S.people.filter(p=>API_H.away(S,p)),b=S.people.filter(p=>!API_H.away(S,p));const part=(l,label,sh)=>{const k=l.filter(p=>p.pk).length,n=Math.ceil(l.length*sh);return chk(`${label}: ${k} из ${l.length}, нужно ${n}`,k>=n,n?Math.min(1,k/n):1);};return[part(a,'вернувшиеся, кого встретили правильно',.35),part(b,'постоянные, кого не завалили старьём',.6)];};
for(const k of PACKS){const[need,reward]=NEED[k.id];QUESTS.push({id:k.id,kind:'пачка',title:k.title,srcs:k.srcs,level:4,goal:k.goal,reward,hold:12,pred:k.ok,need,
 checks:(S,G)=>[used(S,G,k.srcs,k.id==="mouth"?1:Math.min(2,k.srcs.length)),...(k.id==='back'?groups(S):[many(S,p=>p.pk,k.label,need)]),secCheck(S,90),schemeCheck(S)]});}

function grant(S){const q=QUESTS[S.quest];if(q&&q.srcs)for(const i of q.srcs)if(!S.src[i]){S.ord[i]=Object.keys(S.ord).length;S.src[i]=q.level||2;S.fresh=i;}}
function checkQuest(S,G){const q=QUESTS[S.quest];if(!q)return;const ok=q.checks(S,G).every(c=>c.ok);S.hold=ok?S.hold+1:0;if(S.hold>=q.hold){S.hold=0;S.quest++;S.money+=q.reward;S.justDone=q.id;for(const p of S.people)p.pk=false;grant(S);if(S.quest>=QUESTS.length)S.won=S.t;}}
