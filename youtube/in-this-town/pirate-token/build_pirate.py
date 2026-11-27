import json,re
core=open('pirate_core.txt').read().replace("faceDrawRB(c.fctx, c.o.skin, f)","(c.o.faceFn || faceDrawRB)(c.fctx, c.o.skin, f)")
assert 'c.o.faceFn' in core
body=open('pirate_body.js').read()
starts=[('S01',0),('S02',1.16),('S03',2.84),('S04',3.70),('S05',5.14),('S06',6.86),('S07',8.48),('S08',9.6),('S09',12.34),('S10',15.1),('S11',17.8),('S12',19.74),('S13',21.38),('S14',23.56),('S15',25.96),('S16',27.28),('S17',30.14),('S18',33.94),('S19',36.94),('S20',39.18),('S21',40.86),('S22',41.88),('S23',42.96),('S24',44.70),('S25',45.68),('S26',47.34),('S27',49.0),('S28',50.26),('S29',52.04),('S30',54.82),('S31',57.04),('S32',59.5)]
TOT=61.85
shots=[{'shot':n,'s':s,'end':(starts[i+1][1] if i+1<len(starts) else TOT)} for i,(n,s) in enumerate(starts)]
W=json.load(open('/tmp/claude-0/pirate/words.json'))
out=[]
i=0
while i<len(W):
  w=dict(W[i]); t=w['w']
  if t=='137': w={'w':'137,500','s':w['s'],'e':W[i+1]['e']}; i+=1
  elif t=='W': w={'w':'W','s':w['s'],'e':w['e']}
  elif 'Choose' in t: w['w']='CHEWS'
  elif t=='hire': w['w']='HIGHER'
  out.append(w); i+=1
  if t.startswith('everybody.') and w['s']>8: out.append({'w':'ALMOST','s':11.0,'e':12.3})
for k in range(len(out)-1):
  out[k]['e']=max(out[k]['e'], min(out[k+1]['s'], out[k]['s']+0.45))
tail='''
const TL = __TL__; window.TOTAL = TL.total; window.FPS = 24;
const composer = new EffectComposer(R); composer.setPixelRatio(window.__PR || 1); composer.setSize(W, H); composer.addPass(new RenderPass(S, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.5, 0.8); composer.addPass(bloom);
composer.addPass(new OutputPass());
composer.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb; float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, 1.18); col = (col - 0.5) * 1.06 + 0.5; float v = smoothstep(1.0, 0.38, distance(vUv, vec2(0.5))); col *= mix(0.72, 1.0, v); gl_FragColor = vec4(col, c.a); }' }));
const WORDS = __WORDS__;
const CAPC = ['#45f0ff', '#ffffff', '#ffe53b', '#45f0ff', '#ffffff', '#45f0ff', '#ffe53b', '#ffffff'];
const caption = (t) => { let w = null, wi = 0; for (let i = 0; i < WORDS.length; i++) { const x = WORDS[i]; if (t >= x.s - 0.02 && t < x.e + 0.04) { w = x; wi = i; } if (x.s > t) break; } if (!w) return;
  const txt = w.w.replace(/[".,!?…]+$/g, '').replace(/^[-"“]+/, '').toUpperCase(); if (!txt) return;
  const P_ = window.__PR || 1, fs = 92 * P_, pop = 1 + 0.14 * Math.max(0, 1 - (t - w.s) / 0.08); OG.save(); OG.translate(OUTC.width / 2, OUTC.height * 0.70); OG.scale(pop, pop); OG.font = `900 ${fs}px "Inter Display", "DejaVu Sans", sans-serif`; OG.textAlign = 'center'; OG.textBaseline = 'middle'; OG.lineJoin = 'round';
  OG.shadowColor = 'rgba(0,0,0,0.6)'; OG.shadowBlur = 14 * P_; OG.shadowOffsetY = 5 * P_; OG.lineWidth = 15 * P_; OG.strokeStyle = '#0b0b0b'; OG.strokeText(txt, 0, 0); OG.shadowColor = 'transparent'; OG.fillStyle = CAPC[(wi * 5 + 3) % CAPC.length]; OG.fillText(txt, 0, 0); OG.restore(); };
window.renderFrame = (f) => { const t = f / 24; T = t; let i = 0; while (i + 1 < TL.shots.length && t >= TL.shots[i + 1].s) i++; const sh = TL.shots[i]; resetAll(i);
  const d = sh.end - sh.s; SC[sh.shot](Math.min(t - sh.s, d), d); cam.updateMatrixWorld(); for (const h of SOUTH) h.visible = !(cam.position.z > 10.5 && Math.abs(h.position.x - cam.position.x) < 26); composer.render(); OG.drawImage(R.domElement, 0, 0, OUTC.width, OUTC.height); caption(t); };
document.fonts.load('900 92px "Inter Display"').then(() => { window.ready = true; });
</script></body></html>'''
tail=tail.replace('__TL__',json.dumps({'total':TOT,'shots':shots})).replace('__WORDS__',json.dumps(out))
open('pirate.html','w').write(core+body+tail)
print('ok',len(out))
