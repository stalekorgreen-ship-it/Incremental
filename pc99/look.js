// оформление сайтов: пиксельные картинки из art99.js поверх старых шаблонов
(function(){
const A=window.ART99,K=window.WILDKIT,go=(u,t)=>`<a href="#" data-go="${u}">${t}</a>`;
const key=h=>h.split('.')[0];
const img=(n,w,cls,st)=>`<img class="p9 ${cls||''}" src="${A[n]}" width="${w}" alt="" style="${st||''}">`;
// «фотографии» людей и предметов на личных страницах
const FACE={'Вася':'p-vasya','Светлана':'p-sveta','Эдуард':'p-eduard','Эдуард после':'p-eduard2','Зинаида':'p-zina','Макар':'p-makar','Гена':'p-gena','Денис':'p-denis','Эльвира':'p-elvira','Анатолий':'p-anatoly','Лёха Бас':'p-lyoha','Марина':'p-marina','Стас':'p-stas','Ксения':'p-ksenia','Антонина':'p-antonina'};
const THING={cat:'x-vcat1',car:'garazh-forum',fish:'rybak-udachi',floppy:'floppy',flower:'x-flower',mush:'x-shroom',pizza:'pizza-ugolok',skull:'x-toad',star:'x-star',heart:'x-heart',ufo:'ufo-ozersk',bolt:'t-bolt',note:'muz-lavka'};
const fig=(h,c)=>`<figure>${h}<figcaption>${c}</figcaption></figure>`;
const photos0=K.photos,pics0=K.pics;
K.photos=(...l)=>`<div class="photos">${l.map(([n,cap,sz,k])=>FACE[n]&&A[FACE[n]]?fig(img(FACE[n],Math.round((sz||110)*1.5),'face9'),cap):photos0([n,cap,sz,k]).slice(20,-6)).join('')}</div>`;
let cats=0;
K.pics=(...l)=>`<div class="photos">${l.map(([n,cap,sz])=>{let k=THING[n];if(n==='cat')k='x-vcat'+(cats++%3+1);return A[k]?fig(`<div class="frame">${img(k,Math.min(170,(sz||8)*15))}</div>`,cap):pics0([n,cap,sz]).slice(20,-6);}).join('')}</div>`;
// наклейки по краям страницы
const stick=(n,sz)=>A[THING[n]]?img(THING[n],Math.max(44,sz*14)):K.art(n,sz);
const TAPE={official:'ОФИЦИАЛЬНЫЙ САЙТ',paper:'СВЕЖИЙ НОМЕР',portal:'ОБНОВЛЕНО СЕГОДНЯ',shop:'ЗАХОДИТЕ! ОТКРЫТО!',home:'ДОБРО ПОЖАЛОВАТЬ!',dark:'НЕ ЗАКРЫВАЙТЕ ОКНО',forum:'ЧИТАЙТЕ ПРАВИЛА',personal:'СПАСИБО, ЧТО ЗАШЛИ'};
const seed=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const EXTRA=['x-star','floppy','x-star','x-heart'];
window.LOOK={img,stick,
 title:s=>`<img class="p9 logo9" src="${A['logo-'+key(s.host)]}" alt="${s.name}">`,
 hero:(h,w,cls)=>img(key(h),w,cls),
 site(s,pg,path,visits){const k=key(s.host),n=seed(s.host);
  const nav=s.pages.filter(p=>!p.hidden).map(p=>`<a href="#" class="b9${p.id===path?' on':''}" data-go="${s.host+(p.id?'/'+p.id:'')}">${p.title}</a>`).join('')+go('katalog.net','Каталог');
  const bg=A['bg-'+k];
  return `<div class="s9 s9-${s.look} v${n%3}" style="--h:${s.col[0]};--a:${s.col[1]};background-image:url(${bg})"><div class="c9">
  <div class="head9">${img(k,118,'bob9 l9')}<div><h1>${LOOK.title(s)}</h1><div class="tag9">${s.tag}</div></div>${img(k,92,'sway9 r9')}</div>
  <div class="tape9"><span>★ ${TAPE[s.look]||TAPE.home} ★ ${s.tag} ★ ${TAPE[s.look]||TAPE.home} ★</span></div>
  <nav>${nav}</nav>
  <div class="cols9"><aside>${img(k,128,'frame9')}${img(EXTRA[n%4],56,'spin9')}<div class="cnt9">вы посетитель<b>${String(visits).padStart(6,'0')}</b></div>${img(EXTRA[(n>>>3)%4],46,'bob9')}</aside><main><h2>${pg.title}</h2>${pg.html}</main></div>
  <footer>© 1999 ${s.name} · лучше смотреть в 800×600</footer></div></div>`;}};
})();
