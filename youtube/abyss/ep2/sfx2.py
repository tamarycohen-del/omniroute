# ABYSS #2 sound: thunder at frame 0, rain + waves on the surface, sonar ping, dive under, underwater bed, creature rumble, back up, water surge, eye boom, blink slam, cut.
import sys, subprocess, numpy as np
sys.path.insert(0, '/home/user/omniroute/youtube/tools'); from sfxkit import Kit
SR = 48000; T = 25.5; N = int(SR * T); L = np.zeros(N); R = np.zeros(N); k = Kit(SR)
k.place(L, R, 'cinematic-thunder-big', at=0.02, gain=0.9)
k.bed(L, R, 'rain-water', 0, 6.5, 0.8, fade=0.05); k.bed(L, R, 'waves-rocks', 0, 6.5, 0.6, fade=0.05)
for at in (0.6, 3.0, 5.4):
    n = int(1.6 * SR); x = np.arange(n) / SR; p = np.sin(2 * np.pi * 1150 * x) * np.exp(-x * 5) * 0.3; i0 = int(at * SR); L[i0:i0 + n] += p * 0.8; R[i0:i0 + n] += p
k.place(L, R, 'cinematic-thunder-massive', at=2.05, gain=0.5)
k.place(L, R, 'reverse-whoosh-medium-strong', at=6.3, gain=0.6); k.shot(L, R, 'splash-plunge', 6.25, 1.0)
k.bed(L, R, 'underwater-deep', 6.4, 17.3, 1.0, fade=0.3)
k.place(L, R, 'bass-rumble-long', at=9.5, gain=0.7); k.bed(L, R, 'rumble-quake', 11, 17.2, 0.8, fade=1.5)
k.bed(L, R, 'heart-beat', 12.5, 17.2, 0.8, fade=0.5)
k.place(L, R, 'boom-hit-medium', at=15.8, gain=0.7)
k.shot(L, R, 'splash-plunge', 17.15, 0.9); k.bed(L, R, 'rain-water', 17.2, 24.6, 0.7, fade=0.2); k.bed(L, R, 'waves-rocks', 17.2, 24.6, 0.8, fade=0.2)
k.place(L, R, 'riser-2s-strong', at=18.3, gain=0.6); k.place(L, R, 'boom-drop-strong', at=18.35, gain=1.0); k.place(L, R, 'cinematic-thunder-massive', at=19.25, gain=0.7)
k.bed(L, R, 'stream-trickle', 19, 24.5, 0.6, fade=0.5)
k.place(L, R, 'cinematic-slam-big', at=22.85, gain=0.8)
k.place(L, R, 'bass-sub-drop-long', at=24.6, gain=0.5)
st = np.stack([L, R], 1); st[int(24.62 * SR):] *= np.linspace(1, 0, N - int(24.62 * SR))[:, None] ** 3
st /= max(1e-9, np.abs(st).max()) / 0.8
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false', '-ar', '48000', 'mix.wav'], input=st.astype(np.float32).tobytes(), check=True); print('ok')
