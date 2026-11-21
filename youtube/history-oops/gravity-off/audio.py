"""Gravity short: music + SFX stems (music.wav, sfx.wav). Levels are set by mix.py."""
import wave
import numpy as np
from audio_lib import *

F = lambda f: f / 30
music = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)

def pad(t0, t1, notes, gain, cutoff=1200):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t + 0.5 * np.sin(2 * np.pi * 0.25 * t)) for m in notes) / len(notes)
    s = lp_fast((s * np.minimum(1, t / 0.6) * np.minimum(1, (t1 - t0 - t) / 0.4).clip(0)).astype(np.float32), cutoff)
    place(music, s, t0, gain)

def bouncy(t0, t1, bpm, prog, gain=1.0):
    beat = 60 / bpm; k = 0; tt = t0
    while tt < t1:
        root, ch = prog[(k // 4) % len(prog)]
        place(music, pluck(midi(root - 12), 0.3, 0.35), tt, 0.5 * gain)
        if k % 2: [place(music, pluck(midi(m), 0.16, 0.7), tt, 0.12 * gain) for m in ch]
        place(music, drum("kick" if k % 2 == 0 else "snare"), tt, (0.32 if k % 2 == 0 else 0.18) * gain)
        k += 1; tt += beat
    i1 = int(t1 * SR); music[max(0, i1 - 1500):i1] *= np.linspace(1, 0, min(1500, i1))

def floaty(t0, t1, gain=1.0):
    """weightless music-box arpeggio over a soft pad"""
    seq = [72, 76, 79, 84, 79, 76, 74, 77, 81, 86, 81, 77]; beat = 0.22; k = 0; tt = t0
    while tt < t1:
        place(music, pluck(midi(seq[k % len(seq)]), 0.5, 0.9), tt, 0.16 * gain); k += 1; tt += beat
    pad(t0, t1, [60, 64, 67, 71], 0.35 * gain, 1500)

bouncy(0.0, F(108), 120, [(48, [60, 64, 67]), (53, [60, 65, 69])])
floaty(F(108), F(1107))
for k in range(int((F(1184) - F(1107)) / 0.5)): place(music, pluck(midi(48), 0.2, 0.3), F(1107) + k * 0.5, 0.35 + k * 0.04)   # tension ticks
bouncy(F(1215), F(1624), 132, [(48, [60, 64, 67]), (55, [59, 62, 67]), (57, [60, 64, 69]), (53, [57, 60, 65])])
for k in range(int((F(1822) - F(1624)) / 0.6)): place(music, pluck(midi([67, 64, 60, 64][k % 4]), 0.5, 0.5), F(1624) + k * 0.6, 0.12)   # lullaby

def whoosh_up(d=0.8):
    n = int(d * SR); t = np.arange(n) / SR; f = 300 + 900 * t / d
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 * np.exp(-((t - d / 2) / (d / 3)) ** 2) + whoosh(d)[:n] * 0.6).astype(np.float32)
def honk(d=0.3, f0=420):
    n = int(d * SR); t = np.arange(n) / SR; s = np.sign(np.sin(2 * np.pi * f0 * t)) * 0.5 + np.sin(2 * np.pi * f0 * 1.26 * t)
    return (lp_fast(s.astype(np.float32), 2200) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.03).clip(0)).astype(np.float32)
def blub(n=6, d=1.2):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(n):
        m = int(0.09 * SR); t = np.arange(m) / SR; f0 = rng.uniform(300, 700)
        g = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * t)) / SR) * np.exp(-t * 35); i = int(rng.uniform(0, d - 0.1) * SR); out[i:i + m] += g.astype(np.float32) * 0.5
    return out
def tick(): n = int(0.05 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90)).astype(np.float32)
def meow(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR; f = 600 + 300 * np.sin(np.pi * t / d)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * (1 + 0.3 * np.sin(2 * np.pi * 30 * t))).astype(np.float32)
def snore(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 400)[:n] * np.sin(np.pi * t / d) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * t))).astype(np.float32)

for f in (60, 108, 468, 696, 991): place(sfx, ting(), F(f), 0.5)          # countdown pops
place(sfx, whoosh_up(1.4), F(112), 0.6)
place(sfx, whoosh_up(0.9), F(140), 0.4); place(sfx, ting(), F(240), 0.3); place(sfx, meow(), F(262), 0.4)
place(sfx, whoosh_up(0.7), F(286), 0.6)
place(sfx, whoosh_up(1.0), F(314), 0.5)
for f in (430, 446): place(sfx, honk(), F(f), 0.6)
place(sfx, blub(10, 3.0), F(505), 0.5); place(sfx, blub(6, 1.5), F(630), 0.5)
place(sfx, whoosh_up(1.2), F(730), 0.5)
place(sfx, ting(), F(950), 0.3)
for k in range(5): place(sfx, thunk(300, 0.06), F(1030) + k * 0.4, 0.25)    # chomp attempts
for k in range(6): place(sfx, tick(), F(1110) + k * 0.25, 0.6)
place(sfx, sting(), F(1141), 0.7)
place(sfx, whoosh(0.6), F(1186), 0.9); place(sfx, crash(1.6), F(1206), 0.9); place(sfx, rumble(1.5), F(1206), 0.6)
for k in range(5): place(sfx, thunk(90, 0.3), F(1288 + k * 16), 0.9)
place(sfx, crash(1.0), F(1386), 0.9)
place(sfx, splash(1.4), F(1440), 0.9)
place(sfx, thunk(220, 0.08), F(1490), 0.4); place(sfx, ting(), F(1517), 0.5)
for k in range(4): place(sfx, snore(1.4), F(1630) + k * 1.9, 0.35)
place(sfx, whoosh_up(0.8), F(1790), 0.4)

def save(name, x):
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x / max(1e-6, np.abs(x).max()) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
save("music.wav", music); save("sfx.wav", sfx)
print("stems ok", DUR)
