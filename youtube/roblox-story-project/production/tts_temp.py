#!/usr/bin/env python3
"""TEMP narration (offline MBROLA us2 voice) -> narration_temp.wav + timeline.json (start/end of every shot).
Replace narration later: keep lines.txt, record each line, rerun with --from-dir."""
import json, os, subprocess, sys, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'tts'); os.makedirs(OUT, exist_ok=True)
lines = [l.rstrip('\n').split('|', 1) for l in open(os.path.join(HERE, 'lines.txt')) if l.strip()]
def say(txt):
    t = txt.replace('Xela', 'Zella').replace('"', '').replace('...', ', ')
    import re; t = re.sub(r'\b([A-Z]{2,})\b', lambda m: m.group(1).lower() if m.group(1) not in ('TV',) else m.group(1), t)
    return t
def load(p):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-af', 'atempo=1.12,highpass=f=70', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
parts, tl, t, prev = [], [], 0.6, None
parts.append(np.zeros(int(0.6 * SR)))
for i, (sid, txt) in enumerate(lines):
    w = os.path.join(OUT, f'{i:03d}.wav')
    if not os.path.exists(w): subprocess.run(['espeak-ng', '-v', 'mb-us2', '-s', '172', '-p', '58', say(txt), '-w', w], check=True, capture_output=True)
    x = load(w); idx = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, idx[0] - 800): idx[-1] + 2400] if len(idx) else x
    gap = 0.18 if sid == prev else 0.42
    if prev is not None: parts.append(np.zeros(int(gap * SR))); t += gap
    if sid != prev: tl.append({'shot': sid, 's': round(t, 3)})
    parts.append(x); t += len(x) / SR; tl[-1]['e'] = round(t, 3); prev = sid
parts.append(np.zeros(int(1.2 * SR))); t += 1.2
v = np.concatenate(parts); v = v / np.abs(v).max() * 0.9
with wave.open(os.path.join(HERE, 'narration_temp.wav'), 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((v * 32767).astype(np.int16).tobytes())
# shot boundaries: each shot runs from its first line start to the next shot's start
for k, s in enumerate(tl): s['end'] = round(tl[k + 1]['s'] if k + 1 < len(tl) else t, 3)
tl[0]['s'] = 0.0
json.dump({'total': round(t, 3), 'shots': tl}, open(os.path.join(HERE, 'timeline.json'), 'w'), indent=1)
print('total', round(t, 1), 's', len(tl), 'shots')
