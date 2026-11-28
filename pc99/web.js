// браузер игрового ПК. Соцсеть и конструктор живут в отдельном кадре, который не перезагружается при переходах
(function(){
const O=window.OS,{el,esc,IC}=O,$=(s,e)=>e.querySelector(s),SITES=window.SITES;
const GAME={constructor:['work','Конструктор'],feed:['feed','ЛентаОС: лента'],people:['people','ЛентаОС: люди'],messages:['chat','ЛентаОС: переписки']};
const gamePath=p=>Object.keys(GAME).find(k=>GAME[k][0]===p)||'constructor';
const BOOK=[['lenta.net/constructor','Конструктор'],['lenta.net/feed','ЛентаОС'],['lenta.net/people','Люди'],['lenta.net/messages','Переписки'],['nashel.net','Нашёл!'],['katalog.net','Каталог']];
const cats=()=>[...new Set(SITES.map(s=>s.cat))];
const link=(u,t)=>`<a href="#" data-go="${esc(u)}">${t}</a>`;
const norm=u=>String(u).trim().toLowerCase().replace(/^[a-z]+:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'');
const text=h=>h.replace(/<[^>]+>/g,' ');
let INDEX;const index=()=>INDEX||(INDEX=SITES.flatMap(s=>s.pages.filter(p=>!p.hidden).map(p=>({s,p,url:s.host+(p.id?'/'+p.id:''),t:(s.name+' '+s.cat+' '+s.tag+' '+p.title+' '+text(p.html)).toLowerCase().replace(/ё/g,'е')}))));
function search(q){const w=q.toLowerCase().replace(/ё/g,'е').split(/\s+/).filter(Boolean).map(x=>x.length>4?x.slice(0,-2):x);if(!w.length)return[];return index().map(e=>{let n=0;for(const x of w){if(!e.t.includes(x))return null;n+=e.t.split(x).length-1;if((e.s.name+' '+e.p.title).toLowerCase().includes(x))n+=20;}return{e,n};}).filter(Boolean).sort((a,b)=>b.n-a.n).slice(0,20).map(r=>r.e);}
const form=(q)=>`<form data-search><input name="q" value="${esc(q||'')}" placeholder="что ищем?"><button>Нашёл!</button></form>`;
function page(url){const u=norm(url),[host,...rest]=u.split('/'),path=rest.join('/');
 if(u===''||u==='home://start')return{title:'Начальная страница',html:`<div class="pg start"><h1>Интернет</h1>${form()}<h3>Закладки</h3><ul>${BOOK.map(b=>`<li>${link(b[0],b[1])} <small>${b[0]}</small></li>`).join('')}</ul><p>${link('katalog.net','Все сайты в каталоге →')}</p></div>`};
 if(host==='katalog.net')return{title:'Каталог сайтов',html:`<div class="pg kat"><h1>Каталог «Все дороги»</h1><p>Сайтов в каталоге: ${SITES.length}</p><div class="cols">${cats().map(c=>`<div><h3>${c}</h3><ul>${SITES.filter(s=>s.cat===c).map(s=>`<li>${link(s.host,s.name)}<br><small>${s.tag}</small></li>`).join('')}</ul></div>`).join('')}</div></div>`};
 if(host.startsWith('nashel.net')){const m=u.match(/\?q=(.*)$/),q=m?decodeURIComponent(m[1]):'';const r=q?search(q):[];return{title:'Нашёл! — поиск',html:`<div class="pg start"><h1 style="color:#c04a00">Нашёл!</h1>${form(q)}${q?(r.length?`<p>Найдено: ${r.length}</p>`+r.map(e=>`<div class="hit">${link(e.url,e.s.name+' — '+e.p.title)}<small>${e.url}</small><span>${esc(text(e.p.html).replace(/\s+/g,' ').trim().slice(0,150))}…</span></div>`).join(''):'<p>Ничего не нашлось. Попробуйте одно слово.</p>'):`<p>Например: ${['пицца','расписание','кот','погода'].map(x=>link('nashel.net?q='+encodeURIComponent(x),x)).join(', ')}</p>`}</div>`};}
 const s=SITES.find(s=>s.host===host);const pg=s&&s.pages.find(p=>p.id===path);
 if(!pg)return{title:'Страница не найдена',html:`<div class="pg start"><h2>Не удаётся открыть страницу</h2><p>Адрес <b>${esc(u)}</b> не отвечает. Проверьте, нет ли опечатки, или попробуйте поиск.</p>${form()}<p>${link('katalog.net','Каталог сайтов')}</p></div>`};
 const visits=(O.D.guest['v:'+s.host]||(O.D.guest['v:'+s.host]=100+[...s.host].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7)%9000));
 const own=window.LAYOUT[s.host];if(own)return{title:s.name,site:s,wild:window.WILD[s.host],html:own(s,pg,path,visits,window.WILD[s.host])};
 if(window.WILD[s.host])return{title:s.name,site:s,wild:window.WILD[s.host],html:wildPage(s,pg,path,visits)};
 return{title:s.name,site:s,html:LOOK.site(s,pg,path,visits)};
}
function wildPage(s,pg,path,visits){const w=window.WILD[s.host],K=window.WILDKIT;
 const nav=s.pages.filter(p=>!p.hidden).map(p=>`<a href="#" class="wbtn${p.id===path?' on':''}" data-go="${s.host+(p.id?'/'+p.id:'')}">${p.title}</a>`).join('');
 // на главной сначала то, что сделал хозяин, потом старое содержимое
 const body=path===''?w.home+(pg.html?`<div class="wbox" style="--c:${w.link}">${pg.html}</div>`:''):`<div class="wbox" style="--c:${w.link}"><h2>${pg.title}</h2>${pg.html}</div>`;
 const ring=SITES.filter(x=>window.WILD[x.host]),i=ring.findIndex(x=>x.host===s.host),prev=ring[(i+ring.length-1)%ring.length],next=ring[(i+1)%ring.length];
 return`<div class="wild f-${w.font}" style='background:${w.bg};color:${w.ink};--link:${w.link}'>${w.stick.map(([n,sz,x,y,a])=>`<div class="stick ${a}" style="left:${x}%;top:${y}px">${LOOK.stick(n,sz)}</div>`).join('')}
 <div class="wmain"><div class="wstatus"><span class="mood">${w.status[1]}</span><div><b>${w.status[0]}</b><br>${w.status[2]}</div></div><div class="wtitle">${LOOK.title(s)}</div><div class="herorow">${LOOK.hero(s.host,130,'bob9')}</div><nav>${nav}</nav><button class="tune" data-tune="${w.tune.join(',')}">♫ включить музыку страницы</button>${body}
 <div class="tags">метки: ${w.tags.map(t=>link('nashel.net?q='+encodeURIComponent(t.split('_')[0]),t)).join(' · ')}</div>
 <div class="ring">⟨ ${link(prev.host,prev.name)} &nbsp;|&nbsp; <b>КОЛЬЦО СТРАНИЧЕК</b> &nbsp;|&nbsp; ${link(next.host,next.name)} ⟩</div>
 <div class="wfoot">вы посетитель <span class="count">${String(visits).padStart(6,'0')}</span></div></div></div>`;}
// музыка: короткая мелодия, своя у каждой страницы
let audio=null,tuneTimer=null,tuneBtn=null;
function stopTune(){clearInterval(tuneTimer);tuneTimer=null;if(tuneBtn){tuneBtn.textContent='♫ включить музыку страницы';tuneBtn=null;}}
function playTune(btn){const on=tuneBtn===btn;stopTune();if(on)return;const[seed,bpm,wave]=btn.dataset.tune.split(',');audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();const r=window.WILDKIT.rand(+seed*97+3),scale=[0,2,4,7,9,12,14,16],mel=[...Array(32)].map((_,i)=>i%8===7?null:scale[r(scale.length)]),bass=[0,0,5,7],step=30/+bpm;let k=0,at=audio.currentTime+.05;
 const note=(f,t,len,type,vol)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+len);};
 const tick=()=>{while(at<audio.currentTime+.3){const n=mel[k%32];if(n!==null)note(330*Math.pow(2,n/12),at,step*.9,wave,.045);if(k%4===0)note(110*Math.pow(2,bass[(k/8|0)%4]/12),at,step*3,'triangle',.07);at+=step;k++;}};
 tick();tuneTimer=setInterval(tick,100);tuneBtn=btn;btn.textContent='■ выключить музыку';}
const WIDGET={
 pizza(box){const T=[['сыр',30],['ветчина',45],['грибы',35],['помидоры',25],['колбаса',40],['перец',20],['ананас',30]];box.innerHTML=`<p>Основа с соусом: 100 ₽. Отметьте начинку.</p>${T.map((t,i)=>`<label><input type="checkbox" value="${i}"> ${t[0]} +${t[1]} ₽</label><br>`).join('')}<p><b data-sum>Итого: 100 ₽</b></p><button data-save>Сохранить список в «Мои документы»</button> <span data-ok></span>`;
  const sel=()=>[...box.querySelectorAll('input:checked')].map(i=>T[+i.value]),sum=()=>100+sel().reduce((a,t)=>a+t[1],0);
  box.addEventListener('change',()=>$('[data-sum]',box).textContent='Итого: '+sum()+' ₽');$('[data-save]',box).onclick=()=>{const it=O.create({type:'text',name:'моя пицца.txt',data:'Моя пицца (игровой список, не заказ)\nОснова\n'+sel().map(t=>t[0]).join('\n')+'\nИтого: '+sum()+' ₽'},'docs');$('[data-ok]',box).textContent='Сохранено: '+it.name;};},
 guest(box,host){const list=()=>O.D.guest[host]||(O.D.guest[host]=[]);const draw=()=>{box.innerHTML=`<form><input name="who" placeholder="имя" maxlength="30"> <input name="msg" placeholder="сообщение" maxlength="200" size="40"> <button>Записать</button></form>${list().length?list().map(m=>`<div class="nw"><b>${esc(m[0])}</b><p>${esc(m[1])}</p></div>`).join(''):'<p><i>Пока ни одной записи. Будьте первым.</i></p>'}`;};
  box.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();const f=e.target,m=f.msg.value.trim();if(!m)return;list().unshift([f.who.value.trim()||'Гость',m]);list().length=Math.min(list().length,30);O.save();draw();});draw();}};
let browser=null;const srcNode=document.getElementById('game-src'),GAME_SRC=srcNode?JSON.parse(srcNode.textContent):'';
function openBrowser(url){if(browser){browser.win.el.classList.remove('min');O.open({key:'browser'});if(url)browser.go(url);return;}
 const win=O.open({key:'browser',title:'Интернет',icon:IC.web,w:900,h:600,max:true,build(c,win){
  c.innerHTML=`<div class="menubar"><button data-n="back" title="Назад">◄</button><button data-n="fwd" title="Вперёд">►</button><button data-n="reload" title="Обновить">↻</button><button data-n="home" title="Домой">⌂</button><form data-addr style="flex:1;display:flex;gap:3px"><input class="addr" spellcheck="false" autocomplete="off"><button>Перейти</button></form></div><div class="bm">${BOOK.map(b=>`<button data-bm="${b[0]}">★ ${b[1]}</button>`).join('')}</div><div class="web"><div class="doc"></div><iframe title="ЛентаОС"></iframe><div class="shield"></div></div><div class="status">Готово</div>`;
  const doc=$('.doc',c),frame=$('iframe',c),addr=$('.addr',c);let hist=[],pos=-1,ready=false,wantPage=null;
  const gameURL=u=>{const[h,p]=norm(u).split('/');return h==='lenta.net'?(GAME[p]?p:'constructor'):null;};
  function show(url){stopTune();const g=gameURL(url);addr.value=g?'lenta.net/'+g:url;
   if(g){doc.style.display='none';frame.style.display='block';win.setTitle(GAME[g][1]+' — Интернет');wantPage=GAME[g][0];if(!ready&&!frame.srcdoc){$('.status',c).textContent='Загрузка lenta.net…';frame.onload=()=>{ready=true;$('.status',c).textContent='Готово';frame.contentWindow.__game.go(wantPage);};frame.srcdoc=GAME_SRC;}else if(ready)frame.contentWindow.__game.go(wantPage);}
   else{frame.style.display='none';doc.style.display='block';const p=page(url);doc.innerHTML=p.html;doc.style.cursor=p.wild&&p.wild.cur?`url("data:image/svg+xml,${encodeURIComponent(window.WILDKIT.art(p.wild.cur,3).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '))}") 2 2, auto`:'';doc.scrollTop=0;win.setTitle(p.title+' — Интернет');if(url==='home://start')addr.value='';const w=$('[data-widget]',doc);if(w)WIDGET[w.dataset.widget](w,p.site&&p.site.host);$('.status',c).textContent='Готово';}
   $('[data-n="back"]',c).disabled=pos<=0;$('[data-n="fwd"]',c).disabled=pos>=hist.length-1;O.D.browser.url=url;O.save();}
  function go(url){url=url.trim();if(!url)return;if(!/\.|:\/\//.test(url))url='nashel.net?q='+encodeURIComponent(url);url=url==='home://start'?url:norm(url);if(url==='lenta.net')url='lenta.net/feed';if(hist[pos]!==url){hist=hist.slice(0,pos+1);hist.push(url);pos++;}show(url);}
  c.addEventListener('click',e=>{const tn=e.target.closest('[data-tune]');if(tn){playTune(tn);return;}const a=e.target.closest('[data-go]');if(a){e.preventDefault();go(a.dataset.go);return;}const b=e.target.closest('[data-bm]');if(b)go(b.dataset.bm);const n=e.target.closest('[data-n]');if(n){const k=n.dataset.n;if(k==='back'&&pos>0)show(hist[--pos]);if(k==='fwd'&&pos<hist.length-1)show(hist[++pos]);if(k==='reload')show(hist[pos]);if(k==='home')go('home://start');}});
  c.addEventListener('submit',e=>{e.preventDefault();if(e.target.hasAttribute('data-addr'))go(addr.value);else if(e.target.hasAttribute('data-search'))go('nashel.net?q='+encodeURIComponent(e.target.q.value));});
  addr.addEventListener('focus',()=>addr.select());
  win.onclose=()=>{if(ready)frame.contentWindow.__game.save();};win.clean.push(()=>{browser=null;stopTune();});
  browser={win,go,frame,synced(p){const u='lenta.net/'+gamePath(p);if(gameURL(addr.value)&&addr.value!==u){hist=hist.slice(0,pos+1);hist.push(u);pos++;addr.value=u;win.setTitle(GAME[gamePath(p)][1]+' — Интернет');$('[data-n="back"]',c).disabled=false;}}};
  browser.win=win;go(url||'home://start');}});
 if(browser)browser.win=win;}
O.app('browser','Интернет',IC.web,openBrowser);
// мост для соцсети: скачанное попадает в «Загрузки» компьютера, переходы внутри сайта видны в адресной строке
window.PC={page:p=>browser&&browser.synced(p),download(f){const it=O.create(f.kind==='photo'?{type:'image',name:f.name.replace(/\.png$/,'.svg'),data:f.svg}:{type:'table',name:f.name,cols:f.cols,rows:f.rows},'down');return it.name;}};
window.WEB={page,search,BOOK};
})();
