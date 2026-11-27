#!/usr/bin/env bash
# assemble.sh — final cut: concat blocks → zoom-ins + shakes → one narration over
# ducked SFX → loudnorm → trim. Runs locally, needs ffmpeg/ffprobe/python3.
#
# Layout expected inside <project_dir>:
#   clips/block01.mp4 block02.mp4 ...   one 10s clip per block, in order
#   voice/narration.mp3                 ONE continuous narration take
#   edit_map.json                       {"punches":[{"t","dur"}],"shakes":[{"t","dur"}]}
#
# Usage: assemble.sh <project_dir> [--aspect 9:16|16:9] [--edit full|zooms|clean]
# Output: <project_dir>/final.mp4  (duration = narration + 0.4s)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR="${1:?usage: assemble.sh <project_dir> [--aspect 9:16] [--edit full]}"; shift
ASPECT="9:16"; EDIT="full"
while [ $# -gt 0 ]; do case "$1" in
  --aspect) ASPECT="$2"; shift 2;; --edit) EDIT="$2"; shift 2;; *) echo "unknown arg $1"; exit 1;; esac; done
for b in ffmpeg ffprobe python3; do command -v $b >/dev/null || { echo "$b not found"; exit 1; }; done
case "$ASPECT" in 9:16) W=1080; H=1920;; 16:9) W=1920; H=1080;; *) echo "aspect must be 9:16 or 16:9"; exit 1;; esac
BLOCK=10

cd "$DIR"
WORK=".assemble_work"; rm -rf "$WORK"; mkdir -p "$WORK"
clips=(clips/block*.mp4)
[ -e "${clips[0]}" ] || { echo "no clips at clips/block*.mp4"; exit 1; }
N=${#clips[@]}
NARR=$(ls voice/narration.* 2>/dev/null | head -1 || true)
[ -n "$NARR" ] || { echo "missing voice/narration.mp3"; exit 1; }
[ -f edit_map.json ] || echo '{"punches":[],"shakes":[]}' > edit_map.json

# 1. fps from the first clip — never hardcode
FPS=$(ffprobe -v 0 -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "${clips[0]}")

# 2. per-block SFX (silence fallback when a block has no audio), then concat
i=0; sfx_in=""; sfx_map=""
for clip in "${clips[@]}"; do
  i=$((i+1))
  if ! ffmpeg -loglevel error -y -i "$clip" -vn -t $BLOCK -ac 2 -ar 48000 "$WORK/sfx$i.wav" 2>/dev/null; then
    ffmpeg -loglevel error -y -f lavfi -t $BLOCK -i anullsrc=r=48000:cl=stereo "$WORK/sfx$i.wav"
  fi
  sfx_in="$sfx_in -i $WORK/sfx$i.wav"; sfx_map="$sfx_map[$((i-1)):a]"
done
ffmpeg -loglevel error -y $sfx_in -filter_complex "${sfx_map}concat=n=$N:v=0:a=1[a]" -map "[a]" "$WORK/sfx_all.wav"

# 3. concat blocks at target size, each trimmed to exactly 10s, uniform fps
i=0; vin=""; vf=""; vmap=""
for clip in "${clips[@]}"; do
  vin="$vin -i $clip"
  vf="$vf[$i:v]trim=duration=$BLOCK,setpts=PTS-STARTPTS,scale=$W:$H:flags=lanczos,fps=${FPS}[v$i];"
  vmap="$vmap[v$i]"; i=$((i+1))
done
ffmpeg -loglevel error -y $vin -filter_complex "${vf}${vmap}concat=n=$N:v=1:a=0[v]" \
  -map "[v]" -c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p "$WORK/concat.mp4"
echo "concat: $N blocks → $((N*BLOCK))s @ ${W}x${H}"

# 4. edit map → zoom/shake filter (edit mode: full | zooms | clean)
case "$EDIT" in
  full)  MAP=edit_map.json;;
  zooms) python3 -c "import json;m=json.load(open('edit_map.json'));m['shakes']=[];json.dump(m,open('$WORK/map.json','w'))"; MAP="$WORK/map.json";;
  clean) echo '{"punches":[],"shakes":[]}' > "$WORK/map.json"; MAP="$WORK/map.json";;
  *) echo "edit must be full|zooms|clean"; exit 1;;
esac
VF=$(python3 "$HERE/edit.py" --map "$MAP" --w $W --h $H --print-vf)

# 5. narration from t=0 over ducked SFX, loudnorm, trim to narration end + 0.4s
NDUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$NARR")
DUR=$(python3 -c "print(f'{float(\"$NDUR\")+0.4:.2f}')")
MAX=$((N*BLOCK))
python3 -c "import sys; d=float('$NDUR'); sys.exit(1 if d>$MAX else 0)" || { echo "narration ${NDUR}s is longer than the ${MAX}s of video — shorten the script and re-voice (never stretch)"; exit 1; }
ffmpeg -loglevel error -y -i "$WORK/concat.mp4" -i "$NARR" -i "$WORK/sfx_all.wav" -filter_complex \
  "[0:v]${VF}[v];[2:a]volume=0.25[sfx];[1:a][sfx]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5[a]" \
  -map "[v]" -map "[a]" -t "$DUR" -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k final.mp4

# 6. QC
ffprobe -v error -show_entries stream=width,height:format=duration -of default=noprint_wrappers=1 final.mp4
rm -rf "$WORK"
echo "done → $DIR/final.mp4 (narration ${NDUR}s, edit=$EDIT)"
