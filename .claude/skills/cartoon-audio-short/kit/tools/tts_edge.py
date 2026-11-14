#!/usr/bin/env python3
"""Make a narrator voiceover with exact word timings (no recording, no speech recognition needed).

    python3 tts_edge.py script.txt [--voice en-US-AndrewNeural] [--rate=+6%] [--pitch=-4Hz] [--gap 0.28] [--out .]
      -> voice.mp3 + tts_words.json   ([{"w": text, "s": start, "e": end}, ...], seconds)
      (write negative values with "=", e.g. --pitch=-4Hz, or argparse reads them as a flag)

Uses Microsoft Edge neural voices through the `edge-tts` package (pip install edge-tts). It needs
internet access to speech.platform.bing.com. In a sandbox where that host is blocked, run this file
in the Composio remote workbench (it has internet) and bring voice.mp3 + tts_words.json back.
Then run words2phrases.py to restore punctuation and build work/words.json + work/phrases.json.

Each sentence is synthesized on its own (long requests fail with NoAudioReceived), retried up to
8 times, trimmed to its last word and joined with a short pause (--gap) so the rhythm stays natural.
The join needs ffmpeg. The Composio workbench has internet but no ffmpeg, so there run
    python3 tts_edge.py script.txt --fetch-only parts      (zip parts/, upload, download it here)
and locally
    python3 tts_edge.py --join parts --out .

Good narrator voices for curious-fact shorts: en-US-AndrewNeural (warm, default),
en-US-BrianNeural (casual), en-US-ChristopherNeural (deep, serious), en-GB-RyanNeural (British).
"""
import argparse, asyncio, json, os, re, subprocess, tempfile

SR = 24000


async def synth_one(text, voice, rate, pitch, path):
    import edge_tts
    words = []
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    with open(path, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7
                words.append({"w": ch["text"], "s": s, "e": s + ch["duration"] / 1e7})
    return words


def pcm(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return raw


def fetch(sentences, voice, rate, pitch, parts):
    """Stage 1 (needs internet, no ffmpeg): one mp3 + word list per sentence -> parts/."""
    os.makedirs(parts, exist_ok=True)
    meta = []
    for i, sent in enumerate(sentences):
        path = os.path.join(parts, f"s{i:02d}.mp3")
        for attempt in range(8):
            try:
                ws = asyncio.run(asyncio.wait_for(synth_one(sent, voice, rate, pitch, path), timeout=40))
                if ws and os.path.getsize(path) > 0:
                    break
            except Exception as e:  # NoAudioReceived and network hiccups
                print(f"sentence {i} attempt {attempt + 1} failed: {e}")
        else:
            raise SystemExit(f"could not synthesize sentence {i}: {sent!r}")
        meta.append({"file": os.path.basename(path), "text": sent, "words": ws})
        print(f"  {i:2d} {ws[-1]['e']:5.2f}s  {sent}")
    json.dump(meta, open(os.path.join(parts, "parts.json"), "w"), indent=1)
    return meta


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script", nargs="?")
    ap.add_argument("--voice", default="en-US-AndrewNeural")
    ap.add_argument("--rate", default="+6%")
    ap.add_argument("--pitch", default="-4Hz")
    ap.add_argument("--gap", type=float, default=0.28, help="pause between sentences, seconds")
    ap.add_argument("--out", default=".")
    ap.add_argument("--fetch-only", metavar="PARTS_DIR",
                    help="stage 1 only: save per-sentence mp3s + parts.json (for a sandbox without ffmpeg)")
    ap.add_argument("--join", metavar="PARTS_DIR", help="stage 2 only: join a PARTS_DIR made by --fetch-only")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    if a.join:
        parts = a.join
        meta = json.load(open(os.path.join(parts, "parts.json")))
    else:
        text = " ".join(open(a.script).read().split())
        sentences = [s for s in re.split(r"(?<=[.!?…])\s+", text) if s.strip()]
        parts = a.fetch_only or tempfile.mkdtemp()
        meta = fetch(sentences, a.voice, a.rate, a.pitch, parts)
        if a.fetch_only:
            print(f"fetched {len(meta)} sentences -> {parts}/ ; join with: tts_edge.py --join {parts} --out <dir>")
            return
    audio, words, t = bytearray(), [], 0.0
    for i, m in enumerate(meta):
        ws = m["words"]
        raw = pcm(os.path.join(parts, m["file"]))
        lead = max(0.0, ws[0]["s"] - 0.05) if i else 0.0           # trim leading silence (keep the first)
        tail = min(len(raw) / 2 / SR, ws[-1]["e"] + 0.12)          # trim trailing silence
        seg = raw[int(lead * SR) * 2:int(tail * SR) * 2]
        for w in ws:
            words.append({"w": w["w"], "s": round(t + w["s"] - lead, 3), "e": round(t + w["e"] - lead, 3)})
        audio += seg
        t += len(seg) / 2 / SR
        if i < len(meta) - 1:
            audio += b"\x00\x00" * int(a.gap * SR); t += a.gap
    audio += b"\x00\x00" * int(0.4 * SR)
    out_mp3 = os.path.join(a.out, "voice.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-ar", "44100", "-b:a", "192k", out_mp3], input=bytes(audio), check=True)
    json.dump(words, open(os.path.join(a.out, "tts_words.json"), "w"), indent=1)
    print(f"{len(meta)} sentences, {len(words)} words, speech ends at {words[-1]['e']:.2f}s -> {out_mp3}")


if __name__ == "__main__":
    main()
