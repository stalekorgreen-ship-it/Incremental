// проверка сценариев. Возвращает null или описание первой ошибки с номером шага
(function(){
const Core=typeof module!=='undefined'?require('./core.js'):window.Core;
const Lv=typeof module!=='undefined'?require('./levels.js'):window.Levels;
const nm=w=>Lv.NAMES[w],pn=p=>'«'+Lv.POSTS[p].who+'»',r=v=>Math.round(v*10)/10;
function verify(W,S,c){
 if(c.chk==='lit'){const v=W.lit(S.screen,c.who,c.post);if(v!==c.want)return `У человека «${nm(c.who)}» кнопка под постом ${pn(c.post)} ${v?'горит, а не должна':'не горит, а должна'}.`;}
 if(c.chk==='count'){const v=W.count(S.screen,c.post);if(v==null)return 'Под постом нет верного числа: проверь вход «какое число»: туда нужен «Посчитать» для каждого поста.';if(v!==c.want)return `Под постом ${pn(c.post)} число ${r(v)}, а настоящих лайков ${c.want}.`;}
 if(c.chk==='nodup'){const t=S.screen.litBy;if(!t)return 'Кнопка не смотрит ни в какую таблицу: вход «горит, пока есть строка в» пустой.';const seen=new Set();for(const row of W.rows(t)){const k=row.who+'|'+row.post;if(seen.has(k)||row.n>1)return `В таблице двойной лайк: человек «${nm(row.who)}» записан дважды на один пост.`;seen.add(k);}}
 if(c.chk==='panel'||c.chk==='avg'){const p=W.panel(c.m);if(!p)return 'На панели пусто: нужен блок «На панель», а перед ним «Посчитать».';
  if(p.by!=='all')return 'На панели должно быть одно число. В «Посчитать» выбери «по всем вместе».';const v=p.map.get('*')||0;
  if(c.chk==='panel'&&v!==c.want)return `На панели ${r(v)}, а в приложении сейчас ${c.want} чел.`;
  if(c.chk==='avg'&&Math.abs(v-c.want)>c.want*c.rel+.5)return `На панели средний визит ${r(v)} с, а на самом деле ${r(c.want)} с.`;}
 if(c.chk==='avgPost'){const p=W.panel(c.m);if(!p)return 'На панели пусто: нужен блок «На панель», а перед ним «Посчитать».';
  if(p.by!=='post')return 'Нужно число для каждого поста. В «Посчитать» выбери «для каждого поста».';
  for(const [post,want] of Object.entries(c.want)){const v=p.map.get(post);if(v==null)return `Для поста ${pn(post)} нет ни одного замера, а его читали.`;
   if(Math.abs(v-want)>want*c.rel+.5)return `Пост ${pn(post)}: на панели ${r(v)} с, а на самом деле читали ${r(want)} с.`;}}
 return null;}
// прогон одного сценария; onStep(номер, шаг, мир) — для телефона по шагам
function runScen(S,sc){const W=Core.World(S.G);for(let i=0;i<sc.steps.length;i++){const s=sc.steps[i];W.advance(s.t);
  if(s.chk){const bad=verify(W,S,s);if(bad)return {msg:bad,step:i,W};}else W.act(s);}return null;}
function runStage(S,stage){
 for(const part of stage.screen||[])if(!S.screen[part])return {msg:{card:'Люди не видят пост: «Пост» не подключён к «Экрану телефона».',text:'Пост пустой: «Текст» не подключён внутрь поста.',like:'В посте нет кнопки: «Кнопка» не подключена внутрь поста.',count:'Под постом нет числа: блок «Число под постом» не подключён внутрь поста.'}[part],scen:-1};
 for(let k=0;k<stage.scen.length;k++){const f=runScen(S,stage.scen[k]);if(f)return {msg:f.msg,scen:k,step:f.step};}
 return null;}
const Check={verify,runScen,runStage};
if(typeof module!=='undefined')module.exports=Check;else window.Check=Check;
})();
