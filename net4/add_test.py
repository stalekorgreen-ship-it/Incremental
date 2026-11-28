# новые блоки не налезают друг на друга и видны на экране
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    br=p.chromium.launch()
    for vp in [(1366,640),(1024,600)]:
        pg=br.new_page(viewport={'width':vp[0],'height':vp[1]});err=[];pg.on('pageerror',lambda e:err.append(str(e)))
        pg.goto('http://localhost:8767/');pg.evaluate('localStorage.clear()');pg.evaluate("window.onpagehide=null");pg.goto('http://localhost:8767/');pg.wait_for_timeout(300)
        for i in range(10):
            pg.click('#dock [data-add="%s"]'%['src','join','out'][i%3]);pg.wait_for_timeout(40)
            r=pg.evaluate("(()=>{const l=[...document.querySelectorAll('.node')].map(e=>e.getBoundingClientRect()),st=document.querySelector('#stage').getBoundingClientRect();let over=0;for(let i=0;i<l.length;i++)for(let j=i+1;j<l.length;j++){const a=l[i],b=l[j];if(a.left<b.right-2&&b.left<a.right-2&&a.top<b.bottom-2&&b.top<a.bottom-2)over++;}const n=document.querySelector('.node.sel').getBoundingClientRect();return{over,vis:n.left>=st.left-2&&n.right<=st.right+2&&n.top<st.bottom-40}})()")
            assert r['over']==0 and r['vis'],(vp,i,r)
        pg.screenshot(path=f'/tmp/add_{vp[0]}.png');assert not err,err;pg.close()
    print('новые блоки: без наложений и на виду')
