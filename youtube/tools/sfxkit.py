"""Use the CC0 SFX Kit sounds (youtube/sfx/sfx-kit, from github.com/wyzowl/sfx-kit) in our numpy mixers.

    from sfxkit import Kit
    kit = Kit(SR)                       # 48000
    kit.place(L, R, 'cinematic-thunder-big', at=12.3, gain=0.8)   # at = the sound's SYNC POINT (impact), not its start
    kit.find('door')                    # search ids/descriptions/tags
Each sound's metadata has sync.at (where the hit lands), level and under_voiceover_db (how much quieter to sit under speech).
"""
import json, os, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..', 'sfx', 'sfx-kit')
EAR = os.path.join(os.path.dirname(__file__), '..', 'sfx', 'earshot')


class Kit:
    def __init__(self, sr=48000):
        self.sr = sr
        self.meta = {x['id']: x for x in json.load(open(os.path.join(ROOT, 'sounds.json')))['sounds']}
        self._cache = {}

    def find(self, word):
        w = word.lower()
        return [i for i, x in self.meta.items() if w in json.dumps(x).lower()]

    def load(self, sid):
        if sid not in self._cache:
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, self.meta[sid]['file']), '-ac', '2', '-ar', str(self.sr), '-f', 'f32le', '-'],
                                 capture_output=True, check=True).stdout
            self._cache[sid] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
        return self._cache[sid]

    def place(self, L, R, sid, at, gain=1.0, under_voice=False, pan=0.0):
        """Mix sound `sid` into L/R so that its sync point lands at `at` seconds."""
        x = self.load(sid)
        sync = float((self.meta[sid].get('sync') or {}).get('at') or 0.0)
        if under_voice:
            gain *= 10 ** (float(self.meta[sid].get('under_voiceover_db') or -6) / 20)
        i0 = int((at - sync) * self.sr)
        a, b = max(0, i0), min(len(L), i0 + len(x))
        if b <= a:
            return
        seg = x[a - i0:b - i0]
        L[a:b] += seg[:, 0] * gain * (1 - pan) ** 0.5
        R[a:b] += seg[:, 1] * gain * (1 + pan) ** 0.5

    # ---- earshot files (youtube/sfx/earshot/<name>.ogg): ambience loops and foley one-shots ----
    def ear(self, name):
        key = 'ear:' + name
        if key not in self._cache:
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(EAR, name + '.ogg'), '-ac', '2', '-ar', str(self.sr), '-f', 'f32le', '-'],
                                 capture_output=True, check=True).stdout
            self._cache[key] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
        return self._cache[key]

    def shot(self, L, R, name, at, gain=1.0, pan=0.0):
        """One-shot that STARTS at `at` seconds."""
        x = self.ear(name); i0 = int(at * self.sr); a, b = max(0, i0), min(len(L), i0 + len(x))
        if b > a:
            L[a:b] += x[a - i0:b - i0, 0] * gain * (1 - pan) ** 0.5; R[a:b] += x[a - i0:b - i0, 1] * gain * (1 + pan) ** 0.5

    def bed(self, L, R, name, start, end, gain=1.0, fade=0.8):
        """Loop an ambience from `start` to `end` with fades (earshot loops are seamless)."""
        x = self.ear(name); a, b = int(start * self.sr), min(len(L), int(end * self.sr))
        if b <= a:
            return
        n = b - a; reps = int(np.ceil(n / len(x))); y = np.tile(x, (reps, 1))[:n]
        f = max(1, int(fade * self.sr)); env = np.ones(n); env[:f] = np.linspace(0, 1, min(f, n)); env[-f:] = np.minimum(env[-f:], np.linspace(1, 0, min(f, n)))
        L[a:b] += y[:, 0] * env * gain; R[a:b] += y[:, 1] * env * gain
