"""Einstein 9x10 short: music + SFX. Light classroom plucks, a hush for the quote, a twist sting, warm ending."""
import wave
import numpy as np
from audio_lib import *
F = lambda f: f / 30
music = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
def pad(t0, t1, notes, gain, cutoff=1200):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t + 0.4 * np.sin(2 * np.pi * 0.2 * t)) for m in notes) / len(notes)
    s = lp_fast((s * np.minimum(1, t / 0.8) * np.minimum(1, (t1 - t0 - t) / 0.6).clip(0)).astype(np.float32), cutoff)
    place(music, s, t0, gain)
def plucky(t0, t1, beat, seq, gain=1.0):
    k = 0; tt = t0
    while tt < t1: place(music, pluck(midi(seq[k % len(seq)]), 0.3, 0.6), tt, 0.16 * gain); k += 1; tt += beat
plucky(0.0, F(457), 0.3, [64, 67, 72, 67, 65, 69, 72, 69])
for k in range(int((F(574) - F(490)) / 0.25)): place(music, pluck(midi([72, 76, 79, 76][k % 4]), 0.15, 0.7), F(490) + k * 0.25, 0.14)
pad(F(688), F(1167), [57, 60, 64], 0.4, 900)
for k in range(int((F(1167) - F(789)) / 0.6)): place(music, pluck(midi([57, 64, 60, 64][k % 4]), 0.8, 0.4), F(789) + k * 0.6, 0.13)
plucky(F(1217), F(1472), 0.22, [62, 65, 69, 65], 1.1)
pad(F(1472), DUR, [60, 64, 67, 72], 0.4, 1500)
for k in range(int((DUR - F(1472)) / 0.45)): place(music, pluck(midi([72, 67, 64, 67, 74, 67][k % 6]), 0.7, 0.6), F(1472) + k * 0.45, 0.13)
def chalk(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 2500)[:n] * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.minimum(1, (d - t) / 0.05).clip(0) * 0.6).astype(np.float32)
def crowd_laugh(d=2.4):
    n = int(d * SR); t = np.arange(n) / SR; out = np.zeros(n, np.float32)
    for k in range(10):
        f0 = rng.uniform(220, 420); ph = rng.uniform(0, 1); rate = rng.uniform(5, 7)
        s = np.sin(2 * np.pi * f0 * t) * (np.sin(2 * np.pi * rate * t + ph * 6) > 0.3) * np.exp(-t / d * 1.2)
        out += lp_fast(s.astype(np.float32), 2500) * 0.15
    return out * np.minimum(1, t / 0.1)
def stamp(): a = thunk(80, 0.35) * 1.4; return a.astype(np.float32)
for f in (145, 206, 271, 350, 360, 370, 380, 390, 398, 457): place(sfx, chalk(0.6 if f > 340 and f < 400 else 0.9), F(f), 0.5)
place(sfx, ting(), F(470), 0.4)
place(sfx, crowd_laugh(2.6), F(490), 0.8)
place(sfx, whoosh(0.4), F(730), 0.3)
place(sfx, ting(), F(789), 0.35); place(sfx, ting(), F(883), 0.3)
place(sfx, sting(), F(1217), 0.5); place(sfx, stamp(), F(1250), 0.9)
for f in (1318, 1344, 1370): place(sfx, thunk(240, 0.08), F(f), 0.5)
place(sfx, ting(), F(1419), 0.4); place(sfx, ting(), F(1505), 0.45); place(sfx, ting(), F(1640), 0.5)
def save(name, x):
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x / max(1e-6, np.abs(x).max()) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
save("music.wav", music); save("sfx.wav", sfx); print("stems ok", DUR)
