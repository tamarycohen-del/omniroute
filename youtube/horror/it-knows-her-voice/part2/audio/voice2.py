#!/usr/bin/env python3
"""Part 2 voice track: Clancy narration + Mrs. Hale (Nan) + holds, words.json for captions.

    python3 voice2.py  -> voice.wav, words.json, timeline.json (start time of each marked moment)

PLAN items: ("n", a, b) narration slice, ("h", a, b) Mrs. Hale slice, ("gap", seconds, mark),
("cookie", seconds) slot for the narrator's "I remembered... cookies" line (cookie_line.mp3 if present,
otherwise silence of that length). The woman-voiced cookie line in narr.mp3 (55.27-58.03) is skipped.
"""
import json, os, subprocess, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = [
    ("n", 0.00, 8.90, "open"),          # opening + "In the comments, you said: escape with Biscuit."
    ("gap", 2.6, "comments_hold"),      # comments stay on screen
    ("n", 8.90, 31.55, "yard"),         # Smart call ... ever since.
    ("gap", 3.0, "window_hold"),        # slow zoom on her window
    ("n", 31.55, 40.52, "door"),        # Then her back door opened ... Same smile.
    ("gap", 0.35, None),
    ("h", 0.00, 2.56, "hale1"),         # "Quick! Get inside before it sees you."
    ("gap", 0.45, None),
    ("n", 40.52, 55.27, "growl"),       # I started walking ... smiled and said:
    ("gap", 0.30, None),
    ("h", 2.56, 6.19, "hale2"),         # "Don't worry. I made some cookies... if you want."
    ("gap", 0.40, None),
    ("cookie", 3.6),                    # "I remembered... Mrs. Hale used to give Biscuit cookies every day."
    ("n", 58.03, 69.25, "click"),       # Then, behind us... CLICK ... Part 3 follows you.
    ("gap", 0.6, "end"),
]
HALE_TEXT = [(0.00, 2.56, "Quick! Get inside before it sees you."), (2.56, 6.19, "Don't worry. I made some cookies... if you want.")]
COOKIE_TEXT = "I remembered... Mrs. Hale used to give Biscuit cookies every day."


def load(p, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", p] + (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)


def speech_bounds(x, thr=0.02):
    idx = np.where(np.abs(x) > thr)[0]
    return (idx[0] / SR, idx[-1] / SR) if len(idx) else (0, len(x) / SR)


def spread(text, a, b, t0, who):
    ws = text.split(); L = sum(len(w) + 1 for w in ws); out = []; x = a
    for w in ws:
        d = (b - a) * (len(w) + 1) / L; out.append({"w": w.strip('"'), "s": round(t0 + x - a, 3), "e": round(t0 + x - a + d, 3), "who": who}); x += d
    return out


def main():
    narr = load(os.path.join(HERE, "narr.mp3"))
    hale = load(os.path.join(HERE, "hale.mp3"))
    nw = [w for w in json.load(open(os.path.join(HERE, "narr_words.json")))["words"] if w["type"] == "word" and not w["text"].startswith("[") and not w["text"].endswith("]")]
    cpath = os.path.join(HERE, "cookie_line.mp3")
    cookie = load(cpath) if os.path.exists(cpath) else None
    parts, words, marks, t = [], [], {}, 0.0
    fade = int(0.03 * SR)

    def push(seg):
        nonlocal t
        seg = seg.copy()
        if len(seg) > 2 * fade: seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        parts.append(seg); t += len(seg) / SR

    for it in PLAN:
        kind = it[0]
        if kind == "gap":
            if it[2]: marks[it[2]] = round(t, 3)
            push(np.zeros(int(it[1] * SR)))
        elif kind == "n":
            a, b, m = it[1], it[2], it[3]
            if m: marks[m] = round(t, 3)
            for w in nw:
                if a <= w["start"] < b: words.append({"w": w["text"].strip('"'), "s": round(w["start"] - a + t, 3), "e": round(min(w["end"], b) - a + t, 3), "who": "n"})
            push(narr[int(a * SR): int(b * SR)])
        elif kind == "h":
            a, b, m = it[1], it[2], it[3]
            marks[m] = round(t, 3)
            seg = hale[int(a * SR): int(b * SR)]; s0, s1 = speech_bounds(seg)
            txt = [x for x in HALE_TEXT if x[0] == a][0][2]
            words += spread(txt, 0, s1 - s0, t + s0, "h")
            push(seg)
        elif kind == "cookie":
            marks["cookie"] = round(t, 3)
            if cookie is not None:
                rms = lambda x: np.sqrt((x ** 2).mean()) + 1e-9
                c = cookie * (rms(narr[int(40.5 * SR): int(55 * SR)]) / rms(cookie))  # match the narration around it
                s0, s1 = speech_bounds(c); words += spread(COOKIE_TEXT, 0, s1 - s0, t + s0, "n"); push(c)
            else:
                push(np.zeros(int(it[1] * SR)))
    v = np.concatenate(parts); v = v / max(1e-9, np.abs(v).max()) * 0.89
    with wave.open(os.path.join(HERE, "voice.wav"), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((v * 32767).astype(np.int16).tobytes())
    marks["total"] = round(len(v) / SR, 3)
    json.dump(words, open(os.path.join(HERE, "words.json"), "w"), indent=0)
    json.dump(marks, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
    print("voice", marks["total"], "s,", len(words), "words, cookie line:", "yes" if cookie is not None else "placeholder")


main()
