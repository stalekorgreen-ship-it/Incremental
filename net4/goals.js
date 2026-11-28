// ——— задания двух глав и бесконечные заказы
(function(root){
const node=typeof require!=='undefined';
const C=node?require('./core.js'):root.Core,R=node?require('./refs.js'):root.Refs;
const pc=v=>Math.floor(v*100)+'%';
// ответ считается эталонной схемой на тех же записях, что видит игрок
const answers=new Map();
function expected(S,key,ref){const src=C.sourcesOf(S),k=src.key+'|'+key;let t=answers.get(k);if(!t){const b=R.B(),id=ref(b),res=C.run(b.G,src)[id];if(!res.table)throw new Error(key+': '+res.err);t=res.table;const last=b.G.nodes.find(n=>n.id===id);if(last.type==='top'){const w=b.G.wires.find(w=>w[1]===id);t={cols:t.cols,rows:t.rows,top:{full:res&&C.run(b.G,src)[w[0]].table,p:last.p}};}answers.set(k,t);if(answers.size>80)answers.delete(answers.keys().next().value);}return t;}
const rowKey=r=>r.map(v=>typeof v==='number'?String(Math.round(v*1000)/1000):v).join('\u0001');
// сравнение: тот же набор строк, порядок не важен
// из эталонной таблицы берутся нужные столбцы: по именам, а если имена другие — первые по порядку
function project(t,fields){const idx=fields.every(f=>t.cols.includes(f))?fields.map(f=>t.cols.indexOf(f)):fields.map((_,i)=>i);return{cols:fields,rows:t.rows.map(r=>idx.map(i=>r[i]))};}
function compare(exp,got){const need=new Map();for(const r of exp.rows){const k=rowKey(r);need.set(k,(need.get(k)||0)+1);}let ok=0;for(const r of got){const k=rowKey(r),c=need.get(k);if(c){ok++;need.set(k,c-1);}}return{ok,need:exp.rows.length,got:got.length,done:ok===exp.rows.length&&got.length===exp.rows.length};}
// «Первые N» при равных значениях: годится любой из равных, лишь бы значения и число в группах совпали
function compareTop(exp,got,fields){const full=project(exp.top.full,fields),at=name=>{const i=exp.top.full.cols.indexOf(name),byName=fields.every(f=>exp.top.full.cols.includes(f));return byName?fields.indexOf(name):i;},is=at(exp.top.p.sort),ip=exp.top.p.per?at(exp.top.p.per):-1;
 const cls=r=>rowKey([ip<0?'':r[ip],r[is]]),count=(list,key)=>{const m=new Map();for(const r of list){const k=key(r);m.set(k,(m.get(k)||0)+1);}return m;},need=count(project(exp,fields).rows,cls),have=count(full.rows,rowKey);
 let ok=0;for(const r of got){const k=rowKey(r),c=cls(r);if(have.get(k)&&need.get(c)){ok++;have.set(k,have.get(k)-1);need.set(c,need.get(c)-1);}}return{ok,need:exp.rows.length,got:got.length,done:ok===exp.rows.length&&got.length===exp.rows.length};}
const judge=(exp,got,fields)=>exp.top?compareTop(exp,got,fields):compare(project(exp,fields),got);
function answerOf(G,Res,fields){const n=G.nodes.find(n=>n.type==='out'&&n.p.slot==='answer'),r=n&&Res[n.id];if(!r||!r.table)return null;const map=n.p.map||{},idx=fields.map(f=>r.table.cols.indexOf(map[f]||f));if(idx.some(i=>i<0))return{missing:fields.filter((f,i)=>idx[i]<0)};return{rows:r.table.rows.map(x=>idx.map(i=>x[i]))};}
// первые n столбцов эталона в нужном порядке: имена полей ответа не обязаны совпадать с эталонными
function answerCheck(S,G,Res,key,fields,ref){const a=answerOf(G,Res,fields);if(!a)return{done:false,text:'Подключи блок «Результат» и выбери в нём «Ответ».'};if(a.missing)return{done:false,text:'В «Результате» укажи столбцы: '+a.missing.join(', ')+'.'};
 const c=judge(typeof key==='object'?key:expected(S,key,ref),a.rows,fields);return{done:c.done,k:c.need?Math.min(c.ok,c.need)/Math.max(c.need,c.got):0,text:`Совпало строк: ${c.ok} из ${c.need}`+(c.got!==c.need?`, а у тебя всего ${c.got}`:'')};}
const metric=(key,need,label)=>({need,key,check:S=>({done:S[key]>=need,k:Math.min(1,S[key]/need),text:`${label}: ${pc(S[key])}, нужно ${pc(need)}`})});
const ans=(fields,ref)=>({fields,ref,check(S,G,Res){return answerCheck(S,G,Res,'goal:'+this.id,fields,ref);}});
const words=b=>b.src('Слова постов'),labeled=b=>b.join(words(b),b.src('Разметка'),'пост');
const pairs=b=>b.group(labeled(b),['слово','тема'],'count',null,'сколько');
const shares=b=>{const p=pairs(b),t=b.group(labeled(b),['слово'],'count',null,'всего');return b.calc(b.join(p,t,'слово'),'сколько','÷','всего','доля');};
const viewShare=b=>b.calc(b.join(b.src('Просмотры'),b.src('Посты'),'пост'),'секунд','÷','длина','доля');
// вкусы по темам, которые определила схема самого игрока
function ownTastes(S,th){const src=C.sourcesOf(S),b=R.B(),id=b.group(b.join(viewShare(b),b.src('Свои темы'),'пост'),['человек','тема'],'avg','доля','вкус');return C.run(b.G,Object.assign(Object.create(null),src,{'Свои темы':{cols:['пост','тема'],rows:th.rows}}))[id].table;}
// схема не менялась — эталон не пересчитывается
const mineCache=new WeakMap();
function mineFor(S,th,Res){const key=C.sourcesOf(S).key+JSON.stringify(th.rows.length),c=mineCache.get(Res);if(c&&c.key===key)return c;const v={key,acc:C.topicScore(C.world(S.seed),th).acc,table:ownTastes(S,th)};mineCache.set(Res,v);return v;}
const GOALS=[
{id:'t1',ch:1,title:'Первые темы',reward:120,unlock:['src','join','out'],text:'Сеть не знает, о чём посты. Склей «Слова постов» с «Начальным словарём» по слову и отдай в «Результат» → «Темы постов».',...metric('acc',.25,'Темы угаданы'),
 hints:['Нужно четыре блока: две «Таблицы», «Склеить» и «Результат».','В «Склеить» ключ — «слово».','В «Результате» выбери «Темы постов». Столбцы «пост» и «тема» подставятся сами.']},
{id:'t2',ch:1,title:'Одна тема на пост',reward:200,unlock:['group','top'],text:'У поста несколько слов из словаря, и тем выходит несколько. Такие посты не засчитываются. Оставь каждому посту одну тему: ту, за которую больше слов.',...metric('acc',.42,'Темы угаданы'),
 hints:['Сначала посчитай, сколько слов каждой темы в каждом посте.','«Сгруппировать» по «пост» и «тема», действие «сколько строк».','Потом «Первые N»: 1 строка в каждой группе «пост», сортировать по счётчику.']},
{id:'t3',ch:1,title:'Что пишут модераторы',reward:260,text:'Модераторы вручную указали тему части постов («Разметка»). Посчитай, сколько раз каждое слово встретилось в постах каждой темы. Ответ: слово, тема, сколько.',...ans(['слово','тема','сколько'],pairs),
 hints:['Нужно приклеить к словам тему поста.','Склей «Слова постов» с «Разметкой» по «пост».','Сгруппируй по «слово» и «тема», считай строки. Отдай в «Результат» → «Ответ».']},
{id:'t4',ch:1,title:'Свой словарь',reward:420,text:'Сделай из этого счёта свой словарь: каждому слову одна тема. Определи им темы всех постов вместо начального словаря.',...metric('acc',.62,'Темы угаданы'),
 hints:['Словарь — это таблица «слово, тема», по одной строке на слово.','Возьми для каждого слова тему, где оно встречалось чаще всего («Первые N», 1 в группе «слово»).','Склей слова всех постов со своим словарём, а дальше как во втором задании.']},
{id:'t5',ch:1,title:'Насколько слово верное',reward:520,unlock:['calc','filter'],text:'Слова вроде «это» и «вчера» есть везде и сбивают словарь. Посчитай для каждого слова, какая доля его появлений в размеченных постах приходится на каждую тему. Ответ: слово, тема, доля.',...ans(['слово','тема','доля'],shares),
 hints:['Доля = сколько раз слово в этой теме ÷ сколько раз слово всего.','«Всего» — это ещё одна группировка размеченных слов только по «слово».','Склей два счёта по «слово» и в «Посчитать» раздели.']},
{id:'t6',ch:1,title:'Выбросить мусор',reward:700,text:'Оставь в словаре только слова, которые уверенно говорят о теме. Если точности не хватает, купи разметку побольше.',...metric('acc',.84,'Темы угаданы'),
 hints:['Слово с маленькой долей ничего не говорит о теме.','«Отобрать»: доля ≥ 0,4 или выше. Попробуй разные пороги и смотри на точность.','Больше «Разметки модераторами» в «Покупках» делает словарь точнее.']},
{id:'t7',ch:1,title:'Весомые слова',reward:900,text:'Не все слова равны: слово с долей 0,95 надёжнее слова с долей 0,5. Пусть это учитывается, когда выбирается тема поста.',...metric('acc',.93,'Темы угаданы'),
 hints:['Вместо счёта слов можно складывать их надёжность.','Группируй по «пост» и «тема», действие «сумма» по доле.','Если не хватает чуть-чуть, купи разметку.']},
{id:'v1',ch:2,title:'Сколько досмотрели',reward:900,text:'Глава 2. Что любит человек, неизвестно: есть только записи «кто сколько секунд смотрел». Посчитай долю досмотра каждого просмотра: секунды ÷ длина поста. Ответ: человек, пост, доля.',...ans(['человек','пост','доля'],viewShare),
 hints:['Длина поста лежит в таблице «Посты».','Склей «Просмотры» с «Постами» по «пост».','«Посчитать»: секунд ÷ длина.']},
{id:'v2',ch:2,title:'Вкусы',reward:1100,mine:true,text:'Для каждого человека найди среднюю долю досмотра по каждой теме. Темы бери из своего определителя. Ответ: человек, тема, вкус.',fields:['человек','тема','вкус'],check(S,G,Res){const th=C.resultOf(G,Res,'topics');if(!th||!th.rows)return{done:false,k:0,text:'Сначала отдай свою ветку тем в «Результат» → «Темы постов».'};const mine=mineFor(S,th,Res);if(mine.acc<.6)return{done:false,k:0,text:'Твой определитель тем угадывает меньше 60%: почини его.'};
 return answerCheck(S,G,Res,mine.table,this.fields);},
 hints:['К долям досмотра приклей тему поста из своей ветки тем.','Сгруппируй по «человек» и «тема», действие «среднее».','Берётся тема из твоей схемы: ветку тем строить заново не нужно.']},
{id:'v3',ch:2,title:'Первая личная лента',reward:1500,text:'«Кандидаты» — свежие посты, которых человек ещё не видел. Поставь каждому оценку по его вкусу к теме поста, оставь 5 лучших на человека и отдай в «Ленту».',...metric('hit',.35,'Лента попадает во вкус'),
 hints:['Кандидату нужна тема поста, потом вкус этого человека к этой теме.','Склей по «пост», потом по двум ключам: «человек» и «тема».','«Первые N»: 5 в группе «человек» по вкусу. В «Результате» оценка — это столбец вкуса.']},
{id:'v4',ch:2,title:'Кто автор',reward:2200,text:'Про одну тему пишут и хорошо, и плохо. У свежего поста просмотров ещё нет, но у автора есть старые посты. Учти качество автора в оценке.',...metric('hit',.48,'Лента попадает во вкус'),
 hints:['Качество автора — средняя доля досмотра всех его постов.','Сгруппируй просмотры по «автор», приклей к кандидатам по «автор».','Новая оценка = вкус × качество.']},
{id:'v5',ch:2,title:'Длинные видео',reward:3200,text:'Длинное досматривают хуже, даже если нравится. Из-за этого вкус к темам с длинными постами кажется слабее. Убери этот перекос.',...metric('hit',.68,'Лента попадает во вкус'),
 hints:['Узнай, сколько в среднем досматривают длинные и короткие посты (столбец «длинный»).','Раздели долю каждого просмотра на среднюю для такой длины: получится честная оценка.','Кандидату потом можно вернуть поправку на длину: умножить на среднюю долю для его длины. И не забудь про «Подробный журнал».']},
{id:'v6',ch:2,title:'Вкусы меняются',reward:5000,text:'Часть людей на 7-й день увлеклась другим. Старые просмотры теперь обманывают.',...metric('hit',.85,'Лента попадает во вкус'),
 hints:['В «Просмотрах» есть столбец «день».','Отбери только свежие дни. Но записей станет меньше.','Купи «Подробный журнал»: свежих записей станет хватать.']},
{id:'v7',ch:2,title:'Сеть растёт',reward:9000,text:'Людей всё больше, расчёт тормозит, и лента отстаёт. Нужно 50 000 человек. Помогают быстрый расчёт (меньше строк, прокачка медленного блока, процессоры), точность ленты и «Приглашения».',key:'users',need:5e4,check:S=>({done:S.users>=5e4,k:Math.min(1,S.users/5e4),text:`Людей: ${Math.floor(S.users).toLocaleString('ru-RU')} из 50 000`}),
 hints:['Смотри, какой блок помечен «самый долгий».','Отбирай строки раньше, чем склеиваешь.','Каждые 10 уровней блока удваивают его скорость.']}];
// ——— заказы: бесконечные. Каждый — расчёт по тем же записям
const AUTH=s=>C.world(s.seed).authors.map(a=>a.name);
// условие заказа («только длинные», «начиная с дня N») добавляется к исходной таблице
let CTX={};
const posts=b=>{const t=b.src('Посты');return CTX.long===undefined?t:b.filter(t,'длинный','=',CTX.long);},views=b=>{let t=b.src('Просмотры');if(CTX.from)t=b.filter(t,'день','≥',CTX.from);if(CTX.to)t=b.filter(t,'день','≤',CTX.to);return t;},pv=b=>b.join(views(b),posts(b),'пост');
const n=(r,a,s=1)=>a[0]+Math.floor(r*(Math.floor((a[1]-a[0])/s)+1))*s;
const O=[
// ступень 1: группировки
{id:'ac',tier:1,f:['автор','сколько'],p:()=>({}),t:()=>'Сколько постов у каждого автора?',r:b=>b.group(posts(b),['автор'],'count')},
{id:'al',tier:1,f:['автор','длина'],p:()=>({}),t:()=>'Средняя длина поста у каждого автора.',r:b=>b.group(posts(b),['автор'],'avg','длина','среднее')},
{id:'ax',tier:1,f:['автор','длина'],p:()=>({}),t:()=>'Самый длинный пост каждого автора: какой длины?',r:b=>b.group(posts(b),['автор'],'max','длина','максимум')},
{id:'vc',tier:1,f:['человек','сколько'],p:r=>({}),t:()=>'Сколько записей о просмотрах у каждого человека?',r:b=>b.group(views(b),['человек'],'count')},
{id:'vs',tier:1,f:['человек','секунд'],p:()=>({}),t:()=>'Сколько секунд всего смотрел каждый человек?',r:b=>b.group(views(b),['человек'],'sum','секунд','всего')},
{id:'tl',tier:1,f:['пост','длина'],p:r=>({n:n(r(1),[5,30])}),t:p=>`${p.n} самых длинных постов (пост и длина).`,r:(b,p)=>b.top(posts(b),'длина',p.n)},
{id:'wf',tier:1,f:['слово','сколько'],p:r=>({n:n(r(1),[8,25])}),t:p=>`${p.n} самых частых слов: слово и сколько раз.`,r:(b,p)=>b.top(b.group(words(b),['слово'],'count'),'сколько',p.n)},
{id:'pw',tier:1,f:['пост','сколько'],p:()=>({}),t:()=>'Сколько слов в каждом посте?',r:b=>b.group(words(b),['пост'],'count')},
{id:'vl',tier:1,f:['человек','пост','секунд'],p:()=>({}),t:()=>'Для каждого человека: просмотр, который он смотрел дольше всех (по одному).',r:b=>b.top(views(b),'секунд',1,'человек')},
{id:'dc',tier:1,f:['день','сколько'],p:()=>({}),t:()=>'Сколько просмотров было в каждый день?',r:b=>b.group(views(b),['день'],'count')},
// ступень 2: отбор, расчёт, склейка
{id:'fd',tier:2,f:['человек','сколько'],p:r=>({d:n(r(1),[3,9])}),t:p=>`Сколько просмотров у каждого человека начиная с дня ${p.d}?`,r:(b,p)=>b.group(b.filter(views(b),'день','≥',p.d),['человек'],'count')},
{id:'fl',tier:2,f:['автор','сколько'],p:r=>({l:n(r(1),[40,180],10)}),t:p=>`Сколько постов длиннее ${p.l} секунд у каждого автора, у кого они есть?`,r:(b,p)=>b.group(b.filter(posts(b),'длина','>',p.l),['автор'],'count')},
{id:'as',tier:2,f:['автор','секунд'],p:()=>({}),t:()=>'Сколько секунд всего посмотрели у каждого автора?',r:b=>b.group(pv(b),['автор'],'sum','секунд','всего')},
{id:'ps',tier:2,f:['пост','доля'],p:r=>({n:n(r(1),[5,25])}),t:p=>`${p.n} постов с самой высокой средней долей досмотра (секунды ÷ длина).`,r:(b,p)=>b.top(b.group(viewShare(b),['пост'],'avg','доля','доля'),'доля',p.n)},
{id:'ah',tier:2,f:['автор','доля'],p:r=>({n:n(r(1),[3,15])}),t:p=>`${p.n} авторов с самой высокой средней долей досмотра.`,r:(b,p)=>b.top(b.group(viewShare(b),['автор'],'avg','доля','доля'),'доля',p.n)},
{id:'full',tier:2,f:['человек','сколько'],p:r=>({k:n(r(1),[5,9])/10}),t:p=>`Сколько раз каждый человек досмотрел пост хотя бы на ${Math.round(p.k*100)}%?`,r:(b,p)=>b.group(b.filter(viewShare(b),'доля','≥',p.k),['человек'],'count')},
{id:'min',tier:2,f:['человек','минуты'],p:()=>({}),t:()=>'Сколько минут всего смотрел каждый человек?',r:b=>b.calc(b.group(views(b),['человек'],'sum','секунд','всего'),'всего','÷',60,'итог')},
{id:'busy',tier:2,f:['пост','сколько'],p:r=>({k:n(r(1),[2,6])}),t:p=>`Посты, у которых больше ${p.k} просмотров, и сколько их.`,r:(b,p)=>b.filter(b.group(views(b),['пост'],'count'),'сколько','>',p.k)},
// ступень 3: несколько веток
{id:'sh',tier:3,f:['автор','доля'],p:r=>({d:n(r(1),[2,8])}),t:p=>`Для каждого автора: какая доля просмотров его постов пришлась на дни с ${p.d}-го.`,r:(b,p)=>{const all=b.group(pv(b),['автор'],'count',null,'всего'),late=b.group(b.filter(pv(b),'день','≥',p.d),['автор'],'count');return b.calc(b.join(late,all,'автор'),'сколько','÷','всего','доля');}},
{id:'rel',tier:3,f:['пост','оценка'],p:r=>({n:n(r(1),[5,20])}),t:p=>`${p.n} постов, которые досматривают лучше всего по сравнению со средним по своей длине. Оценка = средняя доля поста ÷ средняя доля всех просмотров той же длины («длинный»).`,r:(b,p)=>{const base=b.group(viewShare(b),['длинный'],'avg','доля','поправка'),mine=b.group(viewShare(b),['пост','длинный'],'avg','доля','среднее');return b.top(b.calc(b.join(mine,base,'длинный'),'среднее','÷','поправка','оценка'),'оценка',p.n);}},
{id:'avgsec',tier:3,f:['человек','секунд'],p:()=>({}),t:()=>'Сколько секунд в среднем длится один просмотр у каждого человека? Посчитай суммой и счётом, потом раздели.',r:b=>{const s=b.group(views(b),['человек'],'sum','секунд','всего'),c=b.group(views(b),['человек'],'count');return b.calc(b.join(s,c,'человек'),'всего','÷','сколько','среднее');}},
{id:'topau',tier:3,f:['человек','автор','секунд'],p:()=>({}),t:()=>'Любимый автор каждого человека: у кого из авторов он посмотрел больше всего секунд?',r:b=>b.top(b.group(pv(b),['человек','автор'],'sum','секунд','всего'),'всего',1,'человек')},
{id:'topday',tier:3,f:['день','человек','сколько'],p:r=>({n:n(r(1),[1,3])}),t:p=>`В каждый день: ${p.n===1?'самый активный человек':p.n+' самых активных человека'} по числу просмотров.`,r:(b,p)=>b.top(b.group(views(b),['день','человек'],'count'),'сколько',p.n,'день')},
{id:'wt',tier:3,f:['тема','слово','сколько'],p:r=>({n:n(r(1),[1,5])}),t:p=>`Для каждой темы из разметки: ${p.n} самых частых слов.`,r:(b,p)=>b.top(pairs(b),'сколько',p.n,'тема')}];
// каким заказам какое условие подходит: v — по дню просмотра, p — по длине поста
const MODS={ac:'p',al:'p',ax:'p',tl:'',vc:'v',vs:'v',vl:'v',dc:'',as:'pv',ps:'pv',ah:'pv',full:'pv',min:'v',rel:'v',avgsec:'v',topau:'pv',fl:''};
function addMod(d,p,r){const m=MODS[d.id]||'',list=[];if(m.includes('v'))list.push(()=>({from:2+(r(2)*7|0)}),()=>({to:3+(r(2)*6|0)}));if(m.includes('p'))list.push(()=>({long:0}),()=>({long:1}));return list.length&&r(3)<.75?{...p,mod:list[r(4)*list.length|0]()}:p;}
const modText=m=>!m?'':m.from?` Считать только просмотры начиная с дня ${m.from}.`:m.to?` Считать только просмотры по день ${m.to} включительно.`:m.long?' Брать только длинные посты («длинный» = 1).':' Брать только короткие посты («длинный» = 0).';
const orderRef=(b,d,p)=>{CTX=p.mod||{};try{return d.r(b,p);}finally{CTX={};}};
const tierOpen=S=>S.goal>=7?3:S.goal>=5?2:S.goal>=2?1:0;
const orderDef=o=>O.find(x=>x.id===o.k);
function newOrder(S){const max=tierOpen(S);if(!max)return null;for(let tries=0;tries<60;tries++){const i=S.orderSeq++,tier=max===1?1:C.hash(S.seed,'tier',i)<.5?max:1+(C.hash(S.seed,'tier2',i)*max|0),pool=O.filter(x=>x.tier===tier),d=pool[(C.hash(S.seed,'ord',i)*pool.length)|0],r=k=>C.hash(S.seed,'par',i,k),p=max>1?addMod(d,d.p(r),r):d.p(r);
 const sig=d.id+JSON.stringify(p);if(S.orders.some(o=>o.k===d.id))continue;if(S.solved&&S.solved.includes(sig)&&tries<50)continue;return{id:i,k:d.id,p,tier:p.mod?Math.max(2,d.tier):d.tier};}return null;}
function fillOrders(S){while(S.orders.length<3){const o=newOrder(S);if(!o)break;S.orders.push(o);}}
const orderText=o=>orderDef(o).t(o.p)+modText(o.p.mod);
const orderReward=(S,o)=>Math.round(Math.max(90*o.tier*o.tier,S.income*(40+40*o.tier)));
const orderCheck=(S,o,G,Res)=>{const d=orderDef(o);return answerCheck(S,G,Res,'order:'+o.k+JSON.stringify(o.p),d.f,b=>orderRef(b,d,o.p));};
function closeOrder(S,o){S.solved=(S.solved||[]).concat(o.k+JSON.stringify(o.p)).slice(-600);S.orders=S.orders.filter(x=>x!==o);}
function completeOrder(S,o){const r=orderReward(S,o);S.money+=r;S.earned+=r;S.rep++;S.done++;closeOrder(S,o);fillOrders(S);return r;}
function skipOrder(S,o){closeOrder(S,o);fillOrders(S);}
// ——— ход заданий
function unlocked(S){const set=new Set();for(let i=0;i<=Math.min(S.goal,GOALS.length-1);i++)for(const u of GOALS[i].unlock||[])set.add(u);return set;}
function goalState(S,G,Res){const g=GOALS[S.goal];if(!g)return null;return g.check(S,G,Res);}
// держать результат несколько секунд, чтобы победа не засчиталась случайно
function tick(S,G,Res){const g=GOALS[S.goal];if(!g)return null;const st=g.check(S,G,Res);S.hold=st.done?S.hold+1:0;if(S.hold>=2){S.hold=0;S.goal++;S.money+=g.reward;S.earned+=g.reward;fillOrders(S);return g;}return null;}
const API={SEED:1,orderRef,MODS,project,GOALS,ORDERS:O,expected,compare,answerOf,answerCheck,newOrder,fillOrders,orderDef,orderText,orderReward,orderCheck,completeOrder,skipOrder,tierOpen,unlocked,goalState,tick};
if(node)module.exports=API;else root.Goals=API;
})(this);
