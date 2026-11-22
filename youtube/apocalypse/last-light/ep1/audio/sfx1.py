# LAST LIGHT Part 1 sound: wind bed, drone, rewind whoosh, screeches, growl, heartbeat, braam, clock ticks; ducks under voice
import numpy as np, subprocess, json
SR = 48000; T = 38.0; N = int(SR * T); rng = np.random.default_rng(7)
t = np.arange(N) / SR
def env(a, b, fi=0.05, fo=0.2):
    e = np.zeros(N); i0, i1 = int(a * SR), min(N, int(b * SR)); n = i1 - i0
    if n <= 0: return e
    x = np.arange(n) / SR; e[i0:i1] = np.minimum(1, x / max(fi, 1e-3)) * np.minimum(1, (n / SR - x) / max(fo, 1e-3)); return e
def lp(x, k):  # one-pole lowpass via cumulative ema
    y = np.empty_like(x); a = k; acc = 0.0
    for i in range(0, len(x), 4096):
        seg = x[i:i+4096]; out = np.empty_like(seg)
        for j, v in enumerate(seg): acc += a * (v - acc); out[j] = acc
        y[i:i+4096] = out
    return y
def fft_lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))
def fft_bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= ((f > lo) & (f < hi)); return np.fft.irfft(X, len(x))
L = np.zeros(N); R = np.zeros(N)
def addst(x, pan=0.0, g=1.0): global L, R; L += x * g * (1 - pan) ** 0.5 / 1.0; R += x * g * (1 + pan) ** 0.5 / 1.0
# wind bed (whole piece, swells), quieter in flash-forward freeze
wn = fft_bp(rng.standard_normal(N), 150, 1400); wn /= np.abs(wn).max()
sw = 0.6 + 0.4 * np.sin(2 * np.pi * t / 7.3) * np.sin(2 * np.pi * t / 3.1 + 1)
addst(wn * sw * 0.10 * (env(0, T, 1.0, 1.5)), -0.2); addst(np.roll(wn, 9000) * sw * 0.10, 0.2)
# low drone rising toward the creatures
dr = (np.sin(2 * np.pi * 43 * t) + 0.5 * np.sin(2 * np.pi * 64.5 * t + 0.3) + 0.3 * np.sin(2 * np.pi * 86 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t))
drA = np.clip((t - 3) / 22, 0, 1) * 0.16 + 0.04
addst(dr * drA * env(2.2, 31.5, 1.5, 0.8) * 0.6)
# screech: noisy FM chirp
def screech(at, dur, f0, f1, g=0.5, pan=0.0):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 + (f1 - f0) * (x / dur) ** 0.6 + 40 * np.sin(2 * np.pi * 23 * x)
    ph = 2 * np.pi * np.cumsum(f) / SR; s = np.sin(ph + 2.5 * np.sin(ph * 1.51)) * (0.6 + 0.4 * rng.standard_normal(n).clip(-2, 2) / 2)
    s += 0.5 * fft_bp(rng.standard_normal(n), 1800, 6000) / 3; e = np.minimum(1, x / 0.03) * np.minimum(1, (dur - x) / 0.25)
    full = np.zeros(N); i = int(at * SR); m = min(n, N - i); full[i:i + m] = (s * e)[:m]; addst(np.tanh(full * 1.5) * g, pan)
screech(0.05, 1.5, 1300, 2200, 0.32, -0.3); screech(0.2, 1.4, 1700, 2600, 0.28, 0.3)
for at, pan in [(19.0, -0.4), (19.6, 0.3), (20.5, 0.1), (21.6, -0.2), (22.3, 0.5), (23.4, -0.5)]: screech(at, 1.2 + 0.3 * rng.random(), 1100 + 600 * rng.random(), 2000 + 700 * rng.random(), 0.22, pan)
# rewind whoosh 1.7-2.3 (reversed noise swell)
wh = fft_bp(rng.standard_normal(N), 400, 5000); addst(wh * env(1.55, 2.35, 0.55, 0.05) * 0.25)
# hit on freeze 0 and at 25.4
def boom(at, g=0.8, f=48):
    n = int(2.5 * SR); x = np.arange(n) / SR; s = np.sin(2 * np.pi * (f + 60 * np.exp(-x * 12)) * x) * np.exp(-x * 1.6)
    s += fft_lp(rng.standard_normal(n), 300) * np.exp(-x * 4) * 0.6; full = np.zeros(N); i = int(at * SR); m = min(n, N - i); full[i:i + m] = s[:m]; addst(full * g)
boom(1.45, 0.7); boom(25.4, 0.9, 40); boom(31.9, 0.5, 44)
# braam (brass-like low saw) at 25.4
n = int(3.5 * SR); x = np.arange(n) / SR; sa = sum(np.sin(2 * np.pi * 55 * k * x * (1 + 0.002 * np.sin(5 * x))) / k for k in range(1, 14)); sa = fft_lp(sa, 900) * np.minimum(1, x / 0.05) * np.exp(-x * 0.7)
full = np.zeros(N); i = int(25.4 * SR); full[i:i + n] = sa[:N - i]; addst(full * 0.18)
# growl 11.4-14.2 (dog)
gr = fft_lp(rng.standard_normal(N), 260) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 27 * t))); addst(gr / np.abs(gr).max() * env(11.3, 14.6, 0.3, 0.5) * 0.55, 0.15)
# heartbeat 14-25 speeding up, 26-32 fast
def thump(at, g):
    n = int(0.25 * SR); x = np.arange(n) / SR; s = np.sin(2 * np.pi * 52 * x) * np.exp(-x * 22); full = np.zeros(N); i = int(at * SR); m = min(n, N - i); full[i:i + m] = s[:m]; addst(full * g)
tt = 14.0
while tt < 31.5:
    rate = 1.0 if tt < 18 else (1.5 if tt < 25 else 2.0); thump(tt, 0.5); thump(tt + 0.22 / rate, 0.35); tt += 0.85 / rate
# clock ticks 25.6-31.8
for k, tk in enumerate(np.arange(25.8, 31.8, 0.5)):
    n = int(0.03 * SR); s = fft_bp(rng.standard_normal(n), 2500, 7000) * np.exp(-np.arange(n) / SR * 120); full = np.zeros(N); i = int(tk * SR); full[i:i + n] = s; addst(full * (0.5 if k % 2 == 0 else 0.35))
# footsteps 4.5-11 (walking), stop at 11.2
for k, tk in enumerate(np.arange(4.6, 11.2, 0.55)):
    n = int(0.08 * SR); s = fft_bp(rng.standard_normal(n), 120, 1500) * np.exp(-np.arange(n) / SR * 50) * (0.8 + 0.4 * rng.random()); full = np.zeros(N); i = int(tk * SR); full[i:i + n] = s; addst(full * 0.25, -0.2 if k % 2 else 0.2)
# end sting 32-38: low pulse
addst(np.sin(2 * np.pi * 41 * t) * env(32, 38, 0.5, 2.5) * 0.15)
# duck ambience under voice
V = json.load(open('words1.json')); duck = np.ones(N)
for w in V: duck[int((w['s'] - 0.15) * SR):int((w['e'] + 0.3) * SR)] = 0.5
k = int(0.12 * SR); duck = np.convolve(duck, np.ones(k) / k, mode='same')
st = np.stack([L * duck, R * duck], 1); st /= max(1e-9, np.abs(st).max()) / 0.7
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', 'sfx.wav'], input=st.astype(np.float32).tobytes(), check=True)
print('sfx ok')
