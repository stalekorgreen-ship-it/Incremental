// правила новых пачек: проверяется то, что человек реально увидел в первых десяти постах
(function(root){
function make(M,H){const{travel,away,today,need,spot,wantLong,slotOf,OLD}=H;
const cnt=(t,f)=>t.filter(f).length;const here=(S,p)=>{const r=travel(S,p);return r<0?p.city:r;};
const between=(v,a,b)=>v>=a&&v<=b;
const P=[
{id:'near',title:'Через дорогу',srcs:['geo','home'],label:'людей, у кого районы на месте',goal:'Человек сейчас в одном районе, но бывает и в другом. В первых десяти: 3–5 постов из района, где он прямо сейчас, и хотя бы 5 не из этого района. Всю ленту одним двором не забить.',
 ok:(S,p,t)=>{const c=here(S,p),s=spot(S,p),k=cnt(t,x=>x.city===c&&x.district===s),o=p.hd===p.wd?9:cnt(t,x=>x.city===p.city&&x.district===(s===p.hd?p.wd:p.hd));return between(k,3,5)&&o>=2;}},
{id:'thin',title:'Тонкий канал',srcs:['device','net','visit'],uses:['subs'],label:'людей, у кого всё открылось и идёт через один',goal:'Первые четыре поста строго через один: из подписок, не из подписок, из подписок… (начать можно с любого). И ничего, что не открывается: при слабой связи ни одного видео в этих десяти, с телефона или без времени не больше двух длинных.',
 ok:(S,p,t,all)=>{const f=all.slice(0,10),sub=x=>p.subs.includes(x.author);return t.length>=10&&!(p.slow&&f.some(x=>x.fmt==='видео'))&&((p.phone||p.short)?cnt(f,x=>x.long)<=2:true)&&t.slice(0,4).every((x,i)=>!i||sub(x)!==sub(t[i-1]));}},
{id:'hours',title:'По расписанию',srcs:['clock','week','season'],label:'людей, у кого лента по расписанию',goal:'В первых десяти: тема сегодняшнего дня занимает от 3 до 5 мест, и она же стоит первой. Ничего летнего зимой. Не меньше 8 постов нужной сейчас длины.',
 ok:(S,p,t)=>{const d=today(S,p);return t.length>=10&&t[0].topic===d&&between(cnt(t,x=>x.topic===d),3,5)&&!t.some(x=>x.season==='летнее')&&cnt(t,x=>wantLong(S,p)||!x.long)>=8;}},
{id:'back',title:'Вернулся',srcs:['breaks','skip'],label:'людей, кого встретили правильно',goal:'Кто давно не заходил: первые шесть постов строго через один, пропущенный старый и свежий (начать можно с любого). Кто заходит постоянно: ни одного старого в первых десяти. Никому не показывать то, что он пролистывает. «Перерывы» есть только у вернувшихся.',
 ok:(S,p,t)=>{const old=x=>S.t-x.born>OLD;return t.length>=10&&!t.some(x=>x.topic===p.bore||p.hate.includes(x.topic))&&(away(S,p)?t.slice(0,6).every((x,i)=>!i||old(x)!==old(t[i-1])):!t.some(old));}},
{id:'circle',title:'Ближний круг',srcs:['close','saves','comments'],label:'людей, у кого весь круг на месте',goal:'Три вида своих авторов: близкие, те, кого сохраняют, и те, с кем спорят. В первых десяти каждого вида хотя бы по 2 поста, от одного автора не больше 3, и хотя бы 2 поста от чужих.',
 ok:(S,p,t)=>{const a={};for(const x of t)a[x.author]=(a[x.author]||0)+1;const g=l=>cnt(t,x=>l.includes(x.author));return t.length>=10&&g(p.close)>=2&&g(p.saves)>=2&&g(p.talk)>=2&&Math.max(...Object.values(a))<=3&&cnt(t,x=>!p.close.includes(x.author)&&!p.saves.includes(x.author)&&!p.talk.includes(x.author))>=2;}},
{id:'mouth',title:'Сарафанное радио',srcs:['friends','similar'],label:'людей, до кого дошёл сарафан',goal:'В первых десяти: хотя бы 3 поста, понравившихся друзьям, ещё 3 понравившихся только похожим людям (от друзей и от похожих не больше 5), 3–6 на темы не из привычных, и хотя бы 2 поста вообще без сарафана.',
 ok:(S,p,t)=>{const fr=x=>x.likers.some(i=>p.friends.includes(i)),sm=x=>x.likers.some(i=>p.similar.includes(i));return between(cnt(t,fr),3,5)&&between(cnt(t,x=>!fr(x)&&sm(x)),3,5)&&between(cnt(t,x=>!p.liked.includes(x.topic)),3,6)&&cnt(t,x=>!fr(x)&&!sm(x))>=2;}},
{id:'love',title:'Любимое, но не одно',srcs:['rewatch','likes','reposts'],label:'людей, кому не надоело',goal:'В первых десяти: самой любимой темы от 3 до 5 постов, второй по любимости хотя бы 2, темы для репостов хотя бы 2. Две одинаковые темы подряд нельзя.',
 ok:(S,p,t)=>t.length>=10&&between(cnt(t,x=>x.topic===p.liked[0]),3,5)&&cnt(t,x=>x.topic===p.liked[1])>=2&&cnt(t,x=>x.topic===p.share)>=2&&t.every((x,i)=>!i||x.topic!==t[i-1].topic)},
{id:'trace',title:'Чужие следы',srcs:['cookies','ads','profile'],uses:['search'],label:'людей, у кого сработали все следы',goal:'Сеть видит, что человек читал на чужих сайтах, на что кликал в рекламе и что покупал. Первый пост: то, что он ищет сегодня. В первых десяти каждая из трёх чужих тем хотя бы 2 раза, но ни одна тема не больше 4.',
 ok:(S,p,t)=>{const n=a=>cnt(t,x=>x.topic===a),m={};for(const x of t)m[x.topic]=(m[x.topic]||0)+1;return t.length>=10&&t[0].topic===need(S,p)&&n(p.hot)>=2&&n(p.adt)>=2&&n(p.shop)>=2&&Math.max(...Object.values(m))<=4;}},
];return P;}
root.makePacks=make;if(typeof module!=='undefined')module.exports=make;})(typeof window!=='undefined'?window:globalThis);
