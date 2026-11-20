// ===================== ОБЪЯСНЕНИЯ: что сделал игрок и что изменилось =====================
// Все цифры здесь берутся из симуляции: управляемые показы (mv) — пост попал в ленту человека только благодаря ▲/правилу,
// предотвращённые (pv) — без ▼ пост попал бы в ленту. Реальные пользователи = люди симуляции × U().
const EMN2=['радость','злость','страх','умиление','интерес'];
const CAL=()=>S.cal||(S.cal={mv:5,ov:3,n:0,on:0}); // калибровка прогноза по уже завершённым постам
const onlineN=()=>S.A.reduce((s,a)=>s+a.act,0);
// ---------- журнал действий ----------
function actLog(p,dir){const L=S.alog||(S.alog=[]);let e=L.find(x=>x.id==p.id);if(e&&e.dir==dir)return;
 if(!e){e={id:p.id,txt:p.txt.slice(0,90),au:p.auN,t:S.t,wave:!!p.wave,reg:p.reg||null};L.unshift(e);L.length=Math.min(60,L.length)}
 e.dir=dir;e.t=S.t;e.rep=false;e.side=[];
 // побочные последствия ▼/▲ для автора — настоящие изменения в симуляции
 const au=p.au&&byId(p.au);if(au){au.mood+=dir>0?.12:-.25;e.side.push(dir>0?'автор доволен (настроение +)':'автор обижен (настроение −)');
  if(dir<0){let n=0;au.fr.forEach(id=>{const b=byId(id);if(b&&p.t<NT&&ISSUE_OF(p.t)>=0&&b.v[ISSUE_OF(p.t)]*p.s>.1){b.mood-=.05;n++}});if(n)e.side.push(n+' его единомышленников недовольны')}}
 if(p.pers)e.side.push((PERS.find(x=>x.id==p.pers)||{}).n+(dir>0?': отношение к «Ленте» улучшится':': отношение к «Ленте» ухудшится'));
 if(p.crisis)e.side.push(dir>0?'событие разгорается':'событие затухает');if(p.cand!=null)e.side.push('кандидат запомнит');
 e.U=U();e.online=onlineN();e.pred=forecast(p)}
function actTick(UU){const L=S.alog;if(!L)return;const now=new Map();for(const p of POOL)now.set(p.id,p);for(const p of S.batch)now.set(p.id,p);
 for(const e of L){if(e.done)continue;const p=now.get(e.id);if(!p){if(!e.wave||e.res){e.done=true;calib(e)}continue}
  ['mv','mrx','minc','mneg','msh','mjoin','pv','prx','pinc','pneg','mdv','seenN','rx','drx','dinc','prep','pirep'].forEach(k=>e[k]=p[k]||0);e.U=UU;
  if(!e.rep&&S.t-e.t>=30&&!e.wave){e.rep=true;if(typeof toast=='function')toast(repHTML(e,true)+'<br><span class="lbl">подробнее — «Журнал действий»</span>',14000)}}}
function calib(e){const c=CAL();if(e.dir>0&&e.online>0){c.mv=c.mv*.7+.3*(e.mv/e.online);c.n++}if(e.dir<0&&e.online>0&&e.pv)c.ov=c.ov*.7+.3*(e.pv/e.online)}
// органическая база для ▼-прогноза: сколько показов в среднем набирает нетронутый пост
function organicTick(){const c=CAL();const on=onlineN()||1;for(const p of POOL)if(!p.man&&!p.wave&&S.t-p.born>=140&&!p.calOk){p.calOk=1;c.ov=c.ov*.97+.03*(p.seenN/on)}}
function repHTML(e,short){const U0=e.U||U();const r=x=>f(x*U0);const m=x=>'$'+f(x);
 if(e.wave)return '<b>Волна '+(e.dir>0?'поднята':'закопана')+'</b>: '+esc(e.reg?rg(e.reg).n:'')+(e.res?' — '+e.res:' — будет разобрана при следующей пачке');
 const sg=x=>(x>=0?'+':'−')+'$'+f(Math.abs(x));
 if(e.dir>0)return '<b>Публикация продвинута</b> <span class="lbl">('+(S.t-e.t)+' с)</span><br>Доп. показы: +'+r(e.mv)+' · реакции: +'+r(e.mrx)+' · доход: +'+m(e.minc)+'<br><span class="lbl">Этот пост занял место других: они дали бы ≈'+r(e.drx||0)+' реакций и ≈'+m(e.dinc||0)+'.</span> <b>Чистый эффект: '+sg(e.minc-(e.dinc||0))+'</b><br>Новые пользователи: +'+f((e.mjoin||0)*U0)+' · злые реакции: +'+r(e.mneg)+(e.mdv>0?' · сдвиг взглядов: '+e.mdv.toFixed(2):'')+(short?'':(e.side&&e.side.length?'<br><span class="lbl">'+e.side.join('; ')+'</span>':''));
 return '<b>Публикация закопана</b> <span class="lbl">(оценка предотвращённого, '+(S.t-e.t)+' с)</span><br>Не показано ≈'+r(e.pv)+' раз · не случилось ≈'+r(e.prx)+' реакций, из них злых ≈'+r(e.pneg)+'<br>Вместо него показали другие посты: ≈'+r(e.prep||0)+' реакций. <b>Чистый эффект ≈'+sg((e.pirep||0)-e.pinc)+'</b>'+(e.side&&e.side.length?'<br><span class="lbl">Последствия: '+e.side.join('; ')+'</span>':'')}
// ---------- разбор поста ----------
const lvl=(x,a,b)=>x>=b?'высокий':x>=a?'средний':'низкий';
function postStance(p){const is=p.t<NT?ISSUE_OF(p.t):-1;if(is<0)return 'без позиции';return p.s>.3?ISSUES[is].pro:p.s<-.3?ISSUES[is].con:'нейтрально'}
function forecast(p){if(p.wave){const r=rg(p.reg);const is=ISSUE_OF(p.t);return {wave:1,ang:is>=0?clamp(.5-r.V[is]*p.s,0,1):.2,n:p.n,u:r.u}}
 const is=p.t<NT?ISSUE_OF(p.t):-1;let pe=0,ang=0,n=0,int=0,fans=0;const seg={};const segAdd=(k,v)=>{(seg[k]||(seg[k]=[0,0]))[0]+=v;seg[k][1]++};
 for(const a of S.A){const ti=p.t>=NT?.3:a.it[p.t];const agr=is>=0?a.v[is]*p.s:0;const x=sigm(-1.4+2*p.h+1.5*ti+1.4*Math.abs(agr)+(p.img?.25:0)+(p.vid?.3:0)+(p.char?.6:0));pe+=x;if(agr<-.12)ang+=x;n++;int+=ti;if(ti>.5)fans++;
  segAdd(a.age<25?'до 25 лет':a.age<50?'25–50 лет':'50+',ti);segAdd(DISTRICTS[a.d],ti)}
 n=n||1;let rb=0,rc=0;for(const q of POOL){if(q.wave||q.man)continue;rb+=q.seenN?q.rx/q.seenN:0;rc++}const base=rc?rb/rc:.3;const c=CAL();const on=onlineN();const acc=has('predict')?[.75,1.3]:[.5,1.6];
 const mv=c.mv*on,ov=c.ov*on,rx=Math.min(.97,pe/n*1.25),val=U()*ENGV*(1+techEff('cpm'))*adFactor()*(p.vid?1.6:1);
 const segs=Object.entries(seg).map(([k,[s,m]])=>[k,s/m]).sort((a,b)=>b[1]-a[1]);
 return {rx,ang:pe?ang/pe:0,int:int/n,fans,segs,mv,ov,acc,val,N:n,base:base*.8}}
function postInfoHTML(p){const F=p.fc&&S.t-p.fcT<6?p.fc:(p.fc=forecast(p),p.fcT=S.t,p.fc);const e=era();const UU=U();const rng=(x)=>f(x*F.acc[0]*UU)+'–'+f(x*F.acc[1]*UU);
 if(F.wave){const r=rg(p.reg);return '<div class="pinfo"><b>Волна из региона «'+esc(r.n)+'»</b><br>Тема: '+TOPICS[p.t].n+' · эмоция: '+EMN2[p.e]+' · позиция: '+postStance(p)+'<br>Участников: '+f(p.n)+' из '+f(r.u)+' пользователей региона'+
  '<br><b>▲</b>: взгляды региона сдвинутся к «'+postStance(p)+'» (до '+(.05*r.sus*(S.f.massw?3:1)).toFixed(2)+'), злость '+(p.e==1?'+'+Math.round(5*(S.f.massw?3:1))+'%':'+1%')+', рост и вовлечённость региона на время выше'+
  '<br><b>▼</b>: '+(p.e==1||Math.abs(p.s)>.7?'злость в регионе −'+Math.round(3.5*(S.f.massw?3:1))+'%, ':'')+'рост региона немного замедлится<br><b>Ничего</b>: решат правила'+(has('autoreg')?', доктрина региона':'')+(has('autopilot')?' или автопилот':'')+', иначе волна пройдёт без последствий</div>'}
 const au=p.au&&byId(p.au);const fol=au?au.fr.length:0;const P=p.pers&&pers(p.pers);
 let h='<div class="pinfo"><b>Почему цепляет:</b> тема «'+TOPICS[Math.min(p.t,NT-1)].n+(p.t>=NT?' (быт)':'')+'», эмоция — '+EMN2[p.e]+', крючок '+lvl(p.h,.4,.65)+(p.img?', есть фото':'')+(p.vid?', видео':'')+(p.char?', автор — известный человек':'')+
  '<br><b>Позиция:</b> '+postStance(p)+' · <b>Автор:</b> '+esc(p.auN)+(P?' — известность ×'+P.fame.toFixed(1):au?' — друзей '+fol+', подписчиков ≈'+f(fol*UU):'');
 h+='<br><b>Кому интересно:</b> '+(e>=1?F.segs.slice(0,3).map(([k,v])=>k+' — '+lvl(v,.25,.45)).join(', '):'интерес к теме у '+F.fans+' из '+F.N+' человек')+' (в среднем — '+lvl(F.int,.25,.45)+')';
 h+='<br><b>Вовлечённость:</b> '+lvl(F.rx,.3,.5)+' (≈'+Math.round(F.rx*100)+'% увидевших отреагируют) · <b>конфликт:</b> '+lvl(F.ang,.2,.4)+' ('+Math.round(F.ang*100)+'% реакций будут злыми)';
 const trustRisk=(p.crisis&&['disinfo','leak'].includes(p.crisis))||(F.ang>.4&&(S.ema.anger||0)>.3);
 h+='<div class="fc"><b>▲ если поднять</b> (оценка по прошлым продвижениям'+(has('predict')?', точнее':'')+'): доп. показы ≈'+rng(F.mv)+', реакции ≈'+rng(F.mv*F.rx)+', доход ≈$'+f(F.mv*F.rx*F.val*F.acc[0])+'–'+f(F.mv*F.rx*F.val*F.acc[1])+
  ', злых реакций ≈'+rng(F.mv*F.rx*F.ang)+'. Пост займёт место других (они цепляют ≈'+Math.round(F.base*100)+'%): <b>чистый доход '+((F.rx-F.base)>=0?'≈+$':'≈−$')+f(Math.abs(F.mv*(F.rx-F.base)*F.val))+'</b>'+(trustRisk?'. <span class="dn">Доверие: возможное снижение</span>':'')+(p.s&&Math.abs(p.s)>.3&&e>=2?'. Взгляды увидевших сдвинутся к «'+postStance(p)+'»':'')+'</div>';
 h+='<div class="fc"><b>▼ если закопать</b>: не будет показано ≈'+rng(F.ov)+' раз (столько набирает пост сам), не случится ≈'+rng(F.ov*F.rx)+' реакций, из них злых ≈'+rng(F.ov*F.rx*F.ang)+', недополучено ≈$'+f(F.ov*F.rx*F.val*F.acc[0])+'–'+f(F.ov*F.rx*F.val*F.acc[1])+' (его место займут другие: чистый эффект '+((F.base-F.rx)>=0?'≈+$':'≈−$')+f(Math.abs(F.ov*(F.base-F.rx)*F.val))+')'+(au?'. Автор обидится':'')+(P?'. '+PERS.find(x=>x.id==p.pers).n+' запомнит':'')+'</div>';
 h+='<div class="lbl">Ничего не делать — пост разойдётся органически: ≈'+rng(F.ov)+' показов.</div></div>';return h}
// ---------- доверие: из чего складывается ----------
function trustParts(){const a=S.ema.anger||0;return [['Базовый уровень',.72],['Технологии (пиксель и т.п.)',techEff('trust')],['Продажа аналитики',S.sell?-.22:0],['Скандалы и утечки (ещё не забыты)',-(S.trustDebt||0)],['Открытый алгоритм',has('openalgo')?.2:0],['Злость в ленте выше 40%',a>.4?-.1:0]].filter(x=>Math.abs(x[1])>.001)}
function trustLog(src,v){(S.tlog||(S.tlog=[])).unshift({t:S.t,src,v});S.tlog.length=Math.min(30,S.tlog.length)}
// ---------- проблемы сети ----------
function problems(){const P=[];const h=S.statH.slice(-6);const sum=k=>h.reduce((s,x)=>s+(x[k]||0),0);const left=sum('left'),join=sum('join');
 if(left>join&&left>2)P.push(['dn','Уходит больше людей, чем приходит ('+left+' против '+join+' за минуту)']);
 const ks=Object.keys(CHN).map(k=>[k,sum(k)]).sort((a,b)=>b[1]-a[1]);if(ks[0][1]>0)P.push(['','Главная причина ухода — '+CHN[ks[0][0]]+': '+CHFIX[ks[0][0]]]);
 if(S.trust<.5)P.push(['dn','Доверие ниже 50% — люди уходят, реклама дешевеет']);if((S.ema.anger||0)>.35)P.push(['dn','В ленте много злости ('+Math.round(S.ema.anger*100)+'% реакций)']);
 const sat=avgSat();if(sat<.3)P.push(['dn','Людям скучно: реагируют на '+Math.round(sat*100)+'% показанного']);if(S.m<0)P.push(['dn','Счёт в минусе — покупки заблокированы']);
 if(S.crisis)P.push(['dn','Идёт событие: '+CRISES.find(c=>c.k==S.crisis.k).n]);if(has('advert')&&S.boycott>S.t)P.push(['dn','Рекламный бойкот']);
 if(S.A.length>=agentCap()-3&&agentCap()<1500)P.push(['','Сеть упёрлась в мощность серверов']);return P}
const avgSat=()=>{let s=0,n=0;S.A.forEach(a=>{if(a.sat!=null){s+=a.sat;n++}});return n?s/n:.4};
function topTopics(){const m={};POOL.forEach(p=>{if(p.wave)return;const t=Math.min(p.t,NT);m[t]=(m[t]||0)+p.rx});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,v])=>(+t>=NT?'быт':TOPICS[+t].n)+' ('+v+')')}
