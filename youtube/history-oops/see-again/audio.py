"""See-again short: music + SFX stems. Playful first half, tender after the mom reveal."""
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

def bouncy(t0, t1, bpm, prog, gain=1.0):
    beat = 60 / bpm; k = 0; tt = t0
    while tt < t1:
        root, ch = prog[(k // 4) % len(prog)]
        place(music, pluck(midi(root - 12), 0.3, 0.35), tt, 0.45 * gain)
        if k % 2: [place(music, pluck(midi(m), 0.16, 0.7), tt, 0.11 * gain) for m in ch]
        if k % 4 == 0: place(music, drum("kick"), tt, 0.25 * gain)
        k += 1; tt += beat
    i1 = int(t1 * SR); music[max(0, i1 - 3000):i1] *= np.linspace(1, 0, min(3000, i1))

def piano(t0, t1, prog, beat=0.5, gain=1.0):
    k = 0; tt = t0
    while tt < t1:
        root, ch = prog[(k // 8) % len(prog)]
        if k % 8 == 0: place(music, pluck(midi(root - 12), 1.6, 0.25), tt, 0.35 * gain)
        place(music, pluck(midi(ch[k % len(ch)] + 12), 0.9, 0.55), tt, 0.14 * gain)
        k += 1; tt += beat

P1 = [(48, [60, 64, 67]), (55, [59, 62, 67]), (57, [60, 64, 69]), (53, [57, 60, 65])]
bouncy(0.0, F(1167), 112, P1)
pad(F(1167), F(1276), [57, 60, 64], 0.35)
piano(F(1330), F(2105), [(45, [57, 60, 64, 69]), (41, [57, 60, 65, 69]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])], 0.42)
pad(F(1330), F(2105), [45, 52, 57], 0.25, 700)

def pop():
    n = int(0.12 * SR); t = np.arange(n) / SR; f = 500 + 1400 * t / 0.12
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25)).astype(np.float32)
def tick(): n = int(0.04 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 110)).astype(np.float32)
def ring(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR; s = (np.sin(2 * np.pi * 880 * t) + np.sin(2 * np.pi * 1320 * t)) * 0.5 * ((t * 4) % 1 < 0.5)
    return (s * np.minimum(1, (d - t) / 0.1).clip(0)).astype(np.float32)

for f in (108, 362, 414, 488, 697, 935, 1221): place(sfx, pop(), F(f), 0.6)
for k in range(10): place(sfx, tick(), F(150) + k * 0.13, 0.3)          # numbers flickering
place(sfx, ting(), F(935), 0.5)
place(sfx, whoosh(0.5), F(516), 0.4)
place(sfx, rumble(1.0) * 0.4, F(780), 0.3)                                  # mower
place(sfx, ring(1.2), F(1170), 0.45)
place(sfx, sting(), F(1276), 0.5)
place(sfx, ting(), F(1415), 0.35); place(sfx, ting(), F(1468), 0.35); place(sfx, ting(), F(1526), 0.45); place(sfx, ting(), F(1590), 0.5)
for k in range(8): place(sfx, tick(), F(2018) + k * F(5), 0.5)              # counter going up
place(sfx, ting(), F(2058), 0.5)

def save(name, x):
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x / max(1e-6, np.abs(x).max()) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
save("music.wav", music); save("sfx.wav", sfx)
print("stems ok", DUR)
