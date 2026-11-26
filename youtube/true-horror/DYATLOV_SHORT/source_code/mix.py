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
TOTAL = LN[-1]['e'] + 2.6
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
for i in (6, 8):
    M *= 1 - 0.85 * np.clip(1 - np.abs(t - (S(i) + 0.4)) / 0.9, 0, 1)

M /= np.max(np.abs(M)) + 1e-9
L = M * 0.16; R = M.copy() * 0.16
R = np.roll(R, int(0.012 * SR))  # width

kit = Kit(SR)
# ---- beds ----
kit.bed(L, R, 'wind-gale', 0, TOTAL, gain=0.26, fade=1.2)
kit.bed(L, R, 'room_tone-quiet', S(13), E(15), gain=0.3)


# ---- snow steps (synth crunch: band-limited noise bursts) ----
def crunch(at, g=0.35, pan=0.0):
    n = int(0.22 * SR); x = rng.standard_normal(n); x = np.diff(np.concatenate([[0], x]))
    x *= np.exp(-np.arange(n) / SR * 18) * (rng.random(n) > 0.55)
    i0 = int(at * SR); b = min(N, i0 + n)
    L[i0:b] += x[:b - i0] * g * (1 - pan) ** 0.5; R[i0:b] += x[:b - i0] * g * (1 + pan) ** 0.5


for k in range(8):
    crunch(S(1) + 0.1 + k * 0.4, 0.12, pan=-0.3 + k * 0.08)        # walking into the dark
for k in range(6):
    crunch(S(7) + 0.3 + k * 0.45, 0.10, pan=0.2)                    # searchers
for k in range(8):
    crunch(S(10) + 0.2 + k * 0.38, 0.08, pan=-0.2 + k * 0.05)       # sock prints

# geiger-counter clicks on the radiation line
for k in range(40):
    at = S(14) + rng.random() * (E(14) - S(14) + 0.4); i0 = int(at * SR); n = int(0.004 * SR)
    L[i0:i0 + n] += 0.5 * rng.standard_normal(n) * np.exp(-np.arange(n) / n * 4); R[i0:i0 + n] += 0.5 * rng.standard_normal(n) * np.exp(-np.arange(n) / n * 4)

# ---- hits on the reveals ----
kit.place(L, R, 'whoosh-slow-soft', 0.05, 0.5)
kit.shot(L, R, 'paper-rip', S(0) + 2.6, 0.45)                     # cut their way out
kit.place(L, R, 'impact-deep-soft', S(5) + 2.6, 0.7)              # Dead Mountain
kit.place(L, R, 'impact-deep-firm', S(6) + 0.2, 0.8)              # never came back
kit.place(L, R, 'riser-2s-soft', S(8) + 0.4, 0.45)
kit.shot(L, R, 'paper-rip', S(8) + 1.4, 0.6)                      # from the inside
kit.place(L, R, 'impact-heavy-hard', S(8) + 1.9, 0.7)
kit.place(L, R, 'impact-light-soft', S(9) + 0.6, 0.5)             # boots
kit.shot(L, R, 'stream-trickle', S(12) + 0.2, 0.35)               # ravine in May
kit.shot(L, R, 'page-turn', S(13) + 0.3, 0.5)
kit.place(L, R, 'impact-medium-firm', S(15) + 1.6, 0.6)           # case closed stamp
kit.shot(L, R, 'rumble-quake', S(16), 0.5)                        # avalanche
kit.place(L, R, 'impact-heavy-soft', S(17) + 0.4, 0.55)
kit.place(L, R, 'cinematic-drum-big', S(18) + 0.3, 0.6)           # why
kit.place(L, R, 'impact-deep-hard', E(19) + 0.25, 0.85)           # end card
kit.shot(L, R, 'wind-window', E(19) - 1.0, 0.3)

# ---- voice on top, music ducked under speech ----
VL = np.zeros(N); VR = np.zeros(N); n = min(N, len(V)); VL[:n] = V[:n, 0]; VR[:n] = V[:n, 1]
env = np.abs(VL)
k = int(0.25 * SR); env = np.convolve(env, np.ones(k) / k, mode='same'); duck = 1 - 0.35 * np.clip(env / (env.max() * 0.3), 0, 1)
L = L * duck + VL; R = R * duck + VR
fo = int(1.0 * SR); L[-fo:] *= np.linspace(1, 0, fo); R[-fo:] *= np.linspace(1, 0, fo)
X = np.stack([L, R], 1).astype(np.float32)
p = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af',
                    'acompressor=threshold=-20dB:ratio=3:attack=10:release=200,loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89', '-ar', str(SR), out_p], input=X.tobytes())
print('mix', out_p, f'{TOTAL:.2f}s')
