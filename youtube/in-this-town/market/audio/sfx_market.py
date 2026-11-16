#!/usr/bin/env python3
"""Music + SFX for "The New Guy" (supermarket short). All synthesized, no voices.

    python3 sfx_market.py out.wav
Timeline matches web/market.html SHOTS (39.4 s).
"""
import sys, wave
import numpy as np

SR = 48000
DUR = 39.4
N = int(DUR * SR)
rng = np.random.default_rng(7)
mus = np.zeros(N)
fx = np.zeros(N)


def t_(d):
    return np.arange(int(d * SR)) / SR


def put(buf, at, x, g=1.0):
    i = int(at * SR)
    if i >= N: return
    x = x[: N - i]
    buf[i:i + len(x)] += x * g


def env(d, a=0.005, r=None):
    t = t_(d); e = np.minimum(1, t / max(a, 1e-4))
    if r: e *= np.exp(-t / r)
    return e


def note(f, d, kind="sine", r=0.25, a=0.004):
    t = t_(d)
    if kind == "sine": w = np.sin(2 * np.pi * f * t)
    elif kind == "tri": w = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * t))
    elif kind == "sq": w = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + 0.5 * np.sin(2 * np.pi * f * t)
    elif kind == "saw": w = 2 * ((f * t) % 1) - 1
    elif kind == "marimba": w = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.03)
    return w * env(d, a, r)


def noise(d): return rng.standard_normal(int(d * SR))


def lp(x, k):  # one-pole lowpass, k in (0,1]
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += k * (v - s); y[i] = s
    return y


def hz(n): return 440 * 2 ** ((n - 69) / 12)


# ---------- music ----------
def comedy(t0, t1, gain=1.0):
    beat = 0.5; prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]
    mel = [72, None, 74, 76, None, 79, 76, None, 74, 72, None, 69, 71, None, 72, None]
    t = t0; k = 0
    while t < t1 - 0.05:
        bar = int(k / 4) % 4; root, ch = prog[bar]
        put(mus, t, note(hz(root - 12 + (7 if k % 2 else 0)), 0.42, "tri", 0.18), 0.55 * gain)          # bouncy bass (root/fifth)
        if k % 2 == 1:
            for n in ch: put(mus, t, note(hz(n), 0.25, "tri", 0.07), 0.13 * gain)                    # pizz chords on the off-beat
        if k % 2 == 0: put(mus, t, lp(noise(0.12), 0.25) * env(0.12, 0.001, 0.03) + note(55, 0.12, "sine", 0.05), 0.35 * gain)  # soft kick
        put(mus, t + beat / 2, lp(noise(0.05), 0.9) * env(0.05, 0.001, 0.012), 0.06 * gain)          # hat
        m = mel[k % len(mel)]
        if m: put(mus, t, note(hz(m), 0.3, "marimba", 0.16), 0.22 * gain)
        t += beat; k += 1


def boss_theme(t0, t1):
    t = t0
    for n in [45, 45, 41, 43]:
        if t >= t1: break
        d = min(1.0, t1 - t)
        put(mus, t, note(hz(n - 12), d, "saw", 0.6, 0.02) * 0.5 + note(hz(n - 12), d, "sine", 0.8, 0.02), 0.32)
        for c in [n + 12, n + 15, n + 19]: put(mus, t, note(hz(c), d, "tri", 0.7, 0.08), 0.08)
        put(mus, t, lp(noise(0.25), 0.35) * env(0.25, 0.001, 0.06) + note(50, 0.25, "sine", 0.1), 0.6)   # big kick
        t += 1.0
    tt = t_(t1 - t0); put(mus, t0, np.sin(2 * np.pi * 1760 * tt) * 0.5 * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * tt)) * np.minimum(1, tt / 1.0) * np.exp(-tt / 3), 0.03)  # shimmer


comedy(0.0, 20.4)
boss_theme(20.4, 24.4)
comedy(24.4, 28.6, 0.8)
comedy(36.6, 39.0, 1.0)
for n in [60, 64, 67, 72]: put(mus, 39.0, note(hz(n), 0.4, "tri", 0.25), 0.18)

# ---------- sfx ----------
def whoosh(at, d=0.45, g=0.5, up=True):
    x = noise(d); k = np.linspace(0.05, 0.5, len(x)) if up else np.linspace(0.5, 0.05, len(x)); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += k[i] * (v - s); y[i] = s
    put(fx, at, y * np.sin(np.linspace(0, np.pi, len(x))), g)


def step(at, g=0.35, heavy=False):
    d = 0.09 if not heavy else 0.16; put(fx, at, lp(noise(d), 0.3 if heavy else 0.5) * env(d, 0.001, d / 4) + note(90 if heavy else 140, d, "sine", d / 3), g)


def thump(at, g=0.8): put(fx, at, note(70, 0.3, "sine", 0.09) + lp(noise(0.3), 0.15) * env(0.3, 0.001, 0.05), g)


def splat(at, g=1.0):
    d = 0.5; x = lp(noise(d), 0.35) * env(d, 0.001, 0.12); t = t_(d); x += np.sin(2 * np.pi * (300 - 380 * t) * t) * np.exp(-t / 0.08) * 0.6
    put(fx, at, x, g)


def clink(at, g=0.25):
    f = rng.uniform(1800, 3800); put(fx, at, note(f, 0.25, "sine", 0.05) + 0.5 * note(f * 2.7, 0.25, "sine", 0.03), g)


def ding(at, f=1568, g=0.3): put(fx, at, note(f, 0.9, "sine", 0.35) + 0.4 * note(f * 2, 0.9, "sine", 0.2), g)


def sparkle(at, d=0.8, g=0.18):
    for k in range(10): put(fx, at + k * d / 10, note(rng.uniform(2500, 5000), 0.2, "sine", 0.05), g)


def chirp(at, g=0.12):
    t = t_(0.12); put(fx, at, np.sin(2 * np.pi * (2400 + 1800 * np.sin(2 * np.pi * 18 * t)) * t) * env(0.12, 0.005, 0.05), g)


def scratch(at, g=0.5):
    d = 0.35; t = t_(d); f = 600 * (1 + np.sin(2 * np.pi * 3 * t)); x = lp(noise(d), 0.6) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)))
    put(fx, at, x * env(d, 0.002, 0.15), g)


def stinger(at, g=0.6):  # "dun dun DUNNN"
    for k, (n, d) in enumerate([(50, 0.28), (50, 0.28), (46, 1.3)]):
        tt = at + k * 0.32
        for c in [n - 12, n, n + 3, n + 7]: put(fx, tt, note(hz(c), d, "saw", d * 0.7, 0.01), g * 0.18)
        put(fx, tt, lp(noise(0.3), 0.3) * env(0.3, 0.001, 0.08), g * 0.5)


def sad_trombone(at, g=0.35):
    for k, n in enumerate([55, 54, 53]):
        tt = t_(0.5); put(fx, at + k * 0.55, lp(note(hz(n) * (1 + 0.012 * np.sin(2 * np.pi * 5 * tt)), 0.5, "saw", 0.6, 0.03), 0.2), g)
    tt = t_(1.4); f = hz(52) * (1 + 0.03 * np.sin(2 * np.pi * 6 * tt)); put(fx, at + 1.65, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(1.4, 0.03, 0.9), 0.15), g)


def slap(at, g=0.9): put(fx, at, lp(noise(0.12), 0.8) * env(0.12, 0.0005, 0.02) + note(220, 0.12, "sine", 0.03), g)


# 1 arrive
whoosh(0.15, 0.8, 0.35)
for k in range(8): step(0.6 + k * 0.314, 0.3)
sparkle(2.9, 0.7)
# 2 manager
whoosh(3.6, 0.6, 0.25, up=False)
for k in range(6): whoosh(5.0 + k * 0.18, 0.12, 0.08)
ding(6.62, 1318, 0.25)
for k in range(5): step(7.1 + k * 0.26, 0.28)
# 3 melon
thump(8.32, 0.6)
whoosh(8.95, 0.3, 0.25)
whoosh(9.36, 0.5, 0.35)
splat(9.93, 1.0)
for k in range(4): put(fx, 9.98 + k * 0.07, lp(noise(0.06), 0.4) * env(0.06, 0.001, 0.015), 0.4)
stinger(10.6, 0.25)
# 4 cans
put(fx, 13.35, lp(noise(0.35), 0.7) * env(0.35, 0.01, 0.15) * 0.5, 0.4)
for k in range(28): clink(13.75 + rng.uniform(0, 1.3), 0.22)
thump(13.8, 0.5); thump(14.2, 0.9)
for k in range(10): chirp(14.4 + k * 0.2)
# 5 eggs
whoosh(16.8, 0.5, 0.3)
thump(17.55, 0.9)
for k in range(5): put(fx, 17.56 + k * 0.03, note(rng.uniform(900, 1500), 0.08, "sine", 0.02), 0.25)
splat(17.92, 0.6)
stinger(18.1, 0.18)
for k in range(6): step(18.75 + k * 0.224, 0.45, heavy=True)
# 6 boss
whoosh(20.4, 1.0, 0.35)
for k in range(5): step(21.0 + k * 0.7, 0.5, heavy=True)
sparkle(22.35, 0.4, 0.3); ding(22.45, 2093, 0.3)
for k in range(5): step(21.9 + k * 0.17, 0.3)
whoosh(22.85, 0.4, 0.3, up=False)
# 7 brag
scratch(27.3, 0.55)
put(fx, 27.5, lp(noise(0.3), 0.8) * env(0.3, 0.005, 0.1), 0.15)
# 8 reveal
for k in range(4): step(28.7 + k * 0.314, 0.4, heavy=True)
whoosh(29.9, 0.4, 0.3, up=False)
sparkle(30.6, 0.9, 0.25); ding(30.95, 1568, 0.35)
stinger(31.35, 0.75)
# 9 fired
sad_trombone(32.9, 0.4)
for k in range(8): step(33.6 + k * 0.45, 0.3)
# 10 end
whoosh(36.75, 0.3, 0.3); slap(37.05, 1.0); sparkle(37.05, 0.5, 0.25)
ding(38.0, 2637, 0.3)

mix = mus * 0.55 + fx * 1.0
mix = mix / np.abs(mix).max() * 0.9
st = np.stack([mix, mix], 1)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "market_mix.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", DUR)
