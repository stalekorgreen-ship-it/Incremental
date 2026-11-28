/* Решатель пользуется только тем, что видит игрок. */
const C=require('../src/case.js');let bad=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)bad++};
const U=C.LOG.filter(r=>r.acc==='zakaz');
const hours=new Set(U.map(r=>+r.t.slice(0,2)));
let best=[];for(let st=0;st<24;st++){const g=[];for(let k=0;k<24&&!hours.has((st+k)%24);k++)g.push((st+k)%24);if(g.length>best.length)best=g}
const local=best.map(h=>(h+C.TZ)%24);ok(local[0]===0&&local.length>=6,'самое длинное молчание — это местная ночь: '+local.join(','));
const places=C.PLACES.filter(([c,d])=>C.OUT.every(o=>C.OUTAGES.some(x=>x.day===o.day&&x.h===o.h&&x.city===c&&x.d===d)));
ok(places.length===1&&places[0][1]===C.DISTRICT,'один район совпадает со всеми обрывами: '+places.join(' | '));
for(const o of C.OUT){const last=U.filter(r=>r.day===o.day).map(r=>(+r.t.slice(0,2)+C.TZ)%24);ok(Math.max(...last)<o.h,'в день '+o.day+' после отключения входов нет')}
const shared=C.LOG.filter(r=>r.cookie==='c-7f3a');ok(new Set(shared.map(r=>r.acc)).size===2,'общая метка у двух аккаунтов');
ok(C.LOG.filter(r=>r.acc==='user_418'&&r.cookie==='c-7f3a').every(r=>r.day>=C.SICK.from&&r.day<=C.SICK.to),'общая метка у второго только в неделю болезни');
let c=null;for(const t of C.TRIPS){const s=new Set(C.FLIGHTS.filter(f=>f.day===t.day&&f.from===C.HOME&&f.to===t.city).map(f=>f.name));c=c?c.filter(n=>s.has(n)):[...s]}
console.log('     с билетами во все 4 поездки:',c.length);
const sickTrip=C.TRIPS.find(t=>t.day>=C.SICK.from&&t.day<=C.SICK.to);
const fin=c.filter(n=>C.FLIGHTS.some(f=>f.name===n&&f.day===sickTrip.day&&f.status==='возврат'));
ok(c.length>1&&c.length<12,'после пересечения остаётся группа, а не один');
ok(fin.length===1&&fin[0]===C.BOSS,'ровно один сдал билет в неделю болезни: '+fin.join(','));
ok(C.TRIPS.filter(t=>t!==sickTrip).every(t=>C.LOG.some(r=>r.acc==='zakaz'&&r.day===t.day&&r.ip.startsWith(C.IP.hotel[t.city]))),'каждая поездка видна по адресу гостиницы');
const CHAT=new Function(require('fs').readFileSync(__dirname+'/../src/story.js','utf8')+';return CHAT')();
for(const o of C.OUT)ok(CHAT.filter(m=>m[0]===o.day).every(m=>m[1]+C.TZ<o.h),'день '+o.day+': нет сообщений после отключения');
ok(CHAT.every(m=>m[1]+C.TZ>=7&&m[1]+C.TZ<24),'сообщения не приходят ночью по местному времени');
ok(CHAT.every(m=>!(m[0]>=C.SICK.from&&m[0]<=C.SICK.to)),'во время болезни босс молчит');
process.exit(bad?1:0);
