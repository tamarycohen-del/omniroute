# longer cut: place narration + radio voice; voice.wav + words1.json
import json, subprocess
W = json.load(open('narr2_words.json'))
SEG = [(0.0, 1.8, 2.0), (1.9, 5.6, 4.6), (5.9, 9.6, 9.5), (9.9, 13.4, 14.0), (13.9, 17.2, 22.8), (17.3, 19.6, 29.0), (19.8, 23.9, 39.0), (24.1, 26.05, 45.5), (26.1, 29.6, 50.5), (29.9, 31.9, 57.5), (32.1, 34.8, 64.0)]
TOTAL = 70.0
parts, out = [], []
for i, (a, b, at) in enumerate(SEG):
    parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b-a-0.06}:d=0.06,adelay={int(at*1000)}|{int(at*1000)}[s{i}]")
    out += [{"w": w["w"], "s": round(w["s"] - a + at, 2), "e": round(w["e"] - a + at, 2), "who": "n"} for w in W if a <= w["s"] < b]
n = len(SEG)
parts.append("[2:a]atrim=0:4.8,asetpts=PTS-STARTPTS,adelay=33600|33600[sun]")
parts.append("[1:a]highpass=f=500,lowpass=f=3200,acrusher=bits=8:mix=0.25,volume=1.4,adelay=18600|18600[wk]")
fc = ";".join(parts) + ";" + "".join(f"[s{i}]" for i in range(n)) + f"[wk][sun]amix=inputs={n+2}:normalize=0,apad,atrim=0:{TOTAL}[v]"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "narr2.mp3", "-i", "walkie.mp3", "-i", "sun.mp3", "-filter_complex", fc, "-map", "[v]", "-ar", "48000", "-ac", "2", "voice.wav"], check=True)
SW = json.load(open("sun_words.json")); out += [{"w": w["w"], "s": round(w["s"] + 33.6, 2), "e": round(w["e"] + 33.6, 2), "who": "n"} for w in SW]; out.sort(key=lambda w: w["s"])
fix = {"closer": "closer...", "sunlight": "sunlight...", "two": "Two", "than": "Then", "hand.": "hand...", "Beeped.": "beeped."}
for w in out: w["w"] = fix.get(w["w"], w["w"])
json.dump(out, open("words1.json", "w")); print(" ".join(f"{w['w']}@{w['s']}" for w in out))
