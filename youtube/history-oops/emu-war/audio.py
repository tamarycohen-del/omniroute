"""Emu War short: music + SFX stems (music.wav, sfx.wav). Levels are set by mix.py (music -6 dB vs the voice)."""
import wave
import numpy as np
from audio_lib import *

F = lambda f: f / 30
music = np.zeros(N, np.float32)
sfx = np.zeros(N, np.float32)

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
    i0, i1 = int((t1 - 0.08) * SR), int(t1 * SR)
    music[i0:i1] *= np.linspace(1, 0, i1 - i0) ** 4; music[i1:i1 + int(1.5 * SR)] *= 0

def bounce(t0, t1, bpm=132, gain=1.0):
    """silly oom-pah tuba + plucks for the chase"""
    beat = 60 / bpm; k = 0; tt = t0
    prog = [(43, [55, 59, 62]), (48, [55, 60, 64]), (50, [54, 57, 62]), (43, [55, 59, 62])]
    while tt < t1:
        root, ch = prog[(k // 4) % 4]
        place(music, pluck(midi(root - (0 if k % 2 == 0 else -7)), 0.3, 0.3), tt, 0.5 * gain)
        if k % 2: [place(music, pluck(midi(m), 0.15, 0.7), tt, 0.12 * gain) for m in ch]
        place(music, drum("kick" if k % 2 == 0 else "snare"), tt, (0.35 if k % 2 == 0 else 0.2) * gain)
        k += 1; tt += beat
    i1 = int(t1 * SR); music[i1 - 2000:i1] *= np.linspace(1, 0, 2000)

# 0-12.5 s: pompous military march (G major) that dies on "Their enemy?"
march(0.0, F(376), [(43, [55, 59, 62]), (48, [55, 60, 64]), (50, [54, 57, 62]), (43, [55, 59, 62])], 112)
# enemy stats: tense low pulse
for k in range(int((F(523) - F(376)) / 0.45)): place(music, pluck(midi(38 if k % 2 == 0 else 45), 0.4, 0.3), F(376) + k * 0.45, 0.45)
# the plan: march again, smug
march(F(523), F(682), [(43, [55, 59, 62]), (50, [54, 57, 62])], 112, 0.8)
# Run!: chase music to the end of the truck chase
bounce(F(682), F(874), 138)
bounce(F(912), F(1130), 144)
# gave up: sad trombone-ish falling notes
for k, m in enumerate([55, 54, 53, 52]): place(music, brass([midi(m - 12)], 0.55 if k < 3 else 1.4), F(1150) + k * 0.6, 0.12)
# came back: march returns, then stops dead on "waiting"
march(F(1218), F(1317), [(43, [55, 59, 62]), (48, [55, 60, 64])], 120, 0.9)
# counting: plucky question music
for k in range(int((F(1530) - F(1364)) / 0.32)): place(music, pluck(midi([62, 66, 69, 66][k % 4]), 0.2, 0.6), F(1364) + k * 0.32, 0.18)
# tanks: heavy low drum hits
for k in range(6): place(music, drum("kick"), F(1530) + k * 0.43, 0.7)
# ending: slow, cheeky emu anthem (major) to the end
march(F(1672), DUR - 0.2, [(43, [55, 59, 62]), (48, [55, 60, 64]), (50, [54, 57, 62]), (43, [55, 59, 62])], 92, 0.8)

# ---------------- sfx ----------------
def honk(d=0.35, f0=210):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1 + 0.25 * np.sin(2 * np.pi * 9 * t))
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f) / SR)
    return (lp_fast(s.astype(np.float32), 1600) * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05).clip(0)).astype(np.float32)
def boing(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR; f = 180 + 260 * np.exp(-t * 6) * (1 + 0.3 * np.sin(2 * np.pi * 14 * t))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)).astype(np.float32)
def gunshot():
    a = thunk(110, 0.12) * 1.4; n = noise(0.08) * np.exp(-np.arange(int(0.08 * SR)) / SR * 50); a[:len(n)] += n * 0.8; return a.astype(np.float32)
def click():
    n = int(0.03 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300)).astype(np.float32)
def engine(d, f0=48):
    n = int(d * SR); t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * f0 * t * (1 + 0.04 * np.sin(2 * np.pi * 0.7 * t)))) * 0.4 + noise(d)[:n] * 0.2
    return (lp_fast(s.astype(np.float32), 500) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.5).clip(0)).astype(np.float32)
def steps(d, rate=9):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * rate)):
        g = thunk(rng.uniform(150, 230), 0.07) * rng.uniform(0.4, 0.8); i = int((k / rate + rng.uniform(0, 0.02)) * SR)
        out[i:i + len(g)] += g[: len(out) - i]
    return out
def tank():
    return (rumble(1.4) * 0.9 + engine(1.4, 32) * 0.8).astype(np.float32)
def wind(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t) ** 2) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6).clip(0)).astype(np.float32)

place(sfx, sting(), F(60), 0.6)                               # "declared war"
place(sfx, boing(), F(100), 0.5)                              # "On birds." (emu salutes)
for f in (150, 172, 196): place(sfx, honk(0.25, 260), F(f), 0.35)   # emus chatting in the wheat
place(sfx, engine(F(273 - 218)), F(218), 0.5)                 # truck arrives
place(sfx, thunk(160, 0.2), F(288), 0.5); place(sfx, ting(), F(344), 0.45)
place(sfx, whoosh(0.9), F(350), 0.6)                          # pull back reveal
place(sfx, honk(0.4, 170), F(390), 0.5)
place(sfx, whoosh(0.5), F(450), 0.8); place(sfx, steps(0.9, 16), F(445), 0.7)
place(sfx, sting(), F(492), 0.45)
place(sfx, ting(), F(561), 0.4); place(sfx, ting(), F(594), 0.4)
place(sfx, honk(0.3, 300), F(640), 0.3); place(sfx, honk(0.3, 240), F(655), 0.3)
place(sfx, whoosh(0.7), F(682), 0.8); place(sfx, steps(2.0, 22), F(684), 0.8)
place(sfx, steps(F(827 - 720), 12), F(720), 0.45); place(sfx, wind(F(827 - 704)), F(704), 0.3)
for k in range(15): place(sfx, gunshot(), F(830) + k * 0.1, 0.7)
place(sfx, click(), F(880), 1.0); place(sfx, honk(0.2, 330), F(893), 0.4)
place(sfx, engine(F(1130 - 935)), F(935), 0.55)
place(sfx, steps(F(1022 - 960), 16), F(960), 0.6)
for k in range(13): place(sfx, boing(0.25), F(1025) + k * 0.27, 0.35)   # bumpy road
place(sfx, engine(F(1217 - 1130)) * 0.6, F(1130), 0.4)
place(sfx, honk(0.6, 140), F(1235), 0.3)
place(sfx, engine(F(1316 - 1268)), F(1268), 0.5)
place(sfx, sting(), F(1330), 0.6); place(sfx, wind(F(1363 - 1317)), F(1317), 0.6)
for k in range(10): place(sfx, ting(), F(1466) + k * F(5.5), 0.3)
place(sfx, tank(), F(1532), 0.8)
for k in range(6): place(sfx, ting(), F(1540) + k * 0.4, 0.25)
place(sfx, engine(F(1671 - 1608)) * 0.5, F(1608), 0.4)
place(sfx, boing(0.6), F(1647), 0.5)
place(sfx, brass([midi(67), midi(71), midi(74)], 1.2), F(1680), 0.15)  # flag fanfare
place(sfx, steps(1.3, 8), F(1709), 0.5)
place(sfx, thunk(200, 0.15), F(1765), 0.5)
place(sfx, honk(0.35, 250), F(1840), 0.4)

def save(name, x):
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x / max(1e-6, np.abs(x).max()) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
save("music.wav", music); save("sfx.wav", sfx)
print("stems ok", DUR)
