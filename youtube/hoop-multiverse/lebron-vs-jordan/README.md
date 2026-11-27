# Prime Jordan vs Prime LeBron: who would win? (Multiverse Hoops, vertical Short 1080x1920, ~50 s, nobody wins)

Version 1 = FREE voice (OmniVoice narration, emotion per line) + original numpy music + synthesized swish/crowd/whistle + CC0 sfx-kit.
Plan (user): later swap the narration to ElevenLabs. Nothing else has to be rebuilt:

1. Generate the narration from `source_code/script.txt` (12 lines, one per shot) with ElevenLabs -> `assets/voice_el.mp3` (one take, estimate credits first).
2. Word timings: `python youtube/you-experiment/kd-galactus/source_code/words.py assets/voice_el.mp3` -> `voice_el_words.json`,
   then `python source_code/make_words.py assets/voice_el_words.json source_code/words.json`.
3. `source_code/lines.json` = start/end of each of the 12 lines (same format as `assets/voice_free.lines.json`; shot i starts at line i).
   Easiest: split the ElevenLabs take per line, or match the first word of each line in words.json.
4. `python source_code/build.py` (writes lbmj.html), `python source_code/mix.py assets/voice_el.mp3 source_code/lines.json source_code/words.json assets/mix.wav`,
   render frames with `r2d.mjs` (ROOT=source_code, lbmj.html) in 6 chunks, encode with assets/mix.wav. All on-screen text, counters, the 1-on-1 beats,
   scoring sounds and captions are keyed to the word times, so they follow the new voice automatically.

Look: Jordan = bald, Bulls red #23; LeBron = headband + beard, Lakers purple/gold #23; same QA'd rig as the KD video (shorts are one convex hull, arms stay on their side),
jersey wordmark/number are fitted inside the shirt and un-mirrored when a player is flipped.
Facts used (all well documented): Jordan 6'6", 6 Finals / 6 titles / never lost a Finals, 10 scoring titles, 30.1 career ppg (highest in NBA history),
LeBron 6'9", 250 lb, 4 titles, more than 40,000 career points (all-time leading scorer). The one-on-one is a fictional what-if: tied 10-10, LeBron takes the last shot, we cut to black before it lands ("Did it go in? You decide.").
Sources: NBA.com / Basketball-Reference career pages.

Sign-off sound: assets/well_bye_guys.mp3 (the user's clip) is mixed in right after the last word (see mix.py). Whole pipeline after a new narration: `source_code/run.sh <voice.wav>`.

Ending (user, 2026-11-27): the video ends on LeBron's last shot, cut to black; no question card, no CTA. The user's clip plays alone in the black as the outro (mix.py: starts right after the cut, music/sfx off). 10 narration lines / 10 shots.

Sound clip (assets/well_bye_guys.mp3, from the user): it replaces the narrator's spoken 'LeBron' in the hook and 'LeBron James' at the start of his intro (source_code/insert_clip.py; later words/lines shift, so all timings stay in sync). NOTE: automatic transcription of the clip is inconsistent ('Well, bye guys!' / 'LeBron James.'), so the user must confirm what it says. The video no longer ends with the channel name or the clip: it ends on the cut to black. Pipeline: `source_code/run.sh` (orig_words/orig_lines = the plain narration timings).

FINAL (ElevenLabs, 2026-11-27): narration = 10 per-line takes, voice Clancy (FLpz0UhC9a7CIfUSBo6S), eleven_v4, 615 credits (assets/el/l0..l9.mp3, text in source_code/make_voice_el.py).
Rebuild: `python source_code/make_voice_el.py` (writes assets/voice_el.wav + lines), whisper words -> `make_words.py` -> assets/orig_el_words.json / orig_el_lines.json, then `N=el source_code/run.sh`.
The user's clip replaces the narrator's spoken 'LeBron' (hook) and 'LeBron James' (intro); joins are cut at the quietest point with 12 ms fades (no clicks).
Publishing is scheduled (send_later trig_012SGr8vLsHRkzT32X2ycddS, 2026-11-28 21:45 Israel): YouTube Multiverse Hoops + Instagram Reels, public, with the thumbnail.

Ending v3 (user): LeBron releases at the end of 'shoots', then HANGS in the air in slow zoom (~1.5 s) while the user's clip plays again (right after the narration, mix.py: TEND), then hard cut to black. Total = last narration word + 1.76 s.

Hook v4 (user): the clip (LeBron's name) plays FIRST, then the narrator says "Versus Prime Jordan. Tied game. One shot left." (ElevenLabs line 0 re-generated, 46 credits; insert_clip.py prepends the clip when line 0 has no 'LeBron' word). ElevenLabs total ~661 credits.

Hook v5 (user): "Prime" (first word of the original ElevenLabs take, assets/el/l0_old.mp3) + the clip (LeBron's name) + "versus Prime Jordan. Tied game. One shot left." (new take l0.mp3). Built by insert_clip.py.
