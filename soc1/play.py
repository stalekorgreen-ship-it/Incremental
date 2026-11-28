# все 9 испытаний настоящими нажатиями. сервер в out на 8769
import json,subprocess
from playwright.sync_api import sync_playwright
G=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./levels.js').LEVELS.map(l=>({id:l.id,ref:l.ref,stages:l.stages.length}))))"]))
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page(viewport={'width':1366,'height':768});err=[]
    pg.on('pageerror',lambda e:err.append(str(e)));pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.goto('http://localhost:8769/');pg.wait_for_timeout(400);J=pg.evaluate;pg.screenshot(path='/tmp/s_start.png')
    node=lambda i:pg.locator(f'.node[data-id="{i}"]')
    def build(ref):
        while pg.locator('.node').count(): pg.locator('.node [data-del]').first.dispatch_event('click')
        ids={}
        for n in ref['G']['nodes']:
            before=J('__soc.S.G.nodes.map(n=>n.id)')
            pg.click(f'#dock [data-add="{n["type"]}"]');ids[n['id']]=[x for x in J('__soc.S.G.nodes.map(n=>n.id)') if x not in before][0]
        pg.click('#zoom [data-z="tidy"]')
        for n in ref['G']['nodes']:
            for k in ['kind','name','key','mode','life','cond','per','op','by','m','n','th']:
                if k not in n['p']: continue
                el=node(ids[n['id']]).locator(f'[data-set="{k}"]');assert el.count()==1,(n,k,node(ids[n['id']]).inner_text())
                if el.evaluate('e=>e.tagName')=='SELECT': el.select_option(str(n['p'][k]))
                else: el.fill(str(n['p'][k]));el.evaluate('e=>e.blur()')
                pg.wait_for_timeout(25)
        pg.click('#zoom [data-z="tidy"]')
        for n in ref['G']['nodes']:
            if n['p'].get('tab'): node(ids[n['id']]).locator('[data-set="tab"]').select_option(ids[n['p']['tab']]);pg.wait_for_timeout(40)
        for a,b,port in ref['G']['wires']:
            node(ids[a]).locator('.port.out').click(timeout=4000);node(ids[b]).locator(f'.port.in[data-port="{port}"]').click(timeout=4000);pg.wait_for_timeout(15)
            assert J(f"__soc.S.G.wires.some(w=>w[0]==='{ids[a]}'&&w[1]==='{ids[b]}'&&w[2]==='{port}')"),('провод',a,b,port)
            pg.click('#zoom [data-z="tidy"]')
        pg.click('#ptabs [data-tab="screen"]')
        sc=ref['screen']
        for part in ['card','text','like','count']:
            if sc.get(part) and not J(f'__soc.S.screen.{part}'): pg.click(f'[data-part="{part}"]');pg.wait_for_timeout(30)
        for k in ['litBy','countBy']:
            el=pg.locator(f'[data-scr="{k}"]')
            if el.count(): el.select_option(ids.get(sc.get(k,''),''));pg.wait_for_timeout(60)
        return ids
    for i,l in enumerate(G):
        assert J('__soc.M.i')==i
        if i==4:
            pg.click('#b-check');t=pg.inner_text('#pbody');assert 'Не вышло' in t,t
            pg.click('[data-show]');assert 'Шаг' in pg.inner_text('#pbody');pg.screenshot(path='/tmp/s_fail.png');pg.click('[data-d="step"]') if pg.locator('[data-d="step"]:enabled').count() else None
        build(l['ref'])
        for k in range(l['stages']):
            pg.click('#b-check');pg.wait_for_timeout(60)
            assert 'Не вышло' not in pg.inner_text('#pbody'),(l['id'],k,pg.inner_text('#pbody'))
        assert J(f'!!__soc.M.done["{l["id"]}"]'),l['id']
        print(l['id'],'пройдено')
        if i==3:
            pg.click('#veil [data-close]');pg.click('#ptabs [data-tab="phone"]');pg.click('[data-hand="open"]');pg.click('.phone [data-like]');
            assert pg.locator('.phone button.lit').count()==1;pg.screenshot(path='/tmp/s_phone.png');pg.click('#b-list');pg.click('[data-go="4"]');continue
        if i<len(G)-1:
            pg.click('[data-rate="fun"]');pg.click('#veil [data-next]');pg.wait_for_timeout(150)
        if i==6: pg.screenshot(path='/tmp/s_lv8.png')
    pg.click('#veil [data-report]');print(pg.input_value('#d-rep'));pg.click('#veil [data-close]')
    # проиграть сценарий по шагам в последнем испытании
    pg.click('#ptabs [data-tab="phone"]');pg.select_option('#d-src','1:0')
    for _ in range(9): pg.click('[data-d="step"]')
    pg.screenshot(path='/tmp/s_steps.png');pg.click('[data-d="end"]');pg.click('#ptabs [data-tab="panel"]');pg.screenshot(path='/tmp/s_panel.png');assert pg.locator('table.d td').count()>6
    # сохранение, отмена, удаление
    n=pg.locator('.node').count();pg.reload();pg.wait_for_timeout(500);assert pg.locator('.node').count()==n and J('__soc.M.i')==8
    pg.locator('.node [data-del]').first.dispatch_event('click');assert pg.locator('.node').count()==n-1;pg.keyboard.press('Control+z');pg.wait_for_timeout(80);assert pg.locator('.node').count()==n
    # с нуля: подсказки, пропуск, узкий экран
    pg.click('#b-list');pg.click('[data-wipe]');pg.click('[data-wipe2]');assert J('__soc.M.i')==0
    pg.click('#b-check');assert 'нет карточки' in pg.inner_text('#pbody')
    pg.click('[data-hint]');pg.click('[data-skip]');assert J('__soc.M.i')==1
    pg.set_viewport_size({'width':390,'height':760});pg.reload();pg.wait_for_timeout(500);pg.screenshot(path='/tmp/s_narrow.png')
    print('ошибки',err);assert not err
