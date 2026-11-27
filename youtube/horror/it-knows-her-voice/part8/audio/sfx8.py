#!/usr/bin/env python3
"""Part 8 sound (finale): run, the standoff, the copied fight, the splash, the mirror, glass cracks, then a warm kitchen and sunrise birds. Ambience ducks under the voice (audio-design skill).
    python3 sfx8.py -> bed.wav, mix.wav. Times match web/ep8.html SHOTS."""
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

def bone(g=1.0):  # a dry crack
    n = int(0.09 * SR); x = np.arange(n) / SR
    return (rng.standard_normal(n) * np.exp(-x * 70) + np.sin(2 * np.pi * 180 * x) * np.exp(-x * 50) * 0.6) * g
def skitter(dur):  # fast bony clicks on the road
    out = np.zeros(int(dur * SR)); k = 0.0
    while k < dur - 0.05:
        c = tick(1700 + 600 * rng.random(), 160) * (0.6 + 0.4 * rng.random()); i = int(k * SR); out[i:i + len(c)] += c[: len(out) - i]; k += 0.06 + 0.05 * rng.random()
    return out
def paws(dur):
    out = np.zeros(int(dur * SR)); k = 0.0
    while k < dur - 0.05:
        c = thunk(140, 30)[: int(0.08 * SR)] * 0.5; i = int(k * SR); out[i:i + len(c)] += c[: len(out) - i]; k += 0.11
    return out
def snap(g=1.0):  # wood splitting
    n = int(0.5 * SR); x = np.arange(n) / SR
    return (np.convolve(rng.standard_normal(n), np.ones(4) / 4, "same") * np.exp(-x * 14) + sum(np.sin(2 * np.pi * f * x) * np.exp(-x * 18) for f in (230, 410, 640)) * 0.3) * g
def clap():
    n = int(0.12 * SR); x = np.arange(n) / SR; z = rng.standard_normal(n)
    z = z - np.convolve(z, np.ones(6) / 6, "same"); return z * np.exp(-x * 45) * 1.2
def whistle(f0=1700, f1=2500, dur=0.45):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 + (f1 - f0) * np.sin(np.pi * x / dur * 0.5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / dur) ** 0.7 * 0.5 + rng.standard_normal(n) * 0.02
def splash():
    n = int(1.2 * SR); x = np.arange(n) / SR; z = np.convolve(rng.standard_normal(n), np.ones(30) / 30, "same") * 5
    return z * np.exp(-x * 3.5) * np.minimum(1, x / 0.01)
def switch():
    n = int(0.05 * SR); x = np.arange(n) / SR; return (np.sin(2 * np.pi * 3100 * x) * 0.6 + rng.standard_normal(n) * 0.4) * np.exp(-x * 140)
def glass(g=1.0):  # a glassy crack: bright noise + high ringing partials, a little different every time
    n = int(0.4 * SR); x = np.arange(n) / SR; f0 = 2400 + 900 * rng.random()
    z = rng.standard_normal(n); z = z - np.convolve(z, np.ones(5) / 5, "same")
    return (z * np.exp(-x * 30) + sum(np.sin(2 * np.pi * f0 * r * x) * np.exp(-x * (8 + 4 * r)) for r in (1, 1.53, 2.31)) * 0.25) * g
def chirp():
    n = int(0.18 * SR); x = np.arange(n) / SR; f = 3200 + 1400 * np.sin(np.pi * x / 0.18) + 300 * rng.random()
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / 0.18) * 0.25
def step(g=1.0):  # varied footstep (audio-design: +/-1 semitone, +/-2 dB)
    p = 2 ** (rng.uniform(-1, 1) / 12); v = 10 ** (rng.uniform(-2, 2) / 20); return thunk(95 * p, 22)[: int(0.12 * SR)] * 0.6 * v * g
# --- ambience, ducked under the voice ---
venv0 = np.sqrt(np.convolve(voice ** 2, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")); amb_duck = 1 - 0.4 * np.clip(venv0 / 0.08, 0, 1)
silent = np.where(((t > 19.21) & (t < 19.91)) | ((t > 53.9) & (t < 55.4)), 0.03, 1.0)
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)) * 0.10
bed += drone * np.minimum(1, t / 1.0) * np.where(t > 54, 0.0, 1.0) * 0.35 * silent * amb_duck
amb = water(DUR) * np.where(t > 41.2, 0.0, 0.45) + crickets(DUR) * np.where(t < 41.2, 0.8, 0.0)
bed += amb[:N] * amb_duck * silent
for at in np.arange(70.0, 81.0, 0.9): place(chirp(), at + 0.3 * rng.random(), 0.35); place(chirp(), at + 0.15, 0.25)   # sunrise birds
# --- events (seconds = ep8.html SHOTS) ---
k = 0.1
while k < 4.0: place(step(), k, 0.5); k += 0.22                                                       # running
for at in [0.6, 1.5, 2.4, 3.3]: place(thunk(45, 7), at, 0.35)                                       # its heavy steps
for at in [6.5, 7.8, 8.4, 9.0]: place(tick(1500 + 200 * rng.random(), 120), at, 0.35)              # comment pops
place(sting([784, 988, 1175], 0.8, 4.0), 9.8, 0.25)                                                  # THE PLAN
k = 13.95
while k < 17.6: place(step(), k, 0.55); k += 0.21
place(sting([92, 97.5, 138], 2.0, 1.2), 17.7, 0.35)                                                  # "Honey..."
place(sting([110, 116.5, 155.6], 3.5, 0.8), 19.91, 0.5)
for hb in np.arange(21.0, 25.2, 0.55): place(heartbeat(), hb, 0.55)
place(screech(0.8), 25.3, 0.45)                                                                      # she leaps
for i, at in enumerate(np.arange(26.8, 31.1, 0.75)): place(whoosh(0.35), at, 0.4); place(whoosh(0.35), at + 0.06, 0.3); place(bone(0.5), at + 0.1, 0.3)   # every move, copied
place(splash(), 32.3, 0.9); place(splash(), 32.5, 0.5)                                               # into the water
place(sting([98, 103.8, 146.8], 2.5, 1.0), 36.0, 0.3)
for at in np.arange(41.3, 42.4, 0.24): place(step(0.8), at, 0.5)                                     # running inside
place(creak(0.6, 300, 500), 42.4, 0.4)                                                               # mirror off the hook
place(creak(1.2, 120, 90), 45.9, 0.6)                                                                # it ducks through the door
place(sting([1760, 2093, 2637], 2.2, 1.5), 48.4, 0.25)                                               # it sees itself
for at in sorted(49.7 + 3.0 * rng.random(9)): place(glass(0.7), at, 0.5)                             # cracking
place(glass(1.0), 52.7, 0.9); place(glass(0.9), 52.75, 0.7); place(whoosh(1.2), 53.2, 0.25)          # shatter to dust
place(switch(), 56.0, 0.7)                                                                           # the kitchen light
place(tick(2600, 60), 58.4, 0.3)                                                                     # mug clink
for at in np.arange(65.9, 68.4, 0.18): place(thunk(140, 30)[: int(0.06 * SR)], at, 0.25)              # tail thumping the floor
place(thunk(60, 10), 68.5, 0.5); place(whimper(), 68.8, 0.3)                                         # he falls over
place(sting([523, 659, 784, 1047], 3.0, 0.8), 77.75, 0.25)                                           # the end
for c in [3.95, 6.4, 12.85, 13.9, 17.7, 19.91, 25.2, 26.7, 31.2, 35.9, 41.15, 45.85, 48.4, 57.5, 61.8, 65.75, 69.65, 77.75]: place(whoosh(0.4), c - 0.2, 0.08)

bed *= 0.3 / max(1e-9, np.abs(bed).max())
dog = np.zeros(N)
def dplace(sig, at, gain):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: dog[i:j] += sig[: j - i] * gain
dplace(dv.growl(1.8, seed=4, room=0.15), 43.7, 0.45)   # Biscuit stands in front of me and growls
save(os.path.join(HERE, "bed.wav"), bed + dog)
music = load_wav(os.path.join(HERE, "music.wav"))[:N]; music = np.pad(music, (0, N - len(music)))
venv = np.sqrt(np.convolve(voice ** 2, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")); duck = 1 - 0.45 * np.clip(venv / 0.08, 0, 1)
music = music * duck * 0.2
save(os.path.join(HERE, "bed.wav"), bed + dog + music)
mix = voice + bed + dog + music
mix *= 0.95 / np.abs(mix).max()
save(os.path.join(HERE, "mix.wav"), mix)
print("mix", round(DUR, 2), "s")
