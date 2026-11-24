# FLOOR 40 Part 2 sound. Impact on frame 0, hull slap, water, paddle splashes synced (T*4.2 cycle), boat jolt, fingers creak, can throw + far splash,
# stair echoes + drips, footsteps running up, room tone + soup simmer, closet growl, choice heartbeat riser, two knocks, hard cut.
import numpy as np, subprocess, json
SR = 48000; T = float(open('total.txt').read()); N = int(SR * T); rng = np.random.default_rng(21); t = np.arange(N) / SR
V = json.load(open('words2.json'))
def first(word, n=1):
    c = 0
    for w in V:
        if w['w'].lower().strip('.,?!"') == word.lower():
            c += 1
            if c == n: return w['s']
def env(a, b, fi=0.05, fo=0.2):
    e = np.zeros(N); i0, i1 = int(max(0, a) * SR), min(N, int(b * SR)); n = i1 - i0
    if n <= 0: return e
    x = np.arange(n) / SR; e[i0:i1] = np.minimum(1, x / max(fi, 1e-3)) * np.minimum(1, (n / SR - x) / max(fo, 1e-3)); return e
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= ((f > lo) & (f < hi)); return np.fft.irfft(X, len(x))
L = np.zeros(N); R = np.zeros(N)
def addst(x, pan=0.0, g=1.0):
    global L, R; L += x * g * (1 - pan) ** 0.5; R += x * g * (1 + pan) ** 0.5
def place(sig, when, g=1.0, pan=0.0):
    if when is None: return
    full = np.zeros(N); i = int(when * SR); m = max(0, min(len(sig), N - i)); full[i:i + m] = sig[:m]; addst(full, pan, g)
def burst(dur, lo, hi, decay):
    n = int(dur * SR); x = np.arange(n) / SR; return bp(rng.standard_normal(n), lo, hi) * np.exp(-x * decay)
def thud(f0=45, dur=1.6, dec=2.4):
    n = int(dur * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * (f0 + 50 * np.exp(-x * 10)) * x) * np.exp(-x * dec) + bp(rng.standard_normal(n), 60, 500) * np.exp(-x * 7) * 0.5
def wsplash(dur=0.7):
    n = int(dur * SR); x = np.arange(n) / SR; return bp(rng.standard_normal(n), 300, 6000) * np.exp(-x * 7) * (1 - np.exp(-x * 80))
sec = {k: first(*v) if isinstance(v, tuple) else first(v) for k, v in dict(most='most', cross='200', paddle='every', stop='then', throw=('so', 2), free='five', stairs='other', prints='wet', climb='20', table='table', never=('footprints', 2), closet=('biscuit', 2), eat='eat').items()}
end = V[-1]['e']
# water bed (outdoor until the stairs), stair drips/echo, room tone
wb = bp(rng.standard_normal(N), 80, 900); wb /= np.abs(wb).max(); lap = 0.55 + 0.45 * np.sin(2 * np.pi * t / 2.1) ** 2
addst(wb * lap * 0.2 * env(0, sec['stairs'] + 1.0, 0.01, 0.8), -0.2); addst(np.roll(wb, 9000) * lap * 0.2 * env(0, sec['stairs'] + 1.0, 0.01, 0.8), 0.2)
addst(bp(rng.standard_normal(N), 300, 2500) / 3 * 0.05 * env(0, sec['stairs'], 0.01, 0.5))
for k in np.arange(sec['stairs'], sec['table'], 0.7): place(burst(0.12, 1500, 5000, 40) * np.sin(2 * np.pi * 1800 * np.arange(int(0.12 * SR)) / SR), k + rng.random() * 0.3, 0.12, rng.random() - 0.5)
addst(bp(rng.standard_normal(N), 60, 300) / 2 * 0.05 * env(sec['table'] - 0.2, T, 0.3, 0.1))
# frame 0 impact + hull slap
place(thud(40, 2.0, 1.8), 0.0, 0.9); place(burst(0.25, 150, 1200, 18), 0.55, 0.9, 0.1); place(wsplash(0.9), 0.55, 0.7, 0.2)
# hook: paddle strokes (T*5 cycle), paddle section strokes synced to T*4.2 cycle
for tk in np.arange(0.2, sec['most'], 2 * np.pi / 5): place(wsplash(0.4), tk, 0.25, 0.3)
for tk in np.arange(sec['paddle'] - 0.15 - ((sec['paddle'] - 0.15) % (2 * np.pi / 4.2)) + 2 * np.pi / 4.2, sec['stop'] - 0.15, 2 * np.pi / 4.2): place(wsplash(0.5), tk, 0.45, 0.3); place(thud(38, 1.0, 4), tk + 0.4, 0.25)
for tk in np.arange(sec['cross'], sec['paddle'], 2 * np.pi / 5): place(wsplash(0.4), tk, 0.18, 0.2)
# boat stops: jolt + wood creak + fingers
place(thud(55, 1.0, 5), sec['stop'] - 0.15, 0.8); n = int(1.6 * SR); x = np.arange(n) / SR; cr = np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 3 * x)) * x) * bp(rng.standard_normal(n), 100, 2000) * np.exp(-x * 1.5); place(cr, sec['stop'] + 0.6, 0.35)
# throw: whoosh, far splash, shadow rush
place(burst(0.5, 800, 5000, 6) * np.linspace(0, 1, int(0.5 * SR)), sec['throw'], 0.3, -0.3); place(wsplash(1.0), sec['throw'] + 1.0, 0.5, 0.6); place(bp(rng.standard_normal(int(1.2 * SR)), 60, 400) * np.hanning(int(1.2 * SR)), sec['throw'] + 1.2, 0.6, 0.5)
# free: fast paddling
for tk in np.arange(sec['free'], sec['stairs'], 2 * np.pi / 9): place(wsplash(0.3), tk, 0.25, 0.2)
# stairs: step out (wet), prints: drips, climb: running footsteps up
place(wsplash(0.4), sec['stairs'] + 0.8, 0.4)
for tk in np.arange(sec['climb'], sec['table'] - 0.2, np.pi / 14): place(burst(0.07, 150, 2500, 60), tk, 0.35, 0.3 if int(tk * 10) % 2 else -0.3)
# table: soup simmer; never: flicker buzz
addst(bp(rng.standard_normal(N), 2000, 8000) * env(sec['table'], sec['never'] + 2, 0.2, 0.5) * 0.04 * (0.5 + 0.5 * (rng.random(N) > 0.97)))
addst(np.sign(np.sin(2 * np.pi * 120 * t)) * 0.02 * env(sec['never'], sec['closet'], 0.05, 0.1))
# closet: Biscuit growl
gr = bp(rng.standard_normal(N), 60, 280) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 27 * t))); addst(gr / np.abs(gr).max() * env(sec['closet'] + 0.5, end + 1.4, 0.3, 0.05) * 0.5, -0.2)
# choice: heartbeat speeding + riser, two knocks after the last word, then hard cut
tt = sec['eat'] - 0.15
while tt < end + 0.1:
    place(thud(52, 0.3, 20), tt, 0.5); place(thud(52, 0.3, 20), tt + 0.18, 0.35); tt += 0.5
ris = bp(rng.standard_normal(N), 400, 6000) * env(sec['eat'] - 0.15, end + 0.12, 2.5, 0.01) * 0.15; addst(ris)
for k in (0.12, 0.57): place(thud(70, 0.5, 9), end + k, 1.0, -0.3); place(burst(0.08, 200, 3000, 50), end + k, 0.8, -0.3)

# added beats: note paper, closet door creak, water trickle under the door
n0 = first('next'); place(burst(0.5, 1500, 8000, 6), n0 + 1.6, 0.25)
d0 = first('door')
if d0:
    n = int(1.4 * SR); x = np.arange(n) / SR; cr = np.sin(2 * np.pi * (140 + 90 * x) * x) * bp(rng.standard_normal(n), 100, 2500) * np.exp(-x * 1.2); place(cr, d0 + 0.3, 0.5, -0.3)
s0 = first('spreading.') or first('spreading')
if s0: addst(bp(rng.standard_normal(N), 800, 5000) * env(s0 - 1.2, first('eat') + 0.5, 0.6, 0.4) * 0.07 * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)), -0.3)
# drone under the night-free parts
dr = np.sin(2 * np.pi * 49 * t) + 0.5 * np.sin(2 * np.pi * 73.5 * t)
addst(dr * 0.05 * env(sec['stop'] - 0.3, sec['free'], 0.1, 0.5) + dr * 0.06 * env(sec['prints'], end + 0.95, 0.5, 0.01))
# duck under voice; hard cut at end+0.95
duck = np.ones(N)
for w in V: duck[int(max(0, w['s'] - 0.12) * SR):int((w['e'] + 0.25) * SR)] = 0.6
k = int(0.1 * SR); duck = np.convolve(duck, np.ones(k) / k, mode='same'); duck[int((end + 0.95) * SR):] = 0
st = np.stack([L * duck, R * duck], 1); st /= max(1e-9, np.abs(st).max()) / 0.7
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', 'sfx.wav'], input=st.astype(np.float32).tobytes(), check=True)
print('sfx ok', sec)
