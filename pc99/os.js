(function(root){
const $=(s,e=document)=>e.querySelector(s),el=(tag,cls,html)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(html!==undefined)d.innerHTML=html;return d;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='lentaos99-pc-1';
// ——— значки: icons.js
const IC=root.IC9;
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
const binIcon=()=>kids('bin').length?IC.binFull:IC.bin,dirIcon=id=>id==='bin'?binIcon():id==='docs'?IC.docs:IC.folder;
const iconOf=it=>it.type==='folder'?dirIcon(it.id):it.type==='text'?IC.text:it.type==='image'?IC.image:it.type==='table'?IC.table:it.type==='link'?dirIcon(it.target):it.type==='web'?(it.url.includes('constructor')?IC.flow:IC.feed):(APPS[it.app]||{}).icon||IC.pc;
// ——— окна
const wins=[];let z=10,active=null;
function open({key,title,icon,w=460,h=320,max=false,build,onclose}){if(key){const old=wins.find(x=>x.key===key);if(old){old.el.classList.remove('min');focus(old);return old;}}
 const W=innerWidth,H=innerHeight-30,n=wins.length%7,d=el('div','win');w=Math.min(w,W-10);h=Math.min(h,H-10);
 d.style.cssText=`left:${Math.max(4,Math.min(W-w-4,190+n*30))}px;top:${Math.max(4,Math.min(H-h-4,30+n*28))}px;width:${w}px;height:${h}px`;
 d.innerHTML=`<div class="tb">${icon||IC.pc}<span></span><button data-w="min" title="Свернуть"></button><button data-w="max" title="Развернуть"></button><button data-w="close" title="Закрыть"></button></div><div class="cont"></div><div class="grip"></div>`;
 const win={key,el:d,cont:$('.cont',d),icon:icon||IC.pc,onclose,clean:[],setTitle(t){win.title=t;$('.tb span',d).textContent=t;tasks();},close(){if(win.onclose&&win.onclose()===false)return;win.clean.forEach(f=>f());d.remove();wins.splice(wins.indexOf(win),1);if(active===win){active=null;const t=top();if(t)focus(t);}tasks();}};
 d.addEventListener('pointerdown',()=>focus(win),true);
 d.addEventListener('click',e=>{const a=e.target.dataset.w;if(!a)return;if(a==='close')win.close();else if(a==='min'){d.classList.add('min');active=null;const t=top();if(t)focus(t);tasks();}else toggleMax(win);});
 $('.tb',d).addEventListener('dblclick',e=>{if(!e.target.dataset.w)toggleMax(win);});
 dragger($('.tb',d),e=>{if(e.target.tagName==='BUTTON'||d.classList.contains('max'))return null;const x=d.offsetLeft,y=d.offsetTop;return(dx,dy)=>{d.style.left=Math.max(-w+60,Math.min(innerWidth-60,x+dx))+'px';d.style.top=Math.max(0,Math.min(innerHeight-60,y+dy))+'px';};});
 dragger($('.grip',d),()=>{const a=d.offsetWidth,b=d.offsetHeight;return(dx,dy)=>{d.style.width=Math.max(200,a+dx)+'px';d.style.height=Math.max(100,b+dy)+'px';};});
 $('.tb',d).addEventListener('contextmenu',e=>{e.preventDefault();closeMenus();menu(winMenu(win),e.clientX,e.clientY);});
 const sys=$('.tb svg',d);if(sys){sys.addEventListener('dblclick',e=>{e.stopPropagation();win.close();});sys.addEventListener('click',()=>{const r=sys.getBoundingClientRect();closeMenus();menu(winMenu(win),r.left,r.bottom+3);});}
 $('#desk').append(d);wins.push(win);win.setTitle(title);build(win.cont,win);if(max)toggleMax(win);focus(win);return win;}
function dragger(handle,begin){handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;const mv=begin(e);if(!mv)return;const sx=e.clientX,sy=e.clientY;document.body.classList.add('dragging');const m=ev=>mv(ev.clientX-sx,ev.clientY-sy),u=()=>{removeEventListener('pointermove',m);removeEventListener('pointerup',u);document.body.classList.remove('dragging');};addEventListener('pointermove',m);addEventListener('pointerup',u);});}
function toggleMax(w){const d=w.el;if(d.classList.contains('max')){d.classList.remove('max');d.style.cssText=w.prev;}else{w.prev=d.style.cssText;d.classList.add('max');Object.assign(d.style,{left:0,top:0,width:'100%',height:'100%'});}d.style.zIndex=++z;}
const minimize=w=>{w.el.classList.add('min');if(active===w)active=null;const n=top();if(n)focus(n);tasks();};
const restore=w=>{w.el.classList.remove('min');active=null;focus(w);tasks();};
function winMenu(w){const mx=w.el.classList.contains('max'),mn=w.el.classList.contains('min');return[['Восстановить',()=>{if(mn)restore(w);else if(mx)toggleMax(w);}],['Свернуть',()=>minimize(w)],['Развернуть',()=>{if(mn)restore(w);if(!w.el.classList.contains('max'))toggleMax(w);}],null,['Закрыть',()=>w.close()]];}
function showDesktop(){const open_=wins.filter(w=>!w.el.classList.contains('min'));if(open_.length){hidden=open_;open_.forEach(minimize);}else{hidden.filter(w=>wins.includes(w)).forEach(restore);}}
let hidden=[];
const top=()=>wins.filter(w=>!w.el.classList.contains('min')).sort((a,b)=>b.el.style.zIndex-a.el.style.zIndex)[0];
function focus(w){if(active===w)return;active=w;w.el.style.zIndex=++z;wins.forEach(x=>x.el.classList.toggle('act',x===w));tasks();}
function tasks(){const t=$('#tasks');if(!t)return;t.innerHTML='';for(const w of wins){const b=el('button',w===active?'down':'',`${w.icon}<span>${esc(w.title||'')}</span>`);b.title=w.title||'';b.oncontextmenu=e=>{e.preventDefault();closeMenus();menu(winMenu(w),e.clientX,e.clientY);};b.onclick=()=>{if(w===active){w.el.classList.add('min');active=null;const n=top();if(n)focus(n);}else{w.el.classList.remove('min');active=null;focus(w);}tasks();};t.append(b);}}
function dialog(title,html,buttons,pic='info',h=150){sound(pic==='warn'?'err':'ding');return open({title,icon:IC[pic],w:360,h,build(c,w){w.el.classList.add('dialog');c.innerHTML=`<div class="dlgbody"><div class="dlgmain">${IC[pic]}<div>${html}</div></div><div class="row">${buttons.map((b,i)=>`<button data-b="${i}">${b[0]}</button>`).join('')}</div></div>`;c.addEventListener('keydown',e=>{if(e.key==='Escape')w.close();});setTimeout(()=>{const b=$('[data-b="0"]',c);if(b&&!$('input',c))b.focus();});c.addEventListener('click',e=>{const i=e.target.dataset.b;if(i===undefined)return;const f=buttons[i][1];const v=$('input',c);w.close();if(f)f(v&&v.value);});const v=$('input',c);if(v){setTimeout(()=>{v.focus();v.select();});v.addEventListener('keydown',e=>{if(e.key==='Enter')$('[data-b="0"]',c).click();});}}});}
const ask=(q,yes)=>dialog('Подтверждение',`<p>${esc(q)}</p>`,[['Да',yes],['Нет']],'question');
const prompt_=(q,val,ok)=>dialog(q,`<input value="${esc(val)}">`,[['ОК',v=>{v=(v||'').trim().slice(0,60);if(v)ok(v);}],['Отмена']],'question');
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
let clip=null;const picked=()=>[...new Set([...document.querySelectorAll('.ico.sel')].map(e=>e.dataset.id))].map(item).filter(Boolean);
function copyItem(it,parent){const o={...it};delete o.id;delete o.x;delete o.y;delete o.from;delete o.sys;const n=create(o,parent);for(const k of kids(it.id))copyItem(k,n.id);return n;}
function paste(folder){if(!clip)return;for(const id of clip.ids){const it=item(id);if(!it)continue;if(clip.cut){if(it.parent!==folder)move(id,folder);}else if(folder!==id&&!inside(folder,id))copyItem(it,folder);}if(clip.cut)clip=null;changed();}
const toClip=(list,cut)=>{const ids=list.filter(i=>!cut||!i.sys).map(i=>i.id);if(ids.length)clip={ids,cut};};
function removeMany(list){list=list.filter(i=>!i.sys);if(!list.length)return;if(list.length===1)return remove(list[0].id);const forever=list.some(i=>i.parent==='bin'||inside(i.parent,'bin'));const go_=()=>{for(const i of list)forever?destroy(i.id):move(i.id,'bin');changed();};if(forever)ask('Удалить навсегда объектов: '+list.length+'?',go_);else go_();}
const sizeOf=it=>it.type==='folder'?kids(it.id).reduce((a,k)=>a+sizeOf(k),0):JSON.stringify(it.data||it.rows||it.png||it.url||'').length;
const KIND={folder:'Папка с файлами',text:'Текстовый документ',image:'Рисунок',table:'Таблица',app:'Программа',web:'Ссылка в интернет',link:'Ярлык'};
function props(it){dialog('Свойства: '+it.name,`<p><b>${esc(it.name)}</b></p><hr><table class="props"><tr><td>Тип:</td><td>${it.type==='link'&&it.target==='bin'?'Системная папка':KIND[it.type]||it.type}</td></tr><tr><td>Лежит в:</td><td>${esc(it.parent?pathOf(it.parent):'—')}</td></tr><tr><td>Размер:</td><td>${sizeOf(it)} байт</td></tr>${it.type==='folder'?`<tr><td>Внутри:</td><td>объектов: ${kids(it.id).length}</td></tr>`:''}</table>`,[['ОК']],'info',220);}
function itemMenu(it){const many=picked();if(many.length>1&&many.some(i=>i.id===it.id))return[['Открыть',()=>many.forEach(i=>openItem(i.id))],null,['Вырезать',()=>toClip(many,true)],['Копировать',()=>toClip(many,false)],null,['Удалить',()=>removeMany(many)]];
 const bin=it.parent==='bin';return tidy([['Открыть',()=>openItem(it.id)],bin?['Восстановить',()=>move(it.id,item(it.from)?it.from:'desk')]:undefined,null,it.sys?undefined:['Вырезать',()=>toClip([it],true)],it.sys?undefined:['Копировать',()=>toClip([it],false)],it.type==='folder'&&clip?['Вставить',()=>paste(it.id)]:undefined,null,it.sys?undefined:['Переименовать',()=>prompt_('Новое имя',it.name,v=>{it.name=unique(v,it.parent,it);changed();})],it.sys?undefined:[bin?'Удалить навсегда':'Удалить',()=>remove(it.id)],null,['Свойства',()=>props(it)]]);}
function tidy(l){const out=[];for(const x of l){if(x===undefined)continue;if(x===null){if(out.length&&out[out.length-1]!==null)out.push(null);}else out.push(x);}return out;}
function spaceMenu(folder,x,y){const make=[['Папку',()=>create({type:'folder',name:'Новая папка',x,y},folder)],['Текстовый файл',()=>create({type:'text',name:'Новый документ.txt',data:'',x,y},folder)]];
 if(folder==='bin')return[['Очистить корзину',()=>ask('Удалить всё из корзины?',()=>{kids('bin').forEach(k=>destroy(k.id));changed();})]];
 return[...(clip?[['Вставить',()=>paste(folder)],null]:[]),['Создать',make],...(folder==='desk'?[['Свойства экрана',screenProps]]:[]),folder==='desk'?['Выстроить значки',()=>{const l=kids('desk');l.forEach(i=>{i.x=-999;});for(const i of l)Object.assign(i,freeSpot());changed();}]:null,folder==='desk'?['Сменить фон',()=>{D.settings.wall=(D.settings.wall+1)%WALLS.length;wall();save();}]:null].filter(Boolean);}
const WALL_NAMES=['Бирюзовый (обычный)','Синяя ночь','Болотные полосы','Чёрный','Сиреневый вечер','Клетка','Звёзды'];
const WALLS=['#008080','#2b4a8b linear-gradient(160deg,#35619f,#1a2c57)','#4b5a3a repeating-linear-gradient(45deg,#50603e,#50603e 12px,#475636 12px,#475636 24px)','#000','#7a5c86 radial-gradient(circle at 20% 80%,#a07bad,#4a3556)','#3a6a5a repeating-conic-gradient(#356051 0 25%,#40735f 0 50%) 0 0/32px 32px','#000024 radial-gradient(#fff 1px,transparent 2px) 0 0/57px 71px'];
const wall=()=>$('#desk').style.background=WALLS[D.settings.wall];
let selected=null;
function select(node,id,add){if(!add)document.querySelectorAll('.ico.sel').forEach(e=>e.classList.remove('sel'));selected=id;if(node)node.classList.toggle('sel',add?!node.classList.contains('sel'):true);}
// рамка выделения мышью по пустому месту
function lasso(area,e){if(e.button!==0||(e.target!==area&&e.target.id!=='icons'))return;const box=el('div','lasso');document.body.append(box);const sx=e.clientX,sy=e.clientY;select(null,null);
 const m=ev=>{const l=Math.min(sx,ev.clientX),t=Math.min(sy,ev.clientY),r=Math.max(sx,ev.clientX),b=Math.max(sy,ev.clientY);Object.assign(box.style,{left:l+'px',top:t+'px',width:r-l+'px',height:b-t+'px'});for(const i of area.querySelectorAll('.ico')){const q=i.getBoundingClientRect(),hit=q.left<r&&q.right>l&&q.top<b&&q.bottom>t;i.classList.toggle('sel',hit);if(hit)selected=i.dataset.id;}};
 const u=()=>{removeEventListener('pointermove',m);removeEventListener('pointerup',u);box.remove();document.body.classList.remove('dragging');};document.body.classList.add('dragging');addEventListener('pointermove',m);addEventListener('pointerup',u);}
function iconEl(it){const d=el('div','ico',`${iconOf(it)}<span>${esc(it.name)}</span>`);d.dataset.id=it.id;if(selected===it.id)d.classList.add('sel');
 d.addEventListener('dblclick',()=>openItem(it.id));
 d.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();closeMenus();if(!d.classList.contains('sel'))select(d,it.id);menu(itemMenu(it),e.clientX,e.clientY);});
 d.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.stopPropagation();closeMenus();if(e.ctrlKey){select(d,it.id,true);return;}if(!d.classList.contains('sel'))select(d,it.id);const w=d.closest('.win');if(w){const o=wins.find(x=>x.el===w);if(o)focus(o);}
  const sx=e.clientX,sy=e.clientY,r=d.getBoundingClientRect();let g=null,over=null;
  const target=ev=>{g.style.display='none';const t=document.elementFromPoint(ev.clientX,ev.clientY);g.style.display='';if(!t)return null;const ic=t.closest('.ico');if(ic){const o=item(ic.dataset.id);if(o&&o.id!==it.id){if(o.type==='folder')return{folder:o.id,node:ic};if(o.type==='link')return{folder:o.target,node:ic};}}const f=t.closest('[data-folder]');return f?{folder:f.dataset.folder,node:null,box:f}:null;};
  const m=ev=>{if(!g){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;g=d.cloneNode(true);g.classList.add('ghost');document.body.append(g);document.body.classList.add('dragging');}g.style.left=ev.clientX-(sx-r.left)+'px';g.style.top=ev.clientY-(sy-r.top)+'px';if(over)over.classList.remove('drop');const t=target(ev);over=t&&t.node;if(over)over.classList.add('drop');};
  const u=ev=>{removeEventListener('pointermove',m);removeEventListener('pointerup',u);document.body.classList.remove('dragging');if(!g){select(d,it.id);return;}const t=target(ev);g.remove();if(over)over.classList.remove('drop');if(!t)return;
   const mates=picked().filter(i=>i.id!==it.id&&i.parent===it.parent&&!i.sys),from_=it.parent,ox=it.x,oy=it.y;
   if(t.folder!==from_)for(const o of mates)if(o.id!==t.folder)move(o.id,t.folder);
   if(t.folder==='desk'){const dr=$('#desk').getBoundingClientRect();move(it.id,'desk',ev.clientX-(sx-r.left)-dr.left,ev.clientY-(sy-r.top)-dr.top);if(from_==='desk')for(const o of mates)move(o.id,'desk',o.x+it.x-ox,o.y+it.y-oy);}else if(t.folder!==it.parent)move(it.id,t.folder);};
  addEventListener('pointermove',m);addEventListener('pointerup',u);});
 return d;}
function drawDesk(){const box=$('#icons');box.innerHTML='';for(const it of kids('desk')){const d=iconEl(it);d.style.left=Math.min(it.x,innerWidth-80)+'px';d.style.top=Math.min(it.y,innerHeight-100)+'px';if(it.type==='link'&&it.target==='bin'&&kids('bin').length)$('span',d).textContent=it.name+' ('+kids('bin').length+')';box.append(d);}}
const pathOf=id=>{const p=[];for(let x=item(id);x;x=item(x.parent))p.unshift(x.name);return p.join(' › ');};
const closeFor=id=>wins.filter(w=>w.item===id).forEach(w=>{w.onclose=null;w.close();});
function explorer(folder){const special=folder==='computer';open({key:'dir:'+folder,title:special?'Мой компьютер':item(folder).name,icon:special?IC.pc:dirIcon(folder),w:520,h:360,build(c,win){let cur=folder,view=0,hist=[];
 c.innerHTML='<div class="mbar"><button data-mb="file">Файл</button><button data-mb="edit">Правка</button><button data-mb="view">Вид</button><button data-mb="help">Справка</button></div><div class="toolbar"><button data-back title="Назад">◄<small>Назад</small></button><button data-up title="Вверх">▲<small>Вверх</small></button><i></i><button data-new="folder">'+IC.folder+'<small>Папка</small></button><button data-new="text">'+IC.text+'<small>Файл</small></button></div><div class="adr"><span>Адрес:</span><div data-path></div></div><div class="sunken"><div class="files" tabindex="0"></div></div><div class="status"></div>';const box=$('.files',c);
 const goto_=id=>{hist.push(cur);cur=id;win.key='dir:'+cur;draw();};
 const draw=()=>{if(cur!=='computer'&&!item(cur)){cur='computer';}box.innerHTML='';box.dataset.folder=cur==='computer'?'':cur;box.className='files'+(view?' list':'');
  const list=cur==='computer'?['desk','docs','down','bin'].map(item):kids(cur).slice().sort((a,b)=>(b.type==='folder')-(a.type==='folder')||a.name.localeCompare(b.name,'ru'));
  list.forEach(i=>box.append(iconEl(i)));win.setTitle(cur==='computer'?'Мой компьютер':item(cur).name);$('[data-path]',c).innerHTML=(cur==='computer'?IC.pc:dirIcon(cur))+'<span>'+esc(cur==='computer'?'Мой компьютер':pathOf(cur))+'</span>';$('.status',c).textContent='Объектов: '+list.length;c.querySelectorAll('[data-new]').forEach(b=>b.disabled=cur==='computer'||cur==='bin');$('[data-back]',c).disabled=!hist.length;$('[data-up]',c).disabled=cur==='computer';};
 box.addEventListener('dblclick',e=>{const ic=e.target.closest('.ico');if(!ic)return;const i=item(ic.dataset.id);if(i.type==='folder'||i.type==='link'){e.stopPropagation();goto_(i.type==='link'?i.target:i.id);}},true);
 box.addEventListener('contextmenu',e=>{e.preventDefault();closeMenus();if(cur!=='computer')menu(spaceMenu(cur),e.clientX,e.clientY);});
 box.addEventListener('pointerdown',e=>lasso(box,e));
 const bars={file:()=>cur==='computer'||cur==='bin'?[['Закрыть',()=>win.close()]]:[...spaceMenu(cur),null,['Закрыть',()=>win.close()]],
  edit:()=>[['Вырезать',()=>toClip(picked(),true)],['Копировать',()=>toClip(picked(),false)],['Вставить',()=>{if(cur!=='computer')paste(cur);}],null,['Выделить всё',()=>box.querySelectorAll('.ico').forEach(i=>i.classList.add('sel'))],['Удалить',()=>removeMany(picked())]],
  view:()=>[[(view?'':'• ')+'Крупные значки',()=>{view=0;draw();}],[(view?'• ':'')+'Список',()=>{view=1;draw();}],null,['Обновить',draw]],
  help:()=>[['О программе',()=>dialog('О программе','<p><b>Проводник</b><br>ЛентаОС 99</p>',[['ОК']])]]};
 c.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.mb){const r=t.getBoundingClientRect();closeMenus();menu(bars[t.dataset.mb](),r.left,r.bottom);return;}
  if('back'in t.dataset&&hist.length){cur=hist.pop();win.key='dir:'+cur;draw();}if('up'in t.dataset){const i=item(cur);goto_(i&&i.parent&&item(i.parent)?i.parent:'computer');}const n=t.dataset.new;if(n)create(n==='folder'?{type:'folder',name:'Новая папка'}:{type:'text',name:'Новый документ.txt',data:''},cur);});
 // обработчик открытия папки внутри этого же окна важнее общего
 box.addEventListener('dblclick',e=>e.stopPropagation());
 win.folder=()=>cur==='computer'?null:cur;
 views.push(draw);win.clean.push(()=>views.splice(views.indexOf(draw),1));draw();}});}
function viewImage(it){open({key:'img:'+it.id,title:it.name,icon:IC.image,w:520,h:380,build(c,w){w.item=it.id;c.innerHTML='<div class="sunken" style="display:grid;place-items:center;background:#333"></div>';const s=c.firstChild;s.innerHTML=it.png?`<img src="${it.png}" style="max-width:100%">`:it.data;const v=$('svg',s);if(v)v.style.cssText='width:100%;height:100%';}});}
function viewTable(it){open({key:'tab:'+it.id,title:it.name,icon:IC.table,w:640,h:380,build(c,w){w.item=it.id;c.innerHTML=`<div class="sunken"><table class="t"><tr>${it.cols.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>${it.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div><div class="status">строк: ${it.rows.length}</div>`;}});}
// ——— программы
const APPS={};
function app(id,name,icon,run){APPS[id]={name,icon,run};}
function launch(id,arg){busy();APPS[id].run(arg);}
// «песочные часы», пока открывается программа
let busyT=0;function busy(){document.body.classList.add('busy');clearTimeout(busyT);busyT=setTimeout(()=>document.body.classList.remove('busy'),450);}
// звуки системы: свои короткие мелодии
let actx=null;function sound(kind){if(!D||D.settings.mute)return;try{if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume();
 const S={ding:[[880,0,.18],[1320,.07,.25]],err:[[220,0,.16],[165,.12,.3]],on:[[392,0,.5],[523,.14,.5],[659,.28,.5],[784,.42,.9]],off:[[784,0,.4],[523,.16,.4],[392,.32,.8]]}[kind];
 for(const[f,at,len]of S){const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+at;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+len);}}catch(e){}}
function runDialog(){dialog('Выполнить','<p>Введите название программы, папки или адрес сайта.</p><input placeholder="блокнот или nashel.net">',[['ОК',v=>{v=(v||'').trim().toLowerCase();if(!v)return;const id=Object.keys(APPS).find(k=>APPS[k].name.toLowerCase()===v||k===v);if(id)return launch(id);const f=D.items.find(i=>i.name.toLowerCase()===v);if(f)return openItem(f.id);if(v.includes('.'))return launch('browser',v);dialog('Ошибка',`<p>Не удаётся найти «${esc(v)}».</p>`,[['ОК']],'warn');}],['Отмена']],'run',170);}
function screenProps(){open({key:'screen',title:'Свойства: Экран',icon:IC.desk,w:330,h:340,build(c,w){w.el.classList.add('dialog');let pick=D.settings.wall;c.innerHTML=`<div class="dlgbody"><div class="crt"><div></div></div><label>Фон рабочего стола:</label><select size="7">${WALL_NAMES.map((n,i)=>`<option value="${i}"${i===pick?' selected':''}>${n}</option>`).join('')}</select><div class="row"><button data-s="ok">ОК</button><button data-s="no">Отмена</button><button data-s="apply">Применить</button></div></div>`;
 const pv=$('.crt div',c),sel=$('select',c),show=()=>pv.style.background=WALLS[pick];show();sel.onchange=()=>{pick=+sel.value;show();};const apply=()=>{D.settings.wall=pick;wall();save();};c.addEventListener('click',e=>{const a=e.target.dataset.s;if(!a)return;if(a!=='no')apply();if(a!=='apply')w.close();});}});}
app('computer','Мой компьютер',IC.pc,()=>explorer('computer'));
function startMenu(){if($('#startmenu')){closeMenus();return;}closeMenus();const a=id=>[APPS[id].name,()=>launch(id),APPS[id].icon];
 const web=u=>()=>launch('browser',u);
 const m=menu([['Программы',[a('browser'),a('notepad'),a('paint'),a('calc'),a('computer')],IC.folder],['Игры',[a('mines'),a('cards'),a('snake'),a('fifteen'),a('memory')],IC.folder],['Документы',[['Мои документы',()=>explorer('docs'),IC.docs],['Загрузки',()=>explorer('down'),IC.folder],['Мои рисунки',()=>explorer('pics'),IC.folder]],IC.folder],['Избранное',[['Конструктор',web('lenta.net/constructor'),IC.flow],['ЛентаОС',web('lenta.net/feed'),IC.feed],['Поиск «Нашёл!»',web('nashel.net'),IC.web],['Каталог сайтов',web('katalog.net'),IC.web]],IC.folder],null,['Настройка',[['Свойства экрана',screenProps,IC.desk],['Звук вкл/выкл',toggleSound,IC.sound]],IC.pc],['Выполнить…',runDialog,IC.run],['Справка',()=>openItem(D.items.find(i=>i.name==='прочти меня.txt')?.id)||0,IC.help],['О компьютере',()=>dialog('О компьютере','<p><b>ЛентаОС 99</b><br>Память: 64 МБ · Диск: 6,4 ГБ<br>Модем: 56 кбит/с</p>',[['ОК']]),IC.info],null,['Выключить…',shutDialog,IC.power]],2,innerHeight,'');
 m.id='startmenu';const list=el('div','list');while(m.firstChild)list.append(m.firstChild);m.append(el('div','side','ЛентаОС 99'),list);m.style.top='auto';m.style.left='2px';}
function shutDialog(){dialog('Завершение работы',`<p>Что должен сделать компьютер? Всё сохранится.</p><label><input type="radio" name="sd" value="off" checked> выключить</label><br><label><input type="radio" name="sd" value="re"> перезагрузить</label>`,[['Да'],['Нет']],'power',190);
 const w=wins[wins.length-1];w.cont.addEventListener('click',e=>{if(e.target.dataset.b==='0'){const re=$('input[value="re"]',w.cont).checked;setTimeout(()=>shutdown(re));}},true);}
function shutdown(re){save();sound('off');while(wins.length){wins[0].onclose=null;wins[0].close();}
 const o=el('div','poweroff',re?'':'<div>Теперь питание компьютера можно отключить.<br><br><button>Включить снова</button></div>');document.body.append(o);if(re)bootScreen(o);else $('button',o).onclick=()=>bootScreen(o);}
// экран загрузки после включения
function bootScreen(o){o.className='poweroff booting';o.innerHTML=`<div>${IC.logo}<h1>ЛентаОС <b>99</b></h1><p>Загрузка…</p><u><i></i></u></div>`;setTimeout(()=>{o.remove();sound('on');},1900);}
function toggleSound(){D.settings.mute=!D.settings.mute;save();tray();if(!D.settings.mute)sound('ding');}
function tray(){const b=$('#vol');if(b){b.innerHTML=D.settings.mute?IC.mute:IC.sound;b.title=D.settings.mute?'Звук выключен':'Звук включён';}}
// ——— запуск
function boot(){load();document.body.innerHTML=`<div id="desk" data-folder="desk"><div id="icons"></div></div><div id="bar"><button id="start">${IC.logo}Пуск</button><div id="quick"><button id="q-desk" title="Свернуть все окна">${IC.desk}</button><button id="q-web" title="Интернет">${IC.web}</button></div><div id="tasks"></div><div id="tray"><button id="vol"></button><div id="clock"></div></div></div>`;
 wall();views.push(drawDesk);drawDesk();
 $('#start').onclick=e=>{e.stopPropagation();startMenu();};
 $('#q-desk').onclick=showDesktop;$('#q-web').onclick=()=>launch('browser');$('#vol').onclick=toggleSound;tray();
 $('#desk').addEventListener('pointerdown',e=>lasso($('#desk'),e));
 $('#bar').addEventListener('contextmenu',e=>{if(e.target.id!=='bar'&&e.target.id!=='tasks')return;e.preventDefault();closeMenus();menu([['Свернуть все окна',showDesktop],null,['Свойства экрана',screenProps]],e.clientX,e.clientY);});
 addEventListener('pointerdown',e=>{if(!e.target.closest('.menu,#start,[data-mb]'))closeMenus();if(e.target.id==='desk')select(null,null);},true);
 $('#desk').addEventListener('contextmenu',e=>{if(e.target.id!=='desk'&&e.target.id!=='icons')return;e.preventDefault();closeMenus();menu(spaceMenu('desk',e.clientX,e.clientY),e.clientX,e.clientY);});
 addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus();if(e.target.closest&&e.target.closest('input,textarea,.doc'))return;
  const where=active&&active.folder?active.folder():active?null:'desk',list=picked(),it=selected&&item(selected);
  if(e.ctrlKey){if(e.code==='KeyC')toClip(list,false);else if(e.code==='KeyX')toClip(list,true);else if(e.code==='KeyV'&&where)paste(where);else if(e.code==='KeyA'){const a_=active?active.el:$('#icons');if(where){e.preventDefault();a_.querySelectorAll('.ico').forEach(i=>i.classList.add('sel'));}}return;}
  if(!it||!list.length)return;if(e.key==='Delete')removeMany(list);if(e.key==='Enter')list.forEach(i=>openItem(i.id));if(e.key==='F2'&&!it.sys)prompt_('Новое имя',it.name,v=>{it.name=unique(v,it.parent,it);changed();});});
 const tick=()=>$('#clock').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});tick();setInterval(tick,10000);addEventListener('pagehide',save);}
root.OS={boot,open,dialog,ask,prompt:prompt_,app,launch,create,item,kids,save,changed,openItem,explorer,viewImage,IC,esc,el,APPS,get D(){return D;},get wins(){return wins;}};
})(window);
