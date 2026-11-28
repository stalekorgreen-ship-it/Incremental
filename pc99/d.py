from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':700})
    pg.on('pageerror',lambda e:print('ERR',e));pg.on('console',lambda m:print('CON',m.text))
    pg.goto('http://localhost:8766');pg.wait_for_timeout(500);pg.locator('#icons .ico',has_text='Конструктор').first.dblclick();pg.wait_for_timeout(2500)
    for f in pg.frames[1:]:
        print(f.url, f.evaluate("[document.body.className, document.body.innerHTML.slice(0,200), typeof __game]"))
    print(pg.inner_text('.win .status'))
