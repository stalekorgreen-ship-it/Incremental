(function(){
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const {TH,KEYS,MODES,OPS,BY,DEF,World}=Core,{MOD,MDEF,LOGIC,SINGLE,kindIn,kindOut,canWire,compile,fromEngine}=Graph,{LEVELS,NAMES,POSTS}=Levels;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const copy=o=>JSON.parse(JSON.stringify(o)),rnd=v=>Math.round(v*10)/10;
const KEY='lentaos-soc1-2';
const engine=()=>{const E=compile(S);E.G.nodes.forEach(n=>n.p=Object.assign({},DEF[n.type],n.p));return E;};
function norm(U){U=copy(U);U.nodes.forEach(n=>{n.x=n.x||0;n.y=n.y||0;});U.nodes.forEach(n=>n.p=Object.assign({},LOGIC.includes(n.type)?DEF[n.type]:MDEF[n.type],n.p));return U;}
let M={i:0,stage:0,open:1,done:{},saved:{},stat:{},cur:null,hints:0,nid:1};
let S,fail=null,armed=null,undoStack=[],view={x:20,y:20,z:1};
const lv=()=>LEVELS[M.i],stat=()=>M.stat[lv().id]||(M.stat[lv().id]={sec:0,hints:0,checks:0});
const types=id=>(node(id)||{}).type;
const save=()=>{M.cur=S;try{localStorage.setItem(KEY,JSON.stringify(M));}catch(e){}};
const node=id=>S.nodes.find(n=>n.id===id);

// ---------- раскладка ----------
function tidy(){const used=n=>S.wires.some(w=>w[0]===n.id&&kindOut(n.type,w[1])==='e');
 const place=n=>({app:[0,0],finger:[0,1],timer:[0,2],button:[0,3],number:[0,4],text:[0,5],post:used(n)?[0,2.5]:[1,5],screen:[2,5],gate:[1,0],watch:[1,1],table:[2,0],calc:[3,0],panel:[4,0]}[n.type]);
 const list=S.nodes.map(n=>[n,place(n)]),hasPostSrc=S.nodes.some(n=>n.type==='post'&&used(n));
 // когда пост сам даёт события, он встаёт правее своих частей, а расчёты сдвигаются дальше
 if(hasPostSrc)list.forEach(x=>{const t=x[0].type;x[1]=({post:[1,5],screen:[2,5],app:[1,0],finger:[1,1],timer:[1,2],gate:[2,0],watch:[2,1],table:[3,0],calc:[4,0],panel:[4,1]})[t]||x[1];});
 const cols=[...new Set(list.map(x=>x[1][0]))].sort((x,y)=>x-y),ys={};
 list.sort((x,y)=>x[1][1]-y[1][1]);
 // нижний ряд «что внутри чего» не поднимаем выше блоков, которые идут перед ним
 for(const [n,[c]] of list){const x=cols.indexOf(c),el=$(`.node[data-id="${n.id}"]`);let y=ys[x]||0;if(n.type==='screen'){const p=S.nodes.find(m=>m.type==='post');if(p&&p.y>y&&p.x<x*300)y=p.y;}
  n.x=x*300;n.y=y;ys[x]=y+(el?el.offsetHeight:170)+(n.type==='table'||n.type==='calc'?90:34);}}
function fit(){const els=$$('.node');if(!els.length){view={x:20,y:20,z:1};return applyView();}
 const x0=Math.min(...S.nodes.map(n=>n.x)),y0=Math.min(...S.nodes.map(n=>n.y)),x1=Math.max(...els.map(e=>node(e.dataset.id).x+e.offsetWidth)),y1=Math.max(...els.map(e=>node(e.dataset.id).y+e.offsetHeight));
 const r=$('#stage').getBoundingClientRect();const z=Math.max(.25,Math.min(1,(r.width-50)/(x1-x0),(r.height-170)/(y1-y0)));view={z,x:(r.width-(x1-x0)*z)/2-x0*z,y:78-y0*z};applyView();}
const applyView=()=>$('#world').style.transform=`translate(${view.x}px,${view.y}px) scale(${view.z})`;

// ---------- узлы ----------
const tables=()=>S.nodes.filter(n=>n.type==='table'),calcs=()=>S.nodes.filter(n=>n.type==='calc');
const opt=(obj,v)=>Object.entries(obj).map(([k,t])=>`<option value="${k}"${String(k)===String(v)?' selected':''}>${esc(t)}</option>`).join('');
const sel=(n,k,label,obj)=>`<label><span>${label}</span><select data-set="${k}">${opt(obj,n.p[k])}</select></label>`;
const list=(a,f)=>Object.fromEntries(a.map(x=>[x,f(x)]));
function cfg(n){const t=n.type;
 if(t==='post')return sel(n,'th','увиден, если',TH);
 if(t==='finger')return sel(n,'n','«давно» это',list([5,15,30,60,180],x=>x+' с без касаний'));
 if(t==='timer')return sel(n,'n','тик раз в',list([5,10,30,120],x=>x+' с'));
 if(t==='gate')return sel(n,'tab','искать в',Object.assign({'':'— выбери таблицу —'},Object.fromEntries(tables().map(x=>[x.id,x.p.name]))))+sel(n,'cond','строка',{no:'которой ещё нет',has:'которая уже есть'});
 if(t==='watch')return sel(n,'per','свой на',{who:'каждого человека',pair:'человека и пост'});
 if(t==='table')return `<label><span>имя</span><input data-set="name" value="${esc(n.p.name)}" maxlength="18"></label>`+sel(n,'key','строка на',KEYS)+sel(n,'mode','повтор',MODES)+sel(n,'life','хранить',{0:'всегда',15:'15 с без обновления',30:'30 с без обновления',60:'60 с без обновления',300:'5 мин без обновления'});
 if(t==='calc')return sel(n,'op','что',OPS)+sel(n,'by','как',BY);
 if(t==='panel'){const p=lv().panel;return sel(n,'m','это',Object.assign({'':'— выбери —'},p?{[p.m]:p.label}:{}));}
 return '';}
const KC={s:'#ffffff',e:'#e0a000',t:'#3a7ad0'};
function nodeHTML(n){const m=MOD[n.type];
 const port=(dir,[p,label,k])=>`<div class="port ${dir}" data-port="${p}" style="--k:${KC[k]}">${dir==='in'?'<b></b>':''}<span>${label}</span>${dir==='out'?'<b></b>':''}</div>`;
 const title=n.type==='table'?'Таблица «'+esc(n.p.name)+'»':m.name;
 return `<div class="node" data-id="${n.id}" data-type="${n.type}" style="left:${n.x}px;top:${n.y}px;--c:${m.c}"><header><b>${title}</b>${n.type==='screen'?'':'<button data-del title="Удалить">×</button>'}</header><div class="about">${m.about}</div><div class="ports">${m.in.map(x=>port('in',x)).join('')}${m.out.map(x=>port('out',x)).join('')}</div><div class="cfg">${cfg(n)}</div><div class="live" hidden></div></div>`;}
function drawNodes(){$$('.node').forEach(e=>e.remove());$('#world').insertAdjacentHTML('beforeend',S.nodes.map(nodeHTML).join(''));liveNodes();drawWires();
 $('#dock').innerHTML=lv().mods.filter(t=>!(SINGLE.includes(t)&&S.nodes.some(n=>n.type===t))).map(t=>`<button data-add="${t}" style="--c:${MOD[t].c}" title="${MOD[t].about}">+ ${MOD[t].name}</button>`).join('');}
function portEl(id,p,dir){return $(`.node[data-id="${id}"] .port.${dir}[data-port="${p}"]`);}
function portXY(id,p,dir){const n=node(id),el=portEl(id,p,dir);if(!el)return [n.x,n.y];const a=el.querySelector('b').getBoundingClientRect(),w=$('#world').getBoundingClientRect();return [(a.left+a.width/2-w.left)/view.z,(a.top+a.height/2-w.top)/view.z];}
function wirePath(w){const [x1,y1]=portXY(w[0],w[1],'out'),[x2,y2]=portXY(w[2],w[3],'in');
 if(x2>x1+20){const d=Math.max(50,(x2-x1)/2);return `M${x1} ${y1}C${x1+d} ${y1} ${x2-d} ${y2} ${x2} ${y2}`;}
 // провод назад идёт под блоками, чтобы его было видно
 const h=id=>{const e=$(`.node[data-id="${id}"]`);return node(id).y+(e?e.offsetHeight:150);},yb=Math.max(h(w[0]),h(w[2]))+26,mx=(x1+x2)/2;
 return `M${x1} ${y1}C${x1+70} ${y1} ${x1+70} ${yb} ${mx} ${yb}C${x2-70} ${yb} ${x2-70} ${y2} ${x2} ${y2}`;}
function drawWires(){$('#wires').innerHTML=S.wires.map((w,i)=>{const d=wirePath(w),k=kindOut(types(w[0]),w[1]);return `<g><path class="hit" data-w="${i}" d="${d}"/><path class="w k-${k}" d="${d}"/></g>`;}).join('');
 $$('.port').forEach(el=>{const id=el.closest('.node').dataset.id,p=el.dataset.port,out=el.classList.contains('out');el.classList.toggle('armed',!!armed&&out&&armed.id===id&&armed.port===p);el.classList.toggle('fit',!!armed&&!out&&canWire(node(armed.id),armed.port,node(id),p));});
 drawGuide();}
// пошаговая подсветка в первых испытаниях
function guideStep(){const l=lv();if(!l.guide||M.done[l.id]||M.stage)return null;const of=t=>S.nodes.find(n=>n.type===t);
 for(const g of l.guide){if(g[0]==='add'){if(!of(g[1]))return {g,text:g[2]};}else{const [,a,fp,b,tp,text]=g,x=of(a),y=of(b);
   if(!x)return {g:['add',a],text:`Нажми «+ ${MOD[a].name}».`};if(!y)return {g:['add',b],text:`Нажми «+ ${MOD[b].name}».`};if(!S.wires.some(w=>w[0]===x.id&&w[1]===fp&&w[2]===y.id&&w[3]===tp))return {g,text};}}
 return {g:['check'],text:'Готово. Нажми «✔ Проверить» вверху.'};}
function drawGuide(){$$('.glow').forEach(e=>e.classList.remove('glow'));const s=guideStep();$('#guide').classList.toggle('on',!!s&&!fail);if(!s||fail)return;$('#guide').textContent=s.text;const g=s.g;
 if(g[0]==='add')$(`#dock [data-add="${g[1]}"]`)?.classList.add('glow');else if(g[0]==='check')$('#b-check').classList.add('glow');
 else{const x=S.nodes.find(n=>n.type===g[1]),y=S.nodes.find(n=>n.type===g[3]);if(!armed)portEl(x.id,g[2],'out')?.classList.add('glow');else portEl(y.id,g[4],'in')?.classList.add('glow');}}
const who=x=>x==null?'':NAMES[x]||x,postName=x=>x==null?'':POSTS[x]?POSTS[x].who:x;
function liveNodes(){const W=D.W;$$('.node').forEach(el=>{const n=node(el.dataset.id),box=el.querySelector('.live');el.classList.toggle('fired',!!W&&[...D.fired].some(x=>x.split('.')[0]===n.id));let h='';
 if(W&&n.type==='table'){const r=W.rows(n.id);h=`строк: <b>${r.length}</b>`+(r.length?'<table>'+r.slice(-4).map(x=>`<tr><td>${esc([who(x.who),postName(x.post)].filter(Boolean).join(' · ')||'общая')}</td><td>${n.p.mode==='sum'?rnd(x.v)+' (замеров '+x.n+')':rnd(x.v)}</td></tr>`).join('')+'</table>':'');}
 if(W&&n.type==='calc'){const c=W.calc(n.id);h=c?`читает строк за раз: <b>${c.read}</b><table>`+[...c.map].slice(0,4).map(([k,v])=>`<tr><td>${esc(c.by==='all'?'всего':c.by==='post'?postName(k):who(k))}</td><td>${rnd(v)}</td></tr>`).join('')+'</table>':'подключи таблицу';}
 box.hidden=!h;box.innerHTML=h;});}

// ---------- телефон по шагам ----------
const D={src:'hand',W:null,i:0,steps:null,who:'a',fired:new Set(),log:[],narr:'',hand:{a:0,b:0}};
const FEED=[[{id:'p1',f:1,s:.6}],[{id:'p2',f:1,s:.6}],[{id:'p3',f:1,s:.6}]];
function resetPhone(src){if(src!=null)D.src=src;D.W=World(engine().G);D.i=0;D.fired=new Set();D.log=[];D.narr='';D.hand={};
 D.steps=D.src==='hand'?null:(lv().stages[+D.src.split(':')[0]]?.scen[+D.src.split(':')[1]]||{}).steps;if(!D.steps){D.src='hand';D.who='a';capture(()=>D.W.act({a:'open',who:'a',view:FEED[0]}));D.narr='Аня открыла приложение. Тут можно всё пробовать руками.';}else D.who=D.steps[0].who||'a';}
const SAY={open:'открывает приложение',close:'закрывает приложение',min:'сворачивает приложение',back:'возвращается в приложение',dead:'— села батарейка (сеть об этом не узнаёт)',view:'листает ленту',press:'нажимает «Нравится»',touch:'касается экрана'};
const clock=t=>{t=Math.round(t);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
function capture(fn){const a=D.W.log.length;D.W.fired.clear();fn();D.log=D.W.log.slice(a);D.fired=new Set(D.W.fired);}
function step(){if(!D.steps||D.i>=D.steps.length)return false;const s=D.steps[D.i++];
 const keep=[D.log,D.fired];capture(()=>{D.W.advance(s.t);if(!s.chk)D.W.act(s);});
 // на шаге проверки оставляем на виду то, что сеть сделала перед ней
 if(s.chk&&!D.log.length)[D.log,D.fired]=keep;
 if(s.chk){const bad=Check.verify(D.W,engine(),s);D.narr=`${clock(s.t)} · Проверка: ${bad?'✗ '+bad:'✓ всё сходится'}`;if(s.who)D.who=s.who;}
 else{D.who=s.who;D.narr=`${clock(s.t)} · ${NAMES[s.who]} ${SAY[s.a]}${s.a==='press'?' под «'+postName(s.post)+'»':''}`;}
 return true;}
function handAct(a){const w=D.who;if(a==='wait10'||a==='wait60'){capture(()=>D.W.advance(D.W.t+(a==='wait10'?10:60)));D.narr=`${clock(D.W.t)} · прошло ${a==='wait10'?10:60} с`;return;}
 let x={a,who:w};if(a==='open')x.view=FEED[D.hand[w]||0];if(a==='view'){D.hand[w]=((D.hand[w]||0)+1)%FEED.length;x.view=FEED[D.hand[w]];}if(a==='press')x.post=arguments[1];
 capture(()=>{D.W.advance(D.W.t+1);D.W.act(x);});D.narr=`${clock(D.W.t)} · ${NAMES[w]} ${SAY[a]}`;}
function phoneHTML(){const W=D.W,sc=Object.assign({label:'Нравится',pos:'left'},engine().screen),ph=W.phones[D.who]||{app:'off',view:[]};let body;
 if(ph.app!=='on')body=`<div class="screen off">${{off:'приложение закрыто',min:'приложение свёрнуто',dead:'батарейка села'}[ph.app]}</div>`;
 else body='<div class="screen">'+(sc.card?ph.view.map(v=>card(sc,v.id,{h:v.s,cut:v.f<1,f:v.f,lit:W.lit(sc,D.who,v.id),num:W.count(sc,v.id)})).join(''):'<p class="dim">пустой экран: ни один «Пост» не подключён</p>')+'</div>';
 return `<div class="phone"><div class="bar"><span>${NAMES[D.who]}</span><span>${clock(W.t)}</span></div>${body}</div>`;}
function card(sc,id,o){const p=POSTS[id];return `<div class="card${o.cut?' cut':''}" style="${o.h?'flex:'+Math.round(o.h*100)+' 1 0;min-height:'+(o.h<.12?18:34)+'px':''}"><small>${esc(p.who)}${o.cut?' · виден на '+Math.round(o.f*100)+'%':''}</small>${sc.text?esc(p.text):'<i class="dim">…пусто…</i>'}${sc.like||sc.count?`<div class="acts ${sc.pos}">${sc.like?`<button data-like="${id}" class="${o.lit?'lit':''}">♥ ${esc(sc.label)}</button>`:''}${sc.count?`<span class="num">${o.num==null?'?':rnd(o.num)}</span>`:''}</div>`:''}</div>`;}

// ---------- боковые колонки ----------
function taskHTML(){const l=lv(),st=l.stages[M.stage],done=M.done[l.id];
 return `<h2>${M.i+1}. ${esc(l.title)}</h2><p><b>${esc(l.goal)}</b></p><p class="dim">Новое: ${esc(l.learn)}.</p>`+
 (M.stage&&!done?`<div class="state ok">Этап ${M.stage} пройден. А теперь настоящая жизнь:</div><div class="advice">${esc(st.note||'')}</div>`:st.note?`<div class="advice">${esc(st.note)}</div>`:'')+
 (fail?`<div class="state bad"><b>Не вышло.</b> ${esc(fail.msg)}${fail.scen>=0?`<div class="row"><button data-show>Показать по шагам</button><span class="dim">${esc(st.scen[fail.scen].name)}</span></div>`:''}</div>`:'')+
 (done?`<div class="state ok"><b>Пройдено.</b> ${esc(l.after)}</div>${M.i<LEVELS.length-1?'<button data-next>Дальше →</button>':''}`:
  l.hints.slice(0,M.hints).map(h=>`<div class="advice">💡 ${esc(h)}</div>`).join('')+`<div class="row">${M.hints<l.hints.length?'<button data-hint>Подсказка</button>':'<button data-solve>Показать решение</button>'}<button data-skip>Пропустить</button></div>`)+
 `<p class="dim">Проверка смотрит не на схему, а на то, что сеть делает у людей.</p>`;}
function phoneTab(){const l=lv(),opts={hand:'Пробую руками'};l.stages.slice(0,M.stage+1).forEach((st,i)=>st.scen.forEach((sc,k)=>opts[i+':'+k]='Сценарий: '+sc.name));
 let h=`<div class="row"><select id="d-src">${opt(opts,D.src)}</select></div>`;
 if(D.src==='hand')h+=`<div class="row">${['a','b'].map(w=>`<button data-who="${w}" class="${D.who===w?'on':''}">${NAMES[w]}</button>`).join('')}</div><div class="row">${[['open','Открыть'],['view','Листать'],['min','Свернуть'],['back','Вернуться'],['close','Закрыть'],['dead','Села батарейка'],['wait10','+10 с'],['wait60','+60 с']].map(([a,t])=>`<button data-hand="${a}">${t}</button>`).join('')}</div>`;
 else h+=`<div class="row"><button data-d="step"${D.i>=D.steps.length?' disabled':''}><b>Шаг ▶</b></button><button data-d="end">До конца</button><button data-d="reset">Сначала</button><span class="dim">${D.i} из ${D.steps.length}</span></div>`;
 return h+`<div class="narr">${esc(D.narr||(D.src==='hand'?'Нажми «Открыть».':'Нажимай «Шаг».'))}</div>${phoneHTML()}<b>Что сделала сеть:</b><div class="log">${D.log.length?D.log.map(x=>`<div class="${x.startsWith('Событие')?'ev':''}">${esc(x)}</div>`).join(''):'<span class="dim">ничего: на это действие в сети ничего не подключено</span>'}</div>`;}
function panelTab(){const l=lv(),p=l.panel;let h='<h2>Панель владельца</h2>';
 if(p){const c=D.W.panel(p.m);if(!c)h+=`<div class="big">—<small>${esc(p.label)}: не подключено</small></div>`;
  else if(p.per)h+=`<p><b>${esc(p.label)}, ${p.unit}</b></p><table class="d">${[...c.map].map(([k,v])=>`<tr><td>${esc(c.by==='post'?postName(k):'всего')}</td><td>${rnd(v)}</td></tr>`).join('')||'<tr><td class="dim">замеров ещё нет</td></tr>'}</table>`;
  else h+=`<div class="big">${rnd(c.map.get('*')||0)}<small>${esc(p.label)}, ${p.unit}</small></div>`;}
 return h;}
function memLine(){const rows=tables().reduce((s,t)=>s+D.W.rows(t.id).length,0);return tables().length?`<p class="dim">Память: строк ${rows}, записей и стираний ${D.W.writes}</p>`:'';}
function drawSide(){for(const [sel,html] of [['#task',taskHTML()],['#phone',(lv().panel?panelTab():'')+phoneTab()+memLine()]]){const el=$(sel),top=el.scrollTop;el.innerHTML=html;el.scrollTop=top;}}
function drawTop(){const l=lv();$('#v-title').textContent=`Испытание ${M.i+1} из ${LEVELS.length}: ${l.title}`;$('#v-stage').textContent=M.done[l.id]?'✓ пройдено':l.stages.length>1?`этап ${M.stage+1} из ${l.stages.length}`:'один этап';$('#b-check').disabled=!!M.done[l.id];}
function refresh(){liveNodes();drawSide();drawTop();drawWires();}
function redraw(){drawNodes();refresh();}
// схема изменилась: телефон начинает заново
function changed(){fail=null;resetPhone();redraw();save();}
const remember=()=>{undoStack.push(JSON.stringify(S));if(undoStack.length>60)undoStack.shift();};
function undo(){if(!undoStack.length)return;S=JSON.parse(undoStack.pop());armed=null;changed();}

// ---------- испытания ----------
const FEEDMODS={screen:{card:true,text:true,like:true},G:{nodes:[],wires:[]}};
function startScheme(i){const l=LEVELS[i];if(l.start==='broken')return norm(fromEngine(l.broken));
 if(l.start==='empty'||l.start==='feed'){const U=norm(fromEngine(l.start==='feed'?FEEDMODS:{screen:{},G:{nodes:[],wires:[]}}));return U;}
 const prev=LEVELS[i-1];return norm(M.saved[prev.id]||fromEngine(prev.ref));}
function place(U){return U.nodes.every(n=>!n.x&&!n.y);}
function go(i){if(S)M.saved[lv().id]=copy(S);M.i=i;M.stage=0;M.hints=0;const l=lv();
 S=M.saved[l.id]?norm(M.saved[l.id]):startScheme(i);if(M.done[l.id])M.stage=l.stages.length-1;M.open=Math.max(M.open,i+1);
 fail=null;armed=null;undoStack=[];const fresh=S.nodes.every(n=>!n.x&&!n.y);resetPhone('hand');drawNodes();if(fresh){tidy();drawNodes();}redraw();fit();save();}
function check(){const l=lv();if(M.done[l.id])return;stat().checks++;const f=Check.runStage(engine(),l.stages[M.stage]);fail=f;
 if(f){refresh();save();return;}
 if(M.stage<l.stages.length-1){M.stage++;resetPhone('hand');refresh();save();return;}
 M.done[l.id]=1;M.saved[l.id]=copy(S);M.open=Math.max(M.open,M.i+2);refresh();save();win();}
function dialog(h,b){$('#d-h').textContent=h;$('#d-b').innerHTML=b;$('#veil').classList.add('on');}
const closeDlg=()=>$('#veil').classList.remove('on');
function win(){const l=lv();dialog('Пройдено: '+l.title,`<p>${esc(l.after)}</p><p><b>Как тебе это испытание?</b></p><div class="row">${[['fun','Интересно'],['mid','Так себе'],['boring','Скучно'],['stuck','Не понял, что делать']].map(([k,t])=>`<button data-rate="${k}">${t}</button>`).join('')}</div><div class="row">${M.i<LEVELS.length-1?'<button data-next><b>Дальше →</b></button>':'<button data-report><b>Отчёт о пробе</b></button>'}<button data-close>Остаться здесь</button></div>`);}
const RATE={fun:'интересно',mid:'так себе',boring:'скучно',stuck:'не понял'};
function report(){const t=LEVELS.map((l,i)=>{const s=M.stat[l.id];return s?`${i+1}. ${l.title}: ${M.done[l.id]?'пройдено':s.skipped?'пропущено':'не пройдено'}, ${Math.round(s.sec/60*10)/10} мин, проверок ${s.checks}, подсказок ${s.hints}${s.solved?', смотрел решение':''}${s.rate?', '+RATE[s.rate]:''}`:null;}).filter(Boolean).join('\n');
 dialog('Отчёт о пробе',`<p>Скопируй и пришли мне. Можно дописать своими словами.</p><textarea id="d-rep" readonly>${esc(t||'пока пусто')}</textarea><div class="row"><button data-copy>Скопировать</button><button data-close>Закрыть</button></div>`);}
function levelList(){dialog('Испытания',LEVELS.map((l,i)=>`<button class="lv" data-go="${i}"${i<M.open?'':' disabled'}><b>${M.done[l.id]?'✓':i+1}</b><span>${esc(l.title)}</span></button>`).join('')+`<div class="row"><button data-report>Отчёт о пробе</button><button data-restart>Это испытание заново</button><button data-wipe>Начать всё сначала</button><button data-close>Закрыть</button></div>`);}

// ---------- действия ----------
function connect(from,fp,to,tp){const a=node(from),b=node(to);if(!canWire(a,fp,b,tp))return false;
 if(S.wires.some(w=>w[0]===from&&w[1]===fp&&w[2]===to&&w[3]===tp))return true;remember();
 // у этих входов только один провод
 if(['t','lit','val','ui'].includes(tp))S.wires=S.wires.filter(w=>!(w[2]===to&&w[3]===tp));S.wires.push([from,fp,to,tp]);return true;}
function add(type){if(SINGLE.includes(type)&&S.nodes.some(n=>n.type===type))return;remember();const n={id:'n'+(M.nid++),type,p:copy(LOGIC.includes(type)?DEF[type]:MDEF[type]||{}),x:0,y:0};
 if(type==='table'){const used=tables().length;n.p.name='Таблица'+(used?' '+(used+1):'');}
 // новый блок встаёт в свободное место видимой части поля
 const r=$('#stage').getBoundingClientRect(),x0=Math.round((20-view.x)/view.z),x1=(r.width-view.x)/view.z-250;let x=x0,y=Math.round((78-view.y)/view.z);
 const hit=()=>$$('.node').some(el=>{const m=node(el.dataset.id);return m&&x<m.x+250&&x+250>m.x&&y<m.y+el.offsetHeight+30&&y+170>m.y;});
 for(let k=0;k<300&&hit();k++){x+=265;if(x>x1){x=x0;y+=90;}}
 n.x=x;n.y=y;S.nodes.push(n);changed();}
let drag=null;
$('#stage').addEventListener('pointerdown',e=>{if(e.target.closest('#dock,#zoom,#guide,select,input,button,.port,.hit'))return;const hd=e.target.closest('.node header');if(!hd&&e.target.closest('.node'))return;
 drag=hd?{n:node(hd.parentElement.dataset.id),el:hd.parentElement,x:e.clientX,y:e.clientY}:{x:e.clientX,y:e.clientY};drag.ox=drag.n?drag.n.x:view.x;drag.oy=drag.n?drag.n.y:view.y;});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.n){drag.n.x=Math.round(drag.ox+dx/view.z);drag.n.y=Math.round(drag.oy+dy/view.z);drag.el.style.left=drag.n.x+'px';drag.el.style.top=drag.n.y+'px';drawWires();}else{view.x=drag.ox+dx;view.y=drag.oy+dy;applyView();}});
addEventListener('pointerup',()=>{if(drag&&drag.n)save();drag=null;});
$('#stage').addEventListener('wheel',e=>{e.preventDefault();const r=$('#stage').getBoundingClientRect(),z=Math.max(.25,Math.min(1.6,view.z*(e.deltaY<0?1.1:.91))),mx=e.clientX-r.left,my=e.clientY-r.top;view={x:mx-(mx-view.x)*z/view.z,y:my-(my-view.y)*z/view.z,z};applyView();},{passive:false});
document.addEventListener('click',e=>{const t=e.target,b=t.closest('button');
 const port=t.closest('.port');
 if(port){const id=port.closest('.node').dataset.id,p=port.dataset.port;if(port.classList.contains('out'))armed=armed&&armed.id===id&&armed.port===p?null:{id,port:p};
  else if(armed){if(connect(armed.id,armed.port,id,p)){armed=null;changed();return;}}
  else{const rest=S.wires.filter(w=>!(w[2]===id&&w[3]===p));if(rest.length<S.wires.length){remember();S.wires=rest;changed();return;}}
  drawWires();return;}
 if(t.classList&&t.classList.contains('hit')){remember();S.wires.splice(+t.dataset.w,1);changed();return;}
 if(!b){if(t.closest('#stage')&&!t.closest('.node')&&armed){armed=null;drawWires();}return;}
 const d=b.dataset;
 if(b.hasAttribute('data-del')){const id=b.closest('.node').dataset.id;remember();S.nodes=S.nodes.filter(n=>n.id!==id);S.wires=S.wires.filter(w=>w[0]!==id&&w[2]!==id);S.nodes.forEach(n=>{if(n.p.tab===id)n.p.tab='';});armed=null;changed();}
 else if(d.add)add(d.add);
 else if(d.who){D.who=d.who;refresh();}
 else if(d.hand){handAct(d.hand);refresh();}
 else if(d.like&&D.src==='hand'){handAct('press',d.like);refresh();}
 else if(d.d){if(d.d==='reset')resetPhone();else if(d.d==='step')step();else while(step()){}refresh();}
 else if(b.hasAttribute('data-show')){resetPhone(M.stage+':'+fail.scen);while(D.i<fail.step&&step()){}step();refresh();}
 else if(b.id==='b-check')check();
 else if(b.hasAttribute('data-hint')){M.hints++;stat().hints=Math.max(stat().hints,M.hints);drawSide();save();}
 else if(b.hasAttribute('data-solve')){remember();S=norm(fromEngine(lv().ref));stat().solved=1;changed();tidy();redraw();fit();save();}
 else if(b.hasAttribute('data-skip')){stat().skipped=1;if(M.i<LEVELS.length-1){M.saved[lv().id]=fromEngine(lv().ref);const i=M.i+1;S=null;go(i);}else report();}
 else if(b.hasAttribute('data-next')){closeDlg();go(M.i+1);}
 else if(d.rate){stat().rate=d.rate;$$('[data-rate]').forEach(x=>x.classList.toggle('on',x===b));save();}
 else if(b.hasAttribute('data-close'))closeDlg();
 else if(b.id==='b-list')levelList();
 else if(d.go!=null){closeDlg();go(+d.go);}
 else if(b.hasAttribute('data-report'))report();
 else if(b.hasAttribute('data-copy')){const a=$('#d-rep');a.select();try{navigator.clipboard.writeText(a.value);}catch(_){}try{document.execCommand('copy');}catch(_){}b.textContent='Скопировано';}
 else if(b.hasAttribute('data-restart')){closeDlg();delete M.done[lv().id];delete M.saved[lv().id];const i=M.i;S=null;go(i);}
 else if(b.hasAttribute('data-wipe')){b.removeAttribute('data-wipe');b.setAttribute('data-wipe2','');b.textContent='Точно стереть всё?';}
 else if(b.hasAttribute('data-wipe2')){closeDlg();M={i:0,stage:0,open:1,done:{},saved:{},stat:{},cur:null,hints:0,nid:1};S=null;go(0);}
 else if(b.id==='b-undo')undo();
 else if(d.z){if(d.z==='fit')fit();else if(d.z==='tidy'){tidy();redraw();fit();save();}else{view.z=Math.max(.25,Math.min(1.6,view.z*+d.z));applyView();}}
});
document.addEventListener('change',e=>{const t=e.target;
 if(t.id==='d-src'){resetPhone(t.value);refresh();return;}
 if(t.dataset.set){const n=node(t.closest('.node').dataset.id);remember();const k=t.dataset.set;n.p[k]=k==='n'||k==='life'?+t.value:t.value;if(k==='name'&&!n.p.name.trim())n.p.name='Таблица';later();}});
// перерисовка после того, как отпустили мышь, иначе клик по соседней кнопке теряется
let pending=false,down=false;
function later(){if(pending)return;pending=true;const run=()=>{if(down)return setTimeout(run,30);pending=false;changed();};setTimeout(run,0);}
addEventListener('pointerdown',()=>down=true,true);addEventListener('pointerup',()=>down=false,true);addEventListener('pointercancel',()=>down=false,true);
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'&&!e.target.closest('input')){e.preventDefault();undo();}if(e.key==='Escape'){armed=null;closeDlg();drawWires();}});
setInterval(()=>{if(!document.hidden&&S&&!M.done[lv().id]){stat().sec++;if(stat().sec%10===0)save();}},1000);

try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.cur&&LEVELS[o.i])M=o;}catch(e){}
S=M.cur?norm(M.cur):startScheme(0);const first=S.nodes.every(n=>!n.x&&!n.y);resetPhone('hand');drawNodes();if(first){tidy();}redraw();fit();
window.__soc={get S(){return S;},engine,get M(){return M;},D};
})();
