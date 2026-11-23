# FLOOR 40 Part 1 sound: water bed, wind, rain, chalk, cans, SOS beeps, flashlight clicks, silence, thump, boat knocks, paper, digging, drone, hits. Ducks under the voice.
import numpy as np, subprocess, json
SR = 48000; T = float(open('total.txt').read()); N = int(SR * T); rng = np.random.default_rng(11); t = np.arange(N) / SR
V = json.load(open('words1.json')); at = {}
def first(word, n=1):
    c = 0
    for w in V:
        if w['w'].lower().strip('.,?!"') == word:
            c += 1
            if c == n: return w['s']
def env(a, b, fi=0.05, fo=0.2):
    e = np.zeros(N); i0, i1 = int(a * SR), min(N, int(b * SR)); n = i1 - i0
    if n <= 0: return e
    x = np.arange(n) / SR; e[i0:i1] = np.minimum(1, x / max(fi, 1e-3)) * np.minimum(1, (n / SR - x) / max(fo, 1e-3)); return e
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= ((f > lo) & (f < hi)); return np.fft.irfft(X, len(x))
L = np.zeros(N); R = np.zeros(N)
def addst(x, pan=0.0, g=1.0):
    global L, R; L += x * g * (1 - pan) ** 0.5; R += x * g * (1 + pan) ** 0.5
def place(sig, when, g=1.0, pan=0.0):
    full = np.zeros(N); i = int(when * SR); m = max(0, min(len(sig), N - i)); full[i:i + m] = sig[:m]; addst(full, pan, g)
def burst(dur, lo, hi, decay):
    n = int(dur * SR); x = np.arange(n) / SR; return bp(rng.standard_normal(n), lo, hi) * np.exp(-x * decay)
night0, night1 = first('then') - 0.15, first('that') - 0.15   # night section
scary = first('that') - 0.15; choice = first('so') - 0.15
# water bed: lapping (lowpassed noise, slow swell), all film; quieter at night
wb = bp(rng.standard_normal(N), 80, 700); wb /= np.abs(wb).max()
lap = 0.55 + 0.45 * np.sin(2 * np.pi * t / 2.3) ** 2
addst(wb * lap * 0.16 * (1 - 0.4 * env(night0, night1, 0.8, 0.8)), -0.2); addst(np.roll(wb, 7000) * lap * 0.16, 0.2)
# wind gusts against glass
wn = bp(rng.standard_normal(N), 300, 2500); wn /= np.abs(wn).max(); addst(wn * (0.04 + 0.05 * np.maximum(0, np.sin(2 * np.pi * t / 6.1))) )
# rain beat
r0 = first('rain'); addst(bp(rng.standard_normal(N), 1500, 9000) * env(r0 - 0.3, first('cans') + 0.4, 0.3, 0.6) * 0.09)
for k in range(30): place(burst(0.02, 2500, 8000, 200), r0 + rng.random() * 1.6, 0.25, rng.random() - 0.5)
# chalk scrape on the 9th tally
c0 = first('nine') + 0.3; addst(bp(rng.standard_normal(N), 2000, 7000) * env(c0, c0 + 0.55, 0.05, 0.1) * 0.22 * (0.6 + 0.4 * np.sin(2 * np.pi * 37 * t)))
# can clinks while counting
k0 = first('cans')
for i in range(6):
    n = int(0.25 * SR); x = np.arange(n) / SR; s = (np.sin(2 * np.pi * 2400 * x) + 0.6 * np.sin(2 * np.pi * 3700 * x)) * np.exp(-x * 30); place(s, k0 + i * 0.31, 0.12, -0.3 + i * 0.12)
# SOS beeps synced with the blink scene (same pattern as sos() in f40.html)
b0 = first('three') - 0.15; tt = b0
for d in [0.25, 0.25, 0.25, 0.7, 0.7, 0.7, 0.25, 0.25, 0.25]:
    n = int(d * SR); x = np.arange(n) / SR; s = np.sin(2 * np.pi * 880 * x) * np.minimum(1, x / 0.01) * np.minimum(1, (d - x) / 0.02); place(s, tt, 0.08, 0.4); tt += d + 0.18
# flashlight clicks
f0 = first('flashed') - 0.25
for i in range(4): place(burst(0.015, 1500, 6000, 300), f0 + i * 0.26, 0.5)
# silence: everything ducks hard before "That wasn't the scary part", then a heavy thump
sil = env(first('out') + 0.3, scary, 0.2, 0.02)
n = int(1.8 * SR); x = np.arange(n) / SR; th = np.sin(2 * np.pi * (45 + 50 * np.exp(-x * 10)) * x) * np.exp(-x * 2.2) + bp(rng.standard_normal(n), 60, 400) * np.exp(-x * 6) * 0.5
# boat knocks (hollow plastic) during boat + empty
bk0, bk1 = first('this') - 0.15, first('floor', 3) - 0.1
for tk in np.arange(bk0 + 0.2, bk1, 1.15):
    n2 = int(0.2 * SR); x2 = np.arange(n2) / SR; s = (np.sin(2 * np.pi * 180 * x2) + 0.5 * np.sin(2 * np.pi * 410 * x2)) * np.exp(-x2 * 25); place(s, tk, 0.35, -0.2)
# paper: note + torn page
for p0 in (first('floor', 3) - 0.1, first('same') - 0.15):
    addst(bp(rng.standard_normal(N), 1500, 8000) * env(p0, p0 + 0.6, 0.02, 0.3) * 0.12 * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t))))
# Biscuit digging
d0 = first('biscuit')
for i in range(10): place(burst(0.06, 400, 3000, 60), d0 + 0.2 + i * 0.13, 0.25, 0.2)
# drone: low, grows from the boat to the choice
dr = np.sin(2 * np.pi * 49 * t) + 0.5 * np.sin(2 * np.pi * 73.5 * t + 0.4) + 0.25 * np.sin(2 * np.pi * 98 * t)
addst(dr * np.clip((t - bk0) / (choice - bk0), 0, 1) * 0.07 * env(bk0, T, 2.0, 2.0))
addst(dr * 0.04 * env(night0, night1, 1.0, 0.3))
# hits: open, scary thump, choice
place(th, scary, 0.9)
place(th, choice, 0.8)
n = int(3 * SR); x = np.arange(n) / SR; sw = sum(np.sin(2 * np.pi * 55 * k * x) / k for k in range(1, 12)); sw = bp(sw * np.exp(-x * 0.8), 30, 900); place(sw, choice, 0.12)
place(th, 0.05, 0.4)
# end swell on "again"
a0 = first('again'); addst(bp(rng.standard_normal(N), 200, 3000) * env(a0 - 1.0, a0 + 0.4, 1.2, 0.05) * 0.10)
# duck under voice + the silence
duck = np.ones(N)
for w in V: duck[int((w['s'] - 0.15) * SR):int((w['e'] + 0.3) * SR)] = 0.55
k = int(0.12 * SR); duck = np.convolve(duck, np.ones(k) / k, mode='same') * (1 - 0.9 * sil)
st = np.stack([L * duck, R * duck], 1); st /= max(1e-9, np.abs(st).max()) / 0.7
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', 'sfx.wav'], input=st.astype(np.float32).tobytes(), check=True)
print('sfx ok')
