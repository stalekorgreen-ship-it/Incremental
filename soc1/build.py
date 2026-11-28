import os
read=lambda f:open(f,encoding='utf-8').read()
js='\n'.join(read(f) for f in ['core.js','levels.js','check.js','graph.js','ui.js'])
assert '</script' not in js
html=read('shell.html').replace('/*JS*/',js)
os.makedirs('out',exist_ok=True);open('out/index.html','w',encoding='utf-8').write(html);print(len(html),'байт')
