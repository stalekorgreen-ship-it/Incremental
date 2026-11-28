# проверка экрана: всё собирается настоящими нажатиями. сервер в out на 8768; node refs_json.js > /tmp/live.json
import json
from playwright.sync_api import sync_playwright
G=json.load(open('/tmp/live.json'))
KEYS={'src':['table'],'join':['on1','on2','keep','every'],'group':['by1','by2','agg','col','name','every'],'top':['n','per','sort','dir','every'],'filter':['col','op','col2','val','every'],'calc':['a','op','b','num','name','every'],'rand':['n','per'],'mem':['k1','k2','val','mode','forget','name'],'show':['score','trial']}
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page(viewport={'width':1366,'height':768});err=[]
    pg.on('pageerror',lambda e:err.append(str(e)));pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.goto('http://localhost:8768/');pg.wait_for_timeout(500);J=pg.evaluate;pg.screenshot(path='/tmp/l_start.png')
    # время идёт само
    pg.click('#b-run');pg.wait_for_timeout(5000);assert J('__live.W.round')>=2;pg.click('#b-run');r=J('__live.W.round');pg.wait_for_timeout(1800);assert J('__live.W.round')==r
    node=lambda i:pg.locator(f'.node[data-id="{i}"]')
    while pg.locator('.node').count(): pg.locator('.node [data-act="del"]').first.dispatch_event('click')
    ids={};todo=list(G['nodes'])
    for n in todo:
        pg.click(f'#dock [data-add="{n["type"]}"]');ids[n['id']]=pg.locator('.node.sel').get_attribute('data-id');pg.wait_for_timeout(20)
    pg.click('#zoom [data-z="tidy"]')
    def wire(w):
        node(ids[w[0]]).locator('.port.out').click(timeout=4000);node(ids[w[1]]).locator(f'.port.in[data-port="{w[2]}"]').click(timeout=4000);pg.wait_for_timeout(20)
        assert J(f"__live.S.G.wires.some(x=>x[0]==='{ids[w[0]]}'&&x[1]==='{ids[w[1]]}'&&x[2]==='{w[2]}')"),f'провод {w}'
        pg.click('#zoom [data-z="tidy"]')
    mem={n['id'] for n in G['nodes'] if n['type']=='mem'}
    done=set()
    def setup(n):
        i=ids[n['id']]
        for k in KEYS[n['type']]:
            v=n['p'].get(k)
            if v is None or (k=='every' and not v) or (k=='per' and v==''): continue
            el=node(i).locator(f'[data-set="{k}"]');assert el.count()==1,f'{n["type"]}: нет настройки {k}: '+node(i).inner_text()
            if el.evaluate('e=>e.tagName')=='SELECT':
                vals=el.evaluate('e=>[...e.options].map(o=>o.value)');assert str(v) in vals,f'{n["type"]}.{k}: нет «{v}» в {vals}';el.select_option(str(v))
            else: el.fill(str(v));el.evaluate('e=>e.blur()')
            pg.wait_for_timeout(30)
    # блоки в порядке, в котором появляются их входы; провод назад из памяти — после неё
    for n in G['nodes']:
        for w in G['wires']:
            if w[1]==n['id'] and n['type']!='mem': wire(w)
        if n['type']!='mem': setup(n);done.add(n['id'])
        for m in G['nodes']:
            if m['type']=='mem' and m['id'] not in done:
                w=[w for w in G['wires'] if w[1]==m['id']][0]
                if w[0] in done: wire(w);setup(m);done.add(m['id'])
    pg.click('#zoom [data-z="tidy"]')
    bad=J("Object.entries(__live.last.R).filter(([k,r])=>r.err).map(([k,r])=>k+' '+r.err)");print('ошибки блоков до пуска',bad)
    J('__live.run(80)');pg.wait_for_timeout(200)
    bad=J("Object.entries(__live.last.R).filter(([k,r])=>r.err||r.note).map(([k,r])=>k+' '+(r.err||r.note))");score=J('Live.result(__live.W,20)');load=J('__live.W.load')
    print('собрано нажатиями · блоков',len(ids),'· результат %.0f%%'%(score*100),'· расчёт',round(load),bad)
    assert not bad and score>.4;pg.screenshot(path='/tmp/l_good.png')
    pg.click('#ptabs [data-tab="person"]');assert 'Память' in pg.inner_text('#pbody');pg.click('[data-truth]');assert 'любит' in pg.inner_text('#pbody');pg.screenshot(path='/tmp/l_person.png')
    pg.click('#ptabs [data-tab="task"]');
    for _ in range(4): pg.click('[data-hint]')
    pg.click('[data-measure]');pg.wait_for_function('__live.S.marks.length===1',timeout=20000);print('замер','%.0f%%'%(J('__live.S.marks[0].score')*100))
    n=len(ids);pg.locator('.node [data-act="del"]').first.dispatch_event('click');assert pg.locator('.node').count()==n-1;pg.keyboard.press('Control+z');assert pg.locator('.node').count()==n
    pg.locator('.node header b').first.click();assert pg.locator('#peek.on').count()==1
    pg.reload();pg.wait_for_timeout(800);assert pg.locator('.node').count()==n,'схема сохранилась'
    pg.click('#b-speed');pg.click('#b-speed');pg.click('#b-run');pg.wait_for_timeout(6000);print('на скорости ×15 за 6 с кругов',J('__live.W.round'));pg.click('#b-run')
    pg.click('#b-wipe');assert J('__live.W.round')==0
    pg.set_viewport_size({'width':1024,'height':600});pg.screenshot(path='/tmp/l_small.png')
    print('ошибки',err);assert not err
