"""Vasa short: music + SFX stems (music.wav, sfx.wav). Levels are set by mix.py (music = 50 % of the voice)."""
import wave
import numpy as np
from audio_lib import *  # SR, N, DUR, rng, synths (thunk, rumble, crash, ting, sting, creak, snap, splash, whoosh, water), pluck, brass, drum, midi, place, lp_fast, hp_fast

F = lambda f: f / 30
music = np.zeros(N, np.float32)
sfx = np.zeros(N, np.float32)

# ---------------- music ----------------
def march(t0, t1, prog, bpm, gain=1.0, fanfare=True):
    beat = 60 / bpm; bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % len(prog)]
        place(music, brass([midi(m) for m in ch], beat * 4 * 0.98), tt, 0.10 * gain)
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            place(music, drum("kick" if b % 2 == 0 else "snare"), tb, (0.55 if b % 2 == 0 else 0.32) * gain)
            place(music, pluck(midi(root - 12), 0.4, 0.4), tb, 0.35 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.22, 0.6), tb + beat / 2, 0.13 * gain)
        if fanfare and bar % 2 == 1:
            for k, m in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12]):
                place(music, brass([midi(m)], beat * 0.45), tt + 2 * beat + k * beat * 0.5, 0.07 * gain)
        bar += 1; tt += beat * 4
    i0, i1 = int((t1 - 0.1) * SR), int(t1 * SR)
    music[i0:i1] *= np.linspace(1, 0, i1 - i0) ** 4; music[i1:i1 + int(2 * SR)] *= 0  # clean stop (later sections add back)

def pad(t0, t1, notes, gain, cutoff=900):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t + 0.4 * np.sin(2 * np.pi * 0.2 * t)) for m in notes) / len(notes)
    s = lp_fast((s * np.minimum(1, t / 1.0) * np.minimum(1, (t1 - t0 - t) / 0.6).clip(0)).astype(np.float32), cutoff)
    place(music, s, t0, gain)

# 1) building the monster: minor march (Dm Bb C A), stops on "bold decision"
march(0.0, F(912), [(50, [50, 53, 57]), (46, [46, 50, 53]), (48, [48, 52, 55]), (45, [45, 49, 52])], 108)
pad(F(912), F(1006), [38, 45, 50], 0.5)                  # held breath under the admiral
# 2) launch day: major fanfare march (D G A D), cut at the second gust
march(F(1006), F(1306), [(50, [50, 54, 57]), (55, [55, 59, 62]), (57, [57, 61, 64]), (50, [50, 54, 57])], 116)
pad(F(1306), F(1543), [26, 33, 38], 0.9, 500)            # disaster drone
pad(F(1543), F(1729), [50, 57, 62, 64], 0.55, 1400)      # underwater, slow and wide
# 3) museum: light pluck waltz until "trip"
beat = 60 / 96
for k in range(int((F(1952) - F(1729)) / beat)):
    tb = F(1729) + k * beat
    ch = [(50, [62, 66, 69]), (55, [62, 67, 71]), (57, [61, 64, 69]), (50, [62, 66, 69])][(k // 3) % 4]
    place(music, pluck(midi(ch[0] - 12 if k % 3 == 0 else ch[1][k % 3]), 0.4, 0.5), tb, 0.3 if k % 3 == 0 else 0.15)

# ---------------- sfx ----------------
def cheer(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = hp_fast(lp_fast(noise(d), 2600), 400) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t) ** 2)
    return (s * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.6).clip(0)).astype(np.float32)
def gasp(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 3000), 600) * np.minimum(1, t / 0.05) * np.exp(-t * 3)).astype(np.float32)
def boom():
    a = thunk(55, 0.6) * 1.2; b = rumble(1.2)[: len(a)] * 0.8; return (a + b).astype(np.float32)
def wind(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t) ** 2) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6).clip(0)).astype(np.float32)
def steps(d, rate=7.5):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * rate)):
        g = thunk(rng.uniform(140, 200), 0.09) * rng.uniform(0.4, 0.8); i = int((k / rate + rng.uniform(0, 0.03)) * SR)
        out[i:i + len(g)] += g[: len(out) - i]
    return out
def bubbles(d, n=14):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(n):
        m = int(0.08 * SR); t = np.arange(m) / SR; f0 = rng.uniform(400, 900)
        g = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 3 * t)) / SR) * np.exp(-t * 40); i = int(rng.uniform(0, d - 0.1) * SR)
        out[i:i + m] += g.astype(np.float32) * 0.5
    return out
def flap():
    w = whoosh(0.35) * 1.2; t = thunk(220, 0.12) * 0.4; w[: len(t)] += t
    return w.astype(np.float32)

place(sfx, whoosh(0.7), F(42), 0.5)                         # hook pull-back
place(sfx, whoosh(0.4), F(124), 0.6); place(sfx, splash(1.2), F(130), 0.5)   # spoiler: masts in the water
place(sfx, water(F(200 - 128)), F(128), 0.25)
place(sfx, whoosh(0.4), F(197), 0.6)
place(sfx, ting(), F(219), 0.45)                             # "monster"
for k in range(12): place(sfx, thunk(150 + k * 4, 0.16), F(254) + k * 0.12, 0.5)   # cannons slide out
for f in (320, 333, 346): place(sfx, ting(), F(f), 0.3)      # gold glints
place(sfx, whoosh(0.8), F(359), 0.45)
for f in (519, 537, 556, 575): place(sfx, thunk(70, 0.4), F(f), 1.0); place(sfx, creak(0.6, 110), F(f) + 0.08, 0.6)
place(sfx, steps(F(856 - 670)), F(670), 0.8)                 # thirty sailors running
for k in range(6): place(sfx, creak(0.7, 100 + k * 6), F(690) + k * 1.0, 0.5 + k * 0.08)
place(sfx, thunk(90, 0.3), F(872), 0.8)                      # "stopped"
place(sfx, sting(), F(978), 0.75)                            # "He let it sail anyway."
place(sfx, whoosh(0.5), F(1002), 0.6)
place(sfx, cheer(F(1146 - 1010)), F(1010), 0.6)              # crowd
place(sfx, water(F(1543 - 1006)), F(1006), 0.2)
for f in (1099, 1106, 1113, 1120, 1127): place(sfx, boom(), F(f), 0.9)  # salute
place(sfx, flap(), F(1150), 0.8); place(sfx, flap(), F(1158), 0.6); place(sfx, flap(), F(1165), 0.5)
place(sfx, wind(F(1340 - 1185)), F(1185), 0.7)
place(sfx, creak(0.9, 90), F(1222), 0.8); place(sfx, creak(0.7, 120), F(1250), 0.6)
place(sfx, creak(1.2, 70), F(1305), 1.0); place(sfx, rumble(2.5), F(1312), 0.8)
place(sfx, gasp(), F(1314), 0.7)
for k in range(5): place(sfx, splash(1.0), F(1340) + k * 0.45, 0.8)
place(sfx, crash(1.6), F(1352), 0.5)
place(sfx, rumble(3.5), F(1422), 0.6); place(sfx, bubbles(3.5, 20), F(1440), 0.6)
place(sfx, whoosh(0.5), F(1539), 0.6)
place(sfx, lp_fast(noise(F(1729 - 1543)), 300) * 0.8, F(1543), 0.6)   # underwater hush
place(sfx, bubbles(F(1729 - 1550), 22), F(1550), 0.45)
for f in (1660, 1690, 1715): place(sfx, ting(), F(f), 0.25)
place(sfx, whoosh(0.5), F(1725), 0.6)
place(sfx, cheer(F(1978 - 1735)) * 0.25, F(1735), 0.5)       # museum murmur
place(sfx, whoosh(0.3), F(1948), 0.6); place(sfx, thunk(80, 0.45), F(1958), 1.0); place(sfx, sting(), F(1953), 0.5)

def save(name, x):
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x / max(1e-6, np.abs(x).max()) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
save("music.wav", music); save("sfx.wav", sfx)
print("stems ok", DUR)
