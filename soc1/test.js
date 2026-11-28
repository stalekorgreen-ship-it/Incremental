const Core=require('./core.js'),{LEVELS}=require('./levels.js'),{runStage}=require('./check.js');
let n=0,bad=0;const ok=(c,m)=>{n++;if(!c){bad++;console.log('✗',m);}};
const copy=o=>JSON.parse(JSON.stringify(o));
const withDef=S=>{S=copy(S);S.G.nodes.forEach(x=>x.p=Object.assign({},Core.DEF[x.type],x.p));S.screen=Object.assign({card:false,text:false,like:false,count:false,litBy:'',countBy:''},S.screen);return S;};
const L=id=>LEVELS.find(l=>l.id===id);
const run=(id,S,k)=>runStage(withDef(S),L(id).stages[k]);
// эталон проходит все этапы
for(const l of LEVELS)l.stages.forEach((st,k)=>{const f=run(l.id,l.ref,k);ok(!f,`${l.id} эталон, этап ${k}: ${f&&f.msg}`);});
// эталон использует только открытые инструменты и события
for(const l of LEVELS)for(const x of l.ref.G.nodes){ok(l.tools.includes(x.type),`${l.id}: узел ${x.type} не открыт`);if(x.type==='ev')ok(l.events.includes(x.p.kind),`${l.id}: событие ${x.p.kind} не открыто`);}
// наивные решения и ошибки должны падать там, где задумано
const mod=(S,fn)=>{S=copy(S);fn(S,id=>S.G.nodes.find(x=>x.id===id));return S;};
const fails=(id,S,k,name,pass)=>{for(let i=0;i<k;i++){const f=run(id,S,i);if(pass!==false)ok(!f,`${name}: этап ${i} должен проходить, а ${f&&f.msg}`);}const f=run(id,S,k);ok(!!f,`${name}: должно падать на этапе ${k}`);if(f&&process.env.V)console.log('  ',name,'→',f.msg);};
fails('l1',{screen:{card:true},G:{nodes:[],wires:[]}},0,'без текста');
fails('l2',{screen:L('l2').ref.screen,G:{nodes:[],wires:[]}},0,'кнопка без правил');
fails('l3',L('l2').ref,0,'только зажечь');
fails('l3',mod(L('l3').ref,(S,g)=>g('likes').p.mode='add'),1,'новая строка каждый раз');
fails('l3',mod(L('l3').ref,(S,g)=>g('likes').p.key='post'),0,'ключ: пост');
fails('l3',mod(L('l3').ref,(S,g)=>g('likes').p.key='who'),0,'ключ: человек');
const l4noUn=mod(L('l3').ref,S=>{S.screen.count=true;S.screen.countBy='c';S.G.nodes.push({id:'c',type:'calc',p:{op:'rows',by:'post'}});S.G.wires.push(['likes','c','t']);});
fails('l4',l4noUn,1,'без отмены');
fails('l4',mod(L('l4').ref,(S,g)=>g('c').p.by='all'),0,'считать по всем');
// копилка тоже годится
const acc=mod(L('l4').ref,S=>{S.G.nodes.push({id:'cnt',type:'table',p:{name:'Счёт',key:'post',mode:'sum'}});S.G.wires=S.G.wires.filter(w=>w[1]!=='c');S.G.wires.push(['no','cnt','write'],['yes','cnt','minus'],['cnt','c','t']);S.G.nodes.find(x=>x.id==='c').p={op:'sumv',by:'post'};});
for(const k of [0,1]){const f=run('l4',acc,k);ok(!f,'копилка проходит: '+(f&&f.msg));}
{const f=run('l5',acc,0);ok(!f,'копилка проходит 12 людей: '+(f&&f.msg));}
fails('l5',L('l5').broken,0,'сломанная сеть');
fails('l6',mod(L('l6').ref,S=>{S.G.nodes=S.G.nodes.filter(x=>x.id!=='k');S.G.wires=S.G.wires.filter(w=>w[0]!=='k');S.G.nodes.find(x=>x.id==='on').p.life=0;}),1,'только открыл/закрыл');
for(const [t,life,pass] of [[5,15,1],[10,15,1],[10,30,1],[30,30,1],[30,15,0],[120,30,0],[10,60,0],[10,300,0],[10,0,0]]){const S=mod(L('l6').ref,(S,g)=>{g('k').p.n=t;g('on').p.life=life;});const f=run('l6',S,0)||run('l6',S,1);ok(!f===!!pass,`онлайн: сигнал ${t}, срок ${life}: ${f?f.msg:'прошло'}`);}
fails('l7',mod(L('l7').ref,S=>{S.G.wires=S.G.wires.filter(w=>w[0]!=='mi'&&w[0]!=='ba');}),1,'без паузы');
fails('l7',mod(L('l7').ref,S=>{S.G.wires=S.G.wires.filter(w=>w[0]!=='mi'&&w[0]!=='ba');S.G.wires.push(['mi','w','stop'],['ba','w','start']);}),1,'кусками');
{const S=mod(L('l7').ref,(S,g)=>{g('v').p={name:'Визиты',key:'who',mode:'add',life:0};});for(const k of [0,1]){const f=run('l7',S,k);ok(!f,'хранить каждый визит тоже годится: '+(f&&f.msg));}}
for(const th of ['edge','half','full'])fails('l8',mod(L('l8').ref,(S,g)=>{g('s').p.th=th;g('h').p.th=th;}),1,'порог '+th,th!=='full'?undefined:false);
{const S=mod(L('l8').ref,(S,g)=>{g('r').p={name:'Чтение',key:'pair',mode:'add',life:0};});for(const k of [0,1]){const f=run('l8',S,k);ok(!f,'каждый замер строкой тоже годится: '+(f&&f.msg));}}
fails('l9',L('l8').ref,0,'без тишины');
for(const N of [5,15,30,60,180]){const S=mod(L('l9').ref,(S,g)=>g('i').p.n=N);const a=run('l9',S,0),b=run('l9',S,1);ok((!a&&!b)===(N===60),`сброс ${N}: этап0 ${a?a.msg:'ок'} / этап1 ${b?b.msg:'ок'}`);
 const P=mod(S,x=>{x.G.wires.find(w=>w[2]==='reset')[2]='pause';x.G.nodes.push({id:'to',type:'ev',p:{kind:'touch'}});x.G.wires.push(['to','w','resume']);});ok(!!(run('l9',P,0)||run('l9',P,1)),'пауза '+N+' не должна проходить');}
// перевод в модули на поле и обратно ничего не ломает
const Graph=require('./graph.js');
for(const l of LEVELS){const U=Graph.fromEngine(l.ref),by=Object.fromEntries(U.nodes.map(x=>[x.id,x]));
 for(const w of U.wires)ok(Graph.canWire(by[w[0]],w[1],by[w[2]],w[3]),l.id+': провод нельзя '+w.join(' '));
 for(const x of U.nodes)ok(x.type==='screen'||l.mods.includes(x.type)||l.start==='feed'&&['post','text','button'].includes(x.type),l.id+': блок не открыт '+x.type);
 const E=Graph.compile(U);l.stages.forEach((st,k)=>{const f=runStage(withDef(E),st);ok(!f,l.id+' через модули, этап '+k+': '+(f&&f.msg));});}
{const E=Graph.compile(Graph.fromEngine(L('l5').broken));ok(!!runStage(withDef(E),L('l5').stages[0]),'сломанная сеть через модули должна падать');}
console.log(`проверок ${n}, ошибок ${bad}`);process.exit(bad?1:0);
