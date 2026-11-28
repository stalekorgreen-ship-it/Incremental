// ——— экран: конструктор, задания, заказы, покупки, лента и люди
(function(){
const C=window.Core,Q=window.Goals,Fun=window.Fun,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='lentaos-net4-1';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=n=>n>=1e9?dec(n/1e9)+' млрд':n>=1e6?dec(n/1e6)+' млн':Math.floor(n).toLocaleString('ru-RU');
const dec=v=>String(Math.round(v*10)/10).replace('.',',');
const pc=v=>Math.floor(v*100)+'%';
const cell=v=>typeof v==='number'?String(Math.round(v*1000)/1000).replace('.',','):v;
const HOST=(()=>{try{return window.parent!==window&&window.parent.PC||null;}catch(e){return null;}})();
let S,CV,cur,F,files,who=0,page='work',tab='goal',sel=null,hints={},paused=false,hidden=false,seen={};
const caches={alg:new Map(),ord:new Map()};
let M=null,OR=null;// расчёт основной схемы и черновика заказов
const G=()=>CV[cur].G,V=()=>CV[cur].V;
const emptyCanvas=()=>({G:{nodes:[],wires:[],seq:1},V:{x:30,y:50,z:1}});
function fresh(){S=C.init(Q.SEED);S.sel=null;CV={alg:emptyCanvas(),ord:emptyCanvas()};cur='alg';F=Fun.create();files=[];who=0;hints={};sel=null;tab='goal';seen={};}
function save(){try{localStorage.setItem(KEY,JSON.stringify({S,CV,cur,F,files,who,hints,tab,seen}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.S&&d.CV){({S,CV,cur,F,files,who,hints,tab,seen}=d);return true;}}catch(e){}return false;}
const note=(t,d)=>Fun.log(F,t,S.goal,d);
function toast(a,b){const d=document.createElement('div');d.className='toast';d.innerHTML=`<b>${esc(a)}</b>${esc(b||'')}`;$('#toasts').append(d);while($('#toasts').children.length>3)$('#toasts').firstChild.remove();setTimeout(()=>d.remove(),5000);}
/*JUICE*/
// ——— расчёт
function recalc(){M=C.measure(S,CV.alg.G,caches.alg);OR=C.run(CV.ord.G,C.sourcesOf(S),caches.ord);}
const results=()=>cur==='alg'?M.R:OR;
function changed(){recalc();render();panel();checkOrder();save();}
const node=id=>G().nodes.find(n=>n.id===id);
const nel=id=>$(`.node[data-id="${id}"]`);
// ——— отмена: блоки и провода; купленная скорость не откатывается
let past={alg:[],ord:[]},dockKey='';
function remember(refund){const l=past[cur];l.push({g:JSON.stringify({nodes:G().nodes,wires:G().wires}),refund:refund||0});if(l.length>60)l.shift();}
function undo(){const l=past[cur],s=l[l.length-1];if(!s)return;if(s.refund>S.money){toast('Не отменить','Деньги за прокачку этого блока уже потрачены.');return;}l.pop();const old=JSON.parse(s.g),now=new Map(G().nodes.map(n=>[n.id,n]));for(const n of old.nodes){const c=now.get(n.id);if(c){n.lv=c.lv;n.spent=c.spent;}}G().nodes=old.nodes;G().wires=old.wires;S.money-=s.refund;caches[cur].clear();note('undo');sound('del');changed();}
// ——— поле
const COLOR={src:'#2b4a9b',join:'#00757a',group:'#7a3ea8',top:'#b0620c',filter:'#9b2b4a',calc:'#2f7d32',out:'#000080'};
const ORDER=['src','join','group','top','filter','calc','out'];
function slotOptions(){return cur==='ord'?['answer']:Q.GOALS[S.goal]&&Q.GOALS[S.goal].fields?['answer','topics','feed']:Q.GOALS.slice(0,S.goal+1).some(g=>g.key==='hit')?['topics','feed','answer']:['topics','answer','feed'];}
function fieldsFor(slot){if(C.SLOTS[slot].fields)return C.SLOTS[slot].fields;if(cur==='ord'){const o=selOrder();return o?Q.orderDef(o).f:null;}const g=Q.GOALS[S.goal];return g&&g.fields||null;}
// новый блок встаёт на свободное место видимой части поля
function freeSpot(){const st=$('#stage').getBoundingClientRect(),v=V(),W=232,H=230,box=G().nodes.map(n=>[n.x,n.y,(nel(n.id)||{}).offsetHeight||H]),free=(x,y)=>box.every(([a,b,h])=>x+W+24<=a||x>=a+W+24||y+H<=b||y>=b+h+14);
 const x0=(24-v.x)/v.z,y0=(48-v.y)/v.z,x1=(st.width-v.x)/v.z-W-10,y1=(st.height-70-v.y)/v.z-150;for(let x=x0;x<=Math.max(x0,x1);x+=64)for(let y=y0;y<=Math.max(y0,y1);y+=48)if(free(x,y))return[x,y];
 // на виду места нет: правее всех, и поле сдвигается туда
 const nx=Math.max(...box.map(b=>b[0]))+W+50;v.x=Math.min(v.x,st.width-30-(nx+W)*v.z);return[nx,y0];}
function addNode(type,x,y){remember();if(x===undefined)[x,y]=freeSpot();
 const p={};if(type==='out'){const o=slotOptions(),used=new Set(G().nodes.filter(n=>n.type==='out').map(n=>n.p.slot));p.slot=o.find(s=>!used.has(s))||o[0];p.map={};}if(type==='top')p.n=1;
 const n={id:'n'+(G().seq++),type,x:Math.round(x),y:Math.round(y),lv:0,p};G().nodes.push(n);sel=n.id;sound('add');note('add',type);changed();return n;}
function delNode(id){const n=node(id);remember(n.spent||0);if(n.spent){S.money+=n.spent;toast('Деньги вернулись','+'+num(n.spent)+' ₽ за скорость блока');}G().nodes=G().nodes.filter(m=>m!==n);G().wires=G().wires.filter(w=>w[0]!==id&&w[1]!==id);if(sel===id)sel=null;sound('del');note('del');changed();}
function join(from,to,port){remember();if(!C.connect(G(),from,to,port)){past[cur].pop();toast('Не соединяется','Получился бы круг.');return false;}sound('wire');note('wire');sel=to;changed();return true;}
const opt=(list,v,empty)=>(empty!==undefined?`<option value="">${empty}</option>`:'')+list.map(o=>{const[k,t]=Array.isArray(o)?o:[o,o];return`<option value="${esc(k)}"${String(v??'')===String(k)?' selected':''}>${esc(t)}</option>`;}).join('')+(v!==undefined&&v!==''&&v!==null&&!list.some(o=>String(Array.isArray(o)?o[0]:o)===String(v))?`<option value="${esc(v)}" selected>${esc(v)} — нет такого</option>`:'');
const pick=(label,key,list,v,empty)=>`<label><span>${label}</span><select data-set="${key}">${opt(list,v,empty)}</select></label>`;
const input=(label,key,v,ph)=>`<label><span>${label}</span><input data-set="${key}" value="${esc(v??'')}" placeholder="${ph||''}" autocomplete="off"></label>`;
function body(n,r){const p=n.p,ins=(r&&r.inputs)||[],A=ins[0],cols=A?A.cols:[];
 const wait='<p class="dim">Подключи таблицу — появятся настройки.</p>';
 if(n.type==='src'){const names=Object.keys(C.sourcesOf(S)).filter(k=>k!=='key'&&available(k));return pick('записи','table',names,p.table,'выбери…');}
 if(n.type==='join'){const B=ins[1];if(!A||!B)return wait;const sh=A.cols.filter(c=>B.cols.includes(c));return sh.length?pick('по столбцу','on1',sh,p.on1||sh[0])+(sh.length>1?pick('и ещё по','on2',sh,p.on2,'—'):''):'<p class="dim">Нет столбцов с одинаковыми названиями.</p>';}
 if(!A)return wait;
 if(n.type==='group')return pick('одинаковые по','by1',cols,p.by1,'выбери…')+pick('и по','by2',cols,p.by2,'—')+pick('посчитать','agg',Object.entries(C.AGG),p.agg||'count')+((p.agg||'count')!=='count'?pick('столбец','col',cols,p.col,'выбери…'):'')+pick('назвать','name',C.NAMES,p.name,'само');
 if(n.type==='top')return input('сколько N','n',p.n??1)+pick('в каждой группе','per',cols,p.per,'— по всей таблице')+pick('по столбцу','sort',cols,p.sort,'выбери…')+pick('что лучше','dir',[['desc','самые большие'],['asc','самые малые']],p.dir||'desc');
 if(n.type==='filter')return pick('столбец','col',cols,p.col,'выбери…')+pick('условие','op',Object.keys(C.CMP),p.op||'≥')+pick('сравнить с','col2',cols,p.col2,'числом или словом')+(p.col2?'':input('значение','val',p.val,'например 0,5'));
 if(n.type==='calc')return pick('столбец','a',cols,p.a,'выбери…')+pick('действие','op',Object.keys(C.CALC),p.op||'÷')+pick('с чем','b',[...cols,['#','числом']],p.b,'выбери…')+(p.b==='#'?input('число','num',p.num):'')+pick('назвать','name',C.NAMES,p.name||'доля');
 if(n.type==='out'){const slot=p.slot,f=slot&&fieldsFor(slot);let h=pick('отдать как','slot',slotOptions().map(s=>[s,C.SLOTS[s].title]),slot,'выбери…');
  if(slot==='answer'&&!f)return h+`<p class="dim">${cur==='ord'?'Выбери заказ справа.':'Сейчас задание не ждёт ответа.'}</p>`;
  if(f)h+=f.map(k=>pick(k+' ←','map:'+k,cols,(p.map||{})[k],cols.includes(k)?'сам: '+k:'выбери…')).join('');return h;}
 return'';}
function available(table){const g=S.goal;if(table==='Разметка')return g>=2;if(table==='Просмотры'||table==='Кандидаты')return g>=7||cur==='ord'&&g>=2;if(table==='Посты')return g>=2;return true;}
function render(){const w=$('#world');$$('.node',w).forEach(e=>e.remove());const R=results();
 for(const n of G().nodes){const r=R[n.id],el=document.createElement('div');el.className='node'+(sel===n.id?' sel':'');el.dataset.id=n.id;el.dataset.kind=n.type;el.style.cssText=`left:${n.x}px;top:${n.y}px;--c:${COLOR[n.type]}`;
  const ins=C.insOf(n);el.innerHTML=`<header><b>${C.BLOCKS[n.type].title}</b><button data-act="help" title="Что делает">?</button><button data-act="del" title="Убрать">×</button></header>`+
  `<div class="ports">${ins.map(([k,t])=>`<div class="port in" data-port="${k}" data-dir="in"><b></b>${t}</div>`).join('')}${n.type!=='out'?'<div class="port out" data-port="out" data-dir="out">что вышло<b></b></div>':''}</div>`+
  `<div class="cfg">${body(n,r)}</div><div class="live${r&&r.err?' warn':''}">${r&&r.table?'строк: '+num(r.table.rows.length):esc(r&&r.err||'')}</div>`+(n.type!=='src'&&cur==='alg'?'<div class="spd"><span></span><button data-act="up"></button></div>':'');w.append(el);}
 $$('#tabs [data-cv]').forEach(b=>{b.classList.toggle('on',b.dataset.cv===cur);b.hidden=b.dataset.cv==='ord'&&S.goal<2;});
 $('#empty').style.display=G().nodes.length?'none':'block';$('#empty').innerHTML=cur==='alg'?'<b>Поле пустое</b><br>Блоки внизу. Провод: нажми на кружок «что вышло», потом на кружок входа (или протяни).':'<b>Черновик для заказов</b><br>Здесь можно считать что угодно. Выбери заказ справа и отдай расчёт в «Результат» → «Ответ».';
 const un=Q.unlocked(S);const dk=ORDER.filter(t=>un.has(t)).map(t=>`<button data-add="${t}" style="--c:${COLOR[t]}" title="${esc(C.BLOCKS[t].help)}">${C.BLOCKS[t].title}</button>`).join('');if(dk!==dockKey){dockKey=dk;$('#dock').innerHTML=dk;}
 $('#b-undo').disabled=!past[cur].length;applyView();live();drawWires();table();if(armed)arm(node(armed.id)?armed:null);guide();}
function live(){if(cur!=='alg')return;for(const n of G().nodes){const el=nel(n.id);if(!el)continue;const s=$('.spd span',el);if(!s)continue;const t=M.tm.t[n.id]||0,slow=M.tm.slow===n.id&&M.tm.cycle>3;s.textContent=(slow?'самый долгий · ':'')+'ур. '+(n.lv||0)+' · '+(t<.05?'мгновенно':dec(t)+' с');el.classList.toggle('slow',slow);const b=$('[data-act="up"]',el),c=C.blockPrice(G(),n);b.textContent='▲ скорость · '+num(c)+' ₽';b.disabled=S.money<c;b.classList.toggle('can',S.money>=c);}}
function portPos(id,port,dir){const el=nel(id),b=el&&$(`.port[data-port="${port}"][data-dir="${dir}"] b`,el);if(!b)return null;let x=b.offsetWidth/2,y=b.offsetHeight/2,e=b;while(e&&e!==el){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}const n=node(id);return[n.x+x+el.clientLeft,n.y+y+el.clientTop];}
const curve=(a,b)=>{const k=Math.max(40,Math.abs(b[0]-a[0])*.45);return`M${a[0]} ${a[1]}C${a[0]+k} ${a[1]} ${b[0]-k} ${b[1]} ${b[0]} ${b[1]}`;};
function drawWires(temp){const s=$('#wires');s.textContent='';const mk=(d,cls,i)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class',cls);if(i!==undefined)p.dataset.wire=i;s.append(p);};
 G().wires.forEach((w,i)=>{const a=portPos(w[0],'out','out'),b=portPos(w[1],w[2],'in');if(!a||!b)return;const ok=results()[w[0]]&&results()[w[0]].table;mk(curve(a,b),'hit',i);mk(curve(a,b),ok?'w':'w off');});if(temp)mk(curve(temp[0],temp[1]),'w temp');}
function applyView(){const v=V();$('#world').style.transform=`translate(${v.x}px,${v.y}px) scale(${v.z})`;}
function fit(){if(!G().nodes.length)return;const st=$('#stage').getBoundingClientRect();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const n of G().nodes){const e=nel(n.id);x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x+e.offsetWidth);y1=Math.max(y1,n.y+e.offsetHeight);}const z=Math.max(.1,Math.min(1,(st.width-40)/(x1-x0),(st.height-120)/(y1-y0))),v=V();v.z=z;v.x=(st.width-(x1-x0)*z)/2-x0*z;v.y=(st.height-60-(y1-y0)*z)/2-y0*z+30;applyView();}
// «Разложить»: столбцы по глубине; таблицы встают рядом с тем, кому нужны; порядок в столбце по высоте входов
function tidy(){const g=G(),depth={},d=id=>{if(depth[id]!==undefined)return depth[id];depth[id]=0;return depth[id]=Math.max(0,...g.wires.filter(w=>w[1]===id).map(w=>d(w[0])+1));};g.nodes.forEach(n=>d(n.id));
 for(const n of g.nodes)if(n.type==='src'){const to=g.wires.filter(w=>w[0]===n.id).map(w=>depth[w[1]]);if(to.length)depth[n.id]=Math.min(...to)-1;}
 const cols=[];for(const n of g.nodes)(cols[depth[n.id]]=cols[depth[n.id]]||[]).push(n);const h=n=>nel(n.id).offsetHeight;
 cols.forEach((list,c)=>{if(!list)return;const want=n=>{const from=g.wires.filter(w=>w[1]===n.id).map(w=>node(w[0]));return from.length?from.reduce((a,m)=>a+m.y,0)/from.length:null;};
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
 const wi=e.target.dataset&&e.target.dataset.wire;if(wi!==undefined){remember();G().wires.splice(+wi,1);sound('del');note('unwire');changed();return;}
 const port=e.target.closest('.port');if(port){const ref=refOf(port);e.preventDefault();if(armed&&armed.dir!==ref.dir){const a=armed;arm(null);link(a,ref);return;}arm(ref);drag={kind:'wire',ref,sx:e.clientX,sy:e.clientY};return;}
 const el=e.target.closest('.node');if(el){const n=node(el.dataset.id);if(sel!==n.id){sel=n.id;$$('.node').forEach(x=>x.classList.toggle('sel',x===el));table();}if(e.target.closest('header'))drag={kind:'node',n,el,x:n.x,y:n.y,sx:e.clientX,sy:e.clientY};return;}
 arm(null);drag={kind:'pan',x:V().x,y:V().y,sx:e.clientX,sy:e.clientY};});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(drag.kind==='pan'){V().x=drag.x+dx;V().y=drag.y+dy;applyView();}else if(drag.kind==='node'){drag.n.x=Math.round(drag.x+dx/V().z);drag.n.y=Math.round(drag.y+dy/V().z);drag.el.style.left=drag.n.x+'px';drag.el.style.top=drag.n.y+'px';drawWires();}else{drag.moved=drag.moved||Math.hypot(dx,dy)>6;if(drag.moved){const a=portPos(drag.ref.id,drag.ref.port,drag.ref.dir),m=toWorld(e);drawWires(drag.ref.dir==='out'?[a,m]:[m,a]);}}});
addEventListener('pointerup',e=>{const d=drag;drag=null;if(!d)return;if(d.kind==='wire'){if(d.moved){const t=document.elementFromPoint(e.clientX,e.clientY),p=t&&t.closest('.port');arm(null);if(p)link(d.ref,refOf(p));drawWires();}}else save();});
$('#stage').addEventListener('wheel',e=>{if(e.target.closest('#dock'))return;e.preventDefault();const r=$('#stage').getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,v=V(),z=Math.max(.1,Math.min(1.5,v.z*(e.deltaY<0?1.1:.9)));v.x=mx-(mx-v.x)*z/v.z;v.y=my-(my-v.y)*z/v.z;v.z=z;applyView();},{passive:false});
$('#world').addEventListener('click',e=>{const el=e.target.closest('.node'),b=e.target.closest('button');if(!el||!b)return;const n=node(el.dataset.id),a=b.dataset.act;
 if(a==='del')delNode(n.id);else if(a==='help')toast(C.BLOCKS[n.type].title,C.BLOCKS[n.type].help);else if(a==='up'&&C.upgrade(S,G(),n)){sound('buy');note('buy','block');recalc();live();hud();panel();save();}});
$('#world').addEventListener('change',e=>{const k=e.target.dataset.set;if(!k)return;const n=node(e.target.closest('.node').dataset.id);remember();const v=e.target.value;
 if(k.startsWith('map:'))n.p.map={...(n.p.map||{}),[k.slice(4)]:v};else if(k==='slot'){n.p.slot=v;n.p.map={};}else n.p[k]=v;
 if(k==='col2'&&!v)delete n.p.col2;sel=n.id;note('set');later();});
// перерисовка после настройки откладывается: иначе уход из поля ввода съедал бы нажатие, которое его вызвало
let down=false;addEventListener('pointerdown',()=>down=true,true);addEventListener('pointerup',()=>down=false,true);addEventListener('pointercancel',()=>down=false,true);
function later(){if(down)addEventListener('pointerup',()=>setTimeout(changed),{once:true,capture:true});else setTimeout(changed);}
$('#dock').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addNode(b.dataset.add);});
$('#zoom').addEventListener('click',e=>{const z=e.target.dataset.z;if(!z)return;if(z==='fit')fit();else if(z==='tidy')tidy();else{V().z=Math.max(.1,Math.min(1.5,V().z*+z));applyView();}save();});
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-cv]');if(!b)return;setCanvas(b.dataset.cv);if(cur==='ord'){tab='orders';panel();}});
function setCanvas(c){cur=c;sel=null;arm(null);render();save();}
// ——— что внутри выбранного блока: таблица
const gridHTML=(t,limit)=>`<table class="d"><tr>${t.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${t.rows.slice(0,limit).map(r=>`<tr>${r.map(v=>`<td${typeof v==='number'?' class="n"':''}>${esc(cell(v))}</td>`).join('')}</tr>`).join('')}</table>`;
let find='';
function table(){const box=$('#peek'),n=sel&&node(sel);box.classList.toggle('on',!!n);if(!n)return;const r=results()[n.id],t=r&&r.table;
 let shown=t;if(t&&find){const f=find.toLowerCase();shown={cols:t.cols,rows:t.rows.filter(x=>x.some(v=>String(cell(v)).toLowerCase()===f))};}
 $('#peek-t').textContent=`${C.BLOCKS[n.type].title}: ${t?num(t.rows.length)+' строк'+(find?`, из них с «${find}»: ${shown.rows.length}`:'')+(shown.rows.length>60?' (показаны первые 60)':''):'пока пусто'}`;
 $('#peek-b').innerHTML=t?gridHTML(shown,60):`<p class="dim">${esc(r&&r.err||'')}</p>`;}
$('#peek-find').addEventListener('input',e=>{find=e.target.value.trim();table();});
$('#peek-x').addEventListener('click',()=>{sel=null;$$('.node.sel').forEach(e=>e.classList.remove('sel'));table();});
$('#peek-dl').addEventListener('click',()=>{const n=sel&&node(sel),t=n&&results()[n.id].table;if(t)addFile({kind:'table',name:'расчёт.csv',cols:t.cols,rows:t.rows.slice(0,500).map(r=>r.map(cell))});});
// ——— обучение в первом задании: что нажать прямо сейчас
function guide(){$$('.glow').forEach(e=>e.classList.remove('glow'));const box=$('#guide');let text='',els=[];
 if(S.goal===0&&page==='work'&&cur==='alg'){const g=G(),srcs=g.nodes.filter(n=>n.type==='src'),has=name=>srcs.find(n=>n.p.table===name),j=g.nodes.find(n=>n.type==='join'),o=g.nodes.find(n=>n.type==='out'),q=(n,s)=>n&&nel(n.id)&&$(s,nel(n.id));
  const A=has('Слова постов'),B=has('Начальный словарь'),empty=srcs.find(n=>!n.p.table),wired=(f,t)=>g.wires.some(w=>w[0]===f.id&&w[1]===t.id);
  if(empty){text=`Выбери в блоке «Таблица» записи «${A?'Начальный словарь':'Слова постов'}».`;els=[q(empty,'select')];}
  else if(!A||!B){text=`Шаг ${A?2:1}: нажми внизу «Таблица»${A?' ещё раз':''}.`;els=[$('#dock [data-add="src"]')];}
  else if(!j){text='Шаг 3: возьми «Склеить».';els=[$('#dock [data-add="join"]')];}
  else if(!wired(A,j)||!wired(B,j)){const x=!wired(A,j)?A:B;text=`Шаг 4: соедини «${x.p.table}» со входом «Склеить»: нажми кружок «что вышло», потом кружок входа.`;els=[q(x,'.port.out b'),...(nel(j.id)?$$('.port.in b',nel(j.id)):[])];}
  else if(!o){text='Шаг 5: возьми «Результат».';els=[$('#dock [data-add="out"]')];}
  else if(!wired(j,o)){text='Шаг 6: соедини «Склеить» с «Результатом».';els=[q(j,'.port.out b'),q(o,'.port.in b')];}
  else text='Готово! Нажми на любой блок: внизу видно, что у него внутри.';}
 els.forEach(e=>e&&e.classList.add('glow'));box.textContent=text;box.classList.toggle('on',!!text);}
// ——— верхняя строка
const MILES=[1e4,5e4,1e5,2.5e5,5e5,1e6,2.5e6,4.99e6];
function hud(){$('#v-users').textContent=num(S.users);const m=MILES[S.mile||0];$('#v-mile').textContent=m?'рубеж: '+num(m>4.98e6?5e6:m):'цель достигнута';
 $('#v-money').textContent=num(S.money)+' ₽';$('#v-income').textContent='+'+(S.income<100?dec(S.income):num(S.income))+' ₽/с';
 $('#v-acc').textContent=pc(S.acc);$('#v-hit').textContent=S.goal>=9?pc(S.hit):'—';$('#v-watch').textContent='в сети '+Math.round(S.watch)+' с';
 $('#v-cycle').textContent=dec(S.cycle)+' с';const fr=C.freshness(S.cycle);$('#v-fresh').textContent=fr>.995?'лента свежая':'лента отстаёт: −'+Math.round((1-fr)*100)+'% времени в сети';$('#v-fresh').parentNode.classList.toggle('bad',fr<.8);}
// ——— правая колонка
const selOrder=()=>S.orders.find(o=>o.id===S.sel);
function goalHTML(){const g=Q.GOALS[S.goal];if(!g){const m=MILES[S.mile||0];return`<h2>Обе главы пройдены</h2><p>Дальше: растить сеть до 5 000 000, брать заказы и ускорять расчёт.</p>${m?`<div class="bar"><u style="width:${Math.min(100,100*S.users/m)}%"></u></div><p>Следующий рубеж: ${num(m)} людей.</p>`:'<p><b>5 000 000 есть.</b></p>'}`;}
 const st=g.check(S,CV.alg.G,M.R),h=hints[g.id]||0;
 return`<small>Глава ${g.ch}. ${g.ch===1?'О чём пост':'Что любит человек'} · задание ${S.goal+1} из ${Q.GOALS.length}</small><h2>${g.title}</h2><p>${g.text}</p>`+
 (g.fields?`<p class="need">Нужны столбцы: ${g.fields.map(f=>'<b>'+f+'</b>').join(' ')}</p>`:'')+
 `<div class="state${st.done?' ok':''}">${esc(st.text)}</div><div class="bar"><u style="width:${Math.round(100*(st.k||0))}%"></u></div><p class="dim">Награда ${num(g.reward)} ₽.</p>`+
 g.hints.slice(0,h).map((t,i)=>`<div class="advice">Подсказка ${i+1}: ${t}</div>`).join('')+(h<g.hints.length?`<button data-hint>💡 Подсказка (${h+1} из ${g.hints.length})</button>`:'')+
 (g.key==='acc'?' <button data-debug="topics">🔍 Где ошибки</button>':g.key==='hit'?' <button data-debug="feed">🔍 Что в ленте</button>':'');}
function ordersHTML(){if(!Q.tierOpen(S))return'<p>Заказы откроются после второго задания.</p>';
 return`<p class="dim">Заказы не кончаются. За каждый платят, а доход растёт на 3% навсегда. Сделано: <b>${S.done}</b>.</p>`+S.orders.map(o=>{const on=S.sel===o.id;let st=null;if(on)st=Q.orderCheck(S,o,CV.ord.G,OR);return`<div class="ord${on?' on':''}" data-oid="${o.id}"><small>${'★'.repeat(o.tier)} · ${num(Q.orderReward(S,o))} ₽</small><p>${esc(Q.orderText(o))}</p><p class="need">Столбцы: ${Q.orderDef(o).f.map(f=>'<b>'+f+'</b>').join(' ')}</p>${st?`<div class="state">${esc(st.text)}</div>`:''}<button data-take="${o.id}">${on?'Решаю этот':'Решать'}</button> <button data-drop="${o.id}">Заменить</button></div>`;}).join('');}
function shopHTML(){return Object.entries(C.SHOP).map(([k,it])=>{const l=S.lv[k],max=l>=it.max||(k==='reach'&&C.capUsers(S)>=5e6),c=max?0:it.price(l),wait=!max&&S.money<c?Math.ceil((c-S.money)/S.income):0;return`<div class="srv"><div><b>${it.title}</b> · ур. ${l}<small>${it.help} Сейчас: ${it.now(l)}.${wait?' Накопится через '+(wait<90?wait+' с':wait<5400?Math.round(wait/60)+' мин':'много часов')+'.':''}</small></div><button data-buy="${k}" ${max||S.money<c?'disabled':''}>${max?'максимум':num(c)+' ₽'}</button></div>`;}).join('')+'<p class="dim">Скорость каждого блока покупается кнопкой на самом блоке.</p>';}
let panelKey='';
function panel(){$$('#ptabs [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
 const can=Object.entries(C.SHOP).some(([k,it])=>S.lv[k]<it.max&&S.money>=it.price(S.lv[k])&&!(k==='reach'&&C.capUsers(S)>=5e6));$('#ptabs [data-tab="shop"]').classList.toggle('can',can);
 const h=tab==='goal'?goalHTML():tab==='orders'?ordersHTML():shopHTML();if(h!==panelKey){panelKey=h;const b=$('#pbody'),y=b.scrollTop;b.innerHTML=h;b.scrollTop=y;}hud();}
$('#ptabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;tab=b.dataset.tab;panel();if(tab==='orders'&&Q.tierOpen(S))setCanvas('ord');else if(tab==='goal')setCanvas('alg');save();});
$('#pbody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset,g=Q.GOALS[S.goal];
 if('hint'in d){hints[g.id]=(hints[g.id]||0)+1;note('hint');}else if(d.debug)return debug(d.debug);
 else if(d.take){S.sel=+d.take;setCanvas('ord');note('order-take');}else if(d.drop){const o=S.orders.find(o=>o.id===+d.drop);if(o){Q.skipOrder(S,o);note('order-drop');render();}}
 else if(d.buy&&C.buy(S,d.buy)){sound('buy');note('buy',d.buy);recalc();render();}
 panel();checkOrder();save();});
// ——— разбор ошибок
function debug(kind){let h='';if(kind==='topics'){const w=M.ts.wrong.slice(0,12);h=`<p>Постов без темы: <b>${M.ts.none}</b>, с несколькими темами: <b>${M.ts.multi}</b>. Модератор проверил вручную несколько ошибок:</p><table class="d"><tr><th>пост</th><th>слова</th><th>у тебя</th><th>на самом деле</th></tr>${w.map(({post,got})=>`<tr><td>${post.id}</td><td>${esc(post.words.join(' '))}</td><td>${got===undefined?'—':got===null?'несколько':got}</td><td>${C.TN[post.topic]}</td></tr>`).join('')}</table><p class="dim">Номер поста можно вписать в поиск внизу, под таблицей блока, и проследить его по схеме.</p>`;}
 else{const W=C.world(S.seed),P=W.people[who],l=M.fs.feeds[P.name]||[],th=M.ts.got;h=`<p><button data-step="-1">◀</button> <b>${P.name}</b> <button data-step="1">▶</button></p>${l.length?`<table class="d"><tr><th>пост</th><th>тема у тебя</th><th>автор</th><th>длинный</th><th>твоя оценка</th><th>досмотрит на самом деле</th></tr>${l.map(x=>`<tr><td>${x.post.id}</td><td>${th.get(x.post.id)||'—'}</td><td>${esc(W.authors[x.post.author].name)}</td><td>${x.post.long?'да':'нет'}</td><td class="n">${cell(x.score)}</td><td class="n">${pc(x.real)}</td></tr>`).join('')}</table>`:'<p>Схема ничего не дала этому человеку: идут случайные посты.</p>'}<p class="dim">Хорошая лента досматривается в среднем на ${pc(C.base(W).best)}, случайная на ${pc(C.base(W).rnd)}. У тебя в среднем ${pc(M.fs.share)}.</p>`;}
 $('#dbg-b').innerHTML=h;$('#v-dbg').classList.add('on');note('debug',kind);}
$('#v-dbg').addEventListener('click',e=>{const s=e.target.closest('[data-step]');if(s){who=(who+ +s.dataset.step+C.NP)%C.NP;debug('feed');return;}if(e.target.id==='dbg-x'||e.target.id==='v-dbg')$('#v-dbg').classList.remove('on');});
// ——— победы
function checkOrder(){const o=selOrder();if(!o)return;const st=Q.orderCheck(S,o,CV.ord.G,OR);if(!st.done)return;const text=Q.orderText(o),r=Q.completeOrder(S,o);S.sel=null;celebrate('Заказ выполнен','+'+num(r)+' ₽');toast('Заказ выполнен',text);note('order-done',o.k);render();panel();save();}
function second(){M.tm=C.timing(CV.alg.G,M.R,S);S.cycle=M.tm.cycle;C.step(S);const g=Q.tick(S,CV.alg.G,M.R);if(g){const i=S.goal-1;celebrate('Готово: '+g.title,'+'+num(g.reward)+' ₽');note('quest',i);const nx=Q.GOALS[S.goal],nu=nx&&nx.unlock;if(nu&&i>0)toast('Новые блоки',nu.map(t=>C.BLOCKS[t].title).join(', '));if(S.goal===2)toast('Открылись заказы','Вкладка «Заказы» справа. Это постоянный заработок.');if(S.goal===7)toast('Глава 2','Появились записи «Просмотры» и «Кандидаты».');askRate(i);recalc();render();save();}
 const k=S.mile||0;if(k<MILES.length&&S.users>=MILES[k]){const r=Math.round(S.income*90);S.money+=r;S.mile=k+1;sound('mile');toast('Рубеж: '+num(k===MILES.length-1?5e6:MILES[k])+' людей','+'+num(r)+' ₽');}}
/*PAGES*/
// ——— что весело, а что нет
let rateFor=0;
function askRate(i){rateFor=i;$('#rate-t').textContent=`«${Q.GOALS[i].title}»: как было?`;$('#rate').classList.add('on');}
$('#rate').addEventListener('click',e=>{const b=e.target.closest('[data-rate]');if(!b)return;if(b.dataset.rate)note('rate',[rateFor,b.dataset.rate]);$('#rate').classList.remove('on');save();});
$('#moods').addEventListener('click',e=>{const m=e.target.closest('[data-mood]');if(!m)return;note('mood',m.dataset.mood);toast('Записано',m.dataset.mood==='bored'?'Здесь скучно':'Здесь непонятно');save();});
function report(){$('#rep-text').value=Fun.text(F,Q.GOALS);}
$('#m-report').onclick=()=>{$('#v-menu').classList.remove('on');report();$('#v-report').classList.add('on');paused=true;};
$('#rep-close').onclick=()=>{$('#v-report').classList.remove('on');menu(false);};
$('#rep-copy').onclick=async()=>{const t=$('#rep-text');let ok=false;try{await navigator.clipboard.writeText(t.value);ok=true;}catch(e){t.select();try{ok=document.execCommand('copy');}catch(x){}}$('#rep-copy').textContent=ok?'Скопировано':'Выдели текст и нажми Ctrl+C';};
// ——— меню, клавиши, время
let again=0;function menu(on){paused=on;$('#v-menu').classList.toggle('on',on);again=0;$('#m-new').textContent='Начать заново';if(on)save();}
$('#b-menu').onclick=()=>menu(true);$('#m-go').onclick=()=>menu(false);
$('#m-new').onclick=()=>{if(!again){again=1;$('#m-new').textContent='Точно? Всё сотрётся';return;}fresh();boot();menu(false);};
const muteText=()=>$('#m-sound').textContent=muted?'🔇 Звук выключен':'🔊 Звук включён';
$('#m-sound').onclick=()=>{muted=!muted;try{localStorage.setItem('lentaos95-mute',muted?'1':'0');}catch(e){}muteText();sound('buy');};muteText();
$('#b-undo').onclick=undo;
addEventListener('keydown',e=>{const typing=e.target.closest&&e.target.closest('input,textarea,select');
 if(e.key==='Escape'){if(armed){arm(null);return;}if($('#v-dbg').classList.contains('on')){$('#v-dbg').classList.remove('on');return;}if($('#v-report').classList.contains('on')){$('#rep-close').click();return;}menu(!paused);return;}
 if(typing)return;if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'){e.preventDefault();undo();}else if(e.key==='Delete'&&sel&&node(sel))delNode(sel);});
let speedX=1;$('#b-speed').onclick=()=>{speedX=speedX===1?5:speedX===5?20:1;note('speed',speedX);$('#b-speed').innerHTML=`▶ ×${speedX}<br><small>тест</small>`;};
let acc=0,prev=performance.now(),saveAt=0;
function pulse(){live();if(!(document.activeElement&&/^(SELECT|INPUT)$/.test(document.activeElement.tagName))){panel();}else hud();}
setInterval(()=>{const now=performance.now(),dt=Math.min(1,(now-prev)/1000);prev=now;if(paused||hidden){acc=0;return;}F.sec+=dt;acc+=dt*speedX;let k=0;while(acc>=1&&k<20){second();acc--;k++;}if(k){pulse();if(now-saveAt>5000){saveAt=now;save();}}},200);
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;prev=performance.now();if(hidden)save();});addEventListener('pagehide',save);
function boot(){past={alg:[],ord:[]};caches.alg.clear();caches.ord.clear();panelKey='';find='';$('#peek-find').value='';recalc();go('work');render();panel();}
if(HOST)document.body.classList.add('embedded');if(!load())fresh();F.sessions++;note('session');boot();
window.__game={go,save,core:C,goals:Q,get S(){return S;},get CV(){return CV;},get M(){return M;},recalc:changed,setCanvas,tidy,fit,run:n=>{for(let i=0;i<n;i++)second();live();panel();checkOrder();},
 // для тестов: поставить готовую схему на поле
 put(c,graph){CV[c].G=JSON.parse(JSON.stringify(graph));CV[c].G.seq=1000;caches[c].clear();cur=c;changed();tidy();}};
})();
