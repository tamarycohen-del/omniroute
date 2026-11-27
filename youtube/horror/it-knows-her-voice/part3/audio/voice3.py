#!/usr/bin/env python3
"""Part 3 voice track: Clancy take A + Mom (Tammy, outdoors - no door filter) + Clancy take B.

    python3 voice3.py  -> voice.wav, words.json, timeline.json
Narration and Mom were recorded as separate takes (no narrator line inside a character take).
"""
import json, os, subprocess, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = {"A": "narrA.mp3", "B": "narrB.mp3", "m": "mom.mp3"}
WORDS = {"A": "narrA_words.json", "B": "narrB_words.json"}
MOM_TEXT = {0.0: "Honey... come out. I won't hurt you.", 3.7: "It's so cold out here. Don't you want to come home with Mommy?"}
PLAN = [
    ("A", 0.00, 7.23, "open"),        # Imagine... / In the comments, you said: into the woods with Biscuit.
    ("gap", 0.5, "comments_hold"),
    ("A", 7.23, 37.62, "run"),        # Brave call ... Right on the other side of the tree.
    ("gap", 0.45, None),
    ("m", 0.00, 3.70, "mom1"),
    ("gap", 0.35, None),
    ("m", 3.70, 7.81, "mom2"),
    ("gap", 0.45, None),
    ("B", 0.00, 36.02, "closer"),     # She took one step closer ... Part 4 follows you.
    ("gap", 0.6, "end"),
]


def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)


def bounds(x, thr=0.02):
    i = np.where(np.abs(x) > thr)[0]
    return (i[0] / SR, i[-1] / SR) if len(i) else (0, len(x) / SR)


def main():
    audio = {k: load(os.path.join(HERE, f)) for k, f in SRC.items()}
    words = {k: [w for w in json.load(open(os.path.join(HERE, f)))["words"] if w["type"] == "word" and not w["text"].startswith("[") and not w["text"].endswith("]")] for k, f in WORDS.items()}
    rms = lambda x: np.sqrt((x ** 2).mean()) + 1e-9
    audio["m"] = audio["m"] * (rms(audio["A"]) / rms(audio["m"])) * 0.95   # Mom about as loud as the narration
    parts, out, marks, t, fade = [], [], {}, 0.0, int(0.03 * SR)
    for it in PLAN:
        if it[0] == "gap":
            if it[2]: marks[it[2]] = round(t, 3)
            seg = np.zeros(int(it[1] * SR))
        else:
            k, a, b, m = it
            if m: marks[m] = round(t, 3)
            seg = audio[k][int(a * SR): int(b * SR)].copy()
            if k in words:
                out += [{"w": w["text"].strip('"'), "s": round(w["start"] - a + t, 3), "e": round(min(w["end"], b) - a + t, 3), "who": "n"} for w in words[k] if a <= w["start"] < b]
            else:
                s0, s1 = bounds(seg); ws = MOM_TEXT[a].split(); L = sum(len(w) + 1 for w in ws); x = t + s0
                for w in ws:
                    d = (s1 - s0) * (len(w) + 1) / L; out.append({"w": w, "s": round(x, 3), "e": round(x + d, 3), "who": "m"}); x += d
            seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        parts.append(seg); t += len(seg) / SR
    v = np.concatenate(parts); v = v / np.abs(v).max() * 0.89
    with wave.open(os.path.join(HERE, "voice.wav"), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((v * 32767).astype(np.int16).tobytes())
    marks["total"] = round(len(v) / SR, 3)
    json.dump(out, open(os.path.join(HERE, "words.json"), "w"), indent=0)
    json.dump(marks, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
    print("voice", marks["total"], "s,", len(out), "words")


main()
