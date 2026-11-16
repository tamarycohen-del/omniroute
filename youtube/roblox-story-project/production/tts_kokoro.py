#!/usr/bin/env python3
"""Narration with the free offline Kokoro voice 'am_adam', pitched up 2.3 semitones and 6% faster
(asetrate x1.14 then atempo 0.9298). -> narration.wav, timeline.json, words.json (estimated word timings)."""
import json, os, re, subprocess, wave
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'tts_k'); os.makedirs(OUT, exist_ok=True)
MODEL = os.environ.get('KOKORO_DIR', '/tmp/claude-0/tts')
lines = [l.rstrip('\n').split('|', 1) for l in open(os.path.join(HERE, 'lines.txt')) if l.strip()]
k = None
def clean(t): return t.replace('Xela', 'Zella').replace('"', '').replace('NEVER', 'never').replace('NOT', 'not').replace('SAY', 'say').replace('STOP', 'stop').replace('KEEP GOING', 'keep going').replace('FASTER', 'faster').replace('EVERYTHING', 'everything').replace('PANIC', 'panic').replace('REAL', 'real')
def load(p):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-af', 'asetrate=24000*1.14,aresample=48000,atempo=0.9298', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
parts, tl, words, t, prev = [np.zeros(int(0.4 * SR))], [], [], 0.4, None
for i, (sid, txt) in enumerate(lines):
    w = os.path.join(OUT, f'{i:03d}.wav')
    if not os.path.exists(w):
        if k is None: k = Kokoro(os.path.join(MODEL, 'kokoro-v1.0.onnx'), os.path.join(MODEL, 'voices-v1.0.bin'))
        a, sr = k.create(clean(txt), voice='am_adam', speed=1.0, lang='en-us'); sf.write(w, a, sr)
    x = load(w); idx = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, idx[0] - 600): idx[-1] + 1800] if len(idx) else x
    gap = 0.12 if sid == prev else 0.3
    if prev is not None: parts.append(np.zeros(int(gap * SR))); t += gap
    if sid != prev: tl.append({'shot': sid, 's': round(t, 3)})
    # estimated word timings: speech regions split by length (vowel groups ~ syllables)
    ws = txt.split(); syl = [max(1, len(re.findall(r'[aeiouy]+', re.sub(r'[^a-z]', '', w_.lower())))) + (0.6 if re.search(r'[,.!?…]$', w_) else 0) for w_ in ws]
    dur = len(x) / SR - 0.05; tot = sum(syl); c = t + 0.02
    for w_, s_ in zip(ws, syl): d = dur * s_ / tot; words.append({'w': w_.strip('"'), 's': round(c, 3), 'e': round(c + d, 3)}); c += d
    parts.append(x); t += len(x) / SR; tl[-1]['e'] = round(t, 3); prev = sid
parts.append(np.zeros(int(1.2 * SR))); t += 1.2
v = np.concatenate(parts); v = v / np.abs(v).max() * 0.9
with wave.open(os.path.join(HERE, 'narration.wav'), 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((v * 32767).astype(np.int16).tobytes())
for j, s in enumerate(tl): s['end'] = round(tl[j + 1]['s'] if j + 1 < len(tl) else t, 3)
tl[0]['s'] = 0.0
json.dump({'total': round(t, 3), 'shots': tl}, open(os.path.join(HERE, 'timeline.json'), 'w'), indent=1)
json.dump(words, open(os.path.join(HERE, 'words.json'), 'w'))
print('total', round(t, 1), 's', len(tl), 'shots', len(words), 'words')
