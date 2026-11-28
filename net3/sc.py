from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1000,'height':700});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto('http://localhost:8765');pg.evaluate('localStorage.clear()');pg.reload();pg.wait_for_timeout(500)
    pg.evaluate('__game.run(60)');pg.click('#br [data-page="feed"]')
    # берём функцию картинок из страницы и раскладываем по темам
    src=open('social.js').read();js=src[src.index('const shash'):src.index('// ——— счётчики')]
    pg.set_content('<style>body{margin:0;display:grid;grid-template-columns:repeat(3,320px);gap:6px}svg{width:320px;height:200px}.av{width:60px;height:60px}</style>')
    pg.evaluate("(code)=>{const f=new Function('photoSVG',code+';return {sceneSVG,avatar}')(()=>'');document.body.innerHTML=[...Array(11)].map((_,t)=>'<div>'+f.sceneSVG(40+t,t)+'</div>').join('')+'<div>'+[...Array(15)].map((_,i)=>f.avatar(i+1)).join('')+'</div>';}",js)
    pg.screenshot(path='scenes.png',full_page=True);print(errs);b.close()
