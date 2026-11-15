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


# --- drone, swell toward the click, quiet hold before the choice ---
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)) * 0.10
shape = np.minimum(1, t / 1.5) * (1 + 0.5 * np.clip((t - 54.4) / 18, 0, 1))
shape *= np.where((t > 74.2) & (t < 74.9), 0.1, 1.0)
shape *= np.where((t > 68.5) & (t < 72.1), 0.35, 1.0)  # warm flashback
shape *= np.where(t > DUR - 1.0, np.clip((DUR - t) / 1.0, 0, 1), 1.0)
bed += drone * shape
# --- events ---
knocks = [1.05, 1.35, 1.65]; k, d = 55.0, 0.6
while k < 62.3: knocks.append(k); k += d; d = max(0.16, d * 0.86)
for i, k in enumerate(knocks): place(knock(), k, 0.6 if i < 3 else min(1.0, 0.7 + 0.03 * i))
for i in range(4): place(tick(1500, 120), 6.5 + i * 1.0, 0.35)          # comment pops
place(thunk(70, 8), 11.9, 0.45); place(sting([330, 415, 494], 1.2, 3), 11.9, 0.2)  # check mark
place(tick(700, 40) * 2, 17.45, 0.5)                                     # lock click
hb = 21.7
while hb < 24.2: place(heartbeat(), hb, 0.6); hb += 0.55
place(sting([220, 262, 330], 2.5, 1.2), 29.3, 0.25)                      # died three years ago
place(whimper() * 0, 0, 0)
n = int(1.2 * SR); x = np.arange(n) / SR                                  # growl
gr = (np.sign(np.sin(2 * np.pi * 70 * x)) * 0.5 + rng.standard_normal(n) * 0.3) * np.sin(np.pi * x / 1.2) ** 2
place(np.convolve(gr, np.ones(30) / 30, "same"), 53.1, 0.45)
place(tick(600, 30) * 3, 74.2, 0.7); place(thunk(45, 3), 74.25, 0.5)       # CLICK + the door
place(sting([110, 116.5, 155.6, 233], 3.0, 1.0), 74.3, 0.45)
place(sting([220, 277, 330], 3.0, 1.2), 76.4, 0.25)                      # choice
for c in [6.2, 13.2, 21.7, 24.3, 37.4, 49.6, 54.4, 72.1]: place(whoosh(0.4), c - 0.2, 0.12)

bed *= 0.5 / max(1e-9, np.abs(bed).max())  # about half the voice peak
save(os.path.join(HERE, "bed.wav"), bed)
mix = voice + bed
mix *= 0.95 / np.abs(mix).max()
save(os.path.join(HERE, "mix.wav"), mix)
print("mix", round(DUR, 2), "s")
