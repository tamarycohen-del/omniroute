#!/usr/bin/env python3
"""Generate the narration as ONE continuous take with edge-tts, plus word timestamps.

Usage: python3 voice.py --text script.txt --voice en-US-ChristopherNeural \
         --out voice/narration.mp3 [--rate -5%]
Writes: the mp3, voice/words.json ([{"word","t","dur"}] in seconds), and prints
the measured duration so the caller can compare it with the target
(N*10 - 1.5 s). Never time-stretch: fix duration by --rate (±10% max) or by
editing the script, then re-run.
"""
import argparse, asyncio, json, os, subprocess, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True, help="file with the full narration")
    ap.add_argument("--voice", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--rate", default="+0%", help='edge-tts rate, e.g. "-5%"')
    a = ap.parse_args()
    try:
        import edge_tts
    except ImportError:
        sys.exit("edge-tts not installed: pip3 install edge-tts")
    text = open(a.text, encoding="utf-8").read().strip()
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    words = []

    async def run():
        try:
            com = edge_tts.Communicate(text, a.voice, rate=a.rate, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"))
        except TypeError:  # older edge-tts: word boundaries are the default
            com = edge_tts.Communicate(text, a.voice, rate=a.rate, proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"))
        with open(a.out, "wb") as f:
            async for chunk in com.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    words.append({"word": chunk["text"],
                                  "t": round(chunk["offset"] / 1e7, 3),
                                  "dur": round(chunk["duration"] / 1e7, 3)})
    asyncio.run(run())
    wpath = os.path.join(os.path.dirname(a.out) or ".", "words.json")
    json.dump(words, open(wpath, "w"), indent=1)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", a.out], capture_output=True, text=True).stdout.strip()
    print(f"narration {a.out}: {float(dur):.2f}s, {len(words)} words, timestamps -> {wpath}")

if __name__ == "__main__":
    main()
