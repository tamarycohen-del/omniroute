#!/usr/bin/env python3
"""Part 4 voice track: Clancy take A + take B, with holds for the comments and the dramatic beats.
    python3 voice4.py  -> voice.wav, words.json, timeline.json"""
import json, os, subprocess, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__))
SRC = {"A": "narrA.mp3", "B": "narrB.mp3", "H": "hit.mp3"}  # H = re-recorded "In the comments, you said: hit the road."
PLAN = [
    ("A", 0.00, 7.16, "open"),        # hook
    ("H", 0.00, 2.85, "comments_line"),  # "In the comments, you said: hit the road."
    ("gap", 0.45, "comments_hold"),
    ("A", 9.72, 36.62, "story"),      # Good call ... She didn't say a word.
    ("gap", 0.45, "silence"),          # nobody talks, only the engine
    ("B", 0.00, 20.96, "chase"),      # She immediately drove off ... still catching up.
    ("gap", 0.2, None),
    ("B", 20.96, 29.72, "grab"),      # Then... she grabbed the back of the car ... then at the door.
    ("gap", 0.3, "choice"),
    ("B", 29.72, 38.40, "ask"),       # So... do you stay ... Part 5 follows you.
    ("gap", 0.6, "end"),
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
        seg = audio[k][int(a * SR): int(b * SR)].copy(); ws = [w for w in words[k] if a <= w["start"] < b]
        # squeeze pauses between words longer than MAXP down to KEEP (cut from the middle of the pause)
        MAXP, KEEP = 0.28, 0.22; cuts = []
        hop = int(0.01 * SR); env_ = np.array([np.sqrt(np.mean(seg[i:i + hop] ** 2)) for i in range(0, len(seg) - hop, hop)]); quiet = env_ < 0.012 * np.abs(seg).max()
        i = 0
        while i < len(quiet):
            if quiet[i]:
                j = i
                while j < len(quiet) and quiet[j]: j += 1
                d0, d1 = i * hop / SR, j * hop / SR
                if d1 - d0 > MAXP and d0 > 0.05 and j < len(quiet): mid = (d0 + d1) / 2; cuts.append((mid - (d1 - d0 - KEEP) / 2, mid + (d1 - d0 - KEEP) / 2))
                i = j
            else: i += 1
        def shift(x):
            return x - sum(min(c1, x) - c0 for c0, c1 in cuts if x > c0)
        keep = np.ones(len(seg), bool)
        for c0, c1 in cuts: keep[int(c0 * SR): int(c1 * SR)] = False
        seg = seg[keep]
        out += [{"w": w["text"].strip('"'), "s": round(shift(w["start"] - a) + t, 3), "e": round(shift(min(w["end"], b) - a) + t, 3), "who": "n"} for w in ws]
        seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    parts.append(seg); t += len(seg) / SR
v = np.concatenate(parts); v = v / np.abs(v).max() * 0.89
with wave.open(os.path.join(HERE, "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((v * 32767).astype(np.int16).tobytes())
marks["total"] = round(len(v) / SR, 3)
json.dump(out, open(os.path.join(HERE, "words.json"), "w"), indent=0); json.dump(marks, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
print("voice", marks["total"], "s,", len(out), "words")
# shot starts: each shot begins at the first word of its line (searched in order); 'lead' shifts it slightly earlier
CUES = [("coldOpen", None, 0), ("run1", "only", 1.0), ("comments", "In", 0.1), ("treehouseArm", "Good", 0.05), ("runRoad", "So", 0.05), ("lightsTrees", "Suddenly,", 0.1),
        ("carComing", "A", 0.05), ("carStops", "Then...", 0.05), ("windowDown", "The", 0.05), ("haleFace", "It", 0.05), ("haleWave", "urgently", 0.25), ("growl", "Biscuit", 0.05),
        ("getIn", "But", 0.05), ("silentRide", "didn't", 0.25), ("driveOff", "immediately", 0.25), ("lookBack", "looked", 0.15), ("rearMom", "Mom", 0.1), ("momLegs", "legs", 0.2),
        ("rearReach", "reached", 0.3), ("haleDriving", "Mrs.", 0.05), ("rearClose", "But", 0.05), ("grab", "Then...", 0.05), ("shake", "whole", 0.15), ("bark", "Biscuit", 0.05),
        ("lookDoor", "looked", 0.15), ("choice", "So...", 0.05)]
shots, i = [], 0
for name, word, lead in CUES:
    if word is None: shots.append([0.0, name]); continue
    while out[i]["w"] != word: i += 1
    shots.append([round(max(0, out[i]["s"] - lead), 2), name]); i += 1
shots.append([marks["total"], "end"])
json.dump(shots, open(os.path.join(HERE, "shots.json"), "w"))
print(shots)
