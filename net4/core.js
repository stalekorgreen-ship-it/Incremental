// ——— ядро: таблицы и блоки, мир с сырыми записями, нагрузка, деньги
(function(root){
const D=typeof require!=='undefined'?require('./data.js'):root.Data;
const hash=(...a)=>{let h=2166136261;for(const x of a){const s=String(x);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);h=Math.imul(h^31,16777619);}h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return((h^(h>>>16))>>>0)/4294967296;};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
// ——— мир. Правда о постах и людях игроку не видна: он видит только записи
const TN=Object.keys(D.TOPICS),WORDS=TN.map(t=>D.TOPICS[t].split(' '));
const NP=48,HIST=360,FRESH=60,POOL=800,AUTH=40,DAYS=10;
const LABELS=[40,70,110,170,260,380,560,800],JOURNAL=[14,22,34,52,80,120,180];
const worlds=new Map();
function world(seed){let W=worlds.get(seed);if(W)return W;const r=(...k)=>hash(seed,...k),pick=(l,...k)=>l[(r(...k)*l.length)|0];
 const authors=[];for(let a=0;a<AUTH;a++)authors.push({name:D.NICK[a%10]+'_'+D.NOUN[(a*7+3)%9],topic:a%TN.length,q:.45+r('aq',a)*.75});
 const posts=[];for(let i=0;i<HIST+FRESH+POOL;i++){const topic=(r('pt',i)*TN.length)|0,own=authors.map((a,j)=>j).filter(j=>authors[j].topic===topic),author=r('pa0',i)<.85?pick(own,'pa',i):(r('pa1',i)*AUTH)|0;
  const long=r('pl',i)<.35?1:0,len=long?100+(r('ln',i)*140|0):20+(r('ln',i)*60|0),words=[],n=6+(r('wn',i)*4|0);
  const doubles=D.DOUBLE.filter(d=>d[1]===TN[topic]||d[2]===TN[topic]);
  for(let k=0;k<n;k++){const x=r('wk',i,k);words.push(x<.34?D.COMMON[Math.floor(Math.pow(r('wc',i,k),1.6)*D.COMMON.length)]:x<.45&&doubles.length?pick(doubles,'wd',i,k)[0]:x<.55?pick(WORDS[(r('wo',i,k)*TN.length)|0],'wx',i,k):pick(WORDS[topic],'ws',i,k));}
  posts.push({id:101+i,topic,author,long,len,words,q:clamp(authors[author].q+(r('pq',i)-.5)*.24,.25,1.3)});}
 const people=[];for(let p=0;p<NP;p++){const taste=TN.map((_,t)=>.12+r('t',p,t)*.34),f1=(r('f1',p)*TN.length)|0,f2=(f1+1+(r('f2',p)*(TN.length-1)|0))%TN.length;taste[f1]=.9+r('s1',p)*.1;taste[f2]=.68+r('s2',p)*.14;
  const before=taste.slice();if(p%3===0){const old=(f1+3)%TN.length;before[old]=taste[f1];before[f1]=taste[old];}// каждый третий недавно сменил увлечение
  people.push({name:D.NAMES[p],taste,before,fav:f1,changed:p%3===0});}
 W={seed,authors,posts,people,cache:new Map()};worlds.set(seed,W);return W;}
// сколько на самом деле досмотрят (доля от длины)
const trueShare=(P,x,taste)=>clamp(taste[x.topic]*x.q*(x.long?.55:1),.02,1);
// сырые таблицы. labels и journal — уровни купленных данных
function raw(W,labels,journal){const key=labels+':'+journal;let R=W.cache.get(key);if(R)return R;
 const nL=LABELS[labels],nV=JOURNAL[journal],hist=W.posts.slice(0,HIST),fresh=W.posts.slice(HIST,HIST+FRESH),marked=W.posts.slice(HIST+FRESH,HIST+FRESH+nL),all=[...hist,...fresh,...marked];
 const T=(cols,rows)=>({cols,rows});
 const views=[];W.people.forEach((P,p)=>{for(let k=0;k<nV;k++){const x=hist[(hash(W.seed,'v',p,k)*HIST)|0],day=1+((k*7+p)%DAYS),taste=day<=6?P.before:P.taste;
   const share=clamp(trueShare(P,x,taste)+(hash(W.seed,'vn',p,k)-.5)*.5,.02,1);views.push([P.name,x.id,Math.max(1,Math.round(share*x.len)),day]);}});
 const cand=[];for(const P of W.people)for(const x of fresh)cand.push([P.name,x.id]);
 // начальный словарь: мало слов и две ошибки
 const start=[];TN.forEach((t,i)=>{start.push([WORDS[i][0],t],[WORDS[i][1],t],[WORDS[i][2],t]);});start.push(['это','коты'],['вчера','новости']);
 R={'Слова постов':T(['пост','слово'],all.flatMap(x=>x.words.map(w=>[x.id,w]))),
  'Посты':T(['пост','автор','длина','длинный'],[...hist,...fresh,...marked].map(x=>[x.id,W.authors[x.author].name,x.len,x.long])),
  'Начальный словарь':T(['слово','тема'],start),
  'Разметка':T(['пост','тема'],marked.map(x=>[x.id,TN[x.topic]])),
  'Просмотры':T(['человек','пост','секунд','день'],views),
  'Кандидаты':T(['человек','пост'],cand)};
 W.cache.set(key,R);return R;}
// ——— блоки
const BLOCKS={
 src:{title:'Таблица',ins:[],w:.15,help:'Берёт готовые записи. Их можно только читать.'},
 join:{title:'Склеить',ins:[['a','первая'],['b','вторая']],w:1,help:'Строки двух таблиц соединяются там, где совпадает ключ. Строки без пары пропадают.'},
 group:{title:'Сгруппировать',ins:[['a','таблица']],w:.8,help:'Одинаковые строки собираются в одну: сколько их, сумма, среднее, самое большое или малое.'},
 top:{title:'Первые N',ins:[['a','таблица']],w:.8,help:'Сортирует по столбцу и берёт лучшие: всего или в каждой группе.'},
 filter:{title:'Отобрать',ins:[['a','таблица']],w:.3,help:'Оставляет строки, где условие верно. Меньше строк — быстрее всё дальше.'},
 calc:{title:'Посчитать',ins:[['a','таблица']],w:.4,help:'Добавляет столбец: одно действие над столбцом и столбцом или числом.'},
 out:{title:'Результат',ins:[['a','таблица']],w:.15,help:'Отдаёт таблицу сети. Укажи, какой столбец что значит.'}};
const SLOTS={topics:{title:'Темы постов',fields:['пост','тема']},feed:{title:'Лента',fields:['человек','пост','оценка']},answer:{title:'Ответ на заказ',fields:null}};
const NAMES=['доля','вес','оценка','сколько','всего','сумма','среднее','максимум','вкус','качество','поправка','прогноз','итог'];
const CALC={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,'÷':(a,b)=>b?a/b:0};
const CMP={'=':(a,b)=>a===b,'≠':(a,b)=>a!==b,'>':(a,b)=>a>b,'≥':(a,b)=>a>=b,'<':(a,b)=>a<b,'≤':(a,b)=>a<=b};
const AGG={count:'сколько строк',sum:'сумма',avg:'среднее',max:'самое большое',min:'самое малое'};
const LIMIT=60000;
const fail=m=>{throw new Error(m);};
const col=(t,c,what)=>{if(c===undefined||c===null||c==='')fail('выбери '+what);const i=t.cols.indexOf(c);if(i<0)fail('нет столбца «'+c+'»');return i;};
const isNum=(t,i)=>!t.rows.length||typeof t.rows[0][i]==='number';
const numCol=(t,c,what)=>{const i=col(t,c,what);if(!isNum(t,i))fail('в «'+c+'» не числа');return i;};
const freeName=(cols,n)=>{let k=n,i=2;while(cols.includes(k))k=n+' '+i++;return k;};
// настройки по умолчанию, когда входы уже есть
function sharedKeys(a,b){return a.cols.filter(c=>b.cols.includes(c));}
const OPS={
 src(p,I,src){return src[p.table]||fail('выбери таблицу');},
 join(p,[a,b]){const k1=p.on1||sharedKeys(a,b)[0];if(!k1)fail('нет общего столбца');const keys=[k1];if(p.on2&&p.on2!==k1)keys.push(p.on2);
  const ia=keys.map(k=>col(a,k,'ключ')),ib=keys.map(k=>col(b,k,'ключ')),rest=b.cols.map((c,i)=>i).filter(i=>!ib.includes(i)),cols=a.cols.slice();for(const i of rest)cols.push(freeName(cols,b.cols[i]));
  const map=new Map();for(const r of b.rows){const k=ib.length>1?r[ib[0]]+'\u0001'+r[ib[1]]:r[ib[0]];let l=map.get(k);if(!l)map.set(k,l=[]);l.push(r);}
  const rows=[];for(const r of a.rows){const l=map.get(ia.length>1?r[ia[0]]+'\u0001'+r[ia[1]]:r[ia[0]]);if(!l)continue;for(const s of l){const row=r.slice();for(const i of rest)row.push(s[i]);rows.push(row);}if(rows.length>LIMIT)fail('получается больше '+LIMIT+' строк: сначала сократи таблицы или добавь второй ключ');}
  return{cols,rows};},
 group(p,[a]){const keys=[p.by1];if(p.by2&&p.by2!==p.by1)keys.push(p.by2);const ik=keys.map(k=>col(a,k,'по чему группировать')),agg=p.agg||'count',iv=agg==='count'?-1:numCol(a,p.col,'какой столбец считать');
  const map=new Map();for(const r of a.rows){const k=ik.length>1?r[ik[0]]+'\u0001'+r[ik[1]]:r[ik[0]];let g=map.get(k);if(!g)map.set(k,g={key:ik.map(i=>r[i]),n:0,s:0,max:-Infinity,min:Infinity});g.n++;if(iv>=0){const v=r[iv];g.s+=v;if(v>g.max)g.max=v;if(v<g.min)g.min=v;}}
  const name=freeName(keys,p.name||{count:'сколько',sum:'сумма',avg:'среднее',max:'максимум',min:'максимум'}[agg]);
  return{cols:[...keys,name],rows:[...map.values()].map(g=>[...g.key,agg==='count'?g.n:agg==='sum'?g.s:agg==='avg'?g.s/g.n:agg==='max'?g.max:g.min])};},
 top(p,[a]){const is=numCol(a,p.sort,'по чему сортировать'),ip=p.per?col(a,p.per,'группу'):-1,n=Math.max(1,Math.min(1000,Math.round(+p.n||1))),dir=p.dir==='asc'?1:-1;
  const sorted=a.rows.map((r,i)=>[r,hash('tie',...r),i]).sort((x,y)=>(x[0][is]-y[0][is])*dir||x[1]-y[1]),seen=new Map(),rows=[];
  for(const[r]of sorted){const k=ip<0?0:r[ip],c=seen.get(k)||0;if(c<n){rows.push(r);seen.set(k,c+1);}}return{cols:a.cols,rows};},
 filter(p,[a]){const i=col(a,p.col,'столбец'),op=CMP[p.op||'≥'];if(p.col2){const j=col(a,p.col2,'второй столбец');return{cols:a.cols,rows:a.rows.filter(r=>op(r[i],r[j]))};}
  if(p.val===undefined||p.val==='')fail('впиши, с чем сравнивать');const v=isNum(a,i)?Number(String(p.val).replace(',','.')):String(p.val);if(Number.isNaN(v))fail('здесь нужно число');return{cols:a.cols,rows:a.rows.filter(r=>op(r[i],v))};},
 calc(p,[a]){const i=numCol(a,p.a,'первый столбец'),f=CALC[p.op||'÷'];let j=-1,v=0;if(p.b==='#'){v=Number(String(p.num).replace(',','.'));if(p.num===undefined||p.num===''||Number.isNaN(v))fail('впиши число');}else j=numCol(a,p.b,'второй столбец или число');
  const name=freeName(a.cols,p.name||'доля');return{cols:[...a.cols,name],rows:a.rows.map(r=>[...r,f(r[i],j<0?v:r[j])])};},
 out(p,[a]){return a;}};
const insOf=n=>BLOCKS[n.type].ins;
const reaches=(G,a,b)=>{const seen=new Set(),st=[a];while(st.length){const x=st.pop();if(x===b)return true;if(seen.has(x))continue;seen.add(x);for(const w of G.wires)if(w[0]===x)st.push(w[1]);}return false;};
// провод: [откуда, куда, вход]
function connect(G,from,to,port){const f=G.nodes.find(n=>n.id===from),t=G.nodes.find(n=>n.id===to);if(!f||!t||from===to||f.type==='out'||!insOf(t).some(i=>i[0]===port)||reaches(G,to,from))return false;G.wires=G.wires.filter(w=>!(w[1]===to&&w[2]===port));G.wires.push([from,to,port]);return true;}
// расчёт всей схемы
function run(G,sources,cache){const R={},byId=new Map(G.nodes.map(n=>[n.id,n])),state=new Map();
 const go=n=>{if(R[n.id])return R[n.id];if(state.get(n.id))return{err:'круг'};state.set(n.id,1);const res=R[n.id]={table:null,err:null,rowsIn:0,sig:''};
  const ins=insOf(n).map(([port])=>{const w=G.wires.find(w=>w[1]===n.id&&w[2]===port);return w&&byId.get(w[0])?go(byId.get(w[0])):null;});
  const missing=insOf(n).findIndex((_,i)=>!ins[i]||!ins[i].table);
  res.inputs=ins.map(x=>x&&x.table);
  if(missing>=0){res.err=ins[missing]?'выше есть ошибка':'подключи: '+insOf(n)[missing][1];return res;}
  res.rowsIn=n.type==='src'?0:ins.reduce((a,x)=>a+x.table.rows.length,0);
  res.sig=n.type+JSON.stringify(n.p)+(n.type==='src'?sources.key+(sources[n.p.table]?sources[n.p.table].rows.length:0):ins.map(x=>x.sig).join('|'));
  const hit=cache&&cache.get(n.id);if(hit&&hit.sig===res.sig){res.table=hit.table;res.err=hit.err;}
  else{try{res.table=OPS[n.type](n.p,ins.map(x=>x.table),sources);}catch(e){res.err=e.message;}if(cache)cache.set(n.id,{sig:res.sig,table:res.table,err:res.err});}
  if(n.type==='src'&&res.table)res.rowsIn=res.table.rows.length;return res;};
 G.nodes.forEach(go);return R;}
// ——— что у схемы получилось
function resultOf(G,R,slot){const n=G.nodes.find(n=>n.type==='out'&&n.p.slot===slot),r=n&&R[n.id];if(!r||!r.table)return null;const t=r.table,map=n.p.map||{},want=SLOTS[slot].fields||t.cols;
 const idx=want.map(f=>t.cols.indexOf(map[f]||f));if(idx.some(i=>i<0))return{missing:want.filter((f,i)=>idx[i]<0)};return{rows:t.rows.map(r=>idx.map(i=>r[i]))};}
// точность тем: у поста должна быть ровно одна тема. Размеченные посты не считаются
function topicScore(W,res){const ids=HIST+FRESH,got=new Map();if(res&&res.rows)for(const[p,t]of res.rows){const s=got.get(p);if(s===undefined)got.set(p,t);else if(s!==t)got.set(p,null);}
 let ok=0,none=0,multi=0;const wrong=[];for(let i=0;i<ids;i++){const x=W.posts[i],g=got.get(x.id);if(g===TN[x.topic])ok++;else{if(g===undefined)none++;if(g===null)multi++;if(wrong.length<40)wrong.push({post:x,got:g});}}
 return{acc:ok/ids,none,multi,wrong,got};}
// лента: пять лучших свежих постов каждому; чего не хватает, добирается наугад
const TOPN=5,bases=new Map();
function base(W){let b=bases.get(W);if(b)return b;const fresh=W.posts.slice(HIST,HIST+FRESH);let rnd=0,best=0;const per=W.people.map(P=>{const v=fresh.map(x=>trueShare(P,x,P.taste)),avg=v.reduce((a,c)=>a+c,0)/v.length,top=v.slice().sort((a,c)=>c-a).slice(0,TOPN).reduce((a,c)=>a+c,0)/TOPN;rnd+=avg;best+=top;return avg;});
 b={per,rnd:rnd/NP,best:best/NP};bases.set(W,b);return b;}
function feedScore(W,res){const B=base(W),by=new Map();if(res&&res.rows)for(const[p,post,s]of res.rows){const i=post-101-HIST;if(i<0||i>=FRESH||typeof s!=='number'||!Number.isFinite(s))continue;let m=by.get(p);if(!m)by.set(p,m=new Map());if(!m.has(post)||m.get(post)<s)m.set(post,s);}
 let sum=0;const feeds={};W.people.forEach((P,p)=>{const m=by.get(P.name),list=m?[...m].sort((a,b)=>b[1]-a[1]||hash('f',p,a[0])-hash('f',p,b[0])).slice(0,TOPN):[];let v=0;for(const[post]of list)v+=trueShare(P,W.posts[post-101],P.taste);v+=(TOPN-list.length)*B.per[p];sum+=v/TOPN;feeds[P.name]=list.map(([post,s])=>({post:W.posts[post-101],score:s,real:trueShare(P,W.posts[post-101],P.taste)}));});
 const q=sum/NP;return{share:q,hit:clamp((q-B.rnd)/(B.best-B.rnd),0,1),feeds};}
// ——— нагрузка: сколько секунд занимает один пересчёт
const speed=lv=>400*Math.pow(1.22,lv)*Math.pow(2,Math.floor(lv/10));
const crowd=users=>Math.pow(Math.max(2000,users)/2000,.74);
function timing(G,R,S){const t={},end={};const k=crowd(S.users)/Math.pow(1.15,S.lv.cpu);let cycle=0,slow=null;
 for(const n of G.nodes){const r=R[n.id];t[n.id]=r&&r.table?r.rowsIn*BLOCKS[n.type].w*k/speed(n.lv||0):0;}
 const path=id=>{if(end[id]!==undefined)return end[id];end[id]=0;return end[id]=t[id]+Math.max(0,...G.wires.filter(w=>w[1]===id).map(w=>path(w[0])));};
 for(const n of G.nodes)if(n.type==='out'){const v=path(n.id);if(v>cycle)cycle=v;}
 // самый долгий блок на самом долгом пути
 let id=(G.nodes.filter(n=>n.type==='out').sort((a,b)=>path(b.id)-path(a.id))[0]||{}).id;while(id){if(!slow||t[id]>t[slow])slow=id;const prev=G.wires.filter(w=>w[1]===id).sort((a,b)=>path(b[0])-path(a[0]))[0];id=prev&&prev[0];}
 return{t,cycle,slow};}
const freshness=cycle=>1/(1+Math.max(0,cycle-3)/70);
// ——— деньги и покупки
const SHOP={
 labels:{title:'Разметка модераторами',help:'Больше постов с проверенной темой: словарь точнее, но строк больше.',max:LABELS.length-1,price:l=>Math.round(220*Math.pow(2.6,l)),now:l=>LABELS[l]+' постов'},
 journal:{title:'Подробный журнал',help:'Больше просмотров на каждого: вкусы видны точнее, но считать дольше.',max:JOURNAL.length-1,price:l=>Math.round(400*Math.pow(2.7,l)),now:l=>JOURNAL[l]+' просмотров на человека'},
 cpu:{title:'Процессоры',help:'Все блоки считают на 15% быстрее.',max:Infinity,price:l=>Math.round(120*Math.pow(1.55,l)),now:l=>'×'+Math.pow(1.15,l).toFixed(2).replace('.',',')},
 ads:{title:'Отдел рекламы',help:'Доход больше на 12%.',max:Infinity,price:l=>Math.round(90*Math.pow(1.42,l)),now:l=>'×'+Math.pow(1.12,l).toFixed(2).replace('.',',')},
 reach:{title:'Приглашения',help:'Сеть вмещает на 18% больше людей. Чем больше людей, тем дольше расчёт.',max:Infinity,price:l=>Math.round(300*Math.pow(1.92,l)),now:l=>'×'+Math.pow(1.18,l).toFixed(2).replace('.',',')}};
const blockPrice=(G,n)=>{const same=G.nodes.filter(m=>m.type===n.type),i=same.indexOf(n);return Math.round(15*(1+Math.max(0,i)*.2)*Math.pow(1.45,n.lv||0));};
function init(seed){return{seed,t:0,money:60,earned:0,users:2000,lv:{labels:0,journal:0,cpu:0,ads:0,reach:0},goal:0,hold:0,rep:0,orders:[],orderSeq:0,done:0,acc:0,hit:0,share:0,watch:40,cycle:0,income:1,peak:{acc:0,hit:0}};}
const sourcesOf=S=>{const R=raw(world(S.seed),S.lv.labels,S.lv.journal);return Object.assign(Object.create(null),R,{key:S.seed+':'+S.lv.labels+':'+S.lv.journal});};
function buy(S,k){const it=SHOP[k],l=S.lv[k];if(l>=it.max)return false;const c=it.price(l);if(S.money<c)return false;S.money-=c;S.lv[k]++;return true;}
function upgrade(S,G,n){const c=blockPrice(G,n);if(S.money<c)return false;S.money-=c;n.lv=(n.lv||0)+1;n.spent=(n.spent||0)+c;return true;}
// пересчитать показатели по основной схеме
function measure(S,G,cache){const W=world(S.seed),R=run(G,sourcesOf(S),cache),ts=topicScore(W,resultOf(G,R,'topics')),fs=feedScore(W,resultOf(G,R,'feed')),tm=timing(G,R,S);
 S.acc=ts.acc;S.hit=fs.hit;S.share=fs.share;S.cycle=tm.cycle;S.peak.acc=Math.max(S.peak.acc,ts.acc);S.peak.hit=Math.max(S.peak.hit,fs.hit);return{R,ts,fs,tm};}
// секунд в сети на человека
const watchOf=S=>(40+80*S.acc+60*S.acc*S.acc+900*Math.pow(S.hit,2))*freshness(S.cycle);
const capUsers=S=>Math.min(5e6,2000*Math.pow(S.watch/40,1.25)*Math.pow(1.18,S.lv.reach));
const incomeOf=S=>(.8+Math.pow(S.users/2000,.75)*S.watch/80)*Math.pow(1.12,S.lv.ads)*(1+S.rep*.03);
function step(S){S.t++;const w=watchOf(S);S.watch+=(w-S.watch)*.12;const cap=capUsers(S);S.users+=(cap-S.users)*(cap>S.users?.012:.03);S.income=incomeOf(S);S.money+=S.income;S.earned+=S.income;}
const API={hash,clamp,TN,NP,HIST,FRESH,TOPN,LABELS,JOURNAL,world,raw,trueShare,BLOCKS,SLOTS,NAMES,CALC,CMP,AGG,SHOP,insOf,connect,reaches,run,resultOf,topicScore,feedScore,base,timing,speed,crowd,freshness,blockPrice,init,sourcesOf,buy,upgrade,measure,watchOf,capUsers,incomeOf,step};
if(typeof module!=='undefined')module.exports=API;else root.Core=API;
})(this);
