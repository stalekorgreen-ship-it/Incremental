// ===================== ЛЕНТА.EXE v10 — АЛГОРИТМ: ПОТОК ДАННЫХ =====================
// Модули соединяются проводами с типами. Источник запускает поток, значения текут по проводам,
// модуль-выход срабатывает, когда на всех его входах есть данные. Ни один модуль не делает всю работу сам.
const DT={post:['Пост','#4cf'],text:['Текст','#fc4'],num:['Число','#8e8'],topic:['Тема','#f8c'],dict:['Словарь','#c9f'],fans:['Справочник','#f96'],user:['Пользователь','#6ff'],posts:['Список постов','#58f'],users:['Список людей','#2cb'],table:['Таблица','#fa0']};
const PSTAT=[['likes','лайки'],['views','просмотры'],['coms','комментарии'],['shares','репосты'],['ret','время удержания, с'],['age','возраст, дней'],['ctr','лайков на 100 просмотров'],['len','длина текста']];
const USTAT=[['age','возраст'],['visits','заходов в день'],['time','минут в день'],['days','дней на платформе'],['likes','лайков всего']];
const pstat=(p,s)=>s=='likes'?p.likes*rep():s=='views'?p.views*rep():s=='coms'?p.coms*rep():s=='shares'?p.shares*rep():s=='ret'?(p.views?p.att/p.views:0):s=='age'?(S.t-p.born)/TICK_DAY:s=='ctr'?(p.views?p.likes/p.views*100:0):p.len;
const ustat=(u,s)=>s=='age'?u.age:s=='visits'?u.v:s=='time'?(u.timeAvg||0):s=='days'?(S.t-u.join)/TICK_DAY:(u.lk||[]).length;
function avgStat(s){const k='avg_'+s;if(S._avgT!=dayNo()){S._avg={};S._avgT=dayNo()}if(S._avg[k]==null){const L=S.P;S._avg[k]=L.length?L.reduce((a,p)=>a+pstat(p,s),0)/L.length:0}return S._avg[k]}
const pp=id=>{const p=postById(id);return p&&S.P.includes(p)&&!p.blocked?p:null};
// [id, группа, название, описание, входы, выходы, параметры, функция(входы,парам,контекст)→выходы]
const DFL=[
// --- источники ---
['src_new','src','Пост в алгоритме','новый пост, один раз при публикации',[],[['post','Пост']],[],(I,P,c)=>[c.trig=='new'?c.p:null]],
['src_feed','src','Пост в ленте','каждый пост в ленте, раз в день',[],[['post','Пост']],[],(I,P,c)=>[c.trig=='feed'?c.p:null]],
['src_arch','src','Пост уходит в архив','его забыли — последний шанс',[],[['post','Пост']],[],(I,P,c)=>[c.trig=='arch'?c.p:null]],
['src_user','src','Пользователь в сети','человек открыл соцсеть',[],[['user','ID юзера']],[],(I,P,c)=>[c.trig=='user'?c.u:null]],
// --- данные ---
['kn_dict','data','Словарь слов и тем','слова, которые ты изучил (окно «Словарь»)',[],[['dict','Словарь']],[],()=>[S.know.dict]],
['kn_fans','data','Справочник любителей темы','кто какие темы лайкает',[],[['fans','Справочник']],[],()=>[S.know.fans]],
['c_num','data','Число','',[],[['num','Число']],[['n','','num',10]],(I,P)=>[+P.n]],
['avg','data','Взять среднее по ленте','среднее значение по всем постам',[],[['num','Информация']],[['s','','pstat','likes']],(I,P)=>[avgStat(P.s)]],
// --- извлечение ---
['ex_text','ext','Вытащить текст','',[['post','Пост']],[['text','Текст'],['post','Пост']],[],(I)=>[I[0].lem,I[0]]],
['ex_stat','ext','Взять показатель поста','',[['post','Пост']],[['num','Число'],['post','Пост']],[['s','','pstat','likes']],(I,P)=>[pstat(I[0],P.s),I[0]]],
['p_author','ext','Автор поста','',[['post','Пост']],[['user','Автор'],['post','Пост']],[],(I)=>[byId(I[0].au)||null,I[0]]],
['u_stat','ext','Взять показатель человека','',[['user','Пользователь']],[['num','Число'],['user','Пользователь']],[['s','','ustat','age']],(I,P)=>[ustat(I[0],P.s),I[0]]],
['u_likes','ext','Получить лайки пользователя','последние 20 лайкнутых постов',[['user','ID юзера']],[['posts','ID постов']],[],(I)=>[(I[0].lk||[]).slice()]],
['who','ext','Найти взаимодействовавших с постами','кто ещё лайкнул эти посты',[['posts','ID постов']],[['table','Таблица']],[],(I,P,c)=>{const T={};for(const id of I[0]){const p=postById(id);if(p&&p.likers)for(const u of p.likers)if(!c.u||u!=c.u.id)T[u]=(T[u]||0)+1}return [T]}],
['their_likes','ext','Их лайки','все посты, которые лайкнули эти люди',[['users','Люди']],[['posts','ID постов']],[],(I)=>{const s=new Set();for(const id of I[0]){const u=byId(id);if(u&&u.lk)u.lk.forEach(x=>s.add(x))}return [[...s]]}],
// --- обработка ---
['topic','proc','Определить тему','по словам из словаря; без знакомых слов — темы нет',[['text','Текст'],['dict','Словарь'],['post','Пост']],[['topic','Тема'],['post','Пост']],[],(I)=>{const v={};for(const w of I[0]){const c=I[1][w];if(c!=null)v[c]=(v[c]||0)+1}let b=null,bn=0;for(const k in v)if(v[k]>bn){bn=v[k];b=+k}if(b!=null)I[2].topic=b;return [b,I[2]]}],
['topic_is','proc','Тема равна','',[['topic','Тема'],['post','Пост']],[['post','Да'],['post','Нет']],[['c','','cat',0]],(I,P)=>I[0]==+P.c?[I[1],null]:[null,I[1]]],
['has_word','proc','Есть слово','с учётом словоформ',[['text','Текст'],['post','Пост']],[['post','Да'],['post','Нет']],[['w','','text','']],(I,P)=>{const w=lemma(normW(P.w||''));return w&&I[0].includes(w)?[I[1],null]:[null,I[1]]}],
['cmp','proc','Сравнить с','А > Б → пост идёт в верхний выход',[['num','Число А'],['num','Число Б'],['post','Пост']],[['post','А > Б'],['post','А ≤ Б']],[],(I)=>I[0]>I[1]?[I[2],null]:[null,I[2]]],
['cmp_u','proc','Сравнить (человек)','',[['num','Число А'],['num','Число Б'],['user','Пользователь']],[['user','А > Б'],['user','А ≤ Б']],[],(I)=>I[0]>I[1]?[I[2],null]:[null,I[2]]],
['mul','proc','Умножить','',[['num','Число'],['num','Число']],[['num','Число']],[],(I)=>[I[0]*I[1]]],
['every','proc','Каждые N','пропускает каждый N-й',[['post','Пост']],[['post','Пост']],[['n','','num',3]],(I,P,c,N)=>{N.cnt=(N.cnt||0)+1;return [N.cnt%Math.max(1,+P.n)?null:I[0]]}],
['rand','proc','Случайно, N%','',[['post','Пост']],[['post','Да'],['post','Нет']],[['n','','num',50]],(I,P)=>Math.random()*100<+P.n?[I[0],null]:[null,I[0]]],
['sim','proc','Рассчитать сходство пользователей','сколько общих лайков с каждым',[['user','Пользователь'],['users','Люди']],[['table','Таблица']],[],(I)=>{const a=new Set(I[0].lk||[]);const T={};for(const id of I[1]){const u=byId(id);if(!u||!u.lk)continue;let n=0;for(const x of u.lk)if(a.has(x))n++;if(n)T[id]=n}return [T]}],
['sort','proc','Отсортировать по совпадению','таблица → список людей, самые похожие сверху',[['table','Таблица']],[['users','Люди']],[],(I)=>[Object.entries(I[0]).sort((a,b)=>b[1]-a[1]).map(x=>+x[0])]],
['take_u','proc','Взять первых N людей','',[['users','Люди']],[['users','Люди']],[['n','','num',10]],(I,P)=>[I[0].slice(0,+P.n)]],
['sort_p','proc','Отсортировать посты по','',[['posts','ID постов']],[['posts','ID постов']],[['s','','pstat','likes']],(I,P)=>[I[0].filter(pp).sort((a,b)=>pstat(postById(b),P.s)-pstat(postById(a),P.s))]],
['take_p','proc','Взять первые N постов','',[['posts','ID постов']],[['posts','ID постов']],[['n','','num',5]],(I,P)=>[I[0].slice(0,+P.n)]],
['unseen','proc','Убрать уже увиденное','',[['user','Пользователь'],['posts','ID постов']],[['posts','ID постов']],[],(I)=>{const s=new Set(I[0].hist.slice(0,60).map(h=>h.p));return [I[1].filter(id=>!s.has(id)&&pp(id))]}],
['tmp','proc','Составить временный список','копит посты за день, отдаёт список',[['post','Пост']],[['posts','ID постов']],[],(I,P,c,N)=>{if(N._d!=dayNo()){N._d=dayNo();N._p=N._l||[];N._l=[]}if(I[0]==null)return [N._l.length?N._l.slice():(N._p||[]).slice()];if(!N._l.includes(I[0].id))N._l.push(I[0].id);N._l=N._l.slice(-50);return [N._l.slice()]}],
// --- выходы ---
['o_alg','out','Отправить в алгоритм','пост снова как новый',[['post','Пост']],[],[],(I,P,c)=>{c.m.resend=true;return 'отправлен заново'}],
['o_arch','out','Отправить в архив','',[['post','Пост']],[],[],(I,P,c)=>{c.m.arch=true;return 'в архив'}],
['o_up','out','Поднять в ленте','',[['post','Пост']],[],[['n','+','num',2]],(I,P,c)=>{c.m.boost+=+P.n;c.m.rc[c.nid]=(c.m.rc[c.nid]||0)+ +P.n;return '+'+P.n}],
['o_down','out','Опустить в ленте','',[['post','Пост']],[],[['n','−','num',2]],(I,P,c)=>{c.m.boost-=+P.n;return '−'+P.n}],
['o_block','out','Заблокировать показ','',[['post','Пост']],[],[],(I,P,c)=>{c.m.block=true;return 'заблокирован'}],
['o_fans','out','Отправить пост любителям темы','поднимает пост для тех, кто в справочнике, остальным — ниже',[['post','Пост'],['topic','Тема'],['fans','Справочник']],[],[],(I,P,c)=>{c.m.fan=I[1];c.m.fanN=c.nid;return 'любителям «'+CATS[I[1]]+'» ('+Object.keys(I[2][I[1]]||{}).length+' чел.)'}],
['o_show','out','Показать пользователю','эти посты пойдут ему первыми',[['user','Пользователь'],['posts','ID постов']],[],[],(I,P,c)=>{c.m.inj=I[1].filter(pp).slice(0,10);c.m.injN=c.nid;return c.m.inj.length+' постов'}],
['o_learnf','out','Пополнить справочник','лайкнувшие пост записываются в любители темы',[['post','Пост'],['topic','Тема']],[],[],(I,P,c)=>{if(c.dry)return 'записал бы '+(I[0].likers||[]).length;const F=S.know.fans[I[1]]=S.know.fans[I[1]]||{};for(const u of (I[0].likers||[]))F[u]=1;return 'записано '+(I[0].likers||[]).length}],
['o_learnd','out','Изучить слова','незнакомые слова поста записываются в словарь под этой темой',[['text','Текст'],['topic','Тема']],[],[],(I,P,c)=>{let n=0;for(const w of I[0])if(w.length>=4&&S.know.dict[w]==null){if(!c.dry)S.know.dict[w]=I[1];n++}return (c.dry?'изучил бы ':'изучено ')+n}]];
const NT={};DFL.forEach(([id,g,n,d,ins,outs,p,f])=>NT[id]={id,g,n,d,ins,outs,p,f});
const NGN={src:'Источники',data:'Данные',ext:'Извлечение',proc:'Обработка',out:'Выходы'};
const ntOk=()=>true;function BP_SHOP(){return []}
// ---------- выполнение ----------
const bpNode=id=>S.bp.nodes.find(n=>n.id==id);
let BP_PICK=false,BP_USER=false,PICKN=0;
function bpIndex(){BP_USER=S.bp.nodes.some(n=>n.t=='src_user');for(const N of S.bp.nodes)N.in=N.in||[]}
function evalN(N,c){if(c.memo.has(N.id))return c.memo.get(N.id);c.memo.set(N.id,[]);const T=NT[N.t];const I=T.ins.map((x,i)=>{const w=N.in[i];if(!w)return null;const A=bpNode(w.n);if(!A)return null;const v=evalN(A,c)[w.o];return v===undefined?null:v});
 let out;if(I.some(v=>v==null)&&N.t!='tmp')out=T.outs.map(()=>null);else{c.nid=N.id;out=T.f(I,N.p,c,N)}if(out.some(v=>v!=null)){if(!c.dry)N.hits=(N.hits||0)+1;if(c.trace)c.trace.push({n:N.id,v:out})}c.memo.set(N.id,out);return out}
function runTrig(trig,c){c.trig=trig;c.memo=new Map();c.m=c.m||newM();for(const N of S.bp.nodes){const T=NT[N.t];if(T.g!='out')continue;const I=T.ins.map((x,i)=>{const w=N.in&&N.in[i];if(!w)return null;const A=bpNode(w.n);return A?evalN(A,c)[w.o]:null});
 if(I.some(v=>v==null))continue;c.nid=N.id;const r=T.f(I,N.p,c,N);if(!c.dry)N.hits=(N.hits||0)+1;if(c.trace)c.trace.push({n:N.id,v:[r],out:1});if(c.path)c.path.push(N.id)}return c}
const newM=()=>({boost:0,block:false,rc:{},resend:false,arch:false,fan:null,inj:null});
function applyM(p,m,ev,path){p.boost=m.boost+(p.bNew||0);p.rc=m.rc;if(m.block&&!p.blocked){p.blocked=true;p.autoBlock=true}if(m.fan!=null){p.fanCat=m.fan;p.audN=m.fanN}
 if(path&&path.length){p.log.unshift({ev,path:path.slice(0,10),t:S.t});p.log.length=Math.min(6,p.log.length)}}
function runPost(p,first){const c=runTrig(first?'new':'feed',{p,steps:0,path:[]});const m=c.m;if(first)p.bNew=m.boost,p.boost=0;applyM(p,m,first?'Новый пост':'Проверка',c.path);p.ruleOk=true;if(m.resend)resendPost(p);if(m.arch)TOARCH.push(p)}
let TOARCH=[],RCUR=0;
function requeue(){bpIndex();S.queue.rules=S.P.length;RCUR=0;S.recalcTotal=S.P.length}
function rulesWork(n){for(let i=0;i<n;i++){if(!S.P.length)break;RCUR=RCUR%S.P.length;runPost(S.P[RCUR++],false)}flushArch()}
function flushArch(){for(const p of TOARCH)if(S.P.includes(p))archive(p);TOARCH=[]}
function newPostsToQueue(){if(!S.bp.nodes.length){S.P.forEach(p=>{if(!p.ruleOk)p.ruleOk=true});return}for(const p of S.P)if(!p.ruleOk)runPost(p,true);flushArch();
 if(S.t%TICK_DAY==0&&!S.queue.rules&&S.bp.nodes.some(n=>n.t=='src_feed'))requeue()}
function resendPost(p){p.born=S.t;p.lastV=S.t;p.dayViews=0;p.resent=(p.resent||0)+1}
function bpArchive(p){if(!S.bp.nodes.some(n=>n.t=='src_arch'))return false;const c=runTrig('arch',{p,path:[]});if(c.m.resend){applyM(p,c.m,'Уход в архив',c.path);resendPost(p);return true}return false}
function runUser(u){if(!BP_USER)return;const c=runTrig('user',{u});if(c.m.inj){u.inj=c.m.inj;u.injN=c.m.injN}}
// ---------- влияние на показы ----------
function injPick(u){while(u.inj&&u.inj.length){const p=pp(u.inj.shift());if(p){PICKN=u.injN;return p}}return null}
function audBoost(u,p){if(p.fanCat!=null){const F=S.know.fans[p.fanCat];return F&&F[u.id]?3:-1.5}return 0}
function ruleEffectTick(){if(!S.bp.nodes.length)return;for(const p of S.P){if(!p.rc)continue;const now=p.att-(p.attPrev||0);p.attPrev=p.att;if(!now)continue;
 for(const id in p.rc){const N=bpNode(+id);if(!N)continue;const v=p.rc[id];if(v>0){const sc=Math.max(.5,score(p));N.effD=(N.effD||0)+now*rep()/60*Math.min(1,v/sc)}}}}
// ---------- правка схемы ----------
function bpAdd(t,x,y){const N={id:S.bp.nid++,t,x:Math.round(x),y:Math.round(y),p:{},in:[],hits:0,eff7:[],effD:0};for(const[k,,ty,def]of NT[t].p)N.p[k]=def;S.bp.nodes.push(N);requeue();return N}
function bpDel(id){S.bp.nodes=S.bp.nodes.filter(n=>n.id!=id);for(const n of S.bp.nodes)n.in=n.in.map(w=>w&&w.n==id?null:w);requeue()}
function bpLink(a,o,b,i){const A=bpNode(a),Bn=bpNode(b);if(!A||!Bn||a==b)return 'нельзя соединить модуль сам с собой';const ta=NT[A.t].outs[o][0],tb=NT[Bn.t].ins[i][0];if(ta!=tb)return 'типы не совпадают: '+DT[ta][0]+' → '+DT[tb][0];Bn.in[i]={n:a,o};requeue();return ''}
// ---------- словарь: игрок изучает слова сам, потом может автоматизировать модулем «Изучить слова» ----------
function unknownWords(n){const C={};for(const p of S.P)for(const w of p.lem)if(w.length>=4&&S.know.dict[w]==null)C[w]=(C[w]||0)+1;return Object.entries(C).sort((a,b)=>b[1]-a[1]).slice(0,n)}
function wordHint(w){const C={};for(const p of S.P)if(p.lem.includes(w))for(const c of p.cats)C[c]=(C[c]||0)+1;return Object.entries(C).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>+x[0])}
// ---------- готовые стартовые схемы (для теста) ----------
function bpStarter(){if(S.bp.nodes.length)return;const L=(a,o,b,i)=>bpLink(a.id,o,b.id,i);
 const s=bpAdd('src_new',20,40),t=bpAdd('ex_text',250,30),d=bpAdd('kn_dict',250,190),tp=bpAdd('topic',500,60),fa=bpAdd('kn_fans',500,250),of=bpAdd('o_fans',780,60);L(s,0,t,0);L(t,0,tp,0);L(d,0,tp,1);L(t,1,tp,2);L(tp,1,of,0);L(tp,0,of,1);L(fa,0,of,2);
 const f=bpAdd('src_feed',20,400),st=bpAdd('ex_stat',250,390),av=bpAdd('avg',250,540),cm=bpAdd('cmp',500,420),up=bpAdd('o_up',780,380),ar=bpAdd('o_down',780,520);st.p.s='ret';av.p.s='ret';L(f,0,st,0);L(st,0,cm,0);L(av,0,cm,1);L(st,1,cm,2);L(cm,0,up,0);L(cm,1,ar,0)}
