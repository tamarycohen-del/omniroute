# ABYSS #1 sound: surface waves -> splash -> underwater bed, sonar pings, whale rumble, heartbeat, riser into the eye, boom, slam, cut.
import sys, subprocess, numpy as np
sys.path.insert(0, '/home/user/omniroute/youtube/tools'); from sfxkit import Kit
SR = 48000; T = 28.0; N = int(SR * T); L = np.zeros(N); R = np.zeros(N); k = Kit(SR); t = np.arange(N) / SR
k.place(L, R, 'cinematic-drum-big', at=0.0, gain=0.7)          # frame-0 hit
k.bed(L, R, 'waves-rocks', 0, 1.2, 0.9, fade=0.05)
k.shot(L, R, 'splash-plunge', 0.25, 1.2)
k.bed(L, R, 'underwater-deep', 0.35, 27.4, 0.9, fade=0.5)
for at in (2.6, 7.0): k.place(L, R, 'reverse-whoosh-short-soft', at=at, gain=0.5)
# sonar pings (synth): every ~2.4 s from 3 s to 22 s, slower echo deeper
for i, at in enumerate(np.arange(3.0, 22.0, 2.4)):
    n = int(1.6 * SR); x = np.arange(n) / SR; p = np.sin(2 * np.pi * 1180 * x) * np.exp(-x * 5) * 0.25
    p = p + np.concatenate([np.zeros(int(0.35 * SR)), p[:-int(0.35 * SR)]]) * 0.4
    i0 = int(at * SR); m = min(n, N - i0); L[i0:i0 + m] += p[:m] * 0.8; R[i0:i0 + m] += p[:m]
k.bed(L, R, 'rumble-quake', 9.8, 14.8, 0.8, fade=1.0)            # whale passing
k.place(L, R, 'bass-rumble-long', at=10.5, gain=0.6)
k.place(L, R, 'boom-hit-soft', at=15.0, gain=0.5)                # the abyss
k.bed(L, R, 'heart-beat', 17.5, 23.2, 0.9, fade=0.5)
k.bed(L, R, 'rumble-quake', 19.0, 23.3, 0.7, fade=1.5)           # trench closing in
k.place(L, R, 'riser-4s-strong', at=23.3, gain=0.6)              # riser ends on the eye
k.place(L, R, 'boom-drop-strong', at=23.35, gain=1.0)
k.place(L, R, 'cinematic-thunder-massive', at=23.4, gain=0.6)
k.place(L, R, 'cinematic-slam-massive', at=25.95, gain=0.9)       # the blink
k.place(L, R, 'bass-sub-drop-long', at=27.4, gain=0.6)
st = np.stack([L, R], 1); st[int(27.45 * SR):] *= np.linspace(1, 0, N - int(27.45 * SR))[:, None]
st /= max(1e-9, np.abs(st).max()) / 0.8
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false', '-ar', '48000', 'mix.wav'], input=st.astype(np.float32).tobytes(), check=True)
print('ok')
