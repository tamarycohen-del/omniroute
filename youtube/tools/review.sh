#!/bin/sh
# Final-file checks for a short: loudness, true peak, black frames, duration, and a transcript of the final mix.
# usage: sh youtube/tools/review.sh video.mp4
set -e
F="$1"; [ -f "$F" ] || { echo "usage: $0 video.mp4"; exit 1; }
echo "== duration"; ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"
echo "== loudness (target about -14 LUFS, peak under -1 dBTP)"
ffmpeg -hide_banner -nostats -i "$F" -vn -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "I:|Peak:"
echo "== black frames (should be none unless intended)"
ffmpeg -hide_banner -nostats -i "$F" -vf blackdetect=d=0.1:pix_th=0.05 -an -f null - 2>&1 | grep -o "black_start:[^ ]* black_end:[^ ]*" || echo "none"
echo "== transcript of the final mix"
python3 - "$F" <<'PY'
import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
# decode with ffmpeg (faster-whisper's own decoder fails with this av version)
a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32)
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a, language="en")
for s in segs: print(f"{s.start:6.1f}  {s.text.strip()}")
PY
