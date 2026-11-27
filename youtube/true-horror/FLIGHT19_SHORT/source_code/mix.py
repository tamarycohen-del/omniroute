"""HINTERKAIFECK audio mix: narration + original music (numpy) + CC0 SFX (sfx-kit / earshot).
usage: python mix.py <narration.wav> <lines.json> <out.wav>
Music is generated here from scratch (drone + rising pulse + dissonant pad), so it is original and free.
"""
import json, subprocess, sys, os
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'tools'))
from sfxkit import Kit

SR = 48000
nar_p, lines_p, out_p = sys.argv[1:4]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', nar_p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
V = np.frombuffer(raw, np.float32).reshape(-1, 2)
LN = json.load(open(lines_p))
TOTAL = LN[-1]['e'] + 1.3
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
S = lambda i: LN[i]['s']
E = lambda i: LN[i]['e']


def env_ramp(t0, t1, v0, v1):
    return np.interp(t, [0, t0, t1, TOTAL], [v0, v0, v1, v1])

# ---- music ----
M = np.zeros(N)
# drone: A1 + E2 detuned, slow swell, tension grows over the piece
for f, g in [(43.65, 0.5), (43.95, 0.4), (65.4, 0.3), (87.3, 0.12)]:  # F drone (key of the music box)
    M += g * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
M *= 0.55 + 0.25 * np.sin(2 * np.pi * 0.05 * t) ** 2
M *= env_ramp(S(5), E(18), 0.7, 1.3)
# high dissonant pad (rises in the second half): Bb4 against A4
pad = 0.06 * (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 466.2 * t)) * env_ramp(S(9), E(18), 0.0, 1.0)
M += pad
# heartbeat-like low pulse from "unsettling" to "unsolved"
for at in np.arange(S(9), E(18), 0.86):
    i0 = int(at * SR); n = int(0.35 * SR); tt = np.arange(n) / SR
    thump = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 14)
    for d, g in [(0, 0.55), (0.18, 0.35)]:
        j = i0 + int(d * SR); b = min(N, j + n); M[j:b] += g * thump[:b - j] * np.interp(at, [S(9), E(18)], [0.4, 1.0])
# music drops out on the hard facts (killed, who) for a beat
for i in (1, 12):
    M *= 1 - 0.85 * np.clip(1 - np.abs(t - (S(i) + 0.4)) / 0.9, 0, 1)

M /= np.max(np.abs(M)) + 1e-9
L = M * 0.16; R = M.copy() * 0.16
R = np.roll(R, int(0.012 * SR))  # width

kit = Kit(SR)
# ---- beds ----
kit.bed(L, R, 'waves-rocks', 0, TOTAL, gain=0.16, fade=1.2)
kit.bed(L, R, 'wind-gale', S(5), E(10), gain=0.18)
kit.bed(L, R, 'rain-water', S(9), E(12), gain=0.25)


# ---- synth layers: propeller drone (formation) and radio static ----
def engine(t0, t1, g=0.12):
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR)); tt = np.arange(i1 - i0) / SR
    x = sum(np.sign(np.sin(2 * np.pi * f * tt)) * w for f, w in [(38, 0.5), (38.6, 0.4), (76.5, 0.2)]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * tt) ** 2)
    k = int(0.8 * SR); env = np.ones(len(tt)); env[:k] = np.linspace(0, 1, min(k, len(tt))); env[-k:] = np.minimum(env[-k:], np.linspace(1, 0, min(k, len(tt))))
    x = np.convolve(x, np.ones(40) / 40, mode='same') * env * g; L[i0:i1] += x; R[i0:i1] += x


def static(t0, t1, g=0.05):
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR)); x = rng.standard_normal(i1 - i0) * (rng.random(i1 - i0) > 0.3); x = np.diff(np.concatenate([[0], x]))
    x *= g * (0.5 + 0.5 * np.abs(np.sin(np.arange(i1 - i0) / SR * 7))); L[i0:i1] += x; R[i0:i1] += x


engine(0.0, E(0) + 0.5, 0.10); engine(S(3), E(5), 0.08); engine(S(9), E(9) + 0.5, 0.06)
static(S(6), E(6), 0.03); static(S(10), E(10) + 0.6, 0.07); static(S(18), E(18), 0.02)

# ---- hits on the reveals ----
kit.place(L, R, 'whoosh-slow-soft', 0.05, 0.5)
kit.place(L, R, 'impact-deep-firm', E(0) - 0.2, 0.75)             # ...and vanished
kit.place(L, R, 'impact-heavy-hard', E(1) - 0.3, 0.7)             # vanished too
kit.place(L, R, 'riser-2s-soft', S(5) + 0.3, 0.45)                # something went wrong
kit.place(L, R, 'impact-light-firm', S(6) + 0.8, 0.55)            # compasses
kit.place(L, R, 'impact-medium-soft', S(8) + 0.6, 0.5)            # far out over the ocean
kit.shot(L, R, 'thunder-crack', S(9) + 0.5, 0.45)
kit.shot(L, R, 'thunder-roll', S(9) + 2.0, 0.4)
kit.place(L, R, 'impact-deep-firm', S(12) + 0.2, 0.75)            # never came back either
kit.shot(L, R, 'rumble-quake', S(13) + 0.3, 0.3)                  # flames on the water
kit.place(L, R, 'impact-deep-soft', S(15) + 0.2, 0.6)             # 27 men
kit.shot(L, R, 'page-turn', S(16) + 0.2, 0.5)
kit.place(L, R, 'impact-medium-firm', S(16) + 2.0, 0.6)           # verdict stamp
kit.place(L, R, 'cinematic-drum-big', S(17) + 2.0, 0.6)           # Bermuda Triangle
kit.place(L, R, 'impact-deep-hard', E(19) + 0.25, 0.85)           # end card
kit.shot(L, R, 'thunder-roll', E(19) + 0.3, 0.35)

# ---- voice on top, music ducked under speech ----
VL = np.zeros(N); VR = np.zeros(N); n = min(N, len(V)); VL[:n] = V[:n, 0]; VR[:n] = V[:n, 1]
env = np.abs(VL)
k = int(0.25 * SR); env = np.convolve(env, np.ones(k) / k, mode='same'); duck = 1 - 0.35 * np.clip(env / (env.max() * 0.3), 0, 1)
L = L * duck + VL; R = R * duck + VR
fo = int(0.4 * SR); L[-fo:] *= np.linspace(1, 0, fo); R[-fo:] *= np.linspace(1, 0, fo)
X = np.stack([L, R], 1).astype(np.float32)
p = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af',
                    'acompressor=threshold=-20dB:ratio=3:attack=10:release=200,loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89', '-ar', str(SR), out_p], input=X.tobytes())
print('mix', out_p, f'{TOTAL:.2f}s')
