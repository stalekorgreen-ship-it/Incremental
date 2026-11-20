// Проверка лаборатории (пункты 17.1–17.8 ТЗ). Запуск: node tools/lab_test.js
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'../game/src/');global.window={NOBOOT:1};
let code='var WIN={};';for(const f of ['base','world','art','stories','chains','sim','tech','scale','explain','lab'])code+=fs.readFileSync(D+f+'.js','utf8')+'\n';
code+=`var toast=()=>{},mail=()=>{},face=()=>'',esc=s=>s,osUp=()=>{},draw=()=>{},icons=()=>{},opt=()=>'',B=()=>'',bar=()=>'';
let _s=7;Math.random=function(){_s|=0;_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const ok=(c,m)=>console.log((c?'✓':'✗')+' '+m);
function net(n){S=BASE();POOL=[];AMAP.clear();init();['likes','comments','photo','avatars','dict','lab','labsub','era1','reposts'].forEach(x=>S.f[x]=1);for(let i=0;i<n;i++)addAgent(mkAgent(),pk(S.A));for(let i=0;i<60;i++)step()}
function research(words,parent,boost=true){const L=LAB();const h={id:L.nid++,name:words.join(','),words:words.map(w=>w[0]=='#'?w:normW(w)),status:'new',parent:parent==null?null:parent};L.hyp.unshift(h);const e=startResearch(h);if(e)throw e;while(L.run){if(boost)S.batch.forEach(p=>{if(!p.man&&p.toks.some(w=>h.words.includes(w)))p.man=2.5});step()}return h}
net(600);
const car=research(TOPICS[13].k);const C=LAB().cats.find(c=>c.id==car.res.cat);
ok(car.res.k=='found'&&C&&C.name=='Автомобилисты','1. Автомобильные слова → '+car.res.k+' '+(C?C.name:'')+' (устойчивость '+(car.res.st||0).toFixed(2)+', связность '+(car.res.coh||0).toFixed(2)+', наблюдений '+car.res.obs+')');
const mix=research(['машины','рецепты','футбол','нейросети']);ok(mix.res.k=='no','2. Смешанные слова → '+mix.res.k+' (coh '+(mix.res.coh||0).toFixed(2)+', st '+(mix.res.st||0).toFixed(2)+'; '+(mix.res.why||[]).join('; ').slice(0,120)+')');
ok(C&&audMatch({cat:C.id},S.A.find(a=>isMember(a,C)))&&!audMatch({cat:C.id},S.A.find(a=>!isMember(a,C))),'4. Категория работает в правилах: правило с категорией применяется только к её участникам');
const e1=wordEff(C,'машины'),e2=wordEff(C,'рецепты');ok(e1&&e2&&e1.pct>e2.pct,'5. Эффективность слов пересчитывается: «машины» '+(e1?Math.round(e1.pct):'?')+'%, «рецепты» '+(e2?Math.round(e2.pct):'?')+'%');
for(let i=0;i<60;i++)step();const sb=research(['#фото'],C.id);const SC=LAB().cats.find(c=>c.id==sb.res.cat);
ok(sb.res.k!='few'&&LAB().cats.some(c=>c.id==C.id),'6. Подгруппа: '+sb.res.k+' '+JSON.stringify(sb.res.why||'')+' coh '+(sb.res.coh||0).toFixed(2)+' st '+(sb.res.st||0).toFixed(2)+(SC?' «'+SC.name+'»':'')+'; родительская категория осталась ('+LAB().cats.length+' категорий)');
const ph=POOL.find(p=>p.img)||post({t:9,txt:'Пирог дня',img:true,h:.5});const hi=S.A.filter(a=>a.ph>.6),lo=S.A.filter(a=>a.ph<.15);const avgD=L=>L.reduce((s,a)=>s+dwellOf(a,ph,.4),0)/L.length;
ok(avgD(hi)>avgD(lo)+2,'7. Скрытые группы влияют без исследований: «любители картинок» смотрят фото '+avgD(hi).toFixed(1)+' с против '+avgD(lo).toFixed(1)+' с');
const js=JSON.stringify(S.lab);const back=JSON.parse(js);ok(back.cats.length==LAB().cats.length&&back.hyp.length==LAB().hyp.length,'8. Сохранение/загрузка: '+back.hyp.length+' гипотез, '+back.cats.length+' категорий');
net(0);S.A=S.A.slice(0,24);const few=research(['гаишники'],null,false);ok(few.res.k=='few','3. Мало данных → '+few.res.k+' ('+(few.res.why||[]).join('; ')+')');
`;eval(code);
