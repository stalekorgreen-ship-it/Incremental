/* Один сайт — один вызов SITE(). Шаблоны: text, news, forum, table. day — с какого дня сайт находится поиском. */
const SITES=[];const SITE=o=>SITES.push(Object.assign({day:1,keys:'',tpl:'text'},o));
