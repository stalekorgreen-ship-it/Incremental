// бот-«игрок»: думает заданное время, ставит эталонную схему, покупает всё по карману. Меряет, нет ли простоев
const C=require('./core.js'),R=require('./refs.js'),Q=require('./goals.js');
const PLAN={t1:[()=>R.scheme(1),0,0],t2:[()=>R.scheme(2),0,0],t4:[()=>R.scheme(3),0,0],t6:[()=>R.scheme(4),1,0],t7:[()=>R.scheme(5),2,0],v3:[()=>R.scheme(5,{}),2,0],v4:[()=>R.scheme(5,{author:1}),2,1],v5:[()=>R.scheme(5,{author:1,length:1}),2,2],v6:[()=>R.scheme(5,{author:1,length:1,recent:1}),4,5]};
function play(think,orderTime,hours,log){const S=C.init(Q.SEED);let G={nodes:[],wires:[]},cache=new Map(),goal=-1,since=0,orderLeft=orderTime,lastBuy=0,maxGap=0,gapAt=0,buys=0;const done=[];const hourly=[];let maxHour=0,fiveM=0;let m=C.measure(S,G,cache);
 const need=()=>{const g=Q.GOALS[S.goal];return g&&PLAN[g.id]?{labels:PLAN[g.id][1],journal:PLAN[g.id][2]}:null;};
 for(let t=0;t<hours*3600;t++){C.step(S);
  if(S.goal!==goal){goal=S.goal;since=t;}
  const g=Q.GOALS[S.goal];
  // покупки: сначала данные для задания, потом самое дешёвое
  if(t%5===0){let want=need(),bought=false,saving=0;
   if(want)for(const k of['labels','journal'])if(S.lv[k]<want[k]){saving=C.SHOP[k].price(S.lv[k]);if(C.buy(S,k)){bought=true;m=C.measure(S,G,cache);}break;}
   const items=[...['cpu','ads','reach'].map(k=>({c:C.SHOP[k].price(S.lv[k]),f:()=>C.buy(S,k)})),...G.nodes.filter(n=>n.type!=='src').map(n=>({c:C.blockPrice(G,n),f:()=>C.upgrade(S,G,n)}))].sort((a,b)=>a.c-b.c);
   // пока копит на нужные данные, мелочь берёт только дешевле десятой части
   if(items[0]&&items[0].c<=S.money&&(!saving||items[0].c<saving*.1)){items[0].f();bought=true;}
   if(bought){buys++;if(t-lastBuy>maxHour)maxHour=t-lastBuy;if(t-lastBuy>maxGap){maxGap=t-lastBuy;gapAt=t;}lastBuy=t;m=C.measure(S,G,cache);}}
  if(g){const want=need(),have=!want||(S.lv.labels>=want.labels&&S.lv.journal>=want.journal);
   if(t-since>=think&&have){if(PLAN[g.id]){const old=G;G=PLAN[g.id][0]();for(const n of G.nodes){const o=old.nodes.find(o=>o.id===n.id&&o.type===n.type);if(o)n.lv=o.lv;}cache=new Map();m=C.measure(S,G,cache);}
    const isMetric=!!PLAN[g.id]||g.id==='v7';
    if(!isMetric){S.goal++;S.money+=g.reward;done.push([g.id,t]);Q.fillOrders(S);}else{const w=Q.tick(S,G,m.R);if(w)done.push([w.id,t]);}}}
  if(S.orders.length){if(--orderLeft<=0){Q.completeOrder(S,S.orders[0]);orderLeft=orderTime;}}
  if(t%3600===3599){hourly.push(maxHour);maxHour=0;}
  if(!fiveM&&S.users>=4.99e6)fiveM=t;
  if(log&&t%7200===7199)console.log(`  ${(t+1)/3600} ч: задание ${S.goal}/14, денег ${Math.round(S.money)}, доход ${S.income.toFixed(1)}/с, людей ${Math.round(S.users)}, в сети ${Math.round(S.watch)} с, расчёт ${S.cycle.toFixed(0)} с, покупок ${buys}, заказов ${S.done}`);}
 return{S,done,maxGap,gapAt,buys,hourly,fiveM};}
for(const[name,think,ot]of[['быстрый игрок',90,150],['средний',420,300],['медленный',900,600]]){console.log(name+': на задание',think,'с, на заказ',ot,'с');const r=play(think,ot,30,true);console.log('  задания, мин:',r.done.map(d=>d[0]+' '+Math.round(d[1]/60)).join(', '));console.log('  5 000 000 людей через',r.fiveM?(r.fiveM/3600).toFixed(1)+' ч':'не достигнуто за 30 ч','· простой по часам, с:',r.hourly.join(' '));console.log('  самый долгий простой без покупки:',r.maxGap,'с (на',Math.round(r.gapAt/60),'минуте)');}
module.exports={play,PLAN};
