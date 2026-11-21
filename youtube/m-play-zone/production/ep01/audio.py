"""Build the EP01 soundtrack: VO + synthesized music bed and SFX."""
import subprocess, os
import numpy as np
from render import segs, TOTAL, A, OUT

SR = 44100
N = int((TOTAL + 0.5) * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3)

def load(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

def put(buf, x, at, gain=1.0):
    i = int(at * SR); j = min(N, i + len(x))
    if i < N: buf[i:j] += x[: j - i] * gain

def env(n, a=0.005, r=0.3):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.exp(-np.linspace(0, 6, nr))
    return e

def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")

def boom(d=1.4, f0=55):
    n = int(d * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 1.5 * np.exp(-tt * 18))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
    s += lowpass(rng.normal(0, 1, n), 40) * np.exp(-tt * 14) * 0.8
    return s

def tick():
    n = int(0.05 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2200 * tt) + 0.5 * rng.normal(0, 1, n)) * np.exp(-tt * 140)

def whoosh(d=0.45):
    n = int(d * SR); x = rng.normal(0, 1, n)
    x = lowpass(x, 6) - lowpass(x, 60)
    return x * np.sin(np.linspace(0, np.pi, n)) ** 2

def chime():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * tt) for f in (523.25, 659.25, 783.99, 1046.5)) * np.exp(-tt * 2.5) / 4

def heartbeat():
    n = int(0.6 * SR); tt = np.arange(n) / SR
    b = np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 25)
    out = np.zeros(n); out += b
    k = int(0.22 * SR); out[k:] += b[: n - k] * 0.7
    return out

def creak(d=0.9):
    n = int(d * SR); tt = np.arange(n) / SR
    f = 320 + 90 * np.sin(2 * np.pi * 3.1 * tt) + 40 * rng.normal(0, 1, n).cumsum() / np.sqrt(n)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    return lowpass(s, 8) * env(n, 0.05, 0.4)

seg = {s["key"]: s for s in segs}

# --- music bed: dark drone + pulse, ducked in the pre-survivor silence
music = (0.5 * np.sin(2 * np.pi * 55 * t) + 0.35 * np.sin(2 * np.pi * 82.4 * t + 0.3)
         + 0.2 * np.sin(2 * np.pi * 110.3 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t))
music += lowpass(rng.normal(0, 1, N), 120) * 0.6
pulse = (np.sin(2 * np.pi * 1.6 * t) > 0.92).astype(float)
music += lowpass(pulse, 400) * np.sin(2 * np.pi * 45 * t) * 1.2
rise = np.clip((t - seg["r4"]["t0"]) / 4, 0, 1)
music *= 0.55 + 0.45 * rise * 0 + 0.0  # keep steady
duck = np.ones(N)
a, b = seg["o4"]["sp_end"], seg["o4"]["t1"]
duck[int(a * SR):int(b * SR)] = 0.15
music *= duck
fade = np.clip((TOTAL + 0.3 - t) / 0.8, 0, 1)
music *= np.minimum(1, t / 0.3) * fade
music = music / np.abs(music).max() * 0.12

sfx = np.zeros(N)
put(sfx, creak(), 0.0, 0.5)
put(sfx, boom(1.2, 48), 0.0, 0.6)
s = seg["pick"]
for k in range(int((s["t1"] - s["t0"]) / 0.5) + 1):
    put(sfx, tick(), s["t0"] + 0.1 + k * 0.5, 0.35 if k % 2 == 0 else 0.22)
for key in ("o1", "r1", "o2", "r2", "o3", "r3", "o4", "r4", "twist", "end"):
    put(sfx, whoosh(), seg[key]["t0"] - 0.2, 0.35)
for key in ("r1", "r2", "r3"):
    put(sfx, boom(1.0, 70), seg[key]["sp_end"], 0.8)
put(sfx, boom(0.8, 90), seg["r4"]["sp_end"], 0.4)
put(sfx, chime(), seg["r4"]["sp_end"], 0.55)
# alarm under the first half of r4
r4 = seg["r4"]; n = int((r4["t1"] - r4["t0"]) * 0.45 * SR); tt = np.arange(n) / SR
siren = np.sin(2 * np.pi * (600 + 250 * (np.sin(2 * np.pi * 1.2 * tt) > 0)) * tt) * 0.12
put(sfx, siren * env(n, 0.05, 0.3), r4["t0"], 1)
for k in range(3):
    put(sfx, heartbeat(), seg["o4"]["t0"] + 0.3 + k * 0.85, 0.7)
put(sfx, boom(1.8, 40), seg["twist"]["t0"] + 1.0, 0.8)
put(sfx, creak(), seg["end"]["t1"] - 0.9, 0.4)

vo = np.zeros(N)
for sg in segs:
    put(vo, load(f"{A}/vo/{sg['line']}.mp3"), sg["t0"], 1.0)
vo = vo / np.abs(vo).max() * 0.9

mix = vo + music + sfx * 0.6
mix = np.tanh(mix * 1.1) * 0.92
mix = mix[: int(TOTAL * SR)]
wav = os.path.join(OUT, "mix.wav")
st = np.stack([mix, mix], 1).astype(np.float32)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", wav], input=st.tobytes(), check=True)
print("audio ok", wav)
