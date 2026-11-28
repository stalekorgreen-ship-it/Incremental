// звуки и праздник (как в net3/juice.js)
let muted=false;try{muted=localStorage.getItem('lentaos95-mute')==='1';}catch(e){}
let actx=null;
const TUNES={wire:[[660,0,.07],[990,.05,.1]],add:[[330,0,.07]],del:[[220,0,.08],[160,.06,.1]],buy:[[523,0,.08],[784,.07,.14]],mile:[[784,0,.1],[1046,.09,.2]],win:[[523,0,.14],[659,.11,.14],[784,.22,.14],[1046,.33,.45]]};
function sound(k){if(muted||(HOST&&HOST.muted))return;try{if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume();
 for(const[f,at,len]of TUNES[k]){const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+at;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+len);}}catch(e){}}
function celebrate(title,sub){sound('win');const d=document.createElement('div');d.className='party';const col=['#ff3b6b','#ffd400','#2ee66b','#2aa8ff','#c36bff','#fff'];
 let bits='';for(let i=0;i<70;i++)bits+=`<i style="left:${(i*37)%100}%;background:${col[i%col.length]};animation-delay:${(i%14)*.05}s;animation-duration:${1.4+(i%7)*.18}s"></i>`;
 d.innerHTML=bits+`<div><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;document.body.append(d);setTimeout(()=>d.remove(),2800);}
