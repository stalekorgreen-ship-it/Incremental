// эталоны разных форм схемы: одна оценка против веток
const M=require('./sim.js');
function B(){const G=M.start();const add=(type,p)=>{const id='n'+G.seq++;G.nodes.push({id,type,x:0,y:0,lv:14,p:{...(M.B[type].p||{}),...p}});return id;},w=(a,ap,b,bp)=>{if(!M.connect(G,a,ap,b,bp))throw Error('нет связи '+ap+bp);};
 const all=add('all'),feed=add('feed'),sig=id=>add('signal',{src:id});
 const match=(cur,id)=>{const m=add('match');w(cur[0],cur[1],m,'posts');w(sig(id),'v',m,'sig');return[m,'yes'];};
 const lists=(a,b,mode)=>{const l=add('lists',{mode});w(a[0],a[1],l,'a');w(b[0],b[1],l,'b');return[l,'out'];};
 const rank=(cur,list,o={})=>{const r=add('rank',{pop:1,fresh:.5,...o});w(cur[0],cur[1],r,'posts');list.forEach(([id,wt],i)=>{w(sig(id),'v',r,'s'+(i+1));G.nodes.find(n=>n.id===r).p['w'+(i+1)]=wt;});return[r,'out'];};
 const clean=ids=>{let cur=[all,'posts'];for(const id of ids)cur=lists(cur,match(cur,id),'−');return cur;};
 return{G,all,match,lists,rank,clean,end:c=>{w(c[0],c[1],feed,'posts');return G;}};}
function meas(G,srcs,seeds=[1,2,3]){const o={q:0,a:0,away:0,sec:0,subs:0,comm:0,new:0,gone:0,stay:0},ok=[];let n=0;for(const seed of seeds){const S=M.init(seed);S.quest=99;for(const i of srcs)S.src[i]=3;S.lv.servers=30;for(let t=0;t<600;t++){M.step(S,G);if(t>150&&t%6===0){o.sec+=S.sec;o.q+=S.people.filter(p=>p.top&&p.top.n>=10&&p.top.subs>=3&&p.top.subs<=6&&p.top.comm>=2&&p.top.comm<=5&&p.top.new>=3).length;o.a+=S.people.filter(p=>p.top&&(p.top.gone?p.top.here>=5:p.top.here>=2&&p.top.here<=6)).length;o.away+=S.people.filter(p=>p.top&&p.top.gone&&p.top.here>=5).length/Math.max(1,S.people.filter(p=>p.top&&p.top.gone).length);for(const k of['subs','comm','new'])o[k]+=S.share[k];o.gone+=S.gone;o.stay+=S.stay;n++;}}}for(const k in o)o[k]=+(o[k]/n).toFixed(k==='sec'?0:3);return o;}
const P1=['history','blocks','nope','watch'],P2=[...P1,'subs','comm','search'],P3=[...P2,'ip','trip'];
module.exports={B,meas,P1,P2,P3};
if(require.main===module){const show=(name,G,src)=>console.log(name,JSON.stringify(meas(G,src)));let b;
 b=B();show('1 всё',b.end([b.all,'posts']),P1);
 b=B();show('1 только оценка',b.end(b.rank([b.all,'posts'],[['watch',2]])),P1);
 b=B();show('1 воронка',b.end(b.rank(b.clean(['history','blocks','nope']),[['watch',2]])),P1);
 b=B();show('1 без истории',b.end(b.rank(b.clean(['nope']),[['watch',2],['blocks',-3]])),P1);
 for(const [a,c,d] of [[1,1,1],[2,2,1],[3,3,0],[1,.5,1],[3,2,1],[.5,.5,2]]){b=B();show(`2 одна оценка ${a}/${c}/${d}`,b.end(b.rank(b.clean(['history','nope']),[['subs',a],['comm',c],['watch',d],['search',.5]])),P2);}
 const br=()=>{b=B();const c=b.clean(['history','nope']),x=b.rank(b.match(c,'subs'),[['watch',2]]),y=b.rank(b.match(c,'comm'),[['watch',2]]),z=b.rank(c,[['watch',2],['search',1]]);return[x,y,z];};
 {let[x,y,z]=br();show('2 ветки z+(x+y)',b.end(b.lists(z,b.lists(x,y,'+'),'+')),P2);}
 {let[x,y,z]=br();show('2 ветки x+(y+z)',b.end(b.lists(x,b.lists(y,z,'+'),'+')),P2);}
 for(const [t,i,w] of [[1,1,1.5],[3,1,1.5],[2,2,1.5],[3,.5,1.5],[3,.5,3],[2,1,3]]){b=B();show(`3 одна оценка trip${t} ip${i} w${w}`,b.end(b.rank(b.clean(['history','nope']),[['trip',t],['ip',i],['watch',w]])),P3);}
 const br3=()=>{b=B();const c=b.clean(['history','nope']);return[b.rank(b.match(c,'trip'),[['watch',2]]),b.rank(b.match(c,'ip'),[['watch',2]]),b.rank(c,[['watch',2]])];};
 {let[t,h,g]=br3();show('3 запасной путь',b.end(b.lists(b.lists(t,h,'>'),g,'+')),P3);}
 {let[t,h,g]=br3();show('3 просто смешать',b.end(b.lists(g,b.lists(t,h,'+'),'+')),P3);}
 {let[t,h,g]=br3();show('3 смешать trip с (ip+общее)',b.end(b.lists(t,b.lists(h,g,'+'),'+')),P3);}
}
