// ===================== ЛАБОРАТОРИЯ АЛГОРИТМА: исследование аудитории =====================
// Скрытые группы существуют с начала игры: интересы людей (a.it по 14 темам) и поведенческие черты (a.ph — картинки,
// a.arg — споры, a.lng — длинные тексты). Игрок их не видит. Он видит удержание постов и слова, собирает гипотезы,
// а алгоритм проверяет их на реальных наблюдениях: устойчивость (две половины окна) и связность (одни и те же люди
// задерживаются на всех словах гипотезы). Категория открывается, только если структура действительно есть.
const CATN=['Финансисты','Миграционная повестка','Экологи','Политизированные','Любители животных','Ностальгирующие','Технофилы','Геймеры','Спортсмены','Кулинары','ЗОЖ и здоровье','Учащиеся и родители','Фанаты звёзд','Автомобилисты'];
const TRAITS=[['ph','Любители картинок'],['arg','Спорщики'],['lng','Любители длинных текстов']];
// кандидаты скрытой структуры: темы 0..13 и черты 14..16
const hidVal=(a,c)=>c<NT?a.it[c]:(a[TRAITS[c-NT][0]]||0);
const hidName=c=>c<NT?CATN[c]:TRAITS[c-NT][1];
const isMember=(a,cat)=>{if(cat.parent!=null){const P=LAB().cats.find(x=>x.id==cat.parent);if(P&&!isMember(a,P))return false}return hidVal(a,cat.key)>(cat.key<NT?.5:.45)};
const LAB=()=>S.lab||(S.lab={hyp:[],cats:[],run:null,nid:1,cw:{},sel:[],sug:[]});
// ---------- наблюдения ----------
function wordObs(a,p,d){if(p.wave)return;const W=S.ws||(S.ws={});S.dwT=(S.dwT||0)+d;S.dwN=(S.dwN||0)+1;
 for(const w of p.toks){const o=W[w]||(W[w]=[0,0]);o[0]++;o[1]+=d}
 const L=S.lab;if(!L)return;
 if(L.cats.length){for(const c of L.cats)if(isMember(a,c)){const cw=L.cw[c.id]||(L.cw[c.id]={});for(const w of p.toks){const o=cw[w]||(cw[w]=[0,0]);o[0]++;o[1]+=d}c.obs=(c.obs||0)+1}}
 const R=L.run;if(!R)return;if(R.parent!=null){const P=L.cats.find(x=>x.id==R.parent);if(P&&!isMember(a,P))return}
 const half=S.t<(R.start+R.end)/2?0:1;const hit=p.toks.filter(w=>R.words.includes(w));const A=R.ag[a.id]||(R.ag[a.id]=[0,0,0,0,0,0,0,0]);
 if(hit.length){A[0]++;A[1]+=d;A[4+half*2]++;A[5+half*2]+=d;R.hn++;for(const w of hit){const m=R.pw[w]||(R.pw[w]={});const x=m[a.id]||(m[a.id]=[0,0]);x[0]++;x[1]+=d}}else{A[2]++;A[3]+=d}}
const avgDw=()=>S.dwN?S.dwT/S.dwN:8;
// ---------- исследования ----------
function hypTime(n,sub){return Math.round((50+Math.max(0,n-3)*15+(sub?40:0))*(has('labfast')?.6:1))}
function startResearch(h){const L=LAB();if(L.run)return 'Уже идёт исследование';if(h.words.length<1)return 'Добавь слова';
 const d=hypTime(h.words.length,h.parent!=null);L.run={hid:h.id,words:h.words.slice(),parent:h.parent,start:S.t,end:S.t+d,ag:{},pw:{},hn:0};h.status='run';h.res=null;return ''}
function corr(x,y){const n=x.length;if(n<5)return 0;let mx=0,my=0;for(let i=0;i<n;i++){mx+=x[i];my+=y[i]}mx/=n;my/=n;let a=0,b=0,c=0;for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy}return b&&c?a/Math.sqrt(b*c):0}
function labTick(){const L=S.lab;if(!L)return;if(L.run&&S.t>=L.run.end)finishResearch();
 if(has('selflearn')&&!L.run&&S.t%90==0){const sg=suggest();if(sg.length){const h={id:L.nid++,name:'Авто: '+sg[0].words.slice(0,2).join(', '),words:sg[0].words,status:'new',parent:null,auto:1};L.hyp.unshift(h);startResearch(h)}}}
function finishResearch(){const L=LAB(),R=L.run;L.run=null;const h=L.hyp.find(x=>x.id==R.hid);if(!h)return;h.status='done';
 const ids=Object.keys(R.ag).filter(id=>{const A=R.ag[id];return A[0]>=3&&A[2]>=3&&byId(+id)});const res={obs:R.hn,ag:ids.length,words:[]};h.res=res;
 const need=h.parent!=null?120:220,needA=h.parent!=null?12:25;
 const wsOk=Object.keys(R.pw).filter(w=>Object.keys(R.pw[w]).length>=6).length;
 if(R.hn<need||ids.length<needA||(R.words.length>1&&wsOk<2)){res.k='few';res.why=[];if(R.words.length>1&&wsOk<2)res.why.push('достаточно данных набралось только по '+wsOk+' слову из '+R.words.length+' — связь между словами не проверить');if(R.hn<need)res.why.push('мало показов постов с этими словами: '+R.hn+' из '+need+' нужных');if(ids.length<needA)res.why.push('мало людей с повторными наблюдениями: '+ids.length+' из '+needA);
  res.tip='Подними посты с этими словами, чтобы их увидело больше людей, или добавь слова, которые встречаются чаще.';labWordHints(R,res,null);mailRes(h);return}
 const sc=ids.map(id=>{const A=R.ag[id];return A[1]/A[0]-A[3]/A[2]});
 // устойчивость: совпадают ли оценки людей в первой и второй половине окна
 const hs=ids.filter(id=>{const A=R.ag[id];return A[4]>=1&&A[6]>=1});const st=corr(hs.map(id=>R.ag[id][5]/R.ag[id][4]),hs.map(id=>R.ag[id][7]/R.ag[id][6]));
 // связность: одни и те же люди задерживаются на разных словах гипотезы?
 const ws=Object.keys(R.pw).filter(w=>Object.keys(R.pw[w]).length>=6);let cs=0,cn=0;
 for(let i=0;i<ws.length;i++)for(let j=i+1;j<ws.length;j++){const A=R.pw[ws[i]],B=R.pw[ws[j]];const sh=Object.keys(A).filter(id=>B[id]);if(sh.length<6)continue;const ob=id=>R.ag[id]&&R.ag[id][2]?R.ag[id][3]/R.ag[id][2]:0;cs+=corr(sh.map(id=>A[id][1]/A[id][0]-ob(id)),sh.map(id=>B[id][1]/B[id][0]-ob(id)));cn++}
 const coh=cn?cs/cn:(R.words.length==1?.5:0);const G=ids.filter((id,i)=>sc[i]>3);const share=G.length/ids.length;
 res.st=st;res.coh=coh;res.share=share;res.ci=1.96*Math.sqrt(share*(1-share)/ids.length);
 // с какой скрытой структурой совпадает найденная группа (это делает алгоритм, не игрок)
 const ags=ids.map(id=>byId(+id));let best=-1,bc=0;for(let c=0;c<NT+TRAITS.length;c++){const r=corr(sc,ags.map(a=>hidVal(a,c)));if(r>bc){bc=r;best=c}}res.match=bc;
 labWordHints(R,res,new Set(G));
 if(st>.3&&coh>.2&&share>=.03&&share<=.75&&bc>.35){const dup=L.cats.find(c=>c.key==best&&c.parent==h.parent);
  if(dup){dup.known=Math.min(100,dup.known+15);res.k='known';res.cat=dup.id;dup.words=[...new Set(dup.words.concat(res.words.filter(w=>w.lift>1.5).map(w=>w.w)))]}
  else{const P=h.parent!=null?L.cats.find(c=>c.id==h.parent):null;const cat={id:L.nid++,key:best,name:(P?P.name+' → ':'')+hidName(best),words:res.words.filter(w=>w.lift>1.5).map(w=>w.w),known:35,parent:h.parent,t:S.t,share};
   const cw=L.cw[cat.id]={};for(const w in R.pw)for(const id of G){const x=R.pw[w][id];if(x){const o=cw[w]||(cw[w]=[0,0]);o[0]+=x[0];o[1]+=x[1]}}
   L.cats.push(cat);res.k='found';res.cat=cat.id;toast('🔬 Обнаружена группа пользователей: <b>'+cat.name+'</b>',12000)}}
 else{res.k='no';res.why=[];if(coh<=.2)res.why.push('слова относятся к разным интересам: люди, которые долго смотрят одно слово, не задерживаются на других (связность '+coh.toFixed(2)+')');
  if(st<=.3)res.why.push('закономерность неустойчива: в первой и второй половине наблюдений это разные люди (устойчивость '+st.toFixed(2)+')');
  if(share>.75)res.why.push('слова слишком широкие: долго смотрят почти все');if(share<.03)res.why.push('выделяющейся группы почти нет');if(bc<=.35&&coh>.2&&st>.3)res.why.push('группа есть, но она не похожа на устойчивый интерес');}
 mailRes(h)}
function labWordHints(R,res,G){const all=Object.keys(R.pw);res.words=all.map(w=>{const m=R.pw[w];let gi=0,gn=0,oi=0,on=0,n=0;for(const id in m){n+=m[id][0];const v=m[id][1]/m[id][0];if(G&&G.has(id)){gi+=v;gn++}else{oi+=v;on++}}return {w,n,lift:G&&gn&&on?gi/gn-oi/on:0}}).sort((a,b)=>b.lift-a.lift);
 res.unseen=R.words.filter(w=>!R.pw[w])}
function mailRes(h){const r=h.res;const t=r.k=='found'?'обнаружена новая группа':r.k=='known'?'подтверждена известная группа':r.k=='few'?'недостаточно данных':'устойчивой группы не найдено';if(typeof mail=='function')mail('<b>Лаборатория:</b> гипотеза №'+String(h.id).padStart(3,'0')+' «'+esc(h.name)+'» — '+t+'.')}
// ---------- подсказки (предиктивный анализ) ----------
function suggest(){if(!has('labsuggest')&&!has('selflearn'))return [];const W=S.ws||{};const L=LAB();const known=new Set(L.cats.filter(c=>c.parent==null).map(c=>c.key));const out=[];
 // алгоритм группирует слова, на которых задерживаются одни и те же темы постов
 for(let t=0;t<NT;t++){if(known.has(t))continue;const ws=TOPICS[t].k.map(normW).filter(w=>W[w]&&W[w][0]>=15);if(ws.length<3)continue;const lift=ws.reduce((s,w)=>s+W[w][1]/W[w][0],0)/ws.length-avgDw();out.push({words:ws.slice(0,5),lift})}
 return out.sort((a,b)=>b.lift-a.lift).slice(0,3)}
// ---------- категории: статистика и эффективность правил ----------
function catStats(c){const m=S.A.filter(a=>isMember(a,c));const cw=LAB().cw[c.id]||{};const base=avgDw();
 const words=Object.entries(cw).filter(([w,o])=>o[0]>=5&&w[0]!='#').map(([w,o])=>({w,d:o[1]/o[0],n:o[0]})).sort((a,b)=>b.d-a.d);
 const fm=Object.entries(cw).filter(([w,o])=>w[0]=='#'&&o[0]>=5).map(([w,o])=>({w,d:o[1]/o[0]})).sort((a,b)=>b.d-a.d);
 const avg=words.length?Object.values(cw).reduce((s,o)=>s+o[1],0)/Object.values(cw).reduce((s,o)=>s+o[0],0):0;
 return {n:m.length,share:m.length/Math.max(1,S.A.length),users:m.length*U(),words,fm,avg,base,young:m.filter(a=>a.age<25).length/Math.max(1,m.length),dist:DISTRICTS.map((d,i)=>[d,m.filter(a=>a.d==i).length]).sort((a,b)=>b[1]-a[1]).slice(0,2)}}
function wordEff(cat,w){const cw=LAB().cw[cat.id]||{};const o=cw[normW(w)];const base=avgDw();if(!o||o[0]<3)return null;const d=o[1]/o[0];return {d,pct:(d/base-1)*100,n:o[0]}}
// ---------- окно ----------
WIN.lab={t:'Лаборатория алгоритма',i:'dash',w:720,h:560,need:'lab',live:1,r(){const L=LAB();const W=S.ws||{};const base=avgDw();
 const dict=Object.entries(W).filter(([w,o])=>o[0]>=8).map(([w,o])=>({w,n:o[0],d:o[1]/o[0]})).sort((a,b)=>b.d-a.d);
 let h='<div class="labgrid"><fieldset class="lab1"><legend>1. Словарь — '+dict.length+' слов · среднее удержание '+base.toFixed(1)+' с</legend><div class="lbl">Слова и теги из постов, которые видели люди. Клик — добавить в гипотезу.</div><div class="wl">'+
  dict.slice(0,80).map(x=>'<span class="lw'+(L.sel.includes(x.w)?' on':'')+'" data-a="labw" data-w="'+esc(x.w)+'">'+esc(x.w)+' <i class="'+(x.d>base?'up':'dn')+'">'+x.d.toFixed(1)+'с</i><small>'+x.n+'</small></span>').join('')+'</div></fieldset>';
 h+='<fieldset class="lab2"><legend>2. Конструктор гипотез</legend><div>Слова: '+(L.sel.length?L.sel.map(w=>'<span class="chip">'+esc(w)+' <a data-a="labw" data-w="'+esc(w)+'">×</a></span>').join(''):'<span class="lbl">выбери слова в словаре</span>')+'</div>'+
  (has('labsub')&&L.cats.length?'<label class="row">Внутри категории: <select data-labp="1">'+opt([['','вся сеть']].concat(L.cats.map(c=>[c.id,c.name])),L.par==null?'':L.par)+'</select></label>':'')+
  '<div class="row"><input id="labname" placeholder="название гипотезы" style="flex:1"> '+B('Исследовать ('+hypTime(L.sel.length,L.par!=null)+' с)','labgo',L.sel.length&&!L.run?'':'disabled')+'</div>';
 const sg=suggest();if(sg.length)h+='<div class="lbl">Алгоритм предлагает проверить: '+sg.map((x,i)=>'<a data-a="labsg" data-i="'+i+'">'+x.words.join(', ')+'</a>').join(' · ')+'</div>';h+='</fieldset>';
 h+='<fieldset class="lab3"><legend>3. Терминал</legend>'+(L.run?(()=>{const R=L.run;const T=R.end-R.start,el=S.t-R.start;const nA=Object.values(R.ag).filter(A=>A[0]>=3&&A[2]>=3).length;return '<div>Гипотеза №'+String(R.hid).padStart(3,'0')+': '+R.words.join(', ')+'</div>'+bar(el/T)+'<div class="lbl">Осталось '+(R.end-S.t)+' с · показов с этими словами: '+R.hn+' · людей с повторными наблюдениями: '+nA+'</div>'})():'<span class="lbl">Свободен.</span>')+'</fieldset>';
 h+='<fieldset class="lab4"><legend>4. Результаты</legend>'+(L.hyp.length?L.hyp.slice(0,8).map(x=>hypHTML(x)).join(''):'<span class="lbl">Пока ничего не исследовано.</span>')+'</fieldset>';
 h+='<fieldset class="lab5"><legend>5. Открытые категории</legend>'+(L.cats.length?L.cats.map(c=>catHTML(c)).join(''):'<span class="lbl">Группы пользователей существуют, но ты их ещё не нашёл.</span>')+'</fieldset></div>';return h}};
function hypHTML(x){const r=x.res;let s='<div class="news"><b>№'+String(x.id).padStart(3,'0')+' «'+esc(x.name)+'»</b> <span class="lbl">'+x.words.join(', ')+(x.parent!=null?' · внутри «'+esc((LAB().cats.find(c=>c.id==x.parent)||{}).name||'')+'»':'')+'</span><br>';
 if(x.status=='run')return s+'исследуется…</div>';if(!r)return s+'</div>';
 s+='Наблюдений: '+f(r.obs)+' · людей: '+r.ag+(r.share!=null?' · выделяющаяся группа: '+Math.round(Math.max(0,r.share-r.ci)*100)+'–'+Math.round(Math.min(1,r.share+r.ci)*100)+'%':'')+'<br>';
 if(r.k=='found')s+='<b class="up">✓ Обнаружена устойчивая группа: '+esc((LAB().cats.find(c=>c.id==r.cat)||{}).name||'')+'</b> (устойчивость '+r.st.toFixed(2)+', связность '+r.coh.toFixed(2)+')';
 else if(r.k=='known')s+='<b>Это уже известная группа</b> — изученность +15%';else if(r.k=='few')s+='<b class="dn">Недостаточно данных:</b> '+r.why.join('; ')+'. '+r.tip;else s+='<b class="dn">Устойчивой группы не обнаружено:</b> '+r.why.join('; ');
 if(r.words&&r.words.length&&r.k!='few')s+='<br><span class="lbl">Полезные слова: '+r.words.filter(w=>w.lift>1.5).map(w=>w.w+' (+'+w.lift.toFixed(1)+'с)').join(', ')+(r.words.some(w=>w.lift<=1.5)?' · без связи: '+r.words.filter(w=>w.lift<=1.5).map(w=>w.w).join(', '):'')+'</span>';
 if(r.unseen&&r.unseen.length)s+='<br><span class="lbl">Не встретились ни разу: '+r.unseen.join(', ')+'</span>';return s+'</div>'}
function catHTML(c){const st=catStats(c);let s='<div class="card"><div class="row"><b>'+esc(c.name)+'</b><span>изученность '+c.known+'%</span></div><div class="lbl">≈'+Math.round(st.share*100)+'% сети ('+f(st.users)+' пользователей) · удержание '+(st.avg?st.avg.toFixed(1):'?')+' с против '+st.base.toFixed(1)+' с в среднем</div>';
 if(st.words.length)s+='<div class="lbl">Цепляет: '+st.words.slice(0,c.known>=50?8:4).map(w=>w.w+' '+w.d.toFixed(1)+'с').join(', ')+'</div>';
 if(c.known>=50&&st.fm.length)s+='<div class="lbl">Форматы: '+st.fm.slice(0,3).map(w=>w.w+' '+w.d.toFixed(1)+'с').join(', ')+'</div>';
 if(c.known>=65)s+='<div class="lbl">До 25 лет: '+Math.round(st.young*100)+'% · больше всего: '+st.dist.map(d=>d[0]).join(', ')+'</div>';
 return s+(c.known<100?'<div class="lbl">Повторное исследование или подгруппы откроют больше.</div>':'')+'</div>'}
function labClick(a,d,i){const L=LAB();if(a=='labw'){const w=d.w;const k=L.sel.indexOf(w);if(k>=0)L.sel.splice(k,1);else if(L.sel.length<10)L.sel.push(w);draw('lab')}
 if(a=='labgo'){const nm=($('labname')||{}).value||('Гипотеза '+L.nid);const h={id:L.nid++,name:nm,words:L.sel.slice(),status:'new',parent:L.par==null?null:L.par};L.hyp.unshift(h);const e=startResearch(h);if(e)toast(e);else{L.sel=[];toast('🔬 Исследование запущено')}draw('lab')}
 if(a=='labsg'){const sg=suggest()[i];if(sg){L.sel=sg.words.slice();draw('lab')}}}
(function(){if(typeof document=='undefined')return;const st=document.createElement('style');st.textContent='.labgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.labgrid .lab1{grid-row:span 2}.labgrid .lab4,.labgrid .lab5{grid-column:span 1}.wl{max-height:330px;overflow:auto}.lw{display:inline-block;margin:2px;padding:1px 4px;border:1px solid #888;background:#fff;cursor:pointer;font-size:12px}.lw.on{background:#ffe680}.lw i{font-style:normal;margin-left:3px}.lw small{color:#888;margin-left:3px}';if(typeof document!='undefined'&&document.head)document.head.appendChild(st)})();
