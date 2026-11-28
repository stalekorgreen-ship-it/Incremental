// автотестер: тысячи схем на одном и том же снимке мира, без прокрутки времени
const M=require('./sim.js');
const SLOT=i=>'s'+i;
// ——— схема как дерево: ['all'] | ['m',дерево,источник,'yes'|'no'] | ['l',режим,a,b] | ['r',дерево,[[источник,вес]],mix,pop,fresh]
function compile(tree,lv=14){const G=M.start(),memo=new Map(),sigs={};const add=(type,p)=>{const id='n'+G.seq++;G.nodes.push({id,type,x:0,y:0,lv,p:{...(M.B[type].p||{}),...p}});return id;};
 const sig=s=>sigs[s]||(sigs[s]=add('signal',{src:s}));const w=(a,ap,b,bp)=>{if(!M.connect(G,a,ap,b,bp))throw Error('нет связи '+ap+' '+bp);};
 const go=t=>{const key=JSON.stringify(t);if(memo.has(key))return memo.get(key);let r;
  if(t[0]==='all')r=[add('all'),'posts'];
  else if(t[0]==='m'){const a=go(t[1]),n=add('match');w(a[0],a[1],n,'posts');w(sig(t[2]),'v',n,'sig');r=[n,t[3]];}
  else if(t[0]==='l'){const a=go(t[2]),b=go(t[3]),n=add('lists',{mode:t[1]});w(a[0],a[1],n,'a');w(b[0],b[1],n,'b');r=[n,'out'];}
  else{const a=go(t[1]),n=add('rank',{mix:t[3]?1:0,pop:t[4]??1,fresh:t[5]??.5});w(a[0],a[1],n,'posts');t[2].forEach(([s,wt],i)=>{w(sig(s),'v',n,SLOT(i+1));G.nodes.find(x=>x.id===n).p['w'+(i+1)]=wt;});r=[n,'out'];}
  memo.set(key,r);return r;};
 const end=go(tree),f=add('feed');w(end[0],end[1],f,'posts');return G;}
const ALL=['all'],match=(t,s,p='yes')=>['m',t,s,p],minus=(t,s)=>['l','−',t,match(t,s)],clean=(...s)=>s.reduce(minus,ALL),rank=(t,l,mix=0,pop=1,fresh=.5)=>['r',t,l,mix,pop,fresh],zip=(...a)=>a.reduce((x,y)=>['l','+',x,y]),then=(...a)=>a.reduce((x,y)=>['l','>',x,y]);
// ——— снимки мира: прогреваем обычной лентой, берём три разных часа
function snaps(srcs,seeds=[1,2,3,4]){return seeds.map((seed,k)=>{const S=M.init(seed);S.quest=99;for(const i of M.SOURCES)S.src[i.id]=0;for(const i of srcs)S.src[i]=3;S.lv.servers=30;const warm=compile(rank(clean('history','nope').slice(),[['watch',2]],1));for(let t=0;t<330+k*77;t++)M.step(S,warm);return S;});}
// сколько людей из 48 довольны (среднее по снимкам)
function score(tree,world,pack){let G;try{G=compile(tree);}catch(e){return -1;}let ok=0;for(const S of world){const ctx=M.ctxOf(S);for(const p of S.people){const f=M.feedFor(S,G,p,ctx);if(f.own>=10&&pack.ok(S,p,f.list.slice(0,10),f.list))ok++;}}return ok/world.length;}
// ——— случайные схемы
function rng(seed){let x=seed||1;return n=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x%n;};}
const WT=[-3,-2,-1,.5,1,1.5,2,3,4];
const headOn=(r,pool)=>{const base=[ALL,clean('history'),clean('history','nope')][r(3)];const l=pool.filter(()=>r(10)<7).map(s=>[s,WT[r(WT.length)]]);return rank(base,l.length?l:[[pool[0],2]],r(2),[0,1,2][r(3)],[0,.5,1,2][r(4)]);};
function randomTree(r,pool,depth){const k=depth<=0?(r(3)?0:3):r(10);if(k===0)return[ALL,clean('history'),clean('history','nope')][r(3)];
 if(k<=2)return match(randomTree(r,pool,depth-1),pool[r(pool.length)],r(5)?'yes':'no');
 if(k<=5)return['l',['+','+','>','−'][r(4)],randomTree(r,pool,depth-1),randomTree(r,pool,depth-1)];
 const n=1+r(3);return rank(randomTree(r,pool,depth-1),[...Array(n)].map(()=>[pool[r(pool.length)],WT[r(WT.length)]]),r(2),r(2),[0,.5,1][r(3)]);}
// подкрутка: меняем веса и галочки у лучших найденных
function mutate(t,r,pool){if(t[0]==='all')return t;if(t[0]==='m')return['m',mutate(t[1],r,pool),t[2],t[3]];if(t[0]==='l')return['l',t[1],mutate(t[2],r,pool),mutate(t[3],r,pool)];
 let l=t[2].map(([s,w])=>[s,r(4)?w:WT[r(WT.length)]]);if(!r(6))l=[...l,[pool[r(pool.length)],WT[r(WT.length)]]];if(l.length>1&&!r(8))l.splice(r(l.length),1);return['r',mutate(t[1],r,pool),l,r(6)?t[3]:1-t[3],r(6)?t[4]:r(3),r(6)?t[5]:[0,.5,1,2][r(4)]];}
function search(world,pack,pool,gen,n,climb,seed){const r=rng(seed),seen=[];let passes=[];for(let i=0;i<n;i++){const t=gen(r,pool);seen.push([score(t,world,pack),t]);}seen.sort((a,b)=>b[0]-a[0]);const first=seen.map(s=>s[0]);let top=seen.slice(0,6);for(let i=0;i<climb;i++){const t=mutate(top[r(top.length)][1],r,pool),s=score(t,world,pack);if(s>top[top.length-1][0]){top[top.length-1]=[s,t];top.sort((a,b)=>b[0]-a[0]);}}return{best:top[0],first};}
function describe(t){if(t[0]==='all')return'Все';if(t[0]==='m')return`${describe(t[1])} ▸${t[3]==='yes'?'':'не '}${t[2]}`;if(t[0]==='l')return`(${describe(t[2])} ${t[1]} ${describe(t[3])})`;return`Оценка[${t[2].map(x=>x.join(':')).join(' ')}${t[3]?' разные':''}](${describe(t[1])})`;}
module.exports={compile,snaps,score,search,headOn,randomTree,mutate,rng,describe,ALL,match,minus,clean,rank,zip,then};
// «умный игрок»: несколько веток (фильтр + оценка), сложенных в разном порядке
function branches(r,pool){const C=clean('history','nope');const leaf=()=>{let t=C;const k=r(5);if(k>0)t=match(t,pool[r(pool.length)],k===4?'no':'yes');if(!r(3))t=minus(t,pool[r(pool.length)]);const extra=r(2)?[[pool[r(pool.length)],[-3,1,2,3][r(4)]]]:[];return rank(t,[['watch',2],...extra],r(4)?0:1,r(3)?1:2,[0,.5,1][r(3)]);};
 let list=[...Array(2+r(3))].map(leaf);while(list.length>1){const i=r(list.length),a=list.splice(i,1)[0],j=r(list.length),b=list.splice(j,1)[0];list.push(['l',r(6)?'+':'>',a,b]);}return list[0];}
function mutate2(t,r,pool){if(!r(7))return branches(r,pool);if(t[0]==='l'){if(!r(8))return['l',t[1],t[3],t[2]];if(!r(10))return['l','+',t,rank(clean('history','nope'),[['watch',2],[pool[r(pool.length)],2]])];return r(2)?['l',t[1],mutate2(t[2],r,pool),t[3]]:['l',t[1],t[2],mutate2(t[3],r,pool)];}
 if(t[0]==='r'){if(!r(3)){const b=branches(r,pool);return b[0]==='l'?b[2]:b;}return mutate(t,r,pool);}return t;}
function smart(world,pack,pool,n,climb,seed,starts=[]){const r=rng(seed);let top=starts.map(t=>[score(t,world,pack),t]);for(let i=0;i<n;i++){const t=branches(r,pool);top.push([score(t,world,pack),t]);}top.sort((a,b)=>b[0]-a[0]);top=top.slice(0,8);for(let i=0;i<climb;i++){const t=mutate2(top[r(top.length)][1],r,pool);if(JSON.stringify(t).length>2500)continue;const s=score(t,world,pack);if(s>=top[7][0]&&!top.some(x=>JSON.stringify(x[1])===JSON.stringify(t))){top[7]=[s,t];top.sort((a,b)=>b[0]-a[0]);}}return top[0];}
module.exports.branches=branches;module.exports.smart=smart;
