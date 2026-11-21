#!/usr/bin/env python3
"""Part 8 voice track (finale): Clancy takes A+B+C, the skinwalker saying "Honey..." in Mom's voice (Tammy, made wrong), and the real Mom (Tammy, clean).
    python3 voice8.py -> voice.wav, words.json (who: n/k), timeline.json"""
import json, os, re, subprocess, difflib
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__))
SRC = {"A": "narrA.mp3", "B": "narrB.mp3", "C": "narrC.mp3", "H": "momhale.mp3", "M": "momreal.mp3"}
WHO = {"A": "n", "B": "n", "C": "n", "H": "h", "M": "m"}
TEXT = {
 "A": "Imagine leading a monster... straight to another monster. And tonight... you finally see who was in our kitchen window. In the comments, you said: let them fight. And one of you had a whole plan. Big brain. So I ran back to the bridge. And the tall one followed me.",
 "B": "Then they saw each other. Two things that copy my mom... staring at each other. Mrs. Hale jumped first. But the tall one didn't fight back. It copied her. Every move. She couldn't win against herself. She slipped... and fell into the water. Just like you said: the one that copies Mom won. Which meant... the mirror. I ran inside and grabbed it off the wall. Biscuit stood in front of me and growled. It ducked through the door... and I held the mirror up. For the first time, it saw what it really was. It tried to copy that... and cracked like glass. Then the kitchen light turned on.",
 "C": "Buddy. She calls me buddy. She never says honey. And Biscuit wagged his tail so hard... he fell over. And for the first time all night... I wasn't scared. Some things can copy Mom's voice. Only one of them calls me buddy. Thank you for choosing with me. Comment what our next story should be.",
 "H": "\"Honey...\"", "M": "\"Buddy? Why are you up? It's almost four.\""}
PLAN = [
    ("A", "Imagine", "In", "open"),
    ("A", "In", "Big", "comments"),
    ("A", "Big", "So", "big"),
    ("A", "So", None, "run"),
    ("gap", 0.35, None),
    ("H", None, "honey#1", "honey"),
    ("gap", 0.7, "rehook"),
    ("B", "Then", "Mrs.", "face"),
    ("B", "Mrs.", "But", "jump"),
    ("B", "But", "She", "copy"),
    ("B", "She", "Just", "fall"),
    ("B", "Just", "I", "mirrorRule"),
    ("B", "I", "It#1", "grab"),
    ("B", "It#1", "For", "duck"),
    ("B", "For", "Then#1", "truth"),
    ("gap", 0.5, None),
    ("B", "Then#1", None, "light"),
    ("gap", 0.4, None),
    ("M", None, None, "mom"),
    ("gap", 0.6, None),
    ("C", "Buddy", "And", "buddy"),
    ("C", "And", "And#1", "wag"),
    ("C", "And#1", "Thank", "calm"),
    ("gap", 0.4, "thanks"),
    ("C", "Thank", None, "end"),
    ("gap", 1.4, "black"),
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
def wrongmom(x):  # Mom's voice coming out of the skinwalker: a lower ghost copy under it + a long echo
    lo = fx(x, f"asetrate={int(SR*0.82)},aresample={SR},atempo=1.22"); n = max(len(x), len(lo)); m = np.zeros(n); m[:len(x)] += x; m[:len(lo)] += 0.45 * lo
    return fx(np.concatenate([m, np.zeros(int(1.2 * SR))]), "aecho=0.8:0.6:300|620:0.4|0.2,highpass=f=120")
audio["H"] = wrongmom(audio["H"])
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
