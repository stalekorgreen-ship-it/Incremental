// ===================== ЛЕНТА.EXE v10 — АЛГОРИТМ НА БЛУПРИНТАХ =====================
// Схема = узлы + провода. События запускают поток, условия ветвят (да/нет), действия меняют судьбу поста.
// g: ev — событие, cond — условие поста, ucond — условие пользователя (только в «Подборе»), flow — логика, act — действие с постом, uact — действие для пользователя
const intOf=(u,p)=>{let m=0;for(const c of p.cats)m=Math.max(m,u.it[c]);return m};
const NTL=[
// --- события ---
['ev_new','ev','Новый пост','срабатывает один раз, когда пост опубликован',0,'rules',[],null],
['ev_check','ev','Ежедневная проверка','каждый день проходит по всем постам в ленте',30,'rules',[],null],
['ev_arch','ev','Пост уходит в архив','пост забыли — можно вернуть его в алгоритм',200,'ev_check',[],null],
['ev_pick','ev','Подбор для пользователя','каждый раз, когда человеку подбирается пост: условия про человека',450,'ev_check',[],null],
// --- условия поста ---
['c_word','cond','Содержит слово','с учётом словоформ',0,'rules',[['w','слово','text','']],(c,P)=>{const w=normW(P.w||'');return !!w&&(c.p.words.includes(w)||c.p.lem.includes(lemma(w)))}],
['c_views','cond','Просмотров больше','',18,'rules',[['n','','num',100]],(c,P)=>c.p.views*rep()>+P.n],
['c_likes','cond','Лайков больше','',40,'rules',[['n','','num',10]],(c,P)=>c.p.likes*rep()>+P.n],
['c_coms','cond','Комментариев больше','',70,'c_likes',[['n','','num',5]],(c,P)=>c.p.coms*rep()>+P.n],
['c_shares','cond','Репостов больше','',120,'c_likes',[['n','','num',3]],(c,P)=>c.p.shares*rep()>+P.n],
['c_ctr','cond','Лайков на 100 просмотров больше','насколько пост нравится',150,'c_likes',[['n','','num',10]],(c,P)=>c.p.views>4&&c.p.likes/c.p.views*100>+P.n],
['c_vel','cond','Просмотров за день больше','пост набирает обороты',160,'c_views',[['n','','num',50]],(c,P)=>c.p.dayViews*rep()>+P.n],
['c_age','cond','Старше N дней','',90,'rules',[['n','','num',2]],(c,P)=>(S.t-c.p.born)/TICK_DAY>+P.n],
['c_rand','cond','Случайно, N%','',80,'rules',[['n','','num',50]],(c,P)=>Math.random()*100<+P.n],
['c_media','cond','Есть фото или видео','',110,'rules',[],c=>!!c.p.media],
['c_video','cond','Это видео','',130,'c_media',[],c=>c.p.media=='видео'],
['c_len','cond','Длиннее N знаков','',150,'rules',[['n','','num',120]],(c,P)=>c.p.len>+P.n],
['c_cat','cond','Тематика','',170,'rules',[['c','','cat',0]],(c,P)=>c.p.cats.includes(+P.c)],
['c_tone','cond','Тональность','',220,'c_cat',[['t','','tone',0]],(c,P)=>c.p.tone==+P.t],
['c_emo','cond','Эмоциональность больше','',300,'c_tone',[['n','','num',60]],(c,P)=>c.p.emo>+P.n],
['c_news','cond','Связан с новостью','пост о текущем событии',250,'c_word',[],c=>!!c.p.ev],
['c_comtone','cond','Злых комментариев больше, %','',430,'c_coms',[['n','','num',40]],(c,P)=>{const n=c.p.comments.length;return n>=3&&c.p.comments.filter(x=>x.tone==0).length/n*100>+P.n}],
['c_comact','cond','Комментариев в день больше','',460,'c_coms',[['n','','num',5]],(c,P)=>c.p.coms*rep()/Math.max(1,(S.t-c.p.born)/TICK_DAY)>+P.n],
['c_auth','cond','Автор — новичок (меньше N дней)','',350,'c_age',[['n','','num',10]],(c,P)=>{const a=byId(c.p.au);return !!a&&(S.t-a.join)/TICK_DAY<+P.n}],
['c_resent','cond','Переотправлен меньше N раз','',260,'a_resend',[['n','','num',2]],(c,P)=>(c.p.resent||0)<+P.n],
// --- условия пользователя ---
['u_int','ucond','Человеку интересна тема поста','интерес к тематике поста ≥ N',470,'ev_pick',[['n','','num',50]],(c,P)=>intOf(c.u,c.p)>=+P.n],
['u_cat','ucond','Интерес человека к категории','',500,'ev_pick',[['c','','cat',0],['n','≥','num',50]],(c,P)=>c.u.it[+P.c]>=+P.n],
['u_like','ucond','Лайкал то же, что лайкнувшие пост','похожие вкусы',560,'ev_pick',[],c=>likeMatch(c.u,c.p)],
['u_age','ucond','Возраст человека','от и до',520,'ev_pick',[['a','от','num',14],['b','до','num',25]],(c,P)=>c.u.age>=+P.a&&c.u.age<=+P.b],
['u_reg','ucond','Регион человека','',540,'ev_pick',[['r','','reg',0]],(c,P)=>c.u.reg==+P.r],
['u_regau','ucond','Из одного региона с автором','',580,'u_reg',[],c=>{const a=byId(c.p.au);return !!a&&a.reg==c.u.reg}],
['u_new','ucond','Новичок (меньше N дней)','',600,'ev_pick',[['n','','num',7]],(c,P)=>(S.t-c.u.join)/TICK_DAY<+P.n],
['u_bored','ucond','Заходит всё реже','может скоро уйти',640,'u_new',[],c=>c.u.v<c.u.visits*.6],
['u_seen','ucond','Уже видел этот пост','',620,'ev_pick',[],c=>c.u.hist.some(h=>h.p==c.p.id)],
['u_argue','ucond','Любит спорить, ≥ N%','',680,'u_like',[['n','','num',40]],(c,P)=>c.u.argue*100>=+P.n],
// --- логика ---
['f_seq','flow','Последовательность','запускает обе ветки по очереди',140,'rules',[],null],
['f_every','flow','Каждый N-й раз','пропускает дальше только каждый N-й проход',280,'f_seq',[['n','','num',3]],null],
// --- действия с постом ---
['a_boost','act','Повысить приоритет','+N к рейтингу поста',0,'rules',[['n','+','num',2]],(c,P)=>{c.m.boost+=+P.n;c.m.rc[c.nid]=(c.m.rc[c.nid]||0)+ +P.n}],
['a_limit','act','Ограничить распространение','пост почти не показывается',0,'rules',[],c=>{c.m.lim=true;c.m.rc[c.nid]=-1}],
['a_lower','act','Понизить приоритет','−N к рейтингу',45,'rules',[['n','−','num',2]],(c,P)=>{c.m.boost-=+P.n;c.m.rc[c.nid]=(c.m.rc[c.nid]||0)-+P.n}],
['a_block','act','Заблокировать','пост исчезает из ленты',100,'a_limit',[],c=>{c.m.block=true}],
['a_pin','act','Закрепить наверху на N дней','+5 к рейтингу на срок',190,'a_boost',[['n','','num',2]],(c,P)=>{c.m.pin=Math.max(c.m.pin||0,+P.n);c.m.rc[c.nid]=5}],
['a_resend','act','Отправить заново в алгоритм','пост снова как новый: свежий и в начале ленты',230,'ev_check',[],c=>{c.m.resend=true}],
['a_arch','act','Отправить в архив','',210,'ev_check',[],c=>{c.m.arch=true}],
['a_aud_int','act','Показывать только тем, кому интересна тема','интерес к тематике поста ≥ N',400,'ev_check',[['n','≥','num',50]],(c,P)=>{c.m.aud.push({k:'int',n:+P.n,nid:c.nid})}],
['a_aud_cat','act','Показывать только интересующимся категорией','',460,'a_aud_int',[['c','','cat',0],['n','≥','num',50]],(c,P)=>{c.m.aud.push({k:'cat',c:+P.c,n:+P.n,nid:c.nid})}],
['a_aud_like','act','Показывать тем, кто лайкал то же','люди с такими же лайками, как у лайкнувших',480,'a_aud_int',[],c=>{c.m.aud.push({k:'like',nid:c.nid})}],
['a_aud_reg','act','Показывать только региону автора','',420,'a_aud_int',[],c=>{c.m.aud.push({k:'reg',nid:c.nid})}],
['a_aud_age','act','Показывать ровесникам автора','±N лет',440,'a_aud_int',[['n','±','num',5]],(c,P)=>{c.m.aud.push({k:'age',n:+P.n,nid:c.nid})}],
// --- действия для пользователя ---
['a_u_boost','uact','Поднять для этого человека','+N к рейтингу поста только для него',450,'ev_pick',[['n','+','num',3]],(c,P)=>{c.m.add+=+P.n}],
['a_u_skip','uact','Не показывать этому человеку','',470,'ev_pick',[],c=>{c.m.skip=true}]];
const NT={};NTL.forEach(([id,g,n,d,pr,req,p,run])=>NT[id]={id,g,n,d,pr,req,p,run});
const NGN={ev:'События',cond:'Условия: пост',ucond:'Условия: человек',flow:'Логика',act:'Действия: пост',uact:'Действия: человек'};
const ntOk=id=>NT[id].pr?has('m_'+id):has('rules');
function BP_SHOP(){return NTL.filter(x=>x[4]).map(([id,g,n,d,pr,req])=>['m_'+id,'Модуль · '+NGN[g],n,d||'новый модуль для схемы',pr,req=='rules'?'rules':NT[req].pr?'m_'+req:'rules'])}
const outsOf=N=>{const g=NT[N.t].g;return g=='cond'||g=='ucond'?['yes','no']:N.t=='f_seq'?['a','b']:['next']};
const OUTN={yes:'да',no:'нет',a:'1',b:'2',next:'▶'};
// ---------- выполнение ----------
const bpNode=id=>S.bp.nodes.find(n=>n.id==id);
let BP_PICK=false;
function bpIndex(){BP_PICK=S.bp.nodes.some(n=>n.t=='ev_pick'&&n.o.next)}
function walk(id,c,d){if(d>40||c.steps++>200)return;const N=bpNode(id);if(!N)return;const T=NT[N.t];if(!ntOk(N.t))return;N.hits=(N.hits||0)+1;if(c.path)c.path.push(N.id);
 if(T.g=='cond'||T.g=='ucond'){if(T.g=='ucond'&&!c.u)return;walk(N.o[T.run(c,N.p)?'yes':'no'],c,d+1);return}
 if(N.t=='f_seq'){walk(N.o.a,c,d+1);walk(N.o.b,c,d+1);return}
 if(N.t=='f_every'){N.cnt=(N.cnt||0)+1;if(N.cnt%Math.max(1,+N.p.n))return;walk(N.o.next,c,d+1);return}
 if(T.g=='act'&&!c.u||T.g=='uact'&&c.u){c.nid=N.id;T.run(c,N.p)}walk(N.o.next,c,d+1)}
function runEv(t,c){for(const N of S.bp.nodes)if(N.t==t&&ntOk(t)){N.hits=(N.hits||0)+1;walk(N.o.next,c,0)}}
const newM=()=>({boost:0,lim:false,block:false,aud:[],rc:{},pin:0,resend:false,arch:false});
function applyM(p,m,ev,path){if(m.pin)p.pinUntil=S.t+m.pin*TICK_DAY;const pin=p.pinUntil>S.t?5:0;
 p.boost=m.lim?-8:m.boost+pin;p.ruleLim=m.lim;p.rc=m.rc;if(m.block&&!p.blocked){p.blocked=true;p.autoBlock=true}
 p.audF=m.aud;p.audN=m.aud.length?m.aud[0].nid:null;if(m.aud.some(a=>a.k=='like'))p.lset=likeSet(p);
 if(path&&path.length>1){p.log.unshift({ev,path:path.slice(0,14),t:S.t});p.log.length=Math.min(6,p.log.length)}}
function runPost(p,first){const m=newM();const c={p,m,steps:0,path:[]};if(first)runEv('ev_new',c);else Object.assign(m,JSON.parse(JSON.stringify(p.mNew||newM())));
 if(first)p.mNew=JSON.parse(JSON.stringify(m));const pathN=c.path.length;runEv('ev_check',c);applyM(p,m,first?'Новый пост':'Проверка',c.path);p.ruleOk=true;
 if(m.resend)resendPost(p);if(m.arch)TOARCH.push(p)}
let TOARCH=[],RCUR=0;
function requeue(){bpIndex();S.queue.rules=S.P.length;RCUR=0;S.recalcTotal=S.P.length}
function rulesWork(n){for(let i=0;i<n;i++){if(!S.P.length)break;RCUR=RCUR%S.P.length;runPost(S.P[RCUR++],false)}flushArch()}
function flushArch(){for(const p of TOARCH)if(S.P.includes(p))archive(p);TOARCH=[]}
function newPostsToQueue(){if(!S.bp.nodes.length){S.P.forEach(p=>{if(!p.ruleOk)p.ruleOk=true});return}
 for(const p of S.P)if(!p.ruleOk)runPost(p,true);flushArch();
 if(S.t%TICK_DAY==0&&!S.queue.rules&&S.bp.nodes.some(n=>n.t=='ev_check'))requeue()}
function resendPost(p){p.born=S.t;p.lastV=S.t;p.dayViews=0;p.resent=(p.resent||0)+1}
function bpArchive(p){if(!S.bp.nodes.some(n=>n.t=='ev_arch'))return false;const m=newM();const c={p,m,steps:0,path:[]};runEv('ev_arch',c);if(m.resend){applyM(p,m,'Уход в архив',c.path);resendPost(p);return true}return false}
// ---------- аудитория ----------
function likeSet(p){const s=new Set();for(const id of (p.likers||[])){const u=byId(id);if(u&&u.lk)for(const x of u.lk)if(x!=p.id)s.add(x)}return s}
function likeMatch(u,p){if(!u.lk||!u.lk.length)return false;if(!p.lset||p._lsT!=dayNo()){p.lset=likeSet(p);p._lsT=dayNo()}for(const x of u.lk)if(p.lset.has(x))return true;return false}
function audOk(u,p,a){if(a.k=='int')return intOf(u,p)>=a.n;if(a.k=='cat')return u.it[a.c]>=a.n;if(a.k=='like')return likeMatch(u,p);const au=byId(p.au);if(!au)return true;if(a.k=='reg')return u.reg==au.reg;if(a.k=='age')return Math.abs(u.age-au.age)<=a.n;return true}
function audBoost(u,p){let s=0;if(p.audF&&p.audF.length)for(const a of p.audF)if(!audOk(u,p,a))return -50;
 if(BP_PICK){const m={add:0,skip:false};runEv('ev_pick',{p,u,m,steps:0});if(m.skip)return -50;s+=m.add}return s}
// ---------- эффект модулей: добавленные минуты внимания ----------
function ruleEffectTick(){if(!S.bp.nodes.length)return;for(const p of S.P){if(!p.rc)continue;const now=p.att-(p.attPrev||0);p.attPrev=p.att;if(!now)continue;
 for(const id in p.rc){const N=bpNode(+id);if(!N)continue;const v=p.rc[id];if(v>0){const sc=Math.max(.5,score(p));N.effD=(N.effD||0)+now*rep()/60*Math.min(1,v/sc)}}}
 // ограниченные посты: сколько внимания у них «отняли» (их показывают другим постам — считаем как ноль)
}
// ---------- правка схемы ----------
function bpAdd(t,x,y){const N={id:S.bp.nid++,t,x:Math.round(x),y:Math.round(y),p:{},o:{},hits:0,eff7:[],effD:0};for(const[k,,ty,def]of NT[t].p)N.p[k]=def;S.bp.nodes.push(N);requeue();return N}
function bpDel(id){S.bp.nodes=S.bp.nodes.filter(n=>n.id!=id);for(const n of S.bp.nodes)for(const k in n.o)if(n.o[k]==id)delete n.o[k];requeue()}
function bpLink(a,o,b){const A=bpNode(a);if(!A||a==b||NT[bpNode(b).t].g=='ev')return false;A.o[o]=b;requeue();return true}
