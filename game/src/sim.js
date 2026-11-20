// ===================== СИМУЛЯЦИЯ =====================
const pk=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sigm=x=>1/(1+Math.exp(-x));
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const f=n=>{n=+n||0;const a=Math.abs(n);return a>=1e12?(n/1e12).toFixed(2)+'T':a>=1e9?(n/1e9).toFixed(2)+'B':a>=1e6?(n/1e6).toFixed(2)+'M':a>=1e4?(n/1e3).toFixed(1)+'K':a<10?n.toFixed(1):Math.round(n).toLocaleString('ru')};
const NT=TOPICS.length,BYT=NT;
function normW(w){return w.toLowerCase().replace(/[^a-zа-яё0-9]/gi,'')}
const KEYS={};TOPICS.forEach((t,i)=>t.k.forEach(k=>KEYS[normW(k)]={t:i,w:k}));
const STOP=new Set(['это','только','очень','какая','всем','если','когда','потому','чтобы','которые','через','после','было','будет','уже','сегодня','опять','снова','просто','весь','всех','вечер','своя','свой','меня','тебя','нас','вас','они','него','неё','есть','были','была']);
const toks=t=>t.split(/\s+/).map(normW).filter(w=>w.length>=4&&!STOP.has(w));
const MONTH=300;
const NAV=100,PCAT=["abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "abs", "food", "food", "food", "food", "food", "food", "food", "food", "food", "animals", "animals", "animals", "animals", "animals", "animals", "animals", "animals", "games", "games", "games", "games", "games", "games", "games", "games", "games", "people", "people", "people", "people", "people", "people", "people", "people", "people", "people", "people", "people", "people", "daily", "daily", "daily", "daily", "daily", "daily", "things", "things", "things", "things", "things", "things", "things", "things", "things", "nature", "nature", "nature", "nature", "nature", "nature", "nature", "nature", "nature", "nature", "draw", "draw", "draw", "draw", "draw", "draw", "draw", "draw", "draw", "selfie", "selfie", "selfie", "selfie", "selfie", "selfie", "selfie", "street", "street", "street", "street", "street"];
const TOPIC_PH={9:['food'],4:['animals'],7:['games'],6:['games'],2:['nature'],12:['people','selfie'],3:['street','people'],13:['street'],1:['street','people'],0:['street','people'],8:['people'],11:['draw','daily'],5:['things','people'],10:['daily','people']};
const BYT_PH=['daily','things','selfie','abs','people','draw'];
function photoFor(t){const cats=t>=NT?BYT_PH:(TOPIC_PH[t]||['daily']);const c=pk(cats);const ids=PCAT.map((x,i)=>x==c?i:-1).filter(i=>i>=0);return ids.length?pk(ids):Math.floor(Math.random()*PCAT.length)}
const avOf=n=>{let h=2166136261;for(let i=0;i<n.length;i++){h^=n.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)%NAV};
const BASE=()=>({v:6,flags:{},trust:.72,adLoad:null,R:null,wlog:[],revM:{},churnR:{},tot:{views:0,joined:0,left:0,adv:0,bad:0,pol:0,v0:null},era:0,P:{},sell:false,auto:{goal:'off',i:6,side:1},ruleGrp:{},t:0,m:0,earned:0,f:{},up:{},nb:0,A:[],nid:0,mult:60,dict:{},rules:[],act:[],used:[],chron:[],chars:[],news:[],mails:[],
 trend:Array(NT+1).fill(1),srv:0,hist:[],watch:0,stat:{join:0,bored:0,angry:0,views:0,rx:0,sh:0},statH:[],wins:{},ema:{},off:{},polar:0,clusters:[],cent:null,adv:{},extraAdv:[],osI:null,nextJoin:0,
 tax:20,elec:1,mon:{rev:0,el:0,start:0},debt:0,feedT:5,nextFeed:0,batch:[],nextStory:25,nextNewsArc:60,cpuLaw:0,bills:[]});
let S=BASE();
const has=id=>!!S.f[id];
// ---------- люди ----------
const AMAP=new Map();const byId=id=>AMAP.get(id);
function mkAgent(o={}){const r=Math.random;const male=o.male!=null?o.male:r()<.5;const fn=male?pk(FN_M):pk(FN_F),ln=pk(LN);const d=o.d!=null?o.d:Math.floor(r()*ND);
 const age=[16,22,30,42,58,70][Math.floor(r()*6)];const it=TOPICS.map(()=>Math.pow(r(),2.2));if(age<20){it[7]+=.5;it[11]+=.4}if(age>55){it[5]+=.4;it[10]+=.3;it[9]+=.2}if(d==6)it[9]+=.4;if(d==5)it[11]+=.3;if(d==2)it[0]+=.3,it[13]+=.3;
 // взгляды на старте умеренные: пузыри должны появляться от ленты
 const v=ISSUES.map((x,i)=>clamp(gauss()*.22+(i==5?(age-40)/200:0)+(i==3?(40-age)/250:0),-1,1));
 return {id:++S.nid,n:o.n||(fn+' '+(male?ln:lnF(ln))),male,age,d,it,v,act:.4+r()*.6,ads:.4+r()*1.1,fr:[],x:gauss()*.3,y:gauss()*.3,mood:0,char:o.char||null,seed:o.seed||0,eng:0,feed:[],last:null,cl:-1}}
function befriend(a,b){if(a===b||a.fr.includes(b.id)||a.fr.length>14||b.fr.length>14)return;a.fr.push(b.id);b.fr.push(a.id)}
function unfriend(a,b){a.fr=a.fr.filter(x=>x!=b.id);b.fr=b.fr.filter(x=>x!=a.id)}
function addAgent(a,host){S.A.push(a);AMAP.set(a.id,a);if(host)befriend(host,a);const pool=S.A.filter(b=>b!==a&&b.d==a.d);for(let i=0;i<3&&pool.length;i++)befriend(a,pool.splice(Math.floor(Math.random()*pool.length),1)[0]);if(Math.random()<.5&&S.A.length>2)befriend(a,pk(S.A))}
function leave(a){a.fr.forEach(id=>{const b=byId(id);if(b)b.fr=b.fr.filter(x=>x!=a.id)});S.A=S.A.filter(x=>x!==a);AMAP.delete(a.id)}
const agree=(a,b)=>{let s=0;for(let i=0;i<NI;i++)s+=a.v[i]*b.v[i];return s};
// ---------- посты ----------
let POOL=[],pid=0;
function stanceText(t,s,e){if(ISSUE_OF(t)<0)return e==3?pk(NICE):pk(NEU.concat(NICE));return s>.3?pk(PRO):s<-.3?pk(CON):pk(NEU)}
function post(o){const p=Object.assign({id:++pid,born:S.t,rx:0,neg:0,sh:new Set(),seenN:0,man:0,tg:null,img:false,vid:false,s:0,e:4,h:.5},o);p.toks=toks(p.txt);if(p.img)p.ph=photoFor(p.t);p.av=p.avi!=null?p.avi:avOf(p.auN||'');return p}
function agentPost(au,ev){let t;if(ev&&Math.random()<.7)t=ev.t;else{const w=au.it.map((x,i)=>x*S.trend[i]);let r=Math.random()*w.reduce((x,y)=>x+y),i=0;for(;i<w.length;i++){r-=w[i];if(r<=0)break}t=Math.min(i,NT-1)}
 if(!ev&&Math.random()<.15)return post({au:au.id,auN:au.n,t:BYT,txt:pk(['Всем доброе утро!','Пятница, ура','Опять дождь','Кофе — лучший друг','Устал как собака','Посоветуйте сериал','Кот спит на клавиатуре','Пробка на мосту','Купил новые кроссы','Кто на шашлыки в субботу?','Ремонт третий месяц','Сделала пирог, все довольны']),h:.2,e:0});
 const is=ISSUE_OF(t);const s=is>=0?clamp(au.v[is]+gauss()*.3,-1,1):0;const k=ev&&ev.t==t?pk(ev.k):pk(TOPICS[t].k);
 const e=is>=0?(Math.abs(s)>.5?(s<0?1:0):4):pk([0,3,4]);const op=pk(OPN),sec=pk(SEC),form=Math.random();let txt;
 if(ev&&ev.t==t&&Math.random()<.6)txt=(s>.3?pk(['Полностью за: ','Наконец-то! ','Это правильно: ']):s<-.3?pk(['Это позор: ','Кто это придумал?! ','Против! ']):pk(['Не знаю, что думать: ','Интересно, ']))+ev.head.toLowerCase()+(s>.3?'. Поддерживаю.':s<-.3?'. Позор.':'.');
 else if(form<.6)txt=(op?op+' ':'')+k+' — '+stanceText(t,s,e)+(e==1?'!!!':pk(['.','!','...']))+(sec?' '+sec:'');
 else if(form<.8)txt=pk(WHO)+' '+pk(['говорит, что','уверен, что','клянётся, что','рассказал, что'])+' '+k+' — '+stanceText(t,s,e)+'.';
 else txt=pk(['Почему все молчат про','Вы тоже устали от темы','Как вам новости про','Что думаете про'])+' «'+k+'»?'+(sec?' '+sec:'');
 return post({au:au.id,auN:au.n,t,s,e,txt:txt[0].toUpperCase()+txt.slice(1),h:clamp(.25+Math.abs(s)*.4+(op?.15:0)+(e==1?.15:0)+gauss()*.08,0,1),img:has('photo')&&Math.random()<.45,vid:has('video')&&Math.random()<.25,ev:ev?ev.id:null})}
// ---------- аудитории и правила ----------
function audMatch(u,a){if(!u)return true;if(u.d!=null&&u.d>=0&&a.d!=u.d)return false;if(u.issue!=null&&u.issue>=0){const v=a.v[u.issue];if(u.side>0&&v<.15)return false;if(u.side<0&&v>-.15)return false}
 if(u.age=='young'&&a.age>25)return false;if(u.age=='old'&&a.age<50)return false;if(u.cl!=null&&u.cl>=0&&a.cl!=u.cl)return false;return true}
function condMatch(c,p){if(c.word&&!p.toks.includes(c.word))return false;if(c.topic!=null&&c.topic>=0&&p.t!=c.topic)return false;if(c.stance){if(c.stance>0&&p.s<=.25)return false;if(c.stance<0&&p.s>=-.25)return false}
 if(c.emo!=null&&c.emo>=0&&p.e!=c.emo)return false;if(c.src=='story'&&!p.story)return false;if(c.src=='news'&&!p.news)return false;if(c.src=='people'&&(p.story||p.news||p.wave))return false;if(c.src=='wave'&&!p.wave)return false;if(c.src=='pol'&&p.cand==null&&!p.dir)return false;return true}
const cpuTotal=()=>Math.max(1,3+techEff('cpu')+S.srv*12-S.cpuLaw-(S.auto&&S.auto.goal!='off'&&has('autopilot')?10:0));
const upEff=k=>techEff(k);
const rulesUsed=()=>S.rules.filter(r=>r.on).length;
// ---------- шаг ----------
let L={inc:0,eng:0,anger:0};
const K=()=>4+(has('comments')?1:0)+(has('notif')?1:0)+(has('infinite')?2:0);
const ENGV=.0006;
function step(){S.t++;const nA=S.A.length;
 // новые посты жителей копятся во входящей пачке; раз в feedT секунд пачка уходит в ленту
 const rate=.6+nA/80;const ev=S.act.find(x=>x.ev&&x.evEnd>S.t);
 for(let i=0;i<rate;i++)if(Math.random()<rate/Math.ceil(rate)&&nA)S.batch.push(agentPost(pk(S.A),ev?ev.ev:null));
 storyTick();
 if(S.t>=S.nextFeed){flush();S.nextFeed=S.t+S.feedT;S.batchAt=S.t}
 if(S.batch.length>40)S.batch=S.batch.filter(p=>p.wave||p.cand!=null||p.crisis||p.pers||p.dir||p.story).concat(S.batch.filter(p=>!(p.wave||p.cand!=null||p.crisis||p.pers||p.dir||p.story)).slice(-24)).slice(-40);
 POOL=POOL.filter(p=>S.t-p.born<150);if(POOL.length>160)POOL=POOL.slice(-160);
 const RL=S.rules.filter(r=>r.on);POOL.forEach(p=>{p.rm=RL.map(r=>condMatch(r.cond,p))});
 const k=K();let eng=0,anger=0,inc=0,incT=0,incV=0;const UU=U(),adF=adFactor(),rxB=S.boostRx>S.t?.4:0,slow=S.slow>S.t?.5:1,cpmM=1+techEff('cpm');
 const CT=S.ctl={mv:0,mrx:0,minc:0,mneg:0,pv:0,prx:0,pinc:0,pneg:0};const pinc1=UU*ENGV*cpmM*adF*slow;
 for(const a of S.A){if(S.off[a.d]>S.t||Math.random()>a.act)continue;const fr=a.fr;let best=[],negs=null;
  for(const p of POOL){if(p.wave)continue;let sc=1.2*Math.exp(-(S.t-p.born)/40)+(has('likes')?Math.min(1.2,p.rx/(nA*.04+3)):0);
   if(p.man&&audMatch(p.tg,a))sc+=p.man;
   if(has('pers1'))sc+=a.it[Math.min(p.t,NT-1)]*(has('pers2')?1.4:.7)*(p.t==BYT?0:1);
   if(p.sh.size){let c=0;for(let i=0;i<fr.length&&c<3;i++)if(p.sh.has(fr[i]))c++;sc+=c*.6}
   if(p.au&&fr.includes(p.au))sc+=.7;
   let push=p.man&&audMatch(p.tg,a)?1:0,ctl=p.man&&audMatch(p.tg,a)?p.man:0;for(let i=0;i<RL.length;i++)if(p.rm[i]&&audMatch(RL[i].aud,a)){sc+=RL[i].w;ctl+=RL[i].w;if(RL[i].w>0)push=1}
   if(ctl<0)(negs||(negs=[])).push([sc-ctl,p]);
   if(best.length<=k||sc>best[best.length-1][0]){best.push([sc,p,push,ctl]);best.sort((x,y)=>y[0]-x[0]);if(best.length>k+1)best.pop()}}
  const runner=best.length>k?best.pop():null; // пост, который был бы показан вместо управляемого
  // разделение: управляемый показ — пост попал в ленту только благодаря ▲/правилу; предотвращённый — без ▼ попал бы
  const th=best.length<k?-1e9:best[best.length-1][0];for(const b of best)b[4]=b[3]>0&&b[0]-b[3]<th;
  const lastP=best.length?best[best.length-1][1]:null;
  if(negs)for(const[os,p]of negs)if(os>th){p.pv=(p.pv||0)+1;CT.pv++;if(lastP){const rp=peOf(a,lastP)*.8;p.prep=(p.prep||0)+rp;p.pirep=(p.pirep||0)+rp*pinc1*advMult(a)*(lastP.vid?1.6:1)}const is=p.t<NT?ISSUE_OF(p.t):-1;const agr=is>=0?a.v[is]*p.s:0;const pe=sigm(-1.4+2*p.h+1.5*(p.t>=NT?.3:a.it[p.t])+1.4*Math.abs(agr)+(p.img?.25:0)+(p.vid?.3:0)+(p.char?.6:0));p.prx=(p.prx||0)+pe;CT.prx+=pe;const pi=pe*pinc1*advMult(a)*(p.vid?1.6:1);p.pinc=(p.pinc||0)+pi;CT.pinc+=pi;if(agr<-.12){p.pneg=(p.pneg||0)+pe;CT.pneg+=pe}}
  a.feed=best.map(b=>b[1].id);{const ts=new Set(best.map(b=>b[1].t));a.div=(a.div==null?.6:a.div)*.95+.05*(best.length?ts.size/best.length:1)}
  let bi=0;for(const[,p,push,,mg]of best){const posM=best.length>1?1.3-.5*bi/(best.length-1):1.15;bi++;const pw=push?1:.07;p.seenN++;if(mg){p.mv=(p.mv||0)+1;CT.mv++;if(runner){const rp=peOf(a,runner[1])*.8,ri=rp*pinc1*advMult(a)*(runner[1].vid?1.6:1);p.drx=(p.drx||0)+rp;p.dinc=(p.dinc||0)+ri;CT.drx=(CT.drx||0)+rp;CT.dinc=(CT.dinc||0)+ri}}S.stat.views++;if(push&&p.story&&!p.man){const st=S.act.find(x=>x.id==p.story);if(st){st.up=true;st.reacted=true}}if(p.story)storySeen(p,a);const is=p.t<NT?ISSUE_OF(p.t):-1;const agr=is>=0?a.v[is]*p.s:0;const ti=p.t>=NT?.3:a.it[p.t];
   const pe0=sigm(-1.4+2*p.h+1.5*ti+1.4*Math.abs(agr)+(p.img?.25:0)+(p.vid?.3:0)+(p.char?.6:0)+rxB+techEff('rx')-(has('divers')?.12:0));
   a.vw=(a.vw||0)+1;const pe=Math.min(.97,pe0*posM);if(Math.random()<pe){a.got=(a.got||0)+1;const angry=agr<-.12;p.rx++;eng++;a.eng++;a.last=p.txt;const am=advMult(a),vm=p.vid?(has('vidads')?2.9:1.6):1;const base=UU*ENGV*cpmM*adF*slow;const val=vm*base*am;inc+=val;incT+=vm*base*(am-1);incV+=(vm-1)*base;if(mg){p.mrx=(p.mrx||0)+1;p.minc=(p.minc||0)+val;CT.mrx++;CT.minc+=val}
    if(angry){p.neg++;anger++;a.mood-=.015;if(mg){p.mneg=(p.mneg||0)+1;CT.mneg++}}else a.mood+=.008;if(p.story)storyReact(p,a,angry);
    // взгляды тянутся к тому, с чем человек согласен; несогласие слегка отталкивает
    if(is>=0&&mg)p.mdv=(p.mdv||0)+Math.abs(.025*pw*(p.s-a.v[is])*Math.abs(p.s));if(is>=0)a.v[is]=clamp(a.v[is]+.025*(p.pers&&has('celebs')?Math.max(pw,.4):pw)*(p.s-a.v[is])*Math.abs(p.s),-1,1);
    S.stat.rx++;if(Math.random()<(angry?.15:.09)*(has('reposts')?1.5:.6)){p.sh.add(a.id);S.stat.sh++;if(mg)p.msh=(p.msh||0)+1}
    // дружбы: рвутся только при сильном несогласии, заводятся при сильном согласии
    if(p.au&&p.au!=a.id){const b=byId(p.au);if(b){if(angry&&Math.abs(a.v[is]||0)>.45&&fr.includes(b.id)&&Math.random()<.1*pw*(has('unfollow')?1.6:1))unfriend(a,b);else if(agr>.2&&!fr.includes(b.id)&&Math.random()<.06*pw)befriend(a,b)}}}}}
 // рост: приходят по репостам (вирусность), уходят от скуки и злости
 let newSh=0;const shp=[];POOL.forEach(p=>{const n=p.sh.size-(p.shc||0);if(n>0){newSh+=n;p.shc=p.sh.size;if(p.msh)shp.push([p,n*Math.min(1,p.msh/p.sh.size)])}});
 const joinP=(newSh*.06*(1+upEff('reach'))+.02)*(.55+.8*S.trust);let joins=Math.floor(joinP)+(Math.random()<joinP%1?1:0);S.stat.join+=joins;if(newSh)for(const[p,m]of shp){const j=joinP*m/newSh;p.mjoin=(p.mjoin||0)+j;CT.mjoin=(CT.mjoin||0)+j}
 S.tot.joined+=joins*UU;for(let i=0;i<joins;i++){if(S.A.length<agentCap()){const host=pk(S.A);addAgent(mkAgent({d:Math.random()<.6&&host?host.d:undefined}),host)}else S.extraA=(S.extraA||0)+1}
 S.mult=60*(1+(S.extraA||0)/Math.max(1,S.A.length))*(S.multFx||1);
 S.A.forEach(a=>{a.mood*=.995;if(a.vw){a.sat=(a.sat==null?.4:a.sat)*.95+.05*((a.got||0)/a.vw)}a.got=0;a.vw=0;
  a.age2=(a.age2||0)+1;const why=churnCause(a);if(why){leave(a);S.stat[why]=(S.stat[why]||0)+1;S.stat.left=(S.stat.left||0)+1;S.tot.left+=UU}});
 // экономика
 const rs=scaleStep();const dat=S.sell&&has('selldata')?totalUsers()*.00003*cpmM/60:0;const pol=S.pol&&S.pol.camp&&has('polads')?(inc+rs.inc)*.3:0;
 const inc0=inc;const tot=inc+rs.inc+dat+pol;const el=elecRate()+rs.el;S.revM.ads=(S.revM.ads||0)+inc-incT-incV+rs.inc-rs.intl;S.revM.tgt=(S.revM.tgt||0)+incT;S.revM.vid=(S.revM.vid||0)+incV;S.revM.intl=(S.revM.intl||0)+rs.intl;S.revM.data=(S.revM.data||0)+dat;S.revM.pol=(S.revM.pol||0)+pol;S.tot.adv+=incT;
 if(S.sell&&has('selldata'))S.trustDebt=(S.trustDebt||0)+.00002;organicTick();S.tot.left+=rs.lost;S.tot.joined+=rs.joined;
 S.mon.rev+=tot;S.mon.el+=el;S.m+=tot;S.earned+=tot;S.watch+=eng*UU+rs.watch;inc=tot;
 if(S.t-S.mon.start>=MONTH)monthEnd();
 actTick(UU);L={inc,eng,anger,users:totalUsers()};S.tot.views+=eng*UU*3;if(S.tot.v0==null&&S.t>5)S.tot.v0=S.polar;ema('inc',inc*60,.08);ema('users',L.users,.15);ema('anger',anger/(eng+1),.05);
 S.hist.push(inc*60);if(S.hist.length>150)S.hist.shift();
 if(S.t%10==0){clusters();S.polar=polarization()}
 ['mv','mrx','minc','pv','prx','pinc','mneg','pneg','mjoin','drx','dinc'].forEach(k=>S.stat[k]=(S.stat[k]||0)+(CT[k]||0));S.stat.inc=(S.stat.inc||0)+tot;S.stat.vinc=(S.stat.vinc||0)+inc0;S.stat.uu=UU;
 if(S.t%10==0){S.stat.rjoin=Math.round(rs.joined);S.statH.push(Object.assign({t:S.t,users:S.A.length},S.stat));if(S.statH.length>30)S.statH.shift();S.stat={join:0,bored:0,angry:0,views:0,rx:0,sh:0,left:0}}
 layoutStep();newsTick()}
function churnCause(a){const hab=1-Math.min(.6,techEff('habit')+Math.min(.2,(a.age2||0)/3000));const r=Math.random;
 if(a.sat<.15&&r()<.01*hab)return 'bored';if(a.mood<-1&&r()<.015*hab)return 'angry';
 const ma=a.v.reduce((s,x)=>s+Math.abs(x),0)/NI;if(S.polar>.42&&ma>.55&&a.mood<0&&r()<(S.polar-.42)*.04*hab)return 'polar';
 if(a.div!=null&&a.div<.4&&r()<monoHaz()*4*(.4-a.div)/.4*hab)return 'mono';if(a.fr.length<2&&S.A.length>30&&r()<.0025*hab)return 'iso';
 if(S.trust<.5&&r()<(.5-S.trust)*.012*hab)return 'trust';if(r()<adHaz(1)*(a.ads||1)*hab)return 'ads';if(a.age>=50&&r()<loadHaz(2)*hab)return 'load';return ''}
function flush(){const RL=S.rules.filter(r=>r.on);for(const p of S.batch){if(p.wave){resolveWave(p);continue}
  let dir=p.man>0?1:p.man<0?-1:0;if(!dir){const w=ruleWeightFor(p,null);if(w)dir=Math.sign(w)}
  if(!dir&&S.auto&&S.auto.goal!='off'&&has('autopilot')){const d=autoDir(p,S.auto.goal,S.auto.i,S.auto.side);if(d){p.man=d>0?1.5:-3;p.auto=1;dir=d}}
  if(dir){if(p.cand!=null&&S.pol&&S.pol.camp)campPush(p.cand,dir,'v');if(p.crisis&&S.crisis)crisisAct(dir);if(p.dir&&S.final)S.final.push.v=(S.final.push.v||0)+dir;if(p.pers)persReact(p,dir)}
  POOL.push(p)}S.batch=[]}
function agentCap(){return Math.min(1500,60+S.srv*150+Math.round(techEff('cap')))}
function ema(k,v,a){S.ema[k]=S.ema[k]==null?v:S.ema[k]+(v-S.ema[k])*a}
// ---------- электричество и налоги ----------
function elecRate(){return (S.A.length*.04+rulesUsed()*.15+S.srv*1)*S.elec*U()/60*.06*(has('planetdc')?.5:1)}
function monthEnd(){const gov=govPay();S.m+=gov;const rev=S.mon.rev+gov,el=S.mon.el,fine=S.pol?S.pol.reg*rev*.03:0,profit=Math.max(0,rev-el),tax=profit*S.tax/100;S.m-=el+tax+fine;
 S.bills.unshift({mon:S.bills.length+1,rev,el,tax,rate:S.tax,fine,gov,lines:Object.assign({},S.revM)});S.revM={};S.bills.length=Math.min(24,S.bills.length);
 toast('🧾 Конец месяца: свет и серверы $'+f(el)+', налог '+S.tax+'% — $'+f(tax)+(fine?', штрафы регуляторов $'+f(fine):'')+(gov?', госконтракт +$'+f(gov):''));S.mon={rev:0,el:0,start:S.t};if(S.m<0)mail('<b>Бухгалтерия:</b> счёт ушёл в минус. Пока долг не погашен, покупки заблокированы.')}
// ---------- кластеры ----------
function clusters(){const A=S.A;if(A.length<8)return;const k=clamp(Math.round(A.length/45),3,8);let C=(S.cent&&S.cent.length==k)?S.cent.map(c=>c.slice()):Array.from({length:k},()=>pk(A).v.slice());
 for(let it=0;it<6;it++){const sum=C.map(()=>Array(NI).fill(0)),cnt=Array(k).fill(0);for(const a of A){let bi=0,bd=1e9;for(let i=0;i<k;i++){let d=0;for(let j=0;j<NI;j++)d+=(a.v[j]-C[i][j])**2;if(d<bd){bd=d;bi=i}}a.cl=bi;cnt[bi]++;for(let j=0;j<NI;j++)sum[bi][j]+=a.v[j]}C=C.map((c,i)=>cnt[i]?sum[i].map(x=>x/cnt[i]):pk(A).v.slice())}S.cent=C;
 S.clusters=C.map((v,i)=>{const m=A.filter(a=>a.cl==i);let dom=0;v.forEach((x,j)=>{if(Math.abs(x)>Math.abs(v[dom]))dom=j});
  // пузырь = насколько круг друзей однороден И насколько взгляды крайние
  let same=0,tot=0;m.forEach(a=>a.fr.forEach(id=>{const b=byId(id);if(!b)return;tot++;if(Math.sign(b.v[dom])==Math.sign(v[dom])&&Math.abs(b.v[dom])>.3)same++}));
  const ext=m.reduce((s,a)=>s+Math.abs(a.v[dom]),0)/(m.length||1);const name=Math.abs(v[dom])<.2?'Умеренные':(v[dom]>0?ISSUES[dom].pro:ISSUES[dom].con);
  return {id:i,n:name[0].toUpperCase()+name.slice(1),size:m.length,v,dom,bubble:tot?(same/tot)*clamp(ext*1.5,0,1):0,col:'hsl('+((i*47+(v[dom]>0?0:20))%360)+',70%,58%)',mood:m.length?m.reduce((s,a)=>s+a.mood,0)/m.length:0}})}
function polarization(){let s=0;S.A.forEach(a=>s+=a.v.reduce((x,y)=>x+Math.abs(y),0)/NI);return S.A.length?s/S.A.length:0}
function layoutStep(){const A=S.A;for(const a of A){let fx=0,fy=0,n=0;for(const id of a.fr){const b=byId(id);if(!b)continue;fx+=b.x;fy+=b.y;n++}const vx=a.v[0]*.5+a.v[6]*.5,vy=a.v[5]*.5-a.v[1]*.5;let tx=vx,ty=vy;if(n){tx=.5*fx/n+.5*vx;ty=.5*fy/n+.5*vy}a.x+=(tx-a.x)*.05+gauss()*.004;a.y+=(ty-a.y)*.05+gauss()*.004}}
// ---------- сюжеты ----------
function charName(sex){const ln=pk(LN);return sex=='f'?pk(FN_F)+' '+lnF(ln):pk(FN_M)+' '+ln}
function storyStart(def){const d=Math.floor(Math.random()*ND);const ch={};Object.entries(def.ch).forEach(([k,sx])=>{if(sx[0]=='@'){const P=PERS.find(x=>x.id==sx.slice(1));ch[k]={n:P.n,seed:P.i,pid:P.id}}else ch[k]={n:charName(sx),seed:Math.floor(Math.random()*1e6)}});
 const st={id:'s'+(++S.storyId||(S.storyId=1)),k:def.k,node:'start',at:S.t,d,ch,pl:pk(PLACES),seen:new Set(),rx:0,neg:0,up:false,dn:false,reacted:false,news:!!def.news,queue:[]};
 S.act.push(st);enterNode(st,'start');}
function sub(st,s){return s.replace(/\{A\}/g,(st.ch.A||{}).n||'').replace(/\{B\}/g,(st.ch.B||{}).n||'').replace(/\{d\}/g,'«'+DISTRICTS[st.d]+'»').replace(/\{p\}/g,st.pl)}
function enterNode(st,key){const def=SL.find(x=>x.k==st.k);const nd=def.n[key];st.node=key;st.at=S.t;st.seen=new Set();st.rx=0;st.neg=0;st.up=false;st.dn=false;
 if(nd.end!=null){finishStory(st,nd);return}
 nd.p.forEach((q,i)=>st.queue.push({at:S.t+Math.floor(i*nd.w/(nd.p.length+1))+2,q}))}
function storyTick(){if(has('stories')||S.t>40){if(S.t>=S.nextStory&&S.act.filter(s=>!s.news).length<3){const pool=SL.filter(s=>!s.news&&!S.used.includes(s.k)&&storyOk(s));const ch=pool.filter(s=>s.req);if(ch.length&&Math.random()<.7)pool.splice(0,pool.length,...ch);if(pool.length){const d=pk(pool);S.used.push(d.k);storyStart(d)}S.nextStory=S.t+45+Math.floor(Math.random()*45)}
  if(S.t>=S.nextNewsArc&&S.act.filter(s=>s.news).length<1){const pool=SL.filter(s=>s.news&&!S.used.includes(s.k)&&storyOk(s));if(pool.length){const d=pk(pool);S.used.push(d.k);storyStart(d)}S.nextNewsArc=S.t+120+Math.floor(Math.random()*90)}}
 if(S.used.length>=SL.length-4){S.used=S.used.filter(k=>{const d=SL.find(x=>x.k==k);return d&&d.req}).concat(S.used.slice(-8))}
 S.act.forEach(st=>{if(st.k=='event')return;st.queue=st.queue.filter(it=>{if(S.t<it.at)return true;const[who,txt,s,e]=it.q;let auN,au=0,char=null,seed=0;
   if(who=='N'){auN=pk(OUT)}else if(who=='D'){auN='Директор «Ленты»';seed=99;char='Директор'}else if(who=='x'){const a=pk(S.A);auN=a?a.n:'Житель';au=a?a.id:0}else{const c=st.ch[who];auN=c.n;seed=c.seed;char=c.n}
   const T=SL.find(x=>x.k==st.k).t;
   if(who=='N'){S.news.unshift({txt:sub(st,txt),src:auN,at:S.t,st:st.id});const ev={t:T,k:TOPICS[T].k,head:sub(st,txt).replace(/[.!].*$/,'')};for(let j=0;j<4;j++){const a=pk(S.A);if(a){const dp=agentPost(a,ev);dp.t=T;dp.story=st.id;dp.born=S.t;S.batch.push(dp)}}return false}
   const p=post({auN,au,seed,char,t:T,s,e,h:.6+Math.random()*.15,txt:sub(st,txt),story:st.id,img:has('photo')&&Math.random()<.5});S.batch.push(p);return false});
  const def=SL.find(x=>x.k==st.k),nd=def.n[st.node];if(!nd||nd.end!=null)return;
  if(S.t-st.at>=nd.w&&!st.queue.length){const m=metrics(st);
   // если игрок ни разу не отреагировал на первом узле — история проходит мимо него
   if(st.node=='start'&&!st.reacted&&!st.news){enterNode(st,def.fade);return}
   const nx=nd.go.find(([c])=>c===1||c(m));enterNode(st,nx?nx[1]:def.fade)}});
 S.act=S.act.filter(s=>!s.done||S.t-s.doneAt<20)}
function storySeen(p,a){const st=S.act.find(x=>x.id==p.story);if(st&&!st.done)st.seen.add(a.id)}
function storyReact(p,a,angry){const st=S.act.find(x=>x.id==p.story);if(st){st.rx++;if(angry)st.neg++}}
function metrics(st){const n=Math.max(1,S.A.length);const viewers=[...st.seen].map(byId).filter(Boolean);const vn=Math.max(1,viewers.length);
 return {v:viewers.length/n,r:st.rx/Math.max(1,viewers.length),up:st.up,dn:st.dn,ang:st.rx?st.neg/st.rx:0,dist:viewers.filter(a=>a.d==st.d).length/vn,
  pro:i=>viewers.filter(a=>a.v[i]>.3).length/vn,con:i=>viewers.filter(a=>a.v[i]<-.3).length/vn}}
function finishStory(st,nd){st.done=true;st.doneAt=S.t;S.flags[st.k]=1;S.flags[st.k+':'+st.node]=1;if((nd.fx||[]).some(x=>x=='mood:-'||/^users:-/.test(x)))S.tot.bad++;st.out=sub(st,nd.end);if(st.out){S.news.unshift({txt:st.out,src:pk(OUT),at:S.t,res:true});S.chron.unshift({t:S.t,k:st.k,out:st.out,d:st.d,reacted:st.reacted});if(st.reacted)toast(st.out)}
 applyFx(nd.fx||[],st)}
function applyFx(fx,st){fx.forEach(e=>{const[k,...r]=e.split(':');const rest=r.join(':');
 if(k=='char'){const[who,...lines]=rest.split('|');const c=st.ch[who];if(!c)return;const ex=S.chars.find(x=>x.n==c.n);const L=lines.map(x=>sub(st,x));if(ex)ex.lines.push(...L);else{S.chars.push({n:c.n,seed:c.seed,lines:L,k:st.k,d:st.d,at:S.t});const a=mkAgent({d:st.d,n:c.n,char:c.n,seed:c.seed});addAgent(a,pk(S.A));if(st.reacted)mail(face(c.n,c.seed)+'<b>'+esc(c.n)+':</b> '+esc(L[0]))}}
 if(k=='mood')S.A.forEach(a=>{if(a.d==st.d)a.mood+=rest=='+'?.3:-.3});
 if(k=='view'){const[i,dv]=rest.split(':');S.A.forEach(a=>{if(a.d==st.d)a.v[+i]=clamp(a.v[+i]+(+dv)*.6,-1,1)})}
 if(k=='money'){S.m+=(S.ema.inc||1)*(+rest)/60}if(k=='fine'){S.m-=(S.ema.inc||1)*(+rest)/60;toast('⚖️ Штраф: $'+f((S.ema.inc||1)*(+rest)/60))}
 if(k=='adv'){if(!S.extraAdv.some(x=>x.n==rest))S.extraAdv.push({n:rest,mult:.08})}
 if(k=='off')S.off[st.d]=S.t+(+rest);if(k=='trend')S.trend[+rest]+=2;
 if(k=='users'){const pc=+rest;if(pc>0)S.multFx=(S.multFx||1)*(1+pc/100);else for(let i=0;i<S.A.length*(-pc)/100;i++)leave(pk(S.A))}
 if(k=='polar')S.A.forEach(a=>{if(a.d==st.d)a.v=a.v.map(x=>clamp(x*1.08,-1,1))});
 if(k=='tax'){S.tax=clamp(S.tax+(+rest),5,60);mail('<b>Бухгалтерия:</b> ставка налога на прибыль теперь '+S.tax+'%')}
 if(k=='flag')S.flags[rest]=1;if(k=='unflag')delete S.flags[rest];if(k=='trust'){const lb='История: '+((st&&st.out)||'').replace(/^[^А-ЯЁA-Z«]+/,'').slice(0,60);if(+rest<0)hitTrust(-rest/100,lb);else{S.trust=clamp(S.trust+(+rest)/100,0,1);trustLog(lb,+rest/100)}}
 if(k=='rel'){const[id,dv]=rest.split(':');pers(id).rel=clamp(pers(id).rel+(+dv)/100,-1,1)}if(k=='fame'){const[id,dv]=rest.split(':');pers(id).fame*=1+(+dv)/100}
 if(k=='reg'){if(S.pol)S.pol.reg=Math.max(0,S.pol.reg+(+rest));S.cpuLaw=Math.max(0,S.cpuLaw+(+rest)*6)}if(k=='boost')S.boost=S.t+(+rest);if(k=='regu'){const[rk,dv]=rest.split(':');const r=rg(rk);if(r.unl)r.u*=1+(+dv)/100}
 if(k=='elec'){S.elec*=1+(+rest)/100;mail('<b>Бухгалтерия:</b> тариф на электричество изменился: ×'+S.elec.toFixed(2))}})}
// ---------- мировые события (их обсуждают все) ----------
const FLAVOR=[[2,'На улице Садовой сгорел гараж. Пожарные потушили огонь за 20 минут, никто не пострадал'],[3,'Ограбили продуктовый магазин у рынка. Грабитель унёс кассу и коробку шоколадок'],[3,'Городской совет принял закон о тишине после 22:00'],[13,'На мосту столкнулись три машины, пробка до вокзала'],[9,'В Центре открылась новая шаурмичная — очередь с утра'],[4,'В парке Победы видели лису. Зоологи просят её не кормить'],[8,'Местная футбольная команда выиграла третий матч подряд'],[10,'В поликлинике №2 ремонт: приём перенесли в соседнее здание'],[11,'Школьники из Университетского района выиграли олимпиаду по физике'],[0,'Сеть «Всё» снизила цены на молоко на 5%'],[2,'Река в Заречье вышла из берегов, подтоплены огороды'],[6,'В городе запустили беспилотный автобус. Пока по одному маршруту'],[5,'В Старом городе отреставрировали фонтан 1950 года'],[12,'Известный блогер переехал в Вальдию'],[1,'В порту приняли 300 сезонных рабочих'],[3,'Мэр пообещал новые светофоры к осени'],[13,'Платные парковки расширили до Новостроек'],[0,'Завод «Химпром» сократил 200 сотрудников'],[9,'Фермерская ярмарка пройдёт в субботу на площади'],[2,'Жители Промзоны жалуются на запах с завода'],[10,'Врачи предупреждают о вспышке гриппа'],[7,'В Университетском открылся компьютерный клуб'],[4,'Кот из приюта стал талисманом библиотеки'],[3,'Полиция задержала банду угонщиков'],[11,'В школах введут форму нового образца'],[6,'Городские камеры будут распознавать лица'],[8,'Открылся бесплатный каток в Центре'],[12,'Певица отменила концерт в Вальдии'],[0,'Пенсии проиндексируют на 4%'],[5,'Ветераны Заречья открыли музей двора'],[1,'В общежитии на Строителей прошла проверка документов'],[13,'Бензин подорожал на 2 рубля'],[2,'Волонтёры убрали 3 тонны мусора с набережной'],[9,'Пекарня в Дачном испекла самый длинный батон'],[10,'В городе открылся бесплатный пункт сдачи крови'],[3,'Депутата поймали на парковке для инвалидов'],[6,'Сбой мобильной связи в Новостройках продлился три часа'],[11,'Учителям подняли зарплату на 7%'],[4,'Собака спасла хозяина из горящего дома'],[8,'Городской марафон перенесли из-за жары']];
const EVENTS=FLAVOR;
function newsTick(){if(S.t>=(S.nextFlavor||8)){const n=pk(FLAVOR);S.news.unshift({txt:n[1],src:pk(OUT),at:S.t});S.nextFlavor=S.t+14+Math.floor(Math.random()*14);
  // часть новостей жители обсуждают в ленте с разных сторон
  if(Math.random()<.45){const ev={id:'e'+S.t,t:n[0],k:TOPICS[n[0]].k,head:n[1].replace(/[.!].*$/,'').split(',')[0]};S.act.push({id:ev.id,k:'event',ev,evEnd:S.t+60,done:false,queue:[]});S.trend[n[0]]+=1.5}}
 S.act=S.act.filter(s=>s.k!='event'||s.evEnd>S.t);S.news.length=Math.min(80,S.news.length)}
function newsItem(st){}
function peOf(a,p){const is=p.t<NT?ISSUE_OF(p.t):-1;const agr=is>=0?a.v[is]*p.s:0;return sigm(-1.4+2*p.h+1.5*(p.t>=NT?.3:a.it[p.t])+1.4*Math.abs(agr)+(p.img?.25:0)+(p.vid?.3:0)+(p.char?.6:0))}
function storyOk(d){return (d.era||0)<=era()&&(!d.req||d.req())}
function init(){for(let i=0;i<24;i++)addAgent(mkAgent(),S.A.length?pk(S.A):null);for(let i=0;i<20;i++)POOL.push(agentPost(pk(S.A)));S.mon.start=0}
