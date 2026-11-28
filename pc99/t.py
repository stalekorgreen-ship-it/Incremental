from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':700});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('http://localhost:8766');pg.wait_for_timeout(500);pg.screenshot(path='s_desk.png')
    ico=lambda n:pg.locator('#icons .ico',has_text=n).first
    cnt=lambda parent:pg.evaluate(f"OS.D.items.filter(i=>i.parent==='{parent}').length")
    # папка и текстовый файл правой кнопкой
    for what in ['Папку','Текстовый файл']:
        pg.mouse.click(700,300 if what=='Папку' else 400,button='right');pg.click('.menu button:has-text("Создать")');pg.click(f'.menu button:has-text("{what}")')
    assert ico('Новая папка').count() and ico('Новый документ').count()
    # перетащить файл в папку, значок по столу, папку в корзину
    def drag(a,x,y):
        r=a.bounding_box();pg.mouse.move(r['x']+30,r['y']+20);pg.mouse.down();pg.mouse.move(x,y,steps=8);pg.mouse.up()
    f=ico('Новая папка').bounding_box();drag(ico('Новый документ'),f['x']+35,f['y']+25);assert not ico('Новый документ').count()
    drag(ico('Новая папка'),900,200);assert abs(ico('Новая папка').bounding_box()['x']-870)<40
    ico('Новая папка').dblclick();w=pg.locator('.win').last;assert w.locator('.ico').count()==1
    w.locator('.ico').dblclick();ta=pg.locator('textarea.pad');ta.fill('привет');assert pg.evaluate("OS.D.items.some(i=>i.data==='привет')")
    r=pg.locator('.win').last.locator('.tb').bounding_box();pg.mouse.move(r['x']+80,r['y']+8);pg.mouse.down();pg.mouse.move(r['x']+300,r['y']+60,steps=5);pg.mouse.up()
    pg.screenshot(path='s_files.png')
    while pg.locator('.win').count(): pg.locator('.win.act [data-w="close"]').click()
    bin_=ico('Корзина').bounding_box();drag(ico('Новая папка'),bin_['x']+35,bin_['y']+25);assert cnt('bin')==1
    # пуск и все программы
    names=[('Программы',['Блокнот','Рисовалка','Калькулятор','Мой компьютер']),('Игры',['Сапёр','Косынка','Змейка','Пятнашки','Найди пару'])]
    for g,l in names:
        for n in l:
            pg.click('#start');pg.click(f'#startmenu button:has-text("{g}")');pg.locator('.menu').last.locator(f'button:has-text("{n}")').click();pg.wait_for_timeout(120)
            if n=='Сапёр': pg.locator('.mines button').nth(40).click();assert pg.locator('.mines button.o').count()>0
            if n=='Калькулятор':
                for k in ['7','×','6','=']: pg.click(f'.calc button[data-k="{k}"]')
                assert pg.input_value('.calc input')=='42'
            if n=='Змейка': pg.click('.win.act [data-a="go"]');pg.keyboard.press('ArrowDown');pg.wait_for_timeout(500)
            if n=='Косынка': pg.locator('.cards [data-z="s"]').click();pg.screenshot(path='s_cards.png')
            if n=='Пятнашки': pg.locator('.win.act [data-i]').nth(11).click()
            if n=='Найди пару': pg.locator('.win.act [data-i]').nth(0).click()
            if n=='Рисовалка':
                r=pg.locator('canvas').bounding_box();pg.mouse.move(r['x']+50,r['y']+50);pg.mouse.down();pg.mouse.move(r['x']+200,r['y']+120);pg.mouse.up();pg.click('.win.act [data-a="save"]');pg.locator('.win.act button:has-text("ОК")').click()
            pg.locator('.win.act [data-w="close"]').click()
    assert cnt('pics')==1
    # браузер: все сайты и все страницы открываются
    ico('Интернет').dblclick();pg.wait_for_timeout(300)
    bad=pg.evaluate("SITES.flatMap(s=>s.pages.map(p=>s.host+(p.id?'/'+p.id:''))).filter(u=>!WEB.page(u).site)")
    print('сайтов',pg.evaluate('SITES.length'),'страниц',pg.evaluate('SITES.reduce((a,s)=>a+s.pages.length,0)'),'битых',bad)
    def go(u): pg.fill('.addr',u);pg.press('.addr','Enter');pg.wait_for_timeout(200)
    go('пицца');assert pg.locator('.hit').count()>0;pg.locator('.hit a').first.click()
    go('pizza-ugolok.net/order');pg.locator('.doc input[type=checkbox]').first.check();pg.click('.doc [data-save]');assert cnt('docs')>=2;pg.screenshot(path='s_pizza.png')
    go('kotoklub.net/guest');pg.fill('.doc [name=msg]','мяу');pg.click('.doc form button');assert 'мяу' in pg.inner_text('.doc')
    for u in ['katalog.net','vestnik-ozerska.net','vasin-dom.narod.net','kino-rodina.net']:
        go(u);pg.screenshot(path=f's_{u.split(".")[0]}.png')
    pg.click('[data-bm="lenta.net/constructor"]');pg.wait_for_timeout(1500)
    fr=pg.frames[1]
    print('встроено',fr.evaluate("document.body.classList.contains('embedded')"))
    for t in ['src','join']: fr.click(f'[data-add="{t}"]')
    fr.evaluate('__game.run(3)');pg.screenshot(path='s_game.png')
    pg.click('[data-bm="lenta.net/feed"]');pg.wait_for_timeout(500);pg.screenshot(path='s_gfeed.png')
    if fr.locator('[data-photo]').count(): fr.locator('[data-photo]').first.click();assert cnt('down')>=1
    pg.click('[data-bm="lenta.net/people"]');pg.wait_for_timeout(300);fr.click('[data-dl="one"]');assert cnt('down')>=1
    fr.locator('#page [data-open="feed"]').click();pg.wait_for_timeout(300);assert pg.input_value('.addr')=='lenta.net/feed'
    pg.click('[data-n="back"]');pg.wait_for_timeout(200)
    pg.locator('.win.act [data-w="close"]').click();ico('Интернет').dblclick();pg.wait_for_timeout(400);pg.click('[data-bm="lenta.net/constructor"]');pg.wait_for_timeout(1500)
    assert pg.frames[-1].locator('.node').count()==2,'прогресс игры'
    pg.locator('.win.act [data-w="close"]').click();ico('Загрузки').dblclick();pg.locator('.win.act .ico').first.dblclick();pg.wait_for_timeout(200);pg.screenshot(path='s_down.png')
    n=pg.evaluate('OS.D.items.length');pg.reload();pg.wait_for_timeout(500);assert pg.evaluate('OS.D.items.length')==n
    pg.click('#start');pg.screenshot(path='s_start.png');pg.click('#startmenu button:has-text("Выключить")');pg.locator('.win.act button:has-text("Да")').click();pg.click('text=Включить снова')
    print('ошибки',errs);b.close()
