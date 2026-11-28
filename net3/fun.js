// измеритель веселья: журнал того, что делает человек, и разбор этого журнала.
// Веселье напрямую не измерить. Смотрим с двух сторон: что человек делал и что он сам сказал.
(function(root){
const RATE={fun:'интересно',ok:'нормально',bored:'скучно',lost:'непонятно'};
const FORM=[['goal','Я понимал, чего от меня хотят'],['feedback','Я видел, что меняют мои действия'],['challenge','Задачи были в меру сложными'],['freedom','Я мог решать по-своему'],['curious','Мне хотелось узнать, что будет дальше'],['enjoy','Мне нравилось строить схему'],['again','Я бы поиграл ещё']];
const GAP=90,LONG=480;
function create(){return{v:1,sec:0,sessions:0,ev:[],form:{},notes:{bad:'',good:''}};}
function log(F,type,q,data){if(F.ev.length<6000)F.ev.push(data===undefined?[Math.round(F.sec),type,q]:[Math.round(F.sec),type,q,data]);}
const DOING=new Set(['add','del','wire','unwire','set','buy']);
function analyze(F,quests){const name=i=>quests[i]?quests[i].title:'после всех задач';
 const per={},P=q=>per[q]||(per[q]={q,title:name(q),start:null,end:null,sec:0,acts:0,fails:0,redo:0,hints:0,rate:null,bored:0,lost:0,done:false});
 const gaps=[],adds=[];let prevT=0,lastBeat=0,spT=0,spV=1,fast=0,acts=0,first=null,firstDone=null,cur=0,startT=0,watchT=0;
 for(const e of F.ev){const[t,type,q,d]=e,x=P(q);if(x.start===null)x.start=t;
  if(q!==cur){cur=q;}
  if(DOING.has(type)){acts++;x.acts++;if(first===null)first=t;}
  // «ничего не происходит»: ни действий, ни событий игры
  if(DOING.has(type)||type==='quest'||type==='alarm'||type==='record'||type==='peek'){if(t-lastBeat>=GAP)gaps.push({at:lastBeat,len:t-lastBeat,q});lastBeat=t;}
  if(type==='fail')x.fails++;if(type==='add')adds.push([t,d]);if(type==='del'){const a=adds.find(a=>a[1]===d&&t-a[0]<=30);if(a)x.redo++;}
  if(type==='hint')x.hints=Math.max(x.hints,d);if(type==='rate'){const r=P(d[0]);r.rate=d[1];}
  if(type==='mood')x[d]++;
  if(type==='speed'){if(spV>1)fast+=t-spT;spT=t;spV=d;}
  if(type==='session'){if(spV>1)fast+=t-spT;spV=1;spT=t;}
  if(type==='quest'){x.done=true;x.end=t;if(firstDone===null)firstDone=t;}}
 const total=Math.max(F.sec,1);if(spV>1)fast+=total-spT;if(total-lastBeat>=GAP)gaps.push({at:lastBeat,len:Math.round(total-lastBeat),q:cur});
 // время на задачу: от конца прошлой до конца этой
 const list=Object.values(per).sort((a,b)=>a.q-b.q);let from=0;for(const x of list){x.sec=Math.round((x.done?x.end:total)-from);if(x.done)from=x.end;}
 const bad=[],good=[],lost=[];
 for(const g of gaps)bad.push(`пустой отрезок ${mm(g.len)} (задача «${name(g.q)}», с ${mm(g.at)}): ни действий, ни событий`);
 for(const x of list){const n=`«${x.title}»`;
  if(x.sec>=LONG&&x.q<quests.length)lost.push(`${n}: ${mm(x.sec)} на одну задачу`);
  if(x.fails>=4)lost.push(`${n}: ${x.fails} неудачных проводов`);
  if(x.redo>=3)lost.push(`${n}: ${x.redo} раза поставил блок и сразу убрал`);
  if(x.hints===2)lost.push(`${n}: понадобился точный рецепт`);
  if(x.rate==='lost')lost.push(`${n}: оценка «непонятно»`);if(x.lost)lost.push(`${n}: нажал «не понимаю» ×${x.lost}`);
  if(x.rate==='bored')bad.push(`${n}: оценка «скучно»`);if(x.bored)bad.push(`${n}: нажал «скучно» ×${x.bored}`);
  if(x.rate==='fun')good.push(`${n}: оценка «интересно»`);}
 if(fast/total>.25)bad.push(`${Math.round(fast/total*100)}% времени играл с ускорением: хотелось перемотать`);
 const wonAt=F.ev.find(e=>e[1]==='win');if(wonAt&&total-wonAt[0]>180)good.push(`играл ещё ${mm(total-wonAt[0])} после победы`);
 if(F.sessions>1)good.push(`возвращался: запусков ${F.sessions}`);
 const rates={fun:0,ok:0,bored:0,lost:0};for(const x of list)if(x.rate)rates[x.rate]++;
 return{total:Math.round(total),acts,perMin:acts/(total/60),first,firstDone,fast:fast/total,gaps,list,rates,bad,good,lost,questsDone:list.filter(x=>x.done).length,stopped:cur<quests.length?name(cur):null};}
const mm=s=>{s=Math.round(s);return s<60?s+' с':Math.floor(s/60)+' мин'+(s%60?' '+s%60+' с':'');};
function text(F,quests){const A=analyze(F,quests),L=[];L.push('ОТЧЁТ О ВЕСЕЛЬЕ · ЛентаОС 95');
 L.push(`играл ${mm(A.total)}, задач ${A.questsDone} из ${quests.length}${A.stopped?', остановился на «'+A.stopped+'»':''}, действий в минуту ${A.perMin.toFixed(1)}, первое действие через ${A.first===null?'—':mm(A.first)}`);
 L.push(`оценки задач: интересно ${A.rates.fun}, нормально ${A.rates.ok}, скучно ${A.rates.bored}, непонятно ${A.rates.lost}`);
 const sec=(t,a)=>{L.push('',t+(a.length?'':' нет'));for(const s of a.slice(0,14))L.push('· '+s);};
 sec('Похоже на веселье:',A.good);sec('Похоже на скуку:',A.bad);sec('Похоже на непонимание:',A.lost);
 const ans=FORM.filter(f=>F.form[f[0]]);if(ans.length){L.push('','Анкета (1–7):');for(const f of ans)L.push(`· ${f[1]}: ${F.form[f[0]]}`);}
 if(F.notes.bad)L.push('Самое скучное: '+F.notes.bad);if(F.notes.good)L.push('Самое классное: '+F.notes.good);
 L.push('','ДАННЫЕ '+JSON.stringify({v:F.v,sec:Math.round(F.sec),sessions:F.sessions,form:F.form,notes:F.notes,ev:F.ev}));return L.join('\n');}
const API={RATE,FORM,GAP,create,log,analyze,text,mm};
if(typeof module!=='undefined')module.exports=API;else root.Fun=API;
})(this);
