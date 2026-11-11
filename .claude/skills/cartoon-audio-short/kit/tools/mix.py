#!/usr/bin/env python3
"""Level-locked mix:  python3 mix.py voice.mp3 music.wav sfx.wav  ->  mix_raw.wav

Music is set to exactly 50 % (-6 dB) of the voice's gated RMS. SFX are set to 50 % of the voice's
gated RMS too, then scaled down further if needed so their peaks stay at or below 0.7x the voice peak.
No ducking or compression: the voice is untouched. finish.sh applies the single linear loudness gain
and the peak limiter to the whole mix afterwards.
"""
import subprocess, sys, wave
import numpy as np

SR = 48000


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def gated_rms(x, win=0.4, gate_db=-40.0):
    """RMS over 400 ms blocks louder than gate_db relative to the loudest block (ignores silence)."""
    n = int(win * SR)
    if len(x) < n:
        return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
    blocks = x[: len(x) // n * n].reshape(-1, n)
    r = np.sqrt(np.mean(blocks ** 2, axis=1)) + 1e-12
    keep = r > r.max() * 10 ** (gate_db / 20)
    return float(np.sqrt(np.mean(r[keep] ** 2)))


def db(x):
    return 20 * np.log10(max(x, 1e-12))


def main():
    if len(sys.argv) < 4:
        sys.exit("usage: python3 mix.py voice.mp3 music.wav sfx.wav [out.wav]")
    voice, music, sfx = (load(p) for p in sys.argv[1:4])
    out_path = sys.argv[4] if len(sys.argv) > 4 else "mix_raw.wav"
    n = len(voice)  # the video is exactly as long as the voiceover
    music = np.pad(music, (0, max(0, n - len(music))))[:n]
    sfx = np.pad(sfx, (0, max(0, n - len(sfx))))[:n]

    v_rms, v_peak = gated_rms(voice), float(np.abs(voice).max())
    target = 0.5 * v_rms
    m_gain = target / gated_rms(music) if np.any(music) else 0.0
    s_gain = target / gated_rms(sfx) if np.any(sfx) else 0.0
    if s_gain and np.abs(sfx).max() * s_gain > 0.7 * v_peak:
        s_gain = 0.7 * v_peak / np.abs(sfx).max()
    music *= m_gain
    sfx *= s_gain

    mix = voice + music + sfx
    pk = float(np.abs(mix).max())
    if pk > 0.99:  # headroom only: one linear gain on the whole mix keeps all ratios intact
        mix *= 0.99 / pk
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
        w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())

    print(f"voice gated RMS {db(v_rms):6.1f} dBFS, peak {db(v_peak):6.1f} dBFS")
    if np.any(music):
        print(f"music vs voice  {db(gated_rms(music)) - db(v_rms):6.1f} dB   (target -6.0)")
    if np.any(sfx):
        print(f"sfx   vs voice  {db(gated_rms(sfx)) - db(v_rms):6.1f} dB   (target <= -6.0), "
              f"sfx peak {np.abs(sfx).max() / v_peak:.2f}x voice peak (cap 0.70)")
    print(f"wrote {out_path} ({n / SR:.2f} s)")


if __name__ == "__main__":
    main()
