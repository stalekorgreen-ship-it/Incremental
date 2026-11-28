# проходит все задания настоящими нажатиями: блоки из нижней панели, списки, провода по кружкам, покупки
# запуск: node refs_json.js > /tmp/refs.json; сервер в out на 8767; python3 play.py refs.json
import sys,json,time
from playwright.sync_api import sync_playwright
from uilib import builder
data=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'refs.json'))
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page(viewport={'width':1366,'height':768});err=[]
    pg.on('pageerror',lambda e:err.append(str(e)));pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.goto('http://localhost:8767/');pg.wait_for_timeout(800)
    J=pg.evaluate
    build=builder(pg)
    def buy(k,level):
        pg.click('#ptabs [data-tab="shop"]')
        while J(f"__game.S.lv.{k}")<level:
            b=pg.locator(f'[data-buy="{k}"]');waited=0
            while b.is_disabled():
                J("__game.run(60)");waited+=60
                assert waited<4*3600,'слишком долго копить на '+k
                pg.wait_for_timeout(5)
            b.click()
        pg.click('#ptabs [data-tab="goal"]')
    for gi,gid in enumerate(data['order']):
        t0=time.time();d=data['out'][gid]
        assert J("__game.S.goal")==gi,f'ждали задание {gi}, а там {J("__game.S.goal")}'
        buy('labels',d['l']);buy('journal',d['j']);pg.click('#tabs [data-cv="alg"]')
        build(d['G'])
        if gid=='v7':
            for s in range(400):
                J("__game.run(60)")
                if J("__game.S.goal")>gi: break
                # покупает вместимость и ускоряет самый долгий блок
                pg.click('#ptabs [data-tab="shop"]')
                for k in ['reach','cpu']:
                    x=pg.locator(f'[data-buy="{k}"]')
                    if not x.is_disabled(): x.click()
                slow=pg.locator('.node:has(.spd .slow) [data-act="up"], .node.slow [data-act="up"]')
                if slow.count() and not slow.first.is_disabled(): slow.first.dispatch_event('click')
            print('  v7: игровых минут примерно',s)
        else: J("__game.run(4)")
        st=pg.inner_text('#pbody') if J("__game.S.goal")==gi else ''
        assert J("__game.S.goal")==gi+1,f'{gid} не засчитано: {st}'
        pg.click('#rate [data-rate=""]') if pg.locator('#rate.on').count() else None
        S=J("({a:__game.S.acc,h:__game.S.hit,u:Math.round(__game.S.users),m:Math.round(__game.S.money),c:__game.S.cycle,t:__game.S.t})")
        print(f"{gid}: засчитано · блоков {len(d['G']['nodes'])} · темы {S['a']:.2f} лента {S['h']:.2f} · пересчёт {S['c']:.1f} с · людей {S['u']} · {time.time()-t0:.0f} с теста")
        pg.screenshot(path=f'/tmp/g_{gid}.png')
        assert not err,err
    json.dump(J("(()=>{__game.save();return {...localStorage}})()"),open('/tmp/save.json','w'))
    print('все задания пройдены нажатиями; ошибки',err)
