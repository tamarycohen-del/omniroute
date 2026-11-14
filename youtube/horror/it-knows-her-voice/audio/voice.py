#!/usr/bin/env python3
"""Splice narrator (Clancy) + the voice at the door (Tammy) into one voice track.

    python3 voice.py   -> voice.wav, words.json (s/e in seconds, "who": n|m)

The door voice is muffled (low-pass + a short room echo) so it sounds like it comes
through the front door.
"""
import json, os, subprocess
import wave

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
# (source, start, end) in seconds, then a pause after it
PLAN = [("n", 0.00, 19.38, 0.45),   # lines 1-4, ends "three knocks."
        ("m", 0.00, 5.56, 0.55),    # "Honey? It's me ... it's freezing."
        ("n", 19.38, 44.30, 0.35),  # lines 6-12 narration, ends "right against the door."
        ("m", 5.56, 12.32, 0.60),   # "Honey... that's not me texting you ... behind me."
        ("n", 44.30, 58.00, 0.30)]  # lines 13-15


def load(p, door=False):
    af = ["-af", "lowpass=f=2200,highpass=f=180,aecho=0.8:0.5:35:0.25,volume=1.15"] if door else []
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p] + af + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def clean(ws):
    out, inside = [], False
    for w in ws:
        t = w["text"]
        if t.startswith("["): inside = True
        if not inside: out.append(w)
        if t.endswith("]"): inside = False
    return out


def main():
    src = {"n": load(os.path.join(HERE, "narr.mp3")), "m": load(os.path.join(HERE, "mom.mp3"), door=True)}
    wsrc = {k: clean([w for w in json.load(open(os.path.join(HERE, f)))["words"] if w["type"] == "word"])
            for k, f in (("n", "narr_words.json"), ("m", "mom_words.json"))}
    parts, out_words, t = [], [], 0.0
    fade = int(0.01 * SR)
    for who, a, b, pause in PLAN:
        seg = src[who][int(a * SR): int(b * SR)].copy()
        seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        for w in wsrc[who]:
            if a <= w["start"] < b:
                out_words.append({"w": w["text"].strip('"'), "s": round(w["start"] - a + t, 3),
                                  "e": round(min(w["end"], b) - a + t, 3), "who": who})
        parts += [seg, np.zeros(int(pause * SR))]
        t += (b - a) + pause
    v = np.concatenate(parts)
    v = v / max(1e-9, np.abs(v).max()) * 0.89
    with wave.open(os.path.join(HERE, "voice.wav"), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((v * 32767).astype(np.int16).tobytes())
    json.dump(out_words, open(os.path.join(HERE, "words.json"), "w"), indent=0)
    print("voice", round(len(v) / SR, 2), "s,", len(out_words), "words")


main()
