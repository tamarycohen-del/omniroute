#!/bin/bash
# full pipeline after the narration exists: words -> build -> mix -> render (6 chunks) -> encode.  usage: run.sh <voice.wav>  (needs the scratchpad town/r2d.mjs)
set -e
S=${S:-/tmp/claude-0/-home-user-omniroute/15d9757d-ec8c-501a-9cf6-046c47f37ef5/scratchpad}
D=$(cd "$(dirname "$0")/.." && pwd); V=$(realpath ${1:-$D/assets/voice_free.wav})
N=${N:-el}   # which narration: el = ElevenLabs takes (assets/voice_el.wav), free = the OmniVoice version
cd $D && cp assets/voice_$N.wav assets/voice_base.wav
python3 source_code/insert_clip.py assets/voice_base.wav assets/orig_${N}_words.json assets/orig_${N}_lines.json assets/well_bye_guys.mp3 assets/voice_mod.wav source_code/words.json source_code/lines.json source_code/clips.json
V=$D/assets/voice_mod.wav
python3 source_code/build.py && python3 source_code/mix.py $V source_code/lines.json source_code/words.json assets/mix.wav | tail -1
TOT=$(python3 -c "import json;print(int((json.load(open('source_code/lines.json'))[-1]['e']+1.76)*30)+1)")
rm -rf $S/lbf && mkdir -p $S/lbf && cd $S/town && C=$(( (TOT+5)/6 ))
for k in 0 1 2 3 4 5; do a=$((k*C)); b=$((a+C-1)); [ $b -ge $TOT ] && b=$((TOT-1)); ROOT=$D/source_code node r2d.mjs lbmj.html $S/lbf $a $b > $S/lbf_$k.log 2>&1 & done; wait
cd $D && ffmpeg -y -v error -framerate 30 -i $S/lbf/f%04d.jpg -i assets/mix.wav -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart lebron_vs_jordan_free.mp4
echo done $TOT frames
