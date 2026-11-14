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
| Emu War (ElevenLabs Jon - Catalyst) | uploaded by owner | `youtube/history-oops/emu-war/` |
| What If Gravity Turned Off (Ethan) | to schedule next day 20:00 | `youtube/history-oops/gravity-off/` |
| How many times will you see them again (Ethan) | to schedule day after 20:00 | `youtube/history-oops/see-again/` |
Final MP4s were in the old session's scratchpad (not in git); re-render from sources if needed.

## What the analytics say (Nov 2026)
- Upload order: Vasa first, then Emu. Vasa: ~70% average viewed but fewer views. Emu: ~51% average viewed but more views (catchier topic/title). "Stayed to watch" ~60-62% on both.
- Lesson: a catchy, absurd topic brings views (Emu); one clear tension line that builds to a single climax near the end (Vasa) keeps them watching. Aim for both in one video.
- Length rule (user): every video 45-60 s, never under 45 s.
- Rules for new videos: keep the middle (20-40 s) tight with a visual change or twist there; end on a loop back to the opening or a last punch; finish with one simple question to the viewer (e.g. "What's the biggest mistake in history?").

## Direction change (in planning, Nov 14 2026)
- User wants to move the channel (visual + niche + identity) to **horror + apocalypse stories in parts** (not only apocalypses - horror too).
- Chosen format: **"Day 1 / Day 2…" survival diary** with our host as the survivor; each part ends on a cliffhanger.
- Each part ends with a **choice for the audience** (open the door? run or stay? go with him or with her?) - the next part follows the majority in the comments. Choices vary; not only rule-breaking. (The user does not want to repeat the CELL-217 *story* itself.)
- Series parts: **~75 s each** (user). Plan 7-8 parts per series so the full compilation passes 8 min (mid-roll ads). After each series, upload the full compilation as a long video (first one: vertical centred with blurred sides; 16:9 re-render later if it does well).
- **Look (decided):** flat 2D vector style (dark purple palette, soft gradients, moonlight, vignette), rendered with the 2D canvas engine in `youtube/horror/flat2d/` (`anim.html` + `stick.js` `whiteStick`, `render2d.mjs`): ~12 s for 270 frames.
- **Main character (decided):** white stickman with dark outline and a **dark beanie** (option B). The old host (orange cap) is retired for this series. Props like the flashlight only when a scene needs them - not a fixed item.
- Captions: bold uppercase, one keyword in lime; chapter label top-left ("3:33 AM / NIGHT ONE").
- **Decided: full switch on the current channel** (no second channel). First series: "It Knows Her Voice" (power outage, knocks at 3:33, mom's voice at the door - open or not).
- **Narration voice:** a new horror voice (not Ethan). Samples in `youtube/horror/voices/`: Cedric M (BQOei2tk6QCBMHQWPhbj) done; Michael C. Vincent (n1PvBOwxb8X6m7tahp2h) done; Larry (5bh6Hc8SO3Yh1skN9Cqm) pending (free tier busy). User picks.
- Open decisions: keep or hide the existing fact videos; new channel name + banner + avatar (the Factopia rename reminder on Nov 23 should become a horror-name reminder).

## New videos: use the research + script skill
- `.claude/skills/factopia-research-script/SKILL.md`: landscape scan -> facts + audience -> 3-5 angles (user picks) -> script with the hard retention rules -> self-review + upload package. Then build with `cartoon-audio-short`.

## Rendering speed (new style)
- New style renders at 2x supersampling (2160x3840, downscaled with lanczos) + detail pass: ~8-14 s/frame on this CPU-only container.
- Always render in 2 processes: one forward (`RESUME=1 node render.mjs frames "a-b"`), one backward with a reversed comma list of the same frames. They meet in the middle; RESUME skips frames already done.
- Optional speed-up when time matters: 1.5x supersampling instead of 2x (about 2x faster, barely visible on a phone).

## Recurring host (in EVERY video)
- Our original host character: orange cap, round glasses, teal top (`romanFront(p, 'host', ...)`, outfit `host` in the engine).
- He appears in every video: at least one reaction shot in the middle and a close-up in the ending (grin + thumbs up, or the final punchline).
- In story videos he can be one of the people in the scene (e.g. the front-row student in the Einstein video).

## How we make a video
- Skill: `.claude/skills/cartoon-audio-short/` (three.js cartoon engine, `render.mjs`, `mix.py`, `captions.py --style white`, `finish.sh`, `fitvoice.py`).
- Voice: ElevenLabs `Ethan – Energetic YouTube Narrator` (voice_id `uB5dGadiIOtRLnqbQl9M`, eleven_v4, tags [excited]/[playful]). Free tier is often busy — retry; elevenlabsusercontent.com is blocked locally, fetch via the Composio workbench.
- Word timings: segment the voice by pauses (`seg2words.py` in each video folder), captions big white.
- Loudness: -14 LUFS, true peak -1 dB.
- Never upload to YouTube without the owner's explicit OK (an API upload was removed by YouTube once; owner uploads by hand now).
- Don't copy other channels' content, characters, names or voices.
