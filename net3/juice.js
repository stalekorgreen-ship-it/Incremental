// ——— отдача и удобства: звуки, праздник, отмена, первые шаги, выход из тупика
const SKIP_AFTER=420;// столько секунд игрового времени на испытании, и появляется «Пропустить»
let muted=false;try{muted=localStorage.getItem('lentaos95-mute')==='1';}catch(e){}
let actx=null;
const TUNES={wire:[[660,0,.07],[990,.05,.1]],add:[[330,0,.07]],del:[[220,0,.08],[160,.06,.1]],buy:[[523,0,.08],[784,.07,.14]],mile:[[784,0,.1],[1046,.09,.2]],win:[[523,0,.14],[659,.11,.14],[784,.22,.14],[1046,.33,.45]]};
function sound(k){if(muted||(HOST&&HOST.muted))return;try{if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume();
 for(const[f,at,len]of TUNES[k]){const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+at;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+len);}}catch(e){}}
function celebrate(title,sub){sound('win');const d=document.createElement('div');d.className='party';const col=['#ff3b6b','#ffd400','#2ee66b','#2aa8ff','#c36bff','#fff'];
 let bits='';for(let i=0;i<70;i++)bits+=`<i style="left:${(i*37)%100}%;background:${col[i%col.length]};animation-delay:${(i%14)*.05}s;animation-duration:${1.4+(i%7)*.18}s"></i>`;
 d.innerHTML=bits+`<div><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;document.body.append(d);setTimeout(()=>d.remove(),2800);}
// ——— отмена: запоминаются блоки и провода; купленные уровни не откатываются
let past=[];
function remember(refund){past.push({g:JSON.stringify({nodes:G.nodes,wires:G.wires}),refund:refund||0});if(past.length>40)past.shift();undoButton();}
function undo(){const s=past[past.length-1];if(!s)return;if(s.refund>S.money){toast('Не отменить','Деньги за прокачку этого блока уже потрачены.');return;}past.pop();
 const old=JSON.parse(s.g),now=new Map(G.nodes.map(n=>[n.id,n]));for(const n of old.nodes){const c=now.get(n.id);if(c){n.lv=c.lv;n.spent=c.spent;}}
 G.nodes=old.nodes;G.wires=old.wires;S.money-=s.refund;note('undo');sound('del');changed();undoButton();}
function undoButton(){const b=$('#b-undo');if(b)b.disabled=!past.length;}
// ——— первые шаги: подсвечивается то, что нажать сейчас
function guide(){$$('.glow').forEach(e=>e.classList.remove('glow'));const box=$('#guide');let text='',els=[];
 if(S.quest===0&&page==='work'){const a=G.nodes.find(n=>n.type==='all'),f=G.nodes.find(n=>n.type==='feed'),port=(n,d)=>nel(n.id)&&nel(n.id).querySelector(`.port[data-dir="${d}"] b`);
  if(!a){text='Шаг 1 из 3. Нажми внизу «Все посты».';els=[$('#dock [data-add="all"]')];}
  else if(!f){text='Шаг 2 из 3. Теперь нажми «Личная лента».';els=[$('#dock [data-add="feed"]')];}
  else if(!G.wires.some(w=>w[2]===f.id)){text='Шаг 3 из 3. Нажми на кружок справа у «Всех постов», потом на кружок слева у ленты.';els=[port(a,'out'),port(f,'in')];}
  else text='Готово! Люди уже читают. Подожди пару секунд.';}
 els.forEach(e=>e&&e.classList.add('glow'));if(box.textContent!==text)box.textContent=text;box.classList.toggle('on',!!text);}
// ——— у кого не выходит
function failing(){const q=M.QUESTS[S.quest];if(!q)return[];return S.people.filter(p=>q.pred?!p.pk:p.own<12||!!(q.good&&!q.good(p)));}
function nextFailing(){const l=failing();if(!l.length)return;const p=l.find(p=>p.i>who)||l[0];pickPerson(p.i);$('#who').value=who;note('fail-look');update();}
function helpHTML(){const q=M.QUESTS[S.quest];if(!q)return'';const n=failing().length,stuck=S.t-(S.questAt||0)>=SKIP_AFTER&&M.QUESTS[S.quest+1];
 return(n&&G.wires.length?`<div class="helprow"><button data-q="next">🔍 У кого не выходит (${n})</button><button data-q="feed">Лента выбранного</button></div>`:'')+(stuck?`<div class="helprow"><button data-q="skip">${skipArm===S.quest?'Точно? Награды не будет':'Застрял? Пропустить испытание'}</button></div>`:'');}
let skipArm=-1;
$('#q-b').addEventListener('click',e=>{const k=e.target.dataset&&e.target.dataset.q;if(!k)return;
 if(k==='next')nextFailing();else if(k==='feed')go('feed');else if(skipArm!==S.quest){skipArm=S.quest;update();}else{note('skip',S.quest);skipArm=-1;M.skip(S);toast('Испытание пропущено','К нему можно вернуться, начав игру заново.');render();update();save();}});
