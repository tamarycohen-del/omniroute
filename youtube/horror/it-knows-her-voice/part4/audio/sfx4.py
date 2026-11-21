#!/usr/bin/env python3
"""Part 4 sound: drone + car + chase SFX (synth), Biscuit's growl and barks (dogvoice.py), mixed with voice.wav.
    python3 sfx4.py -> bed.wav, mix.wav. Times match web/ep4.html SHOTS."""
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



# event times below were written for the first cut; remap them shot-by-shot onto the tightened timing (shots.json)
OLD = [[0, "coldOpen"], [2.4, "run1"], [7.2, "comments"], [10.92, "treehouseArm"], [13.84, "runRoad"], [17.4, "lightsTrees"], [19.92, "carComing"], [22.32, "carStops"], [24.16, "windowDown"], [26.0, "haleFace"], [30.4, "haleWave"], [32.44, "growl"], [34.36, "getIn"], [36.4, "silentRide"], [38.7, "driveOff"], [40.62, "lookBack"], [42.3, "rearMom"], [47.82, "momLegs"], [50.3, "rearReach"], [55.98, "haleDriving"], [57.74, "rearClose"], [60.19, "grab"], [62.51, "shake"], [64.56, "bark"], [66.03, "lookDoor"], [69.5, "choice"], [78.79, "end"]]
NEW = json.load(open(os.path.join(HERE, "shots.json")))
def R(x):
    i = max(k for k in range(len(OLD)) if OLD[k][0] <= x or k == 0)
    i = min(i, len(NEW) - 1); return NEW[i][0] + (x - OLD[i][0]) * min(1.0, (NEW[min(i + 1, len(NEW) - 1)][0] - NEW[i][0] + 1e-6) / (OLD[min(i + 1, len(OLD) - 1)][0] - OLD[i][0] + 1e-6))

# --- drone: steady, almost gone in the silent ride, swells in the chase ---
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.4 * t)) * 0.10
shape = np.minimum(1, t / 1.0) * (1 + 0.7 * np.clip((t - R(42)) / (R(60) - R(42)), 0, 1)) * np.where((t > R(36.4)) & (t < R(38.69)), 0.15, 1.0) * np.where(t > DUR - 1.0, np.clip((DUR - t) / 1.0, 0, 1), 1.0)
bed += drone * shape
# --- events (seconds = ep4.html SHOTS) ---
place(tick(900, 90) * 3, 0.55, 0.4); place(engine(1.9, 30, 30, 0.35), 0.5)                       # headlights snap on, engine idles
for k in np.arange(2.5, 7.2, 0.27): place(tick(300, 60) * 2, k, 0.18)                             # our running steps
for i in range(4): place(tick(1500, 120), 7.35 + i * 0.5, 0.35)                                     # comment pops
place(creak(2.9, 160, 360), 10.95, 0.45)                                                             # her arm up to the treehouse
for k in np.arange(13.9, 17.4, 0.26): place(tick(300, 60) * 2, k, 0.16)
place(engine(4.9, 34, 48, 0.55), 17.4)                                                              # car coming closer
place(screech(0.7), 21.75, 0.5); place(thunk(45, 7), 22.3, 0.35)                                    # brakes, stops
place(engine(14.0, 28, 28, 0.25), 22.3)                                                             # idling
place(motor(1.6), 24.25, 0.8)                                                                       # window rolls down
place(sting([110, 116.5, 155.6, 233], 3.0, 1.0), 26.0, 0.55)                                        # It was Mrs. Hale.
place(tick(500, 50) * 2.5, 31.1, 0.4)                                                               # back door opens
place(thunk(70, 12), 35.86, 0.75); place(tick(300, 40) * 2, 35.88, 0.4)                             # door slams
place(screech(0.9), 38.7, 0.55); place(engine(31.0, 40, 52, 0.6, 0.35), 38.7)                       # drives off, engine for the chase
fs, k, rate = [], 42.5, 0.32
while k < 60.2: fs.append(k); k += rate; rate = max(0.17, rate * 0.985)
for i, k in enumerate(fs): place(thunk(52, 11), k, 0.25 + 0.45 * i / len(fs))                       # her steps, faster and louder
hb, gap = 44.0, 0.75
while hb < 69.3: place(heartbeat(), hb, 0.55); hb += gap; gap = max(0.42, gap * 0.97)
place(creak(2.4, 140, 300), 47.9, 0.45); place(creak(5.2, 200, 520), 50.4, 0.55)                   # legs stretch, arms stretch
place(bang(), 60.89, 0.9); place(sting([98, 103.8, 146.8, 207.7], 3.2, 0.9), 60.9, 0.5)              # she grabs the car
place(rattle(3.6), 61.0, 0.45)                                                                      # whole car shakes
place(sting([220, 233, 311, 466], 2.6, 1.3), 66.1, 0.35)
place(sting([220, 277, 330], 3.0, 1.2), 69.6, 0.3)                                                   # choice
for c in [2.4, 7.2, 10.92, 13.84, 17.4, 24.16, 26.0, 32.44, 36.4, 38.7, 40.62, 42.3, 47.82, 50.3, 55.98, 57.74, 62.51, 64.56, 66.03, 69.5]: place(whoosh(0.4), c - 0.2, 0.1)

bed *= 0.5 / max(1e-9, np.abs(bed).max())  # about half the voice peak
# Biscuit (kept out of the bed normalization so he is clearly heard)
dog = np.zeros(N)
def dplace(sig, at, gain):
    i = int(R(at) * SR); j = min(N, i + len(sig))
    if i < N: dog[i:j] += sig[: j - i] * gain
dplace(dv.growl(1.9, seed=1, room=0.15), 32.5, 0.42)                                                # "Biscuit started growling at her"
dplace(dv.bark_run([0, 0.3, 0.62, 0.86, 1.2], seed=3, room=0.3), 64.6, 0.6)                         # "Biscuit was barking" (inside the car)
dplace(dv.bark_run([0, 0.32, 0.7, 1.05, 1.5], seed=9, room=0.3), 66.3, 0.3)                         # still barking under the next line
save(os.path.join(HERE, "bed.wav"), bed + dog)
mix = voice + bed + dog
mix *= 0.95 / np.abs(mix).max()
save(os.path.join(HERE, "mix.wav"), mix)
print("mix", round(DUR, 2), "s")
