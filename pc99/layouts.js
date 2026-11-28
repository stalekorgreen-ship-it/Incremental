// у каждого сайта из этого списка своя вёрстка целиком: структура, меню и подача содержимого
(function(){
const A=window.ART99,L=window.LAYOUT={};
const img=(n,w,cls)=>`<img class="p9 ${cls||''}" src="${A[n]}" width="${w}" alt="">`;
const url=(s,p)=>s.host+(p.id?'/'+p.id:'');
// меню: каждый сайт сам решает, как выглядит пункт (f получает название, номер и признак «открыт»)
const menu=(s,cur,cls,f)=>s.pages.filter(p=>!p.hidden).map((p,i)=>`<a href="#" class="${cls}${p.id===cur?' on':''}" data-go="${url(s,p)}">${f?f(p.title,i,p.id===cur):p.title}</a>`).join('');
const kat=(t,c)=>`<a href="#" class="${c||''}" data-go="katalog.net">${t||'Каталог'}</a>`;
const num=n=>String(n).padStart(6,'0');
// разбор старого содержимого страниц: сами тексты не меняются
const rows=h=>(h.match(/<tr>.*?<\/tr>/gs)||[]).map(r=>[...r.matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)].map(m=>m[1]));
const news=h=>[...h.matchAll(/<div class="nw"><b>(.*?)<\/b><small>(.*?)<\/small><p>(.*?)<\/p><\/div>/gs)].map(m=>({t:m[1],d:m[2],p:m[3]}));
const items=h=>[...h.matchAll(/<li>(.*?)<\/li>/gs)].map(m=>m[1]);
const paras=h=>[...h.matchAll(/<p>(.*?)<\/p>/gs)].map(m=>m[1]);
// для «диких» страничек: музыка, метки и кольцо есть у всех, но оформлены каждым по-своему
const tune=w=>`<button class="tune" data-tune="${w.tune.join(',')}">♫ включить музыку страницы</button>`;
const tags=w=>`метки: ${w.tags.map(t=>`<a href="#" data-go="nashel.net?q=${encodeURIComponent(t.split('_')[0])}">${t}</a>`).join(' · ')}`;
const ring=s=>{const r=window.SITES.filter(x=>window.WILD[x.host]),i=r.findIndex(x=>x.host===s.host),a=r[(i+r.length-1)%r.length],b=r[(i+1)%r.length];return`<a href="#" data-go="${a.host}">⟨ ${a.name}</a> <b>КОЛЬЦО СТРАНИЧЕК</b> <a href="#" data-go="${b.host}">${b.name} ⟩</a>`;};

// 1. настоящая газета
L['vestnik-ozerska.net']=(s,pg,path,v)=>{const n=news(pg.html);
 const body=n.length?`<div class="cols">${n.map((x,i)=>`<article class="${i?'':'lead'}"><h3>${x.t}</h3>${i?'':`<figure>${img('vestnik-ozerska',150)}</figure>`}<p><i>${x.d}.</i> ${x.p}</p></article>`).join('')}</div>`
 :`<div class="small">${items(pg.html).map(t=>`<div>${t}</div>`).join('')}</div>`;
 return`<div class="L Lgz"><div class="sheet"><div class="ears"><div>${s.tag}</div><h1>ВЕСТНИК<br>ОЗЁРСКА</h1><div>Читателей у этой полосы:<br><b>${v}</b></div></div>
 <nav>${menu(s,path,'rub')}${kat('Каталог','rub')}</nav><h2>${pg.title}</h2>${body}</div></div>`;};

// 2. телестудия прогноза
L['pogoda-segodnya.net']=(s,pg,path,v)=>{const r=rows(pg.html),ico=t=>/снег/.test(t)?'❄':/дожд/.test(t)?'☂':/ясн|солн/.test(t)?'☀':'☁',deg=t=>parseInt(String(t).replace('−','-'),10)||0,
 therm=t=>`<span class="therm"><i style="height:${Math.max(8,Math.min(100,(deg(t)+30)*2))}%;background:${deg(t)>0?'#ff7a2a':'#3ac8ff'}"></i></span>`;
 let body;
 if(!r.length)body=`<div class="signs">${items(pg.html).map((t,i)=>`<div class="cloud c${i%3}">${t}</div>`).join('')}</div>`;
 else if(path==='')body=`<div class="cities">${r.slice(1).map(c=>`<div class="city"><div class="cn">${c[0]}</div><div class="mid"><span class="sky">${ico(c[3])}</span>${therm(c[1])}<b>${c[1]}°</b></div><div class="wind">${r[0][2]}: ${c[2]}<br>${c[3]}</div></div>`).join('')}</div>`;
 else body=r[0].slice(1).map((name,k)=>`<div class="graph"><h3>${name}</h3><div class="bars">${r.slice(1).map(d=>`<div><b>${d[k+1]}°</b>${therm(d[k+1])}<span>${d[0]}</span></div>`).join('')}</div></div>`).join('');
 return`<div class="L Ltv"><div class="screen"><div class="bug">${img('pogoda-segodnya',86,'bob9')}<div><h1>ПОГОДА СЕГОДНЯ</h1><small>${s.tag}</small></div><span class="live">● ЭФИР</span></div>
 <h2>${pg.title}</h2>${body}<nav>${menu(s,path,'ch',(t,i)=>`<b>${i+1}</b> ${t}`)}</nav></div><div class="crawl"><span>Зрителей сегодня: ${v} ✦ ${s.tag} ✦ ${kat('все каналы — в каталоге')}</span></div></div>`;};

// 3. вокзальное табло из перекидных букв
const flap=t=>`<span class="flap">${[...String(t)].map(c=>c===' '?'<u></u>':`<i>${c}</i>`).join('')}</span>`;
L['zhd-vokzal.net']=(s,pg,path,v)=>{const r=rows(pg.html);
 const body=r.length?`<div class="board"><div class="hdr">${r[0].map(c=>`<span>${c}</span>`).join('')}</div>${r.slice(1).map(c=>`<div class="line">${c.map((x,i)=>`<span class="k${i}">${i===1?`<span class="route">${x}</span>`:flap(x)}</span>`).join('')}</div>`).join('')}</div>`
 :`<div class="shelf">${items(pg.html).map((t,i)=>`<div class="bag"><b>БИРКА № ${i+1}</b>${t}</div>`).join('')}</div>`;
 return`<div class="L Lst"><header>${img('zhd-vokzal',96)}<div><h1>${flap('ВОКЗАЛ')}</h1><small>${s.tag}</small></div></header>
 <nav>${menu(s,path,'sign',(t,i)=>`<span>${i+1}</span>${t} →`)}${kat('<span>i</span>Выход в каталог →','sign')}</nav><h2>${pg.title}</h2>${body}<footer>пассажиров у табло: ${flap(num(v))}</footer></div>`;};

// 4. козырёк кинотеатра и билеты
L['kino-rodina.net']=(s,pg,path,v)=>{const r=rows(pg.html);
 const body=r.length?r.slice(1).map((c,i)=>`<div class="ticket t${i%3}"><div class="main"><h3>${c[0]}</h3><div class="times">${c[1].split(',').map(t=>`<span>${t.trim()}</span>`).join('')}</div></div><div class="stub"><small>${r[0][2]}</small><b>${c[2]}</b><small>КОНТРОЛЬ</small></div></div>`).join('')
 :`<div class="counter"><div class="menuboard">${items(pg.html).map(t=>`<div>★ ${t} ★</div>`).join('')}</div>${img('kino-rodina',150,'sway9')}</div>`;
 return`<div class="L Lkn"><div class="curtain l"></div><div class="curtain r"></div><div class="hall"><div class="marquee"><div><small>КИНОТЕАТР</small><h1>РОДИНА</h1><small>${s.tag}</small></div></div>
 <nav>${menu(s,path,'door')}</nav><h2>— ${pg.title} —</h2>${body}<footer>${img('kino-rodina',54)} зрителей в фойе: ${v} · ${kat()}</footer></div></div>`;};

// 5. синие панели, как в файловом менеджере
L['baza-kompov.net']=(s,pg,path,v)=>{const r=rows(pg.html),li=items(pg.html);
 const body=r.length?`<table>${r.map((c,i)=>`<tr>${c.map(x=>i?`<td>${x}</td>`:`<th>${x}</th>`).join('')}</tr>`).join('')}</table>`:li.length?li.map(t=>{const[a,b]=t.split(': ');return`<div class="dots"><span>${a}</span><i></i><span>${b||''}</span></div>`;}).join(''):paras(pg.html).map(t=>`<p>&gt; ${t}</p>`).join('');
 const files=['SBORKI.DAT','DETALI.DAT','SOVETY.TXT'];
 return`<div class="L Ldos"><div class="top"><span>Левая</span><span>Файлы</span><span>Диск</span><span>Команды</span><span>Правая</span></div><div class="panels">
 <div class="pane left"><div class="cap">C:\\БАЗА_КОМПОВ</div><nav>${menu(s,path,'file',(t,i)=>`<span>${files[i]||'FILE'+i+'.TXT'}</span><span>${t}</span>`)}${kat('<span>..</span><span>Каталог сайтов</span>','file')}</nav><div class="pic">${img('baza-kompov',150)}</div><div class="info">${s.tag}<br>Обращений к диску: ${v}</div></div>
 <div class="pane right"><div class="cap">${pg.title}</div>${body}<div class="cursor">C:\\&gt;<b>_</b></div></div></div>
 <div class="keys">${s.pages.filter(p=>!p.hidden).map((p,i)=>`<a href="#" data-go="${url(s,p)}"><b>${i+1}</b>${p.title}</a>`).join('')}<a href="#" data-go="katalog.net"><b>10</b>Выход</a></div></div>`;};

// 6. пиццерия: клетчатая скатерть, меню на тарелках, вывеска-круги
L['pizza-ugolok.net']=(s,pg,path,v,w)=>{const r=rows(pg.html);
 let body;
 if(r.length)body=`<div class="plates">${r.slice(1).map((c,i)=>`<div class="plate"><div class="pie p${i%4}">${img('pizza-ugolok',104)}</div><h3>${c[0]}</h3><p>${c[2]}</p><b class="price">${c[1]}</b></div>`).join('')}</div><small>${r[0][1]} — размер каждой</small>`;
 else if(pg.html.includes('data-widget'))body=`<div class="receipt">${pg.html}</div>`;
 else body=`<div class="notes">${paras(pg.html).map(t=>`<div class="napkin">${t}</div>`).join('')}</div>`;
 return`<div class="L Lpz"><div class="awning"></div><div class="logo">${img('pizza-ugolok',92,'spin9')}<h1>Пицца<br>«Уголок»</h1>${img('pizza-ugolok',92,'spin9')}</div>
 <nav>${menu(s,path,'slice')}</nav><div class="cook">${w.status[1]} <b>${w.status[0]}:</b> «${w.status[2]}»</div><h2>${pg.title}</h2>${body}${path===''?`<div class="home">${w.home}</div>`:''}
 ${tune(w)}<div class="boxlid"><div>${tags(w)}</div><div class="ringz">${ring(s)}</div><div>коробок отдано: ${v} · ${kat()}</div></div></div>`;};

// 7. пробковая доска с карточками и записками
L['kotoklub.net']=(s,pg,path,v,w)=>{const r=rows(pg.html);
 let body;
 if(r.length)body=`<div class="pins">${r.slice(1).map((c,i)=>`<div class="polaroid k${i%4}">${img('x-vcat'+(i%3+1),110)}<h3>${c[0]}</h3><p>${c[1]}</p></div>`).join('')}</div>`;
 else if(pg.html.includes('data-widget'))body=`<div class="paper">${pg.html}</div>`;
 else body=`<div class="pins">${items(pg.html).map((t,i)=>`<div class="sticky k${i%4}">${t}</div>`).join('')}</div>`;
 return`<div class="L Lct"><div class="cork"><div class="title">${img('kotoklub',100,'sway9')}<h1>КотоКлуб</h1></div><nav>${menu(s,path,'tab')}${kat('на улицу','tab')}</nav>
 <div class="sticky mod">${w.status[1]} <b>${w.status[0]}</b><br>${w.status[2]}</div><h2>${pg.title}</h2>${body}${path===''?`<div class="home">${w.home}</div>`:''}
 ${tune(w)}<div class="strip">${tags(w)}</div><div class="strip">${ring(s)}</div><div class="strip">котолюдей заходило: ${v}</div></div></div>`;};

// 8. меню самопальной игры
L['igry-chit.net']=(s,pg,path,v,w)=>{const n=news(pg.html);
 let body;
 if(n.length)body=n.map((x,i)=>`<div class="level"><div class="no">LVL<br><b>${i+1}</b></div><div><small>${x.d}</small><h3>${x.t}</h3><p>${x.p}</p></div></div>`).join('');
 else if(pg.html.includes('data-widget'))body=`<div class="dialog">${pg.html}</div>`;
 else body=`<div class="dialog">${pg.html}</div>`;
 return`<div class="L Lgm"><div class="hud"><span>1UP ${num(v)}</span><span>HI 999999</span><span>♥♥♥</span></div><h1>ЧИТЫ<small>и прохождения</small></h1><div class="sub">${s.tag}</div>
 <div class="split"><div class="side"><nav>${menu(s,path,'opt')}${kat('Выйти из игры','opt')}</nav><div class="player">${w.status[1]} <b>${w.status[0]}</b><br>${w.status[2]}</div>${tune(w)}</div>
 <div class="play">${path===''?`<div class="home">${w.home}</div>`:''}<h2>▼ ${pg.title} ▼</h2>${body}</div></div>
 <div class="credits"><div>${tags(w)}</div><div>${ring(s)}</div></div></div>`;};

// ---- партия 2 ----
const widget=h=>h.includes('data-widget');
// 9. приказы на машинке в картонной папке
L['gosvestnik.gov']=(s,pg,path,v)=>{const n=news(pg.html);
 const body=n.length?n.map((x,i)=>`<div class="doc99"><div class="reg"><span>Сообщение ${i+1}</span><span>${x.d}</span></div><h3>${x.t}</h3><p>${x.p}</p></div>`).join(''):`<div class="doc99">${pg.html}</div>`;
 return`<div class="L Lgv"><div class="folder"><nav>${menu(s,path,'ftab')}${kat('Архив: каталог','ftab')}</nav><div class="inside"><header>${img('gosvestnik',74)}<div><h1>ГОСУДАРСТВЕННЫЙ ВЕСТНИК</h1><small>${s.tag}</small></div><div class="stamp">К СВЕДЕНИЮ<b>${pg.title}</b></div></header>${body}<footer>Лист ознакомления: вы № ${num(v)}</footer></div></div></div>`;};
// 10. школьная доска
L['shkola4.net']=(s,pg,path,v)=>{const r=rows(pg.html),n=news(pg.html);
 const body=n.length?`<div class="chalks">${n.map(x=>`<div><small>${x.d}</small><h3>${x.t}</h3><p>${x.p}</p></div>`).join('')}</div>`:r.length?`<div class="bells">${r.slice(1).map(c=>`<div><span class="bn">${c[0]}</span><span class="bell">🔔</span><b>${c[1]}</b></div>`).join('')}</div>`:`<div class="case">${img('shkola4',130)}<div class="plate99">${pg.html}</div></div>`;
 return`<div class="L Lsc"><div class="slate"><h1>Школа № 4</h1><div class="sub">${s.tag}</div><nav>${menu(s,path,'chalk',(t,i)=>`${i+1}) ${t}`)}${kat('на перемену →','chalk')}</nav><h2>Тема: ${pg.title}</h2>${body}</div><div class="ledge"><i></i><i></i><i></i><b></b></div><footer>В журнале посещений: ${v}</footer></div>`;};
// 11. картотека
L['biblioteka-gorkaya.net']=(s,pg,path,v)=>{const li=items(pg.html);
 const body=li.length?`<div class="books">${li.map((t,i)=>`<div class="spine b${i%3}"><span>${t}</span></div>`).join('')}</div>`:`<div class="index">${paras(pg.html).map((t,i)=>`<div class="icard"><u>Карточка ${i+1}</u><p>${t}</p></div>`).join('')}</div>`;
 return`<div class="L Llb"><div class="brass"><h1>${s.name}</h1><small>${s.tag}</small></div><nav>${menu(s,path,'drawer',t=>`<span>${t}</span><i></i>`)}${kat('<span>Каталог сайтов</span><i></i>','drawer')}</nav><h2>${pg.title}</h2>${body}<footer>${img('biblioteka-gorkaya',70)}<span>Читательских формуляров: ${v}. Просим соблюдать тишину.</span></footer></div>`;};
// 12. радиоприёмник
L['radio-mayachok.net']=(s,pg,path,v)=>{const r=rows(pg.html),pages=s.pages.filter(p=>!p.hidden),k=pages.findIndex(p=>p.id===path);
 const body=r.length?`<div class="sched">${r.slice(1).map(c=>`<div><b>${c[0]}</b><span>${c[1]}</span></div>`).join('')}</div>`:`<div class="gram"><div class="gh">ЗАЯВКА В ЭФИР</div>${pg.html}</div>`;
 return`<div class="L Lrd"><div class="set"><div class="grille">${img('radio-mayachok',96)}<h1>Маячок</h1></div><div class="scale"><div class="marks">${'<i></i>'.repeat(31)}</div><nav>${menu(s,path,'st99')}${kat('другие волны','st99')}</nav><div class="needle" style="left:${Math.round((k+.5)/(pages.length+1)*100)}%"></div></div><div class="knobs"><em></em><div class="lamp">● ${pg.title}</div><em></em></div></div><div class="out"><h2>${s.tag}</h2>${body}<footer>Приёмников настроено: ${v}</footer></div></div>`;};
// 13. схема автобусных линий
L['avtobus-info.net']=(s,pg,path,v)=>{const r=rows(pg.html),C=['#d8232a','#1262c4','#12904a','#e08a00'];
 return`<div class="L Lbs"><div class="stop"><div class="abus">А</div><div><h1>${s.name}</h1><small>${s.tag}</small></div>${img('avtobus-info',110)}</div><h2>${pg.title}</h2>${r.slice(1).map((c,i)=>{const st=c[1].split(' — ');return`<div class="route99" style="--rc:${C[i%4]}"><div class="rn">${c[0]}</div><div class="track">${st.map(x=>`<div class="dot99"><i></i>${x}</div>`).join('')}</div><div class="iv">${r[0][2]}<b>${c[2]}</b></div></div>`;}).join('')}<footer>${menu(s,path,'busnav')} · ${kat()} · ждут на остановке: ${v}</footer></div>`;};
// 14. полка с кассетами и кнопки магнитофона
L['muz-lavka.net']=(s,pg,path,v,w)=>{const r=rows(pg.html);
 const body=r.length?`<div class="shelf99">${r.slice(1).map((c,i)=>`<div class="goods"><div class="${c[2]==='диск'?'cd':'tape t'+(i%3)}"><div class="lab"><b>${c[0]}</b><span>${c[1]}</span></div><div class="reels"><i></i><i></i></div></div>${c[2]==='диск'?`<div class="cdname"><b>${c[0]}</b><br>${c[1]}</div>`:''}<small>${c[2]}</small></div>`).join('')}</div>`:`<div class="tags99">${items(pg.html).map(t=>`<div class="price99">${t}</div>`).join('')}</div>`;
 return`<div class="L Lmz"><div class="neon"><h1>МУЗЫКАЛЬНАЯ<br>ЛАВКА</h1><small>${s.tag}</small></div><div class="deck"><nav>${menu(s,path,'key',(t,i)=>`<b>${i?'▶▶':'▶'}</b>${t}`)}${kat('<b>⏏</b>Каталог','key')}</nav></div><div class="seller">${w.status[1]} <b>${w.status[0]}:</b> ${w.status[2]}</div>${path===''?'<div class="rainbow"></div>':''}<h2>${pg.title}</h2>${body}${tune(w)}<div class="foot99">${tags(w)}<br>${ring(s)}<br>кассет перемотано: ${v}</div></div>`;};
// 15. такси: шашечки, счётчик, объявление с отрывными корешками
L['taxi-veter.net']=(s,pg,path,v,w)=>{const r=rows(pg.html);
 const body=r.length?`<div class="meter"><div class="mh">ТАКСОМЕТР</div>${r.slice(1).map(c=>`<div class="fare"><span>${c[0]}</span><b>${c[1]}</b></div>`).join('')}</div>`:`<div class="flyer"><h3>ТРЕБУЮТСЯ!</h3>${pg.html}<div class="tear">${'<span>такси «Ветер»</span>'.repeat(7)}</div></div>`;
 return`<div class="L Ltx"><div class="check"></div><div class="plate97"><h1>ТАКСИ «ВЕТЕР»</h1></div><div class="road">${img('taxi-veter',170,'drive99')}</div><small class="sl">${s.tag}</small><nav>${menu(s,path,'lamp99')}${kat('Объезд: каталог','lamp99')}</nav><div class="walkie">${w.status[1]} <b>${w.status[0]}:</b> «${w.status[2]}» <i>*шшш*</i></div><h2>${pg.title}</h2>${body}${tune(w)}<div class="foot99">${tags(w)}<br>${ring(s)}<br>пробег страницы: ${num(v)} км</div><div class="check"></div></div>`;};
// 16. чердак с отрывными листками
L['anekdot-doma.net']=(s,pg,path,v,w)=>{const n=news(pg.html);
 return`<div class="L Lat"><div class="roof"><div class="window99">${img('anekdot-doma',96,'sway9')}</div></div><h1>СМЕШНОЙ ЧЕРДАК</h1><div class="sub">${s.tag}</div><nav>${menu(s,path,'plank')}${kat('слезть с чердака','plank')}</nav>${path===''?w.home:''}<h2>${pg.title}</h2><div class="sheets">${n.map((x,i)=>`<div class="leaf r${i%3}"><div class="bign">${x.d}</div><h3>${x.t}</h3><p>${x.p}</p><div class="ha">ха-ха</div></div>`).join('')||pg.html}</div><div class="who">${w.status[1]} <b>${w.status[0]}</b>: ${w.status[2]}</div>${tune(w)}<div class="foot99">${tags(w)}<br>${ring(s)}<br>на чердак лазили: ${v}</div></div>`;};
// 17. пульт наблюдателя: радар и досье
L['ufo-ozersk.narod.net']=(s,pg,path,v,w)=>{const li=items(pg.html);
 let body='';
 if(li.length)body=`<div class="printout">${li.map(t=>{const[a,...b]=t.split(' — ');return`<div><b>${a}</b><span>${b.join(' — ')}</span></div>`;}).join('')}</div>`;
 else if(widget(pg.html))body=`<div class="term">${pg.html}</div>`;
 else if(pg.html)body=`<div class="secretfile">${pg.html}</div>`;
 return`<div class="L Luf"><div class="console"><div class="radar"><div class="beam"></div><i style="left:62%;top:24%"></i><i style="left:30%;top:58%"></i>${img('ufo-ozersk',64,'bob9')}</div><div class="id"><h1>ОНИ НАД ГАРАЖАМИ</h1><small>${s.tag}</small><div class="obs">${w.status[1]} ${w.status[0]}: ${w.status[2]}</div></div></div><nav>${menu(s,path,'toggle',(t,i,on)=>`<i></i>${t}`)}${kat('<i></i>Выйти из эфира','toggle')}</nav><h2>&gt; ${pg.title}</h2>${path===''?`<div class="home">${w.home}</div>`:''}${body}${tune(w)}<div class="foot99">${tags(w)}<br>${ring(s)}<br>свидетелей зафиксировано: ${v}</div></div>`;};
// 18. бабушкина клеёнка и тетрадь
L['babushkin-retsept.narod.net']=(s,pg,path,v,w)=>{
 return`<div class="L Lbb"><div class="doily">${img('babushkin-retsept',110)}<div><h1>БАБУШКА ТОНЯ<br>В ИНТЕРНЕТЕ</h1><div>${s.tag}</div></div></div><nav>${menu(s,path,'bigbtn')}</nav><div class="notebook"><h2>${pg.title}</h2>${path===''?`<div class="home">${w.home}</div>`:''}${pg.html}</div><div class="magnet">${w.status[1]} ${w.status[2]}</div>${tune(w)}<div class="foot99">${tags(w)}<br>${ring(s)}<br>ГОСТЕЙ БЫЛО: ${v}<br>${kat('ДРУГИЕ СТРАНИЦЫ','')}</div></div>`;};

// ---- партия 3 ----
// разбор страницы на части: что не разобрано, остаётся под основным блоком, тексты не теряются
const by=(h,f)=>{let out='',rest=h;const cut=re=>{rest=rest.replace(re,'');};
 if(f.t&&rows(rest).length){out+=f.t(rows(rest));cut(/<table.*?<\/table>/s);}
 if(f.n&&news(rest).length){out+=f.n(news(rest));cut(/<div class="nw">.*?<\/p><\/div>/gs);}
 if(f.l&&items(rest).length&&!widget(rest)){out+=f.l(items(rest));cut(/<ul>.*?<\/ul>/gs);}
 if(widget(rest)||/<img|<svg|class="photos"/.test(rest)||rest.replace(/<[^>]+>/g,'').trim())out+=f.p?f.p(rest):`<div class="rest">${rest}</div>`;
 return out;};
const each=(a,f)=>a.map(f).join('');
const head=(r)=>r.slice(1);
// «подвал» диких страничек
const wf=(s,w,v,word)=>`${tune(w)}<div class="foot99">${tags(w)}<br>${ring(s)}<br>${word}: ${v}</div>`;
const who=(w,c)=>`<div class="${c}">${w.status[1]} <b>${w.status[0]}</b>: ${w.status[2]}</div>`;
const home=(w,path)=>path===''?`<div class="home">${w.home}</div>`:'';
const D=(host,fn)=>{L[host.includes('.gov')||host.includes('.edu')?host:host+'.net']=fn;};
const wrap=(c,h)=>`<div class="L ${c}">${h}</div>`;
const H=(s,w,n)=>img(s.host.split('.')[0],w,n);

// 19. лента городских новостей по минутам
D('belogorie-inform',(s,pg,path,v)=>wrap('Lbi',`<header><h1>БЕЛОГОРЬЕ<span>ИНФОРМ</span></h1>${H(s,70)}<small>${s.tag}</small></header><nav>${menu(s,path,'bt')}${kat('Все сайты','bt')}</nav><h2>${pg.title}</h2>${by(pg.html,{n:n=>`<div class="line99">${each(n,x=>`<div class="ev"><time>${x.d}</time><div><h3>${x.t}</h3><p>${x.p}</p></div></div>`)}</div>`,t:r=>`<div class="strip99">${each(head(r),c=>`<div><b>${c[0]}</b><span>${r[0][1]}: ${c[1]}</span><span>${r[0][2]}: ${c[2]}</span><i>${c[3]}</i></div>`)}</div>`})}<footer>сейчас читают: ${v}</footer>`));
// 20. блинная: меню на стопке блинов, разделы на банках варенья
D('blinnaya-masha',(s,pg,path,v)=>wrap('Lbl',`<div class="plate99">${H(s,110,'bob9')}<h1>Блинная<br>«У Маши»</h1><small>${s.tag}</small></div><nav>${menu(s,path,'jar')}${kat('Каталог','jar')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="stack">${each(head(r),c=>`<div class="blin"><span>${c[0]}</span><b>${c[1]}</b></div>`)}</div>`,l:l=>`<ol class="steps">${each(l,t=>`<li>${t}</li>`)}</ol>`})}<footer>гостей за стойкой было: ${v}</footer>`));
// 21. кулинарный журнал с цветными закладками сбоку
D('povaryoshka',(s,pg,path,v)=>wrap('Lpv',`<div class="mag"><nav>${menu(s,path,'mark')}${kat('Каталог','mark')}</nav><div class="spread"><header>${H(s,100,'sway9')}<h1>Поварёшка</h1><small>${s.tag}</small></header><h2>${pg.title}</h2>${by(pg.html,{n:n=>each(n,(x,i)=>`<div class="rec"><em>${i+1}</em><div><small>${x.d}</small><h3>${x.t}</h3><p>${x.p}</p></div></div>`),l:l=>`<div class="dishes">${each(l,t=>`<div><i></i>${t}</div>`)}</div>`})}<footer>подписчиков заглянуло: ${v}</footer></div></div>`));
// 22. крафтовый пакет и чашки
D('kofe-i-bulka',(s,pg,path,v)=>wrap('Lkf',`<div class="bag99"><div class="ring99 a"></div><div class="ring99 b"></div>${H(s,100)}<h1>кофе и булка</h1><small>${s.tag}</small><nav>${menu(s,path,'bean')} ${kat('каталог','bean')}</nav><h2>~ ${pg.title} ~</h2>${by(pg.html,{t:r=>each(head(r),c=>`<div class="pos"><span>☕</span>${c[0]}<i></i><b>${c[1]}</b></div>`),l:l=>each(l,t=>`<div class="rule">${t}</div>`)})}<footer>чашек налито: ${v}</footer></div>`));
// 23. чертёж мебельной мастерской
D('mebel-sosna',(s,pg,path,v)=>wrap('Lms',`<div class="draft"><div class="titleblock"><div>${H(s,76)}</div><div><h1>МЕБЕЛЬ «СОСНА»</h1><small>${s.tag}</small></div><div>Лист: ${pg.title}<br>Смотрели: ${v}</div></div><nav>${menu(s,path,'axis',(t,i)=>`<b>${'АБВГД'[i]}</b>${t}`)}${kat('<b>К</b>Другие сайты','axis')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="parts99">${each(head(r),(c,i)=>`<div class="part"><div class="shape s${i%3}"></div><h3>${c[0]}</h3><div class="dim">${r[0][1]}: ${c[1]}</div><b>${c[2]}</b></div>`)}</div>`})}</div>`));
// 24. цветочные открытки с лентами
D('cvety-roza',(s,pg,path,v,w)=>wrap('Lfl',`<div class="ribbon"><h1>Цветочная лавка «Роза»</h1></div>${H(s,130,'sway9')}<small>${s.tag}</small><nav>${menu(s,path,'petal')}${kat('в сад: каталог','petal')}</nav>${who(w,'note99')}${home(w,path)}<h2>❀ ${pg.title} ❀</h2>${by(pg.html,{t:r=>`<div class="cards99">${each(head(r),(c,i)=>`<div class="greet g${i%3}"><span>${'✿❁✾'[i%3]}</span><h3>«${c[0]}»</h3><b>${c[1]}</b></div>`)}</div>`,l:l=>`<div class="leafs">${each(l,t=>`<div>${t}</div>`)}</div>`})}${wf(s,w,v,'букетов собрано взглядом')}`));
// 25. раскрытая книга с ляссе
D('knigi-polka',(s,pg,path,v)=>wrap('Lbk',`<div class="book"><div class="pl"><h1>Книжная<br>«Полка»</h1>${H(s,130)}<p>${s.tag}</p><h4>Оглавление</h4><nav>${menu(s,path,'toc',(t,i)=>`<span>${t}</span><i></i><span>${i*14+3}</span>`)}${kat('<span>Каталог</span><i></i><span>∞</span>','toc')}</nav></div><div class="pr"><div class="lasse"></div><h2>Глава «${pg.title}»</h2>${by(pg.html,{l:l=>`<ol>${each(l,t=>`<li>${t}</li>`)}</ol>`})}<footer>— ${v} —</footer></div></div>`));
// 26. выкройка: сантиметр, строчки, бирки на нитках
D('atelie-igla',(s,pg,path,v)=>wrap('Lat2',`<div class="tape99">${each([...Array(40)],(x,i)=>`<i>${i+1}</i>`)}</div><div class="cloth">${H(s,96,'sway9')}<h1>Ателье «Игла»</h1><small>${s.tag}</small><nav>${menu(s,path,'button99')}${kat('Каталог','button99')}</nav><h2>✂ - - - ${pg.title} - - - ✂</h2>${by(pg.html,{t:r=>`<div class="hang">${each(head(r),c=>`<div class="tag97"><h3>${c[0]}</h3><b>${c[1]}</b></div>`)}</div>`,p:h=>`<div class="patch">${h}</div>`})}<footer>примерок: ${v}</footer></div>`));
// 27. стройка: полосы, визитки мастеров
D('remont-bez-slez',(s,pg,path,v)=>wrap('Lrm',`<div class="haz"></div><header>${H(s,100)}<h1>РЕМОНТ<br>БЕЗ СЛЁЗ</h1><div class="helmet">${s.tag}</div></header><nav>${menu(s,path,'tool',(t,i)=>`${'🔨🔧🪛'.match(/./gu)[i%3]} ${t}`)}${kat('🚪 Каталог','tool')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="biz">${each(head(r),c=>`<div><h3>${c[0]}</h3><p>${c[1]}</p><span>📍 ${c[2]}</span></div>`)}</div>`,l:l=>`<div class="notes99">${each(l,(t,i)=>`<div><b>СОВЕТ ${i+1}</b>${t}</div>`)}</div>`})}<footer>пережили ремонт и зашли: ${v}</footer><div class="haz"></div>`));
// 28. посадочные талоны
D('avia-strela',(s,pg,path,v)=>wrap('Lav',`<header>${H(s,150,'bob9')}<div><h1>СТРЕЛА ✈</h1><small>${s.tag}</small></div></header><nav>${menu(s,path,'gate',(t,i)=>`<small>ВЫХОД ${i+1}</small>${t}`)}${kat('<small>ВЫХОД 0</small>Каталог','gate')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>each(head(r),c=>`<div class="pass"><div class="no99"><small>${r[0][0]}</small><b>${c[0]}</b></div><div class="way"><div><small>${r[0][1]}</small><b>${c[1]}</b></div><span>✈</span><div><small>${r[0][2]}</small><b>${c[2]}</b></div></div><div class="when"><small>${r[0][3]}</small><b>${c[3]}</b><small>${c[4]}</small></div><div class="bars99"></div></div>`),l:l=>`<div class="memo">${each(l,t=>`<div>⚠ ${t}</div>`)}</div>`})}<footer>пассажиров в зале: ${v}</footer>`));
// 29. открытки с юга с марками
D('tur-gorizont',(s,pg,path,v)=>wrap('Ltg',`<div class="sun"></div><h1>ГОРИЗОНТ</h1><small>${s.tag}</small><nav>${menu(s,path,'flag')}${kat('каталог','flag')}</nav><div class="sea"><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="posts">${each(head(r),c=>`<div class="post"><div class="stamp97">${H(s,40)}</div><h3>${c[0]}</h3><p>${r[0][1]}: ${c[1]}</p><b>${c[2]}</b></div>`)}</div>`,n:n=>`<div class="posts">${each(n,x=>`<div class="post wide"><small>${x.d}</small><p>«${x.p}»</p><h3>${x.t}</h3></div>`)}</div>`})}<footer>чемоданов собрано: ${v}</footer></div>`));
// 30. электрощит
D('rayenergo',(s,pg,path,v)=>wrap('Lre',`<div class="shield99"><header><div class="bolt">⚡</div><div><h1>РАЙЭНЕРГО</h1><small>${s.tag}</small></div>${H(s,76)}</header><nav>${menu(s,path,'breaker',(t,i,on)=>`<i></i><span>${t}</span>`)}${kat('<i></i><span>Каталог</span>','breaker')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="journal">${each(head(r),c=>`<div><em></em>${each(c,(x,i)=>`<span><small>${r[0][i]}</small>${x}</span>`)}</div>`)}</div>`,p:h=>`<div class="alarm">${h}</div>`})}<footer>счётчик посещений, кВт·раз: <b>${num(v)}</b></footer></div>`));
// 31. казённый портал из рамок
D('ozersk-adm.gov',(s,pg,path,v)=>wrap('Lad',`<header>${H(s,70)}<div><h1>АДМИНИСТРАЦИЯ ОЗЁРСКА-НОВОГО</h1><small>${s.tag}</small></div></header><div class="frames"><nav><div>РАЗДЕЛЫ</div>${menu(s,path,'fr')}${kat('Каталог сайтов','fr')}</nav><main><div class="crumbs">Главная » ${pg.title}</div><h2>${pg.title}</h2>${by(pg.html,{l:l=>`<div class="depts">${each(l,t=>`<div>📁 ${t}</div>`)}</div>`})}</main></div><footer>Посетитель № ${v}</footer>`));
// 32. коридор с дверями кабинетов
D('poliklinika2',(s,pg,path,v)=>wrap('Lpl',`<header><span class="cross">✚</span><div><h1>Поликлиника № 2</h1><small>${s.tag}</small></div>${H(s,72)}</header><nav>${menu(s,path,'plate96')}${kat('Выход','plate96')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="doors">${each(head(r),c=>`<div class="door99"><span class="dn">${r[0][1]} ${c[1]}</span><h3>${c[0]}</h3><p>${c[2]}</p><i></i></div>`)}</div>`,p:h=>`<div class="leaflet">${h}</div>`})}<footer>талонов в очереди: ${v}</footer>`));
// 33. институт: колонны и грамота
D('uni-belogorie.edu',(s,pg,path,v)=>wrap('Lun',`<div class="pediment"></div><div class="frieze"><h1>БЕЛОГОРСКИЙ ИНСТИТУТ</h1></div><div class="temple"><i></i><div class="diploma">${H(s,80)}<small>${s.tag}</small><nav>${menu(s,path,'rom',(t,i)=>`${['I','II','III','IV'][i]}. ${t}`)}${kat('Каталог','rom')}</nav><h2>${pg.title}</h2>${by(pg.html,{l:l=>`<div class="faculty">${each(l,t=>`<div>${t}<small>факультет</small></div>`)}</div>`})}<footer>абитуриентов заходило: ${v}</footer></div><i></i></div>`));
// 34. грядки и деревянные таблички
D('dacha-gryadka',(s,pg,path,v,w)=>wrap('Ldc',`<div class="sky99">${H(s,120,'sway9')}<h1>ГРЯДКА</h1><small>${s.tag}</small></div><nav>${menu(s,path,'peg')}${kat('за забор','peg')}</nav><div class="soil">${who(w,'sign99')}<h2>${pg.title}</h2>${by(pg.html,{t:r=>each(head(r),c=>`<div class="bed"><b>${c[0]}</b><span>${c[1]}</span></div>`),l:l=>each(l,t=>`<div class="bed"><b>🌱</b><span>${t}</span></div>`),p:h=>`<div class="crate">${h}</div>`})}${home(w,path)}${wf(s,w,v,'соседей заглянуло')}</div>`));
// 35. под водой: всё висит на лесках
D('rybak-udachi',(s,pg,path,v,w)=>wrap('Lrb',`<div class="surface">${H(s,120,'bob9')}<h1>РЫБАЦКАЯ УДАЧА</h1><small>${s.tag}</small></div><nav>${menu(s,path,'float99')}${kat('на берег','float99')}</nav>${who(w,'bubble')}<h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="lines">${each(head(r),(c,i)=>`<div class="hook h${i%3}"><div class="catch"><h3>${c[0]}</h3><p>${r[0][1]}: <b>${c[1]}</b></p><p>${r[0][2]}: <b>${c[2]}</b></p></div></div>`)}</div>`,p:h=>`<div class="ice">${h}</div>`})}${home(w,path)}${wf(s,w,v,'поклёвок')}`));
// 36. лесная тропа с указателями
D('gribnik',(s,pg,path,v,w)=>wrap('Lgr',`<div class="signpost"><h1>Тропа грибника</h1>${menu(s,path,'arrow')}${kat('← из леса','arrow')}<i></i></div><div class="trail">${H(s,110)}<small>${s.tag}</small>${who(w,'stump')}${home(w,path)}<h2>${pg.title}</h2>${by(pg.html,{l:l=>each(l,(t,i)=>`<div class="stopn s${i%2}"><span>🍄</span>${t}</div>`),p:h=>`<div class="bark">${h}</div>`})}${wf(s,w,v,'грибников прошло')}</div>`));
// 37. форум на старом движке
D('garazh-forum',(s,pg,path,v,w)=>wrap('Lgf',`<div class="bar99">${H(s,90)}<div><h1>ГАРАЖ :: форум автолюбителей</h1><small>${s.tag}</small></div></div><nav>Разделы: ${menu(s,path,'fl',t=>`[${t}]`)} ${kat('[Каталог]','fl')}</nav><div class="crumb99">Список форумов » <b>${pg.title}</b></div>${by(pg.html.replace(/^<div class="forum">(.*)<\/div>$/s,'$1'),{t:r=>`<table><tr><th></th><th>${r[0][0]}</th><th>${r[0][1]}</th></tr>${each(head(r),c=>`<tr><td>📁</td><td><b>${c[0]}</b>${c.slice(2).map(x=>' '+x).join('')}</td><td>${c[1]}</td></tr>`)}</table>`,l:l=>`<table><tr><th>№</th><th>Правило</th></tr>${each(l,(t,i)=>`<tr><td>${i+1}</td><td>${t}</td></tr>`)}</table>`})}<div class="post99"><div class="ava">${w.status[1]}<br><b>${w.status[0]}</b></div><div>${w.status[2]}</div></div>${home(w,path)}${wf(s,w,v,'всего заходов на форум')}`));
// 38. табло стадиона
D('sport-azart',(s,pg,path,v)=>wrap('Lsp',`<div class="lights"><i></i><h1>ДВОРОВЫЙ СПОРТ</h1><i></i></div><small>${s.tag}</small><nav>${menu(s,path,'puck')}${kat('Каталог','puck')}</nav><div class="led"><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="rowh">${each(r[0],c=>`<span>${c}</span>`)}</div>${each(head(r),(c,i)=>`<div class="rowl${i<3?' top'+i:''}">${each(c,x=>`<span>${x}</span>`)}</div>`)}`})}</div><div class="field">${H(s,90,'bob9')}</div><footer>болельщиков на трибуне: ${v}</footer>`));
// 39. театральная программка
D('teatr-na-yuzhnoy',(s,pg,path,v)=>wrap('Lth',`<div class="program"><div class="orn">❦</div><h1>Театр<br>на Южной</h1><i>${s.tag}</i><nav>${menu(s,path,'act',(t,i)=>`<small>Действие ${i+1}</small>${t}`)}${kat('<small>Антракт</small>Каталог','act')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>each(head(r),c=>`<div class="play99"><small>${r[0][1]}: ${c[1]}</small><h3>${c[0]}</h3></div>`)})}<div class="orn">❦</div><footer>зрителей в зале: ${v}</footer></div>`));
// 40. вольеры зоосада
D('zoopark-ozersk',(s,pg,path,v)=>wrap('Lzo',`<div class="gate99">${H(s,100)}<h1>ОЗЁРСКИЙ ЗООСАД</h1><small>${s.tag}</small></div><nav>${menu(s,path,'paw',t=>`🐾 ${t}`)}${kat('К выходу','paw')}</nav><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="pens">${each(head(r),c=>`<div class="pen"><div class="bars98"></div><h3>${c[0]}</h3><p><small>${r[0][1]}</small><br>${c[1]}</p></div>`)}</div>`,l:l=>`<div class="boards">${each(l,t=>`<div>${t}</div>`)}</div>`})}<footer>посетителей у вольеров: ${v}</footer>`));
// 41. звёздный круг
D('goroskop-zvezda',(s,pg,path,v,w)=>wrap('Lzv',`<div class="orb">${H(s,110,'bob9')}</div><h1>ГОРОСКОП «ЗВЕЗДА»</h1><small>${s.tag}</small><nav>${menu(s,path,'moon',t=>`☾ ${t}`)}${kat('☾ Каталог','moon')}</nav>${who(w,'seer')}<h2>✧ ${pg.title} ✧</h2>${by(pg.html,{t:r=>`<div class="zod">${each(head(r),(c,i)=>`<div class="sg"><span>${String.fromCharCode(9800+i%12)}︎</span><h3>${c[0]}</h3><p>${c[1]}</p></div>`)}</div>`})}${home(w,path)}${wf(s,w,v,'душ вопрошало звёзды')}`));
// 42. первая страничка Васи: всё в таблицу с рамками
D('vasin-dom.narod',(s,pg,path,v,w)=>wrap('Lva',`<div class="constr">🚧 САЙТ В РАЗРАБОТКЕ 🚧</div><table class="vt"><tr><td colspan="2" class="vh"><h1>!!! Домашняя страничка Васи !!!</h1>${s.tag}</td></tr><tr><td class="vn"><b>МЕНЮ:</b><nav>${menu(s,path,'vl',t=>`&gt;&gt; ${t}`)}${kat('&gt;&gt; Каталог','vl')}</nav>${H(s,90,'sway9')}${who(w,'vwho')}<div class="vc">${num(v)}</div></td><td class="vb"><h2>${pg.title}</h2>${home(w,path)}${pg.html}</td></tr><tr><td colspan="2">${wf(s,w,v,'посетителей')}</td></tr></table>`));
// 43. вязаное полотно и клубки
D('sveta-vyazhet.narod',(s,pg,path,v,w)=>wrap('Lsv',`<div class="knit">${H(s,100,'sway9')}<h1>Света вяжет</h1><small>${s.tag}</small></div><nav>${menu(s,path,'yarn')}${kat('другие нитки','yarn')}</nav>${who(w,'stitch')}<div class="canvas99">${home(w,path)}<h2>${pg.title}</h2>${by(pg.html,{l:l=>each(l,t=>`<div class="loop">🧶 ${t}</div>`)})}</div>${wf(s,w,v,'петель провязано')}`));
// 44. печатная плата
D('radiolyubitel.narod',(s,pg,path,v,w)=>wrap('Lrl',`<div class="pcb"><header><div class="chip"><h1>ПАЯЛЬНИК</h1><small>${s.tag}</small></div>${H(s,96)}</header><nav>${menu(s,path,'ohm',(t,i)=>`<small>R${i+1}</small>${t}`)}${kat('<small>GND</small>Каталог','ohm')}</nav>${who(w,'cap99')}<h2>${pg.title}</h2>${by(pg.html,{l:l=>each(l,(t,i)=>`<div class="trace"><i>IC${i+1}</i><span>${t}</span></div>`),p:h=>`<div class="warn99">⚠ ${h}</div>`})}${home(w,path)}${wf(s,w,v,'пробок выбито')}</div>`));
// 45. окно дозвона
D('provider-link',(s,pg,path,v)=>wrap('Lpr',`<div class="modem"><h1>ЛИНК</h1><div class="leds">${each(['PWR','DCD','TX','RX'],(t,i)=>`<span><i class="l${i}"></i>${t}</span>`)}</div>${H(s,86)}</div><small>${s.tag}</small><nav>${menu(s,path,'dial')}${kat('Каталог','dial')}</nav><div class="screen99"><h2>${pg.title}</h2>${by(pg.html,{t:r=>`<div class="plans">${each(head(r),c=>`<div><h3>${c[0]}</h3><b>${c[1]}</b><small>${r[0][1]}</small></div>`)}</div>`,n:n=>each(n,x=>`<div class="qa"><h3>&gt; ${x.t}</h3><p>${x.p}</p></div>`)})}</div><footer>соединение № ${num(v)} · 56 кбит/с</footer>`));
// 46. серверная стойка
D('hosting-cherdak',(s,pg,path,v)=>wrap('Lho',`<div class="rack"><div class="unit u0">${H(s,70)}<div><h1>ХОСТИНГ «ЧЕРДАК»</h1><small>${s.tag}</small></div></div><nav class="unit">${menu(s,path,'port')}${kat('Каталог','port')}</nav><div class="unit label99"><h2>${pg.title}</h2></div>${by(pg.html,{t:r=>each(head(r),c=>`<div class="unit srv"><i></i><i></i><b>${c[0]}</b><span>${c[1]}</span><u></u></div>`),p:h=>`<div class="unit blank">${h}</div>`})}<div class="unit">запросов к стойке: ${v}</div></div>`));
// 47. почтовая программа
D('pochta-golub',(s,pg,path,v)=>wrap('Lpg',`<div class="mailwin"><div class="mt">${H(s,44)}<h1>Почта «Голубь»</h1><small>${s.tag}</small></div><div class="mcols"><nav><b>Папки</b>${menu(s,path,'fold',t=>`✉ ${t}`)}${kat('🗀 Каталог','fold')}</nav><div class="mread"><div class="mhead">Тема: <b>${pg.title}</b></div>${by(pg.html,{l:l=>each(l,t=>`<div class="mrow">✉ ${t}</div>`)})}</div></div><div class="mstat">Писем в пути: ${v}</div></div>`));
// 48. закрытый чат: табличка на цепочке
D('chat-pravila',(s,pg,path,v)=>wrap('Lch',`<div class="chains"></div><div class="closed"><h1>ЧАТ «ЛАВОЧКА»</h1><big>ЗАКРЫТО</big><small>${s.tag}</small></div><div class="letter"><h2>${pg.title}</h2>${pg.html}</div>${H(s,170,'bench')}<nav>${menu(s,path,'quiet')} · ${kat('уйти в каталог','quiet')}</nav><footer>заглядывали: ${v}</footer>`));
// 49. забор с расклеенными объявлениями
D('obyavleniya-bazar',(s,pg,path,v)=>wrap('Lob',`<div class="bighead">${H(s,80)}<div><h1>БАЗАР ОБЪЯВЛЕНИЙ</h1><small>${s.tag}</small></div></div><nav>${menu(s,path,'spray')}${kat('Каталог','spray')}</nav><h2>${pg.title}</h2><div class="fence">${by(pg.html,{t:r=>each(head(r),c=>`<div class="ad"><h3>${c[0]}</h3>${each(c.slice(1),(x,i)=>`<p>${r[0][i+1]}: <b>${x}</b></p>`)}</div>`),l:l=>each(l,t=>`<div class="ad">${t}</div>`)})}</div><footer>прохожих остановилось: ${v}</footer>`));
// 50. ксерокопийная афиша фанатов
D('fanklub-skvoznyak.narod',(s,pg,path,v,w)=>wrap('Lfk',`<h1><span>СКВОЗ</span><span>НЯК</span></h1><div class="cut">ФАН-КЛУБ · ${s.tag}</div>${H(s,130,'sway9')}<nav>${menu(s,path,'rip')}${kat('свалить в каталог','rip')}</nav>${who(w,'scrawl')}${home(w,path)}<h2>${pg.title}</h2>${by(pg.html,{l:l=>each(l,(t,i)=>`<div class="gig g${i%2}">★ ${t}</div>`),p:h=>`<div class="xerox">${h}</div>`})}${wf(s,w,v,'фанатов отметилось')}`));
// 51. витрина лавки курсоров
D('lavka-kursorov.narod',(s,pg,path,v,w)=>wrap('Llk',`<div class="awn"></div><h1>ЛАВКА КУРСОРОВ</h1><small>${s.tag}</small><div class="glass"><nav>${menu(s,path,'shelfbtn')}${kat('Каталог','shelfbtn')}</nav><h2>${pg.title}</h2>${home(w,path)}${pg.html}${H(s,70,'bob9')}</div>${who(w,'seller99')}${wf(s,w,v,'покупателей без денег')}`));
})();
