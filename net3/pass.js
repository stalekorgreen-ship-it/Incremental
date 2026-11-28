const M=require('./sim.js'),R=require('./ref.js');
function run(i,G,limit=900){const S=M.init(7+i);S.quest=i;const q=M.QUESTS[i];for(let k=0;k<=i;k++)for(const s of M.QUESTS[k].srcs||[])S.src[s]=3;S.lv.servers=30;for(let t=0;t<limit;t++){M.step(S,G);if(S.quest>i)return'пройдено за '+t+' с';}return'нет: '+q.checks(S,G).filter(c=>!c.ok).map(c=>c.label).join('; ');}
let b;
b=R.B();console.log('1 воронка',run(1,b.end(b.rank(b.clean(['history','blocks','nope']),[['watch',2]]))));
b=R.B();console.log('1 только оценка',run(1,b.end(b.rank([b.all,'posts'],[['watch',2]]))));
const br=()=>{b=R.B();const c=b.clean(['history','nope']);return[b.rank(b.match(c,'subs'),[['watch',2]]),b.rank(b.match(c,'comm'),[['watch',2]]),b.rank(c,[['watch',2],['search',1]])];};
{const[x,y,z]=br();console.log('2 ветки',run(2,b.end(b.lists(z,b.lists(x,y,'+'),'+'))));}
for(const w of [[1,1,1],[1,.5,1],[2,1,2]]){b=R.B();console.log('2 одна оценка',w.join('/'),run(2,b.end(b.rank(b.clean(['history','nope']),[['subs',w[0]],['comm',w[1]],['watch',w[2]]]))));}
const br3=()=>{b=R.B();const c=b.clean(['history','nope']);return[b.rank(b.match(c,'trip'),[['watch',2]]),b.rank(b.match(c,'ip'),[['watch',2]]),b.rank(c,[['watch',2]])];};
{const[t,h,g]=br3();console.log('3 запасной путь',run(3,b.end(b.lists(b.lists(t,h,'>'),g,'+'))));}
for(const w of [[3,1],[3,.5],[2,2]]){b=R.B();console.log('3 одна оценка',w.join('/'),run(3,b.end(b.rank(b.clean(['history','nope']),[['trip',w[0]],['ip',w[1]],['watch',1.5]]))));}
