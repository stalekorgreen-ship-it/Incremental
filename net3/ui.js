(function(){
const M=window.Sim,Fun=window.Fun,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='lentaos95-packs-2',NS='http://www.w3.org/2000/svg';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=n=>Math.round(n).toLocaleString('ru-RU');
const dur=s=>s<60?Math.round(s)+' с':s<3600?Math.floor(s/60)+' мин '+Math.floor(s%60)+' с':Math.floor(s/3600)+' ч '+Math.floor(s%3600/60)+' мин';
const dec=v=>String(Math.round(v*10)/10).replace('.',',');
const COLOR={all:'#3556a8',signal:'#8c4bd6',match:'#1673c9',lists:'#d97b0a',rank:'#178f52',feed:'#c4427f'};
const NOTE={all:'Все свежие посты сети. Отсюда начинается любая лента.',signal:'Берёт из одного источника то, что сеть знает ИМЕННО про этого человека.',match:'Делит посты: совпавшие со значениями и все остальные.',lists:'«смешать» берёт по одному из каждого списка по очереди. «подряд» ставит сначала весь первый, потом весь второй. «убрать» вычитает из первого всё, что есть во втором.',rank:'Даёт постам баллы за совпадения и ставит лучшие наверх. Вес −3…+3: минус опускает.',feed:'То, что увидит человек.'};
let F,rateFor=null,S,G,V={x:60,y:60,z:.9},files=[],fileSeq=0,page='work',who=0,speed=1,paused=false,last=null,armed=null,drag=null,snap=null,fileOpen=null,delArm=null,chat=0,saveAt=0,hidden=false;
// ——— имена
const NAMES=['Аня','Борис','Вера','Глеб','Даша','Егор','Жанна','Захар','Инна','Костя','Лена','Марк','Нина','Олег','Поля','Рома','Света','Тимур','Уля','Фёдор','Юля','Яков','Алиса','Матвей'];
const NICK=['тихий','рыжий','северный','ночной','дворовый','честный','бодрый','пятый','запасной','ленивый'],NOUN=['кот','мастер','сосед','репортёр','дачник','игрок','турист','повар','механик'];
const author=i=>NICK[i%10]+'_'+NOUN[(i*7+3)%9]+(i>=45?'_2':'');
const person=p=>NAMES[p.i%24]+' №'+p.no;
const comm=i=>{const c=S.comms[i];return'«'+M.TOPICS[c.topic][0].toUpperCase()+M.TOPICS[c.topic].slice(1)+' · '+['клуб','двор','чат','кружок'][i%4]+' '+(i+1)+'»';};
const district=v=>M.DISTRICTS[v%10]+' ('+M.CITIES[v/10|0]+')';
function valName(type,v){return type==='city'?M.CITIES[v]:type==='district'?district(v):type==='topic'?M.TOPICS[v]:type==='author'?author(v):type==='comm'?comm(v):v===null?'вне сезона':String(v);}
function sigText(s,max){if(!s)return'—';if(!s.values.length)return'пусто';if(s.type==='post')return'номера постов: '+s.values.length+' шт.';const l=[...new Set(s.values.map(v=>valName(s.type,v)))];return l.slice(0,max||6).join(', ')+(l.length>(max||6)?'…':'');}
// ——— сохранение
function save(){try{localStorage.setItem(KEY,JSON.stringify({S,G,V,files,fileSeq,who,F}));}catch(e){}}
const note=(t,d)=>Fun.log(F,t,S.quest,d);
function fresh(){F=Fun.create();S=M.init(1+(Math.random()*1e6|0));G=M.start();V={x:60,y:60,z:.95};files=[];fileSeq=0;who=0;}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.S&&d.G){({S,G,V,files,fileSeq,who}=d);F=d.F||Fun.create();return true;}}catch(e){}return false;}
function toast(a,b){const d=document.createElement('div');d.className='toast';d.innerHTML=`<b>${esc(a)}</b>${esc(b||'')}`;$('#toasts').append(d);while($('#toasts').children.length>3)$('#toasts').firstChild.remove();setTimeout(()=>d.remove(),4500);}
// ——— поле
const node=id=>G.nodes.find(n=>n.id===id);
const nel=id=>document.querySelector(`.node[data-id="${id}"]`);
function addNode(type,p,x,y){if(type==='feed'&&G.nodes.some(n=>n.type==='feed')){toast('Лента уже на поле','Она нужна одна.');return;}
 const st=$('#stage').getBoundingClientRect();if(x===undefined){x=(st.width*.4-V.x)/V.z;y=(st.height*.25-V.y)/V.z;while(G.nodes.some(n=>Math.abs(n.x-x)<40&&Math.abs(n.y-y)<40)){x+=45;y+=45;}}
 const n={id:'n'+(G.seq++),type,x:Math.round(x),y:Math.round(y),lv:0,p:{...(M.B[type].p||{}),...(p||{})}};G.nodes.push(n);note('add',n.id);changed();return n;}
function delNode(id){const n=node(id);note('del',id);if(n.spent){S.money+=n.spent;toast('Деньги вернулись','+'+num(n.spent)+' ₽ за прокачку блока');}G.nodes=G.nodes.filter(m=>m!==n);G.wires=G.wires.filter(w=>w[0]!==id&&w[2]!==id);changed();}
function changed(){armed=null;render();update();save();}
const ownedList=()=>M.SOURCES.filter(s=>S.src[s.id]);
const portType=(n,port,dir)=>(dir==='out'?M.B[n.type].outs:M.insOf(G,n)).find(i=>i[0]===port)[2];
function render(){const w=$('#world');w.querySelectorAll('.node').forEach(e=>e.remove());
 for(const n of G.nodes){const d=document.createElement('div');d.className='node';d.dataset.id=n.id;d.dataset.kind=n.type;d.style.cssText=`left:${n.x}px;top:${n.y}px;--c:${COLOR[n.type]}`;
  let set='';if(n.type==='signal')set=`<div class="set"><select data-set="src">${n.p.src?'':'<option value="">— выбери источник —</option>'}${ownedList().map(s=>`<option value="${s.id}"${n.p.src===s.id?' selected':''}>${s.name}</option>`).join('')}</select></div>`;
  if(n.type==='lists')set=`<div class="set seg">${[['+','смешать'],['>','подряд'],['−','убрать']].map(([m,t])=>`<button data-mode="${m}" class="${n.p.mode===m?'on':''}">${t}</button>`).join('')}</div>`;
  if(n.type==='rank'){const sel=(k,label,o)=>`<label>${label}<select data-set="${k}">${o.map(([v,t])=>`<option value="${v}"${+n.p[k]===v?' selected':''}>${t}</option>`).join('')}</select></label>`;
   set=`<div class="set">${sel('pop','Популярность',[[0,'не важна'],[.5,'слабо'],[1,'средне'],[2,'сильно']])}${sel('fresh','Свежесть',[[0,'не важна'],[.5,'слабо'],[1,'средне'],[2,'сильно']])}${sel('mix','Темы подряд',[[1,'не больше двух'],[0,'как выйдет']])}</div>`;}
  const ins=M.insOf(G,n).map(([id,label,t])=>{const wire=G.wires.find(x=>x[2]===n.id&&x[3]===id);let lab=label,wt='';
    if(n.type==='rank'&&t==='sig'){const from=wire&&node(wire[0]);lab=from?(from.p.src?M.SRC[from.p.src].name:'источник не выбран'):'+ ещё «за что баллы»';if(wire){const v=M.weight(n,id);wt=`<span class="wt"><button data-w="${id}" data-d="-0.5">−</button><i>${v>0?'+':''}${dec(v)}</i><button data-w="${id}" data-d="0.5">+</button></span>`;}}
    return`<div class="port in${wire?'':' free'}" data-port="${id}" data-dir="in"><b style="--pc:var(--${t==='sig'?'sig':'posts'})"></b><span class="nm">${esc(lab)}</span>${wt}</div>`;}).join('');
  const outs=M.B[n.type].outs.map(([id,label,t])=>`<div class="port out" data-port="${id}" data-dir="out"><span>${label}</span><b style="--pc:var(--${t==='sig'?'sig':'posts'})"></b></div>`).join('');
  d.innerHTML=`<header title="${esc(NOTE[n.type])}"><span>${M.B[n.type].title}</span><button data-act="help">?</button><button data-act="del">×</button></header>${set}<div class="ports">${ins}${outs}</div><div class="live"></div>${M.CAPPED.includes(n.type)?'<button class="up" data-act="up"></button>':''}`;
  w.append(d);}
 $('#empty').style.display=G.nodes.length?'none':'';drawWires();applyView();}
function portPos(id,port,dir){const el=nel(id),b=el&&el.querySelector(`.port[data-port="${port}"][data-dir="${dir}"] b`);if(!b)return null;let x=b.offsetLeft+7,y=b.offsetTop,e=b.offsetParent;while(e&&e!==el){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}const n=node(id);return[n.x+x,n.y+y];}
const curve=(a,b)=>{const k=Math.max(50,Math.abs(b[0]-a[0])*.45);return`M${a[0]} ${a[1]}C${a[0]+k} ${a[1]} ${b[0]-k} ${b[1]} ${b[0]} ${b[1]}`;};
function drawWires(temp){const s=$('#wires');s.textContent='';G.wires.forEach((w,i)=>{const a=portPos(w[0],w[1],'out'),b=portPos(w[2],w[3],'in');if(!a||!b)return;const g=document.createElementNS(NS,'g'),color=portType(node(w[0]),w[1],'out')==='sig'?'#b57bff':'#47a3ff';g.innerHTML=`<path class="l" stroke="${color}" d="${curve(a,b)}"/><path class="h" data-wire="${i}" d="${curve(a,b)}"><title>убрать провод</title></path>`;s.append(g);});
 if(temp){const p=document.createElementNS(NS,'path');p.setAttribute('d',curve(temp[0],temp[1]));p.setAttribute('stroke','#fff');p.setAttribute('stroke-width','2');p.setAttribute('stroke-dasharray','6 5');s.append(p);}}
function applyView(){$('#world').style.transform=`translate(${V.x}px,${V.y}px) scale(${V.z})`;}
function fit(){if(!G.nodes.length)return;const st=$('#stage').getBoundingClientRect();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const n of G.nodes){const e=nel(n.id);x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x+e.offsetWidth);y1=Math.max(y1,n.y+e.offsetHeight);}
 V.z=Math.max(.2,Math.min(1.1,(st.width-60)/(x1-x0),(st.height-130)/(y1-y0)));V.x=(st.width-(x1-x0)*V.z)/2-x0*V.z;V.y=44-y0*V.z;applyView();}
function tidy(){const depth={},d=id=>{if(depth[id]!==undefined)return depth[id];depth[id]=0;return depth[id]=Math.max(0,...G.wires.filter(w=>w[2]===id).map(w=>d(w[0])+1));};G.nodes.forEach(n=>d(n.id));
 // источники ставим рядом с тем блоком, куда они ведут
 for(const n of G.nodes)if(n.type==='signal'){const to=G.wires.filter(w=>w[0]===n.id).map(w=>depth[w[2]]);if(to.length)depth[n.id]=Math.max(0,Math.min(...to)-1);}
 const cols={};for(const n of G.nodes)(cols[depth[n.id]]=cols[depth[n.id]]||[]).push(n);let x=0;for(const k of Object.keys(cols).sort((a,b)=>a-b)){let y=0,wd=0;cols[k].sort((a,b)=>(a.type==='signal')-(b.type==='signal')||a.y-b.y);for(const n of cols[k]){const e=nel(n.id);n.x=x;n.y=y;y+=e.offsetHeight+16;wd=Math.max(wd,e.offsetWidth);}x+=wd+90;}render();update();fit();save();}
function arm(a){armed=a;$$('.port').forEach(p=>p.classList.remove('fit','nofit','armed'));if(!a)return;const el=nel(a.id).querySelector(`.port[data-port="${a.port}"][data-dir="${a.dir}"]`);el.classList.add('armed');
 for(const p of $$('.port')){if(p.dataset.dir===a.dir)continue;const id=p.closest('.node').dataset.id,ok=id!==a.id&&(a.dir==='out'?M.fits(G,a.id,a.port,id,p.dataset.port):M.fits(G,id,p.dataset.port,a.id,a.port));p.classList.add(ok?'fit':'nofit');}}
function join(a,b){if(a.dir===b.dir)return false;const[o,i]=a.dir==='out'?[a,b]:[b,a];if(!M.connect(G,o.id,o.port,i.id,i.port)){note('fail');toast('Не соединяется',M.fits(G,o.id,o.port,i.id,i.port)?'Получился бы круг.':'Разные виды данных: смотри на цвет кружков.');return false;}note('wire');changed();return true;}
const portRef=el=>({id:el.closest('.node').dataset.id,port:el.dataset.port,dir:el.dataset.dir});
const toWorld=e=>{const r=$('#stage').getBoundingClientRect();return[(e.clientX-r.left-V.x)/V.z,(e.clientY-r.top-V.y)/V.z];};
$('#stage').addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('#dock,#zoom,#drawer,button,select'))return;
 const w=e.target.dataset&&e.target.dataset.wire;if(w!==undefined){G.wires.splice(+w,1);note('unwire');changed();return;}
 const port=e.target.tagName==='B'&&e.target.closest('.port');
 if(port){const ref=portRef(port);if(armed&&armed.dir!==ref.dir){const a=armed;arm(null);join(a,ref);return;}
  // занятый вход: провод снимается и тянется заново
  if(ref.dir==='in'){const i=G.wires.findIndex(x=>x[2]===ref.id&&x[3]===ref.port);if(i>=0){const x=G.wires[i];G.wires.splice(i,1);changed();const r={id:x[0],port:x[1],dir:'out'};arm(r);drag={kind:'wire',ref:r,sx:e.clientX,sy:e.clientY};return;}}
  arm(ref);drag={kind:'wire',ref,sx:e.clientX,sy:e.clientY};e.preventDefault();return;}
 const el=e.target.closest('.node');if(el){if(e.target.closest('header')){const n=node(el.dataset.id);drag={kind:'node',n,el,x:n.x,y:n.y,sx:e.clientX,sy:e.clientY};}return;}
 arm(null);drag={kind:'pan',x:V.x,y:V.y,sx:e.clientX,sy:e.clientY};});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(drag.kind==='pan'){V.x=drag.x+dx;V.y=drag.y+dy;applyView();}else if(drag.kind==='node'){drag.n.x=Math.round(drag.x+dx/V.z);drag.n.y=Math.round(drag.y+dy/V.z);drag.el.style.left=drag.n.x+'px';drag.el.style.top=drag.n.y+'px';drawWires();}else{drag.moved=drag.moved||Math.hypot(dx,dy)>6;if(drag.moved){const a=portPos(drag.ref.id,drag.ref.port,drag.ref.dir),m=toWorld(e);drawWires(drag.ref.dir==='out'?[a,m]:[m,a]);}}});
addEventListener('pointerup',e=>{const d=drag;drag=null;if(!d)return;if(d.kind==='wire'&&d.moved){const t=document.elementFromPoint(e.clientX,e.clientY),p=t&&t.closest('.port');arm(null);if(p)join(d.ref,portRef(p));drawWires();}else if(d.kind!=='wire')save();});
$('#stage').addEventListener('wheel',e=>{if(e.target.closest('#drawer'))return;e.preventDefault();const r=$('#stage').getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,z=Math.max(.2,Math.min(1.5,V.z*(e.deltaY<0?1.1:.9)));V.x=mx-(mx-V.x)*z/V.z;V.y=my-(my-V.y)*z/V.z;V.z=z;applyView();},{passive:false});
$('#world').addEventListener('click',e=>{const el=e.target.closest('.node');if(!el)return;const n=node(el.dataset.id),b=e.target.closest('button');if(!b)return;
 if(b.dataset.act==='del')delNode(n.id);else if(b.dataset.act==='help')toast(M.B[n.type].title,NOTE[n.type]+(n.type==='signal'&&n.p.src?' '+M.SRC[n.p.src].help:''));
 else if(b.dataset.act==='up'){if(M.upgrade(S,G,n.id)){note('buy','block');update();save();}}
 else if(b.dataset.mode){n.p.mode=b.dataset.mode;note('set');changed();}
 else if(b.dataset.w){const k='w'+b.dataset.w.slice(1);n.p[k]=Math.max(-3,Math.min(3,M.weight(n,b.dataset.w)+ +b.dataset.d));note('set');changed();}});
$('#world').addEventListener('change',e=>{const k=e.target.dataset.set;if(!k)return;const n=node(e.target.closest('.node').dataset.id);n.p[k]=k==='src'?e.target.value:+e.target.value;note('set');changed();});
// ——— нижняя панель и источники
const DOCK=['all','signal','match','lists','rank','feed'];
$('#dock').innerHTML=DOCK.map(t=>`<button data-add="${t}" style="--c:${COLOR[t]}" title="${esc(NOTE[t])}">${t==='signal'?'Что известно':M.B[t].title}</button>`).join('')+'<button id="b-src" style="--c:#c99a00"><b>Источники и мощности</b></button>';
$('#dock').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='b-src'){$('#drawer').classList.toggle('on');b.classList.remove('new');drawer();}else{$('#drawer').classList.remove('on');addNode(b.dataset.add);}});
const SERVICE={servers:['Серверы','мощности под источники'],disk:['Диски','больше постов в запасе'],sales:['Отдел продаж','+13% к доходу'],ads:['Реклама сети','люди приходят быстрее']};
let drawerKey='';const PACKED=new Set(M.QUESTS.flatMap(q=>q.srcs||[]));
function drawer(){if(!$('#drawer').classList.contains('on'))return;const load=M.powerLoad(S,G),pc=M.powerCap(S);
 let h=`<div class="${load>pc?'alarm':''}">Мощности: источники на поле берут ${load} из ${pc}${load>pc?' — всё тормозит, люди уходят раньше':''}</div>`;
 for(const k in SERVICE){const L=S.lv[k],max=L>=M.MAX[k],c=max?0:M.PRICE[k](L);h+=`<div class="srv"><div>${SERVICE[k][0]}, ур. ${L}<small>${SERVICE[k][1]}${k==='disk'?': сейчас '+M.stock(S):''}</small></div><button data-buy="${k}" ${max||S.money<c?'disabled':''}>${max?'максимум':num(c)+' ₽'}</button></div>`;}
 h+=`<p class="dim" style="margin-top:6px">Источники открываются пачками вместе с испытанием. Выше уровень — сеть знает это про большее число людей.</p>`;
 M.GROUPS.forEach((g,gi)=>{if(!M.SOURCES.some(s=>s.g===gi&&PACKED.has(s.id)))return;h+=`<div class="sg">${g}</div>`;for(const s of M.SOURCES.filter(s=>s.g===gi&&PACKED.has(s.id))){const L=S.src[s.id]||0;if(!L){h+=`<div class="sr lock"><div>🔒 ${s.name}</div></div>`;continue;}const max=L>=M.LVMAX,c=max?0:M.lvPrice(S,s.id);
  h+=`<div class="sr${S.fresh===s.id?' fresh':''}"><div><b>${s.name}</b> · ур. ${L}<small>${s.help} Знает: ${Math.round(M.cover(L)*100)}%. Мощности: ${s.w}.</small></div><button data-lv="${s.id}" ${max||S.money<c?'disabled':''}>${max?'макс.':'▲ '+num(c)+' ₽'}</button><button data-put="${s.id}">на поле</button></div>`;}});
 if(h!==drawerKey){drawerKey=h;const b=$('#drawer-b'),y=b.scrollTop;b.innerHTML=h;b.scrollTop=y;}}
$('#drawer').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='drawer-x'){$('#drawer').classList.remove('on');return;}if(b.dataset.buy&&M.buy(S,b.dataset.buy))note('buy',b.dataset.buy);if(b.dataset.lv&&M.buySource(S,b.dataset.lv))note('buy',b.dataset.lv);if(b.dataset.put){$('#drawer').classList.remove('on');addNode('signal',{src:b.dataset.put});return;}drawerKey='';drawer();update();save();});
$('#zoom').addEventListener('click',e=>{const z=e.target.dataset.z;if(!z)return;if(z==='fit')fit();else if(z==='tidy')tidy();else{V.z=Math.max(.2,Math.min(1.5,V.z*+z));applyView();}save();});
// ——— правая колонка
const WHY={history:['уже видел','История показов → «Совпадение» → «Списки» в режиме «−».'],skip:['пролистывает тему','«Пролистывания»: убери эти темы.'],nope:['не интересно','«Не интересно»: убери эти темы.'],blocks:['заблокированный автор','«Блокировки»: убери этих авторов.'],ip:['чужой город','Подними посты из города человека («IP-адрес», «Поездки»).'],geo:['не тот район','Помогают «Геометки».'],device:['длинно для телефона','Помогает «Устройство».'],clock:['не по времени суток','Помогает «Время суток».'],visit:['некогда читать','Помогает «Длина визита».'],net:['видео не грузится','Помогает «Связь».'],season:['не по сезону','Помогает «Сезон и погода».'],breaks:['старьё','Помогают «Свежесть» и «Перерывы».'],mix:['одно и то же подряд','В «Оценить» выбери «не больше двух».'],taste:['просто скучно','Лента мало знает про человека. Добавь источники вкуса или повысь их уровень.'],empty:['посты кончились','Лента отдаёт слишком мало. Убери лишнее отсеивание или расширь узкое место.']};
const HINT={first:'«Все посты» → «Личная лента».',funnel:'Смотри «Почему уходят»: что гонит людей сильнее всего. Мощности каждого источника написаны в «Источниках».',quota:'Открой ленту любого человека и посмотри, кто занял первые десять мест. Одна оценка ставит наверх самых «балльных». Подумай, как раздать места разным спискам.',fallback:'Посмотри на уехавшего и на того, кто дома. Что у них выдают «Поездки»? У «Списков» три режима.',
near:'Район, где человек сейчас, и его второй район знают разные источники. Это две разные ветки, и у каждой своё место в ленте.',
thin:'«Через один» не получится одной оценкой. Какой режим «Списков» чередует посты? То, что не открывается, удобно отсеять до развилки.',
hours:'Тема дня должна занять часть мест, но не все. А что из остального надо выбросить совсем?',
back:'«Перерывы» знают только про вернувшихся. Что тогда выдаст «Совпадение» для тех, кто заходит постоянно, и куда денутся его «остальные»?',
circle:'Три вида авторов и чужие. Сколько веток и как их сложить, чтобы каждой досталось место в первых десяти?',
mouth:'Друзья и похожие часто лайкают одно и то же. Как сделать список «только похожие»?',
love:'Две одинаковые темы подряд нельзя. Если соседние посты берутся из разных веток, а в ветках разные темы…',
trace:'Первый пост особенный. Какой список «Списки» ставят самым первым при смешивании?'};
const hintFor=q=>HINT[q.id]||'';
// где теряются посты у выбранного человека: идём от ленты назад и ищем блок, после которого их стало мало
function diagnose(){let R=last;if(S.people.filter(p=>p.own>=12).length>=M.NP-8)return null;
 const bad=S.people[who].own<12?S.people[who]:S.people.find(p=>p.own!==undefined&&p.own<12);if(!bad)return null;if(bad!==S.people[who])R=M.runFor(S,G,bad,M.ctxOf(S));
 const f=G.nodes.find(n=>n.type==='feed');if(!G.nodes.length||!R)return null;if(!f)return{text:'На поле нет «Личной ленты».'};
 const w=G.wires.find(w=>w[2]===f.id);if(!w)return{text:'К «Личной ленте» ничего не подключено.',id:f.id};
 const count=(id,port)=>{const o=R[id]&&R[id].out[port];return o?o.length:0};if(count(w[0],w[1])>=12)return null;
 const named=r=>r&&{...r,text:person(bad)+' получает меньше 12 постов. '+r.text};
 let id=w[0],port=w[1];
 for(let i=0;i<60;i++){const n=node(id),ins=G.wires.filter(x=>x[2]===id&&portType(node(x[0]),x[1],'out')!=='sig');
  const main=ins.find(x=>x[3]==='posts'||x[3]==='a');
  if(n.type==='all')return named({text:'Постов не хватает уже в начале.',id});
  if(!main)return named({text:`У блока «${M.B[n.type].title}» не подключены посты.`,id});
  const before=count(main[0],main[1]),after=count(id,port);
  if(before>=12){const name=`«${M.B[n.type].title}»`;
   if(n.type==='match'){const s=G.wires.find(x=>x[2]===id&&x[3]==='sig'),src=s&&node(s[0]).p.src,what=src?`«${M.SRC[src].name}»`:'сравнение';
    if(!s)return named({text:`${name}: не подключено «с чем сравнить».`,id});
    return named({text:port==='yes'?`${name} с ${what} получает ${before} постов, а дальше идут только «подходят»: ${after}. Всё остальное выброшено. Хочешь УБРАТЬ эти посты, веди дальше «остальные». Хочешь ПОДНЯТЬ их наверх, подключи ${what} в «Оценить».`:`${name} с ${what}: из ${before} постов в «остальные» попало только ${after}.`,id});}
   return named({text:`${name} получает ${before} постов, а отдаёт ${after}.`+(n.type==='lists'&&n.p.mode==='−'?' Проверь: второй список вычитается из первого.':''),id});}
  id=main[0];port=main[1];}
 return null;}
function questPanel(){const q=M.QUESTS[S.quest];$('#q-n').textContent=q?`${S.quest+1} из ${M.QUESTS.length}`:'все пройдены';const open=$('#q-b details')&&$('#q-b details').open;
 let h='';if(!q)h='<h2>Всё пройдено</h2><p>Соцсеть работает. Можно строить дальше.</p>';else{const cs=q.checks(S,G),dg=diagnose();h=`${dg?`<div class="alarm">${esc(dg.text)}</div>`:''}<h2>${q.title}</h2><p>${q.goal}</p>${cs.map(c=>`<div class="check${c.ok?' ok':''}"><i>✓</i><span>${esc(c.label)}</span></div>`).join('')}${q.pred?(()=>{const p=S.people[who];return`<p class="mine${p.pk?' ok':''}">Выбранный сейчас человек, ${esc(person(p))}: ${p.pk?'✓ всё как надо':'✗ правило не выполнено'}</p>`;})():''}<div class="hold"><u style="width:${100*S.hold/q.hold}%"></u></div><p class="dim" style="font-size:11.5px">Награда ${num(q.reward)} ₽. Всё зелёное должно продержаться ${q.hold} с.${q.share?' Доля считается по тому, что люди реально увидели, и меняется плавно.':''}</p><details${open?' open':''}><summary>Подсказка</summary>${hintFor(q)}</details>`;}
 if(h!==questPanel.k){questPanel.k=h;$('#q-b').innerHTML=h;}}
const topText=(p,list)=>{const t=M.topOf(S,p,list);return`<br><b>Первые ${t.n}:</b> из подписок ${t.subs}, из его сообществ ${t.comm}, ни то ни другое ${t.new}. Из города, где он сейчас, ${t.here}.<br>${t.gone?'<b>Сегодня он в другом городе.</b>':'Сегодня он дома.'}`;};
function update(){const ctx=M.ctxOf(S),p=S.people[who];last=M.runFor(S,G,p,ctx);
 $('#day').textContent=`День ${M.dayOf(S)+1} · ${M.SLOTS[M.slotOf(S)]}${M.weekend(S)?' · выходной':''}`;
 $('#v-sec').textContent=dur(S.sec);const next=M.MILES[S.mile];$('#v-sub').textContent=`заход ${dur(S.visit)} × ${dec(M.times(S.visit))} раза в день`+(next?` · премия на ${dur(next[0])}: ${num(next[1])} ₽`:'');
 $('#v-users').textContent=num(S.users);$('#v-cap').textContent=S.users>M.ceiling(S)*.9&&S.users<M.GOAL?'упёрлись: подними время в сети':'растёт';
 $('#v-money').textContent=num(S.money)+' ₽';$('#v-income').textContent='+'+dec(S.income)+' ₽/с';
 for(const n of G.nodes){const el=nel(n.id);if(!el)continue;const r=last[n.id],live=el.querySelector('.live');let t='',warn=false;const len=l=>l?l.length:0;
  if(n.type==='all')t='постов: '+len(r.out.posts);
  else if(n.type==='signal')t=n.p.src?(r.out.v?esc(sigText(r.out.v,4)):'источник ещё не открыт'):(warn=true,'выбери источник');
  else if(n.type==='match')t=r.out.yes?`подходят ${len(r.out.yes)}, остальные ${len(r.out.no)}`:(warn=true,'подключи посты и «с чем сравнить»');
  else if(n.type==='lists'||n.type==='rank')t=r.out.out?`выходит постов: ${len(r.out.out)}${n.type==='lists'&&!r.in.b?' (второй список не подключён)':''}`:(warn=true,'подключи посты');
  else{const list=r.in.posts;t=list?`этому человеку: ${Math.min(60,list.length)} постов`:(warn=true,'подключи посты');}
  const jam=S.jam&&S.jam.id===n.id;if(r.load&&r.load.inn>r.load.cap){warn=true;t+=`<br>берёт только ${r.load.cap} из ${r.load.inn}: остальные не рассматриваются. Это лечит кнопка ▲`;}
  live.innerHTML=t;live.classList.toggle('warn',warn);
  const up=el.querySelector('.up');if(up){const max=(n.lv||0)>=20,c=max?0:M.nodePrice(G,n);up.textContent=max?'ур. 20 — максимум':`▲ ${M.capOf(n)} → ${M.capOf(n,(n.lv||0)+1)} постов · ${num(c)} ₽`;up.disabled=max||S.money<c;up.classList.toggle('can',!max&&S.money>=c);up.classList.toggle('hot',!!jam);}}
{const dg=diagnose();$$('.node').forEach(e=>e.classList.toggle('lost',!!dg&&e.dataset.id===dg.id));}
 questPanel();
 const why=Object.entries(S.why).filter(e=>e[1]>=3).sort((a,b)=>b[1]-a[1]).slice(0,5),load=M.powerLoad(S,G),pc=M.powerCap(S);
 $('#why').innerHTML=(load>pc?`<div class="alarm">Перегрузка мощностей ${load} из ${pc}: купи серверы</div>`:'')+(why.length?why.map(([k,v])=>`<div class="why"><span>${(WHY[k]||[k])[0]}</span><div><u style="width:${v}%"></u></div><span>${Math.round(v)}%</span></div>`).join('')+(WHY[why[0][0]]?`<div class="advice">${WHY[why[0][0]][1]}</div>`:''):'<p class="dim">Пока нет данных.</p>');
 const feed=G.nodes.find(n=>n.type==='feed'),own=feed&&last[feed.id].in.posts?last[feed.id].in.posts.length:0;
 const mine=feed&&last[feed.id].in.posts||[];
 $('#who-b').innerHTML=`${own?'':'Схема пока ничего ему не даёт, идут случайные посты. '}Последний заход: ${dur(p.sec)}${p.k?', посмотрел постов: '+p.k:''}.${own?topText(p,mine):''}<br><button data-open="feed">Открыть его ленту</button> <button data-open="people">Что о нём известно</button>`;
 const nw=$('#b-src');if(nw&&S.fresh&&S.fresh!==update.fresh){update.fresh=S.fresh;nw.classList.add('new');$$('.node[data-kind="signal"]').length&&render();}
 drawer();}
$('#who-b').addEventListener('click',e=>{const p=e.target.dataset.open;if(p)go(p);});
$('#who').addEventListener('change',e=>{who=+e.target.value;snap=null;update();save();});
// ——— сайты внутри игрового браузера
const URLS={work:'lentaos://constructor',feed:'https://lenta.net/feed',people:'https://admin.lenta.net/people',chat:'https://admin.lenta.net/messages',files:'lentaos://downloads'};
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
function photoSVG(seed){let x=hash(seed)%233280;const r=()=>(x=(x*9301+49297)%233280)/233280;const h=r()*360,night=r()<.35;let s=`<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="hsl(${night?225:195+r()*30|0},${night?35:60}%,${night?14:74}%)"/><circle cx="${30+r()*260|0}" cy="${25+r()*40|0}" r="${10+r()*14|0}" fill="${night?'#e8e6d0':'#ffd966'}"/>`;
 let bx=-10;while(bx<320){const w=30+r()*50|0,hh=50+r()*90|0;s+=`<rect x="${bx}" y="${165-hh}" width="${w}" height="${hh+10}" fill="hsl(${h+r()*40|0},18%,${(night?18:38)+r()*18|0}%)"/>`;for(let wy=165-hh+8;wy<155;wy+=17)for(let wx=bx+6;wx<bx+w-9;wx+=14)if(r()<.7)s+=`<rect x="${wx}" y="${wy}" width="6" height="8" fill="${night&&r()<.4?'#ffd977':'#dbe7ee'}" opacity=".8"/>`;bx+=w+(r()*6|0);}
 s+=`<rect y="165" width="320" height="35" fill="${night?'#161a22':'#8d9296'}"/>`;for(let i=0;i<3;i++){const tx=r()*300|0;s+=`<rect x="${tx+7}" y="160" width="4" height="20" fill="#5a4632"/><circle cx="${tx+9}" cy="155" r="${9+r()*8|0}" fill="hsl(${90+r()*50|0},35%,${night?18:35}%)"/>`;}return s+'</svg>';}
const HOST=(()=>{try{return window.parent!==window&&window.parent.PC||null;}catch(e){return null;}})();
function addFile(f){if(HOST){const n=HOST.download(f.kind==='photo'?{...f,svg:picture(f.seed,f.topic)}:f);toast('Скачано на компьютер',n+' — папка «Загрузки»');return;}if(files.length>=40){toast('Диск игрового ПК полон','Удали лишнее в «Загрузках».');return;}let name=f.name,i=2;while(files.some(x=>x.name===name))name=f.name.replace(/(\.\w+)$/,` (${i++})$1`);files.push({...f,name,id:'F'+(++fileSeq)});$('#fcount').textContent=files.length;toast('Скачано на игровой ПК',name);save();}
const table=(cols,rows)=>`<table class="d"><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table>`;
const dossier=p=>ownedList().map(s=>{const v=M.signal(S,s.id,p);return[s.name,M.TYPE[s.type],sigText({type:s.type,values:v},12)];});
const peopleSelect=()=>`<button data-step="-1">◀</button><select data-person>${S.people.map(p=>`<option value="${p.i}"${p.i===who?' selected':''}>${person(p)}</option>`).join('')}</select><button data-step="1">▶</button>`;
function takeSnap(){const p=S.people[who],f=M.feedFor(S,G,p),v=M.visit(S,p,f.list,false),sigs=G.nodes.filter(n=>n.type==='signal'&&S.src[n.p.src]&&G.wires.some(w=>w[0]===n.id)).map(n=>n.p.src);
 const info=[...new Set(sigs)].map(id=>({s:M.SRC[id],set:new Set(M.signal(S,id,p))}));
 snap={who,top:topText(p,f.list),own:f.own,sec:v.sec,rows:v.rows.map(r=>({x:r.x,w:r.w,bad:r.bad.length?r.bad.slice().sort((a,b)=>b[0]-a[0])[0][1]:null,match:info.filter(i=>i.set.has(M.FIELD[i.s.type](r.x,S))).map(i=>i.s.name),age:S.t-r.x.born}))};}
// ——— лента как настоящая соцсеть: лица, профили, сообщества, счётчики, комментарии, картинки по темам
const shash=(...a)=>{let h=2166136261;for(const x of a){h^=x+0x9e3779b9;h=Math.imul(h,16777619);h^=h>>>13;}h=Math.imul(h^(h>>>16),2246822507);return((h^(h>>>15))>>>0)/4294967296;};
const pickBy=(l,...k)=>l[(shash(...k)*l.length)|0];
const gend=(s,i)=>s.replace(/<([^<>]*)>/g,(_,v)=>v.split('|')[i%2]||'');
function avatar(i,cls){const R=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;let b='';
 if(i%3===0){const c=`hsl(${i*67%360},55%,42%)`;b=R(0,0,10,10,`hsl(${i*67%360},45%,86%)`);for(let y=1;y<9;y++)for(let x=1;x<5;x++)if(shash(i,x,y)<.48)b+=R(x,y,1,1,c)+R(9-x,y,1,1,c);return`<svg class="av ${cls||''}" viewBox="0 0 10 10" shape-rendering="crispEdges">${b}</svg>`;}
 const skin=pickBy(['#f4c9a0','#e8b084','#c98a5e','#ffd9b8'],i,1),hair=pickBy(['#2a1a0e','#8a5a22','#e8c45a','#b8381e','#555','#3a2a60'],i,2),shirt=pickBy(['#2e7d32','#6a1b9a','#c62828','#1565c0','#ef6c00','#00838f'],i,3),bg=pickBy(['#9fc4e8','#c8b8e8','#e8d8a8','#a8d8b8','#d8a8a8'],i,4),f=i%2===1;
 b=R(0,0,24,24,bg)+(f?R(5,5,3,15,hair)+R(16,5,3,15,hair):'')+R(4,20,16,4,shirt)+R(10,17,4,4,skin)+R(7,6,10,12,skin)+R(6,3,12,4,hair)+(shash(i,5)<.5?R(8,1,8,2,hair):R(6,6,2,4,hair))+R(9,10,2,2,'#1a1a1a')+R(13,10,2,2,'#1a1a1a')+(shash(i,6)<.25?'<path d="M8 9h4v4H8zM12 9h4v4h-4z" fill="none" stroke="#222" stroke-width=".6"/>':'')+R(10,15,4,1,'#8a3a30');
 return`<svg class="av ${cls||''}" viewBox="0 0 24 24" shape-rendering="crispEdges">${b}</svg>`;}
// картинка к посту: местные посты — вид улицы, остальные — по тому, что на снимке
function sceneSVG(seed,t){let k=0;const r=(a,b)=>a+shash(seed,++k)*(b-a)|0,hue=r(0,360);const C=(x,y,rad,f)=>`<circle cx="${x}" cy="${y}" r="${rad}" fill="${f}"/>`,R=(x,y,w,h,f,rx)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" rx="${rx||0}"/>`,Pl=(d,f)=>`<path d="${d}" fill="${f}"/>`;let s='';const X=r(100,200);
 if(t===0){const c=pickBy(['#2b2b2b','#e8923a','#8a8f98','#f1e7d6'],seed,2);s=R(0,0,320,200,`hsl(${hue},35%,72%)`)+R(0,150,320,50,`hsl(${hue},25%,45%)`)+Pl(`M${X-45} 160q-5-70 45-70t45 70z`,c)+C(X,82,34,c)+Pl(`M${X-30} 66l-4-38 28 22zM${X+30} 66l4-38-28 22z`,c)+C(X-13,78,5,'#9dff6a')+C(X+13,78,5,'#9dff6a')+Pl(`M${X-5} 92h10l-5 6z`,'#f48a9a')+`<path d="M${X+45} 150q40 0 30-45" fill="none" stroke="${c}" stroke-width="13" stroke-linecap="round"/>`;}
 else if(t===1){s=R(0,0,320,200,'#bfe3f5')+R(0,90,320,110,'#3c9c4a')+[0,1,2,3].map(i=>R(i*80,90,40,110,'#46aa55')).join('')+`<path d="M60 180V115h200v65" fill="none" stroke="#fff" stroke-width="5"/>`+C(r(60,260),r(130,180),17,'#fff')+C(r(60,260),r(40,80),9,'#fff');}
 else if(t===2){s=R(0,0,320,200,`hsl(${hue},30%,35%)`)+C(160,105,88,'#f4f1ea')+C(160,105,68,'#fff');for(let i=0;i<11;i++)s+=C(r(118,202),r(70,140),r(10,24),pickBy(['#d9892b','#b8452a','#6a9c32','#f0c24a','#8a5a2a'],seed,i));s+=R(268,40,8,130,'#c9ccd2',3)+R(40,40,8,130,'#c9ccd2',3);}
 else if(t===3){s=R(0,0,320,200,'#1c1c28')+R(55,18,210,150,'#b8b6a8',8)+R(70,30,180,118,'#06122a')+R(130,170,60,18,'#97958a');for(let i=0;i<26;i++)s+=R(72+r(0,17)*10,32+r(0,11)*10,10,10,`hsl(${r(0,360)},80%,55%)`);s+=R(72,136,176,10,'#2f8a3a');}
 else if(t===4){s=R(0,0,320,200,'#bfe3f5')+C(r(40,280),40,22,'#ffd34d')+R(0,100,320,100,'#8a5a34');for(let j=0;j<3;j++)for(let i=0;i<9;i++){const x=20+i*35+j*8,y=122+j*28;s+=C(x,y,r(9,15),'#3f9a38')+(shash(seed,i,j)<.35?C(x+4,y+2,5,'#e23b2e'):'');}}
 else if(t===5){const c=`hsl(${hue},65%,45%)`;s=R(0,0,320,200,'#cfd8de')+R(0,140,320,60,'#6d737b')+Pl(`M45 145v-30l40-8 35-35h80l38 37 40 8v28z`,c)+Pl('M126 80h30v28h-57zM165 80h30l29 28h-59z','#d8f1ff')+C(100,147,22,'#171717')+C(232,147,22,'#171717')+C(100,147,9,'#bbb')+C(232,147,9,'#bbb');}
 else if(t===6){s=R(0,0,320,200,`hsl(${hue},35%,25%)`)+C(120,135,48,'#c9812f')+C(145,95,34,'#c9812f')+C(133,115,17,'#2a1608')+`<path d="M150 85L250 25" stroke="#5a3416" stroke-width="15"/>`;for(let i=0;i<6;i++){const x=r(190,300),y=r(70,170);s+=C(x,y,8,'#ffe9a8')+R(x+5,y-30,3,30,'#ffe9a8');}}
 else if(t===7){s=R(0,0,320,200,'#a9d8f0')+C(r(40,280),45,20,'#fff2a8')+Pl(`M0 160L${r(50,110)} ${r(50,90)} 170 160z`,'#5a7a8a')+Pl(`M90 160L${r(170,240)} ${r(40,90)} 320 160z`,'#486878')+R(0,155,320,45,'#4f9a52')+Pl('M130 200l25-45h12l45 45z','#9a9a9a');}
 else if(t===8){s=R(0,0,320,200,'#17603a');for(let i=0;i<14;i++){const x=r(10,290),y=r(10,180);s+=`<path d="M${x} ${y}h${r(20,80)}v${r(10,50)}" fill="none" stroke="#c9b45a" stroke-width="3"/>`+C(x,y,4,'#e8d98a');}for(let i=0;i<5;i++)s+=R(r(20,240),r(20,140),r(30,60),r(20,40),'#15151a',3);}
 else if(t===9){s=R(0,0,320,200,`hsl(${hue},25%,42%)`)+R(70,20,170,165,'#fdfbf2');for(let i=0;i<11;i++)s+=R(85,38+i*13,r(60,140),3,'#6a7ab0');s+=`<path d="M235 175L295 60" stroke="#e8b02a" stroke-width="13"/>`+Pl('M229 187l2-18 11 6z','#4a3018');}
 else if(t===10){s=R(0,0,320,200,'#ffe9c2')+R(0,160,320,40,'#c98a54');for(let i=0;i<7;i++){const x=40+i*35,y=r(105,120);s+=R(x,y+r(0,10),32,160-y,`hsl(${r(0,360)},70%,58%)`,3);}s+=Pl(`M${X} 20l30 35-30 35-30-35z`,`hsl(${hue},80%,55%)`)+`<path d="M${X} 90q20 15 0 30" fill="none" stroke="#555" stroke-width="2"/>`;}
 else return null;
 return`<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;}
const picture=(seed,topic)=>(topic===undefined||topic===null?null:sceneSVG(+seed,topic))||photoSVG(seed);
// ——— счётчики и комментарии: у одного поста всегда одни и те же
// вид улицы только у постов про происходящее рядом
const isStreet=x=>M.LOCAL.some(l=>x.text.startsWith(l));
const isAsk=x=>x.text.includes('?');
const likesOf=x=>x.likers.length+Math.floor(x.q*x.q*70*shash(x.id,1)+x.sh*.6);
const viewsOf=x=>likesOf(x)*(4+(shash(x.id,2)*5|0))+x.sh*3+2;
const repostsOf=x=>Math.floor(likesOf(x)*shash(x.id,3)*.14);
function commentsOf(x){const Sc=window.Social,topic=M.TOPICS[x.topic],pool=[...(isAsk(x)?Sc.ASK:Sc.ANY),...(Sc.BY[topic]||[])];let n=Math.floor(Math.pow(shash(x.id,4),2)*7)+(isAsk(x)?1:0);n=Math.min(n,Math.floor(viewsOf(x)/6));const out=[],used=new Set();
 for(let k=0;k<n;k++){let j=(shash(x.id,10+k)*pool.length)|0;while(used.has(j))j=(j+1)%pool.length;used.add(j);let who=(shash(x.id,30+k)*90)|0;if(who===x.author)who=(who+1)%90;out.push({who,text:gend(pool[j],who),likes:Math.floor(shash(x.id,50+k)**3*14),reply:shash(x.id,70+k)<.16?gend(pickBy(Sc.REPLY,x.id,90+k),x.author):null});}return out;}
const openC=new Set(),openT=new Set(),mine=new Set();let sview=null,marks=false;
const placeOf=x=>x.city!==null?(x.district!==null?district(x.city*10+x.district):M.CITIES[x.city]):'';
const ago=s=>s<60?s+' с назад':Math.floor(s/60)+' мин назад';
const cname=i=>comm(i).slice(1,-1);
function postHTML(x,row){const a=author(x.author),long=x.text.length>260&&!openT.has(x.id),cm=commentsOf(x),liked=mine.has(x.id);
 return`<article><div class="who"><button class="plain" data-author="${x.author}">${avatar(x.author)}</button><div><button class="link" data-author="${x.author}">${a}</button>${x.comm>=0?` <span class="dim">в</span> <button class="link c" data-comm="${x.comm}">${cname(x.comm)}</button>`:''}<small>${placeOf(x)?placeOf(x)+' · ':''}${ago(S.t-x.born)}</small></div></div>
 <p>${esc(long?x.text.slice(0,220).replace(/\s+\S*$/,'')+'…':x.text)}</p>${long?`<button class="link" data-more="${x.id}">Показать полностью</button>`:''}
 ${x.fmt!=='текст'?`<div class="ph">${picture(x.id,isStreet(x)?null:x.topic)}${x.fmt==='видео'?`<i class="play"></i><em>${Math.floor(x.dur/60)}:${String(x.dur%60).padStart(2,'0')}</em>`:''}<button data-photo="${x.id}" data-topic="${isStreet(x)?'':x.topic}">⬇ ${x.fmt==='видео'?'кадр':'фото'}</button></div>`:''}
 <div class="acts"><button data-like="${x.id}" class="${liked?'on':''}">♥ ${likesOf(x)+(liked?1:0)}</button><button data-comments="${x.id}" class="${openC.has(x.id)?'on':''}">💬 ${cm.length}</button><span>↗ ${repostsOf(x)}</span><span class="views">👁 ${viewsOf(x)}</span></div>
 ${openC.has(x.id)?`<div class="comments">${cm.map(c=>`<div class="cm"><button class="plain" data-author="${c.who}">${avatar(c.who,'sm')}</button><div><button class="link" data-author="${c.who}">${author(c.who)}</button> ${esc(c.text)}<small>♥ ${c.likes}</small>${c.reply?`<div class="cm re">${avatar(x.author,'sm')}<div><b>${a}</b> ${esc(c.reply)}</div></div>`:''}</div></div>`).join('')||'<p class="dim">Пока никто не написал.</p>'}</div>`:''}
 ${row&&marks?`<div class="marks"><div class="chips"><span>${M.TOPICS[x.topic]}</span><span>${x.long?'длинное':'короткое'}</span><span>${x.fmt}</span>${x.season?`<span>${x.season}</span>`:''}<span>${row.age>M.OLD?'старое':'свежее'}</span>${row.match.map(m=>`<span class="k">совпало: ${m}</span>`).join('')}</div><div class="react">досмотрел на ${Math.round(row.w*100)}%${row.w<M.BAR&&row.bad&&WHY[row.bad]?' — '+WHY[row.bad][0]:''}<div class="bar"><u style="width:${row.w*100}%"></u></div></div></div>`:''}</article>`;}
function sideHTML(){const tc={},cc={};for(const x of S.posts){tc[x.topic]=(tc[x.topic]||0)+likesOf(x);if(x.comm>=0)cc[x.comm]=(cc[x.comm]||0)+1;}const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,5);
 return`<aside><div class="box"><b>Сейчас обсуждают</b>${top(tc).map(([t,v])=>`<div class="tr">#${M.TOPICS[t]}<small>${v} отметок</small></div>`).join('')}</div><div class="box"><b>Активные сообщества</b>${top(cc).map(([c,v])=>`<button class="link c tr" data-comm="${c}">${cname(+c)}<small>${members(+c)} участников</small></button>`).join('')}</div></aside>`;}
const members=c=>40+(shash(S.seed,c,3)*3000|0),followers=a=>12+(Math.pow(shash(S.seed,a,4),3)*9000|0);
function profileHTML(i){const a=S.authors[i],Sc=window.Social,bio=pickBy(Sc.BIO[M.TOPICS[a.topic]],S.seed,i),list=S.posts.filter(x=>x.author===i).reverse(),cs=[...new Set(list.filter(x=>x.comm>=0).map(x=>x.comm))];
 return`<div class="prof"><div class="cover" style="background:linear-gradient(120deg,hsl(${i*47%360},45%,35%),hsl(${(i*47+70)%360},50%,55%))"></div><div class="ph-row">${avatar(i,'big')}<div><h3>${author(i)}</h3><span class="dim">${a.city!==null?M.CITIES[a.city]:'город не указан'} · в сети с ${1996+i%4} года</span></div></div><p>${bio}</p><div class="nums"><span><b>${followers(i)}</b> подписчиков</span><span><b>${(shash(S.seed,i,5)*180|0)+3}</b> подписок</span><span><b>${list.length}</b> свежих постов</span></div>${cs.length?`<p class="dim">Пишет в: ${cs.map(c=>`<button class="link c" data-comm="${c}">${cname(c)}</button>`).join(', ')}</p>`:''}</div>${list.slice(0,20).map(x=>postHTML(x)).join('')||'<article class="dim">Свежих постов нет.</article>'}`;}
function commHTML(i){const list=S.posts.filter(x=>x.comm===i).reverse();return`<div class="prof"><div class="cover" style="background:linear-gradient(120deg,hsl(${i*83%360},40%,30%),hsl(${(i*83+40)%360},45%,52%))"></div><h3 style="padding:10px 15px 0">${cname(i)}</h3><div class="nums"><span><b>${members(i)}</b> участников</span><span><b>${list.length}</b> свежих постов</span></div></div>${list.slice(0,25).map(x=>postHTML(x)).join('')||'<article class="dim">Пока тихо.</article>'}`;}
function feedHTML(){if(!snap||snap.who!==who)takeSnap();const p=S.people[who];
 const head=sview?`<div class="sh"><button data-home>← К ленте</button><b>${sview.t==='a'?'Профиль':'Сообщество'}</b></div>`:`<div class="sh"><b>Лента</b>${peopleSelect()}<button data-refresh>↻ Обновить</button><button data-marks class="${marks?'on':''}">${marks?'✓ ':''}Служебные метки</button><span>заход ${dur(snap.sec)}, постов: ${snap.rows.length}${snap.own?'':' · схема ничего не дала, посты случайные'}</span>${marks?`<span style="width:100%">${snap.top.slice(4).replace('<br>',' ')}</span>`:''}</div>`;
 const body=sview?(sview.t==='a'?profileHTML(sview.id):commHTML(sview.id)):snap.rows.map(r=>postHTML(r.x,r)).join('')+`<div class="stop">Здесь ${NAMES[p.i%24]} закрывает ленту</div>`;
 return head+`<div class="wrap"><div class="feed">${body}</div>${sideHTML()}</div>`;}
function socialClick(d){if(d.author!==undefined){sview={t:'a',id:+d.author};renderPage();return true;}if(d.comm!==undefined){sview={t:'c',id:+d.comm};renderPage();return true;}if('home'in d){sview=null;renderPage();return true;}if('marks'in d){marks=!marks;renderPage(true);return true;}
 for(const[k,set]of[['like',mine],['comments',openC],['more',openT]])if(d[k]!==undefined){const id=+d[k];if(set.has(id)&&k!=='more')set.delete(id);else set.add(id);renderPage(true);return true;}return false;}
function peopleHTML(){const p=S.people[who];return`<div class="sh"><b>Люди</b><span>только то, что дают открытые источники. Где «пусто», сеть пока не знает</span></div><div class="cols"><nav>${S.people.map(q=>`<button data-pick="${q.i}" class="${q.i===who?'on':''}">${person(q)}</button>`).join('')}</nav><section><h3>${person(p)}</h3><p class="dim" style="margin:4px 0 8px">сейчас сидит ${dur(p.sec)} за заход</p><p style="margin-bottom:8px"><button data-dl="one">⬇ Скачать таблицу о нём</button> <button data-dl="all">⬇ Скачать таблицу по всем людям</button> <button data-open="feed">Его лента</button></p>${table(['Источник','Что это','Значения сейчас'],dossier(p))}</section></div>`;}
const CHATS=[['Администрация · спичрайтеры','Участник А'],['Серверная','Участник Б'],['Без названия','Участник В']];
function chatHTML(){return`<div class="sh"><b>Личные переписки</b><span>тексты появятся позже: здесь только окно</span></div><div class="cols"><nav>${CHATS.map((c,i)=>`<button data-chat="${i}" class="${i===chat?'on':''}">${c[0]}</button>`).join('')}</nav><section>${[0,1,2,3,4].map(i=>`<div class="msg${i%2?' b':''}"><small>${i%2?'Участник Г':CHATS[chat][1]}</small><i>‹здесь будет текст сообщения›</i></div>`).join('')}</section></div>`;}
function filesHTML(){const f=files.find(x=>x.id===fileOpen)||files[files.length-1];return`<div class="sh"><b>Загрузки</b><span>диск игрового ПК: ${files.length} из 40</span></div><div class="cols"><nav>${files.map(x=>`<button data-file="${x.id}" class="${f&&x.id===f.id?'on':''}">${x.kind==='photo'?'🖼':'▦'} ${esc(x.name)}</button>`).join('')||'<p class="dim" style="padding:10px">Пусто. Фото скачиваются из ленты, таблицы — со страницы «Люди».</p>'}</nav><section>${f?`<p style="margin-bottom:8px"><b>${esc(f.name)}</b> <button data-del="${f.id}">${delArm===f.id?'Точно удалить?':'Удалить'}</button></p>${f.kind==='photo'?`<div class="ph" style="max-width:760px">${picture(f.seed,f.topic).replace('<svg ','<svg style="height:auto" ')}</div>`:table(f.cols,f.rows)}`:''}</section></div>`;}
function renderPage(keep){const box=$('#page'),els=()=>[box,...box.querySelectorAll('nav,section')],sc=els().map(e=>e.scrollTop);box.classList.toggle('on',page!=='work');box.innerHTML=page==='feed'?feedHTML():page==='people'?peopleHTML():page==='chat'?chatHTML():page==='files'?filesHTML():'';els().forEach((e,i)=>e.scrollTop=keep?sc[i]||0:0);}
function go(p){if(HOST)HOST.page(p);sview=null;page=p;snap=null;delArm=null;$('#addr').textContent=URLS[p];$$('#br [data-page]').forEach(b=>b.classList.toggle('on',b.dataset.page===p));arm(null);renderPage();}
$('#br').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page);});
function pickPerson(i){sview=null;who=(i+S.people.length)%S.people.length;$('#who').value=who;snap=null;}
$('#page').addEventListener('change',e=>{if(e.target.dataset.person!==undefined){pickPerson(+e.target.value);renderPage();}});
$('#page').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(socialClick(d))return;
 if(d.step){pickPerson(who+ +d.step);renderPage();}else if('refresh'in d){snap=null;renderPage();}else if(d.photo){addFile({kind:'photo',name:'фото_'+d.photo+'.png',seed:+d.photo,topic:d.topic===''?null:+d.topic});renderPage(true);}
 else if(d.pick){pickPerson(+d.pick);renderPage(true);}else if(d.open)go(d.open);
 else if(d.dl==='one'){const p=S.people[who];addFile({kind:'table',name:'человек_'+p.no+'.csv',cols:['Источник','Что это','Значения'],rows:dossier(p)});}
 else if(d.dl==='all'){const l=ownedList();addFile({kind:'table',name:'все_люди.csv',cols:['Человек',...l.map(s=>s.name)],rows:S.people.map(p=>[person(p),...l.map(s=>sigText({type:s.type,values:M.signal(S,s.id,p)},3))])});}
 else if(d.chat){chat=+d.chat;renderPage();}else if(d.file){fileOpen=d.file;delArm=null;renderPage(true);}
 else if(d.del){if(delArm===d.del){files=files.filter(f=>f.id!==d.del);delArm=null;fileOpen=null;$('#fcount').textContent=files.length||'';save();}else delArm=d.del;renderPage(true);}});
// ——— что весело, а что нет
function askRate(i){rateFor=i;$('#rate-t').textContent=`«${M.QUESTS[i].title}»: как было?`;$('#rate').classList.add('on');}
$('#rate').addEventListener('click',e=>{const b=e.target.closest('[data-rate]');if(!b)return;if(b.dataset.rate)note('rate',[rateFor,b.dataset.rate]);$('#rate').classList.remove('on');save();});
$('#moods').addEventListener('click',e=>{const m=e.target.closest('[data-mood]');if(!m)return;note('mood',m.dataset.mood);toast('Записано',m.dataset.mood==='bored'?'Здесь скучно':'Здесь непонятно');save();});
function repText(){$('#rep-text').value=Fun.text(F,M.QUESTS);}
function report(){const A=Fun.analyze(F,M.QUESTS),list=(t,a,c)=>`<div class="sig ${c}"><b>${t}</b>${a.length?'<ul>'+a.slice(0,7).map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>':'<p>пока нет</p>'}</div>`;
 $('#rep-sum').innerHTML=`<p>Записано <b>${Fun.mm(A.total)}</b> игры · испытаний за это время <b>${A.questsDone}</b></p><div class="sigs">${list('Похоже на веселье',A.good,'')}${list('Похоже на скуку',A.bad,'b')}${list('Похоже на непонимание',A.lost,'l')}</div>`;
 const fm=$('#rep-form');if(!fm.children.length)fm.innerHTML=Fun.FORM.map(([k,l])=>`<div class="q7"><span>${l}</span><div data-q="${k}">${[1,2,3,4,5,6,7].map(v=>`<button data-v="${v}">${v}</button>`).join('')}</div></div>`).join('')+'<input data-note="bad" placeholder="Что было самым скучным?"><input data-note="good" placeholder="Что было самым классным?">';
 for(const d of fm.querySelectorAll('[data-q]'))for(const b of d.children)b.classList.toggle('on',+b.dataset.v===F.form[d.dataset.q]);for(const i of fm.querySelectorAll('[data-note]'))i.value=F.notes[i.dataset.note]||'';repText();}
$('#m-report').onclick=()=>{$('#v-menu').classList.remove('on');report();$('#v-report').classList.add('on');paused=true;};
$('#rep-close').onclick=()=>{$('#v-report').classList.remove('on');menu(false);};
$('#rep-form').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;F.form[b.parentNode.dataset.q]=+b.dataset.v;report();save();});
$('#rep-form').addEventListener('input',e=>{const k=e.target.dataset.note;if(k){F.notes[k]=e.target.value.slice(0,300);repText();save();}});
$('#rep-copy').onclick=async()=>{repText();const t=$('#rep-text');let ok=false;try{await navigator.clipboard.writeText(t.value);ok=true;}catch(e){t.select();try{ok=document.execCommand('copy');}catch(x){}}$('#rep-copy').textContent=ok?'Скопировано':'Выдели текст и нажми Ctrl+C';};
// ——— время, меню, запуск
function menu(on){paused=on;$('#v-menu').classList.toggle('on',on);m2=0;$('#m-new').textContent='Начать заново';if(on)save();}
let m2=0;$('#b-menu').onclick=()=>menu(true);$('#m-go').onclick=()=>menu(false);
addEventListener('keydown',e=>{if(e.key==='Escape'){if(armed){arm(null);return;}if($('#v-report').classList.contains('on')){$('#rep-close').click();return;}if($('#drawer').classList.contains('on')){$('#drawer').classList.remove('on');return;}menu(!paused);}});
$('#m-new').onclick=()=>{if(!m2){m2=1;$('#m-new').textContent='Точно? Всё сотрётся';return;}fresh();boot();menu(false);};
$('#b-speed').onclick=()=>{speed=speed===1?5:speed===5?20:1;note('speed',speed);$('#b-speed').innerHTML=`▶ ×${speed}<br><small>тест</small>`;};
function events(){if(S.justDone){const i=M.QUESTS.findIndex(q=>q.id===S.justDone),q=M.QUESTS[i],nx=M.QUESTS[i+1];toast('Пройдено: '+q.title,`+${num(q.reward)} ₽`+(nx&&nx.srcs?` · открыты: ${nx.srcs.map(i=>M.SRC[i].name).join(', ')}`:''));S.justDone=null;Fun.log(F,'quest',i);askRate(i);if(nx&&nx.srcs)render();if(!nx){paused=true;$('#win-b').innerHTML=`<p>Все ${M.QUESTS.length} испытаний пройдены за ${Math.round(S.t/60)} мин. Открой «Отчёт о веселье» в меню и пришли его.</p><button onclick="document.getElementById('v-win').classList.remove('on');window.__resume()">Остаться в сети</button>`;$('#v-win').classList.add('on');}}
 if(S.justMile!==undefined&&S.justMile!==null){const m=M.MILES[S.justMile];toast('Премия: '+dur(m[0])+' в сети','+'+num(m[1])+' ₽');S.justMile=null;}}
window.__resume=()=>paused=false;
let acc=0,prev=performance.now();
setInterval(()=>{const now=performance.now();const dt=Math.min(1,(now-prev)/1000);acc+=dt*speed;prev=now;if(paused||hidden){acc=0;return;}F.sec+=dt;let k=0;while(acc>=1&&k<20){M.step(S,G);events();acc--;k++;if(paused)break;}if(k){if(!drag&&!(document.activeElement&&document.activeElement.tagName==='SELECT'))update();if(now-saveAt>5000){saveAt=now;save();}}},200);
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;prev=performance.now();if(hidden)save();});addEventListener('pagehide',save);
function boot(){$('#who').innerHTML=S.people.map(p=>`<option value="${p.i}">${person(p)}</option>`).join('');$('#who').value=who;$('#fcount').textContent=files.length||'';update.fresh=null;drawerKey='';questPanel.k='';render();go('work');update();}
if(HOST)document.body.classList.add('embedded');if(!load())fresh();F.sessions++;note('session');boot();
window.__game={render,go,save,get S(){return S;},get G(){return G;},tidy,fit,run:n=>{for(let i=0;i<n;i++){M.step(S,G);events();}update();}};
})();
