// Девять испытаний пробы. Каждое: этапы со сценариями людей и проверками, подсказки, эталон.
(function(){
const NAMES={a:'Аня',b:'Боря',v:'Вера',g:'Гена',d:'Даша',e:'Егор',j:'Жанна',z:'Зоя',i:'Игорь',k:'Катя',l:'Лёша',m:'Маша'};
const POSTS={p1:{who:'Кот Борис',text:'Сплю в коробке из-под системного блока. Не будить.'},p2:{who:'Радиорынок',text:'Продам модем 33600. Почти не пищит.'},
 p3:{who:'Дача-99',text:'Кабачки опять победили.'},p4:{who:'Клуб «Квант»',text:'Большой разбор: как мы за три вечера собрали сеть из двух компьютеров, одного кабеля и соседа дяди Славы. Сначала мы купили не тот кабель. Потом тот, но короткий. Потом…'}};
// кусочки экрана: f — какая часть поста видна, s — какую часть экрана он занимает
const P=(id,f,s)=>({id,f,s});
const ONE=id=>[P(id,1,.6)];
const act=(t,who,a,extra)=>Object.assign({t,who,a},extra||{});
const chk=(t,c)=>Object.assign({t},c);
const sc=(name,steps)=>({name,steps:steps.map((s,i)=>[s,i]).sort((x,y)=>x[0].t-y[0].t||x[1]-y[1]).map(x=>x[0])});

// ---- лайки ----
const open=(t,w,view)=>act(t,w,'open',{view:view||ONE('p1')});
const press=(t,w,p)=>act(t,w,'press',{post:p||'p1'});
const L2A=[sc('Аня жмёт кнопку',[open(0,'a'),chk(1,{chk:'lit',who:'a',post:'p1',want:false}),press(3,'a'),chk(4,{chk:'lit',who:'a',post:'p1',want:true})])];
const L3A=[sc('Аня закрыла и открыла снова',[open(0,'a'),press(3,'a'),act(8,'a','close'),open(40,'a'),chk(41,{chk:'lit',who:'a',post:'p1',want:true}),
 open(50,'b'),chk(51,{chk:'lit',who:'b',post:'p1',want:false}),act(60,'a','view',{view:ONE('p2')}),chk(61,{chk:'lit',who:'a',post:'p2',want:false})])];
const L3B=[sc('У Бори дрогнул палец',[open(0,'b'),press(2,'b'),press(3,'b'),chk(4,{chk:'nodup'}),press(5,'b'),press(6,'b'),press(7,'b'),chk(8,{chk:'nodup'}),
 open(10,'v'),press(12,'v'),chk(13,{chk:'lit',who:'v',post:'p1',want:true}),chk(13,{chk:'nodup'})])];
const L4A=[sc('Трое лайкают',[open(0,'a'),chk(1,{chk:'count',who:'a',post:'p1',want:0}),press(2,'a'),chk(3,{chk:'count',who:'a',post:'p1',want:1}),open(4,'b'),press(6,'b'),open(8,'v'),press(10,'v'),
 chk(11,{chk:'count',who:'v',post:'p1',want:3}),act(12,'a','view',{view:ONE('p2')}),chk(13,{chk:'count',who:'a',post:'p2',want:0}),press(14,'a','p2'),chk(15,{chk:'count',who:'a',post:'p2',want:1}),chk(15,{chk:'count',who:'b',post:'p1',want:3}),chk(16,{chk:'lit',who:'b',post:'p1',want:true})])];
const L4B=[sc('Боря передумал',[open(0,'a'),press(2,'a'),open(3,'b'),press(5,'b'),chk(6,{chk:'count',who:'b',post:'p1',want:2}),press(9,'b'),chk(10,{chk:'lit',who:'b',post:'p1',want:false}),chk(10,{chk:'count',who:'b',post:'p1',want:1}),
 chk(10,{chk:'lit',who:'a',post:'p1',want:true}),press(14,'b'),chk(15,{chk:'lit',who:'b',post:'p1',want:true}),chk(15,{chk:'count',who:'b',post:'p1',want:2}),act(20,'b','close'),open(30,'b'),chk(31,{chk:'count',who:'b',post:'p1',want:2}),chk(31,{chk:'lit',who:'b',post:'p1',want:true})])];
// 12 людей и дрожащие пальцы; правда считается тут же: каждое нажатие переключает лайк
function crowd(){const ids=Object.keys(NAMES),taps={a:1,b:3,v:2,g:1,d:5,e:1,j:4,z:1,i:2,k:1,l:3,m:1},on=new Set(),st=[];let t=0;
 ids.forEach((w,i)=>{st.push(open(t+=2,w));for(let n=0;n<taps[w];n++){st.push(press(t+=1,w));on.has(w)?on.delete(w):on.add(w);
   if(n===taps[w]-1||n===1){st.push(chk(t,{chk:'lit',who:w,post:'p1',want:on.has(w)}));st.push(chk(t,{chk:'count',who:w,post:'p1',want:on.size}));}}});
 return [sc('Двенадцать человек и одна кнопка',st)];}

// ---- в сети ----
const online=(t,want)=>chk(t,{chk:'panel',m:'online',want});
const L10A=[sc('Заходят и выходят',[open(0,'a'),open(10,'b'),online(70,2),open(80,'v'),open(90,'g'),online(160,4),act(170,'b','close'),online(230,3),act(300,'a','close'),act(310,'g','close'),online(380,1),online(600,1),act(610,'v','close'),online(680,0)])];
const L10B=[sc('У кого-то села батарейка',[open(0,'a'),open(5,'b'),open(10,'v'),online(70,3),act(100,'b','dead'),online(150,2),act(200,'a','close'),online(260,1),open(300,'g'),act(320,'v','dead'),online(380,1),online(700,1)])];

// ---- длина визита ----
const vis=(t,want)=>chk(t,{chk:'avg',m:'visit',want,rel:.08});
const L11A=[sc('Три визита',[open(0,'a'),open(20,'b'),act(60,'a','close'),act(140,'b','close'),vis(141,90),open(200,'v'),act(230,'v','close'),vis(231,70),open(300,'a'),act(390,'a','close'),vis(391,75)])];
const L11B=[sc('Люди сворачивают приложение',[open(0,'a'),act(20,'a','min'),act(320,'a','back'),act(340,'a','close'),vis(341,40),open(400,'b'),act(450,'b','min'),act(950,'b','close'),vis(951,45),
 open(1000,'v'),act(1030,'v','min'),act(1230,'v','back'),act(1250,'v','min'),act(1650,'v','back'),act(1660,'v','close'),vis(1661,50)])];

// ---- чтение ----
// человек читает по очереди: [что на экране, главный пост, секунд, что случилось]
function session(who,t0,list){const st=[];let t=t0;list.forEach((x,i)=>{const [view,sec,gap]=x;st.push(i?act(t,who,'view',{view}):open(t,who,view));
 if(gap){for(const g of gap){st.push(g.a?act(t+g.at,who,g.a,g.view?{view:g.view}:null):null);}}t+=sec;});st.push(act(t,who,'close'));return st.filter(Boolean);}
const truthOf=rec=>{const o={};for(const [p,s] of rec)(o[p]=o[p]||[]).push(s);return Object.fromEntries(Object.entries(o).map(([p,a])=>[p,a.reduce((x,y)=>x+y,0)/a.length]));};
const read=(t,rec)=>chk(t,{chk:'avgPost',m:'read',want:truthOf(rec),rel:.15});
const L12A=[sc('По одному посту на экране',[...session('a',0,[[ONE('p1'),8],[ONE('p2'),14],[ONE('p3'),6]]),...session('b',100,[[ONE('p2'),10],[ONE('p1'),12],[ONE('p3'),4]]),
 read(300,[['p1',8],['p1',12],['p2',14],['p2',10],['p3',6],['p3',4]])])];
const two1=[P('p1',1,.55),P('p2',1,.4)],two2=[P('p1',.3,.2),P('p2',1,.55),P('p3',.4,.22)],long=[P('p3',.15,.05),P('p4',.4,.95)],tail=[P('p4',.1,.2),P('p3',1,.6),P('p1',.2,.15)];
const L12B=[sc('Два поста сразу и один длинный',[...session('a',0,[[two1,10],[two2,16],[long,30],[tail,5]]),...session('v',100,[[two1,12],[two2,12],[long,26],[tail,7]]),
 read(300,[['p1',10],['p1',12],['p2',16],['p2',12],['p4',30],['p4',26],['p3',5],['p3',7]])])];
// отошёл от телефона: прочитал сколько обычно, а экран остался гореть
const L13A=[sc('Гена положил телефон и ушёл пить чай',[...session('a',0,[[ONE('p1'),9],[ONE('p2'),12],[ONE('p3'),8]]),...session('b',100,[[ONE('p1'),11],[ONE('p2'),10],[ONE('p3'),10]]),
 ...session('g',200,[[ONE('p1'),910],[ONE('p2'),11],[ONE('p3'),9]]),
 read(1400,[['p1',9],['p1',11],['p2',12],['p2',10],['p2',11],['p3',8],['p3',10],['p3',9]])])];
const L13B=[sc('Медленный читатель и чайник',[...session('z',0,[[ONE('p1'),10],[long,46]]),...session('i',100,[[ONE('p1'),12],[long,14]]),
 ...session('d',200,[[ONE('p1'),110],[ONE('p2'),12]]),...session('e',400,[[ONE('p2'),10],[ONE('p3'),9]]),...session('j',500,[[ONE('p3'),11],[ONE('p1'),11]]),...session('g',600,[[ONE('p1'),1000],[ONE('p3'),10]]),
 read(1900,[['p1',10],['p1',12],['p1',11],['p4',46],['p4',14],['p2',12],['p2',10],['p3',9],['p3',11],['p3',10]])])];

// ---- эталоны ----
const N=(id,type,p,x,y)=>({id,type,p:p||{},x:x||0,y:y||0});
const ev=(id,kind,extra)=>N(id,'ev',Object.assign({kind},extra||{}));
const tb=(id,name,key,mode,life)=>N(id,'table',{name,key,mode,life:life||0});
const SCR={card:true,text:true,like:true,count:false,litBy:'',countBy:''};
const toggle={nodes:[ev('e','press'),N('no','gate',{cond:'no',tab:'likes'}),N('yes','gate',{cond:'has',tab:'likes'}),tb('likes','Лайки','pair','set')],
 wires:[['e','no','e'],['e','yes','e'],['no','likes','write'],['yes','likes','del']]};
const counted={nodes:[...toggle.nodes,N('c','calc',{op:'rows',by:'post'})],wires:[...toggle.wires,['likes','c','t']]};
const BROKEN={nodes:[ev('e','press'),tb('likes','Лайки','pair','add'),tb('cnt','Счётчик','post','sum'),N('c','calc',{op:'sumv',by:'post'})],
 wires:[['e','likes','write'],['e','cnt','write'],['cnt','c','t']]};
const onl={nodes:[ev('o','open'),ev('c','close'),ev('k','tick',{n:10}),tb('on','Онлайн','who','set',30),N('n','calc',{op:'rows',by:'all'}),N('pn','panel',{m:'online'})],
 wires:[['o','on','write'],['k','on','write'],['c','on','del'],['on','n','t'],['n','pn','t']]};
const visit={nodes:[ev('o','open'),ev('mi','min'),ev('ba','back'),ev('c','close'),N('w','watch',{per:'who'}),tb('v','Визиты','one','sum'),N('av','calc',{op:'avg',by:'all'}),N('pn','panel',{m:'visit'})],
 wires:[['o','w','start'],['mi','w','pause'],['ba','w','resume'],['c','w','stop'],['w','v','write'],['v','av','t'],['av','pn','t']]};
const reading={nodes:[ev('s','shown',{th:'main'}),ev('h','hidden',{th:'main'}),N('w','watch',{per:'pair'}),tb('r','Чтение','post','sum'),N('av','calc',{op:'avg',by:'post'}),N('pn','panel',{m:'read'})],
 wires:[['s','w','start'],['h','w','stop'],['w','r','write'],['r','av','t'],['av','pn','t']]};
const reading13={nodes:[...reading.nodes,ev('i','idle',{n:60})],wires:[...reading.wires,['i','w','reset']]};

const LEVELS=[
{id:'l1',guide:[["add", "post", "Нажми внизу «+ Пост»."], ["wire", "post", "ui", "screen", "ui", "Соедини: нажми кружок «на экран» у Поста, потом «показывает» у Экрана."], ["add", "text", "В телефоне справа появилась пустая карточка. Нажми «+ Текст»."], ["wire", "text", "ui", "post", "inside", "Соедини «Текст» со входом «внутри поста»."]],mods:['post','text'],title:'Первый пост',goal:'Сделай так, чтобы люди увидели пост с текстом.',learn:'блоки и провода',tools:[],events:[],parts:['card','text'],start:'empty',
 stages:[{name:'Пост на экране',screen:['card','text'],scen:[]}],
 hints:['Кнопками внизу добавь на поле блоки «Пост» и «Текст».','Чтобы соединить: нажми кружок справа у одного блока, потом кружок слева у другого.','«Пост» → «Экран телефона», а «Текст» → внутрь «Поста».'],
 after:'Это твои первые блоки. Пока в сети нет вообще ничего, кроме них.',ref:{screen:{card:true,text:true},G:{nodes:[],wires:[]}}},
{id:'l2',guide:[["add", "button", "Нажми «+ Кнопка «Нравится»»."], ["wire", "button", "ui", "post", "inside", "Положи кнопку в пост: «в пост» → «внутри поста»."], ["wire", "button", "press", "button", "on", "Нажми на кнопку в телефоне: ничего. Соедини «её нажали» → «зажечь» и попробуй снова."]],mods:['post','text','button'],title:'Кнопка, которая отвечает',goal:'Добавь кнопку «Нравится». Нажали — кнопка загорается.',learn:'событие и действие',tools:['ev','light'],events:['press'],parts:['card','text','like'],start:'keep',
 stages:[{name:'Загорается',screen:['card','text','like'],scen:L2A}],
 hints:['Добавь блок «Кнопка» и подключи его внутрь «Поста».','У кнопки есть выход «её нажали» и вход «зажечь». Сама она не загорается.','Соедини «её нажали» с «зажечь».'],
 after:'Работает. А теперь в телефоне нажми лайк, потом «Закрыть» и «Открыть». Лайк пропал: сеть нигде его не записала.',ref:{screen:SCR,G:{nodes:[ev('e','press'),N('li','light',{mode:'on'})],wires:[['e','li','e']]}}},
{id:'l3',guide:[["add", "table", "В телефоне нажми лайк, потом «Закрыть» и «Открыть»: лайк пропал. Нужна память: «+ Таблица»."], ["wire", "button", "press", "table", "write", "Пусть нажатие записывается: «её нажали» → «записать»."], ["wire", "table", "out", "button", "lit", "Пусть кнопка смотрит в память: «все строки» → «горит, пока есть строка в»."]],mods:['post','text','button','table','gate'],title:'Не теряй лайки',goal:'Лайк должен пережить закрытие приложения. Чужие кнопки гореть не должны.',learn:'таблица: что хранить и по чему искать',tools:['ev','light','table','gate'],events:['press','open','close'],parts:['card','text','like'],start:'keep',
 stages:[{name:'Закрыл и открыл',scen:L3A},{name:'Дрожит палец',note:'Люди нажимают по два-три раза подряд. В таблице не должно появиться двух лайков одного человека на один пост.',scen:L3B}],
 hints:['Добавь «Таблицу» и подай «её нажали» на вход «записать».','Выход таблицы «все строки» подключи к кнопке: «горит, пока есть строка в».','Строка должна быть одна на пару «человек и пост». Смотри в таблице настройку «повтор».'],
 after:'Теперь сеть помнит. Строк столько, сколько настоящих лайков.',ref:{screen:Object.assign({},SCR,{litBy:'likes'}),G:{nodes:[ev('e','press'),tb('likes','Лайки','pair','set')],wires:[['e','likes','write']]}}},
{id:'l4',mods:['post','text','button','number','table','gate','calc'],title:'Сколько лайков',goal:'Покажи под постом число лайков.',learn:'расчёт: считать каждый раз или копить',tools:['ev','light','table','gate','calc'],events:['press','open','close'],parts:['card','text','like','count'],start:'keep',
 stages:[{name:'Число верное',screen:['card','text','like','count'],scen:L4A},{name:'Передумал',note:'Второе нажатие должно снимать лайк. Кнопка гаснет, число уменьшается.',scen:L4B}],
 hints:['Добавь «Число под постом» внутрь «Поста». Число берётся из блока «Посчитать».','«Посчитать»: сколько строк, для каждого поста.','Чтобы второе нажатие снимало лайк: «её нажали» → два блока «Только если». Строки ещё нет — записать, уже есть — стереть. Оба смотрят на то, что было ДО нажатия.'],
 after:'Ты собрал настоящий лайк. Смотри на расход: «пересчитать» читает всю таблицу, «копить» читает одну строку, но может разойтись с правдой.',ref:{screen:Object.assign({},SCR,{count:true,litBy:'likes',countBy:'c'}),G:counted}},
{id:'l5',mods:['post','text','button','number','table','gate','calc'],title:'12 людей, а лайков 140',goal:'Это чужая сеть, и она врёт. Найди дыры и почини.',learn:'отладка: телефон по шагам',tools:['ev','light','table','gate','calc'],events:['press','open','close'],parts:['card','text','like','count'],start:'broken',
 stages:[{name:'Починено',scen:crowd()}],
 hints:['Нажми «Проверить», потом «Показать по шагам» и читай, что сработало после каждого нажатия.','Дыр две: повторное нажатие пишет ещё раз, а отмены нет совсем.','Проще всего убрать отдельный счётчик и считать строки в «Лайках», где одна строка на человека и пост.'],
 after:'Число, которое копят отдельно, легко расходится с правдой. Это пригодится дальше.',ref:{screen:Object.assign({},SCR,{count:true,litBy:'likes',countBy:'c'}),G:counted},broken:{screen:Object.assign({},SCR,{count:true,litBy:'likes',countBy:'c'}),G:BROKEN}},
{id:'l6',mods:['post','text','button','app','timer','table','gate','calc','panel'],title:'Кто сейчас в сети',goal:'У тебя пустая панель владельца. Выведи на неё, сколько людей сейчас в приложении.',learn:'события приложения, сигнал «я тут», срок жизни строки',tools:['ev','gate','table','calc','panel'],events:['open','close','tick'],parts:[],start:'feed',panel:{m:'online',label:'Сейчас в сети',unit:'чел.'},
 stages:[{name:'Заходят и выходят',scen:L10A},{name:'Села батарейка',note:'У выключенного телефона событие «закрыли» не приходит. Сеть о нём ничего не знает. Проверка даёт 40 секунд, чтобы заметить пропажу.',scen:L10B}],
 hints:['«Приложение» → «открыли» — записать строку про человека, «закрыли» — стереть. Потом «Посчитать» строки и вывести «На панель».','От выключенного телефона ничего не придёт. Пусть живые сами напоминают о себе: блок «Таймер».','У таблицы есть «хранить»: строка исчезнет, если её не обновлять. Срок должен быть больше, чем время между тиками, но не больше 30 секунд.'],
 after:'Так «онлайн» и считают в настоящих сетях: не по выходу, а по тому, кто давно молчит.',ref:{screen:SCR,G:onl}},
{id:'l7',mods:['post','text','button','app','timer','table','gate','watch','calc','panel'],title:'Сколько длится визит',goal:'Сеть не знает, сколько люди в ней сидят. Выведи среднюю длину визита.',learn:'секундомер',tools:['ev','gate','table','watch','calc','panel'],events:['open','close','min','back','tick'],parts:[],start:'feed',panel:{m:'visit',label:'Средний визит',unit:'с'},
 stages:[{name:'Открыл — закрыл',scen:L11A},{name:'Свернул приложение',note:'Люди сворачивают приложение и уходят по делам. Это один визит, но свёрнутое время в него не входит.',scen:L11B}],
 hints:['Секундомер: «пустить», когда открыли, «стоп», когда закрыли. На выходе будет число секунд.','Записывай замеры в таблицу, потом «Посчитать» → среднее → «На панель».','У «Приложения» есть «свернули» и «вернулись», а у секундомера — «пауза» и «дальше».'],
 after:'Посмотри на таблицу замеров. Можно хранить каждый визит, а можно одну строку с суммой и количеством. Что выберешь, то и сможешь спросить потом.',ref:{screen:SCR,G:visit}},
{id:'l8',mods:['post','text','button','app','timer','table','gate','watch','calc','panel'],title:'Сколько читают пост',goal:'Выведи для каждого поста среднее время чтения.',learn:'секундомер на пару «человек и пост», что значит «на экране»',tools:['ev','gate','table','watch','calc','panel'],events:['shown','hidden','open','close'],parts:[],start:'feed',panel:{m:'read',label:'Читают в среднем',unit:'с',per:true},
 stages:[{name:'По одному посту',scen:L12A},{name:'Два поста сразу',note:'На настоящем экране видно несколько постов, а длинный целиком не помещается.',scen:L12B}],
 hints:['У блока «Пост» есть выходы «появился у человека» и «ушёл с экрана». Секундомер ставь «на человека и пост».','Замеры — в таблицу, среднее — «для каждого поста».','В блоке «Пост» выбери, что считать увиденным. Проиграй сценарий по шагам и посмотри, сколько постов запускают секундомер.'],
 after:'Одна настройка «что считать увиденным» меняет все цифры. Панель врала бы молча.',ref:{screen:SCR,G:reading}},
{id:'l9',mods:['post','text','button','app','timer','finger','table','gate','watch','calc','panel'],title:'«Читал» 15 минут',goal:'Панель говорит, что короткую шутку читают по пять минут. Почини замер.',learn:'человек отошёл: пауза или выбросить замер',tools:['ev','gate','table','watch','calc','panel'],events:['shown','hidden','idle','touch','open','close'],parts:[],start:'keep',panel:{m:'read',label:'Читают в среднем',unit:'с',per:true},
 stages:[{name:'Ушёл пить чай',scen:L13A},{name:'Медленные тоже люди',note:'Кто-то читает длинный пост 46 секунд и не трогает экран. А кто-то отходит всего на две минуты.',scen:L13B}],
 hints:['У блока «Палец» есть выход «давно не трогают». Сколько секунд тишины, решаешь ты.','Пауза не спасает: тишина до неё уже попала в замер. Что ещё умеет секундомер?','Подай тишину на «выбросить замер». Слишком короткий срок выбросит медленных читателей, слишком длинный пропустит чайник.'],
 after:'Любой замер где-то обрезает правду. Ты сам решил, где.',ref:{screen:SCR,G:reading13}},
];
const L={LEVELS,NAMES,POSTS};
if(typeof module!=='undefined')module.exports=L;else window.Levels=L;
})();
