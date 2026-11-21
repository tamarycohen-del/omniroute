#!/usr/bin/env python3
"""CTA lines for the Shorts in the narrator voice (Kokoro am_adam, pitch +2.3 st, +6%)."""
import os, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'cta'); M = os.environ.get('KOKORO_DIR', '/tmp/claude-0/tts')
k = Kokoro(os.path.join(M, 'kokoro-v1.0.onnx'), os.path.join(M, 'voices-v1.0.bin'))
L = {'end1': "Want to know what happens next? The full story is on my channel.", 'end2': "Wanna see how it ends? The full video is on my channel.", 'end3': "The full story is waiting on my channel. Go watch it.",
     'end4': "This is only part of it. Watch the full story on my channel.", 'end5': "It gets crazier. Full video on my channel.", 'end6': "Which one is the real Alex? Watch the full story on my channel and tell me."}
for n, t in L.items():
    a, sr = k.create(t, voice='am_adam', speed=1.0, lang='en-us'); raw = os.path.join(OUT, n + '_raw.wav'); sf.write(raw, a, sr)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'asetrate=24000*1.14,aresample=48000,atempo=0.9298', os.path.join(OUT, n + '.wav')], check=True); os.remove(raw)
print('cta ok')
