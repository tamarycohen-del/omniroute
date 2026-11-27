#!/usr/bin/env python3
"""Part 5 sound: drone, car, radio static, bridge water, porch light, her slow steps, Biscuit growl.
    python3 sfx4.py -> bed.wav, mix.wav. Times match web/ep5.html SHOTS."""
import os, wave, json
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
    at = R(at); i = int(at * SR); j = min(N, i + len(sig))
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


import sys; sys.path.insert(0, HERE)
import dogvoice as dv


def engine(dur, f0=38, f1=38, g=1.0, rough=0.25):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 + (f1 - f0) * x / dur
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.55 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph + 0.4) + 0.18 * np.sin(4 * ph)
    s = s * (1 + rough * np.sin(ph / 2)) + 0.12 * np.convolve(rng.standard_normal(n), np.ones(30) / 30, "same")
    return s * np.minimum(1, x / 0.3) * np.clip((dur - x) / 0.4, 0, 1) * g


def screech(dur=0.8):
    n = int(dur * SR); x = np.arange(n) / SR
    f = 2300 + 250 * np.sin(2 * np.pi * 7 * x); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * rng.random(n))
    return s * np.sin(np.pi * x / dur) ** 0.6 * 0.5


def motor(dur=1.6):
    n = int(dur * SR); x = np.arange(n) / SR; f = 520 + 60 * x / dur
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 31 * x)) * np.minimum(1, x / 0.05) * np.clip((dur - x) / 0.1, 0, 1) * 0.25


def bang():
    n = int(1.2 * SR); x = np.arange(n) / SR
    metal = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) for f, d in [(410, 6), (687, 8), (1130, 11), (1890, 15)]) * 0.35
    return thunk(48, 5)[:n] * 1.3 + metal + rng.standard_normal(n) * np.exp(-x * 30) * 0.6


def rattle(dur):
    n = int(dur * SR); x = np.arange(n) / SR
    return (np.convolve(rng.standard_normal(n), np.ones(8) / 8, "same") * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 17 * x + 3 * np.sin(2 * np.pi * 3 * x)))) + 0.6 * np.sin(2 * np.pi * 60 * x) * np.abs(np.sin(2 * np.pi * 8.5 * x))) * np.minimum(1, x / 0.05) * np.clip((dur - x) / 0.3, 0, 1)


def creak(dur, a=180, b=440):
    n = int(dur * SR); x = np.arange(n) / SR
    cr = np.sin(2 * np.pi * np.cumsum(a + (b - a) * x / dur) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 23 * x))) * np.minimum(1, x / 0.3) * np.clip((dur - x) / 0.5, 0, 1)
    return np.convolve(cr, np.ones(20) / 20, "same") * 0.4



def R(x): return x

def static(dur, g=1.0):
    n = int(dur * SR); x = np.arange(n) / SR
    s = rng.standard_normal(n) * (0.6 + 0.4 * (rng.random(n) > 0.97)); s = s - np.convolve(s, np.ones(12) / 12, "same")
    return s * np.minimum(1, x / 0.05) * np.clip((dur - x) / 0.1, 0, 1) * 0.35 * g

def water(dur):
    n = int(dur * SR); x = np.arange(n) / SR
    s = np.convolve(rng.standard_normal(n), np.ones(220) / 220, "same") * 6 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * x))
    return s * np.minimum(1, x / 1.0) * np.clip((dur - x) / 1.0, 0, 1)

def crickets(dur):
    n = int(dur * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 28 * x) > 0.6) * (np.sin(2 * np.pi * 0.9 * x) > 0) * 0.05 * np.minimum(1, x / 1.0)

# --- drone (swells toward the end), almost gone in the mirror beat ---
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)) * 0.10
shape = np.minimum(1, t / 1.0) * (1 + 0.6 * np.clip((t - 62) / 12, 0, 1)) * np.where((t > 28.6) & (t < 32.5), 0.4, 1.0) * np.where(t > DUR - 1.0, np.clip((DUR - t) / 1.0, 0, 1), 1.0)
bed += drone * shape * 0.35
# --- events (seconds = ep5.html SHOTS) ---
place(engine(19.3, 44, 56, 0.28, 0.35), 0.0); place(rattle(3.0), 0.0, 0.25)                          # racing, her hand on the trunk
place(sting([98, 103.8, 146.8, 207.7], 3.0, 1.0), 3.4, 0.45)                                        # the scariest thing...
for i in range(4): place(tick(1500, 120), 7.55 + i * 0.55, 0.35)                                     # comment pops
place(screech(0.8), 17.3, 0.5)                                                                      # she hits the gas
for i in range(4): place(tick(700, 80) * 2, 19.6 + i * 0.45, 0.3)                                   # fingers slipping, one by one
place(engine(7.0, 52, 40, 0.25), 19.3)
place(engine(9.0, 34, 34, 0.25), 26.0)                                                              # quieter cruise
place(tick(900, 90) * 3, 26.35, 0.5); place(static(6.3, 1.0), 26.35, 0.55)                          # radio clicks on, static
place(sting([220, 233, 311], 2.5, 1.3), 29.0, 0.3)                                                  # Mom on the radio
place(tick(600, 70) * 3, 33.2, 0.55)                                                                # click off
place(engine(9.3, 30, 30, 0.2), 35.0)
for hb in np.arange(40.8, 44.3, 0.55): place(heartbeat(), hb, 0.6)                                  # mirror
place(sting([110, 116.5, 155.6, 233], 3.0, 0.9), 43.1, 0.65); place(whoosh(0.5), 42.9, 0.3)         # she wasn't in it
place(engine(1.8, 34, 22, 0.4), 44.3); place(thunk(45, 7), 45.9, 0.3)                               # stops at the bridge
place(water(38.0), 44.3, 0.5); bed[int(44.3 * SR):] += crickets(DUR - 44.3)[: N - int(44.3 * SR)]
for tb in [59.25, 60.27, 61.2]: place(tick(1200, 120) * 2, tb, 0.45); place(tick(1100, 120) * 2, tb + 0.32, 0.3)   # porch light blinks
place(sting([220, 277, 330, 440], 3.2, 0.9), 62.35, 0.25)                                            # that's Mom
k = 68.9
while k < 74.3: place(thunk(48, 9), k, 0.45); k += 1.05                                            # slow, heavy steps
place(sting([98, 103.8, 146.8], 3.0, 0.8), 70.8, 0.45)
place(sting([220, 277, 330], 3.0, 1.2), 74.3, 0.3)                                                 # choice
for c in [3.4, 7.4, 12.15, 17.3, 19.25, 22.0, 26.1, 32.7, 35.0, 37.3, 40.7, 44.3, 46.5, 53.0, 57.5, 62.35, 65.85, 68.8, 74.3]: place(whoosh(0.4), c - 0.2, 0.1)

bed *= 0.3 / max(1e-9, np.abs(bed).max())
dog = np.zeros(N)
def dplace(sig, at, gain):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: dog[i:j] += sig[: j - i] * gain
dplace(dv.growl(2.6, seed=4, room=0.2), 29.4, 0.4)                                                  # Biscuit growls at the radio
dplace(dv.growl(1.4, seed=6, room=0.2), 66.0, 0.22)                                                 # uneasy on the bridge
save(os.path.join(HERE, "bed.wav"), bed + dog)
music = load_wav(os.path.join(HERE, "music.wav"))[:N]; music = np.pad(music, (0, N - len(music)))
venv = np.sqrt(np.convolve(voice ** 2, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")); duck = 1 - 0.45 * np.clip(venv / 0.08, 0, 1)
music = music * duck * 0.2
save(os.path.join(HERE, "bed.wav"), bed + dog + music)
mix = voice + bed + dog + music
mix *= 0.95 / np.abs(mix).max()
save(os.path.join(HERE, "mix.wav"), mix)
print("mix", round(DUR, 2), "s")
