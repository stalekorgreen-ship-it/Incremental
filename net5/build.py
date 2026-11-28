import os
read=lambda f:open(f,encoding='utf-8').read()
js='\n'.join(read(f) for f in ['../net4/data.js','../net4/core.js','live.js','ui.js'])
assert '</script' not in js
html=read('shell.html').replace('/*JS*/',js)
os.makedirs('out',exist_ok=True);open('out/index.html','w',encoding='utf-8').write(html);print(len(html),'байт')
