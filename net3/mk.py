s=open('sim.js').read()
i=s.index('//QUESTS\n') if '//QUESTS\n' in s else None
q=open('quests.js').read()
if i is not None: s=s.replace('//QUESTS\n','//Q[\n'+q+'//Q]\n')
else:
    a=s.index('//Q[\n');b=s.index('//Q]\n');s=s[:a]+'//Q[\n'+q+s[b:]
s=s.replace("const TG={};","const TG=typeof require!=='undefined'&&require('fs').existsSync(__dirname+'/targets.json')?require('./targets.json'):{/*TARGETS*/};") if 'const TG={};' in s else s
open('sim.js','w').write(s)
