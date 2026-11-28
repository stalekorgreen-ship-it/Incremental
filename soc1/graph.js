// Модули на поле. Экран, кнопка, приложение и т. д. — тоже блоки; здесь поле переводится в то, что понимает движок.
// провод: [откуда, выход, куда, вход]; виды: s — «что внутри чего», e — событие, t — таблица
(function(){
const MOD={
 screen:{name:'Экран телефона',c:'#303030',about:'что подключено, то люди и видят',in:[['ui','показывает','s']],out:[]},
 post:{name:'Пост',c:'#1060a0',about:'карточка в ленте',in:[['inside','внутри поста','s']],out:[['ui','на экран','s'],['shown','появился у человека','e'],['hidden','ушёл с экрана','e']]},
 text:{name:'Текст',c:'#506070',about:'слова поста',in:[],out:[['ui','в пост','s']]},
 button:{name:'Кнопка «Нравится»',c:'#b0305a',about:'сама ничего не помнит',in:[['on','зажечь','e'],['lit','горит, пока есть строка в','t']],out:[['ui','в пост','s'],['press','её нажали','e']]},
 number:{name:'Число под постом',c:'#7040a0',about:'показывает то, что посчитали',in:[['val','какое число','t']],out:[['ui','в пост','s']]},
 app:{name:'Приложение',c:'#a05000',about:'что человек делает с приложением',in:[],out:[['open','открыли','e'],['close','закрыли','e'],['min','свернули','e'],['back','вернулись','e']]},
 finger:{name:'Палец',c:'#a05000',about:'трогают ли экран',in:[],out:[['touch','коснулся','e'],['idle','давно не трогают','e']]},
 timer:{name:'Таймер',c:'#a05000',about:'тикает, пока приложение на экране',in:[],out:[['tick','тик','e']]},
 gate:{name:'Только если',c:'#702080',about:'пропускает или нет',in:[['e','событие','e']],out:[['out','пропустил','e']]},
 table:{name:'Таблица',c:'#005a40',about:'память сети',in:[['write','записать','e'],['minus','отнять','e'],['del','стереть','e']],out:[['out','все строки','t']]},
 watch:{name:'Секундомер',c:'#8a6a00',about:'меряет, сколько прошло',in:[['start','пустить','e'],['pause','пауза','e'],['resume','дальше','e'],['stop','стоп','e'],['reset','выбросить замер','e']],out:[['out','остановлен: вот секунды','e']]},
 calc:{name:'Посчитать',c:'#00308a',about:'считает по строкам таблицы',in:[['t','таблица','t']],out:[['out','что получилось','t']]},
 panel:{name:'На панель',c:'#101010',about:'цифра для тебя, владельца',in:[['t','число','t']],out:[]},
};
const LOGIC=['gate','table','watch','calc','panel'],SINGLE=['screen','post','text','button','number','app','finger','timer'];
const MDEF={post:{th:'edge'},finger:{n:5},timer:{n:5}};
const kindIn=(type,port)=>(MOD[type].in.find(x=>x[0]===port)||[])[2],kindOut=(type,port)=>(MOD[type].out.find(x=>x[0]===port)||[])[2];
function canWire(a,fp,b,tp){const k=kindOut(a.type,fp);if(!k||k!==kindIn(b.type,tp))return false;
 if(a===b)return a.type==='button'&&fp==='press'&&tp==='on';
 if(tp==='ui')return a.type==='post';if(tp==='inside')return a.type!=='post';
 if(tp==='lit')return a.type==='table';if(tp==='val')return a.type==='calc';return true;}
function compile(U){
 const by=Object.fromEntries(U.nodes.map(n=>[n.id,n])),nodes=U.nodes.filter(n=>LOGIC.includes(n.type)).map(n=>({id:n.id,type:n.type,p:Object.assign({},n.p)})),wires=[],made=new Set();
 const make=(id,type,p)=>{if(!made.has(id)){made.add(id);nodes.push({id,type,p});}return id;};
 const has=(a,tp,b)=>U.wires.find(w=>by[w[0]]&&by[w[2]]&&by[w[0]].type===a&&w[3]===tp&&by[w[2]].type===b);
 const screen={card:!!has('post','ui','screen'),text:false,like:false,count:false,litBy:'',countBy:''};
 if(screen.card){screen.text=!!has('text','inside','post');screen.like=!!has('button','inside','post');screen.count=!!has('number','inside','post');}
 for(const [f,fp,t,tp] of U.wires){const a=by[f],b=by[t];if(!a||!b)continue;
  if(tp==='lit'){screen.litBy=f;continue;}if(tp==='val'){screen.countBy=f;continue;}if(kindOut(a.type,fp)==='s')continue;
  let src=f;if(!LOGIC.includes(a.type))src=make(f+'.'+fp,'ev',{kind:fp,n:a.p.n,th:a.p.th});
  if(tp==='on')wires.push([src,make(t+'.light','light',{mode:'on'}),'e']);else wires.push([src,t,tp]);}
 return {screen,G:{nodes,wires}};
}
const HOME={press:'button',open:'app',close:'app',min:'app',back:'app',touch:'finger',idle:'finger',tick:'timer',shown:'post',hidden:'post'};
// эталоны и сломанная сеть записаны в виде движка — переводим их в модули на поле
function fromEngine(S){
 const nodes=[{id:'screen',type:'screen',p:{}}],wires=[];
 const mod=type=>{let n=nodes.find(x=>x.type===type);if(!n){n={id:type,type,p:Object.assign({},MDEF[type])};nodes.push(n);}return n;};
 const w=(a,fp,b,tp)=>{if(!wires.some(x=>x[0]===a&&x[1]===fp&&x[2]===b&&x[3]===tp))wires.push([a,fp,b,tp]);};
 const sc=S.screen||{};
 if(sc.card){w(mod('post').id,'ui','screen','ui');if(sc.text)w(mod('text').id,'ui','post','inside');if(sc.like)w(mod('button').id,'ui','post','inside');if(sc.count)w(mod('number').id,'ui','post','inside');}
 const src={};
 for(const n of S.G.nodes){if(n.type==='ev'){const t=HOME[n.p.kind],m=mod(t);if(n.p.kind==='idle'||n.p.kind==='tick')m.p.n=n.p.n;if(t==='post'&&n.p.th)m.p.th=n.p.th;src[n.id]=[m.id,n.p.kind];}
  else if(n.type!=='light'){nodes.push({id:n.id,type:n.type,p:Object.assign({},n.p)});src[n.id]=[n.id,'out'];}}
 for(const [a,b,port] of S.G.wires){const t=S.G.nodes.find(x=>x.id===b),f=src[a];if(!f)continue;
  if(t.type==='light')w(f[0],f[1],mod('button').id,'on');else w(f[0],f[1],b,port);}
 if(sc.litBy)w(sc.litBy,'out',mod('button').id,'lit');if(sc.countBy)w(sc.countBy,'out',mod('number').id,'val');
 return {nodes,wires};
}
const Graph={MOD,MDEF,LOGIC,SINGLE,kindIn,kindOut,canWire,compile,fromEngine};
if(typeof module!=='undefined')module.exports=Graph;else window.Graph=Graph;
})();
