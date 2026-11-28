/* Дело: всё генерируется из одного зерна, поэтому у всех игроков данные одинаковые. Имена и города временные. */
const CASE=(()=>{
let seed=95;const rnd=()=>(seed=(seed*1664525+1013904223)%4294967296)/4294967296;
const int=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[int(0,a.length-1)];
const START=Date.UTC(2031,2,3); /* день 1, понедельник */
const date=d=>{const x=new Date(START+(d-1)*864e5);return String(x.getUTCDate()).padStart(2,'0')+'.'+String(x.getUTCMonth()+1).padStart(2,'0')};
const weekend=d=>(d-1)%7>4;
const TZ=4,HOME='Ольховск',DISTRICT='Заречный';
const BOSS='Корсаков Лев Андреевич',STAND='Ласс Тимур Игоревич';
const TRIPS=[{day:16,len:2,city:'Белогорье'},{day:30,len:2,city:'Порт-Невель'},{day:51,len:1,city:'Красный Бор'},{day:72,len:2,city:'Белогорье'}];
const SICK={from:50,to:56};
const OUT=[{day:6,h:20},{day:13,h:21},{day:24,h:19},{day:40,h:22}];
const inTrip=d=>TRIPS.find(t=>d>=t.day&&d<=t.day+t.len&&!(d>=SICK.from&&d<=SICK.to));
const sick=d=>d>=SICK.from&&d<=SICK.to;
const hm=(h,m)=>String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
const IP={home:'93.184.10.',work:'185.41.7.',hotel:{'Белогорье':'77.90.3.','Порт-Невель':'78.12.44.','Красный Бор':'79.5.61.'}};
/* журнал входов: время на сервере указано по UTC */
const LOG=[];const add=(day,local,acc,cookie,ip,ua)=>{let h=local-TZ,d=day;if(h<0){h+=24;d--}if(d>=1)LOG.push({day,srv:d,t:hm(h,int(0,59)),acc,cookie,ip,ua})};
for(let d=1;d<=100;d++){
 if(sick(d)){if(!weekend(d)){for(const h of [10,15])add(d,h,'user_418','c-7f3a',IP.work+'21','Окно 1366×768')}continue}
 const tr=inTrip(d);
 if(tr){add(d,pick([22,23]),'zakaz','c-b102',IP.hotel[tr.city]+int(2,90),'Ноутбук 1280×800');continue}
 const o=OUT.find(x=>x.day===d);
 add(d,pick([7,7,8]),'zakaz','c-b102',IP.home+int(2,250),'Ноутбук 1280×800');
 if(!weekend(d))add(d,pick([12,13,13,14]),'zakaz','c-7f3a',IP.work+'21','Окно 1366×768');else add(d,pick([9,10,11,14,15,16,17,18]),'zakaz','c-b102',IP.home+int(2,250),'Ноутбук 1280×800');
 for(const h of [o?o.h-1:pick([19,20,21]),pick([22,23,23]),...(rnd()<.25?[pick([9,11,15,17,18])]:[])])if(!o||h<o.h)add(d,h,'zakaz','c-b102',IP.home+int(2,250),'Ноутбук 1280×800')}
/* подменный сотрудник и до болезни, и после заходит со своего устройства */
for(const d of [9,22,37,60,81])add(d,pick([12,18]),'user_418','c-55e0','46.8.'+int(1,200)+'.'+int(2,250),'Телефон');
LOG.sort((a,b)=>a.day-b.day||a.t.localeCompare(b.t));
/* отключения: только один район совпадает со всеми четырьмя вечерами */
const PLACES=[['Ольховск','Заречный'],['Ольховск','Центральный'],['Ольховск','Вокзальный'],['Сосновец','Северный'],['Сосновец','Лесной'],['Даль-Озёрск','Приозёрный'],['Даль-Озёрск','Старый город']];
const OUTAGES=[];for(const o of OUT){OUTAGES.push({day:o.day,h:o.h,city:HOME,d:DISTRICT});const others=PLACES.slice(1);const must=others[OUT.indexOf(o)%others.length];
 for(const p of others)if(p===must||rnd()<.45)OUTAGES.push({day:o.day,h:o.h,city:p[0],d:p[1]})}
for(let i=0;i<40;i++){const p=pick(PLACES);const d=int(1,99);if(!OUT.some(o=>o.day===d))OUTAGES.push({day:d,h:int(1,23),city:p[0],d:p[1]})}
for(const [c,d] of PLACES.slice(1))if(OUT.every(o=>OUTAGES.some(x=>x.day===o.day&&x.h===o.h&&x.city===c&&x.d===d))){const i=OUTAGES.findIndex(x=>x.day===OUT[0].day&&x.h===OUT[0].h&&x.city===c&&x.d===d);OUTAGES.splice(i,1)}
OUTAGES.sort((a,b)=>a.day-b.day||a.h-b.h);
/* перелёты */
const SUR='Абрамов Белов Власов Громов Дроздов Ершов Жуков Зимин Ильин Крылов Лапин Мухин Носов Орлов Панов Рябов Сомов Титов Уваров Фомин Чернов Шилов Щукин Яшин Верин Гусев Котов Лосев Маслов Нечаев'.split(' ');
const FN='Антон Борис Виктор Глеб Денис Егор Илья Кирилл Максим Никита Олег Павел Роман Семён Фёдор'.split(' ');
const MN='Андреевич Борисович Викторович Денисович Игоревич Олегович Павлович Романович Сергеевич'.split(' ');
const used=new Set([BOSS,STAND]);const person=()=>{let n;do n=pick(SUR)+' '+pick(FN)+' '+pick(MN);while(used.has(n));used.add(n);return n};
const RETINUE=Array.from({length:7},person),HEAD='Ветров Игорь Павлович',CROWD=Array.from({length:260},person);
const FLIGHTS=[];const fl=(day,from,to,name,status='полёт',booked=day-int(6,12))=>FLIGHTS.push({day,no:'ВЛ-'+(100+((from+to).split('').reduce((s,c)=>s+c.charCodeAt(0),0)%800)),from,to,name,status,booked});
TRIPS.forEach((t,i)=>{const ill=t.day===51;
 for(const [day,from,to] of [[t.day,HOME,t.city],[t.day+t.len,t.city,HOME]]){
  for(const n of [HEAD,BOSS])fl(day,from,to,n,ill&&n===BOSS?'возврат':'полёт',day-9);
  if(ill)fl(day,from,to,STAND,'полёт',50);
  RETINUE.forEach((n,k)=>{if(k===0&&i===1)fl(day,from,to,n,'возврат'); /* ложный след: сдал билет, но в другую поездку */
   else if(!(k===1&&i===3)&&!(k===2&&i===0))fl(day,from,to,n)});
  for(let k=0;k<45;k++)fl(day,from,to,pick(CROWD),rnd()<.04?'возврат':'полёт')}});
for(let i=0;i<500;i++){const d=int(1,99),c=pick(['Белогорье','Порт-Невель','Красный Бор','Сосновец']);const out=rnd()<.5;fl(d,out?HOME:c,out?c:HOME,pick(CROWD.concat(RETINUE)))}
FLIGHTS.sort((a,b)=>a.day-b.day||a.name.localeCompare(b.name,'ru'));
return{date,TZ,HOME,DISTRICT,BOSS,STAND,HEAD,RETINUE,TRIPS,SICK,OUT,LOG,OUTAGES,FLIGHTS,IP,PLACES}})();
if(typeof module!=='undefined')module.exports=CASE;
