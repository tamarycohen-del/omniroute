#!/usr/bin/env python3
"""Biscuit's voice, synthesized (no samples): source-filter model of a small dog.

bark(): a glottal pulse train with a fast rising-then-falling pitch (about 500 -> 780 -> 400 Hz),
        jitter/shimmer, a rough subharmonic and an air burst at the onset, shaped by time-varying
        formants (the mouth opens on "r-" and closes on "-uff"), then a short room reverb.
growl(): low, irregular glottal pulses (about 110-150 Hz with heavy jitter) through a closed-mouth
        vocal tract, slow swells, breathy noise, teeth "clicks" on the attack.
    python3 dogvoice.py  -> dog_test.wav (barks + growl demo)
"""
import numpy as np

SR = 48000
_rng = np.random.default_rng(11)


def _smooth_noise(n, cut_hz, rng):
    x = rng.standard_normal(n); k = np.exp(-2 * np.pi * cut_hz / SR); y = np.empty(n); s = 0.0
    for i in range(n): s = k * s + (1 - k) * x[i]; y[i] = s
    return y / (np.std(y) + 1e-9)


def _formants(src, freqs, bws, gains):
    """Time-varying 2-pole resonators in parallel. freqs/bws: arrays (n_formants, n) per sample."""
    n = len(src); out = np.zeros(n)
    for f, b, g in zip(freqs, bws, gains):
        r = np.exp(-np.pi * b / SR); c1 = 2 * r * np.cos(2 * np.pi * f / SR); c2 = -r * r
        y1 = y2 = 0.0; y = np.empty(n); a = (1 - r)
        for i in range(n):
            v = a[i] * src[i] + c1[i] * y1 + c2[i] * y2; y[i] = v; y2, y1 = y1, v
        out += g * y
    return out


def _glottal(f0, rng, jitter=0.02, open_q=0.55):
    """Pulse train following f0 (per-sample array); Rosenberg-like pulses with jitter and shimmer."""
    n = len(f0); out = np.zeros(n); t = 0.0
    while t < n:
        i = int(t); f = f0[min(i, n - 1)] * (1 + jitter * rng.standard_normal())
        period = SR / max(f, 30); L = int(period * open_q)
        if L > 2:
            k = np.arange(L) / L; pulse = np.where(k < 0.6, 0.5 * (1 - np.cos(np.pi * k / 0.6)), np.cos(np.pi / 2 * (k - 0.6) / 0.4))
            amp = 1 + 0.12 * rng.standard_normal(); j = i + L
            if j > n: pulse = pulse[: n - i]; j = n
            out[i:j] += np.diff(np.concatenate([[0], pulse])) * amp  # differentiated flow = radiated pressure
        t += period
    return out


def _reverb(x, rt=0.25, mix=0.18, rng=None, pre=0.004):
    rng = rng or _rng; L = int(rt * SR); t = np.arange(L) / SR
    ir = rng.standard_normal(L) * np.exp(-6.9 * t / rt); ir[: int(pre * SR)] = 0
    ir = ir / np.sqrt(np.sum(ir ** 2)); wet = np.convolve(x, ir)[: len(x) + L]; wet = np.concatenate([wet, np.zeros(len(x) + L - len(wet))])
    dry = np.concatenate([x, np.zeros(L)])
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x)) / (np.max(np.abs(wet)) + 1e-9)


def bark(seed=0, size=1.0, pitch=1.0, dur=None, room=0.18):
    """One bark of a small dog (dachshund). size>1 = bigger dog (lower formants)."""
    rng = np.random.default_rng(1000 + seed)
    d = dur or (0.17 + 0.07 * rng.random()); n = int(d * SR); u = np.linspace(0, 1, n)
    # pitch: quick rise to a peak at ~22%, then a fall; small dogs bark around 450-800 Hz
    p0, pk, pe = 470 * pitch, (760 + 80 * rng.random()) * pitch, 390 * pitch
    f0 = np.where(u < 0.22, p0 + (pk - p0) * np.sin(np.pi / 2 * u / 0.22), pk + (pe - pk) * np.clip((u - 0.22) / 0.78, 0, 1) ** 1.3)
    f0 = f0 * (1 + 0.03 * _smooth_noise(n, 30, rng))
    src = _glottal(f0, rng, jitter=0.035)
    # roughness: subharmonic (period doubling) at the onset, as in real barks
    rough = np.exp(-u / 0.25); sub = _glottal(f0 / 2, rng, jitter=0.05) * 0.55 * rough
    # aspiration / air burst
    air = rng.standard_normal(n) * (0.9 * np.exp(-u / 0.08) + 0.15)
    air = np.diff(np.concatenate([[0], air]))
    s = src + sub + 0.08 * air
    # mouth: opens fast ("r"), stays open, closes at the end ("uff")
    open_ = np.clip(np.minimum(u / 0.12, 1) * np.minimum((1 - u) / 0.35, 1), 0, 1)
    sz = 1 / size
    F = np.array([(520 + 680 * open_) * sz, (1750 + 650 * open_) * sz, (3300 + 300 * open_) * sz, np.full(n, 4600 * sz)])
    B = np.array([np.full(n, 160.0), np.full(n, 220.0), np.full(n, 320.0), np.full(n, 450.0)])
    y = _formants(s, F, B, [1.0, 0.7, 0.35, 0.18])
    # nasal "huff" tail: filtered noise as the mouth closes
    tail = _formants(rng.standard_normal(n) * np.clip((u - 0.65) / 0.35, 0, 1) ** 2, np.array([np.full(n, 900.0), np.full(n, 2500.0)]), np.array([np.full(n, 400.0), np.full(n, 600.0)]), [0.3, 0.15])
    y = y + tail
    env = np.minimum(1, u / 0.025) * (0.75 + 0.25 * np.cos(np.pi * np.clip(u, 0, 1))) * np.minimum(1, (1 - u) / 0.12)
    y = y * env
    y = y / (np.max(np.abs(y)) + 1e-9)
    return _reverb(y, rt=0.22 if room else 0.05, mix=room, rng=rng)


def bark_run(times, seed=0, room=0.18, pitch=1.0):
    """Several barks at the given start times (seconds) -> one signal."""
    parts = [(t, bark(seed + i, pitch=pitch * (1 + 0.04 * np.sin(i * 2.3)), room=room) * (0.85 + 0.15 * np.cos(i))) for i, t in enumerate(times)]
    n = int((max(t for t, _ in parts) + 0.6) * SR); out = np.zeros(n)
    for t, b in parts:
        i = int(t * SR); out[i:i + len(b)] += b[: n - i]
    return out / (np.max(np.abs(out)) + 1e-9)


def growl(dur=2.2, seed=0, room=0.15):
    rng = np.random.default_rng(2000 + seed); n = int(dur * SR); u = np.linspace(0, 1, n)
    f0 = (128 + 22 * _smooth_noise(n, 3, rng)) * (1 + 0.08 * np.sin(2 * np.pi * 0.6 * u * dur))
    src = _glottal(f0, rng, jitter=0.16, open_q=0.35)                # very irregular pulses = "grrr"
    flutter = 1 + 0.45 * np.sin(2 * np.pi * 23 * u * dur + 2 * _smooth_noise(n, 8, rng))   # vocal fold flutter
    breath = rng.standard_normal(n) * 0.05
    s = src * flutter + breath * (0.6 + 0.4 * flutter)
    F = np.array([np.full(n, 430.0) + 40 * _smooth_noise(n, 2, rng), np.full(n, 1250.0), np.full(n, 2500.0), np.full(n, 3600.0)])
    B = np.array([np.full(n, 140.0), np.full(n, 200.0), np.full(n, 300.0), np.full(n, 420.0)])
    y = _formants(s, F, B, [1.0, 0.55, 0.25, 0.12])
    swell = (0.55 + 0.45 * np.clip(_smooth_noise(n, 1.2, rng) * 0.6 + 0.6, 0, 1)) * np.minimum(1, u / 0.12) * np.minimum(1, (1 - u) / 0.1)
    y = y * swell
    k = np.exp(-2 * np.pi * 2600 / SR); z = np.empty(n); acc = 0.0
    for i in range(n): acc = k * acc + (1 - k) * y[i]; z[i] = acc     # soften the top end (closed mouth)
    sub = np.sin(2 * np.pi * np.cumsum(f0 * 0.5) / SR) * swell * 0.25   # chest rumble
    y = z / (np.max(np.abs(z)) + 1e-9) + sub
    y = y / (np.max(np.abs(y)) + 1e-9)
    return _reverb(y, rt=0.2, mix=room, rng=rng)


if __name__ == '__main__':
    import wave, os
    here = os.path.dirname(os.path.abspath(__file__))
    demo = np.concatenate([bark_run([0, 0.32, 0.9, 1.15, 1.45]), np.zeros(int(0.6 * SR)), growl(), np.zeros(int(0.4 * SR)), bark_run([0, 0.28, 0.56, 0.8, 1.2, 1.42], seed=7, room=0.3)])
    demo = demo / np.max(np.abs(demo)) * 0.9
    with wave.open(os.path.join(here, 'dog_test.wav'), 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((demo * 32767).astype(np.int16).tobytes())
    print('ok', round(len(demo) / SR, 2))


def bark2(seed=0, style='woof', room=0.18):
    """Rougher, more realistic bark. style: 'yap' (small, high), 'woof' (dachshund, deeper), 'rough' (woof + chaos)."""
    rng = np.random.default_rng(3000 + seed)
    P = {'yap': dict(d=0.13, p0=650, pk=980, pe=560, F1=(700, 1500), F2=(1900, 2700), jit=0.04, noise=0.12, sub=0.35),
         'woof': dict(d=0.19, p0=360, pk=560, pe=300, F1=(450, 1100), F2=(1300, 2000), jit=0.05, noise=0.15, sub=0.5),
         'rough': dict(d=0.2, p0=340, pk=540, pe=280, F1=(450, 1050), F2=(1250, 1950), jit=0.09, noise=0.3, sub=0.8)}[style]
    d = P['d'] * (0.9 + 0.2 * rng.random()); n = int(d * SR); u = np.linspace(0, 1, n)
    f0 = np.where(u < 0.18, P['p0'] + (P['pk'] - P['p0']) * np.sin(np.pi / 2 * u / 0.18), P['pk'] + (P['pe'] - P['pk']) * np.clip((u - 0.18) / 0.82, 0, 1) ** 0.8)
    f0 = f0 * (1 + 0.05 * _smooth_noise(n, 60, rng))
    src = _glottal(f0, rng, jitter=P['jit'], open_q=0.42)
    chaos = np.exp(-u / 0.35)                                     # chaotic onset, steadier tail
    sub = _glottal(f0 / 2, rng, jitter=P['jit'] * 1.5, open_q=0.4) * P['sub'] * chaos
    # pulse-synchronous noise: turbulence that follows the glottal pulses (makes it harsh, not tonal)
    pulses = np.abs(src) / (np.max(np.abs(src)) + 1e-9)
    k = np.exp(-2 * np.pi * 180 / SR); pe_ = np.empty(n); a = 0.0
    for i in range(n): a = max(pulses[i], a * k); pe_[i] = a
    turb = rng.standard_normal(n) * pe_ * P['noise'] * (0.6 + 0.8 * chaos)
    click = np.zeros(n); click[:int(0.004 * SR)] = rng.standard_normal(int(0.004 * SR)) * 0.8   # plosive attack
    s = src + sub + turb + click
    open_ = np.clip(np.minimum(u / 0.08, 1) * np.minimum((1 - u) / 0.45, 1), 0, 1)
    F = np.array([P['F1'][0] + (P['F1'][1] - P['F1'][0]) * open_, P['F2'][0] + (P['F2'][1] - P['F2'][0]) * open_, np.full(n, 3200.0), np.full(n, 4300.0), np.full(n, 260.0)])
    B = np.array([np.full(n, 260.0), np.full(n, 330.0), np.full(n, 420.0), np.full(n, 520.0), np.full(n, 120.0)])
    y = _formants(s, F, B, [1.0, 0.8, 0.45, 0.25, 0.35])        # last one = chest/body resonance
    env = np.minimum(1, u / 0.012) * np.exp(-u * 1.6) * np.minimum(1, (1 - u) / 0.15)
    y = np.tanh(1.3 * y * env / (np.max(np.abs(y * env)) + 1e-9))   # a little saturation, like a strained throat
    y = y / (np.max(np.abs(y)) + 1e-9)
    return _reverb(y, rt=0.22 if room else 0.05, mix=room, rng=rng)


def bark2_run(times, style='woof', seed=0, room=0.18):
    parts = [(t, bark2(seed + i, style, room) * (0.85 + 0.15 * np.cos(i * 1.7))) for i, t in enumerate(times)]
    n = int((max(t for t, _ in parts) + 0.6) * SR); out = np.zeros(n)
    for t, b in parts:
        i = int(t * SR); out[i:i + len(b)] += b[: n - i]
    return out / (np.max(np.abs(out)) + 1e-9)
