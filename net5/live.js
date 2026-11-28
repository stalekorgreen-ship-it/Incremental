// ——— живая сеть: алгоритм работает по кругу. Берёт блоки из net4/core.js, добавляет память, пробы и лимит расчёта
(function(root){
const C=typeof require!=='undefined'?require('../net4/core.js'):root.Core;
const NP=24,NEW=6,LIFE=10,SLOTS=5,BUDGET=12000,DRIFT=80;
// скрытые увлечения. Игрок их не видит и названий нет: есть только слова
const INTERESTS=['кот котёнок лоток когти шерсть мурчит корм лежанка хвост миска усы ветеринар','грядка рассада теплица огурцы лейка урожай семена забор сарай лопата парник кабачки',
'модем процессор дискета монитор драйвер винчестер кулер плата мышка принтер разгон сокет','гол матч тренер вратарь турнир команда стадион мяч пенальти судья форвард кубок',
'кассета плеер гитара аккорд басист альбом концерт колонки припев барабаны радио винил','тесто духовка рецепт соус кастрюля специи начинка сковорода бульон корж противень дрожжи',
'крючок удочка клёв прикормка поплавок карась лодка спиннинг садок наживка улов блесна','палатка костёр рюкзак маршрут компас перевал привал котелок спальник тропа карта брод',
'марка альбом зубцовка каталог штемпель обмен коллекция выпуск лупа пинцет конверт гашение','двигатель карбюратор свеча гараж коробка сцепление покрышка масло домкрат фильтр капот стартер'].map(s=>s.split(' '));
const JUNK='это вчера просто наконец опять всем смотрите вот такое новое люблю совсем кстати сегодня короче'.split(' ');
const TITLE=['коты','огород','железо','футбол','музыка','готовка','рыбалка','походы','марки','машины'];// только для кнопки «подсмотреть правду»
const NAMES='Аня Борис Вера Глеб Даша Егор Жанна Захар Инна Кирилл Лена Макс Нина Олег Полина Рома Света Тимур Уля Фёдор Эля Юра Яна Марк'.split(' ');
const h=C.hash;
function makePost(seed,id,born){const r=(...k)=>h(seed,'post',id,...k),topic=(r('t')*INTERESTS.length)|0,words=[],n=4+(r('n')*3|0),own=INTERESTS[topic];
 for(let k=0;k<n;k++){const x=r('x',k);const w=x<.28?JUNK[(r('j',k)*JUNK.length)|0]:x<.36?INTERESTS[(r('o',k)*INTERESTS.length)|0][(r('ow',k)*12)|0]:own[(r('w',k)*own.length)|0];if(!words.includes(w))words.push(w);}
 // часть постов (4 из 10) — пустышки: тема та, а смотреть не хочется
 const q=r('bad')<.4?.1+r('q')*.2:.75+r('q')*.25;return{id,born,topic,words,q};}
function person(seed,p,era){const a=(h(seed,'fa',p,era)*INTERESTS.length)|0,b=(a+1+(h(seed,'fb',p,era)*(INTERESTS.length-1)|0))%INTERESTS.length;return INTERESTS.map((_,t)=>t===a?.95:t===b?.75:.06+h(seed,'tt',p,t)*.14);}
function init(seed){const W={seed,round:0,posts:[],byId:new Map(),next:101,taste:NAMES.map((_,p)=>person(seed,p,0)),seen:NAMES.map(()=>new Set()),reactions:[],mem:{},cache:new Map(),hist:[],load:0,stats:{shown:0,dead:0,unseen:0},served:NP,shown:[]};for(let i=LIFE-1;i>=0;i--)addPosts(W,-i);return W;}
function addPosts(W,born){for(let i=0;i<NEW;i++){const x=makePost(W.seed,W.next++,born);x.views=0;W.posts.push(x);W.byId.set(x.id,x);}}
const T=(cols,rows)=>({cols,rows});
function sources(W){const alive=W.posts,ids=new Set(alive.map(x=>x.id));for(const r of W.reactions)ids.add(r[1]);const known=[...ids].map(i=>W.byId.get(i));
 const cand=[];NAMES.forEach((n,p)=>{for(const x of alive)if(!W.seen[p].has(x.id))cand.push([n,x.id]);});
 return Object.assign(Object.create(null),{key:W.seed+':'+W.round,'Реакции':T(['человек','пост','доля'],W.reactions),'Слова постов':T(['пост','слово'],known.flatMap(x=>x.words.map(w=>[x.id,w]))),'Посты':T(['пост','возраст'],alive.map(x=>[x.id,W.round-x.born])),'Кандидаты':T(['человек','пост'],cand)});}
// ——— два новых блока
// «Склеить»: кому не нашлось пары, можно не выбрасывать, а дать число (например новому посту — среднее качество)
const oldJoin=C.OPS.join;
C.OPS.join=(p,I,src)=>{// ключи с разными названиями: «слово 2 = слово»
 if(p.on1&&p.on1.includes(' = ')){const[l,r]=p.on1.split(' = '),[x,y]=I,i=y.cols.indexOf(r);if(i<0||!x.cols.includes(l))throw new Error('нет столбца для «'+p.on1+'»');const used=y.cols.filter((c,k)=>k!==i),tmp={cols:y.cols.map((c,k)=>k===i?l:c!==p.on2&&x.cols.includes(c)?c+' ':c),rows:y.rows};const t=oldJoin({on1:l,on2:p.on2},[x,tmp],src);const cols=[];for(const c of t.cols){let n=c.trim(),k=2;while(cols.includes(n))n=c.trim()+' '+k++;cols.push(n);}return{cols,rows:t.rows};}
 const t=oldJoin(p,I,src);if(p.keep===undefined||p.keep===null||p.keep==='')return t;const v=Number(String(p.keep).replace(',','.'));if(Number.isNaN(v))throw new Error('впиши число для строк без пары');
 const[a,b]=I,keys=[p.on1||a.cols.find(c=>b.cols.includes(c))];if(p.on2&&p.on2!==keys[0])keys.push(p.on2);const ka=keys.map(k=>a.cols.indexOf(k)),kb=keys.map(k=>b.cols.indexOf(k)),has=new Set(b.rows.map(r=>kb.map(i=>r[i]).join('\u0001'))),extra=t.cols.length-a.cols.length;
 const rows=t.rows.concat(a.rows.filter(r=>!has.has(ka.map(i=>r[i]).join('\u0001'))).map(r=>[...r,...Array(extra).fill(v)]));return{cols:t.cols,rows};};
C.BLOCKS.rand={title:'Случайные N',ins:[['a','таблица']],w:.3,help:'Берёт наугад N строк: всего или в каждой группе. Каждый круг — другие. Так сеть пробует новое.'};
C.OPS.rand=(p,[a],src)=>{const ip=p.per?a.cols.indexOf(p.per):-1;if(p.per&&ip<0)throw new Error('нет столбца «'+p.per+'»');const n=Math.max(1,Math.min(100,Math.round(+p.n||1))),seen=new Map(),rows=[];for(const[r]of a.rows.map(r=>[r,h(src.key,...r)]).sort((x,y)=>x[1]-y[1])){const k=ip<0?0:r[ip],c=seen.get(k)||0;if(c<n){rows.push(r);seen.set(k,c+1);}}return T(a.cols,rows);};
C.BLOCKS.mem={title:'Память',ins:[['a','что запомнить']],w:.5,help:'Хранит итог между кругами. На выходе то, что накоплено к началу круга; новое записывается в конце. Поэтому из памяти можно вести провод обратно в то, что её пополняет.'};
C.BLOCKS.show={title:'Показ',ins:[['a','по оценке'],['b','на пробу']],w:.15,help:'Что увидят люди. «По оценке»: лучшие по столбцу оценки. «На пробу»: любые пары человек–пост. У каждого 5 мест.'};
const MODES={sum:'складывать',avg:'среднее за всё время',last:'только последнее'};
const FORGET=[0,2,5,10,25,50];
// память: ключ (1–2 столбца), значение, сколько раз
const memCols=p=>{const keys=[p.k1,p.k2].filter((k,i,l)=>k&&l.indexOf(k)===i);return{keys,name:p.name||'вес'};};
function memTable(W,n){const{keys,name}=memCols(n.p),m=W.mem[n.id];if(!keys.length)return null;if(!m||m.sig!==keys.join()+n.p.mode)return T([...keys,name,'раз'],[]);const rows=[];for(const e of m.map.values())rows.push([...e.key,n.p.mode==='sum'?e.s:n.p.mode==='last'?e.s:e.s/e.n,e.n]);return T([...keys,name,'раз'],rows);}
function memWrite(W,n,t){const{keys}=memCols(n.p),mode=n.p.mode||'avg',sig=keys.join()+n.p.mode;let m=W.mem[n.id];if(!m||m.sig!==sig)m=W.mem[n.id]={sig,map:new Map()};
 const keep=1-(+n.p.forget||0)/100;if(keep<1)for(const[k,e]of m.map){e.s*=keep;if(mode!=='sum'){}e.n*=keep;if(e.n<.2)m.map.delete(k);}
 if(!t)return null;const ik=keys.map(k=>t.cols.indexOf(k));if(ik.some(i=>i<0))return'нет столбца «'+keys[ik.findIndex(i=>i<0)]+'»';const iv=t.cols.indexOf(n.p.val);if(iv<0)return'выбери, что запоминать';if(t.rows.length&&typeof t.rows[0][iv]!=='number')return'в «'+n.p.val+'» не числа';
 for(const r of t.rows){const key=ik.map(i=>r[i]),k=key.join('\u0001');let e=m.map.get(k);if(!e)m.map.set(k,e={key,s:0,n:0});if(mode==='last'){e.s=r[iv];e.n=1;}else{e.s+=r[iv];e.n++;}}
 if(m.map.size>20000){let i=m.map.size-20000;for(const k of m.map.keys()){if(!i--)break;m.map.delete(k);}}return null;}
// расчёт схемы на этот круг. Память читается как готовая таблица; провод в неё — запись в конце круга
function compute(W,G){const src=sources(W),nodes=[],writes=[];for(const n of G.nodes){if(n.type==='mem'){const t=memTable(W,n),key='mem:'+n.id;if(t)src[key]=t;nodes.push({...n,type:'src',p:{table:t?key:''}});}else nodes.push(n);}
 const mems=new Set(G.nodes.filter(n=>n.type==='mem').map(n=>n.id)),g={nodes:nodes.map(n=>n.type==='show'?{...n,type:'show_'}:n),wires:G.wires.filter(w=>!mems.has(w[1]))};
 // «раз в K кругов»: между пересчётами блок отдаёт старое
 const R={},byId=new Map(g.nodes.map(n=>[n.id,n])),going=new Set();let cost=0;const costs={};
 const go=id=>{if(R[id])return R[id];if(going.has(id))return{err:'круг без памяти'};going.add(id);const n=byId.get(id),real=n.type==='show_'?'show':n.type,res=R[id]={table:null,err:null,rowsIn:0,inputs:[]};
  const ins=C.BLOCKS[real].ins.map(([port])=>{if(real==='src')return null;const w=g.wires.find(w=>w[1]===id&&w[2]===port);return w&&byId.has(w[0])?go(w[0]):null;});res.inputs=ins.map(x=>x&&x.table);
  if(real==='show'){res.rowsIn=ins.reduce((a,x)=>a+(x&&x.table?x.table.rows.length:0),0);res.table=ins[0]&&ins[0].table||ins[1]&&ins[1].table||null;if(!res.table)res.err='подключи, что показывать';}
  else if(real==='src'){res.table=src[n.p.table]||null;if(!res.table)res.err=mems.has(id)?'выбери, по чему помнить':'выбери таблицу';}
  else{const miss=ins.findIndex(x=>!x||!x.table);if(miss>=0)res.err=ins[miss]?'выше есть ошибка':'подключи: '+C.BLOCKS[real].ins[miss][1];
   else{const K=+n.p.every||1,old=W.cache.get(id),sig=real+JSON.stringify(n.p)+g.wires.filter(w=>w[1]===id).join();
    if(K>1&&old&&old.sig===sig&&W.round-old.round<K){res.table=old.table;res.rowsIn=old.rowsIn;res.old=W.round-old.round;}
    else{res.rowsIn=ins.reduce((a,x)=>a+x.table.rows.length,0);try{res.table=C.OPS[real](n.p,ins.map(x=>x.table),src);}catch(e){res.err=e.message;}if(res.table)W.cache.set(id,{sig,round:W.round,table:res.table,rowsIn:res.rowsIn});}
    costs[id]=res.rowsIn*C.BLOCKS[real].w/K;cost+=costs[id];}}
  return res;};
 for(const n of g.nodes)go(n.id);
 for(const n of G.nodes)if(n.type==='mem'){const w=G.wires.find(w=>w[1]===n.id),t=w&&R[w[0]]&&R[w[0]].table;const rows=t?t.rows.length:0;costs[n.id]=rows*C.BLOCKS.mem.w;cost+=costs[n.id];writes.push([n,t]);R[n.id].rowsIn=rows;R[n.id].stored=R[n.id].table?R[n.id].table.rows.length:0;if(!w)R[n.id].note='ничего не записывается: подключи вход';}
 return{R,writes,cost,costs,src};}
// кого и что показать
function plan(W,G,R){const out=NAMES.map(()=>[]),node=G.nodes.find(n=>n.type==='show');let err=null;if(!node)return{out,err:'нет блока «Показ»'};
 const tab=port=>{const w=G.wires.find(w=>w[1]===node.id&&w[2]===port);return w&&R[w[0]]&&R[w[0]].table;};const idx=new Map(NAMES.map((n,i)=>[n,i])),alive=new Set(W.posts.map(x=>x.id));
 const take=(t,score,quota)=>{if(!t||quota<=0)return;const ip=t.cols.indexOf('человек'),io=t.cols.indexOf('пост'),is=score?t.cols.indexOf(score):-1;if(ip<0||io<0){err='нужны столбцы «человек» и «пост»';return;}if(score&&is<0){err='выбери столбец оценки';return;}
  const per=NAMES.map(()=>[]);for(const r of t.rows){const p=idx.get(r[ip]);if(p!==undefined&&alive.has(r[io])&&!W.seen[p].has(r[io]))per[p].push([r[io],score?r[is]:h(W.seed,W.round,p,r[io])]);}
  per.forEach((l,p)=>{l.sort((a,b)=>b[1]-a[1]||h('tie',W.round,p,a[0])-h('tie',W.round,p,b[0]));let q=quota;for(const[post,s]of l){if(!q||out[p].length>=SLOTS)break;if(out[p].some(x=>x.post===post))continue;out[p].push({post,score:score?s:null});q--;}});};
 const trial=tab('b')?Math.max(0,Math.min(SLOTS,node.p.trial===undefined?1:+node.p.trial)):0;
 take(tab('a'),node.p.score,SLOTS-trial);take(tab('b'),null,trial);
 // места, оставшиеся без оценки, добирает проба
 if(tab('b'))take(tab('b'),null,trial?SLOTS:0);return{out,err,trial};}
const share=(W,p,x)=>Math.max(0,Math.min(1,W.taste[p][x.topic]*x.q));
// лучшее и случайное на этот круг — только для оценки схемы
function bounds(W){let best=0,rnd=0;NAMES.forEach((_,p)=>{const v=W.posts.filter(x=>!W.seen[p].has(x.id)).map(x=>share(W,p,x)).sort((a,b)=>b-a);best+=v.slice(0,SLOTS).reduce((a,c)=>a+c,0);rnd+=v.reduce((a,c)=>a+c,0)/(v.length||1)*SLOTS;});return{best:best/(NP*SLOTS),rnd:rnd/(NP*SLOTS)};}
function step(W,G){const c=compute(W,G),load=c.cost,served=Math.max(1,Math.round(NP*Math.min(1,BUDGET/(load||1))));W.load=load;W.served=served;
 // мощности не хватает — часть людей в этот круг ничего не получает (по очереди)
 const pl=plan(W,G,c.R),B=bounds(W),reactions=[],shown=NAMES.map(()=>[]);let got=0;
pl.out.forEach((l,p)=>{if((p+W.round*served)%NP>=served)return;for(const it of l){const x=W.byId.get(it.post),s=share(W,p,x),seen=Math.max(0,Math.min(1,s+(h(W.seed,'noise',W.round,p,x.id)-.5)*.3));got+=s;W.seen[p].add(x.id);x.views++;reactions.push([NAMES[p],x.id,Math.round(seen*100)/100]);shown[p].push({...it,real:s});}});
 for(const[n,t]of c.writes){const e=memWrite(W,n,t);if(e)c.R[n.id].note=e;}W.reactions=reactions;
 const q=got/(NP*SLOTS),score=(q-B.rnd)/(B.best-B.rnd);W.hist.push({s:score,q,slots:reactions.length/(NP*SLOTS)});if(W.hist.length>300)W.hist.shift();W.stats.shown+=reactions.length;
 W.shown=shown;
 W.round++;const gone=W.posts.filter(x=>W.round-x.born>=LIFE);for(const x of gone){W.stats.dead++;if(!x.views)W.stats.unseen++;}W.posts=W.posts.filter(x=>W.round-x.born<LIFE);addPosts(W,W.round);
 // старые посты забываются, кроме тех, о ком только что были реакции
 if(W.byId.size>400){const keep=new Set([...W.posts.map(x=>x.id),...W.reactions.map(r=>r[1])]);for(const id of W.byId.keys())if(!keep.has(id)&&id<W.next-300)W.byId.delete(id);}
 // раз в DRIFT кругов часть людей увлекается другим
 if(W.round%DRIFT===0){const era=W.round/DRIFT;NAMES.forEach((_,p)=>{if((p+era)%4===0)W.taste[p]=person(W.seed,p,era);});}
 return{...c,plan:pl};}
// оценка: среднее за последние n кругов, от случайного показа (0) до идеального (1)
const result=(W,n=20)=>{const l=W.hist.slice(-n);return l.length?l.reduce((a,x)=>a+x.s,0)/l.length:0;};
// провод в «Память» кругом не считается: память отдаёт то, что было до этого круга
function connect(G,from,to,port){const f=G.nodes.find(n=>n.id===from),t=G.nodes.find(n=>n.id===to);if(!f||!t||f.type==='show'||!C.BLOCKS[t.type].ins.some(i=>i[0]===port))return false;
 if(t.type!=='mem'){const mem=new Set(G.nodes.filter(n=>n.type==='mem').map(n=>n.id));if(from===to||C.reaches({wires:G.wires.filter(w=>!mem.has(w[1]))},to,from))return false;}G.wires=G.wires.filter(w=>!(w[1]===to&&w[2]===port));G.wires.push([from,to,port]);return true;}
const API={connect,NP,NEW,LIFE,SLOTS,BUDGET,DRIFT,NAMES,INTERESTS,JUNK,TITLE,MODES,FORGET,init,sources,compute,plan,step,result,memTable,memCols,share};
if(typeof module!=='undefined')module.exports=API;else root.Live=API;
})(this);
