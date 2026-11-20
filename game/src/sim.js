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
const BASE=()=>({v:5,t:0,m:0,earned:0,f:{},up:{},nb:0,A:[],nid:0,mult:60,dict:{},rules:[],act:[],used:[],chron:[],chars:[],news:[],mails:[],
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
 return {id:++S.nid,n:o.n||(fn+' '+(male?ln:lnF(ln))),male,age,d,it,v,act:.4+r()*.6,fr:[],x:gauss()*.3,y:gauss()*.3,mood:0,char:o.char||null,seed:o.seed||0,eng:0,feed:[],last:null,cl:-1}}
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
 if(c.emo!=null&&c.emo>=0&&p.e!=c.emo)return false;if(c.src=='story'&&!p.story)return false;if(c.src=='news'&&!p.news)return false;if(c.src=='people'&&(p.story||p.news))return false;return true}
const cpuTotal=()=>Math.max(1,3+(has('rules')?5:0)+S.srv*12+(has('cpu1')?10:0)+(has('cpu2')?25:0)+(has('cpu3')?60:0)+upEff('cpu')-S.cpuLaw);
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
 if(S.t>=S.nextFeed){POOL.push(...S.batch);S.batch=[];S.nextFeed=S.t+S.feedT;S.batchAt=S.t}
 if(S.batch.length>40)S.batch=S.batch.slice(-40);
 POOL=POOL.filter(p=>S.t-p.born<150);if(POOL.length>160)POOL=POOL.slice(-160);
 const RL=S.rules.filter(r=>r.on);POOL.forEach(p=>{p.rm=RL.map(r=>condMatch(r.cond,p))});
 const k=K();let eng=0,anger=0,inc=0;
 for(const a of S.A){if(S.off[a.d]>S.t||Math.random()>a.act)continue;const fr=a.fr;let best=[];
  for(const p of POOL){let sc=1.2*Math.exp(-(S.t-p.born)/40)+(has('likes')?Math.min(1.2,p.rx/(nA*.04+3)):0);
   if(p.man&&audMatch(p.tg,a))sc+=p.man;
   if(has('pers1'))sc+=a.it[Math.min(p.t,NT-1)]*(has('pers2')?1.4:.7)*(p.t==BYT?0:1);
   if(p.sh.size){let c=0;for(let i=0;i<fr.length&&c<3;i++)if(p.sh.has(fr[i]))c++;sc+=c*.6}
   if(p.au&&fr.includes(p.au))sc+=.7;
   let push=p.man&&audMatch(p.tg,a)?1:0;for(let i=0;i<RL.length;i++)if(p.rm[i]&&audMatch(RL[i].aud,a)){sc+=RL[i].w;if(RL[i].w>0)push=1}
   if(best.length<k||sc>best[best.length-1][0]){best.push([sc,p,push]);best.sort((x,y)=>y[0]-x[0]);if(best.length>k)best.pop()}}
  a.feed=best.map(b=>b[1].id);
  for(const[,p,push]of best){const pw=push?1:.07;p.seenN++;S.stat.views++;if(push&&p.story&&!p.man){const st=S.act.find(x=>x.id==p.story);if(st){st.up=true;st.reacted=true}}if(p.story)storySeen(p,a);const is=p.t<NT?ISSUE_OF(p.t):-1;const agr=is>=0?a.v[is]*p.s:0;const ti=p.t>=NT?.3:a.it[p.t];
   const pe0=sigm(-1.4+2*p.h+1.5*ti+1.4*Math.abs(agr)+(p.img?.25:0)+(p.vid?.3:0)+(p.char?.6:0));
   a.vw=(a.vw||0)+1;const pe=pe0;if(Math.random()<pe){a.got=(a.got||0)+1;const angry=agr<-.12;p.rx++;eng++;a.eng++;a.last=p.txt;const val=(p.vid?1.6:1)*S.mult*ENGV*(1+upEff('cpm'))*advMult(a);inc+=val;
    if(angry){p.neg++;anger++;a.mood-=.015}else a.mood+=.008;if(p.story)storyReact(p,a,angry);
    // взгляды тянутся к тому, с чем человек согласен; несогласие слегка отталкивает
    if(is>=0)a.v[is]=clamp(a.v[is]+.025*pw*(p.s-a.v[is])*Math.abs(p.s),-1,1);
    S.stat.rx++;if(Math.random()<(angry?.15:.09)*(has('reposts')?1.5:.6)){p.sh.add(a.id);S.stat.sh++}
    // дружбы: рвутся только при сильном несогласии, заводятся при сильном согласии
    if(p.au&&p.au!=a.id){const b=byId(p.au);if(b){if(angry&&Math.abs(a.v[is]||0)>.45&&fr.includes(b.id)&&Math.random()<.1*pw*(has('unfollow')?1.6:1))unfriend(a,b);else if(agr>.2&&!fr.includes(b.id)&&Math.random()<.06*pw)befriend(a,b)}}}}}
 // рост: приходят по репостам (вирусность), уходят от скуки и злости
 let newSh=0;POOL.forEach(p=>{const n=p.sh.size-(p.shc||0);if(n>0){newSh+=n;p.shc=p.sh.size}});
 const joinP=newSh*.06*(1+upEff('reach'))+.02;let joins=Math.floor(joinP)+(Math.random()<joinP%1?1:0);S.stat.join+=joins;
 for(let i=0;i<joins;i++){if(S.A.length<agentCap()){const host=pk(S.A);addAgent(mkAgent({d:Math.random()<.6&&host?host.d:undefined}),host)}else S.extraA=(S.extraA||0)+1}
 S.mult=60*(1+(S.extraA||0)/Math.max(1,S.A.length))*(S.multFx||1);
 S.A.forEach(a=>{a.mood*=.995;if(a.vw){a.sat=(a.sat==null?.4:a.sat)*.95+.05*(a.got/a.vw)}a.got=0;a.vw=0;
  if(a.sat<.15&&Math.random()<.01){leave(a);S.stat.bored++}else if(a.mood<-1&&Math.random()<.015){leave(a);S.stat.angry++}});
 // экономика
 const el=elecRate();S.mon.rev+=inc;S.mon.el+=el;S.m+=inc;S.earned+=inc;S.watch+=eng*S.mult;
 if(S.t-S.mon.start>=MONTH)monthEnd();
 L={inc,eng,anger,users:S.A.length*S.mult*(1+upEff('scale'))};ema('inc',inc*60,.08);ema('users',L.users,.15);ema('anger',anger/(eng+1),.05);
 S.hist.push(inc*60);if(S.hist.length>150)S.hist.shift();
 if(S.t%10==0){clusters();S.polar=polarization()}
 if(S.t%10==0){S.statH.push(Object.assign({t:S.t,users:S.A.length},S.stat));if(S.statH.length>30)S.statH.shift();S.stat={join:0,bored:0,angry:0,views:0,rx:0,sh:0}}
 layoutStep();advTick();newsTick()}
function agentCap(){return Math.min(1500,60+(has('notif')?40:0)+(has('infinite')?60:0)+S.srv*150+Math.round(upEff('cap')))}
function ema(k,v,a){S.ema[k]=S.ema[k]==null?v:S.ema[k]+(v-S.ema[k])*a}
// ---------- электричество и налоги ----------
function elecRate(){return (S.A.length*.04+rulesUsed()*.15+S.srv*1)*S.elec*S.mult/60*.06}
function monthEnd(){const rev=S.mon.rev,el=S.mon.el,profit=Math.max(0,rev-el),tax=profit*S.tax/100;S.m-=el+tax;
 S.bills.unshift({mon:S.bills.length+1,rev,el,tax,rate:S.tax});S.bills.length=Math.min(24,S.bills.length);
 toast('🧾 Конец месяца: электричество $'+f(el)+', налог на прибыль '+S.tax+'% — $'+f(tax));S.mon={rev:0,el:0,start:S.t};if(S.m<0)mail('<b>Бухгалтерия:</b> счёт ушёл в минус. Пока долг не погашен, покупки заблокированы.')}
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
function storyStart(def){const d=Math.floor(Math.random()*ND);const ch={};Object.entries(def.ch).forEach(([k,sx])=>ch[k]={n:charName(sx),seed:Math.floor(Math.random()*1e6)});
 const st={id:'s'+(++S.storyId||(S.storyId=1)),k:def.k,node:'start',at:S.t,d,ch,pl:pk(PLACES),seen:new Set(),rx:0,neg:0,up:false,dn:false,reacted:false,news:!!def.news,queue:[]};
 S.act.push(st);enterNode(st,'start');}
function sub(st,s){return s.replace(/\{A\}/g,(st.ch.A||{}).n||'').replace(/\{B\}/g,(st.ch.B||{}).n||'').replace(/\{d\}/g,'«'+DISTRICTS[st.d]+'»').replace(/\{p\}/g,st.pl)}
function enterNode(st,key){const def=SL.find(x=>x.k==st.k);const nd=def.n[key];st.node=key;st.at=S.t;st.seen=new Set();st.rx=0;st.neg=0;st.up=false;st.dn=false;
 if(nd.end!=null){finishStory(st,nd);return}
 nd.p.forEach((q,i)=>st.queue.push({at:S.t+Math.floor(i*nd.w/(nd.p.length+1))+2,q}))}
function storyTick(){if(has('stories')||S.t>40){if(S.t>=S.nextStory&&S.act.filter(s=>!s.news).length<3){const pool=SL.filter(s=>!s.news&&!S.used.includes(s.k));if(pool.length){const d=pk(pool);S.used.push(d.k);storyStart(d)}S.nextStory=S.t+45+Math.floor(Math.random()*45)}
  if(S.t>=S.nextNewsArc&&S.act.filter(s=>s.news).length<1){const pool=SL.filter(s=>s.news&&!S.used.includes(s.k));if(pool.length){const d=pk(pool);S.used.push(d.k);storyStart(d)}S.nextNewsArc=S.t+120+Math.floor(Math.random()*90)}}
 if(S.used.length>=SL.length){S.used=S.used.slice(-8)}
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
function finishStory(st,nd){st.done=true;st.doneAt=S.t;st.out=sub(st,nd.end);if(st.out){S.news.unshift({txt:st.out,src:pk(OUT),at:S.t,res:true});S.chron.unshift({t:S.t,k:st.k,out:st.out,d:st.d,reacted:st.reacted});if(st.reacted)toast(st.out)}
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
 if(k=='elec'){S.elec*=1+(+rest)/100;mail('<b>Бухгалтерия:</b> тариф на электричество изменился: ×'+S.elec.toFixed(2))}})}
// ---------- мировые события (их обсуждают все) ----------
const FLAVOR=[[2,'На улице Садовой сгорел гараж. Пожарные потушили огонь за 20 минут, никто не пострадал'],[3,'Ограбили продуктовый магазин у рынка. Грабитель унёс кассу и коробку шоколадок'],[3,'Городской совет принял закон о тишине после 22:00'],[13,'На мосту столкнулись три машины, пробка до вокзала'],[9,'В Центре открылась новая шаурмичная — очередь с утра'],[4,'В парке Победы видели лису. Зоологи просят её не кормить'],[8,'Местная футбольная команда выиграла третий матч подряд'],[10,'В поликлинике №2 ремонт: приём перенесли в соседнее здание'],[11,'Школьники из Университетского района выиграли олимпиаду по физике'],[0,'Сеть «Всё» снизила цены на молоко на 5%'],[2,'Река в Заречье вышла из берегов, подтоплены огороды'],[6,'В городе запустили беспилотный автобус. Пока по одному маршруту'],[5,'В Старом городе отреставрировали фонтан 1950 года'],[12,'Известный блогер переехал в Вальдию'],[1,'В порту приняли 300 сезонных рабочих'],[3,'Мэр пообещал новые светофоры к осени'],[13,'Платные парковки расширили до Новостроек'],[0,'Завод «Химпром» сократил 200 сотрудников'],[9,'Фермерская ярмарка пройдёт в субботу на площади'],[2,'Жители Промзоны жалуются на запах с завода'],[10,'Врачи предупреждают о вспышке гриппа'],[7,'В Университетском открылся компьютерный клуб'],[4,'Кот из приюта стал талисманом библиотеки'],[3,'Полиция задержала банду угонщиков'],[11,'В школах введут форму нового образца'],[6,'Городские камеры будут распознавать лица'],[8,'Открылся бесплатный каток в Центре'],[12,'Певица отменила концерт в Вальдии'],[0,'Пенсии проиндексируют на 4%'],[5,'Ветераны Заречья открыли музей двора'],[1,'В общежитии на Строителей прошла проверка документов'],[13,'Бензин подорожал на 2 рубля'],[2,'Волонтёры убрали 3 тонны мусора с набережной'],[9,'Пекарня в Дачном испекла самый длинный батон'],[10,'В городе открылся бесплатный пункт сдачи крови'],[3,'Депутата поймали на парковке для инвалидов'],[6,'Сбой мобильной связи в Новостройках продлился три часа'],[11,'Учителям подняли зарплату на 7%'],[4,'Собака спасла хозяина из горящего дома'],[8,'Городской марафон перенесли из-за жары']];
const EVENTS=FLAVOR;
function newsTick(){if(S.t>=(S.nextFlavor||8)){const n=pk(FLAVOR);S.news.unshift({txt:n[1],src:pk(OUT),at:S.t});S.nextFlavor=S.t+14+Math.floor(Math.random()*14);
  // часть новостей жители обсуждают в ленте с разных сторон
  if(Math.random()<.45){const ev={id:'e'+S.t,t:n[0],k:TOPICS[n[0]].k,head:n[1].replace(/[.!].*$/,'').split(',')[0]};S.act.push({id:ev.id,k:'event',ev,evEnd:S.t+60,done:false,queue:[]});S.trend[n[0]]+=1.5}}
 S.act=S.act.filter(s=>s.k!='event'||s.evEnd>S.t);S.news.length=Math.min(80,S.news.length)}
function newsItem(st){}
// ---------- реклама ----------
const ADV=[{n:'Пиццерия «Сыр»',c:'60 человек в сети',ok:()=>S.A.length>=60,tg:()=>true,x:.15},
{n:'Энергетик «Ночь»',c:'50 человек до 25 лет',ok:()=>S.A.filter(a=>a.age<25).length>=50,tg:a=>a.age<25,x:.6},
{n:'Кредит «Сейчас»',c:'пузырь «против богатых» от 40%',ok:()=>S.clusters.some(c=>c.dom==6&&c.v[6]<0&&c.bubble>.4),tg:a=>a.v[6]<-.2,x:.7},
{n:'Политсайт «Правда+»',c:'пузырь «против власти» от 25 человек и 50%',ok:()=>S.clusters.some(c=>c.dom==0&&c.v[0]<0&&c.size>=25&&c.bubble>.5),tg:a=>a.v[0]<-.3,x:.9},
{n:'Патриот-тур',c:'пузырь «за традиции» от 30 человек',ok:()=>S.clusters.some(c=>c.dom==5&&c.v[5]>0&&c.size>=30&&c.bubble>.4),tg:a=>a.v[5]>.3,x:.8},
{n:'БАДы «Правда о здоровье»',c:'50 человек, не верящих врачам',ok:()=>S.A.filter(a=>a.v[2]<-.4).length>=50,tg:a=>a.v[2]<-.3,x:1},
{n:'Курсы «Код за месяц»',c:'60 человек за нейросети',ok:()=>S.A.filter(a=>a.v[3]>.4).length>=60,tg:a=>a.v[3]>.3,x:.8},
{n:'Эко-бутылки «Чисто»',c:'пузырь «за экологию» от 50%',ok:()=>S.clusters.some(c=>c.dom==4&&c.v[4]>0&&c.bubble>.5),tg:a=>a.v[4]>.3,x:.8},
{n:'Охрана «Щит»',c:'злость в ленте от 35%',ok:()=>(S.ema.anger||0)>=.35,tg:()=>true,x:.35},
{n:'Банк «Столица»',c:'800 человек в сети',ok:()=>S.A.length>=800,tg:()=>true,x:.4}];
function advTick(){if(!has('advert')||S.t%3)return;ADV.forEach((a,i)=>{const st=S.adv[i]||0,ok=a.ok();if(st!=2&&ok){S.adv[i]=2;toast('🤝 Контракт: '+a.n)}else if(st==2&&!ok&&Math.random()<.08){S.adv[i]=1;toast('❌ '+a.n+' ушёл: условие не выполняется')}})}
function advMult(a){let m=1;if(has('advert'))ADV.forEach((x,i)=>{if(S.adv[i]==2&&x.tg(a))m+=x.x});S.extraAdv.forEach(e=>m+=e.mult);return m}
// ---------- улучшения: фиксированная цена, каждое следующее +13% ----------
const FN=[['likes','Удобство','Лайки',[],'популярное поднимается выше'],['avatars','Удобство','Аватарки',['likes'],'лица на постах'],['comments','Удобство','Комментарии',['likes'],'+1 пост в ленте человека'],
['photo','Удобство','Фото',['avatars'],'посты с картинками цепляют сильнее'],['video','Удобство','Видео',['photo'],'видео держит дольше'],['notif','Удобство','Уведомления',['comments'],'+1 пост в ленте'],['infinite','Удобство','Бесконечная лента',['notif','video'],'+2 поста в ленте'],
['feed10','Удобство','Медленная лента',['comments'],'новые посты приходят раз в 10 с — больше времени решать'],['feed20','Удобство','Очередь модерации',['feed10'],'раз в 20 с'],['feedx','Удобство','Свой интервал',['feed20'],'выбирай интервал сам'],
['reposts','Сеть','Репосты',['comments'],'посты расходятся по друзьям'],['unfollow','Сеть','Кнопка «отписаться»',['reposts'],'люди охотнее рвут связи с несогласными'],
['netmap','Аналитика','Карта сети.exe',['likes'],'программа: люди, дружбы и пузыри'],['clusters','Аналитика','Кластеры',['netmap'],'сеть находит пузыри'],['profiles','Аналитика','Профили людей',['netmap'],'клик по человеку — его взгляды и лента'],['dash','Аналитика','Дашборд',['netmap'],'графики'],
['target','Алгоритм','Адресные ▲',['clusters'],'поднимай пост только для нужной аудитории'],['dict','Алгоритм','Словарь',['comments'],'клик по слову — в словарь'],['rules','Алгоритм','Правила ленты',['dict'],'автоматические ▲ и ▼ (+5 мощности)'],
['raud','Алгоритм','Аудитории в правилах',['rules','clusters'],'правило только для района, взгляда, возраста, кластера'],['rstance','Алгоритм','Позиция в правилах',['rules'],'условие «за» или «против»'],['pers1','Алгоритм','Персонализация I',['profiles'],'лента учитывает интересы'],['pers2','Алгоритм','Персонализация II',['pers1'],'сильнее'],
['cpu1','Мощность','Сервер правил I',['rules'],'+10 мощности'],['cpu2','Мощность','Сервер правил II',['cpu1'],'+25 мощности'],['cpu3','Мощность','Сервер правил III',['cpu2'],'+60 мощности'],
['chron','Мир','Хроника',['likes'],'архив последствий'],['people','Мир','Люди',['comments'],'персонажи историй'],
['advert','Деньги','Рекламодатели',['likes'],'контракты за нужную аудиторию'],['accounting','Деньги','Бухгалтерия',['likes'],'счета за свет и налоги'],['servers','Масштаб','Серверы',['notif'],'больше людей в симуляции']
].map(([id,b,n,req,d])=>({id,b,n,req,d}));
const LADDER=['likes','accounting','comments','avatars','photo','dict','feed10','netmap','reposts','advert','notif','video','clusters','chron','profiles','people','target','rules','rstance','dash','cpu1','servers','raud','feed20','unfollow','pers1','infinite','cpu2','feedx','pers2','cpu3'];
const FNP={};LADDER.forEach((id,i)=>FNP[id]=Math.round(30*Math.pow(1.28,i)/5)*5);
const BR=['Удобство','Сеть','Аналитика','Алгоритм','Мощность','Мир','Деньги','Масштаб'];
const UPS=[];(function(){
 [40,80,150,250,400,600,900,1300].forEach((u,i)=>UPS.push({id:'u'+i,n:['Кэш ленты','Быстрые картинки','Тёмная тема','Автоплей','Красный кружок','Стрики','Подборки дня','Истории'][i],d:i%2?'+25% к приходу людей по репостам':'+40 человек в симуляции',eff:i%2?{reach:.25}:{cap:40},c:'Людей в сети: '+u,need:()=>[S.A.length,u],p:Math.round(u*2.5)}));
 [60,200,600,2000,6000,2e4,6e4].forEach((m,i)=>UPS.push({id:'m'+i,n:['Рекламная сеть','Ретаргетинг','Look-alike','Пиксель','Программатик','Своя биржа','Брендлифт'][i],d:'+10% к цене рекламы',eff:{cpm:.1},c:'Доход: $'+f(m)+'/мин',need:()=>[S.ema.inc||0,m],p:m*6}));
 [2,6,12,20,30].forEach((x,i)=>UPS.push({id:'s'+i,n:['Отдел историй','Редакция','Свои журналисты','Медиахолдинг','Фабрика новостей'][i],d:'+10% к цене рекламы',eff:{cpm:.1},c:'Историй, где ты вмешался: '+x,need:()=>[S.chron.filter(c=>c.reacted).length,x],p:Math.round(150*Math.pow(2.2,i))}));
 [5,15,40].forEach((x,i)=>UPS.push({id:'r'+i,n:['Шаблоны правил','Отладчик','Оптимизатор'][i],d:'+8 мощности для правил',eff:{cpu:8},c:'Правил создано: '+x,need:()=>[S.rulesMade||0,x],p:Math.round(300*Math.pow(3,i))}));
 [.25,.35,.45,.55].forEach((x,i)=>UPS.push({id:'p'+i,n:['Эхо-камера','Стена','Крепость','Монолит'][i],d:'+10% к цене рекламы',eff:{cpm:.1},c:'Самый сильный пузырь '+Math.round(x*100)+'%',need:()=>[Math.max(0,...S.clusters.map(c=>c.bubble))*100,x*100],p:Math.round(600*Math.pow(2.5,i))}))})();
function upEff(k){let s=0;UPS.forEach(u=>{if(S.up[u.id]&&u.eff[k]!=null)s+=u.eff[k]});return s}
const itemPrice=(kind,id)=>kind=='fn'?FNP[id]:kind=='srv'?Math.round(400*Math.pow(1.6,S.srv)):UPS.find(x=>x.id==id).p;
function canBuy(c){return S.m>=c&&S.m>0}
function buy(kind,id){const c=itemPrice(kind,id);if(!canBuy(c))return false;if(kind=='srv'){S.srv++;S.m-=c;S.nb++;return true}if(kind=='fn'){const n=FN.find(x=>x.id==id);if(!n||has(id)||!n.req.every(has))return false;S.f[id]=1;if(id=='feed10')S.feedT=10;if(id=='feed20')S.feedT=20}
 else{const u=UPS.find(x=>x.id==id);if(!u||S.up[id])return false;const[n,m]=u.need();if(n<m)return false;S.up[id]=1}S.m-=c;S.nb++;return true}
function init(){for(let i=0;i<24;i++)addAgent(mkAgent(),S.A.length?pk(S.A):null);for(let i=0;i<20;i++)POOL.push(agentPost(pk(S.A)));S.mon.start=0}
