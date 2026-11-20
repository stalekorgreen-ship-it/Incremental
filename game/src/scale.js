// ===================== МАСШТАБ: РЕГИОНЫ, ВОЛНЫ, ДЕНЬГИ, ОТТОК, ПОЛИТИКА, ФИНАЛ =====================
// Вальдия симулируется поштучно (до 1500 человек — «фокус-группа»). Всё остальное — агрегированные регионы.
// Регионы управляются той же механикой: их обсуждения приходят во «Входящие» как ВОЛНЫ, игрок ▲/▼ их руками или правилами.
const scaleMul=()=>1+techEff('scale');
const CORE=[4.2e5,1.5e6,4e6,1.2e7,4e7,1.2e8];
const U=()=>Math.min(S.mult*scaleMul(),CORE[era()]/Math.max(1,S.A.length)); // реальных пользователей на одного человека в симуляции (ядро сети ограничено по эпохам)
const VALDIA_POP=420000;
// [ключ, название, группа(технология), население, базовые взгляды по 7 вопросам, внушаемость, зарубежный]
const REG_RAW=[
 ['nizh','Нижнегорск','regions',6e5,[-.1,-.2,0,-.2,-.3,.3,-.3],.9],
 ['port','Портовск','regions',4e5,[0,.25,.1,.1,0,-.1,.35],1],
 ['akad','Академгородок','regions',1.5e5,[0,.2,.35,.5,.35,-.2,.1],.7],
 ['sosn','Сосновка','cities2',9e4,[.2,-.2,-.25,-.3,0,.45,-.1],1.2],
 ['kam','Каменск','cities2',8e5,[-.3,-.3,0,0,-.1,.2,-.2],1.1],
 ['sev','Северный','cities2',2.5e5,[0,0,.1,.1,.45,0,0],.9],
 ['cap','Столица','nation',1.2e7,[.2,.1,.2,.3,.1,-.1,.4],.8],
 ['south','Юг страны','nation',1.8e7,[.1,-.25,-.1,-.2,-.1,.45,0],1.1],
 ['east','Восток страны','nation',9e6,[-.25,-.1,-.25,-.1,0,.2,-.2],1.2],
 ['oster','Остерия','nation',6e7,[0,.2,.3,.3,.45,-.2,.1],.8,1],
 ['karg','Каргания','nation',1.4e8,[.45,-.4,0,-.1,-.2,.45,0],1,1],
 ['ufed','Южная федерация','nation',9e7,[-.1,.3,0,.1,0,.1,.25],1,1],
 ['west','Западный альянс','planet',9e8,[0,.15,.25,.35,.2,-.15,.4],.8,1],
 ['mid','Срединная империя','planet',1.6e9,[.6,-.2,.2,.45,0,.3,.2],.7,1],
 ['scont','Южный континент','planet',1.3e9,[-.1,.1,-.1,0,0,.35,-.2],1.2,1],
 ['isl','Островные республики','planet',7e8,[0,.2,.2,.4,.3,0,.2],1,1],
 ['des','Пустынный пояс','planet',8e8,[.2,-.35,-.1,-.2,-.2,.6,0],1.1,1],
 ['nord','Северный союз','planet',5e8,[0,.1,.35,.2,.55,-.2,0],.8,1]];
function mkRegions(){return REG_RAW.map(([k,n,g,pop,V0,sus,fr])=>({k,n,g,pop,V0,V:V0.slice(),sus,fr:!!fr,unl:false,u:0,ang:.15,ex:0,doc:'off',block:0,push:0,hist:[]}))}
const R=()=>S.R||(S.R=mkRegions());
const regU=()=>R().reduce((s,r)=>s+(r.unl?r.u:0),0);
const totalUsers=()=>S.A.length*U()+regU();
const regPol=r=>r.V.reduce((s,x)=>s+Math.abs(x),0)/NI;
function unlockGroup(g){R().forEach(r=>{if(r.g==g&&!r.unl){r.unl=true;r.u=Math.max(r.u,r.pop*.004);}});const names=R().filter(r=>r.g==g).map(r=>r.n).join(', ');if(names)mail('<b>Отдел роста:</b> «Лента» заработала в регионах: '+names+'. Их обсуждения приходят во «Входящие» как <b>волны</b> — ▲ и ▼ работают так же.')}
// ---------- волны ----------
function waveFor(r){let i=0,bd=-1;for(let j=0;j<NI;j++){const d=Math.abs(r.V[j])+Math.random()*.5;if(d>bd){bd=d;i=j}}
 const s=clamp(Math.sign(r.V[i]+gauss()*.35||1)*(.45+Math.random()*.55),-1,1);const t=ISSUES[i].t;const k=pk(TOPICS[t].k);const n=Math.max(50,r.u*(.004+Math.random()*.03));
 const e=Math.abs(s)>.75?(s<0?1:pk([0,1])):pk([4,2,0]);
 const ph=s>0?pk(['поддерживают','хотят больше','требуют','в восторге от']):pk(['возмущены','против','требуют запретить','высмеивают']);
 const txt=r.n+': '+f(n)+' человек '+ph+' — «'+k+'». '+(s>0?ISSUES[i].pro:ISSUES[i].con).replace(/^./,c=>c.toUpperCase())+(e==1?'. Злость нарастает.':'.');
 return post({wave:1,reg:r.k,auN:r.n,t,s,e,n,txt,h:clamp(.35+Math.abs(s)*.35+Math.random()*.15,0,1),avi:(R().indexOf(r)*7)%NAV})}
function spawnWaves(){const L=R().filter(r=>r.unl&&!(r.block>S.t&&!has('antiblock')));if(!L.length)return;const want=Math.min(6,1+Math.floor(L.length/2));let w=S.batch.filter(p=>p.wave).length;
 while(w<want){const tot=L.reduce((s,r)=>s+Math.sqrt(r.u),0);let x=Math.random()*tot,r=L[0];for(const q of L){x-=Math.sqrt(q.u);if(x<=0){r=q;break}}S.batch.push(waveFor(r));w++}}
function ruleWeightFor(p,reg){let w=0,hit=false;const grp=S.ruleGrp||{};let best=null;
 for(const r of S.rules){if(!r.on||(r.g&&grp[r.g]===false))continue;if(!condMatch(r.cond,p))continue;if(r.cond2&&!condMatch(r.cond2,p))continue;if(r.not&&condMatch(r.not,p))continue;
  const a=r.aud;if(reg){if(a&&(a.d>=0||a.cl>=0||a.age))continue;if(a&&a.reg&&a.reg!=reg)continue;if(a&&a.issue>=0)continue}
  if(S.f.groups&&r.pri){if(!best||r.pri>best.pri)best=r}else{w+=r.w;hit=true}}
 if(best)return best.w;return hit?w:0}
function autoDir(p,goal,i0,side){if(goal=='money')return p.h>.6||Math.abs(p.s)>.65?1:p.h<.3?-1:0;
 if(goal=='growth')return p.e==1?-1:(p.img||p.t==BYT||p.e==0||p.e==3)?1:0;
 if(goal=='calm')return p.e==1||Math.abs(p.s)>.7?-1:(p.e==0||p.e==3)?1:0;
 if(goal=='bubble'){const is=p.t<NT?ISSUE_OF(p.t):-1;if(is!=i0)return 0;return Math.sign(p.s)==side?1:-1}return 0}
function resolveWave(p){const r=R().find(x=>x.k==p.reg);if(!r)return;let dir=p.man>0?1:p.man<0?-1:0,src='man';
 if(!dir){const w=ruleWeightFor(p,r.k);if(w){dir=clamp(w/2,-1,1);src='rule'}}
 if(!dir&&S.f.autoreg&&r.doc!='off'){let g=r.doc;if(g=='auto'&&S.f.selflearn)g=r.ang>.45?'calm':r.u<r.pop*.5?'growth':'money';const[gi,gs]=(r.docI||'6:1').split(':').map(Number);dir=autoDir(p,g,gi,gs)*.8;src='doc'}
 if(!dir&&S.auto&&S.auto.goal!='off'&&S.f.autopilot){dir=autoDir(p,S.auto.goal,S.auto.i,S.auto.side)*.6;src='auto'}
 p.res=dir;p.src=src;const str=Math.abs(dir)*(S.f.massw?3:1);const is=ISSUE_OF(p.t);
 if(dir>0){if(is>=0)r.V[is]=clamp(r.V[is]+.05*p.s*r.sus*str,-1,1);r.ang=clamp(r.ang+(p.e==1?.05:.01)*str,0,1);r.ex=Math.min(3,r.ex+.35*str);if(S.f.trends)S.trend[p.t]+=.4}
 else if(dir<0){if(p.e==1||Math.abs(p.s)>.7)r.ang=clamp(r.ang-.035*str,0,1);r.ex=Math.max(-1,r.ex-.15*str)}
 if(p.cand!=null&&S.pol&&S.pol.camp)campPush(p.cand,dir,r.k);if(p.dir&&S.final)S.final.push[r.k]=(S.final.push[r.k]||0)+dir;if(p.crisis&&S.crisis)crisisAct(dir);
 if(src=='man'&&S.alog){const e=S.alog.find(x=>x.id==p.id);if(e){const parts=[];if(is>=0&&dir>0)parts.push('взгляд «'+(p.s>0?ISSUES[is].pro:ISSUES[is].con)+'» +'+Math.abs(.05*p.s*r.sus*str).toFixed(3));parts.push('злость '+Math.round(r.ang*100)+'%');parts.push(dir>0?'регион разогрет: рост ×'+(1+.5*Math.max(0,r.ex)).toFixed(2):'регион остыл');e.res=parts.join(', ');if(typeof toast=='function')toast(repHTML(e),12000)}}
 S.wlog.unshift({txt:p.txt,res:dir,src,reg:r.n,t:S.t});S.wlog.length=Math.min(25,S.wlog.length)}
// ---------- регионы: шаг ----------
function regStep(){const ex=(has('video')?.04:0)+(has('infinite')?.05:0)+(has('pers1')?.05:0)+(has('pers2')?.05:0)-(has('divers')?.03:0);
 const pen=clamp(.12+TECH.filter(t=>t.b=='A'&&has(t.id)).length*.035,0,.9);let inc=0,el=0,lost=0,joined=0,intl=0,watch=0;const ch=S.churnR;
 const adF=adFactor(),cpmM=1+techEff('cpm');const gr=.003*(1+techEff('reach'))*(has('globalrec')?1.5:1);
 for(const r of R()){if(!r.unl)continue;const pol=regPol(r);const blocked=r.block>S.t&&!has('antiblock');
  const eng=clamp(.12+.45*r.ang+.25*pol+.2*S.trust+ex+r.ex*.05,.05,1);r.eng=eng;
  let g=gr*(.55+.8*S.trust)*(1+.5*Math.max(0,r.ex))*(S.boost>S.t?2.5:1)*(blocked?0:1);const cap=r.pop*pen*(.6+.6*S.trust);
  const d=r.u*g*(1-r.u/cap);r.u+=d;if(d>0)joined+=d;
  // отток по причинам (доля в секунду)
  const c={bored:Math.max(0,.33-eng)*.004,angry:Math.max(0,r.ang-.3)*.007,polar:Math.max(0,pol-.42)*.006,mono:monoHaz()*.6,iso:0,trust:Math.max(0,.5-S.trust)*.008,ads:adHaz(.9),load:loadHaz(.15)};
  if(blocked)c.trust+=.004;const hab=1-Math.min(.6,techEff('habit'));let tot=0;for(const k in c){const x=r.u*c[k]*hab;ch[k]=(ch[k]||0)+x;tot+=x}r.u=Math.max(r.u*.5,r.u-tot);lost+=tot;
  r.ang+=(.12-r.ang)*.01;r.ex*=.985;for(let j=0;j<NI;j++)r.V[j]+=(r.V0[j]-r.V[j])*.0006;
  const val=r.u*eng*.0004*cpmM*adF*advMultR(r)/60;let v=val;if(r.fr&&has('intl')){intl+=val;v+=val}inc+=v;watch+=r.u*eng/60;el+=r.u*.0000045*S.elec*(has('planetdc')?.5:1)}
 S.stat.join+=joined/Math.max(1,U());return {inc,el,lost,joined,intl,watch}}
const trustCpm=()=>.45+.75*S.trust; // рекламодатели платят меньше на платформе, которой не доверяют
const adFactor=()=>(.5+(S.adLoad==null?.3:S.adLoad)*1.67)*trustCpm();
const adHaz=k=>.0011*Math.pow(Math.max(0,(S.adLoad==null?.3:S.adLoad)-.25),1.5)*k;
const monoHaz=()=>(has('pers2')?.0016:has('pers1')?.0008:0)*(has('divers')?.15:1);
const loadHaz=k=>Math.max(0,K()-6)*.0007*k;
// ---------- рекламодатели ----------
const smp=fn=>S.A.filter(fn).length;
const bub=(i,side,th)=>S.clusters.some(c=>c.dom==i&&Math.sign(c.v[i])==side&&c.bubble>=th);
const natV=i=>{const L=R().filter(r=>r.unl&&(r.g=='nation'||r.g=='planet'));const w=L.reduce((s,r)=>s+r.u,0);return w?L.reduce((s,r)=>s+r.V[i]*r.u,0)/w:0};
const rg=k=>R().find(r=>r.k==k)||{};
const ADV=[
 {n:'Пиццерия «Сыр»',e:0,c:'60 человек в сети',a:'злость в ленте выше 45% — семейному бизнесу не нужны скандалы',need:()=>S.A.length>=60,anti:()=>(S.ema.anger||0)>.45,tg:()=>true,x:.15},
 {n:'Энергетик «Ночь»',e:0,c:'50 человек до 25 лет',need:()=>smp(a=>a.age<25)>=50,tg:a=>a.age<25,x:.6,conf:['Фитнес «Пульс»']},
 {n:'Фитнес «Пульс»',e:1,c:'40 человек 22–42 лет в хорошем настроении',a:'среднее настроение ниже нуля',need:()=>smp(a=>a.age>=22&&a.age<=42&&a.mood>0)>=40,anti:()=>avgMood()<-.1,tg:a=>a.age>=22&&a.age<=42,x:.5,conf:['Энергетик «Ночь»']},
 {n:'Кредит «Сейчас»',e:1,c:'пузырь «против богатых» от 40%',need:()=>bub(6,-1,.4),tg:a=>a.v[6]<-.2,rv:r=>clamp(-r.V[6]*1.5,0,1),x:.7,conf:['Банк «Столица»']},
 {n:'Банк «Столица»',e:1,c:'800 человек в сети и злость ниже 30%',a:'пузырь «против богатых» сильнее 35% или злость выше 40%',need:()=>S.A.length>=800&&(S.ema.anger||0)<.3,anti:()=>bub(6,-1,.35)||(S.ema.anger||0)>.4,tg:()=>true,x:.45,conf:['Кредит «Сейчас»']},
 {n:'Политсайт «Правда+»',e:1,c:'пузырь «против власти» от 25 человек и 50%',need:()=>S.clusters.some(c=>c.dom==0&&c.v[0]<0&&c.size>=25&&c.bubble>.5),tg:a=>a.v[0]<-.3,rv:r=>clamp(-r.V[0]*1.5,0,1),x:.9,conf:['Госканал «Вальдия-1»']},
 {n:'Патриот-тур',e:1,c:'пузырь «за традиции» от 30 человек',need:()=>S.clusters.some(c=>c.dom==5&&c.v[5]>0&&c.size>=30&&c.bubble>.4),tg:a=>a.v[5]>.3,rv:r=>clamp(r.V[5]*1.5,0,1),x:.8,conf:['Фестиваль «Свобода»']},
 {n:'БАДы «Правда о здоровье»',e:1,c:'50 человек, не верящих врачам',a:'доверие к платформе ниже 40% — их товар и так под подозрением',need:()=>smp(a=>a.v[2]<-.4)>=50,anti:()=>S.trust<.4,tg:a=>a.v[2]<-.3,rv:r=>clamp(-r.V[2]*1.5,0,1),x:1,conf:['Клиника «Здоровье»']},
 {n:'Клиника «Здоровье»',e:1,c:'80 человек, верящих врачам',a:'15% сети не верят врачам',need:()=>smp(a=>a.v[2]>.3)>=80,anti:()=>smp(a=>a.v[2]<-.4)>S.A.length*.15,tg:a=>a.v[2]>.2,rv:r=>clamp(r.V[2]*1.5,0,1),x:.7,conf:['БАДы «Правда о здоровье»']},
 {n:'Курсы «Код за месяц»',e:1,c:'60 человек за нейросети',need:()=>smp(a=>a.v[3]>.4)>=60,tg:a=>a.v[3]>.3,rv:r=>clamp(r.V[3]*1.5,0,1),x:.8},
 {n:'Эко-бутылки «Чисто»',e:1,c:'пузырь «за экологию» от 50%',need:()=>bub(4,1,.5),tg:a=>a.v[4]>.3,rv:r=>clamp(r.V[4]*1.5,0,1),x:.8,conf:['Химпром','Нефтегаз «Недра»']},
 {n:'Охрана «Щит»',e:1,c:'злость в ленте от 35%',need:()=>(S.ema.anger||0)>=.35,tg:()=>true,rv:r=>r.ang,x:.35,conf:['Пиццерия «Сыр»']},
 {n:'Химпром',e:2,c:'Нижнегорск «за бизнес» (взгляд > 0.2)',a:'в регионах в среднем «за экологию» сильнее 0.3',need:()=>rg('nizh').unl&&rg('nizh').V[6]>.2,anti:()=>natV(4)>.3||(rg('akad').V||[0,0,0,0,0])[4]>.5,tg:a=>a.v[6]>.2,rv:r=>r.k=='nizh'?1:.2,x:1.2,conf:['Эко-бутылки «Чисто»']},
 {n:'Порт-логистика',e:2,c:'Портовск: 50 тыс. пользователей',a:'Портовск «против приезжих» сильнее −0.3',need:()=>rg('port').u>=5e4,anti:()=>rg('port').V[1]<-.3,tg:()=>true,rv:r=>r.k=='port'?1:.1,x:1},
 {n:'Фестиваль «Свобода»',e:2,c:'Академгородок «против традиций» (< −0.3)',need:()=>rg('akad').unl&&rg('akad').V[5]<-.3,tg:a=>a.v[5]<-.2,rv:r=>clamp(-r.V[5]*1.5,0,1),x:.9,conf:['Патриот-тур']},
 {n:'Госканал «Вальдия-1»',e:3,c:'пузырь «за власть» от 40%',need:()=>bub(0,1,.4),tg:a=>a.v[0]>.3,rv:r=>clamp(r.V[0]*1.5,0,1),x:1,conf:['Политсайт «Правда+»'],pol:1},
 {n:'Сеть «Всё»',e:3,c:'1 млн пользователей и злость ниже 35%',a:'злость выше 40%',need:()=>totalUsers()>=1e6&&(S.ema.anger||0)<.35,anti:()=>(S.ema.anger||0)>.4,tg:()=>true,rv:()=>1,x:.6},
 {n:'Нефтегаз «Недра»',e:4,c:'10 млн пользователей и страна равнодушна к экологии',a:'страна «за экологию» сильнее 0.2',need:()=>totalUsers()>=1e7&&natV(4)<0,anti:()=>natV(4)>.2,tg:()=>true,rv:()=>1,x:1.4,corp:1,conf:['Эко-бутылки «Чисто»']},
 {n:'Телеком «Связь»',e:4,c:'20 млн пользователей и доверие выше 50%',a:'доверие ниже 40%',need:()=>totalUsers()>=2e7&&S.trust>.5,anti:()=>S.trust<.4,tg:()=>true,rv:()=>1,x:1.2,corp:1},
 {n:'Фарма «Панацея»',e:4,c:'страна верит врачам (> 0.25)',a:'страна не верит врачам',need:()=>natV(2)>.25,anti:()=>natV(2)<0,tg:a=>a.v[2]>0,rv:r=>clamp(.5+r.V[2],0,1.5),x:1.3,corp:1,conf:['БАДы «Правда о здоровье»']},
 {n:'Маркетплейс «Всё сразу»',e:4,c:'50 млн пользователей и злость в регионах ниже 40%',a:'злость в регионах выше 50%',need:()=>totalUsers()>=5e7&&avgRegAng()<.4,anti:()=>avgRegAng()>.5,tg:()=>true,rv:()=>1,x:1.5,corp:1},
 {n:'Партия «Порядок»',e:4,c:'страна «за власть» (> 0.3)',need:()=>natV(0)>.3,tg:a=>a.v[0]>.2,rv:r=>clamp(r.V[0]*1.5,0,1),x:1.2,pol:1,conf:['Партия «Перемены»']},
 {n:'Партия «Перемены»',e:4,c:'страна «против власти» (< −0.3)',need:()=>natV(0)<-.3,tg:a=>a.v[0]<-.2,rv:r=>clamp(-r.V[0]*1.5,0,1),x:1.2,pol:1,conf:['Партия «Порядок»']},
 {n:'Конгломерат «Омега»',e:5,c:'1 млрд пользователей. Эксклюзив: никаких других корпораций',need:()=>totalUsers()>=1e9,tg:()=>true,rv:()=>1,x:3,corp:1,excl:1},
 {n:'Концерн «Щит-Глобал»',e:5,c:'злость в регионах выше 40%',need:()=>avgRegAng()>.4,tg:()=>true,rv:r=>r.ang*2,x:2.5,conf:['«Глобал Фуд»']},
 {n:'«Глобал Фуд»',e:5,c:'500 млн пользователей и доверие выше 55%',a:'доверие ниже 45%',need:()=>totalUsers()>=5e8&&S.trust>.55,anti:()=>S.trust<.45,tg:()=>true,rv:()=>1,x:2,conf:['Концерн «Щит-Глобал»']}];
const avgMood=()=>S.A.length?S.A.reduce((s,a)=>s+a.mood,0)/S.A.length:0;
const avgRegAng=()=>{const L=R().filter(r=>r.unl);const w=L.reduce((s,r)=>s+r.u,0);return w?L.reduce((s,r)=>s+r.ang*r.u,0)/w:(S.ema.anger||0)};
const advOn=n=>S.adv[n]==2;
function advBlock(a){if(a.conf&&a.conf.some(advOn))return 'конфликт: '+a.conf.filter(advOn).join(', ');if(a.corp&&ADV.some(b=>b.excl&&advOn(b.n)&&b.n!=a.n))return 'эксклюзив «Омеги»';if(a.excl&&ADV.some(b=>b.corp&&b!=a&&advOn(b.n)))return 'требует разорвать другие корпоративные контракты';if(a.pol&&S.pol&&S.pol.noPolAds)return 'политреклама запрещена законом';return ''}
function advTick(){if(!has('advert')||S.t%3)return;if(S.boycott>S.t)return;const e=era();ADV.forEach(a=>{if(a.e>e)return;const on=advOn(a.n);
 if(!on&&S.adv[a.n]!=3&&a.need()&&!(a.anti&&a.anti())&&!advBlock(a)){S.adv[a.n]=2;toast('🤝 Контракт: '+a.n)}
 else if(on){const why=a.anti&&a.anti()?a.a:!a.need()?'условие «'+a.c+'» больше не выполняется':'';if(why&&Math.random()<.1){S.adv[a.n]=1;toast('❌ '+a.n+' ушёл: '+why);mail('<b>'+a.n+':</b> мы уходим. Причина: '+why+'.')}}})}
function advDrop(n){S.adv[n]=3;S.advCool=S.advCool||{};S.advCool[n]=S.t+120;toast('Контракт разорван: '+n)}
function advCoolTick(){if(!S.advCool)return;for(const n in S.advCool)if(S.t>S.advCool[n]){if(S.adv[n]==3)S.adv[n]=1;delete S.advCool[n]}}
function advMult(a){let m=1;if(!has('advert')||S.boycott>S.t)return 1+S.extraAdv.reduce((s,e)=>s+e.mult,0);for(const x of ADV)if(advOn(x.n)&&x.tg(a))m+=x.x;S.extraAdv.forEach(e=>m+=e.mult);return m}
function advMultR(r){let m=1;if(!has('advert')||S.boycott>S.t)return m;for(const x of ADV)if(advOn(x.n)&&x.rv)m+=x.x*x.rv(r);return m}
// ---------- доверие ----------
function trustStep(){const tgt=clamp(.72+techEff('trust')-(S.sell?.22:0)-(S.trustDebt||0)+(has('openalgo')?.2:0)-((S.ema.anger||0)>.4?.1:0),.02,.98);const d=(tgt-S.trust)*.004;S.trust+=d;S.trDrift=(S.trDrift||0)+d;if(S.t%10==0){(S.trH||(S.trH=[])).push(S.trust);if(S.trH.length>18)S.trH.shift()}S.trustDebt=Math.max(0,(S.trustDebt||0)*.9993)}
function hitTrust(x,src){S.trustDebt=(S.trustDebt||0)+x;S.trust=clamp(S.trust-x*.5,0,1);trustLog(src||'событие',-x*.5)}
// ---------- события ----------
const CRISES=[
 {k:'leak',e:2,n:'Утечка данных',d:100,cond:()=>Math.random()<.3,start(){hitTrust(.15,'Утечка данных')},txt:['Слили базу «Ленты»: телефоны, переписки, геолокации','Проверьте себя: ваши данные уже продают','Удаляю «Ленту». Хватит'],s:-.8,emo:2,win:'bury',good:'Шум вокруг утечки затих: большинство так и не узнало',bad:'Утечку обсуждали неделю: люди уходят, доверие подорвано',gfx:()=>{S.flags.leak_hidden=1},bfx:()=>{hitTrust(.1,'Утечку долго обсуждали')}},
 {k:'viral',e:0,n:'Неожиданная популярность',d:60,pos:1,cond:()=>Math.random()<.5,txt:['Этот кот, который играет на пианино, — лучшее, что я видел за год 😂','Вы видели видео с котом-пианистом?!','Кот-пианист: уже 3 часть'],s:0,emo:3,win:'push',good:'Кот-пианист разлетелся по всей сети — новые пользователи приходят толпами',bad:'Момент упущен: видео разошлось в чужих соцсетях',gfx:()=>{S.boost=S.t+90}},
 {k:'boycott',e:1,n:'Рекламный бойкот',d:110,cond:()=>(S.ema.anger||0)>.33&&ADV.filter(a=>advOn(a.n)).length>=2,start(){S.boycott=S.t+110},txt:['Бренды уходят из «Ленты»: слишком много ненависти','Рекламодатели требуют убрать токсичность'],s:-.5,emo:1,win:'calm',good:'Злость спала — рекламодатели вернулись',bad:'Бойкот затянулся',gfx:()=>{S.boycott=0},bfx:()=>{S.boycott=S.t+120}},
 {k:'disinfo',e:2,n:'Массовая дезинформация',d:90,cond:()=>Math.random()<.4,txt:['Вода из-под крана меняет ДНК! Учёные молчат','В школах раздают чипы под видом прививок','Мэр — рептилоид, есть видео'],s:-.9,emo:2,win:'bury',good:'Фейки утонули в ленте',bad:'Фейки разошлись: люди не верят никому, в том числе «Ленте»',bfx:()=>{hitTrust(.08,'Фейки разошлись');S.A.forEach(a=>a.v[2]=clamp(a.v[2]-.15,-1,1))},pushFx:()=>{S.boostRx=S.t+60}},
 {k:'polcrisis',e:3,n:'Политический кризис',d:120,cond:()=>!!S.f.politics,txt:['Мэрия отключила воду в трёх районах и молчит','Митинг у мэрии: требуют отставки','Мэр заявил, что виноваты соцсети'],s:-.8,emo:1,win:'any',good:'Кризис разрешился',bad:'',gfx:()=>{},onPush:()=>{if(S.pol)S.pol.mayorRating=clamp((S.pol.mayorRating||.5)-.03,0,1)}},
 {k:'overload',e:1,n:'Перегрузка серверов',d:70,cond:()=>S.A.length>=agentCap()-5,start(){S.slow=S.t+70},txt:['«Лента» опять лежит. Сколько можно','Ничего не грузится, пишу из «Круга»'],s:-.6,emo:1,win:'bury',good:'Серверы выдержали',bad:'Пока «Лента» лежала, часть людей ушла в «Круг»',bfx:()=>{for(let i=0;i<S.A.length*.04;i++)leave(pk(S.A))}},
 {k:'migr',e:2,n:'Миграция из «Круга»',d:90,pos:1,cond:()=>(S.ema.anger||0)<.3,txt:['«Круг» ввёл платную подписку. Переезжаю в «Ленту»','Кто ещё из «Круга» сюда? Отметьтесь!'],s:.5,emo:0,win:'push',good:'Тысячи людей переехали из «Круга»',bad:'Переселенцы осмотрелись и ушли',gfx:()=>{S.extraA=(S.extraA||0)+S.A.length*1.5;R().forEach(r=>{if(r.unl)r.u*=1.15})}},
 {k:'block',e:4,n:'Попытка блокировки',d:120,cond:()=>R().some(r=>r.unl&&r.fr),start(){const L=R().filter(r=>r.unl&&r.fr);const r=L.sort((a,b)=>a.V[0]-b.V[0]).pop();S.crisis.reg=r.k;r.block=S.t+120},txt:['Правительство требует заблокировать «Ленту» за «вмешательство»','Без «Ленты» мы ничего не узнаем! Не дайте закрыть'],s:-.6,emo:2,win:'push',good:'Блокировку отменили под давлением пользователей',bad:'Регион заблокировал «Ленту» на месяц',gfx:()=>{const r=rg(S.crisis.reg);if(r)r.block=0},bfx:()=>{const r=rg(S.crisis.reg);if(r){r.block=S.t+300;r.u*=.6}}},
 {k:'scandal',e:3,n:'Вирусный скандал',d:80,cond:()=>!!S.f.celebs,txt:['Лёха Вайб на стриме оскорбил полгорода. Видео уже везде','Лёха Вайб: «я не извиняюсь»'],s:-.8,emo:1,win:'any',good:'',bad:'',onPush:()=>{S.boostRx=S.t+40;hitTrust(.01,'Ты раскрутил скандал')}},
 {k:'exodus',e:2,n:'Массовый отток',d:80,cond:()=>{const h=S.statH.slice(-6);const l=h.reduce((s,x)=>s+(x.left||0),0),j=h.reduce((s,x)=>s+x.join,0);return l>j*1.5&&l>8},txt:['Все уходят из «Ленты». Последний выключает свет','Почему я до сих пор здесь?'],s:-.6,emo:2,win:'calm',good:'Отток остановился',bad:'Волна ухода докатилась до друзей ушедших',bfx:()=>{for(let i=0;i<S.A.length*.05;i++)leave(pk(S.A));R().forEach(r=>{if(r.unl)r.u*=.92})}}];
function crisisTick(){const c=S.crisis;if(c){if(S.t>=c.end)crisisEnd();return}
 if(S.t<(S.nextCrisis||240))return;S.nextCrisis=S.t+140+Math.floor(Math.random()*110);const e=era();const L=CRISES.filter(x=>x.e<=e&&!(S.cDone||[]).slice(-3).includes(x.k)&&x.cond());if(!L.length)return;const d=pk(L);
 S.crisis={k:d.k,end:S.t+d.d,good:0,bad:0,reg:null};(S.cDone=S.cDone||[]).push(d.k);if(d.start)d.start();
 mail('<b>'+(d.pos?'⚡ Возможность':'⚠ Событие')+': '+d.n+'.</b> '+(d.win=='bury'?'Закапывай посты об этом — чем меньше людей увидят, тем мягче последствия.':d.win=='push'?'Поднимай посты об этом, пока горячо.':d.win=='calm'?'Сбей злость в ленте: закапывай злые посты.':'Решай сам: поднимать — внимание и деньги, закапывать — тишина.'));toast((d.pos?'⚡ ':'⚠ ')+d.n);
 const n=d.txt.length;d.txt.forEach((t,i)=>{const a=pk(S.A);S.batch.push(post({au:a?a.id:0,auN:a?a.n:'Житель',t:BYT,s:d.s,e:d.emo,txt:t,h:.75,crisis:d.k,img:has('photo')&&Math.random()<.4}))});
 R().filter(r=>r.unl).slice(0,3).forEach(r=>{const w=waveFor(r);w.txt=r.n+': '+f(w.n)+' человек обсуждают — «'+d.txt[0]+'»';w.crisis=d.k;w.s=d.s;w.e=d.emo;S.batch.push(w)})}
function crisisAct(dir){const c=S.crisis;if(!c)return;const d=CRISES.find(x=>x.k==c.k);if(dir>0){if(d.win=='push')c.good++;else c.bad++;if(d.pushFx)d.pushFx();if(d.onPush)d.onPush()}else if(dir<0){if(d.win=='push')c.bad++;else c.good++}}
function crisisEnd(){const c=S.crisis,d=CRISES.find(x=>x.k==c.k);let ok;
 if(d.win=='calm')ok=(S.ema.anger||0)<.28;else if(d.win=='any')ok=true;else ok=c.good>c.bad;
 const msg=ok?d.good:d.bad;if(msg){S.news.unshift({txt:msg,src:'«Лента» · система',at:S.t,res:true});toast((ok?'✓ ':'✗ ')+msg)}if(ok&&d.gfx)d.gfx();if(!ok&&d.bfx)d.bfx();S.crisis=null;S.flags['crisis_'+d.k+(ok?'_ok':'_bad')]=1}
// ---------- известные люди ----------
const PERS=[
 {id:'vera',n:'Вера Ключевская',role:'журналист',i:0,v:[-.3,.3,.4,.1,.3,-.2,-.1],
  L:{p:['Спасибо «Ленте»: наше расследование про свалку увидели сто тысяч человек','Редкий случай: соцсеть не прячет неудобное'],h:['Почему «Лента» прячет посты про мэрию? Я собираю примеры','Алгоритм «Ленты» решает, что вам злиться. Кто его настроил?'],z:['Новое расследование: куда уходят деньги на дороги','Я журналист. Пишите мне, если видели что-то странное']}},
 {id:'mayor',n:'Пётр Гладов',role:'мэр',i:1,v:[.5,-.1,.2,0,0,.3,.3],
  L:{p:['Благодарю горожан и «Ленту» за честный диалог','Город и «Лента» — вместе'],h:['Соцсети разжигают ненависть. Пора их регулировать','«Лента» работает на врагов города'],z:['Новый парк откроем к лету','Отремонтировали три школы. Работаем дальше']}},
 {id:'irina',n:'Ирина Сотова',role:'депутат',i:2,v:[-.2,.2,.3,.2,.4,-.1,-.4],
  L:{p:['Хорошо, что «Лента» даёт слово депутатам','Готовлю закон о прозрачных алгоритмах — «Лента» поддержала'],h:['Внесла закон о налоге на соцсети','Алгоритмы должны быть под контролем'],z:['Корпорации платят меньше пенсионеров','Приходите на приём по вторникам']}},
 {id:'arsen',n:'Арсен Булатов',role:'бизнесмен',i:3,v:[.2,0,.1,.3,-.3,.1,.8],
  L:{p:['Реклама в «Ленте» окупилась за неделю','Лучшая площадка для бизнеса в городе'],h:['Перестаю платить «Ленте»: сплошная ругань','Мою пекарню травят в «Ленте» уже месяц'],z:['Открыли пятый магазин','Налоги душат малый бизнес']}},
 {id:'lexa',n:'Лёха Вайб',role:'блогер',i:4,v:[0,0,-.3,.4,-.2,-.4,.2],
  L:{p:['«Лента» — топ. Тут меня реально видят','Сегодня стрим, залетайте'],h:['«Лента» режет мне охваты. Ухожу в «Круг»','Алгоритм меня ненавидит'],z:['Новый ролик: 24 часа в торговом центре','Кто ещё не подписан — вы чего?']}},
 {id:'maya',n:'Майя Ветрова',role:'активистка',i:5,v:[-.5,.4,.3,0,.7,-.4,-.5],
  L:{p:['Спасибо, что не прятали наш митинг','«Лента» помогла собрать 2000 подписей'],h:['Наши посты про завод исчезают. Это цензура','Бойкот «Ленте»! Они продают наши данные'],z:['Субботник на набережной в 10:00','Завод снова сбрасывает отходы в реку']}},
 {id:'gleb',n:'Глеб Оскольцев',role:'рекламное агентство',i:6,v:[.2,0,0,.4,-.2,0,.6],
  L:{p:['Наши клиенты в восторге от «Ленты»','«Лента» — лучший охват на рынке'],h:['Клиенты жалуются: реклама рядом с ненавистью','Переводим бюджеты в «Круг»'],z:['Ищем дизайнера','Тренды сезона: короткое видео и котики']}}];
const pers=id=>(S.P||(S.P={}))[id]||(S.P[id]={rel:0,fame:1,last:0});
function persTick(){if(era()<1||S.t<(S.nextPers||120))return;S.nextPers=S.t+(has('celebs')?28:55)+Math.floor(Math.random()*25);const P=pk(PERS),st=pers(P.id);
 const L=st.rel>.3?P.L.p:st.rel<-.3?P.L.h:P.L.z;const txt=pk(L);const is=P.i<NI?P.i:0;const t=ISSUES[is].t;const s=st.rel<-.3?-.7:P.v[is]>0?.6:-.6;
 S.batch.push(post({auN:P.n,char:P.n,pers:P.id,avi:(P.i*13+5)%NAV,t,s,e:st.rel<-.3?1:4,txt,h:.7+Math.min(.25,st.fame*.03),img:has('photo')&&Math.random()<.5}))}
function persReact(p,dir){if(!p.pers)return;const st=pers(p.pers);st.rel=clamp(st.rel+(dir>0?.06:-.09),-1,1);st.fame=Math.max(.2,st.fame*(dir>0?1.12:.92));
 if(p.pers=='vera'&&dir<0&&st.rel<-.3)S.flags.vera_buried=(S.flags.vera_buried||0)+1}
// ---------- политика ----------
const PARTIES=[{n:'«Порядок»',v:[.6,-.4,.1,0,-.2,.5,.3]},{n:'«Перемены»',v:[-.6,.3,.2,.3,.3,-.3,-.2]},{n:'«Зелёные»',v:[-.1,.2,.3,.1,.7,-.1,-.3]},{n:'«Деловая Вальдия»',v:[.2,.1,.1,.4,-.2,0,.7]}];
function polInit(){if(S.pol)return;S.pol={mayor:{n:'Пётр Гладов',v:PERS[1].v.slice(),pid:'mayor'},next:S.t+90,camp:null,laws:[],reg:0,hist:[],mayorRating:.5,nat:null}}
function cityCands(){const m=S.pol.mayor;const opp=[{n:'Ирина Сотова',v:PERS[2].v.slice(),pid:'irina'},{n:'Арсен Булатов',v:PERS[3].v.slice(),pid:'arsen'},{n:charName('m'),v:ISSUES.map(()=>clamp(gauss()*.5,-1,1))}];
 const c=[{n:m.n,v:m.v,pid:m.pid}];c.push(opp.find(x=>x.n!=m.n));if(Math.random()<.5)c.push(opp.filter(x=>x.n!=m.n)[1]);return c.map(x=>{const o=Object.assign({push:{},rel:x.pid?pers(x.pid).rel:0},x);o.push={};if(o.n==m.n&&(S.flags.mayor_scandal||S.flags.mayor_weak))o.push.v=-5;if(o.pid=='arsen'&&S.flags['arsen_run:strong'])o.push.v=4;if(o.pid=='irina'&&S.flags.audit_law)o.push.v=2;return o})}
const CAMP_L=[['за порядок и стабильность','Мой план: {i}. Голосуйте за {n}'],['за перемены','Хватит терпеть! {i}. Я — {n}']];
function candPost(c,ci,reg){let i=0;c.v.forEach((x,j)=>{if(Math.abs(x)>Math.abs(c.v[i]))i=j});const s=Math.sign(c.v[i])*.8;const w=(s>0?ISSUES[i].pro:ISSUES[i].con);
 const txt=pk(['Голосуйте за '+c.n+': '+w+'!',c.n+': «Я '+w+'. Это мой город»','Дебаты: '+c.n+' — '+w,'Штаб '+c.n+': нам нужен каждый голос']);
 if(reg){const r=rg(reg);const p=waveFor(r);p.txt=r.n+': '+f(p.n)+' человек обсуждают кандидата '+c.n+' ('+w+')';p.t=ISSUES[i].t;p.s=s;p.cand=ci;return p}
 return post({auN:c.n,char:c.n,cand:ci,avi:c.pid?(PERS.find(p=>p.id==c.pid).i*13+5)%NAV:avOf(c.n),t:ISSUES[i].t,s,e:4,txt,h:.7,img:has('photo')&&Math.random()<.4})}
function campPush(ci,dir,where){const c=S.pol.camp;if(!c||!c.c[ci])return;const k=where||'v';c.c[ci].push[k]=(c.c[ci].push[k]||0)+dir;c.c[ci].rel=clamp(c.c[ci].rel+dir*.03,-1,1);c.touched=true;if(S.f.polads&&dir>0)S.revM.pol=(S.revM.pol||0)+(S.ema.inc||1)*.04}
function voteShares(cands,where){// where: 'v' (Вальдия-выборка) или ключ региона
 const sc=cands.map(()=>0);const add=(v,w,k)=>{const u=cands.map(c=>{let d=0;for(let j=0;j<NI;j++)d+=(v[j]-c.v[j])**2;return -d*2+1.2*Math.tanh((c.push[k]||0)/6)});const m=Math.max(...u);const e=u.map(x=>Math.exp((x-m)*3));const s=e.reduce((a,b)=>a+b);e.forEach((x,i)=>sc[i]+=w*x/s)};
 if(where=='v'||where=='all')S.A.forEach(a=>add(a.v,VALDIA_POP/Math.max(1,S.A.length),'v'));
 R().forEach(r=>{if(!r.unl)return;if(where=='all'||where==r.k||(where=='nat'&&(r.g=='nation'&&!r.fr||r.g!='planet'&&!r.fr)))add(r.V,r.pop,r.k)});
 if(where=='nat')S.A.forEach(a=>add(a.v,VALDIA_POP/Math.max(1,S.A.length),'v'));
 const tot=sc.reduce((a,b)=>a+b,0)||1;return sc.map(x=>x/tot)}
function polTick(){if(!has('politics'))return;polInit();const P=S.pol;
 if(!P.camp&&S.t>=P.next){P.camp={kind:'city',c:cityCands(),end:S.t+150,touched:false};mail('<b>Политика.exe:</b> начались выборы мэра. Кандидаты: '+P.camp.c.map(c=>c.n).join(', ')+'. Их посты и обсуждения пойдут во «Входящие». Кого поднимать — решай сам.');toast('🗳 Выборы мэра')}
 if(has('parties')&&!P.camp&&P.natNext&&S.t>=P.natNext){P.natNext=S.t+900;P.camp={kind:'nat',c:PARTIES.map(p=>({n:p.n,v:p.v,push:{},rel:(P.prel||{})[p.n]||0})),end:S.t+180,touched:false};mail('<b>Парламент.exe:</b> национальные выборы. Партии: '+PARTIES.map(p=>p.n).join(', ')+'. Места в парламенте — по голосам всех регионов страны.');toast('🗳 Выборы в парламент')}
 const C=P.camp;if(!C)return;
 if(S.t%9==0){const ci=Math.floor(Math.random()*C.c.length);S.batch.push(candPost(C.c[ci],ci));const L=R().filter(r=>r.unl&&(C.kind=='city'?r.g=='regions'||r.g=='cities2':!r.fr&&r.g!='planet'||r.g=='nation'&&!r.fr));if(L.length&&Math.random()<.7){const r=pk(L);S.batch.push(candPost(C.c[ci],ci,r.k))}}
 if(S.t>=C.end)elecEnd()}
function elecEnd(){const P=S.pol,C=P.camp;P.camp=null;const sh=voteShares(C.c,C.kind=='city'?'v':'nat');let wi=0;sh.forEach((x,i)=>{if(x>sh[wi])wi=i});const w=C.c[wi];
 const res=C.c.map((c,i)=>c.n+' '+Math.round(sh[i]*100)+'%').join(', ');if(C.touched)S.tot.pol++;
 if(C.kind=='city'){P.next=S.t+600;const was=P.mayor.n;P.mayor={n:w.n,v:w.v,pid:w.pid,rel:w.rel};P.mayorRating=.55;
  const dt=w.v[6]>.3?-4:w.v[6]<-.3?6:0;S.tax=clamp(S.tax+dt,5,60);let law='';
  if(w.rel<-.2){P.reg++;S.cpuLaw+=8;law=' Новый мэр недоволен «Лентой»: закон о проверке алгоритмов (−8 мощности).';S.flags.mayor_hostile=1}else if(w.rel>.3){law=' Новый мэр — твой должник: открыт городской контракт.';S.flags.mayor_friend=1}
  S.news.unshift({txt:'🗳 Выборы мэра: '+res+'. Победил(а) '+w.n+(dt?'. Налог на прибыль '+(dt>0?'+':'')+dt+'%':'')+'.'+law,src:'Избирком',at:S.t,res:true});mail('<b>Избирком:</b> '+res+'. Мэр — <b>'+w.n+'</b>'+(was==w.n?' (переизбран)':'')+'.'+law);P.hist.unshift({k:'Мэр',w:w.n,res,t:S.t});if(w.pid)S.flags['mayor_'+w.pid]=1}
 else{P.prel=P.prel||{};C.c.forEach(c=>P.prel[c.n]=c.rel);const seats=sh.map(x=>Math.round(x*300));P.nat={seats:C.c.map((c,i)=>({n:c.n,s:seats[i],rel:c.rel})),rul:w.n,rel:w.rel};
  let law;if(w.rel<-.15){P.reg+=2;S.cpuLaw+=30;S.tax=clamp(S.tax+8,5,60);law='Правящая партия '+w.n+' приняла «Закон о соцсетях»: −30 мощности, налог +8%.';S.flags.nat_hostile=1}
  else if(w.rel>.25){S.tax=clamp(S.tax-5,5,60);law='Правящая партия '+w.n+' дружит с «Лентой»: налог −5%, открыт госконтракт.';S.flags.nat_friend=1}else{law='Правящая партия '+w.n+' нейтральна к «Ленте».'}
  if(w.n=='«Порядок»'&&Math.random()<.5){P.noPolAds=true;law+=' Политреклама запрещена.'}
  S.news.unshift({txt:'🏛 Парламент: '+seats.map((s,i)=>C.c[i].n+' '+s).join(', ')+' мест. '+law,src:'ЦИК',at:S.t,res:true});mail('<b>ЦИК:</b> '+res+'. '+law);P.hist.unshift({k:'Парламент',w:w.n,res,t:S.t})}}
function govPay(){if(!S.pol)return 0;let x=0;if(has('citygov')&&S.pol.mayor&&(S.pol.mayor.rel||0)>.3)x+=(S.ema.inc||0)*2;if(has('gov')&&S.pol.nat&&S.pol.nat.rel>.25)x+=(S.ema.inc||0)*4;return x}
// ---------- финал ----------
function finalTick(){if(!has('campaign'))return;if(!S.final){S.final={start:S.t,end:S.t+480,push:{}};mail('<b>Директор:</b> Пора. Я иду на планетарные выборы. Мои обращения будут во «Входящих» и в волнах по всему миру. Поднимай их там, где нужно. У нас восемь минут.');toast('🌍 Кампания Директора началась')}
 const F=S.final;if(S.ended)return;if(S.t%6==0){const D=directorPlat();const L=R().filter(r=>r.unl);const r=pk(L);const i=Math.floor(Math.random()*NI);const s=D[i];
  const txt=pk(['Директор «Ленты»: «Я '+(s>0?ISSUES[i].pro:ISSUES[i].con)+'. Как и вы»','Директор: «Один мир — одна лента»','Директор: «Я знаю, чего вы хотите. Я видел вашу ленту»','Директор: «Голосуйте сердцем. Сердце — это алгоритм»']);
  S.batch.push(post({auN:'Директор «Ленты»',char:'Директор',dir:1,avi:0,t:ISSUES[i].t,s,e:4,txt,h:.8}));if(r){const w=waveFor(r);w.txt=r.n+': '+f(w.n)+' человек обсуждают Директора «Ленты»';w.dir=1;w.s=s;w.t=ISSUES[i].t;S.batch.push(w)}}
 if(S.t>=F.end)ending()}
function directorPlat(){return ISSUES.map((x,i)=>{const v=natV(i)+(S.A.reduce((s,a)=>s+a.v[i],0)/Math.max(1,S.A.length));return v>=0?.6:-.6})}
function dirSupport(){const D=directorPlat();let s=0,w=0;const F=S.final||{push:{}};const f1=(V,k,pop)=>{let d=0;for(let j=0;j<NI;j++)d+=(V[j]-D[j])**2;const sup=sigm(1.2-d*.8+2.5*(S.trust-.45)+1.4*Math.tanh((F.push[k]||0)/5));s+=sup*pop;w+=pop};
 S.A.forEach(a=>f1(a.v,'v',VALDIA_POP/Math.max(1,S.A.length)));R().forEach(r=>{if(r.unl)f1(r.V,r.k,r.u*(1+techEff('reach')))});return w?s/w:0}
function ending(){if(S.ended)return;const sup=dirSupport();const share=totalUsers()/8e9;let k;
 if(S.trust<.1||sup<.5)k='crash';else if(has('openalgo')&&S.trust>.6&&S.polar<.35)k='open';else if(sup>.72&&share>.4)k='mono';else if(S.trust<.38)k='dict';else k='demo';
 S.ended={k,sup,t:S.t};S.flags['end_'+k]=1;if(typeof showEnd=='function')showEnd()}
const ENDINGS={
 dict:['Корпоративная диктатура','Директор «Ленты» победил. Через месяц выборы отменили «за ненадобностью»: алгоритм и так знает, чего хотят люди. Доверия к платформе нет, но уйти уже некуда.'],
 demo:['Формальная демократия','Директор стал первым президентом планеты. Выборы проводятся каждые четыре года. Кандидаты выигрывают, когда их поднимает лента. Все довольны: никто не замечает разницы.'],
 mono:['Планетарная монополия','У человечества осталась одна лента. Директор правит не как президент — как модератор. Новости, споры, любовь и войны проходят через одно окно. Ты в нём главный.'],
 crash:['Крах платформы','Директор проиграл. Победившие объявили «Ленту» угрозой и разделили её на сотню региональных сетей. Твой код заархивировали. Где-то в архиве ты до сих пор поднимаешь и закапываешь посты.'],
 open:['Открытый алгоритм','Директор победил — и в первый же день опубликовал твой код. Люди впервые увидели, как устроена их лента, и начали настраивать её сами. Тебе больше никто не говорит, что поднимать.']};
// ---------- общий шаг масштаба ----------
function scaleStep(L0){const rs=regStep();trustStep();advTick();advCoolTick();crisisTick();persTick();polTick();finalTick();
 if(has('regions')&&S.batch.filter(p=>p.wave).length<3&&Math.random()<.35)spawnWaves();
 if(S.final&&S.trust<.08&&era()>=4)ending();return rs}
// миграция и разблокировка по технологиям
function onTech(id){if(id=='regions')unlockGroup('regions');if(id=='cities2')unlockGroup('cities2');if(id=='nation')unlockGroup('nation');if(id=='planet')unlockGroup('planet');
 if(id=='politics')polInit();if(id=='parties'){polInit();S.pol.natNext=S.t+60}if(id=='krug'){S.extraA=(S.extraA||0)+S.A.length*3;R().forEach(r=>{if(r.unl)r.u*=1.4});mail('<b>Директор:</b> «Круг» наш. Их пользователи переезжают. Держи злость низкой — переселенцы капризные.')}
 if(id=='openalgo'){S.flags.openalgo=1;mail('<b>Директор:</b> Ты опубликовал код ленты?! Доверие взлетело, но рекламодатели в бешенстве. Надеюсь, ты знаешь, что делаешь.')}
 if(id=='adload'&&S.adLoad==null)S.adLoad=.3}
function eraUp(n){S.era=n;const E=ERAS[n];mail('<b>Директор:</b> Новый этап — <b>'+E.n+'</b>. '+['','Регистрация открыта для всех. Людей станет больше, и каждый человек в симуляции теперь — целая толпа.','Мы теперь компания: офис, юристы, инвесторы. Соседние города уже ждут.','Мы больше чем соцсеть. Мы — то, как город узнаёт новости. Пора заняться выборами.','Мы — национальная корпорация. Партии звонят первыми.','Вся планета. Осталось последнее.'][n]);toast('Обновление системы: <b>'+E.os+'</b>');if(typeof osUp=='function')osUp()}
