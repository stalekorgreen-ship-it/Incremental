# все 9 испытаний настоящими нажатиями. сервер в out на 8769
import json,subprocess
from playwright.sync_api import sync_playwright
G=json.loads(subprocess.check_output(['node','-e',"const G=require('./graph.js');console.log(JSON.stringify(require('./levels.js').LEVELS.map(l=>({id:l.id,U:G.fromEngine(l.ref),stages:l.stages.length}))))"]))
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page(viewport={'width':1366,'height':768});err=[]
    pg.on('pageerror',lambda e:err.append(str(e)));pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.goto('http://localhost:8769/');pg.wait_for_timeout(400);J=pg.evaluate;pg.screenshot(path='/tmp/s_start.png')
    node=lambda i:pg.locator(f'.node[data-id="{i}"]')
    def wire(a,fp,b,tp):
        node(a).locator(f'.port.out[data-port="{fp}"]').click(timeout=4000);node(b).locator(f'.port.in[data-port="{tp}"]').click(timeout=4000);pg.wait_for_timeout(20)
        assert J(f"__soc.S.wires.some(w=>w.join()==='{a},{fp},{b},{tp}')"),('провод',a,fp,b,tp)
    # первые три испытания — строго по подсказкам игры, как их увидит человек
    def follow(n):
        for _ in range(12):
            g=pg.inner_text('#guide');glow=pg.locator('.glow')
            if 'Проверить' in g and 'Готово' in g: return
            assert glow.count()==1,('нет подсветки',g)
            if glow.first.evaluate("e=>!!e.dataset.add"): glow.first.click();pg.click('#zoom [data-z="tidy"]')
            else:
                glow.first.click();assert pg.locator('.port.glow').count()==1,('нет второй подсветки',g);pg.locator('.port.glow').click();pg.wait_for_timeout(30);pg.click('#zoom [data-z="tidy"]')
        raise Exception('подсказки не кончаются')
    def build(U):
        while pg.locator('.node [data-del]').count(): pg.locator('.node [data-del]').first.dispatch_event('click')
        ids={'screen':J("__soc.S.nodes.find(n=>n.type==='screen').id")}
        for n in U['nodes']:
            if n['type']=='screen': continue
            before=J('__soc.S.nodes.map(n=>n.id)')
            pg.click(f'#dock [data-add="{n["type"]}"]');ids[n['id']]=[x for x in J('__soc.S.nodes.map(n=>n.id)') if x not in before][0]
        pg.click('#zoom [data-z="tidy"]')
        for n in U['nodes']:
            for k in ['name','key','mode','life','cond','per','op','by','m','n','th']:
                if k not in n['p']: continue
                el=node(ids[n['id']]).locator(f'[data-set="{k}"]');assert el.count()==1,(n,k,node(ids[n['id']]).inner_text())
                if el.evaluate('e=>e.tagName')=='SELECT': el.select_option(str(n['p'][k]))
                else: el.fill(str(n['p'][k]));el.evaluate('e=>e.blur()')
                pg.wait_for_timeout(25)
        for n in U['nodes']:
            if n['p'].get('tab'): node(ids[n['id']]).locator('[data-set="tab"]').select_option(ids[n['p']['tab']]);pg.wait_for_timeout(40)
        pg.click('#zoom [data-z="tidy"]')
        for a,fp,b,tp in U['wires']: wire(ids[a],fp,ids[b],tp);pg.click('#zoom [data-z="tidy"]')
    for i,l in enumerate(G):
        assert J('__soc.M.i')==i
        if i==4:
            pg.click('#b-check');t=pg.inner_text('#task');assert 'Не вышло' in t,t
            pg.click('[data-show]');assert 'Шаг' in pg.inner_text('#phone');pg.screenshot(path='/tmp/s_fail.png')
        if i<3:
            for k in range(l['stages']):
                if k==0: follow(i);pg.screenshot(path=f'/tmp/s_g{i}.png')
                pg.click('#b-check');pg.wait_for_timeout(60)
                if i==2 and k==0:
                    pg.click('#b-check');assert 'двойной лайк' in pg.inner_text('#task');tid=J("__soc.S.nodes.find(n=>n.type==='table').id");node(tid).locator('[data-set="mode"]').select_option('set');pg.wait_for_timeout(80);pg.click('#b-check');break
                assert 'Не вышло' not in pg.inner_text('#task'),(l['id'],k,pg.inner_text('#task'))
        else:
            build(l['U'])
            for k in range(l['stages']):
                pg.click('#b-check');pg.wait_for_timeout(60)
                assert 'Не вышло' not in pg.inner_text('#task'),(l['id'],k,pg.inner_text('#task'))
        assert J(f'!!__soc.M.done["{l["id"]}"]'),l['id']
        print(l['id'],'пройдено')
        if i==3:
            pg.click('#veil [data-close]');pg.select_option('#d-src','hand');pg.click('.phone [data-like]');
            assert pg.locator('.phone button.lit').count()==1;pg.screenshot(path='/tmp/s_phone.png');pg.click('#b-list');pg.click('[data-go="4"]');continue
        if i<len(G)-1:
            pg.click('[data-rate="fun"]');pg.click('#veil [data-next]');pg.wait_for_timeout(150)
        if i==6: pg.screenshot(path='/tmp/s_lv8.png')
    pg.click('#veil [data-report]');print(pg.input_value('#d-rep'));pg.click('#veil [data-close]')
    # проиграть сценарий по шагам в последнем испытании
    pg.select_option('#d-src','1:0')
    for _ in range(9): pg.click('[data-d="step"]')
    pg.screenshot(path='/tmp/s_steps.png');pg.click('[data-d="end"]');pg.screenshot(path='/tmp/s_panel.png');assert pg.locator('table.d td').count()>6
    # сохранение, отмена, удаление
    n=pg.locator('.node').count();pg.reload();pg.wait_for_timeout(500);assert pg.locator('.node').count()==n and J('__soc.M.i')==8
    pg.locator('.node [data-del]').first.dispatch_event('click');assert pg.locator('.node').count()==n-1;pg.keyboard.press('Control+z');pg.wait_for_timeout(80);assert pg.locator('.node').count()==n
    # с нуля: подсказки, пропуск, узкий экран
    pg.click('#b-list');pg.click('[data-wipe]');pg.click('[data-wipe2]');assert J('__soc.M.i')==0
    pg.click('#b-check');assert 'не видят пост' in pg.inner_text('#task')
    pg.click('[data-hint]');pg.click('[data-skip]');assert J('__soc.M.i')==1
    pg.set_viewport_size({'width':390,'height':760});pg.reload();pg.wait_for_timeout(500);pg.screenshot(path='/tmp/s_narrow.png')
    print('ошибки',err);assert not err
