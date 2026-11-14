"""Sneeze short: light plucks in the car, a rising drone + speeding heartbeat in the windpipe, POP with a drop, ting on HEALED, spray burst on AH-CHOO."""
import wave
import numpy as np
from audio_lib import *
P = [[0, 3.69], [4.28, 5.94], [6.43, 8.75], [9.18, 10.18], [10.69, 12.43], [12.94, 18.88], [19.27, 19.6], [20.11, 22.1], [22.55, 24.1], [24.53, 26.37], [26.75, 28.09]]
CHOO = 27.78; POP = P[6][0] + 0.07
mus = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def plucks(t0, t1, seq, beat=0.27, g=0.14):
    k = 0; t = t0
    while t < t1: place(mus, pluck(midi(seq[k % len(seq)]), 0.3, 0.55), t, g); k += 1; t += beat
plucks(0.0, 10.4, [67, 71, 74, 71, 69, 72, 76, 72])
# windpipe: drone rising in pitch and volume
t0, t1 = 10.5, POP; n = int((t1 - t0) * SR); tt = np.arange(n) / SR; fr = 55 * 2 ** (tt / (t1 - t0) * 1.6)
dr = (np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(fr) / SR)) * (0.15 + 0.85 * (tt / (t1 - t0)) ** 2)
place(mus, lp_fast(dr.astype(np.float32), 900), t0, 0.5)
t = 11.0
while t < POP - 0.1:
    gap = 0.8 - 0.62 * (t - 11) / (POP - 11); place(sfx, thunk(60, 0.12), t, 0.55); place(sfx, thunk(70, 0.1), t + 0.12, 0.35); t += gap
def pop():
    n = int(0.35 * SR); x = np.arange(n) / SR; f = 200 + 1400 * np.exp(-x * 30)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 10)).astype(np.float32)
place(sfx, pop(), POP, 0.9); place(sfx, crash(0.6), POP, 0.35); place(sfx, thunk(50, 0.5), POP, 0.6)
plucks(22.4, 28.6, [72, 76, 79, 76], 0.3, 0.12)
place(sfx, ting(), P[8][0] + 0.67, 0.45)
place(sfx, whoosh(0.4), 4.0, 0.3); place(sfx, whoosh(0.5), 10.4, 0.5)
spray = hp_fast(noise(0.6), 3000)[: int(0.6 * SR)] * np.exp(-np.arange(int(0.6 * SR)) / SR * 6)
place(sfx, spray.astype(np.float32), CHOO, 0.5)
for nm, x in (('music.wav', mus), ('sfx.wav', sfx)):
    with wave.open('snz/' + nm, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
print('ok')
