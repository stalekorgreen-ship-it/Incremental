/* Движок ленты без интерфейса: им пользуются и игра, и боты. */
const ENGINE=(()=>{
const DAY=300,GOAL=5e6;
const BAL={k:.00132,u0:1500,p:.45,income:.12,ie:.5,tier:40,step:3.2,early:.004,eu:1500};
const T={
src:{n:'Новые посты',i:[],o:['post']},feed:{n:'Лента',i:['post','net','disk'],o:[]},
net:{n:'Интернет',i:[],o:['net'],give:10,price:20,at:0},
disk:{n:'Хранилище',i:[],o:['disk'],give:20,price:30,at:60},
cpu:{n:'Процессор',i:[],o:['cpu'],give:10,price:50,at:180},
sort:{n:'Сортировка',i:['post','cpu','disk'],o:['post'],price:40,at:180,one:1},
likes:{n:'Сбор лайков',i:['net'],o:[],price:60,at:240,one:1},
split:{n:'Разделитель',i:['any'],o:['any','any','any','any'],price:25,at:240},
rate:{n:'Чаще новые посты',price:35,at:90,up:1,max:12}};
/* ступени 6–16: пока это ЗАГЛУШКИ, они только ускоряют рост */
const ALGO=[[11,'Подавление',300],[15,'Интересы людей',900],[20,'Пузыри',2500],[26,'Развилки и слияния',7000],[32,'Репосты',18000],[39,'Популярные авторы',45000],[47,'Тренды',110000],[55,'Мосты между пузырями',260000],[65,'Самонастройка',600000],[76,'Автопузыри',1400000],[88,'Управление трендами',3000000]].map(([day,n,price])=>({day,n,price,mult:1.07}));
let S;
const fresh=()=>{S={t:0,money:0,users:10,id:0,nodes:[],wires:[],bought:{},rate:1/3,rules:{},taste:{},gen:0,wait:0,algo:0,day:{e:0,u:10,sp:0},bonus:0,sat:0};add('src',20,40);add('feed',200,40);add('net',20,220);return S};
const use=s=>S=s,get=()=>S;
function add(k,x,y){const n={id:++S.id,k,x,y,q:[],acc:0,eff:0,lvl:0};if(x==null){const c=S.nodes.length-3;n.x=20+(c%4)*170;n.y=390+(c/4|0)*170}S.nodes.push(n);return n}
const byId=i=>S.nodes.find(n=>n.id===i),first=k=>S.nodes.find(n=>n.k===k);
const into=(id,p)=>S.wires.filter(w=>w.b===id&&w.bp===p),from=(id,p)=>S.wires.find(w=>w.a===id&&w.ap===p);
function type(n,out,p,seen=new Set()){const t=T[n.k][out?'o':'i'][p];if(t!=='any')return t;if(seen.has(n.id))return'any';seen.add(n.id);const w=into(n.id,0)[0];return w?type(byId(w.a),1,w.ap,seen):'any'}
const give=n=>T[n.k].give*2**n.lvl;
function outAmt(n,p,seen=new Set()){if(T[n.k].give)return give(n);if(n.k!=='split'||seen.has(n.id))return 0;seen.add(n.id);const c=S.wires.filter(w=>w.a===n.id).length;return c?inAmt(n,0,seen)/c:0}
function inAmt(n,p,seen){return into(n.id,p).reduce((s,w)=>s+outAmt(byId(w.a),w.ap,new Set(seen)),0)}
const res=(n,t)=>{const p=T[n.k].i.indexOf(t);return p<0?0:inAmt(n,p)};
const cap=n=>10+Math.floor(res(n,'disk'));
function need(n){if(n.k==='feed')return{t:'net',v:Math.ceil(4*Math.pow(S.users/10,.55))};if(n.k==='sort')return{t:'cpu',v:Math.ceil(5*Math.max(1,Math.sqrt(S.users/200)))};if(n.k==='likes')return{t:'net',v:5};return null}
function connect(a,ap,b,bp){const na=byId(a),nb=byId(b),ta=type(na,1,ap),tb=type(nb,0,bp);
 if(a===b||(ta!==tb&&ta!=='any'&&tb!=='any')||(tb==='any'&&ta==='post')||(ta==='any'&&tb==='post'))return false;
 S.wires=S.wires.filter(w=>!(w.a===a&&w.ap===ap)&&!((tb==='post'||tb==='any')&&w.b===b&&w.bp===bp));S.wires.push({a,ap,b,bp});prune();return true}
function prune(){S.wires=S.wires.filter(w=>{const a=type(byId(w.a),1,w.ap),b=type(byId(w.b),0,w.bp);return a===b||a==='any'||b==='any'})}
const unlocked=k=>S.t>=T[k].at;
const price=k=>Math.round(T[k].price*1.13**(S.bought[k]||0));
const maxed=k=>(T[k].one&&!!first(k))||(T[k].max&&(S.bought[k]||0)>=T[k].max);
function pay(c){if(S.money<c)return false;S.money-=c;S.day.sp+=c;return true}
function buy(k){if(!unlocked(k)||maxed(k)||!pay(price(k)))return null;S.bought[k]=(S.bought[k]||0)+1;if(T[k].up){S.rate*=1.15;return true}return add(k)}
/* улучшение блока: у каждого уровня своя цена, каждая следующая покупка этого уровня дороже на 13% */
const upKey=n=>n.k+':'+(n.lvl+1);
const upPrice=n=>Math.round(BAL.tier*T[n.k].price/20*BAL.step**n.lvl*1.13**(S.bought[upKey(n)]||0));
function upgrade(n){if(!T[n.k].give||!pay(upPrice(n)))return false;const k=upKey(n);S.bought[k]=(S.bought[k]||0)+1;n.lvl++;return true}
const nextAlgo=()=>ALGO[S.algo]&&S.t>=(ALGO[S.algo].day-1)*DAY?ALGO[S.algo]:null;
function buyAlgo(){const a=nextAlgo();if(!a||!pay(a.price))return false;S.algo++;return true}
const WHO=['Мой кот','Сосед','Наш двор','Начальник','Бабушка','Курьер','Студент','Мэрия'],DID=['нашёл','сломал','обсуждает','покрасил','потерял','хвалит','ругает','снял на видео'],WHAT=['старый лифт','новый автобус','рецепт пирога','футбольный матч','цены на хлеб','дворовую собаку','ночной концерт','яму на дороге','свежий сериал'],END=['.','. Опять!','. Вы это видели?','. Фото в комментариях.'];
const pick=a=>a[Math.random()*a.length|0];
const makePost=()=>({w:[pick(WHO),pick(DID),pick(WHAT)],end:pick(END),likes:0});
const key=w=>w.toLowerCase();
function taste(w){const k=key(w);if(!(k in S.taste))S.taste[k]=Math.random()*2-1;return S.taste[k]}
function push(a,post){const w=from(a.id,0);if(!w)return false;const b=byId(w.b);if(b.q.length>=cap(b))return false;b.q.push(post);return true}
const score=p=>p.w.reduce((s,w)=>s+({up:1,down:-1}[S.rules[key(w)]]||0),0);
/* возвращает список показанных постов */
function tick(dt){const shown=[];S.t+=dt;
 for(const n of S.nodes){const d=need(n);n.eff=d?Math.min(1,res(n,d.t)/d.v):1}
 const src=first('src');S.gen+=S.rate*dt;while(S.gen>=1){S.gen--;S.wait=Math.min(999,S.wait+1)}
 while(S.wait>0&&from(src.id,0)&&push(src,makePost()))S.wait--;
 const so=first('sort');
 if(so){so.acc=Math.min(2,so.acc+so.eff*2.5*dt);while(so.acc>=1&&so.q.length){let i=0;so.q.forEach((p,j)=>{if(score(p)>score(so.q[i]))i=j});if(!push(so,so.q[i]))break;so.q.splice(i,1);so.acc--}}
 const f=first('feed');f.acc=Math.min(2,f.acc+f.eff*2*dt);
 while(f.acc>=1&&f.q.length){const p=f.q.shift();f.acc--;const m=p.w.reduce((s,w)=>s+taste(w),0)/3;p.likes=Math.max(0,Math.round((m+1)*S.users/12*Math.random()+m*3));
  let b=0;for(const w of p.w){const r=S.rules[key(w)];if(r)b+=taste(w)*(r==='up'?1:-1)}S.bonus=S.bonus*.85+b*.15;shown.push(p)}
 const fed=into(f.id,0).length?f.eff*Math.min(1,.55+S.rate)*(S.wait>5?.6:1):0;
 let q=1;if(so&&so.eff>0&&from(so.id,0)&&into(so.id,0).length){q+=.1*so.eff;const l=first('likes');if(l)q+=.2*l.eff;if(S.t>=300)q+=Math.max(-.2,Math.min(.35,S.bonus*.3))}
 S.sat=fed*q;const mult=ALGO.slice(0,S.algo).reduce((m,a)=>m*a.mult,1);
 S.users+=(.6+S.users*(BAL.k/Math.pow(1+S.users/BAL.u0,BAL.p)+BAL.early*Math.exp(-S.users/BAL.eu)))*S.sat*mult*dt;
 const e=BAL.income*Math.pow(S.users,BAL.ie)*S.sat*dt;S.money+=e;S.day.e+=e;return shown}
return{DAY,GOAL,BAL,T,ALGO,fresh,use,get,add,byId,first,into,from,type,give,outAmt,res,cap,need,connect,prune,unlocked,price,maxed,buy,upPrice,upgrade,nextAlgo,buyAlgo,tick,key,taste}})();
if(typeof module!=='undefined')module.exports=ENGINE;
