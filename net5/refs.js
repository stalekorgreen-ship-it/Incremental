// эталонные схемы пробы: только для проверок, игроку не показываются
const C=require('../net4/core.js'),L=require('./live.js');
function B(){const G={nodes:[],wires:[]};let k=1;const add=(type,p,...ins)=>{const n={id:'n'+k++,type,p,x:0,y:0};G.nodes.push(n);ins.forEach((f,i)=>f&&G.wires.push([f,n.id,C.BLOCKS[type].ins[i][0]]));return n.id;};
 return{G,add,wire:(f,t,port)=>G.wires.push([f,t,port||'a']),src:t=>add('src',{table:t}),join:(a,b,on1,on2,keep)=>add('join',{on1,on2,keep},a,b),group:(a,by,agg,col,name,x)=>add('group',{by1:by[0],by2:by[1],agg,col,name,...x},a),top:(a,sort,n,per)=>add('top',{sort,n,per},a),
  filter:(a,col,op,val,x)=>add('filter',{col,op,val,...x},a),calc:(a,x,op,y,name)=>add('calc',typeof y==='number'?{a:x,op,b:'#',num:y,name}:{a:x,op,b:y,name},a),rand:(a,n,per)=>add('rand',{n,per},a),mem:(a,k1,k2,val,mode,forget,name)=>add('mem',{k1,k2,val,mode,forget,name},a),show:(a,b,score,trial)=>add('show',{score,trial},a,b)};}
// o: words — профиль человека по словам; junk — отсеять слова, которые есть везде; quality — память о постах; trial — мест на пробу; forget
function scheme(o){const b=B(),cand=b.src('Кандидаты');
 if(o.random){b.show(null,cand,undefined,5);return b.G;}
 let words=b.src('Слова постов');if(o.junk){const freq=b.group(words,['слово'],'count',null,'всего');words=b.join(words,b.filter(freq,'всего','≤',o.junk),'слово');}let parts=[],taste,qual;
 if(o.words){const rw=b.join(b.src('Реакции'),words,'пост');
  taste=b.mem(rw,'человек','слово','доля','avg',o.forget||0,'вкус');
  if(o.near){// слова-соседи: что часто стоит в одном посте. Интерес растекается на соседей
   const pairs=b.filter(b.join(words,words,'пост'),'слово','≠',undefined,{col2:'слово 2'}),often=b.mem(pairs,'слово','слово 2','пост','avg',0,'где');
   const nb=b.top(b.filter(often,'раз','≥',o.minPair||3,{every:o.every}),'раз',o.near,'слово');
   const spread=b.group(b.join(taste,nb,'слово'),['человек','слово 2'],'avg','вкус','вкус',{every:o.every});taste=spread;}
  let cw=b.join(cand,words,'пост');
  let t=taste;if(o.enough)t=b.filter(taste,'раз','≥',o.enough);
  const hit=o.near?b.add('join',{on1:'слово = слово 2',on2:'человек'},cw,t):b.join(cw,t,'человек','слово');
  if(o.sum){const g=b.group(hit,['человек','пост'],'sum','вкус','сумма'),n=b.group(hit,['человек','пост'],'count',null,'сколько');parts=b.calc(b.calc(b.join(g,n,'человек','пост'),'сколько','+',1,'всего'),'сумма','÷','всего','оценка');}
  else parts=b.group(hit,['человек','пост'],o.agg||'avg','вкус','оценка');}
 if(o.quality){const pm=b.mem(b.src('Реакции'),'пост',null,'доля','avg',0,'качество');qual=pm;}
 let score=parts,col='оценка';
 if(o.quality&&o.words){score=b.calc(b.join(parts,qual,'пост',undefined,o.keep),'оценка','×','качество','итог');col='итог';}
 else if(o.quality){score=b.join(cand,qual,'пост',undefined,o.keep);col='качество';}
 if(o.words&&o.residual){// качество = насколько пост смотрят лучше или хуже, чем обещали слова
  const pred=b.mem(o.slim?b.top(parts,'оценка',o.slim,'человек'):parts,'человек','пост','оценка','last',50,'ждали'),diff=b.calc(b.join(b.src('Реакции'),pred,'человек','пост'),'доля','−','ждали','разница'),pm=b.mem(diff,'пост',null,'разница','avg',o.pforget||0,'поправка');
  score=b.calc(b.join(parts,pm,'пост',undefined,0),'оценка','+','поправка','итог');col='итог';
  if(o.shrink){const up=b.calc(b.join(parts,b.calc(b.calc(pm,'поправка','×','раз','всего'),'раз','+',o.shrink,'вес'),'пост',undefined,0),'оценка','+',0,'прогноз');}}
 let trial=null;if(o.trial)trial=o.young?b.rand(b.join(cand,b.filter(b.src('Посты'),'возраст','≤',o.young),'пост'),o.trial,'человек'):b.rand(cand,o.trial,'человек');
 if(o.quality&&o.words&&o.fallback){/* неизвестное качество не выкидывать */}
 b.show(score,trial,col,o.trial||0);return b.G;}
module.exports={B,scheme};
