# все виды заказов (с условиями) решаются настоящими нажатиями на черновике. Нужен /tmp/save.json от play.py
import json
from playwright.sync_api import sync_playwright
from uilib import builder
save=json.load(open('/tmp/save.json'))
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page(viewport={'width':1366,'height':768});err=[]
    pg.on('pageerror',lambda e:err.append(str(e)));pg.on('console',lambda m:m.type=='error' and err.append(m.text))
    pg.add_init_script(f'if(!sessionStorage.x){{sessionStorage.x=1;const s={json.dumps(save)};for(const k in s)localStorage.setItem(k,s[k]);}}')
    pg.goto('http://localhost:8767/');pg.wait_for_timeout(600);J=pg.evaluate;build=builder(pg)
    pg.click('#ptabs [data-tab="orders"]')
    solved={};mods=0;skips=0
    while len(solved)<24 and skips<300:
        todo=J("__game.S.orders.map(o=>({id:o.id,k:o.k,p:o.p}))")
        new=[o for o in todo if o['k'] not in solved]
        if not new:
            pg.locator('[data-drop]').nth(skips%3).click();skips+=1;continue
        o=new[0]
        G=J("""id=>{const S=__game.S,o=S.orders.find(o=>o.id===id),Q=Goals,C=Core,d=Q.orderDef(o),b=Refs.B(),n=Q.orderRef(b,d,o.p),t=C.run(b.G,C.sourcesOf(S))[n].table,map={},all=d.f.every(f=>t.cols.includes(f));d.f.forEach((f,i)=>map[f]=all?f:t.cols[i]);b.out(n,'answer',map);return b.G}""",o['id'])
        pg.click(f'[data-take="{o["id"]}"]');done=J("__game.S.done");money=J("__game.S.money")
        # черновик очищается и собирается заново
        build(G);pg.wait_for_timeout(60)
        assert J("__game.S.done")==done+1,'заказ не засчитан '+json.dumps(o,ensure_ascii=False)+' '+pg.inner_text('#pbody')
        assert J("__game.S.money")>money and J("__game.S.orders.length")==3
        solved[o['k']]=o['p'];mods+='mod' in o['p']
        pg.click('#ptabs [data-tab="orders"]')
    print('решено нажатиями видов заказов:',len(solved),'из 24 · с условиями:',mods,'· замен:',skips,'· ошибки',err)
    pg.screenshot(path='/tmp/u_order_done.png')
    assert len(solved)==24 and not err
