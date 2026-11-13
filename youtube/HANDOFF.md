# Channel handoff (read this first in a new session)

Branch: `claude/happy-newton-la11y6`. Channel id `UCZfAUpE88vp9EUA2ESHk0KA` (YouTube via Composio, account `youtube_hoist-rumble`).

## Channel
- Current name: "History Oops" (was M-Play Zone). Planned rename: **Factopia**, handle `factopia` (fallbacks `factopia.shorts`, `thefactopia`).
  YouTube blocks a rename until ~2026-11-23; a reminder is scheduled in the old session for 2026-11-23 18:00 Israel time.
- Description + keywords already updated to Factopia (via API). Name, handle and profile picture can only be changed by hand in YouTube Studio.
- Profile picture: `youtube/m-play-zone/factopia-profile.png`. Banner (chosen candidate): `youtube/m-play-zone/factopia-banner-center.jpg`
  (also `-plain`, `-host`, original `factopia-banner.jpg`). The banner CAN be uploaded via API (YOUTUBE_UPLOAD_CHANNEL_BANNER) — upload together with the rename.
- Owner is male; talks Hebrew; videos are in English.

## Videos
| Video | Status | Files |
|---|---|---|
| Vasa warship (old Edge voice) | uploaded by owner | `youtube/m-play-zone/production/vasa/` |
| Emu War (ElevenLabs Jon - Catalyst) | to schedule 20:00 | `youtube/history-oops/emu-war/` |
| What If Gravity Turned Off (Ethan) | to schedule next day 20:00 | `youtube/history-oops/gravity-off/` |
| How many times will you see them again (Ethan) | to schedule day after 20:00 | `youtube/history-oops/see-again/` |
Final MP4s were in the old session's scratchpad (not in git); re-render from sources if needed.

## How we make a video
- Skill: `.claude/skills/cartoon-audio-short/` (three.js cartoon engine, `render.mjs`, `mix.py`, `captions.py --style white`, `finish.sh`, `fitvoice.py`).
- Voice: ElevenLabs `Ethan – Energetic YouTube Narrator` (voice_id `uB5dGadiIOtRLnqbQl9M`, eleven_v4, tags [excited]/[playful]). Free tier is often busy — retry; elevenlabsusercontent.com is blocked locally, fetch via the Composio workbench.
- Word timings: segment the voice by pauses (`seg2words.py` in each video folder), captions big white.
- Loudness: -14 LUFS, true peak -1 dB.
- Never upload to YouTube without the owner's explicit OK (an API upload was removed by YouTube once; owner uploads by hand now).
- Don't copy other channels' content, characters, names or voices.
