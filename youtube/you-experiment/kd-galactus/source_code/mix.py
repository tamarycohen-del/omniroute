"""KD vs Galactus mix: ElevenLabs voice + original numpy music (cosmic pad + 100 bpm pulse) + CC0 SFX (sfx-kit / earshot).
usage: python mix.py <voice.mp3> <out.wav>
"""
import subprocess, sys, os
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'tools'))
from sfxkit import Kit

SR = 48000
voice_p, out_p = sys.argv[1:3]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice_p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
V = np.frombuffer(raw, np.float32).reshape(-1, 2)
TOTAL = 67.6
N = int(TOTAL * SR); t = np.arange(N) / SR
rng = np.random.default_rng(3)
SHOTS = [0, 5.3, 6.8, 10.3, 13.4, 16.8, 22.0, 27.6, 31.0, 35.9, 41.7, 51.9, 55.1, 60.9, 64.4]

# ---- music: Dm pad + sub pulse, energy rises into the swish, drops for "one problem" ----
M = np.zeros(N)
for f, w in [(73.4, 0.5), (110.0, 0.35), (146.8, 0.25), (174.6, 0.18), (220.0, 0.12)]:
    M += w * np.sin(2 * np.pi * f * t + 0.4 * np.sin(2 * np.pi * 0.11 * t))
M *= 0.45
beat = 60 / 100
for k, at in enumerate(np.arange(0.0, TOTAL, beat)):
    i0 = int(at * SR); n = int(0.3 * SR); tt = np.arange(n) / SR
    kick = np.sin(2 * np.pi * (55 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
    b = min(N, i0 + n); M[i0:b] += 0.9 * kick[:b - i0]
    if k % 2 == 1:
        nn = int(0.06 * SR); hat = rng.standard_normal(nn) * np.exp(-np.arange(nn) / nn * 6); bb = min(N, i0 + nn); M[i0:bb] += 0.12 * np.diff(np.concatenate([[0], hat]))[:bb - i0]
energy = np.interp(t, [0, 5, 41.7, 50.9, 51.0, 55.0, 55.1, 60.9, TOTAL], [0.8, 0.6, 1.0, 1.25, 1.3, 1.1, 0.3, 0.6, 0.6])
M *= energy
M /= np.max(np.abs(M)) + 1e-9
L = M * 0.14; R = M * 0.14

kit = Kit(SR)
for s in SHOTS[1:]:
    kit.place(L, R, 'whoosh-fast-soft', s, 0.35)


def thump(at, g=0.5):  # dribble
    i0 = int(at * SR); n = int(0.12 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * (90 + 60 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 35); b = min(N, i0 + n); L[i0:b] += x[:b - i0] * g; R[i0:b] += x[:b - i0] * g


for at in np.arange(0.2, 5.0, 0.35): thump(at, 0.35)
for at in np.arange(31.1, 34.0, 0.34): thump(at, 0.4)
for at in np.arange(41.8, 47.8, 0.36): thump(at, 0.4)
kit.place(L, R, 'impact-deep-soft', 0.05, 0.6)
kit.place(L, R, 'impact-medium-firm', 10.5, 0.45)            # 28'9"
kit.place(L, R, 'riser-1s-soft', 16.8, 0.4)
kit.place(L, R, 'impact-heavy-hard', 23.9, 0.7)              # impossible
kit.place(L, R, 'impact-light-firm', 26.9, 0.5)              # palm
kit.place(L, R, 'impact-light-soft', 34.0, 0.5)              # freezes
kit.place(L, R, 'riser-2s-strong', 50.9, 0.45)               # into the swish
nn = int(0.5 * SR); sw = rng.standard_normal(nn) * np.exp(-np.arange(nn) / nn * 5); i0 = int(51.0 * SR)
L[i0:i0 + nn] += 0.35 * sw * np.linspace(1, 0.2, nn); R[i0:i0 + nn] += 0.35 * sw * np.linspace(1, 0.2, nn)  # swish (net)
kit.place(L, R, 'cinematic-drum-big', 52.05, 0.6)
kit.place(L, R, 'faller-2s-soft', 55.3, 0.4)                 # one problem
kit.shot(L, R, 'rumble-quake', 58.7, 0.55)                   # eats the planet
kit.place(L, R, 'impact-deep-hard', 59.4, 0.7)
kit.place(L, R, 'impact-medium-soft', 63.35, 0.55)           # probably once

VL = np.zeros(N); VR = np.zeros(N); n = min(N, len(V)); VL[:n] = V[:n, 0]; VR[:n] = V[:n, 1]
env = np.convolve(np.abs(VL), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same'); duck = 1 - 0.4 * np.clip(env / (env.max() * 0.3), 0, 1)
L = L * duck + VL; R = R * duck + VR
fo = int(0.4 * SR); L[-fo:] *= np.linspace(1, 0, fo); R[-fo:] *= np.linspace(1, 0, fo)
X = np.stack([L, R], 1).astype(np.float32)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af',
                'acompressor=threshold=-20dB:ratio=3:attack=10:release=200,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.7:level=false', '-ar', str(SR), out_p], input=X.tobytes(), check=True)
print('mix', out_p, TOTAL)
