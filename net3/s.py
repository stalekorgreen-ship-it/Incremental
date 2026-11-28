from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1200,'height':800});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('http://localhost:8765');pg.evaluate('localStorage.clear()');pg.reload();pg.wait_for_timeout(500)
    pg.evaluate('__game.run(400)');pg.click('#br [data-page="feed"]');pg.wait_for_timeout(300)
    pg.screenshot(path='f1.png')
    # открыть комментарии у поста, где они есть
    for k in range(47):
        if pg.evaluate("[...document.querySelectorAll('[data-comments]')].some(b=>+b.textContent.replace(/\\D/g,'')>=3)"): break
        pg.click('[data-step="1"]')
    n=pg.evaluate("[...document.querySelectorAll('[data-comments]')].findIndex(b=>+b.textContent.replace(/\\D/g,'')>=3)")
    pg.locator('[data-comments]').nth(n).click();pg.wait_for_timeout(200);assert pg.locator('.cm').count()>=3
    pg.locator('[data-comments]').nth(n).scroll_into_view_if_needed();pg.screenshot(path='f2.png')
    pg.locator('[data-like]').first.click();assert 'on' in pg.locator('[data-like]').first.get_attribute('class')
    pg.click('[data-marks]');assert pg.locator('.marks').count()>0;pg.click('[data-marks]');assert pg.locator('.marks').count()==0
    pg.locator('.feed .who button.link[data-author]').first.click();pg.wait_for_timeout(200);assert 'подписчиков' in pg.inner_text('.feed');pg.screenshot(path='f3.png')
    pg.click('[data-home]');pg.locator('aside [data-comm]').first.click();assert 'участников' in pg.inner_text('.feed');pg.click('[data-home]')
    if pg.locator('[data-more]').count(): pg.locator('[data-more]').first.click()
    pg.locator('[data-photo]').first.click();pg.wait_for_timeout(200);pg.click('#br [data-page="files"]');assert pg.locator('#page .ph svg').count()>=1
    # все картинки по темам рисуются
    assert pg.evaluate("document.querySelectorAll('#page').length")==1
    bad=[]
    for i in range(48):
        pg.click('#br [data-page="feed"]') if i==0 else pg.click('[data-step="1"]')
        t=pg.inner_text('.feed')
        if any(c in t for c in ['<','>','{','}','undefined','NaN']): bad.append(i)
    print('людей с мусором в тексте',len(bad),'ошибки',errs);b.close()
