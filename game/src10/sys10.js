// ===================== ЛЕНТА.EXE v10 — ПРАВИЛА, ПОИСК, СОБЫТИЯ, МАГАЗИН =====================
const eff=k=>{let s=0;for(const it of SHOP){if(it.lv){const n=lvl(it.id);if(n&&it.ef[k])s+=it.ef[k]*n}else if(has(it.id)&&it.ef&&it.ef[k])s+=it.ef[k]}return s};
// ---------- ручное вмешательство ----------
function intervene(p,mode){p.pri=mode=='max'?5:0;p.blocked=mode=='block';if(mode=='none'){S.iv=S.iv.filter(id=>id!=p.id)}else if(!S.iv.includes(p.id))S.iv.unshift(p.id);rerank()}
// ---------- поиск ----------
function search(q,o={}){const ws=q.trim().split(/\s+/).map(normW).filter(Boolean);const L=o.arch?S.P.concat(S.arch):S.P;
 let R=L.filter(p=>ws.every(w=>p.words.includes(w)||p.lem.includes(lemma(w))));
 if(o.media)R=R.filter(p=>o.media=='any'?p.media:o.media=='none'?!p.media:p.media==o.media);if(o.len)R=R.filter(p=>o.len=='s'?p.len<80:o.len=='m'?p.len>=80&&p.len<200:p.len>=200);
 if(o.cat!=null&&o.cat!=='')R=R.filter(p=>p.cats.includes(+o.cat));if(o.tone!=null&&o.tone!=='')R=R.filter(p=>p.tone==+o.tone);if(o.emo)R=R.filter(p=>o.emo=='hi'?p.emo>=60:p.emo<40);
 const key={date:p=>p.born,views:p=>p.views,likes:p=>p.likes,coms:p=>p.coms,shares:p=>p.shares,reach:p=>p.views}[o.sort||'date'];return R.sort((a,b)=>key(b)-key(a))}
// ---------- события и новости ----------
const EVT=[
 {k:'prices',kw:['цены','инфляция','зарплата'],t:15,dur:8,tone:0,next:'protest',head:['Цены на хлеб взлетели за ночь: покупатели в ярости','Инфляция съедает зарплаты: «Сколько можно терпеть?»'],posts:['Цены на хлеб выросли вдвое. Как жить?','Зарплата та же, а цены каждую неделю выше','Инфляция: я больше не могу покупать мясо']},
 {k:'protest',kw:['митинг','площадь','требуем'],t:14,dur:5,tone:0,next:'scandal',head:['Недовольные ценами вышли на площадь','Митинг у мэрии: «Требуем ответа!»'],posts:['Все на площадь в субботу! Требуем снизить цены','Митинг у мэрии собрал тысячи','Я был на митинге. Нас не слышат']},
 {k:'scandal',kw:['чиновник','взятки','мэрия'],t:14,dur:6,tone:0,head:['Скандал: чиновник мэрии купил третью яхту','Взятки в мэрии: журналисты нашли документы'],posts:['Чиновник мэрии и его яхты — читайте до конца','Взятки в мэрии: почему все молчат?','Мэрия опять оправдывается']},
 {k:'fire',kw:['пожар','гаражи'],t:40,dur:3,tone:0,head:['Крупный пожар в гаражах Промзоны'],posts:['Пожар в гаражах! Дым видно из окна','Пожарные работают уже три часа','Кто-нибудь знает, все целы после пожара?']},
 {k:'match',kw:['матч','футбол','победа'],t:3,dur:4,tone:2,head:['Сборная Вальдии вышла в финал!'],posts:['Какой матч! Победа на последней минуте','Весь город празднует победу','Футбол — это жизнь']},
 {k:'virus',kw:['вирус','больница','маски'],t:10,dur:10,tone:0,next:'scandal',head:['В городе вспышка неизвестного вируса','Больницы переполнены: врачи просят носить маски'],posts:['Вирус в городе, больница забита','Маски снова в аптеках по тройной цене','Врачи просят не паниковать из-за вируса']},
 {k:'phone',kw:['смартфон','презентация'],t:8,dur:5,tone:2,head:['Новый смартфон «Вальдия-Х» побил рекорды продаж'],posts:['Купил новый смартфон — камера огонь','Презентация смартфона: обзор','Стоит ли брать новый смартфон?']},
 {k:'cat',kw:['кот','котик'],t:23,dur:3,tone:2,head:['Кот-пианист покорил соцсети'],posts:['Этот кот играет на пианино 😂','Кот-пианист — лучшее видео года','Хочу такого кота']}];
function eventsTick(){if(S.t%TICK_DAY!=5)return;for(const E of S.ev){const D=EVT.find(x=>x.k==E.k);const n=2+Math.floor(Math.random()*4)+Math.floor(active()/400);
  for(let i=0;i<n;i++){const p=mkPost(pk(S.U),{t:D.t,txt:pk(D.posts),tone:D.tone,emo:60+Math.random()*40,ev:E.id});p.cats=[...new Set(p.cats.concat(T2C[D.t]))]}}}
function eventsDay(){const t=dayNo();
 for(const E of S.ev.slice()){const D=EVT.find(x=>x.k==E.k);const posts=S.P.filter(p=>p.ev==E.id);const sup=posts.length?posts.filter(p=>p.blocked||p.ruleLim).length/posts.length:0;
  if(sup>=.6&&t-E.start>=1){endEvent(E,true);continue}if(t-E.start>=D.dur)endEvent(E,false)}
 if(S.ev.length<2&&Math.random()<.18){const D=pk(EVT.filter(x=>!['protest','scandal'].includes(x.k)&&!S.ev.some(e=>e.k==x.k)));if(D)startEvent(D)}}
function startEvent(D){const E={id:'e'+(S.evN=(S.evN||0)+1),k:D.k,start:dayNo()};S.ev.push(E);S.news.unshift({id:E.id,txt:pk(D.head),src:pk(['«Вечерний вестник»','«Новости Вальдии»','«Город онлайн»','Telegram «Инсайдер»']),t:S.t});S.news.length=Math.min(30,S.news.length)}
function endEvent(E,sup){S.ev=S.ev.filter(x=>x!==E);S.news=S.news.filter(n=>n.id!=E.id);const D=EVT.find(x=>x.k==E.k);if(!sup&&D.next){const N=EVT.find(x=>x.k==D.next);if(N&&!S.ev.some(e=>e.k==N.k))startEvent(N)}if(sup)S.suppressed=(S.suppressed||0)+1}
// ---------- магазин ----------
// [id, программа, название, описание, цена, требование] — все новые функции открываются в первые ~30 минут
const SHOP_RAW=[
['rules','Конструктор','Конструктор алгоритма (блупринты)','модули «Новый пост», «Содержит слово», «Повысить приоритет», «Ограничить»',10,null],
['sort_views','Поиск','Сортировка результатов','по просмотрам, лайкам, охвату',20,null],
['m_time','Статистика','Время в соцсети и возвращения','ключевые показатели',25,null],
['m_likes','Статистика','Показатель: лайки','лайки у всех постов',35,'m_time'],
['comments','Комментарии','Окно комментариев','читай, что пишут под постами',40,null],
['m_flow','Статистика','Приход и отток','сколько пришло и ушло',55,'m_time'],
['u_profile','Пользователи','Возраст и регион','новые поля в профиле',60,null],
['m_coms','Статистика','Показатель: комментарии','комментарии у всех постов',65,'comments'],
['feed_pause','Лента','Пауза под курсором','лента стоит, пока наводишь мышь',70,null],
['r_log','Конструктор','Журнал модулей','у поста виден путь по схеме',100,'rules'],
['s_media','Поиск','Фильтр: фото и видео','',110,null],
['m_shares','Статистика','Показатель: репосты','',120,'m_likes'],
['u_hist','Пользователи','История просмотров','последние 100 публикаций',130,'u_profile'],
['s_len','Поиск','Фильтр: длина','',150,'s_media'],
['m_cats','Статистика','Тематики','тематики у постов и фильтр поиска',170,'m_likes'],
['m_tone','Статистика','Тональность','',220,'m_cats'],
['u_stats','Пользователи','Статистика пользователя','время, возвращения',240,'u_hist'],
['srv_fc','Серверы','Прогноз расходов','на 30 дней',280,null],
['m_emo','Статистика','Эмоциональность','',300,'m_tone'],
['s_combo','Поиск','Комбинированные фильтры','',320,'m_cats'],
['aud_stats','Статистика','Аудитория: возраст и регионы','',340,'u_profile'],
['u_filter','Пользователи','Фильтр каталога','по возрасту и региону',360,'aud_stats'],
['feed_compact','Лента','Компактная лента','',380,'feed_pause'],
['analytics','Аналитика','Продажа аналитики','',400,'aud_stats'],
['u_int','Пользователи','Интересы пользователя','',500,'u_stats'],
['d_int','Аналитика','Сбор интересов','',540,'analytics'],
['aud_int','Статистика','Аудитория: интересы','',580,'u_int'],
['d_beh','Аналитика','Сбор поведения','',620,'d_int'],
['u_beh','Пользователи','Поведенческий профиль','',660,'u_int'],
['d_pref','Аналитика','Сбор предпочтений','',780,'d_beh'],
['u_filter2','Пользователи','Фильтр по интересам','',840,'u_beh'],
['stat_cmp','Статистика','Сравнение недель','',900,'aud_int'],
['mark_iv','Лента','Метки вмешательств','',1000,'r_log']].concat(BP_SHOP());
// многоуровневые: [id, программа, название, описание, базовая цена, множитель цены, эффект за уровень]
const SHOP_LV=[
['power','Серверы','Мощность серверов','+20% к мощности за уровень',60,1.45,{}],
['ads','Реклама','Рекламная сеть','+25% к ставке рекламы за уровень',150,1.6,{ads:.25}],
['growth','Рост','Рекомендации друзьям','+20% к притоку новых людей за уровень',200,1.65,{growth:.2}],
['dataQ','Аналитика','Чистка данных','+30% к цене данных за уровень',500,1.7,{dataQ:.3}],
['elec','Серверы','Энергоэффективность','−8% к расходу электричества',400,1.8,{elecSave:.08}],
['water','Серверы','Замкнутое охлаждение','−8% к расходу воды',400,1.8,{waterSave:.08}],
['ruleOpt','Серверы','Оптимизатор правил','−10% нагрузки от правил',800,1.9,{ruleOpt:.1}]];
const SHOP=SHOP_RAW.map(([id,b,n,d,p,req])=>({id,b,n,d,p:p<=30?p:Math.max(15,Math.round(p*(id.startsWith('m_')?.065:.11)/5)*5),req,ef:{}})).concat(SHOP_LV.map(([id,b,n,d,p,mul,ef])=>({id,b,n,d,p,mul,ef,lv:true})));
const priceOf=it=>it.lv?Math.round(it.p*Math.pow(it.mul,lvl(it.id))):it.p;
const shopOk=it=>it.lv?(it.id=='power'||has('rules'))&&(it.id!='dataQ'||has('analytics')):!has(it.id)&&(!it.req||has(it.req));
function buy(id){const it=SHOP.find(x=>x.id==id);if(!it||!shopOk(it))return false;const c=priceOf(it);if(S.m<c)return false;S.m-=c;if(it.lv)S.lv[id]=lvl(id)+1;else S.f[id]=1;
 if(id=='analytics'){S.data.age=true;S.data.reg=true}return true}
// ---------- вехи ----------
const GOALS=[['u150','150 пользователей',()=>active()*rep()>=150],['r1','Первая схема: событие → действие',()=>S.bp.nodes.some(n=>NT[n.t].g=='act'&&n.hits)],['e500','Модуль с эффектом +500 мин за неделю',()=>S.bp.nodes.some(n=>(n.eff7||[]).reduce((a,b)=>a+b,0)>=500)],
 ['u500','500 пользователей',()=>active()*rep()>=500],['sup','Подави событие до его конца',()=>(S.suppressed||0)>0],['u2k','2 000 пользователей',()=>active()*rep()>=2000],['t30','Время в соцсети 30 мин в день',()=>{const d=S.days[S.days.length-1];return d&&d.timeAvg>=30}],
 ['u10k','10 000 пользователей',()=>active()*rep()>=1e4],['an1k','Доход аналитики $1 000 в день',()=>analyticsIncome()>=1000],['u50k','50 000 пользователей',()=>active()*rep()>=5e4],['u100k','100 000 пользователей',()=>active()*rep()>=1e5]];
function goalsTick(){if(S.t%5)return;for(const[id,n,ok]of GOALS)if(!S.goals[id]&&ok()){S.goals[id]=S.t;if(typeof toast=='function')toast('🎯 Веха: '+n)}}
