import wave
import numpy as np
from audio_lib import *
F = lambda f: (f - 5000) / 30
mus = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
seq = [72, 76, 79, 76, 74, 77, 81, 77]
k = 0; t = 0.0
while t < DUR - 0.3:
    place(mus, pluck(midi(seq[k % 8]), 0.35, 0.5), t, 0.15)
    if k % 2 == 0: place(mus, pluck(midi(seq[k % 8] - 24), 0.5, 0.3), t, 0.12)
    k += 1; t += 0.28
for f in (5070, 5120, 5170): place(sfx, whoosh(0.3), F(f) - 0.15, 0.5)
for j in range(9): place(sfx, ting(), F(5124 + 4 * (j + 1)), 0.18)
def pop():
    n = int(0.25 * SR); tt = np.arange(n) / SR; fr = 300 + 900 * np.exp(-tt * 25)
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 14)).astype(np.float32)
place(sfx, pop(), F(5184), 0.7); place(sfx, thunk(70, 0.3), F(5178), 0.45)
mix = mus + sfx; mix *= 0.6 / max(1e-6, np.abs(mix).max())
with wave.open('audion.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print('ok')
