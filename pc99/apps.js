// программы и игры
(function(){
const O=window.OS,{el,esc,IC}=O,$=(s,e)=>e.querySelector(s),rnd=n=>Math.random()*n|0;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const keys=(win,fn)=>{const h=e=>{if(!win.el.classList.contains('act')||e.target.closest('input,textarea'))return;fn(e);};addEventListener('keydown',h);win.clean.push(()=>removeEventListener('keydown',h));};
// ——— блокнот
O.app('notepad','Блокнот',IC.text,id=>{let it=id&&O.item(id);O.open({key:it?'note:'+it.id:null,title:(it?it.name:'Без имени')+' — Блокнот',icon:IC.text,w:480,h:340,build(c,w){if(it)w.item=it.id;
 c.innerHTML='<div class="menubar"><button data-a="save">Сохранить</button><button data-a="as">Сохранить как…</button><span data-s style="margin-left:6px"></span></div><div class="sunken"><textarea class="pad" spellcheck="false"></textarea></div>';const t=$('textarea',c),s=$('[data-s]',c);t.value=it?it.data:'';let dirty=false;
 const done=()=>{dirty=false;s.textContent='сохранено';};
 const saveAs=()=>O.prompt('Имя файла',it?it.name:'документ.txt',v=>{if(!/\.\w+$/.test(v))v+='.txt';it=O.create({type:'text',name:v,data:t.value},'docs');w.item=it.id;w.key='note:'+it.id;w.setTitle(it.name+' — Блокнот');done();});
 const save=()=>{if(it&&O.item(it.id)){it.data=t.value;O.save();done();}else saveAs();};
 t.addEventListener('input',()=>{dirty=true;s.textContent='есть несохранённые изменения';if(it&&O.item(it.id)){it.data=t.value;O.save();done();}});
 c.addEventListener('click',e=>{if(e.target.dataset.a==='save')save();if(e.target.dataset.a==='as')saveAs();});
 t.addEventListener('keydown',e=>{if(e.ctrlKey&&e.code==='KeyS'){e.preventDefault();save();}});
 w.onclose=()=>{if(dirty&&t.value){O.ask('Закрыть без сохранения?',()=>{w.onclose=null;w.close();});return false;}};
 setTimeout(()=>t.focus());}});});
// ——— рисовалка
O.app('paint','Рисовалка',IC.paint,()=>O.open({title:'Рисовалка',icon:IC.paint,w:680,h:480,build(c){
 const COL=['#000000','#ffffff','#7f7f7f','#c0141c','#ff7f27','#ffd21f','#22b14c','#00a2e8','#3f48cc','#a349a4','#b97a57','#ffaec9'];
 c.innerHTML=`<div class="menubar"><button data-t="pen" class="down">Карандаш</button><button data-t="brush">Кисть</button><button data-t="erase">Ластик</button><button data-t="line">Линия</button><button data-t="rect">Прямоугольник</button><button data-t="fill">Заливка</button><button data-a="clear">Очистить</button><button data-a="save">Сохранить</button></div><div class="menubar">${COL.map((x,i)=>`<button data-c="${x}" style="background:${x};width:20px;height:20px" class="${i?'':'down'}"></button>`).join('')}</div><div class="sunken" style="background:#888"><canvas width="640" height="360"></canvas></div>`;
 const cv=$('canvas',c),g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,640,360);let tool='pen',color='#000000',from=null,snap=null;
 const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*640/r.width|0,(e.clientY-r.top)*360/r.height|0];};
 function flood(x,y){const im=g.getImageData(0,0,640,360),d=im.data,at=(x,y)=>(y*640+x)*4,s=at(x,y),old=[d[s],d[s+1],d[s+2]],nw=[1,3,5].map(i=>parseInt(color.substr(i,2),16));if(old.every((v,i)=>v===nw[i]))return;const st=[[x,y]];while(st.length){const[a,b]=st.pop();if(a<0||b<0||a>=640||b>=360)continue;const k=at(a,b);if(d[k]!==old[0]||d[k+1]!==old[1]||d[k+2]!==old[2])continue;d[k]=nw[0];d[k+1]=nw[1];d[k+2]=nw[2];st.push([a+1,b],[a-1,b],[a,b+1],[a,b-1]);}g.putImageData(im,0,0);}
 const stroke=(a,b)=>{g.strokeStyle=tool==='erase'?'#fff':color;g.lineWidth=tool==='brush'?7:tool==='erase'?18:2;g.lineCap='round';g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();};
 cv.addEventListener('pointerdown',e=>{const p=pos(e);if(tool==='fill'){flood(...p);return;}from=p;snap=g.getImageData(0,0,640,360);cv.setPointerCapture(e.pointerId);if(tool!=='line'&&tool!=='rect')stroke(p,[p[0]+.1,p[1]]);});
 cv.addEventListener('pointermove',e=>{if(!from)return;const p=pos(e);if(tool==='line'){g.putImageData(snap,0,0);stroke(from,p);}else if(tool==='rect'){g.putImageData(snap,0,0);g.strokeStyle=color;g.lineWidth=2;g.strokeRect(from[0],from[1],p[0]-from[0],p[1]-from[1]);}else{stroke(from,p);from=p;}});
 cv.addEventListener('pointerup',()=>from=null);
 c.addEventListener('click',e=>{const d=e.target.dataset;if(d.t){tool=d.t;c.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('down',b===e.target));}if(d.c){color=d.c;c.querySelectorAll('[data-c]').forEach(b=>b.classList.toggle('down',b===e.target));}if(d.a==='clear'){g.fillStyle='#fff';g.fillRect(0,0,640,360);}if(d.a==='save'){const it=O.create({type:'image',name:'рисунок.png',png:cv.toDataURL('image/png')},'pics');O.dialog('Сохранено',`<p>«${esc(it.name)}» лежит в папке «Мои рисунки».</p>`,[['ОК']]);}});}}));
// ——— калькулятор
O.app('calc','Калькулятор',IC.calc,()=>O.open({key:'calc',title:'Калькулятор',icon:IC.calc,w:208,h:268,build(c,w){
 const K=['C','←','±','÷','7','8','9','×','4','5','6','−','1','2','3','+','0',',','%','='];c.innerHTML=`<div class="calc"><input readonly value="0">${K.map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div>`;const o=$('input',c);let cur='0',acc=null,op=null,fresh=true;
 const num=()=>parseFloat(cur.replace(',','.')),fmt=v=>isFinite(v)?String(Math.round(v*1e10)/1e10).replace('.',','):'Ошибка';
 const apply=()=>{const b=num();return op==='+'?acc+b:op==='−'?acc-b:op==='×'?acc*b:acc/b;};
 function press(k){if(cur==='Ошибка'&&k!=='C')return;if(/\d/.test(k)){cur=fresh||cur==='0'?k:(cur+k).slice(0,16);fresh=false;}else if(k===','){if(fresh){cur='0,';fresh=false;}else if(!cur.includes(','))cur+=',';}else if(k==='C'){cur='0';acc=null;op=null;fresh=true;}else if(k==='←'){cur=cur.slice(0,-1)||'0';}else if(k==='±'){cur=fmt(-num());}else if(k==='%'){cur=fmt(acc===null?num()/100:acc*num()/100);}else{if(op&&!fresh){cur=fmt(apply());}if(k==='='){if(op&&fresh)cur=fmt(apply());acc=null;op=null;}else{acc=num();op=k;}fresh=true;}o.value=cur;}
 c.addEventListener('click',e=>e.target.dataset.k&&press(e.target.dataset.k));keys(w,e=>{const m={'Enter':'=','=':'=','Backspace':'←','Escape':'C','*':'×','/':'÷','-':'−','+':'+','.':',',',':','};const k=/^\d$/.test(e.key)?e.key:m[e.key];if(k){e.preventDefault();press(k);}});}}));
// ——— сапёр
O.app('mines','Сапёр',IC.mine,()=>O.open({key:'mines',title:'Сапёр',icon:IC.mine,w:240,h:316,build(c,win){
 const LV=[['Новичок',9,9,10,240,316],['Любитель',16,16,40,380,470],['Профи',30,16,99,690,470]];let lv=0,W,H,N,cells,state,left,time,timer;
 c.innerHTML=`<div class="menubar">${LV.map((l,i)=>`<button data-lv="${i}">${l[0]}</button>`).join('')}</div><div class="menubar" style="justify-content:space-between"><span class="lcd" data-m></span><button data-r>🙂</button><span class="lcd" data-t></span></div><div class="sunken" style="background:var(--face)"><div class="mines"></div></div><div class="status"></div>`;
 const box=$('.mines',c),st=$('.status',c);
 const nb=i=>{const x=i%W,y=i/W|0,r=[];for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++){const a=x+dx,b=y+dy;if((dx||dy)&&a>=0&&b>=0&&a<W&&b<H)r.push(b*W+a);}return r;};
 function init(){clearInterval(timer);[,W,H,N]=LV[lv];cells=[...Array(W*H)].map(()=>({m:false,o:false,f:false,n:0}));state='new';left=N;time=0;box.style.gridTemplateColumns=`repeat(${W},22px)`;box.innerHTML=cells.map((_,i)=>`<button data-i="${i}"></button>`).join('');$('[data-r]',c).textContent='🙂';const best=O.D.scores['mines'+lv];st.textContent=best?'Лучшее время: '+best+' с':'Правая кнопка ставит флажок';lcd();c.querySelectorAll('[data-lv]').forEach(b=>b.classList.toggle('down',+b.dataset.lv===lv));}
 const lcd=()=>{$('[data-m]',c).textContent=String(left).padStart(3,'0');$('[data-t]',c).textContent=String(Math.min(999,time)).padStart(3,'0');};
 function place(first){const free=shuffle([...Array(W*H).keys()].filter(i=>i!==first&&!nb(first).includes(i)));free.slice(0,N).forEach(i=>cells[i].m=true);cells.forEach((x,i)=>x.n=nb(i).filter(j=>cells[j].m).length);state='play';timer=setInterval(()=>{time++;lcd();},1000);}
 function show(i){const x=cells[i],b=box.children[i];b.className=x.o?'o':'';b.textContent=x.o?(x.m?'✹':x.n||''):x.f?'⚑':'';b.style.color=x.o?['','#00c','#070','#c00','#006','#600','#066','#000','#555'][x.n]:'#c00';}
 function reveal(i){const stack=[i];while(stack.length){const j=stack.pop(),x=cells[j];if(x.o||x.f)continue;x.o=true;show(j);if(x.m){end(false);box.children[j].style.background='#f55';return;}if(!x.n)stack.push(...nb(j));}if(cells.every(x=>x.m||x.o))end(true);}
 function end(win_){state='over';clearInterval(timer);$('[data-r]',c).textContent=win_?'😎':'😵';cells.forEach((x,i)=>{if(x.m){if(win_)x.f=true;else x.o=true;show(i);}});if(win_){const k='mines'+lv;if(!O.D.scores[k]||time<O.D.scores[k]){O.D.scores[k]=time;O.save();}st.textContent='Победа за '+time+' с';}else st.textContent='Взрыв. Нажми на лицо, чтобы начать заново';}
 box.addEventListener('click',e=>{const i=+e.target.dataset.i;if(isNaN(i)||state==='over')return;if(state==='new')place(i);const x=cells[i];if(x.o){if(x.n&&nb(i).filter(j=>cells[j].f).length===x.n)for(const j of nb(i)){if(state==='over')break;reveal(j);}}else reveal(i);});
 box.addEventListener('contextmenu',e=>{e.preventDefault();const i=+e.target.dataset.i;if(isNaN(i)||state==='over'||cells[i].o)return;cells[i].f=!cells[i].f;left+=cells[i].f?-1:1;show(i);lcd();});
 c.addEventListener('click',e=>{if('r'in e.target.dataset)init();if(e.target.dataset.lv){lv=+e.target.dataset.lv;init();if(!win.el.classList.contains('max')){win.el.style.width=Math.min(LV[lv][4],innerWidth-10)+'px';win.el.style.height=Math.min(LV[lv][5],innerHeight-40)+'px';win.el.style.left=Math.max(4,(innerWidth-LV[lv][4])/2)+'px';win.el.style.top='10px';}}});
 win.clean.push(()=>clearInterval(timer));init();}}));
// ——— косынка
O.app('cards','Косынка',IC.cards,()=>O.open({key:'cards',title:'Косынка',icon:IC.cards,w:540,h:520,build(c){
 const S=['♠','♥','♣','♦'],R=['','Т','2','3','4','5','6','7','8','9','10','В','Д','К'];let stock,waste,found,tab,pick,moves,hist;
 c.innerHTML='<div class="menubar"><button data-a="new">Новая раздача</button><button data-a="undo">Отменить ход</button><button data-a="auto">Всё наверх</button><span data-s style="margin-left:8px"></span></div><div class="cards"></div>';const board=$('.cards',c);
 const red=k=>k.s%2===1;
 function deal(){const d=shuffle([...Array(52).keys()].map(i=>({s:i/13|0,r:i%13+1,up:false})));tab=[...Array(7)].map((_,i)=>{const p=d.splice(0,i+1);p[p.length-1].up=true;return p;});stock=d;waste=[];found=[[],[],[],[]];pick=null;moves=0;hist=[];draw();}
 const snap=()=>JSON.stringify({stock,waste,found,tab});
 function push(){hist.push(snap());if(hist.length>200)hist.shift();moves++;}
 const pile=(z,i)=>z==='w'?waste:z==='f'?found[i]:tab[i];
 const canF=(k,i)=>{const p=found[i];return p.length?p[p.length-1].s===k.s&&p[p.length-1].r===k.r-1:k.r===1;};
 const canT=(k,i)=>{const p=tab[i];if(!p.length)return k.r===13;const t=p[p.length-1];return t.up&&red(t)!==red(k)&&t.r===k.r+1;};
 function moveTo(z,i){if(!pick)return false;const src=pile(pick.z,pick.i),run=src.slice(pick.j),k=run[0];if(!(z==='f'?run.length===1&&canF(k,i):z==='t'&&canT(k,i))){return false;}push();src.splice(pick.j);pile(z,i).push(...run);if(pick.z==='t'&&src.length)src[src.length-1].up=true;pick=null;draw();return true;}
 function autoOne(z,i){const p=pile(z,i),k=p[p.length-1];if(!k||!k.up)return false;for(let f=0;f<4;f++)if(canF(k,f)){pick={z,i,j:p.length-1};return moveTo('f',f);}return false;}
 const card=(k,x,y,attr,sel)=>`<div class="card ${k.up?(red(k)?'r':''):'back'}${sel?' pick':''}" style="left:${x}px;top:${y}px" ${attr}>${k.up?`${R[k.r]}${S[k.s]}<b>${S[k.s]}</b>`:''}</div>`;
 function draw(){let h='';const X=i=>8+i*72;h+=stock.length?card({up:false},X(0),8,'data-z="s"'):`<div class="slot" style="left:${X(0)}px;top:8px" data-z="s"></div>`;
  h+=waste.length?card(waste[waste.length-1],X(1),8,'data-z="w" data-i="0" data-j="'+(waste.length-1)+'"',pick&&pick.z==='w'):'';
  found.forEach((p,i)=>h+=p.length?card(p[p.length-1],X(3+i),8,`data-z="f" data-i="${i}" data-j="${p.length-1}"`,pick&&pick.z==='f'&&pick.i===i):`<div class="slot" style="left:${X(3+i)}px;top:8px" data-z="f" data-i="${i}"></div>`);
  tab.forEach((p,i)=>{if(!p.length)h+=`<div class="slot" style="left:${X(i)}px;top:108px" data-z="t" data-i="${i}"></div>`;let y=108;p.forEach((k,j)=>{h+=card(k,X(i),y,`data-z="t" data-i="${i}" data-j="${j}"`,pick&&pick.z==='t'&&pick.i===i&&j>=pick.j);y+=k.up?20:8;});});
  board.innerHTML=h;const n=found.reduce((a,p)=>a+p.length,0);$('[data-s]',c).textContent=n===52?'Победа! Ходов: '+moves:`Ходов: ${moves} · наверху: ${n} из 52`;}
 board.addEventListener('click',e=>{const t=e.target.closest('[data-z]');if(!t){pick=null;draw();return;}const z=t.dataset.z,i=+t.dataset.i||0,j=t.dataset.j===undefined?-1:+t.dataset.j;
  if(z==='s'){push();if(stock.length){const k=stock.pop();k.up=true;waste.push(k);}else{stock=waste.reverse();stock.forEach(k=>k.up=false);waste=[];}pick=null;draw();return;}
  if(pick){if(pick.z===z&&pick.i===i&&pick.j===j){pick=null;if(j===pile(z,i).length-1&&z!=='f'){if(autoOne(z,i))return;}draw();return;}if(moveTo(z,i))return;}
  const k=j>=0&&pile(z,i)[j];pick=k&&k.up?{z,i,j}:null;draw();});
 c.addEventListener('click',e=>{const a=e.target.dataset.a;if(a==='new')deal();if(a==='undo'&&hist.length){({stock,waste,found,tab}=JSON.parse(hist.pop()));pick=null;moves++;draw();}if(a==='auto'){let go=true;while(go){go=false;if(autoOne('w',0))go=true;for(let i=0;i<7;i++)if(autoOne('t',i))go=true;}pick=null;draw();}});
 deal();}}));
// ——— змейка
O.app('snake','Змейка',IC.snake,()=>O.open({key:'snake',title:'Змейка',icon:IC.snake,w:432,h:426,build(c,win){
 c.innerHTML='<div class="menubar"><button data-a="go">Начать</button><span data-s></span></div><div class="sunken" style="background:#223;display:grid;place-items:center"><canvas width="400" height="320" style="background:#9bbc0f"></canvas></div><div class="status">Стрелки или WASD. Пробел — пауза.</div>';
 const cv=$('canvas',c),g=cv.getContext('2d');let body,dir,next,food,timer=null,score,alive=false,pause=false;
 const spawn=()=>{do food=[rnd(25),rnd(20)];while(body.some(p=>p[0]===food[0]&&p[1]===food[1]));};
 const draw=()=>{g.clearRect(0,0,400,320);g.fillStyle='#0f380f';for(const[x,y]of body)g.fillRect(x*16+1,y*16+1,14,14);g.fillStyle='#8a1c0f';g.fillRect(food[0]*16+3,food[1]*16+3,10,10);$('[data-s]',c).textContent=`Счёт: ${score} · рекорд: ${O.D.scores.snake||0}${alive?pause?' · пауза':'':' · конец игры'}`;};
 function step(){if(!alive||pause||win.el.classList.contains('min'))return;dir=next;const h=[body[0][0]+dir[0],body[0][1]+dir[1]],eat=h[0]===food[0]&&h[1]===food[1];const check=eat?body:body.slice(0,-1);if(h[0]<0||h[1]<0||h[0]>=25||h[1]>=20||check.some(p=>p[0]===h[0]&&p[1]===h[1])){alive=false;clearInterval(timer);draw();return;}body.unshift(h);if(eat){score++;if(score>(O.D.scores.snake||0)){O.D.scores.snake=score;O.save();}spawn();clearInterval(timer);timer=setInterval(step,Math.max(60,140-score*3));}else body.pop();draw();}
 function start(){body=[[8,10],[7,10],[6,10]];dir=next=[1,0];score=0;alive=true;pause=false;spawn();clearInterval(timer);timer=setInterval(step,140);draw();}
 c.addEventListener('click',e=>{if(e.target.dataset.a==='go'){start();e.target.blur();}});
 keys(win,e=>{const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]}[e.code];if(m){e.preventDefault();if(m[0]!==-dir[0]||m[1]!==-dir[1])next=m;}if(e.code==='Space'){e.preventDefault();pause=!pause;draw();}});
 win.clean.push(()=>clearInterval(timer));body=[[8,10]];food=[15,10];score=0;draw();}}));
// ——— пятнашки
O.app('fifteen','Пятнашки',IC.fifteen,()=>O.open({key:'fifteen',title:'Пятнашки',icon:IC.table,w:250,h:318,build(c){let a,n;c.innerHTML='<div class="menubar"><button data-a="new">Перемешать</button><span data-s></span></div><div data-b style="display:grid;grid-template-columns:repeat(4,52px);gap:3px;margin:8px auto"></div>';const b=$('[data-b]',c);
 const nbs=i=>[i%4?i-1:-1,i%4<3?i+1:-1,i-4,i+4].filter(j=>j>=0&&j<16);
 const draw=()=>{b.innerHTML=a.map((v,i)=>`<button data-i="${i}" style="height:52px;font-size:18px;font-weight:700;${v?'':'visibility:hidden'}">${v}</button>`).join('');const ok=a.every((v,i)=>v===(i+1)%16);$('[data-s]',c).textContent=ok&&n?'Собрано! Ходов: '+n:'Ходов: '+n;};
 const mix=()=>{a=[...Array(16)].map((_,i)=>(i+1)%16);let e=15,prev=-1;for(let k=0;k<200;k++){const o=nbs(e).filter(j=>j!==prev),j=o[rnd(o.length)];a[e]=a[j];a[j]=0;prev=e;e=j;}n=0;draw();};
 c.addEventListener('click',ev=>{if(ev.target.dataset.a==='new')return mix();const i=ev.target.dataset.i;if(i===undefined)return;const e=a.indexOf(0);if(nbs(e).includes(+i)){a[e]=a[i];a[i]=0;n++;draw();}});mix();}}));
// ——— пары
O.app('memory','Найди пару',IC.memory,()=>O.open({key:'memory',title:'Найди пару',icon:IC.cards,w:300,h:350,build(c,win){let a,opened,done,tries,wait=0;const F=['🐱','🍕','🚗','🌻','⚽','🎲','📷','🚀'];c.innerHTML='<div class="menubar"><button data-a="new">Заново</button><span data-s></span></div><div data-b style="display:grid;grid-template-columns:repeat(4,60px);gap:5px;margin:8px auto"></div>';const b=$('[data-b]',c);
 const draw=()=>{b.innerHTML=a.map((v,i)=>{const o=done.has(i)||opened.includes(i);return`<button data-i="${i}" style="height:60px;font-size:28px;${o?'background:#fff':''}">${o?v:''}</button>`;}).join('');$('[data-s]',c).textContent=done.size===16?'Всё найдено! Попыток: '+tries:'Попыток: '+tries;};
 const init=()=>{clearTimeout(wait);a=shuffle([...F,...F]);opened=[];done=new Set();tries=0;draw();};
 c.addEventListener('click',e=>{if(e.target.dataset.a==='new')return init();const i=+e.target.dataset.i;if(isNaN(i)||done.has(i)||opened.includes(i)||opened.length===2)return;opened.push(i);if(opened.length===2){tries++;const[x,y]=opened;if(a[x]===a[y]){done.add(x);done.add(y);opened=[];}else wait=setTimeout(()=>{opened=[];draw();},800);}draw();});win.clean.push(()=>clearTimeout(wait));init();}}));
})();
