# заказы, лента и люди, разбор ошибок, отмена, сохранение, меню. Нужен /tmp/save.json от play.py (все задания пройдены)
import json,subprocess
from playwright.sync_api import sync_playwright
save=json.load(open('/tmp/save.json'))
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page(viewport={'width':1100,'height':700});err=[]
    pg.on('pageerror',lambda e:err.append(str(e)));pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.goto('http://localhost:8767/');pg.wait_for_timeout(500);J=pg.evaluate
    def ok(v,m):
        assert v,m
    # новая игра: обучение ведёт до конца
    guides=[]
    def g():
        t=pg.inner_text('#guide') if pg.locator('#guide.on').count() else '';guides.append(t);return t
    node=lambda i:pg.locator(f'.node[data-id="{i}"]')
    def add(t):
        pg.click(f'#dock [data-add="{t}"]');return pg.locator('.node.sel').get_attribute('data-id')
    ok('Шаг 1' in g(),'шаг 1');a=add('src');ok('Выбери' in g(),'выбор');node(a).locator('select').select_option('Слова постов');pg.wait_for_timeout(50)
    ok('Шаг 2' in g(),guides);bb=add('src');node(bb).locator('select').select_option('Начальный словарь');pg.wait_for_timeout(50)
    ok('Шаг 3' in g(),guides);j=add('join');ok('Шаг 4' in g(),guides)
    pg.click('#zoom [data-z="tidy"]');pg.screenshot(path='/tmp/u_guide.png')
    # провод перетаскиванием
    def drag(x,y):
        s=x.bounding_box();t=y.bounding_box();pg.mouse.move(s['x']+s['width']/2,s['y']+s['height']/2);pg.mouse.down();pg.mouse.move(t['x']+t['width']/2,t['y']+t['height']/2,steps=8);pg.mouse.up()
    drag(node(a).locator('.port.out b'),node(j).locator('.port.in[data-port="a"] b'));drag(node(bb).locator('.port.out b'),node(j).locator('.port.in[data-port="b"] b'))
    ok('Шаг 5' in g(),guides);o=add('out');ok('Шаг 6' in g(),guides);node(j).locator('.port.out b').click();node(o).locator('.port.in b').click()
    ok('Готово' in g(),guides)
    pg.wait_for_function('__game.S.goal===1',timeout=6000);print('обучение: все шаги, победа в обычном времени')
    ok(pg.locator('#rate.on').count()==1,'оценка');pg.click('#rate [data-rate="fun"]')
    # отмена и удаление провода
    n0=J('__game.CV.alg.G.wires.length');pg.locator('#wires .hit').first.dispatch_event('pointerdown',{'button':0});ok(J('__game.CV.alg.G.wires.length')==n0-1,'провод убран');pg.keyboard.press('Control+z');ok(J('__game.CV.alg.G.wires.length')==n0,'отмена')
    node(j).locator('[data-act="del"]').click();ok(J('__game.CV.alg.G.nodes.length')==3,'удалён');pg.click('#b-undo');ok(J('__game.CV.alg.G.nodes.length')==4,'вернулся')
    # прокачка и деньги назад
    J('__game.S.money=1000');J('__game.recalc()');c0=J('__game.S.cycle');node(j).locator('[data-act="up"]').click();ok(J('__game.S.cycle')<c0,'быстрее');m=J('__game.S.money');node(j).locator('[data-act="del"]').click();ok(J('__game.S.money')>=m+15,'возврат');pg.click('#b-undo');ok(J('__game.CV.alg.G.nodes.find(n=>n.type==="join").lv')==1,'уровень вернулся')
    # разбор ошибок и поиск
    pg.click('[data-debug="topics"]');ok('на самом деле' in pg.inner_text('#dbg-b'),'разбор');pg.screenshot(path='/tmp/u_dbg.png');pg.click('#dbg-x')
    node(o).locator('header b').click();pg.fill('#peek-find','101');ok('«101»' in pg.inner_text('#peek-t'),'поиск')
    # подсказки
    for _ in range(3): pg.click('[data-hint]')
    ok(pg.locator('.advice').count()==3 and pg.locator('[data-hint]').count()==0,'3 подсказки')
    # сохранение и перезагрузка
    pg.keyboard.press('Escape');ok(pg.locator('#v-menu.on').count()==1,'меню');t=J('__game.S.t');pg.wait_for_timeout(2200);ok(J('__game.S.t')==t,'на паузе стоит')
    before=J('JSON.stringify([__game.S.goal,__game.CV.alg.G])');pg.click('#m-go');pg.reload();pg.wait_for_timeout(500);ok(J('JSON.stringify([__game.S.goal,__game.CV.alg.G])')==before,'сохранилось')
    # закрытая игра стоит
    m=J('__game.S.money');J('__game.save()');pg.goto('about:blank');pg.wait_for_timeout(3000);pg.goto('http://localhost:8767/');pg.wait_for_timeout(300);ok(abs(J('__game.S.money')-m)<8,'закрытая не копит')
    # поздняя игра
    pg2=br.new_page(viewport={'width':1100,'height':700});pg2.on('pageerror',lambda e:err.append(str(e)));pg.close();pg=pg2;J=pg.evaluate
    pg.add_init_script(f'if(!sessionStorage.x){{sessionStorage.x=1;const s={json.dumps(save)};for(const k in s)localStorage.setItem(k,s[k]);}}')
    pg.goto('http://localhost:8767/');pg.wait_for_timeout(600);ok(J('__game.S.goal')==14,'поздняя игра')
    pg.click('#ptabs [data-tab="goal"]');ok('Обе главы пройдены' in pg.inner_text('#pbody'),'после глав есть цель');ok('Следующий рубеж' in pg.inner_text('#pbody'),'рубеж');pg.screenshot(path='/tmp/u_end.png')
    pg.click('#ptabs [data-tab="orders"]');ok(pg.locator('.ord').count()==3,'три заказа');pg.screenshot(path='/tmp/u_orders.png')
    pg.click('#ptabs [data-tab="shop"]');pg.screenshot(path='/tmp/u_shop.png');pg.click('#ptabs [data-tab="orders"]')
    J('__game.S.money=1e6');
    # страницы
    pg.click('#br [data-page="feed"]');ok(pg.locator('.feed article').count()==5,'5 постов');ok('твоя схема' in pg.inner_text('.sh'),'лента от схемы');pg.screenshot(path='/tmp/u_feed.png')
    pg.locator('.feed .who button.link[data-author]').first.click();ok('подписчиков' in pg.inner_text('.sh'),'автор');pg.click('[data-home]');pg.locator('[data-photo]').first.click();pg.click('.sh [data-step="1"]');pg.select_option('[data-person]','7')
    pg.click('#br [data-page="people"]');ok(pg.locator('table.d tr').count()>20,'записи');pg.click('[data-dl="one"]');pg.screenshot(path='/tmp/u_people.png');pg.click('#page [data-open="feed"]');ok(pg.locator('.feed article').count()==5,'в ленту')
    pg.click('#br [data-page="files"]');ok(pg.locator('.cols nav button').count()==2,'два файла');pg.locator('.cols nav button').first.click();ok(pg.locator('.cols section svg').count()==1,'фото');pg.screenshot(path='/tmp/u_files.png')
    pg.click('#br [data-page="chat"]');pg.click('#br [data-page="work"]');pg.click('[data-debug="feed"]') if pg.locator('[data-debug="feed"]').count() else None
    # отчёт
    pg.keyboard.press('Escape');pg.click('#m-report');ok(len(pg.input_value('#rep-text'))>50,'отчёт');pg.click('#rep-close');ok(pg.locator('#v-menu.on').count()==0,'закрыт')
    print('ошибки',err);assert not err
    print('интерфейс: всё прошло')
