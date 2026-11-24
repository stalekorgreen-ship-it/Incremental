// бот: жадно покупает функции, строит схемы из доступных модулей; проверяет, к какой минуте открыто всё
global.window={NOBOOT:1};const fs=require('fs');const src=['src8/data8.js','src10/core10.js','src10/bp10.js','src10/sys10.js'].map(f=>fs.readFileSync(__dirname+'/../game/'+f,'utf8')).join('\n');
eval(src+`
init10();global.toast=()=>{};let log=[];const W=['цены','мэрия','кот','матч','пожар','вирус','смартфон','взятки'];
const chain=(...ts)=>{if(!ts.every(ntOk)||S.bp.nodes.some(n=>n.t==ts[1]&&n.mark))return;let prev=null;for(const t of ts){const N=bpAdd(t,0,0);N.mark=1;if(t=='c_word')N.p.w=pk(W);if(prev)bpLink(prev.id,NT[prev.t].g.includes('cond')?'yes':'next',N.id);prev=N}};
const MIN=+process.argv[2]||31;
for(let t=1;t<=MIN*60;t++){step();
 if(t%5==0){const L=SHOP.filter(shopOk).sort((a,b)=>priceOf(a)*(a.lv&&!(a.id=='power'&&S.load>.8)?3:1)-priceOf(b)*(b.lv&&!(b.id=='power'&&S.load>.8)?3:1));const it=S.load>.8?SHOP.find(x=>x.id=='power'):L[0];if(it&&S.m>=priceOf(it)+5){buy(it.id);if(!it.lv)log.push(Math.round(t/60)+'м '+it.id+' $'+it.p)}}
 if(t%60==0){chain('ev_new','c_word','a_boost');chain('ev_check','c_ctr','a_boost');chain('ev_check','c_vel','a_pin');chain('ev_arch','c_likes','a_resend');chain('ev_check','c_views','a_aud_int');chain('ev_pick','u_int','a_u_boost');chain('ev_check','c_likes','a_aud_like')}
 if(has('analytics')&&t%30==0){S.data.int=has('d_int');S.data.beh=has('d_beh')}
 if(t%300==0)console.log('мин',t/60,'$',f(S.m),'+/мин',f(S.incNow),'польз',f(active()*rep()),'время',(S.days.at(-1)||{}).timeAvg?.toFixed(1),'нагр',(S.load||0).toFixed(2),'функций',Object.keys(S.f).length+'/'+SHOP.filter(x=>!x.lv).length,'узлов',S.bp.nodes.length)}
console.log(log.slice(-5).join(' | '));console.log('эффект:',S.bp.nodes.filter(n=>NT[n.t].g.includes('act')).map(n=>n.t+' '+Math.round((n.eff7||[]).reduce((a,b)=>a+b,0))).join(', '));
`)
