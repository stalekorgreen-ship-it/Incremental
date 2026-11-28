from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':768});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto('http://localhost:8766');pg.wait_for_timeout(600)
    pg.locator('#icons .ico',has_text='Интернет').first.dblclick();pg.wait_for_timeout(300)
    pg.get_by_text('★ ЛентаОС').first.click();pg.wait_for_timeout(1500)
    fr=[f for f in pg.frames if f!=pg.main_frame][0]
    fr.evaluate('__game.run(200)');pg.wait_for_timeout(400)
    fr.locator('.feed .who button.link[data-author]').first.click();pg.wait_for_timeout(300);assert 'подписчиков' in fr.inner_text('.feed')
    fr.click('[data-home]');fr.locator('[data-photo]').first.click();pg.wait_for_timeout(300)
    pg.screenshot(path='pcfeed.png');print('лента внутри компьютера работает, ошибки',errs);b.close()
