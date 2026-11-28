// эталонные схемы: по ним считаются правильные ответы на задания и заказы. Игроку не показываются
(function(root){
const C=typeof require!=='undefined'?require('./core.js'):root.Core;
function B(){const G={nodes:[],wires:[],seq:1};const add=(type,p,...ins)=>{const n={id:'n'+G.seq++,type,p,lv:0,x:0,y:0};G.nodes.push(n);ins.forEach((from,i)=>{if(!C.connect(G,from,n.id,C.BLOCKS[type].ins[i][0]))throw new Error('не соединяется '+type);});return n.id;};
 return{G,src:t=>add('src',{table:t}),join:(a,b,on1,on2)=>add('join',{on1,on2},a,b),group:(a,by,agg,col,name)=>add('group',{by1:by[0],by2:by[1],agg,col,name},a),top:(a,sort,n,per,dir)=>add('top',{sort,n,per,dir},a),
  filter:(a,col,op,val)=>add('filter',{col,op,val},a),calc:(a,x,op,y,name)=>add('calc',typeof y==='number'?{a:x,op,b:'#',num:y,name}:{a:x,op,b:y,name},a),out:(a,slot,map)=>add('out',{slot,map},a)};}
// ——— темы
function topics(b,level){const words=b.src('Слова постов');
 if(level===1)return b.join(words,b.src('Начальный словарь'),'слово');
 let dict;
 if(level===2)dict=b.src('Начальный словарь');
 else{const lab=b.join(words,b.src('Разметка'),'пост'),pairs=b.group(lab,['слово','тема'],'count',null,'сколько');
  if(level===3)dict=b.top(pairs,'сколько',1,'слово');
  else{const total=b.group(lab,['слово'],'count',null,'всего'),share=b.calc(b.join(pairs,total,'слово'),'сколько','÷','всего','доля');
   dict=b.top(b.filter(share,'доля','≥',level===4?.45:.4),'доля',1,'слово');}}
 const hit=b.join(words,dict,'слово');
 if(level>=5){const sum=b.group(hit,['пост','тема'],'sum','доля','вес');return b.top(sum,'вес',1,'пост');}
 return b.top(b.group(hit,['пост','тема'],'count',null,'сколько'),'сколько',1,'пост');}
// ——— вкус и лента
function feed(b,th,o){const posts=b.src('Посты');let v=b.join(b.src('Просмотры'),posts,'пост');
 if(o.recent)v=b.filter(v,'день','≥',7);
 v=b.calc(v,'секунд','÷','длина','доля');
 if(o.pop){const q=b.group(v,['пост'],'avg','доля','качество');return b.top(b.join(b.src('Кандидаты'),b.join(posts,q,'пост'),'пост'),'качество',C.TOPN,'человек');}
 // качество по автору для свежих постов
 let share='доля';
 if(o.length){const base=b.group(v,['длинный'],'avg','доля','поправка');v=b.calc(b.join(v,base,'длинный'),'доля','÷','поправка','оценка');share='оценка';}
 const tv=b.join(v,th,'пост');let taste;
 if(o.smooth){const g=b.group(tv,['человек','тема'],'sum',share,'сумма'),n=b.group(tv,['человек','тема'],'count',null,'сколько');
  const both=b.join(g,n,'человек','тема'),up=b.calc(both,'сумма','+',o.length?1.6:.8,'всего'),down=b.calc(up,'сколько','+',2,'вес');taste=b.calc(down,'всего','÷','вес','вкус');}
 else taste=b.group(tv,['человек','тема'],'avg',share,'вкус');
 let cand=b.join(b.join(b.src('Кандидаты'),th,'пост'),taste,'человек','тема');
 if(!o.author&&!o.length)return b.top(cand,'вкус',C.TOPN,'человек');
 cand=b.join(cand,posts,'пост');
 if(o.length){// длинные досматривают реже: возвращаем поправку кандидату
  const base=b.group(b.calc(b.join(b.src('Просмотры'),posts,'пост'),'секунд','÷','длина','доля'),['длинный'],'avg','доля','поправка');cand=b.calc(b.join(cand,base,'длинный'),'вкус','×','поправка','прогноз');}
 const key=o.length?'прогноз':'вкус';
 if(!o.author)return b.top(cand,key,C.TOPN,'человек');
 const q=b.group(b.join(v,posts,'пост'),['автор'],'avg',share,'качество');return b.top(b.calc(b.join(cand,q,'автор'),key,'×','качество','итог'),'итог',C.TOPN,'человек');}
function scheme(tl,fo){const b=B(),th=topics(b,tl);b.out(th,'topics',{});if(fo){const f=feed(b,th,fo),last=b.G.nodes.find(n=>n.id===f);b.out(f,'feed',{оценка:last.p.sort});}return b.G;}
const API={B,topics,feed,scheme};
if(typeof module!=='undefined')module.exports=API;else root.Refs=API;
})(this);
