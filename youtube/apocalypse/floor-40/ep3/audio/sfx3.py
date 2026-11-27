# FLOOR 40 Part 3: real library sounds (SFX Kit + earshot). Rain + thunder on frame 0, chair scrape, eating, night room tone,
# creaking closet, dripping, hollow shaft wind, rope + pulley, climbing, heartbeat, riser, two knocks, hard cut.
import sys, json, subprocess, numpy as np
sys.path.insert(0, '/home/user/omniroute/youtube/tools'); from sfxkit import Kit
SR = 48000; T = float(open('total.txt').read()); N = int(SR * T); L = np.zeros(N); R = np.zeros(N); k = Kit(SR)
V = json.load(open('words3.json'))
def first(w, n=1):
    c = 0
    for x in V:
        if x['w'].lower().strip('.,?!"') == w and (c := c + 1) == n: return x['s']
end = V[-1]['e']
k.place(L, R, 'cinematic-thunder-big', at=0.02, gain=0.8); k.bed(L, R, 'rain-window', 0, first('that') - 0.2, 0.6, fade=0.05)
k.shot(L, R, 'floor-creak', 0.3, 0.8); k.place(L, R, 'impact-medium-firm', at=0.9, gain=0.7)            # chair jammed under the handle
k.shot(L, R, 'drip-drop', first('biscuit') + 0.6, 0.5); k.shot(L, R, 'drip-drop', first('biscuit') + 1.0, 0.4)  # lapping soup
k.bed(L, R, 'room_tone-quiet', first('that') - 0.2, T, 0.7, fade=0.5)
k.place(L, R, 'cinematic-thunder-massive', at=first('that') - 0.1, gain=0.35)
k.shot(L, R, 'door-creak', first('closet', 2) - 0.2, 1.0)
k.bed(L, R, 'stream-trickle', first('inside') - 0.2, first('nobody'), 0.5, fade=0.5)
k.shot(L, R, 'metal-drop', first('hatch.') - 0.1 if first('hatch.') else first('hatch'), 0.4)
k.bed(L, R, 'wind-window', first('an') - 0.2, end + 1.4, 0.35, fade=0.6)                              # hollow shaft
for i in range(4): k.shot(L, R, 'drip-drop', first('walls') + i * 0.9, 0.5)
k.place(L, R, 'boom-hit-soft', at=first('it'), gain=0.6)
k.shot(L, R, 'dog-bark', first('biscuit', 2) + 1.6, 0.35)
k.bed(L, R, 'heart-beat', first('then') - 0.2, end + 0.95, 0.8, fade=0.3)
k.shot(L, R, 'chain-rattle', first('rope') - 0.1, 0.9); k.shot(L, R, 'gate-metal', first('rope') + 1.2, 0.4)
k.shot(L, R, 'step-concrete', first('something') - 0.4, 0.5)
k.place(L, R, 'riser-2s-strong', at=end + 0.1, gain=0.5)
for at in (end + 0.12, end + 0.57): k.shot(L, R, 'knock-hollow', at, 1.2); k.place(L, R, 'impact-heavy-firm', at=at, gain=0.7)
sfx = np.stack([L, R], 1); sfx /= max(1e-9, np.abs(sfx).max()) / 0.55
v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'voice.wav', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
duck = np.ones(N)
for w in V: duck[int(max(0, w['s'] - 0.12) * SR):int((w['e'] + 0.25) * SR)] = 0.55
duck = np.convolve(duck, np.ones(SR // 10) / (SR // 10), 'same'); mix = sfx * duck[:, None]; n = min(len(v), N); mix[:n] += v[:n]; mix[int((end + 0.95) * SR):] = 0
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'acompressor=threshold=-20dB:ratio=3:attack=5:release=250:makeup=2,loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false', '-ar', '48000', 'mix.wav'], input=mix.astype(np.float32).tobytes(), check=True); print('ok')
