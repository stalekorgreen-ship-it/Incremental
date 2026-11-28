(function(){
const C=window.Core,L=window.Live,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],KEY='lentaos-live-1';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cell=v=>typeof v==='number'?String(Math.round(v*100)/100).replace('.',','):v;const pc=v=>Math.round(v*100)+'%';
const num=n=>Math.round(n).toLocaleString('ru-RU');
let S,W,LAST,sel=null,who=0,tab='task',paused=true,speed=1,find='',past=[],hints=0,peeked=false,dockKey='';
// стартовая схема: показывать всем что попало
const starter=()=>({nodes:[{id:'n1',type:'src',x:0,y:60,p:{table:'Кандидаты'}},{id:'n2',type:'rand',x:290,y:60,p:{n:5,per:'человек'}},{id:'n3',type:'show',x:580,y:60,p:{trial:5}}],wires:[['n1','n2','a'],['n2','n3','b']],seq:10});
function fresh(){S={G:starter(),V:{x:30,y:60,z:1},seed:1,marks:[]};}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.G)S=d;}catch(e){}if(!S)fresh();
const G=()=>S.G,V=()=>S.V,node=id=>G().nodes.find(n=>n.id===id),nel=id=>$(`.node[data-id="${id}"]`);
const results=()=>LAST.R;
function toast(a,b){const d=document.createElement('div');d.className='toast';d.innerHTML=`<b>${esc(a)}</b>${esc(b||'')}`;$('#toasts').append(d);while($('#toasts').children.length>2)$('#toasts').firstChild.remove();setTimeout(()=>d.remove(),5000);}
// расчёт без хода времени: что схема даёт прямо сейчас
function look(){const c=L.compute({...W,cache:new Map(W.cache)},G());c.plan=L.plan(W,G(),c.R);LAST=c;}
function reset(){W=L.init(S.seed);look();render();panel();}
function changed(){W.cache.clear();look();render();panel();save();}
function remember(){past.push(JSON.stringify({nodes:G().nodes,wires:G().wires}));if(past.length>60)past.shift();}
function undo(){const s=past.pop();if(s){Object.assign(G(),JSON.parse(s));changed();}}
const COLOR={src:'#2b4a9b',join:'#00757a',group:'#7a3ea8',top:'#b0620c',filter:'#9b2b4a',calc:'#2f7d32',rand:'#6b6b00',mem:'#7a2c00',show:'#000080'};
const ORDER=Object.keys(COLOR);
const NAMES=[...C.NAMES,'интерес','ждали','разница','качество2'];
const opt=(list,v,empty)=>(empty!==undefined?`<option value="">${empty}</option>`:'')+list.map(o=>{const[k,t]=Array.isArray(o)?o:[o,o];return`<option value="${esc(k)}"${String(v??'')===String(k)?' selected':''}>${esc(t)}</option>`;}).join('')+(v!==undefined&&v!==''&&v!==null&&!list.some(o=>String(Array.isArray(o)?o[0]:o)===String(v))?`<option value="${esc(v)}" selected>${esc(v)}${empty===undefined?' — нет такого':''}</option>`:'');
const pick=(label,key,list,v,empty)=>`<label><span>${label}</span><select data-set="${key}">${opt(list,v,empty)}</select></label>`;
const input=(label,key,v,ph)=>`<label><span>${label}</span><input data-set="${key}" value="${esc(v??'')}" placeholder="${ph||''}" autocomplete="off"></label>`;
const colsOf=t=>t?t.cols:[];
function body(n,r){const p=n.p,A=r&&r.inputs&&r.inputs[0],cols=colsOf(A),wait='<p class="dim">Подключи вход — появятся настройки.</p>',every=()=>pick('считать','every',[[1,'каждый круг'],[2,'раз в 2 круга'],[5,'раз в 5 кругов'],[10,'раз в 10 кругов']],p.every||1);
 if(n.type==='src')return pick('таблица','table',['Кандидаты','Реакции','Слова постов','Посты'],p.table,'выбери…');
 if(n.type==='mem'){const w=G().wires.find(w=>w[1]===n.id),t=w&&results()[w[0]]&&results()[w[0]].table,c=colsOf(t);
  return pick('помнить по','k1',c,p.k1,'выбери…')+pick('и по','k2',c,p.k2,'—')+pick('что','val',c,p.val,'выбери…')+pick('как','mode',Object.entries(L.MODES),p.mode||'avg')+pick('забывать','forget',L.FORGET.map(f=>[f,f?f+'% за круг':'ничего']),p.forget||0)+pick('назвать','name',NAMES,p.name||'вес');}
 if(n.type==='show'){const B=r&&r.inputs&&r.inputs[1];return pick('оценка','score',cols,p.score,A?'выбери…':'нет входа')+pick('мест на пробу','trial',[0,1,2,3,4,5],p.trial===undefined?1:p.trial)+(B?'':'<p class="dim">Вход «на пробу» пуст: мест на пробу нет.</p>');}
 if(!A)return wait;
 if(n.type==='join'){const B=r.inputs[1];if(!B)return wait;const sh=A.cols.filter(c=>B.cols.includes(c)),cross=[];for(const a of A.cols)for(const b of B.cols)if(a!==b&&(a.startsWith(b+' ')||b.startsWith(a+' ')))cross.push(a+' = '+b);
  const keys=[...sh,...cross];return(keys.length?pick('по столбцу','on1',keys,p.on1||sh[0])+(sh.length?pick('и ещё по','on2',sh,p.on2,'—'):''):'<p class="dim">Нет общих столбцов.</p>')+input('без пары','keep',p.keep,'выбросить (или число)')+every();}
 if(n.type==='group')return pick('одинаковые по','by1',cols,p.by1,'выбери…')+pick('и по','by2',cols,p.by2,'—')+pick('посчитать','agg',Object.entries(C.AGG),p.agg||'count')+((p.agg||'count')!=='count'?pick('столбец','col',cols,p.col,'выбери…'):'')+pick('назвать','name',NAMES,p.name,'само')+every();
 if(n.type==='top')return input('сколько N','n',p.n??1)+pick('в каждой группе','per',cols,p.per,'— по всей таблице')+pick('по столбцу','sort',cols,p.sort,'выбери…')+pick('что лучше','dir',[['desc','самые большие'],['asc','самые малые']],p.dir||'desc')+every();
 if(n.type==='rand')return input('сколько N','n',p.n??1)+pick('в каждой группе','per',cols,p.per,'— по всей таблице');
 if(n.type==='filter')return pick('столбец','col',cols,p.col,'выбери…')+pick('условие','op',Object.keys(C.CMP),p.op||'≥')+pick('сравнить с','col2',cols,p.col2,'числом или словом')+(p.col2?'':input('значение','val',p.val,'например 0,5'))+every();
 if(n.type==='calc')return pick('столбец','a',cols,p.a,'выбери…')+pick('действие','op',Object.keys(C.CALC),p.op||'÷')+pick('с чем','b',[...cols,['#','числом']],p.b,'выбери…')+(p.b==='#'?input('число','num',p.num):'')+pick('назвать','name',NAMES,p.name||'доля')+every();
 return'';}
const shownTable=(n,r)=>{if(!r)return null;return n.type==='mem'?L.memTable(W,n):r.table;};
function liveText(n,r){if(n.type==='mem'){const t=L.memTable(W,n);return!t?'выбери, по чему помнить':r.note||`помнит строк: ${num(t.rows.length)}`;}if(n.type==='show'){const k=LAST.plan.out.reduce((a,l)=>a+l.length,0);return LAST.plan.err||r.err||`занято мест: ${k} из ${L.NP*L.SLOTS}`;}return r.table?'строк: '+num(r.table.rows.length)+(r.old?` · ${r.old} кр. назад`:''):r.err||'';}
function liveUpdate(){for(const n of G().nodes){const el=nel(n.id),r=results()[n.id];if(!el||!r)continue;const lv=$('.live',el);lv.textContent=liveText(n,r);lv.classList.toggle('warn',!!(r.err||r.note||(n.type==='show'&&LAST.plan.err)));const c=LAST.costs[n.id]||0,max=Math.max(1,...Object.values(LAST.costs));$('.load u',el).style.width=Math.round(100*c/L.BUDGET)+'%';$('.load span',el).textContent='расчёт: '+num(c);el.classList.toggle('slow',c===max&&LAST.cost>L.BUDGET);}}
function render(){if(document.activeElement&&$('#world').contains(document.activeElement))document.activeElement.blur();const w=$('#world');$$('.node',w).forEach(e=>e.remove());
 for(const n of G().nodes){const r=results()[n.id],el=document.createElement('div');el.className='node'+(sel===n.id?' sel':'');el.dataset.id=n.id;el.dataset.kind=n.type;el.style.cssText=`left:${n.x}px;top:${n.y}px;--c:${COLOR[n.type]}`;
  el.innerHTML=`<header><b>${C.BLOCKS[n.type].title}</b><button data-act="help" title="Что делает">?</button><button data-act="del" title="Убрать">×</button></header><div class="ports">${C.BLOCKS[n.type].ins.map(([k,t])=>`<div class="port in" data-port="${k}" data-dir="in"><b></b>${t}</div>`).join('')}${n.type!=='show'?'<div class="port out" data-port="out" data-dir="out">что вышло<b></b></div>':''}</div><div class="cfg">${body(n,r)}</div><div class="live"></div><div class="load"><u></u><span></span></div>`;w.append(el);}
 const dk=ORDER.map(t=>`<button data-add="${t}" style="--c:${COLOR[t]}" title="${esc(C.BLOCKS[t].help)}">${C.BLOCKS[t].title}</button>`).join('');if(dk!==dockKey){dockKey=dk;$('#dock').innerHTML=dk;}
 $('#b-undo').disabled=!past.length;liveUpdate();applyView();drawWires();table();if(armed)arm(node(armed.id)?armed:null);}
function portPos(id,port,dir){const el=nel(id),b=el&&$(`.port[data-port="${port}"][data-dir="${dir}"] b`,el);if(!b)return null;let x=b.offsetWidth/2,y=b.offsetHeight/2,e=b;while(e&&e!==el){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}const n=node(id);return[n.x+x+el.clientLeft,n.y+y+el.clientTop];}
const curve=(a,b)=>{const k=Math.max(40,Math.abs(b[0]-a[0])*.45);return`M${a[0]} ${a[1]}C${a[0]+k} ${a[1]} ${b[0]-k} ${b[1]} ${b[0]} ${b[1]}`;};
function drawWires(temp){const s=$('#wires');s.textContent='';const mk=(d,cls,i)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class',cls);if(i!==undefined)p.dataset.wire=i;s.append(p);};
 G().wires.forEach((w,i)=>{const a=portPos(w[0],'out','out'),b=portPos(w[1],w[2],'in');if(!a||!b)return;const ok=results()[w[0]]&&results()[w[0]].table;mk(curve(a,b),'hit',i);mk(curve(a,b),(ok?'w':'w off')+(node(w[1]).type==='mem'?' mem':''));});if(temp)mk(curve(temp[0],temp[1]),'w temp');}
function applyView(){const v=V();$('#world').style.transform=`translate(${v.x}px,${v.y}px) scale(${v.z})`;}
function fit(){if(!G().nodes.length)return;const st=$('#stage').getBoundingClientRect();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const n of G().nodes){const e=nel(n.id);x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x+e.offsetWidth);y1=Math.max(y1,n.y+e.offsetHeight);}const z=Math.max(.1,Math.min(1,(st.width-40)/(x1-x0),(st.height-120)/(y1-y0))),v=V();v.z=z;v.x=(st.width-(x1-x0)*z)/2-x0*z;v.y=(st.height-60-(y1-y0)*z)/2-y0*z+30;applyView();}
// «Разложить»: столбцы по глубине; таблицы встают рядом с тем, кому нужны; порядок в столбце по высоте входов
function tidy(){const g=G(),depth={},d=id=>{if(depth[id]!==undefined)return depth[id];depth[id]=0;return depth[id]=node(id).type==='mem'?0:Math.max(0,...g.wires.filter(w=>w[1]===id).map(w=>d(w[0])+1));};g.nodes.forEach(n=>d(n.id));
 for(const n of g.nodes)if(n.type==='src'||n.type==='mem'){const to=g.wires.filter(w=>w[0]===n.id).map(w=>depth[w[1]]);if(to.length)depth[n.id]=Math.min(...to)-1;}
 const cols=[];for(const n of g.nodes)(cols[depth[n.id]]=cols[depth[n.id]]||[]).push(n);const h=n=>nel(n.id).offsetHeight;
 cols.forEach((list,c)=>{if(!list)return;const want=n=>{const from=g.wires.filter(w=>w[1]===n.id&&n.type!=='mem').map(w=>node(w[0]));return from.length?from.reduce((a,m)=>a+m.y,0)/from.length:null;};
  const w=new Map(list.map(n=>[n,want(n)]));
  // таблица встаёт туда же, где соседний вход её потребителя
  for(const n of list)if(w.get(n)===null){const to=g.wires.find(x=>x[0]===n.id),other=to&&g.wires.filter(x=>x[1]===to[1]&&x[0]!==n.id).map(x=>node(x[0])).filter(m=>depth[m.id]<c)[0];w.set(n,other?other.y+(to[2]==='a'?-1:1):n.y);}
  list.sort((a,b)=>w.get(a)-w.get(b));let y=0;for(const n of list){n.x=c*285;n.y=Math.max(y,Math.round(w.get(n)));y=n.y+h(n)+22;}
  const shift=Math.min(...list.map(n=>n.y-w.get(n)));if(shift>0){let y2=-1e9;for(const n of list){n.y=Math.max(y2,Math.round(n.y-shift/2));y2=n.y+h(n)+22;}}});
 render();fit();save();}
let armed=null,drag=null;
function arm(a){armed=a;$$('.port').forEach(p=>p.classList.remove('fit','armed'));if(!a)return;const el=nel(a.id);el&&$(`.port[data-port="${a.port}"][data-dir="${a.dir}"]`,el).classList.add('armed');$$('.port').forEach(p=>{if(p.dataset.dir!==a.dir&&p.closest('.node').dataset.id!==a.id)p.classList.add('fit');});}
const refOf=el=>({id:el.closest('.node').dataset.id,port:el.dataset.port,dir:el.dataset.dir});
const link=(a,b)=>{if(a.dir===b.dir)return;const[o,i]=a.dir==='out'?[a,b]:[b,a];join(o.id,i.id,i.port);};
const toWorld=e=>{const r=$('#stage').getBoundingClientRect(),v=V();return[(e.clientX-r.left-v.x)/v.z,(e.clientY-r.top-v.y)/v.z];};
$('#stage').addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('#dock,#zoom,#tabs,button,select,input'))return;
 const wi=e.target.dataset&&e.target.dataset.wire;if(wi!==undefined){remember();G().wires.splice(+wi,1);changed();return;}
 const port=e.target.closest('.port');if(port){const ref=refOf(port);e.preventDefault();if(armed&&armed.dir!==ref.dir){const a=armed;arm(null);link(a,ref);return;}arm(ref);drag={kind:'wire',ref,sx:e.clientX,sy:e.clientY};return;}
 const el=e.target.closest('.node');if(el){const n=node(el.dataset.id);if(sel!==n.id){sel=n.id;$$('.node').forEach(x=>x.classList.toggle('sel',x===el));table();}if(e.target.closest('header'))drag={kind:'node',n,el,x:n.x,y:n.y,sx:e.clientX,sy:e.clientY};return;}
 arm(null);drag={kind:'pan',x:V().x,y:V().y,sx:e.clientX,sy:e.clientY};});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(drag.kind==='pan'){V().x=drag.x+dx;V().y=drag.y+dy;applyView();}else if(drag.kind==='node'){drag.n.x=Math.round(drag.x+dx/V().z);drag.n.y=Math.round(drag.y+dy/V().z);drag.el.style.left=drag.n.x+'px';drag.el.style.top=drag.n.y+'px';drawWires();}else{drag.moved=drag.moved||Math.hypot(dx,dy)>6;if(drag.moved){const a=portPos(drag.ref.id,drag.ref.port,drag.ref.dir),m=toWorld(e);drawWires(drag.ref.dir==='out'?[a,m]:[m,a]);}}});
addEventListener('pointerup',e=>{const d=drag;drag=null;if(!d)return;if(d.kind==='wire'){if(d.moved){const t=document.elementFromPoint(e.clientX,e.clientY),p=t&&t.closest('.port');arm(null);if(p)link(d.ref,refOf(p));drawWires();}}else save();});
$('#stage').addEventListener('wheel',e=>{if(e.target.closest('#dock'))return;e.preventDefault();const r=$('#stage').getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,v=V(),z=Math.max(.1,Math.min(1.5,v.z*(e.deltaY<0?1.1:.9)));v.x=mx-(mx-v.x)*z/v.z;v.y=my-(my-v.y)*z/v.z;v.z=z;applyView();},{passive:false});
function freeSpot(){const st=$('#stage').getBoundingClientRect(),v=V(),Wd=232,H=250,box=G().nodes.map(n=>[n.x,n.y,(nel(n.id)||{}).offsetHeight||H]),free=(x,y)=>box.every(([a,b,h])=>x+Wd+24<=a||x>=a+Wd+24||y+H<=b||y>=b+h+14);
 const x0=(24-v.x)/v.z,y0=(48-v.y)/v.z,x1=(st.width-v.x)/v.z-Wd-10,y1=(st.height-70-v.y)/v.z-150;for(let x=x0;x<=Math.max(x0,x1);x+=64)for(let y=y0;y<=Math.max(y0,y1);y+=48)if(free(x,y))return[x,y];
 const nx=Math.max(...box.map(b=>b[0]))+Wd+50;v.x=Math.min(v.x,st.width-30-(nx+Wd)*v.z);return[nx,y0];}
function addNode(type){remember();const[x,y]=freeSpot(),p={};if(type==='top'||type==='rand')p.n=1;if(type==='mem')p.mode='avg';const n={id:'n'+(G().seq++),type,x:Math.round(x),y:Math.round(y),p};G().nodes.push(n);sel=n.id;changed();}
function delNode(id){remember();G().nodes=G().nodes.filter(m=>m.id!==id);G().wires=G().wires.filter(w=>w[0]!==id&&w[1]!==id);delete W.mem[id];if(sel===id)sel=null;changed();}
function join(from,to,port){remember();if(!L.connect(G(),from,to,port)){past.pop();toast('Не соединяется','Круг можно замкнуть только через «Память».');return;}sel=to;changed();}
$('#world').addEventListener('click',e=>{const el=e.target.closest('.node'),b=e.target.closest('button');if(!el||!b)return;const n=node(el.dataset.id);if(b.dataset.act==='del')delNode(n.id);else if(b.dataset.act==='help')toast(C.BLOCKS[n.type].title,C.BLOCKS[n.type].help);});
let down=false;addEventListener('pointerdown',()=>down=true,true);addEventListener('pointerup',()=>down=false,true);addEventListener('pointercancel',()=>down=false,true);
function later(){if(down)addEventListener('pointerup',()=>setTimeout(changed),{once:true,capture:true});else setTimeout(changed);}
$('#world').addEventListener('change',e=>{const k=e.target.dataset.set;if(!k)return;const n=node(e.target.closest('.node').dataset.id);remember();const v=e.target.value;n.p[k]=v;if(['forget','every','trial'].includes(k))n.p[k]=+v;if((k==='col2'||k==='keep')&&v==='')delete n.p[k];sel=n.id;later();});
$('#dock').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addNode(b.dataset.add);});
$('#zoom').addEventListener('click',e=>{const z=e.target.dataset.z;if(!z)return;if(z==='fit')fit();else if(z==='tidy')tidy();else{V().z=Math.max(.1,Math.min(1.5,V().z*+z));applyView();}save();});
$('#b-undo').onclick=undo;
const gridHTML=(t,limit)=>`<table class="d"><tr>${t.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${t.rows.slice(0,limit).map(r=>`<tr>${r.map(v=>`<td${typeof v==='number'?' class="n"':''}>${esc(cell(v))}</td>`).join('')}</tr>`).join('')}</table>`;
function table(){const box=$('#peek'),n=sel&&node(sel);box.classList.toggle('on',!!n);if(!n)return;const r=results()[n.id],t=shownTable(n,r);let sh=t;if(t&&find){const f=find.toLowerCase();sh={cols:t.cols,rows:t.rows.filter(x=>x.some(v=>String(cell(v)).toLowerCase()===f))};}
 $('#peek-t').textContent=`${C.BLOCKS[n.type].title}: ${t?num(t.rows.length)+' строк'+(find?`, с «${find}»: ${sh.rows.length}`:'')+(sh.rows.length>40?' (показаны 40)':''):'пока пусто'}`;$('#peek-b').innerHTML=t?gridHTML(sh,40):`<p class="dim">${esc(r&&r.err||'')}</p>`;}
$('#peek-find').addEventListener('input',e=>{find=e.target.value.trim();table();});$('#peek-x').onclick=()=>{sel=null;$$('.node.sel').forEach(e=>e.classList.remove('sel'));table();};
// ——— верх: счёт, график, нагрузка
function hud(){$('#v-round').textContent=W.round;$('#v-score').textContent=W.hist.length?pc(L.result(W,20)):'—';const load=LAST.cost,over=load>L.BUDGET;$('#v-load').textContent=num(load)+' / '+num(L.BUDGET);$('#v-served').textContent=over?`не успевает: ленту получают ${Math.max(1,Math.round(L.NP*L.BUDGET/load))} из ${L.NP}`:'ленту получают все';$('#v-load').parentNode.classList.toggle('bad',over);$('#v-unseen').textContent=W.stats.dead?pc(W.stats.unseen/W.stats.dead):'—';chart();}
function chart(){const c=$('#chart'),x=c.getContext('2d'),w=c.width=c.clientWidth||260,h=c.height=44;x.clearRect(0,0,w,h);const Y=v=>h-3-(Math.max(-.4,Math.min(1,v))+.4)/1.4*(h-6);x.strokeStyle='#999';x.beginPath();x.moveTo(0,Y(0));x.lineTo(w,Y(0));x.stroke();const d=W.hist.slice(-150);x.strokeStyle='#000080';x.lineWidth=2;x.beginPath();d.forEach((p,i)=>i?x.lineTo(i*w/150,Y(p.s)):x.moveTo(0,Y(p.s)));x.stroke();}
// ——— справа
const HINTS=['Узнать о человеке можно только по «Реакциям»: кому что показали и какую долю досмотрели. Чем реакция связана с постом, видно по номеру поста.',
 'Номер нового поста ни о чём не говорит. А слова в нём могли уже встречаться в постах, на которые человек реагировал. «Память» может копить что-то по паре «человек и слово».',
 'Пока память пуста, оценивать нечем. Откуда ей взяться, если показывать только лучшее?',
 'Если расчёт не помещается, посмотри, какая память растёт без конца, и что считается чаще, чем нужно.'];
function taskHTML(){return`<h2>Новые посты</h2><p>Каждый круг выходит 6 новых постов, живут они 10 кругов. У каждого человека 5 мест в ленте. Сеть не знает ни тем, ни вкусов: только слова постов и реакции на то, что сама показала.</p><p>Добейся, чтобы лента попадала во вкус. <b>0%</b> — как наугад, <b>100%</b> — как будто знаешь о каждом всё.</p><p class="dim">Иногда люди увлекаются другим. Не всякий пост хорош, даже на любимое.</p>`+
 HINTS.slice(0,hints).map((t,i)=>`<div class="advice">${t}</div>`).join('')+(hints<HINTS.length?`<button data-hint>💡 Подсказка (${hints+1} из ${HINTS.length})</button>`:'')+
 `<h3>Честное сравнение</h3><p class="dim">Прогоняет твою схему 150 кругов с чистой памятью в одном и том же мире.</p><button data-measure><b>Замерить схему</b></button>`+(S.marks.length?`<table class="d"><tr><th>№</th><th>результат</th><th>блоков</th><th>расчёт</th><th></th></tr>${S.marks.map((m,i)=>`<tr><td>${m.no}</td><td class="n">${pc(m.score)}</td><td class="n">${m.G.nodes.length}</td><td class="n">${num(m.load)}</td><td><button data-back="${i}">вернуть</button></td></tr>`).join('')}</table>`:'');}
function personHTML(){const name=L.NAMES[who],shown=(W.shown&&W.shown[who])||[];const know=[];for(const n of G().nodes)if(n.type==='mem'){const t=L.memTable(W,n);if(!t)continue;const i=t.cols.indexOf('человек');if(i<0)continue;const rows=t.rows.filter(r=>r[i]===name),iv=t.cols.length-2;rows.sort((a,b)=>b[iv]-a[iv]||b[iv+1]-a[iv+1]);know.push(`<p><b>Память «${esc(t.cols[iv])}»</b>: ${rows.length?rows.slice(0,14).map(r=>`<span class="w">${esc(r.filter((v,k)=>k!==i&&k<iv).join(' '))} ${cell(r[iv])}<i>×${cell(r[iv+1])}</i></span>`).join(''):'о нём пусто'}</p>`);}
 const top=W.taste[who].map((v,t)=>[v,t]).sort((a,b)=>b[0]-a[0]).slice(0,2);
 return`<p><button data-step="-1">◀</button> <b>${name}</b> <button data-step="1">▶</button></p>${know.join('')||'<p class="dim">Сеть пока ничего о нём не помнит: нет «Памяти» по человеку.</p>'}<h3>Что увидел в этот круг</h3>${shown.length?shown.map(it=>{const x=W.byId.get(it.post);return`<div class="post"><small>пост ${it.post}${it.score===null?' · на пробу':' · оценка '+cell(it.score)}</small><br>${x?esc(x.words.join(' ')):''}<br><b>досмотрел на ${pc(it.real)}</b></div>`;}).join(''):'<p class="dim">Ничего.</p>'}<p><button data-truth>${peeked?'Скрыть правду':'👁 Подсмотреть правду'}</button>${peeked?` <span>любит: <b>${top.map(([,t])=>L.TITLE[t]).join(', ')}</b></span>`:''}</p>`;}
let panelKey='';function panel(){$$('#ptabs [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));const h=tab==='task'?taskHTML():personHTML();if(h!==panelKey){panelKey=h;const b=$('#pbody'),y=b.scrollTop;b.innerHTML=h;b.scrollTop=y;}hud();}
$('#ptabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;panel();}});
function measure(){const T=L.init(S.seed),g=JSON.parse(JSON.stringify(G()));for(let i=0;i<150;i++)L.step(T,g);const m={no:(S.marks[0]?S.marks[0].no:0)+1,score:L.result(T,60),load:T.load,G:g};S.marks.unshift(m);S.marks.length=Math.min(8,S.marks.length);save();return m;}
$('#pbody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if('hint'in d)hints++;else if('truth'in d)peeked=!peeked;else if(d.step)who=(who+ +d.step+L.NP)%L.NP;
 else if('measure'in d){b.textContent='Считаю…';setTimeout(()=>{const m=measure();toast('Замер '+m.no+': '+pc(m.score),'расчёт '+num(m.load));panel();},30);return;}else if(d.back){remember();Object.assign(G(),JSON.parse(JSON.stringify(S.marks[+d.back].G)));changed();toast('Схема возвращена','Память сети не менялась.');}panel();});
// ——— ход времени
function round(){LAST=L.step(W,G());}
function refresh(){const typing=document.activeElement&&/^(SELECT|INPUT)$/.test(document.activeElement.tagName)&&$('#world').contains(document.activeElement);liveUpdate();
 // настройки появляются, когда у входа впервые есть таблица
 const sig=G().nodes.map(n=>{const r=results()[n.id];return r&&r.inputs?r.inputs.map(t=>t?t.cols.join():'').join(';'):'';}).join('/');if(sig!==colsSig&&!typing){colsSig=sig;render();}else{drawWires();if(!$('#peek').matches(':hover'))table();}panel();}
let colsSig='';
const setRun=on=>{paused=!on;$('#b-run').innerHTML=on?'❚❚ Стоп':'▶ Пуск';$('#b-run').classList.toggle('on',on);};
$('#b-run').onclick=()=>setRun(paused);$('#b-step').onclick=()=>{setRun(false);round();refresh();};
$('#b-speed').onclick=()=>{speed=speed===1?4:speed===4?15:1;$('#b-speed').textContent='×'+speed;};
$('#b-wipe').onclick=()=>{setRun(false);reset();toast('Память стёрта','Мир начался заново, схема осталась.');};
let acc=0,prev=performance.now();setInterval(()=>{const now=performance.now(),dt=Math.min(1,(now-prev)/1000);prev=now;if(paused||document.hidden){acc=0;return;}acc+=dt*speed/1.5;let k=0;const t0=performance.now();while(acc>=1&&k<6&&performance.now()-t0<150){round();acc--;k++;}if(k){acc=Math.min(acc,2);refresh();}},100);
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'){e.preventDefault();undo();}else if(e.key==='Delete'&&sel&&node(sel))delNode(sel);else if(e.code==='Space'){e.preventDefault();setRun(paused);}else if(e.key==='Escape')arm(null);});
setRun(false);reset();setTimeout(fit,0);
window.__live={get W(){return W;},get S(){return S;},get last(){return LAST;},run:n=>{for(let i=0;i<n;i++)round();refresh();},put(g){S.G=JSON.parse(JSON.stringify(g));S.G.seq=1000;past=[];reset();tidy();},measure,fit,tidy};
})();
