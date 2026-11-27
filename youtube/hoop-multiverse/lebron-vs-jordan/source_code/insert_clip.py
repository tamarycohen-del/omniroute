"""Replace the narrator's spoken 'LeBron' (hook) and 'LeBron James' (his intro) with the user's sound clip (the 'LeBron James!' shout), keeping everything on time.
usage: insert_clip.py <base voice.wav> <orig_words.json> <orig_lines.json> <clip.mp3> <out voice.wav> <out words.json> <out lines.json> <out clips.json>
All later words/lines are shifted by the length difference, so shots, captions and sfx (which key on words.json/lines.json) stay in sync."""
import json, re, subprocess, sys
import numpy as np
SR = 48000
base, wj, lj, clip_p, out_wav, out_w, out_l, out_c = sys.argv[1:9]
dec = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
V = dec(base); C = dec(clip_p)
W = json.load(open(wj)); L = json.load(open(lj))
act = lambda a: np.sqrt(np.mean(a[np.abs(a) > 0.01] ** 2))
C = C[int(0.30 * SR):int(1.74 * SR)] * (1.0 * act(V) / act(C))
C[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]; C[-int(0.04 * SR):] *= np.linspace(1, 0, int(0.04 * SR))[:, None]
lead = 0.12                                   # seconds of the clip before the shout starts
isLB = lambda w: re.match(r'^lebron', re.sub('[^a-z]', '', w['w'].lower()))
def valley(t0, before, after):                # quietest 10 ms near t0 (so the cut never lands inside a sound)
    i0 = int((t0 - before) * SR); i1 = int((t0 + after) * SR); h = int(0.01 * SR)
    best = min(range(i0, i1, h // 2), key=lambda i: float(np.sqrt(np.mean(V[i:i + h] ** 2))))
    return (best + h // 2) / SR
cuts = []                                      # (cut start, cut end) in seconds, in the ORIGINAL timeline
# 1) hook: "Prime [LeBron]. Prime Jordan."   2) his intro: "[LeBron James]. 6'9" ..."
for li, nxt_re in ((0, None), (4, None)):
    a, b = L[li]['s'] - 0.05, L[li + 1]['s']
    ws = [i for i, w in enumerate(W) if a <= w['s'] < b]
    first = next(i for i in ws if isLB(W[i]))
    last = first + (1 if re.match(r'^james', re.sub('[^a-z]', '', W[first + 1]['w'].lower())) else 0) if first + 1 < len(W) else first
    cs = valley(W[first]['s'] - 0.03, 0.10, 0.05); ce = valley(W[last + 1]['s'] - 0.05, 0.10, 0.04)
    cuts.append((cs, ce, first, last))
out = []; pos = 0.0; shifts = []
for cs, ce, f, l in cuts:
    seg = V[int(pos * SR):int(cs * SR)].copy(); fo = int(0.012 * SR); seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
    if pos > 0: seg[:fo] *= np.linspace(0, 1, fo)[:, None]
    out.append(seg); out.append(np.zeros((int(0.02 * SR), 2), np.float32)); out.append(C); pos = ce
tail = V[int(pos * SR):].copy(); fi = int(0.012 * SR); tail[:fi] *= np.linspace(0, 1, fi)[:, None]; out.append(tail)
# fade-in of the segment that follows the first clip as well
X = np.concatenate(out)
sf = np.zeros(len(X)); 
import soundfile as sf
sf.write(out_wav, X, SR)
clen = len(C) / SR + 0.02
def fmap(t):
    d = 0.0
    for cs, ce, f, l in cuts:
        if t >= ce: d += clen - (ce - cs)
        elif t > cs: return cs + d + (t - cs) * clen / (ce - cs)
    return t + d
nw = []; clips = []
for i, w in enumerate(W):
    inside = [c for c in cuts if c[2] <= i <= c[3]]
    if inside:
        c = inside[0]
        if i == c[2]:
            s0 = fmap(c[0]) ; nw.append({'w': 'LEBRON JAMES!', 's': round(s0 + lead + 0.02, 2), 'e': round(s0 + clen - 0.1, 2)}); clips.append({'s': round(s0 + 0.02, 2), 'e': round(s0 + clen, 2)})
        continue
    nw.append({'w': w['w'], 's': round(fmap(w['s']), 2), 'e': round(fmap(w['e']), 2)})
nl = [{**l, 's': round(fmap(l['s']), 2), 'e': round(fmap(l['e']), 2)} for l in L]
json.dump(nw, open(out_w, 'w')); json.dump(nl, open(out_l, 'w'), indent=1); json.dump(clips, open(out_c, 'w'))
print('clips', clips, 'new length', round(len(X) / SR, 2), 'last line end', nl[-1]['e'])
