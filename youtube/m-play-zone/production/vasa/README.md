# Pilot: The Warship That Sank Before It Left the Harbor (Vasa, 1628)

Built with the `cartoon-audio-short` skill. Voice: Edge TTS en-US-AndrewNeural (+6 % rate, -4 Hz pitch), 65.96 s, 1979 frames.

- `script.txt` narration (facts checked: Vasa sank 10 Aug 1628 about 1,300 m into its maiden voyage after ~20 minutes;
  64 guns; failed heel test with 30 running sailors; raised 1961 = 333 years; museum has more than a million visitors a year).
- `web/world_vasa.js` the harbour, lofted ship hull, seabed and museum (spliced into the engine's `main.js` world section).
- `web/story.js` 23 shots, cameras, ship pose, cast and effects. `audio.py` music + SFX stems (uses `audio_lib.py`).
- `work/` word and phrase timings. `lookcheck_sheet.jpg` stills from each shot.

Rebuild: `bash .claude/skills/cartoon-audio-short/kit/tools/setup.sh <dir>`, splice `world_vasa.js` into `web/main.js`
between `// ---------- world ----------` and `// ---------- cards ----------`, copy `story.js`, then render and finish.
