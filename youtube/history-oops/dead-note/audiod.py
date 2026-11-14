"""Notebook short: storm + thunder on the landing, eerie music box, drill buzz, poof + chime per death, silence and a low boom on 'His.', soft outro."""
import wave
import numpy as np
from audio_lib import *
mus = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def box(t0, t1, seq, beat=0.32, g=0.13):
    k = 0; t = t0
    while t < t1: place(mus, pluck(midi(seq[k % len(seq)]), 0.5, 0.75), t, g); k += 1; t += beat
box(0.0, 11.4, [69, 72, 76, 74, 72, 69, 68, 71])                 # eerie music box (A minor)
box(11.5, 27.9, [69, 72, 76, 72, 74, 77, 76, 72], 0.26, 0.14)   # sneaky, faster
box(27.9, 30.9, [69, 72, 76], 0.36, 0.1)
box(34.9, 41.0, [69, 72, 76, 79, 76, 72], 0.4, 0.11)
place(sfx, (hp_fast(noise(5.5), 800)[: int(5.5 * SR)] * 0.25).astype(np.float32), 0.0, 0.5)   # rain hiss
place(sfx, crash(1.4), 4.55, 0.6); place(sfx, thunk(45, 0.9), 4.55, 0.8)                      # thunder + landing
n = int(1.9 * SR); tt = np.arange(n) / SR
drill = (np.sign(np.sin(2 * np.pi * 120 * tt)) * 0.5 + np.sin(2 * np.pi * 240 * tt) * 0.3) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
place(sfx, lp_fast(drill.astype(np.float32), 2500), 11.25, 0.35); place(sfx, lp_fast(drill[: int(0.9 * SR)].astype(np.float32), 2500), 16.0, 0.3)
def poof():
    m = int(0.4 * SR); x = np.arange(m) / SR
    return (lp_fast(noise(0.4)[:m], 1500) * np.exp(-x * 9)).astype(np.float32)
for t in (16.95, 22.31, 25.09, 26.82): place(sfx, poof(), t, 0.7); place(sfx, ting(), t + 0.25, 0.25)
place(sfx, whoosh(0.5), 29.6, 0.35)
place(sfx, thunk(40, 1.2), 34.06, 0.9); place(sfx, crash(1.0), 34.06, 0.3)
for nm, x in (('music.wav', mus), ('sfx.wav', sfx)):
    with wave.open('dn/' + nm, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
print('ok')
