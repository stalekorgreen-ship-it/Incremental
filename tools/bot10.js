// бот: жадно покупает самое дешёвое, создаёт правила; проверяет, к какой минуте открыты все функции
global.window={NOBOOT:1};const fs=require('fs');const src=['src8/data8.js','src10/core10.js','src10/sys10.js'].map(f=>fs.readFileSync(__dirname+'/../game/'+f,'utf8')).join('\n');
eval(src+`
init10();global.toast=()=>{};let log=[];const W=['цены','мэрия','кот','матч','пожар','вирус','смартфон','взятки'];
for(let t=1;t<=31*60;t++){step();
 if(t%5==0){const L=SHOP.filter(shopOk).sort((a,b)=>priceOf(a)*(a.lv&&!(a.id=='power'&&S.load>.8)?3:1)-priceOf(b)*(b.lv&&!(b.id=='power'&&S.load>.8)?3:1));const it=L[0];if(it&&S.m>=priceOf(it)+5){buy(it.id);if(!it.lv)log.push(Math.round(t/60)+'м '+it.id+' $'+it.p)}}
 if(has('rules')&&S.rules.length<6&&t%60==0){S.rules.push({id:S.rid++,on:true,eff7:[],effD:0,hits:0,conds:[{k:'word',v:W[S.rules.length],op:'>'}],join:'and',act:S.rules.length%3==2?'limit':'2'});requeue()}
 if(has('analytics')&&t%30==0){S.data.int=has('d_int');S.data.beh=has('d_beh')}
 if(t%300==0)console.log('мин',t/60,'$',f(S.m),'+/мин',f(S.incNow),'польз',f(active()*rep()),'время',(S.days.at(-1)||{}).timeAvg?.toFixed(1),'нагр',(S.load||0).toFixed(2),'функций',Object.keys(S.f).length+'/'+SHOP_RAW.length,'ур.мощн',lvl('power'),'вех',Object.keys(S.goals).length)}
console.log(log.slice(-6).join(' | '));console.log('правила эфф7:',S.rules.map(r=>Math.round(r.eff7.reduce((a,b)=>a+b,0))).join(','));
`)
