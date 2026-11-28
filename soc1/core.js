// Соцсеть из деталей: движок. Телефоны людей → события → узлы игрока → таблицы → экран и панель.
(function(){
const EVENTS={press:'кнопку нажали',open:'открыли приложение',close:'закрыли приложение',min:'свернули приложение',back:'вернулись в приложение',
 shown:'пост появился на экране',hidden:'пост ушёл с экрана',touch:'палец коснулся экрана',idle:'экран давно не трогают',tick:'сигнал раз в … (пока приложение на экране)'};
const TH={edge:'виден хоть краешек',half:'видна половина поста',full:'пост виден целиком',main:'пост занял больше половины экрана'};
const sees=(p,th)=>th==='edge'?p.f>0:th==='half'?p.f>=.5:th==='full'?p.f>=.99:p.s>=.5;
const KEYS={pair:'человек и пост',who:'человек',post:'пост',one:'одна общая строка'};
const MODES={add:'новая строка каждый раз',set:'одна на ключ: заменять',sum:'одна на ключ: прибавлять'};
const OPS={rows:'сколько строк',people:'сколько разных людей',sumv:'сумма чисел',avg:'среднее число'};
const BY={all:'по всем вместе',post:'для каждого поста',who:'для каждого человека'};
const PORTS={ev:{in:[],out:'e'},gate:{in:[['e','событие']],out:'e'},light:{in:[['e','когда']],out:null},
 table:{in:[['write','записать'],['minus','отнять'],['del','стереть']],out:'t'},watch:{in:[['start','пустить'],['pause','пауза'],['resume','дальше'],['stop','стоп'],['reset','сбросить']],out:'e'},
 calc:{in:[['t','таблица']],out:'t'},panel:{in:[['t','число']],out:null}};
const OUTKIND={ev:'e',gate:'e',watch:'e',table:'t',calc:'t'};
const INKIND={e:'e',tab:'t',t:'t',write:'e',minus:'e',del:'e',start:'e',pause:'e',resume:'e',stop:'e',reset:'e'};
const DEF={ev:{kind:'press',n:10,th:'edge'},gate:{cond:'no',tab:''},light:{mode:'on'},table:{name:'Таблица',key:'pair',mode:'add',life:0},watch:{per:'who'},calc:{op:'rows',by:'all'},panel:{m:''}};

// ---------- мир одной сети ----------
function World(G){
 const W={G,t:0,tables:{},watches:{},temp:new Set(),phones:{},writes:0,log:[],fired:new Set()};
 const nodes=Object.fromEntries(G.nodes.map(n=>[n.id,n]));
 G.nodes.forEach(n=>{if(n.type==='table')W.tables[n.id]=[];if(n.type==='watch')W.watches[n.id]=new Map();});
 const into=(id,port)=>G.wires.filter(w=>w[1]===id&&w[2]===port).map(w=>w[0]);
 const from=id=>G.wires.filter(w=>w[0]===id);
 const kk=(key,r)=>key==='pair'?r.who+'|'+r.post:key==='who'?String(r.who):key==='post'?String(r.post):'*';
 const rows=id=>{const n=nodes[id];if(!n||n.type!=='table')return [];
  if(+n.p.life)W.tables[id]=W.tables[id].filter(r=>W.t-r.t<=+n.p.life);return W.tables[id];};
 const find=(id,e)=>{const n=nodes[id];if(!n||n.type!=='table')return null;const k=n.p.key;
  if((k==='pair'||k==='post')&&e.post==null)return null;if((k==='pair'||k==='who')&&e.who==null)return null;
  return rows(id).find(r=>kk(k,r)===kk(k,e))||null;};
 const say=(s,id)=>{W.log.push(s);if(id)W.fired.add(id);};
 const tname=id=>'«'+nodes[id].p.name+'»';
 // одна волна: сначала все условия смотрят на старое состояние, потом таблицы меняются
 function wave(sources){
  const acts=[],next=[];
  const go=(id,e,depth)=>{if(depth>20)return;
   for(const [,to,port] of from(id)){const n=nodes[to];if(!n)continue;
    if(n.type==='gate'&&port==='e'){const tab=n.p.tab;if(!tab||!nodes[tab]){say('«Только если»: не выбрано, в какой таблице искать',to);continue;}
     const has=!!find(tab,e),ok=n.p.cond==='has'?has:!has;
     say(`«Только если» в ${tname(tab)} ${n.p.cond==='has'?'уже есть':'ещё нет'} строки: ${ok?'да, пропускаю':'нет, стоп'}`,to);if(ok)go(to,e,depth+1);}
    else if(n.type==='light'&&port==='e')acts.push({n,port,e});
    else if(n.type==='table')acts.push({n,port,e});
    else if(n.type==='watch'){const pair=n.p.per==='pair';if(pair&&e.post==null&&port==='start'){say('Секундомер «на человека и пост»: пустить нечего, в этом событии нет поста',to);continue;}
     const m=W.watches[to];
     // у события без поста (тишина, касание) пауза и сброс действуют на все секундомеры этого человека
     const keys=!pair?[String(e.who)]:e.post!=null?[e.who+'|'+e.post]:[...m.keys()].filter(k=>k.startsWith(e.who+'|'));
     for(const k of keys){const w=m.get(k);
     if(port==='start'){if(!w){m.set(k,{who:e.who,post:e.post,acc:0,from:W.t});say('Секундомер пущен',to);}
      else if(w.from==null){w.from=W.t;say('Секундомер пошёл дальше',to);}else say('Секундомер уже идёт, «пустить» ничего не меняет',to);}
     else if(!w)continue;
     else if(port==='pause'){if(w.from!=null){w.acc+=W.t-w.from;w.from=null;say(`Секундомер на паузе: ${Math.round(w.acc)} с`,to);}}
     else if(port==='resume'){if(w.from==null){w.from=W.t;say('Секундомер пошёл дальше',to);}}
     else if(port==='reset'){m.delete(k);say('Замер выброшен',to);}
     else if(port==='stop'){const v=w.acc+(w.from!=null?W.t-w.from:0);m.delete(k);say(`Секундомер остановлен: ${Math.round(v)} с`,to);next.push({id:to,e:{who:w.who,post:w.post,v}});}
    }}}};
  for(const s of sources)go(s.id,s.e,0);
  // порядок: сначала стирания, потом записи
  acts.sort((a,b)=>(a.port==='del'?0:1)-(b.port==='del'?0:1));
  for(const {n,port,e} of acts){
   if(n.type==='light'){if(e.post==null){say('Кнопку зажигать не на чем: в событии нет поста',n.id);continue;}
    const k=e.who+'|'+e.post,on=n.p.mode==='on'?true:n.p.mode==='off'?false:!W.temp.has(k);on?W.temp.add(k):W.temp.delete(k);say(on?'Кнопка загорелась':'Кнопка погасла',n.id);continue;}
   const k=n.p.key;if(((k==='pair'||k==='post')&&e.post==null)){say(`${tname(n.id)}: в этом событии нет поста, строку не к чему привязать`,n.id);continue;}
   const old=find(n.id,e),v=e.v!=null?e.v:1;
   if(port==='del'){if(old){W.tables[n.id].splice(W.tables[n.id].indexOf(old),1);W.writes++;say(`Из ${tname(n.id)} стёрта строка`,n.id);}else say(`${tname(n.id)}: стирать нечего`,n.id);continue;}
   const sign=port==='minus'?-1:1;
   if(port==='minus'&&n.p.mode!=='sum'){say(`${tname(n.id)}: «отнять» работает только когда таблица прибавляет`,n.id);continue;}
   const row={who:k==='pair'||k==='who'||n.p.mode==='add'?e.who:null,post:k==='pair'||k==='post'||n.p.mode==='add'?e.post:null,v:sign*v,n:sign,t:W.t};
   W.writes++;
   if(n.p.mode==='add'||!old){W.tables[n.id].push(row);say(`В ${tname(n.id)} добавлена строка`,n.id);}
   else if(n.p.mode==='set'){Object.assign(old,row);say(`В ${tname(n.id)} строка заменена`,n.id);}
   else{old.v+=sign*v;old.n+=sign;old.t=W.t;say(`В ${tname(n.id)} ${sign>0?'прибавлено':'отнято'}, стало ${Math.round(old.v)}`,n.id);}
  }
  if(next.length)wave(next);
 }
 W.emit=(kind,e,extra)=>{
  const src=G.nodes.filter(n=>n.type==='ev'&&n.p.kind===kind&&(!extra||extra(n)));if(!src.length)return;
  src.forEach(n=>W.fired.add(n.id));W.log.push(`Событие «${kind==='idle'?'экран не трогают '+src[0].p.n+' с':kind==='tick'?'сигнал раз в '+src[0].p.n+' с':EVENTS[kind]}»`);
  wave(src.map(n=>({id:n.id,e:Object.assign({},e)})));};

 // ---------- телефоны ----------
 const phone=who=>W.phones[who]||(W.phones[who]={app:'off',view:[],lastTouch:0,idled:{},ticks:{}});
 const visibleNow=ph=>ph.app==='on'?ph.view:[];
 function viewDiff(who,before,after){ // «ушёл» раньше, чем «появился»
  const ths=[...new Set(G.nodes.filter(n=>n.type==='ev'&&(n.p.kind==='shown'||n.p.kind==='hidden')).map(n=>n.p.th))];
  for(const kind of ['hidden','shown'])for(const th of ths){
   const a=before.filter(p=>sees(p,th)).map(p=>p.id),b=after.filter(p=>sees(p,th)).map(p=>p.id);
   const list=kind==='hidden'?a.filter(x=>!b.includes(x)):b.filter(x=>!a.includes(x));
   for(const id of list)W.emit(kind,{who,post:id},n=>n.p.th===th);}
 }
 const timers=(kind)=>[...new Set(G.nodes.filter(n=>n.type==='ev'&&n.p.kind===kind).map(n=>+n.p.n))];
 W.advance=to=>{
  for(let guard=0;guard<20000;guard++){
   let best=null;
   for(const [who,ph] of Object.entries(W.phones)){if(ph.app!=='on')continue;
    for(const N of timers('idle')){const at=ph.lastTouch+N;if(!ph.idled[N]&&at<=to&&(!best||at<best.at))best={at,who,ph,N,kind:'idle'};}
    for(const N of timers('tick')){const last=ph.ticks[N]??ph.since;const at=last+N;if(at<=to&&(!best||at<best.at))best={at,who,ph,N,kind:'tick'};}}
   if(!best)break;
   W.t=Math.max(W.t,best.at);if(best.kind==='idle')best.ph.idled[best.N]=1;else best.ph.ticks[best.N]=best.at;
   W.emit(best.kind,{who:best.who},n=>+n.p.n===best.N);
  }
  W.t=Math.max(W.t,to);};
 const touch=(who,ph)=>{ph.lastTouch=W.t;ph.idled={};W.emit('touch',{who});};
 const awake=ph=>{ph.lastTouch=W.t;ph.idled={};ph.ticks={};ph.since=W.t;};
 // действие человека: {a:'open'|'close'|'min'|'back'|'dead'|'view'|'press', who, view, post}
 W.act=x=>{
  const who=x.who,ph=phone(who),before=visibleNow(ph).slice();
  if(x.a==='open'){if(ph.app!=='off'&&ph.app!=='dead')return;ph.app='on';ph.view=x.view||ph.view;awake(ph);for(const k of [...W.temp])if(k.startsWith(who+'|'))W.temp.delete(k);W.emit('open',{who});viewDiff(who,[],ph.view);}
  else if(x.a==='close'){if(ph.app==='off'||ph.app==='dead')return;ph.app='off';viewDiff(who,before,[]);W.emit('close',{who});for(const k of [...W.temp])if(k.startsWith(who+'|'))W.temp.delete(k);}
  else if(x.a==='min'){if(ph.app!=='on')return;ph.app='min';viewDiff(who,before,[]);W.emit('min',{who});}
  else if(x.a==='back'){if(ph.app!=='min')return;ph.app='on';awake(ph);W.emit('back',{who});viewDiff(who,[],ph.view);}
  else if(x.a==='dead'){ph.app='dead';for(const k of [...W.temp])if(k.startsWith(who+'|'))W.temp.delete(k);}
  else if(x.a==='view'){if(ph.app!=='on')return;touch(who,ph);ph.view=x.view;viewDiff(who,before,ph.view);}
  else if(x.a==='touch'){if(ph.app!=='on')return;touch(who,ph);}
  else if(x.a==='press'){if(ph.app!=='on')return;touch(who,ph);W.emit('press',{who,post:x.post});}
 };
 // ---------- что видно ----------
 W.rows=rows;
 W.calc=id=>{const n=nodes[id];if(!n||n.type!=='calc')return null;const src=into(id,'t')[0];if(!src||!nodes[src]||nodes[src].type!=='table')return null;
  const groups=new Map();for(const r of rows(src)){const key=n.p.by==='all'?'*':r[n.p.by];if(key==null)continue;(groups.get(key)||groups.set(key,[]).get(key)).push(r);}
  const f=g=>{const sum=g.reduce((s,r)=>s+r.v,0),cnt=g.reduce((s,r)=>s+r.n,0);
   return n.p.op==='rows'?g.length:n.p.op==='people'?new Set(g.map(r=>r.who).filter(x=>x!=null)).size:n.p.op==='sumv'?sum:cnt?sum/cnt:0;};
  const out=new Map([...groups].map(([k,g])=>[k,f(g)]));if(n.p.by==='all'&&!out.size)out.set('*',0);return {by:n.p.by,map:out,read:rows(src).length};};
 W.lit=(screen,who,post)=>screen.litBy&&nodes[screen.litBy]?!!find(screen.litBy,{who,post}):W.temp.has(who+'|'+post);
 W.count=(screen,post)=>{const c=screen.countBy&&W.calc(screen.countBy);if(!c)return null;return c.by==='all'?c.map.get('*'):c.by==='post'?(c.map.get(post)||0):null;};
 W.panel=m=>{const p=G.nodes.find(n=>n.type==='panel'&&n.p.m===m);if(!p)return null;const src=into(p.id,'t')[0];return src?W.calc(src):null;};
 return W;
}
const Core={EVENTS,TH,KEYS,MODES,OPS,BY,PORTS,OUTKIND,INKIND,DEF,World,sees};
if(typeof module!=='undefined')module.exports=Core;else window.Core=Core;
})();
