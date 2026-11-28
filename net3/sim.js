// соцсеть: люди, посты, 30 источников данных и личная лента на каждого
(function(root){
const Tp=typeof require!=='undefined'?require('../ed/topics.js'):root.Topics;if(typeof require!=='undefined')require('./topics2.js');
const TOPICS=['коты','спорт','еда','игры','дача','машины','музыка','путешествия','техника','учёба','дети','новости'];
const CITIES=['Озёрск-Новый','Белогорье','Ясный Порт','Каменный Брод'];
const DISTRICTS=['Заречный','Центр','Сортировка','Южный'];
const SLOTS=['утро','день','вечер','ночь'],DAY=300,NP=48,NA=90,NC=36,GOAL=5e6;
const OWN={'коты':0,'спорт':1,'еда':2,'игры':3,'дача':4,'машины':5};
const TITLES={'музыка':['Разобрал припев по нотам','Нашёл пластинку отца','Репетиция в гараже пошла не по плану','Пять песен под дождь','Почему этот бит застревает в голове'],'путешествия':['Три дня с одним рюкзаком','Автобус увёз не туда, и это к лучшему','Сколько стоит неделя у моря','Вокзальная еда: честный отзыв','Маршрут на выходные без машины'],'техника':['Оживил ноутбук за вечер','Телефон за копейки: месяц спустя','Что внутри старого роутера','Собрал полку-сервер на балконе','Какой кабель вас обманывает'],'учёба':['Как я перестал зубрить','Конспект на одной странице','Задача, на которой сыпется вся группа','Выучил двадцать слов в автобусе','Сессия: план на три дня'],'дети':['Сын объяснил мне дроби','Поделка из того, что было дома','Первый день в новой секции','Как уложить спать без войны','Дочка открыла лавку на кухне'],'новости':['Что поменяется с понедельника','Перекрывают мост на две недели','В библиотеке открыли ночной зал','Подорожал проезд: разбор','Итоги недели за две минуты']};
const TAILS=['.','. Подробности внутри.','. Не ожидал такого.','. Часть первая.','. Спрашивайте, отвечу.','. Получилось не с первого раза.','. Делюсь, пока свежо.','. Что скажете?','. Долго собирался написать.','. Вторая попытка.','. Было интересно.'];
const LOCAL=['Что открылось рядом','Объявление для соседей','Сегодня во дворе','Кто видел это утром','Отдают даром, самовывоз'];
// ——— 30 источников: что узнаём и с чем в посте это сравнивать
const GROUPS=['Место и техника','Время и ритм','Поведение','Люди и сообщества','Намерения и следы'];
const Q=(id,g,name,type,w,help)=>({id,g,name,type,w,help});
const SOURCES=[
 Q('ip',0,'IP-адрес','city',1,'Город человека. У тех, кто ходит через прокси, ошибается.'),
 Q('geo',0,'Геометки','district',2,'Районы, где человек часто бывает.'),
 Q('home',0,'Дом и работа','district',2,'Где человек прямо сейчас: ночью и вечером дома, днём на работе.'),
 Q('trip',0,'Поездки','city',1,'Город, куда человек сейчас уехал. Если никуда, пусто.'),
 Q('device',0,'Устройство','len',1,'Какая длина удобна: с телефона длинное читают плохо.'),
 Q('net',0,'Связь','fmt',1,'Что открывается без тормозов: при слабой связи видео раздражает.'),
 Q('clock',1,'Время суток','len',1,'Утром и днём лучше короткое, вечером и ночью длинное.'),
 Q('week',1,'День недели','topic',1,'Чем человек занимается именно сегодня, в будни или в выходной.'),
 Q('visit',1,'Длина визита','len',1,'Сколько времени у человека обычно есть.'),
 Q('breaks',1,'Перерывы','age',1,'Что человек пропустил. Есть только у тех, кто давно не заходил: у остальных пусто.'),
 Q('season',1,'Сезон и погода','season',1,'Что сейчас по сезону.'),
 Q('watch',2,'Досмотр','topic',2,'Темы, которые человек дочитывает.'),
 Q('skip',2,'Пролистывания','topic',2,'Темы, которые человек пролистывает. Это надо УБИРАТЬ.'),
 Q('rewatch',2,'Повторные просмотры','topic',2,'Самая любимая тема.'),
 Q('likes',2,'Лайки','topic',1,'Темы, которым ставит лайки.'),
 Q('comments',2,'Комментарии','author',2,'Авторы, у которых человек спорит и отвечает.'),
 Q('reposts',2,'Репосты','topic',1,'Тема, которой человек делится с другими.'),
 Q('saves',2,'Сохранённое','author',1,'Авторы, чьи посты откладывает на потом.'),
 Q('nope',2,'Не интересно','topic',1,'Темы, на которые жалуется. Это надо УБИРАТЬ.'),
 Q('history',2,'История показов','post',3,'Уже увиденные посты. Их надо УБИРАТЬ.'),
 Q('subs',3,'Подписки','author',1,'Авторы, на которых подписан.'),
 Q('blocks',3,'Блокировки','author',1,'Авторы, которых заблокировал. Их надо УБИРАТЬ.'),
 Q('comm',3,'Сообщества','comm',1,'Группы, где состоит.'),
 Q('friends',3,'Друзья','post',2,'Посты, которые понравились друзьям.'),
 Q('close',3,'Близость','author',2,'Авторы, с которыми общается чаще всего.'),
 Q('similar',3,'Похожие люди','post',3,'Посты, понравившиеся людям с таким же вкусом.'),
 Q('search',4,'Поиск','topic',1,'Что человек ищет именно сегодня.'),
 Q('cookies',4,'Куки сайтов','topic',2,'Новое увлечение снаружи: в сети он его ещё не показал.'),
 Q('ads',4,'Реклама и переходы','topic',1,'На что нажимал в рекламе.'),
 Q('profile',4,'Анкета и покупки','topic',1,'К чему недавно что-то купил.')];
const SRC=Object.fromEntries(SOURCES.map(s=>[s.id,s]));
const TYPE={city:'город',district:'район',topic:'тема',author:'автор',comm:'сообщество',post:'пост',len:'длина',fmt:'формат',age:'свежесть',season:'сезон'};
const FIELD={city:p=>p.city,district:p=>p.district===null||p.city===null?null:p.city*10+p.district,topic:p=>p.topic,author:p=>p.author,comm:p=>p.comm,post:p=>p.id,len:p=>p.long?'длинное':'короткое',fmt:p=>p.fmt,season:p=>p.season,age:(p,S)=>S.t-p.born>OLD?'старое':'свежее'};
function hash(...a){let h=2166136261;for(const x of a){h^=x+0x9e3779b9;h=Math.imul(h,16777619);h^=h>>>13;}h=Math.imul(h^(h>>>16),2246822507);return((h^(h>>>15))>>>0)/4294967296;}
function rand(S){S.rs=(Math.imul(S.rs,1664525)+1013904223)>>>0;return S.rs/4294967296;}
const ri=(S,n)=>rand(S)*n|0;
function pickN(S,n,k,not){const r=[];let guard=0;while(r.length<k&&guard++<500){const x=ri(S,n);if(!r.includes(x)&&!(not&&not.includes(x)))r.push(x);}return r;}
function mkPeople(S){const authors=[];for(let i=0;i<NA;i++)authors.push({id:i,topic:ri(S,12),city:i%2===0?(i>>1)%4:null});S.authors=authors;S.comms=[];for(let i=0;i<NC;i++)S.comms.push({id:i,topic:i%12,city:i%4===0?ri(S,4):null});
 S.people=[];for(let i=0;i<NP;i++){const t=pickN(S,12,10),p={i,no:10000+ri(S,89999),city:ri(S,4),hd:ri(S,4),wd:ri(S,4),liked:t.slice(0,3),hot:t[3],shop:t[4],share:t[5],adt:t[6],hate:t.slice(7,9),bore:t[9],phone:rand(S)<.65,slow:rand(S)<.35,short:rand(S)<.5,proxy:rand(S)<.12,seen:[],sec:50,why:null};
  const near=authors.filter(a=>p.liked.includes(a.topic)||a.topic===p.hot).map(a=>a.id);const take=k=>{const r=[];for(let j=0;j<k*6&&r.length<k;j++){const a=near[ri(S,near.length)];if(a!==undefined&&!r.includes(a))r.push(a);}return r;};
  p.subs=take(7);p.close=take(3);p.saves=take(3);p.talk=take(3);p.blocked=pickN(S,NA,6,[...p.subs,...p.close,...p.saves,...p.talk]);p.comms=[];for(const tp of [...p.liked,p.hot])if(p.comms.length<4){const c=S.comms.filter(c=>c.topic===tp);p.comms.push(c[ri(S,c.length)].id);}S.people.push(p);}
 for(const p of S.people){p.friends=pickN(S,NP,6,[p.i]);p.similar=S.people.filter(q=>q.i!==p.i).map(q=>[q.liked.filter(t=>p.liked.includes(t)).length,q.i]).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);}}
// текст пишется своим генератором случайности: слова не влияют на то, как живёт мир. Пол автора постоянный
const LONGK=[.80,.80,.80,.40,.865,.89],SHORTK=[.05,.30,.45,.65,.70,.95];
function writePost(S,name,long,author,local){if(++S.made%900===0)S.bag={};let n=0;const id=S.next,kinds=long?LONGK:SHORTK,kind=kinds[(hash(S.seed,id,5)*kinds.length)|0];
 const r=()=>{n++;if(n===1)return author%2?.1:.9;if(n===2)return kind;return hash(S.seed,id,n,9);};
 let t=name==='новости'?(()=>{const l=TITLES[name];return l[(hash(S.seed,id,1)*l.length)|0]+TAILS[(hash(S.seed,id,2)*TAILS.length)|0];})():Tp.make(name,r,S.bag).text;
 if(local)t=LOCAL[(hash(S.seed,id,3)*LOCAL.length)|0]+'. '+t[0].toUpperCase()+t.slice(1);return t;}
function addPost(S){const a=S.authors[ri(S,NA)],comm=rand(S)<.45?(()=>{const c=S.comms.filter(c=>c.topic===a.topic);return c[ri(S,c.length)].id;})():-1,local=a.city!==null&&rand(S)<.9,topic=rand(S)<.85?a.topic:ri(S,12),name=TOPICS[topic];
 const long=rand(S)<.42,text=writePost(S,name,long,a.id,local&&rand(S)<.5);
 S.posts.push({id:S.next++,topic,author:a.id,comm,city:local?a.city:null,district:local&&rand(S)<.9?ri(S,4):null,long,dur:long?55+ri(S,90):14+ri(S,34),fmt:['текст','фото','видео'][ri(S,3)],season:rand(S)<.24?(rand(S)<.5?'зимнее':'летнее'):null,q:Math.pow(rand(S),1.2),born:S.t,likers:[],sh:0,w:0,text});}
// ——— что на самом деле думает человек
const OLD=110;
const slotOf=S=>(S.t%DAY)/(DAY/4)|0,dayOf=S=>(S.t/DAY)|0,weekend=S=>dayOf(S)%7>=5;
const daily=(S,p,salt,n)=>(hash(S.seed,dayOf(S),p.i,salt)*n)|0;
const need=(S,p)=>[...p.liked,p.hot,p.shop,p.adt][daily(S,p,1,6)];
const today=(S,p)=>weekend(S)?(p.i*5+3)%12:(p.i*7+1)%12;
const travel=(S,p)=>hash(S.seed,dayOf(S),p.i,2)<.18?(p.city+1+daily(S,p,3,3))%4:-1;
const away=(S,p)=>hash(S.seed,dayOf(S),p.i,4)<.25;
const spot=(S,p)=>slotOf(S)===1?p.wd:p.hd;
const wantLong=(S,p)=>!p.phone&&!p.short&&slotOf(S)>=2;
// насколько пост подходит человеку прямо сейчас, и что в нём мешает
function appeal(S,p,x,prev){let a=.12+.24*x.q;const bad=[],tags=[];const plus=(v,tag)=>{a+=v;if(tag)tags.push(tag);},minus=(v,why)=>{a-=v;bad.push([v,why]);};
 const t=x.topic;if(p.liked.includes(t))plus(.23,'watch');if(t===p.liked[0])plus(.09,'rewatch');if(t===p.liked[0]||t===p.liked[1])tags.push('likes');if(t===p.hot)plus(.3,'cookies');if(t===p.shop)plus(.25,'profile');if(t===p.share)plus(.24,'reposts');if(t===p.adt)plus(.24,'ads');if(t===need(S,p))plus(.17,'search');if(t===today(S,p))plus(.14,'week');
 if(p.hate.includes(t))minus(.26,'nope');if(t===p.bore)minus(.2,'skip');
 if(p.subs.includes(x.author))plus(.15,'subs');if(p.close.includes(x.author))plus(.16,'close');if(p.saves.includes(x.author))plus(.11,'saves');if(p.talk.includes(x.author))plus(.12,'comments');if(p.blocked.includes(x.author))minus(.45,'blocks');
 if(x.comm>=0&&p.comms.includes(x.comm))plus(.16,'comm');
 if(x.likers.some(i=>p.friends.includes(i)))plus(.17,'friends');if(x.likers.some(i=>p.similar.includes(i)))plus(.17,'similar');
 const tr=travel(S,p),here=tr>=0?tr:p.city;if(x.city!==null){if(x.city===here)plus(tr>=0?.38:.24,tr>=0?'trip':'ip');if(x.city===here&&x.district!==null){if(x.district===spot(S,p))plus(.22,'home');if(x.district===p.hd||x.district===p.wd)plus(x.district===spot(S,p)?0:.13,'geo');}if(x.city!==here)minus(.24,'ip');}
 if(x.long){if(p.phone)minus(.14,'device');if(slotOf(S)<2)minus(.11,'clock');if(p.short)minus(.11,'visit');}else if(wantLong(S,p))minus(.09,'clock');
 if(p.slow&&x.fmt==='видео')minus(.24,'net');
 if(x.season==='зимнее')plus(.1);if(x.season==='летнее')minus(.2,'season');
 const old=S.t-x.born>OLD;if(x.q>.6)tags.push('hit');if(old){if(away(S,p))plus(.2);else minus(.22,'breaks');}
 if(p.seenSet&&p.seenSet.has(x.id))minus(.55,'history');
 if(prev&&prev.length>1&&prev[0]===t&&prev[1]===t)minus(.2,'mix');
 return{a,bad,tags};}
// ——— что про него знает сеть: зависит от купленного источника и его уровня
const LVMAX=8,cover=L=>L<=0?0:Math.min(.97,.55*Math.pow(1.13,L-1)+.001);
function signal(S,id,p){const L=S.src[id]||0;if(!L)return[];const k=SOURCES.indexOf(SRC[id]);const some=(list)=>list.filter((v,j)=>hash(S.seed,p.i,k,j,77)<cover(L));const one=v=>some([v]);
 switch(id){case'ip':return p.proxy?[(p.city+2)%4]:one(p.city);case'geo':return some([p.city*10+p.hd,p.city*10+p.wd]);case'home':return one(p.city*10+spot(S,p));case'trip':{const t=travel(S,p);return t<0?[]:one(t);}
 case'device':return one(p.phone?'короткое':'любое').flatMap(v=>v==='любое'?['короткое','длинное']:[v]);case'clock':return slotOf(S)<2?['короткое']:wantLong(S,p)?['длинное']:['короткое','длинное'];case'visit':return one(p.short?'короткое':'длинное').flatMap(v=>v==='длинное'?['короткое','длинное']:[v]);
 case'net':return p.slow?['текст','фото']:['текст','фото','видео'];case'week':return one(today(S,p));case'breaks':return away(S,p)?['старое']:[];case'season':return[null,'зимнее'];
 case'watch':return some(p.liked);case'skip':return some([p.bore,...p.hate]);case'rewatch':return one(p.liked[0]);case'likes':return some(p.liked.slice(0,2));case'reposts':return one(p.share);case'nope':return some(p.hate);
 case'comments':return some(p.talk);case'saves':return some(p.saves);case'subs':return some(p.subs);case'blocks':return some(p.blocked);case'close':return some(p.close);case'comm':return some(p.comms);
 case'history':{const c=Math.min(1,.94+.02*L);return p.seen.filter((v,j)=>hash(S.seed,p.i,v,7)<c);}case'friends':case'similar':{const who=id==='friends'?p.friends:p.similar,out=[];for(const x of S.posts)if(x.likers.some(i=>who.includes(i))&&hash(x.id,p.i,k)<cover(L))out.push(x.id);return out;}
 case'search':return one(need(S,p));case'cookies':return one(p.hot);case'ads':return one(p.adt);case'profile':return one(p.shop);}return[];}
// ——— блоки схемы. Она одна, а выполняется отдельно для каждого человека
const B={all:{title:'Все посты',ins:[],outs:[['posts','все посты','posts']]},
 signal:{title:'Что известно о человеке',ins:[],outs:[['v','значения','sig']]},
 match:{title:'Совпадение',ins:[['posts','какие посты','posts'],['sig','с чем сравнить','sig']],outs:[['yes','подходят','posts'],['no','остальные','posts']]},
 lists:{title:'Списки',ins:[['a','первый список','posts'],['b','второй список','posts']],outs:[['out','итог','posts']],p:{mode:'+'}},
 rank:{title:'Оценить и упорядочить',ins:[['posts','какие посты','posts']],outs:[['out','лучшие сверху','posts']],p:{pop:1,fresh:1,mix:1}},
 feed:{title:'Личная лента',ins:[['posts','что показать человеку','posts']],outs:[]}};
const CAPPED=['match','lists','rank'];
const capOf=(n,L)=>Math.round(170*Math.pow(1.13,L===undefined?n.lv||0:L));
const reaches=(G,a,b)=>{const seen=new Set(),st=[a];while(st.length){const x=st.pop();if(x===b)return true;if(seen.has(x))continue;seen.add(x);for(const w of G.wires)if(w[0]===x)st.push(w[2]);}return false;};
const outDef=(G,id,port)=>{const n=G.nodes.find(n=>n.id===id);return n&&B[n.type].outs.find(o=>o[0]===port);};
const SLOT=/^s([1-9]|[12]\d|30)$/;
// входы блока: у «Оценить» всегда есть один свободный
function insOf(G,n){if(n.type!=='rank')return B[n.type].ins;const used=G.wires.filter(w=>w[2]===n.id&&SLOT.test(w[3])).map(w=>+w[3].slice(1)),max=Math.max(0,...used);const r=[...B.rank.ins];for(let i=1;i<=Math.min(30,max+1);i++)r.push(['s'+i,'за что баллы','sig']);return r;}
function fits(G,from,fp,to,tp){const o=outDef(G,from,fp),n=G.nodes.find(n=>n.id===to),i=n&&(n.type==='rank'&&SLOT.test(tp)?[tp,'','sig']:B[n.type].ins.find(i=>i[0]===tp));return!!(o&&i&&o[2]===i[2]);}
function connect(G,from,fp,to,tp){if(from===to||reaches(G,to,from)||!fits(G,from,fp,to,tp))return false;G.wires=G.wires.filter(w=>!(w[2]===to&&w[3]===tp));G.wires.push([from,fp,to,tp]);return true;}
function topo(G){const order=[],seen=new Set(),visit=n=>{if(seen.has(n.id))return;seen.add(n.id);for(const w of G.wires)if(w[2]===n.id){const m=G.nodes.find(x=>x.id===w[0]);if(m)visit(m);}order.push(n);};G.nodes.forEach(visit);return order;}
const weight=(n,slot)=>{const v=n.p['w'+slot.slice(1)];return v===undefined?1:+v;};
function ctxOf(S){return{all:S.posts.slice().reverse(),sig:new Map(),order:null};}
function runFor(S,G,p,ctx){ctx=ctx||ctxOf(S);const R={},order=ctx.order||(ctx.order=topo(G));
 for(const n of order){const I={};for(const w of G.wires)if(w[2]===n.id){const r=R[w[0]];if(r&&r.out[w[1]])I[w[3]]=r.out[w[1]];}
  const o={},r=R[n.id]={in:I,out:o,load:null};
  const take=k=>{const c=I[k];if(!c)return null;const cap=capOf(n);if(!r.load||c.length>r.load.inn)r.load={inn:c.length,cap};return c.length>cap?c.slice(0,cap):c;};
  if(n.type==='all')o.posts=ctx.all;
  else if(n.type==='signal'){const id=n.p.src;if(S.src[id]){o.v={src:id,type:SRC[id].type,values:signal(S,id,p)};}}
  else if(n.type==='match'){const a=take('posts'),s=I.sig;if(a&&s){const set=new Set(s.values),f=FIELD[s.type];o.yes=[];o.no=[];for(const x of a)(set.has(f(x,S))?o.yes:o.no).push(x);}}
  else if(n.type==='lists'){const a=take('a'),b=take('b');if(a){if(!b)o.out=a;else if(n.p.mode==='−'){const h=new Set(b.map(x=>x.id));o.out=a.filter(x=>!h.has(x.id));}else if(n.p.mode==='>'){const h=new Set(a.map(x=>x.id));o.out=a.concat(b.filter(x=>!h.has(x.id)));}else{const h=new Set(),out=[],m=Math.max(a.length,b.length);for(let i=0;i<m;i++)for(const x of [a[i],b[i]])if(x&&!h.has(x.id)){h.add(x.id);out.push(x);}o.out=out;}}}
  else if(n.type==='rank'){const a=take('posts');if(a){const sigs=Object.keys(I).filter(k=>SLOT.test(k)).map(k=>{const s=I[k],w=weight(n,k);return s&&w?{f:FIELD[s.type],set:new Set(s.values),w}:null;}).filter(Boolean);
    const sc=a.map(x=>{let v=0;for(const s of sigs)if(s.set.has(s.f(x,S)))v+=s.w;v+=+n.p.pop*(x.sh>2?x.w/x.sh:.4)*2+ +n.p.fresh*Math.max(0,1-(S.t-x.born)/(OLD*2))*.8;return[v+hash(x.id,p.i)*.01,x];}).sort((a,b)=>b[0]-a[0]);
    let out=sc.map(s=>s[1]);if(+n.p.mix){const rest=out.slice(0,90),res=[];while(rest.length&&res.length<60){let j=0;const l=res.length;if(l>1&&res[l-1].topic===res[l-2].topic){j=rest.findIndex(x=>x.topic!==res[l-1].topic);if(j<0)j=0;}res.push(rest.splice(j,1)[0]);}out=res.concat(rest,out.slice(90));}o.out=out;}}
 }return R;}
// что увидит человек: выход ленты; если схема не дала ничего — случайные посты
function feedFor(S,G,p,ctx){const R=runFor(S,G,p,ctx),f=G.nodes.find(n=>n.type==='feed');let list=f&&R[f.id].in.posts||[];const own=list.length;list=list.slice(0,60);
 if(list.length<12){const have=new Set(list.map(x=>x.id)),n=S.posts.length;for(let i=0;i<40&&list.length<(own?12:30)&&n;i++){const x=S.posts[(hash(S.seed,p.i,S.t,i)*n)|0];if(!have.has(x.id)){have.add(x.id);list=list.concat(x);}}}
 return{R,list,own};}
// один визит: человек листает, пока хватает терпения
const BAR=.64;
function visit(S,p,list,live){p.seenSet=new Set(p.seen);let pat=1,sec=0,k=0;const prev=[],why={},rows=[];for(const x of list){const{a,bad,tags}=appeal(S,p,x,prev);const w=Math.max(.03,Math.min(1,a));sec+=(30+x.dur*.3)*w+3;k++;pat=Math.min(2.2,pat+(w-BAR)*(w<BAR?1.15:.8));prev.unshift(x.topic);prev.length=Math.min(prev.length,2);
  if(live){x.sh++;x.w+=w;if(w>.74&&!x.likers.includes(p.i)){x.likers.push(p.i);if(x.likers.length>12)x.likers.shift();}}
  if(w<BAR){if(bad.length){bad.sort((a,b)=>b[0]-a[0]);why[bad[0][1]]=(why[bad[0][1]]||0)+1;}else why.taste=(why.taste||0)+1;}rows.push({x,w,bad,tags});if(pat<=0)break;}
 if(pat>0)why.empty=(why.empty||0)+3;if(live){for(const r of rows)if(!p.seenSet.has(r.x.id))p.seen.push(r.x.id);if(p.seen.length>90)p.seen.splice(0,p.seen.length-90);}delete p.seenSet;return{sec,k,why,rows};}
// ——— деньги, мощности, прокачка
const owned=S=>Object.keys(S.src).filter(k=>S.src[k]>0).length;
const buyPrice=(S,id)=>Math.ceil(40*Math.pow(1.2,owned(S))*(1+(SRC[id].w-1)*.35));
const lvPrice=(S,id)=>Math.ceil(30*SRC[id].w*Math.pow(1.6,(S.src[id]||1)-1)*Math.pow(1.14,S.ord[id]||0));
function buySource(S,id){const L=S.src[id]||0;if(L>=LVMAX)return false;const c=L?lvPrice(S,id):buyPrice(S,id);if(S.money<c)return false;S.money-=c;S.src[id]=L+1;return true;}
const nodePrice=(G,n)=>{let i=0;for(const m of G.nodes){if(m===n)break;if(m.type===n.type)i++;}return Math.ceil(20*(1+i*.6)*Math.pow(1.32,n.lv||0));};
function upgrade(S,G,id){const n=G.nodes.find(n=>n.id===id);if(!n||!CAPPED.includes(n.type)||(n.lv||0)>=20)return false;const c=nodePrice(G,n);if(S.money<c)return false;S.money-=c;n.lv=(n.lv||0)+1;n.spent=(n.spent||0)+c;return true;}
const PRICE={servers:L=>Math.ceil(60*Math.pow(1.22,L)),sales:L=>Math.ceil(120*Math.pow(1.5,L)),ads:L=>Math.ceil(150*Math.pow(1.5,L)),disk:L=>Math.ceil(80*Math.pow(1.4,L))},MAX={servers:30,sales:16,ads:14,disk:10};
function buy(S,k){if(S.lv[k]>=MAX[k])return false;const c=PRICE[k](S.lv[k]);if(S.money<c)return false;S.money-=c;S.lv[k]++;return true;}
const powerCap=S=>Math.round(8*Math.pow(1.13,S.lv.servers));
const powerLoad=(S,G)=>{const used=new Set(G.nodes.filter(n=>n.type==='signal'&&S.src[n.p.src]&&G.wires.some(w=>w[0]===n.id)).map(n=>n.p.src));return[...used].reduce((a,id)=>a+SRC[id].w,0);};
const stock=S=>Math.round(420*Math.pow(1.13,S.lv.disk));
const ceiling=S=>Math.min(GOAL*1.05,Math.max(2000,2000*Math.pow(Math.max(1,S.sec/60),2)));
const MILES=[[90,80],[180,150],[300,300],[600,700],[1200,2000],[2100,6000],[3600,20000]];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const API_H={travel,away,today,need,spot,wantLong,slotOf,OLD,M:null};
//Q[
// ——— испытания: каждое проверяет саму ленту, а не то, какими блоками она собрана
const NEGS=['history','skip','nope','blocks','ip','geo','device','clock','visit','net','season','breaks'];
const TAGS=['new','hit','watch','rewatch','likes','cookies','profile','reposts','ads','search','week','subs','close','saves','comments','comm','friends','similar','trip','ip','home','geo','!nope','!skip','!blocks','!history','!ip','!device','!clock','!visit','!net','!season','!breaks'];
const pc=v=>(v*100).toFixed(v<.1?1:0).replace('.',',')+'%';
const QUESTS=[];
const chk=(label,ok,k)=>({label,ok:!!ok,k});
const wired=(S,G,id)=>{const f=G.nodes.find(n=>n.type==='feed');return!!f&&G.nodes.some(n=>n.type==='signal'&&n.p.src===id&&reaches(G,n.id,f.id));};
const ownAll=S=>S.people.filter(p=>p.own>=12).length;
const schemeCheck=S=>chk(`твоя схема собирает ленту (хотя бы 12 постов) у ${ownAll(S)} из ${NP} людей, нужно ${NP-8}`,ownAll(S)>=NP-8);
const secCheck=(S,need)=>chk(`люди сидят ${fmt(S.sec)}, нужно ${fmt(need)}`,S.sec>=need,Math.min(1,S.sec/need));
const fmt=s=>s<90?Math.round(s)+' с':s<3600?Math.floor(s/60)+' мин '+Math.floor(s%60)+' с':Math.floor(s/3600)+' ч '+Math.floor(s%3600/60)+' мин';
const wiredAll=(S,G,ids)=>ids.filter(i=>wired(S,G,i)).length;
const used=(S,G,ids,k)=>chk(`из новых источников в ленте участвуют ${wiredAll(S,G,ids)}, нужно хотя бы ${k}`,wiredAll(S,G,ids)>=k);
const band=(label,v,lo,hi)=>chk(`${label}: ${pc(v)}, нужно ${lo===null?'не больше '+pc(hi):hi===null?'не меньше '+pc(lo):'от '+pc(lo)+' до '+pc(hi)}`,(lo===null||v>=lo)&&(hi===null||v<=hi));
const L=n=>TG[n];
QUESTS.push({id:'first',kind:'старт',title:'Первый эфир',goal:'Пусть каждый человек получает ленту из всех постов. Это ещё не рекомендации, а просто эфир.',reward:250,hold:3,checks:(S,G)=>[schemeCheck(S)]});
QUESTS.push({id:'funnel',kind:'пачка',title:'Удержи их',srcs:['history','blocks','nope','watch'],reward:700,hold:8,goal:'Четыре новых источника. На все мощностей может не хватить. Что отсеивать, что поднимать и без чего обойтись, решаешь ты.',checks:(S,G)=>[secCheck(S,420),schemeCheck(S),chk(`мощности: нужно ${powerLoad(S,G)}, есть ${powerCap(S)}`,powerLoad(S,G)<=powerCap(S))]});
const QUOTA=p=>p.top&&p.top.n>=10&&p.top.subs>=3&&p.top.subs<=6&&p.top.comm>=2&&p.top.comm<=5&&p.top.new>=3;
const AWAY=p=>p.top&&(p.top.gone?p.top.here>=5:p.top.here>=2&&p.top.here<=6);
const many=(S,f,label,need)=>{const k=S.people.filter(f).length;return chk(`${label}: ${k} из ${NP}, нужно ${need}`,k>=need,Math.min(1,k/need));};
QUESTS.push({id:'quota',kind:'пачка',title:'Три хозяина',srcs:['subs','comm','search'],reward:1200,hold:12,goal:'Первые десять постов у человека: из подписок от 3 до 6, из его сообществ от 2 до 5, и хотя бы 3 не из подписок и не из сообществ.',checks:(S,G)=>[used(S,G,['subs','comm'],2),many(S,QUOTA,'людей, у кого первые десять такие',23),secCheck(S,600),schemeCheck(S)]});
QUESTS.push({id:'fallback',kind:'пачка',title:'Кто уехал',srcs:['ip','trip'],reward:2000,hold:12,goal:'Кто сегодня в другом городе: в первых десяти хотя бы 5 постов оттуда. Кто дома: из своего города от 2 до 6, не меньше и не больше. У тех, кто никуда не уехал, «Поездки» пустые.',checks:(S,G)=>[used(S,G,['ip','trip'],2),many(S,AWAY,'людей, у кого с городом всё в порядке',31),secCheck(S,600),schemeCheck(S)]});
// восемь пачек с правилами на первые посты: у каждой своя форма схемы, пороги подобраны автотестером
const PACKS=(typeof require!=='undefined'?require('./packs.js'):root.makePacks)(API_H.M,API_H);
const NEED={near:[18,1800],thin:[15,2200],hours:[17,2600],back:[40,3000],circle:[28,3500],mouth:[14,4000],love:[14,4600],trace:[11,5200]};
// у «Вернулся» две группы считаются порознь, иначе постоянные люди закрывают порог сами
const groups=(S)=>{const a=S.people.filter(p=>API_H.away(S,p)),b=S.people.filter(p=>!API_H.away(S,p));const part=(l,label,sh)=>{const k=l.filter(p=>p.pk).length,n=Math.ceil(l.length*sh);return chk(`${label}: ${k} из ${l.length}, нужно ${n}`,k>=n,n?Math.min(1,k/n):1);};return[part(a,'вернувшиеся, кого встретили правильно',.35),part(b,'постоянные, кого не завалили старьём',.6)];};
for(const k of PACKS){const[need,reward]=NEED[k.id];QUESTS.push({id:k.id,kind:'пачка',title:k.title,srcs:k.srcs,level:4,goal:k.goal,reward,hold:12,pred:k.ok,need,
 checks:(S,G)=>[used(S,G,k.srcs,k.id==="mouth"?1:Math.min(2,k.srcs.length)),...(k.id==='back'?groups(S):[many(S,p=>p.pk,k.label,need)]),secCheck(S,90),schemeCheck(S)]});}

function grant(S){const q=QUESTS[S.quest];if(q&&q.srcs)for(const i of q.srcs)if(!S.src[i]){S.ord[i]=Object.keys(S.ord).length;S.src[i]=q.level||2;S.fresh=i;}}
function checkQuest(S,G){const q=QUESTS[S.quest];if(!q)return;const ok=q.checks(S,G).every(c=>c.ok);S.hold=ok?S.hold+1:0;if(S.hold>=q.hold){S.hold=0;S.quest++;S.money+=q.reward;S.justDone=q.id;for(const p of S.people)p.pk=false;grant(S);if(S.quest>=QUESTS.length)S.won=S.t;}}
//Q]
const times=v=>Math.pow(Math.max(1,v/60),.8),daySec=v=>Math.min(14400,v*times(v));
// что лежит в первых десяти постах у человека
function topOf(S,p,list){const t=list.slice(0,10),tr=travel(S,p),here=tr>=0?tr:p.city,sub=x=>p.subs.includes(x.author),com=x=>x.comm>=0&&p.comms.includes(x.comm);return{n:t.length,gone:tr>=0,subs:t.filter(sub).length,comm:t.filter(com).length,new:t.filter(x=>!sub(x)&&!com(x)).length,here:t.filter(x=>x.city===here).length};}
function step(S,G){S.t++;S.spawn+=2.4;while(S.spawn>=1){S.spawn--;addPost(S);}const cap=stock(S);if(S.posts.length>cap)S.posts.splice(0,S.posts.length-cap);
 const cnt={n:0},gone={n:0,k:0},stay={n:0,k:0};const ctx=ctxOf(S),load=powerLoad(S,G),pc=powerCap(S),lag=load<=pc?1:Math.pow(pc/load,1.5);let jam=null;
 for(let j=0;j<6;j++){const p=S.people[S.cursor++%NP],f=feedFor(S,G,p,ctx),v=visit(S,p,f.list,true);for(const r of v.rows){cnt.n++;for(const t of r.tags)cnt[t]=(cnt[t]||0)+1;for(const b of r.bad)cnt['!'+b[1]]=(cnt['!'+b[1]]||0)+1;}{const tr=travel(S,p),g=tr>=0?gone:stay,c=tr>=0?tr:p.city;for(const r of v.rows){g.n++;if(r.x.city===c)g.k++;if(!p.subs.includes(r.x.author)&&!(r.x.comm>=0&&p.comms.includes(r.x.comm)))cnt.new=(cnt.new||0)+1;}}p.sec=v.sec*lag;p.top=topOf(S,p,f.list);{const q=QUESTS[S.quest];p.pk=!!(q&&q.pred&&f.own>=10&&q.pred(S,p,f.list.slice(0,10),f.list));}p.why=v.why;p.k=v.k;p.own=f.own;
  for(const n of G.nodes){const l=f.R[n.id].load;if(l&&l.inn>l.cap&&(!jam||l.cap/l.inn<jam.cap/jam.inn))jam={id:n.id,...l};}}
 const visitLen=S.people.reduce((a,p)=>a+p.sec,0)/NP;S.visit+=(visitLen-S.visit)*.08;const mean=daySec(visitLen);{const lim=Math.max(.6,S.sec*.008);S.sec+=clamp((mean-S.sec)*.08,-lim,lim);}S.best=Math.max(S.best,S.sec);
 const why={};for(const p of S.people)for(const k in p.why||{})why[k]=(why[k]||0)+p.why[k];const tot=Object.values(why).reduce((a,b)=>a+b,0)||1;for(const k of new Set([...Object.keys(why),...Object.keys(S.why)]))S.why[k]=(S.why[k]||0)+(100*(why[k]||0)/tot-(S.why[k]||0))*.12;
 {const n=cnt.n||1;for(const k of TAGS)S.share[k]+=((cnt[k]||0)/n-S.share[k])*.1;}if(gone.n)S.gone+=(gone.k/gone.n-S.gone)*.06;if(stay.n)S.stay+=(stay.k/stay.n-S.stay)*.1;S.jam=jam;S.load=load;S.lag=lag;checkQuest(S,G);
 const room=ceiling(S),rate=room>S.users?.006*Math.pow(1.13,S.lv.ads)*(1-S.users/room):-.003*(1-room/S.users);S.users=clamp(S.users*(1+rate),800,GOAL*1.05);
 const target=(S.users<1e5?S.users:1e5*Math.pow(S.users/1e5,.65))*Math.min(S.sec,3600)*Math.pow(1.13,S.lv.sales)/3500000+2;{const was=S.income||target,lim=was*.01+.05;S.income=was+clamp((target-was)*.15,-lim,lim);}S.money+=S.income;
 while(S.mile<MILES.length&&S.sec>=MILES[S.mile][0]){S.money+=MILES[S.mile][1];S.justMile=S.mile;S.mile++;}
 if(!S.won&&S.users>=GOAL&&S.sec>=3600)S.won=S.t;}
function init(seed){const S={seed,quest:0,hold:0,ord:{},gone:0,stay:0,share:Object.fromEntries(TAGS.map(k=>[k,0])),rs:(seed*2654435761)>>>0,t:0,next:1,made:0,bag:{},posts:[],spawn:0,cursor:0,users:2000,visit:60,money:90,sec:60,best:60,income:2,src:{},lv:{servers:0,sales:0,ads:0,disk:0},why:{},mile:0,won:0,jam:null,load:0,lag:1};mkPeople(S);for(let i=0;i<260;i++){addPost(S);}grant(S);return S;}
const start=()=>({nodes:[],wires:[],seq:1});
const H={travel,away,today,need,spot,wantLong,slotOf,OLD};
const API={LOCAL,H,topOf,times,daySec,OLD,QUESTS,insOf,weight,TAGS,TOPICS,CITIES,DISTRICTS,SLOTS,DAY,GOAL,NP,GROUPS,SOURCES,SRC,TYPE,FIELD,B,CAPPED,LVMAX,BAR,MILES,cover,signal,appeal,capOf,fits,connect,reaches,runFor,feedFor,visit,ctxOf,owned,buyPrice,lvPrice,buySource,nodePrice,upgrade,PRICE,MAX,buy,powerCap,powerLoad,stock,ceiling,slotOf,dayOf,weekend,travel,away,init,start,step};
if(typeof module!=='undefined')module.exports=API;else root.Sim=API;})(typeof window!=='undefined'?window:globalThis);
