// Диагностика: имеет ли смысл ▲/▼. Одинаковое состояние и одинаковый поток случайных чисел,
// меняется только действие с одним постом. A — ничего, B — ▲, C — ▼. Запуск: node tools/abc_test.js [early|mid]
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'../game/src/');
const mode=process.argv[2]||'early';global.window={NOBOOT:1};
let code='';for(const f of ['base','world','art','stories','chains','sim','tech','scale','explain'])code+=fs.readFileSync(D+f+'.js','utf8')+'\n';
code+="var toast=()=>{},mail=()=>{},face=()=>'',esc=s=>s,osUp=()=>{},draw=()=>{},icons=()=>{};";
code+=`
let _s=1;function rnd(){_s|=0;_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
Math.random=rnd;
function run(seed,act){_s=seed;S=BASE();POOL=[];AMAP.clear();init();
 ${'`'}${'`'};
 if(MODE=='mid'){['likes','accounting','comments','avatars','photo','reposts','notif','advert','era1','video','clusters','servers'].forEach(x=>S.f[x]=1);S.srv=2;for(let i=0;i<400;i++)addAgent(mkAgent(),pk(S.A))}
 for(let i=0;i<90;i++)step();
 // цель: первый пост во «Входящих» с позицией по вопросу
 S.nextFeed=S.t+3;let p=S.batch.find(x=>!x.wave&&x.t<NT&&ISSUE_OF(x.t)>=0&&Math.abs(x.s)>.3);if(!p){for(let g=0;g<50&&!p;g++){const q=agentPost(pk(S.A));if(q.t<NT&&ISSUE_OF(q.t)>=0&&Math.abs(q.s)>.3){p=q;S.batch.push(q)}}}const is=ISSUE_OF(p.t);_s=act==9?seed*13+5:seed*7+3;
 if(act==1){actLog(p,1);p.man=2.5}if(act<0){actLog(p,-1);p.man=-5}
 const v0=avgV(is,p.s),m0=S.earned,l0=S.tot.left,j0=S.tot.joined;const out={};
 for(let t=1;t<=600;t++){step();if(t==60||t==300||t==600){out[t]={reach:p.seenN,rx:p.rx,neg:p.neg,inc:S.earned-m0,net:(p.minc||0)-(p.dinc||0),users:Math.round(totalUsers()),trust:S.trust,mood:S.A.reduce((s,a)=>s+a.mood,0)/S.A.length,view:avgV(is,p.s)-v0,left:S.tot.left-l0,joined:S.tot.joined-j0}}}
 return out}
function avgV(is,s){return S.A.reduce((x,a)=>x+a.v[is]*Math.sign(s||1),0)/S.A.length}
const MODE='${mode}';const seeds=[11,22,33,44,55,66,77,88];const RES={A:[],A2:[],B:[],C:[]};
for(const sd of seeds){RES.A.push(run(sd,0));RES.A2.push(run(sd,9));RES.B.push(run(sd,1));RES.C.push(run(sd,-1))}
const keys=['reach','rx','neg','inc','net','users','joined','left','trust','mood','view'];
const mean=(arr,t,k)=>arr.reduce((s,o)=>s+o[t][k],0)/arr.length;
const fmt=x=>Math.abs(x)>=100?Math.round(x).toString():Math.abs(x)>=1?x.toFixed(1):x.toFixed(4);
let md='### Режим: '+MODE+' ('+seeds.length+' прогонов, среднее)\\n\\n| Через | Показатель | A ничего | B ▲ | C ▼ | B−A | C−A | шум A−A′ |\\n|---|---|---|---|---|---|---|---|\\n';
for(const t of [60,300,600])for(const k of keys){const a=mean(RES.A,t,k),b=mean(RES.B,t,k),c=mean(RES.C,t,k);md+='| '+t/60+' мин | '+k+' | '+fmt(a)+' | '+fmt(b)+' | '+fmt(c)+' | '+fmt(b-a)+' | '+fmt(c-a)+' | '+fmt(a-mean(RES.A2,t,k))+' |\\n'}
console.log(md);`;
code=code.replace('`'+'`;','');
eval(code);
