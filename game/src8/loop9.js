// ===================== ЛЕНТА.EXE v9 — ИГРОВОЙ ЦИКЛ: клик, ленты-генераторы, множители =====================
// Деньги = секунды внимания × ставка рекламы. Каждое число считается по настоящей симуляции людей:
// клик показывает пост нескольким людям, лента показывает свои посты своим людям; удержание — из interaction().
const RATE=.01; // $ за секунду внимания
const rate=()=>RATE*(1+eff('adEff'));
// ---------- один показ ----------
function view(u,p){const r=interaction(u,p);const d=r.dw;p.views++;p.dwT+=d;tire(u,p);logView(u,p,d);classObs(u,p,d);
 const fd=u.fmtD[p.fmt]||(u.fmtD[p.fmt]=[0,0]);fd[0]++;fd[1]+=d;addWin(d);
 if(Math.random()<r.pr.like){p.likes++;engage(u,p,'l');(p.likers||(p.likers=[])).push(u.id);u.likes.push(p.id);if(u.likes.length>20)u.likes.shift()}
 if(fd[0]>3&&d>fd[1]/fd[0]*1.4){engage(u,p,'d');(p.longers||(p.longers=[])).push(u.id)}
 const h={p:p.id,dw:+d.toFixed(1),sk:r.skip,lk:0,q:0,t:S.t};u.hh.push(h);if(u.hh.length>40)u.hh.shift();(p.viewers||(p.viewers=[])).push(u.id);
 return d}
// ---------- входящие и клик ----------
const inboxCap9=()=>3+eff('inboxCap');const clickReach=()=>3*Math.pow(2,eff('clickPow'));
function predict(p,M){// прогноз: средняя секунда удержания на выборке из 6 человек, без побочных эффектов
 const L=M||S.U;let s=0,n=Math.min(6,L.length);for(let i=0;i<n;i++)s+=interaction(L[Math.floor(Math.random()*L.length)],p).dw;return n?s/n:0}
function inboxTick(){if(S.t>=S.nextIn&&S.inbox.length<inboxCap9()){const p=mkPost(pk(S.U));p.inAt=S.t;p.pred=predict(p);S.inbox.push(p);S.nextIn=S.t+Math.max(1,2-eff('inboxSpeed'))}
 S.inbox=S.inbox.filter(p=>S.t-p.inAt<20)}
function clickPost(id){const i=S.inbox.findIndex(p=>p.id==id);if(i<0)return null;const p=S.inbox.splice(i,1)[0];const n=clickReach();let sum=0;
 for(let k=0;k<n;k++)sum+=view(pk(S.U),p);const $=sum*rate();S.m+=$;S.earned+=$;S.clickEarn=(S.clickEarn||0)+$;S.nClick=(S.nClick||0)+1;S.stat.inc=(S.stat.inc||0)+$;
 p.clickRet=sum/n;S.recent.unshift(p);S.recent.length=Math.min(6,S.recent.length);return {sec:sum/n,$}}
function autoClick(){if(!has('autoClick')||S.t%Math.max(1,4-eff('autoClickSpd')))return;if(!S.inbox.length)return;const p=S.inbox.slice().sort((a,b)=>b.pred-a.pred)[0];const r=clickPost(p.id);if(r&&typeof floatTxt=='function')floatTxt('🤖 +'+r.sec.toFixed(1)+' с · +$'+f(r.$))}
// ---------- аудитории для лент ----------
// «Те, кто залип на таком»: зрители, смотревшие пост дольше обычного, плюс люди, которые по журналу просмотров тоже залипали на эти слова
function lookalike(p){const lem=p.words.map(x=>x.l).filter(Boolean);const ids=new Set(p.longers||[]);
 for(const u of S.U){if(!u.lw||!u.ld||!u.ld[0])continue;const base=u.ld[1]/u.ld[0];for(const l of lem){const o=u.lw[l];if(!o)continue;const n=o[0]+o[2];if(n>=1&&(o[1]+o[3])/n>base*1.25){ids.add(u.id);break}}}
 return [...ids]}
// ---------- ленты-генераторы ----------
const feedCap=()=>1+(has('split')?1:0)+eff('audCap');
const feedBase=i=>5*Math.pow(4,i);
const lvlPrice=F=>Math.round(feedBase(F.i)*Math.pow(1.12,F.lvl)*100)/100;
const MILES=[10,25,50,100,200];
function feedSpeed(F){let m=1;for(const x of MILES)if(F.lvl>=x)m*=1.5;return m*(1+eff('feedSpd'))}
const feedCycle=F=>5/feedSpeed(F);
function feedMembers(F){if(F.aud==null)return S.U;const A=S.aud.find(a=>a.id==F.aud);return A?audMembers(A):S.U}
function candidate(F,M){// пост, который лента покажет: с фильтром — только посты с её словами; с «отбором» — лучший из нескольких по прогнозу
 const pickN=has('pick')?(has('pick5')?5:3):1;let best=null,bv=-1;const fw=F.filter||[];const topics=[...new Set(fw.flatMap(w=>LEMMA_TOPIC[lemmaOf(w)||w]||[]))];
 for(let i=0;i<pickN;i++){let p=null;for(let k=0;k<(fw.length?12:1);k++){const q=mkPost(pk(S.U),topics.length&&Math.random()<.8?{t:pk(topics)}:{});if(!fw.length||fw.some(w=>postHas(q,w))){p=q;break}}if(!p)p=mkPost(pk(S.U));
  const v=pickN>1?predict(p,M):0;if(v>bv||!best){bv=v;best=p}}return best}
function feedTick(F){if(!F.on)return;F.prog=(F.prog||0)+1/feedCycle(F);if(F.prog<1)return;const cycles=Math.floor(F.prog);F.prog-=cycles;
 const M=feedMembers(F).filter(u=>u);if(!M.length)return;const vpp=Math.min(M.length,Math.round(Math.pow(1.5,eff('reach'))));const total=F.lvl*vpp*cycles;
 // честная выборка: до 16 реальных показов, остальное — по их среднему
 const n=Math.min(total,16);let sum=0;for(let k=0;k<n;k++){const u=pk(M);const p=candidate(F,has('pers')?[u]:M);sum+=view(u,p)}const avg=n?sum/n:0;const $=avg*total*rate();
 S.m+=$;S.earned+=$;S.stat.inc=(S.stat.inc||0)+$;F.earn=(F.earn||0)+$;F.ret=F.ret==null?avg:F.ret*.8+avg*.2;F.last=$;F.flash=S.t}
function feedRate(F){const M=feedMembers(F);const vpp=Math.min(M.length,Math.round(Math.pow(1.5,eff('reach'))));return F.lvl*vpp*(F.ret||8)*rate()/feedCycle(F)}
function buyFeed(){if(S.feeds.length>=feedCap())return 'нет места для новой ленты';return ''}
function addFeed(name,aud){const F={id:S.feedN++,i:S.feeds.length,name,aud,lvl:1,prog:0,on:true,filter:[],ret:null};S.feeds.push(F);return F}
function lvlUp(F,n=1){let k=0;while(k<n){const c=lvlPrice(F);if(S.m<c)break;S.m-=c;F.lvl++;k++;if(MILES.includes(F.lvl)&&typeof toast=='function')toast('⚡ «'+esc(F.name)+'» ур. '+F.lvl+': лента крутится в 1,5 раза быстрее')}return k}
// ---------- рост аудитории ----------
function growTick(){const att=S.attH||0;const cap=srvCap();const g=att/600*(.5+(S.avgRet||8)/16)*Math.max(0,1-S.regTotal/cap);for(let i=0;i<Math.floor(g);i++)invite();if(Math.random()<g%1)invite()}
// ---------- шаг ----------
function step(){S.t++;inboxTick();autoClick();const m0=S.m;for(const F of S.feeds)feedTick(F);
 const inc=S.m-m0;S.attH=(S.attH||0)*.9+inc/rate()*.1;growTick();
 if(S.t%10==0){S.statH.push(Object.assign({t:S.t,ret:S.avgRet},S.stat));if(S.statH.length>30)S.statH.shift();S.stat={}}
 S.incS=(S.incS||0)*.9+((S.stat.inc||0)-(S.incPrev||0))*0;labTick();classTick();autoTick();goalsTick();if(typeof S.cpsT=='undefined')S.cpsT=0}
const perSec=()=>{const h=S.statH.slice(-3);const s=h.reduce((a,x)=>a+(x.inc||0),0);return h.length?s/(h.length*10):0};
// ---------- технологии v9 ----------
T8=[
['feed1','Ленты','Лента «Все»','генератор: сам показывает посты всем и приносит деньги',5,[],{}],
['pick','Ленты','Отбор постов','лента выбирает из 3 постов тот, что смотрят дольше',6,['feed1'],{}],
['split','Ленты','Своя аудитория','у продвинутого поста — «Сделать ленту из тех, кто залип»',8,['feed1'],{}],
['clickPow1','Клик','Громкий клик','клик показывает пост вдвое большему числу людей',10,['feed1'],{clickPow:1}],
['dict','Словарь','Словарь','клик по слову в посте — в словарь',13,['split'],{}],
['filter','Ленты','Фильтр ленты','лента берёт только посты со словами, которые ты укажешь',17,['dict'],{}],
['inbox1','Клик','Больше входящих','+2 поста во «Входящих»',22,['clickPow1'],{inboxCap:2}],
['autoClick','Клик','Помощник','сам продвигает лучший пост раз в 4 с',28,['inbox1'],{}],
['reach1','Ленты','Охват ×1,5','каждый пост ленты видят в 1,5 раза больше людей',36,['pick'],{reach:1}],
['aud2','Ленты','Ещё 2 ленты','+2 места для лент',46,['filter'],{audCap:2}],
['groups','Словарь','Группы слов','фильтр ленты — целая группа слов',59,['filter'],{}],
['clickPow2','Клик','Вирусный клик','клик ещё ×2',76,['autoClick'],{clickPow:1}],
['adEff1','Деньги','Баннер получше','+30% денег за секунду внимания',97,['reach1'],{adEff:.3}],
['lab','Лаборатория','Лаборатория','проверь группу слов: есть ли такая аудитория. Найденная категория — лента, которая растёт сама',124,['groups'],{}],
['pick5','Ленты','Отбор из 5','лента выбирает лучший из 5 постов',166,['reach1'],{}],
['forms','Словарь','Словоформы','«машина», «машину» — одно слово',222,['dict'],{}],
['autoClick2','Клик','Помощник быстрее','продвигает раз в 2 с',298,['autoClick'],{autoClickSpd:2}],
['aud3','Ленты','Ещё 3 ленты','+3 места',399,['lab'],{audCap:3}],
['labspd1','Лаборатория','Быстрые исследования','−20% времени',535,['lab'],{labSpeed:1}],
['reach2','Ленты','Охват ×2,25','ещё ×1,5 зрителей',717,['adEff1'],{reach:1}],
['feedSpd1','Ленты','Быстрые ленты','все ленты крутятся на 50% быстрее',960,['reach2'],{feedSpd:.5}],
['labslot1','Лаборатория','Второй слот','два исследования одновременно',1287,['labspd1'],{labSlots:1}],
['users','Пользователи','Наблюдение за людьми','профили, история, что они смотрят',1724,['lab'],{}],
['adEff2','Деньги','Таргетированный баннер','+60% денег',2311,['feedSpd1'],{adEff:.6}],
['labdata1','Лаборатория','Больше данных','лаборатория обрабатывает 75% журнала',3096,['labslot1'],{labData:1}],
['classify','Алгоритм','Определение интересов','машина узнаёт интересы людей',4149,['users'],{}],
['pers','Алгоритм','Персонализация','каждая лента подбирает пост под конкретного человека',5560,['classify'],{}],
['reach3','Ленты','Охват ×3,4','ещё ×1,5 зрителей',7450,['pers'],{reach:1}],
['labacc1','Лаборатория','Точные исследования','меньше ошибок',9983,['labdata1'],{labAcc:1}],
['cf','Алгоритм','Похожие пользователи','персонализация по общим лайкам',13378,['pers'],{}],
['feedSpd2','Ленты','Сверхбыстрые ленты','ещё +100% скорости',17926,['reach3'],{feedSpd:1}],
['fmtPref','Алгоритм','Предпочтения форматов','учитывать, что человек досматривает',24021,['cf'],{}],
['aud4','Ленты','Ещё 5 лент','+5 мест',32188,['classify'],{audCap:5}],
['adEff3','Деньги','Своя рекламная сеть','+100% денег',43132,['fmtPref'],{adEff:1}],
['autoRes','Автоисследование','Автоисследование','машина сама ищет новые категории',57796,['fmtPref','labacc1'],{}],
['autoacc1','Автоисследование','Связи слов','машина группирует слова по смыслу',77447,['autoRes'],{autoAcc:1}],
['autospd1','Автоисследование','Быстрый поиск','исследования чаще',103779,['autoRes'],{autoSpeed:1}],
['autoacc2','Автоисследование','Чистые гипотезы','без лишних слов',139064,['autoacc1'],{autoAcc:1}],
['reach4','Ленты','Охват ×5','ещё ×1,5',186346,['autoacc1'],{reach:1}],
['autoFeed','Автоисследование','Ленты сами','найденная машиной категория сразу становится лентой',249703,['autoacc2'],{}],
['autoacc3','Автоисследование','Редкие интересы','машина замечает редкие темы',334602,['autoFeed'],{autoAcc:1}],
['autonomy','Автоисследование','Автономная система','всё работает само: ×2 ко всем лентам',448367,['autoacc3','reach4'],{feedSpd:1}]];
TECH8=T8.map(([id,b,n,d,p,req,ef],i)=>({id,b,n,d,p,req,ef,i}));
function buy9(id){if(id=='srv'){const c=srvPrice();if(S.m<c)return false;S.m-=c;S.srvLvl++;S.nb++;return true}const ok=buy8(id);if(ok&&id=='feed1'&&!S.feeds.length)addFeed('Все',null);return ok}
GOALS=[['c1','Продвинь первый пост',()=>(S.nClick||0)>0],['f1','Купи ленту «Все»',()=>S.feeds.length>0],['l10','Подними ленту до 10 уровня',()=>S.feeds.some(F=>F.lvl>=10)],['pick','Купи «Отбор постов»',()=>has('pick')],
 ['f2','Сделай вторую ленту из тех, кто залип',()=>S.feeds.length>=2],['w5','Собери 5 слов в словарь',()=>Object.keys(S.dict.words).length>=5],['flt','Поставь ленте фильтр',()=>S.feeds.some(F=>F.filter&&F.filter.length)],
 ['ps1','Доход $1 в секунду',()=>perSec()>=1],['l25','Лента 25 уровня',()=>S.feeds.some(F=>F.lvl>=25)],['ps10','Доход $10 в секунду',()=>perSec()>=10],['lab','Открой лабораторию',()=>has('lab')],['cat1','Подтверди категорию',()=>S.lab.cats.length>0],
 ['cfeed','Сделай ленту из категории',()=>S.feeds.some(F=>{const A=S.aud.find(a=>a.id==F.aud);return A&&A.auto!=null})],['ps100','Доход $100 в секунду',()=>perSec()>=100],['l50','Лента 50 уровня',()=>S.feeds.some(F=>F.lvl>=50)],
 ['pers','Открой персонализацию',()=>has('pers')],['ps1k','Доход $1 000 в секунду',()=>perSec()>=1000],['auto','Открой автоисследование',()=>has('autoRes')],['autoF','Получи категорию, найденную машиной',()=>S.auto.found>0],['l100','Лента 100 уровня',()=>S.feeds.some(F=>F.lvl>=100)],['autonomy','Запусти автономную систему',()=>has('autonomy')]];
// персонализация в лентах: при отборе прогноз считается по конкретному зрителю
const _cand=candidate;
// ленты из найденных машиной категорий
const _labFinish=labFinish;labFinish=function(R){_labFinish(R);const h=S.lab.hyp.find(x=>x.id==R.hid);if(h&&h.auto&&h.res&&(h.res.k=='found'||h.res.k=='partial')&&has('autoFeed')&&S.feeds.length<feedCap()){const C=S.lab.cats.find(c=>c.id==h.res.cat);if(C)catFeed(C)}};
function catFeed(C){if(S.feeds.length>=feedCap())return 'нет места для ленты';if(S.aud.some(a=>a.auto==C.t&&S.feeds.some(F=>F.aud==a.id)))return 'такая лента уже есть';const A={id:S.audN++,name:C.name,auto:C.t,st:[0,0],born:S.t};S.aud.push(A);addFeed(C.name,A.id);return ''}

