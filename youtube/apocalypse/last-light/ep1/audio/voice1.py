# place narration segments on the timeline; write voice.wav + words1.json (shifted)
import json, subprocess
W = json.load(open('take_words.json'))
SEG = [(0.0, 1.9, 2.0), (2.1, 5.4, 4.6), (5.8, 7.4, 12.2), (8.3, 10.5, 25.6), (10.6, 11.84, 32.2)]  # (src a, src b, place at)
TOTAL = 38.0
parts, out = [], []
for i, (a, b, at) in enumerate(SEG):
    parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b-a-0.05}:d=0.05,adelay={int(at*1000)}|{int(at*1000)}[s{i}]")
    out += [{"w": w["w"], "s": round(w["s"] - a + at, 2), "e": round(w["e"] - a + at, 2), "who": "n"} for w in W if a <= w["s"] < b]
fc = ";".join(parts) + ";" + "".join(f"[s{i}]" for i in range(len(SEG))) + f"amix=inputs={len(SEG)}:normalize=0,apad,atrim=0:{TOTAL}[v]"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "take.mp3", "-filter_complex", fc, "-map", "[v]", "-ar", "48000", "-ac", "2", "voice.wav"], check=True)
json.dump(out, open("words1.json", "w")); print(" ".join(f"{w['w']}@{w['s']}" for w in out))
