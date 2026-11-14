"""Fit a natural voice take (no word timings) onto the old phrase slots so the rendered animation stays in sync.
   python3 fitvoice.py jon.mp3 -> voice_new.wav + work/words_new.json"""
import json, subprocess, re, sys, wave, numpy as np
SR = 48000; src = sys.argv[1]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).copy(); D = len(x) / SR
out = subprocess.run(["ffmpeg", "-i", src, "-af", "silencedetect=noise=-38dB:d=0.15", "-f", "null", "-"], capture_output=True, text=True).stderr
ss = [float(v) for v in re.findall(r"silence_start: ([0-9.]+)", out)]; se = [float(v) for v in re.findall(r"silence_end: ([0-9.]+)", out)]
gaps = [(a, b) for a, b in zip(ss, se) if a > 0.05 and b < D - 0.05]
P = json.load(open("work/phrases.json"))["phrases"]; W = json.load(open("work/words.json"))
# speech-time position of each gap
first = se[0] if ss and ss[0] < 0.05 else 0.0; last = ss[-1] if se and se[-1] >= D - 0.05 else D
sp = lambda t: (t - first) - sum(min(b, t) - a for a, b in gaps if a < t)
total = sp(last)
L = [len(re.sub(r"[^A-Za-z0-9]", "", p["text"])) + 3 for p in P]; C = np.cumsum(L) / sum(L)
# pause -> "cut after phrase i", checked by hand against the segment lengths of this take (jon.mp3)
AFTER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 24, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37]
assert len(AFTER) == len(gaps), (len(AFTER), len(gaps))
cut = {i: g for g, i in enumerate(AFTER)}
bounds = sorted(cut)  # phrase index i: cut after phrase i
groups, s0 = [], 0
for i in bounds + [len(P) - 1]:
    groups.append((s0, i)); s0 = i + 1
print(f"{len(gaps)} pauses, {len(P)} phrases -> {len(groups)} groups")
y = np.zeros(int(62.1 * SR), np.float32); NW = []; cursor = 0.0; wi = 0
for k, (a, b) in enumerate(groups):
    t0 = first if k == 0 else gaps[cut[groups[k - 1][1]]][1] - 0.04
    t1 = last if k == len(groups) - 1 else gaps[cut[b]][0] + 0.06
    seg = x[int(t0 * SR):int(t1 * SR)]; dur = len(seg) / SR
    start = max(P[a]["s"] - 0.04, cursor)
    slot_end = (P[groups[k + 1][0]]["s"] - 0.1) if k < len(groups) - 1 else 62.0
    tempo = 1.0 if dur <= slot_end - start else min(1.2, dur / max(0.1, slot_end - start))
    if tempo > 1.001:
        seg = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={tempo:.4f}", "-f", "f32le", "-"],
                                           input=seg.tobytes(), capture_output=True, check=True).stdout, np.float32)
    i0 = int(start * SR); i1 = min(len(y), i0 + len(seg)); y[i0:i1] += seg[: i1 - i0]
    nd = len(seg) / SR; cursor = start + nd + 0.08
    # words of this group, spread by letters over the group's speech (minus its internal pauses)
    gw = [w for w in W if P[a]["s"] - 0.02 <= w["s"] <= P[b]["e"] + 0.02]
    inner = [(max(g0, t0), min(g1, t1)) for g0, g1 in gaps if g0 > t0 and g1 < t1]
    def mapt(u):  # u in speech-fraction of group -> source time
        speech = (t1 - t0) - sum(b_ - a_ for a_, b_ in inner); target = u * speech; t = t0
        for a_, b_ in inner:
            if t + target <= a_ or target <= a_ - t: break
            target -= a_ - t; t = b_
        return t + target
    lw = np.array([len(w["w"]) + 1 for w in gw], float); cw = np.concatenate([[0], np.cumsum(lw)]) / lw.sum()
    for j, w in enumerate(gw):
        s_ = start + (mapt(cw[j]) - t0) / tempo; e_ = start + (mapt(cw[j + 1]) - t0) / tempo - 0.03
        NW.append({"w": w["w"], "s": round(s_, 3), "e": round(max(s_ + 0.08, e_), 3)})
    print(f"  g{k:2d} phr {a:2d}-{b:2d} at {start:5.2f}s len {dur:4.2f}s slot {slot_end - start:4.2f}s tempo {tempo:.2f}  | {P[a]['text'][:40]}")
y = y[: int(62.07 * SR)]
with wave.open("voice_new.wav", "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(NW, open("work/words_new.json", "w"), indent=1)
print("words", len(NW), "of", len(W), "last end", NW[-1]["e"])
