"""Free local narration with VoiceStudio's OmniVoice engine, with EMOTION PER SENTENCE.

OmniVoice can't be told "sound scared"; it copies the delivery of the reference clip it clones.
So every line names an emotion from youtube/sfx/voice-emotions/bank.json (calm, whisper, urgent, warm, tense, curious, dread)
and is generated from that clip. Lines can also carry a speed and a pause after them.

Script format (one line each):
    emotion | text                      e.g.  whisper | Then the rope in the shaft... started to move.
    emotion | text | speed | pause_ms   e.g.  urgent  | Three seconds. Choose! | 1.1 | 600
    # comments and blank lines are ignored

Run (needs the VoiceStudio env, see youtube/sfx/voice-emotions/README.md):
    HF_HOME=... HF_HUB_DISABLE_XET=1 PYTHONPATH=<VoiceStudio checkout> <venv>/bin/python youtube/tools/vstts.py script.txt out.wav
Writes out.wav (48 kHz stereo, each line loudness-matched; whispers kept quieter) and out.lines.json (start/end of each line).
Writing tips for expression: short sentences; punctuation drives the rhythm ("..." = hesitation, "!" = force);
split a line where the emotion changes and give each part its own emotion.
"""
import json, os, subprocess, sys
import numpy as np, torch

BANK = os.path.join(os.path.dirname(__file__), '..', 'sfx', 'voice-emotions')
GAIN = {'whisper': -6.0, 'dread': -3.0}  # dB relative to the others, so whispers stay intimate


def main(script, out):
    from omnivoice.models.omnivoice import OmniVoice
    from omnivoice.utils.dtype import tts_dtype_name
    bank = json.load(open(os.path.join(BANK, 'bank.json')))
    model = OmniVoice.from_pretrained('k2-fsa/OmniVoice', device_map='cpu', dtype=getattr(torch, tts_dtype_name('cpu')), allow_tokenizer_fallback=True)
    sr = model.sampling_rate; pieces, lines, t = [], [], 0.0
    for raw in open(script, encoding='utf-8'):
        raw = raw.strip()
        if not raw or raw.startswith('#'):
            continue
        parts = [p.strip() for p in raw.split('|')]
        emo, text = parts[0], parts[1]
        speed = float(parts[2]) if len(parts) > 2 and parts[2] else 1.0
        pause = int(parts[3]) if len(parts) > 3 and parts[3] else 350
        ref = bank[emo]
        a = model.generate(text=text, ref_audio=os.path.join(BANK, ref['file']), ref_text=ref['text'], speed=speed, num_step=32)[0]
        a = a.detach().cpu().numpy().astype(np.float32).reshape(-1)
        rms = float(np.sqrt(np.mean(a ** 2)) + 1e-9); a = a * (0.08 / rms) * 10 ** (GAIN.get(emo, 0) / 20)
        lines.append({'emotion': emo, 'text': text, 's': round(t, 2), 'e': round(t + len(a) / sr, 2)})
        pieces += [a, np.zeros(int(sr * pause / 1000), np.float32)]; t += len(a) / sr + pause / 1000
        print(f'{emo:8s} {lines[-1]["s"]:6.2f}s  {text}', flush=True)
    y = np.concatenate(pieces); y = y / max(1.0, float(np.abs(y).max()) / 0.95)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-', '-ar', '48000', '-ac', '2', out], input=y.tobytes(), check=True)
    json.dump(lines, open(os.path.splitext(out)[0] + '.lines.json', 'w'), indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
