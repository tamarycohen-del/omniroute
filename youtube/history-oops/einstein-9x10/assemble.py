#!/usr/bin/env python3
"""Splice the cold-open hook into the Einstein short.

    python3 assemble.py hook.mp3 plan      -> prints HOOK_SMUG and hook frame range to render
    python3 assemble.py hook.mp3 build     -> final/ (frames, mix_raw.wav, work/captions.ass)

Timeline: hook (frames 2000..) + original 145..1166 + 1217..1675 (drops "Pretty powerful, right?")
+ a 0.5 s loop tail that repeats the first hook frames.
"""
import json, os, re, shutil, subprocess, sys, wave
import numpy as np

SR, FPS = 48000, 30
HERE = os.path.dirname(os.path.abspath(__file__))
KEEP = [(145, 1166), (1217, 1675)]
TAIL = 15
HOOK_LINES = ["Einstein once got nine times ten wrong...", "in front of a whole class.", "And he did it on purpose."]


def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def speech_segments(p):
    out = subprocess.run(["ffmpeg", "-i", p, "-af", "silencedetect=noise=-38dB:d=0.15", "-f", "null", "-"], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    dur = len(load(p)) / SR
    sil = [(s, ends[i] if i < len(ends) else dur) for i, s in enumerate(starts)]
    segs, t = [], 0.0
    for s, e in sil:
        if s > t: segs.append((t, s))
        t = e
    if t < dur: segs.append((t, dur))
    return [(a, b) for a, b in segs if b - a > 0.12]


def plan(hook):
    segs = speech_segments(hook)
    end = segs[-1][1]
    nh = int(round((end + 0.7) * FPS))
    smug = 2000 + int(round((end - 0.15) * FPS))
    return segs, nh, smug


def main():
    hook, mode = sys.argv[1], sys.argv[2]
    segs, nh, smug = plan(hook)
    if mode == "plan":
        print(json.dumps({"segments": segs, "frames": f"2000-{2000 + nh - 1}", "HOOK_SMUG": smug})); return
    fin = os.path.join(HERE, "final"); shutil.rmtree(fin, ignore_errors=True); os.makedirs(os.path.join(fin, "frames")); os.makedirs(os.path.join(fin, "work"))
    order = list(range(2000, 2000 + nh)) + [f for a, b in KEEP for f in range(a, b + 1)] + list(range(2000, 2000 + TAIL))
    for i, f in enumerate(order):
        os.link(os.path.join(HERE, "frames", f"f{f:04d}.jpg"), os.path.join(fin, "frames", f"f{i:04d}.jpg"))
    H = nh / FPS
    # voice
    hv = load(hook)[: int(H * SR)]; hv = np.pad(hv, (0, int(H * SR) - len(hv)))
    v = load(os.path.join(HERE, "voice.mp3"))
    cut = lambda x, a, b: x[int(a / FPS * SR): int((b + 1) / FPS * SR)]
    def fit(x, n): return np.pad(x, (0, max(0, n - len(x))))[:n]
    xf = int(0.03 * SR); ramp = np.linspace(0, 1, xf)
    def join(parts):
        out = parts[0].copy()
        for p in parts[1:]:
            p = p.copy(); p[:xf] *= ramp; out[-xf:] *= ramp[::-1]; out = np.concatenate([out[:-xf], out[-xf:] + p[:xf], p[xf:]])
        return out
    total = len(order) / FPS; N = int(round(total * SR))
    voice = fit(np.concatenate([hv] + [cut(v, a, b) for a, b in KEEP] + [np.zeros(int(TAIL / FPS * SR))]), N)
    mus = load(os.path.join(HERE, "music.wav")); sfx = load(os.path.join(HERE, "sfx.wav"))
    music = fit(join([mus[: int(H * SR)]] + [cut(mus, a, b) for a, b in KEEP] + [mus[: int(TAIL / FPS * SR)]]), N)
    music[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))
    hs = np.zeros(int(H * SR)); sf = fit(np.concatenate([hs] + [cut(sfx, a, b) for a, b in KEEP] + [np.zeros(int(TAIL / FPS * SR))]), N)
    # a soft chime when he smirks
    t = np.arange(int(0.8 * SR)) / SR; ch = (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t)) * np.exp(-t * 5) * 0.3
    s0 = int((smug - 2000) / FPS * SR); sf[s0: s0 + len(ch)] += ch[: len(sf) - s0]
    def wav(p, x):
        with wave.open(p, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    for n, x in (("voice.wav", voice), ("music.wav", music), ("sfx.wav", sf)): wav(os.path.join(fin, n), x)
    subprocess.run([sys.executable, os.path.join(HERE, "mix.py"), "voice.wav", "music.wav", "sfx.wav"], cwd=fin, check=True)
    # captions: hook words spread by letters over speech segments, then shifted original words
    lines = HOOK_LINES if len(segs) >= 3 else [HOOK_LINES[0] + " " + HOOK_LINES[1], HOOK_LINES[2]]
    if len(segs) > len(lines): segs = segs[: len(lines) - 1] + [(segs[len(lines) - 1][0], segs[-1][1])]
    if len(segs) < len(lines): lines = [" ".join(lines[: len(lines) - len(segs) + 1])] + lines[len(lines) - len(segs) + 1:]
    words = []
    for (a, b), line in zip(segs, lines):
        ws = line.split(); L = sum(len(w) + 1 for w in ws); t0 = a
        for w in ws: d = (b - a) * (len(w) + 1) / L; words.append({"w": w, "s": round(t0, 3), "e": round(t0 + d, 3)}); t0 += d
    orig = json.load(open(os.path.join(HERE, "work", "words.json")))
    off = H
    for a, b in KEEP:
        for w in orig:
            if a / FPS <= w["s"] < (b + 1) / FPS: words.append({"w": w["w"], "s": round(w["s"] - a / FPS + off, 3), "e": round(w["e"] - a / FPS + off, 3)})
        off += (b - a + 1) / FPS
    json.dump(words, open(os.path.join(fin, "work", "words.json"), "w"))
    subprocess.run([sys.executable, os.path.join(HERE, "captions.py"), "work/words.json", "work/captions.ass", "--style", "white"], cwd=fin, check=True)
    print("built", len(order), "frames", round(total, 2), "s")


main()
