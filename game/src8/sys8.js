// ===================== ЛЕНТА.EXE v8 — ПРАВИЛА, СЛОВАРЬ, ЛАБОРАТОРИЯ, ЭКСПЕРИМЕНТЫ, АЛГОРИТМ =====================
// ---------- правила ----------
// условие: {k, v}. k: retGt, retLt, retAbove, retBelow, viewsGt, viewsLt, word, groupAny, groupAll, cat, likesGt, comsGt, quitsGt
// действие: +1 повысить приоритет, -1 понизить, +3 продвигать, -4 закапывать
const RACT={1:'повысить приоритет',3:'продвигать','-1':'понизить приоритет','-4':'закапывать'};
const ruleSlots=()=>1+eff('ruleSlots');
const ruleConds=()=>1+eff('ruleConds');
const ruleEvery=()=>Math.max(1,10-eff('ruleSpeed'));
function postRet(p){return p.views?p.dwT/p.views:0}
function postHas(p,key){const lem=has('forms');return p.words.some(x=>x.w==key||(lem&&x.l&&x.l==(lemmaOf(key)||key)))}
function condOk(c,p){const avg=S.avgRet||0;switch(c.k){
 case 'retGt':return p.views>=3&&postRet(p)>c.v;case 'retLt':return p.views>=3&&postRet(p)<c.v;case 'retAbove':return p.views>=3&&postRet(p)>avg;case 'retBelow':return p.views>=3&&postRet(p)<avg;
 case 'viewsGt':return p.views>c.v;case 'viewsLt':return p.views<c.v;case 'word':return postHas(p,c.v);
 case 'groupAny':{const g=S.dict.groups.find(x=>x.id==c.v);return !!g&&g.words.some(w=>postHas(p,w))}
 case 'groupAll':{const g=S.dict.groups.find(x=>x.id==c.v);return !!g&&g.words.length>0&&g.words.every(w=>postHas(p,w))}
 case 'cat':{const C=S.lab.cats.find(x=>x.id==c.v);return !!C&&postIn(p,C.t)}
 case 'likesGt':return p.views>=5&&p.likes/p.views*100>c.v;case 'comsGt':return p.views>=5&&p.coms/p.views*100>c.v;case 'quitsGt':return p.views>=5&&p.quits/p.views*100>c.v}return false}
function ruleOk(r,p){const cs=r.conds.slice(0,ruleConds());if(!cs.length)return false;return r.join=='or'?cs.some(c=>condOk(c,p)):cs.every(c=>condOk(c,p))}
function rulesTick(){if(!has('rules')||S.t%ruleEvery())return;const act=S.rules.filter(r=>r.on&&!r.exp).slice(0,ruleSlots());
 for(const p of POOL){let s=0;for(const r of act)if(ruleOk(r,p))s+=r.act;p.rp=clamp(s,-5,4)}}
// ---------- словарь ----------
const dictCap=()=>20+eff('dictCap');
const groupCap=()=>has('groups')?2+eff('groupCap'):0;
const dictKey=w=>has('forms')?(lemmaOf(w)||w):w;
function dictAdd(w){const k=dictKey(normW(w));if(!k||k.length<2)return 'пустое слово';const D=S.dict.words;if(D[k]){D[k].n++;return 'уже в словаре'}if(Object.keys(D).length>=dictCap())return 'словарь заполнен';D[k]={n:1,t:S.t};return ''}
function dictRemap(){if(!has('forms'))return;const D=S.dict.words,N={};for(const k in D){const l=lemmaOf(k)||k;N[l]=N[l]||D[k]}S.dict.words=N;S.dict.groups.forEach(g=>g.words=[...new Set(g.words.map(w=>lemmaOf(w)||w))])}
// ---------- лаборатория ----------
const labSlots=()=>1+eff('labSlots');
const labTime=()=>Math.round(60*Math.pow(.8,eff('labSpeed')));
const labSample=()=>Math.min(1,.5+eff('labData')*.25); // доля наблюдений, которую успевает обработать лаборатория
function labStart(gid,auto){const L=S.lab;const mine=L.runs.filter(r=>!!r.autoR==!!auto).length;if(mine>=(auto?1+eff('autoSlots'):labSlots()))return 'все слоты заняты';const g=auto?auto:S.dict.groups.find(x=>x.id==gid);if(!g||g.words.length<2)return 'в группе нужно хотя бы 2 слова';
 const h={id:L.nid++,name:g.name,words:g.words.slice(),t:S.t,auto:auto?1:0,res:null};L.hyp.unshift(h);L.runs.push({hid:h.id,words:h.words,end:S.t+labTime(),start:S.t,autoR:auto?1:0});return ''}
function corr(x,y){const n=x.length;if(n<5)return 0;let mx=0,my=0;for(let i=0;i<n;i++){mx+=x[i];my+=y[i]}mx/=n;my/=n;let a=0,b=0,c=0;for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy}return b&&c?a/Math.sqrt(b*c):0}
function labTick(){const L=S.lab;L.runs.filter(R=>S.t>=R.end).forEach(R=>{L.runs=L.runs.filter(x=>x!==R);labFinish(R)})}
// Анализ журнала просмотров: лаборатория берёт долю людей (объём данных) и смотрит, задерживаются ли одни и те же люди на всех словах группы
function labFinish(R){const L=S.lab,h=L.hyp.find(x=>x.id==R.hid);if(!h)return;const res=h.res={};
 const keyOf=w=>lemmaOf(w)||w;const ks=[...new Set(R.words.map(keyOf))];const frac=labSample();
 const us=S.U.filter(u=>u.ld&&u.ld[0]>=6&&((u.id*2654435761)>>>0)%1000<frac*1000);
 const mean=(o,a)=>o[a]?o[a+1]/o[a]:null;const per={};let obs=0;
 for(const u of us){const base=u.ld[1]/u.ld[0];for(const k of ks){const o=u.lw&&u.lw[k];if(!o)continue;const n=o[0]+o[2];obs+=n;if(n<1)continue;(per[k]||(per[k]={}))[u.id]=[(o[1]+o[3])/n-base,mean(o,0),mean(o,2),base,n]}}
 res.obs=obs;const ws=ks.filter(k=>per[k]&&Object.keys(per[k]).length>=8);const ids=[...new Set(ws.flatMap(k=>Object.keys(per[k])))];res.ag=ids.length;
 if(obs<120||ids.length<20||ws.length<2){res.k='few';res.why=[];if(obs<120)res.why.push('просмотров публикаций с этими словами: '+obs+' из 120');if(ids.length<20)res.why.push('людей с повторными просмотрами: '+ids.length+' из 20');if(ws.length<2)res.why.push('слов с достаточными данными: '+ws.length+' из 2');res.unseen=ks.filter(k=>!per[k]);done(h);return}
 const pc={};for(let i=0;i<ws.length;i++)for(let j=i+1;j<ws.length;j++){const A=per[ws[i]],Bm=per[ws[j]];const sh=Object.keys(A).filter(id=>Bm[id]);if(sh.length<15)continue;pc[ws[i]+'|'+ws[j]]=corr(sh.map(id=>A[id][0]),sh.map(id=>Bm[id][0]))}
 const pr=(a,b)=>pc[a+'|'+b]!=null?pc[a+'|'+b]:pc[b+'|'+a];
 let core=[];for(const w of ws){const c=[w];for(const v of ws)if(v!=w&&c.every(x=>(pr(x,v)||0)>.15))c.push(v);if(c.length>core.length)core=c}
 const pairs=[];for(let i=0;i<core.length;i++)for(let j=i+1;j<core.length;j++)pairs.push(pr(core[i],core[j])||0);const coh=pairs.length?pairs.reduce((a,b)=>a+b,0)/pairs.length:0;
 // оценка человека по ядру слов; устойчивость — совпадение по двум половинам журнала
 const sc={},sn={},h0={},h1={};for(const k of core)for(const id in per[k]){const x=per[k][id];sc[id]=(sc[id]||0)+x[0]*x[4];sn[id]=(sn[id]||0)+x[4];if(x[1]!=null&&x[2]!=null){h0[id]=(h0[id]||0)+x[1]-x[3];h1[id]=(h1[id]||0)+x[2]-x[3]}}
 for(const id in sc)sc[id]/=sn[id];const sid=Object.keys(sc);const noise=Math.max(0,.3-eff('labAcc')*.1);
 const tstat=(vals,t)=>{const a=[],b=[];for(const i in vals){const u=byId(+i);if(!u)continue;(topicInterest(u,t)>.35?a:b).push(vals[i])}if(a.length<5||b.length<5)return null;
  const ma=a.reduce((x,y)=>x+y,0)/a.length,mb=b.reduce((x,y)=>x+y,0)/b.length,va=a.reduce((x,y)=>x+(y-ma)**2,0)/(a.length-1),vb=b.reduce((x,y)=>x+(y-mb)**2,0)/(b.length-1);return (ma-mb)/Math.sqrt(va/a.length+vb/b.length+1e-9)};
 let best=-1,bc=0;for(let t=0;t<NT8;t++){const t0=tstat(sc,t);if(t0==null)continue;const tt=t0+gauss()*noise*3;if(tt>bc){bc=tt;best=t}}
 // устойчивость: та же разница должна повториться в каждой половине журнала отдельно
 const s0=best>=0?tstat(h0,best):null,s1=best>=0?tstat(h1,best):null;
 if(best>=0&&bc>3&&coh>.15&&(s0==null||s1==null)){res.k='few';res.why=['похоже на устойчивую группу, но в каждой половине наблюдений пока мало заинтересованных людей — повтори исследование, когда данных станет больше'];res.core=core;done(h);return}
 const st=best>=0?Math.min(s0||0,s1||0):0;
 Object.assign(res,{st,coh,core,match:bc,rest:ks.filter(w=>!core.includes(w))});
 if(st>1.5&&coh>.15&&bc>3&&core.length>=2){const ex=L.cats.find(c=>c.t==best);if(ex){res.k='known';res.cat=ex.id;ex.words=[...new Set(ex.words.concat(core))];ex.known=Math.min(100,ex.known+15)}
  else{const c={id:L.nid++,t:best,name:TOPICS8[best][0],words:core.slice(),known:35,auto:h.auto,at:S.t};L.cats.push(c);res.k=res.rest.length?'partial':'found';res.cat=c.id;if(h.auto)S.auto.found++;
   if(typeof toast=='function')toast('🔬 '+(h.auto?'Машина нашла':'Открыта')+' категория: <b>'+c.name+'</b>',12000)}}
 else{res.k='no';res.why=[];if(coh<=.15)res.why.push('слова относятся к разным направлениям: разные люди задерживаются на разных словах');if(st<=1.5)res.why.push('закономерность неустойчива: в одной из половин наблюдений она не повторилась');if(bc<=3&&coh>.15)res.why.push('связь слов есть, но не похожа на устойчивый интерес')}
 done(h)}
function done(h){if(typeof mail=='function')mail('<b>Лаборатория:</b> «'+esc(h.name)+'» — '+{found:'категория обнаружена',partial:'гипотеза частично подтверждена',known:'это уже известная категория',few:'недостаточно данных',no:'гипотеза не подтверждена'}[h.res.k]+'.')}
// ---------- эксперименты ----------
function expStart(ruleIdx,dur,sel){if(S.exp&&S.exp.on)return 'эксперимент уже идёт';const r=S.rules[ruleIdx];if(!r)return 'выбери правило';
 const pool=S.U.filter(u=>sel=='all'||!S.lab.cats.length||u.cls[sel]>.6);if(pool.length<20)return 'мало людей для эксперимента';
 pool.forEach(u=>u.grp=Math.random()<.5?'A':'B');S.exp={on:true,rule:ruleIdx,rn:ruleName(r),start:S.t,end:S.t+dur,sel,A:{},B:{}};return ''}
function expBonus(p){const r=S.rules[S.exp.rule];return r&&ruleOk(r,p)?r.act:0}
function expObs(u,d,h){const E=S.exp;if(!E||!E.on||!u.grp)return;const G=E[u.grp];const x=G[u.id]||(G[u.id]=[0,0,0,0,0,0]);x[0]++;x[1]+=d;x[2]+=h.lk;x[3]+=h.q}
function expTick(){const E=S.exp;if(!E||!E.on)return;if(S.t<E.end)return;E.on=false;S.U.forEach(u=>u.grp=null);
 const m=(G,k)=>Object.values(G).filter(x=>x[0]>=2).map(x=>k=='ret'?x[1]/x[0]:k=='views'?x[0]:k=='likes'?x[2]/x[0]:x[3]);
 const ks=['ret','views'].concat(has('mReact')?['likes']:[]).concat(has('mQuit')?['quits']:[]);E.res={};
 for(const k of ks){const a=m(E.A,k),b=m(E.B,k);const ma=a.reduce((s,x)=>s+x,0)/(a.length||1),mb=b.reduce((s,x)=>s+x,0)/(b.length||1);
  const va=a.reduce((s,x)=>s+(x-ma)**2,0)/Math.max(1,a.length-1),vb=b.reduce((s,x)=>s+(x-mb)**2,0)/Math.max(1,b.length-1);const se=Math.sqrt(va/Math.max(1,a.length)+vb/Math.max(1,b.length));const tt=se?(ma-mb)/se:0;
  E.res[k]={a:ma,b:mb,n:[a.length,b.length],t:tt,sig:a.length>=15&&b.length>=15&&Math.abs(tt)>2}}
 S.expHist.unshift(E);S.expHist.length=Math.min(8,S.expHist.length);if(typeof mail=='function')mail('<b>Эксперименты:</b> «'+esc(E.rn)+'» завершён. Удержание: '+(E.res.ret.sig?(E.res.ret.a>E.res.ret.b?'лучше':'хуже')+' контрольной группы':'разница не доказана')+'.')}
// ---------- автоматическое определение интересов ----------
const clsPerTick=()=>has('classify')?Math.round(2*Math.pow(2,eff('clsSpeed'))):0;
function classObs(u,p,d){if(!has('classify'))return;const C=u.co||(u.co={});C.n=(C.n||0)+1;C.d=(C.d||0)+d;for(const c of S.lab.cats){if(!postIn(p,c.t))continue;const x=C[c.id]||(C[c.id]=[0,0]);x[0]++;x[1]+=d}}
function classTick(){const n=clsPerTick();if(!n||!S.U.length)return;const acc=eff('clsAcc');
 for(let i=0;i<n;i++){const u=S.U[(S.clsI=((S.clsI||0)+1)%S.U.length)];const C=u.co;if(!C||!C.n)continue;const avg=C.d/C.n;
  for(const c of S.lab.cats){const x=C[c.id];if(!x||x[0]<2){continue}const diff=x[1]/x[0]-avg;const z=diff/Math.max(1,avg*.6)*Math.sqrt(Math.min(x[0],20))*(1+acc*.3);u.cls[c.id]=clamp(sigm(z*1.5-.5+gauss()*Math.max(0,.6-acc*.15)),0,1)}
  S.clsDone=(S.clsDone||0)+1}}
// ---------- персонализация ----------
function persScore(u,p){if(!has('pers'))return 0;let s=0;for(const c of S.lab.cats){const k=u.cls[c.id];if(k&&postIn(p,c.t))s+=k*(1.2+eff('persW')*.4)}
 if(has('cf')&&p.likers&&u.likes.length){let m=0;for(const lid of p.likers){const v=byId(lid);if(v&&v!==u&&v.likes.some(x=>u.likes.includes(x)))m++}s+=Math.min(1.5,m*.5)}
 if(has('fmtPref')){const fp=u.fmtD[p.fmt];if(fp&&fp[0]>=3)s+=clamp(fp[1]/fp[0]/(S.avgRet||8)-1,-1,1)*.8}
 if(has('contPred')&&p.views>=5)s-=p.quits/p.views*6;return s}
// ---------- автоматическое исследование ----------
function autoTick(){if(!has('autoRes')||S.t<S.auto.next)return;for(let k=0;k<6;k++)if(autoTry())return;S.auto.next=S.t+10}
function autoTry(){S.auto.next=S.t+Math.round(90*Math.pow(.75,eff('autoSpeed')));if(S.lab.runs.filter(r=>r.autoR).length>=1+eff('autoSlots'))return true;
 const acc=eff('autoAcc');const known=new Set(S.lab.cats.flatMap(c=>c.words));const knownT=new Set(S.lab.cats.map(c=>c.t));
 // 1) случайный человек и слова из постов, на которых он задержался дольше всего
 const u=pk(S.U.filter(x=>x.on&&x.hh.length>=8));if(!u)return false;const sc={};
 for(const h of u.hh){const p=POOL.find(q=>q.id==h.p);if(!p)continue;for(const x of p.words){if(!x.l||known.has(x.l))continue;sc[x.l]=(sc[x.l]||0)+h.dw}}
 let cand=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]);if(acc>=3)cand=cand.filter(l=>!(LEMMA_TOPIC[l]||[]).some(t=>knownT.has(t)));if(!cand.length)return false;
 let ws;if(acc<1)ws=cand.slice(0,4); // ранняя версия: просто самые «удерживающие» слова — часто из разных тем
 else{const L0=cand[0];const T=LEMMA_TOPIC[L0]||[];const vocab=new Set();for(const p of POOL)for(const x of p.words)if(x.l)vocab.add(x.l);
  ws=[L0].concat([...vocab].filter(l=>l!=L0&&!known.has(l)&&(LEMMA_TOPIC[l]||[]).some(t=>T.includes(t)))).slice(0,4);
  if(acc<2&&Math.random()<.5){const noise=[...vocab].filter(l=>!ws.includes(l));if(noise.length)ws[ws.length<4?ws.length:3]=pk(noise)}}
 if(ws.length<2)return false;S.auto.runs++;labStart(null,{name:'Авто: '+ws.slice(0,2).join(' + '),words:ws});return true}
// ---------- технологии ----------
// [id, раздел, название, описание, цена, требования, эффект {ключ:+n}, условие-цель]
const T8=[
['rules','Правила','Редактор правил','приложение «Правила»: автоматически повышай или понижай приоритет по удержанию и просмотрам',25,[],{}],
['srv','Серверы','Сервер','вдвое больше одновременных пользователей',0,[],{}],
['slot1','Правила','Второе правило','+1 активное правило',25,['rules'],{ruleSlots:1}],
['and','Правила','Условие И','два условия в одном правиле',25,['slot1'],{ruleConds:1}],
['rspeed1','Обработка','Быстрая проверка правил','правила проверяются раз в 7 с вместо 10',25,['rules'],{ruleSpeed:3}],
['dict','Словарь','Словарь','приложение «Словарь»: прокликивай слова в постах, собирай свои',35,['rules'],{}],
['groups','Словарь','Группы слов','объединяй слова в группы и используй их в правилах',40,['dict'],{}],
['slot2','Правила','Третье правило','+1 активное правило',50,['and'],{ruleSlots:1}],
['or','Правила','Условие ИЛИ','сочетай условия через ИЛИ',60,['and'],{}],
['dictcap1','Словарь','Словарь на 60 слов','+40 мест в словаре',65,['dict'],{dictCap:40}],
['lab','Лаборатория','Лаборатория','проверяй группы слов: существует ли такая аудитория',40,['groups'],{}],
['forms','Словарь','Словоформы','«машина», «машину», «машины» — одно слово',65,['dict'],{}],
['compact','Интерфейс','Компактная лента','во «Входящих» видно вдвое больше постов',50,['rules'],{feedRows:6}],
['labspd1','Лаборатория','Ускорение исследований I','исследование −20% времени',55,['lab'],{labSpeed:1}],
['gcap1','Словарь','Больше групп','+3 группы',100,['groups'],{groupCap:3}],
['exp','Эксперименты','Эксперименты','сравни правило на половине аудитории с контрольной группой',280,['lab'],{}],
['mReact','Метрики','Реакции','видны лайки, комментарии, репосты, сохранения; условия по ним в правилах',280,['exp'],{}],
['labslot1','Лаборатория','Второй слот исследований','два исследования одновременно',260,['labspd1'],{labSlots:1}],
['slot3','Правила','Четвёртое правило','+1 активное правило',215,['slot2'],{ruleSlots:1}],
['adEff1','Деньги','Баннер получше','+30% к доходу баннера',240,['rules'],{adEff:.3}],
['labdata1','Лаборатория','Больше данных','лаборатория обрабатывает 75% наблюдений вместо 50%',265,['labslot1'],{labData:1}],
['mQuit','Метрики','Уходы и сессии','видны уходы с платформы и длина сессий',430,['mReact'],{}],
['adload','Деньги','Плотность рекламы','ползунок: больше рекламы — больше денег и больше уходов',395,['mQuit'],{}],
['users','Пользователи','Наблюдение за пользователями','приложение «Пользователи»: профиль, лента, удержание каждого поста',290,['exp'],{}],
['cond3','Правила','Третье условие','три условия в одном правиле',440,['or'],{ruleConds:1}],
['uhist','Пользователи','Подробная история','видно, после каких постов человек ушёл, что пропустил и что лайкнул',360,['users'],{}],
['labacc1','Лаборатория','Точность исследований I','меньше ошибок при определении аудитории',480,['labdata1'],{labAcc:1}],
['rspeed2','Обработка','Параллельная проверка','правила проверяются каждые 3 с',920,['rspeed1','slot3'],{ruleSpeed:4}],
['classify','Алгоритм','Определение интересов','машина сама определяет интересы людей по открытым категориям',710,['users'],{}],
['clsspd1','Алгоритм','Классификация быстрее','вдвое больше людей за секунду',805,['classify'],{clsSpeed:1}],
['clsacc1','Алгоритм','Классификация точнее','меньше ошибочных интересов',1040,['classify'],{clsAcc:1}],
['pers','Алгоритм','Персонализация','лента подбирает посты под интересы каждого человека',2690,['classify'],{}],
['persw','Алгоритм','Сильная персонализация','интересы весят больше',3845,['pers'],{persW:1}],
['labslot2','Лаборатория','Третий слот исследований','три исследования одновременно',3815,['labacc1'],{labSlots:1}],
['cf','Алгоритм','Похожие пользователи','показывай то, что понравилось людям со схожими лайками',5445,['pers','mReact'],{}],
['fmtPref','Алгоритм','Предпочтения форматов','учитывать, какие форматы человек досматривает',6580,['cf'],{}],
['clsspd2','Алгоритм','Классификация ×4','ещё вдвое быстрее',7940,['clsspd1'],{clsSpeed:1}],
['contPred','Алгоритм','Прогноз продолжения','не показывать то, после чего люди уходят',9595,['fmtPref','mQuit'],{}],
['adEff2','Деньги','Таргетированный баннер','+60% к доходу баннера',11590,['pers'],{adEff:.6}],
['autoRes','Автоисследование','Автоматическое исследование','машина сама ищет новые темы',32270,['contPred','labslot2'],{}],
['autoacc1','Автоисследование','Связи слов','машина группирует слова по смыслу, а не случайно',21910,['autoRes'],{autoAcc:1}],
['autospd1','Автоисследование','Быстрый поиск','исследования чаще',24850,['autoRes'],{autoSpeed:1}],
['autoacc2','Автоисследование','Чистые гипотезы','только слова из постов с самым долгим удержанием',28190,['autoacc1'],{autoAcc:1}],
['autoslot','Автоисследование','Параллельный поиск','+1 автоматическое исследование',31970,['autospd1'],{autoSlots:1}],
['clsacc2','Алгоритм','Глубокие профили','точная классификация',46060,['clsacc1','autoacc1'],{clsAcc:2}],
['autoacc3','Автоисследование','Редкие интересы','машина замечает редкие темы',53935,['autoacc2'],{autoAcc:1}],
['autonomy','Автоисследование','Автономная система','правила, исследования и персонализация работают сами',77000,['autoacc3','clsacc2','autoslot'],{autoSpeed:2,ruleSpeed:2}]];
const TECH8=T8.map(([id,b,n,d,p,req,ef],i)=>({id,b,n,d,p,req,ef,i}));
const srvPrice=()=>Math.round(60*Math.pow(2.1,S.srvLvl-1));
function techOk8(t){return t.req.every(has)}
function buy8(id){if(id=='srv'){const c=srvPrice();if(S.m<c)return false;S.m-=c;S.srvLvl++;S.nb++;return true}const t=TECH8.find(x=>x.id==id);if(!t||has(id)||!techOk8(t)||S.m<t.p)return false;S.m-=t.p;S.f[id]=1;S.nb++;for(const k in t.ef)S.eff[k]=(S.eff[k]||0)+t.ef[k];if(id=='forms')dictRemap();return true}
// ---------- цели ----------
const GOALS=[['up1','Подними первую публикацию',()=>S.didUp],['ret','Добейся среднего удержания 12 с',()=>(S.avgRet||0)>=12],['rules','Открой редактор правил',()=>has('rules')],['rule1','Создай первое правило',()=>S.rules.length>0],
 ['slot1','Увеличь число активных правил',()=>has('slot1')],['dict','Открой словарь',()=>has('dict')],['w5','Собери 5 слов',()=>Object.keys(S.dict.words).length>=5],['g1','Создай первую группу слов',()=>S.dict.groups.length>0],
 ['gr','Используй группу в правиле',()=>S.rules.some(r=>r.conds.some(c=>c.k=='groupAny'||c.k=='groupAll'))],['lab','Открой лабораторию',()=>has('lab')],['res1','Проведи первое исследование',()=>S.lab.hyp.some(h=>h.res)],
 ['cat1','Открой первую категорию',()=>S.lab.cats.length>0],['crule','Создай правило по категории',()=>S.rules.some(r=>r.conds.some(c=>c.k=='cat'))],['exp1','Проведи первый эксперимент',()=>S.expHist.length>0],
 ['users','Открой наблюдение за пользователями',()=>has('users')],['u1','Изучи первого пользователя',()=>!!S.sel],['cls','Открой определение интересов',()=>has('classify')],['cls1','Классифицируй первых 50 человек',()=>(S.clsDone||0)>=50],
 ['pers','Открой персонализацию',()=>has('pers')],['auto','Открой автоматическое исследование',()=>has('autoRes')],['autoF','Получи категорию, найденную машиной',()=>S.auto.found>0],['autonomy','Запусти автономную систему',()=>has('autonomy')]];
function goalsTick(){if(S.t%2)return;for(const[id,n,ok]of GOALS)if(!S.goals[id]&&ok()){S.goals[id]=S.t;if(typeof toast=='function')toast('🎯 Цель выполнена: '+n)}}
const nextGoal=()=>GOALS.find(([id])=>!S.goals[id]);

const CONDN={retGt:'удержание выше … с',retLt:'удержание ниже … с',retAbove:'удержание выше среднего',retBelow:'удержание ниже среднего',viewsGt:'просмотров больше …',viewsLt:'просмотров меньше …',word:'содержит слово …',groupAny:'содержит слово из группы …',groupAll:'содержит все слова группы …',cat:'относится к категории …',likesGt:'лайков больше …% просмотров',comsGt:'комментариев больше …%',quitsGt:'уходов после поста больше …%'};
const condTxt=c=>{const v=c.k=='word'?'«'+c.v+'»':c.k.startsWith('group')?'«'+((S.dict.groups.find(g=>g.id==c.v)||{}).name||'?')+'»':c.k=='cat'?'«'+((S.lab.cats.find(x=>x.id==c.v)||{}).name||'?')+'»':c.v;return CONDN[c.k].replace('…',v)};
const ruleName=r=>'ЕСЛИ '+r.conds.map(condTxt).join(r.join=='or'?' ИЛИ ':' И ')+' → '+RACT[r.act];
