// проверки ядра, заданий и заказов: node test.js
const C=require('./core.js'),R=require('./refs.js'),Q=require('./goals.js'),assert=require('assert');
let checks=0;const ok=(v,m)=>{checks++;assert(v,m);};
// ——— блоки на маленьких таблицах
{const src={key:'x',a:{cols:['k','n'],rows:[['а',1],['а',3],['б',5]]},b:{cols:['k','m'],rows:[['а',10],['в',0]]}};
 const one=(type,p,...ins)=>{const b=R.B(),ids=ins.map(t=>b.src(t));const id=b.G.nodes.length;const n={id:'z',type,p,lv:0};b.G.nodes.push(n);ids.forEach((f,i)=>C.connect(b.G,f,'z',C.BLOCKS[type].ins[i][0]));return C.run(b.G,src).z;};
 ok(JSON.stringify(one('join',{},'a','b').table.rows)==='[["а",1,10],["а",3,10]]','склейка');
 ok(JSON.stringify(one('group',{by1:'k',agg:'avg',col:'n'},'a').table.rows)==='[["а",2],["б",5]]','среднее');
 ok(one('top',{sort:'n',n:1,per:'k'},'a').table.rows.length===2,'первые в группах');
 ok(one('filter',{col:'n',op:'>',val:'2'},'a').table.rows.length===2,'отбор');
 ok(one('filter',{col:'n',op:'≥',val:'2,5'},'a').table.rows.length===2,'запятая в числе');
 ok(one('calc',{a:'n',op:'÷',b:'#',num:0},'a').table.rows[0][2]===0,'деление на ноль даёт 0');
 for(const[t,p,m]of[['calc',{},'выбери'],['filter',{col:'n'},'впиши'],['filter',{col:'n',val:'кот'},'число'],['group',{},'выбери'],['group',{by1:'k',agg:'sum',col:'k'},'не числа'],['top',{sort:'zz'},'нет столбца']])ok(String(one(t,p,'a').err).includes(m),t+' ошибка понятна: '+one(t,p,'a').err);
 const big={key:'y',a:{cols:['k'],rows:Array.from({length:400},()=>['а'])},b:{cols:['k'],rows:Array.from({length:400},()=>['а'])}};const b=R.B(),j=b.join(b.src('a'),b.src('b'));ok(C.run(b.G,big)[j].err.includes('больше'),'взрыв склейки остановлен');
 const g=R.B(),x=g.src('a'),y=g.calc(x,'n','+',1),z=g.calc(y,'n','+',1);ok(!C.connect(g.G,z,y,'a'),'круг не соединяется');}
// ——— каждое задание решается эталоном; прошлый эталон не решает
const SOL=[ // [схема, уровень разметки, уровень журнала]
 {id:'t1',m:()=>R.scheme(1),l:0},{id:'t2',m:()=>R.scheme(2),l:0},{id:'t3',a:true,l:0},{id:'t4',m:()=>R.scheme(3),l:0},{id:'t5',a:true,l:0},{id:'t6',m:()=>R.scheme(4),l:1},{id:'t7',m:()=>R.scheme(5),l:2},
 {id:'v1',a:true,l:2},{id:'v2',a:true,l:2},{id:'v3',m:()=>R.scheme(5,{}),l:2,j:0},{id:'v4',m:()=>R.scheme(5,{author:1}),l:2,j:1},{id:'v5',m:()=>R.scheme(5,{author:1,length:1,smooth:1}),l:2,j:2},{id:'v6',m:()=>R.scheme(5,{author:1,length:1,recent:1}),l:4,j:5}];
const SEEDS=[Q.SEED];// мир у всех один: пороги заданий проверяются на нём
const OTHER=[1,7,42,99,2024,31337];
const fails={};
for(const seed of SEEDS)SOL.forEach((s,i)=>{const g=Q.GOALS[i];ok(g.id===s.id,'порядок');const S=C.init(seed);S.goal=i;S.lv.labels=s.l;S.lv.journal=s.j||0;
 let G;if(s.id==='v2'){const b=R.B(),th=R.topics(b,4),v=b.calc(b.join(b.src('Просмотры'),b.src('Посты'),'пост'),'секунд','÷','длина','доля'),id=b.group(b.join(v,th,'пост'),['человек','тема'],'avg','доля','вкус');b.out(th,'topics',{});b.out(id,'answer',{});G=b.G;// свой, не эталонный, определитель тем
 }else if(s.a){const b=R.B(),id=g.ref(b),t=C.run(b.G,C.sourcesOf(S))[id].table,map={};g.fields.forEach((f,k)=>map[f]=t.cols.includes(f)?f:t.cols[k]);b.out(id,'answer',map);G=b.G;}else G=s.m();
 const m=C.measure(S,G),st=g.check(S,G,m.R);if(!st.done){(fails[g.id]=fails[g.id]||[]).push(seed+' '+st.text);}
 // предыдущее решение не должно проходить это задание на тех же покупках
 if(i&&!s.a&&!['t6','t7'].includes(s.id)){const prev=SOL.slice(0,i).reverse().find(x=>x.m);if(prev){const S2=C.init(seed);S2.lv.labels=s.l;S2.lv.journal=s.j||0;C.measure(S2,prev.m());if(g.check(S2).done)(fails[g.id+' слишком легко']=fails[g.id+' слишком легко']||[]).push(seed);}}
 // неверный ответ не засчитывается
 if(s.a){const b=R.B(),w=b.src('Просмотры');b.out(w,'answer',Object.fromEntries(g.fields.map((f,k)=>[f,['человек','пост','день','секунд'][k]])));ok(!g.check(S,b.G,C.run(b.G,C.sourcesOf(S))).done,'неверный ответ '+g.id);}});
if(Object.keys(fails).length)console.log('не сошлось:',JSON.stringify(fails,null,1));
ok(!Object.keys(fails).length,'задания');
// ——— заказы: каждый вид на каждом уровне данных решаем, не пуст и не решается «просто таблицей»
let kinds=0;
for(const d of Q.ORDERS){for(let v=0;v<6;v++){const S=C.init(OTHER[v]);S.lv.labels=v%4;S.lv.journal=v%4;const p=d.p(k=>[0,.999,.5,.2,.7,.35][v]),o={id:v,k:d.id,p,tier:d.tier};
 const b=R.B(),id=d.r(b,p),res=C.run(b.G,C.sourcesOf(S)),t=res[id].table;ok(t&&t.rows.length>0,'заказ пуст '+d.id+JSON.stringify(p)+res[id].err);ok(t.cols.length>=d.f.length,'столбцы '+d.id);
 const P=Q.project(t,d.f),map={};d.f.forEach(f=>map[f]=t.cols.includes(f)&&d.f.every(g=>t.cols.includes(g))?f:t.cols[d.f.indexOf(f)]);
 b.out(id,'answer',map);const res2=C.run(b.G,C.sourcesOf(S)),a=Q.answerOf(b.G,res2,d.f);ok(Q.compare(P,a.rows).done,'сам себя '+d.id);
 ok(Q.orderCheck(S,o,b.G,res2).done===true,'заказ засчитан '+d.id+' '+Q.orderCheck(S,o,b.G,res2).text);
 ok(!Q.compare(P,a.rows.slice(1)).done,'неполный ответ '+d.id);}kinds++;}
// равные значения в «Первых N»: другой выбор среди равных тоже верен
{let swapped=0;for(const d of Q.ORDERS){const S=C.init(Q.SEED);S.goal=12;S.lv.labels=2;S.lv.journal=2;const p=d.p(()=>.5),o={id:1,k:d.id,p,tier:d.tier},b=R.B(),id=d.r(b,p),node=b.G.nodes.find(n=>n.id===id);if(node.type!=='top')continue;
 const res=C.run(b.G,C.sourcesOf(S)),full=res[b.G.wires.find(w=>w[1]===id)[0]].table,is=full.cols.indexOf(node.p.sort),ip=node.p.per?full.cols.indexOf(node.p.per):-1,dir=node.p.dir==='asc'?1:-1,seen=new Map(),alt=[];
 for(const[r]of full.rows.map((r,i)=>[r,i]).sort((a,c)=>(a[0][is]-c[0][is])*dir||c[1]-a[1])){const k=ip<0?0:r[ip],n=seen.get(k)||0;if(n<node.p.n){alt.push(r);seen.set(k,n+1);}}
 const idx=d.f.every(f=>full.cols.includes(f))?d.f.map(f=>full.cols.indexOf(f)):d.f.map((_,i)=>i),src=Object.assign(Object.create(null),C.sourcesOf(S),{alt:{cols:d.f,rows:alt.map(r=>idx.map(i=>r[i]))}}),a=R.B(),x=a.src('alt');a.out(x,'answer',{});
 const st=Q.orderCheck(S,o,a.G,C.run(a.G,src));ok(st.done,'равные значения '+d.id+' '+st.text);if(JSON.stringify(Q.project(res[id].table,d.f).rows.map(String).sort())!==JSON.stringify(alt.map(r=>String(idx.map(i=>r[i]))).sort()))swapped++;
 const bad=a.G;src.alt={cols:d.f,rows:alt.slice(1).map(r=>idx.map(i=>r[i])).concat([alt.length>1?idx.map(i=>alt[1][i]):idx.map(i=>full.rows[0][i])])};src.key+='x';ok(!Q.orderCheck(S,o,bad,C.run(bad,src)).done,'повтор вместо строки не засчитан '+d.id);}
 ok(swapped>0,'проверка равных что-то проверила');}
// заказы с условиями: прогоняем тысячу выданных на настоящих данных
{const S=C.init(Q.SEED);S.goal=12;S.lv.labels=3;S.lv.journal=3;Q.fillOrders(S);let empty=[];for(let i=0;i<1000;i++){const o=S.orders[i%3],d=Q.orderDef(o),b=R.B(),id=Q.orderRef(b,d,o.p),res=C.run(b.G,C.sourcesOf(S)),t=res[id].table;if(!t||!t.rows.length)empty.push(o.k+JSON.stringify(o.p));else{const P=Q.project(t,d.f),map={};d.f.forEach((f,k)=>map[f]=t.cols.includes(f)&&d.f.every(g=>t.cols.includes(g))?f:t.cols[k]);b.out(id,'answer',map);ok(Q.orderCheck(S,o,b.G,C.run(b.G,C.sourcesOf(S))).done,'выданный заказ решаем '+o.k+JSON.stringify(o.p));}Q.completeOrder(S,o);}ok(!empty.length,'пустые заказы: '+[...new Set(empty)].join(' '));}
// заказы не кончаются
{const S=C.init(3);S.goal=12;Q.fillOrders(S);const seen=new Set();for(let i=0;i<3000;i++){ok(S.orders.length===3,'всегда три заказа');ok(new Set(S.orders.map(o=>o.k)).size===3,'разные');const o=S.orders[i%3];seen.add(o.k+JSON.stringify(o.p));i%7?Q.completeOrder(S,o):Q.skipOrder(S,o);}console.log('разных заказов за 3000 выдач:',seen.size);}
console.log('видов заказов',kinds,'· заданий',Q.GOALS.length,'· проверок',checks,'— всё прошло');
