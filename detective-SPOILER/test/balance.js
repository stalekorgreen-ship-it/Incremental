const E=require('../src/engine.js');
let sd=1;Math.random=()=>(sd=(sd*16807)%2147483647)/2147483647;
function run(every,words,seed,over){sd=seed;Object.assign(E.BAL,over||{});const S=E.fresh();const f=E.first('feed'),src=E.first('src');
 E.connect(src.id,0,f.id,0);E.connect(E.first('net').id,0,f.id,1);let hit=0,marks=[],maxMoney=0;
 const port={net:1,cpu:1};
 function feedRes(target,kind){const d=E.need(target);if(!d||E.res(target,kind)>=d.v)return false;
  const own=E.into(target.id,E.T[target.k].i.indexOf(kind)).map(w=>E.byId(w.a)).sort((a,b)=>a.lvl-b.lvl);
  const up=own[0],pn=E.price(kind);
  if(up&&(E.upPrice(up)/E.give(up)<pn/10||own.length>=4))return E.upgrade(up);
  const n=E.buy(kind);if(n){E.connect(n.id,0,target.id,E.T[target.k].i.indexOf(kind));return true}return false}
 for(let i=1;i<=100*E.DAY*2;i++){E.tick(.5);
  if(i%(every*2)===0){for(let j=0;j<6;j++)feedRes(f,'net');
   if(S.t>=180&&!E.first('sort')){const s=E.buy('sort');if(s){const c=E.buy('cpu')||E.add('cpu');E.connect(c.id,0,s.id,1);E.connect(src.id,0,s.id,0);E.connect(s.id,0,f.id,0)}}
   const s=E.first('sort');if(s)for(let j=0;j<4;j++)feedRes(s,'cpu');
   if(s&&!E.first('likes'))E.buy('likes');const l=E.first('likes');if(l)feedRes(l,'net');
   E.buy('rate');E.buyAlgo();if(words&&S.t>300)for(const k in S.taste){if(S.taste[k]>.3)S.rules[k]='up';if(S.taste[k]<-.3)S.rules[k]='down'}}
  if(!hit&&S.users>=E.GOAL)hit=S.t/E.DAY;if(i%(E.DAY*2*10)===0)marks.push(Math.round(S.users));maxMoney=Math.max(maxMoney,S.money)}
 return{hit:+hit.toFixed(1),users:Math.round(S.users),nodes:S.nodes.length,algo:S.algo,marks}}
if(require.main===module){const over=process.argv[2]?JSON.parse(process.argv[2]):null;
 for(const [name,ev,w] of [['активный',3,true],['средний',30,true],['без слов',10,false],['ленивый',200,false]])for(const sd_ of [1,7,99]){const r=run(ev,w,sd_,over);console.log(name,sd_,'5 млн на дне:',r.hit||'—','итого',r.users,'блоков',r.nodes,'ступеней',r.algo);if(sd_===1)console.log('   по 10 дней:',r.marks.join(' '))}}
module.exports=run;
