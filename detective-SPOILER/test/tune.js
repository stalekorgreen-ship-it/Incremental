const run=require('./balance.js');const out=[];
for(const k of [.0013,.00138,.00145,.00155])for(const [income,ie] of [[.1,.55],[.08,.58],[.1,.6],[.06,.6],[.12,.5],[.06,.65]])for(const step of [2.6,3.2]){const o={p:.45,k,income,ie,step,u0:1500};let ok=true,r=[];for(const s of [1,7,99]){const a=run(3,true,s,o),m=run(30,true,s,o),l=run(200,false,s,o);if(!(a.hit&&a.hit<92&&m.hit&&m.hit<97&&!l.hit)){ok=false;break}r.push(a.hit,m.hit,Math.round(l.users/1e5)/10)}if(ok)out.push([income,ie,step,k,r.join(' '),'без слов '+(run(10,false,1,o).hit||'—')])}
console.log(out.map(r=>r.join(' | ')).join('\n'));
