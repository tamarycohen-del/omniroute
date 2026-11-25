"""HINTERKAIFECK audio mix: narration + original music (numpy) + CC0 SFX (sfx-kit / earshot).
usage: python mix.py <narration.wav> <lines.json> <out.wav>
Music is generated here from scratch (drone + sparse piano + rising pulse), so it is original and free.
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
for f, g in [(55, 0.5), (55.4, 0.4), (82.4, 0.3), (110.3, 0.12)]:
    M += g * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
M *= 0.55 + 0.25 * np.sin(2 * np.pi * 0.05 * t) ** 2
M *= env_ramp(S(5), E(18), 0.7, 1.3)
# high dissonant pad (rises in the second half): Bb4 against A4
pad = 0.06 * (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 466.2 * t)) * env_ramp(S(9), E(18), 0.0, 1.0)
M += pad
# sparse piano: A minor notes, decaying sines with 2 harmonics
notes = [220, 261.6, 329.6, 196, 220, 174.6, 164.8, 220]
for k, at in enumerate(np.arange(0.4, TOTAL - 3, 3.4)):
    f = notes[k % len(notes)]; i0 = int(at * SR); n = int(3.2 * SR); tt = np.arange(n) / SR
    tone = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 1.6) * (1 - np.exp(-tt * 300))
    b = min(N, i0 + n); M[i0:b] += 0.32 * tone[:b - i0]
# heartbeat-like low pulse from "unsettling" to "unsolved"
for at in np.arange(S(9), E(18), 0.86):
    i0 = int(at * SR); n = int(0.35 * SR); tt = np.arange(n) / SR
    thump = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 14)
    for d, g in [(0, 0.55), (0.18, 0.35)]:
        j = i0 + int(d * SR); b = min(N, j + n); M[j:b] += g * thump[:b - j] * np.interp(at, [S(9), E(18)], [0.4, 1.0])
# music drops out on the hard facts (killed, who) for a beat
for i in (6, 14):
    M *= 1 - 0.85 * np.clip(1 - np.abs(t - (S(i) + 0.4)) / 0.9, 0, 1)
M /= np.max(np.abs(M)) + 1e-9
L = M * 0.16; R = M.copy() * 0.16
R = np.roll(R, int(0.012 * SR))  # width

kit = Kit(SR)
# ---- beds ----
kit.bed(L, R, 'wind-gale', 0, TOTAL, gain=0.20, fade=1.2)
kit.bed(L, R, 'wind-window', S(3), E(4), gain=0.18)
kit.bed(L, R, 'room_tone-quiet', S(10), E(11), gain=0.3)


# ---- snow steps (synth crunch: band-limited noise bursts) ----
def crunch(at, g=0.35, pan=0.0):
    n = int(0.22 * SR); x = rng.standard_normal(n); x = np.diff(np.concatenate([[0], x]))  # high-ish
    x *= np.exp(-np.arange(n) / SR * 18) * (rng.random(n) > 0.55)
    i0 = int(at * SR); b = min(N, i0 + n)
    L[i0:b] += x[:b - i0] * g * (1 - pan) ** 0.5; R[i0:b] += x[:b - i0] * g * (1 + pan) ** 0.5


for k in range(7):
    crunch(S(1) + 0.1 + k * 0.48, 0.14, pan=-0.4 + k * 0.12)
for k in range(8):
    crunch(S(8) + 0.2 + k * 0.42, 0.10, pan=0.2)

# ---- hits on the reveals ----
kit.place(L, R, 'whoosh-slow-soft', 0.05, 0.5)
kit.place(L, R, 'impact-deep-soft', S(2) + 0.9, 0.7)            # no footprints back
kit.shot(L, R, 'floor-creak', S(3) + 0.5, 0.9, pan=0.3)          # attic
kit.shot(L, R, 'step-floorboard', S(3) + 1.6, 0.6, pan=-0.3)
kit.shot(L, R, 'floor-creak', S(4) + 1.2, 0.5, pan=-0.5)
kit.shot(L, R, 'thunder-roll', S(5) - 0.2, 0.65)                 # March 31
kit.place(L, R, 'impact-deep-firm', S(6) + 0.3, 0.8)             # six people
kit.shot(L, R, 'page-turn', S(7) + 0.3, 0.6)                     # calendar days
kit.shot(L, R, 'page-turn', S(7) + 1.1, 0.5)
kit.shot(L, R, 'page-turn', S(7) + 1.9, 0.5)
kit.shot(L, R, 'door-creak', S(8) + 2.0, 0.6)                    # neighbours enter
kit.place(L, R, 'riser-2s-soft', S(9) + 1.6, 0.5)
kit.shot(L, R, 'thunder-crack', S(10) - 0.1, 0.25)
kit.shot(L, R, 'floor-creak', S(13) + 0.4, 0.7, pan=0.4)         # someone stayed
kit.place(L, R, 'impact-heavy-hard', S(14) + 0.15, 0.75)         # but who?
kit.shot(L, R, 'paper-rip', S(15) + 0.2, 0.25)
kit.shot(L, R, 'page-turn', S(15) + 0.9, 0.5)
kit.place(L, R, 'impact-medium-firm', S(16) + 1.6, 0.6)          # stamp
kit.shot(L, R, 'rumble-quake', S(17), 0.45)                      # demolition
kit.place(L, R, 'impact-heavy-soft', S(17) + 1.2, 0.6)
kit.place(L, R, 'cinematic-drum-big', E(18) - 0.25, 0.7)         # unsolved
kit.place(L, R, 'impact-deep-hard', E(19) + 0.25, 0.85)          # end card
kit.shot(L, R, 'thunder-roll', E(19) + 0.3, 0.4)

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
