from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1100,'height':700});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('http://localhost:8766');pg.wait_for_timeout(500);pg.locator('#icons .ico',has_text='Интернет').first.dblclick();pg.wait_for_timeout(300)
    def go(u):pg.fill('.addr',u);pg.press('.addr','Enter');pg.wait_for_timeout(250)
    hosts=pg.evaluate('Object.keys(WILD)')
    for i,h in enumerate(hosts):
        go(h);pg.screenshot(path=f'w_{i}.png')
        for u in pg.evaluate(f"SITES.find(s=>s.host==='{h}').pages.map(p=>'{h}'+(p.id?'/'+p.id:''))"):
            assert pg.evaluate(f"!!WEB.page('{u}').wild"),u
    go('vasin-dom.narod.net');pg.click('[data-tune]');pg.wait_for_timeout(600);assert 'выключить' in pg.inner_text('[data-tune]');pg.click('[data-tune]')
    pg.click('.secret');pg.wait_for_timeout(200);assert 'ТЫ НАШЁЛ' in pg.inner_text('.doc')
    go('ufo-ozersk.narod.net/guest');pg.fill('.doc [name=msg]','видел');pg.click('.doc form button');assert 'видел' in pg.inner_text('.doc')
    print('диких сайтов',len(hosts),'всего',pg.evaluate('SITES.length'),'ошибки',errs);b.close()
    ims=[Image.open(f'w_{i}.png').resize((550,350)) for i in range(len(hosts))]
    for k in range(0,len(ims),6):
        c=Image.new('RGB',(1100,1050))
        for j,m in enumerate(ims[k:k+6]):c.paste(m,((j%2)*550,(j//2)*350))
        c.save(f'sheet{k//6}.png')
