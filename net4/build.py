import os
read=lambda f:open(f,encoding='utf-8').read()
ui=read('ui.js').replace('/*JUICE*/',read('juice.js')).replace('/*PAGES*/',read('art.js')+read('pages.js'))
js='\n'.join([read('data.js'),read('core.js'),read('refs.js'),read('goals.js'),read('../net3/fun.js'),ui])
assert '</script' not in js
html=read('shell.html').replace('/*JS*/',js)
os.makedirs('out',exist_ok=True);open('out/index.html','w',encoding='utf-8').write(html)
print(len(html),'байт')
