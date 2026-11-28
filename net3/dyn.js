// второй этап: схема сама живёт в мире — сама наполняет историю показов и вычерпывает редкие посты
const M=require('./sim.js'),A=require('./auto.js'),REFS=require('./refs.js'),fs=require('fs');
const ID=process.argv[2],i=M.QUESTS.findIndex(q=>q.id===ID),q=M.QUESTS[i];
function dyn(tree,seeds,warm=150,len=90){let G;try{G=A.compile(tree);}catch(e){return{n:-1,sec:0,own:0};}let n=0,sec=0,own=0,c=0;for(const seed of seeds){const S=M.init(seed);for(let k=0;k<i;k++)for(const s of M.QUESTS[k].srcs||[])S.src[s]=3;S.quest=i;for(const s of q.srcs)S.src[s]=q.level;S.lv.servers=30;for(let t=0;t<warm+len;t++){M.step(S,G);S.quest=i;S.hold=0;if(t>=warm&&t%5===0){n+=S.people.filter(p=>p.pk).length;sec+=S.sec;own+=S.people.filter(p=>p.own>=12).length;c++;}}}return{n:n/c,sec:sec/c,own:own/c};}
// очки: довольные люди, а без полной ленты и минимального времени схема не засчитывается
const val=d=>d.n-Math.max(0,43-d.own)*2.5-Math.max(0,250-d.sec)*.05;
const pool=[...q.srcs,...(ID==='trace'?['search']:[]),...(ID==='thin'?['subs']:[]),'watch','nope','history','skip','blocks'].filter((v,k,a)=>a.indexOf(v)===k);
// варианты баз: с историей и без неё
function swap(t,r){if(t[0]==='all')return t;if(t[0]==='l'&&t[1]==='−'&&JSON.stringify(t[3]).includes('"history"')&&t[3][0]==='m'&&t[3][2]==='history'){return r(2)?swap(t[2],r):['l','−',swap(t[2],r),t[3]];}if(t[0]==='m')return['m',swap(t[1],r),t[2],t[3]];if(t[0]==='l')return['l',t[1],swap(t[2],r),swap(t[3],r)];return['r',swap(t[1],r),...t.slice(2)];}
const strip=t=>swap(t,()=>0),r=A.rng(77+i);
const H=Object.assign({},...fs.readdirSync('.').filter(f=>/^hold_.*\.json$/.test(f)).sort((a,b)=>fs.statSync(a).mtimeMs-fs.statSync(b).mtimeMs).map(f=>JSON.parse(fs.readFileSync(f))));
function climb(starts,gen,iters,budget){const t0=Date.now();let top=starts.map(t=>({t,v:val(dyn(t,[5],110,60))})).sort((a,b)=>b.v-a.v).slice(0,6);for(let k=0;k<iters&&Date.now()-t0<budget;k++){const base=top[r(Math.min(top.length,r(2)?2:6))].t,t=gen(base);if(JSON.stringify(t).length>2200)continue;const v=val(dyn(t,[5],110,60));if(v>top[top.length-1].v&&!top.some(x=>JSON.stringify(x.t)===JSON.stringify(t))){top.push({t,v});top.sort((a,b)=>b.v-a.v);top=top.slice(0,6);}}
 return top.map(x=>({t:x.t,v:val(dyn(x.t,[61,62]))})).sort((a,b)=>b.v-a.v)[0].t;}
const ms=+(process.env.MS||60000);
const ref=REFS[ID](),sm=H[ID].smartTree;
const branch=climb([ref,strip(ref),sm,strip(sm),...[...Array(10)].map(()=>swap(A.branches(r,pool),r))],t=>{const k=r(6);return k===0?swap(t,r):k===1?swap(A.branches(r,pool),r):swap2(t);},2000,ms*1.4);
function swap2(t){const R=A.rng(1+r(1e9));return A.mutate(t,R,pool);}
const headStarts=[H[ID].headTree,strip(H[ID].headTree),...[...Array(24)].map(()=>swap(A.headOn(r,pool),r))];
const head=climb(headStarts,t=>{const k=r(3);return k===0?swap(A.headOn(r,pool),r):swap(A.mutate(t,A.rng(1+r(1e9)),pool),r);},2000,ms);
const T=[81,82,83,84],b=dyn(branch,T),h=dyn(head,T),f=dyn(ref,T);
fs.writeFileSync(`dyn_${ID}.json`,JSON.stringify({branch,head,b,h,f}));
const s=d=>`${d.n.toFixed(1)} чел, полная лента у ${d.own.toFixed(0)}, время ${d.sec.toFixed(0)} с`;
console.log(`${ID}\n  ветки: ${s(b)}\n  лоб:   ${s(h)}\n  эталон:${s(f)}\n  схема: ${A.describe(branch)}`);
