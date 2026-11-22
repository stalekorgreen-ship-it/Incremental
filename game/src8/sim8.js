// ===================== ЛЕНТА.EXE v8 — СИМУЛЯЦИЯ =====================
const pk=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sigm=x=>1/(1+Math.exp(-x));
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const f=n=>{n=+n||0;const a=Math.abs(n);return a>=1e12?(n/1e12).toFixed(2)+'T':a>=1e9?(n/1e9).toFixed(2)+'B':a>=1e6?(n/1e6).toFixed(2)+'M':a>=1e4?(n/1e3).toFixed(1)+'K':a<10?n.toFixed(1):Math.round(n).toLocaleString('ru')};
const normW=w=>w.toLowerCase().replace(/[^a-zа-яё0-9-]/gi,'');
const NAV=100,PHOTOS=100;
const SIMCAP=2500; // сколько человек симулируется поштучно; сверх этого каждый представляет нескольких
const BASE8=()=>({v:8,t:0,m:20,earned:0,f:{},nb:0,U:[],nid:0,pid:0,
 win:[],winSum:0,views:0,regTotal:0,srvLvl:1,rules:[],dict:{words:{},groups:[],gid:1},lab:{hyp:[],cats:[],runs:[],nid:1},exp:null,expHist:[],
 auto:{runs:0,found:0,next:0},aud:[{id:0,name:'Все',m:null}],audN:1,inbox:[],sent:[],nextIn:0,adLoad:.3,goals:{},wins:{},stat:{},statH:[],hist:[],mails:[],osI:null,sel:null,eff:{}});
let S=BASE8(),POOL=[];
const has=id=>!!S.f[id];
const UMAP=new Map();const byId=id=>UMAP.get(id);
// ---------- пользователи ----------
const FN_M8=['Алексей','Дмитрий','Иван','Сергей','Артём','Максим','Никита','Павел','Олег','Роман','Игорь','Виктор','Денис','Егор','Тимур','Глеб','Михаил','Степан'];
const FN_F8=['Анна','Мария','Ольга','Екатерина','Дарья','Полина','Ирина','Светлана','Юлия','Алина','Вера','Ксения','Наталья','Таня','Зина','Лена'];
const LN8=['Иванов','Смирнов','Кузнецов','Попов','Соколов','Лебедев','Козлов','Новиков','Морозов','Петров','Волков','Соловьёв','Васильев','Зайцев','Павлов','Семёнов'];
const DIST8=['Центр','Заречье','Промзона','Новостройки','Старый город','Университетский','Дачный','Порт'];
// увлечения группами: у людей интересы не случайны — кто любит машины, часто любит и мотоциклы
const HOB_CL=[[0,1,2,3],[4,5,6,7,8,9],[10,11,12,13],[14,15,16,17,18],[19,20,21,22,23,72],[24,25,23,49],[26,27,28,29],[30,31,32,33],[34,35],[36,37,38,39,75],[40,41,42],[43,44,45,46],[47,48,49],[50,51],[52,53,54,55,56],[57,58,59,60],[61,62,63],[64,65,66,67],[68,69,70,71],[73,74,75],[76,77,78],[79]];
function mkUser(){const r=Math.random;const male=r()<.5;const age=Math.round(clamp(14+Math.abs(gauss())*18+r()*10,14,80));const hob={};const n=10+Math.floor(r()*11);
 const cls=[pk(HOB_CL),pk(HOB_CL)];for(const c of cls)for(const h of c)if(r()<.75)hob[h]=Math.round(40+r()*60);
 while(Object.keys(hob).length<n){const h=Math.floor(r()*NH);if(!hob[h])hob[h]=Math.round(1+Math.pow(r(),1.6)*70)}
 if(age<22){hob[11]=Math.max(hob[11]||0,50+Math.round(r()*40));}if(age>55){hob[43]=Math.max(hob[43]||0,40+Math.round(r()*50))}
 const p=()=>Math.round(r()*100);
 return {id:++S.nid,sex:male?'м':'ж',age,d:Math.floor(r()*DIST8.length),n:(male?pk(FN_M8)+' '+pk(LN8):pk(FN_F8)+' '+pk(LN8)+'а'),av:Math.floor(r()*NAV),hob,
  b:{sess:Math.round(1+Math.pow(r(),2)*179),tText:Math.round(1+r()*59),tImg:Math.round(1+r()*29),tVid:Math.round(1+Math.pow(r(),1.5)*599),like:p(),com:Math.round(Math.pow(r(),2)*100),share:Math.round(Math.pow(r(),2)*100),save:p(),click:p(),argue:Math.round(Math.pow(r(),2)*100),scroll:p(),longread:p(),vidEnd:p(),emo:p(),quit:p()},
  on:false,back:Math.floor(r()*30),sLeft:0,busy:0,cur:null,seen:[],hh:[],cls:{},likes:[],fmtD:{},grp:null}}
function addUser(){const u=mkUser();S.U.push(u);UMAP.set(u.id,u);S.regTotal++;return u}
const rep=()=>Math.max(1,S.regTotal/Math.max(1,S.U.length)); // реальных пользователей на одного симулируемого
// ---------- публикации ----------
const LENC=[[0,50],[51,150],[151,300],[301,600],[601,1200],[1201,2500],[2501,5000],[5001,9000]];
const FILL=['Расскажу подробнее.','Вот что я об этом думаю.','Если честно, я долго сомневался.','Пишите в комментариях своё мнение.','Это только начало истории.','Обновлю пост, когда узнаю больше.','Сохраните, чтобы не потерять.','Спасибо всем, кто дочитал.'];
const PREF={0:'Вопрос: ',3:'Инструкция: ',5:'Обзор. ',6:'Личный опыт: ',7:'Новость: ',9:'Скажу честно, это бред: ',10:'Шутка дня: ',11:'Делайте так же! ',12:'Внимание! ',13:'Реклама. ',14:'Непопулярное мнение: ',16:'Пять фактов: ',17:'История из жизни: '};
function topicsFor(u){const w=TOPICS8.map((T,t)=>Math.pow(topicInterest(u,t),2)+.02);let x=Math.random()*w.reduce((a,b)=>a+b),t=0;for(;t<NT8;t++){x-=w[t];if(x<=0)break}return Math.min(t,NT8-1)}
function mkPost(au,o={}){const t=o.t!=null?o.t:au?topicsFor(au):Math.floor(Math.random()*NT8);const T=TOPICS8[t];
 const t2=[];const k2=Math.random()<.5?0:Math.floor(Math.random()*3)+1;for(let i=0;i<k2;i++){const x=Math.floor(Math.random()*NT8);if(x!=t&&!t2.includes(x))t2.push(x)}
 const fmtW=[30,22,6,12,5,6,4,8,3,4];let x=Math.random()*100,fmt=0;for(;fmt<10;fmt++){x-=fmtW[fmt];if(x<=0)break}fmt=Math.min(fmt,9);if(o.fmt!=null)fmt=o.fmt;
 const st=[];const ns=1+Math.floor(Math.random()*2.5);for(let i=0;i<ns;i++){const s=Math.floor(Math.random()*STRUCTS.length);if(!st.includes(s))st.push(s)}if(fmt==6&&!st.includes(0))st.push(0);if(fmt==9&&!st.includes(13))st.push(13);if(fmt==7&&!st.includes(10))st.push(10);
 let txt=(PREF[st[0]]||'')+pk(T[3]);for(const s of t2.slice(0,1))txt+='. '+pk(TOPICS8[s][3]);if(st.includes(0)||st.includes(15))txt+='?';
 // длина: у текстовых постов — класс длины; длинный текст достраивается абзацами
 let lc=fmt==0?Math.min(7,Math.floor(Math.pow(Math.random(),1.6)*8)):fmt==7||fmt==1?0:Math.floor(Math.random()*2);const[lo,hi]=LENC[lc];let len=Math.max(txt.length,Math.round(lo+Math.random()*(hi-lo)));
 while(txt.length<Math.min(len,260))txt+=' '+pk(FILL);if(len<txt.length)len=txt.length;
 const emo={};for(const s of st)for(const e of(STRUCT_EMO[s]||[]))emo[e]=Math.round(40+Math.random()*60);const ne=1+Math.floor(Math.random()*2);for(let i=0;i<ne;i++){const e=Math.floor(Math.random()*EMOS.length);emo[e]=Math.max(emo[e]||0,Math.round(20+Math.random()*80))}
 const words=[];txt.split(/\s+/).forEach((w,i)=>{const n=normW(w);if(n.length>=2)words.push({w:n,l:lemmaOf(n),i})});
 const dur=fmt==3?Math.round(5+Math.random()*55):fmt==4?Math.round(60+Math.random()*900):0;const imgs=fmt==2?2+Math.floor(Math.random()*9):fmt==1||fmt==7||fmt==8?1:0;
 return {id:++S.pid,au:au?au.id:0,auN:au?au.n:'«Лента»',av:au?au.av:0,t,t2,fmt,len,dur,imgs,st,emo,txt,words,born:S.t,pri:0,rp:0,views:0,dwT:0,likes:0,coms:0,shares:0,saves:0,clicks:0,quits:0,skips:0,ph:imgs?Math.floor(Math.random()*PHOTOS):null,base:.4+Math.random()*.6}}
const postIn=(p,t)=>p.t==t||p.t2.includes(t);
// ---------- взаимодействие человека и публикации ----------
function interaction(u,p){const b=u.b;let I=topicInterest(u,p.t);for(const t of p.t2)I+=topicInterest(u,t)*.4;I=Math.min(1.3,I);
 const emoI=Object.values(p.emo).reduce((a,x)=>a+x,0)/100;const eF=1+b.emo/100*Math.min(1.5,emoI)*.35;
 let base;const lr=b.longread/100;
 switch(p.fmt){case 0:{const read=p.len/(14+lr*10);base=Math.min(read,b.tText*(.4+I)*(p.len>600?lr*1.6+.2:1));break}
  case 1:base=b.tImg*(.35+I);break;case 2:base=b.tImg*(.35+I)*Math.min(4,p.imgs*.45);break;
  case 3:base=Math.min(p.dur,b.tVid*(.15+I)*(.3+b.vidEnd/100));break;case 4:base=Math.min(p.dur,b.tVid*(.1+I)*(b.vidEnd/100)*1.2);break;
  case 5:base=3+b.tText*.2*(.3+I);break;case 6:base=4+3*I;break;case 7:base=b.tImg*.6*(.5+I)+(p.emo[17]?3:0);break;case 8:base=b.tImg*1.3*(.3+I);break;default:base=1+I*2}
 const ft=u.fat&&u.fat[p.t]||0;base*=1/(1+.13*Math.max(0,ft-2));
 let fp=u.fmtD[p.fmt];if(fp&&fp[0]>3)base*=.85+.3*clamp(fp[1]/fp[0]/(S.avgRet||8),0,1.5);
 const skip=I<.18&&Math.random()<b.scroll/100*.85;let dw=skip?.5+Math.random()*1.2:Math.max(.6,base*eF*(.7+Math.random()*.6));
 const ang=(p.emo[2]||0)+(p.emo[15]||0);const prov=p.st.includes(9)||p.st.includes(14);
 const pr={like:skip?0:b.like/100*clamp(I*.9+.05+(p.emo[0]||0)/400+(p.emo[7]||0)/400,0,1)*.6,
  com:skip?0:b.com/100*clamp(I*.3+(prov?.35:0)+b.argue/100*ang/200,0,1)*.5,share:skip?0:b.share/100*clamp(I*.5+(p.emo[17]?.25:0),0,1)*.3,
  save:skip?0:b.save/100*(p.st.includes(3)||p.st.includes(16)?.5:.08)*I,click:p.fmt==5?b.click/100*(.2+I*.6):0,
  quit:clamp(b.quit/100*.06*(1.3-I)+(p.fmt==9?.05:0)+(ang>80&&b.argue<40?.06:0)+(skip?.02:0),0,.6)};
 return {dw,skip,I,pr}}
// ---------- лента: что показать человеку следующим ----------
function rankFor(u){let best=null,bs=-1e9;const seen=u.seen;
 for(const p of POOL){if(seen.includes(p.id))continue;let s=1.5*Math.exp(-(S.t-p.born)/150)+p.rp+Math.random()*.6+(p.aud==null?0:inAud(u,p.aud)?3:-2);
  if(has('pop'))s+=Math.min(1.5,p.views?p.dwT/p.views/(S.avgRet||8)-1:0);
  if(S.exp&&S.exp.on&&u.grp=='A')s+=expBonus(p);
  s+=persScore(u,p)+persRules(u,p);if(s>bs){bs=s;best=p}}return best}
// ---------- шаг ----------
const srvCap=()=>100*Math.pow(2,S.srvLvl-1);
function step(){S.t++;const R=rep();const cap=srvCap();let online=0;for(const u of S.U)if(u.on)online++;S.blocked=0;
 // новые посты
 const rate=.4+S.U.length/120;for(let i=0;i<rate;i++)if(Math.random()<rate/Math.ceil(rate)&&S.U.length){const p=mkPost(pk(S.U));
  if(S.t>=S.nextIn&&S.inbox.length<inboxCap()){p.inAt=S.t;S.inbox.push(p);S.nextIn=S.t+inboxGap()}else{p.aud=null;POOL.push(p)}}
 S.inbox=S.inbox.filter(p=>{if(S.t-p.inAt<inboxLife())return true;p.aud=null;POOL.push(p);return false});
 POOL=POOL.filter(p=>S.t-p.born<300);if(POOL.length>260)POOL.splice(0,POOL.length-260);
 rulesTick();
 let vw=0,dwSum=0,sessSec=0,likes=0,coms=0,shares=0,saves=0,quits=0,ended=0;
 for(const u of S.U){
  if(!u.on){if(S.t>=u.back){if(online*R<cap){u.on=true;u.s0=S.t;online++;u.sLeft=(15+u.b.sess*3)*(.7+Math.random()*.6);u.busy=0}else{S.blocked++;u.back=S.t+30+Math.floor(Math.random()*30)}}continue}
  sessSec++;u.sLeft--;
  if(u.busy>0){u.busy--;continue}
  if(u.cur){u.cur=null}
  if(u.sLeft<=0){endSess(u);online--;ended++;continue}
  const p=rankFor(u);if(!p){endSess(u);online--;continue}
  const r=interaction(u,p);u.busy=Math.ceil(r.dw);u.cur=p.id;u.seen.push(p.id);if(u.seen.length>80)u.seen.shift();
  p.views++;p.dwT+=r.dw;vw++;tire(u,p);audView(u,p,r.dw);if(r.dw>(u.ld&&u.ld[0]?u.ld[1]/u.ld[0]:9)*1.3)(p.longers||(p.longers=[])).push(u.id);dwSum+=r.dw;addWin(r.dw);
  const fd=u.fmtD[p.fmt]||(u.fmtD[p.fmt]=[0,0]);fd[0]++;fd[1]+=r.dw;
  const h={p:p.id,dw:+r.dw.toFixed(1),sk:r.skip,lk:0,q:0,t:S.t};
  const ud=u.ld&&u.ld[0]?u.ld[1]/u.ld[0]:0;
  if(Math.random()<r.pr.like){p.likes++;likes++;h.lk=1;engage(u,p,'l');u.likes.push(p.id);if(u.likes.length>20)u.likes.shift();(p.likers||(p.likers=[])).push(u.id)}
  if(Math.random()<r.pr.com){p.coms++;coms++}if(Math.random()<r.pr.save){p.saves++;saves++}if(Math.random()<r.pr.click)p.clicks++;
  if(Math.random()<r.pr.share){p.shares++;shares++;if(Math.random()<.25*Math.max(0,1-S.regTotal/MARKET)*clamp(1.6-online*R/cap*1.2,0,1))invite()}
  logView(u,p,r.dw);if(fd[0]>3&&r.dw>fd[1]/fd[0]*1.5)engage(u,p,'d');classObs(u,p,r.dw);expObs(u,r.dw,h);
  if(Math.random()<r.pr.quit+(S.adLoad-.3)*.04){h.q=1;p.quits++;quits++;u.hh.push(h);endSess(u);online--;continue}
  u.hh.push(h);if(u.hh.length>40)u.hh.shift()}
 // базовый приток: сарафанное радио
 {const full=clamp(1.6-online*R/cap*1.2,0,1);const g=(.04+S.regTotal/3500)*(.5+(S.avgRet||8)/16)*Math.max(0,1-S.regTotal/MARKET)*full;for(let i=0;i<Math.floor(g);i++)invite();if(Math.random()<g%1)invite()}
 // деньги: рекламный баннер сбоку — платят за секунды, проведённые на платформе
 const inc=sessSec*R*AD_RATE*(.4+S.adLoad*2)*(1+eff('adEff'));S.m+=inc;S.earned+=inc;S.views+=vw*R;
 const st=S.stat;st.inc=(st.inc||0)+inc;st.vw=(st.vw||0)+vw*R;st.sess=(st.sess||0)+sessSec;st.ended=(st.ended||0)+ended+quits;st.likes=(st.likes||0)+likes*R;st.coms=(st.coms||0)+coms*R;st.shares=(st.shares||0)+shares*R;st.saves=(st.saves||0)+saves*R;st.quits=(st.quits||0)+quits*R;st.blk=(st.blk||0)+S.blocked*R;
 if(S.t%10==0){S.statH.push(Object.assign({t:S.t,online:online*R,ret:S.avgRet},st));if(S.statH.length>30)S.statH.shift();S.stat={}}
 S.online=online*R;S.hist.push(inc*60);if(S.hist.length>150)S.hist.shift();
 labTick();classTick();autoTick();expTick();goalsTick()}
const AD_RATE=.0065;
const MARKET=3e6; // сколько людей в принципе может прийти в «Ленту»
// журнал просмотров платформы: по каждому человеку — сколько секунд он провёл на постах с каждым словом-якорем (две половины для проверки устойчивости)
function logView(u,p,d0){const fd=u.fmtD[p.fmt];const d=Math.log(1+d0/Math.max(.5,fd&&fd[0]>1?fd[1]/fd[0]:d0));const ld=u.ld||(u.ld=[0,0]);ld[0]++;ld[1]+=d;const half=ld[0]&1;const lw=u.lw||(u.lw={});const seen=new Set();
 for(const x of p.words){const k=x.l;if(!k||seen.has(k))continue;seen.add(k);const o=lw[k]||(lw[k]=[0,0,0,0]);o[half*2]++;o[half*2+1]+=d}}
function engage(u,p,kind){const E=u.ew||(u.ew={});for(const x of p.words){for(const k of [x.w,x.l]){if(!k)continue;const o=E[k]||(E[k]=[0,0]);o[kind=='l'?0:1]++}}const ks=Object.keys(E);if(ks.length>80){ks.sort((a,b)=>(E[a][0]+E[a][1])-(E[b][0]+E[b][1]));for(const k of ks.slice(0,ks.length-60))delete E[k]}}
// ---------- аудитории ----------
const inboxCap=()=>4+eff('inboxCap');const inboxGap=()=>Math.max(1,Math.round(3.5-eff('inboxSpeed')*.6));const inboxLife=()=>8+eff('inboxLife');
const audCap=()=>1+(has('split')?1:0)+eff('audCap');
function audSet(A){if(A.auto!=null)return null;if(!A._s||A._n!=A.m.length){A._s=new Set(A.m);A._n=A.m.length}return A._s}
function inAud(u,id){if(id==0)return true;const A=S.aud.find(a=>a.id==id);if(!A)return false;if(A.auto!=null)return topicInterest(u,A.auto)>.35;return audSet(A).has(u.id)}
function send(p,aid){const i=S.inbox.indexOf(p);if(i<0)return;S.inbox.splice(i,1);p.aud=aid;p.sentAt=S.t;p.born=S.t;POOL.push(p);S.sent.unshift(p.id);S.sent.length=Math.min(30,S.sent.length);S.nSent=(S.nSent||0)+1}
function mkAud(ids,name){if(S.aud.length>=audCap())return 'достигнут лимит аудиторий';ids=[...new Set(ids)].filter(id=>byId(id));if(ids.length<3)return 'нужно хотя бы 3 человека';const A={id:S.audN++,name:name||('Аудитория №'+(S.audN-1)),m:ids,st:[0,0],born:S.t};S.aud.push(A);return ''}
function tire(u,p){const F=u.fat||(u.fat={});const dt=S.t-(u.fatT||S.t);u.fatT=S.t;if(dt>0)for(const k in F){F[k]*=Math.pow(.985,dt);if(F[k]<.05)delete F[k]}F[p.t]=(F[p.t]||0)+1}
function audView(u,p,d){for(const A of S.aud){if(A.id==0||!inAud(u,A.id))continue;A.st[0]=A.st[0]*.995+1;A.st[1]=A.st[1]*.995+d;const o=(p.ad||(p.ad={}))[A.id]||(p.ad[A.id]=[0,0]);o[0]++;o[1]+=d}const A0=S.aud[0];A0.st=A0.st||[0,0];A0.st[0]=A0.st[0]*.995+1;A0.st[1]=A0.st[1]*.995+d}
function audMembers(A){return A.id==0?S.U:A.auto!=null?S.U.filter(u=>topicInterest(u,A.auto)>.35):A.m.map(byId).filter(Boolean)}
function audFatigue(A){const M=audMembers(A);if(!M.length)return 0;let s=0;for(const u of M){const F=u.fat;if(!F)continue;let mx=0;for(const k in F)if(F[k]>mx)mx=F[k];s+=mx}return clamp(s/M.length/8,0,1)}
function endSess(u){if(u.s0!=null){S.stat.sd=(S.stat.sd||0)+(S.t-u.s0);S.stat.sn=(S.stat.sn||0)+1;S.sessAvg=S.sessAvg==null?S.t-u.s0:S.sessAvg*.97+.03*(S.t-u.s0);u.s0=null}u.on=false;u.cur=null;u.busy=0;u.back=S.t+Math.round(40+Math.random()*120*(1.5-u.b.sess/180))}
function invite(){if(S.U.length<SIMCAP){const u=addUser();u.back=S.t+2}else S.regTotal++}
// среднее удержание: взвешенное по фактическим просмотрам в скользящем окне (окно растёт с аудиторией)
function addWin(d){const W=Math.max(300,Math.round(S.regTotal*6));S.win.push(d);S.winSum+=d;while(S.win.length>W)S.winSum-=S.win.shift();S.avgRet=S.winSum/S.win.length}
const eff=k=>S.eff[k]||0;
function init8(){for(let i=0;i<100;i++)addUser();for(let i=0;i<40;i++){const p=mkPost(pk(S.U));p.born=-Math.floor(Math.random()*200);POOL.push(p)}}
