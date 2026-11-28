// пиксельные значки в духе старых систем: всё нарисовано здесь, на сетке 32×32
(function(){
const K='#000',W='#fff',G='#c0c0c0',D='#808080',N='#000080',Y='#ffff80',O='#e8b030',B='#1084d0',R='#c00000',E='#008000',L='#00ff00',T='#008080';
const r=(x,y,w,h,c)=>w>0&&h>0?`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`:'';
const box=(x,y,w,h,c,k=K)=>r(x,y,w,h,k)+r(x+1,y+1,w-2,h-2,c);
const bev=(x,y,w,h,c=G)=>r(x,y,w,h,K)+r(x,y,w-1,h-1,W)+r(x+1,y+1,w-2,h-2,D)+r(x+1,y+1,w-3,h-3,c);
const poly=(p,c,k=K)=>`<polygon points="${p}" fill="${c}" stroke="${k}" stroke-width="1"/>`;
// картинка из строк: каждая буква — точка
const C={k:K,w:W,g:G,d:D,n:N,y:Y,o:O,b:B,r:R,e:E,l:L,t:T,s:'#ffcc99'};
const art=(rows,x=0,y=0,s=1)=>rows.map((s_,j)=>[...s_].map((ch,i)=>C[ch]?r(x+i*s,y+j*s,s,s,C[ch]):'').join('')).join('');
const svg=b=>`<svg viewBox="0 0 32 32" shape-rendering="crispEdges">${b}</svg>`;
const folder=open=>poly('2.5,8.5 12.5,8.5 15.5,11.5 28.5,11.5 28.5,26.5 2.5,26.5',O)+r(4,10,8,2,Y)+(open?poly('7.5,15.5 31.5,15.5 27.5,27.5 2.5,27.5',Y):box(3,13,26,14,Y)+r(5,24,23,2,O));
const sheet=in_=>poly('6.5,2.5 20.5,2.5 26.5,8.5 26.5,29.5 6.5,29.5',W)+poly('20.5,2.5 20.5,8.5 26.5,8.5',G)+in_;
const lines=(x,y,list,c=N)=>list.map((w,i)=>r(x,y+i*3,w,1,c)).join('');
const monitor=(x,y,sc)=>bev(x,y,22,18)+box(x+3,y+3,16,11,sc)+r(x+4,y+4,5,1,'#80ffff')+r(x+4,y+4,1,4,'#80ffff')+box(x+8,y+17,6,4,D)+bev(x+3,y+20,16,4);
const bin=full=>(full?poly('9.5,9.5 13.5,2.5 17.5,8.5',W)+poly('15.5,9.5 22.5,4.5 24.5,10.5',Y):'')+poly('7.5,9.5 24.5,9.5 22.5,29.5 9.5,29.5',G)+[11,15,19].map(x=>r(x,13,2,13,D)+r(x+2,13,1,13,W)).join('')+box(5,7,22,4,G)+r(6,8,20,1,W);
const card=(x,y,c)=>box(x,y,15,21,W)+art(c==='r'?['rr.rr','rrrrr','rrrrr','.rrr.','..r..']:['..k..','.kkk.','kkkkk','k.k.k','..k..'],x+3,y+6,2);
const disc=(c,in_)=>art(['....kkkk....','..kkccccckk..','.kcccccccck.','.kcccccccck.','kcccccccccck','kcccccccccck','kcccccccccck','kcccccccccck','.kcccccccck.','.kcccccccck.','..kkcccckk..','....kkkk....'].map(s=>s.replace(/c/g,c)),4,4,2)+in_;
window.IC9={
 folder:svg(folder()),folderOpen:svg(folder(1)),
 docs:svg(folder()+box(11,3,13,15,W)+lines(13,6,[9,9,6,9])+box(3,16,26,11,Y)),
 text:svg(sheet(lines(9,12,[14,14,10,14,12,8]))),
 image:svg(sheet(box(8,11,16,13,'#80ffff')+poly('9,23 14,16 18,20 20,18 23,23',E,E)+r(19,13,3,3,'#ffff00'))),
 table:svg(box(3,5,26,22,W)+r(4,6,24,4,N)+[14,18,22].map(y=>r(4,y,24,1,D)).join('')+[11,20].map(x=>r(x,10,1,16,D)).join('')),
 pc:svg(monitor(2,2,T)+bev(25,6,6,21)+r(26,9,3,1,K)+r(26,12,3,1,K)+r(27,23,2,2,L)),
 bin:svg(bin()),binFull:svg(bin(1)),
 web:svg(disc('b',poly('9,10 14,8 17,12 13,15 15,19 11,22 7,16',L,E)+poly('20,13 25,12 26,18 22,23 19,18',L,E))+r(2,26,28,3,N)+r(5,27,6,1,'#ffff00')),
 mine:svg(r(15,3,2,26,K)+r(3,15,26,2,K)+art(['k.....k','.k...k.','..kkk..','..kkk..','..kkk..','.k...k.','k.....k'],5,5,3)+box(9,9,14,14,K)+r(12,12,4,4,W)),
 cards:svg(card(4,3,'k')+card(13,8,'r')),
 snake:svg([[3,22],[7,22],[11,22],[11,18],[11,14],[15,14],[19,14],[19,10],[19,6],[23,6]].map(p=>box(p[0],p[1],6,6,E)+r(p[0]+2,p[1]+2,2,2,L)).join('')+r(26,7,2,2,'#ffff00')+r(29,9,3,1,R)+box(25,24,6,6,R)),
 paint:svg(poly('4.5,14.5 12.5,8.5 24.5,9.5 29.5,17.5 25.5,25.5 16.5,23.5 12.5,28.5 5.5,23.5','#ffcc99')+box(8,15,5,5,R)+box(15,11,5,5,B)+box(21,17,5,5,E)+box(9,22,4,4,'#ffff00')+poly('14,21 27,2 30,4 17,22',O)+poly('14,21 17,22 12,27',K)),
 calc:svg(bev(6,2,21,28)+box(9,5,15,7,'#c0ffc0')+r(18,7,4,3,K)+[0,1,2].map(j=>[0,1,2,3].map(i=>bev(9+i*4,15+j*4,4,4,i===3?R:G)).join('')).join('')+bev(9,27,15,2)),
 fifteen:svg(bev(3,3,26,26,D)+[0,1,2].map(j=>[0,1,2].map(i=>i+j<4?bev(5+i*8,5+j*8,7,7)+r(8+i*8,7+j*8,1,3,N):'').join('')).join('')),
 memory:svg(box(3,4,12,16,B)+r(5,6,8,12,N)+box(17,12,12,16,W)+art(['..o..','.ooo.','ooooo','.ooo.','.o.o.'],18,15,2)),
 feed:svg(box(3,4,26,24,W)+r(4,5,24,5,'#a0104a')+box(6,13,6,6,'#ffcc99')+lines(14,13,[12,9])+box(6,21,6,5,'#80c0ff')+lines(14,22,[12,8])),
 flow:svg(r(12,8,8,2,B)+r(18,8,2,16,B)+r(18,22,5,2,B)+bev(2,3,13,11)+r(3,4,10,3,N)+bev(18,18,13,11)+r(19,19,10,3,'#800080')),
 help:svg(box(6,3,21,26,'#800080')+r(8,5,3,22,W)+art(['.yyy.','y...y','....y','..yy.','..y..','.....','..y..'],13,8,2)),
 info:svg(disc('w',art(['nn','..','nn','nn','nn','nn'],13,9,3))),
 question:svg(disc('w',art(['.nnn.','n...n','....n','..nn.','..n..','.....','..n..'],11,9,2))),
 warn:svg(poly('16,2 31,29 1,29','#ffff00')+r(14,11,4,10,K)+r(14,23,4,4,K)),
 power:svg(monitor(5,4,N)+art(['.....y','....y.','...y..','..yyy.','...y..','..y...'],10,8,2)),
 run:svg(bev(3,6,26,20,W)+r(4,7,24,5,N)+art(['k...','.k..','..k.','.k..','k...'],6,15,2)+r(15,23,8,2,K)),
 desk:svg(r(2,24,28,4,T)+box(6,6,18,14,W)+r(7,7,16,3,N)+poly('17,15 17,28 21,25 24,30 27,28 24,23 29,22',W)),
 logo:svg(box(3,3,26,26,N)+box(8,4,16,10,G)+r(18,6,4,6,N)+box(6,17,20,11,W)+r(8,19,16,2,'#ff6a00')+lines(8,23,[16,12],D)),
 sound:svg(box(4,12,7,9,G)+poly('11,12 18,5 18,28 11,21',G)+r(21,13,2,7,N)+r(25,10,2,13,N)+r(29,7,2,19,N)),
 mute:svg(box(4,12,7,9,G)+poly('11,12 18,5 18,28 11,21',G)+art(['r...r','.r.r.','..r..','.r.r.','r...r'],21,11,2))};
})();
