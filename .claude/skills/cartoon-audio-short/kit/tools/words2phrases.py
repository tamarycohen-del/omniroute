#!/usr/bin/env python3
"""Turn TTS word timings into the kit's timing files (replaces timing.py for generated voices).

    python3 words2phrases.py tts_words.json script.txt voice.mp3 --out work
      -> work/words.json  [{"w","s","e"}]   (words carry the script's punctuation)
         work/phrases.json {"duration","frames30","source","segments","phrases":[{"text","s","e"}]}

TTS word events drop punctuation, so each event is matched in order to the script's tokens and takes
the token's spelling. Phrases end at , . ; : ! ? exactly like timing.py, so story.js code is unchanged.
"""
import json, os, re, subprocess, sys


def norm(t):
    return re.sub(r"[^a-z0-9]", "", t.lower())


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def merge(tts, tokens):
    """Map TTS events to script tokens. A TTS event can cover several tokens ("twenty-five") or
    one token can be split over several events; both cases are handled by comparing normalised text."""
    out, i, j = [], 0, 0
    while i < len(tokens) and j < len(tts):
        text = tokens[i]
        if not norm(text):  # a bare dash or ellipsis: glue it to the previous word
            if out: out[-1]["w"] += " " + text
            i += 1; continue
        a, b = norm(text), norm(tts[j]["w"])
        start, end = tts[j]["s"], tts[j]["e"]
        if a != b and b.startswith(a):  # one TTS event spans several script tokens
            while len(norm(text)) < len(b) and i + 1 < len(tokens):
                i += 1; text += " " + tokens[i]
        elif a != b and a.startswith(b):  # TTS split one script token into several events
            got = b
            while len(got) < len(a) and j + 1 < len(tts):
                j += 1; got += norm(tts[j]["w"]); end = tts[j]["e"]
        # any other mismatch (e.g. a digit the TTS spelled out): keep the token, take the event's time
        out.append({"w": text, "s": round(start, 3), "e": round(end, 3)})
        i += 1; j += 1
    while i < len(tokens) and out:  # leftovers: attach to the last word
        out[-1]["w"] += " " + tokens[i]; i += 1
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    out_dir = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "work"
    if len(args) < 3:
        sys.exit("usage: words2phrases.py tts_words.json script.txt voice.mp3 [--out work]")
    tts = json.load(open(args[0]))
    tokens = open(args[1]).read().split()
    D = duration(args[2])
    words = merge(tts, tokens)
    phrases, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[,.;:!?][\"”')]*$", w["w"]):
            phrases.append({"text": " ".join(x["w"] for x in cur), "s": cur[0]["s"], "e": cur[-1]["e"]}); cur = []
    if cur:
        phrases.append({"text": " ".join(x["w"] for x in cur), "s": cur[0]["s"], "e": cur[-1]["e"]})
    segs = [[p["s"], p["e"]] for p in phrases]
    os.makedirs(out_dir, exist_ok=True)
    json.dump(words, open(os.path.join(out_dir, "words.json"), "w"), indent=1)
    json.dump({"duration": D, "frames30": int(round(D * 30)), "source": "tts-word-boundaries",
               "segments": segs, "phrases": phrases}, open(os.path.join(out_dir, "phrases.json"), "w"), indent=1)
    print(f"source=tts duration={D:.2f}s frames={int(round(D * 30))} words={len(words)}")
    for p in phrases:
        print(f"{p['s']:6.2f}-{p['e']:6.2f}  f{int(p['s'] * 30):4d}-{int(p['e'] * 30):4d}  {p['text']}")


if __name__ == "__main__":
    main()
