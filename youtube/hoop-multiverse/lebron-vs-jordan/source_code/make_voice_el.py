"""Assemble the 10 ElevenLabs line takes (assets/el/l0..l9.mp3) into one narration with exact line timings.
usage: make_voice_el.py  -> assets/voice_el.wav + assets/voice_el.lines.json (s/e = speech start/end of each line)"""
import json, os, subprocess
import numpy as np, soundfile as sf
SR = 48000; D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
TEXT = ["Prime LeBron. Prime Jordan. Tied game. One shot left.", "Who takes it? Let's find out.", "Michael Jordan. Six foot six. Six trips to the Finals. Six championships. He never lost one.",
        "Ten scoring titles. Thirty point one points a game. The highest average in NBA history.", "LeBron James. Six foot nine. Two hundred fifty pounds. Four championships.",
        "More than forty thousand career points. The all-time scoring king.", "So we tip it off. First to eleven.", "Jordan scores first. LeBron answers with a dunk! Jordan, fadeaway. LeBron, right back at him.",
        "Ten all. Next bucket wins.", "Last shot. Ball in LeBron's hands. He rises up... and shoots."]
GAP = [0.25, 0.25, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3]            # silence after each line (s)
dec = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
out = []; lines = []; t = 0.0
for i in range(10):
    a = dec(os.path.join(D, 'el', f'l{i}.mp3')); m = np.abs(a).max(axis=1) > 0.012; idx = np.where(m)[0]
    a = a[max(0, idx[0] - int(0.03 * SR)): idx[-1] + int(0.08 * SR)]      # trim the take's silence, keep 30 ms / 80 ms
    s = t + 0.03; e = t + len(a) / SR - 0.08
    out.append(a); t += len(a) / SR
    lines.append({'text': TEXT[i], 's': round(s, 3), 'e': round(e, 3)})
    if i < 9: out.append(np.zeros((int(GAP[i] * SR), 2), np.float32)); t += GAP[i]
sf.write(os.path.join(D, 'voice_el.wav'), np.concatenate(out), SR)
json.dump(lines, open(os.path.join(D, 'voice_el.lines.json'), 'w'), indent=1)
print('voice_el.wav', round(t, 2), 's'); print([(l['s'], l['e']) for l in lines])
