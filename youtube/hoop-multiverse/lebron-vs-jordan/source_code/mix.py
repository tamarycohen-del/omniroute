"""Jordan vs LeBron mix: voice + ORIGINAL numpy music (hype beat, bass, pad, arp) + synthesized swish/crowd/whistle/bounces + CC0 sfx-kit.
Everything is free. Timings come from lines.json / words.json, so swapping the voice (e.g. to ElevenLabs) only needs those two files regenerated.
usage: python mix.py <voice.(wav|mp3)> <lines.json> <words.json> <out.wav>
"""
import json, os, re, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'tools'))
from sfxkit import Kit

SR = 48000
voice_p, lines_p, words_p, out_p = sys.argv[1:5]
LINES = json.load(open(lines_p)); WORDS = json.load(open(words_p))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice_p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
V = np.frombuffer(raw, np.float32).reshape(-1, 2)
TOTAL = LINES[-1]['e'] + 2.3
N = int(TOTAL * SR); t = np.arange(N) / SR
rng = np.random.default_rng(11)
S0 = [0.0] + [l['s'] for l in LINES[1:]]           # shot starts
ST = lambda i, u=0.0: S0[i] + u                      # time inside shot i
def wt(i, rx, nth=0, dflt=0.0):
    a = LINES[i]['s'] - 0.05; b = LINES[i + 1]['s'] if i + 1 < len(LINES) else 1e9
    ms = [w for w in WORDS if a <= w['s'] < b and re.match(rx, w['w'])]
    return ms[nth]['s'] - S0[i] if len(ms) > nth else dflt


d7 = S0[8] - S0[7]
nm = [w for w in WORDS if S0[7] - 0.1 <= w['s'] <= LINES[7]['e'] + 0.2 and re.match(r'^(jordan|lebron)', re.sub('[^a-z]', '', w['w'].lower()))]
BEATS = [0, nm[1]['s'] - S0[7], nm[2]['s'] - S0[7], nm[3]['s'] - S0[7], d7] if len(nm) >= 4 else [0, d7 * .25, d7 * .5, d7 * .75, d7]
score_t = [S0[7] + BEATS[b] + 0.78 * (BEATS[b + 1] - BEATS[b]) for b in range(4)]

# ---------------- music: 108 bpm, Dm - Bb - F - C, kick/clap/hat, sub bass, pad, arp ----------------
BPM = 108; beat = 60 / BPM
chords = [(73.42, [146.83, 174.61, 220.0]), (58.27, [116.54, 146.83, 174.61]), (87.31, [174.61, 220.0, 261.63]), (65.41, [130.81, 164.81, 196.0])]
M = np.zeros(N)
bar = beat * 4
for k in range(int(TOTAL / bar) + 1):
    root, tri = chords[k % 4]; i0 = int(k * bar * SR); i1 = min(N, int((k + 1) * bar * SR))
    if i0 >= N: break
    tt = t[i0:i1] - k * bar
    env = np.minimum(1, tt / 0.05) * np.minimum(1, (bar - tt) / 0.1)
    M[i0:i1] += 0.55 * np.sin(2 * np.pi * root * tt) * env                                     # sub bass
    for f in tri: M[i0:i1] += 0.10 * (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.003 * tt)) * env  # pad
    for j in range(8):                                                                      # 8th-note arp
        a0 = int((k * bar + j * beat / 2) * SR); n = int(0.22 * SR)
        if a0 + n >= N: break
        f = tri[j % 3] * (2 if j % 4 == 3 else 1); x = np.arange(n) / SR
        M[a0:a0 + n] += 0.12 * np.sign(np.sin(2 * np.pi * f * x)) * np.exp(-x * 14) * 0.5 + 0.10 * np.sin(2 * np.pi * f * 2 * x) * np.exp(-x * 12)
for q in range(int(TOTAL / beat) + 1):
    at = q * beat; i0 = int(at * SR)
    if i0 >= N: break
    n = int(0.3 * SR); tt = np.arange(n) / SR; b = min(N, i0 + n)
    M[i0:b] += 0.95 * (np.sin(2 * np.pi * (52 + 100 * np.exp(-tt * 28)) * tt) * np.exp(-tt * 8))[:b - i0]   # kick
    if q % 2 == 1:                                                                                         # clap
        nn = int(0.14 * SR); cl = rng.standard_normal(nn) * np.exp(-np.arange(nn) / nn * 7); bb = min(N, i0 + nn); M[i0:bb] += 0.22 * np.diff(np.concatenate([[0], cl]))[:bb - i0]
    for h in (0, 1):                                                                                       # hats
        hi = i0 + int(h * beat / 2 * SR); nn = int(0.05 * SR)
        if hi + nn < N: hat = rng.standard_normal(nn) * np.exp(-np.arange(nn) / nn * 7); M[hi:hi + nn] += (0.07 if h == 0 else 0.12) * np.diff(np.concatenate([[0], hat]))
# energy map: calm for the résumés, up for the 1-on-1, drop for the cliffhanger
tcut = S0[9] + wt(9, r"^shoots", 0, 3.0) + 0.34
energy = np.interp(t, [0, S0[2] - 0.5, S0[6], S0[7], S0[9], tcut - 0.05, tcut + 0.2, TOTAL], [0.9, 0.75, 1.0, 1.15, 1.1, 1.0, 0.0, 0.0])
M *= energy; M /= np.max(np.abs(M)) + 1e-9
L = M * 0.16; R = M * 0.16


def put(x, at, g=1.0, pan=0.0):
    i0 = int(at * SR)
    if i0 >= N or i0 < 0: return
    b = min(N, i0 + len(x)); L[i0:b] += x[:b - i0] * g * (1 - max(0, pan)); R[i0:b] += x[:b - i0] * g * (1 + min(0, pan))


def swish(at, g=0.55):                      # net: filtered noise burst
    n = int(0.55 * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n) * np.exp(-tt * 7) * np.minimum(1, tt / 0.01)
    x = np.convolve(x, np.ones(8) / 8, mode='same'); put(x, at, g)


def bounce(at, g=0.45):
    n = int(0.14 * SR); tt = np.arange(n) / SR; put(np.sin(2 * np.pi * (95 + 70 * np.exp(-tt * 45)) * tt) * np.exp(-tt * 32), at, g)


def squeak(at, g=0.12):
    n = int(0.12 * SR); tt = np.arange(n) / SR; put(np.sin(2 * np.pi * (1800 + 900 * tt / 0.12) * tt) * np.exp(-tt * 18), at, g)


def whistle(at, g=0.22):
    n = int(0.9 * SR); tt = np.arange(n) / SR; f = 2750 + 90 * np.sin(2 * np.pi * 38 * tt); put(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tt / 0.03) * np.exp(-np.maximum(0, tt - 0.6) * 9), at, g)


def crowd(at, dur, g=0.5):                  # roar: band-limited noise swell
    n = int(dur * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
    k = np.ones(40) / 40; x = np.convolve(x, k, mode='same') - np.convolve(x, np.ones(400) / 400, mode='same')
    env = np.minimum(1, tt / 0.25) * np.exp(-np.maximum(0, tt - dur * 0.35) * 2.2); put(x * env * 2.2, at, g)


kit = Kit(SR)
for s in S0[1:]: kit.place(L, R, 'whoosh-fast-soft', s, 0.30)
for at in np.arange(0.2, S0[1] - 0.2, 0.34): bounce(at, 0.30)
kit.place(L, R, 'riser-1s-soft', ST(1, wt(1, r"^let", 0, 0.7) - 0.6), 0.35); kit.place(L, R, 'impact-medium-firm', ST(1, wt(1, r"^let", 0, 0.7)), 0.5)
for u in (wt(2, r"^trips", 0, 2.2) - 0.05, wt(2, r"^championships", 0, 3.4) - 0.0, wt(2, r"^never", 0, 4.6)): kit.place(L, R, 'impact-light-firm', ST(2, u), 0.38)
kit.place(L, R, 'impact-light-firm', ST(3, wt(3, r"^10", 0, 0.2)), 0.4); kit.place(L, R, 'impact-light-firm', ST(3, wt(3, r"^30", 0, 1.6)), 0.4); kit.place(L, R, 'impact-medium-soft', ST(3, wt(3, r"^highest", 0, 3.3)), 0.4)
kit.place(L, R, 'impact-light-firm', ST(4, wt(4, r"^250", 0, 2.2)), 0.38); kit.place(L, R, 'impact-light-firm', ST(4, wt(4, r"^4$", 0, 3.6)), 0.38)
c40 = wt(5, r"^40", 0, 0.5)
for q in range(12): bounce(ST(5, c40 + q * 0.1), 0.10 + 0.012 * q)       # count-up ticks
kit.place(L, R, 'impact-medium-firm', ST(5, c40 + 1.25), 0.45); kit.place(L, R, 'impact-light-soft', ST(5, wt(5, r"^all-time", 0, 2.6)), 0.4)
whistle(ST(6, wt(6, r"^tip", 0, 0.5))); kit.place(L, R, 'impact-medium-soft', ST(6, wt(6, r"^off", 0, 1.0) + 0.8), 0.5)
for b in range(4):                                                         # the 1-on-1
    b0 = S0[7] + BEATS[b]; bd = BEATS[b + 1] - BEATS[b]
    for q in range(3): bounce(b0 + 0.12 + q * 0.22, 0.28)
    for q in range(3): squeak(b0 + 0.1 + q * 0.17, 0.10)
    sc = score_t[b]
    if b == 1: kit.place(L, R, 'impact-heavy-hard', sc, 0.65); crowd(sc + 0.05, 1.6, 0.5)
    else: swish(sc, 0.6)
    if b == 3: crowd(sc + 0.05, 1.8, 0.5)
kit.place(L, R, 'riser-2s-strong', S0[8] + 0.2, 0.30)
for q in range(8): bounce(S0[8] + 0.4 + q * 0.38, 0.30)
tR = S0[9] + wt(9, r"^shoots", 0, 3.0)                       # last shot: dribbles, rise, release, then CUT to black (no swish, no result)
for q in range(5): bounce(S0[9] + 0.15 + q * 0.4, 0.28)
kit.place(L, R, 'riser-1s-soft', tR - 0.8, 0.35); kit.place(L, R, 'impact-light-soft', tR, 0.4)

VL = np.zeros(N); VR = np.zeros(N); n = min(N, len(V)); VL[:n] = V[:n, 0]; VR[:n] = V[:n, 1]
env = np.convolve(np.abs(VL), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same'); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.3), 0, 1)
L = L * duck + VL; R = R * duck + VR
# the user's sound "Well, bye guys!" = the outro: plays alone in the black right after the cut (music and sfx are off, no voice)
cl = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(os.path.dirname(__file__), '..', 'assets', 'well_bye_guys.mp3'), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
act = lambda a: np.sqrt(np.mean(a[np.abs(a) > 0.01] ** 2))
gain = 1.15 * act(V) / act(cl); c0 = int((tcut + 0.1) * SR); c1 = min(N, c0 + len(cl))
L[c0:c1] += cl[:c1 - c0, 0] * gain; R[c0:c1] += cl[:c1 - c0, 1] * gain
fo = int(0.12 * SR); L[-fo:] *= np.linspace(1, 0, fo); R[-fo:] *= np.linspace(1, 0, fo)
X = np.stack([L, R], 1).astype(np.float32)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af',
                'acompressor=threshold=-20dB:ratio=3:attack=10:release=200,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.7:level=false', '-ar', str(SR), out_p], input=X.tobytes(), check=True)
print('mix', out_p, round(TOTAL, 2))
