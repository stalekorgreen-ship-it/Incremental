const run=require('./balance.js');const E=require('../src/engine.js');const out=[];
for(const early of [.003,.004,.005])for(const eu of [800,1500])for(const k of [.00128,.00132,.00136,.0014]){const o={early,eu,k};const a=run(3,true,1,o),m=run(30,true,1,o),l=run(200,false,1,o),n=run(10,false,1,o);if(a.hit>72&&a.hit<90&&!l.hit&&!n.hit&&l.users<4.8e6)out.push([early,eu,k,a.hit,m.hit,l.users,n.users].join(' '))}
console.log(out.join('\n'));
