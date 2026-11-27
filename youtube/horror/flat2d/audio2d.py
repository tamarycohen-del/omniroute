import wave, numpy as np
SR = 48000; DUR = 9.0; N = int(DUR * SR); rng = np.random.default_rng(3)
out = np.zeros(N, np.float32)
def place(sig, t, g=1.0):
    i = int(t * SR); j = min(N, i + len(sig)); out[i:j] += sig[: j - i] * g
t = np.arange(N) / SR
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110 * t)) * 0.12
drone *= np.minimum(1, t / 1.5) * (1 + 0.6 * (t > 6.0))
out += drone.astype(np.float32)
def knock():
    n = int(0.18 * SR); x = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 95 * x) * 0.9 + rng.standard_normal(n) * 0.25) * np.exp(-x * 38)
    return s.astype(np.float32)
for k in [2.0, 2.35, 2.7, 5.2, 5.55]: place(knock(), k, 0.9)
for k in np.arange(0.2, 6.0, 1.0):
    n = int(0.03 * SR); x = np.arange(n) / SR; place((np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 200)).astype(np.float32), k, 0.15)
# sting at the peephole
n = int(2.5 * SR); x = np.arange(n) / SR
sting = sum(np.sin(2 * np.pi * f * x) for f in (220, 233, 311, 466)) / 4 * np.exp(-x * 1.4) * np.minimum(1, x / 0.02)
place(sting.astype(np.float32), 6.0, 0.45)
# breathy whisper texture
n = int(1.6 * SR); x = np.arange(n) / SR; wn = rng.standard_normal(n) * np.sin(np.pi * x / 1.6) ** 2 * 0.08
place(np.convolve(wn, np.ones(30) / 30, 'same').astype(np.float32), 7.0, 1.0)
out *= 0.7 / np.abs(out).max()
with wave.open('a.wav', 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('ok')
