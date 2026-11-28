import glob
r=lambda p:open(p,encoding='utf-8').read()
js='\n'.join(r(p) for p in ['src/case.js','src/engine.js','src/story.js']+sorted(glob.glob('sites/*.js'))+['src/ui.js'])
open('index.html','w',encoding='utf-8').write(r('src/shell.html').replace('/*CSS*/',r('src/style.css')).replace('/*JS*/',js))
