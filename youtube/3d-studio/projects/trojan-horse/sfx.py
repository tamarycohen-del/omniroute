# Trojan Horse cinematic mix: narration on top, waves/wind by day, crowd-less foley, rope creaks, wheel rumble, gate slam, night crickets + torch, booms on the twist.
import sys, json, subprocess, numpy as np
sys.path.insert(0, '/home/user/omniroute/youtube/tools'); from sfxkit import Kit
SR = 48000; T = 32.2; N = int(SR * T); L = np.zeros(N); R = np.zeros(N); k = Kit(SR)
W = json.load(open('voice/words.json')); wt = lambda w, n=1: [x['t'] for x in W if x['word'].lower().strip('.,') == w][n - 1]
day_end = wt('that') - 0.15
k.bed(L, R, 'waves-rocks', 0, wt('the', 3) + 3, 0.5, fade=0.4); k.bed(L, R, 'wind-trees', 0, day_end, 0.25) if False else k.bed(L, R, 'wind-gale', 0, day_end, 0.12)
k.place(L, R, 'cinematic-drum-big', at=0.05, gain=0.5)
k.shot(L, R, 'floor-creak', wt('told') - 0.1, 0.6)
k.place(L, R, 'reverse-whoosh-medium-soft', at=wt('army') - 0.35, gain=0.5)
k.place(L, R, 'boom-hit-medium', at=wt('no'), gain=0.8)                       # "held NO army"
k.place(L, R, 'whoosh-medium-soft', at=wt('the', 3), gain=0.4)
k.bed(L, R, 'rumble-quake', wt('and') - 0.1, day_end, 0.45, fade=0.6)        # wheels on stone
k.place(L, R, 'cinematic-slam-big', at=wt('themselves') + 0.6, gain=0.6)     # horse scrapes through the gate
k.bed(L, R, 'night-crickets' if False else 'room_tone-quiet', day_end, T, 0.6, fade=0.4)
k.shot(L, R, 'chain-rattle', wt('slid') - 0.2, 0.5)
k.shot(L, R, 'door-creak', wt('opened') - 0.05, 0.9); k.place(L, R, 'impact-heavy-firm', at=wt('opened') + 0.5, gain=0.6)
k.place(L, R, 'riser-2s-soft', at=wt('torch'), gain=0.4)
k.place(L, R, 'boom-drop-medium', at=wt('so') + 0.05, gain=0.6)
k.place(L, R, 'cinematic-thunder-big', at=wt('it') + 0.1, gain=0.35)
sfx = np.stack([L, R], 1); sfx /= max(1e-9, np.abs(sfx).max()) / 0.5
v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'voice/narration.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
mix = sfx.copy(); n = min(len(v), N); duck = np.ones(N); env = np.convolve(np.abs(v[:n, 0]) > 0.02, np.ones(SR // 5) / (SR // 5), 'same'); duck[:n] = 1 - 0.55 * np.clip(env * 3, 0, 1)
mix *= duck[:, None]; mix[:n] += v[:n] * 1.0; mix[int((T - 0.9) * SR):] *= np.linspace(1, 0, N - int((T - 0.9) * SR))[:, None]
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'acompressor=threshold=-20dB:ratio=3:attack=5:release=250:makeup=2,loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false', '-ar', '48000', 'mix.wav'], input=mix.astype(np.float32).tobytes(), check=True); print('ok')
