const E=ENGINE,$=i=>document.getElementById(i);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='lenta95full';let S,UI,paused=false,sum=0,speed=1,ended=false,sel=null,els={},shown=[],zoom=1,page='lenta.set',hist=[],checks={},sig='';
const G={day:()=>Math.min(100,Math.floor(S.t/E.DAY)+1),hour:()=>(S.t%E.DAY)/E.DAY*24};
const COL={post:'#000',net:'#0050ff',cpu:'#d00000',disk:'#c08000',any:'#666'},NAME={post:'посты',net:'интернет',cpu:'процессор',disk:'хранилище',any:'ресурс'};
const COLORS={};
function freshUI(){return{notes:'',answer:null,read:0,sum:''}}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function load(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
const save=()=>store(KEY,{S,UI,checks});
const past=(d,h)=>d<G.day()||(d===G.day()&&h<=G.hour())||S.t>=100*E.DAY;
const chatNow=()=>CHAT.filter(m=>past(m[0],m[1]));
const logNow=()=>CASE.LOG.filter(r=>past(r.srv,+r.t.slice(0,2)+(+r.t.slice(3))/60));
/* ---------- браузер и поиск ---------- */
const INTERNAL=[{url:'lenta.set',title:'Лента: алгоритм',keys:'алгоритм провода магазин'},{url:'chat.set',title:'Мессенджер',keys:'чат сообщения заказчик'},{url:'admin.set',title:'Админка: журнал входов',keys:'журнал логи куки метка айпи сообщения пользователей'},{url:'dosie.set',title:'Досье',keys:'заметки блокнот'},{url:'otvet.set',title:'Назвать имя',keys:'ответ фамилия пари'}];
const available=()=>INTERNAL.concat(SITES.filter(s=>s.day<=G.day()));
const norm=s=>s.toLowerCase().replace(/ё/g,'е');
const hit=(text,q)=>{const words=norm(text).split(/\s+/).flatMap(w=>[w,...w.split(/[^a-zа-я0-9.]+/)]).map(w=>w.replace(/^[«"(]+/,''));return norm(q).split(/\s+/).filter(Boolean).every(p=>words.some(w=>w.startsWith(p)))};
function index(){const out=available().map(s=>({url:s.url,label:s.title,sub:s.url,text:s.title+' '+s.url+' '+s.keys}));
 for(const s of SITES.filter(s=>s.day<=G.day())){if(s.tpl==='news')for(const a of s.items())out.push({url:s.url,find:a[1],label:a[1],sub:s.title+', '+CASE.date(a[0]),text:a[1]+' '+a[2]});
  if(s.tpl==='forum')for(const t of s.threads())out.push({url:s.url,find:t[0],label:t[0],sub:s.title,text:t[0]+' '+t[1].map(p=>p.join(' ')).join(' ')})}
 for(const m of chatNow())out.push({url:'chat.set',find:m[2],label:m[2],sub:'мессенджер, '+CASE.date(m[0]),text:m[2]});
 return out}
function suggest(){const q=$('addr').value.trim(),box=$('sugg');if(!q||q===page){box.hidden=true;return}const r=index().filter(x=>hit(x.text,q)).slice(0,8);box.hidden=false;box.innerHTML=r.length?'':'<div class="none">Ничего не найдено</div>';
 for(const x of r){const b=document.createElement('button');b.innerHTML=`<b>${esc(x.label)}</b><small>${esc(x.sub)}</small>`;b.onclick=()=>go(x.url,x.find);box.appendChild(b)}}
function go(url,find,back){const s=available().find(s=>s.url===url);if(!s)return;if(!back&&url!==page)hist.push(page);page=url;sel=null;$('sugg').hidden=true;$('addr').value=url;$('addr').blur();
 for(const id of ['p-feed','p-page'])$(id).hidden=true;
 if(url==='lenta.set'){$('p-feed').hidden=false;draw();feedView()}else{$('p-page').hidden=false;render();$('p-page').scrollTop=0;if(find){const el=[...$('p-page').querySelectorAll('[data-find]')].find(e=>e.dataset.find===find);if(el){el.classList.add('found');el.scrollIntoView({block:'center'})}}}
 document.querySelectorAll('#marks button').forEach(b=>b.classList.toggle('on',b.dataset.u===url));if(url==='chat.set'){UI.read=chatNow().length;if(!find)$('p-page').scrollTop=$('p-page').scrollHeight}badge()}
function badge(){const n=chatNow().length-UI.read;$('m-chat').textContent='Чат'+(n>0&&page!=='chat.set'?' ('+n+')':'')}
const pin=t=>`<button class="pin" data-pin="${esc(t)}" title="Добавить в досье">в досье</button>`;
const tableHTML=(cols,rows)=>`<table><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}<th></th></tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}<td>${pin(r.join(' | '))}</td></tr>`).join('')}</table>`;
const F={};
/* поле фильтра + таблица с постраничным выводом; общий просмотрщик для всех «экселей» */
function sheet(id,cols,rows,hint){const st=F[id]=F[id]||{q:'',p:0,sort:-1,dir:1};const box=document.createElement('div');box.innerHTML=`<input class="flt" placeholder="${esc(hint||'Фильтр по первым буквам и числам')}" value="${esc(st.q)}"><div class="tb"></div>`;
 const paintT=()=>{let r=st.q?rows.filter(x=>hit(x.join(' '),st.q)):rows.slice();if(st.sort>=0)r.sort((a,b)=>{const k=v=>/^\d\d\.\d\d$/.test(v)?v.slice(3)+v.slice(0,2):String(v);return k(a[st.sort]).localeCompare(k(b[st.sort]),'ru',{numeric:true})*st.dir});
  const pages=Math.max(1,Math.ceil(r.length/40));st.p=Math.min(st.p,pages-1);const tb=box.querySelector('.tb');tb.innerHTML=`<p>Строк: ${r.length}. Страница ${st.p+1} из ${pages} <button data-d="-1">←</button><button data-d="1">→</button></p><div class="scroll">${tableHTML(cols,r.slice(st.p*40,st.p*40+40))}</div>`;
  tb.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{st.p=Math.max(0,Math.min(pages-1,st.p+ +b.dataset.d));paintT()});
  tb.querySelectorAll('th').forEach((h,i)=>{if(i<cols.length)h.onclick=()=>{st.dir=st.sort===i?-st.dir:1;st.sort=i;paintT()}})};
 box.firstChild.oninput=ev=>{st.q=ev.target.value;st.p=0;paintT()};paintT();return box}
function render(){const P=$('p-page'),s=available().find(s=>s.url===page);P.className='skin-'+(s.skin||'sys');P.innerHTML=`<header><h2>${esc(s.title)}</h2></header><div class="body"></div>`;const B=P.lastChild;
 if(page==='chat.set'){for(const m of chatNow())B.insertAdjacentHTML('beforeend',`<div class="msg" data-find="${esc(m[2])}"><small>${CASE.date(m[0])}, ${String(m[1]).padStart(2,'0')}:00 UTC</small><div>${esc(m[2])} ${pin(CASE.date(m[0])+' '+m[1]+':00 UTC — '+m[2])}</div>${m[3]?`<figure><div class="shot"><div class="fake"><i></i><i></i><i></i></div><aside>${m[3].map(a=>`<span>${esc(a)}</span>`).join('')}</aside></div><figcaption>снимок экрана</figcaption></figure>`:''}</div>`);}
 else if(page==='admin.set'){B.innerHTML='<p>Журнал входов. Время сервера — <b>UTC</b>. Показаны учётные записи, которые вы отметили при запуске.</p>';B.appendChild(sheet('log',['Дата','Время','Аккаунт','Метка (cookie)','IP','Экран'],logNow().map(r=>[CASE.date(r.srv),r.t,r.acc,r.cookie,r.ip,r.ua])));
  B.insertAdjacentHTML('beforeend','<h3>Личные сообщения</h3><p>Введите имя аккаунта.</p><input id="dmq" class="flt" placeholder="аккаунт"><div id="dm"></div>');
  const q=B.querySelector('#dmq');q.value=F.dm||'';const f=()=>{F.dm=q.value;const v=q.value.trim();B.querySelector('#dm').innerHTML=v==='user_418'?DMS.filter(m=>m[0]<=G.day()).map(m=>`<div class="msg"><small>${CASE.date(m[0])}</small><div>${esc(m[1])} ${pin('user_418 '+CASE.date(m[0])+': '+m[1])}</div></div>`).join('')||'Сообщений пока нет.':v==='zakaz'?'Этот аккаунт ничего не писал в личные сообщения.':v?'Аккаунт не найден.':''};q.oninput=f;f()}
 else if(page==='dosie.set'){B.innerHTML='<p>Пишите что угодно и как угодно. Игра ничего не проверяет.</p><textarea id="notes" rows="22"></textarea>';const t=B.querySelector('#notes');t.value=UI.notes;t.oninput=()=>{UI.notes=t.value;save()}}
 else if(page==='otvet.set')answerPage(B);
 else if(s.tpl==='news')B.innerHTML=s.items().map(a=>`<article data-find="${esc(a[1])}"><small>${CASE.date(a[0])}</small><h3>${esc(a[1])}</h3><p>${esc(a[2])} ${pin(CASE.date(a[0])+' '+a[1])}</p></article>`).join('');
 else if(s.tpl==='forum')B.innerHTML=s.threads().map(t=>`<article data-find="${esc(t[0])}"><h3>${esc(t[0])}</h3>${t[1].map(p=>`<p><b>${esc(p[0])}:</b> ${esc(p[1])}</p>`).join('')||'<p>Пока пусто.</p>'}</article>`).join('');
 else if(s.tpl==='table')  {B.innerHTML=`<p>${s.intro}</p>`;B.appendChild(sheet(s.url,s.cols,s.rows()))}
 else if(s.tpl==='whois'){B.innerHTML='<p>Введите IP-адрес целиком.</p><input id="ip" class="flt" inputmode="decimal" placeholder="000.00.00.00"><div id="who"></div>';const i=B.querySelector('#ip');i.value=F.ip||'';const f=()=>{F.ip=i.value;const v=i.value.trim(),ok=/^(\d{1,3}\.){3}\d{1,3}$/.test(v),r=ok&&WHOIS.find(w=>v.startsWith(w[0]));B.querySelector('#who').innerHTML=r?tableHTML(['Организация','Тип сети','Регион'],[r.slice(1)]):ok?'Запись не найдена.':''};i.oninput=f;f()}
 else if(s.tpl==='flights'){B.innerHTML='<p>Копия неизвестного происхождения. Это чужие персональные данные.</p>';B.appendChild(sheet('fl',['Дата','Рейс','Откуда','Куда','Пассажир','Статус','Куплен'],CASE.FLIGHTS.filter(f=>f.day<=G.day()).map(f=>[CASE.date(f.day),f.no,f.from,f.to,f.name,f.status,CASE.date(Math.max(1,f.booked))]),'Например: 18.03 Белогорье'))}
 else B.innerHTML=s.body}
function answerPage(B){if(UI.answer){B.innerHTML=`<p>Ваш ответ принят: <b>${esc(UI.answer)}</b>.</p><p>Итог станет известен на 100-й день.</p>`;return}
 B.innerHTML='<p><b>Попытка одна.</b> Напишите фамилию, имя и отчество.</p><input id="ans" class="flt" autocomplete="off"><button id="send">Назвать</button><p id="warn"></p>';
 let armed='';B.querySelector('#send').onclick=()=>{const v=B.querySelector('#ans').value.trim();if(v.split(/\s+/).length<2){B.querySelector('#warn').textContent='Нужны как минимум фамилия и имя.';return}if(armed!==v){armed=v;B.querySelector('#warn').textContent='Второй попытки не будет. Нажмите «Назвать» ещё раз, чтобы отправить: '+v;return}UI.answer=v;save();render()}}
const correct=a=>{if(!a)return false;const w=norm(a).split(/\s+/),b=norm(CASE.BOSS).split(' ');return w.includes(b[0])&&w.includes(b[1])&&w.every(x=>b.includes(x))};
/* ---------- поле алгоритма ---------- */
const fmt=v=>v>=1e4?Math.round(v/1000)+'к':Math.round(v*10)/10;
function draw(){for(const e of Object.values(els))e.remove();els={};for(const n of S.nodes){const t=E.T[n.k],d=document.createElement('div');d.className='node win';d.style.left=n.x+'px';d.style.top=n.y+'px';
 const ports=o=>t[o?'o':'i'].map((_,p)=>`<div class="p ${o?'o':''}"><button class="port" data-o="${o}" data-p="${p}"></button><span></span></div>`).join('');
 d.innerHTML=`<div class="t">${t.n}</div>${ports(0)}${ports(1)}<div class="s"></div>${t.give?'<button class="upg"></button>':''}`;$('field').appendChild(d);els[n.id]=d;
 d.querySelectorAll('.port').forEach(b=>b.onclick=()=>click(n,+b.dataset.o,+b.dataset.p));const u=d.querySelector('.upg');if(u)u.onclick=()=>{if(E.upgrade(n)){paint();save()}};
 const h=d.firstChild;h.onpointerdown=ev=>{h.setPointerCapture(ev.pointerId);const sx=ev.clientX,sy=ev.clientY,ox=n.x,oy=n.y;h.onpointermove=m=>{n.x=Math.max(0,Math.min(1250,ox+(m.clientX-sx)/zoom));n.y=Math.max(0,Math.min(1050,oy+(m.clientY-sy)/zoom));d.style.left=n.x+'px';d.style.top=n.y+'px';wires()};h.onpointerup=h.onpointercancel=()=>{h.onpointermove=null;save()}}}
 paint();wires()}
function click(n,o,p){const here={n:n.id,o,p};if(!sel||sel.o===o){sel=sel&&sel.n===n.id&&sel.p===p&&sel.o===o?null:here;paint();return}const a=o?here:sel,b=o?sel:here;sel=null;if(!E.connect(a.n,a.p,b.n,b.p))msg('Эти разъёмы не подходят друг к другу.');paint();wires();save()}
function pos(id,o,p){const r=els[id].querySelector(`.port[data-o="${o}"][data-p="${p}"]`).getBoundingClientRect(),f=$('field').getBoundingClientRect();return[(r.left+r.width/2-f.left)/zoom,(r.top+r.height/2-f.top)/zoom]}
function wires(){const s=$('wires');if($('p-feed').hidden)return;s.innerHTML='';S.wires.forEach((w,i)=>{const[x,y]=pos(w.a,1,w.ap),[u,v]=pos(w.b,0,w.bp),d=`M${x} ${y}C${x+70} ${y} ${u-70} ${v} ${u} ${v}`;
 for(const c of['line','hit']){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);if(c==='hit'){p.setAttribute('class','hit');p.onclick=()=>{S.wires.splice(i,1);E.prune();paint();wires();save()}}else{p.dataset.i=i;p.style.stroke=COL[E.type(E.byId(w.a),1,w.ap)]}s.appendChild(p)}})}
function paint(){if($('p-feed').hidden)return;for(const n of S.nodes){const d=els[n.id];if(!d)continue;d.querySelectorAll('.p').forEach(row=>{const b=row.firstChild,o=+b.dataset.o,p=+b.dataset.p,t=E.type(n,o,p),c='port '+t+(sel&&sel.n===n.id&&sel.o===o&&sel.p===p?' sel':'');if(b.className!==c){b.className=c;b.style.background=COL[t]}b.setAttribute('aria-label',(o?'выход: ':'вход: ')+NAME[t]);const l=(o?'→ ':'')+NAME[t]+(o&&t!=='post'&&t!=='any'?' '+fmt(E.outAmt(n,p)):'');if(row.lastChild.textContent!==l)row.lastChild.textContent=l});
 let s='';const nd=E.need(n);if(nd){const have=E.res(n,nd.t);s=`${NAME[nd.t]}: ${fmt(have)} / ${fmt(nd.v)}<br>${have<=0?'⛔ стоит':have<nd.v?'⚠ медленно':'✔ работает'}`}if(n.k==='feed'||n.k==='sort')s+=`<br>очередь ${n.q.length} / ${fmt(E.cap(n))}`;if(n.k==='src')s=`1 пост в ${fmt(1/S.rate)} с<br>ждут снаружи: ${S.wait}`;if(E.T[n.k].give)s='выдаёт '+fmt(E.give(n))+', уровень '+(n.lvl+1);if(n.k==='split')s='поровну между<br>занятыми выходами';
 const q=d.querySelector('.s');if(q.innerHTML!==s)q.innerHTML=s;const u=d.querySelector('.upg');if(u){const t='Улучшить ×2 — '+fmt(E.upPrice(n));if(u.textContent!==t)u.textContent=t;u.disabled=S.money<E.upPrice(n)}}
 $('wires').querySelectorAll('path[data-i]').forEach(p=>{const w=S.wires[p.dataset.i];if(!w)return;const b=E.byId(w.b);let c='flow';if(E.type(E.byId(w.a),1,w.ap)==='post'){if(b.q.length>=E.cap(b)||!b.eff)c='flow stop';else if(b.eff<1)c='flow slow'}if(p.getAttribute('class')!==c)p.setAttribute('class',c)})}
let shopSig='';
function shop(){const keys=Object.keys(E.T).filter(k=>E.T[k].price&&E.unlocked(k)),a=E.nextAlgo(),sg=keys.join()+(a?a.n:'');if(sg!==shopSig){shopSig=sg;$('shop').innerHTML='';for(const k of keys){const b=document.createElement('button');b.dataset.k=k;b.onclick=()=>{if(E.buy(k)){draw();shop();save()}};$('shop').appendChild(b)}if(a){const b=document.createElement('button');b.dataset.k='algo';b.onclick=()=>{if(E.buyAlgo()){shopSig='';shop();save()}};$('shop').appendChild(b)}}
 for(const b of $('shop').children){const k=b.dataset.k,al=k==='algo',x=al?E.nextAlgo():E.T[k];if(!x)continue;const m=!al&&E.maxed(k),c=al?x.price:E.price(k),t=(al?'★ ':'')+x.n+(m?' — куплено':' — '+fmt(c)+' кр.')+(al?' (черновик: ускоряет рост)':'');if(b.textContent!==t)b.textContent=t;b.disabled=m||S.money<c}}
function feedView(){const likes=E.first('likes')&&E.first('likes').eff>0,words=S.t>=300,box=$('feed');box.innerHTML=words?'<div class="card">Нажимай на слова: <b>продвигать → подавлять → обычно</b>. Правила выполняет «Сортировка».</div>':'';
 for(const p of shown){const c=document.createElement('div');c.className='card';for(const w of p.w){if(words){const b=document.createElement('button');b.className='w '+(S.rules[E.key(w)]||'');b.textContent=w;b.onclick=()=>{const k=E.key(w),r=S.rules[k];if(!r)S.rules[k]='up';else if(r==='up')S.rules[k]='down';else delete S.rules[k];feedView();save()};c.appendChild(b)}else c.append(w+' ')}c.append(p.end);if(likes){const l=document.createElement('div');l.textContent='♥ '+fmt(p.likes);c.appendChild(l)}box.appendChild(c)}
 if(!shown.length)box.append('Пока пусто.')}
/* ---------- дни, пауза, концовки ---------- */
const msg=t=>$('hint').textContent=t;
const HINTS=[[0,'Соедини выход «Новых постов» и «Интернета» с «Лентой». Провод убирается нажатием. Строка сверху ищет по первым буквам.'],[60,'В магазине появилось хранилище.'],[180,'Открыты процессор и сортировка: «Новые посты» → «Сортировка» → «Лента».'],[240,'Открыты сбор лайков и разделитель.'],[300,'Теперь на слова в ленте можно нажимать.']];
let lastHint=-1;
function hud(){const left=E.DAY-(S.t%E.DAY),h=G.hour();$('clock').textContent=`День ${G.day()}/100 · ${CASE.date(G.day())} · ${String(h|0).padStart(2,'0')}:${String((h%1*60)|0).padStart(2,'0')} UTC · до конца дня ${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,'0')}`;$('money').textContent=fmt(Math.floor(S.money))+' кр.';$('users').textContent=Math.floor(S.users).toLocaleString('ru')+' / 5 000 000';$('sat').textContent='интерес '+Math.round((S.sat||0)*100)+'%';
 const i=HINTS.filter(x=>S.t>=x[0]).length-1;if(i!==lastHint){lastHint=i;msg(HINTS[i][1])}shop();badge()}
/* обновляем открытую страницу только когда появилось новое, чтобы не сбивать ввод */
function liveSig(){return page+'|'+(page==='chat.set'?chatNow().length:page==='dosie.set'||page==='otvet.set'?0:page==='admin.set'?logNow().length:G.day())}
function live(){const s=liveSig();if(s!==sig){const same=s.split('|')[0]===sig.split('|')[0];sig=s;if(same&&page!=='lenta.set'&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))){const y=$('p-page').scrollTop;render();$('p-page').scrollTop=y}}}
const snapshot=()=>JSON.parse(JSON.stringify({S,UI}));
function endDay(d){UI.sum=`<p>Доход: ${fmt(Math.round(S.day.e))} кр.<br>Новых пользователей: ${fmt(Math.floor(S.users-S.day.u))}<br>Расходы: ${fmt(S.day.sp)} кр.</p>`;S.day={e:0,u:S.users,sp:0};
 if(d>=100){finish();return}sum=8;$('sh').textContent='День '+d+' окончен';$('so').hidden=false;if(d%10===0)checks[d+1]=snapshot();save()}
function finish(){ended=true;const n=correct(UI.answer),u=S.users>=E.GOAL;$('eh').textContent=n&&u?'Обе цели выполнены':'Плохая концовка';
 $('eb').innerHTML=`<p>Имя: <b>${n?'верно':UI.answer?'неверно':'не названо'}</b><br>Пользователи: <b>${Math.floor(S.users).toLocaleString('ru')}</b> ${u?'✔':'✘'}</p><p>${n&&u?'Впереди выборы. Эта часть игры ещё не написана.':'Прошли выборы. Гайки закрутили окончательно, и сеть вычислили.'}</p>`;cpList($('ecp'));$('eo').hidden=false;save()}
function cpList(box){box.innerHTML='<p>Контрольные точки:</p>';for(const d of Object.keys(checks).sort((a,b)=>a-b)){const b=document.createElement('button');b.textContent='День '+d;b.onclick=()=>{const c=JSON.parse(JSON.stringify(checks[d]));for(const k in checks)if(+k>+d)delete checks[k];restore(c)};box.appendChild(b)}}
function restore(c){S=c.S;UI=c.UI;E.use(S);ended=false;sum=0;shown=[];shopSig='';lastHint=-1;hist=[];for(const k in F)delete F[k];for(const i of ['so','eo','po'])$(i).hidden=true;paused=false;go('lenta.set');hud();save()}
function newGame(){S=E.fresh();UI=freshUI();checks={};checks[1]=snapshot();restore(snapshot())}
function setPause(v){if(ended)return;paused=v;$('po').hidden=!v;if(v){cpList($('pcp'));save()}}
$('pause').onclick=()=>setPause(true);$('go').onclick=()=>setPause(false);addEventListener('keydown',e=>{if(e.key==='Escape')setPause(!paused)});
$('spd').onclick=()=>{speed={1:5,5:30,30:1}[speed];$('spd').textContent='Тест: ×'+speed};
for(const id of ['new1','new2']){let armed=false;$(id).onclick=()=>{if(!armed){armed=true;$(id).textContent='Точно стереть и начать заново?';setTimeout(()=>{armed=false;$(id).textContent='Новая игра'},3000);return}armed=false;$(id).textContent='Новая игра';newGame()}}
$('addr').oninput=suggest;$('sugg').addEventListener('click',e=>{if(e.target.className==='none')$('sugg').hidden=true});$('addr').onfocus=()=>{$('addr').select()};$('addr').onblur=()=>setTimeout(()=>{if(!$('omni').contains(document.activeElement))$('sugg').hidden=true},200);
$('addr').onkeydown=e=>{if(e.key==='Enter'){const b=$('sugg').querySelector('button');if(b)b.click()}};
document.addEventListener('click',e=>{if(!e.target.closest('#omni'))$('sugg').hidden=true;const p=e.target.closest('[data-pin]');if(p){UI.notes+=(UI.notes?'\n':'')+'• '+p.dataset.pin;p.textContent='добавлено';save()}});
$('back').onclick=()=>{if(hist.length)go(hist.pop(),null,true)};
document.querySelectorAll('#marks button').forEach(b=>b.onclick=()=>go(b.dataset.u));
function setZoom(z){zoom=Math.max(.5,Math.min(1.25,z));$('field').style.transform=`scale(${zoom})`;$('sizer').style.width=1400*zoom+'px';$('sizer').style.height=1200*zoom+'px';wires()}
$('zin').onclick=()=>setZoom(zoom+.25);$('zout').onclick=()=>setZoom(zoom-.25);
const sv=load(KEY);
if(sv&&sv.S&&sv.S.nodes){checks=sv.checks||{};restore({S:sv.S,UI:sv.UI});if(S.t>=100*E.DAY)finish()}else newGame();
let last=performance.now(),acc=0,n_=0;
function step(dt){const before=Math.floor(S.t/E.DAY);const posts=E.tick(dt);for(const p of posts){shown.unshift(p)}if(posts.length){shown.length=Math.min(shown.length,6);S.dirty=1}if(Math.floor(S.t/E.DAY)>before)endDay(before+1)}
setInterval(()=>{const now=performance.now();let dt=Math.min(.5,(now-last)/1000);last=now;if(paused||ended||document.hidden)return;
 if(sum>0){sum-=dt;$('sb').innerHTML=UI.sum+'<p>Следующий день через '+Math.max(0,Math.ceil(sum))+'</p>';if(sum<=0)$('so').hidden=true;return}
 for(let i=0;i<speed*2&&sum<=0&&!ended;i++)step(dt/2);hud();paint();live();if(S.dirty&&page==='lenta.set'&&(acc+=dt)>2.5){acc=0;S.dirty=0;feedView()}if(++n_%50===0)save()},100);
