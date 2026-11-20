// ===================== ПИКСЕЛЬНАЯ ГРАФИКА =====================
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let s=seed>>>0||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const SKIN=['#f6d5bd','#eebf9b','#d9a07a','#b97d55','#8d5a3b','#f3c9a8'],HAIR=['#2b1b14','#5a3825','#a0522d','#e2b65c','#1c1c1c','#c23b6e','#3a5fcd','#9a9a9a','#e8e8e8','#7a2e2e'],BGC=['#ffd1e6','#c9f1ff','#d7f7c8','#fff1b8','#e2d4ff','#ffe0c7','#d0e8ff','#f2f2f2'];
const AVC={};
function avatar(name,px=3,opts={}){const key=name+px+(opts.old?'o':'');if(AVC[key])return AVC[key];const r=rng(hashStr(name)+(opts.seed||0));
 const sk=SKIN[Math.floor(r()*SKIN.length)],hc=opts.old?'#d0d0d0':HAIR[Math.floor(r()*HAIR.length)],bg=BGC[Math.floor(r()*BGC.length)];
 const style=Math.floor(r()*5),glasses=r()<.25,beard=r()<.2,blush=r()<.4,shirt=HAIR[Math.floor(r()*HAIR.length)]==hc?'#3a6ea5':['#3a6ea5','#c0392b','#27ae60','#8e44ad','#f39c12','#2c3e50'][Math.floor(r()*6)];
 const G=Array.from({length:12},()=>Array(12).fill(bg));const set=(x,y,c)=>{if(x>=0&&x<12&&y>=0&&y<12){G[y][x]=c;G[y][11-x]=c}};
 for(let y=3;y<10;y++)for(let x=3;x<6;x++)set(x,y,sk);for(let x=2;x<6;x++)set(x,10,shirt),set(x,11,shirt);set(4,10,sk);set(5,10,sk);
 // волосы
 for(let x=3;x<6;x++)set(x,2,hc);for(let x=3;x<6;x++)set(x,3,hc);
 if(style==1)for(let y=3;y<9;y++)set(2,y,hc);if(style==2){for(let y=3;y<11;y++)set(2,y,hc);set(3,4,hc)}if(style==3)for(let x=4;x<6;x++)set(x,1,hc);if(style==4){set(3,2,sk);set(4,2,sk);set(5,2,hc)}
 // лицо
 set(4,6,'#1b1b2f');if(glasses){set(3,6,'#111');set(4,5,'#111');set(5,6,'#111')}if(blush)set(3,7,'#f29bb2');
 set(5,8,'#a0405a');if(beard){for(let x=3;x<6;x++)set(x,9,hc);set(3,8,hc)}if(opts.shades){set(3,6,'#000');set(4,6,'#000');set(5,6,'#000')}
 let s='<svg viewBox="0 0 12 12" width="'+12*px+'" height="'+12*px+'" shape-rendering="crispEdges" aria-hidden="true">';
 for(let y=0;y<12;y++){let x=0;while(x<12){const c=G[y][x];let n=1;while(x+n<12&&G[y][x+n]==c)n++;s+='<rect x="'+x+'" y="'+y+'" width="'+n+'" height="1" fill="'+c+'"/>';x+=n}}
 return AVC[key]=s+'</svg>'}
// картинки к постам: пиксельные сценки по темам
const PAL=[['#ffe9a8','#ff9f68','#c94c4c','#5c3c92'],['#d6f5ff','#7cc6fe','#2a7ab0','#14385c'],['#e8ffd6','#8fd16a','#3f8f3a','#1f4d2b'],['#fff0f6','#ff9ec7','#d1477a','#6b1d3f'],['#f3e8ff','#bb9af7','#7c4dcc','#3a1f6b'],['#fff6e0','#f7c873','#c7862c','#6b4413']];
const ART={
0:'#c3#..........#....3333....#...3cccc3...#..3cc22cc3..#..3c2cc2c3..#..3cc22cc3..#...3cccc3...#....3333....#............',
1:'#c1#............#.....3333...#....311113..#..3333333333#..3111111113#..3111111113#..3333333333#...33....33.#............',
2:'#c2#.......1....#......111...#.....11111..#....1111111.#...111111111#......33....#......33....#.2222222222.#............',
3:'#c4#............#....333333..#...33333333.#...3.3.3.3..#...3.3.3.3..#...3.3.3.3..#..3333333333#..2222222222#............',
4:'#c3#............#..3......3..#..33....33..#..33333333..#..3.3333.3..#..33322333..#..33333333..#...333333...#............',
5:'#c5#............#.....33.....#....3333....#...333333...#..33333333..#...3.22.3...#...3.22.3...#...333333...#............',
6:'#c1#............#....3333....#....3113....#....3113....#....3113....#....3113....#....3223....#....3333....#............',
7:'#c4#............#..33333333..#.3322332233.#.3222332223.#.3322332233.#..33333333..#..33....33..#............#............',
8:'#c2#............#....3333....#...311113...#..31133113..#..31111113..#..31133113..#...311113...#....3333....#............',
9:'#c5#............#............#...222222...#..21111112..#..21111112..#..33333333..#...333333...#............#............',
10:'#c3#............#.....22.....#.....22.....#...222222...#...222222...#.....22.....#.....22.....#............#............',
11:'#c1#............#.3333333333.#.3111331113.#.3111331113.#.3111331113.#.3333333333.#............#............#............',
12:'#c0#.....3......#....333.....#.33333333...#...33333....#...33.33....#..33...33...#............#............#............',
13:'#c1#............#....3333....#...311113...#.3333333333.#.3333333333.#..22....22..#..22....22..#............#............',
14:'#c0#............#............#.333333333..#.322222223..#.333333333..#..33...33...#............#............#............'};
const ARTC={};
function postImage(t,seed){const key=t+'_'+(seed%6);if(ARTC[key])return ARTC[key];const raw=ART[t]||ART[14];const rows=raw.split('#').filter(Boolean).slice(1);const pal=PAL[seed%PAL.length];
 let s='<svg viewBox="0 0 24 12" width="100%" height="84" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true"><rect width="24" height="12" fill="'+pal[0]+'"/><rect y="9" width="24" height="3" fill="'+pal[1]+'" opacity=".5"/>';
 rows.forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=row[x];if(c=='.')continue;s+='<rect x="'+(x+6)+'" y="'+y+'" width="1" height="1" fill="'+pal[+c]+'"/>'}});
 return ARTC[key]=s+'</svg>'}
const ICONS={
lenta:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="2" y="1" width="12" height="14" fill="#fff"/><rect x="2" y="1" width="12" height="2" fill="#000080"/><rect x="4" y="5" width="8" height="1" fill="#000"/><rect x="4" y="7" width="6" height="1" fill="#000"/><rect x="4" y="9" width="8" height="1" fill="#000"/><rect x="10" y="11" width="3" height="3" fill="#e00"/></svg>',
tree:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="7" y="2" width="2" height="12" fill="#5a3825"/><rect x="3" y="3" width="10" height="5" fill="#27ae60"/><rect x="4" y="1" width="8" height="2" fill="#2ecc71"/><rect x="6" y="9" width="4" height="1" fill="#f1c40f"/></svg>',
up:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="2" y="10" width="3" height="4" fill="#3a6ea5"/><rect x="6" y="7" width="3" height="7" fill="#3a6ea5"/><rect x="10" y="3" width="3" height="11" fill="#3a6ea5"/><rect x="9" y="1" width="5" height="2" fill="#f1c40f"/></svg>',
rules:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="2" y="2" width="12" height="12" fill="#c0c0c0"/><rect x="3" y="4" width="2" height="2" fill="#27ae60"/><rect x="6" y="4" width="7" height="2" fill="#000"/><rect x="3" y="8" width="2" height="2" fill="#c0392b"/><rect x="6" y="8" width="7" height="2" fill="#000"/><rect x="3" y="11" width="10" height="1" fill="#808080"/></svg>',
lab:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="6" y="1" width="4" height="5" fill="#d0e8ff"/><rect x="4" y="6" width="8" height="8" fill="#d0e8ff"/><rect x="5" y="9" width="6" height="4" fill="#8e44ad"/><rect x="5" y="1" width="6" height="1" fill="#000"/></svg>',
aud:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="2" y="4" width="4" height="4" fill="#f6d5bd"/><rect x="10" y="4" width="4" height="4" fill="#d9a07a"/><rect x="6" y="2" width="4" height="4" fill="#eebf9b"/><rect x="1" y="9" width="6" height="5" fill="#3a6ea5"/><rect x="9" y="9" width="6" height="5" fill="#c0392b"/><rect x="5" y="7" width="6" height="7" fill="#27ae60"/></svg>',
ad:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="1" y="3" width="14" height="10" fill="#ff0"/><rect x="1" y="3" width="14" height="1" fill="#e00"/><rect x="1" y="12" width="14" height="1" fill="#e00"/><rect x="4" y="6" width="8" height="2" fill="#e00"/><rect x="5" y="9" width="6" height="1" fill="#000"/></svg>',
mail:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="1" y="4" width="14" height="9" fill="#fff"/><rect x="1" y="4" width="14" height="1" fill="#000"/><rect x="3" y="5" width="2" height="2" fill="#000"/><rect x="11" y="5" width="2" height="2" fill="#000"/><rect x="5" y="7" width="6" height="2" fill="#000"/></svg>',
people:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="5" y="2" width="6" height="6" fill="#f6d5bd"/><rect x="5" y="2" width="6" height="2" fill="#5a3825"/><rect x="6" y="5" width="1" height="1" fill="#000"/><rect x="9" y="5" width="1" height="1" fill="#000"/><rect x="3" y="9" width="10" height="6" fill="#c23b6e"/></svg>',
world:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="3" y="2" width="10" height="12" fill="#3a8fd6"/><rect x="2" y="4" width="12" height="8" fill="#3a8fd6"/><rect x="4" y="4" width="4" height="3" fill="#27ae60"/><rect x="9" y="8" width="3" height="4" fill="#27ae60"/></svg>',
srv:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="3" y="1" width="10" height="14" fill="#808080"/><rect x="4" y="3" width="8" height="2" fill="#404040"/><rect x="4" y="7" width="8" height="2" fill="#404040"/><rect x="4" y="11" width="8" height="2" fill="#404040"/><rect x="10" y="3" width="1" height="1" fill="#0f0"/><rect x="10" y="7" width="1" height="1" fill="#0f0"/></svg>',
press:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="1" y="2" width="14" height="12" fill="#f2f2f2"/><rect x="2" y="3" width="12" height="2" fill="#000"/><rect x="2" y="6" width="5" height="4" fill="#808080"/><rect x="8" y="6" width="6" height="1" fill="#000"/><rect x="8" y="8" width="6" height="1" fill="#000"/><rect x="2" y="11" width="12" height="1" fill="#000"/></svg>',
meme:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="2" y="2" width="12" height="12" fill="#fff1b8"/><rect x="4" y="5" width="2" height="2" fill="#000"/><rect x="10" y="5" width="2" height="2" fill="#000"/><rect x="4" y="10" width="8" height="1" fill="#000"/><rect x="3" y="9" width="1" height="1" fill="#000"/><rect x="12" y="9" width="1" height="1" fill="#000"/></svg>',
author:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="5" y="2" width="6" height="6" fill="#eebf9b"/><rect x="4" y="9" width="8" height="6" fill="#8e44ad"/><rect x="11" y="1" width="4" height="4" fill="#f1c40f"/><rect x="12" y="2" width="2" height="2" fill="#fff"/></svg>',
dash:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="1" y="2" width="14" height="11" fill="#000"/><rect x="2" y="10" width="2" height="1" fill="#0f0"/><rect x="4" y="8" width="2" height="1" fill="#0f0"/><rect x="6" y="9" width="2" height="1" fill="#0f0"/><rect x="8" y="5" width="2" height="1" fill="#0f0"/><rect x="10" y="6" width="2" height="1" fill="#0f0"/><rect x="12" y="3" width="2" height="1" fill="#0f0"/></svg>',
money:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="1" y="4" width="14" height="8" fill="#27ae60"/><rect x="2" y="5" width="12" height="6" fill="#2ecc71"/><rect x="6" y="6" width="4" height="4" fill="#27ae60"/></svg>',
help:'<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="2" y="2" width="12" height="12" fill="#ffffe1"/><rect x="6" y="4" width="4" height="1" fill="#000080"/><rect x="9" y="5" width="1" height="2" fill="#000080"/><rect x="7" y="7" width="2" height="2" fill="#000080"/><rect x="7" y="11" width="2" height="1" fill="#000080"/></svg>'};
