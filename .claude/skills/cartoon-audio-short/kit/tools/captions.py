#!/usr/bin/env python3
"""One-word-at-a-time captions as an .ass file (burned in by finish.sh when work/captions.ass exists).

    python3 captions.py work/words.json work/captions.ass [--style small|bold] [--y 0.62]

small (default): small white words with a thin dark outline, centred, the curious-fact look.
bold: bigger, yellow active word, heavier outline (more "Shorts" style).
Each word shows from its start until the next word starts (gaps over 0.35 s clear the screen).
Trailing punctuation is dropped from the caption except ? and !.
"""
import argparse, json, re

STYLES = {
    #        font size, primary,     outline, shadow, bold
    "small": (62,  "&H00FFFFFF", 4, 1, -1),
    "bold":  (104, "&H0000D7FF", 9, 0, -1),
}


def ts(t):
    t = max(0.0, t)
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("words"); ap.add_argument("out")
    ap.add_argument("--style", default="small", choices=STYLES)
    ap.add_argument("--y", type=float, default=0.62, help="caption centre height as a fraction of 1920")
    ap.add_argument("--font", default="Inter")
    a = ap.parse_args()
    size, colour, outline, shadow, bold = STYLES[a.style]
    words = json.load(open(a.words))
    margin_v = int(1920 * (1 - a.y) - size / 2)
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: W,{a.font},{size},{colour},&H000000FF,&H00202020,&H80000000,{bold},0,0,0,100,100,0,0,1,{outline},{shadow},2,60,60,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for i, w in enumerate(words):
        txt = re.sub(r"[,.;:\"”“')(]+", "", w["w"]).strip()
        if not txt:
            continue
        end = words[i + 1]["s"] if i + 1 < len(words) else w["e"] + 0.3
        if end - w["e"] > 0.35:
            end = w["e"] + 0.15
        pop = r"{\fscx85\fscy85\t(0,60,\fscx100\fscy100)}"
        lines.append(f"Dialogue: 0,{ts(w['s'])},{ts(end)},W,,0,0,0,,{pop}{txt}")
    open(a.out, "w").write(head + "\n".join(lines) + "\n")
    print(f"{len(lines)} caption events -> {a.out}")


if __name__ == "__main__":
    main()
