// ===================== ЛЕНТА.EXE v10 — ИНТЕРФЕЙС =====================
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const avImg=(i,px=36)=>'<img class="avi" src="'+IMGA[i%NAV]+'" width="'+px+'" height="'+px+'" alt="">';
const B=(t,a,ex='')=>'<button class="b95" data-a="'+a+'" '+ex+'>'+t+'</button>';
const opt=(arr,sel)=>arr.map(([v,n])=>'<option value="'+v+'"'+(String(v)===String(sel)?' selected':'')+'>'+n+'</option>').join('');
const bar=(v,cls='')=>'<div class="prog '+cls+'"><i style="width:'+clamp(v*100,0,100)+'%"></i></div>';
function toast(t,ms){const e=$('toast');if(!e)return;const d=document.createElement('div');d.className='w95 tst';d.innerHTML='<div class="tb"><span>ЛентаОС</span></div><div class="bd">'+t+'</div>';e.prepend(d);setTimeout(()=>d.remove(),ms||5000);while(e.children.length>4)e.lastChild.remove()}
function mail(t){S.mails.unshift({t,read:false});S.mails.length=Math.min(40,S.mails.length)}
const fc=n=>n<1e4?String(Math.round(n)):f(n);
const mins=x=>x==null?'—':x<1?Math.round(x*60)+' с':Math.round(x)+' мин';
let Q={q:'',arch:false,sort:'date',media:'',len:'',cat:'',tone:'',emo:''},QR=[],SELP=null,FEEDOFF=0,HOVER=false,DR=null,UF={age:'',reg:'',cat:'',min:50};
const newDR=()=>({conds:[{k:'word',op:'>',v:'',not:false}],join:'and',act:has('a_str')?'2':'2',aud:null,folder:''});
// ---------- пост ----------
function metaHTML(p){const R=rep();return '👁 '+fc(p.views*R)+(has('m_likes')?' · ♥ '+fc(p.likes*R):'')+(has('m_coms')?' · 💬 '+fc(p.coms*R):'')+(has('m_shares')?' · ⟲ '+fc(p.shares*R):'')+
 (has('m_cats')?' · <span class="tag">'+p.cats.map(c=>CATS[c]).join(', ')+'</span>':'')+(has('m_tone')?' · '+['😠','😐','🙂'][p.tone]:'')+(has('m_emo')?' · эмоц. '+Math.round(p.emo):'')}
function postHTML(p,o={}){const mark=has('mark_iv')&&(p.pri||p.blocked)?(p.blocked?' dnd':' upd'):'';
 return '<article class="post'+mark+'" data-a="psel" data-p="'+p.id+'"><div class="av">'+avImg(p.av,32)+'</div><div class="pc"><div class="meta"><b>'+esc(p.auN)+'</b> <span class="lbl">'+dateStr(p.born)+(p.media?' · '+p.media:'')+'</span></div>'+
 '<div class="txt">'+esc(p.txt)+'</div>'+(p.ph!=null&&!o.compact?'<div class="pimg'+(p.media=='видео'?' vid':'')+'"><img class="ph" loading="lazy" src="'+IMGP[p.ph%PHOTOS]+'" alt=""></div>':'')+
 '<div class="meta">'+metaHTML(p)+(p.blocked?' · <b class="dn">заблокирован</b>':p.pri?' · <b class="up">макс. приоритет</b>':'')+(p.ruleLim?' · <b class="dn">ограничен правилом</b>':p.boost>0?' · <span class="up">правила +'+p.boost+'</span>':'')+'</div></div></article>'}
function postDetail(p){if(!p)return '<div class="lbl">Нажми на пост, чтобы увидеть подробности и вмешаться.</div>';const inA=S.arch.includes(p);
 let h='<fieldset><legend>Публикация #'+p.id+(inA?' (архив)':'')+'</legend>'+postHTML(p,{compact:1})+'<div class="row">'+
 (inA?B('Восстановить из архива','prest','data-p="'+p.id+'"'):B('▲ Максимальный приоритет','piv','data-p="'+p.id+'" data-m="max"')+B('⛔ Заблокировать','piv','data-p="'+p.id+'" data-m="block"')+((p.pri||p.blocked)?B('Отменить','piv','data-p="'+p.id+'" data-m="none"'):''))+'</div>';
 if(has('r_log'))h+='<div class="lbl"><b>Журнал правил:</b> '+(p.log.length?p.log.map(x=>{const R=S.rules.find(r=>r.id==x.r);return '<div>#'+x.r+' '+(R?esc(R.name||''):'')+' → '+x.act+' <span class="lbl">(совпало: '+esc(x.met.join('; '))+')</span></div>'}).join(''):'правила не срабатывали')+'</div>';
 if(has('comments'))h+='<div class="lbl"><b>Комментарии ('+p.comments.length+'):</b>'+p.comments.slice(-5).map(c=>'<div>'+['😠','😐','🙂'][c.tone]+' <b>'+esc(c.n)+':</b> '+esc(c.txt)+'</div>').join('')+'</div>';
 return h+'</fieldset>'}
// ---------- конструктор ----------
function condKinds(){return Object.keys(COND).filter(k=>!COND[k].need||has(COND[k].need))}
function condEditor(c,i){const C=COND[c.k];let v='';
 if(C.val=='text')v='<input data-dc="v" data-i="'+i+'" value="'+esc(c.v)+'" placeholder="слово" style="width:110px">';
 else if(C.val=='num')v='<select data-dc="op" data-i="'+i+'">'+opt([['>','больше'],['<','меньше']],c.op)+'</select><input type="number" data-dc="v" data-i="'+i+'" value="'+esc(c.v||0)+'" style="width:70px">';
 else if(C.val=='cat')v='<select data-dc="v" data-i="'+i+'">'+opt(CATS.map((x,j)=>[j,x]),c.v)+'</select>';
 else if(C.val=='tone')v='<select data-dc="v" data-i="'+i+'">'+opt(TONE.map((x,j)=>[j,x]),c.v)+'</select>';
 return '<div class="row">'+(i?'<b>'+(DR.join=='or'?'ИЛИ':'И')+'</b>':'<b>ЕСЛИ</b>')+(has('c_not')?'<label><input type="checkbox" data-dc="not" data-i="'+i+'"'+(c.not?' checked':'')+'>НЕ</label>':'')+
 '<select data-dc="k" data-i="'+i+'">'+opt(condKinds().map(k=>[k,COND[k].n]),c.k)+'</select>'+v+(i?B('×','dcdel','data-i="'+i+'"'):'')+'</div>'}
function ruleEditor(){if(!DR)DR=newDR();const maxC=has('c_and')?3:1;const acts=has('a_str')?[['1',ACTN[1]],['2',ACTN[2]],['5',ACTN[5]],['limit',ACTN.limit]]:[['2',ACTN[2]],['limit',ACTN.limit]];
 return '<fieldset><legend>'+(DR.id?'Правка правила #'+DR.id:'Новое правило')+'</legend>'+DR.conds.map(condEditor).join('')+
 '<div class="row">'+(DR.conds.length<maxC?B('+ условие','dcadd'):'')+(has('c_or')&&DR.conds.length>1?'<select data-dr="join">'+opt([['and','все условия (И)'],['or','любое (ИЛИ)']],DR.join)+'</select>':'')+'</div>'+
 (has('c_aud')?'<div class="row"><label><input type="checkbox" data-dr="audOn"'+(DR.aud?' checked':'')+'>только для тех, у кого интерес</label>'+(DR.aud?'<select data-dr="audCat">'+opt(CATS.map((x,j)=>[j,x]),DR.aud.cat)+'</select> ≥ <input type="number" data-dr="audMin" value="'+DR.aud.min+'" style="width:50px">':'')+'</div>':'')+
 '<div class="row"><b>ТО</b><select data-dr="act">'+opt(acts,DR.act)+'</select>'+(has('r_folders')?'папка <input data-dr="folder" value="'+esc(DR.folder||'')+'" style="width:90px">':'')+'</div>'+
 '<div class="row">'+B(DR.id?'Сохранить':'Добавить правило','rsave')+(DR.id?B('Отмена','rnew'):'')+'</div></fieldset>'}
function ruleList(){if(!S.rules.length)return '<div class="lbl">Правил пока нет. Правила применяются по порядку и складываются.</div>';const groups={};S.rules.forEach((R,i)=>{(groups[R.folder||'']=groups[R.folder||'']||[]).push([R,i])});
 return Object.entries(groups).map(([g,L])=>(g?'<div class="sep">📁 '+esc(g)+'</div>':'')+L.map(([R,i])=>{const e7=R.eff7.reduce((a,b)=>a+b,0)+(R.effD||0);
  return '<div class="card'+(R.on?'':' off')+'"><div class="row"><b>#'+R.id+'</b><span class="lbl">'+esc(ruleTxt(R))+'</span></div><div class="row">'+(has('r_effect')?'<b class="'+(e7>=0?'up':'dn')+'">'+(e7>=0?'+':'')+f(e7)+' мин внимания за 7 дн.</b>':'')+'<span class="lbl">срабатываний: '+(R.hits||0)+'</span>'+
  B(R.on?'Выкл':'Вкл','rtog','data-r="'+R.id+'"')+B('✎','redit','data-r="'+R.id+'"')+(i?B('↑','rup','data-r="'+R.id+'"'):'')+B('🗑','rdel','data-r="'+R.id+'"')+'</div></div>'}).join('')).join('')}
// ---------- окна ----------
const shopBtn=it=>{const p=priceOf(it);return B('$'+f(p),'buy','data-id="'+it.id+'"'+(S.m>=p?'':' disabled'))};
const WIN={
 feed:{t:'Лента',i:'lenta',w:460,h:620,live:1,r(){const L=RANK.slice(0,has('feed_compact')?40:20);return '<div class="row"><b>Главная лента</b><span class="lbl">то, что сейчас видят люди'+(has('feed_pause')?' · пауза под курсором':'')+'</span></div><div class="feedbox">'+L.map(p=>postHTML(p,{compact:has('feed_compact')})).join('')+'</div>'}},
 search:{t:'Поиск',i:'rules',w:620,h:600,live:0,r(){const flt=[];if(has('s_media'))flt.push('<select data-q="media">'+opt([['','медиа: любое'],['any','с фото/видео'],['фото','фото'],['видео','видео'],['none','без медиа']],Q.media)+'</select>');
  if(has('s_len'))flt.push('<select data-q="len">'+opt([['','длина: любая'],['s','короткие'],['m','средние'],['l','длинные']],Q.len)+'</select>');if(has('m_cats'))flt.push('<select data-q="cat">'+opt([['','тематика: любая']].concat(CATS.map((c,i)=>[i,c])),Q.cat)+'</select>');
  if(has('m_tone'))flt.push('<select data-q="tone">'+opt([['','тон: любой']].concat(TONE.map((c,i)=>[i,c])),Q.tone)+'</select>');if(has('m_emo'))flt.push('<select data-q="emo">'+opt([['','эмоц.: любая'],['hi','высокая'],['lo','низкая']],Q.emo)+'</select>');
  const fl=has('s_combo')?flt:flt.slice(0,1);
  return '<div class="row"><input id="qs" value="'+esc(Q.q)+'" placeholder="слова (словоформы учитываются)" style="width:220px">'+B('Найти','find')+'<label><input type="checkbox" data-q="arch"'+(Q.arch?' checked':'')+'>с архивом</label>'+
  (has('sort_views')?'<select data-q="sort">'+opt([['date','по дате'],['views','по просмотрам'],['likes','по лайкам'],['coms','по комментариям'],['shares','по репостам']],Q.sort)+'</select>':'')+'</div>'+(fl.length?'<div class="row">'+fl.join('')+(flt.length>1&&!has('s_combo')?'<span class="lbl">несколько фильтров — в магазине</span>':'')+'</div>':'')+
  '<div class="row"><span class="lbl">Найдено: '+QR.length+'</span>'+(QR.length?B('▲ всем макс. приоритет','pivall','data-m="max"')+B('⛔ заблокировать все','pivall','data-m="block"'):'')+'</div>'+
  postDetail(SELP&&(postById(SELP)))+'<div class="feedbox">'+QR.slice(0,40).map(p=>postHTML(p,{compact:1})).join('')+'</div>'+
  (S.iv.length?'<fieldset><legend>Вмешательства ('+S.iv.length+')</legend>'+S.iv.slice(0,15).map(id=>{const p=postById(id);return p?'<div class="row"><span class="lbl">'+(p.blocked?'⛔':'▲')+' '+esc(p.txt.slice(0,50))+'</span>'+B('Отменить','piv','data-p="'+id+'" data-m="none"')+'</div>':''}).join('')+'</fieldset>':'')}},
 news:{t:'Новости',i:'mail',w:400,h:420,live:1,r(){return '<div class="lbl">Новости внешнего мира. Ключевые слова — для поиска. Если подавить связанные посты, событие закончится раньше.</div>'+(S.news.length?S.news.map(n=>{const E=S.ev.find(e=>e.id==n.id);const D=E&&EVT.find(x=>x.k==E.k);
  return '<div class="news"><b>'+esc(n.txt)+'</b><div class="lbl">'+n.src+' · '+dateStr(n.t)+(D?' · ключевые слова: '+D.kw.map(w=>'<a data-a="qw" data-w="'+w+'">'+w+'</a>').join(', ')+' · постов: '+S.P.filter(p=>p.ev==n.id).length:'')+'</div></div>'}).join(''):'<div class="lbl">Пока тихо.</div>')}},
 users:{t:'Пользователи',i:'people',w:600,h:540,live:0,r(){let L=S.U.filter(u=>!u.gone);if(has('u_filter')){if(UF.age)L=L.filter(u=>UF.age=='y'?u.age<25:UF.age=='m'?u.age>=25&&u.age<45:u.age>=45);if(UF.reg!=='')L=L.filter(u=>u.reg==+UF.reg)}
  if(has('u_filter2')&&UF.cat!=='')L=L.filter(u=>u.it[+UF.cat]>=UF.min);const u=S.sel&&byId(S.sel);
  let h=(has('u_filter')?'<div class="row"><select data-uf="age">'+opt([['','возраст: все'],['y','до 25'],['m','25–44'],['o','45+']],UF.age)+'</select><select data-uf="reg">'+opt([['','регион: все']].concat(REGIONS.map((r,i)=>[i,r])),UF.reg)+'</select>'+
   (has('u_filter2')?'<select data-uf="cat">'+opt([['','интерес: любой']].concat(CATS.map((c,i)=>[i,c])),UF.cat)+'</select> ≥ <input type="number" data-uf="min" value="'+UF.min+'" style="width:50px">':'')+'<span class="lbl">'+fc(L.length*rep())+' чел.</span></div>':'')+
  '<div class="ulist">'+L.slice(0,60).map(x=>'<span class="lw'+(S.sel==x.id?' on':'')+'" data-a="usel" data-id="'+x.id+'">'+avImg(x.av,16)+' '+esc(x.n)+'</span>').join('')+'</div>';if(!u)return h+'<div class="lbl">Выбери пользователя.</div>';
  h+='<fieldset><legend>'+esc(u.n)+'</legend>'+avImg(u.av,48)+(has('u_profile')?' <span>'+u.age+' лет · '+REGIONS[u.reg]+'</span>':'');
  if(has('u_stats'))h+='<div class="lbl">Время в соцсети: '+mins(u.timeAvg)+' в день · заходов в день: '+u.v.toFixed(1)+'</div>';
  if(has('u_int'))h+='<div class="lbl">Интересы: '+CATS.map((c,i)=>[c,u.it[i]]).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]+' '+x[1]).join(', ')+'</div>';
  if(has('u_beh'))h+='<div class="lbl">Лайкает '+Math.round(u.like*100)+'% · комментирует '+Math.round(u.com*100)+'% · спорит '+Math.round(u.argue*100)+'% · пролистывает '+Math.round(u.scroll*100)+'%</div>';
  if(has('u_hist'))h+='<table class="t95"><tr><th>Публикация</th><th>Действие</th></tr>'+u.hist.slice(0,30).map(x=>{const p=postById(x.p);return '<tr><td>'+(p?esc(p.txt.slice(0,50)):'—')+'</td><td>'+x.a+'</td></tr>'}).join('')+'</table>';
  return h+'</fieldset>'}},
 stats:{t:'Статистика',i:'dash',w:470,h:540,live:1,r(){const d=S.days[S.days.length-1]||{};const w=S.days.slice(-7);const sum=k=>w.reduce((s,x)=>s+(x[k]||0),0);
  let h='<div class="kv"><span>Пользователей</span><b>'+fc(active()*rep())+'</b><span>Доход в минуту</span><b>$'+f(S.incNow||0)+'</b>'+(has('m_time')?'<span>Время в соцсети</span><b>'+mins(d.timeAvg)+' в день</b><span>Заходов в день</span><b>'+(d.visits||0).toFixed(2)+'</b>':'')+
   (has('m_flow')?'<span>Пришло за день</span><b class="up">+'+fc((d.joined||0)*rep())+'</b><span>Ушло за день</span><b class="dn">−'+fc(d.left||0)+'</b>':'')+'</div>';
  if(has('m_flow'))h+='<div class="lbl">Новые приходят по репостам и рекомендациям знакомых — чем больше времени люди проводят в ленте, тем больше. Уходят те, кому скучно: если посты не цепляют несколько дней, человек заходит реже и потом пропадает.</div>';
  if(has('stat_cmp')&&S.days.length>=14){const p=S.days.slice(-14,-7);const ps=k=>p.reduce((s,x)=>s+(x[k]||0),0);h+='<div class="lbl">Неделя к неделе: доход '+pct(sum('inc'),ps('inc'))+' · внимание '+pct(sum('att'),ps('att'))+' · пришло '+pct(sum('joined'),ps('joined'))+'</div>'}
  if(has('aud_stats')){const L=S.U.filter(u=>!u.gone);h+='<fieldset><legend>Аудитория</legend><div class="lbl">Возраст: до 25 — '+pc(L,u=>u.age<25)+', 25–44 — '+pc(L,u=>u.age>=25&&u.age<45)+', 45+ — '+pc(L,u=>u.age>=45)+'</div><div class="lbl">Регионы: '+REGIONS.map((r,i)=>r+' '+pc(L,u=>u.reg==i)).join(', ')+'</div>'+
   (has('aud_int')?'<div class="lbl">Сильный интерес (≥50): '+CATS.map((c,i)=>[c,L.filter(u=>u.it[i]>=50).length/Math.max(1,L.length)]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]+' '+Math.round(x[1]*100)+'%').join(', ')+'</div>':'')+'</fieldset>'}
  h+='<table class="t95"><tr><th>День</th><th>Польз.</th>'+(has('m_time')?'<th>Время</th>':'')+'<th>Доход</th><th>Расход</th></tr>'+S.days.slice(-8).reverse().map(x=>'<tr><td>'+dateStr(x.day*TICK_DAY)+'</td><td>'+fc(x.users)+'</td>'+(has('m_time')?'<td>'+mins(x.timeAvg)+'</td>':'')+'<td>$'+f(x.inc)+'</td><td>$'+f(x.cost)+'</td></tr>').join('')+'</table>';return h}},
 comments:{t:'Комментарии',i:'mail',w:420,h:480,need:'comments',live:1,r(){const L=[];for(const p of S.P.slice(-60))for(const c of p.comments.slice(-3))L.push([p,c]);
  return L.slice(-40).reverse().map(([p,c])=>'<div class="news" data-a="psel" data-p="'+p.id+'">'+['😠','😐','🙂'][c.tone]+' <b>'+esc(c.n)+':</b> '+esc(c.txt)+'<div class="lbl">к посту «'+esc(p.txt.slice(0,40))+'…»</div></div>').join('')||'<div class="lbl">Пока никто не комментирует.</div>'}},
 rules:{t:'Конструктор',i:'tree',w:640,h:600,need:'rules',live:0,r(){const q=S.queue.rules;return '<div class="row"><b>Правила ('+S.rules.length+')</b>'+(q?'<span class="lbl">пересчёт: осталось '+q+' публикаций · '+S.recalcSpeed+'/с</span>'+bar(1-q/Math.max(1,S.recalcTotal)):'<span class="lbl">все публикации пересчитаны</span>')+'</div>'+ruleEditor()+ruleList()}},
 servers:{t:'Серверы',i:'srv',w:420,h:460,live:1,r(){const it=SHOP.find(x=>x.id=='power');return '<div class="kv"><span>Мощность</span><b>'+f(capacity())+' (ур. '+lvl('power')+')</b><span>Нагрузка</span><b class="'+(S.load>1?'dn':'')+'">'+Math.round((S.load||0)*100)+'%</b><span>Производительность</span><b class="'+(S.perf<1?'dn':'')+'">'+Math.round(S.perf*100)+'%</b>'+
  '<span>Электричество</span><b>×'+S.elecP.toFixed(2)+'</b><span>Вода</span><b>×'+S.waterP.toFixed(2)+'</b><span>Расход в день</span><b>$'+f(S.costDay||0)+'</b></div>'+bar(Math.min(1,S.load||0),S.load>1?'red':'')+
  '<fieldset><legend>Очереди</legend><div class="lbl">Пересчёт правил: '+S.queue.rules+' · новые посты: '+S.queue.posts+' · задержка ленты: '+S.queue.feed+' · данные: '+S.queue.data+'</div>'+(S.load>1?'<div class="dn">Перегрузка: лента обновляется реже, пересчёт медленнее, данные продаются хуже.</div>':'')+(S.m<0?'<div class="dn">Баланс отрицательный — серверы теряют производительность.</div>':'')+'</fieldset>'+
  (has('srv_fc')?'<div class="lbl">Прогноз расходов на 30 дней: $'+f(forecastCost(30))+'</div>':'')+'<div class="row"><b>Мощность +20%</b>'+shopBtn(it)+'</div>'}},
 ads:{t:'Реклама',i:'srv',w:340,h:260,live:1,r(){const it=SHOP.find(x=>x.id=='ads');return '<div class="bigm">$'+f(S.incNow||0)+'/мин</div><div class="kv"><span>Ставка</span><b>$'+adRate().toFixed(4)+' за минуту внимания</b><span>Всего с рекламы</span><b>$'+f(S.totals.ads)+'</b></div><div class="row"><b>Рекламная сеть ур. '+lvl('ads')+'</b>'+shopBtn(it)+'</div>'}},
 analytics:{t:'Аналитика',i:'dash',w:400,h:380,need:'analytics',live:1,r(){const nm={age:'Возраст',reg:'Регион',int:'Интересы',beh:'Поведение',pref:'Предпочтения'},nd={int:'d_int',beh:'d_beh',pref:'d_pref'};
  return '<div class="lbl">Выбери, какие данные собирать. Каждая категория нагружает серверы. Продажа — автоматически.</div>'+Object.keys(nm).filter(k=>!nd[k]||has(nd[k])).map(k=>'<div><label><input type="checkbox" data-dt="'+k+'"'+(S.data[k]?' checked':'')+'> '+nm[k]+'</label></div>').join('')+
  '<div class="kv"><span>Доход аналитики</span><b>$'+f(analyticsIncome())+' в день</b><span>Качество данных</span><b>×'+(1+eff('dataQ')).toFixed(1)+'</b></div>'}},
 shop:{t:'Магазин',i:'tree',w:480,h:580,live:1,r(){const L=SHOP.filter(shopOk);const one=L.filter(x=>!x.lv),mul=L.filter(x=>x.lv);
  return '<fieldset><legend>Новые функции</legend>'+(one.length?one.map(t=>'<div class="node"><div><b>'+t.n+'</b> <span class="lbl">'+t.b+'</span><div class="lbl">'+t.d+'</div></div>'+shopBtn(t)+'</div>').join(''):'<span class="lbl">Все функции куплены.</span>')+'</fieldset>'+
  '<fieldset><legend>Улучшения</legend>'+mul.map(t=>'<div class="node"><div><b>'+t.n+' · ур. '+lvl(t.id)+'</b> <span class="lbl">'+t.b+'</span><div class="lbl">'+t.d+'</div></div>'+shopBtn(t)+'</div>').join('')+'</fieldset>'}},
 goals:{t:'Цели',i:'help',w:340,h:380,r(){return GOALS.map(([id,n])=>'<div class="'+(S.goals[id]?'up':'')+'">'+(S.goals[id]?'✓':'○')+' '+n+'</div>').join('')}}};
const pc=(L,fn)=>Math.round(L.filter(fn).length/Math.max(1,L.length)*100)+'%';
const pct=(a,b)=>b?((a>=b?'+':'')+Math.round((a/b-1)*100)+'%'):'—';
// ---------- оконный менеджер ----------
let ZT=10;
function wstate(id){const w=WIN[id];if(!S.wins[id]){const n=Object.keys(S.wins).length;S.wins[id]={open:false,min:false,x:96+(n%6)*34,y:10+(n%6)*26,w:w.w,h:w.h,z:++ZT}}return S.wins[id]}
const avail=id=>!WIN[id].need||has(WIN[id].need);
function openWin(id){if(!avail(id))return;const s=wstate(id);s.open=true;s.min=false;s.z=++ZT;fitWin(s);render();draw(id)}
function fitWin(s){const dw=window.innerWidth,dh=window.innerHeight-40;s.w=Math.min(s.w,dw-4);s.h=Math.min(s.h,dh-4);s.x=clamp(s.x,0,Math.max(0,dw-s.w));s.y=clamp(s.y,0,Math.max(0,dh-s.h))}
function render(){const d=$('wins');Object.keys(WIN).forEach(id=>{const s=S.wins[id];let el=$('w_'+id);if(!s||!s.open||!avail(id)){if(el)el.remove();return}
  if(!el){el=document.createElement('section');el.className='w95 win';el.id='w_'+id;el.innerHTML='<div class="tb" data-drag="'+id+'"><span>'+WIN[id].t+'</span><span class="ctl"><i data-a="wmin" data-id="'+id+'">_</i><i data-a="wclose" data-id="'+id+'">×</i></span></div><div class="bd" id="b_'+id+'"></div>';d.appendChild(el);
   el.addEventListener('mousedown',()=>{if(s.z<ZT){s.z=++ZT;render()}});if(id=='feed'){el.addEventListener('mouseenter',()=>HOVER=true);el.addEventListener('mouseleave',()=>HOVER=false)}
   if(window.ResizeObserver)new ResizeObserver(()=>{if(el.offsetWidth>50){s.w=el.offsetWidth;s.h=el.offsetHeight}}).observe(el);draw(id)}
  el.style.cssText='left:'+s.x+'px;top:'+s.y+'px;width:'+s.w+'px;height:'+s.h+'px;z-index:'+s.z+';display:'+(s.min?'none':'flex');el.classList.toggle('active',s.z==ZT)});taskbar()}
function draw(id){const b=$('b_'+id);if(!b)return;const ae=document.activeElement;if(ae&&b.contains(ae)&&(ae.tagName=='SELECT'||ae.tagName=='INPUT'))return;const fb=b.querySelector('.feedbox'),fst=fb?fb.scrollTop:0,st=b.scrollTop;b.innerHTML=WIN[id].r();b.scrollTop=st;const nf=b.querySelector('.feedbox');if(nf)nf.scrollTop=fst}
const redraw=()=>Object.keys(WIN).forEach(id=>S.wins[id]&&S.wins[id].open&&draw(id));
function taskbar(){$('tasks').innerHTML=Object.keys(WIN).filter(id=>S.wins[id]&&S.wins[id].open&&avail(id)).map(id=>'<button class="b95 task'+(S.wins[id].z==ZT&&!S.wins[id].min?' on':'')+'" data-a="task" data-id="'+id+'">'+WIN[id].t+'</button>').join('')}
function icons(){if(!$('icons'))return;$('icons').innerHTML=Object.keys(WIN).filter(avail).map(id=>'<div class="ico" data-a="open" data-id="'+id+'">'+ICONS[WIN[id].i]+'<span>'+WIN[id].t+'</span></div>').join('');
 $('startmenu').innerHTML=Object.keys(WIN).map(id=>'<div class="smi'+(avail(id)?'':' dis')+'" data-a="open" data-id="'+id+'">'+ICONS[WIN[id].i].replace(/width="32" height="32"/,'width="20" height="20"')+' '+WIN[id].t+(avail(id)?'':' 🔒')+'</div>').join('')+'<div class="smi" data-a="reset">⟲ Новая игра</div>'}
// ---------- ввод ----------
let DRAG=null;
document.addEventListener('pointerdown',e=>{const t=e.target.closest('[data-drag]');if(!t||e.target.closest('[data-a]'))return;const id=t.dataset.drag,s=S.wins[id];s.z=++ZT;DRAG={id,dx:e.clientX-s.x,dy:e.clientY-s.y};render();e.preventDefault()});
document.addEventListener('pointermove',e=>{if(!DRAG)return;const s=S.wins[DRAG.id];s.x=e.clientX-DRAG.dx;s.y=e.clientY-DRAG.dy;fitWin(s);const el=$('w_'+DRAG.id);el.style.left=s.x+'px';el.style.top=s.y+'px'});
document.addEventListener('pointerup',()=>{DRAG=null});
window.addEventListener('resize',()=>{Object.values(S.wins).forEach(fitWin);render()});
function doSearch(){QR=search(Q.q,Q)}
function saveRule(){const conds=DR.conds.filter(c=>c.k!='word'||normW(c.v||''));if(!conds.length){toast('Впиши слово или выбери условие');return}
 const R=DR.id?S.rules.find(r=>r.id==DR.id):{id:S.rid++,on:true,eff7:[],effD:0,hits:0};Object.assign(R,{conds:conds.map(c=>Object.assign({},c,{v:c.k=='word'?normW(c.v):c.v})),join:DR.join,act:DR.act,aud:DR.aud?Object.assign({},DR.aud):null,folder:DR.folder||''});
 if(!DR.id)S.rules.push(R);DR=newDR();requeue();toast('Правило #'+R.id+' сохранено. Публикации пересчитываются.')}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!$('startmenu').contains(e.target)&&!e.target.closest('#startbtn'))$('startmenu').style.display='none';if(!t)return;const d=t.dataset,a=d.a;
 if(a=='start'){const m=$('startmenu');m.style.display=m.style.display=='block'?'none':'block';return}
 if(a=='open'){openWin(d.id);$('startmenu').style.display='none';return}
 if(a=='wclose'){S.wins[d.id].open=false;render();return}if(a=='wmin'){S.wins[d.id].min=true;render();return}
 if(a=='task'){const s=S.wins[d.id];if(s.min||s.z!=ZT){s.min=false;s.z=++ZT}else s.min=true;render();return}
 if(a=='pause'){S.paused=!S.paused;stats();return}
 if(a=='reset'){if(confirm('Начать заново?')){localStorage.removeItem('lenta10');location.reload()}return}
 if(a=='buy'){if(buy(d.id)){const it=SHOP.find(x=>x.id==d.id);toast('Куплено: <b>'+it.n+'</b>');icons();render();redraw()}return}
 if(a=='psel'){SELP=+d.p;openWin('search');draw('search');return}
 if(a=='piv'){const p=postById(+d.p);if(p){intervene(p,d.m);redraw()}return}
 if(a=='pivall'){QR.filter(p=>S.P.includes(p)).forEach(p=>intervene(p,d.m));redraw();return}
 if(a=='prest'){const p=postById(+d.p);if(p){restore(p);doSearch();draw('search')}return}
 if(a=='find'){Q.q=$('qs').value;doSearch();draw('search');return}
 if(a=='qw'){Q.q=d.w;doSearch();openWin('search');return}
 if(a=='usel'){S.sel=+d.id;draw('users');return}
 if(a=='dcadd'){DR.conds.push({k:'word',op:'>',v:'',not:false});draw('rules');return}if(a=='dcdel'){DR.conds.splice(+d.i,1);draw('rules');return}
 if(a=='rsave'){saveRule();draw('rules');return}if(a=='rnew'){DR=newDR();draw('rules');return}
 const R=d.r&&S.rules.find(r=>r.id==+d.r);
 if(a=='rtog'&&R){R.on=!R.on;requeue();draw('rules');return}if(a=='rdel'&&R){S.rules=S.rules.filter(x=>x!==R);requeue();draw('rules');return}
 if(a=='redit'&&R){DR=JSON.parse(JSON.stringify({id:R.id,conds:R.conds,join:R.join,act:R.act,aud:R.aud,folder:R.folder}));draw('rules');return}
 if(a=='rup'&&R){const i=S.rules.indexOf(R);S.rules.splice(i,1);S.rules.splice(i-1,0,R);requeue();draw('rules');return}});
document.addEventListener('change',e=>{const d=e.target.dataset,el=e.target,val=el.type=='checkbox'?el.checked:el.value;
 if(d.q){Q[d.q]=val;doSearch();draw('search');return}
 if(d.uf){UF[d.uf]=d.uf=='min'?+val:val;draw('users');return}
 if(d.dt){S.data[d.dt]=val;draw('analytics');return}
 if(d.dc){const c=DR.conds[+d.i];if(d.dc=='k'){c.k=val;c.v=COND[val].val=='num'?10:COND[val].val=='text'?'':0;c.op='>'}else c[d.dc]=val;draw('rules');return}
 if(d.dr){if(d.dr=='audOn')DR.aud=val?{cat:0,min:50}:null;else if(d.dr=='audCat')DR.aud.cat=+val;else if(d.dr=='audMin')DR.aud.min=+val;else DR[d.dr]=val;draw('rules')}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.id=='qs'){Q.q=e.target.value;doSearch();draw('search')}});
function stats(){$('tray').innerHTML=B(S.paused?'▶':'⏸','pause')+' '+dateStr()+' &nbsp; 💲'+f(S.m)+' (+'+f(S.incNow||0)+'/мин) &nbsp; 👥 '+fc(active()*rep())}
// ---------- сохранение ----------
function save(){try{const o=Object.assign({},S,{U:S.U.map(u=>Object.assign({},u,{hist:u.hist.slice(0,30)})),arch:S.arch.slice(-500)});localStorage.setItem('lenta10',JSON.stringify(o))}catch(e){}}
function loadGame(){try{const o=JSON.parse(localStorage.getItem('lenta10'));if(!o||o.v!=10)return false;S=Object.assign(BASE10(),o);UMAP.clear();PMAP.clear();S.U.forEach(u=>UMAP.set(u.id,u));S.P.concat(S.arch).forEach(p=>PMAP.set(p.id,p));S.paused=false;rerank();return true}catch(e){return false}}
let NB=0;
function tick(){step();stats();if(S.paused)return;Object.keys(WIN).forEach(id=>{if(WIN[id].live&&S.wins[id]&&S.wins[id].open&&!S.wins[id].min&&!(id=='feed'&&HOVER&&has('feed_pause')))draw(id)});
 if(S.t%3==0&&S.wins.rules&&S.wins.rules.open&&S.queue.rules)draw('rules');const nb=SHOP.filter(x=>!x.lv&&shopOk(x)&&S.m>=x.p).length;if(nb>NB)icons();NB=nb;if(S.t%10==0){icons();render();save()}}
function boot(){if(!loadGame()){init10();['feed','stats','shop','search','news','servers','ads','goals','users'].forEach(wstate);const vw=window.innerWidth;
  Object.assign(S.wins.feed,{x:96,y:8,open:true});Object.assign(S.wins.stats,{x:Math.min(570,vw-470),y:8,open:true});Object.assign(S.wins.shop,{x:Math.min(1050,vw-480),y:8,open:vw>1400});Object.assign(S.wins.news,{x:Math.min(570,vw-400),y:370,open:true})}
 ZT=Math.max(10,...Object.values(S.wins).map(w=>w.z||0));document.body.style.background='#008080';icons();Object.values(S.wins).forEach(fitWin);render();stats();setInterval(tick,1000)}
(function(){const st=document.createElement('style');st.textContent='.post{display:flex;gap:6px;align-items:flex-start}.post .pc{flex:1;min-width:0}.post .txt{white-space:normal}.bigm{font-size:28px;font-weight:bold}.card.off{opacity:.5}.post{cursor:pointer}.post.upd{background:#eaffea}.post.dnd{background:#ffeaea}.dn{color:#a00}.up{color:#063}.ulist{max-height:110px;overflow:auto}.lw{display:inline-block;margin:2px;padding:1px 4px;border:1px solid #888;background:#fff;cursor:pointer;font-size:12px}.lw.on{background:#ffe680}.news a{color:#00a;cursor:pointer;text-decoration:underline}.feedbox{max-height:none}';document.head.appendChild(st)})();
if(!window.NOBOOT)boot();
