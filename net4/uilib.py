# сборка схемы настоящими нажатиями: общее для проверок
ORDER={'src':['table'],'join':['on1','on2'],'group':['by1','by2','agg','col','name'],'top':['n','per','sort','dir'],'filter':['col','op','val'],'calc':['a','op','b','num','name'],'out':['slot']}
PORTS={'join':['a','b']}
def builder(pg):
    J=pg.evaluate
    def node(i):return pg.locator(f'.node[data-id="{i}"]')
    def setv(i,k,v):
        el=node(i).locator(f'[data-set="{k}"]')
        assert el.count()==1,f'нет настройки {k} у {i}: '+node(i).inner_text()
        if el.evaluate('e=>e.tagName')=='SELECT':
            vals=el.evaluate('e=>[...e.options].map(o=>o.value)')
            assert str(v) in vals,f'в списке {k} нет «{v}»: {vals}'
            el.select_option(str(v))
        else: el.fill(str(v));el.dispatch_event('change');el.evaluate('e=>e.blur()') if el.count() else None
    def build(G):
        # стереть поле кнопками «×»
        while pg.locator('.node [data-act="del"]').count():
            J("window.__game.fit()");pg.keyboard.press('Escape') if False else None
            n=pg.locator('.node').first;i=n.get_attribute('data-id');n.locator('[data-act="del"]').dispatch_event('click')
        ids={}
        for n in G['nodes']:
            pg.click(f'#dock [data-add="{n["type"]}"]')
            nid=pg.locator('.node.sel').get_attribute('data-id');ids[n['id']]=nid
            pg.click('#zoom [data-z="tidy"]')
            for w in [w for w in G['wires'] if w[1]==n['id']]:
                a=node(ids[w[0]]).locator('.port.out b');t=node(nid).locator(f'.port.in[data-port="{w[2]}"] b')
                a.click(timeout=4000);t.click(timeout=4000)
                assert J(f"__game.CV[document.querySelector('#tabs .on').dataset.cv].G.wires.some(x=>x[0]==='{ids[w[0]]}'&&x[1]==='{nid}'&&x[2]==='{w[2]}')"),'провод не встал'
                pg.click('#zoom [data-z="tidy"]')
            for k in ORDER[n['type']]:
                v=n['p'].get(k)
                if k=='num' and n['p'].get('num') is not None: setv(nid,'b','#') if False else None
                if n['type']=='calc' and k=='b' and v is None: v='#'
                if v is None: continue
                setv(nid,k,v)
            if n['type']=='out':
                for f,c in (n['p'].get('map') or {}).items():
                    if node(nid).locator(f'[data-set="map:{f}"]').count(): setv(nid,'map:'+f,c)
        pg.click('#zoom [data-z="tidy"]')
    return build
