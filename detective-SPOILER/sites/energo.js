SITE({url:'ukensnab.vl',title:'УКЭнСнаб — энергосбыт области',tpl:'table',skin:'energo',keys:'свет электричество отключения авария энергия энергосбыт',
intro:'Журнал аварийных и плановых отключений. Время местное.',cols:['Дата','Время','Город','Район'],search:true,
rows:()=>CASE.OUTAGES.filter(o=>o.day<=G.day()).map(o=>[CASE.date(o.day),String(o.h).padStart(2,'0')+':00',o.city,o.d])});
