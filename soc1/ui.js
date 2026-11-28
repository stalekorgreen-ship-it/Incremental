(function(){
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const {EVENTS,TH,KEYS,MODES,OPS,BY,PORTS,OUTKIND,INKIND,DEF,World}=Core,{LEVELS,NAMES,POSTS}=Levels;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const copy=o=>JSON.parse(JSON.stringify(o)),rnd=v=>Math.round(v*10)/10;
const KEY='lentaos-soc1';
const KIND={ev:['Событие','#a05000'],gate:['Только если','#702080'],light:['Кнопка: зажечь','#b0305a'],watch:['Секундомер','#8a6a00'],table:['Таблица','#005a40'],calc:['Посчитать','#00308a'],panel:['На панель','#303030']};
const fullScreen=s=>Object.assign({card:false,text:false,like:false,count:false,litBy:'',countBy:'',label:'Нравится',pos:'left'},s||{});
function norm(S){S=copy(S);S.screen=fullScreen(S.screen);S.G.nodes.forEach(n=>n.p=Object.assign({},DEF[n.type],n.p));return S;}
let M={i:0,stage:0,open:1,done:{},saved:{},stat:{},cur:null,hints:0,nid:1};
let S,tab='task',fail=null,armed=null,undoStack=[],view={x:20,y:20,z:1};
const lv=()=>LEVELS[M.i],stat=()=>M.stat[lv().id]||(M.stat[lv().id]={sec:0,hints:0,checks:0});
const save=()=>{M.cur=S;try{localStorage.setItem(KEY,JSON.stringify(M));}catch(e){}};
const node=id=>S.G.nodes.find(n=>n.id===id);

// ---------- раскладка ----------
function tidy(){const G=S.G,depth={};const d=(id,seen)=>{if(depth[id]!=null)return depth[id];if(seen.has(id))return 0;seen.add(id);
  const inn=G.wires.filter(w=>w[1]===id).map(w=>d(w[0],seen)+1);return depth[id]=inn.length?Math.max(...inn):0;};
 G.nodes.forEach(n=>d(n.id,new Set()));const cols={};G.nodes.forEach(n=>(cols[depth[n.id]]=cols[depth[n.id]]||[]).push(n));
 Object.keys(cols).forEach(c=>{let y=0;cols[c].forEach(n=>{n.x=c*300;n.y=y;const el=$(`.node[data-id="${n.id}"]`);y+=(el?el.offsetHeight:170)+(n.type==='table'||n.type==='calc'?90:30);});});}
function fit(){const els=$$('.node');if(!els.length){view={x:20,y:20,z:1};return applyView();}
 const x0=Math.min(...S.G.nodes.map(n=>n.x)),y0=Math.min(...S.G.nodes.map(n=>n.y)),x1=Math.max(...els.map(e=>node(e.dataset.id).x+e.offsetWidth)),y1=Math.max(...els.map(e=>node(e.dataset.id).y+e.offsetHeight));
 const r=$('#stage').getBoundingClientRect();const z=Math.max(.25,Math.min(1,(r.width-50)/(x1-x0),(r.height-110)/(y1-y0)));view={z,x:(r.width-(x1-x0)*z)/2-x0*z,y:44-y0*z};applyView();}
const applyView=()=>$('#world').style.transform=`translate(${view.x}px,${view.y}px) scale(${view.z})`;

// ---------- узлы ----------
const tables=()=>S.G.nodes.filter(n=>n.type==='table'),calcs=()=>S.G.nodes.filter(n=>n.type==='calc');
const opt=(obj,v)=>Object.entries(obj).map(([k,t])=>`<option value="${k}"${String(k)===String(v)?' selected':''}>${esc(t)}</option>`).join('');
const sel=(n,k,label,obj)=>`<label><span>${label}</span><select data-set="${k}">${opt(obj,n.p[k])}</select></label>`;
const list=(a,f)=>Object.fromEntries(a.map(x=>[x,f(x)]));
function cfg(n){const t=n.type;
 if(t==='ev'){const kinds=list([...new Set([...lv().events,n.p.kind])],k=>EVENTS[k]);let h=sel(n,'kind','когда',kinds);
  if(n.p.kind==='idle')h+=sel(n,'n','тишина',list([5,15,30,60,180],x=>x+' с'));if(n.p.kind==='tick')h+=sel(n,'n','раз в',list([5,10,30,120],x=>x+' с'));
  if(n.p.kind==='shown'||n.p.kind==='hidden')h+=sel(n,'th','«на экране»',TH);return h;}
 if(t==='gate')return sel(n,'tab','искать в',Object.assign({'':'— выбери таблицу —'},Object.fromEntries(tables().map(x=>[x.id,x.p.name]))))+sel(n,'cond','строка',{no:'которой ещё нет',has:'которая уже есть'});
 if(t==='light')return sel(n,'mode','кнопка',{on:'зажечь',off:'погасить',toggle:'переключить'});
 if(t==='watch')return sel(n,'per','свой на',{who:'каждого человека',pair:'человека и пост'});
 if(t==='table')return `<label><span>имя</span><input data-set="name" value="${esc(n.p.name)}" maxlength="18"></label>`+sel(n,'key','строка на',KEYS)+sel(n,'mode','повтор',MODES)+sel(n,'life','хранить',{0:'всегда',15:'15 с без обновления',30:'30 с без обновления',60:'60 с без обновления',300:'5 мин без обновления'});
 if(t==='calc')return sel(n,'op','что',OPS)+sel(n,'by','как',BY);
 if(t==='panel'){const p=lv().panel;return sel(n,'m','это',Object.assign({'':'— выбери —'},p?{[p.m]:p.label}:{}));}
 return '';}
function nodeHTML(n){const [name,c]=KIND[n.type],P=PORTS[n.type];
 const port=(dir,p,label)=>{const k=(dir==='out'?OUTKIND[n.type]:INKIND[p])==='e'?'#e0a000':'#3a7ad0';return `<div class="port ${dir}" data-port="${p}" style="--k:${k}">${dir==='in'?'<b></b>':''}<span>${label}</span>${dir==='out'?'<b></b>':''}</div>`;};
 const title=n.type==='table'?'Таблица «'+esc(n.p.name)+'»':n.type==='light'?'Огонёк кнопки':name;
 return `<div class="node" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px;--c:${c}"><header><b>${title}</b><button data-del title="Удалить">×</button></header><div class="ports">${P.in.map(([p,l])=>port('in',p,l)).join('')}${P.out?port('out','out',P.out==='e'?(n.type==='watch'?'остановлен → число':'дальше'):'что получилось'):''}</div><div class="cfg">${cfg(n)}</div><div class="live" hidden></div></div>`;}
function drawNodes(){$$('.node').forEach(e=>e.remove());$('#world').insertAdjacentHTML('beforeend',S.G.nodes.map(nodeHTML).join(''));liveNodes();drawWires();
 $('#empty').innerHTML=S.G.nodes.length?'':lv().tools.length?'<b>Поле пустое</b><br>Здесь ты решаешь, что сеть замечает и что делает.<br>Узлы — кнопками внизу.':'<b>Пока сеть ничего не делает</b><br>Начни с вкладки «Экран» справа.';
 $('#dock').innerHTML=lv().tools.map(t=>`<button data-add="${t}" style="--c:${KIND[t][1]}">+ ${t==='light'?'Огонёк кнопки':KIND[t][0]}</button>`).join('');}
function portXY(id,p){const n=node(id),el=$(`.node[data-id="${id}"] .port[data-port="${p}"] b`);if(!el)return [n.x,n.y];const a=el.getBoundingClientRect(),w=$('#world').getBoundingClientRect();return [(a.left+a.width/2-w.left)/view.z,(a.top+a.height/2-w.top)/view.z];}
function drawWires(){$('#wires').innerHTML=S.G.wires.map((w,i)=>{const [x1,y1]=portXY(w[0],'out'),[x2,y2]=portXY(w[1],w[2]),d=Math.max(60,Math.abs(x2-x1)/2),path=`M${x1} ${y1}C${x1+d} ${y1} ${x2-d} ${y2} ${x2} ${y2}`;
 return `<g><path class="hit" data-w="${i}" d="${path}"/><path class="w${OUTKIND[node(w[0]).type]==='t'?' tbl':''}" d="${path}"/></g>`;}).join('');
 $$('.port').forEach(el=>{const id=el.closest('.node').dataset.id,p=el.dataset.port;el.classList.toggle('armed',!!armed&&armed.id===id&&p==='out');el.classList.toggle('fit',!!armed&&p!=='out'&&id!==armed.id&&INKIND[p]===OUTKIND[node(armed.id).type]);});}
const who=x=>x==null?'':NAMES[x]||x,postName=x=>x==null?'':POSTS[x]?POSTS[x].who:x;
function liveNodes(){const W=D.W;$$('.node').forEach(el=>{const n=node(el.dataset.id),box=el.querySelector('.live');el.classList.toggle('fired',!!W&&D.fired.has(n.id));let h='';
 if(W&&n.type==='table'){const r=W.rows(n.id);h=`строк: <b>${r.length}</b>`+(r.length?'<table>'+r.slice(-4).map(x=>`<tr><td>${esc([who(x.who),postName(x.post)].filter(Boolean).join(' · ')||'общая')}</td><td>${n.p.mode==='sum'?rnd(x.v)+' (замеров '+x.n+')':rnd(x.v)}</td></tr>`).join('')+'</table>':'');}
 if(W&&n.type==='calc'){const c=W.calc(n.id);h=c?`читает строк за раз: <b>${c.read}</b><table>`+[...c.map].slice(0,4).map(([k,v])=>`<tr><td>${esc(c.by==='all'?'всего':c.by==='post'?postName(k):who(k))}</td><td>${rnd(v)}</td></tr>`).join('')+'</table>':'подключи таблицу';}
 box.hidden=!h;box.innerHTML=h;});}

// ---------- телефон по шагам ----------
const D={src:'hand',W:null,i:0,steps:null,who:'a',fired:new Set(),log:[],narr:'',hand:{a:0,b:0}};
const FEED=[[{id:'p1',f:1,s:.6}],[{id:'p2',f:1,s:.6}],[{id:'p3',f:1,s:.6}]];
function resetPhone(src){if(src!=null)D.src=src;D.W=World(norm(S).G);D.i=0;D.fired=new Set();D.log=[];D.narr='';D.hand={};
 D.steps=D.src==='hand'?null:(lv().stages[+D.src.split(':')[0]]?.scen[+D.src.split(':')[1]]||{}).steps;if(!D.steps){D.src='hand';D.who='a';}else D.who=D.steps[0].who||'a';}
const SAY={open:'открывает приложение',close:'закрывает приложение',min:'сворачивает приложение',back:'возвращается в приложение',dead:'— села батарейка (сеть об этом не узнаёт)',view:'листает ленту',press:'нажимает «Нравится»',touch:'касается экрана'};
const clock=t=>{t=Math.round(t);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
function capture(fn){const a=D.W.log.length;D.W.fired.clear();fn();D.log=D.W.log.slice(a);D.fired=new Set(D.W.fired);}
function step(){if(!D.steps||D.i>=D.steps.length)return false;const s=D.steps[D.i++];
 const keep=[D.log,D.fired];capture(()=>{D.W.advance(s.t);if(!s.chk)D.W.act(s);});
 // на шаге проверки оставляем на виду то, что сеть сделала перед ней
 if(s.chk&&!D.log.length)[D.log,D.fired]=keep;
 if(s.chk){const bad=Check.verify(D.W,norm(S),s);D.narr=`${clock(s.t)} · Проверка: ${bad?'✗ '+bad:'✓ всё сходится'}`;if(s.who)D.who=s.who;}
 else{D.who=s.who;D.narr=`${clock(s.t)} · ${NAMES[s.who]} ${SAY[s.a]}${s.a==='press'?' под «'+postName(s.post)+'»':''}`;}
 return true;}
function handAct(a){const w=D.who;if(a==='wait10'||a==='wait60'){capture(()=>D.W.advance(D.W.t+(a==='wait10'?10:60)));D.narr=`${clock(D.W.t)} · прошло ${a==='wait10'?10:60} с`;return;}
 let x={a,who:w};if(a==='open')x.view=FEED[D.hand[w]||0];if(a==='view'){D.hand[w]=((D.hand[w]||0)+1)%FEED.length;x.view=FEED[D.hand[w]];}if(a==='press')x.post=arguments[1];
 capture(()=>{D.W.advance(D.W.t+1);D.W.act(x);});D.narr=`${clock(D.W.t)} · ${NAMES[w]} ${SAY[a]}`;}
function phoneHTML(){const W=D.W,sc=norm(S).screen,ph=W.phones[D.who]||{app:'off',view:[]};let body;
 if(ph.app!=='on')body=`<div class="screen off">${{off:'приложение закрыто',min:'приложение свёрнуто',dead:'батарейка села'}[ph.app]}</div>`;
 else body='<div class="screen">'+(sc.card?ph.view.map(v=>card(sc,v.id,{h:v.s,cut:v.f<1,f:v.f,lit:W.lit(sc,D.who,v.id),num:W.count(sc,v.id)})).join(''):'<p class="dim">пустой экран</p>')+'</div>';
 return `<div class="phone"><div class="bar"><span>${NAMES[D.who]}</span><span>${clock(W.t)}</span></div>${body}</div>`;}
function card(sc,id,o){const p=POSTS[id];return `<div class="card${o.cut?' cut':''}" style="${o.h?'flex:'+Math.round(o.h*100)+' 1 0;min-height:'+(o.h<.12?18:34)+'px':''}"><small>${esc(p.who)}${o.cut?' · виден на '+Math.round(o.f*100)+'%':''}</small>${sc.text?esc(p.text):'<i class="dim">…пусто…</i>'}${sc.like||sc.count?`<div class="acts ${sc.pos}">${sc.like?`<button data-like="${id}" class="${o.lit?'lit':''}">♥ ${esc(sc.label)}</button>`:''}${sc.count?`<span class="num">${o.num==null?'?':rnd(o.num)}</span>`:''}</div>`:''}</div>`;}

// ---------- правая панель ----------
function taskHTML(){const l=lv(),st=l.stages[M.stage],done=M.done[l.id];
 return `<h2>${M.i+1}. ${esc(l.title)}</h2><p><b>${esc(l.goal)}</b></p><p class="dim">Новое: ${esc(l.learn)}.</p>`+
 (M.stage&&!done?`<div class="state ok">Этап ${M.stage} пройден. А теперь настоящая жизнь:</div><div class="advice">${esc(st.note||'')}</div>`:st.note?`<div class="advice">${esc(st.note)}</div>`:'')+
 (fail?`<div class="state bad"><b>Не вышло.</b> ${esc(fail.msg)}${fail.scen>=0?`<div class="row"><button data-show>Показать по шагам</button><span class="dim">${esc(st.scen[fail.scen].name)}</span></div>`:''}</div>`:'')+
 (done?`<div class="state ok"><b>Пройдено.</b> ${esc(l.after)}</div>${M.i<LEVELS.length-1?'<button data-next>Дальше →</button>':''}`:
  l.hints.slice(0,M.hints).map(h=>`<div class="advice">💡 ${esc(h)}</div>`).join('')+`<div class="row">${M.hints<l.hints.length?'<button data-hint>Подсказка</button>':'<button data-solve>Показать решение</button>'}<button data-skip>Пропустить</button></div>`)+
 `<p class="dim">Проверка смотрит не на схему, а на то, что сеть делает у людей.</p>`;}
function screenHTML(){const l=lv(),sc=S.screen,feed=l.start==='feed',can=p=>!feed&&l.parts.includes(p);
 const names={card:'карточку поста',text:'текст поста',like:'кнопку «Нравится»',count:'число лайков'};
 let h=feed?'<div class="advice">В этом испытании лента уже готова. Здесь она только для примера.</div>':'';
 h+='<div class="phone"><div class="screen">'+(sc.card?card(sc,'p1',{lit:false,num:null}):'<p class="dim">пустой экран</p>')+'</div></div>';
 h+=l.parts.filter(p=>!sc[p]&&(p==='card'||sc.card)&&can(p)).map(p=>`<button class="slot" data-part="${p}">+ добавить ${names[p]}</button>`).join('');
 if(sc.like){h+=`<h2>Кнопка</h2><div class="cfg"><label><span>надпись</span><input data-scr="label" value="${esc(sc.label)}" maxlength="14"></label><label><span>где</span><select data-scr="pos">${opt({left:'под постом слева',right:'под постом справа'},sc.pos)}</select></label><label><span>горит, когда</span><select data-scr="litBy">${opt(Object.assign({'':'зажёг «Огонёк кнопки»'},Object.fromEntries(tables().map(t=>[t.id,'есть строка в «'+t.p.name+'»']))),sc.litBy)}</select></label></div>`;}
 if(sc.count){h+=`<h2>Число лайков</h2><div class="cfg"><label><span>брать из</span><select data-scr="countBy">${opt(Object.assign({'':'— ниоткуда —'},Object.fromEntries(calcs().map((c,i)=>[c.id,`«Посчитать» ${i+1}: ${OPS[c.p.op]}, ${BY[c.p.by]}`]))),sc.countBy)}</select></label></div>`;}
 if(!feed&&sc.card)h+=`<div class="row"><button data-clear>Убрать всё с экрана</button></div>`;return h;}
function phoneTab(){const l=lv(),opts={hand:'Своими руками'};l.stages.slice(0,M.stage+1).forEach((st,i)=>st.scen.forEach((sc,k)=>opts[i+':'+k]='Сценарий: '+sc.name));
 let h=`<div class="row"><select id="d-src">${opt(opts,D.src)}</select></div>`;
 if(D.src==='hand')h+=`<div class="row">${['a','b'].map(w=>`<button data-who="${w}" class="${D.who===w?'on':''}">${NAMES[w]}</button>`).join('')}</div><div class="row">${[['open','Открыть'],['view','Листать'],['min','Свернуть'],['back','Вернуться'],['close','Закрыть'],['dead','Села батарейка'],['wait10','+10 с'],['wait60','+60 с']].map(([a,t])=>`<button data-hand="${a}">${t}</button>`).join('')}</div>`;
 else h+=`<div class="row"><button data-d="step"${D.i>=D.steps.length?' disabled':''}><b>Шаг ▶</b></button><button data-d="end">До конца</button><button data-d="reset">Сначала</button><span class="dim">${D.i} из ${D.steps.length}</span></div>`;
 return h+`<div class="narr">${esc(D.narr||(D.src==='hand'?'Нажми «Открыть».':'Нажимай «Шаг».'))}</div>${phoneHTML()}<b>Что сделала сеть:</b><div class="log">${D.log.length?D.log.map(x=>`<div class="${x.startsWith('Событие')?'ev':''}">${esc(x)}</div>`).join(''):'<span class="dim">ничего: на это действие у сети нет событий</span>'}</div>`;}
function panelTab(){const l=lv(),p=l.panel;let h='<h2>Панель владельца</h2>';
 if(!p)h+='<p class="dim">Пусто. Здесь появится только то, что ты сам посчитаешь и выведешь.</p>';
 else{const c=D.W.panel(p.m);if(!c)h+=`<div class="big">—<small>${esc(p.label)}: не подключено</small></div>`;
  else if(p.per)h+=`<p><b>${esc(p.label)}, ${p.unit}</b></p><table class="d">${[...c.map].map(([k,v])=>`<tr><td>${esc(c.by==='post'?postName(k):'всего')}</td><td>${rnd(v)}</td></tr>`).join('')||'<tr><td class="dim">замеров ещё нет</td></tr>'}</table>`;
  else h+=`<div class="big">${rnd(c.map.get('*')||0)}<small>${esc(p.label)}, ${p.unit}</small></div>`;}
 const rows=tables().reduce((s,t)=>s+D.W.rows(t.id).length,0);
 return h+`<h2>Расход памяти</h2><table class="d"><tr><td>строк хранится</td><td>${rows}</td></tr><tr><td>записей и стираний</td><td>${D.W.writes}</td></tr></table><p class="dim">Цифры — по тому, что сейчас проиграно в «Телефоне». Пока память бесплатная, расход только показывается.</p>`;}
function drawSide(){const body=$('#pbody'),top=body.scrollTop;body.innerHTML=tab==='task'?taskHTML():tab==='screen'?screenHTML():tab==='phone'?phoneTab():panelTab();body.scrollTop=top;
 $$('#ptabs button').forEach(b=>{b.classList.toggle('on',b.dataset.tab===tab);b.classList.toggle('glow',b.dataset.tab==='screen'&&M.i===0&&!S.screen.card&&tab!=='screen');});}
function drawTop(){const l=lv();$('#v-title').textContent=`Испытание ${M.i+1} из ${LEVELS.length}: ${l.title}`;$('#v-stage').textContent=M.done[l.id]?'✓ пройдено':l.stages.length>1?`этап ${M.stage+1} из ${l.stages.length}`:'один этап';$('#b-check').disabled=!!M.done[l.id];}
function refresh(){liveNodes();drawSide();drawTop();}
function redraw(){drawNodes();refresh();}
// схема изменилась: телефон начинает заново
function changed(){fail=null;resetPhone();redraw();save();}
const remember=()=>{undoStack.push(JSON.stringify(S));if(undoStack.length>60)undoStack.shift();};
function undo(){if(!undoStack.length)return;S=JSON.parse(undoStack.pop());armed=null;changed();}

// ---------- испытания ----------
function startScheme(i){const l=LEVELS[i];if(l.start==='broken')return norm(l.broken);if(l.start==='empty')return norm({screen:{},G:{nodes:[],wires:[]}});
 if(l.start==='feed')return norm({screen:{card:true,text:true,like:true},G:{nodes:[],wires:[]}});const prev=LEVELS[i-1];return norm(M.saved[prev.id]||prev.ref);}
function go(i){if(S)M.saved[lv().id]=copy(S);M.i=i;M.stage=0;M.hints=0;const l=lv();
 S=M.saved[l.id]?norm(M.saved[l.id]):startScheme(i);if(M.done[l.id])M.stage=l.stages.length-1;M.open=Math.max(M.open,i+1);
 fail=null;armed=null;undoStack=[];tab='task';resetPhone('hand');drawNodes();if(S.G.nodes.some((n,k,a)=>a.findIndex(m=>m.x===n.x&&m.y===n.y)!==k))tidy();redraw();fit();save();}
function check(){const l=lv();if(M.done[l.id])return;stat().checks++;const f=Check.runStage(norm(S),l.stages[M.stage]);fail=f;tab='task';
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
function connect(from,to,port){if(from===to||INKIND[port]!==OUTKIND[node(from).type])return false;
 if(S.G.wires.some(w=>w[0]===from&&w[1]===to&&w[2]===port))return true;remember();
 if(port==='t')S.G.wires=S.G.wires.filter(w=>!(w[1]===to&&w[2]===port));S.G.wires.push([from,to,port]);return true;}
function add(type){remember();const r=$('#stage').getBoundingClientRect();let x=Math.round((r.width/2-view.x)/view.z-118),y=Math.round((70-view.y)/view.z);
 while(S.G.nodes.some(n=>Math.abs(n.x-x)<200&&Math.abs(n.y-y)<120)){x+=250;if(x>(r.width-view.x)/view.z-200){x=Math.round((20-view.x)/view.z);y+=190;}}
 const n={id:'n'+(M.nid++),type,p:copy(DEF[type]),x,y};
 if(type==='ev'&&!lv().events.includes(n.p.kind))n.p.kind=lv().events[0];if(type==='ev')n.p.n=5;if(type==='table'){const used=tables().length;n.p.name='Таблица'+(used?' '+(used+1):'');}
 S.G.nodes.push(n);changed();}
let drag=null;
$('#stage').addEventListener('pointerdown',e=>{if(e.target.closest('#dock,#zoom,select,input,button,.port,.hit'))return;const hd=e.target.closest('.node header');if(!hd&&e.target.closest('.node'))return;
 drag=hd?{n:node(hd.parentElement.dataset.id),el:hd.parentElement,x:e.clientX,y:e.clientY}:{x:e.clientX,y:e.clientY};drag.ox=drag.n?drag.n.x:view.x;drag.oy=drag.n?drag.n.y:view.y;});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.n){drag.n.x=Math.round(drag.ox+dx/view.z);drag.n.y=Math.round(drag.oy+dy/view.z);drag.el.style.left=drag.n.x+'px';drag.el.style.top=drag.n.y+'px';drawWires();}else{view.x=drag.ox+dx;view.y=drag.oy+dy;applyView();}});
addEventListener('pointerup',()=>{if(drag&&drag.n)save();drag=null;});
$('#stage').addEventListener('wheel',e=>{e.preventDefault();const r=$('#stage').getBoundingClientRect(),z=Math.max(.25,Math.min(1.6,view.z*(e.deltaY<0?1.1:.91))),mx=e.clientX-r.left,my=e.clientY-r.top;view={x:mx-(mx-view.x)*z/view.z,y:my-(my-view.y)*z/view.z,z};applyView();},{passive:false});
document.addEventListener('click',e=>{const t=e.target,b=t.closest('button');
 const port=t.closest('.port');
 if(port){const id=port.closest('.node').dataset.id;if(port.dataset.port==='out')armed=armed&&armed.id===id?null:{id};
  else if(armed){if(connect(armed.id,id,port.dataset.port)){armed=null;changed();return;}}
  else{const k=S.G.wires.length;const rest=S.G.wires.filter(w=>!(w[1]===id&&w[2]===port.dataset.port));if(rest.length<k){remember();S.G.wires=rest;changed();return;}}
  drawWires();return;}
 if(t.classList&&t.classList.contains('hit')){remember();S.G.wires.splice(+t.dataset.w,1);changed();return;}
 if(!b){if(t.closest('#stage')&&!t.closest('.node')&&armed){armed=null;drawWires();}return;}
 const d=b.dataset;
 if(b.hasAttribute('data-del')){const id=b.closest('.node').dataset.id;remember();S.G.nodes=S.G.nodes.filter(n=>n.id!==id);S.G.wires=S.G.wires.filter(w=>w[0]!==id&&w[1]!==id);if(S.screen.litBy===id)S.screen.litBy='';if(S.screen.countBy===id)S.screen.countBy='';S.G.nodes.forEach(n=>{if(n.p.tab===id)n.p.tab='';});armed=null;changed();}
 else if(d.add)add(d.add);
 else if(d.tab){tab=d.tab;drawSide();}
 else if(d.part){remember();S.screen[d.part]=true;changed();}
 else if(b.hasAttribute('data-clear')){remember();Object.assign(S.screen,{card:false,text:false,like:false,count:false});changed();}
 else if(d.who){D.who=d.who;refresh();}
 else if(d.hand){handAct(d.hand);refresh();}
 else if(d.like&&tab==='phone'&&D.src==='hand'){handAct('press',d.like);refresh();}
 else if(d.d){if(d.d==='reset')resetPhone();else if(d.d==='step')step();else while(step()){}refresh();}
 else if(b.hasAttribute('data-show')){resetPhone(M.stage+':'+fail.scen);while(D.i<fail.step&&step()){}step();tab='phone';refresh();}
 else if(b.id==='b-check')check();
 else if(b.hasAttribute('data-hint')){M.hints++;stat().hints=Math.max(stat().hints,M.hints);drawSide();save();}
 else if(b.hasAttribute('data-solve')){remember();S=norm(lv().ref);stat().solved=1;changed();tidy();redraw();fit();}
 else if(b.hasAttribute('data-skip')){stat().skipped=1;if(M.i<LEVELS.length-1){M.saved[lv().id]=copy(lv().ref);const i=M.i+1;S=null;go(i);}else report();}
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
 if(t.dataset.scr){remember();S.screen[t.dataset.scr]=t.value;later();return;}
 if(t.dataset.set){const n=node(t.closest('.node').dataset.id);remember();const k=t.dataset.set;n.p[k]=k==='n'||k==='life'?+t.value:t.value;if(k==='name'&&!n.p.name.trim())n.p.name='Таблица';later();}});
// перерисовка после того, как отпустили мышь, иначе клик по соседней кнопке теряется
let pending=false,down=false;
function later(){if(pending)return;pending=true;const run=()=>{if(down)return setTimeout(run,30);pending=false;changed();};setTimeout(run,0);}
addEventListener('pointerdown',()=>down=true,true);addEventListener('pointerup',()=>down=false,true);addEventListener('pointercancel',()=>down=false,true);
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'&&!e.target.closest('input')){e.preventDefault();undo();}if(e.key==='Escape'){armed=null;closeDlg();drawWires();}});
setInterval(()=>{if(!document.hidden&&S&&!M.done[lv().id]){stat().sec++;if(stat().sec%10===0)save();}},1000);

try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.cur&&LEVELS[o.i])M=o;}catch(e){}
S=M.cur?norm(M.cur):startScheme(0);resetPhone('hand');drawNodes();redraw();fit();
window.__soc={get S(){return S;},get M(){return M;},D};
})();
