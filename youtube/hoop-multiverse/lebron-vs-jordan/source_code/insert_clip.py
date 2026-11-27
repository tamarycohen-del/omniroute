"""Put the user's sound clip (the 'LeBron James!' shout) into the narration, keeping everything on time.
  hook : "Prime" (narrator, first word of the original take) + [CLIP] + "versus Prime Jordan. Tied game. One shot left." (new take)
  intro: the narrator's spoken 'LeBron James' (start of his résumé line) is replaced by the clip.
usage: insert_clip.py <base voice.wav> <orig_words.json> <orig_lines.json> <clip.mp3> <out voice.wav> <out words.json> <out lines.json> <out clips.json>
All later words/lines are shifted by the length difference, so shots, captions and sfx (which key on words.json/lines.json) stay in sync."""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
SR = 48000
base, wj, lj, clip_p, out_wav, out_w, out_l, out_c = sys.argv[1:9]
HERE = os.path.dirname(os.path.abspath(__file__))
dec = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
V = dec(base); C = dec(clip_p)
W = json.load(open(wj)); L = json.load(open(lj))
act = lambda a: np.sqrt(np.mean(a[np.abs(a) > 0.01] ** 2))
C = C[int(0.30 * SR):int(1.74 * SR)] * (1.0 * act(V) / act(C))
C[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]; C[-int(0.04 * SR):] *= np.linspace(1, 0, int(0.04 * SR))[:, None]
clen = len(C) / SR
lead = 0.12                                   # seconds of the clip before the shout starts
isLB = lambda w: re.match(r'^lebron', re.sub('[^a-z]', '', w['w'].lower()))


def valley(A, t0, before, after):             # quietest 10 ms of A near t0 (so a cut never lands inside a sound)
    i0 = int((t0 - before) * SR); i1 = int((t0 + after) * SR); h = int(0.01 * SR)
    best = min(range(i0, i1, h // 2), key=lambda i: float(np.sqrt(np.mean(A[i:i + h] ** 2))))
    return (best + h // 2) / SR


# ---- hook lead-in: the word "Prime" taken from the ORIGINAL first take ("Prime LeBron. Prime Jordan...", same voice) ----
P = dec(os.path.join(HERE, '..', 'assets', 'el', 'l0_old.mp3'))
on = int(np.where(np.abs(P).max(axis=1) > 0.012)[0][0]); P = P[max(0, on - int(0.02 * SR)):]
pe = valley(P, 0.30, 0.10, 0.04); PRIME = P[:int(pe * SR)].copy(); PRIME *= (act(V) / act(PRIME)); PRIME[-int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))[:, None]
GAP = np.zeros((int(0.03 * SR), 2), np.float32)
HOOK = np.concatenate([PRIME, GAP, C, GAP]); hlen = len(HOOK) / SR
plen = len(PRIME) / SR

# ---- intro: replace the spoken "LeBron James" of line 4 ----
li = 4; a, b = L[li]['s'] - 0.05, L[li + 1]['s']
ws = [i for i, w in enumerate(W) if a <= w['s'] < b]
first = next(i for i in ws if isLB(W[i]))
last = first + (1 if re.match(r'^james', re.sub('[^a-z]', '', W[first + 1]['w'].lower())) else 0)
cs = valley(V, W[first]['s'] - 0.03, 0.10, 0.05); ce = valley(V, W[last + 1]['s'] - 0.05, 0.10, 0.04)
ilen = clen + 0.02

fo = int(0.012 * SR)
seg1 = V[:int(cs * SR)].copy(); seg1[:fo] *= np.linspace(0, 1, fo)[:, None]; seg1[-fo:] *= np.linspace(1, 0, fo)[:, None]
seg2 = V[int(ce * SR):].copy(); seg2[:fo] *= np.linspace(0, 1, fo)[:, None]
X = np.concatenate([HOOK, seg1, np.zeros((int(0.02 * SR), 2), np.float32), C, seg2])
sf.write(out_wav, X, SR)


def fmap(t):                                   # original time -> new time
    d = hlen
    if t >= ce: d += ilen - (ce - cs)
    elif t > cs: return hlen + cs + (t - cs) * ilen / (ce - cs)
    return t + d


nw = [{'w': 'Prime', 's': 0.02, 'e': round(plen, 2)}, {'w': 'LEBRON JAMES!', 's': round(plen + 0.03 + lead + 0.02, 2), 'e': round(plen + 0.03 + clen - 0.1, 2)}]
clips = [{'s': round(plen + 0.03, 2), 'e': round(plen + 0.03 + clen, 2)}]
for i, w in enumerate(W):
    if first <= i <= last:
        if i == first:
            s0 = fmap(cs); nw.append({'w': 'LEBRON JAMES!', 's': round(s0 + lead + 0.02, 2), 'e': round(s0 + ilen - 0.1, 2)}); clips.append({'s': round(s0 + 0.02, 2), 'e': round(s0 + ilen, 2)})
        continue
    nw.append({'w': w['w'], 's': round(fmap(w['s']), 2), 'e': round(fmap(w['e']), 2)})
nl = [{**l, 's': round(fmap(l['s']), 2), 'e': round(fmap(l['e']), 2)} for l in L]
nl[0]['s'] = round(plen + 0.03, 2)             # line 0 (hook) now starts with "Prime" + the clip
json.dump(nw, open(out_w, 'w')); json.dump(nl, open(out_l, 'w'), indent=1); json.dump(clips, open(out_c, 'w'))
print('clips', clips, 'new length', round(len(X) / SR, 2), 'last line end', nl[-1]['e'], 'prime len', round(plen, 2))
