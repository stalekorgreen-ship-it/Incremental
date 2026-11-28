// ищем на одних мирах, проверяем на других, которых поиск не видел
const M=require('./sim.js'),A=require('./auto.js'),PK=require('./packs.js')(M,M.H),REFS=require('./refs.js'),fs=require('fs');
const N=+(process.env.N||150);const out={};
for(const q of PK){if(process.argv.length>2&&!process.argv.includes(q.id))continue;const pool=[...q.srcs,...(q.uses||[]),'watch','nope','history','skip','blocks'].filter((v,i,a)=>a.indexOf(v)===i);
 const W=A.snaps(pool),T=A.snaps(pool,[21,22,23,24,25,26]);
 const head=A.search(W,q,pool,A.headOn,N*2,N*2,101)['best'][1],sm=A.smart(W,q,pool,N,N*4,202,[REFS[q.id]()])[1];
 out[q.id]={head:A.score(head,T,q),smart:A.score(sm,T,q),ref:A.score(REFS[q.id](),T,q),headTree:head,smartTree:sm};
 console.log(q.id,'на новых мирах: в лоб',out[q.id].head.toFixed(1),'| ветки',out[q.id].smart.toFixed(1),'| простой эталон',out[q.id].ref.toFixed(1));}
fs.writeFileSync(`hold_${process.argv[2]||'all'}.json`,JSON.stringify(out));
