const E=require('../src/engine.js');const S=E.fresh(),f=E.first('feed');E.connect(E.first('src').id,0,f.id,0);E.connect(E.first('net').id,0,f.id,1);let out=[],stall=0;
for(let i=1;i<=1200;i++){E.tick(.5);if(!stall&&f.eff<1)stall=i/2;if(f.eff<1){const n=E.buy('net');if(n)E.connect(n.id,0,f.id,1)}if(i%120===0)out.push([i/2,S.users|0,S.money|0,f.eff.toFixed(2)].join('/'))}
console.log('первый затор на',stall,'с; сек/люди/деньги/лента:',out.join('  '));
