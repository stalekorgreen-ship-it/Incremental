// ===================== ЛЕНТА.EXE v10 — ЯДРО СИМУЛЯЦИИ (по диздоку, ред. 2) =====================
const NAV=100,PHOTOS=100;
// 1 игровой день = 10 с (10 тиков). Времени суток нет. Деньги = минуты внимания × ставка рекламы + аналитика − серверы.
const pk=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sigm=x=>1/(1+Math.exp(-x));
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const f=n=>{n=+n||0;const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(2)+' млрд':a>=1e6?(n/1e6).toFixed(2)+' млн':a>=1e4?(n/1e3).toFixed(1)+' тыс.':a<10&&a%1?n.toFixed(2):Math.round(n).toLocaleString('ru')};
const normW=w=>w.toLowerCase().replace(/[^a-zа-яё0-9-]/gi,'');
const TICK_DAY=10;
// ---------- категории интересов (фиксированы разработчиком) ----------
const CATS=['Автомобили','Политика','Наука','Игры','Спорт','Развлечения','Еда','Животные','Деньги','Здоровье','Технологии','Происшествия'];
const NC=CATS.length;
// темы из справочника v8 → категории
const T2C={0:[0],1:[0],2:[4],3:[4],4:[4],5:[3],6:[3],7:[3],8:[10],9:[2],10:[9],11:[2],12:[2],13:[2],14:[1],15:[8],16:[8],17:[8],18:[2],19:[9],20:[5],21:[5],22:[5],23:[7],24:[2],25:[5],26:[6],27:[6],28:[9],29:[4],30:[5],31:[5],32:[5],33:[5],34:[5],35:[5],36:[5],37:[5],38:[5],39:[1],40:[11],41:[11],42:[5],43:[2],44:[5],45:[8],46:[8],47:[8],48:[5],49:[5]};
// ---------- состояние ----------
const BASE10=()=>({v:10,t:0,m:20,f:{},lv:{},U:[],nid:0,pid:0,P:[],arch:[],bp:{nodes:[],nid:1},know:{dict:{},fans:{}},iv:[],news:[],ev:[],day:{},days:[],
 queue:{rules:0,posts:0,feed:0,data:0},recalc:0,goals:{},wins:{},mails:[],data:{age:false,reg:false,int:false,beh:false,pref:false},dataQ:1,
 elecP:1,waterP:1,neg:0,perf:1,totals:{att:0,ads:0,an:0,cost:0},sel:null,osI:null});
let S=BASE10();
const has=id=>!!S.f[id];
const lvl=id=>S.lv[id]||0;
const UMAP=new Map(),PMAP=new Map();const byId=id=>UMAP.get(id);const postById=id=>PMAP.get(id);
// ---------- пользователи ----------
const FN_M=['Алексей','Дмитрий','Иван','Сергей','Артём','Максим','Никита','Павел','Олег','Роман','Игорь','Виктор','Денис','Егор','Тимур','Глеб','Михаил','Степан'];
const FN_F=['Анна','Мария','Ольга','Екатерина','Дарья','Полина','Ирина','Светлана','Юлия','Алина','Вера','Ксения','Наталья','Таня','Зина','Лена'];
const LN=['Иванов','Смирнов','Кузнецов','Попов','Соколов','Лебедев','Козлов','Новиков','Морозов','Петров','Волков','Соловьёв','Васильев','Зайцев','Павлов','Семёнов'];
const REGIONS=['Столица','Заречье','Промзона','Новостройки','Старый город','Университетский','Дачный','Порт'];
const SIMCAP=3000;
// 9 базовых постоянных характеристик + интересы
function mkUser(){const r=Math.random,male=r()<.5;const it=CATS.map(()=>Math.round(Math.pow(r(),2.2)*100));const fav=Math.floor(r()*NC);it[fav]=Math.max(it[fav],60+Math.round(r()*40));
 return {id:++S.nid,n:(male?pk(FN_M)+' '+pk(LN):pk(FN_F)+' '+pk(LN)+'а'),male,age:Math.round(clamp(14+Math.abs(gauss())*18+r()*10,14,80)),reg:Math.floor(r()*REGIONS.length),av:Math.floor(r()*100),it,
  like:r(),com:Math.pow(r(),2),share:Math.pow(r(),2),readCom:r(),scroll:r(),sess:5+Math.round(Math.pow(r(),1.5)*175),visits:.3+r()*4.7,bore:3+r()*7,argue:Math.pow(r(),2),
  v:0,hist:[],dayT:0,dayV:0,dayD:0,timeAvg:null,ret7:[],gone:false,join:S.t}}
function addUser(){const u=mkUser();u.v=u.visits;S.U.push(u);UMAP.set(u.id,u);S.reg=(S.reg||0)+1;return u}
const active=()=>S.U.filter(u=>!u.gone).length;
const rep=()=>Math.max(1,(S.reg-S.left||0)/Math.max(1,active()));
// ---------- публикации ----------
const TONE=['негативная','нейтральная','позитивная'];
function mkPost(au,o={}){const t=o.t!=null?o.t:topicFor(au);const T=TOPICS8[t];const cats=[...T2C[t]];if(Math.random()<.35){const c=Math.floor(Math.random()*NC);if(!cats.includes(c))cats.push(c)}
 let txt=o.txt||pk(T[3]);const long=Math.random()<.25;if(long&&!o.txt)txt+='. '+pk(TOPICS8[Math.floor(Math.random()*TOPICS8.length)][3])+'. '+pk(['Пишите, что думаете.','Это только начало.','Сохраните себе.','Расскажу подробнее позже.']);
 const media=Math.random()<.35?'фото':Math.random()<.18?'видео':'';const tone=o.tone!=null?o.tone:Math.random()<.35?0:Math.random()<.6?1:2;const emo=o.emo!=null?o.emo:Math.round(Math.random()*100);
 const words=txt.split(/\s+/).map(normW).filter(w=>w.length>=2);
 const p={id:++S.pid,au:au?au.id:0,auN:au?au.n:'«Лента»',av:au?au.av:0,txt,words,lem:words.map(w=>lemma(w)),cats,tone,emo,len:txt.length,media,ph:media?Math.floor(Math.random()*100):null,born:S.t,
  views:0,likes:0,coms:0,shares:0,att:0,pri:0,blocked:false,boost:0,log:[],ruleOk:false,ev:o.ev||null,comments:[],dayViews:0,lastV:S.t};
 S.P.push(p);PMAP.set(p.id,p);S.queue.posts++;return p}
function topicFor(u){if(!u)return Math.floor(Math.random()*TOPICS8.length);const w=TOPICS8.map((T,t)=>Math.pow(u.it[T2C[t][0]]/100,2)+.03);let x=Math.random()*w.reduce((a,b)=>a+b),t=0;for(;t<w.length;t++){x-=w[t];if(x<=0)break}return Math.min(t,TOPICS8.length-1)}
// словоформы: якоря из справочника + грубая основа для остальных слов
const lemma=w=>FORM[w]||(w.length>5?w.slice(0,w.length-2):w);
// ---------- поведение: просмотр публикации ----------
function interest(u,p){let m=0;for(const c of p.cats)m=Math.max(m,u.it[c]/100);return m}
function dwellOf(u,p){const I=interest(u,p);if(Math.random()<u.scroll*.6&&I<.25)return .5+Math.random();const base=p.media=='видео'?20:p.media=='фото'?8:Math.min(30,p.len/15);return Math.max(.5,base*(.25+I*1.3)*(1+p.emo/400)*(.7+Math.random()*.6))}
function viewPost(u,p){const d=dwellOf(u,p);S.dayDw=(S.dayDw||0)+1;S.dayDwS=(S.dayDwS||0)+d;const _en=PICKN||p.audN;PICKN=0;if(_en){const N=bpNode(_en);if(N)N.effD=(N.effD||0)+(d-(S.avgD||4))*rep()/60}const I=interest(u,p);p.views++;p.dayViews++;p.att+=d;p.lastV=S.t;u.dayT+=d;u.dayV++;u.dayD+=d;
 const act=[];if(Math.random()<u.like*(.1+I*.6)*(p.tone==2?1.2:1)){p.likes++;act.push('лайк');(u.lk=u.lk||[]).unshift(p.id);u.lk.length>20&&u.lk.pop();(p.likers=p.likers||[]).push(u.id);p.likers.length>30&&p.likers.shift()}
 if(Math.random()<u.com*(.05+I*.3+(p.tone==0?.15:0)+u.argue*p.emo/300)){p.coms++;act.push('комментарий');if(p.comments.length<40)p.comments.push(mkComment(u,p))}
 if(Math.random()<u.share*(.03+I*.25)){p.shares++;act.push('репост');S.day.shares=(S.day.shares||0)+1}
 u.hist.unshift({p:p.id,a:act.length?act.join(', '):'просмотр',t:S.t,d:+d.toFixed(1)});if(u.hist.length>100)u.hist.pop();
 return d}
const COMT={0:['Это возмутительно!','Кто за это ответит?','Опять двадцать пять','Позор','Я так и знал'],1:['Интересно','А подробнее?','Ну такое','Спасибо, что написали','Сохранил'],2:['Класс!','Обожаю такое','Лучший пост дня','Так держать!','❤️']};
function mkComment(u,p){const tone=clamp(p.tone+(Math.random()<u.argue?-1:0)+(Math.random()<.2?1:0),0,2);return {n:u.n,txt:pk(COMT[tone]),tone}}
// ---------- ранжирование (общая лента; персонализация — через правила по аудитории) ----------
let RANK=[];
function score(p){const age=(S.t-p.born)/TICK_DAY;return 2*Math.exp(-age/2)+Math.min(2,p.likes/(p.views+5)*6)+p.boost+p.pri}
function rerank(){RANK=S.P.filter(p=>!p.blocked&&p.ruleOk!==null).map(p=>[score(p),p]).sort((a,b)=>b[0]-a[0]).slice(0,120).map(x=>x[1])}
function pickFor(u){const ip=injPick(u);if(ip)return ip;const L=RANK;if(!L.length)return null;let best=null,bs=-1e9;for(let i=0,lim=Math.min(L.length,BP_PICK?15:30);i<lim;i++){const p=L[i];let s=score(p)+Math.random()*1.2-i*.03+audBoost(u,p);if(s>bs){bs=s;best=p}}return best}
// ---------- день ----------
function tickUsers(){let att=0,views=0;const perf=S.perf;
 for(const u of S.U){if(u.gone)continue;if(Math.random()>u.v/TICK_DAY)continue;
  // одна сессия: человек смотрит посты, пока не кончится время сессии (не больше 12 «замеров»)
  runUser(u);let left=u.sess*60*(.6+Math.random()*.8);let n=0;while(left>0&&n<12){const p=pickFor(u);if(!p)break;const d=viewPost(u,p);left-=d*8;att+=d;views++;n++}
  const tm=u.sess*60*.9-left;u.dayTime=(u.dayTime||0)+Math.max(0,tm)}
 return {att,views}}
function endDay(){const R=rep();let tsum=0,n=0,left=0;
 for(const u of S.U){if(u.gone)continue;const avgD=u.dayV?u.dayD/u.dayV:0;u.ret7.push(avgD);if(u.ret7.length>7)u.ret7.shift();const r7=u.ret7.reduce((a,b)=>a+b,0)/u.ret7.length;
  // скучно → заходит реже; интересно → возвращается к своей обычной частоте
  if(u.ret7.length>=3&&r7<u.bore)u.v*=.94;else u.v=Math.min(u.visits,u.v*1.06+.02);
  if(u.v<.2){u.gone=true;left++}
  u.timeAvg=u.timeAvg==null?(u.dayTime||0)/60:u.timeAvg*.8+(u.dayTime||0)/60*.2;tsum+=u.timeAvg;n++;u.dayTime=0;u.dayV=0;u.dayD=0}
 const timeAvg=n?tsum/n:0;const visits=n?S.U.filter(u=>!u.gone).reduce((s,u)=>s+u.v,0)/n:0;
 // рост: репосты и «сарафан» пропорционально эффективности ленты
 const shr=(S.day.shares||0)/Math.max(1,n);S.shareRate=shr;const joins=(S.reg-(S.left||0))*Math.min(.06,.007+.015*shr+.008*(timeAvg/20))*(1+eff('growth'))/R;let jn=Math.floor(joins);if(Math.random()<joins%1)jn++;
 for(let i=0;i<jn;i++){if(S.U.length<SIMCAP)addUser();else S.reg++}
 S.left=(S.left||0)+left*R;
 const d={day:dayNo(),users:Math.round(S.reg-(S.left||0)),joined:jn,left:Math.round(left*R),timeAvg,visits,views:Math.round((S.day.views||0)*R),likes:S.P.reduce((s,p)=>s+p.likes,0),att:S.day.att||0,inc:S.day.inc||0,cost:S.day.cost||0,posts:S.P.length};
 S.days.push(d);if(S.days.length>120)S.days.shift();S.day={};
 // старение: забытые публикации уходят в архив
 for(const p of S.P.slice()){const age=(S.t-p.born)/TICK_DAY;const idle=(S.t-p.lastV)/TICK_DAY;if((age>3&&p.dayViews<2)||age>12||idle>2){if(p.pri>0&&age<20)continue;if(bpArchive(p))continue;archive(p)}p.dayViews=0}
 for(const R of S.bp.nodes){R.eff7=R.eff7||[];R.eff7.push(R.effD||0);R.eff7.length>7&&R.eff7.shift();R.effD=0}S.avgD=S.dayDw?S.dayDwS/S.dayDw:4;S.dayDw=0;S.dayDwS=0;
 econDay();eventsDay()}
function archive(p){S.P=S.P.filter(x=>x!==p);S.arch.push(p);if(S.arch.length>4000){const o=S.arch.shift();PMAP.delete(o.id)}}
function restore(p){S.arch=S.arch.filter(x=>x!==p);p.born=S.t;p.lastV=S.t;p.dayViews=0;S.P.push(p);S.queue.posts++}
const dayNo=()=>Math.floor(S.t/TICK_DAY);
function dateStr(t){const d=new Date(2000,0,1);d.setDate(d.getDate()+Math.floor((t??S.t)/TICK_DAY));return d.toLocaleDateString('ru',{day:'numeric',month:'long',year:'numeric'})}
function timeStr(){const fr=(S.t%TICK_DAY)/TICK_DAY*24;return String(Math.floor(fr)).padStart(2,'0')+':'+String(Math.floor(fr%1*60)).padStart(2,'0')}
// ---------- серверы, очереди, экономика ----------
const capacity=()=>100*Math.pow(1.2,lvl('power'))*(S.perf);
function sload(){const users=active()*.06;const rules=S.bp.nodes.length*S.P.length*.0008+(BP_USER?S.bp.nodes.length*active()*.004:0)*(1-eff('ruleOpt'));const data=Object.values(S.data).filter(Boolean).length*active()*.02;return users+rules+data+S.queue.rules*.05+S.queue.posts*.2}
function serverTick(){const cap=capacity(),L=sload();S.load=L/cap;const spare=Math.max(.15,cap/L);
 // обработка очередей пропорционально свободной мощности
 const rp=Math.ceil(30*Math.min(1.5,spare)*(1+lvl('power')*.2));const did=Math.min(S.queue.rules,rp);S.queue.rules-=did;S.recalcSpeed=rp;if(did)rulesWork(did);
 S.queue.posts=Math.max(0,S.queue.posts-Math.ceil(20*spare));S.queue.feed=S.load>1?Math.round((S.load-1)*50):0;S.queue.data=S.load>1?Math.round(Object.values(S.data).filter(Boolean).length*(S.load-1)*30):0}
function econDay(){const cap=100*Math.pow(1.2,lvl('power'));const t=dayNo();S.elecP=1+.3*Math.sin(t/30*2*Math.PI)+.08*gauss();S.waterP=1+.25*Math.sin(t/45*2*Math.PI+1)+.06*gauss();
 const cost=(cap*.0015*S.elecP*(1-eff('elecSave'))+cap*.0006*S.waterP*(1-eff('waterSave')));S.m-=cost;S.day.cost=cost;S.totals.cost+=cost;S.costDay=cost;
 // отрицательный баланс — производительность падает постепенно
 if(S.m<0)S.perf=Math.max(.3,S.perf-.05);else S.perf=Math.min(1,S.perf+.05)}
const forecastCost=d=>{const cap=100*Math.pow(1.2,lvl('power'));let s=0;for(let i=1;i<=d;i++){const t=dayNo()+i;s+=cap*.0015*(1+.3*Math.sin(t/30*2*Math.PI))*(1-eff('elecSave'))+cap*.0006*(1+.25*Math.sin(t/45*2*Math.PI+1))*(1-eff('waterSave'))}return s};
const adRate=()=>.006*(1+eff('ads'));
function analyticsIncome(){const cats=Object.entries(S.data).filter(([k,v])=>v);if(!cats.length)return 0;const val={age:1,reg:1,int:2.2,beh:2.6,pref:3};const q=1+eff('dataQ');return active()*rep()*cats.reduce((s,[k])=>s+val[k],0)*.0004*q*Math.min(1,1/Math.max(.5,S.load))}
// ---------- шаг ----------
function step(){if(S.paused)return;S.t++;
 // авторы пишут посты
 const rate=.5+active()/150;for(let i=0;i<rate;i++)if(Math.random()<rate/Math.ceil(rate)&&S.U.length){const au=pk(S.U);if(!au.gone)mkPost(au)}
 eventsTick();newPostsToQueue();serverTick();
 // лента формируется с задержкой при перегрузке
 if(!S.queue.feed||S.t%Math.min(5,1+Math.floor(S.queue.feed/20))==0)rerank();
 const r=tickUsers();const R=rep();const att=r.att/60*R*S.perf;const ads=att*adRate();const an=analyticsIncome()/TICK_DAY;S.m+=ads+an;S.totals.att+=att;S.totals.ads+=ads;S.totals.an+=an;
 S.day.att=(S.day.att||0)+att;S.day.views=(S.day.views||0)+r.views;S.day.inc=(S.day.inc||0)+ads+an;S.incNow=(S.incNow||0)*.9+(ads+an)*60*.1;
 ruleEffectTick();
 if(S.t%TICK_DAY==0)endDay();goalsTick()}
function init10(){SHOP.forEach(x=>{if(!x.lv)S.f[x.id]=1});for(let i=0;i<100;i++)addUser();for(let i=0;i<60;i++){const p=mkPost(pk(S.U));p.born=-Math.floor(Math.random()*20)}S.queue.posts=0;rerank()}
