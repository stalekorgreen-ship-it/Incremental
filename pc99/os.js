(function(root){
const $=(s,e=document)=>e.querySelector(s),el=(tag,cls,html)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(html!==undefined)d.innerHTML=html;return d;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='lentaos99-pc-1';
// ——— значки (свои, нарисованы кодом)
const P=(d,f,s)=>`<path d="${d}" fill="${f||'none'}" stroke="${s||'#111'}" stroke-width="1.4" stroke-linejoin="round"/>`;
const svg=b=>`<svg viewBox="0 0 32 32">${b}</svg>`;
const IC={
 folder:svg(P('M3 8h9l3 3h14v17H3z','#e8b93a')+P('M3 13h26v15H3z','#ffd968')),
 text:svg(P('M7 3h13l6 6v20H7z','#fff')+P('M11 12h11M11 16h11M11 20h11M11 24h7','none','#446')),
 image:svg(P('M4 6h24v20H4z','#fff')+P('M6 24l7-9 5 6 4-4 4 7z','#3a8f55')+'<circle cx="22" cy="12" r="3" fill="#f4c21f"/>'),
 table:svg(P('M5 4h22v24H5z','#fff')+P('M5 10h22M5 16h22M5 22h22M13 4v24M20 4v24','none','#2a7a46')),
 pc:svg(P('M5 5h22v16H5z','#cfd3d7')+P('M8 8h16v10H8z','#2c7bc4')+P('M11 25h10v3H11zM14 21h4v4h-4z','#b5b9bd')),
 bin:svg(P('M8 10h16l-2 19H10z','#cfd8dc')+P('M6 7h20v3H6zM13 4h6v3h-6z','#9aa7ad')+P('M13 14v11M19 14v11')),
 web:svg('<circle cx="16" cy="16" r="13" fill="#3c8fd6" stroke="#123" stroke-width="1.4"/>'+P('M3 16h26M16 3c-9 8-9 18 0 26M16 3c9 8 9 18 0 26','none','#e8f4ff')),
 mine:svg('<circle cx="16" cy="17" r="8" fill="#222"/>'+P('M16 5v24M4 17h24M8 9l16 16M24 9L8 25','none','#222')+'<circle cx="13" cy="14" r="2" fill="#fff"/>'),
 cards:svg(P('M5 7l13-3 4 20-13 3z','#fff')+P('M13 6h14v22H13z','#fff')+P('M20 11c4 4 6 6 3 8-1 1-2 0-3-1 -1 1-2 2-3 1-3-2-1-4 3-8z','#c0141c','#c0141c')),
 snake:svg(P('M5 24h8v-8h8V8h6','none','#2a8a2a').replace('1.4','5')+'<circle cx="27" cy="8" r="3.5" fill="#1d6a1d"/>'),
 paint:svg('<ellipse cx="15" cy="17" rx="12" ry="10" fill="#e7d3b0" stroke="#432"/><circle cx="10" cy="14" r="2.5" fill="#d33"/><circle cx="17" cy="11" r="2.5" fill="#26c"/><circle cx="21" cy="18" r="2.5" fill="#2a8"/>'+P('M20 28L30 6','none','#753').replace('1.4','3')),
 calc:svg(P('M7 3h18v26H7z','#9aa3ab')+P('M10 6h12v6H10z','#cfe8c0')+P('M10 16h3v3h-3zM15 16h3v3h-3zM20 16h3v3h-3zM10 22h3v3h-3zM15 22h3v3h-3zM20 22h3v3h-3z','#fff')),
 feed:svg(P('M4 4h24v24H4z','#c4427f')+P('M9 10h14M9 16h14M9 22h9','none','#fff')),
 flow:svg(P('M3 5h10v8H3zM19 19h10v8H19z','#7fc3ff')+P('M13 9c8 0 0 14 6 14','none','#6a2ac0')),
 help:svg('<circle cx="16" cy="16" r="13" fill="#ffd968" stroke="#432" stroke-width="1.4"/><text x="16" y="22" text-anchor="middle" font-size="18" font-weight="700">?</text>'),
 info:svg('<circle cx="16" cy="16" r="13" fill="#2c7bc4"/><text x="16" y="23" text-anchor="middle" font-size="19" font-weight="700" fill="#fff">i</text>'),
 power:svg('<circle cx="16" cy="17" r="11" fill="#c33"/>'+P('M16 6v12','none','#fff').replace('1.4','3'))};
// ——— диск
let D,seq;const SPECIAL={desk:'Рабочий стол',docs:'Мои документы',down:'Загрузки',pics:'Мои рисунки',bin:'Корзина'};
function defaults(){seq=1;D={items:[],settings:{wall:0},browser:{url:'home://start'},guest:{},scores:{}};for(const id in SPECIAL)D.items.push({id,name:SPECIAL[id],type:'folder',parent:id==='desk'||id==='bin'?null:id==='pics'?'docs':'root',sys:true});
 const add=(o,x,y)=>D.items.push({id:'i'+(seq++),parent:'desk',x,y,...o});
 let y=8;const col=(x,list)=>{y=8;for(const o of list){add(o,x,y);y+=76;}};
 col(8,[{type:'app',app:'computer',name:'Мой компьютер'},{type:'app',app:'browser',name:'Интернет'},{type:'link',target:'docs',name:'Мои документы'},{type:'link',target:'down',name:'Загрузки'},{type:'link',target:'bin',name:'Корзина'}]);
 col(100,[{type:'web',url:'lenta.net/constructor',name:'Конструктор'},{type:'web',url:'lenta.net/feed',name:'ЛентаОС'},{type:'app',app:'mines',name:'Сапёр'},{type:'app',app:'cards',name:'Косынка'},{type:'app',app:'snake',name:'Змейка'}]);
 D.items.push({id:'i'+(seq++),parent:'docs',type:'text',name:'прочти меня.txt',data:'Это твой компьютер.\n\nПравая кнопка мыши на столе или в папке: создать папку или текстовый файл.\nЗначки можно перетаскивать, в том числе в папки и в корзину.\nСайт соцсети и конструктор лежат в закладках браузера.'});}
function save(){try{localStorage.setItem(KEY,JSON.stringify({D,seq}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.D){D=d.D;seq=d.seq;return;}}catch(e){}defaults();}
const item=id=>D.items.find(i=>i.id===id),kids=id=>D.items.filter(i=>i.parent===id);
const inside=(a,b)=>{for(let x=item(a);x;x=item(x.parent))if(x.id===b)return true;return false;};
function unique(name,parent,skip){const m=name.match(/^(.*?)(\.[^.]+)?$/);let n=name,i=2;while(kids(parent).some(k=>k.name===n&&k!==skip))n=`${m[1]} (${i++})${m[2]||''}`;return n;}
function freeSpot(){const used=kids('desk');for(let x=8;x<1200;x+=86)for(let y=8;y<innerHeight-110;y+=76)if(!used.some(i=>Math.abs(i.x-x)<60&&Math.abs(i.y-y)<60))return{x,y};return{x:300,y:200};}
function create(o,parent){const it={id:'i'+(seq++),...o,parent};it.name=unique(it.name,parent);if(parent==='desk'&&it.x===undefined)Object.assign(it,freeSpot());D.items.push(it);changed();return it;}
function move(id,parent,x,y){const it=item(id);if(!it||it.sys||parent===id||inside(parent,id))return false;if(it.parent!==parent){if(parent==='bin')it.from=it.parent;it.name=unique(it.name,parent,it);it.parent=parent;}if(parent==='desk'){if(x===undefined)Object.assign(it,freeSpot());else{it.x=Math.max(0,Math.min(innerWidth-80,x));it.y=Math.max(0,Math.min(innerHeight-100,y));}}changed();return true;}
function destroy(id){for(const k of kids(id))destroy(k.id);D.items=D.items.filter(i=>i.id!==id);closeFor(id);}
function remove(id){const it=item(id);if(!it||it.sys)return;if(inside(it.parent,'bin')||it.parent==='bin'){ask('Удалить «'+it.name+'» навсегда?',()=>{destroy(id);changed();});}else move(id,'bin');}
const iconOf=it=>it.type==='folder'?(it.id==='bin'?IC.bin:IC.folder):it.type==='text'?IC.text:it.type==='image'?IC.image:it.type==='table'?IC.table:it.type==='link'?(it.target==='bin'?IC.bin:IC.folder):it.type==='web'?(it.url.includes('constructor')?IC.flow:IC.feed):(APPS[it.app]||{}).icon||IC.pc;
// ——— окна
const wins=[];let z=10,active=null;
function open({key,title,icon,w=460,h=320,max=false,build,onclose}){if(key){const old=wins.find(x=>x.key===key);if(old){old.el.classList.remove('min');focus(old);return old;}}
 const W=innerWidth,H=innerHeight-30,n=wins.length%7,d=el('div','win');w=Math.min(w,W-10);h=Math.min(h,H-10);
 d.style.cssText=`left:${Math.max(4,Math.min(W-w-4,190+n*30))}px;top:${Math.max(4,Math.min(H-h-4,30+n*28))}px;width:${w}px;height:${h}px`;
 d.innerHTML=`<div class="tb">${icon||IC.pc}<span></span><button data-w="min" title="Свернуть">_</button><button data-w="max" title="Развернуть">□</button><button data-w="close" title="Закрыть">×</button></div><div class="cont"></div><div class="grip"></div>`;
 const win={key,el:d,cont:$('.cont',d),icon:icon||IC.pc,onclose,clean:[],setTitle(t){win.title=t;$('.tb span',d).textContent=t;tasks();},close(){if(win.onclose&&win.onclose()===false)return;win.clean.forEach(f=>f());d.remove();wins.splice(wins.indexOf(win),1);if(active===win){active=null;const t=top();if(t)focus(t);}tasks();}};
 d.addEventListener('pointerdown',()=>focus(win),true);
 d.addEventListener('click',e=>{const a=e.target.dataset.w;if(!a)return;if(a==='close')win.close();else if(a==='min'){d.classList.add('min');active=null;const t=top();if(t)focus(t);tasks();}else toggleMax(win);});
 $('.tb',d).addEventListener('dblclick',e=>{if(!e.target.dataset.w)toggleMax(win);});
 dragger($('.tb',d),e=>{if(e.target.tagName==='BUTTON'||d.classList.contains('max'))return null;const x=d.offsetLeft,y=d.offsetTop;return(dx,dy)=>{d.style.left=Math.max(-w+60,Math.min(innerWidth-60,x+dx))+'px';d.style.top=Math.max(0,Math.min(innerHeight-60,y+dy))+'px';};});
 dragger($('.grip',d),()=>{const a=d.offsetWidth,b=d.offsetHeight;return(dx,dy)=>{d.style.width=Math.max(200,a+dx)+'px';d.style.height=Math.max(100,b+dy)+'px';};});
 $('#desk').append(d);wins.push(win);win.setTitle(title);build(win.cont,win);if(max)toggleMax(win);focus(win);return win;}
function dragger(handle,begin){handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;const mv=begin(e);if(!mv)return;const sx=e.clientX,sy=e.clientY;document.body.classList.add('dragging');const m=ev=>mv(ev.clientX-sx,ev.clientY-sy),u=()=>{removeEventListener('pointermove',m);removeEventListener('pointerup',u);document.body.classList.remove('dragging');};addEventListener('pointermove',m);addEventListener('pointerup',u);});}
function toggleMax(w){const d=w.el;if(d.classList.contains('max')){d.classList.remove('max');d.style.cssText=w.prev;}else{w.prev=d.style.cssText;d.classList.add('max');Object.assign(d.style,{left:0,top:0,width:'100%',height:'100%'});}d.style.zIndex=++z;}
const top=()=>wins.filter(w=>!w.el.classList.contains('min')).sort((a,b)=>b.el.style.zIndex-a.el.style.zIndex)[0];
function focus(w){if(active===w)return;active=w;w.el.style.zIndex=++z;wins.forEach(x=>x.el.classList.toggle('act',x===w));tasks();}
function tasks(){const t=$('#tasks');if(!t)return;t.innerHTML='';for(const w of wins){const b=el('button',w===active?'down':'',esc(w.title||''));b.onclick=()=>{if(w===active){w.el.classList.add('min');active=null;const n=top();if(n)focus(n);}else{w.el.classList.remove('min');active=null;focus(w);}tasks();};t.append(b);}}
function dialog(title,html,buttons){return open({title,icon:IC.info,w:340,h:150,build(c,w){c.innerHTML=`<div class="dlgbody">${html}<div class="row">${buttons.map((b,i)=>`<button data-b="${i}">${b[0]}</button>`).join('')}</div></div>`;c.addEventListener('click',e=>{const i=e.target.dataset.b;if(i===undefined)return;const f=buttons[i][1];const v=$('input',c);w.close();if(f)f(v&&v.value);});const v=$('input',c);if(v){setTimeout(()=>{v.focus();v.select();});v.addEventListener('keydown',e=>{if(e.key==='Enter')$('[data-b="0"]',c).click();});}}});}
const ask=(q,yes)=>dialog('Подтверждение',`<p>${esc(q)}</p>`,[['Да',yes],['Нет']]);
const prompt_=(q,val,ok)=>dialog(q,`<input value="${esc(val)}">`,[['ОК',v=>{v=(v||'').trim().slice(0,60);if(v)ok(v);}],['Отмена']]);
// ——— меню
let menus=[];function closeMenus(){menus.forEach(m=>m.remove());menus=[];}
function menu(list,x,y,cls){const m=el('div','menu '+(cls||''));for(const it of list){if(!it){m.append(el('hr'));continue;}const b=el('button','',`${it[2]||''}<span>${esc(it[0])}</span>${Array.isArray(it[1])?'<span class="sub">▸</span>':''}`);if(Array.isArray(it[1])){const show=()=>{while(menus.length&&menus[menus.length-1]!==m)menus.pop().remove();const r=b.getBoundingClientRect();menu(it[1],r.right,r.top-3);};b.onmouseenter=show;b.onclick=e=>{e.stopPropagation();show();};}else{b.onmouseenter=()=>{while(menus.length&&menus[menus.length-1]!==m)menus.pop().remove();};b.onclick=()=>{closeMenus();it[1]();};}m.append(b);}
 document.body.append(m);const r=m.getBoundingClientRect();m.style.left=Math.max(0,Math.min(x,innerWidth-r.width-2))+'px';m.style.top=Math.max(0,Math.min(y,innerHeight-r.height-2))+'px';menus.push(m);return m;}
// ——— файлы и папки
const views=[];
function changed(){save();views.forEach(v=>v());}
function openItem(id){const it=item(id);if(!it)return;
 if(it.type==='folder')explorer(it.id);else if(it.type==='link')explorer(it.target);else if(it.type==='app')launch(it.app);else if(it.type==='web')launch('browser',it.url);
 else if(it.type==='text')launch('notepad',it.id);else if(it.type==='image')viewImage(it);else viewTable(it);}
function itemMenu(it){const bin=it.parent==='bin';return[['Открыть',()=>openItem(it.id)],bin?['Восстановить',()=>move(it.id,item(it.from)?it.from:'desk')]:null,null,it.sys?null:['Переименовать',()=>prompt_('Новое имя',it.name,v=>{it.name=unique(v,it.parent,it);changed();})],it.sys?null:[bin?'Удалить навсегда':'Удалить',()=>remove(it.id)]].filter((x,i,a)=>x!==null||(i&&a[i-1]!==null));}
function spaceMenu(folder,x,y){const make=[['Папку',()=>create({type:'folder',name:'Новая папка',x,y},folder)],['Текстовый файл',()=>create({type:'text',name:'Новый документ.txt',data:'',x,y},folder)]];
 if(folder==='bin')return[['Очистить корзину',()=>ask('Удалить всё из корзины?',()=>{kids('bin').forEach(k=>destroy(k.id));changed();})]];
 return[['Создать',make],folder==='desk'?['Выстроить значки',()=>{const l=kids('desk');l.forEach(i=>{i.x=-999;});for(const i of l)Object.assign(i,freeSpot());changed();}]:null,folder==='desk'?['Сменить фон',()=>{D.settings.wall=(D.settings.wall+1)%WALLS.length;wall();save();}]:null].filter(Boolean);}
const WALLS=['#1f6f73 radial-gradient(circle at 70% 30%,#2b8a8f,#155357)','#2b4a8b linear-gradient(160deg,#35619f,#1a2c57)','#4b5a3a repeating-linear-gradient(45deg,#50603e,#50603e 12px,#475636 12px,#475636 24px)','#000','#7a5c86 radial-gradient(circle at 20% 80%,#a07bad,#4a3556)'];
const wall=()=>$('#desk').style.background=WALLS[D.settings.wall];
let selected=null;
function select(node,id){document.querySelectorAll('.ico.sel').forEach(e=>e.classList.remove('sel'));selected=id;if(node)node.classList.add('sel');}
function iconEl(it){const d=el('div','ico',`${iconOf(it)}<span>${esc(it.name)}</span>`);d.dataset.id=it.id;if(selected===it.id)d.classList.add('sel');
 d.addEventListener('dblclick',()=>openItem(it.id));
 d.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();closeMenus();select(d,it.id);menu(itemMenu(it),e.clientX,e.clientY);});
 d.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.stopPropagation();closeMenus();select(d,it.id);const w=d.closest('.win');if(w){const o=wins.find(x=>x.el===w);if(o)focus(o);}
  const sx=e.clientX,sy=e.clientY,r=d.getBoundingClientRect();let g=null,over=null;
  const target=ev=>{g.style.display='none';const t=document.elementFromPoint(ev.clientX,ev.clientY);g.style.display='';if(!t)return null;const ic=t.closest('.ico');if(ic){const o=item(ic.dataset.id);if(o&&o.id!==it.id){if(o.type==='folder')return{folder:o.id,node:ic};if(o.type==='link')return{folder:o.target,node:ic};}}const f=t.closest('[data-folder]');return f?{folder:f.dataset.folder,node:null,box:f}:null;};
  const m=ev=>{if(!g){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;g=d.cloneNode(true);g.classList.add('ghost');document.body.append(g);document.body.classList.add('dragging');}g.style.left=ev.clientX-(sx-r.left)+'px';g.style.top=ev.clientY-(sy-r.top)+'px';if(over)over.classList.remove('drop');const t=target(ev);over=t&&t.node;if(over)over.classList.add('drop');};
  const u=ev=>{removeEventListener('pointermove',m);removeEventListener('pointerup',u);document.body.classList.remove('dragging');if(!g)return;const t=target(ev);g.remove();if(over)over.classList.remove('drop');if(!t)return;
   if(t.folder==='desk'){const dr=$('#desk').getBoundingClientRect();move(it.id,'desk',ev.clientX-(sx-r.left)-dr.left,ev.clientY-(sy-r.top)-dr.top);}else if(t.folder!==it.parent)move(it.id,t.folder);};
  addEventListener('pointermove',m);addEventListener('pointerup',u);});
 return d;}
function drawDesk(){const box=$('#icons');box.innerHTML='';for(const it of kids('desk')){const d=iconEl(it);d.style.left=Math.min(it.x,innerWidth-80)+'px';d.style.top=Math.min(it.y,innerHeight-100)+'px';if(it.type==='link'&&it.target==='bin'&&kids('bin').length)$('span',d).textContent=it.name+' ('+kids('bin').length+')';box.append(d);}}
const pathOf=id=>{const p=[];for(let x=item(id);x;x=item(x.parent))p.unshift(x.name);return p.join(' › ');};
const closeFor=id=>wins.filter(w=>w.item===id).forEach(w=>{w.onclose=null;w.close();});
function explorer(folder){const special=folder==='computer';open({key:'dir:'+folder,title:special?'Мой компьютер':item(folder).name,icon:special?IC.pc:IC.folder,w:470,h:330,build(c,win){let cur=folder;
 c.innerHTML='<div class="menubar"><button data-up>↑ Вверх</button><button data-new="folder">Новая папка</button><button data-new="text">Новый файл</button></div><div class="sunken"><div class="files"></div></div><div class="status"></div>';const box=$('.files',c);
 const draw=()=>{if(cur!=='computer'&&!item(cur)){cur='computer';}box.innerHTML='';box.dataset.folder=cur==='computer'?'':cur;
  const list=cur==='computer'?['desk','docs','down','bin'].map(item):kids(cur).slice().sort((a,b)=>(b.type==='folder')-(a.type==='folder')||a.name.localeCompare(b.name,'ru'));
  list.forEach(i=>box.append(iconEl(i)));win.setTitle(cur==='computer'?'Мой компьютер':item(cur).name);$('.status',c).textContent=(cur==='computer'?'Мой компьютер':pathOf(cur))+' · объектов: '+list.length;c.querySelectorAll('[data-new]').forEach(b=>b.disabled=cur==='computer'||cur==='bin');};
 box.addEventListener('dblclick',e=>{const ic=e.target.closest('.ico');if(!ic)return;const i=item(ic.dataset.id);if(i.type==='folder'||i.type==='link'){e.stopPropagation();cur=i.type==='link'?i.target:i.id;win.key='dir:'+cur;draw();}},true);
 box.addEventListener('contextmenu',e=>{e.preventDefault();closeMenus();if(cur!=='computer')menu(spaceMenu(cur),e.clientX,e.clientY);});
 c.addEventListener('click',e=>{if('up'in e.target.dataset){const i=item(cur);cur=i&&i.parent&&item(i.parent)?i.parent:'computer';win.key='dir:'+cur;draw();}const n=e.target.dataset.new;if(n)create(n==='folder'?{type:'folder',name:'Новая папка'}:{type:'text',name:'Новый документ.txt',data:''},cur);});
 // обработчик открытия папки внутри этого же окна важнее общего
 box.addEventListener('dblclick',e=>e.stopPropagation());
 views.push(draw);win.clean.push(()=>views.splice(views.indexOf(draw),1));draw();}});}
function viewImage(it){open({key:'img:'+it.id,title:it.name,icon:IC.image,w:520,h:380,build(c,w){w.item=it.id;c.innerHTML='<div class="sunken" style="display:grid;place-items:center;background:#333"></div>';const s=c.firstChild;s.innerHTML=it.png?`<img src="${it.png}" style="max-width:100%">`:it.data;const v=$('svg',s);if(v)v.style.cssText='width:100%;height:100%';}});}
function viewTable(it){open({key:'tab:'+it.id,title:it.name,icon:IC.table,w:640,h:380,build(c,w){w.item=it.id;c.innerHTML=`<div class="sunken"><table class="t"><tr>${it.cols.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>${it.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div><div class="status">строк: ${it.rows.length}</div>`;}});}
// ——— программы
const APPS={};
function app(id,name,icon,run){APPS[id]={name,icon,run};}
function launch(id,arg){APPS[id].run(arg);}
app('computer','Мой компьютер',IC.pc,()=>explorer('computer'));
function startMenu(){if($('#startmenu')){closeMenus();return;}closeMenus();const a=id=>[APPS[id].name,()=>launch(id),APPS[id].icon];
 const web=u=>()=>launch('browser',u);
 const m=menu([['Программы',[a('browser'),a('notepad'),a('paint'),a('calc'),a('computer')],IC.folder],['Игры',[a('mines'),a('cards'),a('snake'),a('fifteen'),a('memory')],IC.folder],['Документы',[['Мои документы',()=>explorer('docs'),IC.folder],['Загрузки',()=>explorer('down'),IC.folder],['Мои рисунки',()=>explorer('pics'),IC.folder]],IC.folder],['Избранное',[['Конструктор',web('lenta.net/constructor'),IC.flow],['ЛентаОС',web('lenta.net/feed'),IC.feed],['Поиск «Нашёл!»',web('nashel.net'),IC.web],['Каталог сайтов',web('katalog.net'),IC.web]],IC.folder],null,['Справка',()=>openItem(D.items.find(i=>i.name==='прочти меня.txt')?.id)||0,IC.help],['О компьютере',()=>dialog('О компьютере','<p><b>ЛентаОС 99</b><br>Память: 64 МБ · Диск: 6,4 ГБ<br>Модем: 56 кбит/с</p>',[['ОК']]),IC.info],null,['Выключить…',()=>ask('Выключить компьютер? Всё сохранится.',shutdown),IC.power]],2,innerHeight,'');
 m.id='startmenu';const list=el('div','list');while(m.firstChild)list.append(m.firstChild);m.append(el('div','side','ЛентаОС 99'),list);m.style.top=innerHeight-30-m.offsetHeight+'px';m.style.left='2px';}
function shutdown(){save();while(wins.length){wins[0].onclose=null;wins[0].close();}const o=el('div','',`<div style="color:#ffb341;font:700 22px Tahoma;text-align:center">Теперь питание компьютера можно отключить.<br><br><button>Включить снова</button></div>`);o.style.cssText='position:fixed;inset:0;background:#000;display:grid;place-items:center;z-index:99999';$('button',o).onclick=()=>o.remove();document.body.append(o);}
// ——— запуск
function boot(){load();document.body.innerHTML='<div id="desk" data-folder="desk"><div id="icons"></div></div><div id="bar"><button id="start"><i></i>Пуск</button><div id="tasks"></div><div id="clock"></div></div>';
 wall();views.push(drawDesk);drawDesk();
 $('#start').onclick=e=>{e.stopPropagation();startMenu();};
 addEventListener('pointerdown',e=>{if(!e.target.closest('.menu,#start'))closeMenus();if(e.target.id==='desk')select(null,null);},true);
 $('#desk').addEventListener('contextmenu',e=>{if(e.target.id!=='desk'&&e.target.id!=='icons')return;e.preventDefault();closeMenus();menu(spaceMenu('desk',e.clientX,e.clientY),e.clientX,e.clientY);});
 addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;const it=selected&&item(selected);if(!it)return;if(e.key==='Delete')remove(it.id);if(e.key==='Enter')openItem(it.id);if(e.key==='F2'&&!it.sys)prompt_('Новое имя',it.name,v=>{it.name=unique(v,it.parent,it);changed();});});
 const tick=()=>$('#clock').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});tick();setInterval(tick,10000);addEventListener('pagehide',save);}
root.OS={boot,open,dialog,ask,prompt:prompt_,app,launch,create,item,kids,save,changed,openItem,explorer,viewImage,IC,esc,el,APPS,get D(){return D;},get wins(){return wins;}};
})(window);
