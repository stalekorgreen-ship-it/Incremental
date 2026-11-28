shell=open('shell.html').read()
sim=open('sim.js').read()

sim=sim.replace('{/*TARGETS*/}',open('targets.json').read())
js='\n'.join([open('../ed/topics.js').read(),open('topics2.js').read(),open('packs.js').read(),sim,open('fun.js').read(),open('ui.js').read().replace('/*JUICE*/',open('juice.js').read())])
assert '</script' not in js
import os;os.makedirs('out',exist_ok=True)
open('out/index.html','w').write(shell.replace('/*JS*/',js))
print(len(shell)+len(js),'байт')
