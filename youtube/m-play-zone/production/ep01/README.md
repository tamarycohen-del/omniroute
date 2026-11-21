# EP01 production

- Images: Gemini image generation (via Composio), 9:16, prompts in `../../episodes/ep01-cell-217.md`.
- Voice: Microsoft Edge neural TTS `en-US-ChristopherNeural`, rate -8%, pitch -6Hz (generated in the Composio sandbox; word timings in `vo-words.json`).
- `render.py`: builds the 1080x1920 30fps picture (Ken Burns motion, 2x2 opening grid, number badges, word-highlight captions, CAUGHT/SURVIVED stamps, loop ending).
- `audio.py`: VO plus a synthesized music bed and SFX, normalised to -14 LUFS.
- Expected asset layout next to the scripts: `dl/img/*.jpg`, `dl/vo/L01..L12.mp3`, `dl/vo/words.json`.

Run: `python3 audio.py && python3 render.py`, then mux `out/video_noaudio.mp4` + `out/mix.wav` with ffmpeg (8 Mbps H.264, AAC 192k).
The final mp4 (41.6 s, about 43 MB) is not committed.
