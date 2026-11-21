#!/usr/bin/env python3
"""HER VOICE movie thumbnail: the user's illustration, regraded to the series palette + title/badge.  python3 make_thumb_movie.py SRC"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import numpy as np
src=Image.open(sys.argv[1]).convert('RGB')
W,H=1920,1080; S=W/1365
im=src.resize((W,H),Image.LANCZOS)
a=np.asarray(im).astype(np.float32)/255
R,G,B=a[...,0],a[...,1],a[...,2]
lum=0.3*R+0.59*G+0.11*B
yy,xx=np.mgrid[0:H,0:W]
# Biscuit: grey-ish (not blue) mid tones inside his box -> brown
dog=((xx>578*S)&(xx<800*S)&(yy>655*S)&(yy<752*S)).astype(np.float32)
greyish=np.clip(1-(B-R-0.04)*12,0,1)*((lum>0.14)&(lum<0.62))
dogm=dog*greyish
bright=np.clip((lum-0.45)/0.2,0,1)*(1-dogm)
red=np.clip((R-np.maximum(G,B))*4,0,1)*np.clip((R-0.35)*5,0,1)
bg=(1-bright)*(1-red)*(1-dogm)
tR=0.42*B+0.35*lum; tG=0.22*B+0.30*lum; tB=0.80*B+0.20*lum
nR=R*(1-bg)+tR*bg; nG=G*(1-bg)+tG*bg; nB=B*(1-bg)+tB*bg
wR=lum*1.02+0.03; wG=lum*1.0+0.02; wB=lum*0.98+0.04
nR=nR*(1-bright)+wR*bright; nG=nG*(1-bright)+wG*bright; nB=nB*(1-bright)+wB*bright
nR=nR+0.18*red; nG=nG*(1-0.35*red); nB=nB*(1-0.35*red)
sh=np.clip(lum/0.33,0.45,1.5)
nR=nR*(1-dogm)+(0.604*sh)*dogm; nG=nG*(1-dogm)+(0.384*sh)*dogm; nB=nB*(1-dogm)+(0.212*sh)*dogm   # #9a6236
a2=np.stack([nR,nG,nB],-1)
d=np.sqrt(((xx-980)/650)**2+((yy-640)/460)**2); glow=np.clip(1-d,0,1)**2*(1-bright)*(1-dogm)
a2[...,0]+=0.20*glow; a2[...,2]+=0.05*glow
v=np.sqrt(((xx-W/2)/(W*0.62))**2+((yy-H*0.52)/(H*0.7))**2); a2*=np.clip(1.12-0.7*v**2,0.3,1)[...,None]
out=Image.fromarray((np.clip(a2,0,1)*255).astype(np.uint8))
glowL=Image.new('RGB',(W,H),(0,0,0)); gd=ImageDraw.Draw(glowL)
for (x,y,r) in [(690,381,11),(719,381,11),(1085,147,6),(1101,150,6)]:
    gd.ellipse((x*S-r*S,y*S-r*S,x*S+r*S,y*S+r*S),fill=(240,240,255))
out=ImageChops.add(out,Image.eval(glowL.filter(ImageFilter.GaussianBlur(12)),lambda p:int(p*0.45)))
out=out.filter(ImageFilter.UnsharpMask(radius=2,percent=70,threshold=3))
n=(np.random.default_rng(1).normal(0,4,(H,W,1))).astype(np.float32)
out=Image.fromarray(np.clip(np.asarray(out).astype(np.float32)+n,0,255).astype(np.uint8))
FB='/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'; f=ImageFont.truetype(FB,96); fb=ImageFont.truetype(FB,58)
dr=ImageDraw.Draw(out); t='THE MOVIE'; w=dr.textlength(t,font=f); x=(W-w)/2; y=258
gl=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(gl).text((x,y),t,font=f,fill=(255,226,58,170)); out.paste(gl.filter(ImageFilter.GaussianBlur(14)),(0,0),gl.filter(ImageFilter.GaussianBlur(14)))
dr=ImageDraw.Draw(out); dr.text((x,y),t,font=f,fill=(255,226,58),stroke_width=12,stroke_fill=(0,0,0))
bt='ALL 8 PARTS'; bw=dr.textlength(bt,font=fb); bx,by=W-bw-120,H-150
dr.rounded_rectangle((bx-34,by-18,bx+bw+34,by+82),radius=22,fill=(255,42,58),outline=(0,0,0),width=7); dr.text((bx,by-4),bt,font=fb,fill=(255,255,255))
out.save('thumbnail_movie.jpg',quality=93,subsampling=0)
