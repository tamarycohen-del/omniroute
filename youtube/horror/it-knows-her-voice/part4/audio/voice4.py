#!/usr/bin/env python3
"""Part 4 voice track: Clancy take A + take B, with holds for the comments and the dramatic beats.
    python3 voice4.py  -> voice.wav, words.json, timeline.json"""
import json, os, subprocess, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__))
SRC = {"A": "narrA.mp3", "B": "narrB.mp3"}
PLAN = [
    ("A", 0.00, 9.72, "open"),        # hook + "In the comments, you said: the road."
    ("gap", 1.2, "comments_hold"),
    ("A", 9.72, 36.62, "story"),      # Good call ... She didn't say a word.
    ("gap", 1.1, "silence"),          # nobody talks, only the engine
    ("B", 0.00, 20.96, "chase"),      # She immediately drove off ... still catching up.
    ("gap", 0.45, None),
    ("B", 20.96, 29.72, "grab"),      # Then... she grabbed the back of the car ... then at the door.
    ("gap", 0.6, "choice"),
    ("B", 29.72, 38.40, "ask"),       # So... do you stay ... Part 5 follows you.
    ("gap", 0.8, "end"),
]
def load(p): return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
audio = {k: load(os.path.join(HERE, f)) for k, f in SRC.items()}
words = {k: [w for w in json.load(open(os.path.join(HERE, f"narr{k}_words.json")))["words"] if w["type"] == "word"] for k in SRC}
parts, out, marks, t, fade = [], [], {}, 0.0, int(0.02 * SR)
for it in PLAN:
    if it[0] == "gap":
        if it[2]: marks[it[2]] = round(t, 3)
        seg = np.zeros(int(it[1] * SR))
    else:
        k, a, b, m = it
        if m: marks[m] = round(t, 3)
        seg = audio[k][int(a * SR): int(b * SR)].copy()
        out += [{"w": w["text"].strip('"'), "s": round(w["start"] - a + t, 3), "e": round(min(w["end"], b) - a + t, 3), "who": "n"} for w in words[k] if a <= w["start"] < b]
        seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    parts.append(seg); t += len(seg) / SR
v = np.concatenate(parts); v = v / np.abs(v).max() * 0.89
with wave.open(os.path.join(HERE, "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((v * 32767).astype(np.int16).tobytes())
marks["total"] = round(len(v) / SR, 3)
json.dump(out, open(os.path.join(HERE, "words.json"), "w"), indent=0); json.dump(marks, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
print("voice", marks["total"], "s,", len(out), "words")
