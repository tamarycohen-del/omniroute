import json,re
core=open('pirate_core.txt').read().replace('// ---------- camera ----------','const CAMTG = new THREE.Vector3();\n// ---------- camera ----------').replace('fov = lerp(a[3] || 40, b[3] || 40, k);','fov = lerp(a[3] || 40, b[3] || 40, k); CAMTG.set(tg[0], tg[1], tg[2]);').replace("import { OutputPass }","import { BokehPass } from './package/examples/jsm/postprocessing/BokehPass.js';\nimport { OutputPass }").replace("faceDrawRB(c.fctx, c.o.skin, f)","(c.o.faceFn || faceDrawRB)(c.fctx, c.o.skin, f)")
assert 'c.o.faceFn' in core
body=open('pb_world.js').read()+open('pb_shots.js').read()
open('pirate_body.js','w').write(body)
starts=[('A',0),('B',1.0),('C',2.0),('D',3.5),('F',4.5),('G',5.9),('I',8.0),('J',8.9),('K',9.4),('L',10.0),('M',12.3),('N',13.6),('O',14.4),('P',15.4),('Q',16.4),('S',20.0),('T',21.4),('U',22.3),('V',22.9),('W',23.5),('X',24.0),('Y',24.4),('Z',25.4),('AA',26.9),('AB',29.4),('AC',30.4),('AD',33.9),('AE',36.9),('AF',38.4),('AG',39.9),('AH',40.8),('AI',42.9),('AJ',43.4),('AK',44.9),('AL',45.9),('AM',48.0),('AN',48.5),('AO',50.3),('AP',51.9),('AR',53.4),('AS',55.9),('AT',57.4),('AU',58.9),('AV',59.9)]
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
const bokeh = new BokehPass(S, cam, { focus: 10, aperture: 0.0007, maxblur: 0.009 }); composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.5, 0.8); composer.addPass(bloom);
composer.addPass(new OutputPass());
composer.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb; float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, 1.18); col = (col - 0.5) * 1.06 + 0.5; float v = smoothstep(1.0, 0.38, distance(vUv, vec2(0.5))); col *= mix(0.72, 1.0, v); gl_FragColor = vec4(col, c.a); }' }));
const WORDS = __WORDS__;
const CAPC = ['#45f0ff', '#ffffff', '#ffe53b', '#5dff6a', '#45f0ff', '#ffffff', '#ffe53b', '#45f0ff'];
const caption = (t) => { let w = null, wi = 0; for (let i = 0; i < WORDS.length; i++) { const x = WORDS[i]; if (t >= x.s - 0.02 && t < x.e + 0.04) { w = x; wi = i; } if (x.s > t) break; } if (!w) return;
  const txt = w.w.replace(/[".,!?…]+$/g, '').replace(/^[-"“]+/, '').toUpperCase(); if (!txt) return;
  const P_ = window.__PR || 1, fs = 92 * P_, pop = 1 + 0.14 * Math.max(0, 1 - (t - w.s) / 0.08); OG.save(); OG.translate(OUTC.width / 2, OUTC.height * 0.70); OG.scale(pop, pop); OG.font = `900 ${fs}px "Inter Display", "DejaVu Sans", sans-serif`; OG.textAlign = 'center'; OG.textBaseline = 'middle'; OG.lineJoin = 'round';
  OG.shadowColor = 'rgba(0,0,0,0.6)'; OG.shadowBlur = 14 * P_; OG.shadowOffsetY = 5 * P_; OG.lineWidth = 15 * P_; OG.strokeStyle = '#0b0b0b'; OG.strokeText(txt, 0, 0); OG.shadowColor = 'transparent'; OG.fillStyle = CAPC[(wi * 5 + 3) % CAPC.length]; OG.fillText(txt, 0, 0); OG.restore(); };
window.renderFrame = (f) => { const t = f / 24; T = t; let i = 0; while (i + 1 < TL.shots.length && t >= TL.shots[i + 1].s) i++; const sh = TL.shots[i]; resetAll(i);
  const d = sh.end - sh.s; SC[sh.shot](Math.min(t - sh.s, d), d); cam.updateMatrixWorld(); { const cx = cam.position.x, cz = cam.position.z, dx = CAMTG.x - cx, dz = CAMTG.z - cz, L2 = dx * dx + dz * dz; for (const l of LAMPM) { const t = ((l.x - cx) * dx + (l.z - cz) * dz) / L2, px = cx + dx * t - l.x, pz = cz + dz * t - l.z; const hide = t > -0.05 && t < 1.0 && Math.hypot(px, pz) < 1.8 + 0.6 * t; l.m.forEach((m) => (m.visible = !hide)); } } for (const h of SOUTH) h.visible = !(cam.position.z > 10.5 && Math.abs(h.position.x - cam.position.x) < 26); bokeh.uniforms.focus.value = cam.position.distanceTo(CAMTG); bokeh.uniforms.aperture.value = APER; composer.render(); OG.filter = BLUR > 0.2 ? `blur(${BLUR * (window.__PR || 1)}px)` : 'none'; OG.drawImage(R.domElement, 0, 0, OUTC.width, OUTC.height); OG.filter = 'none'; caption(t); };
document.fonts.load('900 92px "Inter Display"').then(() => { window.ready = true; });
</script></body></html>'''
tail=tail.replace('__TL__',json.dumps({'total':TOT,'shots':shots})).replace('__WORDS__',json.dumps(out))
open('pirate.html','w').write(core+body+tail)
print('ok',len(out))
