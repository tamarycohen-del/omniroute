#!/usr/bin/env python3
"""Make a narrator voiceover with exact word timings (no recording, no speech recognition needed).

    python3 tts_edge.py script.txt [--voice en-US-AndrewNeural] [--rate +6%] [--pitch -4Hz] [--out .]
      -> voice.mp3 + tts_words.json   ([{"w": text, "s": start, "e": end}, ...], seconds)

Uses Microsoft Edge neural voices through the `edge-tts` package (pip install edge-tts). It needs
internet access to speech.platform.bing.com. In a sandbox where that host is blocked, run this file
in the Composio remote workbench (it has internet) and bring voice.mp3 + tts_words.json back.
Then run words2phrases.py to restore punctuation and build work/words.json + work/phrases.json.

Good narrator voices for curious-fact shorts: en-US-AndrewNeural (warm, default),
en-US-BrianNeural (casual), en-US-ChristopherNeural (deep, serious), en-GB-RyanNeural (British).
"""
import argparse, asyncio, json, os


async def synth(text, voice, rate, pitch, out_dir):
    import edge_tts
    words = []
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    with open(os.path.join(out_dir, "voice.mp3"), "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7
                words.append({"w": ch["text"], "s": round(s, 3), "e": round(s + ch["duration"] / 1e7, 3)})
    json.dump(words, open(os.path.join(out_dir, "tts_words.json"), "w"), indent=1)
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--voice", default="en-US-AndrewNeural")
    ap.add_argument("--rate", default="+6%")
    ap.add_argument("--pitch", default="-4Hz")
    ap.add_argument("--out", default=".")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    text = " ".join(open(a.script).read().split())
    words = asyncio.run(synth(text, a.voice, a.rate, a.pitch, a.out))
    print(f"{len(words)} words, speech ends at {words[-1]['e']:.2f}s -> {a.out}/voice.mp3, tts_words.json")


if __name__ == "__main__":
    main()
