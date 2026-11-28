import json
read=lambda f:open(f).read()
game=read('../net3/out/index.html')
src=json.dumps(game,ensure_ascii=False).replace('</','<\\/')
js='\n'.join(read(f) for f in ['os.js','apps.js','sites.js','wild.js','art99.js','look.js','wildsites.js','layouts.js','web.js'])+'\nOS.boot();'
assert '</script' not in js
import os;os.makedirs('out',exist_ok=True)
html=f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ЛентаОС 99 — компьютер</title><style>{read("os.css")}\n{read("web.css")}\n{read("wild.css")}\n{read("look.css")}\n{read("layouts.css")}\n{read("font99.css")}</style></head><body><script type="application/json" id="game-src">{src}</script><script>{js}</script></body></html>'
open('out/index.html','w').write(html);print(len(html))
