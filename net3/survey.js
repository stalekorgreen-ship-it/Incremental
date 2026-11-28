const M=require('./sim.js'),A=require('./auto.js'),PK=require('./packs.js')(M,M.H),REFS=require('./refs.js');
const only=process.argv.slice(2),N=+(process.env.N||300);
for(const q of PK){if(only.length&&!only.includes(q.id))continue;const pool=[...q.srcs,...(q.uses||[]),'watch','nope','history','skip','blocks'].filter((v,i,a)=>a.indexOf(v)===i);const W=A.snaps(pool);const t0=Date.now();
 const ref=A.score(REFS[q.id](),W,q);const refT=A.search(W,q,pool,()=>REFS[q.id](),1,N,3);
 const head=A.search(W,q,pool,A.headOn,N,N,11);const rnd=A.search(W,q,pool,(r,p)=>A.randomTree(r,p,4),N*2,0,23);
 const sm=A.smart(W,q,pool,N,N*4,5,[REFS[q.id]()]);
 console.log(`${q.id}: эталон ${ref.toFixed(1)} (подкрученный ${refT.best[0].toFixed(1)}) | ветки ${sm[0].toFixed(1)} | в лоб ${head.best[0].toFixed(1)} | случайные: лучший ${rnd.best[0].toFixed(1)}, медиана ${rnd.first[N].toFixed(1)}  ${((Date.now()-t0)/1000|0)}с`);
 console.log('    лоб:',A.describe(head.best[1]));console.log('    ветки:',A.describe(sm[1]));}
