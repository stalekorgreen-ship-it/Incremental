// все новые тексты в обоих родах: ищем склейки вроде «ушёлла»
const T=require('../ed/topics.js'),Sc=require('./topics2.js');const src=require('fs').readFileSync('topics2.js','utf8');
const forms=new Set();for(const m of src.matchAll(/([А-Яа-яё]*)<([^<>]*)>([а-яё]*)/g)){const[ ,a,v,z]=m,p=v.split('|');forms.add(a+(p[0]||'')+z+' / '+a+(p[1]||'')+z);}console.log([...forms].join('; '));
