// ——— страницы сайта: лента, люди, переписки, загрузки
const URLS={work:'lentaos://constructor',feed:'https://lenta.net/feed',people:'https://admin.lenta.net/people',chat:'https://admin.lenta.net/messages',files:'lentaos://downloads'};
const OLDT=['коты','спорт','еда','игры','дача','машины','музыка','путешествия','техника','учёба','дети','новости'];
const pic=x=>sceneSVG(x.id,OLDT.indexOf(C.TN[x.topic]))||photoSVG(x.id);
let sview=null,fileOpen=null;
function addFile(f){if(HOST){const n=HOST.download(f.kind==='photo'?{...f,svg:pic(C.world(S.seed).posts[f.id-101])}:f);toast('Скачано на компьютер',n+' — папка «Загрузки»');return;}
 files.push({...f,id:'f'+Date.now()+Math.random().toString(36).slice(2,6)});if(files.length>30)files.shift();$('#fcount').textContent=files.length;toast('Скачано',f.name);save();}
const followers=a=>12+Math.floor(Math.pow(C.hash(S.seed,'fol',a),3)*9000);
function postHTML(x,extra){const W=C.world(S.seed),a=W.authors[x.author];return`<article><div class="who">${avatar(x.author)}<div><button class="link" data-author="${x.author}">${esc(a.name)}</button><small>пост ${x.id} · ${x.len} с${x.long?' · длинный':''}</small></div></div><p>${esc(x.words.join(' '))}</p><div class="ph">${pic(x)}<button data-photo="${x.id}">⬇ фото</button></div>${extra||''}</article>`;}
function feedHTML(){const W=C.world(S.seed),sel_=`<button data-step="-1">◀</button><select data-person>${W.people.map((p,i)=>`<option value="${i}"${i===who?' selected':''}>${p.name}</option>`).join('')}</select><button data-step="1">▶</button>`;
 if(sview!==null){const a=W.authors[sview],list=W.posts.slice(0,C.HIST+C.FRESH).filter(x=>x.author===sview).slice(-8).reverse();return`<div class="sh"><button data-home>← Лента</button><b>${esc(a.name)}</b><span>${followers(sview)} подписчиков</span></div><div class="feed">${list.map(x=>postHTML(x)).join('')}</div>`;}
 const P=W.people[who];let l=M.fs.feeds[P.name]||[];const own=l.length;if(!own)l=Array.from({length:5},(_,i)=>({post:W.posts[C.HIST+((C.hash(who,i,'r')*C.FRESH)|0)]}));
 return`<div class="sh"><b>Лента</b>${sel_}<span>${own?'эти посты выбрала твоя схема':'схема пока ничего не даёт: посты случайные'}</span></div><div class="feed">${l.map(r=>postHTML(r.post,`<footer>${r.score!==undefined?'твоя оценка: '+cell(r.score)+' · ':''}досмотр: ${pc(C.trueShare(P,r.post,P.taste))}</footer>`)).join('')}</div>`;}
function personTables(){const src=C.sourcesOf(S),P=C.world(S.seed).people[who];return{cols:src['Просмотры'].cols,rows:src['Просмотры'].rows.filter(r=>r[0]===P.name)};}
function peopleHTML(){const W=C.world(S.seed),P=W.people[who],t=S.goal>=7?personTables():null;
 return`<div class="sh"><b>Люди</b><span>что сеть записала о каждом</span></div><div class="cols"><nav>${W.people.map((p,i)=>`<button data-pick="${i}" class="${i===who?'on':''}">${p.name}</button>`).join('')}</nav><section><h2>${P.name}</h2>${t?`<p><button data-dl="one">⬇ Скачать таблицу о нём</button> <button data-open="feed">Его лента</button></p>${gridHTML(t,80)}`:'<p class="dim">Записи о просмотрах появятся во второй главе.</p><p><button data-dl="one">⬇ Скачать таблицу о нём</button> <button data-open="feed">Его лента</button></p>'}</section></div>`;}
const chatHTML=()=>'<div class="sh"><b>Личные переписки</b><span>тексты появятся позже: здесь только окно</span></div><div class="feed"><p class="dim">Пусто.</p></div>';
function filesHTML(){const f=files.find(x=>x.id===fileOpen)||files[files.length-1];return`<div class="sh"><b>Загрузки</b></div><div class="cols"><nav>${files.map(x=>`<button data-file="${x.id}" class="${f&&x.id===f.id?'on':''}">${esc(x.name)}</button>`).join('')||'<p class="dim">Пусто.</p>'}</nav><section>${f?(f.kind==='photo'?pic(C.world(S.seed).posts[f.id0-101]||C.world(S.seed).posts[0]):gridHTML(f,200)):''}</section></div>`;}
function renderPage(){const box=$('#page');box.classList.toggle('on',page!=='work');$('#app').style.display=page==='work'?'':'none';if(page!=='work')box.innerHTML=page==='feed'?feedHTML():page==='people'?peopleHTML():page==='chat'?chatHTML():filesHTML();}
function go(p){if(!URLS[p])p='work';if(HOST)HOST.page(p);sview=null;page=p;$('#addr').textContent=URLS[p];$$('#br [data-page]').forEach(b=>b.classList.toggle('on',b.dataset.page===p));renderPage();if(p==='work'&&M){render();panel();}}
$('#br').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page);});
$('#page').addEventListener('change',e=>{if(e.target.dataset.person!==undefined){who=+e.target.value;renderPage();}});
$('#page').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.author!==undefined){sview=+d.author;renderPage();}else if('home'in d){sview=null;renderPage();}else if(d.step){who=(who+ +d.step+C.NP)%C.NP;sview=null;renderPage();}
 else if(d.pick){who=+d.pick;renderPage();}else if(d.open)go(d.open);else if(d.photo){addFile({kind:'photo',name:'фото_'+d.photo+'.png',id:+d.photo,id0:+d.photo});}
 else if(d.dl==='one'){const P=C.world(S.seed).people[who],t=S.goal>=7?personTables():{cols:['человек'],rows:[[P.name]]};addFile({kind:'table',name:'человек_'+(who+1)+'.csv',cols:t.cols,rows:t.rows});}
 else if(d.file){fileOpen=d.file;renderPage();}});
