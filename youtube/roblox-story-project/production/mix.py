#!/usr/bin/env python3
"""Music bed + SFX under the narration, music ducked under the voice.  python3 mix.py [narration.wav] -> mix.wav"""
import json, os, subprocess, sys, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__))
voice_p = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'narration_temp.wav')
v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', voice_p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
tl = json.load(open(os.path.join(HERE, 'timeline.json'))); T = {s['shot']: s for s in tl['shots']}; N = len(v)
rng = np.random.default_rng(3); mus = np.zeros(N); fx = np.zeros(N)
tt = lambda d: np.arange(int(d * SR)) / SR
def put(buf, at, x, g=1.0):
    i = int(at * SR)
    if 0 <= i < N: x = x[: N - i]; buf[i:i + len(x)] += x * g
def env(d, a=0.005, r=None):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)); return e * np.exp(-t / r) if r else e
def note(f, d, kind='sine', r=0.25, a=0.004):
    t = tt(d); w = {'sine': np.sin(2 * np.pi * f * t), 'tri': 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * t)), 'saw': 2 * ((f * t) % 1) - 1}[kind]; return w * env(d, a, r)
def lp(x, k):
    y = np.empty_like(x); s = 0.0
    for i, q in enumerate(x): s += k * (q - s); y[i] = s
    return y
hz = lambda n: 440 * 2 ** ((n - 69) / 12)
def comedy(t0, t1, g=1.0):
    prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]; mel = [72, None, 74, 76, None, 79, 76, None, 74, 72, None, 69, 71, None, 72, None]; t, k = t0, 0
    while t < t1 - 0.05:
        root, ch = prog[(k // 4) % 4]; put(mus, t, note(hz(root - 12 + (7 if k % 2 else 0)), 0.4, 'tri', 0.16), 0.5 * g)
        if k % 2: [put(mus, t, note(hz(n), 0.22, 'tri', 0.06), 0.11 * g) for n in ch]
        m = mel[k % 16]
        if m and k % 32 < 16: put(mus, t, note(hz(m), 0.28, 'sine', 0.14), 0.16 * g)
        t += 0.5; k += 1
def pad(t0, t1, notes=(45, 52, 57), g=1.0):
    d = t1 - t0; t = tt(d); fade = np.minimum(1, np.minimum(t / 1.5, (d - t) / 1.5))
    put(mus, t0, sum(np.sin(2 * np.pi * hz(n) * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) for n in notes) / len(notes) * fade * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * t)), 0.35 * g)
def chase(t0, t1, g=1.0):
    t, k = t0, 0
    while t < t1 - 0.05:
        put(mus, t, note(hz([45, 45, 48, 50][(k // 2) % 4] - 12), 0.22, 'saw', 0.08), 0.22 * g); put(mus, t, lp(rng.standard_normal(int(0.05 * SR)), 0.9) * env(0.05, 0.001, 0.01), 0.08 * g); t += 0.25; k += 1
S = lambda a: T[a]['s']; E = lambda a: T[a]['end']
pad(S('S01'), E('S03'), (45, 52, 60), 0.7); comedy(S('S04'), E('S18')); pad(S('S19'), E('S19'), (44, 51, 56)); comedy(S('S20'), E('S23'), 0.9); pad(S('S24'), E('S24'), (45, 52, 56))
comedy(S('S25'), E('S27'), 1.1); pad(S('S28'), E('S29'), (43, 50, 55), 0.6); pad(S('S30'), E('S32'), (40, 47, 52), 0.9); comedy(S('S33'), E('S40'), 1.0); pad(S('S40B'), E('S43B'), (45, 48, 52), 0.8)
pad(S('S44'), E('S47'), (45, 52, 57), 0.7); pad(S('S48'), E('S48'), (48, 55, 60), 0.9); chase(S('S49'), E('S54B')); pad(S('S55'), E('S57'), (43, 50, 55), 0.8); comedy(S('S59'), E('S59'), 1.1)
pad(S('S60'), E('S61B'), (48, 52, 55, 60), 0.9); pad(S('S62'), E('S65'), (40, 46, 51), 0.8)
# sfx
def boing(at, g=0.35): t = tt(0.35); put(fx, at, np.sin(2 * np.pi * np.cumsum(220 + 300 * np.exp(-t * 8) * np.sin(2 * np.pi * 9 * t)) / SR) * env(0.35, 0.002, 0.12), g)
def scratch(at, g=0.4): t = tt(0.35); f = 600 * (1 + np.sin(2 * np.pi * 3 * t)); put(fx, at, lp(rng.standard_normal(len(t)), 0.6) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))) * env(0.35, 0.002, 0.15), g)
def cheer(at, d=2.5, g=0.35): x = lp(rng.standard_normal(int(d * SR)), 0.25); t = tt(d); put(fx, at, x * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.8) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * t)), g)
def shutter(at, g=0.25): put(fx, at, lp(rng.standard_normal(int(0.04 * SR)), 0.8) * env(0.04, 0.001, 0.01), g)
def ding(at, f=1568, g=0.25): put(fx, at, note(f, 0.9, 'sine', 0.35) + 0.4 * note(f * 2, 0.9, 'sine', 0.2), g)
def whistle(at, g=0.3): t = tt(0.6); put(fx, at, np.sin(2 * np.pi * 2800 * t + 3 * np.sin(2 * np.pi * 40 * t)) * env(0.6, 0.01, 0.4), g)
def thump(at, g=0.6): put(fx, at, note(70, 0.3, 'sine', 0.09) + lp(rng.standard_normal(int(0.3 * SR)), 0.15) * env(0.3, 0.001, 0.05), g)
def splash(at, g=0.6): x = lp(rng.standard_normal(int(1.2 * SR)), 0.5); put(fx, at, x * env(1.2, 0.005, 0.35), g)
def sting(at, g=0.35): [put(fx, at, note(hz(n), 1.4, 'saw', 0.8, 0.01), g * 0.15) for n in (40, 46, 52, 55)]
def chime(at, g=0.25): [put(fx, at + k * 0.12, note(hz(n), 1.2, 'sine', 0.6), g) for k, n in enumerate((84, 88, 91))]
cheer(S('S03') + 0.6, 3.5); [shutter(S('S03') + 0.8 + k * 0.37) for k in range(8)]
for a in ('S06', 'S07', 'S08'): boing(S(a) + 0.8)
scratch(S('S09') + 1.4); [boing(S('S12') + k * 1.3, 0.2) for k in range(4)]; cheer(S('S13') + 6, 3, 0.25); whistle(S('S14') + 0.5); cheer(S('S15') + 3, 3, 0.3)
sting(S('S19') + 0.1, 0.4); boing(S('S20') + 0.5); [thump(S('S22') + 2.2 + k * 0.15, 0.25) for k in range(4)]; chime(S('S24') + 4.2, 0.18)
cheer(S('S25B'), 4, 0.3); whistle(S('S27') + 0.6, 0.4); scratch(S('S28') + 0.4); cheer(S('S29'), 3, 0.3); sting(S('S30'), 0.3); chime(S('S32') + 2.5)
cheer(S('S33') + 0.5, 3, 0.2); [shutter(S('S33') + 0.4 + k * 0.4, 0.2) for k in range(8)]; cheer(S('S34') + 0.5, 5, 0.35); cheer(S('S35'), 3); ding(S('S38') + 2); [shutter(S('S40') + 4 + k * 0.3) for k in range(4)]
sting(S('S41'), 0.25); boing(S('S44') + 6.3); boing(S('S45') + 2.8); ding(S('S45') + 5.2); chime(S('S46') + 2, 0.2); [scratch(S('S47') + k * E('S47') / 4 - S('S47') * 0 + 0, 0.15) for k in range(0)]
thump(S('S52') + 2.4, 0.8); splash(S('S52') + 2.4); scratch(S('S53') + 0.8, 0.3); cheer(S('S54'), E('S54') - S('S54'), 0.25); splash(S('S54B') + 5.2, 0.3)
thump(S('S55') + 1.5, 0.4); sting(S('S56'), 0.3); cheer(S('S57') + 2.5, 3.5, 0.3); chime(S('S58B') + 2.5); cheer(S('S59') + 1, 5, 0.4); ding(S('S59') + 4.5)
put(fx, S('S61') + 0.72 * (E('S61') - S('S61')), lp(rng.standard_normal(int(0.12 * SR)), 0.8) * env(0.12, 0.0005, 0.02), 0.7); chime(S('S61') + 0.75 * (E('S61') - S('S61')), 0.2)
sting(S('S63'), 0.45); [ding(S('S64') + k * (E('S64') - S('S64')) / 3, 2637, 0.12) for k in range(3)]; sting(E('S65') - 3.0, 0.5)
# duck music under the voice
e = np.convolve(np.abs(v), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same'); e = e / (e.max() + 1e-9); duck = 1 - 0.75 * np.clip(e * 4, 0, 1)
mix = v * 1.0 + mus * 0.32 * duck + fx * 0.6
mix = mix / np.abs(mix).max() * 0.9
with wave.open(os.path.join(HERE, 'mix.wav'), 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
print('mix ok', round(N / SR, 1))
