# builds lbmj.html from the QA'd KD rig (kdg2.html) with parametrised looks (Jordan / LeBron) + new shots.
import re, os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', '..', 'you-experiment', 'kd-galactus', 'source_code', 'kdg2.html')
L = open(SRC).read().split('\n')
head = L[:136]                      # html + helpers + KD rig + ghost()
measure = [l for l in L if l.startswith('const measure')][0]
cap_start = [i for i, l in enumerate(L) if l.startswith('const caption')][0]
rf_end = [i for i, l in enumerate(L) if l.startswith('window.renderThumb')][0]
tail = L[cap_start:rf_end]

# ---- parametrise the rig ----
out = []
in_kd = False
for ln in head:
    if ln.startswith('const kd = '):
        in_kd = True
        ln = ln.replace('const kd = (x, y, s, pose, o = {}) => {', 'const player = (x, y, s, pose, o = {}) => { const LK = o.look || LOOK.jordan;')
    if in_kd:
        ln = ln.replace('C.skin', 'LK.skin').replace("'#4d2c19'", 'LK.skinD').replace('C.blue2', 'LK.jc2').replace('C.blue', 'LK.jc').replace('C.gold', 'LK.trim').replace("'#1d428a'", 'LK.sole')
    out.append(ln)
    if in_kd and ln.startswith('const ghost'):
        in_kd = False
txt = '\n'.join(out)
# crest block -> wordmark + number sized to fit the shirt
a = txt.index('  // crest'); b = txt.index("g.strokeText('35', 6, 8); g.fillText('35', 6, 8); g.restore();") + len("g.strokeText('35', 6, 8); g.fillText('35', 6, 8); g.restore();")
chest = '''  { g.save(); if (o.flip) g.scale(-1, 1); g.textAlign = 'center'; g.lineJoin = 'round'; const fit = (t, size, maxW) => { let fs = size; g.font = font(fs, 900, ''); while (g.measureText(t).width > maxW && fs > 8) { fs -= 1; g.font = font(fs, 900, ''); } return fs; };
    g.fillStyle = LK.numc; g.strokeStyle = LK.numo; g.lineWidth = 4; fit(LK.name, 22, 76); g.strokeText(LK.name, 0, -178); g.fillText(LK.name, 0, -178);
    g.lineWidth = 7; fit(LK.num, 58, 70); g.strokeText(LK.num, 0, -112); g.fillText(LK.num, 0, -112); g.restore(); }'''
txt = txt[:a] + chest + txt[b:]
# hair / beard / headband gating
txt = txt.replace("  g.fillStyle = '#0d0805'; g.beginPath(); g.moveTo(-42, -8); g.quadraticCurveTo(-50, -64, 4, -66);", "  if (LK.hair) { g.fillStyle = '#0d0805'; g.beginPath(); g.moveTo(-42, -8); g.quadraticCurveTo(-50, -64, 4, -66);")
txt = txt.replace("g.quadraticCurveTo(-26, -36, -34, -4); g.closePath(); g.fill();\n", "g.quadraticCurveTo(-26, -36, -34, -4); g.closePath(); g.fill(); }\n  if (LK.band) { g.fillStyle = LK.band; g.beginPath(); g.moveTo(-44, -30); g.quadraticCurveTo(4, -54, 49, -34); g.lineTo(49, -22); g.quadraticCurveTo(4, -42, -44, -17); g.closePath(); g.fill(); }\n  if (!LK.hair) { g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.ellipse(14, -50, 20, 7, -0.2, 0, 7); g.fill(); }\n", 1)
txt = txt.replace("  g.fillStyle = '#120a06'; g.beginPath(); g.moveTo(-34, 8);", "  if (LK.beard) { g.fillStyle = '#120a06'; g.beginPath(); g.moveTo(-34, 8);")
txt = txt.replace("g.quadraticCurveTo(-18, 34, -26, 8); g.closePath(); g.fill();\n  g.beginPath(); g.moveTo(4, 26); g.quadraticCurveTo(24, 18, 42, 26); g.lineTo(42, 31); g.quadraticCurveTo(24, 24, 4, 31); g.closePath(); g.fill();", "g.quadraticCurveTo(-18, 34, -26, 8); g.closePath(); g.fill();\n  g.beginPath(); g.moveTo(4, 26); g.quadraticCurveTo(24, 18, 42, 26); g.lineTo(42, 31); g.quadraticCurveTo(24, 24, 4, 31); g.closePath(); g.fill(); }")
assert 'if (LK.hair)' in txt and 'if (LK.beard)' in txt and 'LK.band' in txt, 'gating failed'
looks = '''
const LOOK = {
  jordan: { skin: '#6a3d24', skinD: '#44261a', jc: '#c8102e', jc2: '#8d0b20', trim: '#ffffff', sole: '#111111', name: 'BULLS', num: '23', numc: '#ffffff', numo: '#111111', hair: false, beard: false, band: null },
  lebron: { skin: '#7b4a2f', skinD: '#4a2c1c', jc: '#552583', jc2: '#3b1a5c', trim: '#fdb927', sole: '#fdb927', name: 'LAKERS', num: '23', numc: '#fdb927', numo: '#2a0f45', hair: true, beard: true, band: '#fdb927' },
};
'''
txt = txt.replace('// ---------- KD rig ----------', looks + '// ---------- player rig (from the QA\'d KD rig) ----------')
open(os.path.join(HERE, '_rig.html'), 'w').write(txt)
shots = open(os.path.join(HERE, 'shots.js')).read()
tail_txt = '\n'.join(tail)
tail_txt = tail_txt.replace('window.TOTAL = 67.6;', '').replace("txt(w, 0, 0, 104, key ? C.gold : C.white, { stroke: 18 })", "txt(w, 0, 0, 104, key ? C.gold : C.white, { stroke: 18, maxW: 860 })")
tail_txt = re.sub(r"  for \(const it of \[23\.9, 51\.0, 58\.7\]\).*\n", "", tail_txt)
tail_txt = re.sub(r"const NOCAP = new Set\(\[[^\]]*\]\);", "const NOCAP = new Set([11]);", tail_txt)
tail_txt = re.sub(r"  if \(i === 0\) \{ slam\('HESI PULL-UP'.*\n", "", tail_txt)
tail_txt = tail_txt.replace('(KD|DURANT|GALACTUS|HESI|IMPOSSIBLE|TIMING|SLOW|PHYSICS|LATE|SWISH|PROBLEM|PLANET|ONCE|NEXT|38|28|FOUR|WORLDS)', '(JORDAN|LEBRON|WINS|SIX|TEN|FORTY|FOUR|ELEVEN|NINE|DUNK|FADEAWAY|SERIES|DIFFERENT|COMMENT|UNDEFEATED|NEVER)')
html = txt + '\n' + measure + '\n' + shots + '\n' + tail_txt + '\n'
thumb = '''
window.renderThumb = () => { T = 2.4; g.setTransform(1, 0, 0, 1, 0, 0); g.save(); cam(1.0, 540, 1000); arena(0.5); glow(540, 900, 700, '255,255,255', 0.12); jord(250, mixP(P.stand, P.flex, 0.0), { k: 1.12 }); lebr(830, P.stand, { k: 1.12 }); g.restore(); speedLines(540, 1000, 0.2, 60);
  const vg = g.createRadialGradient(W / 2, 1000, H * 0.3, W / 2, 1000, H * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 70, W, 520); txt('WHO WINS?', 540, 250, 190, C.white); txt('PRIME JORDAN', 540, 410, 112, RED, { maxW: 980 }); txt('vs PRIME LEBRON', 540, 545, 104, GOLDL, { glow: GOLDL, maxW: 980 });
  g.save(); g.translate(540, 1000); g.fillStyle = '#0a0620'; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.fill(); g.strokeStyle = '#7fe7ff'; g.lineWidth = 9; g.shadowColor = '#7fe7ff'; g.shadowBlur = 34; g.stroke(); g.shadowBlur = 0; txt('VS', 0, 34, 96, C.white, { stroke: 8 }); g.restore(); return true; };
'''
html += thumb
html += "Promise.all([fetch('./words.json').then((r) => r.json()), fetch('./lines.json').then((r) => r.json())]).then(([w, ln]) => { WORDS = w; LINES = ln; window.TOTAL = ln[ln.length - 1].e + 2.3; buildShots(); window.ready = true; });\n</script></body></html>\n"
open(os.path.join(HERE, 'lbmj.html'), 'w').write(html)
print('built', len(html))
