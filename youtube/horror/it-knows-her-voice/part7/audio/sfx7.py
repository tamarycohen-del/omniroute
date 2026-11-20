#!/usr/bin/env python3
"""Part 7 sound: water, cracking boards, claps + whistle, Biscuit's run, the board breaking, splash, scream, porch-light switch clicks.
    python3 sfx7.py -> bed.wav, mix.wav. Times match web/ep7.html SHOTS."""
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
# --- drone, gone in the silence before the porch ---
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)) * 0.10
shape = np.minimum(1, t / 1.0) * (1 + 0.6 * np.clip((t - 68.6) / 9, 0, 1)) * np.where((t > 44.45) & (t < 45.1), 0.05, 1.0) * np.where(t > DUR - 1.0, np.clip((DUR - t) / 1.0, 0, 1), 1.0)
bed += drone * shape * 0.35
wat = water(DUR) * np.where(t > 46.8, 0.35, 1.0); place(wat, 0.0, 0.45)
bed += crickets(DUR) * np.where((t > 46.8) & (t < 77.7), 0.6, 0.0)
# --- events (seconds = ep7.html SHOTS) ---
place(creak(3.0, 140, 90), 0.2, 0.7); place(snap(0.5), 2.6, 0.4)                                   # boards under Biscuit
place(sting([98, 103.8, 146.8], 2.5, 1.1), 4.8, 0.4)                                                # something waves...
for i in range(4): place(tick(1500, 120), 9.4 + i * 0.6, 0.35)                                     # comment pops
place(tick(900, 100), 13.5, 0.3)                                                                    # ear twitch
place(sting([92, 97.5, 138], 2.5, 1.0), 17.9, 0.3)                                                  # the copy
place(creak(2.6, 160, 110), 23.0, 0.7); place(snap(0.8), 25.6, 0.6)                                # board splits
place(clap(), 29.9, 0.9); place(clap(), 30.2, 0.9); place(whistle(), 31.4, 0.55); place(whistle(1900, 2700, 0.35), 31.9, 0.5)
place(paws(2.6), 34.0, 0.6)
for at in [34.6, 35.3, 36.0]: place(snap(0.7), at, 0.55)                                           # boards breaking behind him
place(snap(1.0), 37.5, 0.85); place(splash(), 38.3, 0.5); place(thunk(70, 10), 39.9, 0.5)          # last board, splash, caught
place(screech(1.6), 40.7, 0.55); place(screech(1.2), 41.6, 0.4)                                    # she screams
for tb in [47.9, 49.3, 50.3]: place(switch(), tb, 0.6); place(switch(), tb + 0.35, 0.5)          # porch light blinks
place(sting([110, 116.5, 155.6, 233], 3.0, 0.9), 55.75, 0.55); place(thunk(45, 6), 55.75, 0.5)   # something tall was
for k in np.arange(58.9, 61.7, 0.2): place(switch(), k, 0.4)                                        # flicking all night
for k in np.arange(65.0, 65.9, 0.17): place(switch(), k, 0.35)
place(whimper(), 76.4, 0.25)                                                                        # happy wag at the window
place(sting([220, 277, 330], 3.0, 1.2), 77.7, 0.3)                                                 # choice
for c in [4.8, 9.35, 13.3, 14.2, 15.7, 17.85, 22.4, 27.0, 33.85, 36.75, 40.6, 46.8, 51.4, 55.75, 59.85, 61.75, 65.0, 65.95, 66.95, 68.6, 74.1, 77.7]: place(whoosh(0.4), c - 0.2, 0.1)
bed *= np.where((t > 44.45) & (t < 45.1), 0.03, 1.0)

bed *= 0.3 / max(1e-9, np.abs(bed).max())
dog = np.zeros(N)
def dplace(sig, at, gain):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: dog[i:j] += sig[: j - i] * gain
dplace(dv.growl(2.0, seed=4, room=0.2), 56.3, 0.35)   # Biscuit growls at the porch
save(os.path.join(HERE, "bed.wav"), bed + dog)
music = load_wav(os.path.join(HERE, "music.wav"))[:N]; music = np.pad(music, (0, N - len(music)))
venv = np.sqrt(np.convolve(voice ** 2, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")); duck = 1 - 0.45 * np.clip(venv / 0.08, 0, 1)
music = music * duck * 0.2
save(os.path.join(HERE, "bed.wav"), bed + dog + music)
mix = voice + bed + dog + music
mix *= 0.95 / np.abs(mix).max()
save(os.path.join(HERE, "mix.wav"), mix)
print("mix", round(DUR, 2), "s")
