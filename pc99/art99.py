# Пиксельный арт сайтов -> art99.js. Исходники: PNG из ComfyUI (SD 1.5, фон снят BiRefNet).
# python3 art99.py <папка с PNG>
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance,ImageOps,ImageColor
import sys,io,base64,json,random,colorsys
S=sys.argv[1]+'/';out={}
def src(n): return Image.open(S+n+'.png').convert('RGBA')
def uri(im):
    b=io.BytesIO();im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def pix(im,colors=24):
    a=im.getchannel('A').point(lambda v:255 if v>110 else 0);rgb=ImageEnhance.Color(im.convert('RGB')).enhance(1.2)
    q=rgb.quantize(palette=rgb.quantize(colors),dither=Image.FLOYDSTEINBERG);r=q.convert('RGBA');r.putalpha(a);return r.quantize(colors+1,method=Image.FASTOCTREE)
def cut(im,n):
    box=im.getchannel('A').point(lambda v:255 if v>110 else 0).getbbox();im=im.crop(box);im.thumbnail((n,n),Image.LANCZOS);return im
SITES=json.load(open('art/sites.json'))
SWAP={'tur-gorizont':'globe_00001_','pizza-ugolok':'pizza_00001_','vestnik-ozerska':'v3_news-alt','pochta-golub':'mail2_00001_','hosting-cherdak':'server_00001_','provider-link':'computer_00001_','gribnik':'v3_gribnik_00002_','taxi-veter':'v3_taxi-veter_00002_'}
SWAP['vestnik-ozerska']='news2_00003_'
def hero_src(k):
    if k=='teatr-na-yuzhnoy':   # одна маска из россыпи
        im=src('v3_teatr-na-yuzhnoy_00002_').crop((40,275,200,500));m=Image.new('L',im.size);ImageDraw.Draw(m).ellipse((4,4,im.width-4,im.height-4),fill=255);im.putalpha(m);return im
    return src(SWAP.get(k,f'v3_{k}_00001_'))
heroes={}
for host,name,col,wild in SITES:
    k=host.split('.')[0];heroes[k]=cut(hero_src(k),104);out[k]=uri(pix(heroes[k]))
for k in ['x-vcat1','x-vcat2','x-vcat3','x-flower','x-heart']: out[k]=uri(pix(cut(src(f'v3_{k}_00001_'),96)))
out['x-star']=uri(pix(cut(src('star_00002_'),64)));out['x-shroom']=uri(pix(cut(src('v3_x-toad_00001_'),96)));out['x-toad']=uri(pix(cut(src('v2_skull_00001_'),96)))
out['floppy']=uri(pix(cut(Image.open('art/floppy.png').convert('RGBA'),64)))
# молния рисуется
b=Image.new('RGBA',(64,64));ImageDraw.Draw(b).polygon([(38,2),(10,36),(28,36),(20,62),(54,24),(34,24),(48,2)],fill=(255,232,40),outline=(0,0,0),width=3);out['t-bolt']=uri(b)
for p in ['vasya','sveta','eduard','eduard2','zina','makar','gena','denis','elvira','anatoly','lyoha','marina','stas','ksenia','antonina']:
    im=ImageOps.fit(src(f'v3_p-{p}_00001_'),(100,120),Image.LANCZOS,centering=(.5,.3));out['p-'+p]=uri(pix(im,32))
# фон каждого сайта: фактура в цвете сайта + мелкие символы
TEX=['v3_t-wood_00001_','v2_tx_rock_00001_','v2_bg_wall_00002_','v3_t-ice_00001_','v3_t-grass_00001_','v3_t-water_00001_','v3_t-gold_00001_','v2_bg_camo_00001_','v2_bg_slime_00002_','v3_t-candy_00001_']
def mirror(t):
    h=t.width;c=Image.new('RGB',(h*2,h*2))
    c.paste(t,(0,0));c.paste(ImageOps.mirror(t),(h,0));c.paste(ImageOps.flip(t),(0,h));c.paste(ImageOps.flip(ImageOps.mirror(t)),(h,h));return c
for i,(host,name,col,wild) in enumerate(SITES):
    if wild: continue
    k=host.split('.')[0];r,g,bb=ImageColor.getrgb(col);h,l,s=colorsys.rgb_to_hls(r/255,g/255,bb/255)
    C=lambda L:tuple(int(v*255) for v in colorsys.hls_to_rgb(h,L,min(1,s*1.2)))
    t=ImageOps.autocontrast(ImageOps.grayscale(src(TEX[i%len(TEX)]).resize((64,64),Image.LANCZOS)))
    t=ImageOps.colorize(t,C(.16),C(.46),mid=C(.30));tile=mirror(t).convert('RGBA')
    m=heroes[k].copy();m.thumbnail((36,36));m.putalpha(m.getchannel('A').point(lambda v:90 if v>110 else 0))
    tile.alpha_composite(m,(14,14));tile.alpha_composite(m.rotate(18),(78,78))
    out['bg-'+k]=uri(tile.convert('RGB').quantize(12))
# объёмные заголовки
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
LT=['v3_t-gold_00001_','v3_t-lava_00001_','v2_tx_slime_00001_','v3_t-candy_00001_','v2_tx_gem_00001_','v3_t-ice_00001_','v2_tx_slime_00002_','v2_tx_rock_00001_']
SIDE=[(110,60,0),(90,0,0),(50,0,100),(90,0,70),(0,60,20),(0,30,110),(0,0,80),(70,35,0)]
def lines_of(name):
    if len(name)<=13: return [name]
    w=name.split();best=min(range(1,len(w)),key=lambda i:max(len(' '.join(w[:i])),len(' '.join(w[i:])))) if len(w)>1 else None
    return [' '.join(w[:best]),' '.join(w[best:])] if best else [name]
def logo(name,i):
    random.seed(i);L=[l.upper() for l in lines_of(name)];size=70;f=ImageFont.truetype(FONT,size);jit=[8,3,11,5][i%4]
    W=int(max(f.getlength(l)+len(l)*2 for l in L))+50;H=int(size*1.28*len(L)+34);m=Image.new('L',(W,H))
    for j,l in enumerate(L):
        x=(W-f.getlength(l)-len(l)*2)/2
        for n,ch in enumerate(l):
            g=Image.new('L',(int(f.getlength(ch))+24,int(size*1.7)));ImageDraw.Draw(g).text((12,size*.2),ch,font=f,fill=255)
            g=g.rotate(random.uniform(-jit,jit),Image.BICUBIC);dy=[0,int(8*__import__('math').sin(n)),(-4 if n%2 else 4),0][i%4]
            m.paste(255,(int(x)-12,int(j*size*1.22)+dy),g);x+=f.getlength(ch)+2
    m=m.point(lambda v:255 if v>120 else 0);c=Image.new('RGBA',(W,H));big=m.filter(ImageFilter.MaxFilter(7));t_i=i%len(LT)
    for d in range(10,0,-1): c.paste(SIDE[t_i]+(255,),(d,d),big)
    c.paste((0,0,0,255),(0,0),big);c.paste(((255,255,255) if t_i not in(1,5) else (255,240,90))+(255,),(0,0),m.filter(ImageFilter.MaxFilter(5)))
    t=ImageEnhance.Brightness(src(LT[t_i]).convert('RGB').resize((W,max(W,H)))).enhance(1.35 if t_i in(0,7) else 1.05).crop((0,0,W,H))
    c.paste(t,(0,0),m.filter(ImageFilter.MinFilter(3)));c=c.crop(c.getbbox())
    w=min(310,int(c.width*.62));c=c.resize((w,max(1,int(c.height*w/c.width))),Image.LANCZOS);return pix(c,32)
for i,(host,name,col,wild) in enumerate(SITES):
    im=logo(name,i);out['logo-'+host.split('.')[0]]=uri(im)
open('art99.js','w').write('// сгенерировано art99.py, руками не править\nwindow.ART99='+json.dumps(out)+';\n');print(len(out),len(open('art99.js').read()))
