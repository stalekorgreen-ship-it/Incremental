// сквозное прохождение с настоящими деньгами: схема меняется на каждом испытании, прокачка только на заработанное
const M=require('./sim.js'),A=require('./auto.js'),R=require('./ref.js'),fs=require('fs');
function early(i){const b=R.B();if(i===0)return b.end([b.all,'posts']);if(i===1)return b.end(b.rank(b.clean(['history','blocks','nope']),[['watch',2]]));
 if(i===2){const c=b.clean(['history','nope']),x=b.rank(b.match(c,'subs'),[['watch',2]]),y=b.rank(b.match(c,'comm'),[['watch',2]]),z=b.rank(c,[['watch',2],['search',1]]);return b.end(b.lists(z,b.lists(x,y,'+'),'+'));}
 const c=b.clean(['history','nope']),t=b.rank(b.match(c,'trip'),[['watch',2]]),h=b.rank(b.match(c,'ip'),[['watch',2]]),g=b.rank(c,[['watch',2]]);return b.end(b.lists(b.lists(t,h,'>'),g,'+'));}
for(const seed of[1,2]){const S=M.init(seed),log=[];let ok=true;for(let i=0;i<M.QUESTS.length&&ok;i++){const q=M.QUESTS[i];const G=i<4?early(i):A.compile(JSON.parse(fs.readFileSync(`dyn_${q.id}.json`)).branch,0);for(const n of G.nodes)n.lv=0;const t0=S.t;
  while(S.quest===i&&S.t-t0<2400){M.step(S,G);if(S.t%5===0){if(M.powerLoad(S,G)>M.powerCap(S))M.buy(S,'servers');if(S.jam)M.upgrade(S,G,S.jam.id);if(S.t-t0>240){for(const s of q.srcs||[])if(S.src[s]<6)M.buySource(S,s);}}}
  if(S.quest===i){ok=false;log.push(`${q.id} ЗАСТРЯЛ: ${q.checks(S,G).filter(c=>!c.ok).map(c=>c.label).join('; ')}`);}else log.push(`${q.id} ${((S.t-t0)/60).toFixed(1)}м`);}
 console.log('мир',seed,ok?'ВСЁ ПРОЙДЕНО':'', (S.t/60|0)+' мин,',log.join(' | '),'| денег',Math.round(S.money));}
