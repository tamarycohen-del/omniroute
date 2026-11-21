#!/usr/bin/env python3
"""Cut the vertical render into 6 Shorts: PART label at the start, end card with a CTA line pointing to the full video.
   python3 shorts.py <vertical_frames_dir> <out_dir>"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); FR, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
T = {s['shot']: s for s in json.load(open(os.path.join(HERE, 'timeline.json')))['shots']}
PARTS = [('S01', 'S13'), ('S14', 'S24'), ('S25', 'S35'), ('S36', 'S43B'), ('S44', 'S54B'), ('S55', 'S65')]
GRADE = 'eq=saturation=0.72:contrast=0.97,colorbalance=rs=0.04:bs=-0.04'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def dt(txt, y, size, t0, t1, col='white'):
    return f"drawtext=fontfile={FONT}:text='{txt}':fontsize={size}:fontcolor={col}:borderw=10:bordercolor=black:x=(w-tw)/2:y={y}:enable='between(t,{t0},{t1})'"
for i, (a, b) in enumerate(PARTS, 1):
    s0, s1 = T[a]['s'], T[b]['end']; cta = os.path.join(HERE, 'cta', f'end{i}.wav')
    cd = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', cta], capture_output=True, text=True).stdout) + 1.0
    f0, n = int(s0 * 24), int((s1 - s0) * 24); dur = s1 - s0
    vf = (f"{GRADE},tpad=stop_mode=clone:stop_duration={cd},"
          f"{dt(f'PART {i}', 150, 120, 0, 2.6, '#fff04a')},"
          f"boxblur=14:2:enable='gte(t,{dur})',drawbox=x=0:y=0:w=iw:h=ih:color=black@0.45:t=fill:enable='gte(t,{dur})',"
          f"{dt('FULL STORY', 760, 120, dur, dur + cd, '#fff04a')},{dt('ON MY CHANNEL', 900, 96, dur, dur + cd)}")
    af = (f"[0:a]atrim={s0}:{s1},asetpts=PTS-STARTPTS[n];[1:a]atrim={s1}:{s1 + cd},asetpts=PTS-STARTPTS,volume=1.3[bd];"
          f"[2:a]adelay=300|300,apad=pad_dur=1[c];[bd][c]amix=inputs=2:normalize=0[e];[n][e]concat=n=2:v=0:a=1,loudnorm=I=-14:TP=-1:LRA=11[a]")
    out = os.path.join(OUT, f'Opposite-Clone-Part{i}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-start_number', str(f0), '-i', os.path.join(FR, 'f%04d.jpg'), '-i', os.path.join(HERE, 'mix.wav'), '-i', os.path.join(HERE, 'bed.wav'), '-i', cta,
                    '-frames:v', str(n + int(cd * 24)), '-filter_complex', f'[0:v]{vf}[v];' + af.replace('[2:a]', '[3:a]').replace('[1:a]', '[2:a]').replace('[0:a]', '[1:a]'), '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    print(out, round(dur + cd, 1))
