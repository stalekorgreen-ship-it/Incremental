process.chdir(__dirname);
const C=require(process.cwd()+'/core.js'),R=require(process.cwd()+'/refs.js'),Q=require(process.cwd()+'/goals.js');
const SOL={t1:[()=>R.scheme(1),0,0],t2:[()=>R.scheme(2),0,0],t4:[()=>R.scheme(3),0,0],t6:[()=>R.scheme(4),1,0],t7:[()=>R.scheme(5),2,0],v3:[()=>R.scheme(5,{}),2,0],v4:[()=>R.scheme(5,{author:1}),2,1],v5:[()=>R.scheme(5,{author:1,length:1,smooth:1}),2,2],v6:[()=>R.scheme(5,{author:1,length:1,recent:1}),4,5],v7:[()=>R.scheme(5,{author:1,length:1,recent:1}),4,5]};
const out={};
for(const g of Q.GOALS){const S=C.init(1);if(SOL[g.id]){out[g.id]={G:SOL[g.id][0](),l:SOL[g.id][1],j:SOL[g.id][2]};continue;}
 const b=R.B();let id;if(g.id==='v2'){const th=R.topics(b,5);id=b.group(b.join(b.calc(b.join(b.src('Просмотры'),b.src('Посты'),'пост'),'секунд','÷','длина','доля'),th,'пост'),['человек','тема'],'avg','доля','вкус');b.out(th,'topics',{});}else id=g.ref(b);
 const t=C.run(b.G,C.sourcesOf(S))[id].table,map={};g.fields.forEach((f,k)=>map[f]=t.cols.includes(f)?f:t.cols[k]);b.out(id,'answer',map);out[g.id]={G:b.G,l:{t3:0,t5:0,v1:2,v2:2}[g.id],j:0};}
console.log(JSON.stringify({order:Q.GOALS.map(g=>g.id),out}));
