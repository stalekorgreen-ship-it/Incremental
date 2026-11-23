// ===================== ЛЕНТА.EXE v10 — ПРАВИЛА, ПОИСК, СОБЫТИЯ, МАГАЗИН =====================
const eff=k=>{let s=0;for(const it of SHOP){if(it.lv){const n=lvl(it.id);if(n&&it.ef[k])s+=it.ef[k]*n}else if(has(it.id)&&it.ef&&it.ef[k])s+=it.ef[k]}return s};
// ---------- условия правил ----------
// k: word, views, likes, coms, shares, cat, tone, emo, age, media, len, comtone, comact
const COND={word:{n:'содержит слово',need:null,val:'text'},views:{n:'просмотров',need:'c_views',val:'num'},likes:{n:'лайков',need:'m_likes',val:'num'},coms:{n:'комментариев',need:'m_coms',val:'num'},
 shares:{n:'репостов',need:'m_shares',val:'num'},cat:{n:'тематика',need:'m_cats',val:'cat'},tone:{n:'тональность',need:'m_tone',val:'tone'},emo:{n:'эмоциональность',need:'m_emo',val:'num'},
 age:{n:'возраст публикации (дней)',need:'c_age',val:'num'},media:{n:'есть фото или видео',need:'s_media',val:'none'},len:{n:'длина текста (знаков)',need:'s_len',val:'num'},
 comtone:{n:'доля злых комментариев (%)',need:'c_comtone',val:'num'},comact:{n:'комментариев за день',need:'c_comact',val:'num'}};
function condOk(c,p){let r;switch(c.k){case 'word':{const w=normW(c.v||'');const l=lemma(w);r=p.words.includes(w)||p.lem.includes(l);break}
 case 'views':r=cmp(p.views*rep(),c);break;case 'likes':r=cmp(p.likes*rep(),c);break;case 'coms':r=cmp(p.coms*rep(),c);break;case 'shares':r=cmp(p.shares*rep(),c);break;
 case 'cat':r=p.cats.includes(+c.v);break;case 'tone':r=p.tone==+c.v;break;case 'emo':r=cmp(p.emo,c);break;case 'age':r=cmp((S.t-p.born)/TICK_DAY,c);break;case 'media':r=!!p.media;break;case 'len':r=cmp(p.len,c);break;
 case 'comtone':{const n=p.comments.length;r=n>=3&&cmp(p.comments.filter(x=>x.tone==0).length/n*100,c);break}case 'comact':r=cmp(p.coms*rep()/Math.max(1,(S.t-p.born)/TICK_DAY),c);break;default:r=false}
 return c.not?!r:r}
const cmp=(x,c)=>c.op=='<'?x<+c.v:x>+c.v;
function ruleOk(R,p){if(!R.conds.length)return false;return R.join=='or'?R.conds.some(c=>condOk(c,p)):R.conds.every(c=>condOk(c,p))}
const ACTN={1:'повысить приоритет (слабо)',2:'повысить приоритет',5:'максимальный приоритет',limit:'ограничить распространение'};
function condTxt(c){const C=COND[c.k];let v=c.v;if(c.k=='cat')v=CATS[+c.v];if(c.k=='tone')v=TONE[+c.v];return (c.not?'НЕ ':'')+(c.k=='word'?'содержит «'+v+'»':C.val=='none'?C.n:C.val=='num'?C.n+' '+(c.op||'>')+' '+v:C.n+' — '+v)}
const ruleTxt=R=>'ЕСЛИ '+R.conds.map(condTxt).join(R.join=='or'?' ИЛИ ':' И ')+(R.aud?' [для тех, у кого интерес «'+CATS[R.aud.cat]+'» ≥ '+R.aud.min+']':'')+' → '+ACTN[R.act];
// ---------- пересчёт ----------
let RCUR=0;
function requeue(){S.queue.rules=S.P.length;RCUR=0;S.recalcTotal=S.P.length;S.recalcDone=0}
function rulesWork(n){const act=S.rules.filter(r=>r.on);for(let i=0;i<n;i++){if(!S.P.length)return;RCUR=RCUR%S.P.length;const p=S.P[RCUR++];applyRules(p,act);S.recalcDone=(S.recalcDone||0)+1}}
function applyRules(p,act){let b=0;const log=[];p.audB=[];p.rc={};let lim=false;
 for(const R of act){if(!ruleOk(R,p))continue;R.hits=(R.hits||0)+1;const met=R.conds.filter(c=>condOk(c,p)).map(condTxt);
  if(R.act=='limit'){lim=true;p.rc[R.id]=-1}else if(R.aud){p.audB.push({cat:R.aud.cat,min:R.aud.min,v:+R.act,r:R.id})}else{b+=+R.act;p.rc[R.id]=+R.act}
  log.push({r:R.id,met,act:ACTN[R.act],t:S.t})}
 p.boost=lim?-8:b;p.ruleLim=lim;if(log.length){p.log=log.concat(p.log.filter(x=>!log.some(y=>y.r==x.r))).slice(0,12)}else p.log=p.log.filter(x=>S.rules.some(r=>r.id==x.r&&r.on));p.ruleOk=true}
function audBoost(u,p){if(!p.audB||!p.audB.length)return 0;let s=0;for(const a of p.audB)if(u.it[a.cat]>=a.min)s+=a.v;return s}
// новые посты: сразу в очередь правил
function newPostsToQueue(){const fresh=S.P.filter(p=>!p.ruleOk);if(!S.rules.some(r=>r.on)){fresh.forEach(p=>p.ruleOk=true);return}fresh.forEach(p=>{applyRules(p,S.rules.filter(r=>r.on))})}
// эффект правил: доля внимания поста, которую дала надбавка правила, и потерянное внимание ограниченных постов
function ruleEffectTick(){if(!S.rules.length)return;let avgAtt=0,n=0;for(const p of S.P){if(!p.boost&&!p.pri){avgAtt+=p.att/Math.max(1,(S.t-p.born));n++}}avgAtt=n?avgAtt/n:0;
 for(const p of S.P){if(!p.rc)continue;const now=p.att-(p.attPrev||0);p.attPrev=p.att;for(const id in p.rc){const R=S.rules.find(r=>r.id==+id);if(!R)continue;const v=p.rc[id];
  if(v>0){const sc=Math.max(.5,score(p));R.effD=(R.effD||0)+now*rep()/60*(v/sc)}else R.effD=(R.effD||0)-avgAtt*rep()/60}}}
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
['rules','Конструктор','Конструктор алгоритма','правила «ЕСЛИ содержит слово → повысить приоритет / ограничить»',10,null],
['c_views','Конструктор','Условие: просмотры','«просмотров больше / меньше …»',18,'rules'],
['sort_views','Поиск','Сортировка результатов','по просмотрам, лайкам, охвату',20,null],
['m_time','Статистика','Время в соцсети и возвращения','ключевые показатели эффективности ленты',25,null],
['r_effect','Конструктор','Эффект правила','у каждого правила — минуты внимания за 7 дней',30,'rules'],
['m_likes','Статистика','Показатель: лайки','лайки у всех постов, условие в правилах',35,'m_time'],
['comments','Комментарии','Окно комментариев','читай, что пишут под постами',40,null],
['c_and','Конструктор','Несколько условий (И)','до трёх условий в правиле',45,'rules'],
['m_flow','Статистика','Приход и отток','сколько пришло и ушло за день и почему',55,'m_time'],
['u_profile','Пользователи','Возраст и регион','новые поля в профиле',60,null],
['m_coms','Статистика','Показатель: комментарии','комментарии у всех постов',65,'comments'],
['feed_pause','Лента','Пауза под курсором','лента останавливается, когда наводишь мышь',70,null],
['c_or','Конструктор','Связка ИЛИ','условия через ИЛИ',80,'c_and'],
['a_str','Конструктор','Сила приоритета','слабо / средне / максимум',90,'rules'],
['r_log','Конструктор','Журнал срабатываний','у поста видно, какое правило сработало и почему',100,'r_effect'],
['s_media','Поиск','Фильтр: фото и видео','и условие «есть медиа»',110,null],
['m_shares','Статистика','Показатель: репосты','репосты у всех постов',120,'m_likes'],
['u_hist','Пользователи','История просмотров','последние 100 публикаций пользователя',130,'u_profile'],
['r_folders','Конструктор','Папки правил','группируй правила',140,'c_and'],
['s_len','Поиск','Фильтр: длина','и условие по длине',150,'s_media'],
['m_cats','Статистика','Тематики','тематики у постов, фильтр поиска и условие',170,'m_likes'],
['c_age','Конструктор','Условие: возраст публикации','«старше N дней»',185,'c_views'],
['c_not','Конструктор','Исключения (НЕ)','«содержит „мэрия“, но НЕ „каток“»',200,'c_or'],
['m_tone','Статистика','Тональность','тональность постов, фильтр и условие',220,'m_cats'],
['u_stats','Пользователи','Статистика пользователя','время в соцсети, возвращения, активность',240,'u_hist'],
['a_restore','Конструктор','Восстановление из архива','правило может возвращать архивные посты',260,'c_age'],
['srv_fc','Серверы','Прогноз расходов','на 30 дней вперёд',280,null],
['m_emo','Статистика','Эмоциональность','эмоциональность постов, фильтр и условие',300,'m_tone'],
['s_combo','Поиск','Комбинированные фильтры','несколько фильтров сразу',320,'m_cats'],
['aud_stats','Статистика','Аудитория: возраст и регионы','распределения пользователей',340,'u_profile'],
['u_filter','Пользователи','Фильтр каталога','по возрасту и региону',360,'aud_stats'],
['feed_compact','Лента','Компактная лента','вдвое больше постов на экране',380,'feed_pause'],
['analytics','Аналитика','Продажа аналитики','собирай возраст и регионы — система продаёт данные',400,'aud_stats'],
['c_comtone','Конструктор','Условие: злые комментарии','доля злых комментариев',430,'m_coms'],
['c_comact','Конструктор','Условие: активность обсуждения','комментариев за день',460,'m_coms'],
['u_int','Пользователи','Интересы пользователя','сила интереса по категориям',500,'u_stats'],
['d_int','Аналитика','Сбор интересов','продаётся дороже',540,'analytics'],
['aud_int','Статистика','Аудитория: интересы','какие интересы у платформы',580,'u_int'],
['d_beh','Аналитика','Сбор поведения','ещё дороже',620,'d_int'],
['u_beh','Пользователи','Поведенческий профиль','склонности: лайкать, спорить, пролистывать',660,'u_int'],
['c_aud','Конструктор','Правила по аудитории','«показывать тем, у кого интерес к спорту ≥ 50» — персонализация',720,'u_int'],
['d_pref','Аналитика','Сбор предпочтений','самые дорогие данные',780,'d_beh'],
['u_filter2','Пользователи','Фильтр по интересам и поведению','поиск «кто любит спорт и спорит»',840,'u_beh'],
['stat_cmp','Статистика','Сравнение недель','неделя к неделе',900,'aud_int'],
['mark_iv','Лента','Метки вмешательств','в ленте видно, на какие посты ты повлиял',1000,'r_log']];
// многоуровневые: [id, программа, название, описание, базовая цена, множитель цены, эффект за уровень]
const SHOP_LV=[
['power','Серверы','Мощность серверов','+20% к мощности за уровень',60,1.45,{}],
['ads','Реклама','Рекламная сеть','+25% к ставке рекламы за уровень',150,1.6,{ads:.25}],
['growth','Рост','Рекомендации друзьям','+20% к притоку новых людей за уровень',200,1.65,{growth:.2}],
['dataQ','Аналитика','Чистка данных','+30% к цене данных за уровень',500,1.7,{dataQ:.3}],
['elec','Серверы','Энергоэффективность','−8% к расходу электричества',400,1.8,{elecSave:.08}],
['water','Серверы','Замкнутое охлаждение','−8% к расходу воды',400,1.8,{waterSave:.08}],
['ruleOpt','Серверы','Оптимизатор правил','−10% нагрузки от правил',800,1.9,{ruleOpt:.1}]];
const SHOP=SHOP_RAW.map(([id,b,n,d,p,req])=>({id,b,n,d,p:p<=30?p:Math.round(p*.2/5)*5,req,ef:{}})).concat(SHOP_LV.map(([id,b,n,d,p,mul,ef])=>({id,b,n,d,p,mul,ef,lv:true})));
const priceOf=it=>it.lv?Math.round(it.p*Math.pow(it.mul,lvl(it.id))):it.p;
const shopOk=it=>it.lv?(it.id=='power'||has('rules'))&&(it.id!='dataQ'||has('analytics')):!has(it.id)&&(!it.req||has(it.req));
function buy(id){const it=SHOP.find(x=>x.id==id);if(!it||!shopOk(it))return false;const c=priceOf(it);if(S.m<c)return false;S.m-=c;if(it.lv)S.lv[id]=lvl(id)+1;else S.f[id]=1;
 if(id=='analytics'){S.data.age=true;S.data.reg=true}return true}
// ---------- вехи ----------
const GOALS=[['u150','150 пользователей',()=>active()*rep()>=150],['r1','Первое правило',()=>S.rules.length>0],['e500','Правило с эффектом +500 мин за неделю',()=>S.rules.some(r=>r.eff7.reduce((a,b)=>a+b,0)>=500)],
 ['u500','500 пользователей',()=>active()*rep()>=500],['sup','Подави событие до его конца',()=>(S.suppressed||0)>0],['u2k','2 000 пользователей',()=>active()*rep()>=2000],['t30','Время в соцсети 30 мин в день',()=>{const d=S.days[S.days.length-1];return d&&d.timeAvg>=30}],
 ['u10k','10 000 пользователей',()=>active()*rep()>=1e4],['an1k','Доход аналитики $1 000 в день',()=>analyticsIncome()>=1000],['u50k','50 000 пользователей',()=>active()*rep()>=5e4],['u100k','100 000 пользователей',()=>active()*rep()>=1e5]];
function goalsTick(){if(S.t%5)return;for(const[id,n,ok]of GOALS)if(!S.goals[id]&&ok()){S.goals[id]=S.t;if(typeof toast=='function')toast('🎯 Веха: '+n)}}
