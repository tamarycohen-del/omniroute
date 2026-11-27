#!/usr/bin/env python3
"""Part 5 voice track: Clancy takes A+B, Mom on the radio (Tammy), Mrs. Hale (Nan).
    python3 voice5.py -> voice.wav, words.json (who: n/m/h), timeline.json"""
import json, os, subprocess
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__))
SRC = {"A": "narrA.mp3", "B": "narrB.mp3", "M": "mom.mp3", "H": "hale.mp3"}
WHO = {"A": "n", "B": "n", "M": "m", "H": "h"}
PLAN = [
    ("A", 0.00, 10.25, "open"),        # hook + promise + "In the comments, you said: stay in the car."
    ("gap", 1.9, "comments_hold"),
    ("A", 10.25, 26.75, "story"),      # Bold call ... the radio turned on. By itself.
    ("gap", 0.5, "radio"),
    ("M", 0.00, 3.16, "mom_radio"),    # "Honey... why did you get in her car?"
    ("gap", 0.5, None),
    ("B", 0.00, 4.40, "switch_off"),   # Mrs. Hale switched it off... she spoke.
    ("gap", 0.25, None),
    ("H", 0.00, 2.70, "hale1"),        # "Don't answer her. She learns your voice."
    ("gap", 0.6, None),
    ("B", 4.60, 10.20, "mirror"),      # I looked in the mirror ... the old bridge.
    ("gap", 0.3, None),
    ("H", 2.85, 8.83, "hale2"),        # "This is as far as I can go ..."
    ("gap", 0.5, None),
    ("B", 10.25, 31.45, "house"),      # Across the field ... toward our house.
    ("gap", 0.6, "choice"),
    ("B", 31.45, 38.03, "ask"),        # So... do you cross ... Part 6 follows you.
    ("gap", 0.8, "end"),
]
def load(p): return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def radio(x):  # small speaker: band-limit + a touch of drive
    y = subprocess.run(["ffmpeg", "-v", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "highpass=f=450,lowpass=f=3200,volume=1.6", "-f", "f64le", "-"], input=x.tobytes(), capture_output=True, check=True).stdout
    y = np.frombuffer(y, np.float64); return np.tanh(y * 1.4) * 0.8
audio = {k: load(os.path.join(HERE, f)) for k, f in SRC.items()}
audio["M"] = radio(audio["M"])
words = {k: json.load(open(os.path.join(HERE, f"{os.path.splitext(f)[0]}_words.json"))) for k, f in SRC.items()}
out, marks, W, t, fade = [], {}, [], 0.0, int(0.015 * SR)
for it in PLAN:
    if it[0] == "gap":
        if it[2]: marks[it[2]] = round(t, 3)
        out.append(np.zeros(int(it[1] * SR))); t += it[1]; continue
    k, a, b, m = it
    seg = audio[k][int(a * SR):int(b * SR)].copy(); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    if m: marks[m] = round(t, 3)
    for w in words[k]:
        if w["s"] >= a - 0.02 and w["s"] < b - 0.05: W.append({"w": w["w"], "s": round(t + w["s"] - a, 3), "e": round(t + min(w["e"], b) - a, 3), "who": WHO[k]})
    out.append(seg); t += (b - a)
y = np.concatenate(out); y = y / np.abs(y).max() * 0.92
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", os.path.join(HERE, "voice.wav")], input=y.tobytes(), check=True)
json.dump(W, open(os.path.join(HERE, "words.json"), "w")); json.dump({"total": round(t, 3), "marks": marks}, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
print("total", round(t, 2)); print(marks)
