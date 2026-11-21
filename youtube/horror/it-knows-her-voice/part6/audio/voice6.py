#!/usr/bin/env python3
"""Part 6 voice track: Clancy takes A+B, the kid's voice coming out of the skinwalker (Clancy, pitched + echo).
    python3 voice6.py -> voice.wav, words.json (who: n/k), timeline.json"""
import json, os, re, subprocess, difflib
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__))
SRC = {"A": "narrA.mp3", "B": "narrB.mp3", "K": "kid.mp3"}
WHO = {"A": "n", "B": "n", "K": "k"}
TEXT = {
 "A": "Imagine running across a bridge... while the thing wearing your neighbor's face is right behind you. And tonight... you finally see what she really is. In the comments, you said: cross the bridge with Biscuit. No dog left behind. So I grabbed Biscuit... and ran onto the bridge. The boards creaked under every step. Behind us... the car door opened. Mrs. Hale got out. And then... she got down on all fours. Her back bent the wrong way. Her skin turned white and smooth. Her eyes lit up... like two flashlights. And her smile kept stretching. Wider than her face. Mrs. Hale died three years ago. And something has been wearing her ever since. In her hand... was Mom's phone. The one that texted me: don't open the door. She crawled to the edge of the water... and stopped. She can't cross water. But Biscuit can. Then she called out. In my voice.",
 "B": "And Biscuit did what every good boy does... when you call his name. He stopped in the middle of the bridge. Looking at me... then at her. And the boards under him... started to crack. So... do you run back for Biscuit? Or call him from the other side? Comment your choice. Part 7 follows you.",
 "K": "\"Biscuit! Come here, boy!\""}
# (take, start-word index, end-word index exclusive or None) cut at the quietest point near word boundaries
PLAN = [
    ("A", "Imagine", "No", "open"),
    ("gap", 1.9, "comments_hold"),
    ("A", "No", "Behind#2", "run"),
    ("A", "Behind#2", "Her#0", "door"),        # Behind us... the car door opened. Mrs. Hale got out... all fours.
    ("A", "Her#0", "Mrs.#1", "change"),       # back bent ... wider than her face
    ("gap", 0.5, None),
    ("A", "Mrs.#1", "In#1", "reveal"),        # Mrs. Hale died three years ago ...
    ("A", "In#1", "She#2", "phone"),
    ("A", "She#2", "Then#1", "water"),
    ("A", "Then#1", None, "callout"),
    ("gap", 0.45, None),
    ("K", None, None, "kid"),
    ("gap", 0.7, None),
    ("B", "And", "So,", "wag"),
    ("gap", 0.5, "choice"),
    ("B", "So,", None, "ask"),
    ("gap", 0.9, "end"),
]
def load(p): return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def fx(x, af):
    y = subprocess.run(["ffmpeg", "-v", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", af, "-f", "f64le", "-"], input=x.tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(y, np.float64)
def kidvoice(x):  # higher, like a kid, plus a low ghost copy underneath and a long echo over the water
    hi = fx(x, f"asetrate={int(SR*1.26)},aresample={SR},atempo=0.88")
    lo = fx(x, f"asetrate={int(SR*0.80)},aresample={SR},atempo=1.25")
    n = max(len(hi), len(lo)); m = np.zeros(n); m[:len(hi)] += hi; m[:len(lo)] += 0.32 * lo
    m = np.concatenate([m, np.zeros(int(1.6 * SR))])
    return fx(m, "aecho=0.8:0.7:380|760:0.45|0.25,highpass=f=140")
audio = {k: load(os.path.join(HERE, f)) for k, f in SRC.items()}
audio["K"] = kidvoice(audio["K"])
def env(x):  # 10 ms RMS
    h = int(0.01 * SR); n = len(x) // h; return np.sqrt((x[:n * h].reshape(n, h) ** 2).mean(1))
def quiet(k, a, b):  # quietest 10 ms in [a, b] seconds
    e = env(audio[k]); i0, i1 = int(a * 100), max(int(a * 100) + 1, int(b * 100)); return (i0 + int(np.argmin(e[i0:i1]))) / 100
def norm(w): return re.sub(r"[^a-z0-9']", "", w.lower())
words = {}
for k, f in SRC.items():  # fix whisper's spelling with the script's own words
    W = json.load(open(os.path.join(HERE, f"{os.path.splitext(f)[0]}_words.json")))
    T = TEXT[k].split(); sm = difflib.SequenceMatcher(None, [norm(w["w"]) for w in W], [norm(t) for t in T], autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ("equal", "replace") and i2 - i1 == j2 - j1:
            for d in range(i2 - i1): W[i1 + d]["w"] = T[j1 + d]
    words[k] = W
def idx(k, key):  # "Her#1" = 2nd word "Her" (0-based count), matched loosely
    name, _, nth = key.partition("#"); nth = int(nth or 0); c = 0
    for i, w in enumerate(words[k]):
        if norm(w["w"]) == norm(name):
            if c == nth: return i
            c += 1
    raise SystemExit(f"no word {key} in {k}")
out, marks, Wout, t, fade = [], {}, [], 0.0, int(0.012 * SR)
for it in PLAN:
    if it[0] == "gap":
        if it[2]: marks[it[2]] = round(t, 3)
        out.append(np.zeros(int(it[1] * SR))); t += it[1]; continue
    k, s, e, m = it; W = words[k]
    i, j = 0, len(W)
    if s is None: a = 0.0
    else:
        i = idx(k, s); a = quiet(k, (W[i - 1]["e"] if i else 0) - 0.05, W[i]["s"] + 0.12) if i else 0.0
    if e is None: b = len(audio[k]) / SR
    else:
        j = idx(k, e); b = quiet(k, W[j - 1]["e"] - 0.05, W[j]["s"] + 0.12)
    seg = audio[k][int(a * SR):int(b * SR)].copy(); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    if m: marks[m] = round(t, 3)
    for w in W[i:j]:
        Wout.append({"w": w["w"], "s": round(t + max(w["s"], a) - a, 3), "e": round(t + min(w["e"], b) - a, 3), "who": WHO[k]})
    out.append(seg); t += (b - a)
y = np.concatenate(out); y = y / np.abs(y).max() * 0.92
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", os.path.join(HERE, "voice.wav")], input=y.tobytes(), check=True)
json.dump(Wout, open(os.path.join(HERE, "words.json"), "w")); json.dump({"total": round(t, 3), "marks": marks}, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
print("total", round(t, 2)); print(marks); print(" ".join(w["w"] for w in Wout))
