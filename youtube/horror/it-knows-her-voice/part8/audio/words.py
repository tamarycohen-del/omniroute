import json, sys
from faster_whisper import WhisperModel
import subprocess, numpy as np
def dec(f): return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout,np.float32)
m = WhisperModel("small.en", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    segs, _ = m.transcribe(dec(f), word_timestamps=True, language="en")
    W = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    json.dump(W, open(f.replace(".mp3", "_words.json"), "w"))
    print(f, len(W), " ".join(f"{w['w']}@{w['s']}" for w in W))
