// эталоны: как пачку решает человек, который строит ветки
const A=require('./auto.js');const{match,minus,clean,rank,zip,then,ALL}=A;
const C=()=>clean('history','nope'),W=(t,extra=[],mix=0)=>rank(t,[['watch',2],...extra],mix);
const REFS={
near:()=>{const c=C(),h=match(c,'home'),g=minus(match(c,'geo'),'home');return zip(W(h),zip(W(g),W(minus(c,'home'),[['ip',2]])));},
thin:()=>{const c=match(match(match(C(),'net'),'device'),'visit');return zip(W(match(c,'subs')),W(minus(c,'subs')));},
hours:()=>{const c=match(match(C(),'season'),'clock');return zip(W(match(c,'week')),W(minus(c,'week')));},
back:()=>{const c=minus(C(),'skip');return zip(rank(match(c,'breaks'),[['watch',2]],0,1,0),rank(minus(c,'breaks'),[['watch',1]],0,0,2));},
circle:()=>{const c=C();return zip(zip(W(match(c,'close')),W(match(c,'saves'))),zip(W(match(c,'comments')),W(minus(minus(minus(c,'close'),'saves'),'comments'))));},
mouth:()=>{const c=C(),f=match(c,'friends'),s=minus(match(c,'similar'),'friends'),n=minus(c,'watch');return zip(zip(W(f),W(s)),zip(rank(match(n,'friends'),[['similar',1]]),W(c)));},
love:()=>{const c=C(),a=match(c,'rewatch'),b=minus(match(c,'likes'),'rewatch'),r=minus(match(c,'reposts'),'rewatch');return zip(W(a),zip(W(b),W(r)));},
trace:()=>{const c=C();return zip(zip(W(match(c,'search')),W(match(c,'cookies'))),zip(W(match(c,'ads')),W(match(c,'profile'))));},
};
module.exports=REFS;
