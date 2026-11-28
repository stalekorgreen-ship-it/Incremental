// проверки пробы: node test.js
const L=require('./live.js'),{scheme,B}=require('./refs.js'),assert=require('assert');let n=0;const ok=(v,m)=>{n++;assert(v,m);};
function play(o,rounds=240,seeds=[1,2]){let sum=0,load=0;for(const s of seeds){const W=L.init(s),G=typeof o==='function'?o():scheme(o);for(let i=0;i<rounds;i++)L.step(W,G);sum+=L.result(W,60);load=W.load;}return{score:sum/seeds.length,load};}
const rnd=play({random:1}),blind=play({words:1}),w=play({words:1,trial:1}),w3=play({words:1,trial:3}),q0=play({words:1,trial:1,quality:1,keep:0}),q=play({words:1,trial:1,quality:1,keep:.3}),
 raw=play({words:1,trial:1,residual:1}),good=play({words:1,trial:1,residual:1,slim:6,pforget:10,forget:5});
ok(Math.abs(rnd.score)<.08,'случайно ≈ 0');ok(blind.score<0,'без проб сеть слепа');ok(w.score>.45,'слова + проба');ok(w.score>w3.score+.1,'слишком много проб хуже');
ok(q0.score<.25,'выкидывать новые посты нельзя');ok(q.score>w.score,'качество помогает');ok(raw.load>L.BUDGET&&raw.score<w.score-.2,'память без забывания не влезает');ok(good.load<=L.BUDGET*1.05&&good.score>raw.score+.25,'забывание спасает');
// память: накапливает, забывает, провод из неё назад — не круг
{const b=B(),r=b.src('Реакции'),m=b.mem(r,'человек',null,'доля','sum',0,'вес'),again=b.join(r,m,'человек'),m2=b.mem(again,'пост',null,'вес','last',0,'x');const G={nodes:b.G.nodes,wires:[]};for(const[f,t,p]of b.G.wires)ok(L.connect(G,f,t,p),'соединяется');ok(L.connect(G,again,m,'a'),'в память можно вести назад');
 const j2=b.add('calc',{a:'вес',op:'+',b:'#',num:1},again),j3=b.add('calc',{a:'вес',op:'+',b:'#',num:1},j2);G.wires=[];L.connect(G,j2,j3,'a');ok(!L.connect(G,j3,j2,'a'),'круг без памяти нельзя');}
// никому не показывают один пост дважды, мест не больше пяти; пустая и недособранная схема не роняет расчёт
{const W=L.init(5),G=scheme({words:1,trial:1}),seen=new Set();for(let i=0;i<100;i++){L.step(W,G);W.shown.forEach((l,p)=>{ok(l.length<=L.SLOTS,'мест');for(const x of l){ok(!seen.has(p+':'+x.post),'повтор');seen.add(p+':'+x.post);}});}
 const E=L.init(5);L.step(E,{nodes:[],wires:[]});for(const t of['src','join','group','top','filter','calc','rand','mem','show']){L.step(E,{nodes:[{id:'a',type:t,p:{}}],wires:[]});n++;}}
console.log(Object.entries({rnd,blind,w,w3,q0,q,raw,good}).map(([k,v])=>k+' '+Math.round(v.score*100)+'%').join(' · '));console.log('проверок',n,'— всё прошло');
