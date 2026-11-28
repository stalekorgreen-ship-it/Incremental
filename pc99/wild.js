// «дикие» страницы: у каждой свой хозяин и свой вкус. Вся графика и музыка нарисованы и сочинены кодом
(function(){
const uri=(s)=>`url("data:image/svg+xml,${encodeURIComponent(s).replace(/'/g,'%27')}")`;
const tile=(w,h,body)=>uri(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${body}</svg>`);
const R=(x,y,w,h,c)=>`<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${c}'/>`;
function rand(seed){let x=seed%2147483647||7;return n=>(x=x*48271%2147483647)%n;}
const seedOf=s=>[...String(s)].reduce((a,c)=>(a*33+c.charCodeAt(0))%2147483647,5381);
// пиксельные картинки: строки из букв, буква = цвет
function pix(rows,pal,size,cls){let b='';rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])b+=R(x,y,1.02,1.02,pal[ch]);}));return`<svg class="px ${cls||''}" viewBox="0 0 ${rows[0].length} ${rows.length}" width="${rows[0].length*size}" height="${rows.length*size}" shape-rendering="crispEdges">${b}</svg>`;}
const ART={
 star:[['....y....','....y....','...yyy...','yyyywyyyy','.yyyyyyy.','..yyyyy..','..yy.yy..','.yy...yy.','.y.....y.'],{y:'#ffe62e',w:'#fff'}],
 heart:[['.rr...rr.','rwrr.rrrr','rwrrrrrrr','rrrrrrrrr','.rrrrrrr.','..rrrrr..','...rrr...','....r....'],{r:'#ff2e6a',w:'#ffd0de'}],
 cat:[['.k.......k.','.kk.....kk.','.kokkkkkok.','.kkkkkkkkk.','.kgkkkkkgk.','.kkkkpkkkk.','..kkwwwkk..','...kkkkk...','..kkkkkkk.k','..kk.k.kkk.'],{k:'#222',o:'#e88',g:'#6f6',p:'#f8a',w:'#eee'}],
 mush:[['...rrrrr...','.rrwrrrwrr.','rrrrrwrrrrr','rwrrrrrrwrr','rrrrrrrrrrr','...bbbbb...','...bkbkb...','...bbbbb...','..bbbbbbb..'],{r:'#d8261c',w:'#fff',b:'#f2dcae',k:'#321'}],
 ufo:[['.....ccc.....','....cwccc....','...ccccccc...','.ggggggggggg.','gygggygggyggg','.ggggggggggg.','...ddddddd...'],{c:'#7ff6ff',w:'#fff',g:'#9aa2b8',y:'#ffe62e',d:'#586078'}],
 skull:[['..wwwwww..','.wwwwwwww.','wwkkwwkkww','wwkkwwkkww','wwwwkkwwww','.wwwwwwww.','..wkwkww..','..wwwwww..'],{w:'#eee9d8',k:'#171717'}],
 flower:[['...ppp...','..ppppp..','.pp.y.pp.','pppyyyppp','.pp.y.pp.','..ppppp..','...pgp...','....g....','..gggg...','....g....'],{p:'#ff7bd5',y:'#ffe62e',g:'#2fae3a'}],
 fish:[['....oooo......','..oooooooo..oo','.okoooooooo.oo','oooooowooooooo','.ooooooooooooo','..oooooooo..oo','....oooo......'],{o:'#ff9a2e',k:'#111',w:'#ffd9a0'}],
 car:[['....rrrrr.....','...rbbrbbr....','..rbbbrbbbr...','.rrrrrrrrrrrr.','rrrrrrrrrrrrry','.kkrrrrrrkkrr.','.kk......kk...'],{r:'#e23030',b:'#bfe9ff',k:'#111',y:'#ffe62e'}],
 pizza:[['yyyyyyyyyyy','oooooooooo o','.yyryyyyry.','..yyyyyyy..','..yryyryy..','...yyyyy...','....yry....','....yyy....','.....y.....'],{y:'#ffd34d',o:'#b8701e',r:'#c8281c'}],
 floppy:[['bbbbbbbbb.','bwwwwwwwbb','bwwwwwwwbb','bwwwwwwwbb','bbbbbbbbbb','bbsssssbbb','bbsskssbbb','bbsskssbbb'],{b:'#2038a8',w:'#eee',s:'#aab',k:'#112'}],
 note:[['....kkkkk','....kkkkk','....k...k','....k...k','....k...k','.kkkk.kkk','kkkkk kkkk','.kkk..kkk'],{k:'#ffb020'}],
 bolt:[['....yyyy','...yyyy.','..yyyy..','.yyyyyyy','....yyy.','...yyy..','..yy....','.y......'],{y:'#fff23a'}]};
const art=(n,size,cls)=>pix(ART[n][0],ART[n][1],size||5,cls);
// человечек с «фотографии»: каждый раз свой, но один и тот же для одного имени
function face(name,size,kind){const r=rand(seedOf(name)),pick=a=>a[r(a.length)],skin=pick(['#f4c9a0','#e8b084','#c98a5e','#ffd9b8']),h0=pick(['#2a1a0e','#8a5a22','#e8c45a','#b8381e','#555','#3a2a60']),hair=kind==='old'?'#c9c9d2':h0,shirt=pick(['#2e7d32','#6a1b9a','#c62828','#1565c0','#ef6c00','#00838f']),bg=pick(['#9fc4e8','#c8b8e8','#e8d8a8','#a8d8b8','#d8a8a8']);
 let b=R(0,0,24,26,bg)+R(4,20,16,6,shirt)+R(10,17,4,4,skin)+R(7,6,10,12,skin)+R(8,18,8,1,skin);const style0=r(4),style=kind==='f'?0:kind==='old'?1:style0||1;if(kind==='f')b+=R(5,5,3,15,hair)+R(16,5,3,15,hair);b+=R(6,3,12,4,hair)+(style===0?R(5,6,2,12,hair)+R(17,6,2,12,hair):style===1?R(8,1,8,2,hair)+R(6,6,2,4,hair):style===2?R(6,6,2,6,hair)+R(16,6,2,6,hair)+R(9,2,10,2,hair):R(7,6,10,2,hair));
 b+=R(9,10,2,2,'#1a1a1a')+R(13,10,2,2,'#1a1a1a')+(r(3)===0?`<path d='M8 9h4v4H8zM12 9h4v4h-4z' fill='none' stroke='#222' stroke-width='.6'/>`:'')+R(10,15,4,1,'#8a3a30')+((r(2)&&!kind)?R(9,14,1,1,'#8a3a30')+R(14,14,1,1,'#8a3a30'):'');
 return`<svg class="face" viewBox="0 0 24 26" width="${size||110}" height="${(size||110)*26/24|0}" shape-rendering="crispEdges">${b}</svg>`;}
// заголовок из объёмных букв
function wordart(text,c){const [a,b,edge,mode]=c,lines=text.split('|'),W=620,H=lines.length*76+24,id='g'+seedOf(text);let out=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>`;
 lines.forEach((l,j)=>{const fs=Math.min(68,Math.floor(980/Math.max(8,l.length))),y=66+j*76,letters=[...l],dy=letters.map((_,i)=>mode==='wave'?Math.round(Math.sin(i*.9)*9):mode==='jump'?(i%2?-7:7):mode==='arc'?Math.round(Math.pow((i-(letters.length-1)/2)/letters.length,2)*90)-10:0);let prev=0;const rel=dy.map(v=>{const d=v-prev;prev=v;return d;}).join(' ');
  const t=(dx,ex)=>`<text x="${W/2+dx}" y="${y+dx}" dy="${rel}" text-anchor="middle" font-family="Impact,'Arial Black','DejaVu Sans',sans-serif" font-size="${fs}" font-weight="900" ${ex}>${l}</text>`;
  for(let k=7;k>0;k--)out+=t(k,`fill="${edge}"`);out+=t(0,`fill="url(#${id})" stroke="#000" stroke-width="2" paint-order="stroke"`);});
 return`<svg class="wa ${mode}" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px">${out}</svg>`;}
const BG={
 stars:(a,b)=>{const r=rand(11);let s=R(0,0,120,120,a);for(let i=0;i<34;i++)s+=R(r(118),r(118),r(5)?1:3,r(5)?1:3,r(4)?b:'#fff');return tile(120,120,s);},
 camo:(a,b,c)=>{const r=rand(23);let s=R(0,0,96,96,a);for(let i=0;i<60;i++)s+=`<ellipse cx='${r(96)}' cy='${r(96)}' rx='${6+r(13)}' ry='${3+r(8)}' fill='${r(2)?b:c}'/>`;return tile(96,96,s);},
 check:(a,b)=>tile(40,40,R(0,0,40,40,a)+R(0,0,20,20,b)+R(20,20,20,20,b)),
 stripes:(a,b)=>tile(28,28,R(0,0,28,28,a)+`<path d='M-7 21L21 -7M7 35L35 7' stroke='${b}' stroke-width='9'/>`),
 bricks:(a,b)=>tile(48,32,R(0,0,48,32,a)+R(0,14,48,2,b)+R(0,30,48,2,b)+R(22,0,2,14,b)+R(46,16,2,14,b)),
 dots:(a,b)=>tile(26,26,R(0,0,26,26,a)+`<circle cx='7' cy='7' r='4' fill='${b}'/><circle cx='20' cy='20' r='4' fill='${b}'/>`),
 grid:(a,b)=>tile(24,24,R(0,0,24,24,a)+R(0,0,24,1,b)+R(0,0,1,24,b)),
 waves:(a,b)=>tile(60,24,R(0,0,60,24,a)+`<path d='M0 12q15-12 30 0t30 0' fill='none' stroke='${b}' stroke-width='3'/>`),
 sprites:(a,name)=>{const [rows,pal]=ART[name];let s=R(0,0,64,64,a);const put=(ox,oy)=>rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])s+=R(ox+x*2,oy+y*2,2,2,pal[ch]);}));put(4,4);put(36,36);return tile(64,64,`<g opacity='.9'>${s}</g>`)+'';}};
const fire=()=>{const r=rand(5);let s='';for(let x=0;x<80;x++){const h=6+r(18);s+=R(x*2,24-h,2,h,'#e8340a')+R(x*2,24-h*.65,2,h*.65,'#ff9a14')+R(x*2,24-h*.3,2,h*.3,'#fff23a');}return`<div class="fire" style='background-image:${tile(160,24,s)}'></div>`;};
const bulbs=(text)=>`<div class="bulbs"><span>${text}</span></div>`;
const sign=()=>`<div class="work">⚠ СТРАНИЧКА СТРОИТСЯ ⚠</div>`;
const rainbow='<div class="rainbow"></div>';
const box=(c,html,cls)=>`<div class="wbox ${cls||''}" style="--c:${c}">${html}</div>`;
const photos=(...l)=>`<div class="photos">${l.map(([n,cap,sz,k])=>`<figure>${face(n,sz,k)}<figcaption>${cap}</figcaption></figure>`).join('')}</div>`;
const pics=(...l)=>`<div class="photos">${l.map(([n,cap,sz])=>`<figure><div class="frame">${art(n,sz||8)}</div><figcaption>${cap}</figcaption></figure>`).join('')}</div>`;
const go=(u,t)=>`<a href="#" data-go="${u}">${t}</a>`;
const hidden=(u,t)=>`<a href="#" class="secret" data-go="${u}" title="">${t||'.'}</a>`;
window.WILDKIT={BG,art,face,wordart,fire,bulbs,sign,rainbow,box,photos,pics,go,hidden,uri,seedOf,rand,ART};
})();
