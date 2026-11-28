from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':768});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('http://localhost:8765');pg.wait_for_timeout(600)
    for t in ['all','lists','feed']: pg.click(f'[data-add="{t}"]')
    pg.click('[data-z="tidy"]')
    pg.click('.node[data-kind="lists"] [data-mode=">"]');assert pg.evaluate("__game.G.nodes.find(n=>n.type==='lists').p.mode")=='>'
    ids={n[1]:n[0] for n in pg.evaluate("__game.G.nodes.map(n=>[n.id,n.type])")}
    def wire(a,ap,c,cp):
        pg.wait_for_timeout(450);pg.click(f'.node[data-id="{ids[a]}"] .port[data-port="{ap}"][data-dir="out"] b');pg.click(f'.node[data-id="{ids[c]}"] .port[data-port="{cp}"][data-dir="in"] b')
    wire('all','posts','lists','a');pg.click('[data-z="tidy"]');wire('lists','out','feed','posts')
    pg.evaluate('__game.run(15)');pg.wait_for_timeout(300);assert pg.evaluate('__game.S.quest')==1,pg.inner_text('#q-b')
    print(pg.inner_text('#q-b'));print(pg.inner_text('#who-b'))
    pg.click('#b-src');print(pg.inner_text('#drawer-b')[:900]);pg.click('#drawer-x')
    pg.evaluate("(()=>{__game.S.quest=2})()");pg.evaluate('__game.run(2)');pg.screenshot(path='s.png')
    pg.click('#br [data-page="feed"]');pg.screenshot(path='s_feed.png');pg.click('#br [data-page="work"]')
    pg.keyboard.press('Escape');pg.click('#m-report');assert 'ОТЧЁТ' in pg.input_value('#rep-text');pg.click('#rep-close')
    pg.reload();pg.wait_for_timeout(600);assert pg.locator('.node').count()==3
    print('ошибки',errs);b.close()
# все двенадцать испытаний: панель, подсказка, отметка про выбранного человека
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':768});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('http://localhost:8765');pg.evaluate('localStorage.clear()');pg.reload();pg.wait_for_timeout(600)
    for t in ['all','feed']: pg.click(f'[data-add="{t}"]')
    pg.evaluate("(()=>{const G=__game.G,a=G.nodes.find(n=>n.type==='all'),f=G.nodes.find(n=>n.type==='feed');Sim.connect(G,a.id,'posts',f.id,'posts');})()")
    for i in range(1,12):
        pg.evaluate(f"(()=>{{const S=__game.S;for(let k=0;k<={i};k++)for(const s of Sim.QUESTS[k].srcs||[])if(!S.src[s]){{S.src[s]=4;S.ord[s]=Object.keys(S.ord).length;}}S.quest={i};}})()")
        pg.evaluate('__game.run(3)');pg.wait_for_timeout(150);txt=pg.inner_text('#q-b');assert pg.evaluate(f"Sim.QUESTS[{i}].title") in txt,txt
        assert pg.locator('#q-b details').count()==1 and len(pg.evaluate("document.querySelector('#q-b details').textContent"))>25,i
        if i>=4: assert 'Выбранный сейчас человек' in txt,i
    pg.click('#b-src');assert pg.locator('#drawer-b .sr:not(.lock)').count()==30;pg.click('#drawer-x')
    pg.screenshot(path='s12.png');print('12 испытаний открываются, ошибки',errs);b.close()
