#!/usr/bin/env python3
"""Synth sound bed for Part 1 (drone + SFX), then mix with voice.wav.

    python3 sfx.py  -> bed.wav (drone + SFX), mix.wav (voice + bed, bed about half the voice level)

Times match ep1.html (SHOTS / KNOCKS) and words.json.
"""
import os, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)



def load_wav(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32767
    return x


def save(p, x):
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


voice = load_wav(os.path.join(HERE, "voice.wav"))
N = len(voice); DUR = N / SR
t = np.arange(N) / SR
bed = np.zeros(N)


def place(sig, at, gain=1.0):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: bed[i:j] += sig[: j - i] * gain


def env(n, a=0.005, d=10.0):
    x = np.arange(n) / SR
    return np.minimum(1, x / a) * np.exp(-x * d)


def knock(g=1.0):
    n = int(0.22 * SR); x = np.arange(n) / SR
    s = np.sin(2 * np.pi * 92 * x) * 0.9 + np.sin(2 * np.pi * 180 * x) * 0.3 + rng.standard_normal(n) * 0.3
    return s * np.exp(-x * 30) * g


def buzz():
    n = int(0.45 * SR); x = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * 150 * x)) * 0.4 * (np.sin(2 * np.pi * 9 * x) > -0.2)
    return np.convolve(s, np.ones(40) / 40, "same") * np.minimum(1, (0.45 - x) / 0.05)


def tick(f=2600, d=220):
    n = int(0.03 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * f * x) * np.exp(-x * d)


def thunk(f=60, d=6):
    n = int(1.2 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) + 0.4 * rng.standard_normal(n) * np.exp(-x * 40)) * env(n, 0.003, d)


def sting(fs, dur=2.5, d=1.4):
    n = int(dur * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * x) for f in fs) / len(fs) * np.exp(-x * d) * np.minimum(1, x / 0.02)


def whoosh(dur=0.5):
    n = int(dur * SR); x = np.arange(n) / SR
    s = np.convolve(rng.standard_normal(n), np.ones(60) / 60, "same")
    return s * np.sin(np.pi * x / dur) ** 2 * 1.5


def heartbeat():
    n = int(0.5 * SR); x = np.arange(n) / SR
    one = np.sin(2 * np.pi * 50 * x) * np.exp(-x * 25)
    out = one.copy(); k = int(0.16 * SR); out[k:] += one[: n - k] * 0.7
    return out


def whimper():
    n = int(0.7 * SR); x = np.arange(n) / SR
    f = 900 - 300 * x / 0.7 + 25 * np.sin(2 * np.pi * 11 * x)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / 0.7) ** 2 * 0.35


# --- drone: low and steady, dips to near-silence on "Don't breathe", swells at the end ---
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)) * 0.10
shape = np.minimum(1, t / 1.0) * (1 + 0.6 * np.clip((t - 71.0) / 6, 0, 1))
shape *= np.where((t > 32.8) & (t < 34.1), 0.08, 1.0)
shape *= np.where((t > 38.4) & (t < 46.5), 0.55, 1.0)
shape *= np.where(t > DUR - 1.0, np.clip((DUR - t) / 1.0, 0, 1), 1.0)
bed += drone * shape
pad = np.sin(2 * np.pi * 659 * t + 0.6 * np.sin(2 * np.pi * 0.3 * t)) * 0.012 * np.clip((t - 16) / 3, 0, 1)
bed += pad * np.where((t > 32.8) & (t < 34.1), 0, 1)
# --- events ---
place(sting([330, 349, 466], 1.6, 2.2), 0.7, 0.35)                        # the eyes blink
for k in np.arange(1.9, 4.1, 0.27): place(tick(300, 60) * 2, k, 0.18)      # running steps (ours)
for i in range(4): place(tick(1500, 120), 4.25 + i * 0.55, 0.35)           # comment pops
for k in np.arange(7.9, 14.0, 0.26): place(tick(300, 60) * 2, k, 0.16)     # our steps
for k in np.arange(9.0, 14.0, 0.62): place(thunk(55, 9), k, 0.28)          # heavy steps behind
place(sting([110, 116.5, 155.6, 233], 3.0, 1.0), 16.1, 0.5)                # she looked exactly like Mom...
n = int(5.0 * SR); x = np.arange(n) / SR                                  # arms stretching: rising creak
cr = np.sin(2 * np.pi * np.cumsum(180 + 260 * x / 5.0) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 23 * x))) * np.minimum(1, x / 0.3) * np.clip((5.0 - x) / 0.5, 0, 1)
place(np.convolve(cr, np.ones(20) / 20, "same") * 0.4, 21.1, 0.5)
place(thunk(60, 6), 26.5, 0.55)                                           # dive under the trunk
hb = 28.9
while hb < 32.7: place(heartbeat(), hb, 0.6); hb += 0.6
for k in [34.85, 35.5]: place(thunk(50, 9), k, 0.45)                        # footsteps stop
for k in np.arange(39.0, 46.3, 0.42): place(tick(1100, 160), k, 0.16)      # fingers tapping on the bark
for k in [47.2, 48.5, 49.4]: place(thunk(50, 9), k, 0.5)                    # one step closer, then another
n = int(1.4 * SR); x = np.arange(n) / SR                                  # rustle
place(np.convolve(rng.standard_normal(n), np.ones(12) / 12, "same") * np.sin(np.pi * x / 1.4) ** 2 * 0.9, 52.4, 0.35)
for k in np.arange(53.6, 56.0, 0.6): place(thunk(50, 9), k, 0.22)           # she walks away
n = int(5.0 * SR); x = np.arange(n) / SR                                  # car engine in the distance
place(((np.sin(2 * np.pi * 42 * x) + 0.4 * np.sin(2 * np.pi * 84 * x)) * np.minimum(1, x / 0.8) * np.clip((5.0 - x) / 1.0, 0, 1)) * 0.25, 61.7, 0.6)
place(sting([220, 233, 311, 466], 2.6, 1.3), 75.4, 0.5)                    # turned back toward us
place(sting([220, 277, 330], 3.0, 1.2), 76.9, 0.25)                        # choice
for c in [1.9, 4.1, 7.85, 16.0, 26.2, 34.1, 50.4, 56.4, 61.6, 71.0]: place(whoosh(0.4), c - 0.2, 0.12)

bed *= 0.5 / max(1e-9, np.abs(bed).max())  # about half the voice peak
save(os.path.join(HERE, "bed.wav"), bed)
mix = voice + bed
mix *= 0.95 / np.abs(mix).max()
save(os.path.join(HERE, "mix.wav"), mix)
print("mix", round(DUR, 2), "s")
