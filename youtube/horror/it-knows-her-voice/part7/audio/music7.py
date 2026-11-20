#!/usr/bin/env python3
"""Part 7 score (synth): dark minor pads, a pulse that speeds up in the chase and at the end,
braams on the big reveals, risers into them, an eerie music-box motif at the porch light, a ticking clock at the choice.
    python3 music5.py -> music.wav (mono 48 kHz, peak 0.9)"""
import os, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); DUR = 86.3
N = int(DUR * SR); t = np.arange(N) / SR; rng = np.random.default_rng(11)
out = np.zeros(N)
def put(sig, at, g=1.0):
    i = int(at * SR); j = min(N, i + len(sig))
    if 0 <= i < N: out[i:j] += sig[: j - i] * g
def lp(x, a):  # one-pole low-pass
    y = np.empty_like(x); acc = 0.0
    for k in range(0, len(x), 4096):
        seg = x[k:k + 4096]; z = np.empty_like(seg)
        for i, v in enumerate(seg): acc += a * (v - acc); z[i] = acc
        y[k:k + 4096] = z
    return y
def saw(f, n, det=0.0, harm=10):
    x = np.arange(n) / SR; s = np.zeros(n)
    for h in range(1, harm + 1): s += np.sin(2 * np.pi * f * (1 + det) * h * x + h) / h ** 1.4
    return s
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
# --- pads: Am F Dm E, 6 s per chord, three detuned voices ---
prog = [[45, 48, 52], [41, 45, 48], [38, 41, 45], [40, 44, 47]]
pad = np.zeros(N); L = 6.0; n = int((L + 1.5) * SR); x = np.arange(n) / SR
envp = np.minimum(1, x / 1.2) * np.clip((L + 1.5 - x) / 1.5, 0, 1)
for i in range(int(DUR / L) + 1):
    ch = prog[i % 4]; s = sum(saw(NOTE(m), n, d) for m in ch for d in (-0.003, 0, 0.0035)) / 9
    j0 = int(i * L * SR); j1 = min(N, j0 + n); pad[j0:j1] += (s * envp)[: j1 - j0]
pad = np.convolve(pad, np.ones(18) / 18, "same") * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t))
calm = np.where((t > 44.45) & (t < 45.1), 0.0, np.where((t > 55.75) & (t < 68.6), 0.5, 1.0))
out += pad * 0.33 * calm
# --- sub drone ---
out += (np.sin(2 * np.pi * 41.2 * t) + 0.5 * np.sin(2 * np.pi * 55 * t)) * 0.10 * (1 + 0.6 * np.clip((t - 62) / 12, 0, 1))
# --- pulse: kick + low tom, tempo map ---
def thump(f=52, d=9):
    n = int(0.5 * SR); x = np.arange(n) / SR; fr = f * (1 + 2.2 * np.exp(-x * 40))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * d)
def bpm(tt):
    if tt < 9.35: return 84
    if tt < 22.4: return 70
    if tt < 33.9: return 96
    if tt < 40.6: return 124
    if tt < 46.8: return 0
    if tt < 55.75: return 64
    if tt < 68.6: return 0
    if tt < 77.7: return 80 + 45 * (tt - 68.6) / 9.1
    return 0
tt = 0.3
while tt < DUR - 0.5:
    b = bpm(tt)
    if b == 0: tt += 0.25; continue
    acc = 0.55 if b < 70 else 0.75; put(thump(), tt, acc); put(thump(85, 14), tt + 30 / b, acc * 0.35); tt += 60 / b
# --- braams (big low brass hits) ---
def braam(dur=3.2, f=55):
    n = int(dur * SR); x = np.arange(n) / SR
    s = saw(f, n, 0, 14) + saw(f * 1.498, n, 0.002, 10) * 0.6 + saw(f / 2, n, 0, 6) * 0.8
    s = np.convolve(s, np.ones(10) / 10, "same") * (1 + 0.3 * np.sin(2 * np.pi * 6 * x))
    return np.tanh(s * 1.8) * np.minimum(1, x / 0.04) * np.exp(-x * 0.9)
for at, f in [(4.8, 55), (40.6, 49), (55.75, 46.2)]: put(braam(3.4, f), at, 0.55)
# --- risers into the reveals ---
def riser(dur=2.2):
    n = int(dur * SR); x = np.arange(n) / SR; q = x / dur
    noise = rng.standard_normal(n); hp = noise - np.convolve(noise, np.ones(int(40 - 34 * q[-1]) + 2) / (int(40 - 34 * q[-1]) + 2), "same")
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * q ** 2) / SR)
    return (hp * 0.5 + tone * 0.35) * q ** 2.2
for at in [40.6, 55.75, 77.7]: put(riser(2.2), at - 2.2, 0.45)
# --- reverse swells before some cuts ---
def rswell(dur=1.0):
    n = int(dur * SR); x = np.arange(n) / SR; s = sum(np.sin(2 * np.pi * NOTE(m) * x) for m in (57, 60, 64)) / 3
    return s * (x / dur) ** 3
for at in [9.35, 22.4, 33.9, 46.8, 68.6]: put(rswell(1.0), at - 1.0, 0.35)
# --- music box while the tall thing copies Mom / "come home" (eerie, slightly out of tune) ---
def bell(f, dur=1.6):
    n = int(dur * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x * 6) + 0.15 * np.sin(2 * np.pi * f * 5.4 * x) * np.exp(-x * 9)) * np.exp(-x * 2.6)
motif = [76, 72, 69, 71, 68, 69, 72, 71]
for i, m in enumerate(motif * 2):
    at = 59.9 + i * 0.6
    if at < 68.4: put(bell(NOTE(m) * (1 + 0.006 * np.sin(i)), 1.6), at, 0.22)
# --- clock at the choice ---
def tick(f=2400):
    n = int(0.04 * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * f * x) * np.exp(-x * 160)
for k in np.arange(77.9, 85.0, 0.5): put(tick(2400 if int(k * 2) % 2 else 1800), k, 0.35)
put(braam(3.0, 36.7), 77.7, 0.35)
# fades
out *= np.where((t > 44.45) & (t < 45.1), 0.03, 1.0)
out *= np.minimum(1, t / 0.4) * np.clip((DUR - t) / 1.2, 0, 1)
out = out / np.abs(out).max() * 0.9
with wave.open(os.path.join(HERE, "music.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print("music ok")
