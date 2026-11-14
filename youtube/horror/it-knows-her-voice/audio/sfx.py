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


# --- drone (two detuned lows), swells at the climax, drops out right after it ---
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)) * 0.10
shape = np.minimum(1, t / 1.5) * (1 + 0.5 * np.clip((t - 48.3) / 8.6, 0, 1))
shape *= np.where((t > 57.97) & (t < 58.7), 0.1, 1.0)
shape *= np.where(t > 75.0, np.clip((76.0 - t) / 1.0, 0, 1), 1.0)
bed += drone * shape
# high eerie pad from the voice onward
pad = np.sin(2 * np.pi * 659 * t + 0.6 * np.sin(2 * np.pi * 0.3 * t)) * 0.012 * np.clip((t - 19.7) / 3, 0, 1)
bed += pad * np.where((t > 57.97) & (t < 58.7), 0, 1)

# --- events ---
for k in [2.15, 2.45, 2.75]: place(knock(), k, 0.85)
for k in [18.30, 18.62, 18.94]: place(knock(), k, 1.0)
place(buzz(), 9.9, 0.5); place(buzz(), 41.65, 0.55)
place(whoosh(0.35), 38.25, 0.25)  # message sent
for i, k in enumerate(np.arange(36.75, 38.1, 0.11)): place(tick(1800 + 300 * (i % 3), 300), k, 0.12)  # typing
place(thunk(48, 4), 12.75, 0.6)  # power out
for k in [12.7 + 1.6, 12.7 + 2.2, 12.7 + 2.75, 12.7 + 3.3]: place(thunk(120, 14), k, 0.18)  # street lights
place(whimper(), 29.45, 0.6)
hb = 48.6
while hb < 57.9:
    place(heartbeat(), hb, 0.55); hb += 0.9 - 0.45 * (hb - 48.6) / 9.3
place(sting([110, 116.5, 155.6, 233], 3.0, 1.0), 56.97, 0.55)
place(thunk(40, 2.5), 56.97, 0.5)
place(tick(880, 6) * 2, 63.05, 0.25)  # phone dies
for k in np.arange(63.5, 65.4, 0.17): place(tick(500, 90), k, 0.12)  # paws
place(sting([220, 277, 330], 3.0, 1.2), 67.45, 0.25)
for c in [7.0, 12.7, 17.4, 26.0, 33.2, 44.45, 48.3, 63.4]: place(whoosh(0.4), c - 0.2, 0.12)

bed *= 0.5 / max(1e-9, np.abs(bed).max())  # about half the voice peak
save(os.path.join(HERE, "bed.wav"), bed)
mix = voice + bed
mix *= 0.95 / np.abs(mix).max()
save(os.path.join(HERE, "mix.wav"), mix)
print("mix", round(DUR, 2), "s")
