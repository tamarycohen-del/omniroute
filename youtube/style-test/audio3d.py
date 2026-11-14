"""3D host test: bouncy plucks + whoosh on the snap zoom, pop on the shock, chuckle bounce, ting on the thumbs up."""
import wave
import numpy as np
from audio_lib import *
F = lambda f: f / 30
mus = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
seq = [60, 64, 67, 72, 67, 64, 65, 69]
k = 0; t = 0.0
while t < DUR - 0.4:
    if not (F(45) <= t < F(60)):
        place(mus, pluck(midi(seq[k % 8]), 0.3, 0.55), t, 0.18); place(mus, pluck(midi(seq[k % 8] - 24), 0.4, 0.3), t, 0.12) if k % 2 == 0 else None
    k += 1; t += 0.25
place(sfx, whoosh(0.35), F(42), 0.6)
def pop():
    n = int(0.25 * SR); tt = np.arange(n) / SR; f = 300 + 900 * np.exp(-tt * 25)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14)).astype(np.float32)
place(sfx, pop(), F(48), 0.7)
place(sfx, thunk(70, 0.3), F(49), 0.5)
for i in range(6): place(sfx, pluck(midi(76 + (i % 2) * 3), 0.12, 0.8), F(108) + i * 0.17, 0.12)
place(sfx, whoosh(0.3), F(163), 0.4)
place(sfx, ting(), F(209), 0.5)
mix = mus + sfx
mix *= 0.6 / max(1e-6, np.abs(mix).max())
with wave.open('audio3d.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print('ok', DUR)
